import React, { useState } from 'react';
import { X, Clock } from 'lucide-react';
import { useApp } from '../context/AppContext';
import styles from './AddActivityModal.module.css';

const CATEGORIES = [
  'Workout',
  'Walking',
  'Running',
  'Stretching',
  'Hydration',
  'Recovery',
  'Meditation',
  'Other',
];

const UNITS = [
  'Minutes',
  'Hours',
  'Liters',
  'Glasses',
  'Miles',
  'Kilometers',
  'Steps',
  'Reps',
  'Sets',
  'Times',
];

const DAYS_OF_WEEK = [
  { label: 'S', name: 'Sun', index: 0 },
  { label: 'M', name: 'Mon', index: 1 },
  { label: 'T', name: 'Tue', index: 2 },
  { label: 'W', name: 'Wed', index: 3 },
  { label: 'T', name: 'Thu', index: 4 },
  { label: 'F', name: 'Fri', index: 5 },
  { label: 'S', name: 'Sat', index: 6 },
];

export default function AddActivityModal({ isOpen, onClose }) {
  const { addActivity } = useApp();

  const [name, setName] = useState('');
  const [category, setCategory] = useState('Walking');
  const [targetValue, setTargetValue] = useState('30');
  const [targetUnit, setTargetUnit] = useState('Minutes');
  const [recurrence, setRecurrence] = useState('everyday');
  const [customDays, setCustomDays] = useState([1, 2, 3, 4, 5]); // default Mon-Fri
  const [reminderTime, setReminderTime] = useState('');
  const [note, setNote] = useState('');
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const toggleDay = (dayIndex) => {
    setCustomDays((prev) => {
      if (prev.includes(dayIndex)) {
        if (prev.length === 1) return prev; // keep at least one day
        return prev.filter((d) => d !== dayIndex);
      } else {
        return [...prev, dayIndex].sort();
      }
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!name.trim()) {
      setError('Please enter an activity name');
      return;
    }

    const val = Number(targetValue);
    if (!val || val <= 0) {
      setError('Please enter a target value greater than 0');
      return;
    }

    addActivity({
      name: name.trim(),
      category,
      targetValue: val,
      targetUnit,
      recurrence,
      customDays: recurrence === 'custom' ? customDays : [0, 1, 2, 3, 4, 5, 6],
      reminderTime: reminderTime || null,
      note: note.trim(),
    });

    // Reset and close
    setName('');
    setCategory('Walking');
    setTargetValue('30');
    setTargetUnit('Minutes');
    setRecurrence('everyday');
    setReminderTime('');
    setNote('');
    setError('');
    onClose();
  };

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div
        className={styles.modal}
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
      >
        <div className={styles.header}>
          <h2 id="modal-title" className={styles.title}>
            Add Activity
          </h2>
          <button
            type="button"
            className={styles.closeBtn}
            onClick={onClose}
            aria-label="Close modal"
          >
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className={styles.form}>
          {error && <div className={styles.errorAlert}>{error}</div>}

          {/* Activity Name */}
          <div className={styles.field}>
            <label htmlFor="activity-name" className={styles.label}>
              Activity Name
            </label>
            <input
              id="activity-name"
              type="text"
              className={styles.input}
              placeholder="e.g. Morning Walk"
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                if (error) setError('');
              }}
              autoFocus
            />
          </div>

          {/* Category */}
          <div className={styles.field}>
            <label htmlFor="activity-category" className={styles.label}>
              Category
            </label>
            <select
              id="activity-category"
              className={styles.select}
              value={category}
              onChange={(e) => setCategory(e.target.value)}
            >
              {CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>

          {/* Target Value and Unit */}
          <div className={styles.row}>
            <div className={styles.field} style={{ flex: 1 }}>
              <label htmlFor="activity-target" className={styles.label}>
                Target
              </label>
              <input
                id="activity-target"
                type="number"
                min="0.1"
                step="any"
                className={styles.input}
                value={targetValue}
                onChange={(e) => setTargetValue(e.target.value)}
              />
            </div>

            <div className={styles.field} style={{ flex: 1.2 }}>
              <label htmlFor="activity-unit" className={styles.label}>
                Unit
              </label>
              <select
                id="activity-unit"
                className={styles.select}
                value={targetUnit}
                onChange={(e) => setTargetUnit(e.target.value)}
              >
                {UNITS.map((u) => (
                  <option key={u} value={u}>
                    {u}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Recurrence */}
          <div className={styles.field}>
            <label htmlFor="activity-repeat" className={styles.label}>
              Repeat
            </label>
            <select
              id="activity-repeat"
              className={styles.select}
              value={recurrence}
              onChange={(e) => setRecurrence(e.target.value)}
            >
              <option value="everyday">Every day</option>
              <option value="weekdays">Weekdays (Mon-Fri)</option>
              <option value="custom">Custom days</option>
              <option value="once">Once (Today only)</option>
            </select>
          </div>

          {/* Custom Day Selector if recurrence === 'custom' */}
          {recurrence === 'custom' && (
            <div className={styles.customDaysContainer}>
              <span className={styles.customDaysLabel}>Select active days:</span>
              <div className={styles.dayChips}>
                {DAYS_OF_WEEK.map((d) => {
                  const isSelected = customDays.includes(d.index);
                  return (
                    <button
                      key={d.index}
                      type="button"
                      className={`${styles.dayChip} ${isSelected ? styles.dayChipActive : ''}`}
                      onClick={() => toggleDay(d.index)}
                    >
                      {d.name}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Reminder Time */}
          <div className={styles.field}>
            <label htmlFor="activity-reminder" className={styles.label}>
              <Clock size={14} style={{ marginRight: 4, verticalAlign: 'middle' }} />
              Reminder (Optional)
            </label>
            <input
              id="activity-reminder"
              type="time"
              className={styles.input}
              value={reminderTime}
              onChange={(e) => setReminderTime(e.target.value)}
            />
          </div>

          {/* Note */}
          <div className={styles.field}>
            <label htmlFor="activity-note" className={styles.label}>
              Note (Optional)
            </label>
            <input
              id="activity-note"
              type="text"
              className={styles.input}
              placeholder="e.g. Bring water bottle"
              value={note}
              onChange={(e) => setNote(e.target.value)}
            />
          </div>

          {/* Buttons */}
          <div className={styles.actions}>
            <button
              type="button"
              className={styles.cancelBtn}
              onClick={onClose}
            >
              Cancel
            </button>
            <button type="submit" className={styles.submitBtn}>
              Save Activity
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
