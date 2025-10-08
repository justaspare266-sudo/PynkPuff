import React, { useRef, useState, useEffect } from 'react';
import opentype from 'opentype.js';

// Types
type LayerType = 'text' | 'image' | 'shape';

interface Layer {
  id: string;
  type: LayerType;
  x: number;
  y: number;
  width?: number;
  height?: number;
  rotation?: number;
  content?: string; // text content
  fontSize?: number;
  fontFamily?: string;
  bold?: boolean;
  italic?: boolean;
  underline?: boolean;
  underlineOffset?: number;
  letterSpacing?: number;
  lineHeight?: number;
  textTransform?: 'none' | 'uppercase' | 'lowercase' | 'capitalize';
  color?: string;
  imageSrc?: string;
  keyframes?: Keyframe[];
  visible?: boolean;
}

interface Keyframe {
  time: number; // in ms
  props: Partial<Layer>;
}

// Helper
const generateId = () => Math.random().toString(36).substring(2, 9);

// Main Component
const CanvasEditor: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [layers, setLayers] = useState<Layer[]>([]);
  const [selectedLayerId, setSelectedLayerId] = useState<string | null>(null);
  const [history, setHistory] = useState<Layer[][]>([]);
  const [historyIndex, setHistoryIndex] = useState<number>(-1);
  const [fps, setFps] = useState(30);

  // Add Layer
  const addTextLayer = () => {
    const newLayer: Layer = {
      id: generateId(),
      type: 'text',
      x: 50,
      y: 50,
      content: 'New Text',
      fontSize: 32,
      fontFamily: 'Arial',
      bold: false,
      italic: false,
      underline: false,
      underlineOffset: 2,
      letterSpacing: 0,
      lineHeight: 1.2,
      textTransform: 'none',
      color: '#000000',
      visible: true,
    };
    updateLayers([...layers, newLayer]);
    setSelectedLayerId(newLayer.id);
  };

  const updateLayers = (newLayers: Layer[]) => {
    setLayers(newLayers);
    // Update history
    const updatedHistory = [...history.slice(0, historyIndex + 1), newLayers];
    setHistory(updatedHistory);
    setHistoryIndex(updatedHistory.length - 1);
  };

  const updateLayer = (id: string, props: Partial<Layer>) => {
    const newLayers = layers.map(l => (l.id === id ? { ...l, ...props } : l));
    updateLayers(newLayers);
  };

  // Undo/Redo
  const undo = () => {
    if (historyIndex > 0) {
      setLayers(history[historyIndex - 1]);
      setHistoryIndex(historyIndex - 1);
    }
  };
  const redo = () => {
    if (historyIndex < history.length - 1) {
      setLayers(history[historyIndex + 1]);
      setHistoryIndex(historyIndex + 1);
    }
  };

  // Render
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    layers.forEach(layer => {
      if (!layer.visible) return;
      ctx.save();
      ctx.translate(layer.x, layer.y);
      if (layer.rotation) ctx.rotate((layer.rotation * Math.PI) / 180);

      if (layer.type === 'text' && layer.content) {
        ctx.font = `${layer.bold ? 'bold' : ''} ${layer.italic ? 'italic' : ''} ${layer.fontSize}px ${layer.fontFamily}`;
        ctx.fillStyle = layer.color || '#000';
        ctx.textBaseline = 'top';

        // Handle letter-spacing manually
        const text = layer.textTransform === 'uppercase'
          ? layer.content.toUpperCase()
          : layer.textTransform === 'lowercase'
          ? layer.content.toLowerCase()
          : layer.textTransform === 'capitalize'
          ? layer.content.replace(/\b\w/g, c => c.toUpperCase())
          : layer.content;

        let xPos = 0;
        const yPos = 0;
        for (let char of text) {
          ctx.fillText(char, xPos, yPos);
          const charWidth = ctx.measureText(char).width;
          xPos += charWidth + (layer.letterSpacing || 0);
        }

        // Underline
        if (layer.underline) {
          const textWidth = ctx.measureText(text).width + (layer.letterSpacing || 0) * (text.length - 1);
          ctx.beginPath();
          ctx.moveTo(0, (layer.fontSize || 16) + (layer.underlineOffset || 2));
          ctx.lineTo(textWidth, (layer.fontSize || 16) + (layer.underlineOffset || 2));
          ctx.strokeStyle = layer.color || '#000';
          ctx.lineWidth = 2;
          ctx.stroke();
        }
      }

      if (layer.type === 'image' && layer.imageSrc) {
        const img = new Image();
        img.src = layer.imageSrc;
        img.onload = () => {
          ctx.drawImage(img, 0, 0, layer.width || img.width, layer.height || img.height);
        };
      }

      ctx.restore();
    });
  }, [layers]);

  const selectedLayer = layers.find(l => l.id === selectedLayerId);

  return (
    <div className="flex gap-4">
      <div>
        <canvas ref={canvasRef} width={800} height={600} className="border border-gray-400" />
        <div className="mt-2 flex gap-2">
          <button onClick={addTextLayer} className="px-3 py-1 bg-blue-600 text-white rounded">Add Text</button>
          <button onClick={undo} className="px-3 py-1 bg-gray-200 rounded">Undo</button>
          <button onClick={redo} className="px-3 py-1 bg-gray-200 rounded">Redo</button>
        </div>
      </div>

      {selectedLayer && (
        <div className="flex flex-col gap-2 w-64 p-2 border border-gray-300">
          <label>Content</label>
          <input
            type="text"
            value={selectedLayer.content || ''}
            onChange={e => updateLayer(selectedLayer.id, { content: e.target.value })}
            className="border p-1 rounded"
          />
          <label>Font Size</label>
          <input
            type="number"
            value={selectedLayer.fontSize}
            onChange={e => updateLayer(selectedLayer.id, { fontSize: Number(e.target.value) })}
            className="border p-1 rounded"
          />
          <label>Bold/Italic/Underline</label>
          <div className="flex space-x-2">
            <button
              onClick={() => updateLayer(selectedLayer.id, { bold: !selectedLayer.bold })}
              className={`px-2 py-1 border rounded ${selectedLayer.bold ? 'bg-blue-600 text-white' : ''}`}
            >B</button>
            <button
              onClick={() => updateLayer(selectedLayer.id, { italic: !selectedLayer.italic })}
              className={`px-2 py-1 border rounded ${selectedLayer.italic ? 'bg-blue-600 text-white' : ''}`}
            >I</button>
            <button
              onClick={() => updateLayer(selectedLayer.id, { underline: !selectedLayer.underline })}
              className={`px-2 py-1 border rounded ${selectedLayer.underline ? 'bg-blue-600 text-white' : ''}`}
            >U</button>
          </div>
          <label>Letter Spacing</label>
          <input
            type="number"
            value={selectedLayer.letterSpacing}
            step={0.5}
            onChange={e => updateLayer(selectedLayer.id, { letterSpacing: Number(e.target.value) })}
            className="border p-1 rounded"
          />
          <label>Line Height</label>
          <input
            type="number"
            value={selectedLayer.lineHeight}
            step={0.1}
            onChange={e => updateLayer(selectedLayer.id, { lineHeight: Number(e.target.value) })}
            className="border p-1 rounded"
          />
          <label>Text Transform</label>
          <select
            value={selectedLayer.textTransform}
            onChange={e => updateLayer(selectedLayer.id, { textTransform: e.target.value as Layer['textTransform'] })}
            className="border p-1 rounded"
          >
            <option value="none">None</option>
            <option value="uppercase">Uppercase</option>
            <option value="lowercase">Lowercase</option>
            <option value="capitalize">Capitalize</option>
          </select>
          <label>Color</label>
          <input
            type="color"
            value={selectedLayer.color}
            onChange={e => updateLayer(selectedLayer.id, { color: e.target.value })}
          />
        </div>
      )}
    </div>
  );
};

export default CanvasEditor;
