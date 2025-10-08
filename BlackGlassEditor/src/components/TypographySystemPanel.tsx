'use client';

import React from 'react';
import { useEditor } from '../contexts/EditorContext';
import { ToolPanel } from './ToolPanel';
import TypographySystem from './TypographySystem';
import { Type } from 'lucide-react';

export function TypographySystemPanel() {
  const { state, actions } = useEditor();

  const openPanel = () => {
    actions.openToolPanel('typography-system', { x: 700, y: 100 });
  };

  const handleTypographyUpdate = (typography: any) => {
    // Apply typography settings to selected text shapes
    const selectedShapes = state.shapes.filter(s => 
      state.tool.selectedShapeIds.includes(s.id) && s.type === 'text'
    );

    if (selectedShapes.length === 0) {
      alert('Please select a text element first');
      return;
    }

    selectedShapes.forEach(shape => {
      // Update text shape with typography settings
      actions.updateShape(shape.id, {
        ...shape,
        ...typography
      });
    });

    console.log('Typography updated:', typography);
  };

  const handleClose = () => {
    actions.closeToolPanel('typography-system');
  };

  return (
    <>
      <button
        onClick={openPanel}
        className="w-12 h-12 rounded-lg flex items-center justify-center transition-all text-gray-300 hover:bg-gray-700"
        title="Typography System"
      >
        <Type className="w-5 h-5" />
      </button>

      {state.toolPanels['typography-system']?.isOpen && (
        <ToolPanel toolId="typography-system" title="Typography System">
          <TypographySystem 
            onTypographyUpdate={handleTypographyUpdate}
            onClose={handleClose}
          />
        </ToolPanel>
      )}
    </>
  );
}
