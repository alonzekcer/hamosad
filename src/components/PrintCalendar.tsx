'use client';

import { getMonthGrid, activitiesForDay, formatTimeHebrew } from '@/lib/calendarUtils';
import { HEBREW_MONTHS, HEBREW_DAYS_FULL } from '@/lib/constants';
import type { Activity } from '@/types';

interface PrintCalendarProps {
  months: { month: number; year: number; activities: Activity[] }[];
}

const SUMMER_MONTHS_RANGE = [5, 6, 7]; // June, July, August

export default function PrintCalendar({ months }: PrintCalendarProps) {
  return (
    <div id="print-calendar" style={{ fontFamily: "'Heebo', Arial, sans-serif", direction: 'rtl', padding: '20px' }}>
      {months.map(({ month, year, activities }) => {
        const grid = getMonthGrid(year, month);
        return (
          <div key={month} style={{ pageBreakAfter: 'always', marginBottom: 40 }}>
            {/* Month title */}
            <div style={{ textAlign: 'center', marginBottom: 16, borderBottom: '3px solid #0284c7', paddingBottom: 8 }}>
              <h1 style={{ fontSize: 28, fontWeight: 900, color: '#0284c7', margin: 0 }}>
                {HEBREW_MONTHS[month]} {year}
              </h1>
              <p style={{ fontSize: 12, color: '#38bdf8', margin: '4px 0 0' }}>המוסד — תוכנית פעילויות קיץ</p>
            </div>

            {/* Day headers */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', background: '#0284c7', borderRadius: '8px 8px 0 0' }}>
              {HEBREW_DAYS_FULL.map((d) => (
                <div key={d} style={{ textAlign: 'center', color: 'white', fontWeight: 700, padding: '8px 4px', fontSize: 12 }}>
                  {d}
                </div>
              ))}
            </div>

            {/* Calendar grid */}
            <div style={{ border: '2px solid #0284c7', borderTop: 'none', borderRadius: '0 0 8px 8px', overflow: 'hidden' }}>
              {grid.map((week, wi) => (
                <div key={wi} style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', borderBottom: wi < grid.length - 1 ? '1px solid #bae6fd' : 'none' }}>
                  {week.map((day, di) => {
                    if (!day) return <div key={di} style={{ borderRight: di < 6 ? '1px solid #bae6fd' : 'none', background: '#f8fbff', minHeight: 80 }} />;

                    const dayActivities = activitiesForDay(activities, day);
                    const isCurrentMonth = day.getMonth() === month;

                    return (
                      <div key={di} style={{
                        borderRight: di < 6 ? '1px solid #bae6fd' : 'none',
                        background: 'white',
                        minHeight: 80,
                        padding: 4,
                        opacity: isCurrentMonth ? 1 : 0.3,
                      }}>
                        {/* Day number */}
                        <div style={{ textAlign: 'left', fontSize: 11, fontWeight: 700, color: '#0369a1', marginBottom: 3 }}>
                          {day.getDate()}
                        </div>
                        {/* Activities */}
                        {dayActivities.map((act) => (
                          <div key={act.id} style={{
                            background: act.color,
                            color: 'white',
                            borderRadius: 3,
                            padding: '2px 4px',
                            marginBottom: 2,
                            fontSize: 9,
                            fontWeight: 600,
                            lineHeight: 1.4,
                          }}>
                            <div style={{ fontWeight: 700 }}>{act.title}</div>
                            <div style={{ opacity: 0.9 }}>
                              {formatTimeHebrew(act.start_time)}–{formatTimeHebrew(act.end_time)}
                              {act.location ? ` • ${act.location}` : ''}
                            </div>
                          </div>
                        ))}
                      </div>
                    );
                  })}
                </div>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}
