import { getDb } from '../db';
import { newId } from '../../utils/id';
import { CategoryId } from '../../domain/budget';

export interface NotificationRow {
  id: string;
  user_id: string | null;
  tier: number;
  category: CategoryId | null;
  payload_json: string;
  scheduled_at: string | null;
  delivered_at: string | null;
  snoozed_until: string | null;
}

export const notificationRepo = {
  async list(userId: string | null, limit = 50): Promise<NotificationRow[]> {
    const db = await getDb();
    return db.getAllAsync<NotificationRow>(
      `SELECT * FROM notifications
        WHERE COALESCE(user_id,"") = COALESCE(?,"")
        ORDER BY COALESCE(delivered_at, scheduled_at) DESC
        LIMIT ?`,
      [userId, limit],
    );
  },

  async record(input: {
    userId: string | null;
    tier: number;
    category?: CategoryId | null;
    payload: Record<string, unknown>;
    scheduledAt?: Date;
    deliveredAt?: Date;
  }): Promise<NotificationRow> {
    const db = await getDb();
    const row: NotificationRow = {
      id: newId(),
      user_id: input.userId,
      tier: input.tier,
      category: input.category ?? null,
      payload_json: JSON.stringify(input.payload),
      scheduled_at: input.scheduledAt?.toISOString() ?? null,
      delivered_at: input.deliveredAt?.toISOString() ?? null,
      snoozed_until: null,
    };
    await db.runAsync(
      `INSERT INTO notifications
        (id, user_id, tier, category, payload_json, scheduled_at, delivered_at, snoozed_until)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        row.id,
        row.user_id,
        row.tier,
        row.category,
        row.payload_json,
        row.scheduled_at,
        row.delivered_at,
        row.snoozed_until,
      ],
    );
    return row;
  },

  async snoozeCategory(
    userId: string | null,
    category: CategoryId,
    until: Date,
  ): Promise<void> {
    const db = await getDb();
    await db.runAsync(
      `UPDATE notifications
          SET snoozed_until = ?
        WHERE COALESCE(user_id,"") = COALESCE(?,"")
          AND category = ?
          AND (snoozed_until IS NULL OR snoozed_until < ?)`,
      [until.toISOString(), userId, category, new Date().toISOString()],
    );
  },

  async countToday(userId: string | null): Promise<number> {
    const db = await getDb();
    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);
    const r = await db.getFirstAsync<{ n: number }>(
      `SELECT COUNT(*) AS n FROM notifications
        WHERE COALESCE(user_id,"") = COALESCE(?,"")
          AND delivered_at >= ?`,
      [userId, startOfDay.toISOString()],
    );
    return r?.n ?? 0;
  },

  async snoozedUntil(userId: string | null, category: CategoryId): Promise<Date | null> {
    const db = await getDb();
    const r = await db.getFirstAsync<{ snoozed_until: string | null }>(
      `SELECT MAX(snoozed_until) AS snoozed_until FROM notifications
        WHERE COALESCE(user_id,"") = COALESCE(?,"") AND category = ?`,
      [userId, category],
    );
    if (!r?.snoozed_until) return null;
    const d = new Date(r.snoozed_until);
    return d > new Date() ? d : null;
  },
};
