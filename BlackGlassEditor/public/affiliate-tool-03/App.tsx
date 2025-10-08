import React, { useState, useCallback, useMemo, useEffect } from 'react';
import { InputControls } from './components/InputControls';
// Fix: Explicitly import with .tsx extension to resolve module.
import { PreviewArea } from './components/PreviewArea.tsx';
import { DebugOverlay } from './components/DebugOverlay';
import { ArtboardOrderDebugger } from './components/ArtboardOrderDebugger';
import { AppState, ArtboardConfig, ArtboardLayout, ElementName, SelectedElement, ArtboardSize } from './types';
import { ARTBOARD_SIZES } from './constants';


const MAX_HISTORY = 50;

const getDefaultLayout = (size: ArtboardSize, elementName: ElementName): ArtboardLayout => {
    const logoHeight = 40;
    const logoAspectRatio = 150 / logoHeight;
    const logoWidth = logoHeight * logoAspectRatio;
    const align = size.hlX ? 'left' : 'center';

    switch(elementName) {
        case 'logo':
             return { x: 20, y: size.logoY || 20, width: logoWidth, height: logoHeight, align: 'left', textAlign: 'left', vAlign: 'top' };
        case 'headline':
            return { x: size.hlX || 20, y: size.hlY || 100, width: size.w - 40, fontSize: size.hlFs || 20, align, textAlign: align, vAlign: 'top' };
        case 'subheadline':
            return { x: size.shlX || 20, y: size.shlY || 150, width: size.w - 40, fontSize: size.shlFs || 12, align, textAlign: align, vAlign: 'top' };
        case 'cta':
            const ctaAlign = size.ctaX ? 'left' : 'center';
            return { x: size.ctaX || 20, y: size.ctaY || 200, width: 120, fontSize: size.ctaFs || 12, align: ctaAlign, textAlign: ctaAlign, vAlign: 'top' };
        default:
            return { x: 0, y: 0, width: 100, height: 50, fontSize: 16, align: 'left', textAlign: 'left', vAlign: 'top' };
    }
};

const initialArtboardConfigs: ArtboardConfig[] = ARTBOARD_SIZES.map((size, index) => ({
    id: `artboard-${index}-${size.w}x${size.h}`,
    width: size.w,
    height: size.h,
    logoLayout: getDefaultLayout(size, 'logo'),
    headlineLayout: getDefaultLayout(size, 'headline'),
    subheadlineLayout: getDefaultLayout(size, 'subheadline'),
    ctaLayout: getDefaultLayout(size, 'cta'),
    backgroundPosition: { x: 0, y: 0 },
}));

const initialState: AppState = {
    headline: "Dynamic Ad Creative Suite",
    subheadline: "Build, preview, and export all your banner sizes in one place.",
    ctaText: "Learn More",
    fontFamily: "Inter, sans-serif",
    fontWeight: 700,
    fontStyle: 'normal',
    fontSizeAdjustment: 0,
    fontColor: "#FFFFFF",
    letterSpacing: 0,
    lineHeight: 1.2,
    textBgColor: "#000000",
    textBgOpacity: 0.5,
    ctaBgColor: "#7C3AED",
    ctaBgOpacity: 1,
    ctaTextColor: "#FFFFFF",
    ctaStrokeEnabled: false,
    ctaStrokeWidth: 2,
    ctaStrokeColor: '#FFFFFF',
    ctaUnderline: false,
    ctaUnderlineThickness: 1,
    ctaUnderlineOffset: 2,
    logoImage: null,
    backgroundType: 'gradient',
    backgroundColor: "#F3F4F6",
    backgroundImage: null,
    backgroundScale: 1,
    gradient: {
        angle: 45,
        colors: ["#6D28D9", "#D946EF"],
    },
    artboardConfigs: initialArtboardConfigs,
    zoomLevel: 0.5,
    gridSize: 10,
    snapToGrid: true,
    previewMode: 'grid',
    focusedArtboardIndex: 0,
    alignAsGroup: false,
    selectedArtboardId: null,
    history: [],
    historyIndex: -1,
};

const estimateTextHeight = (text: string, layout: ArtboardLayout, state: Pick<AppState, 'fontWeight' | 'fontFamily' | 'lineHeight'>): number => {
    if (layout.height) return layout.height; 

    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d');
    if (!context) return layout.fontSize || 16; 

    const fontSize = layout.fontSize || 16;
    context.font = `${state.fontWeight} ${fontSize}px ${state.fontFamily}`;
    
    const words = text.split(' ');
    let line = '';
    let lineCount = 1;
    const containerWidth = layout.width || 200;

    for (let n = 0; n < words.length; n++) {
        const testLine = line + words[n] + ' ';
        const metrics = context.measureText(testLine);
        const testWidth = metrics.width;
        if (testWidth > containerWidth && n > 0) {
            lineCount++;
            line = words[n] + ' ';
        } else {
            line = testLine;
        }
    }
    return lineCount * fontSize * state.lineHeight;
};


const App: React.FC = () => {
    const [state, setState] = useState<AppState>(() => ({
        ...initialState,
        history: [{ ...initialState, history: [], historyIndex: -1 }],
        historyIndex: 0,
    }));
    const [selectedElement, setSelectedElement] = useState<SelectedElement>(null);

    const handleStateChange = useCallback((updates: Partial<AppState>, record: boolean = true) => {
        setState(prevState => {
            const nextState = { ...prevState, ...updates };
            if (record) {
                const { history, historyIndex, ...currentState } = nextState;
                const newHistory = history.slice(0, historyIndex + 1);
                newHistory.push(currentState);
                if (newHistory.length > MAX_HISTORY) {
                    newHistory.shift();
                }
                return {
                    ...nextState,
                    history: newHistory,
                    historyIndex: newHistory.length - 1,
                };
            }
            return nextState;
        });
    }, []);

    useEffect(() => {
        const img = new Image();
        img.onload = () => handleStateChange({ logoImage: img }, false);
        img.src = `data:image/svg+xml;base64,${btoa('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 40"><rect width="100" height="40" fill="#fff"/><text x="50" y="25" font-size="12" text-anchor="middle" fill="#000">LOGO</text></svg>')}`;
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const undo = useCallback(() => {
        setState(prevState => {
            if (prevState.historyIndex > 0) {
                const newHistoryIndex = prevState.historyIndex - 1;
                const previousState = prevState.history[newHistoryIndex];
                return {
                    ...prevState,
                    ...previousState,
                    historyIndex: newHistoryIndex,
                };
            }
            return prevState;
        });
    }, []);

    const redo = useCallback(() => {
        setState(prevState => {
            if (prevState.historyIndex < prevState.history.length - 1) {
                const newHistoryIndex = prevState.historyIndex + 1;
                const nextState = prevState.history[newHistoryIndex];
                return {
                    ...prevState,
                    ...nextState,
                    historyIndex: newHistoryIndex,
                };
            }
            return prevState;
        });
    }, []);
    
    const handleArtboardLayoutUpdate = useCallback((artboardId: string, elementName: ElementName, newLayout: Partial<ArtboardLayout>) => {
        setState(prevState => ({
            ...prevState,
            artboardConfigs: prevState.artboardConfigs.map(config => 
                config.id === artboardId ? { ...config, [`${elementName}Layout`]: { ...config[`${elementName}Layout`], ...newLayout } } : config
            )
        }));
    }, []);

    const handleInteractionEnd = useCallback(() => {
        setState(prevState => {
            const { history, historyIndex, ...currentState } = prevState;
            const newHistory = history.slice(0, historyIndex + 1);
            newHistory.push(currentState);
            if (newHistory.length > MAX_HISTORY) {
                newHistory.shift();
            }
            return {
                ...prevState,
                history: newHistory,
                historyIndex: newHistory.length - 1,
            };
        });
    }, []);

    const handleGlobalElementAlign = useCallback((elementName: ElementName, align: { h?: 'left' | 'center' | 'right'; v?: 'top' | 'middle' | 'bottom' }) => {
        setState(prevState => {
            const { alignAsGroup, artboardConfigs } = prevState;

            let newConfigs;

            if (alignAsGroup) {
                newConfigs = artboardConfigs.map(config => {
                    const elements: ElementName[] = ['logo', 'headline', 'subheadline', 'cta'];
                    let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity;

                    elements.forEach(elName => {
                        if (elName === 'logo' && !prevState.logoImage) return;

                        const layout = config[`${elName}Layout`];
                        const textContent = elName === 'headline' ? prevState.headline : elName === 'subheadline' ? prevState.subheadline : elName === 'cta' ? prevState.ctaText : '';
                        const height = estimateTextHeight(textContent, layout, prevState);
                        
                        minX = Math.min(minX, layout.x || 0);
                        maxX = Math.max(maxX, (layout.x || 0) + (layout.width || 0));
                        minY = Math.min(minY, layout.y || 0);
                        maxY = Math.max(maxY, (layout.y || 0) + height);
                    });

                    if (!isFinite(minX)) return config; // Skip if no elements

                    const groupWidth = maxX - minX;
                    const groupHeight = maxY - minY;

                    let offsetX = 0;
                    let offsetY = 0;

                    if (align.h === 'left') offsetX = -minX;
                    else if (align.h === 'center') offsetX = (config.width / 2) - (groupWidth / 2) - minX;
                    else if (align.h === 'right') offsetX = config.width - groupWidth - minX;
                    
                    if (align.v === 'top') offsetY = -minY;
                    else if (align.v === 'middle') offsetY = (config.height / 2) - (groupHeight / 2) - minY;
                    else if (align.v === 'bottom') offsetY = config.height - groupHeight - minY;

                    const newConfig = { ...config };
                    elements.forEach(elName => {
                        const oldLayout = newConfig[`${elName}Layout`];
                        newConfig[`${elName}Layout`] = {
                            ...oldLayout,
                            x: (oldLayout.x || 0) + offsetX,
                            y: (oldLayout.y || 0) + offsetY,
                            align: undefined,
                            vAlign: 'top',
                        };
                    });
                    return newConfig;
                });
            } else {
                 newConfigs = artboardConfigs.map(config => {
                    const newConfig = { ...config };
                    const layout: ArtboardLayout = { ...newConfig[`${elementName}Layout`] };
                    const elementWidth = layout.width || 0;
                    const textContent = elementName === 'headline' ? prevState.headline : elementName === 'subheadline' ? prevState.subheadline : elementName === 'cta' ? prevState.ctaText : '';
                    const elementHeight = estimateTextHeight(textContent, layout, prevState);
                    
                    if (align.h) {
                        layout.align = align.h;
                        layout.textAlign = align.h;
                        if (align.h === 'left') layout.x = 0;
                        else if (align.h === 'center') layout.x = (config.width / 2) - (elementWidth / 2);
                        else if (align.h === 'right') layout.x = config.width - elementWidth;
                    }
                    if (align.v) {
                        layout.vAlign = align.v;
                        if (align.v === 'top') layout.y = 0;
                        else if (align.v === 'middle') layout.y = config.height / 2;
                        else if (align.v === 'bottom') layout.y = config.height;
                    }

                    return { ...newConfig, [`${elementName}Layout`]: layout };
                });
            }
            const { history, historyIndex, ...currentState } = { ...prevState, artboardConfigs: newConfigs };
            const newHistory = history.slice(0, historyIndex + 1);
            newHistory.push(currentState);
            if (newHistory.length > MAX_HISTORY) newHistory.shift();

            return { ...prevState, artboardConfigs: newConfigs, history: newHistory, historyIndex: newHistory.length - 1 };
        });

    }, []);

     const handleTidyUp = useCallback(() => {
        setState(prevState => {
            const newConfigs = prevState.artboardConfigs.map(config => {
                const newConfig = { ...config };
                const elementsToTidy: ElementName[] = ['logo', 'headline', 'subheadline', 'cta'];
                
                const sortedElements = elementsToTidy
                    .map(name => ({ name, layout: config[`${name}Layout`] }))
                    .filter(item => {
                        if (item.name === 'logo' && !prevState.logoImage) return false;
                        return true;
                    })
                    .sort((a, b) => (a.layout.y || 0) - (b.layout.y || 0));

                if (sortedElements.length === 0) return config;

                let currentY = sortedElements[0].layout.y || 20;

                sortedElements.forEach(item => {
                    const { name, layout } = item;
                    const textContent = name === 'headline' ? prevState.headline : name === 'subheadline' ? prevState.subheadline : name === 'cta' ? prevState.ctaText : '';
                    const height = name === 'logo' ? layout.height || 0 : estimateTextHeight(textContent, layout, prevState);
                    
                    newConfig[`${name}Layout`] = {
                        ...layout,
                        y: currentY,
                        vAlign: 'top',
                    };

                    currentY += height + 10;
                });

                return newConfig;
            });
            
            const { history, historyIndex, ...currentState } = { ...prevState, artboardConfigs: newConfigs };
            const newHistory = history.slice(0, historyIndex + 1);
            newHistory.push(currentState);
            if (newHistory.length > MAX_HISTORY) newHistory.shift();

            return { ...prevState, artboardConfigs: newConfigs, history: newHistory, historyIndex: newHistory.length - 1 };
        });
    }, []);

    const handleSelectArtboard = useCallback((artboardId: string | null) => {
        handleStateChange({ selectedArtboardId: artboardId }, false);
    }, [handleStateChange]);

    const handleArtboardMove = useCallback((direction: 'up' | 'down' | 'left' | 'right') => {
        setState(prevState => {
            const { artboardConfigs, selectedArtboardId } = prevState;
            if (!selectedArtboardId) return prevState;

            const configs = [...artboardConfigs];
            const currentIndex = configs.findIndex(c => c.id === selectedArtboardId);
            if (currentIndex === -1) return prevState;

            let targetIndex = -1;

            switch (direction) {
                case 'up':
                    if (currentIndex - 3 >= 0) targetIndex = currentIndex - 3;
                    break;
                case 'down':
                    if (currentIndex + 3 < configs.length) targetIndex = currentIndex + 3;
                    break;
                case 'left':
                    if (currentIndex % 3 > 0) targetIndex = currentIndex - 1;
                    break;
                case 'right':
                    if (currentIndex % 3 < 2 && currentIndex + 1 < configs.length) targetIndex = currentIndex + 1;
                    break;
            }

            if (targetIndex !== -1) {
                [configs[currentIndex], configs[targetIndex]] = [configs[targetIndex], configs[currentIndex]];
                
                const { history, historyIndex, ...currentState } = { ...prevState, artboardConfigs: configs };
                const newHistory = history.slice(0, historyIndex + 1);
                newHistory.push(currentState);
                if (newHistory.length > MAX_HISTORY) newHistory.shift();

                return { ...prevState, artboardConfigs: configs, history: newHistory, historyIndex: newHistory.length - 1 };
            }

            return prevState;
        });
    }, []);

    const handleArtboardBackgroundPositionUpdate = useCallback((artboardId: string, position: { x: number; y: number; }) => {
       setState(prevState => ({
            ...prevState,
            artboardConfigs: prevState.artboardConfigs.map(config =>
                config.id === artboardId ? { ...config, backgroundPosition: position } : config
            )
        }));
    }, []);

    const debugInfo = useMemo(() => {
        if (!selectedElement) return { element: null, layout: null };
        const config = state.artboardConfigs.find(c => c.id === selectedElement.artboardId);
        if (!config) return { element: null, layout: null };

        const elementName = selectedElement.elementName;
        const originalLayout = config[`${elementName}Layout`];
        const layout: Partial<ArtboardLayout> = { ...originalLayout };

        // If it's a text element and height is not explicitly set, calculate it for the debug display.
        if ((elementName === 'headline' || elementName === 'subheadline' || elementName === 'cta') && typeof layout.height === 'undefined') {
            const textContent = elementName === 'headline' 
                ? state.headline 
                : elementName === 'subheadline' 
                    ? state.subheadline 
                    : state.ctaText;
            layout.height = estimateTextHeight(textContent, originalLayout, state);
        }

        return {
            element: elementName,
            layout: layout,
        };
    }, [selectedElement, state]);

    return (
        <div className="flex h-screen bg-gray-100 font-sans text-gray-800">
            <aside className="w-[350px] bg-white shadow-lg p-4 overflow-y-auto flex flex-col h-full ring-1 ring-gray-200">
                <InputControls 
                    state={state} 
                    onStateChange={handleStateChange}
                    undo={undo}
                    redo={redo}
                    canUndo={state.historyIndex > 0}
                    canRedo={state.historyIndex < state.history.length - 1}
                    onGlobalElementAlign={handleGlobalElementAlign}
                    onTidyUp={handleTidyUp}
                />
            </aside>
            <main className="flex-1 flex flex-col relative" onClick={() => { setSelectedElement(null); handleSelectArtboard(null); }}>
                <PreviewArea 
                    state={state}
                    onStateChange={handleStateChange}
                    onArtboardLayoutUpdate={handleArtboardLayoutUpdate}
                    onInteractionEnd={handleInteractionEnd}
                    selectedElement={selectedElement}
                    onElementSelect={setSelectedElement}
                    onArtboardBackgroundPositionUpdate={handleArtboardBackgroundPositionUpdate}
                    selectedArtboardId={state.selectedArtboardId}
                    onArtboardSelect={handleSelectArtboard}
                    onArtboardMove={handleArtboardMove}
                />
            </main>
            <DebugOverlay info={debugInfo} />
            <ArtboardOrderDebugger configs={state.artboardConfigs} />
        </div>
    );
};

export default App;