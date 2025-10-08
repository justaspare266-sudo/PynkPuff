'use client';

import React from 'react';
import { useEditor } from '../contexts/EditorContext';
import { ToolPanel } from './ToolPanel';
import ColorPalette from './ColorPalette';
import { Droplets } from 'lucide-react';
import AnimatedToolIcon from './AnimatedToolIcon';

export function ColorPalettePanel() {
  const { state, actions } = useEditor();

  const openPanel = () => {
    actions.openToolPanel('color-palette', { x: 100, y: 100 });
  };

  const handleClose = () => {
    actions.closeToolPanel('color-palette');
  };

  const handleColorSelect = (color: any) => {
    console.log('Color selected:', color);
    // In real app, this would update the editor's current color
  };

  return (
    <>
      <button
        onClick={openPanel}
        className="toolbar-button w-12 h-12 rounded-lg flex items-center justify-center"
        title="Color Palette"
      >
        <AnimatedToolIcon
          icon={Droplets}
          animation="float"
          size="md"
          tooltip="Color Palette"
        />
      </button>

      {state.toolPanels['color-palette']?.isOpen && (
        <ToolPanel toolId="color-palette" title="Color Palette">
          <ColorPalette
            onColorSelect={handleColorSelect}
            onClose={handleClose}
          />
        </ToolPanel>
      )}
    </>
  );
}
