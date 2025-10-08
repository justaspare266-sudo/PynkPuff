// 🎌 Anime-Inspired UI Components - So amazing that even Pokemon would want to play here! ⚡✨

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '../utils/cn';

// 🌸 Sakura Petal Animation Component
export const SakuraPetal: React.FC<{ delay?: number; duration?: number }> = ({ 
  delay = 0, 
  duration = 3 
}) => {
  return (
    <motion.div
      className="absolute w-2 h-2 bg-pink-300 rounded-full opacity-60"
      initial={{ 
        x: Math.random() * window.innerWidth, 
        y: -20, 
        rotate: 0,
        scale: Math.random() * 0.5 + 0.5
      }}
      animate={{
        y: window.innerHeight + 20,
        x: Math.random() * window.innerWidth,
        rotate: 360,
        scale: Math.random() * 0.5 + 0.5
      }}
      transition={{
        duration: duration + Math.random() * 2,
        delay: delay + Math.random() * 2,
        repeat: Infinity,
        ease: "linear"
      }}
      style={{
        background: `radial-gradient(circle, #ffb3d1 0%, #ff6b9d 100%)`
      }}
    />
  );
};

// ⚡ Electric Button Component
export const ElectricButton: React.FC<{
  children: React.ReactNode;
  onClick?: () => void;
  variant?: 'primary' | 'secondary' | 'accent';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  disabled?: boolean;
}> = ({ 
  children, 
  onClick, 
  variant = 'primary', 
  size = 'md', 
  className,
  disabled = false 
}) => {
  const [isHovered, setIsHovered] = useState(false);
  const [isPressed, setIsPressed] = useState(false);

  const variants = {
    primary: 'bg-gradient-to-r from-yellow-400 via-yellow-500 to-yellow-600 text-black',
    secondary: 'bg-gradient-to-r from-orange-400 via-orange-500 to-orange-600 text-white',
    accent: 'bg-gradient-to-r from-red-400 via-red-500 to-red-600 text-white'
  };

  const sizes = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2 text-base',
    lg: 'px-6 py-3 text-lg'
  };

  return (
    <motion.button
      className={cn(
        'relative overflow-hidden rounded-lg font-bold transition-all duration-300',
        'hover:shadow-lg hover:scale-105 active:scale-95',
        'disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100',
        variants[variant],
        sizes[size],
        className
      )}
      onClick={onClick}
      disabled={disabled}
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
      onMouseDown={() => setIsPressed(true)}
      onMouseUp={() => setIsPressed(false)}
      whileHover={{ 
        boxShadow: '0 0 30px rgba(255, 215, 0, 0.6)',
        scale: 1.05
      }}
      whileTap={{ scale: 0.95 }}
      animate={{
        boxShadow: isHovered 
          ? '0 0 30px rgba(255, 215, 0, 0.6)' 
          : '0 0 10px rgba(255, 215, 0, 0.3)'
      }}
    >
      {/* Electric effect overlay */}
      <motion.div
        className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent opacity-0"
        animate={{
          x: isHovered ? ['-100%', '100%'] : '-100%',
          opacity: isHovered ? [0, 0.3, 0] : 0
        }}
        transition={{ duration: 0.6, ease: "easeInOut" }}
      />
      
      {/* Button content */}
      <motion.span
        className="relative z-10"
        animate={{
          scale: isPressed ? 0.95 : 1
        }}
      >
        {children}
      </motion.span>
    </motion.button>
  );
};

// 🌊 Ocean Wave Background
export const OceanWave: React.FC<{ className?: string }> = ({ className }) => {
  return (
    <div className={cn('relative overflow-hidden', className)}>
      <motion.div
        className="absolute inset-0 bg-gradient-to-b from-blue-100 via-blue-200 to-blue-300"
        animate={{
          background: [
            'linear-gradient(180deg, #dbeafe 0%, #bfdbfe 50%, #93c5fd 100%)',
            'linear-gradient(180deg, #bfdbfe 0%, #93c5fd 50%, #60a5fa 100%)',
            'linear-gradient(180deg, #dbeafe 0%, #bfdbfe 50%, #93c5fd 100%)'
          ]
        }}
        transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
      />
      
      {/* Animated waves */}
      {[...Array(3)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute bottom-0 left-0 w-full h-20 bg-blue-400 opacity-20"
          style={{
            clipPath: `polygon(0% ${100 - i * 20}%, 100% ${80 - i * 15}%, 100% 100%, 0% 100%)`
          }}
          animate={{
            x: ['0%', '100%', '0%']
          }}
          transition={{
            duration: 6 + i * 2,
            repeat: Infinity,
            ease: "linear"
          }}
        />
      ))}
    </div>
  );
};

// ✨ Magical Glow Effect
export const MagicalGlow: React.FC<{
  children: React.ReactNode;
  color?: string;
  intensity?: 'low' | 'medium' | 'high';
  className?: string;
}> = ({ 
  children, 
  color = '#ffd700', 
  intensity = 'medium',
  className 
}) => {
  const intensities = {
    low: '0 0 10px',
    medium: '0 0 20px',
    high: '0 0 30px'
  };

  return (
    <motion.div
      className={cn('relative', className)}
      style={{
        filter: `${intensities[intensity]} ${color}40`
      }}
      animate={{
        filter: [
          `${intensities[intensity]} ${color}40`,
          `${intensities[intensity]} ${color}80`,
          `${intensities[intensity]} ${color}40`
        ]
      }}
      transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
    >
      {children}
    </motion.div>
  );
};

// 🌸 Floating Particles Effect
export const FloatingParticles: React.FC<{
  count?: number;
  color?: string;
  size?: 'sm' | 'md' | 'lg';
}> = ({ count = 20, color = '#ff6b9d', size = 'md' }) => {
  const sizes = {
    sm: 'w-1 h-1',
    md: 'w-2 h-2',
    lg: 'w-3 h-3'
  };

  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden">
      {[...Array(count)].map((_, i) => (
        <motion.div
          key={i}
          className={cn('absolute rounded-full', sizes[size])}
          style={{ backgroundColor: color }}
          initial={{
            x: Math.random() * window.innerWidth,
            y: Math.random() * window.innerHeight,
            opacity: 0
          }}
          animate={{
            x: Math.random() * window.innerWidth,
            y: Math.random() * window.innerHeight,
            opacity: [0, 0.6, 0]
          }}
          transition={{
            duration: 3 + Math.random() * 2,
            repeat: Infinity,
            delay: Math.random() * 2,
            ease: "easeInOut"
          }}
        />
      ))}
    </div>
  );
};

// 🎮 Pokemon-Inspired Tool Button
export const PokemonToolButton: React.FC<{
  icon: React.ReactNode;
  label: string;
  onClick?: () => void;
  isActive?: boolean;
  pokemonType?: 'electric' | 'fire' | 'water' | 'grass' | 'psychic';
  className?: string;
}> = ({ 
  icon, 
  label, 
  onClick, 
  isActive = false,
  pokemonType = 'electric',
  className 
}) => {
  const typeColors = {
    electric: 'from-yellow-400 to-yellow-600',
    fire: 'from-red-400 to-red-600',
    water: 'from-blue-400 to-blue-600',
    grass: 'from-green-400 to-green-600',
    psychic: 'from-purple-400 to-purple-600'
  };

  return (
    <motion.button
      className={cn(
        'relative group p-3 rounded-xl transition-all duration-300',
        'hover:scale-110 hover:shadow-lg',
        isActive 
          ? `bg-gradient-to-br ${typeColors[pokemonType]} text-white shadow-lg` 
          : 'bg-white/10 hover:bg-white/20 text-white/80',
        className
      )}
      onClick={onClick}
      whileHover={{ 
        scale: 1.1,
        rotate: [0, -5, 5, 0]
      }}
      whileTap={{ scale: 0.95 }}
      animate={{
        boxShadow: isActive 
          ? `0 0 20px ${pokemonType === 'electric' ? '#ffd700' : '#ff6b6b'}40`
          : '0 0 5px rgba(255, 255, 255, 0.1)'
      }}
    >
      {/* Electric sparkle effect */}
      {isActive && (
        <motion.div
          className="absolute inset-0 rounded-xl"
          animate={{
            background: [
              'radial-gradient(circle at 20% 20%, rgba(255, 255, 255, 0.3) 0%, transparent 50%)',
              'radial-gradient(circle at 80% 80%, rgba(255, 255, 255, 0.3) 0%, transparent 50%)',
              'radial-gradient(circle at 20% 20%, rgba(255, 255, 255, 0.3) 0%, transparent 50%)'
            ]
          }}
          transition={{ duration: 1, repeat: Infinity, ease: "easeInOut" }}
        />
      )}
      
      <div className="relative z-10 flex flex-col items-center gap-1">
        <motion.div
          animate={isActive ? { rotate: [0, 360] } : {}}
          transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
        >
          {icon}
        </motion.div>
        <span className="text-xs font-medium">{label}</span>
      </div>
    </motion.button>
  );
};

// 🌟 Magical Loading Spinner
export const MagicalSpinner: React.FC<{ size?: 'sm' | 'md' | 'lg' }> = ({ size = 'md' }) => {
  const sizes = {
    sm: 'w-4 h-4',
    md: 'w-8 h-8',
    lg: 'w-12 h-12'
  };

  return (
    <div className="relative">
      <motion.div
        className={cn('border-2 border-transparent rounded-full', sizes[size])}
        style={{
          borderTopColor: '#ffd700',
          borderRightColor: '#ff6b6b',
          borderBottomColor: '#4ecdc4',
          borderLeftColor: '#9d4edd'
        }}
        animate={{ rotate: 360 }}
        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
      />
      
      {/* Magical sparkles */}
      {[...Array(4)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute w-1 h-1 bg-yellow-400 rounded-full"
          style={{
            top: '50%',
            left: '50%',
            transformOrigin: `${20 + i * 10}px 0px`
          }}
          animate={{
            scale: [0, 1, 0],
            opacity: [0, 1, 0]
          }}
          transition={{
            duration: 1,
            repeat: Infinity,
            delay: i * 0.25,
            ease: "easeInOut"
          }}
        />
      ))}
    </div>
  );
};

// 🎨 Theme Switcher with Anime Flair
export const AnimeThemeSwitcher: React.FC<{
  currentTheme: string;
  onThemeChange: (theme: string) => void;
  themes: string[];
}> = ({ currentTheme, onThemeChange, themes }) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="relative">
      <motion.button
        className="px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg font-bold"
        onClick={() => setIsOpen(!isOpen)}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        🌸 {currentTheme} ✨
      </motion.button>
      
      <AnimatePresence>
        {isOpen && (
          <motion.div
            className="absolute top-full left-0 mt-2 bg-white/90 backdrop-blur-md rounded-lg shadow-lg p-2 min-w-48 z-50"
            initial={{ opacity: 0, y: -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            transition={{ duration: 0.2 }}
          >
            {themes.map((theme) => (
              <motion.button
                key={theme}
                className="w-full text-left px-3 py-2 rounded-md hover:bg-purple-100 transition-colors"
                onClick={() => {
                  onThemeChange(theme);
                  setIsOpen(false);
                }}
                whileHover={{ x: 5 }}
              >
                {theme}
              </motion.button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

