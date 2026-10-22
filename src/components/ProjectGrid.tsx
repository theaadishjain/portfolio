'use client';

import { useState } from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import { PROJECT_DATA } from '@/lib/data';
import ProjectCard from './ProjectCard';

/**
 * Bento span assignments keyed by (total count, card index):
 *
 * total=5 → 3-col grid, 3 rows, no gaps:
 *   [0] 2col 2row  [1] 1col 1row  [2] 1col 1row
 *   [3] 1col 2row  [4] 2col 1row
 *   Row1: [0][0][1]  Row2: [0][0][2]  Row3: [3][4][4]
 *
 * total=3 → 3-col grid, 1 row, uniform:
 *   [0][1][2] → each 1col 1row
 *
 * total=2 → 3-col grid, 1 row:
 *   [0] 2col 1row  [1] 1col 1row
 */
function getBentoClass(idx: number, total: number): string {
  if (total === 5) {
    const spans: Record<number, string> = {
      0: 'md:col-span-2 md:row-span-2',
      1: 'md:col-span-1 md:row-span-1',
      2: 'md:col-span-1 md:row-span-1',
      3: 'md:col-span-1 md:row-span-2',
      4: 'md:col-span-2 md:row-span-1',
    };
    return spans[idx] ?? 'md:col-span-1 md:row-span-1';
  }
  if (total === 2) {
    return idx === 0 ? 'md:col-span-2 md:row-span-1' : 'md:col-span-1 md:row-span-1';
  }
  // 3 cards (AI filter) or 1 card — uniform 1-col
  return 'md:col-span-1 md:row-span-1';
}

export default function ProjectGrid() {
  const prefersReducedMotion = useReducedMotion();
  const [activeFilter, setActiveFilter] = useState('All');

  const filters = ['All', 'Web', 'AI'];
  const filteredProjects = PROJECT_DATA.filter(
    (p) => activeFilter === 'All' || p.category === activeFilter
  );

  return (
    <div className="w-full max-w-6xl mx-auto px-6 md:px-12 py-20 flex flex-col justify-center">
      <div className="mb-12">
        <div className="font-handwriting text-3xl md:text-4xl text-[#d34b32] -rotate-2 origin-left inline-block mb-8">
          stuff I built instead of sleeping —
        </div>

        {/* Filter Tabs */}
        <div className="flex flex-wrap gap-2 relative">
          {filters.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveFilter(tab)}
              className={`relative px-5 py-2 rounded-full text-sm font-medium transition-colors duration-300 z-10 ${
                activeFilter === tab
                  ? 'text-white'
                  : 'text-[#1a1a1a] hover:text-black/70'
              }`}
            >
              {activeFilter === tab && (
                <motion.div
                  layoutId="activeTabPill"
                  className="absolute inset-0 bg-[#1a1a1a] rounded-full -z-10 shadow-md"
                  transition={{ type: 'spring', bounce: 0.2, duration: 0.6 }}
                />
              )}
              {tab}
            </button>
          ))}
        </div>
      </div>

      <motion.div
        layout
        className="grid grid-cols-1 md:grid-cols-3 auto-rows-[300px] md:auto-rows-[320px] gap-5 md:gap-6"
      >
        <AnimatePresence mode="popLayout">
          {filteredProjects.map((project, idx) => (
            <motion.div
              key={project.id}
              layout
              initial={{ opacity: 0, y: prefersReducedMotion ? 0 : 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
              viewport={{ once: true, margin: '-50px' }}
              transition={{
                duration: 0.5,
                delay: prefersReducedMotion ? 0 : idx * 0.08,
                layout: { type: 'spring', bounce: 0.2, duration: 0.6 },
              }}
              className={`${getBentoClass(idx, filteredProjects.length)} will-change-transform`}
            >
              <ProjectCard project={project} />
            </motion.div>
          ))}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}
