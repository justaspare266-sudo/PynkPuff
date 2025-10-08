'use client';

import React from 'react';
import { EditorProvider } from './contexts/EditorContext';
import { IntegratedEditor } from './components/IntegratedEditor';

export default function IntegratedTest() {
  return (
    <EditorProvider>
      <IntegratedEditor />
    </EditorProvider>
  );
}
