import { getDb } from '../db';
import { newId } from '../../utils/id';
import { monthKey } from '../../utils/date';

export interface IncomeRow {
  id: string;
  user_id: string | null;
  source: string;
  amount: number;
  currency: string;
  month: string;
  locked: number;
  created_at: string;
}

export const incomeRepo = {
  async list(userId: string | null, month = monthKey()): Promise<IncomeRow[]> {
    const db = await getDb();
    return db.getAllAsync<IncomeRow>(
      'SELECT * FROM incomes WHERE COALESCE(user_id,\"\") = COALESCE(?,\"\") AND month = ? ORDER BY created_at DESC',
      [userId, month],
    );
  },

  async totalForMonth(userId: string | null, month = monthKey()): Promise<number> {
    const db = await getDb();
    const r = await db.getFirstAsync<{ total: number | null }>(
      'SELECT SUM(amount) AS total FROM incomes WHERE COALESCE(user_id,\"\") = COALESCE(?,\"\") AND month = ?',
      [userId, month],
    );
    return r?.total ?? 0;
  },

  async add(input: {
    userId: string | null;
    source: string;
    amount: number;
    currency?: string;
    month?: string;
  }): Promise<IncomeRow> {
    const db = await getDb();
    const row: IncomeRow = {
      id: newId(),
      user_id: input.userId,
      source: input.source,
      amount: input.amount,
      currency: input.currency ?? 'VND',
      month: input.month ?? monthKey(),
      locked: 0,
      created_at: new Date().toISOString(),
    };
    await db.runAsync(
      `INSERT INTO incomes (id, user_id, source, amount, currency, month, locked, created_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [row.id, row.user_id, row.source, row.amount, row.currency, row.month, row.locked, row.created_at],
    );
    return row;
  },

  async setLocked(id: string, locked: boolean): Promise<void> {
    const db = await getDb();
    await db.runAsync('UPDATE incomes SET locked = ? WHERE id = ?', [locked ? 1 : 0, id]);
  },

  async remove(id: string): Promise<void> {
    const db = await getDb();
    await db.runAsync('DELETE FROM incomes WHERE id = ?', [id]);
  },
};
