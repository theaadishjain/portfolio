'use client';

import { useState, useEffect } from 'react';
import { Home, Folder, Briefcase, Wrench, PenTool } from 'lucide-react';

const navItems = [
  { icon: Home, label: 'Home', id: 'home' },
  { icon: Folder, label: 'Projects', id: 'projects' },
  { icon: Briefcase, label: 'Experience', id: 'experience' },
  { icon: Wrench, label: 'Skills', id: 'skills' },
  { icon: PenTool, label: 'Contact', id: 'contact' },
];

export default function ResponsiveNav() {
  const [activeSection, setActiveSection] = useState('home');

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveSection(entry.target.id);
          }
        });
      },
      { threshold: 0.5 }
    );

    document.querySelectorAll('section[id]').forEach((section) => {
      observer.observe(section);
    });

    return () => observer.disconnect();
  }, []);

  return (
    <>
      {/* Desktop Vertical Left Sidebar */}
      <nav className="hidden md:flex flex-col items-center justify-center fixed left-6 top-1/2 -translate-y-1/2 z-50">
        <div className="relative bg-[#1c1c1e] text-white rounded-full py-6 px-3 flex flex-col items-center gap-6 shadow-2xl border border-white/10 backdrop-blur-md">
          {/* Active Status Pulse Dot */}
          <div className="absolute -top-1 left-1/2 -translate-x-1/2 w-3 h-3 bg-[#1c1c1e] rounded-full flex items-center justify-center border border-white/10" title="Available">
            <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.8)]" />
          </div>

          {navItems.map((item) => {
            const isActive = activeSection === item.id;
            return (
              <a
                key={item.id}
                href={`#${item.id}`}
                className={`relative group flex items-center justify-center transition-all duration-300 hover:scale-110 ${isActive ? 'text-white' : 'text-white/40 hover:text-white/80'}`}
              >
                <item.icon size={20} strokeWidth={isActive ? 2 : 1.5} />

                {/* Right-sliding Tooltip */}
                <div className="absolute left-full ml-4 opacity-0 pointer-events-none group-hover:opacity-100 group-hover:translate-x-2 transition-all duration-300 ease-out flex items-center">
                  <div className="border-y-[6px] border-y-transparent border-r-[6px] border-r-[#2c2c2e]" />
                  <div className="bg-[#2c2c2e] text-xs font-medium px-3 py-1.5 rounded-lg whitespace-nowrap border border-white/5 shadow-xl">
                    {item.label}
                  </div>
                </div>
              </a>
            );
          })}
        </div>
      </nav>

      {/* Mobile Horizontal Bottom Dock */}
      <nav className="md:hidden fixed bottom-6 left-1/2 -translate-x-1/2 z-50 w-[90%] max-w-[400px]">
        <div className="bg-[#1c1c1e] text-white rounded-full px-5 py-3 flex items-center justify-between shadow-[0_10px_40px_rgba(0,0,0,0.3)] border border-white/10 backdrop-blur-md">
          {navItems.map((item) => {
            const isActive = activeSection === item.id;
            return (
              <a
                key={item.id}
                href={`#${item.id}`}
                className={`relative flex flex-col items-center justify-center transition-all duration-300 ${isActive ? 'text-white scale-110' : 'text-white/40'}`}
              >
                <item.icon size={20} strokeWidth={isActive ? 2 : 1.5} />
                {isActive && <span className="absolute -bottom-2 w-1 h-1 bg-white rounded-full" />}
              </a>
            );
          })}
        </div>
      </nav>
    </>
  );
}
