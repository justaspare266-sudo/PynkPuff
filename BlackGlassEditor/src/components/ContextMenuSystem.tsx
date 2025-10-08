'use client';

import React, { useState, useEffect, useCallback } from 'react';
import {
  Copy,
  Scissors as Cut,
  Clipboard as Paste,
  Trash2,
  RotateCw,
  RotateCcw,
  FlipHorizontal,
  FlipVertical,
  BringToFront,
  SendToBack,
  ArrowUp as BringForward,
  ArrowDown as SendBackward,
  AlignLeft,
  AlignCenter,
  AlignRight,
  AlignVerticalJustifyStart,
  AlignHorizontalJustifyCenter,
  AlignVerticalJustifyEnd,
  ArrowLeft as DistributeHorizontal,
  ArrowUp as DistributeVertical,
  Group,
  Ungroup,
  Lock,
  Unlock,
  Eye,
  EyeOff,
  Edit,
  Copy as Duplicate,
  Settings as Properties,
  Download as Export,
  Download,
  Upload,
  Settings,
  MoreHorizontal
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

export interface ContextMenuSystemProps {
  isOpen: boolean;
  x: number;
  y: number;
  elementId?: string;
  elementType?: string;
  selectedElementIds: string[];
  elements: any[];
  onClose: () => void;
  onAction: (actionId: string, elementId?: string) => void;
  onCopy: (elementId: string) => void;
  onCut: (elementId: string) => void;
  onPaste: () => void;
  onDelete: (elementId: string) => void;
  onDuplicate: (elementId: string) => void;
  onGroup: (elementIds: string[]) => void;
  onUngroup: (elementId: string) => void;
  onBringToFront: (elementId: string) => void;
  onSendToBack: (elementId: string) => void;
  onBringForward: (elementId: string) => void;
  onSendBackward: (elementId: string) => void;
  onFlipHorizontal: (elementId: string) => void;
  onFlipVertical: (elementId: string) => void;
  onRotate90: (elementId: string) => void;
  onRotate180: (elementId: string) => void;
  onRotate270: (elementId: string) => void;
  onToggleVisibility: (elementId: string) => void;
  onToggleLock: (elementId: string) => void;
  onAlignLeft: (elementIds: string[]) => void;
  onAlignCenter: (elementIds: string[]) => void;
  onAlignRight: (elementIds: string[]) => void;
  onAlignTop: (elementIds: string[]) => void;
  onAlignMiddle: (elementIds: string[]) => void;
  onAlignBottom: (elementIds: string[]) => void;
  onDistributeHorizontal: (elementIds: string[]) => void;
  onDistributeVertical: (elementIds: string[]) => void;
  onExport: (elementId: string) => void;
  onProperties: (elementId: string) => void;
  onEdit: (elementId: string) => void;
  className?: string;
}

const ContextMenuSystem: React.FC<ContextMenuSystemProps> = ({
  isOpen,
  x,
  y,
  elementId,
  elementType,
  selectedElementIds,
  elements,
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
  onProperties,
  onEdit,
  className = ''
}) => {
  const [showSubmenu, setShowSubmenu] = useState<string | null>(null);
  const [submenuPosition, setSubmenuPosition] = useState({ x: 0, y: 0 });

  // Close context menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (isOpen) {
        onClose();
      }
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('keydown', handleKeyDown);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  const getElement = (id: string) => {
    return elements.find(el => el.id === id);
  };

  const getSelectedElements = () => {
    return elements.filter(el => selectedElementIds.includes(el.id));
  };

  const hasSelection = selectedElementIds.length > 0;
  const hasMultipleSelection = selectedElementIds.length > 1;
  const hasSingleSelection = selectedElementIds.length === 1;
  const selectedElement = hasSingleSelection ? getElement(selectedElementIds[0]) : null;

  const getActions = (): ContextMenuAction[] => {
    const actions: ContextMenuAction[] = [];

    if (hasSelection) {
      // Edit actions
      if (hasSingleSelection) {
        actions.push({
          id: 'edit',
          label: 'Edit',
          icon: Edit,
          action: () => {
            onEdit(selectedElementIds[0]);
            onClose();
          }
        });
      }

      // Copy/Cut/Paste
      actions.push({
        id: 'copy',
        label: 'Copy',
        icon: Copy,
        shortcut: 'Ctrl+C',
        action: () => {
          selectedElementIds.forEach(id => onCopy(id));
          onClose();
        }
      });

      if (hasSingleSelection) {
        actions.push({
          id: 'cut',
          label: 'Cut',
          icon: Cut,
          shortcut: 'Ctrl+X',
          action: () => {
            onCut(selectedElementIds[0]);
            onClose();
          }
        });
      }

      actions.push({
        id: 'duplicate',
        label: 'Duplicate',
        icon: Duplicate,
        shortcut: 'Ctrl+D',
        action: () => {
          selectedElementIds.forEach(id => onDuplicate(id));
          onClose();
        }
      });

      actions.push({ id: 'separator1', label: '', icon: MoreHorizontal, action: () => {}, separator: true });

      // Transform actions
      if (hasSingleSelection) {
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
                onRotate90(selectedElementIds[0]);
                onClose();
              }
            },
            {
              id: 'rotate180',
              label: 'Rotate 180°',
              icon: RotateCw,
              action: () => {
                onRotate180(selectedElementIds[0]);
                onClose();
              }
            },
            {
              id: 'rotate270',
              label: 'Rotate 270°',
              icon: RotateCcw,
              action: () => {
                onRotate270(selectedElementIds[0]);
                onClose();
              }
            }
          ],
          action: () => {}
        });

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
                onFlipHorizontal(selectedElementIds[0]);
                onClose();
              }
            },
            {
              id: 'flipVertical',
              label: 'Flip Vertical',
              icon: FlipVertical,
              action: () => {
                onFlipVertical(selectedElementIds[0]);
                onClose();
              }
            }
          ],
          action: () => {}
        });
      }

      // Layer actions
      actions.push({
        id: 'arrange',
        label: 'Arrange',
        icon: BringToFront,
        submenu: [
          {
            id: 'bringToFront',
            label: 'Bring to Front',
            icon: BringToFront,
            shortcut: 'Ctrl+]',
            action: () => {
              selectedElementIds.forEach(id => onBringToFront(id));
              onClose();
            }
          },
          {
            id: 'bringForward',
            label: 'Bring Forward',
            icon: BringForward,
            action: () => {
              selectedElementIds.forEach(id => onBringForward(id));
              onClose();
            }
          },
          {
            id: 'sendBackward',
            label: 'Send Backward',
            icon: SendBackward,
            action: () => {
              selectedElementIds.forEach(id => onSendBackward(id));
              onClose();
            }
          },
          {
            id: 'sendToBack',
            label: 'Send to Back',
            icon: SendToBack,
            shortcut: 'Ctrl+[',
            action: () => {
              selectedElementIds.forEach(id => onSendToBack(id));
              onClose();
            }
          }
        ],
        action: () => {}
      });

      // Alignment actions (only for multiple selection)
      if (hasMultipleSelection) {
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
                onAlignLeft(selectedElementIds);
                onClose();
              }
            },
            {
              id: 'alignCenter',
              label: 'Align Center',
              icon: AlignCenter,
              action: () => {
                onAlignCenter(selectedElementIds);
                onClose();
              }
            },
            {
              id: 'alignRight',
              label: 'Align Right',
              icon: AlignRight,
              action: () => {
                onAlignRight(selectedElementIds);
                onClose();
              }
            },
            { id: 'alignSeparator', label: '', icon: MoreHorizontal, action: () => {}, separator: true },
            {
              id: 'alignTop',
              label: 'Align Top',
              icon: AlignVerticalJustifyStart,
              action: () => {
                onAlignTop(selectedElementIds);
                onClose();
              }
            },
            {
              id: 'alignMiddle',
              label: 'Align Middle',
              icon: AlignHorizontalJustifyCenter,
              action: () => {
                onAlignMiddle(selectedElementIds);
                onClose();
              }
            },
            {
              id: 'alignBottom',
              label: 'Align Bottom',
              icon: AlignVerticalJustifyEnd,
              action: () => {
                onAlignBottom(selectedElementIds);
                onClose();
              }
            }
          ],
          action: () => {}
        });

        actions.push({
          id: 'distribute',
          label: 'Distribute',
          icon: DistributeHorizontal,
          submenu: [
            {
              id: 'distributeHorizontal',
              label: 'Distribute Horizontally',
              icon: DistributeHorizontal,
              action: () => {
                onDistributeHorizontal(selectedElementIds);
                onClose();
              }
            },
            {
              id: 'distributeVertical',
              label: 'Distribute Vertically',
              icon: DistributeVertical,
              action: () => {
                onDistributeVertical(selectedElementIds);
                onClose();
              }
            }
          ],
          action: () => {}
        });
      }

      // Grouping actions
      if (hasMultipleSelection) {
        actions.push({
          id: 'group',
          label: 'Group',
          icon: Group,
          shortcut: 'Ctrl+G',
          action: () => {
            onGroup(selectedElementIds);
            onClose();
          }
        });
      }

      if (hasSingleSelection && selectedElement?.isGrouped) {
        actions.push({
          id: 'ungroup',
          label: 'Ungroup',
          icon: Ungroup,
          shortcut: 'Ctrl+Shift+G',
          action: () => {
            onUngroup(selectedElementIds[0]);
            onClose();
          }
        });
      }

      actions.push({ id: 'separator2', label: '', icon: MoreHorizontal, action: () => {}, separator: true });

      // Visibility and lock
      if (hasSingleSelection) {
        actions.push({
          id: 'toggleVisibility',
          label: selectedElement?.visible ? 'Hide' : 'Show',
          icon: selectedElement?.visible ? EyeOff : Eye,
          action: () => {
            onToggleVisibility(selectedElementIds[0]);
            onClose();
          }
        });

        actions.push({
          id: 'toggleLock',
          label: selectedElement?.locked ? 'Unlock' : 'Lock',
          icon: selectedElement?.locked ? Unlock : Lock,
          action: () => {
            onToggleLock(selectedElementIds[0]);
            onClose();
          }
        });
      }

      // Properties
      if (hasSingleSelection) {
        actions.push({
          id: 'properties',
          label: 'Properties',
          icon: Properties,
          action: () => {
            onProperties(selectedElementIds[0]);
            onClose();
          }
        });
      }

      // Export
      if (hasSingleSelection) {
        actions.push({
          id: 'export',
          label: 'Export',
          icon: Export,
          action: () => {
            onExport(selectedElementIds[0]);
            onClose();
          }
        });
      }

      actions.push({ id: 'separator3', label: '', icon: MoreHorizontal, action: () => {}, separator: true });

      // Delete
      actions.push({
        id: 'delete',
        label: 'Delete',
        icon: Trash2,
        shortcut: 'Delete',
        dangerous: true,
        action: () => {
          selectedElementIds.forEach(id => onDelete(id));
          onClose();
        }
      });
    } else {
      // No selection - canvas actions
      actions.push({
        id: 'paste',
        label: 'Paste',
        icon: Paste,
        shortcut: 'Ctrl+V',
        disabled: true, // You'd check clipboard here
        action: () => {
          onPaste();
          onClose();
        }
      });
    }

    return actions;
  };

  const handleActionClick = (action: ContextMenuAction) => {
    if (action.submenu) {
      return; // Don't close for submenus
    }
    
    if (!action.disabled) {
      action.action();
    }
  };

  const handleSubmenuHover = (action: ContextMenuAction, event: React.MouseEvent) => {
    if (action.submenu) {
      setShowSubmenu(action.id);
      const rect = event.currentTarget.getBoundingClientRect();
      setSubmenuPosition({
        x: rect.right + 5,
        y: rect.top
      });
    }
  };

  const handleSubmenuLeave = () => {
    setShowSubmenu(null);
  };

  const renderAction = (action: ContextMenuAction) => {
    if (action.separator) {
      return <div key={action.id} className="h-px bg-gray-600 my-1" />;
    }

    const IconComponent = action.icon;

    return (
      <div
        key={action.id}
        className={`relative group ${action.disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
        onMouseEnter={(e) => handleSubmenuHover(action, e)}
        onMouseLeave={handleSubmenuLeave}
      >
        <div
          onClick={() => handleActionClick(action)}
          className={`flex items-center justify-between px-3 py-2 text-sm hover:bg-gray-600 ${
            action.dangerous ? 'text-red-400 hover:text-red-300' : 'text-gray-300 hover:text-white'
          } ${action.disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
        >
          <div className="flex items-center space-x-3">
            <IconComponent className="w-4 h-4" />
            <span>{action.label}</span>
          </div>
          <div className="flex items-center space-x-2">
            {action.shortcut && (
              <span className="text-xs text-gray-500 font-mono">
                {action.shortcut}
              </span>
            )}
            {action.submenu && (
              <MoreHorizontal className="w-3 h-3" />
            )}
          </div>
        </div>

        {/* Submenu */}
        {action.submenu && showSubmenu === action.id && (
          <div
            className="absolute bg-gray-700 border border-gray-600 rounded-lg shadow-xl py-1 z-50 min-w-48"
            style={{
              left: submenuPosition.x,
              top: submenuPosition.y
            }}
          >
            {action.submenu.map(subAction => {
              if (subAction.separator) {
                return <div key={subAction.id} className="h-px bg-gray-600 my-1" />;
              }

              const SubIconComponent = subAction.icon;

              return (
                <div
                  key={subAction.id}
                  onClick={() => {
                    subAction.action();
                    setShowSubmenu(null);
                  }}
                  className={`flex items-center justify-between px-3 py-2 text-sm hover:bg-gray-600 ${
                    subAction.dangerous ? 'text-red-400 hover:text-red-300' : 'text-gray-300 hover:text-white'
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <SubIconComponent className="w-4 h-4" />
                    <span>{subAction.label}</span>
                  </div>
                  {subAction.shortcut && (
                    <span className="text-xs text-gray-500 font-mono">
                      {subAction.shortcut}
                    </span>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    );
  };

  if (!isOpen) return null;

  const actions = getActions();

  return (
    <div
      className={`fixed bg-gray-800 border border-gray-600 rounded-lg shadow-xl py-1 z-50 min-w-48 ${className}`}
      style={{
        left: x,
        top: y
      }}
    >
      {actions.map(renderAction)}
    </div>
  );
};

export default ContextMenuSystem;
