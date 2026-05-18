import { useState, useMemo, useEffect } from 'react';
import { motion } from 'motion/react';
import { AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { DollarSign, TrendingUp, Users, Calendar, Download, BarChart3, ShoppingCart } from 'lucide-react';
import { useCurrency } from '../../../contexts/CurrencyContext';
import { getRoutes, getActivities } from '../../../services/managementService';
import { getBookingAnalytics, getRevenueTrend, getTopItems } from '../../../services/reportsService';

type TimePeriod = '7d' | '30d' | '90d' | '1y';

interface RevenueData {
  date: string;
  revenue: number;
  bookings: number;
}

interface CategoryData {
  name: string;
  value: number;
  color: string;
}

interface TopItem {
  name: string;
  bookings: number;
  revenue: number;
}

const COLORS = {
  primary: '#3b82f6',
  success: '#10b981',
  warning: '#f59e0b',
  danger: '#ef4444',
  purple: '#a855f7',
  pink: '#ec4899',
  indigo: '#6366f1',
  teal: '#14b8a6',
};

const categoryColors = [
  COLORS.primary,
  COLORS.success,
  COLORS.warning,
  COLORS.purple,
  COLORS.pink,
  COLORS.teal,
];

export function ReportsPage() {
  const [period, setPeriod] = useState<TimePeriod>('30d');
  const [fromDate, setFromDate] = useState<string>('');
  const [toDate, setToDate] = useState<string>('');
  const [useCustomDates, setUseCustomDates] = useState(false);
  const { formatPrice } = useCurrency();
  const [routes, setRoutes] = useState<any[]>([]);
  const [activities, setActivities] = useState<any[]>([]);

  const [analytics, setAnalytics] = useState<any | null>(null);
  const [trendData, setTrendData] = useState<RevenueData[]>([]);
  const [topItems, setTopItems] = useState<{ topRoutes: TopItem[]; topActivities: TopItem[] } | null>(null);
  const [loading, setLoading] = useState(false);

  const getDateRange = () => {
    if (useCustomDates && fromDate && toDate) return { from: fromDate, to: toDate };
    const end = new Date();
    const start = new Date();
    if (period === '7d') start.setDate(end.getDate() - 7);
    else if (period === '30d') start.setDate(end.getDate() - 30);
    else if (period === '90d') start.setDate(end.getDate() - 90);
    else if (period === '1y') start.setFullYear(end.getFullYear() - 1);
    return { from: start.toISOString().split('T')[0], to: end.toISOString().split('T')[0] };
  };

  useEffect(() => {
    const loadStatic = async () => {
      try {
        const [routesRes, activitiesRes] = await Promise.all([
          getRoutes(),
          getActivities()
        ]);
        setRoutes(routesRes || []);
        setActivities(activitiesRes || []);
      } catch (error) {
        console.error('Error loading reports data:', error);
      }
    };
    loadStatic();
  }, []);

  useEffect(() => {
    const loadAnalytics = async () => {
      try {
        setLoading(true);
        const range = getDateRange();
        const [analyticsRes, trendRes, topRes] = await Promise.all([
          getBookingAnalytics(range.from, range.to),
          getRevenueTrend(range.from, range.to, period === '1y' ? 'month' : 'day'),
          getTopItems(range.from, range.to, 5)
        ]);
        setAnalytics(analyticsRes || null);
        setTrendData(trendRes || []);
        setTopItems(topRes || null);
      } catch (error) {
        console.error('Error loading analytics:', error);
      } finally {
        setLoading(false);
      }
    };
    loadAnalytics();
  }, [period, fromDate, toDate, useCustomDates]);

  const revenueData = useMemo(() => {
    if (trendData && trendData.length > 0) {
      return trendData.map((d) => ({ date: d.date, revenue: d.revenue, bookings: d.bookings }));
    }

    const days = period === '7d' ? 7 : period === '30d' ? 30 : period === '90d' ? 90 : 365;
    const end = new Date();
    const data: RevenueData[] = [];

    for (let i = days - 1; i >= 0; i--) {
      const date = new Date(end);
      date.setDate(end.getDate() - i);
      const dateStr = period === '1y'
        ? date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' })
        : date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });

      data.push({
        date: dateStr,
        revenue: 0,
        bookings: 0,
      });
    }

    return data;
  }, [period, trendData]);

  const categoryData: CategoryData[] = useMemo(() => {
    if (analytics?.categoryBreakdown?.length) {
      return analytics.categoryBreakdown.map((item: { name: string; value: number }, index: number) => ({
        name: item.name,
        value: item.value,
        color: categoryColors[index % categoryColors.length]
      }));
    }

    return [
      { name: 'Transport', value: 0, color: categoryColors[0] },
      { name: 'Entertainment', value: 0, color: categoryColors[1] },
      { name: 'Sports', value: 0, color: categoryColors[2] },
      { name: 'Events', value: 0, color: categoryColors[3] },
      { name: 'Outdoor', value: 0, color: categoryColors[4] },
      { name: 'Housing', value: 0, color: categoryColors[5] },
    ];
  }, [analytics]);

  const totalRevenue = analytics?.totalRevenue ?? revenueData.reduce((sum, item) => sum + item.revenue, 0);
  const totalBookings = analytics?.totalBookings ?? revenueData.reduce((sum, item) => sum + item.bookings, 0);
  const avgDailyRevenue = analytics
    ? Math.floor(analytics.totalRevenue / Math.max(revenueData.length, 1))
    : Math.floor(totalRevenue / Math.max(revenueData.length, 1));
  const avgBookingValue = analytics?.avgBookingValue ?? (totalBookings > 0 ? Math.floor(totalRevenue / totalBookings) : 0);

  // Top routes based on backend data or route metadata fallback
  const topRoutes: TopItem[] = useMemo(() => {
    if (topItems?.topRoutes?.length) {
      return topItems.topRoutes.map(route => ({
        name: route.name,
        bookings: route.bookings,
        revenue: route.revenue,
      }));
    }
    return routes
      .slice(0, 5)
      .map(route => {
        const startLoc = route.startLocation || route.originStation?.name || 'Unknown';
        const endLoc = route.endLocation || route.destinationStation?.name || 'Unknown';
        const price = route.base_price || route.price || 0;
        return {
          name: `${startLoc} → ${endLoc}`,
          bookings: Math.floor(50 + Math.random() * 200),
          revenue: price * Math.floor(50 + Math.random() * 200),
        };
      })
      .sort((a, b) => b.revenue - a.revenue);
  }, [topItems, routes]);

  // Top activities based on backend data or activity metadata fallback
  const topActivities: TopItem[] = useMemo(() => {
    if (topItems?.topActivities?.length) {
      return topItems.topActivities.map(activity => ({
        name: activity.name,
        bookings: activity.bookings,
        revenue: activity.revenue,
      }));
    }
    return activities
      .slice(0, 5)
      .map(activity => ({
        name: activity.name,
        bookings: Math.floor(30 + Math.random() * 150),
        revenue: (activity.price || 0) * Math.floor(30 + Math.random() * 150),
      }))
      .sort((a, b) => b.revenue - a.revenue);
  }, [topItems, activities]);

  const stats = [
    {
      title: 'Total Revenue',
      value: formatPrice(totalRevenue),
      icon: DollarSign,
      gradient: 'from-blue-500 to-blue-600',
      change: '+12.5%',
    },
    {
      title: 'Total Bookings',
      value: totalBookings.toLocaleString(),
      icon: ShoppingCart,
      gradient: 'from-green-500 to-green-600',
      change: '+8.3%',
    },
    {
      title: 'Avg Daily Revenue',
      value: formatPrice(avgDailyRevenue),
      icon: TrendingUp,
      gradient: 'from-purple-500 to-purple-600',
      change: '+5.7%',
    },
    {
      title: 'Avg Booking Value',
      value: formatPrice(avgBookingValue),
      icon: BarChart3,
      gradient: 'from-orange-500 to-orange-600',
      change: '+3.2%',
    },
  ];

  const exportData = () => {
    const csvContent = [
      ['Period', period],
      ['Generated', new Date().toISOString()],
      [''],
      ['Date', 'Revenue (TSh)', 'Bookings'],
      ...revenueData.map(item => [item.date, item.revenue, item.bookings]),
      [''],
      ['Summary'],
      ['Total Revenue', totalRevenue],
      ['Total Bookings', totalBookings],
      ['Average Daily Revenue', avgDailyRevenue],
      ['Average Booking Value', avgBookingValue],
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `revenue-report-${period}-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between"
      >
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Reports & Analytics
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Track booking statistics and revenue performance
          </p>
        </div>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={exportData}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shadow-lg"
        >
          <Download className="w-4 h-4" />
          Export Data
        </motion.button>
      </motion.div>

      {/* Period Selector */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="flex gap-2 flex-wrap"
      >
        {(['7d', '30d', '90d', '1y'] as TimePeriod[]).map((p) => (
          <motion.button
            key={p}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => {
              setUseCustomDates(false);
              setPeriod(p);
            }}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              period === p && !useCustomDates
                ? 'bg-blue-600 text-white shadow-lg'
                : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 border border-gray-200 dark:border-gray-700'
            }`}
          >
            {p === '7d' && 'Last 7 Days'}
            {p === '30d' && 'Last 30 Days'}
            {p === '90d' && 'Last 90 Days'}
            {p === '1y' && 'Last Year'}
          </motion.button>
        ))}
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="grid grid-cols-1 lg:grid-cols-3 gap-4"
      >
        <label className="flex items-center gap-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-3">
          <input
            type="checkbox"
            checked={useCustomDates}
            onChange={(e) => setUseCustomDates(e.target.checked)}
            className="h-4 w-4 text-blue-600 rounded"
          />
          <span className="text-sm text-gray-700 dark:text-gray-300">Use custom date range</span>
        </label>
        <div className="space-y-2">
          <label className="text-sm text-gray-700 dark:text-gray-300">From</label>
          <input
            type="date"
            value={fromDate}
            onChange={(e) => setFromDate(e.target.value)}
            disabled={!useCustomDates}
            className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
          />
        </div>
        <div className="space-y-2">
          <label className="text-sm text-gray-700 dark:text-gray-300">To</label>
          <input
            type="date"
            value={toDate}
            onChange={(e) => setToDate(e.target.value)}
            disabled={!useCustomDates}
            className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
          />
        </div>
      </motion.div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => (
          <motion.div
            key={stat.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 + index * 0.1 }}
            whileHover={{ scale: 1.03, y: -4 }}
            className={`bg-gradient-to-br ${stat.gradient} p-6 rounded-xl text-white shadow-lg`}
          >
            <div className="flex items-center justify-between mb-4">
              <stat.icon className="w-8 h-8 opacity-80" />
              <span className="text-sm font-medium bg-white/20 px-2 py-1 rounded">
                {stat.change}
              </span>
            </div>
            <div>
              <p className="text-sm opacity-90 mb-1">{stat.title}</p>
              <p className="text-2xl font-bold">{stat.value}</p>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Revenue Trend Chart */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
        className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg"
      >
        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
          Revenue Trend
        </h2>
        <ResponsiveContainer width="100%" height={300}>
          <AreaChart data={revenueData}>
            <defs>
              <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={COLORS.primary} stopOpacity={0.8}/>
                <stop offset="95%" stopColor={COLORS.primary} stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" className="stroke-gray-200 dark:stroke-gray-700" />
            <XAxis
              dataKey="date"
              className="text-xs fill-gray-600 dark:fill-gray-400"
              tick={{ fontSize: 12 }}
            />
            <YAxis
              className="text-xs fill-gray-600 dark:fill-gray-400"
              tick={{ fontSize: 12 }}
              tickFormatter={(value) => `${(value / 1000).toFixed(0)}k`}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: 'rgba(0, 0, 0, 0.8)',
                border: 'none',
                borderRadius: '8px',
                color: 'white',
              }}
              formatter={(value: number) => [formatPrice(value), 'Revenue']}
            />
            <Area
              type="monotone"
              dataKey="revenue"
              stroke={COLORS.primary}
              fillOpacity={1}
              fill="url(#colorRevenue)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </motion.div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Category Distribution */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.7 }}
          className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg"
        >
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
            Bookings by Category
          </h2>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={categoryData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {categoryData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </motion.div>

        {/* Daily Bookings */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.8 }}
          className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg"
        >
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
            Daily Booking Activity
          </h2>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={revenueData}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-gray-200 dark:stroke-gray-700" />
              <XAxis
                dataKey="date"
                className="text-xs fill-gray-600 dark:fill-gray-400"
                tick={{ fontSize: 12 }}
              />
              <YAxis
                className="text-xs fill-gray-600 dark:fill-gray-400"
                tick={{ fontSize: 12 }}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'rgba(0, 0, 0, 0.8)',
                  border: 'none',
                  borderRadius: '8px',
                  color: 'white',
                }}
              />
              <Bar dataKey="bookings" fill={COLORS.success} radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </motion.div>
      </div>

      {/* Top Routes & Activities */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Routes */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.9 }}
          className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg"
        >
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
            Top Routes
          </h2>
          <div className="space-y-3">
            {topRoutes.map((route, index) => (
              <motion.div
                key={route.name}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.9 + index * 0.05 }}
                whileHover={{ scale: 1.02, x: 4 }}
                className="flex items-center justify-between p-3 rounded-lg bg-gray-50 dark:bg-gray-700/50 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              >
                <div className="flex items-center gap-3 flex-1">
                  <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center text-blue-600 dark:text-blue-400 font-bold text-sm">
                    {index + 1}
                  </div>
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white">
                      {route.name}
                    </p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {route.bookings} bookings
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-bold text-gray-900 dark:text-white">
                    {formatPrice(route.revenue)}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Top Activities */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.0 }}
          className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg"
        >
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
            Top Activities
          </h2>
          <div className="space-y-3">
            {topActivities.map((activity, index) => (
              <motion.div
                key={activity.name}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 1.0 + index * 0.05 }}
                whileHover={{ scale: 1.02, x: 4 }}
                className="flex items-center justify-between p-3 rounded-lg bg-gray-50 dark:bg-gray-700/50 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              >
                <div className="flex items-center gap-3 flex-1">
                  <div className="w-8 h-8 rounded-full bg-purple-100 dark:bg-purple-900 flex items-center justify-center text-purple-600 dark:text-purple-400 font-bold text-sm">
                    {index + 1}
                  </div>
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white">
                      {activity.name}
                    </p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {activity.bookings} bookings
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-bold text-gray-900 dark:text-white">
                    {formatPrice(activity.revenue)}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
