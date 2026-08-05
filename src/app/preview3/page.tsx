'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useSound } from '@/hooks/useSound';
import {
  LayoutDashboard,
  TrendingUp,
  TrendingDown,
  Activity,
  Users,
  Server,
  HardDrive,
  Wifi,
  Zap,
  Cpu,
  Database,
  Globe,
  Clock,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  RefreshCw,
  Download,
  Upload,
  Eye,
  Settings,
  Bell,
  Search,
  Filter,
  MoreVertical,
  ArrowUpRight,
  ArrowDownRight,
  Minus,
  Pause,
  Play,
  Maximize2,
  Calendar,
  BarChart3,
  LineChart,
  PieChart
} from 'lucide-react';

// Mini Chart Component (SVG-based)
function MiniChart({ data, color = '#8b5cf6', height = 40 }: {
  data: number[];
  color?: string;
  height?: number;
}) {
  const width = 120;
  const max = Math.max(...data);
  const min = Math.min(...data);
  const range = max - min || 1;
  
  const points = data.map((value, index) => {
    const x = (index / (data.length - 1)) * width;
    const y = height - ((value - min) / range) * height;
    return `${x},${y}`;
  }).join(' ');

  const areaPoints = `0,${height} ${points} ${width},${height}`;

  return (
    <svg width={width} height={height} className="overflow-visible">
      <defs>
        <linearGradient id={`gradient-${color.replace('#', '')}`} x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor={color} stopOpacity={0.3} />
          <stop offset="100%" stopColor={color} stopOpacity={0} />
        </linearGradient>
      </defs>
      <polygon
        fill={`url(#gradient-${color.replace('#', '')})`}
        points={areaPoints}
      />
      <polyline
        fill="none"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        points={points}
      />
    </svg>
  );
}

// Metric Card Component
function MetricCard({ 
  title, 
  value, 
  change, 
  changeType,
  icon: Icon,
  chartData,
  color = '#8b5cf6',
  onClick 
}: {
  title: string;
  value: string | number;
  change: number;
  changeType: 'positive' | 'negative' | 'neutral';
  icon: React.ElementType;
  chartData?: number[];
  color?: string;
  onClick?: () => void;
}) {
  return (
    <div
      onClick={onClick}
      className="group p-5 rounded-xl bg-gradient-to-br from-slate-800/80 to-slate-900/80 border border-slate-700/50 hover:border-violet-500/50 transition-all duration-200 cursor-pointer hover:scale-[1.02] hover:shadow-lg hover:shadow-violet-500/10"
    >
      <div className="flex items-start justify-between mb-4">
        <div className="p-2.5 rounded-xl" style={{ backgroundColor: `${color}20` }}>
          <Icon className="w-5 h-5" style={{ color }} />
        </div>
        
        <div className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${
          changeType === 'positive' ? 'bg-green-500/10 text-green-400' :
          changeType === 'negative' ? 'bg-red-500/10 text-red-400' :
          'bg-slate-700/50 text-slate-400'
        }`}>
          {changeType === 'positive' && <ArrowUpRight className="w-3 h-3" />}
          {changeType === 'negative' && <ArrowDownRight className="w-3 h-3" />}
          {changeType === 'neutral' && <Minus className="w-3 h-3" />}
          {Math.abs(change)}%
        </div>
      </div>

      <div className="mb-3">
        <p className="text-2xl font-bold text-white">{value}</p>
        <p className="text-sm text-slate-500 mt-1">{title}</p>
      </div>

      {chartData && (
        <div className="opacity-60 group-hover:opacity-100 transition-opacity">
          <MiniChart data={chartData} color={color} />
        </div>
      )}
    </div>
  );
}

// Alert Item Component
function AlertItem({ type, message, time, onDismiss }: {
  type: 'info' | 'warning' | 'error' | 'success';
  message: string;
  time: string;
  onDismiss: () => void;
}) {
  const styles = {
    info: { bg: 'bg-blue-500/10', border: 'border-blue-500/30', icon: Info, color: 'text-blue-400' },
    warning: { bg: 'bg-yellow-500/10', border: 'border-yellow-500/30', icon: AlertTriangle, color: 'text-yellow-400' },
    error: { bg: 'bg-red-500/10', border: 'border-red-500/30', icon: XCircle, color: 'text-red-400' },
    success: { bg: 'bg-green-500/10', border: 'border-green-500/30', icon: CheckCircle2, color: 'text-green-400' }
  };

  const style = styles[type];
  const Icon = style.icon;

  return (
    <div className={`flex items-start gap-3 p-4 rounded-xl ${style.bg} border ${style.border}`}>
      <Icon className={`w-5 h-5 shrink-0 mt-0.5 ${style.color}`} />
      <div className="flex-1 min-w-0">
        <p className="text-sm text-white">{message}</p>
        <p className="text-xs text-slate-500 mt-1">{time}</p>
      </div>
      <button onClick={onDismiss} className="p-1 hover:bg-white/5 rounded transition-colors">
        <XCircle className="w-4 h-4 text-slate-500" />
      </button>
    </div>
  );
}

// Activity Feed Item
function ActivityItem({ action, user, target, time, avatar }: {
  action: string;
  user: string;
  target: string;
  time: string;
  avatar: string;
}) {
  return (
    <div className="flex items-start gap-3 py-3 border-b border-slate-800/50 last:border-0">
      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center text-xs font-bold text-white shrink-0">
        {avatar}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm text-slate-300">
          <span className="font-medium text-white">{user}</span> {action}{' '}
          <span className="font-medium text-violet-400">{target}</span>
        </p>
        <p className="text-xs text-slate-600 mt-0.5">{time}</p>
      </div>
    </div>
  );
}

// Circular Progress Component
function CircularProgress({ value, size = 80, strokeWidth = 8, color = '#8b5cf6' }: {
  value: number; // 0-100
  size?: number;
  strokeWidth?: number;
  color?: string;
}) {
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const offset = circumference - (value / 100) * circumference;

  return (
    <div className="relative inline-flex items-center justify-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="#334155"
          strokeWidth={strokeWidth}
          fill="none"
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={color}
          strokeWidth={strokeWidth}
          fill="none"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          className="transition-all duration-1000 ease-out"
        />
      </svg>
      <span className="absolute text-lg font-bold text-white">{value}%</span>
    </div>
  );
}

// Helper component for missing icon
function Info(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <circle cx="12" cy="12" r="10"></circle>
      <line x1="12" y1="16" x2="12" y2="12"></line>
      <line x1="12" y1="8" x2="12.01" y2="8"></line>
    </svg>
  );
}

export default function Preview3Dashboard() {
  const [isPaused, setIsPaused] = useState(false);
  const [alerts, setAlerts] = useState([
    { id: 1, type: 'success' as const, message: 'System backup completed successfully', time: '2 minutes ago' },
    { id: 2, type: 'warning' as const, message: 'High memory usage detected on node-3', time: '15 minutes ago' },
    { id: 3, type: 'info' as const, message: 'New connector available: Open-Meteo Weather API', time: '1 hour ago' }
  ]);
  
  // Generate random data for charts
  const generateData = useCallback((length = 20, min = 20, max = 100) => 
    Array.from({ length }, () => Math.floor(Math.random() * (max - min)) + min), []
  );

  const [metrics, setMetrics] = useState({
    activeUsers: { value: 12459, change: 12.5, data: generateData() },
    requestsPerSec: { value: 8932, change: 8.2, data: generateData() },
    avgLatency: { value: 45, change: -15.3, data: generateData(20, 20, 100) },
    uptime: { value: 99.9, change: 0.1, data: generateData(20, 99, 100) },
    cpuUsage: { value: 67, data: [] },
    memoryUsage: { value: 82, data: [] },
    diskUsage: { value: 54, data: [] }
  });

  const activities = [
    { user: 'Alice Chen', action: 'deployed to', target: 'production', time: 'Just now', avatar: 'AC' },
    { user: 'Bob Smith', action: 'updated', target: 'API configuration', time: '5 min ago', avatar: 'BS' },
    { user: 'Carol Davis', action: 'connected new', target: 'Crypto connector', time: '12 min ago', avatar: 'CD' },
    { user: 'DevOps Bot', action: 'scaled up', target: 'worker nodes ×3', time: '23 min ago', avatar: 'DB' },
    { user: 'Eve Johnson', action: 'created', target: 'webhook endpoint', time: '1 hour ago', avatar: 'EJ' }
  ];

  const { playSound } = useSound();

  // Simulate live updates
  useEffect(() => {
    if (isPaused) return;

    const interval = setInterval(() => {
      setMetrics(prev => ({
        ...prev,
        activeUsers: {
          value: prev.activeUsers.value + Math.floor(Math.random() * 10) - 3,
          change: prev.activeUsers.change + (Math.random() - 0.5),
          data: [...prev.activeUsers.data.slice(1), Math.floor(Math.random() * 2000) + 11000]
        },
        requestsPerSec: {
          value: prev.requestsPerSec.value + Math.floor(Math.random() * 200) - 100,
          change: prev.requestsPerSec.change + (Math.random() - 0.5),
          data: [...prev.requestsPerSec.data.slice(1), Math.floor(Math.random() * 3000) + 7000]
        },
        avgLatency: {
          value: Math.max(20, Math.min(100, prev.avgLatency.value + Math.floor(Math.random() * 10) - 5)),
          change: prev.avgLatency.change + (Math.random() - 0.5),
          data: [...prev.avgLatency.data.slice(1), Math.floor(Math.random() * 60) + 30]
        },
        cpuUsage: { value: Math.max(30, Math.min(95, prev.cpuUsage.value + Math.floor(Math.random() * 6) - 3)), data: [] },
        memoryUsage: { value: Math.max(50, Math.min(95, prev.memoryUsage.value + Math.floor(Math.random() * 4) - 2)), data: [] },
        diskUsage: { value: Math.max(40, Math.min(85, prev.diskUsage.value + Math.floor(Math.random() * 2) - 1)), data: [] }
      }));
    }, 3000);

    return () => clearInterval(interval);
  }, [isPaused]);

  const dismissAlert = useCallback((id: number) => {
    playSound('close', 0.2);
    setAlerts(prev => prev.filter(a => a.id !== id));
  }, [playSound]);

  const handleRefresh = useCallback(() => {
    playSound('whoosh', 0.3);
    // Regenerate all data
    setMetrics({
      activeUsers: { value: Math.floor(Math.random() * 5000) + 10000, change: Math.random() * 20 - 10, data: generateData() },
      requestsPerSec: { value: Math.floor(Math.random() * 5000) + 5000, change: Math.random() * 15 - 7, data: generateData() },
      avgLatency: { value: Math.floor(Math.random() * 60) + 25, change: Math.random() * 10 - 5, data: generateData(20, 20, 100) },
      uptime: { value: 99.9, change: 0, data: generateData(20, 99, 100) },
      cpuUsage: { value: Math.floor(Math.random() * 40) + 40, data: [] },
      memoryUsage: { value: Math.floor(Math.random() * 30) + 55, data: [] },
      diskUsage: { value: Math.floor(Math.random() * 30) + 40, data: [] }
    });
    playSound('success', 0.35);
  }, [playSound, generateData]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 text-white p-6 md:p-8">
      {/* Header */}
      <div className="max-w-7xl mx-auto mb-8">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-gradient-to-br from-green-500 to-emerald-500">
              <LayoutDashboard className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold">Dashboard</h1>
              <p className="text-slate-400 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
                Live Metrics & Analytics
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Pause/Play Button */}
            <button
              onClick={() => {
                setIsPaused(!isPaused);
                playSound(isPaused ? 'play' : 'pause', 0.25);
              }}
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
            >
              {isPaused ? <Play className="w-4 h-4" /> : <Pause className="w-4 h-4" />}
              {isPaused ? 'Resume' : 'Pause'}
            </button>

            {/* Refresh Button */}
            <button
              onClick={handleRefresh}
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-violet-600 hover:bg-violet-500 text-white transition-colors"
            >
              <RefreshCw className="w-4 h-4" />
              Refresh
            </button>
          </div>
        </div>
      </div>

      {/* Main Grid */}
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Top Metrics Row */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <MetricCard
            title="Active Users"
            value={metrics.activeUsers.value.toLocaleString()}
            change={metrics.activeUsers.change}
            changeType={metrics.activeUsers.change > 0 ? 'positive' : metrics.activeUsers.change < 0 ? 'negative' : 'neutral'}
            icon={Users}
            chartData={metrics.activeUsers.data}
            color="#22c55e"
            onClick={() => playSound('click', 0.15)}
          />
          <MetricCard
            title="Requests/sec"
            value={metrics.requestsPerSec.value.toLocaleString()}
            change={metrics.requestsPerSec.change}
            changeType={metrics.requestsPerSec.change > 0 ? 'positive' : 'negative'}
            icon={Activity}
            chartData={metrics.requestsPerSec.data}
            color="#3b82f6"
            onClick={() => playSound('click', 0.15)}
          />
          <MetricCard
            title="Avg Latency"
            value={`${metrics.avgLatency.value}ms`}
            change={metrics.avgLatency.change}
            changeType={metrics.avgLatency.change < 0 ? 'positive' : 'negative'}
            icon={Zap}
            chartData={metrics.avgLatency.data}
            color="#eab308"
            onClick={() => playSound('click', 0.15)}
          />
          <MetricCard
            title="Uptime"
            value={`${metrics.uptime.value}%`}
            change={0.01}
            changeType="positive"
            icon={Server}
            chartData={metrics.uptime.data}
            color="#8b5cf6"
            onClick={() => playSound('click', 0.15)}
          />
        </div>

        {/* Middle Section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* System Resources */}
          <div className="lg:col-span-2 p-6 rounded-xl bg-gradient-to-br from-slate-800/80 to-slate-900/80 border border-slate-700/50">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-semibold text-white flex items-center gap-2">
                <Cpu className="w-5 h-5 text-violet-400" />
                System Resources
              </h2>
              <span className="text-xs text-slate-500">Updated 3s ago</span>
            </div>

            <div className="grid grid-cols-3 gap-6">
              {/* CPU */}
              <div className="text-center">
                <CircularProgress 
                  value={metrics.cpuUsage.value} 
                  color={metrics.cpuUsage.value > 80 ? '#ef4444' : metrics.cpuUsage.value > 60 ? '#eab308' : '#22c55e'}
                />
                <p className="mt-3 text-sm font-medium text-white">CPU Usage</p>
                <p className="text-xs text-slate-500">8 cores @ 3.2GHz</p>
              </div>

              {/* Memory */}
              <div className="text-center">
                <CircularProgress 
                  value={metrics.memoryUsage.value}
                  color={metrics.memoryUsage.value > 85 ? '#ef4444' : metrics.memoryUsage.value > 70 ? '#eab308' : '#22c55e'}
                />
                <p className="mt-3 text-sm font-medium text-white">Memory</p>
                <p className="text-xs text-slate-500">32 GB DDR5</p>
              </div>

              {/* Disk */}
              <div className="text-center">
                <CircularProgress 
                  value={metrics.diskUsage.value}
                  color={metrics.diskUsage.value > 75 ? '#ef4444' : '#22c55e'}
                />
                <p className="mt-3 text-sm font-medium text-white">Disk I/O</p>
                <p className="text-xs text-slate-500">512 GB NVMe</p>
              </div>
            </div>

            {/* Resource Bars */}
            <div className="mt-6 space-y-3">
              {[
                { label: 'CPU', value: metrics.cpuUsage.value, color: metrics.cpuUsage.value > 80 ? 'bg-red-500' : 'bg-violet-500' },
                { label: 'Memory', value: metrics.memoryUsage.value, color: metrics.memoryUsage.value > 85 ? 'bg-red-500' : 'bg-cyan-500' },
                { label: 'Disk', value: metrics.diskUsage.value, color: 'bg-green-500' }
              ].map((resource) => (
                <div key={resource.label} className="space-y-1">
                  <div className="flex justify-between text-xs">
                    <span className="text-slate-400">{resource.label}</span>
                    <span className="text-white font-mono">{resource.value}%</span>
                  </div>
                  <div className="h-2 bg-slate-900 rounded-full overflow-hidden">
                    <div 
                      className={`h-full ${resource.color} rounded-full transition-all duration-1000`}
                      style={{ width: `${resource.value}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Alerts Panel */}
          <div className="p-6 rounded-xl bg-gradient-to-br from-slate-800/80 to-slate-900/80 border border-slate-700/50">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-white flex items-center gap-2">
                <Bell className="w-5 h-5 text-yellow-400" />
                Alerts
              </h2>
              <span className="px-2 py-0.5 rounded-full bg-red-500/20 text-red-400 text-xs font-medium">
                {alerts.length} active
              </span>
            </div>

            <div className="space-y-3 max-h-[320px] overflow-y-auto">
              {alerts.map((alert) => (
                <AlertItem
                  key={alert.id}
                  {...alert}
                  onDismiss={() => dismissAlert(alert.id)}
                />
              ))}
              
              {alerts.length === 0 && (
                <div className="text-center py-8 text-slate-500">
                  <CheckCircle2 className="w-10 h-10 mx-auto mb-2 opacity-50" />
                  <p className="text-sm">All clear!</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Activity Feed */}
          <div className="p-6 rounded-xl bg-gradient-to-br from-slate-800/80 to-slate-900/80 border border-slate-700/50">
            <h2 className="text-lg font-semibold text-white flex items-center gap-2 mb-4">
              <Activity className="w-5 h-5 text-cyan-400" />
              Recent Activity
            </h2>
            
            <div className="divide-y divide-slate-800/50">
              {activities.map((activity, i) => (
                <ActivityItem key={i} {...activity} />
              ))}
            </div>
          </div>

          {/* Quick Stats Grid */}
          <div className="p-6 rounded-xl bg-gradient-to-br from-slate-800/80 to-slate-900/80 border border-slate-700/50">
            <h2 className="text-lg font-semibold text-white flex items-center gap-2 mb-4">
              <BarChart3 className="w-5 h-5 text-pink-400" />
              Network Overview
            </h2>

            <div className="grid grid-cols-2 gap-4">
              {[
                { label: 'Inbound Traffic', value: '2.4 TB', icon: Download, color: 'text-green-400' },
                { label: 'Outbound Traffic', value: '1.8 TB', icon: Upload, color: 'text-blue-400' },
                { label: 'Active Connections', value: '1,247', icon: Wifi, color: 'text-violet-400' },
                { label: 'Bandwidth', value: '10 Gbps', icon: Globe, color: 'text-orange-400' }
              ].map((stat) => (
                <div key={stat.label} className="p-4 rounded-lg bg-slate-900/50 border border-slate-800/50">
                  <stat.icon className={`w-5 h-5 ${stat.color} mb-2`} />
                  <p className="text-xl font-bold text-white">{stat.value}</p>
                  <p className="text-xs text-slate-500">{stat.label}</p>
                </div>
              ))}
            </div>

            {/* Status Indicators */}
            <div className="mt-4 pt-4 border-t border-slate-800/50">
              <div className="flex items-center justify-between text-sm">
                <span className="text-slate-400">All Systems Operational</span>
                <span className="flex items-center gap-2 text-green-400">
                  <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
                  Healthy
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
