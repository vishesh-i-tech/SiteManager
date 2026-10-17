// Web/PWA Google Identity Services (GIS) Token Client Integration
// Strictly adheres to RFC 8252 (OAuth 2.0 for Native and Public Apps).
// Client secrets are NEVER used. Access tokens are stored ONLY in memory.
// Google account authorization is fully decoupled from SiteSaathi contractor login.

export interface GoogleTokenResponse {
  access_token: string;
  expires_in: number | string;
  scope: string;
  token_type: string;
  error?: string;
  error_description?: string;
  error_uri?: string;
}

export interface GoogleTokenClient {
  requestAccessToken: (overrideConfig?: { prompt?: string }) => void;
}

declare global {
  interface Window {
    google?: {
      accounts?: {
        oauth2?: {
          initTokenClient(config: {
            client_id: string;
            scope: string;
            callback: (response: GoogleTokenResponse) => void;
            error_callback?: (error: any) => void;
            prompt?: string;
          }): GoogleTokenClient;
          revoke(token: string, callback?: () => void): void;
        };
      };
    };
  }
}

// Scopes: strictly drive.file for app-created visible folder and backup files
export const GOOGLE_DRIVE_SCOPE = 'https://www.googleapis.com/auth/drive.file';

// Ephemeral in-memory token state — NEVER written to localStorage or IndexedDB
interface MemoryTokenState {
  accessToken: string;
  expiresAt: number; // Date.now() + (expiresIn * 1000)
}

let inMemoryToken: MemoryTokenState | null = null;
let gisScriptPromise: Promise<void> | null = null;
let activeAuthResolver: ((token: string) => void) | null = null;
let activeAuthRejecter: ((err: Error) => void) | null = null;
let tokenClient: GoogleTokenClient | null = null;

/**
 * Returns whether the Web Google Client ID is configured in the environment.
 */
export const isGoogleAuthConfigured = (): boolean => {
  const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;
  return typeof clientId === 'string' && clientId.trim().length > 0;
};

/**
 * Retrieves the configured Google Client ID or throws a descriptive configuration error.
 */
export const getGoogleClientId = (): string => {
  const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;
  if (!clientId || typeof clientId !== 'string' || clientId.trim().length === 0) {
    throw new Error(
      'GOOGLE_CLIENT_ID_NOT_CONFIGURED: VITE_GOOGLE_CLIENT_ID is not configured in environment variables. ' +
      'Please set VITE_GOOGLE_CLIENT_ID in .env.local to enable Google Drive backups.'
    );
  }
  return clientId.trim();
};

/**
 * Dynamically loads the official Google Identity Services script on demand.
 * If the user is offline or not using Google Drive, this is never called.
 */
export const loadGoogleIdentityServicesScript = (): Promise<void> => {
  if (typeof window === 'undefined') {
    return Promise.reject(new Error('Window environment is required for Google Identity Services.'));
  }

  if (window.google?.accounts?.oauth2) {
    return Promise.resolve();
  }

  if (gisScriptPromise) {
    return gisScriptPromise;
  }

  gisScriptPromise = new Promise((resolve, reject) => {
    const existingScript = document.getElementById('google-identity-services-script') as HTMLScriptElement | null;
    if (existingScript) {
      if (window.google?.accounts?.oauth2) {
        resolve();
        return;
      }
      existingScript.addEventListener('load', () => resolve());
      existingScript.addEventListener('error', () => {
        gisScriptPromise = null;
        reject(new Error('Failed to load Google Identity Services library.'));
      });
      return;
    }

    const script = document.createElement('script');
    script.id = 'google-identity-services-script';
    script.src = 'https://accounts.google.com/gsi/client';
    script.async = true;
    script.defer = true;
    script.onload = () => {
      if (window.google?.accounts?.oauth2) {
        resolve();
      } else {
        gisScriptPromise = null;
        reject(new Error('Google Identity Services loaded but oauth2 module was not found.'));
      }
    };
    script.onerror = () => {
      gisScriptPromise = null;
      reject(new Error('Network error: Unable to load Google Identity Services. Please check your internet connection.'));
    };
    document.head.appendChild(script);
  });

  return gisScriptPromise;
};

/**
 * Returns the currently active, unexpired in-memory access token, or null if none is valid.
 * Applies a 60-second safety margin to prevent mid-operation token expiration.
 */
export const getValidGoogleAccessToken = (): string | null => {
  if (!inMemoryToken) return null;
  const bufferMs = 60 * 1000;
  if (Date.now() >= inMemoryToken.expiresAt - bufferMs) {
    inMemoryToken = null;
    return null;
  }
  return inMemoryToken.accessToken;
};

/**
 * Requests an in-memory OAuth 2.0 access token via Google Identity Services Token Model.
 * If a valid, unexpired in-memory token is already available, returns it immediately.
 * 
 * @param options.forcePrompt If true, forces the consent/account selection prompt
 */
export const requestGoogleAccessToken = async (options?: { forcePrompt?: boolean }): Promise<string> => {
  const existingToken = getValidGoogleAccessToken();
  if (existingToken && !options?.forcePrompt) {
    return existingToken;
  }

  const clientId = getGoogleClientId();
  await loadGoogleIdentityServicesScript();

  if (!window.google?.accounts?.oauth2) {
    throw new Error('Google Identity Services is not available in the current environment.');
  }

  return new Promise((resolve, reject) => {
    // If an authentication request is already awaiting user interaction, cancel it
    if (activeAuthRejecter) {
      activeAuthRejecter(new Error('AUTH_CANCELLED: Superseded by new authorization request.'));
      activeAuthResolver = null;
      activeAuthRejecter = null;
    }

    activeAuthResolver = resolve;
    activeAuthRejecter = reject;

    try {
      const oauth2 = window.google?.accounts?.oauth2;
      if (!oauth2) {
        throw new Error('Google Identity Services oauth2 client is not available.');
      }

      if (!tokenClient || options?.forcePrompt) {
        tokenClient = oauth2.initTokenClient({
          client_id: clientId,
          scope: GOOGLE_DRIVE_SCOPE,
          callback: (response: GoogleTokenResponse) => {
            if (response.error) {
              const errCode = response.error;
              const errDesc = response.error_description || 'Unknown Google OAuth error';
              if (activeAuthRejecter) {
                activeAuthRejecter(new Error(`GOOGLE_AUTH_ERROR [${errCode}]: ${errDesc}`));
              }
              activeAuthResolver = null;
              activeAuthRejecter = null;
              return;
            }

            if (!response.access_token) {
              if (activeAuthRejecter) {
                activeAuthRejecter(new Error('GOOGLE_AUTH_ERROR: No access token received in OAuth response.'));
              }
              activeAuthResolver = null;
              activeAuthRejecter = null;
              return;
            }

            const expiresInSec = typeof response.expires_in === 'string'
              ? parseInt(response.expires_in, 10) || 3600
              : response.expires_in || 3600;

            inMemoryToken = {
              accessToken: response.access_token,
              expiresAt: Date.now() + (expiresInSec * 1000),
            };

            if (activeAuthResolver) {
              activeAuthResolver(response.access_token);
            }
            activeAuthResolver = null;
            activeAuthRejecter = null;
          },
          error_callback: (err: any) => {
            if (activeAuthRejecter) {
              activeAuthRejecter(new Error(err?.message || 'Google OAuth prompt error or user closed popup.'));
            }
            activeAuthResolver = null;
            activeAuthRejecter = null;
          },
          prompt: options?.forcePrompt ? 'consent' : undefined,
        });
      }

      tokenClient.requestAccessToken({
        prompt: options?.forcePrompt ? 'consent' : undefined,
      });
    } catch (err: any) {
      activeAuthResolver = null;
      activeAuthRejecter = null;
      reject(new Error(`GOOGLE_AUTH_INIT_FAILED: ${err?.message || 'Failed to initialize Google token client.'}`));
    }
  });
};

/**
 * Immediately clears any in-memory Google access token.
 * Should be called upon contractor logout or application teardown.
 */
export const clearGoogleAuthSession = (): void => {
  inMemoryToken = null;
};

/**
 * Revokes the current in-memory access token with Google's OAuth 2.0 servers
 * and wipes all in-memory token state.
 */
export const revokeGoogleAccessToken = async (): Promise<void> => {
  const token = inMemoryToken?.accessToken;
  inMemoryToken = null;

  if (!token) return;

  if (window.google?.accounts?.oauth2?.revoke) {
    await new Promise<void>((resolve) => {
      try {
        window.google!.accounts!.oauth2!.revoke(token, () => resolve());
      } catch {
        resolve();
      }
    });
  }
};
