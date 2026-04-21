-- BudgetWise initial schema. user_id is nullable to support guest mode.

CREATE TABLE IF NOT EXISTS users (
  id            TEXT PRIMARY KEY,
  email         TEXT NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  display_name  TEXT,
  currency      TEXT NOT NULL DEFAULT 'VND',
  tax_required  INTEGER NOT NULL DEFAULT 0,
  region        TEXT,
  created_at    TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS incomes (
  id         TEXT PRIMARY KEY,
  user_id    TEXT,
  source     TEXT NOT NULL,
  amount     REAL NOT NULL,
  currency   TEXT NOT NULL DEFAULT 'VND',
  month      TEXT NOT NULL, -- YYYY-MM
  locked     INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_incomes_month ON incomes(user_id, month);

CREATE TABLE IF NOT EXISTS expenses (
  id           TEXT PRIMARY KEY,
  user_id      TEXT,
  category     TEXT NOT NULL,
  sub_type     TEXT,
  amount       REAL NOT NULL,
  currency     TEXT NOT NULL DEFAULT 'VND',
  note         TEXT,
  occurred_at  TEXT NOT NULL,
  is_impulse   INTEGER NOT NULL DEFAULT 0,
  platform_tag TEXT,
  created_at   TEXT NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_expenses_user_date ON expenses(user_id, occurred_at);
CREATE INDEX IF NOT EXISTS idx_expenses_category ON expenses(user_id, category, occurred_at);

CREATE TABLE IF NOT EXISTS bills (
  id          TEXT PRIMARY KEY,
  user_id     TEXT,
  label       TEXT NOT NULL,
  type        TEXT NOT NULL,
  amount      REAL NOT NULL,
  due_date    TEXT NOT NULL,           -- ISO date
  status      TEXT NOT NULL DEFAULT 'unpaid', -- unpaid | paid | partial
  recurring   INTEGER NOT NULL DEFAULT 0,
  min_payment REAL,
  created_at  TEXT NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_bills_due ON bills(user_id, due_date);

CREATE TABLE IF NOT EXISTS tax_entries (
  id        TEXT PRIMARY KEY,
  user_id   TEXT,
  type      TEXT NOT NULL,
  amount    REAL NOT NULL,
  due_date  TEXT,
  paid_at   TEXT,
  reference TEXT
);
CREATE INDEX IF NOT EXISTS idx_tax_due ON tax_entries(user_id, due_date);

CREATE TABLE IF NOT EXISTS budget_caps (
  user_id  TEXT,
  category TEXT NOT NULL,
  amount   REAL NOT NULL,
  month    TEXT NOT NULL,
  PRIMARY KEY (user_id, category, month)
);

CREATE TABLE IF NOT EXISTS notifications (
  id            TEXT PRIMARY KEY,
  user_id       TEXT,
  tier          INTEGER NOT NULL,
  category      TEXT,
  payload_json  TEXT NOT NULL,
  scheduled_at  TEXT,
  delivered_at  TEXT,
  snoozed_until TEXT
);
CREATE INDEX IF NOT EXISTS idx_notifs_user ON notifications(user_id, scheduled_at);

CREATE TABLE IF NOT EXISTS settings (
  user_id            TEXT PRIMARY KEY,
  currency           TEXT NOT NULL DEFAULT 'VND',
  tax_required       INTEGER NOT NULL DEFAULT 0,
  quiet_hours_start  INTEGER, -- 0..23
  quiet_hours_end    INTEGER,
  weekend_suppress   INTEGER NOT NULL DEFAULT 1,
  region             TEXT
);

CREATE TABLE IF NOT EXISTS schema_version (
  version INTEGER PRIMARY KEY
);
INSERT OR IGNORE INTO schema_version (version) VALUES (1);
