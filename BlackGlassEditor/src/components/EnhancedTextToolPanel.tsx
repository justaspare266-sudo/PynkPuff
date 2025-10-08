'use client';

import React from 'react';
import { useEditor } from '../contexts/EditorContext';
import { ToolPanel } from './ToolPanel';
import { EnhancedTextTool, TextStyle } from './EnhancedTextTool';
import { Type } from 'lucide-react';

export function EnhancedTextToolPanel() {
  const { state, actions } = useEditor();

  const openPanel = () => {
    actions.openToolPanel('enhancedTextTool', { x: 100, y: 100 });
  };

  const getCurrentTextStyle = (): TextStyle => {
    const selectedShape = state.shapes.find(shape => 
      state.tool.selectedShapeIds.includes(shape.id) && shape.type === 'text'
    );
    
    if (selectedShape) {
      return {
        fontSize: selectedShape.fontSize || 16,
        fontFamily: selectedShape.fontFamily || 'Arial',
        fontWeight: selectedShape.fontWeight || 400,
        fontStyle: selectedShape.fontStyle || 'normal',
        textDecoration: selectedShape.textDecoration || 'none',
        textAlign: selectedShape.align || 'left',
        letterSpacing: selectedShape.letterSpacing || 0,
        lineHeight: selectedShape.lineHeight || 1.2,
        fill: selectedShape.fill || '#000000',
        stroke: selectedShape.stroke,
        strokeWidth: selectedShape.strokeWidth || 0,
        rotation: selectedShape.rotation || 0,
        opacity: selectedShape.opacity || 1,
      };
    }
    
    return {
      fontSize: 16,
      fontFamily: 'Arial',
      fontWeight: 400,
      fontStyle: 'normal',
      textDecoration: 'none',
      textAlign: 'left',
      letterSpacing: 0,
      lineHeight: 1.2,
      fill: '#000000',
      stroke: undefined,
      strokeWidth: 0,
      rotation: 0,
      opacity: 1,
    };
  };

  const handleStyleChange = (style: TextStyle) => {
    // Update all selected text shapes
    state.tool.selectedShapeIds.forEach(shapeId => {
      const shape = state.shapes.find(s => s.id === shapeId);
      if (shape && shape.type === 'text') {
        actions.updateShape(shapeId, {
          fontSize: style.fontSize,
          fontFamily: style.fontFamily,
          fontWeight: style.fontWeight,
          fontStyle: style.fontStyle,
          textDecoration: style.textDecoration,
          align: style.textAlign,
          letterSpacing: style.letterSpacing,
          lineHeight: style.lineHeight,
          fill: style.fill,
          stroke: style.stroke,
          strokeWidth: style.strokeWidth,
          rotation: style.rotation,
          opacity: style.opacity,
        });
      }
    });
  };

  return (
    <>
      <button
        onClick={openPanel}
        className="w-12 h-12 rounded-lg flex items-center justify-center transition-all text-gray-300 hover:bg-gray-700"
        title="Enhanced Text Tool"
      >
        <Type className="w-5 h-5" />
      </button>

      {state.toolPanels.enhancedTextTool?.isOpen && (
        <ToolPanel toolId="enhancedTextTool" title="Enhanced Text Tool">
          <EnhancedTextTool
            currentStyle={getCurrentTextStyle()}
            onStyleChange={handleStyleChange}
            onClose={() => actions.closeToolPanel('enhancedTextTool')}
          />
        </ToolPanel>
      )}
    </>
  );
}
