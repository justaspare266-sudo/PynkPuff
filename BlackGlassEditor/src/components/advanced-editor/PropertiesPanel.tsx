"use client";

import React from 'react';
import FontSelector from '../fontselector/FontSelector';
import { Shape } from './ImageEditor';
import TermsAndConditions from './TermsAndConditions';
import AngleControl from './AngleControl';
import * as RadioGroup from '@radix-ui/react-radio-group';
import { AlignHorizontalJustifyStart, AlignHorizontalJustifyCenter, AlignHorizontalJustifyEnd, AlignVerticalJustifyStart, AlignVerticalJustifyCenter, AlignVerticalJustifyEnd } from 'lucide-react';

interface PropertiesPanelProps {
  selectedShape: Shape | null;
  onPropertyChange: (property: keyof Shape, value: any) => void;
  onBatchPropertyChange?: (updates: Partial<Shape>) => void;
  onExport: () => void;
  stageWidth: number;
  setStageWidth: (width: number) => void;
  stageHeight: number;
  setStageHeight: (height: number) => void;
  isOverlayVisible: boolean;
  setIsOverlayVisible: React.Dispatch<React.SetStateAction<boolean>>;
  gradientColors: { color: string; stop: number; opacity: number }[];
  setGradientColors: React.Dispatch<React.SetStateAction<{ color: string; stop: number; opacity: number; }[]>>;
  gradientRotation: number;
  setGradientRotation: React.Dispatch<React.SetStateAction<number>>;
  isButtonVisible: boolean;
  setIsButtonVisible: React.Dispatch<React.SetStateAction<boolean>>;
  activeLogo: string;
  setActiveLogo: (logo: string) => void;
  handleAlign: (alignment: "left" | "center" | "right" | "top" | "middle" | "bottom") => void;
  imageAttrs: { x: number; y: number; scale: number };
  handleZoomChange: (newZoom: number) => void;
  shapes: Shape[];
  terms: string;
  setTerms: React.Dispatch<React.SetStateAction<string>>;
  isTermsVisible: boolean;
  setIsTermsVisible: React.Dispatch<React.SetStateAction<boolean>>;
  addGradientColor: () => void;
  handleImageUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
  addTextElement: () => void;
  addRectangle: () => void;
  addButton: () => void;
  onSaveToFirebase: () => void;
  isSaving: boolean;
  addArtboard: () => void;
}

const PropertiesPanel: React.FC<PropertiesPanelProps> = ({
  selectedShape,
  onPropertyChange,
  onBatchPropertyChange,
  onExport,
  stageWidth,
  setStageWidth,
  stageHeight,
  setStageHeight,
  isOverlayVisible,
  setIsOverlayVisible,
  gradientColors,
  setGradientColors,
  gradientRotation,
  setGradientRotation,
  isButtonVisible,
  setIsButtonVisible,
  activeLogo,
  setActiveLogo,
  handleAlign,
  imageAttrs,
  handleZoomChange,
  shapes,
  terms,
  setTerms,
  isTermsVisible,
  setIsTermsVisible,
  addGradientColor,
  handleImageUpload,
  addTextElement,
  addRectangle,
  addButton,
  onSaveToFirebase,
  isSaving,
  addArtboard,
}) => {
  const renderTextProperties = () => (
    <>
      <div>
        <label htmlFor="text-content">Text Content</label>
        <textarea
          id="text-content"
          value={selectedShape?.text || ''}
          onChange={(e) => onPropertyChange('text', e.target.value)}
          className="w-full p-2 border border-gray-300 rounded-md text-gray-900 bg-white"
          rows={3}
        />
      </div>
      <FontSelector selectedShape={selectedShape} onPropertyChange={onPropertyChange} onBatchPropertyChange={onBatchPropertyChange} />
      <div>
        <label htmlFor={`text-color-${selectedShape?.id}`}>Text Color</label>
        <input
          type="color"
          id={`text-color-${selectedShape?.id}`}
          value={selectedShape?.fill || '#000000'}
          onChange={(e) => onPropertyChange('fill', e.target.value)}
          className="w-full h-10 border border-gray-300 rounded-md"
        />
      </div>
      <div>
        <label htmlFor={`bg-color-${selectedShape?.id}`}>Background Color</label>
        <div className="flex items-center gap-2">
          <input
            type="color"
            id={`bg-color-${selectedShape?.id}`}
            value={selectedShape?.stroke || '#ffffff'}
            onChange={(e) => onPropertyChange('stroke', e.target.value)}
            className="w-full h-10 border border-gray-300 rounded-md"
          />
          <button
            onClick={() => onPropertyChange('stroke', selectedShape?.stroke ? undefined : '#ffffff')}
            className={`px-3 py-2 text-xs rounded ${selectedShape?.stroke ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}
          >
            {selectedShape?.stroke ? 'Remove' : 'Add'}
          </button>
        </div>
      </div>
      <div>
        <label htmlFor="font-size">Font Size</label>
        <div className="flex items-center gap-2">
          <input
            type="range"
            min="1"
            max="200"
            value={selectedShape?.fontSize || 18}
            onChange={(e) => onPropertyChange('fontSize', parseInt(e.target.value, 10))}
            className="w-full"
            aria-label="Font size slider"
          />
          <input
            type="number"
            id="font-size"
            value={selectedShape?.fontSize || 18}
            onChange={(e) => onPropertyChange('fontSize', parseInt(e.target.value, 10))}
            className="w-20 p-1 border border-gray-300 rounded"
          />
        </div>
      </div>
      <div>
        <label htmlFor="letter-spacing">Letter Spacing</label>
        <div className="flex items-center gap-2">
          <input
            type="range"
            min="-5"
            max="20"
            step="0.1"
            value={selectedShape?.letterSpacing || 0}
            onChange={(e) => onPropertyChange('letterSpacing', parseFloat(e.target.value))}
            className="w-full"
            aria-label="Letter spacing slider"
          />
          <input
            type="number"
            id="letter-spacing"
            step="0.1"
            value={selectedShape?.letterSpacing || 0}
            onChange={(e) => onPropertyChange('letterSpacing', parseFloat(e.target.value))}
            className="w-20 p-1 border border-gray-300 rounded"
          />
        </div>
      </div>
      <div>
        <label className="text-sm font-medium text-gray-700 mb-2 block">Text Alignment</label>
        <div className="flex gap-1">
          <button
            onClick={() => onPropertyChange('align', 'left')}
            className={`p-2 rounded border ${selectedShape?.align === 'left' ? 'bg-blue-100 border-blue-300' : 'bg-gray-100 border-gray-300'} hover:bg-blue-50`}
            title="Align Left"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="21" y1="10" x2="3" y2="10"></line>
              <line x1="21" y1="6" x2="3" y2="6"></line>
              <line x1="11" y1="14" x2="3" y2="14"></line>
              <line x1="17" y1="18" x2="3" y2="18"></line>
            </svg>
          </button>
          <button
            onClick={() => onPropertyChange('align', 'center')}
            className={`p-2 rounded border ${selectedShape?.align === 'center' ? 'bg-blue-100 border-blue-300' : 'bg-gray-100 border-gray-300'} hover:bg-blue-50`}
            title="Align Center"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="18" y1="10" x2="6" y2="10"></line>
              <line x1="21" y1="6" x2="3" y2="6"></line>
              <line x1="16" y1="14" x2="8" y2="14"></line>
              <line x1="19" y1="18" x2="5" y2="18"></line>
            </svg>
          </button>
          <button
            onClick={() => onPropertyChange('align', 'right')}
            className={`p-2 rounded border ${selectedShape?.align === 'right' ? 'bg-blue-100 border-blue-300' : 'bg-gray-100 border-gray-300'} hover:bg-blue-50`}
            title="Align Right"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="3" y1="10" x2="21" y2="10"></line>
              <line x1="3" y1="6" x2="21" y2="6"></line>
              <line x1="13" y1="14" x2="21" y2="14"></line>
              <line x1="7" y1="18" x2="21" y2="18"></line>
            </svg>
          </button>
        </div>
      </div>
      {selectedShape?.textDecoration === 'underline' && (
        <div>
          <label htmlFor="underline-offset">Underline Offset</label>
          <div className="flex items-center gap-2">
            <input
              type="range"
              min="0"
              max="20"
              step="1"
              value={selectedShape?.underlineOffset || 0}
              onChange={(e) => onPropertyChange('underlineOffset', parseInt(e.target.value))}
              className="w-full"
              aria-label="Underline offset slider"
            />
            <input
              type="number"
              id="underline-offset"
              value={selectedShape?.underlineOffset || 0}
              onChange={(e) => onPropertyChange('underlineOffset', parseInt(e.target.value))}
              className="w-20 p-1 border border-gray-300 rounded"
            />
          </div>
        </div>
      )}
    </>
  );

  const renderButtonProperties = () => (
    <>
      <div>
        <label htmlFor="button-text">Button Text</label>
        <input
          type="text"
          id="button-text"
          value={selectedShape?.text || ''}
          onChange={(e) => onPropertyChange('text', e.target.value)}
          className="w-full p-2 border border-gray-300 rounded-md"
        />
      </div>
      <div>
        <label htmlFor={`button-bg-color-${selectedShape?.id}`}>Background Color</label>
        <input
          type="color"
          id={`button-bg-color-${selectedShape?.id}`}
          value={selectedShape?.fill || '#333333'}
          onChange={(e) => onPropertyChange('fill', e.target.value)}
          className="w-full h-10 border border-gray-300 rounded-md"
        />
      </div>
      <div>
        <label htmlFor={`button-text-color-${selectedShape?.id}`}>Text Color</label>
        <input
          type="color"
          id={`button-text-color-${selectedShape?.id}`}
          value={selectedShape?.textColor || '#ffffff'}
          onChange={(e) => onPropertyChange('textColor', e.target.value)}
          className="w-full h-10 border border-gray-300 rounded-md"
        />
      </div>
      <div>
        <label htmlFor="button-font-size">Font Size</label>
        <div className="flex items-center gap-2">
          <input
            type="range"
            min="8"
            max="48"
            value={selectedShape?.fontSize || 18}
            onChange={(e) => onPropertyChange('fontSize', parseInt(e.target.value, 10))}
            className="w-full"
          />
          <input
            type="number"
            id="button-font-size"
            value={selectedShape?.fontSize || 18}
            onChange={(e) => onPropertyChange('fontSize', parseInt(e.target.value, 10))}
            className="w-20 p-1 border border-gray-300 rounded"
          />
        </div>
      </div>
      <div>
        <label className="text-sm font-medium text-gray-700 mb-2 block">Button Style</label>
        <div className="flex gap-2">
          <button
            onClick={() => onBatchPropertyChange?.({ fill: '#000000', textColor: '#ffffff', stroke: undefined, strokeWidth: 0, textDecoration: undefined })}
            className="px-3 py-2 bg-black text-white rounded text-xs"
          >
            Solid
          </button>
          <button
            onClick={() => onBatchPropertyChange?.({ fill: 'transparent', textColor: '#000000', stroke: '#000000', strokeWidth: 2, textDecoration: 'underline', underlineOffset: 8 })}
            className="px-3 py-2 border-2 border-black text-black rounded text-xs"
          >
            Outline
          </button>
        </div>
      </div>
    </>
  );

  const renderRectangleProperties = () => (
    <>
      <div>
        <label htmlFor={`rect-fill-color-${selectedShape?.id}`}>Fill Color</label>
        <input
          type="color"
          id={`rect-fill-color-${selectedShape?.id}`}
          value={selectedShape?.fill || '#ffffff'}
          onChange={(e) => onPropertyChange('fill', e.target.value)}
          className="w-full h-10 border border-gray-300 rounded-md"
        />
      </div>
      <div>
        <label htmlFor={`rect-stroke-color-${selectedShape?.id}`}>Border Color</label>
        <input
          type="color"
          id={`rect-stroke-color-${selectedShape?.id}`}
          value={selectedShape?.stroke || '#000000'}
          onChange={(e) => onPropertyChange('stroke', e.target.value)}
          className="w-full h-10 border border-gray-300 rounded-md"
        />
      </div>
      <div>
        <label htmlFor="rect-stroke-width">Border Width</label>
        <div className="flex items-center gap-2">
          <input
            type="range"
            min="0"
            max="20"
            value={selectedShape?.strokeWidth || 0}
            onChange={(e) => onPropertyChange('strokeWidth', parseInt(e.target.value, 10))}
            className="w-full"
          />
          <input
            type="number"
            id="rect-stroke-width"
            value={selectedShape?.strokeWidth || 0}
            onChange={(e) => onPropertyChange('strokeWidth', parseInt(e.target.value, 10))}
            className="w-20 p-1 border border-gray-300 rounded"
          />
        </div>
      </div>
      <div>
        <label htmlFor="rect-corner-radius">Corner Radius</label>
        <div className="flex items-center gap-2">
          <input
            type="range"
            min="0"
            max="50"
            value={selectedShape?.cornerRadius || 0}
            onChange={(e) => onPropertyChange('cornerRadius', parseInt(e.target.value, 10))}
            className="w-full"
          />
          <input
            type="number"
            id="rect-corner-radius"
            value={selectedShape?.cornerRadius || 0}
            onChange={(e) => onPropertyChange('cornerRadius', parseInt(e.target.value, 10))}
            className="w-20 p-1 border border-gray-300 rounded"
          />
        </div>
      </div>
    </>
  );

  return (
    <div className="w-96 bg-white p-4 rounded-lg shadow-md flex flex-col space-y-4 overflow-y-auto">
      <h3 className="text-xl font-bold text-gray-800">Controls</h3>
      
      <div className="border-t pt-4">
        <label htmlFor="image-upload" className="w-full text-center block py-2 px-4 rounded-md text-sm font-medium bg-blue-600 text-white cursor-pointer hover:bg-blue-700">
          Upload Background Image
        </label>
        <input id="image-upload" type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
      </div>

      <div className="border-t pt-4">
        <h4 className="font-semibold text-gray-700 mb-2">Add Elements</h4>
        <div className="grid grid-cols-2 gap-2">
          <button
            onClick={addTextElement}
            className="py-2 px-3 bg-green-600 text-white rounded-md text-sm font-medium hover:bg-green-700"
          >
            + Text
          </button>
          <button
            onClick={addRectangle}
            className="py-2 px-3 bg-purple-600 text-white rounded-md text-sm font-medium hover:bg-purple-700"
          >
            + Rectangle
          </button>
          <button
            onClick={addButton}
            className="py-2 px-3 bg-orange-600 text-white rounded-md text-sm font-medium hover:bg-orange-700"
          >
            + Button
          </button>
          <button
            onClick={addArtboard}
            className="py-2 px-3 bg-blue-500 text-white rounded-md text-sm font-medium hover:bg-blue-600"
          >
            + Canvas
          </button>
        </div>
      </div>

      <div className="border-t pt-4">
          <h4 className="font-semibold text-gray-700 mb-2">Canvas Size</h4>
          <div className="flex flex-col gap-2">
              <div className="flex gap-1 mb-2">
                  <button onClick={() => { setStageWidth(2384); setStageHeight(3370); }} className="px-2 py-1 text-xs bg-gray-100 border border-gray-300 rounded hover:bg-gray-200" title="A1 - 2384x3370px">A1</button>
                  <button onClick={() => { setStageWidth(794); setStageHeight(1123); }} className="px-2 py-1 text-xs bg-gray-100 border border-gray-300 rounded hover:bg-gray-200" title="A4 - 794x1123px">A4</button>
                  <button onClick={() => { setStageWidth(559); setStageHeight(794); }} className="px-2 py-1 text-xs bg-gray-100 border border-gray-300 rounded hover:bg-gray-200" title="A5 - 559x794px">A5</button>
              </div>
              <div>
                  <label htmlFor="width-input" className="text-sm">Width: {stageWidth}px</label>
                  <input id="width-input" type="range" min="100" max="3500" value={stageWidth} onChange={(e) => setStageWidth(parseInt(e.target.value, 10))} className="w-full" />
                  <input type="number" value={stageWidth} onChange={(e) => {
                      const val = parseInt(e.target.value, 10);
                      setStageWidth(isNaN(val) ? 0 : val);
                  }} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-1 px-2 text-gray-900 bg-white" title="Enter canvas width" placeholder="Width in pixels" />
              </div>
              <div>
                  <label htmlFor="height-input" className="text-sm">Height: {stageHeight}px</label>
                  <input id="height-input" type="range" min="100" max="3500" value={stageHeight} onChange={(e) => setStageHeight(parseInt(e.target.value, 10))} className="w-full" />
                  <input type="number" value={stageHeight} onChange={(e) => {
                      const val = parseInt(e.target.value, 10);
                      setStageHeight(isNaN(val) ? 0 : val);
                  }} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-1 px-2 text-gray-900 bg-white"
                  title="Enter canvas height" placeholder="Height in pixels" />
              </div>
          </div>
      </div>

      <div className="border-t pt-4">
        <div className="flex items-center justify-between">
          <h4 className="font-semibold text-gray-700">Gradient Overlay</h4>
          <input type="checkbox" checked={isOverlayVisible} onChange={(e) => setIsOverlayVisible(e.target.checked)} className="h-4 w-4 rounded text-blue-600 focus:ring-blue-500" title="Toggle Gradient Overlay Visibility" />
        </div>
        {isOverlayVisible && (
          <div className="space-y-2 mt-2">
            {gradientColors.map((item, index) => (
              <div 
                key={index} 
                className="flex flex-col gap-2 p-2 border rounded-md hover:bg-gray-50 transition-colors"
                onDragOver={(e) => {
                  e.preventDefault();
                  e.dataTransfer.dropEffect = 'move';
                }}
                onDrop={(e) => {
                  e.preventDefault();
                  const dragIndex = parseInt(e.dataTransfer.getData('dragIndex'));
                  const dropIndex = index;
                  
                  if (dragIndex !== dropIndex) {
                    setGradientColors(prev => {
                      const newColors = [...prev];
                      const draggedItem = newColors[dragIndex];
                      newColors.splice(dragIndex, 1);
                      newColors.splice(dropIndex, 0, draggedItem);
                      return newColors;
                    });
                  }
                }}
              >
                <div className="flex items-center gap-2">
                    <div className="flex items-center gap-1">
                      <span 
                        className="text-xs text-gray-500 cursor-move px-1 py-2 hover:bg-gray-200 rounded"
                        draggable
                        onDragStart={(e) => {
                          e.dataTransfer.setData('dragIndex', index.toString());
                          e.dataTransfer.effectAllowed = 'move';
                        }}
                        title="Drag to reorder"
                      >
                        ⋮⋮
                      </span>
                      <input aria-label={`Gradient color ${index + 1}`} type="color" value={item.color} onChange={(e) => setGradientColors(prev => prev.map((c: { color: string; stop: number; opacity: number; }, i: number) => i === index ? {...c, color: e.target.value} : c))} className="w-10 h-10 p-1 border-none cursor-pointer rounded-md" />
                    </div>
                    <input aria-label={`Gradient stop ${index + 1}`} type="range" min="0" max="1" step="0.01" value={item.stop} onChange={(e) => setGradientColors(prev => prev.map((c: { color: string; stop: number; opacity: number; }, i: number) => i === index ? {...c, stop: parseFloat(e.target.value)} : c))} className="w-full" />
                    <span>{Math.round(item.stop * 100)}%</span>
                    {gradientColors.length > 2 && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setGradientColors(prev => prev.filter((_, i) => i !== index));
                        }}
                        className="px-1 py-1 text-red-500 hover:bg-red-100 rounded text-xs"
                        title="Delete color stop"
                      >
                        ×
                      </button>
                    )}
                </div>
                <div className="flex items-center gap-2">
                    <span className="text-xs w-16">Opacity:</span>
                    <input aria-label={`Gradient opacity ${index + 1}`} type="range" min="0" max="1" step="0.01" value={item.opacity} onChange={(e) => setGradientColors(prev => prev.map((c: { color: string; stop: number; opacity: number; }, i: number) => i === index ? {...c, opacity: parseFloat(e.target.value)} : c))} className="w-full" />
                    <span>{Math.round(item.opacity * 100)}%</span>
                </div>
              </div>
            ))}
            <button onClick={addGradientColor} className="w-full py-2 px-4 border border-dashed rounded-md text-sm font-medium text-gray-700 hover:bg-gray-100">Add Color Stop</button>
            <div>
              <label htmlFor="gradient-rotation">Gradient Rotation: {gradientRotation}°</label>
              <input
                type="range"
                id="gradient-rotation"
                min="0"
                max="360"
                value={gradientRotation}
                onChange={(e) => setGradientRotation(parseInt(e.target.value, 10))}
                className="w-full"
              />
            </div>
            <AngleControl rotation={gradientRotation} setRotation={setGradientRotation} />
          </div>
        )}
      </div>

      {selectedShape && (selectedShape.type === 'text' || selectedShape.type === 'terms') && renderTextProperties()}
      {selectedShape && selectedShape.type === 'button' && renderButtonProperties()}
      {selectedShape && selectedShape.type === 'rectangle' && renderRectangleProperties()}

      <div className="border-t pt-4 space-y-4">
          <h4 className="font-semibold text-gray-700">Button Styles</h4>
          <div className="flex items-center justify-between">
              <label htmlFor="show-button-checkbox" className="text-sm font-medium">Show Button</label>
              <input id="show-button-checkbox" type="checkbox" checked={isButtonVisible} onChange={(e) => setIsButtonVisible(e.target.checked)} className="h-4 w-4 rounded text-blue-600 focus:ring-blue-500" />
          </div>
      </div>

      <TermsAndConditions terms={terms} setTerms={setTerms} isTermsVisible={isTermsVisible} setIsTermsVisible={setIsTermsVisible} />

      <div className="border-t pt-4">
        <h4 className="font-semibold text-gray-700 mb-2">Logo</h4>
        <RadioGroup.Root value={activeLogo} onValueChange={(val: string) => setActiveLogo(val)} className="space-y-2">
           <div className="flex items-center"><RadioGroup.Item value="logo-black" id="r4" className="bg-white w-4 h-4 rounded-full border border-gray-400 data-[state=checked]:border-blue-600"><RadioGroup.Indicator className="flex items-center justify-center w-full h-full relative after:content-[''] after:block after:w-2 after:h-2 after:rounded-full after:bg-blue-600" /></RadioGroup.Item><label htmlFor="r4" className="pl-2 text-sm">LKB Black</label></div>
           <div className="flex items-center"><RadioGroup.Item value="logo-white" id="r5" className="bg-white w-4 h-4 rounded-full border border-gray-400 data-[state=checked]:border-blue-600"><RadioGroup.Indicator className="flex items-center justify-center w-full h-full relative after:content-[''] after:block after:w-2 after:h-2 after:rounded-full after:bg-blue-600" /></RadioGroup.Item><label htmlFor="r5" className="pl-2 text-sm">LKB White</label></div>
           <div className="flex items-center"><RadioGroup.Item value="logo-bennett-black" id="r6" className="bg-white w-4 h-4 rounded-full border border-gray-400 data-[state=checked]:border-blue-600"><RadioGroup.Indicator className="flex items-center justify-center w-full h-full relative after:content-[''] after:block after:w-2 after:h-2 after:rounded-full after:bg-blue-600" /></RadioGroup.Item><label htmlFor="r6" className="pl-2 text-sm">LK Bennett Black</label></div>
           <div className="flex items-center"><RadioGroup.Item value="logo-bennett-white" id="r7" className="bg-white w-4 h-4 rounded-full border border-gray-400 data-[state=checked]:border-blue-600"><RadioGroup.Indicator className="flex items-center justify-center w-full h-full relative after:content-[''] after:block after:w-2 after:h-2 after:rounded-full after:bg-blue-600" /></RadioGroup.Item><label htmlFor="r7" className="pl-2 text-sm">LK Bennett White</label></div>
        </RadioGroup.Root>
      </div>

      <div className="border-t pt-4">
        <h4 className="font-semibold text-gray-700 mb-2">Canvas Alignment</h4>
        <div className="grid grid-cols-3 gap-1">
          <button onClick={() => handleAlign("left")} className="p-2 rounded border bg-gray-100 border-gray-300 hover:bg-blue-50" title="Align Left">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="3" y1="6" x2="3" y2="18"></line>
              <line x1="7" y1="12" x2="21" y2="12"></line>
              <line x1="7" y1="18" x2="15" y2="18"></line>
              <line x1="7" y1="6" x2="18" y2="6"></line>
            </svg>
          </button>
          <button onClick={() => handleAlign("center")} className="p-2 rounded border bg-gray-100 border-gray-300 hover:bg-blue-50" title="Align Center">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="12" y1="3" x2="12" y2="21"></line>
              <line x1="8" y1="12" x2="16" y2="12"></line>
              <line x1="10" y1="18" x2="14" y2="18"></line>
              <line x1="9" y1="6" x2="15" y2="6"></line>
            </svg>
          </button>
          <button onClick={() => handleAlign("right")} className="p-2 rounded border bg-gray-100 border-gray-300 hover:bg-blue-50" title="Align Right">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="21" y1="6" x2="21" y2="18"></line>
              <line x1="3" y1="12" x2="17" y2="12"></line>
              <line x1="9" y1="18" x2="17" y2="18"></line>
              <line x1="6" y1="6" x2="17" y2="6"></line>
            </svg>
          </button>
          <button onClick={() => handleAlign("top")} className="p-2 rounded border bg-gray-100 border-gray-300 hover:bg-blue-50" title="Align Top">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="6" y1="3" x2="18" y2="3"></line>
              <line x1="12" y1="7" x2="12" y2="21"></line>
              <line x1="18" y1="7" x2="18" y2="15"></line>
              <line x1="6" y1="7" x2="6" y2="18"></line>
            </svg>
          </button>
          <button onClick={() => handleAlign("middle")} className="p-2 rounded border bg-gray-100 border-gray-300 hover:bg-blue-50" title="Align Middle">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="3" y1="12" x2="21" y2="12"></line>
              <line x1="12" y1="8" x2="12" y2="16"></line>
              <line x1="18" y1="10" x2="18" y2="14"></line>
              <line x1="6" y1="9" x2="6" y2="15"></line>
            </svg>
          </button>
          <button onClick={() => handleAlign("bottom")} className="p-2 rounded border bg-gray-100 border-gray-300 hover:bg-blue-50" title="Align Bottom">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="6" y1="21" x2="18" y2="21"></line>
              <line x1="12" y1="3" x2="12" y2="17"></line>
              <line x1="18" y1="9" x2="18" y2="17"></line>
              <line x1="6" y1="6" x2="6" y2="17"></line>
            </svg>
          </button>
        </div>
      </div>

      <div className="mt-auto flex gap-2 border-t pt-4">
          <button onClick={onExport} className="flex-1 py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700">Export Image</button>
          <button
            onClick={onSaveToFirebase}
            disabled={isSaving}
            className="flex-1 py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 disabled:bg-gray-400"
          >
            {isSaving ? 'Saving...' : 'Save to Cloud'}
          </button>
      </div>
    </div>
  );
};

export default PropertiesPanel;