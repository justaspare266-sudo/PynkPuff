/**
 * 🎯 OutcomeDemo - Demonstrates the difference between browser recorders and our diagnostic system
 */

import React, { useState } from 'react';
import { outcomeTracker } from './OutcomeTracker';

export const OutcomeDemo: React.FC = () => {
  const [scenarios, setScenarios] = useState<any[]>([]);

  const runScenario = (scenarioName: string, expected: any, actual: any) => {
    // Start tracking
    outcomeTracker.startAction(`demo-${scenarioName}`, 'drag', expected);
    
    // Complete with actual result
    const outcome = outcomeTracker.completeAction(`demo-${scenarioName}`, actual);
    
    setScenarios(prev => [...prev, { scenarioName, expected, actual, outcome }]);
  };

  const testScenarios = [
    {
      name: 'Perfect Drag',
      expected: { startPos: { x: 100, y: 100 }, endPos: { x: 200, y: 200 }, elementId: 'shape-1' },
      actual: { startPos: { x: 100, y: 100 }, endPos: { x: 200, y: 200 }, elementId: 'shape-1', elementVisible: true, elementInBounds: true }
    },
    {
      name: 'Flew Off Screen',
      expected: { startPos: { x: 100, y: 100 }, endPos: { x: 200, y: 200 }, elementId: 'shape-2' },
      actual: { startPos: { x: 100, y: 100 }, endPos: { x: 200, y: 2000 }, elementId: 'shape-2', elementVisible: true, elementInBounds: false }
    },
    {
      name: 'Didn\'t Move',
      expected: { startPos: { x: 100, y: 100 }, endPos: { x: 200, y: 200 }, elementId: 'shape-3' },
      actual: { startPos: { x: 100, y: 100 }, endPos: { x: 100, y: 100 }, elementId: 'shape-3', elementVisible: true, elementInBounds: true }
    },
    {
      name: 'Wrong Direction',
      expected: { startPos: { x: 100, y: 100 }, endPos: { x: 200, y: 200 }, elementId: 'shape-4' },
      actual: { startPos: { x: 100, y: 100 }, endPos: { x: 50, y: 50 }, elementId: 'shape-4', elementVisible: true, elementInBounds: true }
    },
    {
      name: 'Became Invisible',
      expected: { startPos: { x: 100, y: 100 }, endPos: { x: 200, y: 200 }, elementId: 'shape-5' },
      actual: { startPos: { x: 100, y: 100 }, endPos: { x: 200, y: 200 }, elementId: 'shape-5', elementVisible: false, elementInBounds: true }
    }
  ];

  return (
    <div className="p-6 bg-gray-50 rounded-lg">
      <h3 className="text-lg font-semibold mb-4">🎯 Outcome Tracking Demo</h3>
      
      <div className="mb-6">
        <h4 className="font-medium mb-3">Test Scenarios</h4>
        <div className="grid grid-cols-2 gap-2">
          {testScenarios.map((scenario, index) => (
            <button
              key={index}
              onClick={() => runScenario(scenario.name, scenario.expected, scenario.actual)}
              className="px-3 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 text-sm"
            >
              Test: {scenario.name}
            </button>
          ))}
        </div>
      </div>

      {scenarios.length > 0 && (
        <div className="space-y-4">
          <h4 className="font-medium">Results</h4>
          {scenarios.map((scenario, index) => (
            <div key={index} className={`p-4 rounded border-l-4 ${
              scenario.outcome.success 
                ? 'bg-green-50 border-green-400' 
                : 'bg-red-50 border-red-400'
            }`}>
              <div className="flex items-center justify-between mb-2">
                <h5 className="font-medium">{scenario.scenarioName}</h5>
                <span className={`text-sm ${scenario.outcome.success ? 'text-green-600' : 'text-red-600'}`}>
                  {scenario.outcome.success ? '✅ Success' : '❌ Failed'}
                </span>
              </div>
              
              {!scenario.outcome.success && (
                <div className="text-sm text-red-700 mb-2">
                  <strong>Error:</strong> {scenario.outcome.errorMessage}
                </div>
              )}
              
              <div className="grid grid-cols-2 gap-4 text-xs">
                <div>
                  <strong>Expected:</strong>
                  <pre className="bg-gray-100 p-2 rounded mt-1">
                    {JSON.stringify(scenario.expected, null, 2)}
                  </pre>
                </div>
                <div>
                  <strong>Actual:</strong>
                  <pre className="bg-gray-100 p-2 rounded mt-1">
                    {JSON.stringify(scenario.actual, null, 2)}
                  </pre>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="mt-6 p-4 bg-blue-50 rounded">
        <h4 className="font-medium mb-2">🧠 Key Insight</h4>
        <p className="text-sm text-blue-800">
          <strong>Browser Recorders</strong> only see: "User dragged from A to B"<br/>
          <strong>Our Diagnostic System</strong> sees: "User dragged from A to B, but element ended up at C and flew off screen"
        </p>
      </div>
    </div>
  );
};
