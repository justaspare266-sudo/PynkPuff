'use client';

import React from 'react';
import { useEditor } from '../contexts/EditorContext';
import { ToolPanel } from './ToolPanel';
import { EnhancedMemoryManager } from './EnhancedMemoryManager';
import { MemoryStick } from 'lucide-react';
import AnimatedToolIcon from './AnimatedToolIcon';

export function EnhancedMemoryManagerPanel() {
  const { state, actions } = useEditor();

  const openPanel = () => {
    actions.openToolPanel('enhanced-memory-manager', { x: 100, y: 100 });
  };

  const handleClose = () => {
    actions.closeToolPanel('enhanced-memory-manager');
  };

  return (
    <>
      <button
        onClick={openPanel}
        className="toolbar-button w-12 h-12 rounded-lg flex items-center justify-center"
        title="Memory Manager"
      >
        <AnimatedToolIcon
          icon={MemoryStick}
          animation="pulse"
          size="md"
          tooltip="Memory Manager"
        />
      </button>

      {state.toolPanels['enhanced-memory-manager']?.isOpen && (
        <ToolPanel toolId="enhanced-memory-manager" title="Memory Manager">
          <EnhancedMemoryManager />
        </ToolPanel>
      )}
    </>
  );
}
