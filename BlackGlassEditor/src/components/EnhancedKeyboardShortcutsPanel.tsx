'use client';

import React from 'react';
import { useEditor } from '../contexts/EditorContext';
import { ToolPanel } from './ToolPanel';
import { EnhancedKeyboardShortcuts } from './EnhancedKeyboardShortcuts';
import { Keyboard } from 'lucide-react';

export function EnhancedKeyboardShortcutsPanel() {
  const { state, actions } = useEditor();

  const openPanel = () => {
    actions.openToolPanel('enhancedKeyboardShortcuts', { x: 100, y: 100 });
  };

  const handleToolSelect = (tool: string) => {
    actions.setSelectedTool(tool as any);
  };

  const handleUndo = () => {
    // Implement undo functionality
    console.log('Undo');
  };

  const handleRedo = () => {
    // Implement redo functionality
    console.log('Redo');
  };

  const handleCopy = () => {
    // Copy selected shapes
    console.log('Copy');
  };

  const handlePaste = () => {
    // Paste copied shapes
    console.log('Paste');
  };

  const handleCut = () => {
    // Cut selected shapes
    console.log('Cut');
  };

  const handleDelete = () => {
    // Delete selected shapes
    state.tool.selectedShapeIds.forEach(shapeId => {
      actions.deleteShape(shapeId);
    });
  };

  const handleSelectAll = () => {
    // Select all shapes
    const allShapeIds = state.shapes.map(shape => shape.id);
    actions.selectShape(allShapeIds);
  };

  const handleDeselectAll = () => {
    // Deselect all shapes
    actions.selectShape([]);
  };

  const handleGroup = () => {
    // Group selected shapes
    console.log('Group');
  };

  const handleUngroup = () => {
    // Ungroup selected shapes
    console.log('Ungroup');
  };

  const handleBringToFront = () => {
    // Bring selected shapes to front
    state.tool.selectedShapeIds.forEach(shapeId => {
      const shape = state.shapes.find(s => s.id === shapeId);
      if (shape) {
        actions.updateShape(shapeId, { zIndex: 999 });
      }
    });
  };

  const handleSendToBack = () => {
    // Send selected shapes to back
    state.tool.selectedShapeIds.forEach(shapeId => {
      const shape = state.shapes.find(s => s.id === shapeId);
      if (shape) {
        actions.updateShape(shapeId, { zIndex: 1 });
      }
    });
  };

  const handleBringForward = () => {
    // Bring selected shapes forward
    state.tool.selectedShapeIds.forEach(shapeId => {
      const shape = state.shapes.find(s => s.id === shapeId);
      if (shape) {
        actions.updateShape(shapeId, { zIndex: (shape.zIndex || 1) + 1 });
      }
    });
  };

  const handleSendBackward = () => {
    // Send selected shapes backward
    state.tool.selectedShapeIds.forEach(shapeId => {
      const shape = state.shapes.find(s => s.id === shapeId);
      if (shape) {
        actions.updateShape(shapeId, { zIndex: Math.max((shape.zIndex || 1) - 1, 1) });
      }
    });
  };

  const handleFlipHorizontal = () => {
    // Flip selected shapes horizontally
    state.tool.selectedShapeIds.forEach(shapeId => {
      const shape = state.shapes.find(s => s.id === shapeId);
      if (shape) {
        actions.updateShape(shapeId, { scaleX: -(shape.scaleX || 1) });
      }
    });
  };

  const handleFlipVertical = () => {
    // Flip selected shapes vertically
    state.tool.selectedShapeIds.forEach(shapeId => {
      const shape = state.shapes.find(s => s.id === shapeId);
      if (shape) {
        actions.updateShape(shapeId, { scaleY: -(shape.scaleY || 1) });
      }
    });
  };

  const handleRotate90 = () => {
    // Rotate selected shapes 90 degrees
    state.tool.selectedShapeIds.forEach(shapeId => {
      const shape = state.shapes.find(s => s.id === shapeId);
      if (shape) {
        actions.updateShape(shapeId, { rotation: (shape.rotation || 0) + 90 });
      }
    });
  };

  const handleRotate180 = () => {
    // Rotate selected shapes 180 degrees
    state.tool.selectedShapeIds.forEach(shapeId => {
      const shape = state.shapes.find(s => s.id === shapeId);
      if (shape) {
        actions.updateShape(shapeId, { rotation: (shape.rotation || 0) + 180 });
      }
    });
  };

  const handleZoomIn = () => {
    // Zoom in
    console.log('Zoom In');
  };

  const handleZoomOut = () => {
    // Zoom out
    console.log('Zoom Out');
  };

  const handleZoomReset = () => {
    // Reset zoom
    console.log('Zoom Reset');
  };

  const handleZoomToFit = () => {
    // Zoom to fit all objects
    console.log('Zoom to Fit');
  };

  const handleZoomToSelection = () => {
    // Zoom to fit selected objects
    console.log('Zoom to Selection');
  };

  const handleToggleGrid = () => {
    // Toggle grid visibility
    console.log('Toggle Grid');
  };

  const handleToggleRulers = () => {
    // Toggle rulers visibility
    console.log('Toggle Rulers');
  };

  const handleToggleGuides = () => {
    // Toggle guides visibility
    console.log('Toggle Guides');
  };

  const handleToggleLayers = () => {
    // Toggle layers panel
    actions.openToolPanel('enhancedLayerManager', { x: 100, y: 100 });
  };

  const handleToggleProperties = () => {
    // Toggle properties panel
    console.log('Toggle Properties');
  };

  const handleShowHelp = () => {
    // Show help
    console.log('Show Help');
  };

  const handleShowSettings = () => {
    // Show settings
    console.log('Show Settings');
  };

  const handleSave = () => {
    // Save project
    console.log('Save');
  };

  const handleLoad = () => {
    // Load project
    console.log('Load');
  };

  const handleExport = () => {
    // Export project
    console.log('Export');
  };

  return (
    <>
      <button
        onClick={openPanel}
        className="w-12 h-12 rounded-lg flex items-center justify-center transition-all text-gray-300 hover:bg-gray-700"
        title="Keyboard Shortcuts"
      >
        <Keyboard className="w-5 h-5" />
      </button>

      {state.toolPanels.enhancedKeyboardShortcuts?.isOpen && (
        <ToolPanel toolId="enhancedKeyboardShortcuts" title="Keyboard Shortcuts">
          <EnhancedKeyboardShortcuts
            onToolSelect={handleToolSelect}
            onUndo={handleUndo}
            onRedo={handleRedo}
            onCopy={handleCopy}
            onPaste={handlePaste}
            onCut={handleCut}
            onDelete={handleDelete}
            onSelectAll={handleSelectAll}
            onDeselectAll={handleDeselectAll}
            onGroup={handleGroup}
            onUngroup={handleUngroup}
            onBringToFront={handleBringToFront}
            onSendToBack={handleSendToBack}
            onBringForward={handleBringForward}
            onSendBackward={handleSendBackward}
            onFlipHorizontal={handleFlipHorizontal}
            onFlipVertical={handleFlipVertical}
            onRotate90={handleRotate90}
            onRotate180={handleRotate180}
            onZoomIn={handleZoomIn}
            onZoomOut={handleZoomOut}
            onZoomReset={handleZoomReset}
            onZoomToFit={handleZoomToFit}
            onZoomToSelection={handleZoomToSelection}
            onToggleGrid={handleToggleGrid}
            onToggleRulers={handleToggleRulers}
            onToggleGuides={handleToggleGuides}
            onToggleLayers={handleToggleLayers}
            onToggleProperties={handleToggleProperties}
            onShowHelp={handleShowHelp}
            onShowSettings={handleShowSettings}
            onSave={handleSave}
            onLoad={handleLoad}
            onExport={handleExport}
            onClose={() => actions.closeToolPanel('enhancedKeyboardShortcuts')}
          />
        </ToolPanel>
      )}
    </>
  );
}
