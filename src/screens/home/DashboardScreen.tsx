// Dashboard — joyful redesign.
// Greeting header + gradient hero card + 2-col stat grid + category list.

import React, { useCallback, useEffect } from 'react';
import { View, ScrollView, Text, StyleSheet, Pressable, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { format } from 'date-fns';
import { CategoryCard } from '../../components/CategoryCard';
import { BudgetProgressBar } from '../../components/BudgetProgressBar';
import { useBudgetStore } from '../../state/BudgetStore';
import { useAuth } from '../../state/AuthContext';
import { useSettingsStore } from '../../state/SettingsStore';
import { billRepo, BillRow } from '../../data/repositories/billRepo';
import { formatAmountCompact } from '../../domain/currency';
import { daysUntil } from '../../utils/date';
import { colors } from '../../theme/colors';

// Time-of-day greeting
function greeting(): string {
  const h = new Date().getHours();
  if (h < 12) return 'Good morning';
  if (h < 18) return 'Good afternoon';
  return 'Good evening';
}

// User initials for avatar
function initials(name?: string | null): string {
  if (!name) return '?';
  return name
    .split(' ')
    .slice(0, 2)
    .map(w => w[0])
    .join('')
    .toUpperCase();
}

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

  const income = snapshot?.income ?? 0;
  const spent  = snapshot?.totalSpent ?? 0;
  const remaining = snapshot?.remaining ?? 0;
  const spendPct = income > 0 ? Math.min(1, spent / income) : 0;

  // Daily average (spent / days elapsed)
  const dayOfMonth = new Date().getDate();
  const dailyAvg = dayOfMonth > 0 ? Math.round(spent / dayOfMonth) : 0;

  const userName = user?.display_name ?? (user ? 'there' : 'there');
  const avatarLetters = initials(user?.display_name);

  return (
    <SafeAreaView style={styles.root} edges={['top']}>
      <ScrollView
        contentContainerStyle={styles.scroll}
        refreshControl={
          <RefreshControl refreshing={false} onRefresh={reload} tintColor={colors.violet} />
        }
      >
        {/* ── Greeting header ── */}
        <View style={styles.topbar}>
          <View>
            <Text style={styles.greetingText}>
              {greeting()} 👋
            </Text>
            <Text style={styles.nameText}>{userName}</Text>
          </View>
          <Pressable onPress={() => nav.navigate('Profile')}>
            <LinearGradient
              colors={['#FF7AC6', '#8B5CF6']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.avatar}
            >
              <Text style={styles.avatarText}>{avatarLetters}</Text>
            </LinearGradient>
          </Pressable>
        </View>

        {/* ── Hero card ── */}
        <LinearGradient
          colors={['#FF6B6B', '#FF9F45', '#FF7AC6']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.hero}
        >
          {/* decorative orbs */}
          <View style={styles.orbTop} />
          <View style={styles.orbBottom} />

          <View style={styles.heroLabelRow}>
            <Text style={styles.heroLabel}>Remaining this month</Text>
            <View style={styles.heroPill}>
              <Text style={styles.heroPillText}>{format(new Date(), 'MMM yyyy').toUpperCase()}</Text>
            </View>
          </View>

          <Text style={styles.heroAmount}>
            {formatAmountCompact(remaining, currency)}
          </Text>

          <Text style={styles.heroSubline}>
            ↓ {formatAmountCompact(spent, currency)} spent of {formatAmountCompact(income, currency)} income
          </Text>

          <View style={styles.heroProgressRow}>
            <Text style={styles.heroProgressLabel}>0%</Text>
            <Text style={styles.heroProgressLabel}>{Math.round(spendPct * 100)}%</Text>
          </View>
          <View style={styles.heroTrack}>
            <View style={[styles.heroBar, { width: `${spendPct * 100}%` as any }]} />
          </View>
        </LinearGradient>

        {/* ── Quick stat cards ── */}
        <View style={styles.statsRow}>
          <LinearGradient
            colors={['#E7FBF1', '#D5F5E5']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.statCard}
          >
            <Text style={styles.statIcon}>💰</Text>
            <Text style={[styles.statKey, { color: '#0F5132' }]}>Income</Text>
            <Text style={[styles.statVal, { color: '#0F5132' }]}>
              {formatAmountCompact(income, currency)}
            </Text>
            <Text style={[styles.statSub, { color: '#2E7D52' }]}>This month</Text>
          </LinearGradient>

          <LinearGradient
            colors={['#FFF1E8', '#FFE0CC']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.statCard}
          >
            <Text style={styles.statIcon}>📊</Text>
            <Text style={[styles.statKey, { color: '#7A3A0E' }]}>Daily avg</Text>
            <Text style={[styles.statVal, { color: '#7A3A0E' }]}>
              {formatAmountCompact(dailyAvg, currency)}
            </Text>
            <Text style={[styles.statSub, { color: '#9C5527' }]}>Past {dayOfMonth}d</Text>
          </LinearGradient>
        </View>

        {/* ── Upcoming bills ── */}
        {upcoming.length > 0 && (
          <View style={styles.billsCard}>
            <Text style={styles.billsTitle}>⚡ Upcoming bills</Text>
            {upcoming.slice(0, 3).map(b => {
              const days = daysUntil(new Date(b.due_date));
              return (
                <View key={b.id} style={styles.billRow}>
                  <Text style={styles.billLabel}>{b.label}</Text>
                  <Text style={[styles.billDays, { color: days <= 2 ? colors.coral : colors.ink2 }]}>
                    {days === 0 ? 'today' : days < 0 ? `${Math.abs(days)}d overdue` : `in ${days}d`}
                  </Text>
                </View>
              );
            })}
          </View>
        )}

        {/* ── Categories ── */}
        <View style={styles.section}>
          <View style={styles.sectionHead}>
            <Text style={styles.sectionTitle}>Categories</Text>
            <Pressable onPress={() => nav.navigate('CategoryList')}>
              <Text style={styles.seeAll}>See all →</Text>
            </Pressable>
          </View>
          <View style={{ gap: 10 }}>
            {visibleCategories.map(c => (
              <CategoryCard
                key={c.category}
                status={c}
                currency={currency}
                onPress={() => nav.navigate('CategoryDetail', { category: c.category })}
              />
            ))}
          </View>
        </View>
      </ScrollView>

      {/* FAB lives in TabNavigator center slot */}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.bg },
  scroll: { padding: 20, paddingBottom: 120 },

  // Topbar
  topbar: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  greetingText: {
    fontFamily: 'Inter_400Regular',
    fontSize: 13,
    color: colors.ink2,
    marginBottom: 2,
  },
  nameText: {
    fontFamily: 'Nunito_700Bold',
    fontSize: 21,
    letterSpacing: -0.3,
    color: colors.ink,
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    fontFamily: 'Inter_700Bold',
    fontSize: 15,
    color: '#fff',
  },

  // Hero card
  hero: {
    borderRadius: 28,
    padding: 22,
    marginBottom: 14,
    overflow: 'hidden',
  },
  orbTop: {
    position: 'absolute',
    top: -30,
    right: -10,
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: 'rgba(255,255,255,0.35)',
  },
  orbBottom: {
    position: 'absolute',
    bottom: -20,
    left: '30%',
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: 'rgba(255,210,63,0.45)',
  },
  heroLabelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  heroLabel: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 12,
    letterSpacing: 1.4,
    textTransform: 'uppercase',
    color: 'rgba(255,255,255,0.90)',
  },
  heroPill: {
    backgroundColor: 'rgba(255,255,255,0.22)',
    borderRadius: 999,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  heroPillText: {
    fontFamily: 'Inter_700Bold',
    fontSize: 10,
    letterSpacing: 1.2,
    color: '#fff',
  },
  heroAmount: {
    fontFamily: 'Nunito_800ExtraBold',
    fontSize: 42,
    letterSpacing: -0.8,
    color: '#fff',
    marginBottom: 4,
  },
  heroSubline: {
    fontFamily: 'Inter_400Regular',
    fontSize: 13,
    color: 'rgba(255,255,255,0.95)',
    marginBottom: 14,
  },
  heroProgressRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  heroProgressLabel: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 10,
    letterSpacing: 0.8,
    textTransform: 'uppercase',
    color: 'rgba(255,255,255,0.90)',
  },
  heroTrack: {
    height: 8,
    borderRadius: 4,
    backgroundColor: 'rgba(255,255,255,0.28)',
    overflow: 'hidden',
  },
  heroBar: {
    height: 8,
    borderRadius: 4,
    backgroundColor: '#fff',
    shadowColor: '#fff',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.6,
    shadowRadius: 8,
  },

  // Stat cards
  statsRow: { flexDirection: 'row', gap: 10, marginBottom: 18 },
  statCard: {
    flex: 1,
    borderRadius: 20,
    padding: 14,
  },
  statIcon: { fontSize: 18, marginBottom: 4 },
  statKey: {
    fontFamily: 'Inter_700Bold',
    fontSize: 11,
    letterSpacing: 0.8,
    textTransform: 'uppercase',
    marginBottom: 4,
  },
  statVal: {
    fontFamily: 'Nunito_700Bold',
    fontSize: 17,
    letterSpacing: -0.3,
  },
  statSub: {
    fontFamily: 'Inter_400Regular',
    fontSize: 11,
    marginTop: 2,
    opacity: 0.75,
  },

  // Bills preview card
  billsCard: {
    backgroundColor: colors.card,
    borderRadius: 20,
    padding: 16,
    marginBottom: 20,
    shadowColor: '#1F1A2E',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.07,
    shadowRadius: 12,
    elevation: 3,
  },
  billsTitle: {
    fontFamily: 'Inter_700Bold',
    fontSize: 14,
    color: colors.ink,
    marginBottom: 10,
    letterSpacing: -0.2,
  },
  billRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.hair,
  },
  billLabel: {
    fontFamily: 'Inter_500Medium',
    fontSize: 14,
    color: colors.ink,
  },
  billDays: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 13,
  },

  // Categories section
  section: { marginTop: 4 },
  sectionHead: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'baseline',
    marginBottom: 12,
  },
  sectionTitle: {
    fontFamily: 'Nunito_700Bold',
    fontSize: 16,
    letterSpacing: -0.2,
    color: colors.ink,
  },
  seeAll: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 13,
    color: colors.violet,
  },

});
