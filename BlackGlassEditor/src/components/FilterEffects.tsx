/**
 * Professional Filter & Effects System
 * Advanced image processing and visual effects
 */

import React, { useState, useCallback, useRef, useEffect } from 'react';
import { 
  Image, 
  Palette, 
  Sun, 
  Moon, 
  Contrast,
  Sun as Brightness,
  Droplets as Saturation,
  Circle as Blur,
  Zap as Sharpen,
  Filter,
  RotateCw,
  RotateCcw,
  FlipHorizontal,
  FlipVertical,
  Crop,
  Square as Resize,
  Settings as Adjust,
  Layers,
  Eye,
  EyeOff,
  Download,
  Upload,
  Save,
  RotateCcw as RotateCcwIcon,
  Settings,
  Copy,
  Check,
  X,
  Plus,
  Minus,
  RefreshCw,
  Zap,
  Sparkles,
  Droplets,
  Wind,
  Flame,
  Snowflake,
  Heart,
  Star,
  Circle,
  Square,
  Triangle,
  Hexagon,
  Pentagon,
  Octagon,
  Diamond,
  ArrowUp,
  ArrowDown,
  ArrowLeft,
  ArrowRight,
  ChevronUp,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Play,
  Pause,
  Square as Stop,
  SkipBack,
  SkipForward,
  Volume2,
  VolumeX,
  Mic,
  MicOff,
  Camera,
  Video,
  Music,
  Headphones,
  Speaker,
  Radio,
  Tv,
  Monitor,
  Smartphone,
  Tablet,
  Laptop,
  Monitor as Desktop,
  Server,
  Database,
  HardDrive,
  Cpu,
  MemoryStick,
  Wifi,
  Bluetooth,
  Battery,
  BatteryLow,
  BatteryMedium,
  Battery as BatteryHigh,
  BatteryFull,
  Plug,
  Power,
  PowerOff,
  Power as Shutdown,
  RotateCcw as Restart,
  RefreshCw as Refresh,
  RotateCw as RotateCwIcon2,
  RotateCcw as RotateCcwIcon3,
  FlipHorizontal as FlipHorizontalIcon,
  FlipVertical as FlipVerticalIcon,
  Crop as CropIcon,
  Square as ResizeIcon,
  Settings as AdjustIcon,
  Layers as LayersIcon,
  Eye as EyeIcon,
  EyeOff as EyeOffIcon,
  Download as DownloadIcon,
  Upload as UploadIcon,
  Save as SaveIcon,
  RotateCcw as RotateCcwIcon4,
  Settings as SettingsIcon,
  Copy as CopyIcon,
  Check as CheckIcon,
  X as XIcon,
  Plus as PlusIcon,
  Minus as MinusIcon,
  RefreshCw as RefreshCwIcon,
  Zap as ZapIcon,
  Sparkles as SparklesIcon,
  Droplets as DropletsIcon,
  Wind as WindIcon,
  Flame as FlameIcon,
  Snowflake as SnowflakeIcon,
  Heart as HeartIcon,
  Star as StarIcon,
  Circle as CircleIcon,
  Square as SquareIcon,
  Triangle as TriangleIcon,
  Hexagon as HexagonIcon,
  Pentagon as PentagonIcon,
  Octagon as OctagonIcon,
  Diamond as DiamondIcon,
  ArrowUp as ArrowUpIcon,
  ArrowDown as ArrowDownIcon,
  ArrowLeft as ArrowLeftIcon,
  ArrowRight as ArrowRightIcon,
  ChevronUp as ChevronUpIcon,
  ChevronDown as ChevronDownIcon,
  ChevronLeft as ChevronLeftIcon,
  ChevronRight as ChevronRightIcon,
  Play as PlayIcon,
  Pause as PauseIcon,
  Square as StopIcon,
  SkipBack as SkipBackIcon,
  SkipForward as SkipForwardIcon,
  Volume2 as Volume2Icon,
  VolumeX as VolumeXIcon,
  Mic as MicIcon,
  MicOff as MicOffIcon,
  Camera as CameraIcon,
  Video as VideoIcon,
  Music as MusicIcon,
  Headphones as HeadphonesIcon,
  Speaker as SpeakerIcon,
  Radio as RadioIcon,
  Tv as TvIcon,
  Monitor as MonitorIcon,
  Smartphone as SmartphoneIcon,
  Tablet as TabletIcon,
  Laptop as LaptopIcon,
  Monitor as DesktopIcon,
  Server as ServerIcon,
  Database as DatabaseIcon,
  HardDrive as HardDriveIcon,
  Cpu as CpuIcon,
  MemoryStick as MemoryStickIcon,
  Wifi as WifiIcon,
  Bluetooth as BluetoothIcon,
  Battery as BatteryIcon,
  BatteryLow as BatteryLowIcon,
  BatteryMedium as BatteryMediumIcon,
  Battery as BatteryHighIcon,
  BatteryFull as BatteryFullIcon,
  Plug as PlugIcon,
  Power as PowerIcon,
  PowerOff as PowerOffIcon,
  Power as ShutdownIcon,
  RotateCcw as RestartIcon,
  RefreshCw as RefreshIcon,
  Search,
  StarOff
} from 'lucide-react';

export interface FilterEffect {
  id: string;
  name: string;
  category: 'adjustment' | 'blur' | 'distort' | 'stylize' | 'color' | 'custom';
  type: 'adjustment' | 'filter' | 'effect' | 'transform';
  parameters: Record<string, any>;
  preview: string;
  isEnabled: boolean;
  intensity: number;
  blendMode: 'normal' | 'multiply' | 'screen' | 'overlay' | 'soft-light' | 'hard-light' | 'color-dodge' | 'color-burn' | 'darken' | 'lighten' | 'difference' | 'exclusion';
  opacity: number;
  isCustom: boolean;
  isFavorite: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface FilterEffectsProps {
  onEffectApply: (effect: FilterEffect) => void;
  onClose?: () => void;
  className?: string;
}

const FilterEffects: React.FC<FilterEffectsProps> = ({
  onEffectApply,
  onClose,
  className = ''
}) => {
  const [activeTab, setActiveTab] = useState<'adjustments' | 'filters' | 'effects' | 'custom'>('adjustments');
  const [effects, setEffects] = useState<FilterEffect[]>([]);
  const [filteredEffects, setFilteredEffects] = useState<FilterEffect[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [showSettings, setShowSettings] = useState(false);
  const [favoriteEffects, setFavoriteEffects] = useState<Set<string>>(new Set());
  const [copiedEffect, setCopiedEffect] = useState<string | null>(null);
  const [isPreviewMode, setIsPreviewMode] = useState(true);
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Sample effects data
  const sampleEffects: FilterEffect[] = [
    // Adjustments
    {
      id: 'brightness',
      name: 'Brightness',
      category: 'adjustment',
      type: 'adjustment',
      parameters: { value: 0, min: -100, max: 100 },
      preview: 'Brightness adjustment',
      isEnabled: false,
      intensity: 0,
      blendMode: 'normal',
      opacity: 100,
      isCustom: false,
      isFavorite: false,
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      id: 'contrast',
      name: 'Contrast',
      category: 'adjustment',
      type: 'adjustment',
      parameters: { value: 0, min: -100, max: 100 },
      preview: 'Contrast adjustment',
      isEnabled: false,
      intensity: 0,
      blendMode: 'normal',
      opacity: 100,
      isCustom: false,
      isFavorite: false,
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      id: 'saturation',
      name: 'Saturation',
      category: 'adjustment',
      type: 'adjustment',
      parameters: { value: 0, min: -100, max: 100 },
      preview: 'Saturation adjustment',
      isEnabled: false,
      intensity: 0,
      blendMode: 'normal',
      opacity: 100,
      isCustom: false,
      isFavorite: false,
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      id: 'hue',
      name: 'Hue',
      category: 'adjustment',
      type: 'adjustment',
      parameters: { value: 0, min: -180, max: 180 },
      preview: 'Hue adjustment',
      isEnabled: false,
      intensity: 0,
      blendMode: 'normal',
      opacity: 100,
      isCustom: false,
      isFavorite: false,
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      id: 'vibrance',
      name: 'Vibrance',
      category: 'adjustment',
      type: 'adjustment',
      parameters: { value: 0, min: -100, max: 100 },
      preview: 'Vibrance adjustment',
      isEnabled: false,
      intensity: 0,
      blendMode: 'normal',
      opacity: 100,
      isCustom: false,
      isFavorite: false,
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      id: 'exposure',
      name: 'Exposure',
      category: 'adjustment',
      type: 'adjustment',
      parameters: { value: 0, min: -5, max: 5 },
      preview: 'Exposure adjustment',
      isEnabled: false,
      intensity: 0,
      blendMode: 'normal',
      opacity: 100,
      isCustom: false,
      isFavorite: false,
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      id: 'shadows',
      name: 'Shadows',
      category: 'adjustment',
      type: 'adjustment',
      parameters: { value: 0, min: -100, max: 100 },
      preview: 'Shadows adjustment',
      isEnabled: false,
      intensity: 0,
      blendMode: 'normal',
      opacity: 100,
      isCustom: false,
      isFavorite: false,
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      id: 'highlights',
      name: 'Highlights',
      category: 'adjustment',
      type: 'adjustment',
      parameters: { value: 0, min: -100, max: 100 },
      preview: 'Highlights adjustment',
      isEnabled: false,
      intensity: 0,
      blendMode: 'normal',
      opacity: 100,
      isCustom: false,
      isFavorite: false,
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      id: 'whites',
      name: 'Whites',
      category: 'adjustment',
      type: 'adjustment',
      parameters: { value: 0, min: -100, max: 100 },
      preview: 'Whites adjustment',
      isEnabled: false,
      intensity: 0,
      blendMode: 'normal',
      opacity: 100,
      isCustom: false,
      isFavorite: false,
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      id: 'blacks',
      name: 'Blacks',
      category: 'adjustment',
      type: 'adjustment',
      parameters: { value: 0, min: -100, max: 100 },
      preview: 'Blacks adjustment',
      isEnabled: false,
      intensity: 0,
      blendMode: 'normal',
      opacity: 100,
      isCustom: false,
      isFavorite: false,
      createdAt: new Date(),
      updatedAt: new Date()
    },
    
    // Blur Effects
    {
      id: 'gaussian-blur',
      name: 'Gaussian Blur',
      category: 'blur',
      type: 'filter',
      parameters: { radius: 0, min: 0, max: 50 },
      preview: 'Gaussian blur effect',
      isEnabled: false,
      intensity: 0,
      blendMode: 'normal',
      opacity: 100,
      isCustom: false,
      isFavorite: false,
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      id: 'motion-blur',
      name: 'Motion Blur',
      category: 'blur',
      type: 'filter',
      parameters: { angle: 0, distance: 0, min: 0, max: 100 },
      preview: 'Motion blur effect',
      isEnabled: false,
      intensity: 0,
      blendMode: 'normal',
      opacity: 100,
      isCustom: false,
      isFavorite: false,
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      id: 'radial-blur',
      name: 'Radial Blur',
      category: 'blur',
      type: 'filter',
      parameters: { centerX: 50, centerY: 50, radius: 0, min: 0, max: 100 },
      preview: 'Radial blur effect',
      isEnabled: false,
      intensity: 0,
      blendMode: 'normal',
      opacity: 100,
      isCustom: false,
      isFavorite: false,
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      id: 'zoom-blur',
      name: 'Zoom Blur',
      category: 'blur',
      type: 'filter',
      parameters: { centerX: 50, centerY: 50, amount: 0, min: 0, max: 100 },
      preview: 'Zoom blur effect',
      isEnabled: false,
      intensity: 0,
      blendMode: 'normal',
      opacity: 100,
      isCustom: false,
      isFavorite: false,
      createdAt: new Date(),
      updatedAt: new Date()
    },
    
    // Distort Effects
    {
      id: 'wave',
      name: 'Wave',
      category: 'distort',
      type: 'filter',
      parameters: { amplitude: 0, frequency: 0, phase: 0, min: 0, max: 100 },
      preview: 'Wave distortion',
      isEnabled: false,
      intensity: 0,
      blendMode: 'normal',
      opacity: 100,
      isCustom: false,
      isFavorite: false,
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      id: 'ripple',
      name: 'Ripple',
      category: 'distort',
      type: 'filter',
      parameters: { centerX: 50, centerY: 50, radius: 0, strength: 0, min: 0, max: 100 },
      preview: 'Ripple distortion',
      isEnabled: false,
      intensity: 0,
      blendMode: 'normal',
      opacity: 100,
      isCustom: false,
      isFavorite: false,
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      id: 'twist',
      name: 'Twist',
      category: 'distort',
      type: 'filter',
      parameters: { centerX: 50, centerY: 50, angle: 0, radius: 0, min: 0, max: 100 },
      preview: 'Twist distortion',
      isEnabled: false,
      intensity: 0,
      blendMode: 'normal',
      opacity: 100,
      isCustom: false,
      isFavorite: false,
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      id: 'bulge',
      name: 'Bulge',
      category: 'distort',
      type: 'filter',
      parameters: { centerX: 50, centerY: 50, radius: 0, strength: 0, min: 0, max: 100 },
      preview: 'Bulge distortion',
      isEnabled: false,
      intensity: 0,
      blendMode: 'normal',
      opacity: 100,
      isCustom: false,
      isFavorite: false,
      createdAt: new Date(),
      updatedAt: new Date()
    },
    
    // Stylize Effects
    {
      id: 'oil-painting',
      name: 'Oil Painting',
      category: 'stylize',
      type: 'filter',
      parameters: { brushSize: 0, detail: 0, min: 0, max: 100 },
      preview: 'Oil painting effect',
      isEnabled: false,
      intensity: 0,
      blendMode: 'normal',
      opacity: 100,
      isCustom: false,
      isFavorite: false,
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      id: 'watercolor',
      name: 'Watercolor',
      category: 'stylize',
      type: 'filter',
      parameters: { brushSize: 0, intensity: 0, min: 0, max: 100 },
      preview: 'Watercolor effect',
      isEnabled: false,
      intensity: 0,
      blendMode: 'normal',
      opacity: 100,
      isCustom: false,
      isFavorite: false,
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      id: 'sketch',
      name: 'Sketch',
      category: 'stylize',
      type: 'filter',
      parameters: { threshold: 0, detail: 0, min: 0, max: 100 },
      preview: 'Sketch effect',
      isEnabled: false,
      intensity: 0,
      blendMode: 'normal',
      opacity: 100,
      isCustom: false,
      isFavorite: false,
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      id: 'emboss',
      name: 'Emboss',
      category: 'stylize',
      type: 'filter',
      parameters: { angle: 0, height: 0, amount: 0, min: 0, max: 100 },
      preview: 'Emboss effect',
      isEnabled: false,
      intensity: 0,
      blendMode: 'normal',
      opacity: 100,
      isCustom: false,
      isFavorite: false,
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      id: 'posterize',
      name: 'Posterize',
      category: 'stylize',
      type: 'filter',
      parameters: { levels: 0, min: 2, max: 255 },
      preview: 'Posterize effect',
      isEnabled: false,
      intensity: 0,
      blendMode: 'normal',
      opacity: 100,
      isCustom: false,
      isFavorite: false,
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      id: 'halftone',
      name: 'Halftone',
      category: 'stylize',
      type: 'filter',
      parameters: { dotSize: 0, angle: 0, contrast: 0, min: 0, max: 100 },
      preview: 'Halftone effect',
      isEnabled: false,
      intensity: 0,
      blendMode: 'normal',
      opacity: 100,
      isCustom: false,
      isFavorite: false,
      createdAt: new Date(),
      updatedAt: new Date()
    },
    
    // Color Effects
    {
      id: 'sepia',
      name: 'Sepia',
      category: 'color',
      type: 'filter',
      parameters: { intensity: 0, min: 0, max: 100 },
      preview: 'Sepia effect',
      isEnabled: false,
      intensity: 0,
      blendMode: 'normal',
      opacity: 100,
      isCustom: false,
      isFavorite: false,
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      id: 'grayscale',
      name: 'Grayscale',
      category: 'color',
      type: 'filter',
      parameters: { intensity: 0, min: 0, max: 100 },
      preview: 'Grayscale effect',
      isEnabled: false,
      intensity: 0,
      blendMode: 'normal',
      opacity: 100,
      isCustom: false,
      isFavorite: false,
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      id: 'invert',
      name: 'Invert',
      category: 'color',
      type: 'filter',
      parameters: { intensity: 0, min: 0, max: 100 },
      preview: 'Invert effect',
      isEnabled: false,
      intensity: 0,
      blendMode: 'normal',
      opacity: 100,
      isCustom: false,
      isFavorite: false,
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      id: 'vintage',
      name: 'Vintage',
      category: 'color',
      type: 'filter',
      parameters: { intensity: 0, vignette: 0, min: 0, max: 100 },
      preview: 'Vintage effect',
      isEnabled: false,
      intensity: 0,
      blendMode: 'normal',
      opacity: 100,
      isCustom: false,
      isFavorite: false,
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      id: 'cross-process',
      name: 'Cross Process',
      category: 'color',
      type: 'filter',
      parameters: { intensity: 0, contrast: 0, min: 0, max: 100 },
      preview: 'Cross process effect',
      isEnabled: false,
      intensity: 0,
      blendMode: 'normal',
      opacity: 100,
      isCustom: false,
      isFavorite: false,
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      id: 'lomo',
      name: 'Lomo',
      category: 'color',
      type: 'filter',
      parameters: { intensity: 0, vignette: 0, saturation: 0, min: 0, max: 100 },
      preview: 'Lomo effect',
      isEnabled: false,
      intensity: 0,
      blendMode: 'normal',
      opacity: 100,
      isCustom: false,
      isFavorite: false,
      createdAt: new Date(),
      updatedAt: new Date()
    }
  ];

  // Initialize effects
  useEffect(() => {
    setEffects(sampleEffects);
    setFilteredEffects(sampleEffects);
  }, []);

  // Filter effects
  useEffect(() => {
    let filtered = effects.filter(effect => {
      const matchesSearch = effect.name.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory = selectedCategory === 'all' || effect.category === selectedCategory;
      return matchesSearch && matchesCategory;
    });

    setFilteredEffects(filtered);
  }, [effects, searchQuery, selectedCategory]);

  // Handle effect apply
  const handleEffectApply = useCallback((effect: FilterEffect) => {
    onEffectApply(effect);
  }, [onEffectApply]);

  // Handle effect favorite toggle
  const handleEffectFavorite = useCallback((effectId: string) => {
    setFavoriteEffects(prev => {
      const newSet = new Set(prev);
      if (newSet.has(effectId)) {
        newSet.delete(effectId);
      } else {
        newSet.add(effectId);
      }
      return newSet;
    });
    
    setEffects(prev => prev.map(effect => 
      effect.id === effectId ? { ...effect, isFavorite: !effect.isFavorite } : effect
    ));
  }, []);

  // Handle effect copy
  const handleEffectCopy = useCallback((effect: FilterEffect) => {
    const data = {
      name: effect.name,
      category: effect.category,
      type: effect.type,
      parameters: effect.parameters,
      blendMode: effect.blendMode,
      opacity: effect.opacity
    };
    
    navigator.clipboard.writeText(JSON.stringify(data, null, 2));
    setCopiedEffect(effect.id);
    setTimeout(() => setCopiedEffect(null), 2000);
  }, []);

  // Handle effect export
  const handleEffectExport = useCallback(() => {
    const data = {
      effects: effects.map(effect => ({
        name: effect.name,
        category: effect.category,
        type: effect.type,
        parameters: effect.parameters,
        blendMode: effect.blendMode,
        opacity: effect.opacity,
        isCustom: effect.isCustom,
        isFavorite: effect.isFavorite
      })),
      exportedAt: new Date().toISOString()
    };
    
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'filter-effects.json';
    a.click();
    URL.revokeObjectURL(url);
  }, [effects]);

  // Handle effect import
  const handleEffectImport = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = JSON.parse(e.target?.result as string);
        if (data.effects) {
          const importedEffects = data.effects.map((effect: any) => ({
            ...effect,
            id: `effect-${Date.now()}-${Math.random()}`,
            isCustom: true,
            createdAt: new Date(),
            updatedAt: new Date()
          }));
          setEffects(prev => [...importedEffects, ...prev]);
        }
      } catch (error) {
        console.error('Failed to import effects:', error);
      }
    };
    reader.readAsText(file);
  }, []);

  // Clear all effects
  const clearAllEffects = useCallback(() => {
    setEffects([]);
    setFilteredEffects([]);
  }, []);

  const categories = [
    { id: 'all', label: 'All Effects', count: effects.length },
    { id: 'adjustment', label: 'Adjustments', count: effects.filter(e => e.category === 'adjustment').length },
    { id: 'blur', label: 'Blur', count: effects.filter(e => e.category === 'blur').length },
    { id: 'distort', label: 'Distort', count: effects.filter(e => e.category === 'distort').length },
    { id: 'stylize', label: 'Stylize', count: effects.filter(e => e.category === 'stylize').length },
    { id: 'color', label: 'Color', count: effects.filter(e => e.category === 'color').length },
    { id: 'custom', label: 'Custom', count: effects.filter(e => e.category === 'custom').length }
  ];

  return (
    <div className={`bg-white rounded-lg shadow-xl border border-gray-200 p-4 w-full max-w-6xl ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold flex items-center">
          <Filter size={20} className="mr-2" />
          Filter & Effects
        </h3>
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setIsPreviewMode(!isPreviewMode)}
            className={`p-2 rounded ${isPreviewMode ? 'bg-blue-100 text-blue-700' : 'text-gray-500 hover:text-gray-700'}`}
            title="Toggle preview"
          >
            {isPreviewMode ? <Eye size={16} /> : <EyeOff size={16} />}
          </button>
          <button
            onClick={() => setShowSettings(!showSettings)}
            className="p-2 text-gray-500 hover:text-gray-700"
            title="Settings"
          >
            <Settings size={16} />
          </button>
          <button
            onClick={handleEffectExport}
            className="p-2 text-gray-500 hover:text-gray-700"
            title="Export effects"
          >
            <Download size={16} />
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept=".json"
            onChange={handleEffectImport}
            className="hidden"
          />
          <button
            onClick={() => fileInputRef.current?.click()}
            className="p-2 text-gray-500 hover:text-gray-700"
            title="Import effects"
          >
            <Upload size={16} />
          </button>
          <button
            onClick={clearAllEffects}
            className="p-2 text-gray-500 hover:text-gray-700"
            title="Clear all effects"
          >
            <X size={16} />
          </button>
          {onClose && (
            <button
              onClick={onClose}
              className="p-2 text-gray-500 hover:text-gray-700"
            >
              <X size={16} />
            </button>
          )}
        </div>
      </div>

      {/* Search and Filters */}
      <div className="flex items-center space-x-4 mb-4">
        <div className="flex-1 relative">
          <Search size={16} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search effects..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm"
          />
        </div>
        <select
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
          className="px-3 py-2 border border-gray-300 rounded-lg text-sm"
        >
          {categories.map(category => (
            <option key={category.id} value={category.id}>
              {category.label} ({category.count})
            </option>
          ))}
        </select>
      </div>

      {/* Tabs */}
      <div className="flex space-x-1 mb-4">
        {[
          { id: 'adjustments', label: 'Adjustments', icon: Adjust },
          { id: 'filters', label: 'Filters', icon: Filter },
          { id: 'effects', label: 'Effects', icon: Sparkles },
          { id: 'custom', label: 'Custom', icon: Settings }
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`flex items-center space-x-2 px-4 py-2 rounded text-sm ${
              activeTab === tab.id 
                ? 'bg-blue-100 text-blue-700' 
                : 'text-gray-600 hover:text-gray-800'
            }`}
          >
            <tab.icon size={16} />
            <span>{tab.label}</span>
          </button>
        ))}
      </div>

      {/* Effects Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4 max-h-96 overflow-y-auto">
        {filteredEffects.map(effect => (
          <div
            key={effect.id}
            className="border border-gray-200 rounded-lg p-4 hover:border-gray-300 transition-colors cursor-pointer group"
            onClick={() => handleEffectApply(effect)}
          >
            <div className="flex items-center justify-between mb-2">
              <h4 className="font-medium text-sm">{effect.name}</h4>
              <div className="flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleEffectFavorite(effect.id);
                  }}
                  className={`p-1 ${favoriteEffects.has(effect.id) ? 'text-yellow-500' : 'text-gray-400 hover:text-yellow-500'}`}
                  title="Toggle favorite"
                >
                  {favoriteEffects.has(effect.id) ? <StarIcon size={12} /> : <StarOff size={12} />}
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleEffectCopy(effect);
                  }}
                  className="p-1 text-gray-400 hover:text-gray-600"
                  title="Copy effect"
                >
                  {copiedEffect === effect.id ? <Check size={12} /> : <Copy size={12} />}
                </button>
              </div>
            </div>
            
            <div className="flex items-center justify-center h-16 mb-2 bg-gray-100 rounded">
              <div className="text-2xl text-gray-400">
                {effect.category === 'adjustment' && <Adjust size={24} />}
                {effect.category === 'blur' && <Blur size={24} />}
                {effect.category === 'distort' && <Wind size={24} />}
                {effect.category === 'stylize' && <Sparkles size={24} />}
                {effect.category === 'color' && <Palette size={24} />}
                {effect.category === 'custom' && <Settings size={24} />}
              </div>
            </div>
            
            <div className="flex items-center justify-between text-xs text-gray-500">
              <span className="capitalize">{effect.category}</span>
              <span>{effect.type}</span>
            </div>
            
            {effect.isCustom && (
              <div className="mt-2 text-xs text-blue-600 flex items-center">
                <Settings size={10} className="mr-1" />
                Custom
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Settings Panel */}
      {showSettings && (
        <div className="absolute top-12 right-2 z-30 bg-white rounded-lg shadow-xl border border-gray-200 p-4 w-64">
          <h4 className="font-semibold mb-3">Effect Settings</h4>
          
          <div className="space-y-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Show previews</label>
              <input
                type="checkbox"
                className="rounded"
                defaultChecked
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Auto-apply</label>
              <input
                type="checkbox"
                className="rounded"
                defaultChecked
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Preview quality</label>
              <select className="w-full px-3 py-2 border border-gray-300 rounded text-sm">
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Default intensity</label>
              <input
                type="range"
                min="0"
                max="100"
                defaultValue="50"
                className="w-full"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FilterEffects;
