import { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  ArrowLeftIcon,
  ArrowRightOnRectangleIcon,
  ChartBarIcon,
  CurrencyDollarIcon,
  ShoppingBagIcon,
  ArrowUpIcon,
  ArrowDownIcon,
} from '@heroicons/react/24/outline';
import { adminLogout, adminGetOrders, adminGetProducts } from '../api/admin';
import { formatINR } from '../lib/currency';
import type { Order, Product } from '../types';

type TimePeriod = '7d' | '30d' | '90d' | 'all';

interface AnalyticsData {
  totalRevenue: number;
  totalOrders: number;
  averageOrderValue: number;
  revenueChange: number;
  ordersChange: number;
  topProducts: Array<{ productId: string; title: string; quantity: number; revenue: number }>;
  revenueByDay: Array<{ date: string; revenue: number; orders: number }>;
  statusBreakdown: {
    pending: number;
    captured: number;
    paid: number;
    failed: number;
  };
  totalProducts: number;
  activeProducts: number;
  lowStockProducts: number;
}

export const AdminAnalyticsPage = () => {
  const navigate = useNavigate();
  const [orders, setOrders] = useState<Order[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState<TimePeriod>('30d');
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    if (orders.length > 0 || products.length > 0) {
      calculateAnalytics();
    }
  }, [orders, products, period]);

  const loadData = async () => {
    try {
      const [ordersData, productsData] = await Promise.all([
        adminGetOrders(),
        adminGetProducts(),
      ]);
      setOrders(ordersData);
      setProducts(productsData);
    } catch (error) {
      console.error('Failed to load data:', error);
      alert(error instanceof Error ? error.message : 'Failed to load analytics data');
    } finally {
      setLoading(false);
    }
  };

  const calculateAnalytics = () => {
    const now = new Date();
    const periodStart = new Date();
    
    switch (period) {
      case '7d':
        periodStart.setDate(now.getDate() - 7);
        break;
      case '30d':
        periodStart.setDate(now.getDate() - 30);
        break;
      case '90d':
        periodStart.setDate(now.getDate() - 90);
        break;
      case 'all':
        periodStart.setTime(0);
        break;
    }

    const filteredOrders = orders.filter((order) => {
      if (period === 'all') return true;
      const orderDate = new Date(order.createdAt);
      return orderDate >= periodStart;
    });

    const completedOrders = filteredOrders.filter(
      (o) => o.status === 'captured' || o.status === 'paid'
    );

    const totalRevenue = completedOrders.reduce((sum, o) => sum + o.amount, 0);
    const totalOrders = filteredOrders.length;
    const averageOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;

    // Calculate previous period for comparison
    const previousPeriodStart = new Date(periodStart);
    switch (period) {
      case '7d':
        previousPeriodStart.setDate(previousPeriodStart.getDate() - 7);
        break;
      case '30d':
        previousPeriodStart.setDate(previousPeriodStart.getDate() - 30);
        break;
      case '90d':
        previousPeriodStart.setDate(previousPeriodStart.getDate() - 90);
        break;
    }

    const previousPeriodOrders = orders.filter((order) => {
      if (period === 'all') return false;
      const orderDate = new Date(order.createdAt);
      return orderDate >= previousPeriodStart && orderDate < periodStart;
    });

    const previousRevenue = previousPeriodOrders
      .filter((o) => o.status === 'captured' || o.status === 'paid')
      .reduce((sum, o) => sum + o.amount, 0);

    const revenueChange =
      previousRevenue > 0 ? ((totalRevenue - previousRevenue) / previousRevenue) * 100 : 0;
    const ordersChange =
      previousPeriodOrders.length > 0
        ? ((totalOrders - previousPeriodOrders.length) / previousPeriodOrders.length) * 100
        : 0;

    // Top products
    const productStats = new Map<
      string,
      { productId: string; title: string; quantity: number; revenue: number }
    >();

    completedOrders.forEach((order) => {
      order.items?.forEach((item) => {
        const existing = productStats.get(item.productId) || {
          productId: item.productId,
          title: item.title,
          quantity: 0,
          revenue: 0,
        };
        productStats.set(item.productId, {
          productId: item.productId,
          title: item.title,
          quantity: existing.quantity + item.qty,
          revenue: existing.revenue + item.price * item.qty,
        });
      });
    });

    const topProducts = Array.from(productStats.values())
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 5);

    // Revenue by day
    const revenueByDayMap = new Map<string, { revenue: number; orders: number }>();

    completedOrders.forEach((order) => {
      const date = new Date(order.createdAt).toLocaleDateString('en-IN', {
        month: 'short',
        day: 'numeric',
      });
      const existing = revenueByDayMap.get(date) || { revenue: 0, orders: 0 };
      revenueByDayMap.set(date, {
        revenue: existing.revenue + order.amount,
        orders: existing.orders + 1,
      });
    });

    const revenueByDay = Array.from(revenueByDayMap.entries())
      .map(([date, data]) => ({ date, ...data }))
      .sort((a, b) => {
        const dateA = new Date(a.date);
        const dateB = new Date(b.date);
        return dateA.getTime() - dateB.getTime();
      });

    // Status breakdown
    const statusBreakdown = {
      pending: filteredOrders.filter((o) => o.status === 'pending').length,
      captured: filteredOrders.filter((o) => o.status === 'captured').length,
      paid: filteredOrders.filter((o) => o.status === 'paid').length,
      failed: filteredOrders.filter((o) => o.status === 'failed').length,
    };

    // Product stats
    const activeProducts = products.filter((p) => p.active !== false).length;
    const lowStockProducts = products.filter((p) => p.stock > 0 && p.stock < 10).length;

    setAnalytics({
      totalRevenue,
      totalOrders,
      averageOrderValue,
      revenueChange,
      ordersChange,
      topProducts,
      revenueByDay,
      statusBreakdown,
      totalProducts: products.length,
      activeProducts,
      lowStockProducts,
    });
  };

  const handleLogout = () => {
    adminLogout();
    navigate('/admin/login');
  };

  const getMaxRevenue = () => {
    if (!analytics || analytics.revenueByDay.length === 0) return 1;
    return Math.max(...analytics.revenueByDay.map((d) => d.revenue));
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-12 w-12 animate-spin rounded-full border-4 border-brand/20 border-t-brand"></div>
      </div>
    );
  }

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
                <h1 className="font-display text-2xl text-brand-dark">Analytics Dashboard</h1>
                <p className="text-sm text-brand-dark/70">Track your store performance</p>
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
        {/* Period Selector */}
        <div className="mb-6 flex items-center justify-between">
          <div className="flex gap-2">
            {(['7d', '30d', '90d', 'all'] as TimePeriod[]).map((p) => (
              <button
                key={p}
                onClick={() => setPeriod(p)}
                className={`rounded-full px-4 py-2 text-sm font-semibold transition ${
                  period === p
                    ? 'bg-brand text-white'
                    : 'bg-white text-brand-dark border border-brand/20 hover:bg-brand-light/20'
                }`}
              >
                {p === '7d' ? '7 Days' : p === '30d' ? '30 Days' : p === '90d' ? '90 Days' : 'All Time'}
              </button>
            ))}
          </div>
        </div>

        {analytics && (
          <>
            {/* Key Metrics */}
            <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <div className="rounded-2xl border border-brand/15 bg-white p-6 shadow-sm">
                <div className="mb-2 flex items-center justify-between">
                  <p className="text-sm text-brand-dark/70">Total Revenue</p>
                  <CurrencyDollarIcon className="h-5 w-5 text-brand" />
                </div>
                <p className="mb-1 font-display text-3xl text-brand-dark">
                  {formatINR(analytics.totalRevenue)}
                </p>
                <div className="flex items-center gap-1 text-xs">
                  {analytics.revenueChange >= 0 ? (
                    <>
                      <ArrowUpIcon className="h-4 w-4 text-green-600" />
                      <span className="text-green-600">
                        {Math.abs(analytics.revenueChange).toFixed(1)}%
                      </span>
                    </>
                  ) : (
                    <>
                      <ArrowDownIcon className="h-4 w-4 text-red-600" />
                      <span className="text-red-600">
                        {Math.abs(analytics.revenueChange).toFixed(1)}%
                      </span>
                    </>
                  )}
                  <span className="text-brand-dark/60">vs previous period</span>
                </div>
              </div>

              <div className="rounded-2xl border border-brand/15 bg-white p-6 shadow-sm">
                <div className="mb-2 flex items-center justify-between">
                  <p className="text-sm text-brand-dark/70">Total Orders</p>
                  <ShoppingBagIcon className="h-5 w-5 text-brand" />
                </div>
                <p className="mb-1 font-display text-3xl text-brand-dark">
                  {analytics.totalOrders}
                </p>
                <div className="flex items-center gap-1 text-xs">
                  {analytics.ordersChange >= 0 ? (
                    <>
                      <ArrowUpIcon className="h-4 w-4 text-green-600" />
                      <span className="text-green-600">
                        {Math.abs(analytics.ordersChange).toFixed(1)}%
                      </span>
                    </>
                  ) : (
                    <>
                      <ArrowDownIcon className="h-4 w-4 text-red-600" />
                      <span className="text-red-600">
                        {Math.abs(analytics.ordersChange).toFixed(1)}%
                      </span>
                    </>
                  )}
                  <span className="text-brand-dark/60">vs previous period</span>
                </div>
              </div>

              <div className="rounded-2xl border border-brand/15 bg-white p-6 shadow-sm">
                <div className="mb-2 flex items-center justify-between">
                  <p className="text-sm text-brand-dark/70">Average Order Value</p>
                  <ChartBarIcon className="h-5 w-5 text-brand" />
                </div>
                <p className="mb-1 font-display text-3xl text-brand-dark">
                  {formatINR(analytics.averageOrderValue)}
                </p>
                <p className="text-xs text-brand-dark/60">Per order</p>
              </div>

              <div className="rounded-2xl border border-brand/15 bg-white p-6 shadow-sm">
                <div className="mb-2 flex items-center justify-between">
                  <p className="text-sm text-brand-dark/70">Active Products</p>
                  <ChartBarIcon className="h-5 w-5 text-brand" />
                </div>
                <p className="mb-1 font-display text-3xl text-brand-dark">
                  {analytics.activeProducts}
                </p>
                <p className="text-xs text-brand-dark/60">
                  {analytics.lowStockProducts} low stock
                </p>
              </div>
            </div>

            {/* Revenue Chart */}
            <div className="mb-8 rounded-2xl border border-brand/15 bg-white p-6 shadow-sm">
              <h2 className="mb-6 font-display text-xl text-brand-dark">Revenue Trend</h2>
              {analytics.revenueByDay.length > 0 ? (
                <div className="space-y-4">
                  <div className="flex h-64 items-end justify-between gap-2">
                    {analytics.revenueByDay.map((day, idx) => {
                      const maxRevenue = getMaxRevenue();
                      const height = maxRevenue > 0 ? (day.revenue / maxRevenue) * 100 : 0;
                      return (
                        <div key={idx} className="flex-1">
                          <div className="group relative">
                            <div
                              className="w-full rounded-t-lg bg-brand transition hover:bg-brand-dark"
                              style={{ height: `${height}%`, minHeight: '4px' }}
                            />
                            <div className="absolute bottom-full left-1/2 mb-2 hidden -translate-x-1/2 whitespace-nowrap rounded bg-brand-dark px-2 py-1 text-xs text-white group-hover:block">
                              {formatINR(day.revenue)}
                              <br />
                              {day.orders} orders
                            </div>
                          </div>
                          <div className="mt-2 text-center text-xs text-brand-dark/70">
                            {day.date}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ) : (
                <div className="py-12 text-center text-brand-dark/70">No data for this period</div>
              )}
            </div>

            <div className="grid gap-6 lg:grid-cols-2">
              {/* Top Products */}
              <div className="rounded-2xl border border-brand/15 bg-white p-6 shadow-sm">
                <h2 className="mb-6 font-display text-xl text-brand-dark">Top Products</h2>
                {analytics.topProducts.length > 0 ? (
                  <div className="space-y-4">
                    {analytics.topProducts.map((product, idx) => (
                      <div key={idx} className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-3">
                            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-brand-light/20 text-sm font-semibold text-brand">
                              {idx + 1}
                            </div>
                            <div>
                              <p className="font-semibold text-brand-dark">{product.title}</p>
                              <p className="text-xs text-brand-dark/60">
                                {product.quantity} sold
                              </p>
                            </div>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold text-brand-dark">
                            {formatINR(product.revenue)}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="py-8 text-center text-brand-dark/70">No sales data</div>
                )}
              </div>

              {/* Order Status Breakdown */}
              <div className="rounded-2xl border border-brand/15 bg-white p-6 shadow-sm">
                <h2 className="mb-6 font-display text-xl text-brand-dark">Order Status</h2>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="h-3 w-3 rounded-full bg-yellow-500"></div>
                      <span className="text-sm font-medium text-brand-dark">Pending</span>
                    </div>
                    <span className="font-semibold text-brand-dark">
                      {analytics.statusBreakdown.pending}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="h-3 w-3 rounded-full bg-green-500"></div>
                      <span className="text-sm font-medium text-brand-dark">Captured</span>
                    </div>
                    <span className="font-semibold text-brand-dark">
                      {analytics.statusBreakdown.captured}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="h-3 w-3 rounded-full bg-blue-500"></div>
                      <span className="text-sm font-medium text-brand-dark">Paid</span>
                    </div>
                    <span className="font-semibold text-brand-dark">
                      {analytics.statusBreakdown.paid}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="h-3 w-3 rounded-full bg-red-500"></div>
                      <span className="text-sm font-medium text-brand-dark">Failed</span>
                    </div>
                    <span className="font-semibold text-brand-dark">
                      {analytics.statusBreakdown.failed}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

