import React, { useState } from 'react';
import { motion } from 'motion/react';
import { 
  Download, 
  Copy, 
  Share2, 
  Trash2, 
  Film, 
  CheckCircle,
  Clock,
  Gauge,
  Activity,
  Play,
  Volume2,
  RefreshCw,
  Info
} from 'lucide-react';

interface PipelineResult {
  title: string;
  platform: string;
  resolution: string;
  duration: string;
  fileSize: string;
  downloadSpeed: string;
  processingTime: string;
  thumbnail: string;
  downloadUrl: string;
  dbId?: string;
}

interface MediaPipelineResultProps {
  result: PipelineResult;
  onClear: () => void;
  onDelete?: (id: string) => void;
  addToast: (text: string, type: 'success' | 'error' | 'info') => void;
}

export const MediaPipelineResult: React.FC<MediaPipelineResultProps> = ({ 
  result, 
  onClear, 
  onDelete,
  addToast 
}) => {
  const [isPlaying, setIsPlaying] = useState(false);

  // Triggering the absolute functional "DOWNLOAD FILE TO DISK" bypass stream
  const handleDownloadToDisk = () => {
    addToast('Contacting full-stack proxy stream...', 'info');
    
    // Construct direct API link to backend proxy
    const proxyUrl = `/api/proxy-download?url=${encodeURIComponent(result.downloadUrl)}&title=${encodeURIComponent(result.title)}`;
    
    // Open in a new hidden frame or window location to trigger binary save dialog instantly
    const anchor = document.createElement('a');
    anchor.href = proxyUrl;
    anchor.setAttribute('download', `${result.title.replace(/\s+/g, '_')}.mp4`);
    document.body.appendChild(anchor);
    anchor.click();
    document.body.removeChild(anchor);

    addToast('Media binary file streaming started to local disk!', 'success');
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(result.downloadUrl);
    addToast('Extracted media stream URL copied to clipboard!', 'success');
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: result.title,
        text: `Stream extracted from ${result.platform} using UltraProMax Downloader`,
        url: result.downloadUrl
      }).catch(() => {});
    } else {
      navigator.clipboard.writeText(result.downloadUrl);
      addToast('Shared! Copied URL path to clipboard.', 'success');
    }
  };

  const handleDelete = () => {
    if (result.dbId && onDelete) {
      onDelete(result.dbId);
    }
    onClear();
  };

  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="w-full bg-gradient-to-b from-[#0a0f29]/90 to-[#050716]/95 border border-cyan-500/30 backdrop-blur-2xl rounded-2xl p-6 shadow-2xl relative overflow-hidden"
    >
      {/* Visual cyber glow background grids */}
      <div className="absolute top-0 right-0 w-80 h-80 bg-cyan-500/5 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-80 h-80 bg-blue-500/5 rounded-full blur-3xl pointer-events-none" />

      {/* Decorative neon border-line */}
      <div className="absolute top-0 inset-x-0 h-[2px] bg-gradient-to-r from-cyan-500 via-blue-500 to-emerald-500 shadow-[0_0_12px_rgba(0,210,255,0.8)]" />

      {/* Main Header Tagline */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6 pb-4 border-b border-slate-800/80">
        <div>
          <span className="text-[10px] bg-cyan-500/10 border border-cyan-500/30 text-[#00d2ff] font-mono px-3 py-1 rounded-full uppercase tracking-wider shadow-[0_0_8px_rgba(0,210,255,0.2)]">
            Media Extraction System Resolved
          </span>
          <h2 className="text-xl md:text-2xl font-bold text-white mt-2 tracking-tight">
            MEDIA PIPELINE DISPATCHED
          </h2>
        </div>
        
        <div className="flex gap-2">
          <button
            onClick={onClear}
            className="flex items-center gap-2 px-3.5 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-xs text-slate-400 hover:text-white hover:border-slate-700 transition-all"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            Download New
          </button>
        </div>
      </div>

      {/* Main Grid Content */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Side: Dynamic Preview Player & Thumbnail */}
        <div className="lg:col-span-5 flex flex-col gap-4">
          <div className="relative rounded-xl border border-slate-800 bg-black overflow-hidden group aspect-video shadow-inner">
            {isPlaying ? (
              <video 
                src={result.downloadUrl} 
                controls 
                autoPlay 
                className="w-full h-full object-contain"
                onError={() => {
                  addToast('HTML5 streaming playback blocked by target CORS policies. Downloading files is still fully supported!', 'error');
                  setIsPlaying(false);
                }}
              />
            ) : (
              <>
                <img 
                  src={result.thumbnail} 
                  alt={result.title} 
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 opacity-80"
                />
                
                {/* Play Button Overlay */}
                <div className="absolute inset-0 bg-black/40 flex items-center justify-center transition-all group-hover:bg-black/50">
                  <button 
                    onClick={() => setIsPlaying(true)}
                    className="p-4 rounded-full bg-cyan-500 hover:bg-[#00ffcc] text-black shadow-lg shadow-cyan-500/20 transform active:scale-95 transition-all hover:scale-110 cursor-pointer"
                  >
                    <Play className="w-6 h-6 fill-current" />
                  </button>
                </div>

                <div className="absolute bottom-3 right-3 bg-black/70 border border-slate-800/80 px-2.5 py-0.5 rounded text-[10px] font-mono text-[#00ffcc]">
                  Click to Preview
                </div>
              </>
            )}
          </div>

          {/* Warning disclaimer regarding platform storage limits */}
          <div className="bg-[#0b151e] border border-cyan-500/10 rounded-xl p-3.5 flex gap-3">
            <Info className="w-5 h-5 text-cyan-400 shrink-0 mt-0.5" />
            <p className="text-[10px] text-slate-400 leading-relaxed font-mono">
              PRO TIP: If video doesn't preview, the server bypass is fully active. Direct download streams ignore CORS rules entirely. Click the button to stream file directly to your disk.
            </p>
          </div>
        </div>

        {/* Right Side: Exact Pipeline Details & Control Grid */}
        <div className="lg:col-span-7 flex flex-col justify-between h-full">
          <div>
            <h3 className="text-sm font-semibold text-white mb-3 line-clamp-2 leading-snug">
              {result.title}
            </h3>

            {/* Structured specifications layout */}
            <div className="grid grid-cols-2 gap-3.5 mb-6">
              <div className="p-3 rounded-xl bg-slate-900/40 border border-slate-800/80">
                <span className="text-[9px] text-slate-500 uppercase tracking-wider block font-semibold mb-1">
                  Source Provider
                </span>
                <span className="text-xs font-semibold text-slate-200">
                  {result.platform}
                </span>
              </div>

              <div className="p-3 rounded-xl bg-slate-900/40 border border-slate-800/80">
                <span className="text-[9px] text-slate-500 uppercase tracking-wider block font-semibold mb-1">
                  Video Resolution
                </span>
                <span className="text-xs font-mono font-semibold text-[#00d2ff]">
                  {result.resolution}
                </span>
              </div>

              <div className="p-3 rounded-xl bg-slate-900/40 border border-slate-800/80">
                <span className="text-[9px] text-slate-500 uppercase tracking-wider block font-semibold mb-1 font-mono">
                  File Size Node
                </span>
                <span className="text-xs font-mono font-semibold text-emerald-400">
                  {result.fileSize}
                </span>
              </div>

              <div className="p-3 rounded-xl bg-slate-900/40 border border-slate-800/80">
                <span className="text-[9px] text-slate-500 uppercase tracking-wider block font-semibold mb-1 font-mono">
                  Network Pipe Speed
                </span>
                <span className="text-xs font-mono font-semibold text-[#00ffcc]">
                  {result.downloadSpeed}
                </span>
              </div>

              <div className="p-3 rounded-xl bg-slate-900/40 border border-slate-800/80">
                <span className="text-[9px] text-slate-500 uppercase tracking-wider block font-semibold mb-1">
                  Duration / Length
                </span>
                <span className="text-xs font-mono text-slate-300">
                  {result.duration}
                </span>
              </div>

              <div className="p-3 rounded-xl bg-slate-900/40 border border-slate-800/80">
                <span className="text-[9px] text-slate-500 uppercase tracking-wider block font-semibold mb-1">
                  Bypass Pipeline Lag
                </span>
                <span className="text-xs font-mono text-slate-300">
                  {result.processingTime}
                </span>
              </div>
            </div>
          </div>

          {/* Big Action Buttons Row */}
          <div className="flex flex-col sm:flex-row gap-3 mt-auto">
            {/* Direct download bypass button */}
            <button
              onClick={handleDownloadToDisk}
              className="flex-1 flex items-center justify-center gap-2.5 py-4 px-5 rounded-xl bg-gradient-to-r from-cyan-500 via-blue-500 to-[#00ffcc] text-black font-bold text-sm tracking-wide shadow-lg shadow-cyan-500/20 hover:scale-[1.02] active:scale-[0.98] transition-all cursor-pointer"
            >
              <Download className="w-4.5 h-4.5 stroke-[2.5px]" />
              DOWNLOAD FILE TO DISK
            </button>

            {/* Utility grid buttons */}
            <div className="flex gap-2">
              <button
                onClick={handleCopyLink}
                title="Copy direct download link"
                className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 hover:text-cyan-400 hover:border-cyan-500/30 transition-all cursor-pointer"
              >
                <Copy className="w-4.5 h-4.5" />
              </button>

              <button
                onClick={handleShare}
                title="Share links"
                className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 hover:text-cyan-400 hover:border-cyan-500/30 transition-all cursor-pointer"
              >
                <Share2 className="w-4.5 h-4.5" />
              </button>

              <button
                onClick={handleDelete}
                title="Delete media log entry"
                className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-400 hover:text-rose-400 hover:border-rose-500/30 transition-all cursor-pointer"
              >
                <Trash2 className="w-4.5 h-4.5" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};
