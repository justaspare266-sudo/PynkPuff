import React, { useState, useCallback, useRef } from 'react';
import { 
  Download, 
  FileText, 
  Image as ImageIcon, 
  File, 
  Settings, 
  X, 
  Check, 
  AlertCircle, 
  Info, 
  Clock, 
  HardDrive, 
  Wifi, 
  WifiOff,
  RefreshCw,
  Eye,
  EyeOff,
  Zap,
  Monitor,
  Smartphone,
  Tablet,
  Laptop,
  Palette,
  Grid,
  Crop,
  RotateCw,
  RotateCcw,
  FlipHorizontal,
  FlipVertical,
  Layers,
  Type,
  Square,
  Circle,
  Triangle,
  Star,
  ArrowRight,
  Heart,
  Filter,
  Save,
  Share,
  Send,
  Copy,
  Scissors,
  Trash2,
  Plus,
  Minus,
  Search,
  StarOff,
  Sun,
  Moon
} from 'lucide-react';

export interface ExportFormat {
  id: string;
  name: string;
  extension: string;
  mimeType: string;
  icon: React.ComponentType<any>;
  description: string;
  supported: boolean;
  quality?: boolean;
  compression?: boolean;
  transparency?: boolean;
  vector?: boolean;
  animation?: boolean;
}

export interface ExportSettings {
  format: string;
  quality: number;
  compression: number;
  width?: number;
  height?: number;
  scale: number;
  backgroundColor?: string;
  transparent: boolean;
  includeMetadata: boolean;
  includeLayers: boolean;
  includeGuides: boolean;
  includeGrid: boolean;
  dpi: number;
  colorSpace: 'sRGB' | 'AdobeRGB' | 'P3';
  compressionLevel: 'none' | 'low' | 'medium' | 'high' | 'maximum';
  optimization: boolean;
  progressive: boolean;
  interlaced: boolean;
}

export interface ExportPreset {
  id: string;
  name: string;
  description: string;
  settings: ExportSettings;
  category: 'web' | 'print' | 'social' | 'mobile' | 'custom';
  icon: React.ComponentType<any>;
}

interface EnhancedExportManagerProps {
  canvasData?: any;
  onExport?: (format: string, settings: ExportSettings) => void;
  onExportComplete?: (format: string, file: Blob) => void;
  onExportError?: (error: Error) => void;
  className?: string;
}

const exportFormats: ExportFormat[] = [
  {
    id: 'png',
    name: 'PNG',
    extension: 'png',
    mimeType: 'image/png',
    icon: ImageIcon,
    description: 'High-quality raster image with transparency support',
    supported: true,
    quality: true,
    compression: true,
    transparency: true
  },
  {
    id: 'jpg',
    name: 'JPEG',
    extension: 'jpg',
    mimeType: 'image/jpeg',
    icon: ImageIcon,
    description: 'Compressed image format for photos and complex images',
    supported: true,
    quality: true,
    compression: true
  },
  {
    id: 'svg',
    name: 'SVG',
    extension: 'svg',
    mimeType: 'image/svg+xml',
    icon: FileText,
    description: 'Scalable vector graphics for web and print',
    supported: true,
    vector: true,
    transparency: true
  },
  {
    id: 'pdf',
    name: 'PDF',
    extension: 'pdf',
    mimeType: 'application/pdf',
    icon: File,
    description: 'Portable document format for print and sharing',
    supported: true,
    vector: true,
    quality: true
  },
  {
    id: 'webp',
    name: 'WebP',
    extension: 'webp',
    mimeType: 'image/webp',
    icon: ImageIcon,
    description: 'Modern web image format with excellent compression',
    supported: true,
    quality: true,
    compression: true,
    transparency: true,
    animation: true
  },
  {
    id: 'gif',
    name: 'GIF',
    extension: 'gif',
    mimeType: 'image/gif',
    icon: ImageIcon,
    description: 'Animated image format for simple animations',
    supported: true,
    transparency: true,
    animation: true
  },
  {
    id: 'bmp',
    name: 'BMP',
    extension: 'bmp',
    mimeType: 'image/bmp',
    icon: ImageIcon,
    description: 'Uncompressed bitmap image format',
    supported: true,
    quality: true
  },
  {
    id: 'tiff',
    name: 'TIFF',
    extension: 'tiff',
    mimeType: 'image/tiff',
    icon: ImageIcon,
    description: 'High-quality image format for professional use',
    supported: true,
    quality: true,
    compression: true,
    transparency: true
  }
];

const exportPresets: ExportPreset[] = [
  {
    id: 'web-standard',
    name: 'Web Standard',
    description: 'Optimized for web use',
    category: 'web',
    icon: Monitor,
    settings: {
      format: 'png',
      quality: 90,
      compression: 80,
      scale: 1,
      transparent: true,
      includeMetadata: false,
      includeLayers: false,
      includeGuides: false,
      includeGrid: false,
      dpi: 72,
      colorSpace: 'sRGB',
      compressionLevel: 'medium',
      optimization: true,
      progressive: false,
      interlaced: false
    }
  },
  {
    id: 'print-high',
    name: 'Print High Quality',
    description: 'High resolution for professional printing',
    category: 'print',
    icon: File,
    settings: {
      format: 'pdf',
      quality: 100,
      compression: 0,
      scale: 1,
      transparent: false,
      includeMetadata: true,
      includeLayers: true,
      includeGuides: true,
      includeGrid: false,
      dpi: 300,
      colorSpace: 'AdobeRGB',
      compressionLevel: 'none',
      optimization: false,
      progressive: false,
      interlaced: false
    }
  },
  {
    id: 'social-instagram',
    name: 'Instagram Post',
    description: 'Square format for Instagram',
    category: 'social',
    icon: Smartphone,
    settings: {
      format: 'jpg',
      quality: 95,
      compression: 85,
      width: 1080,
      height: 1080,
      scale: 1,
      transparent: false,
      includeMetadata: false,
      includeLayers: false,
      includeGuides: false,
      includeGrid: false,
      dpi: 72,
      colorSpace: 'sRGB',
      compressionLevel: 'high',
      optimization: true,
      progressive: true,
      interlaced: false
    }
  },
  {
    id: 'mobile-optimized',
    name: 'Mobile Optimized',
    description: 'Compressed for mobile devices',
    category: 'mobile',
    icon: Smartphone,
    settings: {
      format: 'webp',
      quality: 80,
      compression: 90,
      scale: 0.5,
      transparent: true,
      includeMetadata: false,
      includeLayers: false,
      includeGuides: false,
      includeGrid: false,
      dpi: 72,
      colorSpace: 'sRGB',
      compressionLevel: 'maximum',
      optimization: true,
      progressive: true,
      interlaced: false
    }
  }
];

const defaultExportSettings: ExportSettings = {
  format: 'png',
  quality: 90,
  compression: 80,
  scale: 1,
  transparent: true,
  includeMetadata: false,
  includeLayers: false,
  includeGuides: false,
  includeGrid: false,
  dpi: 72,
  colorSpace: 'sRGB',
  compressionLevel: 'medium',
  optimization: true,
  progressive: false,
  interlaced: false
};

export const EnhancedExportManager: React.FC<EnhancedExportManagerProps> = ({
  canvasData,
  onExport,
  onExportComplete,
  onExportError,
  className = ''
}) => {
  const [showExportModal, setShowExportModal] = useState(false);
  const [exportSettings, setExportSettings] = useState<ExportSettings>(defaultExportSettings);
  const [selectedFormat, setSelectedFormat] = useState<ExportFormat>(exportFormats[0]);
  const [isExporting, setIsExporting] = useState(false);
  const [exportProgress, setExportProgress] = useState(0);
  const [exportHistory, setExportHistory] = useState<Array<{
    id: string;
    format: string;
    timestamp: Date;
    size: number;
    settings: ExportSettings;
  }>>([]);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [previewMode, setPreviewMode] = useState<'desktop' | 'tablet' | 'mobile'>('desktop');
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Load export history from localStorage
  React.useEffect(() => {
    const savedHistory = localStorage.getItem('image-editor-export-history');
    if (savedHistory) {
      try {
        const parsed = JSON.parse(savedHistory);
        setExportHistory(parsed.map((item: any) => ({
          ...item,
          timestamp: new Date(item.timestamp)
        })));
      } catch (error) {
        console.error('Failed to load export history:', error);
      }
    }
  }, []);

  // Save export history to localStorage
  const saveExportHistory = useCallback((history: typeof exportHistory) => {
    localStorage.setItem('image-editor-export-history', JSON.stringify(history));
    setExportHistory(history);
  }, []);

  // Get format by ID
  const getFormatById = useCallback((formatId: string) => {
    return exportFormats.find(f => f.id === formatId) || exportFormats[0];
  }, []);

  // Apply preset
  const applyPreset = useCallback((preset: ExportPreset) => {
    setExportSettings(preset.settings);
    setSelectedFormat(getFormatById(preset.settings.format));
  }, [getFormatById]);

  // Update export settings
  const updateExportSettings = useCallback((updates: Partial<ExportSettings>) => {
    setExportSettings(prev => ({ ...prev, ...updates }));
  }, []);

  // Generate preview
  const generatePreview = useCallback(async () => {
    if (!canvasData) return null;
    
    try {
      // This would generate a preview based on current settings
      // For now, return a placeholder
      return 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==';
    } catch (error) {
      console.error('Failed to generate preview:', error);
      return null;
    }
  }, [canvasData]);

  // Export canvas
  const exportCanvas = useCallback(async () => {
    if (!canvasData) return;
    
    setIsExporting(true);
    setExportProgress(0);
    
    try {
      // Simulate export process
      for (let i = 0; i <= 100; i += 10) {
        setExportProgress(i);
        await new Promise(resolve => setTimeout(resolve, 100));
      }
      
      // Generate export data based on format
      let exportData: Blob;
      let filename: string;
      
      switch (exportSettings.format) {
        case 'png':
          exportData = new Blob(['PNG data'], { type: 'image/png' });
          filename = `canvas-${Date.now()}.png`;
          break;
        case 'jpg':
          exportData = new Blob(['JPEG data'], { type: 'image/jpeg' });
          filename = `canvas-${Date.now()}.jpg`;
          break;
        case 'svg':
          exportData = new Blob(['<svg>SVG data</svg>'], { type: 'image/svg+xml' });
          filename = `canvas-${Date.now()}.svg`;
          break;
        case 'pdf':
          exportData = new Blob(['PDF data'], { type: 'application/pdf' });
          filename = `canvas-${Date.now()}.pdf`;
          break;
        default:
          exportData = new Blob(['Unknown format'], { type: 'application/octet-stream' });
          filename = `canvas-${Date.now()}.${exportSettings.format}`;
      }
      
      // Download file
      const url = URL.createObjectURL(exportData);
      const link = document.createElement('a');
      link.href = url;
      link.download = filename;
      link.click();
      URL.revokeObjectURL(url);
      
      // Add to history
      const historyItem = {
        id: `export-${Date.now()}`,
        format: exportSettings.format,
        timestamp: new Date(),
        size: exportData.size,
        settings: exportSettings
      };
      
      const updatedHistory = [historyItem, ...exportHistory.slice(0, 49)]; // Keep last 50
      saveExportHistory(updatedHistory);
      
      onExportComplete?.(exportSettings.format, exportData);
      
    } catch (error) {
      console.error('Export failed:', error);
      onExportError?.(error as Error);
    } finally {
      setIsExporting(false);
      setExportProgress(0);
    }
  }, [canvasData, exportSettings, exportHistory, saveExportHistory, onExportComplete, onExportError]);

  // Format file size
  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  // Format date
  const formatDate = (date: Date) => {
    return date.toLocaleString();
  };

  return (
    <div className={`bg-white border border-gray-200 rounded-lg shadow-lg ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200">
        <div className="flex items-center space-x-2">
          <Download className="w-5 h-5 text-blue-500" />
          <h3 className="text-lg font-semibold">Export Manager</h3>
          <span className="text-sm text-gray-500">({exportHistory.length} exports)</span>
        </div>
        
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setShowAdvanced(!showAdvanced)}
            className={`p-2 rounded ${showAdvanced ? 'bg-blue-100' : 'hover:bg-gray-100'}`}
            title="Advanced Settings"
          >
            <Settings className="w-4 h-4" />
          </button>
          
          <button
            onClick={() => setShowExportModal(true)}
            className="p-2 rounded hover:bg-gray-100"
            title="Export Canvas"
          >
            <Download className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Export Formats */}
      <div className="p-4 border-b border-gray-200">
        <h4 className="text-sm font-medium text-gray-700 mb-3">Export Formats</h4>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
          {exportFormats.map(format => (
            <button
              key={format.id}
              onClick={() => {
                setSelectedFormat(format);
                updateExportSettings({ format: format.id });
              }}
              className={`p-3 border rounded-lg text-left hover:bg-gray-50 ${
                selectedFormat.id === format.id ? 'border-blue-500 bg-blue-50' : 'border-gray-200'
              } ${!format.supported ? 'opacity-50 cursor-not-allowed' : ''}`}
              disabled={!format.supported}
            >
              <format.icon className="w-6 h-6 mb-2 text-gray-600" />
              <div className="text-sm font-medium text-gray-900">{format.name}</div>
              <div className="text-xs text-gray-500">{format.extension.toUpperCase()}</div>
            </button>
          ))}
        </div>
      </div>

      {/* Export Presets */}
      <div className="p-4 border-b border-gray-200">
        <h4 className="text-sm font-medium text-gray-700 mb-3">Quick Presets</h4>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
          {exportPresets.map(preset => (
            <button
              key={preset.id}
              onClick={() => applyPreset(preset)}
              className="p-3 border border-gray-200 rounded-lg text-left hover:bg-gray-50"
            >
              <preset.icon className="w-6 h-6 mb-2 text-gray-600" />
              <div className="text-sm font-medium text-gray-900">{preset.name}</div>
              <div className="text-xs text-gray-500">{preset.description}</div>
            </button>
          ))}
        </div>
      </div>

      {/* Export Settings */}
      <div className="p-4 border-b border-gray-200">
        <h4 className="text-sm font-medium text-gray-700 mb-3">Export Settings</h4>
        
        <div className="space-y-4">
          {/* Quality */}
          {selectedFormat.quality && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Quality: {exportSettings.quality}%
              </label>
              <input
                type="range"
                min="1"
                max="100"
                value={exportSettings.quality}
                onChange={(e) => updateExportSettings({ quality: parseInt(e.target.value) })}
                className="w-full"
              />
            </div>
          )}

          {/* Compression */}
          {selectedFormat.compression && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Compression: {exportSettings.compression}%
              </label>
              <input
                type="range"
                min="0"
                max="100"
                value={exportSettings.compression}
                onChange={(e) => updateExportSettings({ compression: parseInt(e.target.value) })}
                className="w-full"
              />
            </div>
          )}

          {/* Scale */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Scale: {exportSettings.scale}x
            </label>
            <input
              type="range"
              min="0.1"
              max="5"
              step="0.1"
              value={exportSettings.scale}
              onChange={(e) => updateExportSettings({ scale: parseFloat(e.target.value) })}
              className="w-full"
            />
          </div>

          {/* DPI */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              DPI: {exportSettings.dpi}
            </label>
            <select
              value={exportSettings.dpi}
              onChange={(e) => updateExportSettings({ dpi: parseInt(e.target.value) })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="72">72 DPI (Web)</option>
              <option value="150">150 DPI (Print)</option>
              <option value="300">300 DPI (High Quality Print)</option>
              <option value="600">600 DPI (Professional Print)</option>
            </select>
          </div>

          {/* Color Space */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Color Space
            </label>
            <select
              value={exportSettings.colorSpace}
              onChange={(e) => updateExportSettings({ colorSpace: e.target.value as any })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="sRGB">sRGB (Web Standard)</option>
              <option value="AdobeRGB">Adobe RGB (Print)</option>
              <option value="P3">P3 (Wide Gamut)</option>
            </select>
          </div>

          {/* Advanced Settings */}
          {showAdvanced && (
            <div className="space-y-3 pt-4 border-t border-gray-200">
              <div className="flex items-center space-x-4">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={exportSettings.transparent}
                    onChange={(e) => updateExportSettings({ transparent: e.target.checked })}
                    className="rounded"
                    disabled={!selectedFormat.transparency}
                  />
                  <span className="ml-2 text-sm text-gray-700">Transparent Background</span>
                </label>

                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={exportSettings.includeMetadata}
                    onChange={(e) => updateExportSettings({ includeMetadata: e.target.checked })}
                    className="rounded"
                  />
                  <span className="ml-2 text-sm text-gray-700">Include Metadata</span>
                </label>
              </div>

              <div className="flex items-center space-x-4">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={exportSettings.includeLayers}
                    onChange={(e) => updateExportSettings({ includeLayers: e.target.checked })}
                    className="rounded"
                  />
                  <span className="ml-2 text-sm text-gray-700">Include Layers</span>
                </label>

                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={exportSettings.optimization}
                    onChange={(e) => updateExportSettings({ optimization: e.target.checked })}
                    className="rounded"
                  />
                  <span className="ml-2 text-sm text-gray-700">Optimize for Web</span>
                </label>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Export History */}
      <div className="p-4">
        <h4 className="text-sm font-medium text-gray-700 mb-3">Recent Exports</h4>
        
        {exportHistory.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <Download className="w-12 h-12 mx-auto mb-4 text-gray-300" />
            <p>No exports yet</p>
            <p className="text-sm">Export your canvas to see history</p>
          </div>
        ) : (
          <div className="space-y-2 max-h-48 overflow-y-auto">
              {exportHistory.slice(0, 10).map(exportItem => (
                <div
                  key={exportItem.id}
                  className="flex items-center space-x-3 p-2 border border-gray-200 rounded-lg hover:bg-gray-50"
                >
                  <div className="flex-shrink-0">
                    {React.createElement(getFormatById(exportItem.format).icon, { className: "w-5 h-5 text-gray-500" })}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium text-gray-900">
                      {exportItem.format.toUpperCase()} Export
                    </div>
                    <div className="text-xs text-gray-500">
                      {formatDate(exportItem.timestamp)} • {formatFileSize(exportItem.size)}
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-1">
                    <button
                      onClick={() => applyPreset({ id: 'custom', name: 'Custom', description: '', category: 'custom', icon: Settings, settings: exportItem.settings })}
                      className="p-1 text-blue-600 hover:bg-blue-100 rounded"
                      title="Apply Settings"
                    >
                      <RefreshCw className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
          </div>
        )}
      </div>

      {/* Export Modal */}
      {showExportModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Export Canvas</h3>
              <button
                onClick={() => setShowExportModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-gray-900 mb-2">
                  {selectedFormat.name} Export
                </div>
                <div className="text-sm text-gray-500 mb-4">
                  {selectedFormat.description}
                </div>
              </div>

              {/* Export Progress */}
              {isExporting && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm text-gray-600">
                    <span>Exporting...</span>
                    <span>{exportProgress}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${exportProgress}%` }}
                    />
                  </div>
                </div>
              )}

              {/* Export Summary */}
              <div className="bg-gray-50 rounded-lg p-4">
                <h4 className="text-sm font-medium text-gray-700 mb-2">Export Summary</h4>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-gray-500">Format:</span>
                    <span className="ml-2 font-medium">{selectedFormat.name}</span>
                  </div>
                  <div>
                    <span className="text-gray-500">Quality:</span>
                    <span className="ml-2 font-medium">{exportSettings.quality}%</span>
                  </div>
                  <div>
                    <span className="text-gray-500">Scale:</span>
                    <span className="ml-2 font-medium">{exportSettings.scale}x</span>
                  </div>
                  <div>
                    <span className="text-gray-500">DPI:</span>
                    <span className="ml-2 font-medium">{exportSettings.dpi}</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between mt-6 pt-4 border-t">
              <button
                onClick={() => setShowExportModal(false)}
                className="px-4 py-2 text-sm bg-gray-100 text-gray-700 rounded hover:bg-gray-200"
              >
                Cancel
              </button>
              <button
                onClick={exportCanvas}
                disabled={isExporting}
                className="flex items-center space-x-2 px-4 py-2 text-sm bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Download className="w-4 h-4" />
                <span>{isExporting ? 'Exporting...' : 'Export Canvas'}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// Hook for export management
export const useExportManager = () => {
  const [exportHistory, setExportHistory] = useState<Array<{
    id: string;
    format: string;
    timestamp: Date;
    size: number;
    settings: ExportSettings;
  }>>([]);

  const exportCanvas = useCallback(async (
    canvasData: any,
    settings: ExportSettings
  ): Promise<Blob> => {
    // This would implement the actual export logic
    // For now, return a placeholder blob
    return new Blob(['Export data'], { type: 'application/octet-stream' });
  }, []);

  const getExportHistory = useCallback(() => {
    return exportHistory;
  }, [exportHistory]);

  const clearExportHistory = useCallback(() => {
    setExportHistory([]);
    localStorage.removeItem('image-editor-export-history');
  }, []);

  return {
    exportCanvas,
    getExportHistory,
    clearExportHistory
  };
};
