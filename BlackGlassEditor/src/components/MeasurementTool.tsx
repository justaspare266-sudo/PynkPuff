/**
 * Professional Measurement Tool
 * Precise distance, angle, and area measurements
 */

import React, { useState, useCallback, useRef, useEffect } from 'react';
import { 
  Ruler, 
  RotateCcw, 
  Trash2, 
  Copy, 
  Check,
  Settings,
  Eye,
  EyeOff,
  Download,
  Save
} from 'lucide-react';

export interface Measurement {
  id: string;
  type: 'distance' | 'angle' | 'area' | 'radius';
  startX: number;
  startY: number;
  endX: number;
  endY: number;
  centerX?: number;
  centerY?: number;
  radius?: number;
  angle?: number;
  distance?: number;
  area?: number;
  label?: string;
  color: string;
  visible: boolean;
  locked: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface MeasurementConfig {
  showMeasurements: boolean;
  showLabels: boolean;
  showValues: boolean;
  unit: 'px' | 'mm' | 'cm' | 'in' | 'pt';
  precision: number;
  measurementColor: string;
  labelColor: string;
  backgroundColor: string;
  fontSize: number;
  lineWidth: number;
  snapToGrid: boolean;
  snapToGuides: boolean;
  autoLabel: boolean;
  showAngles: boolean;
  showAreas: boolean;
}

export interface MeasurementToolProps {
  canvasWidth: number;
  canvasHeight: number;
  zoom: number;
  panX: number;
  panY: number;
  config: MeasurementConfig;
  onConfigChange: (config: MeasurementConfig) => void;
  onMeasurementAdd: (measurement: Measurement) => void;
  onMeasurementUpdate: (id: string, measurement: Partial<Measurement>) => void;
  onMeasurementRemove: (id: string) => void;
  className?: string;
}

const MeasurementTool: React.FC<MeasurementToolProps> = ({
  canvasWidth,
  canvasHeight,
  zoom,
  panX,
  panY,
  config,
  onConfigChange,
  onMeasurementAdd,
  onMeasurementUpdate,
  onMeasurementRemove,
  className = ''
}) => {
  const [activeTool, setActiveTool] = useState<'distance' | 'angle' | 'area' | 'radius' | null>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [currentMeasurement, setCurrentMeasurement] = useState<Partial<Measurement> | null>(null);
  const [measurements, setMeasurements] = useState<Measurement[]>([]);
  const [showSettings, setShowSettings] = useState(false);
  const [copiedMeasurement, setCopiedMeasurement] = useState<string | null>(null);
  
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Unit conversion utilities
  const convertUnits = useCallback((pixels: number, unit: MeasurementConfig['unit']): number => {
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

  // Calculate distance between two points
  const calculateDistance = useCallback((x1: number, y1: number, x2: number, y2: number): number => {
    return Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2));
  }, []);

  // Calculate angle between two points
  const calculateAngle = useCallback((x1: number, y1: number, x2: number, y2: number): number => {
    return Math.atan2(y2 - y1, x2 - x1) * (180 / Math.PI);
  }, []);

  // Calculate area of a polygon
  const calculateArea = useCallback((points: { x: number; y: number }[]): number => {
    if (points.length < 3) return 0;
    
    let area = 0;
    for (let i = 0; i < points.length; i++) {
      const j = (i + 1) % points.length;
      area += points[i].x * points[j].y;
      area -= points[j].x * points[i].y;
    }
    return Math.abs(area) / 2;
  }, []);

  // Handle canvas click
  const handleCanvasClick = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!activeTool) return;
    
    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return;
    
    const x = (e.clientX - rect.left - panX) / zoom;
    const y = (e.clientY - rect.top - panY) / zoom;
    
    if (!isDrawing) {
      // Start new measurement
      setIsDrawing(true);
      setCurrentMeasurement({
        type: activeTool,
        startX: x,
        startY: y,
        endX: x,
        endY: y,
        color: config.measurementColor,
        visible: true,
        locked: false,
        createdAt: new Date(),
        updatedAt: new Date()
      });
    } else {
      // Complete measurement
      if (currentMeasurement) {
        const measurement: Measurement = {
          id: `measurement-${Date.now()}`,
          type: currentMeasurement.type!,
          startX: currentMeasurement.startX!,
          startY: currentMeasurement.startY!,
          endX: x,
          endY: y,
          color: currentMeasurement.color!,
          visible: true,
          locked: false,
          createdAt: new Date(),
          updatedAt: new Date()
        };
        
        // Calculate measurements based on type
        switch (measurement.type) {
          case 'distance':
            measurement.distance = calculateDistance(measurement.startX, measurement.startY, measurement.endX, measurement.endY);
            measurement.label = formatMeasurement(measurement.distance);
            break;
          case 'angle':
            measurement.angle = calculateAngle(measurement.startX, measurement.startY, measurement.endX, measurement.endY);
            measurement.label = `${measurement.angle.toFixed(1)}°`;
            break;
          case 'area':
            // For area, we need to collect multiple points
            break;
          case 'radius':
            measurement.radius = calculateDistance(measurement.startX, measurement.startY, measurement.endX, measurement.endY);
            measurement.centerX = measurement.startX;
            measurement.centerY = measurement.startY;
            measurement.label = formatMeasurement(measurement.radius);
            break;
        }
        
        onMeasurementAdd(measurement);
        setMeasurements(prev => [...prev, measurement]);
      }
      
      setIsDrawing(false);
      setCurrentMeasurement(null);
    }
  }, [activeTool, isDrawing, currentMeasurement, panX, panY, zoom, config.measurementColor, calculateDistance, calculateAngle, formatMeasurement, onMeasurementAdd]);

  // Handle canvas mouse move
  const handleCanvasMouseMove = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing || !currentMeasurement) return;
    
    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return;
    
    const x = (e.clientX - rect.left - panX) / zoom;
    const y = (e.clientY - rect.top - panY) / zoom;
    
    setCurrentMeasurement(prev => prev ? { ...prev, endX: x, endY: y } : null);
  }, [isDrawing, currentMeasurement, panX, panY, zoom]);

  // Handle measurement double-click to edit
  const handleMeasurementDoubleClick = useCallback((measurement: Measurement) => {
    const newLabel = prompt('Enter new label:', measurement.label || '');
    if (newLabel !== null) {
      onMeasurementUpdate(measurement.id, { label: newLabel });
      setMeasurements(prev => prev.map(m => 
        m.id === measurement.id ? { ...m, label: newLabel } : m
      ));
    }
  }, [onMeasurementUpdate]);

  // Handle measurement copy
  const handleMeasurementCopy = useCallback((measurement: Measurement) => {
    const data = {
      type: measurement.type,
      distance: measurement.distance,
      angle: measurement.angle,
      area: measurement.area,
      radius: measurement.radius,
      label: measurement.label,
      value: measurement.label
    };
    
    navigator.clipboard.writeText(JSON.stringify(data, null, 2));
    setCopiedMeasurement(measurement.id);
    setTimeout(() => setCopiedMeasurement(null), 2000);
  }, []);

  // Clear all measurements
  const clearAllMeasurements = useCallback(() => {
    measurements.forEach(measurement => onMeasurementRemove(measurement.id));
    setMeasurements([]);
  }, [measurements, onMeasurementRemove]);

  // Export measurements
  const exportMeasurements = useCallback(() => {
    const data = {
      measurements: measurements.map(m => ({
        type: m.type,
        distance: m.distance,
        angle: m.angle,
        area: m.area,
        radius: m.radius,
        label: m.label,
        startX: m.startX,
        startY: m.startY,
        endX: m.endX,
        endY: m.endY
      })),
      config: {
        unit: config.unit,
        precision: config.precision
      }
    };
    
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'measurements.json';
    a.click();
    URL.revokeObjectURL(url);
  }, [measurements, config]);

  // Render measurement on canvas
  const renderMeasurement = useCallback((measurement: Measurement, ctx: CanvasRenderingContext2D) => {
    if (!measurement.visible) return;
    
    ctx.save();
    ctx.strokeStyle = measurement.color;
    ctx.fillStyle = measurement.color;
    ctx.lineWidth = config.lineWidth;
    ctx.font = `${config.fontSize}px Arial`;
    
    const startX = (measurement.startX + panX) * zoom;
    const startY = (measurement.startY + panY) * zoom;
    const endX = (measurement.endX + panX) * zoom;
    const endY = (measurement.endY + panY) * zoom;
    
    switch (measurement.type) {
      case 'distance':
        // Draw line
        ctx.beginPath();
        ctx.moveTo(startX, startY);
        ctx.lineTo(endX, endY);
        ctx.stroke();
        
        // Draw arrowheads
        const angle = Math.atan2(endY - startY, endX - startX);
        const arrowLength = 10;
        const arrowAngle = Math.PI / 6;
        
        ctx.beginPath();
        ctx.moveTo(endX, endY);
        ctx.lineTo(
          endX - arrowLength * Math.cos(angle - arrowAngle),
          endY - arrowLength * Math.sin(angle - arrowAngle)
        );
        ctx.moveTo(endX, endY);
        ctx.lineTo(
          endX - arrowLength * Math.cos(angle + arrowAngle),
          endY - arrowLength * Math.sin(angle + arrowAngle)
        );
        ctx.stroke();
        
        // Draw label
        if (config.showLabels && measurement.label) {
          const midX = (startX + endX) / 2;
          const midY = (startY + endY) / 2;
          ctx.fillStyle = config.labelColor;
          ctx.fillRect(midX - 2, midY - 2, 4, 4);
          ctx.fillStyle = config.backgroundColor;
          ctx.fillRect(midX - ctx.measureText(measurement.label).width / 2 - 2, midY - config.fontSize - 2, ctx.measureText(measurement.label).width + 4, config.fontSize + 4);
          ctx.fillStyle = config.labelColor;
          ctx.fillText(measurement.label, midX - ctx.measureText(measurement.label).width / 2, midY - 2);
        }
        break;
        
      case 'angle':
        // Draw angle arc
        const centerX = startX;
        const centerY = startY;
        const radius = 50;
        
        ctx.beginPath();
        ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
        ctx.stroke();
        
        // Draw angle lines
        ctx.beginPath();
        ctx.moveTo(centerX, centerY);
        ctx.lineTo(endX, endY);
        ctx.stroke();
        
        // Draw label
        if (config.showLabels && measurement.label) {
          ctx.fillStyle = config.backgroundColor;
          ctx.fillRect(endX - ctx.measureText(measurement.label).width / 2 - 2, endY - config.fontSize - 2, ctx.measureText(measurement.label).width + 4, config.fontSize + 4);
          ctx.fillStyle = config.labelColor;
          ctx.fillText(measurement.label, endX - ctx.measureText(measurement.label).width / 2, endY - 2);
        }
        break;
        
      case 'radius':
        if (measurement.centerX && measurement.centerY && measurement.radius) {
          const centerX = (measurement.centerX + panX) * zoom;
          const centerY = (measurement.centerY + panY) * zoom;
          const radius = measurement.radius * zoom;
          
          // Draw circle
          ctx.beginPath();
          ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
          ctx.stroke();
          
          // Draw radius line
          ctx.beginPath();
          ctx.moveTo(centerX, centerY);
          ctx.lineTo(endX, endY);
          ctx.stroke();
          
          // Draw label
          if (config.showLabels && measurement.label) {
            ctx.fillStyle = config.backgroundColor;
            ctx.fillRect(endX - ctx.measureText(measurement.label).width / 2 - 2, endY - config.fontSize - 2, ctx.measureText(measurement.label).width + 4, config.fontSize + 4);
            ctx.fillStyle = config.labelColor;
            ctx.fillText(measurement.label, endX - ctx.measureText(measurement.label).width / 2, endY - 2);
          }
        }
        break;
    }
    
    ctx.restore();
  }, [config, panX, panY, zoom]);

  // Draw current measurement
  const drawCurrentMeasurement = useCallback((ctx: CanvasRenderingContext2D) => {
    if (!currentMeasurement || !isDrawing) return;
    
    ctx.save();
    ctx.strokeStyle = config.measurementColor;
    ctx.fillStyle = config.measurementColor;
    ctx.lineWidth = config.lineWidth;
    ctx.setLineDash([5, 5]);
    
    const startX = (currentMeasurement.startX! + panX) * zoom;
    const startY = (currentMeasurement.startY! + panY) * zoom;
    const endX = (currentMeasurement.endX! + panX) * zoom;
    const endY = (currentMeasurement.endY! + panY) * zoom;
    
    ctx.beginPath();
    ctx.moveTo(startX, startY);
    ctx.lineTo(endX, endY);
    ctx.stroke();
    
    ctx.restore();
  }, [currentMeasurement, isDrawing, config, panX, panY, zoom]);

  // Redraw canvas
  const redrawCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Draw measurements
    measurements.forEach(measurement => renderMeasurement(measurement, ctx));
    
    // Draw current measurement
    drawCurrentMeasurement(ctx);
  }, [measurements, renderMeasurement, drawCurrentMeasurement]);

  // Update canvas size
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    canvas.width = canvasWidth * zoom;
    canvas.height = canvasHeight * zoom;
    redrawCanvas();
  }, [canvasWidth, canvasHeight, zoom, redrawCanvas]);

  // Redraw when measurements change
  useEffect(() => {
    redrawCanvas();
  }, [measurements, currentMeasurement, isDrawing, redrawCanvas]);

  return (
    <div className={`relative ${className}`}>
      {/* Tool Controls */}
      <div className="absolute top-2 left-2 z-20 flex items-center space-x-2">
        <button
          onClick={() => setActiveTool(activeTool === 'distance' ? null : 'distance')}
          className={`p-2 rounded ${activeTool === 'distance' ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-600'}`}
          title="Distance Measurement"
        >
          <Ruler size={16} />
        </button>
        <button
          onClick={() => setActiveTool(activeTool === 'angle' ? null : 'angle')}
          className={`p-2 rounded ${activeTool === 'angle' ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-600'}`}
          title="Angle Measurement"
        >
          <RotateCcw size={16} />
        </button>
        <button
          onClick={() => setActiveTool(activeTool === 'area' ? null : 'area')}
          className={`p-2 rounded ${activeTool === 'area' ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-600'}`}
          title="Area Measurement"
        >
          <Settings size={16} />
        </button>
        <button
          onClick={() => setActiveTool(activeTool === 'radius' ? null : 'radius')}
          className={`p-2 rounded ${activeTool === 'radius' ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-600'}`}
          title="Radius Measurement"
        >
          <Settings size={16} />
        </button>
        <button
          onClick={() => setShowSettings(!showSettings)}
          className="p-2 rounded bg-gray-100 text-gray-600 hover:bg-gray-200"
          title="Measurement Settings"
        >
          <Settings size={16} />
        </button>
        <button
          onClick={clearAllMeasurements}
          className="p-2 rounded bg-gray-100 text-gray-600 hover:bg-gray-200"
          title="Clear All Measurements"
        >
          <Trash2 size={16} />
        </button>
        <button
          onClick={exportMeasurements}
          className="p-2 rounded bg-gray-100 text-gray-600 hover:bg-gray-200"
          title="Export Measurements"
        >
          <Download size={16} />
        </button>
      </div>

      {/* Settings Panel */}
      {showSettings && (
        <div className="absolute top-12 left-2 z-30 bg-white rounded-lg shadow-xl border border-gray-200 p-4 w-64">
          <h4 className="font-semibold mb-3">Measurement Settings</h4>
          
          <div className="space-y-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Unit</label>
              <select
                value={config.unit}
                onChange={(e) => onConfigChange({ ...config, unit: e.target.value as MeasurementConfig['unit'] })}
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
                onChange={(e) => onConfigChange({ ...config, precision: parseInt(e.target.value) })}
                className="w-full px-3 py-2 border border-gray-300 rounded text-sm"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Line Width</label>
              <input
                type="range"
                min="1"
                max="5"
                value={config.lineWidth}
                onChange={(e) => onConfigChange({ ...config, lineWidth: parseInt(e.target.value) })}
                className="w-full"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Font Size</label>
              <input
                type="range"
                min="10"
                max="20"
                value={config.fontSize}
                onChange={(e) => onConfigChange({ ...config, fontSize: parseInt(e.target.value) })}
                className="w-full"
              />
            </div>
            
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="showLabels"
                checked={config.showLabels}
                onChange={(e) => onConfigChange({ ...config, showLabels: e.target.checked })}
                className="rounded"
              />
              <label htmlFor="showLabels" className="text-sm text-gray-700">Show Labels</label>
            </div>
            
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="showValues"
                checked={config.showValues}
                onChange={(e) => onConfigChange({ ...config, showValues: e.target.checked })}
                className="rounded"
              />
              <label htmlFor="showValues" className="text-sm text-gray-700">Show Values</label>
            </div>
          </div>
        </div>
      )}

      {/* Measurements List */}
      <div className="absolute top-2 right-2 z-20 bg-white rounded-lg shadow-lg border border-gray-200 p-3 max-w-64">
        <h4 className="font-semibold mb-2">Measurements</h4>
        <div className="space-y-1 max-h-48 overflow-y-auto">
          {measurements.map(measurement => (
            <div
              key={measurement.id}
              className="flex items-center justify-between p-2 bg-gray-50 rounded text-sm"
            >
              <div className="flex items-center space-x-2">
                <div
                  className="w-3 h-3 rounded"
                  style={{ backgroundColor: measurement.color }}
                />
                <span>{measurement.label || `${measurement.type} measurement`}</span>
              </div>
              <div className="flex items-center space-x-1">
                <button
                  onClick={() => handleMeasurementCopy(measurement)}
                  className="p-1 text-gray-500 hover:text-gray-700"
                  title="Copy measurement"
                >
                  {copiedMeasurement === measurement.id ? <Check size={12} /> : <Copy size={12} />}
                </button>
                <button
                  onClick={() => onMeasurementRemove(measurement.id)}
                  className="p-1 text-gray-500 hover:text-gray-700"
                  title="Remove measurement"
                >
                  <Trash2 size={12} />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Canvas */}
      <canvas
        ref={canvasRef}
        className="absolute inset-0 pointer-events-auto"
        style={{
          transform: `translate(${panX}px, ${panY}px) scale(${zoom})`,
          transformOrigin: 'left top'
        }}
        onClick={handleCanvasClick}
        onMouseMove={handleCanvasMouseMove}
      />
    </div>
  );
};

export default MeasurementTool;
