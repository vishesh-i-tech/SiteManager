import React, { useState } from 'react';
import { useTheme } from '../../core/theme/ThemeContext';
import { LabourRecord, Site } from '../../types';
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
  Sparkles,
  Edit2,
  Trash2,
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

  const siteMap = new Map(sites.map((s) => [s.id, s.name]));

  const filteredRecords = labourRecords.filter((rec) => {
    if (selectedSiteId === 'all') return true;
    return rec.siteId === selectedSiteId;
  });

  return (
    <div className="space-y-4">
      
      {/* Top Banner */}
      <div className="flex items-center justify-between gap-3 bg-white dark:bg-slate-900 p-3.5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
        <div>
          <h1 className="text-lg sm:text-xl font-black text-slate-900 dark:text-white font-heading">
            {language === 'hi' ? 'कारीगर हाजिरी' : 'Worker Entry'}
          </h1>
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
            className="px-3.5 py-2 rounded-xl text-xs font-bold text-purple-700 dark:text-purple-300 bg-purple-50 dark:bg-purple-950/50 hover:bg-purple-100 dark:hover:bg-purple-900/50 border border-purple-200 dark:border-purple-800 shadow-sm flex items-center gap-1.5 transition-all btn-tactile"
            title="Scan Register"
          >
            <Camera className="w-4 h-4" />
            <span>{language === 'hi' ? 'स्कैन करें' : 'Scan'}</span>
          </button>
        </div>
      </div>

      {/* Site Filter */}
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

      {/* Daily Records List */}
      <div className="space-y-4">
        {filteredRecords.map((rec) => {
          const siteName = siteMap.get(rec.siteId) || 'Job Site';

          return (
            <div
              key={rec.id}
              className="bg-white dark:bg-slate-800/90 rounded-2xl p-5 border border-slate-200/90 dark:border-slate-700 shadow-sm space-y-3"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-extrabold text-base text-slate-900 dark:text-white font-heading">
                      {new Date(rec.date).toLocaleDateString('en-IN', {
                        weekday: 'short',
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric',
                      })}
                    </span>
                    <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300">
                      {rec.totalWorkers} {t('totalWorkers')}
                    </span>
                    {rec.rawPhotoUrl && (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-purple-100 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300 flex items-center gap-1">
                        <Camera className="w-3 h-3" />
                        OCR Scanned
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400 mt-1">
                    <Building className="w-3.5 h-3.5 text-orange-500" />
                    <span>{siteName}</span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <div className="text-right mr-2">
                    <span className="text-xs text-slate-400 block">Total Wages</span>
                    <span className="font-black text-base text-slate-900 dark:text-white">
                      ₹{rec.totalDailyWage.toLocaleString('en-IN')}
                    </span>
                  </div>

                  {onEditLabour && (
                    <button
                      onClick={() => onEditLabour(rec)}
                      className="p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700"
                      title="Edit Attendance Sheet"
                    >
                      <Edit2 className="w-4 h-4 text-blue-600" />
                    </button>
                  )}

                  {onDeleteLabour && (
                    <button
                      onClick={() => onDeleteLabour(rec)}
                      className="p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700"
                      title="Delete Attendance Sheet"
                    >
                      <Trash2 className="w-4 h-4 text-red-600" />
                    </button>
                  )}

                  <button
                    onClick={() => exportLabourRegisterCsv(rec, siteName)}
                    className="p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700"
                    title="Export Muster Sheet to CSV"
                  >
                    <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
                  </button>
                </div>
              </div>

              {/* Workers Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                {(rec.entries || []).map((worker) => (
                  <div
                    key={worker.id}
                    className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-xs"
                  >
                    <div>
                      <span className="font-bold text-slate-900 dark:text-white block">
                        {worker.workerName}
                      </span>
                      <span className="text-[10px] text-slate-500">
                        {worker.role} • {worker.attendanceStatus === 'half_day' ? 'Half Day' : worker.attendanceStatus === 'absent' ? 'Absent' : 'Full Day'}
                      </span>
                    </div>
                    <span className="font-extrabold text-slate-900 dark:text-white">
                      ₹{worker.dailyWage}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      {filteredRecords.length === 0 && (
        <div className="text-center py-12 bg-white dark:bg-slate-800/60 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 space-y-4">
          <Users className="w-12 h-12 mx-auto text-slate-400" />
          <h3 className="font-extrabold text-slate-700 dark:text-slate-300 text-base">
            {language === 'hi' ? 'कोई हाजिरी दर्ज नहीं है' : 'No attendance muster logged yet'}
          </h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            {language === 'hi' ? 'डायरी की फोटो खींचे (OCR) या हाथ से दैनिक हाजिरी व मजदूरी दर्ज करें।' : 'Photograph your muster notebook or log daily worker wages manually.'}
          </p>
          <div className="flex items-center justify-center gap-3 pt-1 flex-wrap">
            <button
              onClick={onOpenAddManual}
              className="px-4 py-2 rounded-xl text-xs font-bold text-white shadow-md flex items-center gap-1.5 btn-tactile"
              style={{ backgroundColor: tradeConfig.primaryColor }}
            >
              <Plus className="w-4 h-4" />
              <span>{language === 'hi' ? '+ हाथ से हाजिरी भरें' : '+ Add Muster Manually'}</span>
            </button>
            <button
              onClick={onOpenOcrModal}
              className="px-4 py-2 rounded-xl text-xs font-bold text-purple-700 dark:text-purple-300 bg-purple-50 dark:bg-purple-950/40 border border-purple-200 dark:border-purple-800 hover:bg-purple-100 flex items-center gap-1.5 btn-tactile"
            >
              <Camera className="w-4 h-4" />
              <span>{t('scanRegister')}</span>
            </button>
          </div>
        </div>
      )}

    </div>
  );
};
