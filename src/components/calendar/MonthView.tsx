'use client';

import { HEBREW_DAYS_SHORT } from '@/lib/constants';
import { getMonthGrid, activitiesForDay, isMultiDayActivity, formatTimeHebrew, isTodayDate } from '@/lib/calendarUtils';
import { getCellIllustration } from '@/components/CalendarIllustrations';
import type { Activity } from '@/types';

interface MonthViewProps {
  year: number;
  month: number;
  activities: Activity[];
  onActivityClick: (activity: Activity) => void;
  onDayClick: (date: Date) => void;
}

const CELL_BG = ['#f0f9ff', '#ffffff', '#f8fbff', '#ffffff', '#f0f9ff', '#fafeff', '#ffffff'];

// dow 0=Sun…4=Thu → grid column (RTL: col1=right=Sun)
function dayCol(date: Date) { return date.getDay() + 1; }

interface MultiDayBar {
  act: Activity;
  colStart: number;
  colEnd: number;
  isRealStart: boolean;
  isRealEnd: boolean;
}

function getWeekMultiDayBars(activities: Activity[], week: (Date | null)[]): MultiDayBar[] {
  const realDays = week.filter(Boolean) as Date[];
  if (realDays.length === 0) return [];

  const firstDay = realDays[0];
  const weekSun = new Date(firstDay);
  weekSun.setDate(firstDay.getDate() - firstDay.getDay());
  weekSun.setHours(0, 0, 0, 0);

  const weekThu = new Date(weekSun);
  weekThu.setDate(weekSun.getDate() + 4);
  weekThu.setHours(0, 0, 0, 0);

  return activities
    .filter((act) => {
      if (!isMultiDayActivity(act)) return false;
      const s = new Date(act.start_time); s.setHours(0, 0, 0, 0);
      const e = new Date(act.end_time); e.setHours(0, 0, 0, 0);
      return s <= weekThu && e >= weekSun;
    })
    .map((act) => {
      const actStart = new Date(act.start_time); actStart.setHours(0, 0, 0, 0);
      const actEnd = new Date(act.end_time); actEnd.setHours(0, 0, 0, 0);
      const clampedStart = actStart < weekSun ? weekSun : actStart;
      const clampedEnd = actEnd > weekThu ? weekThu : actEnd;
      return {
        act,
        colStart: dayCol(clampedStart),
        colEnd: dayCol(clampedEnd),
        isRealStart: actStart.getTime() === clampedStart.getTime(),
        isRealEnd: actEnd.getTime() === clampedEnd.getTime(),
      };
    });
}

export default function MonthView({ year, month, activities, onActivityClick, onDayClick }: MonthViewProps) {
  const grid = getMonthGrid(year, month);
  const multiDayActivities = activities.filter(isMultiDayActivity);
  const singleDayActivities = activities.filter((a) => !isMultiDayActivity(a));

  return (
    <div className="flex flex-col flex-1 overflow-hidden p-2">
      <div
        className="flex flex-col flex-1 rounded-3xl overflow-hidden"
        style={{
          border: '3px solid #0284c7',
          boxShadow: '0 8px 32px rgba(2,132,199,0.2), inset 0 1px 0 rgba(255,255,255,0.8)',
          background: 'white',
        }}
      >
        {/* Day headers */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5,1fr)', background: 'linear-gradient(135deg,#0284c7,#06b6d4)' }}>
          {HEBREW_DAYS_SHORT.slice(0, 5).map((d) => (
            <div key={d} className="text-center font-black py-2.5" style={{ color: 'white', fontSize: 13, letterSpacing: 1 }}>
              {d}
            </div>
          ))}
        </div>

        {/* Weeks */}
        <div style={{ flex: 1, minHeight: 0, display: 'flex', flexDirection: 'column' }}>
          {grid.map((week, wi) => {
            const bars = getWeekMultiDayBars(multiDayActivities, week);

            return (
              <div
                key={wi}
                style={{
                  flex: 1,
                  minHeight: 0,
                  display: 'flex',
                  flexDirection: 'column',
                  borderBottom: wi < grid.length - 1 ? '1.5px solid #bae6fd' : 'none',
                }}
              >
                {/* Multi-day bars strip */}
                {bars.length > 0 && (
                  <div
                    style={{
                      display: 'grid',
                      gridTemplateColumns: 'repeat(5,1fr)',
                      gridAutoRows: '14px',
                      gap: '2px 0',
                      padding: '2px 0',
                      borderBottom: '1px solid #e0f2fe',
                    }}
                  >
                    {bars.map((bar, idx) => {
                      const { act, colStart, colEnd, isRealStart, isRealEnd } = bar;
                      // RTL: col1=right(Sun), col5=left(Thu)
                      // right edge = isRealStart, left edge = isRealEnd
                      const br = `${isRealEnd ? 4 : 0}px ${isRealStart ? 4 : 0}px ${isRealStart ? 4 : 0}px ${isRealEnd ? 4 : 0}px`;
                      return (
                        <button
                          key={`${act.id}-${wi}`}
                          onClick={(e) => { e.stopPropagation(); onActivityClick(act); }}
                          title={act.title}
                          style={{
                            gridRow: idx + 1,
                            gridColumn: `${colStart} / ${colEnd + 1}`,
                            background: act.color,
                            borderRadius: br,
                            color: 'white',
                            fontSize: 9,
                            fontWeight: 800,
                            padding: '0 5px',
                            textAlign: 'right',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap',
                            lineHeight: '14px',
                            boxShadow: `0 1px 3px ${act.color}55`,
                            // flatten edges that connect to adjacent weeks
                            marginLeft: isRealEnd ? 2 : 0,
                            marginRight: isRealStart ? 2 : 0,
                          }}
                        >
                          {isRealStart ? act.title : ''}
                        </button>
                      );
                    })}
                  </div>
                )}

                {/* Day cells */}
                <div
                  style={{
                    flex: 1,
                    minHeight: 0,
                    display: 'grid',
                    gridTemplateColumns: 'repeat(5,1fr)',
                    overflow: 'hidden',
                  }}
                >
                  {week.map((day, di) => {
                    if (!day) {
                      return (
                        <div key={di} style={{
                          borderRight: di < 4 ? '1px solid #e0f2fe' : 'none',
                          background: '#f8fbff',
                        }} />
                      );
                    }

                    const dayActivities = activitiesForDay(singleDayActivities, day);
                    const isToday = isTodayDate(day);
                    const isCurrentMonth = day.getMonth() === month;
                    const todayMidnight = new Date(); todayMidnight.setHours(0,0,0,0);
                    const dayMidnight = new Date(day); dayMidnight.setHours(0,0,0,0);
                    const isPast = isCurrentMonth && !isToday && dayMidnight < todayMidnight;
                    const visible = dayActivities.slice(0, 3);
                    const extra = dayActivities.length - 3;
                    const hasActivities = dayActivities.length > 0;
                    const IllustrationComp = !hasActivities ? getCellIllustration(day.getDate(), di) : null;

                    return (
                      <div
                        key={di}
                        onClick={() => onDayClick(day)}
                        style={{
                          borderRight: di < 4 ? '1px solid #e0f2fe' : 'none',
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
                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: 2 }}>
                          <span
                            style={{
                              width: 22, height: 22,
                              display: 'flex', alignItems: 'center', justifyContent: 'center',
                              borderRadius: '50%',
                              fontSize: isPast ? 9 : 11, fontWeight: 900, flexShrink: 0,
                              position: 'relative',
                              background: isToday ? 'linear-gradient(135deg,#0284c7,#06b6d4)' : isPast ? '#dcfce7' : 'transparent',
                              color: isToday ? 'white' : isPast ? '#15803d' : '#0369a1',
                              boxShadow: isToday ? '0 2px 8px rgba(2,132,199,0.5)' : 'none',
                              border: isToday ? 'none' : isPast ? '1.5px solid #86efac' : '1.5px solid #e0f2fe',
                            }}
                          >
                            {isPast ? '✓' : day.getDate()}
                          </span>
                          {isToday && (
                            <span style={{ fontSize: 7, fontWeight: 900, color: '#0284c7', lineHeight: 1, marginTop: 1 }}>היום</span>
                          )}
                        </div>

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
                          <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: 0.35, padding: '2px' }}>
                            <IllustrationComp />
                          </div>
                        ) : null}
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
