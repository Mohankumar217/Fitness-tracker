import React from 'react';
import BottomNav from './BottomNav';
import styles from './AppShell.module.css';

export default function AppShell({ children }) {
  return (
    <div className={styles.wrapper}>
      <main className={styles.mainContent}>
        {children}
      </main>
      <BottomNav />
    </div>
  );
}
