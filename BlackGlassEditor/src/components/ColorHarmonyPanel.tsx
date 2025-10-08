'use client';

import React from 'react';
import { useEditor } from '../contexts/EditorContext';
import { ToolPanel } from './ToolPanel';
import ColorHarmony from './ColorHarmony';
import { RotateCcw } from 'lucide-react';
import AnimatedToolIcon from './AnimatedToolIcon';

export function ColorHarmonyPanel() {
  const { state, actions } = useEditor();

  const openPanel = () => {
    actions.openToolPanel('color-harmony', { x: 100, y: 100 });
  };

  const handleClose = () => {
    actions.closeToolPanel('color-harmony');
  };

  // Mock base color - in real app this would come from EditorContext
  const mockBaseColor = {
    r: 59,
    g: 130,
    b: 246,
    a: 1,
    h: 217,
    s: 91,
    l: 60,
    hex: '#3b82f6',
    hsl: 'hsl(217, 91%, 60%)',
    rgb: 'rgb(59, 130, 246)',
    rgba: 'rgba(59, 130, 246, 1)',
    hsv: { h: 217, s: 76, v: 96 },
    cmyk: { c: 76, m: 47, y: 0, k: 4 }
  };

  const handleColorSelect = (color: any) => {
    console.log('Harmony color selected:', color);
    // In real app, this would update the editor's current color
  };

  return (
    <>
      <button
        onClick={openPanel}
        className="toolbar-button w-12 h-12 rounded-lg flex items-center justify-center"
        title="Color Harmony"
      >
        <AnimatedToolIcon
          icon={RotateCcw}
          animation="spin"
          size="md"
          tooltip="Color Harmony"
        />
      </button>

      {state.toolPanels['color-harmony']?.isOpen && (
        <ToolPanel toolId="color-harmony" title="Color Harmony">
          <ColorHarmony
            baseColor={mockBaseColor}
            onColorSelect={handleColorSelect}
            onClose={handleClose}
          />
        </ToolPanel>
      )}
    </>
  );
}
