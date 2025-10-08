'use client';

import React, { useState, useRef, useEffect, useCallback, forwardRef, useImperativeHandle } from 'react';
import { Grid3X3, Ruler, Eye, EyeOff, Settings, Square, Circle, ArrowUp, ArrowDown, ArrowLeft, ArrowRight, Lock, Unlock, Zap, Move, RotateCw, AlignLeft, AlignCenter, AlignRight, AlignJustify } from 'lucide-react';

// Types
export interface GridConfig {
  enabled: boolean;
  size: number;
  color: string;
  opacity: number;
  snapToGrid: boolean;
  snapThreshold: number;
  showGrid: boolean;
  showRulers: boolean;
  showGuides: boolean;
  showMeasurements: boolean;
  gridType: 'lines' | 'dots' | 'crosses';
  majorGridSize: number; // every N lines is a major grid line
  majorGridColor: string;
  majorGridOpacity: number;
}

export interface Guide {
  id: string;
  type: 'horizontal' | 'vertical';
  position: number;
  color: string;
  opacity: number;
  locked: boolean;
  name?: string;
}

export interface Measurement {
  id: string;
  startX: number;
  startY: number;
  endX: number;
  endY: number;
  distance: number;
  angle: number;
  color: string;
  opacity: number;
  showDistance: boolean;
  showAngle: boolean;
}

export interface GridSystemProps {
  canvasWidth: number;
  canvasHeight: number;
  zoom: number;
  panX: number;
  panY: number;
  onSnapToGrid: (x: number, y: number) => { x: number; y: number };
  onSnapToGuides: (x: number, y: number) => { x: number; y: number };
  onSnapToElements: (x: number, y: number) => { x: number; y: number };
  onGridConfigChange: (config: Partial<GridConfig>) => void;
  onGuideAdd: (guide: Omit<Guide, 'id'>) => void;
  onGuideRemove: (guideId: string) => void;
  onGuideUpdate: (guideId: string, updates: Partial<Guide>) => void;
  onMeasurementAdd: (measurement: Omit<Measurement, 'id'>) => void;
  onMeasurementRemove: (measurementId: string) => void;
  onMeasurementUpdate: (measurementId: string, updates: Partial<Measurement>) => void;
}

export interface GridSystemRef {
  snapToGrid: (x: number, y: number) => { x: number; y: number };
  snapToGuides: (x: number, y: number) => { x: number; y: number };
  snapToElements: (x: number, y: number) => { x: number; y: number };
  addGuide: (type: 'horizontal' | 'vertical', position: number) => void;
  removeGuide: (guideId: string) => void;
  addMeasurement: (startX: number, startY: number, endX: number, endY: number) => void;
  removeMeasurement: (measurementId: string) => void;
  toggleGrid: () => void;
  toggleRulers: () => void;
  toggleGuides: () => void;
  toggleMeasurements: () => void;
  setGridSize: (size: number) => void;
  setSnapThreshold: (threshold: number) => void;
}

const GridSystem = forwardRef<GridSystemRef, GridSystemProps>(({
  canvasWidth,
  canvasHeight,
  zoom,
  panX,
  panY,
  onSnapToGrid,
  onSnapToGuides,
  onSnapToElements,
  onGridConfigChange,
  onGuideAdd,
  onGuideRemove,
  onGuideUpdate,
  onMeasurementAdd,
  onMeasurementRemove,
  onMeasurementUpdate
}, ref) => {
  // Grid state
  const [gridConfig, setGridConfig] = useState<GridConfig>({
    enabled: true,
    size: 20,
    color: '#333333',
    opacity: 0.5,
    snapToGrid: true,
    snapThreshold: 10,
    showGrid: true,
    showRulers: true,
    showGuides: true,
    showMeasurements: true,
    gridType: 'lines',
    majorGridSize: 5,
    majorGridColor: '#666666',
    majorGridOpacity: 0.8
  });

  // Guides state
  const [guides, setGuides] = useState<Guide[]>([]);
  const [isDraggingGuide, setIsDraggingGuide] = useState<string | null>(null);
  const [dragStartPosition, setDragStartPosition] = useState<number>(0);

  // Measurements state
  const [measurements, setMeasurements] = useState<Measurement[]>([]);
  const [isMeasuring, setIsMeasuring] = useState(false);
  const [measureStart, setMeasureStart] = useState<{ x: number; y: number } | null>(null);

  // UI state
  const [showSettings, setShowSettings] = useState(false);
  const [showGuidesPanel, setShowGuidesPanel] = useState(false);
  const [showMeasurementsPanel, setShowMeasurementsPanel] = useState(false);

  // Refs
  const gridCanvasRef = useRef<HTMLCanvasElement>(null);
  const rulersRef = useRef<HTMLDivElement>(null);

  // Expose methods to parent
  useImperativeHandle(ref, () => ({
    snapToGrid: (x: number, y: number) => {
      if (!gridConfig.snapToGrid) return { x, y };
      
      const gridSize = gridConfig.size;
      const threshold = gridConfig.snapThreshold;
      
      const snappedX = Math.round(x / gridSize) * gridSize;
      const snappedY = Math.round(y / gridSize) * gridSize;
      
      // Only snap if within threshold
      if (Math.abs(x - snappedX) < threshold && Math.abs(y - snappedY) < threshold) {
        return { x: snappedX, y: snappedY };
      }
      
      return { x, y };
    },
    snapToGuides: (x: number, y: number) => {
      if (!gridConfig.showGuides) return { x, y };
      
      const threshold = gridConfig.snapThreshold;
      let snappedX = x;
      let snappedY = y;
      
      guides.forEach(guide => {
        if (guide.type === 'vertical' && Math.abs(x - guide.position) < threshold) {
          snappedX = guide.position;
        } else if (guide.type === 'horizontal' && Math.abs(y - guide.position) < threshold) {
          snappedY = guide.position;
        }
      });
      
      return { x: snappedX, y: snappedY };
    },
    snapToElements: (x: number, y: number) => {
      // This would implement element snapping logic
      // For now, return original coordinates
      return { x, y };
    },
    addGuide: (type: 'horizontal' | 'vertical', position: number) => {
      const guide: Omit<Guide, 'id'> = {
        type,
        position,
        color: '#00ff00',
        opacity: 0.8,
        locked: false
      };
      onGuideAdd(guide);
    },
    removeGuide: (guideId: string) => {
      onGuideRemove(guideId);
    },
    addMeasurement: (startX: number, startY: number, endX: number, endY: number) => {
      const distance = Math.sqrt(Math.pow(endX - startX, 2) + Math.pow(endY - startY, 2));
      const angle = Math.atan2(endY - startY, endX - startX) * (180 / Math.PI);
      
      const measurement: Omit<Measurement, 'id'> = {
        startX,
        startY,
        endX,
        endY,
        distance,
        angle,
        color: '#ff0000',
        opacity: 0.8,
        showDistance: true,
        showAngle: true
      };
      onMeasurementAdd(measurement);
    },
    removeMeasurement: (measurementId: string) => {
      onMeasurementRemove(measurementId);
    },
    toggleGrid: () => {
      setGridConfig(prev => ({ ...prev, showGrid: !prev.showGrid }));
    },
    toggleRulers: () => {
      setGridConfig(prev => ({ ...prev, showRulers: !prev.showRulers }));
    },
    toggleGuides: () => {
      setGridConfig(prev => ({ ...prev, showGuides: !prev.showGuides }));
    },
    toggleMeasurements: () => {
      setGridConfig(prev => ({ ...prev, showMeasurements: !prev.showMeasurements }));
    },
    setGridSize: (size: number) => {
      setGridConfig(prev => ({ ...prev, size }));
    },
    setSnapThreshold: (threshold: number) => {
      setGridConfig(prev => ({ ...prev, snapThreshold: threshold }));
    }
  }));

  // Draw grid on canvas
  const drawGrid = useCallback(() => {
    const canvas = gridCanvasRef.current;
    if (!canvas || !gridConfig.showGrid) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas size
    canvas.width = canvasWidth;
    canvas.height = canvasHeight;

    // Clear canvas
    ctx.clearRect(0, 0, canvasWidth, canvasHeight);

    // Set grid properties
    ctx.strokeStyle = gridConfig.color;
    ctx.globalAlpha = gridConfig.opacity;
    ctx.lineWidth = 1;

    // Draw grid lines
    if (gridConfig.gridType === 'lines') {
      // Vertical lines
      for (let x = 0; x <= canvasWidth; x += gridConfig.size) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, canvasHeight);
        ctx.stroke();
      }

      // Horizontal lines
      for (let y = 0; y <= canvasHeight; y += gridConfig.size) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(canvasWidth, y);
        ctx.stroke();
      }
    } else if (gridConfig.gridType === 'dots') {
      // Draw dots
      ctx.fillStyle = gridConfig.color;
      for (let x = 0; x <= canvasWidth; x += gridConfig.size) {
        for (let y = 0; y <= canvasHeight; y += gridConfig.size) {
          ctx.beginPath();
          ctx.arc(x, y, 1, 0, 2 * Math.PI);
          ctx.fill();
        }
      }
    }

    // Draw major grid lines
    if (gridConfig.majorGridSize > 1) {
      ctx.strokeStyle = gridConfig.majorGridColor;
      ctx.globalAlpha = gridConfig.majorGridOpacity;
      ctx.lineWidth = 2;

      // Major vertical lines
      for (let x = 0; x <= canvasWidth; x += gridConfig.size * gridConfig.majorGridSize) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, canvasHeight);
        ctx.stroke();
      }

      // Major horizontal lines
      for (let y = 0; y <= canvasHeight; y += gridConfig.size * gridConfig.majorGridSize) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(canvasWidth, y);
        ctx.stroke();
      }
    }

    // Reset alpha
    ctx.globalAlpha = 1;
  }, [canvasWidth, canvasHeight, gridConfig]);

  // Draw guides
  const drawGuides = useCallback(() => {
    const canvas = gridCanvasRef.current;
    if (!canvas || !gridConfig.showGuides) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    guides.forEach(guide => {
      ctx.strokeStyle = guide.color;
      ctx.globalAlpha = guide.opacity;
      ctx.lineWidth = 2;

      if (guide.type === 'vertical') {
        ctx.beginPath();
        ctx.moveTo(guide.position, 0);
        ctx.lineTo(guide.position, canvasHeight);
        ctx.stroke();
      } else {
        ctx.beginPath();
        ctx.moveTo(0, guide.position);
        ctx.lineTo(canvasWidth, guide.position);
        ctx.stroke();
      }
    });

    ctx.globalAlpha = 1;
  }, [guides, gridConfig.showGuides, canvasWidth, canvasHeight]);

  // Draw measurements
  const drawMeasurements = useCallback(() => {
    const canvas = gridCanvasRef.current;
    if (!canvas || !gridConfig.showMeasurements) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    measurements.forEach(measurement => {
      ctx.strokeStyle = measurement.color;
      ctx.globalAlpha = measurement.opacity;
      ctx.lineWidth = 2;

      // Draw measurement line
      ctx.beginPath();
      ctx.moveTo(measurement.startX, measurement.startY);
      ctx.lineTo(measurement.endX, measurement.endY);
      ctx.stroke();

      // Draw distance text
      if (measurement.showDistance) {
        const midX = (measurement.startX + measurement.endX) / 2;
        const midY = (measurement.startY + measurement.endY) / 2;
        
        ctx.fillStyle = measurement.color;
        ctx.font = '12px Arial';
        ctx.fillText(`${Math.round(measurement.distance)}px`, midX + 5, midY - 5);
      }

      // Draw angle text
      if (measurement.showAngle) {
        const angleX = measurement.endX + 10;
        const angleY = measurement.endY - 10;
        
        ctx.fillStyle = measurement.color;
        ctx.font = '12px Arial';
        ctx.fillText(`${Math.round(measurement.angle)}°`, angleX, angleY);
      }
    });

    ctx.globalAlpha = 1;
  }, [measurements, gridConfig.showMeasurements]);

  // Handle grid config change
  const handleGridConfigChange = useCallback((updates: Partial<GridConfig>) => {
    setGridConfig(prev => ({ ...prev, ...updates }));
    onGridConfigChange(updates);
  }, [onGridConfigChange]);

  // Handle guide addition
  const handleGuideAdd = useCallback((type: 'horizontal' | 'vertical', position: number) => {
    const guide: Omit<Guide, 'id'> = {
      type,
      position,
      color: '#00ff00',
      opacity: 0.8,
      locked: false
    };
    onGuideAdd(guide);
  }, [onGuideAdd]);

  // Handle guide removal
  const handleGuideRemove = useCallback((guideId: string) => {
    onGuideRemove(guideId);
  }, [onGuideRemove]);

  // Handle measurement addition
  const handleMeasurementAdd = useCallback((startX: number, startY: number, endX: number, endY: number) => {
    const distance = Math.sqrt(Math.pow(endX - startX, 2) + Math.pow(endY - startY, 2));
    const angle = Math.atan2(endY - startY, endX - startX) * (180 / Math.PI);
    
    const measurement: Omit<Measurement, 'id'> = {
      startX,
      startY,
      endX,
      endY,
      distance,
      angle,
      color: '#ff0000',
      opacity: 0.8,
      showDistance: true,
      showAngle: true
    };
    onMeasurementAdd(measurement);
  }, [onMeasurementAdd]);

  // Handle measurement removal
  const handleMeasurementRemove = useCallback((measurementId: string) => {
    onMeasurementRemove(measurementId);
  }, [onMeasurementRemove]);

  // Redraw grid when config changes
  useEffect(() => {
    drawGrid();
    drawGuides();
    drawMeasurements();
  }, [drawGrid, drawGuides, drawMeasurements]);

  return (
    <div className="grid-system">
      {/* Grid Canvas */}
      <canvas
        ref={gridCanvasRef}
        className="absolute inset-0 pointer-events-none"
        style={{ zIndex: 1 }}
      />

      {/* Rulers */}
      {gridConfig.showRulers && (
        <div ref={rulersRef} className="absolute inset-0 pointer-events-none" style={{ zIndex: 2 }}>
          {/* Top ruler */}
          <div className="absolute top-0 left-0 w-full h-6 bg-gray-800 border-b border-gray-600">
            <div className="relative w-full h-full">
              {Array.from({ length: Math.ceil(canvasWidth / gridConfig.size) }, (_, i) => (
                <div
                  key={i}
                  className="absolute top-0 h-full border-l border-gray-500"
                  style={{ left: i * gridConfig.size }}
                >
                  <span className="absolute -top-4 left-1 text-xs text-gray-400">
                    {i * gridConfig.size}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Left ruler */}
          <div className="absolute top-0 left-0 w-6 h-full bg-gray-800 border-r border-gray-600">
            <div className="relative w-full h-full">
              {Array.from({ length: Math.ceil(canvasHeight / gridConfig.size) }, (_, i) => (
                <div
                  key={i}
                  className="absolute left-0 w-full border-t border-gray-500"
                  style={{ top: i * gridConfig.size }}
                >
                  <span className="absolute -left-4 top-1 text-xs text-gray-400">
                    {i * gridConfig.size}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Grid Controls */}
      <div className="absolute top-4 right-4 z-10">
        <div className="flex items-center space-x-2 bg-gray-800 rounded-lg p-2">
          <button
            className={`p-2 rounded ${gridConfig.showGrid ? 'bg-blue-600' : 'bg-gray-600'}`}
            onClick={() => handleGridConfigChange({ showGrid: !gridConfig.showGrid })}
            title="Toggle Grid"
          >
            <Grid3X3 className="w-4 h-4" />
          </button>
          <button
            className={`p-2 rounded ${gridConfig.showRulers ? 'bg-blue-600' : 'bg-gray-600'}`}
            onClick={() => handleGridConfigChange({ showRulers: !gridConfig.showRulers })}
            title="Toggle Rulers"
          >
            <Ruler className="w-4 h-4" />
          </button>
          <button
            className={`p-2 rounded ${gridConfig.showGuides ? 'bg-blue-600' : 'bg-gray-600'}`}
            onClick={() => handleGridConfigChange({ showGuides: !gridConfig.showGuides })}
            title="Toggle Guides"
          >
            <Eye className="w-4 h-4" />
          </button>
          <button
            className={`p-2 rounded ${gridConfig.showMeasurements ? 'bg-blue-600' : 'bg-gray-600'}`}
            onClick={() => handleGridConfigChange({ showMeasurements: !gridConfig.showMeasurements })}
            title="Toggle Measurements"
          >
            <Zap className="w-4 h-4" />
          </button>
          <button
            className="p-2 rounded bg-gray-600 hover:bg-gray-500"
            onClick={() => setShowSettings(!showSettings)}
            title="Grid Settings"
          >
            <Settings className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Grid Settings Panel */}
      {showSettings && (
        <div className="absolute top-16 right-4 z-10 bg-gray-800 rounded-lg p-4 min-w-64">
          <h3 className="text-lg font-semibold text-white mb-4">Grid Settings</h3>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Grid Size</label>
              <input
                type="range"
                min="5"
                max="50"
                step="5"
                value={gridConfig.size}
                onChange={(e) => handleGridConfigChange({ size: parseInt(e.target.value) })}
                className="w-full"
              />
              <span className="text-xs text-gray-400">{gridConfig.size}px</span>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Snap Threshold</label>
              <input
                type="range"
                min="1"
                max="20"
                step="1"
                value={gridConfig.snapThreshold}
                onChange={(e) => handleGridConfigChange({ snapThreshold: parseInt(e.target.value) })}
                className="w-full"
              />
              <span className="text-xs text-gray-400">{gridConfig.snapThreshold}px</span>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Grid Type</label>
              <select
                value={gridConfig.gridType}
                onChange={(e) => handleGridConfigChange({ gridType: e.target.value as GridConfig['gridType'] })}
                className="w-full p-2 bg-gray-600 rounded text-sm"
              >
                <option value="lines">Lines</option>
                <option value="dots">Dots</option>
                <option value="crosses">Crosses</option>
              </select>
            </div>

            <div className="flex items-center">
              <input
                type="checkbox"
                checked={gridConfig.snapToGrid}
                onChange={(e) => handleGridConfigChange({ snapToGrid: e.target.checked })}
                className="mr-2"
              />
              <label className="text-sm text-gray-300">Snap to Grid</label>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Grid Color</label>
              <input
                type="color"
                value={gridConfig.color}
                onChange={(e) => handleGridConfigChange({ color: e.target.value })}
                className="w-full h-8 rounded border border-gray-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Grid Opacity</label>
              <input
                type="range"
                min="0"
                max="1"
                step="0.1"
                value={gridConfig.opacity}
                onChange={(e) => handleGridConfigChange({ opacity: parseFloat(e.target.value) })}
                className="w-full"
              />
              <span className="text-xs text-gray-400">{Math.round(gridConfig.opacity * 100)}%</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
});

GridSystem.displayName = 'GridSystem';

export default GridSystem;
