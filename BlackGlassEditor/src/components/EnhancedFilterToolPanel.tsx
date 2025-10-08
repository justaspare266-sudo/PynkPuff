'use client';

import React from 'react';
import { useEditor } from '../contexts/EditorContext';
import { ToolPanel } from './ToolPanel';
import { EnhancedFilterTool, FilterEffect } from './EnhancedFilterTool';
import { Filter } from 'lucide-react';

export function EnhancedFilterToolPanel() {
  const { state, actions } = useEditor();

  const openPanel = () => {
    actions.openToolPanel('enhancedFilterTool', { x: 100, y: 100 });
  };

  const getCurrentFilters = (): FilterEffect[] => {
    // For now, return empty array - in a real implementation,
    // you'd store filters in the editor state
    return [];
  };

  const handleFiltersChange = (filters: FilterEffect[]) => {
    // Update selected shapes with filters
    state.tool.selectedShapeIds.forEach(shapeId => {
      actions.updateShape(shapeId, {
        filters: filters,
      });
    });
  };

  return (
    <>
      <button
        onClick={openPanel}
        className="w-12 h-12 rounded-lg flex items-center justify-center transition-all text-gray-300 hover:bg-gray-700"
        title="Enhanced Filter Tool"
      >
        <Filter className="w-5 h-5" />
      </button>

      {state.toolPanels.enhancedFilterTool?.isOpen && (
        <ToolPanel toolId="enhancedFilterTool" title="Enhanced Filter Tool">
          <EnhancedFilterTool
            currentFilters={getCurrentFilters()}
            onFiltersChange={handleFiltersChange}
            onClose={() => actions.closeToolPanel('enhancedFilterTool')}
          />
        </ToolPanel>
      )}
    </>
  );
}
