'use client';

import { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { getOrCreateClientId, getProfile } from '@/lib/auth';
import { fetchActivities, fetchAllPresence, fetchApprovedYouth } from '@/lib/db';
import type { Activity, Presence, Profile } from '@/types';
import { GRADES } from '@/types';
import { HEBREW_MONTHS } from '@/lib/constants';

type AnalyticsTab = 'youth' | 'grades' | 'activities';
type SortKey = 'rate' | 'name' | 'grade';

const SUMMER_START = new Date(2026, 5, 1);
const SUMMER_END = new Date(2026, 7, 31, 23, 59, 59);

interface YouthStat {
  profile: Profile;
  attended: number;
  total: number;
  rate: number;
  lastSeenTitle: string | null;
  lastSeenDate: string | null;
}

function rateColor(rate: number, hasData: boolean): string {
  if (!hasData) return '#94a3b8';
  if (rate >= 0.8) return '#22c55e';
  if (rate >= 0.5) return '#f59e0b';
  return '#ef4444';
}

function rateLabel(rate: number, hasData: boolean): string {
  if (!hasData) return 'לא סומן עדיין';
  if (rate >= 0.8) return 'מגיע קבוע ⭐';
  if (rate >= 0.5) return 'מגיע לפעמים';
  if (rate > 0) return 'לא מגיע מספיק ⚠️';
  return 'לא הגיע בכלל 🔴';
}

export default function AnalyticsPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<AnalyticsTab>('youth');
  const [sortKey, setSortKey] = useState<SortKey>('rate');
  const [gradeFilter, setGradeFilter] = useState<string | null>(null);

  const [activities, setActivities] = useState<Activity[]>([]);
  const [presence, setPresence] = useState<Presence[]>([]);
  const [youth, setYouth] = useState<Profile[]>([]);

  useEffect(() => {
    async function init() {
      const clientId = getOrCreateClientId();
      const p = await getProfile(clientId);
      if (!p || p.role !== 'guide' || !p.approved) { router.replace('/calendar'); return; }
      const [acts, pres, yth] = await Promise.all([
        fetchActivities(SUMMER_START, SUMMER_END),
        fetchAllPresence(),
        fetchApprovedYouth(),
      ]);
      setActivities(acts);
      setPresence(pres);
      setYouth(yth);
      setLoading(false);
    }
    init();
  }, [router]);

  const activitiesWithRollCall = useMemo(() => {
    const ids = new Set(presence.map((p) => p.activity_id));
    return activities.filter((a) => ids.has(a.id));
  }, [activities, presence]);

  const youthStats = useMemo((): YouthStat[] => {
    return youth.map((y) => {
      const records = presence.filter((p) => p.profile_id === y.id);
      const attended = records.filter((p) => p.present).length;
      const total = records.length;
      const rate = total > 0 ? attended / total : 0;

      let lastSeenTitle: string | null = null;
      let lastSeenDate: string | null = null;
      const presentRecords = records.filter((p) => p.present);
      if (presentRecords.length > 0) {
        const last = presentRecords.reduce((a, b) => {
          const aAct = activities.find((x) => x.id === a.activity_id);
          const bAct = activities.find((x) => x.id === b.activity_id);
          if (!aAct || !bAct) return a;
          return new Date(bAct.start_time) > new Date(aAct.start_time) ? b : a;
        });
        const act = activities.find((x) => x.id === last.activity_id);
        if (act) {
          lastSeenTitle = act.title;
          lastSeenDate = new Date(act.start_time).toLocaleDateString('he-IL');
        }
      }
      return { profile: y, attended, total, rate, lastSeenTitle, lastSeenDate };
    });
  }, [youth, presence, activities]);

  const overallRate = useMemo(() => {
    const withData = youthStats.filter((ys) => ys.total > 0);
    if (!withData.length) return null;
    return withData.reduce((s, ys) => s + ys.rate, 0) / withData.length;
  }, [youthStats]);

  const displayedYouth = useMemo(() => {
    let list = gradeFilter ? youthStats.filter((ys) => ys.profile.grade === gradeFilter) : youthStats;
    if (sortKey === 'rate') list = [...list].sort((a, b) => b.rate - a.rate || b.total - a.total);
    else if (sortKey === 'name') list = [...list].sort((a, b) => a.profile.full_name.localeCompare(b.profile.full_name, 'he'));
    else list = [...list].sort((a, b) => {
      const gi = GRADES.indexOf(a.profile.grade as never) - GRADES.indexOf(b.profile.grade as never);
      return gi !== 0 ? gi : b.rate - a.rate;
    });
    return list;
  }, [youthStats, gradeFilter, sortKey]);

  const gradeStats = useMemo(() => {
    return GRADES.map((g) => {
      const gy = youthStats.filter((ys) => ys.profile.grade === g);
      const withData = gy.filter((ys) => ys.total > 0);
      const avgRate = withData.length ? withData.reduce((s, ys) => s + ys.rate, 0) / withData.length : 0;
      return { grade: g, count: gy.length, avgRate, hasData: withData.length > 0, youth: gy };
    }).filter((gs) => gs.count > 0);
  }, [youthStats]);

  const activityStats = useMemo(() => {
    return activitiesWithRollCall.map((a) => {
      const records = presence.filter((p) => p.activity_id === a.id);
      const present = records.filter((p) => p.present).length;
      return { activity: a, present, total: records.length, rate: records.length ? present / records.length : 0 };
    }).sort((a, b) => new Date(b.activity.start_time).getTime() - new Date(a.activity.start_time).getTime());
  }, [activitiesWithRollCall, presence]);

  const gradesInData = GRADES.filter((g) => youth.some((y) => y.grade === g));

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center" style={{ background: 'linear-gradient(135deg,#f0f9ff,#e0f2fe)' }}>
        <div className="text-4xl animate-bounce">📊</div>
      </div>
    );
  }

  const noData = activitiesWithRollCall.length === 0;

  return (
    <div className="flex flex-col h-full overflow-hidden" dir="rtl">
      {/* Header */}
      <div style={{ background: 'linear-gradient(135deg,#0284c7,#06b6d4)' }}>
        <div className="flex items-center gap-3 px-4 pt-4 pb-2">
          <Link href="/calendar" className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center text-white active:bg-white/30 shrink-0">
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="9,18 15,12 9,6" />
            </svg>
          </Link>
          <h1 className="text-lg font-black text-white">📊 אנליטיקס נוכחות</h1>
        </div>

        {/* Summary chips */}
        {!noData && (
          <div className="flex gap-2 px-4 pb-3 overflow-x-auto">
            {[
              { val: activitiesWithRollCall.length, label: 'פעילויות נמדדו' },
              { val: overallRate !== null ? `${Math.round(overallRate * 100)}%` : '—', label: 'נוכחות ממוצעת' },
              { val: youth.length, label: 'נערים רשומים' },
              { val: youthStats.filter((ys) => ys.total > 0 && ys.rate >= 0.8).length, label: 'מגיעים קבוע ⭐' },
            ].map(({ val, label }) => (
              <div key={label} className="bg-white/20 rounded-2xl px-3 py-2 shrink-0 text-center min-w-[72px]">
                <div className="text-white font-black text-xl leading-tight">{val}</div>
                <div className="text-white/75 text-[10px] leading-tight mt-0.5">{label}</div>
              </div>
            ))}
          </div>
        )}

        {/* Tabs */}
        <div className="flex gap-1 px-3">
          {([['youth', 'נערים'], ['grades', 'שכבות'], ['activities', 'פעילויות']] as [AnalyticsTab, string][]).map(([key, label]) => (
            <button
              key={key}
              onClick={() => setTab(key)}
              className={`flex-1 py-2.5 text-sm font-black rounded-t-xl transition-colors ${tab === key ? 'bg-white text-blue-600' : 'text-blue-100 hover:text-white'}`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto" style={{ background: 'linear-gradient(180deg,#f0f9ff,#e0f2fe)' }}>
        {noData ? (
          <div className="flex flex-col items-center justify-center h-full gap-4 px-8 text-center">
            <div className="text-6xl">📋</div>
            <p className="font-black text-xl" style={{ color: '#0369a1' }}>אין נתוני נוכחות עדיין</p>
            <p className="text-sm leading-relaxed" style={{ color: '#38bdf8' }}>
              פתח פעילות בלוח ולחץ על "קריאת שמות" כדי להתחיל לסמן נוכחות ולאסוף נתונים
            </p>
          </div>
        ) : (
          <div className="px-4 py-3">

            {/* ── YOUTH TAB ── */}
            {tab === 'youth' && (
              <div className="flex flex-col gap-2">
                {/* Sort */}
                <div className="flex gap-2 items-center pb-1 flex-wrap">
                  <div className="flex rounded-xl overflow-hidden shrink-0" style={{ border: '1.5px solid #bae6fd' }}>
                    {([['rate', 'נוכחות'], ['name', 'שם'], ['grade', 'שכבה']] as [SortKey, string][]).map(([key, label]) => (
                      <button
                        key={key}
                        onClick={() => setSortKey(key)}
                        className="px-3 py-1.5 text-xs font-black transition-colors"
                        style={sortKey === key ? { background: '#0284c7', color: 'white' } : { background: 'white', color: '#0369a1' }}
                      >
                        {label}
                      </button>
                    ))}
                  </div>
                  {gradesInData.length > 0 && (
                    <div className="flex gap-1 flex-wrap">
                      <button
                        onClick={() => setGradeFilter(null)}
                        className="px-2.5 py-1.5 rounded-xl text-xs font-black transition-all"
                        style={!gradeFilter ? { background: '#0284c7', color: 'white' } : { background: 'white', color: '#0369a1', border: '1px solid #bae6fd' }}
                      >
                        הכל
                      </button>
                      {gradesInData.map((g) => (
                        <button
                          key={g}
                          onClick={() => setGradeFilter(gradeFilter === g ? null : g)}
                          className="px-2.5 py-1.5 rounded-xl text-xs font-black transition-all"
                          style={gradeFilter === g ? { background: '#0284c7', color: 'white' } : { background: 'white', color: '#0369a1', border: '1px solid #bae6fd' }}
                        >
                          {g}׳
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {displayedYouth.map((ys) => {
                  const color = rateColor(ys.rate, ys.total > 0);
                  return (
                    <div key={ys.profile.id} className="bg-white rounded-2xl p-4 shadow-sm" style={{ border: '1px solid #bae6fd' }}>
                      <div className="flex items-start gap-3 mb-3">
                        <div
                          className="w-11 h-11 rounded-full flex items-center justify-center text-white font-black shrink-0 text-lg"
                          style={{ background: color }}
                        >
                          {ys.profile.full_name[0]}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="font-black" style={{ color: '#0c4a6e' }}>{ys.profile.full_name}</span>
                            {ys.profile.grade && (
                              <span className="text-[10px] font-black px-2 py-0.5 rounded-lg shrink-0" style={{ background: '#e0f2fe', color: '#0284c7' }}>
                                כיתה {ys.profile.grade}
                              </span>
                            )}
                          </div>
                          <div className="text-xs font-bold mt-0.5" style={{ color }}>{rateLabel(ys.rate, ys.total > 0)}</div>
                        </div>
                        <div className="text-right shrink-0">
                          <div className="font-black text-2xl leading-none" style={{ color }}>
                            {ys.total > 0 ? `${Math.round(ys.rate * 100)}%` : '—'}
                          </div>
                          <div className="text-xs mt-0.5" style={{ color: '#7dd3fc' }}>{ys.attended}/{ys.total}</div>
                        </div>
                      </div>

                      {/* Progress bar */}
                      <div className="rounded-full overflow-hidden mb-2" style={{ background: '#e0f2fe', height: 8 }}>
                        <div
                          className="h-full rounded-full transition-all"
                          style={{ width: ys.total > 0 ? `${Math.round(ys.rate * 100)}%` : '0%', background: color }}
                        />
                      </div>

                      {ys.lastSeenTitle ? (
                        <div className="text-xs" style={{ color: '#7dd3fc' }}>
                          נראה לאחרונה: <span className="font-bold" style={{ color: '#0284c7' }}>{ys.lastSeenTitle}</span> · {ys.lastSeenDate}
                        </div>
                      ) : ys.total > 0 ? (
                        <div className="text-xs" style={{ color: '#fca5a5' }}>לא נוכח באף פעילות</div>
                      ) : null}
                    </div>
                  );
                })}
              </div>
            )}

            {/* ── GRADES TAB ── */}
            {tab === 'grades' && (
              <div className="flex flex-col gap-3">
                {gradeStats.length === 0 ? (
                  <div className="text-center py-16 font-bold" style={{ color: '#38bdf8' }}>אין נתוני שכבות</div>
                ) : gradeStats.map((gs) => {
                  const color = rateColor(gs.avgRate, gs.hasData);
                  const sorted = [...gs.youth].sort((a, b) => b.rate - a.rate);
                  return (
                    <div key={gs.grade} className="bg-white rounded-2xl p-4 shadow-sm" style={{ border: '1px solid #bae6fd' }}>
                      <div className="flex items-center justify-between mb-2">
                        <div>
                          <span className="font-black text-xl" style={{ color: '#0c4a6e' }}>כיתה {gs.grade}</span>
                          <span className="text-xs font-medium mr-2" style={{ color: '#38bdf8' }}>{gs.count} נערים</span>
                        </div>
                        <div className="text-right">
                          <div className="font-black text-2xl" style={{ color }}>{gs.hasData ? `${Math.round(gs.avgRate * 100)}%` : '—'}</div>
                          <div className="text-[10px]" style={{ color: '#7dd3fc' }}>ממוצע</div>
                        </div>
                      </div>
                      <div className="rounded-full overflow-hidden mb-3" style={{ background: '#e0f2fe', height: 10 }}>
                        <div className="h-full rounded-full" style={{ width: gs.hasData ? `${Math.round(gs.avgRate * 100)}%` : '0%', background: color }} />
                      </div>
                      <div className="flex flex-col gap-1.5">
                        {sorted.map((ys) => {
                          const c = rateColor(ys.rate, ys.total > 0);
                          return (
                            <div key={ys.profile.id} className="flex items-center justify-between text-sm">
                              <span style={{ color: '#0369a1' }}>{ys.profile.full_name}</span>
                              <div className="flex items-center gap-2">
                                <div className="w-16 rounded-full overflow-hidden" style={{ background: '#e0f2fe', height: 5 }}>
                                  <div className="h-full rounded-full" style={{ width: ys.total > 0 ? `${Math.round(ys.rate * 100)}%` : '0%', background: c }} />
                                </div>
                                <span className="font-black w-8 text-left" style={{ color: c }}>
                                  {ys.total > 0 ? `${Math.round(ys.rate * 100)}%` : '—'}
                                </span>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* ── ACTIVITIES TAB ── */}
            {tab === 'activities' && (
              <div className="flex flex-col gap-2">
                {activityStats.map(({ activity, present, total, rate }) => {
                  const color = rateColor(rate, total > 0);
                  const d = new Date(activity.start_time);
                  return (
                    <div key={activity.id} className="bg-white rounded-2xl p-4 shadow-sm" style={{ border: '1px solid #bae6fd' }}>
                      <div className="flex items-start justify-between gap-3 mb-2">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-0.5">
                            <div className="w-3 h-3 rounded-full shrink-0" style={{ background: activity.color }} />
                            <span className="font-black truncate" style={{ color: '#0c4a6e' }}>{activity.title}</span>
                          </div>
                          <div className="text-xs" style={{ color: '#38bdf8' }}>
                            {d.getDate()} {HEBREW_MONTHS[d.getMonth()]} · {d.toLocaleTimeString('he-IL', { hour: '2-digit', minute: '2-digit' })}
                          </div>
                        </div>
                        <div className="text-right shrink-0">
                          <div className="font-black text-2xl leading-none" style={{ color }}>{Math.round(rate * 100)}%</div>
                          <div className="text-xs mt-0.5" style={{ color: '#7dd3fc' }}>{present}/{total} נוכחים</div>
                        </div>
                      </div>
                      <div className="rounded-full overflow-hidden" style={{ background: '#e0f2fe', height: 8 }}>
                        <div className="h-full rounded-full" style={{ width: `${Math.round(rate * 100)}%`, background: color }} />
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

          </div>
        )}
      </div>
    </div>
  );
}
