import React from 'react';
import { useTheme } from '../../core/theme/ThemeContext';
import {
  LayoutDashboard,
  Building2,
  Users,
} from 'lucide-react';

export type ActiveTab = 'dashboard' | 'sites' | 'labour' | 'tools' | 'materials' | 'machinery' | 'dues' | 'reports';

interface BottomNavProps {
  activeTab: ActiveTab;
  onTabChange: (tab: ActiveTab) => void;
  onOpenQuickAdd?: () => void;
}

export const BottomNav: React.FC<BottomNavProps> = ({
  activeTab,
  onTabChange,
}) => {
  const { t } = useTheme();

  const mainNavItems = [
    { id: 'dashboard' as ActiveTab, label: 'Home', icon: LayoutDashboard },
    { id: 'sites' as ActiveTab, label: 'Sites', icon: Building2 },
    { id: 'labour' as ActiveTab, label: 'Workers', icon: Users },
  ];

  return (
    <div className="sticky bottom-2 sm:bottom-3 left-0 right-0 z-40 px-3 pointer-events-none pb-safe">
      <div className="max-w-[260px] sm:max-w-[280px] mx-auto bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl border border-slate-200/80 dark:border-slate-800 rounded-full py-1.5 px-3 shadow-[0_12px_40px_rgba(0,0,0,0.14)] flex items-center justify-between pointer-events-auto transition-all">
        {mainNavItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onTabChange(item.id)}
              className="relative flex flex-col items-center justify-center p-1 rounded-full transition-all group cursor-pointer focus:outline-none"
              title={item.label}
            >
              {isActive ? (
                <div className="w-10 h-10 rounded-full bg-gradient-to-r from-[#1877F2] to-[#0084FF] text-white flex items-center justify-center shadow-[0_4px_14px_rgba(24,119,242,0.45)] transform scale-105 transition-all">
                  <Icon className="w-5 h-5 stroke-[2.3]" />
                </div>
              ) : (
                <div className="w-10 h-10 rounded-full flex items-center justify-center text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800/60 transition-all">
                  <Icon className="w-5 h-5 stroke-[1.8]" />
                </div>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
};
