'use client';

import { getWeekDays, activitiesForDay, formatTimeHebrew, isTodayDate } from '@/lib/calendarUtils';
import { HEBREW_DAYS_SHORT } from '@/lib/constants';
import type { Activity } from '@/types';

interface WeekViewProps {
  date: Date;
  activities: Activity[];
  onActivityClick: (a: Activity) => void;
  onDayClick: (d: Date) => void;
}

export default function WeekView({ date, activities, onActivityClick, onDayClick }: WeekViewProps) {
  const allDays = getWeekDays(date);
  const days = allDays.filter((d) => d.getDay() !== 5 && d.getDay() !== 6);

  return (
    <div className="flex flex-col flex-1 overflow-hidden calendar-grid">
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5,1fr)', background: 'linear-gradient(135deg, #0284c7, #06b6d4)' }}>
        {days.map((day, i) => {
          const isToday = isTodayDate(day);
          return (
            <button key={i} onClick={() => onDayClick(day)} className="py-2.5 flex flex-col items-center gap-0.5 active:bg-white/10">
              <span style={{ color: 'rgba(255,255,255,0.75)', fontSize: 10, fontWeight: 700 }}>{HEBREW_DAYS_SHORT[day.getDay()]}</span>
              <span style={{
                width: 28, height: 28, display: 'flex', alignItems: 'center', justifyContent: 'center',
                borderRadius: '50%', fontSize: 12, fontWeight: 800,
                background: isToday ? 'white' : 'transparent',
                color: isToday ? '#0284c7' : 'white',
              }}>
                {day.getDate()}
              </span>
            </button>
          );
        })}
      </div>

      <div className="flex-1 overflow-y-auto">
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5,1fr)', height: '100%' }}>
          {days.map((day, i) => {
            const dayActivities = activitiesForDay(activities, day);
            const isToday = isTodayDate(day);
            return (
              <div
                key={i}
                onClick={() => onDayClick(day)}
                style={{
                  borderRight: '1px solid #e0f2fe',
                  background: isToday ? '#f0f9ff' : i % 2 === 0 ? '#fafeff' : 'white',
                  padding: '4px 2px', minHeight: 200, cursor: 'pointer',
                }}
              >
                <div className="flex flex-col gap-1 calendar-cell-content">
                  {dayActivities.map((act) => (
                    <button
                      key={act.id}
                      onClick={(e) => { e.stopPropagation(); onActivityClick(act); }}
                      className="w-full text-right rounded-xl text-white font-bold active:opacity-70"
                      style={{ backgroundColor: act.color, fontSize: 10, padding: '4px 6px', boxShadow: `0 2px 4px ${act.color}66` }}
                    >
                      <div className="truncate">{act.title}</div>
                      <div style={{ opacity: 0.9, fontSize: 9 }}>{formatTimeHebrew(act.start_time)}</div>
                    </button>
                  ))}
                  {dayActivities.length === 0 && (
                    <div className="text-center pt-4 opacity-20" style={{ fontSize: 16 }}>🌊</div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
