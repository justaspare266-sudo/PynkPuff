import React, { useState, useEffect, useCallback, useRef } from 'react';
import { 
  Keyboard, 
  Settings, 
  Save, 
  Download, 
  Upload, 
  Undo, 
  Redo, 
  Copy, 
  Clipboard, 
  Scissors, 
  Trash2, 
  MousePointer2 as SelectAll,
  Group, 
  Ungroup, 
  ArrowUp, 
  ArrowDown, 
  RotateCcw as FlipHorizontal, 
  RotateCw as FlipVertical, 
  RotateCw, 
  RotateCcw, 
  ZoomIn, 
  ZoomOut, 
  RotateCcw as ZoomReset, 
  Grid3X3, 
  Ruler, 
  Layers, 
  Settings as Properties, 
  HelpCircle, 
  X, 
  Check, 
  Edit, 
  Plus, 
  Minus, 
  Search,
  Type,
  Square,
  Circle,
  Triangle,
  Star,
  Image as ImageIcon,
  Palette,
  Filter,
  MousePointer
} from 'lucide-react';

export interface KeyboardShortcut {
  id: string;
  name: string;
  description: string;
  keys: string[];
  category: 'file' | 'edit' | 'view' | 'tools' | 'transform' | 'navigation' | 'help';
  isEnabled: boolean;
  action: () => void;
  icon?: React.ComponentType<any>;
}

interface EnhancedKeyboardShortcutsProps {
  onAction?: (actionId: string) => void;
  onToolSelect?: (tool: string) => void;
  onUndo?: () => void;
  onRedo?: () => void;
  onCopy?: () => void;
  onPaste?: () => void;
  onCut?: () => void;
  onDelete?: () => void;
  onSelectAll?: () => void;
  onDeselectAll?: () => void;
  onGroup?: () => void;
  onUngroup?: () => void;
  onBringToFront?: () => void;
  onSendToBack?: () => void;
  onBringForward?: () => void;
  onSendBackward?: () => void;
  onFlipHorizontal?: () => void;
  onFlipVertical?: () => void;
  onRotate90?: () => void;
  onRotate180?: () => void;
  onRotate270?: () => void;
  onZoomIn?: () => void;
  onZoomOut?: () => void;
  onZoomReset?: () => void;
  onZoomToFit?: () => void;
  onZoomToSelection?: () => void;
  onToggleGrid?: () => void;
  onToggleRulers?: () => void;
  onToggleGuides?: () => void;
  onToggleLayers?: () => void;
  onToggleProperties?: () => void;
  onShowHelp?: () => void;
  onShowSettings?: () => void;
  onSave?: () => void;
  onLoad?: () => void;
  onExport?: () => void;
  onClose?: () => void;
}

export const EnhancedKeyboardShortcuts: React.FC<EnhancedKeyboardShortcutsProps> = ({
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
  onRotate90,
  onRotate180,
  onRotate270,
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
  onShowHelp,
  onShowSettings,
  onSave,
  onLoad,
  onExport,
  onClose
}) => {
  const [shortcuts, setShortcuts] = useState<KeyboardShortcut[]>([]);
  const [pressedKeys, setPressedKeys] = useState<Set<string>>(new Set());
  const [showShortcuts, setShowShortcuts] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [isRecording, setIsRecording] = useState(false);
  const [recordingShortcut, setRecordingShortcut] = useState<string | null>(null);
  const [customShortcuts, setCustomShortcuts] = useState<Record<string, string[]>>({});

  const categories = [
    { id: 'all', name: 'All', icon: Keyboard },
    { id: 'file', name: 'File', icon: Save },
    { id: 'edit', name: 'Edit', icon: Edit },
    { id: 'view', name: 'View', icon: Grid3X3 },
    { id: 'tools', name: 'Tools', icon: MousePointer },
    { id: 'transform', name: 'Transform', icon: RotateCw },
    { id: 'navigation', name: 'Navigation', icon: ZoomIn },
    { id: 'help', name: 'Help', icon: HelpCircle }
  ];

  // Initialize shortcuts
  useEffect(() => {
    const initialShortcuts: KeyboardShortcut[] = [
      // File operations
      {
        id: 'save',
        name: 'Save',
        description: 'Save the current project',
        keys: ['Ctrl', 'S'],
        category: 'file',
        isEnabled: true,
        action: () => onSave?.(),
        icon: Save
      },
      {
        id: 'load',
        name: 'Load',
        description: 'Load a project',
        keys: ['Ctrl', 'O'],
        category: 'file',
        isEnabled: true,
        action: () => onLoad?.(),
        icon: Upload
      },
      {
        id: 'export',
        name: 'Export',
        description: 'Export the current project',
        keys: ['Ctrl', 'E'],
        category: 'file',
        isEnabled: true,
        action: () => onExport?.(),
        icon: Download
      },

      // Edit operations
      {
        id: 'undo',
        name: 'Undo',
        description: 'Undo the last action',
        keys: ['Ctrl', 'Z'],
        category: 'edit',
        isEnabled: true,
        action: () => onUndo?.(),
        icon: Undo
      },
      {
        id: 'redo',
        name: 'Redo',
        description: 'Redo the last undone action',
        keys: ['Ctrl', 'Y'],
        category: 'edit',
        isEnabled: true,
        action: () => onRedo?.(),
        icon: Redo
      },
      {
        id: 'copy',
        name: 'Copy',
        description: 'Copy selected objects',
        keys: ['Ctrl', 'C'],
        category: 'edit',
        isEnabled: true,
        action: () => onCopy?.(),
        icon: Copy
      },
      {
        id: 'paste',
        name: 'Paste',
        description: 'Paste copied objects',
        keys: ['Ctrl', 'V'],
        category: 'edit',
        isEnabled: true,
        action: () => onPaste?.(),
        icon: Clipboard
      },
      {
        id: 'cut',
        name: 'Cut',
        description: 'Cut selected objects',
        keys: ['Ctrl', 'X'],
        category: 'edit',
        isEnabled: true,
        action: () => onCut?.(),
        icon: Scissors
      },
      {
        id: 'delete',
        name: 'Delete',
        description: 'Delete selected objects',
        keys: ['Delete'],
        category: 'edit',
        isEnabled: true,
        action: () => onDelete?.(),
        icon: Trash2
      },
      {
        id: 'selectAll',
        name: 'Select All',
        description: 'Select all objects',
        keys: ['Ctrl', 'A'],
        category: 'edit',
        isEnabled: true,
        action: () => onSelectAll?.(),
        icon: SelectAll
      },
      {
        id: 'deselectAll',
        name: 'Deselect All',
        description: 'Deselect all objects',
        keys: ['Escape'],
        category: 'edit',
        isEnabled: true,
        action: () => onDeselectAll?.(),
        icon: X
      },

      // Tool selection
      {
        id: 'selectTool',
        name: 'Select Tool',
        description: 'Switch to select tool',
        keys: ['V'],
        category: 'tools',
        isEnabled: true,
        action: () => onToolSelect?.('select'),
        icon: MousePointer
      },
      {
        id: 'textTool',
        name: 'Text Tool',
        description: 'Switch to text tool',
        keys: ['T'],
        category: 'tools',
        isEnabled: true,
        action: () => onToolSelect?.('text'),
        icon: Type
      },
      {
        id: 'rectangleTool',
        name: 'Rectangle Tool',
        description: 'Switch to rectangle tool',
        keys: ['R'],
        category: 'tools',
        isEnabled: true,
        action: () => onToolSelect?.('rect'),
        icon: Square
      },
      {
        id: 'circleTool',
        name: 'Circle Tool',
        description: 'Switch to circle tool',
        keys: ['C'],
        category: 'tools',
        isEnabled: true,
        action: () => onToolSelect?.('circle'),
        icon: Circle
      },
      {
        id: 'triangleTool',
        name: 'Triangle Tool',
        description: 'Switch to triangle tool',
        keys: ['3'],
        category: 'tools',
        isEnabled: true,
        action: () => onToolSelect?.('triangle'),
        icon: Triangle
      },
      {
        id: 'starTool',
        name: 'Star Tool',
        description: 'Switch to star tool',
        keys: ['5'],
        category: 'tools',
        isEnabled: true,
        action: () => onToolSelect?.('star'),
        icon: Star
      },
      {
        id: 'imageTool',
        name: 'Image Tool',
        description: 'Switch to image tool',
        keys: ['I'],
        category: 'tools',
        isEnabled: true,
        action: () => onToolSelect?.('image'),
        icon: ImageIcon
      },
      {
        id: 'colorTool',
        name: 'Color Tool',
        description: 'Switch to color tool',
        keys: ['P'],
        category: 'tools',
        isEnabled: true,
        action: () => onToolSelect?.('color'),
        icon: Palette
      },
      {
        id: 'filterTool',
        name: 'Filter Tool',
        description: 'Switch to filter tool',
        keys: ['F'],
        category: 'tools',
        isEnabled: true,
        action: () => onToolSelect?.('filter'),
        icon: Filter
      },

      // Transform operations
      {
        id: 'group',
        name: 'Group',
        description: 'Group selected objects',
        keys: ['Ctrl', 'G'],
        category: 'transform',
        isEnabled: true,
        action: () => onGroup?.(),
        icon: Group
      },
      {
        id: 'ungroup',
        name: 'Ungroup',
        description: 'Ungroup selected objects',
        keys: ['Ctrl', 'Shift', 'G'],
        category: 'transform',
        isEnabled: true,
        action: () => onUngroup?.(),
        icon: Ungroup
      },
      {
        id: 'bringToFront',
        name: 'Bring to Front',
        description: 'Bring selected objects to front',
        keys: ['Ctrl', ']'],
        category: 'transform',
        isEnabled: true,
        action: () => onBringToFront?.(),
        icon: ArrowUp
      },
      {
        id: 'sendToBack',
        name: 'Send to Back',
        description: 'Send selected objects to back',
        keys: ['Ctrl', '['],
        category: 'transform',
        isEnabled: true,
        action: () => onSendToBack?.(),
        icon: ArrowDown
      },
      {
        id: 'bringForward',
        name: 'Bring Forward',
        description: 'Bring selected objects forward',
        keys: ['Ctrl', 'Shift', ']'],
        category: 'transform',
        isEnabled: true,
        action: () => onBringForward?.(),
        icon: ArrowUp
      },
      {
        id: 'sendBackward',
        name: 'Send Backward',
        description: 'Send selected objects backward',
        keys: ['Ctrl', 'Shift', '['],
        category: 'transform',
        isEnabled: true,
        action: () => onSendBackward?.(),
        icon: ArrowDown
      },
      {
        id: 'flipHorizontal',
        name: 'Flip Horizontal',
        description: 'Flip selected objects horizontally',
        keys: ['Ctrl', 'H'],
        category: 'transform',
        isEnabled: true,
        action: () => onFlipHorizontal?.(),
        icon: FlipHorizontal
      },
      {
        id: 'flipVertical',
        name: 'Flip Vertical',
        description: 'Flip selected objects vertically',
        keys: ['Ctrl', 'Shift', 'H'],
        category: 'transform',
        isEnabled: true,
        action: () => onFlipVertical?.(),
        icon: FlipVertical
      },
      {
        id: 'rotate90',
        name: 'Rotate 90°',
        description: 'Rotate selected objects 90 degrees',
        keys: ['Ctrl', 'R'],
        category: 'transform',
        isEnabled: true,
        action: () => onRotate90?.(),
        icon: RotateCw
      },
      {
        id: 'rotate180',
        name: 'Rotate 180°',
        description: 'Rotate selected objects 180 degrees',
        keys: ['Ctrl', 'Shift', 'R'],
        category: 'transform',
        isEnabled: true,
        action: () => onRotate180?.(),
        icon: RotateCw
      },

      // View operations
      {
        id: 'zoomIn',
        name: 'Zoom In',
        description: 'Zoom in on the canvas',
        keys: ['Ctrl', '+'],
        category: 'view',
        isEnabled: true,
        action: () => onZoomIn?.(),
        icon: ZoomIn
      },
      {
        id: 'zoomOut',
        name: 'Zoom Out',
        description: 'Zoom out on the canvas',
        keys: ['Ctrl', '-'],
        category: 'view',
        isEnabled: true,
        action: () => onZoomOut?.(),
        icon: ZoomOut
      },
      {
        id: 'zoomReset',
        name: 'Zoom Reset',
        description: 'Reset zoom to 100%',
        keys: ['Ctrl', '0'],
        category: 'view',
        isEnabled: true,
        action: () => onZoomReset?.(),
        icon: ZoomReset
      },
      {
        id: 'zoomToFit',
        name: 'Zoom to Fit',
        description: 'Zoom to fit all objects',
        keys: ['Ctrl', '1'],
        category: 'view',
        isEnabled: true,
        action: () => onZoomToFit?.(),
        icon: ZoomIn
      },
      {
        id: 'zoomToSelection',
        name: 'Zoom to Selection',
        description: 'Zoom to fit selected objects',
        keys: ['Ctrl', '2'],
        category: 'view',
        isEnabled: true,
        action: () => onZoomToSelection?.(),
        icon: ZoomIn
      },
      {
        id: 'toggleGrid',
        name: 'Toggle Grid',
        description: 'Toggle grid visibility',
        keys: ['Ctrl', 'Shift', 'G'],
        category: 'view',
        isEnabled: true,
        action: () => onToggleGrid?.(),
        icon: Grid3X3
      },
      {
        id: 'toggleRulers',
        name: 'Toggle Rulers',
        description: 'Toggle rulers visibility',
        keys: ['Ctrl', 'Shift', 'R'],
        category: 'view',
        isEnabled: true,
        action: () => onToggleRulers?.(),
        icon: Ruler
      },
      {
        id: 'toggleGuides',
        name: 'Toggle Guides',
        description: 'Toggle guides visibility',
        keys: ['Ctrl', 'Shift', 'U'],
        category: 'view',
        isEnabled: true,
        action: () => onToggleGuides?.(),
        icon: Grid3X3
      },
      {
        id: 'toggleLayers',
        name: 'Toggle Layers',
        description: 'Toggle layers panel',
        keys: ['Ctrl', 'Shift', 'L'],
        category: 'view',
        isEnabled: true,
        action: () => onToggleLayers?.(),
        icon: Layers
      },
      {
        id: 'toggleProperties',
        name: 'Toggle Properties',
        description: 'Toggle properties panel',
        keys: ['Ctrl', 'Shift', 'P'],
        category: 'view',
        isEnabled: true,
        action: () => onToggleProperties?.(),
        icon: Properties
      },

      // Help operations
      {
        id: 'showHelp',
        name: 'Show Help',
        description: 'Show help and documentation',
        keys: ['F1'],
        category: 'help',
        isEnabled: true,
        action: () => onShowHelp?.(),
        icon: HelpCircle
      },
      {
        id: 'showSettings',
        name: 'Show Settings',
        description: 'Show settings panel',
        keys: ['Ctrl', ','],
        category: 'help',
        isEnabled: true,
        action: () => onShowSettings?.(),
        icon: Settings
      },
      {
        id: 'showShortcuts',
        name: 'Show Shortcuts',
        description: 'Show keyboard shortcuts',
        keys: ['Ctrl', '/'],
        category: 'help',
        isEnabled: true,
        action: () => setShowShortcuts(true),
        icon: Keyboard
      }
    ];

    setShortcuts(initialShortcuts);
  }, [
    onSave, onLoad, onExport, onUndo, onRedo, onCopy, onPaste, onCut, onDelete,
    onSelectAll, onDeselectAll, onGroup, onUngroup, onBringToFront, onSendToBack,
    onBringForward, onSendBackward, onFlipHorizontal, onFlipVertical, onRotate90,
    onRotate180, onZoomIn, onZoomOut, onZoomReset, onZoomToFit, onZoomToSelection,
    onToggleGrid, onToggleRulers, onToggleGuides, onToggleLayers, onToggleProperties,
    onShowHelp, onShowSettings, onToolSelect
  ]);

  // Handle keyboard events
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't handle shortcuts if user is typing in an input/textarea
      const target = e.target as HTMLElement;
      if (target && (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.contentEditable === 'true')) {
        return;
      }

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
        onAction?.(matchingShortcut.id);
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
    if (category === 'all') return shortcuts;
    return shortcuts.filter(shortcut => shortcut.category === category);
  };

  const filteredShortcuts = getShortcutsByCategory(selectedCategory).filter(shortcut =>
    shortcut.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    shortcut.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
    shortcut.keys.join('+').toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getCategoryIcon = (category: string) => {
    const categoryData = categories.find(c => c.id === category);
    return categoryData?.icon || Keyboard;
  };

  const formatKeys = (keys: string[]) => {
    return keys.map(key => {
      if (key === 'Ctrl') return 'Ctrl';
      if (key === 'Shift') return 'Shift';
      if (key === 'Alt') return 'Alt';
      if (key === 'Delete') return 'Del';
      if (key === 'Escape') return 'Esc';
      if (key === ' ') return 'Space';
      return key.toUpperCase();
    }).join(' + ');
  };

  if (!showShortcuts) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[80vh] overflow-hidden">
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-2xl font-bold flex items-center">
            <Keyboard className="w-6 h-6 mr-2" />
            Keyboard Shortcuts
          </h2>
          <button
            onClick={() => setShowShortcuts(false)}
            className="text-gray-400 hover:text-gray-600"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="p-6">
          {/* Search */}
          <div className="mb-6">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Search shortcuts..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>

          {/* Category Filter */}
          <div className="mb-6">
            <div className="flex flex-wrap gap-2">
              {categories.map(category => (
                <button
                  key={category.id}
                  onClick={() => setSelectedCategory(category.id)}
                  className={`px-4 py-2 text-sm font-medium rounded-lg flex items-center space-x-2 ${
                    selectedCategory === category.id
                      ? 'bg-blue-100 text-blue-700'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  <category.icon className="w-4 h-4" />
                  <span>{category.name}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Shortcuts List */}
          <div className="space-y-2 max-h-96 overflow-y-auto">
            {filteredShortcuts.map(shortcut => (
              <div
                key={shortcut.id}
                className="flex items-center justify-between p-3 border border-gray-200 rounded-lg hover:bg-gray-50"
              >
                <div className="flex items-center space-x-3">
                  {shortcut.icon && (
                    <div className="w-8 h-8 rounded bg-gray-100 flex items-center justify-center">
                      <shortcut.icon className="w-4 h-4 text-gray-600" />
                    </div>
                  )}
                  <div>
                    <div className="font-medium text-sm">{shortcut.name}</div>
                    <div className="text-xs text-gray-500">{shortcut.description}</div>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="flex space-x-1">
                    {shortcut.keys.map((key, index) => (
                      <React.Fragment key={index}>
                        <kbd className="px-2 py-1 text-xs font-mono bg-gray-100 border border-gray-300 rounded">
                          {key === 'Ctrl' ? 'Ctrl' : key === 'Shift' ? 'Shift' : key === 'Alt' ? 'Alt' : key.toUpperCase()}
                        </kbd>
                        {index < shortcut.keys.length - 1 && (
                          <span className="text-gray-400">+</span>
                        )}
                      </React.Fragment>
                    ))}
                  </div>
                  <div className="flex items-center space-x-1">
                    <button
                      onClick={() => {
                        setShortcuts(prev => prev.map(s => 
                          s.id === shortcut.id ? { ...s, isEnabled: !s.isEnabled } : s
                        ));
                      }}
                      className={`w-4 h-4 rounded border-2 flex items-center justify-center ${
                        shortcut.isEnabled 
                          ? 'bg-blue-500 border-blue-500' 
                          : 'border-gray-300'
                      }`}
                    >
                      {shortcut.isEnabled && <Check className="w-3 h-3 text-white" />}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Footer */}
          <div className="mt-6 pt-4 border-t border-gray-200 flex items-center justify-between">
            <div className="text-sm text-gray-500">
              {filteredShortcuts.length} shortcuts found
            </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setShowShortcuts(false)}
                className="px-4 py-2 text-sm bg-gray-100 text-gray-700 rounded hover:bg-gray-200"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
