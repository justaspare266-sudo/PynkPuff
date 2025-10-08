'use client';

import React from 'react';
import { useEditor } from '../contexts/EditorContext';
import { ToolPanel } from './ToolPanel';
import { EnhancedHistoryManager } from './EnhancedHistoryManager';
import { History } from 'lucide-react';
import AnimatedToolIcon from './AnimatedToolIcon';

export function EnhancedHistoryManagerPanel() {
  const { state, actions } = useEditor();

  const openPanel = () => {
    actions.openToolPanel('enhancedHistoryManager', { x: 100, y: 100 });
  };

  const handleStateChange = (state: any) => {
    console.log('History state changed:', state);
  };

  const handleActionPerformed = (action: any) => {
    console.log('Action performed:', action);
  };

  const handleUndo = (action: any) => {
    actions.undo();
  };

  const handleRedo = (action: any) => {
    actions.redo();
  };

  const handleCheckpoint = (state: any) => {
    console.log('Checkpoint created:', state);
  };

  const handleRestore = (state: any) => {
    console.log('State restored:', state);
  };

  const handleExport = (history: any) => {
    console.log('History exported:', history);
  };

  const handleImport = (history: any) => {
    console.log('History imported:', history);
  };

  const handleClose = () => {
    actions.closeToolPanel('enhancedHistoryManager');
  };

  return (
    <>
      <button
        onClick={openPanel}
        className="toolbar-button w-12 h-12 rounded-lg flex items-center justify-center"
        title="Enhanced History Manager"
      >
        <AnimatedToolIcon
          icon={History}
          animation="float"
          size="md"
          tooltip="Enhanced History Manager"
        />
      </button>

      {state.toolPanels.enhancedHistoryManager?.isOpen && (
        <ToolPanel toolId="enhancedHistoryManager" title="Enhanced History Manager">
          <EnhancedHistoryManager
            onStateChange={handleStateChange}
            onActionPerformed={handleActionPerformed}
            onUndo={handleUndo}
            onRedo={handleRedo}
            onCheckpoint={handleCheckpoint}
            onRestore={handleRestore}
            onExport={handleExport}
            onImport={handleImport}
          />
        </ToolPanel>
      )}
    </>
  );
}
