import React, { useState, useEffect, useRef } from 'react';
import { Activity, Cpu, HardDrive, Zap, AlertTriangle, CheckCircle, TrendingUp, Settings } from 'lucide-react';
import { sanitizeHtml } from '../utils/security';

interface PerformanceMetrics {
  fps: number;
  memoryUsage: number;
  memoryLimit: number;
  renderTime: number;
  objectCount: number;
  canvasSize: { width: number; height: number };
  zoom: number;
  timestamp: number;
}

interface PerformanceAlert {
  id: string;
  type: 'warning' | 'error' | 'info';
  message: string;
  timestamp: number;
  resolved: boolean;
}

interface PerformanceMonitorProps {
  isOpen: boolean;
  onClose: () => void;
  onOptimize: (suggestions: string[]) => void;
}

export const PerformanceMonitor: React.FC<PerformanceMonitorProps> = ({ isOpen, onClose, onOptimize }) => {
  const [metrics, setMetrics] = useState<PerformanceMetrics[]>([]);
  const [currentMetrics, setCurrentMetrics] = useState<PerformanceMetrics | null>(null);
  const [alerts, setAlerts] = useState<PerformanceAlert[]>([]);
  const [isMonitoring, setIsMonitoring] = useState(true);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const intervalRef = useRef<NodeJS.Timeout>();
  const frameRef = useRef<number>();
  const lastFrameTime = useRef<number>(0);

  // Performance monitoring
  useEffect(() => {
    if (!isMonitoring) return;

    const measurePerformance = () => {
      const now = performance.now();
      const fps = lastFrameTime.current ? 1000 / (now - lastFrameTime.current) : 60;
      lastFrameTime.current = now;

      // Get memory usage (if available)
      const memory = (performance as any).memory;
      const memoryUsage = memory ? memory.usedJSHeapSize / 1024 / 1024 : 0;
      const memoryLimit = memory ? memory.jsHeapSizeLimit / 1024 / 1024 : 0;

      const newMetrics: PerformanceMetrics = {
        fps: Math.round(fps * 10) / 10,
        memoryUsage: Math.round(memoryUsage * 10) / 10,
        memoryLimit: Math.round(memoryLimit * 10) / 10,
        renderTime: Math.round((now - lastFrameTime.current) * 100) / 100,
        objectCount: Math.floor(Math.random() * 100) + 50, // Mock data
        canvasSize: { width: 1920, height: 1080 }, // Mock data
        zoom: 1.0, // Mock data
        timestamp: now
      };

      setCurrentMetrics(newMetrics);
      setMetrics(prev => [...prev.slice(-59), newMetrics]); // Keep last 60 measurements

      // Check for performance issues
      checkPerformanceAlerts(newMetrics);

      frameRef.current = requestAnimationFrame(measurePerformance);
    };

    frameRef.current = requestAnimationFrame(measurePerformance);

    return () => {
      if (frameRef.current) {
        cancelAnimationFrame(frameRef.current);
      }
    };
  }, [isMonitoring]);

  const checkPerformanceAlerts = (metrics: PerformanceMetrics) => {
    const newAlerts: PerformanceAlert[] = [];

    // Low FPS warning
    if (metrics.fps < 30) {
      newAlerts.push({
        id: `fps-${Date.now()}`,
        type: 'warning',
        message: `Low FPS detected: ${metrics.fps}fps. Consider reducing canvas size or object count.`,
        timestamp: Date.now(),
        resolved: false
      });
    }

    // High memory usage
    if (metrics.memoryUsage > metrics.memoryLimit * 0.8) {
      newAlerts.push({
        id: `memory-${Date.now()}`,
        type: 'error',
        message: `High memory usage: ${metrics.memoryUsage}MB (${Math.round(metrics.memoryUsage / metrics.memoryLimit * 100)}%)`,
        timestamp: Date.now(),
        resolved: false
      });
    }

    // Too many objects
    if (metrics.objectCount > 200) {
      newAlerts.push({
        id: `objects-${Date.now()}`,
        type: 'warning',
        message: `High object count: ${metrics.objectCount} objects. Consider grouping or simplifying.`,
        timestamp: Date.now(),
        resolved: false
      });
    }

    if (newAlerts.length > 0) {
      setAlerts(prev => [...prev, ...newAlerts].slice(-10)); // Keep last 10 alerts
    }
  };

  const getOptimizationSuggestions = (): string[] => {
    if (!currentMetrics) return [];

    const suggestions: string[] = [];

    if (currentMetrics.fps < 30) {
      suggestions.push('Reduce canvas size or zoom level');
      suggestions.push('Group similar objects to reduce render calls');
      suggestions.push('Use lower quality settings for preview');
    }

    if (currentMetrics.memoryUsage > currentMetrics.memoryLimit * 0.7) {
      suggestions.push('Clear undo history to free memory');
      suggestions.push('Optimize large images before importing');
      suggestions.push('Remove unused assets from the project');
    }

    if (currentMetrics.objectCount > 150) {
      suggestions.push('Group related objects together');
      suggestions.push('Use symbols for repeated elements');
      suggestions.push('Consider flattening complex shapes');
    }

    return suggestions;
  };

  const getPerformanceScore = (): { score: number; status: string; color: string } => {
    if (!currentMetrics) return { score: 100, status: 'Excellent', color: 'text-green-600' };

    let score = 100;
    
    // FPS impact
    if (currentMetrics.fps < 60) score -= (60 - currentMetrics.fps) * 2;
    
    // Memory impact
    const memoryPercent = currentMetrics.memoryUsage / currentMetrics.memoryLimit;
    if (memoryPercent > 0.5) score -= (memoryPercent - 0.5) * 100;
    
    // Object count impact
    if (currentMetrics.objectCount > 100) score -= (currentMetrics.objectCount - 100) * 0.2;

    score = Math.max(0, Math.round(score));

    if (score >= 90) return { score, status: 'Excellent', color: 'text-green-600' };
    if (score >= 70) return { score, status: 'Good', color: 'text-blue-600' };
    if (score >= 50) return { score, status: 'Fair', color: 'text-yellow-600' };
    return { score, status: 'Poor', color: 'text-red-600' };
  };

  const resolveAlert = (alertId: string) => {
    setAlerts(prev => prev.map(alert =>
      alert.id === alertId ? { ...alert, resolved: true } : alert
    ));
  };

  const clearAlerts = () => {
    setAlerts([]);
  };

  const exportMetrics = () => {
    const data = JSON.stringify(metrics, null, 2);
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `performance-metrics-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  if (!isOpen) return null;

  const performanceScore = getPerformanceScore();
  const suggestions = getOptimizationSuggestions();

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-[90vw] h-[80vh] max-w-6xl flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b">
          <div>
            <h2 className="text-xl font-semibold flex items-center gap-2">
              <Activity className="w-5 h-5" />
              Performance Monitor
            </h2>
            <p className="text-sm text-gray-500">Real-time performance metrics and optimization</p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsMonitoring(!isMonitoring)}
              className={`px-3 py-1.5 rounded ${
                isMonitoring ? 'bg-green-500 text-white' : 'bg-gray-500 text-white'
              }`}
            >
              {isMonitoring ? 'Monitoring' : 'Paused'}
            </button>
            <button
              onClick={exportMetrics}
              className="px-3 py-1.5 border rounded hover:bg-gray-50"
            >
              Export Data
            </button>
            <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded">×</button>
          </div>
        </div>

        <div className="flex flex-1 overflow-hidden">
          {/* Main Metrics */}
          <div className="flex-1 p-4 space-y-4">
            {/* Performance Score */}
            <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold">Performance Score</h3>
                  <p className="text-sm text-gray-600">Overall system performance</p>
                </div>
                <div className="text-right">
                  <div className={`text-3xl font-bold ${performanceScore.color}`}>
                    {performanceScore.score}
                  </div>
                  <div className={`text-sm ${performanceScore.color}`}>
                    {performanceScore.status}
                  </div>
                </div>
              </div>
            </div>

            {/* Real-time Metrics */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-white border rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <TrendingUp className="w-4 h-4 text-blue-500" />
                  <span className="text-sm font-medium">FPS</span>
                </div>
                <div className="text-2xl font-bold">
                  {currentMetrics?.fps || 0}
                </div>
                <div className="text-xs text-gray-500">frames/sec</div>
              </div>

              <div className="bg-white border rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <HardDrive className="w-4 h-4 text-green-500" />
                  <span className="text-sm font-medium">Memory</span>
                </div>
                <div className="text-2xl font-bold">
                  {currentMetrics?.memoryUsage || 0}
                </div>
                <div className="text-xs text-gray-500">MB used</div>
              </div>

              <div className="bg-white border rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Cpu className="w-4 h-4 text-purple-500" />
                  <span className="text-sm font-medium">Objects</span>
                </div>
                <div className="text-2xl font-bold">
                  {currentMetrics?.objectCount || 0}
                </div>
                <div className="text-xs text-gray-500">on canvas</div>
              </div>

              <div className="bg-white border rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Zap className="w-4 h-4 text-yellow-500" />
                  <span className="text-sm font-medium">Render</span>
                </div>
                <div className="text-2xl font-bold">
                  {currentMetrics?.renderTime || 0}
                </div>
                <div className="text-xs text-gray-500">ms/frame</div>
              </div>
            </div>

            {/* Performance Chart */}
            <div className="bg-white border rounded-lg p-4">
              <h3 className="font-medium mb-3">FPS History</h3>
              <div className="h-32 flex items-end gap-1">
                {metrics.slice(-30).map((metric, index) => (
                  <div
                    key={index}
                    className="flex-1 bg-blue-500 rounded-t"
                    style={{ height: `${(metric.fps / 60) * 100}%` }}
                    title={`${metric.fps} FPS`}
                  />
                ))}
              </div>
              <div className="flex justify-between text-xs text-gray-500 mt-2">
                <span>30s ago</span>
                <span>Now</span>
              </div>
            </div>

            {/* Optimization Suggestions */}
            {suggestions.length > 0 && (
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <h3 className="font-medium mb-2 flex items-center gap-2">
                  <Zap className="w-4 h-4 text-yellow-600" />
                  Optimization Suggestions
                </h3>
                <ul className="space-y-1">
                  {suggestions.map((suggestion, index) => (
                    <li key={index} className="text-sm text-yellow-800 flex items-start gap-2">
                      <span className="w-1 h-1 bg-yellow-600 rounded-full mt-2 flex-shrink-0" />
                      {suggestion}
                    </li>
                  ))}
                </ul>
                <button
                  onClick={() => onOptimize(suggestions)}
                  className="mt-3 px-3 py-1.5 bg-yellow-600 text-white rounded hover:bg-yellow-700 text-sm"
                >
                  Apply Optimizations
                </button>
              </div>
            )}
          </div>

          {/* Sidebar - Alerts & Advanced */}
          <div className="w-80 border-l bg-gray-50 p-4 space-y-4">
            {/* Alerts */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-medium">Performance Alerts</h3>
                <button
                  onClick={clearAlerts}
                  className="text-xs text-gray-500 hover:text-gray-700"
                >
                  Clear All
                </button>
              </div>
              <div className="space-y-2 max-h-48 overflow-y-auto">
                {alerts.filter(alert => !alert.resolved).map(alert => (
                  <div
                    key={alert.id}
                    className={`p-3 rounded border-l-4 ${
                      alert.type === 'error' ? 'bg-red-50 border-red-400' :
                      alert.type === 'warning' ? 'bg-yellow-50 border-yellow-400' :
                      'bg-blue-50 border-blue-400'
                    }`}
                  >
                    <div className="flex items-start gap-2">
                      {alert.type === 'error' ? (
                        <AlertTriangle className="w-4 h-4 text-red-500 mt-0.5" />
                      ) : alert.type === 'warning' ? (
                        <AlertTriangle className="w-4 h-4 text-yellow-500 mt-0.5" />
                      ) : (
                        <CheckCircle className="w-4 h-4 text-blue-500 mt-0.5" />
                      )}
                      <div className="flex-1">
                        <p className="text-sm">{sanitizeHtml(alert.message)}</p>
                        <p className="text-xs text-gray-500 mt-1">
                          {new Date(alert.timestamp).toLocaleTimeString()}
                        </p>
                      </div>
                      <button
                        onClick={() => resolveAlert(alert.id)}
                        className="text-xs text-gray-500 hover:text-gray-700"
                      >
                        ×
                      </button>
                    </div>
                  </div>
                ))}
                {alerts.filter(alert => !alert.resolved).length === 0 && (
                  <div className="text-center text-gray-500 py-4">
                    <CheckCircle className="w-8 h-8 mx-auto mb-2 opacity-50" />
                    <p className="text-sm">No performance issues</p>
                  </div>
                )}
              </div>
            </div>

            {/* Advanced Settings */}
            <div>
              <button
                onClick={() => setShowAdvanced(!showAdvanced)}
                className="flex items-center gap-2 font-medium mb-3 hover:text-blue-600"
              >
                <Settings className="w-4 h-4" />
                Advanced Settings
              </button>
              {showAdvanced && (
                <div className="space-y-3 text-sm">
                  <div>
                    <label className="block text-gray-600 mb-1">Monitoring Interval</label>
                    <select className="w-full px-2 py-1 border rounded">
                      <option>Real-time (60fps)</option>
                      <option>High (30fps)</option>
                      <option>Medium (10fps)</option>
                      <option>Low (1fps)</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-gray-600 mb-1">Memory Threshold</label>
                    <input
                      type="range"
                      min="50"
                      max="90"
                      defaultValue="80"
                      className="w-full"
                    />
                    <div className="flex justify-between text-xs text-gray-500">
                      <span>50%</span>
                      <span>90%</span>
                    </div>
                  </div>
                  <div>
                    <label className="flex items-center gap-2">
                      <input type="checkbox" defaultChecked />
                      Auto-optimize on alerts
                    </label>
                  </div>
                  <div>
                    <label className="flex items-center gap-2">
                      <input type="checkbox" defaultChecked />
                      Show performance overlay
                    </label>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};