import React, { useState, useRef, useCallback, useEffect, useLayoutEffect } from 'react';
// Fix: Add .ts extension to resolve module path.
import { ArtboardConfig, AppState, ArtboardLayout, ElementName, SelectedElement } from '../types.ts';

interface BannerDisplayProps {
  config: ArtboardConfig;
  state: AppState;
  onArtboardLayoutUpdate: (artboardId: string, elementName: ElementName, newLayout: Partial<ArtboardLayout>) => void;
  onArtboardBackgroundPositionUpdate: (artboardId: string, position: { x: number; y: number; }) => void;
  onInteractionEnd: () => void;
  selectedElement: SelectedElement;
  onElementSelect: (selection: SelectedElement) => void;
}

const DraggableItem: React.FC<{
  id: string,
  layout: ArtboardLayout,
  artboardId: string,
  elementName: ElementName,
  onUpdate: (artboardId: string, elementName: ElementName, newLayout: Partial<ArtboardLayout>) => void,
  gridSize: number,
  snapToGrid: boolean,
  zoomLevel: number,
  children: React.ReactNode,
  onInteractionEnd: () => void;
  isSelected: boolean;
  onSelect: () => void;
  artboardWidth: number;
  artboardHeight: number;
  logoAspectRatio: number | null;
}> = ({ 
  id, layout, artboardId, elementName, onUpdate, gridSize, snapToGrid, zoomLevel, children, onInteractionEnd,
  isSelected, onSelect, artboardWidth, artboardHeight, logoAspectRatio
}) => {
  
  const [interactionType, setInteractionType] = useState<'drag' | 'resize' | null>(null);
  const [activeHandle, setActiveHandle] = useState<string | null>(null);

  const dragRef = useRef<HTMLDivElement>(null);
  
  // Store initial state on mouse down
  const interactionStart = useRef<{
    mouseX: number;
    mouseY: number;
    layout: ArtboardLayout;
  } | null>(null);

  const isFlowingText = elementName === 'headline' || elementName === 'subheadline' || elementName === 'cta';
  const isLogo = elementName === 'logo';

  useLayoutEffect(() => {
    if (isFlowingText && dragRef.current) {
        const { offsetWidth, offsetHeight } = dragRef.current;
        // Measure dimensions in screen pixels and scale them back
        const measuredWidth = offsetWidth / zoomLevel;
        const measuredHeight = offsetHeight / zoomLevel;

        const widthDiff = Math.abs(measuredWidth - (layout.width || 0));
        const heightDiff = Math.abs(measuredHeight - (layout.height || 0));

        if (widthDiff > 1 || heightDiff > 1) {
            onUpdate(artboardId, elementName, { width: measuredWidth, height: measuredHeight });
        }
    }
  }, [children, layout.width, zoomLevel, isFlowingText, onUpdate, artboardId, elementName, layout.height]);


  const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>, type: 'drag' | 'resize', handle?: string) => {
    e.stopPropagation();
    setInteractionType(type);
    if (handle) {
      setActiveHandle(handle);
    }

    interactionStart.current = {
      mouseX: e.clientX,
      mouseY: e.clientY,
      layout: { ...layout },
    };
  };

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (!interactionStart.current) return;
    
    // 1. Calculate delta in pure viewport coordinates
    const deltaX = e.clientX - interactionStart.current.mouseX;
    const deltaY = e.clientY - interactionStart.current.mouseY;

    // 2. Scale delta to artboard coordinates
    const scaledDeltaX = deltaX / zoomLevel;
    const scaledDeltaY = deltaY / zoomLevel;

    const initialLayout = interactionStart.current.layout;
    let { x, y, width, height } = initialLayout;

    if (interactionType === 'drag') {
      x = initialLayout.x + scaledDeltaX;
      y = initialLayout.y + scaledDeltaY;

      // Constrain position during drag
      x = Math.max(0, Math.min(x, artboardWidth - width));
      y = Math.max(0, Math.min(y, artboardHeight - height));

      if (snapToGrid) {
          x = Math.round(x / gridSize) * gridSize;
          y = Math.round(y / gridSize) * gridSize;
      }
      onUpdate(artboardId, elementName, { x, y, align: undefined, vAlign: 'top' });

    } else if (interactionType === 'resize' && activeHandle) {
        if (activeHandle.includes('r')) width = initialLayout.width + scaledDeltaX;
        if (activeHandle.includes('l')) {
            width = initialLayout.width - scaledDeltaX;
            x = initialLayout.x + scaledDeltaX;
        }
        if (activeHandle.includes('b')) height = initialLayout.height + scaledDeltaY;
        if (activeHandle.includes('t')) {
            height = initialLayout.height - scaledDeltaY;
            y = initialLayout.y + scaledDeltaY;
        }
        
        if (isLogo && logoAspectRatio) {
            const W0 = initialLayout.width;
            const H0 = initialLayout.height;
            if (width !== W0) { // Width changed
                height = width / logoAspectRatio;
            } else if (height !== H0) { // Height changed
                width = height * logoAspectRatio;
            }
            if (activeHandle.includes('t')) y = initialLayout.y + (H0 - height);
            if (activeHandle.includes('l')) x = initialLayout.x + (W0 - width);
        }

        // --- Start of robust boundary enforcement ---
        const minSize = snapToGrid ? gridSize : 10;
        
        // Enforce minimum size
        if (width < minSize) {
            if (activeHandle.includes('l')) x += width - minSize;
            width = minSize;
        }
        if (height < minSize) {
            if (activeHandle.includes('t')) y += height - minSize;
            height = minSize;
        }

        // Enforce right/bottom boundaries
        if (x + width > artboardWidth) width = artboardWidth - x;
        if (y + height > artboardHeight) height = artboardHeight - y;
        
        // Enforce left/top boundaries
        if (x < 0) {
            width += x; // x is negative, so this shrinks width
            x = 0;
        }
        if (y < 0) {
            height += y; // y is negative, so this shrinks height
            y = 0;
        }
        // --- End of robust boundary enforcement ---

        if (snapToGrid) {
            const snap = (val: number) => Math.round(val / gridSize) * gridSize;
            x = snap(x);
            y = snap(y);
            width = snap(width);
            height = snap(height);
        }

        const newLayout: Partial<ArtboardLayout> = { x, y, width };
        if (!isFlowingText) {
          newLayout.height = height;
        }
        
        onUpdate(artboardId, elementName, newLayout);
    }
  }, [interactionType, activeHandle, zoomLevel, artboardWidth, artboardHeight, snapToGrid, gridSize, onUpdate, artboardId, elementName, isLogo, logoAspectRatio, isFlowingText]);

  const handleMouseUp = useCallback(() => {
    if (interactionType) {
        onInteractionEnd();
    }
    setInteractionType(null);
    setActiveHandle(null);
    interactionStart.current = null;
  }, [interactionType, onInteractionEnd]);

  useEffect(() => {
    if (interactionType) {
      document.body.style.userSelect = 'none';
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp, { once: true });
      return () => {
        document.body.style.userSelect = '';
        window.removeEventListener('mousemove', handleMouseMove);
        window.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [interactionType, handleMouseMove, handleMouseUp]);
  
  const handleClick = (e: React.MouseEvent) => {
      e.stopPropagation();
      onSelect();
  };

  const itemStyle: React.CSSProperties = {
    position: 'absolute',
    left: `${layout.x}px`,
    top: `${layout.y}px`,
    width: `${layout.width}px`,
    height: isFlowingText ? 'auto' : `${layout.height}px`,
    cursor: interactionType === 'drag' ? 'grabbing' : 'grab',
    zIndex: isSelected ? 10 : 1,
    // Final safeguard, but logic should prevent overflow
    overflow: 'hidden',
  };
  
  const handles = isFlowingText ? ['l', 'r'] : ['tl', 't', 'tr', 'r', 'br', 'b', 'bl', 'l'];

  const handleSize = 8;
  const handleStyle: React.CSSProperties = {
      position: 'absolute',
      width: `${handleSize}px`,
      height: `${handleSize}px`,
      border: '1px solid #FFFFFF',
      backgroundColor: '#4F46E5',
      borderRadius: '0%',
      transform: 'translate(-50%, -50%)',
      zIndex: 11,
  };

  const getHandlePosition = (handle: string) => {
    const s = { ...handleStyle };
    if (handle.includes('t')) s.top = '0px';
    if (handle.includes('b')) s.top = '100%';
    if (handle.includes('l')) s.left = '0px';
    if (handle.includes('r')) s.left = '100%';
    if (handle === 't' || handle === 'b') s.left = '50%';
    if (handle === 'l' || handle === 'r') s.top = '50%';
    if (handle.includes('r')) s.cursor = 'ew-resize';
    if (handle.includes('l')) s.cursor = 'ew-resize';
    if (handle.includes('t')) s.cursor = 'ns-resize';
    if (handle.includes('b')) s.cursor = 'ns-resize';
    if (handle === 'tl' || handle === 'br') s.cursor = 'nwse-resize';
    if (handle === 'tr' || handle === 'bl') s.cursor = 'nesw-resize';
    return s;
  };

  return (
    <div
      ref={dragRef}
      id={id}
      style={itemStyle}
      onMouseDown={(e) => handleMouseDown(e, 'drag')}
      onClick={handleClick}
    >
        {children}
        {isSelected && (
            <>
                <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, border: '2px solid #4F46E5', pointerEvents: 'none', boxSizing: 'border-box' }}></div>
                {handles.map(h => (
                    <div
                        key={h}
                        style={getHandlePosition(h)}
                        onMouseDown={(e) => handleMouseDown(e, 'resize', h)}
                    />
                ))}
            </>
        )}
    </div>
  );
};

const hexToRgb = (hex: string): string => {
    let result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? `${parseInt(result[1], 16)}, ${parseInt(result[2], 16)}, ${parseInt(result[3], 16)}` : '0,0,0';
};

export const BannerDisplay: React.FC<BannerDisplayProps> = ({ 
  config, 
  state, 
  onArtboardLayoutUpdate, 
  onInteractionEnd, 
  selectedElement, 
  onElementSelect,
  onArtboardBackgroundPositionUpdate
}) => {
    const bgRef = useRef<HTMLDivElement>(null);
    const [isBgDragging, setIsBgDragging] = useState(false);
    const bgDragStart = useRef({ x: 0, y: 0, bgX: 0, bgY: 0 });

    const handleBgMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
        if (state.backgroundType !== 'image' || !state.backgroundImage) return;
        e.preventDefault();
        setIsBgDragging(true);
        bgDragStart.current = {
            x: e.clientX,
            y: e.clientY,
            bgX: config.backgroundPosition.x,
            bgY: config.backgroundPosition.y,
        };
    };

    const handleBgMouseMove = useCallback((e: MouseEvent) => {
        if (!isBgDragging || !bgRef.current) return;
        const dx = e.clientX - bgDragStart.current.x;
        const dy = e.clientY - bgDragStart.current.y;

        const newX = bgDragStart.current.bgX + (dx / state.zoomLevel);
        const newY = bgDragStart.current.bgY + (dy / state.zoomLevel);

        onArtboardBackgroundPositionUpdate(config.id, { x: newX, y: newY });

    }, [isBgDragging, state.zoomLevel, onArtboardBackgroundPositionUpdate, config.id]);

    const handleBgMouseUp = useCallback(() => {
        if (isBgDragging) {
            onInteractionEnd();
        }
        setIsBgDragging(false);
    }, [isBgDragging, onInteractionEnd]);

     useEffect(() => {
        if (isBgDragging) {
            document.body.style.userSelect = 'none';
            window.addEventListener('mousemove', handleBgMouseMove);
            window.addEventListener('mouseup', handleBgMouseUp);
        }
        return () => {
            document.body.style.userSelect = '';
            window.removeEventListener('mousemove', handleBgMouseMove);
            window.removeEventListener('mouseup', handleBgMouseUp);
        };
    }, [isBgDragging, handleBgMouseMove, handleBgMouseUp]);
    
    let backgroundStyle: React.CSSProperties = {};
    if (state.backgroundType === 'solid') {
        backgroundStyle.backgroundColor = state.backgroundColor;
    } else if (state.backgroundType === 'gradient') {
        backgroundStyle.background = `linear-gradient(${state.gradient.angle}deg, ${state.gradient.colors.join(', ')})`;
    } else if (state.backgroundType === 'image' && state.backgroundImage) {
        backgroundStyle.backgroundImage = `url(${state.backgroundImage.src})`;
        backgroundStyle.backgroundSize = `${state.backgroundImage.width * state.backgroundScale}px ${state.backgroundImage.height * state.backgroundScale}px`;
        backgroundStyle.backgroundPosition = `${config.backgroundPosition.x}px ${config.backgroundPosition.y}px`;
        backgroundStyle.backgroundRepeat = 'no-repeat';
        backgroundStyle.cursor = isBgDragging ? 'grabbing' : 'grab';
    }
    
    const baseTextStyle = (style: typeof state.headlineStyle, layout: ArtboardLayout): React.CSSProperties => {
        const base: React.CSSProperties = {
            fontFamily: style.fontFamily,
            fontWeight: style.fontWeight,
            fontStyle: style.fontStyle,
            letterSpacing: `${style.letterSpacing}px`,
            lineHeight: style.lineHeight,
            color: style.fontColor,
            textTransform: style.textTransform,
            textDecoration: style.textDecoration,
            textDecorationThickness: style.textDecoration === 'underline' ? `${state.ctaUnderlineThickness}px` : undefined,
            textUnderlineOffset: style.textDecoration === 'underline' ? `${state.ctaUnderlineOffset}px` : undefined,
            backgroundColor: `rgba(${hexToRgb(style.textBgColor)}, ${style.textBgOpacity})`,
            boxSizing: 'border-box',
            display: 'flex',
            alignItems: 'center',
            justifyContent: layout.textAlign === 'center' ? 'center' : layout.textAlign === 'right' ? 'flex-end' : 'flex-start',
            textAlign: layout.textAlign || 'left',
            overflow: 'hidden',
        };

        if (style.overflowBehavior === 'ellipsis') {
            base.whiteSpace = 'nowrap';
            base.textOverflow = 'ellipsis';
        } else {
            base.whiteSpace = 'normal';
            base.overflowWrap = 'break-word';
            base.wordBreak = 'break-word';
        }

        return base;
    };

    const headlineStyle: React.CSSProperties = {
        ...baseTextStyle(state.headlineStyle, config.headlineLayout),
        fontSize: `${(config.headlineLayout.fontSize || 20) + state.fontSizeAdjustment}px`,
    };

    const subheadlineStyle: React.CSSProperties = {
        ...baseTextStyle(state.subheadlineStyle, config.subheadlineLayout),
        fontSize: `${(config.subheadlineLayout.fontSize || 12) + state.fontSizeAdjustment}px`,
    };
    
    const finalCtaStyle: React.CSSProperties = {
        ...baseTextStyle(state.ctaStyle, config.ctaLayout),
        fontSize: `${(config.ctaLayout.fontSize || 12) + state.fontSizeAdjustment}px`,
        border: state.ctaStrokeEnabled ? `${state.ctaStrokeWidth}px solid ${state.ctaStrokeColor}` : 'none',
        borderRadius: 0,
    };

    const logoStyle: React.CSSProperties = {
        width: '100%',
        height: '100%',
        objectFit: 'contain',
    };

    const gridPattern = state.snapToGrid ? `
      linear-gradient(rgba(0,0,0,0.1) 1px, transparent 1px),
      linear-gradient(90deg, rgba(0,0,0,0.1) 1px, transparent 1px)
    ` : undefined;

    return (
        <div 
          style={{ 
            width: config.width, 
            height: config.height, 
            position: 'relative', 
            overflow: 'hidden',
            ...backgroundStyle,
            backgroundImage: gridPattern ? `${gridPattern}, ${backgroundStyle.backgroundImage || ''}` : backgroundStyle.backgroundImage,
            backgroundSize: gridPattern ? `${state.gridSize}px ${state.gridSize}px, ${backgroundStyle.backgroundSize || 'auto'}` : backgroundStyle.backgroundSize,
          }}
          ref={bgRef}
          onMouseDown={handleBgMouseDown}
        >
          {state.logoImage && (
             <DraggableItem
                id={`${config.id}-logo`}
                layout={config.logoLayout}
                artboardId={config.id}
                elementName="logo"
                onUpdate={onArtboardLayoutUpdate}
                gridSize={state.gridSize}
                snapToGrid={state.snapToGrid}
                zoomLevel={state.zoomLevel}
                onInteractionEnd={onInteractionEnd}
                isSelected={selectedElement?.artboardId === config.id && selectedElement.elementName === 'logo'}
                onSelect={() => onElementSelect({ artboardId: config.id, elementName: 'logo' })}
                artboardWidth={config.width}
                artboardHeight={config.height}
                logoAspectRatio={state.logoAspectRatio}
            >
                <img src={state.logoImage.src} alt="Logo" style={logoStyle} draggable="false" />
            </DraggableItem>
          )}

            <DraggableItem
                id={`${config.id}-headline`}
                layout={config.headlineLayout}
                artboardId={config.id}
                elementName="headline"
                onUpdate={onArtboardLayoutUpdate}
                gridSize={state.gridSize}
                snapToGrid={state.snapToGrid}
                zoomLevel={state.zoomLevel}
                onInteractionEnd={onInteractionEnd}
                isSelected={selectedElement?.artboardId === config.id && selectedElement.elementName === 'headline'}
                onSelect={() => onElementSelect({ artboardId: config.id, elementName: 'headline' })}
                artboardWidth={config.width}
                artboardHeight={config.height}
                logoAspectRatio={null}
            >
                <div style={headlineStyle}>{state.headline}</div>
            </DraggableItem>

            <DraggableItem
                id={`${config.id}-subheadline`}
                layout={config.subheadlineLayout}
                artboardId={config.id}
                elementName="subheadline"
                onUpdate={onArtboardLayoutUpdate}
                gridSize={state.gridSize}
                snapToGrid={state.snapToGrid}
                zoomLevel={state.zoomLevel}
                onInteractionEnd={onInteractionEnd}
                isSelected={selectedElement?.artboardId === config.id && selectedElement.elementName === 'subheadline'}
                onSelect={() => onElementSelect({ artboardId: config.id, elementName: 'subheadline' })}
                artboardWidth={config.width}
                artboardHeight={config.height}
                logoAspectRatio={null}
            >
                <div style={subheadlineStyle}>{state.subheadline}</div>
            </DraggableItem>

            <DraggableItem
                id={`${config.id}-cta`}
                layout={config.ctaLayout}
                artboardId={config.id}
                elementName="cta"
                onUpdate={onArtboardLayoutUpdate}
                gridSize={state.gridSize}
                snapToGrid={state.snapToGrid}
                zoomLevel={state.zoomLevel}
                onInteractionEnd={onInteractionEnd}
                isSelected={selectedElement?.artboardId === config.id && selectedElement.elementName === 'cta'}
                onSelect={() => onElementSelect({ artboardId: config.id, elementName: 'cta' })}
                artboardWidth={config.width}
                artboardHeight={config.height}
                logoAspectRatio={null}
            >
                <div style={finalCtaStyle}>{state.ctaText}</div>
            </DraggableItem>
        </div>
    );
};