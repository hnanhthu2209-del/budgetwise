// Notification tier definitions per PRD §6.1.
// Tone is always supportive — copy mirrors the PRD's examples.

import { CategoryId, CATEGORY_LABELS } from '../budget';

export type Tier = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8;

export interface TierMessage {
  tier: Tier;
  title: string;
  body: string;
  tone: 'encouraging' | 'informative' | 'cautionary' | 'urgent' | 'actionable' | 'reflective' | 'advisory';
}

export function tierMessage(input: {
  tier: Tier;
  category?: CategoryId;
  percent?: number;       // 0..1+
  daysUntilDue?: number;
  monthLabel?: string;    // e.g. "May"
  savedPercent?: number;
  overMonths?: number;    // for Tier 8
  billLabel?: string;
}): TierMessage {
  const { tier, category, percent, daysUntilDue, monthLabel, savedPercent, overMonths, billLabel } = input;
  const cat = category ? CATEGORY_LABELS[category] : '';

  switch (tier) {
    case 1:
      return {
        tier,
        title: 'Friendly check-in',
        body: `You've spent ${Math.round((percent ?? 0) * 100)}% of your budget so far — on track! Keep it up and you may save this month.`,
        tone: 'encouraging',
      };
    case 2:
      return {
        tier,
        title: `${cat} is at 70%`,
        body: `${cat} is at 70% for the month. You've got time to go — slow down a little to stay in budget.`,
        tone: 'informative',
      };
    case 3:
      return {
        tier,
        title: `Almost at your ${cat} limit`,
        body: `Almost at your ${cat} limit. Consider pausing new spending here to stay on track.`,
        tone: 'cautionary',
      };
    case 4:
      return {
        tier,
        title: `${cat} budget reached`,
        body: `You've reached your ${cat} budget. Any further spending here exceeds your plan.`,
        tone: 'urgent',
      };
    case 5:
      return {
        tier,
        title: `${billLabel ?? 'Bill'} due soon`,
        body: daysUntilDue != null && daysUntilDue <= 0
          ? `Your ${billLabel ?? 'bill'} is due today. Mark it paid once done.`
          : `Your ${billLabel ?? 'bill'} is due in ${daysUntilDue} day${daysUntilDue === 1 ? '' : 's'}. Mark it paid once done.`,
        tone: 'actionable',
      };
    case 6:
      return {
        tier,
        title: 'Tax payment reminder',
        body: `Your tax payment is due in ${daysUntilDue} day${daysUntilDue === 1 ? '' : 's'}. Have you set aside enough?`,
        tone: 'actionable',
      };
    case 7:
      return {
        tier,
        title: `${monthLabel ?? 'Month'} summary ready`,
        body: `You stayed within budget in several categories — and saved an estimated ${savedPercent ?? 0}% of your income!`,
        tone: 'reflective',
      };
    case 8:
      return {
        tier,
        title: `${cat} trending over`,
        body: `You've gone over your ${cat} budget ${overMonths ?? 3} months running. Want to adjust the limit or set a stricter target?`,
        tone: 'advisory',
      };
  }
}

export function tierForPercent(percent: number): 2 | 3 | 4 | null {
  if (percent >= 1.0) return 4;
  if (percent >= 0.9) return 3;
  if (percent >= 0.7) return 2;
  return null;
}
