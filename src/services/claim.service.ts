import { supabase } from '../lib/supabase';

export interface UnverifiedResult {
  unverified: boolean;
  had_name?: boolean;
  had_address?: boolean;
  name?: string;
  reason?: string;
}

/**
 * Attempt to claim an unverified customer record after OTP verification.
 * Calls the `claim_unverified_customer` RPC which transfers name, address,
 * and orders from the staging table to the authenticated user.
 */
export async function checkUnverifiedCustomer(phone: string): Promise<UnverifiedResult> {
  const { data, error } = await supabase.rpc('claim_unverified_customer', {
    p_phone: phone,
  });

  if (error) throw error;
  return data as UnverifiedResult;
}
