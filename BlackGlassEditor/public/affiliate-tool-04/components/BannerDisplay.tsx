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
            
            if (isFlowingText) {
                delete newLayout.height;
            } else {
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
        
        // Boundary constraints
        if (newLayout.x !== undefined && newLayout.width !== undefined) {
             if (newLayout.x < 0) newLayout.x = 0;
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
  
  const handles = isFlowingText 
    ? allHandles.filter(h => h.position !== 'top' && h.position !== 'bottom')
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
      className={`draggable-item ${borderClass} rounded-md`}
    >
      {children}
      {(isActive || isResizing || isSelected) && handles.map(handle => (
        <div
            key={handle.position}
            onMouseDown={(e) => handleResizeMouseDown(e, handle.position)}
            style={{...getHandleStyle(handle.position), cursor: handle.cursor}}
            className="resize-handle"
        />
      ))}
    </div>
  );
};


export const BannerDisplay: React.FC<BannerDisplayProps> = ({ config, state, onArtboardLayoutUpdate, onInteractionEnd, selectedElement, onElementSelect, onArtboardBackgroundPositionUpdate }) => {
  const { width, height, id } = config;
  const [isDraggingBg, setIsDraggingBg] = useState(false);
  const dragStartPos = useRef({ x: 0, y: 0 });
  const initialBgPos = useRef({ x: 0, y: 0 });

  const getBackgroundStyle = (): React.CSSProperties => {
    switch (state.backgroundType) {
      case 'solid':
        return { backgroundColor: state.backgroundColor };
      case 'image':
        if (!state.backgroundImage) {
          return { backgroundImage: 'none' };
        }
        const backgroundWidth = state.backgroundImage.naturalWidth * state.backgroundScale;
        const backgroundHeight = state.backgroundImage.naturalHeight * state.backgroundScale;
        return {
          backgroundImage: `url(${state.backgroundImage.src})`,
          backgroundSize: `${backgroundWidth}px ${backgroundHeight}px`,
          backgroundPosition: `${config.backgroundPosition?.x || 0}px ${config.backgroundPosition?.y || 0}px`,
          backgroundRepeat: 'no-repeat',
          cursor: isDraggingBg ? 'grabbing' : (state.backgroundImage ? 'grab' : 'default'),
        };
      case 'gradient':
        return {
          background: `linear-gradient(${state.gradient.angle}deg, ${state.gradient.colors.join(', ')})`,
        };
      default:
        return {};
    }
  };

  const handleBgMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target !== e.currentTarget || state.backgroundType !== 'image' || !state.backgroundImage) {
        return;
    }
    setIsDraggingBg(true);
    dragStartPos.current = { x: e.clientX, y: e.clientY };
    initialBgPos.current = config.backgroundPosition || { x: 0, y: 0 };
  };

  const handleBgMouseMove = useCallback((e: MouseEvent) => {
    if (!isDraggingBg) return;

    const dx = (e.clientX - dragStartPos.current.x) / state.zoomLevel;
    const dy = (e.clientY - dragStartPos.current.y) / state.zoomLevel;

    onArtboardBackgroundPositionUpdate(config.id, {
        x: initialBgPos.current.x + dx,
        y: initialBgPos.current.y + dy,
    });
  }, [isDraggingBg, state.zoomLevel, config.id, onArtboardBackgroundPositionUpdate]);

  const handleBgMouseUp = useCallback(() => {
    if (isDraggingBg) {
        onInteractionEnd();
    }
    setIsDraggingBg(false);
  }, [isDraggingBg, onInteractionEnd]);

  useEffect(() => {
    if (isDraggingBg) {
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
  }, [isDraggingBg, handleBgMouseMove, handleBgMouseUp]);

  const hexToRgba = (hex: string, alpha: number): string => {
    let r = 0, g = 0, b = 0;
    if (hex.match(/^#([A-Fa-f0-9]{3}){1,2}$/)) {
        let c = hex.substring(1).split('');
        if (c.length === 3) {
            c = [c[0], c[0], c[1], c[1], c[2], c[2]];
        }
        const numeric = parseInt(c.join(''), 16);
        r = (numeric >> 16) & 255;
        g = (numeric >> 8) & 255;
        b = numeric & 255;
        return `rgba(${r}, ${g}, ${b}, ${alpha})`;
    }
    return hex; // Fallback for invalid hex
  };

  const ctaStyle: React.CSSProperties = {
    backgroundColor: hexToRgba(state.ctaBgColor, state.ctaBgOpacity),
    color: state.ctaTextColor,
    padding: '8px 16px',
    borderRadius: `${state.borderRadius}px`,
    border: state.ctaStrokeEnabled ? `${state.ctaStrokeWidth}px solid ${state.ctaStrokeColor}` : 'none',
    display: 'inline-block',
    whiteSpace: 'nowrap',
    textDecoration: state.ctaUnderline ? 'underline' : 'none',
    textDecorationThickness: state.ctaUnderline ? `${state.ctaUnderlineThickness}px` : undefined,
    textUnderlineOffset: state.ctaUnderline ? `${state.ctaUnderlineOffset}px` : undefined,
  };

  const isSelected = (elementName: ElementName) => 
    selectedElement?.artboardId === id && selectedElement?.elementName === elementName;

  const handleSelect = (elementName: ElementName) => {
    onElementSelect({ artboardId: id, elementName: elementName });
  };

  return (
    <div 
      className="artboard-container border border-gray-300 shadow-lg relative overflow-hidden"
      style={{ width: `${width}px`, height: `${height}px`, ...getBackgroundStyle() }}
      data-id={id}
      onMouseDown={handleBgMouseDown}
      onClick={() => onElementSelect(null)}
    >
      {state.logoImage && (
        <DraggableItem
          id={`${id}-logo`}
          layout={config.logoLayout}
          artboardId={id}
          elementName="logo"
          onUpdate={onArtboardLayoutUpdate}
          gridSize={state.gridSize}
          snapToGrid={state.snapToGrid}
          zoomLevel={state.zoomLevel}
          onInteractionEnd={onInteractionEnd}
          isSelected={isSelected('logo')}
          onSelect={() => handleSelect('logo')}
          artboardWidth={width}
          artboardHeight={height}
        >
          <img src={state.logoImage.src} alt="logo" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
        </DraggableItem>
      )}

      <DraggableItem
        id={`${id}-headline`}
        layout={config.headlineLayout}
        artboardId={id}
        elementName="headline"
        onUpdate={onArtboardLayoutUpdate}
        gridSize={state.gridSize}
        snapToGrid={state.snapToGrid}
        zoomLevel={state.zoomLevel}
        onInteractionEnd={onInteractionEnd}
        isSelected={isSelected('headline')}
        onSelect={() => handleSelect('headline')}
        artboardWidth={width}
        artboardHeight={height}
      >
        <div style={{
          fontFamily: state.fontFamily,
          fontWeight: state.fontWeight,
          fontStyle: state.fontStyle,
          fontSize: `${(config.headlineLayout.fontSize || 24) + state.fontSizeAdjustment}px`,
          color: state.fontColor,
          letterSpacing: `${state.letterSpacing}px`,
          lineHeight: state.lineHeight,
          backgroundColor: state.textBgColor,
          padding: '0.2em 0.4em',
          borderRadius: `${state.borderRadius}px`,
          whiteSpace: 'normal', 
          wordBreak: 'break-word',
          overflowWrap: 'break-word'
        }}>
          {state.headline}
        </div>
      </DraggableItem>

      <DraggableItem
        id={`${id}-subheadline`}
        layout={config.subheadlineLayout}
        artboardId={id}
        elementName="subheadline"
        onUpdate={onArtboardLayoutUpdate}
        gridSize={state.gridSize}
        snapToGrid={state.snapToGrid}
        zoomLevel={state.zoomLevel}
        onInteractionEnd={onInteractionEnd}
        isSelected={isSelected('subheadline')}
        onSelect={() => handleSelect('subheadline')}
        artboardWidth={width}
        artboardHeight={height}
      >
        <div style={{
          fontFamily: state.fontFamily,
          fontWeight: 400,
          fontStyle: state.fontStyle,
          fontSize: `${(config.subheadlineLayout.fontSize || 14) + state.fontSizeAdjustment}px`,
          color: state.fontColor,
          letterSpacing: `${state.letterSpacing}px`,
          lineHeight: state.lineHeight,
          backgroundColor: state.textBgColor,
          padding: '0.2em 0.4em',
          borderRadius: `${state.borderRadius}px`,
          whiteSpace: 'normal', 
          wordBreak: 'break-word',
          overflowWrap: 'break-word'
        }}>
          {state.subheadline}
        </div>
      </DraggableItem>

      <DraggableItem
        id={`${id}-cta`}
        layout={config.ctaLayout}
        artboardId={id}
        elementName="cta"
        onUpdate={onArtboardLayoutUpdate}
        gridSize={state.gridSize}
        snapToGrid={state.snapToGrid}
        zoomLevel={state.zoomLevel}
        onInteractionEnd={onInteractionEnd}
        isSelected={isSelected('cta')}
        onSelect={() => handleSelect('cta')}
        artboardWidth={width}
        artboardHeight={height}
      >
        <span style={{...ctaStyle, whiteSpace: 'normal', wordBreak: 'break-word', overflowWrap: 'break-word'}}>
          {state.ctaText}
        </span>
      </DraggableItem>

    </div>
  );
};