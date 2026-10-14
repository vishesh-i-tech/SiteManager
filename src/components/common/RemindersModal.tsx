import React from 'react';
import { useTheme } from '../../core/theme/ThemeContext';
import { Reminder } from '../../types';
import { db } from '../../core/db/database';
import {
  Bell,
  AlertCircle,
  CheckCircle2,
  Clock,
  X,
  Building,
  Calendar,
  Flame,
} from 'lucide-react';
import { ActiveTab } from './BottomNav';

interface RemindersModalProps {
  isOpen: boolean;
  onClose: () => void;
  reminders: Reminder[];
  onNavigateTab: (tab: ActiveTab) => void;
  onRefresh: () => void;
}

export const RemindersModal: React.FC<RemindersModalProps> = ({
  isOpen,
  onClose,
  reminders,
  onNavigateTab,
  onRefresh,
}) => {
  const { t, language, tradeConfig } = useTheme();

  if (!isOpen) return null;

  const handleDismissReminder = async (id: string) => {
    await db.reminders.update(id, { isDismissed: true });
    onRefresh();
  };

  const activeReminders = reminders.filter((r) => !r.isDismissed);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto">
      {/* Separate Backdrop Layer */}
      <div className="fixed inset-0 bg-slate-950/75 backdrop-blur-sm transition-opacity" onClick={onClose} />

      {/* Interactive Sharp Dialog Container */}
      <div className="relative z-10 bg-white dark:bg-slate-900 w-full max-w-lg rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col max-h-[85vh] animate-fade-in">
        
        {/* Header */}
        <div className="p-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-800/40">
          <div className="flex items-center gap-2.5">
            <div
              className="w-10 h-10 rounded-2xl flex items-center justify-center text-white shadow-md"
              style={{ backgroundColor: tradeConfig.primaryColor }}
            >
              <Bell className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-extrabold text-base text-slate-900 dark:text-white font-heading">
                {language === 'hi' ? 'अलर्ट व रिमाइंडर्स' : 'Reminders & Alerts'}
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {activeReminders.length} {language === 'hi' ? 'जरूरी सूचनाएं' : 'active reminders'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Reminders List */}
        <div className="p-5 space-y-3 overflow-y-auto flex-1">
          {activeReminders.length === 0 ? (
            <div className="text-center py-8 space-y-2">
              <CheckCircle2 className="w-10 h-10 mx-auto text-emerald-500" />
              <p className="font-bold text-sm text-slate-700 dark:text-slate-300">
                {language === 'hi' ? 'कोई बकाया या ओवरड्यू अलर्ट नहीं है!' : 'No pending reminders right now!'}
              </p>
            </div>
          ) : (
            activeReminders.map((rem) => {
              const isOverdue = rem.type === 'tool_overdue';
              const isCompletedDue = rem.type === 'completed_site_due';

              return (
                <div
                  key={rem.id}
                  className={`p-4 rounded-2xl border flex flex-col justify-between space-y-2 transition-all ${
                    isCompletedDue
                      ? 'border-red-300 dark:border-red-900/80 bg-red-50/30 dark:bg-red-950/20'
                      : isOverdue
                      ? 'border-amber-300 dark:border-amber-900/80 bg-amber-50/30 dark:bg-amber-950/20'
                      : 'border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/60'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2">
                      {isCompletedDue ? (
                        <Flame className="w-4 h-4 text-red-500 flex-shrink-0" />
                      ) : (
                        <AlertCircle className="w-4 h-4 text-amber-500 flex-shrink-0" />
                      )}
                      <h4 className="font-extrabold text-xs sm:text-sm text-slate-900 dark:text-white">
                        {rem.title}
                      </h4>
                    </div>

                    <button
                      onClick={() => handleDismissReminder(rem.id)}
                      className="text-slate-400 hover:text-slate-600 p-1"
                      title="Dismiss"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <p className="text-xs text-slate-600 dark:text-slate-300">
                    {rem.description}
                  </p>

                  <div className="flex items-center justify-between pt-2 border-t border-slate-200/60 dark:border-slate-700/60 text-xs">
                    <span className="text-[11px] text-slate-400 flex items-center gap-1">
                      <Building className="w-3 h-3" />
                      {rem.siteName}
                    </span>

                    <button
                      onClick={() => {
                        onClose();
                        onNavigateTab(isOverdue ? 'tools' : 'dues');
                      }}
                      className="font-bold text-xs text-orange-600 dark:text-orange-400 hover:underline"
                    >
                      {isOverdue ? 'View Tools →' : 'View Dues →'}
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>

      </div>
    </div>
  );
};
