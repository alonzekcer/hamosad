'use client';

import { useState, useEffect, use } from 'react';
import { validatePublicToken, fetchActivities, fetchGroups } from '@/lib/db';
import { getMonthGrid, activitiesForDay, formatTimeHebrew, isTodayDate } from '@/lib/calendarUtils';
import { HEBREW_DAYS_SHORT, HEBREW_MONTHS } from '@/lib/constants';
import type { Activity, Group } from '@/types';

interface Params { token: string }

export default function PublicCalendarPage({ params }: { params: Promise<Params> }) {
  const { token } = use(params);
  const [valid, setValid] = useState<boolean | null>(null);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [groups, setGroups] = useState<Group[]>([]);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selected, setSelected] = useState<Activity | null>(null);

  useEffect(() => {
    async function init() {
      const ok = await validatePublicToken(token);
      setValid(ok);
      if (ok) {
        const g = await fetchGroups();
        setGroups(g);
      }
    }
    init();
  }, [token]);

  useEffect(() => {
    if (!valid) return;
    const start = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
    const end = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);
    start.setHours(0, 0, 0, 0);
    end.setHours(23, 59, 59, 999);
    fetchActivities(start, end).then(setActivities);
  }, [valid, currentDate]);

  if (valid === null) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="w-10 h-10 border-[3px] border-green-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!valid) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center px-8 gap-4 text-center">
        <div className="text-5xl">🔒</div>
        <h2 className="text-xl font-bold text-green-900">קישור לא תקין</h2>
        <p className="text-green-600 text-sm">הקישור פג תוקף או שאינו קיים</p>
      </div>
    );
  }

  const grid = getMonthGrid(currentDate.getFullYear(), currentDate.getMonth());
  const actGroups = selected ? groups.filter((g) => selected.group_ids.includes(g.id)) : [];

  return (
    <div className="flex flex-col h-full overflow-hidden">
      {/* Header */}
      <div className="bg-green-600 text-white px-4 py-3 flex items-center justify-between shadow-sm">
        <button
          onClick={() => setCurrentDate((d) => { const n = new Date(d); n.setMonth(n.getMonth() - 1); return n; })}
          className="p-1.5 rounded-full hover:bg-green-500"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
          </svg>
        </button>
        <div className="text-center">
          <div className="font-bold">{HEBREW_MONTHS[currentDate.getMonth()]} {currentDate.getFullYear()}</div>
          <div className="text-green-200 text-[10px]">צפייה ציבורית</div>
        </div>
        <button
          onClick={() => setCurrentDate((d) => { const n = new Date(d); n.setMonth(n.getMonth() + 1); return n; })}
          className="p-1.5 rounded-full hover:bg-green-500"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
        </button>
      </div>

      {/* Calendar */}
      <div className="flex-1 overflow-y-auto calendar-grid">
        <div className="grid grid-cols-7 bg-green-600">
          {HEBREW_DAYS_SHORT.map((d) => (
            <div key={d} className="text-center text-white text-xs font-bold py-2">{d}</div>
          ))}
        </div>
        {grid.map((week, wi) => (
          <div key={wi} className="grid grid-cols-7 border-b border-green-100" style={{ minHeight: '80px' }}>
            {week.map((day, di) => {
              if (!day) return <div key={di} className="border-r border-green-100 bg-green-50/50" />;
              const dayActs = activitiesForDay(activities, day);
              const isToday = isTodayDate(day);
              const visible = dayActs.slice(0, 3);
              const extra = dayActs.length - 3;
              return (
                <div key={di} className="border-r border-green-100 p-0.5">
                  <div className="calendar-cell-content flex justify-center mb-0.5">
                    <span className={`w-6 h-6 flex items-center justify-center rounded-full text-xs font-semibold ${isToday ? 'bg-orange-500 text-white' : 'text-green-800'}`}>
                      {day.getDate()}
                    </span>
                  </div>
                  <div className="calendar-cell-content flex flex-col gap-0.5">
                    {visible.map((act) => (
                      <button
                        key={act.id}
                        onClick={() => setSelected(act)}
                        className="w-full text-right px-1 py-0.5 rounded text-white text-[9px] leading-tight font-medium truncate"
                        style={{ backgroundColor: act.color }}
                      >
                        {formatTimeHebrew(act.start_time)} {act.title}
                      </button>
                    ))}
                    {extra > 0 && <span className="text-[9px] text-green-600 px-1">+{extra}</span>}
                  </div>
                </div>
              );
            })}
          </div>
        ))}
      </div>

      {/* Activity detail overlay */}
      {selected && (
        <div className="fixed inset-0 z-50 flex flex-col justify-end fade-in" onClick={() => setSelected(null)}>
          <div className="bg-white rounded-t-3xl shadow-2xl slide-up p-5" onClick={(e) => e.stopPropagation()}>
            <div className="h-1.5 rounded-full mb-4 -mx-5 -mt-5" style={{ backgroundColor: selected.color }} />
            <div className="flex items-start justify-between mb-4">
              <h2 className="text-xl font-bold text-green-900">{selected.title}</h2>
              <button onClick={() => setSelected(null)} className="text-green-400 p-1">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>
            <div className="text-sm text-green-700 mb-2">
              {formatTimeHebrew(selected.start_time)} – {formatTimeHebrew(selected.end_time)}
            </div>
            {selected.location && <div className="text-sm text-green-700 mb-2">📍 {selected.location}</div>}
            {actGroups.length > 0 && (
              <div className="flex flex-wrap gap-1.5 mb-3">
                {actGroups.map((g) => (
                  <span key={g.id} className="px-2.5 py-0.5 rounded-full text-white text-xs font-medium" style={{ backgroundColor: g.color }}>
                    {g.name}
                  </span>
                ))}
              </div>
            )}
            {selected.description && <p className="text-green-800 text-sm leading-relaxed">{selected.description}</p>}
          </div>
        </div>
      )}
    </div>
  );
}
