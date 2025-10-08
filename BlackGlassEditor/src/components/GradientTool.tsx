'use client';

import React, { useState, useRef, useCallback } from 'react';
import { useEditor } from '../contexts/EditorContext';
import { ToolPanel } from './ToolPanel';
import { Palette, Move, RotateCw } from 'lucide-react';

export function GradientTool() {
  const { state, actions } = useEditor();
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [gradientStart, setGradientStart] = useState({ x: 100, y: 100 });
  const [gradientEnd, setGradientEnd] = useState({ x: 200, y: 200 });
  const [gradientType, setGradientType] = useState<'linear' | 'radial'>('linear');
  const [gradientColors, setGradientColors] = useState([
    { color: '#ff6b9d', position: 0 },
    { color: '#4ecdc4', position: 1 }
  ]);

  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Handle gradient line dragging
  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    if (!canvasRef.current) return;
    
    const rect = canvasRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    // Check if clicking near gradient start or end points
    const startDistance = Math.sqrt((x - gradientStart.x) ** 2 + (y - gradientStart.y) ** 2);
    const endDistance = Math.sqrt((x - gradientEnd.x) ** 2 + (y - gradientEnd.y) ** 2);
    
    if (startDistance < 10) {
      setIsDragging(true);
      setDragStart({ x, y });
    } else if (endDistance < 10) {
      setIsDragging(true);
      setDragStart({ x, y });
    }
  }, [gradientStart, gradientEnd]);

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (!isDragging || !canvasRef.current) return;
    
    const rect = canvasRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    // Update gradient points based on which one is being dragged
    const startDistance = Math.sqrt((dragStart.x - gradientStart.x) ** 2 + (dragStart.y - gradientStart.y) ** 2);
    const endDistance = Math.sqrt((dragStart.x - gradientEnd.x) ** 2 + (dragStart.y - gradientEnd.y) ** 2);
    
    if (startDistance < endDistance) {
      setGradientStart({ x, y });
    } else {
      setGradientEnd({ x, y });
    }
  }, [isDragging, dragStart, gradientStart, gradientEnd]);

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
  }, []);

  // Apply gradient to selected shapes
  const applyGradient = useCallback(() => {
    const selectedShapes = state.shapes.filter(s => 
      state.tool.selectedShapeIds.includes(s.id)
    );
    
    if (selectedShapes.length === 0) {
      alert('Please select a shape first');
      return;
    }

    selectedShapes.forEach(shape => {
      const gradientData = {
        fillLinearGradientStartPoint: { x: gradientStart.x, y: gradientStart.y },
        fillLinearGradientEndPoint: { x: gradientEnd.x, y: gradientEnd.y },
        fillLinearGradientColorStops: gradientColors,
        fill: `linear-gradient(${gradientStart.x}, ${gradientStart.y}, ${gradientEnd.x}, ${gradientEnd.y}, ${gradientColors.map(c => `${c.color} ${c.position * 100}%`).join(', ')})`
      };
      
      actions.updateShape(shape.id, gradientData);
    });
  }, [state.shapes, state.tool.selectedShapeIds, gradientStart, gradientEnd, gradientColors, actions]);

  // Add color stop
  const addColorStop = useCallback(() => {
    const newPosition = gradientColors.length > 0 ? gradientColors[gradientColors.length - 1].position + 0.1 : 0.5;
    setGradientColors(prev => [...prev, { color: '#ffffff', position: Math.min(newPosition, 1) }]);
  }, [gradientColors]);

  // Remove color stop
  const removeColorStop = useCallback((index: number) => {
    if (gradientColors.length > 2) {
      setGradientColors(prev => prev.filter((_, i) => i !== index));
    }
  }, [gradientColors]);

  // Update color stop
  const updateColorStop = useCallback((index: number, color: string) => {
    setGradientColors(prev => prev.map((stop, i) => 
      i === index ? { ...stop, color } : stop
    ));
  }, []);

  // Update color stop position
  const updateColorStopPosition = useCallback((index: number, position: number) => {
    setGradientColors(prev => prev.map((stop, i) => 
      i === index ? { ...stop, position: Math.max(0, Math.min(1, position)) } : stop
    ));
  }, []);

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-white mb-4">Gradient Tool</h3>
      
      {/* Gradient Preview Canvas */}
      <div className="relative">
        <canvas
          ref={canvasRef}
          width={300}
          height={200}
          className="border border-gray-600 rounded cursor-crosshair"
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          style={{
            background: `linear-gradient(${gradientStart.x}, ${gradientStart.y}, ${gradientEnd.x}, ${gradientEnd.y}, ${gradientColors.map(c => `${c.color} ${c.position * 100}%`).join(', ')})`
          }}
        />
        
        {/* Gradient line */}
        <svg
          className="absolute inset-0 pointer-events-none"
          width={300}
          height={200}
        >
          <line
            x1={gradientStart.x}
            y1={gradientStart.y}
            x2={gradientEnd.x}
            y2={gradientEnd.y}
            stroke="#ffffff"
            strokeWidth={2}
            strokeDasharray="5,5"
          />
          <circle
            cx={gradientStart.x}
            cy={gradientStart.y}
            r={8}
            fill="#ff6b9d"
            stroke="#ffffff"
            strokeWidth={2}
          />
          <circle
            cx={gradientEnd.x}
            cy={gradientEnd.y}
            r={8}
            fill="#4ecdc4"
            stroke="#ffffff"
            strokeWidth={2}
          />
        </svg>
      </div>

      {/* Gradient Type */}
      <div>
        <label className="block text-sm font-medium text-white mb-2">Gradient Type</label>
        <div className="flex space-x-2">
          <button
            onClick={() => setGradientType('linear')}
            className={`px-3 py-1 rounded text-sm ${
              gradientType === 'linear' ? 'bg-blue-600 text-white' : 'bg-gray-600 text-gray-300'
            }`}
          >
            Linear
          </button>
          <button
            onClick={() => setGradientType('radial')}
            className={`px-3 py-1 rounded text-sm ${
              gradientType === 'radial' ? 'bg-blue-600 text-white' : 'bg-gray-600 text-gray-300'
            }`}
          >
            Radial
          </button>
        </div>
      </div>

      {/* Color Stops */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <label className="text-sm font-medium text-white">Color Stops</label>
          <button
            onClick={addColorStop}
            className="px-2 py-1 bg-green-600 hover:bg-green-700 rounded text-xs text-white"
          >
            Add Color
          </button>
        </div>
        
        <div className="space-y-2">
          {gradientColors.map((stop, index) => (
            <div key={index} className="flex items-center space-x-2">
              <input
                type="color"
                value={stop.color}
                onChange={(e) => updateColorStop(index, e.target.value)}
                className="w-8 h-8 rounded border border-gray-500"
              />
              <input
                type="range"
                min="0"
                max="1"
                step="0.01"
                value={stop.position}
                onChange={(e) => updateColorStopPosition(index, parseFloat(e.target.value))}
                className="flex-1"
              />
              <span className="text-xs text-gray-300 w-8">
                {Math.round(stop.position * 100)}%
              </span>
              {gradientColors.length > 2 && (
                <button
                  onClick={() => removeColorStop(index)}
                  className="px-2 py-1 bg-red-600 hover:bg-red-700 rounded text-xs text-white"
                >
                  ×
                </button>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Apply Gradient */}
      <button
        onClick={applyGradient}
        className="w-full p-2 bg-blue-600 hover:bg-blue-700 rounded text-sm text-white"
      >
        Apply Gradient to Selected Shapes
      </button>

      {/* Instructions */}
      <div className="text-xs text-gray-400 space-y-1">
        <p>• Drag the colored circles to adjust gradient direction</p>
        <p>• Add/remove color stops to create complex gradients</p>
        <p>• Select shapes on canvas to apply gradient</p>
      </div>
    </div>
  );
}

// Tool panel wrapper
export function GradientToolPanel() {
  const { state, actions } = useEditor();

  const openPanel = () => {
    actions.openToolPanel('gradient', { x: 200, y: 100 });
  };

  return (
    <>
      <button
        onClick={openPanel}
        className="w-12 h-12 rounded-lg flex items-center justify-center transition-all text-gray-300 hover:bg-gray-700"
        title="Gradient Tool"
      >
        <Palette className="w-5 h-5" />
      </button>

      {state.toolPanels.gradient?.isOpen && (
        <ToolPanel toolId="gradient" title="Gradient Tool">
          <GradientTool />
        </ToolPanel>
      )}
    </>
  );
}