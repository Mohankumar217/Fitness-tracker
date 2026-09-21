import React, { useState } from 'react';
import { Check, ArrowRight, Sparkles } from 'lucide-react';
import { useApp } from '../context/AppContext';
import styles from './OnboardingModal.module.css';

const TRACKING_OPTIONS = [
  { id: 'Walking', label: 'Walking', icon: '🚶' },
  { id: 'Running', label: 'Running', icon: '🏃' },
  { id: 'Workouts', label: 'Workouts', icon: '💪' },
  { id: 'Stretching', label: 'Stretching', icon: '🧘' },
  { id: 'Water', label: 'Water', icon: '💧' },
  { id: 'Meditation', label: 'Meditation', icon: '🧠' },
  { id: 'Sleep', label: 'Sleep', icon: '🌙' },
];

const GOAL_OPTIONS = [60, 70, 80, 90, 100];

export default function OnboardingModal() {
  const { isOnboardingOpen, completeOnboarding, skipOnboarding } = useApp();

  const [step, setStep] = useState(1);
  const [name, setName] = useState('');
  const [selectedTypes, setSelectedTypes] = useState([
    'Walking',
    'Workouts',
    'Stretching',
    'Water',
  ]);
  const [dailyGoalPercent, setDailyGoalPercent] = useState(80);

  if (!isOnboardingOpen) return null;

  const toggleType = (id) => {
    setSelectedTypes((prev) =>
      prev.includes(id) ? prev.filter((t) => t !== id) : [...prev, id]
    );
  };

  const handleFinish = () => {
    completeOnboarding({
      selectedTypes: selectedTypes.length > 0 ? selectedTypes : ['Walking', 'Water'],
      dailyGoalPercent,
      name: name.trim() || 'Friend',
    });
  };

  return (
    <div className={styles.overlay}>
      <div className={styles.modal} role="dialog" aria-modal="true">
        {/* Step Indicator & Skip */}
        <div className={styles.topBar}>
          <div className={styles.stepsDots}>
            {[1, 2, 3].map((s) => (
              <span
                key={s}
                className={`${styles.dot} ${step === s ? styles.dotActive : ''} ${
                  s < step ? styles.dotDone : ''
                }`}
              />
            ))}
          </div>
          <button type="button" className={styles.skipBtn} onClick={skipOnboarding}>
            Skip
          </button>
        </div>

        {/* Step 1: Welcome */}
        {step === 1 && (
          <div className={styles.stepContent}>
            <div className={styles.heroEmoji}>🌱</div>
            <h1 className={styles.heading}>Welcome to FitDaily</h1>
            <p className={styles.subheading}>
              Build a healthier, more consistent daily routine — one simple checkmark at a time.
            </p>

            <div className={styles.nameInputContainer}>
              <label htmlFor="user-name" className={styles.nameLabel}>
                What should we call you?
              </label>
              <input
                id="user-name"
                type="text"
                className={styles.nameInput}
                placeholder="Your name (e.g. Alex)"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>

            <button
              type="button"
              className={styles.nextBtn}
              onClick={() => setStep(2)}
            >
              Get Started <ArrowRight size={18} />
            </button>
          </div>
        )}

        {/* Step 2: What do you want to track? */}
        {step === 2 && (
          <div className={styles.stepContent}>
            <h2 className={styles.heading}>What do you want to track?</h2>
            <p className={styles.subheading}>
              Select the fitness activities you'd like to make part of your day:
            </p>

            <div className={styles.optionsGrid}>
              {TRACKING_OPTIONS.map((opt) => {
                const isChecked = selectedTypes.includes(opt.id);
                return (
                  <button
                    key={opt.id}
                    type="button"
                    className={`${styles.optionCard} ${isChecked ? styles.optionCardActive : ''}`}
                    onClick={() => toggleType(opt.id)}
                  >
                    <span className={styles.optEmoji}>{opt.icon}</span>
                    <span className={styles.optLabel}>{opt.label}</span>
                    <div className={`${styles.optCheckbox} ${isChecked ? styles.optChecked : ''}`}>
                      {isChecked && <Check size={14} strokeWidth={3} />}
                    </div>
                  </button>
                );
              })}
            </div>

            <button
              type="button"
              className={styles.nextBtn}
              onClick={() => setStep(3)}
              disabled={selectedTypes.length === 0}
            >
              Next Step ({selectedTypes.length} selected) <ArrowRight size={18} />
            </button>
          </div>
        )}

        {/* Step 3: Set Daily Goal */}
        {step === 3 && (
          <div className={styles.stepContent}>
            <div className={styles.heroEmoji}>🎯</div>
            <h2 className={styles.heading}>Set Your Daily Goal</h2>
            <p className={styles.subheading}>
              Achieve this completion rate each day to maintain your workout streak!
            </p>

            <div className={styles.goalPills}>
              {GOAL_OPTIONS.map((pct) => (
                <button
                  key={pct}
                  type="button"
                  className={`${styles.goalPill} ${dailyGoalPercent === pct ? styles.goalPillActive : ''}`}
                  onClick={() => setDailyGoalPercent(pct)}
                >
                  {pct}%
                </button>
              ))}
            </div>
            <p className={styles.goalHelper}>
              Recommended: 80% gives you flexibility for busy days.
            </p>

            <button
              type="button"
              className={`${styles.nextBtn} ${styles.startBtn}`}
              onClick={handleFinish}
            >
              Start Tracking <Sparkles size={18} />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
