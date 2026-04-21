import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable, TextInput, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { Display } from '../../components/primitives/Display';
import { Eyebrow } from '../../components/primitives/Eyebrow';
import { Num } from '../../components/primitives/Num';
import { Button } from '../../components/primitives/Button';
import { Card } from '../../components/primitives/Card';
import { CurrencyInput } from '../../components/CurrencyInput';
import { incomeRepo, IncomeRow } from '../../data/repositories/incomeRepo';
import { useAuth } from '../../state/AuthContext';
import { useSettingsStore } from '../../state/SettingsStore';
import { useBudgetStore } from '../../state/BudgetStore';
import { formatAmount } from '../../domain/currency';
import { colors } from '../../theme/colors';
import { fontFamily, text as t } from '../../theme/typography';

export function IncomeScreen() {
  const nav = useNavigation<any>();
  const { user } = useAuth();
  const currency = useSettingsStore(s => s.currency);
  const refresh = useBudgetStore(s => s.refresh);

  const [rows, setRows] = useState<IncomeRow[]>([]);
  const [adding, setAdding] = useState(false);
  const [source, setSource] = useState('');
  const [amount, setAmount] = useState<number | null>(null);

  const reload = useCallback(async () => {
    const r = await incomeRepo.list(user?.id ?? null);
    setRows(r);
  }, [user]);

  useFocusEffect(useCallback(() => { reload(); }, [reload]));

  const total = rows.reduce((acc, r) => acc + r.amount, 0);

  const onSave = async () => {
    if (!source.trim() || !amount || amount <= 0) return;
    await incomeRepo.add({ userId: user?.id ?? null, source: source.trim(), amount, currency });
    await reload();
    await refresh();
    setSource('');
    setAmount(null);
    setAdding(false);
  };

  const onLockToggle = async (row: IncomeRow) => {
    if (row.locked) {
      Alert.alert('Unlock income?', 'You set this as confirmed. Edit anyway?', [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Unlock', onPress: async () => { await incomeRepo.setLocked(row.id, false); await reload(); } },
      ]);
    } else {
      await incomeRepo.setLocked(row.id, true);
      await reload();
    }
  };

  return (
    <SafeAreaView style={styles.root}>
      <ScrollView contentContainerStyle={{ padding: 20, paddingBottom: 80 }}>
        <Pressable onPress={() => nav.goBack()} hitSlop={12}>
          <Text style={[t.bodyMedium, { color: colors.ink2 }]}>← Back</Text>
        </Pressable>
        <Display variant="screen" style={{ marginTop: 18 }}>Income this month</Display>

        <Card style={{ marginTop: 18, alignItems: 'center', paddingVertical: 26 }}>
          <Eyebrow>Total</Eyebrow>
          <Num variant="large" style={{ marginTop: 6 }}>{formatAmount(total, currency)}</Num>
        </Card>

        <View style={{ marginTop: 24 }}>
          <Eyebrow>Sources</Eyebrow>
          <View style={{ marginTop: 8 }}>
            {rows.map(r => (
              <Pressable key={r.id} onPress={() => onLockToggle(r)}>
                <View style={styles.sourceRow}>
                  <View style={{ flex: 1 }}>
                    <Text style={[t.bodyMedium, { color: colors.ink }]}>{r.source}</Text>
                    <Text style={[t.caption, { color: colors.ink3, marginTop: 2 }]}>
                      {r.locked ? 'Locked — long press to edit' : 'Tap to lock'}
                    </Text>
                  </View>
                  <Num>{formatAmount(r.amount, currency)}</Num>
                </View>
              </Pressable>
            ))}
            {rows.length === 0 && (
              <Text style={[t.caption, { color: colors.ink3, marginTop: 8 }]}>No income logged yet.</Text>
            )}
          </View>
        </View>

        {adding ? (
          <Card style={{ marginTop: 22 }}>
            <Eyebrow>New source</Eyebrow>
            <TextInput
              value={source}
              onChangeText={setSource}
              placeholder="e.g. Freelance, Side gig"
              placeholderTextColor={colors.ink3}
              style={styles.input}
            />
            <View style={{ marginTop: 12 }}>
              <CurrencyInput value={amount} onChange={setAmount} currency={currency} />
            </View>
            <View style={{ flexDirection: 'row', gap: 10, marginTop: 14 }}>
              <Button label="Cancel" variant="ghost" onPress={() => setAdding(false)} style={{ flex: 1 }} />
              <Button label="Add" onPress={onSave} disabled={!source.trim() || !amount} style={{ flex: 1 }} />
            </View>
          </Card>
        ) : (
          <Button label="Add another source" variant="ghost" onPress={() => setAdding(true)} style={{ marginTop: 22 }} />
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.bg },
  sourceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.hair,
  },
  input: {
    fontFamily: fontFamily.ui,
    fontSize: 16,
    color: colors.ink,
    backgroundColor: colors.bg,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 12,
    marginTop: 8,
    borderWidth: 1,
    borderColor: colors.hair,
  },
});
