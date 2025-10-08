'use client';

import React from 'react';
import { useEditor } from '../contexts/EditorContext';
import { ToolPanel } from './ToolPanel';
import { EnhancedLayerManager } from './EnhancedLayerManager';
import { Layers } from 'lucide-react';

export function EnhancedLayerManagerPanel() {
  const { state, actions } = useEditor();

  const openPanel = () => {
    actions.openToolPanel('enhancedLayerManager', { x: 100, y: 100 });
  };

  const convertShapesToLayers = () => {
    return state.shapes.map(shape => ({
      id: shape.id,
      type: shape.type,
      name: shape.name || `${shape.type} Layer`,
      visible: shape.visible,
      locked: shape.locked,
      x: shape.x,
      y: shape.y,
    }));
  };

  const handleLayerSelect = (layerId: string) => {
    actions.selectShape(layerId);
  };

  const handleLayerToggleVisibility = (layerId: string) => {
    const shape = state.shapes.find(s => s.id === layerId);
    if (shape) {
      actions.updateShape(layerId, { visible: !shape.visible });
    }
  };

  const handleLayerToggleLock = (layerId: string) => {
    const shape = state.shapes.find(s => s.id === layerId);
    if (shape) {
      actions.updateShape(layerId, { locked: !shape.locked });
    }
  };

  const handleLayerMoveUp = (layerId: string) => {
    // Move layer up in z-index
    const shape = state.shapes.find(s => s.id === layerId);
    if (shape) {
      actions.updateShape(layerId, { zIndex: (shape.zIndex || 1) + 1 });
    }
  };

  const handleLayerMoveDown = (layerId: string) => {
    // Move layer down in z-index
    const shape = state.shapes.find(s => s.id === layerId);
    if (shape) {
      actions.updateShape(layerId, { zIndex: Math.max((shape.zIndex || 1) - 1, 1) });
    }
  };

  const handleLayerDuplicate = (layerId: string) => {
    const shape = state.shapes.find(s => s.id === layerId);
    if (shape) {
      const duplicatedShape = {
        ...shape,
        id: `shape-${Date.now()}`,
        x: shape.x + 20,
        y: shape.y + 20,
        isSelected: false,
      };
      actions.addShape(duplicatedShape);
    }
  };

  const handleLayerDelete = (layerId: string) => {
    actions.deleteShape(layerId);
  };

  const handleLayerCreate = () => {
    // Create a new default shape
    const newShape = createDefaultShape('rect', 100, 100, state.tool.toolSettings);
    actions.addShape(newShape);
  };

  const handleLayerGroup = (layerIds: string[]) => {
    // Group selected layers
    console.log('Grouping layers:', layerIds);
  };

  const handleLayerUngroup = (layerId: string) => {
    // Ungroup layer
    console.log('Ungrouping layer:', layerId);
  };

  return (
    <>
      <button
        onClick={openPanel}
        className="w-12 h-12 rounded-lg flex items-center justify-center transition-all text-gray-300 hover:bg-gray-700"
        title="Enhanced Layer Manager"
      >
        <Layers className="w-5 h-5" />
      </button>

      {state.toolPanels.enhancedLayerManager?.isOpen && (
        <ToolPanel toolId="enhancedLayerManager" title="Enhanced Layer Manager">
          <EnhancedLayerManager
            isOpen={true}
            onClose={() => actions.closeToolPanel('enhancedLayerManager')}
            layers={convertShapesToLayers()}
            selectedLayerId={state.tool.selectedShapeIds[0]}
            onLayerSelect={handleLayerSelect}
            onLayerToggleVisibility={handleLayerToggleVisibility}
            onLayerToggleLock={handleLayerToggleLock}
            onLayerMoveUp={handleLayerMoveUp}
            onLayerMoveDown={handleLayerMoveDown}
            onLayerDuplicate={handleLayerDuplicate}
            onLayerDelete={handleLayerDelete}
            onLayerCreate={handleLayerCreate}
            onLayerGroup={handleLayerGroup}
            onLayerUngroup={handleLayerUngroup}
          />
        </ToolPanel>
      )}
    </>
  );
}
