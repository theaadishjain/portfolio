'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion, useReducedMotion } from 'framer-motion';
import { GitBranch, ExternalLink, ArrowRight } from 'lucide-react';
import type { Project } from '@/lib/data';

interface ProjectCardProps {
  project: Project;
}

export default function ProjectCard({ project }: ProjectCardProps) {
  const [isHovered, setIsHovered] = useState(false);
  const prefersReducedMotion = useReducedMotion();
  const router = useRouter();
  const href = `/projects/${project.slug}`;

  const handleInteraction = (type: 'enter' | 'leave' | 'click') => {
    const isTouch = window.matchMedia('(hover: none)').matches;
    if (type === 'enter' && !isTouch) setIsHovered(true);
    if (type === 'leave' && !isTouch) setIsHovered(false);
    if (type === 'click' && isTouch) setIsHovered(!isHovered);
    if (type === 'click' && !isTouch) router.push(href);
  };

  const animTransition = prefersReducedMotion
    ? { duration: 0 }
    : { type: "spring" as const, damping: 25, stiffness: 200 };

  const scrimVariants = {
    initial: { y: prefersReducedMotion ? 0 : "100%", opacity: 0 },
    hover: { y: "0%", opacity: 1, transition: animTransition },
  };

  const staggerContainer = {
    initial: {},
    hover: { transition: { staggerChildren: 0.1, delayChildren: 0.1 } },
  };

  const itemVariants = {
    initial: { opacity: 0, y: prefersReducedMotion ? 0 : 15 },
    hover: { opacity: 1, y: 0, transition: animTransition },
  };

  return (
    <motion.div
      layout
      className="relative h-full w-full overflow-hidden rounded-xl border shadow-sm cursor-pointer bg-[#1a1a1a] group"
      style={{
        borderColor: project.color,
        boxShadow: isHovered ? `0 0 25px ${project.color}40` : 'none',
        transition: 'box-shadow 0.4s ease',
      }}
      onMouseEnter={() => handleInteraction('enter')}
      onMouseLeave={() => handleInteraction('leave')}
      onClick={() => handleInteraction('click')}
      onFocus={() => setIsHovered(true)}
      onBlur={(e) => {
        if (!e.currentTarget.contains(e.relatedTarget as Node)) setIsHovered(false);
      }}
    >
      {/* Background Image */}
      <motion.img
        src={project.image}
        alt={project.title}
        className="absolute inset-0 w-full h-full object-cover origin-center"
        animate={{ scale: isHovered && !prefersReducedMotion ? 1.05 : 1 }}
        transition={{ duration: 0.4, ease: "easeOut" }}
      />

      {/* Top Persistent UI layer */}
      <div className="absolute top-4 inset-x-4 z-30 flex justify-between items-start pointer-events-none">
        <div className="px-3 py-1 rounded-sm bg-black/80 backdrop-blur-md border border-white/10 text-white/90 text-[10px] font-bold tracking-wider uppercase shadow-sm">
          {project.category}
        </div>
        <div className={`flex gap-2 pointer-events-auto transition-opacity duration-300 ${isHovered ? 'opacity-100' : 'opacity-0'}`}>
          {project.githubUrl && (
            <a href={project.githubUrl} target="_blank" rel="noreferrer" onClick={(e) => e.stopPropagation()} className="p-1.5 rounded-full bg-black/40 backdrop-blur-md hover:bg-black/80 text-white transition-colors border border-white/10">
              <GitBranch size={14} />
            </a>
          )}
          {project.liveUrl && (
            <a href={project.liveUrl} target="_blank" rel="noreferrer" onClick={(e) => e.stopPropagation()} className="p-1.5 rounded-full bg-black/40 backdrop-blur-md hover:bg-black/80 text-white transition-colors border border-white/10">
              <ExternalLink size={14} />
            </a>
          )}
        </div>
      </div>

      {/* Persistent Bottom Bar */}
      <motion.div
        initial={{ opacity: 1 }}
        animate={{ opacity: isHovered ? 0 : 1 }}
        transition={{ duration: 0.2 }}
        className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent p-4 flex items-end justify-between z-10 h-24"
      >
        <span className="text-white text-sm md:text-base font-semibold tracking-wide">{project.title}</span>
      </motion.div>

      {/* Hover/Tap Scrim overlay */}
      <motion.div
        variants={scrimVariants}
        initial="initial"
        animate={isHovered ? "hover" : "initial"}
        className="absolute inset-x-0 bottom-0 h-[75%] bg-gradient-to-t from-[#0a0a0a] via-[#0a0a0a]/90 to-transparent flex flex-col justify-end p-5 md:p-6 z-20 pointer-events-none"
      >
        <motion.div variants={staggerContainer} className="flex flex-col gap-3 pointer-events-auto">
          <motion.h3 variants={itemVariants} className="text-2xl md:text-3xl font-serif font-bold text-white leading-tight">
            {project.title}
          </motion.h3>

          <motion.p variants={itemVariants} className="text-xs md:text-sm text-white/70 font-light leading-relaxed">
            {project.description}
          </motion.p>

          <motion.div variants={itemVariants} className="flex flex-wrap gap-1.5 my-1">
            {project.tech.map((t, i) => (
              <div key={i} className="flex items-center gap-1.5 text-[10px] md:text-[11px] px-2 py-1 rounded bg-white/10 text-white/90 border border-white/5 backdrop-blur-sm">
                <t.icon size={11} className="text-white/60" />
                <span>{t.name}</span>
              </div>
            ))}
          </motion.div>

          <motion.div variants={itemVariants} className="mt-1">
            <Link
              href={href}
              onClick={(e) => e.stopPropagation()}
              className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs md:text-sm font-medium transition-all group/btn"
              style={{ color: project.color, border: `1px solid ${project.color}` }}
            >
              Read the case file
              <ArrowRight size={13} className="transition-transform group-hover/btn:translate-x-1" />
            </Link>
          </motion.div>
        </motion.div>
      </motion.div>
    </motion.div>
  );
}
