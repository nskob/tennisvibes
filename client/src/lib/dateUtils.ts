import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import 'dayjs/locale/ru';

// Configure dayjs with Russian locale and relative time plugin
dayjs.extend(relativeTime);
dayjs.locale('ru');

/**
 * Formats a date for display with Russian localization
 * Shows relative time for dates within the last month, absolute date for older dates
 */
export function formatMatchDate(date: string | Date): string {
  const matchDate = dayjs(date);
  const now = dayjs();
  const daysDiff = now.diff(matchDate, 'day');

  // If more than 30 days ago, show absolute date
  if (daysDiff > 30) {
    return matchDate.format('D MMMM YYYY');
  }

  // Otherwise show relative time
  return matchDate.fromNow();
}

/**
 * Formats a date for detailed display (always absolute format)
 */
export function formatAbsoluteDate(date: string | Date): string {
  return dayjs(date).format('D MMMM YYYY, HH:mm');
}

/**
 * Formats a date for short display
 */
export function formatShortDate(date: string | Date): string {
  return dayjs(date).format('DD.MM.YYYY');
}

/**
 * Converts any date input to ISO 8601 string format
 */
export function toISOString(date: string | Date): string {
  return dayjs(date).toISOString();
}

/**
 * Creates a new Date object from ISO string or existing date
 */
export function parseDate(date: string | Date): Date {
  return dayjs(date).toDate();
}

/**
 * Checks if a date is valid
 */
export function isValidDate(date: string | Date): boolean {
  return dayjs(date).isValid();
}

/**
 * Gets current date as ISO string
 */
export function getCurrentISOString(): string {
  return dayjs().toISOString();
}

/**
 * Formats date for HTML input[type="date"]
 */
export function formatForDateInput(date?: string | Date): string {
  const d = date ? dayjs(date) : dayjs();
  return d.format('YYYY-MM-DD');
}