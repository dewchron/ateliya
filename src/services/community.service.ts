import { supabase } from '../lib/supabase';
import type { CommunityRow } from '../types/database.types';

export async function getCommunities(): Promise<CommunityRow[]> {
  const { data, error } = await supabase
    .from('communities')
    .select('id,name,zone,planned_date,time_range,unit_count,city,pincode,sort_order')
    .order('sort_order', { ascending: true });

  if (error) throw error;
  return data ?? [];
}

export function subscribeToCommunities(callback: (communities: CommunityRow[]) => void) {
  return supabase
    .channel('community-changes')
    .on(
      'postgres_changes',
      { event: '*', schema: 'public', table: 'communities' },
      () => { getCommunities().then(callback); }
    )
    .subscribe();
}
