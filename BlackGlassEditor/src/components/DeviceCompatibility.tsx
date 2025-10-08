import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Smartphone, Tablet, Monitor, RotateCcw, Zap } from 'lucide-react';

interface DeviceProfile {
  id: string;
  name: string;
  width: number;
  height: number;
  pixelRatio: number;
  type: 'mobile' | 'tablet' | 'desktop';
  icon: React.ReactNode;
}

interface ResponsiveTest {
  device: DeviceProfile;
  score: number;
  issues: string[];
  recommendations: string[];
}

export const DeviceCompatibility: React.FC = () => {
  const [showTester, setShowTester] = useState(false);
  const [currentDevice, setCurrentDevice] = useState<DeviceProfile | null>(null);
  const [testResults, setTestResults] = useState<ResponsiveTest[]>([]);
  const [isRunning, setIsRunning] = useState(false);

  const deviceProfiles: DeviceProfile[] = [
    {
      id: 'iphone-se',
      name: 'iPhone SE',
      width: 375,
      height: 667,
      pixelRatio: 2,
      type: 'mobile',
      icon: <Smartphone size={16} />
    },
    {
      id: 'iphone-pro',
      name: 'iPhone 14 Pro',
      width: 393,
      height: 852,
      pixelRatio: 3,
      type: 'mobile',
      icon: <Smartphone size={16} />
    },
    {
      id: 'ipad',
      name: 'iPad',
      width: 768,
      height: 1024,
      pixelRatio: 2,
      type: 'tablet',
      icon: <Tablet size={16} />
    },
    {
      id: 'ipad-pro',
      name: 'iPad Pro',
      width: 1024,
      height: 1366,
      pixelRatio: 2,
      type: 'tablet',
      icon: <Tablet size={16} />
    },
    {
      id: 'laptop',
      name: 'Laptop',
      width: 1366,
      height: 768,
      pixelRatio: 1,
      type: 'desktop',
      icon: <Monitor size={16} />
    },
    {
      id: 'desktop',
      name: 'Desktop',
      width: 1920,
      height: 1080,
      pixelRatio: 1,
      type: 'desktop',
      icon: <Monitor size={16} />
    }
  ];

  // Test device compatibility
  const testDevice = async (device: DeviceProfile): Promise<ResponsiveTest> => {
    const issues: string[] = [];
    const recommendations: string[] = [];
    let score = 100;

    // Simulate device viewport
    const originalWidth = window.innerWidth;
    const originalHeight = window.innerHeight;
    
    // Test viewport size
    if (device.width < 768) {
      // Mobile tests
      const toolbar = document.querySelector('[data-testid="toolbar"]');
      if (toolbar && toolbar.scrollWidth > device.width) {
        issues.push('Toolbar overflows on mobile');
        recommendations.push('Use collapsible toolbar for mobile');
        score -= 15;
      }

      const panels = document.querySelector('[data-testid="panels"]');
      if (panels && window.getComputedStyle(panels).display !== 'none') {
        issues.push('Side panels visible on mobile');
        recommendations.push('Hide panels by default on mobile');
        score -= 10;
      }
    }

    // Test touch targets
    if (device.type === 'mobile' || device.type === 'tablet') {
      const buttons = document.querySelectorAll('button');
      let smallButtons = 0;
      
      buttons.forEach(button => {
        const rect = button.getBoundingClientRect();
        if (rect.width < 44 || rect.height < 44) {
          smallButtons++;
        }
      });

      if (smallButtons > 0) {
        issues.push(`${smallButtons} buttons too small for touch`);
        recommendations.push('Increase button size to 44px minimum');
        score -= Math.min(20, smallButtons * 2);
      }
    }

    // Test text readability
    const textElements = document.querySelectorAll('p, span, div');
    let smallText = 0;
    
    textElements.forEach(element => {
      const fontSize = parseFloat(window.getComputedStyle(element).fontSize);
      if (fontSize < 14 && device.type === 'mobile') {
        smallText++;
      }
    });

    if (smallText > 5) {
      issues.push('Text too small on mobile');
      recommendations.push('Increase font size for mobile devices');
      score -= 10;
    }

    // Test performance on device
    const canvas = document.querySelector('canvas');
    if (canvas && device.type === 'mobile') {
      const canvasArea = canvas.width * canvas.height;
      const deviceArea = device.width * device.height * device.pixelRatio * device.pixelRatio;
      
      if (canvasArea > deviceArea * 2) {
        issues.push('Canvas too large for device');
        recommendations.push('Reduce canvas size on mobile');
        score -= 15;
      }
    }

    // Test memory constraints
    if (device.type === 'mobile') {
      const memory = (performance as any).memory;
      if (memory && memory.usedJSHeapSize > 50 * 1024 * 1024) {
        issues.push('High memory usage on mobile');
        recommendations.push('Optimize memory usage for mobile devices');
        score -= 10;
      }
    }

    return {
      device,
      score: Math.max(0, score),
      issues,
      recommendations
    };
  };

  // Run tests on all devices
  const runAllTests = async () => {
    setIsRunning(true);
    const results: ResponsiveTest[] = [];
    
    for (const device of deviceProfiles) {
      setCurrentDevice(device);
      const result = await testDevice(device);
      results.push(result);
      await new Promise(resolve => setTimeout(resolve, 500)); // Simulate testing delay
    }
    
    setTestResults(results);
    setCurrentDevice(null);
    setIsRunning(false);
  };

  // Preview device viewport
  const previewDevice = (device: DeviceProfile) => {
    const editor = document.querySelector('[data-testid="editor"]') as HTMLElement;
    if (editor) {
      editor.style.width = `${device.width}px`;
      editor.style.height = `${device.height}px`;
      editor.style.transform = 'scale(0.5)';
      editor.style.transformOrigin = 'top left';
      editor.style.border = '2px solid #ccc';
    }
  };

  // Reset viewport
  const resetViewport = () => {
    const editor = document.querySelector('[data-testid="editor"]') as HTMLElement;
    if (editor) {
      editor.style.width = '';
      editor.style.height = '';
      editor.style.transform = '';
      editor.style.border = '';
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 90) return 'text-green-600';
    if (score >= 70) return 'text-yellow-600';
    return 'text-red-600';
  };

  if (!showTester) {
    return (
      <motion.button
        onClick={() => setShowTester(true)}
        className="fixed top-4 left-40 z-40 bg-teal-500 text-white p-2 rounded-full shadow-lg hover:bg-teal-600"
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        title="Device Compatibility"
      >
        <Smartphone size={16} />
      </motion.button>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: -100 }}
      animate={{ opacity: 1, y: 0 }}
      className="fixed top-4 left-40 z-40 bg-white rounded-lg shadow-xl p-4 w-80 max-h-[80vh] overflow-y-auto"
    >
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold flex items-center gap-2">
          <Smartphone size={16} />
          Device Testing
        </h3>
        <button
          onClick={() => setShowTester(false)}
          className="text-gray-400 hover:text-gray-600"
        >
          ×
        </button>
      </div>

      {/* Current Test Status */}
      {isRunning && currentDevice && (
        <div className="mb-4 p-3 bg-blue-50 rounded-lg">
          <div className="flex items-center gap-2 mb-2">
            {currentDevice.icon}
            <span className="font-medium">Testing {currentDevice.name}</span>
          </div>
          <div className="text-sm text-gray-600">
            {currentDevice.width} × {currentDevice.height} @ {currentDevice.pixelRatio}x
          </div>
        </div>
      )}

      {/* Device Previews */}
      <div className="mb-4">
        <h4 className="font-medium mb-2">Quick Preview</h4>
        <div className="grid grid-cols-3 gap-2">
          {deviceProfiles.slice(0, 6).map(device => (
            <button
              key={device.id}
              onClick={() => previewDevice(device)}
              className="p-2 border rounded hover:bg-gray-50 text-center"
              title={`${device.width}×${device.height}`}
            >
              {device.icon}
              <div className="text-xs mt-1">{device.name.split(' ')[0]}</div>
            </button>
          ))}
        </div>
        <button
          onClick={resetViewport}
          className="w-full mt-2 p-2 border rounded hover:bg-gray-50 flex items-center justify-center gap-2"
        >
          <RotateCcw size={14} />
          Reset
        </button>
      </div>

      {/* Test Results */}
      {testResults.length > 0 && (
        <div className="mb-4">
          <h4 className="font-medium mb-2">Test Results</h4>
          <div className="space-y-2">
            {testResults.map(result => (
              <div key={result.device.id} className="p-2 border rounded">
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center gap-2">
                    {result.device.icon}
                    <span className="text-sm font-medium">{result.device.name}</span>
                  </div>
                  <span className={`text-sm font-bold ${getScoreColor(result.score)}`}>
                    {result.score}%
                  </span>
                </div>
                
                {result.issues.length > 0 && (
                  <div className="mt-2">
                    <div className="text-xs text-red-600 mb-1">Issues:</div>
                    {result.issues.map((issue, index) => (
                      <div key={index} className="text-xs text-red-600">• {issue}</div>
                    ))}
                  </div>
                )}
                
                {result.recommendations.length > 0 && (
                  <div className="mt-2">
                    <div className="text-xs text-blue-600 mb-1">Recommendations:</div>
                    {result.recommendations.map((rec, index) => (
                      <div key={index} className="text-xs text-blue-600">💡 {rec}</div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Overall Score */}
      {testResults.length > 0 && (
        <div className="mb-4 p-3 bg-gray-50 rounded-lg">
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">
              {Math.round(testResults.reduce((sum, r) => sum + r.score, 0) / testResults.length)}%
            </div>
            <div className="text-sm text-gray-600">Overall Compatibility</div>
          </div>
        </div>
      )}

      {/* Actions */}
      <div className="flex gap-2">
        <button
          onClick={runAllTests}
          disabled={isRunning}
          className="flex-1 bg-teal-500 text-white py-2 px-3 rounded text-sm hover:bg-teal-600 disabled:opacity-50 flex items-center justify-center gap-2"
        >
          <Zap size={14} />
          {isRunning ? 'Testing...' : 'Run Tests'}
        </button>
      </div>
    </motion.div>
  );
};