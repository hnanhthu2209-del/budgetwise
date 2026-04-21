// Typography stack mirrored from ~/Downloads/BudgetWise.html prototype.
// - Instrument Serif: display / hero numbers / brand mark
// - Inter:            UI body, buttons, list items
// - JetBrains Mono:   numbers, eyebrows, labels (tabular-nums + tight tracking)

import { TextStyle } from 'react-native';

export const fontFamily = {
  display: 'InstrumentSerif_400Regular',
  displayItalic: 'InstrumentSerif_400Regular_Italic',
  ui: 'Inter_400Regular',
  uiMedium: 'Inter_500Medium',
  uiSemibold: 'Inter_600SemiBold',
  uiBold: 'Inter_700Bold',
  mono: 'JetBrainsMono_400Regular',
  monoMedium: 'JetBrainsMono_500Medium',
  monoSemibold: 'JetBrainsMono_600SemiBold',
} as const;

export const text: Record<string, TextStyle> = {
  // Display — Instrument Serif
  hero: {
    fontFamily: fontFamily.display,
    fontSize: 56,
    lineHeight: 60,
    letterSpacing: -1.1,
  },
  title: {
    fontFamily: fontFamily.display,
    fontSize: 34,
    lineHeight: 40,
    letterSpacing: -0.7,
  },
  screenTitle: {
    fontFamily: fontFamily.display,
    fontSize: 28,
    lineHeight: 34,
    letterSpacing: -0.5,
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
    fontFamily: fontFamily.uiSemibold,
    fontSize: 15,
    lineHeight: 20,
    letterSpacing: 0.1,
  },

  // Numbers — JetBrains Mono with tabular-nums
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

// Note: tabular numerals are enforced platform-side via fontVariant on <Text>.
// See components/primitives/Num.tsx for the wrapper.
