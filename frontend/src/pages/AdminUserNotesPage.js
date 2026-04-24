import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { usersAPI, notesAPI } from '../utils/api';
import NoteCard from '../components/notes/NoteCard';
import NoteModal from '../components/notes/NoteModal';
import LoadingSpinner from '../components/layout/LoadingSpinner';
import toast from 'react-hot-toast';
import styles from './AdminUserNotesPage.module.css';

const AdminUserNotesPage = () => {
  const { userId } = useParams();
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editNote, setEditNote] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const load = async () => {
      try {
        const [userRes, notesRes] = await Promise.all([
          usersAPI.getOne(userId),
          usersAPI.getNotes(userId)
        ]);
        setUser(userRes.data.user);
        setNotes(notesRes.data.notes);
      } catch {
        toast.error('Failed to load user data');
        navigate('/admin');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [userId, navigate]);

  const handleOpenEdit = (note) => { setEditNote(note); setModalOpen(true); };
  const handleClose = () => { setEditNote(null); setModalOpen(false); };

  const handleSave = async (formData) => {
    if (!editNote?._id) return;
    setSaving(true);
    try {
      const { data } = await notesAPI.update(editNote._id, formData);
      setNotes((prev) => prev.map((n) => n._id === editNote._id ? data.note : n));
      toast.success('Note updated');
      handleClose();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update note');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      await notesAPI.delete(id);
      setNotes((prev) => prev.filter((n) => n._id !== id));
      toast.success('Note deleted');
    } catch {
      toast.error('Failed to delete note');
    }
  };

  const handleTogglePin = async (id) => {
    try {
      const { data } = await notesAPI.togglePin(id);
      setNotes((prev) =>
        prev.map((n) => n._id === id ? data.note : n)
          .sort((a, b) => b.isPinned - a.isPinned || new Date(b.updatedAt) - new Date(a.updatedAt))
      );
      toast.success(data.message);
    } catch {
      toast.error('Failed to toggle pin');
    }
  };

  if (loading) return <LoadingSpinner />;

  return (
    <div className={styles.page}>
      <button className={styles.backBtn} onClick={() => navigate('/admin')}>
        ← Back to Admin Panel
      </button>

      <div className={styles.userHeader}>
        <div className={styles.avatar}>{user?.name?.[0]?.toUpperCase()}</div>
        <div>
          <h1 className={styles.heading}>{user?.name}</h1>
          <div className={styles.meta}>
            <span className={styles.email}>{user?.email}</span>
            <span className={`${styles.roleBadge} ${user?.role === 'admin' ? styles.adminBadge : styles.userBadge}`}>
              {user?.role}
            </span>
            <span className={`${styles.statusBadge} ${user?.isActive ? styles.active : styles.inactive}`}>
              {user?.isActive ? 'Active' : 'Inactive'}
            </span>
          </div>
        </div>
      </div>

      <div className={styles.notesHeader}>
        <h2 className={styles.notesTitle}>
          📝 Notes <span className={styles.count}>({notes.length})</span>
        </h2>
        <p className={styles.notesSubtitle}>As admin, you can edit or delete any note.</p>
      </div>

      {notes.length === 0 ? (
        <div className={styles.empty}>
          <div className={styles.emptyIcon}>📭</div>
          <h3>No notes yet</h3>
          <p>This user hasn't created any notes.</p>
        </div>
      ) : (
        <div className={styles.grid}>
          {notes.map((note) => (
            <NoteCard
              key={note._id}
              note={note}
              onEdit={handleOpenEdit}
              onDelete={handleDelete}
              onTogglePin={handleTogglePin}
              isAdmin={false}
            />
          ))}
        </div>
      )}

      {modalOpen && (
        <NoteModal
          note={editNote}
          onClose={handleClose}
          onSave={handleSave}
          loading={saving}
        />
      )}
    </div>
  );
};

export default AdminUserNotesPage;
