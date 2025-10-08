'use client';

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
  SendToBack
} from 'lucide-react';

// Types
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
  elementId?: string;
  elementType?: string;
  selectedElementIds: string[];
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
}

const ContextMenu: React.FC<ContextMenuProps> = ({
  isOpen,
  x,
  y,
  elementId,
  elementType,
  selectedElementIds,
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
  const handleSubmenuOpen = useCallback((actionId: string, event: React.MouseEvent) => {
    event.preventDefault();
    event.stopPropagation();
    
    const rect = event.currentTarget.getBoundingClientRect();
    setSubmenuPosition({
      x: rect.right + 5,
      y: rect.top
    });
    setSubmenuOpen(actionId);
  }, []);

  const handleSubmenuClose = useCallback(() => {
    setSubmenuOpen(null);
  }, []);

  // Generate context menu actions based on context
  const getContextActions = useCallback((): ContextMenuAction[] => {
    const actions: ContextMenuAction[] = [];

    // Basic actions
    if (elementId) {
      actions.push(
        {
          id: 'copy',
          label: 'Copy',
          icon: Copy,
          shortcut: 'Ctrl+C',
          action: () => onCopy(elementId)
        },
        {
          id: 'cut',
          label: 'Cut',
          icon: Scissors,
          shortcut: 'Ctrl+X',
          action: () => onCut(elementId)
        },
        {
          id: 'duplicate',
          label: 'Duplicate',
          icon: Copy,
          shortcut: 'Ctrl+D',
          action: () => onDuplicate(elementId)
        },
        {
          id: 'delete',
          label: 'Delete',
          icon: Trash2,
          shortcut: 'Delete',
          dangerous: true,
          action: () => onDelete(elementId)
        },
        { id: 'separator1', label: '', icon: Square, separator: true, action: () => {} }
      );
    }

    // Paste action
    actions.push({
      id: 'paste',
      label: 'Paste',
          icon: Clipboard,
      shortcut: 'Ctrl+V',
      action: onPaste
    });

    // Transform actions
    if (elementId) {
      actions.push(
        { id: 'separator2', label: '', icon: Square, separator: true, action: () => {} },
        {
          id: 'transform',
          label: 'Transform',
          icon: Move,
          submenu: [
            {
              id: 'flip-horizontal',
              label: 'Flip Horizontal',
              icon: FlipHorizontal,
              action: () => onFlipHorizontal(elementId)
            },
            {
              id: 'flip-vertical',
              label: 'Flip Vertical',
              icon: FlipVertical,
              action: () => onFlipVertical(elementId)
            },
            { id: 'separator-transform', label: '', icon: Square, separator: true, action: () => {} },
            {
              id: 'rotate-90',
              label: 'Rotate 90°',
              icon: RotateCw,
              action: () => onRotate90(elementId)
            },
            {
              id: 'rotate-180',
              label: 'Rotate 180°',
              icon: RotateCw,
              action: () => onRotate180(elementId)
            },
            {
              id: 'rotate-270',
              label: 'Rotate 270°',
              icon: RotateCcw,
              action: () => onRotate270(elementId)
            }
          ],
          action: () => {}
        }
      );
    }

    // Layer actions
    if (elementId) {
      actions.push(
        { id: 'separator3', label: '', icon: Square, separator: true, action: () => {} },
        {
          id: 'layer',
          label: 'Layer',
          icon: Layers,
          submenu: [
            {
              id: 'bring-to-front',
              label: 'Bring to Front',
              icon: BringToFront,
              action: () => onBringToFront(elementId)
            },
            {
              id: 'bring-forward',
              label: 'Bring Forward',
              icon: ArrowUp,
              action: () => onBringForward(elementId)
            },
            {
              id: 'send-backward',
              label: 'Send Backward',
              icon: ArrowDown,
              action: () => onSendBackward(elementId)
            },
            {
              id: 'send-to-back',
              label: 'Send to Back',
              icon: SendToBack,
              action: () => onSendToBack(elementId)
            }
          ],
          action: () => {}
        }
      );
    }

    // Alignment actions (for multiple selections)
    if (selectedElementIds.length > 1) {
      actions.push(
        { id: 'separator4', label: '', icon: Square, separator: true, action: () => {} },
        {
          id: 'align',
          label: 'Align',
          icon: AlignLeft,
          submenu: [
            {
              id: 'align-left',
              label: 'Align Left',
              icon: AlignLeft,
              action: () => onAlignLeft(selectedElementIds)
            },
            {
              id: 'align-center',
              label: 'Align Center',
              icon: AlignCenter,
              action: () => onAlignCenter(selectedElementIds)
            },
            {
              id: 'align-right',
              label: 'Align Right',
              icon: AlignRight,
              action: () => onAlignRight(selectedElementIds)
            },
            { id: 'separator-align', label: '', icon: Square, separator: true, action: () => {} },
            {
              id: 'align-top',
              label: 'Align Top',
              icon: ArrowUp,
              action: () => onAlignTop(selectedElementIds)
            },
            {
              id: 'align-middle',
              label: 'Align Middle',
              icon: AlignCenter,
              action: () => onAlignMiddle(selectedElementIds)
            },
            {
              id: 'align-bottom',
              label: 'Align Bottom',
              icon: ArrowDown,
              action: () => onAlignBottom(selectedElementIds)
            }
          ],
          action: () => {}
        },
        {
          id: 'distribute',
          label: 'Distribute',
          icon: Grid3X3,
          submenu: [
            {
              id: 'distribute-horizontal',
              label: 'Distribute Horizontally',
              icon: ArrowLeft,
              action: () => onDistributeHorizontal(selectedElementIds)
            },
            {
              id: 'distribute-vertical',
              label: 'Distribute Vertically',
              icon: ArrowUp,
              action: () => onDistributeVertical(selectedElementIds)
            }
          ],
          action: () => {}
        }
      );
    }

    // Group actions
    if (selectedElementIds.length > 1) {
      actions.push({
        id: 'group',
        label: 'Group',
        icon: Group,
        action: () => onGroup(selectedElementIds)
      });
    }

    if (elementId && elementType === 'group') {
      actions.push({
        id: 'ungroup',
        label: 'Ungroup',
        icon: Ungroup,
        action: () => onUngroup(elementId)
      });
    }

    // Visibility and lock actions
    if (elementId) {
      actions.push(
        { id: 'separator5', label: '', icon: Square, separator: true, action: () => {} },
        {
          id: 'toggle-visibility',
          label: 'Toggle Visibility',
          icon: Eye,
          action: () => onToggleVisibility(elementId)
        },
        {
          id: 'toggle-lock',
          label: 'Toggle Lock',
          icon: Lock,
          action: () => onToggleLock(elementId)
        }
      );
    }

    // Export and properties
    if (elementId) {
      actions.push(
        { id: 'separator6', label: '', icon: Square, separator: true, action: () => {} },
        {
          id: 'export',
          label: 'Export',
          icon: Download,
          action: () => onExport(elementId)
        },
        {
          id: 'properties',
          label: 'Properties',
          icon: Settings,
          action: () => onProperties(elementId)
        }
      );
    }

    return actions;
  }, [
    elementId,
    elementType,
    selectedElementIds,
    onCopy,
    onCut,
    onPaste,
    onDuplicate,
    onDelete,
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
  ]);

  const actions = getContextActions();

  if (!isOpen) return null;

  return (
    <>
      <div
        ref={menuRef}
        className="fixed z-50 bg-gray-800 border border-gray-600 rounded-lg shadow-xl py-1 min-w-48"
        style={{
          left: x,
          top: y,
          maxHeight: '80vh',
          overflowY: 'auto'
        }}
      >
        {actions.map((action) => {
          if (action.separator) {
            return (
              <div key={action.id} className="border-t border-gray-600 my-1" />
            );
          }

          const IconComponent = action.icon;
          const hasSubmenu = action.submenu && action.submenu.length > 0;

          return (
            <div key={action.id} className="relative">
              <button
                className={`w-full px-3 py-2 text-left text-sm flex items-center space-x-3 hover:bg-gray-700 transition-colors ${
                  action.disabled ? 'opacity-50 cursor-not-allowed' : ''
                } ${action.dangerous ? 'text-red-400 hover:text-red-300' : 'text-white'}`}
                onClick={(e) => {
                  if (action.disabled) return;
                  
                  if (hasSubmenu) {
                    handleSubmenuOpen(action.id, e);
                  } else {
                    action.action();
                    onClose();
                  }
                }}
                onMouseEnter={(e) => {
                  if (hasSubmenu && !submenuOpen) {
                    handleSubmenuOpen(action.id, e);
                  }
                }}
                disabled={action.disabled}
              >
                <IconComponent className="w-4 h-4" />
                <span className="flex-1">{action.label}</span>
                {action.shortcut && (
                  <span className="text-xs text-gray-400">{action.shortcut}</span>
                )}
                {hasSubmenu && (
                  <ArrowRight className="w-3 h-3" />
                )}
              </button>

              {/* Submenu */}
              {hasSubmenu && submenuOpen === action.id && (
                <div
                  ref={submenuRef}
                  className="absolute left-full top-0 ml-1 bg-gray-800 border border-gray-600 rounded-lg shadow-xl py-1 min-w-48 z-10"
                  style={{
                    left: submenuPosition.x,
                    top: submenuPosition.y
                  }}
                  onMouseLeave={handleSubmenuClose}
                >
                  {action.submenu!.map((subAction) => {
                    if (subAction.separator) {
                      return (
                        <div key={subAction.id} className="border-t border-gray-600 my-1" />
                      );
                    }

                    const SubIconComponent = subAction.icon;
                    return (
                      <button
                        key={subAction.id}
                        className={`w-full px-3 py-2 text-left text-sm flex items-center space-x-3 hover:bg-gray-700 transition-colors ${
                          subAction.disabled ? 'opacity-50 cursor-not-allowed' : ''
                        } ${subAction.dangerous ? 'text-red-400 hover:text-red-300' : 'text-white'}`}
                        onClick={(e) => {
                          if (subAction.disabled) return;
                          subAction.action();
                          onClose();
                        }}
                        disabled={subAction.disabled}
                      >
                        <SubIconComponent className="w-4 h-4" />
                        <span className="flex-1">{subAction.label}</span>
                        {subAction.shortcut && (
                          <span className="text-xs text-gray-400">{subAction.shortcut}</span>
                        )}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </>
  );
};

export default ContextMenu;
