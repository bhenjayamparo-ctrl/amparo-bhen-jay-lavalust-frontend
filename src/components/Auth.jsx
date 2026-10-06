import { useEffect, useRef, useState } from 'react';
import Ember from './Ember.jsx';
import { Logo, ThemeButton, Ico, Eye, Sparks } from './Brand.jsx';
import { login, register, errorMessage } from '../api.js';
import { USERNAME_RE, EMAIL_RE } from '../utils.js';

export default function Auth({ dark, toggle, initialMode = 'in', onBack, onAuthed }) {
  const [mode, setMode] = useState(initialMode); // 'in' | 'up'
  const [f, setF] = useState({ username: '', email: '', password: '' });
  const [err, setErr] = useState('');
  const [busy, setBusy] = useState(false);
  const [show, setShow] = useState(false);
  const [focus, setFocus] = useState('');       // 'username' | 'email' | 'password' | 'submit' | ''
  const [tick, setTick] = useState(0);
  const [joy, setJoy] = useState(false);
  const [errMood, setErrMood] = useState(false);

  const refs = { username: useRef(null), email: useRef(null), password: useRef(null), submit: useRef(null) };
  const up = mode === 'up';
  const set = (k) => (e) => { setF({ ...f, [k]: e.target.value }); setTick((t) => t + 1); };

  // Ember gets "scared" for a few seconds whenever an error appears
  useEffect(() => {
    if (!err) return undefined;
    setErrMood(true);
    const t = setTimeout(() => setErrMood(false), 3400);
    return () => clearTimeout(t);
  }, [err]);

  const switchMode = (m) => { setMode(m); setErr(''); setFocus(''); };

  const validate = () => {
    if (up) {
      if (!USERNAME_RE.test(f.username.trim())) return 'Username must be 3-50 characters (letters, numbers, underscore).';
      if (!EMAIL_RE.test(f.email.trim())) return 'A valid email is required.';
      if (f.password.length < 6) return 'Password must be at least 6 characters.';
    } else if (!f.username.trim() || !f.password) {
      return 'Enter your username and password.';
    }
    return '';
  };

  const submit = async (e) => {
    e.preventDefault();
    const problem = validate();
    if (problem) return setErr(problem);
    setErr('');
    setBusy(true);
    try {
      const username = f.username.trim();
      if (up) await register({ username, email: f.email.trim().toLowerCase(), password: f.password });
      const user = await login(username, f.password); // after sign-up we log straight in
      setJoy(true);
      setTimeout(() => onAuthed(user), 650);
    } catch (ex) {
      setErr(errorMessage(ex));
      setBusy(false);
    }
  };

  // ---- Ember's reactions ----
  const typing = (focus === 'username' && f.username) || (focus === 'email' && f.email);
  let moods = '', say = up ? 'Hi! Let’s set up your account.' : 'Hi there! Ready to sign in?', aim = null;
  if (focus === 'username' || focus === 'email') {
    aim = { el: refs[focus].current, caret: true };
    say = focus === 'email' ? 'What’s your email?' : up ? 'Pick a username!' : 'Ooh, who might you be?';
    if (typing) moods = 'is-user';
  } else if (focus === 'password') {
    aim = { el: refs.password.current, xr: 0.2 };
    moods = show ? 'is-peek' : 'is-hiding';
    say = show ? 'Hehe... just a tiny peek.' : 'I’m not looking. Promise!';
  } else if (focus === 'submit') {
    aim = { el: refs.submit.current };
    moods = 'is-excited';
    say = 'Let’s gooo!';
  }
  // moods combine (as in the first activity): e.g. the eyes stay covered while the error pose plays
  if (errMood) { moods = (moods + ' is-error').trim(); say = up ? 'Hmm, something’s off.' : 'Hmm, that didn’t match.'; }
  if (joy) { moods = 'is-joy'; say = 'Woohoo! Hold tight...'; aim = null; }

  const bind = (name) => ({ onFocus: () => setFocus(name), onBlur: () => setFocus((x) => (x === name ? '' : x)) });

  return (
    <div className="auth">
      <section className="brandpane">
        <Sparks n={18} />
        <Logo size={40} />
        <div className="bp-body">
          <div className="bp-stage"><span className="ring r1" /><span className="ring r2" /><span className="ring r3" />
          <Ember size={250} moods={moods} say={say} aim={aim} aimTick={tick} /></div>
          <h2>Your catalog, kept in good hands.</h2>
          <p>Sign in to manage your products, inventory and prices. Everything is saved securely through the API.</p>
          <div className="chips">{['Live preview', 'Stock tracking', 'JWT secured'].map((c) => <span key={c}>{c}</span>)}</div>
        </div>
        <button type="button" className="btn big accent lead" onClick={onBack}><Ico n="back" s={16} />Back to home</button>
      </section>

      <section className="formpane">
        <span className="theme-corner"><ThemeButton dark={dark} toggle={toggle} /></span>
        <form className="form" onSubmit={submit} noValidate>
          <button type="button" className="btn sm outline backsm" onClick={onBack}><Ico n="back" s={14} />Home</button>
          <h1>{up ? 'Create your account' : 'Welcome back'}</h1>
          <p className="sub">{up ? 'Register to start managing products.' : 'Sign in to manage your catalog, inventory and product details.'}</p>
          <div className="seg" role="tablist">
            {[['in', 'Sign in'], ['up', 'Create account']].map(([k, l]) => (
              <button type="button" role="tab" aria-selected={mode === k} key={k} className={mode === k ? 'on' : ''} onClick={() => switchMode(k)}>{l}</button>
            ))}
          </div>

          <label>{up ? 'Username' : 'Username or email'}
            <input ref={refs.username} value={f.username} onChange={set('username')} {...bind('username')} autoComplete="username" autoFocus
              onKeyUp={() => setTick((t) => t + 1)} onClick={() => setTick((t) => t + 1)} />
          </label>

          {up && (
            <label>Email
              <input ref={refs.email} type="email" value={f.email} onChange={set('email')} {...bind('email')} autoComplete="email"
                onKeyUp={() => setTick((t) => t + 1)} onClick={() => setTick((t) => t + 1)} />
            </label>
          )}

          <label>Password
            <span className="pw">
              <input ref={refs.password} type={show ? 'text' : 'password'} value={f.password} onChange={set('password')} {...bind('password')}
                autoComplete={up ? 'new-password' : 'current-password'} />
              <button type="button" className="eye" onClick={() => setShow(!show)} onFocus={() => setFocus('password')}
                aria-label={show ? 'Hide password' : 'Show password'} aria-pressed={show}><Eye off={show} /></button>
            </span>
          </label>

          {up && f.password && (() => {
            const s = [f.password.length >= 6, f.password.length >= 10, /[a-z]/.test(f.password) && /[A-Z]/.test(f.password), /\d/.test(f.password) && /[^A-Za-z0-9]/.test(f.password)].filter(Boolean).length;
            return <div className="meter" data-s={s} aria-live="polite"><i /><i /><i /><i /><small>Password strength: {['Too short', 'Okay', 'Good', 'Strong'][Math.max(0, s - 1)]}</small></div>;
          })()}

          {err && <p className="err" role="alert">{err}</p>}

          <button ref={refs.submit} className="btn big" disabled={busy} {...bind('submit')}
            onPointerEnter={() => setFocus('submit')} onPointerLeave={() => setFocus((x) => (x === 'submit' ? '' : x))}>
            {busy ? 'Please wait…' : up ? 'Create account' : 'Sign in'}<Ico n="arrow" s={18} />
          </button>
          <p className="switch">
            {up ? <>Already have an account? <button type="button" className="link" onClick={() => switchMode('in')}>Sign in</button></>
              : <>No account yet? <button type="button" className="link" onClick={() => switchMode('up')}>Create one</button></>}
          </p>
        </form>
      </section>
    </div>
  );
}
