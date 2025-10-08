/**
 * Selection Glow Component
 * Creates a subtle glow effect around selected elements like Edge's visual search
 */

import React from 'react';
import { Rect, Circle, Group } from 'react-konva';

interface SelectionGlowProps {
  x: number;
  y: number;
  width: number;
  height: number;
  type: 'rect' | 'circle' | 'text';
  rotation?: number;
  scaleX?: number;
  scaleY?: number;
  cornerRadius?: number;
  radius?: number;
}

const SelectionGlow: React.FC<SelectionGlowProps> = ({
  x,
  y,
  width,
  height,
  type,
  rotation = 0,
  scaleX = 1,
  scaleY = 1,
  cornerRadius = 0,
  radius = 0
}) => {
  // Create multiple glow layers for depth
  const glowLayers = [
    { opacity: 0.15, blur: 25, offset: 2 },
    { opacity: 0.2, blur: 20, offset: 1 },
    { opacity: 0.25, blur: 15, offset: 0.5 },
    { opacity: 0.3, blur: 10, offset: 0 }
  ];

  const renderGlow = () => {
    if (type === 'circle') {
      return glowLayers.map((layer, index) => (
        <Circle
          key={index}
          x={x}
          y={y}
          radius={radius + layer.offset}
          stroke={`rgba(59, 130, 246, ${layer.opacity})`}
          strokeWidth={2}
          shadowColor="rgba(59, 130, 246, 0.3)"
          shadowBlur={layer.blur}
          shadowOffsetX={0}
          shadowOffsetY={0}
          rotation={rotation}
          scaleX={scaleX}
          scaleY={scaleY}
          listening={false}
        />
      ));
    } else {
      return glowLayers.map((layer, index) => (
        <Rect
          key={index}
          x={x - layer.offset}
          y={y - layer.offset}
          width={width + (layer.offset * 2)}
          height={height + (layer.offset * 2)}
          cornerRadius={cornerRadius + layer.offset}
          stroke={`rgba(59, 130, 246, ${layer.opacity})`}
          strokeWidth={2}
          shadowColor="rgba(59, 130, 246, 0.3)"
          shadowBlur={layer.blur}
          shadowOffsetX={0}
          shadowOffsetY={0}
          rotation={rotation}
          scaleX={scaleX}
          scaleY={scaleY}
          listening={false}
        />
      ));
    }
  };

  return (
    <Group>
      {renderGlow()}
      {/* Main selection border with gradient effect */}
      {type === 'circle' ? (
        <Circle
          x={x}
          y={y}
          radius={radius}
          stroke="url(#selectionGradient)"
          strokeWidth={2}
          rotation={rotation}
          scaleX={scaleX}
          scaleY={scaleY}
          listening={false}
          shadowColor="rgba(59, 130, 246, 0.3)"
          shadowBlur={8}
          shadowOffsetX={0}
          shadowOffsetY={0}
        />
      ) : (
        <Rect
          x={x}
          y={y}
          width={width}
          height={height}
          cornerRadius={cornerRadius}
          stroke="url(#selectionGradient)"
          strokeWidth={2}
          rotation={rotation}
          scaleX={scaleX}
          scaleY={scaleY}
          listening={false}
          shadowColor="rgba(59, 130, 246, 0.3)"
          shadowBlur={8}
          shadowOffsetX={0}
          shadowOffsetY={0}
        />
      )}
    </Group>
  );
};

export default SelectionGlow;
