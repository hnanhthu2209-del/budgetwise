// Delivery rules per PRD §6.2:
// - Max 3 push notifications/day (bill due reminders exempt)
// - Tier 4 always delivered, only snoozable 24h
// - Weekend suppression except bill reminders
// - Quiet hours from settings
// - 7d category snooze for Tiers 2–3

import { isWeekend } from '../../utils/date';
import { notificationRepo } from '../../data/repositories/notificationRepo';
import { Tier } from './tiers';
import { CategoryId } from '../budget';

interface RuleInput {
  tier: Tier;
  category: CategoryId | null;
  userId: string | null;
  weekendSuppress: boolean;
  quietHoursStart: number | null;
  quietHoursEnd: number | null;
  now?: Date;
}

export async function shouldDeliver(input: RuleInput): Promise<boolean> {
  const now = input.now ?? new Date();
  const isBill = input.tier === 5;
  const isTax = input.tier === 6;

  // Weekend suppression (except bills)
  if (input.weekendSuppress && isWeekend(now) && !isBill) return false;

  // Quiet hours (except bills & Tier 4)
  if (input.tier !== 4 && !isBill && inQuietHours(now, input.quietHoursStart, input.quietHoursEnd)) {
    return false;
  }

  // Daily cap (3) — bills & tax reminders exempt
  if (!isBill && !isTax) {
    const countToday = await notificationRepo.countToday(input.userId);
    if (countToday >= 3) return false;
  }

  // Category snooze for Tiers 2–3
  if ((input.tier === 2 || input.tier === 3) && input.category) {
    const snoozedUntil = await notificationRepo.snoozedUntil(input.userId, input.category);
    if (snoozedUntil && snoozedUntil > now) return false;
  }

  return true;
}

function inQuietHours(now: Date, start: number | null, end: number | null): boolean {
  if (start == null || end == null) return false;
  const h = now.getHours();
  if (start === end) return false;
  if (start < end) return h >= start && h < end;
  // wraps midnight (e.g., 22→7)
  return h >= start || h < end;
}
