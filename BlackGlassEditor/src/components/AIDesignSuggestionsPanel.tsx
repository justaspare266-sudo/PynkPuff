'use client';

import React from 'react';
import { useEditor } from '../contexts/EditorContext';
import { ToolPanel } from './ToolPanel';
import { AIDesignSuggestions } from './AIDesignSuggestions';
import { Brain } from 'lucide-react';

export function AIDesignSuggestionsPanel() {
  const { state, actions } = useEditor();

  const openPanel = () => {
    actions.openToolPanel('ai-suggestions', { x: 1000, y: 100 });
  };

  const handleSuggestionApply = (suggestion: any) => {
    console.log('AI suggestion applied:', suggestion);
    // Apply AI suggestion to canvas
    if (suggestion.type === 'layout') {
      // Apply layout suggestion
    } else if (suggestion.type === 'color') {
      // Apply color suggestion
    } else if (suggestion.type === 'typography') {
      // Apply typography suggestion
    }
  };

  const handleClose = () => {
    actions.closeToolPanel('ai-suggestions');
  };

  return (
    <>
      <button
        onClick={openPanel}
        className="w-12 h-12 rounded-lg flex items-center justify-center transition-all text-gray-300 hover:bg-gray-700"
        title="AI Design Suggestions"
      >
        <Brain className="w-5 h-5" />
      </button>

      {state.toolPanels['ai-suggestions']?.isOpen && (
        <ToolPanel toolId="ai-suggestions" title="AI Design Suggestions">
          <AIDesignSuggestions 
            onSuggestionApply={handleSuggestionApply}
            onClose={handleClose}
          />
        </ToolPanel>
      )}
    </>
  );
}
