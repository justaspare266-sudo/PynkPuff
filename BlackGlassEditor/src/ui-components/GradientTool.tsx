import React, { useState, useCallback } from 'react';
// import { Button } from './Button';
import { Palette, Plus, Trash2 } from 'lucide-react';
import { Theme } from './ThemeSwitcher';

interface ColorStop {
  id: string;
  color: string;
  position: number;
  opacity: number;
}

interface GradientToolProps {
  currentTheme: Theme;
  gradientType: 'linear' | 'radial';
  onGradientTypeChange: (type: 'linear' | 'radial') => void;
  angle: number;
  onAngleChange: (angle: number) => void;
  colorStops: ColorStop[];
  onColorStopsChange: (stops: ColorStop[]) => void;
  onApplyGradient: (gradient: any) => void;
}

export function GradientTool({
  currentTheme,
  gradientType,
  onGradientTypeChange,
  angle,
  onAngleChange,
  colorStops,
  onColorStopsChange,
  onApplyGradient
}: GradientToolProps) {
  const [draggedStopId, setDraggedStopId] = useState<string | null>(null);

  const getThemeClasses = () => {
    switch (currentTheme) {
      case "light":
        return "bg-white/90 backdrop-blur-md border border-gray-200";
      case "pink":
        return "bg-pink-50/90 backdrop-blur-md border border-pink-200";
      case "gold":
        return "bg-amber-50/90 backdrop-blur-md border border-amber-200";
      default:
        return "bg-black/80 backdrop-blur-md border border-white/10";
    }
  };

  const getButtonClasses = () => {
    switch (currentTheme) {
      case "light":
        return "text-gray-600 hover:text-gray-900 hover:bg-gray-100";
      case "pink":
        return "text-pink-600 hover:text-pink-900 hover:bg-pink-100";
      case "gold":
        return "text-amber-600 hover:text-amber-900 hover:bg-amber-100";
      default:
        return "text-white/70 hover:text-white hover:bg-white/10";
    }
  };

  const getLabelClasses = () => {
    switch (currentTheme) {
      case "light":
        return "text-gray-700";
      case "pink":
        return "text-pink-700";
      case "gold":
        return "text-amber-700";
      default:
        return "text-white";
    }
  };

  const getInputClasses = () => {
    switch (currentTheme) {
      case "light":
        return "bg-white border-gray-300 text-gray-900";
      case "pink":
        return "bg-pink-50 border-pink-300 text-pink-900";
      case "gold":
        return "bg-amber-50 border-amber-300 text-amber-900";
      default:
        return "bg-white/10 border-white/20 text-white";
    }
  };

  const addColorStop = useCallback(() => {
    const newStop: ColorStop = {
      id: `stop-${Date.now()}`,
      color: '#3b82f6',
      position: 50,
      opacity: 1
    };
    onColorStopsChange([...colorStops, newStop]);
  }, [colorStops, onColorStopsChange]);

  const removeColorStop = useCallback((stopId: string) => {
    if (colorStops.length > 2) {
      onColorStopsChange(colorStops.filter(stop => stop.id !== stopId));
    }
  }, [colorStops, onColorStopsChange]);

  const updateColorStop = useCallback((stopId: string, updates: Partial<ColorStop>) => {
    onColorStopsChange(colorStops.map(stop => 
      stop.id === stopId ? { ...stop, ...updates } : stop
    ));
  }, [colorStops, onColorStopsChange]);

  const handleGradientPreviewClick = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const position = Math.max(0, Math.min(100, (x / rect.width) * 100));
    
    const newStop: ColorStop = {
      id: `stop-${Date.now()}`,
      color: '#3b82f6',
      position,
      opacity: 1
    };
    onColorStopsChange([...colorStops, newStop]);
  }, [colorStops, onColorStopsChange]);

  const handleStopDrag = useCallback((stopId: string, e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const position = Math.max(0, Math.min(100, (x / rect.width) * 100));
    updateColorStop(stopId, { position });
  }, [updateColorStop]);

  const generateGradientCSS = () => {
    const sortedStops = [...colorStops].sort((a, b) => a.position - b.position);
    const colorStopsString = sortedStops
      .map(stop => `rgba(${hexToRgb(stop.color)}, ${stop.opacity}) ${stop.position}%`)
      .join(', ');

    if (gradientType === 'radial') {
      return `radial-gradient(circle, ${colorStopsString})`;
    }
    return `linear-gradient(${angle}deg, ${colorStopsString})`;
  };

  const hexToRgb = (hex: string) => {
    let r = 0, g = 0, b = 0;
    if (hex.length === 4) {
      r = parseInt(hex[1] + hex[1], 16);
      g = parseInt(hex[2] + hex[2], 16);
      b = parseInt(hex[3] + hex[3], 16);
    } else if (hex.length === 7) {
      r = parseInt(hex.substring(1, 3), 16);
      g = parseInt(hex.substring(3, 5), 16);
      b = parseInt(hex.substring(5, 7), 16);
    }
    return `${r}, ${g}, ${b}`;
  };

  const applyGradient = () => {
    const gradient = {
      type: gradientType,
      angle,
      colorStops: colorStops.map(stop => ({
        color: stop.color,
        position: stop.position,
        opacity: stop.opacity
      }))
    };
    onApplyGradient(gradient);
  };

  return (
    <div className={`p-4 rounded-lg ${getThemeClasses()}`}>
      <div className="flex items-center gap-2 mb-4">
        <Palette className="h-5 w-5" />
        <h3 className={`text-lg font-semibold ${getLabelClasses()}`}>Gradient Tool</h3>
      </div>

      {/* Gradient Type */}
      <div className="mb-4">
        <div className="flex gap-2">
          <button
            className={`h-8 px-3 rounded text-sm ${
              gradientType === 'linear' 
                ? 'bg-blue-500 text-white' 
                : getButtonClasses()
            }`}
            onClick={() => onGradientTypeChange('linear')}
          >
            Linear
          </button>
          <button
            className={`h-8 px-3 rounded text-sm ${
              gradientType === 'radial' 
                ? 'bg-blue-500 text-white' 
                : getButtonClasses()
            }`}
            onClick={() => onGradientTypeChange('radial')}
          >
            Radial
          </button>
        </div>
      </div>

      {/* Angle Control (for linear gradients) */}
      {gradientType === 'linear' && (
        <div className="mb-4">
          <label className={`block text-sm font-medium mb-2 ${getLabelClasses()}`}>
            Angle: {angle}°
          </label>
          <input
            type="range"
            min="0"
            max="360"
            value={angle}
            onChange={(e) => onAngleChange(parseInt(e.target.value))}
            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
          />
        </div>
      )}

      {/* Gradient Preview */}
      <div className="mb-4">
        <label className={`block text-sm font-medium mb-2 ${getLabelClasses()}`}>
          Preview
        </label>
        <div
          className="w-full h-16 rounded-lg border-2 border-dashed border-gray-300 cursor-pointer relative"
          style={{ background: generateGradientCSS() }}
          onClick={handleGradientPreviewClick}
        >
          {/* Color Stops */}
          {colorStops.map((stop) => (
            <div
              key={stop.id}
              className="absolute top-0 w-4 h-4 rounded-full border-2 border-white shadow-lg cursor-pointer transform -translate-x-2 -translate-y-2"
              style={{
                left: `${stop.position}%`,
                backgroundColor: stop.color
              }}
              onMouseDown={(e) => {
                setDraggedStopId(stop.id);
                e.stopPropagation();
              }}
              onMouseMove={(e) => {
                if (draggedStopId === stop.id) {
                  handleStopDrag(stop.id, e);
                }
              }}
              onMouseUp={() => setDraggedStopId(null)}
            />
          ))}
        </div>
        <p className="text-xs text-gray-500 mt-1">Click to add color stops</p>
      </div>

      {/* Color Stops */}
      <div className="mb-4">
        <div className="flex items-center justify-between mb-2">
          <label className={`text-sm font-medium ${getLabelClasses()}`}>
            Color Stops
          </label>
          <button
            className={`h-6 w-6 p-0 rounded ${getButtonClasses()}`}
            onClick={addColorStop}
          >
            <Plus className="h-4 w-4" />
          </button>
        </div>
        
        <div className="space-y-2 max-h-32 overflow-y-auto">
          {colorStops.map((stop) => (
            <div key={stop.id} className="flex items-center gap-2">
              <input
                type="color"
                value={stop.color}
                onChange={(e) => updateColorStop(stop.id, { color: e.target.value })}
                className="w-8 h-8 border border-gray-300 rounded cursor-pointer"
              />
              <input
                type="number"
                min="0"
                max="100"
                value={stop.position}
                onChange={(e) => updateColorStop(stop.id, { position: parseInt(e.target.value) || 0 })}
                className={`w-16 h-8 px-2 text-sm rounded border ${getInputClasses()}`}
              />
              <input
                type="range"
                min="0"
                max="1"
                step="0.1"
                value={stop.opacity}
                onChange={(e) => updateColorStop(stop.id, { opacity: parseFloat(e.target.value) })}
                className="flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
              />
              <span className="text-xs text-gray-500 w-8">
                {Math.round(stop.opacity * 100)}%
              </span>
              {colorStops.length > 2 && (
                <button
                  className={`h-6 w-6 p-0 rounded text-red-500 hover:text-red-700 ${getButtonClasses()}`}
                  onClick={() => removeColorStop(stop.id)}
                >
                  <Trash2 className="h-3 w-3" />
                </button>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Apply Button */}
      <button
        className="w-full h-8 bg-blue-500 text-white rounded hover:bg-blue-600"
        onClick={applyGradient}
      >
        Apply Gradient
      </button>
    </div>
  );
}
