import { db, initDb } from './db.js';

export default async function handler(req, res) {
  try {
    await initDb();

    // Fetch activities
    const actResult = await db.execute('SELECT * FROM activities ORDER BY created_at ASC');
    const activities = actResult.rows.map((row) => ({
      id: row.id,
      name: row.name,
      category: row.category,
      targetValue: Number(row.target_value),
      targetUnit: row.target_unit,
      recurrence: row.recurrence,
      customDays: row.custom_days ? JSON.parse(row.custom_days) : [0, 1, 2, 3, 4, 5, 6],
      reminderTime: row.reminder_time,
      note: row.note || '',
      startDate: row.start_date,
      createdAtDate: row.created_at_date,
    }));

    // Fetch completions
    const compResult = await db.execute('SELECT * FROM completions');
    const completions = {};
    compResult.rows.forEach((row) => {
      if (!completions[row.date]) {
        completions[row.date] = {};
      }
      completions[row.date][row.activity_id] = {
        completed: Boolean(row.completed),
        completedAt: row.completed_at,
      };
    });

    // Fetch settings
    const settResult = await db.execute('SELECT * FROM settings');
    const settings = {
      name: 'Alex',
      dailyGoalPercent: 80,
      theme: 'system',
      notificationsEnabled: false,
      onboardingCompleted: false,
    };

    settResult.rows.forEach((row) => {
      if (row.key === 'dailyGoalPercent') {
        settings[row.key] = Number(row.value);
      } else if (row.key === 'notificationsEnabled' || row.key === 'onboardingCompleted') {
        settings[row.key] = row.value === 'true';
      } else {
        settings[row.key] = row.value;
      }
    });

    res.status(200).json({
      success: true,
      activities,
      completions,
      settings,
    });
  } catch (err) {
    console.error('Error in /api/init:', err);
    res.status(500).json({ success: false, error: err.message });
  }
}
