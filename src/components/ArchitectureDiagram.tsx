'use client';

import { motion, useReducedMotion } from 'framer-motion';
import type { Architecture, DiagramBranch } from '@/lib/project-details';

/**
 * Inline-SVG architecture diagrams drawn in the site's paper palette.
 *
 * Three layouts, because the projects genuinely have three shapes: a layered
 * stack (request falls through tiers), a pipeline (linear steps), and a branch
 * (one classification selects one of several outcomes).
 *
 * Layout is computed rather than hand-placed so a label can change length
 * without anything overlapping. Below `md` the SVG is replaced by a plain
 * stacked list — a 900-unit viewBox squeezed into a phone makes the type
 * illegible, and a diagram nobody can read is worse than a list.
 */

const INK = '#1a1a1a';
const MUTED = '#8a7f76';
const PAPER = '#f4ece4';

const MONO = "'JetBrains Mono', ui-monospace, monospace";

const TONE: Record<NonNullable<DiagramBranch['tone']>, string> = {
  alarm: '#d34b32',
  warn: '#c98a3c',
  calm: '#7d8a6a',
};

/** Deterministic sub-degree tilt, so chips sit like they were placed by hand. */
function tilt(i: number): number {
  return (((i * 37) % 7) - 3) * 0.13;
}

function chipWidth(label: string, note?: string): number {
  const fromLabel = label.length * 7.3 + 28;
  const fromNote = note ? note.length * 5.5 + 24 : 0;
  return Math.max(94, fromLabel, fromNote);
}

interface Props {
  arch: Architecture;
  accent: string;
}

export default function ArchitectureDiagram({ arch, accent }: Props) {
  const reduce = useReducedMotion();

  const draw = {
    initial: { opacity: 0 },
    whileInView: { opacity: 1 },
    viewport: { once: true, margin: '-60px' },
    transition: { duration: reduce ? 0 : 0.7 },
  };

  return (
    <figure className="my-14 md:my-20">
      {/* Full diagram — pointer-size screens only. */}
      <motion.div
        {...draw}
        className="hidden md:block rounded-2xl border border-[#1a1a1a]/10 bg-[#efe6dc]/60 p-7 shadow-[0_1px_0_rgba(255,255,255,0.6)_inset]"
      >
        {arch.kind === 'stack' && <StackDiagram arch={arch} accent={accent} />}
        {arch.kind === 'pipeline' && <PipelineDiagram arch={arch} accent={accent} />}
        {arch.kind === 'branch' && <BranchDiagram arch={arch} accent={accent} />}
      </motion.div>

      {/* Small screens: the same information, linearised. */}
      <div className="md:hidden rounded-2xl border border-[#1a1a1a]/10 bg-[#efe6dc]/60 p-5">
        <SmallScreenFallback arch={arch} accent={accent} />
      </div>

      <div className="mx-auto mt-5 max-w-[720px]">
        <figcaption className="flex gap-3 text-[13px] leading-relaxed text-[#5f564e]">
          <span aria-hidden className="mt-[7px] h-px w-6 shrink-0 bg-[#d34b32]/60" />
          <span>{arch.caption}</span>
        </figcaption>

        {arch.footnote && (
          <p className="mt-3 pl-9 text-[12.5px] leading-relaxed text-[#7d736a]">{arch.footnote}</p>
        )}
      </div>
    </figure>
  );
}

/* ───────────────────────────────────────────────────────────────── stack ── */

function StackDiagram({ arch, accent }: { arch: Architecture; accent: string }) {
  const layers = arch.layers ?? [];

  const W = 900;
  const TITLE_W = 104;
  const CHIPS_X = TITLE_W + 26;
  const CHIPS_W = W - CHIPS_X - 14;
  const CHIP_H = 42;
  const CHIP_GAP = 10;
  const ROW_GAP = 9;
  const PAD_Y = 17;
  const FLOW_H = 50;

  // Wrap each layer's chips, then stack the layers with a flow arrow between.
  let y = 0;
  const placed = layers.map((layer, li) => {
    const rows: { label: string; note?: string; x: number; w: number }[][] = [[]];
    let cursor = 0;
    layer.nodes.forEach((n) => {
      const w = chipWidth(n.label, n.note);
      if (cursor > 0 && cursor + w > CHIPS_W) {
        rows.push([]);
        cursor = 0;
      }
      rows[rows.length - 1].push({ ...n, x: CHIPS_X + cursor, w });
      cursor += w + CHIP_GAP;
    });

    const h = PAD_Y * 2 + rows.length * CHIP_H + (rows.length - 1) * ROW_GAP;
    const box = { layer, rows, y, h, isLast: li === layers.length - 1 };
    y += h + (li === layers.length - 1 ? 0 : FLOW_H);
    return box;
  });

  const H = y;

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full" role="img" aria-label={arch.caption}>
      <Defs accent={accent} />

      {placed.map(({ layer, rows, y: ly, h, isLast }, li) => (
        <g key={layer.title}>
          {/* Band */}
          <rect
            x={0}
            y={ly}
            width={W}
            height={h}
            rx={13}
            fill={PAPER}
            stroke={INK}
            strokeOpacity={0.14}
          />
          {/* Left title strip */}
          <rect x={0} y={ly} width={TITLE_W} height={h} rx={13} fill={INK} fillOpacity={0.045} />
          <line
            x1={TITLE_W}
            y1={ly + 8}
            x2={TITLE_W}
            y2={ly + h - 8}
            stroke={INK}
            strokeOpacity={0.12}
          />
          <text
            x={TITLE_W / 2}
            y={ly + h / 2}
            textAnchor="middle"
            dominantBaseline="central"
            fontFamily={MONO}
            fontSize={10.5}
            letterSpacing={1.6}
            fill={MUTED}
          >
            {layer.title.toUpperCase()}
          </text>

          {/* Chips */}
          {rows.map((row, ri) =>
            row.map((n, ni) => {
              const cy = ly + PAD_Y + ri * (CHIP_H + ROW_GAP);
              const i = ri * 7 + ni;
              return (
                <g
                  key={`${n.label}-${ni}`}
                  transform={`rotate(${tilt(i + li)} ${n.x + n.w / 2} ${cy + CHIP_H / 2})`}
                >
                  <rect
                    x={n.x}
                    y={cy}
                    width={n.w}
                    height={CHIP_H}
                    rx={7}
                    fill="#fffaf4"
                    stroke={INK}
                    strokeOpacity={0.2}
                  />
                  <text
                    x={n.x + n.w / 2}
                    y={n.note ? cy + 16 : cy + CHIP_H / 2}
                    textAnchor="middle"
                    dominantBaseline="central"
                    fontFamily={MONO}
                    fontSize={11.5}
                    fill={INK}
                  >
                    {n.label}
                  </text>
                  {n.note && (
                    <text
                      x={n.x + n.w / 2}
                      y={cy + 30}
                      textAnchor="middle"
                      dominantBaseline="central"
                      fontFamily={MONO}
                      fontSize={8.6}
                      fill={MUTED}
                    >
                      {n.note}
                    </text>
                  )}
                </g>
              );
            }),
          )}

          {/* Flow arrow down to the next band */}
          {!isLast && (
            <g>
              <line
                x1={W / 2}
                y1={ly + h + 9}
                x2={W / 2}
                y2={ly + h + FLOW_H - 13}
                stroke={accent}
                strokeOpacity={0.5}
                strokeWidth={1.4}
                markerEnd="url(#arrow-accent)"
              />
              {layer.flow && (
                <text
                  x={W / 2 + 16}
                  y={ly + h + FLOW_H / 2 - 1}
                  dominantBaseline="central"
                  fontFamily={MONO}
                  fontSize={9.8}
                  fill={MUTED}
                >
                  {layer.flow}
                </text>
              )}
            </g>
          )}
        </g>
      ))}
    </svg>
  );
}

/* ──────────────────────────────────────────────────────────────── pipeline ── */

function PipelineDiagram({ arch, accent }: { arch: Architecture; accent: string }) {
  const steps = arch.steps ?? [];

  const W = 900;
  const COLS = 3;
  const BOX_W = 252;
  const BOX_H = 94;
  const GAP_X = (W - COLS * BOX_W) / (COLS - 1);
  const GAP_Y = 78;

  const rowCount = Math.ceil(steps.length / COLS);
  const H = rowCount * BOX_H + (rowCount - 1) * GAP_Y;

  const pos = (i: number) => {
    const r = Math.floor(i / COLS);
    const c = i % COLS;
    return { x: c * (BOX_W + GAP_X), y: r * (BOX_H + GAP_Y), r, c };
  };

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full" role="img" aria-label={arch.caption}>
      <Defs accent={accent} />

      {steps.map((s, i) => {
        const { x, y } = pos(i);
        const next = i + 1 < steps.length ? pos(i + 1) : null;
        const wraps = next !== null && next.c === 0;

        return (
          <g key={s.label}>
            <g transform={`rotate(${tilt(i)} ${x + BOX_W / 2} ${y + BOX_H / 2})`}>
              <rect
                x={x}
                y={y}
                width={BOX_W}
                height={BOX_H}
                rx={11}
                fill="#fffaf4"
                stroke={INK}
                strokeOpacity={0.18}
              />
              {/* Step index, set like a notebook numeral */}
              <text x={x + 15} y={y + 21} fontFamily={MONO} fontSize={9.5} fill={accent}>
                {String(i + 1).padStart(2, '0')}
              </text>
              <text
                x={x + BOX_W / 2}
                y={y + 46}
                textAnchor="middle"
                dominantBaseline="central"
                fontFamily="'Playfair Display', serif"
                fontSize={19}
                fill={INK}
              >
                {s.label}
              </text>
              {s.note && (
                <text
                  x={x + BOX_W / 2}
                  y={y + 70}
                  textAnchor="middle"
                  dominantBaseline="central"
                  fontFamily={MONO}
                  fontSize={9.4}
                  fill={MUTED}
                >
                  {s.note}
                </text>
              )}
            </g>

            {/* Same-row connector */}
            {next && !wraps && (
              <line
                x1={x + BOX_W + 7}
                y1={y + BOX_H / 2}
                x2={x + BOX_W + GAP_X - 11}
                y2={y + BOX_H / 2}
                stroke={accent}
                strokeOpacity={0.5}
                strokeWidth={1.4}
                markerEnd="url(#arrow-accent)"
              />
            )}

            {/* Wrap connector: down out of the last box, back to the row below */}
            {next && wraps && (
              <path
                d={`M ${x + BOX_W / 2} ${y + BOX_H + 7}
                    L ${x + BOX_W / 2} ${y + BOX_H + GAP_Y / 2}
                    Q ${x + BOX_W / 2} ${y + BOX_H + GAP_Y / 2 + 13} ${x + BOX_W / 2 - 24} ${y + BOX_H + GAP_Y / 2 + 13}
                    L ${BOX_W / 2 + 24} ${y + BOX_H + GAP_Y / 2 + 13}
                    Q ${BOX_W / 2} ${y + BOX_H + GAP_Y / 2 + 13} ${BOX_W / 2} ${y + BOX_H + GAP_Y / 2 + 26}
                    L ${BOX_W / 2} ${y + BOX_H + GAP_Y - 11}`}
                fill="none"
                stroke={accent}
                strokeOpacity={0.4}
                strokeWidth={1.4}
                strokeDasharray="4 4"
                markerEnd="url(#arrow-accent)"
              />
            )}

          </g>
        );
      })}
    </svg>
  );
}

/* ────────────────────────────────────────────────────────────────── branch ── */

function BranchDiagram({ arch, accent }: { arch: Architecture; accent: string }) {
  const branches = arch.branches ?? [];

  const W = 900;
  const ROOT_W = 326;
  const ROOT_H = 88;
  const EDGE_H = 124;
  const BR_H = 118;
  const GAP = 18;
  const BR_W = (W - (branches.length - 1) * GAP) / branches.length;
  const H = ROOT_H + EDGE_H + BR_H;

  const rootCx = W / 2;
  const rootX = rootCx - ROOT_W / 2;

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full" role="img" aria-label={arch.caption}>
      <Defs accent={accent} />

      {/* Classifier */}
      <rect
        x={rootX}
        y={0}
        width={ROOT_W}
        height={ROOT_H}
        rx={12}
        fill={INK}
        stroke={INK}
        strokeOpacity={0.3}
      />
      <text
        x={rootCx}
        y={arch.rootNote ? 33 : ROOT_H / 2}
        textAnchor="middle"
        dominantBaseline="central"
        fontFamily="'Playfair Display', serif"
        fontSize={21}
        fill="#f4ece4"
      >
        {arch.root}
      </text>
      {arch.rootNote && (
        <text
          x={rootCx}
          y={60}
          textAnchor="middle"
          dominantBaseline="central"
          fontFamily={MONO}
          fontSize={9.6}
          fill="#f4ece4"
          fillOpacity={0.55}
        >
          {arch.rootNote}
        </text>
      )}

      {branches.map((b, i) => {
        const bx = i * (BR_W + GAP);
        const bcx = bx + BR_W / 2;
        const top = ROOT_H + EDGE_H;
        const colour = TONE[b.tone ?? 'calm'];

        // Elbow from the classifier down into this branch.
        const midY = ROOT_H + EDGE_H * 0.52;
        const path = `M ${rootCx} ${ROOT_H + 6}
                      L ${rootCx} ${midY - 13}
                      Q ${rootCx} ${midY} ${rootCx + Math.sign(bcx - rootCx) * 13} ${midY}
                      L ${bcx - Math.sign(bcx - rootCx) * 13} ${midY}
                      Q ${bcx} ${midY} ${bcx} ${midY + 13}
                      L ${bcx} ${top - 11}`;

        return (
          <g key={b.label}>
            <path
              d={Math.abs(bcx - rootCx) < 2 ? `M ${rootCx} ${ROOT_H + 6} L ${bcx} ${top - 11}` : path}
              fill="none"
              stroke={colour}
              strokeOpacity={0.6}
              strokeWidth={1.5}
              markerEnd={`url(#arrow-${b.tone ?? 'calm'})`}
            />

            {/* Condition pill on the edge */}
            <g>
              <rect
                x={bcx - 44}
                y={top - 46}
                width={88}
                height={21}
                rx={10.5}
                fill={PAPER}
                stroke={colour}
                strokeOpacity={0.45}
              />
              <text
                x={bcx}
                y={top - 35}
                textAnchor="middle"
                dominantBaseline="central"
                fontFamily={MONO}
                fontSize={9.4}
                fill={colour}
              >
                {b.condition}
              </text>
            </g>

            {/* Outcome */}
            <g transform={`rotate(${tilt(i)} ${bcx} ${top + BR_H / 2})`}>
              <rect
                x={bx}
                y={top}
                width={BR_W}
                height={BR_H}
                rx={11}
                fill="#fffaf4"
                stroke={colour}
                strokeOpacity={0.4}
              />
              <rect x={bx} y={top} width={BR_W} height={3.5} rx={1.75} fill={colour} fillOpacity={0.55} />
              <text
                x={bcx}
                y={top + 34}
                textAnchor="middle"
                dominantBaseline="central"
                fontFamily="'Playfair Display', serif"
                fontSize={17}
                fill={INK}
              >
                {b.label}
              </text>
              {b.note && <WrappedNote text={b.note} cx={bcx} y={top + 58} width={BR_W - 26} />}
            </g>
          </g>
        );
      })}
    </svg>
  );
}

/** Greedy word-wrap for the small notes inside a branch box. */
function WrappedNote({
  text,
  cx,
  y,
  width,
}: {
  text: string;
  cx: number;
  y: number;
  width: number;
}) {
  const perChar = 4.75;
  const maxChars = Math.max(12, Math.floor(width / perChar));

  const lines: string[] = [];
  let line = '';
  text.split(' ').forEach((word) => {
    const candidate = line ? `${line} ${word}` : word;
    if (candidate.length > maxChars) {
      if (line) lines.push(line);
      line = word;
    } else {
      line = candidate;
    }
  });
  if (line) lines.push(line);

  return (
    <>
      {lines.slice(0, 4).map((l, i) => (
        <text
          key={i}
          x={cx}
          y={y + i * 12}
          textAnchor="middle"
          dominantBaseline="central"
          fontFamily={MONO}
          fontSize={8.8}
          fill={MUTED}
        >
          {l}
        </text>
      ))}
    </>
  );
}

/* ───────────────────────────────────────────────────────────────── shared ── */

function Defs({ accent }: { accent: string }) {
  return (
    <defs>
      {(['accent', 'alarm', 'warn', 'calm'] as const).map((key) => (
        <marker
          key={key}
          id={`arrow-${key}`}
          viewBox="0 0 10 10"
          refX={8}
          refY={5}
          markerWidth={6}
          markerHeight={6}
          orient="auto-start-reverse"
        >
          <path
            d="M 0 1 L 9 5 L 0 9 z"
            fill={key === 'accent' ? accent : TONE[key]}
            fillOpacity={0.65}
          />
        </marker>
      ))}
    </defs>
  );
}

/** Phone layout: the same nodes and order, as text. */
function SmallScreenFallback({ arch, accent }: { arch: Architecture; accent: string }) {
  if (arch.kind === 'stack') {
    return (
      <ol className="flex flex-col gap-3">
        {(arch.layers ?? []).map((l) => (
          <li key={l.title} className="rounded-lg border border-[#1a1a1a]/12 bg-[#fffaf4] p-3">
            <div className="font-mono text-[10px] tracking-[0.15em] text-[#8a7f76]">
              {l.title.toUpperCase()}
            </div>
            <div className="mt-2 flex flex-wrap gap-1.5">
              {l.nodes.map((n) => (
                <span
                  key={n.label}
                  className="rounded border border-[#1a1a1a]/12 px-2 py-1 font-mono text-[11px]"
                >
                  {n.label}
                </span>
              ))}
            </div>
            {l.flow && (
              <div className="mt-2 font-mono text-[10px]" style={{ color: accent }}>
                ↓ {l.flow}
              </div>
            )}
          </li>
        ))}
      </ol>
    );
  }

  if (arch.kind === 'pipeline') {
    return (
      <ol className="flex flex-col gap-2.5">
        {(arch.steps ?? []).map((s, i) => (
          <li key={s.label} className="flex gap-3 rounded-lg bg-[#fffaf4] p-3 border border-[#1a1a1a]/12">
            <span className="font-mono text-[10px] pt-1" style={{ color: accent }}>
              {String(i + 1).padStart(2, '0')}
            </span>
            <span>
              <span className="font-serif text-[17px] leading-tight">{s.label}</span>
              {s.note && (
                <span className="block font-mono text-[10.5px] text-[#8a7f76]">{s.note}</span>
              )}
            </span>
          </li>
        ))}
      </ol>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="rounded-lg bg-[#1a1a1a] p-3 text-center">
        <div className="font-serif text-[18px] text-[#f4ece4]">{arch.root}</div>
        {arch.rootNote && (
          <div className="font-mono text-[10px] text-[#f4ece4]/55">{arch.rootNote}</div>
        )}
      </div>
      {(arch.branches ?? []).map((b) => {
        const colour = TONE[b.tone ?? 'calm'];
        return (
          <div
            key={b.label}
            className="rounded-lg border bg-[#fffaf4] p-3"
            style={{ borderColor: `${colour}55` }}
          >
            <span
              className="inline-block rounded-full border px-2 py-0.5 font-mono text-[9.5px]"
              style={{ color: colour, borderColor: `${colour}66` }}
            >
              {b.condition}
            </span>
            <div className="mt-1.5 font-serif text-[17px] leading-tight">{b.label}</div>
            {b.note && (
              <div className="mt-1 font-mono text-[10.5px] leading-relaxed text-[#8a7f76]">
                {b.note}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
