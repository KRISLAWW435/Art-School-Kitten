import React, { useEffect, useState } from 'react';
import { motion } from 'motion/react';

const pawPointer = 'https://raw.githubusercontent.com/KRISLAWW435/Cat-assets-/main/cat/%D0%BB%D0%B0%D0%BF%D0%BA%D0%B0/paw2.webp';
const pawStatic = 'https://raw.githubusercontent.com/KRISLAWW435/Cat-assets-/main/cat/%D0%BB%D0%B0%D0%BF%D0%BA%D0%B0/paw1.webp';

export default function CustomCursor() {
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isPointer, setIsPointer] = useState(false);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setPosition({ x: e.clientX, y: e.clientY });
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

  if (!isVisible) return null;

  return (
    <motion.div
      className="fixed top-0 left-0 z-[9999] pointer-events-none"
      animate={{
        x: position.x - 24,
        y: position.y - 12,
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
