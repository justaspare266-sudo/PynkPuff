import React, { useRef, useEffect } from 'react';
import { BannerDisplay } from './BannerDisplay';
import { AppState, SelectedElement, ElementName, ArtboardLayout } from '../types';
import { ChevronLeftIcon, ChevronRightIcon, GridIcon, ViewCarouselIcon } from './icons';

interface PreviewAreaProps {
  state: AppState;
  onArtboardLayoutUpdate: (artboardId: string, elementName: ElementName, newLayout: Partial<ArtboardLayout>) => void;
  onArtboardBackgroundPositionUpdate: (artboardId: string, position: { x: number; y: number; }) => void;
  onInteractionEnd: () => void;
  selectedElement: SelectedElement;
  onElementSelect: (selection: SelectedElement) => void;
  onStateChange: (updates: Partial<AppState>) => void;
  onFocusChange: (newIndex: number | 'next' | 'prev') => void;
}

export const PreviewArea: React.FC<PreviewAreaProps> = ({ state, onArtboardLayoutUpdate, onInteractionEnd, selectedElement, onElementSelect, onStateChange, onFocusChange, onArtboardBackgroundPositionUpdate }) => {
  const carouselRef = useRef<HTMLDivElement>(null);
  const scrollTimeoutRef = useRef<number | null>(null);

  useEffect(() => {
    const handleWheelScroll = (e: WheelEvent) => {
      if (scrollTimeoutRef.current) {
        return;
      }

      if (Math.abs(e.deltaX) > Math.abs(e.deltaY)) {
        e.preventDefault();
        
        if (e.deltaX > 2) {
            onFocusChange('next');
        } else if (e.deltaX < -2) {
            onFocusChange('prev');
        }

        scrollTimeoutRef.current = window.setTimeout(() => {
            if (scrollTimeoutRef.current) {
                clearTimeout(scrollTimeoutRef.current);
                scrollTimeoutRef.current = null;
            }
        }, 500); // Corresponds to the CSS animation duration
      }
    };
    
    const carouselElement = carouselRef.current;
    if (carouselElement && state.previewMode === 'carousel') {
        carouselElement.addEventListener('wheel', handleWheelScroll, { passive: false });
    }

    return () => {
        if (carouselElement) {
            carouselElement.removeEventListener('wheel', handleWheelScroll);
        }
        if (scrollTimeoutRef.current) {
            clearTimeout(scrollTimeoutRef.current);
        }
    };
  }, [state.previewMode, onFocusChange]);


  return (
    <div className="flex-1 flex flex-col h-full">
      <div className="bg-white p-2 border-b border-gray-300 flex items-center justify-between z-10 shadow-sm">
        <div className="flex items-center space-x-2">
            <h2 className="text-lg font-semibold text-gray-800">Preview</h2>
            <div className="flex items-center space-x-1 p-1 bg-gray-200 rounded-md">
                <button onClick={() => onStateChange({ previewMode: 'carousel' })} className={`p-1 ${state.previewMode === 'carousel' ? 'bg-white shadow' : 'hover:bg-gray-300'}`}>
                    <ViewCarouselIcon className="w-5 h-5 text-gray-700" />
                </button>
                <button onClick={() => onStateChange({ previewMode: 'grid' })} className={`p-1 ${state.previewMode === 'grid' ? 'bg-white shadow' : 'hover:bg-gray-300'}`}>
                    <GridIcon className="w-5 h-5 text-gray-700" />
                </button>
            </div>
        </div>
        <div className="flex items-center space-x-2">
          <span className="text-sm text-gray-600">Zoom:</span>
          <input
            type="range"
            min="0.1"
            max="2"
            step="0.05"
            value={state.zoomLevel}
            onChange={(e) => onStateChange({ zoomLevel: parseFloat(e.target.value) })}
            className="w-32"
          />
          <span className="text-sm font-semibold w-12 text-right">{Math.round(state.zoomLevel * 100)}%</span>
        </div>
      </div>
      <div 
        className={`flex-1 p-8 bg-gray-100 ${state.previewMode === 'grid' ? 'overflow-y-auto' : 'overflow-hidden'}`}
        onClick={() => onElementSelect(null)}
      >
        {state.previewMode === 'grid' ? (
             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8 justify-items-center">
                {state.artboardConfigs.map(config => {
                    const labelHeight = 24; // Approx height for the dimension label
                    return (
                        <div 
                            key={config.id} 
                            className="flex flex-col justify-start items-center"
                            style={{ height: `${(config.height * state.zoomLevel) + labelHeight}px` }}
                        >
                            <div className="text-sm text-gray-600 font-mono mb-2">{`${config.width} x ${config.height}`}</div>
                            <div style={{ transform: `scale(${state.zoomLevel})`, transformOrigin: 'top center' }}>
                                <BannerDisplay 
                                    config={config} 
                                    state={state} 
                                    onArtboardLayoutUpdate={onArtboardLayoutUpdate}
                                    onArtboardBackgroundPositionUpdate={onArtboardBackgroundPositionUpdate}
                                    onInteractionEnd={onInteractionEnd}
                                    selectedElement={selectedElement}
                                    onElementSelect={onElementSelect}
                                />
                            </div>
                        </div>
                    )
                })}
            </div>
        ) : (
            <div ref={carouselRef} className="w-full h-full flex items-center justify-center relative" style={{ perspective: '1500px' }}>
                <button onClick={() => onFocusChange('prev')} className="absolute left-4 top-1/2 -translate-y-1/2 z-30 bg-white/50 hover:bg-white rounded-full p-2 shadow-lg backdrop-blur-sm transition-colors">
                    <ChevronLeftIcon className="w-6 h-6 text-gray-800" />
                </button>
                <button onClick={() => onFocusChange('next')} className="absolute right-4 top-1/2 -translate-y-1/2 z-30 bg-white/50 hover:bg-white rounded-full p-2 shadow-lg backdrop-blur-sm transition-colors">
                    <ChevronRightIcon className="w-6 h-6 text-gray-800" />
                </button>

                <div className="relative w-full h-full" style={{ transformStyle: 'preserve-3d' }}>
                    {state.artboardConfigs.map((config, index) => {
                        const focusedIndex = state.focusedArtboardIndex;
                        const offset = index - focusedIndex;
                        const isVisible = Math.abs(offset) < 3; 

                        const style: React.CSSProperties = {
                            position: 'absolute',
                            top: '50%',
                            left: '50%',
                            transition: 'transform 0.5s ease-out, opacity 0.5s',
                            transformOrigin: 'center center',
                            opacity: isVisible ? 1 : 0,
                            zIndex: state.artboardConfigs.length - Math.abs(offset),
                            transform: `
                                translate(-50%, -50%)
                                scale(${state.zoomLevel * 0.7})
                                translateX(${offset * 70}%)
                                translateZ(${Math.abs(offset) * -400}px)
                                rotateY(${offset * -25}deg)
                            `,
                        };
    
                        if (offset === 0) {
                            style.transform = `translate(-50%, -50%) scale(${state.zoomLevel})`;
                        }

                        return (
                            <div
                                key={config.id}
                                style={style}
                                onClick={(e) => {
                                    if (offset !== 0) {
                                        e.stopPropagation();
                                        onFocusChange(index);
                                    }
                                }}
                            >
                                <BannerDisplay 
                                    config={config} 
                                    state={state} 
                                    onArtboardLayoutUpdate={onArtboardLayoutUpdate}
                                    onArtboardBackgroundPositionUpdate={onArtboardBackgroundPositionUpdate}
                                    onInteractionEnd={onInteractionEnd}
                                    selectedElement={selectedElement}
                                    onElementSelect={onElementSelect}
                                />
                            </div>
                        );
                    })}
                </div>
            </div>
        )}
      </div>
    </div>
  );
};