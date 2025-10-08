/**
 * Professional Rulers Component
 * Horizontal and vertical rulers with precise measurements
 */

import React, { useState, useCallback, useRef, useEffect } from 'react';
import { 
  Ruler, 
  Settings, 
  Eye, 
  EyeOff, 
  RotateCcw,
  Maximize2,
  Minimize2
} from 'lucide-react';

export interface RulerConfig {
  showRulers: boolean;
  showGuides: boolean;
  showMeasurements: boolean;
  unit: 'px' | 'mm' | 'cm' | 'in' | 'pt';
  precision: number;
  rulerSize: number;
  guideColor: string;
  measurementColor: string;
  rulerColor: string;
  rulerBackground: string;
  fontSize: number;
  showGrid: boolean;
  gridSize: number;
  snapToGrid: boolean;
  snapToGuides: boolean;
}

export interface RulersProps {
  canvasWidth: number;
  canvasHeight: number;
  zoom: number;
  panX: number;
  panY: number;
  config: RulerConfig;
  onConfigChange: (config: RulerConfig) => void;
  onGuideAdd: (guide: { id: string; type: 'horizontal' | 'vertical'; position: number }) => void;
  onGuideRemove: (id: string) => void;
  onGuideMove: (id: string, position: number) => void;
  className?: string;
}

const Rulers: React.FC<RulersProps> = ({
  canvasWidth,
  canvasHeight,
  zoom,
  panX,
  panY,
  config,
  onConfigChange,
  onGuideAdd,
  onGuideRemove,
  onGuideMove,
  className = ''
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [dragType, setDragType] = useState<'horizontal' | 'vertical' | null>(null);
  const [dragPosition, setDragPosition] = useState(0);
  const [showSettings, setShowSettings] = useState(false);
  const [guides, setGuides] = useState<Array<{ id: string; type: 'horizontal' | 'vertical'; position: number }>>([]);
  
  const horizontalRulerRef = useRef<HTMLDivElement>(null);
  const verticalRulerRef = useRef<HTMLDivElement>(null);

  // Unit conversion utilities
  const convertUnits = useCallback((pixels: number, unit: RulerConfig['unit']): number => {
    const dpi = 96; // Standard DPI
    switch (unit) {
      case 'px': return pixels;
      case 'mm': return (pixels / dpi) * 25.4;
      case 'cm': return (pixels / dpi) * 2.54;
      case 'in': return pixels / dpi;
      case 'pt': return (pixels / dpi) * 72;
      default: return pixels;
    }
  }, []);

  const formatMeasurement = useCallback((pixels: number): string => {
    const value = convertUnits(pixels, config.unit);
    return `${value.toFixed(config.precision)}${config.unit}`;
  }, [convertUnits, config.unit, config.precision]);

  // Generate ruler marks
  const generateRulerMarks = useCallback((length: number, isVertical: boolean = false) => {
    const marks = [];
    const majorInterval = config.unit === 'px' ? 100 : 1;
    const minorInterval = config.unit === 'px' ? 10 : 0.1;
    
    for (let i = 0; i <= length; i += minorInterval) {
      const isMajor = i % majorInterval === 0;
      const position = isVertical ? i : i;
      
      marks.push({
        position,
        isMajor,
        value: formatMeasurement(i),
        height: isMajor ? config.rulerSize * 0.6 : config.rulerSize * 0.3
      });
    }
    
    return marks;
  }, [config.unit, config.rulerSize, formatMeasurement]);

  // Handle ruler click
  const handleRulerClick = useCallback((e: React.MouseEvent, type: 'horizontal' | 'vertical') => {
    if (!config.showRulers) return;
    
    const rect = type === 'horizontal' 
      ? horizontalRulerRef.current?.getBoundingClientRect()
      : verticalRulerRef.current?.getBoundingClientRect();
    
    if (!rect) return;
    
    const clickPosition = type === 'horizontal' 
      ? e.clientX - rect.left
      : e.clientY - rect.top;
    
    const canvasPosition = type === 'horizontal' 
      ? (clickPosition - panX) / zoom
      : (clickPosition - panY) / zoom;
    
    const guideId = `guide-${Date.now()}`;
    onGuideAdd({
      id: guideId,
      type,
      position: canvasPosition
    });
    
    setGuides(prev => [...prev, { id: guideId, type, position: canvasPosition }]);
  }, [config.showRulers, panX, panY, zoom, onGuideAdd]);

  // Handle guide drag
  const handleGuideDrag = useCallback((e: React.MouseEvent, guideId: string, type: 'horizontal' | 'vertical') => {
    setIsDragging(true);
    setDragType(type);
    
    const handleMouseMove = (e: MouseEvent) => {
      const rect = type === 'horizontal' 
        ? horizontalRulerRef.current?.getBoundingClientRect()
        : verticalRulerRef.current?.getBoundingClientRect();
      
      if (!rect) return;
      
      const mousePosition = type === 'horizontal' 
        ? e.clientX - rect.left
        : e.clientY - rect.top;
      
      const canvasPosition = type === 'horizontal' 
        ? (mousePosition - panX) / zoom
        : (mousePosition - panY) / zoom;
      
      setDragPosition(canvasPosition);
      onGuideMove(guideId, canvasPosition);
    };
    
    const handleMouseUp = () => {
      setIsDragging(false);
      setDragType(null);
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
    
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  }, [panX, panY, zoom, onGuideMove]);

  // Handle guide double-click to remove
  const handleGuideDoubleClick = useCallback((guideId: string) => {
    onGuideRemove(guideId);
    setGuides(prev => prev.filter(guide => guide.id !== guideId));
  }, [onGuideRemove]);

  // Clear all guides
  const clearAllGuides = useCallback(() => {
    guides.forEach(guide => onGuideRemove(guide.id));
    setGuides([]);
  }, [guides, onGuideRemove]);

  // Toggle rulers
  const toggleRulers = useCallback(() => {
    onConfigChange({ ...config, showRulers: !config.showRulers });
  }, [config, onConfigChange]);

  // Toggle guides
  const toggleGuides = useCallback(() => {
    onConfigChange({ ...config, showGuides: !config.showGuides });
  }, [config, onConfigChange]);

  // Toggle grid
  const toggleGrid = useCallback(() => {
    onConfigChange({ ...config, showGrid: !config.showGrid });
  }, [config, onConfigChange]);

  // Change unit
  const changeUnit = useCallback((unit: RulerConfig['unit']) => {
    onConfigChange({ ...config, unit });
  }, [config, onConfigChange]);

  // Change precision
  const changePrecision = useCallback((precision: number) => {
    onConfigChange({ ...config, precision });
  }, [config, onConfigChange]);

  // Render horizontal ruler
  const renderHorizontalRuler = () => {
    if (!config.showRulers) return null;
    
    const marks = generateRulerMarks(canvasWidth);
    
    return (
      <div
        ref={horizontalRulerRef}
        className="relative cursor-crosshair select-none"
        style={{
          height: config.rulerSize,
          backgroundColor: config.rulerBackground,
          borderBottom: `1px solid ${config.rulerColor}`,
          transform: `translateX(${panX}px) scaleX(${zoom})`,
          transformOrigin: 'left top'
        }}
        onClick={(e) => handleRulerClick(e, 'horizontal')}
      >
        {/* Ruler marks */}
        {marks.map((mark, index) => (
          <div
            key={index}
            className="absolute"
            style={{
              left: mark.position,
              top: 0,
              height: mark.height,
              borderLeft: `1px solid ${config.rulerColor}`,
              fontSize: config.fontSize,
              color: config.rulerColor,
              lineHeight: 1,
              paddingLeft: 2,
              paddingTop: 2
            }}
          >
            {mark.isMajor && (
              <span className="text-xs">
                {mark.value}
              </span>
            )}
          </div>
        ))}
        
        {/* Guides */}
        {config.showGuides && guides
          .filter(guide => guide.type === 'horizontal')
          .map(guide => (
            <div
              key={guide.id}
              className="absolute cursor-move"
              style={{
                left: guide.position * zoom,
                top: 0,
                width: 1,
                height: config.rulerSize,
                backgroundColor: config.guideColor,
                zIndex: 10
              }}
              onMouseDown={(e) => handleGuideDrag(e, guide.id, 'horizontal')}
              onDoubleClick={() => handleGuideDoubleClick(guide.id)}
            />
          ))}
      </div>
    );
  };

  // Render vertical ruler
  const renderVerticalRuler = () => {
    if (!config.showRulers) return null;
    
    const marks = generateRulerMarks(canvasHeight, true);
    
    return (
      <div
        ref={verticalRulerRef}
        className="relative cursor-crosshair select-none"
        style={{
          width: config.rulerSize,
          backgroundColor: config.rulerBackground,
          borderRight: `1px solid ${config.rulerColor}`,
          transform: `translateY(${panY}px) scaleY(${zoom})`,
          transformOrigin: 'left top'
        }}
        onClick={(e) => handleRulerClick(e, 'vertical')}
      >
        {/* Ruler marks */}
        {marks.map((mark, index) => (
          <div
            key={index}
            className="absolute"
            style={{
              top: mark.position,
              left: 0,
              width: mark.height,
              borderTop: `1px solid ${config.rulerColor}`,
              fontSize: config.fontSize,
              color: config.rulerColor,
              lineHeight: 1,
              paddingTop: 2,
              paddingLeft: 2,
              transform: 'rotate(-90deg)',
              transformOrigin: 'left top'
            }}
          >
            {mark.isMajor && (
              <span className="text-xs">
                {mark.value}
              </span>
            )}
          </div>
        ))}
        
        {/* Guides */}
        {config.showGuides && guides
          .filter(guide => guide.type === 'vertical')
          .map(guide => (
            <div
              key={guide.id}
              className="absolute cursor-move"
              style={{
                top: guide.position * zoom,
                left: 0,
                width: config.rulerSize,
                height: 1,
                backgroundColor: config.guideColor,
                zIndex: 10
              }}
              onMouseDown={(e) => handleGuideDrag(e, guide.id, 'vertical')}
              onDoubleClick={() => handleGuideDoubleClick(guide.id)}
            />
          ))}
      </div>
    );
  };

  // Render grid
  const renderGrid = () => {
    if (!config.showGrid) return null;
    
    const gridLines = [];
    const gridSize = config.gridSize;
    
    // Vertical lines
    for (let x = 0; x <= canvasWidth; x += gridSize) {
      gridLines.push(
        <line
          key={`v-${x}`}
          x1={x}
          y1={0}
          x2={x}
          y2={canvasHeight}
          stroke={config.guideColor}
          strokeWidth={0.5}
          opacity={0.3}
        />
      );
    }
    
    // Horizontal lines
    for (let y = 0; y <= canvasHeight; y += gridSize) {
      gridLines.push(
        <line
          key={`h-${y}`}
          x1={0}
          y1={y}
          x2={canvasWidth}
          y2={y}
          stroke={config.guideColor}
          strokeWidth={0.5}
          opacity={0.3}
        />
      );
    }
    
    return (
      <svg
        className="absolute inset-0 pointer-events-none"
        style={{
          transform: `translate(${panX}px, ${panY}px) scale(${zoom})`,
          transformOrigin: 'left top'
        }}
      >
        {gridLines}
      </svg>
    );
  };

  return (
    <div className={`relative ${className}`}>
      {/* Ruler Controls */}
      <div className="absolute top-2 right-2 z-20 flex items-center space-x-2">
        <button
          onClick={toggleRulers}
          className={`p-2 rounded ${config.showRulers ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-600'}`}
          title="Toggle Rulers"
        >
          <Ruler size={16} />
        </button>
        <button
          onClick={toggleGuides}
          className={`p-2 rounded ${config.showGuides ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-600'}`}
          title="Toggle Guides"
        >
          <Eye size={16} />
        </button>
        <button
          onClick={toggleGrid}
          className={`p-2 rounded ${config.showGrid ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-600'}`}
          title="Toggle Grid"
        >
          <Settings size={16} />
        </button>
        <button
          onClick={() => setShowSettings(!showSettings)}
          className="p-2 rounded bg-gray-100 text-gray-600 hover:bg-gray-200"
          title="Ruler Settings"
        >
          <Settings size={16} />
        </button>
        <button
          onClick={clearAllGuides}
          className="p-2 rounded bg-gray-100 text-gray-600 hover:bg-gray-200"
          title="Clear All Guides"
        >
          <RotateCcw size={16} />
        </button>
      </div>

      {/* Settings Panel */}
      {showSettings && (
        <div className="absolute top-12 right-2 z-30 bg-white rounded-lg shadow-xl border border-gray-200 p-4 w-64">
          <h4 className="font-semibold mb-3">Ruler Settings</h4>
          
          <div className="space-y-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Unit</label>
              <select
                value={config.unit}
                onChange={(e) => changeUnit(e.target.value as RulerConfig['unit'])}
                className="w-full px-3 py-2 border border-gray-300 rounded text-sm"
              >
                <option value="px">Pixels (px)</option>
                <option value="mm">Millimeters (mm)</option>
                <option value="cm">Centimeters (cm)</option>
                <option value="in">Inches (in)</option>
                <option value="pt">Points (pt)</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Precision</label>
              <input
                type="number"
                min="0"
                max="3"
                value={config.precision}
                onChange={(e) => changePrecision(parseInt(e.target.value))}
                className="w-full px-3 py-2 border border-gray-300 rounded text-sm"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Ruler Size</label>
              <input
                type="range"
                min="20"
                max="40"
                value={config.rulerSize}
                onChange={(e) => onConfigChange({ ...config, rulerSize: parseInt(e.target.value) })}
                className="w-full"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Grid Size</label>
              <input
                type="range"
                min="10"
                max="100"
                value={config.gridSize}
                onChange={(e) => onConfigChange({ ...config, gridSize: parseInt(e.target.value) })}
                className="w-full"
              />
            </div>
            
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="snapToGrid"
                checked={config.snapToGrid}
                onChange={(e) => onConfigChange({ ...config, snapToGrid: e.target.checked })}
                className="rounded"
              />
              <label htmlFor="snapToGrid" className="text-sm text-gray-700">Snap to Grid</label>
            </div>
            
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="snapToGuides"
                checked={config.snapToGuides}
                onChange={(e) => onConfigChange({ ...config, snapToGuides: e.target.checked })}
                className="rounded"
              />
              <label htmlFor="snapToGuides" className="text-sm text-gray-700">Snap to Guides</label>
            </div>
          </div>
        </div>
      )}

      {/* Rulers */}
      <div className="absolute inset-0 pointer-events-none">
        {/* Horizontal Ruler */}
        <div className="absolute top-0 left-0 right-0">
          {renderHorizontalRuler()}
        </div>
        
        {/* Vertical Ruler */}
        <div className="absolute top-0 left-0 bottom-0">
          {renderVerticalRuler()}
        </div>
        
        {/* Grid */}
        {renderGrid()}
      </div>
    </div>
  );
};

export default Rulers;
