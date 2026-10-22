'use client';

import { motion } from 'framer-motion';
import { Download, GitBranch, ArrowDownRight } from 'lucide-react';
import ScrambleText from './ScrambleText';
import TypewriterRole from './TypewriterRole';
import MagneticButton from './MagneticButton';
import AgentStatusWidget from './AgentStatusWidget';
import Polaroid from './Polaroid';

export default function HeroSection() {
  return (
    <section id="home" className="w-full max-w-6xl mx-auto px-6 md:px-12 py-20 flex flex-col justify-center min-h-screen">
      <div className="flex flex-col md:flex-row items-center justify-between gap-16 w-full">
        {/* Left Column */}
        <div className="flex-1 max-w-xl z-20 relative pt-10 md:pt-0">
          <AgentStatusWidget />

          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
            className="mb-3 pl-1"
          >
            <span className="font-handwriting text-3xl text-[#d34b32]">hi, I&apos;m —</span>
          </motion.div>

          <h1 className="font-serif text-6xl md:text-[5.5rem] font-bold leading-[0.95] tracking-tight mb-6 text-[#1a1a1a]">
            <ScrambleText text="Aadish" className="block" />
            <ScrambleText text="Jain." className="block" />
          </h1>

          <motion.h2
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="text-xl md:text-2xl font-medium leading-relaxed mb-4 text-[#1a1a1a]"
          >
            CS undergrad, <TypewriterRole />, <br />
            &amp; a <span className="relative inline-block whitespace-nowrap">
              <span className="relative z-10 font-semibold">problem solver</span>
              <svg className="absolute w-full h-3 -bottom-1 left-0 text-[#d34b32] -z-10" viewBox="0 0 100 10" preserveAspectRatio="none">
                <path d="M0 5 Q 25 0, 50 5 T 100 5" stroke="currentColor" strokeWidth="2.5" fill="none" />
              </svg>
            </span>.
          </motion.h2>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="text-[#555] text-base md:text-lg mb-10 max-w-[400px] leading-relaxed font-light"
          >
            Computer Science undergraduate at <strong className="font-medium text-[#1a1a1a]">SRM Institute of Science and Technology</strong>, specializing in Deep Learning and building Agentic AI workflows.
          </motion.p>

          {/* CTA Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="flex flex-wrap items-center gap-4 relative"
          >
            <a href="/resume.pdf" target="_blank" rel="noreferrer">
              <MagneticButton className="px-7 py-3.5 bg-[#1a1a1a] text-white text-sm font-medium rounded-full hover:bg-black transition-colors flex items-center gap-2.5 shadow-xl shadow-black/10">
                Résumé <Download size={16} />
              </MagneticButton>
            </a>

            <a href="https://github.com/theaadishjain" target="_blank" rel="noreferrer">
              <MagneticButton className="px-7 py-3.5 bg-transparent border-2 border-[#1a1a1a]/10 text-[#1a1a1a] text-sm font-medium rounded-full hover:border-[#1a1a1a]/30 transition-colors flex items-center gap-2.5">
                <GitBranch size={16} /> GitHub
              </MagneticButton>
            </a>

            <a href="https://www.linkedin.com/in/theaadishjain/" target="_blank" rel="noreferrer">
              <MagneticButton className="px-7 py-3.5 bg-transparent border-2 border-[#1a1a1a]/10 text-[#1a1a1a] text-sm font-medium rounded-full hover:border-[#1a1a1a]/30 transition-colors flex items-center gap-2.5">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"/><rect x="2" y="9" width="4" height="12"/><circle cx="4" cy="4" r="2"/></svg>
                LinkedIn
              </MagneticButton>
            </a>

            {/* Hand drawn accent */}
            <div className="hidden lg:flex absolute -bottom-12 left-8 text-[#d34b32] font-handwriting text-xl items-center gap-2 -rotate-6 whitespace-nowrap">
              <ArrowDownRight size={20} strokeWidth={2} className="-mt-1" />
              p.s. — open to full-time &amp; internship opportunities
            </div>
          </motion.div>

          <div className="flex lg:hidden mt-8 text-[#d34b32] font-handwriting text-xl items-center gap-2">
            p.s. — open to full-time &amp; internship opportunities
          </div>
        </div>

        <Polaroid />
      </div>
    </section>
  );
}
