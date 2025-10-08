'use client';

import React, { useRef, useState, useEffect, useCallback } from 'react';
import { useEditor } from '../contexts/EditorContext';
import { ToolPanel } from './ToolPanel';
import { Type, Play, Pause, RotateCw, Upload } from 'lucide-react';

// Bridge between BlackGlass Text Engine and our unified system
export function TextEngineIntegration() {
  const { state, actions } = useEditor();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // Text Engine state
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentFrame, setCurrentFrame] = useState(0);
  const [fps, setFps] = useState(60);
  const [loadedFonts, setLoadedFonts] = useState<string[]>([]);
  const [animationLayers, setAnimationLayers] = useState<any[]>([]);

  // Convert UnifiedShape to Text Engine Layer
  const convertToTextEngineLayer = useCallback((shape: any) => {
    return {
      id: shape.id,
      type: 'text',
      content: shape.text || 'New Text',
      x: shape.x,
      y: shape.y,
      width: shape.width,
      height: shape.height,
      rotation: shape.rotation || 0,
      scale: shape.scaleX || 1,
      opacity: shape.opacity || 1,
      visible: shape.visible !== false,
      fontSize: shape.fontSize || 16,
      fontFamily: shape.fontFamily || 'Arial',
      fontWeight: shape.fontWeight || 400,
      bold: shape.fontWeight >= 700,
      italic: shape.fontStyle === 'italic',
      underline: shape.textDecoration === 'underline',
      strikethrough: shape.textDecoration === 'line-through',
      letterSpacing: shape.letterSpacing || 0,
      lineHeight: shape.lineHeight || 1.2,
      textAlign: shape.align || 'left',
      color: shape.fill || '#000000',
      zIndex: shape.zIndex || 1,
      keyframes: {}, // Will be populated for animation
    };
  }, []);

  // Convert Text Engine Layer back to UnifiedShape
  const convertToUnifiedShape = useCallback((layer: any) => {
    return {
      id: layer.id,
      type: 'text' as const,
      x: layer.x,
      y: layer.y,
      width: layer.width || 200,
      height: layer.height || 50,
      visible: layer.visible !== false,
      locked: false,
      opacity: layer.opacity || 1,
      zIndex: layer.zIndex || 1,
      isSelected: false,
      isDragging: false,
      isResizing: false,
      isRotating: false,
      fill: layer.color || '#000000',
      stroke: '#000000',
      strokeWidth: 1,
      rotation: layer.rotation || 0,
      scaleX: layer.scale || 1,
      scaleY: layer.scale || 1,
      text: layer.content || 'New Text',
      fontSize: layer.fontSize || 16,
      fontFamily: layer.fontFamily || 'Arial',
      fontWeight: layer.fontWeight || 400,
      fontStyle: layer.italic ? 'italic' : 'normal',
      textDecoration: layer.underline ? 'underline' : layer.strikethrough ? 'line-through' : 'none',
      letterSpacing: layer.letterSpacing || 0,
      lineHeight: layer.lineHeight || 1.2,
      align: layer.textAlign || 'left',
      verticalAlign: 'top',
      wrap: 'word',
      ellipsis: false,
      padding: 0,
      direction: 'inherit',
      isCached: false,
      perfectDrawEnabled: true,
      listening: true,
      name: `Text ${layer.id}`,
      boundaryState: {
        isWithinBounds: true,
        violationType: null,
      },
    };
  }, []);

  // Sync text shapes from main editor to animation layers
  useEffect(() => {
    const textShapes = state.shapes.filter(shape => shape.type === 'text');
    const convertedLayers = textShapes.map(convertToTextEngineLayer);
    setAnimationLayers(convertedLayers);
  }, [state.shapes, convertToTextEngineLayer]);

  // Canvas rendering with animation support
  const renderCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Sort layers by zIndex
    const sortedLayers = [...animationLayers].sort((a, b) => (a.zIndex || 0) - (b.zIndex || 0));

    sortedLayers.forEach((layer) => {
      if (!layer.visible) return;

      ctx.save();
      ctx.translate(layer.x, layer.y);
      ctx.rotate((layer.rotation * Math.PI) / 180);
      ctx.scale(layer.scale, layer.scale);
      ctx.globalAlpha = layer.opacity;

      // Font setup
      const fontStyle = `${layer.italic ? "italic " : ""}${layer.bold ? "bold " : ""}${layer.fontWeight || 400} ${layer.fontSize || 16}px ${layer.fontFamily || "Arial"}`;
      ctx.font = fontStyle;
      ctx.fillStyle = layer.color || "#000";
      ctx.textBaseline = "top";
      ctx.textAlign = (layer.textAlign as CanvasTextAlign) || "left";

      // Process text
      const lines = (layer.content || "").split("\n");
      lines.forEach((line: string, lineIndex: number) => {
        const yPos = lineIndex * (layer.fontSize || 16) * (layer.lineHeight || 1.2);
        ctx.fillText(line, 0, yPos);
      });

      ctx.restore();
    });
  }, [animationLayers]);

  // Animation loop
  useEffect(() => {
    let animationFrame: number;
    const loop = () => {
      if (isPlaying) {
        setCurrentFrame(prev => prev + 1);
      }
      renderCanvas();
      animationFrame = requestAnimationFrame(loop);
    };
    loop();
    return () => cancelAnimationFrame(animationFrame);
  }, [renderCanvas, isPlaying]);

  // Font management
  const handleFontUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const font = new FontFace(file.name.split(".")[0], `url(${reader.result})`);
      font.load().then((loaded) => {
        (document as any).fonts.add(loaded);
        setLoadedFonts(prev => [...prev, file.name.split(".")[0]]);
      });
    };
    reader.readAsDataURL(file);
  };

  // Add keyframe for selected layer
  const addKeyframe = () => {
    const selectedShape = state.shapes.find(s => 
      state.tool.selectedShapeIds.includes(s.id) && s.type === 'text'
    );
    
    if (!selectedShape) {
      alert('Please select a text shape first');
      return;
    }

    // This would add a keyframe for animation
    console.log('Adding keyframe for:', selectedShape.id, 'at frame:', currentFrame);
  };

  // Export animation as video (placeholder)
  const exportAnimation = () => {
    console.log('Exporting animation...');
    // This would implement video export
  };

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-white mb-4">Text Engine Integration</h3>
      
      {/* Animation Canvas */}
      <div className="relative">
        <canvas
          ref={canvasRef}
          width={400}
          height={300}
          className="border border-gray-600 rounded bg-white"
        />
        
        {/* Animation Controls Overlay */}
        <div className="absolute bottom-2 left-2 p-2 bg-black bg-opacity-80 rounded flex items-center space-x-2">
          <button
            onClick={() => setIsPlaying(!isPlaying)}
            className="p-1 text-white hover:bg-gray-700 rounded"
          >
            {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
          </button>
          <span className="text-sm text-white">Frame: {currentFrame}</span>
          <span className="text-sm text-white">FPS: {fps}</span>
        </div>
      </div>

      {/* Animation Controls */}
      <div className="space-y-2">
        <div className="flex items-center space-x-2">
          <button
            onClick={addKeyframe}
            className="px-3 py-1 bg-purple-600 hover:bg-purple-700 rounded text-sm text-white"
          >
            Add Keyframe
          </button>
          <button
            onClick={exportAnimation}
            className="px-3 py-1 bg-green-600 hover:bg-green-700 rounded text-sm text-white"
          >
            Export Animation
          </button>
        </div>
        
        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className="block text-sm font-medium text-white mb-1">FPS</label>
            <input
              type="number"
              value={fps}
              onChange={(e) => setFps(Number(e.target.value))}
              className="w-full p-1 bg-gray-600 rounded text-sm"
              min="1"
              max="120"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-white mb-1">Frame</label>
            <input
              type="number"
              value={currentFrame}
              onChange={(e) => setCurrentFrame(Number(e.target.value))}
              className="w-full p-1 bg-gray-600 rounded text-sm"
              min="0"
            />
          </div>
        </div>
      </div>

      {/* Timeline Scrubber */}
      <div>
        <label className="block text-sm font-medium text-white mb-1">Timeline</label>
        <input
          type="range"
          min="0"
          max="120"
          value={currentFrame}
          onChange={(e) => setCurrentFrame(Number(e.target.value))}
          className="w-full"
        />
        <div className="flex justify-between text-xs text-gray-400">
          <span>0</span>
          <span>{currentFrame}</span>
          <span>120</span>
        </div>
      </div>

      {/* Font Management */}
      <div>
        <label className="block text-sm font-medium text-white mb-2">Font Upload</label>
        <input
          ref={fileInputRef}
          type="file"
          accept=".ttf,.otf,.woff,.woff2"
          onChange={handleFontUpload}
          className="w-full text-sm"
        />
        {loadedFonts.length > 0 && (
          <div className="mt-2">
            <p className="text-sm text-gray-300 mb-1">Loaded Fonts:</p>
            <div className="flex flex-wrap gap-1">
              {loadedFonts.map(font => (
                <span key={font} className="px-2 py-1 bg-gray-600 rounded text-xs">
                  {font}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Sync with Main Editor */}
      <div className="border-t border-gray-600 pt-4">
        <h4 className="text-sm font-medium text-white mb-2">Sync Status</h4>
        <div className="text-xs text-gray-300 space-y-1">
          <p>Text shapes in editor: {state.shapes.filter(s => s.type === 'text').length}</p>
          <p>Animation layers: {animationLayers.length}</p>
          <p>Selected text: {state.tool.selectedShapeIds.filter(id => 
            state.shapes.find(s => s.id === id)?.type === 'text'
          ).length}</p>
        </div>
      </div>
    </div>
  );
}

// Tool panel wrapper
export function TextEnginePanel() {
  const { state, actions } = useEditor();

  const openPanel = () => {
    actions.openToolPanel('text-engine', { x: 300, y: 100 });
  };

  return (
    <>
      <button
        onClick={openPanel}
        className="w-12 h-12 rounded-lg flex items-center justify-center transition-all text-gray-300 hover:bg-gray-700"
        title="Text Engine"
      >
        <Type className="w-5 h-5" />
      </button>

      {state.toolPanels['text-engine']?.isOpen && (
        <ToolPanel toolId="text-engine" title="Text Engine Integration">
          <TextEngineIntegration />
        </ToolPanel>
      )}
    </>
  );
}
