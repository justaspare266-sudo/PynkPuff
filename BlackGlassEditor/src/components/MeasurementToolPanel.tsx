'use client';

import React from 'react';
import { useEditor } from '../contexts/EditorContext';
import { ToolPanel } from './ToolPanel';
import MeasurementTool from './MeasurementTool';
import { Ruler } from 'lucide-react';
import AnimatedToolIcon from './AnimatedToolIcon';

export function MeasurementToolPanel() {
  const { state, actions } = useEditor();

  const openPanel = () => {
    actions.openToolPanel('measurement-tool', { x: 100, y: 100 });
  };

  const handleClose = () => {
    actions.closeToolPanel('measurement-tool');
  };

  const handleMeasurementAdd = (measurement: any) => {
    console.log('Measurement added:', measurement);
    // Add measurement to canvas or measurement system
  };

  const handleMeasurementUpdate = (id: string, updates: any) => {
    console.log('Measurement updated:', id, updates);
    // Update measurement in system
  };

  const handleMeasurementRemove = (id: string) => {
    console.log('Measurement removed:', id);
    // Remove measurement from system
  };

  const handleConfigChange = (config: any) => {
    console.log('Measurement config changed:', config);
    // Update measurement configuration
  };

  return (
    <>
      <button
        onClick={openPanel}
        className="toolbar-button w-12 h-12 rounded-lg flex items-center justify-center"
        title="Measurement Tool"
      >
        <AnimatedToolIcon
          icon={Ruler}
          animation="ping"
          size="md"
          tooltip="Measurement Tool"
        />
      </button>

      {state.toolPanels['measurement-tool']?.isOpen && (
        <ToolPanel toolId="measurement-tool" title="Measurement Tool">
          <MeasurementTool
            canvasWidth={1200}
            canvasHeight={800}
            zoom={1}
            panX={0}
            panY={0}
            config={{
              showMeasurements: true,
              showLabels: true,
              showValues: true,
              unit: 'px',
              precision: 1,
              measurementColor: '#00ff00',
              labelColor: '#333333',
              backgroundColor: '#ffffff',
              fontSize: 12,
              lineWidth: 2,
              snapToGrid: true,
              snapToGuides: true,
              autoLabel: true,
              showAngles: true,
              showAreas: true
            }}
            onConfigChange={handleConfigChange}
            onMeasurementAdd={handleMeasurementAdd}
            onMeasurementUpdate={handleMeasurementUpdate}
            onMeasurementRemove={handleMeasurementRemove}
          />
        </ToolPanel>
      )}
    </>
  );
}
