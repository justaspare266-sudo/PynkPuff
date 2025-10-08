import React, { useState, useCallback } from 'react';
import { Folder, FolderOpen, Plus, Trash2, Search, Grid3X3, List } from 'lucide-react';

interface AssetFolder {
  id: string;
  name: string;
  assets: string[];
}

interface EnhancedAssetManagerProps {
  assets: Array<{
    id: string;
    name: string;
    type: 'image' | 'video' | 'icon';
    url: string;
    thumbnail?: string;
  }>;
  onAssetSelect: (asset: any) => void;
  onAssetUpload: (file: File) => void;
  onAssetDelete: (assetId: string) => void;
}

export function EnhancedAssetManager({
  assets,
  onAssetSelect,
  onAssetUpload,
  onAssetDelete
}: EnhancedAssetManagerProps) {
  const [folders, setFolders] = useState<AssetFolder[]>([
    { id: 'all', name: 'All Assets', assets: [] }
  ]);
  const [activeFolder, setActiveFolder] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [newFolderName, setNewFolderName] = useState('');
  const [showCreateFolder, setShowCreateFolder] = useState(false);

  const createFolder = useCallback(() => {
    if (!newFolderName.trim()) return;
    
    const newFolder: AssetFolder = {
      id: `folder-${Date.now()}`,
      name: newFolderName,
      assets: []
    };
    
    setFolders(prev => [...prev, newFolder]);
    setNewFolderName('');
    setShowCreateFolder(false);
  }, [newFolderName]);

  const deleteFolder = useCallback((folderId: string) => {
    if (folderId === 'all') return;
    setFolders(prev => prev.filter(f => f.id !== folderId));
    if (activeFolder === folderId) {
      setActiveFolder('all');
    }
  }, [activeFolder]);

  const moveAssetToFolder = useCallback((assetId: string, folderId: string) => {
    setFolders(prev => prev.map(folder => ({
      ...folder,
      assets: folder.id === folderId 
        ? [...folder.assets.filter(id => id !== assetId), assetId]
        : folder.assets.filter(id => id !== assetId)
    })));
  }, []);

  const getFilteredAssets = useCallback(() => {
    let filtered = assets;
    
    if (activeFolder !== 'all') {
      const folder = folders.find(f => f.id === activeFolder);
      if (folder) {
        filtered = assets.filter(asset => folder.assets.includes(asset.id));
      }
    }
    
    if (searchTerm) {
      filtered = filtered.filter(asset => 
        asset.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    return filtered;
  }, [assets, activeFolder, folders, searchTerm]);

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="p-4 border-b">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-semibold">Assets</h3>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setViewMode(viewMode === 'grid' ? 'list' : 'grid')}
              className="p-1 hover:bg-gray-100 rounded"
            >
              {viewMode === 'grid' ? <List size={16} /> : <Grid3X3 size={16} />}
            </button>
            <button
              onClick={() => setShowCreateFolder(true)}
              className="p-1 hover:bg-gray-100 rounded"
            >
              <Plus size={16} />
            </button>
          </div>
        </div>
        
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <input
            type="text"
            placeholder="Search assets..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md text-sm"
          />
        </div>
      </div>

      {/* Folders */}
      <div className="p-4 border-b">
        <div className="space-y-1">
          {folders.map(folder => (
            <div key={folder.id} className="flex items-center justify-between">
              <button
                onClick={() => setActiveFolder(folder.id)}
                className={`flex items-center space-x-2 px-2 py-1 rounded text-sm flex-1 text-left ${
                  activeFolder === folder.id ? 'bg-blue-100 text-blue-700' : 'hover:bg-gray-100'
                }`}
              >
                {activeFolder === folder.id ? (
                  <FolderOpen size={16} />
                ) : (
                  <Folder size={16} />
                )}
                <span>{folder.name}</span>
                <span className="text-gray-500">
                  ({folder.id === 'all' ? assets.length : folder.assets.length})
                </span>
              </button>
              
              {folder.id !== 'all' && (
                <button
                  onClick={() => deleteFolder(folder.id)}
                  className="p-1 text-red-500 hover:bg-red-100 rounded"
                >
                  <Trash2 size={12} />
                </button>
              )}
            </div>
          ))}
        </div>
        
        {/* Create Folder */}
        {showCreateFolder && (
          <div className="mt-3 p-3 bg-gray-50 rounded">
            <input
              type="text"
              placeholder="Folder name"
              value={newFolderName}
              onChange={(e) => setNewFolderName(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') createFolder();
                if (e.key === 'Escape') setShowCreateFolder(false);
              }}
              className="w-full px-2 py-1 border rounded text-sm mb-2"
              autoFocus
            />
            <div className="flex space-x-2">
              <button
                onClick={createFolder}
                className="px-3 py-1 bg-blue-600 text-white rounded text-sm"
              >
                Create
              </button>
              <button
                onClick={() => setShowCreateFolder(false)}
                className="px-3 py-1 text-gray-600 text-sm"
              >
                Cancel
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Assets */}
      <div className="flex-1 p-4 overflow-y-auto">
        <div className={viewMode === 'grid' 
          ? 'grid grid-cols-3 gap-2' 
          : 'space-y-2'
        }>
          {getFilteredAssets().map(asset => (
            <div
              key={asset.id}
              className={`cursor-pointer border rounded hover:border-blue-300 ${
                viewMode === 'grid' ? 'aspect-square' : 'flex items-center p-2'
              }`}
              onClick={() => onAssetSelect(asset)}
              draggable
              onDragStart={(e) => {
                e.dataTransfer.setData('text/plain', asset.id);
              }}
            >
              {viewMode === 'grid' ? (
                <div className="w-full h-full flex flex-col">
                  <div className="flex-1 bg-gray-100 rounded-t flex items-center justify-center">
                    {asset.thumbnail ? (
                      <img 
                        src={asset.thumbnail} 
                        alt={asset.name}
                        className="w-full h-full object-cover rounded-t"
                      />
                    ) : (
                      <div className="text-gray-400 text-xs">{asset.type}</div>
                    )}
                  </div>
                  <div className="p-1">
                    <div className="text-xs truncate">{asset.name}</div>
                  </div>
                </div>
              ) : (
                <>
                  <div className="w-12 h-12 bg-gray-100 rounded mr-3 flex items-center justify-center">
                    {asset.thumbnail ? (
                      <img 
                        src={asset.thumbnail} 
                        alt={asset.name}
                        className="w-full h-full object-cover rounded"
                      />
                    ) : (
                      <div className="text-gray-400 text-xs">{asset.type}</div>
                    )}
                  </div>
                  <div className="flex-1">
                    <div className="text-sm font-medium">{asset.name}</div>
                    <div className="text-xs text-gray-500">{asset.type}</div>
                  </div>
                </>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}