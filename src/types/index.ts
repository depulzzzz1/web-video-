export interface DownloadItem {
  id: string;
  url: string;
  title: string;
  platform: string;
  mode: 'video' | 'audio';
  quality: string;
  status: 'pending' | 'downloading' | 'completed' | 'failed';
  size: string;
  duration?: string;
  fps?: number;
  codec?: string;
  audioCodec?: string;
  thumbnailUrl?: string;
  downloadUrl: string;
  createdAt: string;
  processingTimeMs?: number;
  downloadSpeed?: string;
}

export interface SystemStats {
  totalDownloads: number;
  totalUsers: number;
  storageUsedBytes: number;
  bandwidthBytes: number;
  todaysDownloads: number;
  mostPopularPlatform: string;
  platformStats: Record<string, number>;
}

export interface ServerLog {
  id: string;
  timestamp: string;
  level: 'info' | 'warn' | 'error' | 'success';
  message: string;
}

export interface UserSession {
  id: string;
  username: string;
  role: 'admin' | 'user';
  createdAt: string;
}

export interface ApiKey {
  id: string;
  key: string;
  name: string;
  clicks: number;
  limit: number;
  status: 'active' | 'revoked';
  createdAt: string;
}
