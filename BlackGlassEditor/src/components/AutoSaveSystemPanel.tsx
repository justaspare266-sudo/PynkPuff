'use client';

import React from 'react';
import { useEditor } from '../contexts/EditorContext';
import { ToolPanel } from './ToolPanel';
import { AutoSaveSystem } from './AutoSaveSystem';
import { Save } from 'lucide-react';
import AnimatedToolIcon from './AnimatedToolIcon';

export function AutoSaveSystemPanel() {
  const { state, actions } = useEditor();

  const openPanel = () => {
    actions.openToolPanel('auto-save-system', { x: 100, y: 100 });
  };

  const handleClose = () => {
    actions.closeToolPanel('auto-save-system');
  };

  // Mock project data - in real app this would come from EditorContext
  const mockProjectData = {
    shapes: state.shapes,
    settings: state.settings,
    lastModified: new Date()
  };

  const handleSave = async (data: any) => {
    console.log('Auto-saving project data:', data);
    // In real app, this would save to localStorage or server
    return Promise.resolve();
  };

  const handleConflictResolved = (resolution: 'local' | 'remote' | 'merge') => {
    console.log('Conflict resolved with:', resolution);
  };

  return (
    <>
      <button
        onClick={openPanel}
        className="toolbar-button w-12 h-12 rounded-lg flex items-center justify-center"
        title="Auto Save System"
      >
        <AnimatedToolIcon
          icon={Save}
          animation="pulse"
          size="md"
          tooltip="Auto Save System"
        />
      </button>

      {state.toolPanels['auto-save-system']?.isOpen && (
        <ToolPanel toolId="auto-save-system" title="Auto Save System">
          <AutoSaveSystem
            projectData={mockProjectData}
            onSave={handleSave}
            onConflictResolved={handleConflictResolved}
          />
        </ToolPanel>
      )}
    </>
  );
}
