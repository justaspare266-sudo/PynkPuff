/**
 * Advanced Performance Optimization Hook
 * Integrates all performance utilities for maximum efficiency
 */

import { useRef, useEffect, useCallback, useMemo } from 'react';
import PerformanceMonitor from '../../utils/PerformanceMonitor';
import RenderOptimizer from '../../utils/RenderOptimizer';
import MemoryManager from '../../utils/memoryManager';
import EventOptimizer from '../../utils/EventOptimizer';

export interface PerformanceOptimizationConfig {
  // Performance monitoring
  targetFPS: number;
  maxMemoryUsage: number;
  maxRenderTime: number;
  enablePerformanceMonitoring: boolean;
  
  // Render optimization
  enableViewportCulling: boolean;
  enableObjectPooling: boolean;
  enableSmartCaching: boolean;
  enableBatchRendering: boolean;
  maxVisibleObjects: number;
  
  // Memory management
  enableMemoryManagement: boolean;
  gcThreshold: number;
  enableImagePooling: boolean;
  
  // Event optimization
  enableEventOptimization: boolean;
  enableEventDelegation: boolean;
  enableThrottling: boolean;
  enableDebouncing: boolean;
  maxEventListeners: number;
}

export interface PerformanceOptimizationStats {
  fps: number;
  memoryUsage: number;
  renderTime: number;
  visibleObjects: number;
  totalObjects: number;
  eventListeners: number;
  performanceScore: number;
  recommendations: string[];
}

export const usePerformanceOptimization = (
  config: Partial<PerformanceOptimizationConfig> = {}
) => {
  const performanceMonitorRef = useRef<PerformanceMonitor | null>(null);
  const renderOptimizerRef = useRef<RenderOptimizer | null>(null);
  const memoryManagerRef = useRef<MemoryManager | null>(null);
  const eventOptimizerRef = useRef<EventOptimizer | null>(null);

  const defaultConfig: PerformanceOptimizationConfig = {
    targetFPS: 60,
    maxMemoryUsage: 200,
    maxRenderTime: 16.67,
    enablePerformanceMonitoring: true,
    enableViewportCulling: true,
    enableObjectPooling: true,
    enableSmartCaching: true,
    enableBatchRendering: true,
    maxVisibleObjects: 1000,
    enableMemoryManagement: true,
    gcThreshold: 0.8,
    enableImagePooling: true,
    enableEventOptimization: true,
    enableEventDelegation: true,
    enableThrottling: true,
    enableDebouncing: true,
    maxEventListeners: 1000,
    ...config
  };

  // Initialize performance utilities
  useEffect(() => {
    if (defaultConfig.enablePerformanceMonitoring) {
      performanceMonitorRef.current = new PerformanceMonitor({
        targetFPS: defaultConfig.targetFPS,
        maxMemoryUsage: defaultConfig.maxMemoryUsage,
        maxRenderTime: defaultConfig.maxRenderTime,
        enableMemoryTracking: true,
        enableRenderTracking: true,
        enableEventTracking: true,
        enableAnimationTracking: true,
        enableOptimizationRecommendations: true
      });
      performanceMonitorRef.current.start();
    }

    if (defaultConfig.enableViewportCulling || defaultConfig.enableObjectPooling || defaultConfig.enableSmartCaching) {
      renderOptimizerRef.current = new RenderOptimizer({
        enableViewportCulling: defaultConfig.enableViewportCulling,
        enableObjectPooling: defaultConfig.enableObjectPooling,
        enableSmartCaching: defaultConfig.enableSmartCaching,
        enableLazyLoading: true,
        enableBatchRendering: defaultConfig.enableBatchRendering,
        maxVisibleObjects: defaultConfig.maxVisibleObjects,
        cacheThreshold: 0.7,
        renderDistance: 1.5,
        frameSkipThreshold: defaultConfig.maxRenderTime
      });
    }

    if (defaultConfig.enableMemoryManagement) {
      memoryManagerRef.current = new MemoryManager({
        maxMemoryUsage: defaultConfig.maxMemoryUsage,
        gcThreshold: defaultConfig.gcThreshold,
        enableObjectPooling: defaultConfig.enableObjectPooling,
        enableImagePooling: defaultConfig.enableImagePooling,
        enableTexturePooling: true,
        poolSize: 100,
        gcInterval: 30000,
        enableMemoryLeakDetection: true,
        maxObjectAge: 300000
      });
      memoryManagerRef.current.start();
    }

    if (defaultConfig.enableEventOptimization) {
      eventOptimizerRef.current = new EventOptimizer({
        enableEventDelegation: defaultConfig.enableEventDelegation,
        enableThrottling: defaultConfig.enableThrottling,
        enableDebouncing: defaultConfig.enableDebouncing,
        throttleDelay: 16,
        debounceDelay: 100,
        maxEventListeners: defaultConfig.maxEventListeners,
        enableEventPooling: true,
        enableSmartEventHandling: true,
        eventBatchSize: 10
      });
    }

    return () => {
      performanceMonitorRef.current?.cleanup();
      renderOptimizerRef.current?.cleanup();
      memoryManagerRef.current?.cleanup();
      eventOptimizerRef.current?.cleanup();
    };
  }, []);

  // Update viewport for culling
  const updateViewport = useCallback((bounds: { x: number; y: number; width: number; height: number; scale: number }) => {
    if (renderOptimizerRef.current) {
      renderOptimizerRef.current.updateViewport(bounds);
    }
  }, []);

  // Register object for memory tracking
  const registerObject = useCallback((id: string, object: any, size?: number) => {
    if (memoryManagerRef.current) {
      memoryManagerRef.current.registerObject(id, object, size);
    }
  }, []);

  // Unregister object
  const unregisterObject = useCallback((id: string) => {
    if (memoryManagerRef.current) {
      memoryManagerRef.current.unregisterObject(id);
    }
  }, []);

  // Get pooled object
  const getPooledObject = useCallback((type: string, createFn: () => any) => {
    if (renderOptimizerRef.current) {
      return renderOptimizerRef.current.getPooledObject(type, createFn);
    }
    return createFn();
  }, []);

  // Return object to pool
  const returnToPool = useCallback((type: string, object: any) => {
    if (renderOptimizerRef.current) {
      renderOptimizerRef.current.returnToPool(type, object);
    }
  }, []);

  // Get pooled image
  const getPooledImage = useCallback((key: string, createFn: () => HTMLImageElement) => {
    if (memoryManagerRef.current) {
      return memoryManagerRef.current.getPooledImage(key, createFn);
    }
    return createFn();
  }, []);

  // Return image to pool
  const returnImage = useCallback((key: string, image: HTMLImageElement) => {
    if (memoryManagerRef.current) {
      memoryManagerRef.current.returnImage(key, image);
    }
  }, []);

  // Add event handler
  const addEventHandler = useCallback((
    id: string,
    type: string,
    handler: Function,
    element: any,
    options?: { throttled?: boolean; debounced?: boolean; priority?: number }
  ) => {
    if (eventOptimizerRef.current) {
      eventOptimizerRef.current.addEventHandler(id, type, handler, element, options);
    }
  }, []);

  // Remove event handler
  const removeEventHandler = useCallback((id: string) => {
    if (eventOptimizerRef.current) {
      eventOptimizerRef.current.removeEventHandler(id);
    }
  }, []);

  // Handle event
  const handleEvent = useCallback((type: string, data: any, element?: any) => {
    if (eventOptimizerRef.current) {
      eventOptimizerRef.current.handleEvent(type, data, element);
    }
  }, []);

  // Throttle function
  const throttle = useCallback(<T extends (...args: any[]) => any>(
    func: T,
    delay?: number
  ): T => {
    if (eventOptimizerRef.current) {
      return eventOptimizerRef.current.throttle(func, delay);
    }
    return func;
  }, []);

  // Debounce function
  const debounce = useCallback(<T extends (...args: any[]) => any>(
    func: T,
    delay?: number
  ): T => {
    if (eventOptimizerRef.current) {
      return eventOptimizerRef.current.debounce(func, delay);
    }
    return func;
  }, []);

  // Check if object is visible
  const isObjectVisible = useCallback((object: any) => {
    if (renderOptimizerRef.current) {
      return renderOptimizerRef.current.isObjectVisible(object);
    }
    return true;
  }, []);

  // Optimize object for rendering
  const optimizeObject = useCallback((object: any, objectId: string, totalObjects: number) => {
    if (renderOptimizerRef.current) {
      renderOptimizerRef.current.optimizeObject(object, objectId, totalObjects);
    }
  }, []);

  // Record render time
  const recordRenderTime = useCallback((renderTime: number) => {
    if (performanceMonitorRef.current) {
      performanceMonitorRef.current.recordRenderTime(renderTime);
    }
  }, []);

  // Force garbage collection
  const forceGC = useCallback(() => {
    if (memoryManagerRef.current) {
      memoryManagerRef.current.forceGC();
    }
  }, []);

  // Get performance stats
  const getStats = useCallback((): PerformanceOptimizationStats => {
    const performanceStats = performanceMonitorRef.current?.getStats() || {
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

    const renderStats = renderOptimizerRef.current?.getStats() || {
      visibleObjects: 0,
      culledObjects: 0,
      cachedObjects: 0,
      pooledObjects: 0,
      renderBatches: 0,
      skippedFrames: 0,
      averageRenderTime: 0
    };

    const memoryStats = memoryManagerRef.current?.getStats() || {
      currentUsage: 0,
      peakUsage: 0,
      objectCount: 0,
      pooledObjects: 0,
      garbageCollections: 0,
      memoryLeaks: 0,
      averageGCTime: 0,
      lastGC: 0
    };

    const eventStats = eventOptimizerRef.current?.getStats() || {
      totalEvents: 0,
      throttledEvents: 0,
      debouncedEvents: 0,
      delegatedEvents: 0,
      pooledEvents: 0,
      eventListeners: 0,
      averageEventTime: 0,
      droppedEvents: 0
    };

    // Calculate performance score
    const performanceScore = performanceMonitorRef.current?.getPerformanceScore() || 0;

    // Combine recommendations
    const recommendations = [
      ...performanceStats.recommendations,
      ...(renderOptimizerRef.current?.getRecommendations() || []),
      ...(memoryManagerRef.current?.getRecommendations() || []),
      ...(eventOptimizerRef.current?.getRecommendations() || [])
    ];

    return {
      fps: performanceStats.fps,
      memoryUsage: performanceStats.memoryUsage,
      renderTime: performanceStats.renderTime,
      visibleObjects: renderStats.visibleObjects,
      totalObjects: performanceStats.totalNodes,
      eventListeners: eventStats.eventListeners,
      performanceScore,
      recommendations
    };
  }, []);

  // Memoized performance stats
  const stats = useMemo(() => getStats(), [getStats]);

  return {
    // Core functions
    updateViewport,
    registerObject,
    unregisterObject,
    getPooledObject,
    returnToPool,
    getPooledImage,
    returnImage,
    addEventHandler,
    removeEventHandler,
    handleEvent,
    throttle,
    debounce,
    isObjectVisible,
    optimizeObject,
    recordRenderTime,
    forceGC,
    
    // Stats and monitoring
    getStats,
    stats,
    
    // Refs for direct access
    performanceMonitor: performanceMonitorRef.current,
    renderOptimizer: renderOptimizerRef.current,
    memoryManager: memoryManagerRef.current,
    eventOptimizer: eventOptimizerRef.current
  };
};

export default usePerformanceOptimization;
