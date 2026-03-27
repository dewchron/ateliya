import { supabase } from '../lib/supabase';

export interface ServicePrice {
  id: string;
  service: string;
  price: number;
  items_per_hr: number;
  sort_order: number;
}

export async function getServicePrices(): Promise<ServicePrice[]> {
  const { data, error } = await supabase
    .from('service_prices')
    .select('id, service, price, items_per_hr, sort_order')
    .order('sort_order');
  if (error) throw error;
  return data ?? [];
}
