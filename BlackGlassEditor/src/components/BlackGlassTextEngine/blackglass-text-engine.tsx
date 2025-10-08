import React, { useRef, useState, useEffect, useCallback, useReducer } from "react";
import opentype from "opentype.js";

// Comprehensive Layer Interface - combining all features from all versions
interface Layer {
  id: string;
  type: "text" | "image" | "shape";
  content?: string; // text content or image src
  x: number;
  y: number;
  width?: number;
  height?: number;
  rotation?: number;
  scale?: number;
  opacity?: number;
  visible?: boolean;
  
  // Text properties
  fontSize?: number;
  fontFamily?: string;
  fontWeight?: number;
  bold?: boolean;
  italic?: boolean;
  underline?: boolean;
  underlineOffset?: number;
  strikethrough?: boolean;
  letterSpacing?: number;
  wordSpacing?: number;
  paragraphSpacing?: number;
  lineHeight?: number;
  textAlign?: "left" | "center" | "right" | "justify" | "start" | "end";
  textTransform?: "none" | "uppercase" | "lowercase" | "capitalize";
  color?: string;
  
  // Advanced typography
  shadow?: {
    offsetX: number;
    offsetY: number;
    blur: number;
    color: string;
  };
  stroke?: {
    width: number;
    color: string;
  };
  outline?: {
    width: number;
    color: string;
  };
  
  // Animation
  keyframes?: Record<number, Partial<Layer>>; // frame -> props
  zIndex?: number;
  
  // Image properties
  imageSrc?: string;
  image?: HTMLImageElement;
}

interface Keyframe {
  frame: number;
  layerId: string;
  properties: Partial<Layer>;
}

// History management with useReducer (from text-engine-12)
type Action =
  | { type: "ADD_LAYER"; payload: Layer }
  | { type: "UPDATE_LAYER"; id: string; payload: Partial<Layer> }
  | { type: "REMOVE_LAYER"; id: string }
  | { type: "UNDO" }
  | { type: "REDO" }
  | { type: "SET_LAYERS"; payload: Layer[] };

type HistoryState = {
  past: Layer[][];
  present: Layer[];
  future: Layer[][];
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
    case "SET_LAYERS": {
      return { past: [...state.past, state.present], present: action.payload, future: [] };
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
      return { past: [...state.past, state.present], present: next, future: next };
    }
    default:
      return state;
  }
}

// Helper functions
const generateId = () => crypto.randomUUID ? crypto.randomUUID() : Math.random().toString(36).substr(2, 9);

// Animation interpolation (from text-engine-07)
const interpolate = (layer: Layer, currentTime: number) => {
  if (!layer.keyframes || Object.keys(layer.keyframes).length === 0) {
    return { x: layer.x, y: layer.y, rotation: layer.rotation || 0, scale: layer.scale || 1, opacity: layer.opacity || 1 };
  }
  
  const frames = Object.keys(layer.keyframes)
    .map(Number)
    .sort((a, b) => a - b);
  
  let prevFrame = frames[0];
  let nextFrame = frames[frames.length - 1];
  
  for (let i = 0; i < frames.length - 1; i++) {
    if (currentTime >= frames[i] && currentTime <= frames[i + 1]) {
      prevFrame = frames[i];
      nextFrame = frames[i + 1];
      break;
    }
  }
  
  const progress = (currentTime - prevFrame) / (nextFrame - prevFrame || 1);
  const prevProps = layer.keyframes[prevFrame] || {};
  const nextProps = layer.keyframes[nextFrame] || {};
  
  return {
    x: (prevProps.x || layer.x) + ((nextProps.x || layer.x) - (prevProps.x || layer.x)) * progress,
    y: (prevProps.y || layer.y) + ((nextProps.y || layer.y) - (prevProps.y || layer.y)) * progress,
    rotation: (prevProps.rotation || layer.rotation || 0) + ((nextProps.rotation || layer.rotation || 0) - (prevProps.rotation || layer.rotation || 0)) * progress,
    scale: (prevProps.scale || layer.scale || 1) + ((nextProps.scale || layer.scale || 1) - (prevProps.scale || layer.scale || 1)) * progress,
    opacity: (prevProps.opacity || layer.opacity || 1) + ((nextProps.opacity || layer.opacity || 1) - (prevProps.opacity || layer.opacity || 1)) * progress,
  };
};

const BlackGlassTextEngine: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);
  
  // State management
  const [selectedLayerId, setSelectedLayerId] = useState<string | null>(null);
  const [selectedLayers, setSelectedLayers] = useState<string[]>([]);
  const [draggingLayerId, setDraggingLayerId] = useState<string | null>(null);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [history, dispatch] = useReducer(historyReducer, initialState);
  const [fps, setFps] = useState(60);
  const [frame, setFrame] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [loadedFonts, setLoadedFonts] = useState<string[]>([]);
  const [keyframes, setKeyframes] = useState<Keyframe[]>([]);
  
  const layers = history.present;
  const selectedLayer = layers.find((l) => l.id === selectedLayerId) || null;

  // DPI scaling (from text-engine-05)
  const setupCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();
    
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    canvas.style.width = rect.width + 'px';
    canvas.style.height = rect.height + 'px';
    
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.scale(dpr, dpr);
    }
  }, []);

  // Text measurement helpers
  const getTextWidth = (layer: Layer) => {
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    if (!ctx) return 0;
    
    const fontStyle = `${layer.italic ? "italic " : ""}${layer.bold ? "bold " : ""}${layer.fontWeight || 400} ${layer.fontSize || 16}px ${layer.fontFamily || "Arial"}`;
    ctx.font = fontStyle;
    return ctx.measureText(layer.content || "").width + (layer.letterSpacing || 0) * ((layer.content || "").length - 1);
  };

  const getTextHeight = (layer: Layer) => {
    return (layer.fontSize || 16) * (layer.lineHeight || 1.2);
  };

  // Apply text transforms
  const applyTextTransform = (text: string, transform?: string) => {
    switch (transform) {
      case "uppercase": return text.toUpperCase();
      case "lowercase": return text.toLowerCase();
      case "capitalize": return text.replace(/\b\w/g, (c) => c.toUpperCase());
      default: return text;
    }
  };

  // Canvas rendering with ALL features
  const renderCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Sort layers by zIndex
    const sortedLayers = [...layers].sort((a, b) => (a.zIndex || 0) - (b.zIndex || 0));

    sortedLayers.forEach((layer) => {
      if (!layer.visible) return;

      // Apply animation interpolation
      const anim = interpolate(layer, currentTime);
      
      ctx.save();
      ctx.translate(anim.x, anim.y);
      ctx.rotate((anim.rotation * Math.PI) / 180);
      ctx.scale(anim.scale, anim.scale);
      ctx.globalAlpha = anim.opacity;

      if (layer.type === "text" && layer.content) {
        // Font setup
        const fontStyle = `${layer.italic ? "italic " : ""}${layer.bold ? "bold " : ""}${layer.fontWeight || 400} ${layer.fontSize || 16}px ${layer.fontFamily || "Arial"}`;
        ctx.font = fontStyle;
        ctx.fillStyle = layer.color || "#000";
        ctx.textBaseline = "top";
        ctx.textAlign = (layer.textAlign as CanvasTextAlign) || "left";

        // Apply shadows
        if (layer.shadow) {
          ctx.shadowOffsetX = layer.shadow.offsetX;
          ctx.shadowOffsetY = layer.shadow.offsetY;
          ctx.shadowBlur = layer.shadow.blur;
          ctx.shadowColor = layer.shadow.color;
        }

        // Apply stroke/outline
        if (layer.stroke) {
          ctx.lineWidth = layer.stroke.width;
          ctx.strokeStyle = layer.stroke.color;
        }

        // Process text with transforms
        const displayText = applyTextTransform(layer.content, layer.textTransform);
        const lines = displayText.split("\n");

        lines.forEach((line, lineIndex) => {
          const yPos = lineIndex * (layer.fontSize || 16) * (layer.lineHeight || 1.2);
          
          // Draw stroke first if present
          if (layer.stroke) {
            ctx.strokeText(line, 0, yPos);
          }
          
          // Draw fill text
          ctx.fillText(line, 0, yPos);

          // Draw underline
          if (layer.underline) {
            const textWidth = ctx.measureText(line).width;
            const underlineY = yPos + (layer.fontSize || 16) + (layer.underlineOffset || 2);
            ctx.beginPath();
            ctx.moveTo(0, underlineY);
            ctx.lineTo(textWidth, underlineY);
            ctx.strokeStyle = layer.color || "#000";
            ctx.lineWidth = 1;
            ctx.stroke();
          }

          // Draw strikethrough
          if (layer.strikethrough) {
            const textWidth = ctx.measureText(line).width;
            const strikeY = yPos + (layer.fontSize || 16) / 2;
            ctx.beginPath();
            ctx.moveTo(0, strikeY);
            ctx.lineTo(textWidth, strikeY);
            ctx.strokeStyle = layer.color || "#000";
            ctx.lineWidth = 1;
            ctx.stroke();
          }
        });
      }

      if (layer.type === "image" && layer.imageSrc) {
        const img = new Image();
        img.src = layer.imageSrc;
        img.onload = () => {
          ctx.drawImage(img, 0, 0, layer.width || img.width, layer.height || img.height);
        };
      }

      ctx.restore();

      // Draw selection outline
      if (selectedLayers.includes(layer.id)) {
        ctx.save();
        ctx.strokeStyle = "blue";
        ctx.lineWidth = 2;
        ctx.setTransform(1, 0, 0, 1, 0, 0); // Reset transform for selection box
        if (layer.type === "text") {
          ctx.strokeRect(layer.x - 2, layer.y - 2, getTextWidth(layer) + 4, getTextHeight(layer) + 4);
        } else {
          ctx.strokeRect(layer.x - 2, layer.y - 2, (layer.width || 100) + 4, (layer.height || 100) + 4);
        }
        ctx.restore();
      }
    });
  }, [layers, currentTime, selectedLayers]);

  // Animation loop
  useEffect(() => {
    let animationFrame: number;
    const loop = () => {
      if (isPlaying) {
        setCurrentTime((t) => t + 1 / fps);
        setFrame((f) => f + 1);
      }
      renderCanvas();
      animationFrame = requestAnimationFrame(loop);
    };
    loop();
    return () => cancelAnimationFrame(animationFrame);
  }, [renderCanvas, isPlaying, fps]);

  // Setup canvas on mount
  useEffect(() => {
    setupCanvas();
    window.addEventListener('resize', setupCanvas);
    return () => window.removeEventListener('resize', setupCanvas);
  }, [setupCanvas]);

  // Layer management
  const addLayer = (type: "text" | "image" | "shape") => {
    const newLayer: Layer = {
      id: generateId(),
      type,
      x: 50,
      y: 50,
      scale: 1,
      rotation: 0,
      opacity: 1,
      visible: true,
      fontSize: 32,
      fontFamily: "Arial",
      fontWeight: 400,
      bold: false,
      italic: false,
      underline: false,
      underlineOffset: 2,
      strikethrough: false,
      letterSpacing: 0,
      wordSpacing: 0,
      paragraphSpacing: 0,
      lineHeight: 1.2,
      textAlign: "left",
      textTransform: "none",
      color: "#000000",
      content: type === "text" ? "New Text" : undefined,
      keyframes: {},
      zIndex: layers.length,
    };
    dispatch({ type: "ADD_LAYER", payload: newLayer });
    setSelectedLayerId(newLayer.id);
  };

  const updateLayer = (id: string, updates: Partial<Layer>) => {
    dispatch({ type: "UPDATE_LAYER", id, payload: updates });
  };

  const deleteLayer = (id: string) => {
    dispatch({ type: "REMOVE_LAYER", id });
    if (selectedLayerId === id) setSelectedLayerId(null);
  };

  const deleteSelectedLayers = () => {
    selectedLayers.forEach(id => deleteLayer(id));
    setSelectedLayers([]);
  };

  // Mouse interactions
  const handleMouseDown = (e: React.MouseEvent) => {
    const rect = canvasRef.current!.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;
    let clickedLayer: Layer | null = null;

    for (let i = layers.length - 1; i >= 0; i--) {
      const l = layers[i];
      const width = l.type === "text" ? getTextWidth(l) : l.width || 100;
      const height = l.type === "text" ? getTextHeight(l) : l.height || 100;
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
        setSelectedLayerId(clickedLayer.id);
      }
      setDraggingLayerId(clickedLayer.id);
      setOffset({
        x: mouseX - clickedLayer.x,
        y: mouseY - clickedLayer.y,
      });
    } else {
      setSelectedLayers([]);
      setSelectedLayerId(null);
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!draggingLayerId) return;
    const rect = canvasRef.current!.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;
    const dx = mouseX - offset.x;
    const dy = mouseY - offset.y;

    selectedLayers.forEach(layerId => {
      updateLayer(layerId, { x: dx, y: dy });
    });
  };

  const handleMouseUp = () => {
    setDraggingLayerId(null);
  };

  // Font management
  const handleFontUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const font = new FontFace(file.name.split(".")[0], `url(${reader.result})`);
      font.load().then((loaded) => {
        (document as any).fonts.add(loaded);
        setLoadedFonts((prev) => [...prev, file.name.split(".")[0]]);
      });
    };
    reader.readAsDataURL(file);
  };

  // Animation controls
  const addKeyframe = () => {
    if (!selectedLayer) return;
    const newKeyframe: Keyframe = {
      frame,
      layerId: selectedLayer.id,
      properties: { ...selectedLayer }
    };
    setKeyframes([...keyframes, newKeyframe]);
  };

  const togglePlayPause = () => {
    setIsPlaying(!isPlaying);
  };

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Left Panel - Controls */}
      <div className="w-80 p-4 bg-white border-r overflow-y-auto">
        <h2 className="text-xl font-bold mb-4">BlackGlass Text Engine</h2>
        
        {/* Layer Management */}
        <div className="mb-6">
          <h3 className="font-bold mb-2">Layers</h3>
          <div className="flex space-x-2 mb-2">
            <button onClick={() => addLayer("text")} className="px-3 py-1 bg-green-500 text-white rounded text-sm">
              Add Text
            </button>
            <button onClick={() => addLayer("image")} className="px-3 py-1 bg-blue-500 text-white rounded text-sm">
              Add Image
            </button>
            <button onClick={deleteSelectedLayers} className="px-3 py-1 bg-red-500 text-white rounded text-sm">
              Delete
            </button>
          </div>
          
          <div className="space-y-1">
            {layers.map((layer) => (
              <div
                key={layer.id}
                onClick={() => setSelectedLayerId(layer.id)}
                className={`p-2 border rounded cursor-pointer text-sm ${
                  selectedLayerId === layer.id ? "bg-blue-100 border-blue-300" : "bg-gray-50"
                }`}
              >
                {layer.type} - {layer.content?.substring(0, 20) || "Layer"}
              </div>
            ))}
          </div>
        </div>

        {/* Animation Controls */}
        <div className="mb-6">
          <h3 className="font-bold mb-2">Animation</h3>
          <div className="flex space-x-2 mb-2">
            <button onClick={togglePlayPause} className="px-2 py-1 bg-green-400 text-white rounded text-sm">
              {isPlaying ? "Pause" : "Play"}
            </button>
            <button onClick={addKeyframe} className="px-2 py-1 bg-purple-400 text-white rounded text-sm">
              Add Keyframe
            </button>
          </div>
          <div className="grid grid-cols-2 gap-2 mb-2">
            <div>
              <label className="block text-sm font-medium mb-1">FPS</label>
              <input
                type="number"
                value={fps}
                onChange={(e) => setFps(Number(e.target.value))}
                className="w-full border p-1 rounded text-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Frame</label>
              <input
                type="number"
                value={frame}
                onChange={(e) => setFrame(Number(e.target.value))}
                className="w-full border p-1 rounded text-sm"
                min="0"
              />
            </div>
          </div>
          
          {/* Timeline Scrubber */}
          <div className="space-y-1">
            <label className="block text-sm font-medium">Timeline</label>
            <input
              type="range"
              min="0"
              max="120"
              value={frame}
              onChange={(e) => setFrame(Number(e.target.value))}
              className="w-full"
            />
            <div className="flex justify-between text-xs text-gray-500">
              <span>0</span>
              <span>{frame}</span>
              <span>120</span>
            </div>
          </div>
        </div>

        {/* Layer Properties */}
        {selectedLayer && (
          <div className="space-y-4">
            <h3 className="font-bold">Properties</h3>
            
            {selectedLayer.type === "text" && (
              <>
                <div>
                  <label className="block text-sm font-medium mb-1">Text</label>
                  <textarea
                    value={selectedLayer.content || ""}
                    onChange={(e) => updateLayer(selectedLayer.id, { content: e.target.value })}
                    className="w-full border p-1 rounded text-sm"
                    rows={3}
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-sm font-medium mb-1">Font Size</label>
                    <input
                      type="number"
                      value={selectedLayer.fontSize || 16}
                      onChange={(e) => updateLayer(selectedLayer.id, { fontSize: Number(e.target.value) })}
                      className="w-full border p-1 rounded text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Font Family</label>
                    <input
                      type="text"
                      value={selectedLayer.fontFamily || "Arial"}
                      onChange={(e) => updateLayer(selectedLayer.id, { fontFamily: e.target.value })}
                      className="w-full border p-1 rounded text-sm"
                      list="fonts"
                    />
                    <datalist id="fonts">
                      {loadedFonts.map(f => <option key={f} value={f} />)}
                    </datalist>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Text Style</label>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => updateLayer(selectedLayer.id, { bold: !selectedLayer.bold })}
                      className={`px-2 py-1 border rounded text-sm ${selectedLayer.bold ? "bg-blue-600 text-white" : ""}`}
                    >
                      B
                    </button>
                    <button
                      onClick={() => updateLayer(selectedLayer.id, { italic: !selectedLayer.italic })}
                      className={`px-2 py-1 border rounded text-sm ${selectedLayer.italic ? "bg-blue-600 text-white" : ""}`}
                    >
                      I
                    </button>
                    <button
                      onClick={() => updateLayer(selectedLayer.id, { underline: !selectedLayer.underline })}
                      className={`px-2 py-1 border rounded text-sm ${selectedLayer.underline ? "bg-blue-600 text-white" : ""}`}
                    >
                      U
                    </button>
                    <button
                      onClick={() => updateLayer(selectedLayer.id, { strikethrough: !selectedLayer.strikethrough })}
                      className={`px-2 py-1 border rounded text-sm ${selectedLayer.strikethrough ? "bg-blue-600 text-white" : ""}`}
                    >
                      S
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Text Align</label>
                  <select
                    value={selectedLayer.textAlign || "left"}
                    onChange={(e) => updateLayer(selectedLayer.id, { textAlign: e.target.value as any })}
                    className="w-full border p-1 rounded text-sm"
                  >
                    <option value="left">Left</option>
                    <option value="center">Center</option>
                    <option value="right">Right</option>
                    <option value="justify">Justify</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Text Transform</label>
                  <select
                    value={selectedLayer.textTransform || "none"}
                    onChange={(e) => updateLayer(selectedLayer.id, { textTransform: e.target.value as any })}
                    className="w-full border p-1 rounded text-sm"
                  >
                    <option value="none">None</option>
                    <option value="uppercase">Uppercase</option>
                    <option value="lowercase">Lowercase</option>
                    <option value="capitalize">Capitalize</option>
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-sm font-medium mb-1">Letter Spacing</label>
                    <input
                      type="number"
                      value={selectedLayer.letterSpacing || 0}
                      onChange={(e) => updateLayer(selectedLayer.id, { letterSpacing: Number(e.target.value) })}
                      className="w-full border p-1 rounded text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Line Height</label>
                    <input
                      type="number"
                      step="0.1"
                      value={selectedLayer.lineHeight || 1.2}
                      onChange={(e) => updateLayer(selectedLayer.id, { lineHeight: Number(e.target.value) })}
                      className="w-full border p-1 rounded text-sm"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Color</label>
                  <input
                    type="color"
                    value={selectedLayer.color || "#000000"}
                    onChange={(e) => updateLayer(selectedLayer.id, { color: e.target.value })}
                    className="w-full border p-1 rounded"
                  />
                </div>
              </>
            )}

            {/* Transform Properties */}
            <div>
              <h4 className="font-medium mb-2">Transform</h4>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-sm font-medium mb-1">X</label>
                  <input
                    type="number"
                    value={selectedLayer.x}
                    onChange={(e) => updateLayer(selectedLayer.id, { x: Number(e.target.value) })}
                    className="w-full border p-1 rounded text-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Y</label>
                  <input
                    type="number"
                    value={selectedLayer.y}
                    onChange={(e) => updateLayer(selectedLayer.id, { y: Number(e.target.value) })}
                    className="w-full border p-1 rounded text-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Rotation</label>
                  <input
                    type="number"
                    value={selectedLayer.rotation || 0}
                    onChange={(e) => updateLayer(selectedLayer.id, { rotation: Number(e.target.value) })}
                    className="w-full border p-1 rounded text-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Scale</label>
                  <input
                    type="number"
                    step="0.1"
                    value={selectedLayer.scale || 1}
                    onChange={(e) => updateLayer(selectedLayer.id, { scale: Number(e.target.value) })}
                    className="w-full border p-1 rounded text-sm"
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* File Uploads */}
        <div className="mt-6 space-y-2">
          <h3 className="font-bold">Uploads</h3>
          <input
            ref={fileInputRef}
            type="file"
            accept=".ttf,.otf,.woff,.woff2"
            onChange={handleFontUpload}
            className="w-full text-sm"
          />
        </div>

        {/* Undo/Redo */}
        <div className="mt-6 flex space-x-2">
          <button onClick={() => dispatch({ type: "UNDO" })} className="px-3 py-1 bg-gray-500 text-white rounded text-sm">
            Undo
          </button>
          <button onClick={() => dispatch({ type: "REDO" })} className="px-3 py-1 bg-gray-500 text-white rounded text-sm">
            Redo
          </button>
        </div>
      </div>

      {/* Right Panel - Canvas */}
      <div className="flex-1 relative p-4">
        <canvas
          ref={canvasRef}
          width={800}
          height={600}
          className="border border-gray-300 bg-white cursor-pointer"
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
        />
        
        <div className="absolute bottom-2 left-2 p-2 bg-white bg-opacity-80 rounded flex items-center space-x-2">
          <span className="text-sm">Frame: {frame}</span>
          <span className="text-sm">FPS: {fps}</span>
        </div>
      </div>
    </div>
  );
};

export default BlackGlassTextEngine;
