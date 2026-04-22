'use client';

import { motion } from 'framer-motion';

type DotSpec = {
  cx: number;
  cy: number;
  r: number;
  /** Base chromatic hue — slightly desaturated for optical realism */
  color: string;
  delay: number;
  opacity: number;
  /** 0–1: balls toward the "back" get blur applied for depth-of-field */
  dof?: number;
};

function hexToRgb(hex: string) {
  const clean = hex.replace('#', '');
  const n = clean.length === 3
    ? clean.split('').map((c) => `${c}${c}`).join('')
    : clean;
  const v = Number.parseInt(n, 16);
  return { r: (v >> 16) & 255, g: (v >> 8) & 255, b: v & 255 };
}

/** Lighten toward white for top specular zone */
function tint(hex: string, t: number) {
  const { r, g, b } = hexToRgb(hex);
  const m = (ch: number) => Math.round(ch + (255 - ch) * t);
  return `rgb(${m(r)} ${m(g)} ${m(b)})`;
}

/** Darken toward black for shadow zone */
function shade(hex: string, t: number) {
  const { r, g, b } = hexToRgb(hex);
  const m = (ch: number) => Math.round(ch * (1 - t));
  return `rgb(${m(r)} ${m(g)} ${m(b)})`;
}

/** Slightly desaturate (mix toward grey) for optical-grade realism */
function desaturate(hex: string, t: number) {
  const { r, g, b } = hexToRgb(hex);
  const grey = 0.299 * r + 0.587 * g + 0.114 * b;
  const m = (ch: number) => Math.round(ch + (grey - ch) * t);
  return `#${[m(r), m(g), m(b)].map((x) => x.toString(16).padStart(2, '0')).join('')}`;
}

// Compact elegant arc — fewer balls, tighter spacing, cooler palette.
// dof: forward balls = 0, background balls = 1 (get depth blur).
const rawDots: DotSpec[] = [
  // --- back row (smaller, desaturated, dof blur) ---
  { cx: 46, cy: 52, r: 7,  color: '#7B6FE8', delay: 0.18, opacity: 0.52, dof: 0.9 },
  { cx: 68, cy: 38, r: 9,  color: '#4A7CE0', delay: 0.26, opacity: 0.56, dof: 0.85 },
  { cx: 93, cy: 30, r: 8,  color: '#3CA8D6', delay: 0.34, opacity: 0.54, dof: 0.85 },
  { cx: 118, cy: 30, r: 9, color: '#30BEB8', delay: 0.42, opacity: 0.56, dof: 0.8 },
  { cx: 142, cy: 38, r: 7, color: '#2DBBA0', delay: 0.5,  opacity: 0.52, dof: 0.85 },

  // --- mid row (medium, main spectral curve) ---
  { cx: 34, cy: 70, r: 10, color: '#6A62E5', delay: 0.08, opacity: 0.62, dof: 0.4 },
  { cx: 58, cy: 57, r: 12, color: '#4276E2', delay: 0.16, opacity: 0.66, dof: 0.35 },
  { cx: 84, cy: 49, r: 13, color: '#35A8D4', delay: 0.24, opacity: 0.68, dof: 0.3 },
  { cx: 111, cy: 48, r: 12, color: '#2BB9AA', delay: 0.32, opacity: 0.66, dof: 0.3 },
  { cx: 136, cy: 54, r: 10, color: '#58B87A', delay: 0.4,  opacity: 0.62, dof: 0.35 },

  // --- front row (larger, saturated, sharp focus) ---
  { cx: 52, cy: 84, r: 11, color: '#B89830', delay: 0.0,  opacity: 0.72, dof: 0 },
  { cx: 80, cy: 78, r: 13, color: '#C47A32', delay: 0.1,  opacity: 0.74, dof: 0 },
  { cx: 108, cy: 76, r: 12, color: '#C45240', delay: 0.2,  opacity: 0.72, dof: 0 },
  { cx: 134, cy: 78, r: 10, color: '#B44E8A', delay: 0.3,  opacity: 0.7,  dof: 0 },
];

// Apply per-ball desaturation based on dof (background = more grey)
const dots: DotSpec[] = rawDots.map((d) => ({
  ...d,
  color: desaturate(d.color, (d.dof ?? 0) * 0.28),
}));

export function ParticleDots({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 184 104"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden="true"
    >
      <defs>
        {/* Subtle ambient field behind the cluster */}
        <radialGradient id="ambientField" cx="50%" cy="48%" r="52%">
          <stop offset="0" stopColor="#C8EEFF" stopOpacity="0.14" />
          <stop offset="1" stopColor="#071422" stopOpacity="0" />
        </radialGradient>

        {/* Optical sweep — single slow pass, like a studio light moving */}
        <linearGradient id="opticalSweep" x1="0" y1="0" x2="184" y2="104" gradientUnits="userSpaceOnUse">
          <stop offset="0"   stopColor="#DFFFFF" stopOpacity="0" />
          <stop offset="0.5" stopColor="#F8FFFF" stopOpacity="0.55" />
          <stop offset="1"   stopColor="#DFFFFF" stopOpacity="0" />
        </linearGradient>

        {/* Metallic connector arc */}
        <linearGradient id="metalArc" x1="20" y1="80" x2="160" y2="30" gradientUnits="userSpaceOnUse">
          <stop offset="0"    stopColor="#9AAFC6" stopOpacity="0.1" />
          <stop offset="0.5"  stopColor="#D8E8F6" stopOpacity="0.3" />
          <stop offset="1"    stopColor="#9AAFC6" stopOpacity="0.1" />
        </linearGradient>

        {/* Depth-of-field blur for background balls */}
        <filter id="dofBlur" x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur stdDeviation="1.1" />
        </filter>

        {/* Soft halo around each ball */}
        <filter id="halo" x="-28%" y="-28%" width="156%" height="156%">
          <feGaussianBlur stdDeviation="1.4" />
        </filter>

        {/* Per-ball gradients generated from color data */}
        {dots.map((dot, i) => (
          <g key={`g-${i}`}>
            {/* Main sphere fill: bright spot at top-left → mid colour → deep shadow bottom-right */}
            <radialGradient id={`sf-${i}`} cx="32%" cy="28%" r="74%">
              <stop offset="0"    stopColor={tint(dot.color, 0.78)}  stopOpacity="1"    />
              <stop offset="0.38" stopColor={tint(dot.color, 0.18)}  stopOpacity="0.96" />
              <stop offset="0.72" stopColor={dot.color}              stopOpacity="0.92" />
              <stop offset="1"    stopColor={shade(dot.color, 0.52)} stopOpacity="0.97" />
            </radialGradient>

            {/* Anisotropic highlight streak — thin ellipse simulating lens flare */}
            <linearGradient id={`streak-${i}`} x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0"   stopColor="#FFFFFF" stopOpacity="0"    />
              <stop offset="0.5" stopColor="#FFFFFF" stopOpacity="0.54" />
              <stop offset="1"   stopColor="#FFFFFF" stopOpacity="0"    />
            </linearGradient>

            {/* Rim light on opposite edge (cool blue-white) */}
            <radialGradient id={`rim-${i}`} cx="78%" cy="76%" r="38%">
              <stop offset="0" stopColor="#C8E8FF" stopOpacity="0.44" />
              <stop offset="1" stopColor="#C8E8FF" stopOpacity="0"    />
            </radialGradient>
          </g>
        ))}
      </defs>

      {/* Ambient background glow */}
      <ellipse cx="92" cy="54" rx="90" ry="50" fill="url(#ambientField)" />

      {/* Metallic connector arc */}
      <path d="M22 84 C 55 36, 120 18, 158 46" stroke="url(#metalArc)" strokeWidth="1.1" strokeLinecap="round" fill="none" />

      {/* Optical sweep animation */}
      <motion.rect
        x="-184" y="0" width="184" height="104"
        fill="url(#opticalSweep)"
        fillOpacity="0.6"
        initial={{ x: -184 }}
        animate={{ x: 184 }}
        transition={{ repeat: Infinity, duration: 9, ease: 'easeInOut', repeatDelay: 4 }}
      />

      {/* Crystal spheres — sorted back to front (dof desc) so near balls paint over far */}
      {[...dots]
        .sort((a, b) => (b.dof ?? 0) - (a.dof ?? 0))
        .map((dot, sortedI) => {
          const origI = dots.indexOf(dot);
          const isDof = (dot.dof ?? 0) > 0.5;
          return (
            <motion.g
              key={origI}
              initial={{ opacity: 0, scale: 0.82 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.9, delay: dot.delay * 0.55, ease: [0.34, 1.1, 0.64, 1] }}
              style={{ transformOrigin: `${dot.cx}px ${dot.cy}px` }}
            >
              {/* Soft halo */}
              <ellipse
                cx={dot.cx} cy={dot.cy + dot.r * 0.08}
                rx={dot.r * 1.08} ry={dot.r * 0.92}
                fill={dot.color} fillOpacity={0.22}
                filter="url(#halo)"
              />

              {/* Main sphere body */}
              <motion.circle
                cx={dot.cx} cy={dot.cy} r={dot.r}
                fill={`url(#sf-${origI})`}
                filter={isDof ? 'url(#dofBlur)' : undefined}
                animate={{
                  opacity: [dot.opacity * 0.92, dot.opacity, dot.opacity * 0.92],
                  scale:   [1, 1.006, 1],
                }}
                transition={{
                  opacity: { repeat: Infinity, duration: 6.4 + sortedI * 0.09, ease: 'easeInOut', delay: dot.delay },
                  scale:   { repeat: Infinity, duration: 7.0 + sortedI * 0.09, ease: 'easeInOut', delay: dot.delay * 0.8 },
                }}
                style={{ transformOrigin: `${dot.cx}px ${dot.cy}px` }}
              />

              {/* Rim light — cool backlight from lower-right */}
              <circle cx={dot.cx} cy={dot.cy} r={dot.r} fill={`url(#rim-${origI})`}
                filter={isDof ? 'url(#dofBlur)' : undefined} />

              {/* Primary specular cap — large soft ellipse upper-left */}
              <ellipse
                cx={dot.cx - dot.r * 0.24} cy={dot.cy - dot.r * 0.3}
                rx={dot.r * 0.3} ry={dot.r * 0.22}
                fill="#FFFFFF" fillOpacity={isDof ? 0.28 : 0.4}
                filter={isDof ? 'url(#dofBlur)' : undefined}
              />

              {/* Anisotropic highlight streak — thin horizontal band */}
              <ellipse
                cx={dot.cx - dot.r * 0.04} cy={dot.cy - dot.r * 0.46}
                rx={dot.r * 0.46} ry={dot.r * 0.07}
                fill={`url(#streak-${origI})`}
                fillOpacity={isDof ? 0.38 : 0.52}
                filter={isDof ? 'url(#dofBlur)' : undefined}
              />

              {/* Micro specular pinpoint */}
              <circle
                cx={dot.cx - dot.r * 0.08} cy={dot.cy - dot.r * 0.1}
                r={dot.r * 0.072}
                fill="#FFFFFF" fillOpacity={isDof ? 0.55 : 0.78}
              />

              {/* Shadow crescent — bottom-right */}
              <ellipse
                cx={dot.cx + dot.r * 0.32} cy={dot.cy + dot.r * 0.36}
                rx={dot.r * 0.24} ry={dot.r * 0.18}
                fill="#071220" fillOpacity={isDof ? 0.12 : 0.18}
                filter={isDof ? 'url(#dofBlur)' : undefined}
              />
            </motion.g>
          );
        })}
    </svg>
  );
}


