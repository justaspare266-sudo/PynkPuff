/**
 * Custom Shape Creator
 * Advanced shape creation and editing tools
 */

import React, { useState, useCallback, useRef, useEffect } from 'react';
import { 
  Square, 
  Circle, 
  Triangle, 
  Star, 
  Heart,
  Diamond,
  Hexagon,
  Pentagon,
  Octagon,
  Plus,
  Minus,
  X,
  ArrowUp,
  ArrowDown,
  ArrowLeft,
  ArrowRight,
  ChevronUp,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Play,
  Pause,
  Square as Stop,
  Settings,
  Download,
  Upload,
  Save,
  RotateCcw,
  Eye,
  EyeOff,
  Copy,
  Check,
  Search,
  Filter,
  SortAsc,
  SortDesc,
  Star as StarIcon,
  StarOff,
  Trash2,
  Edit,
  Plus as PlusIcon,
  PenTool,
  Eraser,
  Move,
  RotateCw,
  Scale,
  Crop,
  Layers,
  Grid3X3,
  AlignLeft,
  AlignCenter,
  AlignRight,
  AlignJustify,
  ArrowUp as ArrowUpIcon,
  ArrowDown as ArrowDownIcon,
  ArrowLeft as ArrowLeftIcon,
  ArrowRight as ArrowRightIcon,
  Pipette,
  Download as DownloadIcon,
  Save as SaveIcon,
  Undo2,
  Redo2,
  Settings as SettingsIcon,
  Eye as EyeIcon,
  EyeOff as EyeOffIcon,
  Trash2 as Trash2Icon,
  Copy as CopyIcon,
  Scissors,
  MousePointer,
  Hand,
  FileText,
  Image as ImageIcon,
  FolderOpen,
  RotateCcw as RotateCcwIcon,
  ZoomIn,
  ZoomOut,
  Maximize2,
  PenTool as PenToolIcon,
  Eraser as EraserIcon,
  Droplets,
  Palette,
  Play as PlayIcon,
  X as XIcon
} from 'lucide-react';

export interface CustomShapeCreatorProps {
  onShapeCreate: (shape: any) => void;
  onClose?: () => void;
  className?: string;
}

const CustomShapeCreator: React.FC<CustomShapeCreatorProps> = ({
  onShapeCreate,
  onClose,
  className = ''
}) => {
  const [activeTool, setActiveTool] = useState<'pen' | 'eraser' | 'move' | 'select'>('pen');
  const [isDrawing, setIsDrawing] = useState(false);
  const [currentPath, setCurrentPath] = useState<string>('');
  const [shapes, setShapes] = useState<any[]>([]);
  const [selectedShape, setSelectedShape] = useState<string | null>(null);
  const [showSettings, setShowSettings] = useState(false);
  const [copiedShape, setCopiedShape] = useState<string | null>(null);
  
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [canvasSize, setCanvasSize] = useState({ width: 400, height: 300 });

  // Handle canvas click
  const handleCanvasClick = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!canvasRef.current) return;
    
    const rect = canvasRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    if (activeTool === 'pen') {
      if (!isDrawing) {
        setIsDrawing(true);
        setCurrentPath(`M${x},${y}`);
      } else {
        setCurrentPath(prev => `${prev} L${x},${y}`);
      }
    }
  }, [activeTool, isDrawing]);

  // Handle canvas mouse move
  const handleCanvasMouseMove = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!canvasRef.current || !isDrawing || activeTool !== 'pen') return;
    
    const rect = canvasRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    setCurrentPath(prev => `${prev} L${x},${y}`);
  }, [isDrawing, activeTool]);

  // Handle canvas mouse up
  const handleCanvasMouseUp = useCallback(() => {
    if (isDrawing && activeTool === 'pen') {
      setIsDrawing(false);
      if (currentPath) {
        const newShape = {
          id: `shape-${Date.now()}`,
          type: 'path',
          path: currentPath,
          stroke: '#000000',
          strokeWidth: 2,
          fill: 'none'
        };
        setShapes(prev => [...prev, newShape]);
        setCurrentPath('');
      }
    }
  }, [isDrawing, activeTool, currentPath]);

  // Handle shape select
  const handleShapeSelect = useCallback((shapeId: string) => {
    setSelectedShape(shapeId);
  }, []);

  // Handle shape copy
  const handleShapeCopy = useCallback((shape: any) => {
    const data = {
      type: shape.type,
      path: shape.path,
      stroke: shape.stroke,
      strokeWidth: shape.strokeWidth,
      fill: shape.fill
    };
    
    navigator.clipboard.writeText(JSON.stringify(data, null, 2));
    setCopiedShape(shape.id);
    setTimeout(() => setCopiedShape(null), 2000);
  }, []);

  // Handle shape delete
  const handleShapeDelete = useCallback((shapeId: string) => {
    setShapes(prev => prev.filter(shape => shape.id !== shapeId));
    if (selectedShape === shapeId) {
      setSelectedShape(null);
    }
  }, [selectedShape]);

  // Handle shape save
  const handleShapeSave = useCallback(() => {
    if (shapes.length > 0) {
      const shapeData = {
        id: `custom-shape-${Date.now()}`,
        name: 'Custom Shape',
        category: 'custom',
        type: 'group',
        data: { shapes },
        preview: shapes.map(shape => 
          shape.type === 'path' ? `<path d="${shape.path}" stroke="${shape.stroke}" stroke-width="${shape.strokeWidth}" fill="${shape.fill}"/>` : ''
        ).join(''),
        tags: ['custom', 'hand-drawn'],
        isCustom: true,
        isFavorite: false,
        isPublic: false,
        createdAt: new Date(),
        updatedAt: new Date()
      };
      
      onShapeCreate(shapeData);
    }
  }, [shapes, onShapeCreate]);

  // Clear canvas
  const clearCanvas = useCallback(() => {
    setShapes([]);
    setCurrentPath('');
    setSelectedShape(null);
  }, []);

  // Redraw canvas
  const redrawCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Draw shapes
    shapes.forEach(shape => {
      if (shape.type === 'path') {
        ctx.strokeStyle = shape.stroke;
        ctx.lineWidth = shape.strokeWidth;
        ctx.fillStyle = shape.fill;
        
        const path = new Path2D(shape.path);
        ctx.stroke(path);
        if (shape.fill !== 'none') {
          ctx.fill(path);
        }
      }
    });
    
    // Draw current path
    if (currentPath) {
      ctx.strokeStyle = '#000000';
      ctx.lineWidth = 2;
      const path = new Path2D(currentPath);
      ctx.stroke(path);
    }
  }, [shapes, currentPath]);

  // Update canvas size
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    canvas.width = canvasSize.width;
    canvas.height = canvasSize.height;
    redrawCanvas();
  }, [canvasSize, redrawCanvas]);

  // Redraw when shapes change
  useEffect(() => {
    redrawCanvas();
  }, [shapes, currentPath, redrawCanvas]);

  return (
    <div className={`bg-white rounded-lg shadow-xl border border-gray-200 p-4 w-full max-w-6xl ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold flex items-center">
          <PenTool size={20} className="mr-2" />
          Custom Shape Creator
        </h3>
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setShowSettings(!showSettings)}
            className="p-2 text-gray-500 hover:text-gray-700"
            title="Settings"
          >
            <Settings size={16} />
          </button>
          <button
            onClick={handleShapeSave}
            className="p-2 text-gray-500 hover:text-gray-700"
            title="Save shape"
          >
            <Save size={16} />
          </button>
          <button
            onClick={clearCanvas}
            className="p-2 text-gray-500 hover:text-gray-700"
            title="Clear canvas"
          >
            <Trash2 size={16} />
          </button>
          {onClose && (
            <button
              onClick={onClose}
              className="p-2 text-gray-500 hover:text-gray-700"
            >
              <X size={16} />
            </button>
          )}
        </div>
      </div>

      {/* Toolbar */}
      <div className="flex items-center space-x-2 mb-4">
        <button
          onClick={() => setActiveTool('pen')}
          className={`p-2 rounded ${activeTool === 'pen' ? 'bg-blue-100 text-blue-700' : 'text-gray-600 hover:text-gray-800'}`}
          title="Pen Tool"
        >
          <PenTool size={16} />
        </button>
        <button
          onClick={() => setActiveTool('eraser')}
          className={`p-2 rounded ${activeTool === 'eraser' ? 'bg-blue-100 text-blue-700' : 'text-gray-600 hover:text-gray-800'}`}
          title="Eraser Tool"
        >
          <Eraser size={16} />
        </button>
        <button
          onClick={() => setActiveTool('move')}
          className={`p-2 rounded ${activeTool === 'move' ? 'bg-blue-100 text-blue-700' : 'text-gray-600 hover:text-gray-800'}`}
          title="Move Tool"
        >
          <Move size={16} />
        </button>
        <button
          onClick={() => setActiveTool('select')}
          className={`p-2 rounded ${activeTool === 'select' ? 'bg-blue-100 text-blue-700' : 'text-gray-600 hover:text-gray-800'}`}
          title="Select Tool"
        >
          <MousePointer size={16} />
        </button>
      </div>

      {/* Canvas Area */}
      <div className="flex space-x-4">
        {/* Canvas */}
        <div className="flex-1">
          <div className="border border-gray-300 rounded-lg overflow-hidden">
            <canvas
              ref={canvasRef}
              width={canvasSize.width}
              height={canvasSize.height}
              className="cursor-crosshair"
              onClick={handleCanvasClick}
              onMouseMove={handleCanvasMouseMove}
              onMouseUp={handleCanvasMouseUp}
            />
          </div>
        </div>

        {/* Shape List */}
        <div className="w-64">
          <h4 className="font-medium mb-2">Shapes</h4>
          <div className="space-y-2 max-h-64 overflow-y-auto">
            {shapes.map(shape => (
              <div
                key={shape.id}
                className={`p-2 border rounded cursor-pointer ${
                  selectedShape === shape.id ? 'border-blue-500 bg-blue-50' : 'border-gray-200'
                }`}
                onClick={() => handleShapeSelect(shape.id)}
              >
                <div className="flex items-center justify-between">
                  <span className="text-sm">{shape.type}</span>
                  <div className="flex items-center space-x-1">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleShapeCopy(shape);
                      }}
                      className="p-1 text-gray-500 hover:text-gray-700"
                      title="Copy shape"
                    >
                      {copiedShape === shape.id ? <Check size={12} /> : <Copy size={12} />}
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleShapeDelete(shape.id);
                      }}
                      className="p-1 text-gray-500 hover:text-red-600"
                      title="Delete shape"
                    >
                      <Trash2 size={12} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Settings Panel */}
      {showSettings && (
        <div className="absolute top-12 right-2 z-30 bg-white rounded-lg shadow-xl border border-gray-200 p-4 w-64">
          <h4 className="font-semibold mb-3">Creator Settings</h4>
          
          <div className="space-y-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Canvas Width</label>
              <input
                type="number"
                value={canvasSize.width}
                onChange={(e) => setCanvasSize(prev => ({ ...prev, width: parseInt(e.target.value) }))}
                className="w-full px-3 py-2 border border-gray-300 rounded text-sm"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Canvas Height</label>
              <input
                type="number"
                value={canvasSize.height}
                onChange={(e) => setCanvasSize(prev => ({ ...prev, height: parseInt(e.target.value) }))}
                className="w-full px-3 py-2 border border-gray-300 rounded text-sm"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Stroke Width</label>
              <input
                type="range"
                min="1"
                max="10"
                defaultValue="2"
                className="w-full"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Stroke Color</label>
              <input
                type="color"
                defaultValue="#000000"
                className="w-full h-10 border border-gray-300 rounded cursor-pointer"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CustomShapeCreator;
