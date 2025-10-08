'use client';

import React from 'react';
import { useEditor } from '../contexts/EditorContext';
import { ToolPanel } from './ToolPanel';
import { ProjectTemplates } from './ProjectTemplates';
import { LayoutTemplate } from 'lucide-react';

export function ProjectTemplatesPanel() {
  const { state, actions } = useEditor();

  const openPanel = () => {
    actions.openToolPanel('project-templates', { x: 1100, y: 100 });
  };

  const handleTemplateLoad = (template: any) => {
    console.log('Template loaded:', template);
    // Load template into canvas
    if (template.shapes) {
      // Clear current canvas
      actions.clearShapes();
      // Add template shapes
      template.shapes.forEach((shape: any) => {
        actions.addShape(shape);
      });
    }
  };

  const handleClose = () => {
    actions.closeToolPanel('project-templates');
  };

  return (
    <>
      <button
        onClick={openPanel}
        className="w-12 h-12 rounded-lg flex items-center justify-center transition-all text-gray-300 hover:bg-gray-700"
        title="Project Templates"
      >
        <LayoutTemplate className="w-5 h-5" />
      </button>

      {state.toolPanels['project-templates']?.isOpen && (
        <ToolPanel toolId="project-templates" title="Project Templates">
          <ProjectTemplates 
            onTemplateLoad={handleTemplateLoad}
            onClose={handleClose}
          />
        </ToolPanel>
      )}
    </>
  );
}
