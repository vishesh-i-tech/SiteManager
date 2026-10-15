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
    <div className="bg-white dark:bg-slate-800/90 rounded-xl p-4 sm:p-5 border border-slate-200 dark:border-slate-700 shadow-sm space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-lg flex items-center justify-center bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400">
            <AlertCircle className="w-4 h-4" />
          </div>
          <div>
            <h2 className="font-bold text-sm text-slate-900 dark:text-white font-heading">
              {language === 'hi' ? 'साइट अलर्ट व महत्वपूर्ण सूचनाएं' : 'Operational Alerts & Site Notes'}
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              {language === 'hi' ? 'दैनिक रिकॉर्ड के आधार पर आवश्यक कार्य' : 'Action items requiring attention across your sites'}
            </p>
          </div>
        </div>

        <span className="text-xs font-semibold px-2 py-0.5 rounded-md bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-400 border border-blue-200 dark:border-blue-900">
          {insights.length} {language === 'hi' ? 'अलर्ट' : 'Alerts'}
        </span>
      </div>

      {/* Insights List */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {insights.map((ins) => {
          return (
            <div
              key={ins.id}
              className="bg-slate-50 dark:bg-slate-900/60 rounded-lg p-3.5 border border-slate-200 dark:border-slate-800 flex flex-col justify-between transition-colors hover:border-slate-300 dark:hover:border-slate-700"
            >
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-400 border border-blue-200 dark:border-blue-900">
                    {ins.badge}
                  </span>
                  <Clock className="w-3.5 h-3.5 text-slate-400" />
                </div>

                <h3 className="font-semibold text-xs sm:text-sm text-slate-900 dark:text-white line-clamp-1">
                  {ins.title}
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed line-clamp-2">
                  {ins.description}
                </p>
              </div>

              {ins.actionRoute && (
                <button
                  onClick={() => onNavigateTab(ins.actionRoute as ActiveTab)}
                  className="mt-3 text-xs font-semibold text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 flex items-center gap-1 transition-colors self-start"
                >
                  <span>{ins.actionText || 'Take Action'}</span>
                  <ArrowRight className="w-3 h-3 transition-transform" />
                </button>
              )}
            </div>
          );
        })}
      </div>

    </div>
  );
};
