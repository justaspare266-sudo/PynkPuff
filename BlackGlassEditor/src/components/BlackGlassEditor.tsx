'use client';

import React from 'react';
import { EditorProvider } from '../contexts/EditorContext';
import { BG_Canvas_Enhanced } from './BG_Canvas_Enhanced';

interface BlackGlassEditorProps {
  width?: number;
  height?: number;
  initialShapes?: any[];
}

export function BlackGlassEditor({ 
  width = 1200, 
  height = 800, 
  initialShapes = [] 
}: BlackGlassEditorProps) {
  return (
    <EditorProvider>
      <div className="w-full h-screen">
        <BG_Canvas_Enhanced width={width} height={height} />
      </div>
    </EditorProvider>
  );
}

export default BlackGlassEditor;
