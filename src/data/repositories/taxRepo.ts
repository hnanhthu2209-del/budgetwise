import { getDb } from '../db';
import { newId } from '../../utils/id';

export interface TaxEntry {
  id: string;
  user_id: string | null;
  type: string;
  amount: number;
  due_date: string | null;
  paid_at: string | null;
  reference: string | null;
}

export const taxRepo = {
  async list(userId: string | null): Promise<TaxEntry[]> {
    const db = await getDb();
    return db.getAllAsync<TaxEntry>(
      'SELECT * FROM tax_entries WHERE COALESCE(user_id,"") = COALESCE(?,"") ORDER BY due_date ASC',
      [userId],
    );
  },

  async upcoming(userId: string | null): Promise<TaxEntry[]> {
    const db = await getDb();
    return db.getAllAsync<TaxEntry>(
      `SELECT * FROM tax_entries
        WHERE COALESCE(user_id,"") = COALESCE(?,"")
          AND paid_at IS NULL
          AND due_date IS NOT NULL
        ORDER BY due_date ASC`,
      [userId],
    );
  },

  async add(input: {
    userId: string | null;
    type: string;
    amount: number;
    dueDate?: Date;
    paidAt?: Date;
    reference?: string;
  }): Promise<TaxEntry> {
    const db = await getDb();
    const row: TaxEntry = {
      id: newId(),
      user_id: input.userId,
      type: input.type,
      amount: input.amount,
      due_date: input.dueDate?.toISOString() ?? null,
      paid_at: input.paidAt?.toISOString() ?? null,
      reference: input.reference ?? null,
    };
    await db.runAsync(
      `INSERT INTO tax_entries (id, user_id, type, amount, due_date, paid_at, reference)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [row.id, row.user_id, row.type, row.amount, row.due_date, row.paid_at, row.reference],
    );
    return row;
  },

  async markPaid(id: string, when: Date = new Date(), reference?: string): Promise<void> {
    const db = await getDb();
    await db.runAsync('UPDATE tax_entries SET paid_at = ?, reference = COALESCE(?, reference) WHERE id = ?', [
      when.toISOString(),
      reference ?? null,
      id,
    ]);
  },

  // Tax set-aside tracker — current month "reserved for taxes" amount
  async setAsideForMonth(userId: string | null, month: string): Promise<number> {
    const db = await getDb();
    const r = await db.getFirstAsync<{ total: number | null }>(
      `SELECT SUM(amount) AS total
         FROM tax_entries
        WHERE COALESCE(user_id,"") = COALESCE(?,"")
          AND paid_at IS NULL
          AND substr(COALESCE(due_date, ''), 1, 7) = ?`,
      [userId, month],
    );
    return r?.total ?? 0;
  },
};
