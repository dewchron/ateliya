import { supabase } from '../lib/supabase';
import type { Address } from '../types/database.types';

export async function getAddresses(): Promise<Address[]> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return [];

  const { data, error } = await supabase
    .from('addresses')
    .select('*')
    .eq('profile_id', user.id)
    .order('is_default', { ascending: false });

  if (error) throw error;
  return data ?? [];
}

export async function upsertAddress(address: {
  id?: string;
  address_line?: string;
  city?: string;
  pin_code?: string;
  landmark?: string;
  is_default?: boolean;
}): Promise<Address> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');

  const payload = { ...address, profile_id: user.id };

  if (address.id) {
    const { data, error } = await supabase
      .from('addresses')
      .update(payload)
      .eq('id', address.id)
      .select()
      .single();
    if (error) throw error;
    return data;
  }

  const { data, error } = await supabase
    .from('addresses')
    .insert(payload)
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function deleteAddress(id: string): Promise<void> {
  const { error } = await supabase
    .from('addresses')
    .delete()
    .eq('id', id);
  if (error) throw error;
}
