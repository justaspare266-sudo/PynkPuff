import React, { useState, useEffect, useRef, useCallback } from 'react';
import { 
  Copy, 
  Trash2, 
  RotateCw, 
  RotateCcw, 
  FlipHorizontal, 
  FlipVertical, 
  Move, 
  Square, 
  Circle, 
  Type, 
  Image as ImageIcon, 
  Droplets, 
  Layers, 
  Eye, 
  EyeOff, 
  Lock, 
  Unlock, 
  ArrowUp, 
  ArrowDown, 
  ArrowLeft, 
  ArrowRight, 
  AlignLeft, 
  AlignCenter, 
  AlignRight, 
  AlignJustify, 
  Grid3X3, 
  Settings, 
  Zap, 
  Palette, 
  Download, 
  Upload, 
  Plus, 
  Minus, 
  Edit, 
  Save, 
  Undo, 
  Redo, 
  Scissors, 
  Clipboard, 
  Group, 
  Ungroup, 
  BringToFront, 
  SendToBack,
  ChevronRight,
  Star,
  StarOff,
  Filter,
  Crop,
  RefreshCw
} from 'lucide-react';

export interface ContextMenuAction {
  id: string;
  label: string;
  icon: React.ComponentType<any>;
  shortcut?: string;
  disabled?: boolean;
  dangerous?: boolean;
  separator?: boolean;
  submenu?: ContextMenuAction[];
  action: () => void;
}

export interface ContextMenuProps {
  isOpen: boolean;
  x: number;
  y: number;
  elementId?: string | null;
  elementType?: string | null;
  selectedElementIds?: string[];
  onClose: () => void;
  onAction?: (actionId: string, elementId?: string) => void;
  onCopy?: (elementId: string) => void;
  onCut?: (elementId: string) => void;
  onPaste?: () => void;
  onDelete?: (elementId: string) => void;
  onDuplicate?: (elementId: string) => void;
  onGroup?: (elementIds: string[]) => void;
  onUngroup?: (elementIds: string[]) => void;
  onBringToFront?: (elementId: string) => void;
  onSendToBack?: (elementId: string) => void;
  onBringForward?: (elementId: string) => void;
  onSendBackward?: (elementId: string) => void;
  onFlipHorizontal?: (elementId: string) => void;
  onFlipVertical?: (elementId: string) => void;
  onRotate90?: (elementId: string) => void;
  onRotate180?: (elementId: string) => void;
  onRotate270?: (elementId: string) => void;
  onToggleVisibility?: (elementId: string) => void;
  onToggleLock?: (elementId: string) => void;
  onAlignLeft?: (elementIds: string[]) => void;
  onAlignCenter?: (elementIds: string[]) => void;
  onAlignRight?: (elementIds: string[]) => void;
  onAlignTop?: (elementIds: string[]) => void;
  onAlignMiddle?: (elementIds: string[]) => void;
  onAlignBottom?: (elementIds: string[]) => void;
  onDistributeHorizontal?: (elementIds: string[]) => void;
  onDistributeVertical?: (elementIds: string[]) => void;
  onExport?: (elementId: string) => void;
  onProperties?: (elementId: string) => void;
}

export const EnhancedContextMenu: React.FC<ContextMenuProps> = ({
  isOpen,
  x,
  y,
  elementId,
  elementType,
  selectedElementIds = [],
  onClose,
  onAction,
  onCopy,
  onCut,
  onPaste,
  onDelete,
  onDuplicate,
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
  onToggleVisibility,
  onToggleLock,
  onAlignLeft,
  onAlignCenter,
  onAlignRight,
  onAlignTop,
  onAlignMiddle,
  onAlignBottom,
  onDistributeHorizontal,
  onDistributeVertical,
  onExport,
  onProperties
}) => {
  const [submenuOpen, setSubmenuOpen] = useState<string | null>(null);
  const [submenuPosition, setSubmenuPosition] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const menuRef = useRef<HTMLDivElement>(null);
  const submenuRef = useRef<HTMLDivElement>(null);

  const hasSelection = selectedElementIds.length > 0;
  const hasSingleSelection = selectedElementIds.length === 1;
  const hasMultipleSelection = selectedElementIds.length > 1;

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [isOpen, onClose]);

  // Close menu on escape key
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
      return () => document.removeEventListener('keydown', handleKeyDown);
    }
  }, [isOpen, onClose]);

  // Handle submenu positioning
  const handleSubmenuOpen = (actionId: string, event: React.MouseEvent) => {
    event.preventDefault();
    event.stopPropagation();
    
    const rect = event.currentTarget.getBoundingClientRect();
    setSubmenuPosition({
      x: rect.right + 5,
      y: rect.top
    });
    setSubmenuOpen(actionId);
  };

  const handleSubmenuClose = useCallback(() => {
    setSubmenuOpen(null);
  }, []);

  // Generate context menu actions based on context
  const getContextActions = useCallback((): ContextMenuAction[] => {
    const actions: ContextMenuAction[] = [];

    // Basic actions for selected elements
    if (hasSelection) {
      // Edit action for single selection
      if (hasSingleSelection) {
        actions.push({
          id: 'edit',
          label: 'Edit',
          icon: Edit,
          action: () => {
            onAction?.('edit', selectedElementIds[0]);
            onClose();
          }
        });
      }

      // Copy/Cut/Paste actions
      actions.push({
        id: 'copy',
        label: 'Copy',
        icon: Copy,
        shortcut: 'Ctrl+C',
        action: () => {
          selectedElementIds.forEach(id => onCopy?.(id));
          onAction?.('copy');
          onClose();
        }
      });

      if (hasSingleSelection) {
        actions.push({
          id: 'cut',
          label: 'Cut',
          icon: Scissors,
          shortcut: 'Ctrl+X',
          action: () => {
            onCut?.(selectedElementIds[0]);
            onAction?.('cut', selectedElementIds[0]);
            onClose();
          }
        });
      }

      actions.push({
        id: 'duplicate',
        label: 'Duplicate',
        icon: Copy,
        shortcut: 'Ctrl+D',
        action: () => {
          selectedElementIds.forEach(id => onDuplicate?.(id));
          onAction?.('duplicate');
          onClose();
        }
      });

      actions.push({
        id: 'delete',
        label: 'Delete',
        icon: Trash2,
        shortcut: 'Delete',
        dangerous: true,
        action: () => {
          selectedElementIds.forEach(id => onDelete?.(id));
          onAction?.('delete');
          onClose();
        }
      });

      actions.push({ id: 'separator1', label: '', icon: Square, separator: true, action: () => {} });
    }

    // Paste action (always available)
    actions.push({
      id: 'paste',
      label: 'Paste',
      icon: Clipboard,
      shortcut: 'Ctrl+V',
      action: () => {
        onPaste?.();
        onAction?.('paste');
        onClose();
      }
    });

    // Transform actions for single selection
    if (hasSingleSelection) {
      actions.push({ id: 'separator2', label: '', icon: Square, separator: true, action: () => {} });

      // Rotate submenu
      actions.push({
        id: 'rotate',
        label: 'Rotate',
        icon: RotateCw,
        submenu: [
          {
            id: 'rotate90',
            label: 'Rotate 90°',
            icon: RotateCw,
            action: () => {
              onRotate90?.(selectedElementIds[0]);
              onAction?.('rotate90', selectedElementIds[0]);
              onClose();
            }
          },
          {
            id: 'rotate180',
            label: 'Rotate 180°',
            icon: RotateCw,
            action: () => {
              onRotate180?.(selectedElementIds[0]);
              onAction?.('rotate180', selectedElementIds[0]);
              onClose();
            }
          },
          {
            id: 'rotate270',
            label: 'Rotate 270°',
            icon: RotateCcw,
            action: () => {
              onRotate270?.(selectedElementIds[0]);
              onAction?.('rotate270', selectedElementIds[0]);
              onClose();
            }
          }
        ],
        action: () => {}
      });

      // Flip submenu
      actions.push({
        id: 'flip',
        label: 'Flip',
        icon: FlipHorizontal,
        submenu: [
          {
            id: 'flipHorizontal',
            label: 'Flip Horizontal',
            icon: FlipHorizontal,
            action: () => {
              onFlipHorizontal?.(selectedElementIds[0]);
              onAction?.('flipHorizontal', selectedElementIds[0]);
              onClose();
            }
          },
          {
            id: 'flipVertical',
            label: 'Flip Vertical',
            icon: FlipVertical,
            action: () => {
              onFlipVertical?.(selectedElementIds[0]);
              onAction?.('flipVertical', selectedElementIds[0]);
              onClose();
            }
          }
        ],
        action: () => {}
      });

      // Layer order submenu
      actions.push({
        id: 'layerOrder',
        label: 'Layer Order',
        icon: Layers,
        submenu: [
          {
            id: 'bringToFront',
            label: 'Bring to Front',
            icon: BringToFront,
            action: () => {
              onBringToFront?.(selectedElementIds[0]);
              onAction?.('bringToFront', selectedElementIds[0]);
              onClose();
            }
          },
          {
            id: 'sendToBack',
            label: 'Send to Back',
            icon: SendToBack,
            action: () => {
              onSendToBack?.(selectedElementIds[0]);
              onAction?.('sendToBack', selectedElementIds[0]);
              onClose();
            }
          },
          {
            id: 'bringForward',
            label: 'Bring Forward',
            icon: ArrowUp,
            action: () => {
              onBringForward?.(selectedElementIds[0]);
              onAction?.('bringForward', selectedElementIds[0]);
              onClose();
            }
          },
          {
            id: 'sendBackward',
            label: 'Send Backward',
            icon: ArrowDown,
            action: () => {
              onSendBackward?.(selectedElementIds[0]);
              onAction?.('sendBackward', selectedElementIds[0]);
              onClose();
            }
          }
        ],
        action: () => {}
      });

      // Visibility and lock
      actions.push({
        id: 'toggleVisibility',
        label: 'Toggle Visibility',
        icon: Eye,
        action: () => {
          onToggleVisibility?.(selectedElementIds[0]);
          onAction?.('toggleVisibility', selectedElementIds[0]);
          onClose();
        }
      });

      actions.push({
        id: 'toggleLock',
        label: 'Toggle Lock',
        icon: Lock,
        action: () => {
          onToggleLock?.(selectedElementIds[0]);
          onAction?.('toggleLock', selectedElementIds[0]);
          onClose();
        }
      });
    }

    // Alignment actions for multiple selection
    if (hasMultipleSelection) {
      actions.push({ id: 'separator3', label: '', icon: Square, separator: true, action: () => {} });

      actions.push({
        id: 'align',
        label: 'Align',
        icon: AlignLeft,
        submenu: [
          {
            id: 'alignLeft',
            label: 'Align Left',
            icon: AlignLeft,
            action: () => {
              onAlignLeft?.(selectedElementIds);
              onAction?.('alignLeft');
              onClose();
            }
          },
          {
            id: 'alignCenter',
            label: 'Align Center',
            icon: AlignCenter,
            action: () => {
              onAlignCenter?.(selectedElementIds);
              onAction?.('alignCenter');
              onClose();
            }
          },
          {
            id: 'alignRight',
            label: 'Align Right',
            icon: AlignRight,
            action: () => {
              onAlignRight?.(selectedElementIds);
              onAction?.('alignRight');
              onClose();
            }
          },
          {
            id: 'alignTop',
            label: 'Align Top',
            icon: ArrowUp,
            action: () => {
              onAlignTop?.(selectedElementIds);
              onAction?.('alignTop');
              onClose();
            }
          },
          {
            id: 'alignMiddle',
            label: 'Align Middle',
            icon: AlignCenter,
            action: () => {
              onAlignMiddle?.(selectedElementIds);
              onAction?.('alignMiddle');
              onClose();
            }
          },
          {
            id: 'alignBottom',
            label: 'Align Bottom',
            icon: ArrowDown,
            action: () => {
              onAlignBottom?.(selectedElementIds);
              onAction?.('alignBottom');
              onClose();
            }
          }
        ],
        action: () => {}
      });

      actions.push({
        id: 'distribute',
        label: 'Distribute',
        icon: Grid3X3,
        submenu: [
          {
            id: 'distributeHorizontal',
            label: 'Distribute Horizontally',
            icon: ArrowLeft,
            action: () => {
              onDistributeHorizontal?.(selectedElementIds);
              onAction?.('distributeHorizontal');
              onClose();
            }
          },
          {
            id: 'distributeVertical',
            label: 'Distribute Vertically',
            icon: ArrowUp,
            action: () => {
              onDistributeVertical?.(selectedElementIds);
              onAction?.('distributeVertical');
              onClose();
            }
          }
        ],
        action: () => {}
      });

      // Group/Ungroup actions
      actions.push({
        id: 'group',
        label: 'Group',
        icon: Group,
        action: () => {
          onGroup?.(selectedElementIds);
          onAction?.('group');
          onClose();
        }
      });
    }

    // Export and properties actions
    if (hasSingleSelection) {
      actions.push({ id: 'separator4', label: '', icon: Square, separator: true, action: () => {} });

      actions.push({
        id: 'export',
        label: 'Export',
        icon: Download,
        action: () => {
          onExport?.(selectedElementIds[0]);
          onAction?.('export', selectedElementIds[0]);
          onClose();
        }
      });

      actions.push({
        id: 'properties',
        label: 'Properties',
        icon: Settings,
        action: () => {
          onProperties?.(selectedElementIds[0]);
          onAction?.('properties', selectedElementIds[0]);
          onClose();
        }
      });
    }

    return actions;
  }, [
    hasSelection,
    hasSingleSelection,
    hasMultipleSelection,
    selectedElementIds,
    onAction,
    onCopy,
    onCut,
    onPaste,
    onDelete,
    onDuplicate,
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
    onToggleVisibility,
    onToggleLock,
    onAlignLeft,
    onAlignCenter,
    onAlignRight,
    onAlignTop,
    onAlignMiddle,
    onAlignBottom,
    onDistributeHorizontal,
    onDistributeVertical,
    onExport,
    onProperties,
    onClose
  ]);

  const actions = getContextActions();

  if (!isOpen) return null;

  return (
    <>
      <div
        ref={menuRef}
        className="fixed z-50 bg-white border border-gray-200 rounded-lg shadow-lg py-1 min-w-48"
        style={{
          left: x,
          top: y,
          maxHeight: '80vh',
          overflowY: 'auto'
        }}
      >
        {actions.map((action) => (
          <div key={action.id}>
            {action.separator ? (
              <div className="border-t border-gray-200 my-1" />
            ) : (
              <div
                className={`flex items-center px-3 py-2 text-sm hover:bg-gray-100 cursor-pointer ${
                  action.disabled ? 'opacity-50 cursor-not-allowed' : ''
                } ${action.dangerous ? 'text-red-600 hover:bg-red-50' : 'text-gray-700'}`}
                onClick={action.disabled ? undefined : action.action}
                onMouseEnter={action.submenu ? (e) => handleSubmenuOpen(action.id, e) : undefined}
                onMouseLeave={action.submenu ? handleSubmenuClose : undefined}
              >
                <action.icon className="w-4 h-4 mr-3" />
                <span className="flex-1">{action.label}</span>
                {action.shortcut && (
                  <span className="text-xs text-gray-400 ml-2">{action.shortcut}</span>
                )}
                {action.submenu && (
                  <ChevronRight className="w-4 h-4 ml-2" />
                )}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Submenu */}
      {submenuOpen && (
        <div
          ref={submenuRef}
          className="fixed z-50 bg-white border border-gray-200 rounded-lg shadow-lg py-1 min-w-48"
          style={{
            left: submenuPosition.x,
            top: submenuPosition.y
          }}
        >
          {actions
            .find(action => action.id === submenuOpen)
            ?.submenu?.map((subAction) => (
              <div
                key={subAction.id}
                className={`flex items-center px-3 py-2 text-sm hover:bg-gray-100 cursor-pointer ${
                  subAction.disabled ? 'opacity-50 cursor-not-allowed' : ''
                } ${subAction.dangerous ? 'text-red-600 hover:bg-red-50' : 'text-gray-700'}`}
                onClick={subAction.disabled ? undefined : subAction.action}
              >
                <subAction.icon className="w-4 h-4 mr-3" />
                <span className="flex-1">{subAction.label}</span>
                {subAction.shortcut && (
                  <span className="text-xs text-gray-400 ml-2">{subAction.shortcut}</span>
                )}
              </div>
            ))}
        </div>
      )}
    </>
  );
};
