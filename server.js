import express from 'express';
import cors from 'cors';
import initHandler from './api/init.js';
import activitiesHandler from './api/activities.js';
import completionsHandler from './api/completions.js';
import settingsHandler from './api/settings.js';
import resetHandler from './api/reset.js';

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

// Helper adapter from Express req/res to Vercel serverless function signature
const adapt = (handler) => async (req, res) => {
  try {
    await handler(req, res);
  } catch (err) {
    console.error('API Error:', err);
    if (!res.headersSent) {
      res.status(500).json({ success: false, error: err.message });
    }
  }
};

// API routes mirroring Vercel Serverless Functions
app.all('/api/init', adapt(initHandler));
app.all('/api/activities', adapt(activitiesHandler));
app.all('/api/completions', adapt(completionsHandler));
app.all('/api/settings', adapt(settingsHandler));
app.all('/api/reset', adapt(resetHandler));

app.listen(PORT, () => {
  console.log(`FitDaily local API server running on http://localhost:${PORT}`);
});
