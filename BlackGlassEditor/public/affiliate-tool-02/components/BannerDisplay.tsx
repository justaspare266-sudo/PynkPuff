import React, { useState, useRef, useCallback, useEffect } from 'react';
import { ArtboardConfig, AppState, ArtboardLayout } from '../types';

type ElementName = 'logo' | 'headline' | 'subheadline' | 'cta';
type SelectedElement = { artboardId: string; elementName: ElementName; } | null;

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
}> = ({ 
  id, layout, artboardId, elementName, onUpdate, gridSize, snapToGrid, zoomLevel, children, onInteractionEnd,
  isSelected, onSelect, artboardWidth, artboardHeight
}) => {
  
  const [isDragging, setIsDragging] = useState(false);
  const [isResizing, setIsResizing] = useState(false);
  const [activeHandle, setActiveHandle] = useState<string | null>(null);
  const [isActive, setIsActive] = useState(false);

  const dragRef = useRef<HTMLDivElement>(null);
  const offset = useRef({ x: 0, y: 0 });
  const startPos = useRef({ x: 0, y: 0 });
  const startLayout = useRef<ArtboardLayout | null>(null);

  const isFlowingText = elementName === 'headline' || elementName === 'subheadline' || elementName === 'cta';

  const handleDragMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!dragRef.current) return;
    setIsDragging(true);
    const rect = dragRef.current.getBoundingClientRect();
    
    offset.current = {
      x: (e.clientX / zoomLevel) - (rect.left / zoomLevel),
      y: (e.clientY / zoomLevel) - (rect.top / zoomLevel),
    };
    e.stopPropagation();
  };

  const handleResizeMouseDown = (e: React.MouseEvent<HTMLDivElement>, handle: string) => {
    e.stopPropagation();
    setIsResizing(true);
    setActiveHandle(handle);
    startPos.current = { x: e.clientX / zoomLevel, y: e.clientY / zoomLevel };
    if (dragRef.current) {
        startLayout.current = { 
            ...layout,
            width: layout.width || dragRef.current.offsetWidth,
            height: layout.height || dragRef.current.offsetHeight,
        };
    } else {
        startLayout.current = { ...layout };
    }
  };

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (isDragging) {
      if (!dragRef.current) return;
      const parentRect = dragRef.current.parentElement!.getBoundingClientRect();
      
      let x = (e.clientX / zoomLevel) - (parentRect.left / zoomLevel) - offset.current.x;
      let y = (e.clientY / zoomLevel) - (parentRect.top / zoomLevel) - offset.current.y;

      // Boundary checks
      const elementWidth = dragRef.current.offsetWidth;
      const elementHeight = dragRef.current.offsetHeight;
      x = Math.max(0, Math.min(x, artboardWidth - elementWidth));
      y = Math.max(0, Math.min(y, artboardHeight - elementHeight));

      if (snapToGrid) {
        x = Math.round(x / gridSize) * gridSize;
        y = Math.round(y / gridSize) * gridSize;
      }
      
      onUpdate(artboardId, elementName, { x, y });
    } else if (isResizing && activeHandle && startLayout.current) {
        if (!dragRef.current) return;
        const newLayout: Partial<ArtboardLayout> = { ...startLayout.current };
        const W0 = startLayout.current.width || 0;
        const H0 = startLayout.current.height || 0;
        
        const currentX = e.clientX / zoomLevel;
        const currentY = e.clientY / zoomLevel;
        const dx = currentX - startPos.current.x;
        const dy = currentY - startPos.current.y;

        const isCornerHandle = activeHandle.includes('-');
        
        let newWidth: number | undefined;
        let newHeight: number | undefined;

        if (isCornerHandle) {
            const aspectRatio = W0 / H0;
            let tempWidth: number;

            if (Math.abs(dx) > Math.abs(dy)) {
                tempWidth = activeHandle.includes('left') ? W0 - dx : W0 + dx;
            } else {
                const tempHeight = activeHandle.includes('top') ? H0 - dy : H0 + dy;
                tempWidth = tempHeight * aspectRatio;
            }
            
            newWidth = Math.max(20, tempWidth);
            
            if (!isFlowingText) {
                newHeight = newWidth / aspectRatio;
                newLayout.height = newHeight;
            }

            const dw = newWidth - W0;
            const dh = (newHeight ?? H0) - H0;
            
            newLayout.width = newWidth;

            if (activeHandle.includes('top') && !isFlowingText) {
                newLayout.y = startLayout.current.y! - dh;
            }
            if (activeHandle.includes('left')) {
                newLayout.x = startLayout.current.x! - dw;
            }

            if (elementName !== 'logo') {
                const originalFontSize = startLayout.current.fontSize || 16;
                const scaleFactor = newWidth / W0;
                newLayout.fontSize = Math.max(originalFontSize * scaleFactor, 8);
            }

        } else { // Side handles
            if (activeHandle.includes('left') || activeHandle.includes('right')) {
                newWidth = activeHandle.includes('left') ? W0 - dx : W0 + dx;
                newWidth = Math.max(20, newWidth);
                newLayout.width = newWidth;
                if (activeHandle.includes('left')) {
                    newLayout.x = startLayout.current.x! + (W0 - newWidth);
                }
                if (elementName !== 'logo') {
                    const originalFontSize = startLayout.current.fontSize || 16;
                    const scaleFactor = newWidth / W0;
                    newLayout.fontSize = Math.max(originalFontSize * scaleFactor, 8);
                }
            }
            if ((activeHandle.includes('top') || activeHandle.includes('bottom')) && !isFlowingText) {
                 newHeight = activeHandle.includes('top') ? H0 - dy : H0 + dy;
                 newHeight = Math.max(20, newHeight);
                 newLayout.height = newHeight;
                 if (activeHandle.includes('top')) {
                    newLayout.y = startLayout.current.y! + (H0 - newHeight);
                }
            }
        }
        
        if (newLayout.x !== undefined && newLayout.width !== undefined) {
             if (newLayout.x < 0) {
                 if (activeHandle.includes('left')) {
                     const overflow = newLayout.x;
                     newLayout.x = 0;
                     newLayout.width! += overflow;
                 } else {
                     newLayout.x = 0;
                 }
             }
             if (newLayout.x + newLayout.width > artboardWidth) {
                newLayout.width = artboardWidth - newLayout.x;
             }
        }
       if (newLayout.y !== undefined && newLayout.height !== undefined) {
            if (newLayout.y < 0) newLayout.y = 0;
            if (newLayout.y + newLayout.height > artboardHeight) {
                newLayout.height = artboardHeight - newLayout.y;
            }
       }
        
       if (isFlowingText) {
           delete newLayout.height;
       }
       
       onUpdate(artboardId, elementName, newLayout);
    }
  }, [isDragging, isResizing, activeHandle, onUpdate, artboardId, elementName, snapToGrid, gridSize, zoomLevel, artboardWidth, artboardHeight, isFlowingText]);

  const handleMouseUp = useCallback(() => {
    if (isDragging || isResizing) {
        onInteractionEnd();
    }
    setIsDragging(false);
    setIsResizing(false);
    setActiveHandle(null);
  }, [isDragging, isResizing, onInteractionEnd]);

  useEffect(() => {
    const isInteracting = isDragging || isResizing;
    if (isInteracting) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
    } else {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    }
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging, isResizing, handleMouseMove, handleMouseUp]);
  
  const style: React.CSSProperties = {
    position: 'absolute',
    left: `${layout.x}px`,
    top: `${layout.y}px`,
    width: layout.width ? `${layout.width}px` : 'auto',
    height: isFlowingText ? 'auto' : (layout.height ? `${layout.height}px` : 'auto'),
    cursor: isDragging ? 'grabbing' : 'grab',
    textAlign: (layout.align as any) || 'left',
    transformOrigin: 'top left',
    boxSizing: 'border-box',
  };

  const allHandles = [
    { position: 'top-left', cursor: 'nwse-resize' }, { position: 'top', cursor: 'ns-resize' }, { position: 'top-right', cursor: 'nesw-resize' },
    { position: 'left', cursor: 'ew-resize' }, { position: 'right', cursor: 'ew-resize' },
    { position: 'bottom-left', cursor: 'nesw-resize' }, { position: 'bottom', cursor: 'ns-resize' }, { position: 'bottom-right', cursor: 'nwse-resize' },
  ];
  
  const cornerHandles = allHandles.filter(h => h.position.includes('-'));

  const handles = isFlowingText 
    ? allHandles.filter(h => h.position !== 'top' && h.position !== 'bottom')
    : elementName === 'logo'
      ? cornerHandles
      : allHandles;

  const getHandleStyle = (position: string): React.CSSProperties => {
    const baseStyle: React.CSSProperties = {
      position: 'absolute',
      width: '12px',
      height: '12px',
      backgroundColor: 'white',
      border: `2px solid ${isSelected ? '#7C3AED' : '#3B82F6'}`, // Purple for selected, blue for active
      borderRadius: '50%',
      transform: 'translate(-50%, -50%)',
      zIndex: 10,
    };
    if (position.includes('top')) baseStyle.top = '0px';
    if (position.includes('bottom')) baseStyle.top = '100%';
    if (position.includes('left')) baseStyle.left = '0px';
    if (position.includes('right')) baseStyle.left = '100%';
    if (!position.includes('left') && !position.includes('right')) baseStyle.left = '50%';
    if (!position.includes('top') && !position.includes('bottom')) baseStyle.top = '50%';
    return baseStyle;
  };
  
  const borderClass = isSelected 
    ? 'ring-2 ring-offset-2 ring-offset-transparent ring-purple-600' 
    : (isActive || isDragging || isResizing ? 'ring-2 ring-offset-2 ring-offset-transparent ring-blue-500' : '');

  return (
    <div
      ref={dragRef}
      id={id}
      style={style}
      onMouseDown={handleDragMouseDown}
      onClick={(e) => { e.stopPropagation(); onSelect(); }}
      onMouseEnter={() => setIsActive(true)}
      onMouseLeave={() => { if(!isResizing && !isDragging) setIsActive(false)}}
      className={`draggable-item ${borderClass}`}
    >
      {children}
      {(isActive || isResizing || isSelected) && handles.map(handle => (
        <div
            key={handle.position}
            onMouseDown={(e) => handleResizeMouseDown(e, handle.position)}
            style={{ ...getHandleStyle(handle.position), cursor: handle.cursor }}
        />
      ))}
    </div>
  );
};

const hexToRgba = (hex: string, alpha: number) => {
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
};

export const BannerDisplay: React.FC<BannerDisplayProps> = ({ 
  config, state, onArtboardLayoutUpdate, onInteractionEnd, selectedElement, onElementSelect, onArtboardBackgroundPositionUpdate
}) => {
  const { width, height, id: artboardId } = config;

  const bgRef = useRef<HTMLDivElement>(null);
  const [isBgDragging, setIsBgDragging] = useState(false);
  const bgDragStart = useRef({ x: 0, y: 0, bgX: 0, bgY: 0 });

  const handleBgMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    if (state.backgroundType !== 'image' || !state.backgroundImage) return;
    
    // Don't drag background if an element is clicked
    if ((e.target as HTMLElement).closest('.draggable-item')) {
      return;
    }

    setIsBgDragging(true);
    bgDragStart.current = {
      x: e.clientX,
      y: e.clientY,
      bgX: config.backgroundPosition?.x || 0,
      bgY: config.backgroundPosition?.y || 0,
    };
    e.stopPropagation();
  };

  const handleBgMouseMove = useCallback((e: MouseEvent) => {
    if (!isBgDragging) return;
    const dx = e.clientX - bgDragStart.current.x;
    const dy = e.clientY - bgDragStart.current.y;
    onArtboardBackgroundPositionUpdate(artboardId, {
      x: bgDragStart.current.bgX + dx / state.zoomLevel,
      y: bgDragStart.current.bgY + dy / state.zoomLevel,
    });
  }, [isBgDragging, artboardId, onArtboardBackgroundPositionUpdate, state.zoomLevel]);

  const handleBgMouseUp = useCallback(() => {
    if (isBgDragging) {
        onInteractionEnd();
    }
    setIsBgDragging(false);
  }, [isBgDragging, onInteractionEnd]);

  useEffect(() => {
    if (isBgDragging) {
      window.addEventListener('mousemove', handleBgMouseMove);
      window.addEventListener('mouseup', handleBgMouseUp);
    } else {
      window.removeEventListener('mousemove', handleBgMouseMove);
      window.removeEventListener('mouseup', handleBgMouseUp);
    }
    return () => {
      window.removeEventListener('mousemove', handleBgMouseMove);
      window.removeEventListener('mouseup', handleBgMouseUp);
    };
  }, [isBgDragging, handleBgMouseMove, handleBgMouseUp]);

  const getBackgroundStyle = (): React.CSSProperties => {
    switch(state.backgroundType) {
      case 'solid':
        return { backgroundColor: state.backgroundColor };
      case 'gradient':
        return { backgroundImage: `linear-gradient(${state.gradient.angle}deg, ${state.gradient.colors.join(', ')})` };
      case 'image':
        if (state.backgroundImage) {
            const pos = config.backgroundPosition || { x: 0, y: 0 };
            return {
                backgroundImage: `url(${state.backgroundImage.src})`,
                backgroundSize: `${state.backgroundImage.naturalWidth * state.backgroundScale}px ${state.backgroundImage.naturalHeight * state.backgroundScale}px`,
                backgroundPosition: `${pos.x}px ${pos.y}px`,
                backgroundRepeat: 'no-repeat',
                cursor: 'move'
            };
        }
        return { backgroundColor: '#ccc' }; // Fallback
      default:
        return { backgroundColor: '#FFFFFF' };
    }
  };

  const textStyle: React.CSSProperties = {
    fontFamily: state.fontFamily,
    fontWeight: state.fontWeight,
    fontStyle: state.fontStyle,
    color: state.fontColor,
    letterSpacing: `${state.letterSpacing}px`,
    lineHeight: state.lineHeight,
    backgroundColor: hexToRgba(state.textBgColor, state.textBgOpacity),
    padding: '4px 8px',
    boxSizing: 'border-box',
    whiteSpace: 'normal',
    wordBreak: 'break-word',
  };

  const ctaStyle: React.CSSProperties = {
    ...textStyle,
    backgroundColor: hexToRgba(state.ctaBgColor, state.ctaBgOpacity),
    color: state.ctaTextColor,
    padding: `8px 16px`,
    display: 'inline-block',
    whiteSpace: 'nowrap',
    border: state.ctaStrokeEnabled ? `${state.ctaStrokeWidth}px solid ${state.ctaStrokeColor}` : 'none',
    textDecoration: state.ctaUnderline ? 'underline' : 'none',
    textDecorationThickness: state.ctaUnderline ? `${state.ctaUnderlineThickness}px` : undefined,
    textUnderlineOffset: state.ctaUnderline ? `${state.ctaUnderlineOffset}px` : undefined,
  };

  return (
    <div
      ref={bgRef}
      className="banner-display shadow-lg relative overflow-hidden"
      style={{
        width: `${width}px`,
        height: `${height}px`,
        ...getBackgroundStyle(),
      }}
      onMouseDown={handleBgMouseDown}
    >
      {state.logoImage && (
        <DraggableItem
          id={`${artboardId}-logo`}
          layout={config.logoLayout}
          artboardId={artboardId}
          elementName="logo"
          onUpdate={onArtboardLayoutUpdate}
          gridSize={state.gridSize}
          snapToGrid={state.snapToGrid}
          zoomLevel={state.zoomLevel}
          onInteractionEnd={onInteractionEnd}
          isSelected={selectedElement?.artboardId === artboardId && selectedElement?.elementName === 'logo'}
          onSelect={() => onElementSelect({ artboardId, elementName: 'logo' })}
          artboardWidth={width}
          artboardHeight={height}
        >
          <img 
            src={state.logoImage.src} 
            alt="Logo" 
            style={{ width: '100%', height: '100%', objectFit: 'contain', pointerEvents: 'none' }} 
            draggable="false"
          />
        </DraggableItem>
      )}

      <DraggableItem
        id={`${artboardId}-headline`}
        layout={config.headlineLayout}
        artboardId={artboardId}
        elementName="headline"
        onUpdate={onArtboardLayoutUpdate}
        gridSize={state.gridSize}
        snapToGrid={state.snapToGrid}
        zoomLevel={state.zoomLevel}
        onInteractionEnd={onInteractionEnd}
        isSelected={selectedElement?.artboardId === artboardId && selectedElement?.elementName === 'headline'}
        onSelect={() => onElementSelect({ artboardId, elementName: 'headline' })}
        artboardWidth={width}
        artboardHeight={height}
      >
        <span style={{ ...textStyle, fontSize: `${config.headlineLayout.fontSize}px` }}>{state.headline}</span>
      </DraggableItem>

      <DraggableItem
        id={`${artboardId}-subheadline`}
        layout={config.subheadlineLayout}
        artboardId={artboardId}
        elementName="subheadline"
        onUpdate={onArtboardLayoutUpdate}
        gridSize={state.gridSize}
        snapToGrid={state.snapToGrid}
        zoomLevel={state.zoomLevel}
        onInteractionEnd={onInteractionEnd}
        isSelected={selectedElement?.artboardId === artboardId && selectedElement?.elementName === 'subheadline'}
        onSelect={() => onElementSelect({ artboardId, elementName: 'subheadline' })}
        artboardWidth={width}
        artboardHeight={height}
      >
        <span style={{ ...textStyle, fontSize: `${config.subheadlineLayout.fontSize}px` }}>{state.subheadline}</span>
      </DraggableItem>
      
      <DraggableItem
        id={`${artboardId}-cta`}
        layout={config.ctaLayout}
        artboardId={artboardId}
        elementName="cta"
        onUpdate={onArtboardLayoutUpdate}
        gridSize={state.gridSize}
        snapToGrid={state.snapToGrid}
        zoomLevel={state.zoomLevel}
        onInteractionEnd={onInteractionEnd}
        isSelected={selectedElement?.artboardId === artboardId && selectedElement?.elementName === 'cta'}
        onSelect={() => onElementSelect({ artboardId, elementName: 'cta' })}
        artboardWidth={width}
        artboardHeight={height}
      >
        <span style={{ ...ctaStyle, fontSize: `${config.ctaLayout.fontSize}px` }}>{state.ctaText}</span>
      </DraggableItem>
    </div>
  );
};