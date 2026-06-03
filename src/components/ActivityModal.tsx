'use client';

import { useEffect, useState } from 'react';
import { formatTimeHebrew } from '@/lib/calendarUtils';
import { HEBREW_DAYS_FULL, HEBREW_MONTHS } from '@/lib/constants';
import { toggleAttendance, fetchActivityAttendance } from '@/lib/db';
import type { Activity, Attendance, Profile } from '@/types';

type AttendanceStatus = 'confirmed' | 'cancelled';

interface ActivityModalProps {
  activity: Activity;
  profile: Profile;
  groups: { id: string; name: string; color: string }[];
  onClose: () => void;
  onEdit?: (a: Activity) => void;
  onDelete?: (id: string) => void;
}

export default function ActivityModal({ activity, profile, groups, onClose, onEdit, onDelete }: ActivityModalProps) {
  const [myAttendance, setMyAttendance] = useState<AttendanceStatus | null>(null);
  const [attendees, setAttendees] = useState<(Attendance & { profiles: Profile })[]>([]);
  const [loading, setLoading] = useState(false);
  const [showAttendees, setShowAttendees] = useState(false);

  const startDate = new Date(activity.start_time);
  const dayName = HEBREW_DAYS_FULL[startDate.getDay()];
  const dateLabel = `יום ${dayName}, ${startDate.getDate()} ${HEBREW_MONTHS[startDate.getMonth()]}`;
  const actGroups = groups.filter((g) => activity.group_ids.includes(g.id));

  useEffect(() => {
    fetchActivityAttendance(activity.id).then((data) => {
      setAttendees(data);
      const mine = data.find((a) => a.profile_id === profile.id);
      if (mine) setMyAttendance(mine.status as AttendanceStatus);
    });
  }, [activity.id, profile.id]);

  async function handleAttendance() {
    setLoading(true);
    try {
      await toggleAttendance(profile.id, activity.id, myAttendance);
      const updated = await fetchActivityAttendance(activity.id);
      setAttendees(updated);
      const mine = updated.find((a) => a.profile_id === profile.id);
      setMyAttendance(mine ? (mine.status as AttendanceStatus) : null);
    } finally {
      setLoading(false);
    }
  }

  const confirmedCount = attendees.filter((a) => a.status === 'confirmed').length;

  return (
    <div className="fixed inset-0 z-50 flex flex-col justify-end fade-in" style={{ background: 'rgba(2,64,120,0.45)' }} onClick={onClose}>
      <div className="rounded-t-3xl shadow-2xl slide-up max-h-[88vh] flex flex-col bg-white" onClick={(e) => e.stopPropagation()}>
        <div className="h-2 rounded-t-3xl" style={{ background: `linear-gradient(90deg, ${activity.color}, ${activity.color}88)` }} />
        <div className="flex justify-center pt-2 pb-1">
          <div className="w-10 h-1 rounded-full bg-gray-200" />
        </div>

        <div className="flex items-start justify-between px-5 pb-3">
          <div className="flex-1">
            <h2 className="text-xl font-black leading-tight" style={{ color: '#0c4a6e' }}>{activity.title}</h2>
            <p className="text-sm mt-0.5 font-medium" style={{ color: '#38bdf8' }}>{dateLabel}</p>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-full text-gray-400 hover:bg-gray-100">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="overflow-y-auto px-5 pb-4 flex-1">
          <div className="rounded-2xl p-4 mb-4 flex flex-col gap-3" style={{ background: '#f0f9ff', border: '1px solid #bae6fd' }}>
            <div className="flex items-center gap-3">
              <span className="text-xl">⏰</span>
              <span className="font-bold" style={{ color: '#0369a1' }}>{formatTimeHebrew(activity.start_time)} – {formatTimeHebrew(activity.end_time)}</span>
            </div>
            {activity.location && (
              <div className="flex items-center gap-3">
                <span className="text-xl">📍</span>
                <span className="font-medium" style={{ color: '#0369a1' }}>{activity.location}</span>
              </div>
            )}
            {actGroups.length > 0 && (
              <div className="flex items-center gap-3">
                <span className="text-xl">👥</span>
                <div className="flex flex-wrap gap-1.5">
                  {actGroups.map((g) => (
                    <span key={g.id} className="px-2.5 py-1 rounded-full text-white text-xs font-bold" style={{ backgroundColor: g.color }}>
                      {g.name}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>

          {activity.description && (
            <div className="rounded-2xl p-4 mb-4" style={{ background: '#e0f2fe', border: '1px solid #bae6fd' }}>
              <p className="text-sm leading-relaxed" style={{ color: '#0369a1' }}>{activity.description}</p>
            </div>
          )}

          <button onClick={() => setShowAttendees(!showAttendees)} className="flex items-center gap-2 mb-3 font-bold" style={{ color: '#0284c7' }}>
            <span className="text-lg">🙋</span>
            <span className="text-sm">{confirmedCount} מאשרים הגעה</span>
            <svg className={`w-4 h-4 transition-transform ${showAttendees ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
            </svg>
          </button>

          {showAttendees && (
            <div className="rounded-2xl p-3 mb-4" style={{ background: '#f0f9ff', border: '1px solid #bae6fd' }}>
              {attendees.filter((a) => a.status === 'confirmed').length === 0 ? (
                <p className="text-sm text-center font-medium" style={{ color: '#7dd3fc' }}>אין מאשרים עדיין 🤷</p>
              ) : (
                <div className="flex flex-wrap gap-2">
                  {attendees.filter((a) => a.status === 'confirmed').map((a) => (
                    <div key={a.id} className="flex items-center gap-1.5 bg-white rounded-full px-3 py-1 shadow-sm">
                      <div className="w-6 h-6 rounded-full flex items-center justify-center text-white text-[10px] font-black" style={{ background: 'linear-gradient(135deg, #0284c7, #06b6d4)' }}>
                        {a.profiles?.full_name?.[0] ?? '?'}
                      </div>
                      <span className="text-sm font-medium" style={{ color: '#0369a1' }}>{a.profiles?.full_name}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {profile.role === 'guide' && (
            <div className="flex gap-2 mb-3">
              {onEdit && (
                <button onClick={() => onEdit(activity)} className="flex-1 py-2.5 rounded-2xl font-bold text-sm active:scale-95 transition-all" style={{ border: '2px solid #0284c7', color: '#0284c7' }}>
                  ✏️ ערוך
                </button>
              )}
              {onDelete && (
                <button onClick={() => { if (confirm('למחוק את הפעילות?')) onDelete(activity.id); }} className="py-2.5 px-4 rounded-2xl font-bold text-sm active:scale-95 transition-all" style={{ border: '2px solid #fca5a5', color: '#ef4444' }}>
                  🗑️
                </button>
              )}
            </div>
          )}
        </div>

        {profile.role === 'youth' && (
          <div className="px-5 pb-6 pt-2" style={{ borderTop: '1px solid #bae6fd' }}>
            <button
              onClick={handleAttendance}
              disabled={loading}
              className="w-full py-4 rounded-2xl font-black text-base transition-all active:scale-[0.98] shadow-lg"
              style={
                myAttendance === 'confirmed'
                  ? { background: '#f0f9ff', color: '#0284c7', border: '2px solid #7dd3fc' }
                  : { background: 'linear-gradient(135deg, #0284c7, #06b6d4)', color: 'white' }
              }
            >
              {loading ? '...' : myAttendance === 'confirmed' ? '❌ בטל הגעה' : '✅ אשר הגעה'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
