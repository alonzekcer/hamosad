import { getMonthGrid, activitiesForDay, isMultiDayActivity } from './calendarUtils';
import { HEBREW_MONTHS } from './constants';
import type { Activity } from '@/types';

const SUMMER_YEAR = 2026;
const SUMMER_MONTHS = [5, 6, 7];

const COLOR_LABELS: Record<string, string> = {
  '#f59e0b': 'שיא',
  '#8b5cf6': 'מועדון',
  '#22c55e': 'חוץ מועדון',
  '#38bdf8': 'בריכה',
  '#1d4ed8': 'שומר צעיר',
};

interface WeekBar {
  act: Activity;
  colStart: number;
  colEnd: number;
  isRealStart: boolean;
  isRealEnd: boolean;
}

function getWeekBars(multiDayActs: Activity[], week: (Date | null)[]): WeekBar[] {
  const realDays = week.filter(Boolean) as Date[];
  if (realDays.length === 0) return [];
  const firstDay = realDays[0];
  const weekSun = new Date(firstDay);
  weekSun.setDate(firstDay.getDate() - firstDay.getDay());
  weekSun.setHours(0, 0, 0, 0);
  const weekThu = new Date(weekSun);
  weekThu.setDate(weekSun.getDate() + 4);
  weekThu.setHours(0, 0, 0, 0);

  return multiDayActs
    .filter((act) => {
      const s = new Date(act.start_time); s.setHours(0, 0, 0, 0);
      const e = new Date(act.end_time); e.setHours(0, 0, 0, 0);
      return s <= weekThu && e >= weekSun;
    })
    .map((act) => {
      const actStart = new Date(act.start_time); actStart.setHours(0, 0, 0, 0);
      const actEnd = new Date(act.end_time); actEnd.setHours(0, 0, 0, 0);
      const cs = actStart < weekSun ? weekSun : actStart;
      const ce = actEnd > weekThu ? weekThu : actEnd;
      return {
        act,
        colStart: cs.getDay() + 1,
        colEnd: ce.getDay() + 1,
        isRealStart: actStart.getTime() === cs.getTime(),
        isRealEnd: actEnd.getTime() === ce.getTime(),
      };
    });
}

function buildMonthHTML(month: number, year: number, activities: Activity[]): string {
  const grid = getMonthGrid(year, month);
  const dayNames = ['ראשון', 'שני', 'שלישי', 'רביעי', 'חמישי'];

  const singleDayActs = activities.filter((a) => !isMultiDayActivity(a));
  const multiDayActs = activities.filter(isMultiDayActivity);

  const weeksHTML = grid.map((week, wi) => {
    const bars = getWeekBars(multiDayActs, week);

    const multiDayStrip = bars.length > 0 ? `
      <div style="display:grid;grid-template-columns:repeat(5,1fr);grid-auto-rows:18px;gap:2px 0;padding:2px 0;border-bottom:1px solid #e0f2fe;flex-shrink:0;">
        ${bars.map((bar, idx) => {
          const { act, colStart, colEnd, isRealStart, isRealEnd } = bar;
          const br = `${isRealEnd ? 4 : 0}px ${isRealStart ? 4 : 0}px ${isRealStart ? 4 : 0}px ${isRealEnd ? 4 : 0}px`;
          const ml = isRealEnd ? 2 : 0;
          const mr = isRealStart ? 2 : 0;
          return `<div style="grid-row:${idx + 1};grid-column:${colStart}/${colEnd + 1};background:${act.color};border-radius:${br};color:white;font-size:9px;font-weight:800;overflow:hidden;margin-left:${ml}px;margin-right:${mr}px;display:flex;align-items:center;justify-content:center;">
            <span style="overflow:hidden;text-overflow:ellipsis;white-space:nowrap;padding:0 6px;">${act.title}</span>
          </div>`;
        }).join('')}
      </div>` : '';

    const cells = week.map((day, di) => {
      if (!day) {
        return `<div style="border-right:${di < 4 ? '1px solid #e0f2fe' : 'none'};background:#f8fbff;"></div>`;
      }
      const dayActs = activitiesForDay(singleDayActs, day);
      const isCurrentMonth = day.getMonth() === month;
      const chips = dayActs.slice(0, 3).map((a) => `
        <div style="background:${a.color};color:white;border-radius:5px;margin-bottom:3px;display:flex;align-items:center;justify-content:center;min-height:26px;padding:3px 5px;box-sizing:border-box;">
          <div style="font-size:10px;font-weight:700;line-height:1.3;word-break:break-word;white-space:normal;text-align:center;width:100%;">${a.title}</div>
        </div>`).join('');
      const extra = dayActs.length > 3 ? `<div style="font-size:9px;color:#0284c7;font-weight:800;">+${dayActs.length - 3}</div>` : '';
      return `
        <div style="border-right:${di < 4 ? '1px solid #e0f2fe' : 'none'};background:white;padding:4px 3px;opacity:${isCurrentMonth ? 1 : 0.2};overflow:hidden;display:flex;flex-direction:column;">
          <div style="font-size:12px;font-weight:800;color:#0369a1;margin-bottom:3px;text-align:right;">${day.getDate()}</div>
          ${chips}${extra}
        </div>`;
    }).join('');

    return `
      <div style="flex:1;display:flex;flex-direction:column;border-bottom:${wi < grid.length - 1 ? '1.5px solid #bae6fd' : 'none'};">
        ${multiDayStrip}
        <div style="flex:1;display:grid;grid-template-columns:repeat(5,1fr);overflow:hidden;">
          ${cells}
        </div>
      </div>`;
  }).join('');

  const legend = Object.entries(COLOR_LABELS).map(([c, l]) => `
    <div style="display:flex;align-items:center;gap:5px;">
      <div style="width:11px;height:11px;border-radius:50%;background:${c};flex-shrink:0;"></div>
      <span style="font-size:11px;color:#0369a1;font-weight:600;">${l}</span>
    </div>`).join('');

  const dayHeaders = dayNames.map((d, i) => `
    <div style="text-align:center;color:white;font-weight:700;padding:8px 4px;font-size:13px;border-right:${i < 4 ? '1px solid rgba(255,255,255,0.2)' : 'none'};">${d}</div>`
  ).join('');

  return `
    <div style="width:1060px;height:750px;background:white;direction:rtl;font-family:Arial,Helvetica,sans-serif;display:flex;flex-direction:column;overflow:hidden;">
      <div style="background:linear-gradient(135deg,#0284c7,#06b6d4);padding:14px 24px;display:flex;justify-content:space-between;align-items:center;flex-shrink:0;">
        <div style="color:rgba(255,255,255,0.8);font-size:12px;">מועדון מוסד — תוכנית פעילויות חופש גדול</div>
        <div style="color:white;font-size:26px;font-weight:900;letter-spacing:1px;">${HEBREW_MONTHS[month]} ${year} 🌊</div>
        <div style="display:flex;gap:14px;">${legend}</div>
      </div>
      <div style="display:grid;grid-template-columns:repeat(5,1fr);background:#0369a1;flex-shrink:0;">
        ${dayHeaders}
      </div>
      <div style="flex:1;border:2px solid #bae6fd;border-top:none;overflow:hidden;display:flex;flex-direction:column;">
        ${weeksHTML}
      </div>
    </div>`;
}

export async function exportCalendarPDF(
  fetchActivitiesFn: (start: Date, end: Date) => Promise<Activity[]>,
  onProgress?: (exporting: boolean) => void
): Promise<void> {
  onProgress?.(true);
  try {
    const [{ default: jsPDF }, { default: html2canvas }] = await Promise.all([
      import('jspdf'),
      import('html2canvas'),
    ]);

    const monthsData = await Promise.all(
      SUMMER_MONTHS.map(async (m) => {
        const start = new Date(SUMMER_YEAR, m, 1, 0, 0, 0);
        const end = new Date(SUMMER_YEAR, m + 1, 0, 23, 59, 59);
        const activities = await fetchActivitiesFn(start, end);
        return { month: m, activities };
      })
    );

    const pdf = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' });

    for (let i = 0; i < monthsData.length; i++) {
      const { month, activities } = monthsData[i];
      const wrapper = document.createElement('div');
      wrapper.style.cssText = 'position:fixed;top:-9999px;left:-9999px;width:1060px;height:750px;background:white;';
      wrapper.innerHTML = buildMonthHTML(month, SUMMER_YEAR, activities);
      document.body.appendChild(wrapper);
      await new Promise((r) => setTimeout(r, 80));
      const canvas = await html2canvas(wrapper, { scale: 2, useCORS: true, backgroundColor: '#ffffff', logging: false, width: 1060, height: 750 });
      document.body.removeChild(wrapper);
      if (i > 0) pdf.addPage();
      pdf.addImage(canvas.toDataURL('image/jpeg', 0.95), 'JPEG', 0, 0, 297, 210);
    }

    pdf.save('תוכנית-חופש-גדול-מועדון-מוסד.pdf');
  } finally {
    onProgress?.(false);
  }
}
