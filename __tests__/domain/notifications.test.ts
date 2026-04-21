import { tierForPercent, tierMessage } from '../../src/domain/notifications/tiers';

jest.mock('../../src/data/repositories/notificationRepo', () => ({
  notificationRepo: {
    countToday: jest.fn(),
    snoozedUntil: jest.fn(),
  },
}));

import { shouldDeliver } from '../../src/domain/notifications/rules';
import { notificationRepo } from '../../src/data/repositories/notificationRepo';

const repo = notificationRepo as jest.Mocked<typeof notificationRepo>;

describe('tierForPercent', () => {
  it('maps thresholds correctly', () => {
    expect(tierForPercent(0.5)).toBeNull();
    expect(tierForPercent(0.7)).toBe(2);
    expect(tierForPercent(0.9)).toBe(3);
    expect(tierForPercent(1.0)).toBe(4);
    expect(tierForPercent(1.5)).toBe(4);
  });
});

describe('tierMessage', () => {
  it('renders tier 2 with category label', () => {
    const m = tierMessage({ tier: 2, category: 'food' });
    expect(m.title).toContain('70%');
    expect(m.body).toContain('Food');
  });

  it('renders tier 5 bill-due-today when daysUntilDue is 0', () => {
    const m = tierMessage({ tier: 5, billLabel: 'Electricity', daysUntilDue: 0 });
    expect(m.body).toMatch(/due today/i);
  });

  it('renders tier 5 with day count', () => {
    const m = tierMessage({ tier: 5, billLabel: 'Rent', daysUntilDue: 2 });
    expect(m.body).toContain('2 days');
  });
});

describe('shouldDeliver', () => {
  beforeEach(() => {
    repo.countToday.mockReset();
    repo.snoozedUntil.mockReset();
    repo.countToday.mockResolvedValue(0);
    repo.snoozedUntil.mockResolvedValue(null);
  });

  const baseInput = {
    tier: 2 as const,
    category: 'food' as const,
    userId: 'u1',
    weekendSuppress: true,
    quietHoursStart: 22,
    quietHoursEnd: 7,
  };

  it('suppresses non-bill notifications on weekends', async () => {
    // 2026-04-18 is a Saturday
    const sat = new Date(2026, 3, 18, 10, 0);
    const ok = await shouldDeliver({ ...baseInput, now: sat });
    expect(ok).toBe(false);
  });

  it('lets bill reminders through on weekends', async () => {
    const sat = new Date(2026, 3, 18, 10, 0);
    const ok = await shouldDeliver({ ...baseInput, tier: 5, category: null, now: sat });
    expect(ok).toBe(true);
  });

  it('blocks when daily cap reached', async () => {
    repo.countToday.mockResolvedValue(3);
    const weekday = new Date(2026, 3, 20, 10, 0); // Monday
    const ok = await shouldDeliver({ ...baseInput, now: weekday });
    expect(ok).toBe(false);
  });

  it('honors quiet hours that wrap midnight', async () => {
    const weekdayMidnight = new Date(2026, 3, 20, 23, 0);
    const ok = await shouldDeliver({ ...baseInput, now: weekdayMidnight });
    expect(ok).toBe(false);
  });

  it('allows Tier 4 through quiet hours', async () => {
    const weekdayMidnight = new Date(2026, 3, 20, 23, 0);
    const ok = await shouldDeliver({ ...baseInput, tier: 4, now: weekdayMidnight });
    expect(ok).toBe(true);
  });

  it('blocks when category is snoozed', async () => {
    const weekday = new Date(2026, 3, 20, 10, 0);
    repo.snoozedUntil.mockResolvedValue(new Date(2026, 3, 25));
    const ok = await shouldDeliver({ ...baseInput, now: weekday });
    expect(ok).toBe(false);
  });
});
