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
  const dayStart = new Date(day); dayStart.setHours(0, 0, 0, 0);
  const dayEnd = new Date(day); dayEnd.setHours(23, 59, 59, 999);
  return activities.filter((a) => {
    return new Date(a.start_time) <= dayEnd && new Date(a.end_time) >= dayStart;
  });
}

export function isMultiDayActivity(act: Activity): boolean {
  const s = new Date(act.start_time); s.setHours(0, 0, 0, 0);
  const e = new Date(act.end_time); e.setHours(0, 0, 0, 0);
  return s.getTime() !== e.getTime();
}

// Returns chip style for multi-day spanning in RTL grid (Sun=right, Thu=left)
export function getSpanChipStyle(act: Activity, day: Date): {
  borderRadius: string; marginLeft: number; marginRight: number; showTitle: boolean;
} {
  if (!isMultiDayActivity(act)) {
    return { borderRadius: '4px', marginLeft: 0, marginRight: 0, showTitle: true };
  }
  const s = new Date(act.start_time); s.setHours(0, 0, 0, 0);
  const e = new Date(act.end_time); e.setHours(0, 0, 0, 0);
  const d = new Date(day); d.setHours(0, 0, 0, 0);

  const isRealStart = d.getTime() === s.getTime();
  const isRealEnd = d.getTime() === e.getTime();
  // Week boundaries (visual): Sun = right edge, Thu = left edge
  const isWeekStart = day.getDay() === 0;
  const isWeekEnd = day.getDay() === 4;

  const isVisualStart = isRealStart || isWeekStart;
  const isVisualEnd = isRealEnd || isWeekEnd;

  if (isVisualStart && isVisualEnd) return { borderRadius: '4px', marginLeft: 0, marginRight: 0, showTitle: true };
  if (isVisualStart) return { borderRadius: '0 4px 4px 0', marginLeft: -2, marginRight: 0, showTitle: true };
  if (isVisualEnd) return { borderRadius: '4px 0 0 4px', marginLeft: 0, marginRight: -2, showTitle: false };
  return { borderRadius: '0', marginLeft: -2, marginRight: -2, showTitle: false };
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
