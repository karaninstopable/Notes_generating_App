import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { usersAPI } from '../utils/api';
import { useAuth } from '../context/AuthContext';
import LoadingSpinner from '../components/layout/LoadingSpinner';
import toast from 'react-hot-toast';
import styles from './AdminPage.module.css';

const AdminPage = () => {
  const { user: currentUser } = useAuth();
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [searchInput, setSearchInput] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [stats, setStats] = useState({ total: 0, admins: 0, active: 0 });
  const [actionLoading, setActionLoading] = useState(null);

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await usersAPI.getAll({ search, role: roleFilter });
      setUsers(data.users);
      setStats({
        total: data.total,
        admins: data.users.filter((u) => u.role === 'admin').length,
        active: data.users.filter((u) => u.isActive).length,
      });
    } catch {
      toast.error('Failed to fetch users');
    } finally {
      setLoading(false);
    }
  }, [search, roleFilter]);

  useEffect(() => { fetchUsers(); }, [fetchUsers]);

  useEffect(() => {
    const t = setTimeout(() => setSearch(searchInput), 400);
    return () => clearTimeout(t);
  }, [searchInput]);

  const handleToggleRole = async (userId, currentRole) => {
    const newRole = currentRole === 'admin' ? 'user' : 'admin';
    setActionLoading(userId + '-role');
    try {
      const { data } = await usersAPI.updateRole(userId, newRole);
      setUsers((prev) => prev.map((u) => u._id === userId ? { ...u, role: data.user.role } : u));
      toast.success(`Role updated to ${newRole}`);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update role');
    } finally {
      setActionLoading(null);
    }
  };

  const handleToggleStatus = async (userId) => {
    setActionLoading(userId + '-status');
    try {
      const { data } = await usersAPI.toggleStatus(userId);
      setUsers((prev) => prev.map((u) => u._id === userId ? { ...u, isActive: data.user.isActive } : u));
      toast.success(data.message);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update status');
    } finally {
      setActionLoading(null);
    }
  };

  const handleDelete = async (userId, userName) => {
    if (!window.confirm(`Delete user "${userName}" and ALL their notes? This cannot be undone.`)) return;
    setActionLoading(userId + '-delete');
    try {
      await usersAPI.delete(userId);
      setUsers((prev) => prev.filter((u) => u._id !== userId));
      toast.success('User deleted successfully');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to delete user');
    } finally {
      setActionLoading(null);
    }
  };

  const formatDate = (d) => new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <div>
          <h1 className={styles.heading}>Admin Panel</h1>
          <p className={styles.subheading}>Manage users and their notes</p>
        </div>
      </div>

      {/* Stats */}
      <div className={styles.statsGrid}>
        <div className={styles.statCard}>
          <span className={styles.statIcon}>👥</span>
          <div>
            <div className={styles.statValue}>{stats.total}</div>
            <div className={styles.statLabel}>Total Users</div>
          </div>
        </div>
        <div className={styles.statCard}>
          <span className={styles.statIcon}>⚙️</span>
          <div>
            <div className={styles.statValue}>{stats.admins}</div>
            <div className={styles.statLabel}>Admins</div>
          </div>
        </div>
        <div className={styles.statCard}>
          <span className={styles.statIcon}>✅</span>
          <div>
            <div className={styles.statValue}>{stats.active}</div>
            <div className={styles.statLabel}>Active</div>
          </div>
        </div>
        <div className={styles.statCard}>
          <span className={styles.statIcon}>🚫</span>
          <div>
            <div className={styles.statValue}>{stats.total - stats.active}</div>
            <div className={styles.statLabel}>Inactive</div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className={styles.filterBar}>
        <div className={styles.searchWrap}>
          <span className={styles.searchIcon}>🔍</span>
          <input
            type="text"
            placeholder="Search users by name or email…"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            className={styles.searchInput}
          />
        </div>
        <select
          value={roleFilter}
          onChange={(e) => setRoleFilter(e.target.value)}
          className={styles.select}
        >
          <option value="">All Roles</option>
          <option value="user">Users</option>
          <option value="admin">Admins</option>
        </select>
      </div>

      {/* Table */}
      {loading ? (
        <LoadingSpinner fullScreen={false} size={36} />
      ) : users.length === 0 ? (
        <div className={styles.empty}>
          <div className={styles.emptyIcon}>👥</div>
          <h3>No users found</h3>
          <p>Try adjusting your search or filters</p>
        </div>
      ) : (
        <div className={styles.tableWrapper}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>User</th>
                <th>Role</th>
                <th>Status</th>
                <th>Notes</th>
                <th>Joined</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => {
                const isSelf = u._id === currentUser._id;
                return (
                  <tr key={u._id} className={!u.isActive ? styles.inactiveRow : ''}>
                    <td>
                      <div className={styles.userCell}>
                        <div className={styles.avatar}>{u.name?.[0]?.toUpperCase()}</div>
                        <div>
                          <div className={styles.userName}>
                            {u.name}
                            {isSelf && <span className={styles.youBadge}>You</span>}
                          </div>
                          <div className={styles.userEmail}>{u.email}</div>
                        </div>
                      </div>
                    </td>
                    <td>
                      <span className={`${styles.roleBadge} ${u.role === 'admin' ? styles.adminBadge : styles.userBadge}`}>
                        {u.role}
                      </span>
                    </td>
                    <td>
                      <span className={`${styles.statusDot} ${u.isActive ? styles.active : styles.inactive}`}>
                        {u.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td>
                      <button
                        className={styles.notesBtn}
                        onClick={() => navigate(`/admin/users/${u._id}/notes`)}
                        title="View notes"
                      >
                        📝 {u.noteCount ?? 0}
                      </button>
                    </td>
                    <td className={styles.dateCell}>{formatDate(u.createdAt)}</td>
                    <td>
                      <div className={styles.actions}>
                        {!isSelf && (
                          <>
                            <button
                              className={styles.actionBtn}
                              onClick={() => handleToggleRole(u._id, u.role)}
                              disabled={actionLoading === u._id + '-role'}
                              title={`Make ${u.role === 'admin' ? 'User' : 'Admin'}`}
                            >
                              {actionLoading === u._id + '-role' ? '…' : u.role === 'admin' ? '👤' : '🛡️'}
                            </button>
                            <button
                              className={`${styles.actionBtn} ${!u.isActive ? styles.activateBtn : styles.deactivateBtn}`}
                              onClick={() => handleToggleStatus(u._id)}
                              disabled={actionLoading === u._id + '-status'}
                              title={u.isActive ? 'Deactivate' : 'Activate'}
                            >
                              {actionLoading === u._id + '-status' ? '…' : u.isActive ? '🚫' : '✅'}
                            </button>
                            <button
                              className={`${styles.actionBtn} ${styles.deleteBtn}`}
                              onClick={() => handleDelete(u._id, u.name)}
                              disabled={actionLoading === u._id + '-delete'}
                              title="Delete user"
                            >
                              {actionLoading === u._id + '-delete' ? '…' : '🗑️'}
                            </button>
                          </>
                        )}
                        {isSelf && <span className={styles.selfNote}>—</span>}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default AdminPage;
