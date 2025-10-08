import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Beaker, Play, CheckCircle, X, Clock, Target } from 'lucide-react';

interface TestCase {
  id: string;
  name: string;
  category: 'unit' | 'integration' | 'e2e' | 'performance' | 'security';
  description: string;
  status: 'pending' | 'running' | 'passed' | 'failed' | 'skipped';
  duration?: number;
  error?: string;
}

interface TestSuite {
  id: string;
  name: string;
  tests: TestCase[];
  status: 'pending' | 'running' | 'completed';
}

export const TestingSuite: React.FC = () => {
  const [showTesting, setShowTesting] = useState(false);
  const [testSuites, setTestSuites] = useState<TestSuite[]>([]);
  const [isRunning, setIsRunning] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  const initializeTestSuites = (): TestSuite[] => [
    {
      id: 'unit-tests',
      name: 'Unit Tests',
      status: 'pending',
      tests: [
        {
          id: 'canvas-utils',
          name: 'Canvas Utilities',
          category: 'unit',
          description: 'Test canvas helper functions',
          status: 'pending'
        },
        {
          id: 'object-creation',
          name: 'Object Creation',
          category: 'unit',
          description: 'Test object factory functions',
          status: 'pending'
        },
        {
          id: 'export-utils',
          name: 'Export Utilities',
          category: 'unit',
          description: 'Test export functionality',
          status: 'pending'
        },
        {
          id: 'validation',
          name: 'Input Validation',
          category: 'unit',
          description: 'Test input sanitization',
          status: 'pending'
        }
      ]
    },
    {
      id: 'integration-tests',
      name: 'Integration Tests',
      status: 'pending',
      tests: [
        {
          id: 'tool-integration',
          name: 'Tool Integration',
          category: 'integration',
          description: 'Test tool switching and interaction',
          status: 'pending'
        },
        {
          id: 'store-integration',
          name: 'Store Integration',
          category: 'integration',
          description: 'Test state management integration',
          status: 'pending'
        },
        {
          id: 'api-integration',
          name: 'API Integration',
          category: 'integration',
          description: 'Test API endpoint integration',
          status: 'pending'
        }
      ]
    },
    {
      id: 'e2e-tests',
      name: 'End-to-End Tests',
      status: 'pending',
      tests: [
        {
          id: 'user-workflow',
          name: 'User Workflow',
          category: 'e2e',
          description: 'Test complete user workflows',
          status: 'pending'
        },
        {
          id: 'project-lifecycle',
          name: 'Project Lifecycle',
          category: 'e2e',
          description: 'Test create, edit, save, load cycle',
          status: 'pending'
        },
        {
          id: 'collaboration',
          name: 'Collaboration Features',
          category: 'e2e',
          description: 'Test real-time collaboration',
          status: 'pending'
        }
      ]
    },
    {
      id: 'performance-tests',
      name: 'Performance Tests',
      status: 'pending',
      tests: [
        {
          id: 'render-performance',
          name: 'Render Performance',
          category: 'performance',
          description: 'Test rendering performance with many objects',
          status: 'pending'
        },
        {
          id: 'memory-usage',
          name: 'Memory Usage',
          category: 'performance',
          description: 'Test memory consumption patterns',
          status: 'pending'
        },
        {
          id: 'load-time',
          name: 'Load Time',
          category: 'performance',
          description: 'Test application load performance',
          status: 'pending'
        }
      ]
    },
    {
      id: 'security-tests',
      name: 'Security Tests',
      status: 'pending',
      tests: [
        {
          id: 'xss-protection',
          name: 'XSS Protection',
          category: 'security',
          description: 'Test cross-site scripting protection',
          status: 'pending'
        },
        {
          id: 'input-sanitization',
          name: 'Input Sanitization',
          category: 'security',
          description: 'Test malicious input handling',
          status: 'pending'
        },
        {
          id: 'file-upload-security',
          name: 'File Upload Security',
          category: 'security',
          description: 'Test file upload validation',
          status: 'pending'
        }
      ]
    }
  ];

  const runAllTests = async () => {
    setIsRunning(true);
    const suites = initializeTestSuites();
    setTestSuites(suites);

    for (const suite of suites) {
      // Update suite status
      setTestSuites(prev => prev.map(s => 
        s.id === suite.id ? { ...s, status: 'running' } : s
      ));

      for (const test of suite.tests) {
        // Update test status to running
        setTestSuites(prev => prev.map(s => 
          s.id === suite.id ? {
            ...s,
            tests: s.tests.map(t => 
              t.id === test.id ? { ...t, status: 'running' } : t
            )
          } : s
        ));

        // Simulate test execution
        const startTime = Date.now();
        await new Promise(resolve => setTimeout(resolve, Math.random() * 1000 + 500));
        const duration = Date.now() - startTime;

        // Simulate test result (90% pass rate)
        const passed = Math.random() > 0.1;
        const error = passed ? undefined : generateTestError(test);

        // Update test result
        setTestSuites(prev => prev.map(s => 
          s.id === suite.id ? {
            ...s,
            tests: s.tests.map(t => 
              t.id === test.id ? { 
                ...t, 
                status: passed ? 'passed' : 'failed',
                duration,
                error
              } : t
            )
          } : s
        ));
      }

      // Update suite status to completed
      setTestSuites(prev => prev.map(s => 
        s.id === suite.id ? { ...s, status: 'completed' } : s
      ));
    }

    setIsRunning(false);
  };

  const generateTestError = (test: TestCase): string => {
    const errors = {
      unit: [
        'AssertionError: Expected 200, got 404',
        'TypeError: Cannot read property of undefined',
        'ReferenceError: Variable not defined'
      ],
      integration: [
        'ConnectionError: Failed to connect to API',
        'TimeoutError: Request timed out after 5000ms',
        'ValidationError: Invalid response format'
      ],
      e2e: [
        'ElementNotFoundError: Button not found',
        'NavigationError: Page failed to load',
        'InteractionError: Element not clickable'
      ],
      performance: [
        'PerformanceError: Render time exceeded 100ms',
        'MemoryError: Memory usage above threshold',
        'LoadError: Bundle size too large'
      ],
      security: [
        'SecurityError: XSS vulnerability detected',
        'ValidationError: Input not sanitized',
        'AuthError: Unauthorized access allowed'
      ]
    };

    const categoryErrors = errors[test.category] || errors.unit;
    return categoryErrors[Math.floor(Math.random() * categoryErrors.length)];
  };

  const getTestIcon = (status: TestCase['status']) => {
    switch (status) {
      case 'passed':
        return <CheckCircle className="text-green-500" size={16} />;
      case 'failed':
        return <X className="text-red-500" size={16} />;
      case 'running':
        return <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />;
      case 'skipped':
        return <Clock className="text-gray-400" size={16} />;
      default:
        return <Clock className="text-gray-400" size={16} />;
    }
  };

  const getCategoryColor = (category: TestCase['category']) => {
    switch (category) {
      case 'unit': return 'bg-blue-100 text-blue-800';
      case 'integration': return 'bg-green-100 text-green-800';
      case 'e2e': return 'bg-purple-100 text-purple-800';
      case 'performance': return 'bg-orange-100 text-orange-800';
      case 'security': return 'bg-red-100 text-red-800';
    }
  };

  const getOverallStats = () => {
    const allTests = testSuites.flatMap(suite => suite.tests);
    const passed = allTests.filter(t => t.status === 'passed').length;
    const failed = allTests.filter(t => t.status === 'failed').length;
    const total = allTests.length;
    
    return { passed, failed, total, passRate: total > 0 ? (passed / total) * 100 : 0 };
  };

  const filteredSuites = selectedCategory === 'all' 
    ? testSuites 
    : testSuites.map(suite => ({
        ...suite,
        tests: suite.tests.filter(test => test.category === selectedCategory)
      })).filter(suite => suite.tests.length > 0);

  const stats = getOverallStats();

  if (!showTesting) {
    return (
      <motion.button
        onClick={() => setShowTesting(true)}
        className="fixed bottom-52 right-4 z-40 bg-cyan-600 text-white p-3 rounded-full shadow-lg hover:bg-cyan-700"
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        title="Testing Suite"
      >
        <Beaker size={20} />
      </motion.button>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4"
      onClick={() => setShowTesting(false)}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="bg-white rounded-lg shadow-xl w-full max-w-5xl h-[90vh] flex flex-col overflow-hidden"
        onClick={e => e.stopPropagation()}
      >
        <div className="p-6 border-b">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Beaker size={20} />
              <h2 className="text-xl font-bold">Testing Suite</h2>
              {stats.total > 0 && (
                <div className="flex items-center gap-2">
                  <div className="text-sm bg-gray-100 px-2 py-1 rounded">
                    {stats.passed}/{stats.total} passed
                  </div>
                  <div className={`text-sm px-2 py-1 rounded ${
                    stats.passRate >= 90 ? 'bg-green-100 text-green-800' :
                    stats.passRate >= 70 ? 'bg-yellow-100 text-yellow-800' :
                    'bg-red-100 text-red-800'
                  }`}>
                    {stats.passRate.toFixed(1)}%
                  </div>
                </div>
              )}
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={runAllTests}
                disabled={isRunning}
                className="bg-cyan-500 text-white px-4 py-2 rounded-lg hover:bg-cyan-600 disabled:opacity-50 flex items-center gap-2"
              >
                <Play size={16} />
                {isRunning ? 'Running...' : 'Run All Tests'}
              </button>
              <button
                onClick={() => setShowTesting(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                ×
              </button>
            </div>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto">
          {/* Category Filter */}
          <div className="p-4 border-b">
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => setSelectedCategory('all')}
                className={`px-3 py-1 rounded text-sm ${
                  selectedCategory === 'all'
                    ? 'bg-gray-700 text-white'
                    : 'bg-gray-100 hover:bg-gray-200'
                }`}
              >
                All Tests
              </button>
              {['unit', 'integration', 'e2e', 'performance', 'security'].map(category => (
                <button
                  key={category}
                  onClick={() => setSelectedCategory(category)}
                  className={`px-3 py-1 rounded text-sm capitalize ${
                    selectedCategory === category
                      ? 'bg-gray-700 text-white'
                      : 'bg-gray-100 hover:bg-gray-200'
                  }`}
                >
                  {category}
                </button>
              ))}
            </div>
          </div>

          {/* Test Suites */}
          <div className="p-6">
            {filteredSuites.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <Beaker size={48} className="mx-auto mb-4 opacity-50" />
                <p>No tests to display. Click "Run All Tests" to start testing.</p>
              </div>
            ) : (
              <div className="space-y-6">
                {filteredSuites.map(suite => (
                  <div key={suite.id} className="border rounded-lg overflow-hidden">
                    <div className="bg-gray-50 p-4 border-b">
                      <div className="flex items-center justify-between">
                        <h3 className="font-semibold">{suite.name}</h3>
                        <div className="flex items-center gap-2">
                          <span className="text-sm text-gray-600">
                            {suite.tests.filter(t => t.status === 'passed').length}/{suite.tests.length} passed
                          </span>
                          <div className={`w-3 h-3 rounded-full ${
                            suite.status === 'running' ? 'bg-blue-500 animate-pulse' :
                            suite.status === 'completed' ? 'bg-green-500' : 'bg-gray-300'
                          }`} />
                        </div>
                      </div>
                    </div>
                    
                    <div className="divide-y">
                      {suite.tests.map(test => (
                        <div key={test.id} className="p-4">
                          <div className="flex items-center gap-3">
                            {getTestIcon(test.status)}
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-1">
                                <h4 className="font-medium text-sm">{test.name}</h4>
                                <span className={`text-xs px-2 py-1 rounded ${getCategoryColor(test.category)}`}>
                                  {test.category}
                                </span>
                                {test.duration && (
                                  <span className="text-xs text-gray-500">
                                    {test.duration}ms
                                  </span>
                                )}
                              </div>
                              <p className="text-sm text-gray-600">{test.description}</p>
                              {test.error && (
                                <div className="mt-2 p-2 bg-red-50 border border-red-200 rounded text-sm text-red-700">
                                  {test.error}
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};