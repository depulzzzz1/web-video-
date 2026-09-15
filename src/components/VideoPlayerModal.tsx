import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Play, Volume2, Film, Info, HelpCircle } from 'lucide-react';
import { DownloadItem } from '../types';

interface VideoPlayerModalProps {
  item: DownloadItem | null;
  onClose: () => void;
}

export const VideoPlayerModal: React.FC<VideoPlayerModalProps> = ({ item, onClose }) => {
  if (!item) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        {/* Backdrop glassmorphism */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-black/80 backdrop-blur-sm"
        />

        {/* Modal Window Container */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 30 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 30 }}
          className="relative bg-[#060814]/95 border border-cyan-500/30 w-full max-w-4xl rounded-2xl overflow-hidden shadow-2xl flex flex-col md:flex-row"
        >
          {/* Neon Border top decoration */}
          <div className="absolute top-0 inset-x-0 h-[2px] bg-gradient-to-r from-cyan-400 via-blue-500 to-[#00ffcc] shadow-[0_0_10px_rgba(0,210,255,0.7)]" />

          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 z-10 p-2 rounded-full bg-black/60 hover:bg-black text-slate-300 hover:text-white transition-all border border-slate-800"
          >
            <X className="w-4 h-4" />
          </button>

          {/* Left Block: Neon Video Player */}
          <div className="flex-1 bg-black p-4 flex flex-col justify-center items-center relative min-h-[250px] md:min-h-[400px]">
            <video
              src={item.downloadUrl}
              controls
              autoPlay
              className="w-full h-full max-h-[450px] object-contain rounded-lg border border-slate-900 shadow-2xl"
              poster={item.thumbnailUrl}
            />
          </div>

          {/* Right Block: Media Metadata Specs */}
          <div className="w-full md:w-80 bg-[#0c0e1e]/90 p-6 border-t md:border-t-0 md:border-l border-slate-800/80 flex flex-col justify-between">
            <div>
              <span className="text-[9px] bg-cyan-500/10 border border-cyan-500/30 text-[#00d2ff] font-mono px-2 py-0.5 rounded uppercase font-semibold">
                {item.platform} Pipeline Node
              </span>
              <h3 className="text-sm font-bold text-white mt-2.5 line-clamp-3 leading-relaxed">
                {item.title}
              </h3>

              {/* Dynamic specs details list */}
              <div className="space-y-3.5 mt-5">
                <div className="flex justify-between items-center text-xs border-b border-slate-900 pb-2">
                  <span className="text-slate-500">File Resolution</span>
                  <span className="font-mono text-cyan-400 font-semibold">{item.quality}</span>
                </div>

                <div className="flex justify-between items-center text-xs border-b border-slate-900 pb-2">
                  <span className="text-slate-500">Video Duration</span>
                  <span className="font-mono text-slate-300">{item.duration || '01:30'}</span>
                </div>

                <div className="flex justify-between items-center text-xs border-b border-slate-900 pb-2">
                  <span className="text-slate-500">Video FPS</span>
                  <span className="font-mono text-slate-300">{item.fps || 30} FPS</span>
                </div>

                <div className="flex justify-between items-center text-xs border-b border-slate-900 pb-2">
                  <span className="text-slate-500">Video Codec</span>
                  <span className="font-mono text-slate-300 uppercase">{item.codec || 'h264'}</span>
                </div>

                <div className="flex justify-between items-center text-xs border-b border-slate-900 pb-2">
                  <span className="text-slate-500">Audio Codec</span>
                  <span className="font-mono text-slate-300 uppercase">{item.audioCodec || 'aac'}</span>
                </div>

                <div className="flex justify-between items-center text-xs pb-1">
                  <span className="text-slate-500">Exact File Size</span>
                  <span className="font-mono text-emerald-400 font-semibold">{item.size}</span>
                </div>
              </div>
            </div>

            {/* Quick action notice */}
            <div className="mt-8 bg-[#09121a] border border-cyan-500/20 p-3.5 rounded-xl flex gap-2">
              <Info className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
              <p className="text-[9px] text-slate-400 leading-normal font-mono">
                NOTICE: Media preview is stream-proxied from server memory. Audio and video codecs are synced to browser standards.
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
