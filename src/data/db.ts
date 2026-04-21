// SQLite singleton + migration runner.
// Uses expo-sqlite's new async API (SDK 51+).

import * as SQLite from 'expo-sqlite';

const DB_NAME = 'budgetwise.db';

let _db: SQLite.SQLiteDatabase | null = null;

export async function getDb(): Promise<SQLite.SQLiteDatabase> {
  if (_db) return _db;
  _db = await SQLite.openDatabaseAsync(DB_NAME);
  await _db.execAsync('PRAGMA journal_mode = WAL;');
  await _db.execAsync('PRAGMA foreign_keys = ON;');
  await runMigrations(_db);
  return _db;
}

async function runMigrations(db: SQLite.SQLiteDatabase) {
  // Migrations are applied idempotently via "IF NOT EXISTS" + an
  // INSERT OR IGNORE into schema_version. To add a new migration:
  //   1. Bump SCHEMA_TARGET
  //   2. Append the SQL inside the corresponding case below
  const SCHEMA_TARGET = 1;
  await db.execAsync(MIGRATION_001);

  const row = await db.getFirstAsync<{ version: number }>(
    'SELECT MAX(version) AS version FROM schema_version',
  );
  const current = row?.version ?? 0;
  if (current < SCHEMA_TARGET) {
    // Hook for future migrations
    await db.runAsync('INSERT OR REPLACE INTO schema_version (version) VALUES (?)', [
      SCHEMA_TARGET,
    ]);
  }
}

// Inlined to avoid a runtime file-read dependency. Source of truth for the
// schema lives in src/data/migrations/001_init.sql; keep the two in sync.
const MIGRATION_001 = `
CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY,
  email TEXT NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  display_name TEXT,
  currency TEXT NOT NULL DEFAULT 'VND',
  tax_required INTEGER NOT NULL DEFAULT 0,
  region TEXT,
  created_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS incomes (
  id TEXT PRIMARY KEY,
  user_id TEXT,
  source TEXT NOT NULL,
  amount REAL NOT NULL,
  currency TEXT NOT NULL DEFAULT 'VND',
  month TEXT NOT NULL,
  locked INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_incomes_month ON incomes(user_id, month);

CREATE TABLE IF NOT EXISTS expenses (
  id TEXT PRIMARY KEY,
  user_id TEXT,
  category TEXT NOT NULL,
  sub_type TEXT,
  amount REAL NOT NULL,
  currency TEXT NOT NULL DEFAULT 'VND',
  note TEXT,
  occurred_at TEXT NOT NULL,
  is_impulse INTEGER NOT NULL DEFAULT 0,
  platform_tag TEXT,
  created_at TEXT NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_expenses_user_date ON expenses(user_id, occurred_at);
CREATE INDEX IF NOT EXISTS idx_expenses_category ON expenses(user_id, category, occurred_at);

CREATE TABLE IF NOT EXISTS bills (
  id TEXT PRIMARY KEY,
  user_id TEXT,
  label TEXT NOT NULL,
  type TEXT NOT NULL,
  amount REAL NOT NULL,
  due_date TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'unpaid',
  recurring INTEGER NOT NULL DEFAULT 0,
  min_payment REAL,
  created_at TEXT NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_bills_due ON bills(user_id, due_date);

CREATE TABLE IF NOT EXISTS tax_entries (
  id TEXT PRIMARY KEY,
  user_id TEXT,
  type TEXT NOT NULL,
  amount REAL NOT NULL,
  due_date TEXT,
  paid_at TEXT,
  reference TEXT
);
CREATE INDEX IF NOT EXISTS idx_tax_due ON tax_entries(user_id, due_date);

CREATE TABLE IF NOT EXISTS budget_caps (
  user_id TEXT,
  category TEXT NOT NULL,
  amount REAL NOT NULL,
  month TEXT NOT NULL,
  PRIMARY KEY (user_id, category, month)
);

CREATE TABLE IF NOT EXISTS notifications (
  id TEXT PRIMARY KEY,
  user_id TEXT,
  tier INTEGER NOT NULL,
  category TEXT,
  payload_json TEXT NOT NULL,
  scheduled_at TEXT,
  delivered_at TEXT,
  snoozed_until TEXT
);
CREATE INDEX IF NOT EXISTS idx_notifs_user ON notifications(user_id, scheduled_at);

CREATE TABLE IF NOT EXISTS settings (
  user_id TEXT PRIMARY KEY,
  currency TEXT NOT NULL DEFAULT 'VND',
  tax_required INTEGER NOT NULL DEFAULT 0,
  quiet_hours_start INTEGER,
  quiet_hours_end INTEGER,
  weekend_suppress INTEGER NOT NULL DEFAULT 1,
  region TEXT
);

CREATE TABLE IF NOT EXISTS schema_version (
  version INTEGER PRIMARY KEY
);
INSERT OR IGNORE INTO schema_version (version) VALUES (1);
`;
