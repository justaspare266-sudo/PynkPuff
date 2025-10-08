'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { 
  Settings, 
  Palette, 
  Type, 
  Square, 
  Image, 
  Layers, 
  RotateCw, 
  Move, 
  Eye, 
  EyeOff, 
  Lock, 
  Unlock,
  Copy,
  Trash2,
  AlignLeft,
  AlignCenter,
  AlignRight,
  AlignJustify,
  Bold,
  Italic,
  Underline,
  Strikethrough,
  Minus,
  Plus,
  ChevronDown,
  ChevronRight
} from 'lucide-react';

// Import types from existing files
import { TextElement } from '../src/tools/TextTool';
import { ShapeElement } from '../src/tools/ShapeTool';
import { ImageElement } from '../src/tools/ImageTool';

export type CanvasElement = TextElement | ShapeElement | ImageElement;

export interface PropertiesPanelProps {
  selectedElements: CanvasElement[];
  onElementUpdate: (elementId: string, updates: Partial<CanvasElement>) => void;
  onElementDelete: (elementId: string) => void;
  onElementDuplicate: (elementId: string) => void;
  onElementGroup: (elementIds: string[]) => void;
  onElementUngroup: (groupId: string) => void;
  onElementBringToFront: (elementId: string) => void;
  onElementSendToBack: (elementId: string) => void;
  onElementBringForward: (elementId: string) => void;
  onElementSendBackward: (elementId: string) => void;
  onElementFlipHorizontal: (elementId: string) => void;
  onElementFlipVertical: (elementId: string) => void;
  onElementAlign: (alignment: 'left' | 'center' | 'right' | 'top' | 'middle' | 'bottom') => void;
  onElementDistribute: (direction: 'horizontal' | 'vertical') => void;
  className?: string;
}

interface PropertySection {
  id: string;
  title: string;
  icon: React.ComponentType<any>;
  isExpanded: boolean;
}

const PropertiesPanel: React.FC<PropertiesPanelProps> = ({
  selectedElements,
  onElementUpdate,
  onElementDelete,
  onElementDuplicate,
  onElementGroup,
  onElementUngroup,
  onElementBringToFront,
  onElementSendToBack,
  onElementBringForward,
  onElementSendBackward,
  onElementFlipHorizontal,
  onElementFlipVertical,
  onElementAlign,
  onElementDistribute,
  className = ''
}) => {
  const [sections, setSections] = useState<PropertySection[]>([
    { id: 'transform', title: 'Transform', icon: Move, isExpanded: true },
    { id: 'appearance', title: 'Appearance', icon: Palette, isExpanded: true },
    { id: 'text', title: 'Text', icon: Type, isExpanded: false },
    { id: 'shape', title: 'Shape', icon: Square, isExpanded: false },
    { id: 'image', title: 'Image', icon: Image, isExpanded: false },
    { id: 'effects', title: 'Effects', icon: Settings, isExpanded: false },
    { id: 'layers', title: 'Layers', icon: Layers, isExpanded: false }
  ]);

  const [localValues, setLocalValues] = useState<Record<string, any>>({});

  // Update local values when selected elements change
  useEffect(() => {
    if (selectedElements.length === 1) {
      const element = selectedElements[0];
      setLocalValues({
        x: element.x,
        y: element.y,
        width: element.width,
        height: element.height,
        rotation: element.rotation,
        scaleX: element.scaleX,
        scaleY: element.scaleY,
        opacity: element.opacity,
        visible: element.visible,
        locked: element.locked,
        // Text specific
        text: (element as TextElement).text || '',
        fontSize: (element as TextElement).fontSize || 16,
        fontFamily: (element as TextElement).fontFamily || 'Arial',
        fontWeight: (element as TextElement).fontWeight || 400,
        fontStyle: (element as TextElement).fontStyle || 'normal',
        textDecoration: (element as TextElement).textDecoration || 'none',
        textAlign: (element as TextElement).align || 'left',
        verticalAlign: (element as TextElement).verticalAlign || 'top',
        letterSpacing: (element as TextElement).letterSpacing || 0,
        lineHeight: (element as TextElement).lineHeight || 1.5,
        // Shape specific
        fill: (element as ShapeElement).fill || '#000000',
        stroke: (element as ShapeElement).stroke || '#000000',
        strokeWidth: (element as ShapeElement).strokeWidth || 0,
        cornerRadius: (element as ShapeElement).cornerRadius || 0,
        radius: (element as ShapeElement).radius || 50,
        // Image specific
        src: (element as ImageElement).src || '',
        // Common properties
        name: element.name || '',
        zIndex: element.zIndex || 1
      });
    } else {
      setLocalValues({});
    }
  }, [selectedElements]);

  const toggleSection = useCallback((sectionId: string) => {
    setSections(prev => prev.map(section => 
      section.id === sectionId 
        ? { ...section, isExpanded: !section.isExpanded }
        : section
    ));
  }, []);

  const updateElementProperty = useCallback((property: string, value: any) => {
    setLocalValues(prev => ({ ...prev, [property]: value }));
    
    // Update all selected elements
    selectedElements.forEach(element => {
      onElementUpdate(element.id, { [property]: value });
    });
  }, [selectedElements, onElementUpdate]);

  const updateElementPropertyWithId = useCallback((elementId: string, property: string, value: any) => {
    setLocalValues(prev => ({ ...prev, [property]: value }));
    onElementUpdate(elementId, { [property]: value });
  }, [onElementUpdate]);

  const getCommonProperties = () => {
    if (selectedElements.length === 0) return null;
    if (selectedElements.length === 1) return selectedElements[0];
    
    // For multiple selections, return common properties
    const first = selectedElements[0];
    const common = { ...first };
    
    // Check if all elements have the same value for each property
    selectedElements.forEach(element => {
      Object.keys(common).forEach(key => {
        if (common[key as keyof CanvasElement] !== element[key as keyof CanvasElement]) {
          (common as any)[key] = 'Mixed';
        }
      });
    });
    
    return common;
  };

  const renderPropertyInput = (
    label: string,
    property: string,
    type: 'text' | 'number' | 'range' | 'color' | 'select' | 'checkbox',
    options?: { min?: number; max?: number; step?: number; options?: Array<{ value: any; label: string }> }
  ) => {
    const value = localValues[property];
    const isMixed = value === 'Mixed';
    
    return (
      <div className="mb-3">
        <label className="block text-sm font-medium text-gray-300 mb-1">
          {label}
        </label>
        {type === 'text' && (
          <input
            type="text"
            value={isMixed ? '' : value || ''}
            onChange={(e) => updateElementProperty(property, e.target.value)}
            className="w-full p-2 bg-gray-600 border border-gray-500 rounded text-sm text-white"
            placeholder={isMixed ? 'Mixed values' : ''}
          />
        )}
        {type === 'number' && (
          <input
            type="number"
            value={isMixed ? '' : value || 0}
            onChange={(e) => updateElementProperty(property, parseFloat(e.target.value) || 0)}
            className="w-full p-2 bg-gray-600 border border-gray-500 rounded text-sm text-white"
            min={options?.min}
            max={options?.max}
            step={options?.step}
          />
        )}
        {type === 'range' && (
          <div className="flex items-center space-x-2">
            <input
              type="range"
              value={isMixed ? 0 : value || 0}
              onChange={(e) => updateElementProperty(property, parseFloat(e.target.value))}
              className="flex-1"
              min={options?.min}
              max={options?.max}
              step={options?.step}
            />
            <span className="text-xs text-gray-400 w-12">
              {isMixed ? 'Mixed' : Math.round(value || 0)}
            </span>
          </div>
        )}
        {type === 'color' && (
          <div className="flex items-center space-x-2">
            <input
              type="color"
              value={isMixed ? '#000000' : value || '#000000'}
              onChange={(e) => updateElementProperty(property, e.target.value)}
              className="w-8 h-8 rounded border border-gray-500"
            />
            <input
              type="text"
              value={isMixed ? 'Mixed' : value || '#000000'}
              onChange={(e) => updateElementProperty(property, e.target.value)}
              className="flex-1 p-2 bg-gray-600 border border-gray-500 rounded text-sm text-white"
            />
          </div>
        )}
        {type === 'select' && (
          <select
            value={isMixed ? '' : value || ''}
            onChange={(e) => updateElementProperty(property, e.target.value)}
            className="w-full p-2 bg-gray-600 border border-gray-500 rounded text-sm text-white"
          >
            {options?.options?.map(option => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        )}
        {type === 'checkbox' && (
          <div className="flex items-center">
            <input
              type="checkbox"
              checked={isMixed ? false : value || false}
              onChange={(e) => updateElementProperty(property, e.target.checked)}
              className="mr-2"
            />
            <span className="text-sm text-gray-300">
              {isMixed ? 'Mixed' : value ? 'Enabled' : 'Disabled'}
            </span>
          </div>
        )}
      </div>
    );
  };

  const renderSection = (section: PropertySection) => {
    const IconComponent = section.icon;
    
    return (
      <div key={section.id} className="mb-4">
        <button
          onClick={() => toggleSection(section.id)}
          className="w-full flex items-center justify-between p-2 bg-gray-600 hover:bg-gray-500 rounded text-left"
        >
          <div className="flex items-center space-x-2">
            <IconComponent className="w-4 h-4" />
            <span className="font-medium">{section.title}</span>
          </div>
          {section.isExpanded ? (
            <ChevronDown className="w-4 h-4" />
          ) : (
            <ChevronRight className="w-4 h-4" />
          )}
        </button>
        
        {section.isExpanded && (
          <div className="mt-2 p-3 bg-gray-700 rounded">
            {section.id === 'transform' && (
              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  {renderPropertyInput('X Position', 'x', 'number', { min: -9999, max: 9999 })}
                  {renderPropertyInput('Y Position', 'y', 'number', { min: -9999, max: 9999 })}
                </div>
                <div className="grid grid-cols-2 gap-3">
                  {renderPropertyInput('Width', 'width', 'number', { min: 1, max: 9999 })}
                  {renderPropertyInput('Height', 'height', 'number', { min: 1, max: 9999 })}
                </div>
                <div className="grid grid-cols-2 gap-3">
                  {renderPropertyInput('Scale X', 'scaleX', 'range', { min: 0.1, max: 3, step: 0.1 })}
                  {renderPropertyInput('Scale Y', 'scaleY', 'range', { min: 0.1, max: 3, step: 0.1 })}
                </div>
                {renderPropertyInput('Rotation', 'rotation', 'range', { min: 0, max: 360, step: 1 })}
                {renderPropertyInput('Opacity', 'opacity', 'range', { min: 0, max: 1, step: 0.01 })}
              </div>
            )}
            
            {section.id === 'appearance' && (
              <div className="space-y-3">
                {renderPropertyInput('Name', 'name', 'text')}
                {renderPropertyInput('Z-Index', 'zIndex', 'number', { min: 0, max: 9999 })}
                {renderPropertyInput('Visible', 'visible', 'checkbox')}
                {renderPropertyInput('Locked', 'locked', 'checkbox')}
              </div>
            )}
            
            {section.id === 'text' && selectedElements[0]?.type === 'text' && (
              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">
                    Text Content
                  </label>
                  <textarea
                    value={localValues.text || ''}
                    onChange={(e) => updateElementProperty('text', e.target.value)}
                    className="w-full p-2 bg-gray-600 border border-gray-500 rounded text-sm text-white h-20 resize-none"
                    placeholder="Enter text..."
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  {renderPropertyInput('Font Size', 'fontSize', 'number', { min: 8, max: 200 })}
                  {renderPropertyInput('Font Family', 'fontFamily', 'select', {
                    options: [
                      { value: 'Arial', label: 'Arial' },
                      { value: 'Helvetica', label: 'Helvetica' },
                      { value: 'Times New Roman', label: 'Times New Roman' },
                      { value: 'Georgia', label: 'Georgia' },
                      { value: 'Verdana', label: 'Verdana' },
                      { value: 'Courier New', label: 'Courier New' }
                    ]
                  })}
                </div>
                <div className="grid grid-cols-2 gap-3">
                  {renderPropertyInput('Font Weight', 'fontWeight', 'select', {
                    options: [
                      { value: 100, label: 'Thin' },
                      { value: 200, label: 'Extra Light' },
                      { value: 300, label: 'Light' },
                      { value: 400, label: 'Normal' },
                      { value: 500, label: 'Medium' },
                      { value: 600, label: 'Semi Bold' },
                      { value: 700, label: 'Bold' },
                      { value: 800, label: 'Extra Bold' },
                      { value: 900, label: 'Black' }
                    ]
                  })}
                  {renderPropertyInput('Font Style', 'fontStyle', 'select', {
                    options: [
                      { value: 'normal', label: 'Normal' },
                      { value: 'italic', label: 'Italic' },
                      { value: 'oblique', label: 'Oblique' }
                    ]
                  })}
                </div>
                <div className="grid grid-cols-2 gap-3">
                  {renderPropertyInput('Text Align', 'textAlign', 'select', {
                    options: [
                      { value: 'left', label: 'Left' },
                      { value: 'center', label: 'Center' },
                      { value: 'right', label: 'Right' },
                      { value: 'justify', label: 'Justify' }
                    ]
                  })}
                  {renderPropertyInput('Vertical Align', 'verticalAlign', 'select', {
                    options: [
                      { value: 'top', label: 'Top' },
                      { value: 'middle', label: 'Middle' },
                      { value: 'bottom', label: 'Bottom' }
                    ]
                  })}
                </div>
                <div className="grid grid-cols-2 gap-3">
                  {renderPropertyInput('Letter Spacing', 'letterSpacing', 'range', { min: -5, max: 20, step: 0.1 })}
                  {renderPropertyInput('Line Height', 'lineHeight', 'range', { min: 0.5, max: 3, step: 0.1 })}
                </div>
                <div className="flex space-x-2">
                  <button
                    onClick={() => updateElementProperty('textDecoration', 
                      localValues.textDecoration === 'underline' ? 'none' : 'underline'
                    )}
                    className={`p-2 rounded ${localValues.textDecoration === 'underline' ? 'bg-blue-600' : 'bg-gray-600'}`}
                    title="Underline"
                  >
                    <Underline className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => updateElementProperty('textDecoration', 
                      localValues.textDecoration === 'line-through' ? 'none' : 'line-through'
                    )}
                    className={`p-2 rounded ${localValues.textDecoration === 'line-through' ? 'bg-blue-600' : 'bg-gray-600'}`}
                    title="Strikethrough"
                  >
                    <Strikethrough className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}
            
            {section.id === 'shape' && (selectedElements[0]?.type === 'rect' || selectedElements[0]?.type === 'circle') && (
              <div className="space-y-3">
                {renderPropertyInput('Fill Color', 'fill', 'color')}
                {renderPropertyInput('Stroke Color', 'stroke', 'color')}
                {renderPropertyInput('Stroke Width', 'strokeWidth', 'range', { min: 0, max: 20, step: 1 })}
                {selectedElements[0]?.type === 'rect' && 
                  renderPropertyInput('Corner Radius', 'cornerRadius', 'range', { min: 0, max: 50, step: 1 })
                }
                {selectedElements[0]?.type === 'circle' && 
                  renderPropertyInput('Radius', 'radius', 'range', { min: 10, max: 200, step: 1 })
                }
              </div>
            )}
            
            {section.id === 'image' && selectedElements[0]?.type === 'image' && (
              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">
                    Image Source
                  </label>
                  <input
                    type="text"
                    value={localValues.src || ''}
                    onChange={(e) => updateElementProperty('src', e.target.value)}
                    className="w-full p-2 bg-gray-600 border border-gray-500 rounded text-sm text-white"
                    placeholder="Image URL or path"
                  />
                </div>
                <div className="text-xs text-gray-400">
                  Upload or enter image URL to display image
                </div>
              </div>
            )}
            
            {section.id === 'effects' && (
              <div className="space-y-3">
                <div className="text-sm text-gray-400">
                  Effects and filters will be available here
                </div>
                {/* Placeholder for effects */}
              </div>
            )}
            
            {section.id === 'layers' && (
              <div className="space-y-3">
                <div className="text-sm text-gray-400">
                  Layer management controls will be available here
                </div>
                {/* Placeholder for layer controls */}
              </div>
            )}
          </div>
        )}
      </div>
    );
  };

  if (selectedElements.length === 0) {
    return (
      <div className={`w-80 bg-gray-700 text-white p-4 overflow-y-auto ${className}`}>
        <h3 className="text-lg font-semibold mb-4">Properties</h3>
        <div className="text-center text-gray-400 py-8">
          <Settings className="w-12 h-12 mx-auto mb-4 opacity-50" />
          <p>Select an element to edit properties</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`w-80 bg-gray-700 text-white p-4 overflow-y-auto ${className}`}>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold">Properties</h3>
        <div className="flex space-x-1">
          <button
            onClick={() => selectedElements.forEach(el => onElementDuplicate(el.id))}
            className="p-1 bg-gray-600 hover:bg-gray-500 rounded"
            title="Duplicate"
          >
            <Copy className="w-4 h-4" />
          </button>
          <button
            onClick={() => selectedElements.forEach(el => onElementDelete(el.id))}
            className="p-1 bg-red-600 hover:bg-red-500 rounded"
            title="Delete"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>
      
      <div className="mb-4 p-2 bg-gray-600 rounded text-sm">
        <div className="text-gray-300">
          {selectedElements.length === 1 ? (
            <span>Selected: {selectedElements[0].name || selectedElements[0].type}</span>
          ) : (
            <span>Selected: {selectedElements.length} elements</span>
          )}
        </div>
      </div>

      {sections.map(renderSection)}
    </div>
  );
};

export default PropertiesPanel;
