'use client';

import React, { useState, useRef, useEffect, useCallback, forwardRef, useImperativeHandle } from 'react';
import { Type, AlignLeft, AlignCenter, AlignRight, AlignJustify, Bold, Italic, Underline, Strikethrough, Palette, Layers, RotateCw, Move, Square, Circle, ArrowUp, ArrowDown, ArrowLeft, ArrowRight, Grid3X3, Eye, EyeOff, Trash2, Copy, Scissors, MousePointer, Settings, Zap, Lock, Unlock } from 'lucide-react';
import AdvancedFontSelector from './AdvancedFontSelector';

// Types
export interface TextElement {
  id: string;
  type: 'text';
  x: number;
  y: number;
  width: number;
  height: number;
  text: string;
  fontSize: number;
  fontFamily: string;
  fill: string;
  fontWeight: number;
  fontStyle: string;
  textDecoration: string;
  letterSpacing: number;
  lineHeight: number;
  align: 'left' | 'center' | 'right' | 'justify';
  verticalAlign: 'top' | 'middle' | 'bottom';
  wrap: 'word' | 'char' | 'none';
  ellipsis: boolean;
  padding: number;
  direction: 'inherit' | 'ltr' | 'rtl';
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
  
  // Advanced text properties
  stroke?: string;
  strokeWidth?: number;
  shadowColor?: string;
  shadowBlur?: number;
  shadowOffset?: { x: number; y: number };
  shadowOpacity?: number;
  
  // Gradient properties
  fillLinearGradientStartPoint?: { x: number; y: number };
  fillLinearGradientEndPoint?: { x: number; y: number };
  fillLinearGradientColorStops?: Array<{ color: string; position: number }>;
  fillRadialGradientStartPoint?: { x: number; y: number };
  fillRadialGradientEndPoint?: { x: number; y: number };
  fillRadialGradientStartRadius?: number;
  fillRadialGradientEndRadius?: number;
  fillRadialGradientColorStops?: Array<{ color: string; position: number }>;
  
  // Performance properties
  isCached: boolean;
  perfectDrawEnabled: boolean;
  listening: boolean;
  name: string;
  locked: boolean;
  isGrouped: boolean;
  
  // State tracking
  wrapState: {
    isWrapped: boolean;
    maxWidth: number;
    originalWidth: number;
  };
  boundaryState: {
    isWithinBounds: boolean;
    violationType: 'x' | 'y' | 'width' | 'height' | null;
  };
}

interface TextToolProps {
  onTextAdd: (textElement: Omit<TextElement, 'id'>) => void;
  onTextUpdate: (id: string, updates: Partial<TextElement>) => void;
  onTextDelete: (id: string) => void;
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
  selectedTextElement?: TextElement;
}

export interface TextToolRef {
  addText: (x: number, y: number) => void;
  updateText: (id: string, updates: Partial<TextElement>) => void;
  deleteText: (id: string) => void;
  duplicateText: (id: string) => void;
  alignText: (id: string, alignment: 'left' | 'center' | 'right' | 'justify') => void;
  applyGradient: (id: string, gradient: any) => void;
  applyShadow: (id: string, shadow: any) => void;
  toggleCache: (id: string) => void;
}

const TextTool = forwardRef<TextToolRef, TextToolProps>(({
  onTextAdd,
  onTextUpdate,
  onTextDelete,
  canvasState,
  selectedTextElement
}, ref) => {
  // Text properties state
  const [textProperties, setTextProperties] = useState<Partial<TextElement>>({
    text: 'Double-click to edit',
    fontSize: 24,
    fontFamily: 'Arial',
    fill: '#000000',
    fontWeight: 400,
    fontStyle: 'normal',
    textDecoration: 'none',
    letterSpacing: 0,
    lineHeight: 1.2,
    align: 'left',
    verticalAlign: 'top',
    wrap: 'word',
    ellipsis: false,
    padding: 0,
    direction: 'inherit',
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
    wrapState: {
      isWrapped: false,
      maxWidth: 200,
      originalWidth: 200
    },
    boundaryState: {
      isWithinBounds: true,
      violationType: null
    }
  });

  // UI state
  const [showGradientEditor, setShowGradientEditor] = useState(false);
  const [showShadowEditor, setShowShadowEditor] = useState(false);
  const [showAdvancedSettings, setShowAdvancedSettings] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  // Font families
  // Font families are now handled by AdvancedFontSelector

  // Font weights
  const fontWeights = [
    { value: 100, label: 'Thin' },
    { value: 200, label: 'Extra Light' },
    { value: 300, label: 'Light' },
    { value: 400, label: 'Normal' },
    { value: 500, label: 'Medium' },
    { value: 600, label: 'Semi Bold' },
    { value: 700, label: 'Bold' },
    { value: 800, label: 'Extra Bold' },
    { value: 900, label: 'Black' }
  ];

  // Expose methods to parent
  useImperativeHandle(ref, () => ({
    addText: (x: number, y: number) => {
      const newTextElement: Omit<TextElement, 'id'> = {
        type: 'text',
        x: x - 100,
        y: y - 25,
        width: 200,
        height: 50,
        ...textProperties,
        isSelected: true,
        isDragging: false,
        isResizing: false,
        isRotating: false
      } as Omit<TextElement, 'id'>;
      
      onTextAdd(newTextElement);
    },
    updateText: (id: string, updates: Partial<TextElement>) => {
      onTextUpdate(id, updates);
    },
    deleteText: (id: string) => {
      onTextDelete(id);
    },
    duplicateText: (id: string) => {
      if (selectedTextElement) {
        const duplicatedElement: Omit<TextElement, 'id'> = {
          ...selectedTextElement,
          x: selectedTextElement.x + 20,
          y: selectedTextElement.y + 20,
          isSelected: true
        };
        onTextAdd(duplicatedElement);
      }
    },
    alignText: (id: string, alignment: 'left' | 'center' | 'right' | 'justify') => {
      onTextUpdate(id, { align: alignment });
    },
    applyGradient: (id: string, gradient: any) => {
      onTextUpdate(id, gradient);
    },
    applyShadow: (id: string, shadow: any) => {
      onTextUpdate(id, shadow);
    },
    toggleCache: (id: string) => {
      if (selectedTextElement) {
        onTextUpdate(id, { isCached: !selectedTextElement.isCached });
      }
    }
  }));

  // Update text properties when selected element changes
  useEffect(() => {
    if (selectedTextElement) {
      setTextProperties(selectedTextElement);
    }
  }, [selectedTextElement]);

  // Handle text content change
  const handleTextChange = useCallback((text: string) => {
    setTextProperties(prev => ({ ...prev, text }));
    if (selectedTextElement) {
      onTextUpdate(selectedTextElement.id, { text });
    }
  }, [selectedTextElement, onTextUpdate]);

  // Handle font family change
  const handleFontFamilyChange = useCallback((fontFamily: string) => {
    setTextProperties(prev => ({ ...prev, fontFamily }));
    if (selectedTextElement) {
      onTextUpdate(selectedTextElement.id, { fontFamily });
    }
  }, [selectedTextElement, onTextUpdate]);

  // Handle font size change
  const handleFontSizeChange = useCallback((fontSize: number) => {
    setTextProperties(prev => ({ ...prev, fontSize }));
    if (selectedTextElement) {
      onTextUpdate(selectedTextElement.id, { fontSize });
    }
  }, [selectedTextElement, onTextUpdate]);

  // Handle font weight change
  const handleFontWeightChange = useCallback((fontWeight: number) => {
    setTextProperties(prev => ({ ...prev, fontWeight: fontWeight }));
    if (selectedTextElement) {
      onTextUpdate(selectedTextElement.id, { fontWeight: fontWeight });
    }
  }, [selectedTextElement, onTextUpdate]);

  // Handle font style change
  const handleFontStyleChange = useCallback((fontStyle: string) => {
    setTextProperties(prev => ({ ...prev, fontStyle }));
    if (selectedTextElement) {
      onTextUpdate(selectedTextElement.id, { fontStyle });
    }
  }, [selectedTextElement, onTextUpdate]);

  // Handle text decoration change
  const handleTextDecorationChange = useCallback((textDecoration: string) => {
    setTextProperties(prev => ({ ...prev, textDecoration }));
    if (selectedTextElement) {
      onTextUpdate(selectedTextElement.id, { textDecoration });
    }
  }, [selectedTextElement, onTextUpdate]);

  // Handle alignment change
  const handleAlignChange = useCallback((align: 'left' | 'center' | 'right' | 'justify') => {
    setTextProperties(prev => ({ ...prev, align }));
    if (selectedTextElement) {
      onTextUpdate(selectedTextElement.id, { align });
    }
  }, [selectedTextElement, onTextUpdate]);

  // Handle vertical alignment change
  const handleVerticalAlignChange = useCallback((verticalAlign: 'top' | 'middle' | 'bottom') => {
    setTextProperties(prev => ({ ...prev, verticalAlign }));
    if (selectedTextElement) {
      onTextUpdate(selectedTextElement.id, { verticalAlign });
    }
  }, [selectedTextElement, onTextUpdate]);

  // Handle wrap change
  const handleWrapChange = useCallback((wrap: 'word' | 'char' | 'none') => {
    setTextProperties(prev => ({ ...prev, wrap }));
    if (selectedTextElement) {
      onTextUpdate(selectedTextElement.id, { wrap });
    }
  }, [selectedTextElement, onTextUpdate]);

  // Handle ellipsis toggle
  const handleEllipsisToggle = useCallback(() => {
    setTextProperties(prev => ({ ...prev, ellipsis: !prev.ellipsis }));
    if (selectedTextElement) {
      onTextUpdate(selectedTextElement.id, { ellipsis: !selectedTextElement.ellipsis });
    }
  }, [selectedTextElement, onTextUpdate]);

  // Handle letter spacing change
  const handleLetterSpacingChange = useCallback((letterSpacing: number) => {
    setTextProperties(prev => ({ ...prev, letterSpacing }));
    if (selectedTextElement) {
      onTextUpdate(selectedTextElement.id, { letterSpacing });
    }
  }, [selectedTextElement, onTextUpdate]);

  // Handle line height change
  const handleLineHeightChange = useCallback((lineHeight: number) => {
    setTextProperties(prev => ({ ...prev, lineHeight }));
    if (selectedTextElement) {
      onTextUpdate(selectedTextElement.id, { lineHeight });
    }
  }, [selectedTextElement, onTextUpdate]);

  // Handle padding change
  const handlePaddingChange = useCallback((padding: number) => {
    setTextProperties(prev => ({ ...prev, padding }));
    if (selectedTextElement) {
      onTextUpdate(selectedTextElement.id, { padding });
    }
  }, [selectedTextElement, onTextUpdate]);

  // Handle fill color change
  const handleFillChange = useCallback((fill: string) => {
    setTextProperties(prev => ({ ...prev, fill }));
    if (selectedTextElement) {
      onTextUpdate(selectedTextElement.id, { fill });
    }
  }, [selectedTextElement, onTextUpdate]);

  // Handle stroke change
  const handleStrokeChange = useCallback((stroke: string, strokeWidth: number) => {
    setTextProperties(prev => ({ ...prev, stroke, strokeWidth }));
    if (selectedTextElement) {
      onTextUpdate(selectedTextElement.id, { stroke, strokeWidth });
    }
  }, [selectedTextElement, onTextUpdate]);

  // Handle opacity change
  const handleOpacityChange = useCallback((opacity: number) => {
    setTextProperties(prev => ({ ...prev, opacity }));
    if (selectedTextElement) {
      onTextUpdate(selectedTextElement.id, { opacity });
    }
  }, [selectedTextElement, onTextUpdate]);

  // Handle rotation change
  const handleRotationChange = useCallback((rotation: number) => {
    setTextProperties(prev => ({ ...prev, rotation }));
    if (selectedTextElement) {
      onTextUpdate(selectedTextElement.id, { rotation });
    }
  }, [selectedTextElement, onTextUpdate]);

  // Handle scale change
  const handleScaleChange = useCallback((scaleX: number, scaleY: number) => {
    setTextProperties(prev => ({ ...prev, scaleX, scaleY }));
    if (selectedTextElement) {
      onTextUpdate(selectedTextElement.id, { scaleX, scaleY });
    }
  }, [selectedTextElement, onTextUpdate]);

  // Handle visibility toggle
  const handleVisibilityToggle = useCallback(() => {
    setTextProperties(prev => ({ ...prev, visible: !prev.visible }));
    if (selectedTextElement) {
      onTextUpdate(selectedTextElement.id, { visible: !selectedTextElement.visible });
    }
  }, [selectedTextElement, onTextUpdate]);

  // Handle cache toggle
  const handleCacheToggle = useCallback(() => {
    setTextProperties(prev => ({ ...prev, isCached: !prev.isCached }));
    if (selectedTextElement) {
      onTextUpdate(selectedTextElement.id, { isCached: !selectedTextElement.isCached });
    }
  }, [selectedTextElement, onTextUpdate]);

  // Handle perfect draw toggle
  const handlePerfectDrawToggle = useCallback(() => {
    setTextProperties(prev => ({ ...prev, perfectDrawEnabled: !prev.perfectDrawEnabled }));
    if (selectedTextElement) {
      onTextUpdate(selectedTextElement.id, { perfectDrawEnabled: !selectedTextElement.perfectDrawEnabled });
    }
  }, [selectedTextElement, onTextUpdate]);

  return (
    <div className="text-tool space-y-4">
      <h3 className="text-lg font-semibold flex items-center">
        <Type className="w-5 h-5 mr-2" />
        Text Tool
      </h3>

      {/* Text Preview */}
      <div className="text-preview bg-gray-600 rounded p-4">
        <div className="text-sm font-medium mb-2">Preview</div>
        <div
          className="w-full h-20 bg-white rounded border border-gray-500 flex items-center justify-center relative overflow-hidden"
          style={{
            fontFamily: textProperties.fontFamily,
            fontSize: `${textProperties.fontSize}px`,
            fontWeight: textProperties.fontWeight,
            fontStyle: textProperties.fontStyle,
            textDecoration: textProperties.textDecoration,
            letterSpacing: `${textProperties.letterSpacing}px`,
            lineHeight: textProperties.lineHeight,
            textAlign: textProperties.align,
            color: textProperties.fill,
            opacity: textProperties.opacity,
            padding: `${textProperties.padding}px`,
            transform: `rotate(${textProperties.rotation}deg) scale(${textProperties.scaleX}, ${textProperties.scaleY})`,
            textShadow: textProperties.shadowColor 
              ? `${textProperties.shadowOffset?.x || 0}px ${textProperties.shadowOffset?.y || 0}px ${textProperties.shadowBlur || 0}px ${textProperties.shadowColor}`
              : 'none'
          }}
        >
          {textProperties.text || 'Preview text'}
        </div>
      </div>

      {/* Text Content */}
      <div>
        <label className="block text-sm font-medium mb-2">Text Content</label>
        <textarea
          value={textProperties.text || ''}
          onChange={(e) => handleTextChange(e.target.value)}
          className="w-full p-2 bg-gray-600 rounded text-sm resize-none"
          rows={3}
          placeholder="Enter text..."
        />
      </div>

      {/* Rich Text Toolbar */}
      <div className="rich-text-toolbar">
        <div className="text-sm font-medium mb-2">Formatting</div>
        <div className="flex flex-wrap gap-1 p-2 bg-gray-600 rounded">
          {/* Bold */}
          <button
            onClick={() => handleFontWeightChange(textProperties.fontWeight === 700 ? 400 : 700)}
            className={`p-2 rounded ${textProperties.fontWeight === 700 ? 'bg-blue-600' : 'bg-gray-500 hover:bg-gray-400'}`}
            title="Bold"
          >
            <Bold className="w-4 h-4" />
          </button>
          
          {/* Italic */}
          <button
            onClick={() => handleFontStyleChange(textProperties.fontStyle === 'italic' ? 'normal' : 'italic')}
            className={`p-2 rounded ${textProperties.fontStyle === 'italic' ? 'bg-blue-600' : 'bg-gray-500 hover:bg-gray-400'}`}
            title="Italic"
          >
            <Italic className="w-4 h-4" />
          </button>
          
          {/* Underline */}
          <button
            onClick={() => handleTextDecorationChange(textProperties.textDecoration === 'underline' ? 'none' : 'underline')}
            className={`p-2 rounded ${textProperties.textDecoration === 'underline' ? 'bg-blue-600' : 'bg-gray-500 hover:bg-gray-400'}`}
            title="Underline"
          >
            <Underline className="w-4 h-4" />
          </button>
          
          {/* Strikethrough */}
          <button
            onClick={() => handleTextDecorationChange(textProperties.textDecoration === 'line-through' ? 'none' : 'line-through')}
            className={`p-2 rounded ${textProperties.textDecoration === 'line-through' ? 'bg-blue-600' : 'bg-gray-500 hover:bg-gray-400'}`}
            title="Strikethrough"
          >
            <Strikethrough className="w-4 h-4" />
          </button>
          
          <div className="w-px h-8 bg-gray-400 mx-1"></div>
          
          {/* Align Left */}
          <button
            onClick={() => handleAlignChange('left')}
            className={`p-2 rounded ${textProperties.align === 'left' ? 'bg-blue-600' : 'bg-gray-500 hover:bg-gray-400'}`}
            title="Align Left"
          >
            <AlignLeft className="w-4 h-4" />
          </button>
          
          {/* Align Center */}
          <button
            onClick={() => handleAlignChange('center')}
            className={`p-2 rounded ${textProperties.align === 'center' ? 'bg-blue-600' : 'bg-gray-500 hover:bg-gray-400'}`}
            title="Align Center"
          >
            <AlignCenter className="w-4 h-4" />
          </button>
          
          {/* Align Right */}
          <button
            onClick={() => handleAlignChange('right')}
            className={`p-2 rounded ${textProperties.align === 'right' ? 'bg-blue-600' : 'bg-gray-500 hover:bg-gray-400'}`}
            title="Align Right"
          >
            <AlignRight className="w-4 h-4" />
          </button>
          
          {/* Justify */}
          <button
            onClick={() => handleAlignChange('justify')}
            className={`p-2 rounded ${textProperties.align === 'justify' ? 'bg-blue-600' : 'bg-gray-500 hover:bg-gray-400'}`}
            title="Justify"
          >
            <AlignJustify className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Advanced Font Selector */}
      <div>
        <AdvancedFontSelector
          selectedShape={selectedTextElement}
          onPropertyChange={(property, value) => {
            setTextProperties(prev => ({ ...prev, [property]: value }));
            if (selectedTextElement) {
              onTextUpdate(selectedTextElement.id, { [property]: value });
            }
          }}
          onBatchPropertyChange={(updates) => {
            setTextProperties(prev => ({ ...prev, ...updates }));
            if (selectedTextElement) {
              onTextUpdate(selectedTextElement.id, updates);
            }
          }}
        />
      </div>

      {/* Font Size and Weight */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium mb-2">Font Size</label>
          <input
            type="number"
            value={textProperties.fontSize || 24}
            onChange={(e) => handleFontSizeChange(parseInt(e.target.value))}
            className="w-full p-2 bg-gray-600 rounded text-sm"
            min="8"
            max="200"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-2">Font Weight</label>
          <select
            value={textProperties.fontWeight || 400}
            onChange={(e) => handleFontWeightChange(parseInt(e.target.value))}
            className="w-full p-2 bg-gray-600 rounded text-sm"
          >
            {fontWeights.map(weight => (
              <option key={weight.value} value={weight.value}>
                {weight.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Font Style and Decoration */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium mb-2">Font Style</label>
          <select
            value={textProperties.fontStyle || 'normal'}
            onChange={(e) => handleFontStyleChange(e.target.value)}
            className="w-full p-2 bg-gray-600 rounded text-sm"
          >
            <option value="normal">Normal</option>
            <option value="italic">Italic</option>
            <option value="bold">Bold</option>
            <option value="italic bold">Bold Italic</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium mb-2">Decoration</label>
          <select
            value={textProperties.textDecoration || 'none'}
            onChange={(e) => handleTextDecorationChange(e.target.value)}
            className="w-full p-2 bg-gray-600 rounded text-sm"
          >
            <option value="none">None</option>
            <option value="underline">Underline</option>
            <option value="line-through">Strikethrough</option>
          </select>
        </div>
      </div>

      {/* Alignment */}
      <div>
        <label className="block text-sm font-medium mb-2">Text Alignment</label>
        <div className="flex space-x-2">
          <button
            className={`p-2 rounded ${textProperties.align === 'left' ? 'bg-blue-600' : 'bg-gray-600'}`}
            onClick={() => handleAlignChange('left')}
            title="Align Left"
          >
            <AlignLeft className="w-4 h-4" />
          </button>
          <button
            className={`p-2 rounded ${textProperties.align === 'center' ? 'bg-blue-600' : 'bg-gray-600'}`}
            onClick={() => handleAlignChange('center')}
            title="Align Center"
          >
            <AlignCenter className="w-4 h-4" />
          </button>
          <button
            className={`p-2 rounded ${textProperties.align === 'right' ? 'bg-blue-600' : 'bg-gray-600'}`}
            onClick={() => handleAlignChange('right')}
            title="Align Right"
          >
            <AlignRight className="w-4 h-4" />
          </button>
          <button
            className={`p-2 rounded ${textProperties.align === 'justify' ? 'bg-blue-600' : 'bg-gray-600'}`}
            onClick={() => handleAlignChange('justify')}
            title="Justify"
          >
            <AlignJustify className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Vertical Alignment */}
      <div>
        <label className="block text-sm font-medium mb-2">Vertical Alignment</label>
        <select
          value={textProperties.verticalAlign || 'top'}
          onChange={(e) => handleVerticalAlignChange(e.target.value as 'top' | 'middle' | 'bottom')}
          className="w-full p-2 bg-gray-600 rounded text-sm"
        >
          <option value="top">Top</option>
          <option value="middle">Middle</option>
          <option value="bottom">Bottom</option>
        </select>
      </div>

      {/* Text Wrapping */}
      <div>
        <label className="block text-sm font-medium mb-2">Text Wrapping</label>
        <select
          value={textProperties.wrap || 'word'}
          onChange={(e) => handleWrapChange(e.target.value as 'word' | 'char' | 'none')}
          className="w-full p-2 bg-gray-600 rounded text-sm"
        >
          <option value="word">Word</option>
          <option value="char">Character</option>
          <option value="none">None</option>
        </select>
      </div>

      {/* Ellipsis */}
      <div className="flex items-center">
        <input
          type="checkbox"
          checked={textProperties.ellipsis || false}
          onChange={handleEllipsisToggle}
          className="mr-2"
        />
        <label className="text-sm">Add ellipsis (...) when text overflows</label>
      </div>

      {/* Spacing Controls */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium mb-2">Letter Spacing</label>
          <input
            type="range"
            min="-5"
            max="20"
            step="0.5"
            value={textProperties.letterSpacing || 0}
            onChange={(e) => handleLetterSpacingChange(parseFloat(e.target.value))}
            className="w-full"
          />
          <span className="text-xs text-gray-400">{textProperties.letterSpacing || 0}px</span>
        </div>
        <div>
          <label className="block text-sm font-medium mb-2">Line Height</label>
          <input
            type="range"
            min="0.5"
            max="3"
            step="0.1"
            value={textProperties.lineHeight || 1.2}
            onChange={(e) => handleLineHeightChange(parseFloat(e.target.value))}
            className="w-full"
          />
          <span className="text-xs text-gray-400">{textProperties.lineHeight || 1.2}</span>
        </div>
      </div>

      {/* Padding */}
      <div>
        <label className="block text-sm font-medium mb-2">Padding</label>
        <input
          type="range"
          min="0"
          max="50"
          step="1"
          value={textProperties.padding || 0}
          onChange={(e) => handlePaddingChange(parseInt(e.target.value))}
          className="w-full"
        />
        <span className="text-xs text-gray-400">{textProperties.padding || 0}px</span>
      </div>

      {/* Color Controls */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium mb-2">Fill Color</label>
          <div className="flex items-center space-x-2">
            <input
              type="color"
              value={textProperties.fill || '#000000'}
              onChange={(e) => handleFillChange(e.target.value)}
              className="w-8 h-8 rounded border border-gray-500"
            />
            <input
              type="text"
              value={textProperties.fill || '#000000'}
              onChange={(e) => handleFillChange(e.target.value)}
              className="flex-1 p-2 bg-gray-600 rounded text-sm"
            />
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium mb-2">Stroke Color</label>
          <div className="flex items-center space-x-2">
            <input
              type="color"
              value={textProperties.stroke || '#000000'}
              onChange={(e) => handleStrokeChange(e.target.value, textProperties.strokeWidth || 1)}
              className="w-8 h-8 rounded border border-gray-500"
            />
            <input
              type="number"
              value={textProperties.strokeWidth || 1}
              onChange={(e) => handleStrokeChange(textProperties.stroke || '#000000', parseInt(e.target.value))}
              className="w-16 p-2 bg-gray-600 rounded text-sm"
              min="0"
              max="20"
            />
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
          value={textProperties.opacity || 1}
          onChange={(e) => handleOpacityChange(parseFloat(e.target.value))}
          className="w-full"
        />
        <span className="text-xs text-gray-400">{Math.round((textProperties.opacity || 1) * 100)}%</span>
      </div>

      {/* Transform Controls */}
      <div>
        <label className="block text-sm font-medium mb-2">Rotation</label>
        <input
          type="range"
          min="0"
          max="360"
          step="1"
          value={textProperties.rotation || 0}
          onChange={(e) => handleRotationChange(parseInt(e.target.value))}
          className="w-full"
        />
        <span className="text-xs text-gray-400">{textProperties.rotation || 0}°</span>
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
            value={textProperties.scaleX || 1}
            onChange={(e) => handleScaleChange(parseFloat(e.target.value), textProperties.scaleY || 1)}
            className="w-full"
          />
          <span className="text-xs text-gray-400">{textProperties.scaleX || 1}</span>
        </div>
        <div>
          <label className="block text-sm font-medium mb-2">Scale Y</label>
          <input
            type="range"
            min="0.1"
            max="3"
            step="0.1"
            value={textProperties.scaleY || 1}
            onChange={(e) => handleScaleChange(textProperties.scaleX || 1, parseFloat(e.target.value))}
            className="w-full"
          />
          <span className="text-xs text-gray-400">{textProperties.scaleY || 1}</span>
        </div>
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
                checked={textProperties.isCached || false}
                onChange={handleCacheToggle}
                className="mr-2"
              />
              <label className="text-sm">Enable Caching</label>
            </div>
            <div className="flex items-center">
              <input
                type="checkbox"
                checked={textProperties.perfectDrawEnabled || true}
                onChange={handlePerfectDrawToggle}
                className="mr-2"
              />
              <label className="text-sm">Perfect Draw</label>
            </div>
          </div>

          {/* Direction */}
          <div>
            <label className="block text-sm font-medium mb-2">Text Direction</label>
            <select
              value={textProperties.direction || 'inherit'}
              onChange={(e) => setTextProperties(prev => ({ ...prev, direction: e.target.value as 'inherit' | 'ltr' | 'rtl' }))}
              className="w-full p-2 bg-gray-600 rounded text-sm"
            >
              <option value="inherit">Inherit</option>
              <option value="ltr">Left to Right</option>
              <option value="rtl">Right to Left</option>
            </select>
          </div>

          {/* Visibility Toggle */}
          <div className="flex items-center">
            <input
              type="checkbox"
              checked={textProperties.visible || true}
              onChange={handleVisibilityToggle}
              className="mr-2"
            />
            <label className="text-sm">Visible</label>
          </div>
        </div>
      )}

      {/* Action Buttons */}
      {selectedTextElement && (
        <div className="flex space-x-2 pt-4 border-t border-gray-600">
          <button
            className="flex-1 p-2 bg-blue-600 hover:bg-blue-700 rounded text-sm"
            onClick={() => {
              if (selectedTextElement) {
                const duplicatedElement: Omit<TextElement, 'id'> = {
                  ...selectedTextElement,
                  x: selectedTextElement.x + 20,
                  y: selectedTextElement.y + 20,
                  isSelected: true
                };
                onTextAdd(duplicatedElement);
              }
            }}
          >
            <Copy className="w-4 h-4 inline mr-1" />
            Duplicate
          </button>
          <button
            className="flex-1 p-2 bg-red-600 hover:bg-red-700 rounded text-sm"
            onClick={() => {
              if (selectedTextElement) {
                onTextDelete(selectedTextElement.id);
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

TextTool.displayName = 'TextTool';

export default TextTool;