import React, { useState, useEffect } from 'react';
import { Keyboard, Search, RotateCcw, Save, Download, Trash2, Plus, Edit3 } from 'lucide-react';
import { sanitizeHtml } from '../utils/security';

interface Shortcut {
  id: string;
  name: string;
  description: string;
  keys: string[];
  action: string;
  category: string;
  customizable: boolean;
  default: string[];
}

interface CustomShortcutsProps {
  onClose: () => void;
  onShortcutsUpdate: (shortcuts: Shortcut[]) => void;
}

const DEFAULT_SHORTCUTS: Shortcut[] = [
  // Selection & Navigation
  { id: 'select', name: 'Select Tool', description: 'Switch to selection tool', keys: ['V'], action: 'tool.select', category: 'Tools', customizable: true, default: ['V'] },
  { id: 'text', name: 'Text Tool', description: 'Switch to text tool', keys: ['T'], action: 'tool.text', category: 'Tools', customizable: true, default: ['T'] },
  { id: 'shape', name: 'Shape Tool', description: 'Switch to shape tool', keys: ['R'], action: 'tool.shape', category: 'Tools', customizable: true, default: ['R'] },
  { id: 'pan', name: 'Pan Tool', description: 'Switch to pan tool', keys: ['H'], action: 'tool.pan', category: 'Tools', customizable: true, default: ['H'] },
  { id: 'zoom', name: 'Zoom Tool', description: 'Switch to zoom tool', keys: ['Z'], action: 'tool.zoom', category: 'Tools', customizable: true, default: ['Z'] },

  // Edit Operations
  { id: 'undo', name: 'Undo', description: 'Undo last action', keys: ['Ctrl', 'Z'], action: 'edit.undo', category: 'Edit', customizable: true, default: ['Ctrl', 'Z'] },
  { id: 'redo', name: 'Redo', description: 'Redo last undone action', keys: ['Ctrl', 'Y'], action: 'edit.redo', category: 'Edit', customizable: true, default: ['Ctrl', 'Y'] },
  { id: 'copy', name: 'Copy', description: 'Copy selected objects', keys: ['Ctrl', 'C'], action: 'edit.copy', category: 'Edit', customizable: true, default: ['Ctrl', 'C'] },
  { id: 'paste', name: 'Paste', description: 'Paste copied objects', keys: ['Ctrl', 'V'], action: 'edit.paste', category: 'Edit', customizable: true, default: ['Ctrl', 'V'] },
  { id: 'cut', name: 'Cut', description: 'Cut selected objects', keys: ['Ctrl', 'X'], action: 'edit.cut', category: 'Edit', customizable: true, default: ['Ctrl', 'X'] },
  { id: 'delete', name: 'Delete', description: 'Delete selected objects', keys: ['Delete'], action: 'edit.delete', category: 'Edit', customizable: true, default: ['Delete'] },
  { id: 'duplicate', name: 'Duplicate', description: 'Duplicate selected objects', keys: ['Ctrl', 'D'], action: 'edit.duplicate', category: 'Edit', customizable: true, default: ['Ctrl', 'D'] },
  { id: 'selectAll', name: 'Select All', description: 'Select all objects', keys: ['Ctrl', 'A'], action: 'edit.selectAll', category: 'Edit', customizable: true, default: ['Ctrl', 'A'] },

  // File Operations
  { id: 'new', name: 'New Project', description: 'Create new project', keys: ['Ctrl', 'N'], action: 'file.new', category: 'File', customizable: true, default: ['Ctrl', 'N'] },
  { id: 'open', name: 'Open Project', description: 'Open existing project', keys: ['Ctrl', 'O'], action: 'file.open', category: 'File', customizable: true, default: ['Ctrl', 'O'] },
  { id: 'save', name: 'Save Project', description: 'Save current project', keys: ['Ctrl', 'S'], action: 'file.save', category: 'File', customizable: true, default: ['Ctrl', 'S'] },
  { id: 'saveAs', name: 'Save As', description: 'Save project with new name', keys: ['Ctrl', 'Shift', 'S'], action: 'file.saveAs', category: 'File', customizable: true, default: ['Ctrl', 'Shift', 'S'] },
  { id: 'export', name: 'Export', description: 'Export project', keys: ['Ctrl', 'E'], action: 'file.export', category: 'File', customizable: true, default: ['Ctrl', 'E'] },

  // View Operations
  { id: 'zoomIn', name: 'Zoom In', description: 'Zoom in on canvas', keys: ['Ctrl', '='], action: 'view.zoomIn', category: 'View', customizable: true, default: ['Ctrl', '='] },
  { id: 'zoomOut', name: 'Zoom Out', description: 'Zoom out on canvas', keys: ['Ctrl', '-'], action: 'view.zoomOut', category: 'View', customizable: true, default: ['Ctrl', '-'] },
  { id: 'zoomFit', name: 'Zoom to Fit', description: 'Fit canvas to window', keys: ['Ctrl', '0'], action: 'view.zoomFit', category: 'View', customizable: true, default: ['Ctrl', '0'] },
  { id: 'zoom100', name: 'Zoom 100%', description: 'Set zoom to 100%', keys: ['Ctrl', '1'], action: 'view.zoom100', category: 'View', customizable: true, default: ['Ctrl', '1'] },
  { id: 'toggleGrid', name: 'Toggle Grid', description: 'Show/hide grid', keys: ['Ctrl', 'G'], action: 'view.toggleGrid', category: 'View', customizable: true, default: ['Ctrl', 'G'] },
  { id: 'toggleRulers', name: 'Toggle Rulers', description: 'Show/hide rulers', keys: ['Ctrl', 'R'], action: 'view.toggleRulers', category: 'View', customizable: true, default: ['Ctrl', 'R'] },

  // Object Operations
  { id: 'group', name: 'Group Objects', description: 'Group selected objects', keys: ['Ctrl', 'G'], action: 'object.group', category: 'Object', customizable: true, default: ['Ctrl', 'G'] },
  { id: 'ungroup', name: 'Ungroup Objects', description: 'Ungroup selected group', keys: ['Ctrl', 'Shift', 'G'], action: 'object.ungroup', category: 'Object', customizable: true, default: ['Ctrl', 'Shift', 'G'] },
  { id: 'bringToFront', name: 'Bring to Front', description: 'Move object to front', keys: ['Ctrl', 'Shift', ']'], action: 'object.bringToFront', category: 'Object', customizable: true, default: ['Ctrl', 'Shift', ']'] },
  { id: 'sendToBack', name: 'Send to Back', description: 'Move object to back', keys: ['Ctrl', 'Shift', '['], action: 'object.sendToBack', category: 'Object', customizable: true, default: ['Ctrl', 'Shift', '['] },
  { id: 'bringForward', name: 'Bring Forward', description: 'Move object forward', keys: ['Ctrl', ']'], action: 'object.bringForward', category: 'Object', customizable: true, default: ['Ctrl', ']'] },
  { id: 'sendBackward', name: 'Send Backward', description: 'Move object backward', keys: ['Ctrl', '['], action: 'object.sendBackward', category: 'Object', customizable: true, default: ['Ctrl', '['] },

  // Alignment
  { id: 'alignLeft', name: 'Align Left', description: 'Align objects to left', keys: ['Ctrl', 'Shift', 'L'], action: 'align.left', category: 'Align', customizable: true, default: ['Ctrl', 'Shift', 'L'] },
  { id: 'alignCenter', name: 'Align Center', description: 'Align objects to center', keys: ['Ctrl', 'Shift', 'C'], action: 'align.center', category: 'Align', customizable: true, default: ['Ctrl', 'Shift', 'C'] },
  { id: 'alignRight', name: 'Align Right', description: 'Align objects to right', keys: ['Ctrl', 'Shift', 'R'], action: 'align.right', category: 'Align', customizable: true, default: ['Ctrl', 'Shift', 'R'] },
  { id: 'alignTop', name: 'Align Top', description: 'Align objects to top', keys: ['Ctrl', 'Shift', 'T'], action: 'align.top', category: 'Align', customizable: true, default: ['Ctrl', 'Shift', 'T'] },
  { id: 'alignMiddle', name: 'Align Middle', description: 'Align objects to middle', keys: ['Ctrl', 'Shift', 'M'], action: 'align.middle', category: 'Align', customizable: true, default: ['Ctrl', 'Shift', 'M'] },
  { id: 'alignBottom', name: 'Align Bottom', description: 'Align objects to bottom', keys: ['Ctrl', 'Shift', 'B'], action: 'align.bottom', category: 'Align', customizable: true, default: ['Ctrl', 'Shift', 'B'] }
];

const CATEGORIES = ['All', 'Tools', 'Edit', 'File', 'View', 'Object', 'Align'];

export const CustomShortcuts: React.FC<CustomShortcutsProps> = ({ onClose, onShortcutsUpdate }) => {
  const [shortcuts, setShortcuts] = useState<Shortcut[]>(DEFAULT_SHORTCUTS);
  const [filteredShortcuts, setFilteredShortcuts] = useState<Shortcut[]>(DEFAULT_SHORTCUTS);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [editingShortcut, setEditingShortcut] = useState<string | null>(null);
  const [recordingKeys, setRecordingKeys] = useState<string[]>([]);
  const [isRecording, setIsRecording] = useState(false);

  useEffect(() => {
    let filtered = shortcuts;

    if (selectedCategory !== 'All') {
      filtered = filtered.filter(shortcut => shortcut.category === selectedCategory);
    }

    if (searchQuery) {
      filtered = filtered.filter(shortcut =>
        shortcut.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        shortcut.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        shortcut.keys.some(key => key.toLowerCase().includes(searchQuery.toLowerCase()))
      );
    }

    setFilteredShortcuts(filtered);
  }, [shortcuts, selectedCategory, searchQuery]);

  useEffect(() => {
    if (!isRecording) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      e.preventDefault();
      e.stopPropagation();

      const key = e.key;
      const modifiers = [];
      
      if (e.ctrlKey || e.metaKey) modifiers.push('Ctrl');
      if (e.shiftKey) modifiers.push('Shift');
      if (e.altKey) modifiers.push('Alt');
      
      if (!['Control', 'Shift', 'Alt', 'Meta'].includes(key)) {
        const newKeys = [...modifiers, key];
        setRecordingKeys(newKeys);
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      if (!['Control', 'Shift', 'Alt', 'Meta'].includes(e.key) && recordingKeys.length > 0) {
        setIsRecording(false);
      }
    };

    document.addEventListener('keydown', handleKeyDown, true);
    document.addEventListener('keyup', handleKeyUp, true);

    return () => {
      document.removeEventListener('keydown', handleKeyDown, true);
      document.removeEventListener('keyup', handleKeyUp, true);
    };
  }, [isRecording, recordingKeys]);

  const startRecording = (shortcutId: string) => {
    setEditingShortcut(shortcutId);
    setRecordingKeys([]);
    setIsRecording(true);
  };

  const saveShortcut = () => {
    if (!editingShortcut || recordingKeys.length === 0) return;

    setShortcuts(prev => prev.map(shortcut =>
      shortcut.id === editingShortcut
        ? { ...shortcut, keys: recordingKeys }
        : shortcut
    ));

    setEditingShortcut(null);
    setRecordingKeys([]);
    setIsRecording(false);
  };

  const resetShortcut = (shortcutId: string) => {
    setShortcuts(prev => prev.map(shortcut =>
      shortcut.id === shortcutId
        ? { ...shortcut, keys: [...shortcut.default] }
        : shortcut
    ));
  };

  const resetAllShortcuts = () => {
    setShortcuts(prev => prev.map(shortcut => ({
      ...shortcut,
      keys: [...shortcut.default]
    })));
  };

  const exportShortcuts = () => {
    const data = JSON.stringify(shortcuts, null, 2);
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'shortcuts.json';
    a.click();
    URL.revokeObjectURL(url);
  };

  const importShortcuts = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const imported = JSON.parse(e.target?.result as string);
        setShortcuts(imported);
      } catch (error) {
        alert('Invalid shortcuts file');
      }
    };
    reader.readAsText(file);
  };

  const formatKeys = (keys: string[]) => {
    return keys.map(key => {
      switch (key) {
        case 'Ctrl': return '⌘';
        case 'Shift': return '⇧';
        case 'Alt': return '⌥';
        case 'Delete': return '⌫';
        case 'Backspace': return '⌫';
        case 'Enter': return '↵';
        case 'Tab': return '⇥';
        case 'Escape': return '⎋';
        case ' ': return 'Space';
        default: return key.toUpperCase();
      }
    }).join(' + ');
  };

  const checkConflict = (keys: string[], excludeId?: string) => {
    return shortcuts.find(shortcut =>
      shortcut.id !== excludeId &&
      shortcut.keys.length === keys.length &&
      shortcut.keys.every((key, index) => key === keys[index])
    );
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-[90vw] h-[80vh] max-w-5xl flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b">
          <div>
            <h2 className="text-xl font-semibold flex items-center gap-2">
              <Keyboard className="w-5 h-5" />
              Keyboard Shortcuts
            </h2>
            <p className="text-sm text-gray-500">Customize keyboard shortcuts for faster workflow</p>
          </div>
          <div className="flex items-center gap-2">
            <input
              type="file"
              accept=".json"
              onChange={importShortcuts}
              className="hidden"
              id="import-shortcuts"
            />
            <label
              htmlFor="import-shortcuts"
              className="px-3 py-1.5 border rounded hover:bg-gray-50 cursor-pointer text-sm"
            >
              Import
            </label>
            <button
              onClick={exportShortcuts}
              className="px-3 py-1.5 border rounded hover:bg-gray-50 text-sm"
            >
              Export
            </button>
            <button
              onClick={resetAllShortcuts}
              className="px-3 py-1.5 border rounded hover:bg-gray-50 text-sm flex items-center gap-1"
            >
              <RotateCcw className="w-3 h-3" />
              Reset All
            </button>
            <button
              onClick={() => {
                onShortcutsUpdate(shortcuts);
                onClose();
              }}
              className="px-3 py-1.5 bg-blue-500 text-white rounded hover:bg-blue-600"
            >
              Save Changes
            </button>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded"
            >
              ×
            </button>
          </div>
        </div>

        <div className="flex flex-1 overflow-hidden">
          {/* Sidebar */}
          <div className="w-48 border-r bg-gray-50 p-4">
            <div className="space-y-1">
              {CATEGORIES.map(category => (
                <button
                  key={category}
                  onClick={() => setSelectedCategory(category)}
                  className={`w-full text-left px-3 py-2 rounded text-sm hover:bg-gray-200 ${
                    selectedCategory === category ? 'bg-blue-100 text-blue-700' : ''
                  }`}
                >
                  {category}
                  <span className="float-right text-xs text-gray-500">
                    {category === 'All' 
                      ? shortcuts.length 
                      : shortcuts.filter(s => s.category === category).length
                    }
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Main Content */}
          <div className="flex-1 flex flex-col">
            {/* Search */}
            <div className="p-4 border-b">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="text"
                  placeholder="Search shortcuts..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border rounded-lg"
                />
              </div>
            </div>

            {/* Shortcuts List */}
            <div className="flex-1 overflow-auto">
              <div className="divide-y">
                {filteredShortcuts.map(shortcut => {
                  const conflict = checkConflict(recordingKeys, shortcut.id);
                  const isEditing = editingShortcut === shortcut.id;
                  
                  return (
                    <div key={shortcut.id} className="p-4 hover:bg-gray-50">
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="font-medium">{shortcut.name}</h3>
                            <span className="px-2 py-0.5 bg-gray-100 text-xs rounded">
                              {shortcut.category}
                            </span>
                          </div>
                          <p className="text-sm text-gray-600">{shortcut.description}</p>
                        </div>
                        
                        <div className="flex items-center gap-3">
                          <div className="text-right">
                            <div className={`font-mono text-sm px-3 py-1 rounded border ${
                              isEditing ? 'bg-blue-50 border-blue-200' : 'bg-gray-50'
                            }`}>
                              {isEditing && isRecording
                                ? recordingKeys.length > 0 
                                  ? formatKeys(recordingKeys)
                                  : 'Press keys...'
                                : formatKeys(shortcut.keys)
                              }
                            </div>
                            {isEditing && conflict && (
                              <p className="text-xs text-red-500 mt-1">
                                Conflicts with {conflict.name}
                              </p>
                            )}
                          </div>
                          
                          <div className="flex items-center gap-1">
                            {isEditing ? (
                              <>
                                <button
                                  onClick={saveShortcut}
                                  disabled={recordingKeys.length === 0 || !!conflict}
                                  className="p-1 text-green-600 hover:bg-green-50 rounded disabled:opacity-50"
                                >
                                  <Save className="w-4 h-4" />
                                </button>
                                <button
                                  onClick={() => {
                                    setEditingShortcut(null);
                                    setRecordingKeys([]);
                                    setIsRecording(false);
                                  }}
                                  className="p-1 text-gray-600 hover:bg-gray-100 rounded"
                                >
                                  ×
                                </button>
                              </>
                            ) : (
                              <>
                                <button
                                  onClick={() => startRecording(shortcut.id)}
                                  className="p-1 text-blue-600 hover:bg-blue-50 rounded"
                                  disabled={!shortcut.customizable}
                                >
                                  <Edit3 className="w-4 h-4" />
                                </button>
                                <button
                                  onClick={() => resetShortcut(shortcut.id)}
                                  className="p-1 text-gray-600 hover:bg-gray-100 rounded"
                                  disabled={!shortcut.customizable}
                                >
                                  <RotateCcw className="w-4 h-4" />
                                </button>
                              </>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        {/* Recording Overlay */}
        {isRecording && (
          <div className="absolute inset-0 bg-black/25 flex items-center justify-center">
            <div className="bg-white rounded-lg p-6 shadow-xl">
              <div className="text-center">
                <Keyboard className="w-12 h-12 mx-auto mb-4 text-blue-500" />
                <h3 className="text-lg font-medium mb-2">Recording Shortcut</h3>
                <p className="text-gray-600 mb-4">Press the key combination you want to use</p>
                <div className="font-mono text-xl p-3 bg-gray-100 rounded">
                  {recordingKeys.length > 0 ? formatKeys(recordingKeys) : 'Waiting...'}
                </div>
                <button
                  onClick={() => {
                    setIsRecording(false);
                    setEditingShortcut(null);
                    setRecordingKeys([]);
                  }}
                  className="mt-4 px-4 py-2 text-gray-600 hover:bg-gray-100 rounded"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};