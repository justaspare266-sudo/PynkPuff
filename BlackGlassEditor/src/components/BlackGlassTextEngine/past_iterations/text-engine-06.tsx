import React, { useRef, useState, useEffect } from 'react';

type LayerType = 'text' | 'image';

interface Layer {
  id: string;
  type: LayerType;
  x: number;
  y: number;
  width?: number;
  height?: number;
  content?: string;
  fontFamily?: string;
  fontSize?: number;
  color?: string;
  bold?: boolean;
  italic?: boolean;
  underline?: boolean;
  underlineOffset?: number;
  strikethrough?: boolean;
  letterSpacing?: number;
  wordSpacing?: number;
  lineHeight?: number;
  textAlign?: 'left' | 'center' | 'right' | 'justify';
  textTransform?: 'none' | 'uppercase' | 'lowercase' | 'capitalize';
  fontWeight?: number;
  shadow?: string;
  outline?: string;
  opacity?: number;
  visible?: boolean;
  imageSrc?: string;
}

interface Keyframe {
  frame: number;
  layers: Layer[];
}

const CanvasEditor: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [layers, setLayers] = useState<Layer[]>([]);
  const [selectedLayerId, setSelectedLayerId] = useState<string | null>(null);
  const [currentFrame, setCurrentFrame] = useState(0);
  const [keyframes, setKeyframes] = useState<Keyframe[]>([]);
  const [isPlaying, setIsPlaying] = useState(false);
  const [fps, setFps] = useState(30);
  const [loadedFonts, setLoadedFonts] = useState<string[]>([]);
  const [undoStack, setUndoStack] = useState<Layer[][]>([]);
  const [redoStack, setRedoStack] = useState<Layer[][]>([]);

  // Helpers
  const selectedLayer = layers.find(l => l.id === selectedLayerId);

  const pushUndo = () => {
    setUndoStack([...undoStack, JSON.parse(JSON.stringify(layers))]);
    setRedoStack([]);
  };

  const undo = () => {
    if (undoStack.length === 0) return;
    const prev = undoStack[undoStack.length - 1];
    setUndoStack(undoStack.slice(0, -1));
    setRedoStack([...redoStack, JSON.parse(JSON.stringify(layers))]);
    setLayers(prev);
  };

  const redo = () => {
    if (redoStack.length === 0) return;
    const next = redoStack[redoStack.length - 1];
    setRedoStack(redoStack.slice(0, -1));
    setUndoStack([...undoStack, JSON.parse(JSON.stringify(layers))]);
    setLayers(next);
  };

  const addTextLayer = () => {
    pushUndo();
    const id = crypto.randomUUID();
    setLayers([
      ...layers,
      {
        id,
        type: 'text',
        x: 50,
        y: 50,
        content: 'New Text',
        fontFamily: 'Arial',
        fontSize: 24,
        color: '#000000',
        bold: false,
        italic: false,
        underline: false,
        underlineOffset: 2,
        strikethrough: false,
        letterSpacing: 0,
        wordSpacing: 0,
        lineHeight: 1.2,
        textAlign: 'left',
        textTransform: 'none',
        fontWeight: 400,
        shadow: '',
        outline: '',
        opacity: 1,
        visible: true
      }
    ]);
    setSelectedLayerId(id);
  };

  const addImageLayer = (src: string) => {
    pushUndo();
    const id = crypto.randomUUID();
    setLayers([
      ...layers,
      {
        id,
        type: 'image',
        x: 50,
        y: 50,
        width: 200,
        height: 200,
        imageSrc: src,
        opacity: 1,
        visible: true
      }
    ]);
    setSelectedLayerId(id);
  };

  const updateLayer = (id: string, updates: Partial<Layer>) => {
    pushUndo();
    setLayers(layers.map(l => (l.id === id ? { ...l, ...updates } : l)));
  };

  const deleteLayer = (id: string) => {
    pushUndo();
    setLayers(layers.filter(l => l.id !== id));
    if (selectedLayerId === id) setSelectedLayerId(null);
  };

  const loadFont = (file: File) => {
    const reader = new FileReader();
    reader.onload = e => {
      const fontData = e.target?.result;
      if (fontData) {
        const font = new FontFace(file.name, fontData as string);
        font.load().then(f => {
          (document as any).fonts.add(f);
          setLoadedFonts([...loadedFonts, file.name]);
        });
      }
    };
    reader.readAsArrayBuffer(file);
  };

  const applyTextTransforms = (text: string, layer: Layer) => {
    switch (layer.textTransform) {
      case 'uppercase':
        return text.toUpperCase();
      case 'lowercase':
        return text.toLowerCase();
      case 'capitalize':
        return text.replace(/\b\w/g, l => l.toUpperCase());
      default:
        return text;
    }
  };

  const renderCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    layers.forEach(layer => {
      if (!layer.visible || layer.opacity === 0) return;
      ctx.globalAlpha = layer.opacity ?? 1;

      if (layer.type === 'text' && layer.content) {
        const fontStyle = `${layer.italic ? 'italic ' : ''}${layer.bold ? 'bold ' : ''}${layer.fontWeight ?? 400} ${layer.fontSize}px ${layer.fontFamily}`;
        ctx.font = fontStyle;
        ctx.fillStyle = layer.color ?? '#000';
        ctx.textAlign = layer.textAlign ?? 'left';
        ctx.textBaseline = 'top';
        if (layer.shadow) ctx.shadowColor = layer.shadow;
        if (layer.outline) ctx.strokeStyle = layer.outline;

        const lines = layer.content.split('\n');
        lines.forEach((line, i) => {
          const y = layer.y + (layer.lineHeight ?? 1.2) * layer.fontSize! * i;
          const transformed = applyTextTransforms(line, layer);
          ctx.fillText(transformed, layer.x, y);
          if (layer.outline) ctx.strokeText(transformed, layer.x, y);
          if (layer.underline) {
            const width = ctx.measureText(transformed).width;
            const offset = layer.underlineOffset ?? 2;
            ctx.beginPath();
            ctx.moveTo(layer.x, y + layer.fontSize! + offset);
            ctx.lineTo(layer.x + width, y + layer.fontSize! + offset);
            ctx.stroke();
          }
          if (layer.strikethrough) {
            const width = ctx.measureText(transformed).width;
            ctx.beginPath();
            ctx.moveTo(layer.x, y + layer.fontSize! / 2);
            ctx.lineTo(layer.x + width, y + layer.fontSize! / 2);
            ctx.stroke();
          }
        });
      }

      if (layer.type === 'image' && layer.imageSrc) {
        const img = new Image();
        img.src = layer.imageSrc;
        img.onload = () => {
          ctx.drawImage(img, layer.x, layer.y, layer.width ?? img.width, layer.height ?? img.height);
        };
      }
    });

    ctx.globalAlpha = 1;
  };

  useEffect(() => {
    renderCanvas();
  }, [layers]);

  // Animation loop
  useEffect(() => {
    let animId: number;
    if (isPlaying) {
      const interval = 1000 / fps;
      const loop = () => {
        setCurrentFrame(prev => prev + 1);
        animId = window.setTimeout(loop, interval);
      };
      loop();
    }
    return () => clearTimeout(animId);
  }, [isPlaying, fps]);

  return (
    <div className="flex">
      <div className="flex-1">
        <canvas ref={canvasRef} width={800} height={600} className="border" />
        <div className="flex space-x-2 mt-2">
          <button onClick={() => setIsPlaying(!isPlaying)}>{isPlaying ? 'Pause' : 'Play'}</button>
          <button onClick={undo}>Undo</button>
          <button onClick={redo}>Redo</button>
          <label>FPS:</label>
          <input type="number" value={fps} onChange={e => setFps(parseInt(e.target.value))} className="w-16 border px-1" />
        </div>
      </div>

      <div className="w-64 ml-4 space-y-4">
        <button onClick={addTextLayer} className="w-full py-1 bg-blue-500 text-white rounded">Add Text Layer</button>
        <input type="file" accept="image/*" onChange={e => e.target.files && addImageLayer(URL.createObjectURL(e.target.files[0]))} />
        <input type="file" accept=".ttf,.otf,.woff,.woff2" onChange={e => e.target.files && loadFont(e.target.files[0])} />

        {selectedLayer && selectedLayer.type === 'text' && (
          <div className="space-y-2">
            <label>Content:</label>
            <textarea
              value={selectedLayer.content}
              onChange={e => updateLayer(selectedLayer.id, { content: e.target.value })}
              className="w-full border p-1"
            />

            <label>Font:</label>
            <input
              value={selectedLayer.fontFamily}
              onChange={e => updateLayer(selectedLayer.id, { fontFamily: e.target.value })}
              className="w-full border px-1"
            />

            <label>Font Size:</label>
            <input
              type="number"
              value={selectedLayer.fontSize}
              onChange={e => updateLayer(selectedLayer.id, { fontSize: parseInt(e.target.value) })}
              className="w-full border px-1"
            />

            <label>Color:</label>
            <input type="color" value={selectedLayer.color} onChange={e => updateLayer(selectedLayer.id, { color: e.target.value })} />

            <label>Bold/Italic/Underline/Strike</label>
            <div className="flex space-x-2">
              <button onClick={() => updateLayer(selectedLayer.id, { bold: !selectedLayer.bold })} className={`px-2 py-1 border rounded ${selectedLayer.bold ? 'bg-blue-600 text-white' : ''}`}>B</button>
              <button onClick={() => updateLayer(selectedLayer.id, { italic: !selectedLayer.italic })} className={`px-2 py-1 border rounded ${selectedLayer.italic ? 'bg-blue-600 text-white' : ''}`}>I</button>
              <button onClick={() => updateLayer(selectedLayer.id, { underline: !selectedLayer.underline })} className={`px-2 py-1 border rounded ${selectedLayer.underline ? 'bg-blue-600 text-white' : ''}`}>U</button>
              <button onClick={() => updateLayer(selectedLayer.id, { strikethrough: !selectedLayer.strikethrough })} className={`px-2 py-1 border rounded ${selectedLayer.strikethrough ? 'bg-blue-600 text-white' : ''}`}>S</button>
            </div>

            <label>Text Align:</label>
            <select value={selectedLayer.textAlign} onChange={e => updateLayer(selectedLayer.id, { textAlign: e.target.value as any })} className="w-full border px-1">
              <option value="left">Left</option>
              <option value="center">Center</option>
              <option value="right">Right</option>
              <option value="justify">Justify</option>
            </select>

            <label>Transform:</label>
            <select value={selectedLayer.textTransform} onChange={e => updateLayer(selectedLayer.id, { textTransform: e.target.value as any })} className="w-full border px-1">
              <option value="none">None</option>
              <option value="uppercase">Uppercase</option>
              <option value="lowercase">Lowercase</option>
              <option value="capitalize">Capitalize</option>
            </select>

            <label>Letter Spacing:</label>
            <input type="number" value={selectedLayer.letterSpacing} onChange={e => updateLayer(selectedLayer.id, { letterSpacing: parseFloat(e.target.value) })} className="w-full border px-1" />

            <label>Line Height:</label>
            <input type="number" step="0.1" value={selectedLayer.lineHeight} onChange={e => updateLayer(selectedLayer.id, { lineHeight: parseFloat(e.target.value) })} className="w-full border px-1" />

            <label>Font Weight:</label>
            <input type="number" value={selectedLayer.fontWeight} onChange={e => updateLayer(selectedLayer.id, { fontWeight: parseInt(e.target.value) })} className="w-full border px-1" />

            <button onClick={() => deleteLayer(selectedLayer.id)} className="w-full py-1 bg-red-500 text-white rounded">Delete Layer</button>
          </div>
        )}

        <div>
          <h3 className="font-bold">Layers:</h3>
          {layers.map(l => (
            <div key={l.id} onClick={() => setSelectedLayerId(l.id)} className={`border p-1 cursor-pointer ${selectedLayerId === l.id ? 'bg-blue-100' : ''}`}>
              {l.type.toUpperCase()} - {l.content || l.imageSrc?.split('/').pop()}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default CanvasEditor;
