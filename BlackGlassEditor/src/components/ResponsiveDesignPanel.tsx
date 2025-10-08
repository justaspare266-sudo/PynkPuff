'use client';

import React from 'react';
import { useEditor } from '../contexts/EditorContext';
import { ToolPanel } from './ToolPanel';
import ResponsiveDesignSystem from './ResponsiveDesignSystem';
import { Smartphone } from 'lucide-react';

export function ResponsiveDesignPanel() {
  const { state, actions } = useEditor();

  const openPanel = () => {
    actions.openToolPanel('responsive-design', { x: 1200, y: 100 });
  };

  const handleResponsiveUpdate = (settings: any) => {
    console.log('Responsive settings updated:', settings);
    // Apply responsive design settings
    if (settings.breakpoint) {
      // Update canvas for different breakpoints
    }
    if (settings.mobileOptimization) {
      // Apply mobile-specific optimizations
    }
  };

  const handleClose = () => {
    actions.closeToolPanel('responsive-design');
  };

  return (
    <>
      <button
        onClick={openPanel}
        className="w-12 h-12 rounded-lg flex items-center justify-center transition-all text-gray-300 hover:bg-gray-700"
        title="Responsive Design (Mobile Support)"
      >
        <Smartphone className="w-5 h-5" />
      </button>

      {state.toolPanels['responsive-design']?.isOpen && (
        <ToolPanel toolId="responsive-design" title="Responsive Design System">
          <ResponsiveDesignSystem 
            onResponsiveUpdate={handleResponsiveUpdate}
            onClose={handleClose}
          />
        </ToolPanel>
      )}
    </>
  );
}
