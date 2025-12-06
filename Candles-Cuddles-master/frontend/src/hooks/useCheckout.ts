import { useState, useCallback } from 'react';
import { useCartStore } from '../store/cart';
import { createOrder, verifyOrder } from '../api/orders';
import { openRazorpayCheckout } from '../lib/razorpay';

interface CustomerInfo {
  name: string;
  email: string;
  phone?: string;
}

export const useCheckout = () => {
  const items = useCartStore((state) => state.items);
  const clear = useCartStore((state) => state.clear);
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [error, setError] = useState<string | null>(null);
  const [orderId, setOrderId] = useState<string | null>(null);

  const checkout = useCallback(
    async (customer: CustomerInfo) => {
      if (!items.length) throw new Error('Cart is empty');
      setStatus('loading');
      setError(null);
      setOrderId(null);
      try {
        const customerId = localStorage.getItem('cuddles_customer_id') || undefined;
        const order = await createOrder({
          user: customer,
          customerId,
          items: items.map((item) => ({ productId: item.product._id, qty: item.qty })),
        });

        await openRazorpayCheckout({
          order,
          customer,
          onSuccess: async ({ razorpay_payment_id, razorpay_signature }) => {
            const verifiedOrder = await verifyOrder({
              orderId: order.orderId,
              razorpayOrderId: order.razorpayOrderId,
              razorpayPaymentId: razorpay_payment_id,
              razorpaySignature: razorpay_signature,
            });
            clear();
            setOrderId(order.orderId);
            // Store order details in sessionStorage for confirmation page
            if (verifiedOrder?.order) {
              sessionStorage.setItem(`order_${order.orderId}`, JSON.stringify(verifiedOrder.order));
            }
            setStatus('success');
          },
          onFailure: (err) => {
            setError(err instanceof Error ? err.message : 'Checkout cancelled');
            setStatus('error');
          },
        });
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unable to checkout');
        setStatus('error');
        throw err;
      }
    },
    [items, clear],
  );

  return { checkout, status, error, orderId };
};

