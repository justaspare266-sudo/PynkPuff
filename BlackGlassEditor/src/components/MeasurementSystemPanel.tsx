'use client';

import React from 'react';
import { useEditor } from '../contexts/EditorContext';
import { ToolPanel } from './ToolPanel';
import MeasurementSystem from './MeasurementSystem';
import { Settings } from 'lucide-react';
import AnimatedToolIcon from './AnimatedToolIcon';

export function MeasurementSystemPanel() {
  const { state, actions } = useEditor();

  const openPanel = () => {
    actions.openToolPanel('measurement-system', { x: 100, y: 100 });
  };

  const handleClose = () => {
    actions.closeToolPanel('measurement-system');
  };

  return (
    <>
      <button
        onClick={openPanel}
        className="toolbar-button w-12 h-12 rounded-lg flex items-center justify-center"
        title="Measurement System"
      >
        <AnimatedToolIcon
          icon={Settings}
          animation="spin"
          size="md"
          tooltip="Measurement System"
        />
      </button>

      {state.toolPanels['measurement-system']?.isOpen && (
        <ToolPanel toolId="measurement-system" title="Measurement System">
          <MeasurementSystem
            canvasWidth={1200}
            canvasHeight={800}
            zoom={1}
            panX={0}
            panY={0}
            onClose={handleClose}
          />
        </ToolPanel>
      )}
    </>
  );
}
