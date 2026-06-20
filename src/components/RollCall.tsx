'use client';

import { useEffect, useState } from 'react';
import { fetchActivityPresence, upsertPresence, fetchApprovedYouth } from '@/lib/db';
import type { Profile } from '@/types';
import { GRADES } from '@/types';

interface RollCallProps {
  activityId: string;
  activityTitle: string;
  markedBy: string;
  onClose: () => void;
}

export default function RollCall({ activityId, activityTitle, markedBy, onClose }: RollCallProps) {
  const [youth, setYouth] = useState<Profile[]>([]);
  const [presence, setPresence] = useState<Record<string, boolean | null>>({});
  const [saving, setSaving] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [gradeFilter, setGradeFilter] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      const [profiles, presenceData] = await Promise.all([
        fetchApprovedYouth(),
        fetchActivityPresence(activityId),
      ]);
      setYouth(profiles);
      const map: Record<string, boolean | null> = {};
      for (const p of profiles) map[p.id] = null;
      for (const p of presenceData) map[p.profile_id] = p.present;
      setPresence(map);
      setLoading(false);
    }
    load();
  }, [activityId]);

  async function toggle(profileId: string, current: boolean | null) {
    const next = current !== true;
    setSaving(profileId);
    try {
      await upsertPresence(activityId, profileId, next, markedBy);
      setPresence((prev) => ({ ...prev, [profileId]: next }));
    } finally {
      setSaving(null);
    }
  }

  const gradesPresent = GRADES.filter((g) => youth.some((y) => y.grade === g));
  const filtered = gradeFilter ? youth.filter((y) => y.grade === gradeFilter) : youth;
  const presentCount = Object.values(presence).filter((v) => v === true).length;
  const markedCount = Object.values(presence).filter((v) => v !== null).length;

  return (
    <div className="fixed inset-0 z-[60] flex flex-col bg-white" dir="rtl">
      {/* Header */}
      <div style={{ background: 'linear-gradient(135deg,#0284c7,#06b6d4)' }} className="px-4 pt-12 pb-3 shrink-0">
        <div className="flex items-center gap-3 mb-2">
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center text-white active:bg-white/30 shrink-0"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
          <div className="flex-1 min-w-0">
            <div className="text-white font-black text-base truncate">📋 קריאת שמות</div>
            <div className="text-white/70 text-xs truncate">{activityTitle}</div>
          </div>
        </div>

        {/* Counters */}
        <div className="flex gap-2">
          <div className="bg-white/20 rounded-xl px-3 py-1.5 text-center flex-1">
            <span className="text-white font-black text-lg">{presentCount}</span>
            <span className="text-white/70 text-xs mr-1">נוכחים</span>
          </div>
          <div className="bg-white/20 rounded-xl px-3 py-1.5 text-center flex-1">
            <span className="text-white font-black text-lg">{markedCount}</span>
            <span className="text-white/70 text-xs mr-1">סומנו</span>
          </div>
          <div className="bg-white/20 rounded-xl px-3 py-1.5 text-center flex-1">
            <span className="text-white font-black text-lg">{youth.length - markedCount}</span>
            <span className="text-white/70 text-xs mr-1">ממתינים</span>
          </div>
        </div>
      </div>

      {/* Grade filter */}
      {gradesPresent.length > 1 && (
        <div className="flex gap-1.5 px-4 py-2.5 overflow-x-auto shrink-0" style={{ borderBottom: '1px solid #e0f2fe', background: 'white' }}>
          <button
            onClick={() => setGradeFilter(null)}
            className="px-3 py-1 rounded-xl text-xs font-black shrink-0 transition-all"
            style={!gradeFilter ? { background: '#0284c7', color: 'white' } : { background: '#f0f9ff', color: '#0369a1', border: '1px solid #bae6fd' }}
          >
            הכל
          </button>
          {gradesPresent.map((g) => (
            <button
              key={g}
              onClick={() => setGradeFilter(gradeFilter === g ? null : g)}
              className="px-3 py-1 rounded-xl text-xs font-black shrink-0 transition-all"
              style={gradeFilter === g ? { background: '#0284c7', color: 'white' } : { background: '#f0f9ff', color: '#0369a1', border: '1px solid #bae6fd' }}
            >
              כיתה {g}
            </button>
          ))}
        </div>
      )}

      {/* Youth list */}
      <div className="flex-1 overflow-y-auto px-4 py-3 flex flex-col gap-2" style={{ background: '#f8fafc' }}>
        {loading ? (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-4xl animate-bounce">🌊</div>
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-16 font-bold" style={{ color: '#38bdf8' }}>אין נערים</div>
        ) : filtered.map((y) => {
          const status = presence[y.id] ?? null;
          const isSaving = saving === y.id;
          const bgColor = status === true ? '#f0fdf4' : status === false ? '#fef2f2' : 'white';
          const borderColor = status === true ? '#86efac' : status === false ? '#fca5a5' : '#e0f2fe';
          const avatarBg = status === true ? '#22c55e' : status === false ? '#ef4444' : '#94a3b8';

          return (
            <button
              key={y.id}
              onClick={() => toggle(y.id, status)}
              disabled={isSaving}
              className="flex items-center gap-3 w-full px-4 py-3 rounded-2xl text-right transition-all active:scale-[0.98] disabled:opacity-60"
              style={{ background: bgColor, border: `2px solid ${borderColor}` }}
            >
              <div
                className="w-11 h-11 rounded-full flex items-center justify-center text-white font-black shrink-0 text-lg transition-all"
                style={{ background: avatarBg }}
              >
                {isSaving ? '⋯' : status === true ? '✓' : status === false ? '✗' : y.full_name[0]}
              </div>
              <div className="flex-1 text-right">
                <div className="font-black" style={{ color: '#0c4a6e' }}>{y.full_name}</div>
                {y.grade && <div className="text-xs font-bold" style={{ color: '#38bdf8' }}>כיתה {y.grade}</div>}
              </div>
              <div
                className="text-sm font-black shrink-0 px-3 py-1.5 rounded-xl transition-all"
                style={{
                  background: status === true ? '#dcfce7' : status === false ? '#fee2e2' : '#f1f5f9',
                  color: status === true ? '#16a34a' : status === false ? '#dc2626' : '#64748b',
                }}
              >
                {status === true ? 'נוכח' : status === false ? 'נעדר' : 'סמן'}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
