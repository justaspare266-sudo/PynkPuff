import React, { useRef, useState, useEffect } from 'react';
import opentype from 'opentype.js';

type TextLayer = {
  id: string;
  type: 'text';
  text: string;
  fontFamily: string;
  fontSize: number;
  bold: boolean;
  italic: boolean;
  underline: boolean;
  strikethrough: boolean;
  lineHeight: number;
  letterSpacing: number;
  wordSpacing: number;
  paragraphSpacing: number;
  textAlign: CanvasTextAlign;
  textTransform: 'none' | 'uppercase' | 'lowercase' | 'capitalize';
  color: string;
  shadow?: { offsetX: number; offsetY: number; blur: number; color: string };
  stroke?: { width: number; color: string };
  x: number;
  y: number;
  rotation: number;
  scale: number;
  width?: number;
  height?: number;
};

type ImageLayer = {
  id: string;
  type: 'image';
  src: string;
  x: number;
  y: number;
  width: number;
  height: number;
  rotation: number;
  scale: number;
};

type Layer = TextLayer | ImageLayer;

type Keyframe = {
  frame: number;
  layers: Layer[];
};

const CanvasEditor: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [layers, setLayers] = useState<Layer[]>([]);
  const [selectedLayerId, setSelectedLayerId] = useState<string | null>(null);
  const [frames, setFrames] = useState<Keyframe[]>([]);
  const [currentFrame, setCurrentFrame] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [fps, setFps] = useState(30);
  const [loadedFonts, setLoadedFonts] = useState<{ [key: string]: FontFace }>({});
  const [history, setHistory] = useState<Layer[][]>([]);
  const [redoStack, setRedoStack] = useState<Layer[][]>([]);

  const selectedLayer = layers.find((l) => l.id === selectedLayerId) as TextLayer;

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    layers.forEach((layer) => {
      ctx.save();
      ctx.translate(layer.x, layer.y);
      ctx.rotate((layer.rotation * Math.PI) / 180);
      ctx.scale(layer.scale, layer.scale);

      if (layer.type === 'text') {
        const textLayer = layer as TextLayer;
        let displayText = textLayer.text;
        switch (textLayer.textTransform) {
          case 'uppercase':
            displayText = displayText.toUpperCase();
            break;
          case 'lowercase':
            displayText = displayText.toLowerCase();
            break;
          case 'capitalize':
            displayText = displayText.replace(/\b\w/g, (c) => c.toUpperCase());
            break;
        }

        ctx.font = `${textLayer.bold ? 'bold' : ''} ${
          textLayer.italic ? 'italic' : ''
        } ${textLayer.fontSize}px ${textLayer.fontFamily}`;
        ctx.fillStyle = textLayer.color;
        ctx.textAlign = textLayer.textAlign;
        ctx.textBaseline = 'top';

        if (textLayer.shadow) {
          ctx.shadowOffsetX = textLayer.shadow.offsetX;
          ctx.shadowOffsetY = textLayer.shadow.offsetY;
          ctx.shadowBlur = textLayer.shadow.blur;
          ctx.shadowColor = textLayer.shadow.color;
        }

        if (textLayer.stroke) {
          ctx.lineWidth = textLayer.stroke.width;
          ctx.strokeStyle = textLayer.stroke.color;
        }

        const lines = displayText.split('\n');
        let y = 0;
        lines.forEach((line, i) => {
          const lineY = y + i * textLayer.lineHeight;
          if (textLayer.stroke) ctx.strokeText(line, 0, lineY);
          ctx.fillText(line, 0, lineY);

          if (textLayer.underline) {
            const metrics = ctx.measureText(line);
            const underlineOffset = textLayer.fontSize * 0.1;
            ctx.beginPath();
            ctx.moveTo(-metrics.actualBoundingBoxLeft, lineY + textLayer.fontSize + underlineOffset);
            ctx.lineTo(metrics.width - metrics.actualBoundingBoxLeft, lineY + textLayer.fontSize + underlineOffset);
            ctx.lineWidth = 2;
            ctx.strokeStyle = textLayer.color;
            ctx.stroke();
          }

          if (textLayer.strikethrough) {
            const metrics = ctx.measureText(line);
            const strikeOffset = textLayer.fontSize * 0.3;
            ctx.beginPath();
            ctx.moveTo(-metrics.actualBoundingBoxLeft, lineY + strikeOffset);
            ctx.lineTo(metrics.width - metrics.actualBoundingBoxLeft, lineY + strikeOffset);
            ctx.lineWidth = 2;
            ctx.strokeStyle = textLayer.color;
            ctx.stroke();
          }
        });
      }

      if (layer.type === 'image') {
        const img = new Image();
        img.src = (layer as ImageLayer).src;
        img.onload = () => {
          ctx.drawImage(img, 0, 0, (layer as ImageLayer).width, (layer as ImageLayer).height);
        };
      }

      ctx.restore();
    });
  }, [layers]);

  useEffect(() => {
    let interval: NodeJS.Timer;
    if (playing) {
      interval = setInterval(() => {
        setCurrentFrame((prev) => (prev + 1) % frames.length);
      }, 1000 / fps);
    }
    return () => clearInterval(interval);
  }, [playing, fps, frames.length]);

  const addTextLayer = () => {
    const id = Date.now().toString();
    const newLayer: TextLayer = {
      id,
      type: 'text',
      text: 'New Text',
      fontFamily: 'Arial',
      fontSize: 40,
      bold: false,
      italic: false,
      underline: false,
      strikethrough: false,
      lineHeight: 50,
      letterSpacing: 0,
      wordSpacing: 0,
      paragraphSpacing: 0,
      textAlign: 'left',
      textTransform: 'none',
      color: '#000000',
      x: 100,
      y: 100,
      rotation: 0,
      scale: 1,
    };
    saveHistory();
    setLayers([...layers, newLayer]);
    setSelectedLayerId(id);
  };

  const addImageLayer = (src: string) => {
    const id = Date.now().toString();
    const newLayer: ImageLayer = {
      id,
      type: 'image',
      src,
      x: 100,
      y: 100,
      width: 200,
      height: 200,
      rotation: 0,
      scale: 1,
    };
    saveHistory();
    setLayers([...layers, newLayer]);
    setSelectedLayerId(id);
  };

  const deleteLayer = (id: string) => {
    saveHistory();
    setLayers(layers.filter((l) => l.id !== id));
    if (selectedLayerId === id) setSelectedLayerId(null);
  };

  const updateLayer = (id: string, updatedProps: Partial<Layer>) => {
    saveHistory();
    setLayers(
      layers.map((l) => (l.id === id ? { ...l, ...updatedProps } : l))
    );
  };

  const saveHistory = () => {
    setHistory([...history, JSON.parse(JSON.stringify(layers))]);
    setRedoStack([]);
  };

  const undo = () => {
    if (history.length === 0) return;
    const prev = history[history.length - 1];
    setRedoStack([JSON.parse(JSON.stringify(layers)), ...redoStack]);
    setLayers(prev);
    setHistory(history.slice(0, history.length - 1));
  };

  const redo = () => {
    if (redoStack.length === 0) return;
    const next = redoStack[0];
    setHistory([...history, JSON.parse(JSON.stringify(layers))]);
    setLayers(next);
    setRedoStack(redoStack.slice(1));
  };

  const handleFontUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = async () => {
      const font = new FontFace(file.name, `url(${reader.result})`);
      await font.load();
      (document as any).fonts.add(font);
      setLoadedFonts({ ...loadedFonts, [file.name]: font });
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="flex flex-col p-4 space-y-4">
      <div className="flex space-x-2">
        <button onClick={addTextLayer} className="px-2 py-1 border rounded bg-green-500 text-white">Add Text</button>
        <input type="file" accept=".ttf,.otf,.woff,.woff2" onChange={handleFontUpload} className="px-2 py-1 border rounded"/>
        <button onClick={undo} className="px-2 py-1 border rounded bg-yellow-300">Undo</button>
        <button onClick={redo} className="px-2 py-1 border rounded bg-yellow-300">Redo</button>
      </div>

      {selectedLayer && selectedLayer.type === 'text' && (
        <div className="flex flex-col space-y-2 border p-2 rounded">
          <label>Font Family:</label>
          <input
            type="text"
            value={selectedLayer.fontFamily}
            onChange={(e) => updateLayer(selectedLayer.id, { fontFamily: e.target.value })}
            className="border rounded px-2 py-1"
          />

          <label>Font Size:</label>
          <input
            type="number"
            value={selectedLayer.fontSize}
            onChange={(e) => updateLayer(selectedLayer.id, { fontSize: parseInt(e.target.value) })}
            className="border rounded px-2 py-1"
          />

          <label>Bold/Italic/Underline/Strikethrough</label>
          <div className="flex space-x-2">
            <button onClick={()=>updateLayer(selectedLayer.id,{bold:!selectedLayer.bold})} className={`px-2 py-1 border rounded ${selectedLayer.bold?'bg-blue-600 text-white':''}`}>B</button>
            <button onClick={()=>updateLayer(selectedLayer.id,{italic:!selectedLayer.italic})} className={`px-2 py-1 border rounded ${selectedLayer.italic?'bg-blue-600 text-white':''}`}>I</button>
            <button onClick={()=>updateLayer(selectedLayer.id,{underline:!selectedLayer.underline})} className={`px-2 py-1 border rounded ${selectedLayer.underline?'bg-blue-600 text-white':''}`}>U</button>
            <button onClick={()=>updateLayer(selectedLayer.id,{strikethrough:!selectedLayer.strikethrough})} className={`px-2 py-1 border rounded ${selectedLayer.strikethrough?'bg-blue-600 text-white':''}`}>S</button>
          </div>

          <label>Text Align:</label>
          <select value={selectedLayer.textAlign} onChange={(e)=>updateLayer(selectedLayer.id,{textAlign: e.target.value as CanvasTextAlign})} className="border rounded px-2 py-1">
            <option value="left">Left</option>
            <option value="center">Center</option>
            <option value="right">Right</option>
            <option value="justify">Justify</option>
          </select>

          <label>Text Transform:</label>
          <select value={selectedLayer.textTransform} onChange={(e)=>updateLayer(selectedLayer.id,{textTransform: e.target.value as 'none'|'uppercase'|'lowercase'|'capitalize'})} className="border rounded px-2 py-1">
            <option value="none">None</option>
            <option value="uppercase">Uppercase</option>
            <option value="lowercase">Lowercase</option>
            <option value="capitalize">Capitalize</option>
          </select>

          <label>Letter Spacing:</label>
          <input type="number" value={selectedLayer.letterSpacing} onChange={e=>updateLayer(selectedLayer.id,{letterSpacing:parseInt(e.target.value)})} className="border rounded px-2 py-1"/>

          <label>Line Height:</label>
          <input type="number" value={selectedLayer.lineHeight} onChange={e=>updateLayer(selectedLayer.id,{lineHeight:parseInt(e.target.value)})} className="border rounded px-2 py-1"/>
        </div>
      )}

      <canvas ref={canvasRef} width={800} height={600} className="border border-gray-400"/>
    </div>
  );
};

export default CanvasEditor;
