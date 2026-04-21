// Tax estimation helpers. Purely informational per PRD §5.2.6 disclaimer.

export interface TaxBracket {
  /** annual ceiling (inclusive) for this bracket */
  upTo: number | null; // null = infinity
  rate: number;        // 0..1
}

// Illustrative Vietnam PIT brackets (for reference; user can override).
export const VN_PIT_BRACKETS: TaxBracket[] = [
  { upTo: 60_000_000, rate: 0.05 },
  { upTo: 120_000_000, rate: 0.10 },
  { upTo: 216_000_000, rate: 0.15 },
  { upTo: 384_000_000, rate: 0.20 },
  { upTo: 624_000_000, rate: 0.25 },
  { upTo: 960_000_000, rate: 0.30 },
  { upTo: null, rate: 0.35 },
];

export function estimateAnnualTax(annualIncome: number, brackets: TaxBracket[] = VN_PIT_BRACKETS): number {
  let remaining = annualIncome;
  let prev = 0;
  let total = 0;
  for (const b of brackets) {
    const ceiling = b.upTo ?? Number.POSITIVE_INFINITY;
    const band = Math.max(0, Math.min(remaining, ceiling - prev));
    total += band * b.rate;
    remaining -= band;
    prev = ceiling;
    if (remaining <= 0) break;
  }
  return Math.round(total);
}

export function estimateMonthlySetAside(monthlyIncome: number, brackets?: TaxBracket[]): number {
  const annual = estimateAnnualTax(monthlyIncome * 12, brackets);
  return Math.round(annual / 12);
}
