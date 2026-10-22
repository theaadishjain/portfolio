'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import dynamic from 'next/dynamic';
import { SKILLS_DATA } from '@/lib/data';
import { TECH_ICONS } from '@/lib/tech-icons';
import { GraduationCap } from 'lucide-react';

const SkillsGlobe = dynamic(() => import('./SkillsGlobe'), { ssr: false });

// ─── Grid fallback (flat skill cards) ────────────────────────────────────────
function SkillGrid() {
  const categoryColors: Record<string, string> = {
    'Languages': '#3b82f6',
    'Frontend': '#22c55e',
    'Backend': '#f97316',
    'DevOps': '#ec4899',
    'AI/ML': '#a855f7',
  };

  const categories = Object.keys(categoryColors);
  const groupedSkills = categories.map(cat => ({
    category: cat,
    color: categoryColors[cat],
    skills: SKILLS_DATA.filter(s => s.category === cat)
  })).filter(g => g.skills.length > 0);

  return (
    <div className="w-full h-full p-6 md:p-8 overflow-y-auto custom-scrollbar relative z-10">
      <div className="flex flex-col gap-8 max-w-4xl mx-auto pb-8">
        {groupedSkills.map((group, groupIdx) => (
          <div key={group.category} className="relative">
            <motion.h3
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3, delay: groupIdx * 0.1 }}
              className="text-sm font-mono tracking-widest uppercase mb-4 sticky top-0 py-2 z-20 flex items-center gap-2 bg-[#161412] shadow-[0_8px_16px_-8px_#161412]"
              style={{ color: group.color }}
            >
              <span className="w-2 h-2 rounded-full" style={{ background: group.color }} />
              {group.category}
            </motion.h3>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3 md:gap-4">
              {group.skills.map((skill, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.25, delay: (groupIdx * 0.1) + (idx * 0.03) }}
                  className="group relative bg-[#1c1c1e] border border-white/10 px-3 py-2.5 rounded-xl flex items-center gap-3 transition-all duration-300 hover:-translate-y-1 cursor-default hover:border-[var(--hover-color)] hover:shadow-[0_4px_20px_-5px_var(--hover-color)]"
                  style={{ '--hover-color': group.color } as React.CSSProperties}
                >
                  {/* Icon */}
                  <div className="flex-shrink-0 w-6 h-6 flex items-center justify-center bg-white/5 rounded-md p-1 group-hover:scale-110 transition-transform duration-300">
                    {TECH_ICONS[skill.name] || (
                       <div className="w-2 h-2 rounded-full" style={{ background: group.color }} />
                    )}
                  </div>
                  {/* Name */}
                  <span className="font-medium text-white/90 text-sm">{skill.name}</span>
                  
                  {/* Hover tooltip for description */}
                  <div className="absolute left-0 bottom-full mb-3 w-[200px] p-2.5 bg-[#2a2a2c] border border-white/10 text-white/80 text-xs rounded-lg shadow-xl opacity-0 scale-95 group-hover:opacity-100 group-hover:scale-100 transition-all pointer-events-none z-30 origin-bottom-left leading-relaxed hidden md:block">
                    {skill.context}
                    <div className="absolute left-5 top-full w-0 h-0 border-l-[5px] border-l-transparent border-r-[5px] border-r-transparent border-t-[5px] border-t-[#2a2a2c]" />
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Toggle button ────────────────────────────────────────────────────────────
function ViewToggle({ view, onChange }: { view: 'globe' | 'grid'; onChange: (v: 'globe' | 'grid') => void }) {
  return (
    <div className="flex items-center gap-1 bg-white/90 backdrop-blur-md border border-black/10 rounded-lg p-1 shadow-sm select-none">
      <button
        onClick={() => onChange('globe')}
        title="Globe view"
        className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-xs font-medium transition-all duration-200 ${
          view === 'globe'
            ? 'bg-[#1a1a1a] text-white shadow-sm'
            : 'text-[#555] hover:text-[#1a1a1a]'
        }`}
      >
        {/* Globe icon */}
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="10"/>
          <line x1="2" y1="12" x2="22" y2="12"/>
          <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/>
        </svg>
        Globe
      </button>
      <button
        onClick={() => onChange('grid')}
        title="Grid view"
        className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-xs font-medium transition-all duration-200 ${
          view === 'grid'
            ? 'bg-[#1a1a1a] text-white shadow-sm'
            : 'text-[#555] hover:text-[#1a1a1a]'
        }`}
      >
        {/* Grid icon */}
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <rect x="3" y="3" width="7" height="7"/>
          <rect x="14" y="3" width="7" height="7"/>
          <rect x="3" y="14" width="7" height="7"/>
          <rect x="14" y="14" width="7" height="7"/>
        </svg>
        Grid
      </button>
    </div>
  );
}

// ─── Section ──────────────────────────────────────────────────────────────────
export default function SkillsSection() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(false);
  const [hasWebGL, setHasWebGL] = useState(true);
  const [viewMode, setViewMode] = useState<'globe' | 'grid'>('globe');
  const prefersReducedMotion = useReducedMotion();

  useEffect(() => {
    try {
      const canvas = document.createElement('canvas');
      const hasGL = !!(window.WebGLRenderingContext && (canvas.getContext('webgl') || canvas.getContext('experimental-webgl')));
      setHasWebGL(hasGL);
      if (!hasGL) setViewMode('grid'); // force grid if no WebGL
    } catch {
      setHasWebGL(false);
      setViewMode('grid');
    }

    const observer = new IntersectionObserver(
      ([entry]) => setIsVisible(entry.isIntersecting),
      { rootMargin: '200px' }
    );
    if (containerRef.current) observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, []);

  // reduced-motion always shows grid
  const forceGrid = !hasWebGL || !!prefersReducedMotion;
  const activeView = forceGrid ? 'grid' : viewMode;

  const handleToggle = (v: 'globe' | 'grid') => {
    if (!forceGrid) setViewMode(v);
  };

  return (
    <div className="w-full max-w-6xl mx-auto px-6 md:px-12 py-20 flex flex-col justify-center relative" ref={containerRef}>
      {/* Header */}
      <div className="mb-12 z-10 relative">
        <div className="font-handwriting text-3xl md:text-4xl text-[#d34b32] -rotate-2 origin-left inline-block mb-6">
          tools of the trade —
        </div>
        <p className="text-[#555] max-w-md text-base md:text-lg leading-relaxed font-light">
          Languages, frameworks, and concepts I use to build intelligent systems.
          {activeView === 'globe' && ' Grab and spin the core to explore.'}
        </p>
      </div>

      {/* Wrapper to hold toggle button outside the masked container */}
      <div className="relative w-full">
        {/* Toggle button — top-right corner, now safe from mask clipping */}
        {!forceGrid && (
          <div className="absolute top-4 right-4 md:top-6 md:right-6 z-30">
            <ViewToggle view={activeView} onChange={handleToggle} />
          </div>
        )}

        {/* Globe / Grid container */}
        <div
          className="relative w-full h-[500px] md:h-[650px] rounded-2xl overflow-hidden bg-[#0a0805] shadow-2xl border border-black/5 flex items-center justify-center"
          style={{
            WebkitMaskImage: activeView === 'globe' ? 'radial-gradient(circle at center, black 40%, transparent 85%)' : undefined,
            maskImage: activeView === 'globe' ? 'radial-gradient(circle at center, black 40%, transparent 85%)' : undefined,
          }}
        >
          {/* Background glow and noise */}
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(211,75,50,0.1),transparent_60%)] pointer-events-none z-0" />
          <div className="bg-noise absolute inset-0 opacity-[0.15] pointer-events-none z-0" />

        {/* Views with crossfade */}
        <AnimatePresence mode="wait">
          {activeView === 'globe' ? (
            <motion.div
              key="globe"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.35 }}
              className="absolute inset-0"
            >
              {isVisible && (
                <SkillsGlobe isVisible={isVisible} prefersReducedMotion={prefersReducedMotion} />
              )}
            </motion.div>
          ) : (
            <motion.div
              key="grid"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.35 }}
              className="absolute inset-0"
            >
              <SkillGrid />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
      </div>

      {/* Legend — only relevant in globe mode */}
      <AnimatePresence>
        {activeView === 'globe' && (
          <motion.div
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 6 }}
            transition={{ duration: 0.25 }}
            className="mt-8 flex flex-wrap justify-center gap-6 text-sm font-mono text-[#555]"
          >
            <div className="flex items-center gap-2"><div className="w-2.5 h-2.5 rounded-full bg-[#3b82f6]" /> Languages</div>
            <div className="flex items-center gap-2"><div className="w-2.5 h-2.5 rounded-full bg-[#22c55e]" /> Frontend</div>
            <div className="flex items-center gap-2"><div className="w-2.5 h-2.5 rounded-full bg-[#f97316]" /> Backend</div>
            <div className="flex items-center gap-2"><div className="w-2.5 h-2.5 rounded-full bg-[#ec4899]" /> DevOps</div>
            <div className="flex items-center gap-2"><div className="w-2.5 h-2.5 rounded-full bg-[#a855f7]" /> AI/ML</div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Certifications badge row */}
      <div className="mt-12 flex flex-col items-start gap-4">
        <div className="font-handwriting text-2xl md:text-3xl text-[#d34b32] -rotate-2 origin-left inline-block">
          certified in —
        </div>
        <div className="flex flex-wrap gap-4">

          {/* Microsoft ML Ops Engineer Associate */}
          <a
            href="https://learn.microsoft.com/en-us/credentials/certifications/azure-ai-engineer/"
            target="_blank"
            rel="noreferrer"
            title="Microsoft Certified: ML Ops Engineer Associate — click to verify"
            className="inline-flex items-center gap-3 pl-2 pr-5 py-2 rounded-md bg-white border border-black/10 shadow-[0_1px_4px_rgba(0,0,0,0.07),inset_0_1px_0_rgba(255,255,255,0.9)] text-[#1a1a1a] hover:-translate-y-0.5 hover:shadow-md transition-all duration-200 no-underline"
          >
            <span className="flex items-center justify-center w-8 h-8 rounded-md bg-[#f3f4f6] border border-black/8 shadow-[inset_0_1px_2px_rgba(0,0,0,0.06)] flex-shrink-0">
              <svg width="18" height="18" viewBox="0 0 21 21" fill="none" aria-hidden="true">
                <rect x="1"  y="1"  width="9" height="9" fill="#F25022"/>
                <rect x="11" y="1"  width="9" height="9" fill="#7FBA00"/>
                <rect x="1"  y="11" width="9" height="9" fill="#00A4EF"/>
                <rect x="11" y="11" width="9" height="9" fill="#FFB900"/>
              </svg>
            </span>
            <span className="flex flex-col leading-tight">
              <span className="text-[10px] font-semibold uppercase tracking-widest text-[#888]">Microsoft</span>
              <span className="text-[13px] font-semibold text-[#1a1a1a]">ML Ops Engineer Associate</span>
            </span>
          </a>

          {/* GitHub Actions */}
          <a
            href="https://www.credly.com/org/github/badge/github-actions"
            target="_blank"
            rel="noreferrer"
            title="GitHub Certified: GitHub Actions — click to verify"
            className="inline-flex items-center gap-3 pl-2 pr-5 py-2 rounded-md bg-white border border-black/10 shadow-[0_1px_4px_rgba(0,0,0,0.07),inset_0_1px_0_rgba(255,255,255,0.9)] text-[#1a1a1a] hover:-translate-y-0.5 hover:shadow-md transition-all duration-200 no-underline"
          >
            <span className="flex items-center justify-center w-8 h-8 rounded-md bg-[#1a1a1a] border border-black/20 shadow-[inset_0_1px_2px_rgba(0,0,0,0.2)] flex-shrink-0">
              <svg width="17" height="17" viewBox="0 0 24 24" fill="white" aria-hidden="true">
                <path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12"/>
              </svg>
            </span>
            <span className="flex flex-col leading-tight">
              <span className="text-[10px] font-semibold uppercase tracking-widest text-[#888]">GitHub</span>
              <span className="text-[13px] font-semibold text-[#1a1a1a]">GitHub Actions</span>
            </span>
          </a>

          {/* NPTEL Introduction to Machine Learning */}
          <a
            href="#"
            target="_blank"
            rel="noreferrer"
            title="NPTEL Certified: Introduction to Machine Learning"
            className="inline-flex items-center gap-3 pl-2 pr-5 py-2 rounded-md bg-white border border-black/10 shadow-[0_1px_4px_rgba(0,0,0,0.07),inset_0_1px_0_rgba(255,255,255,0.9)] text-[#1a1a1a] hover:-translate-y-0.5 hover:shadow-md transition-all duration-200 no-underline"
          >
            <span className="flex items-center justify-center w-8 h-8 rounded-md bg-[#2563eb] border border-black/20 shadow-[inset_0_1px_2px_rgba(0,0,0,0.2)] flex-shrink-0 text-white">
              <GraduationCap size={18} strokeWidth={2} />
            </span>
            <span className="flex flex-col leading-tight">
              <span className="text-[10px] font-semibold uppercase tracking-widest text-[#888]">NPTEL</span>
              <span className="text-[13px] font-semibold text-[#1a1a1a]">Introduction to Machine Learning</span>
            </span>
          </a>

        </div>
      </div>
    </div>
  );
}
