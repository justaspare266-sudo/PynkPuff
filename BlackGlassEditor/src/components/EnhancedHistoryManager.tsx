import React, { useState, useCallback, useRef, useEffect } from 'react';
import { 
  Undo, 
  Redo, 
  History, 
  Clock, 
  Save, 
  Trash2, 
  Copy, 
  RotateCw, 
  RotateCcw, 
  ArrowUp, 
  ArrowDown, 
  X, 
  Check, 
  AlertCircle, 
  Info, 
  Settings, 
  Play, 
  Pause, 
  Square, 
  SkipBack, 
  SkipForward, 
  FastForward, 
  Rewind, 
  Eye, 
  EyeOff, 
  Filter, 
  Search, 
  Calendar, 
  User, 
  Tag, 
  Bookmark, 
  Star, 
  StarOff, 
  Download, 
  Upload, 
  RefreshCw, 
  Zap, 
  Layers, 
  Type, 
  Square as SquareIcon, 
  Circle, 
  Triangle, 
  Star as StarIcon, 
  ArrowRight, 
  Heart, 
  Image as ImageIcon, 
  Palette, 
  Filter as FilterIcon,
  Plus,
  Edit,
  Move,
  Scissors,
  Clipboard
} from 'lucide-react';

export interface HistoryAction {
  id: string;
  type: 'create' | 'update' | 'delete' | 'move' | 'resize' | 'rotate' | 'style' | 'group' | 'ungroup' | 'duplicate' | 'paste' | 'cut' | 'copy' | 'undo' | 'redo' | 'batch';
  description: string;
  timestamp: Date;
  objectId?: string;
  objectType?: string;
  objectName?: string;
  beforeState?: any;
  afterState?: any;
  metadata?: {
    x?: number;
    y?: number;
    width?: number;
    height?: number;
    rotation?: number;
    scaleX?: number;
    scaleY?: number;
    opacity?: number;
    fill?: string;
    stroke?: string;
    fontSize?: number;
    fontFamily?: string;
    [key: string]: any;
  };
  category: 'object' | 'canvas' | 'style' | 'layout' | 'system' | 'batch';
  severity: 'low' | 'medium' | 'high';
  reversible: boolean;
  batchId?: string;
  userId?: string;
  sessionId?: string;
  duration?: number;
  memoryUsage?: number;
  actions?: HistoryAction[];
}

export interface HistoryState {
  id: string;
  timestamp: Date;
  actions: HistoryAction[];
  objectCount: number;
  canvasSize: { width: number; height: number };
  zoom: number;
  selectedIds: string[];
  description?: string;
  tags?: string[];
  bookmarked: boolean;
  starred: boolean;
  memoryUsage: number;
  duration: number;
  isCheckpoint: boolean;
  isAutoSave: boolean;
  isManualSave: boolean;
  isRestorePoint: boolean;
}

export interface HistorySettings {
  maxHistorySize: number;
  autoSaveInterval: number;
  checkpointInterval: number;
  enableCompression: boolean;
  enableEncryption: boolean;
  enableCloudSync: boolean;
  enableCollaboration: boolean;
  enableVersionControl: boolean;
  enableBranching: boolean;
  enableMerging: boolean;
  enableConflictResolution: boolean;
  enableAuditLog: boolean;
  enableAnalytics: boolean;
  enableNotifications: boolean;
  enableKeyboardShortcuts: boolean;
  enableMouseShortcuts: boolean;
  enableTouchShortcuts: boolean;
  enableVoiceCommands: boolean;
  enableGestures: boolean;
  enableHaptics: boolean;
}

interface EnhancedHistoryManagerProps {
  onStateChange?: (state: HistoryState) => void;
  onActionPerformed?: (action: HistoryAction) => void;
  onUndo?: (action: HistoryAction) => void;
  onRedo?: (action: HistoryAction) => void;
  onCheckpoint?: (state: HistoryState) => void;
  onRestore?: (state: HistoryState) => void;
  onExport?: (history: HistoryState[]) => void;
  onImport?: (history: HistoryState[]) => void;
  className?: string;
}

const defaultSettings: HistorySettings = {
  maxHistorySize: 1000,
  autoSaveInterval: 30000, // 30 seconds
  checkpointInterval: 300000, // 5 minutes
  enableCompression: true,
  enableEncryption: false,
  enableCloudSync: false,
  enableCollaboration: false,
  enableVersionControl: false,
  enableBranching: false,
  enableMerging: false,
  enableConflictResolution: false,
  enableAuditLog: true,
  enableAnalytics: true,
  enableNotifications: true,
  enableKeyboardShortcuts: true,
  enableMouseShortcuts: true,
  enableTouchShortcuts: true,
  enableVoiceCommands: false,
  enableGestures: false,
  enableHaptics: false
};

export const EnhancedHistoryManager: React.FC<EnhancedHistoryManagerProps> = ({
  onStateChange,
  onActionPerformed,
  onUndo,
  onRedo,
  onCheckpoint,
  onRestore,
  onExport,
  onImport,
  className = ''
}) => {
  const [history, setHistory] = useState<HistoryState[]>([]);
  const [currentIndex, setCurrentIndex] = useState(-1);
  const [isPlaying, setIsPlaying] = useState(false);
  const [playbackSpeed, setPlaybackSpeed] = useState(1);
  const [selectedState, setSelectedState] = useState<HistoryState | null>(null);
  const [showHistoryPanel, setShowHistoryPanel] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [settings, setSettings] = useState<HistorySettings>(defaultSettings);
  const [filter, setFilter] = useState({
    category: 'all',
    type: 'all',
    dateRange: 'all',
    search: ''
  });
  const [viewMode, setViewMode] = useState<'timeline' | 'list' | 'grid'>('timeline');
  const [groupBy, setGroupBy] = useState<'none' | 'date' | 'category' | 'type' | 'user'>('date');
  const [sortBy, setSortBy] = useState<'timestamp' | 'duration' | 'memoryUsage' | 'objectCount'>('timestamp');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  
  const playbackInterval = useRef<NodeJS.Timeout | null>(null);
  const sessionId = useRef(`session-${Date.now()}`);
  const batchId = useRef<string | null>(null);
  const batchActions = useRef<HistoryAction[]>([]);

  // Load history from localStorage
  useEffect(() => {
    const savedHistory = localStorage.getItem('image-editor-history');
    if (savedHistory) {
      try {
        const parsed = JSON.parse(savedHistory);
        setHistory(parsed.map((state: any) => ({
          ...state,
          timestamp: new Date(state.timestamp),
          actions: state.actions.map((action: any) => ({
            ...action,
            timestamp: new Date(action.timestamp)
          }))
        })));
        setCurrentIndex(parsed.length - 1);
      } catch (error) {
        console.error('Failed to load history:', error);
      }
    }
  }, []);

  // Save history to localStorage
  const saveHistory = useCallback((updatedHistory: HistoryState[]) => {
    localStorage.setItem('image-editor-history', JSON.stringify(updatedHistory));
    setHistory(updatedHistory);
  }, []);

  // Create history action
  const createAction = useCallback((
    type: HistoryAction['type'],
    description: string,
    objectId?: string,
    objectType?: string,
    beforeState?: any,
    afterState?: any,
    metadata?: any
  ): HistoryAction => {
    return {
      id: `action-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      type,
      description,
      timestamp: new Date(),
      objectId,
      objectType,
      objectName: objectId ? `Object ${objectId}` : undefined,
      beforeState,
      afterState,
      metadata,
      category: getCategoryFromType(type),
      severity: getSeverityFromType(type),
      reversible: isReversibleType(type),
      batchId: batchId.current || undefined,
      sessionId: sessionId.current,
      duration: 0,
      memoryUsage: 0
    };
  }, []);

  // Get category from action type
  const getCategoryFromType = (type: string): HistoryAction['category'] => {
    switch (type) {
      case 'create':
      case 'delete':
      case 'duplicate':
      case 'paste':
      case 'cut':
      case 'copy':
        return 'object';
      case 'move':
      case 'resize':
      case 'rotate':
        return 'layout';
      case 'style':
        return 'style';
      case 'group':
      case 'ungroup':
        return 'object';
      case 'batch':
        return 'system';
      default:
        return 'system';
    }
  };

  // Get severity from action type
  const getSeverityFromType = (type: string): HistoryAction['severity'] => {
    switch (type) {
      case 'delete':
      case 'cut':
        return 'high';
      case 'create':
      case 'duplicate':
      case 'paste':
        return 'medium';
      case 'move':
      case 'resize':
      case 'rotate':
      case 'style':
        return 'low';
      default:
        return 'low';
    }
  };

  // Check if action type is reversible
  const isReversibleType = (type: string): boolean => {
    return ['create', 'update', 'delete', 'move', 'resize', 'rotate', 'style', 'group', 'ungroup', 'duplicate', 'paste', 'cut'].includes(type);
  };

  // Add action to history
  const addAction = useCallback((
    type: HistoryAction['type'],
    description: string,
    objectId?: string,
    objectType?: string,
    beforeState?: any,
    afterState?: any,
    metadata?: any
  ) => {
    const action = createAction(type, description, objectId, objectType, beforeState, afterState, metadata);
    
    if (batchId.current) {
      batchActions.current.push(action);
    } else {
      const newState: HistoryState = {
        id: `state-${Date.now()}`,
        timestamp: new Date(),
        actions: [action],
        objectCount: 0, // Would be calculated from current state
        canvasSize: { width: 1080, height: 1080 }, // Would be from current state
        zoom: 1, // Would be from current state
        selectedIds: [], // Would be from current state
        bookmarked: false,
        starred: false,
        memoryUsage: 0,
        duration: 0,
        isCheckpoint: false,
        isAutoSave: false,
        isManualSave: false,
        isRestorePoint: false
      };
      
      const newHistory = history.slice(0, currentIndex + 1);
      newHistory.push(newState);
      
      // Limit history size
      if (newHistory.length > settings.maxHistorySize) {
        newHistory.shift();
      } else {
        setCurrentIndex(newHistory.length - 1);
      }
      
      saveHistory(newHistory);
      onActionPerformed?.(action);
    }
  }, [history, currentIndex, settings.maxHistorySize, createAction, saveHistory, onActionPerformed]);

  // Start batch operation
  const startBatch = useCallback((description: string) => {
    batchId.current = `batch-${Date.now()}`;
    batchActions.current = [];
  }, []);

  // End batch operation
  const endBatch = useCallback(() => {
    if (batchId.current && batchActions.current.length > 0) {
      const batchAction = createAction('batch', `Batch operation: ${batchActions.current.length} actions`);
      batchAction.batchId = batchId.current;
      batchAction.actions = batchActions.current;
      
      const newState: HistoryState = {
        id: `state-${Date.now()}`,
        timestamp: new Date(),
        actions: [batchAction],
        objectCount: 0,
        canvasSize: { width: 1080, height: 1080 },
        zoom: 1,
        selectedIds: [],
        bookmarked: false,
        starred: false,
        memoryUsage: 0,
        duration: 0,
        isCheckpoint: false,
        isAutoSave: false,
        isManualSave: false,
        isRestorePoint: false
      };
      
      const newHistory = history.slice(0, currentIndex + 1);
      newHistory.push(newState);
      
      if (newHistory.length > settings.maxHistorySize) {
        newHistory.shift();
      } else {
        setCurrentIndex(newHistory.length - 1);
      }
      
      saveHistory(newHistory);
      onActionPerformed?.(batchAction);
    }
    
    batchId.current = null;
    batchActions.current = [];
  }, [history, currentIndex, settings.maxHistorySize, createAction, saveHistory, onActionPerformed]);

  // Undo action
  const undo = useCallback(() => {
    if (currentIndex > 0) {
      const newIndex = currentIndex - 1;
      const state = history[newIndex];
      setCurrentIndex(newIndex);
      onUndo?.(state.actions[0]);
      onStateChange?.(state);
    }
  }, [currentIndex, history, onUndo, onStateChange]);

  // Redo action
  const redo = useCallback(() => {
    if (currentIndex < history.length - 1) {
      const newIndex = currentIndex + 1;
      const state = history[newIndex];
      setCurrentIndex(newIndex);
      onRedo?.(state.actions[0]);
      onStateChange?.(state);
    }
  }, [currentIndex, history, onRedo, onStateChange]);

  // Jump to specific state
  const jumpToState = useCallback((index: number) => {
    if (index >= 0 && index < history.length) {
      const state = history[index];
      setCurrentIndex(index);
      onStateChange?.(state);
    }
  }, [history, onStateChange]);

  // Create checkpoint
  const createCheckpoint = useCallback((description?: string) => {
    const checkpoint: HistoryState = {
      id: `checkpoint-${Date.now()}`,
      timestamp: new Date(),
      actions: [],
      objectCount: 0,
      canvasSize: { width: 1080, height: 1080 },
      zoom: 1,
      selectedIds: [],
      description,
      bookmarked: false,
      starred: false,
      memoryUsage: 0,
      duration: 0,
      isCheckpoint: true,
      isAutoSave: false,
      isManualSave: false,
      isRestorePoint: false
    };
    
    const newHistory = [...history, checkpoint];
    saveHistory(newHistory);
    setCurrentIndex(newHistory.length - 1);
    onCheckpoint?.(checkpoint);
  }, [history, saveHistory, onCheckpoint]);

  // Restore from state
  const restoreFromState = useCallback((state: HistoryState) => {
    setCurrentIndex(history.findIndex(s => s.id === state.id));
    onRestore?.(state);
  }, [history, onRestore]);

  // Clear history
  const clearHistory = useCallback(() => {
    if (window.confirm('Are you sure you want to clear all history? This action cannot be undone.')) {
      setHistory([]);
      setCurrentIndex(-1);
      saveHistory([]);
    }
  }, [saveHistory]);

  // Export history
  const exportHistory = useCallback(() => {
    const dataStr = JSON.stringify(history, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `history-${new Date().toISOString()}.json`;
    link.click();
    URL.revokeObjectURL(url);
    onExport?.(history);
  }, [history, onExport]);

  // Import history
  const importHistory = useCallback((file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const imported = JSON.parse(e.target?.result as string);
        const parsedHistory = imported.map((state: any) => ({
          ...state,
          timestamp: new Date(state.timestamp),
          actions: state.actions.map((action: any) => ({
            ...action,
            timestamp: new Date(action.timestamp)
          }))
        }));
        setHistory(parsedHistory);
        setCurrentIndex(parsedHistory.length - 1);
        saveHistory(parsedHistory);
        onImport?.(parsedHistory);
      } catch (error) {
        console.error('Failed to import history:', error);
      }
    };
    reader.readAsText(file);
  }, [saveHistory, onImport]);

  // Playback history
  const startPlayback = useCallback(() => {
    if (currentIndex < history.length - 1) {
      setIsPlaying(true);
      const interval = setInterval(() => {
        setCurrentIndex(prev => {
          if (prev < history.length - 1) {
            const nextIndex = prev + 1;
            const state = history[nextIndex];
            onStateChange?.(state);
            return nextIndex;
          } else {
            setIsPlaying(false);
            clearInterval(interval);
            return prev;
          }
        });
      }, 1000 / playbackSpeed);
      playbackInterval.current = interval;
    }
  }, [currentIndex, history, playbackSpeed, onStateChange]);

  // Stop playback
  const stopPlayback = useCallback(() => {
    setIsPlaying(false);
    if (playbackInterval.current) {
      clearInterval(playbackInterval.current);
      playbackInterval.current = null;
    }
  }, []);

  // Filter history
  const filteredHistory = history.filter(state => {
    if (filter.category !== 'all' && state.actions.some(action => action.category !== filter.category)) {
      return false;
    }
    if (filter.type !== 'all' && state.actions.some(action => action.type !== filter.type)) {
      return false;
    }
    if (filter.search && !state.actions.some(action => 
      action.description.toLowerCase().includes(filter.search.toLowerCase())
    )) {
      return false;
    }
    return true;
  });

  // Sort history
  const sortedHistory = [...filteredHistory].sort((a, b) => {
    let comparison = 0;
    switch (sortBy) {
      case 'timestamp':
        comparison = a.timestamp.getTime() - b.timestamp.getTime();
        break;
      case 'duration':
        comparison = a.duration - b.duration;
        break;
      case 'memoryUsage':
        comparison = a.memoryUsage - b.memoryUsage;
        break;
      case 'objectCount':
        comparison = a.objectCount - b.objectCount;
        break;
    }
    return sortOrder === 'asc' ? comparison : -comparison;
  });

  // Get action icon
  const getActionIcon = (type: string) => {
    switch (type) {
      case 'create': return Plus;
      case 'update': return Edit;
      case 'delete': return Trash2;
      case 'move': return Move;
      case 'resize': return SquareIcon;
      case 'rotate': return RotateCw;
      case 'style': return Palette;
      case 'group': return Layers;
      case 'ungroup': return Layers;
      case 'duplicate': return Copy;
      case 'paste': return Clipboard;
      case 'cut': return Scissors;
      case 'copy': return Copy;
      case 'batch': return Zap;
      default: return History;
    }
  };

  // Get category color
  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'object': return 'text-blue-600 bg-blue-100';
      case 'canvas': return 'text-green-600 bg-green-100';
      case 'style': return 'text-purple-600 bg-purple-100';
      case 'layout': return 'text-orange-600 bg-orange-100';
      case 'system': return 'text-gray-600 bg-gray-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  // Format date
  const formatDate = (date: Date) => {
    return date.toLocaleString();
  };

  // Format duration
  const formatDuration = (ms: number) => {
    if (ms < 1000) return `${ms}ms`;
    if (ms < 60000) return `${(ms / 1000).toFixed(1)}s`;
    return `${(ms / 60000).toFixed(1)}m`;
  };

  return (
    <div className={`bg-white border border-gray-200 rounded-lg shadow-lg ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200">
        <div className="flex items-center space-x-2">
          <History className="w-5 h-5 text-blue-500" />
          <h3 className="text-lg font-semibold">History Manager</h3>
          <span className="text-sm text-gray-500">({history.length} states)</span>
        </div>
        
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setShowHistoryPanel(!showHistoryPanel)}
            className="p-2 rounded hover:bg-gray-100"
            title="Toggle History Panel"
          >
            <History className="w-4 h-4" />
          </button>
          
          <button
            onClick={() => setShowSettings(!showSettings)}
            className="p-2 rounded hover:bg-gray-100"
            title="Settings"
          >
            <Settings className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Controls */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-2">
            <button
              onClick={undo}
              disabled={currentIndex <= 0}
              className="p-2 rounded hover:bg-gray-100 disabled:opacity-50"
              title="Undo"
            >
              <Undo className="w-4 h-4" />
            </button>
            
            <button
              onClick={redo}
              disabled={currentIndex >= history.length - 1}
              className="p-2 rounded hover:bg-gray-100 disabled:opacity-50"
              title="Redo"
            >
              <Redo className="w-4 h-4" />
            </button>
            
            <div className="w-px h-6 bg-gray-300" />
            
            <button
              onClick={isPlaying ? stopPlayback : startPlayback}
              className="p-2 rounded hover:bg-gray-100"
              title={isPlaying ? 'Stop Playback' : 'Start Playback'}
            >
              {isPlaying ? <Square className="w-4 h-4" /> : <Play className="w-4 h-4" />}
            </button>
            
            <button
              onClick={() => createCheckpoint()}
              className="p-2 rounded hover:bg-gray-100"
              title="Create Checkpoint"
            >
              <Save className="w-4 h-4" />
            </button>
          </div>
          
          <div className="flex items-center space-x-2">
            <span className="text-sm text-gray-500">
              {currentIndex + 1} / {history.length}
            </span>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div 
            className="bg-blue-600 h-2 rounded-full transition-all duration-300"
            style={{ width: `${((currentIndex + 1) / Math.max(history.length, 1)) * 100}%` }}
          />
        </div>
      </div>

      {/* History List */}
      {showHistoryPanel && (
        <div className="p-4 max-h-96 overflow-y-auto">
          {history.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <History className="w-12 h-12 mx-auto mb-4 text-gray-300" />
              <p>No history available</p>
              <p className="text-sm">Start editing to see history</p>
            </div>
          ) : (
            <div className="space-y-2">
              {sortedHistory.map((state, index) => (
                <div
                  key={state.id}
                  className={`p-3 border rounded-lg cursor-pointer hover:bg-gray-50 ${
                    index === currentIndex ? 'border-blue-500 bg-blue-50' : 'border-gray-200'
                  }`}
                  onClick={() => jumpToState(index)}
                >
                  <div className="flex items-start space-x-3">
                    <div className="flex-shrink-0">
                      {state.actions.length > 0 ? (
                        React.createElement(getActionIcon(state.actions[0].type), { 
                          className: "w-5 h-5 text-gray-500" 
                        })
                      ) : (
                        <History className="w-5 h-5 text-gray-500" />
                      )}
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-2 mb-1">
                        <span className="font-medium text-gray-900 truncate">
                          {state.actions.length > 0 ? state.actions[0].description : 'Checkpoint'}
                        </span>
                        {state.isCheckpoint && (
                          <span className="px-2 py-1 text-xs bg-yellow-100 text-yellow-800 rounded">
                            Checkpoint
                          </span>
                        )}
                        {state.bookmarked && (
                          <Bookmark className="w-4 h-4 text-yellow-500" />
                        )}
                        {state.starred && (
                          <Star className="w-4 h-4 text-yellow-500" />
                        )}
                      </div>
                      
                      <div className="flex items-center space-x-4 text-xs text-gray-500">
                        <div className="flex items-center space-x-1">
                          <Clock className="w-3 h-3" />
                          <span>{formatDate(state.timestamp)}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <Layers className="w-3 h-3" />
                          <span>{state.objectCount} objects</span>
                        </div>
                        {state.actions.length > 0 && (
                          <div className="flex items-center space-x-1">
                            <span className={`px-2 py-1 text-xs rounded ${getCategoryColor(state.actions[0].category)}`}>
                              {state.actions[0].category}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-1">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedState(state);
                        }}
                        className="p-1 text-blue-600 hover:bg-blue-100 rounded"
                        title="View Details"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* State Details Modal */}
      {selectedState && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl h-5/6 p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">State Details</h3>
              <button
                onClick={() => setSelectedState(null)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Timestamp
                  </label>
                  <p className="text-sm text-gray-900">{formatDate(selectedState.timestamp)}</p>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Object Count
                  </label>
                  <p className="text-sm text-gray-900">{selectedState.objectCount}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Canvas Size
                  </label>
                  <p className="text-sm text-gray-900">
                    {selectedState.canvasSize.width} × {selectedState.canvasSize.height}
                  </p>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Zoom Level
                  </label>
                  <p className="text-sm text-gray-900">{selectedState.zoom}x</p>
                </div>
              </div>

              {selectedState.actions.length > 0 && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Actions
                  </label>
                  <div className="space-y-2">
                    {selectedState.actions.map(action => (
                      <div key={action.id} className="p-2 bg-gray-50 rounded">
                        <div className="flex items-center space-x-2">
                          {React.createElement(getActionIcon(action.type), { className: "w-4 h-4" })}
                          <span className="text-sm font-medium">{action.description}</span>
                          <span className={`px-2 py-1 text-xs rounded ${getCategoryColor(action.category)}`}>
                            {action.category}
                          </span>
                        </div>
                        <div className="text-xs text-gray-500 mt-1">
                          {formatDate(action.timestamp)} • {action.objectType || 'Unknown'}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex items-center justify-between pt-4 border-t">
                <div className="flex space-x-2">
                  <button
                    onClick={() => restoreFromState(selectedState)}
                    className="flex items-center space-x-2 px-3 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                  >
                    <RotateCcw className="w-4 h-4" />
                    <span>Restore</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// Hook for history management
export const useHistoryManager = () => {
  const [history, setHistory] = useState<HistoryState[]>([]);
  const [currentIndex, setCurrentIndex] = useState(-1);

  const addAction = useCallback((
    type: HistoryAction['type'],
    description: string,
    objectId?: string,
    objectType?: string,
    beforeState?: any,
    afterState?: any,
    metadata?: any
  ) => {
    // Implementation would go here
  }, []);

  const undo = useCallback(() => {
    if (currentIndex > 0) {
      setCurrentIndex(prev => prev - 1);
    }
  }, [currentIndex]);

  const redo = useCallback(() => {
    if (currentIndex < history.length - 1) {
      setCurrentIndex(prev => prev + 1);
    }
  }, [currentIndex, history.length]);

  const canUndo = currentIndex > 0;
  const canRedo = currentIndex < history.length - 1;

  return {
    history,
    currentIndex,
    addAction,
    undo,
    redo,
    canUndo,
    canRedo
  };
};
