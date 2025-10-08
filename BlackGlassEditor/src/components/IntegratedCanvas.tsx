'use client';

import React, { useRef, useState, useCallback } from 'react';
import { Stage, Layer, Rect, Circle, Text, Transformer, Line, Star, RegularPolygon } from 'react-konva';
import Konva from 'konva';
import DrawingShapeTool from './DrawingShapeTool';

interface Shape {
  id: string;
  type: 'select' | 'rect' | 'circle' | 'triangle' | 'star' | 'hexagon' | 'pentagon' | 'arrow' | 'heart' | 'line' | 'text';
  x: number;
  y: number;
  width: number;
  height: number;
  fill: string;
  stroke: string;
  strokeWidth: number;
  opacity: number;
  rotation: number;
  scaleX: number;
  scaleY: number;
  // Shape-specific properties
  radius?: number;
  numPoints?: number;
  innerRadius?: number;
  outerRadius?: number;
  sides?: number;
  points?: number[];
  text?: string;
  fontSize?: number;
  fontFamily?: string;
}

export function IntegratedCanvas() {
  const stageRef = useRef<Konva.Stage>(null);
  const transformerRef = useRef<Konva.Transformer>(null);
  const [shapes, setShapes] = useState<Shape[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [tool, setTool] = useState<string>('select');
  const [isDrawing, setIsDrawing] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [showToolPanel, setShowToolPanel] = useState(true);
  
  // Style state
  const [currentStyle, setCurrentStyle] = useState({
    fillColor: '#ff6b9d',
    strokeColor: '#000000',
    strokeWidth: 2,
    opacity: 1,
    fontSize: 16,
    fontFamily: 'Arial'
  });

  const handleToolSelect = useCallback((selectedTool: string) => {
    setTool(selectedTool);
    setSelectedId(null);
    transformerRef.current?.nodes([]);
  }, []);

  const handleStyleChange = useCallback((newStyle: any) => {
    setCurrentStyle(prev => ({ ...prev, ...newStyle }));
  }, []);

  const handleMouseDown = (e: Konva.KonvaEventObject<MouseEvent>) => {
    const pos = e.target.getStage()?.getPointerPosition();
    if (!pos) return;

    if (e.target === e.target.getStage()) {
      setSelectedId(null);
      transformerRef.current?.nodes([]);
      
      if (tool !== 'select') {
        setIsDrawing(true);
        setDragStart({ x: pos.x, y: pos.y });
      }
    }
  };

  const handleMouseUp = (e: Konva.KonvaEventObject<MouseEvent>) => {
    if (!isDrawing || tool === 'select') return;
    
    const pos = e.target.getStage()?.getPointerPosition();
    if (!pos) return;

    const width = Math.abs(pos.x - dragStart.x);
    const height = Math.abs(pos.y - dragStart.y);
    const x = Math.min(dragStart.x, pos.x);
    const y = Math.min(dragStart.y, pos.y);

    if (width > 10 && height > 10) {
      const newShape: Shape = {
        id: `${tool}-${Date.now()}`,
        type: tool as any,
        x,
        y,
        width,
        height,
        fill: currentStyle.fillColor,
        stroke: currentStyle.strokeColor,
        strokeWidth: currentStyle.strokeWidth,
        opacity: currentStyle.opacity,
        rotation: 0,
        scaleX: 1,
        scaleY: 1,
        // Shape-specific defaults
        radius: Math.max(width, height) / 2,
        numPoints: 5,
        innerRadius: Math.min(width, height) * 0.3,
        outerRadius: Math.min(width, height) * 0.5,
        sides: 6,
        points: [0, 0, width, 0],
        text: 'New Text',
        fontSize: currentStyle.fontSize,
        fontFamily: currentStyle.fontFamily,
      };

      setShapes(prev => [...prev, newShape]);
      setSelectedId(newShape.id);
    }

    setIsDrawing(false);
  };

  const handleShapeClick = (e: Konva.KonvaEventObject<MouseEvent>) => {
    e.cancelBubble = true;
    const id = e.target.id();
    setSelectedId(id);
    
    const stage = e.target.getStage();
    if (stage) {
      const selectedNode = stage.findOne('#' + id);
      if (selectedNode) {
        transformerRef.current?.nodes([selectedNode]);
      }
    }
  };

  const renderShape = (shape: Shape) => {
    const commonProps = {
      id: shape.id,
      x: shape.x,
      y: shape.y,
      width: shape.width,
      height: shape.height,
      fill: shape.fill,
      stroke: shape.stroke,
      strokeWidth: shape.strokeWidth,
      opacity: shape.opacity,
      rotation: shape.rotation,
      scaleX: shape.scaleX,
      scaleY: shape.scaleY,
      onClick: handleShapeClick,
      draggable: tool === 'select',
    };

    switch (shape.type) {
      case 'rect':
        return <Rect key={shape.id} {...commonProps} />;
      case 'circle':
        return (
          <Circle
            key={shape.id}
            {...commonProps}
            radius={shape.radius || Math.max(shape.width, shape.height) / 2}
            x={shape.x + shape.width / 2}
            y={shape.y + shape.height / 2}
          />
        );
      case 'star':
        return (
          <Star
            key={shape.id}
            {...commonProps}
            numPoints={shape.numPoints || 5}
            innerRadius={shape.innerRadius || Math.min(shape.width, shape.height) * 0.3}
            outerRadius={shape.outerRadius || Math.min(shape.width, shape.height) * 0.5}
            x={shape.x + shape.width / 2}
            y={shape.y + shape.height / 2}
          />
        );
      case 'hexagon':
        return (
          <RegularPolygon
            key={shape.id}
            {...commonProps}
            sides={6}
            radius={Math.min(shape.width, shape.height) / 2}
            x={shape.x + shape.width / 2}
            y={shape.y + shape.height / 2}
          />
        );
      case 'pentagon':
        return (
          <RegularPolygon
            key={shape.id}
            {...commonProps}
            sides={5}
            radius={Math.min(shape.width, shape.height) / 2}
            x={shape.x + shape.width / 2}
            y={shape.y + shape.height / 2}
          />
        );
      case 'line':
        return (
          <Line
            key={shape.id}
            {...commonProps}
            points={[0, 0, shape.width, 0]}
            x={shape.x}
            y={shape.y + shape.height / 2}
          />
        );
      case 'text':
        return (
          <Text
            key={shape.id}
            {...commonProps}
            text={shape.text || 'New Text'}
            fontSize={shape.fontSize || 16}
            fontFamily={shape.fontFamily || 'Arial'}
            align="center"
            verticalAlign="middle"
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className="w-full h-screen bg-gray-100 flex">
      {/* Left Toolbar */}
      <div className="w-16 bg-gray-800 flex flex-col items-center py-4 space-y-2">
        <button
          className={`p-3 rounded ${tool === 'select' ? 'bg-blue-600' : 'bg-gray-600'}`}
          onClick={() => handleToolSelect('select')}
          title="Select Tool"
        >
          <div className="w-6 h-6 border-2 border-white rounded"></div>
        </button>
        <button
          className={`p-3 rounded ${tool === 'rect' ? 'bg-blue-600' : 'bg-gray-600'}`}
          onClick={() => handleToolSelect('rect')}
          title="Rectangle Tool"
        >
          <div className="w-6 h-6 bg-white rounded"></div>
        </button>
        <button
          className={`p-3 rounded ${tool === 'circle' ? 'bg-blue-600' : 'bg-gray-600'}`}
          onClick={() => handleToolSelect('circle')}
          title="Circle Tool"
        >
          <div className="w-6 h-6 bg-white rounded-full"></div>
        </button>
        <button
          className={`p-3 rounded ${tool === 'text' ? 'bg-blue-600' : 'bg-gray-600'}`}
          onClick={() => handleToolSelect('text')}
          title="Text Tool"
        >
          <div className="w-6 h-6 bg-white rounded flex items-center justify-center text-xs font-bold">T</div>
        </button>
        <button
          className="p-3 rounded bg-red-600"
          onClick={() => setShapes([])}
          title="Clear All"
        >
          <div className="w-6 h-6 bg-white rounded flex items-center justify-center text-xs">×</div>
        </button>
      </div>

      {/* Main Canvas Area */}
      <div className="flex-1 flex flex-col">
        {/* Canvas */}
        <div className="flex-1 p-4">
          <Stage
            width={800}
            height={600}
            ref={stageRef}
            onMouseDown={handleMouseDown}
            onMouseUp={handleMouseUp}
          >
            <Layer>
              {/* Grid */}
              {Array.from({ length: 40 }, (_, i) => (
                <Rect
                  key={`v-${i}`}
                  x={i * 20}
                  y={0}
                  width={1}
                  height={600}
                  fill="#e5e7eb"
                />
              ))}
              {Array.from({ length: 30 }, (_, i) => (
                <Rect
                  key={`h-${i}`}
                  x={0}
                  y={i * 20}
                  width={800}
                  height={1}
                  fill="#e5e7eb"
                />
              ))}

              {/* Shapes */}
              {shapes.map(renderShape)}

              {/* Drawing preview */}
              {isDrawing && (
                <Rect
                  x={Math.min(dragStart.x, stageRef.current?.getPointerPosition()?.x || 0)}
                  y={Math.min(dragStart.y, stageRef.current?.getPointerPosition()?.y || 0)}
                  width={Math.abs((stageRef.current?.getPointerPosition()?.x || 0) - dragStart.x)}
                  height={Math.abs((stageRef.current?.getPointerPosition()?.y || 0) - dragStart.y)}
                  fill="transparent"
                  stroke={currentStyle.fillColor}
                  strokeWidth={2}
                  dash={[5, 5]}
                />
              )}
            </Layer>

            {/* Transformer */}
            <Layer>
              <Transformer
                ref={transformerRef}
                boundBoxFunc={(oldBox, newBox) => {
                  if (newBox.width < 5 || newBox.height < 5) {
                    return oldBox;
                  }
                  return newBox;
                }}
              />
            </Layer>
          </Stage>
        </div>
      </div>

      {/* Right Panel */}
      {showToolPanel && (
        <div className="w-80 bg-gray-800 border-l border-gray-700">
          <DrawingShapeTool
            onToolSelect={handleToolSelect}
            onStyleChange={handleStyleChange}
            selectedTool={tool}
            currentStyle={currentStyle}
            onClose={() => setShowToolPanel(false)}
          />
        </div>
      )}
    </div>
  );
}
