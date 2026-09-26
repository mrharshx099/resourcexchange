import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { api } from '../services/api';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  AreaChart,
  Area,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend
} from 'recharts';
import {
  TrendingUp,
  DollarSign,
  PieChart as PieIcon,
  Layers,
  ArrowUpRight,
  Calendar,
  Sparkles,
  RefreshCw,
  ArrowLeft,
  Building,
  CheckCircle2,
  Clock,
  Activity
} from 'lucide-react';

const COLORS = ['#10b981', '#06b6d4', '#f59e0b', '#8b5cf6', '#ec4899', '#6366f1'];

export default function AnalyticsPage({ onNavigate }) {
  const { currentUser } = useAuth();
  const { isDark } = useTheme();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [refreshing, setRefreshing] = useState(false);

  const fetchAnalytics = async () => {
    if (!currentUser?.id) return;
    try {
      setError(null);
      const res = await api.getAnalytics(currentUser.id);
      setData(res);
    } catch (err) {
      console.error('Failed to load analytics:', err);
      setError('Unable to load analytics data. Please ensure the backend is running.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
  }, [currentUser?.id]);

  const handleRefresh = () => {
    setRefreshing(true);
    fetchAnalytics();
  };

  // Recharts styling helpers based on active mode
  const gridStroke = isDark ? '#334155' : '#e2e8f0';
  const axisStroke = isDark ? '#94a3b8' : '#64748b';

  // Custom Mode-Aware Tooltip
  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700/80 p-3 rounded-xl shadow-xl backdrop-blur-md text-xs text-slate-800 dark:text-white">
          <p className="font-bold text-slate-900 dark:text-white mb-1.5">{label || payload[0]?.name}</p>
          {payload.map((entry, idx) => (
            <div key={`tip-${idx}`} className="flex items-center gap-2 text-slate-600 dark:text-slate-300">
              <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: entry.color || entry.fill }} />
              <span className="capitalize">{entry.name}:</span>
              <span className="font-bold text-slate-900 dark:text-white">
                {entry.name.toLowerCase().includes('revenue') || entry.name.toLowerCase().includes('rate') || entry.name.toLowerCase().includes('price')
                  ? `$${entry.value.toLocaleString()}`
                  : entry.name.toLowerCase().includes('utilization')
                  ? `${entry.value}%`
                  : entry.value}
              </span>
            </div>
          ))}
        </div>
      );
    }
    return null;
  };

  // SKELETON LOADER
  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 py-8 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        {/* Header Skeleton */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div className="space-y-2">
            <div className="h-4 w-32 bg-slate-200 dark:bg-slate-800/80 rounded-lg animate-pulse" />
            <div className="h-8 w-64 bg-slate-200 dark:bg-slate-800 rounded-xl animate-pulse" />
          </div>
          <div className="h-10 w-44 bg-slate-200 dark:bg-slate-800 rounded-xl animate-pulse" />
        </div>

        {/* KPI Skeletons */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="glass-panel bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-3 shadow-sm dark:shadow-none">
              <div className="flex justify-between items-center">
                <div className="h-3 w-24 bg-slate-200 dark:bg-slate-800 rounded animate-pulse" />
                <div className="w-8 h-8 rounded-xl bg-slate-200 dark:bg-slate-800 animate-pulse" />
              </div>
              <div className="h-7 w-28 bg-slate-200 dark:bg-slate-800/90 rounded-lg animate-pulse" />
              <div className="h-3 w-36 bg-slate-100 dark:bg-slate-800/60 rounded animate-pulse" />
            </div>
          ))}
        </div>

        {/* Charts Skeleton Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="glass-panel bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 h-80 flex flex-col justify-between shadow-sm dark:shadow-none">
            <div className="h-5 w-48 bg-slate-200 dark:bg-slate-800 rounded animate-pulse" />
            <div className="w-full h-52 bg-slate-100 dark:bg-slate-800/40 rounded-xl animate-pulse" />
          </div>
          <div className="glass-panel bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 h-80 flex flex-col justify-between shadow-sm dark:shadow-none">
            <div className="h-5 w-48 bg-slate-200 dark:bg-slate-800 rounded animate-pulse" />
            <div className="w-full h-52 bg-slate-100 dark:bg-slate-800/40 rounded-xl animate-pulse" />
          </div>
          <div className="glass-panel bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 h-80 flex flex-col justify-between shadow-sm dark:shadow-none">
            <div className="h-5 w-48 bg-slate-200 dark:bg-slate-800 rounded animate-pulse" />
            <div className="w-full h-52 bg-slate-100 dark:bg-slate-800/40 rounded-xl animate-pulse" />
          </div>
          <div className="glass-panel bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 h-80 flex flex-col justify-between shadow-sm dark:shadow-none">
            <div className="h-5 w-48 bg-slate-200 dark:bg-slate-800 rounded animate-pulse" />
            <div className="w-full h-52 bg-slate-100 dark:bg-slate-800/40 rounded-xl animate-pulse" />
          </div>
        </div>
      </div>
    );
  }

  const {
    revenueEarned = 0,
    avgUtilization = 0,
    activeListingsCount = 0,
    utilizationByListing = [],
    categoryDemand = [],
    requestsOverTime = [],
    idleBookedRatio = []
  } = data || {};

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 py-8 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      {/* Top Breadcrumb & Actions Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <button
            onClick={() => onNavigate && onNavigate('provider_dashboard')}
            className="inline-flex items-center gap-2 text-xs font-semibold text-emerald-600 dark:text-emerald-400 hover:text-emerald-700 dark:hover:text-emerald-300 mb-2 transition-colors group"
          >
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
            Back to Provider Dashboard
          </button>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight flex items-center gap-2.5">
              <span>Performance & Utilization Insights</span>
              <span className="text-xs px-2.5 py-0.5 rounded-full font-bold bg-emerald-500/15 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-500/30">
                Live Data
              </span>
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Real-time analytics for <span className="font-semibold text-slate-800 dark:text-slate-200">{currentUser?.name}</span> across shared hospitality assets
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleRefresh}
            disabled={refreshing}
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-white dark:bg-slate-800/80 hover:bg-slate-50 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-700/80 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white transition-all shadow-sm active:scale-95"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin text-emerald-500' : ''}`} />
            {refreshing ? 'Syncing...' : 'Refresh Stats'}
          </button>
          <button
            onClick={() => onNavigate && onNavigate('provider_dashboard')}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs transition-all shadow-lg shadow-emerald-950/20 active:scale-95"
          >
            <Building className="w-3.5 h-3.5" />
            Manage My Listings
          </button>
        </div>
      </div>

      {/* KPI Cards Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {/* KPI 1: Revenue Earned */}
        <div className="glass-panel bg-white/95 dark:bg-slate-900/90 p-5 rounded-2xl border border-slate-200 dark:border-slate-800/80 relative overflow-hidden group hover:border-emerald-500/40 transition-all shadow-sm dark:shadow-none">
          <div className="absolute -right-4 -bottom-4 w-24 h-24 bg-emerald-500/5 rounded-full blur-2xl group-hover:bg-emerald-500/10 transition-all pointer-events-none" />
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Revenue Earned</span>
            <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-slate-900 dark:text-white mb-1">
            ${revenueEarned.toLocaleString()}
          </div>
          <div className="flex items-center gap-1.5 text-[11px] text-emerald-600 dark:text-emerald-400 font-medium">
            <TrendingUp className="w-3 h-3" />
            <span>Monetized from accepted & completed requests</span>
          </div>
        </div>

        {/* KPI 2: Avg Utilization */}
        <div className="glass-panel bg-white/95 dark:bg-slate-900/90 p-5 rounded-2xl border border-slate-200 dark:border-slate-800/80 relative overflow-hidden group hover:border-cyan-500/40 transition-all shadow-sm dark:shadow-none">
          <div className="absolute -right-4 -bottom-4 w-24 h-24 bg-cyan-500/5 rounded-full blur-2xl group-hover:bg-cyan-500/10 transition-all pointer-events-none" />
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Average Utilization</span>
            <div className="p-2 rounded-xl bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 border border-cyan-500/20">
              <Activity className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-slate-900 dark:text-white mb-1">
            {avgUtilization}%
          </div>
          <div className="w-full bg-slate-100 dark:bg-slate-800 h-1.5 rounded-full overflow-hidden mt-2">
            <div
              className="bg-gradient-to-r from-cyan-500 to-emerald-400 h-full rounded-full transition-all duration-1000"
              style={{ width: `${Math.min(avgUtilization, 100)}%` }}
            />
          </div>
        </div>

        {/* KPI 3: Active Listings */}
        <div className="glass-panel bg-white/95 dark:bg-slate-900/90 p-5 rounded-2xl border border-slate-200 dark:border-slate-800/80 relative overflow-hidden group hover:border-amber-500/40 transition-all shadow-sm dark:shadow-none">
          <div className="absolute -right-4 -bottom-4 w-24 h-24 bg-amber-500/5 rounded-full blur-2xl group-hover:bg-amber-500/10 transition-all pointer-events-none" />
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Monetized Assets</span>
            <div className="p-2 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
              <Layers className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-slate-900 dark:text-white mb-1">
            {activeListingsCount} <span className="text-xs font-normal text-slate-500 dark:text-slate-400">active listings</span>
          </div>
          <div className="flex items-center gap-1.5 text-[11px] text-slate-500 dark:text-slate-400 font-medium">
            <CheckCircle2 className="w-3 h-3 text-amber-500 dark:text-amber-400" />
            <span>Listed on discovery map & search</span>
          </div>
        </div>

        {/* KPI 4: Platform Category Leader */}
        <div className="glass-panel bg-white/95 dark:bg-slate-900/90 p-5 rounded-2xl border border-slate-200 dark:border-slate-800/80 relative overflow-hidden group hover:border-purple-500/40 transition-all shadow-sm dark:shadow-none">
          <div className="absolute -right-4 -bottom-4 w-24 h-24 bg-purple-500/5 rounded-full blur-2xl group-hover:bg-purple-500/10 transition-all pointer-events-none" />
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Top Market Demand</span>
            <div className="p-2 rounded-xl bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-500/20">
              <Sparkles className="w-4 h-4" />
            </div>
          </div>
          <div className="text-lg font-bold text-slate-900 dark:text-white truncate mb-1">
            {categoryDemand[0]?.name || 'Banquet & Spaces'}
          </div>
          <div className="text-[11px] text-purple-600 dark:text-purple-400 font-medium truncate">
            Highest cross-business booking rate
          </div>
        </div>
      </div>

      {/* Main Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        
        {/* CHART 1: Resource Utilization % per Listing (Bar Chart) */}
        <div className="glass-panel bg-white/95 dark:bg-slate-900/60 p-6 rounded-3xl border border-slate-200 dark:border-slate-800/80 backdrop-blur-xl flex flex-col justify-between shadow-sm dark:shadow-none">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Activity className="w-4 h-4 text-emerald-500 dark:text-emerald-400" />
                Resource Utilization Rate per Listing (%)
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Calculated as (Booked Days / Available Days in window)
              </p>
            </div>
            <span className="text-[11px] px-2 py-1 rounded-lg bg-emerald-500/15 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 font-semibold border border-emerald-500/20">
              Target: 70%+
            </span>
          </div>

          {utilizationByListing.length === 0 ? (
            <div className="h-64 flex flex-col items-center justify-center text-center p-6 border border-dashed border-slate-200 dark:border-slate-800 rounded-2xl">
              <Layers className="w-10 h-10 text-slate-400 dark:text-slate-600 mb-2" />
              <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">No active listings found</p>
              <p className="text-xs text-slate-500 max-w-xs mt-1">
                Post your banquet rooms, parking spaces, or kitchen shifts to monitor utilization.
              </p>
            </div>
          ) : (
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={utilizationByListing} margin={{ top: 10, right: 10, left: -20, bottom: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke={gridStroke} vertical={false} />
                  <XAxis
                    dataKey="name"
                    stroke={axisStroke}
                    fontSize={11}
                    tickLine={false}
                    interval={0}
                    angle={-10}
                    textAnchor="end"
                  />
                  <YAxis
                    stroke={axisStroke}
                    fontSize={11}
                    tickLine={false}
                    domain={[0, 100]}
                    unit="%"
                  />
                  <Tooltip content={<CustomTooltip />} />
                  <Bar
                    dataKey="utilizationRate"
                    name="Utilization"
                    fill="#10b981"
                    radius={[6, 6, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}

          <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
            <span>High utilization indicates optimal pricing & demand</span>
            <span className="text-emerald-600 dark:text-emerald-400 font-semibold">{avgUtilization}% overall avg</span>
          </div>
        </div>

        {/* CHART 2: Requests & Revenue Over Time (Area Chart) */}
        <div className="glass-panel bg-white/95 dark:bg-slate-900/60 p-6 rounded-3xl border border-slate-200 dark:border-slate-800/80 backdrop-blur-xl flex flex-col justify-between shadow-sm dark:shadow-none">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-cyan-500 dark:text-cyan-400" />
                Sharing Requests & Revenue Trajectory
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Monthly inbound booking inquiries vs. accepted revenue
              </p>
            </div>
            <span className="text-[11px] px-2 py-1 rounded-lg bg-cyan-500/15 dark:bg-cyan-500/10 text-cyan-700 dark:text-cyan-300 font-semibold border border-cyan-500/20">
              6-Month Trend
            </span>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={requestsOverTime} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#06b6d4" stopOpacity={0.0} />
                  </linearGradient>
                  <linearGradient id="colorRequests" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke={gridStroke} vertical={false} />
                <XAxis dataKey="month" stroke={axisStroke} fontSize={11} tickLine={false} />
                <YAxis stroke={axisStroke} fontSize={11} tickLine={false} />
                <Tooltip content={<CustomTooltip />} />
                <Legend
                  wrapperStyle={{ fontSize: '11px', paddingTop: '8px' }}
                  iconType="circle"
                />
                <Area
                  type="monotone"
                  dataKey="revenue"
                  name="Revenue ($)"
                  stroke="#06b6d4"
                  strokeWidth={2}
                  fillOpacity={1}
                  fill="url(#colorRevenue)"
                />
                <Area
                  type="monotone"
                  dataKey="requests"
                  name="Inbound Requests"
                  stroke="#10b981"
                  strokeWidth={2}
                  fillOpacity={1}
                  fill="url(#colorRequests)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
            <span>Demand spikes correlate with peak catering & wedding season</span>
            <span className="text-cyan-600 dark:text-cyan-400 font-semibold">+38% QoQ Growth</span>
          </div>
        </div>

        {/* CHART 3: Most-Requested Categories (Donut / Pie Chart) */}
        <div className="glass-panel bg-white/95 dark:bg-slate-900/60 p-6 rounded-3xl border border-slate-200 dark:border-slate-800/80 backdrop-blur-xl flex flex-col justify-between shadow-sm dark:shadow-none">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <PieIcon className="w-4 h-4 text-amber-500 dark:text-amber-400" />
                Hospitality Category Demand Breakdown
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Platform-wide distribution of high-value resource inquiries
              </p>
            </div>
            <span className="text-[11px] px-2 py-1 rounded-lg bg-amber-500/15 dark:bg-amber-500/10 text-amber-700 dark:text-amber-300 font-semibold border border-amber-500/20">
              Cross-Platform
            </span>
          </div>

          <div className="h-64 w-full flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={categoryDemand}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={90}
                  paddingAngle={5}
                  dataKey="value"
                  nameKey="name"
                >
                  {categoryDemand.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
                <Legend
                  wrapperStyle={{ fontSize: '11px', paddingTop: '8px' }}
                  iconType="circle"
                  layout="horizontal"
                  verticalAlign="bottom"
                  align="center"
                />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
            <span>Kitchen & banquet facilities represent top asset exchange</span>
            <span className="text-amber-600 dark:text-amber-400 font-semibold">{categoryDemand.length} Active Categories</span>
          </div>
        </div>

        {/* CHART 4: Idle vs Booked Ratio Visualized */}
        <div className="glass-panel bg-white/95 dark:bg-slate-900/60 p-6 rounded-3xl border border-slate-200 dark:border-slate-800/80 backdrop-blur-xl flex flex-col justify-between shadow-sm dark:shadow-none">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Clock className="w-4 h-4 text-purple-500 dark:text-purple-400" />
                Capacity Utilization: Idle vs. Booked Ratio
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Proportion of available capacity actively yielding revenue
              </p>
            </div>
            <span className="text-[11px] px-2 py-1 rounded-lg bg-purple-500/15 dark:bg-purple-500/10 text-purple-700 dark:text-purple-300 font-semibold border border-purple-500/20">
              Asset Efficiency
            </span>
          </div>

          <div className="h-64 w-full flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={idleBookedRatio}
                  cx="50%"
                  cy="50%"
                  innerRadius={65}
                  outerRadius={88}
                  startAngle={180}
                  endAngle={0}
                  dataKey="value"
                  nameKey="name"
                >
                  {idleBookedRatio.map((entry, index) => (
                    <Cell key={`cell-idle-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
                <Legend
                  wrapperStyle={{ fontSize: '11px' }}
                  iconType="circle"
                  layout="horizontal"
                  verticalAlign="bottom"
                  align="center"
                />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="p-3 bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-slate-200 dark:border-slate-800 text-xs text-slate-700 dark:text-slate-300 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
              <span>Booked: <strong>{idleBookedRatio.find(i => i.name.includes('Booked'))?.value || 0}%</strong></span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-slate-400 dark:bg-slate-600" />
              <span>Idle / Available: <strong>{idleBookedRatio.find(i => i.name.includes('Idle'))?.value || 0}%</strong></span>
            </div>
          </div>
        </div>

      </div>

      {/* Granular Listings Table */}
      {utilizationByListing.length > 0 && (
        <div className="glass-panel bg-white/95 dark:bg-slate-900/60 p-6 rounded-3xl border border-slate-200 dark:border-slate-800/80 backdrop-blur-xl shadow-sm dark:shadow-none">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Layers className="w-4 h-4 text-emerald-500 dark:text-emerald-400" />
                Listing Utilization Breakdown
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">Detailed performance audit per individual asset</p>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-500 dark:text-slate-400 uppercase tracking-wider text-[10px] border-b border-slate-200 dark:border-slate-700">
                <tr>
                  <th className="py-3 px-4">Resource</th>
                  <th className="py-3 px-4">Category</th>
                  <th className="py-3 px-4">Daily Rate</th>
                  <th className="py-3 px-4">Booked Days</th>
                  <th className="py-3 px-4">Idle Days</th>
                  <th className="py-3 px-4">Utilization %</th>
                  <th className="py-3 px-4 text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/80 text-slate-700 dark:text-slate-300">
                {utilizationByListing.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors">
                    <td className="py-3.5 px-4 font-semibold text-slate-900 dark:text-white">
                      {item.fullTitle || item.name}
                    </td>
                    <td className="py-3.5 px-4 text-slate-500 dark:text-slate-400">
                      {item.category}
                    </td>
                    <td className="py-3.5 px-4 font-bold text-emerald-600 dark:text-emerald-400">
                      ${item.dailyRate}/day
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="font-bold text-slate-900 dark:text-slate-100">{item.bookedDays}</span> days
                    </td>
                    <td className="py-3.5 px-4 text-slate-500 dark:text-slate-400">
                      {item.idleDays} days
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-2">
                        <div className="w-20 bg-slate-200 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
                          <div
                            className="bg-emerald-500 h-full rounded-full"
                            style={{ width: `${Math.min(item.utilizationRate, 100)}%` }}
                          />
                        </div>
                        <span className="font-bold text-slate-900 dark:text-white">{item.utilizationRate}%</span>
                      </div>
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        item.utilizationRate > 50
                          ? 'bg-emerald-500/15 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 border border-emerald-500/30'
                          : 'bg-amber-500/15 dark:bg-amber-500/20 text-amber-700 dark:text-amber-300 border border-amber-500/30'
                      }`}>
                        {item.utilizationRate > 50 ? 'High Demand' : 'Available Capacity'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
