import { useEffect, useState } from 'react';
import type { Order } from '../types';
import { getCustomerOrders } from '../api/customers';
import { formatINR } from '../lib/currency';
import { ProfileLayout } from '../components/ProfileLayout';

const getStatusBadge = (status: Order['status']) => {
  const styles: Record<Order['status'], string> = {
    pending: 'bg-yellow-100 text-yellow-800 border-yellow-200',
    paid: 'bg-blue-100 text-blue-800 border-blue-200',
    captured: 'bg-green-100 text-green-800 border-green-200',
    failed: 'bg-red-100 text-red-800 border-red-200',
    cancelled: 'bg-gray-100 text-gray-800 border-gray-200',
  };
  return (
    <span className={`inline-flex items-center rounded-full border px-3 py-1 text-xs font-semibold ${styles[status]}`}>
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </span>
  );
};

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
    <ProfileLayout title="Your Orders" subtitle="Track and manage all your orders">
      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-brand/20 border-t-brand"></div>
        </div>
      ) : orders.length === 0 ? (
        <div className="rounded-2xl border border-brand/15 bg-white/90 p-12 text-center shadow-sm">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-brand-light/20 text-3xl">
            📦
          </div>
          <h3 className="mb-2 font-display text-xl text-brand-dark">No orders yet</h3>
          <p className="mb-6 text-sm text-brand-dark/70">
            {customerId
              ? "You haven't placed any orders yet. Start shopping to see your orders here!"
              : 'Save your profile and complete a checkout to see your orders here.'}
          </p>
          <a
            href="/shop"
            className="inline-block rounded-full bg-brand px-6 py-3 text-sm font-semibold text-white transition hover:bg-brand-dark"
          >
            Browse Products
          </a>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => (
            <div
              key={order._id}
              className="rounded-2xl border border-brand/15 bg-white/90 p-6 shadow-sm transition hover:shadow-md"
            >
              <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                <div className="flex-1">
                  <div className="mb-3 flex flex-wrap items-center gap-3">
                    <h3 className="font-display text-lg font-semibold text-brand-dark">
                      Order #{order._id.slice(-8).toUpperCase()}
                    </h3>
                    {getStatusBadge(order.status)}
                  </div>
                  <p className="mb-4 text-sm text-brand-dark/60">
                    Placed on {new Date(order.createdAt).toLocaleDateString('en-US', { 
                      year: 'numeric', 
                      month: 'long', 
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </p>
                  <div className="space-y-2">
                    {order.items.map((item) => (
                      <div key={item.productId} className="flex items-center justify-between border-b border-brand/5 pb-2 last:border-0">
                        <div className="flex-1">
                          <p className="text-sm font-medium text-brand-dark">{item.title}</p>
                          <p className="text-xs text-brand-dark/60">Quantity: {item.qty}</p>
                        </div>
                        <p className="text-sm font-semibold text-brand-dark">{formatINR(item.price * item.qty)}</p>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="flex flex-col items-end gap-2 border-t border-brand/10 pt-4 sm:border-t-0 sm:border-l sm:pl-6 sm:pt-0">
                  <div className="text-right">
                    <p className="text-xs uppercase tracking-wide text-brand-dark/60">Total Amount</p>
                    <p className="mt-1 font-display text-2xl font-semibold text-brand-dark">{formatINR(order.amount)}</p>
                  </div>
                  {order.user.phone && (
                    <p className="text-xs text-brand-dark/60">Contact: {order.user.phone}</p>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </ProfileLayout>
  );
};
