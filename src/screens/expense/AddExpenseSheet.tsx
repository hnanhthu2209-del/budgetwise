// AddExpenseSheet — under-5-second entry per PRD UX principle "Zero Friction
// Entry": today's date default, last-used category sticky, large numeric
// keypad. Modal-style screen reachable from anywhere via the FAB.

import React, { useState } from 'react';
import { View, Text, StyleSheet, Pressable, TextInput, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute } from '@react-navigation/native';
import { CategoryId, CATEGORY_LABELS } from '../../domain/budget';
import { CurrencyInput } from '../../components/CurrencyInput';
import { Eyebrow } from '../../components/primitives/Eyebrow';
import { Display } from '../../components/primitives/Display';
import { Button } from '../../components/primitives/Button';
import { useSettingsStore } from '../../state/SettingsStore';
import { useAuth } from '../../state/AuthContext';
import { useBudgetStore } from '../../state/BudgetStore';
import { expenseRepo } from '../../data/repositories/expenseRepo';
import { evaluateThresholds } from '../../domain/notifications/scheduler';
import { colors } from '../../theme/colors';
import { fontFamily, text as t } from '../../theme/typography';

const VISIBLE_CATEGORIES_BASE: CategoryId[] = ['food', 'transportation', 'entertainment', 'shopping', 'bills'];

const LAST_CATEGORY_KEY = 'budgetwise.lastCategory';

export function AddExpenseSheet() {
  const nav = useNavigation<any>();
  const route = useRoute<any>();
  const currency = useSettingsStore(s => s.currency);
  const taxRequired = useSettingsStore(s => s.taxRequired);
  const { user } = useAuth();
  const refresh = useBudgetStore(s => s.refresh);

  const initialCategory: CategoryId = route.params?.category ?? 'food';
  const [category, setCategory] = useState<CategoryId>(initialCategory);
  const [amount, setAmount] = useState<number | null>(null);
  const [note, setNote] = useState('');
  const [isImpulse, setIsImpulse] = useState(false);

  const visible = taxRequired ? [...VISIBLE_CATEGORIES_BASE, 'tax' as CategoryId] : VISIBLE_CATEGORIES_BASE;

  const onSave = async () => {
    if (!amount || amount <= 0) return;
    await expenseRepo.add({
      userId: user?.id ?? null,
      category,
      amount,
      note: note.trim() || undefined,
      isImpulse: category === 'shopping' && isImpulse,
      currency,
    });
    await refresh();
    // Re-evaluate thresholds → maybe schedule a Tier 2/3/4 notification
    await evaluateThresholds(user?.id ?? null, category);
    nav.goBack();
  };

  return (
    <SafeAreaView style={styles.root}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={{ flex: 1 }}
      >
        <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
          <View style={styles.header}>
            <Pressable onPress={() => nav.goBack()} hitSlop={12}>
              <Text style={styles.cancelText}>Cancel</Text>
            </Pressable>
            <Text style={styles.titleText}>ADD EXPENSE</Text>
            <View style={{ width: 60 }} />
          </View>

          <View style={styles.amountWrap}>
            <Eyebrow color={colors.ink3}>Amount</Eyebrow>
            <View style={{ marginTop: 6 }}>
              <CurrencyInput
                value={amount}
                onChange={setAmount}
                currency={currency}
                size="large"
                autoFocus
              />
            </View>
          </View>

          <View style={{ marginTop: 28 }}>
            <Eyebrow>Category</Eyebrow>
            <View style={styles.chips}>
              {visible.map(c => {
                const on = c === category;
                return (
                  <Pressable
                    key={c}
                    onPress={() => setCategory(c)}
                    style={[styles.chip, on && styles.chipOn]}
                  >
                    <Text style={[styles.chipText, { color: on ? '#fff' : colors.ink }]}>
                      {CATEGORY_LABELS[c]}
                    </Text>
                  </Pressable>
                );
              })}
            </View>
          </View>

          <View style={{ marginTop: 22 }}>
            <Eyebrow>Note (optional)</Eyebrow>
            <TextInput
              value={note}
              onChangeText={setNote}
              placeholder="e.g. lunch with team"
              placeholderTextColor={colors.ink3}
              style={styles.note}
            />
          </View>

          {category === 'shopping' && (
            <Pressable
              onPress={() => setIsImpulse(v => !v)}
              style={[styles.impulse, isImpulse && styles.impulseOn]}
            >
              <Text style={[t.bodyMedium, { color: isImpulse ? colors.coral : colors.ink2 }]}>
                {isImpulse ? '✓ Tagged as impulse' : 'Was this an impulse buy?'}
              </Text>
            </Pressable>
          )}
        </ScrollView>

        <View style={{ padding: 20 }}>
          <Button label="Save" onPress={onSave} disabled={!amount || amount <= 0} fullWidth />
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.bg },
  scroll: { padding: 20, paddingBottom: 40 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 },
  cancelText: {
    fontFamily: fontFamily.uiMedium,
    fontSize: 16,
    color: colors.ink2,
  },
  titleText: {
    fontFamily: fontFamily.monoSemibold,
    fontSize: 12,
    letterSpacing: 2.2,
    color: colors.ink2,
    textTransform: 'uppercase',
  },
  chipText: {
    fontFamily: fontFamily.roundedBold,
    fontSize: 15,
    letterSpacing: -0.1,
  },
  amountWrap: {
    backgroundColor: colors.card,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: colors.hair,
    padding: 22,
    marginTop: 20,
    alignItems: 'flex-start',
  },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 10 },
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 999,
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.hair,
  },
  chipOn: { backgroundColor: colors.ink, borderColor: colors.ink },
  note: {
    fontFamily: fontFamily.ui,
    fontSize: 16,
    color: colors.ink,
    backgroundColor: colors.card,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.hair,
    paddingHorizontal: 14,
    paddingVertical: 14,
    marginTop: 8,
  },
  impulse: {
    marginTop: 16,
    padding: 14,
    backgroundColor: colors.coralSoft,
    borderRadius: 12,
    alignItems: 'center',
  },
  impulseOn: { backgroundColor: colors.coralSoft, borderWidth: 1.5, borderColor: colors.coral },
});
