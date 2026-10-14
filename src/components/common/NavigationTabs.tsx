import React from 'react';
import { useTheme } from '../../core/theme/ThemeContext';
import { ActiveTab } from './BottomNav';
import {
  LayoutDashboard,
  Building2,
  Users,
  Wrench,
  Receipt,
  Package,
  Truck,
  FileSpreadsheet,
  Plus,
  Sparkles,
} from 'lucide-react';

interface NavigationTabsProps {
  activeTab: ActiveTab;
  onTabChange: (tab: ActiveTab) => void;
  onOpenQuickAdd: () => void;
}

export const NavigationTabs: React.FC<NavigationTabsProps> = ({
  activeTab,
  onTabChange,
  onOpenQuickAdd,
}) => {
  const { t, tradeConfig, language } = useTheme();

  const navItems = [
    { id: 'dashboard' as ActiveTab, label: t('navDashboard'), icon: LayoutDashboard },
    { id: 'sites' as ActiveTab, label: t('navSites'), icon: Building2 },
    { id: 'labour' as ActiveTab, label: t('navLabour'), icon: Users },
    { id: 'tools' as ActiveTab, label: t('navTools'), icon: Wrench },
    { id: 'materials' as ActiveTab, label: t('navMaterials'), icon: Package },
    { id: 'machinery' as ActiveTab, label: t('navMachinery'), icon: Truck },
    { id: 'dues' as ActiveTab, label: t('navDues'), icon: Receipt },
    { id: 'reports' as ActiveTab, label: t('navReports'), icon: FileSpreadsheet },
  ];

  return (
    <div className="hidden md:flex items-center justify-between py-3 border-b border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50">
      <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-1">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onTabChange(item.id)}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 whitespace-nowrap btn-tactile ${
                isActive
                  ? 'bg-white dark:bg-slate-800 shadow-sm border border-slate-200/80 dark:border-slate-700'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800/60'
              }`}
              style={{
                color: isActive ? tradeConfig.primaryColor : undefined,
              }}
            >
              <Icon className="w-4 h-4" />
              <span>{item.label}</span>
              {item.id === 'dues' && (
                <span className="w-2 h-2 rounded-full bg-amber-500 animate-ping"></span>
              )}
            </button>
          );
        })}
      </div>

      {/* Quick Add CTA on Desktop */}
      <button
        onClick={onOpenQuickAdd}
        className="px-4 py-2 rounded-xl text-xs font-bold text-white shadow-md flex items-center gap-2 transition-all btn-tactile glow-theme"
        style={{ backgroundColor: tradeConfig.primaryColor }}
      >
        <Plus className="w-4 h-4" />
        <span>{t('quickAdd')}</span>
      </button>
    </div>
  );
};
