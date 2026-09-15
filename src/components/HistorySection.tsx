import React, { useState } from 'react';
import { 
  Search, 
  Trash2, 
  Download, 
  Copy, 
  Share2, 
  Eye, 
  Edit3, 
  Filter, 
  Calendar,
  Layers,
  ChevronDown,
  Info,
  Sliders,
  Sparkles
} from 'lucide-react';
import { DownloadItem } from '../types';

interface HistorySectionProps {
  history: DownloadItem[];
  onDelete: (id: string) => void;
  onRename: (id: string, newTitle: string) => void;
  onPreviewClick: (item: DownloadItem) => void;
  onConvertClick: (item: DownloadItem) => void;
  addToast: (text: string, type: 'success' | 'error' | 'info') => void;
}

export const HistorySection: React.FC<HistorySectionProps> = ({
  history,
  onDelete,
  onRename,
  onPreviewClick,
  onConvertClick,
  addToast
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [platformFilter, setPlatformFilter] = useState('All');
  const [renamingId, setRenamingId] = useState<string | null>(null);
  const [renameInput, setRenameInput] = useState('');

  // Extract unique platforms dynamically
  const availablePlatforms = ['All', ...Array.from(new Set(history.map(item => item.platform)))];

  // Filtering records locally
  const filteredHistory = history.filter(item => {
    const matchesSearch = item.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          item.platform.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesPlatform = platformFilter === 'All' || item.platform === platformFilter;
    return matchesSearch && matchesPlatform;
  });

  const handleCopyLink = (url: string) => {
    navigator.clipboard.writeText(url);
    addToast('Media source link copied to clipboard!', 'success');
  };

  const handleShare = (item: DownloadItem) => {
    if (navigator.share) {
      navigator.share({
        title: item.title,
        url: item.downloadUrl
      }).catch(() => {});
    } else {
      handleCopyLink(item.downloadUrl);
    }
  };

  const handleDownloadToDisk = (item: DownloadItem) => {
    addToast('Contacting full-stack proxy stream...', 'info');
    const proxyUrl = `/api/proxy-download?url=${encodeURIComponent(item.downloadUrl)}&title=${encodeURIComponent(item.title)}`;
    const anchor = document.createElement('a');
    anchor.href = proxyUrl;
    anchor.setAttribute('download', `${item.title.replace(/\s+/g, '_')}.mp4`);
    document.body.appendChild(anchor);
    anchor.click();
    document.body.removeChild(anchor);
    addToast('File binary stream dispatched directly to your device disk!', 'success');
  };

  const startRename = (item: DownloadItem) => {
    setRenamingId(item.id);
    setRenameInput(item.title);
  };

  const saveRename = (id: string) => {
    if (renameInput.trim()) {
      onRename(id, renameInput.trim());
      setRenamingId(null);
      addToast('Media record renamed successfully.', 'success');
    }
  };

  return (
    <div className="w-full flex flex-col gap-5">
      {/* Filters Header toolbar */}
      <div className="flex flex-col md:flex-row gap-4 items-center justify-between bg-[#060814]/60 border border-slate-800/80 p-4 rounded-2xl backdrop-blur-xl">
        {/* Search input bar */}
        <div className="relative w-full md:max-w-xs shrink-0">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
          <input
            type="text"
            placeholder="Search titles or platforms..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-900/80 border border-slate-800 focus:border-cyan-500/50 focus:outline-none text-xs text-slate-300 placeholder-slate-500 font-mono"
          />
        </div>

        {/* Platform dynamic pill selector */}
        <div className="flex items-center gap-2 overflow-x-auto w-full no-scrollbar justify-end py-1">
          <Filter className="w-3.5 h-3.5 text-slate-400 shrink-0 hidden sm:block" />
          <div className="flex gap-1.5 shrink-0">
            {availablePlatforms.map((plt) => {
              const isActive = platformFilter === plt;
              return (
                <button
                  key={plt}
                  onClick={() => setPlatformFilter(plt)}
                  className={`text-[10px] font-mono font-semibold px-3 py-1.5 rounded-lg border transition-all uppercase cursor-pointer ${
                    isActive
                      ? 'bg-cyan-500/10 border-cyan-500 text-[#00d2ff] shadow-[0_0_8px_rgba(0,210,255,0.15)]'
                      : 'bg-[#0a0d1e]/50 border-slate-800 text-slate-400 hover:text-white hover:border-slate-700'
                  }`}
                >
                  {plt}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* History Grid content */}
      {filteredHistory.length === 0 ? (
        <div className="w-full text-center py-16 bg-[#060814]/30 border border-slate-800/40 rounded-2xl">
          <Layers className="w-10 h-10 text-slate-600 mx-auto mb-3" />
          <h4 className="text-sm font-semibold text-slate-400">
            No pipeline records detected
          </h4>
          <p className="text-xs text-slate-500 mt-1">
            Dispatch a media pipeline link above to generate active database logs.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredHistory.map((item) => {
            const isRenaming = renamingId === item.id;
            const dateStr = new Date(item.createdAt).toLocaleDateString();
            const timeStr = new Date(item.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

            return (
              <div
                key={item.id}
                className="group relative flex flex-col justify-between bg-gradient-to-b from-[#0a0e23]/50 to-[#040611]/80 border border-slate-800/80 rounded-2xl p-4 hover:border-cyan-500/30 shadow-lg hover:shadow-cyan-500/5 transition-all duration-300"
              >
                {/* Horizontal Neon Top-border glow on hover */}
                <div className="absolute top-0 inset-x-0 h-[1.5px] bg-cyan-500/40 opacity-0 group-hover:opacity-100 transition-opacity" />

                <div className="flex gap-4 items-start">
                  {/* Thumbnail */}
                  <div className="relative w-16 h-16 sm:w-20 sm:h-20 rounded-xl overflow-hidden shrink-0 border border-slate-800 bg-black">
                    <img
                      src={item.thumbnailUrl}
                      alt={item.title}
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <span className="absolute bottom-1 right-1 bg-black/80 text-[8px] px-1.5 py-0.5 rounded font-mono text-[#00ffcc]">
                      {item.quality}
                    </span>
                  </div>

                  {/* Body Info */}
                  <div className="flex-1 overflow-hidden">
                    {/* Upper row: Platform & Date */}
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-[9px] font-semibold text-[#00d2ff] uppercase font-mono bg-cyan-500/5 border border-cyan-500/10 px-2 py-0.5 rounded">
                        {item.platform}
                      </span>
                      <span className="text-[9px] text-slate-500 font-mono">
                        {dateStr} {timeStr}
                      </span>
                    </div>

                    {/* Title Rename / Text */}
                    {isRenaming ? (
                      <div className="flex items-center gap-1.5 mt-1.5">
                        <input
                          type="text"
                          value={renameInput}
                          onChange={(e) => setRenameInput(e.target.value)}
                          className="flex-1 bg-slate-900 border border-slate-700 px-2.5 py-1 text-xs text-white rounded-lg focus:outline-none focus:border-cyan-400"
                        />
                        <button
                          onClick={() => saveRename(item.id)}
                          className="px-2.5 py-1 text-[10px] bg-cyan-500 text-black font-bold rounded-lg hover:scale-105 active:scale-95 transition-all"
                        >
                          Save
                        </button>
                      </div>
                    ) : (
                      <h4 className="text-xs font-semibold text-slate-200 line-clamp-2 leading-relaxed group-hover:text-white transition-colors">
                        {item.title}
                      </h4>
                    )}

                    {/* Lower Info: File Size & Speed */}
                    <div className="flex items-center gap-3.5 mt-2.5 text-[9px] font-mono text-slate-500">
                      <span>Size: <strong className="text-emerald-400">{item.size}</strong></span>
                      {item.duration && <span>Length: <strong className="text-slate-400">{item.duration}</strong></span>}
                    </div>
                  </div>
                </div>

                {/* Lower controls row */}
                <div className="flex items-center justify-between border-t border-slate-900 mt-4 pt-3">
                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => onPreviewClick(item)}
                      className="flex items-center gap-1 text-[10px] px-2.5 py-1.5 rounded-lg bg-slate-900 text-slate-300 border border-slate-800 hover:text-white hover:border-slate-700 transition-all cursor-pointer"
                    >
                      <Eye className="w-3 h-3 text-cyan-400" />
                      Preview
                    </button>

                    <button
                      onClick={() => onConvertClick(item)}
                      className="flex items-center gap-1 text-[10px] px-2.5 py-1.5 rounded-lg bg-slate-900 text-slate-300 border border-slate-800 hover:text-white hover:border-slate-700 transition-all cursor-pointer"
                      title="Convert & Compress Media"
                    >
                      <Sliders className="w-3 h-3 text-purple-400" />
                      Convert & Compress
                    </button>
                    
                    <button
                      onClick={() => startRename(item)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-cyan-400 transition-colors cursor-pointer"
                      title="Rename record"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleCopyLink(item.downloadUrl)}
                      className="p-2 rounded-lg text-slate-400 hover:text-cyan-400 transition-colors cursor-pointer"
                      title="Copy streaming URL"
                    >
                      <Copy className="w-3.5 h-3.5" />
                    </button>
                    
                    <button
                      onClick={() => handleShare(item)}
                      className="p-2 rounded-lg text-slate-400 hover:text-cyan-400 transition-colors cursor-pointer"
                      title="Share link"
                    >
                      <Share2 className="w-3.5 h-3.5" />
                    </button>

                    <button
                      onClick={() => handleDownloadToDisk(item)}
                      className="flex items-center gap-1 text-[10px] font-bold px-3 py-1.5 rounded-lg bg-cyan-500 text-black hover:scale-105 active:scale-95 transition-all cursor-pointer"
                    >
                      <Download className="w-3 h-3" />
                      DOWNLOAD FILE
                    </button>

                    <button
                      onClick={() => onDelete(item.id)}
                      className="p-2 rounded-lg text-slate-500 hover:text-rose-400 transition-colors cursor-pointer"
                      title="Delete log entry"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
