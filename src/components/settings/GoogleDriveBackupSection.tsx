import React, { useState } from 'react';
import { useTheme } from '../../core/theme/ThemeContext';
import { ContractorAccount } from '../../types';
import { db } from '../../core/db/database';
import {
  isGoogleAuthConfigured,
  getValidGoogleAccessToken,
  requestGoogleAccessToken,
  revokeGoogleAccessToken,
} from '../../utils/googleAuth';
import {
  uploadEncryptedBackupToDrive,
  listEncryptedBackupsFromDrive,
  downloadEncryptedBackupFromDrive,
  validateEncryptedBackupPayload,
  DriveBackupFile,
  GoogleDriveApiError,
} from '../../services/googleDriveService';
import { decryptBackupJson } from '../../utils/cryptoUtils';
import {
  Cloud,
  CloudOff,
  CloudUpload,
  CloudDownload,
  CheckCircle2,
  AlertCircle,
  X,
  Lock,
  ShieldCheck,
  RefreshCw,
  Loader2,
  Calendar,
  Database,
} from 'lucide-react';

interface GoogleDriveBackupSectionProps {
  account: ContractorAccount | null | undefined;
  onRestoreSuccess?: () => void;
}

export const GoogleDriveBackupSection: React.FC<GoogleDriveBackupSectionProps> = ({
  account,
  onRestoreSuccess,
}) => {
  const { language, t } = useTheme();

  // Connection & Auth State (In-Memory Only)
  const [isConnected, setIsConnected] = useState<boolean>(() => !!getValidGoogleAccessToken());
  const [isConnecting, setIsConnecting] = useState<boolean>(false);
  const [isConfigured] = useState<boolean>(() => isGoogleAuthConfigured());
  const [statusFeedback, setStatusFeedback] = useState<{
    text: string;
    type: 'success' | 'error' | 'info';
  } | null>(null);

  // Last Successful Backup Indicator
  const [lastBackupTime, setLastBackupTime] = useState<string | null>(() => {
    const key = `sitesaathi_last_drive_backup_${account?.id || 'default'}`;
    return localStorage.getItem(key);
  });

  // Manual Backup Modal State
  const [isPassphraseModalOpen, setIsPassphraseModalOpen] = useState(false);
  const [backupPassphrase, setBackupPassphrase] = useState('');
  const [confirmBackupPassphrase, setConfirmBackupPassphrase] = useState('');
  const [passphraseError, setPassphraseError] = useState('');
  const [isBackingUp, setIsBackingUp] = useState(false);

  // Cloud Backups List & Restore State
  const [isBackupsModalOpen, setIsBackupsModalOpen] = useState(false);
  const [backupsList, setBackupsList] = useState<DriveBackupFile[]>([]);
  const [isLoadingBackups, setIsLoadingBackups] = useState(false);
  const [listError, setListError] = useState('');
  const [downloadingFileId, setDownloadingFileId] = useState<string | null>(null);

  // In-Memory Restore Verification & Confirmation State
  const [selectedBackup, setSelectedBackup] = useState<DriveBackupFile | null>(null);
  const [pendingEncryptedContent, setPendingEncryptedContent] = useState<string | null>(null);
  const [isCloudDecryptModalOpen, setIsCloudDecryptModalOpen] = useState(false);
  const [decryptPassphrase, setDecryptPassphrase] = useState('');
  const [decryptError, setDecryptError] = useState('');
  const [isConfirmRestoreOpen, setIsConfirmRestoreOpen] = useState(false);
  const [pendingCleanContent, setPendingCleanContent] = useState<string | null>(null);
  const [pendingRestoreMeta, setPendingRestoreMeta] = useState<{
    sitesCount: number;
    toolsCount: number;
    duesCount: number;
    exportedAt?: string;
  } | null>(null);
  const [isRestoring, setIsRestoring] = useState(false);

  const showStatus = (text: string, type: 'success' | 'error' | 'info' = 'info', durationMs = 4500) => {
    setStatusFeedback({ text, type });
    if (durationMs > 0) {
      setTimeout(() => {
        setStatusFeedback((prev) => (prev?.text === text ? null : prev));
      }, durationMs);
    }
  };

  /**
   * Connect to Google Drive via Web GIS Token Client.
   * Access tokens remain in memory only.
   */
  const handleConnect = async () => {
    if (!isConfigured) {
      showStatus(
        language === 'hi'
          ? 'गूगल क्लाइंट आईडी कॉन्फ़िगर नहीं है (.env.local में VITE_GOOGLE_CLIENT_ID सेट करें)'
          : 'Google Client ID not configured. Please set VITE_GOOGLE_CLIENT_ID in .env.local',
        'error',
        6000
      );
      return;
    }

    if (!navigator.onLine) {
      showStatus(
        language === 'hi'
          ? 'नेटवर्क त्रुटि: आप ऑफलाइन हैं। कृपया इंटरनेट चालू करें।'
          : 'Network error: You are currently offline. Please check your internet connection.',
        'error'
      );
      return;
    }

    setIsConnecting(true);
    setStatusFeedback(null);

    try {
      await requestGoogleAccessToken({ forcePrompt: true });
      setIsConnected(true);
      showStatus(
        language === 'hi'
          ? '✓ गूगल ड्राइव सफलतापूर्वक कनेक्ट हो गया!'
          : '✓ Google Drive connected successfully! (Ephemeral in-memory session active)',
        'success'
      );
    } catch (err: any) {
      console.warn('Google Drive auth failed:', err);
      setIsConnected(false);
      const isCancelled =
        err?.message?.includes('cancelled') ||
        err?.message?.includes('popup') ||
        err?.message?.includes('closed');
      showStatus(
        isCancelled
          ? language === 'hi'
            ? 'गूगल प्रमाणीकरण विंडो बंद कर दी गई।'
            : 'Google authorization prompt was cancelled or closed.'
          : err?.message || 'Google Drive authorization failed.',
        isCancelled ? 'info' : 'error'
      );
    } finally {
      setIsConnecting(false);
    }
  };

  /**
   * Disconnect Google Drive. Revokes token with Google and clears in-memory state.
   * Does NOT touch local database records or cloud files.
   */
  const handleDisconnect = async () => {
    try {
      await revokeGoogleAccessToken();
    } catch (err) {
      console.warn('Revoke error (non-fatal):', err);
    }
    setIsConnected(false);
    setBackupsList([]);
    showStatus(
      language === 'hi'
        ? 'गूगल ड्राइव डिस्कनेक्ट हो गया। इन-मेमोरी टोकन हटा दिया गया।'
        : 'Google Drive disconnected. In-memory access token cleared.',
      'info'
    );
  };

  /**
   * Start manual encrypted backup flow.
   */
  const handleOpenBackupModal = async () => {
    if (!isConfigured) {
      showStatus(
        language === 'hi'
          ? 'गूगल क्लाइंट आईडी (.env.local में VITE_GOOGLE_CLIENT_ID) सेट होना आवश्यक है'
          : 'Google Client ID must be configured in .env.local to upload backups',
        'error'
      );
      return;
    }

    // Ensure active token before opening modal
    if (!isConnected) {
      try {
        await handleConnect();
      } catch {
        return;
      }
    }

    setBackupPassphrase('');
    setConfirmBackupPassphrase('');
    setPassphraseError('');
    setIsPassphraseModalOpen(true);
  };

  /**
   * Execute AES-GCM Encrypted Backup & upload to Google Drive.
   * Plaintext exports are strictly rejected.
   */
  const handleExecuteUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    setPassphraseError('');

    const cleanPass = backupPassphrase.trim();
    if (cleanPass.length < 4) {
      setPassphraseError(
        language === 'hi'
          ? 'पासवर्ड कम से कम 4 अक्षरों का होना चाहिए'
          : 'Passphrase must be at least 4 characters long'
      );
      return;
    }

    if (cleanPass !== confirmBackupPassphrase.trim()) {
      setPassphraseError(
        language === 'hi'
          ? 'दोनों पासवर्ड मेल नहीं खा रहे हैं। कृपया पुनः जांचें।'
          : 'Passphrases do not match. Please re-enter.'
      );
      return;
    }

    if (!navigator.onLine) {
      setPassphraseError(
        language === 'hi'
          ? 'नेटवर्क अनुपलब्ध: बैकअप अपलोड करने के लिए इंटरनेट आवश्यक है'
          : 'Network offline: An active internet connection is required to upload backups'
      );
      return;
    }

    setIsBackingUp(true);

    try {
      // 1. Export database encrypted with AES-GCM-256 via Web Crypto
      const encryptedJson = await db.exportBackupJson(cleanPass);

      // 2. Security Gate: Validate envelope structure strictly before touching network
      validateEncryptedBackupPayload(encryptedJson);

      // 3. Obtain or verify valid in-memory token
      let token = getValidGoogleAccessToken();
      if (!token) {
        token = await requestGoogleAccessToken();
        setIsConnected(true);
      }

      // 4. Upload multipart payload to 'SiteSaathi Backups' folder
      const uploadedFile = await uploadEncryptedBackupToDrive(token, encryptedJson);

      // 5. Update last successful backup indicator ONLY after confirmed upload success
      const nowIso = new Date().toISOString();
      const storageKey = `sitesaathi_last_drive_backup_${account?.id || 'default'}`;
      localStorage.setItem(storageKey, nowIso);
      setLastBackupTime(nowIso);

      // Reset modal and feedback
      setIsPassphraseModalOpen(false);
      setBackupPassphrase('');
      setConfirmBackupPassphrase('');
      showStatus(
        language === 'hi'
          ? `✓ एन्क्रिप्टेड बैकअप सुरक्षित अपलोड हो गया! (${uploadedFile.name})`
          : `✓ Encrypted backup uploaded to Google Drive folder 'SiteSaathi Backups'!`,
        'success',
        6000
      );

      // If backups list is already open, update it
      if (isBackupsModalOpen) {
        setBackupsList((prev) => [uploadedFile, ...prev]);
      }
    } catch (err: any) {
      console.error('Drive backup upload failed:', err);
      if (err instanceof GoogleDriveApiError && err.code === 'TOKEN_EXPIRED') {
        setIsConnected(false);
        setPassphraseError(
          language === 'hi'
            ? 'गूगल ड्राइव सत्र समाप्त हो गया। कृपया पुनः कनेक्ट करें।'
            : 'Google Drive authorization expired. Please reconnect and retry.'
        );
      } else {
        setPassphraseError(err?.message || 'Failed to upload encrypted backup to Google Drive.');
      }
    } finally {
      setIsBackingUp(false);
    }
  };

  /**
   * Fetch and display the list of app-created backups from Google Drive.
   */
  const handleOpenBackupsList = async () => {
    if (!isConfigured) {
      showStatus(
        language === 'hi'
          ? 'गूगल क्लाइंट आईडी (.env.local) सेट होना आवश्यक है'
          : 'Google Client ID must be configured in .env.local',
        'error'
      );
      return;
    }

    setIsBackupsModalOpen(true);
    await fetchBackups();
  };

  const fetchBackups = async () => {
    if (!navigator.onLine) {
      setListError(
        language === 'hi'
          ? 'नेटवर्क अनुपलब्ध: बैकअप देखने के लिए इंटरनेट चालू करें'
          : 'Network offline: Connect to the internet to list cloud backups'
      );
      return;
    }

    setIsLoadingBackups(true);
    setListError('');

    try {
      let token = getValidGoogleAccessToken();
      if (!token) {
        token = await requestGoogleAccessToken();
        setIsConnected(true);
      }

      const files = await listEncryptedBackupsFromDrive(token);
      setBackupsList(files);
    } catch (err: any) {
      console.error('Failed to list backups:', err);
      if (err instanceof GoogleDriveApiError && err.code === 'TOKEN_EXPIRED') {
        setIsConnected(false);
        setListError(
          language === 'hi'
            ? 'गूगल ड्राइव सत्र समाप्त हो गया। कृपया फिर से कनेक्ट करें।'
            : 'Google Drive session expired. Please reconnect.'
        );
      } else {
        setListError(err?.message || 'Failed to load backups from Google Drive.');
      }
    } finally {
      setIsLoadingBackups(false);
    }
  };

  /**
   * Download and validate a selected backup from Google Drive.
   * Envelope must be strictly validated before asking for passphrase.
   * Zero database writes occur here.
   */
  const handleSelectBackupForRestore = async (file: DriveBackupFile) => {
    setDownloadingFileId(file.id);
    setSelectedBackup(file);
    setListError('');

    try {
      let token = getValidGoogleAccessToken();
      if (!token) {
        token = await requestGoogleAccessToken();
        setIsConnected(true);
      }

      // Download raw text content
      const contentText = await downloadEncryptedBackupFromDrive(token, file.id);

      // Validate envelope structure strictly
      validateEncryptedBackupPayload(contentText);

      // Keep encrypted payload in memory and prompt for decryption passphrase
      setPendingEncryptedContent(contentText);
      setDecryptPassphrase('');
      setDecryptError('');
      setIsCloudDecryptModalOpen(true);
    } catch (err: any) {
      console.error('Download backup failed:', err);
      if (err instanceof GoogleDriveApiError && err.code === 'TOKEN_EXPIRED') {
        setIsConnected(false);
        setListError(
          language === 'hi'
            ? 'गूगल ड्राइव सत्र समाप्त हो गया। कृपया पुनः कनेक्ट करें।'
            : 'Google Drive session expired. Please reconnect.'
        );
      } else {
        setListError(err?.message || 'Failed to download backup file from Google Drive.');
      }
    } finally {
      setDownloadingFileId(null);
    }
  };

  /**
   * In-Memory Decryption & Validation.
   * Decrypts the downloaded backup and inspects table records in memory.
   * Zero database writes occur here.
   */
  const handleDecryptAndPreview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!pendingEncryptedContent || !decryptPassphrase.trim()) {
      setDecryptError(
        language === 'hi' ? 'कृपया पासवर्ड दर्ज करें' : 'Please enter the decryption passphrase'
      );
      return;
    }

    setDecryptError('');

    try {
      // 1. Decrypt AES-GCM ciphertext using user-supplied passphrase
      const resolvedJson = await decryptBackupJson(pendingEncryptedContent, decryptPassphrase.trim());

      // 2. Validate decrypted JSON structure in memory
      let parsed: any;
      try {
        parsed = JSON.parse(resolvedJson);
      } catch {
        throw new Error('CORRUPTED_JSON: Decrypted payload is not valid JSON');
      }

      if (!parsed || typeof parsed !== 'object' || !Array.isArray(parsed.sites) || !Array.isArray(parsed.account)) {
        throw new Error(
          language === 'hi'
            ? 'अमान्य बैकअप संरचना (साइट्स या खाता डेटा अनुपलब्ध)'
            : 'Invalid backup structure (sites or account table missing)'
        );
      }

      // 3. Prepare preview metadata for safe user confirmation
      setPendingCleanContent(resolvedJson);
      setPendingRestoreMeta({
        sitesCount: parsed.sites.length,
        toolsCount: Array.isArray(parsed.tools) ? parsed.tools.length : 0,
        duesCount: Array.isArray(parsed.dues) ? parsed.dues.length : 0,
        exportedAt: parsed.exportedAt || selectedBackup?.createdTime,
      });

      // 4. Close decrypt modal and open confirmation dialog
      setIsCloudDecryptModalOpen(false);
      setIsConfirmRestoreOpen(true);
    } catch (err: any) {
      console.error('Cloud backup decryption failed:', err);
      setDecryptError(
        language === 'hi'
          ? 'गलत पासवर्ड या दूषित बैकअप फाइल।'
          : 'Incorrect passphrase or corrupted backup file.'
      );
    }
  };

  /**
   * Cancel restore and discard all in-memory pending payloads.
   * Guarantees zero database writes.
   */
  const handleCancelRestore = () => {
    setIsConfirmRestoreOpen(false);
    setIsCloudDecryptModalOpen(false);
    setPendingCleanContent(null);
    setPendingRestoreMeta(null);
    setPendingEncryptedContent(null);
    setSelectedBackup(null);
    setDecryptPassphrase('');
    setDecryptError('');
  };

  /**
   * Atomic Transaction-Safe Database Restore.
   * Only executes after explicit user confirmation on the preview modal.
   * Preserves merge semantics (existing IDs updated, others preserved).
   */
  const handleConfirmExecuteRestore = async () => {
    if (!pendingCleanContent) return;
    setIsRestoring(true);

    try {
      await db.importBackupJson(pendingCleanContent);
      setIsConfirmRestoreOpen(false);
      setIsBackupsModalOpen(false);
      setPendingCleanContent(null);
      setPendingRestoreMeta(null);
      setPendingEncryptedContent(null);
      setSelectedBackup(null);

      showStatus(
        language === 'hi'
          ? '✓ डेटा सफलतापूर्वक गूगल ड्राइव से रीस्टोर हो गया! ऐप रीलोड हो रहा है...'
          : '✓ Database restored successfully from Google Drive! Reloading...',
        'success',
        3000
      );

      if (onRestoreSuccess) {
        onRestoreSuccess();
      }

      setTimeout(() => {
        window.location.reload();
      }, 1200);
    } catch (err: any) {
      console.error('Failed to import backup to database:', err);
      showStatus(
        language === 'hi'
          ? `डेटा रीस्टोर करने में त्रुटि: ${err?.message || 'अज्ञात त्रुटि'}`
          : `Failed to restore database: ${err?.message || 'Unknown error'}`,
        'error',
        6000
      );
    } finally {
      setIsRestoring(false);
    }
  };

  const formatFileSize = (bytes?: number): string => {
    if (!bytes || bytes <= 0) return '—';
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const formatTimestamp = (isoString?: string): string => {
    if (!isoString) return '—';
    try {
      const date = new Date(isoString);
      return date.toLocaleDateString(language === 'hi' ? 'hi-IN' : 'en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return isoString;
    }
  };

  return (
    <>
      {/* Main Settings Card: Google Drive Cloud Backup */}
      <div className="p-4 rounded-2xl bg-sky-50/60 dark:bg-sky-950/30 border border-sky-200 dark:border-sky-900/60 space-y-3">
        {/* Header Row */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <div className="w-6 h-6 rounded-lg bg-sky-100 dark:bg-sky-900/60 flex items-center justify-center text-sky-600 dark:text-sky-400">
              <Cloud className="w-3.5 h-3.5" />
            </div>
            <span className="font-extrabold text-xs uppercase tracking-wider text-sky-950 dark:text-sky-200">
              {t('googleDriveTitle')}
            </span>
          </div>

          <div className="flex items-center gap-1.5">
            {/* Status Indicator */}
            {isConnected ? (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-green-100 dark:bg-green-950/60 text-green-700 dark:text-green-300 border border-green-200 dark:border-green-800">
                <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                <span>{t('googleDriveConnected')}</span>
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-200/80 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
                <span className="w-1.5 h-1.5 rounded-full bg-slate-400" />
                <span>{t('googleDriveNotConnected')}</span>
              </span>
            )}
            <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-sky-200/80 dark:bg-sky-900 text-sky-800 dark:text-sky-200">
              AES-256
            </span>
          </div>
        </div>

        {/* Informative Subtitle */}
        <p className="text-[11px] text-slate-600 dark:text-slate-400 leading-relaxed">
          {language === 'hi'
            ? 'अपने निजी गूगल ड्राइव में "SiteSaathi Backups" फोल्डर में सुरक्षित AES-256 एन्क्रिप्टेड बैकअप रखें। ठेकेदार लॉगिन पूरी तरह स्वतंत्र व सुरक्षित रहता है।'
            : 'Store encrypted backups directly in your private Google Drive under "SiteSaathi Backups". Completely decoupled from your contractor login.'}
        </p>

        {/* Configuration Notice if VITE_GOOGLE_CLIENT_ID missing */}
        {!isConfigured && (
          <div className="p-2.5 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 text-amber-800 dark:text-amber-300 text-[11px] flex items-start gap-1.5">
            <AlertCircle className="w-4 h-4 shrink-0 text-amber-600 mt-0.5" />
            <div className="leading-tight">
              <span className="font-bold block">
                {language === 'hi' ? 'सेटअप आवश्यक:' : 'Configuration Needed:'}
              </span>
              <span>
                {language === 'hi'
                  ? 'ड्राइव बैकअप सक्षम करने के लिए .env.local में VITE_GOOGLE_CLIENT_ID सेट करें।'
                  : 'Add VITE_GOOGLE_CLIENT_ID to .env.local to enable Google Drive backups.'}
              </span>
            </div>
          </div>
        )}

        {/* Status Feedback Notice */}
        {statusFeedback && (
          <div
            className={`p-2.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 ${
              statusFeedback.type === 'success'
                ? 'bg-green-100 dark:bg-green-950/50 text-green-900 dark:text-green-200 border border-green-200 dark:border-green-800'
                : statusFeedback.type === 'error'
                ? 'bg-red-100 dark:bg-red-950/50 text-red-900 dark:text-red-200 border border-red-200 dark:border-red-800'
                : 'bg-sky-100 dark:bg-sky-900/50 text-sky-900 dark:text-sky-200 border border-sky-200 dark:border-sky-800'
            }`}
          >
            {statusFeedback.type === 'success' ? (
              <CheckCircle2 className="w-3.5 h-3.5 text-green-600 shrink-0" />
            ) : statusFeedback.type === 'error' ? (
              <AlertCircle className="w-3.5 h-3.5 text-red-600 shrink-0" />
            ) : (
              <Cloud className="w-3.5 h-3.5 text-sky-600 shrink-0" />
            )}
            <span className="line-clamp-2">{statusFeedback.text}</span>
          </div>
        )}

        {/* Last Successful Backup Indicator */}
        <div className="flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400 px-1 pt-0.5">
          <span className="flex items-center gap-1">
            <Calendar className="w-3 h-3 text-sky-500" />
            <span>{t('lastCloudBackup')}:</span>
          </span>
          <span className="font-semibold text-slate-700 dark:text-slate-300">
            {lastBackupTime ? formatTimestamp(lastBackupTime) : t('noCloudBackupYet')}
          </span>
        </div>

        {/* Action Controls */}
        {!isConnected ? (
          /* Disconnected State: Single Connect Button */
          <div className="pt-1">
            <button
              type="button"
              disabled={isConnecting}
              onClick={handleConnect}
              className="w-full p-2.5 rounded-xl bg-white dark:bg-slate-800 border border-sky-300 dark:border-sky-800 hover:bg-sky-50 dark:hover:bg-sky-950/50 text-sky-800 dark:text-sky-300 font-bold flex items-center justify-center gap-2 shadow-xs transition-colors disabled:opacity-50"
            >
              {isConnecting ? (
                <>
                  <Loader2 className="w-4 h-4 text-sky-600 animate-spin" />
                  <span>{language === 'hi' ? 'कनेक्ट हो रहा है...' : 'Connecting to Google Drive...'}</span>
                </>
              ) : (
                <>
                  <Cloud className="w-4 h-4 text-sky-600" />
                  <span>{t('connectGoogleDrive')}</span>
                </>
              )}
            </button>
          </div>
        ) : (
          /* Connected State: Action Grid + Disconnect Option */
          <div className="space-y-2 pt-1">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <button
                type="button"
                onClick={handleOpenBackupModal}
                className="p-2.5 rounded-xl bg-white dark:bg-slate-800 border border-sky-300 dark:border-sky-800 hover:bg-sky-50 dark:hover:bg-sky-950/50 text-sky-800 dark:text-sky-300 font-bold flex items-center justify-center gap-2 shadow-xs transition-colors"
              >
                <CloudUpload className="w-4 h-4 text-sky-600" />
                <span>{t('uploadToDrive')}</span>
              </button>

              <button
                type="button"
                onClick={handleOpenBackupsList}
                className="p-2.5 rounded-xl bg-white dark:bg-slate-800 border border-sky-300 dark:border-sky-800 hover:bg-sky-50 dark:hover:bg-sky-950/50 text-sky-800 dark:text-sky-300 font-bold flex items-center justify-center gap-2 shadow-xs transition-colors"
              >
                <CloudDownload className="w-4 h-4 text-sky-600" />
                <span>{t('viewDriveBackups')}</span>
              </button>
            </div>

            <div className="flex justify-end pt-0.5">
              <button
                type="button"
                onClick={handleDisconnect}
                className="text-[11px] font-semibold text-slate-500 hover:text-red-600 dark:hover:text-red-400 flex items-center gap-1 transition-colors px-1"
              >
                <CloudOff className="w-3 h-3" />
                <span>{t('disconnectGoogleDrive')}</span>
              </button>
            </div>
          </div>
        )}
      </div>

      {/* MODAL 1: Passphrase Prompt for Encrypted Upload */}
      {isPassphraseModalOpen && (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-4">
          <div
            className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm"
            onClick={() => {
              if (!isBackingUp) {
                setIsPassphraseModalOpen(false);
                setBackupPassphrase('');
                setConfirmBackupPassphrase('');
                setPassphraseError('');
              }
            }}
          />
          <div className="relative z-10 bg-white dark:bg-slate-900 w-full max-w-sm rounded-2xl p-5 border border-slate-200 dark:border-slate-800 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2 text-sky-600 dark:text-sky-400">
                <CloudUpload className="w-5 h-5" />
                <h3 className="font-extrabold text-sm text-slate-900 dark:text-white">
                  {language === 'hi' ? 'एन्क्रिप्टेड बैकअप पासवर्ड' : 'Encrypt Cloud Backup'}
                </h3>
              </div>
              {!isBackingUp && (
                <button
                  type="button"
                  onClick={() => {
                    setIsPassphraseModalOpen(false);
                    setBackupPassphrase('');
                    setConfirmBackupPassphrase('');
                    setPassphraseError('');
                  }}
                  className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>

            <div className="p-3 rounded-xl bg-sky-50/60 dark:bg-sky-950/30 border border-sky-100 dark:border-sky-900/60 text-[11px] text-sky-900 dark:text-sky-300 space-y-1">
              <div className="flex items-center gap-1.5 font-bold">
                <ShieldCheck className="w-3.5 h-3.5 text-sky-600" />
                <span>{language === 'hi' ? 'पूर्ण क्लाउड सुरक्षा (AES-256)' : 'Zero-Knowledge Encryption'}</span>
              </div>
              <p className="text-slate-600 dark:text-slate-400 leading-tight">
                {language === 'hi'
                  ? 'डेटा गूगल पर जाने से पहले आपके डिवाइस पर एन्क्रिप्ट होता है। पासवर्ड याद रखें; रीस्टोर करने के लिए यह अनिवार्य होगा।'
                  : 'Backup is encrypted locally before upload. Plaintext is never sent to Google. Remember this passphrase to restore.'}
              </p>
            </div>

            {passphraseError && (
              <div className="p-2.5 rounded-lg bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 text-xs flex items-center gap-1.5 font-semibold">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{passphraseError}</span>
              </div>
            )}

            <form onSubmit={handleExecuteUpload} className="space-y-3">
              <div>
                <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-400 mb-1">
                  {language === 'hi' ? 'बैकअप पासवर्ड (कम से कम 4 अक्षर) *' : 'Backup Passphrase (Min 4 chars) *'}
                </label>
                <input
                  type="password"
                  autoFocus
                  required
                  disabled={isBackingUp}
                  value={backupPassphrase}
                  onChange={(e) => setBackupPassphrase(e.target.value)}
                  placeholder="••••••••"
                  className="w-full px-3 py-2 text-xs font-mono font-bold rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:border-sky-600"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-400 mb-1">
                  {language === 'hi' ? 'पासवर्ड पुनः दर्ज करें *' : 'Confirm Passphrase *'}
                </label>
                <input
                  type="password"
                  required
                  disabled={isBackingUp}
                  value={confirmBackupPassphrase}
                  onChange={(e) => setConfirmBackupPassphrase(e.target.value)}
                  placeholder="••••••••"
                  className="w-full px-3 py-2 text-xs font-mono font-bold rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:border-sky-600"
                />
              </div>

              <div className="flex items-center gap-2 pt-1">
                <button
                  type="submit"
                  disabled={isBackingUp}
                  className="flex-1 py-2 rounded-xl bg-sky-600 hover:bg-sky-700 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-sm transition-colors disabled:opacity-50"
                >
                  {isBackingUp ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      <span>{language === 'hi' ? 'अपलोड हो रहा है...' : 'Uploading to Drive...'}</span>
                    </>
                  ) : (
                    <>
                      <Lock className="w-3.5 h-3.5" />
                      <span>{language === 'hi' ? 'एन्क्रिप्ट कर अपलोड करें' : 'Encrypt & Upload'}</span>
                    </>
                  )}
                </button>
                {!isBackingUp && (
                  <button
                    type="button"
                    onClick={() => {
                      setIsPassphraseModalOpen(false);
                      setBackupPassphrase('');
                      setConfirmBackupPassphrase('');
                      setPassphraseError('');
                    }}
                    className="py-2 px-3 rounded-xl bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold text-xs hover:bg-slate-300"
                  >
                    {language === 'hi' ? 'रद्द' : 'Cancel'}
                  </button>
                )}
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: Google Drive Backups List */}
      {isBackupsModalOpen && (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-4">
          <div
            className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm"
            onClick={() => {
              if (!downloadingFileId) setIsBackupsModalOpen(false);
            }}
          />
          <div className="relative z-10 bg-white dark:bg-slate-900 w-full max-w-lg rounded-2xl p-5 border border-slate-200 dark:border-slate-800 shadow-2xl space-y-4 max-h-[85vh] flex flex-col">
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2 text-sky-600 dark:text-sky-400">
                <Cloud className="w-5 h-5" />
                <div>
                  <h3 className="font-extrabold text-sm text-slate-900 dark:text-white">
                    {language === 'hi' ? 'गूगल ड्राइव बैकअप फाइलें' : 'Google Drive Backups'}
                  </h3>
                  <p className="text-[10px] text-slate-500">
                    {language === 'hi' ? 'फोल्डर: SiteSaathi Backups' : 'Folder: SiteSaathi Backups'}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  title="Refresh backups list"
                  disabled={isLoadingBackups || !!downloadingFileId}
                  onClick={fetchBackups}
                  className="p-1.5 rounded-lg text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-50"
                >
                  <RefreshCw className={`w-4 h-4 ${isLoadingBackups ? 'animate-spin' : ''}`} />
                </button>
                <button
                  type="button"
                  disabled={!!downloadingFileId}
                  onClick={() => setIsBackupsModalOpen(false)}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Error Display */}
            {listError && (
              <div className="p-2.5 rounded-lg bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 text-xs flex items-center justify-between gap-1.5">
                <div className="flex items-center gap-1.5">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{listError}</span>
                </div>
                {!isConnected && (
                  <button
                    type="button"
                    onClick={handleConnect}
                    className="px-2 py-0.5 rounded bg-red-600 text-white font-bold text-[10px]"
                  >
                    {language === 'hi' ? 'पुनः कनेक्ट' : 'Reconnect'}
                  </button>
                )}
              </div>
            )}

            {/* List Body */}
            <div className="flex-1 overflow-y-auto space-y-2 pr-1 custom-scrollbar">
              {isLoadingBackups ? (
                <div className="py-12 flex flex-col items-center justify-center text-slate-500 space-y-2">
                  <Loader2 className="w-6 h-6 animate-spin text-sky-600" />
                  <span className="text-xs font-semibold">
                    {language === 'hi' ? 'ड्राइव से बैकअप सूची लोड हो रही है...' : 'Loading backups from Google Drive...'}
                  </span>
                </div>
              ) : backupsList.length === 0 ? (
                <div className="py-10 text-center space-y-2 px-4">
                  <div className="w-10 h-10 mx-auto rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-400">
                    <Cloud className="w-5 h-5" />
                  </div>
                  <h4 className="font-bold text-xs text-slate-700 dark:text-slate-300">
                    {language === 'hi' ? 'कोई क्लाउड बैकअप नहीं मिला' : 'No cloud backups found'}
                  </h4>
                  <p className="text-[11px] text-slate-500 leading-relaxed max-w-xs mx-auto">
                    {language === 'hi'
                      ? '"SiteSaathi Backups" फोल्डर में अभी कोई बैकअप उपलब्ध नहीं है। "ड्राइव पर बैकअप लें" बटन दबाकर पहला बैकअप बनाएं।'
                      : 'No backup files found in "SiteSaathi Backups" folder. Create a new backup to store it in Google Drive.'}
                  </p>
                </div>
              ) : (
                backupsList.map((file) => {
                  const isDownloading = downloadingFileId === file.id;
                  return (
                    <div
                      key={file.id}
                      className="p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 hover:border-sky-300 dark:hover:border-sky-800 transition-all flex items-center justify-between gap-3"
                    >
                      <div className="space-y-1 min-w-0 flex-1">
                        <div className="flex items-center gap-1.5">
                          <Database className="w-3.5 h-3.5 text-sky-600 shrink-0" />
                          <span className="font-bold text-xs text-slate-900 dark:text-white truncate">
                            {file.name}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 text-[10px] text-slate-500 dark:text-slate-400">
                          <span>{formatTimestamp(file.createdTime)}</span>
                          <span>•</span>
                          <span>{formatFileSize(file.size)}</span>
                          <span>•</span>
                          <span className="text-sky-600 dark:text-sky-400 font-semibold">AES-256</span>
                        </div>
                      </div>

                      <button
                        type="button"
                        disabled={!!downloadingFileId}
                        onClick={() => handleSelectBackupForRestore(file)}
                        className="px-3 py-1.5 rounded-lg text-xs font-bold bg-sky-600 hover:bg-sky-700 text-white flex items-center gap-1 shrink-0 shadow-xs transition-colors disabled:opacity-50"
                      >
                        {isDownloading ? (
                          <>
                            <Loader2 className="w-3.5 h-3.5 animate-spin" />
                            <span>{language === 'hi' ? 'डाउनलोड...' : 'Downloading...'}</span>
                          </>
                        ) : (
                          <>
                            <CloudDownload className="w-3.5 h-3.5" />
                            <span>{language === 'hi' ? 'रीस्टोर' : 'Restore'}</span>
                          </>
                        )}
                      </button>
                    </div>
                  );
                })
              )}
            </div>

            {/* Modal Footer */}
            <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex justify-end">
              <button
                type="button"
                onClick={() => setIsBackupsModalOpen(false)}
                className="py-1.5 px-4 rounded-xl bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold text-xs hover:bg-slate-300"
              >
                {language === 'hi' ? 'बंद करें' : 'Close'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 3: In-Memory Decryption Passphrase Prompt */}
      {isCloudDecryptModalOpen && (
        <div className="fixed inset-0 z-70 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-slate-950/85 backdrop-blur-sm" onClick={handleCancelRestore} />
          <div className="relative z-10 bg-white dark:bg-slate-900 w-full max-w-sm rounded-2xl p-5 border border-slate-200 dark:border-slate-800 shadow-2xl space-y-4">
            <div className="flex items-center gap-2 text-sky-600 dark:text-sky-400">
              <Lock className="w-5 h-5" />
              <h3 className="font-extrabold text-sm text-slate-900 dark:text-white">
                {language === 'hi' ? 'क्लाउड बैकअप डिक्रिप्ट करें' : 'Decrypt Cloud Backup'}
              </h3>
            </div>

            <p className="text-xs text-slate-500 leading-relaxed">
              {language === 'hi'
                ? 'यह बैकअप सुरक्षित AES-256 एन्क्रिप्टेड है। डेटा की जांच व रीस्टोर करने हेतु पासवर्ड दर्ज करें:'
                : 'This backup is encrypted with AES-256. Enter the passphrase set when uploading to decrypt in memory:'}
            </p>

            {decryptError && (
              <div className="p-2.5 rounded-lg bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 text-xs flex items-center gap-1.5 font-semibold">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{decryptError}</span>
              </div>
            )}

            <form onSubmit={handleDecryptAndPreview} className="space-y-3">
              <input
                type="password"
                autoFocus
                required
                value={decryptPassphrase}
                onChange={(e) => setDecryptPassphrase(e.target.value)}
                placeholder="••••••••"
                className="w-full px-3 py-2 text-center font-mono font-bold text-base rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:border-sky-600"
              />

              <div className="flex items-center gap-2">
                <button
                  type="submit"
                  className="flex-1 py-2 rounded-xl bg-sky-600 hover:bg-sky-700 text-white font-bold text-xs transition-colors"
                >
                  {language === 'hi' ? 'डिक्रिप्ट व जांचें' : 'Decrypt & Inspect'}
                </button>
                <button
                  type="button"
                  onClick={handleCancelRestore}
                  className="py-2 px-3 rounded-xl bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold text-xs"
                >
                  {language === 'hi' ? 'रद्द' : 'Cancel'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 4: Pre-Restore Preview & Explicit Merge Confirmation */}
      {isConfirmRestoreOpen && (
        <div className="fixed inset-0 z-70 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-slate-950/85 backdrop-blur-sm" onClick={handleCancelRestore} />
          <div className="relative z-10 bg-white dark:bg-slate-900 w-full max-w-sm rounded-2xl p-5 border border-slate-200 dark:border-slate-800 shadow-2xl space-y-4">
            <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400">
              <CloudDownload className="w-5 h-5" />
              <h3 className="font-extrabold text-sm text-slate-900 dark:text-white">
                {language === 'hi' ? 'क्लाउड रीस्टोर की पुष्टि करें' : 'Confirm Google Drive Restore'}
              </h3>
            </div>

            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              {language === 'hi'
                ? 'यह बैकअप आपके स्थानीय डेटाबेस में मर्ज होगा। समान आईडी वाले रिकॉर्ड्स अपडेट हो जाएंगे, जबकि अन्य रिकॉर्ड्स सुरक्षित रहेंगे।'
                : 'This cloud backup will merge into your database. Existing records with identical IDs will be overwritten, while unaffected records remain preserved.'}
            </p>

            {pendingRestoreMeta && (
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 space-y-1 text-xs">
                <div className="flex justify-between text-slate-500">
                  <span>{language === 'hi' ? 'साइट्स संख्या:' : 'Sites in Backup:'}</span>
                  <span className="font-bold text-slate-900 dark:text-white">
                    {pendingRestoreMeta.sitesCount}
                  </span>
                </div>
                <div className="flex justify-between text-slate-500">
                  <span>{language === 'hi' ? 'टूल्स रिकॉर्ड्स:' : 'Tools in Backup:'}</span>
                  <span className="font-bold text-slate-900 dark:text-white">
                    {pendingRestoreMeta.toolsCount}
                  </span>
                </div>
                <div className="flex justify-between text-slate-500">
                  <span>{language === 'hi' ? 'बकाया (Dues):' : 'Dues in Backup:'}</span>
                  <span className="font-bold text-slate-900 dark:text-white">
                    {pendingRestoreMeta.duesCount}
                  </span>
                </div>
                {pendingRestoreMeta.exportedAt && (
                  <div className="flex justify-between text-slate-500 pt-1 border-t border-slate-200 dark:border-slate-700 text-[10px]">
                    <span>{language === 'hi' ? 'एक्सपोर्ट दिनांक:' : 'Exported Date:'}</span>
                    <span className="font-mono text-slate-700 dark:text-slate-300">
                      {formatTimestamp(pendingRestoreMeta.exportedAt)}
                    </span>
                  </div>
                )}
              </div>
            )}

            <div className="flex items-center gap-2 pt-1">
              <button
                type="button"
                disabled={isRestoring}
                onClick={handleConfirmExecuteRestore}
                className="flex-1 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-sm transition-colors flex items-center justify-center gap-1.5 disabled:opacity-50"
              >
                {isRestoring ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>{language === 'hi' ? 'रीस्टोर हो रहा है...' : 'Restoring...'}</span>
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>{language === 'hi' ? 'हाँ, रीस्टोर करें' : 'Confirm & Restore'}</span>
                  </>
                )}
              </button>
              <button
                type="button"
                disabled={isRestoring}
                onClick={handleCancelRestore}
                className="py-2 px-3 rounded-xl bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold text-xs"
              >
                {language === 'hi' ? 'रद्द' : 'Cancel'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
