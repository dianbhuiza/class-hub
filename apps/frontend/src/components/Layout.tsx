import { Link, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

export default function Layout() {
  const { user, logout } = useAuth();
  const location = useLocation();
  const isAdmin = location.pathname.startsWith('/admin');
  const isPlaylist = location.pathname.includes('/playlist');

  return (
    <div className={`layout${isPlaylist ? ' layout--playlist' : ''}`}>
      <header className="header">
        <Link to="/" className="logo">
          <span className="logo-icon">📖</span>
          <span>ClassHub</span>
        </Link>
        <nav>
          {user ? (
            <>
              <Link to="/admin" className={`nav-link ${isAdmin ? 'active' : ''}`}>
                Panel
              </Link>
              <button onClick={logout} className="nav-link btn-logout">
                Salir
              </button>
            </>
          ) : (
            <Link to="/login" className="nav-link">
              Admin
            </Link>
          )}
        </nav>
      </header>
      <main className={`main${isPlaylist ? ' main-wide' : ''}`}>
        <Outlet />
      </main>
    </div>
  );
}
