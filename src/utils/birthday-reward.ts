/** Points awarded once per calendar year on the member's birthday. */
export const BIRTHDAY_BONUS = 200;

/** Parse YYYY-MM-DD (or ISO datetime prefix) without timezone drift. */
export function parseBirthdayDate(isoDate: string): { year: number; month: number; day: number } | null {
  const normalized = isoDate.trim().slice(0, 10);
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(normalized);
  if (!match) return null;
  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);
  if (month < 1 || month > 12 || day < 1 || day > 31) return null;
  return { year, month, day };
}

export function normalizeBirthdayInput(isoDate: string): string | null {
  const parsed = parseBirthdayDate(isoDate);
  if (!parsed) return null;
  const { year, month, day } = parsed;
  return `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
}

export function isBirthdayToday(isoDate: string, now = new Date()): boolean {
  const parsed = parseBirthdayDate(isoDate);
  if (!parsed) return false;
  return parsed.month === now.getMonth() + 1 && parsed.day === now.getDate();
}

export function formatBirthdayDisplay(isoDate: string): string {
  const parsed = parseBirthdayDate(isoDate);
  if (!parsed) return isoDate;
  const date = new Date(Date.UTC(2000, parsed.month - 1, parsed.day));
  return date.toLocaleDateString('en-AU', { day: 'numeric', month: 'long' });
}

export function isValidBirthdayInput(isoDate: string): boolean {
  const parsed = parseBirthdayDate(isoDate);
  if (!parsed) return false;

  const { year, month, day } = parsed;
  const date = new Date(year, month - 1, day);
  if (
    date.getFullYear() !== year ||
    date.getMonth() !== month - 1 ||
    date.getDate() !== day
  ) {
    return false;
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  date.setHours(0, 0, 0, 0);
  return date <= today;
}

export function maxBirthdayInputDate(): string {
  const today = new Date();
  const y = today.getFullYear();
  const m = String(today.getMonth() + 1).padStart(2, '0');
  const d = String(today.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

export function birthdayStringToDate(isoDate: string): Date | undefined {
  const parsed = parseBirthdayDate(isoDate);
  if (!parsed) return undefined;
  return new Date(parsed.year, parsed.month - 1, parsed.day);
}

export function dateToBirthdayString(date: Date | undefined | null): string {
  if (!date) return '';
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

/** Sensible default when opening the picker with no date selected yet. */
export function defaultBirthdayPickerMonth(): Date {
  const today = new Date();
  return new Date(today.getFullYear() - 25, today.getMonth(), 1);
}
