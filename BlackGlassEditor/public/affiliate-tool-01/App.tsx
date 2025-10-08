

import React, { useState, useCallback, useEffect, useRef } from 'react';
import { ARTBOARD_SIZES, LOGOS } from './constants';
import { AppState, ArtboardSize, ArtboardConfig, ArtboardLayout, ElementName, SelectedElement } from './types';
import { InputControls } from './components/InputControls';
import { PreviewArea } from './components/PreviewArea';
import { DebugOverlay } from './components/DebugOverlay';

const updateLogoLayouts = (configs: ArtboardConfig[], logoImage: HTMLImageElement): ArtboardConfig[] => {
  if (!logoImage || !logoImage.naturalWidth || !logoImage.naturalHeight) {
    return configs;
  }
  const aspectRatio = logoImage.naturalWidth / logoImage.naturalHeight;
  return configs.map(config => {
    const logoWidth = config.logoLayout.width;
    if (logoWidth === undefined) {
      return config;
    }
    const newLogoHeight = logoWidth / aspectRatio;
    return {
      ...config,
      logoLayout: {
        ...config.logoLayout,
        height: newLogoHeight,
      },
    };
  });
};

const getTextWidth = (text: string, font: string): number => {
    // This is a browser-only function
    if (typeof document === 'undefined') return text.length * 8; // Fallback for non-browser env
    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d');
    if (!context) return text.length * 8;
    context.font = font;
    return context.measureText(text).width;
};


const generateInitialArtboardConfigs = (initialState: AppState): ArtboardConfig[] => {
  return ARTBOARD_SIZES.map((size, index) => {
    const id = `artboard-${index}-${size.w}x${size.h}`;

    const logoWidth = size.w * 0.15;
    
    const headlineFontSize = size.hlFs ?? Math.max(12, size.w / 25);
    const headlineFont = `${initialState.fontWeight} ${headlineFontSize}px ${initialState.fontFamily}`;
    const headlineWidth = getTextWidth(initialState.headline, headlineFont) + 20; // Add padding

    const subheadlineFontSize = size.shlFs ?? Math.max(10, size.w / 35);
    const subheadlineFont = `${initialState.fontWeight} ${subheadlineFontSize}px ${initialState.fontFamily}`;
    const subheadlineWidth = getTextWidth(initialState.subheadline, subheadlineFont) + 20; // Add padding

    const ctaFontSize = size.ctaFs ?? subheadlineFontSize;
    const ctaFont = `${initialState.fontWeight} ${ctaFontSize}px ${initialState.fontFamily}`;
    // Horizontal padding on CTA is 16px on each side
    const ctaWidth = getTextWidth(initialState.ctaText, ctaFont) + 32;

    const headlineLayout: ArtboardLayout = {
      x: size.hlX ?? (size.w - headlineWidth) / 2,
      y: size.hlY ?? size.h * 0.1,
      width: headlineWidth,
      fontSize: headlineFontSize,
      align: size.hlX !== undefined ? 'left' : 'center',
    };

    const subheadlineLayout: ArtboardLayout = {
      x: size.shlX ?? (size.w - subheadlineWidth) / 2,
      y: size.shlY ?? size.h * 0.25,
      width: subheadlineWidth,
      fontSize: subheadlineFontSize,
      align: size.shlX !== undefined ? 'left' : 'center',
    };

    const ctaLayout: ArtboardLayout = {
      x: size.ctaX ?? (size.w - ctaWidth) / 2,
      y: size.ctaY ?? size.h * 0.75,
      width: ctaWidth,
      fontSize: ctaFontSize,
      align: size.ctaX !== undefined ? 'left' : 'center',
    };

    const logoLayout: ArtboardLayout = {
      width: logoWidth,
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

const recalculateTextLayouts = (configs: ArtboardConfig[], updates: Partial<AppState>, currentState: AppState): ArtboardConfig[] => {
    const relevantChange = ['headline', 'subheadline', 'ctaText', 'fontFamily', 'fontWeight'].some(prop => prop in updates);

    if (!relevantChange) {
        return configs;
    }

    return configs.map(config => {
        const newConfig = { ...config };
        const newFontFamily = updates.fontFamily ?? currentState.fontFamily;
        const newFontWeight = updates.fontWeight ?? currentState.fontWeight;

        const updateElement = (element: 'headline' | 'subheadline' | 'cta') => {
            const layoutKey = `${element}Layout` as const;
            const textKey = (element === 'cta' ? 'ctaText' : element) as 'headline' | 'subheadline' | 'ctaText';
            const padding = element === 'cta' ? 32 : 20;

            const layout = { ...config[layoutKey] } as ArtboardLayout;
            const text = updates[textKey] ?? currentState[textKey];
            const font = `${newFontWeight} ${layout.fontSize}px ${newFontFamily}`;
            const newWidth = getTextWidth(text, font) + padding;
            
            layout.width = newWidth;
            
            if (layout.align === 'center') {
                layout.x = (config.width - newWidth) / 2;
            } else if (layout.align === 'right') {
                layout.x = config.width - newWidth - 20; // 20px edge padding
            }
            // For left-aligned text, x position doesn't need to change unless it's the initial calculation.
            (newConfig[layoutKey] as ArtboardLayout) = layout;
        };
        
        if ('headline' in updates || 'fontFamily' in updates || 'fontWeight' in updates) {
           updateElement('headline');
        }
        if ('subheadline' in updates || 'fontFamily' in updates || 'fontWeight' in updates) {
            updateElement('subheadline');
        }
        if ('ctaText' in updates || 'fontFamily' in updates || 'fontWeight' in updates) {
            updateElement('cta');
        }

        return newConfig;
    });
};


const initialState: AppState = {
  headline: "Dynamic Ad Creation",
  subheadline: "Create stunning visuals effortlessly",
  ctaText: "Learn More",
  fontFamily: "Inter, sans-serif",
  fontWeight: 700,
  fontStyle: 'normal',
  fontSizeAdjustment: 0,
  fontColor: "#FFFFFF",
  letterSpacing: 0,
  lineHeight: 1.2,
  textBgColor: "#000000",
  textBgOpacity: 0.3,
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
  artboardConfigs: [], // Will be generated in useEffect
  zoomLevel: 1.0,
  gridSize: 10,
  snapToGrid: true,
  previewMode: 'carousel',
  focusedArtboardIndex: 0,
  history: [],
  historyIndex: -1,
};


const App: React.FC = () => {
  const [state, setState] = useState<AppState>(() => ({
      ...initialState,
      artboardConfigs: generateInitialArtboardConfigs(initialState)
  }));
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
    let newState = { ...state, ...updates };
    
    // Recalculate text element widths if text content or global font properties change
    const textUpdatedConfigs = recalculateTextLayouts(state.artboardConfigs, updates, state);
    newState.artboardConfigs = textUpdatedConfigs;
    
    // If logoImage is being updated, also update artboard layouts to match aspect ratio
    if (updates.logoImage && updates.logoImage.complete) {
        // Use configs that might have been updated by text changes
        const logoUpdatedConfigs = updateLogoLayouts(newState.artboardConfigs, updates.logoImage);
        newState.artboardConfigs = logoUpdatedConfigs;
    }

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
  
  const handleElementAlign = useCallback((align: 'left' | 'center' | 'right') => {
    if (!selectedElement) return;

    const { elementName } = selectedElement;
    const layoutKey = `${elementName}Layout` as const;

    const newConfigs = stateRef.current.artboardConfigs.map(config => {
        const layout = config[layoutKey] as ArtboardLayout;
        const elementWidth = layout.width || 0; 
        let newX: number;
        const padding = 20;

        switch (align) {
            case 'left':
                newX = padding;
                break;
            case 'right':
                newX = config.width - elementWidth - padding;
                break;
            case 'center':
            default:
                newX = (config.width - elementWidth) / 2;
                break;
        }

        return {
            ...config,
            [layoutKey]: {
                ...layout,
                x: newX,
                align: align,
            }
        };
    });
    
    handleStateChange({ artboardConfigs: newConfigs });
  }, [selectedElement]);

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
    const generatedConfigs = generateInitialArtboardConfigs(initialState);
    const updatedInitialState = { ...initialState, artboardConfigs: generatedConfigs };
    
    recordHistory(updatedInitialState);
    
    // Load default logo
    const defaultLogoImg = new Image();
    const svg_data_uri = 'data:image/svg+xml;base64,' + btoa(LOGOS.black);
    defaultLogoImg.onload = () => {
        const newArtboardConfigs = updateLogoLayouts(generatedConfigs, defaultLogoImg);

        const stateWithLogo = { 
            ...updatedInitialState, 
            logoImage: defaultLogoImg,
            artboardConfigs: newArtboardConfigs,
        };
        // We need to update the initial history entry with the logo
        const { history: _h, historyIndex: _hi, ...stateToSave } = stateWithLogo;
        
        setState(s => ({
            ...s,
            ...stateToSave,
            history: [stateToSave],
            historyIndex: 0
        }));
    };
    defaultLogoImg.src = svg_data_uri;

  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  
  // Fix: The end of this file was corrupted. This fix corrects the initialization of debugInfo, adds the missing
  // return statement to the App component, and adds a default export, resolving all reported errors.
  let debugInfo: { element: ElementName | null; layout: Partial<ArtboardLayout> | null; } = { element: null, layout: null };
  if (selectedElement) {
    const { artboardId, elementName } = selectedElement;
    const artboardConfig = state.artboardConfigs.find(c => c.id === artboardId);
    if (artboardConfig) {
      const layoutKey = `${elementName}Layout` as keyof ArtboardConfig;
      debugInfo = {
        element: elementName,
        layout: artboardConfig[layoutKey] as Partial<ArtboardLayout>,
      };
    }
  }

  return (
    <div className="flex h-screen font-sans bg-gray-100 text-gray-900">
      <aside className="w-[380px] bg-white p-4 shadow-xl z-20 overflow-y-auto flex flex-col border-r border-gray-200">
        <InputControls
          state={state}
          onStateChange={handleStateChange}
          undo={undo}
          redo={redo}
          canUndo={state.historyIndex > 0}
          canRedo={state.historyIndex < state.history.length - 1}
          selectedElement={selectedElement}
          onElementAlign={handleElementAlign}
        />
      </aside>
      <main className="flex-1 flex flex-col h-screen">
        <PreviewArea
          state={state}
          onArtboardLayoutUpdate={handleArtboardLayoutUpdate}
          onInteractionEnd={handleInteractionEnd}
          selectedElement={selectedElement}
          onElementSelect={handleElementSelect}
          onStateChange={handleStateChange}
          onFocusChange={handleFocusChange}
          onArtboardBackgroundPositionUpdate={handleArtboardBackgroundPositionUpdate}
        />
      </main>
      <DebugOverlay info={debugInfo} />
    </div>
  );
};

export default App;