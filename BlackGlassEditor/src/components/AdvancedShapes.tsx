import React from 'react';
import { Shape } from 'react-konva';

interface ShapeProps {
  x: number;
  y: number;
  width: number;
  height: number;
  fill: string;
  stroke?: string;
  strokeWidth?: number;
  rotation?: number;
  scaleX?: number;
  scaleY?: number;
  opacity?: number;
  onClick?: () => void;
  onDragEnd?: (e: any) => void;
  draggable?: boolean;
}

export const TriangleShape: React.FC<ShapeProps> = ({
  x, y, width, height, fill, stroke, strokeWidth = 0, rotation = 0, 
  scaleX = 1, scaleY = 1, opacity = 1, onClick, onDragEnd, draggable = true
}) => (
  <Shape
    x={x}
    y={y}
    width={width}
    height={height}
    fill={fill}
    stroke={stroke}
    strokeWidth={strokeWidth}
    rotation={rotation}
    scaleX={scaleX}
    scaleY={scaleY}
    opacity={opacity}
    draggable={draggable}
    onClick={onClick}
    onDragEnd={onDragEnd}
    sceneFunc={(context, shape) => {
      const width = shape.width();
      const height = shape.height();
      context.beginPath();
      context.moveTo(width / 2, 0); // Top point
      context.lineTo(0, height); // Bottom left
      context.lineTo(width, height); // Bottom right
      context.closePath();
      context.fillStrokeShape(shape);
    }}
  />
);

export const HeartShape: React.FC<ShapeProps> = ({
  x, y, width, height, fill, stroke, strokeWidth = 0, rotation = 0,
  scaleX = 1, scaleY = 1, opacity = 1, onClick, onDragEnd, draggable = true
}) => (
  <Shape
    x={x}
    y={y}
    width={width}
    height={height}
    fill={fill}
    stroke={stroke}
    strokeWidth={strokeWidth}
    rotation={rotation}
    scaleX={scaleX}
    scaleY={scaleY}
    opacity={opacity}
    draggable={draggable}
    onClick={onClick}
    onDragEnd={onDragEnd}
    sceneFunc={(context, shape) => {
      const width = shape.width();
      const height = shape.height();
      const centerX = width / 2;
      const centerY = height / 2;
      const radius = Math.min(width, height) / 4;
      
      context.beginPath();
      // Left curve
      context.arc(centerX - radius / 2, centerY - radius / 2, radius, Math.PI, 0, false);
      // Right curve
      context.arc(centerX + radius / 2, centerY - radius / 2, radius, Math.PI, 0, false);
      // Bottom point
      context.lineTo(centerX, centerY + radius);
      context.closePath();
      context.fillStrokeShape(shape);
    }}
  />
);

export const ArrowShape: React.FC<ShapeProps> = ({
  x, y, width, height, fill, stroke, strokeWidth = 0, rotation = 0,
  scaleX = 1, scaleY = 1, opacity = 1, onClick, onDragEnd, draggable = true
}) => (
  <Shape
    x={x}
    y={y}
    width={width}
    height={height}
    fill={fill}
    stroke={stroke}
    strokeWidth={strokeWidth}
    rotation={rotation}
    scaleX={scaleX}
    scaleY={scaleY}
    opacity={opacity}
    draggable={draggable}
    onClick={onClick}
    onDragEnd={onDragEnd}
    sceneFunc={(context, shape) => {
      const width = shape.width();
      const height = shape.height();
      const arrowHeadSize = Math.min(width * 0.3, height * 0.3);
      const shaftWidth = height * 0.2;
      
      context.beginPath();
      // Arrow shaft
      context.moveTo(0, height / 2 - shaftWidth / 2);
      context.lineTo(width - arrowHeadSize, height / 2 - shaftWidth / 2);
      context.lineTo(width - arrowHeadSize, height / 2 - height / 2);
      context.lineTo(width, height / 2);
      context.lineTo(width - arrowHeadSize, height / 2 + height / 2);
      context.lineTo(width - arrowHeadSize, height / 2 + shaftWidth / 2);
      context.lineTo(0, height / 2 + shaftWidth / 2);
      context.closePath();
      context.fillStrokeShape(shape);
    }}
  />
);

export const DiamondShape: React.FC<ShapeProps> = ({
  x, y, width, height, fill, stroke, strokeWidth = 0, rotation = 0,
  scaleX = 1, scaleY = 1, opacity = 1, onClick, onDragEnd, draggable = true
}) => (
  <Shape
    x={x}
    y={y}
    width={width}
    height={height}
    fill={fill}
    stroke={stroke}
    strokeWidth={strokeWidth}
    rotation={rotation}
    scaleX={scaleX}
    scaleY={scaleY}
    opacity={opacity}
    draggable={draggable}
    onClick={onClick}
    onDragEnd={onDragEnd}
    sceneFunc={(context, shape) => {
      const width = shape.width();
      const height = shape.height();
      
      context.beginPath();
      context.moveTo(width / 2, 0); // Top
      context.lineTo(width, height / 2); // Right
      context.lineTo(width / 2, height); // Bottom
      context.lineTo(0, height / 2); // Left
      context.closePath();
      context.fillStrokeShape(shape);
    }}
  />
);

export const CloudShape: React.FC<ShapeProps> = ({
  x, y, width, height, fill, stroke, strokeWidth = 0, rotation = 0,
  scaleX = 1, scaleY = 1, opacity = 1, onClick, onDragEnd, draggable = true
}) => (
  <Shape
    x={x}
    y={y}
    width={width}
    height={height}
    fill={fill}
    stroke={stroke}
    strokeWidth={strokeWidth}
    rotation={rotation}
    scaleX={scaleX}
    scaleY={scaleY}
    opacity={opacity}
    draggable={draggable}
    onClick={onClick}
    onDragEnd={onDragEnd}
    sceneFunc={(context, shape) => {
      const width = shape.width();
      const height = shape.height();
      
      context.beginPath();
      // Cloud shape using arcs
      context.arc(width * 0.2, height * 0.7, width * 0.15, 0, Math.PI * 2);
      context.arc(width * 0.4, height * 0.6, width * 0.2, 0, Math.PI * 2);
      context.arc(width * 0.6, height * 0.5, width * 0.25, 0, Math.PI * 2);
      context.arc(width * 0.8, height * 0.7, width * 0.15, 0, Math.PI * 2);
      context.fillStrokeShape(shape);
    }}
  />
);