import React from 'react';
import { useTheme } from '../../core/theme/ThemeContext';
import {
  LayoutDashboard,
  Building2,
  Users,
  Wrench,
  Receipt,
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
  const { t, tradeConfig } = useTheme();

  const mainNavItems = [
    { id: 'dashboard' as ActiveTab, label: t('navDashboard'), icon: LayoutDashboard },
    { id: 'sites' as ActiveTab, label: t('navSites'), icon: Building2 },
    { id: 'labour' as ActiveTab, label: t('navLabour'), icon: Users },
    { id: 'tools' as ActiveTab, label: t('navTools'), icon: Wrench },
    { id: 'dues' as ActiveTab, label: t('navDues'), icon: Receipt },
  ];

  return (
    <>

      {/* Bottom Navigation Bar */}
      <nav className="sticky bottom-0 left-0 right-0 z-30 bg-white/95 dark:bg-slate-900/95 backdrop-blur-lg border-t border-slate-200 dark:border-slate-800 pb-safe">
        <div className="grid grid-cols-5 h-16 items-center px-1">
          {mainNavItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onTabChange(item.id)}
                className={`flex flex-col items-center justify-center py-1 rounded-xl transition-all btn-tactile ${
                  isActive
                    ? 'font-bold'
                    : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 font-medium'
                }`}
                style={{ color: isActive ? tradeConfig.primaryColor : undefined }}
              >
                <div
                  className={`p-1 rounded-lg transition-transform ${
                    isActive ? 'scale-110' : ''
                  }`}
                  style={{
                    backgroundColor: isActive ? tradeConfig.badgeBg : 'transparent',
                  }}
                >
                  <Icon className="w-5 h-5" />
                </div>
                <span className="text-[10px] mt-0.5 tracking-tight truncate max-w-[62px]">
                  {item.label}
                </span>
              </button>
            );
          })}
        </div>
      </nav>
    </>
  );
};
