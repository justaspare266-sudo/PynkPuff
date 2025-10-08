'use client';

import React from 'react';
import { useEditor } from '../contexts/EditorContext';
import { ToolPanel } from './ToolPanel';
import { EnhancedExportManager } from './EnhancedExportManager';
import { Download } from 'lucide-react';
import AnimatedToolIcon from './AnimatedToolIcon';

export function ExportManagerPanel() {
  const { state, actions } = useEditor();

  const openPanel = () => {
    actions.openToolPanel('export-manager', { x: 800, y: 100 });
  };

  const handleExport = (exportData: any) => {
    console.log('Exporting with settings:', exportData);
    // This would trigger the actual export process
    // The EnhancedExportManager handles the export logic
  };

  const handleClose = () => {
    actions.closeToolPanel('export-manager');
  };

  // Get canvas data for export
  const canvasData = {
    shapes: state.shapes,
    width: 1200,
    height: 800,
    backgroundColor: '#ffffff',
    version: '1.0.0',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };

  return (
    <>
      <button
        onClick={openPanel}
        className="toolbar-button w-12 h-12 rounded-lg flex items-center justify-center"
        title="Export Manager"
      >
        <AnimatedToolIcon
          icon={Download}
          animation="bounce"
          size="md"
          tooltip="Export Manager"
        />
      </button>

      {state.toolPanels['export-manager']?.isOpen && (
        <ToolPanel toolId="export-manager" title="Export Manager">
          <EnhancedExportManager 
            canvasData={canvasData}
            onExport={handleExport}
            onClose={handleClose}
          />
        </ToolPanel>
      )}
    </>
  );
}
