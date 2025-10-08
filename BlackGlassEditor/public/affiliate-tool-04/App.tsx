import React, { useState, useCallback, useEffect, useRef } from 'react';
import { ARTBOARD_SIZES, LOGOS } from './constants';
import { AppState, ArtboardSize, ArtboardConfig, ArtboardLayout, ElementName, SelectedElement } from './types';
import { InputControls } from './components/InputControls';
import { PreviewArea } from './components/PreviewArea';

const generateInitialArtboardConfigs = (): ArtboardConfig[] => {
  return ARTBOARD_SIZES.map((size, index) => {
    const id = `artboard-${index}-${size.w}x${size.h}`;

    const headlineWidth = size.w * 0.8;
    const subheadlineWidth = size.w * 0.8;
    const ctaWidth = size.w * 0.4;
    const logoWidth = size.w * 0.15;
    const logoHeight = size.h * 0.15;

    const headlineLayout: ArtboardLayout = {
      x: size.hlX ?? (size.w - headlineWidth) / 2,
      y: size.hlY ?? size.h * 0.1,
      fontSize: size.hlFs ?? Math.max(12, headlineWidth / 10),
      align: size.hlX !== undefined ? 'left' : 'center',
    };

    const subheadlineLayout: ArtboardLayout = {
      x: size.shlX ?? (size.w - subheadlineWidth) / 2,
      y: size.shlY ?? size.h * 0.25,
      fontSize: size.shlFs ?? Math.max(10, subheadlineWidth / 12),
      align: size.shlX !== undefined ? 'left' : 'center',
    };

    const ctaLayout: ArtboardLayout = {
      x: size.ctaX ?? (size.w - ctaWidth) / 2,
      y: size.ctaY ?? size.h * 0.75,
    };

    const logoLayout: ArtboardLayout = {
      width: logoWidth,
      height: logoHeight,
      x: size.logoX ?? (size.w - logoWidth) / 2,
      y: size.logoY ?? size.h * 0.05,
    };

    return {
      id,
      width: size.w,
      height: size.h,
      headlineLayout,
      subheadlineLayout,
      ctaLayout,
      logoLayout,
      backgroundPosition: { x: 0, y: 0 },
    };
  });
};


const initialState: AppState = {
  headline: "Dynamic Ad Creation",
  subheadline: "Powered by Generative AI",
  ctaText: "Learn More",
  fontFamily: "Inter, sans-serif",
  fontWeight: 700,
  fontStyle: 'normal',
  fontSizeAdjustment: 0,
  fontColor: "#FFFFFF",
  letterSpacing: 0,
  lineHeight: 1.2,
  textBgColor: "rgba(0,0,0,0.3)",
  ctaBgColor: "#7C3AED",
  ctaBgOpacity: 1,
  ctaTextColor: "#FFFFFF",
  ctaStrokeEnabled: false,
  ctaStrokeWidth: 1,
  ctaStrokeColor: '#000000',
  ctaUnderline: false,
  ctaUnderlineThickness: 1,
  ctaUnderlineOffset: 2,
  logoImage: null,
  backgroundType: 'gradient',
  backgroundColor: '#FFFFFF',
  backgroundImage: null,
  backgroundScale: 1,
  gradient: {
    angle: 45,
    colors: ['#6D28D9', '#D946EF'],
  },
  borderRadius: 8,
  artboardConfigs: generateInitialArtboardConfigs(),
  zoomLevel: 1.0,
  gridSize: 10,
  snapToGrid: true,
  previewMode: 'carousel',
  focusedArtboardIndex: 0,
  history: [],
  historyIndex: -1,
};


const App: React.FC = () => {
  const [state, setState] = useState<AppState>(initialState);
  const [selectedElement, setSelectedElement] = useState<SelectedElement>(null);
  
  const stateRef = useRef(state);
  stateRef.current = state;

  const recordHistory = (newState: AppState) => {
    const history = stateRef.current.history.slice(0, stateRef.current.historyIndex + 1);
    // Omit history from the stored state to prevent nesting
    const { history: _h, historyIndex: _hi, ...stateToSave } = newState;
    const newHistory = [...history, stateToSave];
    
    setState({
        ...newState,
        history: newHistory,
        historyIndex: newHistory.length - 1
    });
  }

  const handleStateChange = (updates: Partial<AppState>, record: boolean = true) => {
    const newState = { ...state, ...updates };
    if (record) {
      recordHistory(newState);
    } else {
      setState(newState);
    }
  };

  const handleArtboardLayoutUpdate = useCallback((artboardId: string, elementName: ElementName, newLayout: Partial<ArtboardLayout>) => {
    setState(prevState => {
      const newConfigs = prevState.artboardConfigs.map(config => {
        if (config.id === artboardId) {
          const layoutKey = `${elementName}Layout` as keyof ArtboardConfig;
          const updatedLayout = { ...(config[layoutKey] as ArtboardLayout), ...newLayout };
          return { ...config, [layoutKey]: updatedLayout };
        }
        return config;
      });
      return { ...prevState, artboardConfigs: newConfigs };
    });
  }, []);
  
  const handleArtboardBackgroundPositionUpdate = useCallback((artboardId: string, position: { x: number; y: number; }) => {
    setState(prevState => {
        const newConfigs = prevState.artboardConfigs.map(config => {
          if (config.id === artboardId) {
            return { ...config, backgroundPosition: position };
          }
          return config;
        });
        return { ...prevState, artboardConfigs: newConfigs };
      });
  }, []);

  const handleInteractionEnd = useCallback(() => {
    recordHistory(stateRef.current);
  }, []);

  const handleFocusChange = useCallback((newIndex: number | 'next' | 'prev') => {
    setState(prevState => {
        const maxIndex = prevState.artboardConfigs.length - 1;
        let nextIndex = prevState.focusedArtboardIndex;

        if (newIndex === 'next') {
            nextIndex = (prevState.focusedArtboardIndex + 1) % prevState.artboardConfigs.length;
        } else if (newIndex === 'prev') {
            nextIndex = (prevState.focusedArtboardIndex - 1 + prevState.artboardConfigs.length) % prevState.artboardConfigs.length;
        } else {
            nextIndex = newIndex;
        }

        if (nextIndex < 0) nextIndex = 0;
        if (nextIndex > maxIndex) nextIndex = maxIndex;

        return { ...prevState, focusedArtboardIndex: nextIndex };
    });
  }, []);

  const handleElementSelect = (selection: SelectedElement) => {
      setSelectedElement(selection);
      if (selection) {
          const { artboardId } = selection;
          const artboardIndex = stateRef.current.artboardConfigs.findIndex(c => c.id === artboardId);
          if (artboardIndex !== -1 && artboardIndex !== stateRef.current.focusedArtboardIndex) {
              handleFocusChange(artboardIndex);
          }
      }
  };
  
  const undo = useCallback(() => {
    if (state.historyIndex > 0) {
        const newIndex = state.historyIndex - 1;
        const previousState = state.history[newIndex];
        setState(s => ({ ...s, ...previousState, historyIndex: newIndex }));
    }
  }, [state.history, state.historyIndex]);

  const redo = useCallback(() => {
    if (state.historyIndex < state.history.length - 1) {
        const newIndex = state.historyIndex + 1;
        const nextState = state.history[newIndex];
        setState(s => ({ ...s, ...nextState, historyIndex: newIndex }));
    }
  }, [state.history, state.historyIndex]);

  useEffect(() => {
    // Set initial history
    recordHistory(initialState);
    
    // Load default logo
    const defaultLogoImg = new Image();
    const svg_data_uri = 'data:image/svg+xml;base64,' + btoa(LOGOS.black);
    defaultLogoImg.onload = () => {
        // Set state without recording this initial load as a separate history event
        setState(s => ({...s, logoImage: defaultLogoImg}));
        // We need to update the initial history entry with the logo
        const initialHistoryEntry = {...initialState, logoImage: defaultLogoImg };
        delete (initialHistoryEntry as any).history;
        delete (initialHistoryEntry as any).historyIndex;
        
        setState(s => ({
            ...s,
            history: [initialHistoryEntry],
            historyIndex: 0
        }));
    };
    defaultLogoImg.src = svg_data_uri;

  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="flex h-screen bg-gray-100 font-sans text-gray-900">
      <div className="w-[380px] bg-white p-4 overflow-y-auto shadow-lg flex flex-col">
        <h1 className="text-2xl font-bold mb-2 text-gray-800">Dynamic Ad Creator</h1>
        <p className="text-sm text-gray-500 mb-4">Create beautiful ads in seconds with AI.</p>
        <InputControls 
          state={state} 
          onStateChange={handleStateChange}
          undo={undo}
          redo={redo}
          canUndo={state.historyIndex > 0}
          canRedo={state.historyIndex < state.history.length - 1}
        />
      </div>
      <div className="flex-1 flex flex-col bg-gray-200">
        <PreviewArea 
          state={state} 
          onArtboardLayoutUpdate={handleArtboardLayoutUpdate}
          onArtboardBackgroundPositionUpdate={handleArtboardBackgroundPositionUpdate}
          onInteractionEnd={handleInteractionEnd}
          selectedElement={selectedElement}
          onElementSelect={handleElementSelect}
          onStateChange={(updates) => handleStateChange(updates, false)}
          onFocusChange={handleFocusChange}
        />
      </div>
    </div>
  );
};

export default App;