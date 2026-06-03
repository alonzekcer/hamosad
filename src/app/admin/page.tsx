'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { createRoot } from 'react-dom/client';
import { getOrCreateClientId, getProfile } from '@/lib/auth';
import {
  fetchPendingProfiles, fetchAllProfiles, approveProfile, rejectProfile,
  fetchActivities,
  createPublicLink, fetchPublicLinks,
} from '@/lib/db';
import PrintCalendar from '@/components/PrintCalendar';
import type { Profile, PublicLink, Activity } from '@/types';
import { HEBREW_MONTHS } from '@/lib/constants';

type AdminTab = 'pending' | 'users' | 'share';

const SUMMER_YEAR = 2026;
const SUMMER_MONTHS = [5, 6, 7]; // June, July, August

export default function AdminPage() {
  const router = useRouter();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [tab, setTab] = useState<AdminTab>('pending');
  const [loading, setLoading] = useState(true);
  const [pending, setPending] = useState<Profile[]>([]);
  const [allUsers, setAllUsers] = useState<Profile[]>([]);
  const [links, setLinks] = useState<PublicLink[]>([]);
  const [copied, setCopied] = useState('');
  const [exporting, setExporting] = useState(false);
  const printRef = useRef<HTMLDivElement>(null);

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

  async function loadAll(profileId: string) {
    const [pend, users, lnks] = await Promise.all([
      fetchPendingProfiles(),
      fetchAllProfiles(),
      fetchPublicLinks(profileId),
    ]);
    setPending(pend);
    setAllUsers(users);
    setLinks(lnks);
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

  async function handleCreateLink() {
    if (!profile) return;
    const link = await createPublicLink(profile.id);
    setLinks((prev) => [link, ...prev]);
  }

  function copyLink(token: string) {
    const url = `${window.location.origin}/public/${token}`;
    navigator.clipboard.writeText(url);
    setCopied(token);
    setTimeout(() => setCopied(''), 2000);
  }

  async function handleExportPDF() {
    setExporting(true);
    try {
      // Fetch all activities for summer months
      const monthsData = await Promise.all(
        SUMMER_MONTHS.map(async (m) => {
          const start = new Date(SUMMER_YEAR, m, 1, 0, 0, 0);
          const end = new Date(SUMMER_YEAR, m + 1, 0, 23, 59, 59);
          const activities = await fetchActivities(start, end);
          return { month: m, year: SUMMER_YEAR, activities };
        })
      );

      // Mount PrintCalendar into a hidden iframe and print it
      const iframe = document.createElement('iframe');
      iframe.style.cssText = 'position:fixed;top:-9999px;left:-9999px;width:210mm;height:297mm;border:none;';
      document.body.appendChild(iframe);

      const iDoc = iframe.contentDocument!;
      iDoc.open();
      iDoc.write(`<!DOCTYPE html><html dir="rtl" lang="he"><head>
        <meta charset="UTF-8">
        <link rel="preconnect" href="https://fonts.googleapis.com">
        <link href="https://fonts.googleapis.com/css2?family=Heebo:wght@400;600;700;900&display=swap" rel="stylesheet">
        <style>
          * { box-sizing: border-box; margin: 0; padding: 0; }
          body { font-family: 'Heebo', Arial, sans-serif; direction: rtl; background: white; }
          @page { size: A4 landscape; margin: 10mm; }
        </style>
      </head><body><div id="root"></div></body></html>`);
      iDoc.close();

      // Render React component into iframe
      const container = iDoc.getElementById('root')!;
      const root = createRoot(container);
      root.render(<PrintCalendar months={monthsData} />);

      // Wait for fonts and render
      await new Promise((r) => setTimeout(r, 1500));
      iframe.contentWindow!.print();

      setTimeout(() => {
        root.unmount();
        document.body.removeChild(iframe);
        setExporting(false);
      }, 2000);
    } catch (err) {
      console.error(err);
      setExporting(false);
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
    { key: 'share', label: 'שיתוף' },
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

        {/* Share + Export */}
        {tab === 'share' && (
          <div className="flex flex-col gap-4">
            {/* PDF Export */}
            <div className="bg-white rounded-2xl p-4 shadow-sm" style={{ border: '2px solid #7dd3fc' }}>
              <h3 className="font-black mb-1" style={{ color: '#0369a1' }}>ייצוא תוכנית קיץ</h3>
              <p className="text-sm mb-4" style={{ color: '#38bdf8' }}>
                הורדת לוח פעילויות מלא (יוני–אוגוסט) כ-PDF
              </p>
              <button
                onClick={handleExportPDF}
                disabled={exporting}
                className="w-full py-3.5 rounded-2xl font-black text-white shadow-md active:scale-[0.98] transition-all disabled:opacity-60"
                style={{ background: 'linear-gradient(135deg,#0284c7,#06b6d4)' }}
              >
                {exporting ? '⏳ מייצא...' : '⬇️ ייצא PDF'}
              </button>
            </div>

            {/* Public link */}
            <div className="bg-white rounded-2xl p-4 shadow-sm" style={{ border: '1px solid #bae6fd' }}>
              <h3 className="font-black mb-1" style={{ color: '#0369a1' }}>קישור ציבורי לצפייה</h3>
              <p className="text-sm mb-3" style={{ color: '#38bdf8' }}>נערים יוכלו לצפות בלוח ללא כניסה</p>
              <button onClick={handleCreateLink}
                className="w-full py-3 rounded-2xl font-bold text-white active:scale-[0.98]"
                style={{ background: 'linear-gradient(135deg,#0284c7,#06b6d4)' }}>
                צור קישור חדש
              </button>
            </div>

            {links.map((link) => {
              const url = `${typeof window !== 'undefined' ? window.location.origin : ''}/public/${link.token}`;
              return (
                <div key={link.id} className="bg-white rounded-2xl p-4 shadow-sm" style={{ border: '1px solid #bae6fd' }}>
                  <div className="text-xs mb-2" style={{ color: '#38bdf8' }}>{new Date(link.created_at).toLocaleDateString('he-IL')}</div>
                  <div className="text-xs rounded-xl px-3 py-2 font-mono break-all mb-3" style={{ background: '#f0f9ff', color: '#0369a1' }}>{url}</div>
                  <button onClick={() => copyLink(link.token)}
                    className="w-full py-2.5 rounded-xl text-sm font-black transition-all"
                    style={copied === link.token
                      ? { background: 'linear-gradient(135deg,#0284c7,#06b6d4)', color: 'white' }
                      : { border: '2px solid #7dd3fc', color: '#0284c7' }}>
                    {copied === link.token ? 'הועתק! ✓' : 'העתק קישור'}
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
