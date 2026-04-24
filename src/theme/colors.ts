// Joyful palette — ported from budgetwise-main-screen.html design tokens.
// Vibrant gradients: coral + tangerine hero, violet + pink accents, mint savings.

export const colors = {
  // Backgrounds
  bg:          '#FFF8EE',   // warm cream page
  paper:       '#FFF8EE',
  card:        '#FFFFFF',   // raised card surface

  // Text
  ink:         '#1F1A2E',   // deep purple-black
  ink2:        '#6B6478',   // secondary / muted
  ink3:        '#9E95AB',   // tertiary / placeholder
  hair:        '#F1E6D0',   // hairline borders

  // Brand accent spectrum
  coral:       '#FF6B6B',
  tangerine:   '#FF9F45',
  sun:         '#FFD23F',
  mint:        '#3DDC97',
  sky:         '#4FB7F0',
  violet:      '#8B5CF6',
  pink:        '#FF7AC6',

  // Soft tint variants
  coralSoft:   '#FFE4DC',
  tangerineSoft:'#FFF1E8',
  mintSoft:    '#D5F5E5',
  skySoft:     '#E5F4FF',
  violetSoft:  '#EDE9FF',
  amberSoft:   '#FFF1E8',

  // Legacy aliases (used in bills / notification screens)
  sage:        '#3DDC97',
  sageSoft:    '#D5F5E5',
  sageInk:     '#0F5132',
  amber:       '#FF9F45',
} as const;

export type ColorToken = keyof typeof colors;

// Semantic helpers — map budget percentage to a colour
export function budgetStateColor(percentUsed: number): string {
  if (percentUsed >= 1.0) return colors.coral;
  if (percentUsed >= 0.9) return colors.coral;
  if (percentUsed >= 0.7) return colors.tangerine;
  return colors.mint;
}

export function budgetStateSoftColor(percentUsed: number): string {
  if (percentUsed >= 0.9) return colors.coralSoft;
  if (percentUsed >= 0.7) return colors.tangerineSoft;
  return colors.mintSoft;
}
