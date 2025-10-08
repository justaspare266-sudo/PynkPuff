'use client';

import React from 'react';
import { useEditor } from '../contexts/EditorContext';
import { ToolPanel } from './ToolPanel';
import CropTool from './CropTool';
import { Crop } from 'lucide-react';

export function CropToolPanel() {
  const { state, actions } = useEditor();

  const openPanel = () => {
    actions.openToolPanel('cropTool', { x: 100, y: 100 });
  };

  const handleCrop = (elementId: string, cropData: { x: number; y: number; width: number; height: number }) => {
    // Update the shape with crop data
    actions.updateShape(elementId, {
      x: cropData.x,
      y: cropData.y,
      width: cropData.width,
      height: cropData.height,
    });
  };

  return (
    <>
      <button
        onClick={openPanel}
        className="w-12 h-12 rounded-lg flex items-center justify-center transition-all text-gray-300 hover:bg-gray-700"
        title="Crop Tool"
      >
        <Crop className="w-5 h-5" />
      </button>

      {state.toolPanels.cropTool?.isOpen && (
        <ToolPanel toolId="cropTool" title="Crop Tool">
          <CropTool
            onCrop={handleCrop}
            selectedElementIds={state.tool.selectedShapeIds}
            elements={state.shapes}
            canvasState={{
              width: 1200,
              height: 800,
              zoom: 1,
              panX: 0,
              panY: 0,
              gridSize: 20,
              snapToGrid: false,
              showGrid: true
            }}
          />
        </ToolPanel>
      )}
    </>
  );
}
