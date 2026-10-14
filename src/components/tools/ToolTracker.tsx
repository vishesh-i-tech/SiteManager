import React, { useState } from 'react';
import { useTheme } from '../../core/theme/ThemeContext';
import { ToolRecord, Site } from '../../types';
import { db } from '../../core/db/database';
import {
  Wrench,
  AlertCircle,
  CheckCircle2,
  Clock,
  Plus,
  Search,
  Building,
  Calendar,
  IndianRupee,
  Layers,
  Edit2,
  Trash2,
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
  const { t, language, tradeConfig } = useTheme();
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'on_site' | 'overdue' | 'returned'>('all');

  const siteMap = new Map(sites.map((s) => [s.id, s.name]));

  const filteredTools = tools.filter((tool) => {
    const siteName = siteMap.get(tool.siteId) || '';
    const matchesSearch =
      tool.name.toLowerCase().includes(search.toLowerCase()) ||
      siteName.toLowerCase().includes(search.toLowerCase());
    
    const isOverdue = tool.status === 'overdue' || (tool.actualReturnDate === null && new Date(tool.expectedReturnDate) < new Date());

    if (filterStatus === 'overdue') return matchesSearch && isOverdue && !tool.actualReturnDate;
    if (filterStatus === 'on_site') return matchesSearch && tool.actualReturnDate === null;
    if (filterStatus === 'returned') return matchesSearch && tool.actualReturnDate !== null;
    return matchesSearch;
  });

  const overdueCount = tools.filter(
    (t) => (t.status === 'overdue' || (t.actualReturnDate === null && new Date(t.expectedReturnDate) < new Date())) && !t.actualReturnDate
  ).length;

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
              {t('toolsTrackerTitle')}
            </h1>
            {overdueCount > 0 && (
              <span className="px-2.5 py-0.5 rounded-full text-xs font-black bg-red-100 dark:bg-red-950/60 text-red-700 dark:text-red-400 animate-pulse border border-red-200 dark:border-red-900">
                {overdueCount} {language === 'hi' ? 'वापसी में देरी' : 'Overdue'}
              </span>
            )}
          </div>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            {t('toolsTrackerSubtitle')}
          </p>
        </div>

        <button
          onClick={onOpenAddTool}
          className="px-4 py-2.5 rounded-xl text-xs font-extrabold text-white shadow-md flex items-center justify-center gap-2 transition-all btn-tactile glow-theme self-start sm:self-auto"
          style={{ backgroundColor: tradeConfig.primaryColor }}
        >
          <Plus className="w-4 h-4" />
          <span>{t('addTool')}</span>
        </button>
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
          {(['all', 'on_site', 'overdue', 'returned'] as const).map((status) => (
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
              {status === 'overdue' && (language === 'hi' ? '⚠️ देरी (Overdue)' : '⚠️ Overdue')}
              {status === 'returned' && (language === 'hi' ? 'वापस आ चुके' : 'Returned')}
            </button>
          ))}
        </div>
      </div>

      {/* Tools Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredTools.map((tool) => {
          const siteName = siteMap.get(tool.siteId) || 'Assigned Site';
          const isOverdue = (tool.status === 'overdue' || (tool.actualReturnDate === null && new Date(tool.expectedReturnDate) < new Date())) && !tool.actualReturnDate;

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
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h3 className="font-extrabold text-base text-slate-900 dark:text-white line-clamp-1 font-heading">
                      {tool.name}
                    </h3>
                    <span className="inline-block mt-0.5 px-2 py-0.5 rounded text-[11px] font-bold bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300">
                      {tool.quantity} {tool.size ? `• ${tool.size}` : 'Pieces'}
                    </span>
                  </div>

                  <div className="flex items-center gap-1.5">
                    {onEditTool && (
                      <button
                        onClick={() => onEditTool(tool)}
                        className="p-1 text-slate-400 hover:text-blue-600 rounded hover:bg-slate-100"
                        title="Edit Tool"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                    )}

                    {onDeleteTool && (
                      <button
                        onClick={() => onDeleteTool(tool)}
                        className="p-1 text-slate-400 hover:text-red-600 rounded hover:bg-slate-100"
                        title="Delete Tool"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}

                    {tool.actualReturnDate ? (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-green-100 dark:bg-green-950/60 text-green-700 dark:text-green-400 flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3" />
                        {t('toolReturned')}
                      </span>
                    ) : isOverdue ? (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-red-100 dark:bg-red-950/60 text-red-700 dark:text-red-400 flex items-center gap-1 animate-pulse">
                        <AlertCircle className="w-3 h-3" />
                        {t('toolOverdue')}
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-100 dark:bg-blue-950/60 text-blue-700 dark:text-blue-400">
                        {t('toolOnSite')}
                      </span>
                    )}
                  </div>
                </div>

                <div className="space-y-1.5 text-xs text-slate-600 dark:text-slate-400">
                  <div className="flex items-center gap-1.5 font-bold text-slate-800 dark:text-slate-200">
                    <Building className="w-3.5 h-3.5 text-orange-500 flex-shrink-0" />
                    <span className="truncate">{siteName}</span>
                  </div>

                  <div className="flex items-center justify-between text-[11px] text-slate-500">
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      Sent: {tool.dateSent}
                    </span>
                    <span className={`font-semibold ${isOverdue ? 'text-red-600 font-bold' : ''}`}>
                      Due: {tool.expectedReturnDate}
                    </span>
                  </div>
                </div>

                {tool.notes && (
                  <p className="text-[11px] text-slate-500 italic bg-slate-50 dark:bg-slate-900/60 p-2 rounded-lg border border-slate-100 dark:border-slate-800">
                    "{tool.notes}"
                  </p>
                )}
              </div>

              <div className="pt-3 mt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs">
                <span className="font-extrabold text-slate-900 dark:text-white">
                  ₹{tool.rentOrRepairCost.toLocaleString('en-IN')} <span className="text-[10px] font-normal text-slate-400">rent</span>
                </span>

                {!tool.actualReturnDate ? (
                  <button
                    onClick={() => handleMarkReturned(tool.id)}
                    className="px-3 py-1.5 rounded-lg font-bold text-xs bg-emerald-600 text-white hover:bg-emerald-700 shadow-sm transition-all btn-tactile"
                  >
                    {t('markReturned')}
                  </button>
                ) : (
                  <span className="text-[11px] text-slate-400">
                    Returned on {tool.actualReturnDate}
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
            {language === 'hi' ? 'कोई औजार दर्ज नहीं है' : 'No tools tracked yet'}
          </h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            {language === 'hi' ? 'शटरिंग प्लेट, कटर या वाइब्रेटर भेजने का रिकॉर्ड जोड़ें।' : 'Dispatch and track equipment, shuttering and rentals per site.'}
          </p>
        </div>
      )}

    </div>
  );
};
