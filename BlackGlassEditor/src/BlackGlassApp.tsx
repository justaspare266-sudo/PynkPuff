import { useState } from "react";
import { TopToolbar } from "./components/TopToolbar";
import { LeftToolbar } from "./components/LeftToolbar";
import { CanvasArea } from "./components/CanvasArea";
import { PropertiesPanel } from "./components/PropertiesPanel";
import { Theme } from "./components/ThemeSwitcher";

export default function App() {
  const [currentTheme, setCurrentTheme] = useState<Theme>("dark");

  const getThemeClasses = () => {
    switch (currentTheme) {
      case "light":
        return "bg-gray-50 light";
      case "pink":
        return "bg-gradient-to-br from-pink-50 to-rose-100 pink";
      case "gold":
        return "bg-gradient-to-br from-amber-50 to-yellow-100 gold";
      default:
        return "bg-gray-900 dark";
    }
  };

  return (
    <div className={`size-full flex flex-col ${getThemeClasses()}`}>
      {/* Top Toolbar */}
      <TopToolbar currentTheme={currentTheme} onThemeChange={setCurrentTheme} />
      
      {/* Main Content Area */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Toolbar */}
        <LeftToolbar currentTheme={currentTheme} />
        
        {/* Canvas Area */}
        <CanvasArea currentTheme={currentTheme} />
        
        {/* Properties Panel */}
        <PropertiesPanel currentTheme={currentTheme} />
      </div>
    </div>
  );
}