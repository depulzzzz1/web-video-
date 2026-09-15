import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  X, 
  User, 
  Shield, 
  Key, 
  CreditCard, 
  Activity, 
  QrCode, 
  Zap, 
  Loader2, 
  CheckCircle2, 
  Github, 
  Chrome, 
  Sparkles,
  Lock,
  Mail,
  Copy,
  Plus,
  Trash2,
  RefreshCw,
  Bell,
  Search,
  Globe,
  Settings,
  HelpCircle,
  Clock,
  LogOut,
  Sliders
} from 'lucide-react';

interface UserProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  accentColor: 'blue' | 'purple' | 'orange' | 'green';
  addToast: (text: string, type: 'success' | 'error' | 'info') => void;
}

export const UserProfileModal: React.FC<UserProfileModalProps> = ({
  isOpen,
  onClose,
  accentColor,
  addToast
}) => {
  const [activeTab, setActiveTab] = useState<'profile' | 'security' | 'premium' | 'api'>('profile');
  
  // Auth state
  const [isLoggedIn, setIsLoggedIn] = useState(() => {
    return localStorage.getItem('isLoggedIn') === 'true';
  });
  const [authMode, setAuthMode] = useState<'login' | 'register' | 'forgot'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState(() => localStorage.getItem('userName') || 'Dez Cyberpunk');
  const [avatarIndex, setAvatarIndex] = useState(() => Number(localStorage.getItem('userAvatarIndex')) || 0);

  // Security
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');

  // Subscription Details
  const [subscriptionRole, setSubscriptionRole] = useState<'Free' | 'Premium' | 'VIP'>(() => {
    return (localStorage.getItem('subscriptionRole') as 'Free' | 'Premium' | 'VIP') || 'Free';
  });
  const [downloadLimitToday, setDownloadLimitToday] = useState(() => {
    return subscriptionRole === 'Free' ? 3 : subscriptionRole === 'Premium' ? 50 : 99999;
  });

  // Payment State
  const [showPaymentGate, setShowPaymentGate] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<'Premium' | 'VIP'>('Premium');
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<'QRIS' | 'DANA' | 'GoPay' | 'OVO' | 'Bank'>('QRIS');
  const [paymentStatus, setPaymentStatus] = useState<'idle' | 'generating' | 'pending' | 'success'>('idle');
  const [qrValue, setQrValue] = useState('');

  // Rest API Keys State
  const [apiKeys, setApiKeys] = useState<{ id: string; name: string; key: string; limit: number; used: number; createdAt: string }[]>(() => {
    const savedKeys = localStorage.getItem('userApiKeys');
    return savedKeys ? JSON.parse(savedKeys) : [
      { id: '1', name: 'Default Portal Stream', key: 'up_live_ak_77f48b89c92b4510c410', limit: 500, used: 24, createdAt: '2026-06-15' }
    ];
  });
  const [newKeyName, setNewKeyName] = useState('');
  const [newKeyLimit, setNewKeyLimit] = useState(1000);

  // Profile presets
  const avatars = [
    'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=150&auto=format&fit=crop&q=80', // Cyber abstract 1
    'https://images.unsplash.com/photo-1620641788421-7a1c342ea42e?w=150&auto=format&fit=crop&q=80', // Cyber abstract 2
    'https://images.unsplash.com/photo-1614850523459-c2f4c699c52e?w=150&auto=format&fit=crop&q=80', // Cyber abstract 3
    'https://images.unsplash.com/photo-1618005198143-e528346436f1?w=150&auto=format&fit=crop&q=80', // Cyber abstract 4
  ];

  const currClasses = {
    blue: {
      text: 'text-[#00d2ff]',
      textMuted: 'text-cyan-400',
      bg: 'bg-cyan-500',
      border: 'border-cyan-500/30',
      borderFocus: 'focus:border-cyan-500/50',
      bgMuted: 'bg-[#0c1328]',
      gradient: 'from-cyan-500 to-blue-500',
      shadow: 'shadow-cyan-500/10',
      hoverBg: 'hover:bg-[#00ffcc] hover:text-black',
      accentBg: 'bg-cyan-500/10',
      accentText: 'text-[#00ffcc]',
    },
    purple: {
      text: 'text-[#d946ef]',
      textMuted: 'text-fuchsia-400',
      bg: 'bg-fuchsia-500',
      border: 'border-fuchsia-500/30',
      borderFocus: 'focus:border-fuchsia-500/50',
      bgMuted: 'bg-[#1e0e29]',
      gradient: 'from-fuchsia-500 to-purple-500',
      shadow: 'shadow-fuchsia-500/10',
      hoverBg: 'hover:bg-[#f472b6] hover:text-black',
      accentBg: 'bg-fuchsia-500/10',
      accentText: 'text-[#f5d0fe]',
    },
    orange: {
      text: 'text-[#f97316]',
      textMuted: 'text-orange-400',
      bg: 'bg-orange-500',
      border: 'border-orange-500/30',
      borderFocus: 'focus:border-orange-500/50',
      bgMuted: 'bg-[#1c0d06]',
      gradient: 'from-orange-500 to-red-500',
      shadow: 'shadow-orange-500/10',
      hoverBg: 'hover:bg-[#fb923c] hover:text-black',
      accentBg: 'bg-orange-500/10',
      accentText: 'text-[#ffedd5]',
    },
    green: {
      text: 'text-[#22c55e]',
      textMuted: 'text-emerald-400',
      bg: 'bg-emerald-500',
      border: 'border-emerald-500/30',
      borderFocus: 'focus:border-emerald-500/50',
      bgMuted: 'bg-[#051a10]',
      gradient: 'from-emerald-500 to-teal-500',
      shadow: 'shadow-emerald-500/10',
      hoverBg: 'hover:bg-[#4ade80] hover:text-black',
      accentBg: 'bg-emerald-500/10',
      accentText: 'text-[#4ade80]',
    }
  }[accentColor];

  useEffect(() => {
    localStorage.setItem('subscriptionRole', subscriptionRole);
    setDownloadLimitToday(subscriptionRole === 'Free' ? 3 : subscriptionRole === 'Premium' ? 50 : 99999);
  }, [subscriptionRole]);

  useEffect(() => {
    localStorage.setItem('userApiKeys', JSON.stringify(apiKeys));
  }, [apiKeys]);

  const handleAuthSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (authMode === 'login') {
      localStorage.setItem('isLoggedIn', 'true');
      localStorage.setItem('userName', fullName);
      setIsLoggedIn(true);
      addToast(`Session authenticated as: ${fullName}`, 'success');
    } else if (authMode === 'register') {
      localStorage.setItem('isLoggedIn', 'true');
      localStorage.setItem('userName', fullName);
      setIsLoggedIn(true);
      addToast(`Account established! Session created.`, 'success');
    } else {
      addToast(`Reset payload sent to: ${email}`, 'info');
      setAuthMode('login');
    }
  };

  const handleOAuthLogin = (provider: string) => {
    addToast(`Bridging secure handshakes to ${provider}...`, 'info');
    setTimeout(() => {
      localStorage.setItem('isLoggedIn', 'true');
      if (provider === 'Google') setFullName('Google Node User');
      if (provider === 'GitHub') setFullName('Octo Dev Node');
      if (provider === 'Discord') setFullName('Glitch Cyber User');
      setIsLoggedIn(true);
      addToast(`${provider} OAuth pipeline established successfully!`, 'success');
    }, 1200);
  };

  const handleLogout = () => {
    localStorage.removeItem('isLoggedIn');
    setIsLoggedIn(false);
    addToast('Administrative session destroyed.', 'info');
  };

  const handleProfileUpdate = (e: React.FormEvent) => {
    e.preventDefault();
    localStorage.setItem('userName', fullName);
    localStorage.setItem('userAvatarIndex', String(avatarIndex));
    addToast('Profile records updated in persistent cloud-local store.', 'success');
  };

  const handleChangePassword = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentPassword || !newPassword) return;
    addToast('Hash algorithms updated. Secure token updated successfully.', 'success');
    setCurrentPassword('');
    setNewPassword('');
  };

  const triggerPaymentSimulation = () => {
    setPaymentStatus('generating');
    setTimeout(() => {
      setQrValue(`cyber_pay_qris_${Date.now()}_${selectedPlan === 'Premium' ? '29k' : '99k'}`);
      setPaymentStatus('pending');
      addToast('Secure digital payment dispatch requested.', 'info');
    }, 1500);
  };

  const simulatePaymentSuccess = () => {
    setPaymentStatus('success');
    setTimeout(() => {
      setSubscriptionRole(selectedPlan);
      setShowPaymentGate(false);
      setPaymentStatus('idle');
      addToast(`Payment Verified! Subscription upgraded to ${selectedPlan} Role.`, 'success');
    }, 1800);
  };

  const handleCreateApiKey = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newKeyName.trim()) return;
    const randomHex = Array.from({ length: 20 }, () => Math.floor(Math.random() * 16).toString(16)).join('');
    const newKey = {
      id: String(Date.now()),
      name: newKeyName,
      key: `up_live_ak_${randomHex}`,
      limit: newKeyLimit,
      used: 0,
      createdAt: new Date().toISOString().split('T')[0]
    };
    setApiKeys(prev => [newKey, ...prev]);
    setNewKeyName('');
    addToast('Secure endpoint API Token registered successfully.', 'success');
  };

  const handleCopyKey = (key: string) => {
    navigator.clipboard.writeText(key);
    addToast('Token copied to clipboard.', 'success');
  };

  const handleRevokeKey = (id: string) => {
    setApiKeys(prev => prev.filter(k => k.id !== id));
    addToast('API key signature completely revoked.', 'error');
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#020306]/90 backdrop-blur-xl animate-fade-in">
      <div className="relative w-full max-w-4xl bg-[#05070f] border border-slate-800/80 rounded-3xl shadow-2xl overflow-hidden flex flex-col md:flex-row h-[90vh] md:h-[650px]">
        {/* Colorful left side menu */}
        <div className="w-full md:w-60 bg-[#030409]/90 border-r border-slate-900/80 p-5 flex flex-col justify-between shrink-0">
          <div>
            <div className="flex items-center gap-2 mb-6">
              <div className={`p-1.5 rounded-lg bg-gradient-to-tr ${currClasses.gradient} text-black`}>
                <User className="w-4 h-4 text-black" />
              </div>
              <span className="text-xs font-bold font-mono tracking-wider text-white uppercase">User Control Panel</span>
            </div>

            {isLoggedIn ? (
              <div className="space-y-1.5">
                <button
                  onClick={() => setActiveTab('profile')}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left text-xs font-semibold font-mono uppercase tracking-wider transition-all cursor-pointer ${
                    activeTab === 'profile'
                      ? `${currClasses.bgMuted} border ${currClasses.border} ${currClasses.text}`
                      : 'text-slate-400 hover:text-slate-200 border border-transparent'
                  }`}
                >
                  <User className="w-4 h-4" />
                  Account Data
                </button>
                <button
                  onClick={() => setActiveTab('security')}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left text-xs font-semibold font-mono uppercase tracking-wider transition-all cursor-pointer ${
                    activeTab === 'security'
                      ? `${currClasses.bgMuted} border ${currClasses.border} ${currClasses.text}`
                      : 'text-slate-400 hover:text-slate-200 border border-transparent'
                  }`}
                >
                  <Lock className="w-4 h-4" />
                  Security Keys
                </button>
                <button
                  onClick={() => setActiveTab('premium')}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left text-xs font-semibold font-mono uppercase tracking-wider transition-all cursor-pointer ${
                    activeTab === 'premium'
                      ? `${currClasses.bgMuted} border ${currClasses.border} ${currClasses.text}`
                      : 'text-slate-400 hover:text-slate-200 border border-transparent'
                  }`}
                >
                  <Zap className="w-4 h-4" />
                  Premium Engine
                </button>
                <button
                  onClick={() => setActiveTab('api')}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left text-xs font-semibold font-mono uppercase tracking-wider transition-all cursor-pointer ${
                    activeTab === 'api'
                      ? `${currClasses.bgMuted} border ${currClasses.border} ${currClasses.text}`
                      : 'text-slate-400 hover:text-slate-200 border border-transparent'
                  }`}
                >
                  <Key className="w-4 h-4" />
                  API Access Keys
                </button>
              </div>
            ) : (
              <div className="text-center p-4 bg-slate-950/60 rounded-xl border border-slate-900">
                <Shield className="w-8 h-8 text-slate-600 mx-auto mb-2" />
                <p className="text-[10px] font-mono text-slate-500">Log in to unlock full-stack metrics, subscriptions, and custom API proxies.</p>
              </div>
            )}
          </div>

          {isLoggedIn && (
            <div className="pt-4 border-t border-slate-900/60 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <img
                  src={avatars[avatarIndex]}
                  alt="avatar"
                  className="w-8 h-8 rounded-full border border-slate-800 object-cover"
                />
                <div className="min-w-0 max-w-[100px]">
                  <h5 className="text-[10px] font-mono font-bold text-slate-200 truncate">{fullName}</h5>
                  <span className={`text-[8px] font-mono font-bold uppercase ${
                    subscriptionRole === 'VIP' ? 'text-purple-400' : subscriptionRole === 'Premium' ? 'text-amber-400' : 'text-slate-500'
                  }`}>
                    {subscriptionRole}
                  </span>
                </div>
              </div>
              <button
                onClick={handleLogout}
                className="p-2 rounded-lg bg-slate-900 hover:bg-rose-500/10 hover:text-rose-400 text-slate-400 cursor-pointer transition-all"
                title="Log Out Session"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>

        {/* Dynamic content screen */}
        <div className="flex-1 bg-gradient-to-b from-[#05070f] to-[#020306] p-6 overflow-y-auto relative flex flex-col justify-between">
          
          {/* Top Close Button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 rounded-xl bg-slate-950 border border-slate-900 hover:border-slate-800 text-slate-400 hover:text-white cursor-pointer transition-all z-10"
          >
            <X className="w-4 h-4" />
          </button>

          {!isLoggedIn ? (
            /* AUTHENTICATION PORTALS */
            <div className="my-auto max-w-sm mx-auto w-full space-y-5">
              <div className="text-center">
                <h3 className="text-base font-bold text-white font-mono uppercase tracking-wider">
                  {authMode === 'login' ? 'Authentication Core' : authMode === 'register' ? 'Register Platform User' : 'Forgot Password Restore'}
                </h3>
                <p className="text-xs text-slate-400 mt-1">
                  Authenticate using high-security microservices.
                </p>
              </div>

              <form onSubmit={handleAuthSubmit} className="space-y-3.5">
                {authMode === 'register' && (
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[9px] text-slate-500 font-mono uppercase tracking-widest font-bold">Full Identity Title</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Maverick Neon"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      className="w-full bg-slate-900/80 border border-slate-800 rounded-xl px-4 py-3 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-cyan-500/40 font-mono"
                    />
                  </div>
                )}

                <div className="flex flex-col gap-1.5">
                  <label className="text-[9px] text-slate-500 font-mono uppercase tracking-widest font-bold">Secure Mail Envelope</label>
                  <div className="relative flex items-center">
                    <Mail className="absolute left-3 w-4 h-4 text-slate-600" />
                    <input
                      type="email"
                      required
                      placeholder="e.g. agent@cyber.net"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full bg-slate-900/80 border border-slate-800 rounded-xl pl-10 pr-4 py-3 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-cyan-500/40 font-mono"
                    />
                  </div>
                </div>

                {authMode !== 'forgot' && (
                  <div className="flex flex-col gap-1.5">
                    <div className="flex justify-between items-center">
                      <label className="text-[9px] text-slate-500 font-mono uppercase tracking-widest font-bold">Passphrase Password Key</label>
                      {authMode === 'login' && (
                        <button
                          type="button"
                          onClick={() => setAuthMode('forgot')}
                          className="text-[9px] font-mono text-cyan-400 hover:text-cyan-200 uppercase font-bold"
                        >
                          Forgot Key?
                        </button>
                      )}
                    </div>
                    <div className="relative flex items-center">
                      <Lock className="absolute left-3 w-4 h-4 text-slate-600" />
                      <input
                        type="password"
                        required
                        placeholder="••••••••••••"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="w-full bg-slate-900/80 border border-slate-800 rounded-xl pl-10 pr-4 py-3 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-cyan-500/40 font-mono"
                      />
                    </div>
                  </div>
                )}

                <button
                  type="submit"
                  className={`w-full py-3 rounded-xl bg-gradient-to-r ${currClasses.gradient} text-black font-bold uppercase tracking-wider text-xs transition-all hover:scale-[1.02] active:scale-[0.98] cursor-pointer`}
                >
                  {authMode === 'login' ? 'Validate Credentials' : authMode === 'register' ? 'Deploy Account' : 'Request Token Reset'}
                </button>
              </form>

              {/* Secure federated OAuth row */}
              {authMode !== 'forgot' && (
                <div className="space-y-3 pt-3 border-t border-slate-900">
                  <p className="text-[9px] text-center font-mono text-slate-500 uppercase font-bold tracking-widest">Federated OAuth Core</p>
                  <div className="grid grid-cols-3 gap-2">
                    <button
                      type="button"
                      onClick={() => handleOAuthLogin('Google')}
                      className="flex items-center justify-center gap-1.5 py-2.5 rounded-xl bg-slate-900/70 border border-slate-800 hover:border-slate-700 text-[10px] font-mono font-bold text-slate-300 transition-all cursor-pointer"
                    >
                      <Chrome className="w-3.5 h-3.5" />
                      Google
                    </button>
                    <button
                      type="button"
                      onClick={() => handleOAuthLogin('GitHub')}
                      className="flex items-center justify-center gap-1.5 py-2.5 rounded-xl bg-slate-900/70 border border-slate-800 hover:border-slate-700 text-[10px] font-mono font-bold text-slate-300 transition-all cursor-pointer"
                    >
                      <Github className="w-3.5 h-3.5" />
                      GitHub
                    </button>
                    <button
                      type="button"
                      onClick={() => handleOAuthLogin('Discord')}
                      className="flex items-center justify-center gap-1.5 py-2.5 rounded-xl bg-slate-900/70 border border-slate-800 hover:border-slate-700 text-[10px] font-mono font-bold text-slate-300 transition-all cursor-pointer"
                    >
                      <Globe className="w-3.5 h-3.5 text-blue-400" />
                      Discord
                    </button>
                  </div>
                </div>
              )}

              <div className="text-center">
                {authMode === 'login' ? (
                  <button
                    onClick={() => setAuthMode('register')}
                    className="text-[10px] font-mono text-slate-400 hover:text-white uppercase font-bold"
                  >
                    Don't have an authentication node? <span className={currClasses.text}>Register Now</span>
                  </button>
                ) : (
                  <button
                    onClick={() => setAuthMode('login')}
                    className="text-[10px] font-mono text-slate-400 hover:text-white uppercase font-bold"
                  >
                    Already possess certificates? <span className={currClasses.text}>Log In</span>
                  </button>
                )}
              </div>
            </div>
          ) : (
            /* AUTHENTICATED ACTIVE DASHBOARDS */
            <div className="flex-1 flex flex-col">
              {activeTab === 'profile' && (
                <div className="space-y-6 animate-fade-in">
                  <div>
                    <h3 className="text-sm font-bold text-white font-mono uppercase tracking-wider flex items-center gap-2">
                      <User className={`w-4 h-4 ${currClasses.text}`} />
                      Account Identity Matrix
                    </h3>
                    <p className="text-xs text-slate-400 mt-0.5">Customize your cloud persona parameters and system telemetry views.</p>
                  </div>

                  <form onSubmit={handleProfileUpdate} className="space-y-5">
                    {/* Avatar selection */}
                    <div className="space-y-2.5 p-4 bg-[#030409]/80 border border-slate-900 rounded-2xl">
                      <span className="text-[10px] text-slate-400 font-mono uppercase font-bold block">Select Custom Persona Skin</span>
                      <div className="flex gap-4">
                        {avatars.map((url, idx) => {
                          const isSelected = avatarIndex === idx;
                          return (
                            <button
                              key={idx}
                              type="button"
                              onClick={() => setAvatarIndex(idx)}
                              className={`relative w-14 h-14 rounded-2xl overflow-hidden border transition-all hover:scale-105 active:scale-95 cursor-pointer ${
                                isSelected ? `border-cyan-500 scale-105 ring-2 ring-cyan-500/20` : 'border-slate-800 opacity-60'
                              }`}
                            >
                              <img src={url} alt={`avatar-${idx}`} className="w-full h-full object-cover" />
                              {isSelected && (
                                <div className="absolute inset-0 bg-cyan-500/20 flex items-center justify-center">
                                  <CheckCircle2 className="w-4 h-4 text-[#00ffcc]" />
                                </div>
                              )}
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="flex flex-col gap-1.5">
                        <label className="text-[9px] text-slate-500 font-mono uppercase tracking-widest font-bold">Display Title Name</label>
                        <input
                          type="text"
                          required
                          value={fullName}
                          onChange={(e) => setFullName(e.target.value)}
                          className="w-full bg-slate-900/80 border border-slate-850 focus:border-cyan-500/40 focus:outline-none rounded-xl px-4 py-3 text-xs text-white font-mono"
                        />
                      </div>
                      <div className="flex flex-col gap-1.5">
                        <label className="text-[9px] text-slate-500 font-mono uppercase tracking-widest font-bold">System Level Rank</label>
                        <div className="w-full bg-slate-950/80 border border-slate-900 rounded-xl px-4 py-3 text-xs text-slate-400 font-mono flex items-center justify-between">
                          <span className="font-bold uppercase tracking-wider text-slate-200">{subscriptionRole} User</span>
                          <span className={`text-[9px] uppercase font-bold px-2 py-0.5 rounded-full ${
                            subscriptionRole === 'VIP' ? 'bg-purple-500/10 text-purple-400 border border-purple-500/20' :
                            subscriptionRole === 'Premium' ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20' :
                            'bg-slate-900 text-slate-500'
                          }`}>
                            ACTIVE NODE
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="p-4 bg-slate-950/40 border border-slate-900 rounded-2xl space-y-3">
                      <span className="text-[10px] text-slate-400 font-mono uppercase font-bold block">Telemetry Allocation</span>
                      <div className="grid grid-cols-2 gap-4 text-center">
                        <div className="p-3 bg-slate-950 border border-slate-900 rounded-xl">
                          <span className="text-[9px] font-mono text-slate-500 uppercase block">Daily Download Quota</span>
                          <span className="text-sm font-bold font-mono text-emerald-400 mt-1 block">
                            {subscriptionRole === 'VIP' ? '∞' : `${downloadLimitToday} Streams Left`}
                          </span>
                        </div>
                        <div className="p-3 bg-slate-950 border border-slate-900 rounded-xl">
                          <span className="text-[9px] font-mono text-slate-500 uppercase block">Cumulative Data Extracted</span>
                          <span className="text-sm font-bold font-mono text-[#00d2ff] mt-1 block">244.5 GB</span>
                        </div>
                      </div>
                    </div>

                    <button
                      type="submit"
                      className={`px-6 py-3 rounded-xl bg-gradient-to-r ${currClasses.gradient} text-black font-bold uppercase tracking-wider text-xs hover:scale-102 transition-all cursor-pointer`}
                    >
                      Commit Profile Changes
                    </button>
                  </form>
                </div>
              )}

              {activeTab === 'security' && (
                <div className="space-y-6 animate-fade-in">
                  <div>
                    <h3 className="text-sm font-bold text-white font-mono uppercase tracking-wider flex items-center gap-2">
                      <Lock className={`w-4 h-4 ${currClasses.text}`} />
                      Authentication Security Passkeys
                    </h3>
                    <p className="text-xs text-slate-400 mt-0.5">Protect and rotate core session access signature protocols.</p>
                  </div>

                  <form onSubmit={handleChangePassword} className="space-y-4">
                    <div className="flex flex-col gap-1.5">
                      <label className="text-[9px] text-slate-500 font-mono uppercase tracking-widest font-bold">Existing Secret Key</label>
                      <input
                        type="password"
                        required
                        placeholder="••••••••••••"
                        value={currentPassword}
                        onChange={(e) => setCurrentPassword(e.target.value)}
                        className="w-full bg-slate-900/80 border border-slate-850 focus:border-cyan-500/40 focus:outline-none rounded-xl px-4 py-3 text-xs text-white font-mono"
                      />
                    </div>
                    <div className="flex flex-col gap-1.5">
                      <label className="text-[9px] text-slate-500 font-mono uppercase tracking-widest font-bold">Rotated Target Secret Key</label>
                      <input
                        type="password"
                        required
                        placeholder="••••••••••••"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        className="w-full bg-slate-900/80 border border-slate-850 focus:border-cyan-500/40 focus:outline-none rounded-xl px-4 py-3 text-xs text-white font-mono"
                      />
                    </div>

                    <button
                      type="submit"
                      className={`px-6 py-3 rounded-xl bg-gradient-to-r ${currClasses.gradient} text-black font-bold uppercase tracking-wider text-xs hover:scale-102 transition-all cursor-pointer`}
                    >
                      Rotate Passphrase Signature
                    </button>
                  </form>
                </div>
              )}

              {activeTab === 'premium' && (
                <div className="space-y-5 animate-fade-in flex-1 flex flex-col justify-between">
                  {!showPaymentGate ? (
                    <div className="space-y-5">
                      <div>
                        <h3 className="text-sm font-bold text-white font-mono uppercase tracking-wider flex items-center gap-2">
                          <Zap className={`w-4 h-4 ${currClasses.text}`} />
                          Premium Cloud Nodes Upgrade
                        </h3>
                        <p className="text-xs text-slate-400 mt-0.5">Bypass platform limits completely via designated server-level networks.</p>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {/* Premium Card */}
                        <div className="bg-[#030409]/60 border border-slate-850 p-5 rounded-2xl relative overflow-hidden flex flex-col justify-between h-[230px]">
                          <div className="absolute top-3 right-3 text-[9px] font-mono text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20 font-bold uppercase">HOT NODE</div>
                          <div>
                            <h4 className="text-xs font-bold text-white font-mono uppercase tracking-wide">PREMIUM DEPLOY</h4>
                            <span className="text-lg font-bold font-mono text-[#00ffcc] mt-1.5 block">Rp 29.000 <span className="text-[10px] text-slate-500">/ mo</span></span>
                            <ul className="text-[9px] text-slate-400 font-mono space-y-1.5 mt-3 list-disc pl-4">
                              <li>50 Premium Pipeline link bypass daily</li>
                              <li>720p / 1080p proxy stream download</li>
                              <li>Dedicated user dashboard stats access</li>
                              <li>Create up to 3 REST API Keys</li>
                            </ul>
                          </div>
                          <button
                            onClick={() => {
                              setSelectedPlan('Premium');
                              setShowPaymentGate(true);
                            }}
                            className="w-full py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-black font-bold text-[10px] uppercase font-mono tracking-wider transition-all cursor-pointer"
                          >
                            Upgrade to Premium
                          </button>
                        </div>

                        {/* VIP Card */}
                        <div className="bg-[#0c0516]/60 border border-purple-500/20 p-5 rounded-2xl relative overflow-hidden flex flex-col justify-between h-[230px]">
                          <div className="absolute top-3 right-3 text-[9px] font-mono text-purple-400 bg-purple-500/10 px-2 py-0.5 rounded border border-purple-500/20 font-bold uppercase">GOD NODE</div>
                          <div>
                            <h4 className="text-xs font-bold text-white font-mono uppercase tracking-wide">VIP SUPREME</h4>
                            <span className="text-lg font-bold font-mono text-purple-400 mt-1.5 block">Rp 99.000 <span className="text-[10px] text-slate-500">/ mo</span></span>
                            <ul className="text-[9px] text-slate-400 font-mono space-y-1.5 mt-3 list-disc pl-4">
                              <li>Unlimited streaming & download bypass</li>
                              <li>Max 4K Quality pipeline proxies enabled</li>
                              <li>Parallel multi-threading file conversion</li>
                              <li>Unlimited REST API token keys</li>
                            </ul>
                          </div>
                          <button
                            onClick={() => {
                              setSelectedPlan('VIP');
                              setShowPaymentGate(true);
                            }}
                            className="w-full py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-[10px] uppercase font-mono tracking-wider transition-all cursor-pointer"
                          >
                            Upgrade to VIP
                          </button>
                        </div>
                      </div>
                    </div>
                  ) : (
                    /* PAYMENT PORTAL OVERLAY */
                    <div className="space-y-4 py-2 animate-fade-in flex-1 flex flex-col justify-between">
                      <div className="flex items-center justify-between border-b border-slate-900 pb-3">
                        <div className="flex items-center gap-2">
                          <CreditCard className="w-4 h-4 text-[#00ffcc]" />
                          <h4 className="text-xs font-bold text-white font-mono uppercase">Secure Checkout Proxy Gateway</h4>
                        </div>
                        <button
                          onClick={() => {
                            setShowPaymentGate(false);
                            setPaymentStatus('idle');
                          }}
                          className="text-[10px] font-mono text-slate-500 hover:text-white uppercase font-bold"
                        >
                          Cancel
                        </button>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {/* Selected payment options */}
                        <div className="space-y-2.5">
                          <span className="text-[9px] text-slate-400 font-mono uppercase font-bold block">1. Select Checkout Channel</span>
                          <div className="grid grid-cols-2 gap-2">
                            {(['QRIS', 'DANA', 'GoPay', 'OVO', 'Bank'] as const).map((method) => (
                              <button
                                key={method}
                                type="button"
                                onClick={() => setSelectedPaymentMethod(method)}
                                className={`py-2 rounded-xl text-[10px] font-mono font-bold uppercase tracking-wider border transition-all cursor-pointer text-center ${
                                  selectedPaymentMethod === method
                                    ? 'bg-[#0a142c] border-cyan-500/50 text-[#00d2ff]'
                                    : 'bg-slate-950/60 border-slate-850 text-slate-400 hover:text-white'
                                }`}
                              >
                                {method} {method === 'QRIS' && '⚡'}
                              </button>
                            ))}
                          </div>

                          <div className="p-3 bg-slate-950 border border-slate-900 rounded-xl space-y-1.5">
                            <div className="flex justify-between text-[9px] font-mono text-slate-500 uppercase">
                              <span>Selected Tier:</span>
                              <span className="text-slate-300 font-bold">{selectedPlan}</span>
                            </div>
                            <div className="flex justify-between text-[11px] font-mono text-slate-400 uppercase font-bold">
                              <span>Total Amount:</span>
                              <span className="text-emerald-400">
                                {selectedPlan === 'Premium' ? 'Rp 29.000' : 'Rp 99.000'}
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* Interactive Dynamic QR Code/Action Panel */}
                        <div className="bg-[#030408]/90 border border-slate-850 p-4 rounded-2xl flex flex-col items-center justify-center min-h-[180px] text-center relative">
                          <AnimatePresence mode="wait">
                            {paymentStatus === 'idle' && (
                              <motion.div
                                key="idle"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                className="space-y-3"
                              >
                                <p className="text-[10px] font-mono text-slate-400">Invoice ready. Dispatch cryptographic QR/e-wallet token to scan.</p>
                                <button
                                  onClick={triggerPaymentSimulation}
                                  className="px-5 py-2 rounded-xl bg-gradient-to-r from-emerald-500 to-cyan-500 text-black font-bold uppercase tracking-wider text-[10px] font-mono cursor-pointer hover:scale-105 transition-all"
                                >
                                  Generate Payment
                                </button>
                              </motion.div>
                            )}

                            {paymentStatus === 'generating' && (
                              <motion.div
                                key="generating"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                className="flex flex-col items-center gap-2"
                              >
                                <Loader2 className="w-8 h-8 text-cyan-400 animate-spin" />
                                <span className="text-[10px] font-mono text-slate-400 animate-pulse">Requesting Invoice Hash...</span>
                              </motion.div>
                            )}

                            {paymentStatus === 'pending' && (
                              <motion.div
                                key="pending"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                className="flex flex-col items-center gap-2"
                              >
                                <QrCode className="w-24 h-24 text-white animate-pulse" />
                                <span className="text-[9px] font-mono text-yellow-400 bg-yellow-400/10 border border-yellow-400/20 px-2 py-0.5 rounded uppercase font-bold">
                                  Awaiting payment scan via {selectedPaymentMethod}
                                </span>
                                <button
                                  onClick={simulatePaymentSuccess}
                                  className="mt-2 text-[9px] font-mono text-emerald-400 hover:text-emerald-200 border border-emerald-500/20 px-3 py-1 rounded-lg bg-emerald-500/5 hover:bg-emerald-500/10 cursor-pointer transition-all uppercase font-bold"
                                >
                                  [Simulate Scan Success]
                                </button>
                              </motion.div>
                            )}

                            {paymentStatus === 'success' && (
                              <motion.div
                                key="success"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                className="flex flex-col items-center gap-2"
                              >
                                <CheckCircle2 className="w-12 h-12 text-emerald-400 animate-bounce" />
                                <span className="text-xs font-bold font-mono text-emerald-400 uppercase">Payment Captured</span>
                                <p className="text-[9px] font-mono text-slate-500">Upgrading server credentials now...</p>
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {activeTab === 'api' && (
                <div className="space-y-4 animate-fade-in flex-1 flex flex-col justify-between">
                  <div>
                    <h3 className="text-sm font-bold text-white font-mono uppercase tracking-wider flex items-center gap-2">
                      <Key className={`w-4 h-4 ${currClasses.text}`} />
                      REST Pipeline API Authorization Tokens
                    </h3>
                    <p className="text-xs text-slate-400 mt-0.5">Automate and proxy stream extraction requests using custom API keys.</p>
                  </div>

                  {/* API Key list */}
                  <div className="space-y-2 max-h-56 overflow-y-auto pr-1 no-scrollbar">
                    {apiKeys.map((item) => (
                      <div key={item.id} className="p-3 bg-slate-950 border border-slate-900 rounded-xl flex items-center justify-between gap-3 hover:border-slate-800 transition-all">
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-1.5 mb-1.5">
                            <span className="text-[10px] font-bold font-mono text-white truncate">{item.name}</span>
                            <span className="text-[8px] font-mono text-slate-500 bg-slate-900 border border-slate-850 px-1.5 py-0.5 rounded">
                              Limit: {item.used} / {item.limit} req
                            </span>
                          </div>
                          <div className="flex items-center gap-1">
                            <span className="text-[9px] font-mono text-slate-400 truncate tracking-wide">{item.key}</span>
                            <button
                              onClick={() => handleCopyKey(item.key)}
                              className="p-1 rounded text-slate-500 hover:text-white transition-colors cursor-pointer"
                              title="Copy token key"
                            >
                              <Copy className="w-3 h-3" />
                            </button>
                          </div>
                        </div>

                        <button
                          onClick={() => handleRevokeKey(item.id)}
                          className="p-2 rounded-lg bg-slate-900 hover:bg-rose-500/10 hover:text-rose-400 text-slate-500 cursor-pointer transition-colors shrink-0"
                          title="Revoke Token"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>

                  {/* Form to generate new API Key */}
                  <form onSubmit={handleCreateApiKey} className="p-3 bg-[#030409]/80 border border-slate-900 rounded-2xl grid grid-cols-1 sm:grid-cols-2 gap-3 items-end">
                    <div className="flex flex-col gap-1">
                      <label className="text-[9px] text-slate-500 font-mono uppercase font-bold">API Token Name</label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. Flutter Stream App"
                        value={newKeyName}
                        onChange={(e) => setNewKeyName(e.target.value)}
                        className="bg-slate-900 border border-slate-850 rounded-lg px-3 py-2 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-cyan-500/40 font-mono"
                      />
                    </div>
                    <div className="flex flex-col gap-1">
                      <label className="text-[9px] text-slate-500 font-mono uppercase font-bold">Rate Limit Target</label>
                      <select
                        value={newKeyLimit}
                        onChange={(e) => setNewKeyLimit(Number(e.target.value))}
                        className="bg-slate-900 border border-slate-850 rounded-lg px-3 py-2 text-xs text-slate-300 font-mono focus:outline-none focus:border-cyan-500/40"
                      >
                        <option value={500}>500 requests / min</option>
                        <option value={1000}>1,000 requests / min</option>
                        <option value={5000}>5,000 requests / min</option>
                      </select>
                    </div>
                    <button
                      type="submit"
                      className="col-span-1 sm:col-span-2 py-2 rounded-xl bg-cyan-500 hover:bg-[#00ffcc] text-black font-bold text-[10px] uppercase font-mono tracking-wider transition-all cursor-pointer"
                    >
                      Establish API Token
                    </button>
                  </form>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
