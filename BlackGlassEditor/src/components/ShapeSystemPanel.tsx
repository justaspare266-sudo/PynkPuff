'use client';

import React from 'react';
import { useEditor } from '../contexts/EditorContext';
import { ToolPanel } from './ToolPanel';
import ShapeSystem from './ShapeSystem';
import { Square } from 'lucide-react';
import AnimatedToolIcon from './AnimatedToolIcon';

export function ShapeSystemPanel() {
  const { state, actions } = useEditor();

  const openPanel = () => {
    actions.openToolPanel('shapeSystem', { x: 100, y: 100 });
  };

  const handleShapeSelect = (shape: any) => {
    // Convert ShapeDefinition to UnifiedShape format
    const unifiedShape = {
      type: shape.type || 'rect',
      x: Math.random() * 400 + 100,
      y: Math.random() * 300 + 100,
      width: 50,
      height: 50,
      fill: '#ff6b9d',
      stroke: '#4ecdc4',
      strokeWidth: 2,
      visible: true,
      locked: false,
      opacity: 1,
      zIndex: 1,
      isSelected: false,
      isDragging: false,
      isResizing: false,
      isRotating: 0,
      rotation: 0,
      scaleX: 1,
      scaleY: 1,
      isCached: false,
      perfectDrawEnabled: true,
      listening: true,
      name: shape.name || 'Custom Shape',
      boundaryState: {
        isWithinBounds: true,
        violationType: null,
      },
      // Add shape-specific properties
      ...(shape.type === 'star' && {
        numPoints: shape.data?.numPoints || 5,
        starInnerRadius: shape.data?.starInnerRadius || 15,
        starOuterRadius: shape.data?.starOuterRadius || 25,
      }),
      ...(shape.type === 'circle' && {
        radius: shape.data?.radius || 25,
      }),
      ...(shape.type === 'rect' && {
        cornerRadius: shape.data?.cornerRadius || 0,
      }),
    };
    
    actions.addShape(unifiedShape);
  };

  return (
    <>
      <button
        onClick={openPanel}
        className="toolbar-button w-12 h-12 rounded-lg flex items-center justify-center"
        title="Shape System"
      >
        <AnimatedToolIcon
          icon={Square}
          animation="scale"
          size="md"
          tooltip="Shape System"
        />
      </button>

      {state.toolPanels.shapeSystem?.isOpen && (
        <ToolPanel toolId="shapeSystem" title="Shape System">
          <ShapeSystem 
            onShapeSelect={handleShapeSelect}
            onClose={() => actions.closeToolPanel('shapeSystem')}
          />
        </ToolPanel>
      )}
    </>
  );
}
