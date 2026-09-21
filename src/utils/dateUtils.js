/**
 * Formats a Date object as YYYY-MM-DD in local time
 */
export function toLocalDateString(date = new Date()) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Parses a YYYY-MM-DD string into a local Date object
 */
export function parseLocalDate(dateStr) {
  if (!dateStr) return new Date();
  const [year, month, day] = dateStr.split('-').map(Number);
  return new Date(year, month - 1, day);
}

/**
 * Friendly greeting based on hour of day
 */
export function getGreeting(date = new Date()) {
  const hour = date.getHours();
  if (hour >= 5 && hour < 12) return 'Good morning';
  if (hour >= 12 && hour < 17) return 'Good afternoon';
  if (hour >= 17 && hour < 22) return 'Good evening';
  return 'Good night';
}

/**
 * Formats date as "Monday, September 21"
 */
export function formatFullDate(date) {
  const d = typeof date === 'string' ? parseLocalDate(date) : date;
  return d.toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
  });
}

/**
 * Formats date as "Sep 21" or "September 2026"
 */
export function formatMonthYear(date) {
  const d = typeof date === 'string' ? parseLocalDate(date) : date;
  return d.toLocaleDateString('en-US', {
    month: 'long',
    year: 'numeric',
  });
}

/**
 * Checks whether a given recurring activity applies to a specific YYYY-MM-DD date
 */
export function isActivityScheduledForDate(activity, dateStr) {
  if (!activity) return false;
  
  // If activity has a created date / start date, it shouldn't apply before that date
  const activityStart = activity.startDate || activity.createdAtDate || '2000-01-01';
  if (dateStr < activityStart) {
    return false;
  }

  const recurrence = activity.recurrence || 'everyday';
  const targetDate = parseLocalDate(dateStr);
  const dayOfWeek = targetDate.getDay(); // 0 = Sunday, 1 = Monday, ..., 6 = Saturday

  if (recurrence === 'once') {
    return (activity.date || activity.startDate) === dateStr;
  }

  if (recurrence === 'everyday') {
    return true;
  }

  if (recurrence === 'weekdays') {
    // 1 (Mon) through 5 (Fri)
    return dayOfWeek >= 1 && dayOfWeek <= 5;
  }

  if (recurrence === 'custom') {
    // customDays is array of integers 0-6
    if (Array.isArray(activity.customDays)) {
      return activity.customDays.includes(dayOfWeek);
    }
    return true;
  }

  return true;
}

/**
 * Calculate the user's current streak
 * @param {Array} activities - all activity templates
 * @param {Object} completions - { [dateStr]: { [activityId]: boolean } }
 * @param {number} dailyGoalPercent - e.g. 80
 * @returns {{ currentStreak: number, todayCompleted: boolean, todayPercent: number }}
 */
export function calculateStreak(activities, completions, dailyGoalPercent = 80) {
  const today = new Date();
  const todayStr = toLocalDateString(today);

  // Helper to get completion % for a specific date
  const getDayStats = (dateStr) => {
    const scheduled = activities.filter((act) => isActivityScheduledForDate(act, dateStr));
    if (scheduled.length === 0) return { scheduledCount: 0, completedCount: 0, percent: 0 };

    const dayCompletions = completions[dateStr] || {};
    const completedCount = scheduled.filter((act) => dayCompletions[act.id]?.completed).length;
    const percent = Math.round((completedCount / scheduled.length) * 100);
    return { scheduledCount: scheduled.length, completedCount, percent };
  };

  const todayStats = getDayStats(todayStr);
  const todayGoalMet = todayStats.scheduledCount > 0 && todayStats.percent >= dailyGoalPercent;

  let streak = 0;
  
  // If today goal met, start counting from today
  // Otherwise, start checking from yesterday
  const cursor = new Date(today);
  if (todayGoalMet) {
    streak++;
    cursor.setDate(cursor.getDate() - 1);
  } else {
    // Today not yet met; let's check yesterday
    cursor.setDate(cursor.getDate() - 1);
  }

  // Count backwards day by day
  for (let i = 0; i < 365; i++) {
    const dateStr = toLocalDateString(cursor);
    const stats = getDayStats(dateStr);

    // If day had no scheduled activities, we don't break the streak (skip rest days),
    // or if scheduled and goal met, add to streak
    if (stats.scheduledCount > 0) {
      if (stats.percent >= dailyGoalPercent) {
        streak++;
      } else {
        // Goal not met on a scheduled day -> streak stops
        break;
      }
    } else {
      // Check if user even had the app back then (e.g. before earliest activity created)
      // If we encounter days with 0 activities beyond earliest activity, break
      const hasAnyPriorActivity = activities.some((a) => (a.startDate || a.createdAtDate || '9999') <= dateStr);
      if (!hasAnyPriorActivity) {
        break;
      }
      // If within active app usage but no activities scheduled for that day, we can skip or break
      // Standard fitness app rule: if no activities scheduled, do not penalize
    }

    cursor.setDate(cursor.getDate() - 1);
  }

  return {
    currentStreak: streak,
    todayGoalMet,
    todayPercent: todayStats.percent,
  };
}
