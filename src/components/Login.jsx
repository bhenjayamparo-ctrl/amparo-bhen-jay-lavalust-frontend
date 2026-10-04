import { useState } from 'react';
import { login, register, errorMessage } from '../api.js';

export default function Login({ onLoggedIn }) {
  const [mode, setMode] = useState('login'); // 'login' | 'register'
  const [form, setForm] = useState({ username: '', email: '', password: '' });
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [busy, setBusy] = useState(false);

  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  const submit = async (e) => {
    e.preventDefault();
    setError('');
    setNotice('');
    setBusy(true);
    try {
      if (mode === 'register') {
        await register(form);
        setNotice('Account created. You can now log in.');
        setMode('login');
        setForm({ username: form.username, email: '', password: '' });
      } else {
        const user = await login(form.username, form.password);
        onLoggedIn(user);
      }
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="auth-wrap">
      <form className="card auth-card" onSubmit={submit}>
        <h1>{mode === 'login' ? 'Login' : 'Create account'}</h1>

        {notice && <div className="alert alert-ok">{notice}</div>}
        {error && <div className="alert alert-error">{error}</div>}

        <label>
          {mode === 'login' ? 'Username or email' : 'Username'}
          <input value={form.username} onChange={set('username')} required autoFocus />
        </label>

        {mode === 'register' && (
          <label>
            Email
            <input type="email" value={form.email} onChange={set('email')} required />
          </label>
        )}

        <label>
          Password
          <input type="password" value={form.password} onChange={set('password')} required />
        </label>

        <button className="btn btn-primary" disabled={busy}>
          {busy ? 'Please wait…' : mode === 'login' ? 'Login' : 'Register'}
        </button>

        <p className="switch">
          {mode === 'login' ? (
            <>No account? <button type="button" className="link" onClick={() => { setMode('register'); setError(''); }}>Register</button></>
          ) : (
            <>Have an account? <button type="button" className="link" onClick={() => { setMode('login'); setError(''); }}>Login</button></>
          )}
        </p>
      </form>
    </div>
  );
}
