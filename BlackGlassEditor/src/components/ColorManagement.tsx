/**
 * Comprehensive Color Management System
 * Integrates color picker, palette, and harmony tools
 */

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
  Check
} from 'lucide-react';
import ColorPicker, { Color } from './ColorPicker';
import ColorPalette from './ColorPalette';
import ColorHarmony from './ColorHarmony';

export interface ColorManagementProps {
  currentColor: Color;
  onColorChange: (color: Color) => void;
  onClose?: () => void;
  className?: string;
}

const ColorManagement: React.FC<ColorManagementProps> = ({
  currentColor,
  onColorChange,
  onClose,
  className = ''
}) => {
  const [activeTool, setActiveTool] = useState<'picker' | 'palette' | 'harmony'>('picker');
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [recentColors, setRecentColors] = useState<Color[]>([]);
  const [favoriteColors, setFavoriteColors] = useState<Color[]>([]);
  const [copiedColor, setCopiedColor] = useState<string | null>(null);
  const [showColorHistory, setShowColorHistory] = useState(false);
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Add color to recent colors
  const addToRecent = useCallback((color: Color) => {
    setRecentColors(prev => {
      const filtered = prev.filter(c => c.hex !== color.hex);
      return [color, ...filtered].slice(0, 20); // Keep last 20 colors
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
        return [color, ...prev].slice(0, 50); // Keep max 50 favorites
      }
    });
  }, []);

  // Handle color export
  const handleExportColors = useCallback(() => {
    const data = {
      recent: recentColors.map(color => ({
        hex: color.hex,
        rgb: color.rgb,
        hsl: color.hsl
      })),
      favorites: favoriteColors.map(color => ({
        hex: color.hex,
        rgb: color.rgb,
        hsl: color.hsl
      })),
      current: {
        hex: currentColor.hex,
        rgb: currentColor.rgb,
        hsl: currentColor.hsl
      }
    };
    
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'color-management-export.json';
    a.click();
    URL.revokeObjectURL(url);
  }, [recentColors, favoriteColors, currentColor]);

  // Handle color import
  const handleImportColors = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = JSON.parse(e.target?.result as string);
        if (data.recent) {
          setRecentColors(data.recent.map((color: any) => ({
            ...color,
            r: parseInt(color.hex.slice(1, 3), 16),
            g: parseInt(color.hex.slice(3, 5), 16),
            b: parseInt(color.hex.slice(5, 7), 16),
            a: 1,
            h: 0, s: 0, l: 0,
            hsl: color.hsl,
            rgb: color.rgb,
            rgba: color.rgb.replace('rgb', 'rgba').replace(')', ', 1)'),
            hsv: { h: 0, s: 0, v: 0 },
            cmyk: { c: 0, m: 0, y: 0, k: 0 }
          })));
        }
        if (data.favorites) {
          setFavoriteColors(data.favorites.map((color: any) => ({
            ...color,
            r: parseInt(color.hex.slice(1, 3), 16),
            g: parseInt(color.hex.slice(3, 5), 16),
            b: parseInt(color.hex.slice(5, 7), 16),
            a: 1,
            h: 0, s: 0, l: 0,
            hsl: color.hsl,
            rgb: color.rgb,
            rgba: color.rgb.replace('rgb', 'rgba').replace(')', ', 1)'),
            hsv: { h: 0, s: 0, v: 0 },
            cmyk: { c: 0, m: 0, y: 0, k: 0 }
          })));
        }
      } catch (error) {
        console.error('Failed to import colors:', error);
      }
    };
    reader.readAsText(file);
  }, []);

  // Check if color is favorite
  const isFavorite = favoriteColors.some(c => c.hex === currentColor.hex);

  return (
    <div className={`bg-white rounded-lg shadow-xl border border-gray-200 p-4 w-full max-w-4xl ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold flex items-center">
          <Palette size={20} className="mr-2" />
          Color Management
        </h3>
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setShowAdvanced(!showAdvanced)}
            className={`p-2 rounded ${showAdvanced ? 'bg-blue-100 text-blue-700' : 'text-gray-500 hover:text-gray-700'}`}
            title="Advanced options"
          >
            <Settings size={16} />
          </button>
          <button
            onClick={handleExportColors}
            className="p-2 text-gray-500 hover:text-gray-700"
            title="Export colors"
          >
            <Download size={16} />
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept=".json"
            onChange={handleImportColors}
            className="hidden"
          />
          <button
            onClick={() => fileInputRef.current?.click()}
            className="p-2 text-gray-500 hover:text-gray-700"
            title="Import colors"
          >
            <Upload size={16} />
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

      {/* Tool Selector */}
      <div className="flex space-x-1 mb-4">
        {[
          { id: 'picker', label: 'Color Picker', icon: Droplets },
          { id: 'palette', label: 'Palettes', icon: Palette },
          { id: 'harmony', label: 'Harmony', icon: RotateCcw }
        ].map(tool => (
          <button
            key={tool.id}
            onClick={() => setActiveTool(tool.id as any)}
            className={`flex items-center space-x-2 px-4 py-2 rounded text-sm ${
              activeTool === tool.id 
                ? 'bg-blue-100 text-blue-700' 
                : 'text-gray-600 hover:text-gray-800'
            }`}
          >
            <tool.icon size={16} />
            <span>{tool.label}</span>
          </button>
        ))}
      </div>

      {/* Current Color Display */}
      <div className="mb-4 p-3 bg-gray-50 rounded">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div
              className="w-12 h-12 rounded border-2 border-gray-300"
              style={{ backgroundColor: currentColor.hex }}
            />
            <div>
              <div className="font-medium">{currentColor.hex}</div>
              <div className="text-sm text-gray-600">
                RGB({currentColor.r}, {currentColor.g}, {currentColor.b})
              </div>
              <div className="text-sm text-gray-600">
                HSL({Math.round(currentColor.h)}, {Math.round(currentColor.s)}%, {Math.round(currentColor.l)}%)
              </div>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => handleColorCopy(currentColor)}
              className="p-2 text-gray-500 hover:text-gray-700"
              title="Copy color"
            >
              {copiedColor === currentColor.hex ? <Check size={16} /> : <Copy size={16} />}
            </button>
            <button
              onClick={() => handleFavoriteToggle(currentColor)}
              className={`p-2 ${isFavorite ? 'text-yellow-500' : 'text-gray-500 hover:text-yellow-500'}`}
              title={isFavorite ? 'Remove from favorites' : 'Add to favorites'}
            >
              {isFavorite ? <Eye size={16} /> : <EyeOff size={16} />}
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex space-x-4">
        {/* Left Panel - Active Tool */}
        <div className="flex-1">
          {activeTool === 'picker' && (
            <ColorPicker
              color={currentColor}
              onChange={handleColorChange}
              showAlpha={true}
              showPresets={true}
              showHistory={true}
              showFormats={true}
            />
          )}
          
          {activeTool === 'palette' && (
            <ColorPalette
              onColorSelect={handleColorChange}
            />
          )}
          
          {activeTool === 'harmony' && (
            <ColorHarmony
              baseColor={currentColor}
              onColorSelect={handleColorChange}
            />
          )}
        </div>

        {/* Right Panel - Quick Access */}
        <div className="w-64 space-y-4">
          {/* Recent Colors */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <h4 className="text-sm font-medium text-gray-700">Recent Colors</h4>
              <button
                onClick={() => setShowColorHistory(!showColorHistory)}
                className="text-xs text-gray-500 hover:text-gray-700"
              >
                {showColorHistory ? 'Hide' : 'Show All'}
              </button>
            </div>
            <div className={`grid grid-cols-6 gap-1 ${showColorHistory ? 'max-h-32 overflow-y-auto' : ''}`}>
              {recentColors.slice(0, showColorHistory ? recentColors.length : 12).map((color, index) => (
                <button
                  key={index}
                  onClick={() => handleColorChange(color)}
                  className="w-8 h-8 rounded border-2 border-gray-300 hover:border-gray-400 transition-colors"
                  style={{ backgroundColor: color.hex }}
                  title={color.hex}
                />
              ))}
            </div>
          </div>

          {/* Favorite Colors */}
          {favoriteColors.length > 0 && (
            <div>
              <h4 className="text-sm font-medium text-gray-700 mb-2">Favorites</h4>
              <div className="grid grid-cols-6 gap-1">
                {favoriteColors.slice(0, 12).map((color, index) => (
                  <button
                    key={index}
                    onClick={() => handleColorChange(color)}
                    className="w-8 h-8 rounded border-2 border-gray-300 hover:border-gray-400 transition-colors"
                    style={{ backgroundColor: color.hex }}
                    title={color.hex}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Quick Actions */}
          <div>
            <h4 className="text-sm font-medium text-gray-700 mb-2">Quick Actions</h4>
            <div className="space-y-2">
              <button
                onClick={() => handleColorChange({ ...currentColor, a: 1 })}
                className="w-full px-3 py-2 text-sm bg-gray-100 hover:bg-gray-200 rounded text-left"
              >
                Set Opacity to 100%
              </button>
              <button
                onClick={() => handleColorChange({ ...currentColor, a: 0.5 })}
                className="w-full px-3 py-2 text-sm bg-gray-100 hover:bg-gray-200 rounded text-left"
              >
                Set Opacity to 50%
              </button>
              <button
                onClick={() => handleColorChange({ ...currentColor, l: Math.max(0, currentColor.l - 20) })}
                className="w-full px-3 py-2 text-sm bg-gray-100 hover:bg-gray-200 rounded text-left"
              >
                Darken by 20%
              </button>
              <button
                onClick={() => handleColorChange({ ...currentColor, l: Math.min(100, currentColor.l + 20) })}
                className="w-full px-3 py-2 text-sm bg-gray-100 hover:bg-gray-200 rounded text-left"
              >
                Lighten by 20%
              </button>
            </div>
          </div>

          {/* Advanced Options */}
          {showAdvanced && (
            <div>
              <h4 className="text-sm font-medium text-gray-700 mb-2">Advanced</h4>
              <div className="space-y-2">
                <button
                  onClick={() => setRecentColors([])}
                  className="w-full px-3 py-2 text-sm bg-red-100 hover:bg-red-200 text-red-700 rounded text-left"
                >
                  Clear Recent Colors
                </button>
                <button
                  onClick={() => setFavoriteColors([])}
                  className="w-full px-3 py-2 text-sm bg-red-100 hover:bg-red-200 text-red-700 rounded text-left"
                >
                  Clear Favorites
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ColorManagement;
