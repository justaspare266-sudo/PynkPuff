'use client';

import React, { useState } from 'react';
import { useEditor } from '../contexts/EditorContext';
import { createDefaultShape } from '../contexts/EditorContext';

export function IntegrationTest() {
  const { state, actions } = useEditor();
  const [testResults, setTestResults] = useState<string[]>([]);

  const addTestResult = (result: string) => {
    setTestResults(prev => [...prev, `${new Date().toLocaleTimeString()}: ${result}`]);
  };

  const runTests = () => {
    setTestResults([]);
    
    // Test 1: Add a rectangle
    try {
      const rect = createDefaultShape('rect', 100, 100, state.tool.toolSettings);
      actions.addShape(rect);
      addTestResult('✅ Added rectangle shape');
    } catch (error) {
      addTestResult(`❌ Failed to add rectangle: ${error}`);
    }

    // Test 2: Add a circle
    try {
      const circle = createDefaultShape('circle', 200, 200, state.tool.toolSettings);
      actions.addShape(circle);
      addTestResult('✅ Added circle shape');
    } catch (error) {
      addTestResult(`❌ Failed to add circle: ${error}`);
    }

    // Test 3: Add text
    try {
      const text = createDefaultShape('text', 300, 300, state.tool.toolSettings);
      actions.addShape(text);
      addTestResult('✅ Added text shape');
    } catch (error) {
      addTestResult(`❌ Failed to add text: ${error}`);
    }

    // Test 4: Open color picker
    try {
      actions.openToolPanel('color', { x: 400, y: 100 });
      addTestResult('✅ Opened color picker panel');
    } catch (error) {
      addTestResult(`❌ Failed to open color picker: ${error}`);
    }

    // Test 5: Open layer manager
    try {
      actions.openToolPanel('layers', { x: 400, y: 300 });
      addTestResult('✅ Opened layer manager panel');
    } catch (error) {
      addTestResult(`❌ Failed to open layer manager: ${error}`);
    }

    // Test 6: Update tool settings
    try {
      actions.updateToolSettings({ 
        fillColor: '#ff0000', 
        strokeColor: '#00ff00',
        strokeWidth: 5 
      });
      addTestResult('✅ Updated tool settings');
    } catch (error) {
      addTestResult(`❌ Failed to update tool settings: ${error}`);
    }

    // Test 7: Select all shapes
    try {
      const allShapeIds = state.shapes.map(s => s.id);
      actions.selectShape(allShapeIds);
      addTestResult(`✅ Selected ${allShapeIds.length} shapes`);
    } catch (error) {
      addTestResult(`❌ Failed to select shapes: ${error}`);
    }

    // Test 8: Update canvas settings
    try {
      actions.updateCanvas({ 
        showGrid: !state.canvas.showGrid,
        gridSize: 25 
      });
      addTestResult('✅ Updated canvas settings');
    } catch (error) {
      addTestResult(`❌ Failed to update canvas: ${error}`);
    }
  };

  const clearShapes = () => {
    state.shapes.forEach(shape => actions.deleteShape(shape.id));
    addTestResult('🧹 Cleared all shapes');
  };

  const closeAllPanels = () => {
    Object.keys(state.toolPanels).forEach(toolId => {
      actions.closeToolPanel(toolId);
    });
    addTestResult('🚪 Closed all panels');
  };

  return (
    <div className="fixed top-4 right-4 w-80 bg-gray-800 border border-gray-600 rounded-lg p-4 z-50">
      <h3 className="text-lg font-semibold text-white mb-4">Integration Test</h3>
      
      <div className="space-y-2 mb-4">
        <button
          onClick={runTests}
          className="w-full p-2 bg-blue-600 hover:bg-blue-700 rounded text-sm text-white"
        >
          Run All Tests
        </button>
        <button
          onClick={clearShapes}
          className="w-full p-2 bg-red-600 hover:bg-red-700 rounded text-sm text-white"
        >
          Clear Shapes
        </button>
        <button
          onClick={closeAllPanels}
          className="w-full p-2 bg-gray-600 hover:bg-gray-500 rounded text-sm text-white"
        >
          Close All Panels
        </button>
      </div>

      <div className="text-xs text-gray-300 mb-2">
        State: {state.shapes.length} shapes, {state.tool.selectedShapeIds.length} selected
      </div>

      <div className="max-h-60 overflow-y-auto">
        {testResults.map((result, index) => (
          <div key={index} className="text-xs text-gray-300 mb-1 font-mono">
            {result}
          </div>
        ))}
      </div>
    </div>
  );
}
