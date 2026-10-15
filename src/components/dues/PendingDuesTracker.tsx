import React, { useState } from 'react';
import { useTheme } from '../../core/theme/ThemeContext';
import { ExpenseDue, Site, Vendor } from '../../types';
import { db } from '../../core/db/database';
import {
  Receipt,
  AlertCircle,
  CheckCircle2,
  Clock,
  Plus,
  Search,
  Building,
  Calendar,
  IndianRupee,
  Users,
  Check,
  Flame,
  Edit2,
  Trash2,
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

  const siteMap = new Map(sites.map((s) => [s.id, s]));

  // Categorize dues
  const unpaidDues = dues.filter((d) => d.status !== 'paid');
  const paidDues = dues.filter((d) => d.status === 'paid');

  // Completed site dues (KEY SPECIFICATION REQUIREMENT!)
  const completedSiteDues = unpaidDues.filter((d) => {
    const site = siteMap.get(d.siteId);
    return site && site.workStatus === 'completed';
  });

  const totalUnpaidAmount = unpaidDues.reduce(
    (acc, d) => acc + (d.amountDue - (d.amountPaid || 0)),
    0
  );

  const totalCompletedSiteDuesAmount = completedSiteDues.reduce(
    (acc, d) => acc + (d.amountDue - (d.amountPaid || 0)),
    0
  );

  const filteredDues = dues.filter((due) => {
    const site = siteMap.get(due.siteId);
    const siteName = site?.name || '';
    const matchesSearch =
      due.title.toLowerCase().includes(search.toLowerCase()) ||
      siteName.toLowerCase().includes(search.toLowerCase());
    const matchesCat = filterCategory === 'all' || due.category === filterCategory;
    const matchesCompleted = showCompletedOnly ? site?.workStatus === 'completed' : true;

    return matchesSearch && matchesCat && matchesCompleted;
  });

  const handleSettleFullDue = async (due: ExpenseDue) => {
    await db.dues.update(due.id, {
      amountPaid: due.amountDue,
      status: 'paid',
    });
    onRefresh();
  };

  return (
    <div className="space-y-4">
      
      {/* Top Banner - Compact */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 bg-white dark:bg-slate-900 p-3.5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-lg sm:text-xl font-black text-slate-900 dark:text-white font-heading">
              {language === 'hi' ? 'बकाया बिल व उधारी' : 'Pending Dues'}
            </h1>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-red-100 dark:bg-red-950/60 text-red-700 dark:text-red-400 border border-red-200 dark:border-red-900">
              {unpaidDues.length} {language === 'hi' ? 'बाकी' : 'Due'}
            </span>
          </div>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
            {language === 'hi'
              ? 'दुकानदारों, सप्लायर्स व औजारों का बकाया हिसाब'
              : 'Vendor credit, equipment rents & outstanding invoices'}
          </p>
        </div>

        <button
          onClick={onOpenAddDue}
          className="px-3.5 py-2 rounded-xl text-xs font-bold text-white shadow-sm flex items-center justify-center gap-1.5 transition-all btn-tactile glow-theme self-start sm:self-auto"
          style={{ backgroundColor: tradeConfig.primaryColor }}
        >
          <Plus className="w-3.5 h-3.5" />
          <span>{language === 'hi' ? '+ नया बिल' : '+ Add Due'}</span>
        </button>
      </div>

      {/* SPECIAL NOTICE FOR COMPLETED SITE DUES */}
      {completedSiteDues.length > 0 && (
        <div className="p-4 rounded-2xl bg-gradient-to-r from-red-500/10 via-amber-500/10 to-orange-500/10 border-2 border-red-400/40 dark:border-red-800/60 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-sm">
          <div className="flex items-start gap-3">
            <div className="p-2.5 rounded-xl bg-red-600 text-white shadow">
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
                  ? `₹${totalCompletedSiteDuesAmount.toLocaleString('en-IN')} की उधारी उन साइट्स की है जिनका काम पूरा हो चुका है। ये बिल तब तक याद रहेंगे जब तक चुकता न हों।`
                  : `₹${totalCompletedSiteDuesAmount.toLocaleString('en-IN')} outstanding across completed jobs. These stay active until explicitly settled.`}
              </p>
            </div>
          </div>

          <button
            onClick={() => setShowCompletedOnly(!showCompletedOnly)}
            className={`px-3.5 py-2 rounded-xl text-xs font-extrabold transition-all btn-tactile whitespace-nowrap ${
              showCompletedOnly
                ? 'bg-red-600 text-white shadow-md'
                : 'bg-white dark:bg-slate-800 text-red-600 dark:text-red-400 border border-red-200 dark:border-red-900 hover:bg-red-50'
            }`}
          >
            {showCompletedOnly
              ? language === 'hi'
                ? 'सभी बिल देखें'
                : 'Show All Dues'
              : language === 'hi'
              ? 'केवल पूर्ण साइट्स के बिल देखें'
              : 'Filter Completed Site Bills'}
          </button>
        </div>
      )}

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="p-4 rounded-2xl bg-white dark:bg-slate-800/80 border border-slate-200/90 dark:border-slate-700">
          <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 block">
            Total Outstanding Dues
          </span>
          <span className="text-xl sm:text-2xl font-black text-red-600 dark:text-red-400 mt-1 block">
            ₹{totalUnpaidAmount.toLocaleString('en-IN')}
          </span>
        </div>

        <div className="p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200/80 dark:border-amber-900/50">
          <span className="text-[11px] font-bold text-amber-700 dark:text-amber-400 block">
            Dues on Completed Sites
          </span>
          <span className="text-xl sm:text-2xl font-black text-amber-800 dark:text-amber-300 mt-1 block">
            ₹{totalCompletedSiteDuesAmount.toLocaleString('en-IN')}
          </span>
        </div>

        <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200/80 dark:border-emerald-900/50">
          <span className="text-[11px] font-bold text-emerald-700 dark:text-emerald-400 block">
            Settled / Paid Bills
          </span>
          <span className="text-xl sm:text-2xl font-black text-emerald-800 dark:text-emerald-300 mt-1 block">
            {paidDues.length} Bills Settled
          </span>
        </div>
      </div>

      {/* Search & Filter Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-white dark:bg-slate-800/80 p-3 rounded-2xl border border-slate-200 dark:border-slate-700">
        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={language === 'hi' ? 'दुकानदार, सामान या साइट खोजें...' : 'Search dues or site name...'}
            className="w-full pl-9 pr-3 py-2 rounded-xl text-xs font-semibold bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 focus:outline-none dark:text-white"
          />
        </div>

        <div className="flex items-center gap-1.5 w-full sm:w-auto overflow-x-auto no-scrollbar">
          {[
            { id: 'all', label: language === 'hi' ? 'सभी' : 'All' },
            { id: 'material', label: language === 'hi' ? 'सामान' : 'Material' },
            { id: 'tool_rent', label: language === 'hi' ? 'औजार किराया' : 'Tool Rent' },
            { id: 'machinery', label: language === 'hi' ? 'मशीनरी' : 'Machinery' },
            { id: 'labour', label: language === 'hi' ? 'लेबर मजदूरी' : 'Labour' },
          ].map((cat) => (
            <button
              key={cat.id}
              onClick={() => setFilterCategory(cat.id)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all whitespace-nowrap ${
                filterCategory === cat.id
                  ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900 shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      {/* Dues Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredDues.map((due) => {
          const site = siteMap.get(due.siteId);
          const isSiteCompleted = site?.workStatus === 'completed';
          const balance = due.amountDue - (due.amountPaid || 0);

          return (
            <div
              key={due.id}
              className={`bg-white dark:bg-slate-800/90 rounded-2xl p-5 border shadow-sm flex flex-col justify-between transition-all ${
                due.status === 'paid'
                  ? 'border-slate-200 dark:border-slate-800 opacity-70'
                  : isSiteCompleted
                  ? 'border-red-300 dark:border-red-900/90 bg-red-50/20 dark:bg-red-950/20'
                  : 'border-slate-200/90 dark:border-slate-700/80'
              }`}
            >
              <div className="space-y-3">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h3 className="font-extrabold text-base text-slate-900 dark:text-white line-clamp-1 font-heading">
                      {due.title}
                    </h3>
                    <div className="flex items-center gap-1.5 mt-0.5">
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300">
                        {due.category}
                      </span>
                      {isSiteCompleted && (
                        <span className="px-2 py-0.5 rounded text-[10px] font-black bg-red-100 text-red-700 dark:bg-red-950/60 dark:text-red-400">
                          {language === 'hi' ? 'काम पूरा, बिल बाकी' : 'Completed Site'}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-1">
                    {onEditDue && (
                      <button
                        onClick={() => onEditDue(due)}
                        className="p-1 text-slate-400 hover:text-blue-600 rounded hover:bg-slate-100"
                        title="Edit Due"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                    )}

                    {onDeleteDue && (
                      <button
                        onClick={() => onDeleteDue(due)}
                        className="p-1 text-slate-400 hover:text-red-600 rounded hover:bg-slate-100"
                        title="Delete Due"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}

                    {due.status === 'paid' ? (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-green-100 text-green-700 dark:bg-green-950/60 dark:text-green-400 flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3" /> Paid
                      </span>
                    ) : due.status === 'overdue' ? (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-red-100 text-red-700 dark:bg-red-950/60 dark:text-red-400 flex items-center gap-1 animate-pulse">
                        <AlertCircle className="w-3 h-3" /> Overdue
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-400">
                        Pending
                      </span>
                    )}
                  </div>
                </div>

                <div className="space-y-1 text-xs text-slate-600 dark:text-slate-400">
                  <div className="flex items-center gap-1.5 font-bold text-slate-800 dark:text-slate-200">
                    <Building className="w-3.5 h-3.5 text-orange-500 flex-shrink-0" />
                    <span className="truncate">{site?.name || 'Assigned Site'}</span>
                  </div>

                  <div className="flex items-center gap-1 text-[11px] text-slate-500">
                    <Calendar className="w-3 h-3" />
                    Due Date: {due.dueDate}
                  </div>
                </div>

                {due.notes && (
                  <p className="text-[11px] text-slate-500 italic bg-slate-50 dark:bg-slate-900/60 p-2 rounded-lg border border-slate-100 dark:border-slate-800">
                    "{due.notes}"
                  </p>
                )}
              </div>

              <div className="pt-3 mt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs">
                <div>
                  <span className="text-[10px] text-slate-400 block">Balance Due</span>
                  <span className="font-black text-base text-red-600 dark:text-red-400">
                    ₹{balance.toLocaleString('en-IN')}
                  </span>
                </div>

                {due.status !== 'paid' ? (
                  <button
                    onClick={() => handleSettleFullDue(due)}
                    className="px-3.5 py-1.5 rounded-xl font-extrabold text-xs bg-emerald-600 text-white hover:bg-emerald-700 shadow-sm transition-all btn-tactile flex items-center gap-1"
                  >
                    <Check className="w-3.5 h-3.5" />
                    <span>{t('markPaid')}</span>
                  </button>
                ) : (
                  <span className="text-[11px] text-emerald-600 font-bold">
                    Fully Settled
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {filteredDues.length === 0 && (
        <div className="text-center py-12 bg-white dark:bg-slate-800/60 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 space-y-3">
          <Receipt className="w-12 h-12 mx-auto text-slate-400" />
          <h3 className="font-extrabold text-slate-700 dark:text-slate-300 text-base">
            {language === 'hi' ? 'कोई बकाया बिल नहीं है' : 'No pending dues logged'}
          </h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            {language === 'hi' ? 'दुकानदार उधारी, पेटी ठेकेदार या औजारों का किराया दर्ज करें।' : 'Track vendor udhaar and supplier bills across ongoing and completed sites.'}
          </p>
        </div>
      )}

    </div>
  );
};
