'use client';

import { CalendarView } from '@/types';

interface NavBarProps {
  view: CalendarView;
  onViewChange: (v: CalendarView) => void;
}

const tabs: { label: string; emoji: string; value: CalendarView }[] = [
  { label: 'יום', emoji: '🏖️', value: 'day' },
  { label: 'חודש', emoji: '📅', value: 'month' },
];

export default function NavBar({ view, onViewChange }: NavBarProps) {
  return (
    <nav className="flex items-center px-2 py-2 gap-2" style={{ background: 'white', borderTop: '2px solid #bae6fd' }}>
      {tabs.map((t) => (
        <button
          key={t.value}
          onClick={() => onViewChange(t.value)}
          className="flex-1 py-2 rounded-2xl text-sm font-bold transition-all duration-200 flex flex-col items-center gap-0.5"
          style={
            view === t.value
              ? { background: 'linear-gradient(135deg, #0284c7, #06b6d4)', color: 'white' }
              : { color: '#38bdf8' }
          }
        >
          <span className="text-base">{t.emoji}</span>
          <span className="text-xs">{t.label}</span>
        </button>
      ))}
    </nav>
  );
}
