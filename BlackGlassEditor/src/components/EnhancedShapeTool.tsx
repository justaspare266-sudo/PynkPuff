import React, { useState, useCallback } from 'react';
import { 
  Square, 
  Circle, 
  Triangle, 
  Star, 
  Hexagon, 
  Pentagon, 
  ArrowRight,
  Heart,
  Zap,
  Settings,
  Palette,
  RotateCw,
  Move,
  Trash2,
  Copy
} from 'lucide-react';

export interface ShapeStyle {
  fill: string;
  stroke: string;
  strokeWidth: number;
  fillEnabled: boolean;
  strokeEnabled: boolean;
  opacity: number;
  rotation: number;
  scaleX: number;
  scaleY: number;
  shadowColor?: string;
  shadowBlur?: number;
  shadowOffsetX?: number;
  shadowOffsetY?: number;
  shadowEnabled?: boolean;
}

export interface ShapeDefinition {
  type: 'rect' | 'circle' | 'triangle' | 'star' | 'hexagon' | 'pentagon' | 'arrow' | 'heart' | 'line';
  name: string;
  icon: React.ComponentType<any>;
  defaultProps: Record<string, any>;
}

interface EnhancedShapeToolProps {
  currentStyle: ShapeStyle;
  onStyleChange: (style: ShapeStyle) => void;
  onShapeSelect: (shapeType: string) => void;
  selectedShapeType: string;
  onClose?: () => void;
}

const shapeDefinitions: ShapeDefinition[] = [
  { 
    type: 'rect', 
    name: 'Rectangle', 
    icon: Square, 
    defaultProps: { width: 100, height: 100, cornerRadius: 0 } 
  },
  { 
    type: 'circle', 
    name: 'Circle', 
    icon: Circle, 
    defaultProps: { radius: 50 } 
  },
  { 
    type: 'triangle', 
    name: 'Triangle', 
    icon: Triangle, 
    defaultProps: { width: 100, height: 100 } 
  },
  { 
    type: 'star', 
    name: 'Star', 
    icon: Star, 
    defaultProps: { numPoints: 5, innerRadius: 30, outerRadius: 50 } 
  },
  { 
    type: 'hexagon', 
    name: 'Hexagon', 
    icon: Hexagon, 
    defaultProps: { sides: 6, radius: 50 } 
  },
  { 
    type: 'pentagon', 
    name: 'Pentagon', 
    icon: Pentagon, 
    defaultProps: { sides: 5, radius: 50 } 
  },
  { 
    type: 'arrow', 
    name: 'Arrow', 
    icon: ArrowRight, 
    defaultProps: { width: 100, height: 20, pointerLength: 20 } 
  },
  { 
    type: 'heart', 
    name: 'Heart', 
    icon: Heart, 
    defaultProps: { width: 60, height: 60 } 
  },
  { 
    type: 'line', 
    name: 'Line', 
    icon: Zap, 
    defaultProps: { width: 100, height: 2 } 
  }
];

export const EnhancedShapeTool: React.FC<EnhancedShapeToolProps> = ({
  currentStyle,
  onStyleChange,
  onShapeSelect,
  selectedShapeType,
  onClose
}) => {
  const [activeTab, setActiveTab] = useState<'shapes' | 'style' | 'effects'>('shapes');

  const handleStyleChange = useCallback((updates: Partial<ShapeStyle>) => {
    onStyleChange({ ...currentStyle, ...updates });
  }, [currentStyle, onStyleChange]);

  return (
    <div className="bg-white border border-gray-200 rounded-lg shadow-lg p-4 w-80">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold flex items-center">
          <Square className="w-5 h-5 mr-2" />
          Shape Tool
        </h3>
        {onClose && (
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            ×
          </button>
        )}
      </div>

      {/* Tabs */}
      <div className="flex mb-4 border-b">
        {[
          { id: 'shapes', label: 'Shapes' },
          { id: 'style', label: 'Style' },
          { id: 'effects', label: 'Effects' }
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`px-3 py-2 text-sm font-medium ${
              activeTab === tab.id
                ? 'text-blue-600 border-b-2 border-blue-600'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Shapes Tab */}
      {activeTab === 'shapes' && (
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">Shape Types</label>
            <div className="grid grid-cols-3 gap-2">
              {shapeDefinitions.map(({ type, name, icon: Icon }) => (
                <button
                  key={type}
                  onClick={() => onShapeSelect(type)}
                  className={`p-3 rounded border-2 flex flex-col items-center space-y-1 ${
                    selectedShapeType === type
                      ? 'border-blue-600 bg-blue-50 text-blue-700'
                      : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                  }`}
                  title={name}
                >
                  <Icon className="w-6 h-6" />
                  <span className="text-xs">{name}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Style Tab */}
      {activeTab === 'style' && (
        <div className="space-y-4">
          {/* Fill Color */}
          <div>
            <label className="block text-sm font-medium mb-2">Fill Color</label>
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={currentStyle.fillEnabled}
                onChange={(e) => handleStyleChange({ fillEnabled: e.target.checked })}
                className="rounded"
              />
              <input
                type="color"
                value={currentStyle.fill}
                onChange={(e) => handleStyleChange({ fill: e.target.value })}
                disabled={!currentStyle.fillEnabled}
                className="w-8 h-8 rounded border border-gray-300 disabled:opacity-50"
              />
              <input
                type="text"
                value={currentStyle.fill}
                onChange={(e) => handleStyleChange({ fill: e.target.value })}
                disabled={!currentStyle.fillEnabled}
                className="flex-1 px-2 py-1 border border-gray-300 rounded text-sm disabled:opacity-50"
              />
            </div>
          </div>

          {/* Stroke Color */}
          <div>
            <label className="block text-sm font-medium mb-2">Stroke Color</label>
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={currentStyle.strokeEnabled}
                onChange={(e) => handleStyleChange({ strokeEnabled: e.target.checked })}
                className="rounded"
              />
              <input
                type="color"
                value={currentStyle.stroke}
                onChange={(e) => handleStyleChange({ stroke: e.target.value })}
                disabled={!currentStyle.strokeEnabled}
                className="w-8 h-8 rounded border border-gray-300 disabled:opacity-50"
              />
              <input
                type="text"
                value={currentStyle.stroke}
                onChange={(e) => handleStyleChange({ stroke: e.target.value })}
                disabled={!currentStyle.strokeEnabled}
                className="flex-1 px-2 py-1 border border-gray-300 rounded text-sm disabled:opacity-50"
              />
            </div>
          </div>

          {/* Stroke Width */}
          <div>
            <label className="block text-sm font-medium mb-2">Stroke Width</label>
            <div className="flex items-center space-x-2">
              <input
                type="range"
                min="0"
                max="20"
                value={currentStyle.strokeWidth}
                onChange={(e) => handleStyleChange({ strokeWidth: parseInt(e.target.value) })}
                disabled={!currentStyle.strokeEnabled}
                className="flex-1 disabled:opacity-50"
              />
              <input
                type="number"
                value={currentStyle.strokeWidth}
                onChange={(e) => handleStyleChange({ strokeWidth: parseInt(e.target.value) })}
                disabled={!currentStyle.strokeEnabled}
                className="w-16 px-2 py-1 border border-gray-300 rounded text-sm disabled:opacity-50"
              />
            </div>
          </div>

          {/* Opacity */}
          <div>
            <label className="block text-sm font-medium mb-2">Opacity</label>
            <div className="flex items-center space-x-2">
              <input
                type="range"
                min="0"
                max="1"
                step="0.1"
                value={currentStyle.opacity}
                onChange={(e) => handleStyleChange({ opacity: parseFloat(e.target.value) })}
                className="flex-1"
              />
              <span className="text-sm text-gray-600 w-12">
                {Math.round(currentStyle.opacity * 100)}%
              </span>
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
                value={currentStyle.rotation}
                onChange={(e) => handleStyleChange({ rotation: parseInt(e.target.value) })}
                className="flex-1"
              />
              <input
                type="number"
                value={currentStyle.rotation}
                onChange={(e) => handleStyleChange({ rotation: parseInt(e.target.value) })}
                className="w-16 px-2 py-1 border border-gray-300 rounded text-sm"
              />
              <span className="text-sm text-gray-600">°</span>
            </div>
          </div>

          {/* Scale */}
          <div>
            <label className="block text-sm font-medium mb-2">Scale</label>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-xs text-gray-600 mb-1">X</label>
                <input
                  type="range"
                  min="0.1"
                  max="3"
                  step="0.1"
                  value={currentStyle.scaleX}
                  onChange={(e) => handleStyleChange({ scaleX: parseFloat(e.target.value) })}
                  className="w-full"
                />
                <span className="text-xs text-gray-600">{currentStyle.scaleX.toFixed(1)}</span>
              </div>
              <div>
                <label className="block text-xs text-gray-600 mb-1">Y</label>
                <input
                  type="range"
                  min="0.1"
                  max="3"
                  step="0.1"
                  value={currentStyle.scaleY}
                  onChange={(e) => handleStyleChange({ scaleY: parseFloat(e.target.value) })}
                  className="w-full"
                />
                <span className="text-xs text-gray-600">{currentStyle.scaleY.toFixed(1)}</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Effects Tab */}
      {activeTab === 'effects' && (
        <div className="space-y-4">
          {/* Shadow */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="block text-sm font-medium">Shadow</label>
              <input
                type="checkbox"
                checked={currentStyle.shadowEnabled || false}
                onChange={(e) => handleStyleChange({ shadowEnabled: e.target.checked })}
                className="rounded"
              />
            </div>
            
            {currentStyle.shadowEnabled && (
              <div className="space-y-3 pl-4 border-l-2 border-gray-200">
                <div>
                  <label className="block text-xs text-gray-600 mb-1">Color</label>
                  <div className="flex items-center space-x-2">
                    <input
                      type="color"
                      value={currentStyle.shadowColor || '#000000'}
                      onChange={(e) => handleStyleChange({ shadowColor: e.target.value })}
                      className="w-8 h-8 rounded border border-gray-300"
                    />
                    <input
                      type="text"
                      value={currentStyle.shadowColor || '#000000'}
                      onChange={(e) => handleStyleChange({ shadowColor: e.target.value })}
                      className="flex-1 px-2 py-1 border border-gray-300 rounded text-sm"
                    />
                  </div>
                </div>
                
                <div>
                  <label className="block text-xs text-gray-600 mb-1">Blur</label>
                  <input
                    type="range"
                    min="0"
                    max="50"
                    value={currentStyle.shadowBlur || 0}
                    onChange={(e) => handleStyleChange({ shadowBlur: parseInt(e.target.value) })}
                    className="w-full"
                  />
                  <span className="text-xs text-gray-600">{currentStyle.shadowBlur || 0}px</span>
                </div>
                
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-xs text-gray-600 mb-1">Offset X</label>
                    <input
                      type="range"
                      min="-50"
                      max="50"
                      value={currentStyle.shadowOffsetX || 0}
                      onChange={(e) => handleStyleChange({ shadowOffsetX: parseInt(e.target.value) })}
                      className="w-full"
                    />
                    <span className="text-xs text-gray-600">{currentStyle.shadowOffsetX || 0}px</span>
                  </div>
                  <div>
                    <label className="block text-xs text-gray-600 mb-1">Offset Y</label>
                    <input
                      type="range"
                      min="-50"
                      max="50"
                      value={currentStyle.shadowOffsetY || 0}
                      onChange={(e) => handleStyleChange({ shadowOffsetY: parseInt(e.target.value) })}
                      className="w-full"
                    />
                    <span className="text-xs text-gray-600">{currentStyle.shadowOffsetY || 0}px</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
