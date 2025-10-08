'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Undo, Redo, History, Trash2, Clock, Save, RotateCw, Upload } from 'lucide-react';
import { HistoryManager, HistoryState } from '../src/utils/HistoryManager';

export interface HistorySystemProps {
  onStateChange: (state: any) => void;
  onElementUpdate: (elements: any[]) => void;
  elements: any[];
  selectedElementIds: string[];
  className?: string;
}

const HistorySystem: React.FC<HistorySystemProps> = ({
  onStateChange,
  onElementUpdate,
  elements,
  selectedElementIds,
  className = ''
}) => {
  const [historyManager] = useState(() => new HistoryManager({
    maxHistorySize: 100,
    maxMemoryUsage: 50, // 50MB
    compressionEnabled: true,
    compressionThreshold: 1024 * 1024, // 1MB
    autoSave: true,
    autoSaveInterval: 30000, // 30 seconds
    groupSimilarActions: true,
    groupTimeWindow: 1000 // 1 second
  }));

  const [isGrouping, setIsGrouping] = useState(false);
  const [showHistoryPanel, setShowHistoryPanel] = useState(false);
  const [historyStats, setHistoryStats] = useState(historyManager.getStatistics());
  const [currentState, setCurrentState] = useState<HistoryState | null>(null);
  const [history, setHistory] = useState<HistoryState[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Update history when elements change
  useEffect(() => {
    if (elements.length > 0) {
      // Only add to history if this is a user action, not a history restoration
      if (!isLoading) {
        historyManager.addState(
          'elements_update',
          'Elements updated',
          { elements: [...elements] },
          selectedElementIds,
          'modify'
        );
        updateHistoryData();
      }
    }
  }, [elements, selectedElementIds, historyManager, isLoading]);

  const updateHistoryData = useCallback(() => {
    setHistory(historyManager.getHistory());
    setHistoryStats(historyManager.getStatistics());
    setCurrentState(historyManager.getCurrentState());
  }, [historyManager]);

  const handleUndo = useCallback(() => {
    setIsLoading(true);
    const state = historyManager.undo();
    if (state) {
      setCurrentState(state);
      onStateChange(state.data);
      if (state.data.elements) {
        onElementUpdate(state.data.elements);
      }
    }
    updateHistoryData();
    setIsLoading(false);
  }, [historyManager, onStateChange, onElementUpdate, updateHistoryData]);

  const handleRedo = useCallback(() => {
    setIsLoading(true);
    const state = historyManager.redo();
    if (state) {
      setCurrentState(state);
      onStateChange(state.data);
      if (state.data.elements) {
        onElementUpdate(state.data.elements);
      }
    }
    updateHistoryData();
    setIsLoading(false);
  }, [historyManager, onStateChange, onElementUpdate, updateHistoryData]);

  const handleClearHistory = useCallback(() => {
    historyManager.clearHistory();
    updateHistoryData();
  }, [historyManager, updateHistoryData]);

  const handleExportHistory = useCallback(() => {
    const historyData = historyManager.exportHistory();
    const blob = new Blob([historyData], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `history-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }, [historyManager]);

  const handleImportHistory = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const data = e.target?.result as string;
          historyManager.importHistory(data);
          updateHistoryData();
        } catch (error) {
          console.error('Failed to import history:', error);
        }
      };
      reader.readAsText(file);
    }
  }, [historyManager, updateHistoryData]);

  const handleStartGrouping = useCallback(() => {
    setIsGrouping(true);
    historyManager.startGrouping();
  }, [historyManager]);

  const handleEndGrouping = useCallback(() => {
    setIsGrouping(false);
    historyManager.endGrouping();
    updateHistoryData();
  }, [historyManager, updateHistoryData]);

  const handleJumpToState = useCallback((state: HistoryState) => {
    setIsLoading(true);
    // Find the index of the state
    const history = historyManager.getHistory();
    const index = history.findIndex(s => s.id === state.id);
    
    if (index !== -1) {
      // Undo/redo to the target state
      const currentIndex = historyManager.getCurrentState() ? 
        history.findIndex(s => s.id === historyManager.getCurrentState()!.id) : -1;
      
      if (index < currentIndex) {
        // Need to undo
        for (let i = currentIndex; i > index; i--) {
          const state = historyManager.undo();
          if (state) {
            onStateChange(state.data);
            if (state.data.elements) {
              onElementUpdate(state.data.elements);
            }
          }
        }
      } else if (index > currentIndex) {
        // Need to redo
        for (let i = currentIndex; i < index; i++) {
          const state = historyManager.redo();
          if (state) {
            onStateChange(state.data);
            if (state.data.elements) {
              onElementUpdate(state.data.elements);
            }
          }
        }
      }
    }
    
    updateHistoryData();
    setIsLoading(false);
  }, [historyManager, onStateChange, onElementUpdate, updateHistoryData]);

  const formatTimestamp = (timestamp: number) => {
    return new Date(timestamp).toLocaleTimeString();
  };

  const formatMemorySize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'create': return '➕';
      case 'modify': return '✏️';
      case 'delete': return '🗑️';
      case 'transform': return '🔄';
      case 'group': return '📦';
      case 'ungroup': return '📤';
      case 'layer': return '📋';
      case 'style': return '🎨';
      case 'animation': return '🎬';
      default: return '📝';
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'create': return 'text-green-400';
      case 'modify': return 'text-blue-400';
      case 'delete': return 'text-red-400';
      case 'transform': return 'text-purple-400';
      case 'group': return 'text-yellow-400';
      case 'ungroup': return 'text-orange-400';
      case 'layer': return 'text-cyan-400';
      case 'style': return 'text-pink-400';
      case 'animation': return 'text-indigo-400';
      default: return 'text-gray-400';
    }
  };

  return (
    <div className={`history-system ${className}`}>
      {/* History Controls */}
      <div className="flex items-center space-x-2 p-2 bg-gray-700 rounded">
        <button
          onClick={handleUndo}
          disabled={!historyManager.canUndo()}
          className={`p-2 rounded transition-colors ${
            historyManager.canUndo()
              ? 'bg-gray-600 hover:bg-gray-500 text-white'
              : 'bg-gray-700 text-gray-500 cursor-not-allowed'
          }`}
          title="Undo (Ctrl+Z)"
        >
          <Undo className="w-4 h-4" />
        </button>
        
        <button
          onClick={handleRedo}
          disabled={!historyManager.canRedo()}
          className={`p-2 rounded transition-colors ${
            historyManager.canRedo()
              ? 'bg-gray-600 hover:bg-gray-500 text-white'
              : 'bg-gray-700 text-gray-500 cursor-not-allowed'
          }`}
          title="Redo (Ctrl+Y)"
        >
          <Redo className="w-4 h-4" />
        </button>
        
        <div className="w-px h-6 bg-gray-600" />
        
        <button
          onClick={() => setShowHistoryPanel(!showHistoryPanel)}
          className={`p-2 rounded transition-colors ${
            showHistoryPanel
              ? 'bg-blue-600 text-white'
              : 'bg-gray-600 hover:bg-gray-500 text-white'
          }`}
          title="History Panel"
        >
          <History className="w-4 h-4" />
        </button>
        
        <div className="w-px h-6 bg-gray-600" />
        
        <button
          onClick={isGrouping ? handleEndGrouping : handleStartGrouping}
          className={`p-2 rounded transition-colors ${
            isGrouping
              ? 'bg-green-600 text-white'
              : 'bg-gray-600 hover:bg-gray-500 text-white'
          }`}
          title={isGrouping ? 'End Grouping' : 'Start Grouping'}
        >
          <RotateCw className="w-4 h-4" />
        </button>
        
        <button
          onClick={handleClearHistory}
          className="p-2 bg-red-600 hover:bg-red-500 rounded text-white"
          title="Clear History"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>

      {/* History Stats */}
      <div className="mt-2 text-xs text-gray-400">
        <div className="flex justify-between">
          <span>States: {historyStats.totalStates}</span>
          <span>Memory: {formatMemorySize(historyStats.memoryUsage)}</span>
        </div>
        <div className="flex justify-between">
          <span>Undoable: {historyStats.undoableStates}</span>
          <span>Redoable: {historyStats.redoableStates}</span>
        </div>
      </div>

      {/* History Panel */}
      {showHistoryPanel && (
        <div className="mt-4 bg-gray-800 rounded-lg border border-gray-600 max-h-96 overflow-hidden">
          <div className="p-3 border-b border-gray-600">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold">History</h3>
              <div className="flex space-x-2">
                <button
                  onClick={handleExportHistory}
                  className="p-1 bg-gray-600 hover:bg-gray-500 rounded text-xs"
                  title="Export History"
                >
                  <Save className="w-3 h-3" />
                </button>
                <input
                  type="file"
                  accept=".json"
                  onChange={handleImportHistory}
                  className="hidden"
                  id="import-history"
                />
                <label
                  htmlFor="import-history"
                  className="p-1 bg-gray-600 hover:bg-gray-500 rounded text-xs cursor-pointer"
                  title="Import History"
                >
                  <Upload className="w-3 h-3" />
                </label>
              </div>
            </div>
          </div>
          
          <div className="overflow-y-auto max-h-80">
            {history.length === 0 ? (
              <div className="p-4 text-center text-gray-400">
                <Clock className="w-8 h-8 mx-auto mb-2 opacity-50" />
                <p>No history available</p>
              </div>
            ) : (
              <div className="space-y-1">
                {history.map((state, index) => (
                  <div
                    key={state.id}
                    onClick={() => handleJumpToState(state)}
                    className={`p-3 cursor-pointer transition-colors ${
                      currentState?.id === state.id
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-700 hover:bg-gray-600 text-gray-300'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <span className="text-lg">
                          {getCategoryIcon(state.category)}
                        </span>
                        <div>
                          <div className="font-medium text-sm">
                            {state.description}
                          </div>
                          <div className="text-xs opacity-75">
                            {formatTimestamp(state.timestamp)}
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className={`text-xs font-medium ${getCategoryColor(state.category)}`}>
                          {state.category.toUpperCase()}
                        </div>
                        <div className="text-xs opacity-75">
                          {formatMemorySize(state.memorySize)}
                        </div>
                      </div>
                    </div>
                    
                    {state.elementIds.length > 0 && (
                      <div className="mt-2 text-xs opacity-75">
                        Elements: {state.elementIds.length}
                      </div>
                    )}
                    
                    {state.isUndoable && (
                      <div className="mt-1 text-xs opacity-50">
                        {state.isUndoable ? '✓' : '✗'} Undoable
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default HistorySystem;
