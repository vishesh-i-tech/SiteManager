import React from 'react';
import { useTheme } from '../../core/theme/ThemeContext';
import { Site, ToolRecord, LabourRecord, MaterialRecord, MachineryRecord, ExpenseDue, SmartInsight } from '../../types';
import { SiteCard } from '../sites/SiteCard';
import { ActiveTab } from '../common/BottomNav';
import { CountUpNumber } from '../common/CountUpNumber';
import { ExploreBanner } from '../discovery/ExploreBanner';
import { ServicesGrid } from '../discovery/ServicesGrid';
import { WorkerCard } from '../discovery/WorkerCard';
import { WORKER_DIRECTORY, WorkerProfile } from '../../data/workersDirectory';
import {
  Building2,
  Users,
  Wrench,
  Receipt,
  Plus,
  Mic,
  Camera,
  ArrowRight,
  TrendingUp,
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
  onViewWorkerProfile: (worker: WorkerProfile) => void;
  onBookWorker: (worker: WorkerProfile) => void;
  onOpenDirectory: (category?: string) => void;
  contractorName?: string;
  companyName?: string;
}

export const DashboardOverview: React.FC<DashboardOverviewProps> = ({
  sites,
  tools,
  labourRecords,
  dues,
  onSelectSite,
  onOpenAddSite,
  onOpenVoiceModal,
  onOpenOcrModal,
  onNavigateTab,
  onOpenReport,
  onViewWorkerProfile,
  onBookWorker,
  onOpenDirectory,
  contractorName,
  companyName,
}) => {
  const { t, language } = useTheme();

  const ongoingSites = sites.filter((s) => s.workStatus === 'ongoing');
  const totalContractBudget = sites.reduce((acc, s) => acc + (s.estimatedBudget || 0), 0);

  const overdueTools = tools.filter(
    (tItem) =>
      (tItem.status === 'overdue' ||
        (tItem.actualReturnDate === null && new Date(tItem.expectedReturnDate) < new Date())) &&
      !tItem.actualReturnDate
  );

  const unpaidDues = dues.filter((d) => d.status !== 'paid');
  const totalDuesAmount = unpaidDues.reduce((acc, d) => acc + (d.amountDue - (d.amountPaid || 0)), 0);

  // Today's total workers
  const todayDate = new Date().toISOString().split('T')[0];
  const todayLabourRecord = labourRecords.find((r) => r.date === todayDate) || labourRecords[0];
  const todayWorkerCount = todayLabourRecord?.totalWorkers || 6;
  const totalLabourWages = labourRecords.reduce((acc, l) => acc + (l.totalDailyWage || 0), 4225);

  // Top popular service workers for Screen 1
  const featuredWorkers = WORKER_DIRECTORY.slice(0, 3);

  return (
    <div className="space-y-5 animate-fade-in pb-16">
      
      {/* 1. Hero Promo Banner with 3D Character (Screen 1 Match) */}
      <ExploreBanner
        badgeText="Save 25% Today!"
        title="Exclusive discounts on home service"
        buttonText="Book Now"
        onActionClick={() => onOpenDirectory('all')}
      />

      {/* 2. Most Booked Services (8 Squircle Grid - Screen 1 Match) */}
      <ServicesGrid
        title="Most Booked Services"
        viewAllText="View all"
        onSelectCategory={(role) => onOpenDirectory(role)}
        onViewAll={() => onOpenDirectory('all')}
      />

      {/* 3. Popular Near You (Worker Cards Feed - Screen 1 Match) */}
      <div className="space-y-3">
        <div className="flex items-center justify-between px-1">
          <h3 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white font-heading tracking-tight">
            Popular Near You
          </h3>
          <button
            onClick={() => onOpenDirectory('all')}
            className="text-xs font-semibold text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 transition-colors cursor-pointer"
          >
            View all
          </button>
        </div>

        <div className="space-y-3">
          {featuredWorkers.map((worker) => (
            <WorkerCard
              key={worker.id}
              worker={worker}
              onViewProfile={onViewWorkerProfile}
              onBookNow={onBookWorker}
            />
          ))}
        </div>
      </div>

      {/* 4. Quick Contractor Action Bar */}
      <div className="bg-white dark:bg-slate-900 p-3.5 rounded-[22px] border border-slate-100 dark:border-slate-800 shadow-[0_4px_20px_rgba(0,0,0,0.03)] space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold text-slate-900 dark:text-white font-heading">
            Site Operations & Quick Logs
          </span>
          <span className="text-[10px] px-2 py-0.5 rounded-full bg-blue-50 dark:bg-blue-950 text-blue-600 font-bold">
            {ongoingSites.length} Active Sites
          </span>
        </div>

        <div className="grid grid-cols-3 gap-2">
          <button
            onClick={onOpenVoiceModal}
            className="py-2.5 px-1 rounded-xl font-bold text-[11px] bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-200 hover:bg-slate-100 flex flex-col items-center justify-center gap-1 active:scale-95 transition-all cursor-pointer"
          >
            <Mic className="w-4 h-4 text-blue-600 dark:text-blue-400" />
            <span>Voice Log</span>
          </button>

          <button
            onClick={onOpenOcrModal}
            className="py-2.5 px-1 rounded-xl font-bold text-[11px] bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-200 hover:bg-slate-100 flex flex-col items-center justify-center gap-1 active:scale-95 transition-all cursor-pointer"
          >
            <Camera className="w-4 h-4 text-blue-600 dark:text-blue-400" />
            <span>Scan</span>
          </button>

          <button
            onClick={onOpenAddSite}
            className="py-2.5 px-1 rounded-xl font-bold text-[11px] bg-blue-600 hover:bg-blue-700 text-white shadow-xs flex flex-col items-center justify-center gap-1 active:scale-95 transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>New Site</span>
          </button>
        </div>
      </div>

      {/* 5. Mobile 2x2 KPI Widgets */}
      <div className="grid grid-cols-2 gap-2.5">
        
        {/* Active Sites */}
        <div
          onClick={() => onNavigateTab('sites', 'ongoing')}
          className="bg-white dark:bg-slate-900 rounded-[20px] p-3.5 border border-slate-100 dark:border-slate-800 shadow-[0_4px_16px_rgba(0,0,0,0.03)] hover:shadow-md transition-all cursor-pointer active:scale-97 flex flex-col justify-between"
        >
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 truncate">
              {t('activeSites')}
            </span>
            <div className="w-6 h-6 rounded-lg bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0">
              <Building2 className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="space-y-0.5">
            <div className="text-xl font-black text-slate-900 dark:text-white font-heading tracking-tight">
              <CountUpNumber value={ongoingSites.length} />
              <span className="text-xs font-semibold text-slate-400 ml-1">
                / {sites.length}
              </span>
            </div>
            <span className="text-[10px] text-slate-500 dark:text-slate-400 block truncate font-medium">
              ₹{totalContractBudget.toLocaleString('en-IN')} Value
            </span>
          </div>
        </div>

        {/* Workers Today */}
        <div
          onClick={() => onNavigateTab('labour')}
          className="bg-white dark:bg-slate-900 rounded-[20px] p-3.5 border border-slate-100 dark:border-slate-800 shadow-[0_4px_16px_rgba(0,0,0,0.03)] hover:shadow-md transition-all cursor-pointer active:scale-97 flex flex-col justify-between"
        >
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 truncate">
              Workers Today
            </span>
            <div className="w-6 h-6 rounded-lg bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0">
              <Users className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="space-y-0.5">
            <div className="text-xl font-black text-slate-900 dark:text-white font-heading tracking-tight">
              <CountUpNumber value={todayWorkerCount} />
              <span className="text-xs font-semibold text-slate-400 ml-1">
                Active
              </span>
            </div>
            <span className="text-[10px] text-slate-500 dark:text-slate-400 block truncate font-medium">
              ₹{totalLabourWages.toLocaleString('en-IN')} Daily
            </span>
          </div>
        </div>

        {/* Tool Inventory */}
        <div
          onClick={() => onNavigateTab('sites')}
          className="bg-white dark:bg-slate-900 rounded-[20px] p-3.5 border border-slate-100 dark:border-slate-800 shadow-[0_4px_16px_rgba(0,0,0,0.03)] hover:shadow-md transition-all cursor-pointer active:scale-97 flex flex-col justify-between"
        >
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 truncate">
              Tool Inventory
            </span>
            <div className="w-6 h-6 rounded-lg bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0">
              <Wrench className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="space-y-0.5">
            <div className="text-xl font-black text-slate-900 dark:text-white font-heading tracking-tight flex items-baseline">
              <CountUpNumber value={overdueTools.length} />
              <span className={`text-xs ml-1 font-bold ${overdueTools.length > 0 ? 'text-red-500' : 'text-slate-400'}`}>
                {overdueTools.length > 0 ? 'Overdue' : 'On Track'}
              </span>
            </div>
            <span className="text-[10px] text-slate-500 dark:text-slate-400 block truncate font-medium">
              {tools.length} Total Tools
            </span>
          </div>
        </div>

        {/* Pending Dues */}
        <div
          onClick={() => onNavigateTab('dues')}
          className="bg-white dark:bg-slate-900 rounded-[20px] p-3.5 border border-slate-100 dark:border-slate-800 shadow-[0_4px_16px_rgba(0,0,0,0.03)] hover:shadow-md transition-all cursor-pointer active:scale-97 flex flex-col justify-between"
        >
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 truncate">
              Pending Dues
            </span>
            <div className="w-6 h-6 rounded-lg bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0">
              <Receipt className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="space-y-0.5">
            <div className="text-lg font-black text-slate-900 dark:text-white font-heading tracking-tight truncate">
              ₹<CountUpNumber value={totalDuesAmount} />
            </div>
            <span className="text-[10px] text-slate-500 dark:text-slate-400 block truncate font-medium">
              {unpaidDues.length} Pending Bills
            </span>
          </div>
        </div>

      </div>

      {/* 6. Project Sites Feed */}
      <div className="space-y-3 pt-1">
        <div className="flex items-center justify-between px-1">
          <div>
            <h3 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white font-heading tracking-tight">
              Project Sites
            </h3>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">
              {sites.length} active construction locations
            </p>
          </div>

          <button
            onClick={() => onNavigateTab('sites')}
            className="text-xs font-semibold text-blue-600 dark:text-blue-400 hover:text-blue-700 flex items-center gap-1 transition-colors cursor-pointer"
          >
            <span>View All</span>
            <ArrowRight className="w-3 h-3" />
          </button>
        </div>

        <div className="flex flex-col space-y-3">
          {sites.length === 0 ? (
            <div className="bg-white dark:bg-slate-900 rounded-[22px] p-6 border border-slate-100 dark:border-slate-800 text-center space-y-2">
              <div className="w-10 h-10 rounded-full bg-blue-50 text-blue-600 mx-auto flex items-center justify-center">
                <Building2 className="w-5 h-5" />
              </div>
              <p className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                No Sites Added Yet
              </p>
              <button
                onClick={onOpenAddSite}
                className="px-3.5 py-1.5 rounded-lg text-xs font-bold bg-blue-600 text-white cursor-pointer"
              >
                + Add First Site
              </button>
            </div>
          ) : (
            sites.slice(0, 3).map((site) => (
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
