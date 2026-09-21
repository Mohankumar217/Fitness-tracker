import { toLocalDateString } from './dateUtils';

const STORAGE_KEYS = {
  ACTIVITIES: 'fitdaily_activities_v1',
  COMPLETIONS: 'fitdaily_completions_v1',
  SETTINGS: 'fitdaily_settings_v1',
};

export const DEFAULT_SETTINGS = {
  name: 'Alex',
  dailyGoalPercent: 80,
  theme: 'system', // 'light' | 'dark' | 'system'
  notificationsEnabled: false,
  onboardingCompleted: false,
};

export const INITIAL_STARTER_ACTIVITIES = [
  {
    id: 'act-starter-1',
    name: 'Morning Walk',
    category: 'Walking',
    targetValue: 30,
    targetUnit: 'Minutes',
    recurrence: 'everyday',
    customDays: [0, 1, 2, 3, 4, 5, 6],
    reminderTime: '07:30',
    note: 'Fresh air to kickstart the day',
    startDate: toLocalDateString(new Date()),
    createdAtDate: toLocalDateString(new Date()),
  },
  {
    id: 'act-starter-2',
    name: 'Drink Water',
    category: 'Hydration',
    targetValue: 2,
    targetUnit: 'Liters',
    recurrence: 'everyday',
    customDays: [0, 1, 2, 3, 4, 5, 6],
    reminderTime: '09:00',
    note: 'Stay hydrated throughout the day',
    startDate: toLocalDateString(new Date()),
    createdAtDate: toLocalDateString(new Date()),
  },
  {
    id: 'act-starter-3',
    name: 'Stretching',
    category: 'Stretching',
    targetValue: 10,
    targetUnit: 'Minutes',
    recurrence: 'everyday',
    customDays: [0, 1, 2, 3, 4, 5, 6],
    reminderTime: '12:00',
    note: 'Loosen up hips, back, and shoulders',
    startDate: toLocalDateString(new Date()),
    createdAtDate: toLocalDateString(new Date()),
  },
  {
    id: 'act-starter-4',
    name: 'Strength Workout',
    category: 'Workout',
    targetValue: 30,
    targetUnit: 'Minutes',
    recurrence: 'weekdays',
    customDays: [1, 2, 3, 4, 5],
    reminderTime: '17:30',
    note: 'Upper/lower body bodyweight or weights',
    startDate: toLocalDateString(new Date()),
    createdAtDate: toLocalDateString(new Date()),
  },
  {
    id: 'act-starter-5',
    name: 'Evening Wind-down',
    category: 'Recovery',
    targetValue: 15,
    targetUnit: 'Minutes',
    recurrence: 'everyday',
    customDays: [0, 1, 2, 3, 4, 5, 6],
    reminderTime: '21:30',
    note: 'Screens off, light breathing and relaxation',
    startDate: toLocalDateString(new Date()),
    createdAtDate: toLocalDateString(new Date()),
  },
];

export function loadActivities() {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.ACTIVITIES);
    if (!raw) return null; // let context know if first-time
    return JSON.parse(raw);
  } catch (e) {
    console.error('Failed to load activities from localStorage', e);
    return null;
  }
}

export function saveActivities(activities) {
  try {
    localStorage.setItem(STORAGE_KEYS.ACTIVITIES, JSON.stringify(activities));
  } catch (e) {
    console.error('Failed to save activities to localStorage', e);
  }
}

export function loadCompletions() {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.COMPLETIONS);
    if (!raw) return {};
    return JSON.parse(raw);
  } catch (e) {
    console.error('Failed to load completions from localStorage', e);
    return {};
  }
}

export function saveCompletions(completions) {
  try {
    localStorage.setItem(STORAGE_KEYS.COMPLETIONS, JSON.stringify(completions));
  } catch (e) {
    console.error('Failed to save completions to localStorage', e);
  }
}

export function loadSettings() {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.SETTINGS);
    if (!raw) return DEFAULT_SETTINGS;
    return { ...DEFAULT_SETTINGS, ...JSON.parse(raw) };
  } catch (e) {
    console.error('Failed to load settings from localStorage', e);
    return DEFAULT_SETTINGS;
  }
}

export function saveSettings(settings) {
  try {
    localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settings));
  } catch (e) {
    console.error('Failed to save settings to localStorage', e);
  }
}

export function clearAllStorage() {
  try {
    localStorage.removeItem(STORAGE_KEYS.ACTIVITIES);
    localStorage.removeItem(STORAGE_KEYS.COMPLETIONS);
    localStorage.removeItem(STORAGE_KEYS.SETTINGS);
  } catch (e) {
    console.error('Failed to clear storage', e);
  }
}
