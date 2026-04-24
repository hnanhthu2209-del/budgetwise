// Display: Nunito Black for screen titles and hero numbers.
// Matches the rounded heavy sans-serif from budgetwise-main-screen.html.
import React from 'react';
import { Text, TextProps } from 'react-native';
import { text as t, fontFamily } from '../../theme/typography';
import { colors } from '../../theme/colors';

type DisplayVariant = 'hero' | 'title' | 'screen';

interface DisplayProps extends TextProps {
  variant?: DisplayVariant;
  italic?: boolean;
  color?: string;
}

export function Display({
  variant = 'title',
  italic = false,
  color = colors.ink,
  style,
  ...rest
}: DisplayProps) {
  const base =
    variant === 'hero' ? t.hero : variant === 'screen' ? t.screenTitle : t.title;
  return (
    <Text
      {...rest}
      style={[
        base,
        italic && { fontFamily: fontFamily.displayMed, fontStyle: 'italic' },
        { color },
        style,
      ]}
    />
  );
}
