import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Zap, Target, TrendingUp, Clock, MemoryStick } from 'lucide-react';

interface BenchmarkResult {
  id: string;
  name: string;
  target: number;
  current: number;
  unit: string;
  status: 'excellent' | 'good' | 'warning' | 'poor';
  trend: 'up' | 'down' | 'stable';
}

interface PerformanceMetrics {
  fps: number;
  renderTime: number;
  memoryUsage: number;
  loadTime: number;
  interactionDelay: number;
}

export const PerformanceBenchmark: React.FC = () => {
  const [showBenchmark, setShowBenchmark] = useState(false);
  const [isRunning, setIsRunning] = useState(false);
  const [results, setResults] = useState<BenchmarkResult[]>([]);
  const [metrics, setMetrics] = useState<PerformanceMetrics>({
    fps: 0,
    renderTime: 0,
    memoryUsage: 0,
    loadTime: 0,
    interactionDelay: 0
  });

  const benchmarkTargets = [
    { name: 'Frame Rate', target: 60, unit: 'fps', key: 'fps' },
    { name: 'Render Time', target: 16, unit: 'ms', key: 'renderTime' },
    { name: 'Memory Usage', target: 100, unit: 'MB', key: 'memoryUsage' },
    { name: 'Load Time', target: 2000, unit: 'ms', key: 'loadTime' },
    { name: 'Interaction Delay', target: 100, unit: 'ms', key: 'interactionDelay' }
  ];

  // Run performance benchmark
  const runBenchmark = async () => {
    setIsRunning(true);
    const startTime = performance.now();
    
    // FPS measurement
    let frameCount = 0;
    const fpsStart = performance.now();
    const measureFPS = () => {
      frameCount++;
      if (performance.now() - fpsStart < 1000) {
        requestAnimationFrame(measureFPS);
      } else {
        const fps = frameCount;
        setMetrics(prev => ({ ...prev, fps }));
      }
    };
    requestAnimationFrame(measureFPS);

    // Render time measurement
    const renderStart = performance.now();
    const canvas = document.querySelector('canvas');
    if (canvas) {
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.fillStyle = '#000';
        ctx.fillRect(0, 0, 100, 100);
      }
    }
    const renderTime = performance.now() - renderStart;

    // Memory usage
    const memory = (performance as any).memory;
    const memoryUsage = memory ? memory.usedJSHeapSize / 1024 / 1024 : 0;

    // Interaction delay test
    const interactionStart = performance.now();
    await new Promise(resolve => setTimeout(resolve, 50));
    const interactionDelay = performance.now() - interactionStart;

    const loadTime = performance.now() - startTime;

    const newMetrics = {
      fps: frameCount,
      renderTime,
      memoryUsage,
      loadTime,
      interactionDelay
    };

    setMetrics(newMetrics);

    // Generate results
    const benchmarkResults = benchmarkTargets.map(target => {
      const current = newMetrics[target.key as keyof PerformanceMetrics];
      const ratio = target.key === 'fps' ? current / target.target : target.target / current;
      
      let status: BenchmarkResult['status'];
      if (ratio >= 0.9) status = 'excellent';
      else if (ratio >= 0.7) status = 'good';
      else if (ratio >= 0.5) status = 'warning';
      else status = 'poor';

      return {
        id: target.key,
        name: target.name,
        target: target.target,
        current: Math.round(current * 100) / 100,
        unit: target.unit,
        status,
        trend: 'stable' as const
      };
    });

    setResults(benchmarkResults);
    setIsRunning(false);
  };

  // Auto-run benchmark on mount
  useEffect(() => {
    if (showBenchmark && results.length === 0) {
      runBenchmark();
    }
  }, [showBenchmark]);

  const getStatusColor = (status: BenchmarkResult['status']) => {
    switch (status) {
      case 'excellent': return 'text-green-600 bg-green-50';
      case 'good': return 'text-blue-600 bg-blue-50';
      case 'warning': return 'text-yellow-600 bg-yellow-50';
      case 'poor': return 'text-red-600 bg-red-50';
    }
  };

  const getOverallScore = () => {
    if (results.length === 0) return 0;
    const scores = results.map(r => {
      switch (r.status) {
        case 'excellent': return 100;
        case 'good': return 80;
        case 'warning': return 60;
        case 'poor': return 40;
      }
    });
    return Math.round(scores.reduce((a, b) => a + b, 0) / scores.length);
  };

  if (!showBenchmark) {
    return (
      <motion.button
        onClick={() => setShowBenchmark(true)}
        className="fixed top-4 left-16 z-40 bg-orange-500 text-white p-2 rounded-full shadow-lg hover:bg-orange-600"
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        title="Performance Benchmark"
      >
        <Zap size={16} />
      </motion.button>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: -100 }}
      animate={{ opacity: 1, y: 0 }}
      className="fixed top-4 left-16 z-40 bg-white rounded-lg shadow-xl p-4 w-80"
    >
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold flex items-center gap-2">
          <Zap size={16} />
          Performance
        </h3>
        <button
          onClick={() => setShowBenchmark(false)}
          className="text-gray-400 hover:text-gray-600"
        >
          ×
        </button>
      </div>

      {/* Overall Score */}
      <div className="text-center mb-4">
        <div className="text-2xl font-bold text-blue-600">{getOverallScore()}</div>
        <div className="text-sm text-gray-600">Performance Score</div>
      </div>

      {/* Benchmark Results */}
      {isRunning ? (
        <div className="text-center py-4">
          <div className="w-6 h-6 border-2 border-orange-500 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
          <p className="text-sm">Running benchmark...</p>
        </div>
      ) : (
        <div className="space-y-2">
          {results.map(result => (
            <div key={result.id} className={`p-2 rounded ${getStatusColor(result.status)}`}>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">{result.name}</span>
                <div className="flex items-center gap-1">
                  <span className="text-sm">{result.current}{result.unit}</span>
                  <Target size={12} />
                </div>
              </div>
              <div className="text-xs opacity-75">
                Target: {result.target}{result.unit}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Actions */}
      <div className="mt-4 flex gap-2">
        <button
          onClick={runBenchmark}
          disabled={isRunning}
          className="flex-1 bg-orange-500 text-white py-2 px-3 rounded text-sm hover:bg-orange-600 disabled:opacity-50"
        >
          Re-run
        </button>
      </div>
    </motion.div>
  );
};