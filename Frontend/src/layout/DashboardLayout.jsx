import { NavLink, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

<<<<<<< HEAD
const links = [
=======
const userLinks = [
>>>>>>> c1a4beb3d2eda78b35b34ac0d2f992b54be6aecc
  { to: '/dashboard', label: 'Overview' },
  { to: '/dashboard/accounts', label: 'Accounts' },
  { to: '/dashboard/transfers', label: 'Transfers' },
  { to: '/dashboard/transactions', label: 'Transactions' },
];

<<<<<<< HEAD
export default function DashboardLayout() {
  const { userEmail, logout } = useAuth();
=======
const adminLinks = [
  { to: '/dashboard', label: 'Overview' },
  { to: '/dashboard/accounts', label: 'Manage Accounts' },
  { to: '/dashboard/transfers', label: 'Transfers & Funding' },
  { to: '/dashboard/transactions', label: 'Transactions' },
  { to: '/dashboard/admin/users', label: 'Manage Users' },
];

export default function DashboardLayout() {
  const { userEmail, userName, isSystemUser, logout } = useAuth();
  const links = isSystemUser ? adminLinks : userLinks;
>>>>>>> c1a4beb3d2eda78b35b34ac0d2f992b54be6aecc

  return (
    <div className="app-shell">
      <aside className="sidebar">
<<<<<<< HEAD
        <div className="brand">Banking Desk</div>
        <p className="sidebar__subtext">Secure, realtime money movement</p>
=======
        <div className="brand">{isSystemUser ? 'Banking Admin Desk' : 'Banking Desk'}</div>
        <p className="sidebar__subtext">
          {isSystemUser ? 'System user controls enabled' : 'Secure, realtime money movement'}
        </p>
>>>>>>> c1a4beb3d2eda78b35b34ac0d2f992b54be6aecc

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
<<<<<<< HEAD
            <h1>Welcome back</h1>
=======
            <h1>Welcome back{userName ? `, ${userName}` : ''}</h1>
>>>>>>> c1a4beb3d2eda78b35b34ac0d2f992b54be6aecc
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
