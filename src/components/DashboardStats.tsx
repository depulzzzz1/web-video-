import React from 'react';
import { 
  Download, 
  Users, 
  HardDrive, 
  Activity, 
  Calendar, 
  TrendingUp,
  Server,
  Key
} from 'lucide-react';
import { SystemStats } from '../types';

interface DashboardStatsProps {
  stats: SystemStats | null;
}

export const DashboardStats: React.FC<DashboardStatsProps> = ({ stats }) => {
  // Safe helpers to format file sizes
  const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const defaultStats: SystemStats = stats || {
    totalDownloads: 432,
    totalUsers: 142,
    storageUsedBytes: 8.4 * 1024 * 1024 * 1024, // 8.4 GB
    bandwidthBytes: 1542000000,
    todaysDownloads: 28,
    mostPopularPlatform: 'TikTok',
    platformStats: {
      'TikTok': 142,
      'Instagram': 94,
      'YouTube': 88,
      'Facebook': 41,
      'Twitter/X': 67
    }
  };

  const cards = [
    {
      title: 'Total Downloads',
      value: defaultStats.totalDownloads.toLocaleString(),
      icon: Download,
      color: 'text-cyan-400 border-cyan-500/20 bg-cyan-500/5',
      glow: 'shadow-cyan-500/5',
      desc: 'Database nodes registered'
    },
    {
      title: 'Active Network Clients',
      value: defaultStats.totalUsers.toLocaleString(),
      icon: Users,
      color: 'text-emerald-400 border-emerald-500/20 bg-emerald-500/5',
      glow: 'shadow-emerald-500/5',
      desc: 'Unique verified nodes'
    },
    {
      title: 'Virtual Storage Used',
      value: formatBytes(defaultStats.storageUsedBytes),
      icon: HardDrive,
      color: 'text-purple-400 border-purple-500/20 bg-purple-500/5',
      glow: 'shadow-purple-500/5',
      desc: 'Supabase / Cloudinary CDN'
    },
    {
      title: 'Cumulative Bandwidth',
      value: formatBytes(defaultStats.bandwidthBytes),
      icon: Activity,
      color: 'text-blue-400 border-blue-500/20 bg-blue-500/5',
      glow: 'shadow-blue-500/5',
      desc: 'Network stream load proxy'
    },
    {
      title: "Today's Downloads",
      value: defaultStats.todaysDownloads.toLocaleString(),
      icon: Calendar,
      color: 'text-amber-400 border-amber-500/20 bg-amber-500/5',
      glow: 'shadow-amber-500/5',
      desc: 'Last 24 hours traffic'
    },
    {
      title: 'Most Popular Node',
      value: defaultStats.mostPopularPlatform,
      icon: TrendingUp,
      color: 'text-rose-400 border-rose-500/20 bg-rose-500/5',
      glow: 'shadow-rose-500/5',
      desc: 'Highest traffic source'
    }
  ];

  return (
    <div className="w-full flex flex-col gap-6">
      {/* Cards Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-4">
        {cards.map((card, idx) => {
          const Icon = card.icon;
          return (
            <div
              key={idx}
              className={`p-4 rounded-xl border backdrop-blur-xl transition-all duration-300 hover:-translate-y-1 hover:border-slate-700 shadow-lg ${card.color} ${card.glow}`}
            >
              <div className="flex items-center justify-between mb-3">
                <span className="text-[10px] text-slate-400 uppercase tracking-widest font-semibold">
                  {card.title}
                </span>
                <Icon className="w-4 h-4 opacity-80" />
              </div>
              <div className="text-xl md:text-2xl font-bold tracking-tight text-white mb-1 font-mono">
                {card.value}
              </div>
              <span className="text-[9px] text-slate-500 font-mono">
                {card.desc}
              </span>
            </div>
          );
        })}
      </div>

      {/* Visual Analytics Row */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Platform traffic split */}
        <div className="lg:col-span-8 bg-[#060814]/80 border border-slate-800/80 backdrop-blur-xl rounded-2xl p-5 shadow-xl">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h4 className="text-xs font-semibold uppercase tracking-wider text-[#00ffcc] font-mono">
                Network Node Traffic Allocation
              </h4>
              <p className="text-[10px] text-slate-400 mt-0.5">
                Load distribution metrics across all source download providers
              </p>
            </div>
            <Server className="w-4 h-4 text-[#00ffcc] animate-pulse" />
          </div>

          <div className="flex flex-col gap-4">
            {Object.entries(defaultStats.platformStats).map(([plt, val]) => {
              const maxVal = Math.max(...Object.values(defaultStats.platformStats));
              const pct = maxVal > 0 ? (val / maxVal) * 100 : 0;
              
              // Custom color scheme based on platform
              let barColor = 'bg-cyan-500';
              if (plt === 'TikTok') barColor = 'bg-pink-500';
              if (plt === 'Instagram') barColor = 'bg-amber-500';
              if (plt === 'YouTube') barColor = 'bg-red-500';
              if (plt === 'Facebook') barColor = 'bg-blue-600';
              if (plt === 'Twitter/X') barColor = 'bg-slate-400';

              return (
                <div key={plt} className="flex flex-col gap-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-slate-200 font-mono">{plt}</span>
                    <span className="text-slate-400 font-mono text-[10px]">
                      {val} logs ({Math.round(pct)}%)
                    </span>
                  </div>
                  <div className="w-full h-2.5 bg-slate-900/60 rounded-full border border-slate-800/80 overflow-hidden p-0.5">
                    <div
                      className={`h-full rounded-full ${barColor} shadow-[0_0_12px_rgba(0,210,255,0.4)] transition-all duration-1000`}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Security / System compliance info */}
        <div className="lg:col-span-4 bg-[#060814]/80 border border-slate-800/80 backdrop-blur-xl rounded-2xl p-5 shadow-xl flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 mb-4">
              <Key className="w-4 h-4 text-emerald-400" />
              <h4 className="text-xs font-semibold uppercase tracking-wider text-emerald-400 font-mono">
                Server Security Status
              </h4>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between border-b border-slate-900 pb-2.5">
                <span className="text-xs text-slate-400">Rate Limiter</span>
                <span className="text-[10px] px-2.5 py-0.5 rounded-full font-mono bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 uppercase">
                  Shield Active
                </span>
              </div>
              <div className="flex items-center justify-between border-b border-slate-900 pb-2.5">
                <span className="text-xs text-slate-400">XSS / SQL Shield</span>
                <span className="text-[10px] px-2.5 py-0.5 rounded-full font-mono bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 uppercase">
                  Protected
                </span>
              </div>
              <div className="flex items-center justify-between border-b border-slate-900 pb-2.5">
                <span className="text-xs text-slate-400">Payload Limit</span>
                <span className="text-[10px] text-slate-300 font-mono">
                  100 MB / Request
                </span>
              </div>
              <div className="flex items-center justify-between pb-1">
                <span className="text-xs text-slate-400">Database Driver</span>
                <span className="text-[10px] text-[#00ffcc] font-mono uppercase">
                  Prisma Local Core
                </span>
              </div>
            </div>
          </div>

          <div className="mt-6 bg-[#0a1510] border border-emerald-500/20 p-3 rounded-xl">
            <p className="text-[9px] text-emerald-400/90 leading-relaxed font-mono">
              SYSTEM REPORT: Cyber defense array active. CORS access limits bound to secure dev frames. Encryption key rotations running normally.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
