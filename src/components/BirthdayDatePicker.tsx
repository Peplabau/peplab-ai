import { useEffect, useMemo, useState } from 'react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { cn } from '@/lib/utils';
import {
  formatBirthdayDisplay,
  isValidBirthdayInput,
  normalizeBirthdayInput,
  parseBirthdayDate,
} from '@/utils/birthday-reward';

interface BirthdayDatePickerProps {
  value: string;
  onChange: (value: string) => void;
  className?: string;
  placeholder?: string;
}

const MONTHS = [
  { value: '01', label: 'January' },
  { value: '02', label: 'February' },
  { value: '03', label: 'March' },
  { value: '04', label: 'April' },
  { value: '05', label: 'May' },
  { value: '06', label: 'June' },
  { value: '07', label: 'July' },
  { value: '08', label: 'August' },
  { value: '09', label: 'September' },
  { value: '10', label: 'October' },
  { value: '11', label: 'November' },
  { value: '12', label: 'December' },
] as const;

const selectTriggerClass =
  'w-full h-11 rounded-xl border border-[rgba(244,246,250,0.12)] bg-[rgba(7,10,18,0.65)] px-3 text-sm text-[#F4F6FA] shadow-none focus:border-[#F59E0B] focus:ring-2 focus:ring-[rgba(245,158,11,0.2)] data-[placeholder]:text-[#6B7280]';

const selectContentClass =
  'border-[rgba(244,246,250,0.12)] bg-[rgba(17,24,39,0.98)] text-[#F4F6FA] shadow-xl shadow-black/40 max-h-60';

const selectItemClass =
  'text-[#F4F6FA] focus:bg-[rgba(245,158,11,0.15)] focus:text-[#F4F6FA]';

function daysInMonth(year: number, month: number): number {
  return new Date(year, month, 0).getDate();
}

function parseParts(value: string): { day: string; month: string; year: string } {
  const parsed = parseBirthdayDate(value);
  if (!parsed) return { day: '', month: '', year: '' };
  return {
    day: String(parsed.day).padStart(2, '0'),
    month: String(parsed.month).padStart(2, '0'),
    year: String(parsed.year),
  };
}

function composeDate(day: string, month: string, year: string): string {
  if (!day || !month || !year) return '';
  return `${year}-${month}-${day}`;
}

export default function BirthdayDatePicker({
  value,
  onChange,
  className,
}: BirthdayDatePickerProps) {
  const parsed = useMemo(() => parseParts(value), [value]);
  const [day, setDay] = useState(parsed.day);
  const [month, setMonth] = useState(parsed.month);
  const [year, setYear] = useState(parsed.year);

  const currentYear = new Date().getFullYear();
  const years = useMemo(
    () => Array.from({ length: currentYear - 1920 + 1 }, (_, i) => String(currentYear - i)),
    [currentYear],
  );

  const yearNum = year ? Number(year) : currentYear - 25;
  const monthNum = month ? Number(month) : 1;
  const maxDay = daysInMonth(yearNum, monthNum);
  const days = useMemo(
    () => Array.from({ length: maxDay }, (_, i) => String(i + 1).padStart(2, '0')),
    [maxDay],
  );

  useEffect(() => {
    setDay(parsed.day);
    setMonth(parsed.month);
    setYear(parsed.year);
  }, [parsed.day, parsed.month, parsed.year]);

  useEffect(() => {
    if (day && Number(day) > maxDay) {
      setDay(String(maxDay).padStart(2, '0'));
    }
  }, [day, maxDay]);

  useEffect(() => {
    const next = composeDate(day, month, year);
    if (!next) return;
    const normalized = normalizeBirthdayInput(next);
    if (normalized && isValidBirthdayInput(normalized) && normalized !== value) {
      onChange(normalized);
    }
  }, [day, month, year, value, onChange]);

  const preview =
    day && month && year && isValidBirthdayInput(composeDate(day, month, year))
      ? formatBirthdayDisplay(composeDate(day, month, year))
      : null;

  return (
    <div className={cn('space-y-3', className)}>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3 sm:gap-3">
        <div className="min-w-0">
          <label className="mb-1.5 block text-[11px] font-medium uppercase tracking-[0.08em] text-[#A9B3C7]">
            Day
          </label>
          <Select value={day || undefined} onValueChange={setDay}>
            <SelectTrigger className={selectTriggerClass}>
              <SelectValue placeholder="Day" />
            </SelectTrigger>
            <SelectContent className={selectContentClass} position="popper">
              {days.map((d) => (
                <SelectItem key={d} value={d} className={selectItemClass}>
                  {Number(d)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="min-w-0 col-span-1 sm:col-span-1">
          <label className="mb-1.5 block text-[11px] font-medium uppercase tracking-[0.08em] text-[#A9B3C7]">
            Month
          </label>
          <Select value={month || undefined} onValueChange={setMonth}>
            <SelectTrigger className={selectTriggerClass}>
              <SelectValue placeholder="Month" />
            </SelectTrigger>
            <SelectContent className={selectContentClass} position="popper">
              {MONTHS.map((m) => (
                <SelectItem key={m.value} value={m.value} className={selectItemClass}>
                  {m.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="min-w-0">
          <label className="mb-1.5 block text-[11px] font-medium uppercase tracking-[0.08em] text-[#A9B3C7]">
            Year
          </label>
          <Select value={year || undefined} onValueChange={setYear}>
            <SelectTrigger className={selectTriggerClass}>
              <SelectValue placeholder="Year" />
            </SelectTrigger>
            <SelectContent className={cn(selectContentClass, 'max-h-72')} position="popper">
              {years.map((y) => (
                <SelectItem key={y} value={y} className={selectItemClass}>
                  {y}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {preview ? (
        <p className="text-xs text-[#A9B3C7]">
          Your birthday: <span className="font-medium text-[#F59E0B]">{preview}</span>
        </p>
      ) : (
        <p className="text-xs text-[#6B7280]">Pick your day, month, and year.</p>
      )}
    </div>
  );
}
