// Typography stack — joyful redesign.
// Nunito:         display headlines, screen titles, hero numbers (rounded, heavy)
// Inter:          UI body, buttons, list items
// JetBrains Mono: monospaced numbers, eyebrow labels (tabular-nums, tight tracking)

import { TextStyle } from 'react-native';

export const fontFamily = {
  // Display / headings — Nunito rounded sans
  display:      'Nunito_900Black',
  displayBold:  'Nunito_800ExtraBold',
  displayMed:   'Nunito_700Bold',

  // Kept for any legacy references (no longer used for titles)
  displaySerif:       'InstrumentSerif_400Regular',
  displaySerifItalic: 'InstrumentSerif_400Regular_Italic',

  // UI — Inter
  ui:        'Inter_400Regular',
  uiMedium:  'Inter_500Medium',
  uiSemibold:'Inter_600SemiBold',
  uiBold:    'Inter_700Bold',

  // Nunito UI aliases (for new screens that want full-Nunito)
  rounded:       'Nunito_400Regular',
  roundedSemi:   'Nunito_600SemiBold',
  roundedBold:   'Nunito_700Bold',
  roundedXBold:  'Nunito_800ExtraBold',
  roundedBlack:  'Nunito_900Black',

  // Monospaced numbers
  mono:        'JetBrainsMono_400Regular',
  monoMedium:  'JetBrainsMono_500Medium',
  monoSemibold:'JetBrainsMono_600SemiBold',
} as const;

export const text: Record<string, TextStyle> = {
  // Display — Nunito Black (matches HTML h1 font-weight: 800–900)
  hero: {
    fontFamily: fontFamily.display,
    fontSize: 56,
    lineHeight: 60,
    letterSpacing: -1.2,
  },
  title: {
    fontFamily: fontFamily.display,
    fontSize: 34,
    lineHeight: 40,
    letterSpacing: -0.8,
  },
  screenTitle: {
    fontFamily: fontFamily.display,
    fontSize: 28,
    lineHeight: 34,
    letterSpacing: -0.6,
  },

  // UI — Inter
  body: {
    fontFamily: fontFamily.ui,
    fontSize: 15,
    lineHeight: 22,
  },
  bodyMedium: {
    fontFamily: fontFamily.uiMedium,
    fontSize: 15,
    lineHeight: 22,
  },
  caption: {
    fontFamily: fontFamily.ui,
    fontSize: 13,
    lineHeight: 18,
  },
  button: {
    fontFamily: fontFamily.roundedBold,
    fontSize: 15,
    lineHeight: 20,
    letterSpacing: 0.2,
  },

  // Numbers — JetBrains Mono
  numLarge: {
    fontFamily: fontFamily.monoMedium,
    fontSize: 32,
    lineHeight: 36,
    letterSpacing: -0.6,
  },
  num: {
    fontFamily: fontFamily.monoMedium,
    fontSize: 16,
    lineHeight: 22,
    letterSpacing: -0.3,
  },
  numSmall: {
    fontFamily: fontFamily.mono,
    fontSize: 13,
    lineHeight: 18,
    letterSpacing: -0.2,
  },

  // Eyebrows / labels — JetBrains Mono uppercase
  eyebrow: {
    fontFamily: fontFamily.monoMedium,
    fontSize: 11,
    lineHeight: 14,
    letterSpacing: 1.4,
    textTransform: 'uppercase',
  },
};
