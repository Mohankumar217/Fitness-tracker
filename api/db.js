import { createClient } from '@libsql/client';

// Configure database connection
// In production on Vercel: TURSO_DATABASE_URL & TURSO_AUTH_TOKEN
// In local development: local SQLite file
const url = process.env.TURSO_DATABASE_URL || 'file:local-fitness.db';
const authToken = process.env.TURSO_AUTH_TOKEN || undefined;

export const db = createClient({
  url,
  authToken,
});

let initialized = false;

export async function initDb() {
  if (initialized) return;

  // Create activities table
  await db.execute(`
    CREATE TABLE IF NOT EXISTS activities (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      category TEXT NOT NULL,
      target_value REAL NOT NULL,
      target_unit TEXT NOT NULL,
      recurrence TEXT NOT NULL DEFAULT 'everyday',
      custom_days TEXT DEFAULT '[0,1,2,3,4,5,6]',
      reminder_time TEXT,
      note TEXT,
      start_date TEXT NOT NULL,
      created_at_date TEXT NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
  `);

  // Create completions table
  await db.execute(`
    CREATE TABLE IF NOT EXISTS completions (
      date TEXT NOT NULL,
      activity_id TEXT NOT NULL,
      completed INTEGER NOT NULL DEFAULT 1,
      completed_at TEXT,
      PRIMARY KEY (date, activity_id)
    );
  `);

  // Create settings table
  await db.execute(`
    CREATE TABLE IF NOT EXISTS settings (
      key TEXT PRIMARY KEY,
      value TEXT NOT NULL
    );
  `);

  // Check if we need to seed initial activities
  const existingActivities = await db.execute('SELECT COUNT(*) as count FROM activities');
  const count = Number(existingActivities.rows[0]?.count || 0);

  if (count === 0) {
    const todayStr = new Date().toISOString().split('T')[0];
    const starterActivities = [
      {
        id: 'act-starter-1',
        name: 'Morning Walk',
        category: 'Walking',
        target_value: 30,
        target_unit: 'Minutes',
        recurrence: 'everyday',
        custom_days: '[0,1,2,3,4,5,6]',
        reminder_time: '07:30',
        note: 'Fresh air to kickstart the day',
        start_date: todayStr,
        created_at_date: todayStr,
      },
      {
        id: 'act-starter-2',
        name: 'Drink Water',
        category: 'Hydration',
        target_value: 2,
        target_unit: 'Liters',
        recurrence: 'everyday',
        custom_days: '[0,1,2,3,4,5,6]',
        reminder_time: '09:00',
        note: 'Stay hydrated throughout the day',
        start_date: todayStr,
        created_at_date: todayStr,
      },
      {
        id: 'act-starter-3',
        name: 'Stretching',
        category: 'Stretching',
        target_value: 10,
        target_unit: 'Minutes',
        recurrence: 'everyday',
        custom_days: '[0,1,2,3,4,5,6]',
        reminder_time: '12:00',
        note: 'Loosen up hips, back, and shoulders',
        start_date: todayStr,
        created_at_date: todayStr,
      },
      {
        id: 'act-starter-4',
        name: 'Strength Workout',
        category: 'Workout',
        target_value: 30,
        target_unit: 'Minutes',
        recurrence: 'weekdays',
        custom_days: '[1,2,3,4,5]',
        reminder_time: '17:30',
        note: 'Upper/lower body bodyweight or weights',
        start_date: todayStr,
        created_at_date: todayStr,
      },
      {
        id: 'act-starter-5',
        name: 'Evening Wind-down',
        category: 'Recovery',
        target_value: 15,
        target_unit: 'Minutes',
        recurrence: 'everyday',
        custom_days: '[0,1,2,3,4,5,6]',
        reminder_time: '21:30',
        note: 'Screens off, light breathing and relaxation',
        start_date: todayStr,
        created_at_date: todayStr,
      },
    ];

    for (const act of starterActivities) {
      await db.execute({
        sql: `INSERT INTO activities (id, name, category, target_value, target_unit, recurrence, custom_days, reminder_time, note, start_date, created_at_date)
              VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        args: [
          act.id,
          act.name,
          act.category,
          act.target_value,
          act.target_unit,
          act.recurrence,
          act.custom_days,
          act.reminder_time,
          act.note,
          act.start_date,
          act.created_at_date,
        ],
      });
    }

    // Default settings
    await db.execute({
      sql: `INSERT OR REPLACE INTO settings (key, value) VALUES ('name', 'Alex'), ('dailyGoalPercent', '80'), ('theme', 'system'), ('notificationsEnabled', 'false'), ('onboardingCompleted', 'false')`,
      args: [],
    });
  }

  initialized = true;
}
