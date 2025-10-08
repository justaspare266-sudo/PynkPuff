'use client';

import React from 'react';
import { useEditor } from '../contexts/EditorContext';
import { 
  Square, 
  Circle, 
  Type, 
  PenTool, 
  Move, 
  Palette, 
  Layers, 
  Image, 
  Crop,
  Filter,
  Settings
} from 'lucide-react';

export function SimpleToolSelector() {
  const { state, actions } = useEditor();

  const tools = [
    { id: 'select', name: 'Select', icon: Move, description: 'Select and move shapes' },
    { id: 'rect', name: 'Rectangle', icon: Square, description: 'Draw rectangles' },
    { id: 'circle', name: 'Circle', icon: Circle, description: 'Draw circles' },
    { id: 'text', name: 'Text', icon: Type, description: 'Add text' },
    { id: 'line', name: 'Line', icon: PenTool, description: 'Draw lines' },
    { id: 'star', name: 'Star', icon: Square, description: 'Draw stars' },
    { id: 'hexagon', name: 'Hexagon', icon: Square, description: 'Draw hexagons' },
    { id: 'pentagon', name: 'Pentagon', icon: Square, description: 'Draw pentagons' },
  ];

  const handleToolSelect = (toolId: string) => {
    actions.setSelectedTool(toolId);
  };

  return (
    <div className="w-16 bg-gray-800 flex flex-col items-center py-4 space-y-2">
      {tools.map((tool) => {
        const IconComponent = tool.icon;
        return (
          <button
            key={tool.id}
            className={`p-3 rounded transition-colors ${
              state.tool.selectedTool === tool.id 
                ? 'bg-blue-600 text-white' 
                : 'bg-gray-600 text-gray-300 hover:bg-gray-500'
            }`}
            onClick={() => handleToolSelect(tool.id)}
            title={tool.description}
          >
            <IconComponent className="w-6 h-6" />
          </button>
        );
      })}
      
      {/* Separator */}
      <div className="w-8 h-px bg-gray-600 my-2"></div>
      
      {/* Utility buttons */}
      <button
        className="p-3 rounded bg-gray-600 text-gray-300 hover:bg-gray-500"
        title="Clear All"
        onClick={() => {
          // Clear all shapes
          state.shapes.forEach(shape => actions.deleteShape(shape.id));
        }}
      >
        <Square className="w-6 h-6" />
      </button>
    </div>
  );
}
