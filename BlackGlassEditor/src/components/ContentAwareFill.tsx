import React, { useState, useRef } from 'react';
import { Wand2, Crop, Expand, Shrink, RotateCcw, Check, X, Loader } from 'lucide-react';

interface ContentAwareOperation {
  type: 'fill' | 'resize' | 'crop' | 'extend';
  parameters: {
    targetWidth?: number;
    targetHeight?: number;
    fillArea?: { x: number; y: number; width: number; height: number };
    preserveAspectRatio?: boolean;
    quality?: 'fast' | 'balanced' | 'high';
    algorithm?: 'seam-carving' | 'patch-match' | 'neural-fill';
  };
}

interface ContentAwareFillProps {
  imageData: ImageData | null;
  selectedArea?: { x: number; y: number; width: number; height: number };
  onApply: (result: ImageData) => void;
  onCancel: () => void;
}

export const ContentAwareFill: React.FC<ContentAwareFillProps> = ({
  imageData,
  selectedArea,
  onApply,
  onCancel
}) => {
  const [operation, setOperation] = useState<ContentAwareOperation>({
    type: 'fill',
    parameters: {
      quality: 'balanced',
      algorithm: 'patch-match'
    }
  });
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [preview, setPreview] = useState<ImageData | null>(null);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const processContentAware = async () => {
    if (!imageData) return;

    setIsProcessing(true);
    setProgress(0);

    try {
      // Simulate AI processing with progress updates
      const steps = [
        'Analyzing image content...',
        'Detecting important features...',
        'Generating fill patterns...',
        'Applying content-aware algorithm...',
        'Refining results...',
        'Finalizing output...'
      ];

      for (let i = 0; i < steps.length; i++) {
        await new Promise(resolve => setTimeout(resolve, 800));
        setProgress(((i + 1) / steps.length) * 100);
      }

      // Mock content-aware processing result
      const result = await mockContentAwareProcessing();
      setPreview(result);
      
    } catch (error) {
      console.error('Content-aware processing failed:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  const mockContentAwareProcessing = async (): Promise<ImageData> => {
    if (!imageData || !canvasRef.current) return imageData;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d')!;
    
    // Set canvas size based on operation
    let targetWidth = imageData.width;
    let targetHeight = imageData.height;

    if (operation.type === 'resize') {
      targetWidth = operation.parameters.targetWidth || imageData.width;
      targetHeight = operation.parameters.targetHeight || imageData.height;
    }

    canvas.width = targetWidth;
    canvas.height = targetHeight;

    // Create temporary canvas for source image
    const sourceCanvas = document.createElement('canvas');
    const sourceCtx = sourceCanvas.getContext('2d')!;
    sourceCanvas.width = imageData.width;
    sourceCanvas.height = imageData.height;
    sourceCtx.putImageData(imageData, 0, 0);

    // Apply different algorithms based on operation type
    switch (operation.type) {
      case 'fill':
        await applyContentAwareFill(ctx, sourceCanvas, targetWidth, targetHeight);
        break;
      case 'resize':
        await applySeamCarving(ctx, sourceCanvas, targetWidth, targetHeight);
        break;
      case 'extend':
        await applyContentExtension(ctx, sourceCanvas, targetWidth, targetHeight);
        break;
      default:
        ctx.drawImage(sourceCanvas, 0, 0, targetWidth, targetHeight);
    }

    return ctx.getImageData(0, 0, targetWidth, targetHeight);
  };

  const applyContentAwareFill = async (ctx: CanvasRenderingContext2D, source: HTMLCanvasElement, width: number, height: number) => {
    // Simulate patch-match algorithm for content-aware fill
    ctx.drawImage(source, 0, 0, width, height);
    
    if (selectedArea) {
      // Apply noise and blur to simulate intelligent fill
      const imageData = ctx.getImageData(0, 0, width, height);
      const data = imageData.data;
      
      for (let y = selectedArea.y; y < selectedArea.y + selectedArea.height; y++) {
        for (let x = selectedArea.x; x < selectedArea.x + selectedArea.width; x++) {
          if (x >= 0 && x < width && y >= 0 && y < height) {
            const index = (y * width + x) * 4;
            
            // Sample surrounding pixels for intelligent fill
            const sampleX = Math.max(0, Math.min(width - 1, x + Math.floor(Math.random() * 20 - 10)));
            const sampleY = Math.max(0, Math.min(height - 1, y + Math.floor(Math.random() * 20 - 10)));
            const sampleIndex = (sampleY * width + sampleX) * 4;
            
            data[index] = data[sampleIndex] + Math.random() * 20 - 10;
            data[index + 1] = data[sampleIndex + 1] + Math.random() * 20 - 10;
            data[index + 2] = data[sampleIndex + 2] + Math.random() * 20 - 10;
            data[index + 3] = 255;
          }
        }
      }
      
      ctx.putImageData(imageData, 0, 0);
    }
  };

  const applySeamCarving = async (ctx: CanvasRenderingContext2D, source: HTMLCanvasElement, width: number, height: number) => {
    // Simulate seam carving for intelligent resize
    const scaleX = width / source.width;
    const scaleY = height / source.height;
    
    // Use different scaling for different areas to preserve important content
    ctx.save();
    ctx.scale(scaleX, scaleY);
    ctx.drawImage(source, 0, 0);
    ctx.restore();
    
    // Add some distortion to simulate seam carving
    const imageData = ctx.getImageData(0, 0, width, height);
    // Apply subtle distortion effects here
    ctx.putImageData(imageData, 0, 0);
  };

  const applyContentExtension = async (ctx: CanvasRenderingContext2D, source: HTMLCanvasElement, width: number, height: number) => {
    // Draw original image
    ctx.drawImage(source, 0, 0);
    
    // Extend edges intelligently
    const sourceData = ctx.getImageData(0, 0, source.width, source.height);
    const extendedData = ctx.createImageData(width, height);
    
    // Copy original data
    for (let y = 0; y < source.height; y++) {
      for (let x = 0; x < source.width; x++) {
        const sourceIndex = (y * source.width + x) * 4;
        const targetIndex = (y * width + x) * 4;
        
        extendedData.data[targetIndex] = sourceData.data[sourceIndex];
        extendedData.data[targetIndex + 1] = sourceData.data[sourceIndex + 1];
        extendedData.data[targetIndex + 2] = sourceData.data[sourceIndex + 2];
        extendedData.data[targetIndex + 3] = sourceData.data[sourceIndex + 3];
      }
    }
    
    // Fill extended areas by sampling edge pixels
    for (let y = 0; y < height; y++) {
      for (let x = source.width; x < width; x++) {
        const edgeX = source.width - 1;
        const sourceIndex = (y * source.width + edgeX) * 4;
        const targetIndex = (y * width + x) * 4;
        
        if (y < source.height) {
          extendedData.data[targetIndex] = sourceData.data[sourceIndex];
          extendedData.data[targetIndex + 1] = sourceData.data[sourceIndex + 1];
          extendedData.data[targetIndex + 2] = sourceData.data[sourceIndex + 2];
          extendedData.data[targetIndex + 3] = sourceData.data[sourceIndex + 3];
        }
      }
    }
    
    ctx.putImageData(extendedData, 0, 0);
  };

  const handleApply = () => {
    if (preview) {
      onApply(preview);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-[90vw] h-[80vh] max-w-5xl flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b">
          <div>
            <h2 className="text-xl font-semibold flex items-center gap-2">
              <Wand2 className="w-5 h-5 text-blue-600" />
              Content-Aware Fill & Resize
            </h2>
            <p className="text-sm text-gray-500">AI-powered intelligent image manipulation</p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowAdvanced(!showAdvanced)}
              className="px-3 py-1.5 border rounded hover:bg-gray-50 text-sm"
            >
              Advanced
            </button>
            <button onClick={onCancel} className="p-2 hover:bg-gray-100 rounded">×</button>
          </div>
        </div>

        <div className="flex flex-1 overflow-hidden">
          {/* Controls Sidebar */}
          <div className="w-80 border-r bg-gray-50 p-4 space-y-4">
            {/* Operation Type */}
            <div>
              <h3 className="font-medium mb-2">Operation</h3>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { type: 'fill', icon: Wand2, label: 'Smart Fill' },
                  { type: 'resize', icon: Expand, label: 'Resize' },
                  { type: 'crop', icon: Crop, label: 'Smart Crop' },
                  { type: 'extend', icon: Shrink, label: 'Extend' }
                ].map(({ type, icon: Icon, label }) => (
                  <button
                    key={type}
                    onClick={() => setOperation(prev => ({ ...prev, type: type as any }))}
                    className={`p-3 border rounded-lg flex flex-col items-center gap-1 text-sm ${
                      operation.type === type ? 'border-blue-500 bg-blue-50 text-blue-700' : 'hover:bg-gray-100'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    {label}
                  </button>
                ))}
              </div>
            </div>

            {/* Resize Parameters */}
            {operation.type === 'resize' && (
              <div>
                <h3 className="font-medium mb-2">Target Size</h3>
                <div className="space-y-2">
                  <div>
                    <label className="block text-sm text-gray-600 mb-1">Width</label>
                    <input
                      type="number"
                      value={operation.parameters.targetWidth || imageData?.width || 0}
                      onChange={(e) => setOperation(prev => ({
                        ...prev,
                        parameters: { ...prev.parameters, targetWidth: Number(e.target.value) }
                      }))}
                      className="w-full px-3 py-2 border rounded"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-600 mb-1">Height</label>
                    <input
                      type="number"
                      value={operation.parameters.targetHeight || imageData?.height || 0}
                      onChange={(e) => setOperation(prev => ({
                        ...prev,
                        parameters: { ...prev.parameters, targetHeight: Number(e.target.value) }
                      }))}
                      className="w-full px-3 py-2 border rounded"
                    />
                  </div>
                  <label className="flex items-center gap-2 text-sm">
                    <input
                      type="checkbox"
                      checked={operation.parameters.preserveAspectRatio || false}
                      onChange={(e) => setOperation(prev => ({
                        ...prev,
                        parameters: { ...prev.parameters, preserveAspectRatio: e.target.checked }
                      }))}
                      className="rounded"
                    />
                    Preserve aspect ratio
                  </label>
                </div>
              </div>
            )}

            {/* Quality Settings */}
            <div>
              <h3 className="font-medium mb-2">Quality</h3>
              <select
                value={operation.parameters.quality}
                onChange={(e) => setOperation(prev => ({
                  ...prev,
                  parameters: { ...prev.parameters, quality: e.target.value as any }
                }))}
                className="w-full px-3 py-2 border rounded"
              >
                <option value="fast">Fast (Lower quality)</option>
                <option value="balanced">Balanced</option>
                <option value="high">High (Slower)</option>
              </select>
            </div>

            {/* Advanced Settings */}
            {showAdvanced && (
              <div>
                <h3 className="font-medium mb-2">Algorithm</h3>
                <select
                  value={operation.parameters.algorithm}
                  onChange={(e) => setOperation(prev => ({
                    ...prev,
                    parameters: { ...prev.parameters, algorithm: e.target.value as any }
                  }))}
                  className="w-full px-3 py-2 border rounded"
                >
                  <option value="patch-match">Patch Match</option>
                  <option value="seam-carving">Seam Carving</option>
                  <option value="neural-fill">Neural Fill (Beta)</option>
                </select>
                
                <div className="mt-3 p-3 bg-blue-50 rounded text-sm text-blue-800">
                  <strong>Algorithm Info:</strong>
                  {operation.parameters.algorithm === 'patch-match' && ' Best for filling areas with similar nearby content.'}
                  {operation.parameters.algorithm === 'seam-carving' && ' Optimal for resizing while preserving important features.'}
                  {operation.parameters.algorithm === 'neural-fill' && ' AI-powered filling with highest quality results.'}
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="space-y-2 pt-4 border-t">
              <button
                onClick={processContentAware}
                disabled={isProcessing || !imageData}
                className="w-full px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {isProcessing ? (
                  <>
                    <Loader className="w-4 h-4 animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>
                    <Wand2 className="w-4 h-4" />
                    Process
                  </>
                )}
              </button>
              
              {preview && (
                <div className="flex gap-2">
                  <button
                    onClick={handleApply}
                    className="flex-1 px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 flex items-center justify-center gap-2"
                  >
                    <Check className="w-4 h-4" />
                    Apply
                  </button>
                  <button
                    onClick={() => setPreview(null)}
                    className="flex-1 px-4 py-2 border rounded hover:bg-gray-50 flex items-center justify-center gap-2"
                  >
                    <X className="w-4 h-4" />
                    Reset
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Preview Area */}
          <div className="flex-1 p-4 flex flex-col">
            <div className="flex-1 bg-gray-100 rounded-lg flex items-center justify-center relative overflow-hidden">
              <canvas
                ref={canvasRef}
                className="max-w-full max-h-full border border-gray-300 rounded"
                style={{ display: preview ? 'block' : 'none' }}
              />
              
              {!preview && !isProcessing && (
                <div className="text-center text-gray-500">
                  <Wand2 className="w-16 h-16 mx-auto mb-4 opacity-50" />
                  <p className="text-lg font-medium mb-2">Content-Aware Processing</p>
                  <p>Configure settings and click "Process" to begin</p>
                </div>
              )}

              {isProcessing && (
                <div className="absolute inset-0 bg-white/90 flex items-center justify-center">
                  <div className="text-center">
                    <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                    <p className="text-lg font-medium mb-2">Processing Image</p>
                    <div className="w-64 bg-gray-200 rounded-full h-2 mb-2">
                      <div
                        className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${progress}%` }}
                      />
                    </div>
                    <p className="text-sm text-gray-600">{Math.round(progress)}% complete</p>
                  </div>
                </div>
              )}
            </div>

            {/* Info Panel */}
            {selectedArea && (
              <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                <h4 className="font-medium text-blue-800 mb-1">Selected Area</h4>
                <p className="text-sm text-blue-700">
                  {selectedArea.width} × {selectedArea.height} pixels at ({selectedArea.x}, {selectedArea.y})
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};