// Intelligent Cache Management System

interface CacheEntry<T> {
  key: string;
  data: T;
  timestamp: number;
  accessCount: number;
  lastAccessed: number;
  size: number;
  priority: number;
}

interface CacheStats {
  entries: number;
  totalSize: number;
  hitRate: number;
  missRate: number;
  evictions: number;
}

class CacheManager {
  private static instance: CacheManager;
  private cache = new Map<string, CacheEntry<any>>();
  private maxSize = 50 * 1024 * 1024; // 50MB
  private maxEntries = 1000;
  private hits = 0;
  private misses = 0;
  private evictions = 0;

  static getInstance(): CacheManager {
    if (!CacheManager.instance) {
      CacheManager.instance = new CacheManager();
    }
    return CacheManager.instance;
  }

  // Set cache entry
  set<T>(key: string, data: T, priority = 1): void {
    const size = this.calculateSize(data);
    const now = Date.now();

    // Check if we need to evict entries
    this.evictIfNeeded(size);

    const entry: CacheEntry<T> = {
      key,
      data,
      timestamp: now,
      accessCount: 0,
      lastAccessed: now,
      size,
      priority
    };

    this.cache.set(key, entry);
  }

  // Get cache entry
  get<T>(key: string): T | null {
    const entry = this.cache.get(key);
    
    if (!entry) {
      this.misses++;
      return null;
    }

    // Update access statistics
    entry.accessCount++;
    entry.lastAccessed = Date.now();
    this.hits++;

    return entry.data as T;
  }

  // Check if key exists
  has(key: string): boolean {
    return this.cache.has(key);
  }

  // Delete cache entry
  delete(key: string): boolean {
    return this.cache.delete(key);
  }

  // Clear all cache
  clear(): void {
    this.cache.clear();
    this.hits = 0;
    this.misses = 0;
    this.evictions = 0;
  }

  // Get cache statistics
  getStats(): CacheStats {
    const totalSize = Array.from(this.cache.values())
      .reduce((sum, entry) => sum + entry.size, 0);

    const totalRequests = this.hits + this.misses;
    const hitRate = totalRequests > 0 ? this.hits / totalRequests : 0;
    const missRate = totalRequests > 0 ? this.misses / totalRequests : 0;

    return {
      entries: this.cache.size,
      totalSize,
      hitRate,
      missRate,
      evictions: this.evictions
    };
  }

  // Evict entries if needed
  private evictIfNeeded(newEntrySize: number): void {
    const currentSize = this.getCurrentSize();
    
    // Check size limit
    if (currentSize + newEntrySize > this.maxSize) {
      this.evictBySize(currentSize + newEntrySize - this.maxSize);
    }

    // Check entry count limit
    if (this.cache.size >= this.maxEntries) {
      this.evictLeastUsed(1);
    }
  }

  // Evict by size using LRU + priority
  private evictBySize(targetSize: number): void {
    const entries = Array.from(this.cache.values())
      .sort((a, b) => {
        // Sort by priority (lower first), then by last accessed (older first)
        if (a.priority !== b.priority) {
          return a.priority - b.priority;
        }
        return a.lastAccessed - b.lastAccessed;
      });

    let evictedSize = 0;
    for (const entry of entries) {
      if (evictedSize >= targetSize) break;
      
      this.cache.delete(entry.key);
      evictedSize += entry.size;
      this.evictions++;
    }
  }

  // Evict least used entries
  private evictLeastUsed(count: number): void {
    const entries = Array.from(this.cache.values())
      .sort((a, b) => {
        // Sort by access count (lower first), then by last accessed (older first)
        if (a.accessCount !== b.accessCount) {
          return a.accessCount - b.accessCount;
        }
        return a.lastAccessed - b.lastAccessed;
      });

    for (let i = 0; i < Math.min(count, entries.length); i++) {
      this.cache.delete(entries[i].key);
      this.evictions++;
    }
  }

  // Calculate data size
  private calculateSize(data: any): number {
    if (typeof data === 'string') {
      return data.length * 2; // UTF-16
    }
    
    if (data instanceof ArrayBuffer) {
      return data.byteLength;
    }
    
    if (data instanceof HTMLImageElement) {
      return data.width * data.height * 4; // RGBA
    }
    
    if (data instanceof HTMLCanvasElement) {
      return data.width * data.height * 4; // RGBA
    }
    
    // Estimate object size
    try {
      return JSON.stringify(data).length * 2;
    } catch {
      return 1024; // Default estimate
    }
  }

  // Get current total size
  private getCurrentSize(): number {
    return Array.from(this.cache.values())
      .reduce((sum, entry) => sum + entry.size, 0);
  }

  // Preload data with priority
  preload<T>(key: string, dataLoader: () => Promise<T>, priority = 5): Promise<T> {
    return new Promise((resolve, reject) => {
      // Check if already cached
      const cached = this.get<T>(key);
      if (cached) {
        resolve(cached);
        return;
      }

      // Load and cache data
      dataLoader()
        .then(data => {
          this.set(key, data, priority);
          resolve(data);
        })
        .catch(reject);
    });
  }

  // Batch preload
  batchPreload<T>(
    items: Array<{ key: string; loader: () => Promise<T>; priority?: number }>
  ): Promise<T[]> {
    return Promise.all(
      items.map(item => 
        this.preload(item.key, item.loader, item.priority)
      )
    );
  }

  // Clean expired entries
  cleanExpired(maxAge = 3600000): number { // 1 hour default
    const now = Date.now();
    let cleaned = 0;

    for (const [key, entry] of this.cache.entries()) {
      if (now - entry.timestamp > maxAge) {
        this.cache.delete(key);
        cleaned++;
      }
    }

    return cleaned;
  }

  // Optimize cache
  optimize(): void {
    // Clean expired entries
    this.cleanExpired();

    // If still over size limit, evict low-priority entries
    const currentSize = this.getCurrentSize();
    if (currentSize > this.maxSize * 0.8) {
      this.evictBySize(currentSize - this.maxSize * 0.7);
    }
  }

  // Export cache data
  export(): any {
    const entries: any[] = [];
    
    for (const [key, entry] of this.cache.entries()) {
      entries.push({
        key,
        data: entry.data,
        timestamp: entry.timestamp,
        priority: entry.priority
      });
    }

    return {
      entries,
      stats: this.getStats()
    };
  }

  // Import cache data
  import(data: any): void {
    this.clear();
    
    if (data.entries) {
      for (const entry of data.entries) {
        this.set(entry.key, entry.data, entry.priority);
      }
    }
  }
}

// Specialized cache managers
export class ImageCache extends CacheManager {
  cacheImage(url: string, priority = 3): Promise<HTMLImageElement> {
    return this.preload(
      `image:${url}`,
      () => new Promise((resolve, reject) => {
        const img = new Image();
        img.onload = () => resolve(img);
        img.onerror = reject;
        img.src = url;
      }),
      priority
    );
  }
}

export class CanvasCache extends CacheManager {
  cacheCanvas(key: string, canvas: HTMLCanvasElement, priority = 4): void {
    // Create a copy of the canvas
    const copy = document.createElement('canvas');
    copy.width = canvas.width;
    copy.height = canvas.height;
    const ctx = copy.getContext('2d');
    if (ctx) {
      ctx.drawImage(canvas, 0, 0);
    }
    
    this.set(`canvas:${key}`, copy, priority);
  }
}

export class DataCache extends CacheManager {
  cacheJSON<T>(key: string, data: T, priority = 2): void {
    this.set(`json:${key}`, data, priority);
  }

  getJSON<T>(key: string): T | null {
    return this.get<T>(`json:${key}`);
  }
}

// Global cache instances
export const imageCache = new ImageCache();
export const canvasCache = new CanvasCache();
export const dataCache = new DataCache();
export const mainCache = CacheManager.getInstance();

// Auto-optimization
setInterval(() => {
  mainCache.optimize();
  imageCache.optimize();
  canvasCache.optimize();
  dataCache.optimize();
}, 60000); // Every minute