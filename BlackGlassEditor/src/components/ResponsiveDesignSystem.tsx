'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Monitor, Tablet, Smartphone, Maximize, Minimize, RotateCcw, Settings } from 'lucide-react';

export interface Breakpoint {
  name: string;
  width: number;
  height: number;
  icon: React.ComponentType<any>;
  description: string;
}

export interface ResponsiveConfig {
  currentBreakpoint: string;
  customWidth: number;
  customHeight: number;
  scaleToFit: boolean;
  maintainAspectRatio: boolean;
  showBreakpointOverlay: boolean;
  enableTouchGestures: boolean;
  enableMobileOptimizations: boolean;
}

export interface ResponsiveDesignSystemProps {
  canvasWidth: number;
  canvasHeight: number;
  onCanvasResize: (width: number, height: number) => void;
  onBreakpointChange: (breakpoint: string) => void;
  onConfigChange: (config: ResponsiveConfig) => void;
  className?: string;
}

const ResponsiveDesignSystem: React.FC<ResponsiveDesignSystemProps> = ({
  canvasWidth,
  canvasHeight,
  onCanvasResize,
  onBreakpointChange,
  onConfigChange,
  className = ''
}) => {
  const [config, setConfig] = useState<ResponsiveConfig>({
    currentBreakpoint: 'desktop',
    customWidth: canvasWidth,
    customHeight: canvasHeight,
    scaleToFit: true,
    maintainAspectRatio: true,
    showBreakpointOverlay: true,
    enableTouchGestures: true,
    enableMobileOptimizations: true
  });

  const [isCustomSize, setIsCustomSize] = useState(false);
  const [showSettings, setShowSettings] = useState(false);

  const breakpoints: Breakpoint[] = [
    {
      name: 'mobile',
      width: 375,
      height: 667,
      icon: Smartphone,
      description: 'Mobile Portrait'
    },
    {
      name: 'mobile-landscape',
      width: 667,
      height: 375,
      icon: Smartphone,
      description: 'Mobile Landscape'
    },
    {
      name: 'tablet',
      width: 768,
      height: 1024,
      icon: Tablet,
      description: 'Tablet Portrait'
    },
    {
      name: 'tablet-landscape',
      width: 1024,
      height: 768,
      icon: Tablet,
      description: 'Tablet Landscape'
    },
    {
      name: 'desktop',
      width: 1200,
      height: 800,
      icon: Monitor,
      description: 'Desktop'
    },
    {
      name: 'large-desktop',
      width: 1920,
      height: 1080,
      icon: Monitor,
      description: 'Large Desktop'
    }
  ];

  const commonAspectRatios = [
    { name: 'Square', ratio: 1, width: 800, height: 800 },
    { name: '4:3', ratio: 4/3, width: 800, height: 600 },
    { name: '16:9', ratio: 16/9, width: 1280, height: 720 },
    { name: '21:9', ratio: 21/9, width: 1680, height: 720 },
    { name: '3:2', ratio: 3/2, width: 900, height: 600 },
    { name: '5:4', ratio: 5/4, width: 1000, height: 800 }
  ];

  const updateConfig = useCallback((updates: Partial<ResponsiveConfig>) => {
    setConfig(prev => {
      const newConfig = { ...prev, ...updates };
      onConfigChange(newConfig);
      return newConfig;
    });
  }, [onConfigChange]);

  const handleBreakpointSelect = useCallback((breakpointName: string) => {
    const breakpoint = breakpoints.find(bp => bp.name === breakpointName);
    if (breakpoint) {
      updateConfig({
        currentBreakpoint: breakpointName,
        customWidth: breakpoint.width,
        customHeight: breakpoint.height
      });
      onCanvasResize(breakpoint.width, breakpoint.height);
      onBreakpointChange(breakpointName);
      setIsCustomSize(false);
    }
  }, [breakpoints, updateConfig, onCanvasResize, onBreakpointChange]);

  const handleCustomSizeChange = useCallback((width: number, height: number) => {
    updateConfig({
      customWidth: width,
      customHeight: height,
      currentBreakpoint: 'custom'
    });
    onCanvasResize(width, height);
    setIsCustomSize(true);
  }, [updateConfig, onCanvasResize]);

  const handleAspectRatioSelect = useCallback((ratio: typeof commonAspectRatios[0]) => {
    const newWidth = Math.max(400, Math.min(2000, ratio.width));
    const newHeight = Math.max(300, Math.min(1500, ratio.height));
    handleCustomSizeChange(newWidth, newHeight);
  }, [handleCustomSizeChange]);

  const handleRotate = useCallback(() => {
    const newWidth = config.customHeight;
    const newHeight = config.customWidth;
    handleCustomSizeChange(newWidth, newHeight);
  }, [config.customWidth, config.customHeight, handleCustomSizeChange]);

  const getCurrentBreakpoint = () => {
    return breakpoints.find(bp => bp.name === config.currentBreakpoint) || breakpoints[0];
  };

  const getAspectRatio = () => {
    return (config.customWidth / config.customHeight).toFixed(2);
  };

  const isMobile = config.currentBreakpoint.includes('mobile');
  const isTablet = config.currentBreakpoint.includes('tablet');

  return (
    <div className={`responsive-design-system ${className}`}>
      {/* Breakpoint Selector */}
      <div className="mb-4">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-sm font-semibold text-gray-300">Canvas Size</h3>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setShowSettings(!showSettings)}
              className="p-1 hover:bg-gray-600 rounded text-gray-400"
              title="Settings"
            >
              <Settings className="w-4 h-4" />
            </button>
            <button
              onClick={handleRotate}
              className="p-1 hover:bg-gray-600 rounded text-gray-400"
              title="Rotate Canvas"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Breakpoint Buttons */}
        <div className="grid grid-cols-2 gap-2 mb-3">
          {breakpoints.map(breakpoint => {
            const IconComponent = breakpoint.icon;
            const isActive = config.currentBreakpoint === breakpoint.name;
            
            return (
              <button
                key={breakpoint.name}
                onClick={() => handleBreakpointSelect(breakpoint.name)}
                className={`flex items-center space-x-2 p-2 rounded text-xs transition-colors ${
                  isActive
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-600 hover:bg-gray-500 text-gray-300'
                }`}
              >
                <IconComponent className="w-3 h-3" />
                <div className="text-left">
                  <div className="font-medium">{breakpoint.description}</div>
                  <div className="text-xs opacity-75">
                    {breakpoint.width} × {breakpoint.height}
                  </div>
                </div>
              </button>
            );
          })}
        </div>

        {/* Custom Size Input */}
        <div className="mb-3">
          <button
            onClick={() => setIsCustomSize(!isCustomSize)}
            className={`w-full p-2 rounded text-xs ${
              isCustomSize
                ? 'bg-blue-600 text-white'
                : 'bg-gray-600 hover:bg-gray-500 text-gray-300'
            }`}
          >
            Custom Size
          </button>
          
          {isCustomSize && (
            <div className="mt-2 space-y-2">
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs text-gray-400 mb-1">Width</label>
                  <input
                    type="number"
                    value={config.customWidth}
                    onChange={(e) => handleCustomSizeChange(parseInt(e.target.value) || 400, config.customHeight)}
                    className="w-full p-2 bg-gray-600 border border-gray-500 rounded text-sm text-white"
                    min="100"
                    max="4000"
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-400 mb-1">Height</label>
                  <input
                    type="number"
                    value={config.customHeight}
                    onChange={(e) => handleCustomSizeChange(config.customWidth, parseInt(e.target.value) || 300)}
                    className="w-full p-2 bg-gray-600 border border-gray-500 rounded text-sm text-white"
                    min="100"
                    max="3000"
                  />
                </div>
              </div>
              
              <div className="text-xs text-gray-400">
                Aspect Ratio: {getAspectRatio()}:1
              </div>
            </div>
          )}
        </div>

        {/* Common Aspect Ratios */}
        <div className="mb-3">
          <div className="text-xs text-gray-400 mb-2">Common Ratios</div>
          <div className="grid grid-cols-3 gap-1">
            {commonAspectRatios.map(ratio => (
              <button
                key={ratio.name}
                onClick={() => handleAspectRatioSelect(ratio)}
                className="p-1 text-xs bg-gray-600 hover:bg-gray-500 rounded text-gray-300"
                title={`${ratio.name} (${ratio.width}×${ratio.height})`}
              >
                {ratio.name}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Current Size Display */}
      <div className="mb-4 p-3 bg-gray-800 rounded-lg">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center space-x-2">
            {React.createElement(getCurrentBreakpoint().icon, { className: "w-4 h-4" })}
            <span className="text-sm font-medium text-gray-300">
              {getCurrentBreakpoint().description}
            </span>
          </div>
          <div className="text-xs text-gray-400">
            {config.customWidth} × {config.customHeight}
          </div>
        </div>
        
        <div className="text-xs text-gray-400">
          Aspect Ratio: {getAspectRatio()}:1
        </div>
      </div>

      {/* Settings Panel */}
      {showSettings && (
        <div className="mb-4 p-3 bg-gray-800 rounded-lg">
          <h4 className="text-sm font-semibold text-gray-300 mb-3">Responsive Settings</h4>
          
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs text-gray-300">Scale to Fit</span>
              <input
                type="checkbox"
                checked={config.scaleToFit}
                onChange={(e) => updateConfig({ scaleToFit: e.target.checked })}
                className="rounded"
              />
            </div>
            
            <div className="flex items-center justify-between">
              <span className="text-xs text-gray-300">Maintain Aspect Ratio</span>
              <input
                type="checkbox"
                checked={config.maintainAspectRatio}
                onChange={(e) => updateConfig({ maintainAspectRatio: e.target.checked })}
                className="rounded"
              />
            </div>
            
            <div className="flex items-center justify-between">
              <span className="text-xs text-gray-300">Show Breakpoint Overlay</span>
              <input
                type="checkbox"
                checked={config.showBreakpointOverlay}
                onChange={(e) => updateConfig({ showBreakpointOverlay: e.target.checked })}
                className="rounded"
              />
            </div>
            
            <div className="flex items-center justify-between">
              <span className="text-xs text-gray-300">Enable Touch Gestures</span>
              <input
                type="checkbox"
                checked={config.enableTouchGestures}
                onChange={(e) => updateConfig({ enableTouchGestures: e.target.checked })}
                className="rounded"
              />
            </div>
            
            <div className="flex items-center justify-between">
              <span className="text-xs text-gray-300">Mobile Optimizations</span>
              <input
                type="checkbox"
                checked={config.enableMobileOptimizations}
                onChange={(e) => updateConfig({ enableMobileOptimizations: e.target.checked })}
                className="rounded"
              />
            </div>
          </div>
        </div>
      )}

      {/* Device Info */}
      <div className="p-3 bg-gray-700 rounded-lg">
        <div className="text-xs text-gray-400 mb-2">Device Information</div>
        <div className="space-y-1 text-xs text-gray-300">
          <div>Screen: {window.innerWidth} × {window.innerHeight}</div>
          <div>Device Type: {isMobile ? 'Mobile' : isTablet ? 'Tablet' : 'Desktop'}</div>
          <div>Touch Support: {('ontouchstart' in window) ? 'Yes' : 'No'}</div>
          <div>Pixel Ratio: {window.devicePixelRatio || 1}</div>
        </div>
      </div>
    </div>
  );
};

export default ResponsiveDesignSystem;
