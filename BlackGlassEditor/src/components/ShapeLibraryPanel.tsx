'use client';

import React from 'react';
import { useEditor } from '../contexts/EditorContext';
import { ToolPanel } from './ToolPanel';
import ShapeLibrary from './ShapeLibrary';
import { Shapes } from 'lucide-react';

export function ShapeLibraryPanel() {
  const { state, actions } = useEditor();

  const openPanel = () => {
    actions.openToolPanel('shape-library', { x: 500, y: 100 });
  };

  const handleShapeSelect = (shape: any) => {
    // Create a shape from the selected shape definition
    const newShape = {
      id: `shape-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      type: shape.type,
      x: 100,
      y: 100,
      width: 100,
      height: 100,
      fill: '#3b82f6',
      stroke: '#1e40af',
      strokeWidth: 2,
      opacity: 1,
      visible: true,
      rotation: 0,
      scaleX: 1,
      scaleY: 1,
      zIndex: state.shapes.length + 1,
      // Shape-specific properties
      shapeDefinition: shape,
      shapeName: shape.name,
      shapeCategory: shape.category,
      shapeData: shape.data
    };

    actions.addShape(newShape);
    console.log('Shape added to canvas:', shape.name);
  };

  const handleClose = () => {
    actions.closeToolPanel('shape-library');
  };

  return (
    <>
      <button
        onClick={openPanel}
        className="w-12 h-12 rounded-lg flex items-center justify-center transition-all text-gray-300 hover:bg-gray-700"
        title="Shape Library"
      >
        <Shapes className="w-5 h-5" />
      </button>

      {state.toolPanels['shape-library']?.isOpen && (
        <ToolPanel toolId="shape-library" title="Shape Library">
          <ShapeLibrary 
            onShapeSelect={handleShapeSelect}
            onClose={handleClose}
          />
        </ToolPanel>
      )}
    </>
  );
}
