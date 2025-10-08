'use client';

import React from 'react';
import { useEditor } from '../contexts/EditorContext';
import { ToolPanel } from './ToolPanel';
import { CloudSync } from './CloudSync';
import { Cloud } from 'lucide-react';
import AnimatedToolIcon from './AnimatedToolIcon';

export function CloudSyncPanel() {
  const { state, actions } = useEditor();

  const openPanel = () => {
    actions.openToolPanel('cloud-sync', { x: 100, y: 100 });
  };

  const handleClose = () => {
    actions.closeToolPanel('cloud-sync');
  };

  // Mock project data - in real app this would come from EditorContext
  const mockProjectData = {
    shapes: state.shapes,
    settings: state.settings,
    lastModified: new Date()
  };

  const handleProjectUpdate = (data: any) => {
    console.log('Project updated from cloud:', data);
    // In real app, this would update the editor state
  };

  const handleSyncStatusChange = (status: any) => {
    console.log('Sync status changed:', status);
  };

  return (
    <>
      <button
        onClick={openPanel}
        className="toolbar-button w-12 h-12 rounded-lg flex items-center justify-center"
        title="Cloud Sync"
      >
        <AnimatedToolIcon
          icon={Cloud}
          animation="float"
          size="md"
          tooltip="Cloud Sync"
        />
      </button>

      {state.toolPanels['cloud-sync']?.isOpen && (
        <ToolPanel toolId="cloud-sync" title="Cloud Sync">
          <CloudSync
            projectData={mockProjectData}
            onProjectUpdate={handleProjectUpdate}
            onSyncStatusChange={handleSyncStatusChange}
          />
        </ToolPanel>
      )}
    </>
  );
}
