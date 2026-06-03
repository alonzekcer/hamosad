'use client';

import { HEBREW_DAYS_SHORT } from '@/lib/constants';
import { getMonthGrid, activitiesForDay, formatTimeHebrew, isTodayDate } from '@/lib/calendarUtils';
import { getCellIllustration } from '@/components/CalendarIllustrations';
import type { Activity } from '@/types';

interface MonthViewProps {
  year: number;
  month: number;
  activities: Activity[];
  onActivityClick: (activity: Activity) => void;
  onDayClick: (date: Date) => void;
}

// Snakes & ladders style: alternate subtle cell backgrounds
const CELL_BG = ['#f0f9ff', '#ffffff', '#f8fbff', '#ffffff', '#f0f9ff', '#fafeff', '#ffffff'];

export default function MonthView({ year, month, activities, onActivityClick, onDayClick }: MonthViewProps) {
  const grid = getMonthGrid(year, month);

  return (
    <div className="flex flex-col flex-1 overflow-hidden p-2">
      {/* Game-board style outer frame */}
      <div
        className="flex flex-col flex-1 rounded-3xl overflow-hidden"
        style={{
          border: '3px solid #0284c7',
          boxShadow: '0 8px 32px rgba(2,132,199,0.2), inset 0 1px 0 rgba(255,255,255,0.8)',
          background: 'white',
        }}
      >
        {/* Day headers — 5 days only (Sun–Thu) */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(5,1fr)',
            background: 'linear-gradient(135deg,#0284c7,#06b6d4)',
          }}
        >
          {HEBREW_DAYS_SHORT.slice(0, 5).map((d) => (
            <div key={d} className="text-center font-black py-2.5" style={{ color: 'white', fontSize: 13, letterSpacing: 1 }}>
              {d}
            </div>
          ))}
        </div>

        {/* Weeks */}
        <div style={{ flex: 1, minHeight: 0, display: 'flex', flexDirection: 'column' }}>
          {grid.map((week, wi) => (
            <div
              key={wi}
              style={{
                flex: 1,
                minHeight: 0,
                display: 'grid',
                gridTemplateColumns: 'repeat(5,1fr)',
                borderBottom: wi < grid.length - 1 ? '1.5px solid #bae6fd' : 'none',
                overflow: 'hidden',
              }}
            >
              {week.map((day, di) => {
                if (!day) {
                  return (
                    <div key={di} style={{
                      borderRight: di < 6 ? '1px solid #e0f2fe' : 'none',
                      background: '#f8fbff',
                    }} />
                  );
                }

                const dayActivities = activitiesForDay(activities, day);
                const isToday = isTodayDate(day);
                const isCurrentMonth = day.getMonth() === month;
                const visible = dayActivities.slice(0, 3);
                const extra = dayActivities.length - 3;
                const hasActivities = dayActivities.length > 0;

                // Pick illustration for empty cells
                const IllustrationComp = !hasActivities ? getCellIllustration(day.getDate(), di) : null;

                return (
                  <div
                    key={di}
                    onClick={() => onDayClick(day)}
                    style={{
                      borderRight: di < 6 ? '1px solid #e0f2fe' : 'none',
                      background: isToday ? '#dbeafe' : CELL_BG[di],
                      padding: '3px 2px 2px',
                      opacity: isCurrentMonth ? 1 : 0.2,
                      display: 'flex',
                      flexDirection: 'column',
                      cursor: 'pointer',
                      position: 'relative',
                      overflow: 'hidden',
                      transition: 'background 0.15s',
                    }}
                  >
                    {/* Day number — snakes & ladders style */}
                    <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 2 }}>
                      <span
                        style={{
                          width: 22, height: 22,
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          borderRadius: '50%',
                          fontSize: 11, fontWeight: 900, flexShrink: 0,
                          background: isToday
                            ? 'linear-gradient(135deg,#0284c7,#06b6d4)'
                            : 'transparent',
                          color: isToday ? 'white' : '#0369a1',
                          boxShadow: isToday ? '0 2px 8px rgba(2,132,199,0.5)' : 'none',
                          border: isToday ? 'none' : '1.5px solid #e0f2fe',
                        }}
                      >
                        {day.getDate()}
                      </span>
                    </div>

                    {/* Activities */}
                    {hasActivities ? (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 2, flex: 1 }}>
                        {visible.map((act) => (
                          <button
                            key={act.id}
                            onClick={(e) => { e.stopPropagation(); onActivityClick(act); }}
                            style={{
                              display: 'block',
                              width: '100%',
                              textAlign: 'right',
                              fontSize: 9,
                              fontWeight: 700,
                              color: 'white',
                              background: act.color,
                              borderRadius: 4,
                              padding: '2px 4px',
                              lineHeight: 1.4,
                              boxShadow: `0 1px 4px ${act.color}55`,
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                              whiteSpace: 'nowrap',
                            }}
                            title={`${formatTimeHebrew(act.start_time)} ${act.title}`}
                          >
                            {act.title}
                          </button>
                        ))}
                        {extra > 0 && (
                          <span style={{ fontSize: 8, color: '#0284c7', fontWeight: 800, paddingRight: 2 }}>
                            +{extra}
                          </span>
                        )}
                      </div>
                    ) : IllustrationComp ? (
                      /* SVG Illustration in empty cell */
                      <div style={{
                        flex: 1,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        opacity: 0.35,
                        padding: '2px',
                      }}>
                        <IllustrationComp />
                      </div>
                    ) : null}
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
