import React, { useState, useCallback, useMemo, useEffect } from 'react';
import { produce } from 'immer';
// Fix: Add .tsx and .ts extensions to resolve modules.
import { InputControls } from './components/InputControls';
import { PreviewArea } from './components/PreviewArea';
import { ARTBOARD_SIZES, LOGOS } from './constants';
import { AppState, ArtboardConfig, ElementName, ArtboardLayout, SelectedElement, LayoutTemplate, SortOrder, TextStyle } from './types';

const useHistory = <T extends object>(initialState: T) => {
    const [history, setHistory] = useState<T[]>([initialState]);
    const [index, setIndex] = useState(0);

    const setState = useCallback((action: (state: T) => void, record = true) => {
        const newState = produce(history[index], action);
        if (record) {
            const newHistory = history.slice(0, index + 1);
            newHistory.push(newState);
            setHistory(newHistory);
            setIndex(newHistory.length - 1);
        } else {
            const newHistory = [...history];
            newHistory[index] = newState;
            setHistory(newHistory);
        }
    }, [history, index]);

    const undo = () => index > 0 && setIndex(index - 1);
    const redo = () => index < history.length - 1 && setIndex(index + 1);
    
    return {
        state: history[index],
        setState,
        undo,
        redo,
        canUndo: index > 0,
        canRedo: index < history.length - 1,
    };
};

const measureTextWidth = (text: string, fontSize: number, style: TextStyle): number => {
    const canvas = document.createElement("canvas");
    const context = canvas.getContext("2d");
    if (!context) return 0;
    const font = `${style.fontStyle} ${style.fontWeight} ${fontSize}px ${style.fontFamily}`;
    context.font = font;
    // Add a small buffer for rendering differences
    return context.measureText(text).width + 2;
};

const generateInitialArtboards = (initialState: AppState): ArtboardConfig[] => {
    return ARTBOARD_SIZES.map((size, i) => {
        const id = `${size.w}x${size.h}-${i}`;
        
        const headlineW = measureTextWidth(initialState.headline, size.hlFs, initialState.headlineStyle);
        const subheadlineW = measureTextWidth(initialState.subheadline, size.shlFs, initialState.subheadlineStyle);
        const ctaW = measureTextWidth(initialState.ctaText, size.ctaFs, initialState.ctaStyle);

        const constrainedHeadlineW = Math.min(headlineW, size.w * 0.95);
        const constrainedSubheadlineW = Math.min(subheadlineW, size.w * 0.9);
        const constrainedCtaW = Math.min(ctaW, size.w * 0.9);
        
        const logoW = Math.min(100, size.w * 0.2);
        const logoH = 30;
        const centerAlignX = (elementWidth: number) => (size.w / 2) - (elementWidth / 2);

        return {
            id,
            width: size.w,
            height: size.h,
            headlineLayout: { x: centerAlignX(constrainedHeadlineW), y: size.hlY, width: constrainedHeadlineW, height: 50, fontSize: size.hlFs, textAlign: 'center' },
            subheadlineLayout: { x: centerAlignX(constrainedSubheadlineW), y: size.shlY, width: constrainedSubheadlineW, height: 40, fontSize: size.shlFs, textAlign: 'center' },
            ctaLayout: { x: centerAlignX(constrainedCtaW), y: size.ctaY, width: constrainedCtaW, height: 30, fontSize: size.ctaFs, textAlign: 'center' },
            logoLayout: { x: centerAlignX(logoW), y: size.logoY, width: logoW, height: logoH },
            backgroundPosition: { x: 0, y: 0 },
            isComplete: false,
        };
    });
};


const createInitialState = (): AppState => {
    const state: AppState = {
        headline: "Dynamic Headline Here",
        subheadline: "Compelling subheadline to grab attention.",
        ctaText: "Click Here",
        logoImage: null,
        logoAspectRatio: null,
        backgroundImage: null,
        backgroundColor: '#ffffff',
        backgroundType: 'solid',
        gradient: { angle: 90, colors: ['#6EE7B7', '#3B82F6'] },
        backgroundScale: 1,
        fontSizeAdjustment: 0,
        headlineStyle: { fontFamily: 'Arial', fontWeight: 700, fontStyle: 'normal', letterSpacing: 0, lineHeight: 1.2, fontColor: '#000000', textTransform: 'none', textDecoration: 'none', textBgColor: '#FFFFFF', textBgOpacity: 0, overflowBehavior: 'wrap' },
        subheadlineStyle: { fontFamily: 'Arial', fontWeight: 400, fontStyle: 'normal', letterSpacing: 0, lineHeight: 1.4, fontColor: '#333333', textTransform: 'none', textDecoration: 'none', textBgColor: '#FFFFFF', textBgOpacity: 0, overflowBehavior: 'wrap' },
        ctaStyle: { fontFamily: 'Arial', fontWeight: 700, fontStyle: 'normal', letterSpacing: 0.5, lineHeight: 1, fontColor: '#FFFFFF', textTransform: 'uppercase', textDecoration: 'none', textBgColor: '#111111', textBgOpacity: 1, overflowBehavior: 'wrap' },
        ctaStrokeEnabled: false,
        ctaStrokeWidth: 2,
        ctaStrokeColor: '#000000',
        ctaUnderlineThickness: 2,
        ctaUnderlineOffset: 3,
        snapToGrid: true,
        gridSize: 10,
        zoomLevel: 1.0,
        artboardConfigs: [],
        alignAsGroup: false,
        sortOrder: 'default',
    };
    
    state.artboardConfigs = generateInitialArtboards(state);
    return state;
};

function App() {
    const { state, setState, undo, redo, canUndo, canRedo } = useHistory(createInitialState());
    const [selectedElement, setSelectedElement] = useState<SelectedElement>(null);
    const [savedTemplates, setSavedTemplates] = useState<LayoutTemplate[]>([]);
    
    const handleStateChange = useCallback((updates: Partial<AppState>, recordHistory = true) => {
        setState(draft => {
            Object.assign(draft, updates);
        }, recordHistory);
    }, [setState]);

    useEffect(() => {
        const templates = localStorage.getItem('bannerLayoutTemplates');
        if (templates) {
            setSavedTemplates(JSON.parse(templates));
        }
        
        const logoImg = new Image();
        logoImg.onload = () => {
            const aspectRatio = logoImg.naturalWidth / logoImg.naturalHeight;
            handleStateChange({ logoImage: logoImg, logoAspectRatio: aspectRatio }, false);
        };
        const svgString = LOGOS.white;
        const svgBlob = new Blob([svgString], { type: 'image/svg+xml;charset=utf-8' });
        logoImg.src = URL.createObjectURL(svgBlob);
    }, []);

    const handleArtboardLayoutUpdate = useCallback((artboardId: string, elementName: ElementName, newLayout: Partial<ArtboardLayout>) => {
        setState(draft => {
            const config = draft.artboardConfigs.find(c => c.id === artboardId);
            if (config) {
                const layoutKey = `${elementName}Layout` as const;
                Object.assign(config[layoutKey], newLayout);
            }
        }, false);
    }, [setState]);

    const handleInteractionEnd = useCallback(() => {
        setState(draft => {}, true);
    }, [setState]);

    const handleArtboardBackgroundPositionUpdate = useCallback((artboardId: string, position: { x: number; y: number; }) => {
        setState(draft => {
            const config = draft.artboardConfigs.find(c => c.id === artboardId);
            if(config) {
                config.backgroundPosition = position;
            }
        }, false);
    }, [setState]);

    const handleGlobalElementAlign = (elementName: ElementName, align: { h?: 'left' | 'center' | 'right'; v?: 'top' | 'middle' | 'bottom' }) => {
        setState(draft => {
            const layoutKey = `${elementName}Layout` as const;
            
            const groupBounds = state.alignAsGroup ? draft.artboardConfigs.reduce((acc, config) => {
                const layout = config[layoutKey];
                acc.minX = Math.min(acc.minX, layout.x);
                acc.minY = Math.min(acc.minY, layout.y);
                acc.maxX = Math.max(acc.maxX, layout.x + layout.width);
                acc.maxY = Math.max(acc.maxY, layout.y + layout.height);
                return acc;
            }, {minX: Infinity, minY: Infinity, maxX: -Infinity, maxY: -Infinity}) : null;
            
            if (groupBounds && groupBounds.minX !== Infinity) {
                 const groupWidth = groupBounds.maxX - groupBounds.minX;
                 const groupHeight = groupBounds.maxY - groupBounds.minY;

                 draft.artboardConfigs.forEach(config => {
                    const elLayout = config[layoutKey];
                    const relativeX = elLayout.x - groupBounds.minX;
                    const relativeY = elLayout.y - groupBounds.minY;

                    if (align.h) {
                        if (align.h === 'left') elLayout.x = relativeX;
                        if (align.h === 'center') elLayout.x = (config.width / 2) - (groupWidth / 2) + relativeX;
                        if (align.h === 'right') elLayout.x = config.width - groupWidth + relativeX;
                    }
                     if (align.v) {
                        if (align.v === 'top') elLayout.y = relativeY;
                        if (align.v === 'middle') elLayout.y = (config.height / 2) - (groupHeight / 2) + relativeY;
                        if (align.v === 'bottom') elLayout.y = config.height - groupHeight + relativeY;
                    }
                });
            } else {
                draft.artboardConfigs.forEach(config => {
                    const elLayout = config[layoutKey];
                    if (align.h) {
                        if (align.h === 'left') elLayout.x = 0;
                        if (align.h === 'center') elLayout.x = (config.width - elLayout.width) / 2;
                        if (align.h === 'right') elLayout.x = config.width - elLayout.width;
                    }
                    if (align.v) {
                        if (align.v === 'top') elLayout.y = 0;
                        if (align.v === 'middle') elLayout.y = (config.height - elLayout.height) / 2;
                        if (align.v === 'bottom') elLayout.y = config.height - elLayout.height;
                    }
                });
            }
        });
    };
    
    const handleTidyUp = () => {
        setState(draft => {
             draft.artboardConfigs.forEach(config => {
                 const elements = (['logo', 'headline', 'subheadline', 'cta'] as ElementName[])
                     .map(name => ({ name, layout: config[`${name}Layout` as const] }))
                     .filter(el => (draft.logoImage && el.name === 'logo') || el.name !== 'logo')
                     .sort((a, b) => a.layout.y - b.layout.y);

                 if (elements.length < 2) return;
                 
                 const totalHeight = elements.reduce((sum, el) => sum + el.layout.height, 0);
                 const firstEl = elements[0];
                 const lastEl = elements[elements.length - 1];
                 const totalGaps = firstEl.layout.y + (config.height - (lastEl.layout.y + lastEl.layout.height));
                 const availableSpace = config.height - totalHeight - totalGaps;
                 const gap = availableSpace / (elements.length -1);

                 let currentY = firstEl.layout.y + firstEl.layout.height;

                 for(let i=1; i < elements.length; i++) {
                     elements[i].layout.y = currentY + gap;
                     currentY = elements[i].layout.y + elements[i].layout.height;
                 }
            });
        });
    };
    
    const handleFontUpload = (fontFamily: string) => {
        // Apply font to all text elements for simplicity
        setState(draft => {
            draft.headlineStyle.fontFamily = fontFamily;
            draft.subheadlineStyle.fontFamily = fontFamily;
            draft.ctaStyle.fontFamily = fontFamily;
        });
    };

    const handleSaveLayout = (name: string) => {
        const newTemplate: LayoutTemplate = { name, configs: state.artboardConfigs };
        const newTemplates = produce(savedTemplates, draft => {
            const existingIndex = draft.findIndex(t => t.name === name);
            if (existingIndex > -1) {
                draft[existingIndex] = newTemplate;
            } else {
                draft.push(newTemplate);
            }
        });
        setSavedTemplates(newTemplates);
        localStorage.setItem('bannerLayoutTemplates', JSON.stringify(newTemplates));
    };

    const handleApplyLayout = (name: string) => {
        const template = savedTemplates.find(t => t.name === name);
        if (template) {
            handleStateChange({ artboardConfigs: template.configs });
        }
    };

    const handleDeleteLayout = (name: string) => {
        const newTemplates = savedTemplates.filter(t => t.name !== name);
        setSavedTemplates(newTemplates);
        localStorage.setItem('bannerLayoutTemplates', JSON.stringify(newTemplates));
    };

    const handleUploadLayout = (template: LayoutTemplate) => {
        handleSaveLayout(template.name);
    };

    const handleArtboardCompleteToggle = (artboardId: string, isComplete: boolean) => {
        setState(draft => {
            const config = draft.artboardConfigs.find(c => c.id === artboardId);
            if (config) {
                config.isComplete = isComplete;
            }
        });
    };
    
    const sortedArtboardConfigs = useMemo(() => {
        const sorted = [...state.artboardConfigs];
        switch (state.sortOrder) {
            case 'width-asc': return sorted.sort((a, b) => a.width - b.width);
            case 'width-desc': return sorted.sort((a, b) => b.width - a.width);
            case 'height-asc': return sorted.sort((a, b) => a.height - b.height);
            case 'height-desc': return sorted.sort((a, b) => b.height - a.height);
            case 'area-asc': return sorted.sort((a, b) => (a.width * a.height) - (b.width * b.height));
            case 'area-desc': return sorted.sort((a, b) => (b.width * b.height) - (a.width * a.height));
            case 'default':
            default:
                // Return a stable copy for default order
                return state.artboardConfigs;
        }
    }, [state.artboardConfigs, state.sortOrder]);

    const handleArtboardMove = (artboardId: string, direction: 'up' | 'down' | 'left' | 'right') => {
        setState(draft => {
            const index = draft.artboardConfigs.findIndex(c => c.id === artboardId);
            if (index === -1) return;

            let swapIndex = -1;
            if (direction === 'left' && index > 0) swapIndex = index - 1;
            if (direction === 'right' && index < draft.artboardConfigs.length - 1) swapIndex = index + 1;
            if (direction === 'up' && index >= 3) swapIndex = index - 3;
            if (direction === 'down' && index < draft.artboardConfigs.length - 3) swapIndex = index + 3;

            if (swapIndex > -1 && swapIndex < draft.artboardConfigs.length) {
                [draft.artboardConfigs[index], draft.artboardConfigs[swapIndex]] = [draft.artboardConfigs[swapIndex], draft.artboardConfigs[index]];
                draft.sortOrder = 'default';
            }
        });
    };

    return (
        <div className="flex h-screen bg-white font-sans">
            <aside className="w-[380px] bg-white border-r border-gray-200 p-4 flex flex-col">
                 <div className="overflow-y-auto">
                    <InputControls 
                        state={state}
                        onStateChange={handleStateChange}
                        undo={undo}
                        redo={redo}
                        canUndo={canUndo}
                        canRedo={canRedo}
                        onGlobalElementAlign={handleGlobalElementAlign}
                        onTidyUp={handleTidyUp}
                        onFontUpload={handleFontUpload}
                        savedTemplates={savedTemplates}
                        onSaveLayout={handleSaveLayout}
                        onApplyLayout={handleApplyLayout}
                        onDeleteLayout={handleDeleteLayout}
                        onUploadLayout={handleUploadLayout}
                        onArtboardCompleteToggle={handleArtboardCompleteToggle}
                    />
                </div>
            </aside>
            <main className="flex-1 flex flex-col overflow-hidden">
                <div className="flex-grow overflow-y-auto">
                    <PreviewArea 
                        artboardConfigs={sortedArtboardConfigs}
                        appState={state}
                        onArtboardLayoutUpdate={handleArtboardLayoutUpdate}
                        onArtboardBackgroundPositionUpdate={handleArtboardBackgroundPositionUpdate}
                        onInteractionEnd={handleInteractionEnd}
                        selectedElement={selectedElement}
                        onElementSelect={setSelectedElement}
                        onArtboardMove={handleArtboardMove}
                        onStateChange={handleStateChange}
                    />
                </div>
            </main>
        </div>
    );
}

export default App;