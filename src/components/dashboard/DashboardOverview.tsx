import React from 'react';
import { useTheme } from '../../core/theme/ThemeContext';
import { Site, ToolRecord, LabourRecord, MaterialRecord, MachineryRecord, ExpenseDue, SmartInsight } from '../../types';
import { SiteCard } from '../sites/SiteCard';
import { ActiveTab } from '../common/BottomNav';
import { CountUpNumber } from '../common/CountUpNumber';
import {
  Building2,
  Users,
  Wrench,
  Receipt,
  Plus,
  Mic,
  Camera,
  ArrowRight,
} from 'lucide-react';

interface DashboardOverviewProps {
  sites: Site[];
  tools: ToolRecord[];
  labourRecords: LabourRecord[];
  materials: MaterialRecord[];
  machinery: MachineryRecord[];
  dues: ExpenseDue[];
  insights: SmartInsight[];
  onSelectSite: (site: Site) => void;
  onOpenAddSite: () => void;
  onOpenVoiceModal: () => void;
  onOpenOcrModal: () => void;
  onNavigateTab: (tab: ActiveTab, filter?: 'all' | 'ongoing' | 'completed' | 'planning') => void;
  onOpenReport: (site: Site) => void;
  contractorName?: string;
  companyName?: string;
}

export const DashboardOverview: React.FC<DashboardOverviewProps> = ({
  sites,
  tools,
  labourRecords,
  dues,
  insights,
  onSelectSite,
  onOpenAddSite,
  onOpenVoiceModal,
  onOpenOcrModal,
  onNavigateTab,
  onOpenReport,
  contractorName,
  companyName,
}) => {
  const { t, language, tradeConfig } = useTheme();

  const ongoingSites = sites.filter((s) => s.workStatus === 'ongoing');
  const totalContractBudget = sites.reduce((acc, s) => acc + (s.estimatedBudget || 0), 0);

  const overdueTools = tools.filter(
    (tItem) => (tItem.status === 'overdue' || (tItem.actualReturnDate === null && new Date(tItem.expectedReturnDate) < new Date())) && !tItem.actualReturnDate
  );

  const unpaidDues = dues.filter((d) => d.status !== 'paid');
  const totalDuesAmount = unpaidDues.reduce((acc, d) => acc + (d.amountDue - (d.amountPaid || 0)), 0);

  // Today's total workers
  const todayDate = new Date().toISOString().split('T')[0];
  const todayLabourRecord = labourRecords.find((r) => r.date === todayDate) || labourRecords[0];
  const todayWorkerCount = todayLabourRecord?.totalWorkers || 0;
  const totalLabourWages = labourRecords.reduce((acc, l) => acc + (l.totalDailyWage || 0), 0);

  return (
    <div className="space-y-4">
      
      {/* Mobile Contractor Hero Card */}
      <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            {companyName ? (
              <span className="text-[11px] font-semibold px-2 py-0.5 rounded-md bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-400 border border-blue-200 dark:border-blue-900">
                {companyName}
              </span>
            ) : null}
            <span className="text-[10px] text-slate-400 font-medium">
              {new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
            </span>
          </div>
          <span className="text-[11px] font-medium text-slate-500">
            {ongoingSites.length} {language === 'hi' ? 'चालू साइट्स' : 'Active Sites'}
          </span>
        </div>

        <div>
          <h1 className="text-base font-bold text-slate-900 dark:text-white font-heading tracking-tight leading-tight">
            {contractorName || 'SiteSaathi'}
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            ₹{totalContractBudget.toLocaleString('en-IN')} {language === 'hi' ? 'का कुल साइट बजट' : 'Total Contract Value'}
          </p>
        </div>

        {/* 3-Button Mobile Quick Action Grid */}
        <div className="grid grid-cols-3 gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
          <button
            onClick={onOpenVoiceModal}
            className="py-2 px-1 rounded-xl font-semibold text-[11px] bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 hover:bg-slate-200 flex flex-col items-center justify-center gap-1 btn-tactile transition-colors"
          >
            <Mic className="w-4 h-4 text-blue-600 dark:text-blue-400" />
            <span className="truncate">{language === 'hi' ? 'बोलकर भरें' : 'Voice Log'}</span>
          </button>

          <button
            onClick={onOpenOcrModal}
            className="py-2 px-1 rounded-xl font-semibold text-[11px] bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 hover:bg-slate-200 flex flex-col items-center justify-center gap-1 btn-tactile transition-colors"
          >
            <Camera className="w-4 h-4 text-blue-600 dark:text-blue-400" />
            <span className="truncate">{language === 'hi' ? 'स्कैन' : 'Scan'}</span>
          </button>

          <button
            onClick={onOpenAddSite}
            className="py-2 px-1 rounded-xl font-semibold text-[11px] bg-blue-600 hover:bg-blue-700 text-white shadow-sm flex flex-col items-center justify-center gap-1 btn-tactile transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span className="truncate">{language === 'hi' ? 'नई साइट' : 'New Site'}</span>
          </button>
        </div>
      </div>

      {/* Mobile 2x2 KPI Widgets (Zero Horizontal Truncation) */}
      <div className="grid grid-cols-2 gap-2.5">
        
        {/* Widget 1: Active Sites */}
        <div
          onClick={() => onNavigateTab('sites', 'ongoing')}
          className="bg-white dark:bg-slate-900 rounded-2xl p-3 border border-slate-200 dark:border-slate-800 shadow-sm hover:border-blue-500/50 transition-all cursor-pointer btn-tactile flex flex-col justify-between"
        >
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 truncate">
              {t('activeSites')}
            </span>
            <div className="w-6 h-6 rounded-lg bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0">
              <Building2 className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="space-y-0.5">
            <div className="text-xl font-black text-slate-900 dark:text-white font-heading tracking-tight">
              <CountUpNumber value={ongoingSites.length} />
              <span className="text-xs font-medium text-slate-400 ml-1">
                / {sites.length}
              </span>
            </div>
            <span className="text-[10px] text-slate-500 dark:text-slate-400 block truncate font-medium">
              ₹{totalContractBudget.toLocaleString('en-IN')} {language === 'hi' ? 'बजट' : 'Value'}
            </span>
          </div>
        </div>

        {/* Widget 2: Workers Today */}
        <div
          onClick={() => onNavigateTab('labour')}
          className="bg-white dark:bg-slate-900 rounded-2xl p-3 border border-slate-200 dark:border-slate-800 shadow-sm hover:border-blue-500/50 transition-all cursor-pointer btn-tactile flex flex-col justify-between"
        >
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 truncate">
              {language === 'hi' ? 'आज हाज़िरी' : 'Workers Today'}
            </span>
            <div className="w-6 h-6 rounded-lg bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0">
              <Users className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="space-y-0.5">
            <div className="text-xl font-black text-slate-900 dark:text-white font-heading tracking-tight">
              <CountUpNumber value={todayWorkerCount} />
              <span className="text-xs font-medium text-slate-400 ml-1">
                {language === 'hi' ? 'मजदूर' : 'Workers'}
              </span>
            </div>
            <span className="text-[10px] text-slate-500 dark:text-slate-400 block truncate font-medium">
              ₹{totalLabourWages.toLocaleString('en-IN')} {language === 'hi' ? 'मजदूरी' : 'Wages'}
            </span>
          </div>
        </div>

        {/* Widget 3: Tools Inventory & Overdue */}
        <div
          onClick={() => onNavigateTab('sites')}
          className="bg-white dark:bg-slate-900 rounded-2xl p-3 border border-slate-200 dark:border-slate-800 shadow-sm hover:border-blue-500/50 transition-all cursor-pointer btn-tactile flex flex-col justify-between"
        >
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 truncate">
              {language === 'hi' ? 'औज़ार / टूल्स' : 'Tool Inventory'}
            </span>
            <div className="w-6 h-6 rounded-lg bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0">
              <Wrench className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="space-y-0.5">
            <div className="text-xl font-black text-slate-900 dark:text-white font-heading tracking-tight flex items-baseline">
              <CountUpNumber value={overdueTools.length} />
              <span className={`text-xs ml-1 font-semibold ${overdueTools.length > 0 ? 'text-red-500' : 'text-slate-400'}`}>
                {overdueTools.length > 0 ? (language === 'hi' ? 'देरी से' : 'Overdue') : (language === 'hi' ? 'नियमित' : 'On track')}
              </span>
            </div>
            <span className="text-[10px] text-slate-500 dark:text-slate-400 block truncate font-medium">
              {tools.length} {language === 'hi' ? 'कुल उपकरण' : 'Total Tools'}
            </span>
          </div>
        </div>

        {/* Widget 4: Pending Dues */}
        <div
          onClick={() => onNavigateTab('dues')}
          className="bg-white dark:bg-slate-900 rounded-2xl p-3 border border-slate-200 dark:border-slate-800 shadow-sm hover:border-blue-500/50 transition-all cursor-pointer btn-tactile flex flex-col justify-between"
        >
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 truncate">
              {language === 'hi' ? 'बकाया रकम' : 'Pending Dues'}
            </span>
            <div className="w-6 h-6 rounded-lg bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0">
              <Receipt className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="space-y-0.5">
            <div className="text-lg sm:text-xl font-black text-slate-900 dark:text-white font-heading tracking-tight truncate">
              ₹<CountUpNumber value={totalDuesAmount} />
            </div>
            <span className="text-[10px] text-slate-500 dark:text-slate-400 block truncate font-medium">
              {unpaidDues.length} {language === 'hi' ? 'बाकी बिल' : 'Pending Bills'}
            </span>
          </div>
        </div>

      </div>

      {/* Sites List Section - Vertical Mobile Feed */}
      <div className="space-y-3 pt-2">
        <div className="flex items-center justify-between px-1">
          <div>
            <h2 className="text-sm font-bold text-slate-900 dark:text-white font-heading">
              {language === 'hi' ? 'आपकी साइट्स (प्रोजेक्ट)' : 'Project Sites'}
            </h2>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">
              {sites.length} {language === 'hi' ? 'कुल साइट्स दर्ज' : 'Sites recorded'}
            </p>
          </div>

          <button
            onClick={() => onNavigateTab('sites')}
            className="text-xs font-semibold text-blue-600 dark:text-blue-400 hover:text-blue-700 flex items-center gap-1 transition-colors"
          >
            <span>{language === 'hi' ? 'सभी देखें' : 'View All'}</span>
            <ArrowRight className="w-3 h-3" />
          </button>
        </div>

        {/* Sites Feed */}
        <div className="flex flex-col space-y-3">
          {sites.length === 0 ? (
            <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 text-center space-y-2">
              <div className="w-10 h-10 rounded-full bg-blue-50 text-blue-600 mx-auto flex items-center justify-center">
                <Building2 className="w-5 h-5" />
              </div>
              <p className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                {language === 'hi' ? 'कोई साइट दर्ज नहीं है' : 'No Sites Added Yet'}
              </p>
              <button
                onClick={onOpenAddSite}
                className="px-3.5 py-1.5 rounded-lg text-xs font-semibold bg-blue-600 text-white"
              >
                + {language === 'hi' ? 'पहली साइट जोड़ें' : 'Add First Site'}
              </button>
            </div>
          ) : (
            sites.slice(0, 4).map((site) => (
              <SiteCard
                key={site.id}
                site={site}
                onSelect={onSelectSite}
                onOpenReport={onOpenReport}
              />
            ))
          )}
        </div>
      </div>

    </div>
  );
};
