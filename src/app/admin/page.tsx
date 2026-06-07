'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { getOrCreateClientId, getProfile } from '@/lib/auth';
import {
  fetchPendingProfiles, fetchAllProfiles, approveProfile, rejectProfile,
} from '@/lib/db';
import type { Profile } from '@/types';

type AdminTab = 'pending' | 'users';

const SUMMER_YEAR = 2026;

export default function AdminPage() {
  const router = useRouter();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [tab, setTab] = useState<AdminTab>('pending');
  const [loading, setLoading] = useState(true);
  const [pending, setPending] = useState<Profile[]>([]);
  const [allUsers, setAllUsers] = useState<Profile[]>([]);

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
    await approveProfile(id);
    if (profile) await loadAll(profile.id);
  }

  async function handleDelete(id: string) {
    if (!confirm('למחוק את המשתמש?')) return;
    await rejectProfile(id);
    if (profile) await loadAll(profile.id);
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
          <h1 className="text-lg font-black text-white">ניהול</h1>
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
                <div className="flex gap-2">
                  <button onClick={() => handleApprove(u.id)}
                    className="flex-1 py-2.5 rounded-xl text-sm font-black text-white active:scale-95 transition-all"
                    style={{ background: 'linear-gradient(135deg,#0284c7,#06b6d4)' }}>
                    אשר
                  </button>
                  <button onClick={() => handleDelete(u.id)}
                    className="py-2.5 px-4 rounded-xl text-sm font-black active:scale-95 transition-all"
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
            {allUsers.map((u) => (
              <div key={u.id} className="bg-white rounded-2xl px-4 py-3 shadow-sm flex items-center gap-3" style={{ border: '1px solid #bae6fd' }}>
                <div
                  className="w-9 h-9 rounded-full flex items-center justify-center text-white font-black text-sm shrink-0"
                  style={{ background: u.role === 'guide' ? 'linear-gradient(135deg,#0284c7,#06b6d4)' : '#38bdf8' }}
                >
                  {u.full_name[0]}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-black truncate" style={{ color: '#0c4a6e' }}>{u.full_name}</div>
                  <div className="text-xs" style={{ color: '#38bdf8' }}>
                    {u.role === 'guide' ? 'מדריך' : 'נער'} · {u.approved ? 'מאושר' : 'ממתין'}
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
            ))}
          </div>
        )}

      </div>
    </div>
  );
}
