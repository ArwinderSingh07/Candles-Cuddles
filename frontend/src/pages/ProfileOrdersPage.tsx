import { useEffect, useState } from 'react';
import type { Order } from '../types';
import { getCustomerOrders } from '../api/customers';
import { formatINR } from '../lib/currency';

const links = [
  { to: '/profile', label: 'Profile' },
  { to: '/profile/addresses', label: 'Addresses' },
  { to: '/profile/payments', label: 'Payment methods' },
  { to: '/profile/orders', label: 'Orders' },
];

export const ProfileOrdersPage = () => {
  const [customerId] = useState<string | null>(() => localStorage.getItem('cuddles_customer_id'));
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const hydrate = async () => {
      if (!customerId) {
        setError('Save your profile and complete a checkout to see orders.');
        return;
      }
      setLoading(true);
      try {
        const data = await getCustomerOrders(customerId);
        setOrders(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unable to load orders');
      } finally {
        setLoading(false);
      }
    };
    hydrate();
  }, [customerId]);

  return (
    <section className="bg-gradient-to-b from-brand-light/30 to-white px-6 py-12">
      <div className="mx-auto max-w-5xl space-y-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm uppercase tracking-[0.3em] text-brand-dark/60">Your space</p>
            <h1 className="font-display text-3xl text-brand-dark">Orders</h1>
            <p className="text-sm text-brand-dark/70">View orders linked to your customer ID.</p>
          </div>
        </div>

        <div className="flex flex-wrap gap-3 text-sm font-semibold text-brand-dark/70">
          {links.map((l) => (
            <a
              key={l.to}
              href={l.to}
              className={`rounded-full border px-4 py-2 transition ${l.to === '/profile/orders' ? 'border-brand bg-brand-light/50 text-brand-dark' : 'border-brand/20 hover:border-brand hover:text-brand'}`}
            >
              {l.label}
            </a>
          ))}
        </div>

        {error && <p className="text-sm text-red-600">{error}</p>}

        <div className="space-y-3 rounded-2xl border border-brand/15 bg-white/90 p-6 shadow-sm">
          {loading ? (
            <p className="text-sm text-brand-dark/70">Loading orders...</p>
          ) : orders.length ? (
            orders.map((order) => (
              <div key={order._id} className="rounded-xl border border-brand/10 p-3">
                <div className="flex items-center justify-between text-sm">
                  <span className="font-semibold text-brand-dark">#{order._id.slice(-6)}</span>
                  <span className="text-brand-dark/70">
                    {new Date(order.createdAt).toLocaleDateString()} · {order.status}
                  </span>
                </div>
                <ul className="mt-2 text-xs text-brand-dark/80">
                  {order.items.map((item) => (
                    <li key={item.productId}>
                      {item.title} × {item.qty} — {formatINR(item.price * item.qty)}
                    </li>
                  ))}
                </ul>
                <div className="mt-2 text-sm font-semibold text-brand-dark">Total: {formatINR(order.amount)}</div>
              </div>
            ))
          ) : (
            <p className="text-sm text-brand-dark/70">No orders yet.</p>
          )}
        </div>
      </div>
    </section>
  );
};
