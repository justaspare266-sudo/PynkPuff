'use client';

import React from 'react';
import { useEditor } from '../contexts/EditorContext';
import { ToolPanel } from './ToolPanel';
import { AnimationTimeline } from './AnimationTimeline';
import { Clock } from 'lucide-react';
import AnimatedToolIcon from './AnimatedToolIcon';

export function AnimationTimelinePanel() {
  const { state, actions } = useEditor();

  const openPanel = () => {
    actions.openToolPanel('animationTimeline', { x: 100, y: 600 });
  };

  const handleAnimationUpdate = (tracks: any[]) => {
    // Handle animation timeline updates
    console.log('Animation tracks updated:', tracks);
  };

  const handleDurationChange = (duration: number) => {
    // Handle duration changes
    console.log('Animation duration changed:', duration);
  };

  const handleClose = () => {
    actions.closeToolPanel('animationTimeline');
  };

  return (
    <>
      <button
        onClick={openPanel}
        className="toolbar-button w-12 h-12 rounded-lg flex items-center justify-center"
        title="Animation Timeline"
      >
        <AnimatedToolIcon
          icon={Clock}
          animation="float"
          size="md"
          tooltip="Animation Timeline"
        />
      </button>

      {state.toolPanels.animationTimeline?.isOpen && (
        <ToolPanel toolId="animationTimeline" title="Animation Timeline">
          <AnimationTimeline
            objects={state.shapes}
            duration={5000}
            onDurationChange={handleDurationChange}
            onAnimationUpdate={handleAnimationUpdate}
          />
        </ToolPanel>
      )}
    </>
  );
}