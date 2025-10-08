'use client';

import React from 'react';
import { useEditor } from '../contexts/EditorContext';
import { ToolPanel } from './ToolPanel';
import { EnhancedShapeTool, ShapeStyle } from './EnhancedShapeTool';
import { Square } from 'lucide-react';

export function EnhancedShapeToolPanel() {
  const { state, actions } = useEditor();

  const openPanel = () => {
    actions.openToolPanel('enhancedShapeTool', { x: 100, y: 100 });
  };

  const getCurrentShapeStyle = (): ShapeStyle => {
    const selectedShape = state.shapes.find(shape => 
      state.tool.selectedShapeIds.includes(shape.id)
    );
    
    if (selectedShape) {
      return {
        fill: selectedShape.fill || '#ff6b9d',
        stroke: selectedShape.stroke || '#4ecdc4',
        strokeWidth: selectedShape.strokeWidth || 2,
        fillEnabled: true,
        strokeEnabled: true,
        opacity: selectedShape.opacity || 1,
        rotation: selectedShape.rotation || 0,
        scaleX: selectedShape.scaleX || 1,
        scaleY: selectedShape.scaleY || 1,
        shadowColor: selectedShape.shadowColor || '#000000',
        shadowBlur: selectedShape.shadowBlur || 0,
        shadowOffsetX: selectedShape.shadowOffsetX || 0,
        shadowOffsetY: selectedShape.shadowOffsetY || 0,
        shadowEnabled: selectedShape.shadowEnabled || false,
      };
    }
    
    return {
      fill: '#ff6b9d',
      stroke: '#4ecdc4',
      strokeWidth: 2,
      fillEnabled: true,
      strokeEnabled: true,
      opacity: 1,
      rotation: 0,
      scaleX: 1,
      scaleY: 1,
      shadowColor: '#000000',
      shadowBlur: 0,
      shadowOffsetX: 0,
      shadowOffsetY: 0,
      shadowEnabled: false,
    };
  };

  const handleStyleChange = (style: ShapeStyle) => {
    // Update all selected shapes
    state.tool.selectedShapeIds.forEach(shapeId => {
      actions.updateShape(shapeId, {
        fill: style.fill,
        stroke: style.stroke,
        strokeWidth: style.strokeWidth,
        opacity: style.opacity,
        rotation: style.rotation,
        scaleX: style.scaleX,
        scaleY: style.scaleY,
        shadowColor: style.shadowColor,
        shadowBlur: style.shadowBlur,
        shadowOffsetX: style.shadowOffsetX,
        shadowOffsetY: style.shadowOffsetY,
        shadowEnabled: style.shadowEnabled,
      });
    });
  };

  const handleShapeSelect = (shapeType: string) => {
    // Create a new shape of the selected type
    const shape = {
      type: shapeType as any,
      x: Math.random() * 400 + 100,
      y: Math.random() * 300 + 100,
      width: 100,
      height: 100,
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
      name: `${shapeType} Shape`,
      boundaryState: {
        isWithinBounds: true,
        violationType: null,
      },
    };
    
    actions.addShape(shape);
  };

  return (
    <>
      <button
        onClick={openPanel}
        className="w-12 h-12 rounded-lg flex items-center justify-center transition-all text-gray-300 hover:bg-gray-700"
        title="Enhanced Shape Tool"
      >
        <Square className="w-5 h-5" />
      </button>

      {state.toolPanels.enhancedShapeTool?.isOpen && (
        <ToolPanel toolId="enhancedShapeTool" title="Enhanced Shape Tool">
          <EnhancedShapeTool
            currentStyle={getCurrentShapeStyle()}
            onStyleChange={handleStyleChange}
            onShapeSelect={handleShapeSelect}
            selectedShapeType="rect"
            onClose={() => actions.closeToolPanel('enhancedShapeTool')}
          />
        </ToolPanel>
      )}
    </>
  );
}
