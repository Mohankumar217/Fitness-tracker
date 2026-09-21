import { db, initDb } from './db.js';

export default async function handler(req, res) {
  try {
    await initDb();

    if (req.method === 'POST') {
      const act = req.body;
      if (!act || !act.name) {
        return res.status(400).json({ success: false, error: 'Activity name is required' });
      }

      const id = act.id || `act-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`;
      const customDaysStr = JSON.stringify(act.customDays || [0, 1, 2, 3, 4, 5, 6]);

      await db.execute({
        sql: `INSERT OR REPLACE INTO activities (id, name, category, target_value, target_unit, recurrence, custom_days, reminder_time, note, start_date, created_at_date)
              VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        args: [
          id,
          act.name.trim(),
          act.category || 'Workout',
          Number(act.targetValue) || 1,
          act.targetUnit || 'Minutes',
          act.recurrence || 'everyday',
          customDaysStr,
          act.reminderTime || null,
          act.note ? act.note.trim() : '',
          act.startDate || new Date().toISOString().split('T')[0],
          act.createdAtDate || new Date().toISOString().split('T')[0],
        ],
      });

      return res.status(200).json({ success: true, id });
    }

    if (req.method === 'DELETE') {
      const id = req.query.id || req.body?.id;
      if (!id) {
        return res.status(400).json({ success: false, error: 'Activity id is required' });
      }

      await db.execute({
        sql: 'DELETE FROM activities WHERE id = ?',
        args: [id],
      });

      // Also clean up any completion records for this activity
      await db.execute({
        sql: 'DELETE FROM completions WHERE activity_id = ?',
        args: [id],
      });

      return res.status(200).json({ success: true });
    }

    return res.status(405).json({ success: false, error: 'Method not allowed' });
  } catch (err) {
    console.error('Error in /api/activities:', err);
    res.status(500).json({ success: false, error: err.message });
  }
}
