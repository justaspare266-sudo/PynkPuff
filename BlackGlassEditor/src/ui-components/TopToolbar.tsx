import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { Separator } from "./ui/separator";
import { Slider } from "./ui/slider";
import { ThemeSwitcher, Theme } from "./ThemeSwitcher";
import { 
  Type, 
  Bold, 
  Italic, 
  Underline, 
  AlignLeft, 
  AlignCenter, 
  AlignRight,
  Save,
  Undo,
  Redo,
  ZoomIn,
  ZoomOut,
  Download,
  FileText,
  FolderOpen,
  Image
} from "lucide-react";

interface TopToolbarProps {
  currentTheme: Theme;
  onThemeChange: (theme: Theme) => void;
  selectedTool?: string;
  onToolChange?: (tool: string) => void;
  selectedObject?: any;
  onObjectChange?: (updates: any) => void;
  onZoomIn?: () => void;
  onZoomOut?: () => void;
  onResetZoom?: () => void;
  currentZoom?: number;
  cropArea?: { x: number; y: number; width: number; height: number } | null;
  onApplyCrop?: () => void;
  onCancelCrop?: () => void;
  cropAspectRatio?: string;
  onCropAspectRatioChange?: (ratio: string) => void;
  autoFit?: boolean;
  onAutoFitToggle?: () => void;
  // File menu handlers
  onNew?: () => void;
  onOpen?: () => void;
  onSave?: () => void;
  onExport?: () => void;
  // Asset panel
  assetPanelOpen?: boolean;
  onAssetPanelToggle?: () => void;
  // Diagnostic system
  showDiagnostics?: boolean;
  onDiagnosticsToggle?: () => void;
  showShotburst?: boolean;
  onShotburstToggle?: () => void;
}

export function TopToolbar({ 
  currentTheme, 
  onThemeChange, 
  selectedTool = 'select',
  onToolChange,
  selectedObject,
  onObjectChange,
  onZoomIn,
  onZoomOut,
  onResetZoom,
  currentZoom = 1,
  cropArea,
  onApplyCrop,
  onCancelCrop,
  cropAspectRatio,
  onCropAspectRatioChange,
  autoFit = true,
  onAutoFitToggle,
  onNew,
  onOpen,
  onSave,
  onExport,
  assetPanelOpen,
  onAssetPanelToggle,
  showDiagnostics,
  onDiagnosticsToggle,
  showShotburst,
  onShotburstToggle
}: TopToolbarProps) {
  const getThemeClasses = () => {
    switch (currentTheme) {
      case "light":
        return "bg-white/90 backdrop-blur-md border-b border-gray-200 text-gray-900";
      case "pink":
        return "bg-pink-50/90 backdrop-blur-md border-b border-pink-200 text-pink-900";
      case "gold":
        return "bg-amber-50/90 backdrop-blur-md border-b border-amber-200 text-amber-900";
      default:
        return "bg-black/80 backdrop-blur-md border-b border-white/10 text-white";
    }
  };

  const getButtonClasses = () => {
    switch (currentTheme) {
      case "light":
        return "text-gray-600 hover:text-gray-900 hover:bg-gray-100";
      case "pink":
        return "text-pink-600 hover:text-pink-900 hover:bg-pink-100";
      case "gold":
        return "text-amber-600 hover:text-amber-900 hover:bg-amber-100";
      default:
        return "text-white/80 hover:text-white hover:bg-white/10";
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

  const getSeparatorClasses = () => {
    switch (currentTheme) {
      case "light":
        return "bg-gray-300";
      case "pink":
        return "bg-pink-300";
      case "gold":
        return "bg-amber-300";
      default:
        return "bg-white/20";
    }
  };

  return (
    <div className={`h-12 flex items-center px-4 gap-3 ${getThemeClasses()}`}>
      {/* File Menu */}
      <div className="flex items-center gap-1">
        <Button 
          variant="ghost" 
          size="sm" 
          className={`h-8 px-3 ${getButtonClasses()}`}
          onClick={onNew}
          title="New (Ctrl+N)"
        >
          <FileText className="h-4 w-4 mr-1" />
          New
        </Button>
        <Button 
          variant="ghost" 
          size="sm" 
          className={`h-8 px-3 ${getButtonClasses()}`}
          onClick={onOpen}
          title="Open (Ctrl+O)"
        >
          <FolderOpen className="h-4 w-4 mr-1" />
          Open
        </Button>
        <Button 
          variant="ghost" 
          size="sm" 
          className={`h-8 px-3 ${getButtonClasses()}`}
          onClick={onSave}
          title="Save (Ctrl+S)"
        >
          <Save className="h-4 w-4 mr-1" />
          Save
        </Button>
        <Button 
          variant="ghost" 
          size="sm" 
          className={`h-8 px-3 ${getButtonClasses()}`}
          onClick={onExport}
          title="Export"
        >
          <Download className="h-4 w-4 mr-1" />
          Export
        </Button>
        <Button 
          variant="ghost" 
          size="sm" 
          className={`h-8 px-3 ${getButtonClasses(assetPanelOpen)}`}
          onClick={onAssetPanelToggle}
          title="Asset Panel"
        >
          <Image className="h-4 w-4 mr-1" />
          Assets
        </Button>
      </div>
      
      <Separator orientation="vertical" className={`h-6 ${getSeparatorClasses()}`} />
      
      {/* File Actions */}
      <div className="flex items-center gap-2">
        <Button variant="ghost" size="sm" className={`h-8 px-2 ${getButtonClasses()}`}>
          <Save className="h-4 w-4" />
        </Button>
        <Button variant="ghost" size="sm" className={`h-8 px-2 ${getButtonClasses()}`}>
          <Undo className="h-4 w-4" />
        </Button>
        <Button variant="ghost" size="sm" className={`h-8 px-2 ${getButtonClasses()}`}>
          <Redo className="h-4 w-4" />
        </Button>
      </div>

      <Separator orientation="vertical" className={`h-6 ${getSeparatorClasses()}`} />

      {/* Zoom Controls */}
      <div className="flex items-center gap-2">
        <Button 
          variant="ghost" 
          size="sm" 
          className={`h-8 px-2 ${getButtonClasses()}`}
          onClick={onZoomOut}
          title="Zoom Out (Ctrl+-)"
        >
          <ZoomOut className="h-4 w-4" />
        </Button>
        <span className="text-sm min-w-12 text-center opacity-80">
          {Math.round(currentZoom * 100)}%
        </span>
        <Button 
          variant="ghost" 
          size="sm" 
          className={`h-8 px-2 ${getButtonClasses()}`}
          onClick={onZoomIn}
          title="Zoom In (Ctrl++)"
        >
          <ZoomIn className="h-4 w-4" />
        </Button>
        <Button 
          variant="ghost" 
          size="sm" 
          className={`h-8 px-2 ${getButtonClasses()}`}
          onClick={onResetZoom}
          title="Reset Zoom (Ctrl+0)"
        >
          Reset
        </Button>
        <Button 
          variant="ghost" 
          size="sm" 
          className={`h-8 px-2 ${autoFit ? 'bg-blue-500 text-white' : getButtonClasses()}`}
          onClick={onAutoFitToggle}
          title="Auto Fit to Screen"
        >
          Fit
        </Button>
      </div>

      <Separator orientation="vertical" className={`h-6 ${getSeparatorClasses()}`} />

      {/* Diagnostic System */}
      <div className="flex items-center gap-2">
        <Button
          variant="ghost"
          size="sm"
          className={`h-8 px-3 ${showDiagnostics ? 'bg-purple-600 text-white' : getButtonClasses()}`}
          onClick={onDiagnosticsToggle}
          title={showDiagnostics ? 'Hide Diagnostics' : 'Show Diagnostics'}
        >
          🧠 {showDiagnostics ? 'Hide Brain' : 'Show Brain'}
        </Button>
        
        <Button
          variant="ghost"
          size="sm"
          className={`h-8 px-3 ${showShotburst ? 'bg-orange-600 text-white' : getButtonClasses()}`}
          onClick={onShotburstToggle}
          title={showShotburst ? 'Hide Shotburst' : 'Show Shotburst'}
        >
          📸 {showShotburst ? 'Hide Shotburst' : 'Show Shotburst'}
        </Button>
      </div>

      <Separator orientation="vertical" className={`h-6 ${getSeparatorClasses()}`} />

      {/* Color Picker - Always visible */}
      <div className="flex items-center gap-2">
        <input
          type="color"
          value={selectedObject?.fill || '#3b82f6'}
          onChange={(e) => onObjectChange?.({ fill: e.target.value })}
          className="w-8 h-8 border border-gray-300 rounded cursor-pointer"
          title="Fill Color"
        />
        <input
          type="color"
          value={selectedObject?.stroke || '#1e40af'}
          onChange={(e) => onObjectChange?.({ stroke: e.target.value })}
          className="w-8 h-8 border border-gray-300 rounded cursor-pointer"
          title="Stroke Color"
        />
      </div>

      <Separator orientation="vertical" className={`h-6 ${getSeparatorClasses()}`} />

      {/* Crop Controls - Show when crop tool is selected */}
      {selectedTool === 'crop' && (
        <div className="flex items-center gap-2">
          {cropArea && (
            <span className="text-sm opacity-80">
              {Math.round(cropArea.width)} × {Math.round(cropArea.height)}
            </span>
          )}
          
          {/* Aspect Ratio Controls */}
          <div className="flex items-center gap-1">
            <Button 
              variant={cropAspectRatio === 'free' ? 'default' : 'ghost'}
              size="sm" 
              className={`h-8 px-2 ${cropAspectRatio === 'free' ? getButtonClasses() : ''}`}
              onClick={() => onCropAspectRatioChange?.('free')}
              title="Free Aspect Ratio"
            >
              Free
            </Button>
            <Button 
              variant={cropAspectRatio === '1:1' ? 'default' : 'ghost'}
              size="sm" 
              className={`h-8 px-2 ${cropAspectRatio === '1:1' ? getButtonClasses() : ''}`}
              onClick={() => onCropAspectRatioChange?.('1:1')}
              title="1:1 Square"
            >
              1:1
            </Button>
            <Button 
              variant={cropAspectRatio === '4:3' ? 'default' : 'ghost'}
              size="sm" 
              className={`h-8 px-2 ${cropAspectRatio === '4:3' ? getButtonClasses() : ''}`}
              onClick={() => onCropAspectRatioChange?.('4:3')}
              title="4:3 Standard"
            >
              4:3
            </Button>
            <Button 
              variant={cropAspectRatio === '16:9' ? 'default' : 'ghost'}
              size="sm" 
              className={`h-8 px-2 ${cropAspectRatio === '16:9' ? getButtonClasses() : ''}`}
              onClick={() => onCropAspectRatioChange?.('16:9')}
              title="16:9 Widescreen"
            >
              16:9
            </Button>
          </div>
          
          <Button 
            variant="ghost" 
            size="sm" 
            className={`h-8 px-3 ${getButtonClasses()}`}
            onClick={onApplyCrop}
            title="Apply Crop"
          >
            Apply Crop
          </Button>
          <Button 
            variant="ghost" 
            size="sm" 
            className={`h-8 px-3 ${getButtonClasses()}`}
            onClick={onCancelCrop}
            title="Cancel Crop"
          >
            Cancel
          </Button>
        </div>
      )}

      {selectedTool === 'crop' && cropArea && (
        <Separator orientation="vertical" className={`h-6 ${getSeparatorClasses()}`} />
      )}

      {/* Main Tools - Removed duplicates, tools are in LeftToolbar */}

      <Separator orientation="vertical" className={`h-6 ${getSeparatorClasses()}`} />

      {/* Text Properties - Only show when text is selected */}
      {selectedObject?.type === 'text' && (
        <div className="flex items-center gap-2">
          <Select 
            value={selectedObject?.fontFamily || 'Arial'}
            onValueChange={(value) => onObjectChange?.({ fontFamily: value })}
          >
            <SelectTrigger className={`w-32 h-8 ${getInputClasses()}`}>
              <SelectValue placeholder="Font" />
            </SelectTrigger>
            <SelectContent className={`backdrop-blur-md ${currentTheme === 'dark' ? 'bg-black/90 border-white/20' : 'bg-white/90 border-gray-200'}`}>
              <SelectItem value="Arial">Arial</SelectItem>
              <SelectItem value="Helvetica">Helvetica</SelectItem>
              <SelectItem value="Times New Roman">Times New Roman</SelectItem>
              <SelectItem value="Courier New">Courier New</SelectItem>
              <SelectItem value="Georgia">Georgia</SelectItem>
              <SelectItem value="Verdana">Verdana</SelectItem>
            </SelectContent>
          </Select>

          <Input 
            type="number" 
            value={selectedObject?.fontSize || 16}
            onChange={(e) => onObjectChange?.({ fontSize: parseInt(e.target.value) || 16 })}
            className={`w-16 h-8 ${getInputClasses()}`}
            min="8"
            max="72"
          />

          <div className="flex items-center">
            <Button 
              variant="ghost" 
              size="sm" 
              className={`h-8 w-8 p-0 ${selectedObject?.fontWeight === 'bold' ? 'bg-blue-500 text-white' : getButtonClasses()}`}
              onClick={() => onObjectChange?.({ fontWeight: selectedObject?.fontWeight === 'bold' ? 'normal' : 'bold' })}
              title="Bold (Ctrl+B)"
            >
              <Bold className="h-4 w-4" />
            </Button>
            <Button 
              variant="ghost" 
              size="sm" 
              className={`h-8 w-8 p-0 ${selectedObject?.fontStyle === 'italic' ? 'bg-blue-500 text-white' : getButtonClasses()}`}
              onClick={() => onObjectChange?.({ fontStyle: selectedObject?.fontStyle === 'italic' ? 'normal' : 'italic' })}
              title="Italic (Ctrl+I)"
            >
              <Italic className="h-4 w-4" />
            </Button>
            <Button 
              variant="ghost" 
              size="sm" 
              className={`h-8 w-8 p-0 ${selectedObject?.textDecoration === 'underline' ? 'bg-blue-500 text-white' : getButtonClasses()}`}
              onClick={() => onObjectChange?.({ textDecoration: selectedObject?.textDecoration === 'underline' ? 'none' : 'underline' })}
              title="Underline (Ctrl+U)"
            >
              <Underline className="h-4 w-4" />
            </Button>
          </div>

          <div className="flex items-center">
            <Button 
              variant="ghost" 
              size="sm" 
              className={`h-8 w-8 p-0 ${selectedObject?.align === 'left' ? 'bg-blue-500 text-white' : getButtonClasses()}`}
              onClick={() => onObjectChange?.({ align: 'left' })}
              title="Align Left"
            >
              <AlignLeft className="h-4 w-4" />
            </Button>
            <Button 
              variant="ghost" 
              size="sm" 
              className={`h-8 w-8 p-0 ${selectedObject?.align === 'center' ? 'bg-blue-500 text-white' : getButtonClasses()}`}
              onClick={() => onObjectChange?.({ align: 'center' })}
              title="Align Center"
            >
              <AlignCenter className="h-4 w-4" />
            </Button>
            <Button 
              variant="ghost" 
              size="sm" 
              className={`h-8 w-8 p-0 ${selectedObject?.align === 'right' ? 'bg-blue-500 text-white' : getButtonClasses()}`}
              onClick={() => onObjectChange?.({ align: 'right' })}
              title="Align Right"
            >
              <AlignRight className="h-4 w-4" />
            </Button>
          </div>

        </div>
      )}

      {/* Shape Properties - Only show when shape is selected */}
      {selectedObject?.type && selectedObject?.type !== 'text' && (
        <div className="flex items-center gap-2">
          <Input 
            type="number" 
            value={selectedObject?.strokeWidth || 0}
            onChange={(e) => onObjectChange?.({ strokeWidth: parseInt(e.target.value) || 0 })}
            className={`w-16 h-8 ${getInputClasses()}`}
            min="0"
            max="10"
            placeholder="Stroke"
          />
        </div>
      )}

      <Separator orientation="vertical" className={`h-6 ${getSeparatorClasses()}`} />

      {/* Opacity Slider */}
      <div className="flex items-center gap-2 min-w-24">
        <span className="text-xs opacity-60">Opacity</span>
        <div className="w-16">
          <Slider
            defaultValue={[100]}
            max={100}
            min={0}
            step={1}
            className={currentTheme === 'dark' 
              ? "[&_[role=slider]]:bg-white [&_[role=slider]]:border-white/20 [&_.slider-track]:bg-gray-600 [&_.slider-range]:bg-white" 
              : "[&_.slider-track]:bg-gray-200 [&_.slider-range]:bg-blue-500"
            }
          />
        </div>
      </div>

      {/* Spacer to push theme switcher to the right */}
      <div className="flex-1" />

      {/* Theme Switcher */}
      <ThemeSwitcher currentTheme={currentTheme} onThemeChange={onThemeChange} />
    </div>
  );
}