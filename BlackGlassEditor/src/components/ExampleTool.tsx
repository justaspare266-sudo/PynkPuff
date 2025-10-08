'use client';

import React from 'react';
import { useEditor } from '../contexts/EditorContext';
import { ToolPanel } from './ToolPanel';
import { Star, Heart, Triangle } from 'lucide-react';
import { TriangleShape, HeartShape, ArrowShape, DiamondShape, CloudShape } from './AdvancedShapes';

export function ExampleTool() {
  const { state, actions } = useEditor();

  const addStar = () => {
    // Create a proper star using Konva's Star component
    const star = {
      type: 'star' as const,
      x: Math.random() * 400 + 100,
      y: Math.random() * 300 + 100,
      width: 50,
      height: 50,
      fill: '#ffd700',
      stroke: '#ff6b00',
      strokeWidth: 2,
      numPoints: 5,
      starInnerRadius: 15,
      starOuterRadius: 25,
      visible: true,
      locked: false,
      opacity: 1,
      zIndex: 1,
      isSelected: false,
      isDragging: false,
      isResizing: false,
      isRotating: 0,
      rotation: 0,
      scaleX: 1,
      scaleY: 1,
      isCached: false,
      perfectDrawEnabled: true,
      listening: true,
      name: 'Star',
      boundaryState: {
        isWithinBounds: true,
        violationType: null,
      },
    };
    actions.addShape(star);
  };

  const addHeart = () => {
    // Create a heart using HeartShape
    const heart = {
      type: 'custom' as const,
      customType: 'heart',
      x: Math.random() * 400 + 100,
      y: Math.random() * 300 + 100,
      width: 40,
      height: 40,
      fill: '#ff69b4',
      stroke: '#ff1493',
      strokeWidth: 2,
      visible: true,
      locked: false,
      opacity: 1,
      zIndex: 1,
      isSelected: false,
      isDragging: false,
      isResizing: false,
      isRotating: 0,
      rotation: 0,
      scaleX: 1,
      scaleY: 1,
      isCached: false,
      perfectDrawEnabled: true,
      listening: true,
      name: 'Heart',
      boundaryState: {
        isWithinBounds: true,
        violationType: null,
      },
    };
    actions.addShape(heart);
  };

  const addTriangle = () => {
    // Create a triangle using TriangleShape
    const triangle = {
      type: 'custom' as const,
      customType: 'triangle',
      x: Math.random() * 400 + 100,
      y: Math.random() * 300 + 100,
      width: 60,
      height: 60,
      fill: '#32cd32',
      stroke: '#228b22',
      strokeWidth: 2,
      visible: true,
      locked: false,
      opacity: 1,
      zIndex: 1,
      isSelected: false,
      isDragging: false,
      isResizing: false,
      isRotating: 0,
      rotation: 0,
      scaleX: 1,
      scaleY: 1,
      isCached: false,
      perfectDrawEnabled: true,
      listening: true,
      name: 'Triangle',
      boundaryState: {
        isWithinBounds: true,
        violationType: null,
      },
    };
    actions.addShape(triangle);
  };

  const randomizeColors = () => {
    const colors = ['#ff6b9d', '#4ecdc4', '#45b7d1', '#96ceb4', '#feca57', '#ff9ff3', '#54a0ff'];
    state.shapes.forEach(shape => {
      const randomColor = colors[Math.floor(Math.random() * colors.length)];
      actions.updateShape(shape.id, { fill: randomColor });
    });
  };

  const makeAllShapesTransparent = () => {
    state.shapes.forEach(shape => {
      actions.updateShape(shape.id, { opacity: 0.5 });
    });
  };

  const resetOpacity = () => {
    state.shapes.forEach(shape => {
      actions.updateShape(shape.id, { opacity: 1 });
    });
  };

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-white mb-4">Example Tool</h3>
      
      <div className="space-y-2">
        <button
          onClick={addStar}
          className="w-full p-2 bg-yellow-600 hover:bg-yellow-700 rounded text-sm text-white flex items-center justify-center gap-2"
        >
          <Star className="w-4 h-4" />
          Add Star
        </button>
        
        <button
          onClick={addHeart}
          className="w-full p-2 bg-pink-600 hover:bg-pink-700 rounded text-sm text-white flex items-center justify-center gap-2"
        >
          <Heart className="w-4 h-4" />
          Add Heart
        </button>
        
        <button
          onClick={addTriangle}
          className="w-full p-2 bg-green-600 hover:bg-green-700 rounded text-sm text-white flex items-center justify-center gap-2"
        >
          <Triangle className="w-4 h-4" />
          Add Triangle
        </button>
      </div>

      <div className="border-t border-gray-600 pt-4">
        <h4 className="text-sm font-medium text-white mb-2">Bulk Actions</h4>
        <div className="space-y-2">
          <button
            onClick={randomizeColors}
            className="w-full p-2 bg-purple-600 hover:bg-purple-700 rounded text-sm text-white"
          >
            Randomize Colors
          </button>
          
          <button
            onClick={makeAllShapesTransparent}
            className="w-full p-2 bg-gray-600 hover:bg-gray-500 rounded text-sm text-white"
          >
            Make Transparent
          </button>
          
          <button
            onClick={resetOpacity}
            className="w-full p-2 bg-gray-600 hover:bg-gray-500 rounded text-sm text-white"
          >
            Reset Opacity
          </button>
        </div>
      </div>

      <div className="border-t border-gray-600 pt-4">
        <h4 className="text-sm font-medium text-white mb-2">Info</h4>
        <div className="text-xs text-gray-300 space-y-1">
          <div>Total shapes: {state.shapes.length}</div>
          <div>Selected: {state.tool.selectedShapeIds.length}</div>
          <div>Current tool: {state.tool.selectedTool}</div>
        </div>
      </div>
    </div>
  );
}

// Tool panel wrapper
export function ExampleToolPanel() {
  const { state, actions } = useEditor();

  const openPanel = () => {
    actions.openToolPanel('example', { x: 100, y: 100 });
  };

  return (
    <>
      <button
        onClick={openPanel}
        className="w-12 h-12 rounded-lg flex items-center justify-center transition-all text-gray-300 hover:bg-gray-700"
        title="Example Tool"
      >
        <Star className="w-5 h-5" />
      </button>

      {state.toolPanels.example?.isOpen && (
        <ToolPanel toolId="example" title="Example Tool">
          <ExampleTool />
        </ToolPanel>
      )}
    </>
  );
}
