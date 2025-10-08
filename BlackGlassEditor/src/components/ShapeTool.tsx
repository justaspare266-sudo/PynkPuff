'use client';

import React, { useState, useRef, useEffect, useCallback, forwardRef, useImperativeHandle } from 'react';
import { Square, Circle, Triangle, Star, Hexagon, Pentagon, ArrowRight, Heart, Zap, Layers, Settings, Plus, Trash2, Copy, RotateCw, Move, Palette, Eye, EyeOff, Lock, Unlock } from 'lucide-react';

// Types for all Konva shapes
export interface ShapeElement {
  id: string;
  type: 'rect' | 'circle' | 'line' | 'arrow' | 'star' | 'regularPolygon' | 'wedge' | 'ring' | 'arc' | 'path';
  x: number;
  y: number;
  width: number;
  height: number;
  rotation: number;
  scaleX: number;
  scaleY: number;
  opacity: number;
  visible: boolean;
  zIndex: number;
  isSelected: boolean;
  isDragging: boolean;
  isResizing: boolean;
  isRotating: boolean;
  
  // Common shape properties
  fill: string;
  stroke: string;
  strokeWidth: number;
  fillEnabled: boolean;
  strokeEnabled: boolean;
  
  // Shape-specific properties
  // Rect properties
  cornerRadius?: number;
  
  // Circle properties
  radius?: number;
  
  // Line properties
  points?: number[];
  closed?: boolean;
  tension?: number;
  
  // Arrow properties
  arrowPoints?: number[];
  pointerLength?: number;
  pointerWidth?: number;
  
  // Star properties
  numPoints?: number;
  starInnerRadius?: number;
  starOuterRadius?: number;
  
  // RegularPolygon properties
  sides?: number;
  polygonRadius?: number;
  
  // Wedge properties
  angle?: number;
  wedgeRadius?: number;
  
  // Ring properties
  ringInnerRadius?: number;
  ringOuterRadius?: number;
  
  // Arc properties
  arcAngle?: number;
  arcInnerRadius?: number;
  arcOuterRadius?: number;
  clockwise?: boolean;
  
  // Path properties
  data?: string;
  
  // Advanced properties
  shadowColor?: string;
  shadowBlur?: number;
  shadowOffset?: { x: number; y: number };
  shadowOpacity?: number;
  shadowEnabled?: boolean;
  
  // Gradient properties
  fillLinearGradientStartPoint?: { x: number; y: number };
  fillLinearGradientEndPoint?: { x: number; y: number };
  fillLinearGradientColorStops?: Array<{ color: string; position: number }>;
  fillRadialGradientStartPoint?: { x: number; y: number };
  fillRadialGradientEndPoint?: { x: number; y: number };
  fillRadialGradientStartRadius?: number;
  fillRadialGradientEndRadius?: number;
  fillRadialGradientColorStops?: Array<{ color: string; position: number }>;
  
  // Performance properties
  isCached: boolean;
  perfectDrawEnabled: boolean;
  listening: boolean;
  
  // State tracking
  boundaryState: {
    isWithinBounds: boolean;
    violationType: 'x' | 'y' | 'width' | 'height' | null;
  };
  name: string;
  locked: boolean;
  isGrouped: boolean;
}

interface ShapeToolProps {
  onShapeAdd: (shapeElement: Omit<ShapeElement, 'id'>) => void;
  onShapeUpdate: (id: string, updates: Partial<ShapeElement>) => void;
  onShapeDelete: (id: string) => void;
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
  selectedShapeElement?: ShapeElement;
}

export interface ShapeToolRef {
  addShape: (shapeType: string, x: number, y: number) => void;
  updateShape: (id: string, updates: Partial<ShapeElement>) => void;
  deleteShape: (id: string) => void;
  duplicateShape: (id: string) => void;
  applyGradient: (id: string, gradient: any) => void;
  applyShadow: (id: string, shadow: any) => void;
  toggleCache: (id: string) => void;
}

const ShapeTool = forwardRef<ShapeToolRef, ShapeToolProps>(({
  onShapeAdd,
  onShapeUpdate,
  onShapeDelete,
  canvasState,
  selectedShapeElement
}, ref) => {
  // Shape properties state
  const [shapeProperties, setShapeProperties] = useState<Partial<ShapeElement>>({
    type: 'rect',
    width: 100,
    height: 100,
    rotation: 0,
    scaleX: 1,
    scaleY: 1,
    opacity: 1,
    visible: true,
    zIndex: 1,
    isSelected: false,
    isDragging: false,
    isResizing: false,
    isRotating: false,
    fill: '#FF6B6B',
    stroke: '#000000',
    strokeWidth: 2,
    fillEnabled: true,
    strokeEnabled: true,
    isCached: false,
    perfectDrawEnabled: true,
    listening: true,
    boundaryState: {
      isWithinBounds: true,
      violationType: null
    }
  });

  // UI state
  const [showAdvancedSettings, setShowAdvancedSettings] = useState(false);
  const [showGradientEditor, setShowGradientEditor] = useState(false);
  const [showShadowEditor, setShowShadowEditor] = useState(false);

  // Shape types
  const shapeTypes = [
    { type: 'rect', name: 'Rectangle', icon: Square, defaultProps: { cornerRadius: 0 } },
    { type: 'circle', name: 'Circle', icon: Circle, defaultProps: { radius: 50 } },
    { type: 'line', name: 'Line', icon: Zap, defaultProps: { points: [0, 0, 100, 0], closed: false, tension: 0 } },
    { type: 'arrow', name: 'Arrow', icon: ArrowRight, defaultProps: { points: [0, 0, 100, 0], pointerLength: 20, pointerWidth: 20 } },
    { type: 'star', name: 'Star', icon: Star, defaultProps: { numPoints: 5, starInnerRadius: 30, starOuterRadius: 50 } },
    { type: 'regularPolygon', name: 'Polygon', icon: Hexagon, defaultProps: { sides: 6, polygonRadius: 50 } },
    { type: 'wedge', name: 'Wedge', icon: Triangle, defaultProps: { angle: 60, wedgeRadius: 50 } },
    { type: 'ring', name: 'Ring', icon: Circle, defaultProps: { ringInnerRadius: 30, ringOuterRadius: 50 } },
    { type: 'arc', name: 'Arc', icon: Circle, defaultProps: { arcAngle: 60, arcInnerRadius: 30, arcOuterRadius: 50, clockwise: false } }
  ];

  // Expose methods to parent
  useImperativeHandle(ref, () => ({
    addShape: (shapeType: string, x: number, y: number) => {
      const shapeConfig = shapeTypes.find(s => s.type === shapeType);
      if (!shapeConfig) return;

      const newShapeElement: Omit<ShapeElement, 'id'> = {
        type: shapeType as any,
        x: x - 50,
        y: y - 50,
        width: 100,
        height: 100,
        ...shapeProperties,
        ...shapeConfig.defaultProps,
        isSelected: true,
        isDragging: false,
        isResizing: false,
        isRotating: false
      } as Omit<ShapeElement, 'id'>;
      
      onShapeAdd(newShapeElement);
    },
    updateShape: (id: string, updates: Partial<ShapeElement>) => {
      onShapeUpdate(id, updates);
    },
    deleteShape: (id: string) => {
      onShapeDelete(id);
    },
    duplicateShape: (id: string) => {
      if (selectedShapeElement) {
        const duplicatedElement: Omit<ShapeElement, 'id'> = {
          ...selectedShapeElement,
          x: selectedShapeElement.x + 20,
          y: selectedShapeElement.y + 20,
          isSelected: true
        };
        onShapeAdd(duplicatedElement);
      }
    },
    applyGradient: (id: string, gradient: any) => {
      onShapeUpdate(id, gradient);
    },
    applyShadow: (id: string, shadow: any) => {
      onShapeUpdate(id, shadow);
    },
    toggleCache: (id: string) => {
      if (selectedShapeElement) {
        onShapeUpdate(id, { isCached: !selectedShapeElement.isCached });
      }
    }
  }));

  // Update shape properties when selected element changes
  useEffect(() => {
    if (selectedShapeElement) {
      setShapeProperties(selectedShapeElement);
    }
  }, [selectedShapeElement]);

  // Handle shape type change
  const handleShapeTypeChange = useCallback((shapeType: string) => {
    const shapeConfig = shapeTypes.find(s => s.type === shapeType);
    if (!shapeConfig) return;

    setShapeProperties(prev => ({
      ...prev,
      type: shapeType as any,
      ...shapeConfig.defaultProps
    }));
    
    if (selectedShapeElement) {
      onShapeUpdate(selectedShapeElement.id, {
        type: shapeType as any,
        ...shapeConfig.defaultProps
      });
    }
  }, [selectedShapeElement, onShapeUpdate]);

  // Handle fill color change
  const handleFillChange = useCallback((fill: string) => {
    setShapeProperties(prev => ({ ...prev, fill }));
    if (selectedShapeElement) {
      onShapeUpdate(selectedShapeElement.id, { fill });
    }
  }, [selectedShapeElement, onShapeUpdate]);

  // Handle stroke change
  const handleStrokeChange = useCallback((stroke: string, strokeWidth: number) => {
    setShapeProperties(prev => ({ ...prev, stroke, strokeWidth }));
    if (selectedShapeElement) {
      onShapeUpdate(selectedShapeElement.id, { stroke, strokeWidth });
    }
  }, [selectedShapeElement, onShapeUpdate]);

  // Handle opacity change
  const handleOpacityChange = useCallback((opacity: number) => {
    setShapeProperties(prev => ({ ...prev, opacity }));
    if (selectedShapeElement) {
      onShapeUpdate(selectedShapeElement.id, { opacity });
    }
  }, [selectedShapeElement, onShapeUpdate]);

  // Handle rotation change
  const handleRotationChange = useCallback((rotation: number) => {
    setShapeProperties(prev => ({ ...prev, rotation }));
    if (selectedShapeElement) {
      onShapeUpdate(selectedShapeElement.id, { rotation });
    }
  }, [selectedShapeElement, onShapeUpdate]);

  // Handle scale change
  const handleScaleChange = useCallback((scaleX: number, scaleY: number) => {
    setShapeProperties(prev => ({ ...prev, scaleX, scaleY }));
    if (selectedShapeElement) {
      onShapeUpdate(selectedShapeElement.id, { scaleX, scaleY });
    }
  }, [selectedShapeElement, onShapeUpdate]);

  // Handle visibility toggle
  const handleVisibilityToggle = useCallback(() => {
    setShapeProperties(prev => ({ ...prev, visible: !prev.visible }));
    if (selectedShapeElement) {
      onShapeUpdate(selectedShapeElement.id, { visible: !selectedShapeElement.visible });
    }
  }, [selectedShapeElement, onShapeUpdate]);

  // Handle cache toggle
  const handleCacheToggle = useCallback(() => {
    setShapeProperties(prev => ({ ...prev, isCached: !prev.isCached }));
    if (selectedShapeElement) {
      onShapeUpdate(selectedShapeElement.id, { isCached: !selectedShapeElement.isCached });
    }
  }, [selectedShapeElement, onShapeUpdate]);

  // Handle perfect draw toggle
  const handlePerfectDrawToggle = useCallback(() => {
    setShapeProperties(prev => ({ ...prev, perfectDrawEnabled: !prev.perfectDrawEnabled }));
    if (selectedShapeElement) {
      onShapeUpdate(selectedShapeElement.id, { perfectDrawEnabled: !selectedShapeElement.perfectDrawEnabled });
    }
  }, [selectedShapeElement, onShapeUpdate]);

  // Handle listening toggle
  const handleListeningToggle = useCallback(() => {
    setShapeProperties(prev => ({ ...prev, listening: !prev.listening }));
    if (selectedShapeElement) {
      onShapeUpdate(selectedShapeElement.id, { listening: !selectedShapeElement.listening });
    }
  }, [selectedShapeElement, onShapeUpdate]);

  // Handle specific shape property changes
  const handleShapePropertyChange = useCallback((property: string, value: any) => {
    setShapeProperties(prev => ({ ...prev, [property]: value }));
    if (selectedShapeElement) {
      onShapeUpdate(selectedShapeElement.id, { [property]: value });
    }
  }, [selectedShapeElement, onShapeUpdate]);

  return (
    <div className="shape-tool space-y-4">
      <h3 className="text-lg font-semibold flex items-center">
        <Square className="w-5 h-5 mr-2" />
        Shape Tool
      </h3>

      {/* Shape Type Selection */}
      <div>
        <label className="block text-sm font-medium mb-2">Shape Type</label>
        <div className="grid grid-cols-3 gap-2">
          {shapeTypes.map((shape) => {
            const IconComponent = shape.icon;
            return (
              <button
                key={shape.type}
                className={`p-3 rounded flex flex-col items-center space-y-1 ${
                  shapeProperties.type === shape.type ? 'bg-blue-600' : 'bg-gray-600 hover:bg-gray-500'
                }`}
                onClick={() => handleShapeTypeChange(shape.type)}
                title={shape.name}
              >
                <IconComponent className="w-5 h-5" />
                <span className="text-xs">{shape.name}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Shape Preview */}
      <div className="shape-preview bg-gray-600 rounded p-4">
        <div className="text-sm font-medium mb-2">Preview</div>
        <div className="w-full h-20 bg-white rounded border border-gray-500 flex items-center justify-center">
          <div
            className="border-2 border-gray-400"
            style={{
              width: '60px',
              height: '60px',
              backgroundColor: shapeProperties.fill,
              borderColor: shapeProperties.stroke,
              borderWidth: `${shapeProperties.strokeWidth}px`,
              opacity: shapeProperties.opacity,
              transform: `rotate(${shapeProperties.rotation}deg) scale(${shapeProperties.scaleX}, ${shapeProperties.scaleY})`,
              borderRadius: shapeProperties.type === 'rect' && shapeProperties.cornerRadius ? `${shapeProperties.cornerRadius}px` : '0px'
            }}
          />
        </div>
      </div>

      {/* Shape-specific Properties */}
      {shapeProperties.type === 'rect' && (
        <div>
          <label className="block text-sm font-medium mb-2">Corner Radius</label>
          <input
            type="range"
            min="0"
            max="50"
            step="1"
            value={shapeProperties.cornerRadius || 0}
            onChange={(e) => handleShapePropertyChange('cornerRadius', parseInt(e.target.value))}
            className="w-full"
          />
          <span className="text-xs text-gray-400">{shapeProperties.cornerRadius || 0}px</span>
        </div>
      )}

      {shapeProperties.type === 'circle' && (
        <div>
          <label className="block text-sm font-medium mb-2">Radius</label>
          <input
            type="range"
            min="10"
            max="100"
            step="1"
            value={shapeProperties.radius || 50}
            onChange={(e) => handleShapePropertyChange('radius', parseInt(e.target.value))}
            className="w-full"
          />
          <span className="text-xs text-gray-400">{shapeProperties.radius || 50}px</span>
        </div>
      )}

      {shapeProperties.type === 'star' && (
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-2">Points</label>
            <input
              type="number"
              min="3"
              max="20"
              value={shapeProperties.numPoints || 5}
              onChange={(e) => handleShapePropertyChange('numPoints', parseInt(e.target.value))}
              className="w-full p-2 bg-gray-600 rounded text-sm"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Inner Radius</label>
            <input
              type="range"
              min="10"
              max="80"
              step="1"
              value={shapeProperties.starInnerRadius || 30}
              onChange={(e) => handleShapePropertyChange('starInnerRadius', parseInt(e.target.value))}
              className="w-full"
            />
            <span className="text-xs text-gray-400">{shapeProperties.starInnerRadius || 30}px</span>
          </div>
        </div>
      )}

      {shapeProperties.type === 'regularPolygon' && (
        <div>
          <label className="block text-sm font-medium mb-2">Sides</label>
          <input
            type="number"
            min="3"
            max="20"
            value={shapeProperties.sides || 6}
            onChange={(e) => handleShapePropertyChange('sides', parseInt(e.target.value))}
            className="w-full p-2 bg-gray-600 rounded text-sm"
          />
        </div>
      )}

      {shapeProperties.type === 'wedge' && (
        <div>
          <label className="block text-sm font-medium mb-2">Angle</label>
          <input
            type="range"
            min="0"
            max="360"
            step="1"
            value={shapeProperties.angle || 60}
            onChange={(e) => handleShapePropertyChange('angle', parseInt(e.target.value))}
            className="w-full"
          />
          <span className="text-xs text-gray-400">{shapeProperties.angle || 60}°</span>
        </div>
      )}

      {shapeProperties.type === 'ring' && (
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-2">Inner Radius</label>
            <input
              type="range"
              min="10"
              max="80"
              step="1"
              value={shapeProperties.ringInnerRadius || 30}
              onChange={(e) => handleShapePropertyChange('ringInnerRadius', parseInt(e.target.value))}
              className="w-full"
            />
            <span className="text-xs text-gray-400">{shapeProperties.ringInnerRadius || 30}px</span>
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Outer Radius</label>
            <input
              type="range"
              min="20"
              max="100"
              step="1"
              value={shapeProperties.ringOuterRadius || 50}
              onChange={(e) => handleShapePropertyChange('ringOuterRadius', parseInt(e.target.value))}
              className="w-full"
            />
            <span className="text-xs text-gray-400">{shapeProperties.ringOuterRadius || 50}px</span>
          </div>
        </div>
      )}

      {/* Color Controls */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium mb-2">Fill Color</label>
          <div className="flex items-center space-x-2">
            <input
              type="color"
              value={shapeProperties.fill || '#FF6B6B'}
              onChange={(e) => handleFillChange(e.target.value)}
              className="w-8 h-8 rounded border border-gray-500"
            />
            <input
              type="text"
              value={shapeProperties.fill || '#FF6B6B'}
              onChange={(e) => handleFillChange(e.target.value)}
              className="flex-1 p-2 bg-gray-600 rounded text-sm"
            />
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium mb-2">Stroke Color</label>
          <div className="flex items-center space-x-2">
            <input
              type="color"
              value={shapeProperties.stroke || '#000000'}
              onChange={(e) => handleStrokeChange(e.target.value, shapeProperties.strokeWidth || 2)}
              className="w-8 h-8 rounded border border-gray-500"
            />
            <input
              type="number"
              value={shapeProperties.strokeWidth || 2}
              onChange={(e) => handleStrokeChange(shapeProperties.stroke || '#000000', parseInt(e.target.value))}
              className="w-16 p-2 bg-gray-600 rounded text-sm"
              min="0"
              max="20"
            />
          </div>
        </div>
      </div>

      {/* Opacity */}
      <div>
        <label className="block text-sm font-medium mb-2">Opacity</label>
        <input
          type="range"
          min="0"
          max="1"
          step="0.1"
          value={shapeProperties.opacity || 1}
          onChange={(e) => handleOpacityChange(parseFloat(e.target.value))}
          className="w-full"
        />
        <span className="text-xs text-gray-400">{Math.round((shapeProperties.opacity || 1) * 100)}%</span>
      </div>

      {/* Transform Controls */}
      <div>
        <label className="block text-sm font-medium mb-2">Rotation</label>
        <input
          type="range"
          min="0"
          max="360"
          step="1"
          value={shapeProperties.rotation || 0}
          onChange={(e) => handleRotationChange(parseInt(e.target.value))}
          className="w-full"
        />
        <span className="text-xs text-gray-400">{shapeProperties.rotation || 0}°</span>
      </div>

      {/* Scale Controls */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium mb-2">Scale X</label>
          <input
            type="range"
            min="0.1"
            max="3"
            step="0.1"
            value={shapeProperties.scaleX || 1}
            onChange={(e) => handleScaleChange(parseFloat(e.target.value), shapeProperties.scaleY || 1)}
            className="w-full"
          />
          <span className="text-xs text-gray-400">{shapeProperties.scaleX || 1}</span>
        </div>
        <div>
          <label className="block text-sm font-medium mb-2">Scale Y</label>
          <input
            type="range"
            min="0.1"
            max="3"
            step="0.1"
            value={shapeProperties.scaleY || 1}
            onChange={(e) => handleScaleChange(shapeProperties.scaleX || 1, parseFloat(e.target.value))}
            className="w-full"
          />
          <span className="text-xs text-gray-400">{shapeProperties.scaleY || 1}</span>
        </div>
      </div>

      {/* Advanced Settings Toggle */}
      <div className="border-t border-gray-600 pt-4">
        <button
          className="flex items-center space-x-2 text-sm font-medium text-gray-300 hover:text-white"
          onClick={() => setShowAdvancedSettings(!showAdvancedSettings)}
        >
          <Settings className="w-4 h-4" />
          <span>Advanced Settings</span>
        </button>
      </div>

      {/* Advanced Settings */}
      {showAdvancedSettings && (
        <div className="space-y-4 bg-gray-800 p-4 rounded">
          {/* Performance Settings */}
          <div className="space-y-2">
            <h4 className="text-sm font-semibold">Performance</h4>
            <div className="flex items-center">
              <input
                type="checkbox"
                checked={shapeProperties.isCached || false}
                onChange={handleCacheToggle}
                className="mr-2"
              />
              <label className="text-sm">Enable Caching</label>
            </div>
            <div className="flex items-center">
              <input
                type="checkbox"
                checked={shapeProperties.perfectDrawEnabled || true}
                onChange={handlePerfectDrawToggle}
                className="mr-2"
              />
              <label className="text-sm">Perfect Draw</label>
            </div>
            <div className="flex items-center">
              <input
                type="checkbox"
                checked={shapeProperties.listening || true}
                onChange={handleListeningToggle}
                className="mr-2"
              />
              <label className="text-sm">Event Listening</label>
            </div>
          </div>

          {/* Fill and Stroke Toggles */}
          <div className="space-y-2">
            <h4 className="text-sm font-semibold">Rendering</h4>
            <div className="flex items-center">
              <input
                type="checkbox"
                checked={shapeProperties.fillEnabled || true}
                onChange={(e) => handleShapePropertyChange('fillEnabled', e.target.checked)}
                className="mr-2"
              />
              <label className="text-sm">Fill Enabled</label>
            </div>
            <div className="flex items-center">
              <input
                type="checkbox"
                checked={shapeProperties.strokeEnabled || true}
                onChange={(e) => handleShapePropertyChange('strokeEnabled', e.target.checked)}
                className="mr-2"
              />
              <label className="text-sm">Stroke Enabled</label>
            </div>
          </div>

          {/* Visibility Toggle */}
          <div className="flex items-center">
            <input
              type="checkbox"
              checked={shapeProperties.visible || true}
              onChange={handleVisibilityToggle}
              className="mr-2"
            />
            <label className="text-sm">Visible</label>
          </div>
        </div>
      )}

      {/* Action Buttons */}
      {selectedShapeElement && (
        <div className="flex space-x-2 pt-4 border-t border-gray-600">
          <button
            className="flex-1 p-2 bg-blue-600 hover:bg-blue-700 rounded text-sm"
            onClick={() => {
              if (selectedShapeElement) {
                const duplicatedElement: Omit<ShapeElement, 'id'> = {
                  ...selectedShapeElement,
                  x: selectedShapeElement.x + 20,
                  y: selectedShapeElement.y + 20,
                  isSelected: true
                };
                onShapeAdd(duplicatedElement);
              }
            }}
          >
            <Copy className="w-4 h-4 inline mr-1" />
            Duplicate
          </button>
          <button
            className="flex-1 p-2 bg-red-600 hover:bg-red-700 rounded text-sm"
            onClick={() => {
              if (selectedShapeElement) {
                onShapeDelete(selectedShapeElement.id);
              }
            }}
          >
            <Trash2 className="w-4 h-4 inline mr-1" />
            Delete
          </button>
        </div>
      )}
    </div>
  );
});

ShapeTool.displayName = 'ShapeTool';

export default ShapeTool;
