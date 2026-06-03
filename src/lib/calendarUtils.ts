import { format, startOfWeek, endOfWeek, eachDayOfInterval, isSameDay } from 'date-fns';
import type { Activity } from '@/types';

// 5-day week grid (Sun–Thu only, Fri/Sat removed)
export function getMonthGrid(year: number, month: number): (Date | null)[][] {
  const lastDay = new Date(year, month + 1, 0);
  const grid: (Date | null)[][] = [];
  let week: (Date | null)[] = [];

  for (let d = 1; d <= lastDay.getDate(); d++) {
    const date = new Date(year, month, d);
    const dow = date.getDay();

    if (dow === 5 || dow === 6) continue; // skip Fri & Sat

    // New Sun → flush previous week first
    if (dow === 0 && week.length > 0) {
      while (week.length < 5) week.push(null);
      grid.push(week);
      week = [];
    }

    // Pad the very first week up to its weekday position (Sun=0 … Thu=4)
    if (week.length === 0 && d <= 7 && dow > 0 && dow <= 4) {
      for (let i = 0; i < dow; i++) week.push(null);
    }

    week.push(date);
  }

  if (week.length > 0) {
    while (week.length < 5) week.push(null);
    grid.push(week);
  }

  // Always 6 rows so all months have identical cell heights
  while (grid.length < 6) {
    grid.push(new Array(5).fill(null));
  }

  return grid;
}

export function getWeekDays(date: Date): Date[] {
  const start = startOfWeek(date, { weekStartsOn: 0 });
  const end = endOfWeek(date, { weekStartsOn: 0 });
  return eachDayOfInterval({ start, end });
}

export function activitiesForDay(activities: Activity[], day: Date): Activity[] {
  return activities.filter((a) => {
    const actDate = new Date(a.start_time);
    return isSameDay(actDate, day);
  });
}

export function formatTimeHebrew(isoString: string): string {
  const d = new Date(isoString);
  const h = d.getHours().toString().padStart(2, '0');
  const m = d.getMinutes().toString().padStart(2, '0');
  return `${h}:${m}`;
}

export function formatDateHebrew(date: Date): string {
  return format(date, 'd/M');
}

export function isTodayDate(date: Date): boolean {
  return isSameDay(date, new Date());
}
