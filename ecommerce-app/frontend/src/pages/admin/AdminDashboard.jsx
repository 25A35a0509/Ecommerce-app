import { useState, useEffect } from 'react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import { DollarSign, ShoppingBag, Package, TrendingUp } from 'lucide-react';
import { orderService } from '../../services/orderService';
import StatCard from '../../components/StatCard';
import { StatCardSkeleton } from '../../components/Skeletons';
import { formatPrice, formatDate, orderStatusColors } from '../../utils/helpers';
import { Link } from 'react-router-dom';
import { getInitials } from '../../utils/helpers';

const STATUS_COLORS = {
  processing: '#3B82F6',
  shipped: '#F59E0B',
  delivered: '#10B981',
  cancelled: '#EF4444',
};

const AdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    orderService
      .getOrderStats()
      .then((data) => setStats(data.stats))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const revenueChartData = (() => {
    const days = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const key = d.toISOString().slice(0, 10);
      const found = stats?.dailyRevenue?.find((w) => w._id === key);
      days.push({
        day: d.toLocaleDateString('en-US', { weekday: 'short' }),
        revenue: found ? found.revenue : 0,
      });
    }
    return days;
  })();

  const statusData = stats?.statusBreakdown?.map((s) => ({
    name: s._id,
    value: s.count,
    color: STATUS_COLORS[s._id] || '#94A3B8',
  })) || [];

  return (
    <div>
      <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {loading ? (
          Array.from({ length: 4 }).map((_, i) => <StatCardSkeleton key={i} />)
        ) : (
          <>
            <StatCard title="Total Revenue" value={formatPrice(stats.totalRevenue).slice(1)} icon={DollarSign} color="bg-emerald-500" prefix="$" />
            <StatCard title="Total Orders" value={stats.totalOrders} icon={ShoppingBag} color="bg-primary" />
            <StatCard
              title="Processing"
              value={stats.statusBreakdown.find((s) => s._id === 'processing')?.count || 0}
              icon={Package}
              color="bg-blue-500"
            />
            <StatCard
              title="Delivered"
              value={stats.statusBreakdown.find((s) => s._id === 'delivered')?.count || 0}
              icon={TrendingUp}
              color="bg-amber-500"
            />
          </>
        )}
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Revenue chart */}
        <div className="card p-5 lg:col-span-2">
          <h3 className="mb-4 text-lg font-bold text-slate-900 dark:text-white">Revenue (Last 7 Days)</h3>
          {loading ? (
            <div className="skeleton h-64 w-full" />
          ) : (
            <ResponsiveContainer width="100%" height={260}>
              <AreaChart data={revenueChartData}>
                <defs>
                  <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#16A34A" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#16A34A" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                <XAxis dataKey="day" tick={{ fontSize: 12, fill: '#94A3B8' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 12, fill: '#94A3B8' }} axisLine={false} tickLine={false} />
                <Tooltip
                  formatter={(value) => formatPrice(value)}
                  contentStyle={{ borderRadius: '12px', border: '1px solid #E2E8F0', fontSize: '13px' }}
                />
                <Area type="monotone" dataKey="revenue" stroke="#16A34A" strokeWidth={2} fill="url(#revenueGradient)" />
              </AreaChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Order status breakdown */}
        <div className="card p-5">
          <h3 className="mb-4 text-lg font-bold text-slate-900 dark:text-white">Order Status</h3>
          {loading ? (
            <div className="skeleton h-48 w-full" />
          ) : statusData.length === 0 ? (
            <div className="flex h-48 items-center justify-center text-sm text-slate-400">No orders yet</div>
          ) : (
            <ResponsiveContainer width="100%" height={180}>
              <PieChart>
                <Pie data={statusData} dataKey="value" nameKey="name" innerRadius={50} outerRadius={75} paddingAngle={4}>
                  {statusData.map((entry, index) => (
                    <Cell key={index} fill={entry.color} stroke="none" />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ borderRadius: '12px', border: '1px solid #E2E8F0', fontSize: '13px' }} />
              </PieChart>
            </ResponsiveContainer>
          )}
          <div className="mt-3 space-y-2">
            {statusData.map((s) => (
              <div key={s.name} className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: s.color }} />
                  <span className="capitalize text-slate-600 dark:text-slate-300">{s.name}</span>
                </div>
                <span className="font-semibold text-slate-900 dark:text-white">{s.value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Recent orders */}
        <div className="card p-5">
          <h3 className="mb-4 text-lg font-bold text-slate-900 dark:text-white">Recent Orders</h3>
          {loading ? (
            <div className="space-y-3">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="skeleton h-12 w-full" />
              ))}
            </div>
          ) : stats.recentOrders.length === 0 ? (
            <p className="text-sm text-slate-400">No orders yet</p>
          ) : (
            <div className="space-y-3">
              {stats.recentOrders.map((order) => {
                const statusConfig = orderStatusColors[order.orderStatus] || orderStatusColors.processing;
                return (
                  <Link
                    key={order._id}
                    to={`/admin/orders`}
                    className="flex items-center gap-3 rounded-xl p-2 transition-colors hover:bg-slate-50 dark:hover:bg-slate-800/40"
                  >
                    <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-primary to-primary-700 text-xs font-bold text-white">
                      {getInitials(order.user?.name)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="truncate text-sm font-medium text-slate-900 dark:text-white">
                        {order.user?.name || 'Unknown'} — #{order._id.slice(-6).toUpperCase()}
                      </p>
                      <p className="text-xs text-slate-400">{formatDate(order.createdAt)}</p>
                    </div>
                    <span className={`badge ${statusConfig.bg} ${statusConfig.text}`}>{statusConfig.label}</span>
                    <p className="text-sm font-bold text-slate-900 dark:text-white">{formatPrice(order.totalAmount)}</p>
                  </Link>
                );
              })}
            </div>
          )}
        </div>

        {/* Top products */}
        <div className="card p-5">
          <h3 className="mb-4 text-lg font-bold text-slate-900 dark:text-white">Top Selling Products</h3>
          {loading ? (
            <div className="space-y-3">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="skeleton h-12 w-full" />
              ))}
            </div>
          ) : stats.topProducts.length === 0 ? (
            <p className="text-sm text-slate-400">No sales data yet</p>
          ) : (
            <div className="space-y-3">
              {stats.topProducts.map((product, i) => (
                <div key={product._id} className="flex items-center gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/10 text-sm font-bold text-primary">
                    #{i + 1}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="truncate text-sm font-medium text-slate-900 dark:text-white">{product.name}</p>
                    <p className="text-xs text-slate-400">{product.totalSold} sold</p>
                  </div>
                  <p className="text-sm font-bold text-slate-900 dark:text-white">{formatPrice(product.revenue)}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
