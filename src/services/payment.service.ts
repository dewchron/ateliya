import { supabase } from '../lib/supabase';

const RAZORPAY_KEY_ID = process.env.EXPO_PUBLIC_RAZORPAY_KEY_ID || '';
const SUPABASE_URL = process.env.EXPO_PUBLIC_SUPABASE_URL || '';
const SUPABASE_ANON_KEY = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || '';

/** Create a Razorpay order via edge function (amount in paise) */
export async function createRazorpayOrder(amountPaise: number): Promise<{ order_id: string; amount: number; currency: string }> {
  const { data: { session } } = await supabase.auth.getSession();
  const token = session?.access_token || SUPABASE_ANON_KEY;

  const res = await fetch(`${SUPABASE_URL}/functions/v1/create-razorpay-order`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ amount: amountPaise }),
  });

  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Failed to create payment order');
  return data;
}

/** Load Razorpay checkout script + mobile CSS overrides (web only) */
function loadRazorpayScript(): Promise<void> {
  return new Promise((resolve, reject) => {
    if ((window as any).Razorpay) { resolve(); return; }
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.onload = () => resolve();
    script.onerror = () => reject(new Error('Failed to load Razorpay'));
    document.head.appendChild(script);

    // Force Razorpay modal to full-screen on mobile
    if (!document.getElementById('rzp-mobile-css')) {
      const style = document.createElement('style');
      style.id = 'rzp-mobile-css';
      style.textContent = `
        .razorpay-container,
        .razorpay-container-testmode {
          position: fixed !important;
          top: 0 !important;
          left: 50% !important;
          transform: translateX(-50%) !important;
          width: 100% !important;
          max-width: 430px !important;
          height: 100vh !important;
          height: 100dvh !important;
          z-index: 99999 !important;
        }
        .razorpay-container iframe,
        .razorpay-container-testmode iframe,
        .razorpay-checkout-frame,
        iframe[class*="razorpay"] {
          position: absolute !important;
          top: 0 !important;
          left: 0 !important;
          width: 100% !important;
          height: 100% !important;
          max-width: 430px !important;
          border: none !important;
          border-radius: 0 !important;
          margin: 0 !important;
          padding: 0 !important;
          z-index: 99999 !important;
        }
        .razorpay-backdrop,
        .razorpay-overlay {
          background: rgba(0,0,0,0.6) !important;
          position: fixed !important;
          inset: 0 !important;
          z-index: 99998 !important;
        }
      `;
      document.head.appendChild(style);
    }
  });
}

/** Open Razorpay checkout and return payment details on success */
export async function openRazorpayCheckout(params: {
  orderId: string;
  amountPaise: number;
  customerName?: string;
  customerPhone?: string;
  description?: string;
}): Promise<{ razorpay_payment_id: string; razorpay_order_id: string; razorpay_signature: string }> {
  await loadRazorpayScript();

  return new Promise((resolve, reject) => {
    const options = {
      key: RAZORPAY_KEY_ID,
      amount: params.amountPaise,
      currency: 'INR',
      name: 'Ateliya',
      description: params.description || 'Tailoring Services',
      order_id: params.orderId,
      prefill: {
        name: params.customerName || '',
        contact: params.customerPhone || '',
      },
      theme: { color: '#5a6b52' },
      handler: (response: any) => resolve(response),
      modal: {
        ondismiss: () => reject(new Error('Payment cancelled')),
      },
    };

    const rzp = new (window as any).Razorpay(options);
    rzp.open();
  });
}
