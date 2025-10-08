'use client';

import React from 'react';
import { useEditor } from '../contexts/EditorContext';
import { ToolPanel } from './ToolPanel';
import { EnhancedAssetManager } from './EnhancedAssetManager';
import { FolderOpen } from 'lucide-react';
import AnimatedToolIcon from './AnimatedToolIcon';

export function EnhancedAssetManagerPanel() {
  const { state, actions } = useEditor();

  const openPanel = () => {
    actions.openToolPanel('enhancedAssetManager', { x: 100, y: 100 });
  };

  const handleAssetSelect = (asset: any) => {
    // Handle asset selection
    console.log('Asset selected:', asset);
  };

  const handleAssetUpload = (file: File) => {
    // Handle asset upload
    console.log('Asset uploaded:', file);
  };

  const handleAssetDelete = (assetId: string) => {
    // Handle asset deletion
    console.log('Asset deleted:', assetId);
  };

  const handleClose = () => {
    actions.closeToolPanel('enhancedAssetManager');
  };

  return (
    <>
      <button
        onClick={openPanel}
        className="toolbar-button w-12 h-12 rounded-lg flex items-center justify-center"
        title="Enhanced Asset Manager"
      >
        <AnimatedToolIcon
          icon={FolderOpen}
          animation="scale"
          size="md"
          tooltip="Enhanced Asset Manager"
        />
      </button>

      {state.toolPanels.enhancedAssetManager?.isOpen && (
        <ToolPanel toolId="enhancedAssetManager" title="Enhanced Asset Manager">
          <EnhancedAssetManager
            assets={[]} // Pass actual assets from state
            onAssetSelect={handleAssetSelect}
            onAssetUpload={handleAssetUpload}
            onAssetDelete={handleAssetDelete}
          />
        </ToolPanel>
      )}
    </>
  );
}
