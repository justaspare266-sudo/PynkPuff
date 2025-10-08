/**
 * Comprehensive Shape System
 * Integrates shape library and custom shape creation
 */

import React, { useState, useCallback, useRef, useEffect } from 'react';
import { 
  Square, 
  Circle, 
  Triangle, 
  Star, 
  Heart,
  Diamond,
  Hexagon,
  Pentagon,
  Octagon,
  Plus,
  Minus,
  X,
  ArrowUp,
  ArrowDown,
  ArrowLeft,
  ArrowRight,
  ChevronUp,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Play,
  Pause,
  Square as Stop,
  Settings,
  Download,
  Upload,
  Save,
  RotateCcw,
  Eye,
  EyeOff,
  Copy,
  Check,
  Search,
  Filter,
  SortAsc,
  SortDesc,
  Star as StarIcon,
  StarOff,
  Trash2,
  Edit,
  Plus as PlusIcon,
  PenTool,
  Eraser,
  Move,
  RotateCw,
  Scale,
  Crop,
  Layers,
  Grid3X3,
  AlignLeft,
  AlignCenter,
  AlignRight,
  AlignJustify,
  ArrowUp as ArrowUpIcon,
  ArrowDown as ArrowDownIcon,
  ArrowLeft as ArrowLeftIcon,
  ArrowRight as ArrowRightIcon,
  Pipette,
  Download as DownloadIcon,
  Save as SaveIcon,
  Undo2,
  Redo2,
  Settings as SettingsIcon,
  Eye as EyeIcon,
  EyeOff as EyeOffIcon,
  Trash2 as Trash2Icon,
  Copy as CopyIcon,
  Scissors,
  MousePointer,
  Hand,
  FileText,
  Image as ImageIcon,
  FolderOpen,
  RotateCcw as RotateCcwIcon,
  ZoomIn,
  ZoomOut,
  Maximize2,
  PenTool as PenToolIcon,
  Eraser as EraserIcon,
  Droplets,
  Palette,
  Play as PlayIcon,
  X as XIcon
} from 'lucide-react';
import ShapeLibrary, { ShapeDefinition } from './ShapeLibrary';
import CustomShapeCreator from './CustomShapeCreator';

export interface ShapeSystemProps {
  onShapeSelect: (shape: ShapeDefinition) => void;
  onClose?: () => void;
  className?: string;
}

const ShapeSystem: React.FC<ShapeSystemProps> = ({
  onShapeSelect,
  onClose,
  className = ''
}) => {
  const [activeTab, setActiveTab] = useState<'library' | 'creator' | 'favorites' | 'settings'>('library');
  const [showSystem, setShowSystem] = useState(true);
  const [shapes, setShapes] = useState<ShapeDefinition[]>([]);
  const [favoriteShapes, setFavoriteShapes] = useState<Set<string>>(new Set());
  const [copiedData, setCopiedData] = useState<string | null>(null);
  const [showSettings, setShowSettings] = useState(false);
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Handle shape select
  const handleShapeSelect = useCallback((shape: ShapeDefinition) => {
    onShapeSelect(shape);
  }, [onShapeSelect]);

  // Handle shape favorite toggle
  const handleShapeFavorite = useCallback((shapeId: string) => {
    setFavoriteShapes(prev => {
      const newSet = new Set(prev);
      if (newSet.has(shapeId)) {
        newSet.delete(shapeId);
      } else {
        newSet.add(shapeId);
      }
      return newSet;
    });
  }, []);

  // Handle shape copy
  const handleShapeCopy = useCallback((shape: ShapeDefinition) => {
    const data = {
      name: shape.name,
      category: shape.category,
      type: shape.type,
      data: shape.data,
      preview: shape.preview,
      tags: shape.tags
    };
    
    navigator.clipboard.writeText(JSON.stringify(data, null, 2));
    setCopiedData(shape.id);
    setTimeout(() => setCopiedData(null), 2000);
  }, []);

  // Handle shape export
  const handleShapeExport = useCallback(() => {
    const data = {
      shapes: shapes.map(shape => ({
        name: shape.name,
        category: shape.category,
        type: shape.type,
        data: shape.data,
        preview: shape.preview,
        tags: shape.tags,
        isCustom: shape.isCustom,
        isFavorite: shape.isFavorite
      })),
      exportedAt: new Date().toISOString()
    };
    
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'shape-system.json';
    a.click();
    URL.revokeObjectURL(url);
  }, [shapes]);

  // Handle shape import
  const handleShapeImport = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = JSON.parse(e.target?.result as string);
        if (data.shapes) {
          const importedShapes = data.shapes.map((shape: any) => ({
            ...shape,
            id: `shape-${Date.now()}-${Math.random()}`,
            isCustom: true,
            createdAt: new Date(),
            updatedAt: new Date()
          }));
          setShapes(prev => [...importedShapes, ...prev]);
        }
      } catch (error) {
        console.error('Failed to import shapes:', error);
      }
    };
    reader.readAsText(file);
  }, []);

  // Clear all shapes
  const clearAllShapes = useCallback(() => {
    setShapes([]);
  }, []);

  // Reset to defaults
  const resetToDefaults = useCallback(() => {
    setShapes([]);
    setFavoriteShapes(new Set());
  }, []);

  if (!showSystem) {
    return (
      <div className={`absolute top-2 left-2 z-20 ${className}`}>
        <button
          onClick={() => setShowSystem(true)}
          className="p-2 bg-blue-600 text-white rounded shadow-lg hover:bg-blue-700"
          title="Show Shape System"
        >
          <Square size={20} />
        </button>
      </div>
    );
  }

  return (
    <div className={`absolute inset-0 z-10 ${className}`}>
      {/* Header */}
      <div className="absolute top-2 left-2 right-2 z-20 bg-white rounded-lg shadow-lg border border-gray-200 p-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <h3 className="text-lg font-semibold flex items-center">
              <Square size={20} className="mr-2" />
              Shape System
            </h3>
            
            {/* Tabs */}
            <div className="flex space-x-1">
              {[
                { id: 'library', label: 'Library', icon: Square },
                { id: 'creator', label: 'Creator', icon: PenTool },
                { id: 'favorites', label: 'Favorites', icon: StarIcon },
                { id: 'settings', label: 'Settings', icon: Settings }
              ].map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`flex items-center space-x-2 px-3 py-1 rounded text-sm ${
                    activeTab === tab.id 
                      ? 'bg-blue-100 text-blue-700' 
                      : 'text-gray-600 hover:text-gray-800'
                  }`}
                >
                  <tab.icon size={14} />
                  <span>{tab.label}</span>
                </button>
              ))}
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setCopiedData('system')}
              className="p-2 text-gray-500 hover:text-gray-700"
              title="Copy data"
            >
              {copiedData === 'system' ? <Check size={16} /> : <Copy size={16} />}
            </button>
            <button
              onClick={handleShapeExport}
              className="p-2 text-gray-500 hover:text-gray-700"
              title="Export shapes"
            >
              <Download size={16} />
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept=".json"
              onChange={handleShapeImport}
              className="hidden"
            />
            <button
              onClick={() => fileInputRef.current?.click()}
              className="p-2 text-gray-500 hover:text-gray-700"
              title="Import shapes"
            >
              <Upload size={16} />
            </button>
            <button
              onClick={resetToDefaults}
              className="p-2 text-gray-500 hover:text-gray-700"
              title="Reset to defaults"
            >
              <RotateCcw size={16} />
            </button>
            <button
              onClick={clearAllShapes}
              className="p-2 text-gray-500 hover:text-gray-700"
              title="Clear all shapes"
            >
              <Trash2 size={16} />
            </button>
            <button
              onClick={() => setShowSystem(false)}
              className="p-2 text-gray-500 hover:text-gray-700"
              title="Hide system"
            >
              <X size={16} />
            </button>
            {onClose && (
              <button
                onClick={onClose}
                className="p-2 text-gray-500 hover:text-gray-700"
                title="Close system"
              >
                <X size={16} />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="absolute top-16 left-2 right-2 bottom-2 z-10">
        {activeTab === 'library' && (
          <ShapeLibrary
            onShapeSelect={handleShapeSelect}
            className="h-full"
          />
        )}
        
        {activeTab === 'creator' && (
          <CustomShapeCreator
            onShapeCreate={(shape) => {
              setShapes(prev => [shape, ...prev]);
              onShapeSelect(shape);
            }}
            className="h-full"
          />
        )}
        
        {activeTab === 'favorites' && (
          <div className="h-full bg-white rounded-lg shadow-lg border border-gray-200 p-4">
            <h4 className="font-semibold mb-4">Favorite Shapes</h4>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Total Favorites: {favoriteShapes.size}</span>
                <button
                  onClick={() => setFavoriteShapes(new Set())}
                  className="px-3 py-1 text-sm bg-red-100 text-red-700 rounded hover:bg-red-200"
                >
                  Clear All
                </button>
              </div>
              <div className="space-y-1 max-h-64 overflow-y-auto">
                {shapes
                  .filter(shape => favoriteShapes.has(shape.id))
                  .map(shape => (
                    <div
                      key={shape.id}
                      className="flex items-center justify-between p-2 bg-gray-50 rounded text-sm"
                    >
                      <div className="flex items-center space-x-2">
                        <div className="w-6 h-6 bg-gray-200 rounded flex items-center justify-center">
                          <Square size={12} />
                        </div>
                        <span>{shape.name}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <button
                          onClick={() => handleShapeCopy(shape)}
                          className="p-1 text-gray-500 hover:text-gray-700"
                          title="Copy shape"
                        >
                          {copiedData === shape.id ? <Check size={12} /> : <Copy size={12} />}
                        </button>
                        <button
                          onClick={() => handleShapeSelect(shape)}
                          className="p-1 text-gray-500 hover:text-gray-700"
                          title="Select shape"
                        >
                          <Eye size={12} />
                        </button>
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          </div>
        )}
        
        {activeTab === 'settings' && (
          <div className="h-full bg-white rounded-lg shadow-lg border border-gray-200 p-4">
            <h4 className="font-semibold mb-4">Shape System Settings</h4>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <h5 className="font-medium mb-2">Display Settings</h5>
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="showPreviews"
                      className="rounded"
                      defaultChecked
                    />
                    <label htmlFor="showPreviews" className="text-sm text-gray-700">Show Previews</label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="autoCategorize"
                      className="rounded"
                      defaultChecked
                    />
                    <label htmlFor="autoCategorize" className="text-sm text-gray-700">Auto-categorize</label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="showTags"
                      className="rounded"
                      defaultChecked
                    />
                    <label htmlFor="showTags" className="text-sm text-gray-700">Show Tags</label>
                  </div>
                </div>
              </div>
              
              <div>
                <h5 className="font-medium mb-2">Creator Settings</h5>
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="snapToGrid"
                      className="rounded"
                      defaultChecked
                    />
                    <label htmlFor="snapToGrid" className="text-sm text-gray-700">Snap to Grid</label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="showGrid"
                      className="rounded"
                      defaultChecked
                    />
                    <label htmlFor="showGrid" className="text-sm text-gray-700">Show Grid</label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="autoSave"
                      className="rounded"
                      defaultChecked
                    />
                    <label htmlFor="autoSave" className="text-sm text-gray-700">Auto-save</label>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ShapeSystem;
