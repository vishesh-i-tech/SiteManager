import React, { useState } from 'react';
import confetti from 'canvas-confetti';
import { X, Calendar, Building2, UserCheck, Phone, Clock, Plus, Minus } from 'lucide-react';
import { WorkerProfile } from '../../data/workersDirectory';
import { Site } from '../../types';
import { db } from '../../core/db/database';
import { HorizontalDatePicker } from '../common/HorizontalDatePicker';
import { TimeSlotPicker } from '../common/TimeSlotPicker';

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
  const [bookingDate, setBookingDate] = useState<string>(() => new Date().toISOString().split('T')[0]);
  const [bookingTime, setBookingTime] = useState<string>('10:00 AM');
  const [workerCount, setWorkerCount] = useState<number>(1);
  const [contactNumber, setContactNumber] = useState<string>(worker?.phone || '');
  const [wage, setWage] = useState<number>(worker?.rate || 950);
  const [paidNow, setPaidNow] = useState<number>(0);
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen || !worker) return null;

  const handleConfirmAssignment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSiteId) return;

    setIsSubmitting(true);
    try {
      // Find or create daily labour record for the selected site on this specific date
      const existingRecords = await db.labourRecords
        .where('siteId')
        .equals(selectedSiteId)
        .toArray();

      let record = existingRecords.find((r) => r.date === bookingDate);

      const recordId = record ? record.id : `lr-${Date.now()}`;
      const totalCost = wage * workerCount;

      for (let i = 0; i < workerCount; i++) {
        const entryWorkerName = workerCount === 1 ? worker.name : `${worker.name} (Crew #${i + 1})`;
        const newEntry = {
          id: `le-${Date.now()}-${i}`,
          recordId: recordId,
          workerName: entryWorkerName,
          role: (worker.role === 'Cleaner' ? 'Helper' : worker.role) as any,
          attendanceStatus: 'full_day' as const,
          dailyWage: wage,
          paidAmount: i === 0 ? paidNow : 0,
          balanceDue: Math.max(0, wage - (i === 0 ? paidNow : 0)),
        };
        await db.labourEntries.put(newEntry);
      }

      if (record) {
        await db.labourRecords.update(record.id, {
          totalWorkers: (record.totalWorkers || 0) + workerCount,
          totalDailyWage: (record.totalDailyWage || 0) + totalCost,
          totalPaid: (record.totalPaid || 0) + paidNow,
        });
      } else {
        await db.labourRecords.put({
          id: recordId,
          siteId: selectedSiteId,
          date: bookingDate,
          totalWorkers: workerCount,
          totalDailyWage: totalCost,
          totalPaid: paidNow,
          notes: `Booked ${worker.name} (${workerCount} worker${workerCount > 1 ? 's' : ''}) for ${bookingTime} shift. Contact: ${contactNumber}`,
        });
      }

      // Confetti celebratory burst
      confetti({
        particleCount: 90,
        spread: 65,
        origin: { y: 0.7 },
      });

      onSuccess(`Booked ${worker.name} for ${bookingDate} (${bookingTime})!`);
      onClose();
    } catch (err) {
      console.error('Error assigning worker:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/70 backdrop-blur-xs animate-fade-in">
      <div className="w-full max-w-sm sm:max-w-md bg-white dark:bg-slate-900 rounded-[32px] overflow-hidden shadow-2xl border border-slate-100 dark:border-slate-800 p-5 space-y-4 max-h-[92vh] overflow-y-auto custom-scrollbar">
        
        {/* Header with Close */}
        <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white flex items-center justify-center shadow-xs">
              <Calendar className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm sm:text-base font-extrabold text-slate-900 dark:text-white font-heading tracking-tight leading-tight">
                {worker.name}
              </h3>
              <p className="text-[11px] text-slate-500">
                ₹{worker.rate} {worker.rateUnit} • {worker.role}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-500 flex items-center justify-center transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleConfirmAssignment} className="space-y-4">
          
          {/* 1. Project Site Selector */}
          <div>
            <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
              Select Construction Site
            </label>
            <select
              value={selectedSiteId}
              onChange={(e) => setSelectedSiteId(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            >
              {sites.map((site) => (
                <option key={site.id} value={site.id}>
                  {site.name} ({site.location})
                </option>
              ))}
            </select>
          </div>

          {/* 2. Number of Workers Selector (Matching Screen 3 "Number of Room" UI) */}
          <div className="space-y-1.5">
            <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300">
              Number of Workers / Crew
            </label>
            <div className="flex items-center gap-2">
              {[1, 2, 3].map((num) => {
                const isSelected = workerCount === num;
                return (
                  <button
                    type="button"
                    key={num}
                    onClick={() => setWorkerCount(num)}
                    className={`w-12 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-[#FFE5D8] border border-[#FFC4B0] text-[#E64A19] shadow-xs'
                        : 'bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300'
                    }`}
                  >
                    0{num}
                  </button>
                );
              })}
              <button
                type="button"
                onClick={() => setWorkerCount((prev) => Math.min(10, prev + 1))}
                className="w-10 py-2 rounded-xl text-xs font-bold bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-50 flex items-center justify-center cursor-pointer"
                title="Add more workers"
              >
                <Plus className="w-3.5 h-3.5" />
              </button>
              {workerCount > 3 && (
                <span className="text-xs font-bold text-blue-600 px-2 py-1 bg-blue-50 rounded-lg">
                  {workerCount} workers
                </span>
              )}
            </div>
          </div>

          {/* 3. Horizontal Date Picker ("Select Date" - Exact Match to Reference Screen 3) */}
          <HorizontalDatePicker
            title="Select Date"
            selectedDate={bookingDate}
            onDateChange={setBookingDate}
          />

          {/* 4. Time Slot Picker ("Select Time" - Exact Match to Reference Screen 3) */}
          <TimeSlotPicker
            title="Select Time"
            selectedSlot={bookingTime}
            onSlotChange={setBookingTime}
          />

          {/* 5. Contact Phone & Wage Input (Matching bottom input in Screen 3) */}
          <div className="grid grid-cols-2 gap-2 pt-1">
            <div>
              <label className="block text-[10px] font-bold text-slate-500 mb-1">
                Wage per Worker (₹)
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
              <label className="block text-[10px] font-bold text-slate-500 mb-1">
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

          {/* Phone Number Input Row */}
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
              <Phone className="w-3.5 h-3.5" />
            </div>
            <input
              type="tel"
              value={contactNumber}
              onChange={(e) => setContactNumber(e.target.value)}
              placeholder="Enter your phone number"
              className="w-full pl-9 pr-3 py-2.5 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* 6. Action Button: "Confirm" (Matching dark pill button in Screen 3) */}
          <div className="pt-2">
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3.5 rounded-2xl bg-[#0F172A] hover:bg-[#1E293B] text-white font-extrabold text-xs shadow-lg active:scale-97 transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <UserCheck className="w-4 h-4 text-emerald-400" />
              <span>{isSubmitting ? 'Confirming...' : 'Confirm'}</span>
            </button>
          </div>

        </form>

      </div>
    </div>
  );
};
