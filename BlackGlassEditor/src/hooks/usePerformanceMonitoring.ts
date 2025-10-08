import { useState, useCallback, useRef, useEffect } from 'react';

interface PerformanceMetrics {
  fps: number;
  memoryUsage: number;
  renderTime: number;
  drawCalls: number;
  cachedNodes: number;
  totalNodes: number;
  animations: number;
  eventListeners: number;
  isOptimized: boolean;
  recommendations: string[];
}

export const usePerformanceMonitoring = () => {
  const [metrics, setMetrics] = useState<PerformanceMetrics>({
    fps: 60,
    memoryUsage: 0,
    renderTime: 0,
    drawCalls: 0,
    cachedNodes: 0,
    totalNodes: 0,
    animations: 0,
    eventListeners: 0,
    isOptimized: true,
    recommendations: []
  });

  const frameCount = useRef(0);
  const lastTime = useRef(performance.now());
  const fpsInterval = useRef<NodeJS.Timeout | null>(null);

  const updateMetrics = useCallback((newMetrics: Partial<PerformanceMetrics>) => {
    setMetrics(prev => ({ ...prev, ...newMetrics }));
  }, []);

  const getMemoryUsage = useCallback(() => {
    if ('memory' in performance) {
      const memory = (performance as any).memory;
      return {
        used: memory.usedJSHeapSize,
        total: memory.totalJSHeapSize,
        limit: memory.jsHeapSizeLimit
      };
    }
    return { used: 0, total: 0, limit: 0 };
  }, []);

  const measureRenderTime = useCallback((renderFn: () => void) => {
    const start = performance.now();
    renderFn();
    const end = performance.now();
    const renderTime = end - start;
    updateMetrics({ renderTime });
    return renderTime;
  }, [updateMetrics]);

  useEffect(() => {
    const calculateFPS = () => {
      frameCount.current++;
      const currentTime = performance.now();
      const deltaTime = currentTime - lastTime.current;

      if (deltaTime >= 1000) {
        const fps = Math.round((frameCount.current * 1000) / deltaTime);
        updateMetrics({ fps });
        frameCount.current = 0;
        lastTime.current = currentTime;
      }
    };

    fpsInterval.current = setInterval(calculateFPS, 100);

    return () => {
      if (fpsInterval.current) {
        clearInterval(fpsInterval.current);
      }
    };
  }, [updateMetrics]);

  return {
    metrics,
    updateMetrics,
    getMemoryUsage,
    measureRenderTime
  };
};
