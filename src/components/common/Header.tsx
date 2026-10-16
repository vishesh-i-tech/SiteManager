import React from 'react';
import { useTheme } from '../../core/theme/ThemeContext';
import {
  Bell,
  SlidersHorizontal,
  Search,
  HardHat,
  Wrench,
  Zap,
  Paintbrush,
  Hammer,
} from 'lucide-react';
import { TradeCategory } from '../../types';

interface HeaderProps {
  onOpenVoiceModal?: () => void;
  onOpenNotifications: () => void;
  onOpenSettings: () => void;
  unreadRemindersCount?: number;
  onOpenTutorial?: () => void;
  onResetData?: () => void;
  contractorName?: string;
  onLogout?: () => void;
  searchQuery?: string;
  onSearchChange?: (query: string) => void;
  showSearchBar?: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  onOpenNotifications,
  onOpenSettings,
  unreadRemindersCount = 2,
  contractorName = 'Alex Carter',
  searchQuery = '',
  onSearchChange,
  showSearchBar = true,
}) => {
  const { trade } = useTheme();

  const initials = contractorName
    ? contractorName
        .split(' ')
        .map((n) => n[0])
        .join('')
        .slice(0, 2)
        .toUpperCase()
    : 'AC';

  return (
    <header className="w-full bg-[#f4f7fc] dark:bg-slate-950 transition-colors pt-2 px-3 pb-2 space-y-2.5">
      
      {/* Top Greeting Row (Matching Screen 1) */}
      <div className="flex items-center justify-between">
        
        {/* Left: User Avatar & Greeting */}
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-blue-600 to-indigo-500 text-white font-extrabold text-sm flex items-center justify-center shrink-0 shadow-[0_4px_12px_rgba(37,99,235,0.25)] border-2 border-white dark:border-slate-800">
            {initials}
          </div>

          <div className="flex flex-col min-w-0">
            <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400 leading-tight">
              Hello 👋
            </span>
            <span className="font-extrabold text-sm text-slate-900 dark:text-white truncate font-heading tracking-tight leading-tight">
              {contractorName}
            </span>
          </div>
        </div>

        {/* Right: Notification Bell & Filter / Settings Button */}
        <div className="flex items-center gap-2 shrink-0">
          
          {/* Bell Icon with Badge */}
          <button
            onClick={onOpenNotifications}
            className="relative w-9 h-9 rounded-full bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-2xs flex items-center justify-center text-slate-700 dark:text-slate-200 hover:bg-slate-50 active:scale-95 transition-all cursor-pointer"
            title="Notifications"
          >
            <Bell className="w-4 h-4" />
            {unreadRemindersCount > 0 && (
              <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-[#1877F2] text-white rounded-full text-[9px] font-black flex items-center justify-center border-2 border-white dark:border-slate-900 shadow-xs">
                {unreadRemindersCount}
              </span>
            )}
          </button>

          {/* Filter / Settings Button */}
          <button
            onClick={onOpenSettings}
            className="w-9 h-9 rounded-full bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-2xs flex items-center justify-center text-slate-700 dark:text-slate-200 hover:bg-slate-50 active:scale-95 transition-all cursor-pointer"
            title="Filters & Settings"
          >
            <SlidersHorizontal className="w-4 h-4" />
          </button>

        </div>

      </div>

      {/* Rounded Search Bar (Matching Screen 1) */}
      {showSearchBar && (
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
            <Search className="w-4 h-4" />
          </div>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange?.(e.target.value)}
            placeholder="Search for any service..."
            className="w-full pl-10 pr-10 py-2.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 text-xs text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-[0_2px_12px_rgba(0,0,0,0.03)] transition-all"
          />
          <button
            onClick={onOpenSettings}
            className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 cursor-pointer"
          >
            <SlidersHorizontal className="w-4 h-4" />
          </button>
        </div>
      )}

    </header>
  );
};
