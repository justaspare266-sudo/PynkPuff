'use client';

import React, { useState } from 'react';
import { useEditor } from '../contexts/EditorContext';
import { ToolPanel } from './ToolPanel';
import { EnhancedColorTool, Color } from './EnhancedColorTool';
import { Palette } from 'lucide-react';
import AnimatedToolIcon from './AnimatedToolIcon';

export function EnhancedColorToolPanel() {
  const { state, actions } = useEditor();
  const [currentColor, setCurrentColor] = useState<Color>({
    hex: '#FF6B6B',
    rgb: { r: 255, g: 107, b: 107 },
    hsl: { h: 0, s: 100, l: 50 },
    alpha: 1
  });

  const openPanel = () => {
    actions.openToolPanel('enhancedColorTool', { x: 100, y: 100 });
  };

  const handleColorChange = (color: Color) => {
    setCurrentColor(color);
    // Apply color to selected shapes
    state.tool.selectedShapeIds.forEach(shapeId => {
      actions.updateShape(shapeId, { fill: color.hex });
    });
  };

  const handleClose = () => {
    actions.closeToolPanel('enhancedColorTool');
  };

  return (
    <>
      <button
        onClick={openPanel}
        className="toolbar-button w-12 h-12 rounded-lg flex items-center justify-center"
        title="Enhanced Color Tool"
      >
        <AnimatedToolIcon
          icon={Palette}
          animation="glow"
          size="md"
          tooltip="Enhanced Color Tool"
        />
      </button>

      {state.toolPanels.enhancedColorTool?.isOpen && (
        <ToolPanel toolId="enhancedColorTool" title="Enhanced Color Tool">
          <EnhancedColorTool
            currentColor={currentColor}
            onColorChange={handleColorChange}
            onClose={handleClose}
          />
        </ToolPanel>
      )}
    </>
  );
}
