import React, { useRef, useState, useEffect } from "react";
import opentype from "opentype.js";

type LayerType = {
  id: string;
  type: "text" | "image";
  content?: string;
  fontSize?: number;
  color?: string;
  bold?: boolean;
  italic?: boolean;
  underline?: boolean;
  underlineOffset?: number;
  lineHeight?: number;
  letterSpacing?: number;
  textTransform?: "none" | "uppercase" | "lowercase" | "capitalize";
  x: number;
  y: number;
  width?: number;
  height?: number;
  visible?: boolean;
  locked?: boolean;
  keyframes?: { time: number; props: Partial<LayerType> }[];
};

const generateId = () => Math.random().toString(36).substring(2, 9);

const MAX_ZOOM = 3;
const MIN_ZOOM = 0.2;

export const MegaEditor: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [layers, setLayers] = useState<LayerType[]>([]);
  const [selectedLayerId, setSelectedLayerId] = useState<string | null>(null);
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });

  const selectedLayer = layers.find((l) => l.id === selectedLayerId);

  const updateLayer = (id: string, props: Partial<LayerType>) => {
    setLayers((prev) =>
      prev.map((layer) => (layer.id === id ? { ...layer, ...props } : layer))
    );
  };

  const addTextLayer = () => {
    const newLayer: LayerType = {
      id: generateId(),
      type: "text",
      content: "New Text",
      fontSize: 32,
      color: "#000000",
      bold: false,
      italic: false,
      underline: false,
      underlineOffset: 0,
      lineHeight: 1.2,
      letterSpacing: 0,
      textTransform: "none",
      x: 50,
      y: 50,
      visible: true,
      locked: false,
      keyframes: [],
    };
    setLayers([...layers, newLayer]);
    setSelectedLayerId(newLayer.id);
  };

  const addImageLayer = (src: string) => {
    const img = new Image();
    img.src = src;
    img.onload = () => {
      const newLayer: LayerType = {
        id: generateId(),
        type: "image",
        x: 50,
        y: 50,
        width: img.width,
        height: img.height,
        visible: true,
        locked: false,
        keyframes: [],
      };
      setLayers([...layers, newLayer]);
      setSelectedLayerId(newLayer.id);
    };
  };

  const drawLayer = (ctx: CanvasRenderingContext2D, layer: LayerType) => {
    if (!layer.visible) return;

    if (layer.type === "text" && layer.content) {
      ctx.save();
      ctx.translate(layer.x, layer.y);
      ctx.font = `${layer.bold ? "bold " : ""}${layer.italic ? "italic " : ""}${
        layer.fontSize
      }px sans-serif`;
      ctx.fillStyle = layer.color || "#000";
      ctx.textBaseline = "top";
      const lines = layer.content.split("\n");
      lines.forEach((line, i) => {
        let rendered = line;
        switch (layer.textTransform) {
          case "uppercase":
            rendered = line.toUpperCase();
            break;
          case "lowercase":
            rendered = line.toLowerCase();
            break;
          case "capitalize":
            rendered = line.replace(/\b\w/g, (c) => c.toUpperCase());
        }
        ctx.fillText(rendered, 0, i * (layer.fontSize! * layer.lineHeight!));
        if (layer.underline) {
          ctx.beginPath();
          ctx.moveTo(
            0,
            i * (layer.fontSize! * layer.lineHeight!) + layer.fontSize! + (layer.underlineOffset || 0)
          );
          ctx.lineTo(
            ctx.measureText(rendered).width,
            i * (layer.fontSize! * layer.lineHeight!) + layer.fontSize! + (layer.underlineOffset || 0)
          );
          ctx.strokeStyle = layer.color || "#000";
          ctx.lineWidth = 2;
          ctx.stroke();
        }
      });
      ctx.restore();
    }

    if (layer.type === "image" && layer.width && layer.height) {
      const img = new Image();
      img.src = layer.content || "";
      img.onload = () => {
        ctx.drawImage(img, layer.x, layer.y, layer.width!, layer.height!);
      };
    }
  };

  const renderCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.scale(zoom, zoom);
    ctx.translate(pan.x, pan.y);

    layers.forEach((layer) => drawLayer(ctx, layer));
  };

  useEffect(() => {
    renderCanvas();
  }, [layers, zoom, pan]);

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    setDragStart({ x: e.clientX, y: e.clientY });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    const dx = (e.clientX - dragStart.x) / zoom;
    const dy = (e.clientY - dragStart.y) / zoom;
    setPan({ x: pan.x + dx, y: pan.y + dy });
    setDragStart({ x: e.clientX, y: e.clientY });
  };

  const handleMouseUp = () => setIsDragging(false);

  const zoomIn = () => setZoom(Math.min(MAX_ZOOM, zoom + 0.1));
  const zoomOut = () => setZoom(Math.max(MIN_ZOOM, zoom - 0.1));

  return (
    <div className="flex h-full">
      {/* Sidebar */}
      <div className="w-64 p-2 border-r flex flex-col space-y-2">
        <button onClick={addTextLayer} className="p-2 border rounded bg-green-500 text-white">
          Add Text
        </button>
        <button
          onClick={() => addImageLayer(prompt("Enter image URL") || "")}
          className="p-2 border rounded bg-blue-500 text-white"
        >
          Add Image
        </button>
        {selectedLayer && (
          <>
            <div>
              <label>Bold/Italic/Underline</label>
              <div className="flex space-x-2">
                <button
                  onClick={() => updateLayer(selectedLayer.id, { bold: !selectedLayer.bold })}
                  className={`px-2 py-1 border rounded ${
                    selectedLayer.bold ? "bg-blue-600 text-white" : ""
                  }`}
                >
                  B
                </button>
                <button
                  onClick={() => updateLayer(selectedLayer.id, { italic: !selectedLayer.italic })}
                  className={`px-2 py-1 border rounded ${
                    selectedLayer.italic ? "bg-blue-600 text-white" : ""
                  }`}
                >
                  I
                </button>
                <button
                  onClick={() =>
                    updateLayer(selectedLayer.id, { underline: !selectedLayer.underline })
                  }
                  className={`px-2 py-1 border rounded ${
                    selectedLayer.underline ? "bg-blue-600 text-white" : ""
                  }`}
                >
                  U
                </button>
              </div>
            </div>
            <div>
              <label>Font Size</label>
              <input
                type="number"
                value={selectedLayer.fontSize}
                onChange={(e) => updateLayer(selectedLayer.id, { fontSize: +e.target.value })}
                className="border p-1 w-full"
              />
            </div>
            <div>
              <label>Line Height</label>
              <input
                type="number"
                step={0.1}
                value={selectedLayer.lineHeight}
                onChange={(e) =>
                  updateLayer(selectedLayer.id, { lineHeight: +e.target.value })
                }
                className="border p-1 w-full"
              />
            </div>
            <div>
              <label>Letter Spacing</label>
              <input
                type="number"
                step={0.1}
                value={selectedLayer.letterSpacing}
                onChange={(e) =>
                  updateLayer(selectedLayer.id, { letterSpacing: +e.target.value })
                }
                className="border p-1 w-full"
              />
            </div>
            <div>
              <label>Text Transform</label>
              <select
                value={selectedLayer.textTransform}
                onChange={(e) =>
                  updateLayer(selectedLayer.id, {
                    textTransform: e.target.value as LayerType["textTransform"],
                  })
                }
                className="border p-1 w-full"
              >
                <option value="none">None</option>
                <option value="uppercase">Uppercase</option>
                <option value="lowercase">Lowercase</option>
                <option value="capitalize">Capitalize</option>
              </select>
            </div>
          </>
        )}
        <div className="flex space-x-2">
          <button onClick={zoomIn} className="p-2 border rounded bg-gray-300">
            Zoom +
          </button>
          <button onClick={zoomOut} className="p-2 border rounded bg-gray-300">
            Zoom -
          </button>
        </div>
      </div>
      {/* Canvas */}
      <div
        className="flex-1 border relative"
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
      >
        <canvas ref={canvasRef} width={1200} height={800} className="w-full h-full" />
      </div>
    </div>
  );
};
