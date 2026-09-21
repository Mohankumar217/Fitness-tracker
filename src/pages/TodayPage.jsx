import React from 'react';
import { Plus, Flame, Sparkles } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { toLocalDateString, formatFullDate, getGreeting } from '../utils/dateUtils';
import ProgressRing from '../components/ProgressRing';
import ActivityItem from '../components/ActivityItem';
import EmptyState from '../components/EmptyState';
import styles from './TodayPage.module.css';

export default function TodayPage() {
  const {
    getActivitiesForDate,
    toggleActivity,
    deleteActivity,
    setIsAddModalOpen,
    settings,
    streakInfo,
  } = useApp();

  const todayStr = toLocalDateString();
  const todayActivities = getActivitiesForDate(todayStr);

  const totalCount = todayActivities.length;
  const completedCount = todayActivities.filter((a) => a.completed).length;
  const percent = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;
  const isGoalReached = percent >= (settings.dailyGoalPercent || 80);

  const greeting = getGreeting();
  const userName = settings.name ? `, ${settings.name}` : '';

  return (
    <div className={styles.container}>
      {/* Top Header */}
      <header className={styles.header}>
        <div className={styles.dateRow}>
          <span className={styles.dateText}>{formatFullDate(new Date())}</span>
          {streakInfo.currentStreak > 0 && (
            <div className={styles.streakBadge} title="Current streak">
              <Flame size={15} className={styles.flameIcon} />
              <span>{streakInfo.currentStreak} day streak</span>
            </div>
          )}
        </div>

        <h1 className={styles.greeting}>
          {greeting}{userName} 👋
        </h1>
      </header>

      {/* Progress Summary Card */}
      <section className={styles.progressCard}>
        <div className={styles.progressInfo}>
          <div className={styles.progressTitleRow}>
            <span className={styles.progressLabel}>Today's Progress</span>
            {isGoalReached && totalCount > 0 && (
              <span className={styles.goalAchievedPill}>
                <Sparkles size={12} /> Goal Reached!
              </span>
            )}
          </div>

          <div className={styles.progressNumbers}>
            <span className={styles.countText}>
              <strong>{completedCount}</strong> of {totalCount} completed
            </span>
          </div>

          {/* Linear Progress Bar */}
          <div className={styles.progressBarWrapper}>
            <div
              className={styles.progressBarFill}
              style={{ width: `${percent}%` }}
            />
          </div>
        </div>

        {/* Circular Ring */}
        <div className={styles.ringWrapper}>
          <ProgressRing
            percent={percent}
            size={76}
            strokeWidth={7}
            completedCount={completedCount}
            totalCount={totalCount}
          />
        </div>
      </section>

      {/* Today's Activities Section */}
      <section className={styles.activitiesSection}>
        <div className={styles.sectionHeader}>
          <h2 className={styles.sectionTitle}>Today's Plan</h2>
          <button
            type="button"
            className={styles.addBtnSmall}
            onClick={() => setIsAddModalOpen(true)}
            aria-label="Add new activity"
          >
            <Plus size={18} />
            <span>Add</span>
          </button>
        </div>

        {todayActivities.length === 0 ? (
          <EmptyState
            emoji="🌱"
            title="Your day is wide open"
            description="Add your first fitness activity to start tracking your progress."
            actionText="+ Add Activity"
            onAction={() => setIsAddModalOpen(true)}
          />
        ) : (
          <div className={styles.activitiesList}>
            {todayActivities.map((activity) => (
              <ActivityItem
                key={activity.id}
                activity={activity}
                onToggle={(id) => toggleActivity(id, todayStr)}
                onDelete={(id) => deleteActivity(id)}
              />
            ))}
          </div>
        )}
      </section>

      {/* Prominent Floating Add Button */}
      {todayActivities.length > 0 && (
        <div className={styles.floatingAddWrapper}>
          <button
            type="button"
            className={styles.floatingAddBtn}
            onClick={() => setIsAddModalOpen(true)}
          >
            <Plus size={20} />
            <span>Add Activity</span>
          </button>
        </div>
      )}
    </div>
  );
}
