import React, { useState, useRef, useEffect } from 'react';
import { useTheme } from '../../core/theme/ThemeContext';
import { Site, LabourRecord, LabourEntry } from '../../types';
import { db } from '../../core/db/database';
import { runLabourRegisterOcr, RegisterValidationStatus } from '../../utils/ocrProcessor';
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
  AlertTriangle,
  FileImage,
  SwitchCamera,
  Loader2,
  Users,
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
  const [validation, setValidation] = useState<RegisterValidationStatus | null>(null);
  const [validationError, setValidationError] = useState<string | null>(null);
  const [entries, setEntries] = useState<LabourEntry[]>([]);
  const [isSaving, setIsSaving] = useState(false);

  // Live Camera Capture State & Refs
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [isStartingCamera, setIsStartingCamera] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [facingMode, setFacingMode] = useState<'environment' | 'user'>('environment');
  const [hasMultipleCameras, setHasMultipleCameras] = useState(false);

  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);
  const galleryInputRef = useRef<HTMLInputElement>(null);

  /**
   * Stop all active media stream tracks and reset video element.
   */
  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    setIsCameraActive(false);
    setIsStartingCamera(false);
  };

  /**
   * Start live camera stream using browser navigator.mediaDevices.getUserMedia.
   */
  const startCamera = async (mode: 'environment' | 'user' = facingMode) => {
    setCameraError(null);

    if (!navigator?.mediaDevices?.getUserMedia) {
      setCameraError(
        language === 'hi'
          ? 'आपके ब्राउज़र या वातावरण में कैमरा समर्थित नहीं है। कृपया "गैलरी से अपलोड करें" का उपयोग करें।'
          : 'Camera access is not supported by your browser or environment. Please use "Upload Photo".'
      );
      return;
    }

    setIsStartingCamera(true);
    setIsCameraActive(true);

    // Stop any existing stream
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }

    try {
      // Check for multiple video devices to conditionally display switch camera button
      try {
        const devices = await navigator.mediaDevices.enumerateDevices();
        const videoInputs = devices.filter((d) => d.kind === 'videoinput');
        setHasMultipleCameras(videoInputs.length > 1);
      } catch {
        // Enumerate error is non-fatal
      }

      let stream: MediaStream;
      try {
        stream = await navigator.mediaDevices.getUserMedia({
          video: {
            facingMode: { ideal: mode },
            width: { ideal: 1920 },
            height: { ideal: 1080 },
          },
          audio: false,
        });
      } catch (modeErr) {
        console.warn('FacingMode constraint failed, falling back to basic video constraint:', modeErr);
        stream = await navigator.mediaDevices.getUserMedia({
          video: true,
          audio: false,
        });
      }

      streamRef.current = stream;
      setFacingMode(mode);

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        try {
          await videoRef.current.play();
        } catch {
          // Play error
        }
      }
    } catch (err: any) {
      console.error('Camera access failed:', err);
      stopCamera();

      if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
        setCameraError(
          language === 'hi'
            ? 'कैमरा अनुमति अस्वीकार कर दी गई। कृपया ब्राउज़र सेटिंग्स में कैमरा चालू करें।'
            : 'Camera permission denied. Please allow camera access in your browser settings to take photos.'
        );
      } else if (err.name === 'NotFoundError' || err.name === 'DevicesNotFoundError') {
        setCameraError(
          language === 'hi'
            ? 'डिवाइस पर कोई कैमरा नहीं मिला। कृपया कैमरा कनेक्ट करें या फोटो अपलोड करें।'
            : 'No camera device found on this system. Please connect a camera or upload a photo.'
        );
      } else if (err.name === 'NotReadableError' || err.name === 'TrackStartError') {
        setCameraError(
          language === 'hi'
            ? 'कैमरा किसी अन्य ऐप द्वारा उपयोग में है। कृपया अन्य ऐप बंद कर पुनः प्रयास करें।'
            : 'Camera is currently in use by another application. Please close other camera apps and retry.'
        );
      } else {
        setCameraError(
          language === 'hi'
            ? `कैमरा शुरू करने में समस्या आई: ${err.message || 'अज्ञात त्रुटि'}`
            : `Unable to access camera: ${err.message || 'Unknown error'}`
        );
      }
    } finally {
      setIsStartingCamera(false);
    }
  };

  /**
   * Capture a snapshot from the active video stream and feed into OCR pipeline.
   */
  const handleCapturePhoto = () => {
    if (!videoRef.current) return;
    const video = videoRef.current;

    const width = video.videoWidth || 1280;
    const height = video.videoHeight || 720;

    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.drawImage(video, 0, 0, width, height);
    const dataUrl = canvas.toDataURL('image/jpeg', 0.92);

    // Stop all camera media tracks immediately upon capture
    stopCamera();

    // Pass captured image into existing OCR processing pipeline
    setPhotoUrl(dataUrl);
    processImage(dataUrl);
  };

  /**
   * Toggle between front and rear cameras if available.
   */
  const handleToggleFacingMode = () => {
    const nextMode = facingMode === 'environment' ? 'user' : 'environment';
    startCamera(nextMode);
  };

  /**
   * Safe modal close stopping all camera tracks.
   */
  const handleClose = () => {
    stopCamera();
    onClose();
  };

  // Connect stream to video element when camera becomes active or videoRef mounts
  useEffect(() => {
    if (isCameraActive && videoRef.current && streamRef.current) {
      if (videoRef.current.srcObject !== streamRef.current) {
        videoRef.current.srcObject = streamRef.current;
      }
      videoRef.current.play().catch((err) => {
        console.warn('Video auto-play was prevented:', err);
      });
    }
  }, [isCameraActive]);

  // Clean up camera stream when modal closes or unmounts
  useEffect(() => {
    if (!isOpen) {
      stopCamera();
    }
    return () => {
      stopCamera();
    };
  }, [isOpen]);

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
    setValidationError(null);
    try {
      const result = await runLabourRegisterOcr(dataUrl, `lr-${Date.now()}`, (prog) => {
        setOcrProgress(prog);
      });
      setEntries(result.extractedEntries);
      setOcrConfidence(result.confidence);
      setValidation(result.validation);
    } catch (err) {
      console.error('OCR pipeline failed:', err);
      setValidation({
        isLikelyRegister: false,
        confidence: 0,
        detectedSignals: {
          hasAttendanceTokens: false,
          hasRoleTokens: false,
          hasWageTokens: false,
          hasNumberedRows: false,
          validRowCount: 0,
        },
        warningMessage: 'OCR processing failed to parse image.',
      });
    } finally {
      setIsProcessingOcr(false);
    }
  };

  const handleUpdateEntry = (index: number, field: keyof LabourEntry, val: any) => {
    const updated = [...entries];
    updated[index] = { ...updated[index], [field]: val };

    // Auto recalculate wage if status changes
    const base = Number(updated[index].dailyWage) || 0;
    const status = updated[index].attendanceStatus;
    if (status === 'half_day') updated[index].paidAmount = Math.round(base * 0.5);
    else if (status === 'absent') updated[index].paidAmount = 0;
    else updated[index].paidAmount = base;

    setEntries(updated);
    if (validationError) setValidationError(null);
  };

  const handleAddWorkerRow = () => {
    setEntries([
      ...entries,
      {
        id: `entry-${Date.now()}-${entries.length}`,
        recordId: `lr-${Date.now()}`,
        workerName: '',
        role: 'Helper',
        attendanceStatus: 'full_day',
        dailyWage: 0,
        paidAmount: 0,
        balanceDue: 0,
      },
    ]);
    if (validationError) setValidationError(null);
  };

  const handleRemoveRow = (index: number) => {
    setEntries(entries.filter((_, i) => i !== index));
    if (validationError) setValidationError(null);
  };

  const handleSaveAttendance = async () => {
    if (!siteId) {
      setValidationError(
        language === 'hi' ? 'कृपया लक्ष्य साइट चुनें।' : 'Please select a target site.'
      );
      return;
    }

    if (entries.length === 0) {
      setValidationError(
        language === 'hi'
          ? 'सहेजने के लिए कोई कामगार रिकॉर्ड नहीं है। कृपया कामगार जोड़ें।'
          : 'No worker entries to save. Please add at least one worker.'
      );
      return;
    }

    // 1. Validate worker names (reject empty or placeholder-only names)
    for (let i = 0; i < entries.length; i++) {
      const name = (entries[i].workerName || '').trim();
      if (
        name.length < 2 ||
        /^worker\s*\d*$/i.test(name) ||
        /^new worker$/i.test(name)
      ) {
        setValidationError(
          language === 'hi'
            ? `पंक्ति ${i + 1}: कृपया वैध कामगार का असली नाम दर्ज करें (जैसे "रमेश")।`
            : `Row ${i + 1}: Please enter a valid worker name (placeholder names not allowed).`
        );
        return;
      }
    }

    // 2. Validate daily wages (must be > 0 unless marked absent)
    for (let i = 0; i < entries.length; i++) {
      const entry = entries[i];
      if (entry.attendanceStatus !== 'absent' && (!entry.dailyWage || entry.dailyWage <= 0)) {
        setValidationError(
          language === 'hi'
            ? `पंक्ति ${i + 1} (${entry.workerName}): कृपया वैध दैनिक मजदूरी दर्ज करें (> ₹0) या हाजिरी को "अनुपस्थित" चुनें।`
            : `Row ${i + 1} (${entry.workerName}): Please enter a valid daily wage (> ₹0) or mark attendance as Absent.`
        );
        return;
      }
    }

    setValidationError(null);
    setIsSaving(true);
    try {
      const recordId = `lr-${Date.now()}`;
      const totalDailyWage = entries.reduce((acc, e) => acc + (Number(e.dailyWage) || 0), 0);
      const totalPaid = entries.reduce((acc, e) => acc + (Number(e.paidAmount) || 0), 0);

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

      stopCamera();
      onRecordSaved();
      onClose();
    } catch (err) {
      console.error('Failed to save OCR labour record', err);
      setValidationError(
        language === 'hi' ? 'रिकॉर्ड सहेजने में त्रुटि हुई।' : 'Failed to save labour record to database.'
      );
    } finally {
      setIsSaving(false);
    }
  };

  const totalWages = entries.reduce((acc, e) => acc + (Number(e.dailyWage) || 0), 0);
  const missingWageCount = entries.filter(
    (e) => e.attendanceStatus !== 'absent' && (!e.dailyWage || e.dailyWage <= 0)
  ).length;
  const missingNameCount = entries.filter(
    (e) =>
      !e.workerName?.trim() ||
      /^worker\s*\d*$/i.test(e.workerName.trim()) ||
      /^new worker$/i.test(e.workerName.trim())
  ).length;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-2 sm:p-4 overflow-y-auto">
      {/* Separate Backdrop Layer */}
      <div className="fixed inset-0 bg-slate-950/75 backdrop-blur-sm transition-opacity" onClick={handleClose} />

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
            onClick={handleClose}
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
            isCameraActive ? (
              /* Live Camera Viewfinder with Capture & Controls */
              <div className="relative rounded-3xl overflow-hidden bg-slate-950 border border-slate-700 shadow-2xl flex flex-col items-center justify-center min-h-[360px] max-h-[500px]">
                {/* Live Video Feed */}
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  muted
                  onLoadedMetadata={() => {
                    videoRef.current?.play().catch(() => {});
                  }}
                  className="w-full h-full max-h-[460px] object-contain rounded-2xl bg-black"
                />

                {/* Starting Camera Loading Overlay */}
                {isStartingCamera && (
                  <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm flex flex-col items-center justify-center text-white z-20">
                    <Loader2 className="w-8 h-8 text-orange-500 animate-spin mb-2" />
                    <span className="text-xs font-bold">
                      {language === 'hi' ? 'कैमरा शुरू हो रहा है...' : 'Starting camera...'}
                    </span>
                  </div>
                )}

                {/* Top Viewfinder Bar: Live indicator + Switch Camera + Close */}
                <div className="absolute top-3 inset-x-3 flex items-center justify-between z-10">
                  <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-900/80 backdrop-blur-md border border-white/10 text-white text-[11px] font-bold">
                    <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                    <span>{language === 'hi' ? 'लाइव कैमरा' : 'Live Camera'}</span>
                  </div>

                  <div className="flex items-center gap-2">
                    {hasMultipleCameras && (
                      <button
                        type="button"
                        onClick={handleToggleFacingMode}
                        title="Switch Camera"
                        className="p-2 rounded-full bg-slate-900/80 backdrop-blur-md border border-white/10 text-white hover:bg-slate-800 transition-colors"
                      >
                        <SwitchCamera className="w-4 h-4" />
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={stopCamera}
                      title="Close Camera"
                      className="p-2 rounded-full bg-slate-900/80 backdrop-blur-md border border-white/10 text-white hover:bg-slate-800 transition-colors"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Viewfinder Alignment Guide Box */}
                <div className="absolute inset-8 sm:inset-12 pointer-events-none border-2 border-dashed border-white/30 rounded-2xl flex items-end justify-center pb-3">
                  <span className="px-3 py-1 rounded-lg bg-black/60 backdrop-blur-sm text-white/90 text-[10px] font-semibold text-center">
                    {language === 'hi'
                      ? 'हाजिरी रजिस्टर के पन्ने को इस फ्रेम के अंदर रखें'
                      : 'Align muster roll page inside frame'}
                  </span>
                </div>

                {/* Bottom Action Bar */}
                <div className="absolute bottom-4 inset-x-4 flex items-center justify-center gap-4 z-10">
                  <button
                    type="button"
                    onClick={stopCamera}
                    className="px-4 py-2.5 rounded-xl bg-slate-900/80 backdrop-blur-md border border-white/20 text-white text-xs font-bold hover:bg-slate-800 transition-all"
                  >
                    {language === 'hi' ? 'रद्द करें' : 'Cancel'}
                  </button>

                  <button
                    type="button"
                    disabled={isStartingCamera}
                    onClick={handleCapturePhoto}
                    className="px-6 py-3 rounded-2xl text-xs font-extrabold text-white shadow-xl flex items-center gap-2 transition-all active:scale-95 glow-theme disabled:opacity-50"
                    style={{ backgroundColor: tradeConfig.primaryColor }}
                  >
                    <Camera className="w-5 h-5" />
                    <span>{language === 'hi' ? 'फोटो लें (Capture)' : 'Capture Photo'}</span>
                  </button>
                </div>
              </div>
            ) : (
              /* Normal Choice View: Take Photo (Camera) vs Upload Photo (Gallery) */
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

                {/* Camera Error Message with action buttons */}
                {cameraError && (
                  <div className="p-3 rounded-2xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 text-xs flex items-start gap-2 max-w-md mx-auto text-left">
                    <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                    <div className="flex-1 space-y-1">
                      <span className="font-bold block">
                        {language === 'hi' ? 'कैमरा समस्या:' : 'Camera Issue:'}
                      </span>
                      <p className="text-[11px] leading-tight">{cameraError}</p>
                      <div className="pt-1 flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => startCamera()}
                          className="px-2.5 py-1 rounded-lg bg-red-600 hover:bg-red-700 text-white font-bold text-[10px]"
                        >
                          {language === 'hi' ? 'पुनः प्रयास' : 'Retry'}
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            if (cameraInputRef.current) {
                              cameraInputRef.current.value = '';
                              cameraInputRef.current.click();
                            }
                          }}
                          className="px-2.5 py-1 rounded-lg bg-slate-200 dark:bg-slate-700 text-slate-800 dark:text-slate-200 font-bold text-[10px]"
                        >
                          {language === 'hi' ? 'सिस्टम कैमरा' : 'System Camera'}
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {/* Fallback Camera Input (for system camera if desired/fallback) */}
                <input
                  type="file"
                  ref={cameraInputRef}
                  accept="image/*"
                  capture="environment"
                  onChange={handleFileUpload}
                  className="hidden"
                />

                {/* Gallery Input (opens standard file picker / gallery) */}
                <input
                  type="file"
                  ref={galleryInputRef}
                  accept="image/*"
                  onChange={handleFileUpload}
                  className="hidden"
                />

                {/* Side-by-Side: Take Photo (Live Camera) & Upload Photo (Gallery / File Picker) */}
                <div className="flex flex-col sm:flex-row items-stretch justify-center gap-3 pt-2 max-w-md mx-auto w-full">
                  <button
                    type="button"
                    onClick={() => startCamera()}
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
            )
          ) : (
            /* Split View: Photo Thumbnail + Extracted Draft Form */
            <div className="space-y-4">
              {/* Validation Warning Banner if image does not resemble register */}
              {validation && !validation.isLikelyRegister && (
                <div className="p-3.5 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-300 dark:border-amber-800 text-amber-900 dark:text-amber-200 text-xs flex items-start gap-2.5">
                  <AlertTriangle className="w-5 h-5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
                  <div className="space-y-1">
                    <span className="font-extrabold block text-xs">
                      {language === 'hi'
                        ? 'चेतावनी: हाजिरी रजिस्टर की पहचान नहीं हुई'
                        : 'Warning: Unrecognized Image / Low Register Confidence'}
                    </span>
                    <p className="text-[11px] leading-relaxed text-amber-800/90 dark:text-amber-300/90">
                      {validation.warningMessage ||
                        (language === 'hi'
                          ? 'यह फोटो हाजिरी रजिस्टर जैसी नहीं लग रही है। इसमें हाजिरी या कामगारों का विवरण नहीं मिला। आप नीचे मैन्युअल रूप से कामगार जोड़ सकते हैं।'
                          : 'This photo does not clearly resemble an attendance register. No verified worker rows were extracted automatically. You can review or manually add worker rows below.')}
                    </p>
                  </div>
                </div>
              )}

              {/* Pre-save Validation Error Banner */}
              {validationError && (
                <div className="p-3.5 rounded-2xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 text-xs flex items-start gap-2">
                  <AlertCircle className="w-5 h-5 shrink-0 text-red-600 dark:text-red-400 mt-0.5" />
                  <div className="space-y-0.5 flex-1 font-semibold leading-relaxed">
                    <span className="font-bold block">
                      {language === 'hi' ? 'सहेजने से पहले जांचें:' : 'Please fix before saving:'}
                    </span>
                    <span>{validationError}</span>
                  </div>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Left Column: Photo Preview */}
                <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-extrabold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                      <FileImage className="w-4 h-4 text-blue-500" />
                      Original Photo Record
                    </span>
                    <button
                      type="button"
                      onClick={() => {
                        stopCamera();
                        setPhotoUrl(null);
                        setEntries([]);
                        setValidation(null);
                        setValidationError(null);
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

                  {ocrConfidence !== null && (
                    <div className="flex items-center justify-between text-[11px] px-2.5 py-1.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700">
                      <span className="text-slate-500">
                        {language === 'hi' ? 'OCR विश्वसनीयता:' : 'OCR Confidence:'}
                      </span>
                      <span
                        className={`font-mono font-bold ${
                          ocrConfidence >= 60
                            ? 'text-emerald-600 dark:text-emerald-400'
                            : 'text-amber-600 dark:text-amber-400'
                        }`}
                      >
                        {Math.round(ocrConfidence)}%
                      </span>
                    </div>
                  )}

                  <div className="p-2.5 rounded-xl bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-900 text-[11px] text-blue-800 dark:text-blue-300 space-y-1">
                    <div className="font-bold flex items-center gap-1">
                      <AlertCircle className="w-3.5 h-3.5" />
                      <span>Editable Draft</span>
                    </div>
                    <p className="leading-tight">
                      {language === 'hi'
                        ? 'OCR केवल एक सहायक उपकरण है। कृपया सहेजने से पहले सभी नामों और मजदूरी की पुष्टि करें।'
                        : 'OCR is an assistant tool. Please review and verify all names and daily wages before saving.'}
                    </p>
                  </div>
                </div>

                {/* Right Columns: Structured Draft Form */}
                <div className="md:col-span-2 space-y-3">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-xs font-extrabold uppercase tracking-wider text-slate-500">
                        {entries.length} {entries.length === 1 ? 'Worker' : 'Workers'}
                      </span>
                      <span className="text-xs font-black text-slate-900 dark:text-white">
                        (Total Wages: ₹{totalWages.toLocaleString('en-IN')})
                      </span>
                      {missingWageCount > 0 && (
                        <span className="text-[10px] font-bold text-amber-700 dark:text-amber-300 bg-amber-100 dark:bg-amber-950/60 px-2 py-0.5 rounded-full border border-amber-200 dark:border-amber-800">
                          {missingWageCount} need wage
                        </span>
                      )}
                      {missingNameCount > 0 && (
                        <span className="text-[10px] font-bold text-red-700 dark:text-red-300 bg-red-100 dark:bg-red-950/60 px-2 py-0.5 rounded-full border border-red-200 dark:border-red-800">
                          {missingNameCount} need name
                        </span>
                      )}
                    </div>

                    <button
                      type="button"
                      onClick={handleAddWorkerRow}
                      className="px-2.5 py-1 rounded-lg text-xs font-bold text-orange-600 dark:text-orange-400 bg-orange-50 dark:bg-orange-950/40 border border-orange-200 dark:border-orange-800 flex items-center gap-1 hover:bg-orange-100 shrink-0 self-start sm:self-auto"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>{t('addWorker')}</span>
                    </button>
                  </div>

                  {/* Empty State when no workers extracted */}
                  {entries.length === 0 ? (
                    <div className="text-center py-10 px-4 rounded-2xl border-2 border-dashed border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/30 space-y-2.5">
                      <div className="w-10 h-10 mx-auto rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-400">
                        <Users className="w-5 h-5" />
                      </div>
                      <p className="text-xs font-bold text-slate-700 dark:text-slate-300">
                        {language === 'hi'
                          ? 'कोई कामगार पंक्ति नहीं मिली'
                          : 'No worker entries extracted'}
                      </p>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 max-w-xs mx-auto">
                        {language === 'hi'
                          ? 'फोटो से कोई स्पष्ट हाजिरी रिकॉर्ड नहीं मिला। आप नीचे बटन दबाकर मैन्युअल रूप से कामगार जोड़ सकते हैं।'
                          : 'No structured muster records recognized from the photo. Click below to add workers manually.'}
                      </p>
                      <button
                        type="button"
                        onClick={handleAddWorkerRow}
                        className="mt-1 px-3 py-1.5 rounded-xl text-xs font-bold text-orange-600 dark:text-orange-400 bg-orange-50 dark:bg-orange-950/60 border border-orange-200 dark:border-orange-800 hover:bg-orange-100 inline-flex items-center gap-1"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>{t('addWorker')}</span>
                      </button>
                    </div>
                  ) : (
                    /* Worker Rows */
                    <div className="space-y-2 max-h-80 overflow-y-auto pr-1">
                      {entries.map((entry, idx) => {
                        const isNameMissing =
                          !entry.workerName?.trim() ||
                          /^worker\s*\d*$/i.test(entry.workerName.trim()) ||
                          /^new worker$/i.test(entry.workerName.trim());
                        const isWageMissing =
                          entry.attendanceStatus !== 'absent' &&
                          (!entry.dailyWage || entry.dailyWage <= 0);

                        return (
                          <div
                            key={entry.id || idx}
                            className={`p-3 rounded-xl border grid grid-cols-12 gap-2 items-center text-xs transition-colors ${
                              isNameMissing || isWageMissing
                                ? 'bg-amber-50/40 dark:bg-amber-950/20 border-amber-200 dark:border-amber-900/60'
                                : 'bg-slate-50 dark:bg-slate-800/80 border-slate-200 dark:border-slate-700'
                            }`}
                          >
                            {/* Name */}
                            <div className="col-span-4">
                              <input
                                type="text"
                                value={entry.workerName}
                                onChange={(e) =>
                                  handleUpdateEntry(idx, 'workerName', e.target.value)
                                }
                                placeholder="Worker Name *"
                                className={`w-full px-2.5 py-1.5 rounded-lg font-bold bg-white dark:bg-slate-900 border text-xs dark:text-white ${
                                  isNameMissing
                                    ? 'border-red-400 dark:border-red-600 focus:border-red-500'
                                    : 'border-slate-200 dark:border-slate-700'
                                }`}
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
                                onChange={(e) =>
                                  handleUpdateEntry(idx, 'attendanceStatus', e.target.value)
                                }
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
                                value={entry.dailyWage === 0 ? '' : entry.dailyWage}
                                onChange={(e) =>
                                  handleUpdateEntry(idx, 'dailyWage', Number(e.target.value))
                                }
                                placeholder="₹ Wage *"
                                className={`w-full px-2 py-1.5 rounded-lg font-bold bg-white dark:bg-slate-900 border dark:text-white text-right text-xs ${
                                  isWageMissing
                                    ? 'border-amber-400 dark:border-amber-600 focus:border-amber-500'
                                    : 'border-slate-200 dark:border-slate-700'
                                }`}
                              />
                              {entry.attendanceStatus === 'absent' ? (
                                <span className="text-[9px] text-slate-400 block text-right mt-0.5">
                                  Absent (₹0)
                                </span>
                              ) : entry.dailyWage > 0 ? (
                                <span className="text-[9px] text-emerald-600 dark:text-emerald-400 font-semibold block text-right mt-0.5">
                                  ₹{entry.dailyWage}/day
                                </span>
                              ) : (
                                <span className="text-[9px] text-amber-600 dark:text-amber-400 font-bold block text-right mt-0.5">
                                  Wage required
                                </span>
                              )}
                            </div>

                            {/* Delete */}
                            <div className="col-span-1 text-right">
                              <button
                                type="button"
                                onClick={() => handleRemoveRow(idx)}
                                className="p-1 text-slate-400 hover:text-red-600 rounded-lg"
                                title="Remove row"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="p-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-end gap-2 bg-slate-50/50 dark:bg-slate-800/40">
          <button
            type="button"
            onClick={handleClose}
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
