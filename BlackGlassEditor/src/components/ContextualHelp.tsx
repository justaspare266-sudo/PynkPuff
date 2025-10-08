import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { HelpCircle, X, ChevronRight, Lightbulb } from 'lucide-react';
import { useEditorStore } from '../stores/editorStore';

interface HelpTip {
  id: string;
  title: string;
  content: string;
  trigger: string;
  position: 'top' | 'bottom' | 'left' | 'right';
  priority: number;
}

const helpTips: HelpTip[] = [
  {
    id: 'select-tool',
    title: 'Selection Tool',
    content: 'Click objects to select them. Hold Shift to select multiple objects. Drag to move selected objects.',
    trigger: 'tool-select',
    position: 'bottom',
    priority: 1
  },
  {
    id: 'text-tool',
    title: 'Text Tool',
    content: 'Click anywhere on the canvas to add text. Double-click existing text to edit it.',
    trigger: 'tool-text',
    position: 'bottom',
    priority: 1
  },
  {
    id: 'shape-tool',
    title: 'Shape Tool',
    content: 'Click and drag to create shapes. Hold Shift while dragging to maintain proportions.',
    trigger: 'tool-shape',
    position: 'bottom',
    priority: 1
  },
  {
    id: 'layers-panel',
    title: 'Layers Panel',
    content: 'Manage your objects here. Drag to reorder, click the eye icon to hide/show layers.',
    trigger: 'layers-panel',
    position: 'left',
    priority: 2
  },
  {
    id: 'properties-panel',
    title: 'Properties Panel',
    content: 'Adjust selected object properties like position, size, color, and effects.',
    trigger: 'properties-panel',
    position: 'left',
    priority: 2
  }
];

export const ContextualHelp: React.FC = () => {
  const { activeTool: selectedTool } = useEditorStore();
  const [activeHelp, setActiveHelp] = useState<HelpTip | null>(null);
  const [showHelpCenter, setShowHelpCenter] = useState(false);
  const [dismissedTips, setDismissedTips] = useState<Set<string>>(new Set());

  useEffect(() => {
    const relevantTip = helpTips.find(tip => 
      tip.trigger === `tool-${selectedTool}` && !dismissedTips.has(tip.id)
    );
    
    if (relevantTip) {
      const timer = setTimeout(() => setActiveHelp(relevantTip), 1000);
      return () => clearTimeout(timer);
    }
  }, [selectedTool, dismissedTips]);

  const dismissTip = (tipId: string) => {
    setDismissedTips(prev => new Set([...prev, tipId]));
    setActiveHelp(null);
  };

  const showTip = (trigger: string) => {
    const tip = helpTips.find(t => t.trigger === trigger);
    if (tip && !dismissedTips.has(tip.id)) {
      setActiveHelp(tip);
    }
  };

  return (
    <>
      {/* Help Button */}
      <motion.button
        onClick={() => setShowHelpCenter(true)}
        className="fixed top-4 right-4 z-50 bg-blue-500 text-white p-2 rounded-full shadow-lg hover:bg-blue-600"
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
      >
        <HelpCircle size={20} />
      </motion.button>

      {/* Contextual Tooltip */}
      <AnimatePresence>
        {activeHelp && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            className="fixed z-40 bg-gray-900 text-white p-4 rounded-lg shadow-xl max-w-xs"
            style={{
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)'
            }}
          >
            <div className="flex items-start justify-between mb-2">
              <div className="flex items-center gap-2">
                <Lightbulb size={16} className="text-yellow-400" />
                <h3 className="font-semibold text-sm">{activeHelp.title}</h3>
              </div>
              <button
                onClick={() => dismissTip(activeHelp.id)}
                className="text-gray-400 hover:text-white"
              >
                <X size={14} />
              </button>
            </div>
            <p className="text-sm text-gray-300 mb-3">{activeHelp.content}</p>
            <div className="flex justify-end gap-2">
              <button
                onClick={() => dismissTip(activeHelp.id)}
                className="text-xs text-gray-400 hover:text-white"
              >
                Don't show again
              </button>
              <button
                onClick={() => setActiveHelp(null)}
                className="text-xs bg-blue-500 text-white px-2 py-1 rounded hover:bg-blue-600"
              >
                Got it
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Help Center Modal */}
      <AnimatePresence>
        {showHelpCenter && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4"
            onClick={() => setShowHelpCenter(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[80vh] overflow-hidden"
              onClick={e => e.stopPropagation()}
            >
              <div className="p-6 border-b">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-bold">Help Center</h2>
                  <button
                    onClick={() => setShowHelpCenter(false)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <X size={24} />
                  </button>
                </div>
              </div>
              
              <div className="p-6 overflow-y-auto">
                <div className="space-y-6">
                  <div>
                    <h3 className="font-semibold mb-3">Quick Tips</h3>
                    <div className="space-y-2">
                      {helpTips.map(tip => (
                        <div key={tip.id} className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                          <Lightbulb size={16} className="text-yellow-500 mt-0.5" />
                          <div>
                            <h4 className="font-medium text-sm">{tip.title}</h4>
                            <p className="text-sm text-gray-600">{tip.content}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div>
                    <h3 className="font-semibold mb-3">Keyboard Shortcuts</h3>
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <div className="flex justify-between p-2 bg-gray-50 rounded">
                        <span>Select Tool</span>
                        <kbd className="bg-gray-200 px-1 rounded">V</kbd>
                      </div>
                      <div className="flex justify-between p-2 bg-gray-50 rounded">
                        <span>Text Tool</span>
                        <kbd className="bg-gray-200 px-1 rounded">T</kbd>
                      </div>
                      <div className="flex justify-between p-2 bg-gray-50 rounded">
                        <span>Undo</span>
                        <kbd className="bg-gray-200 px-1 rounded">Ctrl+Z</kbd>
                      </div>
                      <div className="flex justify-between p-2 bg-gray-50 rounded">
                        <span>Redo</span>
                        <kbd className="bg-gray-200 px-1 rounded">Ctrl+Y</kbd>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Help Trigger Areas (invisible) */}
      <div
        data-help-trigger="layers-panel"
        className="absolute left-0 top-20 w-64 h-full pointer-events-none"
        onMouseEnter={() => showTip('layers-panel')}
      />
      <div
        data-help-trigger="properties-panel"
        className="absolute right-0 top-20 w-80 h-full pointer-events-none"
        onMouseEnter={() => showTip('properties-panel')}
      />
    </>
  );
};