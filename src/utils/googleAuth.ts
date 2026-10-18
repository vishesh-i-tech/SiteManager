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

// Scopes: drive.file for app-created visible folder/backups, userinfo.email for identity verification
export const GOOGLE_DRIVE_SCOPE = 'https://www.googleapis.com/auth/drive.file';
export const GOOGLE_USERINFO_SCOPE = 'https://www.googleapis.com/auth/userinfo.email';
export const GOOGLE_AUTH_SCOPES = `${GOOGLE_DRIVE_SCOPE} ${GOOGLE_USERINFO_SCOPE}`;

export interface GoogleAccountIdentity {
  email: string;
  name?: string;
  picture?: string;
}

// Ephemeral in-memory token and identity state — NEVER written to localStorage or IndexedDB
interface MemoryTokenState {
  contractorId: string;
  accessToken: string;
  expiresAt: number; // Date.now() + (expiresIn * 1000)
  identity?: GoogleAccountIdentity;
}

// Per-contractor in-memory token map ensuring complete contractor isolation
const contractorTokenMap = new Map<string, MemoryTokenState>();

let gisScriptPromise: Promise<void> | null = null;
let activeAuthResolver: ((token: string) => void) | null = null;
let activeAuthRejecter: ((err: Error) => void) | null = null;
let tokenClient: GoogleTokenClient | null = null;

const resolveContractorKey = (explicitContractorId?: string): string => {
  if (explicitContractorId && explicitContractorId.trim()) {
    return explicitContractorId.trim();
  }
  if (typeof localStorage !== 'undefined') {
    const saved = localStorage.getItem('sitesaathi_active_user_id');
    if (saved && saved.trim()) return saved.trim();
  }
  return 'default';
};

/**
 * Returns whether the app is currently running in a native Capacitor Android container.
 */
export const isNativeAndroidPlatform = (): boolean => {
  if (typeof window === 'undefined') return false;
  return Boolean((window as any).Capacitor?.isNativePlatform?.() && (window as any).Capacitor?.getPlatform?.() === 'android');
};

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
 * Queries Google's supported userinfo / tokeninfo identity endpoints
 * to verify and extract the authenticated Google account email.
 */
export const fetchGoogleAccountIdentity = async (accessToken: string): Promise<GoogleAccountIdentity> => {
  try {
    const resp = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
      headers: { Authorization: `Bearer ${accessToken}` },
    });
    if (resp.ok) {
      const data = await resp.json();
      if (data.email) {
        return {
          email: data.email,
          name: data.name,
          picture: data.picture,
        };
      }
    }
  } catch (err) {
    console.warn('Google userinfo endpoint fetch failed, attempting tokeninfo fallback:', err);
  }

  try {
    const tokenInfoResp = await fetch(
      `https://www.googleapis.com/oauth2/v3/tokeninfo?access_token=${encodeURIComponent(accessToken)}`
    );
    if (tokenInfoResp.ok) {
      const data = await tokenInfoResp.json();
      if (data.email) {
        return { email: data.email };
      }
    }
  } catch (err) {
    console.warn('Google tokeninfo fallback failed:', err);
  }

  throw new Error('IDENTITY_FETCH_FAILED: Unable to verify Google account identity.');
};

/**
 * Returns the currently active, unexpired in-memory access token for the given contractor,
 * or null if none is valid. Applies a 60-second safety margin.
 */
export const getValidGoogleAccessToken = (contractorId?: string): string | null => {
  const key = resolveContractorKey(contractorId);
  const entry = contractorTokenMap.get(key);
  if (!entry) return null;

  const bufferMs = 60 * 1000;
  if (Date.now() >= entry.expiresAt - bufferMs) {
    contractorTokenMap.delete(key);
    return null;
  }
  return entry.accessToken;
};

/**
 * Returns the verified Google identity associated with the in-memory session for this contractor.
 */
export const getGoogleAccountIdentity = (contractorId?: string): GoogleAccountIdentity | null => {
  const key = resolveContractorKey(contractorId);
  const entry = contractorTokenMap.get(key);
  if (!entry) return null;

  const bufferMs = 60 * 1000;
  if (Date.now() >= entry.expiresAt - bufferMs) {
    contractorTokenMap.delete(key);
    return null;
  }
  return entry.identity || null;
};

/**
 * Sets synthetic mock Google credentials for testing and automated evaluation.
 */
export const setMockGoogleAuth = (
  contractorId: string,
  accessToken: string,
  identity: GoogleAccountIdentity,
  expiresInSec = 3600
): void => {
  contractorTokenMap.set(contractorId, {
    contractorId,
    accessToken,
    expiresAt: Date.now() + expiresInSec * 1000,
    identity,
  });
};

export interface RequestGoogleAccessTokenOptions {
  forcePrompt?: boolean;
  prompt?: 'consent' | 'select_account';
  contractorId?: string;
}

/**
 * Requests an in-memory OAuth 2.0 access token via Google Identity Services Token Model.
 * Caches the token and verified Google identity scoped to the specified contractor.
 */
export const requestGoogleAccessToken = async (
  options?: RequestGoogleAccessTokenOptions
): Promise<string> => {
  const contractorKey = resolveContractorKey(options?.contractorId);

  const existingToken = getValidGoogleAccessToken(contractorKey);
  if (existingToken && !options?.forcePrompt && !options?.prompt) {
    return existingToken;
  }

  const clientId = getGoogleClientId();
  await loadGoogleIdentityServicesScript();

  if (!window.google?.accounts?.oauth2) {
    throw new Error('Google Identity Services is not available in the current environment.');
  }

  return new Promise((resolve, reject) => {
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

      const promptParam = options?.prompt || (options?.forcePrompt ? 'consent' : undefined);

      if (!tokenClient || options?.forcePrompt || options?.prompt) {
        tokenClient = oauth2.initTokenClient({
          client_id: clientId,
          scope: GOOGLE_AUTH_SCOPES,
          callback: async (response: GoogleTokenResponse) => {
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

            const expiresInSec =
              typeof response.expires_in === 'string'
                ? parseInt(response.expires_in, 10) || 3600
                : response.expires_in || 3600;

            let identity: GoogleAccountIdentity | undefined;
            try {
              identity = await fetchGoogleAccountIdentity(response.access_token);
            } catch (idErr) {
              console.warn('Failed to fetch verified identity on token receipt:', idErr);
            }

            contractorTokenMap.set(contractorKey, {
              contractorId: contractorKey,
              accessToken: response.access_token,
              expiresAt: Date.now() + expiresInSec * 1000,
              identity,
            });

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
          prompt: promptParam,
        });
      }

      tokenClient.requestAccessToken({
        prompt: promptParam,
      });
    } catch (err: any) {
      activeAuthResolver = null;
      activeAuthRejecter = null;
      reject(new Error(`GOOGLE_AUTH_INIT_FAILED: ${err?.message || 'Failed to initialize Google token client.'}`));
    }
  });
};

/**
 * Immediately clears in-memory Google access token and identity.
 * If contractorId is specified, clears only that contractor's session.
 * Otherwise, clears all in-memory contractor tokens.
 */
export const clearGoogleAuthSession = (contractorId?: string): void => {
  if (contractorId) {
    contractorTokenMap.delete(contractorId);
  } else {
    contractorTokenMap.clear();
  }
};

/**
 * Revokes the in-memory access token with Google's OAuth 2.0 servers
 * and wipes all in-memory token state for the specified contractor.
 */
export const revokeGoogleAccessToken = async (contractorId?: string): Promise<void> => {
  const key = resolveContractorKey(contractorId);
  const entry = contractorTokenMap.get(key);
  contractorTokenMap.delete(key);

  const token = entry?.accessToken;
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
