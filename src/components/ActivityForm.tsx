'use client';

import { useState } from 'react';
import { ACTIVITY_COLORS, HEBREW_MONTHS } from '@/lib/constants';
import type { Activity, Group } from '@/types';

interface ActivityFormProps {
  initial?: Partial<Activity>;
  groups: Group[];
  profileId: string;
  onSave: (data: Omit<Activity, 'id' | 'created_at'>) => Promise<void>;
  onCancel: () => void;
}

const pad = (n: number) => String(n).padStart(2, '0');

function getTimeStr(iso: string): string {
  const d = new Date(iso);
  return `${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

function combineDateTime(baseIso: string, timeStr: string): string {
  const base = new Date(baseIso);
  const [h, m] = timeStr.split(':').map(Number);
  base.setHours(h, m, 0, 0);
  return base.toISOString();
}

interface TimePickerProps {
  label: string;
  value: string;
  onChange: (v: string) => void;
}

function TimePicker({ label, value, onChange }: TimePickerProps) {
  const [h, m] = value.split(':').map(Number);

  function changeHour(delta: number) {
    const newH = Math.max(6, Math.min(23, h + delta));
    onChange(`${pad(newH)}:${pad(m)}`);
  }

  function setMinute(mins: number) {
    onChange(`${pad(h)}:${pad(mins)}`);
  }

  return (
    <div>
      <p className="text-xs font-semibold mb-2" style={{ color: '#64748b' }}>{label}</p>
      <div
        className="rounded-2xl p-3"
        style={{ background: '#f8fafc', border: '1.5px solid #e2e8f0' }}
      >
        {/* Hour control */}
        <div className="flex items-center justify-center gap-4 mb-3">
          <button
            type="button"
            onClick={() => changeHour(-1)}
            className="w-9 h-9 rounded-full flex items-center justify-center font-bold text-lg active:scale-95 transition-transform"
            style={{ background: '#e0f2fe', color: '#0284c7' }}
          >
            −
          </button>

          <span
            className="font-black tabular-nums text-center"
            style={{ fontSize: 30, color: '#0c4a6e', letterSpacing: 1, minWidth: 80 }}
          >
            {pad(h)}<span style={{ color: '#94a3b8' }}>:</span>{pad(m)}
          </span>

          <button
            type="button"
            onClick={() => changeHour(1)}
            className="w-9 h-9 rounded-full flex items-center justify-center font-bold text-lg active:scale-95 transition-transform"
            style={{ background: '#e0f2fe', color: '#0284c7' }}
          >
            +
          </button>
        </div>

        {/* Minute select */}
        <div className="flex gap-1.5">
          {[0, 15, 30, 45].map((mins) => (
            <button
              key={mins}
              type="button"
              onClick={() => setMinute(mins)}
              className="flex-1 py-1.5 rounded-xl text-xs font-bold transition-all active:scale-95"
              style={
                m === mins
                  ? { background: '#0284c7', color: 'white' }
                  : { background: 'white', color: '#64748b', border: '1.5px solid #e2e8f0' }
              }
            >
              :{pad(mins)}
            </button>
          ))}
        </div>
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
  const [selectedGroups, setSelectedGroups] = useState<string[]>(initial?.group_ids ?? []);
  const [color, setColor] = useState(initial?.color ?? ACTIVITY_COLORS[0]);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  function toggleGroup(id: string) {
    setSelectedGroups((prev) => prev.includes(id) ? prev.filter((g) => g !== id) : [...prev, id]);
  }

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
        group_ids: selectedGroups,
        color,
        created_by: profileId,
      });
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'שגיאה בשמירה');
      setSaving(false);
    }
  }

  const labelStyle = { color: '#64748b', fontSize: 12, fontWeight: 600 } as React.CSSProperties;
  const inputStyle = {
    border: '1.5px solid #e2e8f0',
    background: '#f8fafc',
    color: '#0c4a6e',
    borderRadius: 14,
    padding: '10px 14px',
    fontSize: 15,
    width: '100%',
    outline: 'none',
    fontFamily: 'inherit',
  } as React.CSSProperties;

  return (
    <div
      className="fixed inset-0 z-50 flex flex-col justify-end fade-in"
      style={{ background: 'rgba(15,23,42,0.4)' }}
      onClick={onCancel}
    >
      <div
        className="rounded-t-3xl slide-up flex flex-col bg-white"
        style={{ maxHeight: '90vh', boxShadow: '0 -4px 32px rgba(0,0,0,0.12)' }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Drag handle */}
        <div className="flex justify-center pt-3 pb-1">
          <div className="w-9 h-1 rounded-full" style={{ background: '#e2e8f0' }} />
        </div>

        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3" style={{ borderBottom: '1px solid #f1f5f9' }}>
          <div>
            <h2 className="font-black text-base" style={{ color: '#0c4a6e' }}>
              {initial?.id ? 'עריכת פעילות' : 'פעילות חדשה'}
            </h2>
            <p className="text-xs mt-0.5" style={{ color: '#94a3b8' }}>{dateLabel}</p>
          </div>
          <button
            onClick={onCancel}
            className="w-8 h-8 rounded-full flex items-center justify-center"
            style={{ background: '#f1f5f9', color: '#64748b' }}
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round">
              <path d="M18 6L6 18M6 6l12 12"/>
            </svg>
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="overflow-y-auto flex-1 px-5 py-4 flex flex-col gap-4">
          {/* Title */}
          <div>
            <label className="block mb-1.5" style={labelStyle}>שם הפעילות</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="שם הפעילות"
              autoFocus
              style={inputStyle}
            />
          </div>

          {/* Time pickers side by side */}
          <div className="grid grid-cols-2 gap-3">
            <TimePicker label="שעת התחלה" value={startTime} onChange={setStartTime} />
            <TimePicker label="שעת סיום" value={endTime} onChange={setEndTime} />
          </div>

          {/* Location */}
          <div>
            <label className="block mb-1.5" style={labelStyle}>מיקום</label>
            <input
              type="text"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="כתובת או שם המקום"
              style={inputStyle}
            />
          </div>

          {/* Description */}
          <div>
            <label className="block mb-1.5" style={labelStyle}>תיאור</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={2}
              placeholder="פרטים נוספים..."
              style={{ ...inputStyle, resize: 'none' }}
            />
          </div>

          {/* Groups */}
          {groups.length > 0 && (
            <div>
              <label className="block mb-1.5" style={labelStyle}>קבוצות</label>
              <div className="flex flex-wrap gap-2">
                {groups.map((g) => (
                  <button key={g.id} type="button" onClick={() => toggleGroup(g.id)}
                    className="px-3 py-1.5 rounded-full text-sm font-semibold border transition-all active:scale-95"
                    style={selectedGroups.includes(g.id)
                      ? { backgroundColor: g.color, borderColor: g.color, color: 'white' }
                      : { borderColor: '#e2e8f0', color: '#64748b', background: 'white' }}>
                    {g.name}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Color */}
          <div>
            <label className="block mb-1.5" style={labelStyle}>צבע בלוח</label>
            <div className="flex gap-2.5 flex-wrap">
              {ACTIVITY_COLORS.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setColor(c)}
                  className="w-8 h-8 rounded-full transition-all active:scale-90"
                  style={{
                    backgroundColor: c,
                    outline: color === c ? `3px solid ${c}` : 'none',
                    outlineOffset: 2,
                    transform: color === c ? 'scale(1.15)' : 'scale(1)',
                  }}
                />
              ))}
            </div>
          </div>

          {error && (
            <p className="text-sm rounded-xl px-4 py-2.5" style={{ background: '#fef2f2', color: '#ef4444', border: '1px solid #fecaca' }}>
              {error}
            </p>
          )}
        </form>

        {/* Save button */}
        <div className="px-5 pb-8 pt-3" style={{ borderTop: '1px solid #f1f5f9' }}>
          <button
            onClick={handleSubmit}
            disabled={saving}
            className="w-full py-3.5 rounded-2xl font-black text-white text-base active:scale-[0.98] transition-all disabled:opacity-50"
            style={{ background: saving ? '#94a3b8' : 'linear-gradient(135deg,#0284c7,#06b6d4)' }}
          >
            {saving ? 'שומר...' : initial?.id ? 'שמור שינויים' : 'הוסף פעילות'}
          </button>
        </div>
      </div>
    </div>
  );
}
