/**
 * Professional Shadow & Visual Effects System
 * Advanced shadow, glow, and visual effects
 */

import React, { useState, useCallback, useRef, useEffect } from 'react';
import { 
  Sun, 
  Moon, 
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

export interface ShadowEffect {
  id: string;
  name: string;
  category: 'shadow' | 'glow' | 'outline' | 'bevel' | 'emboss' | 'custom';
  type: 'drop-shadow' | 'inner-shadow' | 'glow' | 'outline' | 'bevel' | 'emboss' | 'custom';
  parameters: {
    offsetX: number;
    offsetY: number;
    blur: number;
    spread: number;
    color: string;
    opacity: number;
    angle: number;
    distance: number;
    size: number;
    intensity: number;
    style: 'normal' | 'inset' | 'outset';
    blendMode: 'normal' | 'multiply' | 'screen' | 'overlay' | 'soft-light' | 'hard-light' | 'color-dodge' | 'color-burn' | 'darken' | 'lighten' | 'difference' | 'exclusion';
  };
  preview: string;
  isEnabled: boolean;
  isCustom: boolean;
  isFavorite: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface ShadowEffectsProps {
  onEffectApply: (effect: ShadowEffect) => void;
  onClose?: () => void;
  className?: string;
}

const ShadowEffects: React.FC<ShadowEffectsProps> = ({
  onEffectApply,
  onClose,
  className = ''
}) => {
  const [activeTab, setActiveTab] = useState<'shadows' | 'glows' | 'outlines' | 'custom'>('shadows');
  const [effects, setEffects] = useState<ShadowEffect[]>([]);
  const [filteredEffects, setFilteredEffects] = useState<ShadowEffect[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [showSettings, setShowSettings] = useState(false);
  const [favoriteEffects, setFavoriteEffects] = useState<Set<string>>(new Set());
  const [copiedEffect, setCopiedEffect] = useState<string | null>(null);
  const [isPreviewMode, setIsPreviewMode] = useState(true);
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Sample effects data
  const sampleEffects: ShadowEffect[] = [
    // Photoshop Express Style Presets
    {
      id: 'classic-shadow',
      name: 'Classic',
      category: 'shadow',
      type: 'drop-shadow',
      parameters: {
        offsetX: 2,
        offsetY: 2,
        blur: 4,
        spread: 0,
        color: '#000000',
        opacity: 0.3,
        angle: 45,
        distance: 2,
        size: 4,
        intensity: 30,
        style: 'normal',
        blendMode: 'normal'
      },
      preview: 'Classic drop shadow',
      isEnabled: false,
      isCustom: false,
      isFavorite: false,
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      id: 'smooth-shadow',
      name: 'Smooth',
      category: 'shadow',
      type: 'drop-shadow',
      parameters: {
        offsetX: 1,
        offsetY: 1,
        blur: 8,
        spread: 0,
        color: '#000000',
        opacity: 0.2,
        angle: 45,
        distance: 1,
        size: 8,
        intensity: 20,
        style: 'normal',
        blendMode: 'normal'
      },
      preview: 'Smooth drop shadow',
      isEnabled: false,
      isCustom: false,
      isFavorite: false,
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      id: 'lift-shadow',
      name: 'Lift',
      category: 'shadow',
      type: 'drop-shadow',
      parameters: {
        offsetX: 0,
        offsetY: -4,
        blur: 8,
        spread: 0,
        color: '#000000',
        opacity: 0.4,
        angle: 90,
        distance: 4,
        size: 8,
        intensity: 40,
        style: 'normal',
        blendMode: 'normal'
      },
      preview: 'Lift shadow effect',
      isEnabled: false,
      isCustom: false,
      isFavorite: false,
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      id: 'glow-shadow',
      name: 'Glow',
      category: 'glow',
      type: 'glow',
      parameters: {
        offsetX: 0,
        offsetY: 0,
        blur: 12,
        spread: 0,
        color: '#000000',
        opacity: 0.6,
        angle: 0,
        distance: 0,
        size: 12,
        intensity: 60,
        style: 'normal',
        blendMode: 'normal'
      },
      preview: 'Glow effect',
      isEnabled: false,
      isCustom: false,
      isFavorite: false,
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      id: 'halo-shadow',
      name: 'Halo',
      category: 'glow',
      type: 'glow',
      parameters: {
        offsetX: 0,
        offsetY: 0,
        blur: 16,
        spread: 0,
        color: '#ffffff',
        opacity: 0.8,
        angle: 0,
        distance: 0,
        size: 16,
        intensity: 80,
        style: 'normal',
        blendMode: 'normal'
      },
      preview: 'Halo effect',
      isEnabled: false,
      isCustom: false,
      isFavorite: false,
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      id: 'strong-shadow',
      name: 'Strong',
      category: 'shadow',
      type: 'drop-shadow',
      parameters: {
        offsetX: 4,
        offsetY: 4,
        blur: 2,
        spread: 0,
        color: '#000000',
        opacity: 0.7,
        angle: 45,
        distance: 4,
        size: 2,
        intensity: 70,
        style: 'normal',
        blendMode: 'normal'
      },
      preview: 'Strong drop shadow',
      isEnabled: false,
      isCustom: false,
      isFavorite: false,
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      id: 'hazy-shadow',
      name: 'Hazy',
      category: 'shadow',
      type: 'drop-shadow',
      parameters: {
        offsetX: 3,
        offsetY: 3,
        blur: 20,
        spread: 0,
        color: '#000000',
        opacity: 0.15,
        angle: 45,
        distance: 3,
        size: 20,
        intensity: 15,
        style: 'normal',
        blendMode: 'normal'
      },
      preview: 'Hazy shadow effect',
      isEnabled: false,
      isCustom: false,
      isFavorite: false,
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      id: 'custom-shadow',
      name: 'Custom',
      category: 'custom',
      type: 'custom',
      parameters: {
        offsetX: 0,
        offsetY: 0,
        blur: 0,
        spread: 0,
        color: '#000000',
        opacity: 0,
        angle: 0,
        distance: 0,
        size: 0,
        intensity: 0,
        style: 'normal',
        blendMode: 'normal'
      },
      preview: 'Custom shadow settings',
      isEnabled: false,
      isCustom: true,
      isFavorite: false,
      createdAt: new Date(),
      updatedAt: new Date()
    },
    // Original Drop Shadows
    {
      id: 'drop-shadow-soft',
      name: 'Soft Drop Shadow',
      category: 'shadow',
      type: 'drop-shadow',
      parameters: {
        offsetX: 2,
        offsetY: 2,
        blur: 4,
        spread: 0,
        color: '#000000',
        opacity: 0.25,
        angle: 45,
        distance: 2,
        size: 4,
        intensity: 50,
        style: 'normal',
        blendMode: 'normal'
      },
      preview: 'Soft drop shadow effect',
      isEnabled: false,
      isCustom: false,
      isFavorite: false,
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      id: 'drop-shadow-hard',
      name: 'Hard Drop Shadow',
      category: 'shadow',
      type: 'drop-shadow',
      parameters: {
        offsetX: 4,
        offsetY: 4,
        blur: 0,
        spread: 0,
        color: '#000000',
        opacity: 0.5,
        angle: 45,
        distance: 4,
        size: 0,
        intensity: 100,
        style: 'normal',
        blendMode: 'normal'
      },
      preview: 'Hard drop shadow effect',
      isEnabled: false,
      isCustom: false,
      isFavorite: false,
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      id: 'drop-shadow-large',
      name: 'Large Drop Shadow',
      category: 'shadow',
      type: 'drop-shadow',
      parameters: {
        offsetX: 8,
        offsetY: 8,
        blur: 16,
        spread: 0,
        color: '#000000',
        opacity: 0.3,
        angle: 45,
        distance: 8,
        size: 16,
        intensity: 30,
        style: 'normal',
        blendMode: 'normal'
      },
      preview: 'Large drop shadow effect',
      isEnabled: false,
      isCustom: false,
      isFavorite: false,
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      id: 'drop-shadow-colored',
      name: 'Colored Drop Shadow',
      category: 'shadow',
      type: 'drop-shadow',
      parameters: {
        offsetX: 3,
        offsetY: 3,
        blur: 6,
        spread: 0,
        color: '#3b82f6',
        opacity: 0.4,
        angle: 45,
        distance: 3,
        size: 6,
        intensity: 40,
        style: 'normal',
        blendMode: 'normal'
      },
      preview: 'Colored drop shadow effect',
      isEnabled: false,
      isCustom: false,
      isFavorite: false,
      createdAt: new Date(),
      updatedAt: new Date()
    },
    
    // Inner Shadows
    {
      id: 'inner-shadow-soft',
      name: 'Soft Inner Shadow',
      category: 'shadow',
      type: 'inner-shadow',
      parameters: {
        offsetX: 1,
        offsetY: 1,
        blur: 3,
        spread: 0,
        color: '#000000',
        opacity: 0.2,
        angle: 45,
        distance: 1,
        size: 3,
        intensity: 20,
        style: 'inset',
        blendMode: 'normal'
      },
      preview: 'Soft inner shadow effect',
      isEnabled: false,
      isCustom: false,
      isFavorite: false,
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      id: 'inner-shadow-hard',
      name: 'Hard Inner Shadow',
      category: 'shadow',
      type: 'inner-shadow',
      parameters: {
        offsetX: 2,
        offsetY: 2,
        blur: 0,
        spread: 0,
        color: '#000000',
        opacity: 0.4,
        angle: 45,
        distance: 2,
        size: 0,
        intensity: 40,
        style: 'inset',
        blendMode: 'normal'
      },
      preview: 'Hard inner shadow effect',
      isEnabled: false,
      isCustom: false,
      isFavorite: false,
      createdAt: new Date(),
      updatedAt: new Date()
    },
    
    // Glows
    {
      id: 'glow-soft',
      name: 'Soft Glow',
      category: 'glow',
      type: 'glow',
      parameters: {
        offsetX: 0,
        offsetY: 0,
        blur: 8,
        spread: 0,
        color: '#ffffff',
        opacity: 0.6,
        angle: 0,
        distance: 0,
        size: 8,
        intensity: 60,
        style: 'normal',
        blendMode: 'screen'
      },
      preview: 'Soft glow effect',
      isEnabled: false,
      isCustom: false,
      isFavorite: false,
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      id: 'glow-strong',
      name: 'Strong Glow',
      category: 'glow',
      type: 'glow',
      parameters: {
        offsetX: 0,
        offsetY: 0,
        blur: 12,
        spread: 0,
        color: '#ffffff',
        opacity: 0.8,
        angle: 0,
        distance: 0,
        size: 12,
        intensity: 80,
        style: 'normal',
        blendMode: 'screen'
      },
      preview: 'Strong glow effect',
      isEnabled: false,
      isCustom: false,
      isFavorite: false,
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      id: 'glow-colored',
      name: 'Colored Glow',
      category: 'glow',
      type: 'glow',
      parameters: {
        offsetX: 0,
        offsetY: 0,
        blur: 10,
        spread: 0,
        color: '#3b82f6',
        opacity: 0.7,
        angle: 0,
        distance: 0,
        size: 10,
        intensity: 70,
        style: 'normal',
        blendMode: 'screen'
      },
      preview: 'Colored glow effect',
      isEnabled: false,
      isCustom: false,
      isFavorite: false,
      createdAt: new Date(),
      updatedAt: new Date()
    },
    
    // Outlines
    {
      id: 'outline-thin',
      name: 'Thin Outline',
      category: 'outline',
      type: 'outline',
      parameters: {
        offsetX: 0,
        offsetY: 0,
        blur: 0,
        spread: 1,
        color: '#000000',
        opacity: 1,
        angle: 0,
        distance: 0,
        size: 1,
        intensity: 100,
        style: 'normal',
        blendMode: 'normal'
      },
      preview: 'Thin outline effect',
      isEnabled: false,
      isCustom: false,
      isFavorite: false,
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      id: 'outline-thick',
      name: 'Thick Outline',
      category: 'outline',
      type: 'outline',
      parameters: {
        offsetX: 0,
        offsetY: 0,
        blur: 0,
        spread: 3,
        color: '#000000',
        opacity: 1,
        angle: 0,
        distance: 0,
        size: 3,
        intensity: 100,
        style: 'normal',
        blendMode: 'normal'
      },
      preview: 'Thick outline effect',
      isEnabled: false,
      isCustom: false,
      isFavorite: false,
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      id: 'outline-colored',
      name: 'Colored Outline',
      category: 'outline',
      type: 'outline',
      parameters: {
        offsetX: 0,
        offsetY: 0,
        blur: 0,
        spread: 2,
        color: '#3b82f6',
        opacity: 1,
        angle: 0,
        distance: 0,
        size: 2,
        intensity: 100,
        style: 'normal',
        blendMode: 'normal'
      },
      preview: 'Colored outline effect',
      isEnabled: false,
      isCustom: false,
      isFavorite: false,
      createdAt: new Date(),
      updatedAt: new Date()
    },
    
    // Bevel Effects
    {
      id: 'bevel-soft',
      name: 'Soft Bevel',
      category: 'bevel',
      type: 'bevel',
      parameters: {
        offsetX: 1,
        offsetY: 1,
        blur: 2,
        spread: 0,
        color: '#ffffff',
        opacity: 0.5,
        angle: 45,
        distance: 1,
        size: 2,
        intensity: 50,
        style: 'outset',
        blendMode: 'overlay'
      },
      preview: 'Soft bevel effect',
      isEnabled: false,
      isCustom: false,
      isFavorite: false,
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      id: 'bevel-hard',
      name: 'Hard Bevel',
      category: 'bevel',
      type: 'bevel',
      parameters: {
        offsetX: 2,
        offsetY: 2,
        blur: 0,
        spread: 0,
        color: '#ffffff',
        opacity: 0.8,
        angle: 45,
        distance: 2,
        size: 0,
        intensity: 80,
        style: 'outset',
        blendMode: 'overlay'
      },
      preview: 'Hard bevel effect',
      isEnabled: false,
      isCustom: false,
      isFavorite: false,
      createdAt: new Date(),
      updatedAt: new Date()
    },
    
    // Emboss Effects
    {
      id: 'emboss-soft',
      name: 'Soft Emboss',
      category: 'emboss',
      type: 'emboss',
      parameters: {
        offsetX: 1,
        offsetY: 1,
        blur: 2,
        spread: 0,
        color: '#ffffff',
        opacity: 0.4,
        angle: 45,
        distance: 1,
        size: 2,
        intensity: 40,
        style: 'inset',
        blendMode: 'overlay'
      },
      preview: 'Soft emboss effect',
      isEnabled: false,
      isCustom: false,
      isFavorite: false,
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      id: 'emboss-hard',
      name: 'Hard Emboss',
      category: 'emboss',
      type: 'emboss',
      parameters: {
        offsetX: 2,
        offsetY: 2,
        blur: 0,
        spread: 0,
        color: '#ffffff',
        opacity: 0.6,
        angle: 45,
        distance: 2,
        size: 0,
        intensity: 60,
        style: 'inset',
        blendMode: 'overlay'
      },
      preview: 'Hard emboss effect',
      isEnabled: false,
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
  const handleEffectApply = useCallback((effect: ShadowEffect) => {
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
  const handleEffectCopy = useCallback((effect: ShadowEffect) => {
    const data = {
      name: effect.name,
      category: effect.category,
      type: effect.type,
      parameters: effect.parameters
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
        isCustom: effect.isCustom,
        isFavorite: effect.isFavorite
      })),
      exportedAt: new Date().toISOString()
    };
    
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'shadow-effects.json';
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
    { id: 'shadow', label: 'Shadows', count: effects.filter(e => e.category === 'shadow').length },
    { id: 'glow', label: 'Glows', count: effects.filter(e => e.category === 'glow').length },
    { id: 'outline', label: 'Outlines', count: effects.filter(e => e.category === 'outline').length },
    { id: 'bevel', label: 'Bevels', count: effects.filter(e => e.category === 'bevel').length },
    { id: 'emboss', label: 'Emboss', count: effects.filter(e => e.category === 'emboss').length },
    { id: 'custom', label: 'Custom', count: effects.filter(e => e.category === 'custom').length }
  ];

  return (
    <div className={`bg-white rounded-lg shadow-xl border border-gray-200 p-4 w-full max-w-6xl ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold flex items-center">
          <Sparkles size={20} className="mr-2" />
          Shadow & Visual Effects
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
          { id: 'shadows', label: 'Shadows', icon: Sun },
          { id: 'glows', label: 'Glows', icon: Zap },
          { id: 'outlines', label: 'Outlines', icon: Circle },
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
                  {favoriteEffects.has(effect.id) ? <Star size={12} /> : <StarOff size={12} />}
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
                {effect.category === 'shadow' && <Sun size={24} />}
                {effect.category === 'glow' && <Zap size={24} />}
                {effect.category === 'outline' && <Circle size={24} />}
                {effect.category === 'bevel' && <Square size={24} />}
                {effect.category === 'emboss' && <Triangle size={24} />}
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

export default ShadowEffects;
