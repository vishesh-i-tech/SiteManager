import React, { useState, useRef } from 'react';
import { useTheme } from '../../core/theme/ThemeContext';
import { ContractorAccount, TradeCategory, ThemeMode, Language } from '../../types';
import { TRADE_CONFIGS, ALL_TRADE_KEYS } from '../../core/theme/tradeConfigs';
import { db } from '../../core/db/database';
import { ConfirmDeleteModal } from '../common/ConfirmDeleteModal';
import { hashCredential, verifyCredential, isEncryptedBackup } from '../../utils/cryptoUtils';
import {
  Settings,
  User,
  Phone,
  Building,
  Mail,
  Lock,
  Fingerprint,
  Shield,
  ShieldAlert,
  ShieldCheck,
  Download,
  Upload,
  Sun,
  HelpCircle,
  RotateCcw,
  Sparkles,
  Trash2,
  LogOut,
  X,
  CheckCircle2,
  AlertCircle,
  Edit3,
  Save,
  HardHat,
  Wrench,
  Zap,
  Paintbrush,
  Hammer,
  Layers,
  Grid,
  Wind,
  Truck,
} from 'lucide-react';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  account: ContractorAccount | null | undefined;
  onReplayTutorial: () => void;
  onLoadSampleData: () => void;
  onClearAllData: () => void;
  onLogOut: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  account,
  onReplayTutorial,
  onLoadSampleData,
  onClearAllData,
  onLogOut,
}) => {
  const { trade, setTrade, themeMode, setThemeMode, language, setLanguage, t, tradeConfig } = useTheme();

  // Profile Edit State
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [editName, setEditName] = useState(account?.name || '');
  const [editPhone, setEditPhone] = useState(account?.phone || '');
  const [editCompany, setEditCompany] = useState(account?.companyName || '');
  const [editEmail, setEditEmail] = useState(account?.email || '');
  const [profileError, setProfileError] = useState('');
  const [profileSuccess, setProfileSuccess] = useState('');

  // Security & App Lock State
  const [isPinLockEnabled, setIsPinLockEnabled] = useState(account?.isPinLockEnabled || false);
  const [pinCode, setPinCode] = useState('');
  const [isBiometricEnabled, setIsBiometricEnabled] = useState(account?.isBiometricEnabled || false);
  const [isAntiDeleteEnabled, setIsAntiDeleteEnabled] = useState(account?.isAntiDeleteEnabled || false);
  const [securityNotice, setSecurityNotice] = useState('');

  // Backup & Restore State
  const [backupStatus, setBackupStatus] = useState<string>('');
  const [isEncryptExportModalOpen, setIsEncryptExportModalOpen] = useState(false);
  const [exportPassphrase, setExportPassphrase] = useState('');
  const [confirmExportPassphrase, setConfirmExportPassphrase] = useState('');
  const [exportError, setExportError] = useState('');
  const [pendingEncryptedContent, setPendingEncryptedContent] = useState<string | null>(null);
  const [restorePassphrase, setRestorePassphrase] = useState('');
  const [isDecryptModalOpen, setIsDecryptModalOpen] = useState(false);
  const [decryptError, setDecryptError] = useState('');
  const [isConfirmRestoreOpen, setIsConfirmRestoreOpen] = useState(false);
  const [pendingCleanContent, setPendingCleanContent] = useState<string | null>(null);
  const [pendingRestoreMeta, setPendingRestoreMeta] = useState<{
    sitesCount: number;
    toolsCount: number;
    duesCount: number;
    exportedAt?: string;
  } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Clear Confirmation
  const [isConfirmClearOpen, setIsConfirmClearOpen] = useState(false);
  const [isConfirmSampleOpen, setIsConfirmSampleOpen] = useState(false);
  const [pinPromptOpen, setPinPromptOpen] = useState(false);
  const [enteredPin, setEnteredPin] = useState('');
  const [pinError, setPinError] = useState('');

  // Hardware biometric detection
  const hasBiometricSupport = typeof window !== 'undefined' && !!window.PublicKeyCredential;

  if (!isOpen) return null;

  const handleStartEditProfile = () => {
    setEditName(account?.name || '');
    setEditPhone(account?.phone?.replace(/\D/g, '') || '');
    setEditCompany(account?.companyName || '');
    setEditEmail(account?.email || '');
    setProfileError('');
    setProfileSuccess('');
    setIsEditingProfile(true);
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setProfileError('');
    setProfileSuccess('');

    if (!editName.trim()) {
      setProfileError(language === 'hi' ? 'कृपया अपना नाम दर्ज करें' : 'Please enter your name');
      return;
    }

    const cleanPhone = editPhone.trim().replace(/\D/g, '');
    if (cleanPhone.length !== 10) {
      setProfileError(
        language === 'hi'
          ? 'मोबाइल नंबर ठीक 10 अंकों का होना चाहिए'
          : 'Mobile phone number must be exactly 10 digits'
      );
      return;
    }

    try {
      if (account?.id) {
        await db.account.update(account.id, {
          name: editName.trim(),
          phone: cleanPhone,
          companyName: editCompany.trim() || undefined,
          email: editEmail.trim() || undefined,
        });
      }
      setProfileSuccess(language === 'hi' ? 'प्रोफाइल सफलतापूर्वक अपडेट हुई!' : 'Profile updated successfully!');
      setTimeout(() => {
        setIsEditingProfile(false);
        setProfileSuccess('');
      }, 1200);
    } catch (err) {
      console.error('Failed to update profile:', err);
      setProfileError(language === 'hi' ? 'प्रोफाइल सेव करने में त्रुटि' : 'Failed to save profile');
    }
  };

  const handleTogglePinLock = async () => {
    if (!account?.id) return;
    const nextState = !isPinLockEnabled;
    if (nextState && !pinCode && !account.pinLock) {
      setSecurityNotice(language === 'hi' ? 'कृपया पहले 4 अंकों का पिन दर्ज करें' : 'Please set a 4-digit PIN first');
      return;
    }
    setIsPinLockEnabled(nextState);
    const pinToSave = pinCode && pinCode.length >= 4 ? await hashCredential(pinCode) : account.pinLock;
    await db.account.update(account.id, {
      isPinLockEnabled: nextState,
      pinLock: pinToSave,
    });
    if (pinCode) {
      setPinCode('');
    }
    setSecurityNotice(
      nextState
        ? language === 'hi' ? 'पिन लॉक सक्रिय हो गया' : 'PIN Lock enabled'
        : language === 'hi' ? 'पिन लॉक बंद कर दिया गया' : 'PIN Lock disabled'
    );
    setTimeout(() => setSecurityNotice(''), 2500);
  };

  const handleSavePin = async () => {
    if (!account?.id) return;
    const cleanPin = pinCode.trim().replace(/\D/g, '');
    if (cleanPin.length < 4 || cleanPin.length > 6) {
      setSecurityNotice(language === 'hi' ? 'पिन 4 से 6 अंकों का होना चाहिए' : 'PIN must be between 4 and 6 digits');
      return;
    }
    const hashedPin = await hashCredential(cleanPin);
    await db.account.update(account.id, {
      pinLock: hashedPin,
      isPinLockEnabled: true,
    });
    setIsPinLockEnabled(true);
    setPinCode('');
    setSecurityNotice(language === 'hi' ? 'सुरक्षा पिन सुरक्षित रूप से सेव हुआ' : 'Security PIN saved successfully');
    setTimeout(() => setSecurityNotice(''), 2500);
  };

  const handleToggleBiometric = async () => {
    if (!account?.id) return;
    if (!hasBiometricSupport) {
      setSecurityNotice(
        language === 'hi'
          ? 'इस डिवाइस में बायोमेट्रिक सेंसर उपलब्ध नहीं है। पिन लॉक काम करेगा।'
          : 'Biometric hardware not detected on this device. PIN lock will be active.'
      );
      setTimeout(() => setSecurityNotice(''), 3500);
      return;
    }
    const nextState = !isBiometricEnabled;
    setIsBiometricEnabled(nextState);
    await db.account.update(account.id, {
      isBiometricEnabled: nextState,
    });
    setSecurityNotice(
      nextState
        ? language === 'hi' ? 'बायोमेट्रिक स्विच सक्रिय (पिन बैकअप सुरक्षित)' : 'Biometric toggle activated (PIN fallback active)'
        : language === 'hi' ? 'बायोमेट्रिक लॉक बंद किया गया' : 'Biometric toggle deactivated'
    );
    setTimeout(() => setSecurityNotice(''), 2500);
  };

  const handleToggleAntiDelete = async () => {
    if (!account?.id) return;
    const nextState = !isAntiDeleteEnabled;
    setIsAntiDeleteEnabled(nextState);
    await db.account.update(account.id, {
      isAntiDeleteEnabled: nextState,
    });
    setSecurityNotice(
      nextState
        ? language === 'hi'
          ? 'एंटी-डिलीट सुरक्षा चालू: बिना पिन कोई डेटा नहीं हटा सकता'
          : 'Anti-Delete protection active: Data wipe restricted'
        : language === 'hi'
        ? 'एंटी-डिलीट सुरक्षा बंद की गई'
        : 'Anti-Delete protection turned off'
    );
    setTimeout(() => setSecurityNotice(''), 3000);
  };

  const executeBackupDownload = async (passphrase?: string) => {
    try {
      setBackupStatus(language === 'hi' ? 'बैकअप तैयार हो रहा है...' : 'Generating backup file...');
      const json = await db.exportBackupJson(passphrase);
      const isEnc = !!passphrase;
      const blob = new Blob([json], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      const dateStr = new Date().toISOString().split('T')[0];
      a.href = url;
      a.download = isEnc ? `SiteSaathi_EncryptedBackup_${dateStr}.json` : `SiteSaathi_Backup_${dateStr}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      setBackupStatus(
        isEnc
          ? (language === 'hi' ? '✓ एन्क्रिप्टेड बैकअप डाउनलोड हो गया!' : '✓ Encrypted backup downloaded securely!')
          : (language === 'hi' ? '✓ सुरक्षित बैकअप डाउनलोड हो गया (क्रेडेंशियल सुरक्षित)!' : '✓ Clean backup downloaded (credentials stripped)!')
      );
      setIsEncryptExportModalOpen(false);
      setExportPassphrase('');
      setConfirmExportPassphrase('');
      setExportError('');
      setTimeout(() => setBackupStatus(''), 4500);
    } catch (err) {
      console.error('Backup export failed:', err);
      setBackupStatus(language === 'hi' ? 'बैकअप डाउनलोड करने में त्रुटि' : 'Failed to export backup');
    }
  };

  const handleExportBackup = () => {
    setExportPassphrase('');
    setConfirmExportPassphrase('');
    setExportError('');
    setIsEncryptExportModalOpen(true);
  };

  const handleDownloadCleanBackup = async () => {
    setIsEncryptExportModalOpen(false);
    await executeBackupDownload();
  };

  const handleDownloadEncryptedBackup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!exportPassphrase || exportPassphrase.length < 4) {
      setExportError(
        language === 'hi'
          ? 'पासवर्ड कम से कम 4 अक्षरों का होना चाहिए'
          : 'Passphrase must be at least 4 characters'
      );
      return;
    }
    if (exportPassphrase !== confirmExportPassphrase) {
      setExportError(
        language === 'hi'
          ? 'दोनों पासवर्ड मेल नहीं खा रहे हैं'
          : 'Passphrases do not match. Please re-enter.'
      );
      return;
    }
    setExportError('');
    try {
      const pass = exportPassphrase.trim();
      setExportPassphrase('');
      setConfirmExportPassphrase('');
      setIsEncryptExportModalOpen(false);
      await executeBackupDownload(pass);
    } catch (err) {
      console.error('Encrypted backup export failed:', err);
      setExportError(
        language === 'hi'
          ? 'एन्क्रिप्टेड बैकअप बनाने में त्रुटि हुई'
          : 'Failed to generate encrypted backup'
      );
    }
  };

  const handleImportBackup = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (event) => {
      try {
        const content = event.target?.result as string;
        let parsed: any;
        try {
          parsed = JSON.parse(content);
        } catch {
          setBackupStatus(language === 'hi' ? 'अमान्य JSON फाइल प्रारूप' : 'Invalid JSON file format');
          return;
        }

        // 1. Detect AES-GCM Encrypted Backup format
        if (isEncryptedBackup(parsed)) {
          setPendingEncryptedContent(content);
          setRestorePassphrase('');
          setDecryptError('');
          setIsDecryptModalOpen(true);
          return;
        }

        // 2. Validate unencrypted backup schema before applying
        if (!parsed || typeof parsed !== 'object' || !Array.isArray(parsed.sites) || !Array.isArray(parsed.account)) {
          setBackupStatus(
            language === 'hi'
              ? 'अमान्य बैकअप फाइल संरचना (साइट्स या खाता डेटा अनुपलब्ध)'
              : 'Invalid backup format (sites or accounts array missing)'
          );
          return;
        }

        // 3. Stash pending content and require explicit user confirmation before applying
        setPendingCleanContent(content);
        setPendingRestoreMeta({
          sitesCount: parsed.sites.length,
          toolsCount: Array.isArray(parsed.tools) ? parsed.tools.length : 0,
          duesCount: Array.isArray(parsed.dues) ? parsed.dues.length : 0,
          exportedAt: parsed.exportedAt || undefined,
        });
        setIsConfirmRestoreOpen(true);
      } catch (err) {
        console.error('Backup import error:', err);
        setBackupStatus(language === 'hi' ? 'बैकअप फाइल पढ़ने में त्रुटि' : 'Failed to read backup JSON file');
      } finally {
        if (fileInputRef.current) fileInputRef.current.value = '';
      }
    };
    reader.readAsText(file);
  };

  const handleCancelRestore = () => {
    setIsConfirmRestoreOpen(false);
    setPendingCleanContent(null);
    setPendingRestoreMeta(null);
  };

  const handleConfirmRestore = async () => {
    if (!pendingCleanContent) return;
    setIsConfirmRestoreOpen(false);
    try {
      setBackupStatus(language === 'hi' ? 'डेटा रीस्टोर किया जा रहा है...' : 'Restoring database...');
      await db.importBackupJson(pendingCleanContent);
      setPendingCleanContent(null);
      setPendingRestoreMeta(null);
      setBackupStatus(language === 'hi' ? '✓ डेटा सफलतापूर्वक रीस्टोर हो गया!' : '✓ Database restored successfully!');
      setTimeout(() => {
        window.location.reload();
      }, 1200);
    } catch (err) {
      console.error('Restore error:', err);
      setBackupStatus(language === 'hi' ? 'डेटा रीस्टोर करने में त्रुटि' : 'Failed to restore database');
      setPendingCleanContent(null);
      setPendingRestoreMeta(null);
    }
  };

  const handleConfirmDecryptAndRestore = async () => {
    if (!pendingEncryptedContent || !restorePassphrase.trim()) {
      setDecryptError(language === 'hi' ? 'कृपया पासवर्ड दर्ज करें' : 'Please enter the decryption password');
      return;
    }
    setDecryptError('');
    try {
      setBackupStatus(language === 'hi' ? 'डेटा डिक्रिप्ट व रीस्टोर हो रहा है...' : 'Decrypting and restoring backup...');
      await db.importBackupJson(pendingEncryptedContent, restorePassphrase.trim());
      setIsDecryptModalOpen(false);
      setPendingEncryptedContent(null);
      setRestorePassphrase('');
      setBackupStatus(language === 'hi' ? '✓ एन्क्रिप्टेड डेटा सफलतापूर्वक रीस्टोर हो गया!' : '✓ Encrypted database restored successfully!');
      setTimeout(() => {
        window.location.reload();
      }, 1200);
    } catch (err: any) {
      console.error('Decryption failed:', err);
      setDecryptError(
        language === 'hi'
          ? 'गलत पासवर्ड या दूषित बैकअप फाइल।'
          : 'Incorrect password or corrupted backup file.'
      );
      setBackupStatus('');
    }
  };

  const handleRequestClearData = () => {
    if (isAntiDeleteEnabled || (isPinLockEnabled && account?.pinLock)) {
      setPinPromptOpen(true);
      setEnteredPin('');
      setPinError('');
    } else {
      setIsConfirmClearOpen(true);
    }
  };

  // SEC-DEF-001 FIX: Constant-time PBKDF2 PIN verification for anti-delete gate
  const handleVerifyPinForClear = async () => {
    const targetCred = account?.pinLock || account?.password || '';
    const verifyRes = await verifyCredential(enteredPin, targetCred);
    if (verifyRes.isValid) {
      setPinPromptOpen(false);
      setIsConfirmClearOpen(true);
    } else {
      setPinError(language === 'hi' ? 'गलत पिन दर्ज किया गया' : 'Incorrect security PIN');
    }
  };

  return (
    <>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto">
        <div className="fixed inset-0 bg-slate-950/75 backdrop-blur-sm transition-opacity" onClick={onClose} />

        <div className="relative z-10 bg-white dark:bg-slate-900 w-full max-w-xl rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col max-h-[92vh] animate-fade-in">
          
          {/* Header - Strictly "Settings" as requested */}
          <div className="p-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-800/40">
            <div className="flex items-center gap-2.5">
              <div
                className="w-10 h-10 rounded-2xl flex items-center justify-center text-white shadow-md"
                style={{ backgroundColor: tradeConfig.primaryColor }}
              >
                <Settings className="w-5 h-5" />
              </div>
              <div>
                <h2 className="font-extrabold text-base text-slate-900 dark:text-white font-heading">
                  {t('settingsTitle')}
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  {language === 'hi' ? 'प्रोफाइल, सुरक्षा व डेटा नियंत्रण' : 'Contractor profile, security & data control'}
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Modal Body */}
          <div className="p-6 space-y-6 overflow-y-auto flex-1 text-xs">
            
            {/* 1. Contractor Profile Card & In-line Editor */}
            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-3">
              <div className="flex items-center justify-between">
                <span className="font-extrabold text-xs uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                  <User className="w-3.5 h-3.5 text-blue-500" />
                  <span>{language === 'hi' ? 'ठेकेदार प्रोफाइल' : 'Contractor Profile'}</span>
                </span>
                {!isEditingProfile && (
                  <button
                    type="button"
                    onClick={handleStartEditProfile}
                    className="px-2.5 py-1 rounded-lg text-xs font-bold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/60 hover:bg-blue-100 border border-blue-200 dark:border-blue-900 flex items-center gap-1 transition-colors"
                  >
                    <Edit3 className="w-3 h-3" />
                    <span>{language === 'hi' ? 'एडिट करें' : 'Edit Profile'}</span>
                  </button>
                )}
              </div>

              {profileSuccess && (
                <div className="p-2.5 rounded-lg bg-green-50 dark:bg-green-950/40 border border-green-200 dark:border-green-800 text-green-700 dark:text-green-300 text-xs flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>{profileSuccess}</span>
                </div>
              )}

              {profileError && (
                <div className="p-2.5 rounded-lg bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 text-xs flex items-center gap-1.5">
                  <AlertCircle className="w-4 h-4" />
                  <span>{profileError}</span>
                </div>
              )}

              {/* View Mode */}
              {!isEditingProfile ? (
                <div className="pt-1 space-y-1.5">
                  <h3 className="font-black text-base text-slate-900 dark:text-white">
                    {account?.name || 'Contractor'}
                  </h3>
                  <p className="text-slate-600 dark:text-slate-300 font-semibold flex items-center gap-1.5">
                    <Phone className="w-3.5 h-3.5 text-blue-500" />
                    <span>{account?.phone || 'No phone'}</span>
                  </p>
                  {account?.companyName && (
                    <p className="text-slate-600 dark:text-slate-300 font-semibold flex items-center gap-1.5">
                      <Building className="w-3.5 h-3.5 text-purple-500" />
                      <span>{account.companyName}</span>
                    </p>
                  )}
                  {account?.email && (
                    <p className="text-slate-600 dark:text-slate-300 font-semibold flex items-center gap-1.5">
                      <Mail className="w-3.5 h-3.5 text-amber-500" />
                      <span>{account.email}</span>
                    </p>
                  )}
                </div>
              ) : (
                /* Edit Mode */
                <form onSubmit={handleSaveProfile} className="space-y-3 pt-2">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-400 mb-1">
                      {language === 'hi' ? 'ठेकेदार का नाम *' : 'Contractor Name *'}
                    </label>
                    <input
                      type="text"
                      required
                      value={editName}
                      onChange={(e) => setEditName(e.target.value)}
                      placeholder="Contractor Name"
                      className="w-full px-3 py-2 rounded-xl text-xs font-semibold bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-600 text-slate-900 dark:text-white focus:outline-none focus:border-blue-600"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-400 mb-1">
                      {language === 'hi' ? 'मोबाइल नंबर (ठीक 10 अंक) *' : 'Mobile Number (Exactly 10 digits) *'}
                    </label>
                    <input
                      type="tel"
                      required
                      maxLength={10}
                      value={editPhone}
                      onChange={(e) => setEditPhone(e.target.value.replace(/\D/g, '').slice(0, 10))}
                      placeholder="9876543210"
                      className="w-full px-3 py-2 rounded-xl text-xs font-semibold bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-600 text-slate-900 dark:text-white focus:outline-none focus:border-blue-600"
                    />
                    <span className="text-[10px] text-slate-400 block mt-0.5">
                      {editPhone.length}/10 {language === 'hi' ? 'अंक दर्ज' : 'digits entered'}
                    </span>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-400 mb-1">
                      {language === 'hi' ? 'फर्म / काम का डिस्प्ले नाम' : 'Firm / Business Display Name'}
                    </label>
                    <input
                      type="text"
                      value={editCompany}
                      onChange={(e) => setEditCompany(e.target.value)}
                      placeholder={language === 'hi' ? 'शर्मा कंस्ट्रक्शन' : 'Sharma Construction'}
                      className="w-full px-3 py-2 rounded-xl text-xs font-semibold bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-600 text-slate-900 dark:text-white focus:outline-none focus:border-blue-600"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-400 mb-1">
                      {language === 'hi' ? 'ईमेल / जीमेल' : 'Email / Gmail'}
                    </label>
                    <input
                      type="email"
                      value={editEmail}
                      onChange={(e) => setEditEmail(e.target.value)}
                      placeholder="contractor@gmail.com"
                      className="w-full px-3 py-2 rounded-xl text-xs font-semibold bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-600 text-slate-900 dark:text-white focus:outline-none focus:border-blue-600"
                    />
                  </div>

                  <div className="flex items-center gap-2 pt-1">
                    <button
                      type="submit"
                      className="flex-1 py-2 px-3 rounded-xl bg-blue-600 text-white font-bold text-xs flex items-center justify-center gap-1.5 hover:bg-blue-700 shadow-sm"
                    >
                      <Save className="w-3.5 h-3.5" />
                      <span>{language === 'hi' ? 'सेव करें' : 'Save Changes'}</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setIsEditingProfile(false)}
                      className="py-2 px-3 rounded-xl bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 font-bold text-xs hover:bg-slate-300"
                    >
                      {language === 'hi' ? 'रद्द करें' : 'Cancel'}
                    </button>
                  </div>
                </form>
              )}
            </div>

            {/* 2. Active Trade */}
            <div className="space-y-2">
              <label className="block font-extrabold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                {t('tradePreference')}
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 max-h-56 overflow-y-auto pr-1 custom-scrollbar">
                {ALL_TRADE_KEYS.map((cat) => {
                  const conf = TRADE_CONFIGS[cat] || TRADE_CONFIGS.construction;
                  const isSelected = trade === cat;
                  const getSettingTradeIcon = (tradeId: TradeCategory) => {
                    switch (tradeId) {
                      case 'construction': return <HardHat className="w-4 h-4 text-orange-500" />;
                      case 'plumbing': return <Wrench className="w-4 h-4 text-sky-500" />;
                      case 'electrical': return <Zap className="w-4 h-4 text-amber-500" />;
                      case 'painting': return <Paintbrush className="w-4 h-4 text-purple-500" />;
                      case 'carpentry': return <Hammer className="w-4 h-4 text-amber-700" />;
                      case 'fabrication': return <Shield className="w-4 h-4 text-slate-500" />;
                      case 'flooring': return <Layers className="w-4 h-4 text-teal-500" />;
                      case 'ceiling': return <Grid className="w-4 h-4 text-indigo-500" />;
                      case 'hvac': return <Wind className="w-4 h-4 text-cyan-500" />;
                      case 'interior': return <Sparkles className="w-4 h-4 text-rose-500" />;
                      case 'infra': return <Truck className="w-4 h-4 text-slate-700" />;
                      default: return <HardHat className="w-4 h-4 text-orange-500" />;
                    }
                  };

                  return (
                    <button
                      key={cat}
                      type="button"
                      onClick={() => setTrade(cat)}
                      className={`p-2.5 rounded-xl border text-center transition-all flex flex-col items-center gap-1 btn-tactile hover:-translate-y-0.5 ${
                        isSelected
                          ? 'border-blue-600 bg-blue-50/70 dark:bg-blue-950/40 shadow-xs font-bold text-blue-700 dark:text-blue-300 ring-1 ring-blue-500'
                          : 'border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                      }`}
                    >
                      {getSettingTradeIcon(cat)}
                      <span className="text-[11px] font-semibold line-clamp-1">
                        {language === 'hi' ? conf.nameHi.split(' ')[0] : conf.nameEn}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* 3. Language & Mode */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Language */}
              <div className="space-y-2">
                <label className="block font-extrabold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                  {t('languagePreference')}
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setLanguage('hi')}
                    className={`py-2 px-3 rounded-xl border font-bold transition-all text-center ${
                      language === 'hi'
                        ? 'border-orange-500 bg-orange-50 dark:bg-orange-950/40 text-orange-600 dark:text-orange-400'
                        : 'border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400'
                    }`}
                  >
                    हिंदी
                  </button>
                  <button
                    type="button"
                    onClick={() => setLanguage('en')}
                    className={`py-2 px-3 rounded-xl border font-bold transition-all text-center ${
                      language === 'en'
                        ? 'border-orange-500 bg-orange-50 dark:bg-orange-950/40 text-orange-600 dark:text-orange-400'
                        : 'border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400'
                    }`}
                  >
                    English
                  </button>
                </div>
              </div>

              {/* Mode - Strictly Light Mode (Dark and Auto removed as requested) */}
              <div className="space-y-2">
                <label className="block font-extrabold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                  {t('themePreference')}
                </label>
                <div className="py-2.5 px-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-bold flex items-center justify-center gap-2 shadow-2xs">
                  <Sun className="w-4 h-4 text-amber-500" />
                  <span className="text-xs">{language === 'hi' ? 'लाइट मोड (सक्रिय)' : 'Light Mode (Active)'}</span>
                </div>
              </div>
            </div>

            {/* 4. Security & App Lock (Fingerprint, PIN & Anti-Delete) */}
            <div className="p-4 rounded-2xl bg-indigo-50/60 dark:bg-indigo-950/30 border border-indigo-200 dark:border-indigo-900/60 space-y-3">
              <div className="flex items-center justify-between">
                <span className="font-extrabold text-xs uppercase tracking-wider text-indigo-900 dark:text-indigo-300 flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                  <span>{language === 'hi' ? 'सुरक्षा व ऐप लॉक' : 'Security & App Lock'}</span>
                </span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-indigo-200/80 dark:bg-indigo-900 text-indigo-800 dark:text-indigo-200">
                  APK Security
                </span>
              </div>

              {securityNotice && (
                <div className="p-2.5 rounded-lg bg-indigo-100 dark:bg-indigo-900/50 text-indigo-900 dark:text-indigo-200 text-xs flex items-center gap-1.5 font-semibold">
                  <CheckCircle2 className="w-3.5 h-3.5 text-indigo-600" />
                  <span>{securityNotice}</span>
                </div>
              )}

              {/* PIN Code Setup */}
              <div className="p-3 rounded-xl bg-white dark:bg-slate-800 border border-indigo-100 dark:border-indigo-950 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Lock className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                    <div>
                      <span className="font-bold text-xs text-slate-900 dark:text-white block">
                        {language === 'hi' ? 'पिन लॉक (PIN Lock)' : 'PIN / Password Lock'}
                      </span>
                      <span className="text-[10px] text-slate-500">
                        {language === 'hi' ? 'ऐप खोलने व डेटा सुरक्षा हेतु' : 'Protects app opening & settings'}
                      </span>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={handleTogglePinLock}
                    className={`w-10 h-6 rounded-full transition-colors relative p-0.5 ${
                      isPinLockEnabled ? 'bg-indigo-600' : 'bg-slate-300 dark:bg-slate-700'
                    }`}
                  >
                    <div
                      className={`w-5 h-5 rounded-full bg-white transition-transform ${
                        isPinLockEnabled ? 'translate-x-4' : 'translate-x-0'
                      }`}
                    />
                  </button>
                </div>

                {isPinLockEnabled && (
                  <div className="flex items-center gap-2 pt-1 border-t border-slate-100 dark:border-slate-700">
                    <input
                      type="password"
                      maxLength={6}
                      value={pinCode}
                      onChange={(e) => setPinCode(e.target.value.replace(/\D/g, ''))}
                      placeholder={
                        account?.pinLock
                          ? (language === 'hi' ? 'नया पिन बदलें (4-6 अंक)' : 'Change PIN (4-6 digits)')
                          : (language === 'hi' ? '4 अंकों का पिन (उदा. 1234)' : '4-digit PIN (e.g. 1234)')
                      }
                      className="flex-1 px-3 py-1.5 rounded-lg text-xs font-mono font-bold bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:border-indigo-600"
                    />
                    <button
                      type="button"
                      onClick={handleSavePin}
                      className="px-3 py-1.5 rounded-lg text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700"
                    >
                      {language === 'hi' ? 'सेव' : 'Save PIN'}
                    </button>
                  </div>
                )}
              </div>

              {/* Fingerprint / Biometric Lock */}
              <div className="p-3 rounded-xl bg-white dark:bg-slate-800 border border-indigo-100 dark:border-indigo-950 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Fingerprint className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                  <div>
                    <span className="font-bold text-xs text-slate-900 dark:text-white block">
                      {language === 'hi' ? 'फिंगरप्रिंट लॉक' : 'Fingerprint Lock'}
                    </span>
                    <span className="text-[10px] text-slate-500">
                      {hasBiometricSupport
                        ? language === 'hi' ? 'डिवाइस के फिंगरप्रिंट सेंसर से अनलॉक' : 'Uses phone fingerprint / biometrics'
                        : language === 'hi' ? 'हार्डवेयर सेंसर उपलब्ध नहीं (पिन काम करेगा)' : 'Sensor unavailable, PIN fallback active'}
                    </span>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={handleToggleBiometric}
                  className={`w-10 h-6 rounded-full transition-colors relative p-0.5 ${
                    isBiometricEnabled ? 'bg-indigo-600' : 'bg-slate-300 dark:bg-slate-700'
                  }`}
                >
                  <div
                    className={`w-5 h-5 rounded-full bg-white transition-transform ${
                      isBiometricEnabled ? 'translate-x-4' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>

              {/* Anti-Deletion & Reset Protection */}
              <div className="p-3 rounded-xl bg-white dark:bg-slate-800 border border-indigo-100 dark:border-indigo-950 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <ShieldAlert className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                  <div>
                    <span className="font-bold text-xs text-slate-900 dark:text-white block">
                      {language === 'hi' ? 'एंटी-डिलीट सुरक्षा (Anti-Delete Protection)' : 'Anti-Delete & Wipe Protection'}
                    </span>
                    <span className="text-[10px] text-slate-500">
                      {language === 'hi'
                        ? 'साइट पर कोई गलती से ऐप व डेटा डिलीट न कर सके'
                        : 'Blocks accidental uninstall & restricts data reset'}
                    </span>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={handleToggleAntiDelete}
                  className={`w-10 h-6 rounded-full transition-colors relative p-0.5 ${
                    isAntiDeleteEnabled ? 'bg-indigo-600' : 'bg-slate-300 dark:bg-slate-700'
                  }`}
                >
                  <div
                    className={`w-5 h-5 rounded-full bg-white transition-transform ${
                      isAntiDeleteEnabled ? 'translate-x-4' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>
            </div>

            {/* 5. Device Transfer & Data Backup (JSON Export / Import) */}
            <div className="p-4 rounded-2xl bg-emerald-50/60 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-900/60 space-y-3">
              <div className="flex items-center justify-between">
                <span className="font-extrabold text-xs uppercase tracking-wider text-emerald-900 dark:text-emerald-300 flex items-center gap-1.5">
                  <Download className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                  <span>{language === 'hi' ? 'डेटा बैकअप व ट्रांसफर' : 'Data Backup & Device Transfer'}</span>
                </span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-200/80 dark:bg-emerald-900 text-emerald-800 dark:text-emerald-200">
                  100% Offline
                </span>
              </div>

              <p className="text-[11px] text-slate-600 dark:text-slate-400">
                {language === 'hi'
                  ? 'जब आप नया फोन लें या डिवाइस बदलें, तो यहाँ से बैकअप डाउनलोड करें और नए फोन में लोड कर लें। कोई इंटरनेट नहीं चाहिए।'
                  : 'Switching devices? Export your entire offline database and import it on your new phone without internet.'}
              </p>

              {backupStatus && (
                <div className="p-2.5 rounded-lg bg-emerald-100 dark:bg-emerald-900/50 text-emerald-900 dark:text-emerald-200 text-xs font-semibold flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                  <span>{backupStatus}</span>
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                <button
                  type="button"
                  onClick={handleExportBackup}
                  className="p-3 rounded-xl bg-white dark:bg-slate-800 border border-emerald-300 dark:border-emerald-800 hover:bg-emerald-50 dark:hover:bg-emerald-950/50 text-emerald-800 dark:text-emerald-300 font-bold flex items-center justify-center gap-2 shadow-xs transition-colors"
                >
                  <Download className="w-4 h-4 text-emerald-600" />
                  <span>{language === 'hi' ? 'बैकअप डाउनलोड करें (JSON)' : 'Export Backup File'}</span>
                </button>

                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="p-3 rounded-xl bg-white dark:bg-slate-800 border border-emerald-300 dark:border-emerald-800 hover:bg-emerald-50 dark:hover:bg-emerald-950/50 text-emerald-800 dark:text-emerald-300 font-bold flex items-center justify-center gap-2 shadow-xs transition-colors"
                >
                  <Upload className="w-4 h-4 text-emerald-600" />
                  <span>{language === 'hi' ? 'बैकअप रीस्टोर करें' : 'Restore from Backup'}</span>
                </button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".json,application/json"
                  className="hidden"
                  onChange={handleImportBackup}
                />
              </div>
            </div>

            {/* 6. Interactive Tutorial Action */}
            <div>
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onReplayTutorial();
                }}
                className="w-full p-3 rounded-2xl bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-900 text-blue-800 dark:text-blue-300 font-bold flex items-center justify-between transition-all hover:bg-blue-100 dark:hover:bg-blue-950/50"
              >
                <div className="flex items-center gap-2">
                  <HelpCircle className="w-4 h-4 text-blue-500" />
                  <span>{language === 'hi' ? 'ट्यूटोरियल फिर से देखें' : 'Show Interactive Tutorial Again'}</span>
                </div>
                <span className="text-[11px] font-extrabold text-blue-600">Replay →</span>
              </button>
            </div>

            {/* 7. Data Tools (No '&' or '/') */}
            <div className="pt-4 border-t border-slate-200 dark:border-slate-800 space-y-3">
              <span className="font-extrabold text-slate-500 uppercase tracking-wider block">
                {language === 'hi' ? 'डेटा टूल्स' : 'Data Tools'}
              </span>

              {/* Load Sample Demo Data (Opt-In) */}
              <button
                type="button"
                onClick={() => setIsConfirmSampleOpen(true)}
                className="w-full p-3 rounded-2xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900 text-amber-900 dark:text-amber-300 font-bold flex items-center justify-between transition-all hover:bg-amber-100 dark:hover:bg-amber-950/50"
              >
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-amber-500" />
                  <span>
                    {language === 'hi' ? '⚡ नमूना डेटा लोड करें (Sample Data)' : '⚡ Load Sample Data'}
                  </span>
                </div>
                <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded bg-amber-200/80 dark:bg-amber-900 text-amber-900 dark:text-amber-200">
                  Opt-In
                </span>
              </button>

              {/* Clear All Data / Reset App */}
              <button
                type="button"
                onClick={handleRequestClearData}
                className="w-full p-3 rounded-2xl bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900 text-red-700 dark:text-red-400 font-bold flex items-center justify-between transition-all hover:bg-red-100 dark:hover:bg-red-950/50"
              >
                <div className="flex items-center gap-2">
                  <Trash2 className="w-4 h-4 text-red-500" />
                  <span>
                    {language === 'hi' ? '⚠️ सभी डेटा हटाएं (Clear All Data)' : '⚠️ Clear All Data (Start Empty)'}
                  </span>
                </div>
                <span className="text-[10px] font-black uppercase text-red-600">Wipe Clean</span>
              </button>
            </div>

            {/* 8. Log Out / Switch Account */}
            <div className="pt-2">
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onLogOut();
                }}
                className="w-full py-3 px-4 rounded-xl text-xs font-bold text-red-700 dark:text-red-400 bg-red-50 dark:bg-red-950/40 hover:bg-red-100 dark:hover:bg-red-900/50 border border-red-200 dark:border-red-900 flex items-center justify-center gap-2 transition-colors"
              >
                <LogOut className="w-4 h-4" />
                <span>{language === 'hi' ? 'लॉगआउट करें' : 'Log Out Account'}</span>
              </button>
            </div>

          </div>

        </div>
      </div>

      {/* PIN Verification Modal for Anti-Delete / Clear All Data */}
      {pinPromptOpen && (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm" onClick={() => setPinPromptOpen(false)} />
          <div className="relative z-10 bg-white dark:bg-slate-900 w-full max-w-sm rounded-2xl p-5 border border-slate-200 dark:border-slate-800 shadow-2xl space-y-4">
            <div className="flex items-center gap-2 text-indigo-600 dark:text-indigo-400">
              <Lock className="w-5 h-5" />
              <h3 className="font-extrabold text-sm text-slate-900 dark:text-white">
                {language === 'hi' ? 'एंटी-डिलीट सुरक्षा पिन' : 'Security PIN Required'}
              </h3>
            </div>
            <p className="text-xs text-slate-500">
              {language === 'hi'
                ? 'डेटा हटाने के लिए अपना सुरक्षा पिन दर्ज करें:'
                : 'Enter your security PIN to authorize wiping data:'}
            </p>
            {pinError && (
              <p className="text-xs text-red-600 font-semibold">{pinError}</p>
            )}
            <input
              type="password"
              autoFocus
              maxLength={6}
              value={enteredPin}
              onChange={(e) => setEnteredPin(e.target.value)}
              placeholder="••••"
              className="w-full px-3 py-2 text-center font-mono font-bold text-base rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none"
            />
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleVerifyPinForClear}
                className="flex-1 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold text-xs"
              >
                {language === 'hi' ? 'सत्यापित करें' : 'Verify'}
              </button>
              <button
                type="button"
                onClick={() => setPinPromptOpen(false)}
                className="py-2 px-3 rounded-xl bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold text-xs"
              >
                {language === 'hi' ? 'रद्द' : 'Cancel'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Export Passphrase / Option Modal for Encrypted vs. Clean Backup */}
      {isEncryptExportModalOpen && (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-4">
          <div
            className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm"
            onClick={() => {
              setIsEncryptExportModalOpen(false);
              setExportPassphrase('');
              setConfirmExportPassphrase('');
              setExportError('');
            }}
          />
          <div className="relative z-10 bg-white dark:bg-slate-900 w-full max-w-sm rounded-2xl p-5 border border-slate-200 dark:border-slate-800 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400">
                <Download className="w-5 h-5" />
                <h3 className="font-extrabold text-sm text-slate-900 dark:text-white">
                  {language === 'hi' ? 'डेटा बैकअप विकल्प' : 'Backup Export Options'}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => {
                  setIsEncryptExportModalOpen(false);
                  setExportPassphrase('');
                  setConfirmExportPassphrase('');
                  setExportError('');
                }}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {exportError && (
              <p className="text-xs text-red-600 dark:text-red-400 font-semibold">{exportError}</p>
            )}

            {/* Option 1: Encrypted Backup */}
            <form onSubmit={handleDownloadEncryptedBackup} className="p-3.5 rounded-xl bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-900/60 space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="font-bold text-xs text-emerald-900 dark:text-emerald-300 flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-emerald-600" />
                  {language === 'hi' ? 'एन्क्रिप्टेड बैकअप (क्रेडेंशियल सहित)' : 'Encrypted Backup (Full Restore)'}
                </span>
                <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-emerald-200/80 dark:bg-emerald-900 text-emerald-800 dark:text-emerald-200">
                  AES-256
                </span>
              </div>
              <p className="text-[11px] text-slate-600 dark:text-slate-400 leading-relaxed">
                {language === 'hi'
                  ? 'नए फोन में पासवर्ड व पिन सहित पूरा डेटा रीस्टोर करने हेतु। पासवर्ड दर्ज करें:'
                  : 'Preserves account credentials and PIN for full restore on a new device. Enter passphrase:'}
              </p>
              <input
                type="password"
                value={exportPassphrase}
                onChange={(e) => setExportPassphrase(e.target.value)}
                placeholder={language === 'hi' ? 'पासवर्ड (कम से कम 4 अक्षर)' : 'Passphrase (min 4 chars)'}
                className="w-full px-3 py-1.5 text-xs rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:border-emerald-600"
              />
              <input
                type="password"
                value={confirmExportPassphrase}
                onChange={(e) => setConfirmExportPassphrase(e.target.value)}
                placeholder={language === 'hi' ? 'पासवर्ड पुनः दर्ज करें' : 'Confirm passphrase'}
                className="w-full px-3 py-1.5 text-xs rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:border-emerald-600"
              />
              <button
                type="submit"
                className="w-full py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center justify-center gap-1.5 transition-colors"
              >
                <Lock className="w-3.5 h-3.5" />
                <span>{language === 'hi' ? 'एन्क्रिप्टेड बैकअप डाउनलोड करें' : 'Export Encrypted Backup'}</span>
              </button>
            </form>

            {/* Option 2: Clean Backup */}
            <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700 space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-bold text-xs text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                  <Download className="w-4 h-4 text-slate-500" />
                  {language === 'hi' ? 'स्वच्छ बैकअप (बिना क्रेडेंशियल)' : 'Clean Backup (Credentials Stripped)'}
                </span>
                <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300">
                  Sharing
                </span>
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">
                {language === 'hi'
                  ? 'सुरक्षा कारणों से इस बैकअप से पासवर्ड व पिन हटा दिए जाते हैं। नए फोन में रीस्टोर करने पर क्रेडेंशियल उपलब्ध नहीं होंगे।'
                  : 'Strips passwords and PINs for safe sharing. Note: Does not preserve credentials needed for direct account transfer.'}
              </p>
              <button
                type="button"
                onClick={handleDownloadCleanBackup}
                className="w-full py-2 rounded-lg bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 font-bold text-xs flex items-center justify-center gap-1.5 transition-colors"
              >
                <Download className="w-3.5 h-3.5 text-slate-500" />
                <span>{language === 'hi' ? 'स्वच्छ बैकअप डाउनलोड करें' : 'Export Clean Backup'}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Decrypt Passphrase Modal for Encrypted Backup Restore */}
      {isDecryptModalOpen && (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm" onClick={() => setIsDecryptModalOpen(false)} />
          <div className="relative z-10 bg-white dark:bg-slate-900 w-full max-w-sm rounded-2xl p-5 border border-slate-200 dark:border-slate-800 shadow-2xl space-y-4">
            <div className="flex items-center gap-2 text-blue-600 dark:text-blue-400">
              <Lock className="w-5 h-5" />
              <h3 className="font-extrabold text-sm text-slate-900 dark:text-white">
                {language === 'hi' ? 'एन्क्रिप्टेड बैकअप पासवर्ड' : 'Encrypted Backup Password'}
              </h3>
            </div>
            <p className="text-xs text-slate-500">
              {language === 'hi'
                ? 'यह बैकअप सुरक्षित रूप से एन्क्रिप्टेड है। कृपया रीस्टोर करने के लिए पासवर्ड दर्ज करें:'
                : 'This backup is password-protected. Enter the passphrase used during export to restore:'}
            </p>
            {decryptError && (
              <p className="text-xs text-red-600 font-semibold">{decryptError}</p>
            )}
            <input
              type="password"
              autoFocus
              value={restorePassphrase}
              onChange={(e) => setRestorePassphrase(e.target.value)}
              placeholder="••••••••"
              className="w-full px-3 py-2 text-center font-mono font-bold text-base rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none"
            />
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleConfirmDecryptAndRestore}
                className="flex-1 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs"
              >
                {language === 'hi' ? 'डिक्रिप्ट और रीस्टोर' : 'Decrypt & Restore'}
              </button>
              <button
                type="button"
                onClick={() => {
                  setIsDecryptModalOpen(false);
                  setPendingEncryptedContent(null);
                  setRestorePassphrase('');
                }}
                className="py-2 px-3 rounded-xl bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold text-xs"
              >
                {language === 'hi' ? 'रद्द' : 'Cancel'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Confirmation Modal for Unencrypted Backup Restore */}
      {isConfirmRestoreOpen && (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm" onClick={handleCancelRestore} />
          <div className="relative z-10 bg-white dark:bg-slate-900 w-full max-w-sm rounded-2xl p-5 border border-slate-200 dark:border-slate-800 shadow-2xl space-y-4">
            <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400">
              <Upload className="w-5 h-5" />
              <h3 className="font-extrabold text-sm text-slate-900 dark:text-white">
                {language === 'hi' ? 'डेटा रीस्टोर की पुष्टि करें' : 'Confirm Database Restore'}
              </h3>
            </div>
            
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              {language === 'hi'
                ? 'यह बैकअप आपके वर्तमान डेटाबेस में मर्ज होगा। समान आईडी वाले रिकॉर्ड ओवरराइट हो जाएंगे, जबकि अन्य रिकॉर्ड सुरक्षित रहेंगे।'
                : 'This backup will merge into your database. Existing records with identical IDs will be overwritten, while unaffected records remain preserved.'}
            </p>

            {pendingRestoreMeta && (
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 space-y-1 text-xs">
                <div className="flex justify-between text-slate-500">
                  <span>{language === 'hi' ? 'साइट्स संख्या:' : 'Sites in Backup:'}</span>
                  <span className="font-bold text-slate-900 dark:text-white">{pendingRestoreMeta.sitesCount}</span>
                </div>
                <div className="flex justify-between text-slate-500">
                  <span>{language === 'hi' ? 'टूल्स रिकॉर्ड्स:' : 'Tools in Backup:'}</span>
                  <span className="font-bold text-slate-900 dark:text-white">{pendingRestoreMeta.toolsCount}</span>
                </div>
                <div className="flex justify-between text-slate-500">
                  <span>{language === 'hi' ? 'बकाया (Dues):' : 'Dues in Backup:'}</span>
                  <span className="font-bold text-slate-900 dark:text-white">{pendingRestoreMeta.duesCount}</span>
                </div>
                {pendingRestoreMeta.exportedAt && (
                  <div className="flex justify-between text-slate-500 pt-1 border-t border-slate-200 dark:border-slate-700 text-[10px]">
                    <span>{language === 'hi' ? 'एक्सपोर्ट दिनांक:' : 'Exported Date:'}</span>
                    <span className="font-mono text-slate-700 dark:text-slate-300">
                      {new Date(pendingRestoreMeta.exportedAt).toLocaleDateString()}
                    </span>
                  </div>
                )}
              </div>
            )}

            <div className="flex items-center gap-2 pt-1">
              <button
                type="button"
                onClick={handleConfirmRestore}
                className="flex-1 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-sm transition-colors"
              >
                {language === 'hi' ? 'हाँ, रीस्टोर करें' : 'Confirm & Restore'}
              </button>
              <button
                type="button"
                onClick={handleCancelRestore}
                className="py-2 px-3 rounded-xl bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold text-xs"
              >
                {language === 'hi' ? 'रद्द' : 'Cancel'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Confirmation Modal for Clearing All Data */}
      <ConfirmDeleteModal
        isOpen={isConfirmClearOpen}
        onClose={() => setIsConfirmClearOpen(false)}
        onConfirm={() => {
          onClearAllData();
          onClose();
        }}
        title={language === 'hi' ? 'सभी डेटा हटाने की पुष्टि' : 'Clear All Data & Reset'}
        message={
          language === 'hi'
            ? 'क्या आप वाकई ऐप का सारा डेटा (साइट्स, टूल्स, हाजिरी, मटेरियल आदि) पूरी तरह हटाना चाहते हैं? यह ऐप को एकदम खाली नए रूप में शुरू करेगा।'
            : 'Are you sure you want to delete all sites, tools, materials, labour records and dues? The app will reset to a completely empty clean state.'
        }
      />

      {/* Confirmation Modal for Loading Sample Data */}
      <ConfirmDeleteModal
        isOpen={isConfirmSampleOpen}
        onClose={() => setIsConfirmSampleOpen(false)}
        onConfirm={() => {
          onLoadSampleData();
          onClose();
        }}
        title={language === 'hi' ? 'नमूना डेटा लोड करें?' : 'Load Sample Reviewer Data?'}
        message={
          language === 'hi'
            ? 'यह आपके खाते में परीक्षण के लिए नमूना साइट्स (शर्मा विला आदि), औजार व हिसाब लोड करेगा। क्या आप आगे बढ़ना चाहते हैं?'
            : 'This will populate your workspace with realistic contractor sample sites, tools, materials, and completed site dues for demonstration.'
        }
      />
    </>
  );
};
