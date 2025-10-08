/**
 * Professional Typography System
 * Comprehensive text styling and typography management
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
  Download,
  Upload,
  Save,
  RotateCcw,
  Eye,
  EyeOff,
  Copy,
  Check,
  X
} from 'lucide-react';
import FontManager, { Font } from './FontManager';

export interface TypographyStyle {
  id: string;
  name: string;
  fontFamily: string;
  fontSize: number;
  fontWeight: number;
  fontStyle: 'normal' | 'italic' | 'oblique';
  textDecoration: 'none' | 'underline' | 'line-through' | 'overline';
  textAlign: 'left' | 'center' | 'right' | 'justify';
  lineHeight: number;
  letterSpacing: number;
  wordSpacing: number;
  textTransform: 'none' | 'uppercase' | 'lowercase' | 'capitalize';
  color: string;
  backgroundColor: string;
  padding: number;
  margin: number;
  border: string;
  borderRadius: number;
  boxShadow: string;
  isDefault: boolean;
  isCustom: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface TypographySystemProps {
  currentStyle: TypographyStyle;
  onStyleChange: (style: TypographyStyle) => void;
  onClose?: () => void;
  className?: string;
}

const TypographySystem: React.FC<TypographySystemProps> = ({
  currentStyle,
  onStyleChange,
  onClose,
  className = ''
}) => {
  const [activeTab, setActiveTab] = useState<'fonts' | 'styles' | 'presets' | 'settings'>('fonts');
  const [showFontManager, setShowFontManager] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [styles, setStyles] = useState<TypographyStyle[]>([]);
  const [presets, setPresets] = useState<TypographyStyle[]>([]);
  const [copiedStyle, setCopiedStyle] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editingStyle, setEditingStyle] = useState<TypographyStyle | null>(null);
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Default typography presets
  const defaultPresets: TypographyStyle[] = [
    {
      id: 'heading-1',
      name: 'Heading 1',
      fontFamily: 'Arial, sans-serif',
      fontSize: 32,
      fontWeight: 700,
      fontStyle: 'normal',
      textDecoration: 'none',
      textAlign: 'left',
      lineHeight: 1.2,
      letterSpacing: -0.5,
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
    },
    {
      id: 'heading-2',
      name: 'Heading 2',
      fontFamily: 'Arial, sans-serif',
      fontSize: 24,
      fontWeight: 600,
      fontStyle: 'normal',
      textDecoration: 'none',
      textAlign: 'left',
      lineHeight: 1.3,
      letterSpacing: -0.25,
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
    },
    {
      id: 'body-text',
      name: 'Body Text',
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
      color: '#333333',
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
    },
    {
      id: 'caption',
      name: 'Caption',
      fontFamily: 'Arial, sans-serif',
      fontSize: 12,
      fontWeight: 400,
      fontStyle: 'normal',
      textDecoration: 'none',
      textAlign: 'left',
      lineHeight: 1.4,
      letterSpacing: 0.25,
      wordSpacing: 0,
      textTransform: 'none',
      color: '#666666',
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
    },
    {
      id: 'button-text',
      name: 'Button Text',
      fontFamily: 'Arial, sans-serif',
      fontSize: 14,
      fontWeight: 600,
      fontStyle: 'normal',
      textDecoration: 'none',
      textAlign: 'center',
      lineHeight: 1.2,
      letterSpacing: 0.5,
      wordSpacing: 0,
      textTransform: 'uppercase',
      color: '#ffffff',
      backgroundColor: '#007bff',
      padding: 8,
      margin: 0,
      border: 'none',
      borderRadius: 4,
      boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
      isDefault: true,
      isCustom: false,
      createdAt: new Date(),
      updatedAt: new Date()
    }
  ];

  // Initialize presets
  useEffect(() => {
    setPresets(defaultPresets);
  }, []);

  // Handle style change
  const handleStyleChange = useCallback((updates: Partial<TypographyStyle>) => {
    const updatedStyle = { ...currentStyle, ...updates, updatedAt: new Date() };
    onStyleChange(updatedStyle);
  }, [currentStyle, onStyleChange]);

  // Handle font select
  const handleFontSelect = useCallback((font: Font) => {
    handleStyleChange({ fontFamily: font.family });
    setShowFontManager(false);
  }, [handleStyleChange]);

  // Handle preset select
  const handlePresetSelect = useCallback((preset: TypographyStyle) => {
    onStyleChange(preset);
  }, [onStyleChange]);

  // Handle style save
  const handleStyleSave = useCallback(() => {
    if (!editingStyle) return;
    
    const newStyle = {
      ...editingStyle,
      id: editingStyle.id || `style-${Date.now()}`,
      isCustom: true,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    setStyles(prev => [newStyle, ...prev]);
    setEditingStyle(null);
    setIsEditing(false);
  }, [editingStyle]);

  // Handle style copy
  const handleStyleCopy = useCallback((style: TypographyStyle) => {
    const data = {
      name: style.name,
      fontFamily: style.fontFamily,
      fontSize: style.fontSize,
      fontWeight: style.fontWeight,
      fontStyle: style.fontStyle,
      textDecoration: style.textDecoration,
      textAlign: style.textAlign,
      lineHeight: style.lineHeight,
      letterSpacing: style.letterSpacing,
      wordSpacing: style.wordSpacing,
      textTransform: style.textTransform,
      color: style.color,
      backgroundColor: style.backgroundColor,
      padding: style.padding,
      margin: style.margin,
      border: style.border,
      borderRadius: style.borderRadius,
      boxShadow: style.boxShadow
    };
    
    navigator.clipboard.writeText(JSON.stringify(data, null, 2));
    setCopiedStyle(style.id);
    setTimeout(() => setCopiedStyle(null), 2000);
  }, []);

  // Handle style export
  const handleStyleExport = useCallback(() => {
    const data = {
      currentStyle,
      customStyles: styles,
      presets: presets,
      exportedAt: new Date().toISOString()
    };
    
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'typography-styles.json';
    a.click();
    URL.revokeObjectURL(url);
  }, [currentStyle, styles, presets]);

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
        
        if (data.customStyles) {
          setStyles(data.customStyles);
        }
        
        if (data.presets) {
          setPresets(data.presets);
        }
      } catch (error) {
        console.error('Failed to import typography styles:', error);
      }
    };
    reader.readAsText(file);
  }, [onStyleChange]);

  // Clear all styles
  const clearAllStyles = useCallback(() => {
    setStyles([]);
  }, []);

  // Reset to defaults
  const resetToDefaults = useCallback(() => {
    setStyles([]);
    setPresets(defaultPresets);
  }, []);

  return (
    <div className={`bg-white rounded-lg shadow-xl border border-gray-200 p-4 w-full max-w-6xl ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold flex items-center">
          <Type size={20} className="mr-2" />
          Typography System
        </h3>
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setShowSettings(!showSettings)}
            className="p-2 text-gray-500 hover:text-gray-700"
            title="Settings"
          >
            <Settings size={16} />
          </button>
          <button
            onClick={handleStyleExport}
            className="p-2 text-gray-500 hover:text-gray-700"
            title="Export styles"
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
            title="Import styles"
          >
            <Upload size={16} />
          </button>
          <button
            onClick={resetToDefaults}
            className="p-2 text-gray-500 hover:text-gray-700"
            title="Reset to defaults"
          >
            <RotateCcw size={16} />
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
          { id: 'fonts', label: 'Fonts', icon: Type },
          { id: 'styles', label: 'Styles', icon: Settings },
          { id: 'presets', label: 'Presets', icon: Save },
          { id: 'settings', label: 'Settings', icon: Settings }
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
        {/* Fonts Tab */}
        {activeTab === 'fonts' && (
          <div>
            <div className="flex items-center justify-between mb-4">
              <h4 className="font-medium">Font Management</h4>
              <button
                onClick={() => setShowFontManager(!showFontManager)}
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
              >
                {showFontManager ? 'Hide Font Manager' : 'Show Font Manager'}
              </button>
            </div>
            
            {showFontManager && (
              <FontManager
                onFontSelect={handleFontSelect}
                className="mb-4"
              />
            )}
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Font Family</label>
                <input
                  type="text"
                  value={currentStyle.fontFamily}
                  onChange={(e) => handleStyleChange({ fontFamily: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded text-sm"
                />
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
            </div>
          </div>
        )}

        {/* Styles Tab */}
        {activeTab === 'styles' && (
          <div>
            <div className="flex items-center justify-between mb-4">
              <h4 className="font-medium">Custom Styles</h4>
              <button
                onClick={() => {
                  setEditingStyle({ ...currentStyle, name: 'New Style' });
                  setIsEditing(true);
                }}
                className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
              >
                Create Style
              </button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {styles.map(style => (
                <div
                  key={style.id}
                  className="border border-gray-200 rounded-lg p-4 hover:border-gray-300 transition-colors"
                >
                  <div className="flex items-center justify-between mb-2">
                    <h5 className="font-medium text-sm">{style.name}</h5>
                    <div className="flex items-center space-x-1">
                      <button
                        onClick={() => handleStyleCopy(style)}
                        className="p-1 text-gray-500 hover:text-gray-700"
                        title="Copy style"
                      >
                        {copiedStyle === style.id ? <Check size={14} /> : <Copy size={14} />}
                      </button>
                      <button
                        onClick={() => onStyleChange(style)}
                        className="p-1 text-gray-500 hover:text-gray-700"
                        title="Apply style"
                      >
                        <Eye size={14} />
                      </button>
                    </div>
                  </div>
                  
                  <div
                    className="text-lg mb-2"
                    style={{
                      fontFamily: style.fontFamily,
                      fontSize: style.fontSize,
                      fontWeight: style.fontWeight,
                      fontStyle: style.fontStyle,
                      color: style.color,
                      textAlign: style.textAlign
                    }}
                  >
                    Sample Text
                  </div>
                  
                  <div className="text-xs text-gray-500">
                    {style.fontFamily} • {style.fontSize}px • {style.fontWeight}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Presets Tab */}
        {activeTab === 'presets' && (
          <div>
            <h4 className="font-medium mb-4">Typography Presets</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {presets.map(preset => (
                <div
                  key={preset.id}
                  className="border border-gray-200 rounded-lg p-4 hover:border-gray-300 transition-colors cursor-pointer"
                  onClick={() => handlePresetSelect(preset)}
                >
                  <div className="flex items-center justify-between mb-2">
                    <h5 className="font-medium text-sm">{preset.name}</h5>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleStyleCopy(preset);
                      }}
                      className="p-1 text-gray-500 hover:text-gray-700"
                      title="Copy preset"
                    >
                      {copiedStyle === preset.id ? <Check size={14} /> : <Copy size={14} />}
                    </button>
                  </div>
                  
                  <div
                    className="text-lg mb-2"
                    style={{
                      fontFamily: preset.fontFamily,
                      fontSize: preset.fontSize,
                      fontWeight: preset.fontWeight,
                      fontStyle: preset.fontStyle,
                      color: preset.color,
                      textAlign: preset.textAlign
                    }}
                  >
                    Sample Text
                  </div>
                  
                  <div className="text-xs text-gray-500">
                    {preset.fontFamily} • {preset.fontSize}px • {preset.fontWeight}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Settings Tab */}
        {activeTab === 'settings' && (
          <div>
            <h4 className="font-medium mb-4">Typography Settings</h4>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Font Weight</label>
                <select
                  value={currentStyle.fontWeight}
                  onChange={(e) => handleStyleChange({ fontWeight: parseInt(e.target.value) })}
                  className="w-full px-3 py-2 border border-gray-300 rounded text-sm"
                >
                  <option value={100}>100 - Thin</option>
                  <option value={200}>200 - Extra Light</option>
                  <option value={300}>300 - Light</option>
                  <option value={400}>400 - Normal</option>
                  <option value={500}>500 - Medium</option>
                  <option value={600}>600 - Semi Bold</option>
                  <option value={700}>700 - Bold</option>
                  <option value={800}>800 - Extra Bold</option>
                  <option value={900}>900 - Black</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Font Style</label>
                <select
                  value={currentStyle.fontStyle}
                  onChange={(e) => handleStyleChange({ fontStyle: e.target.value as any })}
                  className="w-full px-3 py-2 border border-gray-300 rounded text-sm"
                >
                  <option value="normal">Normal</option>
                  <option value="italic">Italic</option>
                  <option value="oblique">Oblique</option>
                </select>
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
                      onClick={() => handleStyleChange({ textAlign: align.value as any })}
                      className={`p-2 rounded ${currentStyle.textAlign === align.value ? 'bg-blue-100 text-blue-700' : 'text-gray-600 hover:text-gray-800'}`}
                      title={align.value}
                    >
                      <align.icon size={16} />
                    </button>
                  ))}
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Text Decoration</label>
                <div className="flex space-x-1">
                  {[
                    { value: 'none', icon: Type },
                    { value: 'underline', icon: Underline },
                    { value: 'line-through', icon: Strikethrough }
                  ].map(decoration => (
                    <button
                      key={decoration.value}
                      onClick={() => handleStyleChange({ textDecoration: decoration.value as any })}
                      className={`p-2 rounded ${currentStyle.textDecoration === decoration.value ? 'bg-blue-100 text-blue-700' : 'text-gray-600 hover:text-gray-800'}`}
                      title={decoration.value}
                    >
                      <decoration.icon size={16} />
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Style Editor Modal */}
      {isEditing && editingStyle && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-96">
            <h4 className="text-lg font-semibold mb-4">Edit Style</h4>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Style Name</label>
                <input
                  type="text"
                  value={editingStyle.name}
                  onChange={(e) => setEditingStyle({ ...editingStyle, name: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded text-sm"
                />
              </div>
              
              <div className="flex space-x-2">
                <button
                  onClick={handleStyleSave}
                  className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                >
                  Save
                </button>
                <button
                  onClick={() => {
                    setIsEditing(false);
                    setEditingStyle(null);
                  }}
                  className="px-4 py-2 bg-gray-300 text-gray-700 rounded hover:bg-gray-400"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TypographySystem;
