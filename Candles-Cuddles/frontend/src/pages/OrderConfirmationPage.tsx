import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { CheckCircleIcon, ArrowLeftIcon } from '@heroicons/react/24/outline';
import api from '../api/client';
import { formatINR } from '../lib/currency';

interface OrderItem {
  productId: string;
  title: string;
  qty: number;
  price: number;
}

interface Order {
  _id: string;
  user: {
    name: string;
    email: string;
    phone?: string;
  };
  items: OrderItem[];
  amount: number;
  currency: string;
  status: string;
  createdAt: string;
}

export const OrderConfirmationPage = () => {
  const { orderId } = useParams<{ orderId: string }>();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!orderId) {
      setError('Order ID is missing');
      setLoading(false);
      return;
    }

    const fetchOrder = async () => {
      // First, try to get from sessionStorage (just completed order)
      const storedOrder = sessionStorage.getItem(`order_${orderId}`);
      if (storedOrder) {
        try {
          const parsedOrder = JSON.parse(storedOrder);
          setOrder(parsedOrder);
          setLoading(false);
          // Clean up sessionStorage after displaying
          sessionStorage.removeItem(`order_${orderId}`);
          return;
        } catch (err) {
          // If parsing fails, continue to API fetch
        }
      }

      // Try to get order from customer orders endpoint if logged in
      try {
        const customerId = localStorage.getItem('cuddles_customer_id');
        if (customerId) {
          try {
            const { data: orders } = await api.get(`/customers/${customerId}/orders`);
            const foundOrder = Array.isArray(orders) ? orders.find((o: Order) => o._id === orderId) : null;
            if (foundOrder) {
              setOrder(foundOrder);
              setLoading(false);
              return;
            }
          } catch (err) {
            // If customer orders fail, continue
          }
        }

        // If not found, show error
        setError('Order not found. Please check your order history.');
      } catch (err: any) {
        setError(err.response?.data?.message || 'Failed to load order details');
      } finally {
        setLoading(false);
      }
    };

    fetchOrder();
  }, [orderId]);

  if (loading) {
    return (
      <section className="mx-auto max-w-4xl px-6 py-16">
        <div className="text-center">
          <div className="mx-auto h-12 w-12 animate-spin rounded-full border-4 border-brand-light border-t-brand"></div>
          <p className="mt-4 text-brand-dark/70">Loading order details...</p>
        </div>
      </section>
    );
  }

  if (error || !order) {
    return (
      <section className="mx-auto max-w-4xl px-6 py-16">
        <div className="text-center">
          <p className="text-sm uppercase tracking-[0.4em] text-brand-dark/60">Error</p>
          <h1 className="mt-3 font-display text-4xl text-brand-dark">Order Not Found</h1>
          <p className="mt-4 text-brand-dark/70">{error || 'We couldn\'t find this order.'}</p>
          <div className="mt-8 flex justify-center gap-4">
            <Link
              to="/profile/orders"
              className="rounded-full border border-brand px-6 py-3 font-semibold text-brand transition hover:bg-brand-light/20"
            >
              View My Orders
            </Link>
            <Link
              to="/shop"
              className="rounded-full bg-brand px-6 py-3 font-semibold text-white transition hover:bg-brand-dark"
            >
              Continue Shopping
            </Link>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="relative min-h-[calc(100vh-120px)] bg-gradient-to-b from-brand-light/40 to-white">
      {/* Background decoration */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(198,93,123,0.08),transparent_35%),radial-gradient(circle_at_80%_80%,rgba(198,93,123,0.06),transparent_30%)]" />
      
      <div className="relative mx-auto max-w-4xl px-6 py-16 md:py-20">
        {/* Success Header */}
        <div className="text-center">
          <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-green-100">
            <CheckCircleIcon className="h-12 w-12 text-green-600" />
          </div>
          <p className="text-sm uppercase tracking-[0.4em] text-brand-dark/70">Order Confirmed</p>
          <h1 className="mt-3 font-display text-4xl leading-tight text-brand-dark md:text-5xl">
            Thank you for your order!
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-lg text-brand-dark/80">
            Your order has been confirmed and we've sent a receipt to <strong>{order.user.email}</strong>
          </p>
        </div>

        {/* Order Details Card */}
        <div className="mt-12 rounded-3xl border border-brand/10 bg-white/90 p-8 shadow-inner ring-1 ring-brand-light/80">
          <div className="mb-6 flex items-center justify-between border-b border-brand/10 pb-4">
            <div>
              <h2 className="font-display text-2xl text-brand-dark">Order Details</h2>
              <p className="mt-1 text-sm text-brand-dark/70">Order #{order._id.slice(-8).toUpperCase()}</p>
            </div>
            <div className="text-right">
              <p className="text-sm text-brand-dark/70">Status</p>
              <p className="mt-1 font-semibold capitalize text-brand-dark">
                {order.status === 'captured' ? 'Paid' : order.status}
              </p>
            </div>
          </div>

          {/* Order Items */}
          <div className="mb-6 space-y-4">
            <h3 className="font-semibold text-brand-dark">Items</h3>
            {order.items.map((item, index) => (
              <div key={index} className="flex items-center justify-between border-b border-brand/5 pb-3">
                <div>
                  <p className="font-medium text-brand-dark">{item.title}</p>
                  <p className="text-sm text-brand-dark/60">Quantity: {item.qty}</p>
                </div>
                <p className="font-semibold text-brand-dark">{formatINR(item.price * item.qty)}</p>
              </div>
            ))}
          </div>

          {/* Order Summary */}
          <div className="border-t border-brand/10 pt-6">
            <div className="flex items-center justify-between">
              <span className="text-sm uppercase tracking-wide text-brand-dark/70">Total</span>
              <span className="text-3xl font-bold text-brand-dark">{formatINR(order.amount)}</span>
            </div>
            <p className="mt-2 text-xs text-brand-dark/60">
              Order placed on {new Date(order.createdAt).toLocaleDateString('en-IN', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
              })}
            </p>
          </div>

          {/* Customer Info */}
          <div className="mt-6 border-t border-brand/10 pt-6">
            <h3 className="mb-4 font-semibold text-brand-dark">Shipping Information</h3>
            <div className="space-y-2 text-sm text-brand-dark/80">
              <p><strong>Name:</strong> {order.user.name}</p>
              <p><strong>Email:</strong> {order.user.email}</p>
              {order.user.phone && <p><strong>Phone:</strong> {order.user.phone}</p>}
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="mt-8 flex flex-col gap-4 sm:flex-row sm:justify-center">
          <Link
            to="/profile/orders"
            className="flex items-center justify-center gap-2 rounded-full border border-brand px-6 py-3 font-semibold text-brand transition hover:bg-brand-light/20"
          >
            <ArrowLeftIcon className="h-5 w-5" />
            View All Orders
          </Link>
          <Link
            to="/shop"
            className="rounded-full bg-brand px-6 py-3 font-semibold text-white transition hover:bg-brand-dark"
          >
            Continue Shopping
          </Link>
        </div>

        {/* Help Text */}
        <div className="mt-8 rounded-2xl border border-brand/10 bg-brand-light/20 p-6 text-center">
          <p className="text-sm text-brand-dark/80">
            Questions about your order? <Link to="/contact" className="font-semibold text-brand hover:underline">Contact us</Link> and we'll be happy to help.
          </p>
        </div>
      </div>
    </section>
  );
};

