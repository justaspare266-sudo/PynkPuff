import React, { useState, useCallback, useRef } from 'react';
import { 
  Palette, 
  Droplets, 
  RotateCcw, 
  Save, 
  Download, 
  Upload,
  Settings,
  X,
  Eye,
  EyeOff,
  Copy,
  Check,
  Star,
  StarOff,
  RefreshCw,
  Pipette
} from 'lucide-react';

export interface Color {
  hex: string;
  rgb: { r: number; g: number; b: number };
  hsl: { h: number; s: number; l: number };
  alpha: number;
}

export interface ColorPalette {
  id: string;
  name: string;
  colors: Color[];
  createdAt: Date;
  updatedAt: Date;
}

export interface ColorHarmony {
  type: 'monochromatic' | 'analogous' | 'complementary' | 'triadic' | 'tetradic' | 'split-complementary';
  colors: Color[];
  name: string;
  description: string;
}

interface EnhancedColorToolProps {
  currentColor: Color;
  onColorChange: (color: Color) => void;
  onClose?: () => void;
}

const colorPresets = [
  // Basic colors
  { name: 'Black', hex: '#000000' },
  { name: 'White', hex: '#FFFFFF' },
  { name: 'Red', hex: '#FF0000' },
  { name: 'Green', hex: '#00FF00' },
  { name: 'Blue', hex: '#0000FF' },
  { name: 'Yellow', hex: '#FFFF00' },
  { name: 'Cyan', hex: '#00FFFF' },
  { name: 'Magenta', hex: '#FF00FF' },
  
  // Grays
  { name: 'Dark Gray', hex: '#333333' },
  { name: 'Gray', hex: '#808080' },
  { name: 'Light Gray', hex: '#CCCCCC' },
  
  // Material Design
  { name: 'Material Red', hex: '#F44336' },
  { name: 'Material Pink', hex: '#E91E63' },
  { name: 'Material Purple', hex: '#9C27B0' },
  { name: 'Material Blue', hex: '#2196F3' },
  { name: 'Material Cyan', hex: '#00BCD4' },
  { name: 'Material Teal', hex: '#009688' },
  { name: 'Material Green', hex: '#4CAF50' },
  { name: 'Material Lime', hex: '#CDDC39' },
  { name: 'Material Yellow', hex: '#FFEB3B' },
  { name: 'Material Orange', hex: '#FF9800' },
  { name: 'Material Brown', hex: '#795548' },
  
  // Flat UI
  { name: 'Flat Red', hex: '#E74C3C' },
  { name: 'Flat Orange', hex: '#E67E22' },
  { name: 'Flat Yellow', hex: '#F1C40F' },
  { name: 'Flat Green', hex: '#2ECC71' },
  { name: 'Flat Blue', hex: '#3498DB' },
  { name: 'Flat Purple', hex: '#9B59B6' },
  { name: 'Flat Pink', hex: '#E91E63' },
  { name: 'Flat Teal', hex: '#1ABC9C' },
  { name: 'Flat Indigo', hex: '#3F51B5' },
  { name: 'Flat Deep Orange', hex: '#FF5722' },
  { name: 'Flat Light Blue', hex: '#03A9F4' },
  { name: 'Flat Light Green', hex: '#8BC34A' }
];

export const EnhancedColorTool: React.FC<EnhancedColorToolProps> = ({
  currentColor,
  onColorChange,
  onClose
}) => {
  const [activeTab, setActiveTab] = useState<'picker' | 'palettes' | 'harmony' | 'presets'>('picker');
  const [recentColors, setRecentColors] = useState<Color[]>([]);
  const [favoriteColors, setFavoriteColors] = useState<Color[]>([]);
  const [copiedColor, setCopiedColor] = useState<string | null>(null);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [customPalettes, setCustomPalettes] = useState<ColorPalette[]>([]);
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Convert hex to RGB
  const hexToRgb = (hex: string) => {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
      r: parseInt(result[1], 16),
      g: parseInt(result[2], 16),
      b: parseInt(result[3], 16)
    } : { r: 0, g: 0, b: 0 };
  };

  // Convert RGB to HSL
  const rgbToHsl = (r: number, g: number, b: number) => {
    r /= 255;
    g /= 255;
    b /= 255;
    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    let h = 0, s = 0, l = (max + min) / 2;

    if (max !== min) {
      const d = max - min;
      s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
      switch (max) {
        case r: h = (g - b) / d + (g < b ? 6 : 0); break;
        case g: h = (b - r) / d + 2; break;
        case b: h = (r - g) / d + 4; break;
      }
      h /= 6;
    }
    return { h: h * 360, s: s * 100, l: l * 100 };
  };

  // Create color object from hex
  const createColor = (hex: string, alpha: number = 1): Color => {
    const rgb = hexToRgb(hex);
    const hsl = rgbToHsl(rgb.r, rgb.g, rgb.b);
    return { hex, rgb, hsl, alpha };
  };

  // Add color to recent colors
  const addToRecent = useCallback((color: Color) => {
    setRecentColors(prev => {
      const filtered = prev.filter(c => c.hex !== color.hex);
      return [color, ...filtered].slice(0, 20);
    });
  }, []);

  // Handle color change
  const handleColorChange = useCallback((color: Color) => {
    onColorChange(color);
    addToRecent(color);
  }, [onColorChange, addToRecent]);

  // Handle color copy
  const handleColorCopy = useCallback((color: Color) => {
    navigator.clipboard.writeText(color.hex);
    setCopiedColor(color.hex);
    setTimeout(() => setCopiedColor(null), 2000);
  }, []);

  // Handle favorite toggle
  const handleFavoriteToggle = useCallback((color: Color) => {
    setFavoriteColors(prev => {
      const isFavorite = prev.some(c => c.hex === color.hex);
      if (isFavorite) {
        return prev.filter(c => c.hex !== color.hex);
      } else {
        return [color, ...prev].slice(0, 50);
      }
    });
  }, []);

  // Generate color harmonies
  const generateHarmonies = useCallback((baseColor: Color): ColorHarmony[] => {
    const { h, s, l } = baseColor.hsl;
    
    return [
      {
        type: 'monochromatic',
        name: 'Monochromatic',
        description: 'Variations of the same hue',
        colors: [
          createColor(baseColor.hex),
          createColor(`hsl(${h}, ${Math.max(0, s - 20)}%, ${Math.max(0, l - 20)}%)`),
          createColor(`hsl(${h}, ${Math.min(100, s + 20)}%, ${Math.min(100, l + 20)}%)`)
        ]
      },
      {
        type: 'analogous',
        name: 'Analogous',
        description: 'Adjacent colors on the color wheel',
        colors: [
          createColor(baseColor.hex),
          createColor(`hsl(${(h + 30) % 360}, ${s}%, ${l}%)`),
          createColor(`hsl(${(h - 30 + 360) % 360}, ${s}%, ${l}%)`)
        ]
      },
      {
        type: 'complementary',
        name: 'Complementary',
        description: 'Opposite colors on the color wheel',
        colors: [
          createColor(baseColor.hex),
          createColor(`hsl(${(h + 180) % 360}, ${s}%, ${l}%)`)
        ]
      },
      {
        type: 'triadic',
        name: 'Triadic',
        description: 'Three evenly spaced colors',
        colors: [
          createColor(baseColor.hex),
          createColor(`hsl(${(h + 120) % 360}, ${s}%, ${l}%)`),
          createColor(`hsl(${(h + 240) % 360}, ${s}%, ${l}%)`)
        ]
      },
      {
        type: 'tetradic',
        name: 'Tetradic',
        description: 'Four colors forming a rectangle',
        colors: [
          createColor(baseColor.hex),
          createColor(`hsl(${(h + 60) % 360}, ${s}%, ${l}%)`),
          createColor(`hsl(${(h + 180) % 360}, ${s}%, ${l}%)`),
          createColor(`hsl(${(h + 240) % 360}, ${s}%, ${l}%)`)
        ]
      },
      {
        type: 'split-complementary',
        name: 'Split Complementary',
        description: 'Base color plus two adjacent to its complement',
        colors: [
          createColor(baseColor.hex),
          createColor(`hsl(${(h + 150) % 360}, ${s}%, ${l}%)`),
          createColor(`hsl(${(h + 210) % 360}, ${s}%, ${l}%)`)
        ]
      }
    ];
  }, []);

  const harmonies = generateHarmonies(currentColor);

  return (
    <div className="bg-white border border-gray-200 rounded-lg shadow-lg p-4 w-96">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold flex items-center">
          <Palette className="w-5 h-5 mr-2" />
          Color Tool
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

      {/* Tabs */}
      <div className="flex mb-4 border-b">
        {[
          { id: 'picker', label: 'Picker', icon: Pipette },
          { id: 'presets', label: 'Presets', icon: Palette },
          { id: 'palettes', label: 'Palettes', icon: Droplets },
          { id: 'harmony', label: 'Harmony', icon: RotateCcw }
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

      {/* Color Picker Tab */}
      {activeTab === 'picker' && (
        <div className="space-y-4">
          {/* Current Color Display */}
          <div className="flex items-center space-x-4">
            <div
              className="w-16 h-16 rounded border-2 border-gray-300"
              style={{ backgroundColor: currentColor.hex }}
            />
            <div className="flex-1">
              <div className="text-sm font-medium">Current Color</div>
              <div className="text-xs text-gray-600">{currentColor.hex}</div>
              <div className="text-xs text-gray-600">
                RGB({currentColor.rgb.r}, {currentColor.rgb.g}, {currentColor.rgb.b})
              </div>
            </div>
            <button
              onClick={() => handleColorCopy(currentColor)}
              className="p-2 border border-gray-300 rounded hover:bg-gray-50"
            >
              {copiedColor === currentColor.hex ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
            </button>
          </div>

          {/* Color Input */}
          <div>
            <label className="block text-sm font-medium mb-2">Hex Color</label>
            <div className="flex items-center space-x-2">
              <input
                type="color"
                value={currentColor.hex}
                onChange={(e) => handleColorChange(createColor(e.target.value, currentColor.alpha))}
                className="w-12 h-10 rounded border border-gray-300"
              />
              <input
                type="text"
                value={currentColor.hex}
                onChange={(e) => {
                  if (/^#[0-9A-Fa-f]{6}$/.test(e.target.value)) {
                    handleColorChange(createColor(e.target.value, currentColor.alpha));
                  }
                }}
                className="flex-1 px-3 py-2 border border-gray-300 rounded text-sm"
                placeholder="#000000"
              />
            </div>
          </div>

          {/* RGB Inputs */}
          <div>
            <label className="block text-sm font-medium mb-2">RGB Values</label>
            <div className="grid grid-cols-3 gap-2">
              <div>
                <label className="block text-xs text-gray-600 mb-1">Red</label>
                <input
                  type="number"
                  min="0"
                  max="255"
                  value={currentColor.rgb.r}
                  onChange={(e) => {
                    const r = parseInt(e.target.value);
                    const hex = `#${r.toString(16).padStart(2, '0')}${currentColor.rgb.g.toString(16).padStart(2, '0')}${currentColor.rgb.b.toString(16).padStart(2, '0')}`;
                    handleColorChange(createColor(hex, currentColor.alpha));
                  }}
                  className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                />
              </div>
              <div>
                <label className="block text-xs text-gray-600 mb-1">Green</label>
                <input
                  type="number"
                  min="0"
                  max="255"
                  value={currentColor.rgb.g}
                  onChange={(e) => {
                    const g = parseInt(e.target.value);
                    const hex = `#${currentColor.rgb.r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${currentColor.rgb.b.toString(16).padStart(2, '0')}`;
                    handleColorChange(createColor(hex, currentColor.alpha));
                  }}
                  className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                />
              </div>
              <div>
                <label className="block text-xs text-gray-600 mb-1">Blue</label>
                <input
                  type="number"
                  min="0"
                  max="255"
                  value={currentColor.rgb.b}
                  onChange={(e) => {
                    const b = parseInt(e.target.value);
                    const hex = `#${currentColor.rgb.r.toString(16).padStart(2, '0')}${currentColor.rgb.g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
                    handleColorChange(createColor(hex, currentColor.alpha));
                  }}
                  className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                />
              </div>
            </div>
          </div>

          {/* Alpha */}
          <div>
            <label className="block text-sm font-medium mb-2">Opacity</label>
            <input
              type="range"
              min="0"
              max="1"
              step="0.01"
              value={currentColor.alpha}
              onChange={(e) => handleColorChange({ ...currentColor, alpha: parseFloat(e.target.value) })}
              className="w-full"
            />
            <span className="text-sm text-gray-600">{Math.round(currentColor.alpha * 100)}%</span>
          </div>
        </div>
      )}

      {/* Presets Tab */}
      {activeTab === 'presets' && (
        <div className="space-y-4">
          <div className="grid grid-cols-6 gap-2">
            {colorPresets.map(preset => (
              <button
                key={preset.hex}
                onClick={() => handleColorChange(createColor(preset.hex))}
                className="aspect-square rounded border-2 border-gray-300 hover:border-blue-500 relative group"
                style={{ backgroundColor: preset.hex }}
                title={preset.name}
              >
                <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 rounded" />
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Palettes Tab */}
      {activeTab === 'palettes' && (
        <div className="space-y-4">
          {/* Recent Colors */}
          <div>
            <label className="block text-sm font-medium mb-2">Recent Colors</label>
            <div className="grid grid-cols-8 gap-1">
              {recentColors.map((color, index) => (
                <button
                  key={index}
                  onClick={() => handleColorChange(color)}
                  className="aspect-square rounded border border-gray-300 hover:border-blue-500"
                  style={{ backgroundColor: color.hex }}
                  title={color.hex}
                />
              ))}
            </div>
          </div>

          {/* Favorite Colors */}
          <div>
            <label className="block text-sm font-medium mb-2">Favorite Colors</label>
            <div className="grid grid-cols-8 gap-1">
              {favoriteColors.map((color, index) => (
                <button
                  key={index}
                  onClick={() => handleColorChange(color)}
                  className="aspect-square rounded border border-gray-300 hover:border-blue-500 relative group"
                  style={{ backgroundColor: color.hex }}
                  title={color.hex}
                >
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleFavoriteToggle(color);
                    }}
                    className="absolute -top-1 -right-1 p-1 bg-white rounded-full shadow-sm opacity-0 group-hover:opacity-100"
                  >
                    <StarOff className="w-3 h-3 text-red-500" />
                  </button>
                </button>
              ))}
            </div>
          </div>

          {/* Add to Favorites */}
          <button
            onClick={() => handleFavoriteToggle(currentColor)}
            className="w-full px-3 py-2 border border-gray-300 rounded hover:bg-gray-50 flex items-center justify-center space-x-2"
          >
            {favoriteColors.some(c => c.hex === currentColor.hex) ? (
              <>
                <StarOff className="w-4 h-4" />
                <span>Remove from Favorites</span>
              </>
            ) : (
              <>
                <Star className="w-4 h-4" />
                <span>Add to Favorites</span>
              </>
            )}
          </button>
        </div>
      )}

      {/* Harmony Tab */}
      {activeTab === 'harmony' && (
        <div className="space-y-4">
          {harmonies.map((harmony, index) => (
            <div key={index} className="border border-gray-200 rounded p-3">
              <div className="flex items-center justify-between mb-2">
                <h4 className="font-medium text-sm">{harmony.name}</h4>
                <span className="text-xs text-gray-500">{harmony.description}</span>
              </div>
              <div className="flex space-x-1">
                {harmony.colors.map((color, colorIndex) => (
                  <button
                    key={colorIndex}
                    onClick={() => handleColorChange(color)}
                    className="flex-1 aspect-square rounded border border-gray-300 hover:border-blue-500"
                    style={{ backgroundColor: color.hex }}
                    title={color.hex}
                  />
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
