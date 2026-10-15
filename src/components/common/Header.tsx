import React from 'react';
import { useTheme } from '../../core/theme/ThemeContext';
import { SiteSaathiLogo } from './SiteSaathiLogo';
import {
  HardHat,
  Wrench,
  Zap,
  Bell,
  MoreVertical,
  Paintbrush,
  Hammer,
  Shield,
  Layers,
  Grid,
  Wind,
  Sparkles,
  Truck,
} from 'lucide-react';
import { TradeCategory } from '../../types';

interface HeaderProps {
  onOpenVoiceModal: () => void;
  onOpenNotifications: () => void;
  onOpenSettings: () => void;
  unreadRemindersCount?: number;
  onOpenTutorial: () => void;
  onResetData: () => void;
  contractorName?: string;
  onLogout?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  onOpenNotifications,
  onOpenSettings,
  unreadRemindersCount = 0,
  contractorName,
  onLogout,
}) => {
  const { trade, language, tradeConfig } = useTheme();

  const getTradeIcon = (cat: TradeCategory) => {
    switch (cat) {
      case 'construction':
        return <HardHat className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />;
      case 'plumbing':
        return <Wrench className="w-3.5 h-3.5 text-sky-600 dark:text-sky-400" />;
      case 'electrical':
        return <Zap className="w-3.5 h-3.5 text-amber-500 dark:text-amber-400" />;
      case 'painting':
        return <Paintbrush className="w-3.5 h-3.5 text-purple-600 dark:text-purple-400" />;
      case 'carpentry':
        return <Hammer className="w-3.5 h-3.5 text-amber-700 dark:text-amber-500" />;
      case 'fabrication':
        return <Shield className="w-3.5 h-3.5 text-slate-600 dark:text-slate-400" />;
      case 'flooring':
        return <Layers className="w-3.5 h-3.5 text-teal-600 dark:text-teal-400" />;
      case 'ceiling':
        return <Grid className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />;
      case 'hvac':
        return <Wind className="w-3.5 h-3.5 text-cyan-600 dark:text-cyan-400" />;
      case 'interior':
        return <Sparkles className="w-3.5 h-3.5 text-rose-600 dark:text-rose-400" />;
      case 'infra':
        return <Truck className="w-3.5 h-3.5 text-slate-700 dark:text-slate-300" />;
      default:
        return <HardHat className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />;
    }
  };

  const initials = contractorName
    ? contractorName
        .split(' ')
        .map((n) => n[0])
        .join('')
        .slice(0, 2)
        .toUpperCase()
    : 'SS';

  return (
    <header className="sticky top-0 z-40 w-full bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 transition-colors">
      <div className="w-full px-3 py-2 flex items-center justify-between gap-2">
        
        {/* Left: App Identity / Contractor Avatar & Trade */}
        <div className="flex items-center gap-2 min-w-0">
          <div className="w-8 h-8 rounded-full bg-blue-600 text-white font-bold text-xs flex items-center justify-center shrink-0 shadow-sm">
            {initials}
          </div>

          <div className="min-w-0 flex flex-col">
            <div className="flex items-center gap-1.5">
              <span className="font-bold text-sm text-slate-900 dark:text-white truncate font-heading leading-tight">
                {contractorName || 'SiteSaathi'}
              </span>
            </div>
            
            {/* Trade Badge */}
            <div className="flex items-center gap-1 text-[11px] font-semibold text-blue-600 dark:text-blue-400 leading-none">
              {getTradeIcon(trade)}
              <span className="truncate">
                {language === 'hi' ? tradeConfig.nameHi.split(' ')[0] : tradeConfig.nameEn.split(' ')[0]}
              </span>
            </div>
          </div>
        </div>

        {/* Right: Clean Action Bar */}
        <div className="flex items-center gap-1.5 shrink-0">
          
          {/* Notifications Bell */}
          <button
            onClick={onOpenNotifications}
            className="relative p-1.5 rounded-lg text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 btn-tactile transition-colors"
            title="Notifications"
          >
            <Bell className="w-4 h-4" />
            {unreadRemindersCount > 0 && (
              <span className="absolute -top-0.5 -right-0.5 w-3.5 h-3.5 bg-blue-600 text-white rounded-full text-[9px] font-bold flex items-center justify-center">
                {unreadRemindersCount}
              </span>
            )}
          </button>

          {/* Menu / Settings Modal (3 Dots) */}
          <button
            onClick={onOpenSettings}
            className="p-1.5 rounded-lg text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 btn-tactile transition-colors"
            title="Settings"
          >
            <MoreVertical className="w-4 h-4" />
          </button>
        </div>
      </div>
    </header>
  );
};
