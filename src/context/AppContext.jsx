import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import {
  loadActivities,
  saveActivities,
  loadCompletions,
  saveCompletions,
  loadSettings,
  saveSettings,
  clearAllStorage,
  INITIAL_STARTER_ACTIVITIES,
  DEFAULT_SETTINGS,
} from '../utils/storage';
import { toLocalDateString, calculateStreak, isActivityScheduledForDate } from '../utils/dateUtils';
import {
  fetchInitialData,
  saveActivityApi,
  deleteActivityApi,
  saveCompletionApi,
  saveSettingsApi,
  resetDataApi,
} from '../services/api';

const AppContext = createContext(null);

export function AppProvider({ children }) {
  // Load initial settings (from localStorage as immediate cache)
  const [settings, setSettings] = useState(() => loadSettings());

  // Load activities or set initial
  const [activities, setActivities] = useState(() => {
    const saved = loadActivities();
    if (saved === null) {
      return INITIAL_STARTER_ACTIVITIES;
    }
    return saved;
  });

  // Load completions
  const [completions, setCompletions] = useState(() => loadCompletions());

  // UI modals
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isOnboardingOpen, setIsOnboardingOpen] = useState(() => !settings.onboardingCompleted);

  // Sync with Database API on initial mount
  useEffect(() => {
    let mounted = true;
    fetchInitialData()
      .then((res) => {
        if (!mounted || !res || !res.success) return;

        if (Array.isArray(res.activities) && res.activities.length > 0) {
          setActivities(res.activities);
        }
        if (res.completions) {
          setCompletions(res.completions);
        }
        if (res.settings) {
          setSettings((prev) => ({ ...prev, ...res.settings }));
          if (res.settings.onboardingCompleted) {
            setIsOnboardingOpen(false);
          }
        }
      })
      .catch((err) => {
        console.warn('API sync unavailable (running offline or standalone):', err.message);
      });

    return () => {
      mounted = false;
    };
  }, []);

  // Apply theme class to document
  useEffect(() => {
    const root = document.documentElement;
    if (settings.theme === 'dark') {
      root.setAttribute('data-theme', 'dark');
    } else if (settings.theme === 'light') {
      root.removeAttribute('data-theme');
    } else {
      // System default
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      if (prefersDark) {
        root.setAttribute('data-theme', 'dark');
      } else {
        root.removeAttribute('data-theme');
      }
    }
  }, [settings.theme]);

  // Persist activities locally on change
  useEffect(() => {
    saveActivities(activities);
  }, [activities]);

  // Persist completions locally on change
  useEffect(() => {
    saveCompletions(completions);
  }, [completions]);

  // Persist settings locally on change
  useEffect(() => {
    saveSettings(settings);
  }, [settings]);

  // Streak calculations
  const streakInfo = useMemo(() => {
    return calculateStreak(activities, completions, settings.dailyGoalPercent || 80);
  }, [activities, completions, settings.dailyGoalPercent]);

  // Toggle completion of an activity for a given date
  const toggleActivity = (activityId, dateStr = toLocalDateString()) => {
    const dayData = completions[dateStr] || {};
    const currentCompleted = !!dayData[activityId]?.completed;
    const nextCompleted = !currentCompleted;
    const completedAt = nextCompleted ? new Date().toISOString() : null;

    // Optimistic UI update
    setCompletions((prev) => {
      const updatedDay = {
        ...(prev[dateStr] || {}),
        [activityId]: {
          completed: nextCompleted,
          completedAt,
        },
      };

      return {
        ...prev,
        [dateStr]: updatedDay,
      };
    });

    // Sync with Database
    saveCompletionApi(dateStr, activityId, nextCompleted, completedAt).catch((err) => {
      console.warn('Failed to sync completion to database:', err);
    });
  };

  // Add new activity
  const addActivity = (activityData) => {
    const todayStr = toLocalDateString();
    const newActivity = {
      id: `act-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
      name: activityData.name.trim(),
      category: activityData.category || 'Workout',
      targetValue: Number(activityData.targetValue) || 1,
      targetUnit: activityData.targetUnit || 'Minutes',
      recurrence: activityData.recurrence || 'everyday',
      customDays: activityData.customDays || [0, 1, 2, 3, 4, 5, 6],
      reminderTime: activityData.reminderTime || null,
      note: activityData.note ? activityData.note.trim() : '',
      startDate: activityData.date || todayStr,
      createdAtDate: todayStr,
    };

    // Optimistic update
    setActivities((prev) => [newActivity, ...prev]);

    // Sync with Database
    saveActivityApi(newActivity).catch((err) => {
      console.warn('Failed to sync activity to database:', err);
    });

    return newActivity;
  };

  // Delete activity
  const deleteActivity = (activityId) => {
    setActivities((prev) => prev.filter((a) => a.id !== activityId));

    // Sync with Database
    deleteActivityApi(activityId).catch((err) => {
      console.warn('Failed to delete activity from database:', err);
    });
  };

  // Update activity
  const updateActivity = (activityId, updatedFields) => {
    setActivities((prev) =>
      prev.map((a) => {
        if (a.id === activityId) {
          const updated = { ...a, ...updatedFields };
          saveActivityApi(updated).catch(console.warn);
          return updated;
        }
        return a;
      })
    );
  };

  // Update settings
  const updateSettings = (partialSettings) => {
    setSettings((prev) => {
      const next = { ...prev, ...partialSettings };
      saveSettingsApi(partialSettings).catch((err) => {
        console.warn('Failed to sync settings to database:', err);
      });
      return next;
    });
  };

  // Request notification permission if enabling
  const requestNotificationPermission = async () => {
    if (!('Notification' in window)) {
      alert('This browser does not support desktop/mobile notifications.');
      return false;
    }
    const permission = await Notification.requestPermission();
    if (permission === 'granted') {
      updateSettings({ notificationsEnabled: true });
      return true;
    } else {
      updateSettings({ notificationsEnabled: false });
      return false;
    }
  };

  // Complete onboarding
  const completeOnboarding = async ({ selectedTypes, dailyGoalPercent, name }) => {
    const todayStr = toLocalDateString();
    
    const categoryTemplates = {
      Walking: { name: 'Daily Walk', category: 'Walking', targetValue: 30, targetUnit: 'Minutes', recurrence: 'everyday' },
      Running: { name: 'Jogging / Run', category: 'Running', targetValue: 20, targetUnit: 'Minutes', recurrence: 'weekdays' },
      Workouts: { name: 'Bodyweight Workout', category: 'Workout', targetValue: 25, targetUnit: 'Minutes', recurrence: 'weekdays' },
      Stretching: { name: 'Full Body Stretch', category: 'Stretching', targetValue: 10, targetUnit: 'Minutes', recurrence: 'everyday' },
      Water: { name: 'Hydration Goal', category: 'Hydration', targetValue: 2, targetUnit: 'Liters', recurrence: 'everyday' },
      Meditation: { name: 'Mindful Meditation', category: 'Meditation', targetValue: 10, targetUnit: 'Minutes', recurrence: 'everyday' },
      Sleep: { name: 'Restful Sleep', category: 'Recovery', targetValue: 8, targetUnit: 'Hours', recurrence: 'everyday' },
    };

    let newActivities = [];
    if (selectedTypes && selectedTypes.length > 0) {
      newActivities = selectedTypes.map((typeKey, idx) => {
        const tpl = categoryTemplates[typeKey] || {
          name: typeKey,
          category: 'Other',
          targetValue: 15,
          targetUnit: 'Minutes',
          recurrence: 'everyday',
        };
        return {
          id: `act-onboard-${Date.now()}-${idx}`,
          ...tpl,
          customDays: [0, 1, 2, 3, 4, 5, 6],
          reminderTime: null,
          note: '',
          startDate: todayStr,
          createdAtDate: todayStr,
        };
      });
    } else {
      newActivities = INITIAL_STARTER_ACTIVITIES;
    }

    setActivities(newActivities);
    const updatedSettings = {
      name: name || 'Friend',
      dailyGoalPercent: dailyGoalPercent || 80,
      onboardingCompleted: true,
    };
    updateSettings(updatedSettings);
    setIsOnboardingOpen(false);

    // Save activities to DB
    for (const act of newActivities) {
      saveActivityApi(act).catch(console.warn);
    }
  };

  // Skip onboarding
  const skipOnboarding = () => {
    updateSettings({ onboardingCompleted: true });
    setIsOnboardingOpen(false);
  };

  // Reset progress only
  const resetProgress = () => {
    setCompletions({});
    saveCompletions({});
    resetDataApi('progress').catch(console.warn);
  };

  // Clear all activities and progress
  const clearAllActivities = () => {
    setActivities([]);
    setCompletions({});
    saveActivities([]);
    saveCompletions({});
    resetDataApi('all').catch(console.warn);
  };

  // Reset entire app to default
  const resetAllData = () => {
    clearAllStorage();
    setActivities(INITIAL_STARTER_ACTIVITIES);
    setCompletions({});
    setSettings(DEFAULT_SETTINGS);
    setIsOnboardingOpen(true);
    resetDataApi('all').catch(console.warn);
    for (const act of INITIAL_STARTER_ACTIVITIES) {
      saveActivityApi(act).catch(console.warn);
    }
  };

  // Get activities scheduled for a date with their completion status
  const getActivitiesForDate = (dateStr) => {
    const scheduled = activities.filter((act) => isActivityScheduledForDate(act, dateStr));
    const dayData = completions[dateStr] || {};
    return scheduled.map((act) => ({
      ...act,
      completed: !!dayData[act.id]?.completed,
      completedAt: dayData[act.id]?.completedAt || null,
    }));
  };

  const value = {
    activities,
    completions,
    settings,
    streakInfo,
    isAddModalOpen,
    isOnboardingOpen,
    setIsAddModalOpen,
    setIsOnboardingOpen,
    toggleActivity,
    addActivity,
    deleteActivity,
    updateActivity,
    updateSettings,
    requestNotificationPermission,
    completeOnboarding,
    skipOnboarding,
    resetProgress,
    clearAllActivities,
    resetAllData,
    getActivitiesForDate,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
}
