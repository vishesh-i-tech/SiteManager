import React from 'react';
import { useTheme } from '../../core/theme/ThemeContext';
import { LabourRecord, Site } from '../../types';
import { exportDailyAttendancePdf, exportLabourRegisterCsv } from '../../utils/reportExporter';
import {
  X,
  ArrowLeft,
  Calendar,
  Building,
  Users,
  Edit2,
  Trash2,
  Download,
  FileText,
  FileSpreadsheet,
  CheckCircle2,
  Camera,
} from 'lucide-react';

interface LabourDateDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  record: LabourRecord | null;
  siteName: string;
  companyName?: string;
  onEditLabour?: (record: LabourRecord) => void;
  onDeleteLabour?: (record: LabourRecord) => void;
}

export const LabourDateDetailModal: React.FC<LabourDateDetailModalProps> = ({
  isOpen,
  onClose,
  record,
  siteName,
  companyName,
  onEditLabour,
  onDeleteLabour,
}) => {
  const { language } = useTheme();

  if (!isOpen || !record) return null;

  const entries = record.entries || [];
  const formattedDate = new Date(record.date).toLocaleDateString('en-IN', {
    weekday: 'long',
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });

  const totalWorkers = record.totalWorkers || entries.length;
  const totalWages = record.totalDailyWage || 0;
  const totalPaid = record.totalPaid || 0;
  const balanceDue = totalWages - totalPaid;

  const handleDownloadPdf = () => {
    exportDailyAttendancePdf(record, siteName, companyName);
  };

  const handleDownloadCsv = () => {
    exportLabourRegisterCsv(record, siteName);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      {/* Backdrop */}
      <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm transition-opacity" onClick={onClose} />

      {/* Modal Container */}
      <div className="relative z-10 bg-white dark:bg-slate-900 w-full max-w-lg rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col max-h-[92vh] animate-fade-in">
        
        {/* Header Bar */}
        <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/80 dark:bg-slate-800/50">
          <div className="flex items-center gap-2.5 min-w-0">
            <button
              onClick={onClose}
              className="p-1.5 rounded-xl text-slate-500 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors shrink-0"
              title="Back"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div className="min-w-0">
              <h2 className="font-extrabold text-sm sm:text-base text-slate-900 dark:text-white truncate font-heading">
                {formattedDate}
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 truncate flex items-center gap-1">
                <Building className="w-3 h-3 text-orange-500 shrink-0" />
                <span className="truncate">{siteName}</span>
              </p>
            </div>
          </div>

          {/* Quick Action Icons */}
          <div className="flex items-center gap-1.5 shrink-0">
            {/* Download Day PDF */}
            <button
              onClick={handleDownloadPdf}
              className="p-2 rounded-xl text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/60 hover:bg-blue-100 dark:hover:bg-blue-900/60 border border-blue-200 dark:border-blue-800 transition-colors"
              title={language === 'hi' ? 'दैनिक हाजिरी पीडीएफ डाउनलोड करें' : 'Download Day PDF'}
            >
              <FileText className="w-4 h-4" />
            </button>

            {/* Edit Pen Icon Only */}
            {onEditLabour && (
              <button
                onClick={() => {
                  onClose();
                  onEditLabour(record);
                }}
                className="p-2 rounded-xl text-slate-700 dark:text-slate-200 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 transition-colors"
                title={language === 'hi' ? 'सुधारें (Edit)' : 'Edit Attendance'}
              >
                <Edit2 className="w-4 h-4 text-blue-600 dark:text-blue-400" />
              </button>
            )}

            {/* Close Button */}
            <button
              onClick={onClose}
              className="p-2 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Summary Metrics Bar */}
        <div className="grid grid-cols-3 gap-2 p-3 bg-slate-100/60 dark:bg-slate-800/30 border-b border-slate-200 dark:border-slate-800 text-center">
          <div className="p-2 rounded-xl bg-white dark:bg-slate-800 shadow-2xs">
            <span className="text-[10px] text-slate-400 uppercase font-semibold block">
              {language === 'hi' ? 'कुल कारीगर' : 'Workers'}
            </span>
            <span className="text-sm font-black text-slate-900 dark:text-white">
              {totalWorkers}
            </span>
          </div>

          <div className="p-2 rounded-xl bg-white dark:bg-slate-800 shadow-2xs">
            <span className="text-[10px] text-slate-400 uppercase font-semibold block">
              {language === 'hi' ? 'दैनिक मजदूरी' : 'Total Wages'}
            </span>
            <span className="text-sm font-black text-slate-900 dark:text-white">
              ₹{totalWages.toLocaleString('en-IN')}
            </span>
          </div>

          <div className="p-2 rounded-xl bg-white dark:bg-slate-800 shadow-2xs">
            <span className="text-[10px] text-slate-400 uppercase font-semibold block">
              {language === 'hi' ? 'भुगतान किया' : 'Paid Amount'}
            </span>
            <span className="text-sm font-black text-green-600 dark:text-green-400">
              ₹{totalPaid.toLocaleString('en-IN')}
            </span>
          </div>
        </div>

        {/* Workers List - Full Single Column to prevent text overlap */}
        <div className="p-4 space-y-2.5 overflow-y-auto flex-1 text-xs">
          <div className="flex items-center justify-between px-1">
            <span className="font-extrabold text-xs text-slate-600 dark:text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
              <Users className="w-3.5 h-3.5 text-blue-500" />
              <span>{language === 'hi' ? 'कारीगरों की सूची' : 'Worker Attendance List'}</span>
            </span>
            {record.rawPhotoUrl && (
              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-purple-100 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300 flex items-center gap-1">
                <Camera className="w-3 h-3" />
                OCR Scanned
              </span>
            )}
          </div>

          {entries.length > 0 ? (
            <div className="space-y-2">
              {entries.map((worker, index) => {
                const isAbsent = worker.attendanceStatus === 'absent';
                const isHalfDay = worker.attendanceStatus === 'half_day';

                return (
                  <div
                    key={worker.id || index}
                    className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 flex items-center justify-between gap-3 shadow-2xs hover:border-blue-400 transition-colors"
                  >
                    {/* Left: Index + Name & Role */}
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className="w-7 h-7 rounded-lg bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 font-bold text-xs flex items-center justify-center shrink-0">
                        {index + 1}
                      </div>
                      <div className="min-w-0">
                        <span className="font-extrabold text-xs text-slate-900 dark:text-white block truncate">
                          {worker.workerName}
                        </span>
                        <div className="flex items-center gap-1.5 mt-0.5 flex-wrap">
                          <span className="text-[10px] font-medium text-slate-500 dark:text-slate-400">
                            {worker.role}
                          </span>
                          <span className="text-slate-300 dark:text-slate-600">•</span>
                          <span
                            className={`px-1.5 py-0.2 rounded text-[10px] font-bold ${
                              isAbsent
                                ? 'bg-red-100 text-red-700 dark:bg-red-950/60 dark:text-red-400'
                                : isHalfDay
                                ? 'bg-amber-100 text-amber-700 dark:bg-amber-950/60 dark:text-amber-400'
                                : 'bg-green-100 text-green-700 dark:bg-green-950/60 dark:text-green-400'
                            }`}
                          >
                            {isAbsent
                              ? language === 'hi' ? 'अनुपस्थित' : 'Absent'
                              : isHalfDay
                              ? language === 'hi' ? 'आधा दिन (0.5)' : 'Half Day'
                              : language === 'hi' ? 'पूरा दिन (1.0)' : 'Full Day'}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Right: Explicit Total, Paid, and Due Breakdown */}
                    <div className="text-right shrink-0 space-y-1">
                      {(() => {
                        const earned = worker.attendanceStatus === 'half_day'
                          ? Math.round((worker.dailyWage || 0) * 0.5)
                          : worker.attendanceStatus === 'absent'
                          ? 0
                          : (worker.dailyWage || 0);
                        const paid = worker.paidAmount !== undefined ? worker.paidAmount : (worker.attendanceStatus === 'absent' ? 0 : earned);
                        const due = worker.balanceDue !== undefined ? worker.balanceDue : Math.max(0, earned - paid);
                        const status = worker.paymentStatus || (paid === 0 ? 'unpaid' : paid >= earned ? 'paid' : 'advance');

                        return (
                          <div className="flex flex-col items-end gap-1">
                            <div className="flex items-center gap-1.5 text-xs">
                              <span className="text-slate-400 font-medium">Total:</span>
                              <span className="font-black text-slate-900 dark:text-white">₹{earned}</span>
                            </div>
                            <div className="flex items-center gap-1.5 text-[10px]">
                              <span className="px-1.5 py-0.5 rounded font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300">
                                {language === 'hi' ? 'दिया:' : 'Paid:'} ₹{paid}
                              </span>
                              <span
                                className={`px-1.5 py-0.5 rounded font-bold ${
                                  due > 0
                                    ? 'bg-rose-100 text-rose-800 dark:bg-rose-950/60 dark:text-rose-300'
                                    : 'bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300'
                                }`}
                              >
                                {language === 'hi' ? 'बाकी:' : 'Due:'} ₹{due}
                              </span>
                            </div>
                            {status === 'paid' && due === 0 && earned > 0 && (
                              <span className="inline-flex items-center gap-0.5 text-[9px] font-bold text-emerald-600 dark:text-emerald-400">
                                <CheckCircle2 className="w-2.5 h-2.5" />
                                <span>{language === 'hi' ? 'पूरा चुकता' : 'Paid in Full'}</span>
                              </span>
                            )}
                          </div>
                        );
                      })()}
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-8 text-slate-400 text-xs">
              {language === 'hi' ? 'कोई विस्तृत कारीगर प्रविष्टि नहीं मिली' : 'No individual worker entries recorded'}
            </div>
          )}

          {record.notes && (
            <div className="p-3 rounded-xl bg-slate-100 dark:bg-slate-800 text-[11px] text-slate-600 dark:text-slate-300">
              <span className="font-bold block mb-0.5">{language === 'hi' ? 'टिप्पणी (Notes):' : 'Notes:'}</span>
              <p className="italic">{record.notes}</p>
            </div>
          )}
        </div>

        {/* Bottom Action Footer */}
        <div className="p-3 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 flex items-center gap-2">
          {/* Download PDF Button */}
          <button
            onClick={handleDownloadPdf}
            className="flex-1 py-2.5 px-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-sm transition-colors"
          >
            <Download className="w-4 h-4" />
            <span>{language === 'hi' ? 'दैनिक हाजिरी पीडीएफ डाउनलोड' : 'Download Day Attendance PDF'}</span>
          </button>

          {/* Export CSV button */}
          <button
            onClick={handleDownloadCsv}
            className="p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-100 text-slate-700 dark:text-slate-200 transition-colors"
            title="Download CSV"
          >
            <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
          </button>

          {/* Edit Pen Button */}
          {onEditLabour && (
            <button
              onClick={() => {
                onClose();
                onEditLabour(record);
              }}
              className="p-2.5 rounded-xl border border-blue-200 dark:border-blue-800 bg-blue-50 dark:bg-blue-950/60 hover:bg-blue-100 text-blue-600 dark:text-blue-400 transition-colors"
              title="Edit Attendance Register"
            >
              <Edit2 className="w-4 h-4" />
            </button>
          )}
        </div>

      </div>
    </div>
  );
};
