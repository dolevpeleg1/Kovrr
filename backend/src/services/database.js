/**
 * SQLite database (sql.js - pure JS, no native compilation)
 */

import initSqlJs from 'sql.js';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { mkdirSync, existsSync, readFileSync, writeFileSync } from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const dataDir = join(__dirname, '../../data');
const dbPath = join(dataDir, 'vulnerabilities.db');

let db = null;
let SQL = null;

function initSchema(database) {
  database.run(`
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
    database.run(`CREATE INDEX idx_severity ON vulnerabilities(severity)`);
  } catch (e) {
    if (!e.message?.includes('already exists')) throw e;
  }
  try {
    database.run(`CREATE INDEX idx_risk_score ON vulnerabilities(risk_score)`);
  } catch (e) {
    if (!e.message?.includes('already exists')) throw e;
  }
}

function prepare(database, sql) {
  return {
    all(...params) {
      const stmt = database.prepare(sql);
      stmt.bind(params.length ? params : []);
      const rows = [];
      while (stmt.step()) rows.push(stmt.getAsObject());
      stmt.free();
      return rows;
    },
    get(...params) {
      const stmt = database.prepare(sql);
      stmt.bind(params.length ? params : []);
      const row = stmt.step() ? stmt.getAsObject() : undefined;
      stmt.free();
      return row;
    },
    run(...params) {
      database.run(sql, params.length ? params : []);
    },
  };
}

async function loadDb() {
  if (!SQL) SQL = await initSqlJs();
  if (existsSync(dbPath)) {
    const buffer = readFileSync(dbPath);
    return new SQL.Database(buffer);
  }
  const database = new SQL.Database();
  initSchema(database);
  return database;
}

function saveDb(database) {
  if (!existsSync(dataDir)) mkdirSync(dataDir, { recursive: true });
  writeFileSync(dbPath, Buffer.from(database.export()));
}

export async function getDatabaseSync() {
  if (!db) {
    db = await loadDb();
  }
  return {
    prepare: (sql) => prepare(db, sql),
    exec: (sql) => db.run(sql),
    save: () => saveDb(db),
  };
}

let dbPromise = null;
export function getDatabase() {
  if (!dbPromise) dbPromise = getDatabaseSync();
  return dbPromise;
}
