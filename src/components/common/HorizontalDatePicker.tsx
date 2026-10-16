import React, { useRef, useEffect } from 'react';
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight } from 'lucide-react';

interface HorizontalDatePickerProps {
  selectedDate: string; // YYYY-MM-DD
  onDateChange: (dateStr: string) => void;
  daysRange?: { past: number; future: number };
  title?: string;
  showCalendarToggle?: boolean;
}

export const HorizontalDatePicker: React.FC<HorizontalDatePickerProps> = ({
  selectedDate,
  onDateChange,
  daysRange = { past: 3, future: 14 },
  title = 'Select Date',
  showCalendarToggle = true,
}) => {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const hiddenInputRef = useRef<HTMLInputElement>(null);

  // Generate list of date objects
  const dates = React.useMemo(() => {
    const list: { dateStr: string; month: string; day: string; dayName: string; isToday: boolean }[] = [];
    const today = new Date();
    
    for (let i = -daysRange.past; i <= daysRange.future; i++) {
      const d = new Date();
      d.setDate(today.getDate() + i);

      const year = d.getFullYear();
      const monthNum = String(d.getMonth() + 1).padStart(2, '0');
      const dayNum = String(d.getDate()).padStart(2, '0');
      const dateStr = `${year}-${monthNum}-${dayNum}`;

      const month = d.toLocaleDateString('en-US', { month: 'short' }).toUpperCase();
      const day = d.getDate().toString();
      const dayName = d.toLocaleDateString('en-US', { weekday: 'short' }).toUpperCase();

      const isToday = i === 0;

      list.push({ dateStr, month, day, dayName, isToday });
    }
    return list;
  }, [daysRange.past, daysRange.future]);

  // Auto-scroll selected date into view
  useEffect(() => {
    if (scrollContainerRef.current) {
      const selectedEl = scrollContainerRef.current.querySelector('[data-selected="true"]');
      if (selectedEl) {
        selectedEl.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
      }
    }
  }, [selectedDate]);

  const handleScroll = (direction: 'left' | 'right') => {
    if (scrollContainerRef.current) {
      const offset = direction === 'left' ? -220 : 220;
      scrollContainerRef.current.scrollBy({ left: offset, behavior: 'smooth' });
    }
  };

  return (
    <div className="space-y-2 select-none">
      
      {/* Header Row */}
      <div className="flex items-center justify-between px-0.5">
        <h4 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white font-heading tracking-tight flex items-center gap-1.5">
          <span>{title}</span>
          <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500">
            {new Date(selectedDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', weekday: 'short' })}
          </span>
        </h4>

        <div className="flex items-center gap-1">
          {/* Scroll Navigation Chevrons */}
          <button
            type="button"
            onClick={() => handleScroll('left')}
            className="w-6 h-6 rounded-md bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-600 dark:text-slate-300 flex items-center justify-center transition-colors cursor-pointer"
            title="Scroll previous"
          >
            <ChevronLeft className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={() => handleScroll('right')}
            className="w-6 h-6 rounded-md bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-600 dark:text-slate-300 flex items-center justify-center transition-colors cursor-pointer"
            title="Scroll next"
          >
            <ChevronRight className="w-3.5 h-3.5" />
          </button>

          {/* Optional Native Date Picker Jump */}
          {showCalendarToggle && (
            <div className="relative ml-1">
              <button
                type="button"
                onClick={() => hiddenInputRef.current?.showPicker?.() || hiddenInputRef.current?.focus()}
                className="p-1 rounded-md text-slate-500 hover:text-blue-600 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                title="Pick exact date"
              >
                <CalendarIcon className="w-3.5 h-3.5" />
              </button>
              <input
                ref={hiddenInputRef}
                type="date"
                value={selectedDate}
                onChange={(e) => e.target.value && onDateChange(e.target.value)}
                className="absolute inset-0 opacity-0 pointer-events-none w-0 h-0"
                tabIndex={-1}
              />
            </div>
          )}
        </div>
      </div>

      {/* Horizontal Scrollable Date Cards List */}
      <div
        ref={scrollContainerRef}
        className="flex items-center gap-2 overflow-x-auto pb-1.5 pt-0.5 no-scrollbar -mx-1 px-1 scroll-smooth"
      >
        {dates.map((item) => {
          const isSelected = item.dateStr === selectedDate;
          return (
            <button
              type="button"
              key={item.dateStr}
              data-selected={isSelected}
              onClick={() => onDateChange(item.dateStr)}
              className={`shrink-0 w-14 sm:w-16 py-2 px-1 rounded-2xl flex flex-col items-center justify-between text-center transition-all cursor-pointer select-none active:scale-95 ${
                isSelected
                  ? 'bg-[#FFE5D8] border border-[#FFC4B0] text-[#E64A19] shadow-[0_4px_14px_rgba(255,106,61,0.22)] font-bold transform scale-102'
                  : 'bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 text-slate-700 dark:text-slate-300 shadow-[0_2px_8px_rgba(0,0,0,0.03)] hover:bg-slate-50 dark:hover:bg-slate-800/80 hover:border-slate-200'
              }`}
            >
              {/* Month */}
              <span
                className={`text-[9px] font-bold tracking-wider ${
                  isSelected ? 'text-[#E64A19]' : 'text-slate-400 dark:text-slate-500'
                }`}
              >
                {item.month}
              </span>

              {/* Day Number */}
              <span
                className={`text-base sm:text-lg font-black my-0.5 tracking-tight ${
                  isSelected ? 'text-[#E64A19]' : 'text-slate-800 dark:text-slate-100'
                }`}
              >
                {item.day}
              </span>

              {/* Day Name */}
              <span
                className={`text-[9px] font-bold tracking-wider ${
                  isSelected ? 'text-[#E64A19]' : 'text-slate-400 dark:text-slate-500'
                }`}
              >
                {item.dayName}
              </span>
            </button>
          );
        })}
      </div>

    </div>
  );
};
