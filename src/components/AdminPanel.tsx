import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { 
  Lock, 
  Terminal, 
  Users, 
  Key, 
  Database, 
  RefreshCw, 
  Trash2, 
  ShieldAlert, 
  TrendingUp, 
  Server,
  UserPlus,
  Play
} from 'lucide-react';
import { ApiKey, ServerLog, DownloadItem } from '../types';

interface AdminPanelProps {
  history: DownloadItem[];
  onDeleteHistoryItem: (id: string) => void;
  addToast: (text: string, type: 'success' | 'error' | 'info') => void;
}

export const AdminPanel: React.FC<AdminPanelProps> = ({
  history,
  onDeleteHistoryItem,
  addToast
}) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [passwordInput, setPasswordInput] = useState('');
  const [activeTab, setActiveTab] = useState<'terminal' | 'users' | 'keys'>('terminal');
  
  // Admin entities loaded from backend
  const [logs, setLogs] = useState<string[]>([]);
  const [apiKeys, setApiKeys] = useState<ApiKey[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const [newKeyName, setNewKeyName] = useState('');
  const [newKeyLimit, setNewKeyLimit] = useState(1000);

  // Poll server terminal logs and key assets
  useEffect(() => {
    if (isAuthenticated) {
      fetchAdminAssets();
      const interval = setInterval(fetchAdminAssets, 4000); // Poll logs/keys every 4 seconds
      return () => clearInterval(interval);
    }
  }, [isAuthenticated]);

  const fetchAdminAssets = async () => {
    try {
      const logsRes = await fetch('/api/terminal-logs');
      if (logsRes.ok) {
        const data = await logsRes.json();
        setLogs(data.logs || []);
      }

      const keysRes = await fetch('/api/api-keys');
      if (keysRes.ok) {
        const data = await keysRes.json();
        setApiKeys(data || []);
      }

      const usersRes = await fetch('/api/users');
      if (usersRes.ok) {
        const data = await usersRes.json();
        setUsers(data || []);
      }
    } catch (e) {
      // Quiet fail
    }
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (passwordInput === 'admin123') {
      setIsAuthenticated(true);
      addToast('Administrative authorization granted.', 'success');
    } else {
      addToast('Invalid admin security key signature.', 'error');
    }
  };

  const createApiKey = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newKeyName.trim()) return;

    try {
      const response = await fetch('/api/api-keys', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: newKeyName, limit: newKeyLimit })
      });
      if (response.ok) {
        setNewKeyName('');
        addToast('New secure API token successfully registered.', 'success');
        fetchAdminAssets();
      }
    } catch (err) {
      addToast('Failed to write key record to db.', 'error');
    }
  };

  const revokeApiKey = async (id: string) => {
    try {
      const response = await fetch('/api/api-keys/revoke', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id })
      });
      if (response.ok) {
        addToast('Secure API token access revoked.', 'warn');
        fetchAdminAssets();
      }
    } catch (err) {
      addToast('Could not revoke selected key.', 'error');
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="w-full max-w-md mx-auto bg-[#060814]/80 border border-slate-800/80 rounded-2xl p-6 backdrop-blur-xl shadow-2xl relative overflow-hidden">
        {/* Neon blue ambient flare */}
        <div className="absolute top-0 inset-x-0 h-[1.5px] bg-cyan-500 shadow-[0_0_10px_rgba(0,210,255,0.8)] animate-pulse" />

        <div className="text-center mb-6">
          <div className="p-3 bg-cyan-500/10 border border-cyan-500/30 text-[#00ffcc] inline-flex rounded-xl mb-3 shadow-[0_0_12px_rgba(0,255,204,0.1)]">
            <Lock className="w-6 h-6 animate-pulse" />
          </div>
          <h3 className="text-base font-bold text-white uppercase tracking-wider font-mono">
            Admin Auth Cluster
          </h3>
          <p className="text-xs text-slate-400 mt-1">
            Unlock administrative overrides with security passcode (hint: admin123)
          </p>
        </div>

        <form onSubmit={handleLogin} className="space-y-4">
          <div className="space-y-1">
            <label className="text-[10px] text-slate-500 font-mono uppercase tracking-widest block font-bold">
              Access Code Signature
            </label>
            <input
              type="password"
              placeholder="••••••••••••"
              value={passwordInput}
              onChange={(e) => setPasswordInput(e.target.value)}
              className="w-full bg-slate-900 border border-slate-850 focus:border-cyan-500/50 focus:outline-none rounded-xl py-3 px-4 text-sm font-mono text-center text-white"
            />
          </div>

          <button
            type="submit"
            className="w-full py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-500 hover:scale-[1.01] active:scale-[0.99] text-black font-bold text-xs uppercase tracking-wider transition-all cursor-pointer shadow-lg shadow-cyan-500/10"
          >
            Authenticate Node
          </button>
        </form>
      </div>
    );
  }

  return (
    <div className="w-full bg-[#060814]/40 border border-slate-800/80 backdrop-blur-2xl rounded-2xl p-5 shadow-2xl">
      {/* Header Tabs */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-900 pb-4 mb-5">
        <div className="flex items-center gap-3">
          <Server className="w-5 h-5 text-[#00ffcc]" />
          <div>
            <h3 className="text-sm font-bold text-white uppercase tracking-wider font-mono">
              System Admin console
            </h3>
            <span className="text-[9px] text-emerald-400 font-mono uppercase tracking-widest">
              ● Server Status: COMPLIANT_ACTIVE
            </span>
          </div>
        </div>

        {/* Tab switcher */}
        <div className="flex gap-1.5 self-start">
          <button
            onClick={() => setActiveTab('terminal')}
            className={`flex items-center gap-2 text-[10px] font-semibold px-3.5 py-2 rounded-lg border uppercase tracking-wider transition-all cursor-pointer ${
              activeTab === 'terminal'
                ? 'bg-cyan-500/10 border-cyan-500 text-[#00d2ff]'
                : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:text-white'
            }`}
          >
            <Terminal className="w-3.5 h-3.5" />
            Live Logs
          </button>

          <button
            onClick={() => setActiveTab('users')}
            className={`flex items-center gap-2 text-[10px] font-semibold px-3.5 py-2 rounded-lg border uppercase tracking-wider transition-all cursor-pointer ${
              activeTab === 'users'
                ? 'bg-cyan-500/10 border-cyan-500 text-[#00d2ff]'
                : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:text-white'
            }`}
          >
            <Users className="w-3.5 h-3.5" />
            Users
          </button>

          <button
            onClick={() => setActiveTab('keys')}
            className={`flex items-center gap-2 text-[10px] font-semibold px-3.5 py-2 rounded-lg border uppercase tracking-wider transition-all cursor-pointer ${
              activeTab === 'keys'
                ? 'bg-cyan-500/10 border-cyan-500 text-[#00d2ff]'
                : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:text-white'
            }`}
          >
            <Key className="w-3.5 h-3.5" />
            API Keys
          </button>
        </div>
      </div>

      {/* Tabs Content */}
      <div className="w-full">
        {/* 1. Terminal Logs */}
        {activeTab === 'terminal' && (
          <div className="flex flex-col gap-4">
            <div className="flex justify-between items-center text-xs">
              <span className="text-slate-400 font-mono text-[10px] uppercase">
                Active telemetry event stream (updates live)
              </span>
              <button 
                onClick={fetchAdminAssets} 
                className="text-[10px] font-mono hover:text-[#00ffcc] text-slate-400 flex items-center gap-1 cursor-pointer"
              >
                <RefreshCw className="w-3 h-3 animate-spin" />
                Poll Now
              </button>
            </div>

            {/* Custom Terminal container */}
            <div className="w-full bg-black/95 rounded-xl border border-slate-850 p-4 h-72 overflow-y-auto font-mono text-xs flex flex-col gap-1.5 scrollbar-thin scrollbar-thumb-slate-800">
              {logs.map((log, index) => {
                let colorClass = 'text-slate-300';
                if (log.includes('[SUCCESS]')) colorClass = 'text-emerald-400';
                if (log.includes('[WARN]')) colorClass = 'text-amber-400';
                if (log.includes('[ERROR]')) colorClass = 'text-rose-400 bg-rose-500/5 px-1 py-0.5 rounded';

                return (
                  <div key={index} className={`leading-relaxed tracking-wide ${colorClass}`}>
                    {log}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* 2. User Management roster */}
        {activeTab === 'users' && (
          <div className="flex flex-col gap-4">
            <div className="flex justify-between items-center">
              <span className="text-xs text-slate-400 font-mono uppercase">
                Registered database clients
              </span>
            </div>

            <div className="overflow-x-auto rounded-xl border border-slate-850 bg-slate-900/20">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-900/80 text-slate-400 border-b border-slate-800 font-mono text-[10px] uppercase">
                    <th className="p-3.5">User Node ID</th>
                    <th className="p-3.5">Username Roster</th>
                    <th className="p-3.5">Security Role</th>
                    <th className="p-3.5">Node Registered</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-900">
                  {users.map((u) => (
                    <tr key={u.id} className="hover:bg-slate-900/30 text-slate-300">
                      <td className="p-3.5 font-mono text-[11px] text-[#00d2ff]">{u.id}</td>
                      <td className="p-3.5 font-semibold">{u.username}</td>
                      <td className="p-3.5">
                        <span className={`px-2 py-0.5 rounded text-[9px] font-mono uppercase ${
                          u.role === 'admin' 
                            ? 'bg-rose-500/10 border border-rose-500/20 text-rose-300' 
                            : 'bg-cyan-500/10 border border-cyan-500/20 text-cyan-300'
                        }`}>
                          {u.role}
                        </span>
                      </td>
                      <td className="p-3.5 font-mono text-[10px] text-slate-500">
                        {new Date(u.createdAt).toLocaleString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* 3. API Keys Management */}
        {activeTab === 'keys' && (
          <div className="flex flex-col gap-6">
            {/* Create form */}
            <form onSubmit={createApiKey} className="grid grid-cols-1 md:grid-cols-12 gap-4 bg-[#0a0c1a] border border-slate-850 p-4 rounded-xl items-end">
              <div className="md:col-span-6 flex flex-col gap-1.5">
                <label className="text-[9px] text-slate-400 uppercase tracking-widest font-mono font-bold">
                  API Key Node Label
                </label>
                <input
                  type="text"
                  placeholder="e.g. Android client bypass token..."
                  value={newKeyName}
                  onChange={(e) => setNewKeyName(e.target.value)}
                  className="bg-slate-900 border border-slate-800 px-3.5 py-2.5 rounded-xl text-xs text-white focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div className="md:col-span-4 flex flex-col gap-1.5">
                <label className="text-[9px] text-slate-400 uppercase tracking-widest font-mono font-bold">
                  Daily Limit Clicks
                </label>
                <input
                  type="number"
                  value={newKeyLimit}
                  onChange={(e) => setNewKeyLimit(parseInt(e.target.value) || 1000)}
                  className="bg-slate-900 border border-slate-800 px-3.5 py-2.5 rounded-xl text-xs text-white focus:outline-none focus:border-cyan-500 font-mono"
                />
              </div>

              <button
                type="submit"
                className="md:col-span-2 py-2.5 bg-[#00ffcc] hover:bg-cyan-400 text-black font-bold rounded-xl text-xs uppercase tracking-wide cursor-pointer transition-all hover:scale-105 active:scale-95"
              >
                Register
              </button>
            </form>

            {/* List */}
            <div className="overflow-x-auto rounded-xl border border-slate-850 bg-slate-900/20">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-900/80 text-slate-400 border-b border-slate-800 font-mono text-[10px] uppercase">
                    <th className="p-3.5">API Token Signature</th>
                    <th className="p-3.5">Label</th>
                    <th className="p-3.5">Usage</th>
                    <th className="p-3.5">Status</th>
                    <th className="p-3.5 text-right">Overrides</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-900">
                  {apiKeys.map((k) => (
                    <tr key={k.id} className="hover:bg-slate-900/30 text-slate-300">
                      <td className="p-3.5 font-mono text-[11px] text-[#00ffcc] tracking-wide">
                        {k.key}
                      </td>
                      <td className="p-3.5 font-semibold text-slate-300">
                        {k.name}
                      </td>
                      <td className="p-3.5 font-mono text-slate-400">
                        <strong>{k.clicks}</strong> / {k.limit} clicks
                      </td>
                      <td className="p-3.5">
                        <span className={`px-2 py-0.5 rounded text-[8px] font-mono uppercase ${
                          k.status === 'active'
                            ? 'bg-emerald-500/10 text-emerald-300 border border-emerald-500/20'
                            : 'bg-rose-500/10 text-rose-300 border border-rose-500/20'
                        }`}>
                          {k.status}
                        </span>
                      </td>
                      <td className="p-3.5 text-right">
                        {k.status === 'active' && (
                          <button
                            onClick={() => revokeApiKey(k.id)}
                            className="p-1 text-slate-500 hover:text-rose-400 transition-colors cursor-pointer"
                            title="Revoke Token Access"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
