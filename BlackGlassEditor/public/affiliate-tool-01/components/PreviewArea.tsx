import React, {useState} from 'react';
// Fix: Add .tsx and .ts extensions to resolve modules.
import { BannerDisplay } from './BannerDisplay.tsx';
import { ArtboardConfig, AppState, ElementName, ArtboardLayout, SelectedElement, SortOrder } from '../types.ts';
import { SortIcon } from './icons.tsx';

interface PreviewAreaProps {
  artboardConfigs: ArtboardConfig[];
  appState: AppState;
  onArtboardLayoutUpdate: (artboardId: string, elementName: ElementName, newLayout: Partial<ArtboardLayout>) => void;
  onArtboardBackgroundPositionUpdate: (artboardId: string, position: { x: number; y: number; }) => void;
  onInteractionEnd: () => void;
  selectedElement: SelectedElement;
  onElementSelect: (selection: SelectedElement) => void;
  onArtboardMove: (artboardId: string, direction: 'up' | 'down' | 'left' | 'right') => void;
  onStateChange: (updates: Partial<AppState>, recordHistory?: boolean) => void;
}

export const PreviewArea: React.FC<PreviewAreaProps> = ({
  artboardConfigs,
  appState,
  onArtboardLayoutUpdate,
  onArtboardBackgroundPositionUpdate,
  onInteractionEnd,
  selectedElement,
  onElementSelect,
  onArtboardMove,
  onStateChange,
}) => {
    const { zoomLevel } = appState;
    const [focusedArtboardId, setFocusedArtboardId] = useState<string | null>(null);

    const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>, artboardId: string) => {
        const keyMap = { ArrowUp: 'up', ArrowDown: 'down', ArrowLeft: 'left', ArrowRight: 'right' };
        if (keyMap[e.key]) {
            e.preventDefault();
            onArtboardMove(artboardId, keyMap[e.key]);
        }
    };
    
  return (
    <div className="flex flex-col h-full">
         <header className="sticky top-0 z-20 bg-white border-b border-gray-200 px-4 py-2 flex items-center justify-between">
            <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2">
                    <SortIcon className="w-5 h-5 text-gray-500" />
                    <select
                        value={appState.sortOrder}
                        onChange={(e) => onStateChange({ sortOrder: e.target.value as SortOrder })}
                        className="bg-white border-none text-sm font-medium focus:ring-0"
                    >
                        <option value="default">Default Order</option>
                        <option value="width-asc">Width (asc)</option>
                        <option value="width-desc">Width (desc)</option>
                        <option value="height-asc">Height (asc)</option>
                        <option value="height-desc">Height (desc)</option>
                        <option value="area-asc">Area (asc)</option>
                        <option value="area-desc">Area (desc)</option>
                    </select>
                </div>
            </div>
            <div className="flex items-center w-64 space-x-2">
                <input
                    type="range"
                    min="0.2"
                    max="1.5"
                    step="0.01"
                    value={zoomLevel}
                    onChange={(e) => onStateChange({ zoomLevel: parseFloat(e.target.value) }, false)}
                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                />
                <span className="text-sm text-gray-600 font-mono w-28 text-center">
                    {zoomLevel === 1 ? 'Normal View' : `${Math.round(zoomLevel * 100)}% (${((zoomLevel - 1) * 100).toFixed(0)}%)`}
                </span>
            </div>
        </header>
        <div 
          className="flex-grow bg-gray-100" 
          id="preview-area"
          style={{ padding: `${24 * zoomLevel}px`,  }}
        >
          <div
            className="flex flex-wrap items-start"
            style={{
              gap: `${24 * zoomLevel}px`,
            }}
          >
            {artboardConfigs.map(config => (
              <div 
                  key={config.id} 
                  className="relative group outline-none border border-gray-200 rounded-lg shadow-sm overflow-hidden flex flex-col bg-white"
                  tabIndex={0}
                  onFocus={() => setFocusedArtboardId(config.id)}
                  onBlur={() => setFocusedArtboardId(null)}
                  onKeyDown={(e) => handleKeyDown(e, config.id)}
              >
                  <div className="border-b border-gray-200 p-2 bg-white text-center text-xs font-mono text-gray-500 shrink-0">
                      {config.width}x{config.height}
                  </div>
                  <div
                      className="relative"
                      style={{
                          width: config.width * zoomLevel,
                          height: config.height * zoomLevel,
                      }}
                  >
                      <div style={{ 
                          transform: `scale(${zoomLevel})`, 
                          transformOrigin: 'top left',
                          width: config.width,
                          height: config.height
                        }}>
                          <BannerDisplay
                            config={config}
                            state={appState}
                            onArtboardLayoutUpdate={onArtboardLayoutUpdate}
                            onArtboardBackgroundPositionUpdate={onArtboardBackgroundPositionUpdate}
                            onInteractionEnd={onInteractionEnd}
                            selectedElement={selectedElement}
                            onElementSelect={onElementSelect}
                          />
                      </div>
                  </div>
                 {config.isComplete && (
                    <div 
                        style={{
                            position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
                            backgroundColor: 'rgba(255, 255, 255, 0.7)',
                            display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 20, pointerEvents: 'none'
                        }}
                    >
                        <div style={{ backgroundColor: 'white', color: '#10B981', padding: '8px 16px', borderRadius: '9999px', display: 'flex', alignItems: 'center', fontWeight: 'bold', boxShadow: '0 4px 6px rgba(0,0,0,0.1)'}}>
                            <svg className="w-6 h-6 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                            Done
                        </div>
                    </div>
                 )}
                 {focusedArtboardId === config.id && (
                    <div className="absolute inset-0 ring-2 ring-purple-500 pointer-events-none rounded-lg"></div>
                 )}
              </div>
            ))}
          </div>
        </div>
    </div>
  );
};
