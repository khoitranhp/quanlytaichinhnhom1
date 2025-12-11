import { ChevronDown, Calendar } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';

interface DayPickerProps {
  value: string;
  onChange: (value: string) => void;
  className?: string;
  maxDays?: number;
  required?: boolean;
  disabled?: boolean;
}

export function DayPicker({
  value,
  onChange,
  className = '',
  maxDays = 31,
  required = false,
  disabled = false
}: DayPickerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [isOpen]);

  const handleSelect = (day: number) => {
    onChange(day.toString());
    setIsOpen(false);
  };

  const days = Array.from({ length: maxDays }, (_, i) => i + 1);

  return (
    <div ref={containerRef} className={`relative ${className}`}>
      <button
        type="button"
        onClick={() => !disabled && setIsOpen(!isOpen)}
        className={`w-full px-4 py-2.5 bg-white dark:bg-gray-800 border rounded-lg flex items-center justify-between transition-all ${
          disabled
            ? 'bg-gray-50 dark:bg-gray-900 text-gray-400 cursor-not-allowed border-gray-200 dark:border-gray-700'
            : isOpen
            ? 'border-indigo-500 ring-2 ring-indigo-100 dark:ring-indigo-900'
            : 'border-gray-300 dark:border-gray-700 hover:border-indigo-400 dark:hover:border-indigo-500'
        }`}
        disabled={disabled}
      >
        <span className="flex items-center gap-2 text-gray-800 dark:text-gray-200">
          <Calendar className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
          <span>Ngày {value}</span>
        </span>
        <ChevronDown
          className={`w-5 h-5 text-gray-400 transition-transform ${
            isOpen ? 'rotate-180' : ''
          }`}
        />
      </button>

      {isOpen && (
        <div className="absolute z-50 w-full mt-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg max-h-64 overflow-y-auto">
          <div className="p-2">
            <div className="grid grid-cols-7 gap-1">
              {days.map((day) => (
                <button
                  key={day}
                  type="button"
                  onClick={() => handleSelect(day)}
                  className={`aspect-square flex items-center justify-center rounded-lg transition-colors text-sm ${
                    day.toString() === value
                      ? 'bg-indigo-600 text-white hover:bg-indigo-700'
                      : 'text-gray-700 dark:text-gray-300 hover:bg-indigo-50 dark:hover:bg-indigo-900/30'
                  }`}
                >
                  {day}
                </button>
              ))}
            </div>
          </div>
          
          {/* Quick select section */}
          <div className="border-t border-gray-200 dark:border-gray-700 p-2 space-y-1">
            <button
              type="button"
              onClick={() => handleSelect(1)}
              className="w-full px-3 py-2 text-left text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg transition-colors"
            >
              🗓️ Đầu tháng (Ngày 1)
            </button>
            <button
              type="button"
              onClick={() => handleSelect(15)}
              className="w-full px-3 py-2 text-left text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg transition-colors"
            >
              📅 Giữa tháng (Ngày 15)
            </button>
            <button
              type="button"
              onClick={() => handleSelect(maxDays)}
              className="w-full px-3 py-2 text-left text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg transition-colors"
            >
              📆 Cuối tháng (Ngày {maxDays})
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
