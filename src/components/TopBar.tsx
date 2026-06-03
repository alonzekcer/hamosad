'use client';

import { HEBREW_MONTHS } from '@/lib/constants';
import { CalendarView } from '@/types';
import Link from 'next/link';
import { clearClientId } from '@/lib/auth';
import { useRouter } from 'next/navigation';

interface TopBarProps {
  year: number;
  month: number;
  view: CalendarView;
  date?: Date;
  isGuide: boolean;
  canGoPrev: boolean;
  canGoNext: boolean;
  onPrev: () => void;
  onNext: () => void;
  onToday: () => void;
}

function formatWeekLabel(date: Date): string {
  const start = new Date(date);
  start.setDate(date.getDate() - date.getDay());
  const end = new Date(start);
  end.setDate(start.getDate() + 6);
  return `${start.getDate()}/${start.getMonth() + 1} – ${end.getDate()}/${end.getMonth() + 1}`;
}

function formatDayLabel(date: Date): string {
  const days = ['ראשון','שני','שלישי','רביעי','חמישי','שישי','שבת'];
  return `יום ${days[date.getDay()]}, ${date.getDate()} ${HEBREW_MONTHS[date.getMonth()]}`;
}

// Clean SVG line icons
function LogoutIcon() {
  return (
    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4"/>
      <polyline points="16,17 21,12 16,7"/>
      <line x1="21" y1="12" x2="9" y2="12"/>
    </svg>
  );
}

function AdminIcon() {
  return (
    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="3" y1="6" x2="21" y2="6"/>
      <line x1="3" y1="12" x2="15" y2="12"/>
      <line x1="3" y1="18" x2="18" y2="18"/>
    </svg>
  );
}

function ChevronRight() {
  return (
    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="9,18 15,12 9,6"/>
    </svg>
  );
}

function ChevronLeft() {
  return (
    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="15,18 9,12 15,6"/>
    </svg>
  );
}

export default function TopBar({ year, month, view, date, isGuide, canGoPrev, canGoNext, onPrev, onNext, onToday }: TopBarProps) {
  const router = useRouter();

  const label =
    view === 'month' ? `${HEBREW_MONTHS[month]} ${year}`
    : view === 'week' && date ? formatWeekLabel(date)
    : date ? formatDayLabel(date)
    : '';

  function handleLogout() {
    clearClientId();
    router.replace('/login');
  }

  return (
    <header
      className="flex items-center justify-between px-3 py-3"
      style={{ background: 'linear-gradient(135deg, #0284c7 0%, #06b6d4 100%)' }}
    >
      {/* Right: logout + admin */}
      <div className="flex items-center gap-2">
        <button
          onClick={handleLogout}
          className="w-9 h-9 rounded-full bg-white/20 flex items-center justify-center active:bg-white/30 transition-colors"
          title="התנתקות"
        >
          <LogoutIcon />
        </button>
        {isGuide && (
          <Link
            href="/admin"
            className="w-9 h-9 rounded-full bg-white/20 flex items-center justify-center active:bg-white/30 transition-colors"
          >
            <AdminIcon />
          </Link>
        )}
      </div>

      {/* Center: label */}
      <button onClick={onToday} className="flex flex-col items-center gap-0">
        <span className="text-white/80 text-xs font-semibold">מועדון מוסד - תוכנית חופש גדול 😎</span>
        <span className="text-white font-black text-lg leading-tight drop-shadow">
          {view === 'month' ? `${HEBREW_MONTHS[month]} ☀️` : label}
        </span>
        {view === 'month' && (
          <span className="text-white/60 text-xs font-semibold">{year}</span>
        )}
      </button>

      {/* Left: prev / next */}
      <div className="flex items-center gap-1">
        <button
          onClick={onPrev}
          disabled={!canGoPrev}
          className="w-9 h-9 rounded-full bg-white/20 flex items-center justify-center active:bg-white/30 transition-colors disabled:opacity-25"
        >
          <ChevronRight />
        </button>
        <button
          onClick={onNext}
          disabled={!canGoNext}
          className="w-9 h-9 rounded-full bg-white/20 flex items-center justify-center active:bg-white/30 transition-colors disabled:opacity-25"
        >
          <ChevronLeft />
        </button>
      </div>
    </header>
  );
}
