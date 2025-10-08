import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Book, Download, Search, Copy, ExternalLink } from 'lucide-react';

interface DocSection {
  id: string;
  title: string;
  content: string;
  code?: string;
  category: 'getting-started' | 'api' | 'components' | 'hooks' | 'utils' | 'examples';
}

export const DocumentationGenerator: React.FC = () => {
  const [showDocs, setShowDocs] = useState(false);
  const [selectedSection, setSelectedSection] = useState<string>('overview');
  const [searchTerm, setSearchTerm] = useState('');

  const docSections: DocSection[] = [
    {
      id: 'overview',
      title: 'Overview',
      category: 'getting-started',
      content: `# Master Image Editor

Professional-grade image editor with Photoshop-level features built with React, TypeScript, and Konva.

## Features
- Advanced text editing with typography controls
- Shape tools with vector graphics support
- Image manipulation with filters and effects
- Layer management with grouping and blending
- AI-powered design suggestions
- Real-time collaboration
- Cross-platform compatibility

## Architecture
The editor follows a modular architecture with:
- **Core**: Canvas rendering and object management
- **Tools**: Individual tool implementations
- **Components**: UI components and panels
- **Stores**: State management with Zustand
- **Utils**: Helper functions and utilities`
    },
    {
      id: 'installation',
      title: 'Installation',
      category: 'getting-started',
      content: `# Installation

## Prerequisites
- Node.js 18+ 
- npm or yarn

## Quick Start
\`\`\`bash
# Clone the repository
git clone https://github.com/your-org/master-image-editor.git

# Install dependencies
cd master-image-editor
npm install

# Start development server
npm run dev
\`\`\`

## Production Build
\`\`\`bash
# Build for production
npm run build

# Preview production build
npm run preview
\`\`\``,
      code: `// Basic usage
import { MasterImageEditor } from './components/MasterImageEditor';

function App() {
  return <MasterImageEditor />;
}`
    },
    {
      id: 'editor-store',
      title: 'Editor Store',
      category: 'api',
      content: `# Editor Store

The main state management store for the editor using Zustand.

## State Structure
- \`objects\`: Array of canvas objects
- \`selectedTool\`: Currently active tool
- \`canvas\`: Canvas configuration
- \`history\`: Undo/redo state

## Methods
- \`addObject(object)\`: Add new object to canvas
- \`updateObject(id, updates)\`: Update existing object
- \`deleteObject(id)\`: Remove object from canvas
- \`setSelectedTool(tool)\`: Change active tool`,
      code: `import { useEditorStore } from '../stores/editorStore';

function MyComponent() {
  const { objects, addObject, selectedTool } = useEditorStore();
  
  const handleAddText = () => {
    addObject({
      id: 'text-1',
      type: 'text',
      x: 100,
      y: 100,
      text: 'Hello World',
      fontSize: 24
    });
  };
  
  return <button onClick={handleAddText}>Add Text</button>;
}`
    },
    {
      id: 'canvas-component',
      title: 'Canvas Component',
      category: 'components',
      content: `# Canvas Component

The main canvas component that renders objects using Konva.

## Props
- \`width\`: Canvas width in pixels
- \`height\`: Canvas height in pixels
- \`onObjectSelect\`: Callback when object is selected

## Features
- Hardware-accelerated rendering
- Multi-object selection
- Drag and drop support
- Zoom and pan controls`,
      code: `import { Canvas } from '../core/Canvas';

<Canvas 
  width={800} 
  height={600}
  onObjectSelect={(id) => console.log('Selected:', id)}
/>`
    },
    {
      id: 'text-tool',
      title: 'Text Tool',
      category: 'components',
      content: `# Text Tool

Advanced text editing with typography controls.

## Features
- Live text editing
- Font family and size controls
- Color and opacity settings
- Text alignment options
- Advanced typography (kerning, line height)

## Usage
Select the text tool and click on canvas to create text objects.`,
      code: `// Text object structure
interface TextObject {
  id: string;
  type: 'text';
  x: number;
  y: number;
  text: string;
  fontSize: number;
  fontFamily: string;
  fill: string;
  align: 'left' | 'center' | 'right';
}`
    },
    {
      id: 'keyboard-shortcuts',
      title: 'Keyboard Shortcuts',
      category: 'hooks',
      content: `# Keyboard Shortcuts

The editor supports comprehensive keyboard shortcuts for efficient workflow.

## Tool Selection
- \`V\`: Select tool
- \`T\`: Text tool  
- \`R\`: Rectangle tool
- \`I\`: Image tool
- \`H\`: Pan tool
- \`Z\`: Zoom tool

## Actions
- \`Ctrl+Z\`: Undo
- \`Ctrl+Y\`: Redo
- \`Ctrl+C\`: Copy
- \`Ctrl+V\`: Paste
- \`Delete\`: Delete selected objects`,
      code: `import { useKeyboardShortcuts } from '../hooks/useKeyboardShortcuts';

function MyComponent() {
  useKeyboardShortcuts();
  // Shortcuts are automatically active
  return <div>Editor with shortcuts</div>;
}`
    },
    {
      id: 'export-utils',
      title: 'Export Utilities',
      category: 'utils',
      content: `# Export Utilities

Utilities for exporting canvas content in various formats.

## Supported Formats
- PNG: Raster image export
- SVG: Vector graphics export  
- JSON: Project data export
- PDF: Document export

## Quality Options
- Low: Fast export, smaller file size
- Medium: Balanced quality and size
- High: Maximum quality, larger file size`,
      code: `import { exportCanvas } from '../utils/export';

// Export as PNG
const pngBlob = await exportCanvas('png', { quality: 'high' });

// Export as SVG
const svgString = await exportCanvas('svg');

// Export project data
const projectData = await exportCanvas('json');`
    },
    {
      id: 'basic-example',
      title: 'Basic Example',
      category: 'examples',
      content: `# Basic Example

A simple example showing how to create a basic image editor.

This example demonstrates:
- Setting up the editor
- Adding objects programmatically
- Handling user interactions
- Exporting the result`,
      code: `import React from 'react';
import { MasterImageEditor } from './components/MasterImageEditor';
import { useEditorStore } from './stores/editorStore';

function BasicExample() {
  const { addObject } = useEditorStore();
  
  const addSampleText = () => {
    addObject({
      id: 'sample-text',
      type: 'text',
      x: 50,
      y: 50,
      text: 'Sample Text',
      fontSize: 32,
      fill: '#333333'
    });
  };
  
  return (
    <div>
      <button onClick={addSampleText}>Add Sample Text</button>
      <MasterImageEditor />
    </div>
  );
}`
    }
  ];

  const categories = [
    { id: 'getting-started', name: 'Getting Started', icon: '🚀' },
    { id: 'api', name: 'API Reference', icon: '📚' },
    { id: 'components', name: 'Components', icon: '🧩' },
    { id: 'hooks', name: 'Hooks', icon: '🪝' },
    { id: 'utils', name: 'Utilities', icon: '🛠️' },
    { id: 'examples', name: 'Examples', icon: '💡' }
  ];

  const filteredSections = docSections.filter(section =>
    section.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    section.content.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const selectedSectionData = docSections.find(s => s.id === selectedSection);

  const copyCode = (code: string) => {
    navigator.clipboard.writeText(code);
  };

  const exportDocs = () => {
    const docsContent = docSections.map(section => 
      `# ${section.title}\n\n${section.content}\n\n${section.code ? `\`\`\`typescript\n${section.code}\n\`\`\`` : ''}\n\n---\n\n`
    ).join('');
    
    const blob = new Blob([docsContent], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'master-image-editor-docs.md';
    a.click();
    URL.revokeObjectURL(url);
  };

  if (!showDocs) {
    return (
      <motion.button
        onClick={() => setShowDocs(true)}
        className="fixed bottom-4 right-4 z-40 bg-blue-600 text-white p-3 rounded-full shadow-lg hover:bg-blue-700"
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        title="Documentation"
      >
        <Book size={20} />
      </motion.button>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4"
      onClick={() => setShowDocs(false)}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="bg-white rounded-lg shadow-xl w-full max-w-6xl h-[90vh] flex overflow-hidden"
        onClick={e => e.stopPropagation()}
      >
        {/* Sidebar */}
        <div className="w-80 bg-gray-50 border-r overflow-y-auto">
          <div className="p-4 border-b">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold">Documentation</h2>
              <button
                onClick={() => setShowDocs(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                ×
              </button>
            </div>
            
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
              <input
                type="text"
                placeholder="Search docs..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border rounded-lg text-sm"
              />
            </div>
          </div>
          
          {/* Navigation */}
          <div className="p-4">
            {categories.map(category => {
              const sectionsInCategory = filteredSections.filter(s => s.category === category.id);
              if (sectionsInCategory.length === 0) return null;
              
              return (
                <div key={category.id} className="mb-4">
                  <h3 className="text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                    <span>{category.icon}</span>
                    {category.name}
                  </h3>
                  <div className="space-y-1">
                    {sectionsInCategory.map(section => (
                      <button
                        key={section.id}
                        onClick={() => setSelectedSection(section.id)}
                        className={`w-full text-left px-3 py-2 rounded text-sm transition-colors ${
                          selectedSection === section.id
                            ? 'bg-blue-100 text-blue-700'
                            : 'hover:bg-gray-100'
                        }`}
                      >
                        {section.title}
                      </button>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 flex flex-col">
          <div className="p-4 border-b flex items-center justify-between">
            <h1 className="text-xl font-bold">{selectedSectionData?.title}</h1>
            <div className="flex items-center gap-2">
              <button
                onClick={exportDocs}
                className="flex items-center gap-2 px-3 py-1 bg-gray-100 rounded hover:bg-gray-200 text-sm"
              >
                <Download size={14} />
                Export
              </button>
              <a
                href="https://github.com/your-org/master-image-editor"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 px-3 py-1 bg-gray-100 rounded hover:bg-gray-200 text-sm"
              >
                <ExternalLink size={14} />
                GitHub
              </a>
            </div>
          </div>
          
          <div className="flex-1 overflow-y-auto p-6">
            {selectedSectionData && (
              <div className="max-w-4xl">
                {/* Content */}
                <div className="prose max-w-none mb-6">
                  <pre className="whitespace-pre-wrap text-sm leading-relaxed">
                    {selectedSectionData.content}
                  </pre>
                </div>
                
                {/* Code Example */}
                {selectedSectionData.code && (
                  <div className="bg-gray-900 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-gray-300 text-sm">Code Example</span>
                      <button
                        onClick={() => copyCode(selectedSectionData.code!)}
                        className="flex items-center gap-1 text-gray-300 hover:text-white text-sm"
                      >
                        <Copy size={14} />
                        Copy
                      </button>
                    </div>
                    <pre className="text-green-400 text-sm overflow-x-auto">
                      <code>{selectedSectionData.code}</code>
                    </pre>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};