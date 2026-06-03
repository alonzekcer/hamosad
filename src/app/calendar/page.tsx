'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { getOrCreateClientId, getProfile } from '@/lib/auth';
import { fetchActivities, createActivity, updateActivity, deleteActivity } from '@/lib/db';
import TopBar from '@/components/TopBar';
import NavBar from '@/components/NavBar';
import MonthView from '@/components/calendar/MonthView';
import WeekView from '@/components/calendar/WeekView';
import DayView from '@/components/calendar/DayView';
import ActivityModal from '@/components/ActivityModal';
import ActivityForm from '@/components/ActivityForm';
import type { Activity, Profile, CalendarView } from '@/types';

// Only allow June (5), July (6), August (7)
const SUMMER_YEAR = 2026;
const SUMMER_START = 5; // June
const SUMMER_END = 7;   // August

function clampToSummer(date: Date): Date {
  const d = new Date(date);
  d.setFullYear(SUMMER_YEAR);
  if (d.getMonth() < SUMMER_START) d.setMonth(SUMMER_START);
  if (d.getMonth() > SUMMER_END) d.setMonth(SUMMER_END);
  return d;
}

function initialDate(): Date {
  const now = new Date();
  const m = now.getMonth();
  if (now.getFullYear() === SUMMER_YEAR && m >= SUMMER_START && m <= SUMMER_END) return now;
  return new Date(SUMMER_YEAR, SUMMER_START, 1);
}

export default function CalendarPage() {
  const router = useRouter();
  const [profile, setProfile] = useState<Profile | null>(null);

  const [activities, setActivities] = useState<Activity[]>([]);
  const [view, setView] = useState<CalendarView>('month');
  const [currentDate, setCurrentDate] = useState<Date>(initialDate);
  const [selectedActivity, setSelectedActivity] = useState<Activity | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [editingActivity, setEditingActivity] = useState<Partial<Activity> | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function init() {
      const clientId = getOrCreateClientId();
      const p = await getProfile(clientId);
      if (!p || !p.approved) { router.replace('/login'); return; }
      setProfile(p);
      setLoading(false);
    }
    init();
  }, [router]);

  const loadActivities = useCallback(async () => {
    let start: Date, end: Date;
    if (view === 'month') {
      start = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
      end = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);
    } else if (view === 'week') {
      start = new Date(currentDate);
      start.setDate(currentDate.getDate() - currentDate.getDay());
      end = new Date(start);
      end.setDate(start.getDate() + 6);
    } else {
      start = new Date(currentDate);
      end = new Date(currentDate);
    }
    start.setHours(0, 0, 0, 0);
    end.setHours(23, 59, 59, 999);
    setActivities(await fetchActivities(start, end));
  }, [view, currentDate]);

  useEffect(() => {
    if (!loading) loadActivities();
  }, [loading, loadActivities]);

  // Navigation: prev = go back, next = go forward. Clamped to summer months.
  function navigate(dir: 1 | -1) {
    setCurrentDate((prev) => {
      const d = new Date(prev);
      if (view === 'month') {
        const newMonth = d.getMonth() + dir;
        if (newMonth < SUMMER_START || newMonth > SUMMER_END) return prev;
        d.setMonth(newMonth);
      } else if (view === 'week') {
        d.setDate(d.getDate() + dir * 7);
        const clamped = clampToSummer(d);
        return clamped;
      } else {
        d.setDate(d.getDate() + dir);
        const clamped = clampToSummer(d);
        return clamped;
      }
      return d;
    });
  }

  function canGoPrev(): boolean {
    if (view === 'month') return currentDate.getMonth() > SUMMER_START;
    return true;
  }
  function canGoNext(): boolean {
    if (view === 'month') return currentDate.getMonth() < SUMMER_END;
    return true;
  }

  function handleDayClick(day: Date) {
    setCurrentDate(day);
    setView('day');
  }

  function handleAddFromDay(date: Date) {
    const pad = (n: number) => String(n).padStart(2, '0');
    const dateStr = `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
    setEditingActivity({
      start_time: new Date(`${dateStr}T09:00`).toISOString(),
      end_time: new Date(`${dateStr}T11:00`).toISOString(),
    });
    setShowForm(true);
  }

  async function handleSaveActivity(data: Omit<Activity, 'id' | 'created_at'>) {
    if (editingActivity?.id) await updateActivity(editingActivity.id, data);
    else await createActivity(data);
    setShowForm(false);
    setEditingActivity(null);
    setSelectedActivity(null);
    await loadActivities();
  }

  async function handleDeleteActivity(id: string) {
    await deleteActivity(id);
    setSelectedActivity(null);
    await loadActivities();
  }

  function handleEdit(act: Activity) {
    setSelectedActivity(null);
    setEditingActivity(act);
    setShowForm(true);
  }

  if (loading || !profile) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center gap-3" style={{ background: 'linear-gradient(135deg, #f0f9ff, #e0f2fe)' }}>
        <div className="text-5xl animate-bounce">🌊</div>
        <div className="font-bold" style={{ color: '#0284c7' }}>טוען...</div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full overflow-hidden">
      <TopBar
        year={currentDate.getFullYear()}
        month={currentDate.getMonth()}
        view={view}
        date={currentDate}
        isGuide={profile.role === 'guide'}
        canGoPrev={canGoPrev()}
        canGoNext={canGoNext()}
        onPrev={() => navigate(-1)}
        onNext={() => navigate(1)}
        onToday={() => setCurrentDate(initialDate())}
      />

      <div className="flex-1 overflow-hidden flex flex-col">
        {view === 'month' && (
          <MonthView
            year={currentDate.getFullYear()}
            month={currentDate.getMonth()}
            activities={activities}
            onActivityClick={setSelectedActivity}
            onDayClick={handleDayClick}
          />
        )}
        {view === 'week' && (
          <WeekView
            date={currentDate}
            activities={activities}
            onActivityClick={setSelectedActivity}
            onDayClick={handleDayClick}
          />
        )}
        {view === 'day' && (
          <DayView
            date={currentDate}
            activities={activities}
            onActivityClick={setSelectedActivity}
            isGuide={profile.role === 'guide'}
            onAddActivity={handleAddFromDay}
          />
        )}
      </div>

      <NavBar view={view} onViewChange={setView} />

      {selectedActivity && (
        <ActivityModal
          activity={selectedActivity}
          profile={profile}
          groups={[]}
          onClose={() => setSelectedActivity(null)}
          onEdit={profile.role === 'guide' ? handleEdit : undefined}
          onDelete={profile.role === 'guide' ? handleDeleteActivity : undefined}
        />
      )}

      {showForm && (
        <ActivityForm
          initial={editingActivity ?? undefined}
          groups={[]}
          profileId={profile.id}
          onSave={handleSaveActivity}
          onCancel={() => { setShowForm(false); setEditingActivity(null); }}
        />
      )}
    </div>
  );
}
