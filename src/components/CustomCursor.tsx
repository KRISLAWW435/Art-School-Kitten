import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { motion, useMotionValue, useSpring } from 'motion/react';

export default function CustomCursor() {
  const [isVisible, setIsVisible] = useState(true);
  const [isPointer, setIsPointer] = useState(false);
  
  const mouseX = useMotionValue(-100);
  const mouseY = useMotionValue(-100);

  const springConfig = { damping: 25, stiffness: 400, mass: 0.5 };
  const cursorX = useSpring(mouseX, springConfig);
  const cursorY = useSpring(mouseY, springConfig);

  useEffect(() => {
    // Center it initially so it's not totally invisible before moving
    mouseX.set(window.innerWidth / 2);
    mouseY.set(window.innerHeight / 2);

    const moveCursor = (e: MouseEvent | TouchEvent) => {
      let clientX = 0;
      let clientY = 0;
      
      if ('touches' in e && e.touches.length > 0) {
        clientX = e.touches[0].clientX;
        clientY = e.touches[0].clientY;
      } else if ('clientX' in e) {
        clientX = (e as MouseEvent).clientX;
        clientY = (e as MouseEvent).clientY;
      } else {
        return;
      }

      mouseX.set(clientX);
      mouseY.set(clientY);
      
      if (!isVisible) setIsVisible(true);
      
      const target = e.target as HTMLElement;
      if (target) {
        const computedCursor = window.getComputedStyle(target).cursor;
        const parentTag = target.closest('a, button, [role="button"], input, select');
        setIsPointer(computedCursor === 'pointer' || !!parentTag);
      }
    };

    const handleMouseLeave = () => setIsVisible(false);
    const handleMouseEnter = () => setIsVisible(true);

    window.addEventListener('mousemove', moveCursor);
    window.addEventListener('touchmove', moveCursor, { passive: true });
    window.addEventListener('touchstart', moveCursor, { passive: true });
    document.addEventListener('mouseleave', handleMouseLeave);
    document.addEventListener('mouseenter', handleMouseEnter);

    return () => {
      window.removeEventListener('mousemove', moveCursor);
      window.removeEventListener('touchmove', moveCursor);
      window.removeEventListener('touchstart', moveCursor);
      document.removeEventListener('mouseleave', handleMouseLeave);
      document.removeEventListener('mouseenter', handleMouseEnter);
    };
  }, [mouseX, mouseY, isVisible]);

  if (!isVisible || typeof document === 'undefined') return null;

  return createPortal(
    <motion.div
      className="fixed top-0 left-0 pointer-events-none z-[999999]"
      style={{
        x: cursorX,
        y: cursorY,
        translateX: '-50%',
        translateY: '-50%'
      }}
    >
      <div 
        className="relative flex items-center justify-center transition-transform duration-200"
        style={{ transform: isPointer ? 'scale(1.2)' : 'scale(1)' }}
      >
        <div className="w-8 h-8 bg-emerald-500/80 rounded-full blur-[2px] absolute shadow-[0_0_15px_rgba(16,185,129,0.8)]" />
        <div className="w-4 h-4 bg-white rounded-full relative z-10" />
      </div>
    </motion.div>,
    document.body
  );
}
