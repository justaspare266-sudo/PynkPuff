import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { BarChart3, Clock, MousePointer, Zap } from 'lucide-react';
import { useEditorStore } from '../stores/editorStore';

interface AnalyticsData {
  sessionId: string;
  startTime: number;
  toolUsage: Record<string, number>;
  actions: Array<{
    type: string;
    timestamp: number;
    tool?: string;
    duration?: number;
  }>;
  performance: {
    renderTime: number[];
    memoryUsage: number[];
    fps: number[];
  };
}

export const AnalyticsTracker: React.FC = () => {
  const { selectedTool, objects = [] } = useEditorStore();
  const [analytics, setAnalytics] = useState<AnalyticsData>(() => ({
    sessionId: Math.random().toString(36).substr(2, 9),
    startTime: Date.now(),
    toolUsage: {},
    actions: [],
    performance: {
      renderTime: [],
      memoryUsage: [],
      fps: []
    }
  }));
  const [showStats, setShowStats] = useState(false);

  // Track tool usage
  useEffect(() => {
    if (selectedTool) {
      setAnalytics(prev => ({
        ...prev,
        toolUsage: {
          ...prev.toolUsage,
          [selectedTool]: (prev.toolUsage[selectedTool] || 0) + 1
        },
        actions: [
          ...prev.actions,
          {
            type: 'tool_selected',
            timestamp: Date.now(),
            tool: selectedTool
          }
        ]
      }));
    }
  }, [selectedTool]);

  // Track object creation
  useEffect(() => {
    const objectCount = objects.length;
    if (objectCount > 0) {
      setAnalytics(prev => ({
        ...prev,
        actions: [
          ...prev.actions,
          {
            type: 'object_created',
            timestamp: Date.now()
          }
        ]
      }));
    }
  }, [objects?.length || 0]);

  // Performance monitoring
  useEffect(() => {
    const interval = setInterval(() => {
      const now = performance.now();
      const memory = (performance as any).memory;
      
      setAnalytics(prev => ({
        ...prev,
        performance: {
          renderTime: [...prev.performance.renderTime.slice(-19), now],
          memoryUsage: memory ? [...prev.performance.memoryUsage.slice(-19), memory.usedJSHeapSize] : prev.performance.memoryUsage,
          fps: [...prev.performance.fps.slice(-19), 60] // Simplified FPS tracking
        }
      }));
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  // Save analytics periodically
  useEffect(() => {
    const interval = setInterval(() => {
      localStorage.setItem('editor-analytics', JSON.stringify(analytics));
    }, 30000); // Save every 30 seconds

    return () => clearInterval(interval);
  }, [analytics]);

  const getSessionDuration = () => {
    return Math.floor((Date.now() - analytics.startTime) / 1000);
  };

  const getMostUsedTool = () => {
    const entries = Object.entries(analytics.toolUsage);
    if (entries.length === 0) return 'None';
    return entries.reduce((a, b) => a[1] > b[1] ? a : b)[0];
  };

  const getAverageRenderTime = () => {
    const times = analytics.performance.renderTime;
    if (times.length === 0) return 0;
    return times.reduce((a, b) => a + b, 0) / times.length;
  };

  if (!showStats) {
    return (
      <motion.button
        onClick={() => setShowStats(true)}
        className="fixed bottom-4 left-4 z-40 bg-purple-500 text-white p-2 rounded-full shadow-lg hover:bg-purple-600"
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
      >
        <BarChart3 size={16} />
      </motion.button>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, x: -100 }}
      animate={{ opacity: 1, x: 0 }}
      className="fixed bottom-4 left-4 z-40 bg-white rounded-lg shadow-xl p-4 w-80"
    >
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold flex items-center gap-2">
          <BarChart3 size={16} />
          Session Stats
        </h3>
        <button
          onClick={() => setShowStats(false)}
          className="text-gray-400 hover:text-gray-600"
        >
          ×
        </button>
      </div>

      <div className="space-y-3">
        {/* Session Duration */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Clock size={14} className="text-blue-500" />
            <span className="text-sm">Session Duration</span>
          </div>
          <span className="text-sm font-medium">{getSessionDuration()}s</span>
        </div>

        {/* Most Used Tool */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <MousePointer size={14} className="text-green-500" />
            <span className="text-sm">Most Used Tool</span>
          </div>
          <span className="text-sm font-medium capitalize">{getMostUsedTool()}</span>
        </div>

        {/* Objects Created */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Zap size={14} className="text-orange-500" />
            <span className="text-sm">Objects Created</span>
          </div>
          <span className="text-sm font-medium">{objects.length}</span>
        </div>

        {/* Performance */}
        <div className="pt-2 border-t">
          <div className="text-xs text-gray-600 mb-2">Performance</div>
          <div className="space-y-1">
            <div className="flex justify-between text-xs">
              <span>Avg Render Time</span>
              <span>{getAverageRenderTime().toFixed(1)}ms</span>
            </div>
            {analytics.performance.memoryUsage.length > 0 && (
              <div className="flex justify-between text-xs">
                <span>Memory Usage</span>
                <span>
                  {(analytics.performance.memoryUsage[analytics.performance.memoryUsage.length - 1] / 1024 / 1024).toFixed(1)}MB
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Tool Usage Chart */}
        <div className="pt-2 border-t">
          <div className="text-xs text-gray-600 mb-2">Tool Usage</div>
          <div className="space-y-1">
            {Object.entries(analytics.toolUsage).map(([tool, count]) => (
              <div key={tool} className="flex items-center gap-2">
                <div className="text-xs capitalize w-16">{tool}</div>
                <div className="flex-1 bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-blue-500 h-2 rounded-full"
                    style={{
                      width: `${(count / Math.max(...Object.values(analytics.toolUsage))) * 100}%`
                    }}
                  />
                </div>
                <div className="text-xs w-6 text-right">{count}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </motion.div>
  );
};