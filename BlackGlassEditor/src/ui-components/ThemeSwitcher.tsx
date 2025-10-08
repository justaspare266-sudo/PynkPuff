import { useState } from "react";
import { Button } from "./ui/button";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "./ui/tooltip";

export type Theme = "dark" | "light" | "pink" | "gold";

interface ThemeSwitcherProps {
  currentTheme: Theme;
  onThemeChange: (theme: Theme) => void;
}

export function ThemeSwitcher({ currentTheme, onThemeChange }: ThemeSwitcherProps) {
  const themes = [
    { 
      id: "dark" as Theme, 
      name: "Dark", 
      color: "bg-gray-900",
      description: "Dark Glass"
    },
    { 
      id: "light" as Theme, 
      name: "Light", 
      color: "bg-white border border-gray-200",
      description: "Clean White"
    },
    { 
      id: "pink" as Theme, 
      name: "Pink", 
      color: "bg-gradient-to-br from-pink-100 to-rose-200",
      description: "Pastel Pink"
    },
    { 
      id: "gold" as Theme, 
      name: "Gold", 
      color: "bg-gradient-to-br from-amber-100 to-yellow-200",
      description: "Elegant Gold"
    },
  ];

  return (
    <TooltipProvider>
      <div className="flex items-center gap-2 relative">
        <span className="text-xs text-white/60 mr-1">Theme</span>
        {themes.map((theme) => (
          <Tooltip key={theme.id}>
            <TooltipTrigger asChild>
              <div>
                <Button
                  variant="ghost"
                  size="sm"
                  className={`h-6 w-6 p-0 rounded-full border-2 transition-all duration-200 ${
                    currentTheme === theme.id 
                      ? "border-white shadow-lg scale-110" 
                      : "border-white/30 hover:border-white/60 hover:scale-105"
                  }`}
                  onClick={() => onThemeChange(theme.id)}
                >
                  <div className={`h-4 w-4 rounded-full ${theme.color}`} />
                </Button>
              </div>
            </TooltipTrigger>
            <TooltipContent 
              className="bg-black/90 backdrop-blur-md border-white/20 z-[9999]" 
              side="bottom"
              align="center"
            >
              <p>{theme.description}</p>
            </TooltipContent>
          </Tooltip>
        ))}
      </div>
    </TooltipProvider>
  );
}