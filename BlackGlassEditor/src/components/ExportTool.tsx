import React, { useState } from 'react';
import { Download, Copy, Upload, X, FileImage, FileText, Image } from 'lucide-react';

interface ExportOptions {
  format: 'png' | 'jpeg' | 'svg' | 'json';
  quality: number;
  scale: number;
}

interface ExportToolProps {
  isOpen: boolean;
  onClose: () => void;
  onExport: (format: string, options: ExportOptions) => void;
  onCopyToClipboard: () => void;
  onShare: () => void;
  canShare: boolean;
}

export const ExportTool: React.FC<ExportToolProps> = ({
  isOpen,
  onClose,
  onExport,
  onCopyToClipboard,
  onShare,
  canShare
}) => {
  const [quality, setQuality] = useState(0.9);
  const [scale, setScale] = useState(1);

  if (!isOpen) return null;

  const exportFormats = [
    { 
      format: 'png' as const, 
      label: 'PNG', 
      icon: FileImage, 
      color: 'bg-blue-600 hover:bg-blue-700',
      description: 'High quality with transparency'
    },
    { 
      format: 'jpeg' as const, 
      label: 'JPEG', 
      icon: Image, 
      color: 'bg-green-600 hover:bg-green-700',
      description: 'Smaller file size, no transparency'
    },
    { 
      format: 'svg' as const, 
      label: 'SVG', 
      icon: FileImage, 
      color: 'bg-purple-600 hover:bg-purple-700',
      description: 'Vector format, scalable'
    },
    { 
      format: 'json' as const, 
      label: 'JSON', 
      icon: FileText, 
      color: 'bg-orange-600 hover:bg-orange-700',
      description: 'Project data for later editing'
    }
  ];

  const handleExport = (format: ExportOptions['format']) => {
    onExport(format, { format, quality, scale });
  };

  return (
    <div className="fixed top-4 left-4 z-50 w-80 bg-white rounded-lg shadow-lg border">
      <div className="p-4 border-b">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold">Export Tool</h3>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>
      
      <div className="p-4 space-y-4">
        {/* Export Format Selection */}
        <div className="space-y-3">
          <label className="text-sm font-medium text-gray-700">Export Format</label>
          <div className="grid grid-cols-2 gap-3">
            {exportFormats.map(({ format, label, icon: Icon, color, description }) => (
              <button
                key={format}
                onClick={() => handleExport(format)}
                className={`flex flex-col items-center space-y-2 p-3 text-white rounded-lg transition-colors ${color}`}
                title={description}
              >
                <Icon className="w-5 h-5" />
                <span className="text-sm font-medium">{label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Export Settings */}
        <div className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">
              Quality: {Math.round(quality * 100)}%
            </label>
            <input
              type="range"
              min="0.1"
              max="1"
              step="0.1"
              value={quality}
              onChange={(e) => setQuality(parseFloat(e.target.value))}
              className="w-full"
            />
            <div className="flex justify-between text-xs text-gray-500">
              <span>Lower quality</span>
              <span>Higher quality</span>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">
              Scale: {scale}x
            </label>
            <div className="flex items-center space-x-2">
              <input
                type="number"
                min="0.1"
                max="5"
                step="0.1"
                value={scale}
                onChange={(e) => setScale(parseFloat(e.target.value))}
                className="w-20 px-2 py-1 border rounded text-sm"
              />
              <div className="flex space-x-1">
                <button
                  onClick={() => setScale(0.5)}
                  className="px-2 py-1 text-xs bg-gray-100 hover:bg-gray-200 rounded"
                >
                  0.5x
                </button>
                <button
                  onClick={() => setScale(1)}
                  className="px-2 py-1 text-xs bg-gray-100 hover:bg-gray-200 rounded"
                >
                  1x
                </button>
                <button
                  onClick={() => setScale(2)}
                  className="px-2 py-1 text-xs bg-gray-100 hover:bg-gray-200 rounded"
                >
                  2x
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="flex items-center space-x-2 pt-4 border-t">
          <button
            onClick={onCopyToClipboard}
            className="flex items-center space-x-1 px-3 py-2 bg-gray-600 text-white rounded hover:bg-gray-700"
          >
            <Copy className="w-4 h-4" />
            <span>Copy</span>
          </button>
          
          {canShare && (
            <button
              onClick={onShare}
              className="flex items-center space-x-1 px-3 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              <Upload className="w-4 h-4" />
              <span>Share</span>
            </button>
          )}
        </div>

        {/* Export History */}
        <div className="pt-4 border-t">
          <h4 className="text-sm font-medium text-gray-700 mb-2">Recent Exports</h4>
          <div className="text-xs text-gray-500 bg-gray-50 p-2 rounded space-y-1">
            <div className="flex justify-between">
              <span>• PNG: canvas.png</span>
              <span>2.3MB</span>
            </div>
            <div className="flex justify-between">
              <span>• JPEG: canvas.jpg</span>
              <span>1.8MB</span>
            </div>
            <div className="flex justify-between">
              <span>• SVG: canvas.svg</span>
              <span>0.5MB</span>
            </div>
          </div>
        </div>

        {/* Format Descriptions */}
        <div className="pt-4 border-t">
          <h4 className="text-sm font-medium text-gray-700 mb-2">Format Guide</h4>
          <div className="text-xs text-gray-600 space-y-1">
            <p><strong>PNG:</strong> Best for images with transparency</p>
            <p><strong>JPEG:</strong> Best for photos, smaller file size</p>
            <p><strong>SVG:</strong> Vector format, infinitely scalable</p>
            <p><strong>JSON:</strong> Save project for future editing</p>
          </div>
        </div>
      </div>
    </div>
  );
};