import { supabase } from '../lib/supabase';
import type { Profile } from '../types/database.types';

export async function getProfile(): Promise<Profile | null> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const { data, error } = await supabase
    .from('user_profiles')
    .select('*')
    .eq('id', user.id)
    .maybeSingle();

  if (error) throw error;
  return data;
}

export async function updateProfile(updates: {
  full_name?: string;
  birth_date?: string | null;
  phone?: string;
  gender?: 'male' | 'female';
}): Promise<Profile> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');

  // Try update first (profile row usually exists via DB trigger)
  const { data, error } = await supabase
    .from('user_profiles')
    .update(updates)
    .eq('id', user.id)
    .select()
    .maybeSingle();

  if (error) throw error;
  if (data) return data;

  // Row missing (e.g. user created before trigger existed) — create it
  const { data: created, error: createErr } = await supabase
    .from('user_profiles')
    .insert({ id: user.id, phone: user.phone ?? null, ...updates })
    .select()
    .single();

  if (createErr) throw createErr;
  return created;
}
