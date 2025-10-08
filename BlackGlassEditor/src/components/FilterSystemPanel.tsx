'use client';

import React from 'react';
import { useEditor } from '../contexts/EditorContext';
import { ToolPanel } from './ToolPanel';
import FilterSystem from './FilterSystem';
import { Filter } from 'lucide-react';

export function FilterSystemPanel() {
  const { state, actions } = useEditor();

  const openPanel = () => {
    actions.openToolPanel('filter-system', { x: 600, y: 100 });
  };

  const handleEffectApply = (effect: any) => {
    // Apply filter effect to selected shapes
    const selectedShapes = state.shapes.filter(s => 
      state.tool.selectedShapeIds.includes(s.id)
    );

    if (selectedShapes.length === 0) {
      alert('Please select a shape first');
      return;
    }

    selectedShapes.forEach(shape => {
      // Update shape with filter effect
      actions.updateShape(shape.id, {
        ...shape,
        filters: {
          ...shape.filters,
          [effect.name]: effect.value
        }
      });
    });

    console.log('Filter effect applied:', effect.name);
  };

  const handleClose = () => {
    actions.closeToolPanel('filter-system');
  };

  return (
    <>
      <button
        onClick={openPanel}
        className="w-12 h-12 rounded-lg flex items-center justify-center transition-all text-gray-300 hover:bg-gray-700"
        title="Filter System"
      >
        <Filter className="w-5 h-5" />
      </button>

      {state.toolPanels['filter-system']?.isOpen && (
        <ToolPanel toolId="filter-system" title="Filter System">
          <FilterSystem 
            onEffectApply={handleEffectApply}
            onClose={handleClose}
          />
        </ToolPanel>
      )}
    </>
  );
}
