import React, { useState, useCallback, useRef, useEffect } from 'react';
import { 
  Activity, 
  Cpu, 
  MemoryStick, 
  HardDrive, 
  Wifi, 
  WifiOff,
  Zap,
  Settings,
  X,
  Check,
  AlertCircle,
  Info,
  Clock,
  Monitor,
  Smartphone,
  Tablet,
  Laptop,
  Monitor as Desktop,
  RefreshCw,
  Play,
  Pause,
  Square,
  SkipBack,
  SkipForward,
  FastForward,
  Rewind,
  Eye,
  EyeOff,
  Filter,
  Search,
  Calendar,
  User,
  Tag,
  Bookmark,
  Star,
  StarOff,
  Download,
  Upload,
  Layers,
  Type,
  Square as SquareIcon,
  Circle,
  Triangle,
  Star as StarIcon,
  ArrowRight,
  Heart,
  Image as ImageIcon,
  Palette,
  Filter as FilterIcon
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
  gpuUsage?: number;
  networkLatency?: number;
  batteryLevel?: number;
  temperature?: number;
  diskUsage?: number;
  cacheSize?: number;
  heapSize?: number;
  stackSize?: number;
  threadCount?: number;
  processCount?: number;
  uptime?: number;
  lastGc?: number;
  gcCount?: number;
  gcTime?: number;
  memoryLeaks?: number;
  performanceScore?: number;
  optimizationLevel?: number;
  bottleneckType?: string;
  bottleneckSeverity?: 'low' | 'medium' | 'high' | 'critical';
  recommendations?: string[];
  alerts?: PerformanceAlert[];
}

export interface PerformanceAlert {
  id: string;
  type: 'warning' | 'error' | 'info' | 'success';
  message: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  timestamp: Date;
  category: 'memory' | 'cpu' | 'gpu' | 'network' | 'rendering' | 'storage' | 'battery' | 'thermal';
  resolved: boolean;
  autoResolve: boolean;
  threshold?: number;
  currentValue?: number;
  recommendation?: string;
  action?: string;
}

export interface PerformanceSettings {
  monitoringEnabled: boolean;
  autoOptimization: boolean;
  alertThresholds: {
    fps: number;
    memoryUsage: number;
    cpuUsage: number;
    renderTime: number;
    gpuUsage: number;
    temperature: number;
  };
  updateInterval: number;
  historySize: number;
  enableLogging: boolean;
  enableProfiling: boolean;
  enableTracing: boolean;
  enableDebugging: boolean;
  enableAnalytics: boolean;
  enableReporting: boolean;
  enableNotifications: boolean;
  enableAlerts: boolean;
  enableAutoRecovery: boolean;
  enablePerformanceMode: boolean;
  enableBatterySaver: boolean;
  enableThermalThrottling: boolean;
  enableMemoryCompression: boolean;
  enableGpuAcceleration: boolean;
  enableHardwareAcceleration: boolean;
  enableWebGL: boolean;
  enableWebGL2: boolean;
  enableWebAssembly: boolean;
  enableServiceWorkers: boolean;
  enableCache: boolean;
  enableCDN: boolean;
  enableCompression: boolean;
  enableMinification: boolean;
  enableTreeShaking: boolean;
  enableCodeSplitting: boolean;
  enableLazyLoading: boolean;
  enablePrefetching: boolean;
  enablePreloading: boolean;
  enableOptimization: boolean;
}

interface EnhancedPerformanceMonitorProps {
  onOptimize?: () => void;
  onClearCache?: () => void;
  onResetMetrics?: () => void;
  onAlert?: (alert: PerformanceAlert) => void;
  onRecommendation?: (recommendation: string) => void;
  className?: string;
}

const defaultSettings: PerformanceSettings = {
  monitoringEnabled: true,
  autoOptimization: true,
  alertThresholds: {
    fps: 30,
    memoryUsage: 80,
    cpuUsage: 70,
    renderTime: 16.67,
    gpuUsage: 80,
    temperature: 80
  },
  updateInterval: 1000,
  historySize: 1000,
  enableLogging: true,
  enableProfiling: false,
  enableTracing: false,
  enableDebugging: false,
  enableAnalytics: true,
  enableReporting: false,
  enableNotifications: true,
  enableAlerts: true,
  enableAutoRecovery: true,
  enablePerformanceMode: false,
  enableBatterySaver: false,
  enableThermalThrottling: true,
  enableMemoryCompression: true,
  enableGpuAcceleration: true,
  enableHardwareAcceleration: true,
  enableWebGL: true,
  enableWebGL2: true,
  enableWebAssembly: true,
  enableServiceWorkers: true,
  enableCache: true,
  enableCDN: false,
  enableCompression: true,
  enableMinification: true,
  enableTreeShaking: true,
  enableCodeSplitting: true,
  enableLazyLoading: true,
  enablePrefetching: false,
  enablePreloading: false,
  enableOptimization: true
};

export const EnhancedPerformanceMonitor: React.FC<EnhancedPerformanceMonitorProps> = ({
  onOptimize,
  onClearCache,
  onResetMetrics,
  onAlert,
  onRecommendation,
  className = ''
}) => {
  const [metrics, setMetrics] = useState<PerformanceMetrics>({
    fps: 60,
    memoryUsage: 0,
    cpuUsage: 0,
    renderTime: 0,
    objectCount: 0,
    layerCount: 1,
    canvasSize: { width: 1080, height: 1080 },
    zoomLevel: 1,
    performanceScore: 100,
    optimizationLevel: 0,
    alerts: []
  });
  
  const [alerts, setAlerts] = useState<PerformanceAlert[]>([]);
  const [showSettings, setShowSettings] = useState(false);
  const [settings, setSettings] = useState<PerformanceSettings>(defaultSettings);
  const [isMonitoring, setIsMonitoring] = useState(true);
  const [showAlerts, setShowAlerts] = useState(false);
  const [selectedAlert, setSelectedAlert] = useState<PerformanceAlert | null>(null);
  const [history, setHistory] = useState<PerformanceMetrics[]>([]);
  const [isOptimizing, setIsOptimizing] = useState(false);
  const [optimizationProgress, setOptimizationProgress] = useState(0);
  
  const monitoringInterval = useRef<NodeJS.Timeout | null>(null);
  const performanceObserver = useRef<PerformanceObserver | null>(null);

  // Start monitoring
  const startMonitoring = useCallback(() => {
    if (monitoringInterval.current) return;
    
    monitoringInterval.current = setInterval(() => {
      updateMetrics();
    }, settings.updateInterval);
    
    setIsMonitoring(true);
  }, [settings.updateInterval]);

  // Stop monitoring
  const stopMonitoring = useCallback(() => {
    if (monitoringInterval.current) {
      clearInterval(monitoringInterval.current);
      monitoringInterval.current = null;
    }
    setIsMonitoring(false);
  }, []);

  // Update metrics
  const updateMetrics = useCallback(() => {
    const newMetrics: PerformanceMetrics = {
      fps: Math.round(1000 / (performance.now() - (metrics.renderTime || 0))),
      memoryUsage: (performance as any).memory?.usedJSHeapSize || 0,
      cpuUsage: 0, // Would need more sophisticated CPU monitoring
      renderTime: performance.now(),
      objectCount: 0, // Would be passed from parent
      layerCount: 1,
      canvasSize: { width: 1080, height: 1080 },
      zoomLevel: 1,
      performanceScore: 100,
      optimizationLevel: 0,
      alerts: []
    };
    
    setMetrics(newMetrics);
    
    // Add to history
    setHistory(prev => {
      const newHistory = [...prev, newMetrics];
      return newHistory.slice(-settings.historySize);
    });
    
    // Check for alerts
    checkAlerts(newMetrics);
  }, [metrics.renderTime, settings.historySize]);

  // Check for performance alerts
  const checkAlerts = useCallback((currentMetrics: PerformanceMetrics) => {
    const newAlerts: PerformanceAlert[] = [];
    
    if (currentMetrics.fps < settings.alertThresholds.fps) {
      newAlerts.push({
        id: `alert-fps-${Date.now()}`,
        type: 'warning',
        message: `Low FPS: ${currentMetrics.fps} (threshold: ${settings.alertThresholds.fps})`,
        severity: currentMetrics.fps < 15 ? 'critical' : 'medium',
        timestamp: new Date(),
        category: 'rendering',
        resolved: false,
        autoResolve: true,
        threshold: settings.alertThresholds.fps,
        currentValue: currentMetrics.fps,
        recommendation: 'Consider reducing object count or complexity'
      });
    }
    
    if (currentMetrics.memoryUsage > settings.alertThresholds.memoryUsage) {
      newAlerts.push({
        id: `alert-memory-${Date.now()}`,
        type: 'error',
        message: `High memory usage: ${currentMetrics.memoryUsage}% (threshold: ${settings.alertThresholds.memoryUsage}%)`,
        severity: currentMetrics.memoryUsage > 90 ? 'critical' : 'high',
        timestamp: new Date(),
        category: 'memory',
        resolved: false,
        autoResolve: false,
        threshold: settings.alertThresholds.memoryUsage,
        currentValue: currentMetrics.memoryUsage,
        recommendation: 'Clear cache or reduce memory usage'
      });
    }
    
    if (currentMetrics.renderTime > settings.alertThresholds.renderTime) {
      newAlerts.push({
        id: `alert-render-${Date.now()}`,
        type: 'warning',
        message: `Slow render time: ${currentMetrics.renderTime}ms (threshold: ${settings.alertThresholds.renderTime}ms)`,
        severity: currentMetrics.renderTime > 33 ? 'critical' : 'medium',
        timestamp: new Date(),
        category: 'rendering',
        resolved: false,
        autoResolve: true,
        threshold: settings.alertThresholds.renderTime,
        currentValue: currentMetrics.renderTime,
        recommendation: 'Optimize rendering pipeline'
      });
    }
    
    if (newAlerts.length > 0) {
      setAlerts(prev => [...prev, ...newAlerts]);
      newAlerts.forEach(alert => onAlert?.(alert));
    }
  }, [settings.alertThresholds, onAlert]);

  // Optimize performance
  const optimizePerformance = useCallback(async () => {
    setIsOptimizing(true);
    setOptimizationProgress(0);
    
    try {
      // Simulate optimization process
      for (let i = 0; i <= 100; i += 10) {
        setOptimizationProgress(i);
        await new Promise(resolve => setTimeout(resolve, 100));
      }
      
      // Clear resolved alerts
      setAlerts(prev => prev.filter(alert => !alert.autoResolve));
      
      onOptimize?.();
    } finally {
      setIsOptimizing(false);
      setOptimizationProgress(0);
    }
  }, [onOptimize]);

  // Clear cache
  const clearCache = useCallback(() => {
    if ('caches' in window) {
      caches.keys().then(names => {
        names.forEach(name => {
          caches.delete(name);
        });
      });
    }
    
    // Clear localStorage performance data
    localStorage.removeItem('image-editor-performance');
    
    onClearCache?.();
  }, [onClearCache]);

  // Reset metrics
  const resetMetrics = useCallback(() => {
    setMetrics({
      fps: 60,
      memoryUsage: 0,
      cpuUsage: 0,
      renderTime: 0,
      objectCount: 0,
      layerCount: 1,
      canvasSize: { width: 1080, height: 1080 },
      zoomLevel: 1,
      performanceScore: 100,
      optimizationLevel: 0,
      alerts: []
    });
    setHistory([]);
    setAlerts([]);
    onResetMetrics?.();
  }, [onResetMetrics]);

  // Resolve alert
  const resolveAlert = useCallback((alertId: string) => {
    setAlerts(prev => prev.map(alert => 
      alert.id === alertId ? { ...alert, resolved: true } : alert
    ));
  }, []);

  // Dismiss alert
  const dismissAlert = useCallback((alertId: string) => {
    setAlerts(prev => prev.filter(alert => alert.id !== alertId));
  }, []);

  // Get performance score color
  const getPerformanceScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600 bg-green-100';
    if (score >= 60) return 'text-yellow-600 bg-yellow-100';
    if (score >= 40) return 'text-orange-600 bg-orange-100';
    return 'text-red-600 bg-red-100';
  };

  // Get alert severity color
  const getAlertSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'text-red-600 bg-red-100';
      case 'high': return 'text-orange-600 bg-orange-100';
      case 'medium': return 'text-yellow-600 bg-yellow-100';
      case 'low': return 'text-blue-600 bg-blue-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  // Format memory size
  const formatMemorySize = (bytes: number) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  // Format date
  const formatDate = (date: Date) => {
    return date.toLocaleString();
  };

  // Start monitoring on mount
  useEffect(() => {
    if (settings.monitoringEnabled) {
      startMonitoring();
    }
    
    return () => {
      stopMonitoring();
    };
  }, [settings.monitoringEnabled, startMonitoring, stopMonitoring]);

  return (
    <div className={`bg-white border border-gray-200 rounded-lg shadow-lg ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200">
        <div className="flex items-center space-x-2">
          <Activity className="w-5 h-5 text-blue-500" />
          <h3 className="text-lg font-semibold">Performance Monitor</h3>
          <span className={`px-2 py-1 text-xs rounded ${getPerformanceScoreColor(metrics.performanceScore || 100)}`}>
            {metrics.performanceScore || 100}%
          </span>
        </div>
        
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setShowAlerts(!showAlerts)}
            className={`p-2 rounded ${showAlerts ? 'bg-red-100' : 'hover:bg-gray-100'} ${alerts.length > 0 ? 'text-red-600' : ''}`}
            title="Performance Alerts"
          >
            <AlertCircle className="w-4 h-4" />
            {alerts.length > 0 && (
              <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                {alerts.length}
              </span>
            )}
          </button>
          
          <button
            onClick={() => setShowSettings(!showSettings)}
            className="p-2 rounded hover:bg-gray-100"
            title="Settings"
          >
            <Settings className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Metrics Grid */}
      <div className="p-4 border-b border-gray-200">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">{metrics.fps}</div>
            <div className="text-sm text-gray-500">FPS</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">
              {formatMemorySize(metrics.memoryUsage || 0)}
            </div>
            <div className="text-sm text-gray-500">Memory</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-orange-600">{metrics.cpuUsage}%</div>
            <div className="text-sm text-gray-500">CPU</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-purple-600">
              {metrics.renderTime?.toFixed(1)}ms
            </div>
            <div className="text-sm text-gray-500">Render</div>
          </div>
        </div>
      </div>

      {/* Controls */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <button
              onClick={isMonitoring ? stopMonitoring : startMonitoring}
              className={`flex items-center space-x-2 px-3 py-2 rounded ${
                isMonitoring ? 'bg-red-600 text-white hover:bg-red-700' : 'bg-green-600 text-white hover:bg-green-700'
              }`}
            >
              {isMonitoring ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
              <span>{isMonitoring ? 'Stop' : 'Start'} Monitoring</span>
            </button>
            
            <button
              onClick={optimizePerformance}
              disabled={isOptimizing}
              className="flex items-center space-x-2 px-3 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
            >
              <Zap className="w-4 h-4" />
              <span>{isOptimizing ? 'Optimizing...' : 'Optimize'}</span>
            </button>
          </div>
          
          <div className="flex items-center space-x-2">
            <button
              onClick={clearCache}
              className="flex items-center space-x-2 px-3 py-2 bg-gray-600 text-white rounded hover:bg-gray-700"
            >
              <HardDrive className="w-4 h-4" />
              <span>Clear Cache</span>
            </button>
            
            <button
              onClick={resetMetrics}
              className="flex items-center space-x-2 px-3 py-2 bg-red-600 text-white rounded hover:bg-red-700"
            >
              <RefreshCw className="w-4 h-4" />
              <span>Reset</span>
            </button>
          </div>
        </div>

        {/* Optimization Progress */}
        {isOptimizing && (
          <div className="mt-4">
            <div className="flex items-center justify-between text-sm text-gray-600 mb-2">
              <span>Optimizing performance...</span>
              <span>{optimizationProgress}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${optimizationProgress}%` }}
              />
            </div>
          </div>
        )}
      </div>

      {/* Alerts */}
      {showAlerts && (
        <div className="p-4 max-h-64 overflow-y-auto">
          {alerts.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <Check className="w-12 h-12 mx-auto mb-4 text-green-500" />
              <p>No performance alerts</p>
              <p className="text-sm">All systems running smoothly!</p>
            </div>
          ) : (
            <div className="space-y-2">
              {alerts.filter(alert => !alert.resolved).map(alert => (
                <div
                  key={alert.id}
                  className={`p-3 border rounded-lg ${
                    alert.severity === 'critical' ? 'border-red-200 bg-red-50' :
                    alert.severity === 'high' ? 'border-orange-200 bg-orange-50' :
                    alert.severity === 'medium' ? 'border-yellow-200 bg-yellow-50' :
                    'border-blue-200 bg-blue-50'
                  }`}
                >
                  <div className="flex items-start space-x-3">
                    <AlertCircle className={`w-5 h-5 mt-0.5 ${
                      alert.severity === 'critical' ? 'text-red-500' :
                      alert.severity === 'high' ? 'text-orange-500' :
                      alert.severity === 'medium' ? 'text-yellow-500' :
                      'text-blue-500'
                    }`} />
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-2 mb-1">
                        <span className="font-medium text-gray-900">{alert.message}</span>
                        <span className={`px-2 py-1 text-xs rounded ${getAlertSeverityColor(alert.severity)}`}>
                          {alert.severity}
                        </span>
                      </div>
                      
                      <div className="text-sm text-gray-600 mb-2">
                        {alert.recommendation}
                      </div>
                      
                      <div className="text-xs text-gray-500">
                        {formatDate(alert.timestamp)} • {alert.category}
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-1">
                      <button
                        onClick={() => resolveAlert(alert.id)}
                        className="p-1 text-green-600 hover:bg-green-100 rounded"
                        title="Resolve"
                      >
                        <Check className="w-4 h-4" />
                      </button>
                      
                      <button
                        onClick={() => dismissAlert(alert.id)}
                        className="p-1 text-red-600 hover:bg-red-100 rounded"
                        title="Dismiss"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

// Hook for performance monitoring
export const usePerformanceMonitor = () => {
  const [metrics, setMetrics] = useState<PerformanceMetrics>({
    fps: 60,
    memoryUsage: 0,
    cpuUsage: 0,
    renderTime: 0,
    objectCount: 0,
    layerCount: 1,
    canvasSize: { width: 1080, height: 1080 },
    zoomLevel: 1,
    performanceScore: 100,
    optimizationLevel: 0,
    alerts: []
  });

  const updateMetrics = useCallback((newMetrics: Partial<PerformanceMetrics>) => {
    setMetrics(prev => ({ ...prev, ...newMetrics }));
  }, []);

  const getPerformanceScore = useCallback(() => {
    return metrics.performanceScore || 100;
  }, [metrics.performanceScore]);

  const isPerformanceGood = useCallback(() => {
    return (metrics.performanceScore || 100) >= 80;
  }, [metrics.performanceScore]);

  return {
    metrics,
    updateMetrics,
    getPerformanceScore,
    isPerformanceGood
  };
};
