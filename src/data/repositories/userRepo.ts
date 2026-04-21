import bcrypt from 'bcryptjs';
import { getDb } from '../db';
import { newId } from '../../utils/id';

export interface UserRow {
  id: string;
  email: string;
  password_hash: string;
  display_name: string | null;
  currency: string;
  tax_required: number;
  region: string | null;
  created_at: string;
}

export const userRepo = {
  async findByEmail(email: string): Promise<UserRow | null> {
    const db = await getDb();
    const row = await db.getFirstAsync<UserRow>(
      'SELECT * FROM users WHERE email = ?',
      [email.toLowerCase()],
    );
    return row ?? null;
  },

  async create(input: {
    email: string;
    password: string;
    displayName?: string;
    currency?: string;
  }): Promise<UserRow> {
    const db = await getDb();
    const exists = await this.findByEmail(input.email);
    if (exists) throw new Error('An account with this email already exists.');
    const hash = bcrypt.hashSync(input.password, 12);
    const row: UserRow = {
      id: newId(),
      email: input.email.toLowerCase(),
      password_hash: hash,
      display_name: input.displayName ?? null,
      currency: input.currency ?? 'VND',
      tax_required: 0,
      region: null,
      created_at: new Date().toISOString(),
    };
    await db.runAsync(
      `INSERT INTO users (id, email, password_hash, display_name, currency, tax_required, region, created_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        row.id,
        row.email,
        row.password_hash,
        row.display_name,
        row.currency,
        row.tax_required,
        row.region,
        row.created_at,
      ],
    );
    return row;
  },

  async verifyPassword(email: string, password: string): Promise<UserRow | null> {
    const u = await this.findByEmail(email);
    if (!u) return null;
    const ok = bcrypt.compareSync(password, u.password_hash);
    return ok ? u : null;
  },

  async setTaxRequired(userId: string, required: boolean): Promise<void> {
    const db = await getDb();
    await db.runAsync('UPDATE users SET tax_required = ? WHERE id = ?', [required ? 1 : 0, userId]);
  },

  async deleteAccount(userId: string): Promise<void> {
    const db = await getDb();
    // Wipe everything tied to this user (PRD §4.3 GDPR-style local wipe)
    await db.execAsync('BEGIN');
    try {
      await db.runAsync('DELETE FROM expenses WHERE user_id = ?', [userId]);
      await db.runAsync('DELETE FROM incomes WHERE user_id = ?', [userId]);
      await db.runAsync('DELETE FROM bills WHERE user_id = ?', [userId]);
      await db.runAsync('DELETE FROM tax_entries WHERE user_id = ?', [userId]);
      await db.runAsync('DELETE FROM budget_caps WHERE user_id = ?', [userId]);
      await db.runAsync('DELETE FROM notifications WHERE user_id = ?', [userId]);
      await db.runAsync('DELETE FROM settings WHERE user_id = ?', [userId]);
      await db.runAsync('DELETE FROM users WHERE id = ?', [userId]);
      await db.execAsync('COMMIT');
    } catch (e) {
      await db.execAsync('ROLLBACK');
      throw e;
    }
  },
};
