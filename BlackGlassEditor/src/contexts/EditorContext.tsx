'use client';

import React, { createContext, useContext, useReducer, useCallback, ReactNode } from 'react';

// Unified shape data model that works with all tools
export interface UnifiedShape {
  id: string;
  type: 'text' | 'rect' | 'circle' | 'line' | 'image' | 'group' | 'icon';
  x: number;
  y: number;
  width: number;
  height: number;
  visible: boolean;
  locked: boolean;
  opacity: number;
  zIndex: number;
  isSelected: boolean;
  isDragging: boolean;
  isResizing: boolean;
  isRotating: boolean;
  
  // Common properties
  fill: string;
  stroke: string;
  strokeWidth: number;
  rotation: number;
  scaleX: number;
  scaleY: number;
  
  // Text-specific properties
  text?: string;
  fontSize?: number;
  fontFamily?: string;
  fontWeight?: number;
  fontStyle?: string;
  textDecoration?: string;
  letterSpacing?: number;
  lineHeight?: number;
  align?: 'left' | 'center' | 'right' | 'justify';
  verticalAlign?: 'top' | 'middle' | 'bottom';
  wrap?: 'word' | 'char' | 'none';
  ellipsis?: boolean;
  padding?: number;
  direction?: 'inherit' | 'ltr' | 'rtl';
  
  // Circle-specific properties
  radius?: number;
  
  // Line-specific properties
  points?: number[];
  
  // Image-specific properties
  src?: string;
  
  // Icon-specific properties
  svg?: string;
  iconName?: string;
  iconCategory?: string;
  
  // Group properties
  children?: string[];
  parentGroupId?: string;
  
  // Performance properties
  isCached: boolean;
  perfectDrawEnabled: boolean;
  listening: boolean;
  name: string;
  
  // State tracking
  boundaryState: {
    isWithinBounds: boolean;
    violationType: 'x' | 'y' | 'width' | 'height' | null;
  };
}

// Canvas state
export interface CanvasState {
  width: number;
  height: number;
  zoom: number;
  panX: number;
  panY: number;
  gridSize: number;
  snapToGrid: boolean;
  showGrid: boolean;
}

// Tool state
export interface ToolState {
  selectedTool: string;
  selectedShapeIds: string[];
  isDrawing: boolean;
  currentLine: number[];
  toolSettings: {
    fillColor: string;
    strokeColor: string;
    strokeWidth: number;
    fontSize: number;
    fontFamily: string;
  };
}

// Editor state
export interface EditorState {
  shapes: UnifiedShape[];
  canvas: CanvasState;
  tool: ToolState;
  activeToolPanel: string | null;
  toolPanels: {
    [key: string]: {
      isOpen: boolean;
      position: { x: number; y: number };
      size: { width: number; height: number };
    };
  };
}

// Action types
export type EditorAction =
  | { type: 'ADD_SHAPE'; payload: UnifiedShape }
  | { type: 'UPDATE_SHAPE'; payload: { id: string; updates: Partial<UnifiedShape> } }
  | { type: 'DELETE_SHAPE'; payload: string }
  | { type: 'SELECT_SHAPE'; payload: string | string[] }
  | { type: 'DESELECT_ALL' }
  | { type: 'SET_SELECTED_TOOL'; payload: string }
  | { type: 'UPDATE_CANVAS'; payload: Partial<CanvasState> }
  | { type: 'UPDATE_TOOL_SETTINGS'; payload: Partial<ToolState['toolSettings']> }
  | { type: 'OPEN_TOOL_PANEL'; payload: { toolId: string; position?: { x: number; y: number } } }
  | { type: 'CLOSE_TOOL_PANEL'; payload: string }
  | { type: 'UPDATE_TOOL_PANEL'; payload: { toolId: string; updates: Partial<EditorState['toolPanels'][string]> } }
  | { type: 'SET_DRAWING_STATE'; payload: { isDrawing: boolean; currentLine?: number[] } }
  | { type: 'REORDER_SHAPES'; payload: UnifiedShape[] };

// Initial state
const initialState: EditorState = {
  shapes: [],
  canvas: {
    width: 1200,
    height: 800,
    zoom: 1,
    panX: 0,
    panY: 0,
    gridSize: 20,
    snapToGrid: false,
    showGrid: true,
  },
  tool: {
    selectedTool: 'select',
    selectedShapeIds: [],
    isDrawing: false,
    currentLine: [],
    toolSettings: {
      fillColor: '#ff6b9d',
      strokeColor: '#000000',
      strokeWidth: 2,
      fontSize: 16,
      fontFamily: 'Arial',
    },
  },
  activeToolPanel: null,
  toolPanels: {},
};

// Reducer
function editorReducer(state: EditorState, action: EditorAction): EditorState {
  switch (action.type) {
    case 'ADD_SHAPE':
      return {
        ...state,
        shapes: [...state.shapes, action.payload],
        tool: {
          ...state.tool,
          selectedShapeIds: [action.payload.id],
        },
      };

    case 'UPDATE_SHAPE':
      return {
        ...state,
        shapes: state.shapes.map(shape =>
          shape.id === action.payload.id
            ? { ...shape, ...action.payload.updates }
            : shape
        ),
      };

    case 'DELETE_SHAPE':
      return {
        ...state,
        shapes: state.shapes.filter(shape => shape.id !== action.payload),
        tool: {
          ...state.tool,
          selectedShapeIds: state.tool.selectedShapeIds.filter(id => id !== action.payload),
        },
      };

    case 'SELECT_SHAPE':
      const shapeIds = Array.isArray(action.payload) ? action.payload : [action.payload];
      return {
        ...state,
        tool: {
          ...state.tool,
          selectedShapeIds: shapeIds,
        },
        shapes: state.shapes.map(shape => ({
          ...shape,
          isSelected: shapeIds.includes(shape.id),
        })),
      };

    case 'DESELECT_ALL':
      return {
        ...state,
        tool: {
          ...state.tool,
          selectedShapeIds: [],
        },
        shapes: state.shapes.map(shape => ({
          ...shape,
          isSelected: false,
        })),
      };

    case 'SET_SELECTED_TOOL':
      return {
        ...state,
        tool: {
          ...state.tool,
          selectedTool: action.payload,
        },
      };

    case 'UPDATE_CANVAS':
      return {
        ...state,
        canvas: { ...state.canvas, ...action.payload },
      };

    case 'UPDATE_TOOL_SETTINGS':
      return {
        ...state,
        tool: {
          ...state.tool,
          toolSettings: { ...state.tool.toolSettings, ...action.payload },
        },
      };

    case 'OPEN_TOOL_PANEL':
      return {
        ...state,
        activeToolPanel: action.payload.toolId,
        toolPanels: {
          ...state.toolPanels,
          [action.payload.toolId]: {
            isOpen: true,
            position: action.payload.position || { x: 100, y: 100 },
            size: { width: 320, height: 400 },
          },
        },
      };

    case 'CLOSE_TOOL_PANEL':
      return {
        ...state,
        activeToolPanel: state.activeToolPanel === action.payload ? null : state.activeToolPanel,
        toolPanels: {
          ...state.toolPanels,
          [action.payload]: {
            ...state.toolPanels[action.payload],
            isOpen: false,
          },
        },
      };

    case 'UPDATE_TOOL_PANEL':
      return {
        ...state,
        toolPanels: {
          ...state.toolPanels,
          [action.payload.toolId]: {
            ...state.toolPanels[action.payload.toolId],
            ...action.payload.updates,
          },
        },
      };

    case 'SET_DRAWING_STATE':
      return {
        ...state,
        tool: {
          ...state.tool,
          isDrawing: action.payload.isDrawing,
          currentLine: action.payload.currentLine || state.tool.currentLine,
        },
      };

    case 'REORDER_SHAPES':
      return {
        ...state,
        shapes: action.payload,
      };

    default:
      return state;
  }
}

// Context
const EditorContext = createContext<{
  state: EditorState;
  dispatch: React.Dispatch<EditorAction>;
  actions: {
    addShape: (shape: Omit<UnifiedShape, 'id'>) => void;
    updateShape: (id: string, updates: Partial<UnifiedShape>) => void;
    deleteShape: (id: string) => void;
    selectShape: (id: string | string[]) => void;
    deselectAll: () => void;
    setSelectedTool: (toolId: string) => void;
    updateCanvas: (updates: Partial<CanvasState>) => void;
    updateToolSettings: (settings: Partial<ToolState['toolSettings']>) => void;
    openToolPanel: (toolId: string, position?: { x: number; y: number }) => void;
    closeToolPanel: (toolId: string) => void;
    toggleToolPanel: (toolId: string) => void;
    updateToolPanel: (toolId: string, updates: Partial<EditorState['toolPanels'][string]>) => void;
    setDrawingState: (isDrawing: boolean, currentLine?: number[]) => void;
    reorderShapes: (shapes: UnifiedShape[]) => void;
  };
} | null>(null);

// Provider component
export function EditorProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(editorReducer, initialState);

  const actions = {
    addShape: useCallback((shape: Omit<UnifiedShape, 'id'>) => {
      const newShape: UnifiedShape = {
        ...shape,
        id: `${shape.type}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      };
      dispatch({ type: 'ADD_SHAPE', payload: newShape });
    }, []),

    updateShape: useCallback((id: string, updates: Partial<UnifiedShape>) => {
      dispatch({ type: 'UPDATE_SHAPE', payload: { id, updates } });
    }, []),

    deleteShape: useCallback((id: string) => {
      dispatch({ type: 'DELETE_SHAPE', payload: id });
    }, []),

    selectShape: useCallback((id: string | string[]) => {
      dispatch({ type: 'SELECT_SHAPE', payload: id });
    }, []),

    deselectAll: useCallback(() => {
      dispatch({ type: 'DESELECT_ALL' });
    }, []),

    setSelectedTool: useCallback((toolId: string) => {
      dispatch({ type: 'SET_SELECTED_TOOL', payload: toolId });
    }, []),

    updateCanvas: useCallback((updates: Partial<CanvasState>) => {
      dispatch({ type: 'UPDATE_CANVAS', payload: updates });
    }, []),

    updateToolSettings: useCallback((settings: Partial<ToolState['toolSettings']>) => {
      dispatch({ type: 'UPDATE_TOOL_SETTINGS', payload: settings });
    }, []),

    openToolPanel: useCallback((toolId: string, position?: { x: number; y: number }) => {
      dispatch({ type: 'OPEN_TOOL_PANEL', payload: { toolId, position } });
    }, []),

    closeToolPanel: useCallback((toolId: string) => {
      dispatch({ type: 'CLOSE_TOOL_PANEL', payload: toolId });
    }, []),

    toggleToolPanel: useCallback((toolId: string) => {
      const currentPanel = state.toolPanels[toolId];
      if (currentPanel?.isOpen) {
        dispatch({ type: 'CLOSE_TOOL_PANEL', payload: toolId });
      } else {
        dispatch({ type: 'OPEN_TOOL_PANEL', payload: { toolId, position: { x: 100, y: 100 } } });
      }
    }, [state.toolPanels]),

    updateToolPanel: useCallback((toolId: string, updates: Partial<EditorState['toolPanels'][string]>) => {
      dispatch({ type: 'UPDATE_TOOL_PANEL', payload: { toolId, updates } });
    }, []),

    setDrawingState: useCallback((isDrawing: boolean, currentLine?: number[]) => {
      dispatch({ type: 'SET_DRAWING_STATE', payload: { isDrawing, currentLine } });
    }, []),

    reorderShapes: useCallback((shapes: UnifiedShape[]) => {
      dispatch({ type: 'REORDER_SHAPES', payload: shapes });
    }, []),
  };

  return (
    <EditorContext.Provider value={{ state, dispatch, actions }}>
      {children}
    </EditorContext.Provider>
  );
}

// Hook to use the editor context
export function useEditor() {
  const context = useContext(EditorContext);
  if (!context) {
    throw new Error('useEditor must be used within an EditorProvider');
  }
  return context;
}

// Utility functions
export const createDefaultShape = (type: UnifiedShape['type'], x: number, y: number, settings: ToolState['toolSettings']): Omit<UnifiedShape, 'id'> => {
  const baseShape = {
    type,
    x,
    y,
    width: 100,
    height: 100,
    visible: true,
    locked: false,
    opacity: 1,
    zIndex: 1,
    isSelected: false,
    isDragging: false,
    isResizing: false,
    isRotating: false,
    fill: settings.fillColor,
    stroke: settings.strokeColor,
    strokeWidth: settings.strokeWidth,
    rotation: 0,
    scaleX: 1,
    scaleY: 1,
    isCached: false,
    perfectDrawEnabled: true,
    listening: true,
    name: `${type} ${Date.now()}`,
    boundaryState: {
      isWithinBounds: true,
      violationType: null,
    },
  };

  switch (type) {
    case 'text':
      return {
        ...baseShape,
        width: 200,
        height: 50,
        text: 'New Text',
        fontSize: settings.fontSize,
        fontFamily: settings.fontFamily,
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
        direction: 'inherit',
      };
    case 'circle':
      return {
        ...baseShape,
        width: 100,
        height: 100,
        radius: 50,
      };
    case 'line':
      return {
        ...baseShape,
        width: 100,
        height: 0,
        points: [0, 0, 100, 0],
      };
    case 'icon':
      return {
        ...baseShape,
        width: 64,
        height: 64,
        svg: '',
        iconName: 'New Icon',
        iconCategory: 'system',
      };
    default:
      return baseShape;
  }
};
