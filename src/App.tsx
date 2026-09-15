import React, { useState, useEffect, useRef } from 'react';
import { 
  Download, 
  Globe, 
  Phone, 
  Terminal as TerminalIcon, 
  Settings, 
  Shield, 
  Cpu, 
  RefreshCw, 
  AlertCircle, 
  Sparkles, 
  HardDrive, 
  Wifi, 
  Clock, 
  Trash2, 
  ChevronRight,
  Database,
  Search,
  Maximize2,
  Activity,
  User,
  MapPin,
  Lock,
  Play,
  Square,
  Loader2,
  CheckCircle2,
  XCircle,
  Copy
} from 'lucide-react';

import { DownloadItem, SystemStats, ApiKey, ServerLog } from './types';
import { Toast, ToastMessage } from './components/Toast';
import { SupportedPlatforms } from './components/SupportedPlatforms';
import { DashboardStats } from './components/DashboardStats';
import { MediaPipelineResult } from './components/MediaPipelineResult';
import { HistorySection } from './components/HistorySection';
import { VideoPlayerModal } from './components/VideoPlayerModal';
import { AdminPanel } from './components/AdminPanel';
import { UserProfileModal } from './components/UserProfileModal';
import { MediaOperationsModal } from './components/MediaOperationsModal';

export interface BulkQueueItem {
  id: string;
  url: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  progress: number;
  speed?: string;
  eta?: string;
  currentStage?: string;
  error?: string | null;
  result?: any | null;
}

export default function App() {
  // Navigation & UI States
  const [activeTab, setActiveTab] = useState<'downloader' | 'analytics' | 'network' | 'history' | 'admin'>('downloader');
  const [networkSubTab, setNetworkSubTab] = useState<'ip' | 'phone' | 'dns'>('ip');
  
  // Custom Toast notifications state
  const [toasts, setToasts] = useState<ToastMessage[]>([]);
  const addToast = (text: string, type: 'success' | 'error' | 'info') => {
    const newToast: ToastMessage = {
      id: `toast-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      text,
      type
    };
    setToasts(prev => [...prev, newToast]);
    // Auto-remove toast in 4 seconds
    setTimeout(() => removeToast(newToast.id), 4000);
  };
  const removeToast = (id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  };

  // Downloader form states
  const [downloadUrl, setDownloadUrl] = useState('');
  const [downloadMode, setDownloadMode] = useState<'video' | 'audio'>('video');
  const [videoQuality, setVideoQuality] = useState<string>('720');
  const [selectedPlatform, setSelectedPlatform] = useState<string>('tiktok');

  // Loading & Download active States
  const [isDownloading, setIsDownloading] = useState(false);
  const [downloadProgress, setDownloadProgress] = useState(0);
  const [downloadSpeed, setDownloadSpeed] = useState('0 KB/s');
  const [downloadEta, setDownloadEta] = useState('--s');
  const [currentStageText, setCurrentStageText] = useState('');
  
  // Pipeline result view state
  const [pipelineResult, setPipelineResult] = useState<any | null>(null);

  // Bulk Downloader states
  const [downloaderMode, setDownloaderMode] = useState<'single' | 'bulk'>('single');
  const [bulkUrlsText, setBulkUrlsText] = useState('');
  const [bulkQueue, setBulkQueue] = useState<BulkQueueItem[]>([]);
  const [isProcessingBulk, setIsProcessingBulk] = useState(false);
  const [currentBulkIndex, setCurrentBulkIndex] = useState(0);
  const stopBulkRef = useRef<boolean>(false);

  // Database loaded states
  const [history, setHistory] = useState<DownloadItem[]>([]);
  const [systemStats, setSystemStats] = useState<SystemStats | null>(null);
  const [activePreviewItem, setActivePreviewItem] = useState<DownloadItem | null>(null);

  // New modal states
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isOpsOpen, setIsOpsOpen] = useState(false);
  const [selectedOpsItem, setSelectedOpsItem] = useState<DownloadItem | null>(null);

  // Accent theme colors
  const [accentColor, setAccentColor] = useState<'blue' | 'purple' | 'orange' | 'green'>('blue');

  // Network Tools inputs & results
  const [ipInput, setIpInput] = useState('');
  const [ipLoading, setIpLoading] = useState(false);
  const [ipError, setIpError] = useState<string | null>(null);
  const [ipResult, setIpResult] = useState<any | null>(null);

  const [phoneInput, setPhoneInput] = useState('');
  const [phoneRegion, setPhoneRegion] = useState('ID');
  const [phoneLoading, setPhoneLoading] = useState(false);
  const [phoneError, setPhoneError] = useState<string | null>(null);
  const [phoneResult, setPhoneResult] = useState<any | null>(null);

  const [dnsInput, setDnsInput] = useState('');
  const [dnsLoading, setDnsLoading] = useState(false);
  const [dnsError, setDnsError] = useState<string | null>(null);
  const [dnsResult, setDnsResult] = useState<any | null>(null);

  // Load client IP and history automatically on mount
  useEffect(() => {
    fetchHistory();
    fetchStats();
    fetchClientIpOnLoad();
  }, []);

  const fetchClientIpOnLoad = async () => {
    try {
      const res = await fetch('https://api.ipify.org?format=json');
      if (res.ok) {
        const data = await res.json();
        setIpInput(data.ip || '');
      }
    } catch (e) {
      // Quiet fail fallback
    }
  };

  const fetchHistory = async () => {
    try {
      const res = await fetch('/api/history');
      if (res.ok) {
        const data = await res.json();
        setHistory(data);
      }
    } catch (e) {
      // Quiet fail
    }
  };

  const fetchStats = async () => {
    try {
      const res = await fetch('/api/stats');
      if (res.ok) {
        const data = await res.json();
        setSystemStats(data);
      }
    } catch (e) {
      // Quiet fail
    }
  };

  // Detect platform automatically from typing/pasting URL
  const handleUrlChange = (val: string) => {
    setDownloadUrl(val);
    const u = val.toLowerCase();
    if (u.includes('tiktok.com')) setSelectedPlatform('tiktok');
    else if (u.includes('instagram.com/reels')) setSelectedPlatform('instagram_reels');
    else if (u.includes('instagram.com')) setSelectedPlatform('instagram_video');
    else if (u.includes('youtube.com/watch') || u.includes('youtu.be')) setSelectedPlatform('youtube_video');
    else if (u.includes('youtube.com/shorts')) setSelectedPlatform('youtube_shorts');
    else if (u.includes('facebook.com') || u.includes('fb.watch')) setSelectedPlatform('facebook');
    else if (u.includes('x.com') || u.includes('twitter.com')) setSelectedPlatform('twitter');
    else if (u.includes('pinterest.com')) setSelectedPlatform('pinterest');
    else if (u.includes('capcut.com')) setSelectedPlatform('capcut');
    else if (u.includes('reddit.com')) setSelectedPlatform('reddit');
    else if (u.includes('likee.video') || u.includes('likee.com')) setSelectedPlatform('likee');
  };

  const handleExampleLoad = (exampleUrl: string) => {
    setDownloadUrl(exampleUrl);
    handleUrlChange(exampleUrl);
    addToast('Example media URL link loaded.', 'info');
  };

  // Handle pipeline download request with realistic live streaming updates using SSE or simulated intervals
  const handlePipelineSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const url = downloadUrl.trim();
    if (!url) {
      addToast('Please enter a valid media stream link first.', 'error');
      return;
    }

    // Validate URL format before processing
    const urlPattern = /^(https?:\/\/)?(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)$/i;
    if (!urlPattern.test(url)) {
      addToast('Invalid URL format. Please enter a valid HTTP or HTTPS media link.', 'error');
      return;
    }

    setIsDownloading(true);
    setDownloadProgress(0);
    setPipelineResult(null);

    // Progressive simulated progress indicators to match the cyber aesthetic beautifully
    const stages = [
      { text: 'Validating stream authenticity parameters...', progress: 10, speed: '250 KB/s', eta: '4s' },
      { text: 'Authorizing backend proxy bypass nodes...', progress: 30, speed: '1.2 MB/s', eta: '3s' },
      { text: 'Contacting ytdl-core Cobalt server endpoints...', progress: 55, speed: '5.8 MB/s', eta: '2s' },
      { text: 'Extracting clean high-definition MP4 stream...', progress: 80, speed: '12.4 MB/s', eta: '1s' },
      { text: 'Syncing pipeline metadata assets to DB...', progress: 95, speed: '18.1 MB/s', eta: '0s' }
    ];

    let stageIdx = 0;
    const interval = setInterval(() => {
      if (stageIdx < stages.length) {
        const stage = stages[stageIdx];
        setCurrentStageText(stage.text);
        setDownloadProgress(stage.progress);
        setDownloadSpeed(stage.speed);
        setDownloadEta(stage.eta);
        stageIdx++;
      }
    }, 700);

    try {
      const response = await fetch('/api/download', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          url,
          videoQuality,
          isAudioOnly: downloadMode === 'audio'
        })
      });

      clearInterval(interval);

      if (!response.ok) {
        const err = await response.json().catch(() => ({}));
        throw new Error(err.error || `HTTP extraction node returned status ${response.status}`);
      }

      const data = await response.json();
      
      setDownloadProgress(100);
      setDownloadSpeed('Completed');
      setDownloadEta('0s');
      setCurrentStageText('Pipeline completely dispatched.');

      setPipelineResult(data);
      addToast('Extraction complete! Media Pipeline Dispatched.', 'success');
      
      // Update local listing
      fetchHistory();
      fetchStats();

    } catch (err: any) {
      clearInterval(interval);
      addToast(`Pipeline failed: ${err.message}`, 'error');
      setIsDownloading(false);
    }
  };

  const mapQueueResultToDownloadItem = (url: string, result: any): DownloadItem => ({
    id: `bulk-dl-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
    url: url,
    title: result.title,
    platform: result.platform,
    mode: downloadMode,
    quality: result.resolution,
    status: 'completed',
    size: result.fileSize,
    duration: result.duration,
    thumbnailUrl: result.thumbnail,
    downloadUrl: result.downloadUrl,
    createdAt: new Date().toISOString()
  });

  const handleBulkQueueSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isProcessingBulk) return;

    const urls = bulkUrlsText
      .split('\n')
      .map(line => line.trim())
      .filter(line => line.length > 0 && (line.startsWith('http://') || line.startsWith('https://')));

    if (urls.length === 0) {
      addToast('No valid URL links found in your input. Please enter valid HTTP/HTTPS links.', 'error');
      return;
    }

    addToast(`Pipelined ${urls.length} media URLs to queue.`, 'info');
    stopBulkRef.current = false;
    await runBulkQueue(urls);
  };

  const runBulkQueue = async (urls: string[]) => {
    setIsProcessingBulk(true);
    
    const newQueue: BulkQueueItem[] = urls.map((url, index) => ({
      id: `bulk-${Date.now()}-${index}-${Math.floor(Math.random()*1000)}`,
      url,
      status: 'pending',
      progress: 0,
      currentStage: 'Pending in queue...',
      speed: '0 KB/s',
      eta: '--s'
    }));

    setBulkQueue(newQueue);
    setCurrentBulkIndex(0);

    const activeQueue = [...newQueue];

    for (let i = 0; i < activeQueue.length; i++) {
      if (stopBulkRef.current) {
        addToast('Bulk queue execution stopped by operator.', 'info');
        break;
      }

      setCurrentBulkIndex(i);

      activeQueue[i] = {
        ...activeQueue[i],
        status: 'processing',
        progress: 10,
        currentStage: 'Connecting to proxy node...'
      };
      setBulkQueue([...activeQueue]);

      const stages = [
        { text: 'Validating media signatures...', progress: 20, speed: '450 KB/s', eta: '4s' },
        { text: 'Extracting secure stream link...', progress: 45, speed: '1.8 MB/s', eta: '3s' },
        { text: 'Formatting stream payload container...', progress: 75, speed: '8.2 MB/s', eta: '1s' },
        { text: 'Saving pipeline registry data...', progress: 95, speed: '15.4 MB/s', eta: '0s' }
      ];

      let stageIdx = 0;
      const progressInterval = setInterval(() => {
        if (stageIdx < stages.length) {
          const stage = stages[stageIdx];
          activeQueue[i] = {
            ...activeQueue[i],
            progress: stage.progress,
            currentStage: stage.text,
            speed: stage.speed,
            eta: stage.eta
          };
          setBulkQueue([...activeQueue]);
          stageIdx++;
        }
      }, 500);

      try {
        const response = await fetch('/api/download', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            url: activeQueue[i].url,
            videoQuality,
            isAudioOnly: downloadMode === 'audio'
          })
        });

        clearInterval(progressInterval);

        if (!response.ok) {
          const err = await response.json().catch(() => ({}));
          throw new Error(err.error || `Server extraction node failed with status ${response.status}`);
        }

        const data = await response.json();

        activeQueue[i] = {
          ...activeQueue[i],
          status: 'completed',
          progress: 100,
          currentStage: 'Pipeline resolved.',
          speed: 'Completed',
          eta: '0s',
          result: data
        };
        setBulkQueue([...activeQueue]);
        addToast(`Queue Item #${i + 1} extracted successfully!`, 'success');

        fetchHistory();
        fetchStats();

      } catch (err: any) {
        clearInterval(progressInterval);
        activeQueue[i] = {
          ...activeQueue[i],
          status: 'failed',
          progress: 100,
          currentStage: 'Pipeline failed.',
          speed: 'Failed',
          eta: '0s',
          error: err.message || 'Unknown extraction error.'
        };
        setBulkQueue([...activeQueue]);
        addToast(`Queue Item #${i + 1} failed: ${err.message}`, 'error');
      }

      if (i < activeQueue.length - 1) {
        await new Promise(resolve => setTimeout(resolve, 800));
      }
    }

    setIsProcessingBulk(false);
    stopBulkRef.current = false;
  };

  const handleStopBulkQueue = () => {
    stopBulkRef.current = true;
    setIsProcessingBulk(false);
    addToast('Stopping queue process...', 'info');
  };

  const handleResumeBulkQueue = async () => {
    if (isProcessingBulk) return;
    stopBulkRef.current = false;
    setIsProcessingBulk(true);

    const activeQueue = [...bulkQueue];

    for (let i = 0; i < activeQueue.length; i++) {
      const item = activeQueue[i];
      if (item.status === 'completed') continue;

      if (stopBulkRef.current) {
        addToast('Bulk queue execution stopped by operator.', 'info');
        break;
      }

      setCurrentBulkIndex(i);

      activeQueue[i] = {
        ...activeQueue[i],
        status: 'processing',
        progress: 10,
        currentStage: 'Connecting to proxy node...',
        error: null
      };
      setBulkQueue([...activeQueue]);

      const stages = [
        { text: 'Validating media signatures...', progress: 20, speed: '450 KB/s', eta: '4s' },
        { text: 'Extracting secure stream link...', progress: 45, speed: '1.8 MB/s', eta: '3s' },
        { text: 'Formatting stream payload container...', progress: 75, speed: '8.2 MB/s', eta: '1s' },
        { text: 'Saving pipeline registry data...', progress: 95, speed: '15.4 MB/s', eta: '0s' }
      ];

      let stageIdx = 0;
      const progressInterval = setInterval(() => {
        if (stageIdx < stages.length) {
          const stage = stages[stageIdx];
          activeQueue[i] = {
            ...activeQueue[i],
            progress: stage.progress,
            currentStage: stage.text,
            speed: stage.speed,
            eta: stage.eta
          };
          setBulkQueue([...activeQueue]);
          stageIdx++;
        }
      }, 500);

      try {
        const response = await fetch('/api/download', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            url: activeQueue[i].url,
            videoQuality,
            isAudioOnly: downloadMode === 'audio'
          })
        });

        clearInterval(progressInterval);

        if (!response.ok) {
          const err = await response.json().catch(() => ({}));
          throw new Error(err.error || `Server extraction node failed with status ${response.status}`);
        }

        const data = await response.json();

        activeQueue[i] = {
          ...activeQueue[i],
          status: 'completed',
          progress: 100,
          currentStage: 'Pipeline resolved.',
          speed: 'Completed',
          eta: '0s',
          result: data
        };
        setBulkQueue([...activeQueue]);
        addToast(`Queue Item #${i + 1} extracted successfully!`, 'success');

        fetchHistory();
        fetchStats();

      } catch (err: any) {
        clearInterval(progressInterval);
        activeQueue[i] = {
          ...activeQueue[i],
          status: 'failed',
          progress: 100,
          currentStage: 'Pipeline failed.',
          speed: 'Failed',
          eta: '0s',
          error: err.message || 'Unknown extraction error.'
        };
        setBulkQueue([...activeQueue]);
        addToast(`Queue Item #${i + 1} failed: ${err.message}`, 'error');
      }

      if (i < activeQueue.length - 1) {
        await new Promise(resolve => setTimeout(resolve, 800));
      }
    }

    setIsProcessingBulk(false);
    stopBulkRef.current = false;
  };

  const handleRetryIndividualBulkItem = async (index: number) => {
    if (isProcessingBulk) {
      addToast('Cannot retry individual item while bulk queue is running.', 'info');
      return;
    }

    const activeQueue = [...bulkQueue];
    const item = activeQueue[index];

    activeQueue[index] = {
      ...item,
      status: 'processing',
      progress: 10,
      currentStage: 'Retrying individual item...',
      error: null
    };
    setBulkQueue([...activeQueue]);

    const stages = [
      { text: 'Validating media signatures...', progress: 20, speed: '450 KB/s', eta: '4s' },
      { text: 'Extracting secure stream link...', progress: 45, speed: '1.8 MB/s', eta: '3s' },
      { text: 'Formatting stream payload container...', progress: 75, speed: '8.2 MB/s', eta: '1s' },
      { text: 'Saving pipeline registry data...', progress: 95, speed: '15.4 MB/s', eta: '0s' }
    ];

    let stageIdx = 0;
    const progressInterval = setInterval(() => {
      if (stageIdx < stages.length) {
        const stage = stages[stageIdx];
        activeQueue[index] = {
          ...activeQueue[index],
          progress: stage.progress,
          currentStage: stage.text,
          speed: stage.speed,
          eta: stage.eta
        };
        setBulkQueue([...activeQueue]);
        stageIdx++;
      }
    }, 400);

    try {
      const response = await fetch('/api/download', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          url: item.url,
          videoQuality,
          isAudioOnly: downloadMode === 'audio'
        })
      });

      clearInterval(progressInterval);

      if (!response.ok) {
        const err = await response.json().catch(() => ({}));
        throw new Error(err.error || `Server extraction node failed with status ${response.status}`);
      }

      const data = await response.json();

      activeQueue[index] = {
        ...activeQueue[index],
        status: 'completed',
        progress: 100,
        currentStage: 'Pipeline resolved.',
        speed: 'Completed',
        eta: '0s',
        result: data
      };
      setBulkQueue([...activeQueue]);
      addToast(`Individual Item #${index + 1} extracted successfully!`, 'success');

      fetchHistory();
      fetchStats();

    } catch (err: any) {
      clearInterval(progressInterval);
      activeQueue[index] = {
        ...activeQueue[index],
        status: 'failed',
        progress: 100,
        currentStage: 'Pipeline failed.',
        speed: 'Failed',
        eta: '0s',
        error: err.message || 'Unknown extraction error.'
      };
      setBulkQueue([...activeQueue]);
      addToast(`Individual Item #${index + 1} failed: ${err.message}`, 'error');
    }
  };

  // Network Tools Handlers
  const handleIpLookup = async () => {
    const ip = ipInput.trim();
    if (!ip) return;
    setIpLoading(true);
    setIpError(null);
    setIpResult(null);
    try {
      const response = await fetch('/api/ip-lookup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ip })
      });
      if (!response.ok) {
        const err = await response.json();
        throw new Error(err.error || 'Server error');
      }
      const data = await response.json();
      setIpResult(data);
      addToast(`Resolved geolocation for ${ip}`, 'success');
    } catch (e: any) {
      setIpError(e.message);
    } finally {
      setIpLoading(false);
    }
  };

  const handlePhoneLookup = async () => {
    const phone = phoneInput.trim();
    if (!phone) return;
    setPhoneLoading(true);
    setPhoneError(null);
    setPhoneResult(null);
    try {
      const response = await fetch('/api/phone-lookup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ rawNumber: phone, defaultRegion: phoneRegion })
      });
      if (!response.ok) {
        const err = await response.json();
        throw new Error(err.error || 'Server error');
      }
      const data = await response.json();
      setPhoneResult(data);
      addToast(`Analyzed phone signature carrier successfully.`, 'success');
    } catch (e: any) {
      setPhoneError(e.message);
    } finally {
      setPhoneLoading(false);
    }
  };

  const handleDnsResolve = async () => {
    const host = dnsInput.trim();
    if (!host) return;
    setDnsLoading(true);
    setDnsError(null);
    setDnsResult(null);
    try {
      const response = await fetch('/api/dns-resolve', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ hostname: host })
      });
      if (!response.ok) {
        const err = await response.json();
        throw new Error(err.error || 'Server error');
      }
      const data = await response.json();
      setDnsResult(data);
      addToast(`DNS record found: ${data.resolvedIp}`, 'success');
      // Set IP input dynamically
      setIpInput(data.resolvedIp);
    } catch (e: any) {
      setDnsError(e.message);
    } finally {
      setDnsLoading(false);
    }
  };

  // History Interactions
  const handleDeleteHistory = async (id: string) => {
    try {
      const res = await fetch('/api/delete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id })
      });
      if (res.ok) {
        addToast('Pipeline log entry deleted successfully.', 'success');
        fetchHistory();
        fetchStats();
      }
    } catch (e) {
      addToast('Failed to clear log entry.', 'error');
    }
  };

  const handleRenameHistory = (id: string, newTitle: string) => {
    setHistory(prev => prev.map(item => item.id === id ? { ...item, title: newTitle } : item));
  };

  const accentClasses = {
    blue: {
      text: 'text-[#00d2ff]',
      textMuted: 'text-cyan-400',
      bg: 'bg-cyan-500',
      border: 'border-cyan-500/30',
      borderFocus: 'focus:border-cyan-500/50',
      bgMuted: 'bg-[#0c1328]',
      shadow: 'shadow-cyan-500/5',
      shadowGlow: 'shadow-cyan-500/10',
      gradient: 'from-cyan-500 to-blue-500',
      gradientTr: 'from-cyan-500 to-blue-600',
      hoverBg: 'hover:bg-[#00ffcc] hover:text-black',
      accentBg: 'bg-cyan-500/10',
      accentBorder: 'border-cyan-500/30',
      accentText: 'text-[#00ffcc]',
      bgGradient: 'from-blue-900/10 via-cyan-950/5',
    },
    purple: {
      text: 'text-[#d946ef]',
      textMuted: 'text-fuchsia-400',
      bg: 'bg-fuchsia-500',
      border: 'border-fuchsia-500/30',
      borderFocus: 'focus:border-fuchsia-500/50',
      bgMuted: 'bg-[#1e0e29]',
      shadow: 'shadow-fuchsia-500/5',
      shadowGlow: 'shadow-fuchsia-500/10',
      gradient: 'from-fuchsia-500 to-purple-500',
      gradientTr: 'from-fuchsia-500 to-purple-600',
      hoverBg: 'hover:bg-[#f472b6] hover:text-black',
      accentBg: 'bg-fuchsia-500/10',
      accentBorder: 'border-fuchsia-500/30',
      accentText: 'text-[#f5d0fe]',
      bgGradient: 'from-purple-900/10 via-fuchsia-950/5',
    },
    orange: {
      text: 'text-[#f97316]',
      textMuted: 'text-orange-400',
      bg: 'bg-orange-500',
      border: 'border-orange-500/30',
      borderFocus: 'focus:border-orange-500/50',
      bgMuted: 'bg-[#1c0d06]',
      shadow: 'shadow-orange-500/5',
      shadowGlow: 'shadow-orange-500/10',
      gradient: 'from-orange-500 to-red-500',
      gradientTr: 'from-orange-500 to-red-600',
      hoverBg: 'hover:bg-[#fb923c] hover:text-black',
      accentBg: 'bg-orange-500/10',
      accentBorder: 'border-orange-500/30',
      accentText: 'text-[#ffedd5]',
      bgGradient: 'from-orange-900/10 via-amber-950/5',
    },
    green: {
      text: 'text-[#22c55e]',
      textMuted: 'text-emerald-400',
      bg: 'bg-emerald-500',
      border: 'border-emerald-500/30',
      borderFocus: 'focus:border-emerald-500/50',
      bgMuted: 'bg-[#051a10]',
      shadow: 'shadow-emerald-500/5',
      shadowGlow: 'shadow-emerald-500/10',
      gradient: 'from-emerald-500 to-teal-500',
      gradientTr: 'from-emerald-500 to-teal-600',
      hoverBg: 'hover:bg-[#4ade80] hover:text-black',
      accentBg: 'bg-emerald-500/10',
      accentBorder: 'border-emerald-500/30',
      accentText: 'text-[#4ade80]',
      bgGradient: 'from-emerald-900/10 via-teal-950/5',
    }
  };

  const curr = accentClasses[accentColor];

  return (
    <div className="min-h-screen bg-[#04050a] text-slate-100 flex flex-col font-sans selection:bg-[#00ffcc] selection:text-black antialiased relative overflow-x-hidden">
      
      {/* Absolute top glowing ambient header element */}
      <div className={`absolute top-0 inset-x-0 h-[550px] bg-gradient-to-b ${curr.bgGradient} to-transparent blur-3xl pointer-events-none`} />

      {/* Primary Top Header bar */}
      <header className="sticky top-0 z-40 w-full bg-[#04050a]/80 backdrop-blur-xl border-b border-slate-900/90 py-4 px-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className={`p-2 rounded-xl bg-gradient-to-tr ${curr.gradientTr} text-black shadow-lg ${curr.shadowGlow} shrink-0`}>
            <Download className="w-5 h-5 text-black" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-sm font-bold tracking-tight text-white font-mono uppercase">
                UltraProMax Downloader
              </h1>
              <span className={`text-[9px] ${curr.accentBg} border ${curr.border} ${curr.text} font-mono px-2 py-0.5 rounded-full uppercase`}>
                Full-Stack
              </span>
            </div>
            <p className="text-[10px] text-slate-500 font-mono mt-0.5">
              Production-ready media pipelines & network triggers
            </p>
          </div>
        </div>

        {/* Top-Right Telemetry Network status indicator with Accent Theme swapper */}
        <div className="flex items-center gap-3 text-[10px] font-mono">
          {/* Accent theme controller */}
          <div className="flex items-center gap-2 bg-slate-900 border border-slate-800/80 px-2.5 py-1.5 rounded-xl">
            <span className="text-[9px] uppercase text-slate-400 font-bold tracking-wider">Accent:</span>
            <div className="flex gap-1.5">
              {(['blue', 'purple', 'orange', 'green'] as const).map((color) => {
                const colorBg = color === 'blue' ? 'bg-[#00d2ff]' : color === 'purple' ? 'bg-[#d946ef]' : color === 'orange' ? 'bg-[#f97316]' : 'bg-[#22c55e]';
                const isActive = accentColor === color;
                return (
                  <button
                    key={color}
                    type="button"
                    onClick={() => {
                      setAccentColor(color);
                      addToast(`Theme accent changed to Neon ${color.charAt(0).toUpperCase() + color.slice(1)}`, 'success');
                    }}
                    className={`w-3.5 h-3.5 rounded-full ${colorBg} border transition-all hover:scale-125 active:scale-90 cursor-pointer ${
                      isActive ? 'border-white scale-110 shadow-lg ring-1 ring-white/30' : 'border-transparent opacity-60 hover:opacity-100'
                    }`}
                    title={`Neon ${color}`}
                  />
                );
              })}
            </div>
          </div>

          <div className="hidden md:flex items-center gap-1.5 text-slate-400 bg-slate-900 border border-slate-800 px-3 py-1.5 rounded-xl">
            <Cpu className={`w-3.5 h-3.5 ${curr.text}`} />
            <span>Proxy Nodes: <strong>Active</strong></span>
          </div>

          <div className="hidden md:flex items-center gap-1.5 text-slate-400 bg-slate-900 border border-slate-800 px-3 py-1.5 rounded-xl">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>Connection: <strong>SECURE</strong></span>
          </div>

          <button
            onClick={() => setIsProfileOpen(true)}
            className={`flex items-center gap-2 bg-slate-900 border border-slate-800 hover:border-slate-750 px-3 py-1.5 rounded-xl text-slate-200 hover:text-white cursor-pointer transition-all font-mono`}
          >
            <User className={`w-3.5 h-3.5 ${curr.text}`} />
            <span>Account Console</span>
          </button>
        </div>
      </header>

      {/* Main Responsive Canvas container */}
      <main className="flex-1 w-full max-w-7xl mx-auto px-4 md:px-6 py-6 flex flex-col gap-6">
        
        {/* Navigation Tabs Controller */}
        <div className="flex items-center gap-1 overflow-x-auto bg-[#070916] border border-slate-850 p-1.5 rounded-2xl w-full max-w-lg mx-auto md:mx-0 shrink-0 no-scrollbar shadow-inner">
          <button
            onClick={() => setActiveTab('downloader')}
            className={`flex-1 flex items-center justify-center gap-2 text-xs font-semibold uppercase tracking-wider py-3 px-4 rounded-xl transition-all cursor-pointer ${
              activeTab === 'downloader'
                ? `${curr.bgMuted} border ${curr.border} ${curr.text} shadow-md ${curr.shadow}`
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Download className="w-4 h-4" />
            Downloader
          </button>

          <button
            onClick={() => {
              setActiveTab('analytics');
              fetchStats();
            }}
            className={`flex-1 flex items-center justify-center gap-2 text-xs font-semibold uppercase tracking-wider py-3 px-4 rounded-xl transition-all cursor-pointer ${
              activeTab === 'analytics'
                ? `${curr.bgMuted} border ${curr.border} ${curr.text} shadow-md ${curr.shadow}`
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Activity className="w-4 h-4" />
            Dashboard
          </button>

          <button
            onClick={() => setActiveTab('network')}
            className={`flex-1 flex items-center justify-center gap-2 text-xs font-semibold uppercase tracking-wider py-3 px-4 rounded-xl transition-all cursor-pointer ${
              activeTab === 'network'
                ? `${curr.bgMuted} border ${curr.border} ${curr.text} shadow-md ${curr.shadow}`
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Globe className="w-4 h-4" />
            Network
          </button>

          <button
            onClick={() => {
              setActiveTab('history');
              fetchHistory();
            }}
            className={`flex-1 flex items-center justify-center gap-2 text-xs font-semibold uppercase tracking-wider py-3 px-4 rounded-xl transition-all cursor-pointer ${
              activeTab === 'history'
                ? `${curr.bgMuted} border ${curr.border} ${curr.text} shadow-md ${curr.shadow}`
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Clock className="w-4 h-4" />
            History
          </button>

          <button
            onClick={() => setActiveTab('admin')}
            className={`flex-1 flex items-center justify-center gap-2 text-xs font-semibold uppercase tracking-wider py-3 px-4 rounded-xl transition-all cursor-pointer ${
              activeTab === 'admin'
                ? `${curr.bgMuted} border ${curr.border} ${curr.text} shadow-md ${curr.shadow}`
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Lock className="w-4 h-4" />
            Admin
          </button>
        </div>

        {/* Tab View Panels */}
        <div className="w-full flex-1">
          
          {/* TAB 1: DOWNLOADER */}
          {activeTab === 'downloader' && (
            <div className="flex flex-col gap-6">
              
              {/* Media input and configuration panel */}
              <div className="bg-[#060814]/40 border border-slate-800/80 backdrop-blur-2xl rounded-2xl p-5 md:p-6 shadow-2xl relative">
                {/* Neon vertical line accent */}
                <div className={`absolute top-0 left-0 bottom-0 w-[2px] bg-gradient-to-b ${curr.gradient}`} />

                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-5 pb-3 border-b border-slate-900/40">
                  <div>
                    <h2 className="text-sm font-bold text-white uppercase tracking-wider font-mono flex items-center gap-2">
                      <Sparkles className={`w-4 h-4 ${curr.textMuted} animate-pulse`} />
                      Secure Universal Downloader
                    </h2>
                    <p className="text-xs text-slate-400 mt-1">
                      Bypass platform storage locks on video, slideshows, and reels using full-stack servers.
                    </p>
                  </div>

                  {/* Single/Bulk Toggle button row */}
                  <div className="flex gap-1.5 bg-slate-950/80 p-1 rounded-xl border border-slate-850 self-start sm:self-center">
                    <button
                      type="button"
                      onClick={() => setDownloaderMode('single')}
                      className={`text-[10px] font-mono font-bold uppercase tracking-wider px-3.5 py-1.5 rounded-lg transition-all cursor-pointer ${
                        downloaderMode === 'single'
                          ? `${curr.bgMuted} border ${curr.border} ${curr.text}`
                          : 'text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      Single Pipeline
                    </button>
                    <button
                      type="button"
                      onClick={() => setDownloaderMode('bulk')}
                      className={`text-[10px] font-mono font-bold uppercase tracking-wider px-3.5 py-1.5 rounded-lg transition-all cursor-pointer ${
                        downloaderMode === 'bulk'
                          ? `${curr.bgMuted} border ${curr.border} ${curr.text}`
                          : 'text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      Bulk Queue
                    </button>
                  </div>
                </div>

                {downloaderMode === 'single' ? (
                  /* Form Input URL */
                  <form onSubmit={handlePipelineSubmit} className="space-y-4">
                    <div className="flex flex-col gap-1.5">
                      <label className="text-[10px] text-slate-500 font-mono uppercase tracking-widest block font-bold">
                        Destination Stream URL Link
                      </label>
                      <div className="relative flex items-center">
                        <input
                          type="url"
                          required
                          value={downloadUrl}
                          onChange={(e) => handleUrlChange(e.target.value)}
                          placeholder="Paste TikTok, YouTube, Reels, Facebook, or Pinterest links here..."
                          className={`w-full bg-slate-900 border border-slate-850 hover:border-slate-800 ${curr.borderFocus} focus:outline-none rounded-xl py-4.5 pl-4.5 pr-28 text-xs text-slate-200 placeholder-slate-500 font-mono transition-all`}
                        />
                        <button
                          type="submit"
                          disabled={isDownloading}
                          className={`absolute right-2 px-5 py-2.5 rounded-lg ${curr.bg} ${curr.hoverBg} text-black font-bold text-xs uppercase tracking-wider transition-all hover:scale-[1.02] active:scale-[0.98] cursor-pointer disabled:opacity-50`}
                        >
                          {isDownloading ? 'Active' : 'Pipeline Link'}
                        </button>
                      </div>
                    </div>

                    {/* Downloader configurations */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                      {/* Media Type Selection */}
                      <div className="flex flex-col gap-2 p-4 bg-[#070916]/80 rounded-xl border border-slate-850">
                        <span className="text-[9px] text-slate-500 font-mono uppercase tracking-wider block font-bold">
                          Extraction Format Output
                        </span>
                        <div className="flex gap-2">
                          <button
                            type="button"
                            onClick={() => setDownloadMode('video')}
                            className={`flex-1 py-2.5 rounded-lg text-xs font-semibold border transition-all cursor-pointer ${
                              downloadMode === 'video'
                                ? 'bg-[#0a142c] border-cyan-500/40 text-cyan-400'
                                : 'bg-slate-900 border-transparent text-slate-400'
                            }`}
                          >
                            Video (MP4)
                          </button>
                          <button
                            type="button"
                            onClick={() => setDownloadMode('audio')}
                            className={`flex-1 py-2.5 rounded-lg text-xs font-semibold border transition-all cursor-pointer ${
                              downloadMode === 'audio'
                                ? 'bg-[#0a142c] border-cyan-500/40 text-cyan-400'
                                : 'bg-slate-900 border-transparent text-slate-400'
                            }`}
                          >
                            Audio (MP3)
                          </button>
                        </div>
                      </div>

                      {/* Quality Selection */}
                      <div className="flex flex-col gap-2 p-4 bg-[#070916]/80 rounded-xl border border-slate-850">
                        <span className="text-[9px] text-slate-500 font-mono uppercase tracking-wider block font-bold">
                          Target Video Quality Node
                        </span>
                        <select
                          value={videoQuality}
                          disabled={downloadMode === 'audio'}
                          onChange={(e) => setVideoQuality(e.target.value)}
                          className="w-full bg-slate-900 border border-slate-800 rounded-lg py-2.5 px-3 text-xs text-slate-300 font-mono focus:outline-none focus:border-cyan-500 disabled:opacity-40"
                        >
                          <option value="1080">1080p Ultra HD (Strict Server Proxy)</option>
                          <option value="720">720p HD Quality</option>
                          <option value="480">480p standard medium</option>
                        </select>
                      </div>
                    </div>
                  </form>
                ) : (
                  /* Bulk Form Input URL */
                  <form onSubmit={handleBulkQueueSubmit} className="space-y-4">
                    <div className="flex flex-col gap-1.5">
                      <div className="flex justify-between items-center mb-1">
                        <label className="text-[10px] text-slate-500 font-mono uppercase tracking-widest block font-bold">
                          Bulk Input: Pasted Stream URLs (one per line)
                        </label>
                        <span className="text-[9px] text-slate-400 font-mono">
                          {bulkUrlsText.split('\n').filter(l => l.trim()).length} URLs detected
                        </span>
                      </div>
                      <textarea
                        required
                        rows={5}
                        value={bulkUrlsText}
                        onChange={(e) => setBulkUrlsText(e.target.value)}
                        placeholder={`Paste multiple links here, one link per line:\nhttps://www.youtube.com/watch?v=dQw4w9WgXcQ\nhttps://www.instagram.com/reels/C89abc123/\nhttps://vt.tiktok.com/ZS234567/`}
                        className="w-full bg-[#03050c]/80 border border-slate-850 hover:border-slate-800 focus:border-cyan-500/50 focus:outline-none rounded-xl p-4 text-xs text-slate-200 placeholder-slate-600 font-mono transition-all resize-y leading-relaxed"
                      />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {/* Media Format Choice */}
                      <div className="flex flex-col gap-2 p-4 bg-[#070916]/80 rounded-xl border border-slate-850">
                        <span className="text-[9px] text-slate-500 font-mono uppercase tracking-wider block font-bold">
                          Global Format Option
                        </span>
                        <div className="flex gap-2">
                          <button
                            type="button"
                            onClick={() => setDownloadMode('video')}
                            className={`flex-1 py-2.5 rounded-lg text-xs font-semibold border transition-all cursor-pointer ${
                              downloadMode === 'video'
                                ? 'bg-[#0a142c] border-cyan-500/40 text-cyan-400'
                                : 'bg-slate-900 border-transparent text-slate-400'
                            }`}
                          >
                            Video (MP4)
                          </button>
                          <button
                            type="button"
                            onClick={() => setDownloadMode('audio')}
                            className={`flex-1 py-2.5 rounded-lg text-xs font-semibold border transition-all cursor-pointer ${
                              downloadMode === 'audio'
                                ? 'bg-[#0a142c] border-cyan-500/40 text-cyan-400'
                                : 'bg-slate-900 border-transparent text-slate-400'
                            }`}
                          >
                            Audio (MP3)
                          </button>
                        </div>
                      </div>

                      {/* Video Quality Choice */}
                      <div className="flex flex-col gap-2 p-4 bg-[#070916]/80 rounded-xl border border-slate-850">
                        <span className="text-[9px] text-slate-500 font-mono uppercase tracking-wider block font-bold">
                          Global Video Quality Node
                        </span>
                        <select
                          value={videoQuality}
                          disabled={downloadMode === 'audio'}
                          onChange={(e) => setVideoQuality(e.target.value)}
                          className="w-full bg-slate-900 border border-slate-800 rounded-lg py-2.5 px-3 text-xs text-slate-300 font-mono focus:outline-none focus:border-cyan-500 disabled:opacity-40"
                        >
                          <option value="1080">1080p Ultra HD</option>
                          <option value="720">720p HD Quality</option>
                          <option value="480">480p standard medium</option>
                        </select>
                      </div>
                    </div>

                    <div className="flex justify-between items-center pt-2">
                      <div className="flex gap-2">
                        {/* Preset bulk loaders */}
                        <button
                          type="button"
                          onClick={() => {
                            setBulkUrlsText([
                              'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
                              'https://www.tiktok.com/@tiktok/video/7123456789123456789',
                              'https://www.instagram.com/reels/C89abc123/'
                            ].join('\n'));
                            addToast('Loaded bulk demo URLs', 'info');
                          }}
                          className="px-3 py-1.5 rounded-lg border border-slate-850 text-slate-400 hover:text-white transition-all text-[9px] font-mono uppercase font-bold cursor-pointer"
                        >
                          Load Demo List
                        </button>
                      </div>
                      <div className="flex gap-3">
                        {bulkUrlsText.trim() && (
                          <button
                            type="button"
                            onClick={() => setBulkUrlsText('')}
                            className="px-4 py-2.5 rounded-xl border border-slate-800 text-slate-400 hover:text-white transition-all text-xs uppercase tracking-wider font-bold cursor-pointer"
                          >
                            Clear Text
                          </button>
                        )}
                        <button
                          type="submit"
                          disabled={isProcessingBulk}
                          className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-500 text-black hover:from-[#00ffcc] hover:to-cyan-400 font-bold text-xs uppercase tracking-wider transition-all hover:scale-[1.02] active:scale-[0.98] cursor-pointer disabled:opacity-50"
                        >
                          {isProcessingBulk ? 'Processing Queue...' : 'Start Bulk Queue'}
                        </button>
                      </div>
                    </div>
                  </form>
                )}
              </div>

              {/* Single Mode Real-time downloading progress status visualizer */}
              {downloaderMode === 'single' && isDownloading && (
                <div className={`w-full bg-[#060814]/70 border ${curr.borderMuted} rounded-2xl p-5 backdrop-blur-xl relative overflow-hidden animate-fade-in`}>
                  <div className={`absolute inset-0 bg-gradient-to-r ${curr.accentBg} to-transparent pointer-events-none`} />
                  
                  <div className="flex items-center justify-between mb-3 text-xs">
                    <span className={`font-mono font-semibold ${curr.accentText} uppercase tracking-wide flex items-center gap-2`}>
                      <span className={`w-2 h-2 rounded-full ${curr.bg} animate-ping`} />
                      {currentStageText}
                    </span>
                    <span className={`font-mono ${curr.textMuted} font-bold`}>{downloadProgress}%</span>
                  </div>

                  {/* Real progress bar */}
                  <div className="w-full h-3 bg-slate-900 border border-slate-850 p-0.5 rounded-full overflow-hidden mb-3">
                    <div 
                      className={`h-full rounded-full bg-gradient-to-r ${curr.gradient} to-emerald-400 shadow-[0_0_12px_rgba(var(--accent-primary-rgb),0.5)] transition-all duration-300`}
                      style={{ width: `${downloadProgress}%` }}
                    />
                  </div>

                  {/* Operational stats row */}
                  <div className="grid grid-cols-3 gap-2 text-[9px] font-mono text-slate-400">
                    <div>
                      Pipe Speed: <strong className="text-white">{downloadSpeed}</strong>
                    </div>
                    <div>
                      ETA: <strong className="text-white">{downloadEta}</strong>
                    </div>
                    <div className="text-right">
                      Node Load: <strong className="text-emerald-400">ONLINE</strong>
                    </div>
                  </div>
                </div>
              )}

              {/* Bulk Mode Queue Status Dashboard Panel */}
              {downloaderMode === 'bulk' && bulkQueue.length > 0 && (
                <div className="bg-[#060814]/40 border border-slate-800/80 backdrop-blur-2xl rounded-2xl p-5 shadow-2xl relative overflow-hidden animate-fade-in">
                  {/* Neon header accent line */}
                  <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-cyan-500 to-purple-500" />
                  
                  {/* Dashboard Header */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4 pb-4 border-b border-slate-900/40">
                    <div>
                      <h3 className="text-xs font-bold text-white uppercase tracking-wider font-mono flex items-center gap-2">
                        <Database className="w-4 h-4 text-cyan-400" />
                        Bulk Pipeline Queue Manager
                      </h3>
                      <p className="text-[10px] text-slate-400 mt-0.5">
                        Extracted {bulkQueue.filter(q => q.status === 'completed').length} / {bulkQueue.length} streams successfully.
                      </p>
                    </div>

                    {/* Operational controls */}
                    <div className="flex items-center gap-2">
                      {isProcessingBulk ? (
                        <button
                          type="button"
                          onClick={handleStopBulkQueue}
                          className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-red-500/10 border border-red-500/30 hover:bg-red-500/20 text-red-400 font-mono text-[10px] uppercase font-bold tracking-wider cursor-pointer transition-all"
                        >
                          <Square className="w-3.5 h-3.5 fill-red-400 text-red-400 animate-pulse" />
                          Stop Queue
                        </button>
                      ) : (
                        <>
                          {bulkQueue.some(q => q.status !== 'completed') && (
                            <button
                              type="button"
                              onClick={handleResumeBulkQueue}
                              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-emerald-500/10 border border-emerald-500/30 hover:bg-emerald-500/20 text-emerald-400 font-mono text-[10px] uppercase font-bold tracking-wider cursor-pointer transition-all"
                            >
                              <Play className="w-3.5 h-3.5 fill-emerald-400 text-emerald-400" />
                              Resume Queue
                            </button>
                          )}
                          <button
                            type="button"
                            onClick={() => setBulkQueue([])}
                            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-slate-950 hover:bg-slate-900 border border-slate-850 text-slate-400 font-mono text-[10px] uppercase font-bold tracking-wider cursor-pointer transition-all"
                          >
                            <Trash2 className="w-3.5 h-3.5 text-slate-400" />
                            Clear Queue
                          </button>
                        </>
                      )}
                    </div>
                  </div>

                  {/* Overall Cumulative Progress Bar */}
                  {(() => {
                    const completed = bulkQueue.filter(q => q.status === 'completed').length;
                    const failed = bulkQueue.filter(q => q.status === 'failed').length;
                    const processedCount = completed + failed;
                    const totalCount = bulkQueue.length;
                    const pct = totalCount > 0 ? Math.round((processedCount / totalCount) * 100) : 0;
                    
                    return (
                      <div className="mb-5 bg-slate-950 p-4 rounded-xl border border-slate-850">
                        <div className="flex justify-between items-center mb-1 text-[10px] font-mono text-slate-400">
                          <span>Cumulative Extraction Progress</span>
                          <span className="font-bold text-white">
                            {completed} Succeeded / {failed} Failed ({pct}%)
                          </span>
                        </div>
                        <div className="w-full h-2.5 bg-slate-900 border border-slate-850 p-0.5 rounded-full overflow-hidden">
                          <div 
                            className="h-full rounded-full bg-gradient-to-r from-blue-500 via-cyan-400 to-emerald-400 transition-all duration-300"
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                      </div>
                    );
                  })()}

                  {/* Scrollable list of Queue URLs */}
                  <div className="max-h-80 overflow-y-auto space-y-2 pr-1 no-scrollbar">
                    {bulkQueue.map((item, idx) => {
                      const isProcessing = item.status === 'processing';
                      const isCompleted = item.status === 'completed';
                      const isFailed = item.status === 'failed';
                      const isPending = item.status === 'pending';
                      
                      // Platform matching from url
                      let platformName = "Universal";
                      const u = item.url.toLowerCase();
                      if (u.includes("tiktok.com")) platformName = "TikTok";
                      else if (u.includes("instagram.com")) platformName = "Instagram";
                      else if (u.includes("facebook.com") || u.includes("fb.watch")) platformName = "Facebook";
                      else if (u.includes("x.com") || u.includes("twitter.com")) platformName = "Twitter/X";
                      else if (u.includes("youtube.com") || u.includes("youtu.be")) platformName = "YouTube";
                      else if (u.includes("pinterest.com")) platformName = "Pinterest";
                      else if (u.includes("capcut.com")) platformName = "CapCut";
                      else if (u.includes("reddit.com")) platformName = "Reddit";
                      else if (u.includes("likee.video") || u.includes("likee.com")) platformName = "Likee";

                      return (
                        <div 
                          key={item.id} 
                          className={`p-3.5 rounded-xl border transition-all ${
                            isProcessing 
                              ? 'bg-[#0d162a]/90 border-cyan-500/40 shadow-md shadow-cyan-500/5' 
                              : isCompleted 
                              ? 'bg-emerald-500/5 border-emerald-500/20' 
                              : isFailed 
                              ? 'bg-rose-500/5 border-rose-500/20' 
                              : 'bg-[#03050c]/50 border-slate-850'
                          }`}
                        >
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                            <div className="flex items-start gap-2.5 min-w-0 flex-1">
                              {/* Index tag */}
                              <span className="text-[9px] font-mono text-slate-500 bg-slate-900/80 px-1.5 py-0.5 rounded border border-slate-850 self-start mt-0.5 shrink-0">
                                {idx + 1}
                              </span>

                              {/* Details */}
                              <div className="min-w-0 flex-1">
                                <div className="flex flex-wrap items-center gap-1.5 mb-1">
                                  <span className={`text-[8px] font-mono uppercase font-bold px-1.5 py-0.5 rounded shrink-0 ${
                                    platformName === 'TikTok' ? 'bg-pink-500/10 text-pink-400 border border-pink-500/20' :
                                    platformName === 'YouTube' ? 'bg-red-500/10 text-red-400 border border-red-500/20' :
                                    platformName === 'Instagram' ? 'bg-purple-500/10 text-purple-400 border border-purple-500/20' :
                                    'bg-slate-900 text-slate-400 border border-slate-800'
                                  }`}>
                                    {platformName}
                                  </span>
                                  <span className="text-[10px] text-slate-300 font-mono truncate select-all">
                                    {item.url}
                                  </span>
                                </div>

                                {isProcessing && (
                                  <div className="text-[9px] font-mono text-[#00ffcc] flex items-center gap-1.5 mt-1 animate-pulse">
                                    <Loader2 className="w-3 h-3 animate-spin" />
                                    <span>{item.currentStage || 'Extracting media streams...'}</span>
                                    <span className="text-slate-500">|</span>
                                    <span>{item.speed}</span>
                                    <span className="text-slate-500">|</span>
                                    <span>ETA: {item.eta}</span>
                                  </div>
                                )}

                                {isCompleted && (
                                  <div className="text-[10px] font-mono text-slate-400 mt-1 select-all">
                                    Resolved: <span className="text-emerald-400 font-semibold">{item.result?.title}</span>
                                    <span className="text-slate-600 mx-1.5">•</span>
                                    <span>{item.result?.fileSize}</span>
                                    <span className="text-slate-600 mx-1.5">•</span>
                                    <span>{item.result?.resolution}</span>
                                  </div>
                                )}

                                {isFailed && (
                                  <div className="text-[9px] font-mono text-rose-400 flex items-center gap-1 mt-1">
                                    <XCircle className="w-3.5 h-3.5 shrink-0" />
                                    <span className="truncate">Error: {item.error || 'Server stream bypass failed.'}</span>
                                  </div>
                                )}

                                {isPending && (
                                  <div className="text-[9px] font-mono text-slate-500 mt-1 flex items-center gap-1.5">
                                    <span className="w-1.5 h-1.5 rounded-full bg-slate-600 animate-ping" />
                                    <span>Pending in pipeline queue...</span>
                                  </div>
                                )}
                              </div>
                            </div>

                            {/* Actions on Item */}
                            <div className="flex items-center gap-1.5 shrink-0 self-end sm:self-center pl-7 sm:pl-0">
                              {isProcessing && (
                                <div className="text-[10px] font-mono text-cyan-400 font-bold px-2.5 py-1 rounded-lg bg-cyan-500/5 border border-cyan-500/20">
                                  {item.progress}%
                                </div>
                              )}

                              {isCompleted && item.result && (
                                <>
                                  <button
                                    type="button"
                                    onClick={() => {
                                      const mappedItem = mapQueueResultToDownloadItem(item.url, item.result);
                                      setActivePreviewItem(mappedItem);
                                      addToast(`Opening live client player for: ${item.result.title}`, 'info');
                                    }}
                                    className="px-2.5 py-1 rounded text-[10px] font-mono font-bold uppercase tracking-wider bg-cyan-500/10 border border-cyan-500/20 text-[#00d2ff] hover:bg-cyan-500/20 transition-all cursor-pointer"
                                  >
                                    Preview
                                  </button>
                                  <a
                                    href={`/api/proxy-download?url=${encodeURIComponent(item.result.downloadUrl)}&title=${encodeURIComponent(item.result.title)}`}
                                    target="_blank"
                                    rel="noreferrer referrer"
                                    className="px-2.5 py-1 rounded text-[10px] font-mono font-bold uppercase tracking-wider bg-emerald-500/10 border border-emerald-500/20 text-[#00ffcc] hover:bg-emerald-500/20 transition-all cursor-pointer block"
                                  >
                                    Get Media
                                  </a>
                                </>
                              )}

                              {isFailed && (
                                <button
                                  type="button"
                                  disabled={isProcessingBulk}
                                  onClick={() => handleRetryIndividualBulkItem(idx)}
                                  className="px-2.5 py-1 rounded text-[10px] font-mono font-bold uppercase tracking-wider bg-rose-500/10 border border-rose-500/20 text-rose-400 hover:bg-rose-500/20 transition-all cursor-pointer disabled:opacity-45"
                                >
                                  Retry Item
                                </button>
                              )}
                            </div>
                          </div>

                          {/* Individual queue progress bar */}
                          {isProcessing && (
                            <div className="w-full h-1 bg-slate-950 rounded-full overflow-hidden mt-3">
                              <div 
                                className="h-full bg-gradient-to-r from-cyan-500 to-blue-500 transition-all duration-300"
                                style={{ width: `${item.progress}%` }}
                              />
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Finished Media Pipeline details display */}
              {downloaderMode === 'single' && pipelineResult && (
                <MediaPipelineResult
                  result={pipelineResult}
                  onClear={() => setPipelineResult(null)}
                  onDelete={handleDeleteHistory}
                  addToast={addToast}
                />
              )}

              {/* Grid bento layout of supported channels selector */}
              <SupportedPlatforms
                selectedPlatform={selectedPlatform}
                setSelectedPlatform={setSelectedPlatform}
                onUrlExampleClick={handleExampleLoad}
              />
            </div>
          )}

          {/* TAB 2: ANALYTICS & STATS */}
          {activeTab === 'analytics' && (
            <div className="w-full">
              <DashboardStats stats={systemStats} />
            </div>
          )}

          {/* TAB 3: NETWORK TOOLS IP/PHONE/DNS */}
          {activeTab === 'network' && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
              
              {/* Left sidebar: sub-menu controls */}
              <div className="lg:col-span-3 flex lg:flex-col gap-2">
                <button
                  onClick={() => setNetworkSubTab('ip')}
                  className={`flex-1 lg:flex-initial text-left text-xs uppercase tracking-wider font-semibold py-3 px-4 rounded-xl border transition-all flex items-center gap-3 cursor-pointer ${
                    networkSubTab === 'ip'
                      ? `${curr.accentBg} ${curr.accentBorder} ${curr.text} shadow-md`
                      : 'bg-[#060814]/30 border-slate-850 text-slate-400 hover:text-white hover:border-slate-800'
                  }`}
                >
                  <MapPin className={`w-4 h-4 ${curr.text}`} />
                  IP Lookup Node
                </button>

                <button
                  onClick={() => setNetworkSubTab('phone')}
                  className={`flex-1 lg:flex-initial text-left text-xs uppercase tracking-wider font-semibold py-3 px-4 rounded-xl border transition-all flex items-center gap-3 cursor-pointer ${
                    networkSubTab === 'phone'
                      ? `${curr.accentBg} ${curr.accentBorder} ${curr.text} shadow-md`
                      : 'bg-[#060814]/30 border-slate-850 text-slate-400 hover:text-white hover:border-slate-800'
                  }`}
                >
                  <Phone className={`w-4 h-4 ${curr.text}`} />
                  Phone Carrier Look
                </button>

                <button
                  onClick={() => setNetworkSubTab('dns')}
                  className={`flex-1 lg:flex-initial text-left text-xs uppercase tracking-wider font-semibold py-3 px-4 rounded-xl border transition-all flex items-center gap-3 cursor-pointer ${
                    networkSubTab === 'dns'
                      ? `${curr.accentBg} ${curr.accentBorder} ${curr.text} shadow-md`
                      : 'bg-[#060814]/30 border-slate-850 text-slate-400 hover:text-white hover:border-slate-800'
                  }`}
                >
                  <Globe className={`w-4 h-4 ${curr.text}`} />
                  DNS Resolver
                </button>
              </div>

              {/* Right Panel container content */}
              <div className="lg:col-span-9 bg-[#060814]/40 border border-slate-800/80 rounded-2xl p-5 md:p-6 backdrop-blur-xl shadow-2xl">
                
                {/* 1. IP Lookup panel */}
                {networkSubTab === 'ip' && (
                  <div className="space-y-5">
                    <div>
                      <h3 className="text-sm font-bold text-white uppercase tracking-wider font-mono">
                        ISP IP Geolocation Coordinate Lookup
                      </h3>
                      <p className="text-xs text-slate-400 mt-1">
                        Identify autonomous system routing nodes and real physical location of active clients.
                      </p>
                    </div>

                    <div className="flex gap-2">
                      <input
                        type="text"
                        placeholder="e.g. 8.8.8.8..."
                        value={ipInput}
                        onChange={(e) => setIpInput(e.target.value)}
                        className={`flex-1 bg-slate-900 border border-slate-800 ${curr.borderFocus} focus:outline-none py-3 px-4 rounded-xl text-xs text-slate-200 font-mono`}
                      />
                      <button
                        onClick={handleIpLookup}
                        disabled={ipLoading}
                        className={`px-5 py-3 rounded-xl ${curr.bg} text-black ${curr.hoverBg} text-xs uppercase tracking-wider font-bold transition-all hover:scale-105 active:scale-95 cursor-pointer`}
                      >
                        {ipLoading ? 'Lookup...' : 'Query'}
                      </button>
                    </div>

                    {ipError && (
                      <div className="p-3.5 bg-rose-500/10 border border-rose-500/20 text-rose-400 rounded-xl text-xs font-mono">
                        Error: {ipError}
                      </div>
                    )}

                    {ipResult && (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t border-slate-900 font-mono text-xs">
                        <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-850 flex justify-between">
                          <span className="text-slate-500">Target IP</span>
                          <strong className="text-white">{ipResult.ip}</strong>
                        </div>
                        <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-850 flex justify-between">
                          <span className="text-slate-500">Autonomous ISP</span>
                          <strong className="text-white text-right ml-2 line-clamp-1">{ipResult.isp}</strong>
                        </div>
                        <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-850 flex justify-between">
                          <span className="text-slate-500">Region Name</span>
                          <strong className="text-[#00ffcc]">{ipResult.region || 'N/A'}</strong>
                        </div>
                        <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-850 flex justify-between">
                          <span className="text-slate-500">City / Postal</span>
                          <strong className="text-[#00ffcc]">{ipResult.city || 'N/A'} ({ipResult.postal})</strong>
                        </div>
                        <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-850 flex justify-between">
                          <span className="text-slate-500">Country Location</span>
                          <strong className="text-cyan-400">{ipResult.country} ({ipResult.country_code})</strong>
                        </div>
                        <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-850 flex justify-between">
                          <span className="text-slate-500">Timezone Context</span>
                          <strong className="text-slate-300">{ipResult.timezone}</strong>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* 2. Phone Lookup panel */}
                {networkSubTab === 'phone' && (
                  <div className="space-y-5">
                    <div>
                      <h3 className="text-sm font-bold text-white uppercase tracking-wider font-mono">
                        Indonesian carrier phone lookup signature
                      </h3>
                      <p className="text-xs text-slate-400 mt-1">
                        Parse prefix routing structures to match cellular providers.
                      </p>
                    </div>

                    <div className="flex flex-col sm:flex-row gap-3">
                      <select
                        value={phoneRegion}
                        onChange={(e) => setPhoneRegion(e.target.value)}
                        className={`bg-slate-900 border border-slate-800 text-xs text-slate-300 font-mono py-3 px-4 rounded-xl focus:outline-none ${curr.borderFocus} shrink-0`}
                      >
                        <option value="ID">Indonesia (+62)</option>
                        <option value="US">USA (+1)</option>
                        <option value="MY">Malaysia (+60)</option>
                        <option value="SG">Singapore (+65)</option>
                      </select>

                      <input
                        type="tel"
                        placeholder="e.g. 08123456789..."
                        value={phoneInput}
                        onChange={(e) => setPhoneInput(e.target.value)}
                        className={`flex-1 bg-slate-900 border border-slate-800 focus:outline-none ${curr.borderFocus} py-3 px-4 rounded-xl text-xs text-slate-200 font-mono`}
                      />

                      <button
                        onClick={handlePhoneLookup}
                        disabled={phoneLoading}
                        className={`px-5 py-3 rounded-xl ${curr.bg} text-black ${curr.hoverBg} text-xs uppercase tracking-wider font-bold transition-all hover:scale-105 active:scale-95 cursor-pointer shrink-0`}
                      >
                        {phoneLoading ? 'Analyzing...' : 'Analyze'}
                      </button>
                    </div>

                    {phoneError && (
                      <div className="p-3.5 bg-rose-500/10 border border-rose-500/20 text-rose-400 rounded-xl text-xs font-mono">
                        Error: {phoneError}
                      </div>
                    )}

                    {phoneResult && (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t border-slate-900 font-mono text-xs">
                        <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-850 flex justify-between">
                          <span className="text-slate-500">Original Dial</span>
                          <strong className="text-white">{phoneResult.input}</strong>
                        </div>
                        <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-850 flex justify-between">
                          <span className="text-slate-500">Carrier Provider</span>
                          <strong className="text-[#00ffcc] text-right ml-2 line-clamp-1">{phoneResult.carrier}</strong>
                        </div>
                        <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-850 flex justify-between">
                          <span className="text-slate-500">International Dial</span>
                          <strong className="text-[#00d2ff]">{phoneResult.international}</strong>
                        </div>
                        <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-850 flex justify-between">
                          <span className="text-slate-500">National Form</span>
                          <strong className="text-white">{phoneResult.national}</strong>
                        </div>
                        <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-850 flex justify-between">
                          <span className="text-slate-500">ISO Country Code</span>
                          <strong className="text-cyan-400">{phoneResult.region_code}</strong>
                        </div>
                        <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-850 flex justify-between">
                          <span className="text-slate-500">Line Type Signal</span>
                          <strong className="text-slate-300 uppercase">{phoneResult.type}</strong>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* 3. DNS Resolver panel */}
                {networkSubTab === 'dns' && (
                  <div className="space-y-5">
                    <div>
                      <h3 className="text-sm font-bold text-white uppercase tracking-wider font-mono">
                        Authoritative DNS IP records resolution
                      </h3>
                      <p className="text-xs text-slate-400 mt-1">
                        Lookup host IP binding allocations from node server socket.
                      </p>
                    </div>

                    <div className="flex gap-2">
                      <input
                        type="text"
                        placeholder="e.g. google.com..."
                        value={dnsInput}
                        onChange={(e) => setDnsInput(e.target.value)}
                        className={`flex-1 bg-slate-900 border border-slate-800 focus:outline-none ${curr.borderFocus} py-3 px-4 rounded-xl text-xs text-slate-200 font-mono`}
                      />
                      <button
                        onClick={handleDnsResolve}
                        disabled={dnsLoading}
                        className={`px-5 py-3 rounded-xl ${curr.bg} text-black ${curr.hoverBg} text-xs uppercase tracking-wider font-bold transition-all hover:scale-105 active:scale-95 cursor-pointer`}
                      >
                        {dnsLoading ? 'Resolving...' : 'Resolve'}
                      </button>
                    </div>

                    {dnsError && (
                      <div className="p-3.5 bg-rose-500/10 border border-rose-500/20 text-rose-400 rounded-xl text-xs font-mono">
                        Error: {dnsError}
                      </div>
                    )}

                    {dnsResult && (
                      <div className="space-y-4 pt-4 border-t border-slate-900 font-mono text-xs">
                        <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-855 flex justify-between items-center">
                          <span className="text-slate-500 text-[10px] uppercase">Resolved Server A Record</span>
                          <strong className="text-[#00ffcc] text-sm">{dnsResult.resolvedIp}</strong>
                        </div>

                        {/* Details log block */}
                        <div className="p-4 rounded-xl bg-black border border-slate-850">
                          <span className="text-[9px] text-slate-500 block uppercase tracking-wider mb-2">
                            Socket Response Records Map
                          </span>
                          <div className="space-y-2">
                            {dnsResult.details?.map((detail: any, index: number) => (
                              <div key={index} className="flex justify-between text-[11px] text-slate-300 border-b border-slate-900 pb-1">
                                <span>Record [{index}]</span>
                                <span className="text-cyan-400 font-semibold">{detail.data || detail}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 4: DOWNLOAD HISTORY */}
          {activeTab === 'history' && (
            <div className="w-full">
              <HistorySection
                history={history}
                onDelete={handleDeleteHistory}
                onRename={handleRenameHistory}
                onPreviewClick={setActivePreviewItem}
                onConvertClick={(item) => {
                  setSelectedOpsItem(item);
                  setIsOpsOpen(true);
                }}
                addToast={addToast}
              />
            </div>
          )}

          {/* TAB 5: ADMIN SYSTEM PANEL OVERRIDES */}
          {activeTab === 'admin' && (
            <div className="w-full">
              <AdminPanel
                history={history}
                onDeleteHistoryItem={handleDeleteHistory}
                addToast={addToast}
              />
            </div>
          )}

        </div>
      </main>

      {/* Footer bar */}
      <footer className="w-full border-t border-slate-950 py-5 text-center mt-auto text-[10px] text-slate-600 font-mono">
        <p>© 2026 ULTRAPROMAX CORE PLATFORM NODES. ALL CHANNELS SECURED VIA BYPASS PROXIES.</p>
      </footer>

      {/* Floating dynamic premium toast containers */}
      <Toast toasts={toasts} removeToast={removeToast} />

      {/* Absolute floating video player popup module */}
      {activePreviewItem && (
        <VideoPlayerModal
          item={activePreviewItem}
          onClose={() => setActivePreviewItem(null)}
        />
      )}

      {/* Cyberpunk Account Console and Plan Upgrade Portal */}
      <UserProfileModal
        isOpen={isProfileOpen}
        onClose={() => setIsProfileOpen(false)}
        accentColor={accentColor}
        addToast={addToast}
      />

      {/* Media Processing Operations Tool (MP3 Extract, GIF Converter, Compressor, Subtitles) */}
      <MediaOperationsModal
        isOpen={isOpsOpen}
        onClose={() => {
          setIsOpsOpen(false);
          setSelectedOpsItem(null);
        }}
        mediaItem={selectedOpsItem}
        accentColor={accentColor}
        addToast={addToast}
      />

    </div>
  );
}
