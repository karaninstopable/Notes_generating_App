import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import styles from './AuthPage.module.css';

const RegisterPage = () => {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', email: '', password: '', confirm: '' });
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name || !form.email || !form.password || !form.confirm)
      return toast.error('Please fill in all fields');
    if (form.password.length < 6)
      return toast.error('Password must be at least 6 characters');
    if (form.password !== form.confirm)
      return toast.error('Passwords do not match');

    setLoading(true);
    try {
      await register(form.name, form.email, form.password);
      toast.success('Account created! Welcome to NoteVault');
      navigate('/notes');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  const strength = (() => {
    const p = form.password;
    if (!p) return 0;
    let s = 0;
    if (p.length >= 6) s++;
    if (p.length >= 10) s++;
    if (/[A-Z]/.test(p) && /[0-9]/.test(p)) s++;
    if (/[^A-Za-z0-9]/.test(p)) s++;
    return s;
  })();

  const strengthLabel = ['', 'Weak', 'Fair', 'Good', 'Strong'][strength];
  const strengthColor = ['', '#f38ba8', '#f9e2af', '#a6e3a1', '#a6e3a1'][strength];

  return (
    <div className={styles.page}>
      <div className={styles.card}>
        <div className={styles.header}>
          <div className={styles.logo}>✦</div>
          <h1 className={styles.title}>NoteVault</h1>
          <p className={styles.subtitle}>Create your account</p>
        </div>

        <form onSubmit={handleSubmit} className={styles.form}>
          <div className={styles.field}>
            <label className={styles.label}>Full Name</label>
            <input
              type="text"
              name="name"
              value={form.name}
              onChange={handleChange}
              placeholder="Jane Doe"
              className={styles.input}
              autoComplete="name"
            />
          </div>

          <div className={styles.field}>
            <label className={styles.label}>Email</label>
            <input
              type="email"
              name="email"
              value={form.email}
              onChange={handleChange}
              placeholder="you@example.com"
              className={styles.input}
              autoComplete="email"
            />
          </div>

          <div className={styles.field}>
            <label className={styles.label}>Password</label>
            <div className={styles.passwordWrap}>
              <input
                type={showPassword ? 'text' : 'password'}
                name="password"
                value={form.password}
                onChange={handleChange}
                placeholder="Min. 6 characters"
                className={styles.input}
                autoComplete="new-password"
              />
              <button
                type="button"
                className={styles.eyeBtn}
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? '🙈' : '👁️'}
              </button>
            </div>
            {form.password && (
              <div className={styles.strengthBar}>
                <div
                  className={styles.strengthFill}
                  style={{ width: `${(strength / 4) * 100}%`, background: strengthColor }}
                />
                <span className={styles.strengthLabel} style={{ color: strengthColor }}>
                  {strengthLabel}
                </span>
              </div>
            )}
          </div>

          <div className={styles.field}>
            <label className={styles.label}>Confirm Password</label>
            <input
              type="password"
              name="confirm"
              value={form.confirm}
              onChange={handleChange}
              placeholder="Re-enter password"
              className={`${styles.input} ${form.confirm && form.confirm !== form.password ? styles.inputError : ''}`}
              autoComplete="new-password"
            />
          </div>

          <button type="submit" className={styles.submitBtn} disabled={loading}>
            {loading ? <span className={styles.btnSpinner} /> : 'Create Account'}
          </button>
        </form>

        <p className={styles.switchText}>
          Already have an account?{' '}
          <Link to="/login" className={styles.link}>Sign in</Link>
        </p>
      </div>
    </div>
  );
};

export default RegisterPage;
