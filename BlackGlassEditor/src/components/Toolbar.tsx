'use client';

import React, { useState, useCallback } from 'react';
import {
  MousePointer2,
  Type,
  Square,
  Circle,
  Image as ImageIcon,
  Crop,
  Move,
  RotateCw,
  Palette,
  Layers,
  Grid3X3,
  Ruler,
  Download,
  Upload,
  Save,
  Undo,
  Redo,
  Copy,
  Trash2,
  AlignLeft,
  AlignCenter,
  AlignRight,
  AlignJustify,
  AlignVerticalJustifyCenter,
  AlignHorizontalJustifyCenter,
  AlignVerticalJustifyStart,
  AlignVerticalJustifyEnd,
  AlignHorizontalJustifyStart,
  AlignHorizontalJustifyEnd,
  ArrowLeft as DistributeHorizontal,
  ArrowUp as DistributeVertical,
  Group,
  Ungroup,
  BringToFront,
  SendToBack,
  ArrowUp as BringForward,
  ArrowDown as SendBackward,
  FlipHorizontal,
  FlipVertical,
  ZoomIn,
  ZoomOut,
  RotateCcw as ZoomReset,
  Settings,
  HelpCircle,
  Eye,
  EyeOff,
  Lock,
  Unlock,
  Filter,
  Sparkles,
  Palette as Gradient,
  PenTool,
  Square as Path,
  Star,
  Heart,
  Zap,
  ArrowRight,
  Triangle,
  Hexagon,
  Pentagon
} from 'lucide-react';

export type ToolType = 
  | 'select' 
  | 'text' 
  | 'rect' 
  | 'circle' 
  | 'line' 
  | 'arrow' 
  | 'star' 
  | 'polygon' 
  | 'image' 
  | 'crop' 
  | 'move' 
  | 'rotate' 
  | 'pen' 
  | 'path'
  | 'gradient'
  | 'filter'
  | 'effects';

export interface Tool {
  id: ToolType;
  name: string;
  icon: React.ComponentType<any>;
  shortcut?: string;
  category: 'selection' | 'drawing' | 'text' | 'shapes' | 'images' | 'transform' | 'effects' | 'utilities';
  isActive?: boolean;
  isDisabled?: boolean;
}

export interface ToolbarProps {
  selectedTool: ToolType;
  onToolSelect: (tool: ToolType) => void;
  onAction: (action: string) => void;
  canUndo: boolean;
  canRedo: boolean;
  hasSelection: boolean;
  selectedCount: number;
  zoom: number;
  onZoomChange: (zoom: number) => void;
  onZoomIn: () => void;
  onZoomOut: () => void;
  onZoomReset: () => void;
  onSave: () => void;
  onLoad: () => void;
  onExport: () => void;
  onUndo: () => void;
  onRedo: () => void;
  onCopy: () => void;
  onDelete: () => void;
  onGroup: () => void;
  onUngroup: () => void;
  onBringToFront: () => void;
  onSendToBack: () => void;
  onBringForward: () => void;
  onSendBackward: () => void;
  onFlipHorizontal: () => void;
  onFlipVertical: () => void;
  onAlign: (alignment: string) => void;
  onDistribute: (direction: string) => void;
  onToggleGrid: () => void;
  onToggleRulers: () => void;
  onToggleGuides: () => void;
  onShowLayers: () => void;
  onShowColorPicker: () => void;
  onShowFilters: () => void;
  onShowEffects: () => void;
  onShowSettings: () => void;
  onShowHelp: () => void;
  className?: string;
}

const Toolbar: React.FC<ToolbarProps> = ({
  selectedTool,
  onToolSelect,
  onAction,
  canUndo,
  canRedo,
  hasSelection,
  selectedCount,
  zoom,
  onZoomChange,
  onZoomIn,
  onZoomOut,
  onZoomReset,
  onSave,
  onLoad,
  onExport,
  onUndo,
  onRedo,
  onCopy,
  onDelete,
  onGroup,
  onUngroup,
  onBringToFront,
  onSendToBack,
  onBringForward,
  onSendBackward,
  onFlipHorizontal,
  onFlipVertical,
  onAlign,
  onDistribute,
  onToggleGrid,
  onToggleRulers,
  onToggleGuides,
  onShowLayers,
  onShowColorPicker,
  onShowFilters,
  onShowEffects,
  onShowSettings,
  onShowHelp,
  className = ''
}) => {
  const [showShapeMenu, setShowShapeMenu] = useState(false);
  const [showAlignMenu, setShowAlignMenu] = useState(false);
  const [showArrangeMenu, setShowArrangeMenu] = useState(false);

  const tools: Tool[] = [
    // Selection tools
    { id: 'select', name: 'Select', icon: MousePointer2, shortcut: 'V', category: 'selection' },
    
    // Drawing tools
    { id: 'pen', name: 'Pen', icon: PenTool, shortcut: 'P', category: 'drawing' },
    { id: 'path', name: 'Path', icon: Path, shortcut: 'A', category: 'drawing' },
    
    // Text tool
    { id: 'text', name: 'Text', icon: Type, shortcut: 'T', category: 'text' },
    
    // Shape tools
    { id: 'rect', name: 'Rectangle', icon: Square, shortcut: 'R', category: 'shapes' },
    { id: 'circle', name: 'Circle', icon: Circle, shortcut: 'C', category: 'shapes' },
    { id: 'line', name: 'Line', icon: Zap, shortcut: 'L', category: 'shapes' },
    { id: 'arrow', name: 'Arrow', icon: ArrowRight, shortcut: 'Shift+A', category: 'shapes' },
    { id: 'star', name: 'Star', icon: Star, shortcut: 'S', category: 'shapes' },
    { id: 'polygon', name: 'Polygon', icon: Hexagon, shortcut: 'G', category: 'shapes' },
    
    // Image tools
    { id: 'image', name: 'Image', icon: ImageIcon, shortcut: 'I', category: 'images' },
    { id: 'crop', name: 'Crop', icon: Crop, shortcut: 'Shift+C', category: 'images' },
    
    // Transform tools
    { id: 'move', name: 'Move', icon: Move, shortcut: 'M', category: 'transform' },
    { id: 'rotate', name: 'Rotate', icon: RotateCw, shortcut: 'R', category: 'transform' },
    
    // Effect tools
    { id: 'gradient', name: 'Gradient', icon: Gradient, shortcut: 'G', category: 'effects' },
    { id: 'filter', name: 'Filter', icon: Filter, shortcut: 'F', category: 'effects' },
    { id: 'effects', name: 'Effects', icon: Sparkles, shortcut: 'E', category: 'effects' }
  ];

  const getToolsByCategory = (category: string) => {
    return tools.filter(tool => tool.category === category);
  };

  const renderToolButton = (tool: Tool) => {
    const IconComponent = tool.icon;
    const isActive = selectedTool === tool.id;
    
    return (
      <button
        key={tool.id}
        onClick={() => onToolSelect(tool.id)}
        className={`p-2 rounded-lg transition-colors ${
          isActive 
            ? 'bg-blue-600 text-white shadow-lg' 
            : 'bg-gray-600 hover:bg-gray-500 text-gray-300 hover:text-white'
        } ${tool.isDisabled ? 'opacity-50 cursor-not-allowed' : ''}`}
        title={`${tool.name} ${tool.shortcut ? `(${tool.shortcut})` : ''}`}
        disabled={tool.isDisabled}
      >
        <IconComponent className="w-5 h-5" />
      </button>
    );
  };

  const renderShapeMenu = () => {
    if (!showShapeMenu) return null;
    
    const shapeTools = getToolsByCategory('shapes');
    
    return (
      <div className="absolute top-full left-0 mt-1 bg-gray-700 rounded-lg shadow-xl border border-gray-600 p-2 z-50">
        <div className="grid grid-cols-3 gap-1">
          {shapeTools.map(tool => (
            <button
              key={tool.id}
              onClick={() => {
                onToolSelect(tool.id);
                setShowShapeMenu(false);
              }}
              className={`p-2 rounded transition-colors ${
                selectedTool === tool.id 
                  ? 'bg-blue-600 text-white' 
                  : 'bg-gray-600 hover:bg-gray-500 text-gray-300 hover:text-white'
              }`}
              title={tool.name}
            >
              <tool.icon className="w-4 h-4" />
            </button>
          ))}
        </div>
      </div>
    );
  };

  const renderAlignMenu = () => {
    if (!showAlignMenu) return null;
    
    return (
      <div className="absolute top-full left-0 mt-1 bg-gray-700 rounded-lg shadow-xl border border-gray-600 p-2 z-50">
        <div className="space-y-2">
          <div className="text-xs font-semibold text-gray-400 mb-2">Align</div>
          <div className="grid grid-cols-3 gap-1">
            <button onClick={() => { onAlign('left'); setShowAlignMenu(false); }} className="p-2 bg-gray-600 hover:bg-gray-500 rounded">
              <AlignLeft className="w-4 h-4" />
            </button>
            <button onClick={() => { onAlign('center'); setShowAlignMenu(false); }} className="p-2 bg-gray-600 hover:bg-gray-500 rounded">
              <AlignCenter className="w-4 h-4" />
            </button>
            <button onClick={() => { onAlign('right'); setShowAlignMenu(false); }} className="p-2 bg-gray-600 hover:bg-gray-500 rounded">
              <AlignRight className="w-4 h-4" />
            </button>
            <button onClick={() => { onAlign('top'); setShowAlignMenu(false); }} className="p-2 bg-gray-600 hover:bg-gray-500 rounded">
              <AlignVerticalJustifyStart className="w-4 h-4" />
            </button>
            <button onClick={() => { onAlign('middle'); setShowAlignMenu(false); }} className="p-2 bg-gray-600 hover:bg-gray-500 rounded">
              <AlignHorizontalJustifyCenter className="w-4 h-4" />
            </button>
            <button onClick={() => { onAlign('bottom'); setShowAlignMenu(false); }} className="p-2 bg-gray-600 hover:bg-gray-500 rounded">
              <AlignVerticalJustifyEnd className="w-4 h-4" />
            </button>
          </div>
          <div className="border-t border-gray-600 pt-2">
            <div className="text-xs font-semibold text-gray-400 mb-2">Distribute</div>
            <div className="flex space-x-1">
              <button onClick={() => { onDistribute('horizontal'); setShowAlignMenu(false); }} className="p-2 bg-gray-600 hover:bg-gray-500 rounded">
                <DistributeHorizontal className="w-4 h-4" />
              </button>
              <button onClick={() => { onDistribute('vertical'); setShowAlignMenu(false); }} className="p-2 bg-gray-600 hover:bg-gray-500 rounded">
                <DistributeVertical className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderArrangeMenu = () => {
    if (!showArrangeMenu) return null;
    
    return (
      <div className="absolute top-full left-0 mt-1 bg-gray-700 rounded-lg shadow-xl border border-gray-600 p-2 z-50">
        <div className="space-y-1">
          <button onClick={() => { onBringToFront(); setShowArrangeMenu(false); }} className="w-full p-2 bg-gray-600 hover:bg-gray-500 rounded text-left flex items-center space-x-2">
            <BringToFront className="w-4 h-4" />
            <span className="text-sm">Bring to Front</span>
          </button>
          <button onClick={() => { onBringForward(); setShowArrangeMenu(false); }} className="w-full p-2 bg-gray-600 hover:bg-gray-500 rounded text-left flex items-center space-x-2">
            <BringForward className="w-4 h-4" />
            <span className="text-sm">Bring Forward</span>
          </button>
          <button onClick={() => { onSendBackward(); setShowArrangeMenu(false); }} className="w-full p-2 bg-gray-600 hover:bg-gray-500 rounded text-left flex items-center space-x-2">
            <SendBackward className="w-4 h-4" />
            <span className="text-sm">Send Backward</span>
          </button>
          <button onClick={() => { onSendToBack(); setShowArrangeMenu(false); }} className="w-full p-2 bg-gray-600 hover:bg-gray-500 rounded text-left flex items-center space-x-2">
            <SendToBack className="w-4 h-4" />
            <span className="text-sm">Send to Back</span>
          </button>
          <div className="border-t border-gray-600 pt-1 mt-1">
            <button onClick={() => { onFlipHorizontal(); setShowArrangeMenu(false); }} className="w-full p-2 bg-gray-600 hover:bg-gray-500 rounded text-left flex items-center space-x-2">
              <FlipHorizontal className="w-4 h-4" />
              <span className="text-sm">Flip Horizontal</span>
            </button>
            <button onClick={() => { onFlipVertical(); setShowArrangeMenu(false); }} className="w-full p-2 bg-gray-600 hover:bg-gray-500 rounded text-left flex items-center space-x-2">
              <FlipVertical className="w-4 h-4" />
              <span className="text-sm">Flip Vertical</span>
            </button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className={`bg-gray-800 border-b border-gray-700 p-4 ${className}`}>
      <div className="flex items-center justify-between">
        {/* Left side - Tools */}
        <div className="flex items-center space-x-4">
          {/* Selection tools */}
          <div className="flex items-center space-x-1">
            {getToolsByCategory('selection').map(renderToolButton)}
          </div>
          
          <div className="w-px h-8 bg-gray-600" />
          
          {/* Drawing tools */}
          <div className="flex items-center space-x-1">
            {getToolsByCategory('drawing').map(renderToolButton)}
          </div>
          
          {/* Text tool */}
          <div className="flex items-center space-x-1">
            {getToolsByCategory('text').map(renderToolButton)}
          </div>
          
          {/* Shape tools */}
          <div className="relative">
            <button
              onClick={() => setShowShapeMenu(!showShapeMenu)}
              className={`p-2 rounded-lg transition-colors ${
                getToolsByCategory('shapes').some(tool => selectedTool === tool.id)
                  ? 'bg-blue-600 text-white shadow-lg' 
                  : 'bg-gray-600 hover:bg-gray-500 text-gray-300 hover:text-white'
              }`}
              title="Shapes"
            >
              <Square className="w-5 h-5" />
            </button>
            {renderShapeMenu()}
          </div>
          
          {/* Image tools */}
          <div className="flex items-center space-x-1">
            {getToolsByCategory('images').map(renderToolButton)}
          </div>
          
          {/* Transform tools */}
          <div className="flex items-center space-x-1">
            {getToolsByCategory('transform').map(renderToolButton)}
          </div>
          
          {/* Effect tools */}
          <div className="flex items-center space-x-1">
            {getToolsByCategory('effects').map(renderToolButton)}
          </div>
        </div>

        {/* Center - Actions */}
        <div className="flex items-center space-x-2">
          {/* File operations */}
          <div className="flex items-center space-x-1">
            <button onClick={onSave} className="p-2 bg-gray-600 hover:bg-gray-500 rounded" title="Save">
              <Save className="w-4 h-4" />
            </button>
            <button onClick={onLoad} className="p-2 bg-gray-600 hover:bg-gray-500 rounded" title="Load">
              <Upload className="w-4 h-4" />
            </button>
            <button onClick={onExport} className="p-2 bg-gray-600 hover:bg-gray-500 rounded" title="Export">
              <Download className="w-4 h-4" />
            </button>
          </div>
          
          <div className="w-px h-8 bg-gray-600" />
          
          {/* History */}
          <div className="flex items-center space-x-1">
            <button 
              onClick={onUndo} 
              disabled={!canUndo}
              className={`p-2 rounded ${canUndo ? 'bg-gray-600 hover:bg-gray-500' : 'bg-gray-700 opacity-50 cursor-not-allowed'}`}
              title="Undo"
            >
              <Undo className="w-4 h-4" />
            </button>
            <button 
              onClick={onRedo} 
              disabled={!canRedo}
              className={`p-2 rounded ${canRedo ? 'bg-gray-600 hover:bg-gray-500' : 'bg-gray-700 opacity-50 cursor-not-allowed'}`}
              title="Redo"
            >
              <Redo className="w-4 h-4" />
            </button>
          </div>
          
          <div className="w-px h-8 bg-gray-600" />
          
          {/* Selection actions */}
          {hasSelection && (
            <div className="flex items-center space-x-1">
              <button onClick={onCopy} className="p-2 bg-gray-600 hover:bg-gray-500 rounded" title="Copy">
                <Copy className="w-4 h-4" />
              </button>
              <button onClick={onDelete} className="p-2 bg-red-600 hover:bg-red-500 rounded" title="Delete">
                <Trash2 className="w-4 h-4" />
              </button>
              
              {selectedCount > 1 && (
                <>
                  <button onClick={onGroup} className="p-2 bg-gray-600 hover:bg-gray-500 rounded" title="Group">
                    <Group className="w-4 h-4" />
                  </button>
                  <button onClick={onUngroup} className="p-2 bg-gray-600 hover:bg-gray-500 rounded" title="Ungroup">
                    <Ungroup className="w-4 h-4" />
                  </button>
                </>
              )}
              
              <div className="relative">
                <button 
                  onClick={() => setShowAlignMenu(!showAlignMenu)}
                  className="p-2 bg-gray-600 hover:bg-gray-500 rounded"
                  title="Align & Distribute"
                >
                  <AlignLeft className="w-4 h-4" />
                </button>
                {renderAlignMenu()}
              </div>
              
              <div className="relative">
                <button 
                  onClick={() => setShowArrangeMenu(!showArrangeMenu)}
                  className="p-2 bg-gray-600 hover:bg-gray-500 rounded"
                  title="Arrange"
                >
                  <Layers className="w-4 h-4" />
                </button>
                {renderArrangeMenu()}
              </div>
            </div>
          )}
        </div>

        {/* Right side - View controls */}
        <div className="flex items-center space-x-4">
          {/* Zoom controls */}
          <div className="flex items-center space-x-2">
            <button onClick={onZoomOut} className="p-2 bg-gray-600 hover:bg-gray-500 rounded" title="Zoom Out">
              <ZoomOut className="w-4 h-4" />
            </button>
            <div className="flex items-center space-x-2">
              <input
                type="range"
                min="10"
                max="500"
                value={zoom * 100}
                onChange={(e) => onZoomChange(parseFloat(e.target.value) / 100)}
                className="w-20"
              />
              <span className="text-sm text-gray-300 w-12">
                {Math.round(zoom * 100)}%
              </span>
            </div>
            <button onClick={onZoomIn} className="p-2 bg-gray-600 hover:bg-gray-500 rounded" title="Zoom In">
              <ZoomIn className="w-4 h-4" />
            </button>
            <button onClick={onZoomReset} className="p-2 bg-gray-600 hover:bg-gray-500 rounded" title="Reset Zoom">
              <ZoomReset className="w-4 h-4" />
            </button>
          </div>
          
          <div className="w-px h-8 bg-gray-600" />
          
          {/* View toggles */}
          <div className="flex items-center space-x-1">
            <button onClick={onToggleGrid} className="p-2 bg-gray-600 hover:bg-gray-500 rounded" title="Toggle Grid">
              <Grid3X3 className="w-4 h-4" />
            </button>
            <button onClick={onToggleRulers} className="p-2 bg-gray-600 hover:bg-gray-500 rounded" title="Toggle Rulers">
              <Ruler className="w-4 h-4" />
            </button>
            <button onClick={onShowLayers} className="p-2 bg-gray-600 hover:bg-gray-500 rounded" title="Layers">
              <Layers className="w-4 h-4" />
            </button>
            <button onClick={onShowColorPicker} className="p-2 bg-gray-600 hover:bg-gray-500 rounded" title="Color Picker">
              <Palette className="w-4 h-4" />
            </button>
          </div>
          
          <div className="w-px h-8 bg-gray-600" />
          
          {/* Settings */}
          <div className="flex items-center space-x-1">
            <button onClick={onShowSettings} className="p-2 bg-gray-600 hover:bg-gray-500 rounded" title="Settings">
              <Settings className="w-4 h-4" />
            </button>
            <button onClick={onShowHelp} className="p-2 bg-gray-600 hover:bg-gray-500 rounded" title="Help">
              <HelpCircle className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
      
      {/* Selection info */}
      {hasSelection && (
        <div className="mt-2 text-sm text-gray-400">
          {selectedCount === 1 ? '1 element selected' : `${selectedCount} elements selected`}
        </div>
      )}
    </div>
  );
};

export default Toolbar;