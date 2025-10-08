import React, { useRef, useState, useEffect } from 'react';

// Types
type LayerType = 'text' | 'image';
type TextAlign = 'left' | 'center' | 'right' | 'justify';

interface Layer {
  id: string;
  type: LayerType;
  content: string;
  x: number;
  y: number;
  fontSize?: number;
  fontFamily?: string;
  bold?: boolean;
  italic?: boolean;
  underline?: boolean;
  strikethrough?: boolean;
  letterSpacing?: number;
  lineHeight?: number;
  textAlign?: TextAlign;
  color?: string;
  opacity?: number;
  rotation?: number;
  width?: number;
  height?: number;
  image?: HTMLImageElement;
}

interface Keyframe {
  frame: number;
  layers: Layer[];
}

// Utilities
const generateId = () => '_' + Math.random().toString(36).substr(2, 9);

// Main Component
const CanvasEditor: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [layers, setLayers] = useState<Layer[]>([]);
  const [selectedLayerId, setSelectedLayerId] = useState<string | null>(null);
  const [animationKeyframes, setAnimationKeyframes] = useState<Keyframe[]>([]);
  const [currentFrame, setCurrentFrame] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [fps, setFps] = useState(60);
  const [undoStack, setUndoStack] = useState<Layer[][]>([]);
  const [redoStack, setRedoStack] = useState<Layer[][]>([]);

  // Canvas rendering
  const renderCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    layers.forEach((layer) => {
      ctx.save();
      ctx.globalAlpha = layer.opacity ?? 1;
      ctx.translate(layer.x, layer.y);
      if (layer.rotation) ctx.rotate((layer.rotation * Math.PI) / 180);

      if (layer.type === 'text') {
        ctx.font = `${layer.bold ? 'bold' : ''} ${layer.italic ? 'italic' : ''} ${
          layer.fontSize ?? 24
        }px ${layer.fontFamily ?? 'Arial'}`;
        ctx.textAlign = layer.textAlign ?? 'left';
        ctx.fillStyle = layer.color ?? '#000';
        ctx.textBaseline = 'top';
        ctx.lineWidth = 1;
        ctx.letterSpacing = layer.letterSpacing ?? 0; // custom handling below
        const lines = layer.content.split('\n');
        lines.forEach((line, index) => {
          const yOffset = (layer.lineHeight ?? 1.2) * (layer.fontSize ?? 24) * index;
          ctx.fillText(line, 0, yOffset);
          if (layer.underline) {
            const textWidth = ctx.measureText(line).width;
            ctx.beginPath();
            ctx.moveTo(0, yOffset + (layer.fontSize ?? 24));
            ctx.lineTo(textWidth, yOffset + (layer.fontSize ?? 24));
            ctx.stroke();
          }
          if (layer.strikethrough) {
            const textWidth = ctx.measureText(line).width;
            const strikeY = yOffset + (layer.fontSize ?? 24) / 2;
            ctx.beginPath();
            ctx.moveTo(0, strikeY);
            ctx.lineTo(textWidth, strikeY);
            ctx.stroke();
          }
        });
      } else if (layer.type === 'image' && layer.image) {
        ctx.drawImage(layer.image, 0, 0, layer.width ?? layer.image.width, layer.height ?? layer.image.height);
      }

      ctx.restore();
    });
  };

  // Undo/Redo
  const pushUndo = () => setUndoStack((prev) => [...prev, JSON.parse(JSON.stringify(layers))]);
  const undo = () => {
    if (undoStack.length === 0) return;
    const last = undoStack[undoStack.length - 1];
    setRedoStack((prev) => [...prev, JSON.parse(JSON.stringify(layers))]);
    setLayers(last);
    setUndoStack((prev) => prev.slice(0, -1));
  };
  const redo = () => {
    if (redoStack.length === 0) return;
    const last = redoStack[redoStack.length - 1];
    setUndoStack((prev) => [...prev, JSON.parse(JSON.stringify(layers))]);
    setLayers(last);
    setRedoStack((prev) => prev.slice(0, -1));
  };

  // Animation loop
  useEffect(() => {
    let animFrame: number;
    const tick = () => {
      if (isPlaying) {
        setCurrentFrame((prev) => prev + 1);
      }
      renderCanvas();
      animFrame = requestAnimationFrame(tick);
    };
    tick();
    return () => cancelAnimationFrame(animFrame);
  }, [layers, isPlaying, currentFrame]);

  // Layer operations
  const addTextLayer = () => {
    pushUndo();
    setLayers((prev) => [
      ...prev,
      {
        id: generateId(),
        type: 'text',
        content: 'New Text',
        x: 50,
        y: 50,
        fontSize: 24,
        color: '#000',
        bold: false,
        italic: false,
        underline: false,
        strikethrough: false,
        lineHeight: 1.2,
        letterSpacing: 0,
        textAlign: 'left',
      },
    ]);
  };

  const addImageLayer = (file: File) => {
    const img = new Image();
    img.onload = () => {
      pushUndo();
      setLayers((prev) => [
        ...prev,
        {
          id: generateId(),
          type: 'image',
          x: 50,
          y: 50,
          width: img.width,
          height: img.height,
          image: img,
          content: '',
        },
      ]);
    };
    img.src = URL.createObjectURL(file);
  };

  const updateLayer = (id: string, updates: Partial<Layer>) => {
    pushUndo();
    setLayers((prev) => prev.map((l) => (l.id === id ? { ...l, ...updates } : l)));
  };

  const deleteLayer = (id: string) => {
    pushUndo();
    setLayers((prev) => prev.filter((l) => l.id !== id));
  };

  const selectedLayer = layers.find((l) => l.id === selectedLayerId);

  // Render controls
  return (
    <div className="flex space-x-4">
      {/* Canvas */}
      <canvas ref={canvasRef} width={800} height={600} className="border bg-white" />

      {/* Controls */}
      <div className="flex flex-col space-y-4">
        <button onClick={addTextLayer} className="px-2 py-1 border rounded bg-green-400">Add Text Layer</button>
        <input
          type="file"
          accept="image/*"
          onChange={(e) => e.target.files?.[0] && addImageLayer(e.target.files[0])}
          className="border p-1 rounded"
        />
        <button onClick={undo} className="px-2 py-1 border rounded">Undo</button>
        <button onClick={redo} className="px-2 py-1 border rounded">Redo</button>

        {selectedLayer && selectedLayer.type === 'text' && (
          <div className="flex flex-col space-y-2">
            <label>Text Content:</label>
            <textarea
              value={selectedLayer.content}
              onChange={(e) => updateLayer(selectedLayer.id, { content: e.target.value })}
              className="border p-1 rounded"
            />

            <label>Font Size:</label>
            <input
              type="number"
              value={selectedLayer.fontSize}
              onChange={(e) => updateLayer(selectedLayer.id, { fontSize: parseInt(e.target.value) })}
              className="border p-1 rounded"
            />

            <label>Font Family:</label>
            <input
              type="text"
              value={selectedLayer.fontFamily}
              onChange={(e) => updateLayer(selectedLayer.id, { fontFamily: e.target.value })}
              className="border p-1 rounded"
            />

            <label>Color:</label>
            <input
              type="color"
              value={selectedLayer.color}
              onChange={(e) => updateLayer(selectedLayer.id, { color: e.target.value })}
              className="border p-1 rounded"
            />

            <label>Styles:</label>
            <div className="flex space-x-2">
              <button onClick={() => updateLayer(selectedLayer.id, { bold: !selectedLayer.bold })} className={`px-2 py-1 border rounded ${selectedLayer.bold ? 'bg-blue-600 text-white' : ''}`}>B</button>
              <button onClick={() => updateLayer(selectedLayer.id, { italic: !selectedLayer.italic })} className={`px-2 py-1 border rounded ${selectedLayer.italic ? 'bg-blue-600 text-white' : ''}`}>I</button>
              <button onClick={() => updateLayer(selectedLayer.id, { underline: !selectedLayer.underline })} className={`px-2 py-1 border rounded ${selectedLayer.underline ? 'bg-blue-600 text-white' : ''}`}>U</button>
              <button onClick={() => updateLayer(selectedLayer.id, { strikethrough: !selectedLayer.strikethrough })} className={`px-2 py-1 border rounded ${selectedLayer.strikethrough ? 'bg-blue-600 text-white' : ''}`}>S</button>
            </div>

            <label>Text Align:</label>
            <select value={selectedLayer.textAlign} onChange={(e) => updateLayer(selectedLayer.id, { textAlign: e.target.value as TextAlign })}>
              <option value="left">Left</option>
              <option value="center">Center</option>
              <option value="right">Right</option>
              <option value="justify">Justify</option>
            </select>

            <label>Letter Spacing:</label>
            <input type="number" step={0.1} value={selectedLayer.letterSpacing} onChange={(e) => updateLayer(selectedLayer.id, { letterSpacing: parseFloat(e.target.value) })} />

            <label>Line Height:</label>
            <input type="number" step={0.1} value={selectedLayer.lineHeight} onChange={(e) => updateLayer(selectedLayer.id, { lineHeight: parseFloat(e.target.value) })} />
          </div>
        )}

        <label>Animation Controls:</label>
        <div className="flex space-x-2">
          <button onClick={() => setIsPlaying(!isPlaying)} className="px-2 py-1 border rounded">{isPlaying ? 'Pause' : 'Play'}</button>
          <label>FPS:</label>
          <input type="number" value={fps} onChange={(e) => setFps(parseInt(e.target.value))} className="border p-1 rounded w-20" />
        </div>

        <div>
          <label>Current Frame: {currentFrame}</label>
        </div>
      </div>
    </div>
  );
};

export default CanvasEditor;
