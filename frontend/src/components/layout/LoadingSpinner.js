import React from 'react';
import styles from './LoadingSpinner.module.css';

const LoadingSpinner = ({ fullScreen = true, size = 40 }) => {
  if (fullScreen) {
    return (
      <div className={styles.fullScreen}>
        <div className={styles.wrapper}>
          <div className={styles.spinner} style={{ width: size, height: size }} />
          <span className={styles.label}>Loading…</span>
        </div>
      </div>
    );
  }
  return <div className={styles.spinner} style={{ width: size, height: size }} />;
};

export default LoadingSpinner;
