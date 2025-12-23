import { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  ArrowLeftIcon,
  ArrowRightOnRectangleIcon,
  ChartBarIcon,
  GlobeAltIcon,
  ShoppingBagIcon,
  EyeIcon,
  ShoppingCartIcon,
  ArrowDownTrayIcon,
  CalendarIcon,
  FunnelIcon,
  CurrencyDollarIcon,
} from '@heroicons/react/24/outline';
import { adminLogout, getTrafficMetrics, getProductEngagement, adminGetProducts } from '../api/admin';
import { formatINR } from '../lib/currency';
import type { TrafficMetrics, ProductEngagement } from '../api/admin';
import type { Product } from '../types';

type TimePeriod = '7d' | '30d' | '90d' | 'all';

export const AdminBehaviorAnalyticsPage = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState<TimePeriod>('30d');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedRegion, setSelectedRegion] = useState<string>('all');
  const [trafficData, setTrafficData] = useState<TrafficMetrics | null>(null);
  const [productData, setProductData] = useState<ProductEngagement | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [autoRefresh, setAutoRefresh] = useState(false);

  useEffect(() => {
    loadData();
  }, [period, selectedCategory, selectedRegion]);

  useEffect(() => {
    if (autoRefresh) {
      const interval = setInterval(() => {
        loadData();
      }, 30000); // Refresh every 30 seconds
      return () => clearInterval(interval);
    }
  }, [autoRefresh, period, selectedCategory, selectedRegion]);

  const loadData = async () => {
    try {
      setLoading(true);
      const startDate = getStartDate(period);
      const endDate = new Date().toISOString();

      const [traffic, engagement, productsList] = await Promise.all([
        getTrafficMetrics({
          startDate,
          endDate,
          region: selectedRegion !== 'all' ? selectedRegion : undefined,
        }),
        getProductEngagement({
          startDate,
          endDate,
          category: selectedCategory !== 'all' ? selectedCategory : undefined,
        }),
        adminGetProducts(),
      ]);

      setTrafficData(traffic);
      setProductData(engagement);
      setProducts(productsList);
    } catch (error) {
      console.error('Failed to load analytics:', error);
      alert(error instanceof Error ? error.message : 'Failed to load analytics data');
    } finally {
      setLoading(false);
    }
  };

  const getStartDate = (p: TimePeriod): string => {
    const now = new Date();
    const start = new Date();
    switch (p) {
      case '7d':
        start.setDate(now.getDate() - 7);
        break;
      case '30d':
        start.setDate(now.getDate() - 30);
        break;
      case '90d':
        start.setDate(now.getDate() - 90);
        break;
      case 'all':
        start.setTime(0);
        break;
    }
    return start.toISOString();
  };

  const handleExportCSV = () => {
    if (!trafficData || !productData) return;

    // Traffic CSV
    const trafficRows = [
      ['Date', 'Page Views', 'Unique Visitors'],
      ...trafficData.pageViewsByDay.map((d) => [d.date, d.views.toString(), d.uniqueVisitors.toString()]),
    ];
    const trafficCSV = trafficRows.map((row) => row.join(',')).join('\n');

    // Product CSV
    const productRows = [
      ['Product', 'Views', 'Cart Additions', 'Conversion Rate (%)'],
      ...productData.products.map((p) => [
        p.title,
        p.views.toString(),
        p.cartAdditions.toString(),
        p.conversionRate.toFixed(2),
      ]),
    ];
    const productCSV = productRows.map((row) => row.join(',')).join('\n');

    // Download
    const blob = new Blob([`Traffic Data\n${trafficCSV}\n\nProduct Engagement\n${productCSV}`], {
      type: 'text/csv',
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `analytics-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleLogout = () => {
    adminLogout();
    navigate('/admin/login');
  };

  const getMaxValue = (data: number[]) => {
    return Math.max(...data, 1);
  };

  const categories = ['all', ...new Set(products.map((p) => p.category).filter(Boolean))];

  const regions = trafficData
    ? ['all', ...new Set(trafficData.geographicBreakdown.map((g) => g.region).filter(Boolean))]
    : ['all'];

  if (loading && !trafficData) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-12 w-12 animate-spin rounded-full border-4 border-brand/20 border-t-brand"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-brand-light/10 to-white">
      {/* Header */}
      <header className="border-b border-brand/10 bg-white/90 backdrop-blur-sm sticky top-0 z-10">
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
                <h1 className="font-display text-2xl text-brand-dark">User Behavior Analytics</h1>
                <p className="text-sm text-brand-dark/70">Track website traffic and product engagement</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <label className="flex items-center gap-2 text-sm text-brand-dark/70">
                <input
                  type="checkbox"
                  checked={autoRefresh}
                  onChange={(e) => setAutoRefresh(e.target.checked)}
                  className="rounded border-brand/20"
                />
                Auto-refresh
              </label>
              <button
                onClick={handleExportCSV}
                className="flex items-center gap-2 rounded-full border border-brand/20 bg-white px-4 py-2 text-sm font-semibold text-brand transition hover:bg-brand-light/20"
              >
                <ArrowDownTrayIcon className="h-5 w-5" />
                Export CSV
              </button>
              <button
                onClick={handleLogout}
                className="flex items-center gap-2 rounded-full border border-brand/20 px-4 py-2 text-sm font-semibold text-brand transition hover:bg-brand-light/20"
              >
                <ArrowRightOnRectangleIcon className="h-5 w-5" />
                Logout
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-7xl px-6 py-8">
        {/* Filters */}
        <div className="mb-6 flex flex-wrap items-center gap-4 rounded-2xl border border-brand/15 bg-white p-4 shadow-sm">
          <div className="flex items-center gap-2">
            <CalendarIcon className="h-5 w-5 text-brand" />
            <span className="text-sm font-semibold text-brand-dark">Period:</span>
            {(['7d', '30d', '90d', 'all'] as TimePeriod[]).map((p) => (
              <button
                key={p}
                onClick={() => setPeriod(p)}
                className={`rounded-full px-3 py-1 text-xs font-semibold transition ${
                  period === p
                    ? 'bg-brand text-white'
                    : 'bg-white text-brand-dark border border-brand/20 hover:bg-brand-light/20'
                }`}
              >
                {p === '7d' ? '7 Days' : p === '30d' ? '30 Days' : p === '90d' ? '90 Days' : 'All Time'}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-2">
            <FunnelIcon className="h-5 w-5 text-brand" />
            <span className="text-sm font-semibold text-brand-dark">Category:</span>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="rounded-lg border border-brand/20 bg-white px-3 py-1 text-sm text-brand-dark focus:outline-none focus:ring-2 focus:ring-brand/20"
            >
              {categories.map((cat) => (
                <option key={cat} value={cat}>
                  {cat === 'all' ? 'All Categories' : cat}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-2">
            <GlobeAltIcon className="h-5 w-5 text-brand" />
            <span className="text-sm font-semibold text-brand-dark">Region:</span>
            <select
              value={selectedRegion}
              onChange={(e) => setSelectedRegion(e.target.value)}
              className="rounded-lg border border-brand/20 bg-white px-3 py-1 text-sm text-brand-dark focus:outline-none focus:ring-2 focus:ring-brand/20"
            >
              {regions.map((reg) => (
                <option key={reg} value={reg}>
                  {reg === 'all' ? 'All Regions' : reg || 'Unknown'}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Traffic Metrics */}
        {trafficData && (
          <div className="mb-8">
            <h2 className="mb-4 font-display text-xl text-brand-dark">Website Traffic</h2>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 mb-6">
              <div className="rounded-2xl border border-brand/15 bg-white p-6 shadow-sm">
                <div className="mb-2 flex items-center justify-between">
                  <p className="text-sm text-brand-dark/70">Total Visitors</p>
                  <GlobeAltIcon className="h-5 w-5 text-brand" />
                </div>
                <p className="font-display text-3xl text-brand-dark">{trafficData.totalVisitors}</p>
                <p className="mt-1 text-xs text-brand-dark/60">Unique sessions</p>
              </div>

              <div className="rounded-2xl border border-brand/15 bg-white p-6 shadow-sm">
                <div className="mb-2 flex items-center justify-between">
                  <p className="text-sm text-brand-dark/70">Total Page Views</p>
                  <EyeIcon className="h-5 w-5 text-brand" />
                </div>
                <p className="font-display text-3xl text-brand-dark">
                  {trafficData.pageViewsByDay.reduce((sum, d) => sum + d.views, 0)}
                </p>
                <p className="mt-1 text-xs text-brand-dark/60">All pages</p>
              </div>

              <div className="rounded-2xl border border-brand/15 bg-white p-6 shadow-sm">
                <div className="mb-2 flex items-center justify-between">
                  <p className="text-sm text-brand-dark/70">Avg. Views/Day</p>
                  <ChartBarIcon className="h-5 w-5 text-brand" />
                </div>
                <p className="font-display text-3xl text-brand-dark">
                  {trafficData.pageViewsByDay.length > 0
                    ? Math.round(
                        trafficData.pageViewsByDay.reduce((sum, d) => sum + d.views, 0) /
                          trafficData.pageViewsByDay.length
                      )
                    : 0}
                </p>
                <p className="mt-1 text-xs text-brand-dark/60">Daily average</p>
              </div>

              <div className="rounded-2xl border border-brand/15 bg-white p-6 shadow-sm">
                <div className="mb-2 flex items-center justify-between">
                  <p className="text-sm text-brand-dark/70">Regions</p>
                  <GlobeAltIcon className="h-5 w-5 text-brand" />
                </div>
                <p className="font-display text-3xl text-brand-dark">
                  {trafficData.geographicBreakdown.length}
                </p>
                <p className="mt-1 text-xs text-brand-dark/60">Active regions</p>
              </div>
            </div>

            {/* Traffic Trend Chart */}
            <div className="rounded-2xl border border-brand/15 bg-white p-6 shadow-sm mb-6">
              <h3 className="mb-4 font-display text-lg text-brand-dark">Traffic Trend</h3>
              {trafficData.pageViewsByDay.length > 0 ? (
                <div className="space-y-4">
                  <div className="flex h-64 items-end justify-between gap-1">
                    {trafficData.pageViewsByDay.map((day, idx) => {
                      const maxViews = getMaxValue(trafficData.pageViewsByDay.map((d) => d.views));
                      const maxVisitors = getMaxValue(
                        trafficData.pageViewsByDay.map((d) => d.uniqueVisitors)
                      );
                      const viewsHeight = (day.views / maxViews) * 100;
                      const visitorsHeight = (day.uniqueVisitors / maxVisitors) * 100;

                      return (
                        <div key={idx} className="flex-1 group relative">
                          <div className="flex h-full items-end gap-0.5">
                            <div
                              className="w-full rounded-t bg-brand transition hover:bg-brand-dark"
                              style={{ height: `${viewsHeight}%`, minHeight: '4px' }}
                              title={`Views: ${day.views}`}
                            />
                            <div
                              className="w-full rounded-t bg-brand-light transition hover:bg-brand"
                              style={{ height: `${visitorsHeight}%`, minHeight: '4px' }}
                              title={`Visitors: ${day.uniqueVisitors}`}
                            />
                          </div>
                          <div className="absolute bottom-full left-1/2 mb-2 hidden -translate-x-1/2 whitespace-nowrap rounded bg-brand-dark px-2 py-1 text-xs text-white group-hover:block">
                            {day.date}
                            <br />
                            Views: {day.views}
                            <br />
                            Visitors: {day.uniqueVisitors}
                          </div>
                          <div className="mt-2 text-center text-xs text-brand-dark/70">
                            {new Date(day.date).toLocaleDateString('en-IN', { month: 'short', day: 'numeric' })}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                  <div className="flex items-center justify-center gap-4 text-xs text-brand-dark/70">
                    <div className="flex items-center gap-2">
                      <div className="h-3 w-3 rounded bg-brand"></div>
                      <span>Page Views</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="h-3 w-3 rounded bg-brand-light"></div>
                      <span>Unique Visitors</span>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="py-12 text-center text-brand-dark/70">No traffic data for this period</div>
              )}
            </div>

            {/* Geographic Breakdown */}
            <div className="rounded-2xl border border-brand/15 bg-white p-6 shadow-sm mb-6">
              <h3 className="mb-4 font-display text-lg text-brand-dark">Geographic Breakdown</h3>
              {trafficData.geographicBreakdown.length > 0 ? (
                <div className="space-y-3">
                  {trafficData.geographicBreakdown.slice(0, 10).map((geo, idx) => {
                    const maxVisitors = getMaxValue(trafficData.geographicBreakdown.map((g) => g.visitors));
                    const width = (geo.visitors / maxVisitors) * 100;

                    return (
                      <div key={idx} className="space-y-1">
                        <div className="flex items-center justify-between text-sm">
                          <span className="font-medium text-brand-dark">
                            {geo.region || 'Unknown'} {geo.country && `(${geo.country})`}
                          </span>
                          <span className="text-brand-dark/70">
                            {geo.visitors} visitors • {geo.views} views
                          </span>
                        </div>
                        <div className="h-2 w-full rounded-full bg-brand-light/20">
                          <div
                            className="h-full rounded-full bg-brand transition"
                            style={{ width: `${width}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="py-8 text-center text-brand-dark/70">No geographic data available</div>
              )}
            </div>

            {/* Visitor List */}
            <div className="rounded-2xl border border-brand/15 bg-white p-6 shadow-sm">
              <h3 className="mb-4 font-display text-lg text-brand-dark">Visitor Details</h3>
              {trafficData.visitors && trafficData.visitors.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-brand/10">
                        <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-brand-dark/70">
                          User/Visitor
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-brand-dark/70">
                          Location
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-brand-dark/70">
                          Page Views
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-brand-dark/70">
                          First Visit
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-brand-dark/70">
                          Last Visit
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-brand-dark/70">
                          Pages Visited
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-brand/5">
                      {trafficData.visitors.map((visitor) => (
                        <tr key={visitor.sessionId} className="hover:bg-brand-light/5 transition">
                          <td className="px-4 py-3">
                            <div className="text-sm">
                              {visitor.userName ? (
                                <div>
                                  <p className="font-semibold text-brand-dark">{visitor.userName}</p>
                                  <p className="text-xs text-brand-dark/60">{visitor.userEmail}</p>
                                  <p className="text-xs text-brand-dark/40">Registered User</p>
                                </div>
                              ) : (
                                <div>
                                  <p className="font-medium text-brand-dark">Guest Visitor</p>
                                  <p className="text-xs text-brand-dark/60">
                                    {visitor.sessionId.slice(0, 16)}...
                                  </p>
                                </div>
                              )}
                            </div>
                          </td>
                          <td className="px-4 py-3">
                            <div className="text-sm text-brand-dark">
                              {visitor.city && <p>{visitor.city}</p>}
                              {visitor.region && <p className="text-xs text-brand-dark/70">{visitor.region}</p>}
                              {visitor.country && (
                                <p className="text-xs text-brand-dark/60">{visitor.country}</p>
                              )}
                              {!visitor.city && !visitor.region && !visitor.country && (
                                <p className="text-xs text-brand-dark/60">Unknown</p>
                              )}
                            </div>
                          </td>
                          <td className="px-4 py-3">
                            <span className="text-sm font-semibold text-brand-dark">{visitor.pageViews}</span>
                          </td>
                          <td className="px-4 py-3">
                            <p className="text-sm text-brand-dark/70">
                              {new Date(visitor.firstVisit).toLocaleString('en-IN', {
                                month: 'short',
                                day: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit',
                              })}
                            </p>
                          </td>
                          <td className="px-4 py-3">
                            <p className="text-sm text-brand-dark/70">
                              {new Date(visitor.lastVisit).toLocaleString('en-IN', {
                                month: 'short',
                                day: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit',
                              })}
                            </p>
                          </td>
                          <td className="px-4 py-3">
                            <div className="text-xs text-brand-dark/70">
                              {visitor.paths.slice(0, 3).map((path, i) => (
                                <p key={i} className="truncate max-w-[150px]" title={path}>
                                  {path}
                                </p>
                              ))}
                              {visitor.paths.length > 3 && (
                                <p className="text-brand-dark/60">+{visitor.paths.length - 3} more</p>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="py-8 text-center text-brand-dark/70">No visitor data available</div>
              )}
            </div>
          </div>
        )}

        {/* Product Engagement */}
        {productData && (
          <div>
            <h2 className="mb-4 font-display text-xl text-brand-dark">Product Engagement</h2>
            <div className="grid gap-4 sm:grid-cols-3 mb-6">
              <div className="rounded-2xl border border-brand/15 bg-white p-6 shadow-sm">
                <div className="mb-2 flex items-center justify-between">
                  <p className="text-sm text-brand-dark/70">Total Product Views</p>
                  <EyeIcon className="h-5 w-5 text-brand" />
                </div>
                <p className="font-display text-3xl text-brand-dark">{productData.summary.totalProductViews}</p>
              </div>

              <div className="rounded-2xl border border-brand/15 bg-white p-6 shadow-sm">
                <div className="mb-2 flex items-center justify-between">
                  <p className="text-sm text-brand-dark/70">Cart Additions</p>
                  <ShoppingCartIcon className="h-5 w-5 text-brand" />
                </div>
                <p className="font-display text-3xl text-brand-dark">{productData.summary.totalCartAdditions}</p>
              </div>

              <div className="rounded-2xl border border-brand/15 bg-white p-6 shadow-sm">
                <div className="mb-2 flex items-center justify-between">
                  <p className="text-sm text-brand-dark/70">Total Sales Revenue</p>
                  <CurrencyDollarIcon className="h-5 w-5 text-green-600" />
                </div>
                <p className="font-display text-3xl text-green-700">
                  {formatINR(productData.summary.totalSalesRevenue)}
                </p>
                <p className="mt-1 text-xs text-brand-dark/60">
                  {productData.summary.totalSalesQuantity} items sold
                </p>
              </div>
            </div>

            {/* Top Products - Cart Additions */}
            <div className="rounded-2xl border border-brand/15 bg-white p-6 shadow-sm mb-6">
              <h3 className="mb-4 font-display text-lg text-brand-dark">Most Added to Cart</h3>
              {productData.products.length > 0 ? (
                <div className="space-y-4">
                  {productData.products
                    .filter((p) => p.cartAdditions > 0)
                    .sort((a, b) => b.cartAdditions - a.cartAdditions)
                    .slice(0, 10)
                    .map((product, idx) => {
                      const maxCart = getMaxValue(
                        productData.products.filter((p) => p.cartAdditions > 0).map((p) => p.cartAdditions)
                      );
                      const cartWidth = maxCart > 0 ? (product.cartAdditions / maxCart) * 100 : 0;
                      const maxSales = getMaxValue(
                        productData.products.filter((p) => p.salesQuantity > 0).map((p) => p.salesQuantity)
                      );
                      const salesWidth = maxSales > 0 ? (product.salesQuantity / maxSales) * 100 : 0;

                      return (
                        <div key={product.productId} className="space-y-2">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3 flex-1">
                              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-brand-light/20 text-sm font-semibold text-brand">
                                {idx + 1}
                              </div>
                              <div className="flex-1">
                                <p className="font-semibold text-brand-dark">{product.title}</p>
                                {product.category && (
                                  <p className="text-xs text-brand-dark/60">{product.category}</p>
                                )}
                              </div>
                            </div>
                            <div className="text-right">
                              <p className="text-sm font-semibold text-brand-dark">
                                {product.cartAdditions} cart adds
                              </p>
                              <p className="text-xs text-brand-dark/60">
                                {product.salesQuantity > 0 ? `${product.salesQuantity} sold` : 'Not sold yet'}
                              </p>
                            </div>
                          </div>
                          <div className="space-y-1">
                            <div className="flex items-center gap-2 text-xs">
                              <ShoppingCartIcon className="h-4 w-4 text-brand" />
                              <span className="w-20 text-brand-dark/70">Cart Adds:</span>
                              <div className="flex-1 h-2 rounded-full bg-brand-light/20">
                                <div
                                  className="h-full rounded-full bg-brand transition"
                                  style={{ width: `${cartWidth}%` }}
                                />
                              </div>
                              <span className="text-xs font-semibold text-brand-dark w-12 text-right">
                                {product.cartAdditions}
                              </span>
                            </div>
                            {product.salesQuantity > 0 && (
                              <div className="flex items-center gap-2 text-xs">
                                <ShoppingBagIcon className="h-4 w-4 text-green-600" />
                                <span className="w-20 text-brand-dark/70">Sales:</span>
                                <div className="flex-1 h-2 rounded-full bg-green-100">
                                  <div
                                    className="h-full rounded-full bg-green-600 transition"
                                    style={{ width: `${salesWidth}%` }}
                                  />
                                </div>
                                <span className="text-xs font-semibold text-green-700 w-12 text-right">
                                  {product.salesQuantity} ({formatINR(product.salesRevenue)})
                                </span>
                              </div>
                            )}
                          </div>
                          <div className="flex items-center justify-between text-xs text-brand-dark/70">
                            <span>
                              {product.salesOrderCount > 0
                                ? `${product.salesOrderCount} successful order${product.salesOrderCount !== 1 ? 's' : ''}`
                                : 'No orders yet'}
                            </span>
                            <span>
                              {product.cartToOrderRate > 0
                                ? `Cart→Order: ${product.cartToOrderRate.toFixed(1)}%`
                                : 'View→Cart: ' + product.conversionRate.toFixed(1) + '%'}
                            </span>
                          </div>
                        </div>
                      );
                    })}
                </div>
              ) : (
                <div className="py-8 text-center text-brand-dark/70">No cart addition data</div>
              )}
            </div>

            {/* Top Products - Successful Sales */}
            <div className="rounded-2xl border border-brand/15 bg-white p-6 shadow-sm mb-6">
              <h3 className="mb-4 font-display text-lg text-brand-dark">Best Selling Products (Successful Orders)</h3>
              {productData.products.length > 0 ? (
                <div className="space-y-4">
                  {productData.products
                    .filter((p) => p.salesQuantity > 0)
                    .sort((a, b) => b.salesRevenue - a.salesRevenue)
                    .slice(0, 10)
                    .map((product, idx) => {
                      const maxRevenue = getMaxValue(
                        productData.products.filter((p) => p.salesRevenue > 0).map((p) => p.salesRevenue)
                      );
                      const revenueWidth = maxRevenue > 0 ? (product.salesRevenue / maxRevenue) * 100 : 0;

                      return (
                        <div key={product.productId} className="space-y-2">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3 flex-1">
                              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-green-100 text-sm font-semibold text-green-700">
                                {idx + 1}
                              </div>
                              <div className="flex-1">
                                <p className="font-semibold text-brand-dark">{product.title}</p>
                                {product.category && (
                                  <p className="text-xs text-brand-dark/60">{product.category}</p>
                                )}
                              </div>
                            </div>
                            <div className="text-right">
                              <p className="text-sm font-semibold text-green-700">
                                {formatINR(product.salesRevenue)}
                              </p>
                              <p className="text-xs text-brand-dark/60">
                                {product.salesQuantity} sold • {product.salesOrderCount} orders
                              </p>
                            </div>
                          </div>
                          <div className="space-y-1">
                            <div className="flex items-center gap-2 text-xs">
                              <ShoppingBagIcon className="h-4 w-4 text-green-600" />
                              <span className="w-20 text-brand-dark/70">Revenue:</span>
                              <div className="flex-1 h-2 rounded-full bg-green-100">
                                <div
                                  className="h-full rounded-full bg-green-600 transition"
                                  style={{ width: `${revenueWidth}%` }}
                                />
                              </div>
                              <span className="text-xs font-semibold text-green-700 w-20 text-right">
                                {formatINR(product.salesRevenue)}
                              </span>
                            </div>
                          </div>
                          <div className="flex items-center justify-between text-xs text-brand-dark/70">
                            <span>
                              {product.cartAdditions > 0
                                ? `${product.cartAdditions} cart additions`
                                : 'Not added to cart'}
                            </span>
                            <span>
                              Avg: {formatINR(product.salesRevenue / product.salesQuantity)} per unit
                            </span>
                          </div>
                        </div>
                      );
                    })}
                </div>
              ) : (
                <div className="py-8 text-center text-brand-dark/70">No sales data yet</div>
              )}
            </div>

            {/* Cart Additions vs Sales Comparison Chart */}
            <div className="rounded-2xl border border-brand/15 bg-white p-6 shadow-sm">
              <h3 className="mb-4 font-display text-lg text-brand-dark">Cart Additions vs Successful Sales</h3>
              {productData.products.length > 0 ? (
                <div>
                  <div className="flex h-64 items-end justify-between gap-1 mb-4">
                    {productData.products
                      .filter((p) => p.cartAdditions > 0 || p.salesQuantity > 0)
                      .sort((a, b) => b.cartAdditions - a.cartAdditions)
                      .slice(0, 10)
                      .map((product, idx) => {
                        const productsWithData = productData.products.filter(
                          (p) => p.cartAdditions > 0 || p.salesQuantity > 0
                        );
                        const maxCart = getMaxValue(productsWithData.map((p) => p.cartAdditions));
                        const maxSales = getMaxValue(productsWithData.map((p) => p.salesQuantity));
                        const cartHeight = maxCart > 0 ? (product.cartAdditions / maxCart) * 100 : 0;
                        const salesHeight = maxSales > 0 ? (product.salesQuantity / maxSales) * 100 : 0;

                        return (
                          <div key={product.productId} className="flex-1 group relative">
                            <div className="flex h-full items-end gap-0.5">
                              <div
                                className="w-full rounded-t bg-brand transition hover:bg-brand-dark"
                                style={{ height: `${cartHeight}%`, minHeight: '4px' }}
                                title={`Cart: ${product.cartAdditions}`}
                              />
                              {product.salesQuantity > 0 && (
                                <div
                                  className="w-full rounded-t bg-green-600 transition hover:bg-green-700"
                                  style={{ height: `${salesHeight}%`, minHeight: '4px' }}
                                  title={`Sales: ${product.salesQuantity}`}
                                />
                              )}
                            </div>
                            <div className="absolute bottom-full left-1/2 mb-2 hidden -translate-x-1/2 whitespace-nowrap rounded bg-brand-dark px-2 py-1 text-xs text-white group-hover:block z-10">
                              {product.title}
                              <br />
                              Cart: {product.cartAdditions}
                              <br />
                              {product.salesQuantity > 0 ? (
                                <>
                                  Sold: {product.salesQuantity}
                                  <br />
                                  Revenue: {formatINR(product.salesRevenue)}
                                </>
                              ) : (
                                'Not sold yet'
                              )}
                            </div>
                            <div className="mt-2 text-center text-xs text-brand-dark/70 truncate" title={product.title}>
                              #{idx + 1}
                            </div>
                          </div>
                        );
                      })}
                  </div>
                  <div className="flex items-center justify-center gap-4 text-xs text-brand-dark/70">
                    <div className="flex items-center gap-2">
                      <div className="h-3 w-3 rounded bg-brand"></div>
                      <span>Cart Additions</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="h-3 w-3 rounded bg-green-600"></div>
                      <span>Successful Sales</span>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="py-12 text-center text-brand-dark/70">No comparison data available</div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

