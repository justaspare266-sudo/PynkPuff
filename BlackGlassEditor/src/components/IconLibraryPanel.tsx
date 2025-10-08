'use client';

import React from 'react';
import { useEditor } from '../contexts/EditorContext';
import { ToolPanel } from './ToolPanel';
import IconLibrary from './IconLibrary';
import { ImageIcon } from 'lucide-react';
import AnimatedToolIcon from './AnimatedToolIcon';

export function IconLibraryPanel() {
  const { state, actions } = useEditor();

  const openPanel = () => {
    actions.openToolPanel('icon-library', { x: 100, y: 100 });
  };

  const handleClose = () => {
    actions.closeToolPanel('icon-library');
  };

  const handleIconSelect = (icon: any) => {
    console.log('Icon selected:', icon);
    
    // Create a new shape with the selected icon
    const newShape = {
      type: 'icon' as const,
      x: 100,
      y: 100,
      width: 64,
      height: 64,
      svg: icon.svg,
      name: icon.name,
      category: icon.category,
      fill: '#000000',
      stroke: 'none',
      strokeWidth: 0,
      rotation: 0,
      scaleX: 1,
      scaleY: 1,
      opacity: 1,
      visible: true,
      zIndex: state.shapes.length,
      isSelected: false,
      isDragging: false,
      isResizing: false,
      isRotating: false,
      isCached: false,
      perfectDrawEnabled: true,
      listening: true,
      boundaryState: {
        isWithinBounds: true,
        violationType: null
      },
      locked: false,
      isGrouped: false
    };

    // Add the icon as a new shape to the canvas
    actions.addShape(newShape);
    
    // Close the panel after selection
    handleClose();
  };

  return (
    <>
      <button
        onClick={openPanel}
        className="toolbar-button w-12 h-12 rounded-lg flex items-center justify-center"
        title="Icon Library"
      >
        <AnimatedToolIcon
          icon={ImageIcon}
          animation="bounce"
          size="md"
          tooltip="Icon Library"
        />
      </button>

      {state.toolPanels['icon-library']?.isOpen && (
        <ToolPanel toolId="icon-library" title="Icon Library">
          <IconLibrary
            onIconSelect={handleIconSelect}
            onClose={handleClose}
          />
        </ToolPanel>
      )}
    </>
  );
}
