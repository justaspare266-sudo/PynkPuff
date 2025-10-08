// ⚡ Anime Cursor Manager - So amazing that even Pikachu would be jealous! ⚡✨

import React, { useEffect, useState } from 'react';
import { cn } from '../utils/cn';
import '../styles/anime-cursors.css';

interface AnimeCursorManagerProps {
  selectedTool: string;
  animeTheme: string;
  cursorStyle?: string;
  className?: string;
}

export const AnimeCursorManager: React.FC<AnimeCursorManagerProps> = ({
  selectedTool,
  animeTheme,
  cursorStyle = 'pointed-click',
  className
}) => {
  const [cursorPosition, setCursorPosition] = useState({ x: 0, y: 0 });
  const [isVisible, setIsVisible] = useState(true);

  // Update cursor position on mouse move
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setCursorPosition({ x: e.clientX, y: e.clientY });
    };

    const handleMouseEnter = () => setIsVisible(true);
    const handleMouseLeave = () => setIsVisible(false);

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseenter', handleMouseEnter);
    document.addEventListener('mouseleave', handleMouseLeave);

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseenter', handleMouseEnter);
      document.removeEventListener('mouseleave', handleMouseLeave);
    };
  }, []);

  // Get cursor class based on tool and theme
  const getCursorClass = () => {
    const baseClass = 'anime-cursor';
    const toolClass = `tool-${selectedTool}`;
    
    // Use selected cursor style if anime theme is disabled
    if (animeTheme === 'none') {
      if (cursorStyle === 'crosshair') return `${baseClass}`;
      if (cursorStyle === 'pointer') return `${baseClass}`;
      return `${baseClass} cursor-${cursorStyle}`;
    }
    
    // Theme-specific cursors
    if (animeTheme === 'thunder') return `${baseClass} cursor-thunderbolt`;
    if (animeTheme === 'sakura') return `${baseClass} cursor-sakura`;
    if (animeTheme === 'ocean') return `${baseClass} cursor-ocean`;
    if (animeTheme === 'galaxy') return `${baseClass} cursor-galaxy`;
    if (animeTheme === 'rainbow') return `${baseClass} cursor-rainbow`;
    
    // Tool-specific cursors
    return `${baseClass} ${toolClass}`;
  };

  // Get cursor emoji based on tool
  const getCursorEmoji = () => {
    switch (selectedTool) {
      case 'select': return '👆';
      case 'text': return '✍️';
      case 'pen': return '🖊️';
      case 'bucket': return '🪣';
      case 'gradient': return '🌈';
      case 'crop': return '✂️';
      case 'move': return '✋';
      case 'rotate': return '🔄';
      case 'filter': return '✨';
      case 'mask': return '🎭';
      case 'marquee': return '📦';
      case 'rect': return '⬜';
      case 'circle': return '⭕';
      case 'triangle': return '🔺';
      case 'star': return '⭐';
      case 'hexagon': return '⬡';
      case 'pentagon': return '⬟';
      case 'arrow': return '➡️';
      case 'heart': return '❤️';
      case 'line': return '📏';
      default: return '👆';
    }
  };

  // Get cursor color based on theme
  const getCursorColor = () => {
    switch (animeTheme) {
      case 'thunder': return '#ffd700';
      case 'sakura': return '#ff6b9d';
      case 'ocean': return '#00b4d8';
      case 'cherry': return '#e91e63';
      case 'galaxy': return '#9d4edd';
      case 'rainbow': return '#ff6b6b';
      default: return '#4ecdc4';
    }
  };

  if (!isVisible) return null;

  return (
    <div
      className={cn('fixed pointer-events-none z-[9999]', className)}
      style={{
        left: cursorPosition.x,
        top: cursorPosition.y,
        transform: 'translate(-50%, -50%)'
      }}
    >
      {/* Main Cursor */}
      <div className={getCursorClass()}>
        <div
          className="text-2xl font-bold"
          style={{
            color: getCursorColor(),
            textShadow: `0 0 10px ${getCursorColor()}40, 0 0 20px ${getCursorColor()}60`,
            filter: 'drop-shadow(0 0 5px rgba(0,0,0,0.3))'
          }}
        >
          {getCursorEmoji()}
        </div>
      </div>

      {/* Cursor Trail Effect */}
      <div className="absolute inset-0 pointer-events-none">
        <div
          className="w-8 h-8 rounded-full opacity-30 animate-ping"
          style={{
            backgroundColor: getCursorColor(),
            transform: 'translate(-50%, -50%)'
          }}
        />
      </div>

      {/* Magical Sparkles */}
      {animeTheme === 'thunder' && (
        <div className="absolute inset-0 pointer-events-none">
          {[...Array(3)].map((_, i) => (
            <div
              key={i}
              className="absolute w-1 h-1 bg-yellow-400 rounded-full animate-ping"
              style={{
                left: `${Math.random() * 20 - 10}px`,
                top: `${Math.random() * 20 - 10}px`,
                animationDelay: `${i * 0.2}s`,
                animationDuration: '1s'
              }}
            />
          ))}
        </div>
      )}

      {/* Sakura Petals for Sakura Theme */}
      {animeTheme === 'sakura' && (
        <div className="absolute inset-0 pointer-events-none">
          {[...Array(2)].map((_, i) => (
            <div
              key={i}
              className="absolute w-2 h-2 bg-pink-300 rounded-full opacity-60 animate-ping"
              style={{
                left: `${Math.random() * 30 - 15}px`,
                top: `${Math.random() * 30 - 15}px`,
                animationDelay: `${i * 0.5}s`,
                animationDuration: '2s'
              }}
            />
          ))}
        </div>
      )}

      {/* Ocean Bubbles for Ocean Theme */}
      {animeTheme === 'ocean' && (
        <div className="absolute inset-0 pointer-events-none">
          {[...Array(2)].map((_, i) => (
            <div
              key={i}
              className="absolute w-2 h-2 bg-blue-300 rounded-full opacity-60 animate-ping"
              style={{
                left: `${Math.random() * 25 - 12.5}px`,
                top: `${Math.random() * 25 - 12.5}px`,
                animationDelay: `${i * 0.3}s`,
                animationDuration: '1.5s'
              }}
            />
          ))}
        </div>
      )}

      {/* Galaxy Stars for Galaxy Theme */}
      {animeTheme === 'galaxy' && (
        <div className="absolute inset-0 pointer-events-none">
          {[...Array(4)].map((_, i) => (
            <div
              key={i}
              className="absolute w-1 h-1 bg-purple-400 rounded-full opacity-80 animate-ping"
              style={{
                left: `${Math.random() * 40 - 20}px`,
                top: `${Math.random() * 40 - 20}px`,
                animationDelay: `${i * 0.1}s`,
                animationDuration: '1s'
              }}
            />
          ))}
        </div>
      )}

      {/* Rainbow Colors for Rainbow Theme */}
      {animeTheme === 'rainbow' && (
        <div className="absolute inset-0 pointer-events-none">
          {['#ff6b6b', '#4ecdc4', '#45b7d1', '#96ceb4', '#feca57', '#ff9ff3'].map((color, i) => (
            <div
              key={i}
              className="absolute w-1 h-1 rounded-full animate-ping"
              style={{
                backgroundColor: color,
                left: `${Math.cos(i * 60 * Math.PI / 180) * 15}px`,
                top: `${Math.sin(i * 60 * Math.PI / 180) * 15}px`,
                animationDelay: `${i * 0.1}s`,
                animationDuration: '2s'
              }}
            />
          ))}
        </div>
      )}
    </div>
  );
};

// 🎮 Tool-specific cursor components
export const ToolCursor: React.FC<{
  tool: string;
  theme: string;
  className?: string;
}> = ({ tool, theme, className }) => {
  const getToolCursor = () => {
    switch (tool) {
      case 'select': return '👆';
      case 'text': return '✍️';
      case 'pen': return '🖊️';
      case 'bucket': return '🪣';
      case 'gradient': return '🌈';
      case 'crop': return '✂️';
      case 'move': return '✋';
      case 'rotate': return '🔄';
      case 'filter': return '✨';
      case 'mask': return '🎭';
      case 'marquee': return '📦';
      default: return '👆';
    }
  };

  const getThemeColor = () => {
    switch (theme) {
      case 'thunder': return '#ffd700';
      case 'sakura': return '#ff6b9d';
      case 'ocean': return '#00b4d8';
      case 'cherry': return '#e91e63';
      case 'galaxy': return '#9d4edd';
      case 'rainbow': return '#ff6b6b';
      default: return '#4ecdc4';
    }
  };

  return (
    <div
      className={cn(
        'inline-flex items-center justify-center w-8 h-8 rounded-full',
        'bg-white/20 backdrop-blur-sm border border-white/30',
        'shadow-lg hover:scale-110 transition-transform duration-200',
        className
      )}
      style={{
        color: getThemeColor(),
        boxShadow: `0 0 20px ${getThemeColor()}40`
      }}
    >
      <span className="text-lg">{getToolCursor()}</span>
    </div>
  );
};

// ⚡ Thunderbolt Cursor (Pikachu's favorite!)
export const ThunderboltCursor: React.FC<{ className?: string }> = ({ className }) => {
  return (
    <div className={cn('cursor-thunderbolt', className)}>
      <div className="text-3xl font-bold text-yellow-400 animate-pulse">
        ⚡
      </div>
    </div>
  );
};

// 🌸 Sakura Cursor
export const SakuraCursor: React.FC<{ className?: string }> = ({ className }) => {
  return (
    <div className={cn('cursor-sakura', className)}>
      <div className="text-2xl font-bold text-pink-400 animate-bounce">
        🌸
      </div>
    </div>
  );
};

// 🌊 Ocean Cursor
export const OceanCursor: React.FC<{ className?: string }> = ({ className }) => {
  return (
    <div className={cn('cursor-ocean', className)}>
      <div className="text-2xl font-bold text-blue-400 animate-pulse">
        🌊
      </div>
    </div>
  );
};

