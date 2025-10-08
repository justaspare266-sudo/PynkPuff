import { useEffect } from 'react';
import { useEditorStore } from '../stores/editorStore';

export const useAdvancedKeyboardShortcuts = () => {
  const {
    selectedTool,
    setSelectedTool,
    undo,
    redo,
    deleteObject,
    selectedObjectId
  } = useEditorStore();

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Prevent default for our shortcuts
      if (e.ctrlKey || e.metaKey) {
        switch (e.key) {
          case 'z':
            e.preventDefault();
            if (e.shiftKey) {
              redo();
            } else {
              undo();
            }
            break;
          case 'y':
            e.preventDefault();
            redo();
            break;
          case 'a':
            e.preventDefault();
            // Select all objects
            break;
          case 'c':
            e.preventDefault();
            // Copy selected object
            break;
          case 'v':
            e.preventDefault();
            // Paste object
            break;
          case 'x':
            e.preventDefault();
            // Cut selected object
            break;
          case 's':
            e.preventDefault();
            // Save project
            break;
        }
      }

      // Tool shortcuts
      if (!e.ctrlKey && !e.metaKey && !e.altKey) {
        switch (e.key) {
          case 'v':
            e.preventDefault();
            setSelectedTool('select');
            break;
          case 't':
            e.preventDefault();
            setSelectedTool('text');
            break;
          case 'r':
            e.preventDefault();
            setSelectedTool('rect');
            break;
          case 'c':
            e.preventDefault();
            setSelectedTool('circle');
            break;
          case 'i':
            e.preventDefault();
            setSelectedTool('image');
            break;
          case 'Delete':
          case 'Backspace':
            if (selectedObjectId) {
              e.preventDefault();
              deleteObject(selectedObjectId);
            }
            break;
          case 'Escape':
            e.preventDefault();
            setSelectedTool('select');
            break;
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedTool, selectedObjectId, setSelectedTool, undo, redo, deleteObject]);
};
