'use client';

import React, { useState } from 'react';
import { useEditor } from '../contexts/EditorContext';
import { ToolPanel } from './ToolPanel';
import { Eye } from 'lucide-react';
import AnimatedToolIcon from './AnimatedToolIcon';

const fontFamilies = {
  'Austin': {
    name: 'Austin',
    weights: [
      { name: 'Light', weight: 300, style: 'normal' },
      { name: 'Light Italic', weight: 300, style: 'italic' },
      { name: 'Roman', weight: 400, style: 'normal' },
      { name: 'Italic', weight: 400, style: 'italic' },
      { name: 'Medium', weight: 500, style: 'normal' },
      { name: 'Medium Italic', weight: 500, style: 'italic' },
      { name: 'Semibold', weight: 600, style: 'normal' },
      { name: 'Semibold Italic', weight: 600, style: 'italic' },
      { name: 'Bold', weight: 700, style: 'normal' },
      { name: 'Bold Italic', weight: 700, style: 'italic' },
      { name: 'Extrabold', weight: 800, style: 'normal' },
      { name: 'Extrabold Italic', weight: 800, style: 'italic' },
      { name: 'Ultra', weight: 900, style: 'normal' },
      { name: 'Ultra Italic', weight: 900, style: 'italic' },
      { name: 'Fat', weight: 950, style: 'normal' },
      { name: 'Fat Italic', weight: 950, style: 'italic' },
    ]
  },
  'Austin Hairline': {
    name: 'Austin Hairline',
    weights: [
      { name: 'Light', weight: 300, style: 'normal' },
      { name: 'Light Italic', weight: 300, style: 'italic' },
      { name: 'Roman', weight: 400, style: 'normal' },
      { name: 'Italic', weight: 400, style: 'italic' },
      { name: 'Medium', weight: 500, style: 'normal' },
      { name: 'Medium Italic', weight: 500, style: 'italic' },
      { name: 'Semibold', weight: 600, style: 'normal' },
      { name: 'Semibold Italic', weight: 600, style: 'italic' },
      { name: 'Bold', weight: 700, style: 'normal' },
      { name: 'Bold Italic', weight: 700, style: 'italic' },
      { name: 'Extrabold', weight: 800, style: 'normal' },
      { name: 'Extrabold Italic', weight: 800, style: 'italic' },
      { name: 'Ultra', weight: 900, style: 'normal' },
      { name: 'Ultra Italic', weight: 900, style: 'italic' },
      { name: 'Fat', weight: 950, style: 'normal' },
      { name: 'Fat Italic', weight: 950, style: 'italic' },
    ]
  },
  'Austin Text': {
    name: 'Austin Text',
    weights: [
      { name: 'Roman', weight: 400, style: 'normal' },
      { name: 'Italic', weight: 400, style: 'italic' },
      { name: 'Semibold', weight: 600, style: 'normal' },
      { name: 'Semibold Italic', weight: 600, style: 'italic' },
      { name: 'Bold', weight: 700, style: 'normal' },
      { name: 'Bold Italic', weight: 700, style: 'italic' },
      { name: 'Fat', weight: 900, style: 'normal' },
      { name: 'Fat Italic', weight: 900, style: 'italic' },
    ]
  },
  'Heading Pro': {
    name: 'Heading Pro',
    weights: [
      { name: 'Thin', weight: 100, style: 'normal' },
      { name: 'Extra Light', weight: 200, style: 'normal' },
      { name: 'Light', weight: 300, style: 'normal' },
      { name: 'Regular', weight: 400, style: 'normal' },
      { name: 'Book', weight: 450, style: 'normal' },
      { name: 'Bold', weight: 700, style: 'normal' },
      { name: 'Extra Bold', weight: 800, style: 'normal' },
      { name: 'Heavy', weight: 900, style: 'normal' },
    ]
  },
  'Swear Text': {
    name: 'Swear Text',
    weights: [
      { name: 'Thin', weight: 100, style: 'normal' },
      { name: 'Thin Italic', weight: 100, style: 'italic' },
      { name: 'Thin Cilati', weight: 100, style: 'normal', variant: 'cilati' },
      { name: 'Light', weight: 300, style: 'normal' },
      { name: 'Light Italic', weight: 300, style: 'italic' },
      { name: 'Light Cilati', weight: 300, style: 'normal', variant: 'cilati' },
      { name: 'Regular', weight: 400, style: 'normal' },
      { name: 'Italic', weight: 400, style: 'italic' },
      { name: 'Cilati', weight: 400, style: 'normal', variant: 'cilati' },
      { name: 'Medium', weight: 500, style: 'normal' },
      { name: 'Medium Italic', weight: 500, style: 'italic' },
      { name: 'Medium Cilati', weight: 500, style: 'normal', variant: 'cilati' },
      { name: 'Bold', weight: 700, style: 'normal' },
      { name: 'Bold Italic', weight: 700, style: 'italic' },
      { name: 'Bold Cilati', weight: 700, style: 'normal', variant: 'cilati' },
      { name: 'Black', weight: 900, style: 'normal' },
      { name: 'Black Italic', weight: 900, style: 'italic' },
      { name: 'Black Cilati', weight: 900, style: 'normal', variant: 'cilati' },
    ]
  }
};

const defaultText = "The quick brown fox jumps over the lazy dog";

export function FontPreviewPanel() {
  const { state, actions } = useEditor();
  const [activeTab, setActiveTab] = useState('Austin');
  const [fontSize, setFontSize] = useState(32);
  const [customText, setCustomText] = useState(defaultText);
  const [copiedPath, setCopiedPath] = useState('');

  const openPanel = () => {
    actions.openToolPanel('font-preview', { x: 100, y: 100 });
  };

  const handleClose = () => {
    actions.closeToolPanel('font-preview');
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedPath(text);
    setTimeout(() => setCopiedPath(''), 2000);
  };

  const generateCSSPath = (fontFamily: string, weight: number, style: string, variant?: string) => {
    const family = variant === 'cilati' ? `${fontFamily} Cilati` : fontFamily;
    return `font-family: "${family}"; font-weight: ${weight}; font-style: ${style};`;
  };

  const currentFamily = fontFamilies[activeTab as keyof typeof fontFamilies];

  return (
    <>
      <button
        onClick={openPanel}
        className="toolbar-button w-12 h-12 rounded-lg flex items-center justify-center"
        title="Font Preview"
      >
        <AnimatedToolIcon
          icon={Eye}
          animation="float"
          size="md"
          tooltip="Font Preview"
        />
      </button>

      {state.toolPanels['font-preview']?.isOpen && (
        <ToolPanel toolId="font-preview" title="Font Preview" className="w-[800px] h-[600px]">
          <div className="h-full overflow-y-auto bg-gray-50">
            <div className="p-6">
              <h1 className="text-2xl font-bold mb-6 text-center text-gray-800">Font Preview</h1>
              
              {/* Tabs */}
              <div className="flex border-b border-gray-200 mb-6 overflow-x-auto">
                {Object.keys(fontFamilies).map((fontKey) => (
                  <button
                    key={fontKey}
                    onClick={() => setActiveTab(fontKey)}
                    className={`px-4 py-2 font-medium text-sm border-b-2 transition-colors whitespace-nowrap ${
                      activeTab === fontKey
                        ? 'border-blue-500 text-blue-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700'
                    }`}
                  >
                    {fontKey}
                  </button>
                ))}
              </div>

              {/* Controls */}
              <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Font Size Slider */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Font Size: {fontSize}px
                    </label>
                    <input
                      type="range"
                      min="12"
                      max="72"
                      value={fontSize}
                      onChange={(e) => setFontSize(Number(e.target.value))}
                      className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                    />
                  </div>

                  {/* Custom Text Input */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Custom Text
                    </label>
                    <input
                      type="text"
                      value={customText}
                      onChange={(e) => setCustomText(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Type your text here..."
                    />
                  </div>
                </div>
              </div>

              {/* Font Weights Display */}
              <div className="bg-white rounded-lg shadow-sm p-4">
                <h2 className="text-xl font-bold mb-4 text-gray-800">
                  {currentFamily.name}
                </h2>
                
                <div className="space-y-4">
                  {currentFamily.weights.map((weight) => (
                    <div key={`${currentFamily.name}-${weight.name}`} className="border-b border-gray-100 pb-4">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center space-x-3">
                          <span className="text-sm font-medium text-gray-900">
                            {weight.name}
                          </span>
                          <span className="text-xs text-gray-500 font-mono">
                            {weight.weight} {weight.style}
                          </span>
                        </div>
                        
                        <button
                          onClick={() => copyToClipboard(generateCSSPath(currentFamily.name, weight.weight, weight.style, (weight as any).variant))}
                          className="px-2 py-1 text-xs bg-gray-100 hover:bg-gray-200 rounded transition-colors"
                        >
                          {copiedPath === generateCSSPath(currentFamily.name, weight.weight, weight.style, (weight as any).variant) ? 'Copied!' : 'Copy CSS'}
                        </button>
                      </div>
                      
                      <p 
                        style={{
                          fontFamily: (weight as any).variant === 'cilati' ? `"${currentFamily.name} Cilati"` : `"${currentFamily.name}"`,
                          fontWeight: weight.weight,
                          fontStyle: weight.style,
                          fontSize: `${fontSize}px`,
                          lineHeight: '1.4',
                          color: '#1f2937'
                        }}
                      >
                        {customText}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </ToolPanel>
      )}
    </>
  );
}
