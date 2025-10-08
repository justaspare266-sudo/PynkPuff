import React, { useState, useRef } from 'react';
import { Upload, Image, Trash2, Plus, FolderOpen, Search, Play } from 'lucide-react';

interface Asset {
  id: string;
  name: string;
  type: 'image' | 'icon' | 'shape' | 'video';
  url: string;
  thumbnail?: string;
}

interface AssetPanelProps {
  currentTheme: 'light' | 'dark';
  isOpen: boolean;
  onToggle: () => void;
  assets: Asset[];
  onAssetSelect: (asset: Asset) => void;
  onAssetUpload: (file: File) => void;
  onAssetDelete: (assetId: string) => void;
}

export function AssetPanel({
  currentTheme,
  isOpen,
  onToggle,
  assets,
  onAssetSelect,
  onAssetUpload,
  onAssetDelete
}: AssetPanelProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<'all' | 'image' | 'icon' | 'shape' | 'video'>('all');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const getThemeClasses = () => {
    return currentTheme === 'dark' 
      ? 'bg-gray-800 border-gray-700 text-white' 
      : 'bg-white border-gray-300 text-gray-900';
  };

  const getButtonClasses = (isActive: boolean = false) => {
    const base = 'flex items-center gap-2 px-3 py-2 rounded-lg transition-all duration-200';
    if (isActive) {
      return `${base} bg-blue-500 text-white shadow-lg`;
    }
    return `${base} ${currentTheme === 'dark' ? 'hover:bg-gray-700' : 'hover:bg-gray-100'}`;
  };

  const filteredAssets = assets.filter(asset => {
    const matchesSearch = asset.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || asset.type === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      Array.from(files).forEach(file => {
        onAssetUpload(file);
      });
    }
  };

  const getAssetIcon = (type: string) => {
    switch (type) {
      case 'image':
        return <Image className="h-4 w-4" />;
      case 'icon':
        return <Plus className="h-4 w-4" />;
      case 'shape':
        return <FolderOpen className="h-4 w-4" />;
      case 'video':
        return <Play className="h-4 w-4" />;
      default:
        return <Image className="h-4 w-4" />;
    }
  };

  if (!isOpen) return null;

  return (
    <div className={`fixed right-0 top-0 w-80 h-screen z-50 border-l ${getThemeClasses()} overflow-y-auto`}>
      <div className="p-4 border-b border-gray-600">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold">Assets</h3>
          <button
            onClick={onToggle}
            className="p-1 rounded hover:bg-gray-600 transition-colors"
          >
            ×
          </button>
        </div>

        {/* Search Bar */}
        <div className="relative mb-4">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search assets..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className={`w-full pl-10 pr-4 py-2 rounded-lg border ${
              currentTheme === 'dark' 
                ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' 
                : 'bg-gray-50 border-gray-300 text-gray-900 placeholder-gray-500'
            } focus:outline-none focus:ring-2 focus:ring-blue-500`}
          />
        </div>

        {/* Category Filter */}
        <div className="flex gap-1 mb-4">
          {[
            { id: 'all', label: 'All' },
            { id: 'image', label: 'Images' },
            { id: 'video', label: 'Videos' },
            { id: 'icon', label: 'Icons' },
            { id: 'shape', label: 'Shapes' }
          ].map(category => (
            <button
              key={category.id}
              onClick={() => setSelectedCategory(category.id as any)}
              className={getButtonClasses(selectedCategory === category.id)}
            >
              {getAssetIcon(category.id)}
              {category.label}
            </button>
          ))}
        </div>

        {/* Upload Button */}
        <button
          onClick={() => fileInputRef.current?.click()}
          className={`w-full ${getButtonClasses()} justify-center`}
        >
          <Upload className="h-4 w-4" />
          Upload Assets
        </button>
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept="image/*,video/*,.svg,.png,.jpg,.jpeg,.gif,.mp4,.webm,.ogg"
          onChange={handleFileUpload}
          className="hidden"
        />
      </div>

      {/* Assets Grid */}
      <div className="flex-1 overflow-y-auto p-4">
        {filteredAssets.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <Image className="h-12 w-12 mx-auto mb-2 opacity-50" />
            <p>No assets found</p>
            <p className="text-sm">Upload some assets to get started</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3">
            {filteredAssets.map(asset => (
              <div
                key={asset.id}
                className={`group relative rounded-lg border-2 border-transparent hover:border-blue-500 transition-all duration-200 cursor-pointer ${
                  currentTheme === 'dark' ? 'bg-gray-700' : 'bg-gray-50'
                }`}
                onClick={() => onAssetSelect(asset)}
              >
                {/* Asset Preview */}
                <div className="aspect-square rounded-t-lg overflow-hidden">
                  {asset.thumbnail ? (
                    <img
                      src={asset.thumbnail}
                      alt={asset.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gray-600">
                      {getAssetIcon(asset.type)}
                    </div>
                  )}
                </div>

                {/* Asset Info */}
                <div className="p-2">
                  <p className="text-xs font-medium truncate">{asset.name}</p>
                  <p className="text-xs text-gray-400 capitalize">{asset.type}</p>
                </div>

                {/* Delete Button */}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onAssetDelete(asset.id);
                  }}
                  className="absolute top-1 right-1 p-1 rounded-full bg-red-500 text-white opacity-0 group-hover:opacity-100 transition-opacity duration-200 hover:bg-red-600"
                >
                  <Trash2 className="h-3 w-3" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Asset Stats */}
      <div className={`p-4 border-t ${currentTheme === 'dark' ? 'border-gray-700' : 'border-gray-200'}`}>
        <div className="text-sm text-gray-400">
          {filteredAssets.length} of {assets.length} assets
        </div>
      </div>
    </div>
  );
}