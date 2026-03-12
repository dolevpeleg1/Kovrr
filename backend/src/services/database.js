/**
 * SQLite database (better-sqlite3 - native, fast startup)
 */

import Database from 'better-sqlite3';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { mkdirSync, existsSync } from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const dataDir = join(__dirname, '../../data');
const dbPath = join(dataDir, 'vulnerabilities.db');

let db = null;

function initSchema(database) {
  database.exec(`
    CREATE TABLE IF NOT EXISTS vulnerabilities (
      id TEXT PRIMARY KEY,
      description TEXT,
      severity TEXT,
      risk_score INTEGER,
      published TEXT,
      vendor TEXT,
      raw_json TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);
  try {
    database.exec(`CREATE INDEX idx_severity ON vulnerabilities(severity)`);
  } catch (e) {
    if (!e.message?.includes('already exists')) throw e;
  }
  try {
    database.exec(`CREATE INDEX idx_risk_score ON vulnerabilities(risk_score)`);
  } catch (e) {
    if (!e.message?.includes('already exists')) throw e;
  }
}

function getDatabaseSync() {
  if (!db) {
    if (!existsSync(dataDir)) mkdirSync(dataDir, { recursive: true });
    db = new Database(dbPath);
    initSchema(db);
  }
  return {
    prepare: (sql) => db.prepare(sql),
    exec: (sql) => db.exec(sql),
    save: () => {},
  };
}

let dbPromise = null;
export function getDatabase() {
  if (!dbPromise) dbPromise = Promise.resolve(getDatabaseSync());
  return dbPromise;
}
