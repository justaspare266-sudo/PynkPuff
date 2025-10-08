'use client';

import React from 'react';
import { EditorProvider } from './contexts/EditorContext';
import { PowerCanvas } from './components/PowerCanvas';

export default function PowerTest() {
  return (
    <EditorProvider>
      <PowerCanvas />
    </EditorProvider>
  );
}
