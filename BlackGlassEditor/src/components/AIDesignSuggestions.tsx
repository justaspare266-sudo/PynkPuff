import React, { useState, useEffect } from 'react';
import { Brain, Sparkles, Wand2, TrendingUp, Palette, Layout, Type, Image, Lightbulb } from 'lucide-react';

interface DesignSuggestion {
  id: string;
  type: 'layout' | 'color' | 'typography' | 'spacing' | 'composition' | 'style';
  title: string;
  description: string;
  confidence: number;
  preview?: string;
  action: () => void;
  reasoning: string;
  category: 'improvement' | 'alternative' | 'enhancement';
}

interface AIAnalysis {
  designScore: number;
  strengths: string[];
  weaknesses: string[];
  suggestions: DesignSuggestion[];
  trends: string[];
  accessibility: {
    score: number;
    issues: string[];
    improvements: string[];
  };
}

interface AIDesignSuggestionsProps {
  projectData: any;
  onApplySuggestion: (suggestion: DesignSuggestion) => void;
  onClose: () => void;
}

export const AIDesignSuggestions: React.FC<AIDesignSuggestionsProps> = ({
  projectData,
  onApplySuggestion,
  onClose
}) => {
  const [analysis, setAnalysis] = useState<AIAnalysis | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<'all' | 'improvement' | 'alternative' | 'enhancement'>('all');
  const [showAdvanced, setShowAdvanced] = useState(false);

  useEffect(() => {
    analyzeDesign();
  }, [projectData]);

  const analyzeDesign = async () => {
    setIsAnalyzing(true);
    
    try {
      // Simulate AI analysis
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const mockAnalysis: AIAnalysis = {
        designScore: 78,
        strengths: [
          'Good color harmony with complementary palette',
          'Consistent typography hierarchy',
          'Balanced composition with rule of thirds'
        ],
        weaknesses: [
          'Low contrast ratio in some text elements',
          'Inconsistent spacing between elements',
          'Missing visual hierarchy in secondary content'
        ],
        suggestions: generateSmartSuggestions(),
        trends: ['Minimalist design', 'Bold typography', 'Gradient overlays', 'Asymmetric layouts'],
        accessibility: {
          score: 72,
          issues: ['Text contrast below WCAG standards', 'Missing alt text for images'],
          improvements: ['Increase text contrast', 'Add descriptive alt text', 'Improve focus indicators']
        }
      };
      
      setAnalysis(mockAnalysis);
    } catch (error) {
      console.error('AI analysis failed:', error);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const generateSmartSuggestions = (): DesignSuggestion[] => {
    return [
      {
        id: 'layout-golden-ratio',
        type: 'layout',
        title: 'Apply Golden Ratio Layout',
        description: 'Restructure elements using golden ratio proportions for better visual balance',
        confidence: 0.89,
        reasoning: 'Current layout has uneven spacing. Golden ratio will create more harmonious proportions.',
        category: 'improvement',
        action: () => console.log('Applying golden ratio layout')
      },
      {
        id: 'color-accessibility',
        type: 'color',
        title: 'Improve Color Contrast',
        description: 'Adjust text colors to meet WCAG AA accessibility standards',
        confidence: 0.95,
        reasoning: 'Text contrast ratio is 3.2:1, below the recommended 4.5:1 for normal text.',
        category: 'improvement',
        action: () => console.log('Improving color contrast')
      },
      {
        id: 'typography-hierarchy',
        type: 'typography',
        title: 'Enhance Typography Scale',
        description: 'Apply modular scale for better text hierarchy and readability',
        confidence: 0.82,
        reasoning: 'Font sizes lack consistent mathematical relationship. Modular scale will improve readability.',
        category: 'enhancement',
        action: () => console.log('Applying typography scale')
      },
      {
        id: 'composition-focal-point',
        type: 'composition',
        title: 'Create Strong Focal Point',
        description: 'Add visual emphasis to guide viewer attention to key content',
        confidence: 0.76,
        reasoning: 'Design lacks a clear focal point. Adding emphasis will improve user engagement.',
        category: 'enhancement',
        action: () => console.log('Creating focal point')
      },
      {
        id: 'style-modern-gradient',
        type: 'style',
        title: 'Add Subtle Gradient Overlay',
        description: 'Apply trending gradient style for modern, dynamic appearance',
        confidence: 0.68,
        reasoning: 'Flat design could benefit from depth. Subtle gradients are trending and add visual interest.',
        category: 'alternative',
        action: () => console.log('Adding gradient overlay')
      },
      {
        id: 'spacing-consistent',
        type: 'spacing',
        title: 'Standardize Element Spacing',
        description: 'Apply 8px grid system for consistent spacing throughout design',
        confidence: 0.91,
        reasoning: 'Inconsistent spacing detected. 8px grid system will create visual rhythm and professionalism.',
        category: 'improvement',
        action: () => console.log('Standardizing spacing')
      }
    ];
  };

  const getTypeIcon = (type: DesignSuggestion['type']) => {
    switch (type) {
      case 'layout': return <Layout className="w-4 h-4" />;
      case 'color': return <Palette className="w-4 h-4" />;
      case 'typography': return <Type className="w-4 h-4" />;
      case 'spacing': return <Layout className="w-4 h-4" />;
      case 'composition': return <Image className="w-4 h-4" />;
      case 'style': return <Wand2 className="w-4 h-4" />;
      default: return <Lightbulb className="w-4 h-4" />;
    }
  };

  const getCategoryColor = (category: DesignSuggestion['category']) => {
    switch (category) {
      case 'improvement': return 'text-red-600 bg-red-100';
      case 'enhancement': return 'text-blue-600 bg-blue-100';
      case 'alternative': return 'text-purple-600 bg-purple-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 90) return 'text-green-600';
    if (score >= 70) return 'text-blue-600';
    if (score >= 50) return 'text-yellow-600';
    return 'text-red-600';
  };

  const filteredSuggestions = analysis?.suggestions.filter(s => 
    selectedCategory === 'all' || s.category === selectedCategory
  ) || [];

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-[95vw] h-[90vh] max-w-6xl flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b">
          <div>
            <h2 className="text-xl font-semibold flex items-center gap-2">
              <Brain className="w-5 h-5 text-purple-600" />
              AI Design Suggestions
            </h2>
            <p className="text-sm text-gray-500">AI-powered recommendations to enhance your design</p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={analyzeDesign}
              disabled={isAnalyzing}
              className="px-3 py-1.5 bg-purple-500 text-white rounded hover:bg-purple-600 disabled:opacity-50 flex items-center gap-1"
            >
              <Sparkles className="w-4 h-4" />
              {isAnalyzing ? 'Analyzing...' : 'Re-analyze'}
            </button>
            <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded">×</button>
          </div>
        </div>

        {isAnalyzing ? (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <div className="animate-spin w-12 h-12 border-4 border-purple-500 border-t-transparent rounded-full mx-auto mb-4"></div>
              <h3 className="text-lg font-medium mb-2">AI Analyzing Your Design</h3>
              <p className="text-gray-500">Evaluating composition, colors, typography, and accessibility...</p>
            </div>
          </div>
        ) : analysis ? (
          <div className="flex flex-1 overflow-hidden">
            {/* Sidebar - Analysis Overview */}
            <div className="w-80 border-r bg-gray-50 p-4">
              <div className="space-y-4">
                {/* Design Score */}
                <div className="bg-white rounded-lg p-4">
                  <h3 className="font-medium mb-2">Design Score</h3>
                  <div className="flex items-center gap-3">
                    <div className={`text-3xl font-bold ${getScoreColor(analysis.designScore)}`}>
                      {analysis.designScore}
                    </div>
                    <div className="flex-1">
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className={`h-2 rounded-full transition-all ${
                            analysis.designScore >= 90 ? 'bg-green-500' :
                            analysis.designScore >= 70 ? 'bg-blue-500' :
                            analysis.designScore >= 50 ? 'bg-yellow-500' :
                            'bg-red-500'
                          }`}
                          style={{ width: `${analysis.designScore}%` }}
                        />
                      </div>
                      <p className="text-xs text-gray-500 mt-1">
                        {analysis.designScore >= 90 ? 'Excellent' :
                         analysis.designScore >= 70 ? 'Good' :
                         analysis.designScore >= 50 ? 'Fair' : 'Needs Improvement'}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Accessibility Score */}
                <div className="bg-white rounded-lg p-4">
                  <h3 className="font-medium mb-2">Accessibility</h3>
                  <div className="flex items-center gap-3">
                    <div className={`text-2xl font-bold ${getScoreColor(analysis.accessibility.score)}`}>
                      {analysis.accessibility.score}
                    </div>
                    <div className="flex-1">
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-blue-500 h-2 rounded-full transition-all"
                          style={{ width: `${analysis.accessibility.score}%` }}
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Strengths */}
                <div className="bg-white rounded-lg p-4">
                  <h3 className="font-medium mb-2 text-green-700">Strengths</h3>
                  <ul className="space-y-1">
                    {analysis.strengths.map((strength, index) => (
                      <li key={index} className="text-sm text-gray-600 flex items-start gap-2">
                        <span className="text-green-500 mt-0.5">•</span>
                        {strength}
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Current Trends */}
                <div className="bg-white rounded-lg p-4">
                  <h3 className="font-medium mb-2 flex items-center gap-2">
                    <TrendingUp className="w-4 h-4" />
                    Design Trends
                  </h3>
                  <div className="flex flex-wrap gap-1">
                    {analysis.trends.map((trend, index) => (
                      <span key={index} className="px-2 py-1 bg-purple-100 text-purple-700 text-xs rounded">
                        {trend}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Main Content - Suggestions */}
            <div className="flex-1 flex flex-col">
              {/* Filter Tabs */}
              <div className="flex border-b bg-gray-50">
                {[
                  { id: 'all', name: 'All Suggestions', count: analysis.suggestions.length },
                  { id: 'improvement', name: 'Improvements', count: analysis.suggestions.filter(s => s.category === 'improvement').length },
                  { id: 'enhancement', name: 'Enhancements', count: analysis.suggestions.filter(s => s.category === 'enhancement').length },
                  { id: 'alternative', name: 'Alternatives', count: analysis.suggestions.filter(s => s.category === 'alternative').length }
                ].map(tab => (
                  <button
                    key={tab.id}
                    onClick={() => setSelectedCategory(tab.id as any)}
                    className={`px-4 py-3 border-b-2 transition-colors ${
                      selectedCategory === tab.id
                        ? 'border-purple-500 text-purple-600 bg-white'
                        : 'border-transparent hover:text-gray-700'
                    }`}
                  >
                    {tab.name} ({tab.count})
                  </button>
                ))}
              </div>

              {/* Suggestions List */}
              <div className="flex-1 overflow-auto p-4">
                <div className="space-y-4">
                  {filteredSuggestions.map(suggestion => (
                    <div key={suggestion.id} className="bg-white border rounded-lg p-4 hover:shadow-md transition-shadow">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-start gap-3">
                          <div className="p-2 bg-gray-100 rounded">
                            {getTypeIcon(suggestion.type)}
                          </div>
                          <div>
                            <h3 className="font-medium">{suggestion.title}</h3>
                            <p className="text-sm text-gray-600 mt-1">{suggestion.description}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className={`px-2 py-1 rounded text-xs font-medium ${getCategoryColor(suggestion.category)}`}>
                            {suggestion.category}
                          </div>
                          <div className="text-sm font-medium text-gray-700">
                            {Math.round(suggestion.confidence * 100)}%
                          </div>
                        </div>
                      </div>

                      <div className="bg-gray-50 rounded p-3 mb-3">
                        <p className="text-sm text-gray-700">
                          <strong>AI Reasoning:</strong> {suggestion.reasoning}
                        </p>
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-gray-500 capitalize">{suggestion.type}</span>
                          <span className="text-xs text-gray-300">•</span>
                          <span className="text-xs text-gray-500">Confidence: {Math.round(suggestion.confidence * 100)}%</span>
                        </div>
                        <div className="flex gap-2">
                          <button className="px-3 py-1 border rounded text-sm hover:bg-gray-50">
                            Preview
                          </button>
                          <button
                            onClick={() => onApplySuggestion(suggestion)}
                            className="px-3 py-1 bg-purple-500 text-white rounded text-sm hover:bg-purple-600"
                          >
                            Apply
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}

                  {filteredSuggestions.length === 0 && (
                    <div className="text-center text-gray-500 py-12">
                      <Lightbulb className="w-12 h-12 mx-auto mb-4 opacity-50" />
                      <p>No suggestions in this category</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <Brain className="w-16 h-16 mx-auto mb-4 text-gray-400" />
              <p className="text-gray-500">Click "Analyze" to get AI-powered design suggestions</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};