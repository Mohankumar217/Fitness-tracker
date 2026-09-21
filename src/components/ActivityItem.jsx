import React from 'react';
import { Check, Clock, Trash2 } from 'lucide-react';
import styles from './ActivityItem.module.css';

export default function ActivityItem({
  activity,
  onToggle,
  onDelete,
  readOnly = false,
}) {
  const isCompleted = !!activity.completed;

  // Format 24hr reminder time to 12hr AM/PM for display
  const formatReminderTime = (timeStr) => {
    if (!timeStr) return null;
    const [h, m] = timeStr.split(':').map(Number);
    const ampm = h >= 12 ? 'PM' : 'AM';
    const hour12 = h % 12 || 12;
    return `${hour12}:${String(m).padStart(2, '0')} ${ampm}`;
  };

  const handleCheckboxClick = (e) => {
    e.stopPropagation();
    if (!readOnly && onToggle) {
      onToggle(activity.id);
    }
  };

  return (
    <div
      className={`${styles.card} ${isCompleted ? styles.completed : ''}`}
      onClick={handleCheckboxClick}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === ' ' || e.key === 'Enter') {
          e.preventDefault();
          handleCheckboxClick(e);
        }
      }}
      aria-label={`Mark ${activity.name} as ${isCompleted ? 'incomplete' : 'complete'}`}
    >
      {/* Large easy-to-tap checkbox button */}
      <button
        type="button"
        className={`${styles.checkbox} ${isCompleted ? styles.checked : ''}`}
        onClick={handleCheckboxClick}
        aria-checked={isCompleted}
        role="checkbox"
        tabIndex={-1}
      >
        {isCompleted && <Check className={styles.checkIcon} strokeWidth={3} size={18} />}
      </button>

      {/* Main Info */}
      <div className={styles.content}>
        <div className={styles.titleRow}>
          <span className={`${styles.title} ${isCompleted ? styles.titleCompleted : ''}`}>
            {activity.name}
          </span>
          <span className={styles.categoryBadge}>{activity.category}</span>
        </div>

        <div className={styles.metaRow}>
          <span className={styles.target}>
            {activity.targetValue} {activity.targetUnit}
          </span>

          {activity.reminderTime && (
            <span className={styles.reminder}>
              <Clock size={12} className={styles.reminderIcon} />
              {formatReminderTime(activity.reminderTime)}
            </span>
          )}

          {activity.note && (
            <span className={styles.note} title={activity.note}>
              • {activity.note}
            </span>
          )}
        </div>
      </div>

      {/* Optional Delete Button */}
      {onDelete && !readOnly && (
        <button
          type="button"
          className={styles.deleteBtn}
          title="Delete activity"
          onClick={(e) => {
            e.stopPropagation();
            onDelete(activity.id);
          }}
          aria-label={`Delete ${activity.name}`}
        >
          <Trash2 size={16} />
        </button>
      )}
    </div>
  );
}
