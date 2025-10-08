/**
 * Color Harmony Generator
 * Advanced color theory and harmony generation
 */

import React, { useState, useCallback, useMemo } from 'react';
import { 
  RotateCcw, 
  Copy, 
  Check, 
  Download, 
  Palette,
  RefreshCw,
  Star,
  StarOff,
  X
} from 'lucide-react';
import { Color } from './ColorPicker';

export interface ColorHarmony {
  type: 'monochromatic' | 'analogous' | 'complementary' | 'triadic' | 'tetradic' | 'split-complementary' | 'double-complementary' | 'square' | 'rectangle';
  colors: Color[];
  name: string;
  description: string;
  theory: string;
}

export interface ColorHarmonyProps {
  baseColor: Color;
  onColorSelect: (color: Color) => void;
  onClose?: () => void;
  className?: string;
}

const ColorHarmony: React.FC<ColorHarmonyProps> = ({
  baseColor,
  onColorSelect,
  onClose,
  className = ''
}) => {
  const [selectedHarmony, setSelectedHarmony] = useState<ColorHarmony['type']>('complementary');
  const [copiedColor, setCopiedColor] = useState<string | null>(null);
  const [favoriteHarmonies, setFavoriteHarmonies] = useState<Set<string>>(new Set());

  // Color conversion utilities
  const hslToRgb = useCallback((h: number, s: number, l: number): { r: number; g: number; b: number } => {
    h /= 360;
    s /= 100;
    l /= 100;
    
    const hue2rgb = (p: number, q: number, t: number) => {
      if (t < 0) t += 1;
      if (t > 1) t -= 1;
      if (t < 1/6) return p + (q - p) * 6 * t;
      if (t < 1/2) return q;
      if (t < 2/3) return p + (q - p) * (2/3 - t) * 6;
      return p;
    };
    
    let r, g, b;
    
    if (s === 0) {
      r = g = b = l;
    } else {
      const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
      const p = 2 * l - q;
      r = hue2rgb(p, q, h + 1/3);
      g = hue2rgb(p, q, h);
      b = hue2rgb(p, q, h - 1/3);
    }
    
    return {
      r: Math.round(r * 255),
      g: Math.round(g * 255),
      b: Math.round(b * 255)
    };
  }, []);

  const createColor = useCallback((h: number, s: number, l: number, a: number = 1): Color => {
    const rgb = hslToRgb(h, s, l);
    const hex = `#${Math.round(rgb.r).toString(16).padStart(2, '0')}${Math.round(rgb.g).toString(16).padStart(2, '0')}${Math.round(rgb.b).toString(16).padStart(2, '0')}`;
    const hslStr = `hsl(${Math.round(h)}, ${Math.round(s)}%, ${Math.round(l)}%)`;
    const rgbStr = `rgb(${Math.round(rgb.r)}, ${Math.round(rgb.g)}, ${Math.round(rgb.b)})`;
    const rgbaStr = `rgba(${Math.round(rgb.r)}, ${Math.round(rgb.g)}, ${Math.round(rgb.b)}, ${a})`;
    
    return {
      r: rgb.r, g: rgb.g, b: rgb.b, a,
      h, s, l,
      hex, hsl: hslStr, rgb: rgbStr, rgba: rgbaStr,
      hsv: { h, s, v: l }, // Simplified
      cmyk: { c: 0, m: 0, y: 0, k: 0 } // Simplified
    };
  }, [hslToRgb]);

  // Generate color harmony
  const generateHarmony = useCallback((type: ColorHarmony['type'], base: Color): ColorHarmony => {
    const { h, s, l } = base;
    
    switch (type) {
      case 'monochromatic':
        return {
          type: 'monochromatic',
          name: 'Monochromatic',
          description: 'Colors that are all variations of the same hue',
          theory: 'Uses different shades, tints, and tones of a single color. Creates a harmonious and cohesive look.',
          colors: [
            base,
            createColor(h, s, Math.max(0, l - 30)),
            createColor(h, s, Math.min(100, l + 30)),
            createColor(h, Math.max(0, s - 40), l),
            createColor(h, Math.min(100, s + 40), l)
          ]
        };
        
      case 'analogous':
        return {
          type: 'analogous',
          name: 'Analogous',
          description: 'Colors that are adjacent to each other on the color wheel',
          theory: 'Uses colors that are next to each other on the color wheel. Creates a harmonious and pleasing effect.',
          colors: [
            base,
            createColor((h + 30) % 360, s, l),
            createColor((h - 30 + 360) % 360, s, l),
            createColor((h + 60) % 360, s, l),
            createColor((h - 60 + 360) % 360, s, l)
          ]
        };
        
      case 'complementary':
        return {
          type: 'complementary',
          name: 'Complementary',
          description: 'Colors that are opposite each other on the color wheel',
          theory: 'Uses colors that are directly opposite on the color wheel. Creates high contrast and vibrant combinations.',
          colors: [
            base,
            createColor((h + 180) % 360, s, l),
            createColor((h + 180) % 360, s, Math.max(0, l - 20)),
            createColor((h + 180) % 360, s, Math.min(100, l + 20)),
            createColor((h + 180) % 360, Math.max(0, s - 30), l)
          ]
        };
        
      case 'triadic':
        return {
          type: 'triadic',
          name: 'Triadic',
          description: 'Colors that are evenly spaced around the color wheel',
          theory: 'Uses three colors that are evenly spaced around the color wheel. Creates a vibrant and balanced palette.',
          colors: [
            base,
            createColor((h + 120) % 360, s, l),
            createColor((h + 240) % 360, s, l),
            createColor((h + 120) % 360, s, Math.max(0, l - 20)),
            createColor((h + 240) % 360, s, Math.min(100, l + 20))
          ]
        };
        
      case 'tetradic':
        return {
          type: 'tetradic',
          name: 'Tetradic',
          description: 'Four colors that form a rectangle on the color wheel',
          theory: 'Uses four colors that form a rectangle on the color wheel. Creates rich and diverse palettes.',
          colors: [
            base,
            createColor((h + 90) % 360, s, l),
            createColor((h + 180) % 360, s, l),
            createColor((h + 270) % 360, s, l),
            createColor((h + 45) % 360, s, l)
          ]
        };
        
      case 'split-complementary':
        return {
          type: 'split-complementary',
          name: 'Split Complementary',
          description: 'A base color plus the two colors adjacent to its complement',
          theory: 'Uses a base color and the two colors adjacent to its complement. Provides contrast without the tension of complementary colors.',
          colors: [
            base,
            createColor((h + 150) % 360, s, l),
            createColor((h + 210) % 360, s, l),
            createColor((h + 150) % 360, s, Math.max(0, l - 20)),
            createColor((h + 210) % 360, s, Math.min(100, l + 20))
          ]
        };
        
      case 'double-complementary':
        return {
          type: 'double-complementary',
          name: 'Double Complementary',
          description: 'Two pairs of complementary colors',
          theory: 'Uses two pairs of complementary colors. Creates rich and vibrant palettes with high contrast.',
          colors: [
            base,
            createColor((h + 180) % 360, s, l),
            createColor((h + 30) % 360, s, l),
            createColor((h + 210) % 360, s, l),
            createColor((h + 60) % 360, s, l)
          ]
        };
        
      case 'square':
        return {
          type: 'square',
          name: 'Square',
          description: 'Four colors evenly spaced around the color wheel',
          theory: 'Uses four colors that are evenly spaced around the color wheel. Creates balanced and harmonious palettes.',
          colors: [
            base,
            createColor((h + 90) % 360, s, l),
            createColor((h + 180) % 360, s, l),
            createColor((h + 270) % 360, s, l),
            createColor((h + 45) % 360, s, l)
          ]
        };
        
      case 'rectangle':
        return {
          type: 'rectangle',
          name: 'Rectangle',
          description: 'Four colors forming a rectangle on the color wheel',
          theory: 'Uses four colors that form a rectangle on the color wheel. Provides good balance between harmony and contrast.',
          colors: [
            base,
            createColor((h + 60) % 360, s, l),
            createColor((h + 180) % 360, s, l),
            createColor((h + 240) % 360, s, l),
            createColor((h + 120) % 360, s, l)
          ]
        };
        
      default:
        return {
          type: 'complementary',
          name: 'Complementary',
          description: 'Colors that are opposite each other on the color wheel',
          theory: 'Uses colors that are directly opposite on the color wheel.',
          colors: [base]
        };
    }
  }, [createColor]);

  // Current harmony
  const currentHarmony = useMemo(() => 
    generateHarmony(selectedHarmony, baseColor),
    [selectedHarmony, baseColor, generateHarmony]
  );

  // Handle color copy
  const handleColorCopy = useCallback((color: Color) => {
    navigator.clipboard.writeText(color.hex);
    setCopiedColor(color.hex);
    setTimeout(() => setCopiedColor(null), 2000);
  }, []);

  // Handle color select
  const handleColorSelect = useCallback((color: Color) => {
    onColorSelect(color);
  }, [onColorSelect]);

  // Handle harmony export
  const handleExportHarmony = useCallback(() => {
    const data = {
      type: currentHarmony.type,
      name: currentHarmony.name,
      description: currentHarmony.description,
      theory: currentHarmony.theory,
      colors: currentHarmony.colors.map(color => ({
        hex: color.hex,
        rgb: color.rgb,
        hsl: color.hsl
      }))
    };
    
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${currentHarmony.name.toLowerCase().replace(/\s+/g, '-')}-harmony.json`;
    a.click();
    URL.revokeObjectURL(url);
  }, [currentHarmony]);

  // Handle favorite toggle
  const handleFavoriteToggle = useCallback(() => {
    const key = `${selectedHarmony}-${baseColor.hex}`;
    setFavoriteHarmonies(prev => {
      const newSet = new Set(prev);
      if (newSet.has(key)) {
        newSet.delete(key);
      } else {
        newSet.add(key);
      }
      return newSet;
    });
  }, [selectedHarmony, baseColor.hex]);

  const isFavorite = favoriteHarmonies.has(`${selectedHarmony}-${baseColor.hex}`);

  return (
    <div className={`bg-white rounded-lg shadow-xl border border-gray-200 p-4 w-96 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold flex items-center">
          <RotateCcw size={20} className="mr-2" />
          Color Harmony
        </h3>
        <div className="flex items-center space-x-2">
          <button
            onClick={handleFavoriteToggle}
            className={`p-1 ${isFavorite ? 'text-yellow-500' : 'text-gray-500 hover:text-yellow-500'}`}
            title={isFavorite ? 'Remove from favorites' : 'Add to favorites'}
          >
            {isFavorite ? <Star size={16} /> : <StarOff size={16} />}
          </button>
          <button
            onClick={handleExportHarmony}
            className="p-1 text-gray-500 hover:text-gray-700"
            title="Export harmony"
          >
            <Download size={16} />
          </button>
          {onClose && (
            <button
              onClick={onClose}
              className="p-1 text-gray-500 hover:text-gray-700"
            >
              <X size={16} />
            </button>
          )}
        </div>
      </div>

      {/* Base Color */}
      <div className="mb-4">
        <label className="text-sm font-medium text-gray-700 mb-2 block">Base Color</label>
        <div className="flex items-center space-x-3">
          <div
            className="w-12 h-12 rounded border-2 border-gray-300"
            style={{ backgroundColor: baseColor.hex }}
          />
          <div className="flex-1">
            <div className="text-sm font-medium">{baseColor.hex}</div>
            <div className="text-xs text-gray-500">
              HSL({Math.round(baseColor.h)}, {Math.round(baseColor.s)}%, {Math.round(baseColor.l)}%)
            </div>
          </div>
        </div>
      </div>

      {/* Harmony Type Selector */}
      <div className="mb-4">
        <label className="text-sm font-medium text-gray-700 mb-2 block">Harmony Type</label>
        <select
          value={selectedHarmony}
          onChange={(e) => setSelectedHarmony(e.target.value as ColorHarmony['type'])}
          className="w-full px-3 py-2 border border-gray-300 rounded text-sm"
        >
          <option value="monochromatic">Monochromatic</option>
          <option value="analogous">Analogous</option>
          <option value="complementary">Complementary</option>
          <option value="triadic">Triadic</option>
          <option value="tetradic">Tetradic</option>
          <option value="split-complementary">Split Complementary</option>
          <option value="double-complementary">Double Complementary</option>
          <option value="square">Square</option>
          <option value="rectangle">Rectangle</option>
        </select>
      </div>

      {/* Harmony Info */}
      <div className="mb-4 p-3 bg-gray-50 rounded">
        <h4 className="font-medium text-sm mb-1">{currentHarmony.name}</h4>
        <p className="text-xs text-gray-600 mb-2">{currentHarmony.description}</p>
        <p className="text-xs text-gray-500">{currentHarmony.theory}</p>
      </div>

      {/* Color Swatches */}
      <div className="mb-4">
        <label className="text-sm font-medium text-gray-700 mb-2 block">Generated Colors</label>
        <div className="grid grid-cols-5 gap-2">
          {currentHarmony.colors.map((color, index) => (
            <div
              key={index}
              className="relative group"
            >
              <button
                onClick={() => handleColorSelect(color)}
                className="w-full h-16 rounded border-2 border-gray-300 hover:border-gray-400 transition-colors"
                style={{ backgroundColor: color.hex }}
                title={`${color.hex} - Click to select`}
              />
              
              {/* Color Actions */}
              <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity">
                <div className="absolute top-1 right-1">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleColorCopy(color);
                    }}
                    className="p-1 bg-white rounded shadow text-gray-600 hover:text-gray-800"
                    title="Copy color"
                  >
                    {copiedColor === color.hex ? <Check size={12} /> : <Copy size={12} />}
                  </button>
                </div>
              </div>
              
              {/* Color Info */}
              <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-50 text-white text-xs p-1 rounded-b opacity-0 group-hover:opacity-100 transition-opacity">
                <div className="text-center">{color.hex}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Color Details */}
      <div className="space-y-2">
        <h4 className="text-sm font-medium text-gray-700">Color Details</h4>
        <div className="space-y-1 max-h-32 overflow-y-auto">
          {currentHarmony.colors.map((color, index) => (
            <div key={index} className="flex items-center space-x-2 text-xs">
              <div
                className="w-4 h-4 rounded border border-gray-300"
                style={{ backgroundColor: color.hex }}
              />
              <span className="font-mono">{color.hex}</span>
              <span className="text-gray-500">
                HSL({Math.round(color.h)}, {Math.round(color.s)}%, {Math.round(color.l)}%)
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ColorHarmony;
