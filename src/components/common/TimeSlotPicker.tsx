import React from 'react';
import { Clock } from 'lucide-react';

interface TimeSlotPickerProps {
  selectedSlot: string;
  onSlotChange: (slot: string) => void;
  title?: string;
  slots?: string[];
}

export const DEFAULT_TIME_SLOTS = [
  '08:00 AM',
  '09:00 AM',
  '10:00 AM',
  '11:00 AM',
  '12:00 PM',
  '01:00 PM',
  '02:00 PM',
  '05:00 PM',
];

export const TimeSlotPicker: React.FC<TimeSlotPickerProps> = ({
  selectedSlot,
  onSlotChange,
  title = 'Select Time',
  slots = DEFAULT_TIME_SLOTS,
}) => {
  return (
    <div className="space-y-2 select-none">
      
      {/* Title */}
      <div className="flex items-center justify-between px-0.5">
        <h4 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white font-heading tracking-tight flex items-center gap-1.5">
          <Clock className="w-3.5 h-3.5 text-slate-400" />
          <span>{title}</span>
        </h4>
        <span className="text-[10px] font-bold text-[#FF5A26] bg-[#FFE5D8] px-2 py-0.5 rounded-full">
          {selectedSlot}
        </span>
      </div>

      {/* Grid of Time Pills */}
      <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
        {slots.map((slot) => {
          const isSelected = slot === selectedSlot;
          return (
            <button
              type="button"
              key={slot}
              onClick={() => onSlotChange(slot)}
              className={`py-2 px-2 rounded-xl text-xs font-bold text-center transition-all cursor-pointer active:scale-95 ${
                isSelected
                  ? 'bg-[#FFE5D8] border border-[#FFC4B0] text-[#E64A19] shadow-[0_4px_12px_rgba(255,106,61,0.2)]'
                  : 'bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800/80 hover:border-slate-200'
              }`}
            >
              {slot}
            </button>
          );
        })}
      </div>

    </div>
  );
};
