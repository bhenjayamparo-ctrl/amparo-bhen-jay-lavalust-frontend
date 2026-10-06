import { useEffect, useRef, useState } from 'react';
import Ember from './Ember.jsx';
import { Logo, Ico, ThemeButton, APP_NAME } from './Brand.jsx';

const LOOKS = { formal: '/team/bhen.png', tee: '/team/bhen-tee.jpg', shades: '/team/bhen-shades.jpg' };
const LOOK_LABEL = { formal: 'Suit', tee: 'Casual', shades: 'Shades' };
const TECH = ['React', 'Vite', 'Axios', 'LavaLust API', 'PHP', 'JWT', 'MySQL', 'Refresh tokens', 'Dark mode', 'Responsive'];

// Full "About us" page. The photo is the original suit; hover or tap switches to the casual shirt,
// and dark mode puts the shades on.
export default function About({ dark, toggle, onBack, onStart }) {
  const [alt, setAlt] = useState(false);
  const ref = useRef(null);
  const look = alt ? 'tee' : dark ? 'shades' : 'formal';
  const set = (k, v) => ref.current && ref.current.style.setProperty(k, v);

  const move = (e) => {
    const b = ref.current.getBoundingClientRect(), x = (e.clientX - b.left) / b.width - 0.5, y = (e.clientY - b.top) / b.height - 0.5;
    set('--rx', -y * 14 + 'deg'); set('--ry', x * 16 + 'deg'); set('--mx', x * 26 + 'px');
  };
  const leave = () => { setAlt(false); set('--rx', '0deg'); set('--ry', '0deg'); set('--mx', '0px'); };

  useEffect(() => {
    window.scrollTo(0, 0);
    const els = document.querySelectorAll('.ab-rv');
    const io = new IntersectionObserver((es) => es.forEach((e) => e.isIntersecting && e.target.classList.add('in')), { threshold: 0.15 });
    els.forEach((n) => io.observe(n));
    return () => io.disconnect();
  }, []);

  const tiles = [
    ['School', 'Mindoro State University', 'Calapan City Campus'],
    ['Activity', 'Lab Exercise 6', 'React frontend + LavaLust API'],
    ['Security', 'JWT sign-in', 'Access and refresh tokens'],
  ];
  const why = [
    ['The problem', 'Product lists end up in spreadsheets and chat threads. Prices drift, stock runs out and nobody notices.'],
    ['The idea', 'One clean catalog with live stock tracking, a live preview while you edit, and a mascot that keeps you company.'],
    ['The build', 'A React app that talks to a LavaLust API. Sign in once, and only signed-in users can add, edit or delete products.'],
  ];

  return (
    <div className="wrap ab-page">
      <nav className="topnav pill">
        <Logo />
        <span className="acts">
          <button className="btn sm outline" onClick={onBack}><Ico n="back" s={15} />Home</button>
          <ThemeButton dark={dark} toggle={toggle} />
          <button className="btn sm" onClick={() => onStart('in')}>Sign in</button>
        </span>
      </nav>

      <header className="ab-hero">
        <span className="ab-pill">About us</span>
        <h1>Meet the mind behind <span className="ab-grad">{APP_NAME}</span></h1>
        <p>One IT student turning a lab exercise into a product catalog that feels like a real product.</p>
      </header>

      <section className="ab-intro ab-rv">
        <article className="ab-person" ref={ref} tabIndex={0} onMouseEnter={() => setAlt(true)} onMouseMove={move} onMouseLeave={leave}
          onFocus={() => setAlt(true)} onBlur={leave} onTouchStart={() => setAlt((a) => !a)} aria-label="Photo of Bhen Jay Amparo. Hover or tap to change outfit.">
          <div className="ab-ring" />
          <div className="ab-frame">
            {Object.entries(LOOKS).map(([k, src]) => <img key={k} src={src} alt={k === look ? 'Bhen Jay Amparo' : ''} aria-hidden={k !== look} className={k === look ? 'on' : ''} />)}
            <span className="ab-sheen" />
          </div>
          <div className="looks" aria-hidden="true">{Object.keys(LOOKS).map((k) => <span key={k} className={k === look ? 'on' : ''}>{LOOK_LABEL[k]}</span>)}</div>
          <small>Hover or tap the photo</small>
        </article>

        <div className="ab-text">
          <h2>Bhen Jay Amparo</h2>
          <p className="ab-role">IT Student · 3rd Year · F1</p>
          <p>
            I built {APP_NAME} as a product management app: a React frontend that talks to a LavaLust API.
            You sign in once with JWT, and only signed-in users can add, edit or delete products.
          </p>
          <dl className="ab-facts">
            <div><dt>School</dt><dd>Mindoro State University, Calapan City Campus</dd></div>
            <div><dt>Mascot</dt><dd>{APP_NAME}, the fire chameleon</dd></div>
          </dl>
          <div className="acts">
            <button className="btn big" onClick={() => onStart('up')}>Try {APP_NAME}<Ico n="arrow" s={16} /></button>
          </div>
        </div>
      </section>

      <section className="ab-stats ab-rv">
        {[['3rd', 'Year level'], ['F1', 'Section'], ['1', 'Builder'], ['1', 'Fire chameleon']].map(([a, b]) => <div key={b}><b>{a}</b><span>{b}</span></div>)}
      </section>

      <section className="ab-grid3 ab-rv">
        {tiles.map(([k, v, s]) => <div className="ab-tile" key={k}><small>{k}</small><h3>{v}</h3><p>{s}</p></div>)}
      </section>

      <section className="ab-rv">
        <h2 className="ab-h2">Why we built {APP_NAME}</h2>
        <div className="ab-grid3">{why.map(([t, d], i) => <div className="ab-tile" key={t}><span className="ab-n">{i + 1}</span><h3>{t}</h3><p>{d}</p></div>)}</div>
      </section>

      <section className="ab-marq ab-rv" aria-label="Built with"><div className="ab-track">{[...TECH, ...TECH].map((t, i) => <span key={i}>{t}</span>)}</div></section>

      <section className="ab-cta ab-rv">
        <Ember size={170} say="Thanks for stopping by!" sayTop />
        <h2>Ready to meet your new catalog?</h2>
        <button className="btn big" onClick={() => onStart('up')}>Create your account<Ico n="arrow" s={16} /></button>
      </section>
      <footer>Built by Bhen Jay Amparo · MinSU Calapan City Campus</footer>
    </div>
  );
}
