'use client';

import React, { useState, useRef, useEffect, useCallback, forwardRef, useImperativeHandle } from 'react';
import { RotateCw, Move, Square, Circle, ArrowUp, ArrowDown, ArrowLeft, ArrowRight, Grid3X3, Lock, Unlock, Zap, Settings, Eye, EyeOff, Trash2, Copy, RotateCcw, FlipHorizontal, FlipVertical, AlignLeft, AlignCenter, AlignRight, AlignJustify } from 'lucide-react';

// Types
export interface TransformState {
  isTransforming: boolean;
  isRotating: boolean;
  isScaling: boolean;
  isMoving: boolean;
  snapToGrid: boolean;
  snapToGuides: boolean;
  snapToElements: boolean;
  gridSize: number;
  rotationSnaps: number[];
  scaleSnaps: number[];
  boundaryConstraints: {
    enabled: boolean;
    minX: number;
    minY: number;
    maxX: number;
    maxY: number;
  };
  transformOrigin: 'center' | 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right';
  maintainAspectRatio: boolean;
  lockAxis: 'none' | 'x' | 'y';
  precision: number; // decimal places
}

interface TransformToolProps {
  selectedElementIds: string[];
  elements: any[];
  canvasState: {
    width: number;
    height: number;
    zoom: number;
    panX: number;
    panY: number;
    gridSize: number;
    snapToGrid: boolean;
    showGrid: boolean;
  };
  onTransform: (elementId: string, transform: any) => void;
  onBatchTransform: (transforms: Array<{ id: string; transform: any }>) => void;
}

export interface TransformToolRef {
  startTransform: (elementId: string, type: 'move' | 'rotate' | 'scale') => void;
  endTransform: () => void;
  snapToGrid: (x: number, y: number) => { x: number; y: number };
  snapToGuides: (x: number, y: number) => { x: number; y: number };
  snapToElements: (x: number, y: number) => { x: number; y: number };
  constrainToBounds: (x: number, y: number, width: number, height: number) => { x: number; y: number };
  alignElements: (alignment: 'left' | 'center' | 'right' | 'top' | 'middle' | 'bottom') => void;
  distributeElements: (direction: 'horizontal' | 'vertical') => void;
  flipElements: (direction: 'horizontal' | 'vertical') => void;
  rotateElements: (angle: number) => void;
  resetTransform: () => void;
}

const TransformTool = forwardRef<TransformToolRef, TransformToolProps>(({
  selectedElementIds,
  elements,
  canvasState,
  onTransform,
  onBatchTransform
}, ref) => {
  // Transform state
  const [transformState, setTransformState] = useState<TransformState>({
    isTransforming: false,
    isRotating: false,
    isScaling: false,
    isMoving: false,
    snapToGrid: true,
    snapToGuides: true,
    snapToElements: true,
    gridSize: 20,
    rotationSnaps: [0, 15, 30, 45, 60, 75, 90, 105, 120, 135, 150, 165, 180, 195, 210, 225, 240, 255, 270, 285, 300, 315, 330, 345],
    scaleSnaps: [0.25, 0.5, 0.75, 1, 1.25, 1.5, 2, 3, 4],
    boundaryConstraints: {
      enabled: true,
      minX: 0,
      minY: 0,
      maxX: canvasState.width,
      maxY: canvasState.height
    },
    transformOrigin: 'center',
    maintainAspectRatio: true,
    lockAxis: 'none',
    precision: 2
  });

  // UI state
  const [showAdvancedSettings, setShowAdvancedSettings] = useState(false);
  const [showAlignmentTools, setShowAlignmentTools] = useState(false);
  const [showSnapSettings, setShowSnapSettings] = useState(false);

  // Refs
  const transformStartRef = useRef<{ x: number; y: number; elements: any[] } | null>(null);

  // Expose methods to parent
  useImperativeHandle(ref, () => ({
    startTransform: (elementId: string, type: 'move' | 'rotate' | 'scale') => {
      setTransformState(prev => ({
        ...prev,
        isTransforming: true,
        isMoving: type === 'move',
        isRotating: type === 'rotate',
        isScaling: type === 'scale'
      }));
    },
    endTransform: () => {
      setTransformState(prev => ({
        ...prev,
        isTransforming: false,
        isMoving: false,
        isRotating: false,
        isScaling: false
      }));
      transformStartRef.current = null;
    },
    snapToGrid: (x: number, y: number) => {
      if (!transformState.snapToGrid) return { x, y };
      
      const gridSize = transformState.gridSize;
      return {
        x: Math.round(x / gridSize) * gridSize,
        y: Math.round(y / gridSize) * gridSize
      };
    },
    snapToGuides: (x: number, y: number) => {
      if (!transformState.snapToGuides) return { x, y };
      
      // This would implement guide snapping logic
      // For now, return original coordinates
      return { x, y };
    },
    snapToElements: (x: number, y: number) => {
      if (!transformState.snapToElements) return { x, y };
      
      // Find nearest element edges for snapping
      const snapThreshold = 10;
      let snappedX = x;
      let snappedY = y;
      
      elements.forEach(element => {
        if (selectedElementIds.includes(element.id)) return;
        
        const elementBounds = {
          left: element.x,
          right: element.x + element.width,
          top: element.y,
          bottom: element.y + element.height,
          centerX: element.x + element.width / 2,
          centerY: element.y + element.height / 2
        };
        
        // Snap to horizontal edges
        if (Math.abs(x - elementBounds.left) < snapThreshold) {
          snappedX = elementBounds.left;
        } else if (Math.abs(x - elementBounds.right) < snapThreshold) {
          snappedX = elementBounds.right;
        } else if (Math.abs(x - elementBounds.centerX) < snapThreshold) {
          snappedX = elementBounds.centerX;
        }
        
        // Snap to vertical edges
        if (Math.abs(y - elementBounds.top) < snapThreshold) {
          snappedY = elementBounds.top;
        } else if (Math.abs(y - elementBounds.bottom) < snapThreshold) {
          snappedY = elementBounds.bottom;
        } else if (Math.abs(y - elementBounds.centerY) < snapThreshold) {
          snappedY = elementBounds.centerY;
        }
      });
      
      return { x: snappedX, y: snappedY };
    },
    constrainToBounds: (x: number, y: number, width: number, height: number) => {
      if (!transformState.boundaryConstraints.enabled) return { x, y };
      
      const bounds = transformState.boundaryConstraints;
      return {
        x: Math.max(bounds.minX, Math.min(bounds.maxX - width, x)),
        y: Math.max(bounds.minY, Math.min(bounds.maxY - height, y))
      };
    },
    alignElements: (alignment: 'left' | 'center' | 'right' | 'top' | 'middle' | 'bottom') => {
      if (selectedElementIds.length < 2) return;
      
      const selectedElements = elements.filter(el => selectedElementIds.includes(el.id));
      if (selectedElements.length === 0) return;
      
      const transforms: Array<{ id: string; transform: any }> = [];
      
      if (alignment === 'left') {
        const leftmost = Math.min(...selectedElements.map(el => el.x));
        selectedElements.forEach(element => {
          transforms.push({
            id: element.id,
            transform: { x: leftmost }
          });
        });
      } else if (alignment === 'right') {
        const rightmost = Math.max(...selectedElements.map(el => el.x + el.width));
        selectedElements.forEach(element => {
          transforms.push({
            id: element.id,
            transform: { x: rightmost - element.width }
          });
        });
      } else if (alignment === 'center') {
        const centerX = selectedElements.reduce((sum, el) => sum + el.x + el.width / 2, 0) / selectedElements.length;
        selectedElements.forEach(element => {
          transforms.push({
            id: element.id,
            transform: { x: centerX - element.width / 2 }
          });
        });
      } else if (alignment === 'top') {
        const topmost = Math.min(...selectedElements.map(el => el.y));
        selectedElements.forEach(element => {
          transforms.push({
            id: element.id,
            transform: { y: topmost }
          });
        });
      } else if (alignment === 'bottom') {
        const bottommost = Math.max(...selectedElements.map(el => el.y + el.height));
        selectedElements.forEach(element => {
          transforms.push({
            id: element.id,
            transform: { y: bottommost - element.height }
          });
        });
      } else if (alignment === 'middle') {
        const centerY = selectedElements.reduce((sum, el) => sum + el.y + el.height / 2, 0) / selectedElements.length;
        selectedElements.forEach(element => {
          transforms.push({
            id: element.id,
            transform: { y: centerY - element.height / 2 }
          });
        });
      }
      
      onBatchTransform(transforms);
    },
    distributeElements: (direction: 'horizontal' | 'vertical') => {
      if (selectedElementIds.length < 3) return;
      
      const selectedElements = elements.filter(el => selectedElementIds.includes(el.id));
      if (selectedElements.length < 3) return;
      
      const transforms: Array<{ id: string; transform: any }> = [];
      
      if (direction === 'horizontal') {
        selectedElements.sort((a, b) => a.x - b.x);
        const totalWidth = selectedElements.reduce((sum, el) => sum + el.width, 0);
        const spacing = (canvasState.width - totalWidth) / (selectedElements.length - 1);
        
        let currentX = 0;
        selectedElements.forEach((element, index) => {
          transforms.push({
            id: element.id,
            transform: { x: currentX }
          });
          currentX += element.width + spacing;
        });
      } else {
        selectedElements.sort((a, b) => a.y - b.y);
        const totalHeight = selectedElements.reduce((sum, el) => sum + el.height, 0);
        const spacing = (canvasState.height - totalHeight) / (selectedElements.length - 1);
        
        let currentY = 0;
        selectedElements.forEach((element, index) => {
          transforms.push({
            id: element.id,
            transform: { y: currentY }
          });
          currentY += element.height + spacing;
        });
      }
      
      onBatchTransform(transforms);
    },
    flipElements: (direction: 'horizontal' | 'vertical') => {
      const transforms: Array<{ id: string; transform: any }> = [];
      
      selectedElementIds.forEach(id => {
        const element = elements.find(el => el.id === id);
        if (!element) return;
        
        if (direction === 'horizontal') {
          transforms.push({
            id,
            transform: { scaleX: -element.scaleX }
          });
        } else {
          transforms.push({
            id,
            transform: { scaleY: -element.scaleY }
          });
        }
      });
      
      onBatchTransform(transforms);
    },
    rotateElements: (angle: number) => {
      const transforms: Array<{ id: string; transform: any }> = [];
      
      selectedElementIds.forEach(id => {
        transforms.push({
          id,
          transform: { rotation: angle }
        });
      });
      
      onBatchTransform(transforms);
    },
    resetTransform: () => {
      const transforms: Array<{ id: string; transform: any }> = [];
      
      selectedElementIds.forEach(id => {
        transforms.push({
          id,
          transform: { 
            rotation: 0, 
            scaleX: 1, 
            scaleY: 1,
            skewX: 0,
            skewY: 0
          }
        });
      });
      
      onBatchTransform(transforms);
    }
  }));

  // Handle snap settings change
  const handleSnapChange = useCallback((setting: keyof TransformState, value: boolean) => {
    setTransformState(prev => ({ ...prev, [setting]: value }));
  }, []);

  // Handle grid size change
  const handleGridSizeChange = useCallback((gridSize: number) => {
    setTransformState(prev => ({ ...prev, gridSize }));
  }, []);

  // Handle boundary constraints change
  const handleBoundaryConstraintsChange = useCallback((constraints: Partial<TransformState['boundaryConstraints']>) => {
    setTransformState(prev => ({
      ...prev,
      boundaryConstraints: { ...prev.boundaryConstraints, ...constraints }
    }));
  }, []);

  // Handle transform origin change
  const handleTransformOriginChange = useCallback((origin: TransformState['transformOrigin']) => {
    setTransformState(prev => ({ ...prev, transformOrigin: origin }));
  }, []);

  // Handle precision change
  const handlePrecisionChange = useCallback((precision: number) => {
    setTransformState(prev => ({ ...prev, precision }));
  }, []);

  return (
    <div className="transform-tool space-y-4">
      <h3 className="text-lg font-semibold flex items-center">
        <RotateCw className="w-5 h-5 mr-2" />
        Transform Tool
      </h3>

      {/* Transform Status */}
      {transformState.isTransforming && (
        <div className="p-3 bg-blue-600/20 border border-blue-400 rounded">
          <div className="text-sm text-blue-300">
            {transformState.isMoving && 'Moving elements...'}
            {transformState.isRotating && 'Rotating elements...'}
            {transformState.isScaling && 'Scaling elements...'}
          </div>
        </div>
      )}

      {/* Snap Settings */}
      <div>
        <button
          className="flex items-center space-x-2 text-sm font-medium text-gray-300 hover:text-white"
          onClick={() => setShowSnapSettings(!showSnapSettings)}
        >
          <Grid3X3 className="w-4 h-4" />
          <span>Snap Settings</span>
        </button>
        
        {showSnapSettings && (
          <div className="mt-2 space-y-3 bg-gray-800 p-3 rounded">
            <div className="flex items-center">
              <input
                type="checkbox"
                checked={transformState.snapToGrid}
                onChange={(e) => handleSnapChange('snapToGrid', e.target.checked)}
                className="mr-2"
              />
              <label className="text-sm">Snap to Grid</label>
            </div>
            <div className="flex items-center">
              <input
                type="checkbox"
                checked={transformState.snapToGuides}
                onChange={(e) => handleSnapChange('snapToGuides', e.target.checked)}
                className="mr-2"
              />
              <label className="text-sm">Snap to Guides</label>
            </div>
            <div className="flex items-center">
              <input
                type="checkbox"
                checked={transformState.snapToElements}
                onChange={(e) => handleSnapChange('snapToElements', e.target.checked)}
                className="mr-2"
              />
              <label className="text-sm">Snap to Elements</label>
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-2">Grid Size</label>
              <input
                type="range"
                min="5"
                max="50"
                step="5"
                value={transformState.gridSize}
                onChange={(e) => handleGridSizeChange(parseInt(e.target.value))}
                className="w-full"
              />
              <span className="text-xs text-gray-400">{transformState.gridSize}px</span>
            </div>
          </div>
        )}
      </div>

      {/* Alignment Tools */}
      <div>
        <button
          className="flex items-center space-x-2 text-sm font-medium text-gray-300 hover:text-white"
          onClick={() => setShowAlignmentTools(!showAlignmentTools)}
        >
          <AlignLeft className="w-4 h-4" />
          <span>Alignment Tools</span>
        </button>
        
        {showAlignmentTools && (
          <div className="mt-2 space-y-3 bg-gray-800 p-3 rounded">
            <div>
              <h4 className="text-sm font-semibold mb-2">Align</h4>
              <div className="grid grid-cols-3 gap-2">
                <button
                  className="p-2 bg-gray-600 hover:bg-gray-500 rounded text-sm"
                  onClick={() => {
                    if (selectedElementIds.length >= 2) {
                      // Align left logic would go here
                    }
                  }}
                  disabled={selectedElementIds.length < 2}
                >
                  <AlignLeft className="w-4 h-4 mx-auto" />
                </button>
                <button
                  className="p-2 bg-gray-600 hover:bg-gray-500 rounded text-sm"
                  onClick={() => {
                    if (selectedElementIds.length >= 2) {
                      // Align center logic would go here
                    }
                  }}
                  disabled={selectedElementIds.length < 2}
                >
                  <AlignCenter className="w-4 h-4 mx-auto" />
                </button>
                <button
                  className="p-2 bg-gray-600 hover:bg-gray-500 rounded text-sm"
                  onClick={() => {
                    if (selectedElementIds.length >= 2) {
                      // Align right logic would go here
                    }
                  }}
                  disabled={selectedElementIds.length < 2}
                >
                  <AlignRight className="w-4 h-4 mx-auto" />
                </button>
              </div>
            </div>
            
            <div>
              <h4 className="text-sm font-semibold mb-2">Distribute</h4>
              <div className="grid grid-cols-2 gap-2">
                <button
                  className="p-2 bg-gray-600 hover:bg-gray-500 rounded text-sm"
                  onClick={() => {
                    if (selectedElementIds.length >= 3) {
                      // Distribute horizontally logic would go here
                    }
                  }}
                  disabled={selectedElementIds.length < 3}
                >
                  Horizontal
                </button>
                <button
                  className="p-2 bg-gray-600 hover:bg-gray-500 rounded text-sm"
                  onClick={() => {
                    if (selectedElementIds.length >= 3) {
                      // Distribute vertically logic would go here
                    }
                  }}
                  disabled={selectedElementIds.length < 3}
                >
                  Vertical
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Transform Actions */}
      <div className="space-y-2">
        <h4 className="text-sm font-semibold">Transform Actions</h4>
        <div className="grid grid-cols-2 gap-2">
          <button
            className="p-2 bg-gray-600 hover:bg-gray-500 rounded text-sm"
            onClick={() => {
              if (selectedElementIds.length > 0) {
                // Flip horizontal logic would go here
              }
            }}
            disabled={selectedElementIds.length === 0}
          >
            <FlipHorizontal className="w-4 h-4 inline mr-1" />
            Flip H
          </button>
          <button
            className="p-2 bg-gray-600 hover:bg-gray-500 rounded text-sm"
            onClick={() => {
              if (selectedElementIds.length > 0) {
                // Flip vertical logic would go here
              }
            }}
            disabled={selectedElementIds.length === 0}
          >
            <FlipVertical className="w-4 h-4 inline mr-1" />
            Flip V
          </button>
          <button
            className="p-2 bg-gray-600 hover:bg-gray-500 rounded text-sm"
            onClick={() => {
              if (selectedElementIds.length > 0) {
                // Rotate 90 degrees logic would go here
              }
            }}
            disabled={selectedElementIds.length === 0}
          >
            <RotateCw className="w-4 h-4 inline mr-1" />
            Rotate 90°
          </button>
          <button
            className="p-2 bg-gray-600 hover:bg-gray-500 rounded text-sm"
            onClick={() => {
              if (selectedElementIds.length > 0) {
                // Reset transform logic would go here
              }
            }}
            disabled={selectedElementIds.length === 0}
          >
            <Square className="w-4 h-4 inline mr-1" />
            Reset
          </button>
        </div>
      </div>

      {/* Advanced Settings */}
      <div>
        <button
          className="flex items-center space-x-2 text-sm font-medium text-gray-300 hover:text-white"
          onClick={() => setShowAdvancedSettings(!showAdvancedSettings)}
        >
          <Settings className="w-4 h-4" />
          <span>Advanced Settings</span>
        </button>
        
        {showAdvancedSettings && (
          <div className="mt-2 space-y-3 bg-gray-800 p-3 rounded">
            <div>
              <label className="block text-sm font-medium mb-2">Transform Origin</label>
              <select
                value={transformState.transformOrigin}
                onChange={(e) => handleTransformOriginChange(e.target.value as TransformState['transformOrigin'])}
                className="w-full p-2 bg-gray-600 rounded text-sm"
              >
                <option value="center">Center</option>
                <option value="top-left">Top Left</option>
                <option value="top-right">Top Right</option>
                <option value="bottom-left">Bottom Left</option>
                <option value="bottom-right">Bottom Right</option>
              </select>
            </div>
            
            <div className="flex items-center">
              <input
                type="checkbox"
                checked={transformState.maintainAspectRatio}
                onChange={(e) => setTransformState(prev => ({ ...prev, maintainAspectRatio: e.target.checked }))}
                className="mr-2"
              />
              <label className="text-sm">Maintain Aspect Ratio</label>
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-2">Lock Axis</label>
              <select
                value={transformState.lockAxis}
                onChange={(e) => setTransformState(prev => ({ ...prev, lockAxis: e.target.value as TransformState['lockAxis'] }))}
                className="w-full p-2 bg-gray-600 rounded text-sm"
              >
                <option value="none">None</option>
                <option value="x">X Axis</option>
                <option value="y">Y Axis</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-2">Precision</label>
              <input
                type="range"
                min="0"
                max="4"
                step="1"
                value={transformState.precision}
                onChange={(e) => handlePrecisionChange(parseInt(e.target.value))}
                className="w-full"
              />
              <span className="text-xs text-gray-400">{transformState.precision} decimal places</span>
            </div>
            
            <div>
              <h4 className="text-sm font-semibold mb-2">Boundary Constraints</h4>
              <div className="space-y-2">
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    checked={transformState.boundaryConstraints.enabled}
                    onChange={(e) => handleBoundaryConstraintsChange({ enabled: e.target.checked })}
                    className="mr-2"
                  />
                  <label className="text-sm">Enable Constraints</label>
                </div>
                
                {transformState.boundaryConstraints.enabled && (
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div>
                      <label className="block text-xs text-gray-400">Min X</label>
                      <input
                        type="number"
                        value={transformState.boundaryConstraints.minX}
                        onChange={(e) => handleBoundaryConstraintsChange({ minX: parseInt(e.target.value) })}
                        className="w-full p-1 bg-gray-600 rounded"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-gray-400">Min Y</label>
                      <input
                        type="number"
                        value={transformState.boundaryConstraints.minY}
                        onChange={(e) => handleBoundaryConstraintsChange({ minY: parseInt(e.target.value) })}
                        className="w-full p-1 bg-gray-600 rounded"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-gray-400">Max X</label>
                      <input
                        type="number"
                        value={transformState.boundaryConstraints.maxX}
                        onChange={(e) => handleBoundaryConstraintsChange({ maxX: parseInt(e.target.value) })}
                        className="w-full p-1 bg-gray-600 rounded"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-gray-400">Max Y</label>
                      <input
                        type="number"
                        value={transformState.boundaryConstraints.maxY}
                        onChange={(e) => handleBoundaryConstraintsChange({ maxY: parseInt(e.target.value) })}
                        className="w-full p-1 bg-gray-600 rounded"
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Selected Elements Info */}
      {selectedElementIds.length > 0 && (
        <div className="p-3 bg-gray-800 rounded">
          <div className="text-sm font-medium text-white mb-2">
            {selectedElementIds.length} element(s) selected
          </div>
          <div className="text-xs text-gray-400">
            Use transform handles or keyboard shortcuts to modify
          </div>
        </div>
      )}
    </div>
  );
});

TransformTool.displayName = 'TransformTool';

export default TransformTool;
