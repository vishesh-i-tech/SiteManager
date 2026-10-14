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

      // Load entries from DB or record
      db.labourEntries.where('recordId').equals(record.id).toArray().then((dbEntries) => {
        if (dbEntries.length > 0) {
          setEntries(dbEntries);
        } else if (record.entries) {
          setEntries(record.entries);
        } else {
          setEntries([]);
        }
      });
    }
  }, [record]);

  if (!isOpen || !record) return null;

  const handleUpdateEntry = (index: number, field: keyof LabourEntry, val: any) => {
    const updated = [...entries];
    updated[index] = { ...updated[index], [field]: val };
    
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
        recordId: record.id,
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

  const totalWages = entries.reduce((acc, e) => acc + (e.dailyWage || 0), 0);
  const totalPaid = entries.reduce((acc, e) => acc + (e.paidAmount || 0), 0);

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
                {language === 'hi' ? 'हाजिरी शीट बदलें (Edit Labour Sheet)' : 'Edit Labour Attendance Sheet'}
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
                <span>{language === 'hi' ? 'साइट *' : 'Target Site *'}</span>
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
                <span>{language === 'hi' ? 'तारीख *' : 'Date *'}</span>
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
            <div className="flex items-center justify-between">
              <span className="text-xs font-extrabold uppercase tracking-wider text-slate-500">
                {entries.length} Workers • Total Wages: ₹{totalWages.toLocaleString('en-IN')}
              </span>

              <button
                type="button"
                onClick={handleAddWorkerRow}
                className="px-2.5 py-1 rounded-lg text-xs font-bold text-orange-600 dark:text-orange-400 bg-orange-50 dark:bg-orange-950/40 border border-orange-200 dark:border-orange-800 flex items-center gap-1 hover:bg-orange-100"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>{t('addWorker')}</span>
              </button>
            </div>

            {/* Workers Rows */}
            <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
              {entries.map((entry, idx) => (
                <div
                  key={entry.id || idx}
                  className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 grid grid-cols-12 gap-2 items-center text-xs"
                >
                  <div className="col-span-4">
                    <input
                      type="text"
                      value={entry.workerName}
                      onChange={(e) => handleUpdateEntry(idx, 'workerName', e.target.value)}
                      placeholder="Worker Name"
                      className="w-full px-2.5 py-1.5 rounded-lg font-bold bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 dark:text-white"
                    />
                  </div>

                  <div className="col-span-3">
                    <select
                      value={entry.role}
                      onChange={(e) => handleUpdateEntry(idx, 'role', e.target.value)}
                      className="w-full px-2 py-1.5 rounded-lg font-semibold bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 dark:text-white text-[11px]"
                    >
                      <option value="Mason">Mason (मिस्त्री)</option>
                      <option value="Helper">Helper (मजदूर)</option>
                      <option value="Electrician">Electrician</option>
                      <option value="Plumber">Plumber</option>
                      <option value="Carpenter">Carpenter</option>
                      <option value="Painter">Painter</option>
                      <option value="Supervisor">Supervisor</option>
                    </select>
                  </div>

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

                  <div className="col-span-2">
                    <input
                      type="number"
                      value={entry.dailyWage}
                      onChange={(e) => handleUpdateEntry(idx, 'dailyWage', Number(e.target.value))}
                      className="w-full px-2 py-1.5 rounded-lg font-bold bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 dark:text-white text-right"
                    />
                  </div>

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

          {/* Notes */}
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
              {language === 'hi' ? 'दैनिक टिप्पणी' : 'Daily Log Notes'}
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
