import { supabase } from '../lib/supabase';
import type { Order, OrderService } from '../types/database.types';

interface CreateOrderParams {
  pickupDate: string;
  pickupTime: string;
  customCommunity?: string;
  paymentId?: string;
  totalAmount?: number;
  services: {
    serviceType: string;
    quantity?: number;
  }[];
}

export async function createOrder(params: CreateOrderParams): Promise<Order> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');

  // Create order
  const { data: order, error: orderErr } = await supabase
    .from('orders')
    .insert({
      customer_id: user.id,
      pickup_date: params.pickupDate || null,
      pickup_time: params.pickupTime || null,
      payment_id: params.paymentId || null,
      total_amount: params.totalAmount || 0,
      ...(params.customCommunity ? { custom_community: params.customCommunity } : {}),
    })
    .select()
    .single();
  if (orderErr) throw orderErr;

  // Create services
  for (const svc of params.services) {
    const { error: svcErr } = await supabase
      .from('order_services')
      .insert({
        order_id: order.id,
        service_type: svc.serviceType,
        quantity: svc.quantity || 1,
      });
    if (svcErr) throw svcErr;
  }

  return order;
}

export async function updateOrder(orderId: string, params: {
  services: { serviceType: string; quantity?: number }[];
  totalAmount: number;
}): Promise<void> {
  // Delete existing services and replace
  const { error: delErr } = await supabase
    .from('order_services')
    .delete()
    .eq('order_id', orderId);
  if (delErr) throw delErr;

  for (const svc of params.services) {
    const { error: svcErr } = await supabase
      .from('order_services')
      .insert({ order_id: orderId, service_type: svc.serviceType, quantity: svc.quantity || 1 });
    if (svcErr) throw svcErr;
  }

  const { error: updateErr } = await supabase
    .from('orders')
    .update({ total_amount: params.totalAmount })
    .eq('id', orderId);
  if (updateErr) throw updateErr;
}

export async function cancelOrder(orderId: string) {
  const { error } = await supabase
    .from('orders')
    .update({ status: 'cancelled' })
    .eq('id', orderId);
  if (error) throw error;
}

export async function getUpcomingAppointment() {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const today = new Date().toISOString().split('T')[0];

  const { data, error } = await supabase
    .from('orders')
    .select(`
      id,
      pickup_date,
      pickup_time,
      status,
      custom_community
    `)
    .eq('customer_id', user.id)
    .in('status', ['pending', 'confirmed'])
    .gte('pickup_date', today)
    .order('pickup_date', { ascending: true })
    .limit(1)
    .maybeSingle();

  if (error || !data) return null;
  return data;
}

export async function getOrders() {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return [];

  const { data, error } = await supabase
    .from('orders')
    .select(`
      *,
      order_services (id, service_type, quantity)
    `)
    .eq('customer_id', user.id)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data ?? [];
}

export async function getOrderDetail(orderId: string) {
  const { data, error } = await supabase
    .from('orders')
    .select(`
      *,
      order_services( * )
    `)
    .eq('id', orderId)
    .single();

  if (error) throw error;
  return data;
}

export async function deleteOrder(orderId: string) {
  const { error } = await supabase
    .from('orders')
    .delete()
    .eq('id', orderId);
  if (error) throw error;
}

export function subscribeToOrders(
  userId: string,
  callback: (order: Order) => void
) {
  return supabase
    .channel('order-changes')
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'orders',
        filter: `customer_id=eq.${userId}`,
      },
      (payload) => {
        callback((payload.new ?? payload.old) as Order);
      }
    )
    .subscribe();
}
