'use client';

import React from 'react';
import { useEditor } from '../contexts/EditorContext';
import { ToolPanel } from './ToolPanel';
import { ArtboardManager } from './ArtboardManager';
import { Layout } from 'lucide-react';
import AnimatedToolIcon from './AnimatedToolIcon';

export function ArtboardManagerPanel() {
  const { state, actions } = useEditor();

  const openPanel = () => {
    actions.openToolPanel('artboard-manager', { x: 100, y: 100 });
  };

  const handleClose = () => {
    actions.closeToolPanel('artboard-manager');
  };

  // Mock artboard data - in real app this would come from EditorContext
  const mockArtboards = [
    {
      id: 'artboard-1',
      name: 'Main Artboard',
      width: 1080,
      height: 1080,
      visible: true,
      locked: false,
      layers: [],
      createdAt: new Date(),
      updatedAt: new Date()
    }
  ];

  const handleArtboardSelect = (id: string) => {
    console.log('Selected artboard:', id);
  };

  const handleArtboardCreate = (artboard: any) => {
    console.log('Create artboard:', artboard);
  };

  const handleArtboardUpdate = (id: string, updates: any) => {
    console.log('Update artboard:', id, updates);
  };

  const handleArtboardDelete = (id: string) => {
    console.log('Delete artboard:', id);
  };

  const handleArtboardDuplicate = (id: string) => {
    console.log('Duplicate artboard:', id);
  };

  return (
    <>
      <button
        onClick={openPanel}
        className="toolbar-button w-12 h-12 rounded-lg flex items-center justify-center"
        title="Artboard Manager"
      >
        <AnimatedToolIcon
          icon={Layout}
          animation="float"
          size="md"
          tooltip="Artboard Manager"
        />
      </button>

      {state.toolPanels['artboard-manager']?.isOpen && (
        <ToolPanel toolId="artboard-manager" title="Artboard Manager">
          <ArtboardManager
            artboards={mockArtboards}
            activeArtboardId="artboard-1"
            onArtboardSelect={handleArtboardSelect}
            onArtboardCreate={handleArtboardCreate}
            onArtboardUpdate={handleArtboardUpdate}
            onArtboardDelete={handleArtboardDelete}
            onArtboardDuplicate={handleArtboardDuplicate}
          />
        </ToolPanel>
      )}
    </>
  );
}
