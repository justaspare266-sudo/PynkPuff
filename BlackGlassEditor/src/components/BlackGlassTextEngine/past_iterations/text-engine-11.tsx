import React, { useRef, useState, useEffect, useCallback } from "react";
import opentype from "opentype.js";

// Types
type LayerType = "text" | "image" | "shape";

interface Layer {
  id: string;
  type: LayerType;
  content?: string; // text or image src
  x: number;
  y: number;
  scale: number;
  rotation: number;
  opacity: number;
  fontSize?: number;
  fontFamily?: string;
  bold?: boolean;
  italic?: boolean;
  underline?: boolean;
  underlineOffset?: number;
  letterSpacing?: number;
  lineHeight?: number;
  textTransform?: "none" | "uppercase" | "lowercase" | "capitalize";
  keyframes?: Record<number, Partial<Layer>>; // frame -> props
}

const generateId = () => Math.random().toString(36).substr(2, 9);

const CanvasEditor: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [layers, setLayers] = useState<Layer[]>([]);
  const [selectedLayerId, setSelectedLayerId] = useState<string | null>(null);
  const [undoStack, setUndoStack] = useState<Layer[][]>([]);
  const [redoStack, setRedoStack] = useState<Layer[][]>([]);
  const [fps, setFps] = useState(60);
  const [frame, setFrame] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);

  const selectedLayer = layers.find((l) => l.id === selectedLayerId) || null;

  // Layer actions
  const addLayer = (type: LayerType) => {
    const newLayer: Layer = {
      id: generateId(),
      type,
      x: 50,
      y: 50,
      scale: 1,
      rotation: 0,
      opacity: 1,
      fontSize: 30,
      fontFamily: "Arial",
      bold: false,
      italic: false,
      underline: false,
      underlineOffset: 2,
      letterSpacing: 0,
      lineHeight: 1.2,
      textTransform: "none",
      content: type === "text" ? "New Text" : undefined,
      keyframes: {},
    };
    pushUndo();
    setLayers([...layers, newLayer]);
    setSelectedLayerId(newLayer.id);
  };

  const updateLayer = (id: string, props: Partial<Layer>) => {
    pushUndo();
    setLayers((prev) =>
      prev.map((l) => (l.id === id ? { ...l, ...props } : l))
    );
  };

  const deleteLayer = (id: string) => {
    pushUndo();
    setLayers((prev) => prev.filter((l) => l.id !== id));
    if (selectedLayerId === id) setSelectedLayerId(null);
  };

  // Undo/Redo
  const pushUndo = () => {
    setUndoStack((prev) => [...prev, JSON.parse(JSON.stringify(layers))]);
    setRedoStack([]);
  };
  const undo = () => {
    if (!undoStack.length) return;
    const prev = undoStack[undoStack.length - 1];
    setRedoStack((prevRedo) => [...prevRedo, JSON.parse(JSON.stringify(layers))]);
    setUndoStack((prevUndo) => prevUndo.slice(0, -1));
    setLayers(prev);
  };
  const redo = () => {
    if (!redoStack.length) return;
    const next = redoStack[redoStack.length - 1];
    setUndoStack((prevUndo) => [...prevUndo, JSON.parse(JSON.stringify(layers))]);
    setRedoStack((prevRedo) => prevRedo.slice(0, -1));
    setLayers(next);
  };

  // Canvas drawing
  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    layers.forEach((layer) => {
      const frameProps = layer.keyframes?.[frame] || {};
      const x = frameProps.x ?? layer.x;
      const y = frameProps.y ?? layer.y;
      const scale = frameProps.scale ?? layer.scale;
      const rotation = frameProps.rotation ?? layer.rotation;
      const opacity = frameProps.opacity ?? layer.opacity;

      ctx.save();
      ctx.translate(x, y);
      ctx.rotate((rotation * Math.PI) / 180);
      ctx.globalAlpha = opacity;
      ctx.scale(scale, scale);

      if (layer.type === "text" && layer.content) {
        ctx.font = `${layer.bold ? "bold" : ""} ${layer.italic ? "italic" : ""} ${layer.fontSize}px ${layer.fontFamily}`;
        ctx.textBaseline = "top";
        ctx.letterSpacing = layer.letterSpacing!;
        const lines = layer.content.split("\n");
        lines.forEach((line, i) => {
          let text = line;
          switch (layer.textTransform) {
            case "uppercase":
              text = line.toUpperCase();
              break;
            case "lowercase":
              text = line.toLowerCase();
              break;
            case "capitalize":
              text = line.replace(/\b\w/g, (c) => c.toUpperCase());
              break;
          }
          ctx.fillStyle = "#000";
          ctx.fillText(text, 0, i * (layer.fontSize! * layer.lineHeight!));
          if (layer.underline) {
            const width = ctx.measureText(text).width;
            const offset = layer.underlineOffset!;
            ctx.beginPath();
            ctx.moveTo(0, i * (layer.fontSize! * layer.lineHeight!) + layer.fontSize! + offset);
            ctx.lineTo(width, i * (layer.fontSize! * layer.lineHeight!) + layer.fontSize! + offset);
            ctx.strokeStyle = "#000";
            ctx.lineWidth = 2;
            ctx.stroke();
          }
        });
      }

      // image / shape rendering can go here
      ctx.restore();
    });
  }, [layers, frame]);

  // Animation loop
  useEffect(() => {
    let animationFrame: number;
    const loop = () => {
      if (isPlaying) setFrame((f) => f + 1);
      draw();
      animationFrame = requestAnimationFrame(loop);
    };
    loop();
    return () => cancelAnimationFrame(animationFrame);
  }, [draw, isPlaying]);

  // Layer selection
  const selectLayer = (id: string) => setSelectedLayerId(id);

  // Render UI
  return (
    <div className="flex h-screen">
      <div className="w-64 p-2 bg-gray-100 overflow-y-auto">
        <button onClick={() => addLayer("text")} className="w-full mb-2 p-2 bg-green-400 text-white rounded">Add Text</button>
        <button onClick={() => addLayer("image")} className="w-full mb-2 p-2 bg-blue-400 text-white rounded">Add Image</button>
        <button onClick={undo} className="w-full mb-2 p-2 bg-gray-400 text-white rounded">Undo</button>
        <button onClick={redo} className="w-full mb-2 p-2 bg-gray-400 text-white rounded">Redo</button>

        <div className="mt-4">
          <h3 className="font-bold mb-2">Layers</h3>
          {layers.map((layer) => (
            <div
              key={layer.id}
              onClick={() => selectLayer(layer.id)}
              className={`p-2 mb-1 border rounded cursor-pointer ${selectedLayerId === layer.id ? "bg-blue-300" : "bg-white"}`}
            >
              {layer.type} - {layer.content?.substring(0, 10) || layer.type}
            </div>
          ))}
        </div>

        {selectedLayer && selectedLayer.type === "text" && (
          <div className="mt-4">
            <label>Text</label>
            <textarea
              value={selectedLayer.content}
              onChange={(e) => updateLayer(selectedLayer.id, { content: e.target.value })}
              className="w-full border p-1 mb-2"
            />
            <label>Bold / Italic / Underline</label>
            <div className="flex space-x-2 mb-2">
              <button
                onClick={() => updateLayer(selectedLayer.id, { bold: !selectedLayer.bold })}
                className={`px-2 py-1 border rounded ${selectedLayer.bold ? "bg-blue-600 text-white" : ""}`}
              >B</button>
              <button
                onClick={() => updateLayer(selectedLayer.id, { italic: !selectedLayer.italic })}
                className={`px-2 py-1 border rounded ${selectedLayer.italic ? "bg-blue-600 text-white" : ""}`}
              >I</button>
              <button
                onClick={() => updateLayer(selectedLayer.id, { underline: !selectedLayer.underline })}
                className={`px-2 py-1 border rounded ${selectedLayer.underline ? "bg-blue-600 text-white" : ""}`}
              >U</button>
            </div>

            <label>Font Size</label>
            <input
              type="number"
              value={selectedLayer.fontSize}
              onChange={(e) => updateLayer(selectedLayer.id, { fontSize: Number(e.target.value) })}
              className="w-full border p-1 mb-2"
            />

            <label>Letter Spacing</label>
            <input
              type="number"
              value={selectedLayer.letterSpacing}
              onChange={(e) => updateLayer(selectedLayer.id, { letterSpacing: Number(e.target.value) })}
              className="w-full border p-1 mb-2"
            />

            <label>Line Height</label>
            <input
              type="number"
              step="0.1"
              value={selectedLayer.lineHeight}
              onChange={(e) => updateLayer(selectedLayer.id, { lineHeight: Number(e.target.value) })}
              className="w-full border p-1 mb-2"
            />

            <label>Text Transform</label>
            <select
              value={selectedLayer.textTransform}
              onChange={(e) => updateLayer(selectedLayer.id, { textTransform: e.target.value as any })}
              className="w-full border p-1 mb-2"
            >
              <option value="none">None</option>
              <option value="uppercase">Uppercase</option>
              <option value="lowercase">Lowercase</option>
              <option value="capitalize">Capitalize</option>
            </select>
          </div>
        )}
      </div>

      <div className="flex-1 relative">
        <canvas ref={canvasRef} width={1200} height={800} className="border w-full h-full" />
        <div className="absolute bottom-2 left-2 p-2 bg-white bg-opacity-80 rounded flex items-center space-x-2">
          <button onClick={() => setIsPlaying(!isPlaying)} className="px-2 py-1 bg-green-400 text-white rounded">{isPlaying ? "Pause" : "Play"}</button>
          <label>FPS</label>
          <input type="number" value={fps} onChange={(e) => setFps(Number(e.target.value))} className="border p-1 w-16"/>
          <label>Frame</label>
          <input type="number" value={frame} onChange={(e) => setFrame(Number(e.target.value))} className="border p-1 w-16"/>
        </div>
      </div>
    </div>
  );
};

export default CanvasEditor;
