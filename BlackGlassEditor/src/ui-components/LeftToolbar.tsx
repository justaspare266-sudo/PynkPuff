import { useState } from "react";
import { Button } from "./ui/button";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "./ui/tooltip";
import { ShapesPopout } from "./ShapesPopout";
import { Theme } from "./ThemeSwitcher";
import { 
  MousePointer2, 
  Pen, 
  Palette, 
  PaintBucket, 
  Move, 
  Layers, 
  Square,
  SquareDot,
  ChevronRight,
  Type,
  Circle,
  Triangle,
  Star,
  Hexagon,
  Pentagon,
  ArrowRight,
  Heart,
  Minus,
  Crop,
  RotateCw,
  Filter,
  FileText,
  Clapperboard
} from "lucide-react";

interface LeftToolbarProps {
  currentTheme: Theme;
  selectedTool?: string;
  onToolChange?: (tool: string) => void;
  showArtboardManager?: boolean;
  onToggleArtboardManager?: () => void;
  showTimeline?: boolean;
  onToggleTimeline?: () => void;
}

export function LeftToolbar({ 
  currentTheme, 
  selectedTool = "select", 
  onToolChange,
  showArtboardManager = false,
  onToggleArtboardManager,
  showTimeline = false,
  onToggleTimeline
}: LeftToolbarProps) {
  const [shapesOpen, setShapesOpen] = useState(false);

  const tools = [
    { id: "select", icon: MousePointer2, name: "Select" },
    { id: "text", icon: Type, name: "Text" },
    { id: "pen", icon: Pen, name: "Pen" },
    { id: "bucket", icon: PaintBucket, name: "Paint Bucket" },
    { id: "gradient", icon: Palette, name: "Gradient" },
    { id: "crop", icon: Crop, name: "Crop" },
    { id: "move", icon: Move, name: "Move" },
    { id: "rotate", icon: RotateCw, name: "Rotate" },
    { id: "filter", icon: Filter, name: "Filter" },
    { id: "mask", icon: Layers, name: "Mask" },
    { id: "marquee", icon: SquareDot, name: "Marquee" },
  ];

  const shapeTools = [
    { id: "rect", icon: Square, name: "Rectangle" },
    { id: "circle", icon: Circle, name: "Circle" },
    { id: "triangle", icon: Triangle, name: "Triangle" },
    { id: "star", icon: Star, name: "Star" },
    { id: "hexagon", icon: Hexagon, name: "Hexagon" },
    { id: "pentagon", icon: Pentagon, name: "Pentagon" },
    { id: "arrow", icon: ArrowRight, name: "Arrow" },
    { id: "heart", icon: Heart, name: "Heart" },
    { id: "line", icon: Minus, name: "Line" },
  ];

  const getThemeClasses = () => {
    switch (currentTheme) {
      case "light":
        return "bg-white/90 backdrop-blur-md border-r border-gray-200";
      case "pink":
        return "bg-pink-50/90 backdrop-blur-md border-r border-pink-200";
      case "gold":
        return "bg-amber-50/90 backdrop-blur-md border-r border-amber-200";
      default:
        return "bg-black/80 backdrop-blur-md border-r border-white/10";
    }
  };

  const getButtonClasses = (isSelected: boolean) => {
    const base = "h-10 w-10 p-0 mx-1 mb-1 rounded-lg";
    
    if (isSelected) {
      switch (currentTheme) {
        case "light":
          return `${base} bg-blue-500 text-white shadow-lg ring-2 ring-blue-300`;
        case "pink":
          return `${base} bg-pink-500 text-white shadow-lg ring-2 ring-pink-300`;
        case "gold":
          return `${base} bg-amber-500 text-white shadow-lg ring-2 ring-amber-300`;
        default:
          return `${base} bg-blue-500 text-white shadow-lg ring-2 ring-blue-300`;
      }
    } else {
      switch (currentTheme) {
        case "light":
          return `${base} text-gray-600 hover:text-gray-900 hover:bg-gray-100`;
        case "pink":
          return `${base} text-pink-600 hover:text-pink-900 hover:bg-pink-100`;
        case "gold":
          return `${base} text-amber-600 hover:text-amber-900 hover:bg-amber-100`;
        default:
          return `${base} text-white/70 hover:text-white hover:bg-white/10`;
      }
    }
  };

  const getTooltipClasses = () => {
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
    <TooltipProvider>
      <div className={`w-12 flex flex-col py-2 ${getThemeClasses()}`}>
        {tools.map((tool) => (
          <Tooltip key={tool.id}>
            <TooltipTrigger asChild>
              <div>
        <Button
          variant="ghost"
          size="sm"
          className={`${getButtonClasses(selectedTool === tool.id)} anime-cursor tool-${tool.id}`}
          onClick={() => {
            console.log('Tool button clicked:', tool.id);
            onToolChange?.(tool.id);
          }}
        >
          <tool.icon className="h-5 w-5" />
        </Button>
              </div>
            </TooltipTrigger>
            <TooltipContent side="right" className={getTooltipClasses()}>
              <p>{tool.name}</p>
            </TooltipContent>
          </Tooltip>
        ))}

        {/* Shapes Tool with Popout */}
        <div className="relative">
          <Tooltip>
            <TooltipTrigger asChild>
              <div>
                <Button
                  variant="ghost"
                  size="sm"
                  className={`${getButtonClasses(shapesOpen)} relative anime-cursor tool-shapes`}
                  onClick={() => {
                    setShapesOpen(!shapesOpen);
                  }}
                >
                  <Square className="h-5 w-5" />
                  <ChevronRight className="h-3 w-3 absolute -right-1 -bottom-1 opacity-60" />
                </Button>
              </div>
            </TooltipTrigger>
            <TooltipContent side="right" className={getTooltipClasses()}>
              <p>Shapes</p>
            </TooltipContent>
          </Tooltip>

          <ShapesPopout 
            isOpen={shapesOpen} 
            onClose={() => setShapesOpen(false)}
            currentTheme={currentTheme}
            shapes={shapeTools}
            onShapeSelect={(shape) => onToolChange?.(shape)}
            onShapeDragStart={(shape, event) => {
              console.log('Shape drag started:', shape);
              // The drag data is already set in the ShapesPopout component
            }}
          />
        </div>

        {/* Artboard Manager Toggle */}
        <Tooltip>
          <TooltipTrigger asChild>
            <div>
              <Button
                variant="ghost"
                size="sm"
                className={`${getButtonClasses(showArtboardManager)} anime-cursor tool-artboard`}
                onClick={() => {
                  console.log('Artboard manager toggled');
                  onToggleArtboardManager?.();
                }}
              >
                <FileText className="h-5 w-5" />
              </Button>
            </div>
          </TooltipTrigger>
          <TooltipContent side="right" className={getTooltipClasses()}>
            <p>{showArtboardManager ? 'Hide Artboards' : 'Show Artboards'}</p>
          </TooltipContent>
        </Tooltip>

        {/* Timeline Toggle */}
        <Tooltip>
          <TooltipTrigger asChild>
            <div>
              <Button
                variant="ghost"
                size="sm"
                className={`${getButtonClasses(showTimeline)} anime-cursor tool-timeline`}
                onClick={() => {
                  console.log('Timeline toggled');
                  onToggleTimeline?.();
                }}
              >
                <Clapperboard className="h-5 w-5" />
              </Button>
            </div>
          </TooltipTrigger>
          <TooltipContent side="right" className={getTooltipClasses()}>
            <p>{showTimeline ? 'Hide Timeline' : 'Show Timeline'}</p>
          </TooltipContent>
        </Tooltip>
      </div>
    </TooltipProvider>
  );
}