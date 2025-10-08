/**
 * Professional Font Manager
 * Advanced font loading, management, and preview system
 */

import React, { useState, useCallback, useRef, useEffect } from 'react';
import { 
  Type, 
  Download, 
  Upload, 
  Search, 
  Star, 
  StarOff,
  Eye,
  EyeOff,
  Settings,
  Filter,
  SortAsc,
  SortDesc,
  X,
  Check,
  RefreshCw
} from 'lucide-react';

export interface Font {
  id: string;
  family: string;
  style: string;
  weight: number;
  variant: string;
  category: 'serif' | 'sans-serif' | 'monospace' | 'display' | 'handwriting' | 'script';
  source: 'google' | 'system' | 'custom' | 'web';
  url?: string;
  file?: File;
  isLoaded: boolean;
  isFavorite: boolean;
  isInstalled: boolean;
  preview: string;
  characters: string;
  supportedLanguages: string[];
  license: string;
  designer: string;
  year: number;
  tags: string[];
  createdAt: Date;
  updatedAt: Date;
}

export interface FontManagerProps {
  onFontSelect: (font: Font) => void;
  onClose?: () => void;
  className?: string;
}

const FontManager: React.FC<FontManagerProps> = ({
  onFontSelect,
  onClose,
  className = ''
}) => {
  const [fonts, setFonts] = useState<Font[]>([]);
  const [filteredFonts, setFilteredFonts] = useState<Font[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'name' | 'category' | 'date' | 'popularity'>('name');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [showSettings, setShowSettings] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [favoriteFonts, setFavoriteFonts] = useState<Set<string>>(new Set());
  const [installedFonts, setInstalledFonts] = useState<Set<string>>(new Set());
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Sample fonts data
  const sampleFonts: Font[] = [
    {
      id: 'roboto-regular',
      family: 'Roboto',
      style: 'normal',
      weight: 400,
      variant: 'normal',
      category: 'sans-serif',
      source: 'google',
      url: 'https://fonts.googleapis.com/css2?family=Roboto:wght@400&display=swap',
      isLoaded: false,
      isFavorite: false,
      isInstalled: false,
      preview: 'The quick brown fox jumps over the lazy dog',
      characters: 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789',
      supportedLanguages: ['en', 'es', 'fr', 'de'],
      license: 'Apache 2.0',
      designer: 'Christian Robertson',
      year: 2011,
      tags: ['modern', 'clean', 'readable'],
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      id: 'playfair-display-regular',
      family: 'Playfair Display',
      style: 'normal',
      weight: 400,
      variant: 'normal',
      category: 'serif',
      source: 'google',
      url: 'https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400&display=swap',
      isLoaded: false,
      isFavorite: false,
      isInstalled: false,
      preview: 'The quick brown fox jumps over the lazy dog',
      characters: 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789',
      supportedLanguages: ['en', 'es', 'fr', 'de'],
      license: 'OFL 1.1',
      designer: 'Claus Eggers Sørensen',
      year: 2011,
      tags: ['elegant', 'display', 'serif'],
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      id: 'source-code-pro-regular',
      family: 'Source Code Pro',
      style: 'normal',
      weight: 400,
      variant: 'normal',
      category: 'monospace',
      source: 'google',
      url: 'https://fonts.googleapis.com/css2?family=Source+Code+Pro:wght@400&display=swap',
      isLoaded: false,
      isFavorite: false,
      isInstalled: false,
      preview: 'The quick brown fox jumps over the lazy dog',
      characters: 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789',
      supportedLanguages: ['en', 'es', 'fr', 'de'],
      license: 'OFL 1.1',
      designer: 'Paul D. Hunt',
      year: 2012,
      tags: ['monospace', 'code', 'programming'],
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      id: 'dancing-script-regular',
      family: 'Dancing Script',
      style: 'normal',
      weight: 400,
      variant: 'normal',
      category: 'handwriting',
      source: 'google',
      url: 'https://fonts.googleapis.com/css2?family=Dancing+Script:wght@400&display=swap',
      isLoaded: false,
      isFavorite: false,
      isInstalled: false,
      preview: 'The quick brown fox jumps over the lazy dog',
      characters: 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789',
      supportedLanguages: ['en', 'es', 'fr', 'de'],
      license: 'OFL 1.1',
      designer: 'Pablo Impallari',
      year: 2010,
      tags: ['handwriting', 'script', 'elegant'],
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      id: 'oswald-regular',
      family: 'Oswald',
      style: 'normal',
      weight: 400,
      variant: 'normal',
      category: 'display',
      source: 'google',
      url: 'https://fonts.googleapis.com/css2?family=Oswald:wght@400&display=swap',
      isLoaded: false,
      isFavorite: false,
      isInstalled: false,
      preview: 'The quick brown fox jumps over the lazy dog',
      characters: 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789',
      supportedLanguages: ['en', 'es', 'fr', 'de'],
      license: 'OFL 1.1',
      designer: 'Vernon Adams',
      year: 2011,
      tags: ['display', 'condensed', 'bold'],
      createdAt: new Date(),
      updatedAt: new Date()
    }
  ];

  // Initialize fonts
  useEffect(() => {
    setFonts(sampleFonts);
    setFilteredFonts(sampleFonts);
  }, []);

  // Filter and sort fonts
  useEffect(() => {
    let filtered = fonts.filter(font => {
      const matchesSearch = font.family.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           font.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
      const matchesCategory = selectedCategory === 'all' || font.category === selectedCategory;
      return matchesSearch && matchesCategory;
    });

    // Sort fonts
    filtered.sort((a, b) => {
      let comparison = 0;
      switch (sortBy) {
        case 'name':
          comparison = a.family.localeCompare(b.family);
          break;
        case 'category':
          comparison = a.category.localeCompare(b.category);
          break;
        case 'date':
          comparison = a.createdAt.getTime() - b.createdAt.getTime();
          break;
        case 'popularity':
          comparison = (a.isFavorite ? 1 : 0) - (b.isFavorite ? 1 : 0);
          break;
      }
      return sortOrder === 'asc' ? comparison : -comparison;
    });

    setFilteredFonts(filtered);
  }, [fonts, searchQuery, selectedCategory, sortBy, sortOrder]);

  // Load font
  const loadFont = useCallback(async (font: Font) => {
    if (font.isLoaded || font.source !== 'google') return;

    setIsLoading(true);
    try {
      // Create link element
      const link = document.createElement('link');
      link.href = font.url!;
      link.rel = 'stylesheet';
      document.head.appendChild(link);

      // Wait for font to load
      await document.fonts.load(`400 16px ${font.family}`);
      
      // Update font status
      setFonts(prev => prev.map(f => 
        f.id === font.id ? { ...f, isLoaded: true } : f
      ));
    } catch (error) {
      console.error('Failed to load font:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Handle font select
  const handleFontSelect = useCallback((font: Font) => {
    if (!font.isLoaded && font.source === 'google') {
      loadFont(font);
    }
    onFontSelect(font);
  }, [onFontSelect, loadFont]);

  // Handle font favorite toggle
  const handleFontFavorite = useCallback((fontId: string) => {
    setFavoriteFonts(prev => {
      const newSet = new Set(prev);
      if (newSet.has(fontId)) {
        newSet.delete(fontId);
      } else {
        newSet.add(fontId);
      }
      return newSet;
    });
    
    setFonts(prev => prev.map(font => 
      font.id === fontId ? { ...font, isFavorite: !font.isFavorite } : font
    ));
  }, []);

  // Handle font install
  const handleFontInstall = useCallback((font: Font) => {
    setInstalledFonts(prev => {
      const newSet = new Set(prev);
      newSet.add(font.id);
      return newSet;
    });
    
    setFonts(prev => prev.map(f => 
      f.id === font.id ? { ...f, isInstalled: true } : f
    ));
  }, []);

  // Handle custom font upload
  const handleFontUpload = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files) return;

    Array.from(files).forEach(file => {
      if (file.type.startsWith('font/') || file.name.endsWith('.ttf') || file.name.endsWith('.otf') || file.name.endsWith('.woff') || file.name.endsWith('.woff2')) {
        const font: Font = {
          id: `custom-${Date.now()}-${Math.random()}`,
          family: file.name.replace(/\.[^/.]+$/, ''),
          style: 'normal',
          weight: 400,
          variant: 'normal',
          category: 'sans-serif',
          source: 'custom',
          file,
          isLoaded: false,
          isFavorite: false,
          isInstalled: false,
          preview: 'The quick brown fox jumps over the lazy dog',
          characters: 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789',
          supportedLanguages: ['en'],
          license: 'Unknown',
          designer: 'Unknown',
          year: new Date().getFullYear(),
          tags: ['custom', 'uploaded'],
          createdAt: new Date(),
          updatedAt: new Date()
        };
        
        setFonts(prev => [font, ...prev]);
      }
    });
  }, []);

  // Export fonts
  const exportFonts = useCallback(() => {
    const data = {
      fonts: fonts.map(font => ({
        family: font.family,
        style: font.style,
        weight: font.weight,
        category: font.category,
        source: font.source,
        url: font.url,
        isFavorite: font.isFavorite,
        isInstalled: font.isInstalled,
        tags: font.tags
      })),
      exportedAt: new Date().toISOString()
    };
    
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'font-library.json';
    a.click();
    URL.revokeObjectURL(url);
  }, [fonts]);

  // Clear all fonts
  const clearAllFonts = useCallback(() => {
    setFonts([]);
    setFilteredFonts([]);
  }, []);

  const categories = [
    { id: 'all', label: 'All Fonts', count: fonts.length },
    { id: 'serif', label: 'Serif', count: fonts.filter(f => f.category === 'serif').length },
    { id: 'sans-serif', label: 'Sans Serif', count: fonts.filter(f => f.category === 'sans-serif').length },
    { id: 'monospace', label: 'Monospace', count: fonts.filter(f => f.category === 'monospace').length },
    { id: 'display', label: 'Display', count: fonts.filter(f => f.category === 'display').length },
    { id: 'handwriting', label: 'Handwriting', count: fonts.filter(f => f.category === 'handwriting').length },
    { id: 'script', label: 'Script', count: fonts.filter(f => f.category === 'script').length }
  ];

  return (
    <div className={`bg-white rounded-lg shadow-xl border border-gray-200 p-4 w-full max-w-6xl ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold flex items-center">
          <Type size={20} className="mr-2" />
          Font Manager
        </h3>
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setShowSettings(!showSettings)}
            className="p-2 text-gray-500 hover:text-gray-700"
            title="Settings"
          >
            <Settings size={16} />
          </button>
          <button
            onClick={exportFonts}
            className="p-2 text-gray-500 hover:text-gray-700"
            title="Export fonts"
          >
            <Download size={16} />
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept=".ttf,.otf,.woff,.woff2"
            multiple
            onChange={handleFontUpload}
            className="hidden"
          />
          <button
            onClick={() => fileInputRef.current?.click()}
            className="p-2 text-gray-500 hover:text-gray-700"
            title="Upload fonts"
          >
            <Upload size={16} />
          </button>
          <button
            onClick={clearAllFonts}
            className="p-2 text-gray-500 hover:text-gray-700"
            title="Clear all fonts"
          >
            <X size={16} />
          </button>
          {onClose && (
            <button
              onClick={onClose}
              className="p-2 text-gray-500 hover:text-gray-700"
            >
              <X size={16} />
            </button>
          )}
        </div>
      </div>

      {/* Search and Filters */}
      <div className="flex items-center space-x-4 mb-4">
        <div className="flex-1 relative">
          <Search size={16} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search fonts..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm"
          />
        </div>
        <select
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
          className="px-3 py-2 border border-gray-300 rounded-lg text-sm"
        >
          {categories.map(category => (
            <option key={category.id} value={category.id}>
              {category.label} ({category.count})
            </option>
          ))}
        </select>
        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value as any)}
          className="px-3 py-2 border border-gray-300 rounded-lg text-sm"
        >
          <option value="name">Name</option>
          <option value="category">Category</option>
          <option value="date">Date</option>
          <option value="popularity">Popularity</option>
        </select>
        <button
          onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
          className="p-2 text-gray-500 hover:text-gray-700"
          title={`Sort ${sortOrder === 'asc' ? 'Descending' : 'Ascending'}`}
        >
          {sortOrder === 'asc' ? <SortAsc size={16} /> : <SortDesc size={16} />}
        </button>
      </div>

      {/* Font Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 max-h-96 overflow-y-auto">
        {filteredFonts.map(font => (
          <div
            key={font.id}
            className="border border-gray-200 rounded-lg p-4 hover:border-gray-300 transition-colors cursor-pointer"
            onClick={() => handleFontSelect(font)}
          >
            <div className="flex items-center justify-between mb-2">
              <h4 className="font-medium text-sm">{font.family}</h4>
              <div className="flex items-center space-x-1">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleFontFavorite(font.id);
                  }}
                  className={`p-1 ${favoriteFonts.has(font.id) ? 'text-yellow-500' : 'text-gray-400 hover:text-yellow-500'}`}
                  title="Toggle favorite"
                >
                  {favoriteFonts.has(font.id) ? <Star size={14} /> : <StarOff size={14} />}
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleFontInstall(font);
                  }}
                  className={`p-1 ${installedFonts.has(font.id) ? 'text-green-500' : 'text-gray-400 hover:text-green-500'}`}
                  title="Install font"
                >
                  {installedFonts.has(font.id) ? <Check size={14} /> : <Download size={14} />}
                </button>
              </div>
            </div>
            
            <div
              className="text-lg mb-2"
              style={{
                fontFamily: font.isLoaded ? font.family : 'Arial, sans-serif',
                fontWeight: font.weight,
                fontStyle: font.style
              }}
            >
              {font.preview}
            </div>
            
            <div className="flex items-center justify-between text-xs text-gray-500">
              <span className="capitalize">{font.category}</span>
              <span>{font.source}</span>
            </div>
            
            <div className="flex flex-wrap gap-1 mt-2">
              {font.tags.map(tag => (
                <span
                  key={tag}
                  className="px-2 py-1 bg-gray-100 text-gray-600 rounded text-xs"
                >
                  {tag}
                </span>
              ))}
            </div>
            
            {font.isLoaded && (
              <div className="mt-2 text-xs text-green-600 flex items-center">
                <Check size={12} className="mr-1" />
                Loaded
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Settings Panel */}
      {showSettings && (
        <div className="absolute top-12 right-2 z-30 bg-white rounded-lg shadow-xl border border-gray-200 p-4 w-64">
          <h4 className="font-semibold mb-3">Font Settings</h4>
          
          <div className="space-y-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Auto-load fonts</label>
              <input
                type="checkbox"
                className="rounded"
                defaultChecked
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Show font preview</label>
              <input
                type="checkbox"
                className="rounded"
                defaultChecked
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Cache fonts</label>
              <input
                type="checkbox"
                className="rounded"
                defaultChecked
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Font size limit</label>
              <input
                type="range"
                min="10"
                max="24"
                defaultValue="16"
                className="w-full"
              />
            </div>
          </div>
        </div>
      )}

      {/* Loading Indicator */}
      {isLoading && (
        <div className="absolute inset-0 bg-white bg-opacity-75 flex items-center justify-center">
          <div className="flex items-center space-x-2">
            <RefreshCw size={20} className="animate-spin" />
            <span>Loading font...</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default FontManager;
