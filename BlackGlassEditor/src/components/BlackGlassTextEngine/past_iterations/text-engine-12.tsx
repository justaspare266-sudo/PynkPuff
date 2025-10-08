import React, { useState, useRef, useEffect, useReducer } from "react";
import opentype from "opentype.js";

type TextLayer = {
  id: string;
  text: string;
  x: number;
  y: number;
  fontSize: number;
  color: string;
  bold: boolean;
  italic: boolean;
  underline: boolean;
  underlineOffset: number;
  letterSpacing: number;
  lineHeight: number;
  textTransform: "none" | "uppercase" | "lowercase" | "capitalize";
  keyframes: { time: number; x?: number; y?: number; fontSize?: number; color?: string }[];
};

type Action =
  | { type: "ADD_LAYER"; payload: TextLayer }
  | { type: "UPDATE_LAYER"; id: string; payload: Partial<TextLayer> }
  | { type: "REMOVE_LAYER"; id: string }
  | { type: "UNDO" }
  | { type: "REDO" };

type HistoryState = {
  past: TextLayer[][];
  present: TextLayer[];
  future: TextLayer[][];
};

const initialState: HistoryState = {
  past: [],
  present: [],
  future: [],
};

function historyReducer(state: HistoryState, action: Action): HistoryState {
  switch (action.type) {
    case "ADD_LAYER": {
      const newPresent = [...state.present, action.payload];
      return { past: [...state.past, state.present], present: newPresent, future: [] };
    }
    case "UPDATE_LAYER": {
      const newPresent = state.present.map((l) =>
        l.id === action.id ? { ...l, ...action.payload } : l
      );
      return { past: [...state.past, state.present], present: newPresent, future: [] };
    }
    case "REMOVE_LAYER": {
      const newPresent = state.present.filter((l) => l.id !== action.id);
      return { past: [...state.past, state.present], present: newPresent, future: [] };
    }
    case "UNDO": {
      if (state.past.length === 0) return state;
      const previous = state.past[state.past.length - 1];
      const newPast = state.past.slice(0, -1);
      return { past: newPast, present: previous, future: [state.present, ...state.future] };
    }
    case "REDO": {
      if (state.future.length === 0) return state;
      const next = state.future[0];
      const newFuture = state.future.slice(1);
      return { past: [...state.past, state.present], present: next, future: newFuture };
    }
    default:
      return state;
  }
}

const CanvasTextEditor: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [selectedLayerId, setSelectedLayerId] = useState<string | null>(null);
  const [history, dispatch] = useReducer(historyReducer, initialState);
  const [fps, setFps] = useState<number>(30);
  const [currentTime, setCurrentTime] = useState<number>(0);

  const selectedLayer = history.present.find((l) => l.id === selectedLayerId) || null;

  // Animation loop
  useEffect(() => {
    let animationFrameId: number;
    let lastTime = performance.now();
    const interval = 1000 / fps;

    const renderLoop = (time: number) => {
      if (time - lastTime >= interval) {
        lastTime = time;
        setCurrentTime((t) => t + interval / 1000);
      }
      drawCanvas();
      animationFrameId = requestAnimationFrame(renderLoop);
    };
    animationFrameId = requestAnimationFrame(renderLoop);
    return () => cancelAnimationFrame(animationFrameId);
  }, [fps, history.present]);

  const drawCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    history.present.forEach((layer) => {
      ctx.save();
      ctx.fillStyle = layer.color;
      ctx.font = `${layer.italic ? "italic " : ""}${layer.bold ? "bold " : ""}${layer.fontSize}px sans-serif`;
      ctx.textBaseline = "top";

      // Apply text-transform
      let displayText = layer.text;
      switch (layer.textTransform) {
        case "uppercase":
          displayText = displayText.toUpperCase();
          break;
        case "lowercase":
          displayText = displayText.toLowerCase();
          break;
        case "capitalize":
          displayText = displayText.replace(/\b\w/g, (c) => c.toUpperCase());
          break;
      }

      // Handle multi-line
      const lines = displayText.split("\n");
      lines.forEach((line, i) => {
        const yPos = layer.y + i * layer.lineHeight;
        ctx.fillText(line, layer.x, yPos);

        // Underline
        if (layer.underline) {
          const textWidth = ctx.measureText(line).width;
          ctx.beginPath();
          ctx.moveTo(layer.x, yPos + layer.fontSize + layer.underlineOffset);
          ctx.lineTo(layer.x + textWidth, yPos + layer.fontSize + layer.underlineOffset);
          ctx.lineWidth = 1;
          ctx.strokeStyle = layer.color;
          ctx.stroke();
        }
      });

      ctx.restore();
    });
  };

  const addLayer = () => {
    const newLayer: TextLayer = {
      id: crypto.randomUUID(),
      text: "New Text",
      x: 50,
      y: 50,
      fontSize: 32,
      color: "#000000",
      bold: false,
      italic: false,
      underline: false,
      underlineOffset: 2,
      letterSpacing: 0,
      lineHeight: 36,
      textTransform: "none",
      keyframes: [],
    };
    dispatch({ type: "ADD_LAYER", payload: newLayer });
    setSelectedLayerId(newLayer.id);
  };

  const updateLayer = (id: string, payload: Partial<TextLayer>) => {
    dispatch({ type: "UPDATE_LAYER", id, payload });
  };

  return (
    <div className="flex space-x-4">
      <div>
        <canvas ref={canvasRef} width={800} height={600} className="border" />
        <div className="mt-2 flex space-x-2">
          <button onClick={addLayer} className="px-2 py-1 border rounded bg-green-500 text-white">Add Layer</button>
          <button onClick={() => dispatch({ type: "UNDO" })} className="px-2 py-1 border rounded">Undo</button>
          <button onClick={() => dispatch({ type: "REDO" })} className="px-2 py-1 border rounded">Redo</button>
          <input
            type="number"
            value={fps}
            onChange={(e) => setFps(Number(e.target.value))}
            className="border px-2 py-1 rounded w-20"
            placeholder="FPS"
          />
        </div>
      </div>

      {selectedLayer && (
        <div className="flex flex-col space-y-2">
          <label>Text</label>
          <textarea
            value={selectedLayer.text}
            onChange={(e) => updateLayer(selectedLayer.id, { text: e.target.value })}
            className="border p-1 rounded w-64 h-24"
          />

          <label>Style</label>
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

          <label>Font Size</label>
          <input
            type="number"
            value={selectedLayer.fontSize}
            onChange={(e) => updateLayer(selectedLayer.id, { fontSize: Number(e.target.value) })}
            className="border px-2 py-1 rounded"
          />

          <label>Letter Spacing</label>
          <input
            type="number"
            value={selectedLayer.letterSpacing}
            onChange={(e) => updateLayer(selectedLayer.id, { letterSpacing: Number(e.target.value) })}
            className="border px-2 py-1 rounded"
          />

          <label>Line Height</label>
          <input
            type="number"
            value={selectedLayer.lineHeight}
            onChange={(e) => updateLayer(selectedLayer.id, { lineHeight: Number(e.target.value) })}
            className="border px-2 py-1 rounded"
          />

          <label>Underline Offset</label>
          <input
            type="number"
            value={selectedLayer.underlineOffset}
            onChange={(e) => updateLayer(selectedLayer.id, { underlineOffset: Number(e.target.value) })}
            className="border px-2 py-1 rounded"
          />

          <label>Text Transform</label>
          <select
            value={selectedLayer.textTransform}
            onChange={(e) => updateLayer(selectedLayer.id, { textTransform: e.target.value as any })}
            className="border px-2 py-1 rounded"
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
            onChange={(e) => updateLayer(selectedLayer.id, { color: e.target.value })}
            className="border p-1 rounded"
          />
        </div>
      )}
    </div>
  );
};

export default CanvasTextEditor;
