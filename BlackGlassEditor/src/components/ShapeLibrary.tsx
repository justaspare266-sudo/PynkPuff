/**
 * Professional Shape Library
 * Comprehensive shape collection with custom shape creation
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
  Plus as PlusIcon
} from 'lucide-react';

export interface ShapeDefinition {
  id: string;
  name: string;
  category: 'basic' | 'geometric' | 'arrows' | 'symbols' | 'custom' | 'icons';
  type: 'rect' | 'circle' | 'polygon' | 'path' | 'group' | 'custom';
  data: any; // Shape-specific data (points, path, etc.)
  preview: string; // SVG preview
  tags: string[];
  isCustom: boolean;
  isFavorite: boolean;
  isPublic: boolean;
  author?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface ShapeLibraryProps {
  onShapeSelect: (shape: ShapeDefinition) => void;
  onClose?: () => void;
  className?: string;
}

const ShapeLibrary: React.FC<ShapeLibraryProps> = ({
  onShapeSelect,
  onClose,
  className = ''
}) => {
  const [shapes, setShapes] = useState<ShapeDefinition[]>([]);
  const [filteredShapes, setFilteredShapes] = useState<ShapeDefinition[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'name' | 'category' | 'date' | 'popularity'>('name');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [showSettings, setShowSettings] = useState(false);
  const [favoriteShapes, setFavoriteShapes] = useState<Set<string>>(new Set());
  const [copiedShape, setCopiedShape] = useState<string | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [editingShape, setEditingShape] = useState<ShapeDefinition | null>(null);
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Sample shapes data
  const sampleShapes: ShapeDefinition[] = [
    // Basic Shapes
    {
      id: 'rectangle',
      name: 'Rectangle',
      category: 'basic',
      type: 'rect',
      data: { width: 100, height: 60, cornerRadius: 0 },
      preview: '<rect width="100" height="60" fill="#3b82f6" stroke="#1e40af" stroke-width="2"/>',
      tags: ['basic', 'rectangle', 'square'],
      isCustom: false,
      isFavorite: false,
      isPublic: true,
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      id: 'circle',
      name: 'Circle',
      category: 'basic',
      type: 'circle',
      data: { radius: 50 },
      preview: '<circle cx="50" cy="50" r="50" fill="#ef4444" stroke="#dc2626" stroke-width="2"/>',
      tags: ['basic', 'circle', 'round'],
      isCustom: false,
      isFavorite: false,
      isPublic: true,
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      id: 'triangle',
      name: 'Triangle',
      category: 'basic',
      type: 'polygon',
      data: { points: [[50, 10], [10, 90], [90, 90]] },
      preview: '<polygon points="50,10 10,90 90,90" fill="#10b981" stroke="#059669" stroke-width="2"/>',
      tags: ['basic', 'triangle', 'polygon'],
      isCustom: false,
      isFavorite: false,
      isPublic: true,
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      id: 'star',
      name: 'Star',
      category: 'basic',
      type: 'polygon',
      data: { points: [[50, 5], [61, 35], [95, 35], [68, 57], [79, 87], [50, 65], [21, 87], [32, 57], [5, 35], [39, 35]] },
      preview: '<polygon points="50,5 61,35 95,35 68,57 79,87 50,65 21,87 32,57 5,35 39,35" fill="#f59e0b" stroke="#d97706" stroke-width="2"/>',
      tags: ['basic', 'star', 'polygon'],
      isCustom: false,
      isFavorite: false,
      isPublic: true,
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      id: 'heart',
      name: 'Heart',
      category: 'basic',
      type: 'path',
      data: { path: 'M50,85 C50,85 10,45 10,25 C10,15 20,5 30,5 C40,5 50,15 50,25 C50,15 60,5 70,5 C80,5 90,15 90,25 C90,45 50,85 50,85 Z' },
      preview: '<path d="M50,85 C50,85 10,45 10,25 C10,15 20,5 30,5 C40,5 50,15 50,25 C50,15 60,5 70,5 C80,5 90,15 90,25 C90,45 50,85 50,85 Z" fill="#ec4899" stroke="#be185d" stroke-width="2"/>',
      tags: ['basic', 'heart', 'path'],
      isCustom: false,
      isFavorite: false,
      isPublic: true,
      createdAt: new Date(),
      updatedAt: new Date()
    },
    
    // Geometric Shapes
    {
      id: 'hexagon',
      name: 'Hexagon',
      category: 'geometric',
      type: 'polygon',
      data: { points: [[50, 5], [85, 25], [85, 75], [50, 95], [15, 75], [15, 25]] },
      preview: '<polygon points="50,5 85,25 85,75 50,95 15,75 15,25" fill="#8b5cf6" stroke="#7c3aed" stroke-width="2"/>',
      tags: ['geometric', 'hexagon', 'polygon'],
      isCustom: false,
      isFavorite: false,
      isPublic: true,
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      id: 'pentagon',
      name: 'Pentagon',
      category: 'geometric',
      type: 'polygon',
      data: { points: [[50, 5], [90, 35], [73, 85], [27, 85], [10, 35]] },
      preview: '<polygon points="50,5 90,35 73,85 27,85 10,35" fill="#06b6d4" stroke="#0891b2" stroke-width="2"/>',
      tags: ['geometric', 'pentagon', 'polygon'],
      isCustom: false,
      isFavorite: false,
      isPublic: true,
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      id: 'octagon',
      name: 'Octagon',
      category: 'geometric',
      type: 'polygon',
      data: { points: [[50, 5], [75, 20], [95, 50], [95, 75], [75, 95], [50, 95], [25, 95], [5, 75], [5, 50], [25, 20]] },
      preview: '<polygon points="50,5 75,20 95,50 95,75 75,95 50,95 25,95 5,75 5,50 25,20" fill="#84cc16" stroke="#65a30d" stroke-width="2"/>',
      tags: ['geometric', 'octagon', 'polygon'],
      isCustom: false,
      isFavorite: false,
      isPublic: true,
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      id: 'diamond',
      name: 'Diamond',
      category: 'geometric',
      type: 'polygon',
      data: { points: [[50, 5], [90, 50], [50, 95], [10, 50]] },
      preview: '<polygon points="50,5 90,50 50,95 10,50" fill="#f97316" stroke="#ea580c" stroke-width="2"/>',
      tags: ['geometric', 'diamond', 'polygon'],
      isCustom: false,
      isFavorite: false,
      isPublic: true,
      createdAt: new Date(),
      updatedAt: new Date()
    },
    
    // Arrows
    {
      id: 'arrow-up',
      name: 'Arrow Up',
      category: 'arrows',
      type: 'polygon',
      data: { points: [[50, 5], [10, 45], [30, 45], [30, 95], [70, 95], [70, 45], [90, 45]] },
      preview: '<polygon points="50,5 10,45 30,45 30,95 70,95 70,45 90,45" fill="#6366f1" stroke="#4f46e5" stroke-width="2"/>',
      tags: ['arrow', 'up', 'direction'],
      isCustom: false,
      isFavorite: false,
      isPublic: true,
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      id: 'arrow-down',
      name: 'Arrow Down',
      category: 'arrows',
      type: 'polygon',
      data: { points: [[50, 95], [90, 55], [70, 55], [70, 5], [30, 5], [30, 55], [10, 55]] },
      preview: '<polygon points="50,95 90,55 70,55 70,5 30,5 30,55 10,55" fill="#6366f1" stroke="#4f46e5" stroke-width="2"/>',
      tags: ['arrow', 'down', 'direction'],
      isCustom: false,
      isFavorite: false,
      isPublic: true,
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      id: 'arrow-left',
      name: 'Arrow Left',
      category: 'arrows',
      type: 'polygon',
      data: { points: [[5, 50], [45, 10], [45, 30], [95, 30], [95, 70], [45, 70], [45, 90]] },
      preview: '<polygon points="5,50 45,10 45,30 95,30 95,70 45,70 45,90" fill="#6366f1" stroke="#4f46e5" stroke-width="2"/>',
      tags: ['arrow', 'left', 'direction'],
      isCustom: false,
      isFavorite: false,
      isPublic: true,
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      id: 'arrow-right',
      name: 'Arrow Right',
      category: 'arrows',
      type: 'polygon',
      data: { points: [[95, 50], [55, 10], [55, 30], [5, 30], [5, 70], [55, 70], [55, 90]] },
      preview: '<polygon points="95,50 55,10 55,30 5,30 5,70 55,70 55,90" fill="#6366f1" stroke="#4f46e5" stroke-width="2"/>',
      tags: ['arrow', 'right', 'direction'],
      isCustom: false,
      isFavorite: false,
      isPublic: true,
      createdAt: new Date(),
      updatedAt: new Date()
    },
    
    // Symbols
    {
      id: 'plus',
      name: 'Plus',
      category: 'symbols',
      type: 'group',
      data: { 
        shapes: [
          { type: 'rect', x: 40, y: 10, width: 20, height: 80 },
          { type: 'rect', x: 10, y: 40, width: 80, height: 20 }
        ]
      },
      preview: '<rect x="40" y="10" width="20" height="80" fill="#6b7280"/><rect x="10" y="40" width="80" height="20" fill="#6b7280"/>',
      tags: ['symbol', 'plus', 'add'],
      isCustom: false,
      isFavorite: false,
      isPublic: true,
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      id: 'minus',
      name: 'Minus',
      category: 'symbols',
      type: 'rect',
      data: { x: 10, y: 40, width: 80, height: 20 },
      preview: '<rect x="10" y="40" width="80" height="20" fill="#6b7280"/>',
      tags: ['symbol', 'minus', 'subtract'],
      isCustom: false,
      isFavorite: false,
      isPublic: true,
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      id: 'x',
      name: 'X',
      category: 'symbols',
      type: 'group',
      data: { 
        shapes: [
          { type: 'line', x1: 20, y1: 20, x2: 80, y2: 80, strokeWidth: 8 },
          { type: 'line', x1: 80, y1: 20, x2: 20, y2: 80, strokeWidth: 8 }
        ]
      },
      preview: '<line x1="20" y1="20" x2="80" y2="80" stroke="#6b7280" stroke-width="8"/><line x1="80" y1="20" x2="20" y2="80" stroke="#6b7280" stroke-width="8"/>',
      tags: ['symbol', 'x', 'close'],
      isCustom: false,
      isFavorite: false,
      isPublic: true,
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      id: 'check',
      name: 'Check',
      category: 'symbols',
      type: 'path',
      data: { path: 'M20,50 L40,70 L80,30' },
      preview: '<path d="M20,50 L40,70 L80,30" stroke="#10b981" stroke-width="8" fill="none" stroke-linecap="round" stroke-linejoin="round"/>',
      tags: ['symbol', 'check', 'tick'],
      isCustom: false,
      isFavorite: false,
      isPublic: true,
      createdAt: new Date(),
      updatedAt: new Date()
    }
  ];

  // Initialize shapes
  useEffect(() => {
    setShapes(sampleShapes);
    setFilteredShapes(sampleShapes);
  }, []);

  // Filter and sort shapes
  useEffect(() => {
    let filtered = shapes.filter(shape => {
      const matchesSearch = shape.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           shape.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
      const matchesCategory = selectedCategory === 'all' || shape.category === selectedCategory;
      return matchesSearch && matchesCategory;
    });

    // Sort shapes
    filtered.sort((a, b) => {
      let comparison = 0;
      switch (sortBy) {
        case 'name':
          comparison = a.name.localeCompare(b.name);
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

    setFilteredShapes(filtered);
  }, [shapes, searchQuery, selectedCategory, sortBy, sortOrder]);

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
    
    setShapes(prev => prev.map(shape => 
      shape.id === shapeId ? { ...shape, isFavorite: !shape.isFavorite } : shape
    ));
  }, []);

  // Handle shape copy
  const handleShapeCopy = useCallback((shape: ShapeDefinition) => {
    const data = {
      name: shape.name,
      category: shape.category,
      type: shape.type,
      data: shape.data,
      tags: shape.tags
    };
    
    navigator.clipboard.writeText(JSON.stringify(data, null, 2));
    setCopiedShape(shape.id);
    setTimeout(() => setCopiedShape(null), 2000);
  }, []);

  // Handle shape delete
  const handleShapeDelete = useCallback((shapeId: string) => {
    setShapes(prev => prev.filter(shape => shape.id !== shapeId));
  }, []);

  // Handle shape edit
  const handleShapeEdit = useCallback((shape: ShapeDefinition) => {
    setEditingShape(shape);
    setIsCreating(true);
  }, []);

  // Handle shape create
  const handleShapeCreate = useCallback(() => {
    setEditingShape(null);
    setIsCreating(true);
  }, []);

  // Handle shape save
  const handleShapeSave = useCallback((shapeData: Partial<ShapeDefinition>) => {
    if (editingShape) {
      // Update existing shape
      setShapes(prev => prev.map(shape => 
        shape.id === editingShape.id ? { ...shape, ...shapeData, updatedAt: new Date() } : shape
      ));
    } else {
      // Create new shape
      const newShape: ShapeDefinition = {
        id: `shape-${Date.now()}`,
        name: shapeData.name || 'New Shape',
        category: shapeData.category || 'custom',
        type: shapeData.type || 'custom',
        data: shapeData.data || {},
        preview: shapeData.preview || '',
        tags: shapeData.tags || [],
        isCustom: true,
        isFavorite: false,
        isPublic: false,
        author: 'User',
        createdAt: new Date(),
        updatedAt: new Date()
      };
      
      setShapes(prev => [newShape, ...prev]);
    }
    
    setIsCreating(false);
    setEditingShape(null);
  }, [editingShape]);

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
    a.download = 'shape-library.json';
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
    setFilteredShapes([]);
  }, []);

  const categories = [
    { id: 'all', label: 'All Shapes', count: shapes.length },
    { id: 'basic', label: 'Basic', count: shapes.filter(s => s.category === 'basic').length },
    { id: 'geometric', label: 'Geometric', count: shapes.filter(s => s.category === 'geometric').length },
    { id: 'arrows', label: 'Arrows', count: shapes.filter(s => s.category === 'arrows').length },
    { id: 'symbols', label: 'Symbols', count: shapes.filter(s => s.category === 'symbols').length },
    { id: 'custom', label: 'Custom', count: shapes.filter(s => s.category === 'custom').length },
    { id: 'icons', label: 'Icons', count: shapes.filter(s => s.category === 'icons').length }
  ];

  return (
    <div className={`bg-white rounded-lg shadow-xl border border-gray-200 p-4 w-full max-w-6xl ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold flex items-center">
          <Square size={20} className="mr-2" />
          Shape Library
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
            onClick={handleShapeCreate}
            className="p-2 text-gray-500 hover:text-gray-700"
            title="Create shape"
          >
            <PlusIcon size={16} />
          </button>
          <button
            onClick={clearAllShapes}
            className="p-2 text-gray-500 hover:text-gray-700"
            title="Clear all shapes"
          >
            <Trash2 size={16} />
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
            placeholder="Search shapes..."
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

      {/* Shape Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4 max-h-96 overflow-y-auto">
        {filteredShapes.map(shape => (
          <div
            key={shape.id}
            className="border border-gray-200 rounded-lg p-4 hover:border-gray-300 transition-colors cursor-pointer group"
            onClick={() => handleShapeSelect(shape)}
          >
            <div className="flex items-center justify-between mb-2">
              <h4 className="font-medium text-sm">{shape.name}</h4>
              <div className="flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleShapeFavorite(shape.id);
                  }}
                  className={`p-1 ${favoriteShapes.has(shape.id) ? 'text-yellow-500' : 'text-gray-400 hover:text-yellow-500'}`}
                  title="Toggle favorite"
                >
                  {favoriteShapes.has(shape.id) ? <StarIcon size={12} /> : <StarOff size={12} />}
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleShapeCopy(shape);
                  }}
                  className="p-1 text-gray-400 hover:text-gray-600"
                  title="Copy shape"
                >
                  {copiedShape === shape.id ? <Check size={12} /> : <Copy size={12} />}
                </button>
                {shape.isCustom && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleShapeEdit(shape);
                    }}
                    className="p-1 text-gray-400 hover:text-gray-600"
                    title="Edit shape"
                  >
                    <Edit size={12} />
                  </button>
                )}
                {shape.isCustom && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleShapeDelete(shape.id);
                    }}
                    className="p-1 text-gray-400 hover:text-red-600"
                    title="Delete shape"
                  >
                    <Trash2 size={12} />
                  </button>
                )}
              </div>
            </div>
            
            <div className="flex items-center justify-center h-16 mb-2">
              <svg
                width="60"
                height="60"
                viewBox="0 0 100 100"
                className="text-gray-600"
                dangerouslySetInnerHTML={{ __html: shape.preview }}
              />
            </div>
            
            <div className="flex items-center justify-between text-xs text-gray-500">
              <span className="capitalize">{shape.category}</span>
              <span>{shape.type}</span>
            </div>
            
            <div className="flex flex-wrap gap-1 mt-2">
              {shape.tags.slice(0, 2).map(tag => (
                <span
                  key={tag}
                  className="px-2 py-1 bg-gray-100 text-gray-600 rounded text-xs"
                >
                  {tag}
                </span>
              ))}
              {shape.tags.length > 2 && (
                <span className="px-2 py-1 bg-gray-100 text-gray-600 rounded text-xs">
                  +{shape.tags.length - 2}
                </span>
              )}
            </div>
            
            {shape.isCustom && (
              <div className="mt-2 text-xs text-blue-600 flex items-center">
                <Edit size={10} className="mr-1" />
                Custom
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Settings Panel */}
      {showSettings && (
        <div className="absolute top-12 right-2 z-30 bg-white rounded-lg shadow-xl border border-gray-200 p-4 w-64">
          <h4 className="font-semibold mb-3">Shape Settings</h4>
          
          <div className="space-y-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Show previews</label>
              <input
                type="checkbox"
                className="rounded"
                defaultChecked
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Auto-categorize</label>
              <input
                type="checkbox"
                className="rounded"
                defaultChecked
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Grid size</label>
              <input
                type="range"
                min="4"
                max="8"
                defaultValue="6"
                className="w-full"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Preview size</label>
              <input
                type="range"
                min="40"
                max="80"
                defaultValue="60"
                className="w-full"
              />
            </div>
          </div>
        </div>
      )}

      {/* Shape Creator Modal */}
      {isCreating && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-96">
            <h4 className="text-lg font-semibold mb-4">
              {editingShape ? 'Edit Shape' : 'Create Shape'}
            </h4>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Shape Name</label>
                <input
                  type="text"
                  value={editingShape?.name || ''}
                  onChange={(e) => setEditingShape(prev => prev ? { ...prev, name: e.target.value } : null)}
                  className="w-full px-3 py-2 border border-gray-300 rounded text-sm"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                <select
                  value={editingShape?.category || 'custom'}
                  onChange={(e) => setEditingShape(prev => prev ? { ...prev, category: e.target.value as any } : null)}
                  className="w-full px-3 py-2 border border-gray-300 rounded text-sm"
                >
                  <option value="basic">Basic</option>
                  <option value="geometric">Geometric</option>
                  <option value="arrows">Arrows</option>
                  <option value="symbols">Symbols</option>
                  <option value="custom">Custom</option>
                  <option value="icons">Icons</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
                <select
                  value={editingShape?.type || 'custom'}
                  onChange={(e) => setEditingShape(prev => prev ? { ...prev, type: e.target.value as any } : null)}
                  className="w-full px-3 py-2 border border-gray-300 rounded text-sm"
                >
                  <option value="rect">Rectangle</option>
                  <option value="circle">Circle</option>
                  <option value="polygon">Polygon</option>
                  <option value="path">Path</option>
                  <option value="group">Group</option>
                  <option value="custom">Custom</option>
                </select>
              </div>
              
              <div className="flex space-x-2">
                <button
                  onClick={() => handleShapeSave(editingShape || {})}
                  className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                >
                  {editingShape ? 'Update' : 'Create'}
                </button>
                <button
                  onClick={() => {
                    setIsCreating(false);
                    setEditingShape(null);
                  }}
                  className="px-4 py-2 bg-gray-300 text-gray-700 rounded hover:bg-gray-400"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ShapeLibrary;
