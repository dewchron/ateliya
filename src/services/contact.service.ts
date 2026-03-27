import { supabase } from '../lib/supabase';
import { getVisitorId } from './analytics.service';

/** Fire-and-forget contact form submission — never blocks UI */
export function submitContactForm(
  email: string,
  message: string,
  phone?: string,
): Promise<boolean> {
  return supabase
    .from('contact_inquiries')
    .insert({
      email,
      message,
      phone: phone || null,
      visitor_id: getVisitorId(),
    })
    .then(({ error }) => {
      if (error) {
        console.warn('[contact]', error.message);
        return false;
      }
      return true;
    });
}
