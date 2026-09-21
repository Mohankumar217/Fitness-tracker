import { db, initDb } from './db.js';

export default async function handler(req, res) {
  try {
    await initDb();

    if (req.method === 'POST') {
      const { type } = req.body || {};

      if (type === 'progress') {
        // Clear only completions
        await db.execute('DELETE FROM completions');
        return res.status(200).json({ success: true, message: 'Progress history cleared' });
      }

      if (type === 'all') {
        // Clear both activities and completions
        await db.execute('DELETE FROM completions');
        await db.execute('DELETE FROM activities');
        return res.status(200).json({ success: true, message: 'All activities and progress cleared' });
      }

      return res.status(400).json({ success: false, error: 'Invalid reset type. Must be "progress" or "all"' });
    }

    return res.status(405).json({ success: false, error: 'Method not allowed' });
  } catch (err) {
    console.error('Error in /api/reset:', err);
    res.status(500).json({ success: false, error: err.message });
  }
}
