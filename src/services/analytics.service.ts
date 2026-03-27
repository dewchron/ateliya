import { Platform } from 'react-native';
import { supabase } from '../lib/supabase';

const VISITOR_KEY = 'ateliya_visitor_id';

/** Get or create a persistent anonymous visitor ID */
export function getVisitorId(): string {
  if (Platform.OS !== 'web' || typeof window === 'undefined') {
    // Fallback for non-web — generate a fresh one each session
    return crypto.randomUUID();
  }

  let id = window.localStorage.getItem(VISITOR_KEY);
  if (!id) {
    id = crypto.randomUUID();
    window.localStorage.setItem(VISITOR_KEY, id);
  }
  return id;
}

/** Fire-and-forget click event — never blocks UI */
export function trackClick(
  elementId: string,
  label: string,
  section: string,
) {
  const visitorId = getVisitorId();

  supabase
    .from('click_events')
    .insert({
      visitor_id: visitorId,
      element_id: elementId,
      element_label: label,
      section,
      page: 'landing',
      user_agent: typeof navigator !== 'undefined' ? navigator.userAgent : null,
      referrer: typeof document !== 'undefined' ? document.referrer || null : null,
    })
    .then(({ error }) => {
      if (error) console.warn('[analytics]', error.message);
    });
}

/** Fire-and-forget page view — one row per visit */
export function trackPageView(page: string) {
  const visitorId = getVisitorId();

  supabase
    .from('page_views')
    .insert({
      visitor_id: visitorId,
      page,
      user_agent: typeof navigator !== 'undefined' ? navigator.userAgent : null,
      referrer: typeof document !== 'undefined' ? document.referrer || null : null,
    })
    .then(({ error }) => {
      if (error) console.warn('[analytics]', error.message);
    });
}
