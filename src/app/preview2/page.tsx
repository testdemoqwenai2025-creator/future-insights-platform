'use client';

import { useState, useEffect, useCallback } from 'react';
import { useSound } from '@/hooks/useSound';
import {
  Code2,
  Plug,
  Globe,
  Database,
  Zap,
  Copy,
  Check,
  RefreshCw,
  ExternalLink,
  ChevronDown,
  ChevronRight,
  Terminal,
  Box,
  Cloud,
  Lock,
  Eye,
  EyeOff,
  Play,
  Pause,
  ArrowRight,
  Sparkles,
  Cpu,
  Server,
  Wifi,
  HardDrive,
  Activity,
  KeyRound,
  Settings,
  Filter,
  Search,
  Plus,
  Trash2,
  Edit3,
  Power,
  PowerOff,
  Lightbulb
} from 'lucide-react';

// API Endpoint Card Component
function ApiEndpointCard({ 
  method, 
  path, 
  description, 
  status,
  onTest,
  onCopy,
  isCopied 
}: {
  method: string;
  path: string;
  description: string;
  status: 'active' | 'beta' | 'deprecated';
  onTest: () => void;
  onCopy: () => void;
  isCopied: boolean;
}) {
  const methodColors = {
    GET: 'bg-green-500/20 text-green-400 border-green-500/30',
    POST: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
    PUT: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
    DELETE: 'bg-red-500/20 text-red-400 border-red-500/30',
    PATCH: 'bg-purple-500/20 text-purple-400 border-purple-500/30'
  };

  return (
    <div className="group p-4 rounded-xl bg-slate-800/50 border border-slate-700/50 hover:border-violet-500/50 transition-all duration-200 hover:bg-slate-800/80">
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-3 mb-2">
            <span className={`px-2 py-1 rounded text-xs font-bold font-mono ${methodColors[method as keyof typeof methodColors]}`}>
              {method}
            </span>
            <code className="text-sm text-slate-300 font-mono truncate">{path}</code>
            <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase ${
              status === 'active' ? 'bg-green-500/20 text-green-400' :
              status === 'beta' ? 'bg-yellow-500/20 text-yellow-400' :
              'bg-red-500/20 text-red-400'
            }`}>
              {status}
            </span>
          </div>
          <p className="text-sm text-slate-400">{description}</p>
        </div>

        <div className="flex items-center gap-2 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            onClick={onTest}
            className="p-2 rounded-lg bg-violet-600 hover:bg-violet-500 text-white transition-colors"
            title="Test endpoint"
          >
            <Play className="w-4 h-4" />
          </button>
          <button
            onClick={onCopy}
            className={`p-2 rounded-lg transition-colors ${isCopied ? 'bg-green-600 text-white' : 'bg-slate-700 hover:bg-slate-600 text-slate-300'}`}
            title="Copy endpoint"
          >
            {isCopied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
          </button>
        </div>
      </div>
    </div>
  );
}

// Connector Card Component
function ConnectorCard({ 
  name, 
  icon: Icon, 
  category, 
  status,
  isConnected,
  onToggle,
  latency,
  requests
}: {
  name: string;
  icon: React.ElementType;
  category: string;
  status: 'connected' | 'disavailable' | 'error';
  isConnected: boolean;
  onToggle: () => void;
  latency?: number;
  requests?: number;
}) {
  return (
    <div className={`p-5 rounded-xl border transition-all duration-200 ${
      isConnected 
        ? 'bg-gradient-to-br from-slate-800/90 to-slate-900/90 border-green-500/30' 
        : 'bg-slate-800/30 border-slate-700/50'
    }`}>
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
            isConnected ? 'bg-green-500/20' : 'bg-slate-700/50'
          }`}>
            <Icon className={`w-5 h-5 ${isConnected ? 'text-green-400' : 'text-slate-500'}`} />
          </div>
          <div>
            <h4 className="font-semibold text-white">{name}</h4>
            <p className="text-xs text-slate-500">{category}</p>
          </div>
        </div>

        {/* Status Indicator */}
        <div className="flex items-center gap-2">
          <span className={`w-2 h-2 rounded-full ${
            status === 'connected' ? 'bg-green-400 animate-pulse' :
            status === 'error' ? 'bg-red-400' :
            'bg-slate-600'
          }`} />
          <span className="text-xs text-slate-500 capitalize">{status}</span>
        </div>
      </div>

      {/* Stats */}
      {isConnected && (
        <div className="grid grid-cols-2 gap-3 mb-4">
          <div className="px-3 py-2 rounded-lg bg-slate-900/50">
            <p className="text-[10px] text-slate-500 uppercase">Latency</p>
            <p className="text-sm font-mono text-green-400">{latency}ms</p>
          </div>
          <div className="px-3 py-2 rounded-lg bg-slate-900/50">
            <p className="text-[10px] text-slate-500 uppercase">Requests</p>
            <p className="text-sm font-mono text-cyan-400">{requests?.toLocaleString()}</p>
          </div>
        </div>
      )}

      {/* Toggle Button */}
      <button
        onClick={onToggle}
        className={`w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg font-medium transition-all ${
          isConnected 
            ? 'bg-red-500/10 text-red-400 hover:bg-red-500/20 border border-red-500/30' 
            : 'bg-green-500/10 text-green-400 hover:bg-green-500/20 border border-green-500/30'
        }`}
      >
        {isConnected ? (
          <>
            <PowerOff className="w-4 h-4" />
            Disconnect
          </>
        ) : (
          <>
            <Power className="w-4 h-4" />
            Connect
          </>
        )}
      </button>
    </div>
  );
}

// Live Data Display Component
function LiveDataDisplay({ label, value, unit, icon: Icon, trend }: {
  label: string;
  value: number | string;
  unit?: string;
  icon: React.ElementType;
  trend?: 'up' | 'down' | 'stable';
}) {
  return (
    <div className="p-4 rounded-xl bg-slate-800/50 border border-slate-700/50">
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs text-slate-500 uppercase tracking-wider">{label}</span>
        <Icon className="w-4 h-4 text-violet-400" />
      </div>
      <div className="flex items-baseline gap-2">
        <span className="text-2xl font-bold text-white font-mono">{value}</span>
        {unit && <span className="text-sm text-slate-500">{unit}</span>}
        {trend && (
          <span className={`text-xs px-1.5 py-0.5 rounded ${
            trend === 'up' ? 'bg-green-500/20 text-green-400' :
            trend === 'down' ? 'bg-red-500/20 text-red-400' :
            'bg-slate-700 text-slate-400'
          }`}>
            {trend === 'up' ? '↑' : trend === 'down' ? '↓' : '→'}
          </span>
        )}
      </div>
    </div>
  );
}

// Code Snippet Component
function CodeSnippet({ code, language = 'bash', onExecute }: {
  code: string;
  language?: string;
  onExecute?: () => void;
}) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="rounded-xl bg-slate-950 border border-slate-800 overflow-hidden">
      <div className="flex items-center justify-between px-4 py-2 bg-slate-900/80 border-b border-slate-800">
        <div className="flex items-center gap-2">
          <div className="flex gap-1.5">
            <div className="w-3 h-3 rounded-full bg-red-500" />
            <div className="w-3 h-3 rounded-full bg-yellow-500" />
            <div className="w-3 h-3 rounded-full bg-green-500" />
          </div>
          <span className="ml-2 text-xs text-slate-500 font-mono">{language}</span>
        </div>
        <div className="flex items-center gap-2">
          {onExecute && (
            <button
              onClick={onExecute}
              className="flex items-center gap-1 px-2 py-1 rounded bg-violet-600 hover:bg-violet-500 text-xs text-white transition-colors"
            >
              <Play className="w-3 h-3" /> Run
            </button>
          )}
          <button
            onClick={handleCopy}
            className="p-1.5 rounded hover:bg-slate-800 transition-colors"
          >
            {copied ? <Check className="w-4 h-4 text-green-400" /> : <Copy className="w-4 h-4 text-slate-400" />}
          </button>
        </div>
      </div>
      <pre className="p-4 overflow-x-auto">
        <code className="text-sm font-mono text-slate-300">{code}</code>
      </pre>
    </div>
  );
}

export default function Preview2FrontendHub() {
  const [activeTab, setActiveTab] = useState<'endpoints' | 'connectors' | 'playground'>('endpoints');
  const [searchQuery, setSearchQuery] = useState('');
  const [copiedEndpoint, setCopiedEndpoint] = useState<string | null>(null);
  const [connectors, setConnectors] = useState([
    { id: 'crypto', name: 'CoinGecko', icon: Globe, category: 'Crypto Data', status: 'disavailable' as const, connected: false },
    { id: 'quotes', name: 'Quotable', icon: Sparkles, category: 'Inspirational', status: 'disavailable' as const, connected: false },
    { id: 'facts', name: 'Useless Facts', icon: Lightbulb, category: 'Knowledge', status: 'disavailable' as const, connected: false },
    { id: 'weather', name: 'Open-Meteo', icon: Cloud, category: 'Weather', status: 'disavailable' as const, connected: false }
  ]);
  const [liveData, setLiveData] = useState({
    activeConnections: 0,
    requestsPerSecond: 0,
    avgLatency: 0,
    uptime: '99.9%'
  });
  const [testResult, setTestResult] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { playSound } = useSound();

  // Simulate live data updates
  useEffect(() => {
    const interval = setInterval(() => {
      setLiveData(prev => ({
        activeConnections: connectors.filter(c => c.connected).length,
        requestsPerSecond: Math.floor(Math.random() * 100) + (connectors.filter(c => c.connected).length * 10),
        avgLatency: Math.floor(Math.random() * 50) + 20,
        uptime: '99.9%'
      }));
    }, 2000);

    return () => clearInterval(interval);
  }, [connectors]);

  // Fetch data from free connectors
  const fetchConnectorData = useCallback(async (connectorId: string) => {
    setIsLoading(true);
    playSound('open', 0.25);
    
    try {
      let url = '';
      switch (connectorId) {
        case 'crypto':
          url = '/api/connectors/crypto';
          break;
        case 'quotes':
          url = '/api/connectors/quotes';
          break;
        case 'facts':
          url = '/api/connectors/facts';
          break;
        default:
          url = '/api/connectors/facts';
      }

      const response = await fetch(url);
      const data = await response.json();
      
      setTestResult(JSON.stringify(data, null, 2));
      playSound('success', 0.35);
    } catch (error) {
      setTestResult(JSON.stringify({ error: 'Failed to fetch data', details: error.message }, null, 2));
      playSound('error', 0.3);
    } finally {
      setIsLoading(false);
    }
  }, [playSound]);

  const toggleConnector = useCallback((id: string) => {
    playSound('click', 0.25);
    
    setConnectors(prev => prev.map(c => {
      if (c.id === id) {
        const newState = !c.connected;
        if (newState) {
          playSound('success', 0.3);
          fetchConnectorData(id);
        } else {
          playSound('close', 0.25);
        }
        return { ...c, connected: newState, status: newState ? 'connected' as const : 'disavailable' as const };
      }
      return c;
    }));
  }, [playSound, fetchConnectorData]);

  const copyToClipboard = useCallback((text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedEndpoint(id);
    playSound('pop', 0.2);
    setTimeout(() => setCopiedEndpoint(null), 2000);
  }, [playSound]);

  const endpoints = [
    { method: 'GET', path: '/api/v1/status', description: 'System health check and status', status: 'active' as const },
    { method: 'GET', path: '/api/v1/connectors', description: 'List all available connectors', status: 'active' as const },
    { method: 'POST', path: '/api/v1/connectors/:id/test', description: 'Test a specific connector', status: 'beta' as const },
    { method: 'GET', path: '/api/v1/data/crypto', description: 'Fetch cryptocurrency prices', status: 'active' as const },
    { method: 'GET', path: '/api/v1/data/quotes', description: 'Get inspirational quotes', status: 'active' as const },
    { method: 'GET', path: '/api/v1/data/facts', description: 'Random interesting facts', status: 'beta' as const },
    { method: 'POST', path: '/api/v1/webhook/register', description: 'Register a new webhook', status: 'active' as const },
    { method: 'DELETE', path: '/api/v1/cache/clear', description: 'Clear all cached data', status: 'beta' as const }
  ];

  const filteredEndpoints = endpoints.filter(ep => 
    ep.path.toLowerCase().includes(searchQuery.toLowerCase()) ||
    ep.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 text-white p-6 md:p-8">
      {/* Header */}
      <div className="max-w-7xl mx-auto mb-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="p-2 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500">
            <Code2 className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold">Frontend Hub</h1>
            <p className="text-slate-400">API Explorer & Integration Connectors</p>
          </div>
        </div>
      </div>

      {/* Live Stats Bar */}
      <div className="max-w-7xl mx-auto mb-8 grid grid-cols-2 md:grid-cols-4 gap-4">
        <LiveDataDisplay 
          label="Active Connections" 
          value={liveData.activeConnections} 
          icon={Wifi}
          trend={liveData.activeConnections > 0 ? 'up' : 'stable'}
        />
        <LiveDataDisplay 
          label="Requests/sec" 
          value={liveData.requestsPerSecond} 
          icon={Activity}
          trend="up"
        />
        <LiveDataDisplay 
          label="Avg Latency" 
          value={liveData.avgLatency} 
          unit="ms"
          icon={Zap}
          trend="stable"
        />
        <LiveDataDisplay 
          label="Uptime" 
          value={liveData.uptime} 
          icon={Server}
          trend="stable"
        />
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto">
        {/* Tab Navigation */}
        <div className="flex items-center gap-2 mb-6 p-1 bg-slate-800/50 rounded-xl w-fit">
          {[
            { id: 'endpoints', label: 'API Endpoints', icon: Terminal },
            { id: 'connectors', label: 'Connectors', icon: Plug },
            { id: 'playground', label: 'Playground', icon: Code2 }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => {
                setActiveTab(tab.id as typeof activeTab);
                playSound('click', 0.2);
              }}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-lg font-medium transition-all ${
                activeTab === tab.id
                  ? 'bg-violet-600 text-white shadow-lg shadow-violet-500/30'
                  : 'text-slate-400 hover:text-white hover:bg-slate-700/50'
              }`}
            >
              <tab.icon className="w-4 h-4" />
              {tab.label}
            </button>
          ))}
        </div>

        {/* Endpoints Tab */}
        {activeTab === 'endpoints' && (
          <div className="space-y-6">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
              <input
                type="text"
                placeholder="Search endpoints..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-4 py-3 rounded-xl bg-slate-800/50 border border-slate-700/50 text-white placeholder:text-slate-500 focus:border-violet-500/50 focus:ring-1 focus:ring-violet-500/50 outline-none transition-all"
              />
            </div>

            {/* Endpoints List */}
            <div className="space-y-3">
              {filteredEndpoints.map((endpoint) => (
                <ApiEndpointCard
                  key={endpoint.path}
                  {...endpoint}
                  isCopied={copiedEndpoint === endpoint.path}
                  onTest={() => {
                    playSound('whoosh', 0.25);
                    setTestResult(`// Testing ${endpoint.method} ${endpoint.path}\n{\n  "status": "success",\n  "message": "Endpoint responding normally",\n  "responseTime": "${Math.floor(Math.random() * 100)}ms"\n}`);
                  }}
                  onCopy={() => copyToClipboard(endpoint.path, endpoint.path)}
                />
              ))}
            </div>

            {filteredEndpoints.length === 0 && (
              <div className="text-center py-12 text-slate-500">
                <Search className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>No endpoints found matching "{searchQuery}"</p>
              </div>
            )}
          </div>
        )}

        {/* Connectors Tab */}
        {activeTab === 'connectors' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <p className="text-slate-400">
                Connect to free APIs and services. Click to enable/disable.
              </p>
              <button
                onClick={() => playSound('refresh', 0.2)}
                className="flex items-center gap-2 px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
              >
                <RefreshCw className="w-4 h-4" />
                Refresh All
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {connectors.map((connector) => (
                <ConnectorCard
                  key={connector.id}
                  {...connector}
                  latency={Math.floor(Math.random() * 100) + 20}
                  requests={Math.floor(Math.random() * 10000)}
                  onToggle={() => toggleConnector(connector.id)}
                />
              ))}
            </div>
          </div>
        )}

        {/* Playground Tab */}
        {activeTab === 'playground' && (
          <div className="grid lg:grid-cols-2 gap-6">
            {/* Left - Quick Actions */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-white">Quick Actions</h3>
              
              <div className="grid grid-cols-2 gap-3">
                {[
                  { label: 'Fetch Crypto', action: () => fetchConnectorData('crypto'), icon: Globe, color: 'from-orange-500 to-yellow-500' },
                  { label: 'Get Quote', action: () => fetchConnectorData('quotes'), icon: Sparkles, color: 'from-purple-500 to-pink-500' },
                  { label: 'Random Fact', action: () => fetchConnectorData('facts'), icon: Lightbulb, color: 'from-blue-500 to-cyan-500' },
                  { label: 'Clear Result', action: () => { setTestResult(null); playSound('close', 0.2); }, icon: Trash2, color: 'from-red-500 to-rose-500' }
                ].map((item) => (
                  <button
                    key={item.label}
                    onClick={item.action}
                    disabled={isLoading}
                    className="group p-4 rounded-xl bg-slate-800/50 border border-slate-700/50 hover:border-violet-500/50 transition-all hover:scale-[1.02] active:scale-[0.98]"
                  >
                    <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${item.color} flex items-center justify-center mb-3 group-hover:scale-110 transition-transform`}>
                      <item.icon className="w-5 h-5 text-white" />
                    </div>
                    <p className="font-medium text-white text-sm">{item.label}</p>
                  </button>
                ))}
              </div>

              {/* Example Requests */}
              <div className="mt-6">
                <h4 className="text-sm font-medium text-slate-400 mb-3">Example cURL Commands</h4>
                <CodeSnippet
                  code={`curl -X GET https://api.aeth.dev/v1/data/crypto \\
  -H "Authorization: Bearer YOUR_TOKEN" \\
  -H "Content-Type: application/json"`}
                  language="curl"
                  onExecute={() => fetchConnectorData('crypto')}
                />
              </div>
            </div>

            {/* Right - Response */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-white">Response</h3>
                {isLoading && (
                  <div className="flex items-center gap-2 text-violet-400">
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span className="text-sm">Loading...</span>
                  </div>
                )}
              </div>

              <div className="rounded-xl bg-slate-950 border border-slate-800 min-h-[400px] overflow-hidden">
                <div className="flex items-center justify-between px-4 py-2 bg-slate-900/80 border-b border-slate-800">
                  <span className="text-xs text-slate-500 font-mono">response.json</span>
                  {testResult && (
                    <button
                      onClick={() => copyToClipboard(testResult!, 'result')}
                      className="p-1.5 rounded hover:bg-slate-800 transition-colors"
                    >
                      {copiedEndpoint === 'result' ? <Check className="w-4 h-4 text-green-400" /> : <Copy className="w-4 h-4 text-slate-400" />}
                    </button>
                  )}
                </div>
                <pre className="p-4 overflow-auto max-h-[360px]">
                  {testResult ? (
                    <code className="text-sm font-mono text-green-400 whitespace-pre-wrap">{testResult}</code>
                  ) : (
                    <div className="flex flex-col items-center justify-center h-[340px] text-slate-600">
                      <Terminal className="w-12 h-12 mb-4 opacity-50" />
                      <p className="text-sm">Select an action or test an endpoint</p>
                      <p className="text-xs mt-1">Results will appear here</p>
                    </div>
                  )}
                </pre>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
