import React, { useRef, useState, useEffect } from "react";
import opentype from "opentype.js";

interface Layer {
  id: string;
  type: "text" | "image";
  text?: string;
  imageSrc?: string;
  x: number;
  y: number;
  fontSize?: number;
  fontFamily?: string;
  color?: string;
  bold?: boolean;
  italic?: boolean;
  underline?: boolean;
  letterSpacing?: number;
  lineHeight?: number;
  transform?: "uppercase" | "lowercase" | "capitalize";
  selected?: boolean;
  shadow?: string;
  outline?: string;
}

interface Keyframe {
  frame: number;
  layers: Layer[];
}

const CanvasEditor: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [layers, setLayers] = useState<Layer[]>([]);
  const [selectedLayers, setSelectedLayers] = useState<string[]>([]);
  const [draggingLayerId, setDraggingLayerId] = useState<string | null>(null);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [fps, setFps] = useState(30);
  const [playing, setPlaying] = useState(false);
  const [currentFrame, setCurrentFrame] = useState(0);
  const [keyframes, setKeyframes] = useState<Keyframe[]>([]);
  const [undoStack, setUndoStack] = useState<Layer[][]>([]);
  const [redoStack, setRedoStack] = useState<Layer[][]>([]);
  const [fonts, setFonts] = useState<FontFace[]>([]);

  useEffect(() => {
    const interval = playing
      ? setInterval(() => setCurrentFrame((prev) => prev + 1), 1000 / fps)
      : undefined;
    return () => interval && clearInterval(interval);
  }, [playing, fps]);

  useEffect(() => {
    renderCanvas();
  }, [layers]);

  const pushUndo = () => {
    setUndoStack((prev) => [...prev, JSON.parse(JSON.stringify(layers))]);
    setRedoStack([]);
  };

  const undo = () => {
    if (undoStack.length === 0) return;
    const prev = undoStack[undoStack.length - 1];
    setUndoStack((prevStack) => prevStack.slice(0, -1));
    setRedoStack((prev) => [...prev, JSON.parse(JSON.stringify(layers))]);
    setLayers(prev);
  };

  const redo = () => {
    if (redoStack.length === 0) return;
    const next = redoStack[redoStack.length - 1];
    setRedoStack((prev) => prev.slice(0, -1));
    setUndoStack((prev) => [...prev, JSON.parse(JSON.stringify(layers))]);
    setLayers(next);
  };

  const addLayer = (type: "text" | "image") => {
    pushUndo();
    const newLayer: Layer = {
      id: Date.now().toString(),
      type,
      x: 50,
      y: 50,
      text: type === "text" ? "New Text" : undefined,
      fontSize: 32,
      fontFamily: "Arial",
      color: "#000000",
      bold: false,
      italic: false,
      underline: false,
      letterSpacing: 0,
      lineHeight: 1.2,
      transform: "none",
    };
    setLayers((prev) => [...prev, newLayer]);
    setSelectedLayers([newLayer.id]);
  };

  const deleteSelectedLayers = () => {
    pushUndo();
    setLayers((prev) => prev.filter((l) => !selectedLayers.includes(l.id)));
    setSelectedLayers([]);
  };

  const updateLayer = (id: string, updates: Partial<Layer>) => {
    pushUndo();
    setLayers((prev) =>
      prev.map((l) => (l.id === id ? { ...l, ...updates } : l))
    );
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    const rect = canvasRef.current!.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;
    let clickedLayer: Layer | null = null;
    for (let i = layers.length - 1; i >= 0; i--) {
      const l = layers[i];
      const width = l.type === "text" ? getTextWidth(l) : 100;
      const height = l.type === "text" ? getTextHeight(l) : 100;
      if (
        mouseX >= l.x &&
        mouseX <= l.x + width &&
        mouseY >= l.y - height &&
        mouseY <= l.y
      ) {
        clickedLayer = l;
        break;
      }
    }
    if (clickedLayer) {
      if (e.shiftKey || e.ctrlKey) {
        // Multi-select
        setSelectedLayers((prev) =>
          prev.includes(clickedLayer!.id)
            ? prev.filter((id) => id !== clickedLayer!.id)
            : [...prev, clickedLayer!.id]
        );
      } else {
        setSelectedLayers([clickedLayer.id]);
      }
      setDraggingLayerId(clickedLayer.id);
      setOffset({
        x: mouseX - clickedLayer.x,
        y: mouseY - clickedLayer.y,
      });
    } else {
      setSelectedLayers([]);
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!draggingLayerId) return;
    const rect = canvasRef.current!.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;
    const dx = mouseX - offset.x;
    const dy = mouseY - offset.y;
    pushUndo();
    setLayers((prev) =>
      prev.map((l) =>
        selectedLayers.includes(l.id) ? { ...l, x: dx, y: dy } : l
      )
    );
  };

  const handleMouseUp = () => {
    setDraggingLayerId(null);
  };

  const getTextWidth = (layer: Layer) => {
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d")!;
    ctx.font = `${layer.bold ? "bold" : ""} ${layer.italic ? "italic" : ""} ${
      layer.fontSize
    }px ${layer.fontFamily}`;
    return ctx.measureText(layer.text || "").width + (layer.letterSpacing || 0);
  };

  const getTextHeight = (layer: Layer) => {
    return (layer.fontSize || 32) * (layer.lineHeight || 1.2);
  };

  const renderCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d")!;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    layers.forEach((l) => {
      if (l.type === "text" && l.text) {
        ctx.save();
        ctx.font = `${l.bold ? "bold" : ""} ${l.italic ? "italic" : ""} ${
          l.fontSize
        }px ${l.fontFamily}`;
        ctx.fillStyle = l.color || "#000";
        ctx.textBaseline = "top";
        ctx.textAlign = "left";
        ctx.lineWidth = 1;
        if (l.shadow) ctx.shadowColor = l.shadow;
        if (l.outline) {
          ctx.strokeStyle = l.outline;
          ctx.strokeText(l.text, l.x, l.y);
        }
        const lines = l.text.split("\n");
        lines.forEach((line, idx) => {
          ctx.fillText(
            applyTransform(line, l.transform),
            l.x,
            l.y + idx * ((l.fontSize || 32) * (l.lineHeight || 1.2))
          );
          if (l.underline) {
            const width = ctx.measureText(line).width;
            ctx.beginPath();
            ctx.moveTo(l.x, l.y + idx * ((l.fontSize || 32) * (l.lineHeight || 1.2)) + (l.fontSize || 32));
            ctx.lineTo(l.x + width, l.y + idx * ((l.fontSize || 32) * (l.lineHeight || 1.2)) + (l.fontSize || 32));
            ctx.stroke();
          }
        });
        ctx.restore();
        if (selectedLayers.includes(l.id)) {
          ctx.save();
          ctx.strokeStyle = "blue";
          ctx.lineWidth = 2;
          ctx.strokeRect(l.x - 2, l.y - 2, getTextWidth(l) + 4, getTextHeight(l) + 4);
          ctx.restore();
        }
      } else if (l.type === "image" && l.imageSrc) {
        const img = new Image();
        img.src = l.imageSrc;
        img.onload = () => ctx.drawImage(img, l.x, l.y, 100, 100);
      }
    });
  };

  const applyTransform = (text: string, transform?: string) => {
    switch (transform) {
      case "uppercase":
        return text.toUpperCase();
      case "lowercase":
        return text.toLowerCase();
      case "capitalize":
        return text.replace(/\b\w/g, (c) => c.toUpperCase());
      default:
        return text;
    }
  };

  const handleFontUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const font = new FontFace(file.name.split(".")[0], `url(${reader.result})`);
      font.load().then((loaded) => {
        document.fonts.add(loaded);
        setFonts((prev) => [...prev, loaded]);
      });
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="flex flex-col space-y-2">
      <div className="flex space-x-2">
        <button onClick={() => addLayer("text")}>Add Text Layer</button>
        <button onClick={() => addLayer("image")}>Add Image Layer</button>
        <button onClick={deleteSelectedLayers}>Delete Selected</button>
        <button onClick={undo}>Undo</button>
        <button onClick={redo}>Redo</button>
        <input type="file" accept=".ttf,.otf,.woff,.woff2" onChange={handleFontUpload} />
      </div>
      <div className="flex space-x-2">
        <button onClick={() => setPlaying((prev) => !prev)}>{playing ? "Pause" : "Play"}</button>
        <label>FPS:</label>
        <input type="number" value={fps} onChange={(e) => setFps(parseInt(e.target.value))} />
        <label>Frame:</label>
        <input type="number" value={currentFrame} onChange={(e) => setCurrentFrame(parseInt(e.target.value))} />
        <button onClick={() => setKeyframes((prev) => [...prev, { frame: currentFrame, layers: JSON.parse(JSON.stringify(layers)) }])}>Add Keyframe</button>
      </div>
      <canvas
        ref={canvasRef}
        width={800}
        height={600}
        className="border"
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
      />
      <div className="flex flex-col space-y-1">
        {layers.map((layer) => (
          <div key={layer.id} className={`p-1 border ${selectedLayers.includes(layer.id) ? "bg-blue-100" : ""}`}>
            <span>{layer.type === "text" ? layer.text : "Image Layer"}</span>
            <div className="flex space-x-1">
              <button onClick={() => updateLayer(layer.id, { bold: !layer.bold })} className={layer.bold ? "font-bold" : ""}>B</button>
              <button onClick={() => updateLayer(layer.id, { italic: !layer.italic })} className={layer.italic ? "italic" : ""}>I</button>
              <button onClick={() => updateLayer(layer.id, { underline: !layer.underline })} className={layer.underline ? "underline" : ""}>U</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default CanvasEditor;
