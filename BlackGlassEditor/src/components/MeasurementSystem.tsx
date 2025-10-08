/**
 * Comprehensive Measurement System
 * Integrates rulers, guides, and measurement tools
 */

import React, { useState, useCallback, useRef, useEffect } from 'react';
import { 
  Ruler, 
  Settings, 
  Eye, 
  EyeOff, 
  RotateCcw,
  Download,
  Upload,
  Save,
  Trash2,
  Copy,
  Check,
  Maximize2,
  Minimize2,
  X
} from 'lucide-react';
import Rulers, { RulerConfig } from './Rulers';
import MeasurementTool, { Measurement, MeasurementConfig } from './MeasurementTool';

export interface MeasurementSystemProps {
  canvasWidth: number;
  canvasHeight: number;
  zoom: number;
  panX: number;
  panY: number;
  onClose?: () => void;
  className?: string;
}

const MeasurementSystem: React.FC<MeasurementSystemProps> = ({
  canvasWidth,
  canvasHeight,
  zoom,
  panX,
  panY,
  onClose,
  className = ''
}) => {
  const [activeTab, setActiveTab] = useState<'rulers' | 'measurements' | 'guides' | 'settings'>('rulers');
  const [showSystem, setShowSystem] = useState(true);
  const [measurements, setMeasurements] = useState<Measurement[]>([]);
  const [guides, setGuides] = useState<Array<{ id: string; type: 'horizontal' | 'vertical'; position: number }>>([]);
  const [copiedData, setCopiedData] = useState<string | null>(null);
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Ruler configuration
  const [rulerConfig, setRulerConfig] = useState<RulerConfig>({
    showRulers: true,
    showGuides: true,
    showMeasurements: true,
    unit: 'px',
    precision: 1,
    rulerSize: 30,
    guideColor: '#ff0000',
    measurementColor: '#00ff00',
    rulerColor: '#333333',
    rulerBackground: '#f8f9fa',
    fontSize: 12,
    showGrid: true,
    gridSize: 20,
    snapToGrid: true,
    snapToGuides: true
  });

  // Measurement configuration
  const [measurementConfig, setMeasurementConfig] = useState<MeasurementConfig>({
    showMeasurements: true,
    showLabels: true,
    showValues: true,
    unit: 'px',
    precision: 1,
    measurementColor: '#00ff00',
    labelColor: '#333333',
    backgroundColor: '#ffffff',
    fontSize: 12,
    lineWidth: 2,
    snapToGrid: true,
    snapToGuides: true,
    autoLabel: true,
    showAngles: true,
    showAreas: true
  });

  // Handle measurement add
  const handleMeasurementAdd = useCallback((measurement: Measurement) => {
    setMeasurements(prev => [...prev, measurement]);
  }, []);

  // Handle measurement update
  const handleMeasurementUpdate = useCallback((id: string, updates: Partial<Measurement>) => {
    setMeasurements(prev => prev.map(m => 
      m.id === id ? { ...m, ...updates } : m
    ));
  }, []);

  // Handle measurement remove
  const handleMeasurementRemove = useCallback((id: string) => {
    setMeasurements(prev => prev.filter(m => m.id !== id));
  }, []);

  // Handle guide add
  const handleGuideAdd = useCallback((guide: { id: string; type: 'horizontal' | 'vertical'; position: number }) => {
    setGuides(prev => [...prev, guide]);
  }, []);

  // Handle guide remove
  const handleGuideRemove = useCallback((id: string) => {
    setGuides(prev => prev.filter(g => g.id !== id));
  }, []);

  // Handle guide move
  const handleGuideMove = useCallback((id: string, position: number) => {
    setGuides(prev => prev.map(g => 
      g.id === id ? { ...g, position } : g
    ));
  }, []);

  // Clear all data
  const clearAllData = useCallback(() => {
    setMeasurements([]);
    setGuides([]);
  }, []);

  // Export data
  const exportData = useCallback(() => {
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
        endY: m.endY,
        color: m.color,
        visible: m.visible
      })),
      guides: guides.map(g => ({
        type: g.type,
        position: g.position
      })),
      rulerConfig,
      measurementConfig,
      canvasWidth,
      canvasHeight,
      zoom,
      panX,
      panY,
      exportedAt: new Date().toISOString()
    };
    
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'measurement-data.json';
    a.click();
    URL.revokeObjectURL(url);
  }, [measurements, guides, rulerConfig, measurementConfig, canvasWidth, canvasHeight, zoom, panX, panY]);

  // Import data
  const handleImportData = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = JSON.parse(e.target?.result as string);
        
        if (data.measurements) {
          setMeasurements(data.measurements.map((m: any) => ({
            ...m,
            id: `measurement-${Date.now()}-${Math.random()}`,
            createdAt: new Date(),
            updatedAt: new Date()
          })));
        }
        
        if (data.guides) {
          setGuides(data.guides.map((g: any) => ({
            ...g,
            id: `guide-${Date.now()}-${Math.random()}`
          })));
        }
        
        if (data.rulerConfig) {
          setRulerConfig(data.rulerConfig);
        }
        
        if (data.measurementConfig) {
          setMeasurementConfig(data.measurementConfig);
        }
      } catch (error) {
        console.error('Failed to import measurement data:', error);
      }
    };
    reader.readAsText(file);
  }, []);

  // Copy data to clipboard
  const copyDataToClipboard = useCallback(() => {
    const data = {
      measurements: measurements.length,
      guides: guides.length,
      rulerConfig: rulerConfig.showRulers ? 'Enabled' : 'Disabled',
      measurementConfig: measurementConfig.showMeasurements ? 'Enabled' : 'Disabled'
    };
    
    navigator.clipboard.writeText(JSON.stringify(data, null, 2));
    setCopiedData('data');
    setTimeout(() => setCopiedData(null), 2000);
  }, [measurements, guides, rulerConfig, measurementConfig]);

  // Toggle system visibility
  const toggleSystem = useCallback(() => {
    setShowSystem(!showSystem);
  }, [showSystem]);

  // Reset to defaults
  const resetToDefaults = useCallback(() => {
    setRulerConfig({
      showRulers: true,
      showGuides: true,
      showMeasurements: true,
      unit: 'px',
      precision: 1,
      rulerSize: 30,
      guideColor: '#ff0000',
      measurementColor: '#00ff00',
      rulerColor: '#333333',
      rulerBackground: '#f8f9fa',
      fontSize: 12,
      showGrid: true,
      gridSize: 20,
      snapToGrid: true,
      snapToGuides: true
    });
    
    setMeasurementConfig({
      showMeasurements: true,
      showLabels: true,
      showValues: true,
      unit: 'px',
      precision: 1,
      measurementColor: '#00ff00',
      labelColor: '#333333',
      backgroundColor: '#ffffff',
      fontSize: 12,
      lineWidth: 2,
      snapToGrid: true,
      snapToGuides: true,
      autoLabel: true,
      showAngles: true,
      showAreas: true
    });
  }, []);

  if (!showSystem) {
    return (
      <div className={`absolute top-2 left-2 z-20 ${className}`}>
        <button
          onClick={toggleSystem}
          className="p-2 bg-blue-600 text-white rounded shadow-lg hover:bg-blue-700"
          title="Show Measurement System"
        >
          <Ruler size={20} />
        </button>
      </div>
    );
  }

  return (
    <div className={`absolute inset-0 z-10 ${className}`}>
      {/* Header */}
      <div className="absolute top-2 left-2 right-2 z-20 bg-white rounded-lg shadow-lg border border-gray-200 p-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <h3 className="text-lg font-semibold flex items-center">
              <Ruler size={20} className="mr-2" />
              Measurement System
            </h3>
            
            {/* Tabs */}
            <div className="flex space-x-1">
              {[
                { id: 'rulers', label: 'Rulers', icon: Ruler },
                { id: 'measurements', label: 'Measurements', icon: Settings },
                { id: 'guides', label: 'Guides', icon: Eye },
                { id: 'settings', label: 'Settings', icon: Settings }
              ].map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`flex items-center space-x-1 px-3 py-1 rounded text-sm ${
                    activeTab === tab.id 
                      ? 'bg-blue-100 text-blue-700' 
                      : 'text-gray-600 hover:text-gray-800'
                  }`}
                >
                  <tab.icon size={14} />
                  <span>{tab.label}</span>
                </button>
              ))}
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <button
              onClick={copyDataToClipboard}
              className="p-2 text-gray-500 hover:text-gray-700"
              title="Copy data"
            >
              {copiedData === 'data' ? <Check size={16} /> : <Copy size={16} />}
            </button>
            <button
              onClick={exportData}
              className="p-2 text-gray-500 hover:text-gray-700"
              title="Export data"
            >
              <Download size={16} />
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept=".json"
              onChange={handleImportData}
              className="hidden"
            />
            <button
              onClick={() => fileInputRef.current?.click()}
              className="p-2 text-gray-500 hover:text-gray-700"
              title="Import data"
            >
              <Upload size={16} />
            </button>
            <button
              onClick={resetToDefaults}
              className="p-2 text-gray-500 hover:text-gray-700"
              title="Reset to defaults"
            >
              <RotateCcw size={16} />
            </button>
            <button
              onClick={clearAllData}
              className="p-2 text-gray-500 hover:text-gray-700"
              title="Clear all data"
            >
              <Trash2 size={16} />
            </button>
            <button
              onClick={toggleSystem}
              className="p-2 text-gray-500 hover:text-gray-700"
              title="Hide system"
            >
              <Minimize2 size={16} />
            </button>
            {onClose && (
              <button
                onClick={onClose}
                className="p-2 text-gray-500 hover:text-gray-700"
                title="Close system"
              >
                <X size={16} />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="absolute top-16 left-2 right-2 bottom-2 z-10">
        {activeTab === 'rulers' && (
          <Rulers
            canvasWidth={canvasWidth}
            canvasHeight={canvasHeight}
            zoom={zoom}
            panX={panX}
            panY={panY}
            config={rulerConfig}
            onConfigChange={setRulerConfig}
            onGuideAdd={handleGuideAdd}
            onGuideRemove={handleGuideRemove}
            onGuideMove={handleGuideMove}
            className="h-full"
          />
        )}
        
        {activeTab === 'measurements' && (
          <MeasurementTool
            canvasWidth={canvasWidth}
            canvasHeight={canvasHeight}
            zoom={zoom}
            panX={panX}
            panY={panY}
            config={measurementConfig}
            onConfigChange={setMeasurementConfig}
            onMeasurementAdd={handleMeasurementAdd}
            onMeasurementUpdate={handleMeasurementUpdate}
            onMeasurementRemove={handleMeasurementRemove}
            className="h-full"
          />
        )}
        
        {activeTab === 'guides' && (
          <div className="h-full bg-white rounded-lg shadow-lg border border-gray-200 p-4">
            <h4 className="font-semibold mb-4">Guides Management</h4>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Total Guides: {guides.length}</span>
                <button
                  onClick={() => setGuides([])}
                  className="px-3 py-1 text-sm bg-red-100 text-red-700 rounded hover:bg-red-200"
                >
                  Clear All
                </button>
              </div>
              <div className="space-y-1 max-h-64 overflow-y-auto">
                {guides.map(guide => (
                  <div
                    key={guide.id}
                    className="flex items-center justify-between p-2 bg-gray-50 rounded text-sm"
                  >
                    <div className="flex items-center space-x-2">
                      <div className={`w-3 h-3 rounded ${guide.type === 'horizontal' ? 'bg-blue-500' : 'bg-green-500'}`} />
                      <span>{guide.type} guide at {guide.position.toFixed(1)}px</span>
                    </div>
                    <button
                      onClick={() => handleGuideRemove(guide.id)}
                      className="p-1 text-gray-500 hover:text-gray-700"
                    >
                      <Trash2 size={12} />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
        
        {activeTab === 'settings' && (
          <div className="h-full bg-white rounded-lg shadow-lg border border-gray-200 p-4">
            <h4 className="font-semibold mb-4">System Settings</h4>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <h5 className="font-medium mb-2">Ruler Settings</h5>
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="showRulers"
                      checked={rulerConfig.showRulers}
                      onChange={(e) => setRulerConfig({ ...rulerConfig, showRulers: e.target.checked })}
                      className="rounded"
                    />
                    <label htmlFor="showRulers" className="text-sm text-gray-700">Show Rulers</label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="showGuides"
                      checked={rulerConfig.showGuides}
                      onChange={(e) => setRulerConfig({ ...rulerConfig, showGuides: e.target.checked })}
                      className="rounded"
                    />
                    <label htmlFor="showGuides" className="text-sm text-gray-700">Show Guides</label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="showGrid"
                      checked={rulerConfig.showGrid}
                      onChange={(e) => setRulerConfig({ ...rulerConfig, showGrid: e.target.checked })}
                      className="rounded"
                    />
                    <label htmlFor="showGrid" className="text-sm text-gray-700">Show Grid</label>
                  </div>
                </div>
              </div>
              
              <div>
                <h5 className="font-medium mb-2">Measurement Settings</h5>
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="showMeasurements"
                      checked={measurementConfig.showMeasurements}
                      onChange={(e) => setMeasurementConfig({ ...measurementConfig, showMeasurements: e.target.checked })}
                      className="rounded"
                    />
                    <label htmlFor="showMeasurements" className="text-sm text-gray-700">Show Measurements</label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="showLabels"
                      checked={measurementConfig.showLabels}
                      onChange={(e) => setMeasurementConfig({ ...measurementConfig, showLabels: e.target.checked })}
                      className="rounded"
                    />
                    <label htmlFor="showLabels" className="text-sm text-gray-700">Show Labels</label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="showValues"
                      checked={measurementConfig.showValues}
                      onChange={(e) => setMeasurementConfig({ ...measurementConfig, showValues: e.target.checked })}
                      className="rounded"
                    />
                    <label htmlFor="showValues" className="text-sm text-gray-700">Show Values</label>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default MeasurementSystem;
