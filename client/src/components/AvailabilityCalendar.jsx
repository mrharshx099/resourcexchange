import React, { useState } from 'react';
import { 
  ChevronLeft, 
  ChevronRight, 
  Calendar as CalendarIcon, 
  Lock, 
  CheckCircle, 
  Plus, 
  Trash2,
  AlertCircle
} from 'lucide-react';

export default function AvailabilityCalendar({ 
  resource, 
  availabilitySlots = [], 
  isProvider = false, 
  onBlockDate, 
  onUnblockSlot,
  selectedStart,
  selectedEnd,
  onSelectDates
}) {
  const [currentMonth, setCurrentMonth] = useState(new Date(2026, 9, 1)); // October 2026 default for demo
  const [blockReason, setBlockReason] = useState('blackout');

  // Month navigation
  const nextMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1));
  };

  const prevMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1));
  };

  const year = currentMonth.getFullYear();
  const month = currentMonth.getMonth();

  // Days in month calculation
  const firstDayIndex = new Date(year, month, 1).getDay();
  const totalDays = new Date(year, month + 1, 0).getDate();

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  // Helper to format date YYYY-MM-DD
  const formatDateStr = (y, m, d) => {
    const mm = String(m + 1).padStart(2, '0');
    const dd = String(d).padStart(2, '0');
    return `${y}-${mm}-${dd}`;
  };

  // Check if date string has a blocked slot
  const getSlotForDate = (dateStr) => {
    const targetDate = new Date(`${dateStr}T12:00:00.000Z`).getTime();
    return availabilitySlots.find(slot => {
      const slotStart = new Date(slot.start_time).getTime();
      const slotEnd = new Date(slot.end_time).getTime();
      return targetDate >= slotStart && targetDate <= slotEnd;
    });
  };

  const handleDateClick = (day) => {
    const dateStr = formatDateStr(year, month, day);
    const existingSlot = getSlotForDate(dateStr);

    if (isProvider) {
      if (existingSlot) {
        if (existingSlot.reason === 'blackout' || existingSlot.reason === 'maintenance') {
          if (onUnblockSlot && window.confirm(`Unblock date ${dateStr}?`)) {
            onUnblockSlot(existingSlot.id);
          }
        } else {
          alert(`This date is booked for a confirmed client exchange (Slot: ${existingSlot.id}).`);
        }
      } else {
        if (onBlockDate) {
          const startTime = `${dateStr}T00:00:00.000Z`;
          const endTime = `${dateStr}T23:59:59.000Z`;
          onBlockDate({ start_time: startTime, end_time: endTime, reason: blockReason });
        }
      }
    } else {
      // Seeker Mode - select start or end
      if (existingSlot) {
        alert('This date is unavailable and already booked. Please select another date.');
        return;
      }

      if (onSelectDates) {
        if (!selectedStart || (selectedStart && selectedEnd)) {
          onSelectDates(dateStr, '');
        } else if (selectedStart && !selectedEnd) {
          if (new Date(dateStr) < new Date(selectedStart)) {
            onSelectDates(dateStr, selectedStart);
          } else {
            onSelectDates(selectedStart, dateStr);
          }
        }
      }
    }
  };

  return (
    <div className="bg-white dark:bg-slate-900/90 rounded-2xl border border-slate-200 dark:border-slate-800 p-4 sm:p-5 shadow-sm dark:shadow-none">
      
      {/* Calendar Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <CalendarIcon className="w-5 h-5 text-emerald-500 dark:text-emerald-400" />
          <h4 className="font-bold text-slate-900 dark:text-slate-100 text-sm sm:text-base">
            {monthNames[month]} {year}
          </h4>
        </div>

        <div className="flex items-center gap-1.5">
          <button
            onClick={prevMonth}
            className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button
            onClick={nextMonth}
            className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 transition-colors"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Weekday Labels */}
      <div className="grid grid-cols-7 gap-1 text-center text-xs font-semibold text-slate-500 dark:text-slate-400 mb-2">
        <span>Sun</span>
        <span>Mon</span>
        <span>Tue</span>
        <span>Wed</span>
        <span>Thu</span>
        <span>Fri</span>
        <span>Sat</span>
      </div>

      {/* Days Grid */}
      <div className="grid grid-cols-7 gap-1.5">
        {/* Empty padding days */}
        {Array.from({ length: firstDayIndex }).map((_, i) => (
          <div key={`empty-${i}`} className="h-10 sm:h-12 rounded-xl bg-slate-100/50 dark:bg-slate-950/30" />
        ))}

        {/* Days of Month */}
        {Array.from({ length: totalDays }).map((_, i) => {
          const day = i + 1;
          const dateStr = formatDateStr(year, month, day);
          const slot = getSlotForDate(dateStr);
          const isBooked = !!slot;
          
          const isSelectedStart = selectedStart === dateStr;
          const isSelectedEnd = selectedEnd === dateStr;
          const isInRange = selectedStart && selectedEnd && (
            new Date(dateStr) >= new Date(selectedStart) && new Date(dateStr) <= new Date(selectedEnd)
          );

          let cellBg = 'bg-slate-50 hover:bg-slate-100 dark:bg-slate-800/60 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700/50';
          
          if (isBooked) {
            cellBg = 'bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-500/40 cursor-not-allowed';
          } else if (isSelectedStart || isSelectedEnd) {
            cellBg = 'bg-emerald-500 text-slate-950 font-bold border border-emerald-400 shadow-md shadow-emerald-500/30';
          } else if (isInRange) {
            cellBg = 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-900 dark:text-emerald-200 border border-emerald-300 dark:border-emerald-500/30';
          }

          return (
            <button
              key={day}
              onClick={() => handleDateClick(day)}
              className={`h-10 sm:h-12 rounded-xl flex flex-col items-center justify-center relative text-xs font-medium transition-all group ${cellBg}`}
              title={isBooked ? `Booked / Blocked: ${slot?.reason || 'Occupied'}` : `Available (${dateStr})`}
            >
              <span>{day}</span>
              {isBooked && (
                <Lock className="w-3 h-3 text-rose-500 dark:text-rose-400 absolute bottom-1 right-1" />
              )}
            </button>
          );
        })}
      </div>

      {/* Legend & Instructions */}
      <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-md bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700" />
            <span className="text-slate-500 dark:text-slate-400">Available</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-md bg-rose-100 dark:bg-rose-950/80 border border-rose-300 dark:border-rose-500" />
            <span className="text-rose-600 dark:text-rose-300">Booked / Blocked</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-md bg-emerald-500" />
            <span className="text-emerald-700 dark:text-emerald-300">Selected</span>
          </div>
        </div>

        {isProvider && (
          <div className="flex items-center gap-2">
            <span className="text-slate-500 dark:text-slate-400">Block as:</span>
            <select
              value={blockReason}
              onChange={(e) => setBlockReason(e.target.value)}
              className="bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-200 text-xs px-2 py-1 rounded-lg border border-slate-200 dark:border-slate-700"
            >
              <option value="blackout">Private Blackout</option>
              <option value="maintenance">Maintenance</option>
            </select>
          </div>
        )}
      </div>

      {isProvider && (
        <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-2 italic">
          💡 Click on any available date to quickly block it for maintenance or in-house hospitality use. Click blocked dates to release.
        </p>
      )}
    </div>
  );
}
