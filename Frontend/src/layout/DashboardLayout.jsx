import { useState } from 'react';
import { NavLink, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const userLinks = [
  { to: '/dashboard', label: 'Overview' },
  { to: '/dashboard/accounts', label: 'Accounts' },
  { to: '/dashboard/transfers', label: 'Transfers' },
  { to: '/dashboard/transactions', label: 'Transactions' },
];

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
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const closeSidebar = () => setIsSidebarOpen(false);

  return (
    <div className="app-shell">
      <header className="mobile-nav">
        <button
          type="button"
          className="icon-button"
          aria-label="Open navigation menu"
          aria-expanded={isSidebarOpen}
          onClick={() => setIsSidebarOpen((prev) => !prev)}
        >
          ☰
        </button>
        <p className="mobile-nav__title">{isSystemUser ? 'Banking Admin Desk' : 'Banking Desk'}</p>
        <button type="button" className="icon-button" aria-label="Logout" onClick={logout}>
          ⎋
        </button>
      </header>

      <aside className={`sidebar ${isSidebarOpen ? 'sidebar--open' : ''}`}>
        <div className="brand">{isSystemUser ? 'Banking Admin Desk' : 'Banking Desk'}</div>
        <p className="sidebar__subtext">
          {isSystemUser ? 'System user controls enabled' : 'Secure, realtime money movement'}
        </p>

        <nav className="sidebar__nav">
          {links.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              end={link.to === '/dashboard'}
              className={({ isActive }) => `nav-link ${isActive ? 'nav-link--active' : ''}`}
              onClick={closeSidebar}
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
            <h1>Welcome back{userName ? `, ${userName}` : ''}</h1>
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
