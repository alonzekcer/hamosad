import { supabase } from './supabase';
import type { Activity, Attendance, Group, Profile, PublicLink } from '@/types';

// --- Activities ---

export async function fetchActivities(start: Date, end: Date): Promise<Activity[]> {
  const { data, error } = await supabase
    .from('activities')
    .select('*')
    .lte('start_time', end.toISOString())
    .gte('end_time', start.toISOString())
    .order('start_time');
  if (error) throw error;
  return data ?? [];
}

export async function createActivity(payload: Omit<Activity, 'id' | 'created_at'>): Promise<Activity> {
  const { data, error } = await supabase
    .from('activities')
    .insert(payload)
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function updateActivity(id: string, payload: Partial<Omit<Activity, 'id' | 'created_at'>>): Promise<Activity> {
  const { data, error } = await supabase
    .from('activities')
    .update(payload)
    .eq('id', id)
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function deleteActivity(id: string): Promise<void> {
  const { error } = await supabase.from('activities').delete().eq('id', id);
  if (error) throw error;
}

// --- Groups ---

export async function fetchGroups(): Promise<Group[]> {
  const { data, error } = await supabase.from('groups').select('*').order('name');
  if (error) throw error;
  return data ?? [];
}

export async function createGroup(name: string, ageRange: string, color: string): Promise<Group> {
  const { data, error } = await supabase
    .from('groups')
    .insert({ name, age_range: ageRange, color })
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function deleteGroup(id: string): Promise<void> {
  const { error } = await supabase.from('groups').delete().eq('id', id);
  if (error) throw error;
}

// --- Attendance ---

export async function fetchMyAttendance(profileId: string): Promise<Attendance[]> {
  const { data, error } = await supabase
    .from('attendance')
    .select('*')
    .eq('profile_id', profileId);
  if (error) throw error;
  return data ?? [];
}

export async function fetchActivityAttendance(activityId: string): Promise<(Attendance & { profiles: Profile })[]> {
  const { data, error } = await supabase
    .from('attendance')
    .select('*, profiles(*)')
    .eq('activity_id', activityId)
    .eq('status', 'confirmed');
  if (error) throw error;
  return (data ?? []) as (Attendance & { profiles: Profile })[];
}

export async function toggleAttendance(profileId: string, activityId: string, currentStatus: 'confirmed' | 'cancelled' | null): Promise<void> {
  if (currentStatus === 'confirmed') {
    await supabase
      .from('attendance')
      .update({ status: 'cancelled' })
      .eq('profile_id', profileId)
      .eq('activity_id', activityId);
  } else if (currentStatus === 'cancelled') {
    await supabase
      .from('attendance')
      .update({ status: 'confirmed' })
      .eq('profile_id', profileId)
      .eq('activity_id', activityId);
  } else {
    await supabase
      .from('attendance')
      .insert({ profile_id: profileId, activity_id: activityId, status: 'confirmed' });
  }
}

// --- Admin: profiles ---

export async function fetchPendingProfiles(): Promise<Profile[]> {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('approved', false)
    .order('created_at');
  if (error) throw error;
  return data ?? [];
}

export async function fetchAllProfiles(): Promise<Profile[]> {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .order('full_name');
  if (error) throw error;
  return data ?? [];
}

export async function approveProfile(id: string, grade?: string): Promise<void> {
  const payload: Record<string, unknown> = { approved: true };
  if (grade) payload.grade = grade;
  const { error } = await supabase.from('profiles').update(payload).eq('id', id);
  if (error) throw error;
}

export async function rejectProfile(id: string): Promise<void> {
  const { error } = await supabase.from('profiles').delete().eq('id', id);
  if (error) throw error;
}

// --- Public links ---

export async function createPublicLink(createdBy: string): Promise<PublicLink> {
  const token = crypto.randomUUID().replace(/-/g, '');
  const { data, error } = await supabase
    .from('public_links')
    .insert({ token, created_by: createdBy })
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function fetchPublicLinks(createdBy: string): Promise<PublicLink[]> {
  const { data, error } = await supabase
    .from('public_links')
    .select('*')
    .eq('created_by', createdBy)
    .order('created_at', { ascending: false });
  if (error) throw error;
  return data ?? [];
}

export async function validatePublicToken(token: string): Promise<boolean> {
  const { data } = await supabase
    .from('public_links')
    .select('id')
    .eq('token', token)
    .single();
  return !!data;
}
