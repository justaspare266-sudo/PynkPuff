'use client';

import React, { useRef, useState, useCallback } from 'react';
import { Stage, Layer, Rect, Circle, Text, Transformer, Line, Star, RegularPolygon } from 'react-konva';
import Konva from 'konva';
import { useEditor } from '../contexts/EditorContext';
import ShapeTool from './ShapeTool';
import EnhancedShapeTool from './EnhancedShapeTool';

export function PowerCanvas() {
  const stageRef = useRef<Konva.Stage>(null);
  const transformerRef = useRef<Konva.Transformer>(null);
  const { state, actions } = useEditor();
  const [isDrawing, setIsDrawing] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [showShapeTool, setShowShapeTool] = useState(false);
  const [showEnhancedTool, setShowEnhancedTool] = useState(false);

  const handleMouseDown = (e: Konva.KonvaEventObject<MouseEvent>) => {
    const pos = e.target.getStage()?.getPointerPosition();
    if (!pos) return;

    if (e.target === e.target.getStage()) {
      actions.deselectAll();
      transformerRef.current?.nodes([]);
      
      if (state.tool.selectedTool !== 'select') {
        setIsDrawing(true);
        setDragStart({ x: pos.x, y: pos.y });
        actions.setDrawingState(true, [pos.x, pos.y]);
      }
    }
  };

  const handleMouseUp = (e: Konva.KonvaEventObject<MouseEvent>) => {
    if (!isDrawing || state.tool.selectedTool === 'select') return;
    
    const pos = e.target.getStage()?.getPointerPosition();
    if (!pos) return;

    const width = Math.abs(pos.x - dragStart.x);
    const height = Math.abs(pos.y - dragStart.y);
    const x = Math.min(dragStart.x, pos.x);
    const y = Math.min(dragStart.y, pos.y);

    if (width > 10 && height > 10) {
      // Create shape using your existing system
      const newShape = {
        type: state.tool.selectedTool as any,
        x,
        y,
        width: Math.max(width, 50),
        height: Math.max(height, 50),
        fill: state.tool.toolSettings.fillColor,
        stroke: state.tool.toolSettings.strokeColor,
        strokeWidth: state.tool.toolSettings.strokeWidth,
        opacity: 1,
        rotation: 0,
        scaleX: 1,
        scaleY: 1,
        visible: true,
        locked: false,
        zIndex: 1,
        isSelected: true,
        isDragging: false,
        isResizing: false,
        isRotating: false,
        isCached: false,
        perfectDrawEnabled: true,
        listening: true,
        boundaryState: {
          isWithinBounds: true,
          violationType: null
        },
        name: `${state.tool.selectedTool} ${Date.now()}`,
        // Shape-specific properties
        radius: Math.max(width, height) / 2,
        numPoints: 5,
        innerRadius: Math.min(width, height) * 0.3,
        outerRadius: Math.min(width, height) * 0.5,
        sides: 6,
        points: [0, 0, width, 0],
        text: 'New Text',
        fontSize: state.tool.toolSettings.fontSize,
        fontFamily: state.tool.toolSettings.fontFamily,
      };

      actions.addShape(newShape);
    }

    setIsDrawing(false);
    actions.setDrawingState(false);
  };

  const handleShapeClick = (e: Konva.KonvaEventObject<MouseEvent>) => {
    e.cancelBubble = true;
    const id = e.target.id();
    actions.selectShape(id);
    
    const stage = e.target.getStage();
    if (stage) {
      const selectedNode = stage.findOne('#' + id);
      if (selectedNode) {
        transformerRef.current?.nodes([selectedNode]);
      }
    }
  };

  const renderShape = (shape: any) => {
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
      draggable: state.tool.selectedTool === 'select',
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
          className={`p-3 rounded ${state.tool.selectedTool === 'select' ? 'bg-blue-600' : 'bg-gray-600'}`}
          onClick={() => actions.setSelectedTool('select')}
          title="Select Tool"
        >
          <div className="w-6 h-6 border-2 border-white rounded"></div>
        </button>
        <button
          className={`p-3 rounded ${state.tool.selectedTool === 'rect' ? 'bg-blue-600' : 'bg-gray-600'}`}
          onClick={() => actions.setSelectedTool('rect')}
          title="Rectangle Tool"
        >
          <div className="w-6 h-6 bg-white rounded"></div>
        </button>
        <button
          className={`p-3 rounded ${state.tool.selectedTool === 'circle' ? 'bg-blue-600' : 'bg-gray-600'}`}
          onClick={() => actions.setSelectedTool('circle')}
          title="Circle Tool"
        >
          <div className="w-6 h-6 bg-white rounded-full"></div>
        </button>
        <button
          className={`p-3 rounded ${state.tool.selectedTool === 'text' ? 'bg-blue-600' : 'bg-gray-600'}`}
          onClick={() => actions.setSelectedTool('text')}
          title="Text Tool"
        >
          <div className="w-6 h-6 bg-white rounded flex items-center justify-center text-xs font-bold">T</div>
        </button>
        <button
          className="p-3 rounded bg-red-600"
          onClick={() => setShowShapeTool(!showShapeTool)}
          title="Shape Tool"
        >
          <div className="w-6 h-6 bg-white rounded flex items-center justify-center text-xs">S</div>
        </button>
        <button
          className="p-3 rounded bg-green-600"
          onClick={() => setShowEnhancedTool(!showEnhancedTool)}
          title="Enhanced Tool"
        >
          <div className="w-6 h-6 bg-white rounded flex items-center justify-center text-xs">E</div>
        </button>
        <button
          className="p-3 rounded bg-red-600"
          onClick={() => actions.deselectAll()}
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
              {state.shapes.map(renderShape)}

              {/* Drawing preview */}
              {isDrawing && (
                <Rect
                  x={Math.min(dragStart.x, stageRef.current?.getPointerPosition()?.x || 0)}
                  y={Math.min(dragStart.y, stageRef.current?.getPointerPosition()?.y || 0)}
                  width={Math.abs((stageRef.current?.getPointerPosition()?.x || 0) - dragStart.x)}
                  height={Math.abs((stageRef.current?.getPointerPosition()?.y || 0) - dragStart.y)}
                  fill="transparent"
                  stroke={state.tool.toolSettings.fillColor}
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

      {/* Right Panel - Your Shape Tools */}
      <div className="w-80 bg-gray-800 border-l border-gray-700 overflow-y-auto">
        {showShapeTool && (
          <div className="p-4">
            <ShapeTool
              onShapeAdd={actions.addShape}
              onShapeUpdate={actions.updateShape}
              onShapeDelete={actions.deleteShape}
              canvasState={state.canvas}
              selectedShapeElement={state.shapes.find(s => s.isSelected)}
            />
          </div>
        )}
        
        {showEnhancedTool && (
          <div className="p-4">
            <EnhancedShapeTool
              currentStyle={{
                fill: state.tool.toolSettings.fillColor,
                stroke: state.tool.toolSettings.strokeColor,
                strokeWidth: state.tool.toolSettings.strokeWidth,
                fillEnabled: true,
                strokeEnabled: true,
                opacity: 1,
                rotation: 0,
                scaleX: 1,
                scaleY: 1
              }}
              onStyleChange={(style) => {
                actions.updateToolSettings({
                  fillColor: style.fill,
                  strokeColor: style.stroke,
                  strokeWidth: style.strokeWidth
                });
              }}
              onShapeSelect={(shapeType) => {
                actions.setSelectedTool(shapeType);
              }}
              selectedShapeType={state.tool.selectedTool}
            />
          </div>
        )}
      </div>
    </div>
  );
}
