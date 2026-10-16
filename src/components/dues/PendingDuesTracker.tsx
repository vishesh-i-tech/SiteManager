import React, { useState, useMemo } from 'react';
import confetti from 'canvas-confetti';
import { useTheme } from '../../core/theme/ThemeContext';
import { ExpenseDue, Site, Vendor } from '../../types';
import { db } from '../../core/db/database';
import {
  CreditCard,
  ArrowUpRight,
  ArrowDownLeft,
  RotateCw,
  Plus,
  Search,
  SlidersHorizontal,
  TrendingUp,
  TrendingDown,
  Wallet,
  Building,
  Calendar,
  CheckCircle2,
  AlertCircle,
  Clock,
  Flame,
  Edit2,
  Trash2,
  Wifi,
  Sparkles,
  ChevronDown,
  MoreVertical,
  Check,
} from 'lucide-react';

interface PendingDuesTrackerProps {
  dues: ExpenseDue[];
  sites: Site[];
  vendors: Vendor[];
  onOpenAddDue: () => void;
  onRefresh: () => void;
  onEditDue?: (due: ExpenseDue) => void;
  onDeleteDue?: (due: ExpenseDue) => void;
}

export const PendingDuesTracker: React.FC<PendingDuesTrackerProps> = ({
  dues,
  sites,
  vendors,
  onOpenAddDue,
  onRefresh,
  onEditDue,
  onDeleteDue,
}) => {
  const { t, language, tradeConfig } = useTheme();
  const [search, setSearch] = useState('');
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [showCompletedOnly, setShowCompletedOnly] = useState(false);
  const [timeFilter, setTimeFilter] = useState<'This Year' | 'Past 6M' | 'All Time'>('This Year');
  const [activeChartMonth, setActiveChartMonth] = useState<number | null>(3); // Apr selected by default

  const siteMap = useMemo(() => new Map(sites.map((s) => [s.id, s])), [sites]);

  // Financial aggregates
  const totalContractBudget = sites.reduce((acc, s) => acc + (s.estimatedBudget || 0), 0);
  const unpaidDues = dues.filter((d) => d.status !== 'paid');
  const paidDues = dues.filter((d) => d.status === 'paid');

  const totalUnpaidAmount = unpaidDues.reduce(
    (acc, d) => acc + (d.amountDue - (d.amountPaid || 0)),
    0
  );
  const totalPaidAmount = paidDues.reduce((acc, d) => acc + (d.amountPaid || d.amountDue), 0);

  // Completed site dues
  const completedSiteDues = unpaidDues.filter((d) => {
    const site = siteMap.get(d.siteId);
    return site && site.workStatus === 'completed';
  });
  const totalCompletedSiteDuesAmount = completedSiteDues.reduce(
    (acc, d) => acc + (d.amountDue - (d.amountPaid || 0)),
    0
  );

  // Synthetic cashflow calculations for top KPI cards & PayFlow bar chart
  const totalIncome = totalContractBudget > 0 ? totalContractBudget : 78000;
  const totalExpense = totalPaidAmount + totalUnpaidAmount > 0 ? totalPaidAmount + totalUnpaidAmount : 40000;
  const totalSavings = Math.max(0, totalIncome - totalExpense);

  // 12-Month Cashflow Dataset matching the PayFlow Bar Chart
  const monthlyCashflow = useMemo(() => {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const incomeBase = [2400, 1800, 3100, 4200, 3600, 2900, 4800, 5200, 4100, 3800, 4900, 3200];
    const expenseBase = [1200, 2400, 2200, 6200, 2800, 3400, 3900, 4100, 2600, 3100, 3500, 2900];

    const maxVal = Math.max(...incomeBase, ...expenseBase);

    return months.map((m, idx) => ({
      month: m,
      income: incomeBase[idx],
      expense: expenseBase[idx],
      incomeHeightPct: Math.round((incomeBase[idx] / maxVal) * 100),
      expenseHeightPct: Math.round((expenseBase[idx] / maxVal) * 100),
    }));
  }, []);

  // Filtered transactions for the ledger table
  const filteredDues = useMemo(() => {
    return dues.filter((due) => {
      const site = siteMap.get(due.siteId);
      const siteName = site?.name || '';
      const matchesSearch =
        due.title.toLowerCase().includes(search.toLowerCase()) ||
        siteName.toLowerCase().includes(search.toLowerCase()) ||
        due.category.toLowerCase().includes(search.toLowerCase());
      const matchesCat = filterCategory === 'all' || due.category === filterCategory;
      const matchesCompleted = showCompletedOnly ? site?.workStatus === 'completed' : true;

      return matchesSearch && matchesCat && matchesCompleted;
    });
  }, [dues, search, filterCategory, showCompletedOnly, siteMap]);

  const handleSettleFullDue = async (due: ExpenseDue) => {
    await db.dues.update(due.id, {
      amountPaid: due.amountDue,
      status: 'paid',
    });
    confetti({ particleCount: 70, spread: 60, origin: { y: 0.6 } });
    onRefresh();
  };

  // Recent activity logs
  const recentActivities = useMemo(() => {
    return [
      {
        id: 'act-1',
        title: 'Subhash Mistry (Lead Mason)',
        action: 'Received daily wage payout',
        time: 'Just now',
        type: 'labour',
      },
      {
        id: 'act-2',
        title: 'Khandelwal Hardware',
        action: 'Paid Invoice #INV-2026-04',
        time: '15 mins ago',
        type: 'material',
      },
      {
        id: 'act-3',
        title: 'Sharma Villa (G+2)',
        action: 'Client installment credited',
        time: '2:20 PM',
        type: 'income',
      },
      {
        id: 'act-4',
        title: 'JCB Excavator Rental',
        action: 'Fuel log & rental recorded',
        time: '10:45 AM',
        type: 'machinery',
      },
    ];
  }, []);

  return (
    <div className="space-y-4 animate-fade-in pb-16">
      
      {/* 1. PayFlow Top Action Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white dark:bg-slate-900 p-3.5 sm:p-4 rounded-[26px] border border-slate-100 dark:border-slate-800 shadow-[0_4px_20px_rgba(0,0,0,0.03)]">
        <div>
          <h1 className="text-lg sm:text-xl font-extrabold text-slate-900 dark:text-white font-heading tracking-tight">
            Dashboard
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            {language === 'hi' ? 'साइट भुगतान, उधारी व कैशफ्लो लेजर' : 'Site Payments, Dues & Cashflow Ledger'}
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          {/* Date Badge */}
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700 text-xs font-bold text-slate-700 dark:text-slate-200">
            <Calendar className="w-3.5 h-3.5 text-slate-400" />
            <span>{new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
          </div>

          {/* + Add Due Action Button */}
          <button
            onClick={onOpenAddDue}
            className="px-4 py-2 rounded-xl text-xs font-bold bg-[#1877F2] hover:bg-blue-700 text-white shadow-[0_4px_14px_rgba(24,119,242,0.35)] flex items-center gap-1.5 active:scale-95 transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>+ Account</span>
          </button>
        </div>
      </div>

      {/* 2. Top 3 KPI Cards (PayFlow Exact Match) */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        
        {/* Total Income */}
        <div className="p-4 rounded-[22px] bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 shadow-[0_4px_20px_rgba(0,0,0,0.03)] flex flex-col justify-between space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400">
              Total Income
            </span>
            <div className="w-6 h-6 rounded-full bg-amber-50 dark:bg-amber-950/50 text-amber-500 flex items-center justify-center font-bold text-xs">
              $
            </div>
          </div>
          <div>
            <div className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white font-heading tracking-tight">
              ₹{totalIncome.toLocaleString('en-IN')}
            </div>
            <div className="flex items-center gap-1.5 mt-1 text-[11px] text-slate-400 font-medium">
              <span>Since Last week</span>
              <span className="inline-flex items-center text-emerald-600 font-bold">
                <TrendingUp className="w-3 h-3 mr-0.5" /> 1.78%
              </span>
            </div>
          </div>
        </div>

        {/* Total Expense */}
        <div className="p-4 rounded-[22px] bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 shadow-[0_4px_20px_rgba(0,0,0,0.03)] flex flex-col justify-between space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400">
              Total Expense
            </span>
            <div className="w-6 h-6 rounded-full bg-blue-50 dark:bg-blue-950/50 text-blue-500 flex items-center justify-center font-bold text-xs">
              ↓
            </div>
          </div>
          <div>
            <div className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white font-heading tracking-tight">
              ₹{totalExpense.toLocaleString('en-IN')}
            </div>
            <div className="flex items-center gap-1.5 mt-1 text-[11px] text-slate-400 font-medium">
              <span>Since Last week</span>
              <span className="inline-flex items-center text-rose-500 font-bold">
                <TrendingDown className="w-3 h-3 mr-0.5" /> 1.78%
              </span>
            </div>
          </div>
        </div>

        {/* Total Savings / Net Balance */}
        <div className="p-4 rounded-[22px] bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 shadow-[0_4px_20px_rgba(0,0,0,0.03)] flex flex-col justify-between space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400">
              Total Savings
            </span>
            <div className="w-6 h-6 rounded-full bg-indigo-50 dark:bg-indigo-950/50 text-indigo-500 flex items-center justify-center font-bold text-xs">
              <Wallet className="w-3 h-3" />
            </div>
          </div>
          <div>
            <div className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white font-heading tracking-tight">
              ₹{totalSavings.toLocaleString('en-IN')}
            </div>
            <div className="flex items-center gap-1.5 mt-1 text-[11px] text-slate-400 font-medium">
              <span>Since Last week</span>
              <span className="inline-flex items-center text-emerald-600 font-bold">
                <TrendingUp className="w-3 h-3 mr-0.5" /> 1.70%
              </span>
            </div>
          </div>
        </div>

      </div>

      {/* SPECIAL NOTICE FOR COMPLETED SITE DUES */}
      {completedSiteDues.length > 0 && (
        <div className="p-4 rounded-[22px] bg-gradient-to-r from-red-500/10 via-amber-500/10 to-orange-500/10 border-2 border-red-400/40 dark:border-red-800/60 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-xs">
          <div className="flex items-start gap-3">
            <div className="p-2.5 rounded-xl bg-red-600 text-white shadow-xs">
              <Flame className="w-5 h-5 animate-bounce" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-extrabold text-sm sm:text-base text-slate-900 dark:text-white">
                  {t('completedSiteDuesWarning')}
                </h3>
                <span className="px-2 py-0.5 rounded-md text-[10px] font-black bg-red-600 text-white">
                  {completedSiteDues.length} Urgent Dues
                </span>
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-300 mt-0.5">
                {language === 'hi'
                  ? `₹${totalCompletedSiteDuesAmount.toLocaleString('en-IN')} की उधारी उन साइट्स की है जिनका काम पूरा हो चुका है।`
                  : `₹${totalCompletedSiteDuesAmount.toLocaleString('en-IN')} outstanding across completed projects.`}
              </p>
            </div>
          </div>

          <button
            onClick={() => setShowCompletedOnly(!showCompletedOnly)}
            className={`px-3.5 py-2 rounded-xl text-xs font-extrabold transition-all whitespace-nowrap cursor-pointer ${
              showCompletedOnly
                ? 'bg-red-600 text-white shadow-md'
                : 'bg-white dark:bg-slate-800 text-red-600 dark:text-red-400 border border-red-200 dark:border-red-900 hover:bg-red-50'
            }`}
          >
            {showCompletedOnly ? 'Show All Dues' : 'Filter Completed Site Bills'}
          </button>
        </div>
      )}

      {/* 3. Main Dashboard Body: 2 Columns on Desktop, 1 Column on Mobile */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        
        {/* Left 2 Columns: Cashflow Chart & Transaction History */}
        <div className="lg:col-span-2 space-y-4">
          
          {/* Earnings / Cashflow Bar Chart (PayFlow Match) */}
          <div className="bg-white dark:bg-slate-900 p-4 sm:p-5 rounded-[24px] border border-slate-100 dark:border-slate-800 shadow-[0_4px_20px_rgba(0,0,0,0.03)] space-y-4">
            
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div>
                <span className="text-xs font-bold text-slate-500 dark:text-slate-400">
                  Earnings, last 12 month
                </span>
                <div className="flex items-baseline gap-2 mt-0.5">
                  <h3 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white font-heading tracking-tight">
                    ₹5,87,798
                  </h3>
                  <span className="text-xs font-bold text-emerald-600 inline-flex items-center">
                    <TrendingUp className="w-3 h-3 mr-0.5" /> 1.78%
                  </span>
                </div>
              </div>

              {/* Chart Legend & Filter */}
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2 text-xs font-bold">
                  <span className="inline-flex items-center gap-1 text-slate-700 dark:text-slate-300">
                    <span className="w-2.5 h-2.5 rounded-full bg-[#4F46E5]" />
                    Income
                  </span>
                  <span className="inline-flex items-center gap-1 text-slate-400">
                    <span className="w-2.5 h-2.5 rounded-full bg-slate-200 dark:bg-slate-700" />
                    Expense
                  </span>
                </div>

                <div className="flex items-center gap-1 px-2.5 py-1 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200/70 text-xs font-semibold text-slate-700 dark:text-slate-300">
                  <span>{timeFilter}</span>
                  <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
                </div>
              </div>
            </div>

            {/* Interactive Bar Chart Visualization */}
            <div className="relative pt-6 pb-2">
              
              {/* Tooltip on Active Month (PayFlow match) */}
              {activeChartMonth !== null && (
                <div
                  className="absolute -top-1 px-3 py-1.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-lg text-[10px] font-bold z-10 flex items-center gap-3 transform -translate-x-1/2 pointer-events-none transition-all"
                  style={{
                    left: `${((activeChartMonth + 0.5) / 12) * 100}%`,
                  }}
                >
                  <span className="text-[#4F46E5]">
                    ● Income: ₹{monthlyCashflow[activeChartMonth].income}
                  </span>
                  <span className="text-slate-500">
                    ● Expense: ₹{monthlyCashflow[activeChartMonth].expense}
                  </span>
                </div>
              )}

              {/* Vertical Bars Grid */}
              <div className="h-44 sm:h-48 flex items-end justify-between gap-1 sm:gap-2 px-1 border-b border-slate-100 dark:border-slate-800">
                {monthlyCashflow.map((m, idx) => {
                  const isActive = activeChartMonth === idx;
                  return (
                    <div
                      key={m.month}
                      onMouseEnter={() => setActiveChartMonth(idx)}
                      onClick={() => setActiveChartMonth(idx)}
                      className="flex-1 flex flex-col items-center justify-end h-full gap-1 cursor-pointer group"
                    >
                      <div className="w-full flex items-end justify-center gap-1 h-full">
                        {/* Income Bar */}
                        <div
                          className={`w-2.5 sm:w-3.5 rounded-t-md transition-all duration-300 ${
                            isActive
                              ? 'bg-[#4F46E5] shadow-[0_2px_10px_rgba(79,70,229,0.5)]'
                              : 'bg-[#6366F1]/80 group-hover:bg-[#4F46E5]'
                          }`}
                          style={{ height: `${m.incomeHeightPct}%` }}
                        />
                        {/* Expense Bar */}
                        <div
                          className={`w-2.5 sm:w-3.5 rounded-t-md transition-all duration-300 ${
                            isActive
                              ? 'bg-slate-300 dark:bg-slate-600'
                              : 'bg-slate-100 dark:bg-slate-800 group-hover:bg-slate-200'
                          }`}
                          style={{ height: `${m.expenseHeightPct}%` }}
                        />
                      </div>
                      <span
                        className={`text-[10px] font-bold mt-1.5 transition-colors ${
                          isActive
                            ? 'text-slate-900 dark:text-white font-extrabold'
                            : 'text-slate-400'
                        }`}
                      >
                        {m.month}
                      </span>
                    </div>
                  );
                })}
              </div>

            </div>

          </div>

          {/* Transaction History / Dues Ledger Table (PayFlow Match) */}
          <div className="bg-white dark:bg-slate-900 p-4 sm:p-5 rounded-[24px] border border-slate-100 dark:border-slate-800 shadow-[0_4px_20px_rgba(0,0,0,0.03)] space-y-3">
            
            {/* Header with Search and Filter */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 pb-2 border-b border-slate-100 dark:border-slate-800">
              <h3 className="text-sm sm:text-base font-extrabold text-slate-900 dark:text-white font-heading tracking-tight">
                Transaction History
              </h3>

              <div className="flex items-center gap-2">
                <div className="relative">
                  <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
                  <input
                    type="text"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Search dues..."
                    className="w-36 sm:w-44 pl-8 pr-2.5 py-1.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700 text-xs font-semibold dark:text-white focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                </div>

                <div className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200/80 text-xs font-bold text-slate-600 dark:text-slate-300">
                  <SlidersHorizontal className="w-3.5 h-3.5" />
                  <span>Filter</span>
                </div>
              </div>
            </div>

            {/* Table of Transactions */}
            <div className="overflow-x-auto no-scrollbar -mx-2 px-2">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-100 dark:border-slate-800 text-slate-400 font-semibold text-[11px]">
                    <th className="py-2.5 pr-3">Transaction</th>
                    <th className="py-2.5 px-3">Date & Time</th>
                    <th className="py-2.5 px-3">Amount</th>
                    <th className="py-2.5 px-3 hidden md:table-cell">Note</th>
                    <th className="py-2.5 px-3">Status</th>
                    <th className="py-2.5 pl-3 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50 dark:divide-slate-800/60">
                  {filteredDues.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="py-8 text-center text-slate-400 font-semibold">
                        No transactions found
                      </td>
                    </tr>
                  ) : (
                    filteredDues.map((due) => {
                      const site = siteMap.get(due.siteId);
                      const isCompleted = due.status === 'paid';
                      const isOverdue = due.status === 'overdue';

                      return (
                        <tr key={due.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors">
                          
                          {/* Transaction Name & Category */}
                          <td className="py-3 pr-3">
                            <div className="font-bold text-slate-900 dark:text-white truncate max-w-[140px] sm:max-w-[200px]">
                              {due.title}
                            </div>
                            <div className="text-[10px] text-slate-400 font-medium">
                              {site?.name || 'General Site'} • <span className="capitalize">{due.category}</span>
                            </div>
                          </td>

                          {/* Date & Time */}
                          <td className="py-3 px-3 whitespace-nowrap text-slate-600 dark:text-slate-300 text-[11px]">
                            {due.dueDate}
                          </td>

                          {/* Amount */}
                          <td className="py-3 px-3 font-extrabold text-slate-900 dark:text-white whitespace-nowrap">
                            ₹{due.amountDue.toLocaleString('en-IN')}
                          </td>

                          {/* Note */}
                          <td className="py-3 px-3 text-slate-400 text-[11px] truncate max-w-[150px] hidden md:table-cell">
                            {due.notes || 'Site invoice payment'}
                          </td>

                          {/* Status Badge */}
                          <td className="py-3 px-3 whitespace-nowrap">
                            {isCompleted ? (
                              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-[#E6F9F0] text-[#12B76A] border border-[#B3F4D2]">
                                Completed
                              </span>
                            ) : isOverdue ? (
                              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-red-50 text-red-600 border border-red-200">
                                Overdue
                              </span>
                            ) : (
                              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-amber-50 text-amber-700 border border-amber-200">
                                Pending
                              </span>
                            )}
                          </td>

                          {/* Settle Action */}
                          <td className="py-3 pl-3 text-right whitespace-nowrap">
                            {!isCompleted ? (
                              <button
                                onClick={() => handleSettleFullDue(due)}
                                className="px-2.5 py-1 rounded-lg text-[10px] font-bold bg-emerald-600 hover:bg-emerald-700 text-white shadow-2xs active:scale-95 transition-all cursor-pointer"
                              >
                                Settle
                              </button>
                            ) : (
                              <span className="text-[10px] font-bold text-slate-400">Settled</span>
                            )}
                          </td>

                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>

          </div>

        </div>

        {/* Right 1 Column: "My Card", Budget Limit & Recent Activity */}
        <div className="space-y-4">
          
          {/* "My Card" / Contractor Payment Card (PayFlow Exact Match) */}
          <div className="bg-white dark:bg-slate-900 p-4 sm:p-5 rounded-[24px] border border-slate-100 dark:border-slate-800 shadow-[0_4px_20px_rgba(0,0,0,0.03)] space-y-3.5">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-extrabold text-slate-900 dark:text-white font-heading">
                My Card
              </h3>
              <button
                onClick={onOpenAddDue}
                className="text-xs font-bold text-blue-600 dark:text-blue-400 hover:underline cursor-pointer"
              >
                + Add card
              </button>
            </div>

            {/* Metallic Electric Blue Debit Card */}
            <div className="relative overflow-hidden rounded-[22px] bg-gradient-to-tr from-[#2563EB] via-[#3B82F6] to-[#60A5FA] p-4 text-white shadow-[0_10px_25px_rgba(37,99,235,0.35)] space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-blue-100">Total balance</span>
                <Wifi className="w-4 h-4 rotate-90 text-blue-100" />
              </div>

              <div>
                <span className="text-2xl font-black font-heading tracking-tight">
                  ₹{totalUnpaidAmount.toLocaleString('en-IN')}
                </span>
                <span className="text-[10px] text-blue-200 block font-medium">Pending Supplier Invoices</span>
              </div>

              <div className="flex items-center justify-between pt-2 text-[10px] font-semibold text-blue-100">
                <span className="font-bold tracking-wider uppercase">
                  {sites[0]?.name?.split(' ')[0] || 'SITE MANAGER'}
                </span>
                <div className="flex items-center gap-3">
                  <div>
                    <span className="block text-[8px] text-blue-200">EXP</span>
                    <span>12/28</span>
                  </div>
                  <div>
                    <span className="block text-[8px] text-blue-200">CVV</span>
                    <span>334</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Card Action Icons (PayFlow Match: Top Up, Transfer, Request, Add) */}
            <div className="grid grid-cols-4 gap-2 pt-1 text-center">
              <button
                onClick={onOpenAddDue}
                className="flex flex-col items-center justify-center p-2 rounded-xl bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 text-slate-700 dark:text-slate-300 transition-colors cursor-pointer group"
              >
                <div className="w-8 h-8 rounded-lg bg-white dark:bg-slate-700 shadow-2xs flex items-center justify-center mb-1 group-hover:scale-110 transition-transform">
                  <Plus className="w-4 h-4 text-blue-600" />
                </div>
                <span className="text-[10px] font-bold">Top Up</span>
              </button>

              <button
                onClick={() => {
                  if (unpaidDues.length > 0) handleSettleFullDue(unpaidDues[0]);
                }}
                className="flex flex-col items-center justify-center p-2 rounded-xl bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 text-slate-700 dark:text-slate-300 transition-colors cursor-pointer group"
              >
                <div className="w-8 h-8 rounded-lg bg-white dark:bg-slate-700 shadow-2xs flex items-center justify-center mb-1 group-hover:scale-110 transition-transform">
                  <ArrowUpRight className="w-4 h-4 text-emerald-600" />
                </div>
                <span className="text-[10px] font-bold">Transfer</span>
              </button>

              <button
                onClick={onOpenAddDue}
                className="flex flex-col items-center justify-center p-2 rounded-xl bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 text-slate-700 dark:text-slate-300 transition-colors cursor-pointer group"
              >
                <div className="w-8 h-8 rounded-lg bg-white dark:bg-slate-700 shadow-2xs flex items-center justify-center mb-1 group-hover:scale-110 transition-transform">
                  <ArrowDownLeft className="w-4 h-4 text-purple-600" />
                </div>
                <span className="text-[10px] font-bold">Request</span>
              </button>

              <button
                onClick={onRefresh}
                className="flex flex-col items-center justify-center p-2 rounded-xl bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 text-slate-700 dark:text-slate-300 transition-colors cursor-pointer group"
              >
                <div className="w-8 h-8 rounded-lg bg-white dark:bg-slate-700 shadow-2xs flex items-center justify-center mb-1 group-hover:scale-110 transition-transform">
                  <RotateCw className="w-4 h-4 text-slate-600 dark:text-slate-300" />
                </div>
                <span className="text-[10px] font-bold">Refresh</span>
              </button>
            </div>

          </div>

          {/* Daily / Site Budget Limit Gauge (PayFlow Match) */}
          <div className="bg-white dark:bg-slate-900 p-4 sm:p-5 rounded-[24px] border border-slate-100 dark:border-slate-800 shadow-[0_4px_20px_rgba(0,0,0,0.03)] space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-extrabold text-slate-900 dark:text-white font-heading">
                Budget Limit
              </h3>
              <MoreVertical className="w-4 h-4 text-slate-400 cursor-pointer" />
            </div>

            <div className="flex items-center justify-between text-xs font-bold">
              <span className="text-slate-400">
                {new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
              </span>
              <span className="text-[#4F46E5]">57%</span>
            </div>

            {/* Progress Bar */}
            <div className="w-full h-2.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
              <div className="h-full bg-gradient-to-r from-[#4F46E5] to-[#6366F1] rounded-full w-[57%]" />
            </div>

            <div className="flex items-center justify-between text-[11px] font-semibold text-slate-500">
              <span>Spent ₹10,110.00</span>
              <span>Total ₹20,000.00</span>
            </div>
          </div>

          {/* Recent Activity Feed (PayFlow Match) */}
          <div className="bg-white dark:bg-slate-900 p-4 sm:p-5 rounded-[24px] border border-slate-100 dark:border-slate-800 shadow-[0_4px_20px_rgba(0,0,0,0.03)] space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-extrabold text-slate-900 dark:text-white font-heading">
                Recent Activity
              </h3>
              <span className="text-xs font-bold text-blue-600 dark:text-blue-400 cursor-pointer">
                View all
              </span>
            </div>

            <div className="space-y-3">
              {recentActivities.map((act) => (
                <div key={act.id} className="flex items-start gap-2.5">
                  <div className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center font-bold text-xs text-blue-600 shrink-0 shadow-2xs">
                    {act.title[0]}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-bold text-xs text-slate-900 dark:text-white truncate">
                      {act.title}
                    </div>
                    <div className="text-[10px] text-slate-400 truncate">
                      {act.action}
                    </div>
                  </div>
                  <span className="text-[10px] text-slate-400 font-medium shrink-0">
                    {act.time}
                  </span>
                </div>
              ))}
            </div>
          </div>

        </div>

      </div>

    </div>
  );
};
