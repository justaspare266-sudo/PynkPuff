import React, { useRef, useEffect, useState } from 'react';
import { Stage, Layer, Rect, Text, Circle, Image as KonvaImage } from 'react-konva';
import Konva from 'konva';
import { TextEditorOverlay, TextStyle } from '../components/TextEditorOverlay';

interface CanvasProps {
  width: number;
  height: number;
}

interface CanvasObject {
  id: string;
  type: 'text' | 'rect' | 'circle' | 'image';
  x: number;
  y: number;
  width?: number;
  height?: number;
  radius?: number;
  text?: string;
  fill: string;
  stroke?: string;
  strokeWidth?: number;
  fontSize?: number;
  fontFamily?: string;
  fontWeight?: number;
  fontStyle?: 'normal' | 'italic';
  textDecoration?: 'none' | 'underline' | 'line-through';
  textAlign?: 'left' | 'center' | 'right' | 'justify';
  letterSpacing?: number;
  lineHeight?: number;
  rotation?: number;
  scaleX?: number;
  scaleY?: number;
  opacity?: number;
  visible?: boolean;
}

export const Canvas: React.FC<CanvasProps> = ({ width, height }) => {
  const stageRef = useRef<Konva.Stage>(null);
  const [objects, setObjects] = useState<CanvasObject[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [tool, setTool] = useState<'select' | 'text' | 'rect' | 'circle'>('select');
  const [zoom, setZoom] = useState(1);
  const [panX, setPanX] = useState(0);
  const [panY, setPanY] = useState(0);
  const [showTextEditor, setShowTextEditor] = useState(false);
  const [editingTextId, setEditingTextId] = useState<string | null>(null);

  const addObject = (e: Konva.KonvaEventObject<MouseEvent>) => {
    if (tool === 'select') return;
    
    const stage = stageRef.current;
    if (!stage) return;
    
    const pos = stage.getPointerPosition();
    if (!pos) return;

    // Only add object if we're not clicking on an existing object
    const clickedOnEmpty = e.target === stage;
    if (!clickedOnEmpty) return;

    const newObject: CanvasObject = {
      id: `${tool}-${Date.now()}`,
      type: tool,
      x: pos.x / zoom,
      y: pos.y / zoom,
      fill: '#3b82f6',
      stroke: '#1e40af',
      strokeWidth: 2,
      fontSize: 24,
      fontFamily: 'Arial',
      fontWeight: 400,
      fontStyle: 'normal',
      textDecoration: 'none',
      textAlign: 'left',
      letterSpacing: 0,
      lineHeight: 1.2,
      rotation: 0,
      scaleX: 1,
      scaleY: 1,
      opacity: 1,
      visible: true
    };

    if (tool === 'text') {
      newObject.text = 'Click to edit';
      newObject.width = 200;
      newObject.height = 40;
    } else if (tool === 'rect') {
      newObject.width = 100;
      newObject.height = 100;
    } else if (tool === 'circle') {
      newObject.radius = 50;
    }

    setObjects([...objects, newObject]);
    setSelectedId(newObject.id);
  };

  const handleWheel = (e: Konva.KonvaEventObject<WheelEvent>) => {
    e.evt.preventDefault();
    const scaleBy = 1.1;
    const stage = stageRef.current;
    if (!stage) return;

    const oldScale = stage.scaleX();
    const newScale = e.evt.deltaY > 0 ? oldScale / scaleBy : oldScale * scaleBy;
    setZoom(newScale);
  };

  const handleObjectClick = (id: string) => {
    setSelectedId(id);
  };

  const handleTextDoubleClick = (id: string) => {
    const object = objects.find(obj => obj.id === id);
    if (object && object.type === 'text') {
      setEditingTextId(id);
      setShowTextEditor(true);
    }
  };

  const handleObjectDragEnd = (id: string, x: number, y: number) => {
    setObjects(prev => prev.map(obj => 
      obj.id === id ? { ...obj, x, y } : obj
    ));
  };

  const handleKeyDown = (e: KeyboardEvent) => {
    if (selectedId && e.key === 'Delete') {
      setObjects(prev => prev.filter(obj => obj.id !== selectedId));
      setSelectedId(null);
    }
  };

  const handleTextChange = (newText: string) => {
    if (editingTextId) {
      setObjects(prev => prev.map(obj => 
        obj.id === editingTextId ? { ...obj, text: newText } : obj
      ));
    }
  };

  const handleStyleChange = (newStyle: TextStyle) => {
    if (editingTextId) {
      setObjects(prev => prev.map(obj => 
        obj.id === editingTextId ? { 
          ...obj, 
          fontSize: newStyle.fontSize,
          fontFamily: newStyle.fontFamily,
          fontWeight: newStyle.fontWeight,
          fontStyle: newStyle.fontStyle,
          textDecoration: newStyle.textDecoration,
          textAlign: newStyle.textAlign,
          letterSpacing: newStyle.letterSpacing,
          lineHeight: newStyle.lineHeight,
          fill: newStyle.fill,
          stroke: newStyle.stroke,
          strokeWidth: newStyle.strokeWidth,
          rotation: newStyle.rotation,
          opacity: newStyle.opacity
        } : obj
      ));
    }
  };

  const handleCloseTextEditor = () => {
    setShowTextEditor(false);
    setEditingTextId(null);
  };

  const handleDeleteText = () => {
    if (editingTextId) {
      setObjects(prev => prev.filter(obj => obj.id !== editingTextId));
      setSelectedId(null);
      setShowTextEditor(false);
      setEditingTextId(null);
    }
  };

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedId]);

  const renderObject = (obj: CanvasObject) => {
    const commonProps = {
      key: obj.id,
      id: obj.id,
      x: obj.x,
      y: obj.y,
      rotation: obj.rotation || 0,
      scaleX: obj.scaleX || 1,
      scaleY: obj.scaleY || 1,
      opacity: obj.opacity || 1,
      visible: obj.visible !== false,
      onClick: () => handleObjectClick(obj.id),
      onDragEnd: (e: any) => handleObjectDragEnd(obj.id, e.target.x(), e.target.y()),
      draggable: selectedId === obj.id
    };

    switch (obj.type) {
      case 'text':
        return (
          <Text
            {...commonProps}
            text={obj.text || 'Click to edit'}
            fontSize={obj.fontSize || 24}
            fontFamily={obj.fontFamily || 'Arial'}
            fontStyle={obj.fontStyle || 'normal'}
            fontWeight={obj.fontWeight || 400}
            textDecoration={obj.textDecoration || 'none'}
            align={obj.textAlign || 'left'}
            letterSpacing={obj.letterSpacing || 0}
            lineHeight={obj.lineHeight || 1.2}
            fill={obj.fill}
            width={obj.width}
            height={obj.height}
            stroke={selectedId === obj.id ? '#3b82f6' : obj.stroke}
            strokeWidth={selectedId === obj.id ? 2 : (obj.strokeWidth || 0)}
            onClick={() => handleObjectClick(obj.id)}
            onDblClick={() => handleTextDoubleClick(obj.id)}
          />
        );

      case 'rect':
        return (
          <Rect
            {...commonProps}
            width={obj.width || 100}
            height={obj.height || 100}
            fill={obj.fill}
            stroke={selectedId === obj.id ? '#3b82f6' : obj.stroke}
            strokeWidth={selectedId === obj.id ? 2 : (obj.strokeWidth || 0)}
            onClick={() => handleObjectClick(obj.id)}
          />
        );

      case 'circle':
        return (
          <Circle
            {...commonProps}
            radius={obj.radius || 50}
            fill={obj.fill}
            stroke={selectedId === obj.id ? '#3b82f6' : obj.stroke}
            strokeWidth={selectedId === obj.id ? 2 : (obj.strokeWidth || 0)}
            onClick={() => handleObjectClick(obj.id)}
          />
        );

      default:
        return null;
    }
  };

  return (
    <div className="w-full h-full relative">
      <Stage
        ref={stageRef}
        width={width}
        height={height}
        scaleX={zoom}
        scaleY={zoom}
        x={panX}
        y={panY}
        onClick={addObject}
        onWheel={handleWheel}
        style={{ background: '#ffffff' }}
      >
        <Layer>
          {/* Canvas Background */}
          <Rect
            x={0}
            y={0}
            width={width}
            height={height}
            fill="#ffffff"
            stroke="#d1d5db"
            strokeWidth={2}
            listening={false}
          />
          
          {/* Objects */}
          {objects.map(renderObject)}
        </Layer>
      </Stage>
      
      {/* Tool Selector */}
      <div className="absolute top-4 left-4 bg-white rounded-lg shadow-lg p-2 flex space-x-2">
        {[
          { id: 'select', label: 'Select', icon: '↖️' },
          { id: 'text', label: 'Text', icon: 'T' },
          { id: 'rect', label: 'Rectangle', icon: '⬜' },
          { id: 'circle', label: 'Circle', icon: '⭕' }
        ].map(toolOption => (
          <button
            key={toolOption.id}
            onClick={() => setTool(toolOption.id as any)}
            className={`px-3 py-2 rounded text-sm font-medium transition-colors ${
              tool === toolOption.id
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            <span className="mr-1">{toolOption.icon}</span>
            {toolOption.label}
          </button>
        ))}
        <button
          onClick={() => {
            setObjects([]);
            setSelectedId(null);
          }}
          className="px-3 py-2 rounded text-sm font-medium bg-red-100 text-red-700 hover:bg-red-200"
        >
          Clear
        </button>
      </div>
      
      {/* Instructions */}
      <div className="absolute bottom-4 left-4 bg-white rounded-lg shadow-lg p-3 max-w-sm">
        <h3 className="font-semibold text-sm mb-2">How to use:</h3>
        <ul className="text-xs text-gray-600 space-y-1">
          <li>• Select a tool and click on empty canvas to add objects</li>
          <li>• Click objects to select them (blue border)</li>
          <li>• Drag selected objects to move them</li>
          <li>• Double-click text to edit it</li>
          <li>• Press Delete to remove selected object</li>
          <li>• Use Clear button to remove all objects</li>
        </ul>
      </div>

      {/* Zoom Controls */}
      <div className="absolute top-4 right-4 bg-white rounded-lg shadow-lg p-2 flex items-center space-x-2">
        <button
          onClick={() => setZoom(zoom / 1.2)}
          className="px-2 py-1 rounded text-sm bg-gray-100 hover:bg-gray-200"
        >
          -
        </button>
        <span className="text-sm font-medium">{Math.round(zoom * 100)}%</span>
        <button
          onClick={() => setZoom(zoom * 1.2)}
          className="px-2 py-1 rounded text-sm bg-gray-100 hover:bg-gray-200"
        >
          +
        </button>
      </div>

      {/* Text Editor Overlay */}
      {showTextEditor && editingTextId && (() => {
        const editingObject = objects.find(obj => obj.id === editingTextId);
        if (!editingObject || editingObject.type !== 'text') return null;
        
        const textStyle: TextStyle = {
          fontSize: editingObject.fontSize || 24,
          fontFamily: editingObject.fontFamily || 'Arial',
          fontWeight: editingObject.fontWeight || 400,
          fontStyle: editingObject.fontStyle || 'normal',
          textDecoration: editingObject.textDecoration || 'none',
          textAlign: editingObject.textAlign || 'left',
          letterSpacing: editingObject.letterSpacing || 0,
          lineHeight: editingObject.lineHeight || 1.2,
          fill: editingObject.fill,
          stroke: editingObject.stroke,
          strokeWidth: editingObject.strokeWidth || 0,
          rotation: editingObject.rotation || 0,
          opacity: editingObject.opacity || 1
        };

        return (
          <TextEditorOverlay
            isVisible={showTextEditor}
            text={editingObject.text || ''}
            style={textStyle}
            position={{ x: editingObject.x, y: editingObject.y }}
            onTextChange={handleTextChange}
            onStyleChange={handleStyleChange}
            onClose={handleCloseTextEditor}
            onDelete={handleDeleteText}
          />
        );
      })()}
    </div>
  );
};
