'use client';

import React from 'react';
import { useEditor } from '../contexts/EditorContext';
import { ToolPanel } from './ToolPanel';
import { EnhancedImageTool, ImageStyle } from './EnhancedImageTool';
import { Image as ImageIcon } from 'lucide-react';

export function EnhancedImageToolPanel() {
  const { state, actions } = useEditor();

  const openPanel = () => {
    actions.openToolPanel('enhancedImageTool', { x: 100, y: 100 });
  };

  const getCurrentImageStyle = (): ImageStyle => {
    const selectedShape = state.shapes.find(shape => 
      state.tool.selectedShapeIds.includes(shape.id) && shape.type === 'image'
    );
    
    if (selectedShape) {
      return {
        width: selectedShape.width || 200,
        height: selectedShape.height || 200,
        rotation: selectedShape.rotation || 0,
        scaleX: selectedShape.scaleX || 1,
        scaleY: selectedShape.scaleY || 1,
        opacity: selectedShape.opacity || 1,
        brightness: selectedShape.brightness || 0,
        contrast: selectedShape.contrast || 0,
        saturation: selectedShape.saturation || 0,
        hue: selectedShape.hue || 0,
        blur: selectedShape.blur || 0,
        sharpen: selectedShape.sharpen || 0,
        sepia: selectedShape.sepia || 0,
        grayscale: selectedShape.grayscale || 0,
        invert: selectedShape.invert || 0,
        shadowColor: selectedShape.shadowColor || '#000000',
        shadowBlur: selectedShape.shadowBlur || 0,
        shadowOffsetX: selectedShape.shadowOffsetX || 0,
        shadowOffsetY: selectedShape.shadowOffsetY || 0,
        shadowOpacity: selectedShape.shadowOpacity || 1,
        shadowEnabled: selectedShape.shadowEnabled || false,
        cropX: selectedShape.cropX || 0,
        cropY: selectedShape.cropY || 0,
        cropWidth: selectedShape.cropWidth || 200,
        cropHeight: selectedShape.cropHeight || 200,
        cropEnabled: selectedShape.cropEnabled || false,
      };
    }
    
    return {
      width: 200,
      height: 200,
      rotation: 0,
      scaleX: 1,
      scaleY: 1,
      opacity: 1,
      brightness: 0,
      contrast: 0,
      saturation: 0,
      hue: 0,
      blur: 0,
      sharpen: 0,
      sepia: 0,
      grayscale: 0,
      invert: 0,
      shadowColor: '#000000',
      shadowBlur: 0,
      shadowOffsetX: 0,
      shadowOffsetY: 0,
      shadowOpacity: 1,
      shadowEnabled: false,
      cropX: 0,
      cropY: 0,
      cropWidth: 200,
      cropHeight: 200,
      cropEnabled: false,
    };
  };

  const handleStyleChange = (style: ImageStyle) => {
    // Update all selected image shapes
    state.tool.selectedShapeIds.forEach(shapeId => {
      const shape = state.shapes.find(s => s.id === shapeId);
      if (shape && shape.type === 'image') {
        actions.updateShape(shapeId, {
          width: style.width,
          height: style.height,
          rotation: style.rotation,
          scaleX: style.scaleX,
          scaleY: style.scaleY,
          opacity: style.opacity,
          brightness: style.brightness,
          contrast: style.contrast,
          saturation: style.saturation,
          hue: style.hue,
          blur: style.blur,
          sharpen: style.sharpen,
          sepia: style.sepia,
          grayscale: style.grayscale,
          invert: style.invert,
          shadowColor: style.shadowColor,
          shadowBlur: style.shadowBlur,
          shadowOffsetX: style.shadowOffsetX,
          shadowOffsetY: style.shadowOffsetY,
          shadowOpacity: style.shadowOpacity,
          shadowEnabled: style.shadowEnabled,
          cropX: style.cropX,
          cropY: style.cropY,
          cropWidth: style.cropWidth,
          cropHeight: style.cropHeight,
          cropEnabled: style.cropEnabled,
        });
      }
    });
  };

  const handleImageUpload = (file: File) => {
    // Create a new image shape
    const reader = new FileReader();
    reader.onload = (e) => {
      const imageUrl = e.target?.result as string;
      const imageShape = {
        type: 'image' as const,
        x: Math.random() * 400 + 100,
        y: Math.random() * 300 + 100,
        width: 200,
        height: 200,
        imageUrl: imageUrl,
        fill: '#ffffff',
        stroke: '#000000',
        strokeWidth: 0,
        visible: true,
        locked: false,
        opacity: 1,
        zIndex: 1,
        isSelected: false,
        isDragging: false,
        isResizing: false,
        isRotating: 0,
        rotation: 0,
        scaleX: 1,
        scaleY: 1,
        isCached: false,
        perfectDrawEnabled: true,
        listening: true,
        name: 'Image',
        boundaryState: {
          isWithinBounds: true,
          violationType: null,
        },
      };
      
      actions.addShape(imageShape);
    };
    reader.readAsDataURL(file);
  };

  return (
    <>
      <button
        onClick={openPanel}
        className="w-12 h-12 rounded-lg flex items-center justify-center transition-all text-gray-300 hover:bg-gray-700"
        title="Enhanced Image Tool"
      >
        <ImageIcon className="w-5 h-5" />
      </button>

      {state.toolPanels.enhancedImageTool?.isOpen && (
        <ToolPanel toolId="enhancedImageTool" title="Enhanced Image Tool">
          <EnhancedImageTool
            currentStyle={getCurrentImageStyle()}
            onStyleChange={handleStyleChange}
            onImageUpload={handleImageUpload}
            onClose={() => actions.closeToolPanel('enhancedImageTool')}
          />
        </ToolPanel>
      )}
    </>
  );
}
