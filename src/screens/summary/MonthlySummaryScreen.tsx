// Tier 7 wrap-up: per-category over/under, savings %, "You stayed within
// budget in N categories."

import React, { useCallback, useEffect, useState } from 'react';
import { View, Text, ScrollView, StyleSheet, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { format } from 'date-fns';
import { Display } from '../../components/primitives/Display';
import { Eyebrow } from '../../components/primitives/Eyebrow';
import { Num } from '../../components/primitives/Num';
import { Card } from '../../components/primitives/Card';
import { useBudgetStore } from '../../state/BudgetStore';
import { useSettingsStore } from '../../state/SettingsStore';
import { useAuth } from '../../state/AuthContext';
import { CATEGORY_LABELS } from '../../domain/budget';
import { formatAmount } from '../../domain/currency';
import { colors, budgetStateColor } from '../../theme/colors';
import { text as t } from '../../theme/typography';

export function MonthlySummaryScreen() {
  const nav = useNavigation();
  const { user } = useAuth();
  const currency = useSettingsStore(s => s.currency);
  const taxRequired = useSettingsStore(s => s.taxRequired);
  const refresh = useBudgetStore(s => s.refresh);
  const setUser = useBudgetStore(s => s.setUser);
  const snapshot = useBudgetStore(s => s.snapshot);

  useEffect(() => { setUser(user?.id ?? null); refresh(); }, [user, refresh, setUser]);

  const categories = (snapshot?.perCategory ?? []).filter(c => c.category !== 'tax' || taxRequired);
  const withinBudget = categories.filter(c => c.cap != null && c.percentUsed <= 1.0).length;
  const totalCapped = categories.filter(c => c.cap != null).length;
  const savedPct = snapshot && snapshot.income > 0
    ? Math.round((snapshot.projectedSavings / snapshot.income) * 100)
    : 0;

  return (
    <SafeAreaView style={styles.root}>
      <ScrollView contentContainerStyle={{ padding: 20, paddingBottom: 60 }}>
        <Pressable onPress={() => nav.goBack()} hitSlop={12} style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
          <Ionicons name="chevron-back" size={20} color={colors.ink2} />
          <Text style={[{ color: colors.ink2 }]}>Back</Text>
        </Pressable>
        <Eyebrow style={{ marginTop: 16 }}>Monthly wrap</Eyebrow>
        <Display variant="screen" style={{ marginTop: 6 }}>
          {format(new Date(), 'MMMM')}{' '}
          <Display variant="screen" italic color={colors.sage}>summary</Display>
        </Display>

        <Card style={{ marginTop: 18, paddingVertical: 26, alignItems: 'center' }}>
          <Eyebrow>Projected savings</Eyebrow>
          <Num variant="large" color={colors.sage} style={{ marginTop: 6 }}>
            {formatAmount(snapshot?.projectedSavings ?? 0, currency)}
          </Num>
          <Text style={[t.caption, { color: colors.ink3, marginTop: 8 }]}>
            {savedPct}% of income{totalCapped ? ` · within budget in ${withinBudget} of ${totalCapped} capped categories` : ''}
          </Text>
        </Card>

        <View style={{ marginTop: 22 }}>
          <Eyebrow>By category</Eyebrow>
          <View style={{ marginTop: 10 }}>
            {categories.map(c => {
              const pct = Math.round(c.percentUsed * 100);
              return (
                <View key={c.category} style={styles.row}>
                  <View style={{ flex: 1 }}>
                    <Text style={[t.bodyMedium, { color: colors.ink }]}>{CATEGORY_LABELS[c.category]}</Text>
                    {c.cap != null && (
                      <Text style={[t.caption, { color: colors.ink3, marginTop: 2 }]}>
                        {formatAmount(c.spent, currency)} of {formatAmount(c.cap, currency)}
                      </Text>
                    )}
                  </View>
                  {c.cap != null ? (
                    <Num color={budgetStateColor(c.percentUsed)}>{pct}%</Num>
                  ) : (
                    <Num>{formatAmount(c.spent, currency)}</Num>
                  )}
                </View>
              );
            })}
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.bg },
  row: {
    flexDirection: 'row', alignItems: 'center',
    paddingVertical: 14,
    borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: colors.hair,
  },
});
