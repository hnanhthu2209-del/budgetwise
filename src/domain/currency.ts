// Currency formatting. VND is default per PRD §5.1 — no decimals.
export type Currency = 'VND' | 'USD' | 'EUR' | 'JPY';

const fractionDigits: Record<Currency, number> = {
  VND: 0,
  JPY: 0,
  USD: 2,
  EUR: 2,
};

const symbols: Record<Currency, string> = {
  VND: '₫',
  USD: '$',
  EUR: '€',
  JPY: '¥',
};

export function formatAmount(amount: number, currency: Currency = 'VND'): string {
  const digits = fractionDigits[currency];
  const formatter = new Intl.NumberFormat('en-US', {
    minimumFractionDigits: digits,
    maximumFractionDigits: digits,
  });
  const sign = amount < 0 ? '-' : '';
  const abs = Math.abs(amount);
  return `${sign}${formatter.format(abs)} ${symbols[currency]}`;
}

export function formatAmountCompact(amount: number, currency: Currency = 'VND'): string {
  const sym = symbols[currency];
  const sign = amount < 0 ? '-' : '';
  const abs = Math.abs(amount);
  if (abs >= 1_000_000_000) return `${sign}${(abs / 1_000_000_000).toFixed(1)}B ${sym}`;
  if (abs >= 1_000_000)     return `${sign}${(abs / 1_000_000).toFixed(1)}M ${sym}`;
  if (abs >= 1_000)         return `${sign}${(abs / 1_000).toFixed(0)}K ${sym}`;
  return formatAmount(amount, currency);
}
