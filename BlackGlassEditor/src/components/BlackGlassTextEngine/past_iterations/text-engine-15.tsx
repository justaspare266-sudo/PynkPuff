import React, { useRef, useState, useEffect, useCallback } from "react";
import opentype from "opentype.js";

export interface Keyframe {
  time: number;
  x: number;
  y: number;
  opacity: number;
}

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
  keyframes: Keyframe[];
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
  keyframes: [{ time: 0, x: 50, y: 50, opacity: 1 }],
};

export const TextEditorCanvas: React.FC = () => {
  const [layers, setLayers] = useState<Layer[]>([defaultLayer]);
  const [selectedId, setSelectedId] = useState<number>(defaultLayer.id);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [loadedFonts, setLoadedFonts] = useState<Record<string, opentype.Font>>({});
  const [currentTime, setCurrentTime] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [draggingLayerId, setDraggingLayerId] = useState<number | null>(null);
  const [dragOffset, setDragOffset] = useState<{ x: number; y: number }>({ x: 0, y: 0 });

  const selectedLayer = layers.find((l) => l.id === selectedId);

  // Load fonts
  const loadFont = async (family: string) => {
    if (loadedFonts[family]) return loadedFonts[family];
    try {
      const fontPath = `/fonts/${family}.woff`;
      const resp = await fetch(fontPath);
      const buffer = await resp.arrayBuffer();
      const font = opentype.parse(buffer);
      setLoadedFonts((prev) => ({ ...prev, [family]: font }));
      return font;
    } catch (e) {
      console.error("Font load failed:", e);
      return null;
    }
  };

  // Interpolate between keyframes
  const interpolate = (keyframes: Keyframe[], t: number): Keyframe => {
    if (!keyframes.length) return { time: t, x: 0, y: 0, opacity: 1 };
    const sorted = [...keyframes].sort((a, b) => a.time - b.time);
    if (t <= sorted[0].time) return sorted[0];
    if (t >= sorted[sorted.length - 1].time) return sorted[sorted.length - 1];
    for (let i = 0; i < sorted.length - 1; i++) {
      const a = sorted[i];
      const b = sorted[i + 1];
      if (t >= a.time && t <= b.time) {
        const f = (t - a.time) / (b.time - a.time);
        return {
          time: t,
          x: a.x + f * (b.x - a.x),
          y: a.y + f * (b.y - a.y),
          opacity: a.opacity + f * (b.opacity - a.opacity),
        };
      }
    }
    return sorted[0];
  };

  // Render layers at current time
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
      const frame = interpolate(layer.keyframes, currentTime);
      ctx.globalAlpha = frame.opacity;
      let x = frame.x;
      let y = frame.y;

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
      ctx.globalAlpha = 1;
    }
  }, [layers, loadedFonts, currentTime]);

  useEffect(() => {
    renderCanvas();
  }, [layers, renderCanvas, currentTime]);

  // Playback
  useEffect(() => {
    if (!isPlaying) return;
    const start = performance.now() - currentTime * 1000;
    let raf: number;

    const animate = (time: number) => {
      const t = (time - start) / 1000;
      setCurrentTime(t);
      raf = requestAnimationFrame(animate);
    };
    raf = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(raf);
  }, [isPlaying, currentTime]);

  const updateLayer = (id: number, updates: Partial<Layer>) =>
    setLayers((prev) => prev.map((l) => (l.id === id ? { ...l, ...updates } : l)));

  const addLayer = () => {
    const newLayer: Layer = { ...defaultLayer, id: Date.now(), text: "New Layer" };
    setLayers((prev) => [...prev, newLayer]);
    setSelectedId(newLayer.id);
  };

  const removeLayer = (id: number) => setLayers((prev) => prev.filter((l) => l.id !== id));

  const addKeyframe = (layerId: number) => {
    const layer = layers.find((l) => l.id === layerId);
    if (!layer) return;
    const last = layer.keyframes[layer.keyframes.length - 1];
    const newFrame = { ...last, time: last.time + 1 };
    updateLayer(layerId, { keyframes: [...layer.keyframes, newFrame] });
  };

  const exportPNG = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const link = document.createElement("a");
    link.download = "canvas.png";
    link.href = canvas.toDataURL();
    link.click();
  };

  // Drag handlers for canvas layers
  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!canvasRef.current) return;
    const rect = canvasRef.current.getBoundingClientRect();
    const mx = e.clientX - rect.left;
    const my = e.clientY - rect.top;
    for (const layer of layers) {
      const frame = interpolate(layer.keyframes, currentTime);
      const width = layer.text.length * layer.fontSize * 0.6; // rough
      const height = layer.fontSize * layer.lineHeight * layer.text.split("\n").length;
      if (mx >= frame.x && mx <= frame.x + width && my >= frame.y - height / 2 && my <= frame.y + height / 2) {
        setDraggingLayerId(layer.id);
        setDragOffset({ x: mx - frame.x, y: my - frame.y });
        setSelectedId(layer.id);
        break;
      }
    }
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (draggingLayerId === null) return;
    if (!canvasRef.current) return;
    const rect = canvasRef.current.getBoundingClientRect();
    const mx = e.clientX - rect.left;
    const my = e.clientY - rect.top;
    updateLayer(draggingLayerId, (prev) => {
      const keyframes = prev.keyframes.map((kf) => (kf.time === interpolate(prev.keyframes, currentTime).time ? { ...kf, x: mx - dragOffset.x, y: my - dragOffset.y } : kf));
      return { keyframes };
    });
  };

  const handleMouseUp = () => {
    setDraggingLayerId(null);
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
                <button onClick={() => removeLayer(layer.id)} className="text-red-500">
                  Remove
                </button>
                <button onClick={() => addKeyframe(layer.id)} className="ml-2 text-green-600">
                  + Keyframe
                </button>
              </div>
            </div>
          ))}
        </div>
        <div className="flex-1 flex items-center justify-center relative bg-gray-100">
          <canvas
            ref={canvasRef}
            className="border w-full h-full"
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
          />
        </div>
      </div>

      {/* Timeline */}
      <div className="p-2 bg-gray-300 flex flex-col">
        <div className="flex items-center justify-between mb-2">
          <button onClick={() => setIsPlaying(!isPlaying)} className="px-3 py-1 bg-blue-600 text-white rounded">
            {isPlaying ? "Pause" : "Play"}
          </button>
          <span>Time: {currentTime.toFixed(2)}s</span>
          <button onClick={exportPNG} className="px-3 py-1 bg-green-600 text-white rounded">
            Export PNG
          </button>
        </div>
        <div className="flex overflow-x-auto space-x-2 relative">
          {layers.map((layer) =>
            layer.keyframes.map((kf, idx) => (
              <div
                key={`${layer.id}-${idx}`}
                className="w-4 h-4 bg-purple-600 rounded-full cursor-pointer absolute"
                style={{ left: `${kf.time * 50}px` }}
                title={`${layer.text} @ ${kf.time}s`}
                draggable
                onDragStart={(e) => e.preventDefault()}
                onMouseDown={(e) => {
                  const startX = e.clientX;
                  const initialTime = kf.time;
                  const onMouseMove = (moveEvent: MouseEvent) => {
                    const delta = (moveEvent.clientX - startX) / 50; // time per px
                    updateLayer(layer.id, {
                      keyframes: layer.keyframes.map((frame, i) => (i === idx ? { ...frame, time: Math.max(0, initialTime + delta) } : frame)),
                    });
                  };
                  const onMouseUp = () => {
                    window.removeEventListener("mousemove", onMouseMove);
                    window.removeEventListener("mouseup", onMouseUp);
                  };
                  window.addEventListener("mousemove", onMouseMove);
                  window.addEventListener("mouseup", onMouseUp);
                }}
              ></div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
