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

export const ContextMenu: React.FC<ContextMenuProps> = ({
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

  if (!isOpen) return null;

  return (
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
      {/* Basic actions */}
      {hasSelection && (
        <>
          <div 
            className="flex items-center px-3 py-2 text-sm hover:bg-gray-100 cursor-pointer text-gray-700"
            onClick={() => {
              onAction?.('edit', selectedElementIds[0]);
              onClose();
            }}
          >
            <Edit className="w-4 h-4 mr-3" />
            <span className="flex-1">Edit</span>
          </div>
          <div 
            className="flex items-center px-3 py-2 text-sm hover:bg-gray-100 cursor-pointer text-gray-700"
            onClick={() => {
              selectedElementIds.forEach(id => onCopy?.(id));
              onAction?.('copy');
              onClose();
            }}
          >
            <Copy className="w-4 h-4 mr-3" />
            <span className="flex-1">Copy</span>
            <span className="text-xs text-gray-400 ml-2">Ctrl+C</span>
          </div>
          <div 
            className="flex items-center px-3 py-2 text-sm hover:bg-gray-100 cursor-pointer text-gray-700"
            onClick={() => {
              onCut?.(selectedElementIds[0]);
              onAction?.('cut', selectedElementIds[0]);
              onClose();
            }}
          >
            <Scissors className="w-4 h-4 mr-3" />
            <span className="flex-1">Cut</span>
            <span className="text-xs text-gray-400 ml-2">Ctrl+X</span>
          </div>
          <div 
            className="flex items-center px-3 py-2 text-sm hover:bg-gray-100 cursor-pointer text-gray-700"
            onClick={() => {
              selectedElementIds.forEach(id => onDuplicate?.(id));
              onAction?.('duplicate');
              onClose();
            }}
          >
            <Copy className="w-4 h-4 mr-3" />
            <span className="flex-1">Duplicate</span>
            <span className="text-xs text-gray-400 ml-2">Ctrl+D</span>
          </div>
          <div 
            className="flex items-center px-3 py-2 text-sm hover:bg-gray-100 cursor-pointer text-red-600 hover:bg-red-50"
            onClick={() => {
              selectedElementIds.forEach(id => onDelete?.(id));
              onAction?.('delete');
              onClose();
            }}
          >
            <Trash2 className="w-4 h-4 mr-3" />
            <span className="flex-1">Delete</span>
            <span className="text-xs text-gray-400 ml-2">Delete</span>
          </div>
          <div className="border-t border-gray-200 my-1" />
        </>
      )}
      
      <div 
        className="flex items-center px-3 py-2 text-sm hover:bg-gray-100 cursor-pointer text-gray-700"
        onClick={() => {
          onPaste?.();
          onAction?.('paste');
          onClose();
        }}
      >
        <Clipboard className="w-4 h-4 mr-3" />
        <span className="flex-1">Paste</span>
        <span className="text-xs text-gray-400 ml-2">Ctrl+V</span>
      </div>
    </div>
  );
};