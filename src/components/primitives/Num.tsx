// Num: currency and date numbers.
// Large variant → Nunito Bold (matches redesign).
// Default/small → Inter SemiBold (clean, compact).

import React from 'react';
import { Text, TextProps, StyleSheet } from 'react-native';
import { fontFamily } from '../../theme/typography';
import { colors } from '../../theme/colors';

type NumVariant = 'large' | 'default' | 'small';

interface NumProps extends TextProps {
  variant?: NumVariant;
  color?: string;
}

export function Num({
  variant = 'default',
  color = colors.ink,
  style,
  ...rest
}: NumProps) {
  const base =
    variant === 'large' ? styles.large
    : variant === 'small' ? styles.small
    : styles.default;
  return (
    <Text {...rest} style={[base, { color }, style]} />
  );
}

export const numStyles = StyleSheet.create({
  large:   { fontFamily: fontFamily.roundedBold, fontSize: 32, letterSpacing: -0.6, lineHeight: 36 },
  default: { fontFamily: fontFamily.uiSemibold,  fontSize: 16, letterSpacing: -0.2, lineHeight: 22 },
  small:   { fontFamily: fontFamily.uiMedium,    fontSize: 13, letterSpacing: -0.1, lineHeight: 18 },
});

const styles = StyleSheet.create({
  large:   { fontFamily: fontFamily.roundedBold, fontSize: 32, letterSpacing: -0.6, lineHeight: 36 },
  default: { fontFamily: fontFamily.uiSemibold,  fontSize: 16, letterSpacing: -0.2, lineHeight: 22 },
  small:   { fontFamily: fontFamily.uiMedium,    fontSize: 13, letterSpacing: -0.1, lineHeight: 18 },
});
