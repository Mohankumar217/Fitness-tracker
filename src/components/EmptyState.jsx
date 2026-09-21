import React from 'react';
import styles from './EmptyState.module.css';

export default function EmptyState({
  emoji = '🌱',
  title = 'Your day is wide open',
  description = 'Add your first fitness activity to start tracking your progress.',
  actionText,
  onAction,
}) {
  return (
    <div className={styles.container}>
      <div className={styles.emoji}>{emoji}</div>
      <h3 className={styles.title}>{title}</h3>
      <p className={styles.description}>{description}</p>
      {actionText && onAction && (
        <button type="button" className={styles.actionBtn} onClick={onAction}>
          {actionText}
        </button>
      )}
    </div>
  );
}
