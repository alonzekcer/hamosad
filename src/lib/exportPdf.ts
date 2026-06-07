import { getMonthGrid, activitiesForDay, formatTimeHebrew } from './calendarUtils';
import { HEBREW_MONTHS } from './constants';
import type { Activity } from '@/types';

const SUMMER_YEAR = 2026;
const SUMMER_MONTHS = [5, 6, 7];

const COLOR_LABELS: Record<string, string> = {
  '#f59e0b': 'שיא',
  '#8b5cf6': 'מועדון',
  '#22c55e': 'חוץ מועדון',
  '#38bdf8': 'בריכה',
};

function buildMonthHTML(month: number, year: number, activities: Activity[]): string {
  const grid = getMonthGrid(year, month);
  const dayNames = ['ראשון', 'שני', 'שלישי', 'רביעי', 'חמישי'];
  const rowH = Math.floor(490 / 6);

  const rows = grid.map((week) => {
    const cells = week.map((day, di) => {
      if (!day) return `<td style="border-right:${di < 4 ? '1px solid #bae6fd' : 'none'};background:#f0f9ff;"></td>`;
      const acts = activitiesForDay(activities, day);
      const isCurrentMonth = day.getMonth() === month;
      const chips = acts.slice(0, 3).map((a) => `
        <div style="background:${a.color};color:white;border-radius:5px;padding:3px 6px;margin-bottom:3px;direction:rtl;">
          <div style="font-size:11px;font-weight:700;line-height:1.3;word-break:break-word;">${a.title}</div>
          <div style="font-size:10px;opacity:0.9;line-height:1.2;">${formatTimeHebrew(a.start_time)}–${formatTimeHebrew(a.end_time)}</div>
        </div>`).join('');
      const extra = acts.length > 3 ? `<div style="font-size:10px;color:#0284c7;font-weight:700;padding-right:2px;">+${acts.length - 3} עוד</div>` : '';
      return `
        <td style="border-right:${di < 4 ? '1px solid #bae6fd' : 'none'};background:white;padding:5px 4px;vertical-align:top;opacity:${isCurrentMonth ? 1 : 0.25};overflow:hidden;height:${rowH}px;">
          <div style="font-size:13px;font-weight:800;color:#0369a1;margin-bottom:4px;text-align:right;">${day.getDate()}</div>
          ${chips}${extra}
        </td>`;
    }).join('');
    return `<tr style="height:${rowH}px;">${cells}</tr>`;
  }).join('');

  const legend = Object.entries(COLOR_LABELS).map(([c, l]) => `
    <div style="display:flex;align-items:center;gap:5px;">
      <div style="width:11px;height:11px;border-radius:50%;background:${c};flex-shrink:0;"></div>
      <span style="font-size:11px;color:#0369a1;font-weight:600;">${l}</span>
    </div>`).join('');

  return `
    <div style="width:1060px;height:750px;background:white;direction:rtl;font-family:Arial,Helvetica,sans-serif;display:flex;flex-direction:column;overflow:hidden;">
      <div style="background:linear-gradient(135deg,#0284c7,#06b6d4);padding:14px 24px;display:flex;justify-content:space-between;align-items:center;flex-shrink:0;">
        <div style="color:rgba(255,255,255,0.8);font-size:12px;">מועדון מוסד — תוכנית פעילויות חופש גדול</div>
        <div style="color:white;font-size:26px;font-weight:900;letter-spacing:1px;">${HEBREW_MONTHS[month]} ${year} 🌊</div>
        <div style="display:flex;gap:14px;">${legend}</div>
      </div>
      <table style="width:100%;border-collapse:collapse;flex-shrink:0;">
        <tr style="background:#0369a1;">
          ${dayNames.map((d, i) => `<th style="text-align:center;color:white;font-weight:700;padding:8px 4px;font-size:13px;border-right:${i < 4 ? '1px solid rgba(255,255,255,0.2)' : 'none'};width:20%;">${d}</th>`).join('')}
        </tr>
      </table>
      <div style="flex:1;border:2px solid #bae6fd;border-top:none;overflow:hidden;">
        <table style="width:100%;height:100%;border-collapse:collapse;table-layout:fixed;">
          <colgroup>${[0,1,2,3,4].map(() => '<col style="width:20%">').join('')}</colgroup>
          <tbody>${rows}</tbody>
        </table>
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
