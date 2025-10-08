import { useState } from "react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Theme } from "./ThemeSwitcher";
import { 
  Eye, 
  EyeOff, 
  Lock, 
  Unlock, 
  ChevronUp, 
  ChevronDown, 
  Trash2, 
  Plus,
  Layers
} from "lucide-react";

interface Layer {
  id: string;
  name: string;
  visible: boolean;
  locked: boolean;
  order: number;
}

interface LayersPanelProps {
  currentTheme: Theme;
  layers: Layer[];
  onToggleVisibility: (layerId: string) => void;
  onToggleLock: (layerId: string) => void;
  onMoveUp: (layerId: string) => void;
  onMoveDown: (layerId: string) => void;
  onDelete: (layerId: string) => void;
  onCreateLayer: (name: string) => void;
}

export function LayersPanel({
  currentTheme,
  layers,
  onToggleVisibility,
  onToggleLock,
  onMoveUp,
  onMoveDown,
  onDelete,
  onCreateLayer,
}: LayersPanelProps) {
  const [newLayerName, setNewLayerName] = useState("");

  const getThemeClasses = () => {
    switch (currentTheme) {
      case "light":
        return "bg-white/90 backdrop-blur-md border-l border-gray-200";
      case "pink":
        return "bg-pink-50/90 backdrop-blur-md border-l border-pink-200";
      case "gold":
        return "bg-amber-50/90 backdrop-blur-md border-l border-amber-200";
      default:
        return "bg-black/80 backdrop-blur-md border-l border-white/20";
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

  const sortedLayers = [...layers].sort((a, b) => b.order - a.order); // Top layer first

  const handleCreateLayer = () => {
    if (newLayerName.trim()) {
      onCreateLayer(newLayerName.trim());
      setNewLayerName("");
    }
  };

  return (
    <div className={`w-64 h-full ${getThemeClasses()}`}>
      <div className="p-4 space-y-4">
        <Card className="bg-transparent border-0 shadow-none">
          <CardHeader className="pb-3">
            <CardTitle className={`text-sm font-medium flex items-center gap-2 ${getTitleClasses()}`}>
              <Layers className="h-4 w-4" />
              Layers
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Create New Layer */}
            <div className="space-y-2">
              <Label className={getLabelClasses()}>Create Layer</Label>
              <div className="flex gap-2">
                <Input
                  value={newLayerName}
                  onChange={(e) => setNewLayerName(e.target.value)}
                  placeholder="Layer name"
                  className={`h-8 text-xs ${getInputClasses()}`}
                  onKeyPress={(e) => e.key === 'Enter' && handleCreateLayer()}
                />
                <Button
                  onClick={handleCreateLayer}
                  size="sm"
                  className="h-8 px-2"
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* Layers List */}
            <div className="space-y-1">
              {sortedLayers.length === 0 ? (
                <div className={`text-xs text-center py-4 ${getLabelClasses()}`}>
                  No layers yet
                </div>
              ) : (
                sortedLayers.map((layer) => (
                  <div
                    key={layer.id}
                    className={`flex items-center gap-2 p-2 rounded-md hover:bg-white/10 transition-colors`}
                  >
                    {/* Visibility Toggle */}
                    <Button
                      variant="ghost"
                      size="sm"
                      className={`h-6 w-6 p-0 ${getButtonClasses()}`}
                      onClick={() => onToggleVisibility(layer.id)}
                    >
                      {layer.visible ? (
                        <Eye className="h-3 w-3" />
                      ) : (
                        <EyeOff className="h-3 w-3" />
                      )}
                    </Button>

                    {/* Lock Toggle */}
                    <Button
                      variant="ghost"
                      size="sm"
                      className={`h-6 w-6 p-0 ${getButtonClasses()}`}
                      onClick={() => onToggleLock(layer.id)}
                    >
                      {layer.locked ? (
                        <Lock className="h-3 w-3" />
                      ) : (
                        <Unlock className="h-3 w-3" />
                      )}
                    </Button>

                    {/* Layer Name */}
                    <span className={`flex-1 text-xs truncate ${getLabelClasses()}`}>
                      {layer.name}
                    </span>

                    {/* Move Up */}
                    <Button
                      variant="ghost"
                      size="sm"
                      className={`h-6 w-6 p-0 ${getButtonClasses()}`}
                      onClick={() => onMoveUp(layer.id)}
                    >
                      <ChevronUp className="h-3 w-3" />
                    </Button>

                    {/* Move Down */}
                    <Button
                      variant="ghost"
                      size="sm"
                      className={`h-6 w-6 p-0 ${getButtonClasses()}`}
                      onClick={() => onMoveDown(layer.id)}
                    >
                      <ChevronDown className="h-3 w-3" />
                    </Button>

                    {/* Delete */}
                    <Button
                      variant="ghost"
                      size="sm"
                      className={`h-6 w-6 p-0 text-red-500 hover:text-red-700`}
                      onClick={() => onDelete(layer.id)}
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
