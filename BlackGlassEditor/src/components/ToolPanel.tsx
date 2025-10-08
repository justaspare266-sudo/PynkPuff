'use client';

import React, { useState, useRef, useEffect } from 'react';
import { X, Move, Maximize2, RotateCw } from 'lucide-react';
import { useEditor } from '../contexts/EditorContext';

interface ToolPanelProps {
  toolId: string;
  title: string;
  children: React.ReactNode;
  className?: string;
}

export function ToolPanel({ toolId, title, children, className = '' }: ToolPanelProps) {
  const { state, actions } = useEditor();
  const [isDragging, setIsDragging] = useState(false);
  const [isResizing, setIsResizing] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [resizeStart, setResizeStart] = useState({ x: 0, y: 0, width: 0, height: 0 });
  const panelRef = useRef<HTMLDivElement>(null);

  const panel = state.toolPanels[toolId];
  if (!panel || !panel.isOpen) return null;

  // Handle drag start
  const handleDragStart = (e: React.MouseEvent) => {
    if (e.target !== e.currentTarget) return;
    setIsDragging(true);
    setDragStart({
      x: e.clientX - panel.position.x,
      y: e.clientY - panel.position.y,
    });
  };

  // Handle resize start
  const handleResizeStart = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsResizing(true);
    setResizeStart({
      x: e.clientX,
      y: e.clientY,
      width: panel.size.width,
      height: panel.size.height,
    });
  };

  // Handle mouse move
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (isDragging) {
        const newX = e.clientX - dragStart.x;
        const newY = e.clientY - dragStart.y;
        actions.updateToolPanel(toolId, {
          position: { x: Math.max(0, newX), y: Math.max(0, newY) },
        });
      } else if (isResizing) {
        const newWidth = Math.max(200, resizeStart.width + (e.clientX - resizeStart.x));
        const newHeight = Math.max(150, resizeStart.height + (e.clientY - resizeStart.y));
        actions.updateToolPanel(toolId, {
          size: { width: newWidth, height: newHeight },
        });
      }
    };

    const handleMouseUp = () => {
      setIsDragging(false);
      setIsResizing(false);
    };

    if (isDragging || isResizing) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging, isResizing, dragStart, resizeStart, toolId, actions]);

  return (
    <div
      ref={panelRef}
      className={`absolute bg-gray-800 border border-gray-600 rounded-lg shadow-xl z-50 ${className}`}
      style={{
        left: panel.position.x,
        top: panel.position.y,
        width: panel.size.width,
        height: panel.size.height,
        cursor: isDragging ? 'grabbing' : 'grab',
      }}
      onMouseDown={handleDragStart}
    >
      {/* Header */}
      <div className="flex items-center justify-between p-3 border-b border-gray-600 bg-gray-700 rounded-t-lg">
        <h3 className="text-sm font-semibold text-white">{title}</h3>
        <div className="flex items-center space-x-2">
          <button
            className="p-1 text-gray-400 hover:text-white transition-colors"
            title="Resize"
            onMouseDown={handleResizeStart}
          >
            <Maximize2 className="w-4 h-4" />
          </button>
          <button
            className="p-1 text-gray-400 hover:text-white transition-colors"
            onClick={() => actions.closeToolPanel(toolId)}
            title="Close"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="p-4 h-full overflow-y-auto" style={{ height: panel.size.height - 60 }}>
        {children}
      </div>

      {/* Resize handle */}
      <div
        className="absolute bottom-0 right-0 w-4 h-4 cursor-se-resize opacity-0 hover:opacity-100 transition-opacity"
        onMouseDown={handleResizeStart}
        style={{
          background: 'linear-gradient(-45deg, transparent 30%, #6b7280 30%, #6b7280 40%, transparent 40%, transparent 60%, #6b7280 60%, #6b7280 70%, transparent 70%)',
        }}
      />
    </div>
  );
}

// Tool panel container for managing multiple panels
export function ToolPanelContainer() {
  const { state } = useEditor();

  return (
    <>
      {Object.entries(state.toolPanels).map(([toolId, panel]) => {
        if (!panel.isOpen) return null;

        // This would be dynamically rendered based on toolId
        // For now, we'll return a placeholder
        return (
          <ToolPanel key={toolId} toolId={toolId} title={`${toolId} Tool`}>
            <div className="text-gray-300">
              {toolId} tool panel content will be rendered here
            </div>
          </ToolPanel>
        );
      })}
    </>
  );
}
