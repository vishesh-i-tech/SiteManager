import React, { useState, useEffect } from 'react';
import { useTheme } from '../../core/theme/ThemeContext';
import { Site, LabourRecord, LabourEntry } from '../../types';
import { db } from '../../core/db/database';
import {
  Users,
  Building,
  Calendar,
  IndianRupee,
  X,
  CheckCircle2,
  Plus,
  Trash2,
  Check,
  Clock,
  Coins,
  AlertCircle,
} from 'lucide-react';

interface EditLabourModalProps {
  record: LabourRecord | null;
  isOpen: boolean;
  onClose: () => void;
  sites: Site[];
  onLabourUpdated: () => void;
}

export const EditLabourModal: React.FC<EditLabourModalProps> = ({
  record,
  isOpen,
  onClose,
  sites,
  onLabourUpdated,
}) => {
  const { t, language, tradeConfig } = useTheme();

  const [siteId, setSiteId] = useState('');
  const [date, setDate] = useState('');
  const [entries, setEntries] = useState<LabourEntry[]>([]);
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (record) {
      setSiteId(record.siteId);
      setDate(record.date);
      setNotes(record.notes || '');

      // Load entries from DB or record and normalize payment status
      db.labourEntries.where('recordId').equals(record.id).toArray().then((dbEntries) => {
        const loaded = dbEntries.length > 0 ? dbEntries : (record.entries || []);
        const normalized = loaded.map((e) => {
          const base = e.dailyWage || 0;
          let earned = base;
          if (e.attendanceStatus === 'half_day') earned = Math.round(base * 0.5);
          else if (e.attendanceStatus === 'absent') earned = 0;
          else if (e.attendanceStatus === 'overtime') earned = Math.round(base * 1.5);

          let status = e.paymentStatus;
          const paid = e.paidAmount !== undefined ? e.paidAmount : earned;
          if (!status) {
            if (paid === 0) status = 'unpaid';
            else if (paid >= earned && earned > 0) status = 'paid';
            else status = 'advance';
          }

          return {
            ...e,
            paidAmount: paid,
            balanceDue: e.balanceDue !== undefined ? e.balanceDue : Math.max(0, earned - paid),
            paymentStatus: status,
          };
        });
        setEntries(normalized);
      });
    }
  }, [record]);

  if (!isOpen || !record) return null;

  const handleUpdateEntry = (index: number, field: keyof LabourEntry, val: any) => {
    const updated = [...entries];
    const current = { ...updated[index], [field]: val };

    // Calculate shift earnings
    const base = Number(current.dailyWage) || 0;
    let earnedWage = base;
    if (current.attendanceStatus === 'half_day') earnedWage = Math.round(base * 0.5);
    else if (current.attendanceStatus === 'absent') earnedWage = 0;
    else if (current.attendanceStatus === 'overtime') earnedWage = Math.round(base * 1.5);

    if (field === 'paymentStatus') {
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
    } else if (field === 'dailyWage' || field === 'attendanceStatus') {
      if (current.paymentStatus === 'paid') {
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

  const handleAddWorkerRow = () => {
    setEntries([
      ...entries,
      {
        id: `entry-${Date.now()}-${entries.length}`,
        recordId: record.id,
        workerName: '',
        role: 'Helper',
        attendanceStatus: 'full_day',
        dailyWage: 550,
        paidAmount: 550,
        balanceDue: 0,
        paymentStatus: 'paid',
      },
    ]);
  };

  const handleRemoveRow = (index: number) => {
    setEntries(entries.filter((_, i) => i !== index));
  };

  const totalWages = entries.reduce((acc, e) => {
    const base = Number(e.dailyWage) || 0;
    if (e.attendanceStatus === 'absent') return acc;
    if (e.attendanceStatus === 'half_day') return acc + Math.round(base * 0.5);
    if (e.attendanceStatus === 'overtime') return acc + Math.round(base * 1.5);
    return acc + base;
  }, 0);
  const totalPaid = entries.reduce((acc, e) => acc + (Number(e.paidAmount) || 0), 0);
  const totalBalanceDue = Math.max(0, totalWages - totalPaid);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!siteId || entries.length === 0) return;

    setIsSubmitting(true);
    try {
      await db.labourRecords.update(record.id, {
        siteId,
        date,
        totalWorkers: entries.length,
        totalDailyWage: totalWages,
        totalPaid,
        notes: notes.trim() || undefined,
      });

      // Clear existing entries and re-insert updated ones
      await db.labourEntries.where('recordId').equals(record.id).delete();
      for (const entry of entries) {
        await db.labourEntries.put({
          ...entry,
          recordId: record.id,
        });
      }

      onLabourUpdated();
      onClose();
    } catch (err) {
      console.error('Failed to update labour sheet', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-2 sm:p-4 overflow-y-auto">
      {/* Separate Backdrop Layer */}
      <div className="fixed inset-0 bg-slate-950/75 backdrop-blur-sm transition-opacity" onClick={onClose} />

      {/* Interactive Sharp Dialog Container */}
      <div className="relative z-10 bg-white dark:bg-slate-900 w-full max-w-2xl rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col max-h-[92vh] animate-fade-in">
        
        {/* Header */}
        <div className="p-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-800/40">
          <div className="flex items-center gap-2.5">
            <div
              className="w-10 h-10 rounded-2xl flex items-center justify-center text-white shadow-md"
              style={{ backgroundColor: tradeConfig.primaryColor }}
            >
              <Users className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-extrabold text-base text-slate-900 dark:text-white font-heading">
                Edit Labour Attendance Sheet
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Date: {date}
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

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4 overflow-y-auto flex-1">
          
          {/* Site selection & Date */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1 flex items-center gap-1.5">
                <Building className="w-3.5 h-3.5 text-orange-500" />
                <span>Target Site *</span>
              </label>
              <select
                required
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

          {/* Workers List Section */}
          <div className="space-y-2 pt-1">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-1">
              <div className="flex items-center gap-2.5 flex-wrap text-xs">
                <span className="font-extrabold text-slate-700 dark:text-slate-300">
                  {entries.length} Workers
                </span>
                <span className="text-slate-400">•</span>
                <span className="font-black text-slate-900 dark:text-white">
                  Wages: ₹{totalWages.toLocaleString('en-IN')}
                </span>
                <span className="text-slate-400">•</span>
                <span className="font-bold text-emerald-600 dark:text-emerald-400">
                  Paid/Adv: ₹{totalPaid.toLocaleString('en-IN')}
                </span>
                {totalBalanceDue > 0 && (
                  <>
                    <span className="text-slate-400">•</span>
                    <span className="font-bold text-rose-600 dark:text-rose-400">
                      Pending: ₹{totalBalanceDue.toLocaleString('en-IN')}
                    </span>
                  </>
                )}
              </div>

              <button
                type="button"
                onClick={handleAddWorkerRow}
                className="px-2.5 py-1 rounded-lg text-xs font-bold text-orange-600 dark:text-orange-400 bg-orange-50 dark:bg-orange-950/40 border border-orange-200 dark:border-orange-800 flex items-center gap-1 hover:bg-orange-100 self-start sm:self-auto cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Worker</span>
              </button>
            </div>

            {/* Workers Rows */}
            <div className="space-y-3 max-h-[52vh] overflow-y-auto pr-1">
              {entries.map((entry, idx) => {
                const base = Number(entry.dailyWage) || 0;
                let earnedWage = base;
                if (entry.attendanceStatus === 'half_day') earnedWage = Math.round(base * 0.5);
                else if (entry.attendanceStatus === 'absent') earnedWage = 0;
                else if (entry.attendanceStatus === 'overtime') earnedWage = Math.round(base * 1.5);

                const currentStatus = entry.paymentStatus || (entry.paidAmount === 0 ? 'unpaid' : entry.paidAmount >= earnedWage ? 'paid' : 'advance');
                const remainingDue = Math.max(0, earnedWage - (entry.paidAmount || 0));

                return (
                  <div
                    key={entry.id || idx}
                    className="p-3 sm:p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 space-y-2.5 shadow-2xs hover:border-slate-300 dark:hover:border-slate-600 transition-colors"
                  >
                    {/* Top Row: Worker Name, Trade Role, Attendance, Wage, Delete */}
                    <div className="grid grid-cols-12 gap-2 items-center text-xs">
                      {/* Worker Name */}
                      <div className="col-span-12 sm:col-span-4">
                        <input
                          type="text"
                          value={entry.workerName}
                          onChange={(e) => handleUpdateEntry(idx, 'workerName', e.target.value)}
                          placeholder="Worker Name"
                          className="w-full px-2.5 py-1.5 rounded-xl font-bold bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 dark:text-white"
                        />
                      </div>

                      {/* Role Dropdown */}
                      <div className="col-span-4 sm:col-span-3">
                        <select
                          value={entry.role}
                          onChange={(e) => handleUpdateEntry(idx, 'role', e.target.value)}
                          className="w-full px-2 py-1.5 rounded-xl font-semibold bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 dark:text-white text-[11px]"
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

                      {/* Attendance Status Dropdown */}
                      <div className="col-span-4 sm:col-span-2">
                        <select
                          value={entry.attendanceStatus}
                          onChange={(e) => handleUpdateEntry(idx, 'attendanceStatus', e.target.value)}
                          className={`w-full px-1.5 py-1.5 rounded-xl font-bold border text-[11px] ${
                            entry.attendanceStatus === 'absent'
                              ? 'bg-rose-50 text-rose-700 border-rose-300 dark:bg-rose-950/60 dark:text-rose-300'
                              : entry.attendanceStatus === 'half_day'
                              ? 'bg-amber-50 text-amber-700 border-amber-300 dark:bg-amber-950/60 dark:text-amber-300'
                              : entry.attendanceStatus === 'overtime'
                              ? 'bg-purple-50 text-purple-700 border-purple-300 dark:bg-purple-950/60 dark:text-purple-300'
                              : 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white border-slate-200 dark:border-slate-700'
                          }`}
                        >
                          <option value="full_day">Full (P)</option>
                          <option value="half_day">Half (H)</option>
                          <option value="overtime">OT (1.5x)</option>
                          <option value="absent">Absent (A)</option>
                        </select>
                      </div>

                      {/* Daily Wage Rate */}
                      <div className="col-span-3 sm:col-span-2 relative">
                        <input
                          type="number"
                          value={entry.dailyWage || ''}
                          onChange={(e) => handleUpdateEntry(idx, 'dailyWage', Number(e.target.value))}
                          placeholder="Rate"
                          className="w-full px-2 py-1.5 rounded-xl font-black bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 dark:text-white text-right"
                        />
                      </div>

                      {/* Delete Action */}
                      <div className="col-span-1 text-right flex justify-end">
                        <button
                          type="button"
                          onClick={() => handleRemoveRow(idx)}
                          className="p-1.5 text-slate-400 hover:text-red-600 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors cursor-pointer"
                          title="Remove worker"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    {/* Bottom Row: Payment Status Selector (Paid / Unpaid / Pending / Advance) */}
                    <div className="pt-2 border-t border-slate-200/60 dark:border-slate-700/60 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 text-xs">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mr-0.5">
                          Payment:
                        </span>

                        {/* Paid Button */}
                        <button
                          type="button"
                          onClick={() => handleUpdateEntry(idx, 'paymentStatus', 'paid')}
                          className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all flex items-center gap-1 cursor-pointer ${
                            currentStatus === 'paid'
                              ? 'bg-emerald-600 text-white shadow-xs font-black'
                              : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:bg-slate-100'
                          }`}
                        >
                          <Check className="w-3 h-3 stroke-[2.5]" />
                          <span>Paid</span>
                        </button>

                        {/* Unpaid Button */}
                        <button
                          type="button"
                          onClick={() => handleUpdateEntry(idx, 'paymentStatus', 'unpaid')}
                          className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all flex items-center gap-1 cursor-pointer ${
                            currentStatus === 'unpaid'
                              ? 'bg-rose-600 text-white shadow-xs font-black'
                              : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:bg-slate-100'
                          }`}
                        >
                          <X className="w-3 h-3 stroke-[2.5]" />
                          <span>Unpaid</span>
                        </button>

                        {/* Pending Button */}
                        <button
                          type="button"
                          onClick={() => handleUpdateEntry(idx, 'paymentStatus', 'pending')}
                          className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all flex items-center gap-1 cursor-pointer ${
                            currentStatus === 'pending'
                              ? 'bg-amber-600 text-white shadow-xs font-black'
                              : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:bg-slate-100'
                          }`}
                        >
                          <Clock className="w-3 h-3 stroke-[2.5]" />
                          <span>Pending</span>
                        </button>

                        {/* Advance Button */}
                        <button
                          type="button"
                          onClick={() => handleUpdateEntry(idx, 'paymentStatus', 'advance')}
                          className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all flex items-center gap-1 cursor-pointer ${
                            currentStatus === 'advance'
                              ? 'bg-blue-600 text-white shadow-xs font-black'
                              : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:bg-slate-100'
                          }`}
                        >
                          <Coins className="w-3 h-3 stroke-[2.5]" />
                          <span>Advance</span>
                        </button>
                      </div>

                      {/* Advance Amount Input & Remaining Due Indicator */}
                      <div className="flex items-center gap-2 w-full sm:w-auto justify-between sm:justify-end">
                        {currentStatus === 'advance' && (
                          <div className="flex items-center gap-1 bg-white dark:bg-slate-900 px-2 py-0.5 rounded-lg border border-blue-300 dark:border-blue-700">
                            <span className="text-[10px] font-bold text-slate-400">
                              Adv: ₹
                            </span>
                            <input
                              type="number"
                              value={entry.paidAmount || ''}
                              onChange={(e) => handleUpdateEntry(idx, 'paidAmount', Number(e.target.value))}
                              placeholder="0"
                              className="w-14 text-xs font-black text-blue-600 dark:text-blue-400 bg-transparent outline-none text-right"
                            />
                          </div>
                        )}

                        <div className="flex items-center gap-1 text-[11px]">
                          <span className="text-slate-400 font-semibold">
                            Due:
                          </span>
                          <span className={`font-black ${remainingDue > 0 ? 'text-rose-600 dark:text-rose-400' : 'text-emerald-600 dark:text-emerald-400'}`}>
                            ₹{remainingDue.toLocaleString('en-IN')}
                          </span>
                        </div>
                      </div>
                    </div>

                  </div>
                );
              })}
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
              Daily Log Notes
            </label>
            <input
              type="text"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl text-xs font-semibold bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:outline-none dark:text-white"
            />
          </div>

          {/* Footer Actions */}
          <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              {t('cancel')}
            </button>
            <button
              type="submit"
              disabled={isSubmitting || entries.length === 0}
              className="px-5 py-2.5 rounded-xl text-xs font-extrabold text-white shadow-md flex items-center gap-2 transition-all btn-tactile glow-theme"
              style={{ backgroundColor: tradeConfig.primaryColor }}
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>{isSubmitting ? 'Saving...' : t('save')}</span>
            </button>
          </div>
        </form>

      </div>
    </div>
  );
};
