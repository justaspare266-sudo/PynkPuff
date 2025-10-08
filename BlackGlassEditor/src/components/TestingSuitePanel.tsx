'use client';

import React from 'react';
import { useEditor } from '../contexts/EditorContext';
import { ToolPanel } from './ToolPanel';
import { TestingSuite } from './TestingSuite';
import { TestTube } from 'lucide-react';

export function TestingSuitePanel() {
  const { state, actions } = useEditor();

  const openPanel = () => {
    actions.openToolPanel('testing-suite', { x: 1400, y: 100 });
  };

  const handleTestRun = (test: any) => {
    console.log('Test running:', test);
    // Run specific tests
  };

  const handleClose = () => {
    actions.closeToolPanel('testing-suite');
  };

  return (
    <>
      <button
        onClick={openPanel}
        className="w-12 h-12 rounded-lg flex items-center justify-center transition-all text-gray-300 hover:bg-gray-700"
        title="Testing Suite"
      >
        <TestTube className="w-5 h-5" />
      </button>

      {state.toolPanels['testing-suite']?.isOpen && (
        <ToolPanel toolId="testing-suite" title="Testing Suite">
          <TestingSuite />
        </ToolPanel>
      )}
    </>
  );
}
