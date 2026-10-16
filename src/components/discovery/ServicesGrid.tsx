import React from 'react';
import {
  Wrench,
  Zap,
  Hammer,
  Paintbrush,
  BrickWall,
  Flame,
  HardHat,
  LayoutGrid,
} from 'lucide-react';

export interface ServiceCategoryItem {
  id: string;
  name: string;
  roleFilter: string;
  icon: React.ComponentType<{ className?: string }>;
  iconBg: string;
  iconColor: string;
}

interface ServicesGridProps {
  onSelectCategory: (role: string) => void;
  onViewAll: () => void;
  title?: string;
  viewAllText?: string;
}

export const SERVICES_LIST: ServiceCategoryItem[] = [
  {
    id: 'plumber',
    name: 'Plumber',
    roleFilter: 'Plumber',
    icon: Wrench,
    iconBg: 'bg-sky-50 dark:bg-sky-950/60',
    iconColor: 'text-sky-600 dark:text-sky-400',
  },
  {
    id: 'electrician',
    name: 'Electrician',
    roleFilter: 'Electrician',
    icon: Zap,
    iconBg: 'bg-amber-50 dark:bg-amber-950/60',
    iconColor: 'text-amber-500 dark:text-amber-400',
  },
  {
    id: 'carpenter',
    name: 'Carpenter',
    roleFilter: 'Carpenter',
    icon: Hammer,
    iconBg: 'bg-orange-50 dark:bg-orange-950/60',
    iconColor: 'text-orange-600 dark:text-orange-400',
  },
  {
    id: 'painter',
    name: 'Painter',
    roleFilter: 'Painter',
    icon: Paintbrush,
    iconBg: 'bg-purple-50 dark:bg-purple-950/60',
    iconColor: 'text-purple-600 dark:text-purple-400',
  },
  {
    id: 'mason',
    name: 'Mason',
    roleFilter: 'Mason',
    icon: BrickWall,
    iconBg: 'bg-rose-50 dark:bg-rose-950/60',
    iconColor: 'text-rose-600 dark:text-rose-400',
  },
  {
    id: 'welder',
    name: 'Welder',
    roleFilter: 'Welder',
    icon: Flame,
    iconBg: 'bg-blue-50 dark:bg-blue-950/60',
    iconColor: 'text-blue-600 dark:text-blue-400',
  },
  {
    id: 'supervisor',
    name: 'Roofer',
    roleFilter: 'Supervisor',
    icon: HardHat,
    iconBg: 'bg-emerald-50 dark:bg-emerald-950/60',
    iconColor: 'text-emerald-600 dark:text-emerald-400',
  },
  {
    id: 'more',
    name: 'More',
    roleFilter: 'all',
    icon: LayoutGrid,
    iconBg: 'bg-indigo-50 dark:bg-indigo-950/60',
    iconColor: 'text-indigo-600 dark:text-indigo-400',
  },
];

export const ServicesGrid: React.FC<ServicesGridProps> = ({
  onSelectCategory,
  onViewAll,
  title = 'Most Booked Services',
  viewAllText = 'View all',
}) => {
  return (
    <div className="space-y-3">
      {/* Section Header */}
      <div className="flex items-center justify-between px-1">
        <h3 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white font-heading tracking-tight">
          {title}
        </h3>
        <button
          onClick={onViewAll}
          className="text-xs font-semibold text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 transition-colors cursor-pointer"
        >
          {viewAllText}
        </button>
      </div>

      {/* 4x2 Grid of Squircles */}
      <div className="grid grid-cols-4 gap-2.5 sm:gap-3">
        {SERVICES_LIST.map((service) => {
          const Icon = service.icon;
          return (
            <button
              key={service.id}
              onClick={() => onSelectCategory(service.roleFilter)}
              className="flex flex-col items-center justify-center p-2 rounded-2xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 shadow-[0_4px_16px_rgba(0,0,0,0.03)] hover:shadow-[0_8px_24px_rgba(37,99,235,0.08)] hover:-translate-y-0.5 active:scale-95 transition-all group cursor-pointer"
            >
              <div
                className={`w-12 h-12 rounded-xl flex items-center justify-center mb-1.5 transition-transform group-hover:scale-110 ${service.iconBg}`}
              >
                <Icon className={`w-6 h-6 ${service.iconColor}`} />
              </div>
              <span className="text-[11px] font-semibold text-slate-700 dark:text-slate-300 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors text-center truncate max-w-full">
                {service.name}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
};
