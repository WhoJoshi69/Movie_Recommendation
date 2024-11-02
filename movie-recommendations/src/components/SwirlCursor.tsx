import React, { useEffect } from 'react';
import { motion, useMotionValue, useSpring } from 'framer-motion';

const SwirlCursor: React.FC = () => {
  const cursorX = useMotionValue(-100);
  const cursorY = useMotionValue(-100);

  useEffect(() => {
    const moveCursor = (e: MouseEvent) => {
      cursorX.set(e.clientX - 16);
      cursorY.set(e.clientY - 16);
    };
    window.addEventListener('mousemove', moveCursor);
    return () => {
      window.removeEventListener('mousemove', moveCursor);
    };
  }, []);

  const springConfig = { damping: 25, stiffness: 700 };
  const cursorXSpring = useSpring(cursorX, springConfig);
  const cursorYSpring = useSpring(cursorY, springConfig);

  return (
    <motion.div
      className="swirl-cursor"
      style={{
        position: 'fixed',
        left: cursorXSpring,
        top: cursorYSpring,
        width: 32,
        height: 32,
        borderRadius: '50%',
        backgroundColor: 'rgba(255, 255, 255, 0.5)',
        mixBlendMode: 'difference',
        pointerEvents: 'none',
        zIndex: 9999,
      }}
    />
  );
};

export default SwirlCursor;