'use client';

import React, { useState, useCallback } from 'react';
import { Square, Circle, Triangle, Star, Hexagon, Pentagon, ArrowRight, Heart, Zap } from 'lucide-react';

export interface DrawingShapeToolProps {
  onToolSelect: (tool: string) => void;
  onStyleChange: (style: any) => void;
  selectedTool: string;
  currentStyle: any;
  onClose?: () => void;
}

const shapeDefinitions = [
  { type: 'select', name: 'Select', icon: Square, description: 'Select and move shapes' },
  { type: 'rect', name: 'Rectangle', icon: Square, description: 'Draw rectangles' },
  { type: 'circle', name: 'Circle', icon: Circle, description: 'Draw circles' },
  { type: 'triangle', name: 'Triangle', icon: Triangle, description: 'Draw triangles' },
  { type: 'star', name: 'Star', icon: Star, description: 'Draw stars' },
  { type: 'hexagon', name: 'Hexagon', icon: Hexagon, description: 'Draw hexagons' },
  { type: 'pentagon', name: 'Pentagon', icon: Pentagon, description: 'Draw pentagons' },
  { type: 'arrow', name: 'Arrow', icon: ArrowRight, description: 'Draw arrows' },
  { type: 'heart', name: 'Heart', icon: Heart, description: 'Draw hearts' },
  { type: 'line', name: 'Line', icon: Zap, description: 'Draw lines' },
];

export const DrawingShapeTool: React.FC<DrawingShapeToolProps> = ({
  onToolSelect,
  onStyleChange,
  selectedTool,
  currentStyle,
  onClose
}) => {
  const [activeTab, setActiveTab] = useState<'tools' | 'style'>('tools');

  const handleToolSelect = useCallback((toolType: string) => {
    onToolSelect(toolType);
  }, [onToolSelect]);

  const handleStyleChange = useCallback((updates: any) => {
    onStyleChange({ ...currentStyle, ...updates });
  }, [currentStyle, onStyleChange]);

  return (
    <div className="bg-gray-800 border border-gray-600 rounded-lg shadow-xl p-4 w-80">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-white flex items-center">
          <Square className="w-5 h-5 mr-2" />
          Drawing Tools
        </h3>
        {onClose && (
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white"
          >
            ×
          </button>
        )}
      </div>

      {/* Tabs */}
      <div className="flex mb-4 border-b border-gray-600">
        {[
          { id: 'tools', label: 'Tools' },
          { id: 'style', label: 'Style' }
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`px-3 py-2 text-sm font-medium ${
              activeTab === tab.id
                ? 'text-blue-400 border-b-2 border-blue-400'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tools Tab */}
      {activeTab === 'tools' && (
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Drawing Tools</label>
            <div className="grid grid-cols-2 gap-2">
              {shapeDefinitions.map(({ type, name, icon: Icon, description }) => (
                <button
                  key={type}
                  onClick={() => handleToolSelect(type)}
                  className={`p-3 rounded border-2 flex flex-col items-center space-y-1 transition-colors ${
                    selectedTool === type
                      ? 'border-blue-400 bg-blue-600 text-white'
                      : 'border-gray-600 hover:border-gray-500 hover:bg-gray-700 text-gray-300'
                  }`}
                  title={description}
                >
                  <Icon className="w-6 h-6" />
                  <span className="text-xs">{name}</span>
                </button>
              ))}
            </div>
          </div>
          
          <div className="text-xs text-gray-400 bg-gray-700 p-2 rounded">
            💡 <strong>Tip:</strong> Click and drag on the canvas to draw shapes
          </div>
        </div>
      )}

      {/* Style Tab */}
      {activeTab === 'style' && (
        <div className="space-y-4">
          {/* Fill Color */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Fill Color</label>
            <div className="flex items-center space-x-2">
              <input
                type="color"
                value={currentStyle.fillColor || '#ff6b9d'}
                onChange={(e) => handleStyleChange({ fillColor: e.target.value })}
                className="w-8 h-8 rounded border border-gray-500"
              />
              <input
                type="text"
                value={currentStyle.fillColor || '#ff6b9d'}
                onChange={(e) => handleStyleChange({ fillColor: e.target.value })}
                className="flex-1 px-2 py-1 bg-gray-700 border border-gray-600 rounded text-sm text-white"
              />
            </div>
          </div>

          {/* Stroke Color */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Stroke Color</label>
            <div className="flex items-center space-x-2">
              <input
                type="color"
                value={currentStyle.strokeColor || '#000000'}
                onChange={(e) => handleStyleChange({ strokeColor: e.target.value })}
                className="w-8 h-8 rounded border border-gray-500"
              />
              <input
                type="text"
                value={currentStyle.strokeColor || '#000000'}
                onChange={(e) => handleStyleChange({ strokeColor: e.target.value })}
                className="flex-1 px-2 py-1 bg-gray-700 border border-gray-600 rounded text-sm text-white"
              />
            </div>
          </div>

          {/* Stroke Width */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Stroke Width</label>
            <div className="flex items-center space-x-2">
              <input
                type="range"
                min="0"
                max="20"
                value={currentStyle.strokeWidth || 2}
                onChange={(e) => handleStyleChange({ strokeWidth: parseInt(e.target.value) })}
                className="flex-1"
              />
              <input
                type="number"
                value={currentStyle.strokeWidth || 2}
                onChange={(e) => handleStyleChange({ strokeWidth: parseInt(e.target.value) })}
                className="w-16 px-2 py-1 bg-gray-700 border border-gray-600 rounded text-sm text-white"
                min="0"
                max="20"
              />
            </div>
          </div>

          {/* Opacity */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Opacity</label>
            <div className="flex items-center space-x-2">
              <input
                type="range"
                min="0"
                max="1"
                step="0.1"
                value={currentStyle.opacity || 1}
                onChange={(e) => handleStyleChange({ opacity: parseFloat(e.target.value) })}
                className="flex-1"
              />
              <span className="text-sm text-gray-400 w-12">
                {Math.round((currentStyle.opacity || 1) * 100)}%
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DrawingShapeTool;
