'use client';

import React, { useState, useRef, useEffect, useCallback, forwardRef, useImperativeHandle } from 'react';
import { Layers, Eye, EyeOff, Lock, Unlock, Trash2, Copy, Move, Square, Circle, Type, Image as ImageIcon, Droplets, ArrowUp, ArrowDown, Plus, Minus, Group, Ungroup, Settings, Zap, Palette, Star, Triangle, Hexagon } from 'lucide-react';

// Types
export interface LayerElement {
  id: string;
  type: 'text' | 'image' | 'gradient' | 'rect' | 'circle' | 'line' | 'arrow' | 'star' | 'regularPolygon' | 'wedge' | 'ring' | 'arc' | 'path' | 'group';
  name: string;
  x: number;
  y: number;
  width: number;
  height: number;
  visible: boolean;
  locked: boolean;
  opacity: number;
  zIndex: number;
  isSelected: boolean;
  isGrouped: boolean;
  parentGroupId?: string;
  children?: string[];
  
  // Element-specific properties
  text?: string;
  src?: string;
  fill?: string;
  stroke?: string;
  strokeWidth?: number;
  
  // Performance properties
  isCached: boolean;
  perfectDrawEnabled: boolean;
  listening: boolean;
  
  // State tracking
  boundaryState: {
    isWithinBounds: boolean;
    violationType: 'x' | 'y' | 'width' | 'height' | null;
  };
}

interface LayerManagerProps {
  layers: LayerElement[];
  onLayerReorder: (newLayers: LayerElement[]) => void;
  onLayerToggle: (elementId: string, visible: boolean) => void;
  onLayerLock: (elementId: string, locked: boolean) => void;
  onLayerSelect: (elementId: string) => void;
  onLayerDelete: (elementId: string) => void;
  onLayerDuplicate: (elementId: string) => void;
  onLayerGroup: (elementIds: string[]) => void;
  onLayerUngroup: (groupId: string) => void;
  selectedElementIds: string[];
  onElementSelect: (elementId: string) => void;
}

export interface LayerManagerRef {
  addLayer: (layer: Omit<LayerElement, 'id'>) => void;
  updateLayer: (id: string, updates: Partial<LayerElement>) => void;
  deleteLayer: (id: string) => void;
  duplicateLayer: (id: string) => void;
  groupLayers: (ids: string[]) => void;
  ungroupLayer: (groupId: string) => void;
  moveLayerUp: (id: string) => void;
  moveLayerDown: (id: string) => void;
  toggleLayerVisibility: (id: string) => void;
  toggleLayerLock: (id: string) => void;
  selectLayer: (id: string) => void;
}

const LayerManager = forwardRef<LayerManagerRef, LayerManagerProps>(({
  layers,
  onLayerReorder,
  onLayerToggle,
  onLayerLock,
  onLayerSelect,
  onLayerDelete,
  onLayerDuplicate,
  onLayerGroup,
  onLayerUngroup,
  selectedElementIds,
  onElementSelect
}, ref) => {
  // UI state
  const [showAdvancedSettings, setShowAdvancedSettings] = useState(false);
  const [draggedLayerId, setDraggedLayerId] = useState<string | null>(null);
  const [dragOverLayerId, setDragOverLayerId] = useState<string | null>(null);
  const [showGroupOptions, setShowGroupOptions] = useState(false);
  const [selectedLayersForGroup, setSelectedLayersForGroup] = useState<string[]>([]);

  // Expose methods to parent
  useImperativeHandle(ref, () => ({
    addLayer: (layer: Omit<LayerElement, 'id'>) => {
      // This would be handled by the parent component
    },
    updateLayer: (id: string, updates: Partial<LayerElement>) => {
      // This would be handled by the parent component
    },
    deleteLayer: (id: string) => {
      onLayerDelete(id);
    },
    duplicateLayer: (id: string) => {
      onLayerDuplicate(id);
    },
    groupLayers: (ids: string[]) => {
      onLayerGroup(ids);
    },
    ungroupLayer: (groupId: string) => {
      onLayerUngroup(groupId);
    },
    moveLayerUp: (id: string) => {
      const currentIndex = layers.findIndex(layer => layer.id === id);
      if (currentIndex < layers.length - 1) {
        const newLayers = [...layers];
        [newLayers[currentIndex], newLayers[currentIndex + 1]] = [newLayers[currentIndex + 1], newLayers[currentIndex]];
        onLayerReorder(newLayers);
      }
    },
    moveLayerDown: (id: string) => {
      const currentIndex = layers.findIndex(layer => layer.id === id);
      if (currentIndex > 0) {
        const newLayers = [...layers];
        [newLayers[currentIndex], newLayers[currentIndex - 1]] = [newLayers[currentIndex - 1], newLayers[currentIndex]];
        onLayerReorder(newLayers);
      }
    },
    toggleLayerVisibility: (id: string) => {
      const layer = layers.find(l => l.id === id);
      if (layer) {
        onLayerToggle(id, !layer.visible);
      }
    },
    toggleLayerLock: (id: string) => {
      const layer = layers.find(l => l.id === id);
      if (layer) {
        onLayerLock(id, !layer.locked);
      }
    },
    selectLayer: (id: string) => {
      onLayerSelect(id);
    }
  }));

  // Get icon for layer type
  const getLayerIcon = (type: string) => {
    switch (type) {
      case 'text': return Type;
      case 'image': return ImageIcon;
      case 'gradient': return Droplets;
      case 'rect': return Square;
      case 'circle': return Circle;
      case 'line': return Zap;
      case 'arrow': return ArrowUp;
      case 'star': return Star;
      case 'regularPolygon': return Hexagon;
      case 'wedge': return Triangle;
      case 'ring': return Circle;
      case 'arc': return Circle;
      case 'path': return Zap;
      case 'group': return Group;
      default: return Square;
    }
  };

  // Handle drag start
  const handleDragStart = useCallback((e: React.DragEvent, layerId: string) => {
    setDraggedLayerId(layerId);
    e.dataTransfer.effectAllowed = 'move';
  }, []);

  // Handle drag over
  const handleDragOver = useCallback((e: React.DragEvent, layerId: string) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    setDragOverLayerId(layerId);
  }, []);

  // Handle drag leave
  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragOverLayerId(null);
  }, []);

  // Handle drop
  const handleDrop = useCallback((e: React.DragEvent, targetLayerId: string) => {
    e.preventDefault();
    
    if (draggedLayerId && draggedLayerId !== targetLayerId) {
      const draggedIndex = layers.findIndex(layer => layer.id === draggedLayerId);
      const targetIndex = layers.findIndex(layer => layer.id === targetLayerId);
      
      if (draggedIndex !== -1 && targetIndex !== -1) {
        const newLayers = [...layers];
        const [draggedLayer] = newLayers.splice(draggedIndex, 1);
        newLayers.splice(targetIndex, 0, draggedLayer);
        onLayerReorder(newLayers);
      }
    }
    
    setDraggedLayerId(null);
    setDragOverLayerId(null);
  }, [draggedLayerId, layers, onLayerReorder]);

  // Handle layer selection
  const handleLayerSelect = useCallback((layerId: string, multiSelect: boolean = false) => {
    if (multiSelect) {
      if (selectedElementIds.includes(layerId)) {
        onElementSelect(layerId); // Deselect if already selected
      } else {
        onElementSelect(layerId); // Add to selection
      }
    } else {
      onElementSelect(layerId); // Single select
    }
  }, [selectedElementIds, onElementSelect]);

  // Handle visibility toggle
  const handleVisibilityToggle = useCallback((layerId: string) => {
    const layer = layers.find(l => l.id === layerId);
    if (layer) {
      onLayerToggle(layerId, !layer.visible);
    }
  }, [layers, onLayerToggle]);

  // Handle lock toggle
  const handleLockToggle = useCallback((layerId: string) => {
    const layer = layers.find(l => l.id === layerId);
    if (layer) {
      onLayerLock(layerId, !layer.locked);
    }
  }, [layers, onLayerLock]);

  // Handle layer duplicate
  const handleDuplicate = useCallback((layerId: string) => {
    onLayerDuplicate(layerId);
  }, [onLayerDuplicate]);

  // Handle layer delete
  const handleDelete = useCallback((layerId: string) => {
    onLayerDelete(layerId);
  }, [onLayerDelete]);

  // Handle group creation
  const handleGroupLayers = useCallback(() => {
    if (selectedElementIds.length > 1) {
      onLayerGroup(selectedElementIds);
      setShowGroupOptions(false);
    }
  }, [selectedElementIds, onLayerGroup]);

  // Handle ungroup
  const handleUngroup = useCallback((groupId: string) => {
    onLayerUngroup(groupId);
  }, [onLayerUngroup]);

  // Sort layers by zIndex (highest first)
  const sortedLayers = [...layers].sort((a, b) => b.zIndex - a.zIndex);

  return (
    <div className="layer-manager space-y-4">
      <h3 className="text-lg font-semibold flex items-center">
        <Layers className="w-5 h-5 mr-2" />
        Layer Manager
      </h3>

      {/* Layer Actions */}
      <div className="flex space-x-2">
        <button
          className="flex-1 p-2 bg-blue-600 hover:bg-blue-700 rounded text-sm"
          onClick={() => setShowGroupOptions(!showGroupOptions)}
          disabled={selectedElementIds.length < 2}
          title="Group Selected Layers"
        >
          <Group className="w-4 h-4 inline mr-1" />
          Group
        </button>
        <button
          className="flex-1 p-2 bg-gray-600 hover:bg-gray-500 rounded text-sm"
          onClick={() => setShowAdvancedSettings(!showAdvancedSettings)}
          title="Advanced Settings"
        >
          <Settings className="w-4 h-4 inline mr-1" />
          Settings
        </button>
      </div>

      {/* Group Options */}
      {showGroupOptions && (
        <div className="bg-gray-800 p-3 rounded">
          <div className="text-sm font-medium mb-2">Group Layers</div>
          <div className="text-xs text-gray-400 mb-2">
            {selectedElementIds.length} layer(s) selected
          </div>
          <div className="flex space-x-2">
            <button
              className="flex-1 p-2 bg-green-600 hover:bg-green-700 rounded text-sm"
              onClick={handleGroupLayers}
            >
              Create Group
            </button>
            <button
              className="flex-1 p-2 bg-gray-600 hover:bg-gray-500 rounded text-sm"
              onClick={() => setShowGroupOptions(false)}
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Layers List */}
      <div className="layers-list space-y-1 max-h-96 overflow-y-auto">
        {sortedLayers.map((layer, index) => {
          const IconComponent = getLayerIcon(layer.type);
          const isSelected = selectedElementIds.includes(layer.id);
          const isDragged = draggedLayerId === layer.id;
          const isDragOver = dragOverLayerId === layer.id;
          
          return (
            <div
              key={layer.id}
              className={`layer-item p-2 rounded cursor-pointer transition-colors ${
                isSelected ? 'bg-blue-600' : 'bg-gray-700 hover:bg-gray-600'
              } ${isDragged ? 'opacity-50' : ''} ${isDragOver ? 'border-2 border-blue-400' : ''}`}
              draggable
              onDragStart={(e) => handleDragStart(e, layer.id)}
              onDragOver={(e) => handleDragOver(e, layer.id)}
              onDragLeave={handleDragLeave}
              onDrop={(e) => handleDrop(e, layer.id)}
              onClick={(e) => handleLayerSelect(layer.id, e.ctrlKey || e.metaKey)}
            >
              <div className="flex items-center space-x-2">
                {/* Layer Icon */}
                <IconComponent className="w-4 h-4 text-gray-300" />
                
                {/* Layer Name */}
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium truncate">
                    {layer.name || `${layer.type} ${index + 1}`}
                  </div>
                  <div className="text-xs text-gray-400">
                    {layer.type} • {Math.round(layer.opacity * 100)}%
                  </div>
                </div>
                
                {/* Layer Controls */}
                <div className="flex items-center space-x-1">
                  {/* Visibility Toggle */}
                  <button
                    className="p-1 hover:bg-gray-500 rounded"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleVisibilityToggle(layer.id);
                    }}
                    title={layer.visible ? 'Hide Layer' : 'Show Layer'}
                  >
                    {layer.visible ? (
                      <Eye className="w-3 h-3 text-gray-300" />
                    ) : (
                      <EyeOff className="w-3 h-3 text-gray-500" />
                    )}
                  </button>
                  
                  {/* Lock Toggle */}
                  <button
                    className="p-1 hover:bg-gray-500 rounded"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleLockToggle(layer.id);
                    }}
                    title={layer.locked ? 'Unlock Layer' : 'Lock Layer'}
                  >
                    {layer.locked ? (
                      <Lock className="w-3 h-3 text-gray-300" />
                    ) : (
                      <Unlock className="w-3 h-3 text-gray-500" />
                    )}
                  </button>
                  
                  {/* Layer Actions */}
                  <div className="flex items-center space-x-1">
                    <button
                      className="p-1 hover:bg-gray-500 rounded"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDuplicate(layer.id);
                      }}
                      title="Duplicate Layer"
                    >
                      <Copy className="w-3 h-3 text-gray-300" />
                    </button>
                    
                    {layer.type === 'group' && (
                      <button
                        className="p-1 hover:bg-gray-500 rounded"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleUngroup(layer.id);
                        }}
                        title="Ungroup Layer"
                      >
                        <Ungroup className="w-3 h-3 text-gray-300" />
                      </button>
                    )}
                    
                    <button
                      className="p-1 hover:bg-red-500 rounded"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDelete(layer.id);
                      }}
                      title="Delete Layer"
                    >
                      <Trash2 className="w-3 h-3 text-gray-300" />
                    </button>
                  </div>
                </div>
              </div>
              
              {/* Layer Properties */}
              {showAdvancedSettings && (
                <div className="mt-2 pt-2 border-t border-gray-600">
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div>
                      <span className="text-gray-400">Position:</span>
                      <span className="ml-1">{Math.round(layer.x)}, {Math.round(layer.y)}</span>
                    </div>
                    <div>
                      <span className="text-gray-400">Size:</span>
                      <span className="ml-1">{Math.round(layer.width)} × {Math.round(layer.height)}</span>
                    </div>
                    <div>
                      <span className="text-gray-400">Z-Index:</span>
                      <span className="ml-1">{layer.zIndex}</span>
                    </div>
                    <div>
                      <span className="text-gray-400">Cached:</span>
                      <span className="ml-1">{layer.isCached ? 'Yes' : 'No'}</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Pruned extra sections for cleaner UI */}
    </div>
  );
});

LayerManager.displayName = 'LayerManager';

export default LayerManager;