'use client';

import { useRef } from 'react';
import { motion, useSpring, useReducedMotion } from 'framer-motion';

export default function Polaroid() {
  const ref = useRef<HTMLDivElement>(null);
  const x = useSpring(0, { stiffness: 150, damping: 20 });
  const y = useSpring(0, { stiffness: 150, damping: 20 });
  const prefersReducedMotion = useReducedMotion();

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!ref.current || prefersReducedMotion) return;
    const rect = ref.current.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;

    const rotateX = ((mouseY / rect.height) - 0.5) * -15;
    const rotateY = ((mouseX / rect.width) - 0.5) * 15;

    x.set(rotateX);
    y.set(rotateY);
  };

  const handleMouseLeave = () => {
    x.set(0);
    y.set(0);
  };

  return (
    <div
      className="flex-1 flex justify-center md:justify-end z-10"
      style={{ perspective: '1200px' }}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
    >
      <motion.div
        ref={ref}
        style={{ rotateX: x, rotateY: y, z: 100, transformStyle: 'preserve-3d' }}
        className="relative origin-center cursor-pointer"
        initial={{ rotateZ: -3, y: 50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
      >
        <div className="bg-white p-4 pb-12 shadow-[0_20px_50px_rgba(0,0,0,0.15)] max-w-[300px] md:max-w-[340px] w-full rounded-sm border border-gray-100 will-change-transform">
          {/* Tape accents */}
          <div className="absolute -top-4 left-1/2 -translate-x-1/2 w-24 h-8 bg-[#e3c7ba] opacity-80 -rotate-3 shadow-sm z-20 mix-blend-multiply" />
          <div className="absolute -bottom-4 -right-4 w-20 h-6 bg-[#e3c7ba] opacity-80 -rotate-45 shadow-sm z-20 mix-blend-multiply" />

          <div className="bg-[#e5e5e5] w-full aspect-[4/5] overflow-hidden mb-4 relative filter grayscale hover:grayscale-0 transition-all duration-700">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/images/portrait.jpg"
              alt="Aadish Jain"
              className="w-full h-full object-cover"
            />
          </div>

          <div className="absolute bottom-4 left-0 w-full text-center pointer-events-none">
            <span className="font-handwriting text-2xl text-[#555]">that&apos;s me</span>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
