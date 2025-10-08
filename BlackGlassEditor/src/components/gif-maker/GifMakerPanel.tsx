'use client';
import React, { useState, useEffect } from 'react';
import GIF from 'gif.js';

interface GifMakerPanelProps {
  onCaptureFrame: () => Promise<string>;
  canvasWidth: number;
  canvasHeight: number;
}

export default function GifMakerPanel({ onCaptureFrame, canvasWidth, canvasHeight }: GifMakerPanelProps) {
  const [frames, setFrames] = useState<string[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [fps, setFps] = useState(10);
  const [quality, setQuality] = useState(10);
  const [estimatedSize, setEstimatedSize] = useState(0);
  const [optimizeSize, setOptimizeSize] = useState(true);

  useEffect(() => {
    if (frames.length > 0) {
      const totalLength = frames.reduce((acc, frame) => acc + frame.length, 0);
      const sizeInBytes = totalLength * 0.75; // Base64 overhead
      const sizeInKb = sizeInBytes / 1024;
      setEstimatedSize(sizeInKb);
    } else {
      setEstimatedSize(0);
    }
  }, [frames]);

  const handleCaptureFrame = async () => {
    const frame = await onCaptureFrame();
    setFrames(prev => [...prev, frame]);
  };

  const generateGif = async () => {
    if (frames.length === 0) return;
    setIsGenerating(true);

    let width = canvasWidth;
    let height = canvasHeight;
    let finalQuality = quality;

    if (optimizeSize && estimatedSize > 1024) {
      const targetSize = 1024;
      let sizeRatio = estimatedSize / targetSize;

      // First, try to reduce size by adjusting quality
      if (sizeRatio > 1) {
        finalQuality = Math.min(30, Math.max(1, Math.round(quality * sizeRatio)));
        // Re-estimate size with new quality. This is a rough approximation.
        const qualityImpactFactor = quality / finalQuality;
        sizeRatio = sizeRatio * qualityImpactFactor;
      }
      
      // If still too large, reduce dimensions
      if (sizeRatio > 1) {
        const dimensionRatio = Math.sqrt(1 / sizeRatio);
        width = Math.floor(width * dimensionRatio);
        height = Math.floor(height * dimensionRatio);
      }
    }

    const gif = new GIF({
      workers: 2,
      quality: finalQuality,
      width,
      height
    });

    for (const frame of frames) {
      const img = new Image();
      img.src = frame;
      await new Promise(resolve => {
        img.onload = () => {
          gif.addFrame(img, { delay: 1000 / fps });
          resolve(null);
        };
      });
    }

    gif.on('finished', (blob: Blob) => {
      setEstimatedSize(blob.size / 1024);
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'animation.gif';
      a.click();
      setIsGenerating(false);
    });

    gif.render();
  };

  return (
    <div className="p-4 space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">GIF Maker</h3>
        <button
          onClick={handleCaptureFrame}
          className="px-3 py-1 bg-blue-500 text-white rounded-md hover:bg-blue-600"
        >
          Capture Frame
        </button>
      </div>

      <div className="flex space-x-4">
        <div>
          <label className="block text-sm">FPS</label>
          <input
            type="number"
            value={fps}
            onChange={(e) => setFps(Number(e.target.value))}
            className="w-20 p-1 border rounded"
          />
        </div>
        <div>
          <label className="block text-sm">Quality</label>
          <input
            type="number"
            value={quality}
            onChange={(e) => setQuality(Number(e.target.value))}
            className="w-20 p-1 border rounded"
          />
        </div>
        <div className="flex items-center">
          <input
            type="checkbox"
            id="optimize-size"
            checked={optimizeSize}
            onChange={(e) => setOptimizeSize(e.target.checked)}
            className="mr-2"
          />
          <label htmlFor="optimize-size" className="text-sm">Keep under 1MB</label>
        </div>
      </div>

      <div className="grid grid-cols-4 gap-2">
        {frames.map((frame, index) => (
          <img
            key={index}
            src={frame}
            alt={`Frame ${index}`}
            className="w-full aspect-square object-cover rounded border"
          />
        ))}
      </div>

      {estimatedSize > 0 && (
        <div className="text-sm text-gray-600">
          Estimated Size: {estimatedSize.toFixed(2)} KB
        </div>
      )}

      <button
        onClick={generateGif}
        disabled={isGenerating || frames.length === 0}
        className="w-full py-2 bg-green-500 text-white rounded-md hover:bg-green-600 disabled:opacity-50"
      >
        {isGenerating ? 'Generating...' : 'Create GIF'}
      </button>
    </div>
  );
}
