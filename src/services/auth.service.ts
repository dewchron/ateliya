import { supabase } from '../lib/supabase';

export async function sendOtp(phone: string) {
  // Ensure phone has country code
  const formattedPhone = phone.startsWith('+') ? phone : `+91${phone}`;
  const { error } = await supabase.auth.signInWithOtp({ phone: formattedPhone });
  if (error) throw error;
}

export async function verifyOtp(phone: string, token: string) {
  const formattedPhone = phone.startsWith('+') ? phone : `+91${phone}`;
  const { data, error } = await supabase.auth.verifyOtp({
    phone: formattedPhone,
    token,
    type: 'sms',
  });
  if (error) throw error;
  return data;
}

export async function signOut() {
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
}

export async function getSession() {
  const { data, error } = await supabase.auth.getSession();
  if (error) throw error;
  return data.session;
}
