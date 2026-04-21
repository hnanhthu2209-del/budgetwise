import { getDb } from '../db';
import { newId } from '../../utils/id';

export type BillStatus = 'unpaid' | 'paid' | 'partial';

export interface BillRow {
  id: string;
  user_id: string | null;
  label: string;
  type: string;
  amount: number;
  due_date: string;
  status: BillStatus;
  recurring: number;
  min_payment: number | null;
  created_at: string;
}

export const billRepo = {
  async list(userId: string | null): Promise<BillRow[]> {
    const db = await getDb();
    return db.getAllAsync<BillRow>(
      'SELECT * FROM bills WHERE COALESCE(user_id,"") = COALESCE(?,"") ORDER BY due_date ASC',
      [userId],
    );
  },

  async upcomingWithin(userId: string | null, days: number): Promise<BillRow[]> {
    const db = await getDb();
    const now = new Date();
    const future = new Date(now.getTime() + days * 86400_000);
    return db.getAllAsync<BillRow>(
      `SELECT * FROM bills
        WHERE COALESCE(user_id,"") = COALESCE(?,"")
          AND status != 'paid'
          AND due_date <= ?
        ORDER BY due_date ASC`,
      [userId, future.toISOString()],
    );
  },

  async overdue(userId: string | null): Promise<BillRow[]> {
    const db = await getDb();
    return db.getAllAsync<BillRow>(
      `SELECT * FROM bills
        WHERE COALESCE(user_id,"") = COALESCE(?,"")
          AND status != 'paid'
          AND due_date < ?
        ORDER BY due_date ASC`,
      [userId, new Date().toISOString()],
    );
  },

  async add(input: {
    userId: string | null;
    label: string;
    type: string;
    amount: number;
    dueDate: Date;
    recurring?: boolean;
    minPayment?: number;
  }): Promise<BillRow> {
    const db = await getDb();
    const row: BillRow = {
      id: newId(),
      user_id: input.userId,
      label: input.label,
      type: input.type,
      amount: input.amount,
      due_date: input.dueDate.toISOString(),
      status: 'unpaid',
      recurring: input.recurring ? 1 : 0,
      min_payment: input.minPayment ?? null,
      created_at: new Date().toISOString(),
    };
    await db.runAsync(
      `INSERT INTO bills
        (id, user_id, label, type, amount, due_date, status, recurring, min_payment, created_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        row.id,
        row.user_id,
        row.label,
        row.type,
        row.amount,
        row.due_date,
        row.status,
        row.recurring,
        row.min_payment,
        row.created_at,
      ],
    );
    return row;
  },

  async setStatus(id: string, status: BillStatus): Promise<void> {
    const db = await getDb();
    await db.runAsync('UPDATE bills SET status = ? WHERE id = ?', [status, id]);
  },

  async remove(id: string): Promise<void> {
    const db = await getDb();
    await db.runAsync('DELETE FROM bills WHERE id = ?', [id]);
  },
};
