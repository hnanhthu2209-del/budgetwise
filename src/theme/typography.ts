// Typography stack — airy revision.
// Nunito 700 Bold:   screen titles, headings (lighter than the previous 900 Black)
// Inter:             UI body, eyebrow labels, buttons
// JetBrains Mono:    currency/date numbers (tabular figures)

import { TextStyle } from 'react-native';

export const fontFamily = {
  // Display / headings — Nunito Bold (was 900 Black; dropped two weights for air)
  display:      'Nunito_700Bold',       // screen titles, main headings
  displayBold:  'Nunito_800ExtraBold',  // hero numbers, emphasis
  displayMed:   'Nunito_600SemiBold',   // sub-headings, card labels

  // Legacy aliases (kept so any import that references these still compiles)
  displaySerif:       'InstrumentSerif_400Regular',
  displaySerifItalic: 'InstrumentSerif_400Regular_Italic',

  // UI — Inter
  ui:        'Inter_400Regular',
  uiMedium:  'Inter_500Medium',
  uiSemibold:'Inter_600SemiBold',
  uiBold:    'Inter_700Bold',

  // Nunito convenience aliases
  rounded:       'Nunito_400Regular',
  roundedSemi:   'Nunito_600SemiBold',
  roundedBold:   'Nunito_700Bold',
  roundedXBold:  'Nunito_800ExtraBold',
  roundedBlack:  'Nunito_900Black',     // kept for FAB/avatar if ever needed

  // Monospaced numbers
  mono:        'JetBrainsMono_400Regular',
  monoMedium:  'JetBrainsMono_500Medium',
  monoSemibold:'JetBrainsMono_600SemiBold',
} as const;

export const text: Record<string, TextStyle> = {
  // Display — Nunito Bold (lighter, more air)
  hero: {
    fontFamily: fontFamily.displayBold,   // 800 ExtraBold for the very largest numbers
    fontSize: 52,
    lineHeight: 58,
    letterSpacing: -0.8,
  },
  title: {
    fontFamily: fontFamily.display,       // 700 Bold
    fontSize: 32,
    lineHeight: 38,
    letterSpacing: -0.5,
  },
  screenTitle: {
    fontFamily: fontFamily.display,       // 700 Bold
    fontSize: 26,
    lineHeight: 32,
    letterSpacing: -0.4,
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
    fontFamily: fontFamily.roundedBold,   // Nunito 700 Bold
    fontSize: 15,
    lineHeight: 20,
    letterSpacing: 0.1,
  },

  // Numbers — JetBrains Mono (tabular figures for currency)
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

  // Eyebrow labels — Inter Regular, airy uppercase tracking
  // Previously JetBrains Mono which felt technical/dense.
  eyebrow: {
    fontFamily: fontFamily.uiMedium,      // Inter 500 Medium — lighter and more open
    fontSize: 11,
    lineHeight: 14,
    letterSpacing: 1.8,                   // more air between letters
    textTransform: 'uppercase',
  },
};
