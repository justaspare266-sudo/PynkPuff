'use client';

import React from 'react';
import { useEditor } from '../contexts/EditorContext';
import { ToolPanel } from './ToolPanel';
import { ExternalIntegrations } from './ExternalIntegrations';
import { Link } from 'lucide-react';
import AnimatedToolIcon from './AnimatedToolIcon';

export function ExternalIntegrationsPanel() {
  const { state, actions } = useEditor();

  const openPanel = () => {
    actions.openToolPanel('externalIntegrations', { x: 100, y: 100 });
  };

  const handleIntegrationUpdate = (integration: any) => {
    console.log('Integration updated:', integration);
    // Handle integration updates
  };

  const handleClose = () => {
    actions.closeToolPanel('externalIntegrations');
  };

  return (
    <>
      <button
        onClick={openPanel}
        className="toolbar-button w-12 h-12 rounded-lg flex items-center justify-center"
        title="External Integrations"
      >
        <AnimatedToolIcon
          icon={Link}
          animation="ping"
          size="md"
          tooltip="External Integrations"
        />
      </button>

      {state.toolPanels.externalIntegrations?.isOpen && (
        <ToolPanel toolId="externalIntegrations" title="External Integrations">
          <ExternalIntegrations
            onClose={handleClose}
            onIntegrationUpdate={handleIntegrationUpdate}
          />
        </ToolPanel>
      )}
    </>
  );
}
