'use client';

import React, { useState, useCallback } from 'react';
import { useEditor } from '../contexts/EditorContext';
import { ToolPanel } from './ToolPanel';
import { Play, Pause, RotateCw, Move, Zap, Settings, Clock, Layers, Eye, EyeOff, Trash2, Copy, Plus, Minus, ArrowRight, ArrowLeft, ArrowUp, ArrowDown, Circle, Square as SquareIcon, Triangle, Star as StarIcon, Hexagon, Download, Upload, Heart } from 'lucide-react';

// Animation preset definitions
export interface AnimationPreset {
  id: string;
  name: string;
  description: string;
  category: 'entrance' | 'exit' | 'emphasis' | 'motion' | 'custom';
  duration: number;
  keyframes: Array<{
    time: number;
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
    easing: string;
  }>;
  icon: React.ComponentType<any>;
  tags: string[];
  isFavorite: boolean;
  isCustom: boolean;
  author?: string;
  createdAt: Date;
}

// Built-in animation presets
const ANIMATION_PRESETS: AnimationPreset[] = [
  // Entrance Animations
  {
    id: 'fade-in',
    name: 'Fade In',
    description: 'Element fades in from transparent to opaque',
    category: 'entrance',
    duration: 1000,
    keyframes: [
      { time: 0, properties: { opacity: 0 }, easing: 'easeOut' },
      { time: 1000, properties: { opacity: 1 }, easing: 'easeOut' }
    ],
    icon: Eye,
    tags: ['fade', 'entrance', 'opacity'],
    isFavorite: true,
    isCustom: false,
    createdAt: new Date('2024-01-01')
  },
  {
    id: 'slide-in-left',
    name: 'Slide In Left',
    description: 'Element slides in from the left side',
    category: 'entrance',
    duration: 800,
    keyframes: [
      { time: 0, properties: { x: -200, opacity: 0 }, easing: 'easeOut' },
      { time: 800, properties: { x: 0, opacity: 1 }, easing: 'easeOut' }
    ],
    icon: ArrowLeft,
    tags: ['slide', 'entrance', 'left', 'motion'],
    isFavorite: true,
    isCustom: false,
    createdAt: new Date('2024-01-01')
  },
  {
    id: 'slide-in-right',
    name: 'Slide In Right',
    description: 'Element slides in from the right side',
    category: 'entrance',
    duration: 800,
    keyframes: [
      { time: 0, properties: { x: 200, opacity: 0 }, easing: 'easeOut' },
      { time: 800, properties: { x: 0, opacity: 1 }, easing: 'easeOut' }
    ],
    icon: ArrowRight,
    tags: ['slide', 'entrance', 'right', 'motion'],
    isFavorite: false,
    isCustom: false,
    createdAt: new Date('2024-01-01')
  },
  {
    id: 'slide-in-up',
    name: 'Slide In Up',
    description: 'Element slides in from below',
    category: 'entrance',
    duration: 800,
    keyframes: [
      { time: 0, properties: { y: 200, opacity: 0 }, easing: 'easeOut' },
      { time: 800, properties: { y: 0, opacity: 1 }, easing: 'easeOut' }
    ],
    icon: ArrowUp,
    tags: ['slide', 'entrance', 'up', 'motion'],
    isFavorite: false,
    isCustom: false,
    createdAt: new Date('2024-01-01')
  },
  {
    id: 'slide-in-down',
    name: 'Slide In Down',
    description: 'Element slides in from above',
    category: 'entrance',
    duration: 800,
    keyframes: [
      { time: 0, properties: { y: -200, opacity: 0 }, easing: 'easeOut' },
      { time: 800, properties: { y: 0, opacity: 1 }, easing: 'easeOut' }
    ],
    icon: ArrowDown,
    tags: ['slide', 'entrance', 'down', 'motion'],
    isFavorite: false,
    isCustom: false,
    createdAt: new Date('2024-01-01')
  },
  {
    id: 'zoom-in',
    name: 'Zoom In',
    description: 'Element scales up from small to normal size',
    category: 'entrance',
    duration: 600,
    keyframes: [
      { time: 0, properties: { scaleX: 0, scaleY: 0, opacity: 0 }, easing: 'easeOut' },
      { time: 600, properties: { scaleX: 1, scaleY: 1, opacity: 1 }, easing: 'easeOut' }
    ],
    icon: Plus,
    tags: ['zoom', 'entrance', 'scale'],
    isFavorite: true,
    isCustom: false,
    createdAt: new Date('2024-01-01')
  },
  {
    id: 'bounce-in',
    name: 'Bounce In',
    description: 'Element bounces in with elastic effect',
    category: 'entrance',
    duration: 1200,
    keyframes: [
      { time: 0, properties: { scaleX: 0, scaleY: 0, opacity: 0 }, easing: 'bounce' },
      { time: 1200, properties: { scaleX: 1, scaleY: 1, opacity: 1 }, easing: 'bounce' }
    ],
    icon: Circle,
    tags: ['bounce', 'entrance', 'elastic'],
    isFavorite: true,
    isCustom: false,
    createdAt: new Date('2024-01-01')
  },

  // Exit Animations
  {
    id: 'fade-out',
    name: 'Fade Out',
    description: 'Element fades out to transparent',
    category: 'exit',
    duration: 1000,
    keyframes: [
      { time: 0, properties: { opacity: 1 }, easing: 'easeIn' },
      { time: 1000, properties: { opacity: 0 }, easing: 'easeIn' }
    ],
    icon: EyeOff,
    tags: ['fade', 'exit', 'opacity'],
    isFavorite: false,
    isCustom: false,
    createdAt: new Date('2024-01-01')
  },
  {
    id: 'slide-out-left',
    name: 'Slide Out Left',
    description: 'Element slides out to the left',
    category: 'exit',
    duration: 800,
    keyframes: [
      { time: 0, properties: { x: 0, opacity: 1 }, easing: 'easeIn' },
      { time: 800, properties: { x: -200, opacity: 0 }, easing: 'easeIn' }
    ],
    icon: ArrowLeft,
    tags: ['slide', 'exit', 'left', 'motion'],
    isFavorite: false,
    isCustom: false,
    createdAt: new Date('2024-01-01')
  },
  {
    id: 'zoom-out',
    name: 'Zoom Out',
    description: 'Element scales down to small size',
    category: 'exit',
    duration: 600,
    keyframes: [
      { time: 0, properties: { scaleX: 1, scaleY: 1, opacity: 1 }, easing: 'easeIn' },
      { time: 600, properties: { scaleX: 0, scaleY: 0, opacity: 0 }, easing: 'easeIn' }
    ],
    icon: Minus,
    tags: ['zoom', 'exit', 'scale'],
    isFavorite: false,
    isCustom: false,
    createdAt: new Date('2024-01-01')
  },

  // Emphasis Animations
  {
    id: 'pulse',
    name: 'Pulse',
    description: 'Element pulses by scaling up and down',
    category: 'emphasis',
    duration: 2000,
    keyframes: [
      { time: 0, properties: { scaleX: 1, scaleY: 1 }, easing: 'easeInOut' },
      { time: 500, properties: { scaleX: 1.1, scaleY: 1.1 }, easing: 'easeInOut' },
      { time: 1000, properties: { scaleX: 1, scaleY: 1 }, easing: 'easeInOut' },
      { time: 1500, properties: { scaleX: 1.1, scaleY: 1.1 }, easing: 'easeInOut' },
      { time: 2000, properties: { scaleX: 1, scaleY: 1 }, easing: 'easeInOut' }
    ],
    icon: Heart,
    tags: ['pulse', 'emphasis', 'scale', 'loop'],
    isFavorite: true,
    isCustom: false,
    createdAt: new Date('2024-01-01')
  },
  {
    id: 'shake',
    name: 'Shake',
    description: 'Element shakes horizontally',
    category: 'emphasis',
    duration: 1000,
    keyframes: [
      { time: 0, properties: { x: 0 }, easing: 'linear' },
      { time: 100, properties: { x: -10 }, easing: 'linear' },
      { time: 200, properties: { x: 10 }, easing: 'linear' },
      { time: 300, properties: { x: -10 }, easing: 'linear' },
      { time: 400, properties: { x: 10 }, easing: 'linear' },
      { time: 500, properties: { x: -10 }, easing: 'linear' },
      { time: 600, properties: { x: 10 }, easing: 'linear' },
      { time: 700, properties: { x: -10 }, easing: 'linear' },
      { time: 800, properties: { x: 10 }, easing: 'linear' },
      { time: 900, properties: { x: -5 }, easing: 'linear' },
      { time: 1000, properties: { x: 0 }, easing: 'linear' }
    ],
    icon: Zap,
    tags: ['shake', 'emphasis', 'motion'],
    isFavorite: false,
    isCustom: false,
    createdAt: new Date('2024-01-01')
  },
  {
    id: 'wiggle',
    name: 'Wiggle',
    description: 'Element wiggles by rotating back and forth',
    category: 'emphasis',
    duration: 1000,
    keyframes: [
      { time: 0, properties: { rotation: 0 }, easing: 'easeInOut' },
      { time: 200, properties: { rotation: 10 }, easing: 'easeInOut' },
      { time: 400, properties: { rotation: -10 }, easing: 'easeInOut' },
      { time: 600, properties: { rotation: 10 }, easing: 'easeInOut' },
      { time: 800, properties: { rotation: -10 }, easing: 'easeInOut' },
      { time: 1000, properties: { rotation: 0 }, easing: 'easeInOut' }
    ],
    icon: RotateCw,
    tags: ['wiggle', 'emphasis', 'rotation'],
    isFavorite: false,
    isCustom: false,
    createdAt: new Date('2024-01-01')
  },

  // Motion Animations
  {
    id: 'float',
    name: 'Float',
    description: 'Element floats up and down gently',
    category: 'motion',
    duration: 3000,
    keyframes: [
      { time: 0, properties: { y: 0 }, easing: 'easeInOut' },
      { time: 1500, properties: { y: -20 }, easing: 'easeInOut' },
      { time: 3000, properties: { y: 0 }, easing: 'easeInOut' }
    ],
    icon: Move,
    tags: ['float', 'motion', 'gentle'],
    isFavorite: true,
    isCustom: false,
    createdAt: new Date('2024-01-01')
  },
  {
    id: 'spin',
    name: 'Spin',
    description: 'Element rotates 360 degrees',
    category: 'motion',
    duration: 2000,
    keyframes: [
      { time: 0, properties: { rotation: 0 }, easing: 'linear' },
      { time: 2000, properties: { rotation: 360 }, easing: 'linear' }
    ],
    icon: RotateCw,
    tags: ['spin', 'motion', 'rotation'],
    isFavorite: false,
    isCustom: false,
    createdAt: new Date('2024-01-01')
  },
  {
    id: 'orbit',
    name: 'Orbit',
    description: 'Element orbits in a circular motion',
    category: 'motion',
    duration: 4000,
    keyframes: [
      { time: 0, properties: { x: 0, y: 0 }, easing: 'linear' },
      { time: 1000, properties: { x: 50, y: -50 }, easing: 'linear' },
      { time: 2000, properties: { x: 0, y: -100 }, easing: 'linear' },
      { time: 3000, properties: { x: -50, y: -50 }, easing: 'linear' },
      { time: 4000, properties: { x: 0, y: 0 }, easing: 'linear' }
    ],
    icon: Circle,
    tags: ['orbit', 'motion', 'circular'],
    isFavorite: false,
    isCustom: false,
    createdAt: new Date('2024-01-01')
  }
];

export function AnimationPresets() {
  const { state, actions } = useEditor();
  const [presets, setPresets] = useState<AnimationPreset[]>(ANIMATION_PRESETS);
  const [filteredPresets, setFilteredPresets] = useState<AnimationPreset[]>(ANIMATION_PRESETS);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [showFavorites, setShowFavorites] = useState(false);

  // Filter presets
  React.useEffect(() => {
    let filtered = presets;

    if (selectedCategory !== 'all') {
      filtered = filtered.filter(preset => preset.category === selectedCategory);
    }

    if (showFavorites) {
      filtered = filtered.filter(preset => preset.isFavorite);
    }

    if (searchQuery) {
      filtered = filtered.filter(preset =>
        preset.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        preset.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        preset.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
      );
    }

    setFilteredPresets(filtered);
  }, [presets, selectedCategory, showFavorites, searchQuery]);

  // Apply preset to selected shapes
  const applyPreset = useCallback((preset: AnimationPreset) => {
    const selectedShapes = state.shapes.filter(s => 
      state.tool.selectedShapeIds.includes(s.id)
    );

    if (selectedShapes.length === 0) {
      alert('Please select a shape first');
      return;
    }

    selectedShapes.forEach(shape => {
      // Create animation for this shape
      const animation = {
        id: `animation-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        name: `${preset.name} - ${shape.type}`,
        elementId: shape.id,
        keyframes: preset.keyframes.map(kf => ({
          id: `keyframe-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          time: kf.time,
          properties: kf.properties,
          easing: kf.easing,
          duration: 1000
        })),
        duration: preset.duration,
        loop: preset.tags.includes('loop'),
        direction: 'forward' as const,
        delay: 0,
        isPlaying: false,
        isPaused: false,
        currentTime: 0,
        speed: 1
      };

      // This would integrate with your animation system
      console.log('Applying animation preset:', animation);
    });
  }, [state.shapes, state.tool.selectedShapeIds]);

  // Toggle favorite
  const toggleFavorite = useCallback((presetId: string) => {
    setPresets(prev => prev.map(preset =>
      preset.id === presetId ? { ...preset, isFavorite: !preset.isFavorite } : preset
    ));
  }, []);

  // Categories
  const categories = [
    { id: 'all', name: 'All Presets', icon: Layers },
    { id: 'entrance', name: 'Entrance', icon: ArrowRight },
    { id: 'exit', name: 'Exit', icon: ArrowLeft },
    { id: 'emphasis', name: 'Emphasis', icon: Zap },
    { id: 'motion', name: 'Motion', icon: Move },
    { id: 'favorites', name: 'Favorites', icon: Heart }
  ];

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-white mb-4">Animation Presets</h3>
      
      {/* Search and Filters */}
      <div className="space-y-3">
        <div className="flex space-x-2">
          <input
            type="text"
            placeholder="Search presets..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="flex-1 p-2 bg-gray-600 rounded text-sm text-white placeholder-gray-400"
          />
          <button
            onClick={() => setShowFavorites(!showFavorites)}
            className={`p-2 rounded ${showFavorites ? 'bg-red-600 text-white' : 'bg-gray-600 text-gray-300'}`}
            title="Show Favorites"
          >
            <Heart className="w-4 h-4" />
          </button>
        </div>

        {/* Categories */}
        <div className="flex flex-wrap gap-1">
          {categories.map(category => (
            <button
              key={category.id}
              onClick={() => setSelectedCategory(category.id)}
              className={`px-3 py-1 rounded text-sm flex items-center gap-1 ${
                selectedCategory === category.id
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-600 text-gray-300 hover:bg-gray-500'
              }`}
            >
              <category.icon className="w-4 h-4" />
              {category.name}
            </button>
          ))}
        </div>
      </div>

      {/* Presets Grid */}
      <div className="grid grid-cols-2 gap-3 max-h-96 overflow-y-auto">
        {filteredPresets.map(preset => (
          <div
            key={preset.id}
            className="bg-gray-700 rounded-lg p-3 hover:bg-gray-600 transition-colors cursor-pointer"
            onClick={() => applyPreset(preset)}
          >
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <preset.icon className="w-5 h-5 text-blue-400" />
                <h4 className="text-sm font-medium text-white">{preset.name}</h4>
              </div>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  toggleFavorite(preset.id);
                }}
                className={`p-1 rounded ${
                  preset.isFavorite ? 'text-red-400' : 'text-gray-400 hover:text-red-400'
                }`}
              >
                <Heart className="w-4 h-4" />
              </button>
            </div>
            
            <p className="text-xs text-gray-300 mb-2">{preset.description}</p>
            
            <div className="flex items-center justify-between">
              <div className="flex flex-wrap gap-1">
                {preset.tags.slice(0, 2).map(tag => (
                  <span key={tag} className="px-2 py-1 bg-gray-600 rounded text-xs text-gray-300">
                    {tag}
                  </span>
                ))}
              </div>
              <span className="text-xs text-gray-400">
                {preset.duration}ms
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Status */}
      <div className="border-t border-gray-600 pt-4">
        <div className="text-xs text-gray-300 space-y-1">
          <p>Selected: {state.tool.selectedShapeIds.length} shapes</p>
          <p>Presets: {filteredPresets.length} available</p>
          <p>Favorites: {presets.filter(p => p.isFavorite).length}</p>
        </div>
      </div>
    </div>
  );
}

// Tool panel wrapper
export function AnimationPresetsPanel() {
  const { state, actions } = useEditor();

  const openPanel = () => {
    actions.openToolPanel('animation-presets', { x: 600, y: 100 });
  };

  return (
    <>
      <button
        onClick={openPanel}
        className="w-12 h-12 rounded-lg flex items-center justify-center transition-all text-gray-300 hover:bg-gray-700"
        title="Animation Presets"
      >
        <Play className="w-5 h-5" />
      </button>

    </>
  );
}
