'use client';

import { useState } from 'react';
import { ACTIVITY_COLORS, ACTIVITY_COLOR_LABELS, HEBREW_MONTHS } from '@/lib/constants';
import type { Activity, Group } from '@/types';

interface ActivityFormProps {
  initial?: Partial<Activity>;
  groups: Group[];
  profileId: string;
  onSave: (data: Omit<Activity, 'id' | 'created_at'>) => Promise<void>;
  onCancel: () => void;
}

const pad = (n: number) => String(n).padStart(2, '0');

function getTimeStr(iso: string) {
  const d = new Date(iso);
  return `${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

function combineDateTime(baseIso: string, timeStr: string): string {
  const base = new Date(baseIso);
  const [h, m] = timeStr.split(':').map(Number);
  base.setHours(h, m, 0, 0);
  return base.toISOString();
}

function CompactTimePicker({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
  const [h, m] = value.split(':').map(Number);

  const setH = (delta: number) => {
    const newH = Math.max(6, Math.min(23, h + delta));
    onChange(`${pad(newH)}:${pad(m)}`);
  };
  const setM = (mins: number) => onChange(`${pad(h)}:${pad(mins)}`);

  return (
    <div className="flex flex-col items-center gap-1.5">
      <span style={{ fontSize: 10, fontWeight: 700, color: '#94a3b8', letterSpacing: 0.5 }}>{label}</span>

      <div className="flex items-center gap-2">
        <button type="button" onClick={() => setH(-1)}
          className="w-7 h-7 rounded-full flex items-center justify-center font-bold active:scale-90 transition-transform"
          style={{ background: '#e0f2fe', color: '#0284c7', fontSize: 17 }}>−</button>

        <span style={{ fontSize: 24, fontWeight: 900, color: '#0c4a6e', minWidth: 58, textAlign: 'center', letterSpacing: 1 }}>
          {pad(h)}<span style={{ color: '#cbd5e1' }}>:</span>{pad(m)}
        </span>

        <button type="button" onClick={() => setH(1)}
          className="w-7 h-7 rounded-full flex items-center justify-center font-bold active:scale-90 transition-transform"
          style={{ background: '#e0f2fe', color: '#0284c7', fontSize: 17 }}>+</button>
      </div>

      <div className="flex gap-1 w-full">
        {[0, 15, 30, 45].map((mins) => (
          <button key={mins} type="button" onClick={() => setM(mins)}
            className="flex-1 rounded-lg font-bold active:scale-95 transition-all"
            style={{
              fontSize: 10, padding: '3px 0',
              background: m === mins ? '#0284c7' : 'white',
              color: m === mins ? 'white' : '#94a3b8',
              border: m === mins ? 'none' : '1px solid #e2e8f0',
            }}>
            :{pad(mins)}
          </button>
        ))}
      </div>
    </div>
  );
}

export default function ActivityForm({ initial, groups, profileId, onSave, onCancel }: ActivityFormProps) {
  const baseDateIso = initial?.start_time ?? new Date().toISOString();
  const baseDate = new Date(baseDateIso);
  const dateLabel = `${baseDate.getDate()} ${HEBREW_MONTHS[baseDate.getMonth()]}`;

  const [title, setTitle] = useState(initial?.title ?? '');
  const [description, setDescription] = useState(initial?.description ?? '');
  const [startTime, setStartTime] = useState(initial?.start_time ? getTimeStr(initial.start_time) : '09:00');
  const [endTime, setEndTime] = useState(initial?.end_time ? getTimeStr(initial.end_time) : '11:00');
  const [location, setLocation] = useState(initial?.location ?? '');
  const [color, setColor] = useState(initial?.color ?? ACTIVITY_COLORS[0]);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim()) { setError('יש למלא שם פעילות'); return; }
    const startIso = combineDateTime(baseDateIso, startTime);
    const endIso = combineDateTime(baseDateIso, endTime);
    if (new Date(startIso) >= new Date(endIso)) { setError('שעת הסיום חייבת להיות אחרי ההתחלה'); return; }
    setSaving(true); setError('');
    try {
      await onSave({
        title: title.trim(),
        description: description.trim() || null,
        start_time: startIso,
        end_time: endIso,
        location: location.trim() || null,
        group_ids: [],
        color,
        created_by: profileId,
      });
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'שגיאה בשמירה');
      setSaving(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex flex-col justify-end fade-in"
      style={{ background: 'rgba(15,23,42,0.45)' }} onClick={onCancel}>
      <div className="rounded-t-3xl slide-up flex flex-col bg-white"
        style={{ maxHeight: '85vh', boxShadow: '0 -4px 24px rgba(0,0,0,0.14)' }}
        onClick={(e) => e.stopPropagation()}>

        {/* Handle */}
        <div className="flex justify-center pt-2.5 pb-1">
          <div className="w-8 h-1 rounded-full" style={{ background: '#e2e8f0' }} />
        </div>

        {/* Header */}
        <div className="flex items-center justify-between px-4 py-2" style={{ borderBottom: '1px solid #f1f5f9' }}>
          <div>
            <h2 className="font-black text-sm" style={{ color: '#0c4a6e' }}>
              {initial?.id ? 'עריכה' : 'פעילות חדשה'}
            </h2>
            <p style={{ fontSize: 11, color: '#94a3b8' }}>{dateLabel}</p>
          </div>
          <button onClick={onCancel}
            className="w-7 h-7 rounded-full flex items-center justify-center"
            style={{ background: '#f1f5f9' }}>
            <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="#64748b" strokeWidth={2.5} strokeLinecap="round">
              <path d="M18 6L6 18M6 6l12 12"/>
            </svg>
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="overflow-y-auto flex-1 px-4 py-3 flex flex-col gap-3">

          {/* Title */}
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="שם הפעילות"
            autoFocus
            className="w-full font-semibold focus:outline-none"
            style={{
              border: '1.5px solid #e2e8f0', background: '#f8fafc',
              borderRadius: 12, padding: '9px 12px', fontSize: 14, color: '#0c4a6e',
              fontFamily: 'inherit',
            }}
          />

          {/* Times — side by side */}
          <div className="rounded-xl p-3" style={{ background: '#f8fafc', border: '1.5px solid #e2e8f0' }}>
            <div className="grid grid-cols-2 gap-3">
              <CompactTimePicker label="התחלה" value={startTime} onChange={setStartTime} />
              <CompactTimePicker label="סיום" value={endTime} onChange={setEndTime} />
            </div>
          </div>

          {/* Location — compact */}
          <div className="flex items-center gap-2 rounded-xl px-3 py-2.5"
            style={{ border: '1.5px solid #e2e8f0', background: '#f8fafc' }}>
            <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" strokeWidth={2}>
              <path d="M17.657 16.657L13.414 20.9a2 2 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/>
              <path d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/>
            </svg>
            <input
              type="text"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="מיקום (אופציונלי)"
              className="flex-1 focus:outline-none bg-transparent"
              style={{ fontSize: 13, color: '#0c4a6e', fontFamily: 'inherit' }}
            />
          </div>

          {/* Description — compact */}
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={2}
            placeholder="תיאור (אופציונלי)"
            className="w-full focus:outline-none resize-none"
            style={{
              border: '1.5px solid #e2e8f0', background: '#f8fafc',
              borderRadius: 12, padding: '9px 12px', fontSize: 13, color: '#0c4a6e',
              fontFamily: 'inherit',
            }}
          />

          {/* Activity type — compact 2x2 */}
          <div className="grid grid-cols-2 gap-1.5">
            {ACTIVITY_COLORS.map((c) => (
              <button key={c} type="button" onClick={() => setColor(c)}
                className="flex items-center gap-2 px-3 py-2 rounded-xl font-bold text-xs transition-all active:scale-95"
                style={color === c
                  ? { background: c, color: 'white', boxShadow: `0 2px 8px ${c}55` }
                  : { background: '#f8fafc', color: '#64748b', border: `1.5px solid ${c}66` }}>
                <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ background: c }} />
                {ACTIVITY_COLOR_LABELS[c]}
              </button>
            ))}
          </div>

          {error && (
            <p className="text-xs rounded-xl px-3 py-2"
              style={{ background: '#fef2f2', color: '#ef4444', border: '1px solid #fecaca' }}>
              {error}
            </p>
          )}
        </form>

        {/* Save */}
        <div className="px-4 pb-7 pt-2" style={{ borderTop: '1px solid #f1f5f9' }}>
          <button onClick={handleSubmit} disabled={saving}
            className="w-full py-3 rounded-2xl font-black text-white text-sm active:scale-[0.98] transition-all disabled:opacity-50"
            style={{ background: saving ? '#94a3b8' : 'linear-gradient(135deg,#0284c7,#06b6d4)' }}>
            {saving ? 'שומר...' : initial?.id ? 'שמור שינויים' : 'הוסף פעילות'}
          </button>
        </div>
      </div>
    </div>
  );
}
