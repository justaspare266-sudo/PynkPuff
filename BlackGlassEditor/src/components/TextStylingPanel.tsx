/**
 * Professional Text Styling Panel
 * Real-time text styling controls with live preview
 */

import React, { useState, useCallback, useRef, useEffect } from 'react';
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
  List,
  ListOrdered,
  Quote,
  Code,
  Link,
  Palette,
  Settings,
  Eye,
  EyeOff,
  Copy,
  Check,
  RotateCcw,
  Save,
  Download,
  Upload,
  X
} from 'lucide-react';
import { TypographyStyle } from './TypographySystem';

export interface TextStylingPanelProps {
  currentStyle: TypographyStyle;
  onStyleChange: (style: TypographyStyle) => void;
  onClose?: () => void;
  className?: string;
}

const TextStylingPanel: React.FC<TextStylingPanelProps> = ({
  currentStyle,
  onStyleChange,
  onClose,
  className = ''
}) => {
  const [activeTab, setActiveTab] = useState<'basic' | 'advanced' | 'effects' | 'spacing'>('basic');
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [showFontManager, setShowFontManager] = useState(false);
  const [copiedStyle, setCopiedStyle] = useState<string | null>(null);
  const [isPreviewMode, setIsPreviewMode] = useState(true);
  
  const colorInputRef = useRef<HTMLInputElement>(null);

  // Handle style change
  const handleStyleChange = useCallback((updates: Partial<TypographyStyle>) => {
    const updatedStyle = { ...currentStyle, ...updates, updatedAt: new Date() };
    onStyleChange(updatedStyle);
  }, [currentStyle, onStyleChange]);

  // Handle font weight toggle
  const handleFontWeightToggle = useCallback(() => {
    const newWeight = currentStyle.fontWeight === 700 ? 400 : 700;
    handleStyleChange({ fontWeight: newWeight });
  }, [currentStyle.fontWeight, handleStyleChange]);

  // Handle font style toggle
  const handleFontStyleToggle = useCallback(() => {
    const newStyle = currentStyle.fontStyle === 'italic' ? 'normal' : 'italic';
    handleStyleChange({ fontStyle: newStyle });
  }, [currentStyle.fontStyle, handleStyleChange]);

  // Handle text decoration toggle
  const handleTextDecorationToggle = useCallback((decoration: 'underline' | 'line-through') => {
    const newDecoration = currentStyle.textDecoration === decoration ? 'none' : decoration;
    handleStyleChange({ textDecoration: newDecoration });
  }, [currentStyle.textDecoration, handleStyleChange]);

  // Handle text align change
  const handleTextAlignChange = useCallback((align: 'left' | 'center' | 'right' | 'justify') => {
    handleStyleChange({ textAlign: align });
  }, [handleStyleChange]);

  // Handle color change
  const handleColorChange = useCallback((color: string) => {
    handleStyleChange({ color });
    setShowColorPicker(false);
  }, [handleStyleChange]);

  // Handle background color change
  const handleBackgroundColorChange = useCallback((color: string) => {
    handleStyleChange({ backgroundColor: color });
  }, [handleStyleChange]);

  // Handle style copy
  const handleStyleCopy = useCallback(() => {
    const data = {
      fontFamily: currentStyle.fontFamily,
      fontSize: currentStyle.fontSize,
      fontWeight: currentStyle.fontWeight,
      fontStyle: currentStyle.fontStyle,
      textDecoration: currentStyle.textDecoration,
      textAlign: currentStyle.textAlign,
      lineHeight: currentStyle.lineHeight,
      letterSpacing: currentStyle.letterSpacing,
      wordSpacing: currentStyle.wordSpacing,
      textTransform: currentStyle.textTransform,
      color: currentStyle.color,
      backgroundColor: currentStyle.backgroundColor
    };
    
    navigator.clipboard.writeText(JSON.stringify(data, null, 2));
    setCopiedStyle('current');
    setTimeout(() => setCopiedStyle(null), 2000);
  }, [currentStyle]);

  // Handle style reset
  const handleStyleReset = useCallback(() => {
    const defaultStyle: TypographyStyle = {
      id: 'default',
      name: 'Default',
      fontFamily: 'Arial, sans-serif',
      fontSize: 16,
      fontWeight: 400,
      fontStyle: 'normal',
      textDecoration: 'none',
      textAlign: 'left',
      lineHeight: 1.5,
      letterSpacing: 0,
      wordSpacing: 0,
      textTransform: 'none',
      color: '#000000',
      backgroundColor: 'transparent',
      padding: 0,
      margin: 0,
      border: 'none',
      borderRadius: 0,
      boxShadow: 'none',
      isDefault: true,
      isCustom: false,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    onStyleChange(defaultStyle);
  }, [onStyleChange]);

  // Handle style export
  const handleStyleExport = useCallback(() => {
    const data = {
      currentStyle,
      exportedAt: new Date().toISOString()
    };
    
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'text-style.json';
    a.click();
    URL.revokeObjectURL(url);
  }, [currentStyle]);

  // Handle style import
  const handleStyleImport = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = JSON.parse(e.target?.result as string);
        if (data.currentStyle) {
          onStyleChange(data.currentStyle);
        }
      } catch (error) {
        console.error('Failed to import text style:', error);
      }
    };
    reader.readAsText(file);
  }, [onStyleChange]);

  const fileInputRef = useRef<HTMLInputElement>(null);

  return (
    <div className={`bg-white rounded-lg shadow-xl border border-gray-200 p-4 w-full max-w-4xl ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold flex items-center">
          <Type size={20} className="mr-2" />
          Text Styling
        </h3>
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setIsPreviewMode(!isPreviewMode)}
            className={`p-2 rounded ${isPreviewMode ? 'bg-blue-100 text-blue-700' : 'text-gray-500 hover:text-gray-700'}`}
            title="Toggle preview"
          >
            {isPreviewMode ? <Eye size={16} /> : <EyeOff size={16} />}
          </button>
          <button
            onClick={handleStyleCopy}
            className="p-2 text-gray-500 hover:text-gray-700"
            title="Copy style"
          >
            {copiedStyle === 'current' ? <Check size={16} /> : <Copy size={16} />}
          </button>
          <button
            onClick={handleStyleReset}
            className="p-2 text-gray-500 hover:text-gray-700"
            title="Reset style"
          >
            <RotateCcw size={16} />
          </button>
          <button
            onClick={handleStyleExport}
            className="p-2 text-gray-500 hover:text-gray-700"
            title="Export style"
          >
            <Download size={16} />
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept=".json"
            onChange={handleStyleImport}
            className="hidden"
          />
          <button
            onClick={() => fileInputRef.current?.click()}
            className="p-2 text-gray-500 hover:text-gray-700"
            title="Import style"
          >
            <Upload size={16} />
          </button>
          {onClose && (
            <button
              onClick={onClose}
              className="p-2 text-gray-500 hover:text-gray-700"
            >
              <X size={16} />
            </button>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex space-x-1 mb-4">
        {[
          { id: 'basic', label: 'Basic', icon: Type },
          { id: 'advanced', label: 'Advanced', icon: Settings },
          { id: 'effects', label: 'Effects', icon: Palette },
          { id: 'spacing', label: 'Spacing', icon: Settings }
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`flex items-center space-x-2 px-4 py-2 rounded text-sm ${
              activeTab === tab.id 
                ? 'bg-blue-100 text-blue-700' 
                : 'text-gray-600 hover:text-gray-800'
            }`}
          >
            <tab.icon size={16} />
            <span>{tab.label}</span>
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="space-y-4">
        {/* Basic Tab */}
        {activeTab === 'basic' && (
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Font Family</label>
              <div className="flex space-x-2">
                <input
                  type="text"
                  value={currentStyle.fontFamily}
                  onChange={(e) => handleStyleChange({ fontFamily: e.target.value })}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded text-sm"
                />
                <button
                  onClick={() => setShowFontManager(!showFontManager)}
                  className="px-3 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                >
                  Fonts
                </button>
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Font Size</label>
              <input
                type="number"
                value={currentStyle.fontSize}
                onChange={(e) => handleStyleChange({ fontSize: parseInt(e.target.value) })}
                className="w-full px-3 py-2 border border-gray-300 rounded text-sm"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Font Weight</label>
              <div className="flex space-x-1">
                <button
                  onClick={handleFontWeightToggle}
                  className={`p-2 rounded ${currentStyle.fontWeight === 700 ? 'bg-blue-100 text-blue-700' : 'text-gray-600 hover:text-gray-800'}`}
                  title="Bold"
                >
                  <Bold size={16} />
                </button>
                <select
                  value={currentStyle.fontWeight}
                  onChange={(e) => handleStyleChange({ fontWeight: parseInt(e.target.value) })}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded text-sm"
                >
                  <option value={100}>100</option>
                  <option value={200}>200</option>
                  <option value={300}>300</option>
                  <option value={400}>400</option>
                  <option value={500}>500</option>
                  <option value={600}>600</option>
                  <option value={700}>700</option>
                  <option value={800}>800</option>
                  <option value={900}>900</option>
                </select>
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Font Style</label>
              <div className="flex space-x-1">
                <button
                  onClick={handleFontStyleToggle}
                  className={`p-2 rounded ${currentStyle.fontStyle === 'italic' ? 'bg-blue-100 text-blue-700' : 'text-gray-600 hover:text-gray-800'}`}
                  title="Italic"
                >
                  <Italic size={16} />
                </button>
                <select
                  value={currentStyle.fontStyle}
                  onChange={(e) => handleStyleChange({ fontStyle: e.target.value as any })}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded text-sm"
                >
                  <option value="normal">Normal</option>
                  <option value="italic">Italic</option>
                  <option value="oblique">Oblique</option>
                </select>
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Text Decoration</label>
              <div className="flex space-x-1">
                <button
                  onClick={() => handleTextDecorationToggle('underline')}
                  className={`p-2 rounded ${currentStyle.textDecoration === 'underline' ? 'bg-blue-100 text-blue-700' : 'text-gray-600 hover:text-gray-800'}`}
                  title="Underline"
                >
                  <Underline size={16} />
                </button>
                <button
                  onClick={() => handleTextDecorationToggle('line-through')}
                  className={`p-2 rounded ${currentStyle.textDecoration === 'line-through' ? 'bg-blue-100 text-blue-700' : 'text-gray-600 hover:text-gray-800'}`}
                  title="Strikethrough"
                >
                  <Strikethrough size={16} />
                </button>
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Text Align</label>
              <div className="flex space-x-1">
                {[
                  { value: 'left', icon: AlignLeft },
                  { value: 'center', icon: AlignCenter },
                  { value: 'right', icon: AlignRight },
                  { value: 'justify', icon: AlignJustify }
                ].map(align => (
                  <button
                    key={align.value}
                    onClick={() => handleTextAlignChange(align.value as any)}
                    className={`p-2 rounded ${currentStyle.textAlign === align.value ? 'bg-blue-100 text-blue-700' : 'text-gray-600 hover:text-gray-800'}`}
                    title={align.value}
                  >
                    <align.icon size={16} />
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Advanced Tab */}
        {activeTab === 'advanced' && (
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Text Transform</label>
              <select
                value={currentStyle.textTransform}
                onChange={(e) => handleStyleChange({ textTransform: e.target.value as any })}
                className="w-full px-3 py-2 border border-gray-300 rounded text-sm"
              >
                <option value="none">None</option>
                <option value="uppercase">Uppercase</option>
                <option value="lowercase">Lowercase</option>
                <option value="capitalize">Capitalize</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Line Height</label>
              <input
                type="number"
                step="0.1"
                value={currentStyle.lineHeight}
                onChange={(e) => handleStyleChange({ lineHeight: parseFloat(e.target.value) })}
                className="w-full px-3 py-2 border border-gray-300 rounded text-sm"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Letter Spacing</label>
              <input
                type="number"
                step="0.1"
                value={currentStyle.letterSpacing}
                onChange={(e) => handleStyleChange({ letterSpacing: parseFloat(e.target.value) })}
                className="w-full px-3 py-2 border border-gray-300 rounded text-sm"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Word Spacing</label>
              <input
                type="number"
                step="0.1"
                value={currentStyle.wordSpacing}
                onChange={(e) => handleStyleChange({ wordSpacing: parseFloat(e.target.value) })}
                className="w-full px-3 py-2 border border-gray-300 rounded text-sm"
              />
            </div>
          </div>
        )}

        {/* Effects Tab */}
        {activeTab === 'effects' && (
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Text Color</label>
              <div className="flex space-x-2">
                <input
                  ref={colorInputRef}
                  type="color"
                  value={currentStyle.color}
                  onChange={(e) => handleColorChange(e.target.value)}
                  className="w-12 h-10 border border-gray-300 rounded cursor-pointer"
                />
                <input
                  type="text"
                  value={currentStyle.color}
                  onChange={(e) => handleColorChange(e.target.value)}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded text-sm"
                />
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Background Color</label>
              <div className="flex space-x-2">
                <input
                  type="color"
                  value={currentStyle.backgroundColor}
                  onChange={(e) => handleBackgroundColorChange(e.target.value)}
                  className="w-12 h-10 border border-gray-300 rounded cursor-pointer"
                />
                <input
                  type="text"
                  value={currentStyle.backgroundColor}
                  onChange={(e) => handleBackgroundColorChange(e.target.value)}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded text-sm"
                />
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Border</label>
              <input
                type="text"
                value={currentStyle.border}
                onChange={(e) => handleStyleChange({ border: e.target.value })}
                placeholder="e.g., 1px solid #000"
                className="w-full px-3 py-2 border border-gray-300 rounded text-sm"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Border Radius</label>
              <input
                type="number"
                value={currentStyle.borderRadius}
                onChange={(e) => handleStyleChange({ borderRadius: parseInt(e.target.value) })}
                className="w-full px-3 py-2 border border-gray-300 rounded text-sm"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Box Shadow</label>
              <input
                type="text"
                value={currentStyle.boxShadow}
                onChange={(e) => handleStyleChange({ boxShadow: e.target.value })}
                placeholder="e.g., 0 2px 4px rgba(0,0,0,0.1)"
                className="w-full px-3 py-2 border border-gray-300 rounded text-sm"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Padding</label>
              <input
                type="number"
                value={currentStyle.padding}
                onChange={(e) => handleStyleChange({ padding: parseInt(e.target.value) })}
                className="w-full px-3 py-2 border border-gray-300 rounded text-sm"
              />
            </div>
          </div>
        )}

        {/* Spacing Tab */}
        {activeTab === 'spacing' && (
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Line Height</label>
              <input
                type="number"
                step="0.1"
                value={currentStyle.lineHeight}
                onChange={(e) => handleStyleChange({ lineHeight: parseFloat(e.target.value) })}
                className="w-full px-3 py-2 border border-gray-300 rounded text-sm"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Letter Spacing</label>
              <input
                type="number"
                step="0.1"
                value={currentStyle.letterSpacing}
                onChange={(e) => handleStyleChange({ letterSpacing: parseFloat(e.target.value) })}
                className="w-full px-3 py-2 border border-gray-300 rounded text-sm"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Word Spacing</label>
              <input
                type="number"
                step="0.1"
                value={currentStyle.wordSpacing}
                onChange={(e) => handleStyleChange({ wordSpacing: parseFloat(e.target.value) })}
                className="w-full px-3 py-2 border border-gray-300 rounded text-sm"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Padding</label>
              <input
                type="number"
                value={currentStyle.padding}
                onChange={(e) => handleStyleChange({ padding: parseInt(e.target.value) })}
                className="w-full px-3 py-2 border border-gray-300 rounded text-sm"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Margin</label>
              <input
                type="number"
                value={currentStyle.margin}
                onChange={(e) => handleStyleChange({ margin: parseInt(e.target.value) })}
                className="w-full px-3 py-2 border border-gray-300 rounded text-sm"
              />
            </div>
          </div>
        )}
      </div>

      {/* Live Preview */}
      {isPreviewMode && (
        <div className="mt-6 p-4 bg-gray-50 rounded-lg">
          <h4 className="text-sm font-medium text-gray-700 mb-2">Live Preview</h4>
          <div
            className="text-lg"
            style={{
              fontFamily: currentStyle.fontFamily,
              fontSize: currentStyle.fontSize,
              fontWeight: currentStyle.fontWeight,
              fontStyle: currentStyle.fontStyle,
              textDecoration: currentStyle.textDecoration,
              textAlign: currentStyle.textAlign,
              lineHeight: currentStyle.lineHeight,
              letterSpacing: currentStyle.letterSpacing,
              wordSpacing: currentStyle.wordSpacing,
              textTransform: currentStyle.textTransform,
              color: currentStyle.color,
              backgroundColor: currentStyle.backgroundColor,
              padding: currentStyle.padding,
              margin: currentStyle.margin,
              border: currentStyle.border,
              borderRadius: currentStyle.borderRadius,
              boxShadow: currentStyle.boxShadow
            }}
          >
            The quick brown fox jumps over the lazy dog
          </div>
        </div>
      )}
    </div>
  );
};

export default TextStylingPanel;
