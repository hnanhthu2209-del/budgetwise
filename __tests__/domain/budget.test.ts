import {
  statusForCategory,
  summarizeMonth,
  CategoryStatus,
} from '../../src/domain/budget';

describe('statusForCategory', () => {
  it('returns tier 0 when cap is null', () => {
    const s = statusForCategory('food', 100_000, null);
    expect(s.tier).toBe(0);
    expect(s.percentUsed).toBe(0);
  });

  it('returns tier 0 below 70%', () => {
    const s = statusForCategory('food', 500, 1000);
    expect(s.tier).toBe(0);
    expect(s.percentUsed).toBeCloseTo(0.5);
    expect(s.remaining).toBe(500);
  });

  it('returns tier 2 at 70%', () => {
    expect(statusForCategory('food', 700, 1000).tier).toBe(2);
  });

  it('returns tier 3 at 90%', () => {
    expect(statusForCategory('food', 900, 1000).tier).toBe(3);
  });

  it('returns tier 4 at 100% and above', () => {
    expect(statusForCategory('food', 1000, 1000).tier).toBe(4);
    expect(statusForCategory('food', 1200, 1000).tier).toBe(4);
  });

  it('allows negative remaining when over cap', () => {
    const s = statusForCategory('shopping', 1500, 1000);
    expect(s.remaining).toBe(-500);
  });
});

describe('summarizeMonth', () => {
  const cats: CategoryStatus[] = [
    { category: 'food', spent: 2000, cap: 4000, percentUsed: 0.5, remaining: 2000, tier: 0 },
    { category: 'transportation', spent: 1000, cap: null, percentUsed: 0, remaining: 0, tier: 0 },
  ];

  it('computes totals and savings', () => {
    const snap = summarizeMonth({ income: 10_000, taxSetAside: 1000, perCategory: cats });
    expect(snap.totalSpent).toBe(3000);
    expect(snap.remaining).toBe(7000);
    expect(snap.projectedSavings).toBe(6000);
  });

  it('floors projected savings at 0', () => {
    const snap = summarizeMonth({ income: 2000, taxSetAside: 500, perCategory: cats });
    // remaining = -1000; projectedSavings floored at 0
    expect(snap.projectedSavings).toBe(0);
  });
});
