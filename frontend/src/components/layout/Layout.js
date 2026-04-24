import React, { useState } from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import styles from './Layout.module.css';

const Layout = () => {
  const { user, logout, isAdmin } = useAuth();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className={styles.shell}>
      <nav className={styles.sidebar}>
        <div className={styles.brand}>
          <span className={styles.brandIcon}>✦</span>
          <span className={styles.brandName}>NoteVault</span>
        </div>

        <div className={styles.navLinks}>
          <NavLink to="/notes" className={({ isActive }) => `${styles.navItem} ${isActive ? styles.active : ''}`}>
            <span className={styles.navIcon}>📝</span>
            <span>My Notes</span>
          </NavLink>
          {isAdmin && (
            <NavLink to="/admin" className={({ isActive }) => `${styles.navItem} ${isActive ? styles.active : ''}`}>
              <span className={styles.navIcon}>⚙️</span>
              <span>Admin Panel</span>
            </NavLink>
          )}
        </div>

        <div className={styles.userArea}>
          <div className={styles.avatar}>{user?.name?.[0]?.toUpperCase()}</div>
          <div className={styles.userInfo}>
            <span className={styles.userName}>{user?.name}</span>
            <span className={`${styles.userRole} ${isAdmin ? styles.adminBadge : styles.userBadge}`}>
              {user?.role}
            </span>
          </div>
          <button onClick={handleLogout} className={styles.logoutBtn} title="Logout">
            ⎋
          </button>
        </div>
      </nav>

      {/* Mobile header */}
      <header className={styles.mobileHeader}>
        <span className={styles.brandName}>✦ NoteVault</span>
        <button className={styles.menuBtn} onClick={() => setMenuOpen(!menuOpen)}>☰</button>
      </header>

      {menuOpen && (
        <div className={styles.mobileMenu}>
          <NavLink to="/notes" onClick={() => setMenuOpen(false)} className={styles.mobileNavItem}>📝 My Notes</NavLink>
          {isAdmin && <NavLink to="/admin" onClick={() => setMenuOpen(false)} className={styles.mobileNavItem}>⚙️ Admin Panel</NavLink>}
          <button onClick={handleLogout} className={styles.mobileLogout}>⎋ Logout</button>
        </div>
      )}

      <main className={styles.main}>
        <Outlet />
      </main>
    </div>
  );
};

export default Layout;
