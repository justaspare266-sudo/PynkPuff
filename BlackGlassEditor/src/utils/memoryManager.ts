/**
 * Advanced Memory Manager for Konva Canvas
 * Implements memory pooling, garbage collection, and resource management
 */

export interface MemoryConfig {
  maxMemoryUsage: number; // in MB
  gcThreshold: number; // memory usage percentage to trigger GC
  enableObjectPooling: boolean;
  enableImagePooling: boolean;
  enableTexturePooling: boolean;
  poolSize: number;
  gcInterval: number; // in ms
  enableMemoryLeakDetection: boolean;
  maxObjectAge: number; // in ms
}

export interface MemoryStats {
  currentUsage: number; // in MB
  peakUsage: number; // in MB
  objectCount: number;
  pooledObjects: number;
  garbageCollections: number;
  memoryLeaks: number;
  averageGCTime: number;
  lastGC: number;
}

export interface MemoryLeak {
  id: string;
  type: string;
  size: number;
  age: number;
  stack: string;
}

export class MemoryManager {
  private config: MemoryConfig;
  private stats: MemoryStats;
  private objectRegistry: Map<string, { object: any; timestamp: number; size: number }> = new Map();
  private imagePool: Map<string, HTMLImageElement[]> = new Map();
  private texturePool: Map<string, any[]> = new Map();
  private gcInterval: number | null = null;
  private memoryLeaks: MemoryLeak[] = [];
  private isRunning: boolean = false;

  constructor(config: Partial<MemoryConfig> = {}) {
    this.config = {
      maxMemoryUsage: 200, // 200MB
      gcThreshold: 0.8, // 80%
      enableObjectPooling: true,
      enableImagePooling: true,
      enableTexturePooling: true,
      poolSize: 100,
      gcInterval: 30000, // 30 seconds
      enableMemoryLeakDetection: true,
      maxObjectAge: 300000, // 5 minutes
      ...config
    };

    this.stats = {
      currentUsage: 0,
      peakUsage: 0,
      objectCount: 0,
      pooledObjects: 0,
      garbageCollections: 0,
      memoryLeaks: 0,
      averageGCTime: 0,
      lastGC: 0
    };
  }

  /**
   * Start memory management
   */
  start(): void {
    if (this.isRunning) return;

    this.isRunning = true;
    this.startGarbageCollection();
    this.startMemoryMonitoring();

    console.log('Memory management started');
  }

  /**
   * Stop memory management
   */
  stop(): void {
    if (!this.isRunning) return;

    this.isRunning = false;
    this.stopGarbageCollection();
    this.cleanup();

    console.log('Memory management stopped');
  }

  /**
   * Register object for memory tracking
   */
  registerObject(id: string, object: any, size: number = 0): void {
    this.objectRegistry.set(id, {
      object,
      timestamp: Date.now(),
      size: size || this.estimateObjectSize(object)
    });

    this.updateMemoryUsage();
  }

  /**
   * Unregister object
   */
  unregisterObject(id: string): void {
    const entry = this.objectRegistry.get(id);
    if (entry) {
      this.objectRegistry.delete(id);
      this.updateMemoryUsage();
    }
  }

  /**
   * Get pooled image
   */
  getPooledImage(key: string, createFn: () => HTMLImageElement): HTMLImageElement {
    if (!this.config.enableImagePooling) {
      return createFn();
    }

    if (!this.imagePool.has(key)) {
      this.imagePool.set(key, []);
    }

    const pool = this.imagePool.get(key)!;
    
    if (pool.length > 0) {
      const image = pool.pop()!;
      this.stats.pooledObjects++;
      return image;
    }

    return createFn();
  }

  /**
   * Return image to pool
   */
  returnImage(key: string, image: HTMLImageElement): void {
    if (!this.config.enableImagePooling) return;

    if (!this.imagePool.has(key)) {
      this.imagePool.set(key, []);
    }

    const pool = this.imagePool.get(key)!;
    
    if (pool.length < this.config.poolSize) {
      // Reset image
      image.src = '';
      pool.push(image);
    }
  }

  /**
   * Get pooled texture
   */
  getPooledTexture(key: string, createFn: () => any): any {
    if (!this.config.enableTexturePooling) {
      return createFn();
    }

    if (!this.texturePool.has(key)) {
      this.texturePool.set(key, []);
    }

    const pool = this.texturePool.get(key)!;
    
    if (pool.length > 0) {
      const texture = pool.pop()!;
      this.stats.pooledObjects++;
      return texture;
    }

    return createFn();
  }

  /**
   * Return texture to pool
   */
  returnTexture(key: string, texture: any): void {
    if (!this.config.enableTexturePooling) return;

    if (!this.texturePool.has(key)) {
      this.texturePool.set(key, []);
    }

    const pool = this.texturePool.get(key)!;
    
    if (pool.length < this.config.poolSize) {
      // Reset texture
      if (texture.destroy) {
        texture.destroy();
      }
      pool.push(texture);
    }
  }

  /**
   * Start garbage collection interval
   */
  private startGarbageCollection(): void {
    if (this.gcInterval) return;

    this.gcInterval = window.setInterval(() => {
      this.runGarbageCollection();
    }, this.config.gcInterval);
  }

  /**
   * Stop garbage collection interval
   */
  private stopGarbageCollection(): void {
    if (this.gcInterval) {
      clearInterval(this.gcInterval);
      this.gcInterval = null;
    }
  }

  /**
   * Run garbage collection
   */
  private runGarbageCollection(): void {
    const startTime = performance.now();
    
    // Check if GC is needed
    const memoryRatio = this.stats.currentUsage / this.config.maxMemoryUsage;
    if (memoryRatio < this.config.gcThreshold) {
      return;
    }

    // Clean up old objects
    const now = Date.now();
    const maxAge = this.config.maxObjectAge;
    
    for (const [id, entry] of this.objectRegistry.entries()) {
      if (now - entry.timestamp > maxAge) {
        this.unregisterObject(id);
      }
    }

    // Clean up pools
    this.cleanupPools();

    // Update stats
    const gcTime = performance.now() - startTime;
    this.stats.garbageCollections++;
    this.stats.averageGCTime = (this.stats.averageGCTime + gcTime) / 2;
    this.stats.lastGC = now;

    console.log(`Garbage collection completed in ${gcTime.toFixed(2)}ms`);
  }

  /**
   * Clean up object pools
   */
  private cleanupPools(): void {
    // Clean up image pool
    for (const [key, pool] of this.imagePool.entries()) {
      if (pool.length > this.config.poolSize) {
        const excess = pool.splice(this.config.poolSize);
        excess.forEach(image => {
          image.src = '';
        });
      }
    }

    // Clean up texture pool
    for (const [key, pool] of this.texturePool.entries()) {
      if (pool.length > this.config.poolSize) {
        const excess = pool.splice(this.config.poolSize);
        excess.forEach(texture => {
          if (texture.destroy) {
            texture.destroy();
          }
        });
      }
    }
  }

  /**
   * Start memory monitoring
   */
  private startMemoryMonitoring(): void {
    if (!this.config.enableMemoryLeakDetection) return;

    setInterval(() => {
      this.detectMemoryLeaks();
    }, 60000); // Check every minute
  }

  /**
   * Detect memory leaks
   */
  private detectMemoryLeaks(): void {
    const now = Date.now();
    const maxAge = this.config.maxObjectAge * 2; // 10 minutes

    for (const [id, entry] of this.objectRegistry.entries()) {
      if (now - entry.timestamp > maxAge) {
        const leak: MemoryLeak = {
          id,
          type: entry.object.constructor.name,
          size: entry.size,
          age: now - entry.timestamp,
          stack: new Error().stack || ''
        };

        this.memoryLeaks.push(leak);
        this.stats.memoryLeaks++;
      }
    }
  }

  /**
   * Update memory usage stats
   */
  private updateMemoryUsage(): void {
    let totalSize = 0;
    let objectCount = 0;

    for (const [id, entry] of this.objectRegistry.entries()) {
      totalSize += entry.size;
      objectCount++;
    }

    // Add pooled objects
    for (const pool of this.imagePool.values()) {
      objectCount += pool.length;
    }
    for (const pool of this.texturePool.values()) {
      objectCount += pool.length;
    }

    this.stats.currentUsage = totalSize / (1024 * 1024); // Convert to MB
    this.stats.objectCount = objectCount;
    this.stats.pooledObjects = this.getTotalPooledObjects();

    if (this.stats.currentUsage > this.stats.peakUsage) {
      this.stats.peakUsage = this.stats.currentUsage;
    }
  }

  /**
   * Get total pooled objects count
   */
  private getTotalPooledObjects(): number {
    let total = 0;
    for (const pool of this.imagePool.values()) {
      total += pool.length;
    }
    for (const pool of this.texturePool.values()) {
      total += pool.length;
    }
    return total;
  }

  /**
   * Estimate object size in bytes
   */
  private estimateObjectSize(object: any): number {
    if (!object) return 0;

    let size = 0;
    
    // Basic size estimation
    if (typeof object === 'string') {
      size = object.length * 2; // 2 bytes per character
    } else if (typeof object === 'number') {
      size = 8; // 8 bytes for number
    } else if (typeof object === 'boolean') {
      size = 4; // 4 bytes for boolean
    } else if (Array.isArray(object)) {
      size = object.length * 8; // Rough estimate
    } else if (typeof object === 'object') {
      size = Object.keys(object).length * 16; // Rough estimate
    }

    return size;
  }

  /**
   * Get memory stats
   */
  getStats(): MemoryStats {
    return { ...this.stats };
  }

  /**
   * Get memory leaks
   */
  getMemoryLeaks(): MemoryLeak[] {
    return [...this.memoryLeaks];
  }

  /**
   * Get memory recommendations
   */
  getRecommendations(): string[] {
    const recommendations: string[] = [];

    if (this.stats.currentUsage > this.config.maxMemoryUsage * 0.8) {
      recommendations.push('High memory usage. Consider running garbage collection or reducing object count.');
    }

    if (this.stats.memoryLeaks > 0) {
      recommendations.push(`${this.stats.memoryLeaks} potential memory leaks detected. Check object lifecycle.`);
    }

    if (this.stats.averageGCTime > 100) {
      recommendations.push('Slow garbage collection. Consider reducing object complexity or frequency.');
    }

    const poolRatio = this.stats.pooledObjects / (this.stats.objectCount || 1);
    if (poolRatio < 0.3) {
      recommendations.push('Low object pooling ratio. Consider enabling more aggressive pooling.');
    }

    return recommendations;
  }

  /**
   * Force garbage collection
   */
  forceGC(): void {
    this.runGarbageCollection();
  }

  /**
   * Clean up all resources
   */
  cleanup(): void {
    this.objectRegistry.clear();
    this.imagePool.clear();
    this.texturePool.clear();
    this.memoryLeaks = [];
    this.reset();
  }

  /**
   * Reset stats
   */
  reset(): void {
    this.stats = {
      currentUsage: 0,
      peakUsage: 0,
      objectCount: 0,
      pooledObjects: 0,
      garbageCollections: 0,
      memoryLeaks: 0,
      averageGCTime: 0,
      lastGC: 0
    };
  }
}

export default MemoryManager;
