import React, { useState, useEffect, useCallback, useRef } from 'react';
import { 
  Activity, 
  Cpu, 
  MemoryStick, 
  HardDrive, 
  Zap, 
  Clock, 
  TrendingUp, 
  TrendingDown, 
  AlertTriangle, 
  CheckCircle, 
  XCircle, 
  Settings, 
  RefreshCw, 
  Pause, 
  Play, 
  Square, 
  BarChart3, 
  Monitor, 
  Battery, 
  Wifi, 
  WifiOff,
  X,
  Info,
  AlertCircle
} from 'lucide-react';

export interface PerformanceMetrics {
  fps: number;
  memoryUsage: number;
  cpuUsage: number;
  renderTime: number;
  objectCount: number;
  layerCount: number;
  canvasSize: { width: number; height: number };
  zoomLevel: number;
  lastUpdate: number;
}

export interface PerformanceSettings {
  enabled: boolean;
  updateInterval: number;
  showFPS: boolean;
  showMemory: boolean;
  showCPU: boolean;
  showRenderTime: boolean;
  showObjectCount: boolean;
  showLayerCount: boolean;
  showCanvasInfo: boolean;
  showZoomLevel: boolean;
  alertThresholds: {
    fps: number;
    memory: number;
    cpu: number;
    renderTime: number;
  };
  autoOptimize: boolean;
  logPerformance: boolean;
}

interface EnhancedPerformancePanelProps {
  metrics: PerformanceMetrics;
  onSettingsChange?: (settings: PerformanceSettings) => void;
  onOptimize?: () => void;
  onClearCache?: () => void;
  onResetMetrics?: () => void;
  className?: string;
}

const defaultSettings: PerformanceSettings = {
  enabled: true,
  updateInterval: 1000,
  showFPS: true,
  showMemory: true,
  showCPU: true,
  showRenderTime: true,
  showObjectCount: true,
  showLayerCount: true,
  showCanvasInfo: true,
  showZoomLevel: true,
  alertThresholds: {
    fps: 30,
    memory: 80,
    cpu: 80,
    renderTime: 16
  },
  autoOptimize: false,
  logPerformance: false
};

export const EnhancedPerformancePanel: React.FC<EnhancedPerformancePanelProps> = ({
  metrics,
  onSettingsChange,
  onOptimize,
  onClearCache,
  onResetMetrics,
  className = ''
}) => {
  const [settings, setSettings] = useState<PerformanceSettings>(defaultSettings);
  const [isExpanded, setIsExpanded] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [isMonitoring, setIsMonitoring] = useState(true);
  const [performanceLog, setPerformanceLog] = useState<PerformanceMetrics[]>([]);
  const [alerts, setAlerts] = useState<string[]>([]);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  // Performance monitoring
  useEffect(() => {
    if (!settings.enabled || !isMonitoring) return;

    const interval = setInterval(() => {
      // Check for performance alerts
      const newAlerts: string[] = [];
      
      if (metrics.fps < settings.alertThresholds.fps) {
        newAlerts.push(`Low FPS: ${metrics.fps.toFixed(1)}`);
      }
      
      if (metrics.memoryUsage > settings.alertThresholds.memory) {
        newAlerts.push(`High Memory: ${metrics.memoryUsage.toFixed(1)}%`);
      }
      
      if (metrics.cpuUsage > settings.alertThresholds.cpu) {
        newAlerts.push(`High CPU: ${metrics.cpuUsage.toFixed(1)}%`);
      }
      
      if (metrics.renderTime > settings.alertThresholds.renderTime) {
        newAlerts.push(`Slow Render: ${metrics.renderTime.toFixed(1)}ms`);
      }

      setAlerts(newAlerts);

      // Log performance data
      if (settings.logPerformance) {
        setPerformanceLog(prev => [...prev.slice(-99), metrics]);
      }

      // Auto-optimize if enabled
      if (settings.autoOptimize && newAlerts.length > 0) {
        onOptimize?.();
      }
    }, settings.updateInterval);

    intervalRef.current = interval;

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [settings, isMonitoring, metrics, onOptimize]);

  const getPerformanceStatus = () => {
    const alertCount = alerts.length;
    if (alertCount === 0) return 'excellent';
    if (alertCount <= 2) return 'good';
    if (alertCount <= 4) return 'warning';
    return 'critical';
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'excellent': return 'text-green-500';
      case 'good': return 'text-blue-500';
      case 'warning': return 'text-yellow-500';
      case 'critical': return 'text-red-500';
      default: return 'text-gray-500';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'excellent': return CheckCircle;
      case 'good': return CheckCircle;
      case 'warning': return AlertTriangle;
      case 'critical': return XCircle;
      default: return AlertCircle;
    }
  };

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const handleSettingsChange = (newSettings: Partial<PerformanceSettings>) => {
    const updatedSettings = { ...settings, ...newSettings };
    setSettings(updatedSettings);
    onSettingsChange?.(updatedSettings);
  };

  const handleOptimize = () => {
    onOptimize?.();
    setAlerts([]);
  };

  const handleClearCache = () => {
    onClearCache?.();
    setPerformanceLog([]);
  };

  const handleResetMetrics = () => {
    onResetMetrics?.();
    setAlerts([]);
    setPerformanceLog([]);
  };

  const status = getPerformanceStatus();
  const StatusIcon = getStatusIcon(status);

  if (!settings.enabled) return null;

  return (
    <div className={`bg-white border border-gray-200 rounded-lg shadow-lg ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200">
        <div className="flex items-center space-x-2">
          <Activity className="w-5 h-5 text-blue-500" />
          <h3 className="text-lg font-semibold">Performance Monitor</h3>
          <div className={`flex items-center space-x-1 ${getStatusColor(status)}`}>
            <StatusIcon className="w-4 h-4" />
            <span className="text-sm font-medium capitalize">{status}</span>
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setIsMonitoring(!isMonitoring)}
            className={`p-2 rounded ${isMonitoring ? 'bg-red-100 text-red-600' : 'bg-green-100 text-green-600'}`}
            title={isMonitoring ? 'Pause Monitoring' : 'Resume Monitoring'}
          >
            {isMonitoring ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
          </button>
          
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="p-2 rounded hover:bg-gray-100"
            title={isExpanded ? 'Collapse' : 'Expand'}
          >
            <BarChart3 className="w-4 h-4" />
          </button>
          
          <button
            onClick={() => setShowSettings(true)}
            className="p-2 rounded hover:bg-gray-100"
            title="Settings"
          >
            <Settings className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Metrics Grid */}
      <div className="p-4">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {settings.showFPS && (
            <div className="bg-gray-50 rounded-lg p-3">
              <div className="flex items-center space-x-2 mb-1">
                <Zap className="w-4 h-4 text-blue-500" />
                <span className="text-sm font-medium">FPS</span>
              </div>
              <div className="text-2xl font-bold text-blue-600">
                {metrics.fps.toFixed(1)}
              </div>
              <div className="text-xs text-gray-500">
                {metrics.fps >= 60 ? 'Excellent' : metrics.fps >= 30 ? 'Good' : 'Poor'}
              </div>
            </div>
          )}

          {settings.showMemory && (
            <div className="bg-gray-50 rounded-lg p-3">
              <div className="flex items-center space-x-2 mb-1">
                <MemoryStick className="w-4 h-4 text-green-500" />
                <span className="text-sm font-medium">Memory</span>
              </div>
              <div className="text-2xl font-bold text-green-600">
                {metrics.memoryUsage.toFixed(1)}%
              </div>
              <div className="text-xs text-gray-500">
                {formatBytes(metrics.memoryUsage * 1024 * 1024)}
              </div>
            </div>
          )}

          {settings.showCPU && (
            <div className="bg-gray-50 rounded-lg p-3">
              <div className="flex items-center space-x-2 mb-1">
                <Cpu className="w-4 h-4 text-purple-500" />
                <span className="text-sm font-medium">CPU</span>
              </div>
              <div className="text-2xl font-bold text-purple-600">
                {metrics.cpuUsage.toFixed(1)}%
              </div>
              <div className="text-xs text-gray-500">
                {metrics.cpuUsage < 50 ? 'Low' : metrics.cpuUsage < 80 ? 'Medium' : 'High'}
              </div>
            </div>
          )}

          {settings.showRenderTime && (
            <div className="bg-gray-50 rounded-lg p-3">
              <div className="flex items-center space-x-2 mb-1">
                <Clock className="w-4 h-4 text-orange-500" />
                <span className="text-sm font-medium">Render</span>
              </div>
              <div className="text-2xl font-bold text-orange-600">
                {metrics.renderTime.toFixed(1)}ms
              </div>
              <div className="text-xs text-gray-500">
                {metrics.renderTime < 16 ? 'Fast' : metrics.renderTime < 33 ? 'Normal' : 'Slow'}
              </div>
            </div>
          )}

          {settings.showObjectCount && (
            <div className="bg-gray-50 rounded-lg p-3">
              <div className="flex items-center space-x-2 mb-1">
                <Square className="w-4 h-4 text-indigo-500" />
                <span className="text-sm font-medium">Objects</span>
              </div>
              <div className="text-2xl font-bold text-indigo-600">
                {metrics.objectCount}
              </div>
              <div className="text-xs text-gray-500">
                {metrics.objectCount < 50 ? 'Light' : metrics.objectCount < 200 ? 'Medium' : 'Heavy'}
              </div>
            </div>
          )}

          {settings.showLayerCount && (
            <div className="bg-gray-50 rounded-lg p-3">
              <div className="flex items-center space-x-2 mb-1">
                <Monitor className="w-4 h-4 text-pink-500" />
                <span className="text-sm font-medium">Layers</span>
              </div>
              <div className="text-2xl font-bold text-pink-600">
                {metrics.layerCount}
              </div>
              <div className="text-xs text-gray-500">
                {metrics.layerCount < 5 ? 'Simple' : metrics.layerCount < 20 ? 'Complex' : 'Very Complex'}
              </div>
            </div>
          )}

          {settings.showCanvasInfo && (
            <div className="bg-gray-50 rounded-lg p-3">
              <div className="flex items-center space-x-2 mb-1">
                <HardDrive className="w-4 h-4 text-teal-500" />
                <span className="text-sm font-medium">Canvas</span>
              </div>
              <div className="text-lg font-bold text-teal-600">
                {metrics.canvasSize.width}×{metrics.canvasSize.height}
              </div>
              <div className="text-xs text-gray-500">
                {formatBytes(metrics.canvasSize.width * metrics.canvasSize.height * 4)}
              </div>
            </div>
          )}

          {settings.showZoomLevel && (
            <div className="bg-gray-50 rounded-lg p-3">
              <div className="flex items-center space-x-2 mb-1">
                <TrendingUp className="w-4 h-4 text-cyan-500" />
                <span className="text-sm font-medium">Zoom</span>
              </div>
              <div className="text-2xl font-bold text-cyan-600">
                {Math.round(metrics.zoomLevel * 100)}%
              </div>
              <div className="text-xs text-gray-500">
                {metrics.zoomLevel < 0.5 ? 'Zoomed Out' : metrics.zoomLevel > 2 ? 'Zoomed In' : 'Normal'}
              </div>
            </div>
          )}
        </div>

        {/* Alerts */}
        {alerts.length > 0 && (
          <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
            <div className="flex items-center space-x-2 mb-2">
              <AlertTriangle className="w-4 h-4 text-red-500" />
              <span className="text-sm font-medium text-red-700">Performance Alerts</span>
            </div>
            <div className="space-y-1">
              {alerts.map((alert, index) => (
                <div key={index} className="text-sm text-red-600">
                  • {alert}
                </div>
              ))}
            </div>
            <div className="mt-2 flex space-x-2">
              <button
                onClick={handleOptimize}
                className="px-3 py-1 text-xs bg-red-100 text-red-700 rounded hover:bg-red-200"
              >
                Optimize
              </button>
              <button
                onClick={() => setAlerts([])}
                className="px-3 py-1 text-xs bg-gray-100 text-gray-700 rounded hover:bg-gray-200"
              >
                Dismiss
              </button>
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="mt-4 flex space-x-2">
          <button
            onClick={handleOptimize}
            className="px-4 py-2 text-sm bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Optimize Performance
          </button>
          <button
            onClick={handleClearCache}
            className="px-4 py-2 text-sm bg-gray-100 text-gray-700 rounded hover:bg-gray-200"
          >
            Clear Cache
          </button>
          <button
            onClick={handleResetMetrics}
            className="px-4 py-2 text-sm bg-gray-100 text-gray-700 rounded hover:bg-gray-200"
          >
            Reset Metrics
          </button>
        </div>
      </div>

      {/* Settings Modal */}
      {showSettings && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Performance Settings</h3>
              <button
                onClick={() => setShowSettings(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium">Enable Monitoring</label>
                <input
                  type="checkbox"
                  checked={settings.enabled}
                  onChange={(e) => handleSettingsChange({ enabled: e.target.checked })}
                  className="rounded"
                />
              </div>

              <div className="flex items-center justify-between">
                <label className="text-sm font-medium">Auto Optimize</label>
                <input
                  type="checkbox"
                  checked={settings.autoOptimize}
                  onChange={(e) => handleSettingsChange({ autoOptimize: e.target.checked })}
                  className="rounded"
                />
              </div>

              <div className="flex items-center justify-between">
                <label className="text-sm font-medium">Log Performance</label>
                <input
                  type="checkbox"
                  checked={settings.logPerformance}
                  onChange={(e) => handleSettingsChange({ logPerformance: e.target.checked })}
                  className="rounded"
                />
              </div>

              <div>
                <label className="text-sm font-medium block mb-2">
                  Update Interval: {settings.updateInterval}ms
                </label>
                <input
                  type="range"
                  min="100"
                  max="5000"
                  step="100"
                  value={settings.updateInterval}
                  onChange={(e) => handleSettingsChange({ updateInterval: parseInt(e.target.value) })}
                  className="w-full"
                />
              </div>

              <div className="space-y-2">
                <h4 className="text-sm font-medium">Display Options</h4>
                {Object.entries(settings).filter(([key]) => key.startsWith('show')).map(([key, value]) => (
                  <div key={key} className="flex items-center justify-between">
                    <label className="text-sm">{key.replace('show', '').replace(/([A-Z])/g, ' $1').trim()}</label>
                    <input
                      type="checkbox"
                      checked={value as boolean}
                      onChange={(e) => handleSettingsChange({ [key]: e.target.checked })}
                      className="rounded"
                    />
                  </div>
                ))}
              </div>
            </div>

            <div className="flex items-center justify-between mt-6 pt-4 border-t">
              <button
                onClick={() => setShowSettings(false)}
                className="px-4 py-2 text-sm bg-gray-100 text-gray-700 rounded hover:bg-gray-200"
              >
                Cancel
              </button>
              <button
                onClick={() => setShowSettings(false)}
                className="px-4 py-2 text-sm bg-blue-600 text-white rounded hover:bg-blue-700"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// Hook for performance monitoring
export const usePerformanceMonitoring = () => {
  const [metrics, setMetrics] = useState<PerformanceMetrics>({
    fps: 60,
    memoryUsage: 0,
    cpuUsage: 0,
    renderTime: 0,
    objectCount: 0,
    layerCount: 1,
    canvasSize: { width: 1080, height: 1080 },
    zoomLevel: 1,
    lastUpdate: Date.now()
  });

  const updateMetrics = useCallback((newMetrics: Partial<PerformanceMetrics>) => {
    setMetrics(prev => ({
      ...prev,
      ...newMetrics,
      lastUpdate: Date.now()
    }));
  }, []);

  const getMemoryUsage = useCallback(() => {
    if ('memory' in performance) {
      const memory = (performance as any).memory;
      return (memory.usedJSHeapSize / memory.jsHeapSizeLimit) * 100;
    }
    return 0;
  }, []);

  const measureRenderTime = useCallback((renderFn: () => void) => {
    const start = performance.now();
    renderFn();
    const end = performance.now();
    return end - start;
  }, []);

  return {
    metrics,
    updateMetrics,
    getMemoryUsage,
    measureRenderTime
  };
};
