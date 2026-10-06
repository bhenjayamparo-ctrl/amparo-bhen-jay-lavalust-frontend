import { useCallback, useEffect, useRef, useState } from 'react';
import { session, logout } from './api.js';
import { EmberDefs } from './components/Ember.jsx';
import Landing from './components/Landing.jsx';
import Auth from './components/Auth.jsx';
import About from './components/About.jsx';
import Dashboard from './components/Dashboard.jsx';

const getTheme = () => {
  try {
    const saved = localStorage.getItem('theme');
    if (saved) return saved === 'dark';
  } catch { /* storage unavailable */ }
  return window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
};

export default function App() {
  const [user, setUser] = useState(() => (session.access ? session.user : null));
  const [view, setView] = useState('landing');          // 'landing' | 'auth' | 'about'  (shown while logged out)
  const [authMode, setAuthMode] = useState('in');
  const [dark, setDark] = useState(getTheme);
  const [toast, setToast] = useState('');
  const toastTimer = useRef(null);

  useEffect(() => {
    document.documentElement.dataset.theme = dark ? 'dark' : 'light';
    try { localStorage.setItem('theme', dark ? 'dark' : 'light'); } catch { /* ignore */ }
  }, [dark]);

  // The API layer fires this when the session can no longer be refreshed.
  useEffect(() => {
    const onLogout = () => { setUser(null); setView('auth'); setAuthMode('in'); notify('Your session expired. Please sign in again.'); };
    window.addEventListener('auth:logout', onLogout);
    return () => window.removeEventListener('auth:logout', onLogout);
  }, []);

  const notify = useCallback((msg) => {
    setToast(msg);
    clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToast(''), 3200);
  }, []);

  const handleLogout = async () => {
    await logout();
    setUser(null);
    setView('landing');
    notify('Signed out.');
  };

  const toggle = () => setDark((d) => !d);
  const start = (mode) => { setAuthMode(mode); setView('auth'); window.scrollTo(0, 0); };

  let page;
  if (user) page = <Dashboard user={user} dark={dark} toggle={toggle} onLogout={handleLogout} notify={notify} />;
  else if (view === 'auth') page = <Auth key={authMode} dark={dark} toggle={toggle} initialMode={authMode} onBack={() => setView('landing')} onAuthed={(u) => { setUser(u); window.scrollTo(0, 0); }} />;
  else if (view === 'about') page = <About dark={dark} toggle={toggle} onBack={() => { setView('landing'); window.scrollTo(0, 0); }} onStart={start} />;
  else page = <Landing dark={dark} toggle={toggle} onStart={start} onAbout={() => { setView('about'); window.scrollTo(0, 0); }} />;

  return (
    <>
      <EmberDefs />
      {page}
      {toast && <div className="toast" role="status" aria-live="polite">{toast}</div>}
    </>
  );
}
