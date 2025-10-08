/**
 * Professional Color Palette System
 * Advanced palette management with themes, swatches, and color harmony
 */

import React, { useState, useCallback, useRef } from 'react';
import { 
  Palette, 
  Plus, 
  Trash2, 
  Download, 
  Upload, 
  Star, 
  StarOff,
  Copy,
  Check,
  RotateCcw,
  Save,
  Edit3,
  X,
  MoreHorizontal
} from 'lucide-react';
import { Color } from './ColorPicker';

export interface ColorSwatch {
  id: string;
  color: Color;
  name: string;
  tags: string[];
  isFavorite: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface ColorPalette {
  id: string;
  name: string;
  description: string;
  swatches: ColorSwatch[];
  isPublic: boolean;
  isFavorite: boolean;
  createdAt: Date;
  updatedAt: Date;
  tags: string[];
}

export interface ColorHarmony {
  type: 'monochromatic' | 'analogous' | 'complementary' | 'triadic' | 'tetradic' | 'split-complementary';
  colors: Color[];
  name: string;
}

export interface ColorPaletteProps {
  onColorSelect: (color: Color) => void;
  onClose?: () => void;
  className?: string;
}

const ColorPalette: React.FC<ColorPaletteProps> = ({
  onColorSelect,
  onClose,
  className = ''
}) => {
  const [activeTab, setActiveTab] = useState<'swatches' | 'palettes' | 'harmony' | 'themes'>('swatches');
  const [selectedPalette, setSelectedPalette] = useState<string | null>(null);
  const [editingSwatch, setEditingSwatch] = useState<string | null>(null);
  const [showCreatePalette, setShowCreatePalette] = useState(false);
  const [newPaletteName, setNewPaletteName] = useState('');
  const [newSwatchName, setNewSwatchName] = useState('');
  const [copiedSwatch, setCopiedSwatch] = useState<string | null>(null);
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Sample palettes
  const [palettes, setPalettes] = useState<ColorPalette[]>([
    {
      id: 'material-design',
      name: 'Material Design',
      description: 'Google Material Design color palette',
      isPublic: true,
      isFavorite: true,
      createdAt: new Date(),
      updatedAt: new Date(),
      tags: ['material', 'google', 'ui'],
      swatches: [
        { id: 'md-red', color: { r: 244, g: 67, b: 54, a: 1, h: 4, s: 81, l: 58, hex: '#F44336', hsl: 'hsl(4, 81%, 58%)', rgb: 'rgb(244, 67, 54)', rgba: 'rgba(244, 67, 54, 1)', hsv: { h: 4, s: 78, v: 96 }, cmyk: { c: 0, m: 73, y: 78, k: 4 } }, name: 'Red 500', tags: ['primary', 'error'], isFavorite: false, createdAt: new Date(), updatedAt: new Date() },
        { id: 'md-blue', color: { r: 33, g: 150, b: 243, a: 1, h: 207, s: 89, l: 54, hex: '#2196F3', hsl: 'hsl(207, 89%, 54%)', rgb: 'rgb(33, 150, 243)', rgba: 'rgba(33, 150, 243, 1)', hsv: { h: 207, s: 86, v: 95 }, cmyk: { c: 86, m: 38, y: 0, k: 5 } }, name: 'Blue 500', tags: ['primary', 'info'], isFavorite: false, createdAt: new Date(), updatedAt: new Date() },
        { id: 'md-green', color: { r: 76, g: 175, b: 80, a: 1, h: 122, s: 39, l: 49, hex: '#4CAF50', hsl: 'hsl(122, 39%, 49%)', rgb: 'rgb(76, 175, 80)', rgba: 'rgba(76, 175, 80, 1)', hsv: { h: 122, s: 57, v: 69 }, cmyk: { c: 57, m: 0, y: 54, k: 31 } }, name: 'Green 500', tags: ['success', 'nature'], isFavorite: false, createdAt: new Date(), updatedAt: new Date() },
        { id: 'md-orange', color: { r: 255, g: 152, b: 0, a: 1, h: 36, s: 100, l: 50, hex: '#FF9800', hsl: 'hsl(36, 100%, 50%)', rgb: 'rgb(255, 152, 0)', rgba: 'rgba(255, 152, 0, 1)', hsv: { h: 36, s: 100, v: 100 }, cmyk: { c: 0, m: 40, y: 100, k: 0 } }, name: 'Orange 500', tags: ['warning', 'energy'], isFavorite: false, createdAt: new Date(), updatedAt: new Date() },
        { id: 'md-purple', color: { r: 156, g: 39, b: 176, a: 1, h: 291, s: 64, l: 42, hex: '#9C27B0', hsl: 'hsl(291, 64%, 42%)', rgb: 'rgb(156, 39, 176)', rgba: 'rgba(156, 39, 176, 1)', hsv: { h: 291, s: 78, v: 69 }, cmyk: { c: 11, m: 78, y: 0, k: 31 } }, name: 'Purple 500', tags: ['secondary', 'creative'], isFavorite: false, createdAt: new Date(), updatedAt: new Date() }
      ]
    },
    {
      id: 'flat-ui',
      name: 'Flat UI',
      description: 'Flat UI design color palette',
      isPublic: true,
      isFavorite: false,
      createdAt: new Date(),
      updatedAt: new Date(),
      tags: ['flat', 'ui', 'modern'],
      swatches: [
        { id: 'flat-turquoise', color: { r: 26, g: 188, b: 156, a: 1, h: 168, s: 76, l: 42, hex: '#1ABC9C', hsl: 'hsl(168, 76%, 42%)', rgb: 'rgb(26, 188, 156)', rgba: 'rgba(26, 188, 156, 1)', hsv: { h: 168, s: 86, v: 74 }, cmyk: { c: 86, m: 0, y: 17, k: 26 } }, name: 'Turquoise', tags: ['primary', 'ocean'], isFavorite: false, createdAt: new Date(), updatedAt: new Date() },
        { id: 'flat-emerald', color: { r: 46, g: 204, b: 113, a: 1, h: 145, s: 63, l: 49, hex: '#2ECC71', hsl: 'hsl(145, 63%, 49%)', rgb: 'rgb(46, 204, 113)', rgba: 'rgba(46, 204, 113, 1)', hsv: { h: 145, s: 77, v: 80 }, cmyk: { c: 77, m: 0, y: 45, k: 20 } }, name: 'Emerald', tags: ['success', 'nature'], isFavorite: false, createdAt: new Date(), updatedAt: new Date() },
        { id: 'flat-peter-river', color: { r: 52, g: 152, b: 219, a: 1, h: 204, s: 70, l: 53, hex: '#3498DB', hsl: 'hsl(204, 70%, 53%)', rgb: 'rgb(52, 152, 219)', rgba: 'rgba(52, 152, 219, 1)', hsv: { h: 204, s: 76, v: 86 }, cmyk: { c: 76, m: 31, y: 0, k: 14 } }, name: 'Peter River', tags: ['info', 'sky'], isFavorite: false, createdAt: new Date(), updatedAt: new Date() },
        { id: 'flat-amethyst', color: { r: 155, g: 89, b: 182, a: 1, h: 282, s: 39, l: 53, hex: '#9B59B6', hsl: 'hsl(282, 39%, 53%)', rgb: 'rgb(155, 89, 182)', rgba: 'rgba(155, 89, 182, 1)', hsv: { h: 282, s: 51, v: 71 }, cmyk: { c: 15, m: 51, y: 0, k: 29 } }, name: 'Amethyst', tags: ['secondary', 'royal'], isFavorite: false, createdAt: new Date(), updatedAt: new Date() },
        { id: 'flat-wet-asphalt', color: { r: 52, g: 73, b: 94, a: 1, h: 210, s: 29, l: 29, hex: '#34495E', hsl: 'hsl(210, 29%, 29%)', rgb: 'rgb(52, 73, 94)', rgba: 'rgba(52, 73, 94, 1)', hsv: { h: 210, s: 45, v: 37 }, cmyk: { c: 45, m: 22, y: 0, k: 63 } }, name: 'Wet Asphalt', tags: ['dark', 'neutral'], isFavorite: false, createdAt: new Date(), updatedAt: new Date() }
      ]
    }
  ]);

  // Color harmony generator
  const generateColorHarmony = useCallback((baseColor: Color, type: ColorHarmony['type']): ColorHarmony => {
    const { h, s, l } = baseColor;
    
    switch (type) {
      case 'monochromatic':
        return {
          type: 'monochromatic',
          name: 'Monochromatic',
          colors: [
            baseColor,
            { ...baseColor, l: Math.max(0, l - 20) },
            { ...baseColor, l: Math.min(100, l + 20) },
            { ...baseColor, s: Math.max(0, s - 30) },
            { ...baseColor, s: Math.min(100, s + 30) }
          ]
        };
        
      case 'analogous':
        return {
          type: 'analogous',
          name: 'Analogous',
          colors: [
            baseColor,
            { ...baseColor, h: (h + 30) % 360 },
            { ...baseColor, h: (h - 30 + 360) % 360 },
            { ...baseColor, h: (h + 60) % 360 },
            { ...baseColor, h: (h - 60 + 360) % 360 }
          ]
        };
        
      case 'complementary':
        return {
          type: 'complementary',
          name: 'Complementary',
          colors: [
            baseColor,
            { ...baseColor, h: (h + 180) % 360 },
            { ...baseColor, h: (h + 180) % 360, l: Math.max(0, l - 20) },
            { ...baseColor, h: (h + 180) % 360, l: Math.min(100, l + 20) }
          ]
        };
        
      case 'triadic':
        return {
          type: 'triadic',
          name: 'Triadic',
          colors: [
            baseColor,
            { ...baseColor, h: (h + 120) % 360 },
            { ...baseColor, h: (h + 240) % 360 }
          ]
        };
        
      case 'tetradic':
        return {
          type: 'tetradic',
          name: 'Tetradic',
          colors: [
            baseColor,
            { ...baseColor, h: (h + 90) % 360 },
            { ...baseColor, h: (h + 180) % 360 },
            { ...baseColor, h: (h + 270) % 360 }
          ]
        };
        
      case 'split-complementary':
        return {
          type: 'split-complementary',
          name: 'Split Complementary',
          colors: [
            baseColor,
            { ...baseColor, h: (h + 150) % 360 },
            { ...baseColor, h: (h + 210) % 360 }
          ]
        };
        
      default:
        return { type: 'monochromatic', name: 'Monochromatic', colors: [baseColor] };
    }
  }, []);

  // Handle swatch click
  const handleSwatchClick = useCallback((swatch: ColorSwatch) => {
    onColorSelect(swatch.color);
  }, [onColorSelect]);

  // Handle swatch copy
  const handleSwatchCopy = useCallback((swatchId: string) => {
    const palette = palettes.find(p => p.id === selectedPalette);
    const swatch = palette?.swatches.find(s => s.id === swatchId);
    if (swatch) {
      navigator.clipboard.writeText(swatch.color.hex);
      setCopiedSwatch(swatchId);
      setTimeout(() => setCopiedSwatch(null), 2000);
    }
  }, [palettes, selectedPalette]);

  // Handle swatch favorite toggle
  const handleSwatchFavorite = useCallback((swatchId: string) => {
    setPalettes(prev => prev.map(palette => ({
      ...palette,
      swatches: palette.swatches.map(swatch => 
        swatch.id === swatchId 
          ? { ...swatch, isFavorite: !swatch.isFavorite }
          : swatch
      )
    })));
  }, []);

  // Handle palette creation
  const handleCreatePalette = useCallback(() => {
    if (!newPaletteName.trim()) return;
    
    const newPalette: ColorPalette = {
      id: `palette-${Date.now()}`,
      name: newPaletteName,
      description: '',
      swatches: [],
      isPublic: false,
      isFavorite: false,
      createdAt: new Date(),
      updatedAt: new Date(),
      tags: []
    };
    
    setPalettes(prev => [newPalette, ...prev]);
    setSelectedPalette(newPalette.id);
    setNewPaletteName('');
    setShowCreatePalette(false);
  }, [newPaletteName]);

  // Handle palette export
  const handleExportPalette = useCallback((palette: ColorPalette) => {
    const data = {
      name: palette.name,
      description: palette.description,
      colors: palette.swatches.map(swatch => ({
        name: swatch.name,
        hex: swatch.color.hex,
        rgb: swatch.color.rgb,
        hsl: swatch.color.hsl
      }))
    };
    
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${palette.name.replace(/\s+/g, '-').toLowerCase()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }, []);

  // Handle palette import
  const handleImportPalette = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = JSON.parse(e.target?.result as string);
        const newPalette: ColorPalette = {
          id: `palette-${Date.now()}`,
          name: data.name,
          description: data.description || '',
          swatches: data.colors.map((color: any, index: number) => ({
            id: `swatch-${Date.now()}-${index}`,
            color: {
              r: parseInt(color.hex.slice(1, 3), 16),
              g: parseInt(color.hex.slice(3, 5), 16),
              b: parseInt(color.hex.slice(5, 7), 16),
              a: 1,
              h: 0, s: 0, l: 0, // Will be calculated
              hex: color.hex,
              hsl: color.hsl,
              rgb: color.rgb,
              rgba: color.rgb.replace('rgb', 'rgba').replace(')', ', 1)'),
              hsv: { h: 0, s: 0, v: 0 },
              cmyk: { c: 0, m: 0, y: 0, k: 0 }
            },
            name: color.name,
            tags: [],
            isFavorite: false,
            createdAt: new Date(),
            updatedAt: new Date()
          })),
          isPublic: false,
          isFavorite: false,
          createdAt: new Date(),
          updatedAt: new Date(),
          tags: []
        };
        
        setPalettes(prev => [newPalette, ...prev]);
        setSelectedPalette(newPalette.id);
      } catch (error) {
        console.error('Failed to import palette:', error);
      }
    };
    reader.readAsText(file);
  }, []);

  const currentPalette = palettes.find(p => p.id === selectedPalette);

  return (
    <div className={`bg-white rounded-lg shadow-xl border border-gray-200 p-4 w-96 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold flex items-center">
          <Palette size={20} className="mr-2" />
          Color Palette
        </h3>
        {onClose && (
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <X size={20} />
          </button>
        )}
      </div>

      {/* Tabs */}
      <div className="flex space-x-1 mb-4">
        {[
          { id: 'swatches', label: 'Swatches', icon: Palette },
          { id: 'palettes', label: 'Palettes', icon: Save },
          { id: 'harmony', label: 'Harmony', icon: RotateCcw },
          { id: 'themes', label: 'Themes', icon: Star }
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`flex items-center space-x-1 px-3 py-1 rounded text-sm ${
              activeTab === tab.id 
                ? 'bg-blue-100 text-blue-700' 
                : 'text-gray-600 hover:text-gray-800'
            }`}
          >
            <tab.icon size={14} />
            <span>{tab.label}</span>
          </button>
        ))}
      </div>

      {/* Swatches Tab */}
      {activeTab === 'swatches' && (
        <div className="space-y-4">
          {/* Palette Selector */}
          <div className="flex items-center space-x-2">
            <select
              value={selectedPalette || ''}
              onChange={(e) => setSelectedPalette(e.target.value)}
              className="flex-1 px-3 py-2 border border-gray-300 rounded text-sm"
            >
              <option value="">Select a palette</option>
              {palettes.map(palette => (
                <option key={palette.id} value={palette.id}>
                  {palette.name}
                </option>
              ))}
            </select>
            <button
              onClick={() => setShowCreatePalette(true)}
              className="p-2 text-blue-600 hover:text-blue-700"
              title="Create new palette"
            >
              <Plus size={16} />
            </button>
          </div>

          {/* Create Palette Modal */}
          {showCreatePalette && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
              <div className="bg-white rounded-lg p-6 w-80">
                <h4 className="text-lg font-semibold mb-4">Create New Palette</h4>
                <input
                  type="text"
                  value={newPaletteName}
                  onChange={(e) => setNewPaletteName(e.target.value)}
                  placeholder="Palette name"
                  className="w-full px-3 py-2 border border-gray-300 rounded mb-4"
                />
                <div className="flex space-x-2">
                  <button
                    onClick={handleCreatePalette}
                    className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                  >
                    Create
                  </button>
                  <button
                    onClick={() => setShowCreatePalette(false)}
                    className="px-4 py-2 bg-gray-300 text-gray-700 rounded hover:bg-gray-400"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Swatches Grid */}
          {currentPalette && (
            <div className="grid grid-cols-6 gap-2">
              {currentPalette.swatches.map(swatch => (
                <div
                  key={swatch.id}
                  className="relative group"
                >
                  <button
                    onClick={() => handleSwatchClick(swatch)}
                    className="w-12 h-12 rounded border-2 border-gray-300 hover:border-gray-400 transition-colors"
                    style={{ backgroundColor: swatch.color.hex }}
                    title={swatch.name}
                  />
                  
                  {/* Swatch Actions */}
                  <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity">
                    <div className="absolute top-0 right-0 flex space-x-1">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleSwatchCopy(swatch.id);
                        }}
                        className="p-1 bg-white rounded shadow text-gray-600 hover:text-gray-800"
                        title="Copy color"
                      >
                        {copiedSwatch === swatch.id ? <Check size={12} /> : <Copy size={12} />}
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleSwatchFavorite(swatch.id);
                        }}
                        className="p-1 bg-white rounded shadow text-gray-600 hover:text-gray-800"
                        title="Toggle favorite"
                      >
                        {swatch.isFavorite ? <Star size={12} className="text-yellow-500" /> : <StarOff size={12} />}
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Palette Actions */}
          {currentPalette && (
            <div className="flex space-x-2">
              <button
                onClick={() => handleExportPalette(currentPalette)}
                className="flex items-center space-x-1 px-3 py-1 text-sm bg-gray-100 hover:bg-gray-200 rounded"
              >
                <Download size={14} />
                <span>Export</span>
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept=".json"
                onChange={handleImportPalette}
                className="hidden"
              />
              <button
                onClick={() => fileInputRef.current?.click()}
                className="flex items-center space-x-1 px-3 py-1 text-sm bg-gray-100 hover:bg-gray-200 rounded"
              >
                <Upload size={14} />
                <span>Import</span>
              </button>
            </div>
          )}
        </div>
      )}

      {/* Palettes Tab */}
      {activeTab === 'palettes' && (
        <div className="space-y-3">
          {palettes.map(palette => (
            <div
              key={palette.id}
              className={`p-3 border rounded cursor-pointer transition-colors ${
                selectedPalette === palette.id 
                  ? 'border-blue-500 bg-blue-50' 
                  : 'border-gray-200 hover:border-gray-300'
              }`}
              onClick={() => setSelectedPalette(palette.id)}
            >
              <div className="flex items-center justify-between mb-2">
                <h4 className="font-medium">{palette.name}</h4>
                <div className="flex items-center space-x-1">
                  {palette.isFavorite && <Star size={14} className="text-yellow-500" />}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleExportPalette(palette);
                    }}
                    className="p-1 text-gray-500 hover:text-gray-700"
                  >
                    <Download size={14} />
                  </button>
                </div>
              </div>
              <p className="text-sm text-gray-600 mb-2">{palette.description}</p>
              <div className="flex space-x-1">
                {palette.swatches.slice(0, 5).map(swatch => (
                  <div
                    key={swatch.id}
                    className="w-4 h-4 rounded border border-gray-300"
                    style={{ backgroundColor: swatch.color.hex }}
                  />
                ))}
                {palette.swatches.length > 5 && (
                  <div className="text-xs text-gray-500 flex items-center">
                    +{palette.swatches.length - 5}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Harmony Tab */}
      {activeTab === 'harmony' && (
        <div className="space-y-4">
          <p className="text-sm text-gray-600">
            Select a base color to generate color harmonies
          </p>
          <div className="grid grid-cols-3 gap-2">
            {['monochromatic', 'analogous', 'complementary', 'triadic', 'tetradic', 'split-complementary'].map(type => (
              <button
                key={type}
                className="p-2 text-sm border border-gray-300 rounded hover:border-gray-400 capitalize"
                onClick={() => {
                  // This would generate harmony based on current color
                  console.log(`Generate ${type} harmony`);
                }}
              >
                {type.replace('-', ' ')}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Themes Tab */}
      {activeTab === 'themes' && (
        <div className="space-y-4">
          <p className="text-sm text-gray-600">
            Predefined color themes for different use cases
          </p>
          <div className="grid grid-cols-2 gap-3">
            {[
              { name: 'Ocean', colors: ['#1ABC9C', '#16A085', '#2ECC71', '#27AE60', '#3498DB'] },
              { name: 'Sunset', colors: ['#E74C3C', '#E67E22', '#F39C12', '#F1C40F', '#E91E63'] },
              { name: 'Forest', colors: ['#27AE60', '#2ECC71', '#58D68D', '#85C1E9', '#5DADE2'] },
              { name: 'Royal', colors: ['#8E44AD', '#9B59B6', '#AF7AC5', '#BB8FCE', '#D2B4DE'] }
            ].map(theme => (
              <div
                key={theme.name}
                className="p-3 border border-gray-200 rounded cursor-pointer hover:border-gray-300"
              >
                <h4 className="font-medium text-sm mb-2">{theme.name}</h4>
                <div className="flex space-x-1">
                  {theme.colors.map((color, index) => (
                    <div
                      key={index}
                      className="w-6 h-6 rounded border border-gray-300"
                      style={{ backgroundColor: color }}
                    />
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default ColorPalette;
