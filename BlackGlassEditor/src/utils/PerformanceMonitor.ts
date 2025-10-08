/**
 * Master-level Performance Monitor for Konva Canvas
 * Tracks FPS, memory usage, render time, and provides optimization recommendations
 */

export interface PerformanceStats {
  fps: number;
  memoryUsage: number;
  renderTime: number;
  drawCalls: number;
  cachedNodes: number;
  totalNodes: number;
  animations: number;
  eventListeners: number;
  canvasSize: { width: number; height: number };
  pixelRatio: number;
  isOptimized: boolean;
  recommendations: string[];
}

export interface PerformanceConfig {
  targetFPS: number;
  maxMemoryUsage: number; // in MB
  maxRenderTime: number; // in ms
  enableMemoryTracking: boolean;
  enableRenderTracking: boolean;
  enableEventTracking: boolean;
  enableAnimationTracking: boolean;
  enableOptimizationRecommendations: boolean;
  sampleRate: number; // how often to sample (in ms)
}

export class PerformanceMonitor {
  private config: PerformanceConfig;
  private stats: PerformanceStats;
  private frameCount: number = 0;
  private lastTime: number = 0;
  private fpsHistory: number[] = [];
  private renderTimeHistory: number[] = [];
  private memoryHistory: number[] = [];
  private isRunning: boolean = false;
  private animationId: number | null = null;
  private sampleInterval: number | null = null;
  private startTime: number = 0;
  private lastRenderTime: number = 0;
  private drawCallCount: number = 0;
  private eventListenerCount: number = 0;
  private animationCount: number = 0;
  private cachedNodeCount: number = 0;
  private totalNodeCount: number = 0;
  private canvasWidth: number = 0;
  private canvasHeight: number = 0;
  private pixelRatio: number = 1;

  constructor(config: Partial<PerformanceConfig> = {}) {
    this.config = {
      targetFPS: 60,
      maxMemoryUsage: 100, // 100MB
      maxRenderTime: 16.67, // 16.67ms for 60fps
      enableMemoryTracking: true,
      enableRenderTracking: true,
      enableEventTracking: true,
      enableAnimationTracking: true,
      enableOptimizationRecommendations: true,
      sampleRate: 1000, // 1 second
      ...config
    };

    this.stats = {
      fps: 0,
      memoryUsage: 0,
      renderTime: 0,
      drawCalls: 0,
      cachedNodes: 0,
      totalNodes: 0,
      animations: 0,
      eventListeners: 0,
      canvasSize: { width: 0, height: 0 },
      pixelRatio: 1,
      isOptimized: true,
      recommendations: []
    };

    this.startTime = performance.now();
    this.lastTime = this.startTime;
  }

  /**
   * Start monitoring performance
   */
  start(): void {
    if (this.isRunning) return;

    this.isRunning = true;
    this.startTime = performance.now();
    this.lastTime = this.startTime;

    // Start FPS monitoring
    this.measureFPS();

    // Start periodic sampling
    this.sampleInterval = window.setInterval(() => {
      this.sample();
    }, this.config.sampleRate);

    console.log('Performance monitoring started');
  }

  /**
   * Stop monitoring performance
   */
  stop(): void {
    if (!this.isRunning) return;

    this.isRunning = false;

    if (this.animationId) {
      cancelAnimationFrame(this.animationId);
      this.animationId = null;
    }

    if (this.sampleInterval) {
      clearInterval(this.sampleInterval);
      this.sampleInterval = null;
    }

    console.log('Performance monitoring stopped');
  }

  /**
   * Clean up resources
   */
  cleanup(): void {
    this.stop();
    this.fpsHistory = [];
    this.renderTimeHistory = [];
    this.memoryHistory = [];
  }

  /**
   * Measure FPS using requestAnimationFrame
   */
  private measureFPS(): void {
    if (!this.isRunning) return;

    const now = performance.now();
    const deltaTime = now - this.lastTime;

    this.frameCount++;

    if (deltaTime >= 1000) { // Update FPS every second
      this.stats.fps = Math.round((this.frameCount * 1000) / deltaTime);
      this.fpsHistory.push(this.stats.fps);
      
      // Keep only last 60 samples (1 minute at 1fps)
      if (this.fpsHistory.length > 60) {
        this.fpsHistory.shift();
      }

      this.frameCount = 0;
      this.lastTime = now;
    }

    this.animationId = requestAnimationFrame(() => this.measureFPS());
  }

  /**
   * Sample current performance metrics
   */
  private sample(): void {
    if (!this.isRunning) return;

    // Memory usage
    if (this.config.enableMemoryTracking && 'memory' in performance) {
      const memory = (performance as any).memory;
      if (memory) {
        this.stats.memoryUsage = memory.usedJSHeapSize / (1024 * 1024); // Convert to MB
        this.memoryHistory.push(this.stats.memoryUsage);
        
        // Keep only last 60 samples
        if (this.memoryHistory.length > 60) {
          this.memoryHistory.shift();
        }
      }
    }

    // Canvas size
    this.stats.canvasSize = { width: this.canvasWidth, height: this.canvasHeight };
    this.stats.pixelRatio = this.pixelRatio;

    // Generate recommendations
    if (this.config.enableOptimizationRecommendations) {
      this.generateRecommendations();
    }
  }

  /**
   * Record render time
   */
  recordRenderTime(renderTime: number): void {
    if (!this.config.enableRenderTracking) return;

    this.stats.renderTime = renderTime;
    this.renderTimeHistory.push(renderTime);
    
    // Keep only last 60 samples
    if (this.renderTimeHistory.length > 60) {
      this.renderTimeHistory.shift();
    }
  }

  /**
   * Record draw call
   */
  recordDrawCall(): void {
    this.drawCallCount++;
    this.stats.drawCalls = this.drawCallCount;
  }

  /**
   * Reset draw call counter
   */
  resetDrawCalls(): void {
    this.drawCallCount = 0;
    this.stats.drawCalls = 0;
  }

  /**
   * Update node counts
   */
  updateNodeCounts(total: number, cached: number): void {
    this.totalNodeCount = total;
    this.cachedNodeCount = cached;
    this.stats.totalNodes = total;
    this.stats.cachedNodes = cached;
  }

  /**
   * Update animation count
   */
  updateAnimationCount(count: number): void {
    this.animationCount = count;
    this.stats.animations = count;
  }

  /**
   * Update event listener count
   */
  updateEventListenerCount(count: number): void {
    this.eventListenerCount = count;
    this.stats.eventListeners = count;
  }

  /**
   * Update canvas dimensions
   */
  updateCanvasSize(width: number, height: number, pixelRatio: number = 1): void {
    this.canvasWidth = width;
    this.canvasHeight = height;
    this.pixelRatio = pixelRatio;
    this.stats.canvasSize = { width, height };
    this.stats.pixelRatio = pixelRatio;
  }

  /**
   * Get current performance stats
   */
  getStats(): PerformanceStats {
    return { ...this.stats };
  }

  /**
   * Get performance history
   */
  getHistory(): {
    fps: number[];
    memory: number[];
    renderTime: number[];
  } {
    return {
      fps: [...this.fpsHistory],
      memory: [...this.memoryHistory],
      renderTime: [...this.renderTimeHistory]
    };
  }

  /**
   * Get average performance metrics
   */
  getAverages(): {
    fps: number;
    memory: number;
    renderTime: number;
  } {
    const avgFPS = this.fpsHistory.length > 0 
      ? this.fpsHistory.reduce((a, b) => a + b, 0) / this.fpsHistory.length 
      : 0;

    const avgMemory = this.memoryHistory.length > 0 
      ? this.memoryHistory.reduce((a, b) => a + b, 0) / this.memoryHistory.length 
      : 0;

    const avgRenderTime = this.renderTimeHistory.length > 0 
      ? this.renderTimeHistory.reduce((a, b) => a + b, 0) / this.renderTimeHistory.length 
      : 0;

    return {
      fps: Math.round(avgFPS),
      memory: Math.round(avgMemory * 100) / 100,
      renderTime: Math.round(avgRenderTime * 100) / 100
    };
  }

  /**
   * Generate optimization recommendations
   */
  private generateRecommendations(): void {
    const recommendations: string[] = [];

    // FPS recommendations
    if (this.stats.fps < this.config.targetFPS) {
      recommendations.push(`Low FPS detected (${this.stats.fps}). Consider reducing node count or enabling caching.`);
    }

    // Memory recommendations
    if (this.stats.memoryUsage > this.config.maxMemoryUsage) {
      recommendations.push(`High memory usage (${Math.round(this.stats.memoryUsage)}MB). Consider clearing unused nodes or reducing canvas size.`);
    }

    // Render time recommendations
    if (this.stats.renderTime > this.config.maxRenderTime) {
      recommendations.push(`Slow render time (${Math.round(this.stats.renderTime)}ms). Consider enabling caching or reducing complexity.`);
    }

    // Node count recommendations
    if (this.stats.totalNodes > 1000) {
      recommendations.push(`High node count (${this.stats.totalNodes}). Consider grouping or removing unused nodes.`);
    }

    // Cache recommendations
    const cacheRatio = this.stats.cachedNodes / this.stats.totalNodes;
    if (cacheRatio < 0.5 && this.stats.totalNodes > 100) {
      recommendations.push(`Low cache ratio (${Math.round(cacheRatio * 100)}%). Consider enabling caching for more nodes.`);
    }

    // Animation recommendations
    if (this.stats.animations > 10) {
      recommendations.push(`Many active animations (${this.stats.animations}). Consider reducing or pausing some animations.`);
    }

    // Event listener recommendations
    if (this.stats.eventListeners > 1000) {
      recommendations.push(`High event listener count (${this.stats.eventListeners}). Consider removing unused listeners.`);
    }

    // Canvas size recommendations
    const totalPixels = this.stats.canvasSize.width * this.stats.canvasSize.height;
    if (totalPixels > 4000000) { // 4MP
      recommendations.push(`Large canvas size (${Math.round(totalPixels / 1000000)}MP). Consider reducing resolution or using viewport culling.`);
    }

    this.stats.recommendations = recommendations;
    this.stats.isOptimized = recommendations.length === 0;
  }

  /**
   * Get performance score (0-100)
   */
  getPerformanceScore(): number {
    let score = 100;

    // FPS score (40 points)
    const fpsScore = Math.min(40, (this.stats.fps / this.config.targetFPS) * 40);
    score -= (40 - fpsScore);

    // Memory score (20 points)
    const memoryScore = Math.min(20, (1 - this.stats.memoryUsage / this.config.maxMemoryUsage) * 20);
    score -= (20 - memoryScore);

    // Render time score (20 points)
    const renderScore = Math.min(20, (1 - this.stats.renderTime / this.config.maxRenderTime) * 20);
    score -= (20 - renderScore);

    // Node count score (10 points)
    const nodeScore = Math.min(10, (1 - this.stats.totalNodes / 1000) * 10);
    score -= (10 - nodeScore);

    // Cache ratio score (10 points)
    const cacheRatio = this.stats.cachedNodes / this.stats.totalNodes;
    const cacheScore = Math.min(10, cacheRatio * 10);
    score -= (10 - cacheScore);

    return Math.max(0, Math.round(score));
  }

  /**
   * Export performance data
   */
  exportData(): string {
    const data = {
      config: this.config,
      stats: this.stats,
      history: this.getHistory(),
      averages: this.getAverages(),
      score: this.getPerformanceScore(),
      timestamp: new Date().toISOString()
    };

    return JSON.stringify(data, null, 2);
  }

  /**
   * Import performance data
   */
  importData(data: string): void {
    try {
      const parsed = JSON.parse(data);
      if (parsed.config) this.config = { ...this.config, ...parsed.config };
      if (parsed.stats) this.stats = { ...this.stats, ...parsed.stats };
      if (parsed.history) {
        this.fpsHistory = parsed.history.fps || [];
        this.memoryHistory = parsed.history.memory || [];
        this.renderTimeHistory = parsed.history.renderTime || [];
      }
    } catch (error) {
      console.error('Failed to import performance data:', error);
    }
  }

  /**
   * Reset all metrics
   */
  reset(): void {
    this.frameCount = 0;
    this.lastTime = performance.now();
    this.fpsHistory = [];
    this.renderTimeHistory = [];
    this.memoryHistory = [];
    this.drawCallCount = 0;
    this.eventListenerCount = 0;
    this.animationCount = 0;
    this.cachedNodeCount = 0;
    this.totalNodeCount = 0;
    
    this.stats = {
      fps: 0,
      memoryUsage: 0,
      renderTime: 0,
      drawCalls: 0,
      cachedNodes: 0,
      totalNodes: 0,
      animations: 0,
      eventListeners: 0,
      canvasSize: { width: 0, height: 0 },
      pixelRatio: 1,
      isOptimized: true,
      recommendations: []
    };
  }
}

export default PerformanceMonitor;