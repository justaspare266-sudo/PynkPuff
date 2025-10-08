import React, { useRef, useEffect, useState } from 'react';
import { Hand, RotateCcw, ZoomIn, ZoomOut, Move, Maximize2 } from 'lucide-react';

interface TouchPoint {
  id: number;
  x: number;
  y: number;
  startX: number;
  startY: number;
  timestamp: number;
}

interface GestureState {
  type: 'none' | 'pan' | 'pinch' | 'rotate' | 'tap' | 'long-press' | 'swipe';
  scale: number;
  rotation: number;
  deltaX: number;
  deltaY: number;
  velocity: { x: number; y: number };
  center: { x: number; y: number };
}

interface TouchGestureHandlerProps {
  children: React.ReactNode;
  onGesture: (gesture: GestureState) => void;
  onTap: (point: { x: number; y: number }) => void;
  onDoubleTap: (point: { x: number; y: number }) => void;
  onLongPress: (point: { x: number; y: number }) => void;
  disabled?: boolean;
}

export const TouchGestureHandler: React.FC<TouchGestureHandlerProps> = ({
  children,
  onGesture,
  onTap,
  onDoubleTap,
  onLongPress,
  disabled = false
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [touches, setTouches] = useState<Map<number, TouchPoint>>(new Map());
  const [gestureState, setGestureState] = useState<GestureState>({
    type: 'none',
    scale: 1,
    rotation: 0,
    deltaX: 0,
    deltaY: 0,
    velocity: { x: 0, y: 0 },
    center: { x: 0, y: 0 }
  });
  const [showGestureHints, setShowGestureHints] = useState(false);
  const [lastTap, setLastTap] = useState<{ time: number; x: number; y: number } | null>(null);
  const longPressTimer = useRef<NodeJS.Timeout>();
  const velocityTracker = useRef<Array<{ x: number; y: number; time: number }>>([]);

  useEffect(() => {
    if (disabled || !containerRef.current) return;

    const container = containerRef.current;

    const handleTouchStart = (e: TouchEvent) => {
      e.preventDefault();
      
      const newTouches = new Map(touches);
      const now = Date.now();

      for (let i = 0; i < e.changedTouches.length; i++) {
        const touch = e.changedTouches[i];
        const rect = container.getBoundingClientRect();
        const x = touch.clientX - rect.left;
        const y = touch.clientY - rect.top;

        newTouches.set(touch.identifier, {
          id: touch.identifier,
          x,
          y,
          startX: x,
          startY: y,
          timestamp: now
        });
      }

      setTouches(newTouches);

      // Handle single touch
      if (newTouches.size === 1) {
        const touch = Array.from(newTouches.values())[0];
        
        // Start long press timer
        longPressTimer.current = setTimeout(() => {
          onLongPress({ x: touch.x, y: touch.y });
          setGestureState(prev => ({ ...prev, type: 'long-press' }));
        }, 500);

        // Initialize velocity tracking
        velocityTracker.current = [{ x: touch.x, y: touch.y, time: now }];
      }

      // Handle multi-touch
      if (newTouches.size >= 2) {
        clearTimeout(longPressTimer.current);
        setGestureState(prev => ({ ...prev, type: 'pinch' }));
      }
    };

    const handleTouchMove = (e: TouchEvent) => {
      e.preventDefault();
      
      const newTouches = new Map(touches);
      const now = Date.now();

      for (let i = 0; i < e.changedTouches.length; i++) {
        const touch = e.changedTouches[i];
        const existing = newTouches.get(touch.identifier);
        if (existing) {
          const rect = container.getBoundingClientRect();
          const x = touch.clientX - rect.left;
          const y = touch.clientY - rect.top;

          newTouches.set(touch.identifier, {
            ...existing,
            x,
            y
          });

          // Update velocity tracking
          velocityTracker.current.push({ x, y, time: now });
          if (velocityTracker.current.length > 5) {
            velocityTracker.current.shift();
          }
        }
      }

      setTouches(newTouches);
      clearTimeout(longPressTimer.current);

      const touchArray = Array.from(newTouches.values());

      if (touchArray.length === 1) {
        // Single touch - pan
        const touch = touchArray[0];
        const deltaX = touch.x - touch.startX;
        const deltaY = touch.y - touch.startY;
        
        // Calculate velocity
        const recent = velocityTracker.current.slice(-2);
        let velocity = { x: 0, y: 0 };
        if (recent.length === 2) {
          const dt = recent[1].time - recent[0].time;
          if (dt > 0) {
            velocity.x = (recent[1].x - recent[0].x) / dt;
            velocity.y = (recent[1].y - recent[0].y) / dt;
          }
        }

        const newGestureState: GestureState = {
          type: 'pan',
          scale: 1,
          rotation: 0,
          deltaX,
          deltaY,
          velocity,
          center: { x: touch.x, y: touch.y }
        };

        setGestureState(newGestureState);
        onGesture(newGestureState);

      } else if (touchArray.length === 2) {
        // Two touches - pinch and rotate
        const [touch1, touch2] = touchArray;
        
        // Current distance and angle
        const currentDistance = Math.sqrt(
          Math.pow(touch2.x - touch1.x, 2) + Math.pow(touch2.y - touch1.y, 2)
        );
        const currentAngle = Math.atan2(touch2.y - touch1.y, touch2.x - touch1.x);
        
        // Initial distance and angle
        const initialDistance = Math.sqrt(
          Math.pow(touch2.startX - touch1.startX, 2) + Math.pow(touch2.startY - touch1.startY, 2)
        );
        const initialAngle = Math.atan2(touch2.startY - touch1.startY, touch2.startX - touch1.startX);
        
        // Calculate scale and rotation
        const scale = currentDistance / initialDistance;
        const rotation = (currentAngle - initialAngle) * (180 / Math.PI);
        
        // Center point
        const centerX = (touch1.x + touch2.x) / 2;
        const centerY = (touch1.y + touch2.y) / 2;
        
        // Pan delta (movement of center point)
        const initialCenterX = (touch1.startX + touch2.startX) / 2;
        const initialCenterY = (touch1.startY + touch2.startY) / 2;
        const deltaX = centerX - initialCenterX;
        const deltaY = centerY - initialCenterY;

        const newGestureState: GestureState = {
          type: Math.abs(scale - 1) > 0.1 || Math.abs(rotation) > 5 ? 'pinch' : 'pan',
          scale,
          rotation,
          deltaX,
          deltaY,
          velocity: { x: 0, y: 0 },
          center: { x: centerX, y: centerY }
        };

        setGestureState(newGestureState);
        onGesture(newGestureState);
      }
    };

    const handleTouchEnd = (e: TouchEvent) => {
      e.preventDefault();
      
      const newTouches = new Map(touches);
      const now = Date.now();

      for (let i = 0; i < e.changedTouches.length; i++) {
        const touch = e.changedTouches[i];
        const existing = newTouches.get(touch.identifier);
        
        if (existing && newTouches.size === 1) {
          // Handle tap detection
          const deltaX = Math.abs(touch.clientX - (existing.startX + container.getBoundingClientRect().left));
          const deltaY = Math.abs(touch.clientY - (existing.startY + container.getBoundingClientRect().top));
          const deltaTime = now - existing.timestamp;
          
          if (deltaX < 10 && deltaY < 10 && deltaTime < 300) {
            const tapPoint = { x: existing.x, y: existing.y };
            
            // Check for double tap
            if (lastTap && 
                now - lastTap.time < 300 && 
                Math.abs(tapPoint.x - lastTap.x) < 20 && 
                Math.abs(tapPoint.y - lastTap.y) < 20) {
              onDoubleTap(tapPoint);
              setLastTap(null);
            } else {
              onTap(tapPoint);
              setLastTap({ time: now, x: tapPoint.x, y: tapPoint.y });
            }
          }

          // Handle swipe detection
          const swipeThreshold = 50;
          const swipeVelocityThreshold = 0.5;
          const totalDeltaX = existing.x - existing.startX;
          const totalDeltaY = existing.y - existing.startY;
          
          if (Math.abs(totalDeltaX) > swipeThreshold || Math.abs(totalDeltaY) > swipeThreshold) {
            const velocity = velocityTracker.current.length >= 2 ? {
              x: (velocityTracker.current[velocityTracker.current.length - 1].x - velocityTracker.current[0].x) / 
                  (velocityTracker.current[velocityTracker.current.length - 1].time - velocityTracker.current[0].time),
              y: (velocityTracker.current[velocityTracker.current.length - 1].y - velocityTracker.current[0].y) / 
                  (velocityTracker.current[velocityTracker.current.length - 1].time - velocityTracker.current[0].time)
            } : { x: 0, y: 0 };

            if (Math.abs(velocity.x) > swipeVelocityThreshold || Math.abs(velocity.y) > swipeVelocityThreshold) {
              const swipeGesture: GestureState = {
                type: 'swipe',
                scale: 1,
                rotation: 0,
                deltaX: totalDeltaX,
                deltaY: totalDeltaY,
                velocity,
                center: { x: existing.x, y: existing.y }
              };
              
              setGestureState(swipeGesture);
              onGesture(swipeGesture);
            }
          }
        }
        
        newTouches.delete(touch.identifier);
      }

      setTouches(newTouches);
      clearTimeout(longPressTimer.current);
      velocityTracker.current = [];

      if (newTouches.size === 0) {
        setGestureState({
          type: 'none',
          scale: 1,
          rotation: 0,
          deltaX: 0,
          deltaY: 0,
          velocity: { x: 0, y: 0 },
          center: { x: 0, y: 0 }
        });
      }
    };

    container.addEventListener('touchstart', handleTouchStart, { passive: false });
    container.addEventListener('touchmove', handleTouchMove, { passive: false });
    container.addEventListener('touchend', handleTouchEnd, { passive: false });
    container.addEventListener('touchcancel', handleTouchEnd, { passive: false });

    return () => {
      container.removeEventListener('touchstart', handleTouchStart);
      container.removeEventListener('touchmove', handleTouchMove);
      container.removeEventListener('touchend', handleTouchEnd);
      container.removeEventListener('touchcancel', handleTouchEnd);
      clearTimeout(longPressTimer.current);
    };
  }, [touches, disabled, onGesture, onTap, onDoubleTap, onLongPress, lastTap]);

  const getGestureIcon = () => {
    switch (gestureState.type) {
      case 'pan': return <Move className="w-4 h-4" />;
      case 'pinch': return gestureState.scale > 1 ? <ZoomIn className="w-4 h-4" /> : <ZoomOut className="w-4 h-4" />;
      case 'rotate': return <RotateCcw className="w-4 h-4" />;
      case 'long-press': return <Hand className="w-4 h-4" />;
      default: return null;
    }
  };

  return (
    <div ref={containerRef} className="relative w-full h-full touch-none">
      {children}
      
      {/* Touch Points Visualization (Debug) */}
      {process.env.NODE_ENV === 'development' && touches.size > 0 && (
        <>
          {Array.from(touches.values()).map(touch => (
            <div
              key={touch.id}
              className="absolute w-8 h-8 bg-blue-500/50 rounded-full border-2 border-blue-500 pointer-events-none z-50"
              style={{
                left: touch.x - 16,
                top: touch.y - 16,
                transform: 'translate(0, 0)'
              }}
            >
              <div className="absolute -top-6 left-1/2 transform -translate-x-1/2 text-xs bg-black text-white px-1 rounded">
                {touch.id}
              </div>
            </div>
          ))}
        </>
      )}

      {/* Gesture Indicator */}
      {gestureState.type !== 'none' && (
        <div className="fixed top-20 right-4 z-50 bg-black/75 text-white px-3 py-2 rounded-lg flex items-center gap-2">
          {getGestureIcon()}
          <span className="text-sm capitalize">{gestureState.type}</span>
          {gestureState.type === 'pinch' && (
            <span className="text-xs">
              {(gestureState.scale * 100).toFixed(0)}%
            </span>
          )}
          {gestureState.type === 'rotate' && (
            <span className="text-xs">
              {gestureState.rotation.toFixed(0)}°
            </span>
          )}
        </div>
      )}

      {/* Gesture Hints */}
      {showGestureHints && (
        <div className="fixed bottom-20 left-4 right-4 z-50 bg-black/90 text-white p-4 rounded-lg">
          <h3 className="font-medium mb-2">Touch Gestures</h3>
          <div className="grid grid-cols-2 gap-2 text-sm">
            <div className="flex items-center gap-2">
              <Hand className="w-4 h-4" />
              <span>Tap: Select</span>
            </div>
            <div className="flex items-center gap-2">
              <Maximize2 className="w-4 h-4" />
              <span>Double tap: Zoom</span>
            </div>
            <div className="flex items-center gap-2">
              <Move className="w-4 h-4" />
              <span>Drag: Pan</span>
            </div>
            <div className="flex items-center gap-2">
              <ZoomIn className="w-4 h-4" />
              <span>Pinch: Zoom</span>
            </div>
            <div className="flex items-center gap-2">
              <RotateCcw className="w-4 h-4" />
              <span>Rotate: Turn</span>
            </div>
            <div className="flex items-center gap-2">
              <Hand className="w-4 h-4" />
              <span>Long press: Menu</span>
            </div>
          </div>
          <button
            onClick={() => setShowGestureHints(false)}
            className="mt-3 px-3 py-1 bg-white/20 rounded text-sm"
          >
            Got it
          </button>
        </div>
      )}

      {/* Gesture Hints Toggle */}
      <button
        onClick={() => setShowGestureHints(!showGestureHints)}
        className="fixed bottom-4 right-4 z-40 p-3 bg-blue-500 text-white rounded-full shadow-lg"
        title="Touch Gestures Help"
      >
        <Hand className="w-5 h-5" />
      </button>
    </div>
  );
};