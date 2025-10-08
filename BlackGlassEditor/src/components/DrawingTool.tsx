import React, { useState, useCallback } from 'react';
import { Edit, Eraser, Trash2, Undo, X } from 'lucide-react';

export interface DrawingLine {
  id: string;
  tool: 'pen' | 'eraser';
  points: number[];
  stroke: string;
  strokeWidth: number;
}

interface DrawingToolProps {
  isOpen: boolean;
  onClose: () => void;
  drawingMode: 'pen' | 'eraser';
  onDrawingModeChange: (mode: 'pen' | 'eraser') => void;
  strokeWidth: number;
  onStrokeWidthChange: (width: number) => void;
  strokeColor: string;
  onStrokeColorChange: (color: string) => void;
  onClearAll: () => void;
  onUndo: () => void;
  canUndo: boolean;
}

export const DrawingTool: React.FC<DrawingToolProps> = ({
  isOpen,
  onClose,
  drawingMode,
  onDrawingModeChange,
  strokeWidth,
  onStrokeWidthChange,
  strokeColor,
  onStrokeColorChange,
  onClearAll,
  onUndo,
  canUndo
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed top-4 left-4 z-50 w-64 bg-white rounded-lg shadow-lg border">
      <div className="p-4 border-b">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold">Drawing Tool</h3>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>
      
      <div className="p-4 space-y-4">
        {/* Drawing Mode Selection */}
        <div className="flex items-center space-x-2">
          <button
            onClick={() => onDrawingModeChange('pen')}
            className={`flex items-center space-x-2 px-3 py-2 rounded ${
              drawingMode === 'pen' ? 'bg-blue-600 text-white' : 'bg-gray-100 hover:bg-gray-200'
            }`}
          >
            <Edit className="w-4 h-4" />
            <span>Pen</span>
          </button>
          
          <button
            onClick={() => onDrawingModeChange('eraser')}
            className={`flex items-center space-x-2 px-3 py-2 rounded ${
              drawingMode === 'eraser' ? 'bg-red-600 text-white' : 'bg-gray-100 hover:bg-gray-200'
            }`}
          >
            <Eraser className="w-4 h-4" />
            <span>Eraser</span>
          </button>
        </div>

        {/* Stroke Width */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700">Stroke Width</label>
          <input
            type="range"
            min="1"
            max="20"
            value={strokeWidth}
            onChange={(e) => onStrokeWidthChange(parseInt(e.target.value))}
            className="w-full"
          />
          <span className="text-xs text-gray-500">{strokeWidth}px</span>
        </div>

        {/* Color (only for pen) */}
        {drawingMode === 'pen' && (
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">Color</label>
            <div className="flex items-center space-x-2">
              <input
                type="color"
                value={strokeColor}
                onChange={(e) => onStrokeColorChange(e.target.value)}
                className="w-8 h-8 rounded border"
              />
              <span className="text-sm text-gray-500">Drawing Color</span>
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="flex items-center space-x-2 pt-4 border-t">
          <button
            onClick={onUndo}
            disabled={!canUndo}
            className="flex items-center space-x-1 px-3 py-2 bg-orange-600 text-white rounded hover:bg-orange-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Undo className="w-4 h-4" />
            <span>Undo</span>
          </button>
          
          <button
            onClick={onClearAll}
            className="flex items-center space-x-1 px-3 py-2 bg-red-600 text-white rounded hover:bg-red-700"
          >
            <Trash2 className="w-4 h-4" />
            <span>Clear All</span>
          </button>
        </div>

        {/* Instructions */}
        <div className="text-xs text-gray-500 bg-gray-50 p-2 rounded">
          <p>• Click and drag to draw</p>
          <p>• Switch between Pen and Eraser</p>
          <p>• Adjust stroke width and color</p>
        </div>
      </div>
    </div>
  );
};