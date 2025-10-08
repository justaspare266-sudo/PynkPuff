'use client';

import React, { useRef, useEffect, useState } from 'react';
import { Stage, Layer, Rect, Circle, Text, Line, Transformer, Star, Group, Shape } from 'react-konva';
import Konva from 'konva';
import { 
  MousePointer2, 
  Pen, 
  Square,
  Circle as CircleIcon,
  Type,
  Trash2,
  Palette,
  Layers,
  Paintbrush
} from 'lucide-react';
import { useEditor, createDefaultShape } from '../contexts/EditorContext';
import { ToolPanel } from './ToolPanel';
import TextTool from './TextTool';
import ColorPicker from './ColorPicker';
import LayerManager from './LayerManager';
import { ShapeSystemPanel } from './ShapeSystemPanel';
import { CropToolPanel } from './CropToolPanel';
import { EnhancedTextToolPanel } from './EnhancedTextToolPanel';
import { EnhancedShapeToolPanel } from './EnhancedShapeToolPanel';
import { EnhancedImageToolPanel } from './EnhancedImageToolPanel';
import { EnhancedFilterToolPanel } from './EnhancedFilterToolPanel';
import { EnhancedLayerManagerPanel } from './EnhancedLayerManagerPanel';
import { EnhancedKeyboardShortcutsPanel } from './EnhancedKeyboardShortcutsPanel';
import { GradientToolPanel, GradientTool } from './GradientTool';
import { TextEnginePanel, TextEngineIntegration } from './TextEngineIntegration';
import { TextBehaviorTestPanel } from './TextBehaviorTest';
import { AlignmentGridPanel, AlignmentGridIntegration } from './AlignmentGridIntegration';
import { AnimationPresetsPanel, AnimationPresets } from './AnimationPresets';
import { AssetLibraryPanel } from './AssetLibraryPanel';
import { ShapeLibraryPanel } from './ShapeLibraryPanel';
import { FilterSystemPanel } from './FilterSystemPanel';
import { TypographySystemPanel } from './TypographySystemPanel';
import { ExportManagerPanel } from './ExportManagerPanel';
import { AnimationTimelinePanel } from './AnimationTimelinePanel';
import { PerformanceMonitorPanel } from './PerformanceMonitorPanel';
import { AIDesignSuggestionsPanel } from './AIDesignSuggestionsPanel';
import { ProjectTemplatesPanel } from './ProjectTemplatesPanel';
import { ResponsiveDesignPanel } from './ResponsiveDesignPanel';
import { SecurityAuditPanel } from './SecurityAuditPanel';
import { TestingSuitePanel } from './TestingSuitePanel';
import { EnhancedAssetManagerPanel } from './EnhancedAssetManagerPanel';
import { EnhancedColorToolPanel } from './EnhancedColorToolPanel';
import { EnhancedErrorHandlingPanel } from './EnhancedErrorHandlingPanel';
import { EnhancedHistoryManagerPanel } from './EnhancedHistoryManagerPanel';
import { ExternalIntegrationsPanel } from './ExternalIntegrationsPanel';
import { DeploymentManagerPanel } from './DeploymentManagerPanel';
import { EnhancedMemoryManagerPanel } from './EnhancedMemoryManagerPanel';
import { ArtboardManagerPanel } from './ArtboardManagerPanel';
import { AutoSaveSystemPanel } from './AutoSaveSystemPanel';
import { BatchProcessingPanel } from './BatchProcessingPanel';
import { CloudSyncPanel } from './CloudSyncPanel';
import { ColorManagementPanel } from './ColorManagementPanel';
import { ColorPalettePanel } from './ColorPalettePanel';
import { ColorHarmonyPanel } from './ColorHarmonyPanel';
import { AdvancedFontSelectorPanel } from './AdvancedFontSelectorPanel';
import { IconLibraryPanel } from './IconLibraryPanel';
import { MeasurementToolPanel } from './MeasurementToolPanel';
import { MeasurementSystemPanel } from './MeasurementSystemPanel';
import { FontPreviewPanel } from './FontPreviewPanel';
import { TextStylingPanel } from './TextStylingPanel';
import { MenuBar } from './MenuBar';
import AnimatedToolIcon from './AnimatedToolIcon';

interface BGCanvasEnhancedProps {
  width?: number;
  height?: number;
}

export function BG_Canvas_Enhanced({ width = 1200, height = 800 }: BGCanvasEnhancedProps) {
  const { state, actions } = useEditor();
  const stageRef = useRef<Konva.Stage>(null);
  const transformerRef = useRef<Konva.Transformer>(null);
  const [activePanel, setActivePanel] = useState<string | null>(null);
  const [hasDragged, setHasDragged] = useState(false);

  // Reset drawing state when tool changes
  useEffect(() => {
    if (state.tool.isDrawing) {
      actions.setDrawingState(false);
    }
    setHasDragged(false);
  }, [state.tool.selectedTool]);

  // Update transformer when selection changes
  useEffect(() => {
    if (transformerRef.current && state.tool.selectedShapeIds.length > 0) {
      const stage = stageRef.current;
      if (stage) {
        const selectedNodes = state.tool.selectedShapeIds
          .map(id => stage.findOne('#' + id))
          .filter(Boolean);
        
        if (selectedNodes.length > 0) {
          transformerRef.current.nodes(selectedNodes);
          transformerRef.current.getLayer()?.batchDraw();
        }
      }
    }
  }, [state.tool.selectedShapeIds]);

  // Stage click handler
  const handleStageClick = (e: Konva.KonvaEventObject<MouseEvent>) => {
    // If clicked on empty area
    if (e.target === e.target.getStage()) {
      actions.deselectAll();
      
      // Create new shape if tool is selected
      if (state.tool.selectedTool !== 'select') {
        const pos = e.target.getStage()?.getPointerPosition();
        if (pos) {
          const shape = createDefaultShape(
            state.tool.selectedTool as any,
            pos.x,
            pos.y,
            state.tool.toolSettings
          );
          actions.addShape(shape);
        }
      }
    } 
    // If clicked on a shape
    else {
      const id = e.target.id();
      if (e.evt.ctrlKey || e.evt.metaKey) {
        // Multi-select
        const currentSelection = state.tool.selectedShapeIds;
        if (currentSelection.includes(id)) {
          actions.selectShape(currentSelection.filter(shapeId => shapeId !== id));
        } else {
          actions.selectShape([...currentSelection, id]);
        }
      } else {
        // Single select
        actions.selectShape(id);
      }
    }
  };

  // Enhanced mouse handlers with proper drag state management
  const handleStageMouseDown = (e: Konva.KonvaEventObject<MouseEvent>) => {
    const pos = e.target.getStage()?.getPointerPosition();
    if (!pos) return;

    // Prevent multiple drawing sessions
    if (state.tool.isDrawing) return;

    // Only start drawing if we're not on the select tool
    if (state.tool.selectedTool === 'select') {
      return;
    }

    console.log('Mouse down - starting draw:', state.tool.selectedTool);
    setHasDragged(false);
    
    // Handle different tools
    switch (state.tool.selectedTool) {
      case 'pen':
        actions.setDrawingState(true, [pos.x, pos.y]);
        break;
      case 'rect':
      case 'circle':
        // Start drag-to-create for shapes
        actions.setDrawingState(true, [pos.x, pos.y]);
        break;
      case 'gradient':
        // Start gradient drag (Photoshop-style)
        actions.setDrawingState(true, [pos.x, pos.y]);
        break;
      case 'text':
        // For text, start drag-to-create mode (like other tools)
        actions.setDrawingState(true, [pos.x, pos.y]);
        break;
      default:
        // For select tool, let the existing click handler manage selection
        break;
    }
  };

  const handleStageMouseMove = (e: Konva.KonvaEventObject<MouseEvent>) => {
    const pos = e.target.getStage()?.getPointerPosition();
    if (!pos) return;

    // Handle different drawing tools
    if (state.tool.isDrawing) {
      setHasDragged(true);
      switch (state.tool.selectedTool) {
        case 'pen':
          const newLine = [...state.tool.currentLine, pos.x, pos.y];
          actions.setDrawingState(true, newLine);
          break;
        case 'rect':
        case 'circle':
          // Update the current drawing line for shape preview
          const startPos = state.tool.currentLine.slice(0, 2);
          const newShapeLine = [...startPos, pos.x, pos.y];
          actions.setDrawingState(true, newShapeLine);
          break;
        case 'gradient':
          // Update gradient line for preview
          const gradientStartPos = state.tool.currentLine.slice(0, 2);
          const newGradientLine = [...gradientStartPos, pos.x, pos.y];
          actions.setDrawingState(true, newGradientLine);
          break;
      }
    }
  };

  const handleStageMouseUp = (e: Konva.KonvaEventObject<MouseEvent>) => {
    const pos = e.target.getStage()?.getPointerPosition();
    if (!pos) return;

    // Handle different drawing tools completion
    if (state.tool.isDrawing) {
      console.log('Mouse up - creating shape:', state.tool.selectedTool, state.tool.currentLine, 'hasDragged:', hasDragged);
      
      // Only create shape if we actually dragged (not just clicked)
      if (!hasDragged) {
        console.log('No drag detected, not creating shape');
        actions.setDrawingState(false);
        return;
      }
      
      // Immediately set drawing state to false to prevent multiple calls
      actions.setDrawingState(false);
      
      switch (state.tool.selectedTool) {
        case 'pen':
          if (state.tool.currentLine.length > 2) {
            const lineShape = createDefaultShape('line', 0, 0, state.tool.toolSettings);
            lineShape.x = state.tool.currentLine[0];
            lineShape.y = state.tool.currentLine[1];
            lineShape.width = Math.abs(state.tool.currentLine[state.tool.currentLine.length - 2] - state.tool.currentLine[0]);
            lineShape.height = Math.abs(state.tool.currentLine[state.tool.currentLine.length - 1] - state.tool.currentLine[1]);
            lineShape.points = state.tool.currentLine;
            actions.addShape(lineShape);
          }
          break;
        case 'rect':
        case 'circle':
          // Create shape from drag coordinates
          if (state.tool.currentLine.length >= 4) {
            const [startX, startY, endX, endY] = state.tool.currentLine;
            const width = Math.abs(endX - startX);
            const height = Math.abs(endY - startY);
            
            // Only create shape if drag distance is significant (minimum 10px)
            if (width >= 10 || height >= 10) {
              console.log('Creating shape:', state.tool.selectedTool, { startX, startY, endX, endY, width, height });
              
              const shape = createDefaultShape(
                state.tool.selectedTool as any,
                Math.min(startX, endX),
                Math.min(startY, endY),
                state.tool.toolSettings
              );
              
              if (state.tool.selectedTool === 'circle') {
                // For circles, use the average of width and height as radius
                const radius = Math.max(Math.max(width, height) / 2, 25); // Minimum 25px radius
                shape.radius = radius;
                shape.width = radius * 2;
                shape.height = radius * 2;
              } else {
                // For rectangles, set width and height based on drag distance with minimum size
                shape.width = Math.max(width, 50); // Minimum 50px width
                shape.height = Math.max(height, 50); // Minimum 50px height
              }
              
              console.log('Adding shape:', shape);
              actions.addShape(shape);
            } else {
              console.log('Drag too small, not creating shape:', { width, height });
            }
          } else {
            console.log('Not enough coordinates for shape creation:', state.tool.currentLine.length);
          }
          break;
        case 'text':
          // Create text from drag coordinates
          if (state.tool.currentLine.length >= 4) {
            const [startX, startY, endX, endY] = state.tool.currentLine;
            const width = Math.abs(endX - startX);
            const height = Math.abs(endY - startY);
            
            // Only create text if drag distance is significant (minimum 20px)
            if (width >= 20 || height >= 20) {
              const textShape = createDefaultShape(
                'text',
                Math.min(startX, endX),
                Math.min(startY, endY),
                state.tool.toolSettings
              );
              
              // Set text properties with minimum size
              textShape.width = Math.max(width, 100); // Minimum 100px width
              textShape.height = Math.max(height, 30); // Minimum 30px height
              textShape.text = 'New Text';
              textShape.fontSize = Math.max(Math.min(height * 0.6, 48), 12); // Responsive font size
              
              actions.addShape(textShape);
            }
          }
          break;
        case 'gradient':
          // Apply gradient to selected shapes (Photoshop-style)
          if (state.tool.currentLine.length >= 4) {
            const [startX, startY, endX, endY] = state.tool.currentLine;
            
            // Apply gradient to all selected shapes
            state.tool.selectedShapeIds.forEach(shapeId => {
              actions.updateShape(shapeId, {
                fill: `linear-gradient(${Math.atan2(endY - startY, endX - startX) * 180 / Math.PI}deg, #ff6b9d, #4ecdc4)`,
                gradientStart: { x: startX, y: startY },
                gradientEnd: { x: endX, y: endY }
              });
            });
          }
          break;
      }
    }
  };

  // Handle double-click for text editing
  const handleStageDoubleClick = (e: Konva.KonvaEventObject<MouseEvent>) => {
    // Only handle double-click if we're not in drawing mode
    if (state.tool.isDrawing) return;
    
    // If double-clicked on a text shape, enable editing
    if (e.target.getType() === 'Text') {
      const textNode = e.target as Konva.Text;
      textNode.setAttr('editable', true);
      textNode.showTextCursor();
      textNode.getStage()?.batchDraw();
      
      // Focus on the text input in the panel
      setTimeout(() => {
        const textArea = document.querySelector('textarea[placeholder="Enter text here..."]') as HTMLTextAreaElement;
        if (textArea) {
          textArea.focus();
          textArea.select();
        }
      }, 100);
    }
  };

  // Snap to grid function
  const snapToGrid = (x: number, y: number) => {
    if (!state.canvas.snapToGrid) return { x, y };
    
    const gridSize = state.canvas.gridSize;
    const snappedX = Math.round(x / gridSize) * gridSize;
    const snappedY = Math.round(y / gridSize) * gridSize;
    
    return { x: snappedX, y: snappedY };
  };

  // Shape drag handlers with snap functionality
  const handleShapeDragEnd = (e: Konva.KonvaEventObject<DragEvent>) => {
    const id = e.target.id();
    const snapped = snapToGrid(e.target.x(), e.target.y());
    actions.updateShape(id, {
      x: snapped.x,
      y: snapped.y
    });
  };

  // Render shape components
  const renderShape = (shape: any) => {
    const isSelected = state.tool.selectedShapeIds.includes(shape.id);
    const commonProps = {
      id: shape.id,
      x: shape.x,
      y: shape.y,
      fill: shape.fill,
      stroke: shape.stroke,
      strokeWidth: shape.strokeWidth,
      rotation: shape.rotation,
      scaleX: shape.scaleX,
      scaleY: shape.scaleY,
      opacity: shape.opacity,
      visible: shape.visible,
      // Enable dragging when shape is selected OR when select tool is active
      draggable: isSelected || state.tool.selectedTool === 'select',
      onDragEnd: handleShapeDragEnd,
      onClick: (e: Konva.KonvaEventObject<MouseEvent>) => {
        e.cancelBubble = true;
        if (e.evt.ctrlKey || e.evt.metaKey) {
          const currentSelection = state.tool.selectedShapeIds;
          if (currentSelection.includes(shape.id)) {
            actions.selectShape(currentSelection.filter(shapeId => shapeId !== shape.id));
          } else {
            actions.selectShape([...currentSelection, shape.id]);
          }
        } else {
          actions.selectShape(shape.id);
        }
      }
    };

    switch (shape.type) {
      case 'rect':
        return (
          <Rect
            key={shape.id}
            {...commonProps}
            width={shape.width}
            height={shape.height}
          />
        );
      case 'circle':
        return (
          <Circle
            key={shape.id}
            {...commonProps}
            radius={shape.radius}
          />
        );
      case 'text':
        return (
          <Text
            key={shape.id}
            {...commonProps}
            text={shape.text}
            fontSize={shape.fontSize}
            fontFamily={shape.fontFamily}
            fontWeight={shape.fontWeight}
            fontStyle={shape.fontStyle}
            textDecoration={shape.textDecoration}
            letterSpacing={shape.letterSpacing}
            lineHeight={shape.lineHeight}
            align={shape.align}
            verticalAlign={shape.verticalAlign}
            wrap={shape.wrap}
            ellipsis={shape.ellipsis}
            padding={shape.padding}
            direction={shape.direction}
            editable={shape.isSelected}
            onDblClick={(e) => {
              e.cancelBubble = true;
              const textNode = e.target as Konva.Text;
              textNode.setAttr('editable', true);
              textNode.showTextCursor();
              textNode.getStage()?.batchDraw();
            }}
            onTextChange={(e) => {
              actions.updateShape(shape.id, { text: e.target.text() });
            }}
            onBlur={(e) => {
              const textNode = e.target as Konva.Text;
              textNode.setAttr('editable', false);
              textNode.hideTextCursor();
              textNode.getStage()?.batchDraw();
            }}
          />
        );
      case 'line':
        return (
          <Line
            key={shape.id}
            {...commonProps}
            points={shape.points || [0, 0, shape.width || 100, 0]}
            closed={shape.closed || false}
          />
        );
      case 'star':
        return (
          <Star
            key={shape.id}
            {...commonProps}
            numPoints={shape.numPoints || 5}
            innerRadius={shape.starInnerRadius || 15}
            outerRadius={shape.starOuterRadius || 25}
          />
        );
      case 'icon':
        return (
          <Group
            key={shape.id}
            {...commonProps}
            width={shape.width}
            height={shape.height}
          >
            <Shape
              sceneFunc={(context, shape) => {
                if (shape.svg) {
                  // Parse and render SVG content
                  const parser = new DOMParser();
                  const svgDoc = parser.parseFromString(shape.svg, 'image/svg+xml');
                  const svgElement = svgDoc.querySelector('svg');
                  
                  if (svgElement) {
                    // Create a temporary canvas to render the SVG
                    const canvas = document.createElement('canvas');
                    const ctx = canvas.getContext('2d');
                    if (ctx) {
                      canvas.width = shape.width;
                      canvas.height = shape.height;
                      
                      // Convert SVG to image and draw it
                      const img = new Image();
                      const svgBlob = new Blob([shape.svg], { type: 'image/svg+xml' });
                      const url = URL.createObjectURL(svgBlob);
                      
                      img.onload = () => {
                        ctx.drawImage(img, 0, 0, shape.width, shape.height);
                        const imageData = ctx.getImageData(0, 0, shape.width, shape.height);
                        
                        // Create a simple rectangle as fallback
                        context.fillStyle = shape.fill || '#000000';
                        context.fillRect(0, 0, shape.width, shape.height);
                      };
                      img.src = url;
                    }
                  } else {
                    // Fallback: draw a simple icon placeholder
                    context.fillStyle = shape.fill || '#000000';
                    context.fillRect(0, 0, shape.width, shape.height);
                  }
                } else {
                  // Fallback: draw a simple icon placeholder
                  context.fillStyle = shape.fill || '#000000';
                  context.fillRect(0, 0, shape.width, shape.height);
                }
              }}
              hitFunc={(context, shape) => {
                context.beginPath();
                context.rect(0, 0, shape.width, shape.height);
                context.closePath();
                context.fillStrokeShape(shape);
              }}
            />
          </Group>
        );
      default:
        return null;
    }
  };

  // Tools configuration
  const tools = [
    { id: 'select', icon: MousePointer2, name: 'Select' },
    { id: 'rect', icon: Square, name: 'Rectangle' },
    { id: 'circle', icon: CircleIcon, name: 'Circle' },
    { id: 'text', icon: Type, name: 'Text' },
    { id: 'pen', icon: Pen, name: 'Pen' },
    { id: 'gradient', icon: Paintbrush, name: 'Gradient' },
    { id: 'color', icon: Palette, name: 'Color' },
    { id: 'layers', icon: Layers, name: 'Layers' },
  ];

  // Get selected shape for tools
  const selectedShape = state.tool.selectedShapeIds.length === 1 
    ? state.shapes.find(s => s.id === state.tool.selectedShapeIds[0])
    : null;

  return (
    <div className="w-full h-screen flex flex-col bg-gray-900 text-white">
      {/* Menu Bar */}
      <MenuBar />
      
      <div className="flex flex-1">
        {/* Left Toolbar */}
        <div className="w-16 bg-gray-800 border-r border-gray-700 flex flex-col p-2 space-y-2">
        {tools.map((tool) => (
          <button
            key={tool.id}
            onClick={() => {
              actions.setSelectedTool(tool.id);
              if (['color', 'layers'].includes(tool.id)) {
                actions.openToolPanel(tool.id);
              }
            }}
            className={`toolbar-button w-12 h-12 rounded-lg flex items-center justify-center ${
              state.tool.selectedTool === tool.id ? 'active' : ''
            }`}
            title={tool.name}
          >
            <AnimatedToolIcon
              icon={tool.icon}
              animation="scale"
              size="md"
              isActive={state.tool.selectedTool === tool.id}
              tooltip={tool.name}
            />
          </button>
        ))}
        <ShapeSystemPanel />
        <CropToolPanel />
        <EnhancedShapeToolPanel />
        <EnhancedImageToolPanel />
        <EnhancedFilterToolPanel />
        <EnhancedLayerManagerPanel />
        <EnhancedKeyboardShortcutsPanel />
        <GradientToolPanel />
        <AlignmentGridPanel />
        <AnimationPresetsPanel />
        <AssetLibraryPanel />
        <ShapeLibraryPanel />
        <FilterSystemPanel />
        <ExportManagerPanel />
        <AnimationTimelinePanel />
        <PerformanceMonitorPanel />
        <AIDesignSuggestionsPanel />
        <ProjectTemplatesPanel />
        <ResponsiveDesignPanel />
        <SecurityAuditPanel />
        <TestingSuitePanel />
        <EnhancedAssetManagerPanel />
        <EnhancedColorToolPanel />
        <EnhancedErrorHandlingPanel />
        <EnhancedHistoryManagerPanel />
        <ExternalIntegrationsPanel />
        <DeploymentManagerPanel />
        <EnhancedMemoryManagerPanel />
        <ArtboardManagerPanel />
        <AutoSaveSystemPanel />
        <BatchProcessingPanel />
        <CloudSyncPanel />
        <ColorManagementPanel />
        <ColorPalettePanel />
        <ColorHarmonyPanel />
        <IconLibraryPanel />
        <MeasurementToolPanel />
        <MeasurementSystemPanel />
        {/* Removed only text-related panels: EnhancedTextToolPanel, TextEnginePanel, TextBehaviorTestPanel, AdvancedFontSelectorPanel, FontPreviewPanel, TypographySystemPanel */}
      </div>

      {/* Main Canvas Area */}
      <div className="flex-1 flex flex-col">
        {/* Top Toolbar */}
        <div className="h-12 bg-gray-800 border-b border-gray-700 flex items-center justify-between px-4">
          <div className="flex items-center space-x-4">
            <h1 className="text-lg font-semibold">BG Canvas Enhanced</h1>
            <div className="text-sm text-gray-300">
              Shapes: {state.shapes.length} | Selected: {state.tool.selectedShapeIds.length}
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            {/* Panel Tabs */}
            <div className="flex space-x-1">
              {[
                { id: 'shapes', name: 'Shapes', icon: Square },
                { id: 'enhanced', name: 'Enhanced', icon: Square },
                { id: 'text', name: 'Text', icon: Type },
                { id: 'color', name: 'Color', icon: Palette },
                { id: 'layers', name: 'Layers', icon: Layers }
              ].map(panel => (
                <button
                  key={panel.id}
                  onClick={() => setActivePanel(activePanel === panel.id ? null : panel.id)}
                  className={`px-3 py-1 rounded text-sm flex items-center space-x-1 ${
                    activePanel === panel.id 
                      ? 'bg-blue-600 text-white' 
                      : 'bg-gray-600 text-gray-300 hover:bg-gray-500'
                  }`}
                >
                  <panel.icon className="w-4 h-4" />
                  <span>{panel.name}</span>
                </button>
              ))}
            </div>
            
            <div className="flex items-center space-x-2">
              <label className="text-sm">Fill:</label>
              <input
                type="color"
                value={state.tool.toolSettings.fillColor}
                onChange={(e) => actions.updateToolSettings({ fillColor: e.target.value })}
                className="w-8 h-8 rounded border-0 cursor-pointer"
              />
            </div>
            <div className="flex items-center space-x-2">
              <label className="text-sm">Stroke:</label>
              <input
                type="color"
                value={state.tool.toolSettings.strokeColor}
                onChange={(e) => actions.updateToolSettings({ strokeColor: e.target.value })}
                className="w-8 h-8 rounded border-0 cursor-pointer"
              />
            </div>
            <div className="flex items-center space-x-2">
              <label className="text-sm">Width:</label>
              <input
                type="number"
                value={state.tool.toolSettings.strokeWidth}
                onChange={(e) => actions.updateToolSettings({ strokeWidth: Number(e.target.value) })}
                className="w-16 px-2 py-1 bg-gray-700 rounded text-sm"
                min="1"
                max="20"
              />
            </div>
            {state.tool.selectedShapeIds.length > 0 && (
              <button
                onClick={() => state.tool.selectedShapeIds.forEach(id => actions.deleteShape(id))}
                className="px-3 py-1 bg-red-600 text-white rounded text-sm hover:bg-red-700 flex items-center gap-1"
              >
                <Trash2 className="w-4 h-4" />
                Delete
              </button>
            )}
          </div>
        </div>

        {/* Canvas */}
        <div className="flex-1 relative bg-white">
          <Stage
            width={width}
            height={height}
            ref={stageRef}
            onClick={handleStageClick}
            onMouseDown={handleStageMouseDown}
            onMouseMove={handleStageMouseMove}
            onMouseUp={handleStageMouseUp}
            onDblClick={handleStageDoubleClick}
          >
            <Layer>
              {/* Grid */}
              {state.canvas.showGrid && (() => {
                const lines = [];
                const gridSize = state.canvas.gridSize;
                for (let x = 0; x <= width; x += gridSize) {
                  lines.push(
                    <Line
                      key={`v-${x}`}
                      points={[x, 0, x, height]}
                      stroke="#e5e7eb"
                      strokeWidth={1}
                    />
                  );
                }
                for (let y = 0; y <= height; y += gridSize) {
                  lines.push(
                    <Line
                      key={`h-${y}`}
                      points={[0, y, width, y]}
                      stroke="#e5e7eb"
                      strokeWidth={1}
                    />
                  );
                }
                return lines;
              })()}

              {/* Shapes */}
              {state.shapes.map(renderShape)}

              {/* Current drawing line */}
              {state.tool.isDrawing && state.tool.currentLine.length > 0 && (
                <>
                  {state.tool.selectedTool === 'gradient' && state.tool.currentLine.length >= 4 ? (
                    // Gradient preview line with start/end points
                    <>
                      <Line
                        points={state.tool.currentLine}
                        stroke="#ff6b9d"
                        strokeWidth={3}
                        dash={[10, 5]}
                      />
                      <Circle
                        x={state.tool.currentLine[0]}
                        y={state.tool.currentLine[1]}
                        radius={6}
                        fill="#ff6b9d"
                        stroke="#fff"
                        strokeWidth={2}
                      />
                      <Circle
                        x={state.tool.currentLine[2]}
                        y={state.tool.currentLine[3]}
                        radius={6}
                        fill="#4ecdc4"
                        stroke="#fff"
                        strokeWidth={2}
                      />
                    </>
                  ) : state.tool.selectedTool === 'rect' && state.tool.currentLine.length >= 4 ? (
                    // Rectangle preview
                    <Rect
                      x={Math.min(state.tool.currentLine[0], state.tool.currentLine[2])}
                      y={Math.min(state.tool.currentLine[1], state.tool.currentLine[3])}
                      width={Math.abs(state.tool.currentLine[2] - state.tool.currentLine[0])}
                      height={Math.abs(state.tool.currentLine[3] - state.tool.currentLine[1])}
                      stroke={state.tool.toolSettings.strokeColor}
                      strokeWidth={state.tool.toolSettings.strokeWidth}
                      fill="transparent"
                      dash={[5, 5]}
                    />
                  ) : state.tool.selectedTool === 'circle' && state.tool.currentLine.length >= 4 ? (
                    // Circle preview
                    <Circle
                      x={state.tool.currentLine[0]}
                      y={state.tool.currentLine[1]}
                      radius={Math.max(
                        Math.abs(state.tool.currentLine[2] - state.tool.currentLine[0]),
                        Math.abs(state.tool.currentLine[3] - state.tool.currentLine[1])
                      ) / 2}
                      stroke={state.tool.toolSettings.strokeColor}
                      strokeWidth={state.tool.toolSettings.strokeWidth}
                      fill="transparent"
                      dash={[5, 5]}
                    />
                  ) : state.tool.selectedTool === 'text' && state.tool.currentLine.length >= 4 ? (
                    // Text preview
                    <Rect
                      x={Math.min(state.tool.currentLine[0], state.tool.currentLine[2])}
                      y={Math.min(state.tool.currentLine[1], state.tool.currentLine[3])}
                      width={Math.abs(state.tool.currentLine[2] - state.tool.currentLine[0])}
                      height={Math.abs(state.tool.currentLine[3] - state.tool.currentLine[1])}
                      stroke={state.tool.toolSettings.strokeColor}
                      strokeWidth={state.tool.toolSettings.strokeWidth}
                      fill="transparent"
                      dash={[5, 5]}
                    />
                  ) : (
                    // Regular drawing line for pen tool
                    <Line
                      points={state.tool.currentLine}
                      stroke={state.tool.toolSettings.strokeColor}
                      strokeWidth={state.tool.toolSettings.strokeWidth}
                    />
                  )}
                </>
              )}

            </Layer>
            
            {/* Transformer Layer - separate from shapes */}
            <Layer>
              {state.tool.selectedShapeIds.length > 0 && (
                <Transformer
                  ref={transformerRef}
                  boundBoxFunc={(oldBox, newBox) => {
                    if (newBox.width < 5 || newBox.height < 5) {
                      return oldBox;
                    }
                    return newBox;
                  }}
                  enabledAnchors={['top-left', 'top-right', 'bottom-left', 'bottom-right', 'top-center', 'bottom-center', 'middle-left', 'middle-right']}
                  keepRatio={false}
                  rotateEnabled={true}
                  resizeEnabled={true}
                  onTransformEnd={(e) => {
                    const node = e.target;
                    const scaleX = node.scaleX();
                    const scaleY = node.scaleY();
                    
                    // Update the shape with new transform values
                    const shapeId = node.id();
                    actions.updateShape(shapeId, {
                      x: node.x(),
                      y: node.y(),
                      scaleX: scaleX,
                      scaleY: scaleY,
                      rotation: node.rotation(),
                    });
                    
                    // Reset scale to 1 to avoid cumulative scaling
                    node.scaleX(1);
                    node.scaleY(1);
                  }}
                />
              )}
            </Layer>
          </Stage>
        </div>
      </div>

      {/* Right Panel Area */}
      <div className="w-80 bg-gray-800 border-l border-gray-700 flex flex-col">
        {/* Panel Tabs */}
        <div className="flex border-b border-gray-700">
          <button
            className={`px-4 py-2 text-sm ${state.toolPanels.color?.isOpen ? 'bg-blue-600 text-white' : 'text-gray-400 hover:text-white'}`}
            onClick={() => actions.toggleToolPanel('color')}
          >
            Color
          </button>
          <button
            className={`px-4 py-2 text-sm ${state.toolPanels.layers?.isOpen ? 'bg-blue-600 text-white' : 'text-gray-400 hover:text-white'}`}
            onClick={() => actions.toggleToolPanel('layers')}
          >
            Layers
          </button>
          <button
            className={`px-4 py-2 text-sm ${state.toolPanels.text?.isOpen ? 'bg-blue-600 text-white' : 'text-gray-400 hover:text-white'}`}
            onClick={() => actions.toggleToolPanel('text')}
          >
            Text
          </button>
        </div>

        {/* Panel Content */}
        <div className="flex-1 overflow-y-auto">
          {state.toolPanels.color?.isOpen && (
            <div className="p-4">
              <ColorPicker
                color={{
                  r: 255,
                  g: 107,
                  b: 157,
                  a: 1,
                  h: 340,
                  s: 100,
                  l: 71,
                  hex: state.tool.toolSettings.fillColor,
                  hsl: 'hsl(340, 100%, 71%)',
                  rgb: 'rgb(255, 107, 157)',
                  rgba: 'rgba(255, 107, 157, 1)',
                  hsv: { h: 340, s: 100, v: 100 },
                  cmyk: { c: 0, m: 58, y: 38, k: 0 }
                }}
                onChange={(color) => {
                  actions.updateToolSettings({ fillColor: color.hex });
                  if (selectedShape) {
                    actions.updateShape(selectedShape.id, { fill: color.hex });
                  }
                }}
              />
            </div>
          )}

          {state.toolPanels.layers?.isOpen && (
            <div className="p-4">
              <LayerManager
                layers={state.shapes.map(shape => ({
                  ...shape,
                  name: shape.name || `${shape.type} ${shape.id}`,
                }))}
                onLayerReorder={(newLayers) => actions.reorderShapes(newLayers)}
                onLayerToggle={(id, visible) => actions.updateShape(id, { visible })}
                onLayerLock={(id, locked) => actions.updateShape(id, { locked })}
                onLayerSelect={(id) => actions.selectShape(id)}
                onLayerDelete={(id) => actions.deleteShape(id)}
                onLayerDuplicate={(id) => {
                  const shape = state.shapes.find(s => s.id === id);
                  if (shape) {
                    const duplicated = { ...shape, x: shape.x + 20, y: shape.y + 20 };
                    actions.addShape(duplicated);
                  }
                }}
                onLayerGroup={(ids) => {
                  console.log('Group layers:', ids);
                }}
                onLayerUngroup={(groupId) => {
                  console.log('Ungroup layer:', groupId);
                }}
                selectedElementIds={state.tool.selectedShapeIds}
                onElementSelect={(id) => actions.selectShape(id)}
              />
            </div>
          )}

          {state.toolPanels.text?.isOpen && (
            <div className="p-4">
              <TextTool
                onTextAdd={(textElement) => {
                  const shape = createDefaultShape('text', 100, 100, state.tool.toolSettings);
                  actions.addShape({ ...shape, ...textElement });
                }}
                onTextUpdate={(id, updates) => actions.updateShape(id, updates)}
                onTextDelete={(id) => actions.deleteShape(id)}
                canvasState={state.canvas}
                selectedTextElement={selectedShape?.type === 'text' ? selectedShape : undefined}
              />
            </div>
          )}
        </div>
      </div>

      {/* Right Panel - Integrated Property Editors */}
      {activePanel && (
        <div className="w-80 bg-gray-800 border-l border-gray-700 flex flex-col">
          {/* Panel Header */}
          <div className="p-4 border-b border-gray-700 flex items-center justify-between">
            <h3 className="text-lg font-semibold text-white">
              {activePanel === 'shapes' && 'Shape Properties'}
              {activePanel === 'enhanced' && 'Enhanced Shape Tool'}
              {activePanel === 'text' && 'Text Properties'}
              {activePanel === 'color' && 'Color Properties'}
              {activePanel === 'layers' && 'Layer Properties'}
            </h3>
            <button
              onClick={() => setActivePanel(null)}
              className="text-gray-400 hover:text-white"
            >
              ×
            </button>
          </div>

          {/* Panel Content */}
          <div className="flex-1 overflow-y-auto">
            {activePanel === 'shapes' && (
              <div className="p-4">
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Fill Color</label>
                    <input
                      type="color"
                      value={selectedShape?.fill || state.tool.toolSettings.fillColor}
                      onChange={(e) => {
                        if (selectedShape) {
                          actions.updateShape(selectedShape.id, { fill: e.target.value });
                        }
                      }}
                      className="w-full h-10 rounded border border-gray-600"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Stroke Color</label>
                    <input
                      type="color"
                      value={selectedShape?.stroke || state.tool.toolSettings.strokeColor}
                      onChange={(e) => {
                        if (selectedShape) {
                          actions.updateShape(selectedShape.id, { stroke: e.target.value });
                        }
                      }}
                      className="w-full h-10 rounded border border-gray-600"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Stroke Width</label>
                    <input
                      type="range"
                      min="0"
                      max="20"
                      value={selectedShape?.strokeWidth || state.tool.toolSettings.strokeWidth}
                      onChange={(e) => {
                        if (selectedShape) {
                          actions.updateShape(selectedShape.id, { strokeWidth: parseInt(e.target.value) });
                        }
                      }}
                      className="w-full"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Opacity</label>
                    <input
                      type="range"
                      min="0"
                      max="1"
                      step="0.1"
                      value={selectedShape?.opacity || 1}
                      onChange={(e) => {
                        if (selectedShape) {
                          actions.updateShape(selectedShape.id, { opacity: parseFloat(e.target.value) });
                        }
                      }}
                      className="w-full"
                    />
                  </div>
                </div>
              </div>
            )}
            
            {activePanel === 'enhanced' && selectedShape && (
              <div className="p-4">
                <div className="space-y-4">
                  <h4 className="text-lg font-semibold text-white">Advanced Properties</h4>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Rotation</label>
                    <input
                      type="range"
                      min="0"
                      max="360"
                      value={selectedShape.rotation || 0}
                      onChange={(e) => {
                        actions.updateShape(selectedShape.id, { rotation: parseInt(e.target.value) });
                      }}
                      className="w-full"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">Scale X</label>
                      <input
                        type="range"
                        min="0.1"
                        max="3"
                        step="0.1"
                        value={selectedShape.scaleX || 1}
                        onChange={(e) => {
                          actions.updateShape(selectedShape.id, { scaleX: parseFloat(e.target.value) });
                        }}
                        className="w-full"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">Scale Y</label>
                      <input
                        type="range"
                        min="0.1"
                        max="3"
                        step="0.1"
                        value={selectedShape.scaleY || 1}
                        onChange={(e) => {
                          actions.updateShape(selectedShape.id, { scaleY: parseFloat(e.target.value) });
                        }}
                        className="w-full"
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}
            
          {activePanel === 'text' && selectedShape && selectedShape.type === 'text' && (
            <div className="p-6">
              <div className="space-y-6">
                <h4 className="text-xl font-semibold text-white mb-6">Text Properties</h4>
                
                {/* Basic Text Content */}
                <div className="space-y-3">
                  <label className="block text-sm font-medium text-gray-300">Text Content</label>
                  <textarea
                    value={selectedShape.text || 'New Text'}
                    onChange={(e) => {
                      actions.updateShape(selectedShape.id, { text: e.target.value });
                    }}
                    className="w-full p-3 bg-gray-700 rounded text-white resize-none"
                    rows={4}
                    placeholder="Enter text here..."
                  />
                  <p className="text-xs text-gray-400">Double-click on canvas to edit directly</p>
                </div>

                {/* Your Advanced Text Property Panels */}
                <div className="space-y-6">
                  <EnhancedTextToolPanel />
                  <TypographySystemPanel />
                  <AdvancedFontSelectorPanel />
                  <FontPreviewPanel />
                  <TextStylingPanel />
                </div>
              </div>
            </div>
          )}
            
            {activePanel === 'layers' && (
              <div className="p-4">
                <div className="space-y-2">
                  <h4 className="text-lg font-semibold text-white mb-4">Layers</h4>
                  {state.shapes.map((shape, index) => (
                    <div
                      key={shape.id}
                      className={`p-2 rounded flex items-center justify-between ${
                        shape.isSelected ? 'bg-blue-600' : 'bg-gray-700'
                      }`}
                    >
                      <span className="text-sm">{shape.name || `${shape.type} ${shape.id}`}</span>
                      <div className="flex items-center space-x-2">
                        <button
                          className="text-xs px-2 py-1 bg-gray-600 rounded"
                          onClick={() => actions.selectShape(shape.id)}
                        >
                          Select
                        </button>
                        <button
                          className="text-xs px-2 py-1 bg-red-600 rounded"
                          onClick={() => actions.deleteShape(shape.id)}
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      </div>
    </div>
  );
}
