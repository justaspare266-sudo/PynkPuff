import React, { useState, useRef, useEffect } from 'react';
import { Stage, Layer, Text, Rect } from 'react-konva';
import BlackGlassTextEngine from './BlackGlassTextEngine/blackglass-text-engine';

interface BlackGlassTextToolProps {
  onTextAdd: (textData: any) => void;
  isActive: boolean;
}

const BlackGlassTextTool: React.FC<BlackGlassTextToolProps> = ({ onTextAdd, isActive }) => {
  const [showTextEngine, setShowTextEngine] = useState(false);
  const [textData, setTextData] = useState<any>(null);

  const handleTextEngineComplete = (data: any) => {
    setTextData(data);
    setShowTextEngine(false);
    onTextAdd(data);
  };

  if (!isActive) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black bg-opacity-50 flex items-center justify-center">
      <div className="bg-white rounded-lg shadow-xl max-w-6xl max-h-[90vh] overflow-hidden">
        <div className="flex">
          {/* Text Engine Panel */}
          <div className="w-1/2 border-r">
            <div className="p-4 border-b">
              <h2 className="text-xl font-bold">BlackGlass Text Engine</h2>
              <p className="text-sm text-gray-600">Create and style your text</p>
            </div>
            <div className="h-[calc(90vh-80px)] overflow-y-auto">
              <BlackGlassTextEngine onComplete={handleTextEngineComplete} />
            </div>
          </div>
          
          {/* Preview Panel */}
          <div className="w-1/2 p-4">
            <h3 className="text-lg font-semibold mb-4">Preview</h3>
            <div className="border border-gray-300 rounded-lg p-4 bg-gray-50">
              {textData ? (
                <div className="text-center">
                  <div 
                    className="inline-block p-4 bg-white rounded shadow"
                    style={{
                      fontFamily: textData.fontFamily || 'Arial',
                      fontSize: textData.fontSize || 16,
                      fontWeight: textData.fontWeight || 'normal',
                      color: textData.color || '#000000',
                      textAlign: textData.textAlign || 'left',
                      letterSpacing: textData.letterSpacing || 0,
                      lineHeight: textData.lineHeight || 1.2,
                    }}
                  >
                    {textData.text || 'Your text here'}
                  </div>
                </div>
              ) : (
                <div className="text-center text-gray-500 py-8">
                  Create text using the engine on the left
                </div>
              )}
            </div>
            
            <div className="mt-4 flex gap-2">
              <button
                onClick={() => setShowTextEngine(true)}
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
              >
                Open Text Engine
              </button>
              <button
                onClick={() => setShowTextEngine(false)}
                className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BlackGlassTextTool;
