'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const roles = [
  { text: "deep learning researcher", color: "text-[#d34b32]" },
  { text: "agentic AI builder", color: "text-[#1a1a1a]" },
  { text: "full-stack developer", color: "text-[#1a1a1a]" },
];

export default function TypewriterRole() {
  const [index, setIndex] = useState(0);
  const [width, setWidth] = useState<number | 'auto'>('auto');
  const measureRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const timer = setInterval(() => {
      setIndex((prev) => (prev + 1) % roles.length);
    }, 3000);
    return () => clearInterval(timer);
  }, []);

  // Measure the next word's natural width before animating
  useEffect(() => {
    if (measureRef.current) {
      setWidth(measureRef.current.offsetWidth);
    }
  }, [index]);

  return (
    <motion.span
      className="inline-block relative overflow-hidden h-[1.2em] align-bottom"
      animate={{ width }}
      transition={{ type: 'spring', stiffness: 300, damping: 30 }}
    >
      {/* Hidden measure span — renders current text off-screen to measure natural width */}
      <span
        ref={measureRef}
        aria-hidden="true"
        className="absolute invisible whitespace-nowrap italic font-semibold"
      >
        {roles[index].text}
      </span>

      <AnimatePresence mode="popLayout">
        <motion.span
          key={index}
          initial={{ y: 30, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: -30, opacity: 0 }}
          transition={{ type: 'spring', stiffness: 300, damping: 25 }}
          className={`absolute left-0 whitespace-nowrap italic font-semibold ${roles[index].color}`}
        >
          {roles[index].text}
        </motion.span>
      </AnimatePresence>
    </motion.span>
  );
}
