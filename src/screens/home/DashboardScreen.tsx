// The main screen. Top hero card: income / spent / remaining / savings.
// Below: per-category progress bars, upcoming bill peek.

import React, { useCallback, useEffect } from 'react';
import { View, ScrollView, Text, StyleSheet, Pressable, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { format } from 'date-fns';
import { Display } from '../../components/primitives/Display';
import { Eyebrow } from '../../components/primitives/Eyebrow';
import { Num } from '../../components/primitives/Num';
import { Card } from '../../components/primitives/Card';
import { CategoryCard } from '../../components/CategoryCard';
import { useBudgetStore } from '../../state/BudgetStore';
import { useAuth } from '../../state/AuthContext';
import { useSettingsStore } from '../../state/SettingsStore';
import { billRepo, BillRow } from '../../data/repositories/billRepo';
import { formatAmount, formatAmountCompact } from '../../domain/currency';
import { daysUntil } from '../../utils/date';
import { colors } from '../../theme/colors';
import { text as t } from '../../theme/typography';

export function DashboardScreen() {
  const nav = useNavigation<any>();
  const { user } = useAuth();
  const currency = useSettingsStore(s => s.currency);
  const taxRequired = useSettingsStore(s => s.taxRequired);
  const setUser = useBudgetStore(s => s.setUser);
  const refresh = useBudgetStore(s => s.refresh);
  const snapshot = useBudgetStore(s => s.snapshot);

  const [upcoming, setUpcoming] = React.useState<BillRow[]>([]);

  useEffect(() => {
    setUser(user?.id ?? null);
  }, [user, setUser]);

  const reload = useCallback(async () => {
    await refresh();
    const up = await billRepo.upcomingWithin(user?.id ?? null, 7);
    setUpcoming(up);
  }, [refresh, user]);

  useFocusEffect(useCallback(() => { reload(); }, [reload]));

  const visibleCategories = (snapshot?.perCategory ?? []).filter(c =>
    c.category !== 'tax' || taxRequired,
  );

  return (
    <SafeAreaView style={styles.root} edges={['top']}>
      <ScrollView
        contentContainerStyle={{ padding: 20, paddingBottom: 120 }}
        refreshControl={<RefreshControl refreshing={false} onRefresh={reload} tintColor={colors.sage} />}
      >
        <View style={styles.head}>
          <View>
            <Eyebrow>BudgetWise</Eyebrow>
            <Display variant="screen" style={{ marginTop: 6 }}>
              {format(new Date(), 'MMMM yyyy')}
            </Display>
          </View>
          <Pressable onPress={() => nav.navigate('Income')} hitSlop={12}>
            <Text style={[t.bodyMedium, { color: colors.sage }]}>Income →</Text>
          </Pressable>
        </View>

        {/* Hero card */}
        <Card style={{ marginTop: 20, paddingVertical: 26 }}>
          <Eyebrow>Remaining this month</Eyebrow>
          <Num
            variant="large"
            style={{ marginTop: 6 }}
            color={(snapshot?.remaining ?? 0) < 0 ? colors.coral : colors.ink}
          >
            {formatAmountCompact(snapshot?.remaining ?? 0, currency)}
          </Num>
          <View style={{ flexDirection: 'row', gap: 18, marginTop: 18 }}>
            <Stat label="Income" value={snapshot?.income ?? 0} />
            <Stat label="Spent" value={snapshot?.totalSpent ?? 0} />
            <Stat label="Savings" value={snapshot?.projectedSavings ?? 0} positive />
          </View>
        </Card>

        {upcoming.length > 0 && (
          <Card style={{ marginTop: 16, backgroundColor: colors.skySoft, borderColor: colors.sky }}>
            <Eyebrow color={colors.sky}>Upcoming bills</Eyebrow>
            {upcoming.slice(0, 3).map(b => {
              const days = daysUntil(new Date(b.due_date));
              return (
                <View key={b.id} style={styles.billRow}>
                  <Text style={[t.bodyMedium, { color: colors.ink }]}>{b.label}</Text>
                  <Text style={[t.caption, { color: days <= 2 ? colors.coral : colors.ink2 }]}>
                    {days === 0 ? 'today' : days < 0 ? `${Math.abs(days)}d overdue` : `in ${days}d`}
                  </Text>
                </View>
              );
            })}
          </Card>
        )}

        <View style={{ marginTop: 24 }}>
          <Eyebrow>Categories</Eyebrow>
          <View style={{ gap: 10, marginTop: 10 }}>
            {visibleCategories.map(c => (
              <CategoryCard
                key={c.category}
                status={c}
                currency={currency}
                onPress={() => nav.navigate('Categories', { screen: 'CategoryDetail', params: { category: c.category } })}
              />
            ))}
          </View>
        </View>
      </ScrollView>

      <Pressable style={styles.fab} onPress={() => nav.navigate('AddExpense')} hitSlop={10}>
        <Text style={styles.fabPlus}>+</Text>
      </Pressable>
    </SafeAreaView>
  );
}

function Stat({ label, value, positive }: { label: string; value: number; positive?: boolean }) {
  const currency = useSettingsStore(s => s.currency);
  return (
    <View style={{ flex: 1, minWidth: 0 }}>
      <Eyebrow>{label}</Eyebrow>
      <Num
        variant="default"
        color={positive ? colors.sage : colors.ink}
        style={{ marginTop: 4 }}
      >
        {formatAmountCompact(value, currency)}
      </Num>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.bg },
  head: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end' },
  billRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.hair,
  },
  fab: {
    position: 'absolute',
    right: 20,
    bottom: 24,
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: colors.sage,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.18,
    shadowRadius: 14,
    elevation: 6,
  },
  fabPlus: { color: 'white', fontSize: 30, marginTop: -3 },
});
