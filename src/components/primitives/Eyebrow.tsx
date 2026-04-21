// Small uppercase JetBrains Mono label used above sections, on chips, etc.
import React from 'react';
import { Text, TextProps } from 'react-native';
import { text as t } from '../../theme/typography';
import { colors } from '../../theme/colors';

interface EyebrowProps extends TextProps {
  color?: string;
}

export function Eyebrow({ color = colors.ink3, style, ...rest }: EyebrowProps) {
  return <Text {...rest} style={[t.eyebrow, { color }, style]} />;
}
