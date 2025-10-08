import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Eye, AlertTriangle, CheckCircle, X, Zap, Contrast } from 'lucide-react';

interface AccessibilityIssue {
  id: string;
  type: 'error' | 'warning' | 'info';
  category: 'color' | 'keyboard' | 'screen-reader' | 'focus' | 'structure';
  title: string;
  description: string;
  element?: string;
  suggestion: string;
  wcagLevel: 'A' | 'AA' | 'AAA';
}

export const AccessibilityAuditor: React.FC = () => {
  const [showAuditor, setShowAuditor] = useState(false);
  const [issues, setIssues] = useState<AccessibilityIssue[]>([]);
  const [isAuditing, setIsAuditing] = useState(false);
  const [auditScore, setAuditScore] = useState(0);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  const categories = [
    { id: 'all', name: 'All Issues', icon: Eye },
    { id: 'color', name: 'Color & Contrast', icon: Contrast },
    { id: 'keyboard', name: 'Keyboard Navigation', icon: Zap },
    { id: 'screen-reader', name: 'Screen Reader', icon: Eye },
    { id: 'focus', name: 'Focus Management', icon: Eye },
    { id: 'structure', name: 'Structure', icon: Eye }
  ];

  // Run accessibility audit
  const runAccessibilityAudit = async () => {
    setIsAuditing(true);
    const foundIssues: AccessibilityIssue[] = [];

    // Color contrast audit
    const elements = document.querySelectorAll('*');
    elements.forEach((element, index) => {
      const styles = window.getComputedStyle(element);
      const color = styles.color;
      const backgroundColor = styles.backgroundColor;
      
      if (color && backgroundColor && color !== 'rgba(0, 0, 0, 0)' && backgroundColor !== 'rgba(0, 0, 0, 0)') {
        const contrast = calculateContrastRatio(color, backgroundColor);
        if (contrast < 4.5) {
          foundIssues.push({
            id: `contrast-${index}`,
            type: 'error',
            category: 'color',
            title: 'Low Color Contrast',
            description: `Contrast ratio of ${contrast.toFixed(2)}:1 is below WCAG AA standard`,
            element: element.tagName.toLowerCase(),
            suggestion: 'Increase contrast between text and background colors to at least 4.5:1',
            wcagLevel: 'AA'
          });
        }
      }
    });

    // Missing alt text audit
    const images = document.querySelectorAll('img');
    images.forEach((img, index) => {
      if (!img.alt) {
        foundIssues.push({
          id: `alt-${index}`,
          type: 'error',
          category: 'screen-reader',
          title: 'Missing Alt Text',
          description: 'Image without alternative text',
          element: 'img',
          suggestion: 'Add descriptive alt text to all images',
          wcagLevel: 'A'
        });
      }
    });

    // Missing labels audit
    const inputs = document.querySelectorAll('input, textarea, select');
    inputs.forEach((input, index) => {
      const hasLabel = input.id && document.querySelector(`label[for="${input.id}"]`);
      const hasAriaLabel = input.getAttribute('aria-label');
      const hasAriaLabelledBy = input.getAttribute('aria-labelledby');
      
      if (!hasLabel && !hasAriaLabel && !hasAriaLabelledBy) {
        foundIssues.push({
          id: `label-${index}`,
          type: 'error',
          category: 'screen-reader',
          title: 'Missing Form Label',
          description: 'Form control without accessible label',
          element: input.tagName.toLowerCase(),
          suggestion: 'Add a label element or aria-label attribute',
          wcagLevel: 'A'
        });
      }
    });

    // Keyboard navigation audit
    const focusableElements = document.querySelectorAll('button, a, input, textarea, select, [tabindex]');
    focusableElements.forEach((element, index) => {
      const tabIndex = element.getAttribute('tabindex');
      if (tabIndex && parseInt(tabIndex) > 0) {
        foundIssues.push({
          id: `tabindex-${index}`,
          type: 'warning',
          category: 'keyboard',
          title: 'Positive Tab Index',
          description: 'Positive tabindex can disrupt natural tab order',
          element: element.tagName.toLowerCase(),
          suggestion: 'Use tabindex="0" or remove tabindex to maintain natural order',
          wcagLevel: 'A'
        });
      }
    });

    // Focus indicators audit
    const interactiveElements = document.querySelectorAll('button, a, input, textarea, select');
    interactiveElements.forEach((element, index) => {
      const styles = window.getComputedStyle(element, ':focus');
      const outline = styles.outline;
      const boxShadow = styles.boxShadow;
      
      if (outline === 'none' && boxShadow === 'none') {
        foundIssues.push({
          id: `focus-${index}`,
          type: 'warning',
          category: 'focus',
          title: 'Missing Focus Indicator',
          description: 'Interactive element lacks visible focus indicator',
          element: element.tagName.toLowerCase(),
          suggestion: 'Add visible focus styles using outline or box-shadow',
          wcagLevel: 'AA'
        });
      }
    });

    // Heading structure audit
    const headings = document.querySelectorAll('h1, h2, h3, h4, h5, h6');
    let previousLevel = 0;
    headings.forEach((heading, index) => {
      const level = parseInt(heading.tagName.charAt(1));
      if (level > previousLevel + 1) {
        foundIssues.push({
          id: `heading-${index}`,
          type: 'warning',
          category: 'structure',
          title: 'Skipped Heading Level',
          description: `Heading level ${level} follows level ${previousLevel}`,
          element: heading.tagName.toLowerCase(),
          suggestion: 'Use heading levels in sequential order (h1, h2, h3, etc.)',
          wcagLevel: 'AA'
        });
      }
      previousLevel = level;
    });

    // ARIA attributes audit
    const elementsWithAria = document.querySelectorAll('[aria-expanded], [aria-selected], [aria-checked]');
    elementsWithAria.forEach((element, index) => {
      const ariaExpanded = element.getAttribute('aria-expanded');
      const ariaSelected = element.getAttribute('aria-selected');
      const ariaChecked = element.getAttribute('aria-checked');
      
      if (ariaExpanded && !['true', 'false'].includes(ariaExpanded)) {
        foundIssues.push({
          id: `aria-expanded-${index}`,
          type: 'error',
          category: 'screen-reader',
          title: 'Invalid ARIA Value',
          description: 'aria-expanded must be "true" or "false"',
          element: element.tagName.toLowerCase(),
          suggestion: 'Set aria-expanded to "true" or "false"',
          wcagLevel: 'A'
        });
      }
    });

    // Calculate accessibility score
    const totalElements = elements.length;
    const issueCount = foundIssues.length;
    const score = Math.max(0, Math.round((1 - issueCount / totalElements) * 100));

    setIssues(foundIssues);
    setAuditScore(score);
    setIsAuditing(false);
  };

  // Calculate color contrast ratio
  const calculateContrastRatio = (color1: string, color2: string): number => {
    // Simplified contrast calculation
    // In a real implementation, you'd convert colors to RGB and calculate luminance
    const rgb1 = parseColor(color1);
    const rgb2 = parseColor(color2);
    
    if (!rgb1 || !rgb2) return 21; // Assume good contrast if can't parse
    
    const l1 = getLuminance(rgb1);
    const l2 = getLuminance(rgb2);
    
    const lighter = Math.max(l1, l2);
    const darker = Math.min(l1, l2);
    
    return (lighter + 0.05) / (darker + 0.05);
  };

  const parseColor = (color: string): [number, number, number] | null => {
    // Simplified color parsing
    const match = color.match(/rgb\((\d+),\s*(\d+),\s*(\d+)\)/);
    if (match) {
      return [parseInt(match[1]), parseInt(match[2]), parseInt(match[3])];
    }
    return null;
  };

  const getLuminance = ([r, g, b]: [number, number, number]): number => {
    const [rs, gs, bs] = [r, g, b].map(c => {
      c = c / 255;
      return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
    });
    return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs;
  };

  // Auto-fix some issues
  const autoFix = (issue: AccessibilityIssue) => {
    const elements = document.querySelectorAll(issue.element || '*');
    
    switch (issue.category) {
      case 'focus':
        elements.forEach(el => {
          (el as HTMLElement).style.outline = '2px solid #007acc';
          (el as HTMLElement).style.outlineOffset = '2px';
        });
        break;
      case 'keyboard':
        elements.forEach(el => {
          if (el.getAttribute('tabindex') && parseInt(el.getAttribute('tabindex')!) > 0) {
            el.setAttribute('tabindex', '0');
          }
        });
        break;
    }
    
    // Re-run audit after fix
    setTimeout(runAccessibilityAudit, 500);
  };

  const filteredIssues = selectedCategory === 'all' 
    ? issues 
    : issues.filter(issue => issue.category === selectedCategory);

  const getIssueIcon = (type: AccessibilityIssue['type']) => {
    switch (type) {
      case 'error':
        return <X className="text-red-500" size={16} />;
      case 'warning':
        return <AlertTriangle className="text-yellow-500" size={16} />;
      case 'info':
        return <CheckCircle className="text-blue-500" size={16} />;
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 90) return 'text-green-600';
    if (score >= 70) return 'text-yellow-600';
    return 'text-red-600';
  };

  if (!showAuditor) {
    return (
      <motion.button
        onClick={() => {
          setShowAuditor(true);
          runAccessibilityAudit();
        }}
        className="fixed bottom-16 left-4 z-40 bg-green-500 text-white p-3 rounded-full shadow-lg hover:bg-green-600"
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        title="Accessibility Audit"
      >
        <Eye size={20} />
      </motion.button>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, x: -100 }}
      animate={{ opacity: 1, x: 0 }}
      className="fixed bottom-4 left-4 z-40 bg-white rounded-lg shadow-xl w-96 max-h-[80vh] overflow-hidden"
    >
      <div className="p-4 border-b">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold flex items-center gap-2">
            <Eye size={16} />
            Accessibility Audit
          </h3>
          <button
            onClick={() => setShowAuditor(false)}
            className="text-gray-400 hover:text-gray-600"
          >
            <X size={16} />
          </button>
        </div>
        
        {/* Score */}
        <div className="mt-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-600">Accessibility Score:</span>
            <span className={`text-lg font-bold ${getScoreColor(auditScore)}`}>
              {auditScore}%
            </span>
          </div>
          <button
            onClick={runAccessibilityAudit}
            disabled={isAuditing}
            className="text-sm bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600 disabled:opacity-50"
          >
            {isAuditing ? 'Auditing...' : 'Re-audit'}
          </button>
        </div>
      </div>

      {/* Category Filter */}
      <div className="p-3 border-b">
        <div className="flex flex-wrap gap-1">
          {categories.map(category => (
            <button
              key={category.id}
              onClick={() => setSelectedCategory(category.id)}
              className={`text-xs px-2 py-1 rounded flex items-center gap-1 ${
                selectedCategory === category.id
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              <category.icon size={12} />
              {category.name}
            </button>
          ))}
        </div>
      </div>

      {/* Issues List */}
      <div className="overflow-y-auto max-h-96">
        {isAuditing ? (
          <div className="p-8 text-center">
            <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
            <p className="text-sm text-gray-600">Running accessibility audit...</p>
          </div>
        ) : filteredIssues.length === 0 ? (
          <div className="p-8 text-center">
            <CheckCircle size={48} className="mx-auto mb-3 text-green-500" />
            <p className="text-sm text-gray-600">
              {selectedCategory === 'all' ? 'No accessibility issues found!' : `No ${selectedCategory} issues found!`}
            </p>
          </div>
        ) : (
          <div className="divide-y">
            {filteredIssues.map(issue => (
              <div key={issue.id} className="p-4">
                <div className="flex items-start gap-3">
                  {getIssueIcon(issue.type)}
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="font-medium text-sm">{issue.title}</h4>
                      <span className="text-xs bg-gray-100 px-1 rounded">
                        WCAG {issue.wcagLevel}
                      </span>
                    </div>
                    <p className="text-xs text-gray-600 mb-2">{issue.description}</p>
                    <p className="text-xs text-blue-600 mb-2">{issue.suggestion}</p>
                    
                    {/* Auto-fix button for some issues */}
                    {['focus', 'keyboard'].includes(issue.category) && (
                      <button
                        onClick={() => autoFix(issue)}
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
        )}
      </div>

      {/* Summary */}
      {!isAuditing && issues.length > 0 && (
        <div className="p-3 border-t bg-gray-50">
          <div className="text-xs text-gray-600 space-y-1">
            <div className="flex justify-between">
              <span>Total Issues:</span>
              <span className="font-medium">{issues.length}</span>
            </div>
            <div className="flex justify-between">
              <span>Errors:</span>
              <span className="font-medium text-red-600">
                {issues.filter(i => i.type === 'error').length}
              </span>
            </div>
            <div className="flex justify-between">
              <span>Warnings:</span>
              <span className="font-medium text-yellow-600">
                {issues.filter(i => i.type === 'warning').length}
              </span>
            </div>
          </div>
        </div>
      )}
    </motion.div>
  );
};