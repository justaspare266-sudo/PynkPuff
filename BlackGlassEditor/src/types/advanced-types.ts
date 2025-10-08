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
  textPath?: string;
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
  image?: HTMLImageElement;
  cropX?: number;
  cropY?: number;
  cropWidth?: number;
  cropHeight?: number;
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
