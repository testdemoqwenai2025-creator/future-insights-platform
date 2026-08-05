'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';

// ============== TYPE DEFINITIONS ==============

type UserRole = 'GUEST' | 'RESEARCHER' | 'REVIEWER' | 'ADMIN' | 'SUPERADMIN';
type UserStatus = 'active' | 'inactive' | 'suspended' | 'pending';
type PaperStatus = 'draft' | 'under_review' | 'revision_required' | 'approved' | 'published' | 'rejected';
type AuditAction = 'create' | 'update' | 'delete' | 'login' | 'export' | 'config_change' | 'role_change';

interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  status: UserStatus;
  lastActive: string;
  joinedAt: string;
  institution?: string;
  avatar?: string;
  papersCount?: number;
}

interface Paper {
  id: string;
  title: string;
  author: string;
  status: PaperStatus;
  submittedAt: string;
  category: string;
}

interface ApiKey {
  id: string;
  name: string;
  key: string;
  createdAt: string;
  lastUsed: string;
  requests: number;
  active: boolean;
}

interface AuditLogEntry {
  id: string;
  timestamp: string;
  user: string;
  action: AuditAction;
  details: string;
  ipAddress: string;
  severity: 'info' | 'warning' | 'error' | 'critical';
}

interface SystemAlert {
  id: string;
  type: 'warning' | 'error' | 'info' | 'success';
  title: string;
  message: string;
  time: string;
}

interface ActivityItem {
  id: string;
  type: 'user' | 'paper' | 'system' | 'api';
  description: string;
  time: string;
  icon: string;
}

// ============== MOCK DATA ==============

const mockUsers: User[] = [
  { id: 'usr_1', name: 'Dr. Sarah Chen', email: 'sarah@mit.edu', role: 'RESEARCHER', status: 'active', lastActive: '2 min ago', joinedAt: '2024-01-15', institution: 'MIT', papersCount: 12 },
  { id: 'usr_2', name: 'Prof. James Wilson', email: 'jw@oxford.ac.uk', role: 'REVIEWER', status: 'active', lastActive: '15 min ago', joinedAt: '2024-02-20', institution: 'Oxford University', papersCount: 45 },
  { id: 'usr_3', name: 'Dr. Maria Garcia', email: 'mgarcia@cern.ch', role: 'RESEARCHER', status: 'active', lastActive: '1 hour ago', joinedAt: '2024-03-10', institution: 'CERN', papersCount: 8 },
  { id: 'usr_4', name: 'Dr. Kenji Tanaka', email: 'ktanaka@kek.jp', role: 'ADMIN', status: 'active', lastActive: '5 min ago', joinedAt: '2023-12-01', institution: 'KEK', papersCount: 23 },
  { id: 'usr_5', name: 'Dr. Emily Roberts', email: 'eroberts@stanford.edu', role: 'GUEST', status: 'pending', lastActive: '1 day ago', joinedAt: '2024-06-15', institution: 'Stanford', papersCount: 0 },
  { id: 'usr_6', name: 'Prof. Ahmed Hassan', email: 'ahassan@kaust.edu.sa', role: 'RESEARCHER', status: 'inactive', lastActive: '2 weeks ago', joinedAt: '2024-04-05', institution: 'KAUST', papersCount: 5 },
  { id: 'usr_7', name: 'Dr. Lisa Park', email: 'lpark@ethz.ch', role: 'REVIEWER', status: 'suspended', lastActive: '1 month ago', joinedAt: '2024-01-28', institution: 'ETH Zurich', papersCount: 31 },
  { id: 'usr_8', name: 'System Admin', email: 'admin@aeth-1.science', role: 'SUPERADMIN', status: 'active', lastActive: 'Just now', joinedAt: '2023-11-01', institution: 'AETH-1 Foundation', papersCount: 0 },
];

const mockPapers: Paper[] = [
  { id: 'wp_001', title: 'Quantum Computing Applications in High Energy Physics', author: 'Dr. Wei Chen', status: 'under_review', submittedAt: '2 hours ago', category: 'Physics' },
  { id: 'wp_002', title: 'ML Approaches for Satellite Image Classification', author: 'Dr. Jane Smith', status: 'revision_required', submittedAt: '5 hours ago', category: 'Machine Learning' },
  { id: 'wp_003', title: 'Climate Model Uncertainty Quantification Methods', author: 'Dr. A. Johnson', status: 'approved', submittedAt: '1 day ago', category: 'Climate Science' },
  { id: 'wp_004', title: 'Novel Drug Discovery Using Graph Neural Networks', author: 'Prof. Maria Lopez', status: 'published', submittedAt: '3 days ago', category: 'Bioinformatics' },
  { id: 'wp_005', title: 'Federated Learning for Privacy-Preserving Healthcare Analytics', author: 'Dr. Robert Kim', status: 'draft', submittedAt: '4 hours ago', category: 'Healthcare AI' },
  { id: 'wp_006', title: 'Dark Matter Detection Sensitivity Analysis', author: 'Dr. Sarah Chen', status: 'under_review', submittedAt: '6 hours ago', category: 'Astrophysics' },
  { id: 'wp_007', title: 'Transformer Architectures for Genomic Sequence Analysis', author: 'Prof. James Wilson', status: 'rejected', submittedAt: '2 days ago', category: 'Genomics' },
  { id: 'wp_008', title: 'Edge Computing Optimization for IoT Sensor Networks', author: 'Dr. Emily Davis', status: 'pending_review', submittedAt: '8 hours ago', category: 'IoT Systems' },
];

const mockApiKeys: ApiKey[] = [
  { id: 'key_1', name: 'Production API Key', key: 'aeth_live_****************************', createdAt: '2024-01-15', lastUsed: '2 min ago', requests: 1547823, active: true },
  { id: 'key_2', name: 'Staging Environment', key: 'aeth_test_****************************', createdAt: '2024-03-20', lastUsed: '1 hour ago', requests: 45621, active: true },
  { id: 'key_3', name: 'Development Key', key: 'aeth_dev_****************************', createdAt: '2024-05-10', lastUsed: '3 days ago', requests: 8934, active: false },
  { id: 'key_4', name: 'ML Pipeline Access', key: 'aeth_ml_****************************', createdAt: '2024-06-01', lastActive: '30 min ago', requests: 234567, active: true },
];

const mockAuditLog: AuditLogEntry[] = [
  { id: 'log_1', timestamp: '2024-12-19T14:32:15Z', user: 'System Admin', action: 'create', details: 'Created new user account for Dr. Sarah Chen', ipAddress: '192.168.1.100', severity: 'info' },
  { id: 'log_2', timestamp: '2024-12-19T14:28:42Z', user: 'Dr. Kenji Tanaka', action: 'update', details: 'Updated paper metadata for wp_003', ipAddress: '10.0.0.45', severity: 'info' },
  { id: 'log_3', timestamp: '2024-12-19T14:15:33Z', user: 'System Admin', action: 'role_change', details: 'Changed Dr. Lisa Park role from REVIEWER to SUSPENDED', ipAddress: '192.168.1.100', severity: 'warning' },
  { id: 'log_4', timestamp: '2024-12-19T13:58:21Z', user: 'Prof. James Wilson', action: 'login', details: 'Successful login from new device', ipAddress: '203.45.67.89', severity: 'info' },
  { id: 'log_5', timestamp: '2024-12-19T13:45:10Z', user: 'System Admin', action: 'delete', details: 'Removed deprecated API key dev_legacy_1234', ipAddress: '192.168.1.100', severity: 'warning' },
  { id: 'log_6', timestamp: '2024-12-19T13:30:55Z', user: 'Unknown', action: 'login', details: 'Failed login attempt - invalid credentials', ipAddress: '45.67.89.123', severity: 'error' },
  { id: 'log_7', timestamp: '2024-12-19T13:22:18Z', user: 'Dr. Maria Garcia', action: 'export', details: 'Exported dataset: climate_models_v2 (2.4GB)', ipAddress: '10.0.0.72', severity: 'info' },
  { id: 'log_8', timestamp: '2024-12-19T13:10:44Z', user: 'System Admin', action: 'config_change', details: 'Updated rate limiting settings: 1000 req/min', ipAddress: '192.168.1.100', severity: 'info' },
  { id: 'log_9', timestamp: '2024-12-19T12:58:33Z', user: 'Prof. Ahmed Hassan', action: 'create', details: 'Submitted new paper: Edge Computing Optimization', ipAddress: '172.16.0.50', severity: 'info' },
  { id: 'log_10', timestamp: '2024-12-19T12:45:22Z', user: 'System', action: 'config_change', details: 'Scheduled maintenance window configured', ipAddress: 'localhost', severity: 'info' },
];

const mockAlerts: SystemAlert[] = [
  { id: 'alert_1', type: 'warning', title: 'High Memory Usage', message: 'Analysis Engine memory usage at 87%', time: '5 min ago' },
  { id: 'alert_2', type: 'info', title: 'Scheduled Maintenance', message: 'Database backup scheduled for 02:00 UTC', time: '1 hour ago' },
  { id: 'alert_3', type: 'success', title: 'Deployment Successful', message: 'v2.4.1 deployed to production', time: '3 hours ago' },
  { id: 'alert_4', type: 'error', title: 'Connector Degraded', message: 'Genomic data connector experiencing latency', time: '4 hours ago' },
];

const mockActivity: ActivityItem[] = [
  { id: 'act_1', type: 'user', description: 'New user registration: Dr. Sarah Chen', time: '2 min ago', icon: '👤' },
  { id: 'act_2', type: 'paper', description: 'Paper submitted: Quantum Computing in HEP', time: '15 min ago', icon: '📄' },
  { id: 'act_3', type: 'api', description: 'API rate limit reached for key aeth_live_xxx', time: '32 min ago', icon: '🔌' },
  { id: 'act_4', type: 'system', description: 'Automated backup completed successfully', time: '1 hour ago', icon: '💾' },
  { id: 'act_5', type: 'user', description: 'Role updated: Dr. Garcia → Senior Researcher', time: '2 hours ago', icon: '👥' },
  { id: 'act_6', type: 'paper', description: 'Paper approved: Climate Model Uncertainty', time: '3 hours ago', icon: '✅' },
  { id: 'act_7', type: 'api', description: 'New API key generated: ML Pipeline Access', time: '4 hours ago', icon: '🔑' },
  { id: 'act_8', type: 'system', description: 'Storage usage alert: 75% capacity reached', time: '5 hours ago', icon: '⚠️' },
];

// ============== HELPER COMPONENTS ==============

function StatusBadge({ status }: { status: UserStatus | PaperStatus }) {
  const variants: Record<string, 'default' | 'secondary' | 'destructive' | 'outline'> = {
    active: 'default',
    inactive: 'secondary',
    suspended: 'destructive',
    pending: 'outline',
    draft: 'secondary',
    under_review: 'outline',
    revision_required: 'secondary',
    approved: 'default',
    published: 'default',
    rejected: 'destructive',
    pending_review: 'outline',
  };

  const colors: Record<string, string> = {
    active: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30',
    inactive: 'bg-slate-500/15 text-slate-400 border-slate-500/30',
    suspended: 'bg-red-500/15 text-red-400 border-red-500/30',
    pending: 'bg-amber-500/15 text-amber-400 border-amber-500/30',
    draft: 'bg-slate-500/15 text-slate-400 border-slate-500/30',
    under_review: 'bg-blue-500/15 text-blue-400 border-blue-500/30',
    revision_required: 'bg-amber-500/15 text-amber-400 border-amber-500/30',
    approved: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30',
    published: 'bg-green-500/15 text-green-400 border-green-500/30',
    rejected: 'bg-red-500/15 text-red-400 border-red-500/30',
    pending_review: 'bg-purple-500/15 text-purple-400 border-purple-500/30',
  };

  return (
    <Badge variant="outline" className={colors[status] || ''}>
      {status.replace('_', ' ')}
    </Badge>
  );
}

function RoleBadge({ role }: { role: UserRole }) {
  const colors: Record<UserRole, string> = {
    GUEST: 'bg-slate-500/15 text-slate-400 border-slate-500/30',
    RESEARCHER: 'bg-blue-500/15 text-blue-400 border-blue-500/30',
    REVIEWER: 'bg-purple-500/15 text-purple-400 border-purple-500/30',
    ADMIN: 'bg-amber-500/15 text-amber-400 border-amber-500/30',
    SUPERADMIN: 'bg-red-500/15 text-red-400 border-red-500/30',
  };

  return (
    <Badge variant="outline" className={colors[role]}>
      {role}
    </Badge>
  );
}

function MiniChart({ data, color = 'indigo' }: { data: number[]; color?: string }) {
  const max = Math.max(...data);
  const min = Math.min(...data);
  const range = max - min || 1;

  const colorClasses: Record<string, string> = {
    indigo: 'from-indigo-500 to-indigo-300',
    emerald: 'from-emerald-500 to-emerald-300',
    purple: 'from-purple-500 to-purple-300',
    amber: 'from-amber-500 to-amber-300',
  };

  return (
    <div className="flex items-end gap-0.5 h-12">
      {data.map((value, i) => (
        <div
          key={i}
          className={`flex-1 rounded-sm bg-gradient-to-t ${colorClasses[color]} opacity-80 hover:opacity-100 transition-opacity`}
          style={{ height: `${((value - min) / range) * 100}%`, minHeight: '4px' }}
          title={`${value}`}
        />
      ))}
    </div>
  );
}

function SeverityBadge({ severity }: { severity: AuditLogEntry['severity'] }) {
  const styles: Record<string, string> = {
    info: 'bg-blue-500/15 text-blue-400',
    warning: 'bg-amber-500/15 text-amber-400',
    error: 'bg-red-500/15 text-red-400',
    critical: 'bg-red-600/15 text-red-300 font-semibold',
  };
  return <span className={`px-2 py-0.5 rounded text-xs ${styles[severity]}`}>{severity}</span>;
}

// ============== DASHBOARD OVERVIEW TAB ==============

function DashboardOverviewTab() {
  const [stats, setStats] = useState({
    totalUsers: 47823,
    activeSessions: 1247,
    apiRequests: 2400000,
    storageUsed: 38.8,
    storageTotal: 181,
  });

  // Simulate live updates
  useEffect(() => {
    const interval = setInterval(() => {
      setStats(prev => ({
        ...prev,
        activeSessions: prev.activeSessions + Math.floor(Math.random() * 10) - 4,
        apiRequests: prev.apiRequests + Math.floor(Math.random() * 100),
      }));
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  const chartData = {
    users: [65, 72, 68, 85, 92, 88, 95, 102, 98, 110, 115, 120],
    sessions: [800, 920, 890, 1050, 1120, 1080, 1200, 1150, 1250, 1180, 1247, 1280],
    api: [1800, 1950, 2100, 2050, 2200, 2350, 2280, 2400, 2380, 2450, 2520, 2600],
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl lg:text-3xl font-bold text-white">Dashboard Overview</h2>
          <p className="text-slate-400 mt-1">Monitor your AETH-1 platform health and activity</p>
        </div>
        <div className="flex items-center gap-2">
          <Badge className="bg-emerald-500/15 text-emerald-400 border-emerald-500/30">
            ● All Systems Operational
          </Badge>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
        <Card className="bg-gradient-to-br from-slate-800/80 to-slate-900/80 border-slate-700/50 backdrop-blur-sm">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium text-slate-400">Total Users</CardTitle>
              <span className="text-2xl">👥</span>
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl lg:text-3xl font-bold text-white">{stats.totalUsers.toLocaleString()}</div>
            <div className="flex items-center gap-2 mt-2">
              <span className="text-xs text-emerald-400">+12.4%</span>
              <span className="text-xs text-slate-500">vs last month</span>
            </div>
            <div className="mt-3">
              <MiniChart data={chartData.users} color="indigo" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-slate-800/80 to-slate-900/80 border-slate-700/50 backdrop-blur-sm">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium text-slate-400">Active Sessions</CardTitle>
              <span className="text-2xl">🟢</span>
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl lg:text-3xl font-bold text-white">{stats.activeSessions.toLocaleString()}</div>
            <div className="flex items-center gap-2 mt-2">
              <span className="text-xs text-emerald-400">+4.9%</span>
              <span className="text-xs text-slate-500">vs last hour</span>
            </div>
            <div className="mt-3">
              <MiniChart data={chartData.sessions} color="emerald" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-slate-800/80 to-slate-900/80 border-slate-700/50 backdrop-blur-sm">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium text-slate-400">API Requests</CardTitle>
              <span className="text-2xl">📡</span>
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl lg:text-3xl font-bold text-white">{(stats.apiRequests / 1000000).toFixed(2)}M</div>
            <div className="flex items-center gap-2 mt-2">
              <span className="text-xs text-emerald-400">+15.3%</span>
              <span className="text-xs text-slate-500">today</span>
            </div>
            <div className="mt-3">
              <MiniChart data={chartData.api.map(v => v / 10)} color="purple" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-slate-800/80 to-slate-900/80 border-slate-700/50 backdrop-blur-sm">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium text-slate-400">Storage Used</CardTitle>
              <span className="text-2xl">💾</span>
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl lg:text-3xl font-bold text-white">{stats.storageUsed} PB</div>
            <div className="flex items-center gap-2 mt-2">
              <span className="text-xs text-amber-400">{((stats.storageUsed / stats.storageTotal) * 100).toFixed(1)}%</span>
              <span className="text-xs text-slate-500">of {stats.storageTotal} PB</span>
            </div>
            <div className="mt-3">
              <div className="h-2 bg-slate-700 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full transition-all"
                  style={{ width: `${(stats.storageUsed / stats.storageTotal) * 100}%` }}
                />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Alerts and Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* System Alerts */}
        <Card className="bg-slate-800/50 border-slate-700/50">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              🚨 System Alerts
              <Badge variant="secondary" className="ml-auto bg-red-500/15 text-red-400">
                {mockAlerts.filter(a => a.type === 'error' || a.type === 'warning').length}
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 max-h-80 overflow-y-auto">
            {mockAlerts.map(alert => (
              <div 
                key={alert.id}
                className={`p-3 rounded-lg border ${
                  alert.type === 'error' ? 'bg-red-500/10 border-red-500/30' :
                  alert.type === 'warning' ? 'bg-amber-500/10 border-amber-500/30' :
                  alert.type === 'success' ? 'bg-emerald-500/10 border-emerald-500/30' :
                  'bg-blue-500/10 border-blue-500/30'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div>
                    <div className="font-medium text-white text-sm">{alert.title}</div>
                    <div className="text-xs text-slate-400 mt-1">{alert.message}</div>
                  </div>
                  <span className="text-xs text-slate-500 whitespace-nowrap ml-2">{alert.time}</span>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Recent Activity */}
        <Card className="bg-slate-800/50 border-slate-700/50">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              📋 Recent Activity
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 max-h-80 overflow-y-auto">
            {mockActivity.map(activity => (
              <div key={activity.id} className="flex items-center gap-3 p-2 rounded-lg hover:bg-slate-700/30 transition-colors">
                <span className="text-xl">{activity.icon}</span>
                <div className="flex-1 min-w-0">
                  <div className="text-sm text-white truncate">{activity.description}</div>
                </div>
                <span className="text-xs text-slate-500 whitespace-nowrap">{activity.time}</span>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      {/* System Components Status */}
      <Card className="bg-slate-800/50 border-slate-700/50">
        <CardHeader>
          <CardTitle className="text-white">System Components</CardTitle>
          <CardDescription>Real-time status of all platform services</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {[
              { name: 'API Gateway', status: 'operational', latency: '12ms', uptime: '99.99%' },
              { name: 'Auth Service', status: 'operational', latency: '8ms', uptime: '99.98%' },
              { name: 'Database Cluster', status: 'operational', latency: '3ms', uptime: '99.95%' },
              { name: 'Blob Storage', status: 'operational', latency: '45ms', uptime: '99.90%' },
              { name: 'Data Connectors', status: 'degraded', latency: '234ms', uptime: '98.50%' },
              { name: 'Analysis Engine', status: 'operational', latency: '145ms', uptime: '99.92%' },
              { name: 'CDN / Edge Network', status: 'operational', latency: '23ms', uptime: '99.97%' },
              { name: 'ML Pipeline', status: 'operational', latency: '89ms', uptime: '99.94%' },
            ].map((component, i) => (
              <div 
                key={i}
                className={`p-4 rounded-lg border ${
                  component.status === 'operational' 
                    ? 'bg-emerald-500/5 border-emerald-500/20' 
                    : 'bg-amber-500/5 border-amber-500/20'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="font-medium text-white text-sm">{component.name}</span>
                  <span className={`w-2 h-2 rounded-full ${component.status === 'operational' ? 'bg-emerald-500' : 'bg-amber-500 animate-pulse'}`} />
                </div>
                <div className="flex items-center justify-between text-xs text-slate-400">
                  <span>{component.latency}</span>
                  <span>{component.uptime} uptime</span>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// ============== USER MANAGEMENT TAB ==============

function UserManagementTab() {
  const [users, setUsers] = useState<User[]>(mockUsers);
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [selectedUsers, setSelectedUsers] = useState<Set<string>>(new Set());
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showDetailSheet, setShowDetailSheet] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);

  // Create user form state
  const [newUser, setNewUser] = useState({
    name: '',
    email: '',
    role: 'GUEST' as UserRole,
    institution: '',
  });

  // Filter users
  const filteredUsers = users.filter(user => {
    const matchesSearch = user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         user.email.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesRole = roleFilter === 'all' || user.role === roleFilter;
    const matchesStatus = statusFilter === 'all' || user.status === statusFilter;
    return matchesSearch && matchesRole && matchesStatus;
  });

  const handleSelectUser = (userId: string) => {
    const newSelected = new Set(selectedUsers);
    if (newSelected.has(userId)) {
      newSelected.delete(userId);
    } else {
      newSelected.add(userId);
    }
    setSelectedUsers(newSelected);
  };

  const handleSelectAll = () => {
    if (selectedUsers.size === filteredUsers.length) {
      setSelectedUsers(new Set());
    } else {
      setSelectedUsers(new Set(filteredUsers.map(u => u.id)));
    }
  };

  const handleViewUser = (user: User) => {
    setSelectedUser(user);
    setShowDetailSheet(true);
  };

  const handleCreateUser = () => {
    const created: User = {
      id: `usr_${Date.now()}`,
      ...newUser,
      status: 'pending',
      lastActive: 'Just now',
      joinedAt: new Date().toISOString().split('T')[0],
      papersCount: 0,
    };
    setUsers([created, ...users]);
    setNewUser({ name: '', email: '', role: 'GUEST', institution: '' });
    setShowCreateModal(false);
  };

  const handleUpdateUserRole = (userId: string, newRole: UserRole) => {
    setUsers(users.map(u => u.id === userId ? { ...u, role: newRole } : u));
    if (selectedUser?.id === userId) {
      setSelectedUser({ ...selectedUser, role: newRole });
    }
  };

  const handleBulkAction = (action: 'activate' | 'delete' | 'export') => {
    switch (action) {
      case 'activate':
        setUsers(users.map(u => selectedUsers.has(u.id) ? { ...u, status: 'active' as UserStatus } : u));
        break;
      case 'delete':
        setUsers(users.filter(u => !selectedUsers.has(u.id)));
        break;
      case 'export':
        console.log('Exporting users:', selectedUsers);
        break;
    }
    setSelectedUsers(new Set());
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl lg:text-3xl font-bold text-white">User Management</h2>
          <p className="text-slate-400 mt-1">{filteredUsers.length} users found</p>
        </div>
        <Button 
          onClick={() => setShowCreateModal(true)}
          className="bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700"
        >
          + Create New User
        </Button>
      </div>

      {/* Filters */}
      <Card className="bg-slate-800/50 border-slate-700/50">
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <Input
                placeholder="Search by name or email..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="bg-slate-900/50 border-slate-600"
              />
            </div>
            <Select value={roleFilter} onValueChange={setRoleFilter}>
              <SelectTrigger className="w-full md:w-40 bg-slate-900/50 border-slate-600">
                <SelectValue placeholder="All Roles" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Roles</SelectItem>
                <SelectItem value="GUEST">Guest</SelectItem>
                <SelectItem value="RESEARCHER">Researcher</SelectItem>
                <SelectItem value="REVIEWER">Reviewer</SelectItem>
                <SelectItem value="ADMIN">Admin</SelectItem>
                <SelectItem value="SUPERADMIN">SuperAdmin</SelectItem>
              </SelectContent>
            </Select>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full md:w-40 bg-slate-900/50 border-slate-600">
                <SelectValue placeholder="All Statuses" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="inactive">Inactive</SelectItem>
                <SelectItem value="suspended">Suspended</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Bulk Actions */}
      {selectedUsers.size > 0 && (
        <div className="flex items-center gap-3 p-4 bg-indigo-500/10 border border-indigo-500/30 rounded-lg">
          <span className="text-sm text-indigo-300">{selectedUsers.size} users selected</span>
          <div className="flex gap-2 ml-auto">
            <Button size="sm" variant="outline" onClick={() => handleBulkAction('activate')}>
              ✓ Activate
            </Button>
            <Button size="sm" variant="outline" onClick={() => handleBulkAction('export')}>
              📥 Export
            </Button>
            <Button size="sm" variant="destructive" onClick={() => handleBulkAction('delete')}>
              🗑 Delete
            </Button>
          </div>
        </div>
      )}

      {/* Users Table */}
      <Card className="bg-slate-800/50 border-slate-700/50 overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="border-slate-700 hover:bg-transparent">
              <TableHead className="w-12">
                <input
                  type="checkbox"
                  checked={selectedUsers.size === filteredUsers.length && filteredUsers.length > 0}
                  onChange={handleSelectAll}
                  className="rounded border-slate-600 bg-slate-700"
                />
              </TableHead>
              <TableHead className="text-slate-300">Name</TableHead>
              <TableHead className="text-slate-300 hidden md:table-cell">Email</TableHead>
              <TableHead className="text-slate-300">Role</TableHead>
              <TableHead className="text-slate-300">Status</TableHead>
              <TableHead className="text-slate-300 hidden lg:table-cell">Last Active</TableHead>
              <TableHead className="text-right text-slate-300">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredUsers.map((user) => (
              <TableRow key={user.id} className="border-slate-700/50">
                <TableCell>
                  <input
                    type="checkbox"
                    checked={selectedUsers.has(user.id)}
                    onChange={() => handleSelectUser(user.id)}
                    className="rounded border-slate-600 bg-slate-700"
                  />
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-medium text-sm">
                      {user.name.charAt(0)}
                    </div>
                    <div>
                      <div className="font-medium text-white">{user.name}</div>
                      <div className="text-xs text-slate-500 md:hidden">{user.email}</div>
                    </div>
                  </div>
                </TableCell>
                <TableCell className="text-slate-400 hidden md:table-cell">{user.email}</TableCell>
                <TableCell><RoleBadge role={user.role} /></TableCell>
                <TableCell><StatusBadge status={user.status} /></TableCell>
                <TableCell className="text-slate-400 hidden lg:table-cell">{user.lastActive}</TableCell>
                <TableCell className="text-right">
                  <div className="flex items-center justify-end gap-2">
                    <Button size="sm" variant="ghost" onClick={() => handleViewUser(user)}>
                      👁 View
                    </Button>
                    <Button size="sm" variant="ghost" className="text-red-400 hover:text-red-300 hover:bg-red-500/10">
                      🗑
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>

      {/* Create User Modal */}
      <Dialog open={showCreateModal} onOpenChange={setShowCreateModal}>
        <DialogContent className="bg-slate-800 border-slate-700 sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-white">Create New User</DialogTitle>
            <DialogDescription className="text-slate-400">
              Add a new user to the AETH-1 platform
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-300">Full Name *</label>
              <Input
                value={newUser.name}
                onChange={(e) => setNewUser({ ...newUser, name: e.target.value })}
                placeholder="Enter full name"
                className="bg-slate-900/50 border-slate-600"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-300">Email Address *</label>
              <Input
                type="email"
                value={newUser.email}
                onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                placeholder="Enter email address"
                className="bg-slate-900/50 border-slate-600"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-300">Institution</label>
              <Input
                value={newUser.institution}
                onChange={(e) => setNewUser({ ...newUser, institution: e.target.value })}
                placeholder="Enter institution name"
                className="bg-slate-900/50 border-slate-600"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-300">Default Role</label>
              <Select value={newUser.role} onValueChange={(v) => setNewUser({ ...newUser, role: v as UserRole })}>
                <SelectTrigger className="bg-slate-900/50 border-slate-600">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="GUEST">Guest</SelectItem>
                  <SelectItem value="RESEARCHER">Researcher</SelectItem>
                  <SelectItem value="REVIEWER">Reviewer</SelectItem>
                  <SelectItem value="ADMIN">Admin</SelectItem>
                  <SelectItem value="SUPERADMIN">SuperAdmin</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCreateModal(false)} className="border-slate-600">
              Cancel
            </Button>
            <Button 
              onClick={handleCreateUser}
              disabled={!newUser.name || !newUser.email}
              className="bg-gradient-to-r from-indigo-500 to-purple-600"
            >
              Create User
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* User Detail Sheet - Inline Implementation */}
      {showDetailSheet && selectedUser && (
        <div className="fixed inset-0 z-50">
          <div className="absolute inset-0 bg-black/60" onClick={() => setShowDetailSheet(false)} />
          <div className="absolute right-0 top-0 bottom-0 w-full max-w-md bg-slate-900 border-l border-slate-700 shadow-xl overflow-y-auto">
            <div className="p-6 space-y-6">
              {/* Header */}
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-bold text-white">User Details</h3>
                <Button variant="ghost" size="icon" onClick={() => setShowDetailSheet(false)}>
                  ✕
                </Button>
              </div>

              {/* Profile Section */}
              <div className="flex flex-col items-center text-center pb-6 border-b border-slate-700">
                <div className="w-20 h-20 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white text-2xl font-bold mb-4">
                  {selectedUser.name.charAt(0)}
                </div>
                <h4 className="text-lg font-semibold text-white">{selectedUser.name}</h4>
                <p className="text-slate-400 text-sm">{selectedUser.email}</p>
                <div className="flex gap-2 mt-3">
                  <RoleBadge role={selectedUser.role} />
                  <StatusBadge status={selectedUser.status} />
                </div>
              </div>

              {/* Info Grid */}
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-3 bg-slate-800/50 rounded-lg">
                    <div className="text-xs text-slate-500">Institution</div>
                    <div className="text-sm text-white mt-1">{selectedUser.institution || 'N/A'}</div>
                  </div>
                  <div className="p-3 bg-slate-800/50 rounded-lg">
                    <div className="text-xs text-slate-500">Papers Count</div>
                    <div className="text-sm text-white mt-1">{selectedUser.papersCount || 0}</div>
                  </div>
                  <div className="p-3 bg-slate-800/50 rounded-lg">
                    <div className="text-xs text-slate-500">Joined Date</div>
                    <div className="text-sm text-white mt-1">{selectedUser.joinedAt}</div>
                  </div>
                  <div className="p-3 bg-slate-800/50 rounded-lg">
                    <div className="text-xs text-slate-500">Last Active</div>
                    <div className="text-sm text-white mt-1">{selectedUser.lastActive}</div>
                  </div>
                </div>

                {/* Role Assignment */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-300">Change Role</label>
                  <Select 
                    value={selectedUser.role} 
                    onValueChange={(v) => handleUpdateUserRole(selectedUser.id, v as UserRole)}
                  >
                    <SelectTrigger className="bg-slate-800/50 border-slate-600">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="GUEST">Guest</SelectItem>
                      <SelectItem value="RESEARCHER">Researcher</SelectItem>
                      <SelectItem value="REVIEWER">Reviewer</SelectItem>
                      <SelectItem value="ADMIN">Admin</SelectItem>
                      <SelectItem value="SUPERADMIN">SuperAdmin</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Permissions Summary */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-300">Permissions</label>
                  <div className="space-y-2">
                    {[
                      { perm: 'View Papers', allowed: ['GUEST', 'RESEARCHER', 'REVIEWER', 'ADMIN', 'SUPERADMIN'] },
                      { perm: 'Submit Papers', allowed: ['RESEARCHER', 'REVIEWER', 'ADMIN', 'SUPERADMIN'] },
                      { perm: 'Review Papers', allowed: ['REVIEWER', 'ADMIN', 'SUPERADMIN'] },
                      { perm: 'Manage Users', allowed: ['ADMIN', 'SUPERADMIN'] },
                      { perm: 'System Config', allowed: ['SUPERADMIN'] },
                    ].map(({ perm, allowed }) => (
                      <div key={perm} className="flex items-center justify-between p-2 bg-slate-800/30 rounded">
                        <span className="text-sm text-slate-300">{perm}</span>
                        <span className={`text-xs px-2 py-0.5 rounded ${allowed.includes(selectedUser.role) ? 'bg-emerald-500/15 text-emerald-400' : 'bg-red-500/15 text-red-400'}`}>
                          {allowed.includes(selectedUser.role) ? '✓ Allowed' : '✗ Denied'}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Activity History */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-300">Recent Activity</label>
                  <div className="space-y-2 max-h-40 overflow-y-auto">
                    {[
                      { action: 'Logged in', time: selectedUser.lastActive },
                      { action: 'Updated profile', time: '2 days ago' },
                      { action: 'Submitted paper', time: '1 week ago' },
                    ].map((activity, i) => (
                      <div key={i} className="flex items-center justify-between text-sm p-2 bg-slate-800/30 rounded">
                        <span className="text-slate-300">{activity.action}</span>
                        <span className="text-slate-500 text-xs">{activity.time}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex gap-2 pt-4 border-t border-slate-700">
                  <Button variant="outline" size="sm" className="flex-1 border-slate-600">
                    Send Email
                  </Button>
                  <Button variant="destructive" size="sm" className="flex-1">
                    Suspend User
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ============== CONTENT MANAGEMENT TAB ==============

function ContentManagementTab() {
  const [papers, setPapers] = useState<Paper[]>(mockPapers);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');

  const filteredPapers = papers.filter(paper => {
    const matchesStatus = statusFilter === 'all' || paper.status === statusFilter;
    const matchesCategory = categoryFilter === 'all' || paper.category === categoryFilter;
    return matchesStatus && matchesCategory;
  });

  const handleApprove = (paperId: string) => {
    setPapers(papers.map(p => p.id === paperId ? { ...p, status: 'approved' as PaperStatus } : p));
  };

  const handleReject = (paperId: string) => {
    setPapers(papers.map(p => p.id === paperId ? { ...p, status: 'rejected' as PaperStatus } : p));
  };

  const handlePublish = (paperId: string) => {
    setPapers(papers.map(p => p.id === paperId ? { ...p, status: 'published' as PaperStatus } : p));
  };

  const getStatusCounts = () => ({
    total: papers.length,
    draft: papers.filter(p => p.status === 'draft').length,
    under_review: papers.filter(p => p.status === 'under_review').length,
    revision_required: papers.filter(p => p.status === 'revision_required').length,
    approved: papers.filter(p => p.status === 'approved').length,
    published: papers.filter(p => p.status === 'published').length,
    rejected: papers.filter(p => p.status === 'rejected').length,
  });

  const counts = getStatusCounts();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl lg:text-3xl font-bold text-white">Content Management</h2>
          <p className="text-slate-400 mt-1">Manage papers, documents, and publishing workflow</p>
        </div>
      </div>

      {/* Status Overview Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-7 gap-3">
        {[
          { label: 'All', count: counts.total, color: 'slate' },
          { label: 'Draft', count: counts.draft, color: 'slate' },
          { label: 'Review', count: counts.under_review, color: 'blue' },
          { label: 'Revision', count: counts.revision_required, color: 'amber' },
          { label: 'Approved', count: counts.approved, color: 'emerald' },
          { label: 'Published', count: counts.published, color: 'green' },
          { label: 'Rejected', count: counts.rejected, color: 'red' },
        ].map(({ label, count, color }) => (
          <button
            key={label}
            onClick={() => setStatusFilter(label.toLowerCase() === 'all' ? 'all' : label.toLowerCase())}
            className={`p-3 rounded-lg border transition-all ${
              statusFilter === (label.toLowerCase() === 'all' ? 'all' : label.toLowerCase())
                ? `bg-${color}-500/15 border-${color}-500/30`
                : 'bg-slate-800/50 border-slate-700/50 hover:border-slate-600'
            }`}
          >
            <div className="text-lg font-bold text-white">{count}</div>
            <div className="text-xs text-slate-400">{label}</div>
          </button>
        ))}
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="bg-slate-800/50 border-slate-700">
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Statuses</SelectItem>
            <SelectItem value="draft">Draft</SelectItem>
            <SelectItem value="under_review">Under Review</SelectItem>
            <SelectItem value="revision_required">Revision Required</SelectItem>
            <SelectItem value="approved">Approved</SelectItem>
            <SelectItem value="published">Published</SelectItem>
            <SelectItem value="rejected">Rejected</SelectItem>
          </SelectContent>
        </Select>
        <Select value={categoryFilter} onValueChange={setCategoryFilter}>
          <SelectTrigger className="bg-slate-800/50 border-slate-700">
            <SelectValue placeholder="Filter by category" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Categories</SelectItem>
            <SelectItem value="Physics">Physics</SelectItem>
            <SelectItem value="Machine Learning">Machine Learning</SelectItem>
            <SelectItem value="Climate Science">Climate Science</SelectItem>
            <SelectItem value="Bioinformatics">Bioinformatics</SelectItem>
            <SelectItem value="Healthcare AI">Healthcare AI</SelectItem>
            <SelectItem value="Astrophysics">Astrophysics</SelectItem>
            <SelectItem value="Genomics">Genomics</SelectItem>
            <SelectItem value="IoT Systems">IoT Systems</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Papers List */}
      <div className="space-y-4">
        {filteredPapers.map(paper => (
          <Card key={paper.id} className="bg-slate-800/50 border-slate-700/50 hover:border-slate-600 transition-colors">
            <CardContent className="py-4">
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3 mb-2">
                    <h4 className="font-medium text-white truncate">{paper.title}</h4>
                    <StatusBadge status={paper.status} />
                  </div>
                  <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-slate-400">
                    <span>by {paper.author}</span>
                    <span className="hidden sm:inline">•</span>
                    <Badge variant="outline" className="border-slate-600 text-slate-400 text-xs">
                      {paper.category}
                    </Badge>
                    <span className="hidden sm:inline">•</span>
                    <span>Submitted {paper.submittedAt}</span>
                  </div>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  {(paper.status === 'under_review' || paper.status === 'revision_required' || paper.status === 'pending_review') && (
                    <>
                      <Button size="sm" variant="outline" onClick={() => handleApprove(paper.id)} className="border-emerald-600 text-emerald-400 hover:bg-emerald-500/10">
                        ✓ Approve
                      </Button>
                      <Button size="sm" variant="outline" onClick={() => handleReject(paper.id)} className="border-red-600 text-red-400 hover:bg-red-500/10">
                        ✗ Reject
                      </Button>
                    </>
                  )}
                  {paper.status === 'approved' && (
                    <Button size="sm" onClick={() => handlePublish(paper.id)} className="bg-emerald-600 hover:bg-emerald-700">
                      🚀 Publish
                    </Button>
                  )}
                  <Button size="sm" variant="ghost" className="text-slate-400">
                    👁 View
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}

        {filteredPapers.length === 0 && (
          <div className="text-center py-12 text-slate-400">
            <div className="text-4xl mb-4">📄</div>
            <p>No papers match your filters</p>
          </div>
        )}
      </div>
    </div>
  );
}

// ============== SYSTEM CONFIGURATION TAB ==============

function SystemConfigurationTab() {
  const [apiKeys, setApiKeys] = useState<ApiKey[]>(mockApiKeys);
  const [rateLimit, setRateLimit] = useState(1000);
  const [connectors, setConnectors] = useState([
    { id: 'conn_1', name: 'ArXiv Connector', enabled: true, status: 'healthy' },
    { id: 'conn_2', name: 'PubMed Connector', enabled: true, status: 'healthy' },
    { id: 'conn_3', name: 'Genomic Data API', enabled: false, status: 'maintenance' },
    { id: 'conn_4', name: 'Crypto Market Feed', enabled: true, status: 'healthy' },
    { id: 'conn_5', name: 'Weather Data Service', enabled: true, status: 'degraded' },
  ]);
  const [storageTiers, setStorageTiers] = useState([
    { tier: 'Hot', speed: 'SSD', cost: '$0.25/GB', used: '12.4 PB', total: '50 PB' },
    { tier: 'Warm', speed: 'HDD', cost: '$0.12/GB', used: '18.2 PB', total: '80 PB' },
    { tier: 'Cold', speed: 'Archive', cost: '$0.04/GB', used: '8.2 PB', total: '51 PB' },
  ]);
  const [showCreateKeyModal, setShowCreateKeyModal] = useState(false);
  const [newKeyName, setNewKeyName] = useState('');

  const toggleConnector = (connectorId: string) => {
    setConnectors(connectors.map(c => 
      c.id === connectorId ? { ...c, enabled: !c.enabled } : c
    ));
  };

  const toggleApiKey = (keyId: string) => {
    setApiKeys(apiKeys.map(k => k.id === keyId ? { ...k, active: !k.active } : k));
  };

  const generateNewKey = () => {
    const newKey: ApiKey = {
      id: `key_${Date.now()}`,
      name: newKeyName,
      key: `aeth_${Math.random().toString(36).substring(2, 15)}_${Math.random().toString(36).substring(2, 15)}`,
      createdAt: new Date().toISOString().split('T')[0],
      lastUsed: 'Never',
      requests: 0,
      active: true,
    };
    setApiKeys([newKey, ...apiKeys]);
    setNewKeyName('');
    setShowCreateKeyModal(false);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl lg:text-3xl font-bold text-white">System Configuration</h2>
        <p className="text-slate-400 mt-1">Manage API keys, rate limits, connectors, and storage settings</p>
      </div>

      <Tabs defaultValue="api-keys" className="space-y-6">
        <TabsList className="bg-slate-800/50 border-slate-700">
          <TabsTrigger value="api-keys" className="data-[state=active]:bg-indigo-500/20 data-[state=active]:text-indigo-300">
            🔑 API Keys
          </TabsTrigger>
          <TabsTrigger value="rate-limiting" className="data-[state=active]:bg-indigo-500/20 data-[state=active]:text-indigo-300">
            ⚡ Rate Limiting
          </TabsTrigger>
          <TabsTrigger value="connectors" className="data-[state=active]:bg-indigo-500/20 data-[state=active]:text-indigo-300">
            🔌 Connectors
          </TabsTrigger>
          <TabsTrigger value="storage" className="data-[state=active]:bg-indigo-500/20 data-[state=active]:text-indigo-300">
            💾 Storage Tiers
          </TabsTrigger>
        </TabsList>

        {/* API Keys Tab Content */}
        <TabsContent value="api-keys">
          <Card className="bg-slate-800/50 border-slate-700/50">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-white">API Keys</CardTitle>
                  <CardDescription>Manage authentication keys for API access</CardDescription>
                </div>
                <Button onClick={() => setShowCreateKeyModal(true)} className="bg-gradient-to-r from-indigo-500 to-purple-600">
                  + Generate Key
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {apiKeys.map(key => (
                  <div key={key.id} className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 bg-slate-900/50 rounded-lg border border-slate-700/50">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-3">
                        <span className="font-medium text-white">{key.name}</span>
                        <Badge variant={key.active ? 'default' : 'secondary'} className={key.active ? 'bg-emerald-500/15 text-emerald-400' : ''}>
                          {key.active ? 'Active' : 'Inactive'}
                        </Badge>
                      </div>
                      <div className="font-mono text-sm text-slate-400 mt-1 truncate">{key.key}</div>
                      <div className="flex items-center gap-4 mt-2 text-xs text-slate-500">
                        <span>Created: {key.createdAt}</span>
                        <span>Last used: {key.lastUsed}</span>
                        <span>{key.requests.toLocaleString()} requests</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <Switch checked={key.active} onCheckedChange={() => toggleApiKey(key.id)} />
                      <Button size="sm" variant="ghost" className="text-red-400 hover:text-red-300">
                        🗑
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Rate Limiting Tab Content */}
        <TabsContent value="rate-limiting">
          <Card className="bg-slate-800/50 border-slate-700/50">
            <CardHeader>
              <CardTitle className="text-white">Rate Limiting Settings</CardTitle>
              <CardDescription>Configure API request limits to prevent abuse</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="p-4 bg-slate-900/50 rounded-lg border border-slate-700/50">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <div className="font-medium text-white">Global Rate Limit</div>
                    <div className="text-sm text-slate-400">Maximum requests per minute per API key</div>
                  </div>
                  <div className="text-2xl font-bold text-indigo-400">{rateLimit}</div>
                </div>
                <input
                  type="range"
                  min="100"
                  max="10000"
                  step="100"
                  value={rateLimit}
                  onChange={(e) => setRateLimit(parseInt(e.target.value))}
                  className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-indigo-500"
                />
                <div className="flex justify-between text-xs text-slate-500 mt-1">
                  <span>100/min</span>
                  <span>10,000/min</span>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[
                  { label: 'Burst Limit', value: '200', desc: 'Short-term burst allowance' },
                  { label: 'Daily Quota', value: '1M', desc: 'Maximum daily requests' },
                  { label: 'WebSocket Connections', value: '50', desc: 'Max concurrent WS connections' },
                  { label: 'File Upload Size', value: '100MB', desc: 'Max single file upload' },
                ].map(item => (
                  <div key={item.label} className="p-4 bg-slate-900/50 rounded-lg border border-slate-700/50">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="font-medium text-white text-sm">{item.label}</div>
                        <div className="text-xs text-slate-500">{item.desc}</div>
                      </div>
                      <div className="text-lg font-bold text-indigo-400">{item.value}</div>
                    </div>
                  </div>
                ))}
              </div>

              <Button className="bg-gradient-to-r from-indigo-500 to-purple-600">
                Save Rate Limit Settings
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Connectors Tab Content */}
        <TabsContent value="connectors">
          <Card className="bg-slate-800/50 border-slate-700/50">
            <CardHeader>
              <CardTitle className="text-white">Data Connectors</CardTitle>
              <CardDescription>Enable or disable external data source integrations</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {connectors.map(connector => (
                  <div key={connector.id} className="flex items-center justify-between p-4 bg-slate-900/50 rounded-lg border border-slate-700/50">
                    <div className="flex items-center gap-4">
                      <div className={`w-3 h-3 rounded-full ${
                        connector.enabled 
                          ? connector.status === 'healthy' ? 'bg-emerald-500' : connector.status === 'degraded' ? 'bg-amber-500' : 'bg-red-500'
                          : 'bg-slate-600'
                      }`} />
                      <div>
                        <div className="font-medium text-white">{connector.name}</div>
                        <div className="text-sm text-slate-400 capitalize">{connector.status}</div>
                      </div>
                    </div>
                    <Switch checked={connector.enabled} onCheckedChange={() => toggleConnector(connector.id)} />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Storage Tiers Tab Content */}
        <TabsContent value="storage">
          <Card className="bg-slate-800/50 border-slate-700/50">
            <CardHeader>
              <CardTitle className="text-white">Storage Tier Configuration</CardTitle>
              <CardDescription>Manage storage allocation across different access tiers</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {storageTiers.map(tier => (
                  <div key={tier.tier} className="p-4 bg-slate-900/50 rounded-lg border border-slate-700/50">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-lg flex items-center justify-center text-lg ${
                          tier.tier === 'Hot' ? 'bg-red-500/20' : tier.tier === 'Warm' ? 'bg-amber-500/20' : 'bg-blue-500/20'
                        }`}>
                          {tier.tier === 'Hot' ? '🔥' : tier.tier === 'Warm' ? '🌤️' : '❄️'}
                        </div>
                        <div>
                          <div className="font-medium text-white">{tier.tier} Storage</div>
                          <div className="text-sm text-slate-400">{tier.speed} • {tier.cost}/month</div>
                        </div>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-slate-400">{tier.used} of {tier.total}</span>
                        <span className="text-white">{(parseFloat(tier.used) / parseFloat(tier.total) * 100).toFixed(1)}%</span>
                      </div>
                      <div className="h-2 bg-slate-700 rounded-full overflow-hidden">
                        <div 
                          className={`h-full rounded-full ${
                            tier.tier === 'Hot' ? 'bg-red-500' : tier.tier === 'Warm' ? 'bg-amber-500' : 'bg-blue-500'
                          }`}
                          style={{ width: `${(parseFloat(tier.used) / parseFloat(tier.total)) * 100}%` }}
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-6 p-4 bg-indigo-500/10 border border-indigo-500/30 rounded-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-medium text-indigo-300">Total Storage Usage</div>
                    <div className="text-sm text-slate-400">38.8 PB of 181 PB allocated (21.4%)</div>
                  </div>
                  <Button variant="outline" className="border-indigo-500/30 text-indigo-300 hover:bg-indigo-500/10">
                    Expand Storage
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Create API Key Modal */}
      <Dialog open={showCreateKeyModal} onOpenChange={setShowCreateKeyModal}>
        <DialogContent className="bg-slate-800 border-slate-700 sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-white">Generate New API Key</DialogTitle>
            <DialogDescription className="text-slate-400">
              Create a new API key for application access
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-300">Key Name *</label>
              <Input
                value={newKeyName}
                onChange={(e) => setNewKeyName(e.target.value)}
                placeholder="e.g., Production Backend, Mobile App v2"
                className="bg-slate-900/50 border-slate-600"
              />
            </div>
            <div className="p-3 bg-amber-500/10 border border-amber-500/30 rounded-lg">
              <div className="flex items-start gap-2">
                <span className="text-amber-400">⚠️</span>
                <div className="text-sm text-amber-300/80">
                  Make sure to copy your API key after generation. You won&apos;t be able to see it again.
                </div>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCreateKeyModal(false)} className="border-slate-600">
              Cancel
            </Button>
            <Button 
              onClick={generateNewKey}
              disabled={!newKeyName.trim()}
              className="bg-gradient-to-r from-indigo-500 to-purple-600"
            >
              Generate Key
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// ============== AUDIT LOG TAB ==============

function AuditLogTab() {
  const [auditLogs, setAuditLogs] = useState<AuditLogEntry[]>(mockAuditLog);
  const [actionFilter, setActionFilter] = useState<string>('all');
  const [severityFilter, setSeverityFilter] = useState<string>('all');
  const [dateRange, setDateRange] = useState('7d');

  const filteredLogs = auditLogs.filter(log => {
    const matchesAction = actionFilter === 'all' || log.action === actionFilter;
    const matchesSeverity = severityFilter === 'all' || log.severity === severityFilter;
    return matchesAction && matchesSeverity;
  });

  const handleExport = () => {
    const csv = [
      ['Timestamp', 'User', 'Action', 'Details', 'IP Address', 'Severity'],
      ...filteredLogs.map(log => [
        log.timestamp,
        log.user,
        log.action,
        log.details,
        log.ipAddress,
        log.severity,
      ])
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `audit-log-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl lg:text-3xl font-bold text-white">Audit Log</h2>
          <p className="text-slate-400 mt-1">Track all administrative actions and system events</p>
        </div>
        <Button onClick={handleExport} variant="outline" className="border-slate-600">
          📥 Export CSV
        </Button>
      </div>

      {/* Filters */}
      <Card className="bg-slate-800/50 border-slate-700/50">
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row gap-4">
            <Select value={actionFilter} onValueChange={setActionFilter}>
              <SelectTrigger className="bg-slate-900/50 border-slate-600 flex-1">
                <SelectValue placeholder="All Actions" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Actions</SelectItem>
                <SelectItem value="create">Create</SelectItem>
                <SelectItem value="update">Update</SelectItem>
                <SelectItem value="delete">Delete</SelectItem>
                <SelectItem value="login">Login</SelectItem>
                <SelectItem value="export">Export</SelectItem>
                <SelectItem value="config_change">Config Change</SelectItem>
                <SelectItem value="role_change">Role Change</SelectItem>
              </SelectContent>
            </Select>
            <Select value={severityFilter} onValueChange={setSeverityFilter}>
              <SelectTrigger className="bg-slate-900/50 border-slate-600 flex-1">
                <SelectValue placeholder="All Severities" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Severities</SelectItem>
                <SelectItem value="info">Info</SelectItem>
                <SelectItem value="warning">Warning</SelectItem>
                <SelectItem value="error">Error</SelectItem>
                <SelectItem value="critical">Critical</SelectItem>
              </SelectContent>
            </Select>
            <Select value={dateRange} onValueChange={setDateRange}>
              <SelectTrigger className="bg-slate-900/50 border-slate-600 w-full md:w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1h">Last Hour</SelectItem>
                <SelectItem value="24h">Last 24 Hours</SelectItem>
                <SelectItem value="7d">Last 7 Days</SelectItem>
                <SelectItem value="30d">Last 30 Days</SelectItem>
                <SelectItem value="90d">Last 90 Days</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Log Entries Table */}
      <Card className="bg-slate-800/50 border-slate-700/50 overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="border-slate-700 hover:bg-transparent">
              <TableHead className="text-slate-300">Timestamp</TableHead>
              <TableHead className="text-slate-300">User</TableHead>
              <TableHead className="text-slate-300">Action</TableHead>
              <TableHead className="text-slate-300 hidden lg:table-cell">Details</TableHead>
              <TableHead className="text-slate-300 hidden md:table-cell">IP Address</TableHead>
              <TableHead className="text-slate-300">Severity</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredLogs.map(log => (
              <TableRow key={log.id} className="border-slate-700/50">
                <TableCell className="text-slate-400 whitespace-nowrap">
                  {formatTimestamp(log.timestamp)}
                </TableCell>
                <TableCell className="font-medium text-white">{log.user}</TableCell>
                <TableCell>
                  <Badge variant="outline" className="capitalize border-slate-600 text-slate-300">
                    {log.action.replace('_', ' ')}
                  </Badge>
                </TableCell>
                <TableCell className="text-slate-400 hidden lg:table-cell max-w-xs truncate">
                  {log.details}
                </TableCell>
                <TableCell className="text-slate-500 font-mono text-xs hidden md:table-cell">
                  {log.ipAddress}
                </TableCell>
                <TableCell>
                  <SeverityBadge severity={log.severity} />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>

        {filteredLogs.length === 0 && (
          <div className="text-center py-12 text-slate-400">
            <div className="text-4xl mb-4">📋</div>
            <p>No log entries match your filters</p>
          </div>
        )}
      </Card>

      {/* Summary Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Total Events', value: auditLogs.length, icon: '📊' },
          { label: 'Errors', value: auditLogs.filter(l => l.severity === 'error' || l.severity === 'critical').length, icon: '❌' },
          { label: 'Warnings', value: auditLogs.filter(l => l.severity === 'warning').length, icon: '⚠️' },
          { label: 'Security Events', value: auditLogs.filter(l => l.action === 'login' || l.action === 'role_change').length, icon: '🔒' },
        ].map(stat => (
          <div key={stat.label} className="p-4 bg-slate-800/50 border border-slate-700/50 rounded-lg">
            <div className="flex items-center gap-3">
              <span className="text-2xl">{stat.icon}</span>
              <div>
                <div className="text-2xl font-bold text-white">{stat.value}</div>
                <div className="text-xs text-slate-400">{stat.label}</div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ============== MAIN ADMIN PAGE ==============

export default function AdminDashboardPage() {
  const [activeTab, setActiveTab] = useState('overview');

  const renderTabContent = () => {
    switch (activeTab) {
      case 'overview':
        return <DashboardOverviewTab />;
      case 'users':
        return <UserManagementTab />;
      case 'content':
        return <ContentManagementTab />;
      case 'settings':
        return <SystemConfigurationTab />;
      case 'audit':
        return <AuditLogTab />;
      default:
        return (
          <div className="flex flex-col items-center justify-center h-96 text-slate-400">
            <div className="text-6xl mb-4">🚧</div>
            <h2 className="text-2xl font-bold text-white mb-2">Coming Soon</h2>
            <p>This section is under construction</p>
            <Button 
              variant="outline" 
              className="mt-4 border-slate-600"
              onClick={() => setActiveTab('overview')}
            >
              Back to Dashboard
            </Button>
          </div>
        );
    }
  };

  return (
    <AdminLayout 
      activeTab={activeTab} 
      onTabChange={setActiveTab}
      title="AETH-1 Admin Dashboard"
    >
      {renderTabContent()}
    </AdminLayout>
  );
}
