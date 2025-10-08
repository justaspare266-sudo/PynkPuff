'use client';

import React, { useState, useRef, useEffect, useCallback, forwardRef, useImperativeHandle } from 'react';
import { Square, RotateCw, RotateCcw, Move, ArrowUp, ArrowDown, ArrowLeft, ArrowRight, Grid3X3, AlignLeft, AlignCenter, AlignRight, Undo2, Redo2, Lock, Unlock } from 'lucide-react';
import { CanvasElement, CanvasState } from '../AdvancedImageEditor';

interface ResizeTransformToolProps {
  onResize: (elementId: string, newWidth: number, newHeight: number) => void;
  onTransform: (elementId: string, transform: { x?: number; y?: number; rotation?: number; scaleX?: number; scaleY?: number }) => void;
  selectedElementIds: string[];
  elements: CanvasElement[];
  canvasState: CanvasState;
}

export interface ResizeTransformToolRef {
  resizeElement: (elementId: string, width: number, height: number) => void;
  transformElement: (elementId: string, transform: any) => void;
  resetTransform: (elementId: string) => void;
}

const ResizeTransformTool = forwardRef<ResizeTransformToolRef, ResizeTransformToolProps>(({
  onResize,
  onTransform,
  selectedElementIds,
  elements,
  canvasState
}, ref) => {
  // Transform state
  const [transformState, setTransformState] = useState({
    isDragging: false,
    isResizing: false,
    isRotating: false,
    activeElementId: null as string | null,
    startX: 0,
    startY: 0,
    startTransform: { x: 0, y: 0, width: 0, height: 0, rotation: 0, scaleX: 1, scaleY: 1 },
    lockAspectRatio: false,
    snapToGrid: true,
    snapThreshold: 10
  });

  // Transform handles state
  const [transformHandles, setTransformHandles] = useState({
    isDragging: false,
    activeHandle: null as string | null,
    startX: 0,
    startY: 0,
    startTransform: { x: 0, y: 0, width: 0, height: 0, rotation: 0, scaleX: 1, scaleY: 1 }
  });

  // Refs
  const transformCanvasRef = useRef<HTMLCanvasElement>(null);
  const transformContainerRef = useRef<HTMLDivElement>(null);

  // Expose methods to parent
  useImperativeHandle(ref, () => ({
    resizeElement: (elementId: string, width: number, height: number) => {
      onResize(elementId, width, height);
    },
    transformElement: (elementId: string, transform: any) => {
      onTransform(elementId, transform);
    },
    resetTransform: (elementId: string) => {
      onTransform(elementId, {
        x: 0,
        y: 0,
        rotation: 0,
        scaleX: 1,
        scaleY: 1
      });
    }
  }));

  // Get selected elements
  const selectedElements = elements.filter(el => selectedElementIds.includes(el.id));

  // Snap to grid function
  const snapToGrid = useCallback((value: number) => {
    if (transformState.snapToGrid) {
      return Math.round(value / canvasState.gridSize) * canvasState.gridSize;
    }
    return value;
  }, [transformState.snapToGrid, canvasState.gridSize]);

  // Handle element selection
  const handleElementSelect = useCallback((elementId: string) => {
    setTransformState(prev => ({
      ...prev,
      activeElementId: elementId
    }));
  }, []);

  // Handle transform input changes
  const handleTransformInputChange = useCallback((field: string, value: number, elementId: string) => {
    if (field === 'width' || field === 'height') {
      onResize(elementId, 
        field === 'width' ? value : selectedElements.find(el => el.id === elementId)?.width || 100,
        field === 'height' ? value : selectedElements.find(el => el.id === elementId)?.height || 100
      );
    } else {
      onTransform(elementId, { [field]: value });
    }
  }, [onResize, onTransform, selectedElements]);

  // Handle position changes
  const handlePositionChange = useCallback((elementId: string, x: number, y: number) => {
    const snappedX = snapToGrid(x);
    const snappedY = snapToGrid(y);
    onTransform(elementId, { x: snappedX, y: snappedY });
  }, [onTransform, snapToGrid]);

  // Handle size changes
  const handleSizeChange = useCallback((elementId: string, width: number, height: number) => {
    const snappedWidth = snapToGrid(width);
    const snappedHeight = snapToGrid(height);
    onResize(elementId, snappedWidth, snappedHeight);
  }, [onResize, snapToGrid]);

  // Handle rotation changes
  const handleRotationChange = useCallback((elementId: string, rotation: number) => {
    onTransform(elementId, { rotation });
  }, [onTransform]);

  // Handle scale changes
  const handleScaleChange = useCallback((elementId: string, scaleX: number, scaleY: number) => {
    onTransform(elementId, { scaleX, scaleY });
  }, [onTransform]);

  // Handle alignment
  const handleAlign = useCallback((align: 'left' | 'center' | 'right' | 'top' | 'middle' | 'bottom') => {
    if (selectedElements.length === 0) return;

    const canvasWidth = canvasState.width;
    const canvasHeight = canvasState.height;

    selectedElements.forEach(element => {
      let newX = element.x;
      let newY = element.y;

      switch (align) {
        case 'left':
          newX = 0;
          break;
        case 'center':
          newX = (canvasWidth - element.width) / 2;
          break;
        case 'right':
          newX = canvasWidth - element.width;
          break;
        case 'top':
          newY = 0;
          break;
        case 'middle':
          newY = (canvasHeight - element.height) / 2;
          break;
        case 'bottom':
          newY = canvasHeight - element.height;
          break;
      }

      onTransform(element.id, { x: newX, y: newY });
    });
  }, [selectedElements, canvasState.width, canvasState.height, onTransform]);

  // Handle distribute
  const handleDistribute = useCallback((direction: 'horizontal' | 'vertical') => {
    if (selectedElements.length < 3) return;

    const sortedElements = [...selectedElements].sort((a, b) => 
      direction === 'horizontal' ? a.x - b.x : a.y - b.y
    );

    const start = direction === 'horizontal' ? sortedElements[0].x : sortedElements[0].y;
    const end = direction === 'horizontal' ? 
      sortedElements[sortedElements.length - 1].x + sortedElements[sortedElements.length - 1].width :
      sortedElements[sortedElements.length - 1].y + sortedElements[sortedElements.length - 1].height;
    
    const totalSpace = end - start;
    const elementSpace = totalSpace / (sortedElements.length - 1);

    sortedElements.forEach((element, index) => {
      if (index === 0 || index === sortedElements.length - 1) return;

      const newPosition = start + (elementSpace * index);
      const newX = direction === 'horizontal' ? newPosition : element.x;
      const newY = direction === 'vertical' ? newPosition : element.y;

      onTransform(element.id, { x: newX, y: newY });
    });
  }, [selectedElements, onTransform]);

  // Handle flip
  const handleFlip = useCallback((direction: 'horizontal' | 'vertical') => {
    selectedElements.forEach(element => {
      if (direction === 'horizontal') {
        onTransform(element.id, { scaleX: -element.scaleX });
      } else {
        onTransform(element.id, { scaleY: -element.scaleY });
      }
    });
  }, [selectedElements, onTransform]);

  // Handle duplicate
  const handleDuplicate = useCallback(() => {
    selectedElements.forEach(element => {
      const newElement = {
        ...element,
        id: `${element.type}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        x: element.x + 20,
        y: element.y + 20
      };
      // This would need to be handled by the parent component
      console.log('Duplicate element:', newElement);
    });
  }, [selectedElements]);

  // Handle bring to front
  const handleBringToFront = useCallback(() => {
    // This would be handled by the parent component
    console.log('Bring to front:', selectedElements.map(el => el.id));
  }, [selectedElements]);

  // Handle send to back
  const handleSendToBack = useCallback(() => {
    // This would be handled by the parent component
    console.log('Send to back:', selectedElements.map(el => el.id));
  }, [selectedElements]);

  // Handle lock/unlock
  const handleLockToggle = useCallback((elementId: string, locked: boolean) => {
    // This would be handled by the parent component
    console.log('Toggle lock:', elementId, locked);
  }, []);

  if (selectedElements.length === 0) {
    return (
      <div className="resize-transform-tool space-y-4">
        <h3 className="text-lg font-semibold flex items-center">
          <Square className="w-5 h-5 mr-2" />
          Resize & Transform
        </h3>
        <div className="p-4 bg-gray-600 rounded text-center">
          <p className="text-sm text-gray-300">Select elements to transform</p>
        </div>
      </div>
    );
  }

  return (
    <div className="resize-transform-tool space-y-4">
      <h3 className="text-lg font-semibold flex items-center">
        <Square className="w-5 h-5 mr-2" />
        Resize & Transform
      </h3>

      {/* Selected Elements Info */}
      <div className="p-3 bg-gray-600 rounded">
        <div className="text-sm font-medium mb-2">
          {selectedElements.length} element{selectedElements.length !== 1 ? 's' : ''} selected
        </div>
        <div className="text-xs text-gray-300">
          {selectedElements.map(el => el.type).join(', ')}
        </div>
      </div>

      {/* Position */}
      <div>
        <label className="block text-sm font-medium mb-2">Position</label>
        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className="block text-xs text-gray-300">X</label>
            <input
              type="number"
              value={selectedElements[0]?.x || 0}
              onChange={(e) => handlePositionChange(selectedElements[0]?.id || '', parseInt(e.target.value), selectedElements[0]?.y || 0)}
              className="w-full p-2 bg-gray-600 rounded text-sm"
              min="0"
              max={canvasState.width}
            />
          </div>
          <div>
            <label className="block text-xs text-gray-300">Y</label>
            <input
              type="number"
              value={selectedElements[0]?.y || 0}
              onChange={(e) => handlePositionChange(selectedElements[0]?.id || '', selectedElements[0]?.x || 0, parseInt(e.target.value))}
              className="w-full p-2 bg-gray-600 rounded text-sm"
              min="0"
              max={canvasState.height}
            />
          </div>
        </div>
      </div>

      {/* Size */}
      <div>
        <label className="block text-sm font-medium mb-2">Size</label>
        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className="block text-xs text-gray-300">Width</label>
            <input
              type="number"
              value={selectedElements[0]?.width || 0}
              onChange={(e) => handleSizeChange(selectedElements[0]?.id || '', parseInt(e.target.value), selectedElements[0]?.height || 0)}
              className="w-full p-2 bg-gray-600 rounded text-sm"
              min="1"
              max={canvasState.width}
            />
          </div>
          <div>
            <label className="block text-xs text-gray-300">Height</label>
            <input
              type="number"
              value={selectedElements[0]?.height || 0}
              onChange={(e) => handleSizeChange(selectedElements[0]?.id || '', selectedElements[0]?.width || 0, parseInt(e.target.value))}
              className="w-full p-2 bg-gray-600 rounded text-sm"
              min="1"
              max={canvasState.height}
            />
          </div>
        </div>
        <div className="mt-2">
          <label className="flex items-center">
            <input
              type="checkbox"
              checked={transformState.lockAspectRatio}
              onChange={(e) => setTransformState(prev => ({ ...prev, lockAspectRatio: e.target.checked }))}
              className="mr-2"
            />
            <span className="text-xs">Lock aspect ratio</span>
          </label>
        </div>
      </div>

      {/* Rotation */}
      <div>
        <label className="block text-sm font-medium mb-2">Rotation</label>
        <div className="flex items-center space-x-2">
          <input
            type="range"
            min="0"
            max="360"
            value={selectedElements[0]?.rotation || 0}
            onChange={(e) => handleRotationChange(selectedElements[0]?.id || '', parseInt(e.target.value))}
            className="flex-1"
          />
          <input
            type="number"
            value={selectedElements[0]?.rotation || 0}
            onChange={(e) => handleRotationChange(selectedElements[0]?.id || '', parseInt(e.target.value))}
            className="w-16 p-1 bg-gray-600 rounded text-sm text-center"
            min="0"
            max="360"
          />
          <span className="text-xs text-gray-400">°</span>
        </div>
      </div>

      {/* Scale */}
      <div>
        <label className="block text-sm font-medium mb-2">Scale</label>
        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className="block text-xs text-gray-300">Scale X</label>
            <input
              type="number"
              value={selectedElements[0]?.scaleX || 1}
              onChange={(e) => handleScaleChange(selectedElements[0]?.id || '', parseFloat(e.target.value), selectedElements[0]?.scaleY || 1)}
              className="w-full p-2 bg-gray-600 rounded text-sm"
              min="0.1"
              max="5"
              step="0.1"
            />
          </div>
          <div>
            <label className="block text-xs text-gray-300">Scale Y</label>
            <input
              type="number"
              value={selectedElements[0]?.scaleY || 1}
              onChange={(e) => handleScaleChange(selectedElements[0]?.id || '', selectedElements[0]?.scaleX || 1, parseFloat(e.target.value))}
              className="w-full p-2 bg-gray-600 rounded text-sm"
              min="0.1"
              max="5"
              step="0.1"
            />
          </div>
        </div>
      </div>

      {/* Alignment */}
      <div>
        <label className="block text-sm font-medium mb-2">Alignment</label>
        <div className="grid grid-cols-3 gap-1">
          <button
            className="p-2 bg-gray-600 hover:bg-gray-500 rounded text-xs"
            onClick={() => handleAlign('left')}
            title="Align Left"
          >
            <AlignLeft className="w-4 h-4 mx-auto" />
          </button>
          <button
            className="p-2 bg-gray-600 hover:bg-gray-500 rounded text-xs"
            onClick={() => handleAlign('center')}
            title="Align Center"
          >
            <AlignCenter className="w-4 h-4 mx-auto" />
          </button>
          <button
            className="p-2 bg-gray-600 hover:bg-gray-500 rounded text-xs"
            onClick={() => handleAlign('right')}
            title="Align Right"
          >
            <AlignRight className="w-4 h-4 mx-auto" />
          </button>
        </div>
        <div className="grid grid-cols-3 gap-1 mt-1">
          <button
            className="p-2 bg-gray-600 hover:bg-gray-500 rounded text-xs"
            onClick={() => handleAlign('top')}
            title="Align Top"
          >
            <ArrowUp className="w-4 h-4 mx-auto" />
          </button>
          <button
            className="p-2 bg-gray-600 hover:bg-gray-500 rounded text-xs"
            onClick={() => handleAlign('middle')}
            title="Align Middle"
          >
            <ArrowUp className="w-4 h-4 mx-auto" />
          </button>
          <button
            className="p-2 bg-gray-600 hover:bg-gray-500 rounded text-xs"
            onClick={() => handleAlign('bottom')}
            title="Align Bottom"
          >
            <ArrowDown className="w-4 h-4 mx-auto" />
          </button>
        </div>
      </div>

      {/* Distribute */}
      {selectedElements.length >= 3 && (
        <div>
          <label className="block text-sm font-medium mb-2">Distribute</label>
          <div className="flex space-x-2">
            <button
              className="flex-1 p-2 bg-gray-600 hover:bg-gray-500 rounded text-xs"
              onClick={() => handleDistribute('horizontal')}
              title="Distribute Horizontally"
            >
              <ArrowLeft className="w-4 h-4 mx-auto" />
            </button>
            <button
              className="flex-1 p-2 bg-gray-600 hover:bg-gray-500 rounded text-xs"
              onClick={() => handleDistribute('vertical')}
              title="Distribute Vertically"
            >
              <ArrowUp className="w-4 h-4 mx-auto" />
            </button>
          </div>
        </div>
      )}

      {/* Flip */}
      <div>
        <label className="block text-sm font-medium mb-2">Flip</label>
        <div className="flex space-x-2">
          <button
            className="flex-1 p-2 bg-gray-600 hover:bg-gray-500 rounded text-xs"
            onClick={() => handleFlip('horizontal')}
            title="Flip Horizontal"
          >
            <RotateCcw className="w-4 h-4 mx-auto" />
          </button>
          <button
            className="flex-1 p-2 bg-gray-600 hover:bg-gray-500 rounded text-xs"
            onClick={() => handleFlip('vertical')}
            title="Flip Vertical"
          >
            <RotateCw className="w-4 h-4 mx-auto" />
          </button>
        </div>
      </div>

      {/* Layer Order */}
      <div>
        <label className="block text-sm font-medium mb-2">Layer Order</label>
        <div className="flex space-x-2">
          <button
            className="flex-1 p-2 bg-gray-600 hover:bg-gray-500 rounded text-xs"
            onClick={handleBringToFront}
            title="Bring to Front"
          >
            <ArrowUp className="w-4 h-4 mx-auto" />
          </button>
          <button
            className="flex-1 p-2 bg-gray-600 hover:bg-gray-500 rounded text-xs"
            onClick={handleSendToBack}
            title="Send to Back"
          >
            <ArrowDown className="w-4 h-4 mx-auto" />
          </button>
        </div>
      </div>

      {/* Actions */}
      <div>
        <label className="block text-sm font-medium mb-2">Actions</label>
        <div className="grid grid-cols-2 gap-2">
          <button
            className="p-2 bg-gray-600 hover:bg-gray-500 rounded text-xs"
            onClick={handleDuplicate}
            title="Duplicate"
          >
            <Square className="w-4 h-4 mx-auto" />
          </button>
          <button
            className="p-2 bg-gray-600 hover:bg-gray-500 rounded text-xs"
            onClick={() => selectedElements.forEach(el => handleLockToggle(el.id, false))}
            title="Lock/Unlock"
          >
            <Unlock className="w-4 h-4 mx-auto" />
          </button>
        </div>
      </div>

      {/* Grid Settings */}
      <div>
        <label className="block text-sm font-medium mb-2">Grid Settings</label>
        <div className="space-y-2">
          <label className="flex items-center">
            <input
              type="checkbox"
              checked={transformState.snapToGrid}
              onChange={(e) => setTransformState(prev => ({ ...prev, snapToGrid: e.target.checked }))}
              className="mr-2"
            />
            <span className="text-xs">Snap to grid</span>
          </label>
          <div>
            <label className="block text-xs text-gray-300">Snap threshold</label>
            <input
              type="range"
              min="1"
              max="20"
              value={transformState.snapThreshold}
              onChange={(e) => setTransformState(prev => ({ ...prev, snapThreshold: parseInt(e.target.value) }))}
              className="w-full"
            />
            <span className="text-xs text-gray-400">{transformState.snapThreshold}px</span>
          </div>
        </div>
      </div>

      {/* Instructions */}
      <div className="mt-6 p-3 bg-gray-600 rounded text-xs">
        <h4 className="font-semibold mb-2">Instructions:</h4>
        <ul className="space-y-1 text-gray-300">
          <li>• Drag handles to resize elements</li>
          <li>• Drag center to move elements</li>
          <li>• Use rotation handle to rotate</li>
          <li>• Hold Shift to maintain aspect ratio</li>
          <li>• Use arrow keys for precise positioning</li>
        </ul>
      </div>
    </div>
  );
});

ResizeTransformTool.displayName = 'ResizeTransformTool';

export default ResizeTransformTool;
