// SyncAdapter — interface so we can plug in Supabase or Firebase later
// without touching screens or repositories.

export interface SyncBatch {
  incomes?: unknown[];
  expenses?: unknown[];
  bills?: unknown[];
  taxEntries?: unknown[];
  budgetCaps?: unknown[];
}

export interface SyncAdapter {
  push(batch: SyncBatch): Promise<void>;
  pull(since: Date | null): Promise<SyncBatch>;
  lastSyncedAt(): Promise<Date | null>;
}
