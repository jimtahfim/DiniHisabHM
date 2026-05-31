import { useState, useEffect } from 'react';
import { convertToBanglaNumber, parseBanglaOrEnglishNumber } from '../utils/banglaNumber';

interface NumericInputProps {
  value: number;
  onChange: (value: number) => void;
  placeholder?: string;
  className?: string;
  id?: string;
  error?: boolean;
  disabled?: boolean;
  showButtons?: boolean;
  min?: number;
  max?: number;
}

export function NumericInput({
  value,
  onChange,
  placeholder = '',
  className = '',
  id,
  error = false,
  disabled = false,
  showButtons = false,
  min,
  max
}: NumericInputProps) {
  const [displayValue, setDisplayValue] = useState<string>(() => {
    return value === 0 ? '' : convertToBanglaNumber(value);
  });

  // Sync with outer value changes (e.g. resets, loaded history)
  useEffect(() => {
    setDisplayValue(value === 0 ? '' : convertToBanglaNumber(value));
  }, [value]);

  const handleChange = (rawVal: string) => {
    const enToBdMap: Record<string, string> = {
      '0': '০', '1': '১', '2': '২', '3': '৩', '4': '৪',
      '5': '৫', '6': '৬', '7': '৭', '8': '৮', '9': '৯'
    };

    // Swap English digits to Bangla and remove non-numeric chars
    const cleanBangla = rawVal
      .replace(/[0-9]/g, (digit) => enToBdMap[digit])
      .replace(/[^০-৯.]/g, ''); // Keep only Bangla digits and decimal point

    // Sanitize double decimal points if any
    const parts = cleanBangla.split('.');
    let sanitized = cleanBangla;
    if (parts.length > 2) {
      sanitized = parts[0] + '.' + parts.slice(1).join('');
    }

    setDisplayValue(sanitized);

    const parsedNum = parseBanglaOrEnglishNumber(sanitized);
    onChange(parsedNum);
  };

  const handleDecrement = () => {
    if (disabled) return;
    const newVal = Math.max(min ?? 0, value - 1);
    onChange(newVal);
  };

  const handleIncrement = () => {
    if (disabled) return;
    const newVal = (max !== undefined) ? Math.min(max, value + 1) : value + 1;
    onChange(newVal);
  };

  if (showButtons) {
    return (
      <div className="flex items-center gap-1.5 w-full">
        <button
          type="button"
          disabled={disabled || value <= (min ?? 0)}
          onClick={handleDecrement}
          className="w-10 h-10 shrink-0 flex items-center justify-center rounded-xl border border-gray-200 dark:border-gray-800 bg-gray-50 hover:bg-gray-100 dark:bg-darkBg-light dark:hover:bg-darkBg-dark text-gray-700 dark:text-gray-300 font-bold transition-all disabled:opacity-40 disabled:cursor-not-allowed text-lg font-siliguri shadow-sm"
        >
          -
        </button>
        <input
          type="text"
          id={id}
          value={displayValue}
          onChange={(e) => handleChange(e.target.value)}
          placeholder={placeholder}
          disabled={disabled}
          className={`block w-full text-center px-4 py-2.5 rounded-xl border bg-white dark:bg-darkBg-light focus:ring-2 focus:ring-emerald-500 text-sm transition-all font-siliguri font-bold text-gray-850 dark:text-white ${
            disabled
              ? 'bg-gray-100 dark:bg-darkBg-dark text-gray-400 dark:text-gray-500 cursor-not-allowed opacity-50'
              : ''
          } ${
            error
              ? 'border-red-500/40 focus:ring-red-500'
              : 'border-gray-200 dark:border-gray-800'
          } ${className}`}
        />
        <button
          type="button"
          disabled={disabled || (max !== undefined && value >= max)}
          onClick={handleIncrement}
          className="w-10 h-10 shrink-0 flex items-center justify-center rounded-xl border border-gray-200 dark:border-gray-800 bg-gray-50 hover:bg-gray-100 dark:bg-darkBg-light dark:hover:bg-darkBg-dark text-gray-700 dark:text-gray-300 font-bold transition-all disabled:opacity-40 disabled:cursor-not-allowed text-lg font-siliguri shadow-sm"
        >
          +
        </button>
      </div>
    );
  }

  return (
    <input
      type="text"
      id={id}
      value={displayValue}
      onChange={(e) => handleChange(e.target.value)}
      placeholder={placeholder}
      disabled={disabled}
      className={`block w-full px-4 py-2.5 rounded-xl border bg-white dark:bg-darkBg-light focus:ring-2 focus:ring-emerald-500 text-sm transition-all font-siliguri font-bold text-gray-800 dark:text-white ${
        disabled
          ? 'bg-gray-100 dark:bg-darkBg-dark text-gray-400 dark:text-gray-500 cursor-not-allowed opacity-50'
          : ''
      } ${
        error
          ? 'border-red-500/40 focus:ring-red-500'
          : 'border-gray-200 dark:border-gray-800'
      } ${className}`}
    />
  );
}
