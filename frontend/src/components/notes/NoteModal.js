import React, { useState, useEffect } from 'react';
import styles from './NoteModal.module.css';

const COLORS = [
  { value: '#ffffff', label: 'Default' },
  { value: '#fef3c7', label: 'Yellow' },
  { value: '#dbeafe', label: 'Blue' },
  { value: '#dcfce7', label: 'Green' },
  { value: '#fce7f3', label: 'Pink' },
  { value: '#ede9fe', label: 'Purple' },
  { value: '#fee2e2', label: 'Red' },
  { value: '#ffedd5', label: 'Orange' },
];

const NoteModal = ({ note, onClose, onSave, loading }) => {
  const [form, setForm] = useState({
    title: '',
    content: '',
    tags: '',
    color: '#ffffff',
    isPinned: false,
  });

  useEffect(() => {
    if (note) {
      setForm({
        title: note.title || '',
        content: note.content || '',
        tags: note.tags?.join(', ') || '',
        color: note.color || '#ffffff',
        isPinned: note.isPinned || false,
      });
    }
  }, [note]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const tagsArray = form.tags
      .split(',')
      .map((t) => t.trim().toLowerCase())
      .filter(Boolean);
    onSave({ ...form, tags: tagsArray });
  };

  return (
    <div className={styles.overlay} onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className={styles.modal}>
        <div className={styles.modalHeader}>
          <h2 className={styles.modalTitle}>{note?._id ? 'Edit Note' : 'New Note'}</h2>
          <button className={styles.closeBtn} onClick={onClose}>✕</button>
        </div>

        <form onSubmit={handleSubmit} className={styles.form}>
          <div className={styles.field}>
            <label className={styles.label}>Title <span className={styles.required}>*</span></label>
            <input
              type="text"
              name="title"
              value={form.title}
              onChange={handleChange}
              placeholder="Note title..."
              className={styles.input}
              required
              maxLength={100}
              autoFocus
            />
          </div>

          <div className={styles.field}>
            <label className={styles.label}>Content <span className={styles.required}>*</span></label>
            <textarea
              name="content"
              value={form.content}
              onChange={handleChange}
              placeholder="Write your note here..."
              className={styles.textarea}
              required
              rows={6}
              maxLength={10000}
            />
            <span className={styles.charCount}>{form.content.length}/10000</span>
          </div>

          <div className={styles.field}>
            <label className={styles.label}>Tags <span className={styles.hint}>(comma separated)</span></label>
            <input
              type="text"
              name="tags"
              value={form.tags}
              onChange={handleChange}
              placeholder="work, ideas, personal..."
              className={styles.input}
            />
          </div>

          <div className={styles.field}>
            <label className={styles.label}>Color</label>
            <div className={styles.colorPicker}>
              {COLORS.map((c) => (
                <button
                  key={c.value}
                  type="button"
                  title={c.label}
                  className={`${styles.colorSwatch} ${form.color === c.value ? styles.colorSelected : ''}`}
                  style={{ background: c.value }}
                  onClick={() => setForm((prev) => ({ ...prev, color: c.value }))}
                />
              ))}
            </div>
          </div>

          <label className={styles.checkboxLabel}>
            <input
              type="checkbox"
              name="isPinned"
              checked={form.isPinned}
              onChange={handleChange}
              className={styles.checkbox}
            />
            <span>📌 Pin this note</span>
          </label>

          <div className={styles.modalActions}>
            <button type="button" className={styles.cancelBtn} onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className={styles.saveBtn} disabled={loading}>
              {loading ? <span className={styles.btnSpinner} /> : note?._id ? 'Save Changes' : 'Create Note'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default NoteModal;
