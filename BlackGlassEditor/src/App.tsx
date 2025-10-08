'use client';

import React from 'react';
import BlackGlassEditor from './components/BlackGlassEditor';

export default function App() {
  return (
    <div className="w-full h-screen">
      <BlackGlassEditor 
        width={1200} 
        height={800}
      />
    </div>
  );
}
