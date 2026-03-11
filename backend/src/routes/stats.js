/**
 * Stats API routes
 */

import { Router } from 'express';
import { getDatabase } from '../services/database.js';
import { syncVulnerabilities } from '../services/syncService.js';

const router = Router();

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

    const bySeverity = db.prepare(`
      SELECT severity, COUNT(*) as count
      FROM vulnerabilities
      GROUP BY severity
      ORDER BY count DESC
    `).all();

    const topVendorsRows = db.prepare(`
      SELECT vendor, COUNT(*) as count
      FROM vulnerabilities
      WHERE vendor IS NOT NULL AND vendor != 'Unknown'
      GROUP BY vendor
      ORDER BY count DESC
      LIMIT 10
    `).all();

    res.json({
      bySeverity,
      topVendors: topVendorsRows.map((r) => ({ vendor: r.vendor, count: r.count })),
    });
  } catch (err) {
    console.error('GET /stats error:', err);
    res.status(500).json({ error: 'Failed to fetch stats' });
  }
});

export default router;
