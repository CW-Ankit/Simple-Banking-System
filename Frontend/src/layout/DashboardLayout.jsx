import { NavLink, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const links = [
  { to: '/dashboard', label: 'Overview' },
  { to: '/dashboard/accounts', label: 'Accounts' },
  { to: '/dashboard/transfers', label: 'Transfers' },
  { to: '/dashboard/transactions', label: 'Transactions' },
];

export default function DashboardLayout() {
  const { userEmail, logout } = useAuth();

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="brand">Banking Desk</div>
        <p className="sidebar__subtext">Secure, realtime money movement</p>

        <nav className="sidebar__nav">
          {links.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              end={link.to === '/dashboard'}
              className={({ isActive }) => `nav-link ${isActive ? 'nav-link--active' : ''}`}
            >
              {link.label}
            </NavLink>
          ))}
        </nav>

        <button className="ghost-button" onClick={logout}>
          Logout
        </button>
      </aside>

      <main className="main-content">
        <header className="topbar">
          <div>
            <h1>Welcome back</h1>
            <p>{userEmail || 'Authenticated session'}</p>
          </div>
        </header>

        <section className="page-card">
          <Outlet />
        </section>
      </main>
    </div>
  );
}
