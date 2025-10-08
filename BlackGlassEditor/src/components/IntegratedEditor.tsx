'use client';

import React, { useState } from 'react';
import { useEditor } from '../contexts/EditorContext';
import { SimpleToolSelector } from './SimpleToolSelector';
import { BasicDrawingTools } from './BasicDrawingTools';
import ShapeTool from './ShapeTool';
import EnhancedShapeTool from './EnhancedShapeTool';
import { 
  Square, 
  Type, 
  Image as ImageIcon, 
  Palette, 
  Layers, 
  Settings,
  X
} from 'lucide-react';

export function IntegratedEditor() {
  const { state } = useEditor();
  const [activePanel, setActivePanel] = useState<string | null>(null);

  const panels = [
    { id: 'shapes', name: 'Shapes', icon: Square, component: ShapeTool },
    { id: 'enhanced', name: 'Enhanced', icon: Square, component: EnhancedShapeTool },
    { id: 'text', name: 'Text', icon: Type, component: null },
    { id: 'image', name: 'Image', icon: ImageIcon, component: null },
    { id: 'color', name: 'Color', icon: Palette, component: null },
    { id: 'layers', name: 'Layers', icon: Layers, component: null },
    { id: 'settings', name: 'Settings', icon: Settings, component: null },
  ];

  const selectedShape = state.shapes.find(shape => shape.isSelected);

  return (
    <div className="w-full h-screen bg-gray-100 flex">
      {/* Left Toolbar */}
      <SimpleToolSelector />

      {/* Main Canvas Area */}
      <div className="flex-1 flex flex-col">
        {/* Top Bar */}
        <div className="bg-gray-800 text-white p-4 flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <h1 className="text-xl font-semibold">BlackGlass Editor</h1>
            <span className="text-sm text-gray-300">
              Shapes: {state.shapes.length} | Selected: {state.shapes.filter(s => s.isSelected).length}
            </span>
          </div>
          
          {/* Panel Tabs */}
          <div className="flex space-x-1">
            {panels.map(panel => (
              <button
                key={panel.id}
                onClick={() => setActivePanel(activePanel === panel.id ? null : panel.id)}
                className={`px-4 py-2 rounded text-sm flex items-center space-x-2 ${
                  activePanel === panel.id 
                    ? 'bg-blue-600 text-white' 
                    : 'bg-gray-600 text-gray-300 hover:bg-gray-500'
                }`}
              >
                <panel.icon className="w-4 h-4" />
                <span>{panel.name}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Canvas */}
        <div className="flex-1 p-4">
          <BasicDrawingTools />
        </div>
      </div>

      {/* Right Panel */}
      {activePanel && (
        <div className="w-80 bg-gray-800 border-l border-gray-700 flex flex-col">
          {/* Panel Header */}
          <div className="p-4 border-b border-gray-700 flex items-center justify-between">
            <h3 className="text-lg font-semibold text-white">
              {panels.find(p => p.id === activePanel)?.name} Panel
            </h3>
            <button
              onClick={() => setActivePanel(null)}
              className="text-gray-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Panel Content */}
          <div className="flex-1 overflow-y-auto">
            {activePanel === 'shapes' && (
              <div className="p-4">
                <ShapeTool
                  onShapeAdd={() => {}}
                  onShapeUpdate={(id, updates) => {
                    // Update shape using your existing system
                    const { actions } = useEditor();
                    actions.updateShape(id, updates);
                  }}
                  onShapeDelete={(id) => {
                    const { actions } = useEditor();
                    actions.deleteShape(id);
                  }}
                  canvasState={state.canvas}
                  selectedShapeElement={selectedShape}
                />
              </div>
            )}
            
            {activePanel === 'enhanced' && (
              <div className="p-4">
                <EnhancedShapeTool
                  currentStyle={{
                    fill: selectedShape?.fill || state.tool.toolSettings.fillColor,
                    stroke: selectedShape?.stroke || state.tool.toolSettings.strokeColor,
                    strokeWidth: selectedShape?.strokeWidth || state.tool.toolSettings.strokeWidth,
                    fillEnabled: selectedShape?.fillEnabled ?? true,
                    strokeEnabled: selectedShape?.strokeEnabled ?? true,
                    opacity: selectedShape?.opacity ?? 1,
                    rotation: selectedShape?.rotation ?? 0,
                    scaleX: selectedShape?.scaleX ?? 1,
                    scaleY: selectedShape?.scaleY ?? 1,
                    shadowColor: selectedShape?.shadowColor || '#000000',
                    shadowBlur: selectedShape?.shadowBlur || 0,
                    shadowOffsetX: selectedShape?.shadowOffset?.x || 0,
                    shadowOffsetY: selectedShape?.shadowOffset?.y || 0,
                    shadowEnabled: selectedShape?.shadowEnabled || false
                  }}
                  onStyleChange={(style) => {
                    if (selectedShape) {
                      const { actions } = useEditor();
                      actions.updateShape(selectedShape.id, {
                        fill: style.fill,
                        stroke: style.stroke,
                        strokeWidth: style.strokeWidth,
                        fillEnabled: style.fillEnabled,
                        strokeEnabled: style.strokeEnabled,
                        opacity: style.opacity,
                        rotation: style.rotation,
                        scaleX: style.scaleX,
                        scaleY: style.scaleY,
                        shadowColor: style.shadowColor,
                        shadowBlur: style.shadowBlur,
                        shadowOffset: { x: style.shadowOffsetX || 0, y: style.shadowOffsetY || 0 },
                        shadowEnabled: style.shadowEnabled
                      });
                    }
                  }}
                  onShapeSelect={(shapeType) => {
                    const { actions } = useEditor();
                    actions.setSelectedTool(shapeType);
                  }}
                  selectedShapeType={state.tool.selectedTool}
                />
              </div>
            )}
            
            {activePanel === 'text' && (
              <div className="p-4 text-white">
                <h4 className="text-lg font-semibold mb-4">Text Properties</h4>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Font Size</label>
                    <input
                      type="range"
                      min="8"
                      max="72"
                      value={selectedShape?.fontSize || 16}
                      className="w-full"
                      onChange={(e) => {
                        if (selectedShape) {
                          const { actions } = useEditor();
                          actions.updateShape(selectedShape.id, { fontSize: parseInt(e.target.value) });
                        }
                      }}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Font Family</label>
                    <select
                      value={selectedShape?.fontFamily || 'Arial'}
                      className="w-full p-2 bg-gray-700 rounded text-white"
                      onChange={(e) => {
                        if (selectedShape) {
                          const { actions } = useEditor();
                          actions.updateShape(selectedShape.id, { fontFamily: e.target.value });
                        }
                      }}
                    >
                      <option value="Arial">Arial</option>
                      <option value="Helvetica">Helvetica</option>
                      <option value="Times New Roman">Times New Roman</option>
                      <option value="Courier New">Courier New</option>
                    </select>
                  </div>
                </div>
              </div>
            )}
            
            {activePanel === 'layers' && (
              <div className="p-4 text-white">
                <h4 className="text-lg font-semibold mb-4">Layers</h4>
                <div className="space-y-2">
                  {state.shapes.map((shape, index) => (
                    <div
                      key={shape.id}
                      className={`p-2 rounded flex items-center justify-between ${
                        shape.isSelected ? 'bg-blue-600' : 'bg-gray-700'
                      }`}
                    >
                      <span className="text-sm">{shape.name}</span>
                      <div className="flex items-center space-x-2">
                        <button
                          className="text-xs px-2 py-1 bg-gray-600 rounded"
                          onClick={() => {
                            const { actions } = useEditor();
                            actions.selectShape(shape.id);
                          }}
                        >
                          Select
                        </button>
                        <button
                          className="text-xs px-2 py-1 bg-red-600 rounded"
                          onClick={() => {
                            const { actions } = useEditor();
                            actions.deleteShape(shape.id);
                          }}
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
