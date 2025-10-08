'use client';

import React from 'react';
import { useEditor } from '../contexts/EditorContext';
import { ToolPanel } from './ToolPanel';
import AdvancedFontSelector from './AdvancedFontSelector';
import { Type } from 'lucide-react';
import AnimatedToolIcon from './AnimatedToolIcon';

export function AdvancedFontSelectorPanel() {
  const { state, actions } = useEditor();

  const openPanel = () => {
    actions.openToolPanel('advanced-font-selector', { x: 100, y: 100 });
  };

  const handleClose = () => {
    actions.closeToolPanel('advanced-font-selector');
  };

  // Get selected text shape from editor context
  const selectedShape = state.shapes.find(shape => shape.id === state.tool.selectedShapeId);

  const handlePropertyChange = (property: string, value: any) => {
    if (selectedShape) {
      actions.updateShape(selectedShape.id, { [property]: value });
    }
  };

  const handleBatchPropertyChange = (updates: Record<string, any>) => {
    if (selectedShape) {
      actions.updateShape(selectedShape.id, updates);
    }
  };

  return (
    <>
      <button
        onClick={openPanel}
        className="toolbar-button w-12 h-12 rounded-lg flex items-center justify-center"
        title="Advanced Font Selector"
      >
        <AnimatedToolIcon
          icon={Type}
          animation="wiggle"
          size="md"
          tooltip="Advanced Font Selector"
        />
      </button>

      {state.toolPanels['advanced-font-selector']?.isOpen && (
        <ToolPanel toolId="advanced-font-selector" title="Complete Typography Control Panel">
          <AdvancedFontSelector
            selectedShape={selectedShape}
            onPropertyChange={handlePropertyChange}
            onBatchPropertyChange={handleBatchPropertyChange}
          />
        </ToolPanel>
      )}
    </>
  );
}
