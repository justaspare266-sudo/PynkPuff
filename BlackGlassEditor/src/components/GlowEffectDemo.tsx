/**
 * Glow Effect Demo Component
 * Demonstrates the selection glow effect similar to Edge's visual search
 */

import React, { useState } from 'react';
import { Stage, Layer, Rect, Circle, Text } from 'react-konva';
import SelectionGlow from './SelectionGlow';

const GlowEffectDemo: React.FC = () => {
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const demoObjects = [
    {
      id: 'rect1',
      type: 'rect' as const,
      x: 100,
      y: 100,
      width: 150,
      height: 100,
      fill: '#3b82f6',
      cornerRadius: 10
    },
    {
      id: 'circle1',
      type: 'circle' as const,
      x: 300,
      y: 150,
      radius: 60,
      fill: '#10b981'
    },
    {
      id: 'text1',
      type: 'text' as const,
      x: 100,
      y: 250,
      text: 'Glow Effect Demo',
      fontSize: 24,
      fill: '#8b5cf6'
    }
  ];

  return (
    <div className="p-8 bg-gray-100 min-h-screen">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Selection Glow Effect Demo
        </h1>
        <p className="text-gray-600 mb-6">
          Click on any object to see the subtle glow effect similar to Edge's visual search crop tool.
        </p>
        
        <div className="bg-white rounded-lg shadow-lg p-4">
          <Stage width={600} height={400}>
            <Layer>
              {/* Gradient definition */}
              <defs>
                <linearGradient id="selectionGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.8" />
                  <stop offset="50%" stopColor="#06b6d4" stopOpacity="0.9" />
                  <stop offset="100%" stopColor="#10b981" stopOpacity="0.8" />
                </linearGradient>
              </defs>
              
              {/* Demo objects */}
              {demoObjects.map((obj) => {
                const isSelected = selectedId === obj.id;
                
                if (obj.type === 'rect') {
                  return (
                    <Rect
                      key={obj.id}
                      x={obj.x}
                      y={obj.y}
                      width={obj.width}
                      height={obj.height}
                      fill={obj.fill}
                      cornerRadius={obj.cornerRadius}
                      stroke={isSelected ? '#3b82f6' : undefined}
                      strokeWidth={isSelected ? 2 : 0}
                      onClick={() => setSelectedId(obj.id)}
                    />
                  );
                } else if (obj.type === 'circle') {
                  return (
                    <Circle
                      key={obj.id}
                      x={obj.x}
                      y={obj.y}
                      radius={obj.radius}
                      fill={obj.fill}
                      stroke={isSelected ? '#3b82f6' : undefined}
                      strokeWidth={isSelected ? 2 : 0}
                      onClick={() => setSelectedId(obj.id)}
                    />
                  );
                } else if (obj.type === 'text') {
                  return (
                    <Text
                      key={obj.id}
                      x={obj.x}
                      y={obj.y}
                      text={obj.text}
                      fontSize={obj.fontSize}
                      fill={obj.fill}
                      stroke={isSelected ? '#3b82f6' : undefined}
                      strokeWidth={isSelected ? 2 : 0}
                      onClick={() => setSelectedId(obj.id)}
                    />
                  );
                }
                return null;
              })}
              
              {/* Selection Glow Effect */}
              {selectedId && (() => {
                const selectedObj = demoObjects.find(obj => obj.id === selectedId);
                if (!selectedObj) return null;
                
                if (selectedObj.type === 'text') {
                  return (
                    <SelectionGlow
                      key={`glow-${selectedObj.id}`}
                      x={selectedObj.x}
                      y={selectedObj.y}
                      width={selectedObj.text ? selectedObj.text.length * (selectedObj.fontSize || 24) * 0.6 : 100}
                      height={selectedObj.fontSize || 24}
                      type="rect"
                    />
                  );
                } else if (selectedObj.type === 'circle') {
                  return (
                    <SelectionGlow
                      key={`glow-${selectedObj.id}`}
                      x={selectedObj.x}
                      y={selectedObj.y}
                      width={0}
                      height={0}
                      radius={selectedObj.radius || 50}
                      type="circle"
                    />
                  );
                } else {
                  return (
                    <SelectionGlow
                      key={`glow-${selectedObj.id}`}
                      x={selectedObj.x}
                      y={selectedObj.y}
                      width={selectedObj.width || 100}
                      height={selectedObj.height || 100}
                      type="rect"
                      cornerRadius={selectedObj.cornerRadius || 0}
                    />
                  );
                }
              })()}
            </Layer>
          </Stage>
        </div>
        
        <div className="mt-6 text-center">
          <p className="text-sm text-gray-500">
            ✨ The glow effect uses multiple shadow layers and a gradient stroke for a professional look
          </p>
        </div>
      </div>
    </div>
  );
};

export default GlowEffectDemo;
