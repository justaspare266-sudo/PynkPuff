import React, { useState, useRef, useEffect } from 'react';
import { Play, Pause, Square, SkipBack, SkipForward, Plus, Trash2, Copy, Eye, EyeOff } from 'lucide-react';

interface Keyframe {
  id: string;
  time: number;
  properties: {
    x?: number;
    y?: number;
    scaleX?: number;
    scaleY?: number;
    rotation?: number;
    opacity?: number;
  };
  easing: 'linear' | 'ease-in' | 'ease-out' | 'ease-in-out' | 'bounce';
}

interface AnimationTrack {
  id: string;
  objectId: string;
  objectName: string;
  keyframes: Keyframe[];
  visible: boolean;
  locked: boolean;
  color: string;
}

interface AnimationTimelineProps {
  objects: any[];
  duration: number;
  onDurationChange: (duration: number) => void;
  onAnimationUpdate: (tracks: AnimationTrack[]) => void;
}

const EASING_OPTIONS = [
  { value: 'linear', label: 'Linear' },
  { value: 'ease-in', label: 'Ease In' },
  { value: 'ease-out', label: 'Ease Out' },
  { value: 'ease-in-out', label: 'Ease In Out' },
  { value: 'bounce', label: 'Bounce' }
];

const TRACK_COLORS = [
  '#3b82f6', '#ef4444', '#10b981', '#f59e0b', '#8b5cf6',
  '#06b6d4', '#f97316', '#84cc16', '#ec4899', '#6366f1'
];

export const AnimationTimeline: React.FC<AnimationTimelineProps> = ({
  objects,
  duration,
  onDurationChange,
  onAnimationUpdate
}) => {
  const [tracks, setTracks] = useState<AnimationTrack[]>([]);
  const [currentTime, setCurrentTime] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [selectedKeyframe, setSelectedKeyframe] = useState<string | null>(null);
  const [zoom, setZoom] = useState(1);
  const [showProperties, setShowProperties] = useState(true);
  const timelineRef = useRef<HTMLDivElement>(null);
  const playbackRef = useRef<number>();

  // Initialize tracks for objects
  useEffect(() => {
    const newTracks = objects.map((obj, index) => ({
      id: `track-${obj.id}`,
      objectId: obj.id,
      objectName: obj.name || `Object ${index + 1}`,
      keyframes: [
        {
          id: `keyframe-${obj.id}-0`,
          time: 0,
          properties: {
            x: obj.x || 0,
            y: obj.y || 0,
            scaleX: obj.scaleX || 1,
            scaleY: obj.scaleY || 1,
            rotation: obj.rotation || 0,
            opacity: obj.opacity || 1
          },
          easing: 'ease-in-out' as const
        }
      ],
      visible: true,
      locked: false,
      color: TRACK_COLORS[index % TRACK_COLORS.length]
    }));
    setTracks(newTracks);
  }, [objects]);

  // Playback animation
  useEffect(() => {
    if (isPlaying) {
      const startTime = Date.now() - (currentTime * 1000);
      
      const animate = () => {
        const elapsed = (Date.now() - startTime) / 1000;
        
        if (elapsed >= duration) {
          setCurrentTime(duration);
          setIsPlaying(false);
          return;
        }
        
        setCurrentTime(elapsed);
        playbackRef.current = requestAnimationFrame(animate);
      };
      
      playbackRef.current = requestAnimationFrame(animate);
    } else {
      if (playbackRef.current) {
        cancelAnimationFrame(playbackRef.current);
      }
    }

    return () => {
      if (playbackRef.current) {
        cancelAnimationFrame(playbackRef.current);
      }
    };
  }, [isPlaying, duration]);

  const handlePlay = () => {
    if (currentTime >= duration) {
      setCurrentTime(0);
    }
    setIsPlaying(!isPlaying);
  };

  const handleStop = () => {
    setIsPlaying(false);
    setCurrentTime(0);
  };

  const handleTimelineClick = (e: React.MouseEvent) => {
    if (!timelineRef.current) return;
    
    const rect = timelineRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const timelineWidth = rect.width - 200; // Account for track labels
    const clickTime = (x - 200) / timelineWidth * duration / zoom;
    
    setCurrentTime(Math.max(0, Math.min(duration, clickTime)));
  };

  const addKeyframe = (trackId: string, time: number) => {
    setTracks(prev => prev.map(track => {
      if (track.id === trackId) {
        const newKeyframe: Keyframe = {
          id: `keyframe-${Date.now()}`,
          time,
          properties: { ...track.keyframes[0].properties },
          easing: 'ease-in-out'
        };
        
        return {
          ...track,
          keyframes: [...track.keyframes, newKeyframe].sort((a, b) => a.time - b.time)
        };
      }
      return track;
    }));
  };

  const deleteKeyframe = (trackId: string, keyframeId: string) => {
    setTracks(prev => prev.map(track => {
      if (track.id === trackId) {
        return {
          ...track,
          keyframes: track.keyframes.filter(kf => kf.id !== keyframeId)
        };
      }
      return track;
    }));
    setSelectedKeyframe(null);
  };

  const updateKeyframe = (trackId: string, keyframeId: string, updates: Partial<Keyframe>) => {
    setTracks(prev => prev.map(track => {
      if (track.id === trackId) {
        return {
          ...track,
          keyframes: track.keyframes.map(kf =>
            kf.id === keyframeId ? { ...kf, ...updates } : kf
          )
        };
      }
      return track;
    }));
  };

  const toggleTrackVisibility = (trackId: string) => {
    setTracks(prev => prev.map(track =>
      track.id === trackId ? { ...track, visible: !track.visible } : track
    ));
  };

  const getTimelinePosition = (time: number) => {
    const timelineWidth = timelineRef.current ? timelineRef.current.clientWidth - 200 : 800;
    return (time / duration) * timelineWidth * zoom;
  };

  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60);
    const seconds = (time % 60).toFixed(1);
    return `${minutes}:${seconds.padStart(4, '0')}`;
  };

  return (
    <div className="bg-white border-t">
      {/* Controls */}
      <div className="flex items-center justify-between p-3 border-b bg-gray-50">
        <div className="flex items-center gap-2">
          <button
            onClick={handlePlay}
            className="p-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
          </button>
          <button
            onClick={handleStop}
            className="p-2 bg-gray-500 text-white rounded hover:bg-gray-600"
          >
            <Square className="w-4 h-4" />
          </button>
          <button className="p-2 hover:bg-gray-200 rounded">
            <SkipBack className="w-4 h-4" />
          </button>
          <button className="p-2 hover:bg-gray-200 rounded">
            <SkipForward className="w-4 h-4" />
          </button>
        </div>

        <div className="flex items-center gap-4">
          <span className="text-sm font-mono">
            {formatTime(currentTime)} / {formatTime(duration)}
          </span>
          
          <div className="flex items-center gap-2">
            <label className="text-sm">Duration:</label>
            <input
              type="number"
              value={duration}
              onChange={(e) => onDurationChange(Number(e.target.value))}
              className="w-16 px-2 py-1 border rounded text-sm"
              min="1"
              max="60"
              step="0.1"
            />
            <span className="text-sm">s</span>
          </div>

          <div className="flex items-center gap-2">
            <label className="text-sm">Zoom:</label>
            <input
              type="range"
              value={zoom}
              onChange={(e) => setZoom(Number(e.target.value))}
              className="w-20"
              min="0.5"
              max="3"
              step="0.1"
            />
          </div>

          <button
            onClick={() => setShowProperties(!showProperties)}
            className="p-2 hover:bg-gray-200 rounded"
          >
            {showProperties ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Timeline */}
      <div className="flex">
        {/* Track Labels */}
        <div className="w-48 bg-gray-50 border-r">
          <div className="h-8 border-b bg-gray-100 flex items-center px-3">
            <span className="text-sm font-medium">Objects</span>
          </div>
          {tracks.map(track => (
            <div key={track.id} className="h-12 border-b flex items-center px-3 hover:bg-gray-100">
              <div className="flex items-center gap-2 flex-1">
                <div
                  className="w-3 h-3 rounded"
                  style={{ backgroundColor: track.color }}
                />
                <span className="text-sm truncate">{track.objectName}</span>
              </div>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => toggleTrackVisibility(track.id)}
                  className="p-1 hover:bg-gray-200 rounded"
                >
                  {track.visible ? <Eye className="w-3 h-3" /> : <EyeOff className="w-3 h-3" />}
                </button>
                <button
                  onClick={() => addKeyframe(track.id, currentTime)}
                  className="p-1 hover:bg-gray-200 rounded"
                >
                  <Plus className="w-3 h-3" />
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Timeline Area */}
        <div className="flex-1 relative overflow-x-auto" ref={timelineRef}>
          {/* Time Ruler */}
          <div className="h-8 border-b bg-gray-100 relative">
            {Array.from({ length: Math.ceil(duration * zoom) + 1 }, (_, i) => (
              <div
                key={i}
                className="absolute top-0 h-full border-l border-gray-300"
                style={{ left: `${(i / zoom) * (100 / duration)}%` }}
              >
                <span className="absolute top-1 left-1 text-xs text-gray-600">
                  {(i / zoom).toFixed(1)}s
                </span>
              </div>
            ))}
          </div>

          {/* Tracks */}
          <div onClick={handleTimelineClick}>
            {tracks.map(track => (
              <div key={track.id} className="h-12 border-b relative hover:bg-gray-50">
                {track.keyframes.map(keyframe => (
                  <div
                    key={keyframe.id}
                    className={`absolute top-2 w-2 h-8 rounded cursor-pointer transform -translate-x-1 ${
                      selectedKeyframe === keyframe.id
                        ? 'ring-2 ring-blue-500'
                        : 'hover:ring-1 hover:ring-gray-400'
                    }`}
                    style={{
                      left: `${(keyframe.time / duration) * 100}%`,
                      backgroundColor: track.color
                    }}
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedKeyframe(keyframe.id);
                    }}
                    onDoubleClick={() => deleteKeyframe(track.id, keyframe.id)}
                  />
                ))}
              </div>
            ))}
          </div>

          {/* Playhead */}
          <div
            className="absolute top-0 bottom-0 w-0.5 bg-red-500 pointer-events-none z-10"
            style={{ left: `${(currentTime / duration) * 100}%` }}
          >
            <div className="absolute -top-1 -left-2 w-4 h-4 bg-red-500 transform rotate-45" />
          </div>
        </div>
      </div>

      {/* Properties Panel */}
      {showProperties && selectedKeyframe && (
        <div className="border-t bg-gray-50 p-4">
          {tracks.map(track => {
            const keyframe = track.keyframes.find(kf => kf.id === selectedKeyframe);
            if (!keyframe) return null;

            return (
              <div key={track.id} className="space-y-3">
                <h3 className="font-medium text-sm">
                  {track.objectName} - Keyframe at {keyframe.time.toFixed(1)}s
                </h3>
                
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div>
                    <label className="block text-xs text-gray-600 mb-1">X Position</label>
                    <input
                      type="number"
                      value={keyframe.properties.x || 0}
                      onChange={(e) => updateKeyframe(track.id, keyframe.id, {
                        properties: { ...keyframe.properties, x: Number(e.target.value) }
                      })}
                      className="w-full px-2 py-1 border rounded text-sm"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-xs text-gray-600 mb-1">Y Position</label>
                    <input
                      type="number"
                      value={keyframe.properties.y || 0}
                      onChange={(e) => updateKeyframe(track.id, keyframe.id, {
                        properties: { ...keyframe.properties, y: Number(e.target.value) }
                      })}
                      className="w-full px-2 py-1 border rounded text-sm"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-xs text-gray-600 mb-1">Scale X</label>
                    <input
                      type="number"
                      value={keyframe.properties.scaleX || 1}
                      onChange={(e) => updateKeyframe(track.id, keyframe.id, {
                        properties: { ...keyframe.properties, scaleX: Number(e.target.value) }
                      })}
                      className="w-full px-2 py-1 border rounded text-sm"
                      step="0.1"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-xs text-gray-600 mb-1">Scale Y</label>
                    <input
                      type="number"
                      value={keyframe.properties.scaleY || 1}
                      onChange={(e) => updateKeyframe(track.id, keyframe.id, {
                        properties: { ...keyframe.properties, scaleY: Number(e.target.value) }
                      })}
                      className="w-full px-2 py-1 border rounded text-sm"
                      step="0.1"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-xs text-gray-600 mb-1">Rotation</label>
                    <input
                      type="number"
                      value={keyframe.properties.rotation || 0}
                      onChange={(e) => updateKeyframe(track.id, keyframe.id, {
                        properties: { ...keyframe.properties, rotation: Number(e.target.value) }
                      })}
                      className="w-full px-2 py-1 border rounded text-sm"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-xs text-gray-600 mb-1">Opacity</label>
                    <input
                      type="number"
                      value={keyframe.properties.opacity || 1}
                      onChange={(e) => updateKeyframe(track.id, keyframe.id, {
                        properties: { ...keyframe.properties, opacity: Number(e.target.value) }
                      })}
                      className="w-full px-2 py-1 border rounded text-sm"
                      min="0"
                      max="1"
                      step="0.1"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-xs text-gray-600 mb-1">Easing</label>
                    <select
                      value={keyframe.easing}
                      onChange={(e) => updateKeyframe(track.id, keyframe.id, {
                        easing: e.target.value as any
                      })}
                      className="w-full px-2 py-1 border rounded text-sm"
                    >
                      {EASING_OPTIONS.map(option => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                  </div>
                  
                  <div className="flex items-end gap-2">
                    <button
                      onClick={() => deleteKeyframe(track.id, keyframe.id)}
                      className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600 text-sm"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};