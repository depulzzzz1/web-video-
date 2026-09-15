import React from 'react';
import { 
  Video, 
  Tv, 
  Youtube, 
  Instagram, 
  Facebook, 
  Twitter, 
  Music, 
  Layers, 
  Smartphone, 
  Pin, 
  Flame, 
  Smile, 
  Radio
} from 'lucide-react';

export interface PlatformConfig {
  name: string;
  id: string;
  color: string;
  glowColor: string;
  icon: React.ComponentType<any>;
  placeholder: string;
}

export const platforms: PlatformConfig[] = [
  { 
    name: 'TikTok', 
    id: 'tiktok', 
    color: 'from-pink-500 to-cyan-400', 
    glowColor: 'shadow-pink-500/20',
    icon: Music, 
    placeholder: 'https://vt.tiktok.com/ZS234567/' 
  },
  { 
    name: 'TikTok HD', 
    id: 'tiktok_hd', 
    color: 'from-teal-400 to-emerald-500', 
    glowColor: 'shadow-teal-500/20',
    icon: Smartphone, 
    placeholder: 'https://www.tiktok.com/@user/video/...' 
  },
  { 
    name: 'TikTok Slideshow', 
    id: 'tiktok_slides', 
    color: 'from-purple-500 to-pink-500', 
    glowColor: 'shadow-purple-500/20',
    icon: Layers, 
    placeholder: 'TikTok photo slideshow link...' 
  },
  { 
    name: 'Instagram Reels', 
    id: 'instagram_reels', 
    color: 'from-amber-500 to-rose-500', 
    glowColor: 'shadow-rose-500/20',
    icon: Instagram, 
    placeholder: 'https://www.instagram.com/reels/...' 
  },
  { 
    name: 'Instagram Video', 
    id: 'instagram_video', 
    color: 'from-indigo-500 to-purple-500', 
    glowColor: 'shadow-indigo-500/20',
    icon: Video, 
    placeholder: 'https://www.instagram.com/p/...' 
  },
  { 
    name: 'YouTube Video', 
    id: 'youtube_video', 
    color: 'from-red-600 to-rose-500', 
    glowColor: 'shadow-red-500/20',
    icon: Youtube, 
    placeholder: 'https://www.youtube.com/watch?v=...' 
  },
  { 
    name: 'YouTube Shorts', 
    id: 'youtube_shorts', 
    color: 'from-red-500 to-orange-500', 
    glowColor: 'shadow-orange-500/20',
    icon: Tv, 
    placeholder: 'https://www.youtube.com/shorts/...' 
  },
  { 
    name: 'Facebook Video', 
    id: 'facebook', 
    color: 'from-blue-600 to-sky-400', 
    glowColor: 'shadow-blue-500/20',
    icon: Facebook, 
    placeholder: 'https://www.facebook.com/watch/?v=...' 
  },
  { 
    name: 'Twitter / X', 
    id: 'twitter', 
    color: 'from-slate-700 to-slate-400', 
    glowColor: 'shadow-slate-500/20',
    icon: Twitter, 
    placeholder: 'https://x.com/username/status/...' 
  },
  { 
    name: 'Pinterest', 
    id: 'pinterest', 
    color: 'from-red-500 to-rose-600', 
    glowColor: 'shadow-red-500/20',
    icon: Pin, 
    placeholder: 'https://pinterest.com/pin/...' 
  },
  { 
    name: 'CapCut', 
    id: 'capcut', 
    color: 'from-cyan-500 to-blue-500', 
    glowColor: 'shadow-cyan-500/20',
    icon: Flame, 
    placeholder: 'https://www.capcut.com/t/...' 
  },
  { 
    name: 'Reddit', 
    id: 'reddit', 
    color: 'from-orange-500 to-red-500', 
    glowColor: 'shadow-orange-500/20',
    icon: Radio, 
    placeholder: 'https://www.reddit.com/r/...' 
  },
  { 
    name: 'Likee', 
    id: 'likee', 
    color: 'from-yellow-400 to-pink-500', 
    glowColor: 'shadow-yellow-500/20',
    icon: Smile, 
    placeholder: 'https://likee.video/v/...' 
  }
];

interface SupportedPlatformsProps {
  selectedPlatform: string;
  setSelectedPlatform: (id: string) => void;
  onUrlExampleClick: (url: string) => void;
}

export const SupportedPlatforms: React.FC<SupportedPlatformsProps> = ({ 
  selectedPlatform, 
  setSelectedPlatform,
  onUrlExampleClick 
}) => {
  return (
    <div className="w-full">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-xs font-semibold uppercase tracking-widest text-[#00ffcc] glow-text">
          Select Source Platform Node
        </h3>
        <span className="text-[10px] text-slate-400 bg-slate-900 border border-slate-800 px-2.5 py-0.5 rounded-full uppercase font-mono">
          Auto-Detection Active
        </span>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
        {platforms.map((platform) => {
          const isSelected = selectedPlatform === platform.id;
          const Icon = platform.icon;
          
          return (
            <div
              key={platform.id}
              onClick={() => setSelectedPlatform(platform.id)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  setSelectedPlatform(platform.id);
                }
              }}
              role="button"
              tabIndex={0}
              className={`relative flex items-center gap-3 p-3.5 rounded-xl border transition-all duration-300 group overflow-hidden cursor-pointer select-none ${
                isSelected 
                  ? `bg-[#0d162a]/90 border-[#00d2ff] shadow-lg shadow-[#00d2ff]/10 ${platform.glowColor}` 
                  : 'bg-[#060814]/40 border-slate-800/80 hover:bg-[#0a0f26]/60 hover:border-slate-700 hover:shadow-md'
              }`}
            >
              {/* Animated glow background on select */}
              {isSelected && (
                <div className="absolute inset-0 bg-gradient-to-r opacity-[0.06] from-cyan-500 to-blue-500 animate-pulse pointer-events-none" />
              )}
              
              <div className={`p-2 rounded-lg bg-gradient-to-tr ${platform.color} shadow-inner shrink-0 group-hover:scale-105 transition-transform duration-300`}>
                <Icon className="w-4 h-4 text-white" />
              </div>

              <div className="flex flex-col items-start overflow-hidden">
                <span className={`text-xs font-semibold truncate ${isSelected ? 'text-[#00d2ff]' : 'text-slate-300'}`}>
                  {platform.name}
                </span>
                <button 
                  onClick={(e) => {
                    e.stopPropagation();
                    onUrlExampleClick(platform.placeholder);
                  }}
                  className="text-[9px] text-[#00ffcc] opacity-0 group-hover:opacity-100 font-mono transition-opacity hover:underline text-left mt-0.5 cursor-pointer"
                >
                  Load Example
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
