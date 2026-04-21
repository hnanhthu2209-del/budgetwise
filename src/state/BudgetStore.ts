// BudgetStore — single source of truth for the dashboard. Recomputes a
// snapshot whenever expenses/income/caps change. Calls into the notification
// engine after every expense to evaluate Tier 2–4 thresholds.

import { create } from 'zustand';
import {
  CategoryId,
  CATEGORY_LABELS,
  CategoryStatus,
  MonthBudgetSnapshot,
  statusForCategory,
  summarizeMonth,
} from '../domain/budget';
import { incomeRepo } from '../data/repositories/incomeRepo';
import { expenseRepo } from '../data/repositories/expenseRepo';
import { budgetCapRepo } from '../data/repositories/budgetCapRepo';
import { taxRepo } from '../data/repositories/taxRepo';
import { monthKey } from '../utils/date';

const CATEGORY_ORDER: CategoryId[] = [
  'entertainment',
  'food',
  'transportation',
  'shopping',
  'bills',
  'tax',
];

interface BudgetState {
  loading: boolean;
  userId: string | null;
  snapshot: MonthBudgetSnapshot | null;

  setUser: (userId: string | null) => void;
  refresh: () => Promise<void>;
}

export const useBudgetStore = create<BudgetState>((set, get) => ({
  loading: false,
  userId: null,
  snapshot: null,

  setUser: userId => {
    if (userId !== get().userId) {
      set({ userId, snapshot: null });
      get().refresh();
    }
  },

  refresh: async () => {
    set({ loading: true });
    try {
      const userId = get().userId;
      const month = monthKey();
      const [income, totalsByCat, caps, taxSetAside] = await Promise.all([
        incomeRepo.totalForMonth(userId, month),
        expenseRepo.totalsByCategory(userId),
        budgetCapRepo.asMap(userId, month),
        taxRepo.setAsideForMonth(userId, month),
      ]);

      const perCategory: CategoryStatus[] = CATEGORY_ORDER.map(c =>
        statusForCategory(c, totalsByCat[c] ?? 0, caps[c] ?? null),
      );

      const snapshot = summarizeMonth({ income, taxSetAside, perCategory });
      set({ snapshot, loading: false });
    } catch (e) {
      set({ loading: false });
      throw e;
    }
  },
}));

export { CATEGORY_LABELS, CATEGORY_ORDER };
