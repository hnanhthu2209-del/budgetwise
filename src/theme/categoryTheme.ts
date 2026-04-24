// Per-category visual identity.
// Chart colours taken directly from finance-tracker.html donut segments.

import { CategoryId } from '../domain/budget';

export interface CategoryAccent {
  emoji: string;
  iconBg: string;
  gradStart: string;   // progress bar / chart colour (start)
  gradEnd: string;     // progress bar gradient end
  chartColor: string;  // flat colour used in the donut legend + dot
  textColor: string;   // label colour on accent backgrounds
}

export const CATEGORY_ACCENT: Record<CategoryId, CategoryAccent> = {
  food: {
    emoji: '🍜',
    iconBg: 'rgba(232,77,138,0.12)',
    gradStart: '#E84D8A',
    gradEnd:   '#F0923A',
    chartColor: '#E84D8A',
    textColor: '#A01060',
  },
  shopping: {
    emoji: '🛍️',
    iconBg: 'rgba(240,146,58,0.15)',
    gradStart: '#F0923A',
    gradEnd:   '#E84D8A',
    chartColor: '#F0923A',
    textColor: '#A05010',
  },
  transportation: {
    emoji: '🚕',
    iconBg: 'rgba(90,171,223,0.15)',
    gradStart: '#5AABDF',
    gradEnd:   '#7C5CBF',
    chartColor: '#5AABDF',
    textColor: '#1D6FA4',
  },
  entertainment: {
    emoji: '🎮',
    iconBg: 'rgba(59,173,117,0.15)',
    gradStart: '#3BAD75',
    gradEnd:   '#3CC9A0',
    chartColor: '#3BAD75',
    textColor: '#1A6B44',
  },
  bills: {
    emoji: '⚡',
    iconBg: 'rgba(124,92,191,0.15)',
    gradStart: '#7C5CBF',
    gradEnd:   '#5AABDF',
    chartColor: '#7C5CBF',
    textColor: '#5A3E9A',
  },
  tax: {
    emoji: '📋',
    iconBg: 'rgba(60,201,160,0.15)',
    gradStart: '#3CC9A0',
    gradEnd:   '#5AABDF',
    chartColor: '#3CC9A0',
    textColor: '#1A7A60',
  },
};
