import { useEffect } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';

const TABS = [
  { to: '/admin', label: 'Resumen', end: true },
  { to: '/admin/classes', label: 'Clases', end: false },
  { to: '/admin/subjects', label: 'Asignaturas', end: false },
];

export default function AdminShell() {
  const { user, loading, logout } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && !user) navigate('/login', { replace: true });
  }, [loading, user, navigate]);

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  if (loading) return <div className="loading">Cargando...</div>;
  if (!user) return null;

  return (
    <div className="adm-shell">
      <div className="adm-masthead">
        <div className="adm-masthead-top">
          <div className="adm-masthead-brand">
            <span className="adm-eyebrow adm-eyebrow--light">ClassHub · archivo digital</span>
            <p className="adm-masthead-title">Panel de control</p>
            <span className="adm-masthead-user">{user.name || user.email}</span>
          </div>
          <button type="button" className="adm-signout" onClick={handleLogout}>
            Cerrar sesión
          </button>
        </div>
        <nav className="adm-tabs" aria-label="Secciones del panel">
          {TABS.map((tab) => (
            <NavLink
              key={tab.to}
              to={tab.to}
              end={tab.end}
              className={({ isActive }) => `adm-tab${isActive ? ' is-active' : ''}`}
            >
              {tab.label}
            </NavLink>
          ))}
        </nav>
      </div>
      <div className="adm-body">
        <Outlet />
      </div>
    </div>
  );
}
