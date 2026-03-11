/**
 * Vulnerability API routes
 */

import { Router } from 'express';
import { getDatabase } from '../services/database.js';
import { syncVulnerabilities } from '../services/syncService.js';

const router = Router();

// Ensure we have data - sync on first request if empty
async function ensureData() {
  const db = await getDatabase();
  const count = db.prepare('SELECT COUNT(*) as c FROM vulnerabilities').get();
  if (count.c === 0) {
    await syncVulnerabilities();
  }
}

router.get('/', async (req, res) => {
  try {
    await ensureData();
    const db = await getDatabase();
    const { severity } = req.query;

    let sql = 'SELECT id, description, severity, risk_score as riskScore, published FROM vulnerabilities';
    const params = [];

    if (severity) {
      sql += ' WHERE severity = ?';
      params.push(severity.toUpperCase());
    }
    sql += ' ORDER BY risk_score DESC';

    const rows = db.prepare(sql).all(...params);
    res.json(rows);
  } catch (err) {
    console.error('GET /vulnerabilities error:', err);
    res.status(500).json({ error: 'Failed to fetch vulnerabilities' });
  }
});

router.get('/:id', async (req, res) => {
  try {
    await ensureData();
    const db = await getDatabase();
    const { id } = req.params;

    const row = db.prepare(
      'SELECT id, description, severity, risk_score as riskScore, published, raw_json as rawJson FROM vulnerabilities WHERE id = ?'
    ).get(id);

    if (!row) {
      return res.status(404).json({ error: 'Vulnerability not found' });
    }

    res.json(row);
  } catch (err) {
    console.error('GET /vulnerabilities/:id error:', err);
    res.status(500).json({ error: 'Failed to fetch vulnerability' });
  }
});

export default router;
