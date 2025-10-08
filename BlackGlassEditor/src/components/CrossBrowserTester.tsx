import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Globe, CheckCircle, AlertTriangle, X, Play } from 'lucide-react';

interface BrowserTest {
  id: string;
  name: string;
  category: 'rendering' | 'performance' | 'features' | 'compatibility';
  test: () => Promise<TestResult>;
  critical: boolean;
}

interface TestResult {
  passed: boolean;
  score: number;
  message: string;
  details?: string;
  recommendation?: string;
}

interface BrowserTestSuite {
  browser: string;
  version: string;
  results: Record<string, TestResult>;
  overallScore: number;
  status: 'passed' | 'warning' | 'failed';
}

export const CrossBrowserTester: React.FC = () => {
  const [showTester, setShowTester] = useState(false);
  const [isRunning, setIsRunning] = useState(false);
  const [testSuite, setTestSuite] = useState<BrowserTestSuite | null>(null);
  const [progress, setProgress] = useState(0);

  const browserTests: BrowserTest[] = [
    {
      id: 'canvas-support',
      name: 'Canvas Support',
      category: 'rendering',
      critical: true,
      test: async () => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        return {
          passed: !!ctx,
          score: ctx ? 100 : 0,
          message: ctx ? 'Canvas fully supported' : 'Canvas not supported',
          recommendation: !ctx ? 'Update browser or use fallback rendering' : undefined
        };
      }
    },
    {
      id: 'webgl-support',
      name: 'WebGL Support',
      category: 'rendering',
      critical: false,
      test: async () => {
        const canvas = document.createElement('canvas');
        const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
        return {
          passed: !!gl,
          score: gl ? 100 : 50,
          message: gl ? 'WebGL supported' : 'WebGL not available',
          recommendation: !gl ? 'Hardware acceleration disabled' : undefined
        };
      }
    },
    {
      id: 'es6-support',
      name: 'ES6 Features',
      category: 'features',
      critical: true,
      test: async () => {
        try {
          eval('const test = () => {}; class Test {}; const [a, b] = [1, 2];');
          return {
            passed: true,
            score: 100,
            message: 'ES6 features supported'
          };
        } catch {
          return {
            passed: false,
            score: 0,
            message: 'ES6 features not supported',
            recommendation: 'Update browser for modern JavaScript support'
          };
        }
      }
    },
    {
      id: 'local-storage',
      name: 'Local Storage',
      category: 'features',
      critical: true,
      test: async () => {
        try {
          localStorage.setItem('test', 'value');
          const value = localStorage.getItem('test');
          localStorage.removeItem('test');
          return {
            passed: value === 'value',
            score: value === 'value' ? 100 : 0,
            message: value === 'value' ? 'Local storage working' : 'Local storage failed'
          };
        } catch {
          return {
            passed: false,
            score: 0,
            message: 'Local storage not available',
            recommendation: 'Enable local storage or use incognito mode'
          };
        }
      }
    },
    {
      id: 'performance-timing',
      name: 'Performance API',
      category: 'performance',
      critical: false,
      test: async () => {
        const supported = typeof performance !== 'undefined' && 'now' in performance;
        return {
          passed: supported,
          score: supported ? 100 : 70,
          message: supported ? 'Performance API available' : 'Performance API limited',
          details: supported ? 'High-precision timing available' : 'Using fallback timing'
        };
      }
    },
    {
      id: 'intersection-observer',
      name: 'Intersection Observer',
      category: 'features',
      critical: false,
      test: async () => {
        const supported = typeof IntersectionObserver !== 'undefined';
        return {
          passed: supported,
          score: supported ? 100 : 80,
          message: supported ? 'Intersection Observer supported' : 'Using polyfill',
          details: supported ? 'Native lazy loading available' : 'Fallback implementation active'
        };
      }
    },
    {
      id: 'css-grid',
      name: 'CSS Grid Support',
      category: 'rendering',
      critical: false,
      test: async () => {
        const div = document.createElement('div');
        div.style.display = 'grid';
        const supported = div.style.display === 'grid';
        return {
          passed: supported,
          score: supported ? 100 : 85,
          message: supported ? 'CSS Grid supported' : 'Using flexbox fallback'
        };
      }
    },
    {
      id: 'memory-info',
      name: 'Memory Information',
      category: 'performance',
      critical: false,
      test: async () => {
        const memory = (performance as any).memory;
        return {
          passed: !!memory,
          score: memory ? 100 : 90,
          message: memory ? 'Memory monitoring available' : 'Memory info not available',
          details: memory ? `Heap limit: ${(memory.jsHeapSizeLimit / 1024 / 1024).toFixed(0)}MB` : undefined
        };
      }
    }
  ];

  // Run all browser tests
  const runTests = async () => {
    setIsRunning(true);
    setProgress(0);
    
    const results: Record<string, TestResult> = {};
    const total = browserTests.length;
    
    for (let i = 0; i < browserTests.length; i++) {
      const test = browserTests[i];
      try {
        results[test.id] = await test.test();
      } catch (error) {
        results[test.id] = {
          passed: false,
          score: 0,
          message: 'Test failed to execute',
          details: error instanceof Error ? error.message : 'Unknown error'
        };
      }
      setProgress(((i + 1) / total) * 100);
    }

    // Calculate overall score
    const scores = Object.values(results).map(r => r.score);
    const overallScore = scores.reduce((a, b) => a + b, 0) / scores.length;
    
    // Determine status
    const criticalTests = browserTests.filter(t => t.critical);
    const criticalPassed = criticalTests.every(t => results[t.id].passed);
    const allPassed = Object.values(results).every(r => r.passed);
    
    let status: 'passed' | 'warning' | 'failed';
    if (!criticalPassed) status = 'failed';
    else if (!allPassed) status = 'warning';
    else status = 'passed';

    // Get browser info
    const ua = navigator.userAgent;
    let browser = 'Unknown';
    let version = '0';
    
    if (ua.includes('Chrome')) {
      browser = 'Chrome';
      version = ua.match(/Chrome\/(\d+)/)?.[1] || '0';
    } else if (ua.includes('Firefox')) {
      browser = 'Firefox';
      version = ua.match(/Firefox\/(\d+)/)?.[1] || '0';
    } else if (ua.includes('Safari')) {
      browser = 'Safari';
      version = ua.match(/Version\/(\d+)/)?.[1] || '0';
    } else if (ua.includes('Edge')) {
      browser = 'Edge';
      version = ua.match(/Edg\/(\d+)/)?.[1] || '0';
    }

    setTestSuite({
      browser,
      version,
      results,
      overallScore,
      status
    });
    
    setIsRunning(false);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'passed': return 'text-green-600 bg-green-50';
      case 'warning': return 'text-yellow-600 bg-yellow-50';
      case 'failed': return 'text-red-600 bg-red-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  const getTestIcon = (result: TestResult) => {
    if (result.passed) return <CheckCircle className="text-green-500" size={16} />;
    return <AlertTriangle className="text-red-500" size={16} />;
  };

  if (!showTester) {
    return (
      <motion.button
        onClick={() => setShowTester(true)}
        className="fixed top-4 left-28 z-40 bg-purple-500 text-white p-2 rounded-full shadow-lg hover:bg-purple-600"
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        title="Cross-Browser Testing"
      >
        <Globe size={16} />
      </motion.button>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: -100 }}
      animate={{ opacity: 1, y: 0 }}
      className="fixed top-4 left-28 z-40 bg-white rounded-lg shadow-xl p-4 w-96 max-h-[80vh] overflow-y-auto"
    >
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold flex items-center gap-2">
          <Globe size={16} />
          Browser Testing
        </h3>
        <button
          onClick={() => setShowTester(false)}
          className="text-gray-400 hover:text-gray-600"
        >
          <X size={16} />
        </button>
      </div>

      {/* Test Results Summary */}
      {testSuite && (
        <div className={`p-3 rounded-lg mb-4 ${getStatusColor(testSuite.status)}`}>
          <div className="flex items-center justify-between mb-2">
            <span className="font-medium">{testSuite.browser} {testSuite.version}</span>
            <span className="text-lg font-bold">{Math.round(testSuite.overallScore)}%</span>
          </div>
          <div className="text-sm capitalize">{testSuite.status}</div>
        </div>
      )}

      {/* Progress Bar */}
      {isRunning && (
        <div className="mb-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm">Running tests...</span>
            <span className="text-sm">{Math.round(progress)}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-purple-500 h-2 rounded-full transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      )}

      {/* Test Results */}
      {testSuite && (
        <div className="space-y-2 mb-4">
          {browserTests.map(test => {
            const result = testSuite.results[test.id];
            return (
              <div key={test.id} className="p-2 border rounded">
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center gap-2">
                    {getTestIcon(result)}
                    <span className="text-sm font-medium">{test.name}</span>
                    {test.critical && (
                      <span className="text-xs bg-red-100 text-red-600 px-1 rounded">
                        Critical
                      </span>
                    )}
                  </div>
                  <span className="text-sm">{result.score}%</span>
                </div>
                <p className="text-xs text-gray-600">{result.message}</p>
                {result.details && (
                  <p className="text-xs text-gray-500 mt-1">{result.details}</p>
                )}
                {result.recommendation && (
                  <p className="text-xs text-blue-600 mt-1">💡 {result.recommendation}</p>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Actions */}
      <div className="flex gap-2">
        <button
          onClick={runTests}
          disabled={isRunning}
          className="flex-1 bg-purple-500 text-white py-2 px-3 rounded text-sm hover:bg-purple-600 disabled:opacity-50 flex items-center justify-center gap-2"
        >
          <Play size={14} />
          {isRunning ? 'Testing...' : 'Run Tests'}
        </button>
      </div>
    </motion.div>
  );
};