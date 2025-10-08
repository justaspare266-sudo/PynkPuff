'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Keyboard, Command, Zap, Eye, EyeOff, Lock, Unlock } from 'lucide-react';

export interface KeyboardShortcut {
  id: string;
  name: string;
  description: string;
  keys: string[];
  category: 'file' | 'edit' | 'view' | 'tools' | 'selection' | 'transform' | 'layers' | 'help';
  action: () => void;
  isEnabled: boolean;
  isGlobal: boolean;
}

export interface KeyboardShortcutsProps {
  onAction: (action: string) => void;
  onToolSelect: (tool: string) => void;
  onUndo: () => void;
  onRedo: () => void;
  onCopy: () => void;
  onPaste: () => void;
  onCut: () => void;
  onDelete: () => void;
  onSelectAll: () => void;
  onDeselectAll: () => void;
  onGroup: () => void;
  onUngroup: () => void;
  onBringToFront: () => void;
  onSendToBack: () => void;
  onBringForward: () => void;
  onSendBackward: () => void;
  onFlipHorizontal: () => void;
  onFlipVertical: () => void;
  onZoomIn: () => void;
  onZoomOut: () => void;
  onZoomReset: () => void;
  onZoomToFit: () => void;
  onZoomToSelection: () => void;
  onToggleGrid: () => void;
  onToggleRulers: () => void;
  onToggleGuides: () => void;
  onToggleLayers: () => void;
  onToggleProperties: () => void;
  onSave: () => void;
  onLoad: () => void;
  onExport: () => void;
  onShowHelp: () => void;
  onShowSettings: () => void;
  className?: string;
}

const KeyboardShortcuts: React.FC<KeyboardShortcutsProps> = ({
  onAction,
  onToolSelect,
  onUndo,
  onRedo,
  onCopy,
  onPaste,
  onCut,
  onDelete,
  onSelectAll,
  onDeselectAll,
  onGroup,
  onUngroup,
  onBringToFront,
  onSendToBack,
  onBringForward,
  onSendBackward,
  onFlipHorizontal,
  onFlipVertical,
  onZoomIn,
  onZoomOut,
  onZoomReset,
  onZoomToFit,
  onZoomToSelection,
  onToggleGrid,
  onToggleRulers,
  onToggleGuides,
  onToggleLayers,
  onToggleProperties,
  onSave,
  onLoad,
  onExport,
  onShowHelp,
  onShowSettings,
  className = ''
}) => {
  const [shortcuts, setShortcuts] = useState<KeyboardShortcut[]>([]);
  const [showShortcuts, setShowShortcuts] = useState(false);
  const [pressedKeys, setPressedKeys] = useState<Set<string>>(new Set());
  const [isRecording, setIsRecording] = useState(false);
  const [recordingShortcut, setRecordingShortcut] = useState<string | null>(null);

  // Initialize shortcuts
  useEffect(() => {
    const initialShortcuts: KeyboardShortcut[] = [
      // File operations
      { id: 'save', name: 'Save', description: 'Save current project', keys: ['Ctrl', 'S'], category: 'file', action: onSave, isEnabled: true, isGlobal: false },
      { id: 'load', name: 'Load', description: 'Load project from file', keys: ['Ctrl', 'O'], category: 'file', action: onLoad, isEnabled: true, isGlobal: false },
      { id: 'export', name: 'Export', description: 'Export project', keys: ['Ctrl', 'E'], category: 'file', action: onExport, isEnabled: true, isGlobal: false },
      
      // Edit operations
      { id: 'undo', name: 'Undo', description: 'Undo last action', keys: ['Ctrl', 'Z'], category: 'edit', action: onUndo, isEnabled: true, isGlobal: false },
      { id: 'redo', name: 'Redo', description: 'Redo last undone action', keys: ['Ctrl', 'Y'], category: 'edit', action: onRedo, isEnabled: true, isGlobal: false },
      { id: 'copy', name: 'Copy', description: 'Copy selected elements', keys: ['Ctrl', 'C'], category: 'edit', action: onCopy, isEnabled: true, isGlobal: false },
      { id: 'paste', name: 'Paste', description: 'Paste copied elements', keys: ['Ctrl', 'V'], category: 'edit', action: onPaste, isEnabled: true, isGlobal: false },
      { id: 'cut', name: 'Cut', description: 'Cut selected elements', keys: ['Ctrl', 'X'], category: 'edit', action: onCut, isEnabled: true, isGlobal: false },
      { id: 'delete', name: 'Delete', description: 'Delete selected elements', keys: ['Delete'], category: 'edit', action: onDelete, isEnabled: true, isGlobal: false },
      { id: 'selectAll', name: 'Select All', description: 'Select all elements', keys: ['Ctrl', 'A'], category: 'edit', action: onSelectAll, isEnabled: true, isGlobal: false },
      { id: 'deselectAll', name: 'Deselect All', description: 'Deselect all elements', keys: ['Escape'], category: 'edit', action: onDeselectAll, isEnabled: true, isGlobal: false },
      
      // Tools
      { id: 'selectTool', name: 'Select Tool', description: 'Switch to select tool', keys: ['V'], category: 'tools', action: () => onToolSelect('select'), isEnabled: true, isGlobal: false },
      { id: 'textTool', name: 'Text Tool', description: 'Switch to text tool', keys: ['T'], category: 'tools', action: () => onToolSelect('text'), isEnabled: true, isGlobal: false },
      { id: 'rectTool', name: 'Rectangle Tool', description: 'Switch to rectangle tool', keys: ['R'], category: 'tools', action: () => onToolSelect('rect'), isEnabled: true, isGlobal: false },
      { id: 'circleTool', name: 'Circle Tool', description: 'Switch to circle tool', keys: ['C'], category: 'tools', action: () => onToolSelect('circle'), isEnabled: true, isGlobal: false },
      { id: 'lineTool', name: 'Line Tool', description: 'Switch to line tool', keys: ['L'], category: 'tools', action: () => onToolSelect('line'), isEnabled: true, isGlobal: false },
      { id: 'imageTool', name: 'Image Tool', description: 'Switch to image tool', keys: ['I'], category: 'tools', action: () => onToolSelect('image'), isEnabled: true, isGlobal: false },
      { id: 'cropTool', name: 'Crop Tool', description: 'Switch to crop tool', keys: ['Shift', 'C'], category: 'tools', action: () => onToolSelect('crop'), isEnabled: true, isGlobal: false },
      { id: 'penTool', name: 'Pen Tool', description: 'Switch to pen tool', keys: ['P'], category: 'tools', action: () => onToolSelect('pen'), isEnabled: true, isGlobal: false },
      
      // Selection
      { id: 'group', name: 'Group', description: 'Group selected elements', keys: ['Ctrl', 'G'], category: 'selection', action: onGroup, isEnabled: true, isGlobal: false },
      { id: 'ungroup', name: 'Ungroup', description: 'Ungroup selected elements', keys: ['Ctrl', 'Shift', 'G'], category: 'selection', action: onUngroup, isEnabled: true, isGlobal: false },
      
      // Transform
      { id: 'bringToFront', name: 'Bring to Front', description: 'Bring selected elements to front', keys: ['Ctrl', ']'], category: 'transform', action: onBringToFront, isEnabled: true, isGlobal: false },
      { id: 'sendToBack', name: 'Send to Back', description: 'Send selected elements to back', keys: ['Ctrl', '['], category: 'transform', action: onSendToBack, isEnabled: true, isGlobal: false },
      { id: 'bringForward', name: 'Bring Forward', description: 'Bring selected elements forward', keys: ['Ctrl', 'Shift', ']'], category: 'transform', action: onBringForward, isEnabled: true, isGlobal: false },
      { id: 'sendBackward', name: 'Send Backward', description: 'Send selected elements backward', keys: ['Ctrl', 'Shift', '['], category: 'transform', action: onSendBackward, isEnabled: true, isGlobal: false },
      { id: 'flipHorizontal', name: 'Flip Horizontal', description: 'Flip selected elements horizontally', keys: ['Ctrl', 'H'], category: 'transform', action: onFlipHorizontal, isEnabled: true, isGlobal: false },
      { id: 'flipVertical', name: 'Flip Vertical', description: 'Flip selected elements vertically', keys: ['Ctrl', 'Shift', 'H'], category: 'transform', action: onFlipVertical, isEnabled: true, isGlobal: false },
      
      // View
      { id: 'zoomIn', name: 'Zoom In', description: 'Zoom in', keys: ['Ctrl', '+'], category: 'view', action: onZoomIn, isEnabled: true, isGlobal: false },
      { id: 'zoomOut', name: 'Zoom Out', description: 'Zoom out', keys: ['Ctrl', '-'], category: 'view', action: onZoomOut, isEnabled: true, isGlobal: false },
      { id: 'zoomReset', name: 'Reset Zoom', description: 'Reset zoom to 100%', keys: ['Ctrl', '0'], category: 'view', action: onZoomReset, isEnabled: true, isGlobal: false },
      { id: 'zoomToFit', name: 'Zoom to Fit', description: 'Zoom to fit all elements', keys: ['Ctrl', '1'], category: 'view', action: onZoomToFit, isEnabled: true, isGlobal: false },
      { id: 'zoomToSelection', name: 'Zoom to Selection', description: 'Zoom to selected elements', keys: ['Ctrl', '2'], category: 'view', action: onZoomToSelection, isEnabled: true, isGlobal: false },
      { id: 'toggleGrid', name: 'Toggle Grid', description: 'Toggle grid visibility', keys: ['Ctrl', 'Shift', 'G'], category: 'view', action: onToggleGrid, isEnabled: true, isGlobal: false },
      { id: 'toggleRulers', name: 'Toggle Rulers', description: 'Toggle rulers visibility', keys: ['Ctrl', 'R'], category: 'view', action: onToggleRulers, isEnabled: true, isGlobal: false },
      { id: 'toggleGuides', name: 'Toggle Guides', description: 'Toggle guides visibility', keys: ['Ctrl', 'Shift', 'R'], category: 'view', action: onToggleGuides, isEnabled: true, isGlobal: false },
      { id: 'toggleLayers', name: 'Toggle Layers', description: 'Toggle layers panel', keys: ['Ctrl', 'L'], category: 'view', action: onToggleLayers, isEnabled: true, isGlobal: false },
      { id: 'toggleProperties', name: 'Toggle Properties', description: 'Toggle properties panel', keys: ['Ctrl', 'P'], category: 'view', action: onToggleProperties, isEnabled: true, isGlobal: false },
      
      // Help
      { id: 'showHelp', name: 'Show Help', description: 'Show help and shortcuts', keys: ['F1'], category: 'help', action: onShowHelp, isEnabled: true, isGlobal: false },
      { id: 'showSettings', name: 'Show Settings', description: 'Show settings dialog', keys: ['Ctrl', ','], category: 'help', action: onShowSettings, isEnabled: true, isGlobal: false }
    ];
    
    setShortcuts(initialShortcuts);
  }, [
    onSave, onLoad, onExport, onUndo, onRedo, onCopy, onPaste, onCut, onDelete,
    onSelectAll, onDeselectAll, onGroup, onUngroup, onBringToFront, onSendToBack,
    onBringForward, onSendBackward, onFlipHorizontal, onFlipVertical, onZoomIn,
    onZoomOut, onZoomReset, onZoomToFit, onZoomToSelection, onToggleGrid,
    onToggleRulers, onToggleGuides, onToggleLayers, onToggleProperties,
    onShowHelp, onShowSettings, onToolSelect
  ]);

  // Handle keyboard events
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const key = e.key;
      const ctrlKey = e.ctrlKey || e.metaKey;
      const shiftKey = e.shiftKey;
      const altKey = e.altKey;
      
      // Update pressed keys
      setPressedKeys(prev => new Set([...prev, key]));
      
      // Find matching shortcut
      const matchingShortcut = shortcuts.find(shortcut => {
        if (!shortcut.isEnabled) return false;
        
        const keys = shortcut.keys;
        const hasCtrl = keys.includes('Ctrl') === ctrlKey;
        const hasShift = keys.includes('Shift') === shiftKey;
        const hasAlt = keys.includes('Alt') === altKey;
        const hasKey = keys.includes(key);
        
        return hasCtrl && hasShift && hasAlt && hasKey;
      });
      
      if (matchingShortcut) {
        e.preventDefault();
        matchingShortcut.action();
        onAction(matchingShortcut.id);
      }
      
      // Global shortcuts
      if (key === 'F1') {
        e.preventDefault();
        setShowShortcuts(true);
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      setPressedKeys(prev => {
        const newSet = new Set(prev);
        newSet.delete(e.key);
        return newSet;
      });
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [shortcuts, onAction]);

  const getShortcutsByCategory = (category: string) => {
    return shortcuts.filter(shortcut => shortcut.category === category);
  };

  const formatKeys = (keys: string[]) => {
    return keys.map(key => {
      switch (key) {
        case 'Ctrl': return 'Ctrl';
        case 'Shift': return 'Shift';
        case 'Alt': return 'Alt';
        case ' ': return 'Space';
        case 'ArrowUp': return '↑';
        case 'ArrowDown': return '↓';
        case 'ArrowLeft': return '←';
        case 'ArrowRight': return '→';
        default: return key.toUpperCase();
      }
    }).join(' + ');
  };

  const categories = [
    { id: 'file', name: 'File', icon: Command },
    { id: 'edit', name: 'Edit', icon: Zap },
    { id: 'tools', name: 'Tools', icon: Keyboard },
    { id: 'selection', name: 'Selection', icon: Eye },
    { id: 'transform', name: 'Transform', icon: Lock },
    { id: 'view', name: 'View', icon: EyeOff },
    { id: 'help', name: 'Help', icon: Keyboard }
  ];

  return (
    <div className={`keyboard-shortcuts ${className}`}>
      {/* Shortcuts Toggle */}
      <button
        onClick={() => setShowShortcuts(!showShortcuts)}
        className="p-2 bg-gray-600 hover:bg-gray-500 rounded text-white"
        title="Keyboard Shortcuts (F1)"
      >
        <Keyboard className="w-4 h-4" />
      </button>

      {/* Shortcuts Panel */}
      {showShortcuts && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-gray-800 rounded-lg shadow-xl border border-gray-600 w-full max-w-4xl max-h-[80vh] overflow-hidden">
            <div className="p-4 border-b border-gray-600">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold">Keyboard Shortcuts</h2>
                <button
                  onClick={() => setShowShortcuts(false)}
                  className="p-2 bg-gray-600 hover:bg-gray-500 rounded text-white"
                >
                  ×
                </button>
              </div>
            </div>
            
            <div className="p-4 overflow-y-auto max-h-96">
              {categories.map(category => {
                const categoryShortcuts = getShortcutsByCategory(category.id);
                if (categoryShortcuts.length === 0) return null;
                
                const IconComponent = category.icon;
                
                return (
                  <div key={category.id} className="mb-6">
                    <div className="flex items-center space-x-2 mb-3">
                      <IconComponent className="w-5 h-5 text-blue-400" />
                      <h3 className="text-lg font-semibold">{category.name}</h3>
                    </div>
                    
                    <div className="space-y-2">
                      {categoryShortcuts.map(shortcut => (
                        <div
                          key={shortcut.id}
                          className="flex items-center justify-between p-2 bg-gray-700 rounded"
                        >
                          <div>
                            <div className="font-medium text-sm">{shortcut.name}</div>
                            <div className="text-xs text-gray-400">{shortcut.description}</div>
                          </div>
                          <div className="flex space-x-1">
                            {shortcut.keys.map((key, index) => (
                              <React.Fragment key={index}>
                                <kbd className="px-2 py-1 bg-gray-600 rounded text-xs font-mono">
                                  {key}
                                </kbd>
                                {index < shortcut.keys.length - 1 && (
                                  <span className="text-gray-400">+</span>
                                )}
                              </React.Fragment>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default KeyboardShortcuts;
