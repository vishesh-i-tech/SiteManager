// Client-side Web Crypto utilities for offline-first PBKDF2 hashing, constant-time verification,
// and AES-GCM backup encryption/decryption without external dependencies.

export const bytesToHex = (bytes: Uint8Array): string => {
  return Array.from(bytes)
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
};

export const hexToBytes = (hex: string): Uint8Array => {
  const cleanHex = hex.trim();
  const bytes = new Uint8Array(cleanHex.length / 2);
  for (let i = 0; i < cleanHex.length; i += 2) {
    bytes[i / 2] = parseInt(cleanHex.substring(i, i + 2), 16);
  }
  return bytes;
};

// Constant-time string comparison to mitigate timing attacks
export const constantTimeEqual = (a: string, b: string): boolean => {
  if (a.length !== b.length) {
    return false;
  }
  let diff = 0;
  for (let i = 0; i < a.length; i++) {
    diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  }
  return diff === 0;
};

// PBKDF2 with SHA-256 (100,000 iterations) with cryptographically random 16-byte salt
export const hashCredential = async (
  credential: string,
  iterations: number = 100000,
  saltBytes?: Uint8Array
): Promise<string> => {
  const salt = saltBytes || window.crypto.getRandomValues(new Uint8Array(16));
  const enc = new TextEncoder();
  const keyMaterial = await window.crypto.subtle.importKey(
    'raw',
    enc.encode(credential),
    { name: 'PBKDF2' },
    false,
    ['deriveBits', 'deriveKey']
  );

  const derivedBits = await window.crypto.subtle.deriveBits(
    {
      name: 'PBKDF2',
      salt: salt as unknown as BufferSource,
      iterations,
      hash: 'SHA-256',
    },
    keyMaterial,
    256
  );

  const hashHex = bytesToHex(new Uint8Array(derivedBits));
  const saltHex = bytesToHex(salt);
  return `pbkdf2:v1:${iterations}:${saltHex}:${hashHex}`;
};

export interface CredentialVerifyResult {
  isValid: boolean;
  isLegacy: boolean;
}

// Verifies input against stored credential. Supports both modern PBKDF2 and legacy plaintext for auto-migration.
export const verifyCredential = async (
  inputCredential: string,
  storedValue?: string
): Promise<CredentialVerifyResult> => {
  if (!storedValue) {
    return { isValid: false, isLegacy: false };
  }
  const trimmedInput = inputCredential.trim();

  // Modern PBKDF2 hash check
  if (storedValue.startsWith('pbkdf2:v1:')) {
    const parts = storedValue.split(':');
    if (parts.length !== 5) {
      return { isValid: false, isLegacy: false };
    }
    const iterations = parseInt(parts[2], 10);
    const salt = hexToBytes(parts[3]);
    const expectedHashHex = parts[4];
    if (isNaN(iterations) || iterations <= 0 || salt.length === 0) {
      return { isValid: false, isLegacy: false };
    }

    const computedHash = await hashCredential(trimmedInput, iterations, salt);
    const computedParts = computedHash.split(':');
    const computedHashHex = computedParts[4];
    const isValid = constantTimeEqual(expectedHashHex, computedHashHex);
    return { isValid, isLegacy: false };
  }

  // Backward-compatible legacy plaintext check with constant-time equality
  const isLegacyMatch = constantTimeEqual(storedValue.trim(), trimmedInput);
  return { isValid: isLegacyMatch, isLegacy: true };
};

// AES-GCM Encrypted Backup Payload format
export interface EncryptedBackupPayload {
  format: 'sitesaathi-encrypted-v1';
  exportedAt: string;
  app: string;
  salt: string;
  iv: string;
  ciphertext: string;
}

export const isEncryptedBackup = (parsedData: any): parsedData is EncryptedBackupPayload => {
  return (
    parsedData &&
    typeof parsedData === 'object' &&
    parsedData.format === 'sitesaathi-encrypted-v1' &&
    typeof parsedData.ciphertext === 'string' &&
    typeof parsedData.salt === 'string' &&
    typeof parsedData.iv === 'string'
  );
};

// Encrypt backup JSON using AES-GCM with PBKDF2 key derivation from user passphrase
export const encryptBackupJson = async (
  plainJson: string,
  passphrase: string
): Promise<string> => {
  if (!passphrase || passphrase.length < 4) {
    throw new Error('Backup encryption passphrase must be at least 4 characters');
  }
  const enc = new TextEncoder();
  const salt = window.crypto.getRandomValues(new Uint8Array(16));
  const iv = window.crypto.getRandomValues(new Uint8Array(12));

  const keyMaterial = await window.crypto.subtle.importKey(
    'raw',
    enc.encode(passphrase),
    { name: 'PBKDF2' },
    false,
    ['deriveKey']
  );

  const aesKey = await window.crypto.subtle.deriveKey(
    {
      name: 'PBKDF2',
      salt,
      iterations: 100000,
      hash: 'SHA-256',
    },
    keyMaterial,
    { name: 'AES-GCM', length: 256 },
    false,
    ['encrypt']
  );

  const encryptedBuffer = await window.crypto.subtle.encrypt(
    {
      name: 'AES-GCM',
      iv,
      tagLength: 128,
    },
    aesKey,
    enc.encode(plainJson)
  );

  const payload: EncryptedBackupPayload = {
    format: 'sitesaathi-encrypted-v1',
    exportedAt: new Date().toISOString(),
    app: 'SiteSaathi',
    salt: bytesToHex(salt),
    iv: bytesToHex(iv),
    ciphertext: bytesToHex(new Uint8Array(encryptedBuffer)),
  };

  return JSON.stringify(payload, null, 2);
};

// Decrypt backup payload using AES-GCM with passphrase
export const decryptBackupJson = async (
  encryptedJsonString: string,
  passphrase: string
): Promise<string> => {
  const payload = JSON.parse(encryptedJsonString);
  if (!isEncryptedBackup(payload)) {
    throw new Error('Not a valid SiteSaathi encrypted backup format');
  }
  const salt = hexToBytes(payload.salt);
  const iv = hexToBytes(payload.iv);
  const ciphertext = hexToBytes(payload.ciphertext);
  const enc = new TextEncoder();

  const keyMaterial = await window.crypto.subtle.importKey(
    'raw',
    enc.encode(passphrase),
    { name: 'PBKDF2' },
    false,
    ['deriveKey']
  );

  const aesKey = await window.crypto.subtle.deriveKey(
    {
      name: 'PBKDF2',
      salt: salt as unknown as BufferSource,
      iterations: 100000,
      hash: 'SHA-256',
    },
    keyMaterial,
    { name: 'AES-GCM', length: 256 },
    false,
    ['decrypt']
  );

  try {
    const decryptedBuffer = await window.crypto.subtle.decrypt(
      {
        name: 'AES-GCM',
        iv: iv as unknown as BufferSource,
        tagLength: 128,
      },
      aesKey,
      ciphertext as unknown as BufferSource
    );
    const dec = new TextDecoder();
    return dec.decode(decryptedBuffer);
  } catch {
    throw new Error('Incorrect passphrase or corrupted encrypted backup');
  }
};
