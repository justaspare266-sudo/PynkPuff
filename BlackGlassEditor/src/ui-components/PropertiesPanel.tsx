import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "./ui/card";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Slider } from "./ui/slider";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import { Separator } from "./ui/separator";
import { Button } from "./ui/button";
import { Eye, EyeOff, Lock, Unlock, Play, Pause, Square } from "lucide-react";
import { Theme } from "./ThemeSwitcher";

interface CanvasObject {
  id: string;
  type: string;
  x: number;
  y: number;
  width?: number;
  height?: number;
  radius?: number;
  text?: string;
  fill: string;
  stroke?: string;
  strokeWidth?: number;
  opacity?: number;
  rotation?: number;
  scaleX?: number;
  scaleY?: number;
  fontSize?: number;
  fontFamily?: string;
  fontWeight?: string;
  fontStyle?: string;
  textDecoration?: string;
  textAlign?: string;
  letterSpacing?: number;
  lineHeight?: number;
  // Video properties
  videoUrl?: string;
  isVideo?: boolean;
  isPlaying?: boolean;
}

interface PropertiesPanelProps {
  currentTheme: Theme;
  selectedObject?: CanvasObject | null;
  onObjectChange?: (updates: Partial<CanvasObject>) => void;
  // Advanced features
  canvasWidth?: number;
  canvasHeight?: number;
  onCanvasSizeChange?: (width: number, height: number) => void;
  onExport?: () => void;
  onAddText?: () => void;
  onAddRectangle?: () => void;
  onAddButton?: () => void;
  // Paint bucket
  paintBucketColor?: string;
  onPaintBucketColorChange?: (color: string) => void;
  // Pen tool
  penColor?: string;
  onPenColorChange?: (color: string) => void;
  penWidth?: number;
  onPenWidthChange?: (width: number) => void;
  // Grid controls
  showGrid?: boolean;
  onShowGridChange?: (show: boolean) => void;
  snapToGrid?: boolean;
  onSnapToGridChange?: (snap: boolean) => void;
  gridSize?: number;
  onGridSizeChange?: (size: number) => void;
  // Video controls
  onVideoPlay?: (videoId: string) => void;
  onVideoPause?: (videoId: string) => void;
  onVideoStop?: (videoId: string) => void;
}

export function PropertiesPanel({
  currentTheme,
  selectedObject,
  onObjectChange,
  canvasWidth = 800,
  canvasHeight = 600,
  onCanvasSizeChange,
  onExport,
  onAddText,
  onAddRectangle,
  onAddButton,
  paintBucketColor = '#3b82f6',
  onPaintBucketColorChange,
  penColor = '#000000',
  onPenColorChange,
  penWidth = 3,
  onPenWidthChange,
  showGrid = true,
  onShowGridChange,
  snapToGrid = true,
  onSnapToGridChange,
  gridSize = 20,
  onGridSizeChange,
  onVideoPlay,
  onVideoPause,
  onVideoStop
}: PropertiesPanelProps) {
  const getThemeClasses = () => {
    switch (currentTheme) {
      case "light":
        return "bg-white/90 backdrop-blur-md border-l border-gray-200";
      case "pink":
        return "bg-pink-50/90 backdrop-blur-md border-l border-pink-200";
      case "gold":
        return "bg-gold-250/50 backdrop-blur-md border-l border-amber-10";
      default:
        return "bg-black/80 backdrop-blur-md border-l border-white/10";
    }
  };

  const getCardClasses = () => {
    switch (currentTheme) {
      case "light":
        return "bg-white/60 border-gray-200";
      case "pink":
        return "bg-pink-200/100 border-pink-300";
      case "gold":
        return "bg-gold-500/80 border-gold-200";
      default:
        return "bg-white/5 border-white/20";
    }
  };

  const getTitleClasses = () => {
    switch (currentTheme) {
      case "light":
        return "text-gray-900";
      case "pink":
        return "text-pink-900";
      case "gold":
        return "text-amber-900";
      default:
        return "text-white/90";
    }
  };

  const getLabelClasses = () => {
    switch (currentTheme) {
      case "light":
        return "text-gray-700";
      case "pink":
        return "text-pink-700";
      case "gold":
        return "text-amber-700";
      default:
        return "text-white/80";
    }
  };

  const getInputClasses = () => {
    switch (currentTheme) {
      case "light":
        return "bg-gray-50 border-gray-200 text-gray-900";
      case "pink":
        return "bg-pink-50 border-pink-200 text-pink-900";
      case "gold":
        return "bg-amber-50 border-amber-200 text-amber-900";
      default:
        return "bg-white/5 border-white/20 text-white/80";
    }
  };

  const getButtonClasses = () => {
    switch (currentTheme) {
      case "light":
        return "text-gray-600 hover:text-gray-900";
      case "pink":
        return "text-pink-600 hover:text-pink-900";
      case "gold":
        return "text-amber-600 hover:text-amber-900";
      default:
        return "text-white/60 hover:text-white";
    }
  };

  const getSelectClasses = () => {
    switch (currentTheme) {
      case "light":
        return "bg-gray-50 border-gray-200 text-gray-900";
      case "pink":
        return "bg-pink-50 border-pink-200 text-pink-900";
      case "gold":
        return "bg-amber-50 border-amber-200 text-amber-900";
      default:
        return "bg-white/5 border-white/20 text-white/80";
    }
  };

  const getSelectContentClasses = () => {
    switch (currentTheme) {
      case "light":
        return "bg-white/90 backdrop-blur-md border-gray-200 text-gray-900";
      case "pink":
        return "bg-pink-50/90 backdrop-blur-md border-pink-200 text-pink-900";
      case "gold":
        return "bg-amber-50/90 backdrop-blur-md border-amber-200 text-amber-900";
      default:
        return "bg-black/90 backdrop-blur-md border-white/20 text-white";
    }
  };

  return (
    <div
      className={`w-64 overflow-y-auto ${getThemeClasses()}`}
    >
      <div className="p-4 space-y-4">
        {/* Layer Properties */}
        <Card className={getCardClasses()}>
          <CardHeader className="pb-3">
            <CardTitle className={getTitleClasses()}>
              Layer Properties
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center justify-between">
              <Label className={getLabelClasses()}>
                {selectedObject ? `${selectedObject.type.charAt(0).toUpperCase() + selectedObject.type.slice(1)} Object` : 'No Selection'}
              </Label>
              <div className="flex gap-1">
                <Button
                  variant="ghost"
                  size="sm"
                  className={`h-6 w-6 p-0 ${getButtonClasses()}`}
                >
                  <Eye className="h-3 w-3" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className={`h-6 w-6 p-0 ${getButtonClasses()}`}
                >
                  <Unlock className="h-3 w-3" />
                </Button>
              </div>
            </div>

            <div className="space-y-2">
              <Label className={getLabelClasses()}>
                Opacity
              </Label>
              <Slider
                defaultValue={[100]}
                max={100}
                min={0}
                step={1}
                className={
                  currentTheme === "dark"
                    ? "[&_[role=slider]]:bg-white [&_[role=slider]]:border-white/20"
                    : ""
                }
              />
            </div>

            <div className="space-y-2">
              <Label className={getLabelClasses()}>
                Blend Mode
              </Label>
              <Select>
                <SelectTrigger className={getSelectClasses()}>
                  <SelectValue
                    placeholder="Normal"
                    defaultValue="normal"
                    className="text-gray-900"
                  />
                </SelectTrigger>
                <SelectContent
                  className={getSelectContentClasses()}
                >
                  <SelectItem value="normal">Normal</SelectItem>
                  <SelectItem value="multiply">
                    Multiply
                  </SelectItem>
                  <SelectItem value="screen">Screen</SelectItem>
                  <SelectItem value="overlay">
                    Overlay
                  </SelectItem>
                  <SelectItem value="softlight">
                    Soft Light
                  </SelectItem>
                  <SelectItem value="hardlight">
                    Hard Light
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Canvas Controls */}
        <Card className={getCardClasses()}>
          <CardHeader className="pb-3">
            <CardTitle className={getTitleClasses()}>
              Canvas Controls
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label className={getLabelClasses()}>Canvas Size</Label>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <Label htmlFor="canvas-width" className="text-xs text-gray-700">Width</Label>
                  <Input
                    id="canvas-width"
                    type="number"
                    value={canvasWidth}
                    onChange={(e) => onCanvasSizeChange?.(Number(e.target.value), canvasHeight)}
                    className={`h-8 text-xs ${getInputClasses()}`}
                  />
                </div>
                <div>
                  <Label htmlFor="canvas-height" className="text-xs text-gray-700">Height</Label>
                  <Input
                    id="canvas-height"
                    type="number"
                    value={canvasHeight}
                    onChange={(e) => onCanvasSizeChange?.(canvasWidth, Number(e.target.value))}
                    className={`h-8 text-xs ${getInputClasses()}`}
                  />
                </div>
              </div>
            </div>
            
            <div className="space-y-2">
              <Label className={getLabelClasses()}>Paint Bucket Color</Label>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={paintBucketColor}
                  onChange={(e) => onPaintBucketColorChange?.(e.target.value)}
                  className="w-8 h-8 border border-gray-300 rounded cursor-pointer"
                />
                <span className="text-xs text-gray-700">{paintBucketColor}</span>
              </div>
            </div>
            
            <div className="space-y-2">
              <Label className={getLabelClasses()}>Pen Tool</Label>
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Label className="text-xs text-gray-700">Color:</Label>
                  <input
                    type="color"
                    value={penColor}
                    onChange={(e) => onPenColorChange?.(e.target.value)}
                    className="w-6 h-6 border border-gray-300 rounded cursor-pointer"
                  />
                  <span className="text-xs text-gray-700">{penColor}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Label className="text-xs text-gray-700">Width:</Label>
                  <input
                    type="range"
                    min="1"
                    max="20"
                    value={penWidth}
                    onChange={(e) => onPenWidthChange?.(parseInt(e.target.value))}
                    className="flex-1"
                  />
                  <span className="text-xs text-gray-700 w-8">{penWidth}px</span>
                </div>
              </div>
            </div>
            
            <div className="space-y-2">
              <Label className={getLabelClasses()}>Quick Actions</Label>
              <div className="grid grid-cols-2 gap-2">
                <Button
                  onClick={onAddText}
                  size="sm"
                  className="h-8 text-xs"
                >
                  + Text
                </Button>
                <Button
                  onClick={onAddRectangle}
                  size="sm"
                  className="h-8 text-xs"
                >
                  + Rectangle
                </Button>
                <Button
                  onClick={onAddButton}
                  size="sm"
                  className="h-8 text-xs"
                >
                  + Button
                </Button>
                <Button
                  onClick={onExport}
                  size="sm"
                  className="h-8 text-xs"
                >
                  Export
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Transform */}
        <Card className={getCardClasses()}>
          <CardHeader className="pb-3">
            <CardTitle className={getTitleClasses()}>
              Transform
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="grid grid-cols-2 gap-2">
              <div className="space-y-1">
                <Label
                  className={`${getLabelClasses()} text-xs`}
                >
                  X
                </Label>
                <Input
                  type="number"
                  value={selectedObject?.x || 0}
                  onChange={(e) => onObjectChange?.({ x: parseFloat(e.target.value) || 0 })}
                  className={`h-8 ${getInputClasses()}`}
                />
              </div>
              <div className="space-y-1">
                <Label
                  className={`${getLabelClasses()} text-xs`}
                >
                  Y
                </Label>
                <Input
                  type="number"
                  value={selectedObject?.y || 0}
                  onChange={(e) => onObjectChange?.({ y: parseFloat(e.target.value) || 0 })}
                  className={`h-8 ${getInputClasses()}`}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div className="space-y-1">
                <Label
                  className={`${getLabelClasses()} text-xs`}
                >
                  Width
                </Label>
                <Input
                  type="number"
                  value={selectedObject?.width || selectedObject?.radius || 100}
                  onChange={(e) => onObjectChange?.({ width: parseFloat(e.target.value) || 100 })}
                  className={`h-8 ${getInputClasses()}`}
                />
              </div>
              <div className="space-y-1">
                <Label
                  className={`${getLabelClasses()} text-xs`}
                >
                  Height
                </Label>
                <Input
                  type="number"
                  value={selectedObject?.height || selectedObject?.radius || 100}
                  onChange={(e) => onObjectChange?.({ height: parseFloat(e.target.value) || 100 })}
                  className={`h-8 ${getInputClasses()}`}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label className={getLabelClasses()}>
                Rotation
              </Label>
              <Slider
                defaultValue={[0]}
                max={360}
                min={-360}
                step={1}
                className={
                  currentTheme === "dark"
                    ? "[&_[role=slider]]:bg-white [&_[role=slider]]:border-white/20"
                    : ""
                }
              />
            </div>
          </CardContent>
        </Card>

        {/* Fill & Stroke */}
        <Card className={getCardClasses()}>
          <CardHeader className="pb-3">
            <CardTitle className={getTitleClasses()}>
              Fill & Stroke
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="space-y-2">
              <Label className={getLabelClasses()}>
                Fill Color
              </Label>
              <div className="flex gap-2">
                <div
                  className={`w-8 h-8 rounded border-2 cursor-pointer ${currentTheme === "dark" ? "border-white/20" : "border-gray-300"}`}
                  style={{ backgroundColor: selectedObject?.fill || '#3B82F6' }}
                  onClick={() => {
                    const newColor = prompt('Enter color:', selectedObject?.fill || '#3B82F6');
                    if (newColor) onObjectChange?.({ fill: newColor });
                  }}
                />
                <Input
                  value={selectedObject?.fill || '#3B82F6'}
                  onChange={(e) => onObjectChange?.({ fill: e.target.value })}
                  className={`flex-1 h-8 ${getInputClasses()}`}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label className={getLabelClasses()}>
                Stroke Color
              </Label>
              <div className="flex gap-2">
                <div
                  className={`w-8 h-8 bg-transparent border-2 rounded cursor-pointer ${currentTheme === "dark" ? "border-white/40" : "border-gray-400"}`}
                />
                <Input
                  defaultValue="transparent"
                  className={`flex-1 h-8 ${getInputClasses()}`}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label className={getLabelClasses()}>
                Stroke Width
              </Label>
              <Slider
                defaultValue={[0]}
                max={20}
                min={0}
                step={1}
                className={
                  currentTheme === "dark"
                    ? "[&_[role=slider]]:bg-white [&_[role=slider]]:border-white/20"
                    : ""
                }
              />
            </div>
          </CardContent>
        </Card>

        {/* Effects */}
        <Card className={getCardClasses()}>
          <CardHeader className="pb-3">
            <CardTitle className={getTitleClasses()}>
              Effects
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="space-y-2">
              <Label className={getLabelClasses()}>
                Shadow
              </Label>
              <Slider
                defaultValue={[0]}
                max={50}
                min={0}
                step={1}
                className={
                  currentTheme === "dark"
                    ? "[&_[role=slider]]:bg-white [&_[role=slider]]:border-white/20"
                    : ""
                }
              />
            </div>

            <div className="space-y-2">
              <Label className={getLabelClasses()}>Blur</Label>
              <Slider
                defaultValue={[0]}
                max={20}
                min={0}
                step={0.1}
                className={
                  currentTheme === "dark"
                    ? "[&_[role=slider]]:bg-white [&_[role=slider]]:border-white/20"
                    : ""
                }
              />
            </div>

            <div className="space-y-2">
              <Label className={getLabelClasses()}>
                Brightness
              </Label>
              <Slider
                defaultValue={[100]}
                max={200}
                min={0}
                step={1}
                className={
                  currentTheme === "dark"
                    ? "[&_[role=slider]]:bg-white [&_[role=slider]]:border-white/20"
                    : ""
                }
              />
            </div>
          </CardContent>
        </Card>

        {/* Grid Controls */}
        <Card className={`${getThemeClasses()} border-white/10`}>
          <CardHeader className="pb-3">
            <CardTitle className={`text-sm ${getLabelClasses()}`}>Grid & Snap</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <Label className={getLabelClasses()}>Show Grid</Label>
              <input
                type="checkbox"
                checked={showGrid}
                onChange={(e) => onShowGridChange?.(e.target.checked)}
                className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
              />
            </div>
            
            <div className="flex items-center justify-between">
              <Label className={getLabelClasses()}>Snap to Grid</Label>
              <input
                type="checkbox"
                checked={snapToGrid}
                onChange={(e) => onSnapToGridChange?.(e.target.checked)}
                className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
              />
            </div>
            
            <div className="space-y-2">
              <Label className={getLabelClasses()}>Grid Size: {gridSize}px</Label>
              <input
                type="range"
                min="10"
                max="50"
                value={gridSize}
                onChange={(e) => onGridSizeChange?.(parseInt(e.target.value))}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
              />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Video Controls */}
      {selectedObject?.isVideo && (
        <Card className={`${getThemeClasses()} border-gray-300`}>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Video Controls</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex gap-2">
              <Button
                size="sm"
                variant="outline"
                onClick={() => onVideoPlay?.(selectedObject.id)}
                className="flex-1"
              >
                <Play className="h-3 w-3 mr-1" />
                Play
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => onVideoPause?.(selectedObject.id)}
                className="flex-1"
              >
                <Pause className="h-3 w-3 mr-1" />
                Pause
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => onVideoStop?.(selectedObject.id)}
                className="flex-1"
              >
                <Square className="h-3 w-3 mr-1" />
                Stop
              </Button>
            </div>
            <div className="text-xs text-gray-700">
              Status: {selectedObject.isPlaying ? 'Playing' : 'Paused'}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}