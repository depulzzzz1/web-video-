import fs from 'fs';
import path from 'path';
import { DownloadItem, SystemStats, ApiKey, ServerLog } from '../types';

const DB_FILE = path.join(process.cwd(), 'database.json');

interface DatabaseSchema {
  users: Array<{ id: string; username: string; role: 'admin' | 'user'; createdAt: string }>;
  history: DownloadItem[];
  logs: ServerLog[];
  apiKeys: ApiKey[];
  analytics: {
    bandwidthBytes: number;
    totalVisits: number;
    platformClicks: Record<string, number>;
  };
}

const DEFAULT_DB: DatabaseSchema = {
  users: [
    { id: 'usr-1', username: 'admin', role: 'admin', createdAt: new Date().toISOString() },
    { id: 'usr-2', username: 'guest_user', role: 'user', createdAt: new Date().toISOString() }
  ],
  history: [
    {
      id: 'dl-1',
      url: 'https://www.tiktok.com/@khaby.lame/video/1234567890',
      title: 'Khaby Lame - Life hacks debunked series #18',
      platform: 'TikTok',
      mode: 'video',
      quality: '1080p',
      status: 'completed',
      size: '14.2 MB',
      duration: '00:45',
      fps: 30,
      codec: 'h264',
      audioCodec: 'aac',
      thumbnailUrl: 'https://images.unsplash.com/photo-1611162617213-7d7a39e9b1d7?w=150',
      downloadUrl: 'https://sample-videos.com/video321/mp4/720/big_buck_bunny_720p_5mb.mp4',
      createdAt: new Date(Date.now() - 3600000 * 2).toISOString(),
      processingTimeMs: 1450,
      downloadSpeed: '12.4 MB/s'
    },
    {
      id: 'dl-2',
      url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
      title: 'Rick Astley - Never Gonna Give You Up (Video)',
      platform: 'YouTube',
      mode: 'video',
      quality: '720p',
      status: 'completed',
      size: '18.4 MB',
      duration: '03:32',
      fps: 24,
      codec: 'vp9',
      audioCodec: 'opus',
      thumbnailUrl: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=150',
      downloadUrl: 'https://sample-videos.com/video321/mp4/720/big_buck_bunny_720p_5mb.mp4',
      createdAt: new Date(Date.now() - 3600000 * 4).toISOString(),
      processingTimeMs: 2100,
      downloadSpeed: '8.4 MB/s'
    }
  ],
  logs: [
    { id: 'log-1', timestamp: new Date().toISOString(), level: 'success', message: 'Database initialized successfully.' },
    { id: 'log-2', timestamp: new Date().toISOString(), level: 'info', message: 'Cyber-Dark telemetry server online.' }
  ],
  apiKeys: [
    { id: 'key-1', key: 'UPM_CYBER_ACC_A9F82', name: 'Production Main App', clicks: 42, limit: 1000, status: 'active', createdAt: new Date().toISOString() },
    { id: 'key-2', key: 'UPM_DEV_STAGING_X2B1', name: 'Staging Environment', clicks: 5, limit: 100, status: 'active', createdAt: new Date().toISOString() }
  ],
  analytics: {
    bandwidthBytes: 1542000000, // ~1.5 GB
    totalVisits: 254,
    platformClicks: {
      'TikTok': 28,
      'YouTube': 15,
      'Instagram': 22,
      'Facebook': 8,
      'Twitter/X': 12
    }
  }
};

class JSONDatabase {
  private data: DatabaseSchema;

  constructor() {
    this.data = this.load();
  }

  private load(): DatabaseSchema {
    try {
      if (fs.existsSync(DB_FILE)) {
        const raw = fs.readFileSync(DB_FILE, 'utf-8');
        return JSON.parse(raw);
      }
    } catch (e) {
      console.error('Error reading database file, resetting to defaults:', e);
    }
    this.save(DEFAULT_DB);
    return DEFAULT_DB;
  }

  private save(newData: DatabaseSchema) {
    try {
      fs.writeFileSync(DB_FILE, JSON.stringify(newData, null, 2), 'utf-8');
    } catch (e) {
      console.error('Failed to write database file:', e);
    }
  }

  // --- QUERY INTERFACES (PRISMA STYLE EMULATOR) ---
  
  public history = {
    findMany: (filter?: { query?: string; platform?: string }) => {
      let items = [...this.data.history];
      if (filter) {
        if (filter.platform && filter.platform !== 'All') {
          items = items.filter(item => item.platform.toLowerCase() === filter.platform!.toLowerCase());
        }
        if (filter.query) {
          const q = filter.query.toLowerCase();
          items = items.filter(item => 
            item.title.toLowerCase().includes(q) || 
            item.platform.toLowerCase().includes(q) ||
            item.url.toLowerCase().includes(q)
          );
        }
      }
      // Sort newest first
      return items.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    },
    create: (item: DownloadItem) => {
      this.data.history.unshift(item);
      this.save(this.data);
      this.analytics.incrementPlatformClick(item.platform);
      return item;
    },
    delete: (id: string) => {
      const initialLength = this.data.history.length;
      this.data.history = this.data.history.filter(item => item.id !== id);
      const deleted = initialLength !== this.data.history.length;
      if (deleted) {
        this.save(this.data);
      }
      return deleted;
    },
    update: (id: string, updates: Partial<DownloadItem>) => {
      const index = this.data.history.findIndex(item => item.id === id);
      if (index !== -1) {
        this.data.history[index] = { ...this.data.history[index], ...updates };
        this.save(this.data);
        return this.data.history[index];
      }
      return null;
    }
  };

  public logs = {
    findMany: () => {
      return this.data.logs.slice(-100); // Limit to last 100
    },
    create: (level: 'info' | 'warn' | 'error' | 'success', message: string) => {
      const logLine: ServerLog = {
        id: `log-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
        timestamp: new Date().toISOString(),
        level,
        message
      };
      this.data.logs.push(logLine);
      if (this.data.logs.length > 200) {
        this.data.logs.shift();
      }
      this.save(this.data);
      return logLine;
    }
  };

  public apiKeys = {
    findMany: () => {
      return this.data.apiKeys;
    },
    create: (name: string, limit: number = 1000) => {
      const newKey: ApiKey = {
        id: `key-${Date.now()}`,
        key: `UPM_KEY_${Math.random().toString(36).substring(2, 7).toUpperCase()}`,
        name,
        clicks: 0,
        limit,
        status: 'active',
        createdAt: new Date().toISOString()
      };
      this.data.apiKeys.push(newKey);
      this.save(this.data);
      return newKey;
    },
    revoke: (id: string) => {
      const key = this.data.apiKeys.find(k => k.id === id);
      if (key) {
        key.status = 'revoked';
        this.save(this.data);
        return key;
      }
      return null;
    },
    incrementUsage: (keyString: string) => {
      const key = this.data.apiKeys.find(k => k.key === keyString);
      if (key && key.status === 'active') {
        key.clicks++;
        this.save(this.data);
        return true;
      }
      return false;
    }
  };

  public users = {
    findMany: () => {
      return this.data.users;
    },
    create: (username: string, role: 'admin' | 'user' = 'user') => {
      const newUser = {
        id: `usr-${Date.now()}`,
        username,
        role,
        createdAt: new Date().toISOString()
      };
      this.data.users.push(newUser);
      this.save(this.data);
      return newUser;
    }
  };

  public analytics = {
    getStats: (): SystemStats => {
      const totalDownloads = this.data.history.length;
      const totalUsers = this.data.users.length;
      
      // Calculate active size from completed downloads
      let storageUsedBytes = 0;
      this.data.history.forEach(item => {
        if (item.status === 'completed') {
          const match = item.size.match(/^([\d.]+)\s*(MB|KB)/i);
          if (match) {
            const val = parseFloat(match[1]);
            const unit = match[2].toUpperCase();
            if (unit === 'MB') storageUsedBytes += val * 1024 * 1024;
            if (unit === 'KB') storageUsedBytes += val * 1024;
          }
        }
      });

      // Today's downloads
      const startOfToday = new Date().setHours(0,0,0,0);
      const todaysDownloads = this.data.history.filter(item => 
        new Date(item.createdAt).getTime() >= startOfToday
      ).length;

      // Platform breakdown
      const clicks = { ...this.data.analytics.platformClicks };
      let mostPopularPlatform = 'TikTok';
      let maxClicks = 0;
      Object.entries(clicks).forEach(([plt, val]) => {
        if (val > maxClicks) {
          maxClicks = val;
          mostPopularPlatform = plt;
        }
      });

      return {
        totalDownloads,
        totalUsers,
        storageUsedBytes,
        bandwidthBytes: this.data.analytics.bandwidthBytes,
        todaysDownloads,
        mostPopularPlatform,
        platformStats: clicks
      };
    },
    incrementBandwidth: (bytes: number) => {
      this.data.analytics.bandwidthBytes += bytes;
      this.save(this.data);
    },
    incrementPlatformClick: (platform: string) => {
      if (!this.data.analytics.platformClicks[platform]) {
        this.data.analytics.platformClicks[platform] = 0;
      }
      this.data.analytics.platformClicks[platform]++;
      this.save(this.data);
    }
  };
}

export const db = new JSONDatabase();
