import React, { useRef, useState, useEffect } from "react";

// Types
type LayerType = "text" | "image";

interface Layer {
  id: string;
  type: LayerType;
  text?: string;
  imageSrc?: string;
  x: number;
  y: number;
  fontSize?: number;
  fontFamily?: string;
  fontWeight?: number;
  bold?: boolean;
  italic?: boolean;
  underline?: boolean;
  underlineOffset?: number;
  strikethrough?: boolean;
  letterSpacing?: number;
  lineHeight?: number;
  wordSpacing?: number;
  paragraphSpacing?: number;
  textAlign?: CanvasTextAlign;
  textTransform?: "none" | "uppercase" | "lowercase" | "capitalize";
  shadowColor?: string;
  shadowBlur?: number;
  outlineColor?: string;
  outlineWidth?: number;
  zIndex: number;
}

interface Keyframe {
  frame: number;
  layerStates: Layer[];
}

// Helpers
const generateId = () => Math.random().toString(36).substring(2, 9);

// Main Component
const CanvasEditor: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [layers, setLayers] = useState<Layer[]>([]);
  const [selectedLayerId, setSelectedLayerId] = useState<string | null>(null);
  const [fps, setFps] = useState(60);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentFrame, setCurrentFrame] = useState(0);
  const [keyframes, setKeyframes] = useState<Keyframe[]>([]);
  const [undoStack, setUndoStack] = useState<Layer[][]>([]);
  const [redoStack, setRedoStack] = useState<Layer[][]>([]);
  const [loadedFonts, setLoadedFonts] = useState<string[]>([]);

  const selectedLayer = layers.find(l => l.id === selectedLayerId) || null;

  // Canvas render
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const sortedLayers = [...layers].sort((a, b) => a.zIndex - b.zIndex);

    sortedLayers.forEach(layer => {
      ctx.save();
      ctx.font = `${layer.bold ? "bold" : ""} ${layer.italic ? "italic" : ""} ${layer.fontWeight || 400}px ${layer.fontFamily || "sans-serif"}`;
      ctx.textBaseline = "top";
      ctx.fillStyle = "black";

      if (layer.shadowColor) {
        ctx.shadowColor = layer.shadowColor;
        ctx.shadowBlur = layer.shadowBlur || 0;
      }

      if (layer.type === "text" && layer.text) {
        let text = layer.text;
        switch (layer.textTransform) {
          case "uppercase": text = text.toUpperCase(); break;
          case "lowercase": text = text.toLowerCase(); break;
          case "capitalize": text = text.replace(/\b\w/g, c => c.toUpperCase()); break;
        }

        const lines = text.split("\n");
        lines.forEach((line, i) => {
          let y = layer.y + i * (layer.lineHeight || 24);
          if (layer.underline || layer.strikethrough || layer.outlineWidth) {
            ctx.fillText(line, layer.x, y);
            if (layer.outlineWidth && layer.outlineColor) {
              ctx.lineWidth = layer.outlineWidth;
              ctx.strokeStyle = layer.outlineColor;
              ctx.strokeText(line, layer.x, y);
            }
            if (layer.underline) {
              const underlineY = y + (layer.underlineOffset || (layer.fontSize || 24));
              ctx.beginPath();
              ctx.moveTo(layer.x, underlineY);
              ctx.lineTo(layer.x + ctx.measureText(line).width, underlineY);
              ctx.strokeStyle = layer.outlineColor || "black";
              ctx.lineWidth = 1;
              ctx.stroke();
            }
            if (layer.strikethrough) {
              const strikeY = y + (layer.fontSize || 24) / 2;
              ctx.beginPath();
              ctx.moveTo(layer.x, strikeY);
              ctx.lineTo(layer.x + ctx.measureText(line).width, strikeY);
              ctx.strokeStyle = layer.outlineColor || "black";
              ctx.lineWidth = 1;
              ctx.stroke();
            }
          } else {
            ctx.fillText(line, layer.x, y);
          }
        });
      }

      if (layer.type === "image" && layer.imageSrc) {
        const img = new Image();
        img.src = layer.imageSrc;
        img.onload = () => ctx.drawImage(img, layer.x, layer.y);
      }

      ctx.restore();
    });
  }, [layers, currentFrame]);

  // Animation loop
  useEffect(() => {
    if (!isPlaying) return;
    const interval = setInterval(() => {
      setCurrentFrame(prev => prev + 1);
    }, 1000 / fps);
    return () => clearInterval(interval);
  }, [isPlaying, fps]);

  // Undo/Redo
  const saveState = () => {
    setUndoStack(prev => [...prev, layers.map(l => ({ ...l }))]);
    setRedoStack([]);
  };

  const undo = () => {
    if (undoStack.length === 0) return;
    const last = undoStack[undoStack.length - 1];
    setRedoStack(prev => [...prev, layers.map(l => ({ ...l }))]);
    setLayers(last);
    setUndoStack(prev => prev.slice(0, -1));
  };

  const redo = () => {
    if (redoStack.length === 0) return;
    const last = redoStack[redoStack.length - 1];
    setUndoStack(prev => [...prev, layers.map(l => ({ ...l }))]);
    setLayers(last);
    setRedoStack(prev => prev.slice(0, -1));
  };

  // Layer management
  const addTextLayer = () => {
    saveState();
    const newLayer: Layer = {
      id: generateId(),
      type: "text",
      text: "New Text",
      x: 50,
      y: 50,
      fontSize: 24,
      fontFamily: "sans-serif",
      fontWeight: 400,
      zIndex: layers.length,
    };
    setLayers([...layers, newLayer]);
    setSelectedLayerId(newLayer.id);
  };

  const addImageLayer = (src: string) => {
    saveState();
    const newLayer: Layer = {
      id: generateId(),
      type: "image",
      imageSrc: src,
      x: 50,
      y: 50,
      zIndex: layers.length,
    };
    setLayers([...layers, newLayer]);
    setSelectedLayerId(newLayer.id);
  };

  const deleteLayer = (id: string) => {
    saveState();
    setLayers(layers.filter(l => l.id !== id));
    if (selectedLayerId === id) setSelectedLayerId(null);
  };

  const updateLayer = (id: string, updates: Partial<Layer>) => {
    saveState();
    setLayers(layers.map(l => l.id === id ? { ...l, ...updates } : l));
  };

  // Font upload
  const handleFontUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;
    Array.from(files).forEach(file => {
      const reader = new FileReader();
      reader.onload = () => {
        const fontData = reader.result as string;
        const fontName = file.name.split(".")[0];
        const font = new FontFace(fontName, `url(${fontData})`);
        font.load().then(loaded => {
          (document as any).fonts.add(loaded);
          setLoadedFonts(prev => [...prev, fontName]);
        });
      };
      reader.readAsDataURL(file);
    });
  };

  return (
    <div className="flex space-x-4 p-4">
      <div className="flex flex-col space-y-4 w-64">
        <button onClick={addTextLayer} className="px-2 py-1 border rounded">Add Text</button>
        <button onClick={() => addImageLayer(prompt("Enter image URL") || "")} className="px-2 py-1 border rounded">Add Image</button>
        <button onClick={undo} className="px-2 py-1 border rounded">Undo</button>
        <button onClick={redo} className="px-2 py-1 border rounded">Redo</button>
        <button onClick={() => setIsPlaying(!isPlaying)} className="px-2 py-1 border rounded">{isPlaying ? "Pause" : "Play"}</button>
        <div>
          <label>FPS: {fps}</label>
          <input type="range" min="1" max="144" value={fps} onChange={e => setFps(Number(e.target.value))} />
        </div>
        <div>
          <label>Font Upload</label>
          <input type="file" accept=".ttf,.otf,.woff,.woff2" onChange={handleFontUpload} multiple />
        </div>
        {selectedLayer && selectedLayer.type === "text" && (
          <>
            <div>
              <label>Text</label>
              <textarea value={selectedLayer.text} onChange={e => updateLayer(selectedLayer.id, { text: e.target.value })} className="border rounded w-full" />
            </div>
            <div>
              <label>Font Family</label>
              <input value={selectedLayer.fontFamily} onChange={e => updateLayer(selectedLayer.id, { fontFamily: e.target.value })} className="border rounded w-full" list="fonts" />
              <datalist id="fonts">
                {loadedFonts.map(f => <option key={f} value={f} />)}
              </datalist>
            </div>
            <div>
              <label>Font Size</label>
              <input type="number" value={selectedLayer.fontSize} onChange={e => updateLayer(selectedLayer.id, { fontSize: Number(e.target.value) })} className="border rounded w-full" />
            </div>
            <div>
              <label>Font Weight</label>
              <input type="number" min="100" max="900" step="100" value={selectedLayer.fontWeight} onChange={e => updateLayer(selectedLayer.id, { fontWeight: Number(e.target.value) })} className="border rounded w-full" />
            </div>
            <div className="flex space-x-2">
              <button onClick={() => updateLayer(selectedLayer.id, { bold: !selectedLayer.bold })} className={`px-2 py-1 border rounded ${selectedLayer.bold?'bg-blue-600 text-white':''}`}>B</button>
              <button onClick={() => updateLayer(selectedLayer.id, { italic: !selectedLayer.italic })} className={`px-2 py-1 border rounded ${selectedLayer.italic?'bg-blue-600 text-white':''}`}>I</button>
              <button onClick={() => updateLayer(selectedLayer.id, { underline: !selectedLayer.underline })} className={`px-2 py-1 border rounded ${selectedLayer.underline?'bg-blue-600 text-white':''}`}>U</button>
              <button onClick={() => updateLayer(selectedLayer.id, { strikethrough: !selectedLayer.strikethrough })} className={`px-2 py-1 border rounded ${selectedLayer.strikethrough?'bg-blue-600 text-white':''}`}>S</button>
            </div>
            <div>
              <label>Text Align</label>
              <select value={selectedLayer.textAlign} onChange={e => updateLayer(selectedLayer.id, { textAlign: e.target.value as CanvasTextAlign })} className="border rounded w-full">
                <option value="left">Left</option>
                <option value="center">Center</option>
                <option value="right">Right</option>
                <option value="start">Start</option>
                <option value="end">End</option>
              </select>
            </div>
            <div>
              <label>Text Transform</label>
              <select value={selectedLayer.textTransform} onChange={e => updateLayer(selectedLayer.id, { textTransform: e.target.value as any })} className="border rounded w-full">
                <option value="none">None</option>
                <option value="uppercase">Uppercase</option>
                <option value="lowercase">Lowercase</option>
                <option value="capitalize">Capitalize</option>
              </select>
            </div>
            <div>
              <label>Letter Spacing</label>
              <input type="number" value={selectedLayer.letterSpacing || 0} onChange={e => updateLayer(selectedLayer.id, { letterSpacing: Number(e.target.value) })} className="border rounded w-full" />
            </div>
            <div>
              <label>Line Height</label>
              <input type="number" value={selectedLayer.lineHeight || 24} onChange={e => updateLayer(selectedLayer.id, { lineHeight: Number(e.target.value) })} className="border rounded w-full" />
            </div>
            <div>
              <label>Shadow Color</label>
              <input type="color" value={selectedLayer.shadowColor || "#000000"} onChange={e => updateLayer(selectedLayer.id, { shadowColor: e.target.value })} className="border rounded w-full" />
            </div>
            <div>
              <label>Shadow Blur</label>
              <input type="number" value={selectedLayer.shadowBlur || 0} onChange={e => updateLayer(selectedLayer.id, { shadowBlur: Number(e.target.value) })} className="border rounded w-full" />
            </div>
            <div>
              <label>Outline Color</label>
              <input type="color" value={selectedLayer.outlineColor || "#000000"} onChange={e => updateLayer(selectedLayer.id, { outlineColor: e.target.value })} className="border rounded w-full" />
            </div>
            <div>
              <label>Outline Width</label>
              <input type="number" value={selectedLayer.outlineWidth || 0} onChange={e => updateLayer(selectedLayer.id, { outlineWidth: Number(e.target.value) })} className="border rounded w-full" />
            </div>
            <div>
              <label>Underline Offset</label>
              <input type="number" value={selectedLayer.underlineOffset || 0} onChange={e => updateLayer(selectedLayer.id, { underlineOffset: Number(e.target.value) })} className="border rounded w-full" />
            </div>
            <div>
              <button onClick={() => deleteLayer(selectedLayer.id)} className="px-2 py-1 border rounded bg-red-500 text-white">Delete Layer</button>
            </div>
          </>
        )}
        <div>
          <label>Current Frame: {currentFrame}</label>
        </div>
        <div>
          <button onClick={() => setKeyframes([...keyframes, { frame: currentFrame, layerStates: layers.map(l => ({ ...l })) }])} className="px-2 py-1 border rounded bg-green-500 text-white">Add Keyframe</button>
        </div>
      </div>
      <canvas ref={canvasRef} width={800} height={600} className="border" />
    </div>
  );
};

export default CanvasEditor;
