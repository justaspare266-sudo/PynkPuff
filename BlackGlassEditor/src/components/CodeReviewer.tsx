import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Code, CheckCircle, AlertTriangle, X, Shield } from 'lucide-react';

interface CodeIssue {
  id: string;
  type: 'error' | 'warning' | 'info' | 'security';
  severity: 'critical' | 'high' | 'medium' | 'low';
  category: 'performance' | 'security' | 'maintainability' | 'reliability' | 'style';
  title: string;
  description: string;
  file: string;
  line?: number;
  suggestion: string;
  autoFixable: boolean;
}

interface CodeMetrics {
  linesOfCode: number;
  complexity: number;
  maintainabilityIndex: number;
  testCoverage: number;
  duplicateCode: number;
  securityScore: number;
}

export const CodeReviewer: React.FC = () => {
  const [showReviewer, setShowReviewer] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [issues, setIssues] = useState<CodeIssue[]>([]);
  const [metrics, setMetrics] = useState<CodeMetrics | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  // Simulate code analysis
  const analyzeCode = async () => {
    setIsAnalyzing(true);
    
    // Simulate analysis delay
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Mock issues found during analysis
    const mockIssues: CodeIssue[] = [
      {
        id: '1',
        type: 'security',
        severity: 'high',
        category: 'security',
        title: 'Potential XSS Vulnerability',
        description: 'Direct DOM manipulation without sanitization',
        file: 'components/TextEditor.tsx',
        line: 45,
        suggestion: 'Use DOMPurify to sanitize HTML content before insertion',
        autoFixable: false
      },
      {
        id: '2',
        type: 'warning',
        severity: 'medium',
        category: 'performance',
        title: 'Unnecessary Re-renders',
        description: 'Component re-renders on every state change',
        file: 'components/Canvas.tsx',
        line: 123,
        suggestion: 'Use React.memo or useMemo to optimize rendering',
        autoFixable: true
      },
      {
        id: '3',
        type: 'error',
        severity: 'critical',
        category: 'reliability',
        title: 'Memory Leak Risk',
        description: 'Event listeners not cleaned up in useEffect',
        file: 'hooks/useKeyboardShortcuts.ts',
        line: 67,
        suggestion: 'Add cleanup function to useEffect return',
        autoFixable: true
      },
      {
        id: '4',
        type: 'warning',
        severity: 'low',
        category: 'maintainability',
        title: 'Complex Function',
        description: 'Function has high cyclomatic complexity (15)',
        file: 'utils/canvasUtils.ts',
        line: 89,
        suggestion: 'Break down into smaller, more focused functions',
        autoFixable: false
      },
      {
        id: '5',
        type: 'info',
        severity: 'low',
        category: 'style',
        title: 'Inconsistent Naming',
        description: 'Variable naming doesn\'t follow camelCase convention',
        file: 'stores/editorStore.ts',
        line: 34,
        suggestion: 'Use camelCase for variable names',
        autoFixable: true
      },
      {
        id: '6',
        type: 'security',
        severity: 'medium',
        category: 'security',
        title: 'Unsafe localStorage Usage',
        description: 'Storing sensitive data in localStorage without encryption',
        file: 'utils/storage.ts',
        line: 12,
        suggestion: 'Encrypt sensitive data before storing locally',
        autoFixable: false
      }
    ];

    const mockMetrics: CodeMetrics = {
      linesOfCode: 15420,
      complexity: 7.2,
      maintainabilityIndex: 78,
      testCoverage: 65,
      duplicateCode: 3.2,
      securityScore: 82
    };

    setIssues(mockIssues);
    setMetrics(mockMetrics);
    setIsAnalyzing(false);
  };

  // Auto-fix issues where possible
  const autoFixIssue = (issueId: string) => {
    setIssues(prev => prev.filter(issue => issue.id !== issueId));
    // In real implementation, would apply actual fixes
  };

  const categories = [
    { id: 'all', name: 'All Issues', count: issues.length },
    { id: 'security', name: 'Security', count: issues.filter(i => i.category === 'security').length },
    { id: 'performance', name: 'Performance', count: issues.filter(i => i.category === 'performance').length },
    { id: 'reliability', name: 'Reliability', count: issues.filter(i => i.category === 'reliability').length },
    { id: 'maintainability', name: 'Maintainability', count: issues.filter(i => i.category === 'maintainability').length },
    { id: 'style', name: 'Style', count: issues.filter(i => i.category === 'style').length }
  ];

  const filteredIssues = selectedCategory === 'all' 
    ? issues 
    : issues.filter(issue => issue.category === selectedCategory);

  const getIssueIcon = (issue: CodeIssue) => {
    switch (issue.type) {
      case 'error':
        return <X className="text-red-500" size={16} />;
      case 'warning':
        return <AlertTriangle className="text-yellow-500" size={16} />;
      case 'security':
        return <Shield className="text-purple-500" size={16} />;
      case 'info':
        return <CheckCircle className="text-blue-500" size={16} />;
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'bg-red-100 text-red-800';
      case 'high': return 'bg-orange-100 text-orange-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'low': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getMetricColor = (value: number, type: string) => {
    switch (type) {
      case 'maintainability':
      case 'testCoverage':
      case 'securityScore':
        if (value >= 80) return 'text-green-600';
        if (value >= 60) return 'text-yellow-600';
        return 'text-red-600';
      case 'complexity':
      case 'duplicateCode':
        if (value <= 5) return 'text-green-600';
        if (value <= 10) return 'text-yellow-600';
        return 'text-red-600';
      default:
        return 'text-gray-600';
    }
  };

  if (!showReviewer) {
    return (
      <motion.button
        onClick={() => setShowReviewer(true)}
        className="fixed top-4 left-76 z-40 bg-gray-700 text-white p-2 rounded-full shadow-lg hover:bg-gray-800"
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        title="Code Review"
      >
        <Code size={16} />
      </motion.button>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: -100 }}
      animate={{ opacity: 1, y: 0 }}
      className="fixed top-4 left-76 z-40 bg-white rounded-lg shadow-xl p-4 w-96 max-h-[80vh] overflow-y-auto"
    >
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold flex items-center gap-2">
          <Code size={16} />
          Code Review
        </h3>
        <button
          onClick={() => setShowReviewer(false)}
          className="text-gray-400 hover:text-gray-600"
        >
          ×
        </button>
      </div>

      {/* Code Metrics */}
      {metrics && (
        <div className="mb-4 p-3 bg-gray-50 rounded-lg">
          <h4 className="font-medium text-sm mb-2">Code Metrics</h4>
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div>
              <div className="text-gray-600">Lines of Code</div>
              <div className="font-medium">{metrics.linesOfCode.toLocaleString()}</div>
            </div>
            <div>
              <div className="text-gray-600">Complexity</div>
              <div className={`font-medium ${getMetricColor(metrics.complexity, 'complexity')}`}>
                {metrics.complexity.toFixed(1)}
              </div>
            </div>
            <div>
              <div className="text-gray-600">Maintainability</div>
              <div className={`font-medium ${getMetricColor(metrics.maintainabilityIndex, 'maintainability')}`}>
                {metrics.maintainabilityIndex}%
              </div>
            </div>
            <div>
              <div className="text-gray-600">Test Coverage</div>
              <div className={`font-medium ${getMetricColor(metrics.testCoverage, 'testCoverage')}`}>
                {metrics.testCoverage}%
              </div>
            </div>
            <div>
              <div className="text-gray-600">Duplicate Code</div>
              <div className={`font-medium ${getMetricColor(metrics.duplicateCode, 'duplicateCode')}`}>
                {metrics.duplicateCode}%
              </div>
            </div>
            <div>
              <div className="text-gray-600">Security Score</div>
              <div className={`font-medium ${getMetricColor(metrics.securityScore, 'securityScore')}`}>
                {metrics.securityScore}%
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Category Filter */}
      <div className="mb-4">
        <div className="flex flex-wrap gap-1">
          {categories.map(category => (
            <button
              key={category.id}
              onClick={() => setSelectedCategory(category.id)}
              className={`text-xs px-2 py-1 rounded flex items-center gap-1 ${
                selectedCategory === category.id
                  ? 'bg-gray-700 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {category.name}
              {category.count > 0 && (
                <span className="bg-red-500 text-white rounded-full px-1 text-xs">
                  {category.count}
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Analysis Status */}
      {isAnalyzing && (
        <div className="mb-4 p-3 bg-blue-50 rounded-lg text-center">
          <div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
          <div className="text-sm">Analyzing code...</div>
        </div>
      )}

      {/* Issues List */}
      <div className="space-y-2 mb-4">
        {filteredIssues.map(issue => (
          <div key={issue.id} className="border rounded-lg p-3">
            <div className="flex items-start gap-2 mb-2">
              {getIssueIcon(issue)}
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <h4 className="font-medium text-sm">{issue.title}</h4>
                  <span className={`text-xs px-1 rounded ${getSeverityColor(issue.severity)}`}>
                    {issue.severity}
                  </span>
                </div>
                <p className="text-xs text-gray-600 mb-1">{issue.description}</p>
                <div className="text-xs text-gray-500 mb-2">
                  {issue.file}{issue.line && `:${issue.line}`}
                </div>
                <p className="text-xs text-blue-600 mb-2">💡 {issue.suggestion}</p>
                
                {issue.autoFixable && (
                  <button
                    onClick={() => autoFixIssue(issue.id)}
                    className="text-xs bg-green-500 text-white px-2 py-1 rounded hover:bg-green-600"
                  >
                    Auto-fix
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Summary */}
      {issues.length > 0 && (
        <div className="mb-4 p-3 bg-gray-50 rounded-lg">
          <div className="text-sm font-medium mb-2">Summary</div>
          <div className="text-xs space-y-1">
            <div className="flex justify-between">
              <span>Total Issues:</span>
              <span className="font-medium">{issues.length}</span>
            </div>
            <div className="flex justify-between">
              <span>Critical:</span>
              <span className="font-medium text-red-600">
                {issues.filter(i => i.severity === 'critical').length}
              </span>
            </div>
            <div className="flex justify-between">
              <span>Auto-fixable:</span>
              <span className="font-medium text-green-600">
                {issues.filter(i => i.autoFixable).length}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Actions */}
      <div className="flex gap-2">
        <button
          onClick={analyzeCode}
          disabled={isAnalyzing}
          className="flex-1 bg-gray-700 text-white py-2 px-3 rounded text-sm hover:bg-gray-800 disabled:opacity-50"
        >
          {isAnalyzing ? 'Analyzing...' : 'Analyze Code'}
        </button>
      </div>
    </motion.div>
  );
};