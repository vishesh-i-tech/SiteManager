import React, { useState } from 'react';
import { useTheme } from '../../core/theme/ThemeContext';
import { LabourRecord, Site, LabourEntry } from '../../types';
import { exportLabourRegisterCsv } from '../../utils/reportExporter';
import {
  Users,
  Camera,
  Plus,
  Calendar,
  IndianRupee,
  FileSpreadsheet,
  Building,
  CheckCircle2,
  Clock,
  Edit2,
  Trash2,
  ChevronDown,
  ChevronUp,
  UserCheck,
  HardHat,
  ArrowRight,
} from 'lucide-react';

interface LabourRegisterProps {
  labourRecords: LabourRecord[];
  sites: Site[];
  onOpenOcrModal: () => void;
  onOpenAddManual: () => void;
  onEditLabour?: (record: LabourRecord) => void;
  onDeleteLabour?: (record: LabourRecord) => void;
}

export const LabourRegister: React.FC<LabourRegisterProps> = ({
  labourRecords,
  sites,
  onOpenOcrModal,
  onOpenAddManual,
  onEditLabour,
  onDeleteLabour,
}) => {
  const { t, language, tradeConfig } = useTheme();
  const [selectedSiteId, setSelectedSiteId] = useState<string>('all');
  
  // Track which date entries are expanded
  const [expandedRecordIds, setExpandedRecordIds] = useState<Set<string>>(new Set());

  const toggleExpand = (recordId: string) => {
    setExpandedRecordIds((prev) => {
      const next = new Set(prev);
      if (next.has(recordId)) {
        next.delete(recordId);
      } else {
        next.add(recordId);
      }
      return next;
    });
  };

  const siteMap = new Map(sites.map((s) => [s.id, s.name]));

  // Group records by Site
  const groupedSites = sites
    .map((site) => {
      const records = labourRecords
        .filter((r) => r.siteId === site.id)
        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
      
      const totalWages = records.reduce((acc, r) => acc + (r.totalDailyWage || 0), 0);
      const totalWorkers = records.reduce((acc, r) => acc + (r.totalWorkers || (r.entries?.length || 0)), 0);

      return {
        site,
        records,
        totalWages,
        totalWorkers,
      };
    })
    .filter((group) => {
      if (selectedSiteId === 'all') return group.records.length > 0;
      return group.site.id === selectedSiteId;
    });

  // Handle any records associated with a siteId not in the current sites array
  const knownSiteIds = new Set(sites.map((s) => s.id));
  const orphanRecords = labourRecords.filter((r) => !knownSiteIds.has(r.siteId));
  if (orphanRecords.length > 0 && (selectedSiteId === 'all' || selectedSiteId === 'other')) {
    groupedSites.push({
      site: {
        id: 'other',
        contractorId: '',
        name: language === 'hi' ? 'अन्य साइट्स' : 'Other Sites',
        location: '',
        siteType: 'Other',
        estimatedBudget: 0,
        workStatus: 'ongoing',
        paymentStatus: 'unpaid',
        startDate: '',
        createdAt: '',
      },
      records: orphanRecords,
      totalWages: orphanRecords.reduce((acc, r) => acc + (r.totalDailyWage || 0), 0),
      totalWorkers: orphanRecords.reduce((acc, r) => acc + (r.totalWorkers || (r.entries?.length || 0)), 0),
    });
  }

  const totalFilteredRecordsCount = groupedSites.reduce((acc, g) => acc + g.records.length, 0);

  return (
    <div className="space-y-4 select-none">
      
      {/* Top Banner with Clean Single Action Header */}
      <div className="flex items-center justify-between gap-3 bg-white dark:bg-slate-900 p-3.5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
        <div>
          <h1 className="text-lg sm:text-xl font-black text-slate-900 dark:text-white font-heading">
            {language === 'hi' ? 'कारीगर हाजिरी' : 'Worker Entry'}
          </h1>
          <p className="text-[11px] text-slate-500">
            {totalFilteredRecordsCount} {language === 'hi' ? 'तारीखों का रिकॉर्ड' : 'Dates logged'}
          </p>
        </div>

        {/* Dual Actions: Plus icon-only + Scan */}
        <div className="flex items-center gap-2">
          <button
            onClick={onOpenAddManual}
            className="w-9 h-9 rounded-xl text-white shadow-sm flex items-center justify-center transition-all btn-tactile glow-theme"
            style={{ backgroundColor: tradeConfig.primaryColor }}
            title={language === 'hi' ? 'नई हाजिरी जोड़ें' : 'Add Worker Entry'}
            aria-label="Add Worker Entry"
          >
            <Plus className="w-5 h-5" />
          </button>

          <button
            onClick={onOpenOcrModal}
            className="px-3 py-2 rounded-xl text-xs font-bold text-purple-700 dark:text-purple-300 bg-purple-50 dark:bg-purple-950/50 hover:bg-purple-100 dark:hover:bg-purple-900/50 border border-purple-200 dark:border-purple-800 shadow-sm flex items-center gap-1.5 transition-all btn-tactile"
            title="Scan Register"
          >
            <Camera className="w-4 h-4" />
            <span>{language === 'hi' ? 'स्कैन करें' : 'Scan'}</span>
          </button>
        </div>
      </div>

      {/* Site Filter Pills */}
      <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-1">
        <button
          onClick={() => setSelectedSiteId('all')}
          className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
            selectedSiteId === 'all'
              ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900 shadow-sm'
              : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700'
          }`}
        >
          {language === 'hi' ? 'सभी साइट्स' : 'All Sites'}
        </button>

        {sites.map((site) => (
          <button
            key={site.id}
            onClick={() => setSelectedSiteId(site.id)}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all whitespace-nowrap ${
              selectedSiteId === site.id
                ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900 shadow-sm'
                : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700'
            }`}
          >
            {site.name}
          </button>
        ))}
      </div>

      {/* Grouped by Site (Outer Layer: Site Name -> Inner Layer: Dates -> Click to reveal workers) */}
      <div className="space-y-4">
        {groupedSites.map(({ site, records, totalWages }) => (
          <div
            key={site.id}
            className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-4 space-y-3 shadow-xs"
          >
            {/* Outer Level 1: Site Header */}
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-2.5">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center font-bold">
                  <Building className="w-4 h-4" />
                </div>
                <div>
                  <h2 className="font-extrabold text-sm text-slate-900 dark:text-white font-heading">
                    {site.name}
                  </h2>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">
                    {records.length} {language === 'hi' ? 'तारीखों की हाजिरी' : 'dates logged'}
                  </p>
                </div>
              </div>

              <div className="text-right">
                <span className="text-[10px] text-slate-400 block font-semibold uppercase">
                  {language === 'hi' ? 'कुल मजदूरी' : 'Total Wages'}
                </span>
                <span className="text-xs font-black text-slate-900 dark:text-white">
                  ₹{totalWages.toLocaleString('en-IN')}
                </span>
              </div>
            </div>

            {/* Outer Level 2: List of Dates inside this Site */}
            <div className="space-y-2.5">
              {records.map((rec) => {
                const isExpanded = expandedRecordIds.has(rec.id);
                const workerEntries = rec.entries || [];
                const formattedDate = new Date(rec.date).toLocaleDateString('en-IN', {
                  weekday: 'short',
                  day: 'numeric',
                  month: 'short',
                  year: 'numeric',
                });

                return (
                  <div
                    key={rec.id}
                    className={`rounded-xl border transition-all ${
                      isExpanded
                        ? 'bg-slate-50/80 dark:bg-slate-800/80 border-blue-400 dark:border-blue-700 shadow-sm'
                        : 'bg-slate-50/50 dark:bg-slate-800/40 border-slate-200 dark:border-slate-700/80 hover:border-slate-300 dark:hover:border-slate-600'
                    }`}
                  >
                    {/* Date Row (Visible on Outside) - Click to Expand */}
                    <div
                      onClick={() => toggleExpand(rec.id)}
                      className="p-3 flex items-center justify-between gap-2 cursor-pointer hover:bg-slate-100/50 dark:hover:bg-slate-800/60 rounded-xl transition-colors"
                    >
                      {/* Left: Date & Site Name Info */}
                      <div className="flex items-center gap-2.5 min-w-0">
                        <div className="w-7 h-7 rounded-lg bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 flex items-center justify-center shrink-0 text-slate-600 dark:text-slate-300">
                          <Calendar className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                        </div>
                        <div className="min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="font-extrabold text-xs text-slate-900 dark:text-white font-heading">
                              {formattedDate}
                            </span>
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-100 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300">
                              {rec.totalWorkers || workerEntries.length} {language === 'hi' ? 'कारीगर' : 'Workers'}
                            </span>
                            {rec.rawPhotoUrl && (
                              <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-purple-100 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300 flex items-center gap-0.5">
                                <Camera className="w-2.5 h-2.5" />
                                OCR
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Right: Wage Amount, Quick Edit Button, Delete, and Expand Arrow */}
                      <div className="flex items-center gap-2 shrink-0">
                        <div className="text-right">
                          <span className="font-black text-xs text-slate-900 dark:text-white block">
                            ₹{rec.totalDailyWage.toLocaleString('en-IN')}
                          </span>
                        </div>

                        {/* Direct Edit Option right on the date card */}
                        {onEditLabour && (
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              onEditLabour(rec);
                            }}
                            className="p-1.5 rounded-lg text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/60 hover:bg-blue-100 dark:hover:bg-blue-900/60 border border-blue-200 dark:border-blue-800 flex items-center gap-1 transition-colors"
                            title="Edit Attendance Entry"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                            <span className="text-[11px] font-bold">{language === 'hi' ? 'एडिट' : 'Edit'}</span>
                          </button>
                        )}

                        {onDeleteLabour && (
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              onDeleteLabour(rec);
                            }}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/40 transition-colors"
                            title="Delete Record"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}

                        {/* Expand/Collapse Chevron Indicator */}
                        <div className="text-slate-400 p-0.5">
                          {isExpanded ? (
                            <ChevronUp className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                          ) : (
                            <ChevronDown className="w-4 h-4" />
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Inside: Detailed Labour Entries (Only visible when date is clicked!) */}
                    {isExpanded && (
                      <div className="p-3 border-t border-slate-200 dark:border-slate-700 space-y-2.5 animate-fade-in bg-white dark:bg-slate-900/90 rounded-b-xl">
                        
                        <div className="flex items-center justify-between">
                          <span className="font-extrabold text-[11px] text-slate-600 dark:text-slate-400 uppercase tracking-wider flex items-center gap-1">
                            <Users className="w-3 h-3 text-blue-500" />
                            <span>
                              {language === 'hi' ? 'कारीगरों की हाजिरी सूची' : 'Labour Attendance List'} ({workerEntries.length})
                            </span>
                          </span>

                          <div className="flex items-center gap-1.5">
                            {onEditLabour && (
                              <button
                                type="button"
                                onClick={() => onEditLabour(rec)}
                                className="px-2.5 py-1 rounded-lg text-[11px] font-bold text-white bg-blue-600 hover:bg-blue-700 flex items-center gap-1 shadow-xs"
                              >
                                <Edit2 className="w-3 h-3" />
                                <span>{language === 'hi' ? 'हाजिरी सुधारें' : 'Edit Workers'}</span>
                              </button>
                            )}

                            <button
                              type="button"
                              onClick={() => exportLabourRegisterCsv(rec, site.name)}
                              className="p-1 rounded-lg text-emerald-600 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800"
                              title="Export CSV"
                            >
                              <FileSpreadsheet className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>

                        {/* Workers List inside Date */}
                        {workerEntries.length > 0 ? (
                          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
                            {workerEntries.map((worker) => (
                              <div
                                key={worker.id}
                                className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-between text-xs"
                              >
                                <div>
                                  <span className="font-bold text-slate-900 dark:text-white block line-clamp-1">
                                    {worker.workerName}
                                  </span>
                                  <div className="flex items-center gap-1 text-[10px] text-slate-500 mt-0.5">
                                    <span className="font-medium">{worker.role}</span>
                                    <span>•</span>
                                    <span
                                      className={`font-semibold ${
                                        worker.attendanceStatus === 'half_day'
                                          ? 'text-amber-600 dark:text-amber-400'
                                          : worker.attendanceStatus === 'absent'
                                          ? 'text-red-500'
                                          : 'text-green-600 dark:text-green-400'
                                      }`}
                                    >
                                      {worker.attendanceStatus === 'half_day'
                                        ? 'Half Day'
                                        : worker.attendanceStatus === 'absent'
                                        ? 'Absent'
                                        : 'Full Day'}
                                    </span>
                                  </div>
                                </div>
                                <div className="text-right">
                                  <span className="font-extrabold text-slate-900 dark:text-white block">
                                    ₹{worker.dailyWage}
                                  </span>
                                  {worker.paidAmount !== undefined && worker.paidAmount !== worker.dailyWage && (
                                    <span className="text-[10px] text-slate-400">
                                      Paid: ₹{worker.paidAmount}
                                    </span>
                                  )}
                                </div>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <div className="p-4 text-center text-slate-400 text-xs">
                            {language === 'hi' ? 'कोई विस्तृत कारीगर नाम दर्ज नहीं है' : 'No individual worker breakdown saved'}
                          </div>
                        )}

                        {rec.notes && (
                          <p className="text-[11px] text-slate-500 bg-slate-100 dark:bg-slate-800/60 p-2 rounded-lg italic">
                            {rec.notes}
                          </p>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {/* Empty State */}
      {totalFilteredRecordsCount === 0 && (
        <div className="text-center py-12 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 space-y-4">
          <Users className="w-12 h-12 mx-auto text-slate-400" />
          <h3 className="font-extrabold text-slate-700 dark:text-slate-300 text-base">
            {language === 'hi' ? 'कोई हाजिरी दर्ज नहीं है' : 'No attendance muster logged yet'}
          </h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            {language === 'hi'
              ? 'डायरी की फोटो खींचे (Scan) या हाथ से दैनिक हाजिरी व मजदूरी दर्ज करें।'
              : 'Scan your paper notebook or log daily worker wages manually.'}
          </p>
          <div className="flex items-center justify-center gap-3 pt-1 flex-wrap">
            <button
              onClick={onOpenAddManual}
              className="px-4 py-2 rounded-xl text-xs font-bold text-white shadow-md flex items-center gap-1.5 btn-tactile"
              style={{ backgroundColor: tradeConfig.primaryColor }}
            >
              <Plus className="w-4 h-4" />
              <span>{language === 'hi' ? '+ हाजिरी जोड़ें' : '+ Add Muster'}</span>
            </button>
            <button
              onClick={onOpenOcrModal}
              className="px-4 py-2 rounded-xl text-xs font-bold text-purple-700 dark:text-purple-300 bg-purple-50 dark:bg-purple-950/40 border border-purple-200 dark:border-purple-800 hover:bg-purple-100 flex items-center gap-1.5 btn-tactile"
            >
              <Camera className="w-4 h-4" />
              <span>{language === 'hi' ? 'स्कैन करें' : 'Scan Register'}</span>
            </button>
          </div>
        </div>
      )}

    </div>
  );
};
