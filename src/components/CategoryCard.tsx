import React from 'react';
import { View, Pressable, Text, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { CategoryStatus, CATEGORY_LABELS } from '../domain/budget';
import { BudgetProgressBar } from './BudgetProgressBar';
import { CATEGORY_ACCENT } from '../theme/categoryTheme';
import { colors } from '../theme/colors';
import { text as t } from '../theme/typography';
import { Currency, formatAmountCompact } from '../domain/currency';

interface Props {
  status: CategoryStatus;
  currency?: Currency;
  onPress?: () => void;
}

export function CategoryCard({ status, currency = 'VND', onPress }: Props) {
  const accent = CATEGORY_ACCENT[status.category];
  const pct = Math.round(status.percentUsed * 100);

  return (
    <Pressable onPress={onPress} style={({ pressed }) => [styles.card, pressed && { opacity: 0.85 }]}>
      {/* Icon bubble */}
      <View style={[styles.iconBubble, { backgroundColor: accent.iconBg }]}>
        <Text style={styles.emoji}>{accent.emoji}</Text>
      </View>

      {/* Middle: name + progress bar */}
      <View style={styles.mid}>
        <Text style={styles.name} numberOfLines={1}>{CATEGORY_LABELS[status.category]}</Text>
        <View style={{ marginTop: 6 }}>
          <BudgetProgressBar
            percentUsed={status.percentUsed}
            height={5}
            startColor={accent.gradStart}
            endColor={accent.gradEnd}
          />
        </View>
        {status.cap != null && (
          <Text style={styles.capLabel} numberOfLines={1}>
            {formatAmountCompact(status.spent, currency)} / {formatAmountCompact(status.cap, currency)}
          </Text>
        )}
        {status.cap == null && (
          <Text style={styles.capLabel}>No limit set</Text>
        )}
      </View>

      {/* Right: amount + status */}
      <View style={styles.right}>
        <Text style={[styles.amt, { color: accent.gradStart }]}>
          {formatAmountCompact(status.spent, currency)}
        </Text>
        {status.cap != null && (
          <Text style={styles.pctLabel}>{Math.min(pct, 999)}%</Text>
        )}
        {status.tier >= 4 && <Text style={[styles.badge, { color: colors.coral }]}>Over!</Text>}
        {status.tier === 3 && <Text style={[styles.badge, { color: colors.tangerine }]}>Almost</Text>}
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.card,
    borderRadius: 18,
    paddingVertical: 12,
    paddingHorizontal: 14,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    shadowColor: '#1F1A2E',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.07,
    shadowRadius: 12,
    elevation: 3,
  },
  iconBubble: {
    width: 44,
    height: 44,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emoji: { fontSize: 22 },
  mid: { flex: 1, minWidth: 0 },
  name: {
    fontFamily: 'Nunito_700Bold',
    fontSize: 14,
    letterSpacing: -0.2,
    color: colors.ink,
  },
  capLabel: {
    fontFamily: 'Inter_400Regular',
    fontSize: 11,
    color: colors.ink3,
    marginTop: 4,
    letterSpacing: 0.2,
  },
  right: { alignItems: 'flex-end', minWidth: 56 },
  amt: {
    fontFamily: 'Nunito_800ExtraBold',
    fontSize: 14,
    letterSpacing: -0.3,
  },
  pctLabel: {
    fontFamily: 'JetBrainsMono_400Regular',
    fontSize: 11,
    color: colors.ink3,
    marginTop: 2,
  },
  badge: {
    fontFamily: 'Inter_700Bold',
    fontSize: 10,
    letterSpacing: 0.2,
    marginTop: 2,
  },
});
