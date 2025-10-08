import React, { useRef, useState, useEffect, useCallback } from "react";
import opentype from "opentype.js";

type Keyframe = { time: number; x: number; y: number; rotation?: number };
type TextLayer = {
  id: string;
  text: string;
  x: number;
  y: number;
  fontSize: number;
  fontFamily: string;
  bold: boolean;
  italic: boolean;
  underline: boolean;
  strikethrough: boolean;
  align: "left" | "center" | "right" | "justify";
  letterSpacing: number;
  lineHeight: number;
  wordSpacing: number;
  shadow: string;
  stroke: string;
  color: string;
  weight: number;
  keyframes: Keyframe[];
};

const defaultLayer: TextLayer = {
  id: "layer-1",
  text: "Hello World",
  x: 50,
  y: 50,
  fontSize: 40,
  fontFamily: "Arial",
  bold: false,
  italic: false,
  underline: false,
  strikethrough: false,
  align: "left",
  letterSpacing: 0,
  lineHeight: 1.2,
  wordSpacing: 0,
  shadow: "",
  stroke: "",
  color: "#000000",
  weight: 400,
  keyframes: [],
};

export default function CanvasTextEditor() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [layers, setLayers] = useState<TextLayer[]>([defaultLayer]);
  const [selectedLayerId, setSelectedLayerId] = useState<string>("layer-1");
  const [undoStack, setUndoStack] = useState<TextLayer[][]>([]);
  const [redoStack, setRedoStack] = useState<TextLayer[][]>([]);
  const [fps, setFps] = useState(30);
  const [playing, setPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);

  const selectedLayer = layers.find((l) => l.id === selectedLayerId);

  const pushUndo = () => setUndoStack((s) => [...s, JSON.parse(JSON.stringify(layers))]);
  const undo = () => {
    if (undoStack.length) {
      setRedoStack((s) => [...s, layers]);
      const prev = undoStack[undoStack.length - 1];
      setLayers(prev);
      setUndoStack((s) => s.slice(0, -1));
    }
  };
  const redo = () => {
    if (redoStack.length) {
      setUndoStack((s) => [...s, layers]);
      const next = redoStack[redoStack.length - 1];
      setLayers(next);
      setRedoStack((s) => s.slice(0, -1));
    }
  };

  const updateLayer = (id: string, newProps: Partial<TextLayer>) => {
    pushUndo();
    setLayers((l) => l.map((layer) => (layer.id === id ? { ...layer, ...newProps } : layer)));
  };

  // Animation interpolation
  const interpolate = (layer: TextLayer, t: number) => {
    if (!layer.keyframes.length) return { x: layer.x, y: layer.y, rotation: 0 };
    const frames = [...layer.keyframes].sort((a, b) => a.time - b.time);
    let prev = frames[0];
    let next = frames[frames.length - 1];

    for (let i = 0; i < frames.length - 1; i++) {
      if (t >= frames[i].time && t <= frames[i + 1].time) {
        prev = frames[i];
        next = frames[i + 1];
        break;
      }
    }

    const progress = (t - prev.time) / (next.time - prev.time || 1);
    const x = prev.x + (next.x - prev.x) * progress;
    const y = prev.y + (next.y - prev.y) * progress;
    const rotation = (prev.rotation || 0) + ((next.rotation || 0) - (prev.rotation || 0)) * progress;
    return { x, y, rotation };
  };

  const renderCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    layers.forEach((layer) => {
      ctx.save();

      const anim = interpolate(layer, currentTime);
      ctx.translate(anim.x, anim.y);
      ctx.rotate((anim.rotation * Math.PI) / 180);

      ctx.font = `${layer.italic ? "italic " : ""}${layer.bold ? "bold " : ""}${layer.weight}px ${layer.fontFamily}`;
      ctx.textAlign = layer.align as CanvasTextAlign;
      ctx.fillStyle = layer.color;
      if (layer.shadow) {
        ctx.shadowColor = layer.shadow;
        ctx.shadowBlur = 5;
      }
      if (layer.stroke) {
        ctx.lineWidth = 2;
        ctx.strokeStyle = layer.stroke;
      }

      const lines = layer.text.split("\n");
      lines.forEach((line, index) => {
        const yOffset = index * layer.fontSize * layer.lineHeight;
        ctx.fillText(line, 0, yOffset);
        if (layer.stroke) ctx.strokeText(line, 0, yOffset);
        if (layer.underline) ctx.fillRect(0, yOffset + 2, ctx.measureText(line).width, 2);
        if (layer.strikethrough) ctx.fillRect(0, yOffset - layer.fontSize / 3, ctx.measureText(line).width, 2);
      });

      ctx.restore();
    });
  }, [layers, currentTime]);

  useEffect(() => {
    let animFrame: number;
    if (playing) {
      const step = () => {
        setCurrentTime((t) => t + 1 / fps);
        animFrame = requestAnimationFrame(step);
      };
      animFrame = requestAnimationFrame(step);
    }
    renderCanvas();
    return () => cancelAnimationFrame(animFrame);
  }, [layers, renderCanvas, playing, fps, currentTime]);

  const dragging = useRef<{ id: string; offsetX: number; offsetY: number } | null>(null);
  const onMouseDown = (e: React.MouseEvent) => {
    if (!selectedLayer) return;
    dragging.current = {
      id: selectedLayer.id,
      offsetX: e.nativeEvent.offsetX - selectedLayer.x,
      offsetY: e.nativeEvent.offsetY - selectedLayer.y,
    };
  };
  const onMouseMove = (e: React.MouseEvent) => {
    if (dragging.current) {
      updateLayer(dragging.current.id, {
        x: e.nativeEvent.offsetX - dragging.current.offsetX,
        y: e.nativeEvent.offsetY - dragging.current.offsetY,
      });
    }
  };
  const onMouseUp = () => {
    dragging.current = null;
  };

  const addKeyframe = () => {
    if (!selectedLayer) return;
    const newKF: Keyframe = { time: currentTime, x: selectedLayer.x, y: selectedLayer.y };
    updateLayer(selectedLayer.id, { keyframes: [...selectedLayer.keyframes, newKF] });
  };

  return (
    <div className="flex space-x-4">
      <canvas
        ref={canvasRef}
        width={800}
        height={600}
        className="border"
        onMouseDown={onMouseDown}
        onMouseMove={onMouseMove}
        onMouseUp={onMouseUp}
      />

      <div className="w-72 space-y-4">
        {selectedLayer && (
          <>
            <label>Text</label>
            <textarea
              value={selectedLayer.text}
              onChange={(e) => updateLayer(selectedLayer.id, { text: e.target.value })}
              className="border p-1 w-full"
            />

            <label>Font Size</label>
            <input
              type="number"
              value={selectedLayer.fontSize}
              onChange={(e) => updateLayer(selectedLayer.id, { fontSize: parseInt(e.target.value) })}
              className="border p-1 w-full"
            />

            <label>Bold / Italic / Underline / Strike</label>
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
              <button
                onClick={() => updateLayer(selectedLayer.id, { strikethrough: !selectedLayer.strikethrough })}
                className={`px-2 py-1 border rounded ${selectedLayer.strikethrough ? "bg-blue-600 text-white" : ""}`}
              >
                S
              </button>
            </div>

            <label>Alignment</label>
            <select
              value={selectedLayer.align}
              onChange={(e) =>
                updateLayer(selectedLayer.id, { align: e.target.value as TextLayer["align"] })
              }
              className="border p-1 w-full"
            >
              <option value="left">Left</option>
              <option value="center">Center</option>
              <option value="right">Right</option>
              <option value="justify">Justify</option>
            </select>

            <label>Letter Spacing</label>
            <input
              type="number"
              value={selectedLayer.letterSpacing}
              onChange={(e) => updateLayer(selectedLayer.id, { letterSpacing: parseFloat(e.target.value) })}
              className="border p-1 w-full"
            />

            <label>Line Height</label>
            <input
              type="number"
              value={selectedLayer.lineHeight}
              onChange={(e) => updateLayer(selectedLayer.id, { lineHeight: parseFloat(e.target.value) })}
              className="border p-1 w-full"
            />

            <label>Color</label>
            <input
              type="color"
              value={selectedLayer.color}
              onChange={(e) => updateLayer(selectedLayer.id, { color: e.target.value })}
              className="border p-1 w-full"
            />

            <div className="flex space-x-2 mt-2">
              <button onClick={undo} className="px-2 py-1 border rounded bg-gray-200">
                Undo
              </button>
              <button onClick={redo} className="px-2 py-1 border rounded bg-gray-200">
                Redo
              </button>
            </div>

            <div className="mt-2">
              <label>Current Time: {currentTime.toFixed(2)}s</label>
              <div className="flex space-x-2">
                <button onClick={() => setPlaying(!playing)} className="px-2 py-1 border rounded bg-gray-200">
                  {playing ? "Pause" : "Play"}
                </button>
                <button onClick={addKeyframe} className="px-2 py-1 border rounded bg-gray-200">
                  Add Keyframe
                </button>
                <label>FPS:</label>
                <input
                  type="number"
                  value={fps}
                  onChange={(e) => setFps(parseInt(e.target.value))}
                  className="border p-1 w-16"
                />
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
