import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Code2, Play, Copy, CheckCircle } from 'lucide-react';

interface APIEndpoint {
  id: string;
  method: 'GET' | 'POST' | 'PUT' | 'DELETE';
  path: string;
  description: string;
  parameters?: Parameter[];
  response: string;
  example: string;
  category: 'objects' | 'canvas' | 'export' | 'tools' | 'history';
}

interface Parameter {
  name: string;
  type: string;
  required: boolean;
  description: string;
  default?: string;
}

export const APIDocumentation: React.FC = () => {
  const [showAPI, setShowAPI] = useState(false);
  const [selectedEndpoint, setSelectedEndpoint] = useState<string>('add-object');
  const [testResults, setTestResults] = useState<Record<string, any>>({});

  const apiEndpoints: APIEndpoint[] = [
    {
      id: 'add-object',
      method: 'POST',
      path: '/api/objects',
      description: 'Add a new object to the canvas',
      category: 'objects',
      parameters: [
        { name: 'type', type: 'string', required: true, description: 'Object type (text, shape, image)' },
        { name: 'x', type: 'number', required: true, description: 'X position on canvas' },
        { name: 'y', type: 'number', required: true, description: 'Y position on canvas' },
        { name: 'properties', type: 'object', required: false, description: 'Object-specific properties' }
      ],
      response: `{
  "id": "obj_123",
  "type": "text",
  "x": 100,
  "y": 50,
  "created": "2024-01-01T00:00:00Z"
}`,
      example: `// Add text object
const response = await fetch('/api/objects', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    type: 'text',
    x: 100,
    y: 50,
    properties: {
      text: 'Hello World',
      fontSize: 24,
      fill: '#333333'
    }
  })
});`
    },
    {
      id: 'get-objects',
      method: 'GET',
      path: '/api/objects',
      description: 'Get all objects on the canvas',
      category: 'objects',
      response: `{
  "objects": [
    {
      "id": "obj_123",
      "type": "text",
      "x": 100,
      "y": 50,
      "text": "Hello World"
    }
  ],
  "count": 1
}`,
      example: `// Get all objects
const response = await fetch('/api/objects');
const data = await response.json();
console.log(data.objects);`
    },
    {
      id: 'update-object',
      method: 'PUT',
      path: '/api/objects/:id',
      description: 'Update an existing object',
      category: 'objects',
      parameters: [
        { name: 'id', type: 'string', required: true, description: 'Object ID' },
        { name: 'updates', type: 'object', required: true, description: 'Properties to update' }
      ],
      response: `{
  "id": "obj_123",
  "updated": true,
  "timestamp": "2024-01-01T00:00:00Z"
}`,
      example: `// Update object position
const response = await fetch('/api/objects/obj_123', {
  method: 'PUT',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    x: 200,
    y: 100
  })
});`
    },
    {
      id: 'set-canvas',
      method: 'POST',
      path: '/api/canvas/config',
      description: 'Configure canvas settings',
      category: 'canvas',
      parameters: [
        { name: 'width', type: 'number', required: false, description: 'Canvas width' },
        { name: 'height', type: 'number', required: false, description: 'Canvas height' },
        { name: 'background', type: 'string', required: false, description: 'Background color' }
      ],
      response: `{
  "width": 800,
  "height": 600,
  "background": "#ffffff",
  "updated": true
}`,
      example: `// Set canvas size
const response = await fetch('/api/canvas/config', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    width: 1200,
    height: 800,
    background: '#f0f0f0'
  })
});`
    },
    {
      id: 'export-canvas',
      method: 'POST',
      path: '/api/export',
      description: 'Export canvas in various formats',
      category: 'export',
      parameters: [
        { name: 'format', type: 'string', required: true, description: 'Export format (png, svg, json, pdf)' },
        { name: 'quality', type: 'string', required: false, description: 'Quality setting', default: 'medium' },
        { name: 'scale', type: 'number', required: false, description: 'Scale factor', default: '1' }
      ],
      response: `{
  "format": "png",
  "url": "https://example.com/export/canvas_123.png",
  "size": 1024576,
  "timestamp": "2024-01-01T00:00:00Z"
}`,
      example: `// Export as PNG
const response = await fetch('/api/export', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    format: 'png',
    quality: 'high',
    scale: 2
  })
});`
    },
    {
      id: 'set-tool',
      method: 'POST',
      path: '/api/tools/active',
      description: 'Set the active tool',
      category: 'tools',
      parameters: [
        { name: 'tool', type: 'string', required: true, description: 'Tool name (select, text, shape, image, pan, zoom)' }
      ],
      response: `{
  "tool": "text",
  "active": true,
  "timestamp": "2024-01-01T00:00:00Z"
}`,
      example: `// Activate text tool
const response = await fetch('/api/tools/active', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    tool: 'text'
  })
});`
    },
    {
      id: 'undo',
      method: 'POST',
      path: '/api/history/undo',
      description: 'Undo the last action',
      category: 'history',
      response: `{
  "undone": true,
  "action": "add_object",
  "timestamp": "2024-01-01T00:00:00Z"
}`,
      example: `// Undo last action
const response = await fetch('/api/history/undo', {
  method: 'POST'
});`
    },
    {
      id: 'redo',
      method: 'POST',
      path: '/api/history/redo',
      description: 'Redo the last undone action',
      category: 'history',
      response: `{
  "redone": true,
  "action": "add_object",
  "timestamp": "2024-01-01T00:00:00Z"
}`,
      example: `// Redo last action
const response = await fetch('/api/history/redo', {
  method: 'POST'
});`
    }
  ];

  const categories = [
    { id: 'objects', name: 'Objects', color: 'bg-blue-100 text-blue-800' },
    { id: 'canvas', name: 'Canvas', color: 'bg-green-100 text-green-800' },
    { id: 'export', name: 'Export', color: 'bg-purple-100 text-purple-800' },
    { id: 'tools', name: 'Tools', color: 'bg-orange-100 text-orange-800' },
    { id: 'history', name: 'History', color: 'bg-gray-100 text-gray-800' }
  ];

  const selectedEndpointData = apiEndpoints.find(e => e.id === selectedEndpoint);

  const testEndpoint = async (endpoint: APIEndpoint) => {
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const mockResponse = JSON.parse(endpoint.response);
      setTestResults(prev => ({
        ...prev,
        [endpoint.id]: {
          success: true,
          data: mockResponse,
          timestamp: new Date().toISOString()
        }
      }));
    } catch (error) {
      setTestResults(prev => ({
        ...prev,
        [endpoint.id]: {
          success: false,
          error: error instanceof Error ? error.message : 'Unknown error',
          timestamp: new Date().toISOString()
        }
      }));
    }
  };

  const copyCode = (code: string) => {
    navigator.clipboard.writeText(code);
  };

  const getMethodColor = (method: string) => {
    switch (method) {
      case 'GET': return 'bg-green-100 text-green-800';
      case 'POST': return 'bg-blue-100 text-blue-800';
      case 'PUT': return 'bg-yellow-100 text-yellow-800';
      case 'DELETE': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (!showAPI) {
    return (
      <motion.button
        onClick={() => setShowAPI(true)}
        className="fixed bottom-16 right-4 z-40 bg-green-600 text-white p-3 rounded-full shadow-lg hover:bg-green-700"
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        title="API Documentation"
      >
        <Code2 size={20} />
      </motion.button>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4"
      onClick={() => setShowAPI(false)}
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
              <h2 className="text-lg font-bold">API Reference</h2>
              <button
                onClick={() => setShowAPI(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                ×
              </button>
            </div>
          </div>
          
          {/* Endpoints by Category */}
          <div className="p-4">
            {categories.map(category => {
              const endpointsInCategory = apiEndpoints.filter(e => e.category === category.id);
              
              return (
                <div key={category.id} className="mb-4">
                  <div className={`text-xs font-semibold px-2 py-1 rounded mb-2 ${category.color}`}>
                    {category.name}
                  </div>
                  <div className="space-y-1">
                    {endpointsInCategory.map(endpoint => (
                      <button
                        key={endpoint.id}
                        onClick={() => setSelectedEndpoint(endpoint.id)}
                        className={`w-full text-left p-2 rounded text-sm transition-colors ${
                          selectedEndpoint === endpoint.id
                            ? 'bg-blue-100 text-blue-700'
                            : 'hover:bg-gray-100'
                        }`}
                      >
                        <div className="flex items-center gap-2 mb-1">
                          <span className={`text-xs px-1 rounded font-mono ${getMethodColor(endpoint.method)}`}>
                            {endpoint.method}
                          </span>
                        </div>
                        <div className="font-mono text-xs text-gray-600">{endpoint.path}</div>
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
          {selectedEndpointData && (
            <>
              <div className="p-4 border-b">
                <div className="flex items-center gap-3 mb-2">
                  <span className={`px-2 py-1 rounded text-sm font-mono ${getMethodColor(selectedEndpointData.method)}`}>
                    {selectedEndpointData.method}
                  </span>
                  <code className="text-lg font-mono">{selectedEndpointData.path}</code>
                </div>
                <p className="text-gray-600">{selectedEndpointData.description}</p>
              </div>
              
              <div className="flex-1 overflow-y-auto p-6">
                <div className="max-w-4xl space-y-6">
                  {/* Parameters */}
                  {selectedEndpointData.parameters && (
                    <div>
                      <h3 className="text-lg font-semibold mb-3">Parameters</h3>
                      <div className="overflow-x-auto">
                        <table className="w-full border border-gray-200 rounded-lg">
                          <thead className="bg-gray-50">
                            <tr>
                              <th className="px-4 py-2 text-left text-sm font-medium">Name</th>
                              <th className="px-4 py-2 text-left text-sm font-medium">Type</th>
                              <th className="px-4 py-2 text-left text-sm font-medium">Required</th>
                              <th className="px-4 py-2 text-left text-sm font-medium">Description</th>
                            </tr>
                          </thead>
                          <tbody>
                            {selectedEndpointData.parameters.map(param => (
                              <tr key={param.name} className="border-t">
                                <td className="px-4 py-2 font-mono text-sm">{param.name}</td>
                                <td className="px-4 py-2 text-sm">{param.type}</td>
                                <td className="px-4 py-2 text-sm">
                                  {param.required ? (
                                    <span className="text-red-600">Yes</span>
                                  ) : (
                                    <span className="text-gray-500">No</span>
                                  )}
                                </td>
                                <td className="px-4 py-2 text-sm">{param.description}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}

                  {/* Response */}
                  <div>
                    <h3 className="text-lg font-semibold mb-3">Response</h3>
                    <div className="bg-gray-900 rounded-lg p-4">
                      <pre className="text-green-400 text-sm overflow-x-auto">
                        <code>{selectedEndpointData.response}</code>
                      </pre>
                    </div>
                  </div>

                  {/* Example */}
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="text-lg font-semibold">Example</h3>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => copyCode(selectedEndpointData.example)}
                          className="flex items-center gap-1 px-3 py-1 bg-gray-100 rounded hover:bg-gray-200 text-sm"
                        >
                          <Copy size={14} />
                          Copy
                        </button>
                        <button
                          onClick={() => testEndpoint(selectedEndpointData)}
                          className="flex items-center gap-1 px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600 text-sm"
                        >
                          <Play size={14} />
                          Test
                        </button>
                      </div>
                    </div>
                    <div className="bg-gray-900 rounded-lg p-4">
                      <pre className="text-blue-400 text-sm overflow-x-auto">
                        <code>{selectedEndpointData.example}</code>
                      </pre>
                    </div>
                  </div>

                  {/* Test Results */}
                  {testResults[selectedEndpointData.id] && (
                    <div>
                      <h3 className="text-lg font-semibold mb-3">Test Result</h3>
                      <div className={`p-4 rounded-lg ${
                        testResults[selectedEndpointData.id].success 
                          ? 'bg-green-50 border border-green-200' 
                          : 'bg-red-50 border border-red-200'
                      }`}>
                        <div className="flex items-center gap-2 mb-2">
                          <CheckCircle 
                            size={16} 
                            className={testResults[selectedEndpointData.id].success ? 'text-green-600' : 'text-red-600'} 
                          />
                          <span className="font-medium">
                            {testResults[selectedEndpointData.id].success ? 'Success' : 'Error'}
                          </span>
                        </div>
                        <pre className="text-sm overflow-x-auto">
                          {JSON.stringify(
                            testResults[selectedEndpointData.id].data || testResults[selectedEndpointData.id].error, 
                            null, 
                            2
                          )}
                        </pre>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
};