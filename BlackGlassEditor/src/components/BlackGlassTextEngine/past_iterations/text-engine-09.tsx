import React, { useState, useRef, useEffect } from "react";
import opentype from "opentype.js";

type Layer = {
  id: number;
  text: string;
  x: number;
  y: number;
  fontSize: number;
  fontFamily: string;
  color: string;
  bold: boolean;
  italic: boolean;
  underline: boolean;
  letterSpacing: number;
  lineHeight: number;
  textTransform: "none" | "uppercase" | "lowercase" | "capitalize";
  underlineOffset: number;
  rotation: number;
};

type Keyframe = {
  time: number;
  layerId: number;
  props: Partial<Layer>;
};

export default function MaxedCanvasEditor() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [layers, setLayers] = useState<Layer[]>([]);
  const [selectedLayerId, setSelectedLayerId] = useState<number | null>(null);
  const [keyframes, setKeyframes] = useState<Keyframe[]>([]);
  const [currentTime, setCurrentTime] = useState(0);
  const [fps, setFps] = useState(30);

  // Undo/Redo stacks
  const undoStack = useRef<Layer[][]>([]);
  const redoStack = useRef<Layer[][]>([]);

  const pushUndo = () => {
    undoStack.current.push(JSON.parse(JSON.stringify(layers)));
    redoStack.current = [];
  };

  const undo = () => {
    const prev = undoStack.current.pop();
    if (prev) {
      redoStack.current.push(JSON.parse(JSON.stringify(layers)));
      setLayers(prev);
    }
  };

  const redo = () => {
    const next = redoStack.current.pop();
    if (next) {
      undoStack.current.push(JSON.parse(JSON.stringify(layers)));
      setLayers(next);
    }
  };

  const addLayer = () => {
    pushUndo();
    const newLayer: Layer = {
      id: Date.now(),
      text: "New Text",
      x: 50,
      y: 50,
      fontSize: 40,
      fontFamily: "Arial",
      color: "#000000",
      bold: false,
      italic: false,
      underline: false,
      letterSpacing: 0,
      lineHeight: 1.2,
      textTransform: "none",
      underlineOffset: 2,
      rotation: 0,
    };
    setLayers([...layers, newLayer]);
    setSelectedLayerId(newLayer.id);
  };

  const updateLayer = (id: number, props: Partial<Layer>) => {
    pushUndo();
    setLayers(layers.map(l => (l.id === id ? { ...l, ...props } : l)));
  };

  const selectedLayer = layers.find(l => l.id === selectedLayerId);

  const renderLayer = async (ctx: CanvasRenderingContext2D, layer: Layer) => {
    ctx.save();
    ctx.translate(layer.x, layer.y);
    ctx.rotate((layer.rotation * Math.PI) / 180);
    ctx.fillStyle = layer.color;
    ctx.font = `${layer.bold ? "bold" : ""} ${layer.italic ? "italic" : ""} ${layer.fontSize}px ${layer.fontFamily}`;
    const text = layer.textTransform === "uppercase"
      ? layer.text.toUpperCase()
      : layer.textTransform === "lowercase"
      ? layer.text.toLowerCase()
      : layer.textTransform === "capitalize"
      ? layer.text.replace(/\b\w/g, c => c.toUpperCase())
      : layer.text;

    // Handle multi-line
    const lines = text.split("\n");
    lines.forEach((line, idx) => {
      ctx.fillText(line, 0, idx * layer.fontSize * layer.lineHeight);
      if (layer.underline) {
        ctx.beginPath();
        ctx.moveTo(0, idx * layer.fontSize * layer.lineHeight + layer.fontSize + layer.underlineOffset);
        ctx.lineTo(ctx.measureText(line).width, idx * layer.fontSize * layer.lineHeight + layer.fontSize + layer.underlineOffset);
        ctx.strokeStyle = layer.color;
        ctx.lineWidth = 1;
        ctx.stroke();
      }
    });

    ctx.restore();
  };

  const renderCanvas = async () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    for (const layer of layers) {
      await renderLayer(ctx, layer);
    }
  };

  useEffect(() => {
    renderCanvas();
  }, [layers, currentTime]);

  // Animation playback
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(prev => prev + 1 / fps);
    }, 1000 / fps);
    return () => clearInterval(interval);
  }, [fps]);

  // Apply keyframes at current time
  useEffect(() => {
    keyframes
      .filter(kf => kf.time <= currentTime)
      .forEach(kf => {
        updateLayer(kf.layerId, kf.props);
      });
  }, [currentTime]);

  const addKeyframe = (layerId: number) => {
    const layer = layers.find(l => l.id === layerId);
    if (!layer) return;
    const kf: Keyframe = {
      time: currentTime,
      layerId,
      props: { ...layer },
    };
    setKeyframes([...keyframes, kf]);
  };

  return (
    <div className="p-4 space-y-4">
      <div className="flex space-x-2">
        <button onClick={addLayer} className="px-2 py-1 bg-green-500 text-white rounded">Add Layer</button>
        <button onClick={undo} className="px-2 py-1 bg-gray-500 text-white rounded">Undo</button>
        <button onClick={redo} className="px-2 py-1 bg-gray-500 text-white rounded">Redo</button>
        <input type="number" value={fps} onChange={e => setFps(Number(e.target.value))} className="border px-1 rounded w-16" /> FPS
      </div>

      <canvas ref={canvasRef} width={800} height={600} className="border" />

      {selectedLayer && (
        <div className="space-y-2 p-2 border">
          <label>Text</label>
          <input
            value={selectedLayer.text}
            onChange={e => updateLayer(selectedLayer.id, { text: e.target.value })}
            className="border w-full px-1 rounded"
          />

          <label>Font Size</label>
          <input
            type="number"
            value={selectedLayer.fontSize}
            onChange={e => updateLayer(selectedLayer.id, { fontSize: Number(e.target.value) })}
            className="border px-1 rounded w-24"
          />

          <label>Color</label>
          <input
            type="color"
            value={selectedLayer.color}
            onChange={e => updateLayer(selectedLayer.id, { color: e.target.value })}
          />

          <label>Letter Spacing</label>
          <input
            type="number"
            value={selectedLayer.letterSpacing}
            onChange={e => updateLayer(selectedLayer.id, { letterSpacing: Number(e.target.value) })}
            className="border px-1 rounded w-24"
          />

          <label>Line Height</label>
          <input
            type="number"
            value={selectedLayer.lineHeight}
            step={0.1}
            onChange={e => updateLayer(selectedLayer.id, { lineHeight: Number(e.target.value) })}
            className="border px-1 rounded w-24"
          />

          <label>Text Transform</label>
          <select
            value={selectedLayer.textTransform}
            onChange={e => updateLayer(selectedLayer.id, { textTransform: e.target.value as any })}
            className="border px-1 rounded"
          >
            <option value="none">None</option>
            <option value="uppercase">Uppercase</option>
            <option value="lowercase">Lowercase</option>
            <option value="capitalize">Capitalize</option>
          </select>

          <label>Bold / Italic / Underline</label>
          <div className="flex space-x-2">
            <button
              onClick={() => updateLayer(selectedLayer.id, { bold: !selectedLayer.bold })}
              className={`px-2 py-1 border rounded ${selectedLayer.bold ? "bg-blue-600 text-white" : ""}`}
            >
              B
            </button>
            <button
              onClick={() => updateLayer(selectedLayer.id, { italic: !selectedLayer.italic })}
              className={`px-2 py-1 border rounded ${selectedLayer.italic ? "bg-blue-600 text-white" : ""}`}
            >
              I
            </button>
            <button
              onClick={() => updateLayer(selectedLayer.id, { underline: !selectedLayer.underline })}
              className={`px-2 py-1 border rounded ${selectedLayer.underline ? "bg-blue-600 text-white" : ""}`}
            >
              U
            </button>
          </div>

          <label>Rotation</label>
          <input
            type="number"
            value={selectedLayer.rotation}
            onChange={e => updateLayer(selectedLayer.id, { rotation: Number(e.target.value) })}
            className="border px-1 rounded w-24"
          />

          <button onClick={() => addKeyframe(selectedLayer.id)} className="px-2 py-1 bg-purple-500 text-white rounded mt-2">
            Add Keyframe
          </button>
        </div>
      )}

      <div className="p-2 border">
        <label>Timeline (Preview FPS: {fps})</label>
        <input
          type="range"
          min={0}
          max={60}
          step={1}
          value={currentTime}
          onChange={e => setCurrentTime(Number(e.target.value))}
          className="w-full"
        />
      </div>
    </div>
  );
}
