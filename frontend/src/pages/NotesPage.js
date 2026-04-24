import React, { useState, useEffect, useCallback } from 'react';
import { notesAPI } from '../utils/api';
import { useAuth } from '../context/AuthContext';
import NoteCard from '../components/notes/NoteCard';
import NoteModal from '../components/notes/NoteModal';
import LoadingSpinner from '../components/layout/LoadingSpinner';
import toast from 'react-hot-toast';
import styles from './NotesPage.module.css';

const NotesPage = () => {
  const { user, isAdmin } = useAuth();
  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editNote, setEditNote] = useState(null);
  const [saving, setSaving] = useState(false);
  const [search, setSearch] = useState('');
  const [searchInput, setSearchInput] = useState('');
  const [stats, setStats] = useState({ total: 0, pinned: 0 });

  const fetchNotes = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await notesAPI.getAll({ search });
      setNotes(data.notes);
      setStats({
        total: data.total,
        pinned: data.notes.filter((n) => n.isPinned).length,
      });
    } catch {
      toast.error('Failed to load notes');
    } finally {
      setLoading(false);
    }
  }, [search]);

  useEffect(() => { fetchNotes(); }, [fetchNotes]);

  // Debounce search
  useEffect(() => {
    const t = setTimeout(() => setSearch(searchInput), 400);
    return () => clearTimeout(t);
  }, [searchInput]);

  const handleOpenCreate = () => { setEditNote(null); setModalOpen(true); };
  const handleOpenEdit = (note) => { setEditNote(note); setModalOpen(true); };
  const handleClose = () => { setModalOpen(false); setEditNote(null); };

  const handleSave = async (formData) => {
    setSaving(true);
    try {
      if (editNote?._id) {
        const { data } = await notesAPI.update(editNote._id, formData);
        setNotes((prev) => prev.map((n) => n._id === editNote._id ? data.note : n));
        toast.success('Note updated');
      } else {
        const { data } = await notesAPI.create(formData);
        setNotes((prev) => [data.note, ...prev]);
        toast.success('Note created');
      }
      handleClose();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save note');
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
      setNotes((prev) => {
        const updated = prev.map((n) => n._id === id ? data.note : n);
        return [...updated].sort((a, b) => b.isPinned - a.isPinned || new Date(b.updatedAt) - new Date(a.updatedAt));
      });
      toast.success(data.message);
    } catch {
      toast.error('Failed to toggle pin');
    }
  };

  const pinnedNotes = notes.filter((n) => n.isPinned);
  const unpinnedNotes = notes.filter((n) => !n.isPinned);

  return (
    <div className={styles.page}>
      {/* Header */}
      <div className={styles.header}>
        <div>
          <h1 className={styles.heading}>
            {isAdmin ? 'All Notes' : 'My Notes'}
          </h1>
          <p className={styles.subheading}>
            {isAdmin ? `Managing notes across all users` : `Welcome back, ${user?.name?.split(' ')[0]}`}
          </p>
        </div>
        <button className={styles.createBtn} onClick={handleOpenCreate}>
          <span>+</span> New Note
        </button>
      </div>

      {/* Stats row */}
      <div className={styles.statsRow}>
        <div className={styles.statChip}>
          <span className={styles.statNum}>{stats.total}</span>
          <span className={styles.statLabel}>Total</span>
        </div>
        <div className={styles.statChip}>
          <span className={styles.statNum}>{stats.pinned}</span>
          <span className={styles.statLabel}>Pinned</span>
        </div>
        {isAdmin && (
          <div className={`${styles.statChip} ${styles.adminChip}`}>
            <span>⚙️ Admin View</span>
          </div>
        )}
      </div>

      {/* Search */}
      <div className={styles.searchWrap}>
        <span className={styles.searchIcon}>🔍</span>
        <input
          type="text"
          placeholder="Search notes by title or content…"
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
          className={styles.searchInput}
        />
        {searchInput && (
          <button className={styles.clearSearch} onClick={() => { setSearchInput(''); setSearch(''); }}>✕</button>
        )}
      </div>

      {/* Content */}
      {loading ? (
        <LoadingSpinner fullScreen={false} size={36} />
      ) : notes.length === 0 ? (
        <div className={styles.empty}>
          <div className={styles.emptyIcon}>📝</div>
          <h3>{search ? 'No notes match your search' : 'No notes yet'}</h3>
          <p>{search ? 'Try a different keyword' : 'Create your first note to get started'}</p>
          {!search && (
            <button className={styles.createBtn} onClick={handleOpenCreate}>
              + Create Note
            </button>
          )}
        </div>
      ) : (
        <>
          {pinnedNotes.length > 0 && (
            <section className={styles.section}>
              <h2 className={styles.sectionTitle}>📌 Pinned</h2>
              <div className={styles.grid}>
                {pinnedNotes.map((note) => (
                  <NoteCard
                    key={note._id}
                    note={note}
                    onEdit={handleOpenEdit}
                    onDelete={handleDelete}
                    onTogglePin={handleTogglePin}
                    isAdmin={isAdmin}
                  />
                ))}
              </div>
            </section>
          )}
          {unpinnedNotes.length > 0 && (
            <section className={styles.section}>
              {pinnedNotes.length > 0 && <h2 className={styles.sectionTitle}>All Notes</h2>}
              <div className={styles.grid}>
                {unpinnedNotes.map((note) => (
                  <NoteCard
                    key={note._id}
                    note={note}
                    onEdit={handleOpenEdit}
                    onDelete={handleDelete}
                    onTogglePin={handleTogglePin}
                    isAdmin={isAdmin}
                  />
                ))}
              </div>
            </section>
          )}
        </>
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

export default NotesPage;
