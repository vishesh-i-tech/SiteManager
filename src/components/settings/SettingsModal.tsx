import React, { useState } from 'react';
import { useTheme } from '../../core/theme/ThemeContext';
import { ContractorAccount, TradeCategory, ThemeMode, Language } from '../../types';
import { TRADE_CONFIGS } from '../../core/theme/tradeConfigs';
import { db } from '../../core/db/database';
import { ConfirmDeleteModal } from '../common/ConfirmDeleteModal';
import {
  Settings,
  User,
  Phone,
  Building,
  Globe,
  Sun,
  Moon,
  Monitor,
  HelpCircle,
  RotateCcw,
  Sparkles,
  Trash2,
  LogOut,
  X,
  CheckCircle2,
  HardHat,
  Wrench,
  Zap,
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

  const [isConfirmClearOpen, setIsConfirmClearOpen] = useState(false);
  const [isConfirmSampleOpen, setIsConfirmSampleOpen] = useState(false);

  if (!isOpen) return null;

  return (
    <>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto">
        {/* Separate Backdrop Layer */}
        <div className="fixed inset-0 bg-slate-950/75 backdrop-blur-sm transition-opacity" onClick={onClose} />

        {/* Interactive Sharp Dialog Container */}
        <div className="relative z-10 bg-white dark:bg-slate-900 w-full max-w-xl rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col max-h-[92vh] animate-fade-in">
          
          {/* Header */}
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
                  {language === 'hi' ? 'प्रोफाइल, भाषा, थीम व डेटा नियंत्रण' : 'Profile, language, trade theming & data'}
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

          {/* Modal Content */}
          <div className="p-6 space-y-6 overflow-y-auto flex-1 text-xs">
            
            {/* 1. Account Profile Card */}
            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-extrabold text-xs uppercase tracking-wider text-slate-500">
                  {language === 'hi' ? 'ठेकेदार प्रोफाइल' : 'Contractor Profile'}
                </span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-green-100 dark:bg-green-950/60 text-green-700 dark:text-green-400">
                  Active
                </span>
              </div>

              <div className="pt-1 space-y-1">
                <h3 className="font-black text-base text-slate-900 dark:text-white">
                  {account?.name || 'Contractor'}
                </h3>
                <p className="text-slate-500 font-semibold flex items-center gap-1.5">
                  <Phone className="w-3.5 h-3.5 text-blue-500" />
                  {account?.phone || 'No phone'}
                </p>
                {account?.companyName && (
                  <p className="text-slate-500 font-semibold flex items-center gap-1.5">
                    <Building className="w-3.5 h-3.5 text-purple-500" />
                    {account.companyName}
                  </p>
                )}
              </div>
            </div>

            {/* 2. Trade Preference */}
            <div className="space-y-2">
              <label className="block font-extrabold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                {t('tradePreference')}
              </label>
              <div className="grid grid-cols-3 gap-2">
                {(['construction', 'plumbing', 'electrical'] as TradeCategory[]).map((cat) => {
                  const isSelected = trade === cat;
                  return (
                    <button
                      key={cat}
                      type="button"
                      onClick={() => setTrade(cat)}
                      className={`p-3 rounded-xl border text-center transition-all flex flex-col items-center gap-1 btn-tactile ${
                        isSelected
                          ? 'border-slate-900 dark:border-white bg-white dark:bg-slate-800 shadow-sm font-bold text-slate-900 dark:text-white'
                          : 'border-slate-200 dark:border-slate-800 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800'
                      }`}
                    >
                      {cat === 'construction' && <HardHat className="w-4 h-4 text-orange-500" />}
                      {cat === 'plumbing' && <Wrench className="w-4 h-4 text-sky-500" />}
                      {cat === 'electrical' && <Zap className="w-4 h-4 text-amber-500" />}
                      <span className="capitalize">{cat}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* 3. Language & Theme Mode Grid */}
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

              {/* Theme Mode */}
              <div className="space-y-2">
                <label className="block font-extrabold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                  {t('themePreference')}
                </label>
                <div className="grid grid-cols-3 gap-1.5">
                  {[
                    { id: 'light', label: 'Light', icon: Sun },
                    { id: 'dark', label: 'Dark', icon: Moon },
                    { id: 'system', label: 'Auto', icon: Monitor },
                  ].map((m) => {
                    const Icon = m.icon;
                    const isSelected = themeMode === m.id;
                    return (
                      <button
                        key={m.id}
                        type="button"
                        onClick={() => setThemeMode(m.id as ThemeMode)}
                        className={`py-2 rounded-xl border font-bold flex flex-col items-center gap-1 transition-all ${
                          isSelected
                            ? 'border-slate-900 dark:border-white bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-sm'
                            : 'border-slate-200 dark:border-slate-800 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800'
                        }`}
                      >
                        <Icon className="w-3.5 h-3.5" />
                        <span className="text-[10px]">{m.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* 4. Interactive Tutorial Action */}
            <div className="pt-2">
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
                  <span>{language === 'hi' ? 'ट्यूटोरियल फिर से देखें (Replay Guide)' : 'Show Interactive Tutorial Again'}</span>
                </div>
                <span className="text-[11px] font-extrabold text-blue-600">Replay →</span>
              </button>
            </div>

            {/* 5. Data Management & Recruiter Seeder */}
            <div className="pt-4 border-t border-slate-200 dark:border-slate-800 space-y-3">
              <span className="font-extrabold text-slate-500 uppercase tracking-wider block">
                {language === 'hi' ? 'डेटा व डेमो प्रबंधन' : 'Data Management & Demo Tools'}
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
                    {language === 'hi' ? '⚡ नमूना डेटा लोड करें (Load Sample Data)' : '⚡ Load Sample Data (For Reviewers)'}
                  </span>
                </div>
                <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded bg-amber-200/80 dark:bg-amber-900 text-amber-900 dark:text-amber-200">
                  Opt-In
                </span>
              </button>

              {/* Clear All Data / Reset App */}
              <button
                type="button"
                onClick={() => setIsConfirmClearOpen(true)}
                className="w-full p-3 rounded-2xl bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900 text-red-700 dark:text-red-400 font-bold flex items-center justify-between transition-all hover:bg-red-100 dark:hover:bg-red-950/50"
              >
                <div className="flex items-center gap-2">
                  <Trash2 className="w-4 h-4 text-red-500" />
                  <span>
                    {language === 'hi' ? '⚠️ सभी डेटा हटाएं (Clear All Data / Fresh Start)' : '⚠️ Clear All Data (Start Empty)'}
                  </span>
                </div>
                <span className="text-[10px] font-black uppercase text-red-600">Wipe Clean</span>
              </button>
            </div>

            {/* 6. Log Out / Switch Account */}
            <div className="pt-2">
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onLogOut();
                }}
                className="w-full py-2.5 px-4 rounded-xl text-xs font-bold text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 flex items-center justify-center gap-2 transition-colors"
              >
                <LogOut className="w-4 h-4" />
                <span>{language === 'hi' ? 'लॉगआउट / खाता बदलें' : 'Log Out / Switch Contractor Account'}</span>
              </button>
            </div>

          </div>

        </div>
      </div>

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
