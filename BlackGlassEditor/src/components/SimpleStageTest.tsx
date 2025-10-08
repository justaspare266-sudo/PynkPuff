import React, { useRef } from 'react';
import { Stage, Layer, Rect } from 'react-konva';
import Konva from 'konva';

export function SimpleStageTest() {
  const stageRef = useRef<any>(null);

  const handleMouseDown = (e: any) => {
    console.log('🖱️ Simple Stage Mouse Down!', e);
    const pos = e.target.getStage().getPointerPosition();
    console.log('Position:', pos);
  };

  const handleMouseUp = (e: any) => {
    console.log('🖱️ Simple Stage Mouse Up!', e);
  };

  const handleClick = (e: any) => {
    console.log('🖱️ Simple Stage Click!', e);
  };

  return (
    <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ border: '2px solid red', padding: '10px' }}>
        <h3>Simple Stage Test</h3>
        <Stage
          ref={stageRef}
          width={400}
          height={300}
          onMouseDown={handleMouseDown}
          onMouseUp={handleMouseUp}
          onClick={handleClick}
        >
          <Layer>
            <Rect
              x={50}
              y={50}
              width={100}
              height={100}
              fill="blue"
              stroke="black"
              strokeWidth={2}
            />
            <Rect
              x={200}
              y={100}
              width={100}
              height={100}
              fill="red"
              stroke="black"
              strokeWidth={2}
            />
          </Layer>
        </Stage>
        <p>Click on the rectangles above to test mouse events</p>
      </div>
    </div>
  );
}
