import React, { useState } from 'react';
import styles from './NoteCard.module.css';

const COLOR_MAP = {
  '#ffffff': '#ffffff',
  '#fef3c7': '#fef3c7',
  '#dbeafe': '#dbeafe',
  '#dcfce7': '#dcfce7',
  '#fce7f3': '#fce7f3',
  '#ede9fe': '#ede9fe',
  '#fee2e2': '#fee2e2',
  '#ffedd5': '#ffedd5',
};

const formatDate = (d) => {
  const date = new Date(d);
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
};

const NoteCard = ({ note, onEdit, onDelete, onTogglePin, isAdmin }) => {
  const [confirmDelete, setConfirmDelete] = useState(false);

  const bgStyle = {
    borderLeft: `3px solid ${note.color !== '#ffffff' ? note.color : 'var(--surface1)'}`,
  };

  const handleDelete = () => {
    if (confirmDelete) {
      onDelete(note._id);
    } else {
      setConfirmDelete(true);
      setTimeout(() => setConfirmDelete(false), 3000);
    }
  };

  return (
    <div className={`${styles.card} fade-in`} style={bgStyle}>
      {note.isPinned && <span className={styles.pinBadge}>📌</span>}

      {isAdmin && note.user && (
        <div className={styles.ownerBadge}>
          <span className={styles.ownerAvatar}>{note.user.name?.[0]?.toUpperCase()}</span>
          <span className={styles.ownerName}>{note.user.name}</span>
        </div>
      )}

      <h3 className={styles.title}>{note.title}</h3>
      <p className={styles.content}>{note.content}</p>

      {note.tags?.length > 0 && (
        <div className={styles.tags}>
          {note.tags.map((tag) => (
            <span key={tag} className={styles.tag}>#{tag}</span>
          ))}
        </div>
      )}

      <div className={styles.footer}>
        <span className={styles.date}>{formatDate(note.updatedAt)}</span>
        <div className={styles.actions}>
          <button
            className={`${styles.actionBtn} ${note.isPinned ? styles.pinned : ''}`}
            onClick={() => onTogglePin(note._id)}
            title={note.isPinned ? 'Unpin' : 'Pin'}
          >
            📌
          </button>
          <button className={styles.actionBtn} onClick={() => onEdit(note)} title="Edit">
            ✏️
          </button>
          <button
            className={`${styles.actionBtn} ${confirmDelete ? styles.confirmDelete : ''}`}
            onClick={handleDelete}
            title={confirmDelete ? 'Click again to confirm' : 'Delete'}
          >
            {confirmDelete ? '⚠️' : '🗑️'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default NoteCard;
