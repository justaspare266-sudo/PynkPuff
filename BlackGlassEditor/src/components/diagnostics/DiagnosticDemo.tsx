/**
 * 🧠 DiagnosticDemo - Demo component showing diagnostic capabilities
 * This demonstrates how the diagnostic system can be used
 */

import React, { useState } from 'react';
import { validateTextEngine } from './TextEngineDiagnostics';
import { MasterEditorDiagnostics } from './MasterEditorDiagnostics';

export const DiagnosticDemo: React.FC = () => {
  const [testResults, setTestResults] = useState<any>(null);
  const [diagnostics] = useState(() => MasterEditorDiagnostics.getInstance());

  const runTextEngineTest = () => {
    // Simulate text engine validation
    const mockCanvasRef = { current: document.createElement('canvas') };
    const mockCtx = mockCanvasRef.current.getContext('2d');
    
    const result = validateTextEngine({
      canvasRef: mockCanvasRef as any,
      ctx: mockCtx,
      textDoc: { ops: [{ insert: 'Test text' }] },
      fontSize: 24,
      fontFamily: 'Arial',
      textColor: '#000000',
      alignment: 'left'
    });
    
    setTestResults(result);
  };

  const runPerformanceTest = () => {
    // Simulate performance tracking
    diagnostics.trackToolUsage('gradient', 'activate');
    diagnostics.trackPerformance('render', 15.5);
    diagnostics.trackEvent('tool_click', { tool: 'gradient', position: { x: 100, y: 100 } });
    
    const report = diagnostics.generateReport();
    setTestResults(report);
  };

  return (
    <div className="p-6 bg-gray-50 rounded-lg">
      <h3 className="text-lg font-semibold mb-4">🧠 Diagnostic System Demo</h3>
      
      <div className="space-y-4">
        <div className="flex space-x-2">
          <button
            onClick={runTextEngineTest}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Test Text Engine
          </button>
          <button
            onClick={runPerformanceTest}
            className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
          >
            Test Performance
          </button>
        </div>
        
        {testResults && (
          <div className="bg-white p-4 rounded border">
            <h4 className="font-medium mb-2">Test Results:</h4>
            <pre className="text-sm bg-gray-100 p-2 rounded overflow-auto">
              {JSON.stringify(testResults, null, 2)}
            </pre>
          </div>
        )}
      </div>
    </div>
  );
};
