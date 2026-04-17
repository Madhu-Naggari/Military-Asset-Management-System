import { NavLink, Outlet } from 'react-router-dom';
import { FaArrowRightFromBracket, FaShieldHalved } from 'react-icons/fa6';

import ThemeToggle from '../components/ThemeToggle.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import { getNavigationItems } from '../data/navigation.js';

const formatRole = (role) =>
  role
    .split('_')
    .map((segment) => segment.charAt(0).toUpperCase() + segment.slice(1))
    .join(' ');

const AppShell = () => {
  const { user, logout } = useAuth();
  const navigationItems = getNavigationItems(user.role);

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div>
          <div className="brand-mark">
            <FaShieldHalved />
            <div>
              <strong>Military Asset</strong>
              <span>Management System</span>
            </div>
          </div>

          <nav className="nav-list">
            {navigationItems.map((item) => {
              const Icon = item.icon;

              return (
                <NavLink
                  key={item.path}
                  to={item.path}
                  className={({ isActive }) => (isActive ? 'nav-item active' : 'nav-item')}
                >
                  <Icon />
                  <span>{item.label}</span>
                </NavLink>
              );
            })}
          </nav>
        </div>

        <div className="sidebar-footer">
          <div className="operator-card">
            <strong>{user.name}</strong>
            <span>{formatRole(user.role)}</span>
            <small>{user.assignedBase?.name || 'Global access'}</small>
          </div>
          <ThemeToggle />
          <button type="button" className="logout-button" onClick={logout}>
            <FaArrowRightFromBracket />
            <span>Logout</span>
          </button>
        </div>
      </aside>

      <main className="page-content">
        <Outlet />
      </main>
    </div>
  );
};

export default AppShell;
