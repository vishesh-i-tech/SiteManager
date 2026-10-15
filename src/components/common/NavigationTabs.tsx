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
    <div className="hidden md:flex items-center justify-between py-2.5 border-b border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-900/50">
      <div className="flex items-center gap-1 overflow-x-auto no-scrollbar py-0.5">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onTabChange(item.id)}
              className={`px-3 py-1.5 rounded-lg text-xs transition-colors flex items-center gap-1.5 whitespace-nowrap ${
                isActive
                  ? 'bg-white dark:bg-slate-800 text-blue-600 dark:text-blue-400 font-semibold shadow-sm border border-slate-200 dark:border-slate-700'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800/60 font-medium'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{item.label}</span>
            </button>
          );
        })}
      </div>

      {/* Quick Add CTA on Desktop */}
      <button
        onClick={onOpenQuickAdd}
        className="px-3.5 py-1.5 rounded-lg text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 shadow-sm flex items-center gap-1.5 transition-colors"
      >
        <Plus className="w-4 h-4" />
        <span>{t('quickAdd')}</span>
      </button>
    </div>
  );
};
