import React from 'react';
import { useTheme } from '../../core/theme/ThemeContext';
import { Site, ToolRecord, LabourRecord, MaterialRecord, MachineryRecord, ExpenseDue, SmartInsight } from '../../types';
import { ActiveTab } from '../common/BottomNav';
import { CountUpNumber } from '../common/CountUpNumber';
import { ExploreBanner } from '../discovery/ExploreBanner';
import {
  Building2,
  Users,
  Wrench,
  Receipt,
  Plus,
  Mic,
  Camera,
  LayoutGrid,
  CheckCircle2,
  Clock,
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
  searchQuery?: string;
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
  contractorName,
  companyName,
  searchQuery = '',
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

  // Today's total workers & latest labour entries
  const todayDate = new Date().toISOString().split('T')[0];
  const latestLabourRecord = labourRecords[0];
  const todayWorkerCount = latestLabourRecord?.totalWorkers || 0;
  const totalLabourWages = labourRecords.reduce((acc, l) => acc + (l.totalDailyWage || 0), 0);

  // Real crew members from database (only real user-logged records)
  const activeCrew = latestLabourRecord?.entries && latestLabourRecord.entries.length > 0
    ? latestLabourRecord.entries.slice(0, 4)
    : [];

  const normalizedQuery = searchQuery.trim().toLowerCase();
  const visibleCrew = normalizedQuery
    ? activeCrew.filter(
        (w: any) =>
          w.workerName.toLowerCase().includes(normalizedQuery) ||
          w.role.toLowerCase().includes(normalizedQuery)
      )
    : activeCrew;


  return (
    <div className="space-y-4 animate-fade-in pb-16">
      
      {/* 1. Interactive 3D Mascot & Primary Site Actions */}
      <ExploreBanner
        onOpenVoiceModal={onOpenVoiceModal}
        onOpenOcrModal={onOpenOcrModal}
        onOpenAddSite={onOpenAddSite}
      />


      {/* 4. Real Site Crew Roster (Today's Workers from Database) */}
      <div className="bg-white dark:bg-slate-900 p-4 rounded-[24px] border border-slate-100 dark:border-slate-800 shadow-[0_4px_20px_rgba(0,0,0,0.03)] space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-extrabold text-slate-900 dark:text-white font-heading">
              {language === 'hi' ? 'साइट पर कार्यरत कारीगर' : "Today's Active Site Crew"}
            </h3>
            <p className="text-[11px] text-slate-400">
              {todayWorkerCount} {language === 'hi' ? 'कारीगर आज तैनात हैं' : 'workers recorded on site'}
            </p>
          </div>
          <button
            onClick={() => onNavigateTab('labour')}
            className="text-xs font-bold text-blue-600 hover:underline cursor-pointer"
          >
            {language === 'hi' ? 'सभी मजदूर' : 'View All'}
          </button>
        </div>

        <div className="space-y-2">
          {visibleCrew.length === 0 ? (
            <div className="p-4 rounded-2xl bg-slate-50/50 dark:bg-slate-800/40 border border-dashed border-slate-200 dark:border-slate-700 text-center space-y-2">
              <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                {normalizedQuery ? 'No workers match search' : 'No active workers logged today'}
              </p>
              <button
                type="button"
                onClick={() => onNavigateTab('labour')}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold text-orange-600 dark:text-orange-400 bg-orange-50 dark:bg-orange-950/40 hover:bg-orange-100 dark:hover:bg-orange-900/40 transition-colors cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>+ Log Worker Attendance</span>
              </button>
            </div>
          ) : (
            visibleCrew.map((worker: any) => (
              <div
                key={worker.id}
                className="p-3 rounded-2xl bg-slate-50/80 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 flex items-center justify-between gap-2"
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="w-9 h-9 rounded-full bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300 font-extrabold text-xs flex items-center justify-center shrink-0">
                    {worker.workerName ? worker.workerName[0] : 'W'}
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5">
                      <span className="font-bold text-xs text-slate-900 dark:text-white truncate">
                        {worker.workerName}
                      </span>
                      <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-orange-100 text-[#FF5A26]">
                        {worker.role}
                      </span>
                    </div>
                    <span className="text-[11px] text-slate-400 block">
                      ₹{worker.dailyWage} /day • {sites[0]?.name || 'Sharma Villa'}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-1.5 shrink-0">
                  <span className="px-2 py-1 rounded-lg text-[10px] font-bold bg-emerald-100 text-emerald-700 flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3" />
                    <span>Present</span>
                  </span>
                </div>
              </div>
            ))
          )}
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

    </div>
  );
};
