import React, { useState, useCallback, useRef } from 'react';
import { 
  Filter, 
  Settings, 
  Eye, 
  EyeOff, 
  RotateCcw,
  Download,
  Upload,
  Save,
  Trash2,
  Copy,
  Check,
  X,
  Plus,
  Minus,
  RefreshCw,
  Zap,
  Sparkles,
  Droplets,
  Wind,
  Flame,
  Snowflake,
  Heart,
  Star,
  Palette,
  Edit,
  Circle as Blur,
  Sun,
  Contrast,
  StarOff,
  Search
} from 'lucide-react';

export interface FilterEffect {
  id: string;
  name: string;
  category: 'adjustment' | 'blur' | 'distort' | 'stylize' | 'color' | 'custom';
  type: 'adjustment' | 'filter' | 'effect' | 'transform';
  parameters: Record<string, any>;
  preview: string;
  isEnabled: boolean;
  intensity: number;
  blendMode: 'normal' | 'multiply' | 'screen' | 'overlay' | 'soft-light' | 'hard-light' | 'color-dodge' | 'color-burn' | 'darken' | 'lighten' | 'difference' | 'exclusion';
  opacity: number;
  isCustom: boolean;
  isFavorite: boolean;
  createdAt: Date;
  updatedAt: Date;
}

interface EnhancedFilterToolProps {
  currentFilters: FilterEffect[];
  onFiltersChange: (filters: FilterEffect[]) => void;
  onClose?: () => void;
}

const filterPresets: FilterEffect[] = [
  // Adjustments
  {
    id: 'brightness',
    name: 'Brightness',
    category: 'adjustment',
    type: 'adjustment',
    parameters: { value: 0, min: -100, max: 100 },
    preview: 'Adjust brightness',
    isEnabled: false,
    intensity: 0,
    blendMode: 'normal',
    opacity: 100,
    isCustom: false,
    isFavorite: false,
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    id: 'contrast',
    name: 'Contrast',
    category: 'adjustment',
    type: 'adjustment',
    parameters: { value: 0, min: -100, max: 100 },
    preview: 'Adjust contrast',
    isEnabled: false,
    intensity: 0,
    blendMode: 'normal',
    opacity: 100,
    isCustom: false,
    isFavorite: false,
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    id: 'saturation',
    name: 'Saturation',
    category: 'adjustment',
    type: 'adjustment',
    parameters: { value: 0, min: -100, max: 100 },
    preview: 'Adjust saturation',
    isEnabled: false,
    intensity: 0,
    blendMode: 'normal',
    opacity: 100,
    isCustom: false,
    isFavorite: false,
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    id: 'hue',
    name: 'Hue',
    category: 'adjustment',
    type: 'adjustment',
    parameters: { value: 0, min: -180, max: 180 },
    preview: 'Adjust hue',
    isEnabled: false,
    intensity: 0,
    blendMode: 'normal',
    opacity: 100,
    isCustom: false,
    isFavorite: false,
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    id: 'exposure',
    name: 'Exposure',
    category: 'adjustment',
    type: 'adjustment',
    parameters: { value: 0, min: -100, max: 100 },
    preview: 'Adjust exposure',
    isEnabled: false,
    intensity: 0,
    blendMode: 'normal',
    opacity: 100,
    isCustom: false,
    isFavorite: false,
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    id: 'gamma',
    name: 'Gamma',
    category: 'adjustment',
    type: 'adjustment',
    parameters: { value: 1, min: 0.1, max: 3 },
    preview: 'Adjust gamma',
    isEnabled: false,
    intensity: 0,
    blendMode: 'normal',
    opacity: 100,
    isCustom: false,
    isFavorite: false,
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    id: 'vibrance',
    name: 'Vibrance',
    category: 'adjustment',
    type: 'adjustment',
    parameters: { value: 0, min: -100, max: 100 },
    preview: 'Adjust vibrance',
    isEnabled: false,
    intensity: 0,
    blendMode: 'normal',
    opacity: 100,
    isCustom: false,
    isFavorite: false,
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    id: 'clarity',
    name: 'Clarity',
    category: 'adjustment',
    type: 'adjustment',
    parameters: { value: 0, min: -100, max: 100 },
    preview: 'Adjust clarity',
    isEnabled: false,
    intensity: 0,
    blendMode: 'normal',
    opacity: 100,
    isCustom: false,
    isFavorite: false,
    createdAt: new Date(),
    updatedAt: new Date()
  },

  // Blur Effects
  {
    id: 'gaussian-blur',
    name: 'Gaussian Blur',
    category: 'blur',
    type: 'filter',
    parameters: { radius: 0, min: 0, max: 50 },
    preview: 'Gaussian blur effect',
    isEnabled: false,
    intensity: 0,
    blendMode: 'normal',
    opacity: 100,
    isCustom: false,
    isFavorite: false,
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    id: 'motion-blur',
    name: 'Motion Blur',
    category: 'blur',
    type: 'filter',
    parameters: { radius: 0, angle: 0, min: 0, max: 50 },
    preview: 'Motion blur effect',
    isEnabled: false,
    intensity: 0,
    blendMode: 'normal',
    opacity: 100,
    isCustom: false,
    isFavorite: false,
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    id: 'radial-blur',
    name: 'Radial Blur',
    category: 'blur',
    type: 'filter',
    parameters: { radius: 0, centerX: 0.5, centerY: 0.5, min: 0, max: 50 },
    preview: 'Radial blur effect',
    isEnabled: false,
    intensity: 0,
    blendMode: 'normal',
    opacity: 100,
    isCustom: false,
    isFavorite: false,
    createdAt: new Date(),
    updatedAt: new Date()
  },

  // Color Effects
  {
    id: 'grayscale',
    name: 'Grayscale',
    category: 'color',
    type: 'filter',
    parameters: { intensity: 0, min: 0, max: 100 },
    preview: 'Grayscale effect',
    isEnabled: false,
    intensity: 0,
    blendMode: 'normal',
    opacity: 100,
    isCustom: false,
    isFavorite: false,
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    id: 'sepia',
    name: 'Sepia',
    category: 'color',
    type: 'filter',
    parameters: { intensity: 0, min: 0, max: 100 },
    preview: 'Sepia effect',
    isEnabled: false,
    intensity: 0,
    blendMode: 'normal',
    opacity: 100,
    isCustom: false,
    isFavorite: false,
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    id: 'invert',
    name: 'Invert',
    category: 'color',
    type: 'filter',
    parameters: { intensity: 0, min: 0, max: 100 },
    preview: 'Invert effect',
    isEnabled: false,
    intensity: 0,
    blendMode: 'normal',
    opacity: 100,
    isCustom: false,
    isFavorite: false,
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    id: 'vintage',
    name: 'Vintage',
    category: 'color',
    type: 'filter',
    parameters: { intensity: 0, vignette: 0, min: 0, max: 100 },
    preview: 'Vintage effect',
    isEnabled: false,
    intensity: 0,
    blendMode: 'normal',
    opacity: 100,
    isCustom: false,
    isFavorite: false,
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    id: 'cross-process',
    name: 'Cross Process',
    category: 'color',
    type: 'filter',
    parameters: { intensity: 0, contrast: 0, min: 0, max: 100 },
    preview: 'Cross process effect',
    isEnabled: false,
    intensity: 0,
    blendMode: 'normal',
    opacity: 100,
    isCustom: false,
    isFavorite: false,
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    id: 'lomo',
    name: 'Lomo',
    category: 'color',
    type: 'filter',
    parameters: { intensity: 0, vignette: 0, saturation: 0, min: 0, max: 100 },
    preview: 'Lomo effect',
    isEnabled: false,
    intensity: 0,
    blendMode: 'normal',
    opacity: 100,
    isCustom: false,
    isFavorite: false,
    createdAt: new Date(),
    updatedAt: new Date()
  },

  // Stylize Effects
  {
    id: 'oil-painting',
    name: 'Oil Painting',
    category: 'stylize',
    type: 'effect',
    parameters: { intensity: 0, brushSize: 5, min: 0, max: 100 },
    preview: 'Oil painting effect',
    isEnabled: false,
    intensity: 0,
    blendMode: 'normal',
    opacity: 100,
    isCustom: false,
    isFavorite: false,
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    id: 'watercolor',
    name: 'Watercolor',
    category: 'stylize',
    type: 'effect',
    parameters: { intensity: 0, brushSize: 3, min: 0, max: 100 },
    preview: 'Watercolor effect',
    isEnabled: false,
    intensity: 0,
    blendMode: 'normal',
    opacity: 100,
    isCustom: false,
    isFavorite: false,
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    id: 'pencil-sketch',
    name: 'Pencil Sketch',
    category: 'stylize',
    type: 'effect',
    parameters: { intensity: 0, strokeWidth: 1, min: 0, max: 100 },
    preview: 'Pencil sketch effect',
    isEnabled: false,
    intensity: 0,
    blendMode: 'normal',
    opacity: 100,
    isCustom: false,
    isFavorite: false,
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    id: 'posterize',
    name: 'Posterize',
    category: 'stylize',
    type: 'effect',
    parameters: { levels: 4, min: 2, max: 16 },
    preview: 'Posterize effect',
    isEnabled: false,
    intensity: 0,
    blendMode: 'normal',
    opacity: 100,
    isCustom: false,
    isFavorite: false,
    createdAt: new Date(),
    updatedAt: new Date()
  }
];

export const EnhancedFilterTool: React.FC<EnhancedFilterToolProps> = ({
  currentFilters,
  onFiltersChange,
  onClose
}) => {
  const [activeTab, setActiveTab] = useState<'presets' | 'adjustments' | 'effects' | 'custom'>('presets');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [copiedFilter, setCopiedFilter] = useState<string | null>(null);

  const categories = [
    { id: 'all', name: 'All', icon: Filter },
    { id: 'adjustment', name: 'Adjustments', icon: Settings },
    { id: 'blur', name: 'Blur', icon: Blur },
    { id: 'color', name: 'Color', icon: Palette },
    { id: 'stylize', name: 'Stylize', icon: Sparkles },
    { id: 'custom', name: 'Custom', icon: Edit }
  ];

  const filteredPresets = filterPresets.filter(preset => {
    const matchesSearch = preset.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || preset.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const handleFilterToggle = useCallback((filterId: string) => {
    const updatedFilters = currentFilters.map(filter =>
      filter.id === filterId
        ? { ...filter, isEnabled: !filter.isEnabled }
        : filter
    );
    onFiltersChange(updatedFilters);
  }, [currentFilters, onFiltersChange]);

  const handleFilterAdd = useCallback((preset: FilterEffect) => {
    const newFilter = { ...preset, isEnabled: true };
    onFiltersChange([...currentFilters, newFilter]);
  }, [currentFilters, onFiltersChange]);

  const handleFilterRemove = useCallback((filterId: string) => {
    onFiltersChange(currentFilters.filter(filter => filter.id !== filterId));
  }, [currentFilters, onFiltersChange]);

  const handleFilterUpdate = useCallback((filterId: string, updates: Partial<FilterEffect>) => {
    const updatedFilters = currentFilters.map(filter =>
      filter.id === filterId
        ? { ...filter, ...updates, updatedAt: new Date() }
        : filter
    );
    onFiltersChange(updatedFilters);
  }, [currentFilters, onFiltersChange]);

  const handleFilterCopy = useCallback((filterId: string) => {
    const filter = currentFilters.find(f => f.id === filterId);
    if (filter) {
      const copiedFilter = {
        ...filter,
        id: `${filter.id}-copy-${Date.now()}`,
        name: `${filter.name} Copy`,
        isCustom: true,
        createdAt: new Date(),
        updatedAt: new Date()
      };
      onFiltersChange([...currentFilters, copiedFilter]);
      setCopiedFilter(filterId);
      setTimeout(() => setCopiedFilter(null), 2000);
    }
  }, [currentFilters, onFiltersChange]);

  const handleFilterReset = useCallback(() => {
    onFiltersChange([]);
  }, [onFiltersChange]);

  const getCategoryIcon = (category: string) => {
    const categoryData = categories.find(c => c.id === category);
    return categoryData?.icon || Filter;
  };

  return (
    <div className="bg-white border border-gray-200 rounded-lg shadow-lg p-4 w-96">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold flex items-center">
          <Filter className="w-5 h-5 mr-2" />
          Filter Tool
        </h3>
        {onClose && (
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* Search */}
      <div className="mb-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <input
            type="text"
            placeholder="Search filters..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
      </div>

      {/* Category Filter */}
      <div className="mb-4">
        <div className="flex flex-wrap gap-1">
          {categories.map(category => (
            <button
              key={category.id}
              onClick={() => setSelectedCategory(category.id)}
              className={`px-3 py-1 text-xs font-medium rounded-full flex items-center space-x-1 ${
                selectedCategory === category.id
                  ? 'bg-blue-100 text-blue-700'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              <category.icon className="w-3 h-3" />
              <span>{category.name}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex mb-4 border-b">
        {[
          { id: 'presets', label: 'Presets', icon: Filter },
          { id: 'adjustments', label: 'Adjustments', icon: Settings },
          { id: 'effects', label: 'Effects', icon: Sparkles },
          { id: 'custom', label: 'Custom', icon: Edit }
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`px-3 py-2 text-sm font-medium flex items-center space-x-1 ${
              activeTab === tab.id
                ? 'text-blue-600 border-b-2 border-blue-600'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            <tab.icon className="w-4 h-4" />
            <span>{tab.label}</span>
          </button>
        ))}
      </div>

      {/* Active Filters */}
      {currentFilters.length > 0 && (
        <div className="mb-4 p-3 bg-gray-50 rounded-lg">
          <div className="flex items-center justify-between mb-2">
            <h4 className="text-sm font-medium">Active Filters</h4>
            <button
              onClick={handleFilterReset}
              className="text-xs text-red-600 hover:text-red-700 flex items-center space-x-1"
            >
              <RotateCcw className="w-3 h-3" />
              <span>Reset All</span>
            </button>
          </div>
          <div className="space-y-2">
            {currentFilters.map(filter => (
              <div key={filter.id} className="flex items-center justify-between p-2 bg-white rounded border">
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={filter.isEnabled}
                    onChange={() => handleFilterToggle(filter.id)}
                    className="rounded"
                  />
                  <span className="text-sm font-medium">{filter.name}</span>
                  <span className="text-xs text-gray-500">{filter.category}</span>
                </div>
                <div className="flex items-center space-x-1">
                  <button
                    onClick={() => handleFilterCopy(filter.id)}
                    className="p-1 text-gray-400 hover:text-gray-600"
                    title="Copy filter"
                  >
                    {copiedFilter === filter.id ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                  </button>
                  <button
                    onClick={() => handleFilterRemove(filter.id)}
                    className="p-1 text-gray-400 hover:text-red-600"
                    title="Remove filter"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Filter Presets */}
      {activeTab === 'presets' && (
        <div className="space-y-2 max-h-64 overflow-y-auto">
          {filteredPresets.map(preset => (
            <div key={preset.id} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg hover:bg-gray-50">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 rounded bg-gray-100 flex items-center justify-center">
                  {React.createElement(getCategoryIcon(preset.category), { className: "w-4 h-4 text-gray-600" })}
                </div>
                <div>
                  <div className="text-sm font-medium">{preset.name}</div>
                  <div className="text-xs text-gray-500">{preset.preview}</div>
                </div>
              </div>
              <button
                onClick={() => handleFilterAdd(preset)}
                className="px-3 py-1 text-xs bg-blue-600 text-white rounded hover:bg-blue-700"
              >
                Add
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Adjustments Tab */}
      {activeTab === 'adjustments' && (
        <div className="space-y-4">
          {filterPresets.filter(p => p.category === 'adjustment').map(preset => (
            <div key={preset.id} className="border border-gray-200 rounded-lg p-3">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium">{preset.name}</span>
                <button
                  onClick={() => handleFilterAdd(preset)}
                  className="px-2 py-1 text-xs bg-blue-600 text-white rounded hover:bg-blue-700"
                >
                  Add
                </button>
              </div>
              <div className="text-xs text-gray-500 mb-2">{preset.preview}</div>
              <div className="space-y-2">
                {Object.entries(preset.parameters).map(([key, value]) => (
                  <div key={key}>
                    <label className="block text-xs text-gray-600 mb-1 capitalize">
                      {key.replace(/([A-Z])/g, ' $1').trim()}
                    </label>
                    <input
                      type="range"
                      min={value.min || 0}
                      max={value.max || 100}
                      defaultValue={value.value || 0}
                      className="w-full"
                    />
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Effects Tab */}
      {activeTab === 'effects' && (
        <div className="space-y-4">
          {filterPresets.filter(p => p.category === 'stylize' || p.category === 'color').map(preset => (
            <div key={preset.id} className="border border-gray-200 rounded-lg p-3">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium">{preset.name}</span>
                <button
                  onClick={() => handleFilterAdd(preset)}
                  className="px-2 py-1 text-xs bg-blue-600 text-white rounded hover:bg-blue-700"
                >
                  Add
                </button>
              </div>
              <div className="text-xs text-gray-500 mb-2">{preset.preview}</div>
              <div className="space-y-2">
                {Object.entries(preset.parameters).map(([key, value]) => (
                  <div key={key}>
                    <label className="block text-xs text-gray-600 mb-1 capitalize">
                      {key.replace(/([A-Z])/g, ' $1').trim()}
                    </label>
                    <input
                      type="range"
                      min={value.min || 0}
                      max={value.max || 100}
                      defaultValue={value.value || 0}
                      className="w-full"
                    />
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Custom Tab */}
      {activeTab === 'custom' && (
        <div className="text-center py-8">
          <Edit className="w-12 h-12 mx-auto text-gray-400 mb-4" />
          <h4 className="text-sm font-medium text-gray-600 mb-2">Custom Filters</h4>
          <p className="text-xs text-gray-500 mb-4">Create and manage your own custom filter effects</p>
          <button className="px-4 py-2 text-sm bg-blue-600 text-white rounded hover:bg-blue-700">
            Create Custom Filter
          </button>
        </div>
      )}
    </div>
  );
};
