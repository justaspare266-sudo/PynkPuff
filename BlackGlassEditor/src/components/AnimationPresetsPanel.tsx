'use client';

import React from 'react';
import { useEditor } from '../contexts/EditorContext';
import { ToolPanel } from './ToolPanel';
import { AnimationPresets } from './AnimationPresets';
import { Play } from 'lucide-react';
import AnimatedToolIcon from './AnimatedToolIcon';

export function AnimationPresetsPanel() {
  const { state, actions } = useEditor();

  const openPanel = () => {
    actions.openToolPanel('animationPresets', { x: 100, y: 100 });
  };

  const handleClose = () => {
    actions.closeToolPanel('animationPresets');
  };

  return (
    <>
      <button
        onClick={openPanel}
        className="toolbar-button w-12 h-12 rounded-lg flex items-center justify-center"
        title="Animation Presets"
      >
        <AnimatedToolIcon
          icon={Play}
          animation="pulse"
          size="md"
          tooltip="Animation Presets"
        />
      </button>

      {state.toolPanels.animationPresets?.isOpen && (
        <ToolPanel toolId="animationPresets" title="Animation Presets">
          <AnimationPresets onClose={handleClose} />
        </ToolPanel>
      )}
    </>
  );
}
