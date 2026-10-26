'use client';

import { useRef } from 'react';
import Link from 'next/link';
import { motion, useScroll, useSpring, useReducedMotion } from 'framer-motion';
import { ArrowLeft, ArrowRight, ExternalLink } from 'lucide-react';
import { PROJECT_DATA } from '@/lib/data';
import { getProjectDetail } from '@/lib/project-details';
import ArchitectureDiagram from './ArchitectureDiagram';

/**
 * Measure: one 720px column, centred at every breakpoint. Marginalia sit
 * inline beneath the section they belong to rather than in a side gutter, so
 * no width is reserved for content that may not exist. The diagram is the
 * only thing that breaks the measure, and it breaks symmetrically.
 */
const COLUMN = 'relative mx-auto w-full max-w-[720px]';

/** Same mark as the home-page footer: lucide v1 no longer ships brand icons. */
function GithubMark({ size = 15 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4" />
      <path d="M9 18c-4.51 2-5-2-7-2" />
    </svg>
  );
}

interface Props {
  slug: string;
}

/** Shared reveal, fully disabled under prefers-reduced-motion. */
function useReveal() {
  const reduce = useReducedMotion();
  return (delay = 0) => ({
    initial: { opacity: 0, y: reduce ? 0 : 16 },
    whileInView: { opacity: 1, y: 0 },
    viewport: { once: true, margin: '-70px' },
    transition: { duration: reduce ? 0 : 0.55, delay: reduce ? 0 : delay },
  });
}

export default function ProjectDetail({ slug }: Props) {
  const index = PROJECT_DATA.findIndex((p) => p.slug === slug);
  const project = PROJECT_DATA[index];
  const detail = getProjectDetail(slug);

  // Wrap at both ends so the pager never dead-ends.
  const prev = PROJECT_DATA[(index - 1 + PROJECT_DATA.length) % PROJECT_DATA.length];
  const next = PROJECT_DATA[(index + 1) % PROJECT_DATA.length];

  const reveal = useReveal();
  const reduce = useReducedMotion();
  const plateRef = useRef<HTMLDivElement>(null);

  // Reading progress, drawn as an ink line across the top of the page.
  const { scrollYProgress } = useScroll();
  const progress = useSpring(scrollYProgress, { stiffness: 120, damping: 28, mass: 0.2 });

  // Plate tilt, mirroring the Polaroid idiom on the home page.
  const tiltX = useSpring(0, { stiffness: 150, damping: 20 });
  const tiltY = useSpring(0, { stiffness: 150, damping: 20 });

  const handlePlateMove = (e: React.MouseEvent) => {
    if (!plateRef.current || reduce) return;
    const r = plateRef.current.getBoundingClientRect();
    tiltX.set(((e.clientY - r.top) / r.height - 0.5) * -8);
    tiltY.set(((e.clientX - r.left) / r.width - 0.5) * 8);
  };

  const resetPlate = () => {
    tiltX.set(0);
    tiltY.set(0);
  };

  // The route already 404s an unknown slug; this keeps the component total.
  if (!project || !detail) return null;

  return (
    <article className="relative w-full pb-32">
      <motion.div
        aria-hidden
        style={{ scaleX: progress, transformOrigin: '0%', backgroundColor: project.color }}
        className="fixed inset-x-0 top-0 z-50 h-[2px]"
      />

      <div className="mx-auto w-full max-w-[1000px] px-6 sm:px-8 lg:px-10">
        <div className={`${COLUMN} pt-12 md:pt-16`}>
          <Link
            href="/#projects"
            className="group inline-flex items-center gap-2 font-handwriting text-2xl text-[#d34b32] transition-colors hover:text-[#1a1a1a]"
          >
            <ArrowLeft
              size={17}
              className="transition-transform duration-300 group-hover:-translate-x-1"
            />
            back to the shelf
          </Link>
        </div>

        <motion.header {...reveal()} className={`${COLUMN} mt-9`}>
          <div className="flex items-center gap-4">
            <span className="font-mono text-[11px] tracking-[0.25em] text-[#8a7f76]">
              CASE FILE {detail.caseNo}
            </span>
            <span className="h-px flex-1 bg-[#1a1a1a]/12" />
            <span
              className="rounded-full px-2.5 py-0.5 font-mono text-[10px] font-semibold uppercase tracking-[0.14em]"
              style={{ color: project.color, border: `1px solid ${project.color}55` }}
            >
              {project.category}
            </span>
          </div>

          <h1 className="mt-7 font-serif text-[clamp(2.5rem,6.2vw,4.1rem)] font-bold leading-[1.04] tracking-tight text-[#1a1a1a]">
            {project.title}
          </h1>

          <svg
            aria-hidden
            viewBox="0 0 320 12"
            className="mt-2.5 h-[11px] w-[clamp(130px,30vw,260px)]"
            preserveAspectRatio="none"
          >
            <path
              d="M2 8 C 60 2, 120 10, 180 5 S 280 2, 318 7"
              fill="none"
              stroke={project.color}
              strokeOpacity={0.55}
              strokeWidth={3}
              strokeLinecap="round"
            />
          </svg>

          <p className="mt-5 inline-block -rotate-1 font-handwriting text-[1.75rem] leading-snug text-[#5f564e]">
            {detail.tagline}
          </p>

          {/* Two columns before md, so a long role line never squeezes. */}
          <dl className="mt-9 grid grid-cols-2 gap-x-6 gap-y-5 border-y border-[#1a1a1a]/10 py-5 md:grid-cols-3">
            {[
              { k: 'Role', v: detail.role },
              { k: 'Timeline', v: detail.timeline },
              { k: 'Status', v: detail.status },
            ].map(({ k, v }) => (
              <div key={k} className="min-w-0">
                <dt className="font-mono text-[9.5px] tracking-[0.18em] text-[#8a7f76]">
                  {k.toUpperCase()}
                </dt>
                <dd className="mt-1.5 text-[13px] leading-[1.5] text-[#3f3833]">{v}</dd>
              </div>
            ))}
          </dl>

          <div className="mt-7 flex flex-wrap items-center gap-3">
            {project.liveUrl && (
              <a
                href={project.liveUrl}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-2.5 rounded-full px-5 py-2.5 text-[13.5px] font-medium text-white shadow-sm transition-transform duration-300 hover:-translate-y-0.5"
                style={{ backgroundColor: project.color }}
              >
                <span className="relative flex h-1.5 w-1.5">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-white/80" />
                  <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-white" />
                </span>
                See it live
                <ExternalLink size={14} className="opacity-70" />
              </a>
            )}

            {project.githubUrl && (
              <a
                href={project.githubUrl}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-2.5 rounded-full border border-[#1a1a1a]/20 px-5 py-2.5 text-[13.5px] font-medium text-[#1a1a1a] transition-colors hover:border-[#1a1a1a] hover:bg-[#1a1a1a] hover:text-[#f4ece4]"
              >
                <GithubMark />
                Read the source
              </a>
            )}

            {!project.githubUrl && !project.liveUrl && (
              <span className="font-mono text-[11.5px] text-[#8a7f76]">
                no public link, see the note further down
              </span>
            )}
          </div>
        </motion.header>

        <motion.p
          {...reveal(0.05)}
          className={`${COLUMN} mt-12 font-serif text-[1.22rem] leading-[1.7] text-[#2a2522] md:text-[1.32rem] md:leading-[1.66]`}
        >
          {detail.lede}
        </motion.p>

        <motion.div
          {...reveal(0.05)}
          className={`${COLUMN} mt-12`}
          style={{ perspective: '1200px' }}
          onMouseMove={handlePlateMove}
          onMouseLeave={resetPlate}
        >
          <motion.div
            ref={plateRef}
            style={{ rotateX: tiltX, rotateY: tiltY, transformStyle: 'preserve-3d' }}
            initial={{ rotateZ: -1.2 }}
            className="relative mx-auto w-full max-w-[540px] rounded-sm border border-gray-100 bg-white p-3 pb-10 shadow-[0_20px_50px_rgba(0,0,0,0.15)] will-change-transform"
          >
            <span
              aria-hidden
              className="absolute -top-3 left-1/2 h-6 w-24 -translate-x-1/2 -rotate-2 bg-[#e8dccb]/80 shadow-sm"
            />
            <motion.img
              src={project.image}
              alt={`${project.title} interface`}
              className="aspect-[16/10] w-full rounded-sm object-cover"
            />
            <figcaption className="absolute bottom-2.5 left-0 right-0 text-center font-handwriting text-lg text-[#5f564e]">
              {project.title.toLowerCase()}
            </figcaption>
          </motion.div>
        </motion.div>

        {/* Flex, so three metrics distribute as evenly as four. */}
        <motion.dl
          {...reveal()}
          className={`${COLUMN} mt-14 flex flex-col gap-y-7 border-y border-[#1a1a1a]/10 py-8 sm:flex-row sm:flex-wrap sm:gap-x-8`}
        >
          {detail.metrics.map((m) => (
            <div key={m.label} className="sm:min-w-[132px] sm:flex-1">
              <dt className="sr-only">{m.label}</dt>
              <dd>
                <span
                  className={`block font-serif font-bold leading-none ${
                    m.value.length <= 5 ? 'text-[2.1rem]' : 'text-[1.4rem]'
                  }`}
                  style={{ color: project.color }}
                >
                  {m.value}
                </span>
                <span className="mt-2.5 block text-[11.5px] leading-[1.45] text-[#5f564e]">
                  {m.label}
                </span>
              </dd>
            </div>
          ))}
        </motion.dl>

        <Section n="01" title="Why it exists" note={detail.marginNotes[0]} reveal={reveal}>
          <p className="text-[1.01rem] leading-[1.78] text-[#3f3833]">{detail.problem}</p>
        </Section>

        {/* The diagram breaks into the reserved right margin only. */}
        <Section n="02" title="How it works" reveal={reveal}>
          <div className="lg:-mx-14">
            <ArchitectureDiagram arch={detail.architecture} accent={project.color} />
          </div>
        </Section>

        <Section
          n="03"
          title="Decisions that mattered"
          kicker="What the alternative would have cost."
          note={detail.marginNotes[1]}
          reveal={reveal}
        >
          <ol className="flex flex-col gap-9">
            {detail.decisions.map((d, i) => (
              <motion.li key={d.title} {...reveal(0.03 * i)} className="relative min-w-0">
                <span
                  aria-hidden
                  className="mb-1 block font-handwriting text-[1.5rem] leading-none lg:absolute lg:left-[-2.7rem] lg:top-[0.1rem] lg:mb-0"
                  style={{ color: project.color }}
                >
                  {String(i + 1).padStart(2, '0')}
                </span>
                <h3 className="font-serif text-[1.3rem] font-bold leading-[1.3] text-[#1a1a1a] md:text-[1.38rem]">
                  {d.title}
                </h3>
                <p className="mt-2.5 text-[0.99rem] leading-[1.76] text-[#4a423c]">{d.body}</p>
              </motion.li>
            ))}
          </ol>
        </Section>

        <Section n="04" title="What's in it" reveal={reveal} tight>
          <ul className="grid grid-cols-1 gap-x-8 gap-y-2.5 sm:grid-cols-2">
            {detail.features.map((f) => (
              <li key={f} className="flex gap-2.5 text-[13.5px] leading-[1.6] text-[#413a34]">
                <span
                  aria-hidden
                  className="mt-[7px] h-1.5 w-1.5 shrink-0 rounded-full"
                  style={{ backgroundColor: project.color }}
                />
                {f}
              </li>
            ))}
          </ul>
        </Section>

        <Section n="05" title="What it's built with" reveal={reveal} tight>
          <div className="flex flex-col divide-y divide-[#1a1a1a]/8">
            {detail.stack.map((g) => (
              <div
                key={g.group}
                className="flex flex-col gap-2 py-3.5 sm:flex-row sm:items-baseline sm:gap-4"
              >
                <div className="shrink-0 font-mono text-[9.5px] tracking-[0.18em] text-[#8a7f76] sm:w-24 sm:pt-1">
                  {g.group.toUpperCase()}
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {g.items.map((it) => (
                    <span
                      key={it}
                      className="rounded-md border border-[#1a1a1a]/12 bg-[#fffaf4] px-2.5 py-1 font-mono text-[11.5px] text-[#3f3833]"
                    >
                      {it}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </Section>

        {detail.candid && (
          <motion.aside
            {...reveal()}
            className={`${COLUMN} mt-16 overflow-hidden rounded-xl border border-white/5 bg-[#161412] p-6 md:p-8`}
          >
            <div className="flex items-center gap-3">
              <span className="h-1.5 w-1.5 rounded-full bg-[#ffbd2e]" />
              <span className="font-mono text-[9.5px] tracking-[0.22em] text-white/45">
                WHAT I&apos;D DO DIFFERENTLY
              </span>
            </div>
            <p className="mt-3.5 text-[0.98rem] leading-[1.78] text-white/80">{detail.candid}</p>
          </motion.aside>
        )}

        {detail.repoNote && (
          <motion.p
            {...reveal()}
            className={`${COLUMN} mt-9 border-l-2 pl-5 text-[13.5px] leading-[1.7] text-[#5f564e]`}
            style={{ borderColor: `${project.color}55` }}
          >
            {detail.repoNote}
          </motion.p>
        )}

        <motion.nav {...reveal()} className={`${COLUMN} mt-20 border-t border-[#1a1a1a]/12 pt-8`}>
          <div className="flex flex-col justify-between gap-6 sm:flex-row sm:items-end">
            <Link href={`/projects/${prev.slug}`} className="group flex min-w-0 flex-col gap-1">
              <span className="font-mono text-[9.5px] tracking-[0.2em] text-[#8a7f76]">
                PREVIOUS
              </span>
              <span className="flex items-center gap-2 font-serif text-[1.15rem] font-bold leading-snug text-[#1a1a1a] transition-colors group-hover:text-[#d34b32]">
                <ArrowLeft
                  size={15}
                  className="shrink-0 transition-transform duration-300 group-hover:-translate-x-1"
                />
                {prev.title}
              </span>
            </Link>

            <Link
              href={`/projects/${next.slug}`}
              className="group flex min-w-0 flex-col gap-1 sm:items-end"
            >
              <span className="font-mono text-[9.5px] tracking-[0.2em] text-[#8a7f76]">NEXT</span>
              <span className="flex items-center gap-2 font-serif text-[1.15rem] font-bold leading-snug text-[#1a1a1a] transition-colors group-hover:text-[#d34b32]">
                {next.title}
                <ArrowRight
                  size={15}
                  className="shrink-0 transition-transform duration-300 group-hover:translate-x-1"
                />
              </span>
            </Link>
          </div>
        </motion.nav>
      </div>
    </article>
  );
}

/* ───────────────────────────────────────────────────────────────── section ── */

interface SectionProps {
  n: string;
  title: string;
  kicker?: string;
  note?: string;
  /** Lists need less breathing room above them than prose does. */
  tight?: boolean;
  reveal: (delay?: number) => object;
  children: React.ReactNode;
}

function Section({ n, title, kicker, note, tight, reveal, children }: SectionProps) {
  return (
    <motion.section {...reveal()} className={`${COLUMN} ${tight ? 'mt-14' : 'mt-20'}`}>
      <span className="mb-2 block font-mono text-[10.5px] tracking-[0.2em] text-[#8a7f76] lg:absolute lg:left-[-2.7rem] lg:top-[0.62rem] lg:mb-0">
        {n}
      </span>
      <h2 className="font-serif text-[1.7rem] font-bold leading-[1.15] tracking-tight text-[#1a1a1a] md:text-[1.95rem]">
        {title}
      </h2>

      {kicker && <p className="mt-2 text-[13px] italic text-[#7d736a]">{kicker}</p>}

      <div className="mt-5">{children}</div>

      {/* Marginalia, in flow. Indented and ruled so it reads as an aside. */}
      {note && (
        <p className="mt-7 border-l border-[#d34b32]/30 pl-4 font-handwriting text-[1.3rem] leading-[1.35] text-[#a39488] sm:ml-8">
          {note}
        </p>
      )}
    </motion.section>
  );
}
