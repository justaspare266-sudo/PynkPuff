'use client';

import React from 'react';
import { useEditor } from '../contexts/EditorContext';
import { ToolPanel } from './ToolPanel';
import { DeploymentManager } from './DeploymentManager';
import { Rocket } from 'lucide-react';
import AnimatedToolIcon from './AnimatedToolIcon';

export function DeploymentManagerPanel() {
  const { state, actions } = useEditor();

  const openPanel = () => {
    actions.openToolPanel('deployment-manager', { x: 100, y: 100 });
  };

  const handleClose = () => {
    actions.closeToolPanel('deployment-manager');
  };

  return (
    <>
      <button
        onClick={openPanel}
        className="toolbar-button w-12 h-12 rounded-lg flex items-center justify-center"
        title="Deployment Manager"
      >
        <AnimatedToolIcon
          icon={Rocket}
          animation="bounce"
          size="md"
          tooltip="Deployment Manager"
        />
      </button>

      {state.toolPanels['deployment-manager']?.isOpen && (
        <ToolPanel toolId="deployment-manager" title="Deployment Manager">
          <DeploymentManager />
        </ToolPanel>
      )}
    </>
  );
}
