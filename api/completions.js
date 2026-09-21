import { db, initDb } from './db.js';

export default async function handler(req, res) {
  try {
    await initDb();

    if (req.method === 'POST') {
      const { date, activityId, completed, completedAt } = req.body;
      if (!date || !activityId) {
        return res.status(400).json({ success: false, error: 'date and activityId are required' });
      }

      const isCompleted = completed ? 1 : 0;
      const compTime = isCompleted ? (completedAt || new Date().toISOString()) : null;

      await db.execute({
        sql: `INSERT OR REPLACE INTO completions (date, activity_id, completed, completed_at)
              VALUES (?, ?, ?, ?)`,
        args: [date, activityId, isCompleted, compTime],
      });

      return res.status(200).json({
        success: true,
        date,
        activityId,
        completed: Boolean(isCompleted),
        completedAt: compTime,
      });
    }

    return res.status(405).json({ success: false, error: 'Method not allowed' });
  } catch (err) {
    console.error('Error in /api/completions:', err);
    res.status(500).json({ success: false, error: err.message });
  }
}
