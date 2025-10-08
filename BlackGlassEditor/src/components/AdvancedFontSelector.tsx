'use client';

import React, { useState } from 'react';
import { Copy, Check, Eye, EyeOff, AlignLeft, AlignCenter, AlignRight, AlignJustify, Type, Bold, Italic, Underline, Strikethrough, RotateCcw, Languages } from 'lucide-react';

// Define the structure of our font options for clarity
type FontWeight = {
  name: string;   // e.g., "Thin", "Bold Italic"
  weight: number; // e.g., 100, 700
  style: string;  // e.g., 'normal', 'italic'
  variant?: string; // e.g., 'cilati'
};

type FontOption = {
  [key: string]: FontWeight[];
};

// Define all our available fonts and their weights here
const fontOptions: FontOption = {
  "Austin": [
    { name: "Light", weight: 300, style: 'normal' },
    { name: "Light Italic", weight: 300, style: 'italic' },
    { name: "Roman", weight: 400, style: 'normal' },
    { name: "Italic", weight: 400, style: 'italic' },
    { name: "Medium", weight: 500, style: 'normal' },
    { name: "Medium Italic", weight: 500, style: 'italic' },
    { name: "Semibold", weight: 600, style: 'normal' },
    { name: "Semibold Italic", weight: 600, style: 'italic' },
    { name: "Bold", weight: 700, style: 'normal' },
    { name: "Bold Italic", weight: 700, style: 'italic' },
    { name: "Extrabold", weight: 800, style: 'normal' },
    { name: "Extrabold Italic", weight: 800, style: 'italic' },
    { name: "Ultra", weight: 900, style: 'normal' },
    { name: "Ultra Italic", weight: 900, style: 'italic' },
    { name: "Fat", weight: 950, style: 'normal' },
    { name: "Fat Italic", weight: 950, style: 'italic' },
  ],
  "Austin Hairline": [
    { name: "Light", weight: 300, style: 'normal' },
    { name: "Light Italic", weight: 300, style: 'italic' },
    { name: "Roman", weight: 400, style: 'normal' },
    { name: "Italic", weight: 400, style: 'italic' },
    { name: "Medium", weight: 500, style: 'normal' },
    { name: "Medium Italic", weight: 500, style: 'italic' },
    { name: "Semibold", weight: 600, style: 'normal' },
    { name: "Semibold Italic", weight: 600, style: 'italic' },
    { name: "Bold", weight: 700, style: 'normal' },
    { name: "Bold Italic", weight: 700, style: 'italic' },
    { name: "Extrabold", weight: 800, style: 'normal' },
    { name: "Extrabold Italic", weight: 800, style: 'italic' },
    { name: "Ultra", weight: 900, style: 'normal' },
    { name: "Ultra Italic", weight: 900, style: 'italic' },
    { name: "Fat", weight: 950, style: 'normal' },
    { name: "Fat Italic", weight: 950, style: 'italic' },
  ],
  "Austin Text": [
    { name: "Roman", weight: 400, style: 'normal' },
    { name: "Italic", weight: 400, style: 'italic' },
    { name: "Semibold", weight: 600, style: 'normal' },
    { name: "Semibold Italic", weight: 600, style: 'italic' },
    { name: "Bold", weight: 700, style: 'normal' },
    { name: "Bold Italic", weight: 700, style: 'italic' },
    { name: "Fat", weight: 900, style: 'normal' },
    { name: "Fat Italic", weight: 900, style: 'italic' },
  ],
  "Heading Pro": [
    { name: "Thin", weight: 100, style: 'normal' },
    { name: "Extra Light", weight: 200, style: 'normal' },
    { name: "Light", weight: 300, style: 'normal' },
    { name: "Regular", weight: 400, style: 'normal' },
    { name: "Book", weight: 450, style: 'normal' },
    { name: "Bold", weight: 700, style: 'normal' },
    { name: "Extra Bold", weight: 800, style: 'normal' },
    { name: "Heavy", weight: 900, style: 'normal' },
  ],
  "Swear Text": [
    { name: "Thin", weight: 100, style: 'normal' },
    { name: "Thin Italic", weight: 100, style: 'italic' },
    { name: "Thin Cilati", weight: 100, style: 'normal', variant: 'cilati' },
    { name: "Light", weight: 300, style: 'normal' },
    { name: "Light Italic", weight: 300, style: 'italic' },
    { name: "Light Cilati", weight: 300, style: 'normal', variant: 'cilati' },
    { name: "Regular", weight: 400, style: 'normal' },
    { name: "Italic", weight: 400, style: 'italic' },
    { name: "Cilati", weight: 400, style: 'normal', variant: 'cilati' },
    { name: "Medium", weight: 500, style: 'normal' },
    { name: "Medium Italic", weight: 500, style: 'italic' },
    { name: "Medium Cilati", weight: 500, style: 'normal', variant: 'cilati' },
    { name: "Bold", weight: 700, style: 'normal' },
    { name: "Bold Italic", weight: 700, style: 'italic' },
    { name: "Bold Cilati", weight: 700, style: 'normal', variant: 'cilati' },
    { name: "Black", weight: 900, style: 'normal' },
    { name: "Black Italic", weight: 900, style: 'italic' },
    { name: "Black Cilati", weight: 900, style: 'normal', variant: 'cilati' },
  ]
};

interface AdvancedFontSelectorProps {
  selectedShape?: any;
  onPropertyChange: (property: string, value: any) => void;
  onBatchPropertyChange: (updates: Record<string, any>) => void;
}

const AdvancedFontSelector: React.FC<AdvancedFontSelectorProps> = ({ 
  selectedShape, 
  onPropertyChange, 
  onBatchPropertyChange 
}) => {
  const isDisabled = !selectedShape;
  const [localFontFamily, setLocalFontFamily] = useState(selectedShape?.fontFamily || '');
  const [previewText, setPreviewText] = useState("The quick brown fox jumps over the lazy dog");
  const [fontSize, setFontSize] = useState(selectedShape?.fontSize || 32);
  const [copiedPath, setCopiedPath] = useState('');
  const [showPreview, setShowPreview] = useState(true);
  
  // Advanced typography state
  const [letterSpacing, setLetterSpacing] = useState(selectedShape?.letterSpacing || 0);
  const [lineHeight, setLineHeight] = useState(selectedShape?.lineHeight || 1.2);
  const [textAlign, setTextAlign] = useState(selectedShape?.align || 'left');
  const [verticalAlign, setVerticalAlign] = useState(selectedShape?.verticalAlign || 'top');
  const [textWrap, setTextWrap] = useState(selectedShape?.wrap || 'word');
  const [textDecoration, setTextDecoration] = useState(selectedShape?.textDecoration || 'none');
  const [ellipsis, setEllipsis] = useState(selectedShape?.ellipsis || false);
  const [padding, setPadding] = useState(selectedShape?.padding || 0);
  const [direction, setDirection] = useState(selectedShape?.direction || 'inherit');
  const [textPath, setTextPath] = useState(selectedShape?.textPath || '');
  
  // Use fontOptions directly
  const availableWeights = fontOptions[localFontFamily] || [];

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedPath(text);
    setTimeout(() => setCopiedPath(''), 2000);
  };

  const generateCSSPath = (fontFamily: string, weight: number, style: string, variant?: string) => {
    const family = variant === 'cilati' ? `${fontFamily} Cilati` : fontFamily;
    return `font-family: "${family}"; font-weight: ${weight}; font-style: ${style};`;
  };

  return (
    <div className="bg-white rounded-lg shadow-xl border border-gray-200 p-6 w-full max-w-6xl">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-semibold flex items-center">
          <Type className="w-6 h-6 mr-2" />
          Complete Typography Control Panel
        </h3>
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setShowPreview(!showPreview)}
            className="p-2 text-gray-500 hover:text-gray-700"
            title={showPreview ? 'Hide preview' : 'Show preview'}
          >
            {showPreview ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Left Panel - Font Selection */}
        <div className="space-y-6">
          {/* Font Family Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Font Family
            </label>
            <select
              value={localFontFamily}
              disabled={isDisabled}
              onChange={(e) => {
                const newFamily = e.target.value;
                setLocalFontFamily(newFamily);

                // When family changes, reset weight to the first available option
                if (fontOptions[newFamily] && fontOptions[newFamily][0]) {
                  const defaultWeight = fontOptions[newFamily][0];
                  onBatchPropertyChange({
                    fontFamily: newFamily,
                    fontWeight: defaultWeight.weight,
                    fontStyle: defaultWeight.style,
                  });
                } else {
                  onBatchPropertyChange({
                    fontFamily: newFamily,
                  });
                }
              }}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="" disabled>Select a font...</option>
              {Object.keys(fontOptions).map(family => (
                <option key={family} value={family}>{family}</option>
              ))}
            </select>
          </div>

          {/* Font Size */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Font Size: {fontSize}px
            </label>
            <input
              type="range"
              min="8"
              max="200"
              value={fontSize}
              onChange={(e) => {
                const newSize = Number(e.target.value);
                setFontSize(newSize);
                onPropertyChange('fontSize', newSize);
              }}
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
            />
          </div>

          {/* Font Weights */}
          {availableWeights.length > 0 && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Font Variants
              </label>
              <div className="max-h-48 overflow-y-auto border border-gray-200 rounded-md p-2 space-y-1">
                {availableWeights.map((weight) => (
                  <div key={weight.name} className="flex items-center justify-between p-2 hover:bg-gray-50 rounded">
                    <button
                      type="button"
                      onMouseDown={(e) => {
                        e.preventDefault();
                        const updates: any = {
                          fontFamily: `${localFontFamily} ${weight.name}`.trim(),
                          fontWeight: weight.weight,
                          fontStyle: weight.style,
                        };

                        onBatchPropertyChange(updates);
                      }}
                      className={`flex-1 text-left p-2 rounded transition-colors ${
                        selectedShape &&
                        selectedShape.fontWeight === weight.weight &&
                        selectedShape.fontStyle === weight.style &&
                        selectedShape.fontFamily === `${localFontFamily} ${weight.name}`.trim()
                          ? 'bg-blue-100 text-blue-700' 
                          : 'hover:bg-gray-100'
                      }`}
                      style={{
                        fontFamily: weight.variant === 'cilati' ? `"${localFontFamily} Cilati"` : `"${localFontFamily}"`,
                        fontWeight: weight.weight,
                        fontStyle: weight.style,
                        fontSize: '14px'
                      }}
                    >
                      {weight.name}
                    </button>
                    
                    <button
                      onClick={() => copyToClipboard(generateCSSPath(localFontFamily, weight.weight, weight.style, weight.variant))}
                      className="p-1 text-gray-400 hover:text-gray-600 transition-colors"
                      title="Copy CSS"
                    >
                      {copiedPath === generateCSSPath(localFontFamily, weight.weight, weight.style, weight.variant) ? 
                        <Check className="w-4 h-4" /> : 
                        <Copy className="w-4 h-4" />
                      }
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Middle Panel - Advanced Typography Controls */}
        <div className="space-y-6">
          <h4 className="text-lg font-medium text-gray-700 flex items-center">
            <RotateCcw className="w-5 h-5 mr-2" />
            Advanced Typography
          </h4>

          {/* Text Alignment */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Text Alignment</label>
            <div className="flex space-x-1">
              {[
                { value: 'left', icon: AlignLeft, label: 'Left' },
                { value: 'center', icon: AlignCenter, label: 'Center' },
                { value: 'right', icon: AlignRight, label: 'Right' },
                { value: 'justify', icon: AlignJustify, label: 'Justify' }
              ].map(align => (
                <button
                  key={align.value}
                  onClick={() => {
                    setTextAlign(align.value);
                    onPropertyChange('align', align.value);
                  }}
                  className={`p-2 rounded border ${
                    textAlign === align.value 
                      ? 'bg-blue-100 border-blue-500 text-blue-700' 
                      : 'border-gray-300 hover:bg-gray-50'
                  }`}
                  title={align.label}
                >
                  <align.icon className="w-4 h-4" />
                </button>
              ))}
            </div>
          </div>

          {/* Vertical Alignment */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Vertical Alignment</label>
            <select
              value={verticalAlign}
              onChange={(e) => {
                setVerticalAlign(e.target.value);
                onPropertyChange('verticalAlign', e.target.value);
              }}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="top">Top</option>
              <option value="middle">Middle</option>
              <option value="bottom">Bottom</option>
            </select>
          </div>

          {/* Letter Spacing */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Letter Spacing: {letterSpacing}px
            </label>
            <input
              type="range"
              min="-5"
              max="20"
              step="0.1"
              value={letterSpacing}
              onChange={(e) => {
                const newSpacing = Number(e.target.value);
                setLetterSpacing(newSpacing);
                onPropertyChange('letterSpacing', newSpacing);
              }}
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
            />
          </div>

          {/* Line Height */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Line Height: {lineHeight}
            </label>
            <input
              type="range"
              min="0.5"
              max="3"
              step="0.1"
              value={lineHeight}
              onChange={(e) => {
                const newLineHeight = Number(e.target.value);
                setLineHeight(newLineHeight);
                onPropertyChange('lineHeight', newLineHeight);
              }}
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
            />
          </div>

          {/* Text Decoration */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Text Decoration</label>
            <div className="flex space-x-1">
              {[
                { value: 'none', icon: Type, label: 'None' },
                { value: 'underline', icon: Underline, label: 'Underline' },
                { value: 'line-through', icon: Strikethrough, label: 'Strikethrough' }
              ].map(decoration => (
                <button
                  key={decoration.value}
                  onClick={() => {
                    setTextDecoration(decoration.value);
                    onPropertyChange('textDecoration', decoration.value);
                  }}
                  className={`p-2 rounded border ${
                    textDecoration === decoration.value 
                      ? 'bg-blue-100 border-blue-500 text-blue-700' 
                      : 'border-gray-300 hover:bg-gray-50'
                  }`}
                  title={decoration.label}
                >
                  <decoration.icon className="w-4 h-4" />
                </button>
              ))}
            </div>
          </div>

          {/* Text Wrapping */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Text Wrapping</label>
            <select
              value={textWrap}
              onChange={(e) => {
                setTextWrap(e.target.value);
                onPropertyChange('wrap', e.target.value);
              }}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="word">Word</option>
              <option value="char">Character</option>
              <option value="none">None</option>
            </select>
          </div>

          {/* Padding */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Padding: {padding}px
            </label>
            <input
              type="range"
              min="0"
              max="50"
              value={padding}
              onChange={(e) => {
                const newPadding = Number(e.target.value);
                setPadding(newPadding);
                onPropertyChange('padding', newPadding);
              }}
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
            />
          </div>

          {/* Text Direction */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Text Direction</label>
            <div className="flex items-center space-x-2">
              <Languages className="w-4 h-4" />
              <select
                value={direction}
                onChange={(e) => {
                  setDirection(e.target.value);
                  onPropertyChange('direction', e.target.value);
                }}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="inherit">Inherit</option>
                <option value="ltr">Left to Right (LTR)</option>
                <option value="rtl">Right to Left (RTL)</option>
              </select>
            </div>
          </div>

          {/* Ellipsis Toggle */}
          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id="ellipsis"
              checked={ellipsis}
              onChange={(e) => {
                setEllipsis(e.target.checked);
                onPropertyChange('ellipsis', e.target.checked);
              }}
              className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
            />
            <label htmlFor="ellipsis" className="text-sm font-medium text-gray-700">
              Enable Ellipsis (text truncation)
            </label>
          </div>

          {/* Text Path */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Text Path (SVG)</label>
            <input
              type="text"
              value={textPath}
              onChange={(e) => {
                setTextPath(e.target.value);
                onPropertyChange('textPath', e.target.value);
              }}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="M10,50 Q50,10 90,50 T170,50"
            />
            <p className="text-xs text-gray-500 mt-1">
              SVG path for text-on-path effects
            </p>
          </div>
        </div>

        {/* Right Panel - Live Preview */}
        {showPreview && (
          <div className="space-y-4">
            <h4 className="text-lg font-medium text-gray-700">Live Preview</h4>
            
            {/* Preview Text Input */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Preview Text
              </label>
              <textarea
                value={previewText}
                onChange={(e) => setPreviewText(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Type your text here..."
                rows={3}
              />
            </div>

            {/* Live Preview */}
            <div className="bg-gray-50 rounded-lg p-6 min-h-64">
              {availableWeights.length > 0 ? (
                <div className="space-y-4">
                  {availableWeights.slice(0, 4).map((weight) => (
                    <div key={weight.name} className="border-b border-gray-200 pb-4 last:border-b-0">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium text-gray-600">
                          {weight.name}
                        </span>
                        <span className="text-xs text-gray-500 font-mono">
                          {weight.weight} {weight.style}
                        </span>
                      </div>
                      <div 
                        style={{
                          fontFamily: weight.variant === 'cilati' ? `"${localFontFamily} Cilati"` : `"${localFontFamily}"`,
                          fontWeight: weight.weight,
                          fontStyle: weight.style,
                          fontSize: `${fontSize}px`,
                          lineHeight: lineHeight,
                          letterSpacing: `${letterSpacing}px`,
                          textAlign: textAlign,
                          textDecoration: textDecoration,
                          padding: `${padding}px`,
                          direction: direction,
                          textOverflow: ellipsis ? 'ellipsis' : 'visible',
                          overflow: ellipsis ? 'hidden' : 'visible',
                          whiteSpace: textWrap === 'none' ? 'nowrap' : 'normal',
                          color: '#1f2937'
                        }}
                      >
                        {previewText}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center text-gray-500 py-8">
                  Select a font family to see previews
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdvancedFontSelector;
