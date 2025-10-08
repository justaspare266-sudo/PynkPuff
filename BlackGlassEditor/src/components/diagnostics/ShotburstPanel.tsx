/**
 * 📸 ShotburstPanel - UI for capturing and managing shotburst sequences
 * Provides manual trigger and management of multi-frame captures
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Camera, 
  Video, 
  Download, 
  Play, 
  Pause, 
  Settings, 
  X, 
  Eye,
  Trash2,
  Clock,
  Image as ImageIcon
} from 'lucide-react';
import { shotburstCapture, ShotburstSequence, ShotburstOptions } from './ShotburstCapture';

interface ShotburstPanelProps {
  isVisible: boolean;
  onClose: () => void;
  elementId?: string;
}

export const ShotburstPanel: React.FC<ShotburstPanelProps> = ({
  isVisible,
  onClose,
  elementId
}) => {
  const [sequences, setSequences] = useState<ShotburstSequence[]>([]);
  const [isCapturing, setIsCapturing] = useState(false);
  const [selectedSequence, setSelectedSequence] = useState<ShotburstSequence | null>(null);
  const [options, setOptions] = useState<ShotburstOptions>({
    frameCount: 4,
    interval: 250,
    quality: 'medium',
    includeVideo: true,
    videoDuration: 3,
    compression: 0.7,
    autoTrigger: false
  });
  const [showSettings, setShowSettings] = useState(false);

  useEffect(() => {
    if (isVisible) {
      setSequences(shotburstCapture.getAllSequences());
    }
  }, [isVisible]);

  const handleCapture = async () => {
    setIsCapturing(true);
    try {
      const sequence = await shotburstCapture.captureShotburst(
        options,
        elementId,
        `Manual capture at ${new Date().toLocaleTimeString()}`
      );
      setSequences(prev => [sequence, ...prev]);
    } catch (error) {
      console.error('Shotburst capture failed:', error);
    } finally {
      setIsCapturing(false);
    }
  };

  const handleDownloadSequence = (sequenceId: string) => {
    shotburstCapture.exportSequence(sequenceId);
  };

  const handleDownloadVideo = (sequenceId: string) => {
    shotburstCapture.downloadVideo(sequenceId);
  };

  const handleDeleteSequence = (sequenceId: string) => {
    setSequences(prev => prev.filter(seq => seq.id !== sequenceId));
    // Note: In a real implementation, you'd also remove from the capture system
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  if (!isVisible) return null;

  return (
    <motion.div
      initial={{ opacity: 0, x: 300 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 300 }}
      className="fixed right-0 top-0 h-full w-96 bg-white border-l border-gray-200 shadow-2xl z-50 flex flex-col"
    >
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b bg-gray-50">
        <div className="flex items-center space-x-2">
          <Camera className="w-5 h-5 text-blue-600" />
          <h2 className="text-lg font-semibold">📸 Shotburst Capture</h2>
        </div>
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setShowSettings(!showSettings)}
            className="p-2 hover:bg-gray-100 rounded"
            title="Settings"
          >
            <Settings className="w-4 h-4" />
          </button>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Settings Panel */}
      <AnimatePresence>
        {showSettings && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="border-b bg-gray-50 p-4"
          >
            <h3 className="font-medium mb-3">Capture Settings</h3>
            <div className="space-y-3 text-sm">
              <div>
                <label className="block mb-1">Frame Count</label>
                <select
                  value={options.frameCount}
                  onChange={(e) => setOptions(prev => ({ ...prev, frameCount: parseInt(e.target.value) as 1 | 2 | 3 | 4 }))}
                  className="w-full p-2 border rounded"
                >
                  <option value={1}>1 Frame</option>
                  <option value={2}>2 Frames</option>
                  <option value={3}>3 Frames</option>
                  <option value={4}>4 Frames</option>
                </select>
              </div>
              
              <div>
                <label className="block mb-1">Interval (ms)</label>
                <input
                  type="number"
                  value={options.interval}
                  onChange={(e) => setOptions(prev => ({ ...prev, interval: parseInt(e.target.value) }))}
                  className="w-full p-2 border rounded"
                  min="100"
                  max="2000"
                  step="50"
                />
              </div>
              
              <div>
                <label className="block mb-1">Quality</label>
                <select
                  value={options.quality}
                  onChange={(e) => setOptions(prev => ({ ...prev, quality: e.target.value as 'low' | 'medium' | 'high' }))}
                  className="w-full p-2 border rounded"
                >
                  <option value="low">Low (Fast)</option>
                  <option value="medium">Medium (Balanced)</option>
                  <option value="high">High (Slow)</option>
                </select>
              </div>
              
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="includeVideo"
                  checked={options.includeVideo}
                  onChange={(e) => setOptions(prev => ({ ...prev, includeVideo: e.target.checked }))}
                  className="rounded"
                />
                <label htmlFor="includeVideo">Include Video Recording</label>
              </div>
              
              {options.includeVideo && (
                <div>
                  <label className="block mb-1">Video Duration (seconds)</label>
                  <input
                    type="number"
                    value={options.videoDuration}
                    onChange={(e) => setOptions(prev => ({ ...prev, videoDuration: parseInt(e.target.value) }))}
                    className="w-full p-2 border rounded"
                    min="1"
                    max="10"
                  />
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Capture Controls */}
      <div className="p-4 border-b">
        <button
          onClick={handleCapture}
          disabled={isCapturing}
          className={`w-full flex items-center justify-center space-x-2 px-4 py-3 rounded-lg font-medium transition-all ${
            isCapturing
              ? 'bg-gray-400 text-white cursor-not-allowed'
              : 'bg-blue-600 text-white hover:bg-blue-700'
          }`}
        >
          {isCapturing ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              <span>Capturing...</span>
            </>
          ) : (
            <>
              <Camera className="w-4 h-4" />
              <span>Capture Shotburst</span>
            </>
          )}
        </button>
        
        {elementId && (
          <p className="text-xs text-gray-600 mt-2 text-center">
            Targeting element: <code className="bg-gray-100 px-1 rounded">{elementId}</code>
          </p>
        )}
      </div>

      {/* Sequences List */}
      <div className="flex-1 overflow-y-auto p-4">
        <h3 className="font-medium mb-3">Recent Captures</h3>
        
        {sequences.length === 0 ? (
          <div className="text-center text-gray-500 py-8">
            <Camera className="w-8 h-8 mx-auto mb-2 text-gray-400" />
            <p>No captures yet</p>
            <p className="text-sm">Click "Capture Shotburst" to start</p>
          </div>
        ) : (
          <div className="space-y-3">
            {sequences.map((sequence) => (
              <div key={sequence.id} className="border rounded-lg p-3 hover:bg-gray-50">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center space-x-2">
                    <ImageIcon className="w-4 h-4 text-blue-600" />
                    <span className="font-medium text-sm">
                      {sequence.frames.length} Frames
                    </span>
                    {sequence.videoBlob && (
                      <Video className="w-4 h-4 text-green-600" />
                    )}
                  </div>
                  <div className="flex items-center space-x-1">
                    <button
                      onClick={() => setSelectedSequence(sequence)}
                      className="p-1 hover:bg-gray-200 rounded"
                      title="View"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDownloadSequence(sequence.id)}
                      className="p-1 hover:bg-gray-200 rounded"
                      title="Download"
                    >
                      <Download className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDeleteSequence(sequence.id)}
                      className="p-1 hover:bg-gray-200 rounded text-red-600"
                      title="Delete"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
                
                <div className="text-xs text-gray-600 space-y-1">
                  <div className="flex items-center space-x-2">
                    <Clock className="w-3 h-3" />
                    <span>{new Date(sequence.timestamp).toLocaleTimeString()}</span>
                  </div>
                  <div>Element: {sequence.context.elementId}</div>
                  <div>Size: {formatFileSize(sequence.metadata.fileSize)}</div>
                  <div>Duration: {sequence.duration}ms</div>
                </div>
                
                {/* Frame Previews */}
                <div className="flex space-x-1 mt-2">
                  {sequence.frames.slice(0, 4).map((frame, index) => (
                    <div key={frame.id} className="w-8 h-8 bg-gray-200 rounded border overflow-hidden">
                      <img
                        src={frame.screenshot}
                        alt={`Frame ${frame.step}`}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Sequence Viewer Modal */}
      <AnimatePresence>
        {selectedSequence && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-60"
            onClick={() => setSelectedSequence(null)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-lg p-6 max-w-4xl max-h-[80vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold">Sequence Viewer</h3>
                <button
                  onClick={() => setSelectedSequence(null)}
                  className="p-2 hover:bg-gray-100 rounded"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                {selectedSequence.frames.map((frame) => (
                  <div key={frame.id} className="border rounded p-3">
                    <h4 className="font-medium mb-2">Frame {frame.step}</h4>
                    <img
                      src={frame.screenshot}
                      alt={`Frame ${frame.step}`}
                      className="w-full h-auto rounded border"
                    />
                    <div className="text-xs text-gray-600 mt-2">
                      <div>Time: {new Date(frame.timestamp).toLocaleTimeString()}</div>
                      <div>Viewport: {frame.viewport.width}x{frame.viewport.height}</div>
                      {frame.elementBounds && (
                        <div>Element: {frame.elementBounds.width}x{frame.elementBounds.height}</div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
              
              {selectedSequence.videoBlob && (
                <div className="mt-4">
                  <h4 className="font-medium mb-2">Video Recording</h4>
                  <video
                    controls
                    className="w-full rounded border"
                    src={URL.createObjectURL(selectedSequence.videoBlob)}
                  />
                </div>
              )}
              
              <div className="flex space-x-2 mt-4">
                <button
                  onClick={() => handleDownloadSequence(selectedSequence.id)}
                  className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 flex items-center space-x-2"
                >
                  <Download className="w-4 h-4" />
                  <span>Download Sequence</span>
                </button>
                {selectedSequence.videoBlob && (
                  <button
                    onClick={() => handleDownloadVideo(selectedSequence.id)}
                    className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 flex items-center space-x-2"
                  >
                    <Video className="w-4 h-4" />
                    <span>Download Video</span>
                  </button>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};
