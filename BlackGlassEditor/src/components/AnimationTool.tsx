'use client';

import React, { useState, useRef, useEffect, useCallback, forwardRef, useImperativeHandle } from 'react';
import { Play, Pause, RotateCw, Move, Zap, Settings, Clock, Layers, Eye, EyeOff, Trash2, Copy, Plus, Minus, ArrowRight, ArrowLeft, ArrowUp, ArrowDown, Circle, Square as SquareIcon, Triangle, Star, Hexagon, Download, Upload } from 'lucide-react';
import Konva from 'konva';

// Types
export interface AnimationKeyframe {
  id: string;
  time: number; // in milliseconds
  properties: {
    x?: number;
    y?: number;
    rotation?: number;
    scaleX?: number;
    scaleY?: number;
    opacity?: number;
    skewX?: number;
    skewY?: number;
  };
  easing?: string;
  duration?: number; // in milliseconds
}

export interface Animation {
  id: string;
  name: string;
  elementId: string;
  keyframes: AnimationKeyframe[];
  duration: number; // total duration in milliseconds
  loop: boolean;
  direction: 'forward' | 'reverse' | 'alternate';
  delay: number; // delay before starting in milliseconds
  isPlaying: boolean;
  isPaused: boolean;
  currentTime: number;
  speed: number; // playback speed multiplier
}

export interface AnimationToolProps {
  selectedElementIds: string[];
  elements: any[];
  onAnimationUpdate: (animationId: string, updates: Partial<Animation>) => void;
  onAnimationCreate: (animation: Omit<Animation, 'id'>) => void;
  onAnimationDelete: (animationId: string) => void;
  onAnimationPlay: (animationId: string) => void;
  onAnimationPause: (animationId: string) => void;
  onAnimationStop: (animationId: string) => void;
}

export interface AnimationToolRef {
  createAnimation: (elementId: string, name: string) => void;
  addKeyframe: (animationId: string, keyframe: Omit<AnimationKeyframe, 'id'>) => void;
  removeKeyframe: (animationId: string, keyframeId: string) => void;
  playAnimation: (animationId: string) => void;
  pauseAnimation: (animationId: string) => void;
  stopAnimation: (animationId: string) => void;
  seekTo: (animationId: string, time: number) => void;
  setSpeed: (animationId: string, speed: number) => void;
  exportAnimation: (animationId: string) => void;
  importAnimation: (animationData: any) => void;
}

const AnimationTool = forwardRef<AnimationToolRef, AnimationToolProps>(({
  selectedElementIds,
  elements,
  onAnimationUpdate,
  onAnimationCreate,
  onAnimationDelete,
  onAnimationPlay,
  onAnimationPause,
  onAnimationStop
}, ref) => {
  console.log('AnimationTool rendering with:', { selectedElementIds, elements: elements.length });
  // Animation state
  const [animations, setAnimations] = useState<Animation[]>([]);
  const [selectedAnimationId, setSelectedAnimationId] = useState<string | null>(null);
  const [isTimelinePlaying, setIsTimelinePlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [maxDuration, setMaxDuration] = useState(5000); // 5 seconds default

  // UI state
  const [showAdvancedSettings, setShowAdvancedSettings] = useState(false);
  const [showKeyframeEditor, setShowKeyframeEditor] = useState(false);
  const [showEasingEditor, setShowEasingEditor] = useState(false);

  // Refs
  const animationRefs = useRef<Map<string, Konva.Animation>>(new Map());
  const tweenRefs = useRef<Map<string, Konva.Tween>>(new Map());
  const timelineRef = useRef<HTMLDivElement>(null);

  // Easing functions
  const easingFunctions = {
    'linear': Konva.Easings.Linear,
    'easeIn': Konva.Easings.EaseIn,
    'easeOut': Konva.Easings.EaseOut,
    'easeInOut': Konva.Easings.EaseInOut,
    'bounce': Konva.Easings.BounceEaseInOut,
    'elastic': Konva.Easings.ElasticEaseInOut,
    'back': Konva.Easings.BackEaseInOut,
    'circ': Konva.Easings.EaseInOut,
    'cubic': Konva.Easings.EaseInOut,
    'expo': Konva.Easings.EaseInOut,
    'quad': Konva.Easings.EaseInOut,
    'quart': Konva.Easings.EaseInOut,
    'quint': Konva.Easings.EaseInOut,
    'sine': Konva.Easings.EaseInOut
  };

  // Expose methods to parent
  useImperativeHandle(ref, () => ({
    createAnimation: (elementId: string, name: string) => {
      const newAnimation: Omit<Animation, 'id'> = {
        name,
        elementId,
        keyframes: [
          {
            id: `keyframe-${Date.now()}-1`,
            time: 0,
            properties: { x: 0, y: 0, rotation: 0, scaleX: 1, scaleY: 1, opacity: 1 },
            easing: 'linear',
            duration: 1000
          },
          {
            id: `keyframe-${Date.now()}-2`,
            time: 1000,
            properties: { x: 100, y: 100, rotation: 360, scaleX: 1.5, scaleY: 1.5, opacity: 0.8 },
            easing: 'easeInOut',
            duration: 1000
          }
        ],
        duration: 2000,
        loop: false,
        direction: 'forward',
        delay: 0,
        isPlaying: false,
        isPaused: false,
        currentTime: 0,
        speed: 1
      };
      
      onAnimationCreate(newAnimation);
    },
    addKeyframe: (animationId: string, keyframe: Omit<AnimationKeyframe, 'id'>) => {
      const animation = animations.find(a => a.id === animationId);
      if (!animation) return;
      
      const newKeyframe: AnimationKeyframe = {
        ...keyframe,
        id: `keyframe-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
      };
      
      const updatedKeyframes = [...animation.keyframes, newKeyframe].sort((a, b) => a.time - b.time);
      const newDuration = Math.max(...updatedKeyframes.map(k => k.time + (k.duration || 0)));
      
      onAnimationUpdate(animationId, {
        keyframes: updatedKeyframes,
        duration: newDuration
      });
    },
    removeKeyframe: (animationId: string, keyframeId: string) => {
      const animation = animations.find(a => a.id === animationId);
      if (!animation) return;
      
      const updatedKeyframes = animation.keyframes.filter(k => k.id !== keyframeId);
      const newDuration = updatedKeyframes.length > 0 ? Math.max(...updatedKeyframes.map(k => k.time + (k.duration || 0))) : 0;
      
      onAnimationUpdate(animationId, {
        keyframes: updatedKeyframes,
        duration: newDuration
      });
    },
    playAnimation: (animationId: string) => {
      onAnimationPlay(animationId);
    },
    pauseAnimation: (animationId: string) => {
      onAnimationPause(animationId);
    },
    stopAnimation: (animationId: string) => {
      onAnimationStop(animationId);
    },
    seekTo: (animationId: string, time: number) => {
      const animation = animations.find(a => a.id === animationId);
      if (!animation) return;
      
      onAnimationUpdate(animationId, { currentTime: time });
    },
    setSpeed: (animationId: string, speed: number) => {
      onAnimationUpdate(animationId, { speed });
    },
    exportAnimation: (animationId: string) => {
      const animation = animations.find(a => a.id === animationId);
      if (!animation) return;
      
      const animationData = {
        ...animation,
        exportedAt: new Date().toISOString(),
        version: '1.0.0'
      };
      
      const dataStr = JSON.stringify(animationData, null, 2);
      const dataBlob = new Blob([dataStr], { type: 'application/json' });
      const url = URL.createObjectURL(dataBlob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `animation-${animation.name.replace(/\s+/g, '-').toLowerCase()}.json`;
      link.click();
      URL.revokeObjectURL(url);
    },
    importAnimation: (animationData: any) => {
      // This would handle importing animation data
      console.log('Importing animation:', animationData);
    }
  }));

  // Handle animation creation
  const handleCreateAnimation = useCallback(() => {
    if (selectedElementIds.length === 0) return;
    
    const elementId = selectedElementIds[0];
    const element = elements.find(el => el.id === elementId);
    if (!element) return;
    
    const name = `Animation for ${element.type} ${element.id.slice(-4)}`;
    onAnimationCreate({
      name,
      elementId,
      keyframes: [
        {
          id: `keyframe-${Date.now()}-1`,
          time: 0,
          properties: { 
            x: element.x, 
            y: element.y, 
            rotation: element.rotation || 0, 
            scaleX: element.scaleX || 1, 
            scaleY: element.scaleY || 1, 
            opacity: element.opacity || 1 
          },
          easing: 'linear',
          duration: 1000
        }
      ],
      duration: 1000,
      loop: false,
      direction: 'forward',
      delay: 0,
      isPlaying: false,
      isPaused: false,
      currentTime: 0,
      speed: 1
    });
  }, [selectedElementIds, elements, onAnimationCreate]);

  // Handle animation play/pause
  const handlePlayPause = useCallback((animationId: string) => {
    const animation = animations.find(a => a.id === animationId);
    if (!animation) return;
    
    if (animation.isPlaying) {
      onAnimationPause(animationId);
    } else {
      onAnimationPlay(animationId);
    }
  }, [animations, onAnimationPlay, onAnimationPause]);

  // Handle animation stop
  const handleStop = useCallback((animationId: string) => {
    onAnimationStop(animationId);
  }, [onAnimationStop]);

  // Handle timeline seek
  const handleTimelineSeek = useCallback((time: number) => {
    setCurrentTime(time);
    if (selectedAnimationId) {
      onAnimationUpdate(selectedAnimationId, { currentTime: time });
    }
  }, [selectedAnimationId, onAnimationUpdate]);

  // Handle speed change
  const handleSpeedChange = useCallback((animationId: string, speed: number) => {
    onAnimationUpdate(animationId, { speed });
  }, [onAnimationUpdate]);

  // Handle loop toggle
  const handleLoopToggle = useCallback((animationId: string) => {
    const animation = animations.find(a => a.id === animationId);
    if (!animation) return;
    
    onAnimationUpdate(animationId, { loop: !animation.loop });
  }, [animations, onAnimationUpdate]);

  // Handle direction change
  const handleDirectionChange = useCallback((animationId: string, direction: Animation['direction']) => {
    onAnimationUpdate(animationId, { direction });
  }, [onAnimationUpdate]);

  // Handle delay change
  const handleDelayChange = useCallback((animationId: string, delay: number) => {
    onAnimationUpdate(animationId, { delay });
  }, [onAnimationUpdate]);

  // Handle keyframe addition
  const handleAddKeyframe = useCallback((animationId: string) => {
    const animation = animations.find(a => a.id === animationId);
    if (!animation) return;
    
    const element = elements.find(el => el.id === animation.elementId);
    if (!element) return;
    
    const newKeyframe: AnimationKeyframe = {
      id: `keyframe-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      time: currentTime,
      properties: {
        x: element.x,
        y: element.y,
        rotation: element.rotation || 0,
        scaleX: element.scaleX || 1,
        scaleY: element.scaleY || 1,
        opacity: element.opacity || 1
      },
      easing: 'easeInOut',
      duration: 1000
    };
    
    onAnimationUpdate(animationId, {
      keyframes: [...animation.keyframes, newKeyframe].sort((a, b) => a.time - b.time)
    });
  }, [animations, elements, currentTime, onAnimationUpdate]);

  // Handle keyframe removal
  const handleRemoveKeyframe = useCallback((animationId: string, keyframeId: string) => {
    const animation = animations.find(a => a.id === animationId);
    if (!animation) return;
    
    const updatedKeyframes = animation.keyframes.filter(k => k.id !== keyframeId);
    onAnimationUpdate(animationId, { keyframes: updatedKeyframes });
  }, [animations, onAnimationUpdate]);

  // Handle keyframe time change
  const handleKeyframeTimeChange = useCallback((animationId: string, keyframeId: string, time: number) => {
    const animation = animations.find(a => a.id === animationId);
    if (!animation) return;
    
    const updatedKeyframes = animation.keyframes.map(k => 
      k.id === keyframeId ? { ...k, time } : k
    ).sort((a, b) => a.time - b.time);
    
    onAnimationUpdate(animationId, { keyframes: updatedKeyframes });
  }, [animations, onAnimationUpdate]);

  // Handle keyframe properties change
  const handleKeyframePropertiesChange = useCallback((animationId: string, keyframeId: string, properties: Partial<AnimationKeyframe['properties']>) => {
    const animation = animations.find(a => a.id === animationId);
    if (!animation) return;
    
    const updatedKeyframes = animation.keyframes.map(k => 
      k.id === keyframeId ? { ...k, properties: { ...k.properties, ...properties } } : k
    );
    
    onAnimationUpdate(animationId, { keyframes: updatedKeyframes });
  }, [animations, onAnimationUpdate]);

  // Handle keyframe easing change
  const handleKeyframeEasingChange = useCallback((animationId: string, keyframeId: string, easing: string) => {
    const animation = animations.find(a => a.id === animationId);
    if (!animation) return;
    
    const updatedKeyframes = animation.keyframes.map(k => 
      k.id === keyframeId ? { ...k, easing } : k
    );
    
    onAnimationUpdate(animationId, { keyframes: updatedKeyframes });
  }, [animations, onAnimationUpdate]);

  return (
    <div className="animation-tool space-y-4">
      <h3 className="text-lg font-semibold flex items-center">
        <Play className="w-5 h-5 mr-2" />
        Animation Tool
      </h3>

      {/* Animation List */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <h4 className="text-sm font-semibold">Animations</h4>
          <button
            className="p-2 bg-blue-600 hover:bg-blue-700 rounded text-sm"
            onClick={handleCreateAnimation}
            disabled={selectedElementIds.length === 0}
          >
            <Plus className="w-4 h-4" />
          </button>
        </div>
        
        <div className="space-y-2 max-h-40 overflow-y-auto">
          {animations.map((animation) => (
            <div
              key={animation.id}
              className={`p-3 rounded cursor-pointer transition-colors ${
                selectedAnimationId === animation.id ? 'bg-blue-600' : 'bg-gray-700 hover:bg-gray-600'
              }`}
              onClick={() => setSelectedAnimationId(animation.id)}
            >
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="text-sm font-medium text-white">{animation.name}</div>
                  <div className="text-xs text-gray-400">
                    {animation.keyframes.length} keyframes • {animation.duration}ms
                  </div>
                </div>
                <div className="flex items-center space-x-1">
                  <button
                    className="p-1 hover:bg-gray-500 rounded"
                    onClick={(e) => {
                      e.stopPropagation();
                      handlePlayPause(animation.id);
                    }}
                  >
                    {animation.isPlaying ? (
                      <Pause className="w-4 h-4" />
                    ) : (
                      <Play className="w-4 h-4" />
                    )}
                  </button>
                  <button
                    className="p-1 hover:bg-gray-500 rounded"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleStop(animation.id);
                    }}
                  >
                    <Square className="w-4 h-4" />
                  </button>
                  <button
                    className="p-1 hover:bg-red-500 rounded"
                    onClick={(e) => {
                      e.stopPropagation();
                      onAnimationDelete(animation.id);
                    }}
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Timeline */}
      {selectedAnimationId && (
        <div className="space-y-3">
          <h4 className="text-sm font-semibold">Timeline</h4>
          <div className="bg-gray-800 p-3 rounded">
            <div className="flex items-center space-x-2 mb-2">
              <input
                type="range"
                min="0"
                max={maxDuration}
                step="10"
                value={currentTime}
                onChange={(e) => handleTimelineSeek(parseInt(e.target.value))}
                className="flex-1"
              />
              <span className="text-xs text-gray-400 w-16">
                {Math.round(currentTime)}ms
              </span>
            </div>
            
            <div className="flex items-center justify-between text-xs text-gray-400">
              <span>0ms</span>
              <span>{maxDuration}ms</span>
            </div>
          </div>
        </div>
      )}

      {/* Keyframe Editor */}
      {selectedAnimationId && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-semibold">Keyframes</h4>
            <button
              className="p-2 bg-green-600 hover:bg-green-700 rounded text-sm"
              onClick={() => handleAddKeyframe(selectedAnimationId)}
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>
          
          <div className="space-y-2 max-h-32 overflow-y-auto">
            {animations
              .find(a => a.id === selectedAnimationId)
              ?.keyframes.map((keyframe, index) => (
                <div key={keyframe.id} className="p-2 bg-gray-700 rounded">
                  <div className="flex items-center space-x-2 mb-2">
                    <span className="text-xs text-gray-400">#{index + 1}</span>
                    <input
                      type="number"
                      value={keyframe.time}
                      onChange={(e) => handleKeyframeTimeChange(selectedAnimationId, keyframe.id, parseInt(e.target.value))}
                      className="w-20 p-1 bg-gray-600 rounded text-xs"
                      min="0"
                    />
                    <span className="text-xs text-gray-400">ms</span>
                    <button
                      className="p-1 hover:bg-red-500 rounded"
                      onClick={() => handleRemoveKeyframe(selectedAnimationId, keyframe.id)}
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div>
                      <label className="block text-gray-400 mb-1">X</label>
                      <input
                        type="number"
                        value={keyframe.properties.x || 0}
                        onChange={(e) => handleKeyframePropertiesChange(selectedAnimationId, keyframe.id, { x: parseFloat(e.target.value) })}
                        className="w-full p-1 bg-gray-600 rounded"
                      />
                    </div>
                    <div>
                      <label className="block text-gray-400 mb-1">Y</label>
                      <input
                        type="number"
                        value={keyframe.properties.y || 0}
                        onChange={(e) => handleKeyframePropertiesChange(selectedAnimationId, keyframe.id, { y: parseFloat(e.target.value) })}
                        className="w-full p-1 bg-gray-600 rounded"
                      />
                    </div>
                    <div>
                      <label className="block text-gray-400 mb-1">Rotation</label>
                      <input
                        type="number"
                        value={keyframe.properties.rotation || 0}
                        onChange={(e) => handleKeyframePropertiesChange(selectedAnimationId, keyframe.id, { rotation: parseFloat(e.target.value) })}
                        className="w-full p-1 bg-gray-600 rounded"
                      />
                    </div>
                    <div>
                      <label className="block text-gray-400 mb-1">Scale</label>
                      <input
                        type="number"
                        value={keyframe.properties.scaleX || 1}
                        onChange={(e) => handleKeyframePropertiesChange(selectedAnimationId, keyframe.id, { scaleX: parseFloat(e.target.value), scaleY: parseFloat(e.target.value) })}
                        className="w-full p-1 bg-gray-600 rounded"
                        step="0.1"
                      />
                    </div>
                    <div>
                      <label className="block text-gray-400 mb-1">Opacity</label>
                      <input
                        type="number"
                        value={keyframe.properties.opacity || 1}
                        onChange={(e) => handleKeyframePropertiesChange(selectedAnimationId, keyframe.id, { opacity: parseFloat(e.target.value) })}
                        className="w-full p-1 bg-gray-600 rounded"
                        min="0"
                        max="1"
                        step="0.1"
                      />
                    </div>
                    <div>
                      <label className="block text-gray-400 mb-1">Easing</label>
                      <select
                        value={keyframe.easing || 'linear'}
                        onChange={(e) => handleKeyframeEasingChange(selectedAnimationId, keyframe.id, e.target.value)}
                        className="w-full p-1 bg-gray-600 rounded text-xs"
                      >
                        {Object.keys(easingFunctions).map(easing => (
                          <option key={easing} value={easing}>{easing}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>
              ))}
          </div>
        </div>
      )}

      {/* Animation Settings */}
      {selectedAnimationId && (
        <div className="space-y-3">
          <h4 className="text-sm font-semibold">Settings</h4>
          <div className="bg-gray-800 p-3 rounded space-y-3">
            <div>
              <label className="block text-sm font-medium mb-2">Speed</label>
              <input
                type="range"
                min="0.1"
                max="3"
                step="0.1"
                value={animations.find(a => a.id === selectedAnimationId)?.speed || 1}
                onChange={(e) => handleSpeedChange(selectedAnimationId, parseFloat(e.target.value))}
                className="w-full"
              />
              <span className="text-xs text-gray-400">
                {animations.find(a => a.id === selectedAnimationId)?.speed || 1}x
              </span>
            </div>
            
            <div className="flex items-center">
              <input
                type="checkbox"
                checked={animations.find(a => a.id === selectedAnimationId)?.loop || false}
                onChange={(e) => handleLoopToggle(selectedAnimationId)}
                className="mr-2"
              />
              <label className="text-sm">Loop Animation</label>
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-2">Direction</label>
              <select
                value={animations.find(a => a.id === selectedAnimationId)?.direction || 'forward'}
                onChange={(e) => handleDirectionChange(selectedAnimationId, e.target.value as Animation['direction'])}
                className="w-full p-2 bg-gray-600 rounded text-sm"
              >
                <option value="forward">Forward</option>
                <option value="reverse">Reverse</option>
                <option value="alternate">Alternate</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-2">Delay</label>
              <input
                type="number"
                value={animations.find(a => a.id === selectedAnimationId)?.delay || 0}
                onChange={(e) => handleDelayChange(selectedAnimationId, parseInt(e.target.value))}
                className="w-full p-2 bg-gray-600 rounded text-sm"
                min="0"
                step="100"
              />
              <span className="text-xs text-gray-400">milliseconds</span>
            </div>
          </div>
        </div>
      )}

      {/* Export/Import */}
      <div className="flex space-x-2">
        <button
          className="flex-1 p-2 bg-green-600 hover:bg-green-700 rounded text-sm"
          onClick={() => selectedAnimationId && onAnimationUpdate(selectedAnimationId, {})}
          disabled={!selectedAnimationId}
        >
          <Download className="w-4 h-4 inline mr-1" />
          Export
        </button>
        <button
          className="flex-1 p-2 bg-blue-600 hover:bg-blue-700 rounded text-sm"
          onClick={() => {
            const input = document.createElement('input');
            input.type = 'file';
            input.accept = '.json';
            input.onchange = (e) => {
              const file = (e.target as HTMLInputElement).files?.[0];
              if (file) {
                const reader = new FileReader();
                reader.onload = (e) => {
                  try {
                    const data = JSON.parse(e.target?.result as string);
                    onAnimationCreate(data);
                  } catch (error) {
                    console.error('Failed to import animation:', error);
                  }
                };
                reader.readAsText(file);
              }
            };
            input.click();
          }}
        >
          <Upload className="w-4 h-4 inline mr-1" />
          Import
        </button>
      </div>
    </div>
  );
});

AnimationTool.displayName = 'AnimationTool';

export default AnimationTool;
