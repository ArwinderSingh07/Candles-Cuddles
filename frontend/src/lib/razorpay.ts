import type { OrderResponse } from '../types';

type RazorpayHandler = (payload: {
  razorpay_payment_id: string;
  razorpay_order_id: string;
  razorpay_signature: string;
}) => void;

interface RazorpayOptions {
  key: string;
  amount: number;
  currency: string;
  name: string;
  description: string;
  order_id: string;
  prefill: {
    name: string;
    email: string;
    contact?: string;
  };
  theme: { color: string };
  handler: RazorpayHandler;
  modal: { ondismiss: () => void };
}

type RazorpayConstructor = new (options: RazorpayOptions) => { open: () => void };

declare global {
  interface Window {
    Razorpay?: RazorpayConstructor;
  }
}

let scriptPromise: Promise<void> | null = null;

const loadRazorpayScript = () => {
  if (window.Razorpay) return Promise.resolve();
  if (scriptPromise) return scriptPromise;

  scriptPromise = new Promise((resolve, reject) => {
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.onload = () => resolve();
    script.onerror = reject;
    document.body.appendChild(script);
  });
  return scriptPromise;
};

export const openRazorpayCheckout = async ({
  order,
  customer,
  onSuccess,
  onFailure,
}: {
  order: OrderResponse;
  customer: { name: string; email: string; phone?: string };
  onSuccess: (payload: { razorpay_payment_id: string; razorpay_signature: string }) => void;
  onFailure: (error: unknown) => void;
}) => {
  await loadRazorpayScript();
  if (!window.Razorpay) throw new Error('Razorpay SDK unavailable');

  const options = {
    key: order.key,
    amount: order.amount,
    currency: order.currency,
    name: 'Candles & Cuddles',
    description: 'Curated candle gift set',
    order_id: order.razorpayOrderId,
    prefill: {
      name: customer.name,
      email: customer.email,
      contact: customer.phone,
    },
    theme: { color: '#C65D7B' },
    handler: (response: { razorpay_payment_id: string; razorpay_order_id: string; razorpay_signature: string }) => {
      onSuccess({
        razorpay_payment_id: response.razorpay_payment_id,
        razorpay_signature: response.razorpay_signature,
      });
    },
    modal: {
      ondismiss: () => onFailure(new Error('Checkout dismissed')),
    },
  };

  const rzp = new window.Razorpay(options);
  rzp.open();
};

