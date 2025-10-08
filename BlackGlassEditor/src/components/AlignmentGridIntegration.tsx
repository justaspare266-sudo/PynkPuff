'use client';

import React, { useRef, useState, useCallback } from 'react';
import { useEditor } from '../contexts/EditorContext';
import { ToolPanel } from './ToolPanel';
import { Grid, Ruler, Move, Square, AlignLeft, AlignCenter, AlignRight, AlignJustify, AlignStartVertical, AlignEndVertical, AlignCenterVertical, AlignHorizontalDistributeCenter, AlignVerticalDistributeCenter } from 'lucide-react';

// Grid and alignment integration for the main editor
export function AlignmentGridIntegration() {
  const { state, actions } = useEditor();
  const [showGrid, setShowGrid] = useState(true);
  const [snapToGrid, setSnapToGrid] = useState(true);
  const [gridSize, setGridSize] = useState(20);
  const [snapThreshold, setSnapThreshold] = useState(10);
  const [showRulers, setShowRulers] = useState(true);
  const [showGuides, setShowGuides] = useState(true);
  const [guides, setGuides] = useState<Array<{ id: string; type: 'horizontal' | 'vertical'; position: number; color: string }>>([]);

  // Snap to grid function
  const snapToGridPosition = useCallback((x: number, y: number) => {
    if (!snapToGrid) return { x, y };
    
    const snappedX = Math.round(x / gridSize) * gridSize;
    const snappedY = Math.round(y / gridSize) * gridSize;
    
    // Only snap if within threshold
    if (Math.abs(x - snappedX) < snapThreshold && Math.abs(y - snappedY) < snapThreshold) {
      return { x: snappedX, y: snappedY };
    }
    
    return { x, y };
  }, [snapToGrid, gridSize, snapThreshold]);

  // Snap to guides function
  const snapToGuides = useCallback((x: number, y: number) => {
    if (!showGuides) return { x, y };
    
    let snappedX = x;
    let snappedY = y;
    
    guides.forEach(guide => {
      if (guide.type === 'vertical' && Math.abs(x - guide.position) < snapThreshold) {
        snappedX = guide.position;
      } else if (guide.type === 'horizontal' && Math.abs(y - guide.position) < snapThreshold) {
        snappedY = guide.position;
      }
    });
    
    return { x: snappedX, y: snappedY };
  }, [guides, showGuides, snapThreshold]);

  // Snap to elements function
  const snapToElements = useCallback((x: number, y: number) => {
    if (!snapToGrid) return { x, y };
    
    let snappedX = x;
    let snappedY = y;
    
    state.shapes.forEach(shape => {
      const bounds = {
        x: shape.x,
        y: shape.y,
        width: shape.width || 100,
        height: shape.height || 100
      };
      
      // Snap to element edges
      if (Math.abs(x - bounds.x) < snapThreshold) snappedX = bounds.x;
      if (Math.abs(x - (bounds.x + bounds.width)) < snapThreshold) snappedX = bounds.x + bounds.width;
      if (Math.abs(y - bounds.y) < snapThreshold) snappedY = bounds.y;
      if (Math.abs(y - (bounds.y + bounds.height)) < snapThreshold) snappedY = bounds.y + bounds.height;
      
      // Snap to element center
      const centerX = bounds.x + bounds.width / 2;
      const centerY = bounds.y + bounds.height / 2;
      if (Math.abs(x - centerX) < snapThreshold) snappedX = centerX;
      if (Math.abs(y - centerY) < snapThreshold) snappedY = centerY;
    });
    
    return { x: snappedX, y: snappedY };
  }, [state.shapes, snapToGrid, snapThreshold]);

  // Combined snap function
  const snapPosition = useCallback((x: number, y: number) => {
    let snapped = { x, y };
    
    // Apply snapping in order of priority
    snapped = snapToGridPosition(snapped.x, snapped.y);
    snapped = snapToGuides(snapped.x, snapped.y);
    snapped = snapToElements(snapped.x, snapped.y);
    
    return snapped;
  }, [snapToGridPosition, snapToGuides, snapToElements]);

  // Add guide
  const addGuide = (type: 'horizontal' | 'vertical', position: number) => {
    const newGuide = {
      id: `guide-${Date.now()}`,
      type,
      position,
      color: '#00ff00'
    };
    setGuides(prev => [...prev, newGuide]);
  };

  // Remove guide
  const removeGuide = (guideId: string) => {
    setGuides(prev => prev.filter(guide => guide.id !== guideId));
  };

  // Alignment functions
  const alignLeft = () => {
    const selectedShapes = state.shapes.filter(s => state.tool.selectedShapeIds.includes(s.id));
    if (selectedShapes.length < 2) return;
    
    const leftmostX = Math.min(...selectedShapes.map(s => s.x));
    selectedShapes.forEach(shape => {
      actions.updateShape(shape.id, { x: leftmostX });
    });
  };

  const alignCenter = () => {
    const selectedShapes = state.shapes.filter(s => state.tool.selectedShapeIds.includes(s.id));
    if (selectedShapes.length < 2) return;
    
    const centerX = selectedShapes.reduce((sum, s) => sum + s.x + (s.width || 100) / 2, 0) / selectedShapes.length;
    selectedShapes.forEach(shape => {
      actions.updateShape(shape.id, { x: centerX - (shape.width || 100) / 2 });
    });
  };

  const alignRight = () => {
    const selectedShapes = state.shapes.filter(s => state.tool.selectedShapeIds.includes(s.id));
    if (selectedShapes.length < 2) return;
    
    const rightmostX = Math.max(...selectedShapes.map(s => s.x + (s.width || 100)));
    selectedShapes.forEach(shape => {
      actions.updateShape(shape.id, { x: rightmostX - (shape.width || 100) });
    });
  };

  const alignTop = () => {
    const selectedShapes = state.shapes.filter(s => state.tool.selectedShapeIds.includes(s.id));
    if (selectedShapes.length < 2) return;
    
    const topmostY = Math.min(...selectedShapes.map(s => s.y));
    selectedShapes.forEach(shape => {
      actions.updateShape(shape.id, { y: topmostY });
    });
  };

  const alignMiddle = () => {
    const selectedShapes = state.shapes.filter(s => state.tool.selectedShapeIds.includes(s.id));
    if (selectedShapes.length < 2) return;
    
    const centerY = selectedShapes.reduce((sum, s) => sum + s.y + (s.height || 100) / 2, 0) / selectedShapes.length;
    selectedShapes.forEach(shape => {
      actions.updateShape(shape.id, { y: centerY - (shape.height || 100) / 2 });
    });
  };

  const alignBottom = () => {
    const selectedShapes = state.shapes.filter(s => state.tool.selectedShapeIds.includes(s.id));
    if (selectedShapes.length < 2) return;
    
    const bottommostY = Math.max(...selectedShapes.map(s => s.y + (s.height || 100)));
    selectedShapes.forEach(shape => {
      actions.updateShape(shape.id, { y: bottommostY - (shape.height || 100) });
    });
  };

  const distributeHorizontally = () => {
    const selectedShapes = state.shapes.filter(s => state.tool.selectedShapeIds.includes(s.id));
    if (selectedShapes.length < 3) return;
    
    const sortedShapes = selectedShapes.sort((a, b) => a.x - b.x);
    const totalWidth = sortedShapes[sortedShapes.length - 1].x - sortedShapes[0].x;
    const spacing = totalWidth / (sortedShapes.length - 1);
    
    sortedShapes.forEach((shape, index) => {
      if (index > 0) {
        actions.updateShape(shape.id, { x: sortedShapes[0].x + spacing * index });
      }
    });
  };

  const distributeVertically = () => {
    const selectedShapes = state.shapes.filter(s => state.tool.selectedShapeIds.includes(s.id));
    if (selectedShapes.length < 3) return;
    
    const sortedShapes = selectedShapes.sort((a, b) => a.y - b.y);
    const totalHeight = sortedShapes[sortedShapes.length - 1].y - sortedShapes[0].y;
    const spacing = totalHeight / (sortedShapes.length - 1);
    
    sortedShapes.forEach((shape, index) => {
      if (index > 0) {
        actions.updateShape(shape.id, { y: sortedShapes[0].y + spacing * index });
      }
    });
  };

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-white mb-4">Alignment & Grid</h3>
      
      {/* Grid Settings */}
      <div className="space-y-3">
        <h4 className="text-sm font-medium text-white">Grid Settings</h4>
        
        <div className="flex items-center space-x-2">
          <input
            type="checkbox"
            checked={showGrid}
            onChange={(e) => setShowGrid(e.target.checked)}
            className="rounded"
          />
          <label className="text-sm text-gray-300">Show Grid</label>
        </div>
        
        <div className="flex items-center space-x-2">
          <input
            type="checkbox"
            checked={snapToGrid}
            onChange={(e) => setSnapToGrid(e.target.checked)}
            className="rounded"
          />
          <label className="text-sm text-gray-300">Snap to Grid</label>
        </div>
        
        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className="block text-xs text-gray-300 mb-1">Grid Size</label>
            <input
              type="number"
              value={gridSize}
              onChange={(e) => setGridSize(Number(e.target.value))}
              className="w-full p-1 bg-gray-600 rounded text-sm"
              min="5"
              max="100"
            />
          </div>
          <div>
            <label className="block text-xs text-gray-300 mb-1">Snap Threshold</label>
            <input
              type="number"
              value={snapThreshold}
              onChange={(e) => setSnapThreshold(Number(e.target.value))}
              className="w-full p-1 bg-gray-600 rounded text-sm"
              min="1"
              max="50"
            />
          </div>
        </div>
      </div>

      {/* Rulers & Guides */}
      <div className="space-y-3">
        <h4 className="text-sm font-medium text-white">Rulers & Guides</h4>
        
        <div className="flex items-center space-x-2">
          <input
            type="checkbox"
            checked={showRulers}
            onChange={(e) => setShowRulers(e.target.checked)}
            className="rounded"
          />
          <label className="text-sm text-gray-300">Show Rulers</label>
        </div>
        
        <div className="flex items-center space-x-2">
          <input
            type="checkbox"
            checked={showGuides}
            onChange={(e) => setShowGuides(e.target.checked)}
            className="rounded"
          />
          <label className="text-sm text-gray-300">Show Guides</label>
        </div>
        
        <div className="flex space-x-2">
          <button
            onClick={() => addGuide('vertical', 200)}
            className="px-2 py-1 bg-blue-600 hover:bg-blue-700 rounded text-xs text-white"
          >
            Add Vertical Guide
          </button>
          <button
            onClick={() => addGuide('horizontal', 200)}
            className="px-2 py-1 bg-blue-600 hover:bg-blue-700 rounded text-xs text-white"
          >
            Add Horizontal Guide
          </button>
        </div>
        
        {guides.length > 0 && (
          <div className="space-y-1">
            <p className="text-xs text-gray-300">Guides:</p>
            {guides.map(guide => (
              <div key={guide.id} className="flex items-center justify-between text-xs">
                <span className="text-gray-300">
                  {guide.type}: {Math.round(guide.position)}
                </span>
                <button
                  onClick={() => removeGuide(guide.id)}
                  className="text-red-400 hover:text-red-300"
                >
                  ×
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Alignment Tools */}
      <div className="space-y-3">
        <h4 className="text-sm font-medium text-white">Alignment</h4>
        
        <div className="space-y-2">
          <div className="flex space-x-1">
            <button
              onClick={alignLeft}
              className="p-2 bg-gray-600 hover:bg-gray-500 rounded text-sm"
              title="Align Left"
              disabled={state.tool.selectedShapeIds.length < 2}
            >
              <AlignLeft className="w-4 h-4" />
            </button>
            <button
              onClick={alignCenter}
              className="p-2 bg-gray-600 hover:bg-gray-500 rounded text-sm"
              title="Align Center"
              disabled={state.tool.selectedShapeIds.length < 2}
            >
              <AlignCenter className="w-4 h-4" />
            </button>
            <button
              onClick={alignRight}
              className="p-2 bg-gray-600 hover:bg-gray-500 rounded text-sm"
              title="Align Right"
              disabled={state.tool.selectedShapeIds.length < 2}
            >
              <AlignRight className="w-4 h-4" />
            </button>
          </div>
          
          <div className="flex space-x-1">
            <button
              onClick={alignTop}
              className="p-2 bg-gray-600 hover:bg-gray-500 rounded text-sm"
              title="Align Top"
              disabled={state.tool.selectedShapeIds.length < 2}
            >
              <AlignStartVertical className="w-4 h-4" />
            </button>
            <button
              onClick={alignMiddle}
              className="p-2 bg-gray-600 hover:bg-gray-500 rounded text-sm"
              title="Align Middle"
              disabled={state.tool.selectedShapeIds.length < 2}
            >
              <AlignCenterVertical className="w-4 h-4" />
            </button>
            <button
              onClick={alignBottom}
              className="p-2 bg-gray-600 hover:bg-gray-500 rounded text-sm"
              title="Align Bottom"
              disabled={state.tool.selectedShapeIds.length < 2}
            >
              <AlignEndVertical className="w-4 h-4" />
            </button>
          </div>
          
          <div className="flex space-x-1">
            <button
              onClick={distributeHorizontally}
              className="p-2 bg-gray-600 hover:bg-gray-500 rounded text-sm"
              title="Distribute Horizontally"
              disabled={state.tool.selectedShapeIds.length < 3}
            >
              <AlignHorizontalDistributeCenter className="w-4 h-4" />
            </button>
            <button
              onClick={distributeVertically}
              className="p-2 bg-gray-600 hover:bg-gray-500 rounded text-sm"
              title="Distribute Vertically"
              disabled={state.tool.selectedShapeIds.length < 3}
            >
              <AlignVerticalDistributeCenter className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Status */}
      <div className="border-t border-gray-600 pt-4">
        <h4 className="text-sm font-medium text-white mb-2">Status</h4>
        <div className="text-xs text-gray-300 space-y-1">
          <p>Selected: {state.tool.selectedShapeIds.length} shapes</p>
          <p>Grid: {showGrid ? 'On' : 'Off'} ({gridSize}px)</p>
          <p>Snap: {snapToGrid ? 'On' : 'Off'} ({snapThreshold}px threshold)</p>
          <p>Guides: {guides.length} active</p>
        </div>
      </div>
    </div>
  );
}

// Tool panel wrapper
export function AlignmentGridPanel() {
  const { state, actions } = useEditor();

  const openPanel = () => {
    actions.openToolPanel('alignment-grid', { x: 500, y: 100 });
  };

  return (
    <>
      <button
        onClick={openPanel}
        className="w-12 h-12 rounded-lg flex items-center justify-center transition-all text-gray-300 hover:bg-gray-700"
        title="Alignment & Grid"
      >
        <Grid className="w-5 h-5" />
      </button>

      {state.toolPanels['alignment-grid']?.isOpen && (
        <ToolPanel toolId="alignment-grid" title="Alignment & Grid">
          <AlignmentGridIntegration />
        </ToolPanel>
      )}
    </>
  );
}
