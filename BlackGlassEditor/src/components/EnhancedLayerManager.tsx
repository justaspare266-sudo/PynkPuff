import React from 'react';
import { 
  Eye, 
  EyeOff, 
  Lock, 
  Unlock, 
  ArrowUp, 
  ArrowDown, 
  Copy, 
  Trash2, 
  Type, 
  Square, 
  Circle, 
  Image as ImageIcon, 
  Palette,
  X,
  Plus,
  Group,
  Ungroup,
  AlignJustify
} from 'lucide-react';

interface LayerItem {
  id: string;
  type: string;
  name?: string;
  visible: boolean;
  locked: boolean;
  x: number;
  y: number;
}

interface EnhancedLayerManagerProps {
  isOpen: boolean;
  onClose: () => void;
  layers: LayerItem[];
  selectedLayerId?: string;
  onLayerSelect: (layerId: string) => void;
  onLayerToggleVisibility: (layerId: string) => void;
  onLayerToggleLock: (layerId: string) => void;
  onLayerMoveUp: (layerId: string) => void;
  onLayerMoveDown: (layerId: string) => void;
  onLayerDuplicate: (layerId: string) => void;
  onLayerDelete: (layerId: string) => void;
  onLayerCreate: () => void;
  onLayerGroup: (layerIds: string[]) => void;
  onLayerUngroup: (layerId: string) => void;
}

export const EnhancedLayerManager: React.FC<EnhancedLayerManagerProps> = ({
  isOpen,
  onClose,
  layers,
  selectedLayerId,
  onLayerSelect,
  onLayerToggleVisibility,
  onLayerToggleLock,
  onLayerMoveUp,
  onLayerMoveDown,
  onLayerDuplicate,
  onLayerDelete,
  onLayerCreate,
  onLayerGroup,
  onLayerUngroup
}) => {
  if (!isOpen) return null;

  const getLayerIcon = (type: string) => {
    switch (type) {
      case 'text': return <Type className="w-4 h-4 text-blue-600" />;
      case 'rect': return <Square className="w-4 h-4 text-green-600" />;
      case 'circle': return <Circle className="w-4 h-4 text-purple-600" />;
      case 'image': return <ImageIcon className="w-4 h-4 text-orange-600" />;
      case 'video': return <ImageIcon className="w-4 h-4 text-red-600" />;
      default: return <Palette className="w-4 h-4 text-gray-600" />;
    }
  };

  const getLayerName = (layer: LayerItem) => {
    if (layer.name) return layer.name;
    if (layer.type === 'text') return 'Text Layer';
    return `${layer.type.charAt(0).toUpperCase() + layer.type.slice(1)} Layer`;
  };

  return (
    <div className="fixed top-4 right-4 z-50 w-80 bg-white rounded-lg shadow-lg border max-h-96 flex flex-col">
      <div className="p-4 border-b flex-shrink-0">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold">Layer Manager</h3>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>
      
      <div className="p-4 space-y-4 flex-1 overflow-hidden">
        {/* Layer Controls */}
        <div className="flex items-center space-x-2 flex-shrink-0">
          <button
            onClick={onLayerCreate}
            className="flex items-center space-x-1 px-3 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            <Plus className="w-4 h-4" />
            <span>New Layer</span>
          </button>
          
          <button
            onClick={() => selectedLayerId && onLayerDelete(selectedLayerId)}
            disabled={!selectedLayerId}
            className="flex items-center space-x-1 px-3 py-2 bg-red-600 text-white rounded hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Trash2 className="w-4 h-4" />
            <span>Delete</span>
          </button>
        </div>

        {/* Layer List */}
        <div className="space-y-2 flex-1 overflow-y-auto">
          {layers.map((layer, index) => (
            <div
              key={layer.id}
              className={`flex items-center space-x-2 p-2 rounded border cursor-pointer ${
                selectedLayerId === layer.id ? 'bg-blue-100 border-blue-300' : 'bg-gray-50 border-gray-200 hover:bg-gray-100'
              }`}
              onClick={() => onLayerSelect(layer.id)}
            >
              {/* Layer Icon */}
              <div className="flex-shrink-0">
                {getLayerIcon(layer.type)}
              </div>
              
              {/* Layer Info */}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">
                  {getLayerName(layer)}
                </p>
                <p className="text-xs text-gray-500">
                  {layer.type} • {Math.round(layer.x)}, {Math.round(layer.y)}
                </p>
              </div>
              
              {/* Layer Controls */}
              <div className="flex items-center space-x-1 flex-shrink-0">
                {/* Visibility Toggle */}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onLayerToggleVisibility(layer.id);
                  }}
                  className="p-1 hover:bg-gray-200 rounded"
                  title="Toggle Visibility"
                >
                  {layer.visible ? (
                    <Eye className="w-4 h-4 text-gray-600" />
                  ) : (
                    <EyeOff className="w-4 h-4 text-gray-400" />
                  )}
                </button>
                
                {/* Lock Toggle */}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onLayerToggleLock(layer.id);
                  }}
                  className="p-1 hover:bg-gray-200 rounded"
                  title="Toggle Lock"
                >
                  {layer.locked ? (
                    <Lock className="w-4 h-4 text-red-600" />
                  ) : (
                    <Unlock className="w-4 h-4 text-gray-600" />
                  )}
                </button>
                
                {/* Move Up */}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onLayerMoveUp(layer.id);
                  }}
                  disabled={index === 0}
                  className="p-1 hover:bg-gray-200 rounded disabled:opacity-50 disabled:cursor-not-allowed"
                  title="Move Up"
                >
                  <ArrowUp className="w-4 h-4 text-gray-600" />
                </button>
                
                {/* Move Down */}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onLayerMoveDown(layer.id);
                  }}
                  disabled={index === layers.length - 1}
                  className="p-1 hover:bg-gray-200 rounded disabled:opacity-50 disabled:cursor-not-allowed"
                  title="Move Down"
                >
                  <ArrowDown className="w-4 h-4 text-gray-600" />
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Layer Actions */}
        <div className="flex items-center space-x-2 pt-4 border-t flex-shrink-0">
          <button
            onClick={() => selectedLayerId && onLayerDuplicate(selectedLayerId)}
            disabled={!selectedLayerId}
            className="flex items-center space-x-1 px-3 py-2 bg-purple-600 text-white rounded hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Copy className="w-4 h-4" />
            <span>Duplicate</span>
          </button>
          
          <button
            onClick={() => console.log('Group layers')}
            className="flex items-center space-x-1 px-3 py-2 bg-green-600 text-white rounded hover:bg-green-700"
          >
            <Group className="w-4 h-4" />
            <span>Group</span>
          </button>
        </div>

        {/* Alignment Tools */}
        <div className="pt-4 border-t flex-shrink-0">
          <h4 className="text-sm font-medium text-gray-700 mb-2">Alignment</h4>
          <div className="grid grid-cols-3 gap-2">
            <button
              onClick={() => console.log('Align Left')}
              className="flex items-center justify-center space-x-1 px-2 py-1 bg-gray-100 hover:bg-gray-200 rounded text-xs"
            >
              <AlignJustify className="w-3 h-3" />
              <span>Left</span>
            </button>
            <button
              onClick={() => console.log('Align Center')}
              className="flex items-center justify-center space-x-1 px-2 py-1 bg-gray-100 hover:bg-gray-200 rounded text-xs"
            >
              <AlignJustify className="w-3 h-3" />
              <span>Center</span>
            </button>
            <button
              onClick={() => console.log('Align Right')}
              className="flex items-center justify-center space-x-1 px-2 py-1 bg-gray-100 hover:bg-gray-200 rounded text-xs"
            >
              <AlignJustify className="w-3 h-3" />
              <span>Right</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};