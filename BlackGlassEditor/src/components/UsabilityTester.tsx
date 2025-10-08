import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Users, MousePointer, Clock, Target } from 'lucide-react';

interface UsabilityTest {
  id: string;
  name: string;
  description: string;
  steps: string[];
  expectedTime: number;
  execute: () => Promise<UsabilityResult>;
}

interface UsabilityResult {
  completed: boolean;
  timeToComplete: number;
  clickCount: number;
  errors: number;
  efficiency: number;
  userFriendliness: number;
  issues: string[];
  suggestions: string[];
}

interface UserAction {
  type: 'click' | 'keypress' | 'scroll';
  timestamp: number;
  element: string;
  successful: boolean;
}

export const UsabilityTester: React.FC = () => {
  const [showTester, setShowTester] = useState(false);
  const [isRunning, setIsRunning] = useState(false);
  const [currentTest, setCurrentTest] = useState<UsabilityTest | null>(null);
  const [results, setResults] = useState<Record<string, UsabilityResult>>({});
  const [userActions, setUserActions] = useState<UserAction[]>([]);
  const [testStartTime, _setTestStartTime] = useState<number>(0);

  const usabilityTests: UsabilityTest[] = [
    {
      id: 'create-text',
      name: 'Create Text Object',
      description: 'Test how easily users can create and edit text',
      steps: [
        'Select text tool',
        'Click on canvas',
        'Type some text',
        'Change font size',
        'Change color'
      ],
      expectedTime: 30000, // 30 seconds
      execute: async () => {
        return new Promise((resolve) => {
          const startTime = Date.now();
          let clickCount = 0;
          let errors = 0;
          const issues: string[] = [];
          const suggestions: string[] = [];

          // Monitor user actions
          const handleClick = (e: MouseEvent) => {
            clickCount++;
            const target = e.target as HTMLElement;
            
            // Check if click was on expected elements
            if (target.closest('[data-tool="text"]')) {
              // Good - clicked text tool
            } else if (target.closest('canvas')) {
              // Good - clicked canvas
            } else if (target.closest('[data-property="fontSize"]')) {
              // Good - changed font size
            } else {
              errors++;
              issues.push('Clicked on unexpected element');
            }
          };

          document.addEventListener('click', handleClick);

          // Simulate test completion after monitoring
          setTimeout(() => {
            document.removeEventListener('click', handleClick);
            
            const timeToComplete = Date.now() - startTime;
            const efficiency = Math.max(0, 100 - (timeToComplete / 1000 - 30) * 2);
            const userFriendliness = Math.max(0, 100 - errors * 10);

            if (clickCount > 8) {
              suggestions.push('Reduce number of clicks needed');
            }
            if (timeToComplete > 45000) {
              suggestions.push('Improve discoverability of tools');
            }

            resolve({
              completed: true,
              timeToComplete,
              clickCount,
              errors,
              efficiency,
              userFriendliness,
              issues,
              suggestions
            });
          }, 5000); // Simulate 5 second test
        });
      }
    },
    {
      id: 'create-shape',
      name: 'Create Shape Object',
      description: 'Test shape creation workflow',
      steps: [
        'Select shape tool',
        'Choose rectangle',
        'Draw on canvas',
        'Resize shape',
        'Change fill color'
      ],
      expectedTime: 25000,
      execute: async () => {
        return new Promise((resolve) => {
          const startTime = Date.now();
          let clickCount = 0;
          let errors = 0;
          const issues: string[] = [];
          const suggestions: string[] = [];

          const handleClick = (e: MouseEvent) => {
            clickCount++;
            const target = e.target as HTMLElement;
            
            if (!target.closest('[data-tool], canvas, [data-property]')) {
              errors++;
              issues.push('Inefficient click path');
            }
          };

          document.addEventListener('click', handleClick);

          setTimeout(() => {
            document.removeEventListener('click', handleClick);
            
            const timeToComplete = Date.now() - startTime;
            const efficiency = Math.max(0, 100 - (timeToComplete / 1000 - 25) * 3);
            const userFriendliness = Math.max(0, 100 - errors * 15);

            if (clickCount > 6) {
              suggestions.push('Streamline shape creation process');
            }

            resolve({
              completed: true,
              timeToComplete,
              clickCount,
              errors,
              efficiency,
              userFriendliness,
              issues,
              suggestions
            });
          }, 4000);
        });
      }
    },
    {
      id: 'save-project',
      name: 'Save Project',
      description: 'Test project saving workflow',
      steps: [
        'Open file menu',
        'Click save',
        'Enter filename',
        'Confirm save'
      ],
      expectedTime: 15000,
      execute: async () => {
        return new Promise((resolve) => {
          const startTime = Date.now();
          let clickCount = 0;
          let errors = 0;
          const issues: string[] = [];
          const suggestions: string[] = [];

          const handleClick = (e: MouseEvent) => {
            clickCount++;
            const target = e.target as HTMLElement;
            
            if (target.closest('[data-action="save"]')) {
              // Good - found save button
            } else if (!target.closest('button, input')) {
              errors++;
            }
          };

          document.addEventListener('click', handleClick);

          setTimeout(() => {
            document.removeEventListener('click', handleClick);
            
            const timeToComplete = Date.now() - startTime;
            const efficiency = Math.max(0, 100 - (timeToComplete / 1000 - 15) * 4);
            const userFriendliness = Math.max(0, 100 - errors * 20);

            if (clickCount > 4) {
              suggestions.push('Add keyboard shortcut for save');
            }

            resolve({
              completed: true,
              timeToComplete,
              clickCount,
              errors,
              efficiency,
              userFriendliness,
              issues,
              suggestions
            });
          }, 3000);
        });
      }
    }
  ];

  // Run usability test
  const runTest = async (test: UsabilityTest) => {
    setIsRunning(true);
    setCurrentTest(test);
    setTestStartTime(Date.now());
    setUserActions([]);

    try {
      const result = await test.execute();
      setResults(prev => ({ ...prev, [test.id]: result }));
    } catch (error) {
      setResults(prev => ({
        ...prev,
        [test.id]: {
          completed: false,
          timeToComplete: 0,
          clickCount: 0,
          errors: 1,
          efficiency: 0,
          userFriendliness: 0,
          issues: [`Test failed: ${error}`],
          suggestions: ['Fix test execution error']
        }
      }));
    } finally {
      setCurrentTest(null);
      setIsRunning(false);
    }
  };

  // Track user actions during test
  useEffect(() => {
    if (!isRunning) return;

    const trackAction = (type: UserAction['type']) => (e: Event) => {
      const target = e.target as HTMLElement;
      const action: UserAction = {
        type,
        timestamp: Date.now(),
        element: target.tagName.toLowerCase() + (target.className ? `.${target.className.split(' ')[0]}` : ''),
        successful: true // Simplified - would need more logic
      };
      setUserActions(prev => [...prev, action]);
    };

    const clickHandler = trackAction('click');
    const keyHandler = trackAction('keypress');
    const scrollHandler = trackAction('scroll');

    document.addEventListener('click', clickHandler);
    document.addEventListener('keypress', keyHandler);
    document.addEventListener('scroll', scrollHandler);

    return () => {
      document.removeEventListener('click', clickHandler);
      document.removeEventListener('keypress', keyHandler);
      document.removeEventListener('scroll', scrollHandler);
    };
  }, [isRunning]);

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getOverallScore = () => {
    const scores = Object.values(results);
    if (scores.length === 0) return 0;
    
    const avgEfficiency = scores.reduce((sum, r) => sum + r.efficiency, 0) / scores.length;
    const avgUserFriendliness = scores.reduce((sum, r) => sum + r.userFriendliness, 0) / scores.length;
    
    return (avgEfficiency + avgUserFriendliness) / 2;
  };

  if (!showTester) {
    return (
      <motion.button
        onClick={() => setShowTester(true)}
        className="fixed top-4 left-64 z-40 bg-indigo-500 text-white p-2 rounded-full shadow-lg hover:bg-indigo-600"
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        title="Usability Testing"
      >
        <Users size={16} />
      </motion.button>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: -100 }}
      animate={{ opacity: 1, y: 0 }}
      className="fixed top-4 left-64 z-40 bg-white rounded-lg shadow-xl p-4 w-80 max-h-[80vh] overflow-y-auto"
    >
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold flex items-center gap-2">
          <Users size={16} />
          Usability Testing
        </h3>
        <button
          onClick={() => setShowTester(false)}
          className="text-gray-400 hover:text-gray-600"
        >
          ×
        </button>
      </div>

      {/* Current Test Status */}
      {currentTest && (
        <div className="mb-4 p-3 bg-blue-50 rounded-lg">
          <div className="font-medium text-sm mb-2">{currentTest.name}</div>
          <div className="text-xs text-gray-600 mb-2">{currentTest.description}</div>
          <div className="text-xs">
            Expected time: {currentTest.expectedTime / 1000}s
          </div>
          <div className="text-xs">
            Actions tracked: {userActions.length}
          </div>
        </div>
      )}

      {/* Test List */}
      <div className="space-y-2 mb-4">
        {usabilityTests.map(test => {
          const result = results[test.id];
          
          return (
            <div key={test.id} className="border rounded-lg p-3">
              <div className="flex items-center justify-between mb-2">
                <h4 className="font-medium text-sm">{test.name}</h4>
                <button
                  onClick={() => runTest(test)}
                  disabled={isRunning}
                  className="bg-indigo-500 text-white px-2 py-1 rounded text-xs hover:bg-indigo-600 disabled:opacity-50"
                >
                  {currentTest?.id === test.id ? 'Running...' : 'Test'}
                </button>
              </div>
              
              <p className="text-xs text-gray-600 mb-2">{test.description}</p>
              
              {/* Test Steps */}
              <div className="mb-2">
                <div className="text-xs font-medium mb-1">Steps:</div>
                <ol className="text-xs text-gray-600 list-decimal list-inside">
                  {test.steps.map((step, i) => (
                    <li key={i}>{step}</li>
                  ))}
                </ol>
              </div>
              
              {result && (
                <div className="p-2 bg-gray-50 rounded text-xs">
                  <div className="grid grid-cols-2 gap-2 mb-2">
                    <div>
                      <div className="font-medium">Efficiency</div>
                      <div className={getScoreColor(result.efficiency)}>
                        {result.efficiency.toFixed(0)}%
                      </div>
                    </div>
                    <div>
                      <div className="font-medium">User-Friendly</div>
                      <div className={getScoreColor(result.userFriendliness)}>
                        {result.userFriendliness.toFixed(0)}%
                      </div>
                    </div>
                  </div>
                  
                  <div className="space-y-1">
                    <div>Time: {(result.timeToComplete / 1000).toFixed(1)}s</div>
                    <div>Clicks: {result.clickCount}</div>
                    <div>Errors: {result.errors}</div>
                    
                    {result.issues.map((issue, i) => (
                      <div key={i} className="text-red-600">⚠️ {issue}</div>
                    ))}
                    
                    {result.suggestions.map((suggestion, i) => (
                      <div key={i} className="text-blue-600">💡 {suggestion}</div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Overall Score */}
      {Object.keys(results).length > 0 && (
        <div className="mb-4 p-3 bg-gray-50 rounded-lg text-center">
          <div className={`text-2xl font-bold ${getScoreColor(getOverallScore())}`}>
            {getOverallScore().toFixed(0)}%
          </div>
          <div className="text-sm text-gray-600">Overall Usability</div>
        </div>
      )}

      {/* Quick Stats */}
      {Object.keys(results).length > 0 && (
        <div className="text-xs text-gray-600 space-y-1">
          <div>Tests Completed: {Object.keys(results).length}</div>
          <div>Avg Time: {(Object.values(results).reduce((sum, r) => sum + r.timeToComplete, 0) / Object.keys(results).length / 1000).toFixed(1)}s</div>
          <div>Total Errors: {Object.values(results).reduce((sum, r) => sum + r.errors, 0)}</div>
        </div>
      )}
    </motion.div>
  );
};