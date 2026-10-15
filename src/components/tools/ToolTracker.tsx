import React, { useState } from 'react';
import { useTheme } from '../../core/theme/ThemeContext';
import { ToolRecord, Site } from '../../types';
import { db } from '../../core/db/database';
import {
  Wrench,
  AlertCircle,
  CheckCircle2,
  Plus,
  Search,
  Building,
  Calendar,
  Warehouse,
  ShoppingBag,
  Edit2,
  Trash2,
  Sparkles,
} from 'lucide-react';

interface ToolTrackerProps {
  tools: ToolRecord[];
  sites: Site[];
  onOpenAddTool: () => void;
  onRefresh: () => void;
  onEditTool?: (tool: ToolRecord) => void;
  onDeleteTool?: (tool: ToolRecord) => void;
}

export const ToolTracker: React.FC<ToolTrackerProps> = ({
  tools,
  sites,
  onOpenAddTool,
  onRefresh,
  onEditTool,
  onDeleteTool,
}) => {
  const { language, tradeConfig } = useTheme();
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'on_site' | 'purchased' | 'overdue' | 'returned'>('all');

  const siteMap = new Map(sites.map((s) => [s.id, s.name]));

  // Categorize
  const onSiteCount = tools.filter((t) => !t.actualReturnDate).length;
  const selfOwnedCount = tools.filter((t) => t.sourceType !== 'purchased_for_site').length;
  const purchasedTools = tools.filter((t) => t.sourceType === 'purchased_for_site');
  const purchasedTotalCost = purchasedTools.reduce((acc, t) => acc + (t.purchasePrice || t.rentOrRepairCost || 0), 0);
  const returnedCount = tools.filter((t) => !!t.actualReturnDate).length;

  const overdueCount = tools.filter(
    (t) => (t.status === 'overdue' || (!t.actualReturnDate && new Date(t.expectedReturnDate) < new Date())) && !t.actualReturnDate
  ).length;

  const filteredTools = tools.filter((tool) => {
    const siteName = siteMap.get(tool.siteId) || '';
    const matchesSearch =
      tool.name.toLowerCase().includes(search.toLowerCase()) ||
      siteName.toLowerCase().includes(search.toLowerCase()) ||
      (tool.notes && tool.notes.toLowerCase().includes(search.toLowerCase()));

    const isOverdue = tool.status === 'overdue' || (!tool.actualReturnDate && new Date(tool.expectedReturnDate) < new Date());

    if (filterStatus === 'overdue') return matchesSearch && isOverdue && !tool.actualReturnDate;
    if (filterStatus === 'on_site') return matchesSearch && !tool.actualReturnDate;
    if (filterStatus === 'purchased') return matchesSearch && tool.sourceType === 'purchased_for_site';
    if (filterStatus === 'returned') return matchesSearch && !!tool.actualReturnDate;
    return matchesSearch;
  });

  const handleMarkReturned = async (toolId: string) => {
    await db.tools.update(toolId, {
      actualReturnDate: new Date().toISOString().split('T')[0],
      status: 'returned',
    });
    onRefresh();
  };

  return (
    <div className="space-y-6">
      
      {/* Top Banner with Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white font-heading">
              {language === 'hi' ? 'साइट औजार व उपकरण ट्रैकर' : 'Tools & Equipment Tracker'}
            </h1>
            {overdueCount > 0 && (
              <span className="px-2.5 py-0.5 rounded-full text-xs font-black bg-red-100 dark:bg-red-950/60 text-red-700 dark:text-red-400 animate-pulse border border-red-200 dark:border-red-900">
                {overdueCount} {language === 'hi' ? 'वापसी में देरी' : 'Overdue'}
              </span>
            )}
          </div>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            {language === 'hi'
              ? 'गोदाम से भेजे गए अपने औजार और साइट पर खरीदे गए टूल्स का संपूर्ण हिसाब रखें।'
              : 'Track self-owned tools sent from godown and new tools purchased for job sites.'}
          </p>
        </div>

        <button
          onClick={onOpenAddTool}
          className="px-4 py-2.5 rounded-xl text-xs font-extrabold text-white shadow-md flex items-center justify-center gap-2 transition-all btn-tactile glow-theme self-start sm:self-auto"
          style={{ backgroundColor: tradeConfig.primaryColor }}
        >
          <Plus className="w-4 h-4" />
          <span>{language === 'hi' ? '+ औजार जोड़ें' : '+ Add Tool'}</span>
        </button>
      </div>

      {/* KPI Stats Ribbon */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-white dark:bg-slate-800/80 p-3.5 rounded-2xl border border-slate-200/80 dark:border-slate-700/80 flex items-center gap-3 shadow-sm">
          <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400 flex items-center justify-center flex-shrink-0">
            <Wrench className="w-5 h-5" />
          </div>
          <div>
            <div className="text-lg font-black text-slate-900 dark:text-white leading-tight font-heading">
              {onSiteCount}
            </div>
            <div className="text-[11px] font-semibold text-slate-500 dark:text-slate-400">
              {language === 'hi' ? 'साइट्स पर मौजूद' : 'Active on Sites'}
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-800/80 p-3.5 rounded-2xl border border-slate-200/80 dark:border-slate-700/80 flex items-center gap-3 shadow-sm">
          <div className="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400 flex items-center justify-center flex-shrink-0">
            <Warehouse className="w-5 h-5" />
          </div>
          <div>
            <div className="text-lg font-black text-slate-900 dark:text-white leading-tight font-heading">
              {selfOwnedCount}
            </div>
            <div className="text-[11px] font-semibold text-slate-500 dark:text-slate-400">
              {language === 'hi' ? 'गोदाम के औजार' : 'Self-Owned Tools'}
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-800/80 p-3.5 rounded-2xl border border-slate-200/80 dark:border-slate-700/80 flex items-center gap-3 shadow-sm">
          <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 flex items-center justify-center flex-shrink-0">
            <ShoppingBag className="w-5 h-5" />
          </div>
          <div>
            <div className="text-lg font-black text-slate-900 dark:text-white leading-tight font-heading">
              ₹{purchasedTotalCost.toLocaleString('en-IN')}
            </div>
            <div className="text-[11px] font-semibold text-slate-500 dark:text-slate-400">
              {language === 'hi' ? `साइट खरीद (${purchasedTools.length})` : `Purchased (${purchasedTools.length})`}
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-800/80 p-3.5 rounded-2xl border border-slate-200/80 dark:border-slate-700/80 flex items-center gap-3 shadow-sm">
          <div className="w-10 h-10 rounded-xl bg-teal-50 dark:bg-teal-950/50 text-teal-600 dark:text-teal-400 flex items-center justify-center flex-shrink-0">
            <CheckCircle2 className="w-5 h-5" />
          </div>
          <div>
            <div className="text-lg font-black text-slate-900 dark:text-white leading-tight font-heading">
              {returnedCount}
            </div>
            <div className="text-[11px] font-semibold text-slate-500 dark:text-slate-400">
              {language === 'hi' ? 'गोदाम वापसी' : 'Returned to Godown'}
            </div>
          </div>
        </div>
      </div>

      {/* Filter Bar & Search */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-white dark:bg-slate-800/80 p-3 rounded-2xl border border-slate-200 dark:border-slate-700">
        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={language === 'hi' ? 'औजार या साइट का नाम खोजें...' : 'Search tools or sites...'}
            className="w-full pl-9 pr-3 py-2 rounded-xl text-xs font-semibold bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 focus:outline-none dark:text-white"
          />
        </div>

        <div className="flex items-center gap-1.5 w-full sm:w-auto overflow-x-auto no-scrollbar">
          {(['all', 'on_site', 'purchased', 'returned', 'overdue'] as const).map((status) => (
            <button
              key={status}
              onClick={() => setFilterStatus(status)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all whitespace-nowrap ${
                filterStatus === status
                  ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900 shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700'
              }`}
            >
              {status === 'all' && (language === 'hi' ? 'सभी (All)' : 'All')}
              {status === 'on_site' && (language === 'hi' ? 'साइट पर मौजूद' : 'On Site')}
              {status === 'purchased' && (language === 'hi' ? 'साइट खरीद' : 'Site Purchases')}
              {status === 'returned' && (language === 'hi' ? 'गोदाम वापसी' : 'Returned')}
              {status === 'overdue' && (language === 'hi' ? '⚠️ वापसी में देरी' : '⚠️ Overdue')}
            </button>
          ))}
        </div>
      </div>

      {/* Tools Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredTools.map((tool) => {
          const siteName = siteMap.get(tool.siteId) || 'Assigned Site';
          const isOverdue =
            (tool.status === 'overdue' || (!tool.actualReturnDate && new Date(tool.expectedReturnDate) < new Date())) &&
            !tool.actualReturnDate;
          const isPurchased = tool.sourceType === 'purchased_for_site';
          const price = tool.purchasePrice || (isPurchased ? tool.rentOrRepairCost : 0) || 0;

          return (
            <div
              key={tool.id}
              className={`bg-white dark:bg-slate-800/90 rounded-2xl p-5 border shadow-sm transition-all flex flex-col justify-between ${
                isOverdue
                  ? 'border-red-300 dark:border-red-900/80 bg-red-50/20 dark:bg-red-950/20'
                  : 'border-slate-200/90 dark:border-slate-700/80 hover:border-slate-400'
              }`}
            >
              <div className="space-y-3">
                {/* Header row: Name, Qty & Action icons */}
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <h3 className="font-extrabold text-base text-slate-900 dark:text-white line-clamp-1 font-heading">
                      {tool.name}
                    </h3>
                    <div className="flex items-center gap-1.5 flex-wrap mt-1">
                      <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300">
                        {tool.quantity} {tool.size ? `• ${tool.size}` : (language === 'hi' ? 'नग' : 'Pcs')}
                      </span>

                      {/* Source badge */}
                      {isPurchased ? (
                        <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 flex items-center gap-1">
                          <ShoppingBag className="w-3 h-3" />
                          {language === 'hi' ? `खरीद: ₹${price}` : `Bought: ₹${price}`}
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-blue-100 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 flex items-center gap-1">
                          <Warehouse className="w-3 h-3" />
                          {language === 'hi' ? 'खुद का औजार' : 'Self-Owned'}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Actions & Status */}
                  <div className="flex items-center gap-1 flex-shrink-0">
                    {onEditTool && (
                      <button
                        onClick={() => onEditTool(tool)}
                        className="p-1.5 text-slate-400 hover:text-blue-600 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
                        title={language === 'hi' ? 'औजार बदलें' : 'Edit Tool'}
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                    )}

                    {onDeleteTool && (
                      <button
                        onClick={() => onDeleteTool(tool)}
                        className="p-1.5 text-slate-400 hover:text-red-600 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
                        title={language === 'hi' ? 'हटाएं' : 'Delete Tool'}
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>

                {/* Status indicator pill */}
                <div>
                  {tool.actualReturnDate ? (
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-green-100 dark:bg-green-950/60 text-green-700 dark:text-green-400">
                      <CheckCircle2 className="w-3 h-3" />
                      {language === 'hi' ? 'गोदाम में वापस आ चुका' : 'Returned to Godown'}
                    </span>
                  ) : isOverdue ? (
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-black bg-red-100 dark:bg-red-950/60 text-red-700 dark:text-red-400 animate-pulse">
                      <AlertCircle className="w-3 h-3" />
                      {language === 'hi' ? 'गोदाम वापसी में देरी' : 'Return Overdue!'}
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-blue-100 dark:bg-blue-950/60 text-blue-700 dark:text-blue-400">
                      <Wrench className="w-3 h-3" />
                      {language === 'hi' ? 'साइट पर सक्रिय' : 'Active on Site'}
                    </span>
                  )}
                </div>

                {/* Details row: Site & Dates */}
                <div className="space-y-1.5 text-xs text-slate-600 dark:text-slate-400">
                  <div className="flex items-center gap-1.5 font-bold text-slate-800 dark:text-slate-200">
                    <Building className="w-3.5 h-3.5 text-orange-500 flex-shrink-0" />
                    <span className="truncate">{siteName}</span>
                  </div>

                  <div className="flex items-center justify-between text-[11px] text-slate-500">
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3 h-3 text-slate-400" />
                      {isPurchased
                        ? (language === 'hi' ? `खरीदा: ${tool.dateSent}` : `Bought: ${tool.dateSent}`)
                        : (language === 'hi' ? `भेजा: ${tool.dateSent}` : `Sent: ${tool.dateSent}`)}
                    </span>
                    <span className={`font-semibold ${isOverdue ? 'text-red-600 font-bold' : ''}`}>
                      {language === 'hi' ? `वापसी: ${tool.expectedReturnDate}` : `Due: ${tool.expectedReturnDate}`}
                    </span>
                  </div>
                </div>

                {/* Notes if any */}
                {tool.notes && (
                  <p className="text-[11px] text-slate-500 italic bg-slate-50 dark:bg-slate-900/60 p-2 rounded-lg border border-slate-100 dark:border-slate-800">
                    "{tool.notes}"
                  </p>
                )}
              </div>

              {/* Card Footer: Cost details & Return CTA */}
              <div className="pt-3 mt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs">
                <div>
                  {isPurchased ? (
                    <div>
                      <span className="font-extrabold text-emerald-600 dark:text-emerald-400 text-sm">
                        ₹{price.toLocaleString('en-IN')}
                      </span>
                      <span className="text-[10px] text-slate-400 block -mt-0.5">
                        {language === 'hi' ? 'साइट खरीद खर्च' : 'purchase cost'}
                      </span>
                    </div>
                  ) : (
                    <div>
                      <span className="font-bold text-slate-700 dark:text-slate-300 text-xs">
                        {language === 'hi' ? 'ठेकेदार का औजार' : 'Self-Owned'}
                      </span>
                      <span className="text-[10px] text-slate-400 block -mt-0.5">
                        {language === 'hi' ? '₹0 खर्च' : '₹0 cost'}
                      </span>
                    </div>
                  )}
                </div>

                {!tool.actualReturnDate ? (
                  <button
                    onClick={() => handleMarkReturned(tool.id)}
                    className="px-3 py-1.5 rounded-xl font-bold text-xs bg-emerald-600 text-white hover:bg-emerald-700 shadow-sm transition-all btn-tactile flex items-center gap-1"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>{language === 'hi' ? 'गोदाम वापसी' : 'Mark Returned'}</span>
                  </button>
                ) : (
                  <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold">
                    ✓ {language === 'hi' ? `गोदाम में वापस (${tool.actualReturnDate})` : `Returned (${tool.actualReturnDate})`}
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {filteredTools.length === 0 && (
        <div className="text-center py-12 bg-white dark:bg-slate-800/60 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 space-y-3">
          <Wrench className="w-12 h-12 mx-auto text-slate-400" />
          <h3 className="font-extrabold text-slate-700 dark:text-slate-300 text-base">
            {language === 'hi' ? 'कोई औजार दर्ज नहीं है' : 'No tools found'}
          </h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            {language === 'hi'
              ? 'गोदाम से साइट पर भेजे गए या काम के लिए खरीदे गए औजार जोड़ने के लिए ऊपर दिए बटन का उपयोग करें।'
              : 'Use the button above to log self-owned tools sent to sites or equipment purchased during work.'}
          </p>
        </div>
      )}

    </div>
  );
};
