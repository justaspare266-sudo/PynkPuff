/**
 * Professional Color Picker Component
 * Advanced color selection with multiple color spaces and formats
 */

import React, { useState, useCallback, useRef, useEffect } from 'react';
import { 
  Palette, 
  Droplets, 
  Copy, 
  Check, 
  RotateCcw,
  Eye,
  EyeOff,
  Download,
  Upload,
  X
} from 'lucide-react';

export interface Color {
  r: number;
  g: number;
  b: number;
  a: number;
  h: number;
  s: number;
  l: number;
  hex: string;
  hsl: string;
  rgb: string;
  rgba: string;
  hsv: { h: number; s: number; v: number };
  cmyk: { c: number; m: number; y: number; k: number };
}

export interface ColorPickerProps {
  color: Color;
  onChange: (color: Color) => void;
  onClose?: () => void;
  showAlpha?: boolean;
  showPresets?: boolean;
  showHistory?: boolean;
  showFormats?: boolean;
  className?: string;
}

const ColorPicker: React.FC<ColorPickerProps> = ({
  color,
  onChange,
  onClose,
  showAlpha = true,
  showPresets = true,
  showHistory = true,
  showFormats = true,
  className = ''
}) => {
  const [activeTab, setActiveTab] = useState<'picker' | 'presets' | 'history' | 'formats'>('picker');
  const [isDragging, setIsDragging] = useState(false);
  const [copiedFormat, setCopiedFormat] = useState<string | null>(null);
  const [colorHistory, setColorHistory] = useState<Color[]>([]);
  const [showAdvanced, setShowAdvanced] = useState(false);
  
  const hueRef = useRef<HTMLDivElement>(null);
  const saturationRef = useRef<HTMLDivElement>(null);
  const alphaRef = useRef<HTMLDivElement>(null);

  // Color presets
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
    { name: 'Flat Teal', hex: '#1ABC9C' }
  ];

  // Color conversion utilities
  const hexToRgb = (hex: string): { r: number; g: number; b: number } => {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
      r: parseInt(result[1], 16),
      g: parseInt(result[2], 16),
      b: parseInt(result[3], 16)
    } : { r: 0, g: 0, b: 0 };
  };

  const rgbToHsl = (r: number, g: number, b: number): { h: number; s: number; l: number } => {
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

  const hslToRgb = (h: number, s: number, l: number): { r: number; g: number; b: number } => {
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
  };

  const rgbToHsv = (r: number, g: number, b: number): { h: number; s: number; v: number } => {
    r /= 255;
    g /= 255;
    b /= 255;
    
    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    const diff = max - min;
    
    let h = 0;
    if (diff !== 0) {
      if (max === r) h = ((g - b) / diff) % 6;
      else if (max === g) h = (b - r) / diff + 2;
      else h = (r - g) / diff + 4;
    }
    
    return {
      h: (h * 60 + 360) % 360,
      s: max === 0 ? 0 : (diff / max) * 100,
      v: max * 100
    };
  };

  const rgbToCmyk = (r: number, g: number, b: number): { c: number; m: number; y: number; k: number } => {
    const c = 1 - (r / 255);
    const m = 1 - (g / 255);
    const y = 1 - (b / 255);
    const k = Math.min(c, m, y);
    
    return {
      c: Math.round((c - k) / (1 - k) * 100) || 0,
      m: Math.round((m - k) / (1 - k) * 100) || 0,
      y: Math.round((y - k) / (1 - k) * 100) || 0,
      k: Math.round(k * 100)
    };
  };

  const createColor = (r: number, g: number, b: number, a: number = 1): Color => {
    const hsl = rgbToHsl(r, g, b);
    const hsv = rgbToHsv(r, g, b);
    const cmyk = rgbToCmyk(r, g, b);
    
    const hex = `#${Math.round(r).toString(16).padStart(2, '0')}${Math.round(g).toString(16).padStart(2, '0')}${Math.round(b).toString(16).padStart(2, '0')}`;
    const hslStr = `hsl(${Math.round(hsl.h)}, ${Math.round(hsl.s)}%, ${Math.round(hsl.l)}%)`;
    const rgbStr = `rgb(${Math.round(r)}, ${Math.round(g)}, ${Math.round(b)})`;
    const rgbaStr = `rgba(${Math.round(r)}, ${Math.round(g)}, ${Math.round(b)}, ${a})`;
    
    return {
      r, g, b, a,
      h: hsl.h, s: hsl.s, l: hsl.l,
      hex, hsl: hslStr, rgb: rgbStr, rgba: rgbaStr,
      hsv, cmyk
    };
  };

  // Handle color change
  const handleColorChange = useCallback((newColor: Partial<Color>) => {
    const updatedColor = { ...color, ...newColor };
    onChange(updatedColor);
    
    // Add to history
    setColorHistory(prev => {
      const newHistory = [updatedColor, ...prev.filter(c => c.hex !== updatedColor.hex)];
      return newHistory.slice(0, 20); // Keep last 20 colors
    });
  }, [color, onChange]);

  // Handle hue change
  const handleHueChange = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (!hueRef.current) return;
    
    const rect = hueRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const hue = Math.max(0, Math.min(360, (x / rect.width) * 360));
    
    const rgb = hslToRgb(hue, color.s, color.l);
    const newColor = createColor(rgb.r, rgb.g, rgb.b, color.a);
    handleColorChange(newColor);
  }, [color.s, color.l, color.a, handleColorChange]);

  // Handle saturation/lightness change
  const handleSaturationChange = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (!saturationRef.current) return;
    
    const rect = saturationRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    const saturation = Math.max(0, Math.min(100, (x / rect.width) * 100));
    const lightness = Math.max(0, Math.min(100, 100 - (y / rect.height) * 100));
    
    const rgb = hslToRgb(color.h, saturation, lightness);
    const newColor = createColor(rgb.r, rgb.g, rgb.b, color.a);
    handleColorChange(newColor);
  }, [color.h, handleColorChange]);

  // Handle alpha change
  const handleAlphaChange = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (!alphaRef.current || !showAlpha) return;
    
    const rect = alphaRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const alpha = Math.max(0, Math.min(1, x / rect.width));
    
    handleColorChange({ a: alpha });
  }, [showAlpha, handleColorChange]);

  // Handle preset color click
  const handlePresetClick = useCallback((hex: string) => {
    const rgb = hexToRgb(hex);
    const newColor = createColor(rgb.r, rgb.g, rgb.b, color.a);
    handleColorChange(newColor);
  }, [color.a, handleColorChange]);

  // Copy color format
  const copyColorFormat = useCallback((format: string, value: string) => {
    navigator.clipboard.writeText(value);
    setCopiedFormat(format);
    setTimeout(() => setCopiedFormat(null), 2000);
  }, []);

  // Format color values
  const formatValues = {
    hex: color.hex,
    rgb: color.rgb,
    rgba: color.rgba,
    hsl: color.hsl,
    hsv: `hsv(${Math.round(color.hsv.h)}, ${Math.round(color.hsv.s)}%, ${Math.round(color.hsv.v)}%)`,
    cmyk: `cmyk(${color.cmyk.c}%, ${color.cmyk.m}%, ${color.cmyk.y}%, ${color.cmyk.k}%)`
  };

  return (
    <div className={`bg-white rounded-lg shadow-xl border border-gray-200 p-4 w-80 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold flex items-center">
          <Palette size={20} className="mr-2" />
          Color Picker
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
          { id: 'picker', label: 'Picker', icon: Droplets },
          { id: 'presets', label: 'Presets', icon: Palette },
          { id: 'history', label: 'History', icon: RotateCcw },
          { id: 'formats', label: 'Formats', icon: Copy }
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

      {/* Color Picker Tab */}
      {activeTab === 'picker' && (
        <div className="space-y-4">
          {/* Saturation/Lightness Area */}
          <div className="relative">
            <div
              ref={saturationRef}
              className="w-full h-32 rounded cursor-crosshair relative overflow-hidden"
              style={{
                background: `linear-gradient(to right, white, hsl(${color.h}, 100%, 50%)), linear-gradient(to top, black, transparent)`
              }}
              onMouseDown={(e) => {
                setIsDragging(true);
                handleSaturationChange(e);
              }}
              onMouseMove={(e) => {
                if (isDragging) handleSaturationChange(e);
              }}
              onMouseUp={() => setIsDragging(false)}
            >
              {/* Saturation/Lightness Handle */}
              <div
                className="absolute w-3 h-3 border-2 border-white rounded-full shadow-lg transform -translate-x-1/2 -translate-y-1/2"
                style={{
                  left: `${color.s}%`,
                  top: `${100 - color.l}%`,
                  backgroundColor: `hsl(${color.h}, ${color.s}%, ${color.l}%)`
                }}
              />
            </div>
          </div>

          {/* Hue Slider */}
          <div className="relative">
            <div
              ref={hueRef}
              className="w-full h-6 rounded cursor-pointer relative overflow-hidden"
              style={{
                background: 'linear-gradient(to right, #ff0000, #ffff00, #00ff00, #00ffff, #0000ff, #ff00ff, #ff0000)'
              }}
              onMouseDown={(e) => {
                setIsDragging(true);
                handleHueChange(e);
              }}
              onMouseMove={(e) => {
                if (isDragging) handleHueChange(e);
              }}
              onMouseUp={() => setIsDragging(false)}
            >
              {/* Hue Handle */}
              <div
                className="absolute w-3 h-6 border-2 border-white rounded shadow-lg transform -translate-x-1/2 -translate-y-1/2 top-1/2"
                style={{
                  left: `${(color.h / 360) * 100}%`,
                  backgroundColor: `hsl(${color.h}, 100%, 50%)`
                }}
              />
            </div>
          </div>

          {/* Alpha Slider */}
          {showAlpha && (
            <div className="relative">
              <div
                ref={alphaRef}
                className="w-full h-6 rounded cursor-pointer relative overflow-hidden"
                style={{
                  backgroundImage: `linear-gradient(to right, transparent, ${color.hex}), url("data:image/svg+xml,%3Csvg width='8' height='8' viewBox='0 0 8 8' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%23ccc' fill-opacity='0.5'%3E%3Cpath d='M0 0h4v4H0V0zm4 4h4v4H4V4z'/%3E%3C/g%3E%3C/svg%3E")`
                }}
                onMouseDown={(e) => {
                  setIsDragging(true);
                  handleAlphaChange(e);
                }}
                onMouseMove={(e) => {
                  if (isDragging) handleAlphaChange(e);
                }}
                onMouseUp={() => setIsDragging(false)}
              >
                {/* Alpha Handle */}
                <div
                  className="absolute w-3 h-6 border-2 border-white rounded shadow-lg transform -translate-x-1/2 -translate-y-1/2 top-1/2"
                  style={{
                    left: `${color.a * 100}%`,
                    backgroundColor: `rgba(${color.r}, ${color.g}, ${color.b}, ${color.a})`
                  }}
                />
              </div>
            </div>
          )}

          {/* Current Color Display */}
          <div className="flex items-center space-x-4">
            <div
              className="w-12 h-12 rounded border-2 border-gray-300"
              style={{ backgroundColor: color.hex }}
            />
            <div className="flex-1">
              <div className="text-sm font-medium">{color.hex}</div>
              <div className="text-xs text-gray-500">
                RGB({color.r}, {color.g}, {color.b})
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Presets Tab */}
      {activeTab === 'presets' && showPresets && (
        <div className="space-y-4">
          <div className="grid grid-cols-8 gap-2">
            {colorPresets.map((preset, index) => (
              <button
                key={index}
                onClick={() => handlePresetClick(preset.hex)}
                className="w-8 h-8 rounded border-2 border-gray-300 hover:border-gray-400 transition-colors"
                style={{ backgroundColor: preset.hex }}
                title={preset.name}
              />
            ))}
          </div>
        </div>
      )}

      {/* History Tab */}
      {activeTab === 'history' && showHistory && (
        <div className="space-y-4">
          <div className="grid grid-cols-8 gap-2">
            {colorHistory.map((historyColor, index) => (
              <button
                key={index}
                onClick={() => handleColorChange(historyColor)}
                className="w-8 h-8 rounded border-2 border-gray-300 hover:border-gray-400 transition-colors"
                style={{ backgroundColor: historyColor.hex }}
                title={historyColor.hex}
              />
            ))}
          </div>
        </div>
      )}

      {/* Formats Tab */}
      {activeTab === 'formats' && showFormats && (
        <div className="space-y-3">
          {Object.entries(formatValues).map(([format, value]) => (
            <div key={format} className="flex items-center space-x-2">
              <div className="w-16 text-sm font-medium text-gray-600 uppercase">
                {format}
              </div>
              <div className="flex-1 bg-gray-100 rounded px-2 py-1 text-sm font-mono">
                {value}
              </div>
              <button
                onClick={() => copyColorFormat(format, value)}
                className="p-1 text-gray-500 hover:text-gray-700"
                title="Copy to clipboard"
              >
                {copiedFormat === format ? <Check size={16} /> : <Copy size={16} />}
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ColorPicker;
