import React, { useState, useMemo } from 'react';
import confetti from 'canvas-confetti';
import { useTheme } from '../../core/theme/ThemeContext';
import { ExpenseDue, Site, Vendor } from '../../types';
import { db } from '../../core/db/database';
import {
  Receipt,
  Plus,
  Search,
  Building,
  Calendar,
  CheckCircle2,
  AlertCircle,
  Clock,
  Flame,
  Edit2,
  Trash2,
  Check,
  Package,
  Wrench,
  Truck,
  Users,
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

  const siteMap = useMemo(() => new Map(sites.map((s) => [s.id, s])), [sites]);

  // Financial aggregates
  const unpaidDues = dues.filter((d) => d.status !== 'paid');
  const paidDues = dues.filter((d) => d.status === 'paid');

  const totalUnpaidAmount = unpaidDues.reduce(
    (acc, d) => acc + (d.amountDue - (d.amountPaid || 0)),
    0
  );
  const totalPaidAmount = paidDues.reduce((acc, d) => acc + (d.amountPaid || d.amountDue), 0);

  // Completed site dues (Crucial for contractors to recover pending money!)
  const completedSiteDues = unpaidDues.filter((d) => {
    const site = siteMap.get(d.siteId);
    return site && site.workStatus === 'completed';
  });
  const totalCompletedSiteDuesAmount = completedSiteDues.reduce(
    (acc, d) => acc + (d.amountDue - (d.amountPaid || 0)),
    0
  );

  // Filtered dues based on search, category and completed site toggle
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

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'material':
        return <Package className="w-3.5 h-3.5 text-blue-600" />;
      case 'tool_rent':
        return <Wrench className="w-3.5 h-3.5 text-amber-600" />;
      case 'machinery':
        return <Truck className="w-3.5 h-3.5 text-purple-600" />;
      case 'labour':
        return <Users className="w-3.5 h-3.5 text-emerald-600" />;
      default:
        return <Receipt className="w-3.5 h-3.5 text-slate-600" />;
    }
  };

  return (
    <div className="space-y-4 animate-fade-in pb-16">
      
      {/* 1. Header with Direct Add Due Button */}
      <div className="flex items-center justify-between gap-3 bg-white dark:bg-slate-900 p-4 rounded-[24px] border border-slate-100 dark:border-slate-800 shadow-[0_4px_20px_rgba(0,0,0,0.03)]">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-base sm:text-lg font-extrabold text-slate-900 dark:text-white font-heading tracking-tight">
              {language === 'hi' ? 'बकाया बिल व सप्लायर उधारी' : 'Pending Bills & Supplier Udhaar'}
            </h1>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-red-100 text-red-600">
              {unpaidDues.length} Due
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            {language === 'hi' ? 'सीमेंट, सरिया, ईंटें व ठेकेदार बकाया' : 'Material credit, equipment & labour dues'}
          </p>
        </div>

        <button
          onClick={onOpenAddDue}
          className="px-4 py-2 rounded-xl text-xs font-bold bg-[#1877F2] hover:bg-blue-700 text-white shadow-[0_4px_14px_rgba(24,119,242,0.35)] flex items-center gap-1.5 active:scale-95 transition-all cursor-pointer shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>{language === 'hi' ? '+ नया बिल' : '+ Add Bill'}</span>
        </button>
      </div>

      {/* 2. Top 3 Contractor Ledger KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
        
        {/* Total Outstanding Udhaar */}
        <div className="p-4 rounded-[22px] bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 shadow-[0_4px_16px_rgba(0,0,0,0.03)] flex flex-col justify-between">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-slate-500">
              {language === 'hi' ? 'कुल बकाया उधारी' : 'Total Outstanding'}
            </span>
            <div className="w-6 h-6 rounded-lg bg-red-50 text-red-600 flex items-center justify-center font-bold text-xs">
              ₹
            </div>
          </div>
          <div>
            <div className="text-xl sm:text-2xl font-black text-red-600 dark:text-red-400 font-heading">
              ₹{totalUnpaidAmount.toLocaleString('en-IN')}
            </div>
            <span className="text-[11px] text-slate-400 block mt-0.5">
              {unpaidDues.length} {language === 'hi' ? 'सप्लायर बिल बाकी' : 'unpaid vendor bills'}
            </span>
          </div>
        </div>

        {/* Dues on Completed Sites */}
        <div className="p-4 rounded-[22px] bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 shadow-[0_4px_16px_rgba(0,0,0,0.03)] flex flex-col justify-between">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-slate-500">
              {language === 'hi' ? 'पूर्ण साइट्स का बाकी' : 'Completed Sites Due'}
            </span>
            <div className="w-6 h-6 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center font-bold text-xs">
              <Clock className="w-3.5 h-3.5" />
            </div>
          </div>
          <div>
            <div className="text-xl sm:text-2xl font-black text-amber-700 dark:text-amber-400 font-heading">
              ₹{totalCompletedSiteDuesAmount.toLocaleString('en-IN')}
            </div>
            <span className="text-[11px] text-slate-400 block mt-0.5">
              {completedSiteDues.length} {language === 'hi' ? 'अति आवश्यक बिल' : 'urgent finished job bills'}
            </span>
          </div>
        </div>

        {/* Settled / Paid Bills */}
        <div className="p-4 rounded-[22px] bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 shadow-[0_4px_16px_rgba(0,0,0,0.03)] flex flex-col justify-between">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-slate-500">
              {language === 'hi' ? 'चुकता किए गए बिल' : 'Paid / Settled'}
            </span>
            <div className="w-6 h-6 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold text-xs">
              <CheckCircle2 className="w-3.5 h-3.5" />
            </div>
          </div>
          <div>
            <div className="text-xl sm:text-2xl font-black text-emerald-600 dark:text-emerald-400 font-heading">
              ₹{totalPaidAmount.toLocaleString('en-IN')}
            </div>
            <span className="text-[11px] text-slate-400 block mt-0.5">
              {paidDues.length} {language === 'hi' ? 'बिल चुकता हुए' : 'bills fully cleared'}
            </span>
          </div>
        </div>

      </div>

      {/* 3. Completed Site Warning Banner */}
      {completedSiteDues.length > 0 && (
        <div className="p-4 rounded-[22px] bg-gradient-to-r from-red-500/10 via-amber-500/10 to-orange-500/10 border-2 border-red-400/40 dark:border-red-800/60 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-xs">
          <div className="flex items-start gap-3">
            <div className="p-2 rounded-xl bg-red-600 text-white shadow-xs">
              <Flame className="w-4 h-4 animate-bounce" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-extrabold text-sm text-slate-900 dark:text-white">
                  {language === 'hi' ? 'पूर्ण साइट्स का बकाया चुकता करें' : 'Completed Sites Outstanding'}
                </h3>
                <span className="px-2 py-0.5 rounded text-[10px] font-black bg-red-600 text-white">
                  {completedSiteDues.length} Urgent
                </span>
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-300 mt-0.5">
                {language === 'hi'
                  ? `₹${totalCompletedSiteDuesAmount.toLocaleString('en-IN')} की उधारी उन साइट्स की है जिनका काम पूरा हो चुका है।`
                  : `₹${totalCompletedSiteDuesAmount.toLocaleString('en-IN')} pending across completed projects.`}
              </p>
            </div>
          </div>

          <button
            onClick={() => setShowCompletedOnly(!showCompletedOnly)}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-extrabold transition-all whitespace-nowrap cursor-pointer ${
              showCompletedOnly
                ? 'bg-red-600 text-white shadow-md'
                : 'bg-white dark:bg-slate-800 text-red-600 border border-red-200 hover:bg-red-50'
            }`}
          >
            {showCompletedOnly ? 'Show All Dues' : 'Filter Completed Site Bills'}
          </button>
        </div>
      )}

      {/* 4. Search and Category Filter Strip */}
      <div className="bg-white dark:bg-slate-900 p-3.5 rounded-[22px] border border-slate-100 dark:border-slate-800 shadow-[0_4px_16px_rgba(0,0,0,0.03)] space-y-3">
        
        {/* Search Input */}
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={language === 'hi' ? 'सामान, दुकानदार या साइट खोजें...' : 'Search by bill, supplier, or site...'}
            className="w-full pl-10 pr-3 py-2.5 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700 text-xs font-semibold text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Category Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar -mx-1 px-1">
          {[
            { id: 'all', label: language === 'hi' ? 'सभी' : 'All' },
            { id: 'material', label: language === 'hi' ? 'सामान' : 'Material' },
            { id: 'machinery', label: language === 'hi' ? 'मशीनरी' : 'Machinery' },
            { id: 'tool_rent', label: language === 'hi' ? 'औजार' : 'Tools' },
            { id: 'labour', label: language === 'hi' ? 'लेबर' : 'Labour' },
          ].map((cat) => (
            <button
              key={cat.id}
              onClick={() => setFilterCategory(cat.id)}
              className={`shrink-0 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                filterCategory === cat.id
                  ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900 shadow-xs'
                  : 'bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-100'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

      </div>

      {/* 5. Real Dues Ledger Feed */}
      <div className="space-y-3">
        {filteredDues.length === 0 ? (
          <div className="text-center py-10 bg-white dark:bg-slate-900 rounded-[24px] border border-slate-100 dark:border-slate-800 p-6 space-y-2">
            <Receipt className="w-10 h-10 mx-auto text-slate-300" />
            <h4 className="font-extrabold text-sm text-slate-700 dark:text-slate-300">
              {language === 'hi' ? 'कोई बकाया बिल नहीं मिला' : 'No dues found'}
            </h4>
            <p className="text-xs text-slate-400">
              {language === 'hi' ? 'दुकानदार उधारी या सामान का बिल जोड़ने के लिए ऊपर बटन दबाएं' : 'Add a new vendor bill or supplier credit above'}
            </p>
          </div>
        ) : (
          filteredDues.map((due) => {
            const site = siteMap.get(due.siteId);
            const isSiteCompleted = site?.workStatus === 'completed';
            const balance = due.amountDue - (due.amountPaid || 0);
            const isPaid = due.status === 'paid';

            return (
              <div
                key={due.id}
                className={`bg-white dark:bg-slate-900 rounded-[24px] p-4 border shadow-[0_4px_16px_rgba(0,0,0,0.03)] flex flex-col justify-between transition-all space-y-3 ${
                  isPaid
                    ? 'border-slate-100 dark:border-slate-800 opacity-75'
                    : isSiteCompleted
                    ? 'border-red-200 dark:border-red-900/60 bg-red-50/20'
                    : 'border-slate-100 dark:border-slate-800'
                }`}
              >
                
                {/* Top Row: Title, Category Icon & Status */}
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-start gap-2.5 min-w-0">
                    <div className="w-9 h-9 rounded-xl bg-slate-50 dark:bg-slate-800 flex items-center justify-center shrink-0">
                      {getCategoryIcon(due.category)}
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <h4 className="font-extrabold text-sm text-slate-900 dark:text-white font-heading truncate">
                          {due.title}
                        </h4>
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 uppercase">
                          {due.category}
                        </span>
                        {isSiteCompleted && (
                          <span className="px-2 py-0.5 rounded text-[10px] font-black bg-red-100 text-red-600">
                            Completed Site
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-1 text-[11px] text-slate-400 mt-0.5">
                        <Building className="w-3 h-3 text-slate-400" />
                        <span className="truncate">{site?.name || 'General Site'}</span>
                        <span>•</span>
                        <Calendar className="w-3 h-3 text-slate-400" />
                        <span>Due: {due.dueDate}</span>
                      </div>
                    </div>
                  </div>

                  {/* Actions & Status Badge */}
                  <div className="flex items-center gap-1.5 shrink-0">
                    {onEditDue && (
                      <button
                        onClick={() => onEditDue(due)}
                        className="p-1.5 text-slate-400 hover:text-blue-600 rounded-lg hover:bg-slate-50 cursor-pointer"
                        title="Edit"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                    {onDeleteDue && (
                      <button
                        onClick={() => onDeleteDue(due)}
                        className="p-1.5 text-slate-400 hover:text-red-600 rounded-lg hover:bg-slate-50 cursor-pointer"
                        title="Delete"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}

                    {isPaid ? (
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-[#E6F9F0] text-[#12B76A] border border-[#B3F4D2]">
                        Paid
                      </span>
                    ) : due.status === 'overdue' ? (
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-red-50 text-red-600 border border-red-200">
                        Overdue
                      </span>
                    ) : (
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-amber-50 text-amber-700 border border-amber-200">
                        Pending
                      </span>
                    )}
                  </div>
                </div>

                {due.notes && (
                  <p className="text-[11px] text-slate-500 bg-slate-50 dark:bg-slate-800/60 p-2 rounded-xl italic">
                    "{due.notes}"
                  </p>
                )}

                {/* Bottom Row: Balance & 1-Tap Settle */}
                <div className="pt-2.5 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                  <div>
                    <span className="text-[10px] text-slate-400 font-bold block">Balance Due</span>
                    <span className="text-base font-black text-red-600 dark:text-red-400 font-heading">
                      ₹{balance.toLocaleString('en-IN')}
                    </span>
                    <span className="text-[10px] text-slate-400 ml-1.5 font-medium">
                      (Total ₹{due.amountDue.toLocaleString('en-IN')})
                    </span>
                  </div>

                  {!isPaid ? (
                    <button
                      onClick={() => handleSettleFullDue(due)}
                      className="px-3.5 py-1.5 rounded-xl font-bold text-xs bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs active:scale-95 transition-all flex items-center gap-1.5 cursor-pointer"
                    >
                      <Check className="w-3.5 h-3.5" />
                      <span>{language === 'hi' ? 'चुकता करें' : 'Mark Settled'}</span>
                    </button>
                  ) : (
                    <span className="text-xs font-bold text-emerald-600 flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Fully Cleared</span>
                    </span>
                  )}
                </div>

              </div>
            );
          })
        )}
      </div>

    </div>
  );
};
