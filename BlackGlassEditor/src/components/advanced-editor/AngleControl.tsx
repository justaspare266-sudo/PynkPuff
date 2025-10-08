"use client";

import React, { useState, useRef, useEffect } from 'react';

interface AngleControlProps {
  rotation: number;
  setRotation: (rotation: number) => void;
}

const AngleControl: React.FC<AngleControlProps> = ({ rotation, setRotation }) => {
  const dialRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);

  const handleMouseDown = () => {
    setIsDragging(true);
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleMouseMove = (e: MouseEvent) => {
    if (!isDragging || !dialRef.current) return;

    const rect = dialRef.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    
    // Calculate angle from center to mouse position
    const deltaX = e.clientX - centerX;
    const deltaY = e.clientY - centerY;
    const angle = Math.atan2(deltaY, deltaX) * (180 / Math.PI);
    
    // Convert to 0-360 range, with 0° at top (12 o'clock position)
    let normalizedAngle = (angle + 90 + 360) % 360;
    setRotation(Math.round(normalizedAngle));
  };

  useEffect(() => {
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging]);

  return (
    <div className="mt-4 flex justify-center">
      <div
        ref={dialRef}
        onMouseDown={handleMouseDown}
        className="relative w-24 h-24 border-2 border-dashed rounded-full flex items-center justify-center cursor-pointer"
      >
        <div
          className="absolute w-4 h-4 bg-gray-700 rounded-full"
          style={{
            transform: `rotate(${rotation}deg) translate(0, -40px)`,
          }}
        />
        <span className="text-xs absolute">{rotation}°</span>
      </div>
    </div>
  );
};

export default AngleControl;