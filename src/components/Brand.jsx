import { useEffect, useRef, useState } from 'react';

export const APP_NAME = 'Ember';   // named after the mascot, the same way Tabby is named after its cat

// Brand mark: Ember's face (crest, turret eyes, smile) on a deep-teal tile so the orange pops.
export const Mark = ({ size = 34 }) => (
  <svg width={size} height={size} viewBox="0 0 100 100" aria-hidden="true">
    <defs>
      <linearGradient id="mk-bg" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stopColor="#4326e4" /><stop offset="1" stopColor="#0a0b26" /></linearGradient>
      <linearGradient id="mk-skin" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stopColor="#FFB443" /><stop offset=".55" stopColor="#FF6B1F" /><stop offset="1" stopColor="#F0254F" /></linearGradient>
      <radialGradient id="mk-ring" cx=".35" cy=".3" r=".9"><stop offset="0" stopColor="#FFA544" /><stop offset="1" stopColor="#F0552A" /></radialGradient>
      <radialGradient id="mk-iris" cx=".5" cy=".4" r=".7"><stop offset="0" stopColor="#FFE27A" /><stop offset="1" stopColor="#FF9E2A" /></radialGradient>
      <linearGradient id="mk-flame" x1="0" y1="1" x2="0" y2="0"><stop offset="0" stopColor="#FF4B2B" /><stop offset=".55" stopColor="#FF9A1F" /><stop offset="1" stopColor="#FFE45C" /></linearGradient>
      <radialGradient id="mk-glow"><stop offset="0" stopColor="#FF9A3C" stopOpacity=".55" /><stop offset="1" stopColor="#FF9A3C" stopOpacity="0" /></radialGradient>
      <clipPath id="mk-clip"><rect width="100" height="100" rx="26" /></clipPath>
    </defs>
    <g clipPath="url(#mk-clip)">
      <rect width="100" height="100" fill="url(#mk-bg)" />
      <circle cx="50" cy="58" r="46" fill="url(#mk-glow)" />
      <svg x="7" y="10" width="86" height="84" viewBox="62 30 176 172">
        <path d="M72 150 C72 100 104 80 150 80 C196 80 228 100 228 150 C228 182 210 200 150 200 C90 200 72 182 72 150 Z" fill="url(#mk-skin)" />
        <ellipse cx="150" cy="180" rx="41" ry="22" fill="#FFE2BC" />
        <path d="M150 86 C137 70 141 55 150 36 C159 55 163 70 150 86Z" fill="url(#mk-flame)" />
        <path d="M139 88 C129 78 131 66 137 56 C141 67 148 74 147 88Z" fill="url(#mk-flame)" />
        <path d="M161 88 C171 78 169 66 163 56 C159 67 152 74 153 88Z" fill="url(#mk-flame)" />
        <g fill="#FF6F91" opacity=".75"><circle cx="97" cy="150" r="11" /><circle cx="203" cy="150" r="11" /></g>
        <path d="M129 150 Q150 168 171 150" fill="none" stroke="#7A2410" strokeWidth="6" strokeLinecap="round" />
        {[104, 196].map((x) => (
          <g key={x} transform={`translate(${x} 92)`}>
            <circle r="31" fill="url(#mk-ring)" />
            <circle r="22" fill="#fff" />
            <circle r="14" fill="url(#mk-iris)" />
            <circle r="8" fill="#2B0F06" />
            <circle cx="-3.6" cy="-3.8" r="3.4" fill="#fff" />
          </g>
        ))}
      </svg>
    </g>
  </svg>
);

export const Logo = ({ size = 36, text = true }) => (
  <span className="logo"><Mark size={size} />{text && <b className="logo-name">{APP_NAME}</b>}</span>
);

// Animated number: counts up from the previous value to `to`.
export function CountUp({ to = 0, decimals = 0, ms = 900, lazy = false, prefix = '' }) {
  const [v, setV] = useState(0);
  const [go, setGo] = useState(!lazy);
  const from = useRef(0);
  const el = useRef(null);

  useEffect(() => {
    if (go || !el.current) return undefined;
    const o = new IntersectionObserver(([x]) => x.isIntersecting && (setGo(true), o.disconnect()));
    o.observe(el.current);
    return () => o.disconnect();
  }, [go]);

  useEffect(() => {
    if (!go) return undefined;
    const reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduce) { setV(to); from.current = to; return undefined; }
    let raf, t0;
    const a = from.current;
    const tick = (t) => {
      t0 = t0 ?? t;
      const p = Math.min(1, (t - t0) / ms);
      setV(a + (to - a) * (1 - Math.pow(1 - p, 3)));
      if (p < 1) raf = requestAnimationFrame(tick); else from.current = to;
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [to, go, ms]);

  const shown = decimals
    ? v.toLocaleString('en-PH', { minimumFractionDigits: decimals, maximumFractionDigits: decimals })
    : Math.round(v).toLocaleString('en-PH');
  return <span ref={el}>{prefix}{shown}</span>;
}

// Tiny stroke-icon set
const P = {
  plus: 'M12 5v14M5 12h14',
  pencil: 'M12 20h9M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4z',
  trash: 'M3 6h18M8 6V4h8v2M19 6l-1 14H6L5 6M10 11v6M14 11v6',
  search: 'M11 19a8 8 0 1 0 0-16 8 8 0 0 0 0 16zM21 21l-4.3-4.3',
  out: 'M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5-5-5M21 12H9',
  back: 'M19 12H5M12 19l-7-7 7-7',
  arrow: 'M5 12h14M12 5l7 7-7 7',
  x: 'M18 6 6 18M6 6l12 12',
  wallet: 'M3 7a2 2 0 0 1 2-2h13v4M3 7v11a2 2 0 0 0 2 2h15V9H5a2 2 0 0 1-2-2zM16 14h.01',
  boxes: 'M21 8 12 3 3 8v8l9 5 9-5zM3 8l9 5 9-5M12 13v8',
  layers: 'M12 3 2 8l10 5 10-5zM2 13l10 5 10-5M2 18l10 5 10-5',
  alert: 'M12 8v5M12 17h.01M10.3 3.9 2.4 18a2 2 0 0 0 1.7 3h15.8a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0z',
  check: 'M20 6 9 17l-5-5',
  shield: 'M12 3 4 6v6c0 5 3.4 8 8 9 4.6-1 8-4 8-9V6z',
  grid: 'M3 3h7v7H3zM14 3h7v7h-7zM14 14h7v7h-7zM3 14h7v7H3z',
  list: 'M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01',
  sparkles: 'M12 3l1.8 5.2L19 10l-5.2 1.8L12 17l-1.8-5.2L5 10l5.2-1.8zM19 16l.8 2.2L22 19l-2.2.8L19 22l-.8-2.2L16 19l2.2-.8z',
  refresh: 'M21 12a9 9 0 0 1-15.5 6.2L3 16M3 12A9 9 0 0 1 18.5 5.8L21 8M21 3v5h-5M3 21v-5h5',
};
export const Ico = ({ n, s = 18 }) => (
  <svg className={`ico ico-${n}`} width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d={P[n]} /></svg>
);

export const ThemeButton = ({ dark, toggle }) => (
  <button className="tswitch" type="button" role="switch" aria-checked={dark} onClick={toggle} aria-label="Toggle dark mode" title={dark ? 'Switch to light' : 'Switch to dark'}>
    <span className="tcloud" /><span className="tstar s1" /><span className="tstar s2" /><span className="tstar s3" /><span className="tt" />
  </button>
);

// Rising embers: pure-CSS decoration for dark hero panels.
export const Sparks = ({ n = 16 }) => (
  <span className="sparks" aria-hidden="true">
    {Array.from({ length: n }, (_, i) => <i key={i} style={{ '--x': (i * 37 + 7) % 100 + '%', '--d': 7 + (i % 5) * 2.2 + 's', '--dl': -i * 1.4 + 's', '--s': 3 + (i % 4) * 2 + 'px', '--sw': ((i % 3) - 1) * 26 + 'px' }} />)}
  </span>
);

export const Eye = ({ off }) => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    {off
      ? <path d="M3 3l18 18M10.6 10.6a3 3 0 0 0 4.2 4.2M9.9 5.2A9.9 9.9 0 0 1 12 5c6.5 0 10 7 10 7a17 17 0 0 1-3.2 4.2M6.6 6.7C3.7 8.5 2 12 2 12s3.5 7 10 7a9.7 9.7 0 0 0 4.2-.9" />
      : <><path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12z" /><circle cx="12" cy="12" r="3" /></>}
  </svg>
);
