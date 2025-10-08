'use client';

import React from 'react';
import { useEditor } from '../contexts/EditorContext';
import { ToolPanel } from './ToolPanel';
import { PerformanceMonitor } from './PerformanceMonitor';
import { Activity } from 'lucide-react';
import AnimatedToolIcon from './AnimatedToolIcon';

export function PerformanceMonitorPanel() {
  const { state, actions } = useEditor();

  const openPanel = () => {
    actions.openToolPanel('performance-monitor', { x: 900, y: 100 });
  };

  const handleClose = () => {
    actions.closeToolPanel('performance-monitor');
  };

  return (
    <>
      <button
        onClick={openPanel}
        className="toolbar-button w-12 h-12 rounded-lg flex items-center justify-center"
        title="Performance Monitor"
      >
        <AnimatedToolIcon
          icon={Activity}
          animation="pulse"
          size="md"
          tooltip="Performance Monitor"
        />
      </button>

      {state.toolPanels['performance-monitor']?.isOpen && (
        <ToolPanel toolId="performance-monitor" title="Performance Monitor">
          <PerformanceMonitor />
        </ToolPanel>
      )}
    </>
  );
}
