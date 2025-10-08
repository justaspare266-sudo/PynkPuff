'use client';

import React, { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import { Stage, Layer, Text, Rect, Circle, Line, Transformer, Group, Image as KonvaImage, Arrow, Star, Ellipse, Wedge, Ring, Path, TextPath, Label, FastLayer, Sprite } from 'react-konva';
import Konva from 'konva';
import { 
  Type, 
  Crop, 
  Move, 
  RotateCw, 
  Square, 
  Circle as CircleIcon,
  Layers, 
  Grid3X3,
  AlignLeft,
  AlignCenter,
  AlignRight,
  ArrowUp,
  ArrowDown,
  ArrowLeft,
  ArrowRight,
  Pipette,
  Download,
  Save,
  Undo2,
  Redo2,
  Settings,
  Eye,
  EyeOff,
  Trash2,
  Copy,
  Scissors,
  MousePointer,
  Hand,
  FileText,
  Image as ImageIcon,
  FolderOpen,
  RotateCcw,
  ZoomIn,
  ZoomOut,
  Maximize2,
  PenTool,
  Eraser,
  Droplets,
  Palette,
  Play,
  X
} from 'lucide-react';

// Import our custom tools
import TextTool from './TextTool';
import CropTool from './CropTool';
import ResizeTransformTool from './ResizeTransformTool';
import GradientTool from './GradientTool';
import ShapeTool from './ShapeTool';
import ImageTool from './ImageTool';
import LayerManager from './LayerManager';
import GridSnapTool from './GridSnapTool';
import AnimationTool from './AnimationTool';
import PerformanceMonitor from '../utils/PerformanceMonitor';
// import { useToast } from '@/hooks/use-toast';
//types
export interface TextElement {
  id: string;
  type: 'text';
  x: number;
  y: number;
  width: number;
  height: number;
  text: string;
  fontSize: number;
  fontFamily: string;
  fill: string;
  fontWeight: number;
  fontStyle: string;
  textDecoration: string;
  letterSpacing: number;
  lineHeight: number;
  align: 'left' | 'center' | 'right' | 'justify';
  verticalAlign: 'top' | 'middle' | 'bottom';
  wrap: 'word' | 'char' | 'none';
  ellipsis: boolean;
  padding: number;
  direction: 'inherit' | 'ltr' | 'rtl';
  rotation: number;
  scaleX: number;
  scaleY: number;
  opacity: number;
  visible: boolean;
  zIndex: number;
  isSelected: boolean;
  isDragging: boolean;
  isResizing: boolean;
  isRotating: boolean;
  wrapState: {
    isWrapped: boolean;
    maxWidth: number;
    originalWidth: number;
  };
  textPath?: string; // SVG path data for text along curves
  boundaryState: {
    isWithinBounds: boolean;
    violationType: 'x' | 'y' | 'width' | 'height' | null;
  };
  isCached: boolean;
  perfectDrawEnabled: boolean;
  listening: boolean;
  name: string;
  locked: boolean;
  isGrouped: boolean;
  groupId?: string;
  children?: string[];
}

export interface ImageElement {
  id: string;
  type: 'image';
  x: number;
  y: number;
  width: number;
  height: number;
  src: string;
  rotation: number;
  scaleX: number;
  scaleY: number;
  opacity: number;
  visible: boolean;
  zIndex: number;
  isSelected: boolean;
  isDragging: boolean;
  isResizing: boolean;
  isRotating: boolean;
  cropData?: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
  // Konva Filter Properties
  filters?: string[];
  blurRadius?: number;
  brightness?: number;
  contrast?: number;
  sepia?: boolean;
  emboss?: boolean;
  embossStrength?: number;
  embossWhiteLevel?: number;
  embossDirection?: string;
  embossBlend?: number;
  solarize?: boolean;
  solarizeThreshold?: number;
  invert?: boolean;
  hue?: number;
  saturation?: number;
  value?: number;
  isCached: boolean;
  perfectDrawEnabled: boolean;
  listening: boolean;
  boundaryState: {
    isWithinBounds: boolean;
    violationType: 'x' | 'y' | 'width' | 'height' | null;
  };
  name: string;
  locked: boolean;
  isGrouped: boolean;
  groupId?: string;
  children?: string[];
  // Animation Properties
  isAnimating?: boolean;
  animationType?: 'none' | 'rotate' | 'scale' | 'move' | 'fade' | 'bounce' | 'pulse' | 'custom';
  animationDuration?: number;
  animationEasing?: 'linear' | 'easeIn' | 'easeOut' | 'easeInOut' | 'bounce' | 'elastic';
  animationLoop?: boolean;
  animationDelay?: number;
  animationDirection?: 'normal' | 'reverse' | 'alternate';
  animationIterations?: number;
  animationKeyframes?: Array<{
    time: number;
    properties: Record<string, any>;
  }>;
}

export interface GradientElement {
  id: string;
  type: 'gradient';
  x: number;
  y: number;
  width: number;
  height: number;
  gradientType: 'linear' | 'radial';
  angle: number;
  stops: Array<{
    id: string;
    color: string;
    position: number;
    opacity: number;
  }>;
  rotation: number;
  scaleX: number;
  scaleY: number;
  opacity: number;
  visible: boolean;
  zIndex: number;
  isSelected: boolean;
  isDragging: boolean;
  isResizing: boolean;
  isRotating: boolean;
  isCached: boolean;
  perfectDrawEnabled: boolean;
  listening: boolean;
  boundaryState: {
    isWithinBounds: boolean;
    violationType: 'x' | 'y' | 'width' | 'height' | null;
  };
  name: string;
  locked: boolean;
  isGrouped: boolean;
  groupId?: string;
  children?: string[];
}

export interface ShapeElement {
  id: string;
  type: 'rect' | 'circle' | 'line' | 'arrow' | 'star' | 'regularPolygon' | 'wedge' | 'ring' | 'arc' | 'path' | 'group';
  x: number;
  y: number;
  width: number;
  height: number;
  rotation: number;
  scaleX: number;
  scaleY: number;
  opacity: number;
  visible: boolean;
  zIndex: number;
  isSelected: boolean;
  isDragging: boolean;
  isResizing: boolean;
  isRotating: boolean;
  fill: string;
  stroke: string;
  strokeWidth: number;
  fillEnabled: boolean;
  strokeEnabled: boolean;
  cornerRadius?: number;
  radius?: number;
  points?: number[];
  closed?: boolean;
  tension?: number;
  pointerLength?: number;
  pointerWidth?: number;
  numPoints?: number;
  innerRadius?: number;
  outerRadius?: number;
  sides?: number;
  angle?: number;
  clockwise?: boolean;
  data?: string;
  shadowColor?: string;
  shadowBlur?: number;
  shadowOffset?: { x: number; y: number };
  shadowOpacity?: number;
  shadowEnabled?: boolean;
  fillLinearGradientStartPoint?: { x: number; y: number };
  fillLinearGradientEndPoint?: { x: number; y: number };
  fillLinearGradientColorStops?: Array<{ color: string; position: number }>;
  fillRadialGradientStartPoint?: { x: number; y: number };
  fillRadialGradientEndPoint?: { x: number; y: number };
  fillRadialGradientStartRadius?: number;
  fillRadialGradientEndRadius?: number;
  fillRadialGradientColorStops?: Array<{ color: string; position: number }>;
  isCached: boolean;
  perfectDrawEnabled: boolean;
  listening: boolean;
  groupId?: string;
  children?: string[];
  boundaryState: {
    isWithinBounds: boolean;
    violationType: 'x' | 'y' | 'width' | 'height' | null;
  };
  name: string;
  locked: boolean;
  isGrouped: boolean;
}

export interface GroupElement {
  id: string;
  type: 'group';
  x: number;
  y: number;
  width: number;
  height: number;
  rotation: number;
  scaleX: number;
  scaleY: number;
  opacity: number;
  visible: boolean;
  zIndex: number;
  isSelected: boolean;
  isDragging: boolean;
  isResizing: boolean;
  isRotating: boolean;
  boundaryState: {
    isWithinBounds: boolean;
    violationType: 'x' | 'y' | 'width' | 'height' | null;
  };
  isCached: boolean;
  perfectDrawEnabled: boolean;
  listening: boolean;
  name: string;
  locked: boolean;
  isGrouped: boolean;
  groupId?: string;
  children: string[];
}

export type CanvasElement = TextElement | ImageElement | GradientElement | ShapeElement | GroupElement;

export interface CanvasState {
  width: number;
  height: number;
  zoom: number;
  panX: number;
  panY: number;
  gridSize: number;
  snapToGrid: boolean;
  showGrid: boolean;
  showRulers: boolean;
}

export interface EditorState {
  selectedTool: 'select' | 'text' | 'crop' | 'resize' | 'gradient' | 'shapes' | 'images' | 'grid' | 'move' | 'rotate' | 'animation' | 'rect' | 'circle' | 'image' | 'pan';
  selectedElementIds: string[];
  isPanning: boolean;
  isSpacePressed: boolean;
  history: CanvasElement[][];
  historyIndex: number;
  performance: {
    fps: number;
    memoryUsage: number;
    renderTime: number;
    drawCalls: number;
    cachedNodes: number;
    totalNodes: number;
    animations: number;
    eventListeners: number;
    isOptimized: boolean;
    recommendations: string[];
  };
}

interface AdvancedImageEditorProps {
  isOpen?: boolean;
  onClose?: () => void;
  onSave?: (imageData: string) => void;
  title?: string;
  width?: number;
  height?: number;
  initialImageUrl?: string;
}

// Local image node that loads HTMLImageElement from src
const CanvasImage: React.FC<{
  el: ImageElement;
  onSelect: (id: string) => void;
  onDragEnd: (id: string, x: number, y: number) => void;
}> = ({ el, onSelect, onDragEnd }) => {
  const [img, setImg] = React.useState<HTMLImageElement | null>(null);
  React.useEffect(() => {
    if (!el.src) { setImg(null); return; }
    const image = new window.Image();
    image.crossOrigin = 'anonymous';
    image.onload = () => setImg(image);
    image.src = el.src as any;
    return () => { setImg(null); };
  }, [el.src]);
  return (
    <KonvaImage
      id={el.id}
      x={el.x}
      y={el.y}
      width={el.width}
      height={el.height}
      image={img || undefined}
      rotation={el.rotation}
      scaleX={el.scaleX}
      scaleY={el.scaleY}
      opacity={el.opacity}
      visible={el.visible}
      draggable
      filters={[]}
      onClick={(e) => { e.cancelBubble = true; onSelect(el.id); }}
      onDragEnd={(e) => onDragEnd(el.id, e.target.x(), e.target.y())}
    />
  );
};

const AdvancedImageEditor: React.FC<AdvancedImageEditorProps> = ({
  isOpen = true,
  onClose,
  onSave,
  title = "Advanced Image Editor",
  width = 1200,
  height = 800,
  initialImageUrl
}) => {
  // const { toast } = useToast();
  const toast = (options: any) => console.log('Toast:', options);
  // Core state
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Canvas state
  const [canvasState, setCanvasState] = useState<CanvasState>({
    width: 800,
    height: 600,
    zoom: 1,
    panX: 0,
    panY: 0,
    gridSize: 20,
    snapToGrid: true,
    showGrid: true,
    showRulers: true
  });

  // Editor state
  const [editorState, setEditorState] = useState<EditorState>({
    selectedTool: 'select',
    selectedElementIds: [],
    isPanning: false,
    isSpacePressed: false,
    history: [],
    historyIndex: -1,
    performance: {
      fps: 60,
      memoryUsage: 0,
      renderTime: 0,
      drawCalls: 0,
      cachedNodes: 0,
      totalNodes: 0,
      animations: 0,
      eventListeners: 0,
      isOptimized: true,
      recommendations: []
    }
  });

  // UI state: chosen shape type and popover
  const [currentShapeType, setCurrentShapeType] = useState<'rect' | 'circle' | 'line' | 'arrow' | 'star' | 'regularPolygon' | 'wedge' | 'ring' | 'arc'>('rect');
  const [showShapePopover, setShowShapePopover] = useState(false);

  // Elements state
  const [elements, setElements] = useState<CanvasElement[]>([]);
  const [layers, setLayers] = useState<CanvasElement[]>([]);
  const [editingTextId, setEditingTextId] = useState<string | null>(null);

  // Grid and snap state
  const [gridConfig, setGridConfig] = useState({
    enabled: true,
    size: 20,
    color: '#333333',
    opacity: 0.5,
    snapToGrid: true,
    snapThreshold: 10,
    showGrid: true,
    showRulers: true,
    showGuides: true,
    showMeasurements: true,
    gridType: 'lines' as 'lines' | 'dots' | 'crosses',
    majorGridSize: 5,
    majorGridColor: '#666666',
    majorGridOpacity: 0.8
  });

  const [guides, setGuides] = useState<any[]>([]);
  const [measurements, setMeasurements] = useState<any[]>([]);
  const [animations, setAnimations] = useState<Map<string, Konva.Animation>>(new Map());
  const [snapPoints, setSnapPoints] = useState<any[]>([]);

  // Performance monitoring state
  const [performanceData, setPerformanceData] = useState({
    fps: 60,
    memoryUsage: 0,
    renderTime: 0,
    drawCalls: 0,
    cachedNodes: 0,
    totalNodes: 0,
    animations: 0,
    eventListeners: 0,
    isOptimized: true,
    recommendations: [] as string[]
  });

  // UI panels state
  const [panelState, setPanelState] = useState({
    showPerformance: false
  });

  // Refs
  const stageRef = useRef<Konva.Stage>(null);
  const transformerRef = useRef<Konva.Transformer>(null);
  
  // Helper function to safely get stage
  const getStage = useCallback(() => {
    return stageRef.current;
  }, []);
  
  // Helper function to safely get layer
  const getLayer = useCallback(() => {
    const stage = getStage();
    return stage ? stage.findOne('Layer') : null;
  }, [getStage]);
  const performanceMonitorRef = useRef<PerformanceMonitor | null>(null);
  const textToolRef = useRef<any>(null);
  const isAltPressedRef = useRef<boolean>(false);
  const lastPointerRef = useRef<{ x: number; y: number } | null>(null);
  const stageTransformRef = useRef<{ panX: number; panY: number; zoom: number }>({ panX: 0, panY: 0, zoom: 1 });

  // Animation functions
  const startAnimation = useCallback((elementId: string, animationType: string, duration: number = 2000) => {
    const element = elements.find(el => el.id === elementId);
    if (!element) return;

    const stage = getStage();
    const layer = getLayer();
    if (!stage || !layer) return;

    // Stop existing animation
    stopAnimation(elementId);

    const anim = new Konva.Animation((frame) => {
      if (!frame) return;
      const time = frame.time ?? 0;
      const timeDiff = frame.timeDiff ?? 0;
      const frameRate = frame.frameRate ?? 0;

      switch (animationType) {
        case 'rotate':
          element.rotation = (time * 0.1) % 360;
          break;
        case 'scale':
          const scale = 1 + Math.sin(time * 0.002) * 0.2;
          element.scaleX = scale;
          element.scaleY = scale;
          break;
        case 'move':
          element.x = 100 + Math.sin(time * 0.001) * 100;
          element.y = 100 + Math.cos(time * 0.001) * 100;
          break;
        case 'fade':
          element.opacity = 0.5 + Math.sin(time * 0.002) * 0.5;
          break;
        case 'bounce':
          element.y = 100 + Math.abs(Math.sin(time * 0.003)) * 50;
          break;
        case 'pulse':
          const pulseScale = 1 + Math.sin(time * 0.005) * 0.3;
          element.scaleX = pulseScale;
          element.scaleY = pulseScale;
          break;
      }

      // Update the element in state
      setElements(prev => prev.map(el => 
        el.id === elementId ? { ...el, ...element } : el
      ));
    }, layer);

    anim.start();
    setAnimations(prev => {
      const next = new Map(prev);
      next.set(elementId, anim);
      return next;
    });

    // Auto-stop after duration
    setTimeout(() => {
      stopAnimation(elementId);
    }, duration);
  }, [elements, getStage, getLayer]);

  const stopAnimation = useCallback((elementId: string) => {
    const anim = animations.get(elementId);
    if (anim) {
      anim.stop();
      setAnimations(prev => {
        const newMap = new Map(prev);
        newMap.delete(elementId);
        return newMap;
      });
    }
  }, [animations]);

  const stopAllAnimations = useCallback(() => {
    animations.forEach((anim, elementId) => {
      anim.stop();
    });
    setAnimations(new Map());
  }, [animations]);

  // Label and tooltip functions
  const createTooltip = useCallback((text: string, x: number, y: number) => {
    const stage = getStage();
    if (!stage) return;

    const tooltip = new Konva.Label({
      x: x,
      y: y,
      opacity: 0.8,
    });

    tooltip.add(
      new Konva.Tag({
        fill: 'black',
        cornerRadius: 4,
        pointerDirection: 'down',
        pointerWidth: 10,
        pointerHeight: 10,
      })
    );

    tooltip.add(
      new Konva.Text({
        text: text,
        fontFamily: 'Arial',
        fontSize: 12,
        padding: 5,
        fill: 'white',
      })
    );

    const layer = getLayer();
    if (layer && 'add' in layer && typeof (layer as any).add === 'function') {
      (layer as any).add(tooltip);
      if ('batchDraw' in layer && typeof (layer as any).batchDraw === 'function') {
        (layer as any).batchDraw();
      }
    }

    return tooltip;
  }, [getStage, getLayer]);

  // Mask functions
  const createMask = useCallback((elementId: string, maskElementId: string) => {
    const stage = getStage();
    if (!stage) return;

    const element = stage.findOne(`#${elementId}`) as any;
    const maskElement = stage.findOne(`#${maskElementId}`) as any;
    
    if (element && maskElement) {
      if (typeof element.mask === 'function') {
      element.mask(maskElement);
      }
      if (typeof (stage as any).batchDraw === 'function') {
        (stage as any).batchDraw();
      }
    }
  }, [getStage]);

  const removeMask = useCallback((elementId: string) => {
    const stage = getStage();
    if (!stage) return;

    const element = stage.findOne(`#${elementId}`) as any;
    if (element) {
      if (typeof element.mask === 'function') {
      element.mask(null);
      }
      if (typeof (stage as any).batchDraw === 'function') {
        (stage as any).batchDraw();
      }
    }
  }, [getStage]);

  // Sprite functions
  const createSprite = useCallback((image: HTMLImageElement, frameWidth: number, frameHeight: number, frameCount: number, x: number, y: number) => {
    const stage = getStage();
    if (!stage) return;

    const sprite = new Konva.Sprite({
      x: x,
      y: y,
      image: image,
      animation: 'idle',
      animations: {
        idle: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9],
        walk: [10, 11, 12, 13, 14, 15, 16, 17, 18, 19],
        jump: [20, 21, 22, 23, 24, 25, 26, 27, 28, 29],
      },
      frameRate: 10,
      frameIndex: 0,
    });

    const layer = getLayer();
    if (layer && 'add' in layer && typeof (layer as any).add === 'function') {
      (layer as any).add(sprite);
      sprite.start();
      if (typeof (stage as any).batchDraw === 'function') {
        (stage as any).batchDraw();
      }
    }

    return sprite;
  }, [getStage, getLayer]);

  const playSpriteAnimation = useCallback((spriteId: string, animationName: string) => {
    const stage = getStage();
    if (!stage) return;

    const sprite = stage.findOne(`#${spriteId}`) as Konva.Sprite | null;
    if (sprite) {
      sprite.animation(animationName);
      sprite.start();
    }
  }, [getStage]);

  const stopSpriteAnimation = useCallback((spriteId: string) => {
    const stage = getStage();
    if (!stage) return;

    const sprite = stage.findOne(`#${spriteId}`) as Konva.Sprite | null;
    if (sprite) {
      sprite.stop();
    }
  }, [getStage]);

  // Clipping functions
  const createClippingRegion = useCallback((x: number, y: number, width: number, height: number) => {
    const stage = getStage();
    if (!stage) return;

    const clippingRect = new Konva.Rect({
      x: x,
      y: y,
      width: width,
      height: height,
      fill: 'transparent',
      stroke: 'red',
      strokeWidth: 2,
      dash: [5, 5],
    });

    const layer = getLayer();
    if (layer && 'add' in layer && typeof (layer as any).add === 'function') {
      (layer as any).add(clippingRect);
      if (typeof (stage as any).batchDraw === 'function') {
        (stage as any).batchDraw();
      }
    }

    return clippingRect;
  }, [getStage, getLayer]);

  const applyClipping = useCallback((elementId: string, clippingRegionId: string) => {
    const stage = getStage();
    if (!stage) return;

    const element = stage.findOne(`#${elementId}`) as any;
    const clippingRegion = stage.findOne(`#${clippingRegionId}`) as any;
    
    if (element && clippingRegion) {
      if (typeof element.clipFunc === 'function') {
      element.clipFunc((ctx: CanvasRenderingContext2D) => {
        ctx.rect(
          clippingRegion.x(),
          clippingRegion.y(),
          clippingRegion.width(),
          clippingRegion.height()
        );
      });
      }
      if (typeof (stage as any).batchDraw === 'function') {
        (stage as any).batchDraw();
      }
    }
  }, [getStage]);

  const removeClipping = useCallback((elementId: string) => {
    const stage = getStage();
    if (!stage) return;

    const element = stage.findOne(`#${elementId}`) as any;
    if (element) {
      if (typeof element.clipFunc === 'function') {
      element.clipFunc(null);
      }
      if (typeof (stage as any).batchDraw === 'function') {
        (stage as any).batchDraw();
      }
    }
  }, [getStage]);

  // Performance optimization functions
  const cacheElement = useCallback((elementId: string) => {
    const stage = getStage();
    if (!stage) return;

    const node = stage.findOne(`#${elementId}`) as any;
    if (node && typeof node.cache === 'function') {
      node.cache();
      // Update element cache status
      setElements(prev => prev.map(el => 
        el.id === elementId ? { ...el, isCached: true } : el
      ));
    }
  }, [getStage]);

  const uncacheElement = useCallback((elementId: string) => {
    const stage = getStage();
    if (!stage) return;

    const node = stage.findOne(`#${elementId}`) as any;
    if (node && typeof node.clearCache === 'function') {
      node.clearCache();
      // Update element cache status
      setElements(prev => prev.map(el => 
        el.id === elementId ? { ...el, isCached: false } : el
      ));
    }
  }, [getStage]);

  const cacheAllElements = useCallback(() => {
    elements.forEach(element => {
      if (!element.isCached) {
        cacheElement(element.id);
      }
    });
  }, [elements, cacheElement]);

  const uncacheAllElements = useCallback(() => {
    elements.forEach(element => {
      if (element.isCached) {
        uncacheElement(element.id);
      }
    });
  }, [elements, uncacheElement]);

  // Group functions
  const createGroup = useCallback((elementIds: string[]) => {
    if (elementIds.length < 2) return;

    const groupId = `group-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const groupElements = elements.filter(el => elementIds.includes(el.id));
    
    if (groupElements.length === 0) return;

    // Calculate group bounds
    const minX = Math.min(...groupElements.map(el => el.x));
    const minY = Math.min(...groupElements.map(el => el.y));
    const maxX = Math.max(...groupElements.map(el => el.x + el.width));
    const maxY = Math.max(...groupElements.map(el => el.y + el.height));

    const groupElement: CanvasElement = {
      id: groupId,
      type: 'group',
      x: minX,
      y: minY,
      width: maxX - minX,
      height: maxY - minY,
      rotation: 0,
      scaleX: 1,
      scaleY: 1,
      opacity: 1,
      visible: true,
      zIndex: Math.max(...groupElements.map(el => el.zIndex)),
      isSelected: false,
      isDragging: false,
      isResizing: false,
      isRotating: false,
      children: elementIds,
      boundaryState: {
        isWithinBounds: true,
        violationType: null
      },
      isCached: false,
      perfectDrawEnabled: true,
      listening: true,
      name: 'Group',
      locked: false,
      isGrouped: false
    };

    // Update child elements to be grouped
    const updatedElements = elements.map(el => 
      elementIds.includes(el.id) 
        ? { ...el, isGrouped: true, groupId }
        : el
    );

    setElements([...updatedElements, groupElement]);
  }, [elements]);

  const ungroupElements = useCallback((groupId: string) => {
    const groupElement = elements.find(el => el.id === groupId);
    if (!groupElement || groupElement.type !== 'group') return;

    // Update child elements to be ungrouped
    const updatedElements = elements.map(el => 
      el.groupId === groupId 
        ? { ...el, isGrouped: false, groupId: undefined }
        : el
    ).filter(el => el.id !== groupId);

    setElements(updatedElements);
  }, [elements]);
  const cropToolRef = useRef<any>(null);
  const resizeTransformToolRef = useRef<any>(null);
  const gradientToolRef = useRef<any>(null);
  const shapeToolRef = useRef<any>(null);
  const imageToolRef = useRef<any>(null);
  const layerManagerRef = useRef<any>(null);
  const gridSnapToolRef = useRef<any>(null);

  // Performance monitoring
  useEffect(() => {
    performanceMonitorRef.current = new PerformanceMonitor();
    setIsLoading(false);
    
    // Update performance data periodically
    const updatePerformanceData = () => {
      if (performanceMonitorRef.current) {
        const stats = performanceMonitorRef.current.getStats();
        setPerformanceData({
          fps: stats.fps,
          memoryUsage: stats.memoryUsage,
          renderTime: stats.renderTime,
          drawCalls: stats.drawCalls,
          cachedNodes: stats.cachedNodes,
          totalNodes: stats.totalNodes,
          animations: stats.animations,
          eventListeners: stats.eventListeners,
          isOptimized: stats.isOptimized,
          recommendations: stats.recommendations
        });
      }
    };
    
    // Update every second
    const interval = setInterval(updatePerformanceData, 1000);
    
    return () => {
      performanceMonitorRef.current?.cleanup();
      clearInterval(interval);
    };
  }, []);

  // Update transformer when selected elements change
  useEffect(() => {
    if (transformerRef.current && editorState.selectedElementIds.length > 0) {
      const stage = getStage();
      if (stage) {
        try {
          const selectedNodes = editorState.selectedElementIds
            .map(id => stage.findOne(`#${id}`))
            .filter((node): node is Konva.Node => node !== undefined);
          
          if (selectedNodes.length > 0) {
            transformerRef.current.nodes(selectedNodes);
            // Get the layer safely using our helper
            const layer = getLayer();
            if (layer) {
              (layer as any).batchDraw();
            }
          }
        } catch (error) {
          console.error('Error updating transformer:', error);
        }
      }
    } else if (transformerRef.current) {
      try {
        transformerRef.current.nodes([]);
      } catch (error) {
        console.error('Error clearing transformer:', error);
      }
    }
  }, [editorState.selectedElementIds, getStage, getLayer]);

  // Event listeners for keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't handle shortcuts if user is typing in an input/textarea
      const target = e.target as HTMLElement;
      if (target && (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.contentEditable === 'true')) {
        return;
      }

      // Space bar for panning
      if (e.code === 'Space' && !editorState.isSpacePressed) {
        setEditorState(prev => ({ ...prev, isPanning: true }));
        lastPointerRef.current = null; // Will be set on first mouse move
        const stage = getStage();
        if (stage) {
          stageTransformRef.current = {
            panX: stage.x(),
            panY: stage.y(),
            zoom: stage.scaleX()
          };
        }
        return;
      }
      
      // Core shortcuts with Cmd/Ctrl
      if (e.ctrlKey || e.metaKey) {
        switch (e.key) {
          case 'z':
            e.preventDefault();
            if (e.shiftKey) {
              redo();
            } else {
              undo();
            }
            break;
          case 'Z':
            e.preventDefault();
            redo();
            break;
          case 'c':
            e.preventDefault();
            copySelectedElements();
            break;
          case 'v':
            e.preventDefault();
            pasteElements();
            break;
          case 's':
            e.preventDefault();
            saveCanvas();
            break;
          case '`': // Cmd + ~ (backtick)
            e.preventDefault();
            setEditorState(prev => ({ ...prev, selectedTool: 'animation' }));
            break;
        }
      }
      
      // Tool selection shortcuts
      switch (e.key) {
        case 'v':
          if (!e.ctrlKey && !e.metaKey) {
            setEditorState(prev => ({ ...prev, selectedTool: 'select' }));
          }
          break;
        case 't':
          setEditorState(prev => ({ ...prev, selectedTool: 'text' }));
          break;
        case 's':
          setEditorState(prev => ({ ...prev, selectedTool: 'shapes' }));
          break;
        case 'i':
          setEditorState(prev => ({ ...prev, selectedTool: 'images' }));
          break;
        case 'g':
          setEditorState(prev => ({ ...prev, selectedTool: 'grid' }));
          break;
        case 'd':
          setEditorState(prev => ({ ...prev, selectedTool: 'gradient' }));
          break;
        case 'c':
          if (!e.ctrlKey && !e.metaKey) {
            setEditorState(prev => ({ ...prev, selectedTool: 'crop' }));
          }
          break;
        case 'r':
          setEditorState(prev => ({ ...prev, selectedTool: 'resize' }));
          break;
        case 'a':
          setEditorState(prev => ({ ...prev, selectedTool: 'animation' }));
          break;
        case 'm':
          setEditorState(prev => ({ ...prev, selectedTool: 'move' }));
          break;
        case 'ArrowUp':
        case 'ArrowDown':
        case 'ArrowLeft':
        case 'ArrowRight': {
          if (editorState.selectedElementIds.length > 0) {
            e.preventDefault();
            const delta = e.shiftKey ? 10 : 1;
            const dx = e.key === 'ArrowLeft' ? -delta : e.key === 'ArrowRight' ? delta : 0;
            const dy = e.key === 'ArrowUp' ? -delta : e.key === 'ArrowDown' ? delta : 0;
            setElements(prev => prev.map(el => editorState.selectedElementIds.includes(el.id) ? { ...el, x: (el.x || 0) + dx, y: (el.y || 0) + dy } : el));
          }
          break;
        }
        case 'Delete':
        case 'Backspace':
          deleteSelectedElements();
          break;
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.code === 'Space') {
        setEditorState(prev => ({ ...prev, isSpacePressed: false }));
        document.body.style.cursor = 'default';
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    document.addEventListener('keyup', handleKeyUp);

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('keyup', handleKeyUp);
    };
  }, [editorState.isSpacePressed]);

  // Text tool handlers
  const handleTextAdd = useCallback((textElement: Omit<TextElement, 'id'>) => {
    const newElement: TextElement = {
      ...textElement,
      id: `text-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      isSelected: true,
      isDragging: false,
      isResizing: false,
      isRotating: false,
      wrapState: {
        isWrapped: false,
        maxWidth: textElement.width,
        originalWidth: textElement.width
      },
      boundaryState: {
        isWithinBounds: true,
        violationType: null
      },
      isCached: false,
      perfectDrawEnabled: true,
      listening: true,
      name: `Text ${elements.filter(e => e.type === 'text').length + 1}`,
      locked: false,
      isGrouped: false
    };

    setElements(prev => [...prev, newElement]);
    setEditorState(prev => ({ 
      ...prev, 
      selectedElementIds: [newElement.id]
    }));
  }, []);

  const handleTextUpdate = useCallback((id: string, updates: Partial<TextElement>) => {
    setElements(prev => prev.map(el => 
      el.id === id && el.type === 'text' ? { ...el, ...updates } as TextElement : el
    ));
  }, []);

  const handleTextDelete = useCallback((id: string) => {
    setElements(prev => prev.filter(el => el.id !== id));
    setEditorState(prev => ({
      ...prev,
      selectedElementIds: prev.selectedElementIds.filter(elId => elId !== id)
    }));
  }, []);

  // Crop tool handlers
  const handleCrop = useCallback((elementId: string, cropData: { x: number; y: number; width: number; height: number }) => {
    setElements(prev => prev.map(el => 
      el.id === elementId && el.type === 'image' 
        ? { ...el, cropData, width: cropData.width, height: cropData.height }
        : el
    ));
  }, []);

  // Resize and transform handlers
  const handleResize = useCallback((elementId: string, newWidth: number, newHeight: number) => {
    setElements(prev => prev.map(el => 
      el.id === elementId 
        ? { ...el, width: newWidth, height: newHeight }
        : el
    ));
  }, []);


  // Gradient tool handlers
  const handleGradientAdd = useCallback((gradientElement: Omit<GradientElement, 'id'>) => {
    // Apply gradient to canvas background by default
    setCanvasBackground({
      type: gradientElement.gradientType === 'radial' ? 'radial' : 'linear',
      angle: gradientElement.angle || 0,
      stops: gradientElement.stops.map(s => ({ color: s.color, position: s.position, opacity: s.opacity }))
    });
    setEditorState(prev => ({ ...prev, selectedTool: 'select' }));
  }, []);

  const handleGradientUpdate = useCallback((id: string, updates: Partial<GradientElement>) => {
    setElements(prev => prev.map(el => 
      el.id === id && el.type === 'gradient' ? { ...el, ...updates } as GradientElement : el
    ));
  }, []);

  // Shape tool handlers
  const handleShapeAdd = useCallback((shapeElement: Omit<ShapeElement, 'id'>) => {
    const newElement: ShapeElement = {
      ...shapeElement,
      id: `shape-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      isSelected: true,
      isDragging: false,
      isResizing: false,
      isRotating: false
    };

    setElements(prev => [...prev, newElement]);
    setEditorState(prev => ({ 
      ...prev, 
      selectedElementIds: [newElement.id],
      selectedTool: 'select'
    }));
  }, []);

  const handleShapeUpdate = useCallback((id: string, updates: Partial<ShapeElement>) => {
    setElements(prev => prev.map(el => 
      el.id === id && el.type !== 'text' && el.type !== 'image' && el.type !== 'gradient' 
        ? { ...el, ...updates } as ShapeElement : el
    ));
  }, []);

  const handleShapeDelete = useCallback((id: string) => {
    setElements(prev => prev.filter(el => el.id !== id));
    setEditorState(prev => ({
      ...prev,
      selectedElementIds: prev.selectedElementIds.filter(elId => elId !== id)
    }));
  }, []);

  // Image tool handlers
  const handleImageAdd = useCallback((imageElement: Omit<ImageElement, 'id'>) => {
    const newElement: ImageElement = {
      ...imageElement,
      id: `image-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      isSelected: true,
      isDragging: false,
      isResizing: false,
      isRotating: false,
      isCached: false,
      perfectDrawEnabled: true,
      listening: true,
      boundaryState: {
        isWithinBounds: true,
        violationType: null
      },
      name: `Image ${Date.now()}`,
      locked: false,
      isGrouped: false
    };

    setElements(prev => [...prev, newElement]);
    setEditorState(prev => ({ 
      ...prev, 
      selectedElementIds: [newElement.id],
      selectedTool: 'select'
    }));
  }, []);

  const handleImageUpdate = useCallback((id: string, updates: Partial<ImageElement>) => {
    setElements(prev => prev.map(el => 
      el.id === id && el.type === 'image' ? { ...el, ...updates } as ImageElement : el
    ));
  }, []);

  const handleImageDelete = useCallback((id: string) => {
    setElements(prev => prev.filter(el => el.id !== id));
    setEditorState(prev => ({
      ...prev,
      selectedElementIds: prev.selectedElementIds.filter(elId => elId !== id)
    }));
  }, []);

  // Grid and snap handlers
  const handleGridConfigChange = useCallback((config: Partial<typeof gridConfig>) => {
    setGridConfig(prev => ({ ...prev, ...config }));
  }, []);

  const handleGuideAdd = useCallback((guide: Omit<any, 'id'>) => {
    const newGuide = { ...guide, id: `guide-${Date.now()}` };
    setGuides(prev => [...prev, newGuide]);
  }, []);

  const handleGuideRemove = useCallback((guideId: string) => {
    setGuides(prev => prev.filter(g => g.id !== guideId));
  }, []);

  const handleGuideUpdate = useCallback((guideId: string, updates: Partial<any>) => {
    setGuides(prev => prev.map(g => 
      g.id === guideId ? { ...g, ...updates } : g
    ));
  }, []);

  const handleMeasurementAdd = useCallback((measurement: Omit<any, 'id'>) => {
    const newMeasurement = { ...measurement, id: `measurement-${Date.now()}` };
    setMeasurements(prev => [...prev, newMeasurement]);
  }, []);

  const handleMeasurementRemove = useCallback((measurementId: string) => {
    setMeasurements(prev => prev.filter(m => m.id !== measurementId));
  }, []);

  const handleMeasurementUpdate = useCallback((measurementId: string, updates: Partial<any>) => {
    setMeasurements(prev => prev.map(m => 
      m.id === measurementId ? { ...m, ...updates } : m
    ));
  }, []);

  // Snap to grid function
  const snapToGrid = useCallback((x: number, y: number) => {
    if (!gridConfig.snapToGrid) return { x, y };
    
    const gridSize = gridConfig.size;
    const threshold = gridConfig.snapThreshold;
    
    const snappedX = Math.round(x / gridSize) * gridSize;
    const snappedY = Math.round(y / gridSize) * gridSize;
    
    // Only snap if within threshold
    if (Math.abs(x - snappedX) < threshold && Math.abs(y - snappedY) < threshold) {
      return { x: snappedX, y: snappedY };
    }
    
    return { x, y };
  }, [gridConfig]);

  // Snap to guides function
  const snapToGuides = useCallback((x: number, y: number) => {
    if (!gridConfig.showGuides) return { x, y };
    
    const threshold = gridConfig.snapThreshold;
    let snappedX = x;
    let snappedY = y;
    
    guides.forEach(guide => {
      if (guide.type === 'vertical' && Math.abs(x - guide.position) < threshold) {
        snappedX = guide.position;
      } else if (guide.type === 'horizontal' && Math.abs(y - guide.position) < threshold) {
        snappedY = guide.position;
      }
    });
    
    return { x: snappedX, y: snappedY };
  }, [guides, gridConfig]);

  // Snap to elements function
  const snapToElements = useCallback((x: number, y: number) => {
    if (!gridConfig.snapToGrid) return { x, y };
    
    const threshold = gridConfig.snapThreshold;
    let snappedX = x;
    let snappedY = y;
    
    elements.forEach(element => {
      const bounds = {
        x: element.x || 0,
        y: element.y || 0,
        width: element.width || 0,
        height: element.height || 0
      };
      
      // Snap to element edges
      if (Math.abs(x - bounds.x) < threshold) snappedX = bounds.x;
      if (Math.abs(x - (bounds.x + bounds.width)) < threshold) snappedX = bounds.x + bounds.width;
      if (Math.abs(y - bounds.y) < threshold) snappedY = bounds.y;
      if (Math.abs(y - (bounds.y + bounds.height)) < threshold) snappedY = bounds.y + bounds.height;
      
      // Snap to element center
      const centerX = bounds.x + bounds.width / 2;
      const centerY = bounds.y + bounds.height / 2;
      if (Math.abs(x - centerX) < threshold) snappedX = centerX;
      if (Math.abs(y - centerY) < threshold) snappedY = centerY;
    });
    
    return { x: snappedX, y: snappedY };
  }, [elements, gridConfig]);

  // Handle transform updates
  const handleTransform = useCallback((elementId: string, transform: {
    x?: number;
    y?: number;
    rotation?: number;
    scaleX?: number;
    scaleY?: number;
  }) => {
    setElements(prev => prev.map(el => 
      el.id === elementId ? {
        ...el,
        ...(transform.x !== undefined && { x: transform.x }),
        ...(transform.y !== undefined && { y: transform.y }),
        ...(transform.rotation !== undefined && { rotation: transform.rotation }),
        ...(transform.scaleX !== undefined && { scaleX: transform.scaleX }),
        ...(transform.scaleY !== undefined && { scaleY: transform.scaleY })
      } : el
    ));
  }, []);

  // Generate CSS gradient string for Konva
  const generateGradientCSS = useCallback((gradientElement: Omit<GradientElement, 'id'>) => {
    const cssStops = gradientElement.stops
      .map(stop => `${stop.color} ${stop.position}%`)
      .join(', ');

    if (gradientElement.gradientType === 'linear') {
      return `linear-gradient(${gradientElement.angle}deg, ${cssStops})`;
    } else {
      return `radial-gradient(circle, ${cssStops})`;
    }
  }, []);

  // Layer management
  const handleLayerReorder = useCallback((newLayers: any[]) => {
    setLayers(newLayers);
    setElements(prev => {
      const reorderedElements = [...prev];
      newLayers.forEach((layer, index) => {
        const elementIndex = reorderedElements.findIndex(el => el.id === layer.id);
        if (elementIndex !== -1) {
          reorderedElements[elementIndex] = { ...reorderedElements[elementIndex], zIndex: index };
        }
      });
      return reorderedElements.sort((a, b) => a.zIndex - b.zIndex);
    });
  }, []);

  const handleLayerToggle = useCallback((elementId: string, visible: boolean) => {
    setElements(prev => prev.map(el => 
      el.id === elementId ? { ...el, visible } : el
    ));
  }, []);

  // History management
  const saveToHistory = useCallback(() => {
    setEditorState(prev => {
      const newHistory = prev.history.slice(0, prev.historyIndex + 1);
      newHistory.push([...elements]);
      return {
        ...prev,
        history: newHistory,
        historyIndex: newHistory.length - 1
      };
    });
  }, [elements]);

  const undo = useCallback(() => {
    setEditorState(prev => {
      if (prev.historyIndex > 0) {
        const newIndex = prev.historyIndex - 1;
        setElements(prev.history[newIndex]);
        return { ...prev, historyIndex: newIndex };
      }
      return prev;
    });
  }, []);

  const redo = useCallback(() => {
    setEditorState(prev => {
      if (prev.historyIndex < prev.history.length - 1) {
        const newIndex = prev.historyIndex + 1;
        setElements(prev.history[newIndex]);
        return { ...prev, historyIndex: newIndex };
      }
      return prev;
    });
  }, []);

  // Utility functions
  const copySelectedElements = useCallback(() => {
    const selectedElements = elements.filter(el => editorState.selectedElementIds.includes(el.id));
    navigator.clipboard.writeText(JSON.stringify(selectedElements));
  }, [elements, editorState.selectedElementIds]);

  const pasteElements = useCallback(async () => {
    try {
      const clipboardData = await navigator.clipboard.readText();
      const pastedElements = JSON.parse(clipboardData);
      const newElements = pastedElements.map((el: CanvasElement) => ({
        ...el,
        id: `${el.type}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        x: el.x + 20,
        y: el.y + 20,
        isSelected: true
      }));
      setElements(prev => [...prev, ...newElements]);
      setEditorState(prev => ({
        ...prev,
        selectedElementIds: newElements.map((el: CanvasElement) => el.id)
      }));
    } catch (error) {
      console.error('Failed to paste elements:', error);
    }
  }, []);

  const deleteSelectedElements = useCallback(() => {
    setElements(prev => prev.filter(el => !editorState.selectedElementIds.includes(el.id)));
    setEditorState(prev => ({ ...prev, selectedElementIds: [] }));
  }, [editorState.selectedElementIds]);

  const saveCanvas = useCallback(() => {
    if (onSave && stageRef.current) {
      const dataURL = stageRef.current.toDataURL({
        mimeType: 'image/png',
        quality: 1,
        pixelRatio: 2
      });
      onSave(dataURL);
      try {
        toast({ title: 'Saved', description: 'Your design was saved successfully.' });
      } catch {}
    }
  }, [onSave]);

  // Performance monitoring
  useEffect(() => {
    const updatePerformance = () => {
      if (performanceMonitorRef.current) {
        const stats = performanceMonitorRef.current.getStats();
        setEditorState(prev => ({
          ...prev,
          performance: {
            fps: stats.fps,
            memoryUsage: stats.memoryUsage,
            renderTime: stats.renderTime,
            drawCalls: stats.drawCalls,
            cachedNodes: stats.cachedNodes,
            totalNodes: stats.totalNodes,
            animations: stats.animations,
            eventListeners: stats.eventListeners,
            isOptimized: stats.isOptimized,
            recommendations: stats.recommendations
          }
        }));
      }
    };

    const interval = setInterval(updatePerformance, 1000);
    return () => clearInterval(interval);
  }, []);

  // Drag state for professional tool behavior
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [dragCurrent, setDragCurrent] = useState({ x: 0, y: 0 });
  const [isCreating, setIsCreating] = useState(false);

  // Get cursor style based on selected tool
  const getCursorStyle = () => {
    if (editorState.isSpacePressed) {
      return editorState.isPanning ? 'grabbing' : 'grab';
    }
    switch (editorState.selectedTool) {
      case 'text':
        return 'text';
      case 'shapes':
        return 'crosshair';
      case 'gradient':
        return 'crosshair';
      case 'crop':
        return 'crosshair';
      case 'move':
        return editorState.isPanning ? 'grabbing' : 'grab';
      case 'select':
        return 'default';
      default:
        return 'default';
    }
  };

  // Handle stage click
  const handleStageClick = useCallback((e: any) => {
    const clickedOnEmpty = e.target === e.target.getStage();
    if (clickedOnEmpty) {
      setEditorState(prev => ({ ...prev, selectedElementIds: [] }));
      return;
    }
    // Intelligent selection without switching tools
    const node = e.target as Konva.Node;
    const id = (node as any).id?.();
    if (id) {
      setEditorState(prev => ({ ...prev, selectedElementIds: [id] }));
    }
  }, []);

  // Helpers to convert between screen and canvas (logical) coordinates
  const screenToCanvasPoint = useCallback((p: { x: number; y: number }) => {
    const inv = 1 / (canvasState.zoom || 1);
    return {
      x: (p.x - canvasState.panX) * inv,
      y: (p.y - canvasState.panY) * inv
    };
  }, [canvasState.panX, canvasState.panY, canvasState.zoom]);

  // Handle mouse down for drag-to-create
  const handleMouseDown = useCallback((e: any) => {
    try {
      const stage = e.target.getStage();
      if (!stage) return;
      const pointer = stage.getPointerPosition();
      const pos = pointer ? screenToCanvasPoint(pointer) : null;
      if (!pos) return;

      // Start panning with space or move tool
      if (editorState.isSpacePressed || editorState.selectedTool === 'move') {
        setEditorState(prev => ({ ...prev, isPanning: true }));
        lastPointerRef.current = { x: pointer.x, y: pointer.y };
        stageTransformRef.current = {
          panX: canvasState.panX,
          panY: canvasState.panY,
          zoom: canvasState.zoom
        };
        return;
      }

      // Only start drag-to-create if clicking on empty canvas
      const clickedOnEmpty = e.target === e.target.getStage();
      if (clickedOnEmpty && editorState.selectedTool !== 'select') {
        setIsDragging(true);
        setIsCreating(true);
        setDragStart(pos);
        setDragCurrent(pos);
      }
      // Shift+click toggles selection for multi-select when clicking a node
      if (!clickedOnEmpty && e.evt?.shiftKey) {
        const node = e.target as Konva.Node;
        const id = (node as any).id?.();
        if (id) {
          setEditorState(prev => ({
            ...prev,
            selectedElementIds: prev.selectedElementIds.includes(id)
              ? prev.selectedElementIds.filter(x => x !== id)
              : [...prev.selectedElementIds, id]
          }));
        }
      }
    } catch (error) {
      console.error('Error in handleMouseDown:', error);
    }
  }, [editorState.selectedTool, editorState.isSpacePressed, canvasState.panX, canvasState.panY, canvasState.zoom, screenToCanvasPoint]);

  // Handle mouse move for drag preview and cursor tracking
  const handleMouseMove = useCallback((e: any) => {
    try {
      const stage = e.target.getStage();
      if (!stage) return;
      const pointer = stage.getPointerPosition();
      if (!pointer) return;

      // Panning
      if (editorState.isPanning && lastPointerRef.current) {
        const dx = pointer.x - lastPointerRef.current.x;
        const dy = pointer.y - lastPointerRef.current.y;
        setCanvasState(prev => ({ ...prev, panX: stageTransformRef.current.panX + dx, panY: stageTransformRef.current.panY + dy }));
        return;
      }

      // Always update cursor position for crosshair or constrained drag preview
      const pos = screenToCanvasPoint(pointer);
      if (isDragging && isCreating && (e as any).evt?.shiftKey) {
        const dx = Math.abs(pos.x - dragStart.x);
        const dy = Math.abs(pos.y - dragStart.y);
        if (dx > dy) {
          setDragCurrent({ x: pos.x, y: dragStart.y });
        } else {
          setDragCurrent({ x: dragStart.x, y: pos.y });
        }
      } else {
        setDragCurrent(pos);
      }
    } catch (error) {
      console.error('Error in handleMouseMove:', error);
    }
  }, [isDragging, isCreating, editorState.isPanning, screenToCanvasPoint]);

  // Handle mouse up to create element or stop panning
  const handleMouseUp = useCallback((e: any) => {
    if (editorState.isPanning) {
      setEditorState(prev => ({ ...prev, isPanning: false }));
      lastPointerRef.current = null;
      return;
    }

    if (!isDragging || !isCreating) return;

    try {
      const stage = e.target.getStage();
      if (!stage) return;
      const pointer = stage.getPointerPosition();
      const pos = pointer ? screenToCanvasPoint(pointer) : null;
      if (!pos) return;

      const width = Math.abs(pos.x - dragStart.x);
      const height = Math.abs(pos.y - dragStart.y);
      const x = Math.min(pos.x, dragStart.x);
      const y = Math.min(pos.y, dragStart.y);

      // For Text: allow single-click point text (tiny drag) placing
      if (editorState.selectedTool === 'text' && width <= 10 && height <= 10) {
        handleTextAdd({
          type: 'text',
          x: pos.x,
          y: pos.y,
          width: 400,
          height: 80,
          text: 'Lorem ipsum',
          fontSize: 28,
          fontFamily: 'Inter, system-ui, -apple-system, Arial',
          fill: '#111827',
          fontWeight: 400,
          fontStyle: 'normal',
          textDecoration: 'none',
          letterSpacing: 0,
          lineHeight: 1.2,
          align: 'left',
          verticalAlign: 'top',
          wrap: 'word',
          ellipsis: false,
          padding: 0,
          direction: 'ltr',
          rotation: 0,
          scaleX: 1,
          scaleY: 1,
          opacity: 1,
          visible: true,
          zIndex: 1,
          isSelected: false,
          isDragging: false,
          isResizing: false,
          isRotating: false,
          isCached: false,
          perfectDrawEnabled: true,
          listening: true,
          name: `Text ${elements.filter(e => e.type === 'text').length + 1}`,
          locked: false,
          isGrouped: false
        } as any);
      } else if (width > 10 || height > 10) {
        if (editorState.selectedTool === 'text') {
          handleTextAdd({
          type: 'text',
          x: x,
          y: y,
          width: Math.max(width, 100),
          height: Math.max(height, 30),
          text: 'Double-click to edit',
          fontSize: 24,
          fontFamily: 'Arial',
          fill: '#000000',
          fontWeight: 400,
          fontStyle: 'normal',
          textDecoration: 'none',
          letterSpacing: 0,
          lineHeight: 1.2,
          align: 'left',
          verticalAlign: 'top',
          wrap: 'word',
          ellipsis: false,
          padding: 0,
          direction: 'ltr',
          rotation: 0,
          scaleX: 1,
          scaleY: 1,
          opacity: 1,
          visible: true,
          zIndex: 1,
            isSelected: false,
          isDragging: false,
          isResizing: false,
          isRotating: false,
          isCached: false,
          perfectDrawEnabled: true,
          listening: true,
            name: `Text ${elements.filter(e => e.type === 'text').length + 1}`,
          locked: false,
          isGrouped: false
          } as any);
        } else if (editorState.selectedTool === 'shapes') {
        handleShapeAdd({
            type: currentShapeType as any,
          x: x,
          y: y,
          width: Math.max(width, 20),
          height: Math.max(height, 20),
          rotation: 0,
          scaleX: 1,
          scaleY: 1,
          opacity: 1,
          visible: true,
          zIndex: 1,
          isSelected: true,
          isDragging: false,
          isResizing: false,
          isRotating: false,
          fill: '#3B82F6',
          stroke: '#1E40AF',
          strokeWidth: 2,
          fillEnabled: true,
          strokeEnabled: true,
          cornerRadius: 0,
          isCached: false,
          perfectDrawEnabled: true,
          listening: true,
          boundaryState: {
            isWithinBounds: true,
            violationType: null
          },
          name: 'Rectangle',
          locked: false,
          isGrouped: false
        });
      } else if (editorState.selectedTool === 'gradient') {
          // Apply gradient to canvas background instead of creating a rect
          setCanvasBackground({
            type: 'linear',
          angle: 90,
          stops: [
              { color: '#FF0080', position: 0, opacity: 1 },
              { color: '#FFA500', position: 50, opacity: 1 },
              { color: '#00FF80', position: 100, opacity: 1 }
            ]
          });
        } else if ((editorState.selectedTool as any) === 'shapes') {
          // Tiny drag: drop default rectangle
          handleShapeAdd({
            type: currentShapeType as any,
            x: pos.x,
            y: pos.y,
            width: 120,
            height: 80,
          rotation: 0,
          scaleX: 1,
          scaleY: 1,
          opacity: 1,
          visible: true,
          zIndex: 1,
          isSelected: true,
          isDragging: false,
          isResizing: false,
          isRotating: false,
            fill: '#3B82F6',
            stroke: '#1E40AF',
            strokeWidth: 2,
            fillEnabled: true,
            strokeEnabled: true,
            cornerRadius: 0,
          isCached: false,
          perfectDrawEnabled: true,
          listening: true,
            boundaryState: { isWithinBounds: true, violationType: null },
            name: 'Rectangle',
          locked: false,
          isGrouped: false
        });
        }
      }

      setIsDragging(false);
      setIsCreating(false);
    } catch (error) {
      console.error('Error in handleMouseUp:', error);
    }
  }, [editorState.isPanning, editorState.selectedTool, isDragging, isCreating, dragStart, handleTextAdd, handleShapeAdd, screenToCanvasPoint]);

  // Handle element selection
  const handleElementSelect = useCallback((elementId: string) => {
    setEditorState(prev => ({
      ...prev,
      selectedElementIds: [elementId]
    }));
  }, []);

  // Wheel zoom to cursor
  const handleWheel = useCallback((e: any) => {
    const stage = stageRef.current;
    if (!stage) return;
    if (!(e.evt.ctrlKey || e.evt.metaKey)) {
      return;
    }
    e.evt.preventDefault();

    const scaleBy = 1.06;
    const oldScale = canvasState.zoom || 1;
    const pointer = stage.getPointerPosition();
    if (!pointer) return;
    const direction = e.evt.deltaY > 0 ? -1 : 1;
    const newScale = direction > 0 ? oldScale * scaleBy : oldScale / scaleBy;

    // Keep logical point under cursor fixed: screen = canvas*scale + pan
    const logical = { x: (pointer.x - canvasState.panX) / oldScale, y: (pointer.y - canvasState.panY) / oldScale };
    const newPanX = pointer.x - logical.x * newScale;
    const newPanY = pointer.y - logical.y * newScale;
    setCanvasState(prev => ({ ...prev, zoom: newScale, panX: newPanX, panY: newPanY }));
  }, [canvasState.zoom, canvasState.panX, canvasState.panY]);

  // Viewport sizing (edge-to-edge center area)
  const centerContainerRef = useRef<HTMLDivElement>(null);
  const [viewportSize, setViewportSize] = useState<{ width: number; height: number }>({ width: 0, height: 0 });

  useEffect(() => {
    const el = centerContainerRef.current;
    if (!el) return;
    const updateFromRect = () => {
      const rect = el.getBoundingClientRect();
      setViewportSize({ width: Math.floor(rect.width), height: Math.floor(rect.height) });
    };
    try {
      const RO = (window as any).ResizeObserver;
      if (typeof RO === 'function') {
        const ro = new RO((entries: any[]) => {
          const entry = entries[0];
          const cr = entry.contentRect;
          setViewportSize({ width: Math.floor(cr.width), height: Math.floor(cr.height) });
        });
        ro.observe(el);
        return () => ro.disconnect();
      }
    } catch {}
    // Fallback
    updateFromRect();
    window.addEventListener('resize', updateFromRect);
    return () => window.removeEventListener('resize', updateFromRect);
  }, []);

  // Center canvas within viewport when viewport changes (initial mount and resizes)
  useEffect(() => {
    if (viewportSize.width === 0 || viewportSize.height === 0) return;
    setCanvasState(prev => ({
      ...prev,
      panX: Math.round((viewportSize.width - prev.width) / 2),
      panY: Math.round((viewportSize.height - prev.height) / 2)
    }));
    const t = setTimeout(() => {
      setCanvasState(prev => ({
        ...prev,
        panX: Math.round((viewportSize.width - prev.width) / 2),
        panY: Math.round((viewportSize.height - prev.height) / 2)
      }));
    }, 150);
    return () => clearTimeout(t);
  }, [viewportSize.width, viewportSize.height]);

  // Force-center canvas on initial mount as well
  useEffect(() => {
    const stage = stageRef.current;
    if (!stage) return;
    setTimeout(() => {
      setCanvasState(prev => ({
        ...prev,
        panX: Math.round(((viewportSize.width || stage.width()) - prev.width) / 2),
        panY: Math.round(((viewportSize.height || stage.height()) - prev.height) / 2)
      }));
    }, 0);
  }, []);

  // Canvas background gradient state (applied to canvas Rect)
  const [canvasBackground, setCanvasBackground] = useState<null | {
    type: 'linear' | 'radial';
    angle: number; // for linear
    stops: Array<{ color: string; position: number; opacity?: number }>;
  }>(null);

  // On-canvas gradient handle (linear angle knob)
  const [showGradientHandle, setShowGradientHandle] = useState(false);
  const gradientHandleRadius = 8;
  const gradientHandleDistance = 60;
  const gradientCenter = useMemo(() => ({
    x: canvasState.width / 2,
    y: canvasState.height / 2
  }), [canvasState.width, canvasState.height]);

  const gradientHandlePos = useMemo(() => {
    if (!canvasBackground || canvasBackground.type !== 'linear') return null;
    const rad = (canvasBackground.angle * Math.PI) / 180;
    return {
      x: gradientCenter.x + Math.cos(rad) * gradientHandleDistance,
      y: gradientCenter.y + Math.sin(rad) * gradientHandleDistance
    };
  }, [canvasBackground, gradientCenter]);

  const onGradientHandleDrag = useCallback((pos: { x: number; y: number }) => {
    const dx = pos.x - gradientCenter.x;
    const dy = pos.y - gradientCenter.y;
    const angle = (Math.atan2(dy, dx) * 180) / Math.PI;
    setCanvasBackground(prev => prev ? { ...prev, angle } : prev);
  }, [gradientCenter]);

  const getLinearGradientPoints = useCallback((angleDeg: number, width: number, height: number) => {
    const angle = (angleDeg * Math.PI) / 180;
    const cx = width / 2;
    const cy = height / 2;
    const halfDiag = Math.sqrt(width * width + height * height) / 2;
    const dx = Math.cos(angle) * halfDiag;
    const dy = Math.sin(angle) * halfDiag;
    return {
      start: { x: cx - dx, y: cy - dy },
      end: { x: cx + dx, y: cy + dy }
    };
  }, []);

  // Import image helper (file -> dataURL -> add to canvas at pointer or center)
  const importImageFile = useCallback(async (file: File, clientPoint?: { x: number; y: number }) => {
    if (!file || !file.type.startsWith('image/')) return;
    const dataURL: string = await new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
    const imgDims = await new Promise<{ width: number; height: number }>((resolve) => {
      const img = new Image();
      img.onload = () => resolve({ width: img.width, height: img.height });
      img.src = dataURL;
    });
    const stage = stageRef.current;
    const pointer = clientPoint && stage ? clientPoint : stage?.getPointerPosition() || null;
    const logical = pointer ? screenToCanvasPoint(pointer) : { x: canvasState.width / 2 - imgDims.width / 2, y: canvasState.height / 2 - imgDims.height / 2 };
    handleImageAdd({
      type: 'image',
      x: logical.x,
      y: logical.y,
      width: imgDims.width,
      height: imgDims.height,
      rotation: 0,
      scaleX: 1,
      scaleY: 1,
      opacity: 1,
      visible: true,
      zIndex: 1,
      isSelected: true,
      isDragging: false,
      isResizing: false,
      isRotating: false,
      src: dataURL
    } as any);
  }, [canvasState.width, canvasState.height, handleImageAdd, screenToCanvasPoint]);

  // Paste-from-clipboard (images)
  useEffect(() => {
    const onPaste = async (e: ClipboardEvent) => {
      if (!e.clipboardData) return;
      const items = Array.from(e.clipboardData.items || []);
      const imageItem = items.find(it => it.type && it.type.startsWith('image/'));
      const file = imageItem?.getAsFile();
      if (file) {
        e.preventDefault();
        await importImageFile(file);
      }
    };
    document.addEventListener('paste', onPaste);
    return () => document.removeEventListener('paste', onPaste);
  }, [importImageFile]);

  if (error) {
    return (
      <div className="flex items-center justify-center h-screen bg-red-50">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-red-800 mb-2">Error Loading Advanced Image Editor</h2>
          <p className="text-red-600">{error}</p>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <React.Fragment>
        <div className="flex items-center justify-center h-screen bg-gray-50">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading Advanced Image Editor...</p>
          </div>
        </div>
      </React.Fragment>
    );
  }

  return (
    <div className="advanced-image-editor" style={{ width: '100vw', height: '100vh' }}>
      {/* Save toast (simple) */}
      {/* Note: page should include a toaster root; fallback inline toast shown here */}
      {/* Custom Toolbar */}
      <div className="custom-toolbar bg-gray-800 text-white p-3 flex items-center justify-between border-b border-gray-700">
        <div className="flex items-center space-x-4">
          <h1 className="text-xl font-bold">{title}</h1>
          
          {/* Menu System */}
          <div className="flex items-center space-x-1">
            <div className="relative group">
              <button className="px-3 py-1 hover:bg-gray-700 rounded text-sm">File</button>
              <div className="absolute top-full left-0 bg-gray-700 border border-gray-600 rounded shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
                <div className="py-1">
                  <button 
                    className="block w-full text-left px-4 py-2 hover:bg-gray-600 text-sm"
                    onClick={() => {
                      setElements([]);
                      setEditorState(prev => ({ ...prev, selectedElementIds: [] }));
                    }}
                  >
                    New
                  </button>
                  <button 
                    className="block w-full text-left px-4 py-2 hover:bg-gray-600 text-sm"
                    onClick={() => {
                      const input = document.createElement('input');
                      input.type = 'file';
                      input.accept = '.json';
                      input.onchange = (e) => {
                        const file = (e.target as HTMLInputElement).files?.[0];
                        if (file) {
                          const reader = new FileReader();
                          reader.onload = (e) => {
                            try {
                              const data = JSON.parse(e.target?.result as string);
                              setElements(data.elements || []);
                            } catch (error) {
                              console.error('Error loading file:', error);
                            }
                          };
                          reader.readAsText(file);
                        }
                      };
                      input.click();
                    }}
                  >
                    Open
                  </button>
                  <button 
                    className="block w-full text-left px-4 py-2 hover:bg-gray-600 text-sm"
                    onClick={() => {
                      const input = document.createElement('input');
                      input.type = 'file';
                      input.accept = 'image/*';
                      input.onchange = async (e) => {
                        const file = (e.target as HTMLInputElement).files?.[0];
                        if (file) {
                          await importImageFile(file);
                        }
                      };
                      input.click();
                    }}
                  >
                    Import Image
                  </button>
                  <button 
                    className="block w-full text-left px-4 py-2 hover:bg-gray-600 text-sm"
                    onClick={() => saveCanvas()}
                  >
                    Save
                  </button>
                  <button 
                    className="block w-full text-left px-4 py-2 hover:bg-gray-600 text-sm"
                    onClick={() => {
                      const stage = stageRef.current;
                      if (stage) {
                        const dataURL = stage.toDataURL({ pixelRatio: 2 });
                        const link = document.createElement('a');
                        link.download = 'canvas-export.png';
                        link.href = dataURL;
                        link.click();
                      }
                    }}
                  >
                    Export
                  </button>
                </div>
              </div>
            </div>
            
            <div className="relative group">
              <button className="px-3 py-1 hover:bg-gray-700 rounded text-sm">Edit</button>
              <div className="absolute top-full left-0 bg-gray-700 border border-gray-600 rounded shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
                <div className="py-1">
                  <button 
                    className="block w-full text-left px-4 py-2 hover:bg-gray-600 text-sm"
                    onClick={() => undo()}
                  >
                    Undo
                  </button>
                  <button 
                    className="block w-full text-left px-4 py-2 hover:bg-gray-600 text-sm"
                    onClick={() => redo()}
                  >
                    Redo
                  </button>
                  <button 
                    className="block w-full text-left px-4 py-2 hover:bg-gray-600 text-sm"
                    onClick={() => copySelectedElements()}
                  >
                    Copy
                  </button>
                  <button 
                    className="block w-full text-left px-4 py-2 hover:bg-gray-600 text-sm"
                    onClick={() => pasteElements()}
                  >
                    Paste
                  </button>
                </div>
              </div>
            </div>
            
            <div className="relative group">
              <button className="px-3 py-1 hover:bg-gray-700 rounded text-sm">Tools</button>
              <div className="absolute top-full left-0 bg-gray-700 border border-gray-600 rounded shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
                <div className="py-1">
                  <button 
                    className="block w-full text-left px-4 py-2 hover:bg-gray-600 text-sm"
                    onClick={() => setEditorState(prev => ({ ...prev, selectedTool: 'text' }))}
                  >
                    Text Tool
                  </button>
                  <button 
                    className="block w-full text-left px-4 py-2 hover:bg-gray-600 text-sm"
                    onClick={() => setEditorState(prev => ({ ...prev, selectedTool: 'shapes' }))}
                  >
                    Shape Tool
                  </button>
                  <button 
                    className="block w-full text-left px-4 py-2 hover:bg-gray-600 text-sm"
                    onClick={() => setEditorState(prev => ({ ...prev, selectedTool: 'gradient' }))}
                  >
                    Gradient Tool
                  </button>
                  <button 
                    className="block w-full text-left px-4 py-2 hover:bg-gray-600 text-sm"
                    onClick={() => setEditorState(prev => ({ ...prev, selectedTool: 'images' }))}
                  >
                    Image Tool
                  </button>
                </div>
              </div>
            </div>

            {/* Canvas Size Presets */}
            <div className="flex items-center ml-4 space-x-2">
              <span className="text-xs text-gray-300">Canvas</span>
              <button
                className="px-2 py-1 bg-gray-700 hover:bg-gray-600 rounded text-xs"
                title="1080×1080"
                onClick={() => setCanvasState(prev => ({ ...prev, width: 1080, height: 1080 }))}
              >
                1:1
              </button>
              <button
                className="px-2 py-1 bg-gray-700 hover:bg-gray-600 rounded text-xs"
                title="1080×1920"
                onClick={() => setCanvasState(prev => ({ ...prev, width: 1080, height: 1920 }))}
              >
                9:16
              </button>
              <button
                className="px-2 py-1 bg-gray-700 hover:bg-gray-600 rounded text-xs"
                title="1920×1080"
                onClick={() => setCanvasState(prev => ({ ...prev, width: 1920, height: 1080 }))}
              >
                16:9
              </button>
            </div>

            {/* Top Properties Bar - common properties for selected element */}
            <div className="ml-6 flex items-center space-x-2 text-xs">
              {editorState.selectedElementIds.length === 1 && (
                <>
                  <span className="text-gray-300">X</span>
                  <input className="w-16 bg-gray-700 rounded px-2 py-1" type="number" value={elements.find(e=> e.id===editorState.selectedElementIds[0])?.x || 0} onChange={(e)=>{
                    const id=editorState.selectedElementIds[0];
                    const x=parseFloat(e.target.value);
                    setElements(prev=>prev.map(el=> el.id===id? { ...el, x }: el));
                  }} />
                  <span className="text-gray-300">Y</span>
                  <input className="w-16 bg-gray-700 rounded px-2 py-1" type="number" value={elements.find(e=> e.id===editorState.selectedElementIds[0])?.y || 0} onChange={(e)=>{
                    const id=editorState.selectedElementIds[0];
                    const y=parseFloat(e.target.value);
                    setElements(prev=>prev.map(el=> el.id===id? { ...el, y }: el));
                  }} />
                  <span className="text-gray-300">W</span>
                  <input className="w-16 bg-gray-700 rounded px-2 py-1" type="number" value={elements.find(e=> e.id===editorState.selectedElementIds[0])?.width || 0} onChange={(e)=>{
                    const id=editorState.selectedElementIds[0];
                    const width=parseFloat(e.target.value);
                    setElements(prev=>prev.map(el=> el.id===id? { ...el, width }: el));
                  }} />
                  <span className="text-gray-300">H</span>
                  <input className="w-16 bg-gray-700 rounded px-2 py-1" type="number" value={elements.find(e=> e.id===editorState.selectedElementIds[0])?.height || 0} onChange={(e)=>{
                    const id=editorState.selectedElementIds[0];
                    const height=parseFloat(e.target.value);
                    setElements(prev=>prev.map(el=> el.id===id? { ...el, height }: el));
                  }} />
                  <input className="w-20 bg-gray-700 rounded px-2 py-1" type="color" value={(elements.find(e=> e.id===editorState.selectedElementIds[0]) as any)?.fill || '#000000'} onChange={(e)=>{
                    const id=editorState.selectedElementIds[0];
                    const fill=e.target.value;
                    setElements(prev=>prev.map(el=> el.id===id? { ...el, fill }: el));
                  }} />
                  <input className="w-16 bg-gray-700 rounded px-2 py-1" type="number" min={0} max={1} step={0.1} value={elements.find(e=> e.id===editorState.selectedElementIds[0])?.opacity ?? 1} onChange={(e)=>{
                    const id=editorState.selectedElementIds[0];
                    const opacity=parseFloat(e.target.value);
                    setElements(prev=>prev.map(el=> el.id===id? { ...el, opacity }: el));
                  }} />
                </>
              )}
            </div>
          </div>
          
          {/* Tool Selection */}
          <div className="flex items-center space-x-2">
            <button
              className={`p-2 rounded ${editorState.selectedTool === 'select' ? 'bg-blue-600' : 'bg-gray-600 hover:bg-gray-500'}`}
              onClick={() => setEditorState(prev => ({ ...prev, selectedTool: 'select' }))}
              title="Select Tool (V)"
            >
              <MousePointer className="w-5 h-5" />
            </button>
            <button
              className={`p-2 rounded ${editorState.selectedTool === 'text' ? 'bg-blue-600' : 'bg-gray-600 hover:bg-gray-500'}`}
              onClick={() => setEditorState(prev => ({ ...prev, selectedTool: 'text' }))}
              title="Text Tool (T)"
            >
              <Type className="w-5 h-5" />
            </button>
            <button
              className={`p-2 rounded ${editorState.selectedTool === 'shapes' ? 'bg-blue-600' : 'bg-gray-600 hover:bg-gray-500'}`}
              onClick={() => setEditorState(prev => ({ ...prev, selectedTool: 'shapes' }))}
              title="Shapes Tool (S)"
            >
              <Square className="w-5 h-5" />
            </button>
            <button
              className={`p-2 rounded ${editorState.selectedTool === 'images' ? 'bg-blue-600' : 'bg-gray-600 hover:bg-gray-500'}`}
              onClick={() => setEditorState(prev => ({ ...prev, selectedTool: 'images' }))}
              title="Images Tool (I)"
            >
              <ImageIcon className="w-5 h-5" />
            </button>
            <button
              className={`p-2 rounded ${editorState.selectedTool === 'grid' ? 'bg-blue-600' : 'bg-gray-600 hover:bg-gray-500'}`}
              onClick={() => setEditorState(prev => ({ ...prev, selectedTool: 'grid' }))}
              title="Grid & Snap Tool (G)"
            >
              <Grid3X3 className="w-5 h-5" />
            </button>
            <button
              className={`p-2 rounded ${editorState.selectedTool === 'gradient' ? 'bg-blue-600' : 'bg-gray-600 hover:bg-gray-500'}`}
              onClick={() => setEditorState(prev => ({ ...prev, selectedTool: 'gradient' }))}
              title="Gradient Tool (D)"
            >
              <Palette className="w-5 h-5" />
            </button>
            <button
              className={`p-2 rounded ${editorState.selectedTool === 'crop' ? 'bg-blue-600' : 'bg-gray-600 hover:bg-gray-500'}`}
              onClick={() => setEditorState(prev => ({ ...prev, selectedTool: 'crop' }))}
              title="Crop Tool (C)"
            >
              <Crop className="w-5 h-5" />
            </button>
            <button
              className={`p-2 rounded ${editorState.selectedTool === 'resize' ? 'bg-blue-600' : 'bg-gray-600 hover:bg-gray-500'}`}
              onClick={() => setEditorState(prev => ({ ...prev, selectedTool: 'resize' }))}
              title="Resize Tool (R)"
            >
              <RotateCw className="w-5 h-5" />
            </button>
            <button
              className={`p-2 rounded ${editorState.selectedTool === 'animation' ? 'bg-blue-600' : 'bg-gray-600 hover:bg-gray-500'}`}
              onClick={() => setEditorState(prev => ({ ...prev, selectedTool: 'animation' }))}
              title="Animation Tool (A)"
            >
              <Play className="w-5 h-5" />
            </button>
            
                 {/* Performance Optimization Buttons */}
                 <div className="w-px h-8 bg-gray-500 mx-2"></div>
                 <button
                   className="p-2 rounded bg-green-600 hover:bg-green-500"
                   onClick={cacheAllElements}
                   title="Cache All Elements (Performance)"
                 >
                   <Layers className="w-5 h-5" />
                 </button>
                 <button
                   className="p-2 rounded bg-red-600 hover:bg-red-500"
                   onClick={uncacheAllElements}
                   title="Uncache All Elements"
                 >
                   <Layers className="w-5 h-5" />
                 </button>
                 
                 {/* Advanced Features Buttons */}
                 <div className="w-px h-8 bg-gray-500 mx-2"></div>
                 <button
                   className="p-2 rounded bg-purple-600 hover:bg-purple-500"
                   onClick={() => {
                     // Create a simple mask example
                     const stage = getStage();
                     if (stage) {
                       const rect = new Konva.Rect({
                         x: 100,
                         y: 100,
                         width: 200,
                         height: 200,
                         fill: 'blue',
                         id: 'mask-target'
                       });
                       const circle = new Konva.Circle({
                         x: 200,
                         y: 200,
                         radius: 100,
                         fill: 'red',
                         id: 'mask-shape'
                       });
                       const layer = getLayer();
                       if (layer) {
                          (layer as any).add(rect);
                          (layer as any).add(circle);
                         createMask('mask-target', 'mask-shape');
                          (stage as any).batchDraw();
                       }
                     }
                   }}
                   title="Create Mask Example"
                 >
                   <Square className="w-5 h-5" />
                 </button>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center space-x-2">
          <button
            className="p-2 bg-gray-600 hover:bg-gray-500 rounded"
            onClick={undo}
            disabled={editorState.historyIndex <= 0}
            title="Undo (Ctrl+Z)"
          >
            <Undo2 className="w-5 h-5" />
          </button>
          <button
            className="p-2 bg-gray-600 hover:bg-gray-500 rounded"
            onClick={redo}
            disabled={editorState.historyIndex >= editorState.history.length - 1}
            title="Redo (Ctrl+Shift+Z)"
          >
            <Redo2 className="w-5 h-5" />
          </button>
          <button
            className="p-2 bg-gray-600 hover:bg-gray-500 rounded"
            onClick={saveCanvas}
            title="Save (Ctrl+S)"
          >
            <Save className="w-5 h-5" />
          </button>
          <button
            className="p-2 bg-gray-600 hover:bg-gray-500 rounded"
            onClick={onClose}
            title="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Main Editor Area */}
      <div className="flex h-full flex-col">
        {/* Canvas + sidebars row */}
        <div className="flex flex-1 min-h-0">
          {/* Left Vertical Toolbar */}
          <div className="w-16 bg-gray-800 text-white p-3 space-y-3 border-r border-gray-700">
            <div className="text-xs text-gray-400 text-center mb-2">Tools</div>
            <button className={`w-full h-10 flex items-center justify-center rounded ${editorState.selectedTool === 'select' ? 'bg-blue-600' : 'bg-gray-700 hover:bg-gray-600'}`} title="Select (V)" onClick={() => setEditorState(prev => ({ ...prev, selectedTool: 'select' }))}><MousePointer className="w-4 h-4" /></button>
            <button className={`w-full h-10 flex items-center justify-center rounded ${editorState.selectedTool === 'move' ? 'bg-blue-600' : 'bg-gray-700 hover:bg-gray-600'}`} title="Pan/Move (Space)" onClick={() => setEditorState(prev => ({ ...prev, selectedTool: 'move' }))}><Hand className="w-4 h-4" /></button>
            <button className={`w-full h-10 flex items-center justify-center rounded ${editorState.selectedTool === 'text' ? 'bg-blue-600' : 'bg-gray-700 hover:bg-gray-600'}`} title="Text (T)" onClick={() => setEditorState(prev => ({ ...prev, selectedTool: 'text' }))}><Type className="w-4 h-4" /></button>
            <button className={`w-full h-10 flex items-center justify-center rounded ${editorState.selectedTool === 'images' ? 'bg-blue-600' : 'bg-gray-700 hover:bg-gray-600'}`} title="Images (I)" onClick={() => setEditorState(prev => ({ ...prev, selectedTool: 'images' }))}><ImageIcon className="w-4 h-4" /></button>
            <div className="relative"
                 onMouseLeave={() => setShowShapePopover(false)}>
              <button
                className={`w-full h-10 flex items-center justify-center rounded ${editorState.selectedTool === 'shapes' ? 'bg-blue-600' : 'bg-gray-700 hover:bg-gray-600'}`}
                title="Shapes (S)"
                onMouseDown={(e) => {
                  // long-press opens popover
                  const timeout = setTimeout(() => setShowShapePopover(true), 450);
                  const clear = () => { clearTimeout(timeout as any); document.removeEventListener('mouseup', clear); };
                  document.addEventListener('mouseup', clear);
                }}
                onClick={() => setEditorState(prev => ({ ...prev, selectedTool: 'shapes' }))}
              >
                <Square className="w-4 h-4" />
              </button>
              {showShapePopover && (
                <div className="absolute left-12 top-0 z-50 bg-gray-800 border border-gray-700 rounded p-2 grid grid-cols-3 gap-2 w-36">
                  {[
                    { t: 'rect', label: 'Rect' },
                    { t: 'circle', label: 'Circle' },
                    { t: 'line', label: 'Line' },
                    { t: 'arrow', label: 'Arrow' },
                    { t: 'star', label: 'Star' },
                    { t: 'regularPolygon', label: 'Poly' },
                    { t: 'wedge', label: 'Wedge' },
                    { t: 'ring', label: 'Ring' },
                    { t: 'arc', label: 'Arc' }
                  ].map((s) => (
                    <button key={s.t}
                      className={`text-xs px-2 py-1 rounded ${currentShapeType === (s.t as any) ? 'bg-blue-600' : 'bg-gray-700 hover:bg-gray-600'}`}
                      onClick={() => { setCurrentShapeType(s.t as any); setShowShapePopover(false); }}
                    >{s.label}</button>
                  ))}
                </div>
              )}
            </div>
            <button className={`w-full h-10 flex items-center justify-center rounded ${editorState.selectedTool === 'gradient' ? 'bg-blue-600' : 'bg-gray-700 hover:bg-gray-600'}`} title="Gradient (D)" onClick={() => setEditorState(prev => ({ ...prev, selectedTool: 'gradient' }))}><Palette className="w-4 h-4" /></button>
            <button className={`w-full h-10 flex items-center justify-center rounded ${editorState.selectedTool === 'crop' ? 'bg-blue-600' : 'bg-gray-700 hover:bg-gray-600'}`} title="Crop (C)" onClick={() => setEditorState(prev => ({ ...prev, selectedTool: 'crop' }))}><Crop className="w-4 h-4" /></button>
            <button className={`w-full h-10 flex items-center justify-center rounded ${editorState.selectedTool === 'animation' ? 'bg-blue-600' : 'bg-gray-700 hover:bg-gray-600'}`} title="Animation (Cmd+~)" onClick={() => setEditorState(prev => ({ ...prev, selectedTool: 'animation' }))}><Play className="w-4 h-4" /></button>
          </div>
          
          {/* Left Properties Panel (contextual) - now top bar handles most; keep slim area empty for now */}
          
          {/* Right Sidebar - Layers/Properties */}
          <div className="flex-1 flex min-w-0">
            {/* Center - Konva Canvas */}
            <div
              ref={centerContainerRef}
              className="flex-1 relative bg-gray-900 flex items-center justify-center"
              onDragOver={(e) => { if (e.dataTransfer?.types?.includes('Files')) { e.preventDefault(); } }}
              onDrop={async (e) => {
                if (!e.dataTransfer?.files?.length) return;
                e.preventDefault();
                const file = Array.from(e.dataTransfer.files).find(f => f.type.startsWith('image/'));
                if (file) {
                  await importImageFile(file, { x: e.clientX, y: e.clientY });
                }
              }}
            >
              {/* Canvas Container with Visual Context */}
              <div className="relative bg-white rounded-lg shadow-2xl border-2 border-gray-300 overflow-hidden">
                {/* Canvas Info Bar */}
                <div className="absolute top-0 left-0 right-0 bg-gray-100 border-b border-gray-300 px-3 py-1 text-xs text-gray-600 flex justify-between items-center z-10">
                  <div className="flex items-center space-x-4">
                    <span>Canvas: {canvasState.width} × {canvasState.height}px</span>
                    <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded">
                      {editorState.selectedTool.charAt(0).toUpperCase() + editorState.selectedTool.slice(1)} Tool
                    </span>
                  </div>
                  <span>Zoom: {Math.round(canvasState.zoom * 100)}%</span>
                </div>
              <Stage
                ref={stageRef}
                width={viewportSize.width || canvasState.width}
                height={viewportSize.height || canvasState.height}
                onClick={handleStageClick}
                onMouseDown={handleMouseDown}
                onMouseMove={handleMouseMove}
                onMouseUp={handleMouseUp}
                onWheel={handleWheel}
                style={{ cursor: getCursorStyle() }}
              >
                <Layer>
                  <Group x={canvasState.panX} y={canvasState.panY} scaleX={canvasState.zoom} scaleY={canvasState.zoom}>
                    {/* Background */}
                    <Rect
                      x={0}
                      y={0}
                      width={canvasState.width}
                      height={canvasState.height}
                      fill={canvasBackground ? undefined : '#FFFFFF'}
                      // Linear gradient applied when set
                      fillLinearGradientStartPoint={canvasBackground && canvasBackground.type === 'linear' ? getLinearGradientPoints(canvasBackground.angle, canvasState.width, canvasState.height).start : undefined}
                      fillLinearGradientEndPoint={canvasBackground && canvasBackground.type === 'linear' ? getLinearGradientPoints(canvasBackground.angle, canvasState.width, canvasState.height).end : undefined}
                      fillLinearGradientColorStops={canvasBackground && canvasBackground.type === 'linear' ? canvasBackground.stops.flatMap(s => [s.position / 100, s.color]) : undefined}
                    />
                    {/* Gradient angle handle */}
                    {canvasBackground && canvasBackground.type === 'linear' && gradientHandlePos && (
                      <Group
                        x={gradientHandlePos.x}
                        y={gradientHandlePos.y}
                        draggable
                        onDragMove={(e) => {
                          const p = e.target.getAbsolutePosition();
                          onGradientHandleDrag({ x: p.x - canvasState.panX, y: p.y - canvasState.panY });
                        }}
                      >
                        <Circle radius={gradientHandleRadius} fill="#10B981" stroke="#064E3B" strokeWidth={2} />
                      </Group>
                    )}
                    {/* ... existing code ... */}
                  </Group>
                </Layer>
              </Stage>
              </div>
            </div>

            {/* Right Layers panel - Wider for better content visibility */}
            <div className="w-80 bg-gray-700 text-white border-l border-gray-600 overflow-y-auto">
              <div className="p-4">
              <LayerManager
                ref={layerManagerRef}
                layers={elements}
                onLayerReorder={handleLayerReorder}
                onLayerToggle={handleLayerToggle}
                onLayerLock={(id, locked) => {
                  setElements(prev => prev.map(el => 
                    el.id === id ? { ...el, locked } : el
                  ));
                }}
                onLayerSelect={handleElementSelect}
                onLayerDelete={(id) => {
                  setElements(prev => prev.filter(el => el.id !== id));
                  setEditorState(prev => ({
                    ...prev,
                    selectedElementIds: prev.selectedElementIds.filter(elId => elId !== id)
                  }));
                }}
                onLayerDuplicate={(id) => {
                  const element = elements.find(el => el.id === id);
                  if (element) {
                    const duplicatedElement = {
                      ...element,
                      id: `${element.type}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
                      x: element.x + 20,
                      y: element.y + 20,
                      isSelected: true
                    } as any;
                    setElements(prev => [...prev, duplicatedElement]);
                    setEditorState(prev => ({
                      ...prev,
                      selectedElementIds: [duplicatedElement.id]
                    }));
                  }
                }}
                onLayerGroup={(ids) => { console.log('Grouping layers:', ids); }}
                onLayerUngroup={(groupId) => { console.log('Ungrouping layer:', groupId); }}
                selectedElementIds={editorState.selectedElementIds}
                onElementSelect={handleElementSelect}
              />
              </div>
            </div>
          </div>
          {/* Always show Text Tool */}
          <div className={`mb-4 p-3 rounded cursor-pointer hover:bg-gray-500 transition-colors ${editorState.selectedTool === 'text' ? 'bg-blue-600' : 'bg-gray-600'}`}
               onClick={() => setEditorState(prev => ({ ...prev, selectedTool: 'text' }))}>
            <div className="flex items-center mb-2">
              <Type className="w-5 h-5 mr-2" />
              <h3 className="font-semibold">Text Tool</h3>
            </div>
            {editorState.selectedTool === 'text' && (
              <TextTool
                ref={textToolRef}
                onTextAdd={handleTextAdd}
                onTextUpdate={handleTextUpdate}
                onTextDelete={handleTextDelete}
                canvasState={canvasState}
                selectedTextElement={elements.find(el => el.type === 'text' && editorState.selectedElementIds.includes(el.id)) as TextElement}
              />
            )}
          </div>
          
          {/* Always show Shape Tool */}
          <div className={`mb-4 p-3 rounded cursor-pointer hover:bg-gray-500 transition-colors ${editorState.selectedTool === 'shapes' ? 'bg-blue-600' : 'bg-gray-600'}`}
               onClick={() => setEditorState(prev => ({ ...prev, selectedTool: 'shapes' }))}>
            <div className="flex items-center mb-2">
              <Square className="w-5 h-5 mr-2" />
              <h3 className="font-semibold">Shape Tool</h3>
            </div>
            {editorState.selectedTool === 'shapes' && (
              <ShapeTool
                ref={shapeToolRef}
                onShapeAdd={handleShapeAdd}
                onShapeUpdate={handleShapeUpdate}
                onShapeDelete={handleShapeDelete}
                canvasState={canvasState}
                selectedShapeElement={elements.find(el => el.type !== 'text' && el.type !== 'image' && el.type !== 'gradient' && el.type !== 'group' && editorState.selectedElementIds.includes(el.id)) as any}
              />
            )}
          </div>
          
          {/* Always show Image Tool */}
          <div className={`mb-4 p-3 rounded cursor-pointer hover:bg-gray-500 transition-colors ${editorState.selectedTool === 'images' ? 'bg-blue-600' : 'bg-gray-600'}`}
               onClick={() => setEditorState(prev => ({ ...prev, selectedTool: 'images' }))}>
            <div className="flex items-center mb-2">
              <ImageIcon className="w-5 h-5 mr-2" />
              <h3 className="font-semibold">Image Tool</h3>
            </div>
            {editorState.selectedTool === 'images' && (
              <ImageTool
                ref={imageToolRef}
                onImageAdd={handleImageAdd as any}
                onImageUpdate={handleImageUpdate as any}
                onImageDelete={handleImageDelete as any}
                canvasState={canvasState}
                selectedImageElement={elements.find(el => el.type === 'image' && editorState.selectedElementIds.includes(el.id)) as any}
              />
            )}
          </div>

          {editorState.selectedTool === 'grid' && (
            <GridSnapTool
              ref={gridSnapToolRef}
              canvasWidth={canvasState.width}
              canvasHeight={canvasState.height}
              zoom={canvasState.zoom}
              panX={canvasState.panX}
              panY={canvasState.panY}
              elements={elements}
              onSnapToGrid={snapToGrid}
              onSnapToGuides={snapToGuides}
              onSnapToElements={snapToElements}
              onGridConfigChange={handleGridConfigChange}
              onGuideAdd={handleGuideAdd}
              onGuideRemove={handleGuideRemove}
              onGuideUpdate={handleGuideUpdate}
              onMeasurementAdd={handleMeasurementAdd}
              onMeasurementRemove={handleMeasurementRemove}
              onMeasurementUpdate={handleMeasurementUpdate}
            />
          )}
          
          {/* Always show Gradient Tool */}
          <div className={`mb-4 p-3 rounded cursor-pointer hover:bg-gray-500 transition-colors ${editorState.selectedTool === 'gradient' ? 'bg-blue-600' : 'bg-gray-600'}`}
               onClick={() => setEditorState(prev => ({ ...prev, selectedTool: 'gradient' }))}>
            <div className="flex items-center mb-2">
              <Palette className="w-5 h-5 mr-2" />
              <h3 className="font-semibold">Gradient Tool</h3>
            </div>
            {editorState.selectedTool === 'gradient' && (
              <GradientTool
                ref={gradientToolRef}
                onGradientAdd={handleGradientAdd}
                onGradientUpdate={handleGradientUpdate}
                onGradientDelete={() => {}}
                canvasState={canvasState}
                selectedGradientElement={elements.find(el => el.type === 'gradient' && editorState.selectedElementIds.includes(el.id)) as GradientElement}
              />
            )}
          </div>
          
          {editorState.selectedTool === 'crop' && (
            <CropTool
              ref={cropToolRef}
              onCrop={handleCrop}
              selectedElementIds={editorState.selectedElementIds}
              elements={elements}
              canvasState={canvasState}
            />
          )}
          
          {editorState.selectedTool === 'resize' && (
            <ResizeTransformTool
              ref={resizeTransformToolRef}
              onResize={handleResize}
              onTransform={handleTransform}
              selectedElementIds={editorState.selectedElementIds}
              elements={elements}
              canvasState={canvasState}
            />
          )}

          {editorState.selectedTool === 'animation' && (
            <AnimationTool
              selectedElementIds={editorState.selectedElementIds}
              elements={elements}
              onAnimationUpdate={(animationId, updates) => {
                // Handle animation updates
                console.log('Animation update:', animationId, updates);
              }}
              onAnimationCreate={(animation) => {
                // Handle animation creation
                console.log('Animation created:', animation);
              }}
              onAnimationDelete={(animationId) => {
                // Handle animation deletion
                console.log('Animation deleted:', animationId);
              }}
              onAnimationPlay={(animationId) => {
                // Handle animation play
                console.log('Animation play:', animationId);
              }}
              onAnimationPause={(animationId) => {
                // Handle animation pause
                console.log('Animation pause:', animationId);
              }}
              onAnimationStop={(animationId) => {
                // Handle animation stop
                console.log('Animation stop:', animationId);
              }}
            />
          )}

          {/* Layer Manager */}
          <LayerManager
            ref={layerManagerRef}
            layers={elements}
            onLayerReorder={handleLayerReorder}
            onLayerToggle={handleLayerToggle}
            onLayerLock={(id, locked) => {
              setElements(prev => prev.map(el => 
                el.id === id ? { ...el, locked } : el
              ));
            }}
            onLayerSelect={handleElementSelect}
            onLayerDelete={(id) => {
              setElements(prev => prev.filter(el => el.id !== id));
              setEditorState(prev => ({
                ...prev,
                selectedElementIds: prev.selectedElementIds.filter(elId => elId !== id)
              }));
            }}
            onLayerDuplicate={(id) => {
              const element = elements.find(el => el.id === id);
              if (element) {
                const duplicatedElement = {
                  ...element,
                  id: `${element.type}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
                  x: element.x + 20,
                  y: element.y + 20,
                  isSelected: true
                };
                setElements(prev => [...prev, duplicatedElement]);
                setEditorState(prev => ({
                  ...prev,
                  selectedElementIds: [duplicatedElement.id]
                }));
              }
            }}
            onLayerGroup={(ids) => {
              // Group implementation would go here
              console.log('Grouping layers:', ids);
            }}
            onLayerUngroup={(groupId) => {
              // Ungroup implementation would go here
              console.log('Ungrouping layer:', groupId);
            }}
            selectedElementIds={editorState.selectedElementIds}
            onElementSelect={handleElementSelect}
          />
        </div>

        {/* Center - Konva Canvas */}
        <div
          ref={centerContainerRef}
          className="flex-1 relative bg-gray-900"
          onDragOver={(e) => { if (e.dataTransfer?.types?.includes('Files')) { e.preventDefault(); } }}
          onDrop={async (e) => {
            if (!e.dataTransfer?.files?.length) return;
            e.preventDefault();
            const file = Array.from(e.dataTransfer.files).find(f => f.type.startsWith('image/'));
            if (file) {
              await importImageFile(file, { x: e.clientX, y: e.clientY });
            }
          }}
        >
          <Stage
            ref={stageRef}
            width={viewportSize.width || canvasState.width}
            height={viewportSize.height || canvasState.height}
            onClick={handleStageClick}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onWheel={handleWheel}
            style={{ cursor: getCursorStyle() }}
          >
            <Layer>
              <Group x={canvasState.panX} y={canvasState.panY} scaleX={canvasState.zoom} scaleY={canvasState.zoom}>
              {/* Background */}
              <Rect
                x={0}
                y={0}
                width={canvasState.width}
                height={canvasState.height}
                  fill={canvasBackground ? undefined : '#FFFFFF'}
                  // Linear gradient applied when set
                  fillLinearGradientStartPoint={canvasBackground && canvasBackground.type === 'linear' ? getLinearGradientPoints(canvasBackground.angle, canvasState.width, canvasState.height).start : undefined}
                  fillLinearGradientEndPoint={canvasBackground && canvasBackground.type === 'linear' ? getLinearGradientPoints(canvasBackground.angle, canvasState.width, canvasState.height).end : undefined}
                  fillLinearGradientColorStops={canvasBackground && canvasBackground.type === 'linear' ? canvasBackground.stops.flatMap(s => [s.position / 100, s.color]) as any : undefined}
                  stroke="#374151"
                  strokeWidth={1}
                listening={false}
              />
              {/* Drag Preview */}
                {isDragging && isCreating && (editorState.selectedTool === 'crop' || editorState.selectedTool === 'gradient') && (
                <Rect
                  x={Math.min(dragStart.x, dragCurrent.x)}
                  y={Math.min(dragStart.y, dragCurrent.y)}
                  width={Math.abs(dragCurrent.x - dragStart.x)}
                  height={Math.abs(dragCurrent.y - dragStart.y)}
                  stroke={editorState.selectedTool === 'gradient' ? '#FF6B6B' : '#3B82F6'}
                  strokeWidth={2}
                  dash={[5, 5]}
                  fill={editorState.selectedTool === 'gradient' ? 'rgba(255, 107, 107, 0.1)' : 'rgba(59, 130, 246, 0.1)'}
                />
              )}

              {/* Crosshair Cursor for Gradient Tool */}
              {editorState.selectedTool === 'gradient' && !isDragging && (
                <Line
                  points={[dragCurrent.x - 10, dragCurrent.y, dragCurrent.x + 10, dragCurrent.y]}
                  stroke="#FF6B6B"
                  strokeWidth={1}
                />
              )}
              {editorState.selectedTool === 'gradient' && !isDragging && (
                <Line
                  points={[dragCurrent.x, dragCurrent.y - 10, dragCurrent.x, dragCurrent.y + 10]}
                  stroke="#FF6B6B"
                  strokeWidth={1}
                />
              )}

                 {/* Render Text Elements */}
                 {elements.filter(el => el.type === 'text').map((element) => {
                   const textElement = element as TextElement;
                   
                   // Check if this is a TextPath element
                   if (textElement.textPath) {
                     return (
                       <TextPath
                         key={element.id}
                        id={element.id}
                         x={textElement.x}
                         y={textElement.y}
                         text={textElement.text}
                         data={textElement.textPath}
                         fontSize={textElement.fontSize}
                         fontFamily={textElement.fontFamily}
                         fill={textElement.fill}
                         fontWeight={textElement.fontWeight}
                         fontStyle={textElement.fontStyle}
                         textDecoration={textElement.textDecoration}
                         letterSpacing={textElement.letterSpacing}
                         lineHeight={textElement.lineHeight}
                         align={textElement.align}
                         verticalAlign={textElement.verticalAlign}
                         wrap={textElement.wrap}
                         ellipsis={textElement.ellipsis}
                         padding={textElement.padding}
                         direction={textElement.direction}
                         rotation={textElement.rotation}
                         scaleX={textElement.scaleX}
                         scaleY={textElement.scaleY}
                         opacity={textElement.opacity}
                         visible={textElement.visible}
                         zIndex={textElement.zIndex}
                         draggable
                         onClick={(e) => {
                           e.cancelBubble = true;
                           handleElementSelect(element.id);
                         }}
                         onDblClick={(e) => {
                           e.cancelBubble = true;
                           const textNode = e.target;
                           const stage = textNode.getStage();
                           if (!stage) return;
                           const textPosition = textNode.absolutePosition();
                           const container = stage.container();
                           const textInput = document.createElement('textarea');
                           textInput.value = textElement.text;
                           textInput.style.position = 'absolute';
                           textInput.style.top = textPosition.y + 'px';
                           textInput.style.left = textPosition.x + 'px';
                           textInput.style.width = textElement.width + 'px';
                           textInput.style.height = textElement.height + 'px';
                           textInput.style.fontSize = textElement.fontSize + 'px';
                           textInput.style.fontFamily = textElement.fontFamily;
                           textInput.style.fontWeight = textElement.fontWeight.toString();
                           textInput.style.fontStyle = textElement.fontStyle;
                           textInput.style.textDecoration = textElement.textDecoration;
                           textInput.style.letterSpacing = textElement.letterSpacing + 'px';
                           textInput.style.lineHeight = textElement.lineHeight.toString();
                           textInput.style.textAlign = textElement.align;
                           textInput.style.color = textElement.fill;
                           textInput.style.background = 'transparent';
                           textInput.style.border = 'none';
                           textInput.style.outline = 'none';
                           textInput.style.resize = 'none';
                           textInput.style.overflow = 'hidden';
                           textInput.style.padding = '0';
                           textInput.style.margin = '0';
                           textInput.style.transform = `rotate(${textElement.rotation}deg)`;
                           textInput.style.transformOrigin = 'top left';
                           container.appendChild(textInput);
                           textInput.focus();
                           textInput.select();
                           const handleInputChange = () => { handleTextUpdate(element.id, { text: textInput.value }); };
                           const handleInputEnd = () => {
                             handleTextUpdate(element.id, { text: textInput.value });
                             container.removeChild(textInput);
                             textInput.removeEventListener('input', handleInputChange);
                             textInput.removeEventListener('blur', handleInputEnd);
                             textInput.removeEventListener('keydown', handleKeyDown);
                            setEditingTextId(prev => (prev === element.id ? null : prev));
                           };
                           const handleKeyDown = (e: KeyboardEvent) => {
                             if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleInputEnd(); }
                            else if (e.key === 'Escape') { e.preventDefault(); container.removeChild(textInput); textInput.removeEventListener('input', handleInputChange); textInput.removeEventListener('blur', handleInputEnd); textInput.removeEventListener('keydown', handleKeyDown); setEditingTextId(prev => (prev === element.id ? null : prev)); }
                           };
                           textInput.addEventListener('input', handleInputChange);
                           textInput.addEventListener('blur', handleInputEnd);
                           textInput.addEventListener('keydown', handleKeyDown);
                         }}
                         onDragEnd={(e) => {
                           handleTextUpdate(element.id, {
                             x: e.target.x(),
                             y: e.target.y()
                           });
                         }}
                       />
                     );
                   }
                   
                   // Regular Text element
                   return (
                <Text
                  key={element.id}
                  id={element.id}
                  x={element.x}
                  y={element.y}
                  width={element.width}
                  height={element.height}
                  text={element.text}
                  fontSize={element.fontSize}
                  fontFamily={element.fontFamily}
                  fill={element.fill}
                  fontStyle={element.fontStyle}
                  textDecoration={element.textDecoration}
                  letterSpacing={element.letterSpacing}
                  lineHeight={element.lineHeight}
                  align={element.align}
                  wrap={element.wrap}
                  rotation={element.rotation}
                  scaleX={element.scaleX}
                  scaleY={element.scaleY}
                  opacity={element.opacity}
                  visible={element.visible}
                  draggable
                  onClick={(e) => {
                    e.cancelBubble = true;
                    handleElementSelect(element.id);
                  }}
                  onDblClick={(e) => {
                    e.cancelBubble = true;
                    // Enable text editing mode
                    const textNode = e.target;
                    const stage = textNode.getStage();
                    if (!stage) return;
                    
                    // Create a temporary input element for editing
                    const textPosition = textNode.absolutePosition();
                    const container = stage.container();
                    
                    // Create input element
                    const textInput = document.createElement('textarea');
                    textInput.value = element.text;
                    textInput.style.position = 'absolute';
                    textInput.style.top = textPosition.y + 'px';
                    textInput.style.left = textPosition.x + 'px';
                    textInput.style.width = element.width + 'px';
                    textInput.style.height = element.height + 'px';
                    textInput.style.fontSize = element.fontSize + 'px';
                    textInput.style.fontFamily = element.fontFamily;
                    textInput.style.fontWeight = element.fontWeight.toString();
                    textInput.style.fontStyle = element.fontStyle;
                    textInput.style.textDecoration = element.textDecoration;
                    textInput.style.letterSpacing = element.letterSpacing + 'px';
                    textInput.style.lineHeight = element.lineHeight.toString();
                    textInput.style.textAlign = element.align;
                    textInput.style.color = element.fill;
                    textInput.style.background = 'transparent';
                    textInput.style.border = 'none';
                    textInput.style.outline = 'none';
                    textInput.style.resize = 'none';
                    textInput.style.overflow = 'hidden';
                    textInput.style.padding = '0';
                    textInput.style.margin = '0';
                    textInput.style.transform = `rotate(${element.rotation}deg)`;
                    textInput.style.transformOrigin = 'top left';
                    
                    container.appendChild(textInput);
                    textInput.focus();
                    textInput.select();
                    
                    // Handle input changes
                    const handleInputChange = () => {
                      handleTextUpdate(element.id, {
                        text: textInput.value
                      });
                    };
                    
                    // Handle input end
                    const handleInputEnd = () => {
                      handleTextUpdate(element.id, {
                        text: textInput.value
                      });
                      container.removeChild(textInput);
                      textInput.removeEventListener('input', handleInputChange);
                      textInput.removeEventListener('blur', handleInputEnd);
                      textInput.removeEventListener('keydown', handleKeyDown);
                      setEditingTextId(prev => (prev === element.id ? null : prev));
                    };
                    
                    // Handle key down
                    const handleKeyDown = (e: KeyboardEvent) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        handleInputEnd();
                      } else if (e.key === 'Escape') {
                        e.preventDefault();
                        container.removeChild(textInput);
                        textInput.removeEventListener('input', handleInputChange);
                        textInput.removeEventListener('blur', handleInputEnd);
                        textInput.removeEventListener('keydown', handleKeyDown);
                        setEditingTextId(prev => (prev === element.id ? null : prev));
                      }
                    };
                    
                    textInput.addEventListener('input', handleInputChange);
                    textInput.addEventListener('blur', handleInputEnd);
                    textInput.addEventListener('keydown', handleKeyDown);
                  }}
                  onDragEnd={(e) => {
                    handleTextUpdate(element.id, {
                      x: e.target.x(),
                      y: e.target.y()
                    });
                  }}
                />
              );
            })}

              {/* Render Shape Elements */}
              {elements.filter(el => el.type !== 'text' && el.type !== 'image' && el.type !== 'gradient').map((element) => {
                const shapeElement = element as ShapeElement;
                
                if (shapeElement.type === 'rect') {
                  return (
                    <Rect
                      key={element.id}
                    id={element.id}
                      x={shapeElement.x}
                      y={shapeElement.y}
                      width={shapeElement.width}
                      height={shapeElement.height}
                      fill={shapeElement.fill}
                      stroke={shapeElement.stroke}
                      strokeWidth={shapeElement.strokeWidth}
                      cornerRadius={shapeElement.cornerRadius || 0}
                      // Shadow Properties
                      shadowColor={shapeElement.shadowColor}
                      shadowBlur={shapeElement.shadowBlur}
                      shadowOffsetX={shapeElement.shadowOffset?.x}
                      shadowOffsetY={shapeElement.shadowOffset?.y}
                      shadowOpacity={shapeElement.shadowOpacity}
                      shadowEnabled={shapeElement.shadowEnabled}
                      opacity={shapeElement.opacity}
                      visible={shapeElement.visible}
                      rotation={shapeElement.rotation}
                      scaleX={shapeElement.scaleX}
                      scaleY={shapeElement.scaleY}
                      draggable
                      onClick={(e) => {
                        e.cancelBubble = true;
                        handleElementSelect(element.id);
                      }}
                      onDragEnd={(e) => {
                        handleShapeUpdate(element.id, {
                          x: e.target.x(),
                          y: e.target.y()
                        });
                      }}
                    />
                  );
                } else if (shapeElement.type === 'circle') {
                  return (
                    <Circle
                      key={element.id}
                    id={element.id}
                      x={shapeElement.x + shapeElement.width / 2}
                      y={shapeElement.y + shapeElement.height / 2}
                      radius={shapeElement.radius || 50}
                      fill={shapeElement.fill}
                      stroke={shapeElement.stroke}
                      strokeWidth={shapeElement.strokeWidth}
                      // Shadow Properties
                      shadowColor={shapeElement.shadowColor}
                      shadowBlur={shapeElement.shadowBlur}
                      shadowOffsetX={shapeElement.shadowOffset?.x}
                      shadowOffsetY={shapeElement.shadowOffset?.y}
                      shadowOpacity={shapeElement.shadowOpacity}
                      shadowEnabled={shapeElement.shadowEnabled}
                      opacity={shapeElement.opacity}
                      visible={shapeElement.visible}
                      rotation={shapeElement.rotation}
                      scaleX={shapeElement.scaleX}
                      scaleY={shapeElement.scaleY}
                      draggable
                      onClick={(e) => {
                        e.cancelBubble = true;
                        handleElementSelect(element.id);
                      }}
                      onDragEnd={(e) => {
                        handleShapeUpdate(element.id, {
                          x: e.target.x() - shapeElement.width / 2,
                          y: e.target.y() - shapeElement.height / 2
                        });
                      }}
                    />
                  );
                }
                
                // Default fallback for other shape types
                return (
                  <Rect
                    key={element.id}
                  id={element.id}
                    x={shapeElement.x}
                    y={shapeElement.y}
                    width={shapeElement.width}
                    height={shapeElement.height}
                    fill={shapeElement.fill}
                    stroke={shapeElement.stroke}
                    strokeWidth={shapeElement.strokeWidth}
                    opacity={shapeElement.opacity}
                    visible={shapeElement.visible}
                    rotation={shapeElement.rotation}
                    scaleX={shapeElement.scaleX}
                    scaleY={shapeElement.scaleY}
                    draggable
                    onClick={(e) => {
                      e.cancelBubble = true;
                      handleElementSelect(element.id);
                    }}
                    onDragEnd={(e) => {
                      handleShapeUpdate(element.id, {
                        x: e.target.x(),
                        y: e.target.y()
                      });
                    }}
                  />
                );
              })}

              {/* Render Gradient Elements */}
              {elements.filter(el => el.type === 'gradient').map((element) => {
                return (
                  <Rect
                    key={element.id}
                  id={element.id}
                    x={element.x}
                    y={element.y}
                    width={element.width}
                    height={element.height}
                    // Konva Linear Gradient Properties
                    fillLinearGradientStartPoint={element.gradientType === 'linear' ? {
                      x: element.x,
                      y: element.y
                    } : undefined}
                    fillLinearGradientEndPoint={element.gradientType === 'linear' ? {
                      x: element.x + element.width,
                      y: element.y + element.height
                    } : undefined}
                    fillLinearGradientColorStops={element.gradientType === 'linear' ? 
                      element.stops.flatMap(stop => [stop.position / 100, stop.color]) : undefined
                    }
                    // Konva Radial Gradient Properties
                    fillRadialGradientStartPoint={element.gradientType === 'radial' ? {
                      x: element.x + element.width / 2,
                      y: element.y + element.height / 2
                    } : undefined}
                    fillRadialGradientStartRadius={element.gradientType === 'radial' ? 0 : undefined}
                    fillRadialGradientEndPoint={element.gradientType === 'radial' ? {
                      x: element.x + element.width / 2,
                      y: element.y + element.height / 2
                    } : undefined}
                    fillRadialGradientEndRadius={element.gradientType === 'radial' ? 
                      Math.max(element.width, element.height) / 2 : undefined
                    }
                    fillRadialGradientColorStops={element.gradientType === 'radial' ? 
                      element.stops.flatMap(stop => [stop.position / 100, stop.color]) : undefined
                    }
                    fillPriority={element.gradientType === 'linear' ? 'linear-gradient' : 'radial-gradient'}
                    opacity={element.opacity}
                    visible={element.visible}
                    rotation={element.rotation}
                    scaleX={element.scaleX}
                    scaleY={element.scaleY}
                    draggable
                    onClick={(e) => {
                      e.cancelBubble = true;
                      handleElementSelect(element.id);
                    }}
                    onDragEnd={(e) => {
                      handleGradientUpdate(element.id, {
                        x: e.target.x(),
                        y: e.target.y()
                      });
                    }}
                  />
                );
              })}

              {/* Render Image Elements */}
              {elements.filter(el => el.type === 'image').map((element) => {
                const imageElement = element as ImageElement;
                return (
                <CanvasImage
                  key={imageElement.id}
                  el={imageElement}
                  onSelect={handleElementSelect}
                  onDragEnd={(id, x, y) => handleImageUpdate(id, { x, y })}
                  />
                );
              })}

              {/* Render Group Elements */}
              {elements.filter(el => el.type === 'group').map((element) => {
                const groupElement = element as any;
                const childElements = elements.filter(child => 
                  groupElement.children?.includes(child.id)
                );

                return (
                  <Group
                    key={element.id}
                  id={element.id}
                    x={groupElement.x}
                    y={groupElement.y}
                    rotation={groupElement.rotation}
                    scaleX={groupElement.scaleX}
                    scaleY={groupElement.scaleY}
                    opacity={groupElement.opacity}
                    visible={groupElement.visible}
                    draggable
                    onClick={(e) => {
                      e.cancelBubble = true;
                      handleElementSelect(element.id);
                    }}
                    onDragEnd={(e) => {
                      // Update group position and all children
                      const deltaX = e.target.x() - groupElement.x;
                      const deltaY = e.target.y() - groupElement.y;
                      
                      setElements(prev => prev.map(el => {
                        if (groupElement.children?.includes(el.id)) {
                          return { ...el, x: el.x + deltaX, y: el.y + deltaY };
                        }
                        if (el.id === element.id) {
                          return { ...el, x: e.target.x(), y: e.target.y() };
                        }
                        return el;
                      }));
                    }}
                  >
                    {/* Render child elements within the group */}
                    {childElements.map(child => {
                      if (child.type === 'text') {
                        const textChild = child as TextElement;
                        return (
                          <Text
                            key={child.id}
                          id={child.id}
                            x={textChild.x - groupElement.x}
                            y={textChild.y - groupElement.y}
                            width={textChild.width}
                            height={textChild.height}
                            text={textChild.text}
                            fontSize={textChild.fontSize}
                            fontFamily={textChild.fontFamily}
                            fill={textChild.fill}
                            fontWeight={textChild.fontWeight}
                            fontStyle={textChild.fontStyle}
                            textDecoration={textChild.textDecoration}
                            letterSpacing={textChild.letterSpacing}
                            lineHeight={textChild.lineHeight}
                            align={textChild.align}
                            verticalAlign={textChild.verticalAlign}
                            wrap={textChild.wrap}
                            ellipsis={textChild.ellipsis}
                            padding={textChild.padding}
                            direction={textChild.direction}
                            rotation={textChild.rotation}
                            scaleX={textChild.scaleX}
                            scaleY={textChild.scaleY}
                            opacity={textChild.opacity}
                            visible={textChild.visible}
                            zIndex={textChild.zIndex}
                            draggable
                            onClick={(e) => {
                              e.cancelBubble = true;
                              handleElementSelect(child.id);
                            }}
                          />
                        );
                      } else if (child.type === 'rect') {
                        const rectChild = child as ShapeElement;
                        return (
                          <Rect
                            key={child.id}
                          id={child.id}
                            x={rectChild.x - groupElement.x}
                            y={rectChild.y - groupElement.y}
                            width={rectChild.width}
                            height={rectChild.height}
                            fill={rectChild.fill}
                            stroke={rectChild.stroke}
                            strokeWidth={rectChild.strokeWidth}
                            cornerRadius={rectChild.cornerRadius || 0}
                            rotation={rectChild.rotation}
                            scaleX={rectChild.scaleX}
                            scaleY={rectChild.scaleY}
                            opacity={rectChild.opacity}
                            visible={rectChild.visible}
                            zIndex={rectChild.zIndex}
                            draggable
                            onClick={(e) => {
                              e.cancelBubble = true;
                              handleElementSelect(child.id);
                            }}
                          />
                        );
                      }
                      return null;
                    })}
                  </Group>
                );
              })}

              {/* Transformer for selected elements */}
              {editorState.selectedElementIds.length > 0 && (
                <Transformer
                  ref={transformerRef}
                anchorSize={16}
                borderStroke="#3B82F6"
                borderStrokeWidth={2}
                anchorStroke="#0EA5E9"
                anchorFill="#E0F2FE"
                rotateAnchorOffset={40}
                keepRatio
                  boundBoxFunc={(oldBox, newBox) => {
                    // Limit resize
                    if (newBox.width < 5 || newBox.height < 5) {
                      return oldBox;
                    }
                    return newBox;
                  }}
                  onTransform={(e) => {
                  const node: any = e.target;
                    const elementId = node.id();
                  const className = node.getClassName && node.getClassName();

                  if (className === 'Text') {
                    if (editingTextId === elementId) {
                      // Editing mode: resize box only
                      const newWidth = Math.max(20, node.width() * node.scaleX());
                      const newHeight = Math.max(20, node.height() * node.scaleY());
                      node.scaleX(1);
                      node.scaleY(1);
                      handleTextUpdate(elementId, { x: node.x(), y: node.y(), width: newWidth, height: newHeight } as any);
                    } else {
                      // Selected mode: uniform scale
                      const s = Math.max(node.scaleX(), node.scaleY());
                      node.scaleX(s);
                      node.scaleY(s);
                      handleTransform(elementId, { x: node.x(), y: node.y(), rotation: node.rotation(), scaleX: s, scaleY: s });
                    }
                  } else {
                    // Shapes/images: keep ratio uniform by default
                    const s = Math.max(node.scaleX(), node.scaleY());
                    node.scaleX(s);
                    node.scaleY(s);
                    handleTransform(elementId, { x: node.x(), y: node.y(), rotation: node.rotation(), scaleX: s, scaleY: s });
                  }
                  }}
                />
              )}
          </Group>
            </Layer>
          </Stage>
        </div>

        {/* Right Sidebar - Properties */}
        <div className="w-80 bg-gray-700 text-white p-4 overflow-y-auto">
          <h3 className="text-lg font-semibold mb-4">Properties</h3>
          
          {/* Performance Monitor */}
          <div className="mb-6 p-3 bg-gray-600 rounded">
        <div className="flex items-center justify-between mb-2">
          <h4 className="text-sm font-semibold">Performance</h4>
          <button
            className="text-xs px-2 py-1 rounded bg-gray-500 hover:bg-gray-400"
            onClick={() => setPanelState(prev => ({ ...prev, showPerformance: !prev.showPerformance }))}
          >
            {panelState.showPerformance ? 'Hide' : 'Show'}
          </button>
        </div>
        {panelState.showPerformance && (
            <div className="text-xs space-y-1">
              <div>FPS: {performanceData.fps}</div>
              <div>Memory: {performanceData.memoryUsage.toFixed(2)} MB</div>
              <div>Render Time: {performanceData.renderTime.toFixed(2)}ms</div>
              <div>Draw Calls: {performanceData.drawCalls}</div>
              <div>Nodes: {performanceData.totalNodes} ({performanceData.cachedNodes} cached)</div>
              <div>Animations: {performanceData.animations}</div>
              <div>Event Listeners: {performanceData.eventListeners}</div>
              <div className={`font-semibold ${performanceData.isOptimized ? 'text-green-400' : 'text-red-400'}`}>
                Status: {performanceData.isOptimized ? 'Optimized' : 'Needs Attention'}
              </div>
              </div>
            )}
          </div>

          {/* Canvas Settings */}
          <div className="mb-6">
            <h4 className="text-sm font-semibold mb-2">Canvas Settings</h4>
            <div className="space-y-2">
              <div>
                <label className="block text-xs text-gray-300">Width</label>
                <input
                  type="number"
                  value={canvasState.width}
                  onChange={(e) => setCanvasState(prev => ({ ...prev, width: parseInt(e.target.value) }))}
                  className="w-full p-2 bg-gray-600 rounded text-sm"
                />
              </div>
              <div>
                <label className="block text-xs text-gray-300">Height</label>
                <input
                  type="number"
                  value={canvasState.height}
                  onChange={(e) => setCanvasState(prev => ({ ...prev, height: parseInt(e.target.value) }))}
                  className="w-full p-2 bg-gray-600 rounded text-sm"
                />
              </div>
              <div>
                <label className="block text-xs text-gray-300">Zoom</label>
                <input
                  type="range"
                  min="0.1"
                  max="3"
                  step="0.1"
                  value={canvasState.zoom}
                  onChange={(e) => setCanvasState(prev => ({ ...prev, zoom: parseFloat(e.target.value) }))}
                  className="w-full"
                />
                <span className="text-xs text-gray-400">{Math.round(canvasState.zoom * 100)}%</span>
              </div>
            </div>

        {/* Bottom Timeline / Animation bar */}
        <div className="h-32 bg-gray-800 border-t border-gray-700 p-3">
          {editorState.selectedTool === 'animation' ? (
            <div className="h-full flex items-center">
              <AnimationTool
                selectedElementIds={editorState.selectedElementIds}
                elements={elements}
                onAnimationUpdate={(id, updates) => console.log('Animation update (footer):', id, updates)}
                onAnimationCreate={(a) => console.log('Animation created (footer):', a)}
                onAnimationDelete={(id) => console.log('Animation deleted (footer):', id)}
                onAnimationPlay={(id) => console.log('Animation play (footer):', id)}
                onAnimationPause={(id) => console.log('Animation pause (footer):', id)}
                onAnimationStop={(id) => console.log('Animation stop (footer):', id)}
              />
            </div>
          ) : (
            <div className="h-full flex items-center text-xs text-gray-400">Cmd+~ to open Animation</div>
          )}
        </div>

          {/* Grid Settings */}
          <div className="mb-6">
            <h4 className="text-sm font-semibold mb-2">Grid Settings</h4>
            <div className="space-y-2">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={canvasState.showGrid}
                  onChange={(e) => setCanvasState(prev => ({ ...prev, showGrid: e.target.checked }))}
                  className="mr-2"
                />
                <span className="text-xs">Show Grid</span>
              </label>
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={canvasState.snapToGrid}
                  onChange={(e) => setCanvasState(prev => ({ ...prev, snapToGrid: e.target.checked }))}
                  className="mr-2"
                />
                <span className="text-xs">Snap to Grid</span>
              </label>
              <div>
                <label className="block text-xs text-gray-300">Grid Size</label>
                <input
                  type="number"
                  value={canvasState.gridSize}
                  onChange={(e) => setCanvasState(prev => ({ ...prev, gridSize: parseInt(e.target.value) }))}
                  className="w-full p-2 bg-gray-600 rounded text-sm"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
        
        {/* Bottom Properties Panel */}
        <div className="bg-gray-800 border-t border-gray-700 p-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-300">
                Selected: {editorState.selectedElementIds.length} element(s)
              </span>
              {editorState.selectedElementIds.length > 0 && (
                <button
                  onClick={deleteSelectedElements}
                  className="px-3 py-1 bg-red-600 hover:bg-red-700 text-white text-sm rounded"
                >
                  Delete Selected
                </button>
              )}
            </div>
            <div className="flex items-center space-x-2 text-sm text-gray-400">
              <span>FPS: {Math.round(editorState.performance.fps)}</span>
              <span>•</span>
              <span>Memory: {editorState.performance.memoryUsage.toFixed(1)}MB</span>
              <span>•</span>
              <span>Elements: {elements.length}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
export default AdvancedImageEditor;



