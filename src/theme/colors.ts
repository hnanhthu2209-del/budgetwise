// Design tokens lifted from ~/Downloads/BudgetWise.html (lines 13–31).
// Calm minimal palette: warm off-white + sage + muted amber.

export const colors = {
  bg:        '#f6f1e8',  // warm off-white page background
  paper:     '#fffaf1',  // app surface / scroll background
  card:      '#ffffff',  // raised cards
  ink:       '#1a1e1a',  // primary text
  ink2:      '#4e554c',  // secondary text
  ink3:      '#8a8f86',  // tertiary text / labels
  hair:      '#ebe2d2',  // hairline borders & dividers

  sage:      '#4ea574',  // primary accent — on-budget, savings, success
  sageSoft:  '#d1ecd7',
  sageInk:   '#1f5a3a',

  amber:     '#e2a93a',  // warning — Tier 2–3 nudges (70%, 90%)
  amberSoft: '#fce6b8',

  coral:     '#e36a5a',  // urgent — Tier 4 over-budget, overdue bills
  coralSoft: '#ffd8d0',

  sky:       '#4e8fc9',  // info — bills, neutral chips, links
  skySoft:   '#d2e4f4',
} as const;

export type ColorToken = keyof typeof colors;

// Semantic helpers — map budget state to a color
export function budgetStateColor(percentUsed: number): string {
  if (percentUsed >= 1.0) return colors.coral;
  if (percentUsed >= 0.9) return colors.coral;
  if (percentUsed >= 0.7) return colors.amber;
  return colors.sage;
}

export function budgetStateSoftColor(percentUsed: number): string {
  if (percentUsed >= 0.9) return colors.coralSoft;
  if (percentUsed >= 0.7) return colors.amberSoft;
  return colors.sageSoft;
}
