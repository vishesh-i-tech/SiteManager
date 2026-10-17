import React, { useState, useRef } from 'react';
import { useTheme } from '../../core/theme/ThemeContext';
import { Site, LabourRecord, LabourEntry } from '../../types';
import { db } from '../../core/db/database';
import { runLabourRegisterOcr } from '../../utils/ocrProcessor';
import {
  Camera,
  Upload,
  Sparkles,
  CheckCircle2,
  X,
  Plus,
  Trash2,
  Building,
  Calendar,
  AlertCircle,
  FileImage,
  Layers,
} from 'lucide-react';

interface PhotoOcrModalProps {
  isOpen: boolean;
  onClose: () => void;
  sites: Site[];
  defaultSiteId?: string;
  onRecordSaved: () => void;
}

export const PhotoOcrModal: React.FC<PhotoOcrModalProps> = ({
  isOpen,
  onClose,
  sites,
  defaultSiteId,
  onRecordSaved,
}) => {
  const { t, language, tradeConfig } = useTheme();

  const [siteId, setSiteId] = useState(defaultSiteId || (sites[0]?.id || ''));
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [photoUrl, setPhotoUrl] = useState<string | null>(null);
  const [isProcessingOcr, setIsProcessingOcr] = useState(false);
  const [ocrProgress, setOcrProgress] = useState<number>(0);
  const [ocrConfidence, setOcrConfidence] = useState<number | null>(null);
  const [entries, setEntries] = useState<LabourEntry[]>([]);
  const [isSaving, setIsSaving] = useState(false);
  const cameraInputRef = useRef<HTMLInputElement>(null);
  const galleryInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (event) => {
      const dataUrl = event.target?.result as string;
      setPhotoUrl(dataUrl);
      processImage(dataUrl);
    };
    reader.readAsDataURL(file);
  };

  const processImage = async (dataUrl: string) => {
    setIsProcessingOcr(true);
    setOcrProgress(10);
    try {
      const result = await runLabourRegisterOcr(dataUrl, `lr-${Date.now()}`, (prog) => {
        setOcrProgress(prog);
      });
      setEntries(result.extractedEntries);
      setOcrConfidence(result.confidence);
    } catch (err) {
      console.error('OCR pipeline failed:', err);
    } finally {
      setIsProcessingOcr(false);
    }
  };


  const handleUpdateEntry = (index: number, field: keyof LabourEntry, val: any) => {
    const updated = [...entries];
    updated[index] = { ...updated[index], [field]: val };
    
    // Auto recalculate wage if status changes
    if (field === 'attendanceStatus') {
      const base = updated[index].dailyWage || 600;
      if (val === 'half_day') updated[index].paidAmount = base * 0.5;
      else if (val === 'absent') updated[index].paidAmount = 0;
      else updated[index].paidAmount = base;
    }

    setEntries(updated);
  };

  const handleAddWorkerRow = () => {
    setEntries([
      ...entries,
      {
        id: `entry-${Date.now()}-${entries.length}`,
        recordId: `lr-${Date.now()}`,
        workerName: 'New Worker',
        role: 'Helper',
        attendanceStatus: 'full_day',
        dailyWage: 550,
        paidAmount: 550,
        balanceDue: 0,
      },
    ]);
  };

  const handleRemoveRow = (index: number) => {
    setEntries(entries.filter((_, i) => i !== index));
  };

  const handleSaveAttendance = async () => {
    if (!siteId || entries.length === 0) return;

    setIsSaving(true);
    try {
      const recordId = `lr-${Date.now()}`;
      const totalDailyWage = entries.reduce((acc, e) => acc + (e.dailyWage || 0), 0);
      const totalPaid = entries.reduce((acc, e) => acc + (e.paidAmount || 0), 0);

      const labourRecord: LabourRecord = {
        id: recordId,
        siteId,
        date,
        rawPhotoUrl: photoUrl || undefined,
        ocrRawText: 'Scanned from handwritten attendance register',
        totalWorkers: entries.length,
        totalDailyWage,
        totalPaid,
        entries: entries.map((e) => ({ ...e, recordId })),
      };

      await db.labourRecords.put(labourRecord);
      for (const entry of labourRecord.entries || []) {
        await db.labourEntries.put(entry);
      }

      onRecordSaved();
      onClose();
    } catch (err) {
      console.error('Failed to save OCR labour record', err);
    } finally {
      setIsSaving(false);
    }
  };

  const totalWages = entries.reduce((acc, e) => acc + (e.dailyWage || 0), 0);

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-2 sm:p-4 overflow-y-auto">
      {/* Separate Backdrop Layer */}
      <div className="fixed inset-0 bg-slate-950/75 backdrop-blur-sm transition-opacity" onClick={onClose} />

      {/* Interactive Sharp Dialog Container */}
      <div className="relative z-10 bg-white dark:bg-slate-900 w-full max-w-4xl rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col max-h-[95vh] animate-fade-in">
        
        {/* Header */}
        <div className="p-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-800/40">
          <div className="flex items-center gap-2.5">
            <div
              className="w-10 h-10 rounded-2xl flex items-center justify-center text-white shadow-md"
              style={{ backgroundColor: tradeConfig.primaryColor }}
            >
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-extrabold text-base text-slate-900 dark:text-white font-heading">
                {t('ocrUploadTitle')}
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {language === 'hi' ? 'डायरी या रजिस्टर की फोटो खींचें, AI हाजिरी बना देगा' : 'Photo → OCR draft → Review & Edit → Confirm'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 overflow-y-auto flex-1 space-y-5">
          
          {/* Top Controls: Site & Date Selection */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1 flex items-center gap-1.5">
                <Building className="w-3.5 h-3.5 text-orange-500" />
                <span>{language === 'hi' ? 'साइट चुनें *' : 'Target Site *'}</span>
              </label>
              <select
                value={siteId}
                onChange={(e) => setSiteId(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl text-xs font-semibold bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:outline-none dark:text-white"
              >
                {sites.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name} ({s.location})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1 flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-blue-500" />
                <span>{language === 'hi' ? 'हाजिरी की तारीख *' : 'Attendance Date *'}</span>
              </label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl text-xs font-semibold bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:outline-none dark:text-white"
              />
            </div>
          </div>

          {/* Upload / Capture Section if no photo selected */}
          {!photoUrl ? (
            <div className="border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-3xl p-8 text-center space-y-4 bg-slate-50/50 dark:bg-slate-800/30">
              <div
                className="w-16 h-16 mx-auto rounded-2xl flex items-center justify-center text-white shadow-lg"
                style={{ backgroundColor: tradeConfig.primaryColor }}
              >
                <Camera className="w-8 h-8" />
              </div>

              <div className="max-w-sm mx-auto">
                <h3 className="font-extrabold text-sm text-slate-900 dark:text-white">
                  {language === 'hi' ? 'रजिस्टर की फोटो अपलोड करें' : 'Upload Handwritten Register Photo'}
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  {t('ocrInstruction')}
                </p>
              </div>

              {/* Camera Input (opens native device camera) */}
              <input
                type="file"
                ref={cameraInputRef}
                accept="image/*"
                capture="environment"
                onChange={handleFileUpload}
                className="hidden"
              />

              {/* Gallery Input (opens file picker / gallery) */}
              <input
                type="file"
                ref={galleryInputRef}
                accept="image/*"
                onChange={handleFileUpload}
                className="hidden"
              />

              {/* Side-by-Side: Take Photo (Camera) & Upload Photo (Gallery) */}
              <div className="flex flex-col sm:flex-row items-stretch justify-center gap-3 pt-2 max-w-md mx-auto w-full">
                <button
                  type="button"
                  onClick={() => {
                    if (cameraInputRef.current) {
                      cameraInputRef.current.value = '';
                      cameraInputRef.current.click();
                    }
                  }}
                  className="flex-1 py-3 px-4 rounded-2xl text-xs font-bold text-white shadow-md flex items-center justify-center gap-2 transition-all active:scale-[0.98] cursor-pointer"
                  style={{ backgroundColor: tradeConfig.primaryColor }}
                >
                  <Camera className="w-4 h-4" />
                  <span>{language === 'hi' ? 'फोटो खींचें (Camera)' : 'Take Photo'}</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    if (galleryInputRef.current) {
                      galleryInputRef.current.value = '';
                      galleryInputRef.current.click();
                    }
                  }}
                  className="flex-1 py-3 px-4 rounded-2xl text-xs font-bold text-slate-700 dark:text-slate-200 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 shadow-xs flex items-center justify-center gap-2 transition-all active:scale-[0.98] cursor-pointer"
                >
                  <Upload className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                  <span>{language === 'hi' ? 'गैलरी से अपलोड करें' : 'Upload Photo'}</span>
                </button>
              </div>
            </div>
          ) : (
            /* Split View: Photo Thumbnail + Extracted Draft Form */
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              
              {/* Left Column: Photo Preview */}
              <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-extrabold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                    <FileImage className="w-4 h-4 text-blue-500" />
                    Original Photo Record
                  </span>
                  <button
                    onClick={() => {
                      setPhotoUrl(null);
                      setEntries([]);
                    }}
                    className="text-[11px] font-bold text-red-600 hover:underline"
                  >
                    Change Photo
                  </button>
                </div>

                <div className="relative rounded-xl overflow-hidden border border-slate-200 dark:border-slate-700 max-h-56">
                  <img src={photoUrl} alt="Muster Roll" className="w-full h-auto object-cover" />
                  {isProcessingOcr && (
                    <div className="absolute inset-0 bg-slate-950/75 backdrop-blur-sm flex flex-col items-center justify-center text-white p-4">
                      <div className="w-8 h-8 border-3 border-orange-500 border-t-transparent rounded-full animate-spin mb-2"></div>
                      <span className="text-xs font-bold">{t('ocrProcessing')}</span>
                      <span className="text-[11px] text-slate-300 mt-1">{ocrProgress}%</span>
                    </div>
                  )}
                </div>

                <div className="p-2.5 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900 text-[11px] text-amber-800 dark:text-amber-300 space-y-1">
                  <div className="font-bold flex items-center gap-1">
                    <AlertCircle className="w-3.5 h-3.5" />
                    <span>Editable Preview Draft</span>
                  </div>
                  <p>{t('ocrConfidenceNotice')}</p>
                </div>
              </div>

              {/* Right Columns: Structured Draft Form */}
              <div className="md:col-span-2 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-extrabold uppercase tracking-wider text-slate-500">
                      {entries.length} Workers Extracted
                    </span>
                    <span className="text-xs font-black text-slate-900 dark:text-white">
                      (Total Wages: ₹{totalWages.toLocaleString('en-IN')})
                    </span>
                  </div>

                  <button
                    type="button"
                    onClick={handleAddWorkerRow}
                    className="px-2.5 py-1 rounded-lg text-xs font-bold text-orange-600 dark:text-orange-400 bg-orange-50 dark:bg-orange-950/40 border border-orange-200 dark:border-orange-800 flex items-center gap-1 hover:bg-orange-100"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>{t('addWorker')}</span>
                  </button>
                </div>

                {/* Worker Rows */}
                <div className="space-y-2 max-h-80 overflow-y-auto pr-1">
                  {entries.map((entry, idx) => (
                    <div
                      key={entry.id || idx}
                      className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 grid grid-cols-12 gap-2 items-center text-xs"
                    >
                      {/* Name */}
                      <div className="col-span-4">
                        <input
                          type="text"
                          value={entry.workerName}
                          onChange={(e) => handleUpdateEntry(idx, 'workerName', e.target.value)}
                          placeholder="Worker Name"
                          className="w-full px-2.5 py-1.5 rounded-lg font-bold bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 dark:text-white"
                        />
                      </div>

                      {/* Role */}
                      <div className="col-span-3">
                        <select
                          value={entry.role}
                          onChange={(e) => handleUpdateEntry(idx, 'role', e.target.value)}
                          className="w-full px-2 py-1.5 rounded-lg font-semibold bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 dark:text-white text-[11px]"
                        >
                          <option value="Mason">Mason</option>
                          <option value="Helper">Helper</option>
                          <option value="Carpenter">Carpenter</option>
                          <option value="Electrician">Electrician</option>
                          <option value="Plumber">Plumber</option>
                          <option value="Painter">Painter</option>
                          <option value="Welder">Welder</option>
                          <option value="Supervisor">Supervisor</option>
                        </select>
                      </div>

                      {/* Attendance */}
                      <div className="col-span-2">
                        <select
                          value={entry.attendanceStatus}
                          onChange={(e) => handleUpdateEntry(idx, 'attendanceStatus', e.target.value)}
                          className="w-full px-1.5 py-1.5 rounded-lg font-bold bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-[11px]"
                        >
                          <option value="full_day">Full (P)</option>
                          <option value="half_day">Half (H)</option>
                          <option value="absent">Absent (A)</option>
                        </select>
                      </div>

                      {/* Wage */}
                      <div className="col-span-2">
                        <input
                          type="number"
                          value={entry.dailyWage}
                          onChange={(e) => handleUpdateEntry(idx, 'dailyWage', Number(e.target.value))}
                          placeholder="Wage"
                          className="w-full px-2 py-1.5 rounded-lg font-bold bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 dark:text-white text-right"
                        />
                      </div>

                      {/* Delete */}
                      <div className="col-span-1 text-right">
                        <button
                          type="button"
                          onClick={() => handleRemoveRow(idx)}
                          className="p-1 text-slate-400 hover:text-red-600 rounded-lg"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="p-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-end gap-2 bg-slate-50/50 dark:bg-slate-800/40">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            {t('cancel')}
          </button>
          <button
            type="button"
            onClick={handleSaveAttendance}
            disabled={entries.length === 0 || isSaving}
            className="px-5 py-2.5 rounded-xl text-xs font-extrabold text-white shadow-md flex items-center gap-2 transition-all btn-tactile disabled:opacity-50 glow-theme"
            style={{ backgroundColor: tradeConfig.primaryColor }}
          >
            <CheckCircle2 className="w-4 h-4" />
            <span>{isSaving ? 'Saving...' : t('confirm')}</span>
          </button>
        </div>

      </div>
    </div>
  );
};
