'use client';

import React, { useState, useCallback } from 'react';
import { Download, FileImage, FileText, FileJson, File, Settings, Palette, Grid3X3, Ruler, Eye, EyeOff } from 'lucide-react';
import { ExportManager, ExportOptions, ExportResult } from '../src/utils/ExportManager';

export interface ExportSystemProps {
  stage: any; // Konva Stage instance
  elements: any[];
  canvasWidth: number;
  canvasHeight: number;
  onExport: (result: ExportResult) => void;
  className?: string;
}

const ExportSystem: React.FC<ExportSystemProps> = ({
  stage,
  elements,
  canvasWidth,
  canvasHeight,
  onExport,
  className = ''
}) => {
  const [exportManager] = useState(() => new ExportManager(stage));
  const [showExportDialog, setShowExportDialog] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [exportOptions, setExportOptions] = useState<ExportOptions>({
    format: 'png',
    quality: 0.9,
    pixelRatio: 2,
    backgroundColor: '#ffffff',
    includeBackground: true,
    includeGrid: false,
    includeRulers: false,
    includeGuides: false,
    compressionLevel: 6,
    dpi: 300,
    filename: `export-${new Date().toISOString().split('T')[0]}`,
    metadata: {
      title: 'Advanced Image Editor Export',
      description: 'Exported from Advanced Image Editor',
      author: 'User',
      created: new Date().toISOString(),
      modified: new Date().toISOString(),
      version: '1.0.0'
    }
  });

  const [exportHistory, setExportHistory] = useState<ExportResult[]>([]);
  const [showAdvancedOptions, setShowAdvancedOptions] = useState(false);

  const formatOptions = [
    { value: 'png', label: 'PNG', icon: FileImage, description: 'High quality with transparency' },
    { value: 'svg', label: 'SVG', icon: FileText, description: 'Vector format, scalable' },
    { value: 'json', label: 'JSON', icon: FileJson, description: 'Project data for editing' },
    { value: 'pdf', label: 'PDF', icon: File, description: 'Print-ready document' }
  ];

  const qualityPresets = [
    { label: 'Low', value: 0.5, description: 'Small file size' },
    { label: 'Medium', value: 0.8, description: 'Balanced quality' },
    { label: 'High', value: 0.9, description: 'High quality' },
    { label: 'Maximum', value: 1.0, description: 'Best quality' }
  ];

  const pixelRatioPresets = [
    { label: '1x', value: 1, description: 'Standard resolution' },
    { label: '2x', value: 2, description: 'Retina display' },
    { label: '3x', value: 3, description: 'High DPI' },
    { label: '4x', value: 4, description: 'Ultra high DPI' }
  ];

  const handleExport = useCallback(async () => {
    if (!stage) return;

    setIsExporting(true);
    try {
      const result = await exportManager.export(exportOptions);
      
      // Add to history
      setExportHistory(prev => [result, ...prev.slice(0, 9)]); // Keep last 10
      
      // Download the file
      exportManager.download(result);
      
      onExport(result);
      setShowExportDialog(false);
    } catch (error) {
      console.error('Export failed:', error);
    } finally {
      setIsExporting(false);
    }
  }, [stage, exportManager, exportOptions, onExport]);

  const handleQuickExport = useCallback(async (format: 'png' | 'svg' | 'json' | 'pdf') => {
    if (!stage) return;

    setIsExporting(true);
    try {
      const quickOptions = { ...exportOptions, format };
      const result = await exportManager.export(quickOptions);
      exportManager.download(result);
      onExport(result);
    } catch (error) {
      console.error('Quick export failed:', error);
    } finally {
      setIsExporting(false);
    }
  }, [stage, exportManager, exportOptions, onExport]);

  const handlePreview = useCallback(async () => {
    if (!stage) return;

    try {
      const preview = await exportManager.getPreview(200);
      // You could show this in a modal or tooltip
      console.log('Preview generated:', preview);
    } catch (error) {
      console.error('Preview failed:', error);
    }
  }, [stage, exportManager]);

  const updateExportOption = useCallback((key: keyof ExportOptions, value: any) => {
    setExportOptions(prev => ({ ...prev, [key]: value }));
  }, []);

  const getFileSizeEstimate = () => {
    const estimate = exportManager.getSizeEstimate(exportOptions.format, exportOptions.pixelRatio);
    if (estimate < 1024) return `${estimate} B`;
    if (estimate < 1024 * 1024) return `${(estimate / 1024).toFixed(1)} KB`;
    return `${(estimate / (1024 * 1024)).toFixed(1)} MB`;
  };

  const getFormatIcon = (format: string) => {
    const option = formatOptions.find(opt => opt.value === format);
    return option?.icon || File;
  };

  return (
    <div className={`export-system ${className}`}>
      {/* Quick Export Buttons */}
      <div className="flex items-center space-x-2 p-2 bg-gray-700 rounded">
        <span className="text-sm font-medium text-gray-300 mr-2">Quick Export:</span>
        {formatOptions.map(option => {
          const IconComponent = option.icon;
          return (
            <button
              key={option.value}
              onClick={() => handleQuickExport(option.value as any)}
              disabled={isExporting}
              className="flex items-center space-x-1 px-3 py-1 bg-gray-600 hover:bg-gray-500 rounded text-sm text-white disabled:opacity-50"
              title={option.description}
            >
              <IconComponent className="w-4 h-4" />
              <span>{option.label}</span>
            </button>
          );
        })}
        
        <div className="w-px h-6 bg-gray-600" />
        
        <button
          onClick={() => setShowExportDialog(true)}
          className="flex items-center space-x-1 px-3 py-1 bg-blue-600 hover:bg-blue-500 rounded text-sm text-white"
          title="Advanced Export Options"
        >
          <Settings className="w-4 h-4" />
          <span>Advanced</span>
        </button>
      </div>

      {/* Export History */}
      {exportHistory.length > 0 && (
        <div className="mt-2">
          <div className="text-xs text-gray-400 mb-1">Recent Exports:</div>
          <div className="space-y-1">
            {exportHistory.slice(0, 3).map((result, index) => (
              <div key={index} className="flex items-center justify-between p-2 bg-gray-600 rounded text-xs">
                <div className="flex items-center space-x-2">
                  {React.createElement(getFormatIcon(result.format), { className: "w-3 h-3" })}
                  <span>{result.filename}</span>
                </div>
                <div className="text-gray-400">
                  {result.size < 1024 ? `${result.size} B` : `${(result.size / 1024).toFixed(1)} KB`}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Export Dialog */}
      {showExportDialog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-gray-800 rounded-lg shadow-xl border border-gray-600 w-full max-w-2xl max-h-[80vh] overflow-hidden">
            <div className="p-4 border-b border-gray-600">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold">Export Options</h2>
                <button
                  onClick={() => setShowExportDialog(false)}
                  className="p-2 bg-gray-600 hover:bg-gray-500 rounded text-white"
                >
                  ×
                </button>
              </div>
            </div>
            
            <div className="p-4 overflow-y-auto max-h-96">
              {/* Format Selection */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-300 mb-3">Export Format</label>
                <div className="grid grid-cols-2 gap-3">
                  {formatOptions.map(option => {
                    const IconComponent = option.icon;
                    return (
                      <button
                        key={option.value}
                        onClick={() => updateExportOption('format', option.value)}
                        className={`p-3 rounded-lg border-2 transition-colors ${
                          exportOptions.format === option.value
                            ? 'border-blue-500 bg-blue-900 bg-opacity-50'
                            : 'border-gray-600 bg-gray-700 hover:bg-gray-600'
                        }`}
                      >
                        <div className="flex items-center space-x-2 mb-1">
                          <IconComponent className="w-5 h-5" />
                          <span className="font-medium">{option.label}</span>
                        </div>
                        <div className="text-xs text-gray-400">{option.description}</div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Quality Settings */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-300 mb-3">Quality</label>
                <div className="grid grid-cols-4 gap-2">
                  {qualityPresets.map(preset => (
                    <button
                      key={preset.label}
                      onClick={() => updateExportOption('quality', preset.value)}
                      className={`p-2 rounded text-sm ${
                        exportOptions.quality === preset.value
                          ? 'bg-blue-600 text-white'
                          : 'bg-gray-600 hover:bg-gray-500 text-gray-300'
                      }`}
                    >
                      {preset.label}
                    </button>
                  ))}
                </div>
                <div className="mt-2">
                  <input
                    type="range"
                    min="0.1"
                    max="1"
                    step="0.1"
                    value={exportOptions.quality}
                    onChange={(e) => updateExportOption('quality', parseFloat(e.target.value))}
                    className="w-full"
                  />
                  <div className="text-xs text-gray-400 mt-1">
                    Quality: {Math.round(exportOptions.quality * 100)}%
                  </div>
                </div>
              </div>

              {/* Pixel Ratio */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-300 mb-3">Resolution</label>
                <div className="grid grid-cols-4 gap-2">
                  {pixelRatioPresets.map(preset => (
                    <button
                      key={preset.label}
                      onClick={() => updateExportOption('pixelRatio', preset.value)}
                      className={`p-2 rounded text-sm ${
                        exportOptions.pixelRatio === preset.value
                          ? 'bg-blue-600 text-white'
                          : 'bg-gray-600 hover:bg-gray-500 text-gray-300'
                      }`}
                    >
                      {preset.label}
                    </button>
                  ))}
                </div>
                <div className="text-xs text-gray-400 mt-1">
                  {exportOptions.pixelRatio}x resolution ({canvasWidth * exportOptions.pixelRatio} × {canvasHeight * exportOptions.pixelRatio}px)
                </div>
              </div>

              {/* Background */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-300 mb-3">Background</label>
                <div className="flex items-center space-x-4">
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      checked={exportOptions.includeBackground}
                      onChange={(e) => updateExportOption('includeBackground', e.target.checked)}
                      className="mr-2"
                    />
                    <span className="text-sm text-gray-300">Include background</span>
                  </div>
                  {exportOptions.includeBackground && (
                    <div className="flex items-center space-x-2">
                      <input
                        type="color"
                        value={exportOptions.backgroundColor || '#ffffff'}
                        onChange={(e) => updateExportOption('backgroundColor', e.target.value)}
                        className="w-8 h-8 rounded border border-gray-500"
                      />
                      <input
                        type="text"
                        value={exportOptions.backgroundColor || '#ffffff'}
                        onChange={(e) => updateExportOption('backgroundColor', e.target.value)}
                        className="w-24 p-1 bg-gray-600 border border-gray-500 rounded text-sm text-white"
                      />
                    </div>
                  )}
                </div>
              </div>

              {/* Advanced Options Toggle */}
              <div className="mb-4">
                <button
                  onClick={() => setShowAdvancedOptions(!showAdvancedOptions)}
                  className="flex items-center space-x-2 text-sm font-medium text-gray-300 hover:text-white"
                >
                  <Settings className="w-4 h-4" />
                  <span>Advanced Options</span>
                </button>
              </div>

              {/* Advanced Options */}
              {showAdvancedOptions && (
                <div className="space-y-4 bg-gray-700 p-4 rounded">
                  {/* Include Elements */}
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Include Elements</label>
                    <div className="space-y-2">
                      <div className="flex items-center">
                        <input
                          type="checkbox"
                          checked={exportOptions.includeGrid}
                          onChange={(e) => updateExportOption('includeGrid', e.target.checked)}
                          className="mr-2"
                        />
                        <Grid3X3 className="w-4 h-4 mr-2" />
                        <span className="text-sm text-gray-300">Grid</span>
                      </div>
                      <div className="flex items-center">
                        <input
                          type="checkbox"
                          checked={exportOptions.includeRulers}
                          onChange={(e) => updateExportOption('includeRulers', e.target.checked)}
                          className="mr-2"
                        />
                        <Ruler className="w-4 h-4 mr-2" />
                        <span className="text-sm text-gray-300">Rulers</span>
                      </div>
                      <div className="flex items-center">
                        <input
                          type="checkbox"
                          checked={exportOptions.includeGuides}
                          onChange={(e) => updateExportOption('includeGuides', e.target.checked)}
                          className="mr-2"
                        />
                        <Eye className="w-4 h-4 mr-2" />
                        <span className="text-sm text-gray-300">Guides</span>
                      </div>
                    </div>
                  </div>

                  {/* Compression */}
                  {exportOptions.format === 'png' && (
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Compression Level: {exportOptions.compressionLevel}
                      </label>
                      <input
                        type="range"
                        min="0"
                        max="9"
                        value={exportOptions.compressionLevel}
                        onChange={(e) => updateExportOption('compressionLevel', parseInt(e.target.value))}
                        className="w-full"
                      />
                      <div className="text-xs text-gray-400 mt-1">
                        0 = No compression (larger file), 9 = Maximum compression (smaller file)
                      </div>
                    </div>
                  )}

                  {/* DPI for PDF */}
                  {exportOptions.format === 'pdf' && (
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">DPI</label>
                      <input
                        type="number"
                        min="72"
                        max="600"
                        value={exportOptions.dpi}
                        onChange={(e) => updateExportOption('dpi', parseInt(e.target.value))}
                        className="w-full p-2 bg-gray-600 border border-gray-500 rounded text-sm text-white"
                      />
                    </div>
                  )}

                  {/* Filename */}
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Filename</label>
                    <input
                      type="text"
                      value={exportOptions.filename || ''}
                      onChange={(e) => updateExportOption('filename', e.target.value)}
                      className="w-full p-2 bg-gray-600 border border-gray-500 rounded text-sm text-white"
                      placeholder="export-filename"
                    />
                  </div>
                </div>
              )}

              {/* File Size Estimate */}
              <div className="mt-4 p-3 bg-gray-700 rounded">
                <div className="text-sm text-gray-300">
                  <strong>Estimated file size:</strong> {getFileSizeEstimate()}
                </div>
                <div className="text-xs text-gray-400 mt-1">
                  Dimensions: {canvasWidth * exportOptions.pixelRatio} × {canvasHeight * exportOptions.pixelRatio}px
                </div>
              </div>
            </div>
            
            <div className="p-4 border-t border-gray-600">
              <div className="flex items-center justify-between">
                <button
                  onClick={handlePreview}
                  className="px-4 py-2 bg-gray-600 hover:bg-gray-500 rounded text-white"
                >
                  Preview
                </button>
                <div className="flex space-x-2">
                  <button
                    onClick={() => setShowExportDialog(false)}
                    className="px-4 py-2 bg-gray-600 hover:bg-gray-500 rounded text-white"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleExport}
                    disabled={isExporting}
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-500 rounded text-white disabled:opacity-50"
                  >
                    {isExporting ? 'Exporting...' : 'Export'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ExportSystem;
