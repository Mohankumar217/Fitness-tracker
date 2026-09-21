import React, { useMemo } from 'react';
import { Flame, CheckCircle, Dumbbell, TrendingUp } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { toLocalDateString, isActivityScheduledForDate } from '../utils/dateUtils';
import EmptyState from '../components/EmptyState';
import styles from './ProgressPage.module.css';

export default function ProgressPage() {
  const { activities, completions, streakInfo, settings, setIsAddModalOpen } = useApp();

  const today = useMemo(() => new Date(), []);
  const todayStr = toLocalDateString(today);

  // Calculate past 7 days data for the chart
  const last7DaysData = useMemo(() => {
    const days = [];
    const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

    for (let i = 6; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(d.getDate() - i);
      const dateStr = toLocalDateString(d);
      const dayName = i === 0 ? 'Today' : dayNames[d.getDay()];

      const scheduled = activities.filter((act) => isActivityScheduledForDate(act, dateStr));
      const dayData = completions[dateStr] || {};
      const completedCount = scheduled.filter((act) => dayData[act.id]?.completed).length;
      const percent = scheduled.length > 0 ? Math.round((completedCount / scheduled.length) * 100) : 0;

      days.push({
        dateStr,
        dayName,
        scheduledCount: scheduled.length,
        completedCount,
        percent,
        isToday: i === 0,
      });
    }

    return days;
  }, [activities, completions, today]);

  // Overall statistics
  const stats = useMemo(() => {
    let totalCompletedActivities = 0;
    let totalCompletedWorkouts = 0;

    // Create quick lookup for workout categories
    const workoutActivityIds = new Set(
      activities
        .filter((a) => a.category === 'Workout' || a.category === 'Running')
        .map((a) => a.id)
    );

    // Sum over all recorded completions
    Object.values(completions).forEach((dayMap) => {
      Object.entries(dayMap).forEach(([actId, item]) => {
        if (item?.completed) {
          totalCompletedActivities++;
          if (workoutActivityIds.has(actId)) {
            totalCompletedWorkouts++;
          }
        }
      });
    });

    // Weekly completion percent (past 7 days average of scheduled)
    const past7Scheduled = last7DaysData.reduce((acc, cur) => acc + cur.scheduledCount, 0);
    const past7Completed = last7DaysData.reduce((acc, cur) => acc + cur.completedCount, 0);
    const weeklyPercent =
      past7Scheduled > 0 ? Math.round((past7Completed / past7Scheduled) * 100) : 0;

    return {
      totalCompletedActivities,
      totalCompletedWorkouts,
      weeklyPercent,
    };
  }, [activities, completions, last7DaysData]);

  // Check if user has zero completions anywhere
  const hasHistory = stats.totalCompletedActivities > 0;

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <h1 className={styles.title}>Your Progress</h1>
        <p className={styles.subtitle}>Consistency over intensity, day by day.</p>
      </header>

      {/* Metrics Grid */}
      <div className={styles.metricsGrid}>
        {/* Streak Card */}
        <div className={`${styles.metricCard} ${styles.streakCard}`}>
          <div className={styles.metricIconWrapper}>
            <Flame size={24} className={styles.flameIcon} />
          </div>
          <div className={styles.metricContent}>
            <span className={styles.metricValue}>{streakInfo.currentStreak}</span>
            <span className={styles.metricLabel}>Day Streak</span>
          </div>
        </div>

        {/* Weekly Completion */}
        <div className={styles.metricCard}>
          <div className={styles.metricIconWrapper}>
            <TrendingUp size={22} className={styles.trendIcon} />
          </div>
          <div className={styles.metricContent}>
            <span className={styles.metricValue}>{stats.weeklyPercent}%</span>
            <span className={styles.metricLabel}>Past 7 Days</span>
          </div>
        </div>

        {/* Total Activities */}
        <div className={styles.metricCard}>
          <div className={styles.metricIconWrapper}>
            <CheckCircle size={22} className={styles.checkIcon} />
          </div>
          <div className={styles.metricContent}>
            <span className={styles.metricValue}>{stats.totalCompletedActivities}</span>
            <span className={styles.metricLabel}>Completed Tasks</span>
          </div>
        </div>

        {/* Total Workouts */}
        <div className={styles.metricCard}>
          <div className={styles.metricIconWrapper}>
            <Dumbbell size={22} className={styles.workoutIcon} />
          </div>
          <div className={styles.metricContent}>
            <span className={styles.metricValue}>{stats.totalCompletedWorkouts}</span>
            <span className={styles.metricLabel}>Workouts Done</span>
          </div>
        </div>
      </div>

      {/* Simple 7-Day Bar Chart */}
      <section className={styles.chartCard}>
        <div className={styles.chartHeader}>
          <h2 className={styles.chartTitle}>7-Day Activity Rate</h2>
          <span className={styles.goalTarget}>
            Goal: ≥{settings.dailyGoalPercent || 80}%
          </span>
        </div>

        <div className={styles.chartArea}>
          {last7DaysData.map((day) => {
            const isGoalMet = day.percent >= (settings.dailyGoalPercent || 80);
            return (
              <div key={day.dateStr} className={styles.barColumn}>
                <span className={styles.barPercent}>
                  {day.scheduledCount > 0 ? `${day.percent}%` : '-'}
                </span>
                <div className={styles.barTrack}>
                  <div
                    className={`
                      ${styles.barFill}
                      ${isGoalMet ? styles.barFillGoal : ''}
                      ${day.isToday ? styles.barFillToday : ''}
                    `}
                    style={{ height: `${day.percent}%` }}
                  />
                </div>
                <span className={`${styles.barLabel} ${day.isToday ? styles.barLabelToday : ''}`}>
                  {day.dayName}
                </span>
              </div>
            );
          })}
        </div>
      </section>

      {/* Empty State when no history yet */}
      {!hasHistory && (
        <EmptyState
          emoji="📊"
          title="Your progress will appear here"
          description="Complete your first activity today to start building your fitness consistency history."
          actionText="Go to Today"
          onAction={() => window.location.href = '/'}
        />
      )}
    </div>
  );
}
