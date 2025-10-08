import { useState, useCallback } from 'react';

interface HistoryAction {
  id: string;
  type: string;
  data: any;
  timestamp: Date;
  description?: string;
}

interface HistoryState {
  id: string;
  actions: HistoryAction[];
  timestamp: Date;
  description?: string;
}

export const useHistoryManager = () => {
  const [history, setHistory] = useState<HistoryState[]>([]);
  const [currentIndex, setCurrentIndex] = useState(-1);

  const addAction = useCallback((action: Omit<HistoryAction, 'id' | 'timestamp'>) => {
    const newAction: HistoryAction = {
      ...action,
      id: `action-${Date.now()}`,
      timestamp: new Date()
    };

    const newState: HistoryState = {
      id: `state-${Date.now()}`,
      actions: [newAction],
      timestamp: new Date(),
      description: action.description
    };

    setHistory(prev => {
      const newHistory = prev.slice(0, currentIndex + 1);
      newHistory.push(newState);
      return newHistory;
    });
    setCurrentIndex(prev => prev + 1);
  }, [currentIndex]);

  const undo = useCallback(() => {
    if (currentIndex > 0) {
      setCurrentIndex(prev => prev - 1);
    }
  }, [currentIndex]);

  const redo = useCallback(() => {
    if (currentIndex < history.length - 1) {
      setCurrentIndex(prev => prev + 1);
    }
  }, [currentIndex, history.length]);

  const canUndo = currentIndex > 0;
  const canRedo = currentIndex < history.length - 1;

  return {
    history,
    currentIndex,
    addAction,
    undo,
    redo,
    canUndo,
    canRedo
  };
};
