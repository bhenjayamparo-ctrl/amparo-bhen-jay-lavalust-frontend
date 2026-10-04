import { useEffect, useState } from 'react';
import { session, logout } from './api.js';
import Login from './components/Login.jsx';
import ProductList from './components/ProductList.jsx';

export default function App() {
  const [user, setUser] = useState(() => (session.access ? session.user : null));

  // The API layer fires this event when the session can no longer be refreshed.
  useEffect(() => {
    const onLogout = () => setUser(null);
    window.addEventListener('auth:logout', onLogout);
    return () => window.removeEventListener('auth:logout', onLogout);
  }, []);

  const handleLogout = async () => {
    await logout();
    setUser(null);
  };

  if (!user) return <Login onLoggedIn={setUser} />;

  return (
    <div className="container">
      <header className="topbar">
        <h1>Product Management</h1>
        <div className="topbar-right">
          <span>Signed in as <strong>{user.username}</strong></span>
          <button className="btn btn-outline" onClick={handleLogout}>Logout</button>
        </div>
      </header>
      <ProductList />
    </div>
  );
}
