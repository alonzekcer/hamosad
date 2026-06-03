export const HEBREW_MONTHS = [
  'ינואר', 'פברואר', 'מרץ', 'אפריל', 'מאי', 'יוני',
  'יולי', 'אוגוסט', 'ספטמבר', 'אוקטובר', 'נובמבר', 'דצמבר',
];

export const HEBREW_DAYS_SHORT = ['א', 'ב', 'ג', 'ד', 'ה', 'ו', 'ש'];
export const HEBREW_DAYS_FULL = ['ראשון', 'שני', 'שלישי', 'רביעי', 'חמישי', 'שישי', 'שבת'];

export const ACTIVITY_COLORS = [
  '#f59e0b', // שיא
  '#8b5cf6', // בתוך המועדון
  '#22c55e', // מחוץ למועדון
  '#38bdf8', // בריכה
];

export const ACTIVITY_COLOR_LABELS: Record<string, string> = {
  '#f59e0b': '🏆 שיא',
  '#8b5cf6': '🏠 מועדון',
  '#22c55e': '🌳 חוץ מועדון',
  '#38bdf8': '🏊 בריכה',
};

export const CLIENT_ID_KEY = 'hamosad_client_id';
export const GUIDE_CODE = process.env.NEXT_PUBLIC_GUIDE_CODE ?? 'hamosad2026';
