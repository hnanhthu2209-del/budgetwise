import { getDb } from '../db';
import { CategoryId } from '../../domain/budget';
import { monthKey } from '../../utils/date';

export interface CapRow {
  user_id: string | null;
  category: CategoryId;
  amount: number;
  month: string;
}

export const budgetCapRepo = {
  async listForMonth(userId: string | null, month = monthKey()): Promise<CapRow[]> {
    const db = await getDb();
    return db.getAllAsync<CapRow>(
      'SELECT * FROM budget_caps WHERE COALESCE(user_id,"") = COALESCE(?,"") AND month = ?',
      [userId, month],
    );
  },

  async asMap(userId: string | null, month = monthKey()): Promise<Partial<Record<CategoryId, number>>> {
    const rows = await this.listForMonth(userId, month);
    const out: Partial<Record<CategoryId, number>> = {};
    rows.forEach(r => (out[r.category] = r.amount));
    return out;
  },

  async setCap(
    userId: string | null,
    category: CategoryId,
    amount: number,
    month = monthKey(),
  ): Promise<void> {
    const db = await getDb();
    await db.runAsync(
      `INSERT INTO budget_caps (user_id, category, amount, month) VALUES (?, ?, ?, ?)
       ON CONFLICT(user_id, category, month) DO UPDATE SET amount = excluded.amount`,
      [userId, category, amount, month],
    );
  },

  async clearCap(userId: string | null, category: CategoryId, month = monthKey()): Promise<void> {
    const db = await getDb();
    await db.runAsync(
      'DELETE FROM budget_caps WHERE COALESCE(user_id,"") = COALESCE(?,"") AND category = ? AND month = ?',
      [userId, category, month],
    );
  },
};
