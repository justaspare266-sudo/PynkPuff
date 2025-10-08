'use client';

import React, { useState, useRef, useEffect, useCallback, forwardRef, useImperativeHandle } from 'react';
import { Crop, Square, Circle, RotateCw, RotateCcw, Move, ZoomIn, ZoomOut, Undo2, Redo2, Check, X } from 'lucide-react';
import { ImageElement, CanvasState } from '../AdvancedImageEditor';

interface CropToolProps {
  onCrop: (elementId: string, cropData: { x: number; y: number; width: number; height: number }) => void;
  selectedElementIds: string[];
  elements: any[];
  canvasState: CanvasState;
}

export interface CropToolRef {
  startCrop: (elementId: string) => void;
  cancelCrop: () => void;
  applyCrop: () => void;
}

const CropTool = forwardRef<CropToolRef, CropToolProps>(({
  onCrop,
  selectedElementIds,
  elements,
  canvasState
}, ref) => {
  // Crop state
  const [cropState, setCropState] = useState({
    isActive: false,
    elementId: null as string | null,
    cropData: {
      x: 0,
      y: 0,
      width: 100,
      height: 100
    },
    aspectRatio: null as number | null,
    lockAspectRatio: false,
    cropShape: 'rect' as 'rect' | 'circle' | 'ellipse',
    rotation: 0,
    zoom: 1,
    panX: 0,
    panY: 0,
    feather: 0 as number
  });

  // Crop handles state
  const [cropHandles, setCropHandles] = useState({
    isDragging: false,
    activeHandle: null as string | null,
    startX: 0,
    startY: 0,
    startCropData: { x: 0, y: 0, width: 0, height: 0 }
  });

  // Refs
  const cropCanvasRef = useRef<HTMLCanvasElement>(null);
  const cropContainerRef = useRef<HTMLDivElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);

  // Expose methods to parent
  useImperativeHandle(ref, () => ({
    startCrop: (elementId: string) => {
      const element = elements.find(el => el.id === elementId);
      if (element && element.type === 'image') {
        setCropState(prev => ({
          ...prev,
          isActive: true,
          elementId,
          cropData: element.cropData || {
            x: 0,
            y: 0,
            width: element.width,
            height: element.height
          },
          rotation: element.rotation || 0,
          zoom: 1,
          panX: 0,
          panY: 0,
          feather: 0
        }));
      }
    },
    cancelCrop: () => {
      setCropState(prev => ({
        ...prev,
        isActive: false,
        elementId: null
      }));
    },
    applyCrop: () => {
      if (cropState.elementId) {
        onCrop(cropState.elementId, cropState.cropData);
        setCropState(prev => ({
          ...prev,
          isActive: false,
          elementId: null
        }));
      }
    }
  }));

  // Get selected image element
  const selectedImageElement = elements.find(el => 
    el.type === 'image' && selectedElementIds.includes(el.id)
  );

  // Aspect ratio presets
  const aspectRatioPresets = [
    { label: 'Free', value: null },
    { label: '1:1', value: 1 },
    { label: '4:3', value: 4/3 },
    { label: '3:2', value: 3/2 },
    { label: '16:9', value: 16/9 },
    { label: '21:9', value: 21/9 },
    { label: '2:3', value: 2/3 },
    { label: '3:4', value: 3/4 },
    { label: '9:16', value: 9/16 }
  ];

  // Handle crop data changes
  const handleCropDataChange = useCallback((newCropData: { x: number; y: number; width: number; height: number }) => {
    setCropState(prev => ({
      ...prev,
      cropData: {
        x: Math.max(0, Math.min(newCropData.x, canvasState.width - newCropData.width)),
        y: Math.max(0, Math.min(newCropData.y, canvasState.height - newCropData.height)),
        width: Math.max(10, Math.min(newCropData.width, canvasState.width - newCropData.x)),
        height: Math.max(10, Math.min(newCropData.height, canvasState.height - newCropData.y))
      }
    }));
  }, [canvasState.width, canvasState.height]);

  // Handle aspect ratio change
  const handleAspectRatioChange = useCallback((aspectRatio: number | null) => {
    if (aspectRatio === null) {
      setCropState(prev => ({ ...prev, aspectRatio: null, lockAspectRatio: false }));
      return;
    }
    // Fit to selected image if available; otherwise fit to canvas
    const bounds = selectedImageElement
      ? { w: selectedImageElement.width, h: selectedImageElement.height }
      : { w: canvasState.width, h: canvasState.height };
    let w = bounds.w;
    let h = w / aspectRatio;
    if (h > bounds.h) {
      h = bounds.h;
      w = h * aspectRatio;
    }
    const x = Math.max(0, (bounds.w - w) / 2);
    const y = Math.max(0, (bounds.h - h) / 2);
    setCropState(prev => ({
      ...prev,
      aspectRatio,
      lockAspectRatio: true,
      cropData: { x, y, width: w, height: h }
    }));
  }, [canvasState.width, canvasState.height, selectedImageElement]);

  // Fit a given aspect ratio inside the selected image bounds and center it
  const applyAspectPresetFit = useCallback((aspect: number) => {
    if (!selectedImageElement) return;
    const imgW = selectedImageElement.width;
    const imgH = selectedImageElement.height;
    // Fit inside image with given aspect
    let width = imgW;
    let height = width / aspect;
    if (height > imgH) {
      height = imgH;
      width = height * aspect;
    }
    const x = Math.max(0, (imgW - width) / 2);
    const y = Math.max(0, (imgH - height) / 2);
    setCropState(prev => ({
      ...prev,
      aspectRatio: aspect,
      lockAspectRatio: true,
      cropData: { x, y, width, height }
    }));
  }, [selectedImageElement]);

  // Handle crop shape change
  const handleCropShapeChange = useCallback((shape: 'rect' | 'circle' | 'ellipse') => {
    setCropState(prev => ({ ...prev, cropShape: shape }));
  }, []);

  // Handle rotation change
  const handleRotationChange = useCallback((rotation: number) => {
    setCropState(prev => ({ ...prev, rotation }));
  }, []);

  // Handle zoom change
  const handleZoomChange = useCallback((zoom: number) => {
    setCropState(prev => ({ ...prev, zoom: Math.max(0.1, Math.min(5, zoom)) }));
  }, []);

  // Handle pan change
  const handlePanChange = useCallback((panX: number, panY: number) => {
    setCropState(prev => ({ ...prev, panX, panY }));
  }, []);

  // Handle crop handle drag start
  const handleCropHandleMouseDown = useCallback((e: React.MouseEvent, handle: string) => {
    e.preventDefault();
    e.stopPropagation();
    
    setCropHandles({
      isDragging: true,
      activeHandle: handle,
      startX: e.clientX,
      startY: e.clientY,
      startCropData: { ...cropState.cropData }
    });
  }, [cropState.cropData]);

  // Handle crop handle drag move
  const handleCropHandleMouseMove = useCallback((e: MouseEvent) => {
    if (!cropHandles.isDragging || !cropHandles.activeHandle) return;

    const deltaX = e.clientX - cropHandles.startX;
    const deltaY = e.clientY - cropHandles.startY;
    
    let newCropData = { ...cropHandles.startCropData };

    switch (cropHandles.activeHandle) {
      case 'nw':
        newCropData.x += deltaX;
        newCropData.y += deltaY;
        newCropData.width -= deltaX;
        newCropData.height -= deltaY;
        break;
      case 'ne':
        newCropData.y += deltaY;
        newCropData.width += deltaX;
        newCropData.height -= deltaY;
        break;
      case 'sw':
        newCropData.x += deltaX;
        newCropData.width -= deltaX;
        newCropData.height += deltaY;
        break;
      case 'se':
        newCropData.width += deltaX;
        newCropData.height += deltaY;
        break;
      case 'n':
        newCropData.y += deltaY;
        newCropData.height -= deltaY;
        break;
      case 's':
        newCropData.height += deltaY;
        break;
      case 'w':
        newCropData.x += deltaX;
        newCropData.width -= deltaX;
        break;
      case 'e':
        newCropData.width += deltaX;
        break;
      case 'move':
        newCropData.x += deltaX;
        newCropData.y += deltaY;
        break;
    }

    // Apply aspect ratio constraint
    if (cropState.lockAspectRatio && cropState.aspectRatio) {
      const aspectRatio = cropState.aspectRatio;
      if (['nw', 'ne', 'sw', 'se'].includes(cropHandles.activeHandle)) {
        newCropData.height = newCropData.width / aspectRatio;
      } else if (['n', 's'].includes(cropHandles.activeHandle)) {
        newCropData.width = newCropData.height * aspectRatio;
      } else if (['w', 'e'].includes(cropHandles.activeHandle)) {
        newCropData.height = newCropData.width / aspectRatio;
      }
    }

    handleCropDataChange(newCropData);
  }, [cropHandles, cropState.lockAspectRatio, cropState.aspectRatio, handleCropDataChange]);

  // Handle crop handle drag end
  const handleCropHandleMouseUp = useCallback(() => {
    setCropHandles({
      isDragging: false,
      activeHandle: null,
      startX: 0,
      startY: 0,
      startCropData: { x: 0, y: 0, width: 0, height: 0 }
    });
  }, []);

  // Set up mouse event listeners
  useEffect(() => {
    if (cropHandles.isDragging) {
      document.addEventListener('mousemove', handleCropHandleMouseMove);
      document.addEventListener('mouseup', handleCropHandleMouseUp);
      
      return () => {
        document.removeEventListener('mousemove', handleCropHandleMouseMove);
        document.removeEventListener('mouseup', handleCropHandleMouseUp);
      };
    }
  }, [cropHandles.isDragging, handleCropHandleMouseMove, handleCropHandleMouseUp]);

  // Keyboard nudge for crop area (Arrow=1px, Shift=10px)
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      const delta = e.shiftKey ? 10 : 1;
      switch (e.key) {
        case 'ArrowLeft':
          e.preventDefault();
          handleCropDataChange({ ...cropState.cropData, x: cropState.cropData.x - delta });
          break;
        case 'ArrowRight':
          e.preventDefault();
          handleCropDataChange({ ...cropState.cropData, x: cropState.cropData.x + delta });
          break;
        case 'ArrowUp':
          e.preventDefault();
          handleCropDataChange({ ...cropState.cropData, y: cropState.cropData.y - delta });
          break;
        case 'ArrowDown':
          e.preventDefault();
          handleCropDataChange({ ...cropState.cropData, y: cropState.cropData.y + delta });
          break;
      }
    };
    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, [cropState.cropData, handleCropDataChange]);

  // Handle crop area input changes
  const handleCropAreaInputChange = useCallback((field: string, value: number) => {
    const newCropData = { ...cropState.cropData, [field]: value };
    handleCropDataChange(newCropData);
  }, [cropState.cropData, handleCropDataChange]);

  // Handle crop reset
  const handleCropReset = useCallback(() => {
    if (selectedImageElement) {
      setCropState(prev => ({
        ...prev,
        cropData: {
          x: 0,
          y: 0,
          width: selectedImageElement.width,
          height: selectedImageElement.height
        },
        rotation: 0,
        zoom: 1,
        panX: 0,
        panY: 0,
        feather: 0
      }));
    }
  }, [selectedImageElement]);

  // Handle crop flip
  const handleCropFlip = useCallback((direction: 'horizontal' | 'vertical') => {
    setCropState(prev => ({
      ...prev,
      cropData: {
        ...prev.cropData,
        x: direction === 'horizontal' ? canvasState.width - prev.cropData.x - prev.cropData.width : prev.cropData.x,
        y: direction === 'vertical' ? canvasState.height - prev.cropData.y - prev.cropData.height : prev.cropData.y
      }
    }));
  }, [canvasState.width, canvasState.height]);

  if (!selectedImageElement) {
    return (
      <div className="crop-tool space-y-4">
        <h3 className="text-lg font-semibold flex items-center">
          <Crop className="w-5 h-5 mr-2" />
          Crop Tool
        </h3>
        <div className="p-4 bg-gray-600 rounded text-center">
          <p className="text-sm text-gray-300">Select an image to crop</p>
        </div>
      </div>
    );
  }

  return (
    <div className="crop-tool space-y-4">
      <h3 className="text-lg font-semibold flex items-center">
        <Crop className="w-5 h-5 mr-2" />
        Crop Tool
      </h3>

      {/* Crop Preview */}
      <div className="crop-preview bg-gray-600 rounded p-4">
        <div className="text-sm font-medium mb-2">Crop Preview</div>
        <div 
          ref={cropContainerRef}
          className="relative bg-gray-700 rounded overflow-hidden"
          style={{ 
            width: '100%', 
            height: '200px',
            backgroundImage: `url(${selectedImageElement.src})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center'
          }}
        >
          {/* Crop overlay */}
          <div
            className="absolute border-2 border-blue-500 bg-blue-500 bg-opacity-20"
            style={{
              left: `${(cropState.cropData.x / canvasState.width) * 100}%`,
              top: `${(cropState.cropData.y / canvasState.height) * 100}%`,
              width: `${(cropState.cropData.width / canvasState.width) * 100}%`,
              height: `${(cropState.cropData.height / canvasState.height) * 100}%`,
              backdropFilter: ((cropState as any).feather || 0) > 0 ? `blur(${(cropState as any).feather / 5}px)` : undefined,
              clipPath: cropState.cropShape === 'circle'
                ? 'ellipse(50% 50% at 50% 50%)'
                : cropState.cropShape === 'ellipse'
                ? 'ellipse(50% 40% at 50% 50%)'
                : 'none'
            }}
          >
            {/* Crop handles */}
            {['nw', 'ne', 'sw', 'se', 'n', 's', 'w', 'e'].map(handle => (
              <div
                key={handle}
                className={`absolute w-3 h-3 bg-blue-500 border border-white cursor-${handle}-resize`}
                style={{
                  [handle.includes('n') ? 'top' : 'bottom']: '-6px',
                  [handle.includes('w') ? 'left' : 'right']: '-6px',
                  transform: handle.includes('n') && handle.includes('w') ? 'translate(-50%, -50%)' :
                            handle.includes('n') && handle.includes('e') ? 'translate(50%, -50%)' :
                            handle.includes('s') && handle.includes('w') ? 'translate(-50%, 50%)' :
                            handle.includes('s') && handle.includes('e') ? 'translate(50%, 50%)' :
                            handle.includes('n') ? 'translate(-50%, -50%)' :
                            handle.includes('s') ? 'translate(-50%, 50%)' :
                            handle.includes('w') ? 'translate(-50%, -50%)' :
                            'translate(50%, -50%)'
                }}
                onMouseDown={(e) => handleCropHandleMouseDown(e, handle)}
              />
            ))}
            
            {/* Move handle */}
            <div
              className="absolute inset-0 cursor-move"
              onMouseDown={(e) => handleCropHandleMouseDown(e, 'move')}
            />
          </div>
        </div>
      </div>

      {/* Crop Shape */}
      <div>
        <label className="block text-sm font-medium mb-2">Crop Shape</label>
        <div className="flex space-x-2">
          <button className={`p-2 rounded ${cropState.cropShape === 'rect' ? 'bg-blue-600' : 'bg-gray-600'}`} onClick={() => handleCropShapeChange('rect')} title="Rectangle"><Square className="w-4 h-4" /></button>
          <button className={`p-2 rounded ${cropState.cropShape === 'circle' ? 'bg-blue-600' : 'bg-gray-600'}`} onClick={() => handleCropShapeChange('circle')} title="Circle"><Circle className="w-4 h-4" /></button>
          <button className={`p-2 rounded ${cropState.cropShape === 'ellipse' ? 'bg-blue-600' : 'bg-gray-600'}`} onClick={() => handleCropShapeChange('ellipse')} title="Ellipse"><Circle className="w-4 h-4" /></button>
        </div>
      </div>

      {/* Feather Edge (preview only) */}
      <div>
        <label className="block text-sm font-medium mb-2">Feather Edge</label>
        <input
          type="range"
          min={0}
          max={50}
          value={(cropState as any).feather || 0}
          onChange={(e) => setCropState(prev => ({ ...prev, feather: parseInt(e.target.value) }))}
          className="w-full"
        />
      </div>

      {/* Aspect Ratio */}
      <div>
        <label className="block text-sm font-medium mb-2">Aspect Ratio</label>
        <select
          value={cropState.aspectRatio || ''}
          onChange={(e) => handleAspectRatioChange(e.target.value ? parseFloat(e.target.value) : null)}
          className="w-full p-2 bg-gray-600 rounded text-sm"
        >
          {aspectRatioPresets.map(preset => (
            <option key={preset.label} value={preset.value || ''}>
              {preset.label}
            </option>
          ))}
        </select>
        {/* Quick Presets */}
        <div className="flex items-center gap-2 mt-2">
          <button
            className={`px-2 py-1 rounded ${cropState.aspectRatio === 1 ? 'bg-blue-600' : 'bg-gray-600'} text-xs`}
            onClick={() => applyAspectPresetFit(1)}
            title="Square 1:1"
          >
            1:1
          </button>
          <button
            className={`px-2 py-1 rounded ${cropState.aspectRatio === 9/16 ? 'bg-blue-600' : 'bg-gray-600'} text-xs`}
            onClick={() => applyAspectPresetFit(9/16)}
            title="Portrait 9:16"
          >
            9:16
          </button>
          <button
            className={`px-2 py-1 rounded ${cropState.aspectRatio === 16/9 ? 'bg-blue-600' : 'bg-gray-600'} text-xs`}
            onClick={() => applyAspectPresetFit(16/9)}
            title="Landscape 16:9"
          >
            16:9
          </button>
        </div>
      </div>

      {/* Crop Area */}
      <div>
        <label className="block text-sm font-medium mb-2">Crop Area</label>
        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className="block text-xs text-gray-300">X</label>
            <input
              type="number"
              value={Math.round(cropState.cropData.x)}
              onChange={(e) => handleCropAreaInputChange('x', parseInt(e.target.value))}
              className="w-full p-2 bg-gray-600 rounded text-sm"
              min="0"
              max={canvasState.width - cropState.cropData.width}
            />
          </div>
          <div>
            <label className="block text-xs text-gray-300">Y</label>
            <input
              type="number"
              value={Math.round(cropState.cropData.y)}
              onChange={(e) => handleCropAreaInputChange('y', parseInt(e.target.value))}
              className="w-full p-2 bg-gray-600 rounded text-sm"
              min="0"
              max={canvasState.height - cropState.cropData.height}
            />
          </div>
          <div>
            <label className="block text-xs text-gray-300">Width</label>
            <input
              type="number"
              value={Math.round(cropState.cropData.width)}
              onChange={(e) => handleCropAreaInputChange('width', parseInt(e.target.value))}
              className="w-full p-2 bg-gray-600 rounded text-sm"
              min="10"
              max={canvasState.width - cropState.cropData.x}
            />
          </div>
          <div>
            <label className="block text-xs text-gray-300">Height</label>
            <input
              type="number"
              value={Math.round(cropState.cropData.height)}
              onChange={(e) => handleCropAreaInputChange('height', parseInt(e.target.value))}
              className="w-full p-2 bg-gray-600 rounded text-sm"
              min="10"
              max={canvasState.height - cropState.cropData.y}
            />
          </div>
        </div>
      </div>

      {/* Rotation */}
      <div>
        <label className="block text-sm font-medium mb-2">Rotation</label>
        <div className="flex items-center space-x-2">
          <input
            type="range"
            min="0"
            max="360"
            value={cropState.rotation}
            onChange={(e) => handleRotationChange(parseInt(e.target.value))}
            className="flex-1"
          />
          <input
            type="number"
            value={cropState.rotation}
            onChange={(e) => handleRotationChange(parseInt(e.target.value))}
            className="w-16 p-1 bg-gray-600 rounded text-sm text-center"
            min="0"
            max="360"
          />
          <span className="text-xs text-gray-400">°</span>
        </div>
      </div>

      {/* Zoom */}
      <div>
        <label className="block text-sm font-medium mb-2">Zoom</label>
        <div className="flex items-center space-x-2">
          <button
            className="p-2 bg-gray-600 hover:bg-gray-500 rounded"
            onClick={() => handleZoomChange(cropState.zoom - 0.1)}
            title="Zoom Out"
          >
            <ZoomOut className="w-4 h-4" />
          </button>
          <input
            type="range"
            min="0.1"
            max="5"
            step="0.1"
            value={cropState.zoom}
            onChange={(e) => handleZoomChange(parseFloat(e.target.value))}
            className="flex-1"
          />
          <button
            className="p-2 bg-gray-600 hover:bg-gray-500 rounded"
            onClick={() => handleZoomChange(cropState.zoom + 0.1)}
            title="Zoom In"
          >
            <ZoomIn className="w-4 h-4" />
          </button>
          <span className="text-xs text-gray-400 w-12 text-center">
            {Math.round(cropState.zoom * 100)}%
          </span>
        </div>
      </div>

      {/* Actions */}
      <div className="flex space-x-2">
        <button
          className="flex-1 p-2 bg-gray-600 hover:bg-gray-500 rounded text-sm flex items-center justify-center"
          onClick={handleCropReset}
          title="Reset Crop"
        >
          <Undo2 className="w-4 h-4 mr-1" />
          Reset
        </button>
        <button
          className="flex-1 p-2 bg-gray-600 hover:bg-gray-500 rounded text-sm flex items-center justify-center"
          onClick={() => handleCropFlip('horizontal')}
          title="Flip Horizontal"
        >
          <RotateCcw className="w-4 h-4 mr-1" />
          Flip H
        </button>
        <button
          className="flex-1 p-2 bg-gray-600 hover:bg-gray-500 rounded text-sm flex items-center justify-center"
          onClick={() => handleCropFlip('vertical')}
          title="Flip Vertical"
        >
          <RotateCw className="w-4 h-4 mr-1" />
          Flip V
        </button>
      </div>

      {/* Apply/Cancel */}
      <div className="flex space-x-2">
        <button
          className="flex-1 p-2 bg-red-600 hover:bg-red-500 rounded text-sm flex items-center justify-center"
          onClick={() => setCropState(prev => ({ ...prev, isActive: false, elementId: null }))}
        >
          <X className="w-4 h-4 mr-1" />
          Cancel
        </button>
        <button
          className="flex-1 p-2 bg-green-600 hover:bg-green-500 rounded text-sm flex items-center justify-center"
          onClick={() => {
            if (cropState.elementId) {
              onCrop(cropState.elementId, cropState.cropData);
              setCropState(prev => ({ ...prev, isActive: false, elementId: null }));
            }
          }}
        >
          <Check className="w-4 h-4 mr-1" />
          Apply Crop
        </button>
      </div>

      {/* Instructions */}
      <div className="mt-6 p-3 bg-gray-600 rounded text-xs">
        <h4 className="font-semibold mb-2">Instructions:</h4>
        <ul className="space-y-1 text-gray-300">
          <li>• Drag handles to resize crop area</li>
          <li>• Drag center to move crop area</li>
          <li>• Use aspect ratio to maintain proportions</li>
          <li>• Adjust rotation and zoom as needed</li>
          <li>• Click Apply to confirm crop</li>
        </ul>
      </div>
    </div>
  );
});

CropTool.displayName = 'CropTool';

export default CropTool;
