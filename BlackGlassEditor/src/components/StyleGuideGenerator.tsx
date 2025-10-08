import React, { useState, useEffect } from 'react';
import { Palette, Type, Ruler, Download, Eye, Copy, Sparkles, BookOpen } from 'lucide-react';
import { sanitizeHtml } from '../utils/security';

interface ColorPalette {
  primary: string[];
  secondary: string[];
  neutral: string[];
  accent: string[];
}

interface Typography {
  headings: {
    family: string;
    weights: number[];
    sizes: number[];
  };
  body: {
    family: string;
    weights: number[];
    sizes: number[];
  };
  display: {
    family: string;
    weights: number[];
    sizes: number[];
  };
}

interface Spacing {
  base: number;
  scale: number[];
  grid: number;
}

interface StyleGuide {
  id: string;
  name: string;
  colors: ColorPalette;
  typography: Typography;
  spacing: Spacing;
  borderRadius: number[];
  shadows: string[];
  brandElements: {
    logo?: string;
    patterns: string[];
    textures: string[];
  };
  usage: {
    doAndDont: Array<{ do: string; dont: string; example?: string }>;
    examples: Array<{ name: string; preview: string; code: string }>;
  };
  generatedAt: Date;
  aiAnalysis: {
    consistency: number;
    accessibility: number;
    modernness: number;
    suggestions: string[];
  };
}

interface StyleGuideGeneratorProps {
  projectData: any;
  onApplyStyleGuide: (styleGuide: StyleGuide) => void;
  onClose: () => void;
}

export const StyleGuideGenerator: React.FC<StyleGuideGeneratorProps> = ({
  projectData,
  onApplyStyleGuide,
  onClose
}) => {
  const [styleGuide, setStyleGuide] = useState<StyleGuide | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [selectedTab, setSelectedTab] = useState<'colors' | 'typography' | 'spacing' | 'components' | 'usage'>('colors');
  const [showPreview, setShowPreview] = useState(false);

  useEffect(() => {
    generateStyleGuide();
  }, [projectData]);

  const generateStyleGuide = async () => {
    setIsGenerating(true);

    try {
      // Simulate AI analysis and generation
      await new Promise(resolve => setTimeout(resolve, 2000));

      const generated: StyleGuide = {
        id: `style-guide-${Date.now()}`,
        name: `${projectData.name || 'Project'} Style Guide`,
        colors: extractColorPalette(),
        typography: analyzeTypography(),
        spacing: calculateSpacing(),
        borderRadius: [0, 4, 8, 12, 16, 24],
        shadows: [
          '0 1px 3px rgba(0,0,0,0.12)',
          '0 4px 6px rgba(0,0,0,0.1)',
          '0 10px 15px rgba(0,0,0,0.1)',
          '0 20px 25px rgba(0,0,0,0.15)'
        ],
        brandElements: {
          patterns: ['geometric', 'organic', 'minimal'],
          textures: ['smooth', 'subtle-grain', 'paper']
        },
        usage: generateUsageGuidelines(),
        generatedAt: new Date(),
        aiAnalysis: {
          consistency: 87,
          accessibility: 92,
          modernness: 78,
          suggestions: [
            'Consider increasing contrast ratio for better accessibility',
            'Add more spacing variations for better hierarchy',
            'Include dark mode color variants'
          ]
        }
      };

      setStyleGuide(generated);
    } catch (error) {
      console.error('Style guide generation failed:', error);
    } finally {
      setIsGenerating(false);
    }
  };

  const extractColorPalette = (): ColorPalette => {
    // Mock color extraction from project
    return {
      primary: ['#3B82F6', '#1D4ED8', '#1E40AF', '#1E3A8A'],
      secondary: ['#10B981', '#059669', '#047857', '#065F46'],
      neutral: ['#F9FAFB', '#F3F4F6', '#E5E7EB', '#D1D5DB', '#9CA3AF', '#6B7280', '#374151', '#1F2937'],
      accent: ['#F59E0B', '#D97706', '#B45309', '#92400E']
    };
  };

  const analyzeTypography = (): Typography => {
    return {
      headings: {
        family: 'Inter',
        weights: [400, 500, 600, 700],
        sizes: [48, 36, 30, 24, 20, 18]
      },
      body: {
        family: 'Inter',
        weights: [400, 500],
        sizes: [16, 14, 12]
      },
      display: {
        family: 'Inter',
        weights: [700, 800, 900],
        sizes: [72, 60, 48]
      }
    };
  };

  const calculateSpacing = (): Spacing => {
    return {
      base: 4,
      scale: [4, 8, 12, 16, 20, 24, 32, 40, 48, 64, 80, 96],
      grid: 8
    };
  };

  const generateUsageGuidelines = () => {
    return {
      doAndDont: [
        {
          do: 'Use primary colors for main actions and important elements',
          dont: 'Overuse bright colors that can cause visual fatigue',
          example: 'Primary button vs. colorful background'
        },
        {
          do: 'Maintain consistent spacing using the 8px grid system',
          dont: 'Use random spacing values that break visual rhythm',
          example: 'Consistent vs. inconsistent spacing'
        },
        {
          do: 'Use typography hierarchy to guide user attention',
          dont: 'Make all text the same size and weight',
          example: 'Clear hierarchy vs. flat typography'
        }
      ],
      examples: [
        {
          name: 'Button Styles',
          preview: '/style-guide/buttons.png',
          code: '.btn-primary { background: #3B82F6; color: white; padding: 12px 24px; border-radius: 8px; }'
        },
        {
          name: 'Card Component',
          preview: '/style-guide/cards.png',
          code: '.card { background: white; border-radius: 12px; box-shadow: 0 4px 6px rgba(0,0,0,0.1); padding: 24px; }'
        }
      ]
    };
  };

  const exportStyleGuide = () => {
    if (!styleGuide) return;

    const exportData = {
      ...styleGuide,
      css: generateCSS(),
      json: JSON.stringify(styleGuide, null, 2),
      figmaTokens: generateFigmaTokens()
    };

    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${styleGuide.name.replace(/\s+/g, '-').toLowerCase()}-style-guide.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const generateCSS = () => {
    if (!styleGuide) return '';

    return `
/* ${styleGuide.name} - Generated Style Guide */

:root {
  /* Colors */
  --color-primary-50: ${styleGuide.colors.primary[0]};
  --color-primary-500: ${styleGuide.colors.primary[1]};
  --color-primary-900: ${styleGuide.colors.primary[3]};
  
  /* Typography */
  --font-family-heading: ${styleGuide.typography.headings.family};
  --font-family-body: ${styleGuide.typography.body.family};
  
  /* Spacing */
  --spacing-xs: ${styleGuide.spacing.scale[0]}px;
  --spacing-sm: ${styleGuide.spacing.scale[1]}px;
  --spacing-md: ${styleGuide.spacing.scale[2]}px;
  --spacing-lg: ${styleGuide.spacing.scale[3]}px;
  
  /* Border Radius */
  --radius-sm: ${styleGuide.borderRadius[1]}px;
  --radius-md: ${styleGuide.borderRadius[2]}px;
  --radius-lg: ${styleGuide.borderRadius[3]}px;
  
  /* Shadows */
  --shadow-sm: ${styleGuide.shadows[0]};
  --shadow-md: ${styleGuide.shadows[1]};
  --shadow-lg: ${styleGuide.shadows[2]};
}
    `.trim();
  };

  const generateFigmaTokens = () => {
    if (!styleGuide) return {};

    return {
      color: {
        primary: Object.fromEntries(
          styleGuide.colors.primary.map((color, index) => [`${(index + 1) * 100}`, { value: color }])
        ),
        neutral: Object.fromEntries(
          styleGuide.colors.neutral.map((color, index) => [`${(index + 1) * 100}`, { value: color }])
        )
      },
      spacing: Object.fromEntries(
        styleGuide.spacing.scale.map((value, index) => [`${index + 1}`, { value: `${value}px` }])
      ),
      borderRadius: Object.fromEntries(
        styleGuide.borderRadius.map((value, index) => [`${index + 1}`, { value: `${value}px` }])
      )
    };
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  if (isGenerating) {
    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg shadow-xl p-8 max-w-md w-full mx-4">
          <div className="text-center">
            <div className="animate-spin w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full mx-auto mb-4"></div>
            <h3 className="text-lg font-medium mb-2">Generating Style Guide</h3>
            <p className="text-gray-500">AI is analyzing your design and creating comprehensive guidelines...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!styleGuide) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-[95vw] h-[90vh] max-w-7xl flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b">
          <div>
            <h2 className="text-xl font-semibold flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-indigo-600" />
              {sanitizeHtml(styleGuide.name)}
            </h2>
            <p className="text-sm text-gray-500">
              Generated {styleGuide.generatedAt.toLocaleDateString()} • 
              Consistency: {styleGuide.aiAnalysis.consistency}% • 
              Accessibility: {styleGuide.aiAnalysis.accessibility}%
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowPreview(!showPreview)}
              className="px-3 py-1.5 border rounded hover:bg-gray-50 flex items-center gap-1"
            >
              <Eye className="w-4 h-4" />
              Preview
            </button>
            <button
              onClick={exportStyleGuide}
              className="px-3 py-1.5 bg-indigo-500 text-white rounded hover:bg-indigo-600 flex items-center gap-1"
            >
              <Download className="w-4 h-4" />
              Export
            </button>
            <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded">×</button>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex border-b bg-gray-50">
          {[
            { id: 'colors', name: 'Colors', icon: Palette },
            { id: 'typography', name: 'Typography', icon: Type },
            { id: 'spacing', name: 'Spacing', icon: Ruler },
            { id: 'components', name: 'Components', icon: Sparkles },
            { id: 'usage', name: 'Usage', icon: BookOpen }
          ].map(tab => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setSelectedTab(tab.id as any)}
                className={`flex items-center gap-2 px-4 py-3 border-b-2 transition-colors ${
                  selectedTab === tab.id
                    ? 'border-indigo-500 text-indigo-600 bg-white'
                    : 'border-transparent hover:text-gray-700'
                }`}
              >
                <Icon className="w-4 h-4" />
                {tab.name}
              </button>
            );
          })}
        </div>

        {/* Content */}
        <div className="flex-1 overflow-auto p-6">
          {selectedTab === 'colors' && (
            <div className="space-y-6">
              {Object.entries(styleGuide.colors).map(([category, colors]) => (
                <div key={category}>
                  <h3 className="font-medium text-lg mb-3 capitalize">{category} Colors</h3>
                  <div className="grid grid-cols-8 gap-3">
                    {colors.map((color: string, index: number) => (
                      <div key={index} className="group">
                        <div
                          className="w-full h-16 rounded-lg border border-gray-200 cursor-pointer hover:scale-105 transition-transform"
                          style={{ backgroundColor: color }}
                          onClick={() => copyToClipboard(color)}
                        />
                        <p className="text-xs text-center mt-2 font-mono">{color}</p>
                        <p className="text-xs text-center text-gray-500">{category}-{index + 1}</p>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}

          {selectedTab === 'typography' && (
            <div className="space-y-8">
              {Object.entries(styleGuide.typography).map(([category, config]) => (
                <div key={category}>
                  <h3 className="font-medium text-lg mb-4 capitalize">{category} Typography</h3>
                  <div className="bg-gray-50 rounded-lg p-6">
                    <div className="mb-4">
                      <p className="text-sm text-gray-600 mb-2">Font Family: {config.family}</p>
                      <p className="text-sm text-gray-600 mb-2">Weights: {config.weights.join(', ')}</p>
                      <p className="text-sm text-gray-600">Sizes: {config.sizes.join('px, ')}px</p>
                    </div>
                    <div className="space-y-3">
                      {config.sizes.slice(0, 3).map((size: number, index: number) => (
                        <div key={index} className="flex items-center gap-4">
                          <span
                            className="flex-1"
                            style={{
                              fontFamily: config.family,
                              fontSize: `${size}px`,
                              fontWeight: config.weights[Math.min(index, config.weights.length - 1)]
                            }}
                          >
                            The quick brown fox jumps over the lazy dog
                          </span>
                          <span className="text-sm text-gray-500 w-16">{size}px</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {selectedTab === 'spacing' && (
            <div className="space-y-6">
              <div>
                <h3 className="font-medium text-lg mb-4">Spacing Scale</h3>
                <div className="bg-gray-50 rounded-lg p-6">
                  <p className="text-sm text-gray-600 mb-4">
                    Base unit: {styleGuide.spacing.base}px • Grid: {styleGuide.spacing.grid}px
                  </p>
                  <div className="space-y-3">
                    {styleGuide.spacing.scale.map((value, index) => (
                      <div key={index} className="flex items-center gap-4">
                        <div
                          className="bg-indigo-500 h-4"
                          style={{ width: `${value}px` }}
                        />
                        <span className="text-sm font-mono w-12">{value}px</span>
                        <span className="text-sm text-gray-500">spacing-{index + 1}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div>
                <h3 className="font-medium text-lg mb-4">Border Radius</h3>
                <div className="grid grid-cols-6 gap-4">
                  {styleGuide.borderRadius.map((radius, index) => (
                    <div key={index} className="text-center">
                      <div
                        className="w-16 h-16 bg-indigo-500 mx-auto mb-2"
                        style={{ borderRadius: `${radius}px` }}
                      />
                      <p className="text-xs font-mono">{radius}px</p>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <h3 className="font-medium text-lg mb-4">Shadows</h3>
                <div className="grid grid-cols-2 gap-4">
                  {styleGuide.shadows.map((shadow, index) => (
                    <div key={index} className="text-center">
                      <div
                        className="w-24 h-16 bg-white mx-auto mb-2 rounded-lg"
                        style={{ boxShadow: shadow }}
                      />
                      <p className="text-xs font-mono">{shadow}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {selectedTab === 'components' && (
            <div className="space-y-6">
              <div>
                <h3 className="font-medium text-lg mb-4">Component Examples</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {styleGuide.usage.examples.map((example, index) => (
                    <div key={index} className="border rounded-lg p-4">
                      <h4 className="font-medium mb-2">{sanitizeHtml(example.name)}</h4>
                      <div className="bg-gray-100 rounded p-4 mb-3 min-h-24 flex items-center justify-center">
                        <span className="text-gray-500">Component Preview</span>
                      </div>
                      <div className="relative">
                        <pre className="text-xs bg-gray-900 text-gray-100 p-3 rounded overflow-x-auto">
                          {example.code}
                        </pre>
                        <button
                          onClick={() => copyToClipboard(example.code)}
                          className="absolute top-2 right-2 p-1 bg-gray-700 hover:bg-gray-600 rounded"
                        >
                          <Copy className="w-3 h-3 text-white" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {selectedTab === 'usage' && (
            <div className="space-y-6">
              <div>
                <h3 className="font-medium text-lg mb-4">Do's and Don'ts</h3>
                <div className="space-y-4">
                  {styleGuide.usage.doAndDont.map((guideline, index) => (
                    <div key={index} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="border border-green-200 bg-green-50 rounded-lg p-4">
                        <h4 className="font-medium text-green-800 mb-2">✓ Do</h4>
                        <p className="text-sm text-green-700">{guideline.do}</p>
                      </div>
                      <div className="border border-red-200 bg-red-50 rounded-lg p-4">
                        <h4 className="font-medium text-red-800 mb-2">✗ Don't</h4>
                        <p className="text-sm text-red-700">{guideline.dont}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <h3 className="font-medium text-lg mb-4">AI Suggestions</h3>
                <div className="bg-blue-50 rounded-lg p-4">
                  <ul className="space-y-2">
                    {styleGuide.aiAnalysis.suggestions.map((suggestion, index) => (
                      <li key={index} className="text-sm text-blue-800 flex items-start gap-2">
                        <Sparkles className="w-4 h-4 mt-0.5 text-blue-600" />
                        {suggestion}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="border-t p-4 flex items-center justify-between">
          <div className="text-sm text-gray-500">
            Style guide generated with AI analysis • {Object.keys(styleGuide.colors).length} color palettes • 
            {styleGuide.spacing.scale.length} spacing values
          </div>
          <button
            onClick={() => onApplyStyleGuide(styleGuide)}
            className="px-4 py-2 bg-indigo-500 text-white rounded hover:bg-indigo-600"
          >
            Apply to Project
          </button>
        </div>
      </div>
    </div>
  );
};