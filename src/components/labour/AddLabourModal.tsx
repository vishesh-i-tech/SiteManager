import React, { useState, useEffect } from 'react';
import { useTheme } from '../../core/theme/ThemeContext';
import { Site, LabourRecord, LabourEntry } from '../../types';
import { db } from '../../core/db/database';
import {
  Building,
  Calendar,
  IndianRupee,
  X,
  Plus,
  Trash2,
  CheckCircle2,
  ClipboardList,
} from 'lucide-react';

interface AddLabourModalProps {
  isOpen: boolean;
  onClose: () => void;
  sites: Site[];
  defaultSiteId?: string;
  onLabourAdded: () => void;
}

const ROLES: { id: LabourEntry['role']; labelEn: string; labelHi: string; defaultWage: number }[] = [
  { id: 'Mason', labelEn: 'Mason', labelHi: 'Mason', defaultWage: 800 },
  { id: 'Helper', labelEn: 'Helper', labelHi: 'Helper', defaultWage: 550 },
  { id: 'Carpenter', labelEn: 'Carpenter', labelHi: 'Carpenter', defaultWage: 750 },
  { id: 'Electrician', labelEn: 'Electrician', labelHi: 'Electrician', defaultWage: 750 },
  { id: 'Plumber', labelEn: 'Plumber', labelHi: 'Plumber', defaultWage: 750 },
  { id: 'Plasterer', labelEn: 'Plasterer', labelHi: 'Plasterer', defaultWage: 800 },
  { id: 'Welder', labelEn: 'Welder', labelHi: 'Welder', defaultWage: 750 },
  { id: 'Painter', labelEn: 'Painter', labelHi: 'Painter', defaultWage: 700 },
  { id: 'Supervisor', labelEn: 'Supervisor', labelHi: 'Supervisor', defaultWage: 900 },
];

export const AddLabourModal: React.FC<AddLabourModalProps> = ({
  isOpen,
  onClose,
  sites,
  defaultSiteId,
  onLabourAdded,
}) => {
  const { t, language, tradeConfig } = useTheme();

  const [siteId, setSiteId] = useState(defaultSiteId || (sites[0]?.id || ''));
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Helper to fetch the most recent wage the user configured for a role (or 0 / blank if none)
  const getRecentWageForRole = (role: string, currentEntries?: LabourEntry[]): number => {
    if (currentEntries && currentEntries.length > 0) {
      const found = [...currentEntries].reverse().find((e) => e.role === role && Number(e.dailyWage) > 0);
      if (found && Number(found.dailyWage) > 0) {
        return Number(found.dailyWage);
      }
    }
    const saved = localStorage.getItem(`sitesaathi_recent_wage_${role}`);
    if (saved && Number(saved) > 0) {
      return Number(saved);
    }
    return 0; // Starts blank, no arbitrary 550 or 800
  };

  const createInitialEntry = (): LabourEntry => {
    const initialWage = getRecentWageForRole('Mason');
    return {
      id: `entry-${Date.now()}-1`,
      recordId: '',
      workerName: '',
      role: 'Mason',
      attendanceStatus: 'full_day',
      dailyWage: initialWage,
      paidAmount: initialWage,
      balanceDue: 0,
    };
  };

  // Form entries
  const [entries, setEntries] = useState<LabourEntry[]>([createInitialEntry()]);

  const resetForm = () => {
    setDate(new Date().toISOString().split('T')[0]);
    setNotes('');
    setEntries([createInitialEntry()]);
  };

  useEffect(() => {
    if (isOpen) {
      resetForm();
      if (defaultSiteId) {
        setSiteId(defaultSiteId);
      } else if (sites.length > 0 && !sites.some((s) => s.id === siteId)) {
        setSiteId(sites[0].id);
      }
    }
  }, [isOpen, defaultSiteId, sites]);

  const handleClose = () => {
    resetForm();
    onClose();
  };

  if (!isOpen) return null;

  const handleUpdateEntry = (index: number, field: keyof LabourEntry, val: any) => {
    const updated = [...entries];
    const current = { ...updated[index], [field]: val };

    if (field === 'role') {
      const recent = getRecentWageForRole(val, updated);
      if (!current.dailyWage || current.dailyWage === 0) {
        current.dailyWage = recent;
      }
    }

    if (field === 'dailyWage') {
      const numVal = Number(val) || 0;
      current.dailyWage = numVal;
      if (numVal > 0) {
        localStorage.setItem(`sitesaathi_recent_wage_${current.role}`, String(numVal));
      }
    }

    const base = Number(current.dailyWage) || 0;

    if (field === 'paymentStatus') {
      if (current.attendanceStatus === 'absent' && val !== 'unpaid') {
        current.attendanceStatus = 'full_day';
      }
    }

    let earnedWage = base;
    if (current.attendanceStatus === 'half_day') earnedWage = Math.round(base * 0.5);
    else if (current.attendanceStatus === 'absent') earnedWage = 0;
    else if (current.attendanceStatus === 'overtime') earnedWage = Math.round(base * 1.5);

    if (field === 'paymentStatus') {
      current.paymentStatus = val;
      if (val === 'paid') {
        current.paidAmount = earnedWage;
        current.balanceDue = 0;
      } else if (val === 'unpaid' || val === 'pending') {
        current.paidAmount = 0;
        current.balanceDue = earnedWage;
      } else if (val === 'advance') {
        if (!current.paidAmount || current.paidAmount >= earnedWage) {
          current.paidAmount = Math.round(earnedWage * 0.5);
        }
        current.balanceDue = Math.max(0, earnedWage - (current.paidAmount || 0));
      }
    } else if (field === 'paidAmount') {
      const paid = Math.max(0, Number(val) || 0);
      current.paidAmount = paid;
      current.balanceDue = Math.max(0, earnedWage - paid);
      if (paid === 0) current.paymentStatus = 'unpaid';
      else if (paid >= earnedWage && earnedWage > 0) current.paymentStatus = 'paid';
      else current.paymentStatus = 'advance';
    } else if (field === 'attendanceStatus' || field === 'dailyWage' || field === 'role') {
      if (current.attendanceStatus === 'absent') {
        current.paidAmount = 0;
        current.balanceDue = 0;
      } else if (current.paymentStatus === 'paid') {
        current.paidAmount = earnedWage;
        current.balanceDue = 0;
      } else if (current.paymentStatus === 'unpaid' || current.paymentStatus === 'pending') {
        current.paidAmount = 0;
        current.balanceDue = earnedWage;
      } else {
        current.balanceDue = Math.max(0, earnedWage - (current.paidAmount || 0));
      }
    }

    updated[index] = current;
    setEntries(updated);
  };

  const handleAddWorkerRow = (role?: LabourEntry['role']) => {
    const targetRole = role || (entries.length > 0 ? entries[entries.length - 1].role : 'Helper');
    const recentWage = getRecentWageForRole(targetRole, entries);
    setEntries((prev) => [
      ...prev,
      {
        id: `entry-${Date.now()}-${prev.length}`,
        recordId: '',
        workerName: '',
        role: targetRole,
        attendanceStatus: 'full_day',
        dailyWage: recentWage,
        paidAmount: recentWage,
        balanceDue: 0,
      },
    ]);
  };

  const handleRemoveRow = (index: number) => {
    if (entries.length <= 1) {
      setEntries([createInitialEntry()]);
      return;
    }
    setEntries(entries.filter((_, i) => i !== index));
  };

  const totalDailyWage = entries.reduce((acc, e) => {
    if (e.attendanceStatus === 'absent') return acc;
    if (e.attendanceStatus === 'half_day') return acc + Math.round((e.dailyWage || 0) * 0.5);
    if (e.attendanceStatus === 'overtime') return acc + Math.round((e.dailyWage || 0) * 1.5);
    return acc + (e.dailyWage || 0);
  }, 0);

  const totalPaid = entries.reduce((acc, e) => acc + (Number(e.paidAmount) || 0), 0);
  const totalPending = entries.reduce((acc, e) => {
    const base = Number(e.dailyWage) || 0;
    let earnedWage = base;
    if (e.attendanceStatus === 'half_day') earnedWage = Math.round(base * 0.5);
    else if (e.attendanceStatus === 'absent') earnedWage = 0;
    else if (e.attendanceStatus === 'overtime') earnedWage = Math.round(base * 1.5);
    const paid = Number(e.paidAmount) || 0;
    const due = e.balanceDue !== undefined ? e.balanceDue : Math.max(0, earnedWage - paid);
    return acc + due;
  }, 0);

  const activeWorkersCount = entries.filter((e) => e.workerName.trim().length > 0).length || entries.length;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!siteId) return;

    const finalizedEntries = entries.map((entry, idx) => ({
      ...entry,
      workerName: entry.workerName.trim() || `Worker #${idx + 1}`,
    }));

    if (finalizedEntries.length === 0) return;

    setIsSubmitting(true);
    try {
      const recordId = `lr-${Date.now()}`;
      const totalPaid = finalizedEntries.reduce((acc, e) => acc + (e.paidAmount || 0), 0);

      const labourRecord: LabourRecord = {
        id: recordId,
        siteId,
        date,
        totalWorkers: finalizedEntries.length,
        totalDailyWage,
        totalPaid,
        notes: notes.trim() || undefined,
        entries: finalizedEntries.map((entry) => ({
          ...entry,
          recordId,
        })),
      };

      await db.labourRecords.put(labourRecord);
      for (const entry of labourRecord.entries || []) {
        await db.labourEntries.put(entry);
      }

      resetForm();
      onLabourAdded();
      onClose();
    } catch (err) {
      console.error('Failed to save manual labour record', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-2 sm:p-4 overflow-y-auto">
      {/* Separate Backdrop Layer */}
      <div className="fixed inset-0 bg-slate-950/75 backdrop-blur-sm transition-opacity" onClick={handleClose} />

      {/* Interactive Sharp Dialog Container */}
      <div className="relative z-10 bg-white dark:bg-slate-900 w-full max-w-2xl rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col max-h-[92vh] animate-fade-in">
        
        {/* Header */}
        <div className="p-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-800/40">
          <div className="flex items-center gap-2.5">
            <div
              className="w-10 h-10 rounded-2xl flex items-center justify-center text-white shadow-md"
              style={{ backgroundColor: tradeConfig.primaryColor }}
            >
              <ClipboardList className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-extrabold text-base text-slate-900 dark:text-white font-heading">
                {language === 'hi' ? 'दैनिक हाजिरी व मजदूरी दर्ज करें' : 'Manual Attendance & Wage Entry'}
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {language === 'hi' ? 'मजदूरों के नाम, हाजिरी और दैनिक मजदूरी भरें' : 'Log daily muster roll without scanning a photo'}
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

        {/* Scrollable Form Body */}
        <form onSubmit={handleSubmit} className="p-5 overflow-y-auto flex-1 space-y-4">
          
          {/* Top Controls: Site & Date */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5 mb-1">
                <Building className="w-3.5 h-3.5 text-orange-500" />
                <span>{language === 'hi' ? 'साइट चुनें *' : 'Target Site *'}</span>
              </label>
              <select
                value={siteId}
                onChange={(e) => setSiteId(e.target.value)}
                required
                className="w-full px-3.5 py-2.5 rounded-xl text-xs font-semibold bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none"
              >
                {sites.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name} ({s.location})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5 mb-1">
                <Calendar className="w-3.5 h-3.5 text-blue-500" />
                <span>Date *</span>
              </label>
              <input
                type="date"
                required
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl text-xs font-semibold bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:outline-none dark:text-white"
              />
            </div>
          </div>

          {/* Quick 1-Tap Add Role Presets */}
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400">
              {language === 'hi' ? 'त्वरित जोड़ें:' : 'Quick Add:'}
            </span>
            <button
              type="button"
              onClick={() => handleAddWorkerRow('Mason')}
              className="px-2.5 py-1 rounded-lg text-[11px] font-bold bg-orange-50 dark:bg-orange-950/40 text-orange-700 dark:text-orange-300 border border-orange-200 dark:border-orange-800 hover:bg-orange-100 btn-tactile"
            >
              + Mason {getRecentWageForRole('Mason', entries) > 0 ? `(₹${getRecentWageForRole('Mason', entries)})` : ''}
            </button>
            <button
              type="button"
              onClick={() => handleAddWorkerRow('Helper')}
              className="px-2.5 py-1 rounded-lg text-[11px] font-bold bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800 hover:bg-blue-100 btn-tactile"
            >
              + Helper {getRecentWageForRole('Helper', entries) > 0 ? `(₹${getRecentWageForRole('Helper', entries)})` : ''}
            </button>
            <button
              type="button"
              onClick={() => handleAddWorkerRow('Carpenter')}
              className="px-2.5 py-1 rounded-lg text-[11px] font-bold bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 hover:bg-emerald-100 btn-tactile"
            >
              + Skilled {getRecentWageForRole('Carpenter', entries) > 0 ? `(₹${getRecentWageForRole('Carpenter', entries)})` : ''}
            </button>
          </div>

          {/* Worker Rows Table / Cards */}
          <div className="space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-extrabold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                {language === 'hi' ? `मजदूर सूची (${entries.length})` : `Worker Attendance Muster (${entries.length})`}
              </span>
              <button
                type="button"
                onClick={() => handleAddWorkerRow()}
                className="px-2.5 py-1 rounded-lg text-xs font-bold text-white shadow-sm flex items-center gap-1 btn-tactile"
                style={{ backgroundColor: tradeConfig.primaryColor }}
              >
                <Plus className="w-3.5 h-3.5" />
                <span>{language === 'hi' ? 'मजदूर जोड़ें' : 'Add Worker'}</span>
              </button>
            </div>

            <div className="space-y-2">
              {entries.map((entry, idx) => (
                <div
                  key={entry.id}
                  className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 space-y-2"
                >
                  <div className="grid grid-cols-12 gap-2 items-center">
                    
                    {/* Worker Name */}
                    <div className="col-span-12 sm:col-span-5">
                      <input
                        type="text"
                        placeholder={language === 'hi' ? `कारीगर / मजदूर #${idx + 1}` : `Worker Name #${idx + 1}`}
                        value={entry.workerName}
                        onChange={(e) => handleUpdateEntry(idx, 'workerName', e.target.value)}
                        className="w-full px-3 py-1.5 rounded-xl text-xs font-bold bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white placeholder:text-slate-400 focus:ring-2 focus:ring-orange-500 outline-none"
                      />
                    </div>

                    {/* Role / Trade Dropdown */}
                    <div className="col-span-6 sm:col-span-4">
                      <select
                        value={entry.role}
                        onChange={(e) => handleUpdateEntry(idx, 'role', e.target.value)}
                        className="w-full px-2.5 py-1.5 rounded-xl text-xs font-medium bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-orange-500 outline-none"
                      >
                        {ROLES.map((r) => (
                          <option key={r.id} value={r.id}>
                            {language === 'hi' ? r.labelHi : r.labelEn}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Daily Wage Rate */}
                    <div className="col-span-5 sm:col-span-2 relative">
                      <span className="absolute left-2.5 top-2 text-slate-400 text-xs font-bold">₹</span>
                      <input
                        type="number"
                        placeholder={language === 'hi' ? 'दैनिक मजदूरी' : 'Wage'}
                        value={entry.dailyWage ? entry.dailyWage : ''}
                        onChange={(e) => handleUpdateEntry(idx, 'dailyWage', e.target.value === '' ? 0 : Number(e.target.value))}
                        className="w-full pl-6 pr-2 py-1.5 rounded-xl text-xs font-bold bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-orange-500 outline-none text-right"
                      />
                    </div>

                    {/* Delete Row */}
                    <div className="col-span-1 flex justify-end">
                      <button
                        type="button"
                        onClick={() => handleRemoveRow(idx)}
                        className="p-1.5 text-slate-400 hover:text-red-600 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-700"
                        title="Remove row"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>

                  </div>

                  {/* Attendance Status Selector Pills */}
                  <div className="flex items-center justify-between gap-2 pt-1 border-t border-slate-200/60 dark:border-slate-700/60 text-[11px]">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="font-bold text-slate-500 dark:text-slate-400">
                        Status:
                      </span>
                      {[
                        { id: 'full_day', label: 'Full Day', color: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 border-emerald-300' },
                        { id: 'half_day', label: 'Half Day', color: 'bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300 border-amber-300' },
                        { id: 'overtime', label: 'Overtime', color: 'bg-purple-100 text-purple-800 dark:bg-purple-950/60 dark:text-purple-300 border-purple-300' },
                        { id: 'absent', label: 'Absent', color: 'bg-red-100 text-red-800 dark:bg-red-950/60 dark:text-red-300 border-red-300' },
                      ].map((statusOption) => (
                        <button
                          key={statusOption.id}
                          type="button"
                          onClick={() => handleUpdateEntry(idx, 'attendanceStatus', statusOption.id)}
                          className={`px-2 py-0.5 rounded-lg text-[10px] font-bold border transition-all ${
                            entry.attendanceStatus === statusOption.id
                              ? `${statusOption.color} shadow-xs scale-102`
                              : 'bg-white dark:bg-slate-900 text-slate-500 dark:text-slate-400 border-slate-200 dark:border-slate-700 hover:bg-slate-100'
                          }`}
                        >
                          {statusOption.label}
                        </button>
                      ))}
                    </div>

                    <div className="flex items-center gap-1 font-bold text-slate-700 dark:text-slate-300">
                      <span>Wages:</span>
                      <span className="font-black text-slate-900 dark:text-white">
                        ₹{entry.attendanceStatus === 'half_day' ? Math.round((entry.dailyWage || 0) * 0.5) : entry.attendanceStatus === 'absent' ? 0 : entry.attendanceStatus === 'overtime' ? Math.round((entry.dailyWage || 0) * 1.5) : (entry.dailyWage || 0)}
                      </span>
                    </div>
                  </div>

                  {/* Payment Status Selector Pills */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pt-1 border-t border-slate-200/60 dark:border-slate-700/60 text-[11px]">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="font-bold text-slate-500 dark:text-slate-400">
                        Payment:
                      </span>
                      {[
                        { id: 'paid', label: 'Paid', color: 'bg-emerald-600 text-white' },
                        { id: 'unpaid', label: 'Unpaid', color: 'bg-rose-600 text-white' },
                        { id: 'pending', label: 'Pending', color: 'bg-amber-600 text-white' },
                        { id: 'advance', label: 'Advance', color: 'bg-blue-600 text-white' },
                      ].map((payOption) => (
                        <button
                          key={payOption.id}
                          type="button"
                          onClick={() => handleUpdateEntry(idx, 'paymentStatus', payOption.id)}
                          className={`px-2.5 py-0.5 rounded-lg text-[10px] font-bold transition-all cursor-pointer ${
                            (entry.paymentStatus || 'paid') === payOption.id
                              ? `${payOption.color} shadow-xs font-black`
                              : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:bg-slate-100'
                          }`}
                        >
                          {payOption.label}
                        </button>
                      ))}
                    </div>

                    <div className="flex items-center gap-2">
                      {entry.paymentStatus === 'advance' && (
                        <div className="flex items-center gap-1 bg-white dark:bg-slate-900 px-1.5 py-0.5 rounded-md border border-blue-300 dark:border-blue-700">
                          <span className="text-[10px] font-bold text-slate-400">Adv: ₹</span>
                          <input
                            type="number"
                            value={entry.paidAmount || ''}
                            onChange={(e) => handleUpdateEntry(idx, 'paidAmount', Number(e.target.value))}
                            placeholder="0"
                            className="w-12 text-xs font-black text-blue-600 dark:text-blue-400 bg-transparent outline-none text-right"
                          />
                        </div>
                      )}

                      {entry.attendanceStatus === 'absent' ? (
                        <span className="px-2 py-0.5 rounded-md font-semibold text-[11px] bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300">
                          Absent: ₹0
                        </span>
                      ) : entry.paymentStatus === 'pending' ? (
                        <span className="px-2 py-0.5 rounded-md font-extrabold text-[11px] bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300">
                          Pending: ₹{entry.balanceDue !== undefined ? entry.balanceDue : (entry.attendanceStatus === 'half_day' ? Math.round((entry.dailyWage || 0) * 0.5) : entry.dailyWage || 0)}
                        </span>
                      ) : entry.paymentStatus === 'unpaid' ? (
                        <span className="px-2 py-0.5 rounded-md font-extrabold text-[11px] bg-rose-100 text-rose-800 dark:bg-rose-950/60 dark:text-rose-300">
                          Unpaid: ₹{entry.balanceDue !== undefined ? entry.balanceDue : (entry.attendanceStatus === 'half_day' ? Math.round((entry.dailyWage || 0) * 0.5) : entry.dailyWage || 0)}
                        </span>
                      ) : entry.paymentStatus === 'paid' ? (
                        <span className="px-2 py-0.5 rounded-md font-extrabold text-[11px] bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300">
                          Paid: ₹{entry.paidAmount !== undefined ? entry.paidAmount : (entry.attendanceStatus === 'half_day' ? Math.round((entry.dailyWage || 0) * 0.5) : entry.dailyWage || 0)}
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded-md font-extrabold text-[11px] bg-blue-100 text-blue-800 dark:bg-blue-950/60 dark:text-blue-300">
                          Due: ₹{entry.balanceDue !== undefined ? entry.balanceDue : 0}
                        </span>
                      )}
                    </div>
                  </div>

                </div>
              ))}
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
              {language === 'hi' ? 'टिप्पणी / विवरण' : 'Notes / Diary Remarks'}
            </label>
            <input
              type="text"
              placeholder={language === 'hi' ? 'ढलाई का काम चला, मौसम साफ था' : 'Roof slab casting day'}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full px-3 py-2 rounded-xl text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white placeholder:text-slate-400 focus:ring-2 focus:ring-orange-500 outline-none"
            />
          </div>

          {/* Real-time Summary Card */}
          <div className="p-3.5 rounded-2xl bg-gradient-to-br from-slate-900 to-slate-800 text-white flex items-center justify-between">
            <div>
              <span className="text-[11px] text-slate-300 block font-medium">
                {language === 'hi' ? 'कुल मजदूर व हाजिरी' : 'Total Muster Summary'}
              </span>
              <span className="text-xs font-bold text-orange-400 mt-0.5 block">
                {activeWorkersCount} {language === 'hi' ? 'श्रमिक' : 'Workers'} Logged
              </span>
            </div>
            <div className="text-right">
              <span className="text-[10px] text-slate-300 uppercase tracking-wider block font-bold">
                {language === 'hi' ? 'कुल दैनिक मजदूरी' : 'Total Daily Wages'}
              </span>
              <span className="text-base sm:text-lg font-black text-emerald-400 block">
                ₹{totalDailyWage.toLocaleString('en-IN')}
              </span>
            </div>
          </div>

          {/* Submit Actions */}
          <div className="pt-2 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={handleClose}
              className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              {t('cancel')}
            </button>
            <button
              type="submit"
              disabled={isSubmitting || !siteId}
              className="px-5 py-2 rounded-xl text-xs font-extrabold text-white shadow-md flex items-center gap-1.5 btn-tactile disabled:opacity-50"
              style={{ backgroundColor: tradeConfig.primaryColor }}
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>
                {isSubmitting
                  ? language === 'hi'
                    ? 'सहेज रहे हैं...'
                    : 'Saving...'
                  : language === 'hi'
                  ? 'हाजिरी रजिस्टर सेव करें'
                  : 'Save Attendance Sheet'}
              </span>
            </button>
          </div>

        </form>

      </div>
    </div>
  );
};
