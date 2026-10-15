import React, { useEffect, useState } from 'react';
import { useTheme } from '../../core/theme/ThemeContext';
import { Site } from '../../types';
import { db } from '../../core/db/database';
import {
  MapPin,
  Calendar,
  AlertCircle,
  CheckCircle2,
  Clock,
  ArrowUpRight,
  FileText,
  Edit2,
  Trash2,
} from 'lucide-react';

interface SiteCardProps {
  site: Site;
  onSelect: (site: Site) => void;
  onOpenReport: (site: Site) => void;
  onEditSite?: (site: Site) => void;
  onDeleteSite?: (site: Site) => void;
}

export const SiteCard: React.FC<SiteCardProps> = ({
  site,
  onSelect,
  onOpenReport,
  onEditSite,
  onDeleteSite,
}) => {
  const { t, language, tradeConfig } = useTheme();
  const [finance, setFinance] = useState<any>(null);
  const [overdueCount, setOverdueCount] = useState<number>(0);

  useEffect(() => {
    let isMounted = true;
    db.getSiteFinanceSummary(site.id).then((summary) => {
      if (isMounted) setFinance(summary);
    });

    db.tools.where('siteId').equals(site.id).toArray().then((tools) => {
      if (isMounted) {
        const overdues = tools.filter(
          (t) => t.status === 'overdue' || (t.actualReturnDate === null && new Date(t.expectedReturnDate) < new Date())
        );
        setOverdueCount(overdues.length);
      }
    });

    return () => {
      isMounted = false;
    };
  }, [site.id]);

  const getWorkStatusBadge = () => {
    switch (site.workStatus) {
      case 'ongoing':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-800">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse"></span>
            {t('statusOngoing')}
          </span>
        );
      case 'completed':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800">
            <CheckCircle2 className="w-3 h-3 text-emerald-600" />
            {t('statusCompleted')}
          </span>
        );
      case 'planning':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-400 border border-blue-200 dark:border-blue-800">
            <Clock className="w-3 h-3" />
            {t('statusPlanning')}
          </span>
        );
      case 'on_hold':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-300 dark:border-slate-700">
            {t('statusOnHold')}
          </span>
        );
    }
  };

  const getPaymentStatusBadge = () => {
    switch (site.paymentStatus) {
      case 'unpaid':
        return (
          <span className="px-2 py-0.5 rounded-md text-[10px] font-extrabold bg-red-50 dark:bg-red-950/40 text-red-600 dark:text-red-400 border border-red-200 dark:border-red-900">
            {t('paymentUnpaid')}
          </span>
        );
      case 'partially_paid':
        return (
          <span className="px-2 py-0.5 rounded-md text-[10px] font-extrabold bg-orange-50 dark:bg-orange-950/40 text-orange-700 dark:text-orange-400 border border-orange-200 dark:border-orange-800">
            {t('paymentPartial')}
          </span>
        );
      case 'paid':
        return (
          <span className="px-2 py-0.5 rounded-md text-[10px] font-extrabold bg-green-50 dark:bg-green-950/40 text-green-700 dark:text-green-400 border border-green-200 dark:border-green-800">
            {t('paymentPaid')}
          </span>
        );
    }
  };

  const totalExpense = finance?.totalExpense || 0;
  const budget = site.estimatedBudget || 1;
  const expenseRatio = Math.min(Math.round((totalExpense / budget) * 100), 100);

  return (
    <div
      onClick={() => onSelect(site)}
      className="bg-white dark:bg-slate-800/90 rounded-2xl p-5 border border-slate-200/90 dark:border-slate-700/80 shadow-sm hover:shadow-md transition-all cursor-pointer group hover:border-slate-400 dark:hover:border-slate-600 flex flex-col justify-between"
    >
      <div className="space-y-3">
        {/* Header: Name, Type, Statuses */}
        <div>
          <div className="flex items-start justify-between gap-2">
            <div>
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                {site.siteType}
              </span>
              <h3 className="font-bold text-base sm:text-lg text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors line-clamp-1 font-heading">
                {site.name}
              </h3>
            </div>
            <div className="flex items-center gap-1.5 flex-shrink-0">
              {getWorkStatusBadge()}
            </div>
          </div>

          <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400 mt-1">
            <MapPin className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
            <span className="truncate">{site.location}</span>
          </div>
        </div>

        {/* Financial Progress & Independent Payment Status */}
        <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-100 dark:border-slate-800/80 space-y-2">
          <div className="flex items-center justify-between text-xs font-semibold">
            <span className="text-slate-600 dark:text-slate-400">
              {language === 'hi' ? 'खर्च / बजट' : 'Expense / Budget'}
            </span>
            <div className="flex items-center gap-2">
              {getPaymentStatusBadge()}
              <span className="text-slate-900 dark:text-white font-bold">
                ₹{totalExpense.toLocaleString('en-IN')} / ₹{site.estimatedBudget.toLocaleString('en-IN')}
              </span>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="w-full h-1.5 rounded-full bg-slate-200 dark:bg-slate-700 overflow-hidden">
            <div
              className="h-full rounded-full transition-all bg-blue-600 dark:bg-blue-500"
              style={{ width: `${expenseRatio}%` }}
            ></div>
          </div>

          {/* Key Quick Flags */}
          <div className="flex items-center justify-between text-[11px] font-medium text-slate-500 dark:text-slate-400 pt-0.5">
            <span>{expenseRatio}% {language === 'hi' ? 'बजट प्रयुक्त' : 'budget used'}</span>
            <span className="text-slate-700 dark:text-slate-300 font-semibold">
              {language === 'hi' ? 'बचत' : 'Est. Margin'}: ₹{(finance?.estimatedProfit || 0).toLocaleString('en-IN')}
            </span>
          </div>
        </div>

        {/* Warnings / Alerts */}
        {(overdueCount > 0 || (site.workStatus === 'completed' && site.paymentStatus !== 'paid')) && (
          <div className="flex flex-wrap gap-1.5 pt-1">
            {overdueCount > 0 && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-semibold bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-400 border border-blue-200 dark:border-blue-900">
                <AlertCircle className="w-3 h-3" />
                {overdueCount} {language === 'hi' ? 'औजार वापसी में देरी' : 'Tools Overdue'}
              </span>
            )}
            {site.workStatus === 'completed' && site.paymentStatus !== 'paid' && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-semibold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                <Clock className="w-3 h-3" />
                {language === 'hi' ? 'काम पूरा, पैसा बकाया!' : 'Completed, Payment Pending!'}
              </span>
            )}
          </div>
        )}
      </div>

      {/* Footer Actions */}
      <div className="flex items-center justify-between pt-3 mt-3 border-t border-slate-100 dark:border-slate-800 text-xs">
        <span className="text-[11px] text-slate-400 flex items-center gap-1">
          <Calendar className="w-3 h-3" />
          {new Date(site.startDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
        </span>

        <div className="flex items-center gap-1.5">
          {onEditSite && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onEditSite(site);
              }}
              className="p-1.5 rounded-lg text-slate-400 hover:text-blue-600 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
              title="Edit Site"
            >
              <Edit2 className="w-3.5 h-3.5" />
            </button>
          )}

          {onDeleteSite && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onDeleteSite(site);
              }}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
              title="Delete Site"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          )}

          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onOpenReport(site);
            }}
            className="p-1.5 rounded-lg text-slate-500 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
            title="Download PDF Financial Report"
          >
            <FileText className="w-4 h-4" />
          </button>
          <span
            className="font-semibold text-xs flex items-center gap-0.5 text-blue-600 dark:text-blue-400 group-hover:translate-x-0.5 transition-transform ml-1"
          >
            {t('viewDetails')}
            <ArrowUpRight className="w-3.5 h-3.5" />
          </span>
        </div>
      </div>
    </div>
  );
};
