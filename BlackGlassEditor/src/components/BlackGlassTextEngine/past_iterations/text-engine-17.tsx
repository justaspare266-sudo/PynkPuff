import React, { useRef, useState, useEffect, useCallback } from "react";
import opentype from "opentype.js";

export interface Layer {
  id: number;
  text: string;
  x: number;
  y: number;
  fontSize: number;
  fontFamily: string;
  fontWeight: string;
  bold: boolean;
  italic: boolean;
  underline: boolean;
  lineHeight: number;
  letterSpacing: number;
  transform: "none" | "uppercase" | "lowercase" | "capitalize";
  color: string;
  animation?: {
    type: "fade" | "slideX" | "slideY" | "none";
    duration: number; // seconds
    delay: number; // seconds
  };
}

const defaultLayer: Layer = {
  id: Date.now(),
  text: "Hello World!",
  x: 50,
  y: 50,
  fontSize: 48,
  fontFamily: "Arial",
  fontWeight: "Regular",
  bold: false,
  italic: false,
  underline: false,
  lineHeight: 1.2,
  letterSpacing: 0,
  transform: "none",
  color: "#333",
  animation: { type: "none", duration: 0, delay: 0 },
};

export const TextEditorCanvas: React.FC = () => {
  const [layers, setLayers] = useState<Layer[]>([defaultLayer]);
  const [selectedId, setSelectedId] = useState<number>(defaultLayer.id);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [loadedFonts, setLoadedFonts] = useState<Record<string, opentype.Font>>({});

  const selectedLayer = layers.find((l) => l.id === selectedId);

  // Load fonts using opentype.js
  const loadFont = async (family: string) => {
    if (loadedFonts[family]) return loadedFonts[family];
    try {
      const fontPath = `/fonts/${family}.woff`; // Put woff/woff2 fonts in public/fonts
      const response = await fetch(fontPath);
      const arrayBuffer = await response.arrayBuffer();
      const font = opentype.parse(arrayBuffer);
      setLoadedFonts((prev) => ({ ...prev, [family]: font }));
      return font;
    } catch (e) {
      console.error("Font load failed:", e);
      return null;
    }
  };

  // Render all layers
  const renderCanvas = useCallback(async () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    canvas.width = canvas.clientWidth * dpr;
    canvas.height = canvas.clientHeight * dpr;
    ctx.scale(dpr, dpr);

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    for (const layer of layers) {
      const font = await loadFont(layer.fontFamily);
      let x = layer.x;
      let y = layer.y;

      const lines = layer.text.split("\n").map((line) => {
        if (layer.transform === "uppercase") return line.toUpperCase();
        if (layer.transform === "lowercase") return line.toLowerCase();
        if (layer.transform === "capitalize") return line.replace(/\b\w/g, (c) => c.toUpperCase());
        return line;
      });

      for (const line of lines) {
        if (!font) {
          ctx.font = `${layer.bold ? "bold " : ""}${layer.italic ? "italic " : ""}${layer.fontSize}px ${layer.fontFamily}, sans-serif`;
          ctx.fillStyle = layer.color;
          ctx.fillText(line, x, y);
          if (layer.underline) {
            const w = ctx.measureText(line).width + layer.letterSpacing * (line.length - 1);
            ctx.beginPath();
            ctx.moveTo(x, y + layer.fontSize * 0.1);
            ctx.lineTo(x + w, y + layer.fontSize * 0.1);
            ctx.strokeStyle = layer.color;
            ctx.lineWidth = Math.max(1, layer.fontSize / 15);
            ctx.stroke();
          }
          y += layer.fontSize * layer.lineHeight;
          continue;
        }

        let offsetX = 0;
        for (const char of line) {
          const glyph = font.charToGlyph(char);
          const scale = layer.fontSize / font.unitsPerEm;
          const width = glyph.advanceWidth * scale + layer.letterSpacing;
          const path = glyph.getPath(x + offsetX, y, layer.fontSize);
          if (layer.bold) {
            const bpath = glyph.getPath(x + offsetX, y, layer.fontSize);
            bpath.commands.forEach((cmd) => path.commands.push(cmd));
          }
          path.fill = layer.color;
          path.draw(ctx);
          offsetX += width;
        }
        if (layer.underline) {
          ctx.strokeStyle = layer.color;
          ctx.lineWidth = Math.max(1, layer.fontSize / 15);
          ctx.beginPath();
          ctx.moveTo(x, y + layer.fontSize * 0.1);
          ctx.lineTo(x + ctx.measureText(line).width + layer.letterSpacing * (line.length - 1), y + layer.fontSize * 0.1);
          ctx.stroke();
        }
        y += layer.fontSize * layer.lineHeight;
      }
    }
  }, [layers, loadedFonts]);

  useEffect(() => {
    renderCanvas();
  }, [layers, renderCanvas]);

  const updateLayer = (id: number, updates: Partial<Layer>) =>
    setLayers((prev) => prev.map((l) => (l.id === id ? { ...l, ...updates } : l)));

  const addLayer = () => {
    const newLayer: Layer = { ...defaultLayer, id: Date.now(), text: "New Layer" };
    setLayers((prev) => [...prev, newLayer]);
    setSelectedId(newLayer.id);
  };

  const removeLayer = (id: number) => setLayers((prev) => prev.filter((l) => l.id !== id));

  const exportPNG = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const link = document.createElement("a");
    link.download = "canvas.png";
    link.href = canvas.toDataURL();
    link.click();
  };

  return (
    <div className="flex flex-col h-screen w-screen">
      <div className="flex flex-1">
        <div className="w-1/4 p-4 overflow-auto bg-gray-50 border-r">
          <h2 className="font-bold mb-2">Layers</h2>
          <button onClick={addLayer} className="px-2 py-1 bg-blue-600 text-white rounded mb-2">
            + Add Layer
          </button>
          {layers.map((layer) => (
            <div
              key={layer.id}
              className={`p-2 mb-1 border rounded cursor-pointer ${layer.id === selectedId ? "bg-blue-100" : ""}`}
              onClick={() => setSelectedId(layer.id)}
            >
              <input
                type="text"
                value={layer.text}
                onChange={(e) => updateLayer(layer.id, { text: e.target.value })}
                className="w-full border p-1 rounded mb-1"
              />
              <div className="flex space-x-2 mb-1">
                <label>
                  Size
                  <input
                    type="number"
                    value={layer.fontSize}
                    onChange={(e) => updateLayer(layer.id, { fontSize: parseInt(e.target.value) })}
                    className="w-16 border rounded p-1 ml-1"
                  />
                </label>
                <label>
                  LineHeight
                  <input
                    type="number"
                    step="0.1"
                    value={layer.lineHeight}
                    onChange={(e) => updateLayer(layer.id, { lineHeight: parseFloat(e.target.value) })}
                    className="w-16 border rounded p-1 ml-1"
                  />
                </label>
                <label>
                  LetterSpacing
                  <input
                    type="number"
                    step="0.1"
                    value={layer.letterSpacing}
                    onChange={(e) => updateLayer(layer.id, { letterSpacing: parseFloat(e.target.value) })}
                    className="w-16 border rounded p-1 ml-1"
                  />
                </label>
              </div>
              <div className="flex space-x-2 mb-1">
                <button onClick={() => updateLayer(layer.id, { bold: !layer.bold })} className={`px-2 py-1 border rounded ${layer.bold ? "bg-blue-600 text-white" : ""}`}>
                  B
                </button>
                <button onClick={() => updateLayer(layer.id, { italic: !layer.italic })} className={`px-2 py-1 border rounded ${layer.italic ? "bg-blue-600 text-white" : ""}`}>
                  I
                </button>
                <button onClick={() => updateLayer(layer.id, { underline: !layer.underline })} className={`px-2 py-1 border rounded ${layer.underline ? "bg-blue-600 text-white" : ""}`}>
                  U
                </button>
              </div>
              <label>
                Color
                <input type="color" value={layer.color} onChange={(e) => updateLayer(layer.id, { color: e.target.value })} className="ml-2" />
              </label>
              <div className="mt-1">
                <button onClick={() => removeLayer(layer.id)} className="text-red-500">Remove</button>
              </div>
            </div>
          ))}
        </div>
        <div className="flex-1 flex items-center justify-center relative bg-gray-100">
          <canvas ref={canvasRef} className="border w-full h-full" />
        </div>
      </div>
      <div className="p-2 bg-gray-200 flex justify-end">
        <button onClick={exportPNG} className="px-3 py-1 bg-green-600 text-white rounded">
          Export PNG
        </button>
      </div>
    </div>
  );
};
