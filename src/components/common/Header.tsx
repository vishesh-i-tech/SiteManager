import React from 'react';
import { useTheme } from '../../core/theme/ThemeContext';
import { SiteSaathiLogo } from './SiteSaathiLogo';
import {
  HardHat,
  Wrench,
  Zap,
  Globe,
  Sun,
  Moon,
  Monitor,
  Sparkles,
  ExternalLink,
  ShieldCheck,
  RotateCcw,
  Bell,
  Settings,
} from 'lucide-react';
import { TradeCategory } from '../../types';

interface HeaderProps {
  onOpenVoiceModal: () => void;
  onOpenNotifications: () => void;
  onOpenSettings: () => void;
  unreadRemindersCount?: number;
  isLandingPage: boolean;
  onToggleLandingPage: () => void;
  onOpenTutorial: () => void;
  onResetData: () => void;
  contractorName?: string;
}

export const Header: React.FC<HeaderProps> = ({
  onOpenVoiceModal,
  onOpenNotifications,
  onOpenSettings,
  unreadRemindersCount = 0,
  isLandingPage,
  onToggleLandingPage,
  onOpenTutorial,
  onResetData,
  contractorName,
}) => {
  const { trade, setTrade, themeMode, setThemeMode, language, setLanguage, t, tradeConfig, isDarkMode } = useTheme();

  const getTradeIcon = (cat: TradeCategory) => {
    switch (cat) {
      case 'construction':
        return <HardHat className="w-4 h-4 text-orange-500" />;
      case 'plumbing':
        return <Wrench className="w-4 h-4 text-sky-500" />;
      case 'electrical':
        return <Zap className="w-4 h-4 text-amber-500" />;
    }
  };

  return (
    <header className="sticky top-0 z-40 w-full bg-white/90 dark:bg-slate-900/90 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-2">
          
          {/* Logo & Trade Badge */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => onToggleLandingPage()}
              className="flex items-center gap-2.5 group text-left focus:outline-none"
              title="SiteSaathi Home"
            >
              <SiteSaathiLogo size="md" />
              <div className="hidden sm:block">
                <div className="flex items-center gap-2">
                  <span className="font-black text-lg tracking-tight font-heading text-slate-900 dark:text-white">
                    SiteSaathi
                  </span>
                  <span className="text-[11px] font-bold px-2 py-0.5 rounded-full border" style={{ backgroundColor: tradeConfig.badgeBg, color: tradeConfig.badgeText, borderColor: tradeConfig.badgeBg }}>
                    {language === 'hi' ? tradeConfig.nameHi.split(' ')[0] : tradeConfig.nameEn.split(' ')[0]}
                  </span>
                </div>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium -mt-0.5">
                  {language === 'hi' ? 'स्मार्ट ठेकेदार साथी' : 'Multi-Trade Contractor OS'}
                </p>
              </div>
            </button>
          </div>

          {/* Quick Trade Switcher Pills (Desktop & Tablet) */}
          <div className="hidden md:flex items-center bg-slate-100 dark:bg-slate-800 p-1 rounded-xl border border-slate-200/80 dark:border-slate-700/80">
            {(['construction', 'plumbing', 'electrical'] as TradeCategory[]).map((cat) => (
              <button
                key={cat}
                onClick={() => setTrade(cat)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                  trade === cat
                    ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                {getTradeIcon(cat)}
                <span className="capitalize">{cat}</span>
              </button>
            ))}
          </div>

          {/* Action Center: Language, Theme, Landing toggle, Reminder bell, Mic */}
          <div className="flex items-center gap-1.5 sm:gap-2">
            
            {/* Landing / App View Switcher */}
            <button
              onClick={onToggleLandingPage}
              className={`px-2.5 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1 border ${
                isLandingPage
                  ? 'bg-orange-50 dark:bg-orange-950/40 text-orange-600 dark:text-orange-400 border-orange-200 dark:border-orange-800'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-200'
              }`}
              title={isLandingPage ? 'Switch to App Dashboard' : 'View Public Portfolio Showcase'}
            >
              <ExternalLink className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">{isLandingPage ? t('livePreview') : t('landingPage')}</span>
            </button>

            {/* Language Toggle (Hindi / English) */}
            <button
              onClick={() => setLanguage(language === 'hi' ? 'en' : 'hi')}
              className="px-2.5 py-1.5 rounded-lg text-xs font-bold bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 flex items-center gap-1 transition-all btn-tactile"
              title="Toggle Language / भाषा बदलें"
            >
              <Globe className="w-3.5 h-3.5 text-blue-500" />
              <span>{language === 'hi' ? 'EN' : 'हिंदी'}</span>
            </button>

            {/* Theme Mode Toggle */}
            <button
              onClick={() => setThemeMode(themeMode === 'light' ? 'dark' : themeMode === 'dark' ? 'system' : 'light')}
              className="p-2 rounded-lg text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 transition-all btn-tactile"
              title={`Theme: ${themeMode}`}
            >
              {themeMode === 'light' ? <Sun className="w-4 h-4 text-amber-500" /> : themeMode === 'dark' ? <Moon className="w-4 h-4 text-indigo-400" /> : <Monitor className="w-4 h-4 text-slate-400" />}
            </button>

            {/* Notifications / Reminders Bell */}
            <button
              onClick={onOpenNotifications}
              className="relative p-2 rounded-lg text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 transition-all btn-tactile"
              title="Reminders & Overdue Alerts"
            >
              <Bell className="w-4 h-4" />
              {unreadRemindersCount > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white rounded-full text-[10px] font-bold flex items-center justify-center animate-pulse">
                  {unreadRemindersCount}
                </span>
              )}
            </button>

            {/* Settings & Account Config */}
            <button
              onClick={onOpenSettings}
              className="p-2 rounded-lg text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 transition-all btn-tactile flex items-center gap-1.5"
              title="App Settings, Reset Data & Account"
            >
              <Settings className="w-4 h-4 text-slate-600 dark:text-slate-300" />
              {contractorName && (
                <span className="hidden lg:inline text-xs font-bold text-slate-700 dark:text-slate-300 max-w-[80px] truncate">
                  {contractorName.split(' ')[0]}
                </span>
              )}
            </button>

            {/* Voice Assistant Mic Trigger */}
            <button
              onClick={onOpenVoiceModal}
              className="px-3 py-1.5 rounded-lg font-bold text-xs text-white shadow-md flex items-center gap-1.5 transition-all btn-tactile glow-theme"
              style={{ backgroundColor: tradeConfig.primaryColor }}
            >
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-white"></span>
              </span>
              <span>{language === 'hi' ? 'बोलकर भरें' : 'Voice'}</span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
