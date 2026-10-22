'use client';

import { useState } from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import { EXPERIENCE_DATA, ACTIVE_STATUS } from '@/lib/data';

export default function ExperienceSection() {
  const [activeTab, setActiveTab] = useState('Builds');
  const [isRecruiterMode, setIsRecruiterMode] = useState(false);
  const prefersReducedMotion = useReducedMotion();

  const tracks = ['Builds', 'Academic & Research', 'Prep & Competitive'];
  const filteredData = EXPERIENCE_DATA.filter((item) => item.track === activeTab);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: prefersReducedMotion ? 0 : 0.1 },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, x: prefersReducedMotion ? 0 : -10 },
    visible: { opacity: 1, x: 0, transition: { duration: 0.3 } },
  };

  return (
    <div className="w-full max-w-6xl mx-auto px-6 md:px-12 py-20 flex flex-col justify-center">
      {/* Header Area */}
      <div className="mb-12 flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <div className="font-handwriting text-3xl md:text-4xl text-[#d34b32] -rotate-2 origin-left inline-block mb-8">
            the logbook —
          </div>
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#1a1a1a]/5 border border-[#1a1a1a]/10 text-xs text-[#555] font-medium inline-flex w-fit">
            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>currently: {ACTIVE_STATUS.join(' · ')}</span>
          </div>
        </div>

        {/* Recruiter / Story Toggle */}
        <div className="flex items-center gap-3 bg-white p-1.5 rounded-full border border-black/10 shadow-sm self-start md:self-auto">
          <span className={`text-xs font-medium pl-2 transition-colors ${!isRecruiterMode ? 'text-[#1a1a1a]' : 'text-gray-400'}`}>Story</span>
          <button
            onClick={() => setIsRecruiterMode(!isRecruiterMode)}
            className="w-10 h-5 bg-[#e5e5e5] rounded-full relative flex items-center p-0.5 outline-none cursor-pointer"
            aria-label="Toggle recruiter view format"
          >
            <motion.div
              layout
              className="w-4 h-4 bg-[#1a1a1a] rounded-full shadow-md"
              animate={{ x: isRecruiterMode ? 20 : 0 }}
              transition={{ type: 'spring', stiffness: 500, damping: 30 }}
            />
          </button>
          <span className={`text-xs font-medium pr-2 transition-colors ${isRecruiterMode ? 'text-[#d34b32]' : 'text-gray-400'}`}>Resume</span>
        </div>
      </div>

      {/* Terminal UI */}
      <div className="w-full bg-[#161412] rounded-xl shadow-2xl overflow-hidden font-mono text-sm sm:text-base border border-white/5 flex flex-col">
        {/* Terminal Top Bar with integrated tabs */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between border-b border-white/5 bg-[#1c1a18]">
          <div className="flex items-center gap-4 px-4 py-3 shrink-0">
            <div className="flex gap-2 shrink-0">
              <div className="w-3 h-3 rounded-full bg-[#ff5f56]" />
              <div className="w-3 h-3 rounded-full bg-[#ffbd2e]" />
              <div className="w-3 h-3 rounded-full bg-[#27c93f]" />
            </div>
            <span className="text-gray-500 text-xs tracking-wider">experience.log</span>
          </div>

          {/* Tabs */}
          <div className="flex flex-wrap items-center gap-5 sm:gap-8 px-4 pb-2 lg:pb-0 lg:px-6">
            {tracks.map((track) => (
              <button
                key={track}
                onClick={() => setActiveTab(track)}
                className={`relative py-2 lg:py-3 text-xs sm:text-sm whitespace-nowrap transition-colors outline-none ${
                  activeTab === track ? 'text-white font-bold' : 'text-gray-500 font-medium hover:text-gray-300'
                }`}
              >
                {activeTab === track && (
                  <motion.div
                    layoutId="activeExperienceTab"
                    className="absolute bottom-0 left-0 right-0 h-[2px] bg-[#d34b32]"
                    transition={{ type: 'spring', bounce: 0.2, duration: 0.6 }}
                  />
                )}
                {track}
              </button>
            ))}
          </div>
        </div>

        {/* Terminal Body */}
        <motion.div layout className="p-6 md:p-8 min-h-[160px] overflow-y-auto max-h-[600px] relative">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab + (isRecruiterMode ? 'resume' : 'story')}
              variants={containerVariants}
              initial="hidden"
              whileInView="visible"
              exit="hidden"
              viewport={{ once: true, margin: '-50px' }}
              className="flex flex-col gap-6 md:gap-8"
            >
              {filteredData.map((item) => (
                <motion.div key={item.id} variants={itemVariants} className="group">
                  {isRecruiterMode ? (
                    <div>
                      <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
                        <span className="text-gray-500 shrink-0">[{item.date}]</span>
                        <span className="text-[#d34b32]">commit</span>
                        <span className="text-gray-400">-m</span>
                        <span className="text-gray-100 font-semibold break-words">&quot;{item.outcomeLine}&quot;</span>
                      </div>
                      <div className="pl-4 sm:pl-8 md:pl-[6.5rem] mt-2 text-xs md:text-sm">
                        <div className="text-emerald-400/80 mb-2 font-medium flex items-start gap-2">
                          <span className="text-gray-600">↳</span> {item.metric}
                        </div>
                        <div className="flex flex-wrap gap-2">
                          {item.stack.map((s) => (
                            <span key={s} className="text-[#d34b32] bg-[#d34b32]/10 border border-[#d34b32]/20 px-1.5 py-0.5 rounded">
                              #{s.toLowerCase()}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div>
                      <div className="flex gap-3">
                        <span className="text-gray-500 shrink-0 hidden sm:block">[{item.date}]</span>
                        <span className="text-blue-400 shrink-0">~</span>
                        <span className="text-gray-300 leading-relaxed text-sm md:text-base group-hover:text-white transition-colors">
                          <span className="text-gray-500 sm:hidden mr-2">[{item.date}]</span>
                          {item.narrativeLine}
                        </span>
                      </div>
                      <div className="pl-6 sm:pl-[6.5rem] mt-3 flex flex-wrap gap-2 text-xs text-gray-500">
                        {item.stack.map((s) => (
                          <span key={s} className="px-2 py-1 border border-white/10 rounded-md bg-white/5">
                            {s}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </motion.div>
              ))}
            </motion.div>
          </AnimatePresence>
        </motion.div>
      </div>
    </div>
  );
}
