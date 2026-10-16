import React, { useState } from 'react';
import confetti from 'canvas-confetti';
import { X, Calendar, CheckCircle2, Building2, UserCheck, IndianRupee } from 'lucide-react';
import { WorkerProfile } from '../../data/workersDirectory';
import { Site } from '../../types';
import { db } from '../../core/db/database';

interface AssignWorkerModalProps {
  worker: WorkerProfile | null;
  sites: Site[];
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (message: string) => void;
}

export const AssignWorkerModal: React.FC<AssignWorkerModalProps> = ({
  worker,
  sites,
  isOpen,
  onClose,
  onSuccess,
}) => {
  const [selectedSiteId, setSelectedSiteId] = useState<string>(sites[0]?.id || '');
  const [attendanceType, setAttendanceType] = useState<'full_day' | 'half_day' | 'overtime'>('full_day');
  const [wage, setWage] = useState<number>(worker?.rate || 950);
  const [paidNow, setPaidNow] = useState<number>(0);
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen || !worker) return null;

  const handleConfirmAssignment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSiteId) return;

    setIsSubmitting(true);
    try {
      const todayDate = new Date().toISOString().split('T')[0];
      
      // Find or create daily labour record for the selected site
      const existingRecords = await db.labourRecords
        .where('siteId')
        .equals(selectedSiteId)
        .toArray();

      let record = existingRecords.find((r) => r.date === todayDate);

      const newEntryId = `le-${Date.now()}`;
      const recordId = record ? record.id : `lr-${Date.now()}`;

      const newEntry = {
        id: newEntryId,
        recordId: recordId,
        workerName: worker.name,
        role: (worker.role === 'Cleaner' ? 'Helper' : worker.role) as any,
        attendanceStatus: attendanceType,
        dailyWage: wage,
        paidAmount: paidNow,
        balanceDue: Math.max(0, wage - paidNow),
      };

      await db.labourEntries.put(newEntry);

      if (record) {
        await db.labourRecords.update(record.id, {
          totalWorkers: (record.totalWorkers || 0) + 1,
          totalDailyWage: (record.totalDailyWage || 0) + wage,
          totalPaid: (record.totalPaid || 0) + paidNow,
        });
      } else {
        await db.labourRecords.put({
          id: recordId,
          siteId: selectedSiteId,
          date: todayDate,
          totalWorkers: 1,
          totalDailyWage: wage,
          totalPaid: paidNow,
          notes: `Booked & assigned ${worker.name} (${worker.role})`,
        });
      }

      // Trigger Confetti effect
      confetti({
        particleCount: 80,
        spread: 60,
        origin: { y: 0.7 },
      });

      onSuccess(`Successfully booked ${worker.name} for site!`);
      onClose();
    } catch (err) {
      console.error('Error assigning worker:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs animate-fade-in">
      <div className="w-full max-w-sm bg-white dark:bg-slate-900 rounded-[28px] overflow-hidden shadow-2xl border border-slate-100 dark:border-slate-800 p-5 space-y-4">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center">
              <Calendar className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white font-heading">
                Book & Assign to Site
              </h3>
              <p className="text-[11px] text-slate-500">
                {worker.name} • {worker.role}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-full text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleConfirmAssignment} className="space-y-3.5">
          
          {/* Site Selector */}
          <div>
            <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
              Select Project Site
            </label>
            <select
              value={selectedSiteId}
              onChange={(e) => setSelectedSiteId(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            >
              {sites.map((site) => (
                <option key={site.id} value={site.id}>
                  {site.name} ({site.location})
                </option>
              ))}
            </select>
          </div>

          {/* Shift / Attendance Type */}
          <div>
            <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
              Shift / Booking Type
            </label>
            <div className="grid grid-cols-3 gap-1.5">
              {[
                { id: 'full_day', label: 'Full Day' },
                { id: 'half_day', label: 'Half Day' },
                { id: 'overtime', label: 'Overtime' },
              ].map((opt) => (
                <button
                  type="button"
                  key={opt.id}
                  onClick={() => setAttendanceType(opt.id as any)}
                  className={`py-1.5 px-2 rounded-xl text-xs font-bold transition-all ${
                    attendanceType === opt.id
                      ? 'bg-blue-600 text-white shadow-xs'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300'
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          {/* Wage / Rate */}
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                Agreed Wage (₹)
              </label>
              <input
                type="number"
                value={wage}
                onChange={(e) => setWage(Number(e.target.value))}
                className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-900 dark:text-white"
                required
              />
            </div>
            <div>
              <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                Advance Paid (₹)
              </label>
              <input
                type="number"
                value={paidNow}
                onChange={(e) => setPaidNow(Number(e.target.value))}
                className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-900 dark:text-white"
              />
            </div>
          </div>

          {/* Submit CTA */}
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-3 rounded-xl bg-gradient-to-r from-[#1877F2] to-[#0084FF] hover:from-[#1565D8] hover:to-[#0072DC] text-white font-bold text-xs shadow-md active:scale-95 transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            <UserCheck className="w-4 h-4" />
            <span>{isSubmitting ? 'Booking...' : 'Confirm Booking & Assignment'}</span>
          </button>
        </form>

      </div>
    </div>
  );
};
