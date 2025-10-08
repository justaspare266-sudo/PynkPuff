import React, { useCallback, useEffect } from 'react';
import { AppState, ArtboardLayout, ElementName, SelectedElement } from '../types';
import { BannerDisplay } from './BannerDisplay';
import { GridIcon, ViewCarouselIcon, ChevronLeftIcon, ChevronRightIcon } from './icons';

interface PreviewAreaProps {
  state: AppState;
  onStateChange: (updates: Partial<AppState>, recordHistory?: boolean) => void;
  onArtboardLayoutUpdate: (artboardId: string, elementName: ElementName, newLayout: Partial<ArtboardLayout>) => void;
  onInteractionEnd: () => void;
  selectedElement: SelectedElement;
  onElementSelect: (selection: SelectedElement) => void;
  onArtboardBackgroundPositionUpdate: (artboardId: string, position: { x: number; y: number }) => void;
  selectedArtboardId: string | null;
  onArtboardSelect: (artboardId: string | null) => void;
  onArtboardMove: (direction: 'up' | 'down' | 'left' | 'right') => void;
}

const ControlButton: React.FC<{ onClick: () => void; active: boolean; children: React.ReactNode, label: string }> = ({ onClick, active, children, label }) => (
    <button
        onClick={onClick}
        aria-label={label}
        className={`p-2 rounded-md transition-colors ${active ? 'bg-purple-600 text-white' : 'bg-gray-200 hover:bg-gray-300'}`}
    >
        {children}
    </button>
);


export const PreviewArea: React.FC<PreviewAreaProps> = ({
  state,
  onStateChange,
  onArtboardLayoutUpdate,
  onInteractionEnd,
  selectedElement,
  onElementSelect,
  onArtboardBackgroundPositionUpdate,
  selectedArtboardId,
  onArtboardSelect,
  onArtboardMove
}) => {
  const { zoomLevel, artboardConfigs, previewMode, focusedArtboardIndex, gridSize, snapToGrid } = state;

  const handleZoomChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onStateChange({ zoomLevel: parseFloat(e.target.value) }, false);
  };
  
  const setPreviewMode = (mode: 'grid' | 'carousel') => {
    onStateChange({ previewMode: mode });
  };
  
  const handleFocusChange = (delta: number) => {
    const newIndex = (focusedArtboardIndex + delta + artboardConfigs.length) % artboardConfigs.length;
    onStateChange({ focusedArtboardIndex: newIndex });
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!selectedArtboardId || previewMode !== 'grid') return;

      if (e.key.startsWith('Arrow')) {
        e.preventDefault();
        const direction = e.key.replace('Arrow', '').toLowerCase() as 'up' | 'down' | 'left' | 'right';
        onArtboardMove(direction);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [selectedArtboardId, onArtboardMove, previewMode]);

  const renderGrid = () => (
    <div className="flex flex-wrap gap-8 p-8 justify-center">
      {artboardConfigs.map((config) => (
        <div 
          key={config.id} 
          className={`p-2 rounded-lg transition-all duration-200 ${selectedArtboardId === config.id ? 'bg-purple-200 ring-2 ring-purple-500' : 'bg-transparent'}`}
          onClick={(e) => { e.stopPropagation(); onArtboardSelect(config.id); }}
        >
          <div style={{ transform: `scale(${zoomLevel})`, transformOrigin: 'top left' }}>
            <BannerDisplay
              config={config}
              state={state}
              onArtboardLayoutUpdate={onArtboardLayoutUpdate}
              onInteractionEnd={onInteractionEnd}
              selectedElement={selectedElement}
              onElementSelect={onElementSelect}
              onArtboardBackgroundPositionUpdate={onArtboardBackgroundPositionUpdate}
            />
          </div>
        </div>
      ))}
    </div>
  );

  const renderCarousel = () => {
    const focusedConfig = artboardConfigs[focusedArtboardIndex];
    if (!focusedConfig) return <div>No artboards to display.</div>;

    return (
      <div className="w-full h-full flex items-center justify-center relative p-8">
        <button 
          onClick={() => handleFocusChange(-1)} 
          className="absolute left-4 top-1/2 -translate-y-1/2 z-10 p-3 bg-white/80 rounded-full shadow-lg hover:bg-white transition-colors"
        >
          <ChevronLeftIcon className="w-6 h-6" />
        </button>
        <div style={{ transform: `scale(${zoomLevel})`, transformOrigin: 'center' }}>
          <BannerDisplay
            config={focusedConfig}
            state={state}
            onArtboardLayoutUpdate={onArtboardLayoutUpdate}
            onInteractionEnd={onInteractionEnd}
            selectedElement={selectedElement}
            onElementSelect={onElementSelect}
            onArtboardBackgroundPositionUpdate={onArtboardBackgroundPositionUpdate}
          />
        </div>
        <button 
          onClick={() => handleFocusChange(1)} 
          className="absolute right-4 top-1/2 -translate-y-1/2 z-10 p-3 bg-white/80 rounded-full shadow-lg hover:bg-white transition-colors"
        >
          <ChevronRightIcon className="w-6 h-6" />
        </button>
      </div>
    );
  };
  
  const focusedConfig = artboardConfigs[focusedArtboardIndex];

  return (
    <div className="flex-1 flex flex-col bg-gray-200 h-full w-full">
      <header className="bg-white p-2 flex items-center justify-between shadow-md z-10 shrink-0">
        <div className="flex items-center gap-4">
          <label htmlFor="zoom" className="text-sm font-medium">Zoom: {Math.round(zoomLevel * 100)}%</label>
          <input
            type="range"
            id="zoom"
            min="0.1"
            max="2"
            step="0.05"
            value={zoomLevel}
            onChange={handleZoomChange}
            className="w-32"
          />
        </div>
        
        {previewMode === 'carousel' && focusedConfig && (
            <div className="text-sm font-semibold text-gray-600">
                {focusedArtboardIndex + 1} / {artboardConfigs.length} - {focusedConfig.width}x{focusedConfig.height}
            </div>
        )}

        <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
                <input 
                    id="snapToGrid" 
                    type="checkbox" 
                    checked={snapToGrid}
                    onChange={(e) => onStateChange({ snapToGrid: e.target.checked })}
                    className="h-4 w-4 text-purple-600 border-gray-300 rounded focus:ring-purple-500"
                />
                <label htmlFor="snapToGrid" className="text-sm">Snap</label>
            </div>
            <div className="flex items-center gap-1">
                <label htmlFor="gridSize" className="text-sm">Grid:</label>
                <input 
                    id="gridSize"
                    type="number"
                    value={gridSize}
                    onChange={(e) => onStateChange({ gridSize: parseInt(e.target.value, 10) || 1 })}
                    className="w-14 p-1 border border-gray-300 rounded-md text-sm"
                />
            </div>

            <div className="flex items-center gap-2 p-1 bg-gray-100 rounded-lg">
                <ControlButton onClick={() => setPreviewMode('grid')} active={previewMode === 'grid'} label="Grid View">
                    <GridIcon className="w-5 h-5" />
                </ControlButton>
                <ControlButton onClick={() => setPreviewMode('carousel')} active={previewMode === 'carousel'} label="Carousel View">
                    <ViewCarouselIcon className="w-5 h-5" />
                </ControlButton>
            </div>
        </div>
      </header>
      <div className="flex-1 overflow-auto">
        {previewMode === 'grid' ? renderGrid() : renderCarousel()}
      </div>
    </div>
  );
};
