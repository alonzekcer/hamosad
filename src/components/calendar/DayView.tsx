'use client';

import { activitiesForDay, formatTimeHebrew } from '@/lib/calendarUtils';
import { HEBREW_DAYS_FULL, HEBREW_MONTHS } from '@/lib/constants';
import type { Activity } from '@/types';

interface DayViewProps {
  date: Date;
  activities: Activity[];
  onActivityClick: (a: Activity) => void;
  isGuide?: boolean;
  onAddActivity?: (date: Date) => void;
}

export default function DayView({ date, activities, onActivityClick, isGuide, onAddActivity }: DayViewProps) {
  const dayActivities = activitiesForDay(activities, date).sort(
    (a, b) => new Date(a.start_time).getTime() - new Date(b.start_time).getTime()
  );
  const dayName = HEBREW_DAYS_FULL[date.getDay()];
  const dateLabel = `${date.getDate()} ${HEBREW_MONTHS[date.getMonth()]} ${date.getFullYear()}`;

  return (
    <div className="flex-1 overflow-y-auto relative" style={{ background: 'linear-gradient(180deg, #f0f9ff 0%, #e0f2fe 100%)' }}>
      <div className="text-center py-5 px-4" style={{ background: 'linear-gradient(135deg, #f0f9ff, #e0f2fe)' }}>
        <div className="text-3xl mb-1">🏖️</div>
        <div className="text-xl font-black" style={{ color: '#0369a1' }}>יום {dayName}</div>
        <div className="text-sm font-medium" style={{ color: '#38bdf8' }}>{dateLabel}</div>
      </div>

      <div className="px-3 pb-24">
        {dayActivities.length === 0 ? (
          <div className="flex flex-col items-center justify-center mt-12 gap-3">
            <div className="text-5xl">🌊</div>
            <span className="text-sm font-bold" style={{ color: '#7dd3fc' }}>אין פעילויות ביום זה</span>
            {isGuide && (
              <button
                onClick={() => onAddActivity?.(date)}
                className="mt-2 px-5 py-2.5 rounded-2xl text-white font-bold text-sm shadow-md active:scale-95 transition-all"
                style={{ background: 'linear-gradient(135deg, #0284c7, #06b6d4)' }}
              >
                ➕ הוסף פעילות
              </button>
            )}
          </div>
        ) : (
          <div className="flex flex-col gap-3 pt-3">
            {dayActivities.map((act) => (
              <button
                key={act.id}
                onClick={() => onActivityClick(act)}
                className="w-full text-right bg-white rounded-3xl shadow-sm overflow-hidden active:scale-[0.98] transition-transform"
                style={{ border: `2px solid ${act.color}33` }}
              >
                <div className="h-2 w-full" style={{ background: `linear-gradient(90deg, ${act.color}, ${act.color}88)` }} />
                <div className="p-4">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h3 className="font-black text-base leading-tight" style={{ color: '#0c4a6e' }}>{act.title}</h3>
                      <div className="flex items-center gap-1.5 mt-1.5">
                        <span>⏰</span>
                        <span className="font-semibold text-sm" style={{ color: act.color }}>
                          {formatTimeHebrew(act.start_time)} – {formatTimeHebrew(act.end_time)}
                        </span>
                      </div>
                      {act.location && (
                        <div className="flex items-center gap-1.5 mt-1">
                          <span>📍</span>
                          <span className="text-sm" style={{ color: '#0369a1' }}>{act.location}</span>
                        </div>
                      )}
                    </div>
                    <div className="w-10 h-10 rounded-2xl flex items-center justify-center text-xl shrink-0" style={{ background: `${act.color}22` }}>
                      🎉
                    </div>
                  </div>
                  {act.description && (
                    <p className="text-sm mt-2 leading-relaxed line-clamp-2" style={{ color: '#0369a1' }}>{act.description}</p>
                  )}
                </div>
              </button>
            ))}
          </div>
        )}
      </div>

      {isGuide && dayActivities.length > 0 && (
        <button
          onClick={() => onAddActivity?.(date)}
          className="fixed bottom-20 left-4 w-14 h-14 rounded-full text-white text-2xl shadow-xl flex items-center justify-center active:scale-95 transition-all z-40 fab-pulse"
          style={{ background: 'linear-gradient(135deg, #0284c7, #06b6d4)' }}
        >
          ➕
        </button>
      )}
    </div>
  );
}
