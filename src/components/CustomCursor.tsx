import React, { useEffect, useState } from 'react';
import { motion, useMotionValue, useSpring } from 'motion/react';
import { getAssetUrl } from '../utils/assets';

const pawPointer = getAssetUrl('cat/%D0%BB%D0%B0%D0%BF%D0%BA%D0%B0/paw2.webp');
const pawStatic = getAssetUrl('cat/%D0%BB%D0%B0%D0%BF%D0%BA%D0%B0/paw1.webp');

export default function CustomCursor() {
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  const springConfig = { damping: 25, stiffness: 250, mass: 0.5 };
  const cursorX = useSpring(mouseX, springConfig);
  const cursorY = useSpring(mouseY, springConfig);

  const [isPointer, setIsPointer] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const [isTouchDevice, setIsTouchDevice] = useState(false);

  useEffect(() => {
    if (window.matchMedia("(hover: none) and (pointer: coarse)").matches) {
      setIsTouchDevice(true);
      return;
    }
    const handleMouseMove = (e: MouseEvent) => {
      mouseX.set(e.clientX - 24);
      mouseY.set(e.clientY - 12);
      setIsVisible(true);

      const target = e.target as HTMLElement;
      const isClickable = 
        target.tagName === 'A' || 
        target.tagName === 'BUTTON' || 
        target.closest('button') || 
        target.closest('a') || 
        window.getComputedStyle(target).cursor === 'pointer';
      
      setIsPointer(!!isClickable);
    };

    const handleMouseLeave = () => setIsVisible(false);
    const handleMouseEnter = () => setIsVisible(true);

    window.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseleave', handleMouseLeave);
    document.addEventListener('mouseenter', handleMouseEnter);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseleave', handleMouseLeave);
      document.removeEventListener('mouseenter', handleMouseEnter);
    };
  }, []);

  if (isTouchDevice || !isVisible) return null;

  return (
    <motion.div
      className="fixed top-0 left-0 z-[9999] pointer-events-none hidden lg:block will-change-transform"
      style={{
        x: cursorX,
        y: cursorY,
      }}
      animate={{
        scale: isPointer ? 1.2 : 1,
      }}
      transition={{
        type: 'spring',
        damping: 25,
        stiffness: 250,
        mass: 0.5,
      }}
    >
      <img
        src={isPointer ? pawPointer : pawStatic}
        alt="cursor"
        className="w-24 h-24 object-contain"
        referrerPolicy="no-referrer"
      />
    </motion.div>
  );
}
