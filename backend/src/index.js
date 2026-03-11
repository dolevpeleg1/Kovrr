/**
 * Kovrr Vulnerability Risk Dashboard - Backend API
 */

import express from 'express';
import cors from 'cors';
import vulnerabilityRoutes from './routes/vulnerabilities.js';
import statsRoutes from './routes/stats.js';
import { syncVulnerabilities } from './services/syncService.js';

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

app.use('/api/vulnerabilities', vulnerabilityRoutes);
app.use('/api/stats', statsRoutes);

// Optional: manual sync endpoint for refreshing data
app.post('/api/sync', async (req, res) => {
  try {
    const count = await syncVulnerabilities();
    res.json({ synced: count, message: `Synced ${count} vulnerabilities` });
  } catch (err) {
    console.error('Sync error:', err);
    res.status(500).json({ error: 'Failed to sync vulnerabilities', detail: err.message });
  }
});

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok' });
});

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
