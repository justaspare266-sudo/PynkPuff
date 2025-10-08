'use client';

import React from 'react';
import { useEditor } from '../contexts/EditorContext';
import { ToolPanel } from './ToolPanel';
import { AssetLibrary } from './AssetLibrary';
import { FolderOpen } from 'lucide-react';

export function AssetLibraryPanel() {
  const { state, actions } = useEditor();

  const openPanel = () => {
    actions.openToolPanel('asset-library', { x: 400, y: 100 });
  };

  const handleAssetSelect = (asset: any) => {
    // Create a shape from the selected asset
    const newShape = {
      id: `asset-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      type: asset.type === 'image' ? 'image' : 'shape',
      x: 100,
      y: 100,
      width: asset.dimensions?.width || 100,
      height: asset.dimensions?.height || 100,
      fill: '#3b82f6',
      stroke: '#1e40af',
      strokeWidth: 2,
      opacity: 1,
      visible: true,
      rotation: 0,
      scaleX: 1,
      scaleY: 1,
      zIndex: state.shapes.length + 1,
      // Asset-specific properties
      assetUrl: asset.url,
      assetName: asset.name,
      assetType: asset.type,
      assetCategory: asset.category
    };

    actions.addShape(newShape);
    console.log('Asset added to canvas:', asset.name);
  };

  const handleClose = () => {
    actions.closeToolPanel('asset-library');
  };

  return (
    <>
      <button
        onClick={openPanel}
        className="w-12 h-12 rounded-lg flex items-center justify-center transition-all text-gray-300 hover:bg-gray-700"
        title="Asset Library"
      >
        <FolderOpen className="w-5 h-5" />
      </button>

      {state.toolPanels['asset-library']?.isOpen && (
        <ToolPanel toolId="asset-library" title="Asset Library">
          <AssetLibrary 
            onAssetSelect={handleAssetSelect}
            onClose={handleClose}
          />
        </ToolPanel>
      )}
    </>
  );
}
