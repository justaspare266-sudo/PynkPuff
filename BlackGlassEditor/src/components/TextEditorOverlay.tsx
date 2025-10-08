import React, { useState, useEffect } from 'react';
import { 
  Type, 
  Bold, 
  Italic, 
  Underline, 
  AlignLeft,
  AlignCenter,
  AlignRight,
  AlignJustify,
  Palette,
  RotateCw,
  Trash2,
  X
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

interface TextEditorOverlayProps {
  isVisible: boolean;
  text: string;
  style: TextStyle;
  position: { x: number; y: number };
  onTextChange: (text: string) => void;
  onStyleChange: (style: TextStyle) => void;
  onClose: () => void;
  onDelete: () => void;
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

export const TextEditorOverlay: React.FC<TextEditorOverlayProps> = ({
  isVisible,
  text,
  style,
  position,
  onTextChange,
  onStyleChange,
  onClose,
  onDelete
}) => {
  const [localText, setLocalText] = useState(text);
  const [localStyle, setLocalStyle] = useState(style);

  useEffect(() => {
    setLocalText(text);
    setLocalStyle(style);
  }, [text, style]);

  const handleStyleChange = (updates: Partial<TextStyle>) => {
    const newStyle = { ...localStyle, ...updates };
    setLocalStyle(newStyle);
    onStyleChange(newStyle);
  };

  const handleTextChange = (newText: string) => {
    setLocalText(newText);
    onTextChange(newText);
  };

  if (!isVisible) return null;

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50"
      onClick={onClose}
    >
      <div 
        className="bg-white rounded-lg shadow-xl p-6 max-w-2xl w-full mx-4"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold flex items-center">
            <Type className="mr-2" size={20} />
            Edit Text
          </h3>
          <div className="flex space-x-2">
            <button
              onClick={onDelete}
              className="p-2 text-red-600 hover:bg-red-100 rounded"
              title="Delete text"
            >
              <Trash2 size={16} />
            </button>
            <button
              onClick={onClose}
              className="p-2 text-gray-600 hover:bg-gray-100 rounded"
            >
              <X size={16} />
            </button>
          </div>
        </div>

        {/* Text Input */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Text Content
          </label>
          <textarea
            value={localText}
            onChange={(e) => handleTextChange(e.target.value)}
            className="w-full p-3 border border-gray-300 rounded-lg resize-none"
            rows={3}
            placeholder="Enter your text here..."
            autoFocus
          />
        </div>

        {/* Style Controls */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Font Family */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Font Family
            </label>
            <select
              value={localStyle.fontFamily}
              onChange={(e) => handleStyleChange({ fontFamily: e.target.value })}
              className="w-full p-2 border border-gray-300 rounded"
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
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Font Size
            </label>
            <input
              type="number"
              value={localStyle.fontSize}
              onChange={(e) => handleStyleChange({ fontSize: parseInt(e.target.value) || 16 })}
              className="w-full p-2 border border-gray-300 rounded"
              min="8"
              max="200"
            />
          </div>

          {/* Font Weight */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Font Weight
            </label>
            <select
              value={localStyle.fontWeight}
              onChange={(e) => handleStyleChange({ fontWeight: parseInt(e.target.value) })}
              className="w-full p-2 border border-gray-300 rounded"
            >
              {fontWeights.map(weight => (
                <option key={weight.value} value={weight.value}>
                  {weight.label}
                </option>
              ))}
            </select>
          </div>

          {/* Text Color */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Text Color
            </label>
            <div className="flex items-center space-x-2">
              <input
                type="color"
                value={localStyle.fill}
                onChange={(e) => handleStyleChange({ fill: e.target.value })}
                className="w-10 h-10 border border-gray-300 rounded cursor-pointer"
              />
              <input
                type="text"
                value={localStyle.fill}
                onChange={(e) => handleStyleChange({ fill: e.target.value })}
                className="flex-1 p-2 border border-gray-300 rounded"
                placeholder="#000000"
              />
            </div>
          </div>
        </div>

        {/* Text Formatting Buttons */}
        <div className="mt-4 flex flex-wrap gap-2">
          <button
            onClick={() => handleStyleChange({ 
              fontWeight: localStyle.fontWeight === 700 ? 400 : 700 
            })}
            className={`p-2 rounded ${
              localStyle.fontWeight === 700 
                ? 'bg-blue-600 text-white' 
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
            title="Bold"
          >
            <Bold size={16} />
          </button>

          <button
            onClick={() => handleStyleChange({ 
              fontStyle: localStyle.fontStyle === 'italic' ? 'normal' : 'italic' 
            })}
            className={`p-2 rounded ${
              localStyle.fontStyle === 'italic' 
                ? 'bg-blue-600 text-white' 
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
            title="Italic"
          >
            <Italic size={16} />
          </button>

          <button
            onClick={() => handleStyleChange({ 
              textDecoration: localStyle.textDecoration === 'underline' ? 'none' : 'underline' 
            })}
            className={`p-2 rounded ${
              localStyle.textDecoration === 'underline' 
                ? 'bg-blue-600 text-white' 
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
            title="Underline"
          >
            <Underline size={16} />
          </button>

          {/* Text Alignment */}
          <div className="flex border border-gray-300 rounded overflow-hidden">
            <button
              onClick={() => handleStyleChange({ textAlign: 'left' })}
              className={`p-2 ${
                localStyle.textAlign === 'left' 
                  ? 'bg-blue-600 text-white' 
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
              title="Align Left"
            >
              <AlignLeft size={16} />
            </button>
            <button
              onClick={() => handleStyleChange({ textAlign: 'center' })}
              className={`p-2 ${
                localStyle.textAlign === 'center' 
                  ? 'bg-blue-600 text-white' 
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
              title="Align Center"
            >
              <AlignCenter size={16} />
            </button>
            <button
              onClick={() => handleStyleChange({ textAlign: 'right' })}
              className={`p-2 ${
                localStyle.textAlign === 'right' 
                  ? 'bg-blue-600 text-white' 
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
              title="Align Right"
            >
              <AlignRight size={16} />
            </button>
            <button
              onClick={() => handleStyleChange({ textAlign: 'justify' })}
              className={`p-2 ${
                localStyle.textAlign === 'justify' 
                  ? 'bg-blue-600 text-white' 
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
              title="Justify"
            >
              <AlignJustify size={16} />
            </button>
          </div>
        </div>

        {/* Advanced Options */}
        <div className="mt-4 grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Letter Spacing
            </label>
            <input
              type="number"
              value={localStyle.letterSpacing}
              onChange={(e) => handleStyleChange({ letterSpacing: parseFloat(e.target.value) || 0 })}
              className="w-full p-2 border border-gray-300 rounded"
              step="0.1"
              min="-5"
              max="10"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Line Height
            </label>
            <input
              type="number"
              value={localStyle.lineHeight}
              onChange={(e) => handleStyleChange({ lineHeight: parseFloat(e.target.value) || 1.2 })}
              className="w-full p-2 border border-gray-300 rounded"
              step="0.1"
              min="0.5"
              max="3"
            />
          </div>
        </div>

        {/* Actions */}
        <div className="mt-6 flex justify-end space-x-3">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-100 text-gray-700 rounded hover:bg-gray-200"
          >
            Close
          </button>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Apply Changes
          </button>
        </div>
      </div>
    </div>
  );
};
