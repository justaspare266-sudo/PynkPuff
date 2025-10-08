import React, { useState, useCallback } from 'react';
import { 
  Type, 
  Bold, 
  Italic, 
  Underline, 
  Strikethrough,
  AlignLeft,
  AlignCenter,
  AlignRight,
  AlignJustify,
  Palette,
  Settings,
  RotateCw,
  Move,
  Trash2,
  Copy
} from 'lucide-react';

export interface TextStyle {
  fontSize: number;
  fontFamily: string;
  fontWeight: number;
  fontStyle: 'normal' | 'italic';
  textDecoration: 'none' | 'underline' | 'line-through';
  textAlign: 'left' | 'center' | 'right' | 'justify';
  letterSpacing: number;
  lineHeight: number;
  fill: string;
  stroke?: string;
  strokeWidth?: number;
  rotation: number;
  opacity: number;
}

interface EnhancedTextToolProps {
  currentStyle: TextStyle;
  onStyleChange: (style: TextStyle) => void;
  onClose?: () => void;
}

const fontFamilies = [
  'Arial', 'Helvetica', 'Times New Roman', 'Georgia', 'Verdana', 'Tahoma',
  'Trebuchet MS', 'Impact', 'Comic Sans MS', 'Courier New', 'Monaco',
  'Lucida Console', 'Palatino', 'Garamond', 'Bookman', 'Calibri', 'Segoe UI'
];

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

export const EnhancedTextTool: React.FC<EnhancedTextToolProps> = ({
  currentStyle,
  onStyleChange,
  onClose
}) => {
  const [activeTab, setActiveTab] = useState<'basic' | 'advanced' | 'effects'>('basic');

  const handleStyleChange = useCallback((updates: Partial<TextStyle>) => {
    onStyleChange({ ...currentStyle, ...updates });
  }, [currentStyle, onStyleChange]);

  const handleFontWeightToggle = useCallback(() => {
    const newWeight = currentStyle.fontWeight === 700 ? 400 : 700;
    handleStyleChange({ fontWeight: newWeight });
  }, [currentStyle.fontWeight, handleStyleChange]);

  const handleFontStyleToggle = useCallback(() => {
    const newStyle = currentStyle.fontStyle === 'italic' ? 'normal' : 'italic';
    handleStyleChange({ fontStyle: newStyle });
  }, [currentStyle.fontStyle, handleStyleChange]);

  const handleTextDecorationToggle = useCallback((decoration: 'underline' | 'line-through') => {
    const newDecoration = currentStyle.textDecoration === decoration ? 'none' : decoration;
    handleStyleChange({ textDecoration: newDecoration });
  }, [currentStyle.textDecoration, handleStyleChange]);

  return (
    <div className="bg-white border border-gray-200 rounded-lg shadow-lg p-4 w-80">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold flex items-center">
          <Type className="w-5 h-5 mr-2" />
          Text Styling
        </h3>
        {onClose && (
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            ×
          </button>
        )}
      </div>

      {/* Tabs */}
      <div className="flex mb-4 border-b">
        {[
          { id: 'basic', label: 'Basic' },
          { id: 'advanced', label: 'Advanced' },
          { id: 'effects', label: 'Effects' }
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`px-3 py-2 text-sm font-medium ${
              activeTab === tab.id
                ? 'text-blue-600 border-b-2 border-blue-600'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Basic Tab */}
      {activeTab === 'basic' && (
        <div className="space-y-4">
          {/* Font Family */}
          <div>
            <label className="block text-sm font-medium mb-2">Font Family</label>
            <select
              value={currentStyle.fontFamily}
              onChange={(e) => handleStyleChange({ fontFamily: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {fontFamilies.map(font => (
                <option key={font} value={font} style={{ fontFamily: font }}>
                  {font}
                </option>
              ))}
            </select>
          </div>

          {/* Font Size */}
          <div>
            <label className="block text-sm font-medium mb-2">Font Size</label>
            <div className="flex items-center space-x-2">
              <input
                type="range"
                min="8"
                max="200"
                value={currentStyle.fontSize}
                onChange={(e) => handleStyleChange({ fontSize: parseInt(e.target.value) })}
                className="flex-1"
              />
              <input
                type="number"
                value={currentStyle.fontSize}
                onChange={(e) => handleStyleChange({ fontSize: parseInt(e.target.value) })}
                className="w-16 px-2 py-1 border border-gray-300 rounded text-sm"
              />
            </div>
          </div>

          {/* Formatting Buttons */}
          <div>
            <label className="block text-sm font-medium mb-2">Formatting</label>
            <div className="flex space-x-1">
              <button
                onClick={handleFontWeightToggle}
                className={`p-2 rounded ${
                  currentStyle.fontWeight === 700 ? 'bg-blue-600 text-white' : 'bg-gray-100 hover:bg-gray-200'
                }`}
                title="Bold"
              >
                <Bold className="w-4 h-4" />
              </button>
              
              <button
                onClick={handleFontStyleToggle}
                className={`p-2 rounded ${
                  currentStyle.fontStyle === 'italic' ? 'bg-blue-600 text-white' : 'bg-gray-100 hover:bg-gray-200'
                }`}
                title="Italic"
              >
                <Italic className="w-4 h-4" />
              </button>
              
              <button
                onClick={() => handleTextDecorationToggle('underline')}
                className={`p-2 rounded ${
                  currentStyle.textDecoration === 'underline' ? 'bg-blue-600 text-white' : 'bg-gray-100 hover:bg-gray-200'
                }`}
                title="Underline"
              >
                <Underline className="w-4 h-4" />
              </button>
              
              <button
                onClick={() => handleTextDecorationToggle('line-through')}
                className={`p-2 rounded ${
                  currentStyle.textDecoration === 'line-through' ? 'bg-blue-600 text-white' : 'bg-gray-100 hover:bg-gray-200'
                }`}
                title="Strikethrough"
              >
                <Strikethrough className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Text Alignment */}
          <div>
            <label className="block text-sm font-medium mb-2">Alignment</label>
            <div className="flex space-x-1">
              {[
                { value: 'left', icon: AlignLeft },
                { value: 'center', icon: AlignCenter },
                { value: 'right', icon: AlignRight },
                { value: 'justify', icon: AlignJustify }
              ].map(({ value, icon: Icon }) => (
                <button
                  key={value}
                  onClick={() => handleStyleChange({ textAlign: value as any })}
                  className={`p-2 rounded ${
                    currentStyle.textAlign === value ? 'bg-blue-600 text-white' : 'bg-gray-100 hover:bg-gray-200'
                  }`}
                  title={value.charAt(0).toUpperCase() + value.slice(1)}
                >
                  <Icon className="w-4 h-4" />
                </button>
              ))}
            </div>
          </div>

          {/* Color */}
          <div>
            <label className="block text-sm font-medium mb-2">Text Color</label>
            <div className="flex items-center space-x-2">
              <input
                type="color"
                value={currentStyle.fill}
                onChange={(e) => handleStyleChange({ fill: e.target.value })}
                className="w-8 h-8 rounded border border-gray-300"
              />
              <input
                type="text"
                value={currentStyle.fill}
                onChange={(e) => handleStyleChange({ fill: e.target.value })}
                className="flex-1 px-2 py-1 border border-gray-300 rounded text-sm"
              />
            </div>
          </div>
        </div>
      )}

      {/* Advanced Tab */}
      {activeTab === 'advanced' && (
        <div className="space-y-4">
          {/* Font Weight */}
          <div>
            <label className="block text-sm font-medium mb-2">Font Weight</label>
            <select
              value={currentStyle.fontWeight}
              onChange={(e) => handleStyleChange({ fontWeight: parseInt(e.target.value) })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {fontWeights.map(weight => (
                <option key={weight.value} value={weight.value}>
                  {weight.label} ({weight.value})
                </option>
              ))}
            </select>
          </div>

          {/* Letter Spacing */}
          <div>
            <label className="block text-sm font-medium mb-2">Letter Spacing</label>
            <div className="flex items-center space-x-2">
              <input
                type="range"
                min="-5"
                max="20"
                step="0.5"
                value={currentStyle.letterSpacing}
                onChange={(e) => handleStyleChange({ letterSpacing: parseFloat(e.target.value) })}
                className="flex-1"
              />
              <input
                type="number"
                value={currentStyle.letterSpacing}
                onChange={(e) => handleStyleChange({ letterSpacing: parseFloat(e.target.value) })}
                className="w-16 px-2 py-1 border border-gray-300 rounded text-sm"
                step="0.5"
              />
            </div>
          </div>

          {/* Line Height */}
          <div>
            <label className="block text-sm font-medium mb-2">Line Height</label>
            <div className="flex items-center space-x-2">
              <input
                type="range"
                min="0.5"
                max="3"
                step="0.1"
                value={currentStyle.lineHeight}
                onChange={(e) => handleStyleChange({ lineHeight: parseFloat(e.target.value) })}
                className="flex-1"
              />
              <input
                type="number"
                value={currentStyle.lineHeight}
                onChange={(e) => handleStyleChange({ lineHeight: parseFloat(e.target.value) })}
                className="w-16 px-2 py-1 border border-gray-300 rounded text-sm"
                step="0.1"
              />
            </div>
          </div>

          {/* Opacity */}
          <div>
            <label className="block text-sm font-medium mb-2">Opacity</label>
            <div className="flex items-center space-x-2">
              <input
                type="range"
                min="0"
                max="1"
                step="0.1"
                value={currentStyle.opacity}
                onChange={(e) => handleStyleChange({ opacity: parseFloat(e.target.value) })}
                className="flex-1"
              />
              <span className="text-sm text-gray-600 w-12">
                {Math.round(currentStyle.opacity * 100)}%
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Effects Tab */}
      {activeTab === 'effects' && (
        <div className="space-y-4">
          {/* Stroke */}
          <div>
            <label className="block text-sm font-medium mb-2">Stroke</label>
            <div className="flex items-center space-x-2">
              <input
                type="color"
                value={currentStyle.stroke || '#000000'}
                onChange={(e) => handleStyleChange({ stroke: e.target.value })}
                className="w-8 h-8 rounded border border-gray-300"
              />
              <input
                type="text"
                value={currentStyle.stroke || '#000000'}
                onChange={(e) => handleStyleChange({ stroke: e.target.value })}
                className="flex-1 px-2 py-1 border border-gray-300 rounded text-sm"
              />
            </div>
          </div>

          {/* Stroke Width */}
          <div>
            <label className="block text-sm font-medium mb-2">Stroke Width</label>
            <div className="flex items-center space-x-2">
              <input
                type="range"
                min="0"
                max="10"
                step="0.5"
                value={currentStyle.strokeWidth || 0}
                onChange={(e) => handleStyleChange({ strokeWidth: parseFloat(e.target.value) })}
                className="flex-1"
              />
              <input
                type="number"
                value={currentStyle.strokeWidth || 0}
                onChange={(e) => handleStyleChange({ strokeWidth: parseFloat(e.target.value) })}
                className="w-16 px-2 py-1 border border-gray-300 rounded text-sm"
                step="0.5"
              />
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
                value={currentStyle.rotation}
                onChange={(e) => handleStyleChange({ rotation: parseInt(e.target.value) })}
                className="flex-1"
              />
              <input
                type="number"
                value={currentStyle.rotation}
                onChange={(e) => handleStyleChange({ rotation: parseInt(e.target.value) })}
                className="w-16 px-2 py-1 border border-gray-300 rounded text-sm"
              />
              <span className="text-sm text-gray-600">°</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

