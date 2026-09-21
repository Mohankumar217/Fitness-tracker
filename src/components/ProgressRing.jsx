import React from 'react';
import styles from './ProgressRing.module.css';

export default function ProgressRing({
  percent = 0,
  size = 76,
  strokeWidth = 7,
  completedCount = 0,
  totalCount = 0,
  showLabel = true,
}) {
  const safePercent = Math.min(100, Math.max(0, Math.round(percent)));
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (safePercent / 100) * circumference;

  return (
    <div className={styles.container} style={{ width: size, height: size }}>
      <svg width={size} height={size} className={styles.svg}>
        {/* Background track */}
        <circle
          className={styles.track}
          strokeWidth={strokeWidth}
          cx={size / 2}
          cy={size / 2}
          r={radius}
        />
        {/* Animated Progress circle */}
        <circle
          className={styles.indicator}
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          cx={size / 2}
          cy={size / 2}
          r={radius}
        />
      </svg>
      {showLabel && (
        <div className={styles.centerLabel}>
          <span className={styles.percentText}>{safePercent}%</span>
        </div>
      )}
    </div>
  );
}
