import React, { useState } from 'react';
import { View, Pressable, StyleSheet, Text } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { Display } from '../../components/primitives/Display';
import { Eyebrow } from '../../components/primitives/Eyebrow';
import { Button } from '../../components/primitives/Button';
import { Card } from '../../components/primitives/Card';
import { Currency } from '../../domain/currency';
import { useSettingsStore } from '../../state/SettingsStore';
import { colors } from '../../theme/colors';
import { text as t, fontFamily } from '../../theme/typography';

const OPTIONS: { code: Currency; name: string; symbol: string }[] = [
  { code: 'VND', name: 'Vietnamese Dong', symbol: '₫' },
  { code: 'USD', name: 'US Dollar', symbol: '$' },
  { code: 'EUR', name: 'Euro', symbol: '€' },
  { code: 'JPY', name: 'Japanese Yen', symbol: '¥' },
];

export function CurrencyPickScreen() {
  const nav = useNavigation<any>();
  const setCurrency = useSettingsStore(s => s.setCurrency);
  const [selected, setSelected] = useState<Currency>('VND');

  return (
    <SafeAreaView style={styles.root}>
      <View>
        <Eyebrow>Step 1 of 3</Eyebrow>
        <Display variant="screen" style={{ marginTop: 10 }}>
          Pick your currency
        </Display>
        <Text style={[t.body, { color: colors.ink2, marginTop: 8 }]}>
          You can change this later in settings.
        </Text>

        <View style={{ gap: 10, marginTop: 22 }}>
          {OPTIONS.map(opt => {
            const on = selected === opt.code;
            return (
              <Pressable key={opt.code} onPress={() => setSelected(opt.code)}>
                <Card style={[styles.row, on && styles.rowOn]}>
                  <Text style={{ fontFamily: fontFamily.mono, fontSize: 22, color: colors.ink, width: 36 }}>{opt.symbol}</Text>
                  <View style={{ flex: 1 }}>
                    <Text style={[t.bodyMedium, { color: colors.ink }]}>{opt.code}</Text>
                    <Text style={[t.caption, { color: colors.ink3 }]}>{opt.name}</Text>
                  </View>
                  <View style={[styles.dot, on && { backgroundColor: colors.sage, borderColor: colors.sage }]} />
                </Card>
              </Pressable>
            );
          })}
        </View>
      </View>

      <Button
        label="Continue"
        onPress={() => {
          setCurrency(selected);
          nav.navigate('IncomeSetup');
        }}
        fullWidth
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, padding: 24, justifyContent: 'space-between', backgroundColor: colors.bg },
  row: { flexDirection: 'row', alignItems: 'center', gap: 14 },
  rowOn: { borderColor: colors.sage, borderWidth: 1.5 },
  dot: { width: 18, height: 18, borderRadius: 9, borderWidth: 1.5, borderColor: colors.hair },
});
