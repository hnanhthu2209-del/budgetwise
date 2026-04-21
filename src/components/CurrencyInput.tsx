// Big tabular numeric input. Mirrors the prototype's "display" treatment for
// numbers: JetBrains Mono, tight tracking. Strips non-digits aggressively so
// users can paste pretty-printed amounts.

import React from 'react';
import { TextInput, TextInputProps, StyleSheet, View, Text } from 'react-native';
import { colors } from '../theme/colors';
import { fontFamily, text as t } from '../theme/typography';
import { Currency } from '../domain/currency';

interface Props extends Omit<TextInputProps, 'value' | 'onChangeText' | 'onChange'> {
  value: number | null;
  onChange: (v: number | null) => void;
  currency?: Currency;
  size?: 'large' | 'default';
}

export function CurrencyInput({
  value,
  onChange,
  currency = 'VND',
  size = 'default',
  ...rest
}: Props) {
  const text = value == null ? '' : value.toLocaleString('en-US');
  return (
    <View style={[styles.wrap, size === 'large' && styles.wrapLarge]}>
      <TextInput
        {...rest}
        value={text}
        keyboardType="number-pad"
        inputMode="numeric"
        placeholder="0"
        placeholderTextColor={colors.ink3}
        onChangeText={s => {
          const cleaned = s.replace(/[^0-9]/g, '');
          onChange(cleaned ? Number(cleaned) : null);
        }}
        style={[
          styles.input,
          size === 'large' ? styles.inputLarge : styles.inputDefault,
        ]}
      />
      <Text
        style={{
          fontFamily: fontFamily.mono,
          color: colors.ink3,
          fontSize: size === 'large' ? 22 : 14,
          marginLeft: 6,
        }}
      >
        {currency === 'VND' ? '₫' : currency === 'USD' ? '$' : currency === 'EUR' ? '€' : '¥'}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { flexDirection: 'row', alignItems: 'baseline' },
  wrapLarge: { paddingVertical: 8 },
  input: {
    fontFamily: fontFamily.monoMedium,
    color: colors.ink,
    minWidth: 80,
    textAlign: 'left',
    fontVariant: ['tabular-nums'],
  } as any,
  inputDefault: { fontSize: 18, letterSpacing: -0.3 },
  inputLarge: { fontSize: 44, letterSpacing: -1 },
});
