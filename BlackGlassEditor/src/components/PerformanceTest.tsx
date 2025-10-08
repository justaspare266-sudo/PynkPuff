/**
 * Performance Test Component
 * Demonstrates the performance optimizations in action
 */

import React, { useState, useEffect, useCallback } from 'react';
import { Stage, Layer, Rect, Text, Circle } from 'react-konva';
import Konva from 'konva';
import usePerformanceOptimization from '../hooks/usePerformanceOptimization';

interface PerformanceTestProps {
  onClose?: () => void;
}

const PerformanceTest: React.FC<PerformanceTestProps> = ({ onClose }) => {
  const [testRunning, setTestRunning] = useState(false);
  const [objectCount, setObjectCount] = useState(0);
  const [testResults, setTestResults] = useState<any[]>([]);
  
  const {
    updateViewport,
    registerObject,
    unregisterObject,
    getPooledObject,
    returnToPool,
    isObjectVisible,
    optimizeObject,
    recordRenderTime,
    forceGC,
    stats
  } = usePerformanceOptimization();

  const stageRef = React.useRef<Konva.Stage>(null);
  const [objects, setObjects] = useState<any[]>([]);

  // Create test objects
  const createTestObjects = useCallback((count: number) => {
    const newObjects = [];
    
    for (let i = 0; i < count; i++) {
      const object = {
        id: `test-${i}`,
        type: Math.random() > 0.5 ? 'rect' : 'circle',
        x: Math.random() * 800,
        y: Math.random() * 600,
        width: 20 + Math.random() * 30,
        height: 20 + Math.random() * 30,
        fill: `hsl(${Math.random() * 360}, 70%, 50%)`,
        rotation: Math.random() * 360,
        scaleX: 0.5 + Math.random(),
        scaleY: 0.5 + Math.random(),
        opacity: 0.7 + Math.random() * 0.3
      };
      
      newObjects.push(object);
      registerObject(object.id, object, 512); // 512 bytes estimate
    }
    
    setObjects(newObjects);
    setObjectCount(count);
  }, [registerObject]);

  // Run performance test
  const runPerformanceTest = useCallback(async () => {
    setTestRunning(true);
    setTestResults([]);
    
    const testSizes = [10, 50, 100, 200, 500, 1000];
    const results = [];
    
    for (const size of testSizes) {
      // Clear previous objects
      objects.forEach(obj => unregisterObject(obj.id));
      setObjects([]);
      
      // Wait for cleanup
      await new Promise(resolve => setTimeout(resolve, 100));
      
      // Create new objects
      createTestObjects(size);
      
      // Wait for rendering
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Record performance
      const performanceData = {
        objectCount: size,
        fps: stats.fps,
        memoryUsage: stats.memoryUsage,
        renderTime: stats.renderTime,
        performanceScore: stats.performanceScore,
        timestamp: Date.now()
      };
      
      results.push(performanceData);
      setTestResults([...results]);
      
      // Wait between tests
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
    
    setTestRunning(false);
  }, [objects, unregisterObject, createTestObjects, stats]);

  // Render test object
  const renderTestObject = useCallback((obj: any) => {
    if (!isObjectVisible(obj)) {
      return null;
    }

    const commonProps = {
      key: obj.id,
      id: obj.id,
      x: obj.x,
      y: obj.y,
      width: obj.width,
      height: obj.height,
      fill: obj.fill,
      rotation: obj.rotation,
      scaleX: obj.scaleX,
      scaleY: obj.scaleY,
      opacity: obj.opacity,
      listening: false
    };

    if (obj.type === 'circle') {
      return (
        <Circle
          {...commonProps}
          radius={obj.width / 2}
        />
      );
    } else {
      return (
        <Rect
          {...commonProps}
        />
      );
    }
  }, [isObjectVisible]);

  // Update viewport
  useEffect(() => {
    if (stageRef.current) {
      const stage = stageRef.current;
      updateViewport({
        x: stage.x(),
        y: stage.y(),
        width: stage.width(),
        height: stage.height(),
        scale: stage.scaleX()
      });
    }
  }, [updateViewport]);

  // Optimize objects
  useEffect(() => {
    objects.forEach(obj => {
      optimizeObject(obj, obj.id, objects.length);
    });
  }, [objects, optimizeObject]);

  return (
    <div className="h-screen w-screen bg-gray-100 flex">
      {/* Canvas */}
      <div className="flex-1 relative">
        <Stage
          ref={stageRef}
          width={800}
          height={600}
          style={{ background: '#ffffff' }}
        >
          <Layer>
            {/* Background */}
            <Rect
              x={0}
              y={0}
              width={800}
              height={600}
              fill="#ffffff"
              stroke="#d1d5db"
              strokeWidth={2}
              listening={false}
            />
            
            {/* Test Objects */}
            {objects.map(renderTestObject)}
            
            {/* Info Text */}
            <Text
              x={10}
              y={10}
              text={`Objects: ${objectCount} | FPS: ${stats.fps} | Memory: ${stats.memoryUsage.toFixed(1)}MB`}
              fontSize={16}
              fill="#333"
              listening={false}
            />
          </Layer>
        </Stage>
      </div>

      {/* Control Panel */}
      <div className="w-80 bg-gray-200 p-4 overflow-y-auto">
        <h2 className="text-xl font-bold mb-4">Performance Test</h2>
        
        <div className="space-y-4">
          <button
            onClick={runPerformanceTest}
            disabled={testRunning}
            className="w-full px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:bg-gray-400"
          >
            {testRunning ? 'Running Test...' : 'Run Performance Test'}
          </button>
          
          <button
            onClick={forceGC}
            className="w-full px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
          >
            Force Garbage Collection
          </button>
          
          <button
            onClick={() => {
              objects.forEach(obj => unregisterObject(obj.id));
              setObjects([]);
              setObjectCount(0);
            }}
            className="w-full px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
          >
            Clear All Objects
          </button>
          
          {onClose && (
            <button
              onClick={onClose}
              className="w-full px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700"
            >
              Close Test
            </button>
          )}
        </div>

        {/* Performance Stats */}
        <div className="mt-6 space-y-4">
          <div className="bg-white p-3 rounded">
            <h3 className="font-semibold mb-2">Current Performance</h3>
            <div className="text-sm space-y-1">
              <div>FPS: {stats.fps}</div>
              <div>Memory: {stats.memoryUsage.toFixed(1)} MB</div>
              <div>Render Time: {stats.renderTime.toFixed(2)} ms</div>
              <div>Performance Score: {stats.performanceScore}/100</div>
            </div>
          </div>
          
          {stats.recommendations.length > 0 && (
            <div className="bg-yellow-100 p-3 rounded">
              <h3 className="font-semibold mb-2">Recommendations</h3>
              <ul className="text-sm space-y-1">
                {stats.recommendations.map((rec, index) => (
                  <li key={index} className="text-yellow-800">
                    • {rec}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        {/* Test Results */}
        {testResults.length > 0 && (
          <div className="mt-6">
            <h3 className="font-semibold mb-2">Test Results</h3>
            <div className="bg-white p-3 rounded max-h-60 overflow-y-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr className="border-b">
                    <th className="text-left">Objects</th>
                    <th className="text-left">FPS</th>
                    <th className="text-left">Memory</th>
                    <th className="text-left">Score</th>
                  </tr>
                </thead>
                <tbody>
                  {testResults.map((result, index) => (
                    <tr key={index} className="border-b">
                      <td>{result.objectCount}</td>
                      <td>{result.fps}</td>
                      <td>{result.memoryUsage.toFixed(1)}</td>
                      <td>{result.performanceScore}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PerformanceTest;
