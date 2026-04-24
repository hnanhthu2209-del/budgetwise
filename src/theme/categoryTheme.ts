// Per-category visual identity: emoji icon + gradient colour pair.
// Matches the accent system in budgetwise-main-screen.html.

import { CategoryId } from '../domain/budget';

export interface CategoryAccent {
  emoji: string;
  iconBg: string;          // icon bubble background (solid tint)
  gradStart: string;       // progress bar gradient start
  gradEnd: string;         // progress bar gradient end
  textColor: string;       // label/amount colour on the card
}

export const CATEGORY_ACCENT: Record<CategoryId, CategoryAccent> = {
  food: {
    emoji: '🍜',
    iconBg: 'rgba(255,107,107,0.15)',
    gradStart: '#FF6B6B',
    gradEnd:   '#FF9F45',
    textColor: '#C0392B',
  },
  shopping: {
    emoji: '🛍️',
    iconBg: 'rgba(255,122,198,0.18)',
    gradStart: '#FF7AC6',
    gradEnd:   '#8B5CF6',
    textColor: '#6D28D9',
  },
  transportation: {
    emoji: '🚕',
    iconBg: 'rgba(79,183,240,0.18)',
    gradStart: '#4FB7F0',
    gradEnd:   '#8B5CF6',
    textColor: '#1D6FA4',
  },
  entertainment: {
    emoji: '🎮',
    iconBg: 'rgba(139,92,246,0.18)',
    gradStart: '#8B5CF6',
    gradEnd:   '#FF7AC6',
    textColor: '#6D28D9',
  },
  bills: {
    emoji: '⚡',
    iconBg: 'rgba(255,159,69,0.20)',
    gradStart: '#FF9F45',
    gradEnd:   '#FF6B6B',
    textColor: '#B45309',
  },
  tax: {
    emoji: '📋',
    iconBg: 'rgba(61,220,151,0.20)',
    gradStart: '#3DDC97',
    gradEnd:   '#4FB7F0',
    textColor: '#0F5132',
  },
};
