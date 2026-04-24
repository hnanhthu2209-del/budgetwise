// Monthly Wrap screen — two sub-tabs: Wrap (savings recap) + Insights (donut + bars).
// Design: finance-tracker.html by the user.
// Fonts: Nunito + Inter — unchanged from global theme.

import React, { useCallback, useEffect, useState } from 'react';
import {
  View, Text, ScrollView, StyleSheet, Pressable,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import Svg, { Circle, G } from 'react-native-svg';
import { useFocusEffect } from '@react-navigation/native';
import { format, subDays, startOfDay } from 'date-fns';
import { useBudgetStore } from '../../state/BudgetStore';
import { useAuth } from '../../state/AuthContext';
import { useSettingsStore } from '../../state/SettingsStore';
import { expenseRepo } from '../../data/repositories/expenseRepo';
import { CATEGORY_LABELS, CategoryId } from '../../domain/budget';
import { CATEGORY_ACCENT } from '../../theme/categoryTheme';
import { formatAmountCompact, formatAmount } from '../../domain/currency';
import { colors } from '../../theme/colors';
import { fontFamily } from '../../theme/typography';

const { width: SCREEN_W } = Dimensions.get('window');

// ── Donut chart ────────────────────────────────────────────────────────────────
const DONUT_R = 50;
const DONUT_SW = 18;
const DONUT_C = 2 * Math.PI * DONUT_R;
const DONUT_SIZE = 130;
const CX = DONUT_SIZE / 2;

interface Segment { pct: number; color: string; }

function DonutChart({ segments, centerLabel, centerSub }: {
  segments: Segment[];
  centerLabel: string;
  centerSub: string;
}) {
  let offset = 0;
  const arcs = segments.map(seg => {
    const arc = (seg.pct / 100) * DONUT_C;
    const dashOffset = -offset;
    offset += arc + 2; // 2px gap between segments
    return { ...seg, arc, dashOffset };
  });

  return (
    <View style={{ width: DONUT_SIZE, height: DONUT_SIZE }}>
      <Svg width={DONUT_SIZE} height={DONUT_SIZE} viewBox={`0 0 ${DONUT_SIZE} ${DONUT_SIZE}`}>
        {/* Background ring */}
        <Circle
          cx={CX} cy={CX} r={DONUT_R}
          fill="none" stroke="#F0EBE3"
          strokeWidth={DONUT_SW}
        />
        {arcs.map((seg, i) => (
          <Circle
            key={i}
            cx={CX} cy={CX} r={DONUT_R}
            fill="none"
            stroke={seg.color}
            strokeWidth={DONUT_SW}
            strokeDasharray={`${seg.arc} ${DONUT_C}`}
            strokeDashoffset={seg.dashOffset}
            transform={`rotate(-90 ${CX} ${CX})`}
            strokeLinecap="round"
          />
        ))}
      </Svg>
      {/* Center label (absolute overlay) */}
      <View style={styles.donutCenter}>
        <Text style={styles.donutAmt}>{centerLabel}</Text>
        <Text style={styles.donutSub}>{centerSub}</Text>
      </View>
    </View>
  );
}

// ── Daily bar chart ────────────────────────────────────────────────────────────
function DailyBars({ data, avgLabel }: { data: number[]; avgLabel: string }) {
  const max = Math.max(...data, 1);
  const days = Array.from({ length: data.length }, (_, i) => {
    const d = subDays(new Date(), data.length - 1 - i);
    return format(d, 'd');
  });
  return (
    <View style={styles.dailyCard}>
      <View style={styles.dailyTop}>
        <View>
          <Text style={styles.dailyTitle}>Daily spending</Text>
          <Text style={styles.dailySub}>Last {data.length} days</Text>
        </View>
        <Text style={styles.dailyAvg}>{avgLabel} <Text style={styles.dailyAvgSub}>avg</Text></Text>
      </View>
      <View style={styles.barTrack}>
        {data.map((v, i) => {
          const h = Math.max(4, Math.round((v / max) * 52));
          const isToday = i === data.length - 1;
          return (
            <View key={i} style={styles.barWrap}>
              <View style={[styles.bar, { height: h }, isToday && styles.barHighlight]} />
              <Text style={styles.barDay}>{days[i]}</Text>
            </View>
          );
        })}
      </View>
    </View>
  );
}

// ── Main screen ───────────────────────────────────────────────────────────────
type SubTab = 'wrap' | 'insights';

export function WrapScreen() {
  const { user } = useAuth();
  const currency = useSettingsStore(s => s.currency);
  const taxRequired = useSettingsStore(s => s.taxRequired);
  const refresh = useBudgetStore(s => s.refresh);
  const setUser = useBudgetStore(s => s.setUser);
  const snapshot = useBudgetStore(s => s.snapshot);

  const [tab, setTab] = useState<SubTab>('wrap');
  const [dailyData, setDailyData] = useState<number[]>([]);

  useEffect(() => { setUser(user?.id ?? null); }, [user, setUser]);

  const reload = useCallback(async () => {
    await refresh();
    // Fetch last 14 days of expenses
    const all = await expenseRepo.listForMonth(user?.id ?? null);
    const buckets: Record<string, number> = {};
    all.forEach(e => {
      const key = startOfDay(new Date(e.occurred_at ?? e.created_at)).toISOString();
      buckets[key] = (buckets[key] ?? 0) + e.amount;
    });
    const days: number[] = [];
    for (let i = 13; i >= 0; i--) {
      const d = startOfDay(subDays(new Date(), i));
      days.push(buckets[d.toISOString()] ?? 0);
    }
    setDailyData(days);
  }, [refresh, user]);

  useFocusEffect(useCallback(() => { reload(); }, [reload]));

  const income = snapshot?.income ?? 0;
  const spent  = snapshot?.totalSpent ?? 0;
  const savings = snapshot?.projectedSavings ?? 0;
  const monthName = format(new Date(), 'MMMM');

  // Per-category for donut
  const categories = (snapshot?.perCategory ?? []).filter(c =>
    c.category !== 'tax' || taxRequired
  );
  const totalForPct = categories.reduce((s, c) => s + c.spent, 0) || 1;
  const donutSegments: Segment[] = categories
    .filter(c => c.spent > 0)
    .map(c => ({
      pct: Math.round((c.spent / totalForPct) * 100),
      color: CATEGORY_ACCENT[c.category].chartColor,
    }));

  // Top category
  const topCat = [...categories].sort((a, b) => b.spent - a.spent)[0];
  const topCatLabel = topCat ? CATEGORY_LABELS[topCat.category] : '—';
  const topCatEmoji = topCat ? CATEGORY_ACCENT[topCat.category].emoji : '';

  // Daily avg
  const dayOfMonth = new Date().getDate();
  const dailyAvg = dayOfMonth > 0 ? Math.round(spent / dayOfMonth) : 0;

  // No-spend days (days in month with no spending)
  const daysWithSpend = dailyData.slice(-dayOfMonth).filter(v => v > 0).length;
  const noSpendDays = dayOfMonth - daysWithSpend;

  return (
    <SafeAreaView style={styles.root} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerCenter}>
          <Text style={styles.headerLabel}>Your {monthName} Recap</Text>
          <Text style={styles.headerTitle}>
            {tab === 'wrap' ? 'Monthly wrap' : 'Your stats'}
          </Text>
        </View>
      </View>

      {/* Sub-tabs */}
      <View style={styles.tabRow}>
        <Pressable
          style={[styles.tabBtn, tab === 'wrap' && styles.tabBtnActive]}
          onPress={() => setTab('wrap')}
        >
          {tab === 'wrap' ? (
            <LinearGradient
              colors={['#E8607A', '#C44FBA']}
              start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
              style={styles.tabGrad}
            >
              <Text style={[styles.tabLabel, styles.tabLabelActive]}>Wrap</Text>
            </LinearGradient>
          ) : (
            <Text style={styles.tabLabel}>Wrap</Text>
          )}
        </Pressable>
        <Pressable
          style={[styles.tabBtn, tab === 'insights' && styles.tabBtnActive]}
          onPress={() => setTab('insights')}
        >
          {tab === 'insights' ? (
            <LinearGradient
              colors={['#E8607A', '#C44FBA']}
              start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
              style={styles.tabGrad}
            >
              <Text style={[styles.tabLabel, styles.tabLabelActive]}>Insights</Text>
            </LinearGradient>
          ) : (
            <Text style={styles.tabLabel}>Insights</Text>
          )}
        </Pressable>
      </View>

      <ScrollView contentContainerStyle={styles.scroll}>
        {tab === 'wrap' ? (
          <>
            {/* Hero savings card */}
            <LinearGradient
              colors={['#6B72E8', '#9B7BE8', '#BA8EF0']}
              start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
              style={styles.heroCard}
            >
              <View style={styles.heroOrb1} />
              <View style={styles.heroOrb2} />
              <Text style={styles.sparkles}>✦ ✧</Text>
              <Text style={styles.heroLabel}>You saved</Text>
              <Text style={styles.heroAmount}>{formatAmountCompact(savings, currency)}</Text>
            </LinearGradient>

            {/* 2×2 stat grid */}
            <View style={styles.grid2}>
              <View style={[styles.statCard, { backgroundColor: '#E4F4EC' }]}>
                <Text style={[styles.statLabel, { color: '#2A7A52' }]}>Under budget</Text>
                <Text style={[styles.statValue, { color: '#2A7A52' }]}>
                  {formatAmountCompact(savings, currency)}
                </Text>
                <Text style={styles.statSub}>of {formatAmountCompact(income, currency)} plan</Text>
              </View>
              <View style={[styles.statCard, { backgroundColor: '#FDE8D8' }]}>
                <Text style={[styles.statLabel, { color: '#A0522D' }]}>Daily avg</Text>
                <Text style={[styles.statValue, { color: '#C05A20' }]}>
                  {formatAmountCompact(dailyAvg, currency)}
                </Text>
                <Text style={styles.statSub}>{dayOfMonth} days tracked</Text>
              </View>
              <View style={[styles.statCard, { backgroundColor: '#EDE8F8' }]}>
                <Text style={[styles.statLabel, { color: '#5A3E9A' }]}>Top category</Text>
                <Text style={[styles.statValue, { color: '#5A3E9A', fontSize: 18 }]}>
                  {topCatLabel} {topCatEmoji}
                </Text>
                <Text style={styles.statSub}>
                  {topCat ? `${formatAmountCompact(topCat.spent, currency)} · ${Math.round((topCat.spent / totalForPct) * 100)}% of spend` : 'No data yet'}
                </Text>
              </View>
              <View style={[styles.statCard, { backgroundColor: '#FCEDF0' }]}>
                <Text style={[styles.statLabel, { color: '#A0304A' }]}>No-spend days</Text>
                <Text style={[styles.statValue, { color: '#C0304A' }]}>{noSpendDays} days</Text>
                <Text style={styles.statSub}>this month</Text>
              </View>
            </View>

            {/* What went well */}
            <View style={styles.whiteCard}>
              <View style={[styles.iconPill, { backgroundColor: '#FFF3D0' }]}>
                <Text style={{ fontSize: 20 }}>✨</Text>
              </View>
              <View style={styles.whiteCardContent}>
                <Text style={styles.whiteCardTitle}>What went well</Text>
                <Text style={styles.whiteCardBody}>
                  {savings > 0
                    ? `You saved ${formatAmountCompact(savings, currency)} this month — great job staying on track! 🎉`
                    : 'Keep logging your expenses — awareness is the first step to saving more.'}
                </Text>
              </View>
            </View>

            {/* Goal card */}
            <View style={styles.whiteCard}>
              <View style={[styles.iconPill, { backgroundColor: '#E0EFFF' }]}>
                <Text style={{ fontSize: 20 }}>🎯</Text>
              </View>
              <View style={styles.whiteCardContent}>
                <Text style={styles.whiteCardTitle}>Goal for next month</Text>
                <Text style={styles.whiteCardBody}>
                  {topCat
                    ? `${topCatLabel} is your biggest spend at ${Math.round((topCat.spent / totalForPct) * 100)}%. Try keeping it a bit lower next month 💜`
                    : 'Set a budget cap on your top categories to start tracking progress.'}
                </Text>
              </View>
            </View>
          </>
        ) : (
          <>
            {/* Donut chart + legend */}
            <View style={styles.donutCard}>
              <DonutChart
                segments={donutSegments.length > 0 ? donutSegments : [{ pct: 100, color: '#F0EBE3' }]}
                centerLabel={formatAmountCompact(spent, currency)}
                centerSub="spent"
              />
              <View style={styles.legend}>
                <Text style={styles.legendTitle}>Where it went</Text>
                {categories.filter(c => c.spent > 0).map(c => {
                  const accent = CATEGORY_ACCENT[c.category];
                  const pct = Math.round((c.spent / totalForPct) * 100);
                  return (
                    <View key={c.category} style={styles.legendRow}>
                      <View style={[styles.legendDot, { backgroundColor: accent.chartColor }]} />
                      <Text style={styles.legendName}>{CATEGORY_LABELS[c.category]}</Text>
                      <Text style={[styles.legendPct, { color: accent.chartColor }]}>{pct}%</Text>
                    </View>
                  );
                })}
                {categories.every(c => c.spent === 0) && (
                  <Text style={[styles.legendName, { marginTop: 8 }]}>No expenses yet</Text>
                )}
              </View>
            </View>

            {/* Daily bars */}
            {dailyData.some(v => v > 0) && (
              <DailyBars
                data={dailyData}
                avgLabel={formatAmountCompact(dailyAvg, currency)}
              />
            )}

            {/* Insight tip */}
            <View style={styles.whiteCard}>
              <View style={[styles.iconPill, { backgroundColor: '#FFF3D0' }]}>
                <Text style={{ fontSize: 20 }}>💡</Text>
              </View>
              <View style={styles.whiteCardContent}>
                <Text style={styles.whiteCardTitle}>
                  {topCat ? `${topCatLabel} is your #1 category` : 'Start tracking'}
                </Text>
                <Text style={styles.whiteCardBody}>
                  {topCat
                    ? `You spent ${formatAmount(topCat.spent, currency)} on ${topCatLabel.toLowerCase()} — ${Math.round((topCat.spent / totalForPct) * 100)}% of your total spending this month.`
                    : 'Log your first expense to see spending insights here.'}
                </Text>
              </View>
            </View>
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

// ── Styles ─────────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#FDF6EE' },
  scroll: { padding: 16, paddingBottom: 100, gap: 12 },

  // Header
  header: { paddingHorizontal: 20, paddingTop: 4, paddingBottom: 0, alignItems: 'center' },
  headerCenter: { alignItems: 'center' },
  headerLabel: {
    fontFamily: fontFamily.uiMedium,
    fontSize: 10,
    letterSpacing: 1.8,
    textTransform: 'uppercase',
    color: '#8B7E9A',
  },
  headerTitle: {
    fontFamily: fontFamily.display,       // Nunito 700 Bold
    fontSize: 22,
    letterSpacing: -0.5,
    color: '#1A1523',
    marginTop: 1,
  },

  // Sub-tabs
  tabRow: {
    flexDirection: 'row',
    gap: 8,
    paddingHorizontal: 20,
    paddingVertical: 14,
  },
  tabBtn: {
    flex: 1,
    borderRadius: 50,
    backgroundColor: '#fff',
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
    height: 40,
  },
  tabBtnActive: {},
  tabGrad: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabLabel: {
    fontFamily: fontFamily.uiSemibold,
    fontSize: 13,
    color: '#8B7E9A',
  },
  tabLabelActive: {
    color: '#fff',
  },

  // Hero card
  heroCard: {
    borderRadius: 24,
    padding: 28,
    alignItems: 'center',
    overflow: 'hidden',
    position: 'relative',
  },
  heroOrb1: {
    position: 'absolute', top: -30, left: -20,
    width: 150, height: 150, borderRadius: 75,
    backgroundColor: 'rgba(255,255,255,0.08)',
  },
  heroOrb2: {
    position: 'absolute', bottom: -20, right: -30,
    width: 120, height: 120, borderRadius: 60,
    backgroundColor: 'rgba(255,255,255,0.06)',
  },
  sparkles: {
    position: 'absolute', right: 20, top: 18,
    fontSize: 22, opacity: 0.7,
  },
  heroLabel: {
    fontFamily: fontFamily.uiMedium,
    fontSize: 10,
    letterSpacing: 2,
    textTransform: 'uppercase',
    color: 'rgba(255,255,255,0.8)',
  },
  heroAmount: {
    fontFamily: fontFamily.displayBold,   // Nunito 800 ExtraBold
    fontSize: 48,
    letterSpacing: -1.5,
    color: '#fff',
    marginTop: 4,
    lineHeight: 54,
  },

  // 2×2 grid
  grid2: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  statCard: {
    width: (SCREEN_W - 52) / 2,
    borderRadius: 20,
    padding: 16,
  },
  statLabel: {
    fontFamily: fontFamily.uiMedium,
    fontSize: 9,
    letterSpacing: 1.6,
    textTransform: 'uppercase',
    marginBottom: 6,
    opacity: 0.75,
  },
  statValue: {
    fontFamily: fontFamily.display,       // Nunito 700 Bold
    fontSize: 22,
    letterSpacing: -0.5,
    lineHeight: 26,
  },
  statSub: {
    fontFamily: fontFamily.ui,
    fontSize: 11,
    color: '#8B7E9A',
    marginTop: 3,
    opacity: 0.8,
  },

  // White insight cards
  whiteCard: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 18,
    flexDirection: 'row',
    gap: 14,
    alignItems: 'flex-start',
    shadowColor: '#1A1523',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 12,
    elevation: 2,
  },
  iconPill: {
    width: 44, height: 44,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  whiteCardContent: { flex: 1 },
  whiteCardTitle: {
    fontFamily: fontFamily.roundedBold,   // Nunito 700 Bold
    fontSize: 15,
    color: '#1A1523',
    marginBottom: 4,
  },
  whiteCardBody: {
    fontFamily: fontFamily.ui,
    fontSize: 13,
    color: '#8B7E9A',
    lineHeight: 20,
  },

  // Donut card
  donutCard: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 20,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 20,
    shadowColor: '#1A1523',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 12,
    elevation: 2,
  },
  donutCenter: {
    position: 'absolute',
    top: 0, left: 0, right: 0, bottom: 0,
    alignItems: 'center',
    justifyContent: 'center',
  },
  donutAmt: {
    fontFamily: fontFamily.displayBold,   // Nunito 800
    fontSize: 16,
    letterSpacing: -0.5,
    color: '#1A1523',
  },
  donutSub: {
    fontFamily: fontFamily.uiMedium,
    fontSize: 9,
    letterSpacing: 1.2,
    textTransform: 'uppercase',
    color: '#8B7E9A',
  },
  legend: { flex: 1 },
  legendTitle: {
    fontFamily: fontFamily.roundedBold,
    fontSize: 14,
    color: '#1A1523',
    marginBottom: 10,
  },
  legendRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 6,
  },
  legendDot: { width: 10, height: 10, borderRadius: 5 },
  legendName: { fontFamily: fontFamily.ui, fontSize: 12, flex: 1, color: '#8B7E9A' },
  legendPct: { fontFamily: fontFamily.uiBold, fontSize: 12 },

  // Daily bars
  dailyCard: {
    backgroundColor: '#FCEDF0',
    borderRadius: 20,
    padding: 18,
  },
  dailyTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
  },
  dailyTitle: {
    fontFamily: fontFamily.uiSemibold,
    fontSize: 13,
    color: '#1A1523',
  },
  dailySub: {
    fontFamily: fontFamily.ui,
    fontSize: 11,
    color: '#8B7E9A',
    marginTop: 2,
  },
  dailyAvg: {
    fontFamily: fontFamily.displayBold,
    fontSize: 22,
    color: '#E8607A',
    letterSpacing: -0.5,
  },
  dailyAvgSub: {
    fontFamily: fontFamily.ui,
    fontSize: 12,
    color: '#8B7E9A',
  },
  barTrack: {
    flexDirection: 'row',
    gap: 3,
    alignItems: 'flex-end',
    height: 60,
  },
  barWrap: {
    flex: 1,
    alignItems: 'center',
    gap: 4,
    height: '100%',
    justifyContent: 'flex-end',
  },
  bar: {
    width: '100%',
    borderRadius: 4,
    backgroundColor: 'rgba(232,96,122,0.20)',
    minHeight: 4,
  },
  barHighlight: { backgroundColor: '#E8607A' },
  barDay: {
    fontFamily: fontFamily.ui,
    fontSize: 8,
    color: '#8B7E9A',
  },
});
