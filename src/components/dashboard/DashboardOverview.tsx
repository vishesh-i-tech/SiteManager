import React from 'react';
import { useTheme } from '../../core/theme/ThemeContext';
import { Site, ToolRecord, LabourRecord, MaterialRecord, MachineryRecord, ExpenseDue, SmartInsight } from '../../types';
import { SiteCard } from '../sites/SiteCard';
import { SmartInsightsCard } from '../insights/SmartInsightsCard';
import { ActiveTab } from '../common/BottomNav';
import { CountUpNumber } from '../common/CountUpNumber';
import {
  HardHat,
  Wrench,
  Zap,
  Building2,
  Users,
  IndianRupee,
  Clock,
  AlertCircle,
  Plus,
  Mic,
  Camera,
  ArrowRight,
  TrendingUp,
  Receipt,
  Package,
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
  onNavigateTab: (tab: ActiveTab) => void;
  onOpenReport: (site: Site) => void;
  contractorName?: string;
}

export const DashboardOverview: React.FC<DashboardOverviewProps> = ({
  sites,
  tools,
  labourRecords,
  materials,
  machinery,
  dues,
  insights,
  onSelectSite,
  onOpenAddSite,
  onOpenVoiceModal,
  onOpenOcrModal,
  onNavigateTab,
  onOpenReport,
  contractorName,
}) => {
  const { trade, t, language, tradeConfig } = useTheme();

  const ongoingSites = sites.filter((s) => s.workStatus === 'ongoing');
  const completedSites = sites.filter((s) => s.workStatus === 'completed');

  const totalContractBudget = sites.reduce((acc, s) => acc + (s.estimatedBudget || 0), 0);
  const totalMaterialSpent = materials.reduce((acc, m) => acc + (m.totalCost || 0), 0);
  const totalLabourWages = labourRecords.reduce((acc, l) => acc + (l.totalDailyWage || 0), 0);
  const totalToolRent = tools.reduce((acc, tItem) => acc + (tItem.rentOrRepairCost || 0), 0);
  const totalMachineryFuel = machinery.reduce((acc, m) => acc + (m.totalCost || 0), 0);

  const totalOutflow = totalMaterialSpent + totalLabourWages + totalToolRent + totalMachineryFuel;
  const estimatedOverallMargin = totalContractBudget - totalOutflow;

  const overdueTools = tools.filter(
    (tItem) => (tItem.status === 'overdue' || (tItem.actualReturnDate === null && new Date(tItem.expectedReturnDate) < new Date())) && !tItem.actualReturnDate
  );

  const unpaidDues = dues.filter((d) => d.status !== 'paid');
  const totalDuesAmount = unpaidDues.reduce((acc, d) => acc + (d.amountDue - (d.amountPaid || 0)), 0);

  // Today's total workers
  const todayDate = new Date().toISOString().split('T')[0];
  const todayLabourRecord = labourRecords.find((r) => r.date === todayDate) || labourRecords[0];
  const todayWorkerCount = todayLabourRecord?.totalWorkers || 0;

  return (
    <div className="space-y-6">
      
      {/* Hero Welcome & Quick Smart Entry Bar */}
      <div className="bg-gradient-to-br from-white to-slate-50 dark:from-slate-800/90 dark:to-slate-900 p-5 sm:p-7 rounded-3xl border border-slate-200/90 dark:border-slate-700/80 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-5">
        <div className="space-y-1.5">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full" style={{ backgroundColor: tradeConfig.badgeBg, color: tradeConfig.badgeText }}>
              {language === 'hi' ? tradeConfig.nameHi : tradeConfig.nameEn}
            </span>
            <span className="text-xs text-slate-400 font-semibold">
              {new Date().toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'short' })}
            </span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white font-heading tracking-tight">
            {language === 'hi'
              ? `नमस्ते, ${contractorName || 'ठेकेदार'} जी 👋`
              : `Welcome back, ${contractorName || 'Contractor'} 👋`}
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
            {language === 'hi'
              ? `आपके पास ${ongoingSites.length} चालू साइट्स हैं और ₹${totalDuesAmount.toLocaleString('en-IN')} का बकाया हिसाब है।`
              : `Managing ${ongoingSites.length} ongoing sites with ₹${totalDuesAmount.toLocaleString('en-IN')} in active dues.`}
          </p>
        </div>

        {/* Big Touch Smart Data Entry Buttons */}
        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={onOpenVoiceModal}
            className="flex-1 sm:flex-none px-4 py-3 rounded-2xl font-extrabold text-xs text-white shadow-lg flex items-center justify-center gap-2 transition-all btn-tactile glow-theme"
            style={{ backgroundColor: tradeConfig.primaryColor }}
          >
            <Mic className="w-4 h-4" />
            <span>{t('voiceAddSite')}</span>
          </button>

          <button
            onClick={onOpenOcrModal}
            className="flex-1 sm:flex-none px-4 py-3 rounded-2xl font-bold text-xs bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 hover:bg-slate-200 border border-slate-200 dark:border-slate-700 shadow-sm flex items-center justify-center gap-2 transition-all btn-tactile"
          >
            <Camera className="w-4 h-4 text-purple-600 dark:text-purple-400" />
            <span>{t('scanRegister')}</span>
          </button>

          <button
            onClick={onOpenAddSite}
            className="px-3.5 py-3 rounded-2xl font-bold text-xs bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 border border-slate-200 dark:border-slate-700 flex items-center justify-center"
            title="Manual Add Site"
          >
            <Plus className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Smart Automated Insights Card */}
      <SmartInsightsCard insights={insights} onNavigateTab={onNavigateTab} />

      {/* Category-Aware Dashboard Widgets */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        
        {/* Widget 1: Active Sites & Contract Value */}
        <div
          onClick={() => onNavigateTab('sites')}
          className="bg-white dark:bg-slate-800/90 rounded-2xl p-4 sm:p-5 border border-slate-200/90 dark:border-slate-700/80 shadow-sm hover:shadow-md transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400">
              {t('activeSites')}
            </span>
            <div
              className="p-2 rounded-xl text-white shadow-sm"
              style={{ backgroundColor: tradeConfig.primaryColor }}
            >
              <Building2 className="w-4 h-4" />
            </div>
          </div>
          <span className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white mt-2 block font-heading">
            <CountUpNumber value={ongoingSites.length} /> <span className="text-xs font-normal text-slate-400">/ {sites.length} total</span>
          </span>
          <span className="text-[11px] font-bold text-slate-500 mt-1 block truncate">
            ₹<CountUpNumber value={totalContractBudget} /> Value
          </span>
        </div>

        {/* Widget 2: Trade Specific (Labour Attendance or Jobs) */}
        <div
          onClick={() => onNavigateTab('labour')}
          className="bg-white dark:bg-slate-800/90 rounded-2xl p-4 sm:p-5 border border-slate-200/90 dark:border-slate-700/80 shadow-sm hover:shadow-md transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400">
              {trade === 'construction'
                ? t('dailyLabourPresent')
                : trade === 'plumbing'
                ? 'Active Plumbers'
                : 'Active Electricians'}
            </span>
            <div className="p-2 rounded-xl bg-purple-100 dark:bg-purple-950/50 text-purple-600">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <span className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white mt-2 block font-heading">
            <CountUpNumber value={todayWorkerCount} /> {language === 'hi' ? 'कारीगर' : 'Workers'}
          </span>
          <span className="text-[11px] font-bold text-purple-600 dark:text-purple-400 mt-1 block">
            ₹<CountUpNumber value={totalLabourWages} /> logged wages
          </span>
        </div>

        {/* Widget 3: Overdue Tools or Trade Metrics */}
        <div
          onClick={() => onNavigateTab('tools')}
          className={`bg-white dark:bg-slate-800/90 rounded-2xl p-4 sm:p-5 border shadow-sm hover:shadow-md transition-all cursor-pointer group ${
            overdueTools.length > 0
              ? 'border-red-300 dark:border-red-900/80 bg-red-50/20'
              : 'border-slate-200/90 dark:border-slate-700/80'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400">
              {t('overdueToolsCount')}
            </span>
            <div
              className={`p-2 rounded-xl ${
                overdueTools.length > 0 ? 'bg-red-100 text-red-600' : 'bg-blue-100 text-blue-600'
              }`}
            >
              <Wrench className="w-4 h-4" />
            </div>
          </div>
          <span className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white mt-2 block font-heading">
            <CountUpNumber value={overdueTools.length} /> {language === 'hi' ? 'देरी' : 'Overdue'}
          </span>
          <span className="text-[11px] font-bold text-slate-500 mt-1 block truncate">
            {tools.length} total tools deployed
          </span>
        </div>

        {/* Widget 4: Total Pending Dues (Persistent across all sites) */}
        <div
          onClick={() => onNavigateTab('dues')}
          className="bg-white dark:bg-slate-800/90 rounded-2xl p-4 sm:p-5 border border-slate-200/90 dark:border-slate-700/80 shadow-sm hover:shadow-md transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400">
              {t('pendingDuesTotal')}
            </span>
            <div className="p-2 rounded-xl bg-amber-100 dark:bg-amber-950/50 text-amber-600">
              <Receipt className="w-4 h-4" />
            </div>
          </div>
          <span className="text-xl sm:text-2xl font-black text-red-600 dark:text-red-400 mt-2 block font-heading">
            ₹<CountUpNumber value={totalDuesAmount} />
          </span>
          <span className="text-[11px] font-bold text-red-500 mt-1 block truncate">
            {unpaidDues.length} {language === 'hi' ? 'बकाया लेन-देन' : 'unpaid ledgers'}
          </span>
        </div>

      </div>

      {/* Sites Overview Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg sm:text-xl font-black text-slate-900 dark:text-white font-heading">
              {language === 'hi' ? 'आपकी साइट्स (प्रोजेक्ट)' : 'Project Sites'}
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              {language === 'hi' ? 'काम की स्थिति व पेमेंट स्थिति के साथ' : 'Independent work & payment status tracker'}
            </p>
          </div>

          <button
            onClick={() => onNavigateTab('sites')}
            className="text-xs font-extrabold text-orange-600 dark:text-orange-400 hover:underline flex items-center gap-1"
          >
            <span>{language === 'hi' ? 'सभी देखें' : 'View All'} ({sites.length})</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Sites Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {sites.slice(0, 6).map((site) => (
            <SiteCard
              key={site.id}
              site={site}
              onSelect={onSelectSite}
              onOpenReport={onOpenReport}
            />
          ))}
        </div>
      </div>

    </div>
  );
};
