import { useEffect, useState } from 'react';
import Ember from './Ember.jsx';
import { Logo, CountUp, ThemeButton, Ico, Sparks, APP_NAME } from './Brand.jsx';
import { avatarHue, avatarInitial } from '../utils.js';

// Sample content for the preview window (decorative, not real data).
const ROWS = [['Wireless Mouse', '₱899.00', '42 in stock', ''], ['Mechanical Keyboard', '₱3,450.00', '8 in stock', ''], ['USB-C Cable', '₱249.00', 'Out of stock', 'out']];
const MARQUEE = ['Live preview', 'Stock tracking', 'Price control', 'JWT secured', 'Auto-refreshing sessions', 'Search and sort', 'Dark mode', 'Works on your phone'];
const BARS = [['In stock', 78, 'var(--green)'], ['Running low', 34, 'var(--amber)'], ['Out of stock', 14, 'var(--red)']];
const EVENTS = [['+', 'b', 'New product: Wireless Mouse'], ['✎', '', 'Price updated to ₱3,450.00'], ['!', 'r', 'USB-C Cable is out of stock'], ['✓', '', 'Restocked 40 units'], ['↗', 'b', 'Inventory value up 12%'], ['★', 'g', 'Catalog synced with the API']];
const LINES = ['Hi! I’m Ember. I keep your catalog tidy.', 'Psst… the keyboards are running low!', 'Add, edit, delete. I’ll be watching.', 'Tap me. I dare you.'];

export default function Landing({ dark, toggle, onStart, onAbout }) {
  const [i, setI] = useState(0);
  const [hover, setHover] = useState('');
  const say = hover || LINES[i % LINES.length];

  useEffect(() => {
    const t = setInterval(() => setI((x) => x + 1), 5000);
    return () => clearInterval(t);
  }, []);

  // Scroll-reveal
  useEffect(() => {
    const els = document.querySelectorAll('.rv');
    if (!('IntersectionObserver' in window)) { els.forEach((el) => el.classList.add('in')); return undefined; }
    const o = new IntersectionObserver((es) => es.forEach((x) => { if (x.isIntersecting) { x.target.classList.add('in'); o.unobserve(x.target); } }), { threshold: 0.15 });
    els.forEach((el, k) => { el.style.setProperty('--d', (k % 4) * 90 + 'ms'); o.observe(el); });
    return () => o.disconnect();
  }, []);

  const tilt = (e) => {
    const b = e.currentTarget.getBoundingClientRect(), t = e.currentTarget.style;
    t.setProperty('--ry', ((e.clientX - b.left) / b.width - 0.5) * 8);
    t.setProperty('--rx', -((e.clientY - b.top) / b.height - 0.5) * 6);
  };
  const untilt = (e) => { e.currentTarget.style.setProperty('--ry', 0); e.currentTarget.style.setProperty('--rx', 0); };

  return (
    <div className="wrap">
      <nav className="topnav pill">
        <Logo />
        <span className="acts">
          <a className="btn sm outline" href="#features">Features</a>
          <button className="btn sm outline" onClick={onAbout}><Ico n="sparkles" s={15} />About us</button>
          <ThemeButton dark={dark} toggle={toggle} />
          <button className="btn sm" onClick={() => onStart('in')}>Sign in</button>
        </span>
      </nav>

      <header className="lhero">
        <div className="htxt">
          <h1><span className="gtext">Every product,</span><br /><span className="hl">in stock.</span></h1>
          <p>Keep your catalog clear, current and ready for your next customer. Add products, track stock and see your inventory value at a glance.</p>
          <div className="acts c">
            <button className="btn big" onClick={() => onStart('up')} onMouseEnter={() => setHover('Yes! Create your free account.')} onMouseLeave={() => setHover('')}>Get started free<Ico n="arrow" s={16} /></button>
            <a className="btn big outline" href="#features" onMouseEnter={() => setHover('Take a look around. I’ll wait.')} onMouseLeave={() => setHover('')}>See what’s inside</a>
          </div>
        </div>

        <div className="flag"><Sparks n={12} /><span className="orbit o1"><i /></span><span className="orbit o2"><i /></span><Ember size={330} say={say} sayTop /></div>

        <div className="stage2" onMouseMove={tilt} onMouseLeave={untilt}>
          <div className="win">
            <div className="dots3"><i /><i /><i /></div>
            <div className="wk">
              <div><small>Inventory value</small><b>₱48,250</b></div>
              <div><small>Total products</small><b style={{ color: 'var(--brand)' }}>12</b></div>
              <div><small>Units in stock</small><b style={{ color: 'var(--green)' }}>186</b></div>
            </div>
            <div className="wc">
              <div>
                <small className="mut">Inventory value this month</small>
                <svg viewBox="0 0 400 130" preserveAspectRatio="none">
                  <defs><linearGradient id="cf" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#14a89a" stopOpacity=".38" /><stop offset="1" stopColor="#14a89a" stopOpacity="0" /></linearGradient></defs>
                  <path className="chartfill" d="M0 110C50 100 70 70 120 78S200 30 250 44 340 12 400 20V130H0z" />
                  <path className="chartline" d="M0 110C50 100 70 70 120 78S200 30 250 44 340 12 400 20" />
                </svg>
              </div>
              <div>
                {ROWS.map(([n, p, s, c]) => (
                  <div className="row mini" key={n}>
                    <span className="av" style={{ width: 30, height: 30, '--h': avatarHue(n) }}>{avatarInitial(n)}</span>
                    <b>{n}<small>{p}</small></b>
                    <span className={'badge' + (c ? ' ' + c : '')}>{s}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
          <div className="feed" aria-hidden="true" onMouseEnter={() => setHover('Live activity, just like your store.')} onMouseLeave={() => setHover('')}>
            <div className="ticker">{[...EVENTS, ...EVENTS].map(([ic, c, t], k) => <div className="float" key={k}><i className={c}>{ic}</i>{t}</div>)}</div>
          </div>
          <p className="sample">Sample data, shown for illustration.</p>
        </div>
      </header>

      <section className="lstats">
        <div className="rv"><b><CountUp lazy to={3} /></b><span>stats on your dashboard, updated live</span></div>
        <div className="rv"><b><CountUp lazy to={1} /> login</b><span>and every product action is protected</span></div>
        <div className="rv"><b><CountUp lazy to={0} /></b><span>spreadsheets to lose</span></div>
      </section>

      <section id="features" className="bento">
        <div className="rv tile wide"><h3>See your stock before it runs out</h3><p>Every product shows how many units are left, and anything at zero is flagged so you restock the right items first.</p>
          <div className="gfx">{BARS.map(([l, w, c]) => <div className="gb" key={l}><span>{l}</span><i style={{ width: w + '%', background: c }} /></div>)}</div></div>
        <div className="rv tile"><h3>Add, edit, delete</h3><p>Full control of your catalog, with a live preview as you type.</p>
          <div className="gfx"><div className="sms">Wireless Mouse · ₱899.00 · 42 in stock</div><div className="sms me">Saved. Looking good!</div></div></div>
        <div className="rv tile"><h3>Secure by design</h3><p>Sign in once. Your session is protected with JWT tokens that refresh automatically.</p>
          <div className="gfx" style={{ justifyItems: 'center' }}><div className="lock"><Ico n="shield" s={44} /></div></div></div>
        <div className="rv tile wide"><h3>Meet {APP_NAME}, your fire chameleon</h3><p>Ember watches you type, covers its eyes when you enter a password, and gets nervous before you delete something.</p>
          <div className="gfx"><div className="sms">I'm not looking. Promise!</div><div className="sms me">Wait, are you sure?</div></div></div>
      </section>

      <section className="how"><h2 className="gtext">Up and running in three steps</h2>
        <div className="steps">{['Create your account in a few seconds.', 'Add your products with price and quantity.', 'Edit stock as it changes and watch your totals update.'].map((t, k) => <div key={t} className="rv"><span>{k + 1}</span><p>{t}</p></div>)}</div>
      </section>

      <section className="ab-marq rv" aria-label="Features"><div className="ab-track">{[...MARQUEE, ...MARQUEE].map((t, i) => <span key={i}>{t}</span>)}</div></section>

      <section className="rv cta"><Sparks n={14} /><h2>Stop keeping stock in your head.</h2><button className="btn big accent" onClick={() => onStart('up')}>Create your account<Ico n="arrow" s={16} /></button></section>
      <footer>{APP_NAME} · Built by Bhen Jay Amparo · <button className="link" onClick={onAbout}>About us</button></footer>
    </div>
  );
}
