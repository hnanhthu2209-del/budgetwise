import React from 'react';
import { Pressable, View, Text, ViewStyle, StyleSheet } from 'react-native';
import { colors } from '../../theme/colors';
import { text as t } from '../../theme/typography';

type Variant = 'primary' | 'ghost' | 'danger';

interface Props {
  label: string;
  onPress?: () => void;
  variant?: Variant;
  disabled?: boolean;
  style?: ViewStyle;
  fullWidth?: boolean;
}

export function Button({
  label,
  onPress,
  variant = 'primary',
  disabled,
  style,
  fullWidth,
}: Props) {
  const palette = variantStyle(variant, disabled);
  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      disabled={disabled}
      android_ripple={{ color: 'rgba(0,0,0,0.06)' }}
      style={({ pressed }) => [
        styles.base,
        { backgroundColor: palette.bg, borderColor: palette.border },
        fullWidth && { alignSelf: 'stretch' },
        pressed && !disabled && { opacity: 0.85 },
        style,
      ]}
    >
      <Text style={[t.button, { color: palette.fg }]}>{label}</Text>
    </Pressable>
  );
}

function variantStyle(v: Variant, disabled?: boolean) {
  if (disabled) return { bg: colors.hair, fg: colors.ink3, border: 'transparent' };
  switch (v) {
    case 'primary':
      return { bg: colors.sage, fg: colors.paper, border: 'transparent' };
    case 'danger':
      return { bg: colors.coral, fg: '#fff', border: 'transparent' };
    case 'ghost':
    default:
      return { bg: 'transparent', fg: colors.ink, border: colors.hair };
  }
}

const styles = StyleSheet.create({
  base: {
    minHeight: 48,
    borderRadius: 14,
    paddingHorizontal: 18,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
  },
});
