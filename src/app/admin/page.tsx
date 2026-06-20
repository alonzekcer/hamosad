'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { getOrCreateClientId, getProfile } from '@/lib/auth';
import {
  fetchPendingProfiles, fetchAllProfiles, approveProfile, rejectProfile, updateProfileGrade,
} from '@/lib/db';
import type { Profile } from '@/types';
import { GRADES } from '@/types';

type AdminTab = 'pending' | 'users';

export default function AdminPage() {
  const router = useRouter();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [tab, setTab] = useState<AdminTab>('pending');
  const [loading, setLoading] = useState(true);
  const [pending, setPending] = useState<Profile[]>([]);
  const [allUsers, setAllUsers] = useState<Profile[]>([]);
  const [pendingGrades, setPendingGrades] = useState<Record<string, string>>({});
  const [usersGradeFilter, setUsersGradeFilter] = useState<string | null>(null);
  const [approving, setApproving] = useState<string | null>(null);
  const [editingGradeId, setEditingGradeId] = useState<string | null>(null);

  useEffect(() => {
    async function init() {
      const clientId = getOrCreateClientId();
      const p = await getProfile(clientId);
      if (!p || p.role !== 'guide' || !p.approved) { router.replace('/calendar'); return; }
      setProfile(p);
      await loadAll(p.id);
      setLoading(false);
    }
    init();
  }, [router]);

  async function loadAll(_profileId: string) {
    const [pend, users] = await Promise.all([
      fetchPendingProfiles(),
      fetchAllProfiles(),
    ]);
    setPending(pend);
    setAllUsers(users);
  }

  async function handleApprove(id: string) {
    setApproving(id);
    try {
      await approveProfile(id, pendingGrades[id] || undefined);
      if (profile) await loadAll(profile.id);
    } catch (e) {
      alert('שגיאה באישור: ' + (e instanceof Error ? e.message : String(e)));
    } finally {
      setApproving(null);
    }
  }

  async function handleDelete(id: string) {
    if (!confirm('למחוק את המשתמש?')) return;
    await rejectProfile(id);
    if (profile) await loadAll(profile.id);
  }

  async function handleGradeChange(id: string, grade: string | null) {
    try {
      await updateProfileGrade(id, grade);
      if (profile) await loadAll(profile.id);
    } catch (e) {
      alert('שגיאה בעדכון שכבה: ' + (e instanceof Error ? e.message : String(e)));
    } finally {
      setEditingGradeId(null);
    }
  }

  if (loading || !profile) {
    return (
      <div className="flex-1 flex items-center justify-center" style={{ background: 'linear-gradient(135deg,#f0f9ff,#e0f2fe)' }}>
        <div className="text-4xl animate-bounce">🌊</div>
      </div>
    );
  }

  const tabs: { key: AdminTab; label: string; badge?: number }[] = [
    { key: 'pending', label: 'ממתינים', badge: pending.length },
    { key: 'users', label: 'משתמשים' },
  ];

  const filteredUsers = usersGradeFilter
    ? allUsers.filter((u) => u.grade === usersGradeFilter)
    : allUsers;

  return (
    <div className="flex flex-col h-full overflow-hidden">
      {/* Header */}
      <div style={{ background: 'linear-gradient(135deg,#0284c7,#06b6d4)' }}>
        <div className="flex items-center gap-3 px-4 pt-4 pb-0">
          <Link href="/calendar" className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center text-white active:bg-white/30">
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="9,18 15,12 9,6"/>
            </svg>
          </Link>
          <h1 className="text-lg font-black text-white flex-1">ניהול</h1>
          <Link href="/analytics" className="flex items-center gap-1 bg-white/20 rounded-xl px-3 py-1.5 text-white text-xs font-black active:bg-white/30">
            📊 אנליטיקס
          </Link>
        </div>
        <div className="flex gap-1 px-3 mt-3">
          {tabs.map((t) => (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className={`flex-1 py-2.5 text-sm font-black rounded-t-xl transition-colors relative ${
                tab === t.key ? 'bg-white text-blue-600' : 'text-blue-100 hover:text-white'
              }`}
            >
              {t.label}
              {t.badge != null && t.badge > 0 && (
                <span className="absolute -top-1 right-2 w-5 h-5 bg-red-500 text-white text-[9px] font-black rounded-full flex items-center justify-center">
                  {t.badge}
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto px-4 py-4" style={{ background: 'linear-gradient(180deg,#f0f9ff,#e0f2fe)' }}>

        {/* Pending approvals */}
        {tab === 'pending' && (
          <div className="flex flex-col gap-3">
            {pending.length === 0 ? (
              <div className="text-center py-16">
                <div className="text-5xl mb-3">✅</div>
                <p className="font-bold" style={{ color: '#38bdf8' }}>אין בקשות ממתינות</p>
              </div>
            ) : pending.map((u) => (
              <div key={u.id} className="bg-white rounded-2xl p-4 shadow-sm" style={{ border: '1px solid #bae6fd' }}>
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 rounded-full flex items-center justify-center text-white font-black" style={{ background: 'linear-gradient(135deg,#0284c7,#06b6d4)' }}>
                    {u.full_name[0]}
                  </div>
                  <div>
                    <div className="font-black" style={{ color: '#0c4a6e' }}>{u.full_name}</div>
                    <div className="text-xs" style={{ color: '#38bdf8' }}>{new Date(u.created_at).toLocaleDateString('he-IL')}</div>
                  </div>
                </div>

                {/* Grade picker */}
                <div className="mb-3">
                  <div className="text-xs font-bold mb-2" style={{ color: '#0369a1' }}>שכבה</div>
                  <div className="flex gap-1.5 flex-wrap">
                    {GRADES.map((g) => {
                      const selected = pendingGrades[u.id] === g;
                      return (
                        <button
                          key={g}
                          onClick={() => setPendingGrades((prev) => ({ ...prev, [u.id]: selected ? '' : g }))}
                          className="w-9 h-9 rounded-xl text-sm font-black transition-all active:scale-95"
                          style={selected
                            ? { background: 'linear-gradient(135deg,#0284c7,#06b6d4)', color: 'white' }
                            : { background: '#f0f9ff', color: '#0369a1', border: '1.5px solid #bae6fd' }
                          }
                        >
                          {g}
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div className="flex gap-2">
                  <button onClick={() => handleApprove(u.id)}
                    disabled={approving === u.id}
                    className="flex-1 py-2.5 rounded-xl text-sm font-black text-white active:scale-95 transition-all disabled:opacity-60"
                    style={{ background: 'linear-gradient(135deg,#0284c7,#06b6d4)' }}>
                    {approving === u.id ? '...' : 'אשר'}
                  </button>
                  <button onClick={() => handleDelete(u.id)}
                    disabled={approving === u.id}
                    className="py-2.5 px-4 rounded-xl text-sm font-black active:scale-95 transition-all disabled:opacity-60"
                    style={{ border: '2px solid #fca5a5', color: '#ef4444' }}>
                    דחה
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* All users */}
        {tab === 'users' && (
          <div className="flex flex-col gap-2">
            {/* Grade filter */}
            <div className="flex gap-1.5 flex-wrap pb-1">
              <button
                onClick={() => setUsersGradeFilter(null)}
                className="px-3 py-1.5 rounded-xl text-xs font-black transition-all active:scale-95"
                style={!usersGradeFilter
                  ? { background: 'linear-gradient(135deg,#0284c7,#06b6d4)', color: 'white' }
                  : { background: '#f0f9ff', color: '#0369a1', border: '1.5px solid #bae6fd' }
                }
              >
                הכל
              </button>
              {GRADES.map((g) => (
                <button
                  key={g}
                  onClick={() => setUsersGradeFilter(usersGradeFilter === g ? null : g)}
                  className="w-9 h-9 rounded-xl text-sm font-black transition-all active:scale-95"
                  style={usersGradeFilter === g
                    ? { background: 'linear-gradient(135deg,#0284c7,#06b6d4)', color: 'white' }
                    : { background: '#f0f9ff', color: '#0369a1', border: '1.5px solid #bae6fd' }
                  }
                >
                  {g}
                </button>
              ))}
            </div>

            {filteredUsers.map((u) => (
              <div key={u.id} className="bg-white rounded-2xl px-4 py-3 shadow-sm" style={{ border: '1px solid #bae6fd' }}>
                <div className="flex items-center gap-3">
                  <div
                    className="w-9 h-9 rounded-full flex items-center justify-center text-white font-black text-sm shrink-0"
                    style={{ background: u.role === 'guide' ? 'linear-gradient(135deg,#0284c7,#06b6d4)' : '#38bdf8' }}
                  >
                    {u.full_name[0]}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-black truncate" style={{ color: '#0c4a6e' }}>{u.full_name}</div>
                    <div className="text-xs flex items-center gap-1.5" style={{ color: '#38bdf8' }}>
                      <span>{u.role === 'guide' ? 'מדריך' : 'נער'}</span>
                      <span>·</span>
                      <span>{u.approved ? 'מאושר' : 'ממתין'}</span>
                      {u.role === 'youth' && (
                        <button
                          onClick={() => setEditingGradeId(editingGradeId === u.id ? null : u.id)}
                          className="flex items-center gap-1 active:scale-95 transition-all"
                        >
                          <span>·</span>
                          <span className="font-black" style={{ color: '#0284c7' }}>
                            {u.grade ? `כיתה ${u.grade}` : '+ שכבה'}
                          </span>
                          <svg className={`w-3 h-3 transition-transform ${editingGradeId === u.id ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5} style={{ color: '#0284c7' }}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                          </svg>
                        </button>
                      )}
                    </div>
                  </div>
                  <div className="flex gap-1.5 shrink-0">
                    {!u.approved && (
                      <button onClick={() => handleApprove(u.id)}
                        className="text-xs px-2.5 py-1.5 rounded-xl font-black text-white active:scale-95"
                        style={{ background: 'linear-gradient(135deg,#0284c7,#06b6d4)' }}>
                        אשר
                      </button>
                    )}
                    {u.id !== profile.id && (
                      <button onClick={() => handleDelete(u.id)}
                        className="w-8 h-8 rounded-xl flex items-center justify-center active:scale-95"
                        style={{ background: '#fef2f2', color: '#ef4444' }}>
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    )}
                  </div>
                </div>

                {/* Inline grade editor */}
                {editingGradeId === u.id && (
                  <div className="mt-3 pt-3" style={{ borderTop: '1px solid #e0f2fe' }}>
                    <div className="flex gap-1.5 flex-wrap">
                      {GRADES.map((g) => (
                        <button
                          key={g}
                          onClick={() => handleGradeChange(u.id, u.grade === g ? null : g)}
                          className="w-9 h-9 rounded-xl text-sm font-black transition-all active:scale-95"
                          style={u.grade === g
                            ? { background: 'linear-gradient(135deg,#0284c7,#06b6d4)', color: 'white' }
                            : { background: '#f0f9ff', color: '#0369a1', border: '1.5px solid #bae6fd' }
                          }
                        >
                          {g}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

      </div>
    </div>
  );
}
