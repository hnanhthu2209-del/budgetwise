import React from 'react';
import { Pressable, Text, ViewStyle, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
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
  const isPrimary = variant === 'primary' && !disabled;
  const isDanger  = variant === 'danger'  && !disabled;

  const inner = (pressed: boolean) => (
    <Text style={[t.button, { color: textColor(variant, disabled), opacity: pressed ? 0.85 : 1 }]}>
      {label}
    </Text>
  );

  if (isPrimary) {
    return (
      <Pressable
        accessibilityRole="button"
        onPress={onPress}
        disabled={disabled}
        style={({ pressed }) => [styles.base, fullWidth && { alignSelf: 'stretch' }, style, pressed && { opacity: 0.85 }]}
      >
        {({ pressed }) => (
          <LinearGradient
            colors={['#FF6B6B', '#FF9F45', '#FF7AC6']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.gradFill}
          >
            {inner(pressed)}
          </LinearGradient>
        )}
      </Pressable>
    );
  }

  if (isDanger) {
    return (
      <Pressable
        accessibilityRole="button"
        onPress={onPress}
        disabled={disabled}
        android_ripple={{ color: 'rgba(0,0,0,0.06)' }}
        style={({ pressed }) => [
          styles.base,
          { backgroundColor: colors.coral },
          fullWidth && { alignSelf: 'stretch' },
          pressed && { opacity: 0.85 },
          style,
        ]}
      >
        {({ pressed }) => inner(pressed)}
      </Pressable>
    );
  }

  // ghost / disabled
  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      disabled={disabled}
      android_ripple={{ color: 'rgba(0,0,0,0.06)' }}
      style={({ pressed }) => [
        styles.base,
        {
          backgroundColor: disabled ? colors.hair : 'transparent',
          borderColor: disabled ? 'transparent' : colors.hair,
        },
        fullWidth && { alignSelf: 'stretch' },
        pressed && !disabled && { opacity: 0.85 },
        style,
      ]}
    >
      {({ pressed }) => inner(pressed)}
    </Pressable>
  );
}

function textColor(v: Variant, disabled?: boolean): string {
  if (disabled) return colors.ink3;
  if (v === 'primary') return '#fff';
  if (v === 'danger')  return '#fff';
  return colors.ink;
}

const styles = StyleSheet.create({
  base: {
    minHeight: 48,
    borderRadius: 14,
    paddingHorizontal: 18,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    overflow: 'hidden',
  },
  gradFill: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
