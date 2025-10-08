import { useState, useCallback } from 'react';

interface ContextMenuState {
  isOpen: boolean;
  position: { x: number; y: number };
  objectId: string | null;
}

export const useContextMenu = () => {
  const [contextMenu, setContextMenu] = useState<ContextMenuState>({
    isOpen: false,
    position: { x: 0, y: 0 },
    objectId: null
  });

  const openContextMenu = useCallback((x: number, y: number, objectId: string | null = null) => {
    setContextMenu({
      isOpen: true,
      position: { x, y },
      objectId
    });
  }, []);

  const closeContextMenu = useCallback(() => {
    setContextMenu({
      isOpen: false,
      position: { x: 0, y: 0 },
      objectId: null
    });
  }, []);

  return {
    contextMenu,
    openContextMenu,
    closeContextMenu
  };
};
