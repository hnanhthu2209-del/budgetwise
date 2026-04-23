// Shared category detail: one layout, six configurations driven by the
// `category` route param. Each category has its own "sub-types" quick chips
// per PRD §5.2, but the rest (budget cap, progress, expenses list) is shared.

import React, { useCallback, useState } from 'react';
import { View, Text, ScrollView, StyleSheet, Pressable, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute, useFocusEffect } from '@react-navigation/native';
import { Display } from '../../components/primitives/Display';
import { Eyebrow } from '../../components/primitives/Eyebrow';
import { Num } from '../../components/primitives/Num';
import { Card } from '../../components/primitives/Card';
import { Button } from '../../components/primitives/Button';
import { BudgetProgressBar } from '../../components/BudgetProgressBar';
import { ExpenseListItem } from '../../components/ExpenseListItem';
import { CurrencyInput } from '../../components/CurrencyInput';
import { CategoryId, CATEGORY_LABELS, statusForCategory } from '../../domain/budget';
import { CATEGORY_SUBTYPES } from './categoryConfig';
import { expenseRepo, ExpenseRow } from '../../data/repositories/expenseRepo';
import { budgetCapRepo } from '../../data/repositories/budgetCapRepo';
import { useAuth } from '../../state/AuthContext';
import { useSettingsStore } from '../../state/SettingsStore';
import { useBudgetStore } from '../../state/BudgetStore';
import { formatAmount } from '../../domain/currency';
import { colors, budgetStateColor } from '../../theme/colors';
import { text as t } from '../../theme/typography';

export function CategoryDetailScreen() {
  const nav = useNavigation<any>();
  const route = useRoute<any>();
  const category = route.params.category as CategoryId;
  const { user } = useAuth();
  const currency = useSettingsStore(s => s.currency);
  const refreshSnapshot = useBudgetStore(s => s.refresh);

  const [expenses, setExpenses] = useState<ExpenseRow[]>([]);
  const [cap, setCap] = useState<number | null>(null);
  const [editingCap, setEditingCap] = useState(false);
  const [capDraft, setCapDraft] = useState<number | null>(null);

  const reload = useCallback(async () => {
    const all = await expenseRepo.listForMonth(user?.id ?? null);
    setExpenses(all.filter(e => e.category === category));
    const map = await budgetCapRepo.asMap(user?.id ?? null);
    setCap(map[category] ?? null);
  }, [user, category]);

  useFocusEffect(useCallback(() => { reload(); }, [reload]));

  const spent = expenses.reduce((acc, e) => acc + e.amount, 0);
  const status = statusForCategory(category, spent, cap);
  const tint = budgetStateColor(status.percentUsed);

  const saveCap = async () => {
    if (capDraft != null && capDraft > 0) {
      await budgetCapRepo.setCap(user?.id ?? null, category, capDraft);
    } else {
      await budgetCapRepo.clearCap(user?.id ?? null, category);
    }
    await reload();
    await refreshSnapshot();
    setEditingCap(false);
  };

  const subtypes = CATEGORY_SUBTYPES[category] ?? [];

  return (
    <SafeAreaView style={styles.root}>
      <ScrollView contentContainerStyle={{ padding: 20, paddingBottom: 40 }}>
        <Pressable onPress={() => nav.goBack()} hitSlop={12}>
          <Text style={[t.bodyMedium, { color: colors.ink2 }]}>← Back</Text>
        </Pressable>
        <Eyebrow style={{ marginTop: 14 }}>This month</Eyebrow>
        <Display variant="screen" style={{ marginTop: 6 }}>
          {CATEGORY_LABELS[category]}
        </Display>

        <Card style={{ marginTop: 20, paddingVertical: 22 }}>
          <Eyebrow>Spent</Eyebrow>
          <Num
            variant="large"
            color={tint}
            style={{ marginTop: 4 }}
            adjustsFontSizeToFit
            numberOfLines={1}
          >
            {formatAmount(spent, currency)}
          </Num>
          {cap != null && (
            <Text style={[t.caption, { color: colors.ink3, marginTop: 2 }]}>
              of {formatAmount(cap, currency)} budget
            </Text>
          )}
          {cap != null && (
            <View style={{ marginTop: 14 }}>
              <BudgetProgressBar percentUsed={status.percentUsed} height={8} />
              <Text style={[t.caption, { color: colors.ink3, marginTop: 8 }]}>
                {Math.round(status.percentUsed * 100)}% used · {formatAmount(Math.max(0, cap - spent), currency)} remaining
              </Text>
            </View>
          )}
        </Card>

        {/* Budget cap editor */}
        {editingCap ? (
          <Card style={{ marginTop: 14 }}>
            <Eyebrow>Monthly limit</Eyebrow>
            <View style={{ marginTop: 8 }}>
              <CurrencyInput value={capDraft} onChange={setCapDraft} currency={currency} />
            </View>
            <View style={{ flexDirection: 'row', gap: 10, marginTop: 14 }}>
              <Button label="Cancel" variant="ghost" onPress={() => setEditingCap(false)} style={{ flex: 1 }} />
              <Button label="Save" onPress={saveCap} style={{ flex: 1 }} />
            </View>
          </Card>
        ) : (
          <Pressable
            onPress={() => {
              setCapDraft(cap);
              setEditingCap(true);
            }}
            style={{ marginTop: 14 }}
          >
            <Text style={[t.bodyMedium, { color: colors.sage }]}>
              {cap ? 'Edit monthly limit' : 'Set a monthly limit →'}
            </Text>
          </Pressable>
        )}

        {/* Sub-type quick-add chips */}
        {subtypes.length > 0 && (
          <View style={{ marginTop: 22 }}>
            <Eyebrow>Quick add</Eyebrow>
            <View style={styles.chips}>
              {subtypes.map(s => (
                <Pressable
                  key={s}
                  onPress={() =>
                    nav.getParent()?.navigate('AddExpense', { category, subType: s })
                  }
                  style={styles.chip}
                >
                  <Text style={[t.bodyMedium, { color: colors.ink }]}>{s}</Text>
                </Pressable>
              ))}
            </View>
          </View>
        )}

        <View style={{ marginTop: 24 }}>
          <Eyebrow>Recent</Eyebrow>
          <View style={{ marginTop: 8 }}>
            {expenses.length === 0 ? (
              <Text style={[t.caption, { color: colors.ink3, marginTop: 8 }]}>
                No expenses logged in this category yet.
              </Text>
            ) : (
              expenses.map(e => (
                <ExpenseListItem
                  key={e.id}
                  expense={e}
                  currency={currency}
                  onLongPress={() => {
                    Alert.alert('Delete expense?', undefined, [
                      { text: 'Cancel', style: 'cancel' },
                      {
                        text: 'Delete',
                        style: 'destructive',
                        onPress: async () => {
                          await expenseRepo.remove(e.id);
                          await reload();
                          await refreshSnapshot();
                        },
                      },
                    ]);
                  }}
                />
              ))
            )}
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.bg },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 10 },
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 999,
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.hair,
  },
});
