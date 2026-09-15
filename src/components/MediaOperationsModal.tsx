import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  X, 
  Settings, 
  Video, 
  Music, 
  Image as ImageIcon, 
  Type, 
  Download, 
  Play, 
  CheckCircle2, 
  Loader2, 
  Terminal,
  Cpu,
  Zap,
  HardDrive
} from 'lucide-react';
import { DownloadItem } from '../types';

interface MediaOperationsModalProps {
  isOpen: boolean;
  onClose: () => void;
  mediaItem: DownloadItem | null;
  accentColor: 'blue' | 'purple' | 'orange' | 'green';
  addToast: (text: string, type: 'success' | 'error' | 'info') => void;
}

export const MediaOperationsModal: React.FC<MediaOperationsModalProps> = ({
  isOpen,
  onClose,
  mediaItem,
  accentColor,
  addToast
}) => {
  const [activeTab, setActiveTab] = useState<'mp3' | 'gif' | 'compress' | 'subtitles'>('mp3');
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [terminalLogs, setTerminalLogs] = useState<string[]>([]);
  const [completedResult, setCompletedResult] = useState<{ title: string; size: string; type: string } | null>(null);

  // MP3 Configs
  const [audioBitrate, setAudioBitrate] = useState<string>('320');
  const [audioFormat, setAudioFormat] = useState<string>('mp3');

  // GIF Configs
  const [gifFps, setGifFps] = useState<number>(15);
  const [gifResolution, setGifResolution] = useState<string>('480x270');
  const [gifDuration, setGifDuration] = useState<number>(5);

  // Video Compressor Configs
  const [targetResolution, setTargetResolution] = useState<string>('480');
  const [compressBitrate, setCompressBitrate] = useState<string>('1500');

  // Subtitle Configs
  const [subtitleLang, setSubtitleLang] = useState<string>('en');
  const [subtitleFormat, setSubtitleFormat] = useState<string>('srt');

  const currClasses = {
    blue: {
      text: 'text-[#00d2ff]',
      bg: 'bg-cyan-500',
      border: 'border-cyan-500/30',
      borderFocus: 'focus:border-cyan-500/50',
      bgMuted: 'bg-[#0c1328]',
      gradient: 'from-cyan-500 to-blue-500',
      hoverBg: 'hover:bg-[#00ffcc] hover:text-black',
    },
    purple: {
      text: 'text-[#d946ef]',
      bg: 'bg-fuchsia-500',
      border: 'border-fuchsia-500/30',
      borderFocus: 'focus:border-fuchsia-500/50',
      bgMuted: 'bg-[#1e0e29]',
      gradient: 'from-fuchsia-500 to-purple-500',
      hoverBg: 'hover:bg-[#f472b6] hover:text-black',
    },
    orange: {
      text: 'text-[#f97316]',
      bg: 'bg-orange-500',
      border: 'border-orange-500/30',
      borderFocus: 'focus:border-orange-500/50',
      bgMuted: 'bg-[#1c0d06]',
      gradient: 'from-orange-500 to-red-500',
      hoverBg: 'hover:bg-[#fb923c] hover:text-black',
    },
    green: {
      text: 'text-[#22c55e]',
      bg: 'bg-emerald-500',
      border: 'border-emerald-500/30',
      borderFocus: 'focus:border-emerald-500/50',
      bgMuted: 'bg-[#051a10]',
      gradient: 'from-emerald-500 to-teal-500',
      hoverBg: 'hover:bg-[#4ade80] hover:text-black',
    }
  }[accentColor];

  useEffect(() => {
    // Reset state on open or item change
    setIsProcessing(false);
    setProgress(0);
    setTerminalLogs([]);
    setCompletedResult(null);
  }, [mediaItem, isOpen]);

  if (!isOpen || !mediaItem) return null;

  const runOperationSimulation = () => {
    setIsProcessing(true);
    setProgress(0);
    setCompletedResult(null);
    setTerminalLogs([]);

    const opName = 
      activeTab === 'mp3' ? 'MP3 AUDIO EXTRACTION' :
      activeTab === 'gif' ? 'GIF CONVERSION ENGINE' :
      activeTab === 'compress' ? 'VIDEO BITRATE COMPRESSOR' : 'SUBTITLE PIPELINE RESOLVER';

    const steps = [
      `[SYS] Initializing thread pipeline for: ${opName}`,
      `[SYS] Allocating client cloud cache nodes... OK`,
      `[FFMPEG] Mounting source stream: ${mediaItem.title}`,
      `[FFMPEG] Chunk index extraction started...`,
      activeTab === 'mp3' ? `[AUDIO] Resampling frequencies to ${audioBitrate} kbps...` :
      activeTab === 'gif' ? `[GIF] Building color palette filters with resolution ${gifResolution} at ${gifFps}fps...` :
      activeTab === 'compress' ? `[VP9] Transcoding frame matrices to target resolution ${targetResolution}p at ${compressBitrate}kbps...` :
      `[WHISPER] AI Speech-to-Text alignment executing target language: ${subtitleLang.toUpperCase()}...`,
      `[SYS] Multiplexing streams into standalone binary file...`,
      `[SYS] Applying duplicate detection rules... PASS`,
      `[SYS] Executing Nginx reverse proxy transmission handshake... OK`,
      `[SYS] Processing completed. Dispatched to client buffer!`
    ];

    let currentStep = 0;
    const interval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          setIsProcessing(false);
          
          let resultTitle = '';
          let resultSize = '';
          let resultType = '';

          if (activeTab === 'mp3') {
            resultTitle = `${mediaItem.title.substring(0, 45)}.mp3`;
            resultSize = '4.8 MB';
            resultType = 'Audio (MP3)';
          } else if (activeTab === 'gif') {
            resultTitle = `${mediaItem.title.substring(0, 45)}.gif`;
            resultSize = '1.2 MB';
            resultType = 'Image (GIF)';
          } else if (activeTab === 'compress') {
            resultTitle = `${mediaItem.title.substring(0, 45)}_compressed.mp4`;
            resultSize = '15.4 MB';
            resultType = 'Video (MP4)';
          } else {
            resultTitle = `${mediaItem.title.substring(0, 45)}.${subtitleFormat}`;
            resultSize = '42 KB';
            resultType = 'Subtitle';
          }

          setCompletedResult({ title: resultTitle, size: resultSize, type: resultType });
          addToast(`${opName} pipeline execution success! Ready to acquire.`, 'success');
          return 100;
        }

        // Add log entry dynamically
        if (prev % 12 === 0 && currentStep < steps.length) {
          setTerminalLogs(l => [...l, steps[currentStep]]);
          currentStep++;
        }

        return prev + 4;
      });
    }, 120);
  };

  const downloadProcessedFile = () => {
    if (!completedResult) return;
    addToast('Contacting local proxy buffer stream...', 'info');
    
    // Simulate downloading processed static asset
    const anchor = document.createElement('a');
    anchor.href = `/api/proxy-download?url=${encodeURIComponent(mediaItem.downloadUrl)}&title=${encodeURIComponent(completedResult.title)}`;
    anchor.setAttribute('download', completedResult.title);
    document.body.appendChild(anchor);
    anchor.click();
    document.body.removeChild(anchor);

    addToast(`Acquired processed file: ${completedResult.title}`, 'success');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#020306]/90 backdrop-blur-xl animate-fade-in">
      <div className="relative w-full max-w-2xl bg-[#05070f] border border-slate-800/80 rounded-3xl shadow-2xl overflow-hidden flex flex-col h-[85vh] md:h-[580px]">
        {/* Top Header bar */}
        <div className="p-5 border-b border-slate-900/60 bg-[#030409]/95 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={`p-1.5 rounded-lg bg-gradient-to-tr ${currClasses.gradient} text-black`}>
              <Settings className="w-4 h-4 text-black animate-spin" style={{ animationDuration: '6s' }} />
            </div>
            <div>
              <h3 className="text-xs font-bold text-white font-mono uppercase tracking-wider">Cyberpunk Media Processing Pipeline</h3>
              <p className="text-[10px] text-slate-400 font-mono truncate max-w-[320px] sm:max-w-md mt-0.5">Source: {mediaItem.title}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg bg-slate-900 border border-slate-850 hover:border-slate-800 text-slate-400 hover:text-white cursor-pointer transition-all"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Action Tabs selector */}
        <div className="flex border-b border-slate-900/60 bg-[#030409]/50 p-2 gap-1.5 overflow-x-auto no-scrollbar shrink-0">
          <button
            onClick={() => { setActiveTab('mp3'); setCompletedResult(null); }}
            className={`flex-1 py-2 px-3 rounded-xl text-[10px] font-mono font-bold uppercase tracking-wider flex items-center justify-center gap-2 transition-all cursor-pointer ${
              activeTab === 'mp3' ? `${currClasses.bgMuted} border ${currClasses.border} ${currClasses.text}` : 'text-slate-400 hover:text-white'
            }`}
          >
            <Music className="w-3.5 h-3.5" />
            MP3 Audio Extract
          </button>
          <button
            onClick={() => { setActiveTab('gif'); setCompletedResult(null); }}
            className={`flex-1 py-2 px-3 rounded-xl text-[10px] font-mono font-bold uppercase tracking-wider flex items-center justify-center gap-2 transition-all cursor-pointer ${
              activeTab === 'gif' ? `${currClasses.bgMuted} border ${currClasses.border} ${currClasses.text}` : 'text-slate-400 hover:text-white'
            }`}
          >
            <ImageIcon className="w-3.5 h-3.5" />
            GIF Generator
          </button>
          <button
            onClick={() => { setActiveTab('compress'); setCompletedResult(null); }}
            className={`flex-1 py-2 px-3 rounded-xl text-[10px] font-mono font-bold uppercase tracking-wider flex items-center justify-center gap-2 transition-all cursor-pointer ${
              activeTab === 'compress' ? `${currClasses.bgMuted} border ${currClasses.border} ${currClasses.text}` : 'text-slate-400 hover:text-white'
            }`}
          >
            <Video className="w-3.5 h-3.5" />
            Video Compress
          </button>
          <button
            onClick={() => { setActiveTab('subtitles'); setCompletedResult(null); }}
            className={`flex-1 py-2 px-3 rounded-xl text-[10px] font-mono font-bold uppercase tracking-wider flex items-center justify-center gap-2 transition-all cursor-pointer ${
              activeTab === 'subtitles' ? `${currClasses.bgMuted} border ${currClasses.border} ${currClasses.text}` : 'text-slate-400 hover:text-white'
            }`}
          >
            <Type className="w-3.5 h-3.5" />
            AI Subtitles
          </button>
        </div>

        {/* Tabs specific configurations panels */}
        <div className="flex-1 p-6 overflow-y-auto flex flex-col justify-between">
          <div className="space-y-5">
            <AnimatePresence mode="wait">
              {activeTab === 'mp3' && (
                <motion.div
                  key="mp3"
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -5 }}
                  className="grid grid-cols-1 sm:grid-cols-2 gap-4"
                >
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[9px] text-slate-500 font-mono uppercase tracking-widest font-bold">Audio Output Format</label>
                    <select
                      value={audioFormat}
                      onChange={(e) => setAudioFormat(e.target.value)}
                      className="bg-slate-900 border border-slate-800 focus:outline-none focus:border-cyan-500/40 rounded-xl px-4 py-3 text-xs text-slate-300 font-mono"
                    >
                      <option value="mp3">MPEG Audio Layer III (.mp3)</option>
                      <option value="m4a">AAC Audio (.m4a)</option>
                      <option value="wav">Uncompressed WAV Waveform (.wav)</option>
                      <option value="flac">Lossless FLAC (.flac)</option>
                    </select>
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[9px] text-slate-500 font-mono uppercase tracking-widest font-bold">Resampling Audio Bitrate</label>
                    <select
                      value={audioBitrate}
                      onChange={(e) => setAudioBitrate(e.target.value)}
                      className="bg-slate-900 border border-slate-800 focus:outline-none focus:border-cyan-500/40 rounded-xl px-4 py-3 text-xs text-slate-300 font-mono"
                    >
                      <option value="320">320 kbps (High Fidelity Audiophile)</option>
                      <option value="256">256 kbps (Premium High Quality)</option>
                      <option value="192">192 kbps (Standard Broadcast)</option>
                      <option value="128">128 kbps (Mobile Optimized)</option>
                    </select>
                  </div>
                </motion.div>
              )}

              {activeTab === 'gif' && (
                <motion.div
                  key="gif"
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -5 }}
                  className="grid grid-cols-1 sm:grid-cols-3 gap-4"
                >
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[9px] text-slate-500 font-mono uppercase tracking-widest font-bold">Target Resolution</label>
                    <select
                      value={gifResolution}
                      onChange={(e) => setGifResolution(e.target.value)}
                      className="bg-slate-900 border border-slate-800 focus:outline-none focus:border-cyan-500/40 rounded-xl px-4 py-3 text-xs text-slate-300 font-mono"
                    >
                      <option value="480x270">480 x 270 (Ultra Light)</option>
                      <option value="640x360">640 x 360 (Web Standard)</option>
                      <option value="800x450">800 x 450 (High Quality)</option>
                    </select>
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[9px] text-slate-500 font-mono uppercase tracking-widest font-bold">Frame Rate (FPS)</label>
                    <select
                      value={gifFps}
                      onChange={(e) => setGifFps(Number(e.target.value))}
                      className="bg-slate-900 border border-slate-800 focus:outline-none focus:border-cyan-500/40 rounded-xl px-4 py-3 text-xs text-slate-300 font-mono"
                    >
                      <option value={10}>10 FPS (Low file size)</option>
                      <option value={15}>15 FPS (Optimal web motion)</option>
                      <option value={24}>24 FPS (Cinematic smooth)</option>
                    </select>
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[9px] text-slate-500 font-mono uppercase tracking-widest font-bold">Duration Crop Target</label>
                    <select
                      value={gifDuration}
                      onChange={(e) => setGifDuration(Number(e.target.value))}
                      className="bg-slate-900 border border-slate-800 focus:outline-none focus:border-cyan-500/40 rounded-xl px-4 py-3 text-xs text-slate-300 font-mono"
                    >
                      <option value={3}>First 3 Seconds</option>
                      <option value={5}>First 5 Seconds</option>
                      <option value={10}>First 10 Seconds</option>
                    </select>
                  </div>
                </motion.div>
              )}

              {activeTab === 'compress' && (
                <motion.div
                  key="compress"
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -5 }}
                  className="grid grid-cols-1 sm:grid-cols-2 gap-4"
                >
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[9px] text-slate-500 font-mono uppercase tracking-widest font-bold">Bitrate Constraint Limit</label>
                    <select
                      value={compressBitrate}
                      onChange={(e) => setCompressBitrate(e.target.value)}
                      className="bg-slate-900 border border-slate-800 focus:outline-none focus:border-cyan-500/40 rounded-xl px-4 py-3 text-xs text-slate-300 font-mono"
                    >
                      <option value="800">800 kbps (Extreme Compression)</option>
                      <option value="1500">1500 kbps (Safe WhatsApp Sharing)</option>
                      <option value="3000">3000 kbps (High Def Balance)</option>
                    </select>
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[9px] text-slate-500 font-mono uppercase tracking-widest font-bold">Resolution Target Downscale</label>
                    <select
                      value={targetResolution}
                      onChange={(e) => setTargetResolution(e.target.value)}
                      className="bg-slate-900 border border-slate-800 focus:outline-none focus:border-cyan-500/40 rounded-xl px-4 py-3 text-xs text-slate-300 font-mono"
                    >
                      <option value="360">360p LD (Mobile Optimized)</option>
                      <option value="480">480p SD (Standard Web)</option>
                      <option value="720">720p HD (High Definition)</option>
                    </select>
                  </div>
                </motion.div>
              )}

              {activeTab === 'subtitles' && (
                <motion.div
                  key="subtitles"
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -5 }}
                  className="grid grid-cols-1 sm:grid-cols-2 gap-4"
                >
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[9px] text-slate-500 font-mono uppercase tracking-widest font-bold">Language Translation Target</label>
                    <select
                      value={subtitleLang}
                      onChange={(e) => setSubtitleLang(e.target.value)}
                      className="bg-slate-900 border border-slate-800 focus:outline-none focus:border-cyan-500/40 rounded-xl px-4 py-3 text-xs text-slate-300 font-mono"
                    >
                      <option value="en">English Translation AI</option>
                      <option value="id">Indonesian Localization AI</option>
                      <option value="ja">Japanese Kanji AI</option>
                      <option value="es">Spanish Castellano AI</option>
                    </select>
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[9px] text-slate-500 font-mono uppercase tracking-widest font-bold">Subtitle File Extension</label>
                    <select
                      value={subtitleFormat}
                      onChange={(e) => setSubtitleFormat(e.target.value)}
                      className="bg-slate-900 border border-slate-800 focus:outline-none focus:border-cyan-500/40 rounded-xl px-4 py-3 text-xs text-slate-300 font-mono"
                    >
                      <option value="srt">SubRip Format (.srt)</option>
                      <option value="vtt">WebVTT Standard (.vtt)</option>
                      <option value="ass">Advanced SubStation (.ass)</option>
                    </select>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Interactive Progress Indicators & Log console */}
            {(isProcessing || terminalLogs.length > 0) && (
              <div className="space-y-3.5 p-4 bg-[#030409]/95 border border-slate-900 rounded-2xl">
                <div className="flex items-center justify-between text-xs">
                  <span className={`font-mono font-bold uppercase ${currClasses.text} flex items-center gap-2`}>
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping" />
                    Transcoding Matrices
                  </span>
                  <span className="font-mono text-slate-400 font-bold">{progress}%</span>
                </div>
                
                {/* Visual Progress slide */}
                <div className="w-full h-1.5 bg-slate-950 rounded-full overflow-hidden">
                  <div 
                    className={`h-full bg-gradient-to-r ${currClasses.gradient} transition-all duration-300`}
                    style={{ width: `${progress}%` }}
                  />
                </div>

                {/* Shell Terminal simulation */}
                <div className="h-28 bg-[#010204] border border-slate-950 p-2.5 rounded-xl font-mono text-[9px] text-emerald-400 space-y-1 overflow-y-auto no-scrollbar select-text">
                  {terminalLogs.map((log, idx) => (
                    <div key={idx} className="flex gap-2">
                      <span className="text-slate-600">[{idx}]</span>
                      <span>{log}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Success Completion Result Panel */}
            {completedResult && (
              <motion.div
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                className="p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-4"
              >
                <div className="flex items-center gap-3">
                  <CheckCircle2 className="w-8 h-8 text-emerald-400 shrink-0" />
                  <div className="min-w-0">
                    <h5 className="text-[11px] font-bold font-mono text-white truncate max-w-[280px] sm:max-w-md">{completedResult.title}</h5>
                    <span className="text-[9px] font-mono text-slate-400 uppercase">
                      Type: <strong className="text-emerald-400">{completedResult.type}</strong> | Size: <strong className="text-emerald-400">{completedResult.size}</strong>
                    </span>
                  </div>
                </div>
                <button
                  onClick={downloadProcessedFile}
                  className="px-4 py-2 rounded-xl bg-emerald-500 text-black font-bold uppercase tracking-wider text-[10px] font-mono hover:scale-105 active:scale-95 cursor-pointer transition-all flex items-center gap-2 shrink-0"
                >
                  <Download className="w-3.5 h-3.5" />
                  Acquire Processed File
                </button>
              </motion.div>
            )}
          </div>

          {/* Action Trigger Row */}
          <div className="pt-4 border-t border-slate-900 flex justify-end gap-3">
            <button
              onClick={onClose}
              className="px-5 py-2.5 rounded-xl text-[10px] font-mono uppercase font-bold text-slate-400 hover:text-white transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              onClick={runOperationSimulation}
              disabled={isProcessing}
              className={`px-6 py-2.5 rounded-xl bg-gradient-to-r ${currClasses.gradient} text-black font-bold uppercase tracking-wider text-[10px] font-mono transition-all hover:scale-105 active:scale-95 cursor-pointer disabled:opacity-50`}
            >
              {isProcessing ? 'Processing...' : 'Engage Transformation Pipeline'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
