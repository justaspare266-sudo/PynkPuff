import { create } from 'zustand';

interface EditorState {
  selectedTool: string;
  selectedObjectId: string | null;
  objects: any[];
  canvasSize: { width: number; height: number };
  zoom: number;
  panX: number;
  panY: number;
  showGrid: boolean;
  showRulers: boolean;
  snapToGrid: boolean;
  history: any[];
  historyIndex: number;
  
  // Actions
  setSelectedTool: (tool: string) => void;
  setSelectedObjectId: (id: string | null) => void;
  addObject: (object: any) => void;
  updateObject: (id: string, updates: any) => void;
  deleteObject: (id: string) => void;
  setCanvasSize: (size: { width: number; height: number }) => void;
  setZoom: (zoom: number) => void;
  setPan: (x: number, y: number) => void;
  setShowGrid: (show: boolean) => void;
  setShowRulers: (show: boolean) => void;
  setSnapToGrid: (snap: boolean) => void;
  undo: () => void;
  redo: () => void;
  saveState: () => void;
}

export const useEditorStore = create<EditorState>((set, get) => ({
  selectedTool: 'select',
  selectedObjectId: null,
  objects: [],
  canvasSize: { width: 800, height: 600 },
  zoom: 1,
  panX: 0,
  panY: 0,
  showGrid: true,
  showRulers: true,
  snapToGrid: true,
  history: [],
  historyIndex: -1,

  setSelectedTool: (tool) => set({ selectedTool: tool }),
  
  setSelectedObjectId: (id) => set({ selectedObjectId: id }),
  
  addObject: (object) => {
    const newObject = {
      ...object,
      id: object.id || `object-${Date.now()}-${Math.random()}`,
      createdAt: new Date()
    };
    
    set((state) => ({
      objects: [...state.objects, newObject],
      selectedObjectId: newObject.id
    }));
    
    get().saveState();
  },
  
  updateObject: (id, updates) => {
    set((state) => ({
      objects: state.objects.map(obj =>
        obj.id === id ? { ...obj, ...updates, updatedAt: new Date() } : obj
      )
    }));
    
    get().saveState();
  },
  
  deleteObject: (id) => {
    set((state) => ({
      objects: state.objects.filter(obj => obj.id !== id),
      selectedObjectId: state.selectedObjectId === id ? null : state.selectedObjectId
    }));
    
    get().saveState();
  },
  
  setCanvasSize: (size) => set({ canvasSize: size }),
  
  setZoom: (zoom) => set({ zoom }),
  
  setPan: (x, y) => set({ panX: x, panY: y }),
  
  setShowGrid: (show) => set({ showGrid: show }),
  
  setShowRulers: (show) => set({ showRulers: show }),
  
  setSnapToGrid: (snap) => set({ snapToGrid: snap }),
  
  undo: () => {
    const { history, historyIndex } = get();
    if (historyIndex > 0) {
      const newIndex = historyIndex - 1;
      const state = history[newIndex];
      set({
        objects: state.objects,
        historyIndex: newIndex
      });
    }
  },
  
  redo: () => {
    const { history, historyIndex } = get();
    if (historyIndex < history.length - 1) {
      const newIndex = historyIndex + 1;
      const state = history[newIndex];
      set({
        objects: state.objects,
        historyIndex: newIndex
      });
    }
  },
  
  saveState: () => {
    const { objects, history, historyIndex } = get();
    const newState = { objects: [...objects] };
    
    // Remove any states after current index
    const newHistory = history.slice(0, historyIndex + 1);
    newHistory.push(newState);
    
    set({
      history: newHistory,
      historyIndex: newHistory.length - 1
    });
  }
}));
