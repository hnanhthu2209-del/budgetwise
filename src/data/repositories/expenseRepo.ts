import { getDb } from '../db';
import { newId } from '../../utils/id';
import { monthBounds } from '../../utils/date';
import { CategoryId } from '../../domain/budget';

export interface ExpenseRow {
  id: string;
  user_id: string | null;
  category: CategoryId;
  sub_type: string | null;
  amount: number;
  currency: string;
  note: string | null;
  occurred_at: string;
  is_impulse: number;
  platform_tag: string | null;
  created_at: string;
}

export const expenseRepo = {
  async listForMonth(
    userId: string | null,
    monthAnchor: Date = new Date(),
  ): Promise<ExpenseRow[]> {
    const db = await getDb();
    const { start, end } = monthBounds(monthAnchor);
    return db.getAllAsync<ExpenseRow>(
      `SELECT * FROM expenses
        WHERE COALESCE(user_id,"") = COALESCE(?,"")
          AND occurred_at >= ?
          AND occurred_at <= ?
        ORDER BY occurred_at DESC`,
      [userId, start.toISOString(), end.toISOString()],
    );
  },

  async totalsByCategory(
    userId: string | null,
    monthAnchor: Date = new Date(),
  ): Promise<Record<CategoryId, number>> {
    const db = await getDb();
    const { start, end } = monthBounds(monthAnchor);
    const rows = await db.getAllAsync<{ category: CategoryId; total: number }>(
      `SELECT category, SUM(amount) AS total
         FROM expenses
        WHERE COALESCE(user_id,"") = COALESCE(?,"")
          AND occurred_at >= ?
          AND occurred_at <= ?
        GROUP BY category`,
      [userId, start.toISOString(), end.toISOString()],
    );
    const out: Record<string, number> = {};
    rows.forEach(r => (out[r.category] = r.total));
    return out as Record<CategoryId, number>;
  },

  async add(input: {
    userId: string | null;
    category: CategoryId;
    amount: number;
    subType?: string;
    note?: string;
    occurredAt?: Date;
    isImpulse?: boolean;
    platformTag?: string;
    currency?: string;
  }): Promise<ExpenseRow> {
    const db = await getDb();
    const row: ExpenseRow = {
      id: newId(),
      user_id: input.userId,
      category: input.category,
      sub_type: input.subType ?? null,
      amount: input.amount,
      currency: input.currency ?? 'VND',
      note: input.note ?? null,
      occurred_at: (input.occurredAt ?? new Date()).toISOString(),
      is_impulse: input.isImpulse ? 1 : 0,
      platform_tag: input.platformTag ?? null,
      created_at: new Date().toISOString(),
    };
    await db.runAsync(
      `INSERT INTO expenses
        (id, user_id, category, sub_type, amount, currency, note, occurred_at, is_impulse, platform_tag, created_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        row.id,
        row.user_id,
        row.category,
        row.sub_type,
        row.amount,
        row.currency,
        row.note,
        row.occurred_at,
        row.is_impulse,
        row.platform_tag,
        row.created_at,
      ],
    );
    return row;
  },

  async remove(id: string): Promise<void> {
    const db = await getDb();
    await db.runAsync('DELETE FROM expenses WHERE id = ?', [id]);
  },
};
