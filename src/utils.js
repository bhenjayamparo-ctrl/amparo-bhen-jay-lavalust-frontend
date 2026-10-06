// Same helpers the first activity used for the product tiles (hue hash, initial) plus formatting.

export const money = (n) =>
  Number(n || 0).toLocaleString('en-PH', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

// "2026-10-05 11:33:00" (MySQL) -> "Oct 5, 2026"
export function fmtDate(s) {
  if (!s) return '';
  const d = new Date(String(s).replace(' ', 'T'));
  return isNaN(d) ? String(s) : d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

// Same colour hash as the first activity: sum(byte * (index + 7)) % 360 over the UTF-8 bytes.
export function avatarHue(name) {
  const bytes = new TextEncoder().encode(String(name || ''));
  if (!bytes.length) return 25;
  let h = 0;
  bytes.forEach((b, i) => { h += b * (i + 7); });
  return h % 360;
}

export function avatarInitial(name) {
  const t = String(name || '').trim();
  return t ? Array.from(t)[0].toUpperCase() : '?';
}

// Mirrors the backend's validation rules in AuthController::register
export const USERNAME_RE = /^[A-Za-z0-9_]{3,50}$/;
export const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
