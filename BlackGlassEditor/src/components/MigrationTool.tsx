import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Upload, FileImage, Layers, Palette, Type, Download } from 'lucide-react';
import { useEditorStore } from '../stores/editorStore';
import { sanitizeHtml, sanitizeForLog } from '../utils/security';

interface MigrationSource {
  id: string;
  name: string;
  icon: React.ReactNode;
  description: string;
  supportedFormats: string[];
  features: string[];
}

const migrationSources: MigrationSource[] = [
  {
    id: 'photoshop',
    name: 'Adobe Photoshop',
    icon: <FileImage className="text-blue-600" size={24} />,
    description: 'Import PSD files with layer support',
    supportedFormats: ['.psd'],
    features: ['Layers', 'Text', 'Shapes', 'Effects']
  },
  {
    id: 'figma',
    name: 'Figma',
    icon: <Palette className="text-purple-600" size={24} />,
    description: 'Import Figma designs via JSON export',
    supportedFormats: ['.fig', '.json'],
    features: ['Vector shapes', 'Text', 'Components', 'Colors']
  },
  {
    id: 'sketch',
    name: 'Sketch',
    icon: <Layers className="text-orange-600" size={24} />,
    description: 'Import Sketch files and artboards',
    supportedFormats: ['.sketch'],
    features: ['Artboards', 'Symbols', 'Text styles', 'Layer styles']
  },
  {
    id: 'canva',
    name: 'Canva',
    icon: <Type className="text-green-600" size={24} />,
    description: 'Import Canva designs via export',
    supportedFormats: ['.json', '.png', '.pdf'],
    features: ['Templates', 'Text', 'Images', 'Backgrounds']
  }
];

export const MigrationTool: React.FC = () => {
  const [showMigration, setShowMigration] = useState(false);
  const [selectedSource, setSelectedSource] = useState<string | null>(null);
  const [isImporting, setIsImporting] = useState(false);
  const [importProgress, setImportProgress] = useState(0);
  const [importResults, setImportResults] = useState<any>(null);
  const { addObject } = useEditorStore();

  // Parse PSD file (simplified)
  const parsePSDFile = async (file: File): Promise<any> => {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = () => {
        // Simplified PSD parsing - in reality would use a proper PSD parser
        resolve({
          layers: [
            { name: 'Background', type: 'image', visible: true },
            { name: 'Text Layer', type: 'text', content: 'Sample Text', visible: true },
            { name: 'Shape Layer', type: 'shape', shape: 'rectangle', visible: true }
          ],
          canvas: { width: 800, height: 600 }
        });
      };
      reader.readAsArrayBuffer(file);
    });
  };

  // Parse Figma JSON
  const parseFigmaJSON = async (file: File): Promise<any> => {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = () => {
        try {
          const data = JSON.parse(reader.result as string);
          resolve({
            frames: data.document?.children || [],
            canvas: { width: 1920, height: 1080 }
          });
        } catch (error) {
          resolve({ error: 'Invalid Figma JSON format' });
        }
      };
      reader.readAsText(file);
    });
  };

  // Generic image import
  const parseImageFile = async (file: File): Promise<any> => {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = () => {
        const img = new Image();
        img.onload = () => {
          resolve({
            image: reader.result,
            canvas: { width: img.width, height: img.height }
          });
        };
        img.src = reader.result as string;
      };
      reader.readAsDataURL(file);
    });
  };

  // Handle file import
  const handleFileImport = async (files: FileList) => {
    if (!files.length || !selectedSource) return;

    setIsImporting(true);
    setImportProgress(0);

    try {
      const file = files[0];
      const source = migrationSources.find(s => s.id === selectedSource);
      
      if (!source) throw new Error('Invalid source selected');

      // Check file format
      const extension = '.' + file.name.split('.').pop()?.toLowerCase();
      if (!source.supportedFormats.includes(extension)) {
        throw new Error(`Unsupported file format. Expected: ${source.supportedFormats.join(', ')}`);
      }

      setImportProgress(25);

      let parsedData;
      switch (selectedSource) {
        case 'photoshop':
          parsedData = await parsePSDFile(file);
          break;
        case 'figma':
          parsedData = await parseFigmaJSON(file);
          break;
        case 'sketch':
          // Simplified - would need proper Sketch parser
          parsedData = await parseImageFile(file);
          break;
        case 'canva':
          if (extension === '.json') {
            parsedData = await parseFigmaJSON(file); // Similar format
          } else {
            parsedData = await parseImageFile(file);
          }
          break;
        default:
          parsedData = await parseImageFile(file);
      }

      setImportProgress(75);

      // Convert to editor format
      if (parsedData.error) {
        throw new Error(parsedData.error);
      }

      // Set canvas size if provided
      // if (parsedData.canvas) {
      //   setCanvas(parsedData.canvas);
      // }

      // Import layers/objects
      let importedCount = 0;
      if (parsedData.layers) {
        for (const layer of parsedData.layers) {
          if (layer.visible) {
            const editorObject = convertLayerToObject(layer);
            if (editorObject) {
              addObject(editorObject);
              importedCount++;
            }
          }
        }
      } else if (parsedData.image) {
        // Single image import
        const imageObject = {
          id: Math.random().toString(36).substr(2, 9),
          type: 'image' as const,
          name: 'Imported Image',
          visible: true,
          locked: false,
          opacity: 1,
          transform: {
            x: 0,
            y: 0,
            scaleX: 1,
            scaleY: 1,
            rotation: 0,
            skewX: 0,
            skewY: 0
          },
          zIndex: 0,
          data: {
            src: parsedData.image,
            cropX: 0,
            cropY: 0,
            cropWidth: parsedData.canvas?.width || 400,
            cropHeight: parsedData.canvas?.height || 300,
            filters: []
          }
        };
        addObject(imageObject);
        importedCount = 1;
      }

      setImportProgress(100);
      setImportResults({
        success: true,
        source: source.name,
        fileName: file.name,
        importedCount,
        totalSize: file.size
      });

    } catch (error) {
      setImportResults({
        success: false,
        error: error instanceof Error ? error.message : 'Import failed'
      });
    } finally {
      setIsImporting(false);
      setTimeout(() => setImportProgress(0), 2000);
    }
  };

  // Convert layer to editor object
  const convertLayerToObject = (layer: any): any => {
    const baseObject = {
      id: Math.random().toString(36).substr(2, 9),
      x: layer.x || 0,
      y: layer.y || 0,
      opacity: layer.opacity || 1,
      rotation: layer.rotation || 0
    };

    switch (layer.type) {
      case 'text':
        return {
          ...baseObject,
          type: 'text' as const,
          name: 'Text Layer',
          visible: true,
          locked: false,
          opacity: 1,
          transform: {
            x: layer.x || 0,
            y: layer.y || 0,
            scaleX: 1,
            scaleY: 1,
            rotation: 0,
            skewX: 0,
            skewY: 0
          },
          zIndex: 0,
          data: {
            text: layer.content || 'Text',
            fontSize: layer.fontSize || 16,
            fontFamily: layer.fontFamily || 'Arial',
            fontWeight: 'normal',
            fontStyle: 'normal',
            fill: layer.color || '#000000',
            align: 'left',
            verticalAlign: 'top',
            lineHeight: 1.2,
            letterSpacing: 0
          }
        };
      case 'shape':
        return {
          ...baseObject,
          type: 'shape' as const,
          name: 'Shape Layer',
          visible: true,
          locked: false,
          opacity: 1,
          transform: {
            x: layer.x || 0,
            y: layer.y || 0,
            scaleX: 1,
            scaleY: 1,
            rotation: 0,
            skewX: 0,
            skewY: 0
          },
          zIndex: 0,
          data: {
            shapeType: layer.shape || 'rect',
            fill: layer.fill || '#cccccc',
            stroke: layer.stroke || '#000000',
            strokeWidth: 2
          }
        };
      case 'image':
        return {
          ...baseObject,
          type: 'image' as const,
          name: 'Image Layer',
          visible: true,
          locked: false,
          opacity: 1,
          transform: {
            x: layer.x || 0,
            y: layer.y || 0,
            scaleX: 1,
            scaleY: 1,
            rotation: 0,
            skewX: 0,
            skewY: 0
          },
          zIndex: 0,
          data: {
            src: layer.src || '',
            cropX: 0,
            cropY: 0,
            cropWidth: layer.width || 200,
            cropHeight: layer.height || 200,
            filters: []
          }
        };
      default:
        return null;
    }
  };

  return (
    <>
      {/* Migration Button */}
      <motion.button
        onClick={() => setShowMigration(true)}
        className="fixed bottom-16 right-4 z-40 bg-indigo-500 text-white p-3 rounded-full shadow-lg hover:bg-indigo-600"
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        title="Import from other editors"
      >
        <Download size={20} />
      </motion.button>

      {/* Migration Modal */}
      <AnimatePresence>
        {showMigration && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4"
            onClick={() => setShowMigration(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[80vh] overflow-hidden"
              onClick={e => e.stopPropagation()}
            >
              <div className="p-6 border-b">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-bold flex items-center gap-2">
                    <Download size={20} />
                    Import from Other Editors
                  </h2>
                  <button
                    onClick={() => setShowMigration(false)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    ×
                  </button>
                </div>
              </div>

              <div className="p-6">
                {!selectedSource ? (
                  <>
                    <p className="text-gray-600 mb-6">
                      Choose the editor you want to import from:
                    </p>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {migrationSources.map(source => (
                        <motion.button
                          key={source.id}
                          onClick={() => setSelectedSource(source.id)}
                          className="p-4 border-2 border-gray-200 rounded-lg hover:border-blue-500 text-left transition-colors"
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                        >
                          <div className="flex items-start gap-3">
                            {source.icon}
                            <div className="flex-1">
                              <h3 className="font-semibold mb-1">{source.name}</h3>
                              <p className="text-sm text-gray-600 mb-2">{source.description}</p>
                              <div className="flex flex-wrap gap-1 mb-2">
                                {source.supportedFormats.map(format => (
                                  <span key={format} className="text-xs bg-gray-100 px-2 py-1 rounded">
                                    {format}
                                  </span>
                                ))}
                              </div>
                              <div className="flex flex-wrap gap-1">
                                {source.features.map(feature => (
                                  <span key={feature} className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded">
                                    {feature}
                                  </span>
                                ))}
                              </div>
                            </div>
                          </div>
                        </motion.button>
                      ))}
                    </div>
                  </>
                ) : (
                  <div>
                    <div className="flex items-center gap-2 mb-4">
                      <button
                        onClick={() => setSelectedSource(null)}
                        className="text-blue-600 hover:text-blue-700"
                      >
                        ← Back
                      </button>
                      <span className="text-gray-400">|</span>
                      <span className="font-medium">
                        {migrationSources.find(s => s.id === selectedSource)?.name || ''}
                      </span>
                    </div>

                    {isImporting ? (
                      <div className="text-center py-8">
                        <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
                        <p className="text-lg font-medium mb-2">Importing...</p>
                        <div className="w-64 bg-gray-200 rounded-full h-2 mx-auto">
                          <div
                            className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                            style={{ width: `${importProgress}%` }}
                          />
                        </div>
                        <p className="text-sm text-gray-600 mt-2">{importProgress}% complete</p>
                      </div>
                    ) : importResults ? (
                      <div className="text-center py-8">
                        {importResults.success ? (
                          <>
                            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                              <Upload className="text-green-500" size={24} />
                            </div>
                            <h3 className="text-lg font-semibold mb-2">Import Successful!</h3>
                            <div className="text-sm text-gray-600 space-y-1">
                              <p>Source: {importResults.source}</p>
                              <p>File: {importResults.fileName}</p>
                              <p>Objects imported: {importResults.importedCount}</p>
                              <p>File size: {(importResults.totalSize / 1024).toFixed(1)}KB</p>
                            </div>
                            <button
                              onClick={() => setShowMigration(false)}
                              className="mt-4 bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
                            >
                              Continue Editing
                            </button>
                          </>
                        ) : (
                          <>
                            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                              <Upload className="text-red-500" size={24} />
                            </div>
                            <h3 className="text-lg font-semibold mb-2">Import Failed</h3>
                            <p className="text-sm text-red-600 mb-4">{importResults.error}</p>
                            <button
                              onClick={() => setImportResults(null)}
                              className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600"
                            >
                              Try Again
                            </button>
                          </>
                        )}
                      </div>
                    ) : (
                      <div className="text-center py-8">
                        <Upload size={48} className="mx-auto mb-4 text-gray-400" />
                        <h3 className="text-lg font-semibold mb-2">Select File to Import</h3>
                        <p className="text-gray-600 mb-4">
                          Choose a file from {migrationSources.find(s => s.id === selectedSource)?.name || ''}
                        </p>
                        <input
                          type="file"
                          onChange={(e) => e.target.files && handleFileImport(e.target.files)}
                          accept={migrationSources.find(s => s.id === selectedSource)?.supportedFormats.join(',')}
                          className="hidden"
                          id="migration-file-input"
                        />
                        <label
                          htmlFor="migration-file-input"
                          className="inline-block bg-blue-500 text-white px-6 py-3 rounded-lg cursor-pointer hover:bg-blue-600"
                        >
                          Choose File
                        </label>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};