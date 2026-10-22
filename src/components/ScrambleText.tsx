'use client';

import { useState, useEffect } from 'react';
import { useReducedMotion } from 'framer-motion';

interface ScrambleTextProps {
  text: string;
  className?: string;
}

export default function ScrambleText({ text, className }: ScrambleTextProps) {
  const [display, setDisplay] = useState('');
  const prefersReducedMotion = useReducedMotion();
  const chars = '!<>-_\\/[]{}—=+*^?#________';

  useEffect(() => {
    if (prefersReducedMotion) {
      setDisplay(text);
      return;
    }

    let frame = 0;
    const length = text.length;
    const endFrame = 40;
    let animationId: number;

    const animate = () => {
      let output = '';
      let complete = 0;
      for (let i = 0; i < length; i++) {
        if (frame >= (i / length) * endFrame) {
          output += text[i];
          complete++;
        } else {
          output += chars[Math.floor(Math.random() * chars.length)];
        }
      }
      setDisplay(output);

      if (complete === length) {
        cancelAnimationFrame(animationId);
      } else {
        frame++;
        animationId = requestAnimationFrame(animate);
      }
    };

    animate();
    return () => cancelAnimationFrame(animationId);
  }, [text, prefersReducedMotion]);

  return <span className={className}>{display || text.replace(/./g, '_')}</span>;
}
