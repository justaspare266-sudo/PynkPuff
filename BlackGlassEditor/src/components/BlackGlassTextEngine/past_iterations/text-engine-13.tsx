import React, { useRef, useState, useEffect } from "react";
import opentype from "opentype.js";

type Layer = {
  id: string;
  type: "text" | "image";
  content: string;
  x: number;
  y: number;
  fontSize?: number;
  fontFamily?: string;
  bold?: boolean;
  italic?: boolean;
  underline?: boolean;
  underlineOffset?: number;
  letterSpacing?: number;
  lineHeight?: number;
  textTransform?: "none" | "uppercase" | "lowercase" | "capitalize";
  visible?: boolean;
  opacity?: number;
};

type Keyframe = {
  frame: number;
  layerId: string;
  properties: Partial<Layer>;
};

const FPS = 30;
const CANVAS_WIDTH = 800;
const CANVAS_HEIGHT = 600;

export default function FullEditor() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [layers, setLayers] = useState<Layer[]>([
    {
      id: "layer1",
      type: "text",
      content: "Hello, World!",
      x: 100,
      y: 100,
      fontSize: 40,
      fontFamily: "Arial",
      bold: false,
      italic: false,
      underline: true,
      underlineOffset: 5,
      letterSpacing: 2,
      lineHeight: 1.2,
      textTransform: "none",
      visible: true,
      opacity: 1,
    },
  ]);
  const [selectedLayer, setSelectedLayer] = useState<Layer | null>(layers[0]);
  const [currentFrame, setCurrentFrame] = useState(0);
  const [keyframes, setKeyframes] = useState<Keyframe[]>([]);
  const [isPlaying, setIsPlaying] = useState(false);
  const [frameCount, setFrameCount] = useState(120);

  // Canvas drawing
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

    layers.forEach((layer) => {
      if (!layer.visible) return;
      ctx.save();
      ctx.globalAlpha = layer.opacity ?? 1;

      if (layer.type === "text") {
        let text = layer.content;
        if (layer.textTransform === "uppercase") text = text.toUpperCase();
        else if (layer.textTransform === "lowercase") text = text.toLowerCase();
        else if (layer.textTransform === "capitalize")
          text = text.replace(/\b\w/g, (l) => l.toUpperCase());

        ctx.font = `${layer.bold ? "bold " : ""}${layer.italic ? "italic " : ""}${
          layer.fontSize ?? 20
        }px ${layer.fontFamily ?? "Arial"}`;
        ctx.textBaseline = "top";
        const lines = text.split("\n");
        lines.forEach((line, i) => {
          ctx.fillText(line, layer.x, layer.y + i * ((layer.fontSize ?? 20) * (layer.lineHeight ?? 1)));
          if (layer.underline) {
            const width = ctx.measureText(line).width + (line.length - 1) * (layer.letterSpacing ?? 0);
            ctx.beginPath();
            ctx.moveTo(layer.x, layer.y + i * ((layer.fontSize ?? 20) * (layer.lineHeight ?? 1)) + (layer.fontSize ?? 20) + (layer.underlineOffset ?? 2));
            ctx.lineTo(layer.x + width, layer.y + i * ((layer.fontSize ?? 20) * (layer.lineHeight ?? 1)) + (layer.fontSize ?? 20) + (layer.underlineOffset ?? 2));
            ctx.stroke();
          }
        });
      }

      ctx.restore();
    });
  }, [layers, currentFrame]);

  // Animation playback
  useEffect(() => {
    if (!isPlaying) return;
    const interval = setInterval(() => {
      setCurrentFrame((prev) => (prev + 1) % frameCount);
    }, 1000 / FPS);
    return () => clearInterval(interval);
  }, [isPlaying, frameCount]);

  const updateLayer = (id: string, props: Partial<Layer>) => {
    setLayers((prev) =>
      prev.map((layer) => (layer.id === id ? { ...layer, ...props } : layer))
    );
    if (selectedLayer && selectedLayer.id === id) {
      setSelectedLayer({ ...selectedLayer, ...props });
    }
  };

  const addLayer = () => {
    const newLayer: Layer = {
      id: `layer${layers.length + 1}`,
      type: "text",
      content: "New Text",
      x: 50,
      y: 50,
      fontSize: 30,
      fontFamily: "Arial",
      bold: false,
      italic: false,
      underline: false,
      underlineOffset: 2,
      letterSpacing: 0,
      lineHeight: 1.2,
      textTransform: "none",
      visible: true,
      opacity: 1,
    };
    setLayers([...layers, newLayer]);
    setSelectedLayer(newLayer);
  };

  const addKeyframe = () => {
    if (!selectedLayer) return;
    setKeyframes([...keyframes, { frame: currentFrame, layerId: selectedLayer.id, properties: { ...selectedLayer } }]);
  };

  return (
    <div className="flex space-x-4 p-4 font-sans">
      {/* Canvas */}
      <div>
        <canvas ref={canvasRef} width={CANVAS_WIDTH} height={CANVAS_HEIGHT} className="border" />
        <div className="mt-2 flex space-x-2">
          <button onClick={() => setIsPlaying(!isPlaying)} className="px-2 py-1 border rounded">
            {isPlaying ? "Pause" : "Play"}
          </button>
          <button onClick={addLayer} className="px-2 py-1 border rounded">
            Add Layer
          </button>
          <button onClick={addKeyframe} className="px-2 py-1 border rounded">
            Add Keyframe
          </button>
          <input
            type="number"
            min={1}
            value={frameCount}
            onChange={(e) => setFrameCount(Number(e.target.value))}
            className="border px-1 rounded w-16"
          />
          <span>Frames</span>
        </div>
      </div>

      {/* Inspector */}
      <div className="w-64">
        {selectedLayer && (
          <div className="space-y-2">
            <h2 className="font-bold">Selected Layer</h2>
            <label>Content</label>
            <textarea
              value={selectedLayer.content}
              onChange={(e) => updateLayer(selectedLayer.id, { content: e.target.value })}
              className="border w-full p-1 rounded"
            />
            <label>Font Size</label>
            <input
              type="number"
              value={selectedLayer.fontSize}
              onChange={(e) => updateLayer(selectedLayer.id, { fontSize: Number(e.target.value) })}
              className="border w-full p-1 rounded"
            />
            <label>Font Family</label>
            <input
              type="text"
              value={selectedLayer.fontFamily}
              onChange={(e) => updateLayer(selectedLayer.id, { fontFamily: e.target.value })}
              className="border w-full p-1 rounded"
            />
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
            <label>Underline Offset</label>
            <input
              type="number"
              value={selectedLayer.underlineOffset}
              onChange={(e) => updateLayer(selectedLayer.id, { underlineOffset: Number(e.target.value) })}
              className="border w-full p-1 rounded"
            />
            <label>Letter Spacing</label>
            <input
              type="number"
              value={selectedLayer.letterSpacing}
              onChange={(e) => updateLayer(selectedLayer.id, { letterSpacing: Number(e.target.value) })}
              className="border w-full p-1 rounded"
            />
            <label>Line Height</label>
            <input
              type="number"
              step="0.1"
              value={selectedLayer.lineHeight}
              onChange={(e) => updateLayer(selectedLayer.id, { lineHeight: Number(e.target.value) })}
              className="border w-full p-1 rounded"
            />
            <label>Text Transform</label>
            <select
              value={selectedLayer.textTransform}
              onChange={(e) =>
                updateLayer(selectedLayer.id, { textTransform: e.target.value as Layer["textTransform"] })
              }
              className="border w-full p-1 rounded"
            >
              <option value="none">None</option>
              <option value="uppercase">Uppercase</option>
              <option value="lowercase">Lowercase</option>
              <option value="capitalize">Capitalize</option>
            </select>
          </div>
        )}
      </div>
    </div>
  );
}
