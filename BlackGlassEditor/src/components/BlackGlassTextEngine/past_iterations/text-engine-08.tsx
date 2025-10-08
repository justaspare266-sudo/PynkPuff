import React, { useRef, useState, useEffect, useCallback } from "react";
import opentype from "opentype.js";

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
  keyframes: { time: number; x: number; y: number; rotation?: number }[];
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

  const selectedLayer = layers.find((l) => l.id === selectedLayerId);

  // Undo / redo
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

  // Canvas render
  const renderCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    layers.forEach((layer) => {
      ctx.save();
      ctx.font = `${layer.italic ? "italic " : ""}${layer.bold ? "bold " : ""}${layer.weight}px ${layer.fontFamily}`;
      ctx.textAlign = layer.align as CanvasTextAlign;
      ctx.fillStyle = layer.color;
      if (layer.shadow) ctx.shadowColor = layer.shadow;
      ctx.shadowBlur = layer.shadow ? 5 : 0;
      if (layer.stroke) {
        ctx.lineWidth = 2;
        ctx.strokeStyle = layer.stroke;
      }

      const lines = layer.text.split("\n");
      lines.forEach((line, index) => {
        const y = layer.y + index * layer.fontSize * layer.lineHeight;
        ctx.fillText(line, layer.x, y);
        if (layer.stroke) ctx.strokeText(line, layer.x, y);
        if (layer.underline) ctx.fillRect(layer.x, y + 2, ctx.measureText(line).width, 2);
        if (layer.strikethrough) ctx.fillRect(layer.x, y - layer.fontSize / 3, ctx.measureText(line).width, 2);
      });

      ctx.restore();
    });
  }, [layers]);

  useEffect(() => {
    renderCanvas();
  }, [layers, renderCanvas]);

  // Drag layers
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

      <div className="w-64 space-y-4">
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
          </>
        )}
      </div>
    </div>
  );
}
