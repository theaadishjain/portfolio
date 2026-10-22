'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, Search, MessageSquare } from 'lucide-react';

const states = [
  { label: 'thinking...', icon: Sparkles, color: 'text-amber-500', bg: 'bg-amber-500/10' },
  { label: 'retrieving context...', icon: Search, color: 'text-blue-500', bg: 'bg-blue-500/10' },
  { label: 'responding.', icon: MessageSquare, color: 'text-emerald-500', bg: 'bg-emerald-500/10' },
];

export default function AgentStatusWidget() {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setIndex((prev) => (prev + 1) % states.length);
    }, 2500);
    return () => clearInterval(timer);
  }, []);

  const CurrentIcon = states[index].icon;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className={`absolute -top-8 md:-top-6 -right-4 md:right-12 px-3 py-1.5 rounded-full flex items-center gap-2 border border-black/5 shadow-sm backdrop-blur-sm ${states[index].bg} transition-colors duration-500`}
    >
      <motion.div
        key={index}
        initial={{ rotate: -90, opacity: 0 }}
        animate={{ rotate: 0, opacity: 1 }}
        className={states[index].color}
      >
        <CurrentIcon size={14} strokeWidth={2.5} />
      </motion.div>
      <AnimatePresence mode="wait">
        <motion.span
          key={index}
          initial={{ opacity: 0, width: 0 }}
          animate={{ opacity: 1, width: 'auto' }}
          exit={{ opacity: 0, width: 0 }}
          className={`text-xs font-medium tracking-tight whitespace-nowrap ${states[index].color}`}
        >
          {states[index].label}
        </motion.span>
      </AnimatePresence>
    </motion.div>
  );
}
