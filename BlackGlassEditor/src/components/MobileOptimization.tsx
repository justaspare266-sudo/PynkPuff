import React, { useState, useEffect } from 'react';
import { Smartphone, Tablet, Monitor, RotateCcw, Maximize, Menu, X } from 'lucide-react';

interface ViewportInfo {
  width: number;
  height: number;
  deviceType: 'mobile' | 'tablet' | 'desktop';
  orientation: 'portrait' | 'landscape';
  touchSupported: boolean;
  pixelRatio: number;
}

interface MobileOptimizationProps {
  children: React.ReactNode;
  onViewportChange: (viewport: ViewportInfo) => void;
}

export const MobileOptimization: React.FC<MobileOptimizationProps> = ({
  children,
  onViewportChange
}) => {
  const [viewport, setViewport] = useState<ViewportInfo>({
    width: window.innerWidth,
    height: window.innerHeight,
    deviceType: 'desktop',
    orientation: 'landscape',
    touchSupported: false,
    pixelRatio: window.devicePixelRatio || 1
  });

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [compactMode, setCompactMode] = useState(false);
  const [showMobileToolbar, setShowMobileToolbar] = useState(true);

  // Detect device type and capabilities
  useEffect(() => {
    const updateViewport = () => {
      const width = window.innerWidth;
      const height = window.innerHeight;
      
      const deviceType = width < 768 ? 'mobile' : width < 1024 ? 'tablet' : 'desktop';
      const orientation = width > height ? 'landscape' : 'portrait';
      const touchSupported = 'ontouchstart' in window || navigator.maxTouchPoints > 0;

      const newViewport: ViewportInfo = {
        width,
        height,
        deviceType,
        orientation,
        touchSupported,
        pixelRatio: window.devicePixelRatio || 1
      };

      setViewport(newViewport);
      setCompactMode(deviceType !== 'desktop');
      onViewportChange(newViewport);
    };

    updateViewport();
    window.addEventListener('resize', updateViewport);
    window.addEventListener('orientationchange', updateViewport);

    return () => {
      window.removeEventListener('resize', updateViewport);
      window.removeEventListener('orientationchange', updateViewport);
    };
  }, [onViewportChange]);

  // Prevent zoom on double tap for mobile
  useEffect(() => {
    if (viewport.touchSupported) {
      let lastTouchEnd = 0;
      const preventZoom = (e: TouchEvent) => {
        const now = Date.now();
        if (now - lastTouchEnd <= 300) {
          e.preventDefault();
        }
        lastTouchEnd = now;
      };

      document.addEventListener('touchend', preventZoom, { passive: false });
      return () => document.removeEventListener('touchend', preventZoom);
    }
  }, [viewport.touchSupported]);

  // Mobile-specific styles
  const getMobileStyles = () => {
    if (viewport.deviceType === 'mobile') {
      return {
        fontSize: '16px', // Prevent zoom on input focus
        minHeight: '44px', // Touch target size
        padding: '12px',
      };
    }
    return {};
  };

  const getDeviceIcon = () => {
    switch (viewport.deviceType) {
      case 'mobile': return <Smartphone className="w-4 h-4" />;
      case 'tablet': return <Tablet className="w-4 h-4" />;
      default: return <Monitor className="w-4 h-4" />;
    }
  };

  return (
    <div className={`min-h-screen ${compactMode ? 'mobile-optimized' : ''}`}>
      {/* Mobile Header */}
      {viewport.deviceType === 'mobile' && (
        <div className="fixed top-0 left-0 right-0 z-50 bg-white border-b border-gray-200 h-14">
          <div className="flex items-center justify-between px-4 h-full">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 hover:bg-gray-100 rounded"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
            
            <div className="flex items-center gap-2">
              {getDeviceIcon()}
              <span className="text-sm font-medium">
                {viewport.width}×{viewport.height}
              </span>
              <span className="text-xs text-gray-500 capitalize">
                {viewport.orientation}
              </span>
            </div>
            
            <button
              onClick={() => setShowMobileToolbar(!showMobileToolbar)}
              className="p-2 hover:bg-gray-100 rounded"
            >
              <Maximize className="w-5 h-5" />
            </button>
          </div>
        </div>
      )}

      {/* Mobile Side Menu */}
      {viewport.deviceType === 'mobile' && mobileMenuOpen && (
        <div className="fixed inset-0 z-40 bg-black/50" onClick={() => setMobileMenuOpen(false)}>
          <div className="fixed left-0 top-14 bottom-0 w-80 bg-white shadow-xl transform transition-transform">
            <div className="p-4 border-b">
              <h3 className="font-medium">Mobile Tools</h3>
            </div>
            
            <div className="p-4 space-y-4">
              <div>
                <h4 className="text-sm font-medium mb-2">Quick Actions</h4>
                <div className="grid grid-cols-2 gap-2">
                  <button className="p-3 bg-gray-100 rounded-lg text-sm">
                    New Project
                  </button>
                  <button className="p-3 bg-gray-100 rounded-lg text-sm">
                    Save
                  </button>
                  <button className="p-3 bg-gray-100 rounded-lg text-sm">
                    Export
                  </button>
                  <button className="p-3 bg-gray-100 rounded-lg text-sm">
                    Share
                  </button>
                </div>
              </div>
              
              <div>
                <h4 className="text-sm font-medium mb-2">View Options</h4>
                <div className="space-y-2">
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={compactMode}
                      onChange={(e) => setCompactMode(e.target.checked)}
                      className="rounded"
                    />
                    <span className="text-sm">Compact Mode</span>
                  </label>
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={showMobileToolbar}
                      onChange={(e) => setShowMobileToolbar(e.target.checked)}
                      className="rounded"
                    />
                    <span className="text-sm">Show Toolbar</span>
                  </label>
                </div>
              </div>
              
              <div>
                <h4 className="text-sm font-medium mb-2">Device Info</h4>
                <div className="text-sm text-gray-600 space-y-1">
                  <div>Type: {viewport.deviceType}</div>
                  <div>Size: {viewport.width}×{viewport.height}</div>
                  <div>Orientation: {viewport.orientation}</div>
                  <div>Touch: {viewport.touchSupported ? 'Yes' : 'No'}</div>
                  <div>Pixel Ratio: {viewport.pixelRatio}x</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Mobile Bottom Toolbar */}
      {viewport.deviceType === 'mobile' && showMobileToolbar && (
        <div className="fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-gray-200">
          <div className="flex items-center justify-around py-2">
            <button className="flex flex-col items-center p-2 min-w-0">
              <div className="w-8 h-8 bg-gray-100 rounded flex items-center justify-center mb-1">
                <span className="text-xs">✏️</span>
              </div>
              <span className="text-xs text-gray-600">Draw</span>
            </button>
            
            <button className="flex flex-col items-center p-2 min-w-0">
              <div className="w-8 h-8 bg-gray-100 rounded flex items-center justify-center mb-1">
                <span className="text-xs">T</span>
              </div>
              <span className="text-xs text-gray-600">Text</span>
            </button>
            
            <button className="flex flex-col items-center p-2 min-w-0">
              <div className="w-8 h-8 bg-gray-100 rounded flex items-center justify-center mb-1">
                <span className="text-xs">🔷</span>
              </div>
              <span className="text-xs text-gray-600">Shape</span>
            </button>
            
            <button className="flex flex-col items-center p-2 min-w-0">
              <div className="w-8 h-8 bg-gray-100 rounded flex items-center justify-center mb-1">
                <span className="text-xs">🖼️</span>
              </div>
              <span className="text-xs text-gray-600">Image</span>
            </button>
            
            <button className="flex flex-col items-center p-2 min-w-0">
              <div className="w-8 h-8 bg-gray-100 rounded flex items-center justify-center mb-1">
                <span className="text-xs">⚙️</span>
              </div>
              <span className="text-xs text-gray-600">More</span>
            </button>
          </div>
        </div>
      )}

      {/* Tablet Sidebar */}
      {viewport.deviceType === 'tablet' && (
        <div className="fixed left-0 top-0 bottom-0 w-16 bg-white border-r border-gray-200 z-30">
          <div className="flex flex-col items-center py-4 space-y-4">
            <button className="p-3 hover:bg-gray-100 rounded-lg">
              <span className="text-lg">✏️</span>
            </button>
            <button className="p-3 hover:bg-gray-100 rounded-lg">
              <span className="text-lg">T</span>
            </button>
            <button className="p-3 hover:bg-gray-100 rounded-lg">
              <span className="text-lg">🔷</span>
            </button>
            <button className="p-3 hover:bg-gray-100 rounded-lg">
              <span className="text-lg">🖼️</span>
            </button>
          </div>
        </div>
      )}

      {/* Main Content */}
      <div 
        className={`
          ${viewport.deviceType === 'mobile' ? 'pt-14 pb-16' : ''}
          ${viewport.deviceType === 'tablet' ? 'pl-16' : ''}
          ${compactMode ? 'compact-layout' : ''}
        `}
        style={getMobileStyles()}
      >
        {children}
      </div>

      {/* Device Orientation Warning */}
      {viewport.deviceType === 'mobile' && viewport.orientation === 'portrait' && (
        <div className="fixed inset-0 bg-black/90 flex items-center justify-center z-60 text-white p-8">
          <div className="text-center">
            <RotateCcw className="w-16 h-16 mx-auto mb-4" />
            <h2 className="text-xl font-semibold mb-2">Rotate Your Device</h2>
            <p className="text-gray-300 mb-4">
              For the best editing experience, please rotate your device to landscape mode.
            </p>
            <button
              onClick={() => {
                // Hide warning (user can continue in portrait if needed)
                const warning = document.querySelector('.orientation-warning');
                if (warning) warning.remove();
              }}
              className="px-4 py-2 bg-white text-black rounded hover:bg-gray-100"
            >
              Continue Anyway
            </button>
          </div>
        </div>
      )}

      {/* Responsive CSS */}
      <style>{`
        .mobile-optimized {
          --touch-target-size: 44px;
          --mobile-padding: 12px;
          --mobile-font-size: 16px;
        }
        
        .mobile-optimized button {
          min-height: var(--touch-target-size);
          min-width: var(--touch-target-size);
          font-size: var(--mobile-font-size);
        }
        
        .mobile-optimized input {
          font-size: var(--mobile-font-size);
          padding: var(--mobile-padding);
        }
        
        .compact-layout .text-sm {
          font-size: 14px;
        }
        
        .compact-layout .p-4 {
          padding: 8px;
        }
        
        .compact-layout .gap-4 {
          gap: 8px;
        }
        
        @media (max-width: 768px) {
          .desktop-only {
            display: none !important;
          }
          
          .mobile-hidden {
            display: none !important;
          }
        }
        
        @media (max-width: 1024px) {
          .tablet-hidden {
            display: none !important;
          }
        }
        
        /* Touch-friendly scrollbars */
        @media (pointer: coarse) {
          ::-webkit-scrollbar {
            width: 12px;
            height: 12px;
          }
          
          ::-webkit-scrollbar-thumb {
            background: rgba(0, 0, 0, 0.3);
            border-radius: 6px;
          }
        }
        
        /* Prevent text selection on touch devices */
        @media (pointer: coarse) {
          .no-select {
            -webkit-user-select: none;
            -moz-user-select: none;
            -ms-user-select: none;
            user-select: none;
          }
        }
        
        /* High DPI display optimizations */
        @media (-webkit-min-device-pixel-ratio: 2), (min-resolution: 192dpi) {
          .high-dpi-optimized {
            image-rendering: -webkit-optimize-contrast;
            image-rendering: crisp-edges;
          }
        }
      `}</style>
    </div>
  );
};