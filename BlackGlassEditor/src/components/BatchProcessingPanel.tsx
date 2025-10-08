'use client';

import React from 'react';
import { useEditor } from '../contexts/EditorContext';
import { ToolPanel } from './ToolPanel';
import { BatchProcessing } from './BatchProcessing';
import { Zap } from 'lucide-react';
import AnimatedToolIcon from './AnimatedToolIcon';

export function BatchProcessingPanel() {
  const { state, actions } = useEditor();

  const openPanel = () => {
    actions.openToolPanel('batch-processing', { x: 100, y: 100 });
  };

  const handleClose = () => {
    actions.closeToolPanel('batch-processing');
  };

  const handleApplyBatch = (job: any) => {
    console.log('Applying batch job:', job);
    // In real app, this would apply the batch operations to selected objects
  };

  return (
    <>
      <button
        onClick={openPanel}
        className="toolbar-button w-12 h-12 rounded-lg flex items-center justify-center"
        title="Batch Processing"
      >
        <AnimatedToolIcon
          icon={Zap}
          animation="ping"
          size="md"
          tooltip="Batch Processing"
        />
      </button>

      {state.toolPanels['batch-processing']?.isOpen && (
        <ToolPanel toolId="batch-processing" title="Batch Processing">
          <BatchProcessing
            objects={state.shapes}
            selectedObjects={state.tool.selectedShapeIds}
            onClose={handleClose}
            onApplyBatch={handleApplyBatch}
          />
        </ToolPanel>
      )}
    </>
  );
}
