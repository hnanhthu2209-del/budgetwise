// Cap math. Used by dashboard, category screens, and the notification engine
// to decide which Tier (1–4) to fire per PRD §6.1.

export type CategoryId =
  | 'entertainment'
  | 'food'
  | 'transportation'
  | 'shopping'
  | 'bills'
  | 'tax';

export const CATEGORY_LABELS: Record<CategoryId, string> = {
  entertainment: 'Entertainment',
  food: 'Food & Drinks',
  transportation: 'Transportation',
  shopping: 'Shopping',
  bills: 'Bills & Payments',
  tax: 'Tax Obligations',
};

export interface CategoryStatus {
  category: CategoryId;
  spent: number;
  cap: number | null;       // null when user hasn't set one
  percentUsed: number;      // 0..1+ — can exceed 1 when over budget
  remaining: number;        // cap - spent (can be negative)
  tier: 0 | 1 | 2 | 3 | 4;  // 0 = no nudge, 1 = check-in, 2 = 70%, 3 = 90%, 4 = 100%
}

export function statusForCategory(
  category: CategoryId,
  spent: number,
  cap: number | null,
): CategoryStatus {
  if (cap == null || cap <= 0) {
    return { category, spent, cap, percentUsed: 0, remaining: 0, tier: 0 };
  }
  const percentUsed = spent / cap;
  const remaining = cap - spent;
  let tier: CategoryStatus['tier'] = 0;
  if (percentUsed >= 1.0) tier = 4;
  else if (percentUsed >= 0.9) tier = 3;
  else if (percentUsed >= 0.7) tier = 2;
  return { category, spent, cap, percentUsed, remaining, tier };
}

export interface MonthBudgetSnapshot {
  income: number;
  totalSpent: number;
  remaining: number;          // income - totalSpent (excludes set-asides)
  taxSetAside: number;        // reserved for tax payments
  projectedSavings: number;   // remaining - taxSetAside (floor 0)
  perCategory: CategoryStatus[];
}

export function summarizeMonth(args: {
  income: number;
  taxSetAside: number;
  perCategory: CategoryStatus[];
}): MonthBudgetSnapshot {
  const totalSpent = args.perCategory.reduce((acc, c) => acc + c.spent, 0);
  const remaining = args.income - totalSpent;
  const projectedSavings = Math.max(0, remaining - args.taxSetAside);
  return {
    income: args.income,
    totalSpent,
    remaining,
    taxSetAside: args.taxSetAside,
    projectedSavings,
    perCategory: args.perCategory,
  };
}
