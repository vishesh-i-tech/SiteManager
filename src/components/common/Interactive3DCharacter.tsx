import React, { useState, useRef, useEffect, useCallback } from 'react';
import { RotateCw, Sparkles, Move3d } from 'lucide-react';

interface Interactive3DCharacterProps {
  imageSrc?: string;
  alt?: string;
  className?: string;
  showHint?: boolean;
}

export const Interactive3DCharacter: React.FC<Interactive3DCharacterProps> = ({
  imageSrc = '/images/builder_character.jpg',
  alt = 'SiteSaathi 3D Contractor Mascot',
  className = 'w-28 h-28 sm:w-36 sm:h-36',
  showHint = true,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  
  // 3D Rotation state (in degrees)
  const [rotY, setRotY] = useState(0);
  const [rotX, setRotX] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [hasInteracted, setHasInteracted] = useState(false);

  // Drag tracking refs
  const dragStartRef = useRef({ x: 0, y: 0, startRotY: 0, startRotX: 0 });
  const velocityRef = useRef({ vx: 0, vy: 0, lastX: 0, lastY: 0, lastTime: 0 });
  const animFrameRef = useRef<number | null>(null);
  const idleAnimRef = useRef<number | null>(null);

  // Subtle ambient floating / idle sway when user isn't dragging
  useEffect(() => {
    if (isDragging || hasInteracted) return;

    let startTime = Date.now();
    const animateIdle = () => {
      const elapsed = (Date.now() - startTime) / 1000;
      // Gentle sine-wave idle breathing sway
      const ambientY = Math.sin(elapsed * 1.5) * 12;
      const ambientX = Math.cos(elapsed * 1.2) * 5;
      setRotY(ambientY);
      setRotX(ambientX);
      idleAnimRef.current = requestAnimationFrame(animateIdle);
    };

    idleAnimRef.current = requestAnimationFrame(animateIdle);
    return () => {
      if (idleAnimRef.current) cancelAnimationFrame(idleAnimRef.current);
    };
  }, [isDragging, hasInteracted]);

  // Pointer Down (Mouse click or Touch start)
  const handlePointerDown = (e: React.PointerEvent) => {
    // Cancel any running inertia animation
    if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    if (idleAnimRef.current) cancelAnimationFrame(idleAnimRef.current);

    setIsDragging(true);
    setHasInteracted(true);

    dragStartRef.current = {
      x: e.clientX,
      y: e.clientY,
      startRotY: rotY,
      startRotX: rotX,
    };

    velocityRef.current = {
      vx: 0,
      vy: 0,
      lastX: e.clientX,
      lastY: e.clientY,
      lastTime: performance.now(),
    };

    // Capture pointer so moving outside the element still tracks
    try {
      e.currentTarget.setPointerCapture(e.pointerId);
    } catch {
      // Fallback for browsers that don't support capture
    }
  };

  // Pointer Move (Mouse drag or Touch move)
  const handlePointerMove = (e: React.PointerEvent) => {
    if (!isDragging) return;

    const dx = e.clientX - dragStartRef.current.x;
    const dy = e.clientY - dragStartRef.current.y;

    // Sensitivity: 0.75 deg per px horizontally, 0.4 deg per px vertically
    const nextRotY = dragStartRef.current.startRotY + dx * 0.75;
    // Clamp X tilt between -25 and 25 degrees
    const nextRotX = Math.max(-25, Math.min(25, dragStartRef.current.startRotX - dy * 0.4));

    setRotY(nextRotY);
    setRotX(nextRotX);

    // Track velocity for smooth inertia coasting
    const now = performance.now();
    const dt = Math.max(1, now - velocityRef.current.lastTime);
    velocityRef.current.vx = ((e.clientX - velocityRef.current.lastX) / dt) * 12;
    velocityRef.current.vy = ((e.clientY - velocityRef.current.lastY) / dt) * 6;
    velocityRef.current.lastX = e.clientX;
    velocityRef.current.lastY = e.clientY;
    velocityRef.current.lastTime = now;
  };

  // Pointer Up / Cancel (Release touch/click)
  const handlePointerUp = (e: React.PointerEvent) => {
    if (!isDragging) return;
    setIsDragging(false);

    try {
      e.currentTarget.releasePointerCapture(e.pointerId);
    } catch {
      // Fallback
    }

    // Apply inertia physics coasting
    let vx = velocityRef.current.vx;
    let vy = velocityRef.current.vy;

    const coast = () => {
      // Friction decay
      vx *= 0.92;
      vy *= 0.92;

      if (Math.abs(vx) > 0.1 || Math.abs(vy) > 0.1) {
        setRotY((prev) => prev + vx * 0.4);
        setRotX((prev) => Math.max(-25, Math.min(25, prev - vy * 0.2)));
        animFrameRef.current = requestAnimationFrame(coast);
      }
    };

    if (Math.abs(vx) > 0.5 || Math.abs(vy) > 0.5) {
      animFrameRef.current = requestAnimationFrame(coast);
    }
  };

  // Reset to front on double click or button click
  const handleReset = useCallback((e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    setIsDragging(false);
    setRotY(0);
    setRotX(0);
  }, []);

  return (
    <div className="flex flex-col items-center select-none">
      
      {/* 3D Perspective Stage */}
      <div
        ref={containerRef}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerUp}
        onDoubleClick={handleReset}
        className={`relative ${className} flex items-center justify-center cursor-grab active:cursor-grabbing touch-none`}
        style={{ perspective: '900px' }}
        title="Touch / drag to rotate character in 3D"
      >
        
        {/* Glow halo in background */}
        <div className="absolute inset-2 bg-gradient-to-tr from-blue-400/30 to-orange-400/30 rounded-3xl blur-xl pointer-events-none transform -translate-z-10" />

        {/* 3D Rotating Transform Card */}
        <div
          className={`relative w-full h-full rounded-2xl sm:rounded-3xl shadow-xl overflow-hidden border-2 border-white/80 dark:border-slate-700/80 bg-white/90 dark:bg-slate-800/90 transition-shadow ${
            isDragging ? 'shadow-2xl scale-[1.03]' : 'hover:shadow-2xl'
          }`}
          style={{
            transform: `rotateX(${rotX.toFixed(1)}deg) rotateY(${rotY.toFixed(1)}deg) translateZ(15px)`,
            transformStyle: 'preserve-3d',
            transition: isDragging ? 'none' : 'transform 0.2s cubic-bezier(0.2, 0.8, 0.2, 1), box-shadow 0.2s ease',
          }}
        >
          {/* 3D Character Image */}
          <img
            src={imageSrc}
            alt={alt}
            className="w-full h-full object-cover rounded-2xl sm:rounded-3xl pointer-events-none select-none"
            draggable={false}
          />

          {/* Dynamic 3D lighting reflection overlay */}
          <div
            className="absolute inset-0 pointer-events-none rounded-2xl sm:rounded-3xl transition-opacity"
            style={{
              background: `linear-gradient(${115 + rotY * 0.5}deg, rgba(255,255,255,${Math.max(0.1, 0.35 + Math.sin((rotY * Math.PI) / 180) * 0.25)}) 0%, rgba(255,255,255,0) 65%)`,
            }}
          />

        </div>

        {/* Dynamic 3D Ground Shadow beneath character */}
        <div
          className="absolute -bottom-2 w-3/4 h-2.5 rounded-full bg-slate-900/20 dark:bg-black/40 blur-md pointer-events-none"
          style={{
            transform: `translateX(${(-rotY * 0.3).toFixed(1)}px) scaleX(${Math.max(0.5, Math.abs(Math.cos((rotY * Math.PI) / 180)))})`,
            transition: isDragging ? 'none' : 'transform 0.2s ease-out',
          }}
        />
      </div>

    </div>
  );
};
