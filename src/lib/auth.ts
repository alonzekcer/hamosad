import { CLIENT_ID_KEY, GUIDE_CODE } from './constants';
import { supabase } from './supabase';
import type { Profile } from '@/types';

function generateUUID(): string {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) return crypto.randomUUID();
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    return (c === 'x' ? r : (r & 0x3) | 0x8).toString(16);
  });
}

export function getOrCreateClientId(): string {
  if (typeof window === 'undefined') return '';
  let id = localStorage.getItem(CLIENT_ID_KEY);
  if (!id) {
    id = generateUUID();
    localStorage.setItem(CLIENT_ID_KEY, id);
  }
  return id;
}

export function clearClientId(): void {
  if (typeof window !== 'undefined') localStorage.removeItem(CLIENT_ID_KEY);
}

export async function getProfile(clientId: string): Promise<Profile | null> {
  const { data } = await supabase
    .from('profiles')
    .select('*')
    .eq('client_id', clientId)
    .single();
  return data ?? null;
}

export async function registerProfile(
  clientId: string,
  fullName: string,
  guideCode?: string
): Promise<Profile> {
  // If a profile with this name already exists, link this device to it
  const { data: existing } = await supabase
    .from('profiles')
    .select('*')
    .eq('full_name', fullName)
    .single();

  if (existing) {
    const { data, error } = await supabase
      .from('profiles')
      .update({ client_id: clientId })
      .eq('id', existing.id)
      .select()
      .single();
    if (error) throw new Error(error.message);
    return data;
  }

  // Create new profile
  const role = guideCode === GUIDE_CODE ? 'guide' : 'youth';
  const approved = role === 'guide';

  const { data, error } = await supabase
    .from('profiles')
    .insert({ client_id: clientId, full_name: fullName, role, approved })
    .select()
    .single();

  if (error) throw new Error(error.message);
  return data;
}
