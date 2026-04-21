// Num: enforces JetBrains Mono with tabular numerals everywhere money or
// dates render. Variants align with theme/typography.ts.
import React from 'react';
import { Text, TextProps, StyleSheet } from 'react-native';
import { text as t } from '../../theme/typography';
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
    variant === 'large' ? t.numLarge : variant === 'small' ? t.numSmall : t.num;
  return (
    <Text
      {...rest}
      // tabular-nums on iOS via fontVariant; Android picks it up from the
      // bundled JetBrainsMono Regular which already ships tabular figures.
      style={[base, { color, fontVariant: ['tabular-nums'] }, style]}
    />
  );
}

export const numStyles = StyleSheet.create({
  // For inline composition when callers want raw style refs.
  large: t.numLarge,
  default: t.num,
  small: t.numSmall,
});
