import { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  ArrowLeftIcon,
  ArrowRightOnRectangleIcon,
  CheckCircleIcon,
  XCircleIcon,
  ClockIcon,
} from '@heroicons/react/24/outline';
import { adminLogout, adminGetOrders, adminUpdateOrderStatus, adminDeleteOrder } from '../api/admin';
import { formatINR } from '../lib/currency';
import type { Order } from '../types';

export const AdminOrdersPage = () => {
  const navigate = useNavigate();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState<string | null>(null);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [filter, setFilter] = useState<'all' | 'pending' | 'captured' | 'paid' | 'failed' | 'cancelled'>('all');

  useEffect(() => {
    loadOrders();
  }, []);

  const loadOrders = async () => {
    try {
      const data = await adminGetOrders();
      setOrders(data);
    } catch (error) {
      console.error('Failed to load orders:', error);
      alert(error instanceof Error ? error.message : 'Failed to load orders');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (orderId: string, newStatus: 'pending' | 'paid' | 'captured' | 'failed' | 'cancelled') => {
    if (!confirm(`Change order status to "${newStatus}"?`)) return;

    setUpdating(orderId);
    try {
      await adminUpdateOrderStatus(orderId, newStatus);
      await loadOrders(); // Reload orders
    } catch (error) {
      alert(error instanceof Error ? error.message : 'Failed to update order status');
    } finally {
      setUpdating(null);
    }
  };

  const handleDeleteOrder = async (orderId: string) => {
    if (!confirm('Are you sure you want to delete this order? This can only be undone by restoring from backup.')) return;

    setDeleting(orderId);
    try {
      await adminDeleteOrder(orderId);
      await loadOrders(); // Reload orders
    } catch (error) {
      alert(error instanceof Error ? error.message : 'Failed to delete order. Only pending or failed orders can be deleted.');
    } finally {
      setDeleting(null);
    }
  };

  const handleLogout = () => {
    adminLogout();
    navigate('/admin/login');
  };

  const filteredOrders = orders.filter((order) => {
    if (filter === 'all') return true;
    return order.status === filter;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'captured':
      case 'paid':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'failed':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'cancelled':
        return 'bg-gray-100 text-gray-800 border-gray-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'captured':
      case 'paid':
        return <CheckCircleIcon className="h-5 w-5" />;
      case 'pending':
        return <ClockIcon className="h-5 w-5" />;
      case 'failed':
        return <XCircleIcon className="h-5 w-5" />;
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-brand-light/10 to-white">
      {/* Header */}
      <header className="border-b border-brand/10 bg-white/90 backdrop-blur-sm">
        <div className="mx-auto max-w-7xl px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link
                to="/admin/dashboard"
                className="rounded-full p-2 text-brand-dark transition hover:bg-brand-light/20"
              >
                <ArrowLeftIcon className="h-5 w-5" />
              </Link>
              <div>
                <h1 className="font-display text-2xl text-brand-dark">Manage Orders</h1>
                <p className="text-sm text-brand-dark/70">View and manage customer orders</p>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 rounded-full border border-brand/20 px-4 py-2 text-sm font-semibold text-brand transition hover:bg-brand-light/20"
            >
              <ArrowRightOnRectangleIcon className="h-5 w-5" />
              Logout
            </button>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-7xl px-6 py-8">
        {/* Filter Tabs */}
        <div className="mb-6 flex gap-2 overflow-x-auto pb-2">
          {(['all', 'pending', 'captured', 'paid', 'failed', 'cancelled'] as const).map((status) => (
            <button
              key={status}
              onClick={() => setFilter(status)}
              className={`whitespace-nowrap rounded-full px-4 py-2 text-sm font-semibold transition ${
                filter === status
                  ? 'bg-brand text-white'
                  : 'bg-white text-brand-dark border border-brand/20 hover:bg-brand-light/20'
              }`}
            >
              {status.charAt(0).toUpperCase() + status.slice(1)}
              {status !== 'all' && (
                <span className="ml-2 rounded-full bg-white/20 px-2 py-0.5 text-xs">
                  {orders.filter((o) => o.status === status).length}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Orders Table */}
        <div className="rounded-2xl border border-brand/15 bg-white shadow-sm">
          {loading ? (
            <div className="flex items-center justify-center py-16">
              <div className="h-8 w-8 animate-spin rounded-full border-4 border-brand/20 border-t-brand"></div>
            </div>
          ) : filteredOrders.length === 0 ? (
            <div className="py-16 text-center">
              <p className="text-brand-dark/70">No orders found</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-brand/10 bg-brand-light/5">
                    <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-brand-dark/70">
                      Order ID
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-brand-dark/70">
                      Customer
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-brand-dark/70">
                      Items
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-brand-dark/70">
                      Amount
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-brand-dark/70">
                      Status
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-brand-dark/70">
                      Date
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-brand-dark/70">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-brand/5">
                  {filteredOrders.map((order) => (
                    <tr key={order._id} className="hover:bg-brand-light/5 transition">
                      <td className="px-6 py-4">
                        <div className="text-sm font-medium text-brand-dark">
                          #{order.orderId?.slice(-8) || order._id.slice(-8)}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-brand-dark">{order.user?.name || 'Guest'}</div>
                        <div className="text-xs text-brand-dark/60">{order.user?.email || order.user?.phone || '-'}</div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-brand-dark">
                          {order.items?.length || 0} item{(order.items?.length || 0) !== 1 ? 's' : ''}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm font-semibold text-brand-dark">{formatINR(order.amount)}</div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <span
                            className={`inline-flex items-center gap-1 rounded-full border px-3 py-1 text-xs font-semibold ${getStatusColor(
                              order.status
                            )}`}
                          >
                            {getStatusIcon(order.status)}
                            {order.status}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-brand-dark/70">
                          {order.createdAt ? new Date(order.createdAt).toLocaleDateString('en-IN', {
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit',
                          }) : '-'}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <select
                            value={order.status}
                            onChange={(e) =>
                              handleStatusUpdate(order._id, e.target.value as 'pending' | 'paid' | 'captured' | 'failed' | 'cancelled')
                            }
                            disabled={updating === order._id}
                            className="rounded-lg border border-brand/20 bg-white px-3 py-1.5 text-xs font-semibold text-brand-dark transition hover:border-brand focus:outline-none focus:ring-2 focus:ring-brand/20 disabled:opacity-50"
                          >
                            <option value="pending">Pending</option>
                            <option value="paid">Paid</option>
                            <option value="captured">Captured</option>
                            <option value="failed">Failed</option>
                            <option value="cancelled">Cancelled</option>
                          </select>
                          {(order.status === 'pending' || order.status === 'failed') && (
                            <button
                              onClick={() => handleDeleteOrder(order._id)}
                              disabled={deleting === order._id}
                              className="rounded-lg border border-red-200 bg-red-50 px-3 py-1.5 text-xs font-semibold text-red-700 transition hover:bg-red-100 disabled:opacity-50"
                              title="Delete order (only pending/failed orders can be deleted)"
                            >
                              {deleting === order._id ? '...' : 'Delete'}
                            </button>
                          )}
                          {updating === order._id && (
                            <div className="h-4 w-4 animate-spin rounded-full border-2 border-brand/20 border-t-brand"></div>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Summary Stats */}
        <div className="mt-6 grid gap-4 sm:grid-cols-4">
          <div className="rounded-xl border border-brand/15 bg-white p-4 shadow-sm">
            <p className="text-xs text-brand-dark/70">Total Orders</p>
            <p className="mt-1 font-display text-2xl text-brand-dark">{orders.length}</p>
          </div>
          <div className="rounded-xl border border-brand/15 bg-white p-4 shadow-sm">
            <p className="text-xs text-brand-dark/70">Pending</p>
            <p className="mt-1 font-display text-2xl text-yellow-600">
              {orders.filter((o) => o.status === 'pending').length}
            </p>
          </div>
          <div className="rounded-xl border border-brand/15 bg-white p-4 shadow-sm">
            <p className="text-xs text-brand-dark/70">Completed</p>
            <p className="mt-1 font-display text-2xl text-green-600">
              {orders.filter((o) => o.status === 'captured' || o.status === 'paid').length}
            </p>
          </div>
          <div className="rounded-xl border border-brand/15 bg-white p-4 shadow-sm">
            <p className="text-xs text-brand-dark/70">Total Revenue</p>
            <p className="mt-1 font-display text-2xl text-brand-dark">
              {formatINR(
                orders
                  .filter((o) => o.status === 'captured' || o.status === 'paid')
                  .reduce((sum, o) => sum + o.amount, 0)
              )}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

