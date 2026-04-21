// Month + due-date utilities. The whole app is anchored to the calendar
// month per the PRD's "Monthly Mental Model" UX principle.

import {
  startOfMonth,
  endOfMonth,
  addMonths,
  format,
  differenceInCalendarDays,
  isWeekend as dfIsWeekend,
} from 'date-fns';

export type MonthKey = string; // 'YYYY-MM'

export function monthKey(d: Date = new Date()): MonthKey {
  return format(d, 'yyyy-MM');
}

export function monthBounds(d: Date = new Date()): { start: Date; end: Date } {
  return { start: startOfMonth(d), end: endOfMonth(d) };
}

export function nextMonth(d: Date = new Date()): Date {
  return addMonths(d, 1);
}

export function daysUntil(target: Date, from: Date = new Date()): number {
  return differenceInCalendarDays(target, from);
}

export function isWeekend(d: Date = new Date()): boolean {
  return dfIsWeekend(d);
}

export function isLastDayOfMonth(d: Date = new Date()): boolean {
  return d.getDate() === endOfMonth(d).getDate();
}
