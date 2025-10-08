import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Activity, AlertTriangle, CheckCircle, TrendingUp, Users, Zap } from 'lucide-react';

interface MetricData {
  timestamp: number;
  value: number;
}

interface SystemMetric {
  id: string;
  name: string;
  value: number;
  unit: string;
  status: 'healthy' | 'warning' | 'critical';
  trend: MetricData[];
  threshold: { warning: number; critical: number };
}

interface Alert {
  id: string;
  type: 'error' | 'warning' | 'info';
  title: string;
  message: string;
  timestamp: number;
  resolved: boolean;
}

export const ProductionMonitor: React.FC = () => {
  const [showMonitor, setShowMonitor] = useState(false);
  const [metrics, setMetrics] = useState<SystemMetric[]>([]);
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [selectedTimeRange, setSelectedTimeRange] = useState<'1h' | '6h' | '24h' | '7d'>('1h');

  // Initialize metrics
  useEffect(() => {
    const initialMetrics: SystemMetric[] = [
      {
        id: 'response-time',
        name: 'Response Time',
        value: 245,
        unit: 'ms',
        status: 'healthy',
        trend: generateTrendData(200, 50),
        threshold: { warning: 500, critical: 1000 }
      },
      {
        id: 'error-rate',
        name: 'Error Rate',
        value: 0.8,
        unit: '%',
        status: 'healthy',
        trend: generateTrendData(1, 0.5),
        threshold: { warning: 2, critical: 5 }
      },
      {
        id: 'cpu-usage',
        name: 'CPU Usage',
        value: 34,
        unit: '%',
        status: 'healthy',
        trend: generateTrendData(30, 15),
        threshold: { warning: 70, critical: 90 }
      },
      {
        id: 'memory-usage',
        name: 'Memory Usage',
        value: 67,
        unit: '%',
        status: 'warning',
        threshold: { warning: 60, critical: 85 },
        trend: generateTrendData(65, 10)
      },
      {
        id: 'active-users',
        name: 'Active Users',
        value: 1247,
        unit: '',
        status: 'healthy',
        trend: generateTrendData(1200, 200),
        threshold: { warning: 2000, critical: 3000 }
      },
      {
        id: 'requests-per-minute',
        name: 'Requests/min',
        value: 856,
        unit: 'req/min',
        status: 'healthy',
        trend: generateTrendData(800, 150),
        threshold: { warning: 1500, critical: 2000 }
      }
    ];

    setMetrics(initialMetrics);

    const initialAlerts: Alert[] = [
      {
        id: '1',
        type: 'warning',
        title: 'High Memory Usage',
        message: 'Memory usage is above 60% threshold',
        timestamp: Date.now() - 300000,
        resolved: false
      },
      {
        id: '2',
        type: 'info',
        title: 'Deployment Completed',
        message: 'Version 1.2.3 deployed successfully',
        timestamp: Date.now() - 600000,
        resolved: true
      },
      {
        id: '3',
        type: 'error',
        title: 'API Endpoint Down',
        message: '/api/export endpoint returning 500 errors',
        timestamp: Date.now() - 900000,
        resolved: true
      }
    ];

    setAlerts(initialAlerts);
  }, []);

  // Update metrics periodically
  useEffect(() => {
    const interval = setInterval(() => {
      setMetrics(prev => prev.map(metric => {
        const newValue = metric.value + (Math.random() - 0.5) * (metric.value * 0.1);
        const clampedValue = Math.max(0, newValue);
        
        let status: SystemMetric['status'] = 'healthy';
        if (clampedValue >= metric.threshold.critical) status = 'critical';
        else if (clampedValue >= metric.threshold.warning) status = 'warning';

        return {
          ...metric,
          value: clampedValue,
          status,
          trend: [
            ...metric.trend.slice(-19),
            { timestamp: Date.now(), value: clampedValue }
          ]
        };
      }));
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  function generateTrendData(baseValue: number, variance: number): MetricData[] {
    const data: MetricData[] = [];
    const now = Date.now();
    
    for (let i = 19; i >= 0; i--) {
      data.push({
        timestamp: now - (i * 60000), // 1 minute intervals
        value: baseValue + (Math.random() - 0.5) * variance
      });
    }
    
    return data;
  }

  const getStatusColor = (status: SystemMetric['status']) => {
    switch (status) {
      case 'healthy': return 'text-green-600 bg-green-50';
      case 'warning': return 'text-yellow-600 bg-yellow-50';
      case 'critical': return 'text-red-600 bg-red-50';
    }
  };

  const getAlertIcon = (type: Alert['type']) => {
    switch (type) {
      case 'error': return <AlertTriangle className="text-red-500" size={16} />;
      case 'warning': return <AlertTriangle className="text-yellow-500" size={16} />;
      case 'info': return <CheckCircle className="text-blue-500" size={16} />;
    }
  };

  const formatValue = (value: number, unit: string) => {
    if (unit === '') return Math.round(value).toLocaleString();
    return `${Math.round(value * 100) / 100}${unit}`;
  };

  const getSystemHealth = () => {
    const criticalCount = metrics.filter(m => m.status === 'critical').length;
    const warningCount = metrics.filter(m => m.status === 'warning').length;
    
    if (criticalCount > 0) return { status: 'critical', message: `${criticalCount} critical issues` };
    if (warningCount > 0) return { status: 'warning', message: `${warningCount} warnings` };
    return { status: 'healthy', message: 'All systems operational' };
  };

  const systemHealth = getSystemHealth();

  if (!showMonitor) {
    return (
      <motion.button
        onClick={() => setShowMonitor(true)}
        className="fixed bottom-40 right-4 z-40 bg-purple-600 text-white p-3 rounded-full shadow-lg hover:bg-purple-700"
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        title="Production Monitor"
      >
        <Activity size={20} />
      </motion.button>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4"
      onClick={() => setShowMonitor(false)}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="bg-white rounded-lg shadow-xl w-full max-w-6xl h-[90vh] flex flex-col overflow-hidden"
        onClick={e => e.stopPropagation()}
      >
        <div className="p-6 border-b">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Activity size={20} />
              <h2 className="text-xl font-bold">Production Monitor</h2>
              <div className={`px-3 py-1 rounded-full text-sm ${getStatusColor(systemHealth.status as any)}`}>
                {systemHealth.message}
              </div>
            </div>
            <button
              onClick={() => setShowMonitor(false)}
              className="text-gray-400 hover:text-gray-600"
            >
              ×
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-6">
          {/* Time Range Selector */}
          <div className="flex items-center gap-2 mb-6">
            <span className="text-sm font-medium">Time Range:</span>
            {(['1h', '6h', '24h', '7d'] as const).map(range => (
              <button
                key={range}
                onClick={() => setSelectedTimeRange(range)}
                className={`px-3 py-1 rounded text-sm ${
                  selectedTimeRange === range
                    ? 'bg-purple-500 text-white'
                    : 'bg-gray-100 hover:bg-gray-200'
                }`}
              >
                {range}
              </button>
            ))}
          </div>

          {/* Metrics Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
            {metrics.map(metric => (
              <div key={metric.id} className="border rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-medium text-sm">{metric.name}</h3>
                  <div className={`px-2 py-1 rounded text-xs ${getStatusColor(metric.status)}`}>
                    {metric.status}
                  </div>
                </div>
                
                <div className="text-2xl font-bold mb-2">
                  {formatValue(metric.value, metric.unit)}
                </div>
                
                {/* Mini Chart */}
                <div className="h-12 flex items-end gap-1">
                  {metric.trend.slice(-10).map((point, index) => {
                    const maxValue = Math.max(...metric.trend.map(p => p.value));
                    const height = (point.value / maxValue) * 100;
                    
                    return (
                      <div
                        key={index}
                        className={`flex-1 rounded-t ${
                          metric.status === 'critical' ? 'bg-red-200' :
                          metric.status === 'warning' ? 'bg-yellow-200' : 'bg-green-200'
                        }`}
                        style={{ height: `${height}%` }}
                      />
                    );
                  })}
                </div>
                
                <div className="text-xs text-gray-500 mt-2">
                  Warning: {formatValue(metric.threshold.warning, metric.unit)} | 
                  Critical: {formatValue(metric.threshold.critical, metric.unit)}
                </div>
              </div>
            ))}
          </div>

          {/* Alerts */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Recent Alerts</h3>
            <div className="space-y-2">
              {alerts.slice(0, 5).map(alert => (
                <div
                  key={alert.id}
                  className={`p-3 border rounded-lg ${
                    alert.resolved ? 'opacity-60' : ''
                  }`}
                >
                  <div className="flex items-start gap-3">
                    {getAlertIcon(alert.type)}
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="font-medium text-sm">{alert.title}</h4>
                        {alert.resolved && (
                          <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">
                            Resolved
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-gray-600 mb-1">{alert.message}</p>
                      <div className="text-xs text-gray-500">
                        {new Date(alert.timestamp).toLocaleString()}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Quick Stats */}
          <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-blue-50 p-4 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <Users className="text-blue-600" size={16} />
                <span className="text-sm font-medium">Active Users</span>
              </div>
              <div className="text-2xl font-bold text-blue-600">
                {metrics.find(m => m.id === 'active-users')?.value.toLocaleString()}
              </div>
            </div>
            
            <div className="bg-green-50 p-4 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <TrendingUp className="text-green-600" size={16} />
                <span className="text-sm font-medium">Uptime</span>
              </div>
              <div className="text-2xl font-bold text-green-600">99.9%</div>
            </div>
            
            <div className="bg-purple-50 p-4 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <Zap className="text-purple-600" size={16} />
                <span className="text-sm font-medium">Performance Score</span>
              </div>
              <div className="text-2xl font-bold text-purple-600">94/100</div>
            </div>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};