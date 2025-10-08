'use client';

import React, { useState, useRef, useEffect, useCallback, forwardRef, useImperativeHandle } from 'react';
import { Image as ImageIcon, Crop, RotateCw, RotateCcw, FlipHorizontal, FlipVertical, ZoomIn, ZoomOut, Download, Upload, Eye, EyeOff, Settings, Trash2, Copy, Move, Square, Circle, ArrowRight, Star, Hexagon, Triangle, Zap, Layers, Lock, Unlock, Palette } from 'lucide-react';

// Types
export interface ImageElement {
  id: string;
  type: 'image';
  x: number;
  y: number;
  width: number;
  height: number;
  src: string;
  rotation: number;
  scaleX: number;
  scaleY: number;
  opacity: number;
  visible: boolean;
  zIndex: number;
  isSelected: boolean;
  isDragging: boolean;
  isResizing: boolean;
  isRotating: boolean;
  
  // Image-specific properties
  cropData?: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
  imageWidth?: number;
  imageHeight?: number;
  
  // Transform properties
  offsetX?: number;
  offsetY?: number;
  
  // Filter properties
  filters?: {
    brightness?: number;
    contrast?: number;
    saturation?: number;
    hue?: number;
    blur?: number;
    sharpen?: number;
    noise?: number;
    pixelate?: number;
    sepia?: number;
    grayscale?: number;
    invert?: number;
  };
  
  // Shadow properties
  shadowColor?: string;
  shadowBlur?: number;
  shadowOffset?: { x: number; y: number };
  shadowOpacity?: number;
  shadowEnabled?: boolean;
  
  // Performance properties
  isCached: boolean;
  perfectDrawEnabled: boolean;
  listening: boolean;
  
  // State tracking
  boundaryState: {
    isWithinBounds: boolean;
    violationType: 'x' | 'y' | 'width' | 'height' | null;
  };
  name: string;
  locked: boolean;
  isGrouped: boolean;
}

interface ImageToolProps {
  onImageAdd: (imageElement: Omit<ImageElement, 'id'>) => void;
  onImageUpdate: (id: string, updates: Partial<ImageElement>) => void;
  onImageDelete: (id: string) => void;
  canvasState: {
    width: number;
    height: number;
    zoom: number;
    panX: number;
    panY: number;
    gridSize: number;
    snapToGrid: boolean;
    showGrid: boolean;
  };
  selectedImageElement?: ImageElement;
}

export interface ImageToolRef {
  addImage: (src: string, x: number, y: number) => void;
  updateImage: (id: string, updates: Partial<ImageElement>) => void;
  deleteImage: (id: string) => void;
  duplicateImage: (id: string) => void;
  cropImage: (id: string, cropData: { x: number; y: number; width: number; height: number }) => void;
  applyFilter: (id: string, filter: string, value: number) => void;
  applyShadow: (id: string, shadow: any) => void;
  toggleCache: (id: string) => void;
  loadImage: () => void;
  exportImage: (id: string) => void;
}

const ImageTool = forwardRef<ImageToolRef, ImageToolProps>(({
  onImageAdd,
  onImageUpdate,
  onImageDelete,
  canvasState,
  selectedImageElement
}, ref) => {
  // Image properties state
  const [imageProperties, setImageProperties] = useState<Partial<ImageElement>>({
    type: 'image',
    width: 200,
    height: 200,
    rotation: 0,
    scaleX: 1,
    scaleY: 1,
    opacity: 1,
    visible: true,
    zIndex: 1,
    isSelected: false,
    isDragging: false,
    isResizing: false,
    isRotating: false,
    isCached: false,
    perfectDrawEnabled: true,
    listening: true,
    filters: {
      brightness: 0,
      contrast: 0,
      saturation: 0,
      hue: 0,
      blur: 0,
      sharpen: 0,
      noise: 0,
      pixelate: 0,
      sepia: 0,
      grayscale: 0,
      invert: 0
    },
    shadowEnabled: false,
    shadowColor: '#000000',
    shadowBlur: 10,
    shadowOffset: { x: 2, y: 2 },
    shadowOpacity: 0.5,
    boundaryState: {
      isWithinBounds: true,
      violationType: null
    }
  });

  // UI state
  const [showFilters, setShowFilters] = useState(false);
  const [showCropTool, setShowCropTool] = useState(false);
  const [showAdvancedSettings, setShowAdvancedSettings] = useState(false);
  const [showShadowEditor, setShowShadowEditor] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // File input ref
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Expose methods to parent
  useImperativeHandle(ref, () => ({
    addImage: (src: string, x: number, y: number) => {
      const newImageElement: Omit<ImageElement, 'id'> = {
        type: 'image',
        x: x - 100,
        y: y - 100,
        width: 200,
        height: 200,
        src,
        ...imageProperties,
        isSelected: true,
        isDragging: false,
        isResizing: false,
        isRotating: false
      } as Omit<ImageElement, 'id'>;
      
      onImageAdd(newImageElement);
    },
    updateImage: (id: string, updates: Partial<ImageElement>) => {
      onImageUpdate(id, updates);
    },
    deleteImage: (id: string) => {
      onImageDelete(id);
    },
    duplicateImage: (id: string) => {
      if (selectedImageElement) {
        const duplicatedElement: Omit<ImageElement, 'id'> = {
          ...selectedImageElement,
          x: selectedImageElement.x + 20,
          y: selectedImageElement.y + 20,
          isSelected: true
        };
        onImageAdd(duplicatedElement);
      }
    },
    cropImage: (id: string, cropData: { x: number; y: number; width: number; height: number }) => {
      onImageUpdate(id, { cropData });
    },
    applyFilter: (id: string, filter: string, value: number) => {
      if (selectedImageElement) {
        onImageUpdate(id, {
          filters: {
            ...selectedImageElement.filters,
            [filter]: value
          }
        });
      }
    },
    applyShadow: (id: string, shadow: any) => {
      onImageUpdate(id, shadow);
    },
    toggleCache: (id: string) => {
      if (selectedImageElement) {
        onImageUpdate(id, { isCached: !selectedImageElement.isCached });
      }
    },
    loadImage: () => {
      fileInputRef.current?.click();
    },
    exportImage: (id: string) => {
      if (selectedImageElement) {
        const link = document.createElement('a');
        link.href = selectedImageElement.src;
        link.download = `image-${id}.png`;
        link.click();
      }
    }
  }));

  // Update image properties when selected element changes
  useEffect(() => {
    if (selectedImageElement) {
      setImageProperties(selectedImageElement);
    }
  }, [selectedImageElement]);

  // Handle file upload
  const handleFileUpload = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setError('Please select a valid image file');
      return;
    }

    setIsLoading(true);
    setError(null);

    const reader = new FileReader();
    reader.onload = (e) => {
      const src = e.target?.result as string;
      if (src) {
        // Create a new image element
        const newImageElement: Omit<ImageElement, 'id'> = {
          type: 'image',
          x: canvasState.width / 2 - 100,
          y: canvasState.height / 2 - 100,
          width: 200,
          height: 200,
          src,
          ...imageProperties,
          isSelected: true,
          isDragging: false,
          isResizing: false,
          isRotating: false
        } as Omit<ImageElement, 'id'>;
        
        onImageAdd(newImageElement);
      }
      setIsLoading(false);
    };
    reader.onerror = () => {
      setError('Failed to load image');
      setIsLoading(false);
    };
    reader.readAsDataURL(file);
  }, [canvasState, imageProperties, onImageAdd]);

  // Handle opacity change
  const handleOpacityChange = useCallback((opacity: number) => {
    setImageProperties(prev => ({ ...prev, opacity }));
    if (selectedImageElement) {
      onImageUpdate(selectedImageElement.id, { opacity });
    }
  }, [selectedImageElement, onImageUpdate]);

  // Handle rotation change
  const handleRotationChange = useCallback((rotation: number) => {
    setImageProperties(prev => ({ ...prev, rotation }));
    if (selectedImageElement) {
      onImageUpdate(selectedImageElement.id, { rotation });
    }
  }, [selectedImageElement, onImageUpdate]);

  // Handle scale change
  const handleScaleChange = useCallback((scaleX: number, scaleY: number) => {
    setImageProperties(prev => ({ ...prev, scaleX, scaleY }));
    if (selectedImageElement) {
      onImageUpdate(selectedImageElement.id, { scaleX, scaleY });
    }
  }, [selectedImageElement, onImageUpdate]);

  // Handle filter change
  const handleFilterChange = useCallback((filter: string, value: number) => {
    setImageProperties(prev => ({
      ...prev,
      filters: {
        ...prev.filters,
        [filter]: value
      }
    }));
    if (selectedImageElement) {
      onImageUpdate(selectedImageElement.id, {
        filters: {
          ...selectedImageElement.filters,
          [filter]: value
        }
      });
    }
  }, [selectedImageElement, onImageUpdate]);

  // Handle shadow change
  const handleShadowChange = useCallback((shadow: any) => {
    setImageProperties(prev => ({ ...prev, ...shadow }));
    if (selectedImageElement) {
      onImageUpdate(selectedImageElement.id, shadow);
    }
  }, [selectedImageElement, onImageUpdate]);

  // Handle visibility toggle
  const handleVisibilityToggle = useCallback(() => {
    setImageProperties(prev => ({ ...prev, visible: !prev.visible }));
    if (selectedImageElement) {
      onImageUpdate(selectedImageElement.id, { visible: !selectedImageElement.visible });
    }
  }, [selectedImageElement, onImageUpdate]);

  // Handle cache toggle
  const handleCacheToggle = useCallback(() => {
    setImageProperties(prev => ({ ...prev, isCached: !prev.isCached }));
    if (selectedImageElement) {
      onImageUpdate(selectedImageElement.id, { isCached: !selectedImageElement.isCached });
    }
  }, [selectedImageElement, onImageUpdate]);

  // Handle perfect draw toggle
  const handlePerfectDrawToggle = useCallback(() => {
    setImageProperties(prev => ({ ...prev, perfectDrawEnabled: !prev.perfectDrawEnabled }));
    if (selectedImageElement) {
      onImageUpdate(selectedImageElement.id, { perfectDrawEnabled: !selectedImageElement.perfectDrawEnabled });
    }
  }, [selectedImageElement, onImageUpdate]);

  // Handle listening toggle
  const handleListeningToggle = useCallback(() => {
    setImageProperties(prev => ({ ...prev, listening: !prev.listening }));
    if (selectedImageElement) {
      onImageUpdate(selectedImageElement.id, { listening: !selectedImageElement.listening });
    }
  }, [selectedImageElement, onImageUpdate]);

  // Generate CSS filters string
  const generateCSSFilters = useCallback((filters: any) => {
    if (!filters) return '';
    
    const filterArray = [];
    if (filters.brightness !== 0) filterArray.push(`brightness(${100 + filters.brightness}%)`);
    if (filters.contrast !== 0) filterArray.push(`contrast(${100 + filters.contrast}%)`);
    if (filters.saturation !== 0) filterArray.push(`saturate(${100 + filters.saturation}%)`);
    if (filters.hue !== 0) filterArray.push(`hue-rotate(${filters.hue}deg)`);
    if (filters.blur !== 0) filterArray.push(`blur(${filters.blur}px)`);
    if (filters.sepia !== 0) filterArray.push(`sepia(${filters.sepia}%)`);
    if (filters.grayscale !== 0) filterArray.push(`grayscale(${filters.grayscale}%)`);
    if (filters.invert !== 0) filterArray.push(`invert(${filters.invert}%)`);
    
    return filterArray.join(' ');
  }, []);

  return (
    <div className="image-tool space-y-4">
      <h3 className="text-lg font-semibold flex items-center">
        <ImageIcon className="w-5 h-5 mr-2" />
        Image Adjustments
      </h3>
      <div className="text-xs text-gray-300 mb-2">Use File → Import Image, drag & drop, or paste to insert images.</div>

      {/* Image Upload */}
      <div>
        <label className="block text-sm font-medium mb-2">Load Image</label>
        <div className="space-y-2">
          <button
            className="w-full p-3 bg-blue-600 hover:bg-blue-700 rounded text-sm flex items-center justify-center space-x-2"
            onClick={() => fileInputRef.current?.click()}
            disabled={isLoading}
          >
            <Upload className="w-4 h-4" />
            <span>{isLoading ? 'Loading...' : 'Choose Image'}</span>
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileUpload}
            className="hidden"
          />
          {error && (
            <div className="text-red-400 text-sm">{error}</div>
          )}
        </div>
      </div>

      {/* Image Preview */}
      {selectedImageElement && (
        <div className="image-preview bg-gray-600 rounded p-4">
          <div className="text-sm font-medium mb-2">Preview</div>
          <div className="w-full h-20 bg-white rounded border border-gray-500 flex items-center justify-center overflow-hidden">
            <img
              src={selectedImageElement.src}
              alt="Preview"
              className="max-w-full max-h-full object-contain"
              style={{
                opacity: selectedImageElement.opacity,
                transform: `rotate(${selectedImageElement.rotation}deg) scale(${selectedImageElement.scaleX}, ${selectedImageElement.scaleY})`,
                filter: generateCSSFilters(selectedImageElement.filters),
                boxShadow: selectedImageElement.shadowEnabled 
                  ? `${selectedImageElement.shadowOffset?.x || 0}px ${selectedImageElement.shadowOffset?.y || 0}px ${selectedImageElement.shadowBlur || 0}px ${selectedImageElement.shadowColor}`
                  : 'none'
              }}
            />
          </div>
        </div>
      )}

      {/* Transform Controls */}
      <div className="space-y-4">
        <h4 className="text-sm font-semibold">Transform</h4>
        
        {/* Opacity */}
        <div>
          <label className="block text-sm font-medium mb-2">Opacity</label>
          <input
            type="range"
            min="0"
            max="1"
            step="0.1"
            value={imageProperties.opacity || 1}
            onChange={(e) => handleOpacityChange(parseFloat(e.target.value))}
            className="w-full"
          />
          <span className="text-xs text-gray-400">{Math.round((imageProperties.opacity || 1) * 100)}%</span>
        </div>

        {/* Rotation */}
        <div>
          <label className="block text-sm font-medium mb-2">Rotation</label>
          <input
            type="range"
            min="0"
            max="360"
            step="1"
            value={imageProperties.rotation || 0}
            onChange={(e) => handleRotationChange(parseInt(e.target.value))}
            className="w-full"
          />
          <span className="text-xs text-gray-400">{imageProperties.rotation || 0}°</span>
        </div>

        {/* Scale Controls */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-2">Scale X</label>
            <input
              type="range"
              min="0.1"
              max="3"
              step="0.1"
              value={imageProperties.scaleX || 1}
              onChange={(e) => handleScaleChange(parseFloat(e.target.value), imageProperties.scaleY || 1)}
              className="w-full"
            />
            <span className="text-xs text-gray-400">{imageProperties.scaleX || 1}</span>
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Scale Y</label>
            <input
              type="range"
              min="0.1"
              max="3"
              step="0.1"
              value={imageProperties.scaleY || 1}
              onChange={(e) => handleScaleChange(imageProperties.scaleX || 1, parseFloat(e.target.value))}
              className="w-full"
            />
            <span className="text-xs text-gray-400">{imageProperties.scaleY || 1}</span>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div>
        <button
          className="flex items-center space-x-2 text-sm font-medium text-gray-300 hover:text-white"
          onClick={() => setShowFilters(!showFilters)}
        >
          <Palette className="w-4 h-4" />
          <span>Image Filters</span>
        </button>
        
        {showFilters && (
          <div className="mt-2 space-y-3 bg-gray-800 p-3 rounded">
            {/* Brightness */}
            <div>
              <label className="block text-sm font-medium mb-1">Brightness</label>
              <input
                type="range"
                min="-100"
                max="100"
                step="1"
                value={imageProperties.filters?.brightness || 0}
                onChange={(e) => handleFilterChange('brightness', parseInt(e.target.value))}
                className="w-full"
              />
              <span className="text-xs text-gray-400">{imageProperties.filters?.brightness || 0}%</span>
            </div>

            {/* Contrast */}
            <div>
              <label className="block text-sm font-medium mb-1">Contrast</label>
              <input
                type="range"
                min="-100"
                max="100"
                step="1"
                value={imageProperties.filters?.contrast || 0}
                onChange={(e) => handleFilterChange('contrast', parseInt(e.target.value))}
                className="w-full"
              />
              <span className="text-xs text-gray-400">{imageProperties.filters?.contrast || 0}%</span>
            </div>

            {/* Saturation */}
            <div>
              <label className="block text-sm font-medium mb-1">Saturation</label>
              <input
                type="range"
                min="-100"
                max="100"
                step="1"
                value={imageProperties.filters?.saturation || 0}
                onChange={(e) => handleFilterChange('saturation', parseInt(e.target.value))}
                className="w-full"
              />
              <span className="text-xs text-gray-400">{imageProperties.filters?.saturation || 0}%</span>
            </div>

            {/* Hue */}
            <div>
              <label className="block text-sm font-medium mb-1">Hue</label>
              <input
                type="range"
                min="-180"
                max="180"
                step="1"
                value={imageProperties.filters?.hue || 0}
                onChange={(e) => handleFilterChange('hue', parseInt(e.target.value))}
                className="w-full"
              />
              <span className="text-xs text-gray-400">{imageProperties.filters?.hue || 0}°</span>
            </div>

            {/* Blur */}
            <div>
              <label className="block text-sm font-medium mb-1">Blur</label>
              <input
                type="range"
                min="0"
                max="20"
                step="0.5"
                value={imageProperties.filters?.blur || 0}
                onChange={(e) => handleFilterChange('blur', parseFloat(e.target.value))}
                className="w-full"
              />
              <span className="text-xs text-gray-400">{imageProperties.filters?.blur || 0}px</span>
            </div>

            {/* Sepia */}
            <div>
              <label className="block text-sm font-medium mb-1">Sepia</label>
              <input
                type="range"
                min="0"
                max="100"
                step="1"
                value={imageProperties.filters?.sepia || 0}
                onChange={(e) => handleFilterChange('sepia', parseInt(e.target.value))}
                className="w-full"
              />
              <span className="text-xs text-gray-400">{imageProperties.filters?.sepia || 0}%</span>
            </div>

            {/* Grayscale */}
            <div>
              <label className="block text-sm font-medium mb-1">Grayscale</label>
              <input
                type="range"
                min="0"
                max="100"
                step="1"
                value={imageProperties.filters?.grayscale || 0}
                onChange={(e) => handleFilterChange('grayscale', parseInt(e.target.value))}
                className="w-full"
              />
              <span className="text-xs text-gray-400">{imageProperties.filters?.grayscale || 0}%</span>
            </div>

            {/* Invert */}
            <div>
              <label className="block text-sm font-medium mb-1">Invert</label>
              <input
                type="range"
                min="0"
                max="100"
                step="1"
                value={imageProperties.filters?.invert || 0}
                onChange={(e) => handleFilterChange('invert', parseInt(e.target.value))}
                className="w-full"
              />
              <span className="text-xs text-gray-400">{imageProperties.filters?.invert || 0}%</span>
            </div>
          </div>
        )}
      </div>

      {/* Shadow Editor */}
      <div>
        <button
          className="flex items-center space-x-2 text-sm font-medium text-gray-300 hover:text-white"
          onClick={() => setShowShadowEditor(!showShadowEditor)}
        >
          <Layers className="w-4 h-4" />
          <span>Shadow</span>
        </button>
        
        {showShadowEditor && (
          <div className="mt-2 space-y-3 bg-gray-800 p-3 rounded">
            <div className="flex items-center">
              <input
                type="checkbox"
                checked={imageProperties.shadowEnabled || false}
                onChange={(e) => handleShadowChange({ shadowEnabled: e.target.checked })}
                className="mr-2"
              />
              <label className="text-sm">Enable Shadow</label>
            </div>
            
            {imageProperties.shadowEnabled && (
              <>
                <div>
                  <label className="block text-sm font-medium mb-1">Shadow Color</label>
                  <input
                    type="color"
                    value={imageProperties.shadowColor || '#000000'}
                    onChange={(e) => handleShadowChange({ shadowColor: e.target.value })}
                    className="w-full h-8 rounded border border-gray-500"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-1">Blur</label>
                  <input
                    type="range"
                    min="0"
                    max="50"
                    step="1"
                    value={imageProperties.shadowBlur || 10}
                    onChange={(e) => handleShadowChange({ shadowBlur: parseInt(e.target.value) })}
                    className="w-full"
                  />
                  <span className="text-xs text-gray-400">{imageProperties.shadowBlur || 10}px</span>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">Offset X</label>
                    <input
                      type="range"
                      min="-50"
                      max="50"
                      step="1"
                      value={imageProperties.shadowOffset?.x || 2}
                      onChange={(e) => handleShadowChange({ 
                        shadowOffset: { 
                          x: parseInt(e.target.value), 
                          y: imageProperties.shadowOffset?.y || 2 
                        } 
                      })}
                      className="w-full"
                    />
                    <span className="text-xs text-gray-400">{imageProperties.shadowOffset?.x || 2}px</span>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Offset Y</label>
                    <input
                      type="range"
                      min="-50"
                      max="50"
                      step="1"
                      value={imageProperties.shadowOffset?.y || 2}
                      onChange={(e) => handleShadowChange({ 
                        shadowOffset: { 
                          x: imageProperties.shadowOffset?.x || 2, 
                          y: parseInt(e.target.value) 
                        } 
                      })}
                      className="w-full"
                    />
                    <span className="text-xs text-gray-400">{imageProperties.shadowOffset?.y || 2}px</span>
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-1">Opacity</label>
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.1"
                    value={imageProperties.shadowOpacity || 0.5}
                    onChange={(e) => handleShadowChange({ shadowOpacity: parseFloat(e.target.value) })}
                    className="w-full"
                  />
                  <span className="text-xs text-gray-400">{Math.round((imageProperties.shadowOpacity || 0.5) * 100)}%</span>
                </div>
              </>
            )}
          </div>
        )}
      </div>

      {/* Advanced Settings Toggle */}
      <div className="border-t border-gray-600 pt-4">
        <button
          className="flex items-center space-x-2 text-sm font-medium text-gray-300 hover:text-white"
          onClick={() => setShowAdvancedSettings(!showAdvancedSettings)}
        >
          <Settings className="w-4 h-4" />
          <span>Advanced Settings</span>
        </button>
      </div>

      {/* Advanced Settings */}
      {showAdvancedSettings && (
        <div className="space-y-4 bg-gray-800 p-4 rounded">
          {/* Performance Settings */}
          <div className="space-y-2">
            <h4 className="text-sm font-semibold">Performance</h4>
            <div className="flex items-center">
              <input
                type="checkbox"
                checked={imageProperties.isCached || false}
                onChange={handleCacheToggle}
                className="mr-2"
              />
              <label className="text-sm">Enable Caching</label>
            </div>
            <div className="flex items-center">
              <input
                type="checkbox"
                checked={imageProperties.perfectDrawEnabled || true}
                onChange={handlePerfectDrawToggle}
                className="mr-2"
              />
              <label className="text-sm">Perfect Draw</label>
            </div>
            <div className="flex items-center">
              <input
                type="checkbox"
                checked={imageProperties.listening || true}
                onChange={handleListeningToggle}
                className="mr-2"
              />
              <label className="text-sm">Event Listening</label>
            </div>
          </div>

          {/* Visibility Toggle */}
          <div className="flex items-center">
            <input
              type="checkbox"
              checked={imageProperties.visible || true}
              onChange={handleVisibilityToggle}
              className="mr-2"
            />
            <label className="text-sm">Visible</label>
          </div>
        </div>
      )}

      {/* Action Buttons */}
      {selectedImageElement && (
        <div className="flex space-x-2 pt-4 border-t border-gray-600">
          <button
            className="flex-1 p-2 bg-blue-600 hover:bg-blue-700 rounded text-sm"
            onClick={() => {
              if (selectedImageElement) {
                const duplicatedElement: Omit<ImageElement, 'id'> = {
                  ...selectedImageElement,
                  x: selectedImageElement.x + 20,
                  y: selectedImageElement.y + 20,
                  isSelected: true
                };
                onImageAdd(duplicatedElement);
              }
            }}
          >
            <Copy className="w-4 h-4 inline mr-1" />
            Duplicate
          </button>
          <button
            className="flex-1 p-2 bg-green-600 hover:bg-green-700 rounded text-sm"
            onClick={() => {
              if (selectedImageElement) {
                const link = document.createElement('a');
                link.href = selectedImageElement.src;
                link.download = `image-${selectedImageElement.id}.png`;
                link.click();
              }
            }}
          >
            <Download className="w-4 h-4 inline mr-1" />
            Export
          </button>
          <button
            className="flex-1 p-2 bg-red-600 hover:bg-red-700 rounded text-sm"
            onClick={() => {
              if (selectedImageElement) {
                onImageDelete(selectedImageElement.id);
              }
            }}
          >
            <Trash2 className="w-4 h-4 inline mr-1" />
            Delete
          </button>
        </div>
      )}
    </div>
  );
});

ImageTool.displayName = 'ImageTool';

export default ImageTool;
