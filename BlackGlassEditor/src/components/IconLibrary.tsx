/**
 * Iconsax Icon Library Integration
 * Custom icon picker with Iconsax-style icons
 */

import React, { useState, useCallback, useMemo, useEffect } from 'react';
import { Search, Download, Star, Filter, Grid, List } from 'lucide-react';

export interface IconData {
  id: string;
  name: string;
  category: string;
  keywords: string[];
  svg: string;
  isFavorite: boolean;
  isDownloaded: boolean;
}

export interface IconLibraryProps {
  onIconSelect: (icon: IconData) => void;
  onClose?: () => void;
  className?: string;
}

const IconLibrary: React.FC<IconLibraryProps> = ({
  onIconSelect,
  onClose,
  className = ''
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [favorites, setFavorites] = useState<Set<string>>(new Set());
  const [downloadedIcons, setDownloadedIcons] = useState<Set<string>>(new Set());

  // Load Iconsax icons from generated data
  const [sampleIcons, setSampleIcons] = useState<IconData[]>([]);
  
  useEffect(() => {
    // Load icons from generated data
    const loadIcons = async () => {
      try {
        const response = await fetch('/src/data/icons/all-icons.json');
        const icons = await response.json();
        setSampleIcons(icons.map((icon: any) => ({
          id: icon.id,
          name: icon.name,
          category: icon.category,
          keywords: icon.keywords,
          svg: icon.svg,
          isFavorite: false,
          isDownloaded: false
        })));
      } catch (error) {
        console.error('Error loading icons:', error);
        // Fallback to sample icons
        setSampleIcons([
    {
      id: 'home-1',
      name: 'Home',
      category: 'household',
      keywords: ['home', 'house', 'building', 'residence'],
      svg: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9,22 9,12 15,12 15,22"/></svg>',
      isFavorite: false,
      isDownloaded: false
    },
    {
      id: 'user-1',
      name: 'User',
      category: 'people',
      keywords: ['user', 'person', 'profile', 'account'],
      svg: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>',
      isFavorite: false,
      isDownloaded: false
    },
    {
      id: 'heart-1',
      name: 'Heart',
      category: 'emotions',
      keywords: ['heart', 'love', 'like', 'favorite'],
      svg: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>',
      isFavorite: false,
      isDownloaded: false
    },
    {
      id: 'star-1',
      name: 'Star',
      category: 'emotions',
      keywords: ['star', 'rating', 'favorite', 'bookmark'],
      svg: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="12,2 15.09,8.26 22,9.27 17,14.14 18.18,21.02 12,17.77 5.82,21.02 7,14.14 2,9.27 8.91,8.26 12,2"/></svg>',
      isFavorite: false,
      isDownloaded: false
    },
    {
      id: 'camera-1',
      name: 'Camera',
      category: 'media',
      keywords: ['camera', 'photo', 'picture', 'capture'],
      svg: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/><circle cx="12" cy="13" r="4"/></svg>',
      isFavorite: false,
      isDownloaded: false
    },
    {
      id: 'music-1',
      name: 'Music',
      category: 'media',
      keywords: ['music', 'audio', 'sound', 'song'],
      svg: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 18V5l12-2v13"/><circle cx="6" cy="18" r="3"/><circle cx="18" cy="16" r="3"/></svg>',
      isFavorite: false,
      isDownloaded: false
    },
    {
      id: 'settings-1',
      name: 'Settings',
      category: 'system',
      keywords: ['settings', 'gear', 'preferences', 'config'],
      svg: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1 1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>',
      isFavorite: false,
      isDownloaded: false
    },
    {
      id: 'search-1',
      name: 'Search',
      category: 'system',
      keywords: ['search', 'find', 'lookup', 'magnify'],
      svg: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>',
      isFavorite: false,
      isDownloaded: false
    }
  ]);
      }
    };
    
    loadIcons();
  }, []);

  const categories = useMemo(() => {
    const cats = Array.from(new Set(sampleIcons.map(icon => icon.category)));
    return ['all', ...cats];
  }, [sampleIcons]);

  const filteredIcons = useMemo(() => {
    let filtered = sampleIcons;

    // Filter by search query
    if (searchQuery) {
      filtered = filtered.filter(icon =>
        icon.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        icon.keywords.some(keyword => keyword.toLowerCase().includes(searchQuery.toLowerCase()))
      );
    }

    // Filter by category
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(icon => icon.category === selectedCategory);
    }

    return filtered;
  }, [searchQuery, selectedCategory]);

  const handleIconSelect = useCallback((icon: IconData) => {
    onIconSelect(icon);
    onClose?.();
  }, [onIconSelect, onClose]);

  const toggleFavorite = useCallback((iconId: string) => {
    setFavorites(prev => {
      const newFavorites = new Set(prev);
      if (newFavorites.has(iconId)) {
        newFavorites.delete(iconId);
      } else {
        newFavorites.add(iconId);
      }
      return newFavorites;
    });
  }, []);

  const downloadIcon = useCallback((icon: IconData) => {
    setDownloadedIcons(prev => new Set(prev).add(icon.id));
    // Here you would implement actual download logic
    console.log('Downloading icon:', icon.name);
  }, []);

  return (
    <div className={`bg-white rounded-lg shadow-lg border ${className}`}>
      {/* Header */}
      <div className="p-4 border-b">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold">Icon Library</h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            ×
          </button>
        </div>

        {/* Search */}
        <div className="relative mb-4">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <input
            type="text"
            placeholder="Search icons..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Controls */}
        <div className="flex items-center justify-between">
          {/* Category Filter */}
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="px-3 py-1 border border-gray-300 rounded text-sm"
          >
            {categories.map(category => (
              <option key={category} value={category}>
                {category.charAt(0).toUpperCase() + category.slice(1)}
              </option>
            ))}
          </select>

          {/* View Mode */}
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-2 rounded ${viewMode === 'grid' ? 'bg-blue-100 text-blue-600' : 'text-gray-400'}`}
            >
              <Grid className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-2 rounded ${viewMode === 'list' ? 'bg-blue-100 text-blue-600' : 'text-gray-400'}`}
            >
              <List className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Icons Grid/List */}
      <div className="p-4 max-h-96 overflow-y-auto">
        {viewMode === 'grid' ? (
          <div className="grid grid-cols-6 gap-3">
            {filteredIcons.map(icon => (
              <div
                key={icon.id}
                className="group relative p-3 border border-gray-200 rounded-lg hover:border-blue-300 hover:bg-blue-50 cursor-pointer transition-colors"
                onClick={() => handleIconSelect(icon)}
              >
                <div className="w-8 h-8 mx-auto mb-2 text-gray-600 group-hover:text-blue-600">
                  <div dangerouslySetInnerHTML={{ __html: icon.svg }} />
                </div>
                <div className="text-xs text-center text-gray-600 group-hover:text-blue-600 truncate">
                  {icon.name}
                </div>
                
                {/* Actions */}
                <div className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleFavorite(icon.id);
                    }}
                    className="p-1 text-gray-400 hover:text-yellow-500"
                  >
                    <Star className={`w-3 h-3 ${favorites.has(icon.id) ? 'fill-current text-yellow-500' : ''}`} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="space-y-2">
            {filteredIcons.map(icon => (
              <div
                key={icon.id}
                className="flex items-center p-3 border border-gray-200 rounded-lg hover:border-blue-300 hover:bg-blue-50 cursor-pointer transition-colors"
                onClick={() => handleIconSelect(icon)}
              >
                <div className="w-6 h-6 mr-3 text-gray-600">
                  <div dangerouslySetInnerHTML={{ __html: icon.svg }} />
                </div>
                <div className="flex-1">
                  <div className="font-medium text-gray-900">{icon.name}</div>
                  <div className="text-sm text-gray-500">{icon.category}</div>
                </div>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleFavorite(icon.id);
                    }}
                    className="p-1 text-gray-400 hover:text-yellow-500"
                  >
                    <Star className={`w-4 h-4 ${favorites.has(icon.id) ? 'fill-current text-yellow-500' : ''}`} />
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      downloadIcon(icon);
                    }}
                    className="p-1 text-gray-400 hover:text-blue-500"
                  >
                    <Download className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="p-4 border-t bg-gray-50">
        <div className="text-sm text-gray-600 text-center">
          {filteredIcons.length} icons found
        </div>
      </div>
    </div>
  );
};

export default IconLibrary;
