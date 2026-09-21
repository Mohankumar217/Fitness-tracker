import React, { useState } from 'react';
import {
  User,
  Target,
  Bell,
  SunMoon,
  Trash2,
  RotateCcw,
  Sparkles,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import ConfirmationModal from '../components/ConfirmationModal';
import styles from './SettingsPage.module.css';

const GOAL_OPTIONS = [60, 70, 80, 90, 100];
const THEME_OPTIONS = [
  { id: 'system', label: 'System' },
  { id: 'light', label: 'Light' },
  { id: 'dark', label: 'Dark' },
];

export default function SettingsPage() {
  const {
    settings,
    updateSettings,
    resetProgress,
    clearAllActivities,
    setIsOnboardingOpen,
    requestNotificationPermission,
  } = useApp();

  const [confirmDialog, setConfirmDialog] = useState({
    isOpen: false,
    title: '',
    message: '',
    confirmText: '',
    isDanger: false,
    action: null,
  });

  const handleNameChange = (e) => {
    updateSettings({ name: e.target.value });
  };

  const handleGoalChange = (pct) => {
    updateSettings({ dailyGoalPercent: pct });
  };

  const handleThemeChange = (theme) => {
    updateSettings({ theme });
  };

  const handleNotificationToggle = async () => {
    if (!settings.notificationsEnabled) {
      const granted = await requestNotificationPermission();
      if (!granted && 'Notification' in window && Notification.permission === 'denied') {
        alert('Notification permission is blocked in browser settings. Please enable it to receive reminders.');
      }
    } else {
      updateSettings({ notificationsEnabled: false });
    }
  };

  const promptResetProgress = () => {
    setConfirmDialog({
      isOpen: true,
      title: 'Reset All Progress?',
      message: 'This will clear all completion history and reset your streak. Your scheduled activities will be kept.',
      confirmText: 'Reset Progress',
      isDanger: true,
      action: () => {
        resetProgress();
        setConfirmDialog((prev) => ({ ...prev, isOpen: false }));
      },
    });
  };

  const promptClearActivities = () => {
    setConfirmDialog({
      isOpen: true,
      title: 'Clear All Activities?',
      message: 'This will delete all custom and recurring activities and all completion records. This cannot be undone.',
      confirmText: 'Clear All',
      isDanger: true,
      action: () => {
        clearAllActivities();
        setConfirmDialog((prev) => ({ ...prev, isOpen: false }));
      },
    });
  };

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <h1 className={styles.title}>Settings</h1>
        <p className={styles.subtitle}>Customize your tracking preferences.</p>
      </header>

      {/* Profile Section */}
      <section className={styles.section}>
        <div className={styles.sectionHeader}>
          <User size={18} className={styles.sectionIcon} />
          <h2 className={styles.sectionTitle}>Profile</h2>
        </div>
        <div className={styles.card}>
          <div className={styles.field}>
            <label htmlFor="settings-name" className={styles.label}>
              Your Name
            </label>
            <input
              id="settings-name"
              type="text"
              className={styles.input}
              placeholder="e.g. Alex"
              value={settings.name || ''}
              onChange={handleNameChange}
            />
          </div>
        </div>
      </section>

      {/* Daily Goal Section */}
      <section className={styles.section}>
        <div className={styles.sectionHeader}>
          <Target size={18} className={styles.sectionIcon} />
          <h2 className={styles.sectionTitle}>Daily Goal Target</h2>
        </div>
        <div className={styles.card}>
          <p className={styles.cardHint}>
            Reach this % of completed activities each day to keep your streak burning:
          </p>
          <div className={styles.pillsRow}>
            {GOAL_OPTIONS.map((pct) => (
              <button
                key={pct}
                type="button"
                className={`${styles.pill} ${
                  (settings.dailyGoalPercent || 80) === pct ? styles.pillActive : ''
                }`}
                onClick={() => handleGoalChange(pct)}
              >
                {pct}%
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Appearance Section */}
      <section className={styles.section}>
        <div className={styles.sectionHeader}>
          <SunMoon size={18} className={styles.sectionIcon} />
          <h2 className={styles.sectionTitle}>Appearance</h2>
        </div>
        <div className={styles.card}>
          <div className={styles.pillsRow}>
            {THEME_OPTIONS.map((t) => (
              <button
                key={t.id}
                type="button"
                className={`${styles.pill} ${
                  (settings.theme || 'system') === t.id ? styles.pillActive : ''
                }`}
                onClick={() => handleThemeChange(t.id)}
              >
                {t.label}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Notifications Section */}
      <section className={styles.section}>
        <div className={styles.sectionHeader}>
          <Bell size={18} className={styles.sectionIcon} />
          <h2 className={styles.sectionTitle}>Notifications</h2>
        </div>
        <div className={styles.card}>
          <div className={styles.toggleRow}>
            <div>
              <span className={styles.toggleLabel}>Activity Reminders</span>
              <p className={styles.toggleDesc}>
                Trigger browser notifications for scheduled activity times.
              </p>
            </div>
            <button
              type="button"
              className={`${styles.toggleSwitch} ${
                settings.notificationsEnabled ? styles.toggleOn : ''
              }`}
              onClick={handleNotificationToggle}
              aria-label="Toggle notifications"
            >
              <span className={styles.toggleThumb} />
            </button>
          </div>
        </div>
      </section>

      {/* Data Management Section */}
      <section className={styles.section}>
        <div className={styles.sectionHeader}>
          <RotateCcw size={18} className={styles.sectionIcon} />
          <h2 className={styles.sectionTitle}>Data & Routine</h2>
        </div>
        <div className={styles.card}>
          <div className={styles.actionsList}>
            <button
              type="button"
              className={styles.secondaryActionBtn}
              onClick={() => setIsOnboardingOpen(true)}
            >
              <Sparkles size={16} />
              <span>Restart Setup / Onboarding</span>
            </button>

            <button
              type="button"
              className={styles.warningActionBtn}
              onClick={promptResetProgress}
            >
              <RotateCcw size={16} />
              <span>Reset Completion History</span>
            </button>

            <button
              type="button"
              className={styles.dangerActionBtn}
              onClick={promptClearActivities}
            >
              <Trash2 size={16} />
              <span>Clear All Activities</span>
            </button>
          </div>
        </div>
      </section>

      {/* Confirmation Modal */}
      <ConfirmationModal
        isOpen={confirmDialog.isOpen}
        title={confirmDialog.title}
        message={confirmDialog.message}
        confirmText={confirmDialog.confirmText}
        isDanger={confirmDialog.isDanger}
        onConfirm={confirmDialog.action}
        onCancel={() => setConfirmDialog((prev) => ({ ...prev, isOpen: false }))}
      />
    </div>
  );
}
