import { useState, useMemo } from 'react';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay } from 'date-fns';
import { es } from 'date-fns/locale';
import {
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';

interface CalendarProps {
  selectedDate?: Date;
  events?: Array<{ date: Date; category: string }>;
  onSelectDate?: (date: Date) => void;
}

export function Calendar({ selectedDate, events = [], onSelectDate }: CalendarProps) {
  const [currentMonth, setCurrentMonth] = useState(new Date());

  const days = useMemo(() => {
    const firstDay = startOfMonth(currentMonth);
    const lastDay = endOfMonth(currentMonth);
    return eachDayOfInterval({ start: firstDay, end: lastDay });
  }, [currentMonth]);

  const handlePrevMonth = () => {
    setCurrentMonth((prev) => new Date(prev.getFullYear(), prev.getMonth() - 1));
  };

  const handleNextMonth = () => {
    setCurrentMonth((prev) => new Date(prev.getFullYear(), prev.getMonth() + 1));
  };

  const getDayClass = (day: Date) => {
    const isToday = isSameDay(day, new Date());
    const isSelected = selectedDate && isSameDay(day, selectedDate);
    const hasEvent = events.some((event) => isSameDay(event.date, day));

    return `
      w-10 h-10 flex items-center justify-center text-center
      ${isToday ? 'bg-blue-100 text-blue-600' : ''}
      ${isSelected ? 'bg-blue-600 text-white' : ''}
      ${hasEvent ? 'border-2 border-blue-400' : ''}
      hover:bg-gray-50 cursor-pointer transition-colors
    `;
  };

  return (
    <div className="w-full max-w-md mx-auto bg-white rounded-lg shadow-md p-6">
      <div className="flex justify-between items-center mb-6">
        <button
          onClick={handlePrevMonth}
          className="p-2 rounded-md hover:bg-gray-100"
          aria-label="Mes anterior"
          role="button"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>
        <h2 className="text-lg font-semibold">
          {format(currentMonth, 'MMMM yyyy', { locale: es })}
        </h2>
        <button
          onClick={handleNextMonth}
          className="p-2 rounded-md hover:bg-gray-100"
          aria-label="Mes siguiente"
          role="button"
        >
          <ChevronRight className="w-5 h-5" />
        </button>
      </div>

      <div className="grid grid-cols-7 gap-1 mb-2">
        {['L', 'M', 'X', 'J', 'V', 'S', 'D'].map((day) => (
          <div
            key={day}
            className="text-center text-gray-500 font-medium"
            role="columnheader"
          >
            {day}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-1">
        {days.map((day) => (
          <button
            key={day.toISOString()}
            onClick={() => onSelectDate?.(day)}
            className={getDayClass(day)}
            aria-label={format(day, 'dd MMMM yyyy', { locale: es })}
            role="gridcell"
            tabIndex={0}
          >
            {format(day, 'd')}
          </button>
        ))}
      </div>
    </div>
  );
}
