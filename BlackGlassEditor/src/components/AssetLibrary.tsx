import React, { useState, useEffect } from 'react';
import { Search, Grid, List, Star, Download, Upload, Trash2, Tag, Filter, Heart, Clock } from 'lucide-react';

interface Asset {
  id: string;
  name: string;
  type: 'image' | 'shape' | 'icon' | 'texture' | 'template';
  category: string;
  tags: string[];
  url: string;
  thumbnail: string;
  size: number;
  dimensions?: { width: number; height: number };
  favorite: boolean;
  lastUsed?: Date;
  downloads: number;
  rating: number;
}

interface AssetLibraryProps {
  onAssetSelect: (asset: Asset) => void;
  onClose: () => void;
}

const CATEGORIES = [
  { id: 'all', name: 'All Assets', icon: Grid },
  { id: 'images', name: 'Images', icon: Grid },
  { id: 'shapes', name: 'Shapes', icon: Grid },
  { id: 'icons', name: 'Icons', icon: Grid },
  { id: 'textures', name: 'Textures', icon: Grid },
  { id: 'templates', name: 'Templates', icon: Grid },
  { id: 'favorites', name: 'Favorites', icon: Heart },
  { id: 'recent', name: 'Recent', icon: Clock }
];

const SAMPLE_ASSETS: Asset[] = [
  {
    id: '1',
    name: 'Abstract Background',
    type: 'image',
    category: 'images',
    tags: ['abstract', 'background', 'colorful'],
    url: '/assets/abstract-bg.jpg',
    thumbnail: '/assets/thumbs/abstract-bg.jpg',
    size: 2048000,
    dimensions: { width: 1920, height: 1080 },
    favorite: true,
    downloads: 1250,
    rating: 4.8
  },
  {
    id: '2',
    name: 'Circle Shape',
    type: 'shape',
    category: 'shapes',
    tags: ['circle', 'basic', 'geometric'],
    url: '/assets/circle.svg',
    thumbnail: '/assets/thumbs/circle.svg',
    size: 1024,
    favorite: false,
    downloads: 890,
    rating: 4.5
  },
  {
    id: '3',
    name: 'Social Media Icons',
    type: 'icon',
    category: 'icons',
    tags: ['social', 'media', 'icons', 'set'],
    url: '/assets/social-icons.svg',
    thumbnail: '/assets/thumbs/social-icons.svg',
    size: 15360,
    favorite: true,
    downloads: 2100,
    rating: 4.9
  }
];

export const AssetLibrary: React.FC<AssetLibraryProps> = ({ onAssetSelect, onClose }) => {
  const [assets, setAssets] = useState<Asset[]>(SAMPLE_ASSETS);
  const [filteredAssets, setFilteredAssets] = useState<Asset[]>(SAMPLE_ASSETS);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [sortBy, setSortBy] = useState<'name' | 'date' | 'downloads' | 'rating'>('name');
  const [showUpload, setShowUpload] = useState(false);

  useEffect(() => {
    let filtered = assets;

    // Filter by category
    if (selectedCategory !== 'all') {
      if (selectedCategory === 'favorites') {
        filtered = filtered.filter(asset => asset.favorite);
      } else if (selectedCategory === 'recent') {
        filtered = filtered.filter(asset => asset.lastUsed).sort((a, b) => 
          (b.lastUsed?.getTime() || 0) - (a.lastUsed?.getTime() || 0)
        );
      } else {
        filtered = filtered.filter(asset => asset.category === selectedCategory);
      }
    }

    // Filter by search
    if (searchQuery) {
      filtered = filtered.filter(asset =>
        asset.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        asset.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
      );
    }

    // Sort
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'name':
          return a.name.localeCompare(b.name);
        case 'date':
          return (b.lastUsed?.getTime() || 0) - (a.lastUsed?.getTime() || 0);
        case 'downloads':
          return b.downloads - a.downloads;
        case 'rating':
          return b.rating - a.rating;
        default:
          return 0;
      }
    });

    setFilteredAssets(filtered);
  }, [assets, selectedCategory, searchQuery, sortBy]);

  const toggleFavorite = (assetId: string) => {
    setAssets(prev => prev.map(asset =>
      asset.id === assetId ? { ...asset, favorite: !asset.favorite } : asset
    ));
  };

  const handleAssetClick = (asset: Asset) => {
    // Update last used
    setAssets(prev => prev.map(a =>
      a.id === asset.id ? { ...a, lastUsed: new Date() } : a
    ));
    onAssetSelect(asset);
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-[90vw] h-[80vh] max-w-6xl flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b">
          <h2 className="text-xl font-semibold">Asset Library</h2>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowUpload(true)}
              className="px-3 py-1.5 bg-blue-500 text-white rounded hover:bg-blue-600 flex items-center gap-1"
            >
              <Upload className="w-4 h-4" />
              Upload
            </button>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded"
            >
              ×
            </button>
          </div>
        </div>

        <div className="flex flex-1 overflow-hidden">
          {/* Sidebar */}
          <div className="w-64 border-r bg-gray-50 p-4">
            <div className="space-y-2">
              {CATEGORIES.map(category => {
                const Icon = category.icon;
                return (
                  <button
                    key={category.id}
                    onClick={() => setSelectedCategory(category.id)}
                    className={`w-full flex items-center gap-2 px-3 py-2 rounded text-left hover:bg-gray-200 ${
                      selectedCategory === category.id ? 'bg-blue-100 text-blue-700' : ''
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    {category.name}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Main Content */}
          <div className="flex-1 flex flex-col">
            {/* Search and Controls */}
            <div className="p-4 border-b flex items-center gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="text"
                  placeholder="Search assets..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border rounded-lg"
                />
              </div>
              
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="px-3 py-2 border rounded"
              >
                <option value="name">Name</option>
                <option value="date">Recent</option>
                <option value="downloads">Popular</option>
                <option value="rating">Rating</option>
              </select>

              <div className="flex border rounded">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-2 ${viewMode === 'grid' ? 'bg-blue-500 text-white' : 'hover:bg-gray-100'}`}
                >
                  <Grid className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-2 ${viewMode === 'list' ? 'bg-blue-500 text-white' : 'hover:bg-gray-100'}`}
                >
                  <List className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Assets Grid/List */}
            <div className="flex-1 overflow-auto p-4">
              {viewMode === 'grid' ? (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                  {filteredAssets.map(asset => (
                    <div
                      key={asset.id}
                      className="group relative bg-white border rounded-lg overflow-hidden hover:shadow-lg transition-shadow cursor-pointer"
                      onClick={() => handleAssetClick(asset)}
                    >
                      <div className="aspect-square bg-gray-100 flex items-center justify-center">
                        <img
                          src={asset.thumbnail}
                          alt={asset.name}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjQiIGhlaWdodD0iMjQiIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjI0IiBoZWlnaHQ9IjI0IiBmaWxsPSIjRjNGNEY2Ii8+CjxwYXRoIGQ9Ik0xMiA4VjE2TTggMTJIMTYiIHN0cm9rZT0iIzlDQTNBRiIgc3Ryb2tlLXdpZHRoPSIyIiBzdHJva2UtbGluZWNhcD0icm91bmQiLz4KPC9zdmc+';
                          }}
                        />
                      </div>
                      
                      <div className="p-3">
                        <h3 className="font-medium text-sm truncate">{asset.name}</h3>
                        <p className="text-xs text-gray-500 mt-1">
                          {formatFileSize(asset.size)}
                          {asset.dimensions && ` • ${asset.dimensions.width}×${asset.dimensions.height}`}
                        </p>
                        <div className="flex items-center justify-between mt-2">
                          <div className="flex items-center gap-1">
                            <Star className="w-3 h-3 text-yellow-400 fill-current" />
                            <span className="text-xs text-gray-600">{asset.rating}</span>
                          </div>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              toggleFavorite(asset.id);
                            }}
                            className={`p-1 rounded hover:bg-gray-100 ${
                              asset.favorite ? 'text-red-500' : 'text-gray-400'
                            }`}
                          >
                            <Heart className={`w-3 h-3 ${asset.favorite ? 'fill-current' : ''}`} />
                          </button>
                        </div>
                      </div>

                      {/* Hover overlay */}
                      <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <div className="flex gap-2">
                          <button className="p-2 bg-white rounded-full hover:bg-gray-100">
                            <Download className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="space-y-2">
                  {filteredAssets.map(asset => (
                    <div
                      key={asset.id}
                      className="flex items-center gap-4 p-3 border rounded-lg hover:bg-gray-50 cursor-pointer"
                      onClick={() => handleAssetClick(asset)}
                    >
                      <img
                        src={asset.thumbnail}
                        alt={asset.name}
                        className="w-12 h-12 object-cover rounded"
                      />
                      <div className="flex-1">
                        <h3 className="font-medium">{asset.name}</h3>
                        <p className="text-sm text-gray-500">
                          {asset.category} • {formatFileSize(asset.size)}
                          {asset.dimensions && ` • ${asset.dimensions.width}×${asset.dimensions.height}`}
                        </p>
                        <div className="flex items-center gap-4 mt-1">
                          <div className="flex items-center gap-1">
                            <Star className="w-3 h-3 text-yellow-400 fill-current" />
                            <span className="text-xs text-gray-600">{asset.rating}</span>
                          </div>
                          <span className="text-xs text-gray-500">{asset.downloads} downloads</span>
                        </div>
                      </div>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleFavorite(asset.id);
                        }}
                        className={`p-2 rounded hover:bg-gray-100 ${
                          asset.favorite ? 'text-red-500' : 'text-gray-400'
                        }`}
                      >
                        <Heart className={`w-4 h-4 ${asset.favorite ? 'fill-current' : ''}`} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};