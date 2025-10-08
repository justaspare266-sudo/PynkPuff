/**
 * Comprehensive Filter System
 * Integrates filter effects and image processing
 */

import React, { useState, useCallback, useRef, useEffect } from 'react';
import { 
  Filter, 
  Settings, 
  Eye, 
  EyeOff, 
  RotateCcw,
  Download,
  Upload,
  Save,
  Trash2,
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
  Palette,
  Edit,
  Circle as Blur,
  Sun,
  Contrast,
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
  RotateCcw as RotateCcwIcon,
  FlipHorizontal,
  FlipVertical,
  Crop,
  Square as Resize,
  Settings as Adjust,
  Layers,
  Eye as EyeIcon,
  EyeOff as EyeOffIcon,
  Download as DownloadIcon,
  Upload as UploadIcon,
  Save as SaveIcon,
  RotateCcw as RotateCcwIcon2,
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
  RefreshCw as RefreshIcon
} from 'lucide-react';
import FilterEffects, { FilterEffect } from './FilterEffects';

export interface FilterSystemProps {
  onEffectApply: (effect: FilterEffect) => void;
  onClose?: () => void;
  className?: string;
}

const FilterSystem: React.FC<FilterSystemProps> = ({
  onEffectApply,
  onClose,
  className = ''
}) => {
  const [activeTab, setActiveTab] = useState<'effects' | 'presets' | 'history' | 'settings'>('effects');
  const [showSystem, setShowSystem] = useState(true);
  const [effects, setEffects] = useState<FilterEffect[]>([]);
  const [appliedEffects, setAppliedEffects] = useState<FilterEffect[]>([]);
  const [favoriteEffects, setFavoriteEffects] = useState<Set<string>>(new Set());
  const [copiedData, setCopiedData] = useState<string | null>(null);
  const [showSettings, setShowSettings] = useState(false);
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Handle effect apply
  const handleEffectApply = useCallback((effect: FilterEffect) => {
    onEffectApply(effect);
    setAppliedEffects(prev => [effect, ...prev]);
  }, [onEffectApply]);

  // Handle effect remove
  const handleEffectRemove = useCallback((effectId: string) => {
    setAppliedEffects(prev => prev.filter(effect => effect.id !== effectId));
  }, []);

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
    setCopiedData(effect.id);
    setTimeout(() => setCopiedData(null), 2000);
  }, []);

  // Handle effect export
  const handleEffectExport = useCallback(() => {
    const data = {
      appliedEffects: appliedEffects.map(effect => ({
        name: effect.name,
        category: effect.category,
        type: effect.type,
        parameters: effect.parameters,
        blendMode: effect.blendMode,
        opacity: effect.opacity
      })),
      exportedAt: new Date().toISOString()
    };
    
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'filter-system.json';
    a.click();
    URL.revokeObjectURL(url);
  }, [appliedEffects]);

  // Handle effect import
  const handleEffectImport = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = JSON.parse(e.target?.result as string);
        if (data.appliedEffects) {
          const importedEffects = data.appliedEffects.map((effect: any) => ({
            ...effect,
            id: `effect-${Date.now()}-${Math.random()}`,
            isCustom: true,
            createdAt: new Date(),
            updatedAt: new Date()
          }));
          setAppliedEffects(prev => [...importedEffects, ...prev]);
        }
      } catch (error) {
        console.error('Failed to import effects:', error);
      }
    };
    reader.readAsText(file);
  }, []);

  // Clear all effects
  const clearAllEffects = useCallback(() => {
    setAppliedEffects([]);
  }, []);

  // Reset to defaults
  const resetToDefaults = useCallback(() => {
    setAppliedEffects([]);
    setFavoriteEffects(new Set());
  }, []);

  if (!showSystem) {
    return (
      <div className={`absolute top-2 left-2 z-20 ${className}`}>
        <button
          onClick={() => setShowSystem(true)}
          className="p-2 bg-blue-600 text-white rounded shadow-lg hover:bg-blue-700"
          title="Show Filter System"
        >
          <Filter size={20} />
        </button>
      </div>
    );
  }

  return (
    <div className={`absolute inset-0 z-10 ${className}`}>
      {/* Header */}
      <div className="absolute top-2 left-2 right-2 z-20 bg-white rounded-lg shadow-lg border border-gray-200 p-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <h3 className="text-lg font-semibold flex items-center">
              <Filter size={20} className="mr-2" />
              Filter System
            </h3>
            
            {/* Tabs */}
            <div className="flex space-x-1">
              {[
                { id: 'effects', label: 'Effects', icon: Filter },
                { id: 'presets', label: 'Presets', icon: Save },
                { id: 'history', label: 'History', icon: RotateCcw },
                { id: 'settings', label: 'Settings', icon: Settings }
              ].map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`flex items-center space-x-2 px-3 py-1 rounded text-sm ${
                    activeTab === tab.id 
                      ? 'bg-blue-100 text-blue-700' 
                      : 'text-gray-600 hover:text-gray-800'
                  }`}
                >
                  <tab.icon size={14} />
                  <span>{tab.label}</span>
                </button>
              ))}
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setCopiedData('system')}
              className="p-2 text-gray-500 hover:text-gray-700"
              title="Copy data"
            >
              {copiedData === 'system' ? <Check size={16} /> : <Copy size={16} />}
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
              onClick={resetToDefaults}
              className="p-2 text-gray-500 hover:text-gray-700"
              title="Reset to defaults"
            >
              <RotateCcw size={16} />
            </button>
            <button
              onClick={clearAllEffects}
              className="p-2 text-gray-500 hover:text-gray-700"
              title="Clear all effects"
            >
              <Trash2 size={16} />
            </button>
            <button
              onClick={() => setShowSystem(false)}
              className="p-2 text-gray-500 hover:text-gray-700"
              title="Hide system"
            >
              <X size={16} />
            </button>
            {onClose && (
              <button
                onClick={onClose}
                className="p-2 text-gray-500 hover:text-gray-700"
                title="Close system"
              >
                <X size={16} />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="absolute top-16 left-2 right-2 bottom-2 z-10">
        {activeTab === 'effects' && (
          <FilterEffects
            onEffectApply={handleEffectApply}
            className="h-full"
          />
        )}
        
        {activeTab === 'presets' && (
          <div className="h-full bg-white rounded-lg shadow-lg border border-gray-200 p-4">
            <h4 className="font-semibold mb-4">Filter Presets</h4>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {[
                { name: 'Vintage', icon: Heart, color: 'bg-amber-100 text-amber-700' },
                { name: 'Black & White', icon: Circle, color: 'bg-gray-100 text-gray-700' },
                { name: 'Sepia', icon: Sun, color: 'bg-yellow-100 text-yellow-700' },
                { name: 'High Contrast', icon: Contrast, color: 'bg-blue-100 text-blue-700' },
                { name: 'Soft Focus', icon: Blur, color: 'bg-purple-100 text-purple-700' },
                { name: 'Oil Painting', icon: Palette, color: 'bg-pink-100 text-pink-700' },
                { name: 'Sketch', icon: Edit, color: 'bg-indigo-100 text-indigo-700' },
                { name: 'Watercolor', icon: Droplets, color: 'bg-cyan-100 text-cyan-700' }
              ].map(preset => (
                <div
                  key={preset.name}
                  className="border border-gray-200 rounded-lg p-4 hover:border-gray-300 transition-colors cursor-pointer"
                >
                  <div className="flex items-center justify-center h-16 mb-2">
                    <div className={`p-3 rounded-full ${preset.color}`}>
                      <preset.icon size={24} />
                    </div>
                  </div>
                  <h5 className="font-medium text-sm text-center">{preset.name}</h5>
                </div>
              ))}
            </div>
          </div>
        )}
        
        {activeTab === 'history' && (
          <div className="h-full bg-white rounded-lg shadow-lg border border-gray-200 p-4">
            <h4 className="font-semibold mb-4">Applied Effects</h4>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Total Applied: {appliedEffects.length}</span>
                <button
                  onClick={clearAllEffects}
                  className="px-3 py-1 text-sm bg-red-100 text-red-700 rounded hover:bg-red-200"
                >
                  Clear All
                </button>
              </div>
              <div className="space-y-1 max-h-64 overflow-y-auto">
                {appliedEffects.map(effect => (
                  <div
                    key={effect.id}
                    className="flex items-center justify-between p-2 bg-gray-50 rounded text-sm"
                  >
                    <div className="flex items-center space-x-2">
                      <div className="w-6 h-6 bg-gray-200 rounded flex items-center justify-center">
                        <Filter size={12} />
                      </div>
                      <span>{effect.name}</span>
                      <span className="text-xs text-gray-500">({effect.category})</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <button
                        onClick={() => handleEffectCopy(effect)}
                        className="p-1 text-gray-500 hover:text-gray-700"
                        title="Copy effect"
                      >
                        {copiedData === effect.id ? <Check size={12} /> : <Copy size={12} />}
                      </button>
                      <button
                        onClick={() => handleEffectRemove(effect.id)}
                        className="p-1 text-gray-500 hover:text-red-600"
                        title="Remove effect"
                      >
                        <X size={12} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
        
        {activeTab === 'settings' && (
          <div className="h-full bg-white rounded-lg shadow-lg border border-gray-200 p-4">
            <h4 className="font-semibold mb-4">Filter System Settings</h4>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <h5 className="font-medium mb-2">Display Settings</h5>
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="showPreviews"
                      className="rounded"
                      defaultChecked
                    />
                    <label htmlFor="showPreviews" className="text-sm text-gray-700">Show Previews</label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="autoApply"
                      className="rounded"
                      defaultChecked
                    />
                    <label htmlFor="autoApply" className="text-sm text-gray-700">Auto-apply Effects</label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="showHistory"
                      className="rounded"
                      defaultChecked
                    />
                    <label htmlFor="showHistory" className="text-sm text-gray-700">Show History</label>
                  </div>
                </div>
              </div>
              
              <div>
                <h5 className="font-medium mb-2">Performance Settings</h5>
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="useGPU"
                      className="rounded"
                      defaultChecked
                    />
                    <label htmlFor="useGPU" className="text-sm text-gray-700">Use GPU Acceleration</label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="cacheEffects"
                      className="rounded"
                      defaultChecked
                    />
                    <label htmlFor="cacheEffects" className="text-sm text-gray-700">Cache Effects</label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="previewQuality"
                      className="rounded"
                      defaultChecked
                    />
                    <label htmlFor="previewQuality" className="text-sm text-gray-700">High Quality Preview</label>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default FilterSystem;
