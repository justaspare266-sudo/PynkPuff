/**
 * 🧠 DiagnosticPanel - Non-invasive Debug Panel
 * Toggle panel for analyzing tools and performance in real-time
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Brain, 
  X, 
  AlertTriangle, 
  CheckCircle, 
  Info, 
  Activity,
  Zap,
  Eye,
  EyeOff,
  Download,
  RefreshCw
} from 'lucide-react';
import { MasterEditorDiagnostics, DiagnosticReport } from './MasterEditorDiagnostics';
import { TextEngineDiagnostics, validateTextEngine } from './TextEngineDiagnostics';
import { outcomeTracker } from './OutcomeTracker';

interface DiagnosticPanelProps {
  isVisible: boolean;
  onClose: () => void;
  editorState?: any;
}

export const DiagnosticPanel: React.FC<DiagnosticPanelProps> = ({
  isVisible,
  onClose,
  editorState
}) => {
  const [report, setReport] = useState<DiagnosticReport | null>(null);
  const [isAutoRefresh, setIsAutoRefresh] = useState(true);
  const [selectedTab, setSelectedTab] = useState<'overview' | 'tools' | 'performance' | 'suggestions' | 'outcomes'>('overview');
  const [diagnostics] = useState(() => MasterEditorDiagnostics.getInstance());

  useEffect(() => {
    if (isVisible) {
      diagnostics.enable();
      if (isAutoRefresh) {
        const interval = setInterval(() => {
          setReport(diagnostics.generateReport());
        }, 1000);
        return () => clearInterval(interval);
      }
    } else {
      diagnostics.disable();
    }
  }, [isVisible, isAutoRefresh, diagnostics]);

  const getHealthColor = (health: string) => {
    switch (health) {
      case 'healthy': return 'text-green-500';
      case 'warning': return 'text-yellow-500';
      case 'error': return 'text-red-500';
      default: return 'text-gray-500';
    }
  };

  const getHealthIcon = (health: string) => {
    switch (health) {
      case 'healthy': return <CheckCircle className="w-4 h-4" />;
      case 'warning': return <AlertTriangle className="w-4 h-4" />;
      case 'error': return <AlertTriangle className="w-4 h-4" />;
      default: return <Info className="w-4 h-4" />;
    }
  };

  const exportDiagnostics = () => {
    const data = diagnostics.exportDiagnostics();
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `diagnostics-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  if (!isVisible) return null;

  return (
    <motion.div
      initial={{ opacity: 0, x: 300 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 300 }}
      className="fixed right-0 top-0 h-full w-96 bg-white border-l border-gray-200 shadow-2xl z-50 flex flex-col"
    >
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b bg-gray-50">
        <div className="flex items-center space-x-2">
          <Brain className="w-5 h-5 text-blue-600" />
          <h2 className="text-lg font-semibold">🧠 Diagnostics</h2>
        </div>
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setIsAutoRefresh(!isAutoRefresh)}
            className={`p-2 rounded ${isAutoRefresh ? 'bg-blue-100 text-blue-600' : 'hover:bg-gray-100'}`}
            title={isAutoRefresh ? 'Disable auto-refresh' : 'Enable auto-refresh'}
          >
            {isAutoRefresh ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
          </button>
          <button
            onClick={() => setReport(diagnostics.generateReport())}
            className="p-2 hover:bg-gray-100 rounded"
            title="Refresh diagnostics"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
          <button
            onClick={exportDiagnostics}
            className="p-2 hover:bg-gray-100 rounded"
            title="Export diagnostics"
          >
            <Download className="w-4 h-4" />
          </button>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b">
        {[
          { id: 'overview', label: 'Overview', icon: Activity },
          { id: 'tools', label: 'Tools', icon: Zap },
          { id: 'performance', label: 'Performance', icon: Activity },
          { id: 'outcomes', label: 'Outcomes', icon: CheckCircle },
          { id: 'suggestions', label: 'Suggestions', icon: Info }
        ].map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => setSelectedTab(id as any)}
            className={`flex-1 flex items-center justify-center space-x-1 p-3 text-sm ${
              selectedTab === id 
                ? 'bg-blue-50 text-blue-600 border-b-2 border-blue-600' 
                : 'hover:bg-gray-50'
            }`}
          >
            <Icon className="w-4 h-4" />
            <span>{label}</span>
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4">
        <AnimatePresence mode="wait">
          {selectedTab === 'overview' && report && (
            <motion.div
              key="overview"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-4"
            >
              {/* Overall Health */}
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-medium">Overall Health</h3>
                  <div className={`flex items-center space-x-1 ${getHealthColor(report.overallHealth)}`}>
                    {getHealthIcon(report.overallHealth)}
                    <span className="text-sm capitalize">{report.overallHealth}</span>
                  </div>
                </div>
                <div className="text-sm text-gray-600">
                  Last updated: {new Date(report.timestamp).toLocaleTimeString()}
                </div>
              </div>

              {/* Quick Stats */}
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-blue-50 rounded-lg p-3">
                  <div className="text-2xl font-bold text-blue-600">
                    {report.tools.length}
                  </div>
                  <div className="text-sm text-blue-600">Active Tools</div>
                </div>
                <div className="bg-green-50 rounded-lg p-3">
                  <div className="text-2xl font-bold text-green-600">
                    {Math.round(report.performance.fps)}
                  </div>
                  <div className="text-sm text-green-600">FPS</div>
                </div>
                <div className="bg-yellow-50 rounded-lg p-3">
                  <div className="text-2xl font-bold text-yellow-600">
                    {Math.round(report.performance.renderTime)}ms
                  </div>
                  <div className="text-sm text-yellow-600">Avg Render</div>
                </div>
                <div className="bg-purple-50 rounded-lg p-3">
                  <div className="text-2xl font-bold text-purple-600">
                    {Math.round(report.performance.memoryUsage / 1024 / 1024)}MB
                  </div>
                  <div className="text-sm text-purple-600">Memory</div>
                </div>
              </div>
            </motion.div>
          )}

          {selectedTab === 'tools' && report && (
            <motion.div
              key="tools"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-3"
            >
              {report.tools.map((tool) => (
                <div key={tool.toolName} className="border rounded-lg p-3">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-medium capitalize">{tool.toolName}</h4>
                    <div className={`w-2 h-2 rounded-full ${tool.isActive ? 'bg-green-500' : 'bg-gray-300'}`} />
                  </div>
                  <div className="text-sm text-gray-600 space-y-1">
                    <div>Usage: {tool.usageCount} times</div>
                    <div>Avg Response: {Math.round(tool.performance.averageResponseTime)}ms</div>
                    {tool.errors.length > 0 && (
                      <div className="text-red-600">
                        Errors: {tool.errors.length}
                      </div>
                    )}
                    {tool.warnings.length > 0 && (
                      <div className="text-yellow-600">
                        Warnings: {tool.warnings.length}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </motion.div>
          )}

          {selectedTab === 'performance' && report && (
            <motion.div
              key="performance"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-4"
            >
              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="font-medium mb-3">Performance Metrics</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>Render Time:</span>
                    <span className="font-mono">{Math.round(report.performance.renderTime)}ms</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Memory Usage:</span>
                    <span className="font-mono">{Math.round(report.performance.memoryUsage / 1024 / 1024)}MB</span>
                  </div>
                  <div className="flex justify-between">
                    <span>FPS:</span>
                    <span className="font-mono">{Math.round(report.performance.fps)}</span>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {selectedTab === 'outcomes' && (
            <motion.div
              key="outcomes"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-4"
            >
              {/* Outcome Statistics */}
              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="font-medium mb-3">Action Outcomes</h3>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <div className="text-2xl font-bold text-blue-600">
                      {outcomeTracker.getOutcomes().length}
                    </div>
                    <div className="text-blue-600">Total Actions</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-green-600">
                      {outcomeTracker.getSuccessRate().toFixed(1)}%
                    </div>
                    <div className="text-green-600">Success Rate</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-yellow-600">
                      {outcomeTracker.getFailedOutcomes().length}
                    </div>
                    <div className="text-yellow-600">Failed Actions</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-purple-600">
                      {outcomeTracker.getAverageDragDeviation().toFixed(1)}px
                    </div>
                    <div className="text-purple-600">Avg Drag Deviation</div>
                  </div>
                </div>
              </div>

              {/* Recent Outcomes */}
              <div className="space-y-2">
                <h4 className="font-medium">Recent Actions</h4>
                {outcomeTracker.getOutcomes().slice(-10).map((outcome, index) => (
                  <div key={index} className={`p-3 rounded border-l-4 ${
                    outcome.success 
                      ? 'bg-green-50 border-green-400' 
                      : 'bg-red-50 border-red-400'
                  }`}>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        {outcome.success ? (
                          <CheckCircle className="w-4 h-4 text-green-600" />
                        ) : (
                          <AlertTriangle className="w-4 h-4 text-red-600" />
                        )}
                        <span className="font-medium capitalize">{outcome.actionType}</span>
                        <span className="text-sm text-gray-600">#{outcome.actionId.split('-')[1]}</span>
                      </div>
                      <span className="text-xs text-gray-500">
                        {new Date(outcome.timestamp).toLocaleTimeString()}
                      </span>
                    </div>
                    {!outcome.success && outcome.errorMessage && (
                      <div className="mt-2 text-sm text-red-700">
                        {outcome.errorMessage}
                      </div>
                    )}
                    {outcome.deviation > 0 && (
                      <div className="mt-1 text-xs text-gray-600">
                        Deviation: {outcome.deviation.toFixed(2)}px
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </motion.div>
          )}

          {selectedTab === 'suggestions' && report && (
            <motion.div
              key="suggestions"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-3"
            >
              {report.suggestions.length > 0 ? (
                report.suggestions.map((suggestion, index) => (
                  <div key={index} className="bg-blue-50 border-l-4 border-blue-400 p-3 rounded">
                    <div className="flex items-start space-x-2">
                      <Info className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
                      <p className="text-sm text-blue-800">{suggestion}</p>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center text-gray-500 py-8">
                  <CheckCircle className="w-8 h-8 mx-auto mb-2 text-green-500" />
                  <p>No suggestions at this time</p>
                  <p className="text-sm">Everything looks good!</p>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
};
