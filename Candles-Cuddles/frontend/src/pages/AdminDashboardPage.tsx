import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Link } from 'react-router-dom';
import {
  CubeIcon,
  ShoppingBagIcon,
  PlusIcon,
  ArrowRightOnRectangleIcon,
  ChartBarIcon,
} from '@heroicons/react/24/outline';
import { adminLogout, adminGetOrders } from '../api/admin';
import { formatINR } from '../lib/currency';
import type { Order } from '../types';

export const AdminDashboardPage = () => {
  const navigate = useNavigate();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalOrders: 0,
    totalRevenue: 0,
    pendingOrders: 0,
    completedOrders: 0,
  });

  useEffect(() => {
    loadOrders();
  }, []);

  const loadOrders = async () => {
    try {
      const data = await adminGetOrders();
      setOrders(data);
      
      // Calculate stats
      const totalRevenue = data
        .filter((o) => o.status === 'captured' || o.status === 'paid')
        .reduce((sum, o) => sum + o.amount, 0);
      
      const pendingOrders = data.filter((o) => o.status === 'pending').length;
      const completedOrders = data.filter((o) => o.status === 'captured' || o.status === 'paid').length;
      
      setStats({
        totalOrders: data.length,
        totalRevenue,
        pendingOrders,
        completedOrders,
      });
    } catch (error) {
      console.error('Failed to load orders:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    adminLogout();
    navigate('/admin/login');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-brand-light/10 to-white">
      {/* Header */}
      <header className="border-b border-brand/10 bg-white/90 backdrop-blur-sm">
        <div className="mx-auto max-w-7xl px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="font-display text-2xl text-brand-dark">Admin Dashboard</h1>
              <p className="text-sm text-brand-dark/70">Manage your store</p>
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
        {/* Quick Actions */}
        <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Link
            to="/admin/products/new"
            className="group rounded-2xl border border-brand/15 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-md"
          >
            <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-brand-light/20 text-brand">
              <PlusIcon className="h-6 w-6" />
            </div>
            <h3 className="font-display text-lg text-brand-dark">Add Product</h3>
            <p className="mt-1 text-sm text-brand-dark/70">Create a new product</p>
          </Link>

          <Link
            to="/admin/products"
            className="group rounded-2xl border border-brand/15 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-md"
          >
            <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-brand-light/20 text-brand">
              <CubeIcon className="h-6 w-6" />
            </div>
            <h3 className="font-display text-lg text-brand-dark">Manage Products</h3>
            <p className="mt-1 text-sm text-brand-dark/70">View and edit products</p>
          </Link>

          <Link
            to="/admin/orders"
            className="group rounded-2xl border border-brand/15 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-md"
          >
            <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-brand-light/20 text-brand">
              <ShoppingBagIcon className="h-6 w-6" />
            </div>
            <h3 className="font-display text-lg text-brand-dark">View Orders</h3>
            <p className="mt-1 text-sm text-brand-dark/70">Manage customer orders</p>
          </Link>

          <Link
            to="/admin/analytics"
            className="group rounded-2xl border border-brand/15 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-md"
          >
            <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-brand-light/20 text-brand">
              <ChartBarIcon className="h-6 w-6" />
            </div>
            <h3 className="font-display text-lg text-brand-dark">Sales Analytics</h3>
            <p className="mt-1 text-sm text-brand-dark/70">Revenue & orders</p>
          </Link>
          
          <Link
            to="/admin/analytics/behavior"
            className="group rounded-2xl border border-brand/15 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-md"
          >
            <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-brand-light/20 text-brand">
              <ChartBarIcon className="h-6 w-6" />
            </div>
            <h3 className="font-display text-lg text-brand-dark">User Behavior</h3>
            <p className="mt-1 text-sm text-brand-dark/70">Traffic & engagement</p>
          </Link>
        </div>

        {/* Stats Cards */}
        <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-2xl border border-brand/15 bg-white p-6 shadow-sm">
            <p className="text-sm text-brand-dark/70">Total Orders</p>
            <p className="mt-2 font-display text-3xl text-brand-dark">{stats.totalOrders}</p>
          </div>
          <div className="rounded-2xl border border-brand/15 bg-white p-6 shadow-sm">
            <p className="text-sm text-brand-dark/70">Total Revenue</p>
            <p className="mt-2 font-display text-3xl text-brand-dark">{formatINR(stats.totalRevenue)}</p>
          </div>
          <div className="rounded-2xl border border-brand/15 bg-white p-6 shadow-sm">
            <p className="text-sm text-brand-dark/70">Pending Orders</p>
            <p className="mt-2 font-display text-3xl text-brand-dark">{stats.pendingOrders}</p>
          </div>
          <div className="rounded-2xl border border-brand/15 bg-white p-6 shadow-sm">
            <p className="text-sm text-brand-dark/70">Completed</p>
            <p className="mt-2 font-display text-3xl text-brand-dark">{stats.completedOrders}</p>
          </div>
        </div>

        {/* Recent Orders */}
        <div className="rounded-2xl border border-brand/15 bg-white shadow-sm">
          <div className="border-b border-brand/10 px-6 py-4">
            <h2 className="font-display text-xl text-brand-dark">Recent Orders</h2>
          </div>
          <div className="p-6">
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <div className="h-8 w-8 animate-spin rounded-full border-4 border-brand/20 border-t-brand"></div>
              </div>
            ) : orders.length === 0 ? (
              <p className="py-12 text-center text-brand-dark/70">No orders yet</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-brand/10">
                      <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-brand-dark/70">Order ID</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-brand-dark/70">Customer</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-brand-dark/70">Amount</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-brand-dark/70">Status</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-brand-dark/70">Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {orders.slice(0, 10).map((order) => (
                      <tr key={order._id} className="border-b border-brand/5 hover:bg-brand-light/5">
                        <td className="px-4 py-3 text-sm text-brand-dark">
                          #{order.orderId?.slice(-8) || order._id.slice(-8)}
                        </td>
                        <td className="px-4 py-3 text-sm text-brand-dark">{order.user.name}</td>
                        <td className="px-4 py-3 text-sm font-semibold text-brand-dark">{formatINR(order.amount)}</td>
                        <td className="px-4 py-3">
                          <span
                            className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${
                              order.status === 'captured' || order.status === 'paid'
                                ? 'bg-green-100 text-green-800'
                                : order.status === 'pending'
                                  ? 'bg-yellow-100 text-yellow-800'
                                  : 'bg-red-100 text-red-800'
                            }`}
                          >
                            {order.status}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-sm text-brand-dark/70">
                          {order.createdAt ? new Date(order.createdAt).toLocaleDateString() : '-'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

