import { supabase } from '../lib/supabase';

/** Insert a new lead and return its ID */
export async function captureLead(
  phone: string,
  visitorId: string,
): Promise<string> {
  // Generate ID client-side — anon can't SELECT back after insert
  const id = crypto.randomUUID();

  const { error } = await supabase
    .from('leads')
    .insert({
      id,
      phone: phone.startsWith('+91') ? phone : `+91${phone}`,
      visitor_id: visitorId,
      source: 'phone_screen',
      otp_status: 'pending',
    });

  if (error) throw error;
  return id;
}

/** Update lead OTP status via security-definer RPC */
export async function updateLeadStatus(
  leadId: string,
  status: 'sent' | 'verified' | 'failed',
  error?: string,
) {
  const { error: rpcError } = await supabase.rpc('update_lead_otp_status', {
    lead_id: leadId,
    new_status: status,
    error_msg: error ?? null,
  });

  if (rpcError) console.warn('[leads]', rpcError.message);
}
