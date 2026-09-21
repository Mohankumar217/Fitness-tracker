import React, { useState, useMemo } from 'react';
import { ChevronLeft, ChevronRight, Check } from 'lucide-react';
import { useApp } from '../context/AppContext';
import {
  toLocalDateString,
  parseLocalDate,
  formatMonthYear,
  formatFullDate,
  isActivityScheduledForDate,
} from '../utils/dateUtils';
import ActivityItem from '../components/ActivityItem';
import styles from './CalendarPage.module.css';

const DAYS_HEADER = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

export default function CalendarPage() {
  const { activities, completions, settings, toggleActivity, getActivitiesForDate } = useApp();

  const today = useMemo(() => new Date(), []);
  const todayStr = toLocalDateString(today);

  // Month navigation state
  const [currentMonthDate, setCurrentMonthDate] = useState(
    new Date(today.getFullYear(), today.getMonth(), 1)
  );

  // Selected date state (defaults to today)
  const [selectedDateStr, setSelectedDateStr] = useState(todayStr);

  const prevMonth = () => {
    setCurrentMonthDate(
      (prev) => new Date(prev.getFullYear(), prev.getMonth() - 1, 1)
    );
  };

  const nextMonth = () => {
    setCurrentMonthDate(
      (prev) => new Date(prev.getFullYear(), prev.getMonth() + 1, 1)
    );
  };

  const jumpToToday = () => {
    setCurrentMonthDate(new Date(today.getFullYear(), today.getMonth(), 1));
    setSelectedDateStr(todayStr);
  };

  // Build the calendar days matrix for currentMonthDate
  const calendarDays = useMemo(() => {
    const year = currentMonthDate.getFullYear();
    const month = currentMonthDate.getMonth();

    // First day of current month
    const firstDay = new Date(year, month, 1);
    // Day of week: Sunday = 0, Monday = 1, ...
    // We want Monday = 0, ..., Sunday = 6
    let startDayOfWeek = firstDay.getDay() - 1;
    if (startDayOfWeek === -1) startDayOfWeek = 6;

    // Number of days in current month
    const daysInMonth = new Date(year, month + 1, 0).getDate();

    // Previous month filler days
    const prevMonthDays = new Date(year, month, 0).getDate();
    const days = [];

    for (let i = startDayOfWeek - 1; i >= 0; i--) {
      const d = new Date(year, month - 1, prevMonthDays - i);
      days.push({
        date: d,
        dateStr: toLocalDateString(d),
        isCurrentMonth: false,
      });
    }

    // Current month days
    for (let i = 1; i <= daysInMonth; i++) {
      const d = new Date(year, month, i);
      days.push({
        date: d,
        dateStr: toLocalDateString(d),
        isCurrentMonth: true,
      });
    }

    // Next month filler days to complete grid to multiple of 7
    const remaining = (7 - (days.length % 7)) % 7;
    for (let i = 1; i <= remaining; i++) {
      const d = new Date(year, month + 1, i);
      days.push({
        date: d,
        dateStr: toLocalDateString(d),
        isCurrentMonth: false,
      });
    }

    return days;
  }, [currentMonthDate]);

  // Compute stats for a date (green = completed goal, yellow = partial, gray = none)
  const getDayStatus = (dateStr) => {
    const scheduled = activities.filter((act) => isActivityScheduledForDate(act, dateStr));
    if (scheduled.length === 0) return { status: 'none', percent: 0, scheduled: 0, completed: 0 };

    const dayData = completions[dateStr] || {};
    const completedCount = scheduled.filter((act) => dayData[act.id]?.completed).length;
    const percent = Math.round((completedCount / scheduled.length) * 100);

    const goal = settings.dailyGoalPercent || 80;
    let status = 'none';
    if (percent >= goal) {
      status = 'completed'; // Green
    } else if (percent > 0) {
      status = 'partial'; // Orange/Yellow
    } else {
      status = 'empty'; // Gray
    }

    return { status, percent, scheduled: scheduled.length, completed: completedCount };
  };

  // Selected day data
  const selectedDayActivities = getActivitiesForDate(selectedDateStr);
  const selectedDayStats = getDayStatus(selectedDateStr);

  return (
    <div className={styles.container}>
      {/* Calendar Header Card */}
      <section className={styles.calendarCard}>
        <div className={styles.navBar}>
          <h2 className={styles.monthTitle}>{formatMonthYear(currentMonthDate)}</h2>
          <div className={styles.navActions}>
            <button
              type="button"
              className={styles.todayBtn}
              onClick={jumpToToday}
              title="Go to Today"
            >
              Today
            </button>
            <button
              type="button"
              className={styles.navBtn}
              onClick={prevMonth}
              aria-label="Previous Month"
            >
              <ChevronLeft size={20} />
            </button>
            <button
              type="button"
              className={styles.navBtn}
              onClick={nextMonth}
              aria-label="Next Month"
            >
              <ChevronRight size={20} />
            </button>
          </div>
        </div>

        {/* Day of Week Headers */}
        <div className={styles.weekHeader}>
          {DAYS_HEADER.map((d) => (
            <div key={d} className={styles.weekdayName}>
              {d}
            </div>
          ))}
        </div>

        {/* Days Grid */}
        <div className={styles.daysGrid}>
          {calendarDays.map(({ date, dateStr, isCurrentMonth }) => {
            const { status } = getDayStatus(dateStr);
            const isToday = dateStr === todayStr;
            const isSelected = dateStr === selectedDateStr;

            return (
              <button
                key={dateStr}
                type="button"
                className={`
                  ${styles.dayCell}
                  ${!isCurrentMonth ? styles.otherMonth : ''}
                  ${isSelected ? styles.selectedCell : ''}
                  ${isToday ? styles.todayCell : ''}
                `}
                onClick={() => setSelectedDateStr(dateStr)}
                aria-label={`Select ${dateStr}`}
              >
                <span className={styles.dayNumber}>{date.getDate()}</span>

                {/* Status Dot */}
                <span
                  className={`
                    ${styles.statusDot}
                    ${status === 'completed' ? styles.dotCompleted : ''}
                    ${status === 'partial' ? styles.dotPartial : ''}
                    ${status === 'empty' ? styles.dotEmpty : ''}
                  `}
                />
              </button>
            );
          })}
        </div>

        {/* Legend */}
        <div className={styles.legend}>
          <div className={styles.legendItem}>
            <span className={`${styles.legendDot} ${styles.dotCompleted}`} />
            <span>Goal met (≥{settings.dailyGoalPercent || 80}%)</span>
          </div>
          <div className={styles.legendItem}>
            <span className={`${styles.legendDot} ${styles.dotPartial}`} />
            <span>Partial</span>
          </div>
          <div className={styles.legendItem}>
            <span className={`${styles.legendDot} ${styles.dotEmpty}`} />
            <span>Not done</span>
          </div>
        </div>
      </section>

      {/* Selected Day Details Section */}
      <section className={styles.detailsSection}>
        <div className={styles.detailsHeader}>
          <div>
            <h3 className={styles.detailsDate}>
              {formatFullDate(parseLocalDate(selectedDateStr))}
              {selectedDateStr === todayStr && ' (Today)'}
            </h3>
            <p className={styles.detailsSub}>
              {selectedDayStats.scheduled > 0 ? (
                <>
                  <strong>{selectedDayStats.completed}</strong> of {selectedDayStats.scheduled}{' '}
                  completed ({selectedDayStats.percent}%)
                </>
              ) : (
                'No activities scheduled'
              )}
            </p>
          </div>
        </div>

        {selectedDayActivities.length === 0 ? (
          <div className={styles.emptyDayCard}>
            <p>No activities scheduled for this date.</p>
          </div>
        ) : (
          <div className={styles.dayActivitiesList}>
            {selectedDayActivities.map((act) => (
              <ActivityItem
                key={act.id}
                activity={act}
                onToggle={(id) => toggleActivity(id, selectedDateStr)}
              />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
