/**
 * Advanced Render Optimizer for Konva Canvas
 * Implements viewport culling, object pooling, and smart rendering strategies
 */

export interface RenderConfig {
  enableViewportCulling: boolean;
  enableObjectPooling: boolean;
  enableSmartCaching: boolean;
  enableLazyLoading: boolean;
  enableBatchRendering: boolean;
  maxVisibleObjects: number;
  cacheThreshold: number;
  renderDistance: number;
  frameSkipThreshold: number;
}

export interface ViewportBounds {
  x: number;
  y: number;
  width: number;
  height: number;
  scale: number;
}

export interface RenderStats {
  visibleObjects: number;
  culledObjects: number;
  cachedObjects: number;
  pooledObjects: number;
  renderBatches: number;
  skippedFrames: number;
  averageRenderTime: number;
}

export class RenderOptimizer {
  private config: RenderConfig;
  private stats: RenderStats;
  private objectPool: Map<string, any[]> = new Map();
  private renderQueue: any[] = [];
  private lastRenderTime: number = 0;
  private frameSkipCount: number = 0;
  private viewportBounds: ViewportBounds = { x: 0, y: 0, width: 0, height: 0, scale: 1 };
  private visibleObjects: Set<string> = new Set();
  private cachedObjects: Set<string> = new Set();

  constructor(config: Partial<RenderConfig> = {}) {
    this.config = {
      enableViewportCulling: true,
      enableObjectPooling: true,
      enableSmartCaching: true,
      enableLazyLoading: true,
      enableBatchRendering: true,
      maxVisibleObjects: 1000,
      cacheThreshold: 0.7,
      renderDistance: 1.5,
      frameSkipThreshold: 16.67, // 60fps
      ...config
    };

    this.stats = {
      visibleObjects: 0,
      culledObjects: 0,
      cachedObjects: 0,
      pooledObjects: 0,
      renderBatches: 0,
      skippedFrames: 0,
      averageRenderTime: 0
    };
  }

  /**
   * Update viewport bounds for culling
   */
  updateViewport(bounds: ViewportBounds): void {
    this.viewportBounds = bounds;
    this.updateVisibleObjects();
  }

  /**
   * Check if object should be rendered based on viewport culling
   */
  isObjectVisible(object: any): boolean {
    if (!this.config.enableViewportCulling) return true;

    const { x, y, width, height } = object;
    const { x: vx, y: vy, width: vw, height: vh, scale } = this.viewportBounds;

    // Expand viewport by render distance for smooth scrolling
    const expandedX = vx - (vw * this.config.renderDistance);
    const expandedY = vy - (vh * this.config.renderDistance);
    const expandedWidth = vw * (1 + 2 * this.config.renderDistance);
    const expandedHeight = vh * (1 + 2 * this.config.renderDistance);

    return !(
      x + width < expandedX ||
      x > expandedX + expandedWidth ||
      y + height < expandedY ||
      y > expandedY + expandedHeight
    );
  }

  /**
   * Update visible objects set
   */
  private updateVisibleObjects(): void {
    this.visibleObjects.clear();
    // This would be called with actual objects in real implementation
  }

  /**
   * Get object from pool or create new one
   */
  getPooledObject(type: string, createFn: () => any): any {
    if (!this.config.enableObjectPooling) {
      return createFn();
    }

    if (!this.objectPool.has(type)) {
      this.objectPool.set(type, []);
    }

    const pool = this.objectPool.get(type)!;
    
    if (pool.length > 0) {
      const obj = pool.pop()!;
      this.stats.pooledObjects++;
      return obj;
    }

    return createFn();
  }

  /**
   * Return object to pool
   */
  returnToPool(type: string, obj: any): void {
    if (!this.config.enableObjectPooling) return;

    if (!this.objectPool.has(type)) {
      this.objectPool.set(type, []);
    }

    const pool = this.objectPool.get(type)!;
    
    // Reset object state
    if (obj.reset) {
      obj.reset();
    }

    pool.push(obj);
  }

  /**
   * Add object to render queue
   */
  addToRenderQueue(object: any): void {
    if (this.config.enableBatchRendering) {
      this.renderQueue.push(object);
    }
  }

  /**
   * Process render queue in batches
   */
  processRenderQueue(renderFn: (objects: any[]) => void): void {
    if (!this.config.enableBatchRendering || this.renderQueue.length === 0) {
      return;
    }

    const batchSize = Math.min(50, this.renderQueue.length);
    const batch = this.renderQueue.splice(0, batchSize);
    
    renderFn(batch);
    this.stats.renderBatches++;
  }

  /**
   * Check if frame should be skipped
   */
  shouldSkipFrame(): boolean {
    const now = performance.now();
    const deltaTime = now - this.lastRenderTime;
    
    if (deltaTime < this.config.frameSkipThreshold) {
      this.frameSkipCount++;
      this.stats.skippedFrames++;
      return true;
    }

    this.lastRenderTime = now;
    return false;
  }

  /**
   * Enable smart caching for object
   */
  enableCaching(objectId: string, object: any): void {
    if (!this.config.enableSmartCaching) return;

    if (object.cache) {
      object.cache();
      this.cachedObjects.add(objectId);
      this.stats.cachedObjects++;
    }
  }

  /**
   * Disable caching for object
   */
  disableCaching(objectId: string, object: any): void {
    if (object.cache && this.cachedObjects.has(objectId)) {
      object.cache(null);
      this.cachedObjects.delete(objectId);
      this.stats.cachedObjects--;
    }
  }

  /**
   * Check if object should be cached
   */
  shouldCache(object: any, totalObjects: number): boolean {
    if (!this.config.enableSmartCaching) return false;

    const cacheRatio = this.stats.cachedObjects / totalObjects;
    return cacheRatio < this.config.cacheThreshold;
  }

  /**
   * Optimize object for rendering
   */
  optimizeObject(object: any, objectId: string, totalObjects: number): void {
    // Enable caching if beneficial
    if (this.shouldCache(object, totalObjects)) {
      this.enableCaching(objectId, object);
    }

    // Set listening based on visibility
    if (this.config.enableViewportCulling) {
      object.listening = this.visibleObjects.has(objectId);
    }
  }

  /**
   * Get performance recommendations
   */
  getRecommendations(): string[] {
    const recommendations: string[] = [];

    if (this.stats.skippedFrames > 10) {
      recommendations.push('High frame skip rate. Consider reducing object complexity or enabling more aggressive culling.');
    }

    if (this.stats.visibleObjects > this.config.maxVisibleObjects) {
      recommendations.push('Too many visible objects. Consider enabling viewport culling or reducing object count.');
    }

    const cacheRatio = this.stats.cachedObjects / (this.stats.visibleObjects || 1);
    if (cacheRatio < 0.5) {
      recommendations.push('Low cache ratio. Consider enabling smart caching for better performance.');
    }

    if (this.stats.renderBatches > 20) {
      recommendations.push('Many render batches. Consider increasing batch size or reducing object count.');
    }

    return recommendations;
  }

  /**
   * Get current stats
   */
  getStats(): RenderStats {
    return { ...this.stats };
  }

  /**
   * Reset all stats
   */
  reset(): void {
    this.stats = {
      visibleObjects: 0,
      culledObjects: 0,
      cachedObjects: 0,
      pooledObjects: 0,
      renderBatches: 0,
      skippedFrames: 0,
      averageRenderTime: 0
    };

    this.renderQueue = [];
    this.frameSkipCount = 0;
    this.visibleObjects.clear();
    this.cachedObjects.clear();
  }

  /**
   * Clean up resources
   */
  cleanup(): void {
    this.objectPool.clear();
    this.renderQueue = [];
    this.visibleObjects.clear();
    this.cachedObjects.clear();
    this.reset();
  }
}

export default RenderOptimizer;
