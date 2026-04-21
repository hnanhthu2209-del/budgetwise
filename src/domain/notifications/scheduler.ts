// Scheduler — wraps expo-notifications.
// Two trigger sources per the PRD:
//   1. Threshold-based (Tiers 2–4): evaluateThresholds(userId, category)
//      is called after every expense add. Fires Tier 2/3/4 immediately if the
//      threshold just crossed.
//   2. Date-based (Tiers 5, 6, 1, 7): scheduleBillReminders / scheduleTaxReminders
//      register local notifications at creation time (5d/2d/0d for bills,
//      30d/7d/1d for tax).

import * as Notifications from 'expo-notifications';
import { expenseRepo } from '../../data/repositories/expenseRepo';
import { budgetCapRepo } from '../../data/repositories/budgetCapRepo';
import { notificationRepo } from '../../data/repositories/notificationRepo';
import { useSettingsStore } from '../../state/SettingsStore';
import { CategoryId } from '../budget';
import { Tier, tierForPercent, tierMessage } from './tiers';
import { shouldDeliver } from './rules';
import { monthKey } from '../../utils/date';

// Global handler — foreground notifications show as banners
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: false,
    shouldSetBadge: true,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

export async function requestPermissions(): Promise<boolean> {
  const { status } = await Notifications.getPermissionsAsync();
  if (status === 'granted') return true;
  const req = await Notifications.requestPermissionsAsync();
  return req.status === 'granted';
}

// --- Threshold-based -----------------------------------------------------

export async function evaluateThresholds(
  userId: string | null,
  category: CategoryId,
): Promise<void> {
  const cap = (await budgetCapRepo.asMap(userId))[category];
  if (cap == null || cap <= 0) return;

  const totals = await expenseRepo.totalsByCategory(userId);
  const spent = totals[category] ?? 0;
  const percent = spent / cap;
  const tier = tierForPercent(percent);
  if (!tier) return;

  // Has this tier already been delivered this month for this category?
  const already = await alreadyDeliveredThisMonth(userId, category, tier);
  if (already) return;

  const settings = useSettingsStore.getState();
  const ok = await shouldDeliver({
    tier,
    category,
    userId,
    weekendSuppress: settings.weekendSuppress,
    quietHoursStart: settings.quietHoursStart,
    quietHoursEnd: settings.quietHoursEnd,
  });
  if (!ok) {
    // Record it as "suppressed" so the center can still show it later? For MVP
    // we just drop. Record for in-app center without scheduling a push.
    await notificationRepo.record({
      userId,
      tier,
      category,
      payload: { suppressed: true, percent },
      deliveredAt: new Date(),
    });
    return;
  }

  const msg = tierMessage({ tier, category, percent });
  await Notifications.scheduleNotificationAsync({
    content: { title: msg.title, body: msg.body, data: { tier, category } },
    trigger: null, // immediate
  });
  await notificationRepo.record({
    userId,
    tier,
    category,
    payload: { percent, message: msg },
    deliveredAt: new Date(),
  });
}

async function alreadyDeliveredThisMonth(
  userId: string | null,
  category: CategoryId,
  tier: Tier,
): Promise<boolean> {
  const recent = await notificationRepo.list(userId, 50);
  const month = monthKey();
  return recent.some(n => {
    if (n.tier !== tier) return false;
    if (n.category !== category) return false;
    if (!n.delivered_at) return false;
    return n.delivered_at.slice(0, 7) === month;
  });
}

// --- Date-based bill reminders (Tier 5) ---------------------------------

export async function scheduleBillReminders(bill: {
  userId: string | null;
  label: string;
  dueDate: Date;
}): Promise<void> {
  const offsets = [5, 2, 0]; // days before
  for (const d of offsets) {
    const fireAt = new Date(bill.dueDate.getTime() - d * 86400_000);
    if (fireAt.getTime() < Date.now()) continue;
    const msg = tierMessage({ tier: 5, billLabel: bill.label, daysUntilDue: d });
    await Notifications.scheduleNotificationAsync({
      content: { title: msg.title, body: msg.body, data: { tier: 5 } },
      trigger: { date: fireAt } as any,
    });
    await notificationRepo.record({
      userId: bill.userId,
      tier: 5,
      payload: { label: bill.label, dueDate: bill.dueDate.toISOString(), daysBefore: d },
      scheduledAt: fireAt,
    });
  }
}

// --- Tax reminders (Tier 6) ---------------------------------------------

export async function scheduleTaxReminders(tax: {
  userId: string | null;
  dueDate: Date;
  label?: string;
}): Promise<void> {
  const offsets = [30, 7, 1];
  for (const d of offsets) {
    const fireAt = new Date(tax.dueDate.getTime() - d * 86400_000);
    if (fireAt.getTime() < Date.now()) continue;
    const msg = tierMessage({ tier: 6, daysUntilDue: d });
    await Notifications.scheduleNotificationAsync({
      content: { title: msg.title, body: msg.body, data: { tier: 6 } },
      trigger: { date: fireAt } as any,
    });
    await notificationRepo.record({
      userId: tax.userId,
      tier: 6,
      payload: { dueDate: tax.dueDate.toISOString(), daysBefore: d, label: tax.label ?? null },
      scheduledAt: fireAt,
    });
  }
}

// --- Monthly wrap (Tier 7) ----------------------------------------------

export async function scheduleMonthlyWrap(userId: string | null, monthLabel: string, savedPercent: number): Promise<void> {
  const msg = tierMessage({ tier: 7, monthLabel, savedPercent });
  await Notifications.scheduleNotificationAsync({
    content: { title: msg.title, body: msg.body, data: { tier: 7 } },
    trigger: null,
  });
  await notificationRepo.record({
    userId,
    tier: 7,
    payload: { monthLabel, savedPercent },
    deliveredAt: new Date(),
  });
}
