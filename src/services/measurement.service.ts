import { supabase } from '../lib/supabase';
import type { Measurement } from '../types/database.types';

export async function getMeasurements(): Promise<Measurement | null> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const { data, error } = await supabase
    .from('measurements')
    .select('*')
    .eq('profile_id', user.id)
    .order('updated_at', { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) throw error;
  return data;
}

export async function upsertMeasurement(measurement: {
  id?: string;
  bust_cm?: number | null;
  waist_cm?: number | null;
  hips_cm?: number | null;
  shoulder_cm?: number | null;
  measured_by?: 'self' | 'professional';
}): Promise<Measurement> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');

  const payload = { ...measurement, profile_id: user.id };

  if (measurement.id) {
    const { data, error } = await supabase
      .from('measurements')
      .update(payload)
      .eq('id', measurement.id)
      .select()
      .single();
    if (error) throw error;
    return data;
  }

  const { data, error } = await supabase
    .from('measurements')
    .insert(payload)
    .select()
    .single();
  if (error) throw error;
  return data;
}
