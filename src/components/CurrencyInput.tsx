// Big numeric input. Nunito Bold — matches the rest of the joyful redesign.

import React from 'react';
import { TextInput, TextInputProps, StyleSheet, View, Text } from 'react-native';
import { colors } from '../theme/colors';
import { fontFamily } from '../theme/typography';
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
  const display = value == null ? '' : value.toLocaleString('en-US');
  const sym = currency === 'VND' ? '₫'
             : currency === 'USD' ? '$'
             : currency === 'EUR' ? '€' : '¥';

  return (
    <View style={[styles.wrap, size === 'large' && styles.wrapLarge]}>
      <TextInput
        {...rest}
        value={display}
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
      <Text style={[styles.sym, size === 'large' ? styles.symLarge : styles.symDefault]}>
        {sym}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { flexDirection: 'row', alignItems: 'baseline' },
  wrapLarge: { paddingVertical: 8 },
  input: {
    fontFamily: fontFamily.roundedBold,   // Nunito 700 Bold
    color: colors.ink,
    minWidth: 80,
    textAlign: 'left',
  } as any,
  inputDefault: { fontSize: 20, letterSpacing: -0.3 },
  inputLarge:  { fontSize: 44, letterSpacing: -1 },
  sym: {
    fontFamily: fontFamily.roundedSemi,   // Nunito 600
    color: colors.ink3,
    marginLeft: 6,
  },
  symDefault: { fontSize: 16 },
  symLarge:   { fontSize: 24 },
});
