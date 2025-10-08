import React, { useState, useCallback } from 'react';
import { Plus, Copy, Trash2, Eye, EyeOff, Lock, Unlock, MoreHorizontal } from 'lucide-react';

export interface Artboard {
  id: string;
  name: string;
  width: number;
  height: number;
  visible: boolean;
  locked: boolean;
  thumbnail?: string;
  layers: any[];
  createdAt: Date;
  updatedAt: Date;
}

interface ArtboardManagerProps {
  artboards: Artboard[];
  activeArtboardId: string;
  onArtboardSelect: (id: string) => void;
  onArtboardCreate: (artboard: Omit<Artboard, 'id' | 'createdAt' | 'updatedAt'>) => void;
  onArtboardUpdate: (id: string, updates: Partial<Artboard>) => void;
  onArtboardDelete: (id: string) => void;
  onArtboardDuplicate: (id: string) => void;
  className?: string;
}

export function ArtboardManager({
  artboards,
  activeArtboardId,
  onArtboardSelect,
  onArtboardCreate,
  onArtboardUpdate,
  onArtboardDelete,
  onArtboardDuplicate,
  className = ''
}: ArtboardManagerProps) {
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newArtboardName, setNewArtboardName] = useState('');
  const [newArtboardSize, setNewArtboardSize] = useState({ width: 800, height: 600 });

  const presets = [
    { name: 'Instagram Post', width: 1080, height: 1080 },
    { name: 'Instagram Story', width: 1080, height: 1920 },
    { name: 'Facebook Post', width: 1200, height: 630 },
    { name: 'Twitter Header', width: 1500, height: 500 },
    { name: 'YouTube Thumbnail', width: 1280, height: 720 },
    { name: 'Custom', width: 800, height: 600 }
  ];

  const handleCreateArtboard = useCallback(() => {
    if (!newArtboardName.trim()) return;
    
    onArtboardCreate({
      name: newArtboardName,
      width: newArtboardSize.width,
      height: newArtboardSize.height,
      visible: true,
      locked: false,
      layers: []
    });
    
    setNewArtboardName('');
    setShowCreateForm(false);
  }, [newArtboardName, newArtboardSize, onArtboardCreate]);

  return (
    <div className={`bg-white border-r border-gray-200 ${className}`}>
      {/* Header */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-semibold text-gray-900">Artboards</h3>
          <button
            onClick={() => setShowCreateForm(true)}
            className="p-1 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded"
            title="Create New Artboard"
          >
            <Plus size={16} />
          </button>
        </div>
        
        {/* Create Form */}
        {showCreateForm && (
          <div className="space-y-3 p-3 bg-gray-50 rounded-lg">
            <input
              type="text"
              placeholder="Artboard name"
              value={newArtboardName}
              onChange={(e) => setNewArtboardName(e.target.value)}
              className="w-full px-2 py-1 text-sm border border-gray-300 rounded"
              autoFocus
            />
            
            <select
              onChange={(e) => {
                const preset = presets[parseInt(e.target.value)];
                if (preset) {
                  setNewArtboardSize({ width: preset.width, height: preset.height });
                }
              }}
              className="w-full px-2 py-1 text-sm border border-gray-300 rounded"
            >
              {presets.map((preset, i) => (
                <option key={i} value={i}>
                  {preset.name} ({preset.width}×{preset.height})
                </option>
              ))}
            </select>
            
            <div className="flex space-x-2">
              <button
                onClick={handleCreateArtboard}
                disabled={!newArtboardName.trim()}
                className="flex-1 px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
              >
                Create
              </button>
              <button
                onClick={() => setShowCreateForm(false)}
                className="px-3 py-1 text-sm text-gray-600 hover:text-gray-800"
              >
                Cancel
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Artboard List */}
      <div className="flex-1 overflow-y-auto">
        {artboards.map((artboard) => (
          <div
            key={artboard.id}
            className={`p-3 border-b border-gray-100 cursor-pointer hover:bg-gray-50 ${
              activeArtboardId === artboard.id ? 'bg-blue-50 border-l-4 border-l-blue-500' : ''
            }`}
            onClick={() => onArtboardSelect(artboard.id)}
          >
            {/* Thumbnail */}
            <div className="w-full h-16 bg-gray-100 rounded mb-2 flex items-center justify-center">
              {artboard.thumbnail ? (
                <img 
                  src={artboard.thumbnail} 
                  alt={artboard.name}
                  className="w-full h-full object-cover rounded"
                />
              ) : (
                <div className="text-xs text-gray-400">
                  {artboard.width}×{artboard.height}
                </div>
              )}
            </div>
            
            {/* Info */}
            <div className="flex items-center justify-between">
              <div className="flex-1 min-w-0">
                <h4 className="text-sm font-medium text-gray-900 truncate">
                  {artboard.name}
                </h4>
                <p className="text-xs text-gray-500">
                  {artboard.width}×{artboard.height} • {artboard.layers.length} layers
                </p>
              </div>
              
              {/* Controls */}
              <div className="flex items-center space-x-1 ml-2">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onArtboardUpdate(artboard.id, { visible: !artboard.visible });
                  }}
                  className="p-1 text-gray-400 hover:text-gray-600"
                  title={artboard.visible ? 'Hide' : 'Show'}
                >
                  {artboard.visible ? <Eye size={12} /> : <EyeOff size={12} />}
                </button>
                
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onArtboardUpdate(artboard.id, { locked: !artboard.locked });
                  }}
                  className="p-1 text-gray-400 hover:text-gray-600"
                  title={artboard.locked ? 'Unlock' : 'Lock'}
                >
                  {artboard.locked ? <Lock size={12} /> : <Unlock size={12} />}
                </button>
                
                <div className="relative group">
                  <button className="p-1 text-gray-400 hover:text-gray-600">
                    <MoreHorizontal size={12} />
                  </button>
                  
                  {/* Dropdown Menu */}
                  <div className="absolute right-0 top-full mt-1 w-32 bg-white border border-gray-200 rounded-lg shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-50">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onArtboardDuplicate(artboard.id);
                      }}
                      className="w-full px-3 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center space-x-2"
                    >
                      <Copy size={12} />
                      <span>Duplicate</span>
                    </button>
                    
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        if (artboards.length > 1) {
                          onArtboardDelete(artboard.id);
                        }
                      }}
                      disabled={artboards.length <= 1}
                      className="w-full px-3 py-2 text-left text-sm text-red-600 hover:bg-red-50 flex items-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <Trash2 size={12} />
                      <span>Delete</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
      
      {/* Footer */}
      <div className="p-3 border-t border-gray-200 text-xs text-gray-500">
        {artboards.length} artboard{artboards.length !== 1 ? 's' : ''}
      </div>
    </div>
  );
}