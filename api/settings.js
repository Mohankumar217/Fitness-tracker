import { db, initDb } from './db.js';

export default async function handler(req, res) {
  try {
    await initDb();

    if (req.method === 'POST' || req.method === 'PUT') {
      const updates = req.body;
      if (!updates || typeof updates !== 'object') {
        return res.status(400).json({ success: false, error: 'Invalid settings body' });
      }

      for (const [key, value] of Object.entries(updates)) {
        await db.execute({
          sql: `INSERT OR REPLACE INTO settings (key, value) VALUES (?, ?)`,
          args: [key, String(value)],
        });
      }

      return res.status(200).json({ success: true, settings: updates });
    }

    return res.status(405).json({ success: false, error: 'Method not allowed' });
  } catch (err) {
    console.error('Error in /api/settings:', err);
    res.status(500).json({ success: false, error: err.message });
  }
}
