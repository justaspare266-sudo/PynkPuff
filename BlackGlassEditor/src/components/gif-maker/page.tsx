'use client';
import React, { useState, useRef } from 'react';
import GIF from 'gif.js';

export default function GifMaker() {
  const [frames, setFrames] = useState<string[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [fps, setFps] = useState(10);
  const [quality, setQuality] = useState(10);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (file.type.startsWith('video/')) {
      const url = URL.createObjectURL(file);
      if (videoRef.current) {
        videoRef.current.src = url;
      }
    } else if (file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = (e) => {
        if (e.target?.result) {
          setFrames(prev => [...prev, e.target!.result as string]);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const captureFrame = () => {
    if (!videoRef.current || !canvasRef.current) return;
    
    const video = videoRef.current;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    
    if (!ctx) return;
    
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    ctx.drawImage(video, 0, 0);
    
    const frame = canvas.toDataURL('image/png');
    setFrames(prev => [...prev, frame]);
  };

  const generateGif = async () => {
    if (frames.length === 0) return;
    setIsGenerating(true);

    const gif = new GIF({
      workers: 2,
      quality,
      width: 320,
      height: 240
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
    <div className="min-h-screen bg-gradient-to-br from-pink-200 via-violet-200 to-cyan-200 p-8">
      <div className="max-w-4xl mx-auto bg-white/50 backdrop-blur-xl rounded-2xl p-6 shadow-xl">
        <h1 className="text-3xl font-bold text-slate-800 mb-6">GIF Maker</h1>
        
        <div className="space-y-6">
          <div>
            <input
              type="file"
              accept="video/*,image/*"
              onChange={handleFileUpload}
              className="block w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-violet-50 file:text-violet-700 hover:file:bg-violet-100"
            />
          </div>

          <div className="flex space-x-4">
            <div>
              <label className="block text-sm font-medium text-slate-700">FPS</label>
              <input
                type="number"
                value={fps}
                onChange={(e) => setFps(Number(e.target.value))}
                className="mt-1 block w-20 rounded-md bg-white/70 border-gray-300"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700">Quality</label>
              <input
                type="number"
                value={quality}
                onChange={(e) => setQuality(Number(e.target.value))}
                className="mt-1 block w-20 rounded-md bg-white/70 border-gray-300"
              />
            </div>
          </div>

          {videoRef.current && (
            <div>
              <video ref={videoRef} controls className="max-w-full rounded-lg" />
              <button
                onClick={captureFrame}
                className="mt-2 bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700"
              >
                Capture Frame
              </button>
            </div>
          )}

          <div className="grid grid-cols-4 gap-4">
            {frames.map((frame, index) => (
              <img
                key={index}
                src={frame}
                alt={`Frame ${index}`}
                className="w-full aspect-square object-cover rounded-lg"
              />
            ))}
          </div>

          <button
            onClick={generateGif}
            disabled={isGenerating || frames.length === 0}
            className="w-full bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700 disabled:opacity-50"
          >
            {isGenerating ? 'Generating...' : 'Generate GIF'}
          </button>
        </div>

        <canvas ref={canvasRef} className="hidden" />
      </div>
    </div>
  );
}
