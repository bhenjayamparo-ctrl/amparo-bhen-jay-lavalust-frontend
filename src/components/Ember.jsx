import { useEffect, useRef, useState } from 'react';

/**
 * Ember - the fire chameleon, ported from the first activity (views/partials/ember.php + ember_js.php).
 * Same artwork, same behaviour: eyes follow the cursor (or a field / caret you point them at),
 * idle wandering, a tongue flick on click, and mood classes (is-hiding, is-peek, is-error ...).
 */

// Shared gradients. Render this ONCE near the root; every <Ember/> references these ids.
export function EmberDefs() {
  return (
    <svg width="0" height="0" style={{ position: 'absolute' }} aria-hidden="true" focusable="false">
      <defs>
<linearGradient id="ch-skin" x1="70" y1="60" x2="240" y2="205" gradientUnits="userSpaceOnUse">
        <stop offset="0" stopColor="#FFB443"/><stop offset=".5" stopColor="#FF6B1F"/><stop offset="1" stopColor="#F0254F"/>
      </linearGradient>
      <radialGradient id="ch-ring" cx=".35" cy=".3" r=".9">
        <stop offset="0" stopColor="#FFA544"/><stop offset="1" stopColor="#F0552A"/>
      </radialGradient>
      <linearGradient id="ch-belly" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stopColor="#FFEBCE"/><stop offset="1" stopColor="#FFC58C"/>
      </linearGradient>
      <linearGradient id="ch-flame" x1="0" y1="1" x2="0" y2="0">
        <stop offset="0" stopColor="#FF4B2B"/><stop offset=".55" stopColor="#FF9A1F"/><stop offset="1" stopColor="#FFE45C"/>
      </linearGradient>
      <radialGradient id="ch-glow">
        <stop offset="0" stopColor="#FFB443" stopOpacity=".75"/><stop offset="1" stopColor="#FFB443" stopOpacity="0"/>
      </radialGradient>
      <radialGradient id="ch-iris" cx=".5" cy=".4" r=".7">
        <stop offset="0" stopColor="#FFE27A"/><stop offset="1" stopColor="#FF9E2A"/>
      </radialGradient>
      <clipPath id="ch-clip"><circle r="21"/></clipPath>
      </defs>
    </svg>
  );
}

const reduceMotion = () =>
  typeof window !== 'undefined' && window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

let lastMove = Date.now();
if (typeof window !== 'undefined') {
  window.addEventListener('pointermove', () => { lastMove = Date.now(); }, { passive: true });
}

let measureCtx = null;
const measure = () => (measureCtx ||= document.createElement('canvas').getContext('2d'));

/**
 * Props
 *  size    width in px
 *  moods   space-separated mood classes, e.g. "is-hiding" or "is-excited is-user"
 *  say     speech-bubble text ('' = no bubble)
 *  sayLeft put the bubble on the left, sayTop centred above the head
 *  perch   '' (in flow) | 'c' | 'r'  -> sits on the top edge of its relatively-positioned parent
 *  sink    how far the feet sink into the perch edge (0-1)
 *  aim     null (follow mouse) | { el, xr } look at an element | { el, caret:true } look at a text caret
 *  aimTick bump this number to re-aim at the caret while typing
 *  autoFlick snack on a firefly every few seconds (used on the empty state)
 */
export default function Ember({ size = 200, moods = '', say = '', sayLeft = false, sayTop = false, perch = '', sink = 0.1, aim = null, aimTick = 0, hideSmall = false, autoFlick = false, className = '' }) {
  const stage = useRef(null);
  const aimRef = useRef(null);
  const [flicking, setFlicking] = useState(false);
  const busy = useRef(false);
  aimRef.current = aim;

  const lookAt = (cx, cy) => {
    const root = stage.current;
    if (!root) return;
    const R = 7.2;
    root.querySelectorAll('.ch-eye').forEach((eye) => {
      const r = eye.querySelector('.ch-sclera').getBoundingClientRect();
      const dx = cx - (r.left + r.width / 2), dy = cy - (r.top + r.height / 2);
      const d = Math.hypot(dx, dy) || 1, k = Math.min(1, d / 150);
      eye.querySelector('.ch-pupil').style.transform = `translate(${((dx / d) * R * k).toFixed(2)}px,${((dy / d) * R * k).toFixed(2)}px)`;
    });
    const s = root.getBoundingClientRect();
    const t = Math.max(-5, Math.min(5, ((cx - (s.left + s.width / 2)) / window.innerWidth) * 16));
    root.querySelector('.cham-tilt').style.setProperty('--tilt', t.toFixed(2) + 'deg');
  };

  const lookAtTarget = (a) => {
    if (!a || !a.el) return;
    if (a.caret) {
      const input = a.el, r = input.getBoundingClientRect(), cs = getComputedStyle(input);
      const ctx = measure();
      ctx.font = `${cs.fontWeight} ${cs.fontSize} ${cs.fontFamily}`;
      const pos = input.selectionStart == null ? input.value.length : input.selectionStart;
      let before = input.value.slice(0, pos), y = r.top + r.height / 2;
      if (input.tagName === 'TEXTAREA') {
        const lines = before.split('\n');
        before = lines[lines.length - 1];
        y = Math.min(r.bottom - 14, r.top + 24 + (lines.length - 1) * 22);
      }
      lookAt(Math.min(r.right - 16, r.left + 16 + ctx.measureText(before).width), y);
    } else {
      const r = a.el.getBoundingClientRect();
      lookAt(r.left + r.width * (a.xr ?? 0.5), r.top + r.height / 2);
    }
  };

  // Follow the mouse unless told to look at something specific.
  useEffect(() => {
    const onMove = (ev) => { if (!aimRef.current) lookAt(ev.clientX, ev.clientY); };
    window.addEventListener('pointermove', onMove, { passive: true });
    return () => window.removeEventListener('pointermove', onMove);
  }, []);

  // Look at the requested element / caret whenever it changes (or the caller bumps aimTick).
  useEffect(() => { lookAtTarget(aim); }, [aim, aimTick]);

  // Idle wandering when nobody is moving the mouse.
  useEffect(() => {
    if (reduceMotion()) return undefined;
    const id = setInterval(() => {
      const root = stage.current;
      if (!root || aimRef.current || Date.now() - lastMove < 3000 || root.classList.contains('is-hiding') || !root.getClientRects().length) return;
      root.querySelectorAll('.ch-pupil').forEach((p) => {
        p.style.transform = `translate(${((Math.random() * 2 - 1) * 7.2).toFixed(2)}px,${((Math.random() * 2 - 1) * 5).toFixed(2)}px)`;
      });
      root.querySelector('.cham-tilt').style.setProperty('--tilt', ((Math.random() * 2 - 1) * 2.5).toFixed(2) + 'deg');
    }, 1700);
    return () => clearInterval(id);
  }, []);

  const flick = () => {
    if (busy.current) return;
    busy.current = true;
    setFlicking(true);
    setTimeout(() => { busy.current = false; setFlicking(false); }, 1100);
  };

  useEffect(() => {
    if (!autoFlick || reduceMotion()) return undefined;
    const id = setInterval(() => { if (stage.current && stage.current.getClientRects().length) flick(); }, 7000);
    return () => clearInterval(id);
  }, [autoFlick]);

  const cls = ['cham-stage', perch ? `perch ${perch}` : 'flow', hideSmall ? 'hide-sm' : '', moods, flicking ? 'is-flick is-joy is-rainbow' : '', className]
    .filter(Boolean).join(' ');

  return (
    <div ref={stage} className={cls} style={{ '--w': size + 'px', '--sink': sink }} onClick={flick} aria-hidden="true">
      {say && <div className={'cham-say bump' + (sayLeft ? ' l' : '') + (sayTop ? ' t' : '')} key={say}><span>{say}</span></div>}
      <div className="cham-tilt">
        <svg className="cham" viewBox="0 0 300 230" focusable="false">

      
  
      {/* tail with a flame at the tip */}
      <g className="ch-tail">
        <path d="M216 186 C246 198 272 178 265 152 C260 132 235 131 233 148 C232 160 247 163 250 152" fill="none" stroke="url(#ch-skin)" strokeWidth="16" strokeLinecap="round"/>
        <path d="M216 186 C246 198 272 178 265 152 C260 132 235 131 233 148 C232 160 247 163 250 152" fill="none" stroke="#fff" strokeOpacity=".16" strokeWidth="4" strokeLinecap="round" transform="translate(0 -3)"/>
        <g transform="translate(250 146)">
          <circle className="ch-glow" cy="-15" r="28" fill="url(#ch-glow)"/>
          <path className="ch-flame" d="M0 0 C-10 -9 -9 -22 0 -36 C9 -22 10 -9 0 0Z" fill="url(#ch-flame)"/>
          <path className="ch-flame b" d="M0 -3 C-4.5 -8 -3.5 -15 0 -22 C3.5 -15 4.5 -8 0 -3Z" fill="#FFF3A8" opacity=".92"/>
          <circle className="ch-ember" cx="-3" cy="-30" r="2" fill="#FFD25C" style={{'--ex':'-8px'}}/>
          <circle className="ch-ember" cx="4" cy="-32" r="1.6" fill="#FFB443" style={{'--ex':'9px','animationDelay':'-1.1s'}}/>
          <circle className="ch-ember" cx="0" cy="-34" r="1.8" fill="#FFE27A" style={{'--ex':'2px','animationDelay':'-1.9s'}}/>
        </g>
      </g>
  
      {/* feet (toes grip the card edge) */}
      <g className="ch-feet">
        <g transform="translate(106 203)"><ellipse rx="21" ry="9" fill="#E8452A"/><circle cx="-13" cy="6" r="6" fill="#FF6B1F"/><circle cy="8" r="6" fill="#FF6B1F"/><circle cx="13" cy="6" r="6" fill="#FF6B1F"/></g>
        <g transform="translate(194 203)"><ellipse rx="21" ry="9" fill="#E8452A"/><circle cx="-13" cy="6" r="6" fill="#FF6B1F"/><circle cy="8" r="6" fill="#FF6B1F"/><circle cx="13" cy="6" r="6" fill="#FF6B1F"/></g>
      </g>
  
      <g className="ch-bob">
        {/* body */}
        <path d="M72 150 C72 100 104 80 150 80 C196 80 228 100 228 150 C228 182 210 200 150 200 C90 200 72 182 72 150 Z" fill="url(#ch-skin)"/>
        <ellipse cx="150" cy="178" rx="41" ry="24" fill="url(#ch-belly)"/>
        <path d="M124 170 Q150 178 176 170 M128 181 Q150 188 172 181" fill="none" stroke="#E9A56A" strokeOpacity=".55" strokeWidth="2.6" strokeLinecap="round"/>
        <path d="M85 128 Q94 150 89 174 M215 128 Q206 150 211 174" fill="none" stroke="#C8261C" strokeOpacity=".22" strokeWidth="6" strokeLinecap="round"/>
        <g fill="#fff" opacity=".13"><circle cx="100" cy="118" r="3.2"/><circle cx="112" cy="132" r="2.4"/><circle cx="196" cy="120" r="3"/><circle cx="188" cy="136" r="2.3"/><circle cx="86" cy="150" r="2.4"/><circle cx="214" cy="152" r="2.6"/></g>
        <ellipse cx="118" cy="106" rx="30" ry="13" transform="rotate(-24 118 106)" fill="#fff" opacity=".2"/>
  
        {/* flame crest */}
        <g>
          <path className="ch-flame" d="M150 86 C137 70 141 55 150 36 C159 55 163 70 150 86Z" fill="url(#ch-flame)"/>
          <path className="ch-flame b" d="M139 88 C129 78 131 66 137 56 C141 67 148 74 147 88Z" fill="url(#ch-flame)" opacity=".95"/>
          <path className="ch-flame b" d="M161 88 C171 78 169 66 163 56 C159 67 152 74 153 88Z" fill="url(#ch-flame)" opacity=".95"/>
          <path className="ch-flame" d="M150 84 C145 76 146 68 150 58 C154 68 155 76 150 84Z" fill="#FFF3A8" opacity=".9"/>
          <circle className="ch-ember" cx="146" cy="36" r="1.8" fill="#FFD25C" style={{'--ex':'-7px','animationDelay':'-.6s'}}/>
          <circle className="ch-ember" cx="155" cy="34" r="1.5" fill="#FFB443" style={{'--ex':'8px','animationDelay':'-1.6s'}}/>
        </g>
  
        {/* face */}
        <g className="ch-cheek" fill="#FF6F91"><circle cx="97" cy="147" r="11"/><circle cx="203" cy="147" r="11"/></g>
        <g fill="#7A2410"><circle cx="143" cy="130" r="2.2"/><circle cx="157" cy="130" r="2.2"/></g>
        <path className="m-smile" d="M129 147 Q150 163 171 147" fill="none" stroke="#7A2410" strokeWidth="4.5" strokeLinecap="round"/>
        <g className="m-grin"><path d="M126 143 Q150 151 174 143 Q170 172 150 172 Q130 172 126 143Z" fill="#7A2410"/><path d="M138 168 Q150 158 162 168 Q158 174 150 174 Q142 174 138 168Z" fill="#FF7A96"/></g>
        <path className="m-frown" d="M133 159 Q150 146 167 159" fill="none" stroke="#7A2410" strokeWidth="4.5" strokeLinecap="round"/>
        <path className="ch-sweat" d="M234 64 Q226 76 234 82 Q242 76 234 64Z" fill="#7CC7FF"/>
  
        {/* tongue (flicks left to catch the fly) */}
        <g className="ch-tongue">
          <path className="line" d="M141 154 Q95 157 48 150" fill="none" stroke="#FF6F91" strokeWidth="8" strokeLinecap="round"/>
          <circle className="tip" cx="141" cy="154" r="7" fill="#FF5C85"/>
        </g>
  
        {/* eyes: independent turrets, like a real chameleon */}
        <g className="ch-eye l" transform="translate(104 86)">
          <circle r="29" fill="url(#ch-ring)"/>
          <circle r="29" fill="none" stroke="#fff" strokeOpacity=".3" strokeWidth="1.6"/>
          <circle className="ch-sclera" r="21" fill="#fff"/>
          <g clipPath="url(#ch-clip)">
            <g className="ch-pupil"><circle r="13" fill="url(#ch-iris)"/><circle r="7.6" fill="#2B0F06"/><circle cx="-3.4" cy="-3.6" r="3.2" fill="#fff"/><circle cx="3.6" cy="3.4" r="1.6" fill="#fff" opacity=".85"/></g>
            <g className="lid lid-blink"><rect x="-22" y="-22" width="44" height="44" fill="url(#ch-ring)"/><rect x="-22" y="19" width="44" height="3" fill="#C8321A" opacity=".5"/></g>
            <g className="lid lid-state"><rect x="-22" y="-22" width="44" height="44" fill="url(#ch-ring)"/><rect x="-22" y="19" width="44" height="3" fill="#C8321A" opacity=".5"/></g>
          </g>
          <path className="ch-lash" d="M-13 5 Q0 14 13 5"/>
        </g>
        <g className="ch-eye r" transform="translate(196 86)">
          <circle r="29" fill="url(#ch-ring)"/>
          <circle r="29" fill="none" stroke="#fff" strokeOpacity=".3" strokeWidth="1.6"/>
          <circle className="ch-sclera" r="21" fill="#fff"/>
          <g clipPath="url(#ch-clip)">
            <g className="ch-pupil"><circle r="13" fill="url(#ch-iris)"/><circle r="7.6" fill="#2B0F06"/><circle cx="-3.4" cy="-3.6" r="3.2" fill="#fff"/><circle cx="3.6" cy="3.4" r="1.6" fill="#fff" opacity=".85"/></g>
            <g className="lid lid-blink"><rect x="-22" y="-22" width="44" height="44" fill="url(#ch-ring)"/><rect x="-22" y="19" width="44" height="3" fill="#C8321A" opacity=".5"/></g>
            <g className="lid lid-state"><rect x="-22" y="-22" width="44" height="44" fill="url(#ch-ring)"/><rect x="-22" y="19" width="44" height="3" fill="#C8321A" opacity=".5"/></g>
          </g>
          <path className="ch-lash" d="M-13 5 Q0 14 13 5"/>
        </g>
      </g>
  
      {/* a tasty firefly */}
      <g transform="translate(36 146)">
        <g className="ch-fly">
          <circle r="10" fill="url(#ch-glow)"/>
          <ellipse className="ch-wing" cx="-3" cy="-4" rx="3.2" ry="5.5" fill="#fff" opacity=".7"/>
          <ellipse className="ch-wing" cx="3" cy="-4" rx="3.2" ry="5.5" fill="#fff" opacity=".7" style={{'animationDelay':'-.08s'}}/>
          <circle r="3.4" fill="#FFD25C"/>
        </g>
      </g>
    
        </svg>
      </div>
    </div>
  );
}
