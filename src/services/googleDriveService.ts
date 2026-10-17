// SiteSaathi Google Drive REST Service (Drive API v3)
// -------------------------------------------------------------
// Pure TypeScript client-side implementation using standard fetch().
// Zero external SDK dependencies. Uses strict `drive.file` scope only.
// Only app-created encrypted backups within "SiteSaathi Backups" are handled.
// Plaintext database exports are strictly rejected before upload.

import { isEncryptedBackup, EncryptedBackupPayload } from '../utils/cryptoUtils';

export interface DriveBackupFile {
  id: string;
  name: string;
  size?: number;
  createdTime: string;
  modifiedTime?: string;
  appProperties?: {
    app?: string;
    format?: string;
    exportedAt?: string;
    [key: string]: string | undefined;
  };
}

export type DriveApiErrorCode =
  | 'TOKEN_EXPIRED'
  | 'PERMISSION_DENIED'
  | 'RATE_LIMIT'
  | 'NOT_FOUND'
  | 'NETWORK_ERROR'
  | 'INVALID_RESPONSE'
  | 'SECURITY_VIOLATION'
  | 'FOLDER_CREATION_FAILED'
  | 'UNKNOWN';

export class GoogleDriveApiError extends Error {
  public code: DriveApiErrorCode;
  public statusCode?: number;
  public details?: any;

  constructor(message: string, code: DriveApiErrorCode, statusCode?: number, details?: any) {
    super(message);
    this.name = 'GoogleDriveApiError';
    this.code = code;
    this.statusCode = statusCode;
    this.details = details;
  }
}

const DRIVE_API_BASE = 'https://www.googleapis.com/drive/v3';
const DRIVE_UPLOAD_BASE = 'https://www.googleapis.com/upload/drive/v3';
export const SITESATTHI_BACKUP_FOLDER_NAME = 'SiteSaathi Backups';

/**
 * Validates that an unparsed or stringified backup payload is a genuine
 * SiteSaathi AES-GCM encrypted envelope. Rejects plaintext database exports.
 */
export const validateEncryptedBackupPayload = (payloadString: string): EncryptedBackupPayload => {
  if (!payloadString || typeof payloadString !== 'string' || payloadString.trim().length === 0) {
    throw new GoogleDriveApiError(
      'SECURITY_VIOLATION: Empty backup payload provided for Google Drive operation.',
      'SECURITY_VIOLATION'
    );
  }

  let parsed: any;
  try {
    parsed = JSON.parse(payloadString);
  } catch {
    throw new GoogleDriveApiError(
      'SECURITY_VIOLATION: Payload is not valid JSON.',
      'SECURITY_VIOLATION'
    );
  }

  // Security Check: If unencrypted database tables are detected in root, REJECT
  if (parsed && typeof parsed === 'object' && (Array.isArray(parsed.sites) || Array.isArray(parsed.account))) {
    throw new GoogleDriveApiError(
      'SECURITY_VIOLATION: Plaintext database exports cannot be uploaded to Google Drive. ' +
      'SiteSaathi requires AES-GCM encryption with a user-supplied passphrase before cloud upload.',
      'SECURITY_VIOLATION'
    );
  }

  if (!isEncryptedBackup(parsed)) {
    throw new GoogleDriveApiError(
      'SECURITY_VIOLATION: Payload does not conform to the SiteSaathi encrypted envelope format (sitesaathi-encrypted-v1).',
      'SECURITY_VIOLATION'
    );
  }

  return parsed;
};

/**
 * Maps standard HTTP error responses to typed GoogleDriveApiError instances.
 */
const handleDriveResponseError = async (response: Response, actionContext: string): Promise<never> => {
  let errBody: any = null;
  try {
    errBody = await response.json();
  } catch {
    // Non-JSON response body
  }

  const status = response.status;
  const message = errBody?.error?.message || response.statusText || 'Drive API request failed';

  if (status === 401) {
    throw new GoogleDriveApiError(
      `Google Drive authorization expired or revoked while attempting to ${actionContext}. Please reconnect.`,
      'TOKEN_EXPIRED',
      401,
      errBody
    );
  }

  if (status === 403) {
    const reason = errBody?.error?.errors?.[0]?.reason;
    if (reason === 'rateLimitExceeded' || reason === 'userRateLimitExceeded') {
      throw new GoogleDriveApiError(
        'Google Drive request rate limit exceeded. Please wait a moment and try again.',
        'RATE_LIMIT',
        403,
        errBody
      );
    }
    throw new GoogleDriveApiError(
      `Google Drive permission denied while attempting to ${actionContext}. Verify drive.file permissions.`,
      'PERMISSION_DENIED',
      403,
      errBody
    );
  }

  if (status === 404) {
    throw new GoogleDriveApiError(
      `Requested Google Drive item was not found while attempting to ${actionContext}.`,
      'NOT_FOUND',
      404,
      errBody
    );
  }

  throw new GoogleDriveApiError(
    `Google Drive request failed (${status}) during ${actionContext}: ${message}`,
    'UNKNOWN',
    status,
    errBody
  );
};

/**
 * Executes a fetch request with standardized network error catching.
 */
const safeDriveFetch = async (url: string, init: RequestInit, actionContext: string): Promise<Response> => {
  try {
    const res = await fetch(url, init);
    if (!res.ok) {
      await handleDriveResponseError(res, actionContext);
    }
    return res;
  } catch (err: any) {
    if (err instanceof GoogleDriveApiError) {
      throw err;
    }
    throw new GoogleDriveApiError(
      `Network failure while connecting to Google Drive (${actionContext}). Check internet connectivity.`,
      'NETWORK_ERROR',
      undefined,
      err
    );
  }
};

/**
 * Finds the visible 'SiteSaathi Backups' folder in the user's Drive.
 * If not found, creates it and returns the new folder ID.
 */
export const findOrCreateBackupFolder = async (accessToken: string): Promise<string> => {
  if (!accessToken) {
    throw new GoogleDriveApiError('Access token is required to access Google Drive.', 'TOKEN_EXPIRED');
  }

  const query = `name = '${SITESATTHI_BACKUP_FOLDER_NAME}' and mimeType = 'application/vnd.google-apps.folder' and trashed = false`;
  const searchUrl = `${DRIVE_API_BASE}/files?q=${encodeURIComponent(query)}&fields=files(id,name,trashed)&spaces=drive`;

  const searchRes = await safeDriveFetch(
    searchUrl,
    {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        Accept: 'application/json',
      },
    },
    'find backup folder'
  );

  const searchData = await searchRes.json();
  if (Array.isArray(searchData?.files) && searchData.files.length > 0) {
    return searchData.files[0].id;
  }

  // Folder does not exist: create it
  const createFolderRes = await safeDriveFetch(
    `${DRIVE_API_BASE}/files`,
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      body: JSON.stringify({
        name: SITESATTHI_BACKUP_FOLDER_NAME,
        mimeType: 'application/vnd.google-apps.folder',
        description: 'SiteSaathi encrypted offline-first backups',
      }),
    },
    'create backup folder'
  );

  const createData = await createFolderRes.json();
  if (!createData?.id) {
    throw new GoogleDriveApiError('Failed to retrieve ID for created backup folder.', 'FOLDER_CREATION_FAILED');
  }

  return createData.id;
};

/**
 * Uploads an encrypted backup string into the 'SiteSaathi Backups' folder.
 * Uses Drive API v3 multipart upload with boundary separation.
 * Validates the payload strictly before making any network request.
 */
export const uploadEncryptedBackupToDrive = async (
  accessToken: string,
  encryptedJsonString: string
): Promise<DriveBackupFile> => {
  if (!accessToken) {
    throw new GoogleDriveApiError('Access token is required to upload to Google Drive.', 'TOKEN_EXPIRED');
  }

  // Security Gate: Validate envelope and confirm no plaintext database tables exist
  const parsedEnvelope = validateEncryptedBackupPayload(encryptedJsonString);

  // Locate or create the visible SiteSaathi Backups folder
  const folderId = await findOrCreateBackupFolder(accessToken);

  const now = new Date();
  const dateStr = now.toISOString().split('T')[0];
  const timeStr = now.toTimeString().split(' ')[0].replace(/:/g, '');
  const fileName = `SiteSaathi_EncryptedBackup_${dateStr}_${timeStr}.json`;

  const metadata = {
    name: fileName,
    parents: [folderId],
    mimeType: 'application/json',
    description: 'Encrypted SiteSaathi Backup (AES-GCM)',
    appProperties: {
      app: 'SiteSaathi',
      format: 'sitesaathi-encrypted-v1',
      exportedAt: parsedEnvelope.exportedAt || now.toISOString(),
    },
  };

  const boundary = `boundary_sitesaathi_${Date.now()}`;
  const delimiter = `\r\n--${boundary}\r\n`;
  const closeDelimiter = `\r\n--${boundary}--`;

  const multipartRequestBody =
    delimiter +
    'Content-Type: application/json; charset=UTF-8\r\n\r\n' +
    JSON.stringify(metadata) +
    delimiter +
    'Content-Type: application/json\r\n\r\n' +
    encryptedJsonString +
    closeDelimiter;

  const uploadUrl = `${DRIVE_UPLOAD_BASE}/files?uploadType=multipart&fields=id,name,size,createdTime,modifiedTime,appProperties`;

  const uploadRes = await safeDriveFetch(
    uploadUrl,
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': `multipart/related; boundary=${boundary}`,
        Accept: 'application/json',
      },
      body: multipartRequestBody,
    },
    'upload encrypted backup'
  );

  const fileData = await uploadRes.json();
  return {
    id: fileData.id,
    name: fileData.name,
    size: fileData.size ? parseInt(fileData.size, 10) : undefined,
    createdTime: fileData.createdTime || now.toISOString(),
    modifiedTime: fileData.modifiedTime,
    appProperties: fileData.appProperties,
  };
};

/**
 * Lists all app-created backup files from the 'SiteSaathi Backups' folder.
 * Orders results chronologically by newest first.
 */
export const listEncryptedBackupsFromDrive = async (accessToken: string): Promise<DriveBackupFile[]> => {
  if (!accessToken) {
    throw new GoogleDriveApiError('Access token is required to list Google Drive backups.', 'TOKEN_EXPIRED');
  }

  // Search query: files inside the folder, not trashed, not a subfolder
  const folderId = await findOrCreateBackupFolder(accessToken);
  const query = `'${folderId}' in parents and trashed = false and mimeType != 'application/vnd.google-apps.folder'`;
  const listUrl = `${DRIVE_API_BASE}/files?q=${encodeURIComponent(query)}&orderBy=createdTime desc&fields=files(id,name,size,createdTime,modifiedTime,appProperties,description)&spaces=drive`;

  const listRes = await safeDriveFetch(
    listUrl,
    {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        Accept: 'application/json',
      },
    },
    'list backup files'
  );

  const listData = await listRes.json();
  if (!Array.isArray(listData?.files)) {
    return [];
  }

  return listData.files.map((f: any) => ({
    id: f.id,
    name: f.name,
    size: f.size ? parseInt(f.size, 10) : undefined,
    createdTime: f.createdTime,
    modifiedTime: f.modifiedTime,
    appProperties: f.appProperties,
  }));
};

/**
 * Downloads a selected encrypted backup file from Google Drive as raw text.
 * Strictly verifies that downloaded content is a valid SiteSaathi encrypted envelope
 * before returning it.
 */
export const downloadEncryptedBackupFromDrive = async (
  accessToken: string,
  fileId: string
): Promise<string> => {
  if (!accessToken) {
    throw new GoogleDriveApiError('Access token is required to download from Google Drive.', 'TOKEN_EXPIRED');
  }
  if (!fileId || typeof fileId !== 'string' || fileId.trim().length === 0) {
    throw new GoogleDriveApiError('Valid File ID is required to download from Google Drive.', 'NOT_FOUND');
  }

  const downloadUrl = `${DRIVE_API_BASE}/files/${encodeURIComponent(fileId)}?alt=media`;

  const downloadRes = await safeDriveFetch(
    downloadUrl,
    {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    },
    'download backup file'
  );

  const contentText = await downloadRes.text();

  // Security Gate: Treat downloaded content as untrusted; validate envelope format
  validateEncryptedBackupPayload(contentText);

  return contentText;
};

/**
 * Deletes an app-created backup file from Google Drive.
 */
export const deleteDriveBackupFile = async (accessToken: string, fileId: string): Promise<void> => {
  if (!accessToken) {
    throw new GoogleDriveApiError('Access token is required to delete Google Drive backup.', 'TOKEN_EXPIRED');
  }
  if (!fileId || typeof fileId !== 'string' || fileId.trim().length === 0) {
    throw new GoogleDriveApiError('Valid File ID is required to delete from Google Drive.', 'NOT_FOUND');
  }

  const deleteUrl = `${DRIVE_API_BASE}/files/${encodeURIComponent(fileId)}`;

  await safeDriveFetch(
    deleteUrl,
    {
      method: 'DELETE',
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    },
    'delete backup file'
  );
};
