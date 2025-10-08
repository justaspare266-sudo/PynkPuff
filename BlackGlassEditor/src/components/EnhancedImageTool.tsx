import React, { useState, useCallback, useRef } from 'react';
import { 
  Image as ImageIcon,
  Upload,
  Crop,
  RotateCw,
  RotateCcw,
  FlipHorizontal,
  FlipVertical,
  ZoomIn,
  ZoomOut,
  Download,
  Settings,
  Trash2,
  Copy,
  Move,
  Palette,
  Sun,
  Contrast,
  Droplets,
  Circle as Blur,
  Zap as Sharpen,
  Filter,
  Eye,
  EyeOff,
  X
} from 'lucide-react';

export interface ImageStyle {
  width: number;
  height: number;
  rotation: number;
  scaleX: number;
  scaleY: number;
  opacity: number;
  // Filter properties
  brightness: number;
  contrast: number;
  saturation: number;
  hue: number;
  blur: number;
  sharpen: number;
  sepia: number;
  grayscale: number;
  invert: number;
  // Shadow properties
  shadowColor: string;
  shadowBlur: number;
  shadowOffsetX: number;
  shadowOffsetY: number;
  shadowOpacity: number;
  shadowEnabled: boolean;
  // Crop properties
  cropX: number;
  cropY: number;
  cropWidth: number;
  cropHeight: number;
  cropEnabled: boolean;
}

interface EnhancedImageToolProps {
  currentStyle: ImageStyle;
  onStyleChange: (style: ImageStyle) => void;
  onImageUpload: (file: File) => void;
  onClose?: () => void;
}

const filterPresets = [
  { name: 'None', filters: { brightness: 0, contrast: 0, saturation: 0, hue: 0, blur: 0, sharpen: 0, sepia: 0, grayscale: 0, invert: 0 } },
  { name: 'Vintage', filters: { brightness: 10, contrast: 20, saturation: -30, hue: 0, blur: 0, sharpen: 0, sepia: 0.3, grayscale: 0, invert: 0 } },
  { name: 'Black & White', filters: { brightness: 0, contrast: 10, saturation: -100, hue: 0, blur: 0, sharpen: 0, sepia: 0, grayscale: 1, invert: 0 } },
  { name: 'High Contrast', filters: { brightness: 0, contrast: 50, saturation: 0, hue: 0, blur: 0, sharpen: 0, sepia: 0, grayscale: 0, invert: 0 } },
  { name: 'Sepia', filters: { brightness: 0, contrast: 0, saturation: -50, hue: 0, blur: 0, sharpen: 0, sepia: 0.8, grayscale: 0, invert: 0 } },
  { name: 'Invert', filters: { brightness: 0, contrast: 0, saturation: 0, hue: 0, blur: 0, sharpen: 0, sepia: 0, grayscale: 0, invert: 1 } }
];

export const EnhancedImageTool: React.FC<EnhancedImageToolProps> = ({
  currentStyle,
  onStyleChange,
  onImageUpload,
  onClose
}) => {
  const [activeTab, setActiveTab] = useState<'upload' | 'transform' | 'filters' | 'effects' | 'crop'>('upload');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleStyleChange = useCallback((updates: Partial<ImageStyle>) => {
    onStyleChange({ ...currentStyle, ...updates });
  }, [currentStyle, onStyleChange]);

  const handleFileUpload = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      onImageUpload(file);
    }
  }, [onImageUpload]);

  const applyPreset = useCallback((preset: typeof filterPresets[0]) => {
    handleStyleChange(preset.filters);
  }, [handleStyleChange]);

  return (
    <div className="bg-white border border-gray-200 rounded-lg shadow-lg p-4 w-80">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold flex items-center">
          <ImageIcon className="w-5 h-5 mr-2" />
          Image Tool
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
          { id: 'upload', label: 'Upload', icon: Upload },
          { id: 'transform', label: 'Transform', icon: Move },
          { id: 'filters', label: 'Filters', icon: Filter },
          { id: 'effects', label: 'Effects', icon: Palette },
          { id: 'crop', label: 'Crop', icon: Crop }
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

      {/* Upload Tab */}
      {activeTab === 'upload' && (
        <div className="space-y-4">
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
            <Upload className="w-12 h-12 mx-auto text-gray-400 mb-4" />
            <p className="text-sm text-gray-600 mb-4">Upload an image to get started</p>
            <button
              onClick={() => fileInputRef.current?.click()}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              Choose Image
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileUpload}
              className="hidden"
            />
          </div>
        </div>
      )}

      {/* Transform Tab */}
      {activeTab === 'transform' && (
        <div className="space-y-4">
          {/* Size */}
          <div>
            <label className="block text-sm font-medium mb-2">Size</label>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-xs text-gray-600 mb-1">Width</label>
                <input
                  type="number"
                  value={currentStyle.width}
                  onChange={(e) => handleStyleChange({ width: parseInt(e.target.value) })}
                  className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                />
              </div>
              <div>
                <label className="block text-xs text-gray-600 mb-1">Height</label>
                <input
                  type="number"
                  value={currentStyle.height}
                  onChange={(e) => handleStyleChange({ height: parseInt(e.target.value) })}
                  className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                />
              </div>
            </div>
          </div>

          {/* Rotation */}
          <div>
            <label className="block text-sm font-medium mb-2">Rotation</label>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => handleStyleChange({ rotation: currentStyle.rotation - 90 })}
                className="p-2 border border-gray-300 rounded hover:bg-gray-50"
              >
                <RotateCcw className="w-4 h-4" />
              </button>
              <input
                type="range"
                min="0"
                max="360"
                value={currentStyle.rotation}
                onChange={(e) => handleStyleChange({ rotation: parseInt(e.target.value) })}
                className="flex-1"
              />
              <button
                onClick={() => handleStyleChange({ rotation: currentStyle.rotation + 90 })}
                className="p-2 border border-gray-300 rounded hover:bg-gray-50"
              >
                <RotateCw className="w-4 h-4" />
              </button>
            </div>
            <span className="text-sm text-gray-600">{currentStyle.rotation}°</span>
          </div>

          {/* Scale */}
          <div>
            <label className="block text-sm font-medium mb-2">Scale</label>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-xs text-gray-600 mb-1">X</label>
                <input
                  type="range"
                  min="0.1"
                  max="3"
                  step="0.1"
                  value={currentStyle.scaleX}
                  onChange={(e) => handleStyleChange({ scaleX: parseFloat(e.target.value) })}
                  className="w-full"
                />
                <span className="text-xs text-gray-600">{currentStyle.scaleX.toFixed(1)}</span>
              </div>
              <div>
                <label className="block text-xs text-gray-600 mb-1">Y</label>
                <input
                  type="range"
                  min="0.1"
                  max="3"
                  step="0.1"
                  value={currentStyle.scaleY}
                  onChange={(e) => handleStyleChange({ scaleY: parseFloat(e.target.value) })}
                  className="w-full"
                />
                <span className="text-xs text-gray-600">{currentStyle.scaleY.toFixed(1)}</span>
              </div>
            </div>
          </div>

          {/* Opacity */}
          <div>
            <label className="block text-sm font-medium mb-2">Opacity</label>
            <input
              type="range"
              min="0"
              max="1"
              step="0.1"
              value={currentStyle.opacity}
              onChange={(e) => handleStyleChange({ opacity: parseFloat(e.target.value) })}
              className="w-full"
            />
            <span className="text-sm text-gray-600">{Math.round(currentStyle.opacity * 100)}%</span>
          </div>

          {/* Flip */}
          <div>
            <label className="block text-sm font-medium mb-2">Flip</label>
            <div className="flex space-x-2">
              <button
                onClick={() => handleStyleChange({ scaleX: -currentStyle.scaleX })}
                className="flex-1 px-3 py-2 border border-gray-300 rounded hover:bg-gray-50 flex items-center justify-center space-x-1"
              >
                <FlipHorizontal className="w-4 h-4" />
                <span className="text-sm">Horizontal</span>
              </button>
              <button
                onClick={() => handleStyleChange({ scaleY: -currentStyle.scaleY })}
                className="flex-1 px-3 py-2 border border-gray-300 rounded hover:bg-gray-50 flex items-center justify-center space-x-1"
              >
                <FlipVertical className="w-4 h-4" />
                <span className="text-sm">Vertical</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Filters Tab */}
      {activeTab === 'filters' && (
        <div className="space-y-4">
          {/* Presets */}
          <div>
            <label className="block text-sm font-medium mb-2">Presets</label>
            <div className="grid grid-cols-2 gap-2">
              {filterPresets.map(preset => (
                <button
                  key={preset.name}
                  onClick={() => applyPreset(preset)}
                  className="px-3 py-2 text-sm border border-gray-300 rounded hover:bg-gray-50"
                >
                  {preset.name}
                </button>
              ))}
            </div>
          </div>

          {/* Brightness */}
          <div>
            <label className="block text-sm font-medium mb-2 flex items-center">
              <Sun className="w-4 h-4 mr-2" />
              Brightness
            </label>
            <input
              type="range"
              min="-100"
              max="100"
              value={currentStyle.brightness}
              onChange={(e) => handleStyleChange({ brightness: parseInt(e.target.value) })}
              className="w-full"
            />
            <span className="text-sm text-gray-600">{currentStyle.brightness}%</span>
          </div>

          {/* Contrast */}
          <div>
            <label className="block text-sm font-medium mb-2 flex items-center">
              <Contrast className="w-4 h-4 mr-2" />
              Contrast
            </label>
            <input
              type="range"
              min="-100"
              max="100"
              value={currentStyle.contrast}
              onChange={(e) => handleStyleChange({ contrast: parseInt(e.target.value) })}
              className="w-full"
            />
            <span className="text-sm text-gray-600">{currentStyle.contrast}%</span>
          </div>

          {/* Saturation */}
          <div>
            <label className="block text-sm font-medium mb-2 flex items-center">
              <Droplets className="w-4 h-4 mr-2" />
              Saturation
            </label>
            <input
              type="range"
              min="-100"
              max="100"
              value={currentStyle.saturation}
              onChange={(e) => handleStyleChange({ saturation: parseInt(e.target.value) })}
              className="w-full"
            />
            <span className="text-sm text-gray-600">{currentStyle.saturation}%</span>
          </div>

          {/* Hue */}
          <div>
            <label className="block text-sm font-medium mb-2">Hue</label>
            <input
              type="range"
              min="-180"
              max="180"
              value={currentStyle.hue}
              onChange={(e) => handleStyleChange({ hue: parseInt(e.target.value) })}
              className="w-full"
            />
            <span className="text-sm text-gray-600">{currentStyle.hue}°</span>
          </div>

          {/* Blur */}
          <div>
            <label className="block text-sm font-medium mb-2 flex items-center">
              <Blur className="w-4 h-4 mr-2" />
              Blur
            </label>
            <input
              type="range"
              min="0"
              max="20"
              value={currentStyle.blur}
              onChange={(e) => handleStyleChange({ blur: parseInt(e.target.value) })}
              className="w-full"
            />
            <span className="text-sm text-gray-600">{currentStyle.blur}px</span>
          </div>

          {/* Sharpen */}
          <div>
            <label className="block text-sm font-medium mb-2 flex items-center">
              <Sharpen className="w-4 h-4 mr-2" />
              Sharpen
            </label>
            <input
              type="range"
              min="0"
              max="100"
              value={currentStyle.sharpen}
              onChange={(e) => handleStyleChange({ sharpen: parseInt(e.target.value) })}
              className="w-full"
            />
            <span className="text-sm text-gray-600">{currentStyle.sharpen}%</span>
          </div>
        </div>
      )}

      {/* Effects Tab */}
      {activeTab === 'effects' && (
        <div className="space-y-4">
          {/* Sepia */}
          <div>
            <label className="block text-sm font-medium mb-2">Sepia</label>
            <input
              type="range"
              min="0"
              max="1"
              step="0.1"
              value={currentStyle.sepia}
              onChange={(e) => handleStyleChange({ sepia: parseFloat(e.target.value) })}
              className="w-full"
            />
            <span className="text-sm text-gray-600">{Math.round(currentStyle.sepia * 100)}%</span>
          </div>

          {/* Grayscale */}
          <div>
            <label className="block text-sm font-medium mb-2">Grayscale</label>
            <input
              type="range"
              min="0"
              max="1"
              step="0.1"
              value={currentStyle.grayscale}
              onChange={(e) => handleStyleChange({ grayscale: parseFloat(e.target.value) })}
              className="w-full"
            />
            <span className="text-sm text-gray-600">{Math.round(currentStyle.grayscale * 100)}%</span>
          </div>

          {/* Invert */}
          <div>
            <label className="block text-sm font-medium mb-2">Invert</label>
            <input
              type="range"
              min="0"
              max="1"
              step="0.1"
              value={currentStyle.invert}
              onChange={(e) => handleStyleChange({ invert: parseFloat(e.target.value) })}
              className="w-full"
            />
            <span className="text-sm text-gray-600">{Math.round(currentStyle.invert * 100)}%</span>
          </div>

          {/* Shadow */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="block text-sm font-medium">Shadow</label>
              <input
                type="checkbox"
                checked={currentStyle.shadowEnabled}
                onChange={(e) => handleStyleChange({ shadowEnabled: e.target.checked })}
                className="rounded"
              />
            </div>
            
            {currentStyle.shadowEnabled && (
              <div className="space-y-3 pl-4 border-l-2 border-gray-200">
                <div>
                  <label className="block text-xs text-gray-600 mb-1">Color</label>
                  <div className="flex items-center space-x-2">
                    <input
                      type="color"
                      value={currentStyle.shadowColor}
                      onChange={(e) => handleStyleChange({ shadowColor: e.target.value })}
                      className="w-8 h-8 rounded border border-gray-300"
                    />
                    <input
                      type="text"
                      value={currentStyle.shadowColor}
                      onChange={(e) => handleStyleChange({ shadowColor: e.target.value })}
                      className="flex-1 px-2 py-1 border border-gray-300 rounded text-sm"
                    />
                  </div>
                </div>
                
                <div>
                  <label className="block text-xs text-gray-600 mb-1">Blur</label>
                  <input
                    type="range"
                    min="0"
                    max="50"
                    value={currentStyle.shadowBlur}
                    onChange={(e) => handleStyleChange({ shadowBlur: parseInt(e.target.value) })}
                    className="w-full"
                  />
                  <span className="text-xs text-gray-600">{currentStyle.shadowBlur}px</span>
                </div>
                
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-xs text-gray-600 mb-1">Offset X</label>
                    <input
                      type="range"
                      min="-50"
                      max="50"
                      value={currentStyle.shadowOffsetX}
                      onChange={(e) => handleStyleChange({ shadowOffsetX: parseInt(e.target.value) })}
                      className="w-full"
                    />
                    <span className="text-xs text-gray-600">{currentStyle.shadowOffsetX}px</span>
                  </div>
                  <div>
                    <label className="block text-xs text-gray-600 mb-1">Offset Y</label>
                    <input
                      type="range"
                      min="-50"
                      max="50"
                      value={currentStyle.shadowOffsetY}
                      onChange={(e) => handleStyleChange({ shadowOffsetY: parseInt(e.target.value) })}
                      className="w-full"
                    />
                    <span className="text-xs text-gray-600">{currentStyle.shadowOffsetY}px</span>
                  </div>
                </div>

                <div>
                  <label className="block text-xs text-gray-600 mb-1">Opacity</label>
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.1"
                    value={currentStyle.shadowOpacity}
                    onChange={(e) => handleStyleChange({ shadowOpacity: parseFloat(e.target.value) })}
                    className="w-full"
                  />
                  <span className="text-xs text-gray-600">{Math.round(currentStyle.shadowOpacity * 100)}%</span>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Crop Tab */}
      {activeTab === 'crop' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between mb-2">
            <label className="block text-sm font-medium">Enable Crop</label>
            <input
              type="checkbox"
              checked={currentStyle.cropEnabled}
              onChange={(e) => handleStyleChange({ cropEnabled: e.target.checked })}
              className="rounded"
            />
          </div>
          
          {currentStyle.cropEnabled && (
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs text-gray-600 mb-1">X</label>
                  <input
                    type="number"
                    value={currentStyle.cropX}
                    onChange={(e) => handleStyleChange({ cropX: parseInt(e.target.value) })}
                    className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-600 mb-1">Y</label>
                  <input
                    type="number"
                    value={currentStyle.cropY}
                    onChange={(e) => handleStyleChange({ cropY: parseInt(e.target.value) })}
                    className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs text-gray-600 mb-1">Width</label>
                  <input
                    type="number"
                    value={currentStyle.cropWidth}
                    onChange={(e) => handleStyleChange({ cropWidth: parseInt(e.target.value) })}
                    className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-600 mb-1">Height</label>
                  <input
                    type="number"
                    value={currentStyle.cropHeight}
                    onChange={(e) => handleStyleChange({ cropHeight: parseInt(e.target.value) })}
                    className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                  />
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
