// Pure UI effects (no app logic): cursor-lit buttons, ripples, magnetic CTA, 3D card tilt.
const reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const fine = window.matchMedia && window.matchMedia('(pointer: fine)').matches;
let tilted = null;

const untilt = (el) => {
  if (!el) return;
  el.style.setProperty('--rx', '0deg'); el.style.setProperty('--ry', '0deg'); el.style.setProperty('--glare', '0');
};

document.addEventListener('pointermove', (e) => {
  const t = e.target;
  if (!t || !t.closest) return;
  const b = t.closest('.btn');
  if (b) {
    const r = b.getBoundingClientRect();
    b.style.setProperty('--mx', e.clientX - r.left + 'px');
    b.style.setProperty('--my', e.clientY - r.top + 'px');
    if (b.classList.contains('big') && fine && !reduce) {
      b.style.setProperty('--tx', ((e.clientX - r.left) / r.width - 0.5) * 10 + 'px');
      b.style.setProperty('--ty', ((e.clientY - r.top) / r.height - 0.5) * 8 + 'px');
    }
  }
  const c = fine && !reduce ? t.closest('[data-tilt]') : null;
  if (c !== tilted) { untilt(tilted); tilted = c; }
  if (c) {
    const r = c.getBoundingClientRect(), x = (e.clientX - r.left) / r.width, y = (e.clientY - r.top) / r.height;
    c.style.setProperty('--ry', (x - 0.5) * 12 + 'deg');
    c.style.setProperty('--rx', -(y - 0.5) * 10 + 'deg');
    c.style.setProperty('--gx', x * 100 + '%'); c.style.setProperty('--gy', y * 100 + '%'); c.style.setProperty('--glare', '1');
  }
}, { passive: true });

document.addEventListener('pointerleave', () => { untilt(tilted); tilted = null; }, true);

document.addEventListener('pointerout', (e) => {
  const b = e.target.closest && e.target.closest('.btn.big');
  if (b && !b.contains(e.relatedTarget)) { b.style.setProperty('--tx', '0px'); b.style.setProperty('--ty', '0px'); }
}, { passive: true });

document.addEventListener('pointerdown', (e) => {
  if (reduce) return;
  const b = e.target.closest && e.target.closest('.btn,.ab,.icon,.seg button,.fchip,.vt button');
  if (!b || b.disabled) return;
  const r = b.getBoundingClientRect(), s = Math.max(r.width, r.height) * 2;
  const d = document.createElement('span');
  d.className = 'rip';
  d.style.cssText = `width:${s}px;height:${s}px;left:${e.clientX - r.left - s / 2}px;top:${e.clientY - r.top - s / 2}px`;
  b.appendChild(d);
  setTimeout(() => d.remove(), 700);
}, { passive: true });
