import { useState, useCallback } from 'react';

export interface DrawingLine {
  id: string;
  tool: 'pen' | 'eraser';
  points: number[];
  stroke: string;
  strokeWidth: number;
}

export const useDrawing = () => {
  const [isDrawing, setIsDrawing] = useState(false);
  const [drawingMode, setDrawingMode] = useState<'pen' | 'eraser'>('pen');
  const [drawingLines, setDrawingLines] = useState<DrawingLine[]>([]);
  const [currentLine, setCurrentLine] = useState<number[]>([]);
  const [strokeWidth, setStrokeWidth] = useState(5);
  const [strokeColor, setStrokeColor] = useState('#000000');

  const startDrawing = useCallback((x: number, y: number) => {
    setIsDrawing(true);
    setCurrentLine([x, y]);
  }, []);

  const continueDrawing = useCallback((x: number, y: number) => {
    if (!isDrawing) return;
    setCurrentLine(prev => [...prev, x, y]);
  }, [isDrawing]);

  const finishDrawing = useCallback(() => {
    if (!isDrawing || currentLine.length < 4) {
      setIsDrawing(false);
      setCurrentLine([]);
      return;
    }

    const newLine: DrawingLine = {
      id: `line-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      tool: drawingMode,
      points: currentLine,
      stroke: drawingMode === 'pen' ? strokeColor : '#ffffff',
      strokeWidth: drawingMode === 'pen' ? strokeWidth : strokeWidth * 2
    };

    setDrawingLines(prev => [...prev, newLine]);
    setIsDrawing(false);
    setCurrentLine([]);
  }, [isDrawing, currentLine, drawingMode, strokeColor, strokeWidth]);

  const undoLastLine = useCallback(() => {
    setDrawingLines(prev => prev.slice(0, -1));
  }, []);

  const clearAllLines = useCallback(() => {
    setDrawingLines([]);
  }, []);

  return {
    isDrawing,
    drawingMode,
    setDrawingMode,
    drawingLines,
    currentLine,
    strokeWidth,
    setStrokeWidth,
    strokeColor,
    setStrokeColor,
    startDrawing,
    continueDrawing,
    finishDrawing,
    undoLastLine,
    clearAllLines,
    canUndo: drawingLines.length > 0
  };
};