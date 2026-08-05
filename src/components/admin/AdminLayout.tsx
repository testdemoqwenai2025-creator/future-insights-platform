'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';

// Admin Layout Types
export interface NavItem {
  id: string;
  label: string;
  icon: string;
  badge?: number;
}

interface AdminLayoutProps {
  children: React.ReactNode;
  activeTab: string;
  onTabChange: (tabId: string) => void;
  title?: string;
}

const navigationItems: NavItem[] = [
  { id: 'overview', label: 'Dashboard', icon: '📊' },
  { id: 'users', label: 'User Management', icon: '👥' },
  { id: 'content', label: 'Content Management', icon: '📄' },
  { id: 'settings', label: 'System Configuration', icon: '⚙️' },
  { id: 'audit', label: 'Audit Log', icon: '📋' },
];

export function AdminLayout({ children, activeTab, onTabChange, title = 'AETH-1 Admin' }: AdminLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [notifications] = useState(5);
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950 text-slate-100">
      {/* Top Navigation */}
      <header className="h-16 bg-slate-900/80 backdrop-blur-xl border-b border-indigo-500/20 fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-4 lg:px-6">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="text-slate-400 hover:text-slate-200 hover:bg-slate-800"
          >
            <span className="text-xl">{sidebarOpen ? '☰' : '☰'}</span>
          </Button>
          <h1 className="text-xl font-bold bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">
            ⚡ {title}
          </h1>
        </div>

        <div className="flex items-center gap-3">
          {/* Search */}
          <div className="hidden md:flex items-center bg-slate-800/50 border border-slate-700/50 rounded-lg px-3 py-2 gap-2 focus-within:border-indigo-500/50 transition-colors">
            <span className="text-slate-500">🔍</span>
            <Input
              type="text"
              placeholder="Search users, papers..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-transparent border-none text-sm text-slate-200 placeholder:text-slate-500 w-48 lg:w-64 focus-visible:ring-0 p-0 h-auto"
            />
          </div>

          {/* Notifications */}
          <Button
            variant="ghost"
            size="icon"
            className="relative text-slate-400 hover:text-slate-200"
          >
            <span className="text-lg">🔔</span>
            {notifications > 0 && (
              <Badge className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs bg-red-500 text-white border-0">
                {notifications}
              </Badge>
            )}
          </Button>

          {/* User Menu */}
          <div className="relative">
            <Button
              variant="outline"
              onClick={() => setUserMenuOpen(!userMenuOpen)}
              className="bg-indigo-500/10 border-indigo-500/30 text-indigo-300 hover:bg-indigo-500/20 hover:text-indigo-200 gap-2"
            >
              <div className="w-7 h-7 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-xs font-bold text-white">
                A
              </div>
              <span className="hidden sm:inline text-sm">Admin</span>
              <span className="text-xs opacity-60">▼</span>
            </Button>

            {userMenuOpen && (
              <div className="absolute right-0 mt-2 w-48 bg-slate-800 border border-slate-700 rounded-lg shadow-xl z-50 overflow-hidden">
                {['Profile Settings', 'API Keys', 'Documentation', 'Sign Out'].map((item) => (
                  <button
                    key={item}
                    onClick={() => setUserMenuOpen(false)}
                    className="w-full px-4 py-2.5 text-left text-sm text-slate-300 hover:bg-slate-700 hover:text-white transition-colors"
                  >
                    {item}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </header>

      <div className="flex pt-16">
        {/* Sidebar */}
        <aside
          className={`fixed left-0 top-16 bottom-0 bg-slate-900/70 backdrop-blur-sm border-r border-slate-800 transition-all duration-300 z-40 ${
            sidebarOpen ? 'w-64 translate-x-0' : 'w-0 -translate-x-full'
          } overflow-hidden`}
        >
          <nav className="p-4 space-y-1">
            {navigationItems.map((item) => (
              <button
                key={item.id}
                onClick={() => onTabChange(item.id)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left transition-all ${
                  activeTab === item.id
                    ? 'bg-indigo-500/15 text-indigo-300 border-l-3 border-indigo-500 font-medium'
                    : 'text-slate-400 hover:bg-slate-800/50 hover:text-slate-200'
                }`}
              >
                <span className="text-lg">{item.icon}</span>
                <span className="flex-1">{item.label}</span>
                {item.badge && (
                  <Badge variant="secondary" className="bg-slate-700 text-slate-300 text-xs">
                    {item.badge}
                  </Badge>
                )}
              </button>
            ))}
          </nav>

          {/* System Status Footer */}
          <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-slate-800">
            <div className="text-xs text-slate-500 mb-2">System Status</div>
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-sm text-emerald-400">All Systems Operational</span>
            </div>
          </div>
        </aside>

        {/* Main Content */}
        <main
          className={`flex-1 min-h-[calc(100vh-4rem)] transition-all duration-300 ${
            sidebarOpen ? 'ml-64' : 'ml-0'
          }`}
        >
          <div className="p-4 lg:p-8">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}

// Re-export types for convenience
export type { NavItem };
