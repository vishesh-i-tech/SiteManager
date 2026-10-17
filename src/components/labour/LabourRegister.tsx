import React, { useState } from 'react';
import { useTheme } from '../../core/theme/ThemeContext';
import { LabourRecord, Site } from '../../types';
import { exportDailyAttendancePdf, exportSiteTotalAttendancePdf } from '../../utils/reportExporter';
import { LabourDateDetailModal } from './LabourDateDetailModal';
import { HorizontalDatePicker } from '../common/HorizontalDatePicker';
import {
  Users,
  Camera,
  Plus,
  Calendar,
  Building,
  Edit2,
  Trash2,
  FileText,
  ChevronRight,
} from 'lucide-react';

interface LabourRegisterProps {
  labourRecords: LabourRecord[];
  sites: Site[];
  companyName?: string;
  onOpenOcrModal: () => void;
  onOpenAddManual: () => void;
  onEditLabour?: (record: LabourRecord) => void;
  onDeleteLabour?: (record: LabourRecord) => void;
}

export const LabourRegister: React.FC<LabourRegisterProps> = ({
  labourRecords,
  sites,
  companyName,
  onOpenOcrModal,
  onOpenAddManual,
  onEditLabour,
  onDeleteLabour,
}) => {
  const { language, tradeConfig } = useTheme();
  const [selectedSiteId, setSelectedSiteId] = useState<string>('all');
  const [selectedDateFilter, setSelectedDateFilter] = useState<string | null>(null);
  
  // Track selected record for the dedicated detail page / modal
  const [selectedRecordForDetail, setSelectedRecordForDetail] = useState<LabourRecord | null>(null);
  const [selectedSiteNameForDetail, setSelectedSiteNameForDetail] = useState<string>('');

  const siteMap = new Map(sites.map((s) => [s.id, s.name]));

  // Group records by Site
  const groupedSites = sites
    .map((site) => {
      const records = labourRecords
        .filter((r) => r.siteId === site.id)
        .filter((r) => !selectedDateFilter || r.date === selectedDateFilter)
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

  const handleOpenDateDetail = (record: LabourRecord, sName: string) => {
    setSelectedRecordForDetail(record);
    setSelectedSiteNameForDetail(sName);
  };

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

      {/* Date Filter Strip (Only shown when records exist) */}
      {labourRecords.length > 0 && (
        <div className="bg-white dark:bg-slate-900 p-3 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-[0_2px_12px_rgba(0,0,0,0.03)] space-y-2">
          <div className="flex items-center justify-between px-0.5">
            <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
              {language === 'hi' ? 'तारीख अनुसार रिकॉर्ड देखें' : 'Filter Attendance by Date'}
            </span>
            {selectedDateFilter && (
              <button
                onClick={() => setSelectedDateFilter(null)}
                className="text-[11px] font-bold text-blue-600 dark:text-blue-400 hover:underline cursor-pointer"
              >
                {language === 'hi' ? 'सभी तारीखें देखें (Reset)' : 'View All Dates (Reset)'}
              </button>
            )}
          </div>
          <HorizontalDatePicker
            title=""
            selectedDate={selectedDateFilter || new Date().toISOString().split('T')[0]}
            onDateChange={(d) => setSelectedDateFilter(d)}
            showCalendarToggle={true}
          />
        </div>
      )}

      {/* Grouped by Site (Outer Layer: Site Name & Total PDF -> Inner Layer: Date Cards -> Click opens separate detail page) */}
      <div className="space-y-4">
        {groupedSites.map(({ site, records, totalWages }) => (
          <div
            key={site.id}
            className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-4 space-y-3 shadow-xs"
          >
            {/* Outer Level 1: Site Header with Site Attendance PDF Download */}
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-2.5 flex-wrap gap-2">
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="w-8 h-8 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center font-bold shrink-0">
                  <Building className="w-4 h-4" />
                </div>
                <div className="min-w-0">
                  <h2 className="font-extrabold text-sm text-slate-900 dark:text-white font-heading truncate">
                    {site.name}
                  </h2>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">
                    {records.length} {language === 'hi' ? 'तारीखों की हाजिरी' : 'dates logged'} • ₹{totalWages.toLocaleString('en-IN')}
                  </p>
                </div>
              </div>

              {/* Total Site Attendance PDF Sheet (Date & Worker Quantity ONLY, no names) */}
              <button
                type="button"
                onClick={() => exportSiteTotalAttendancePdf(site, records, companyName)}
                className="px-2.5 py-1.5 rounded-xl text-xs font-bold text-slate-800 dark:text-slate-200 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 flex items-center gap-1.5 transition-colors shadow-2xs"
                title={language === 'hi' ? 'पूरी साइट की हाजिरी शीट डाउनलोड करें' : 'Download Site Attendance PDF Summary'}
              >
                <FileText className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400 shrink-0" />
                <span className="text-[11px]">{language === 'hi' ? 'साइट हाजिरी PDF' : 'Site Attendance PDF'}</span>
              </button>
            </div>

            {/* Outer Level 2: List of Dates inside this Site */}
            <div className="space-y-2">
              {records.map((rec) => {
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
                    onClick={() => handleOpenDateDetail(rec, site.name)}
                    className="p-3 rounded-xl bg-slate-50/70 dark:bg-slate-800/50 border border-slate-200/90 dark:border-slate-700/80 hover:border-blue-400 dark:hover:border-blue-600 flex items-center justify-between gap-2 cursor-pointer transition-all hover:bg-slate-100/60 dark:hover:bg-slate-800/80"
                  >
                    {/* Left: Date & Badges */}
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className="w-8 h-8 rounded-lg bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 flex items-center justify-center shrink-0 text-blue-600 dark:text-blue-400">
                        <Calendar className="w-4 h-4" />
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span className="font-extrabold text-xs text-slate-900 dark:text-white font-heading truncate">
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

                    {/* Right: Wage Amount & Action Icon Buttons (NO text, icon-only to prevent overlap!) */}
                    <div className="flex items-center gap-1.5 shrink-0">
                      <span className="font-black text-xs text-slate-900 dark:text-white mr-1">
                        ₹{rec.totalDailyWage.toLocaleString('en-IN')}
                      </span>

                      {/* Download Day PDF Icon Button */}
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          exportDailyAttendancePdf(rec, site.name, companyName);
                        }}
                        className="p-1.5 rounded-lg text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/60 hover:bg-blue-100 dark:hover:bg-blue-900/60 border border-blue-200 dark:border-blue-800 transition-colors"
                        title={language === 'hi' ? 'दैनिक हाजिरी पीडीएफ' : 'Download Day PDF'}
                      >
                        <FileText className="w-3.5 h-3.5" />
                      </button>

                      {/* Edit Icon Button (ONLY Pen Icon, NO text!) */}
                      {onEditLabour && (
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            onEditLabour(rec);
                          }}
                          className="p-1.5 rounded-lg text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-700 hover:bg-slate-100 dark:hover:bg-slate-600 border border-slate-200 dark:border-slate-600 transition-colors"
                          title="Edit"
                        >
                          <Edit2 className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                        </button>
                      )}

                      {/* Delete Icon Button */}
                      {onDeleteLabour && (
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            onDeleteLabour(rec);
                          }}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/40 transition-colors"
                          title="Delete"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}

                      <ChevronRight className="w-4 h-4 text-slate-400" />
                    </div>
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

      {/* Dedicated Date Detail Modal (Opens when user clicks on a date) */}
      <LabourDateDetailModal
        isOpen={!!selectedRecordForDetail}
        onClose={() => setSelectedRecordForDetail(null)}
        record={selectedRecordForDetail}
        siteName={selectedSiteNameForDetail}
        companyName={companyName}
        onEditLabour={onEditLabour}
        onDeleteLabour={onDeleteLabour}
      />

    </div>
  );
};
