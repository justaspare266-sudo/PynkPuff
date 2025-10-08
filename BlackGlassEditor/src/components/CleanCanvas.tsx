'use client';

import React, { useRef, useState } from 'react';
import { Stage, Layer, Rect, Circle, Text, Transformer } from 'react-konva';
import Konva from 'konva';

interface Shape {
  id: string;
  type: 'rect' | 'circle' | 'text';
  x: number;
  y: number;
  width: number;
  height: number;
  fill: string;
  stroke: string;
  strokeWidth: number;
}

export function CleanCanvas() {
  const stageRef = useRef<Konva.Stage>(null);
  const transformerRef = useRef<Konva.Transformer>(null);
  const [shapes, setShapes] = useState<Shape[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [tool, setTool] = useState<'select' | 'rect' | 'circle' | 'text'>('select');
  const [isDrawing, setIsDrawing] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });

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
        type: tool as 'rect' | 'circle' | 'text',
        x,
        y,
        width,
        height,
        fill: '#ff6b9d',
        stroke: '#000000',
        strokeWidth: 2,
      };

      setShapes(prev => [...prev, newShape]);
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
            radius={Math.max(shape.width, shape.height) / 2}
            x={shape.x + shape.width / 2}
            y={shape.y + shape.height / 2}
          />
        );
      case 'text':
        return (
          <Text
            key={shape.id}
            {...commonProps}
            text="New Text"
            fontSize={Math.min(shape.height * 0.6, 48)}
            fontFamily="Arial"
            align="center"
            verticalAlign="middle"
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className="w-full h-screen bg-gray-100 flex flex-col">
      {/* Toolbar */}
      <div className="bg-gray-800 text-white p-4 flex gap-4">
        <button
          className={`px-4 py-2 rounded ${tool === 'select' ? 'bg-blue-600' : 'bg-gray-600'}`}
          onClick={() => setTool('select')}
        >
          Select
        </button>
        <button
          className={`px-4 py-2 rounded ${tool === 'rect' ? 'bg-blue-600' : 'bg-gray-600'}`}
          onClick={() => setTool('rect')}
        >
          Rectangle
        </button>
        <button
          className={`px-4 py-2 rounded ${tool === 'circle' ? 'bg-blue-600' : 'bg-gray-600'}`}
          onClick={() => setTool('circle')}
        >
          Circle
        </button>
        <button
          className={`px-4 py-2 rounded ${tool === 'text' ? 'bg-blue-600' : 'bg-gray-600'}`}
          onClick={() => setTool('text')}
        >
          Text
        </button>
        <button
          className="px-4 py-2 rounded bg-red-600"
          onClick={() => setShapes([])}
        >
          Clear All
        </button>
      </div>

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
                stroke="#ff6b9d"
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
  );
}
