import React from 'react';
import { useTheme } from '../../core/theme/ThemeContext';
import { SmartInsight } from '../../types';
import {
  Sparkles,
  AlertCircle,
  TrendingUp,
  Clock,
  ArrowRight,
  ShieldAlert,
} from 'lucide-react';
import { ActiveTab } from '../common/BottomNav';

interface SmartInsightsCardProps {
  insights: SmartInsight[];
  onNavigateTab: (tab: ActiveTab) => void;
}

export const SmartInsightsCard: React.FC<SmartInsightsCardProps> = ({
  insights,
  onNavigateTab,
}) => {
  const { t, language, tradeConfig } = useTheme();

  if (insights.length === 0) return null;

  return (
    <div className="bg-gradient-to-br from-slate-900 to-slate-800 text-white rounded-3xl p-5 sm:p-6 shadow-xl border border-slate-700/80 relative overflow-hidden space-y-4">
      
      {/* Glow decorative effect */}
      <div
        className="absolute top-0 right-0 w-64 h-64 rounded-full blur-3xl opacity-15 pointer-events-none"
        style={{ backgroundColor: tradeConfig.primaryColor }}
      ></div>

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div
            className="w-8 h-8 rounded-xl flex items-center justify-center text-white shadow-md"
            style={{ backgroundColor: tradeConfig.primaryColor }}
          >
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <h2 className="font-extrabold text-sm sm:text-base tracking-tight font-heading">
              {t('smartInsightsTitle')}
            </h2>
            <p className="text-[11px] text-slate-400">
              {t('smartInsightsSubtitle')}
            </p>
          </div>
        </div>

        <span className="hidden sm:inline-block px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-slate-800 border border-slate-700 text-orange-400">
          ⚡ Automated Intelligence
        </span>
      </div>

      {/* Insights List */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {insights.map((ins) => {
          const isTool = ins.category === 'tool_overdue';
          const isDue = ins.category === 'budget_alert';

          return (
            <div
              key={ins.id}
              className="bg-slate-800/80 hover:bg-slate-800 backdrop-blur-md rounded-2xl p-4 border border-slate-700/60 flex flex-col justify-between transition-all group"
            >
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span
                    className={`px-2 py-0.5 rounded text-[10px] font-black uppercase ${
                      isTool
                        ? 'bg-red-900/60 text-red-300 border border-red-700/50'
                        : isDue
                        ? 'bg-amber-900/60 text-amber-300 border border-amber-700/50'
                        : 'bg-blue-900/60 text-blue-300 border border-blue-700/50'
                    }`}
                  >
                    {ins.badge}
                  </span>
                  {isTool ? (
                    <Clock className="w-3.5 h-3.5 text-red-400" />
                  ) : isDue ? (
                    <AlertCircle className="w-3.5 h-3.5 text-amber-400" />
                  ) : (
                    <TrendingUp className="w-3.5 h-3.5 text-blue-400" />
                  )}
                </div>

                <h3 className="font-extrabold text-xs sm:text-sm text-slate-100 line-clamp-1">
                  {ins.title}
                </h3>
                <p className="text-[11px] text-slate-400 leading-relaxed line-clamp-2">
                  {ins.description}
                </p>
              </div>

              {ins.actionRoute && (
                <button
                  onClick={() => onNavigateTab(ins.actionRoute as ActiveTab)}
                  className="mt-3 text-[11px] font-bold text-orange-400 group-hover:text-orange-300 flex items-center gap-1 transition-colors self-start"
                >
                  <span>{ins.actionText || 'Take Action'}</span>
                  <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
                </button>
              )}
            </div>
          );
        })}
      </div>

    </div>
  );
};
