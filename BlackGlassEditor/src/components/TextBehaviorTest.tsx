'use client';

import React from 'react';
import { useEditor } from '../contexts/EditorContext';
import { ToolPanel } from './ToolPanel';
import { Type, Move, RotateCw, Square } from 'lucide-react';

export function TextBehaviorTest() {
  const { state, actions } = useEditor();

  const addTestText = () => {
    const textShape = {
      type: 'text' as const,
      x: 100,
      y: 100,
      width: 200,
      height: 50,
      visible: true,
      locked: false,
      opacity: 1,
      zIndex: 1,
      isSelected: false,
      isDragging: false,
      isResizing: false,
      isRotating: false,
      fill: '#ff6b9d',
      stroke: '#000000',
      strokeWidth: 1,
      rotation: 0,
      scaleX: 1,
      scaleY: 1,
      text: 'Drag me around!',
      fontSize: 24,
      fontFamily: 'Arial',
      fontWeight: 400,
      fontStyle: 'normal',
      textDecoration: 'none',
      letterSpacing: 0,
      lineHeight: 1.2,
      align: 'left' as const,
      verticalAlign: 'top' as const,
      wrap: 'word' as const,
      ellipsis: false,
      padding: 0,
      direction: 'inherit' as const,
      isCached: false,
      perfectDrawEnabled: true,
      listening: true,
      name: 'Test Text',
      boundaryState: {
        isWithinBounds: true,
        violationType: null,
      },
    };
    actions.addShape(textShape);
  };

  const addResizableText = () => {
    const textShape = {
      type: 'text' as const,
      x: 300,
      y: 100,
      width: 150,
      height: 60,
      visible: true,
      locked: false,
      opacity: 1,
      zIndex: 1,
      isSelected: false,
      isDragging: false,
      isResizing: false,
      isRotating: false,
      fill: '#4ecdc4',
      stroke: '#000000',
      strokeWidth: 2,
      rotation: 0,
      scaleX: 1,
      scaleY: 1,
      text: 'Resize me!',
      fontSize: 20,
      fontFamily: 'Arial',
      fontWeight: 700,
      fontStyle: 'normal',
      textDecoration: 'none',
      letterSpacing: 0,
      lineHeight: 1.2,
      align: 'center' as const,
      verticalAlign: 'middle' as const,
      wrap: 'word' as const,
      ellipsis: false,
      padding: 10,
      direction: 'inherit' as const,
      isCached: false,
      perfectDrawEnabled: true,
      listening: true,
      name: 'Resizable Text',
      boundaryState: {
        isWithinBounds: true,
        violationType: null,
      },
    };
    actions.addShape(textShape);
  };

  const addRotatableText = () => {
    const textShape = {
      type: 'text' as const,
      x: 500,
      y: 100,
      width: 120,
      height: 40,
      visible: true,
      locked: false,
      opacity: 1,
      zIndex: 1,
      isSelected: false,
      isDragging: false,
      isResizing: false,
      isRotating: false,
      fill: '#ffd93d',
      stroke: '#ff6b00',
      strokeWidth: 1,
      rotation: 15, // Start with some rotation
      scaleX: 1,
      scaleY: 1,
      text: 'Rotate me!',
      fontSize: 18,
      fontFamily: 'Arial',
      fontWeight: 600,
      fontStyle: 'italic',
      textDecoration: 'none',
      letterSpacing: 1,
      lineHeight: 1.2,
      align: 'center' as const,
      verticalAlign: 'middle' as const,
      wrap: 'word' as const,
      ellipsis: false,
      padding: 5,
      direction: 'inherit' as const,
      isCached: false,
      perfectDrawEnabled: true,
      listening: true,
      name: 'Rotatable Text',
      boundaryState: {
        isWithinBounds: true,
        violationType: null,
      },
    };
    actions.addShape(textShape);
  };

  const clearAllText = () => {
    const textShapes = state.shapes.filter(shape => shape.type === 'text');
    textShapes.forEach(shape => actions.deleteShape(shape.id));
  };

  const selectAllText = () => {
    const textShapeIds = state.shapes
      .filter(shape => shape.type === 'text')
      .map(shape => shape.id);
    if (textShapeIds.length > 0) {
      actions.selectShape(textShapeIds);
    }
  };

  const textShapes = state.shapes.filter(shape => shape.type === 'text');
  const selectedTextShapes = textShapes.filter(shape => 
    state.tool.selectedShapeIds.includes(shape.id)
  );

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-white mb-4">Text Behavior Test</h3>
      
      {/* Test Controls */}
      <div className="space-y-2">
        <div className="grid grid-cols-2 gap-2">
          <button
            onClick={addTestText}
            className="p-2 bg-pink-600 hover:bg-pink-700 rounded text-sm text-white flex items-center justify-center gap-2"
          >
            <Type className="w-4 h-4" />
            Add Draggable Text
          </button>
          
          <button
            onClick={addResizableText}
            className="p-2 bg-teal-600 hover:bg-teal-700 rounded text-sm text-white flex items-center justify-center gap-2"
          >
            <Square className="w-4 h-4" />
            Add Resizable Text
          </button>
        </div>
        
        <div className="grid grid-cols-2 gap-2">
          <button
            onClick={addRotatableText}
            className="p-2 bg-yellow-600 hover:bg-yellow-700 rounded text-sm text-white flex items-center justify-center gap-2"
          >
            <RotateCw className="w-4 h-4" />
            Add Rotatable Text
          </button>
          
          <button
            onClick={selectAllText}
            className="p-2 bg-blue-600 hover:bg-blue-700 rounded text-sm text-white flex items-center justify-center gap-2"
          >
            <Move className="w-4 h-4" />
            Select All Text
          </button>
        </div>
        
        <button
          onClick={clearAllText}
          className="w-full p-2 bg-red-600 hover:bg-red-700 rounded text-sm text-white"
        >
          Clear All Text
        </button>
      </div>

      {/* Status */}
      <div className="border-t border-gray-600 pt-4">
        <h4 className="text-sm font-medium text-white mb-2">Status</h4>
        <div className="text-xs text-gray-300 space-y-1">
          <p>Total text shapes: {textShapes.length}</p>
          <p>Selected text: {selectedTextShapes.length}</p>
          <p>Current tool: {state.tool.selectedTool}</p>
        </div>
      </div>

      {/* Instructions */}
      <div className="border-t border-gray-600 pt-4">
        <h4 className="text-sm font-medium text-white mb-2">Test Instructions</h4>
        <div className="text-xs text-gray-300 space-y-1">
          <p>1. Click "Add Draggable Text" to create text</p>
          <p>2. Click on text to select it (blue outline appears)</p>
          <p>3. Drag the text around the canvas</p>
          <p>4. Use the resize handles to resize text</p>
          <p>5. Use the rotation handle to rotate text</p>
          <p>6. Try with different text shapes</p>
        </div>
      </div>

      {/* Selected Text Properties */}
      {selectedTextShapes.length > 0 && (
        <div className="border-t border-gray-600 pt-4">
          <h4 className="text-sm font-medium text-white mb-2">Selected Text Properties</h4>
          {selectedTextShapes.map((shape, index) => (
            <div key={shape.id} className="text-xs text-gray-300 space-y-1 mb-2 p-2 bg-gray-700 rounded">
              <p><strong>Text {index + 1}:</strong> {shape.text}</p>
              <p>Position: ({Math.round(shape.x)}, {Math.round(shape.y)})</p>
              <p>Size: {Math.round(shape.width)} × {Math.round(shape.height)}</p>
              <p>Scale: {shape.scaleX} × {shape.scaleY}</p>
              <p>Rotation: {Math.round(shape.rotation)}°</p>
              <p>Font: {shape.fontSize}px {shape.fontFamily}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// Tool panel wrapper
export function TextBehaviorTestPanel() {
  const { state, actions } = useEditor();

  const openPanel = () => {
    actions.openToolPanel('text-behavior-test', { x: 400, y: 200 });
  };

  return (
    <>
      <button
        onClick={openPanel}
        className="w-12 h-12 rounded-lg flex items-center justify-center transition-all text-gray-300 hover:bg-gray-700"
        title="Text Behavior Test"
      >
        <Type className="w-5 h-5" />
      </button>

      {state.toolPanels['text-behavior-test']?.isOpen && (
        <ToolPanel toolId="text-behavior-test" title="Text Behavior Test">
          <TextBehaviorTest />
        </ToolPanel>
      )}
    </>
  );
}
