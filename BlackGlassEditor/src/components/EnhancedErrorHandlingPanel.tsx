'use client';

import React from 'react';
import { useEditor } from '../contexts/EditorContext';
import { ToolPanel } from './ToolPanel';
import { EnhancedErrorHandling } from './EnhancedErrorHandling';
import { AlertTriangle } from 'lucide-react';
import AnimatedToolIcon from './AnimatedToolIcon';

export function EnhancedErrorHandlingPanel() {
  const { state, actions } = useEditor();

  const openPanel = () => {
    actions.openToolPanel('enhancedErrorHandling', { x: 100, y: 100 });
  };

  const handleError = (error: any) => {
    console.log('Error reported:', error);
  };

  const handleRecovery = (errorId: string) => {
    console.log('Error recovered:', errorId);
  };

  const handleReport = (error: any) => {
    console.log('Error reported:', error);
  };

  const handleClearAll = () => {
    console.log('All errors cleared');
  };

  const handleClose = () => {
    actions.closeToolPanel('enhancedErrorHandling');
  };

  return (
    <>
      <button
        onClick={openPanel}
        className="toolbar-button w-12 h-12 rounded-lg flex items-center justify-center"
        title="Enhanced Error Handling"
      >
        <AnimatedToolIcon
          icon={AlertTriangle}
          animation="shake"
          size="md"
          tooltip="Enhanced Error Handling"
        />
      </button>

      {state.toolPanels.enhancedErrorHandling?.isOpen && (
        <ToolPanel toolId="enhancedErrorHandling" title="Enhanced Error Handling">
          <EnhancedErrorHandling
            onError={handleError}
            onRecovery={handleRecovery}
            onReport={handleReport}
            onClearAll={handleClearAll}
          />
        </ToolPanel>
      )}
    </>
  );
}
