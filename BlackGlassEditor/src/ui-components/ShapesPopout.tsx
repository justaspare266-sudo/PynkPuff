import { Button } from "./ui/button";
import { Theme } from "./ThemeSwitcher";
import { 
  Square, 
  Circle, 
  Triangle, 
  Star, 
  Heart,
  Diamond,
  Hexagon,
  Pentagon,
  ArrowRight,
  Minus
} from "lucide-react";

interface Shape {
  id: string;
  icon: any;
  name: string;
}

interface ShapesPopoutProps {
  isOpen: boolean;
  onClose: () => void;
  currentTheme: Theme;
  shapes: Shape[];
  onShapeSelect?: (shape: string) => void;
  onShapeDragStart?: (shape: string, event: React.DragEvent) => void;
}

export function ShapesPopout({ isOpen, onClose, currentTheme, shapes, onShapeSelect, onShapeDragStart }: ShapesPopoutProps) {
  if (!isOpen) return null;

  const getThemeClasses = () => {
    switch (currentTheme) {
      case "light":
        return "bg-white/90 backdrop-blur-md border border-gray-200";
      case "pink":
        return "bg-pink-50/90 backdrop-blur-md border border-pink-200";
      case "gold":
        return "bg-amber-50/90 backdrop-blur-md border border-amber-200";
      default:
        return "bg-black/80 backdrop-blur-md border border-white/20";
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

  if (!isOpen) return null;

  return (
    <div className={`absolute left-12 top-0 z-[99999] rounded-lg p-2 min-w-48 pointer-events-auto ${getThemeClasses()}`}>
      <div className="grid grid-cols-2 gap-1">
        {shapes.map((shape, index) => (
          <Button
            key={index}
            variant="ghost"
            size="sm"
            className={`h-10 px-3 justify-start gap-2 ${getButtonClasses()}`}
            draggable
            onDragStart={(e) => {
              e.dataTransfer.setData('text/plain', shape.id);
              onShapeDragStart?.(shape.id, e);
            }}
            onClick={() => {
              onShapeSelect?.(shape.id);
              onClose();
            }}
          >
            <shape.icon className="h-4 w-4" />
            <span className="text-xs">{shape.name}</span>
          </Button>
        ))}
      </div>
    </div>
  );
}