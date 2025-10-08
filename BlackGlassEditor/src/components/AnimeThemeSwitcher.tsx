// 🎌 Anime Theme Switcher - So amazing that even Pokemon would want to play here! ⚡✨

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { animeThemes } from '../themes/anime-themes';
import { cn } from '../utils/cn';

interface AnimeThemeSwitcherProps {
  currentTheme: string;
  onThemeChange: (theme: string) => void;
  className?: string;
}

export const AnimeThemeSwitcher: React.FC<AnimeThemeSwitcherProps> = ({
  currentTheme,
  onThemeChange,
  className
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedTheme, setSelectedTheme] = useState(animeThemes[currentTheme] || animeThemes.sakura);

  useEffect(() => {
    if (animeThemes[currentTheme]) {
      setSelectedTheme(animeThemes[currentTheme]);
    }
  }, [currentTheme]);

  const themeNames = Object.keys(animeThemes);

  return (
    <div className={cn('relative', className)}>
      {/* Main Theme Button */}
      <motion.button
        className={cn(
          'relative overflow-hidden px-6 py-3 rounded-xl font-bold text-white',
          'hover:scale-105 active:scale-95 transition-all duration-300',
          'shadow-lg hover:shadow-xl'
        )}
        style={{
          background: selectedTheme.gradients.primary,
          boxShadow: `0 8px 32px ${selectedTheme.colors.shadow}`
        }}
        onClick={() => setIsOpen(!isOpen)}
        whileHover={{ 
          scale: 1.05,
          boxShadow: `0 12px 40px ${selectedTheme.colors.shadow}`
        }}
        whileTap={{ scale: 0.95 }}
        animate={{
          boxShadow: [
            `0 8px 32px ${selectedTheme.colors.shadow}`,
            `0 12px 40px ${selectedTheme.colors.glow}`,
            `0 8px 32px ${selectedTheme.colors.shadow}`
          ]
        }}
        transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
      >
        {/* Magical sparkle effect */}
        <motion.div
          className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent opacity-0"
          animate={{
            x: isOpen ? ['-100%', '100%'] : '-100%',
            opacity: isOpen ? [0, 0.3, 0] : 0
          }}
          transition={{ duration: 0.6, ease: "easeInOut" }}
        />
        
        {/* Button content */}
        <div className="relative z-10 flex items-center gap-3">
          <motion.div
            className="text-2xl"
            animate={isOpen ? { rotate: [0, 360] } : {}}
            transition={{ duration: 0.5, ease: "easeInOut" }}
          >
            {currentTheme === 'sakura' && '🌸'}
            {currentTheme === 'thunder' && '⚡'}
            {currentTheme === 'ocean' && '🌊'}
            {currentTheme === 'cherry' && '🌸'}
            {currentTheme === 'galaxy' && '✨'}
            {currentTheme === 'rainbow' && '🌈'}
          </motion.div>
          
          <div className="text-left">
            <div className="text-lg font-bold">{selectedTheme.name}</div>
            <div className="text-sm opacity-90">{selectedTheme.description}</div>
          </div>
          
          <motion.div
            animate={{ rotate: isOpen ? 180 : 0 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            className="text-xl"
          >
            ▼
          </motion.div>
        </div>
      </motion.button>

      {/* Theme Dropdown */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            className="absolute top-full left-0 mt-4 w-80 z-50"
            initial={{ opacity: 0, y: -20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
          >
            <div className="glass-morphism rounded-xl p-4 space-y-2">
              {themeNames.map((themeKey) => {
                const theme = animeThemes[themeKey];
                const isSelected = currentTheme === themeKey;
                
                return (
                  <motion.button
                    key={themeKey}
                    className={cn(
                      'w-full p-4 rounded-lg text-left transition-all duration-300',
                      'hover:scale-105 active:scale-95',
                      isSelected 
                        ? 'ring-2 ring-white shadow-lg' 
                        : 'hover:bg-white/10'
                    )}
                    style={{
                      background: isSelected 
                        ? theme.gradients.surface 
                        : 'rgba(255, 255, 255, 0.05)',
                      border: `1px solid ${isSelected ? theme.colors.border : 'transparent'}`
                    }}
                    onClick={() => {
                      onThemeChange(themeKey);
                      setIsOpen(false);
                    }}
                    whileHover={{ 
                      x: 5,
                      boxShadow: `0 4px 20px ${theme.colors.shadow}`
                    }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <div className="flex items-center gap-4">
                      {/* Theme Icon */}
                      <motion.div
                        className="text-3xl"
                        animate={isSelected ? { 
                          scale: [1, 1.2, 1],
                          rotate: [0, 10, -10, 0]
                        } : {}}
                        transition={{ duration: 0.5, ease: "easeInOut" }}
                      >
                        {themeKey === 'sakura' && '🌸'}
                        {themeKey === 'thunder' && '⚡'}
                        {themeKey === 'ocean' && '🌊'}
                        {themeKey === 'cherry' && '🌸'}
                        {themeKey === 'galaxy' && '✨'}
                        {themeKey === 'rainbow' && '🌈'}
                      </motion.div>
                      
                      {/* Theme Info */}
                      <div className="flex-1">
                        <div className="font-bold text-lg" style={{ color: theme.colors.text }}>
                          {theme.name}
                        </div>
                        <div className="text-sm opacity-80" style={{ color: theme.colors.textSecondary }}>
                          {theme.description}
                        </div>
                      </div>
                      
                      {/* Selection Indicator */}
                      {isSelected && (
                        <motion.div
                          className="w-6 h-6 rounded-full flex items-center justify-center"
                          style={{ backgroundColor: theme.colors.primary }}
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          transition={{ duration: 0.2, ease: "easeOut" }}
                        >
                          <span className="text-white text-sm">✓</span>
                        </motion.div>
                      )}
                    </div>
                    
                    {/* Color Preview */}
                    <div className="flex gap-1 mt-3">
                      <div 
                        className="w-4 h-4 rounded-full" 
                        style={{ backgroundColor: theme.colors.primary }}
                      />
                      <div 
                        className="w-4 h-4 rounded-full" 
                        style={{ backgroundColor: theme.colors.secondary }}
                      />
                      <div 
                        className="w-4 h-4 rounded-full" 
                        style={{ backgroundColor: theme.colors.accent }}
                      />
                    </div>
                  </motion.button>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Background Overlay */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            className="fixed inset-0 z-40"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsOpen(false)}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

// 🎨 Theme Preview Component
export const ThemePreview: React.FC<{
  theme: string;
  className?: string;
}> = ({ theme, className }) => {
  const themeData = animeThemes[theme];
  
  if (!themeData) return null;

  return (
    <div 
      className={cn('p-6 rounded-xl', className)}
      style={{
        background: themeData.gradients.background,
        border: `2px solid ${themeData.colors.border}`
      }}
    >
      <div className="text-center mb-4">
        <div className="text-4xl mb-2">
          {theme === 'sakura' && '🌸'}
          {theme === 'thunder' && '⚡'}
          {theme === 'ocean' && '🌊'}
          {theme === 'cherry' && '🌸'}
          {theme === 'galaxy' && '✨'}
          {theme === 'rainbow' && '🌈'}
        </div>
        <h3 className="text-xl font-bold" style={{ color: themeData.colors.text }}>
          {themeData.name}
        </h3>
        <p className="text-sm opacity-80" style={{ color: themeData.colors.textSecondary }}>
          {themeData.description}
        </p>
      </div>
      
      {/* Color Palette */}
      <div className="flex justify-center gap-2 mb-4">
        <div 
          className="w-8 h-8 rounded-full border-2 border-white shadow-lg"
          style={{ backgroundColor: themeData.colors.primary }}
        />
        <div 
          className="w-8 h-8 rounded-full border-2 border-white shadow-lg"
          style={{ backgroundColor: themeData.colors.secondary }}
        />
        <div 
          className="w-8 h-8 rounded-full border-2 border-white shadow-lg"
          style={{ backgroundColor: themeData.colors.accent }}
        />
      </div>
      
      {/* Sample UI Elements */}
      <div className="space-y-2">
        <div 
          className="px-4 py-2 rounded-lg text-sm font-medium"
          style={{
            background: themeData.gradients.primary,
            color: themeData.colors.text
          }}
        >
          Sample Button
        </div>
        <div 
          className="px-4 py-2 rounded-lg text-sm"
          style={{
            background: themeData.gradients.surface,
            color: themeData.colors.textSecondary,
            border: `1px solid ${themeData.colors.border}`
          }}
        >
          Sample Input
        </div>
      </div>
    </div>
  );
};

