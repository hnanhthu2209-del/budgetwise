import React from 'react';
import { View, Pressable, Text, StyleSheet } from 'react-native';
import { CategoryStatus, CATEGORY_LABELS } from '../domain/budget';
import { Card } from './primitives/Card';
import { Num } from './primitives/Num';
import { Eyebrow } from './primitives/Eyebrow';
import { BudgetProgressBar } from './BudgetProgressBar';
import { colors, budgetStateColor } from '../theme/colors';
import { text as t } from '../theme/typography';
import { Currency, formatAmount } from '../domain/currency';

interface Props {
  status: CategoryStatus;
  currency?: Currency;
  onPress?: () => void;
}

export function CategoryCard({ status, currency = 'VND', onPress }: Props) {
  const tint = budgetStateColor(status.percentUsed);
  const pct = Math.round(status.percentUsed * 100);
  return (
    <Pressable onPress={onPress}>
      <Card>
        <View style={styles.row}>
          <View style={{ flex: 1 }}>
            <Eyebrow>{CATEGORY_LABELS[status.category]}</Eyebrow>
            <View style={{ flexDirection: 'row', alignItems: 'baseline', gap: 6, marginTop: 6 }}>
              <Num variant="default">{formatAmount(status.spent, currency)}</Num>
              {status.cap != null && (
                <Text style={[t.caption, { color: colors.ink3 }]}>
                  / {formatAmount(status.cap, currency)}
                </Text>
              )}
            </View>
          </View>
          {status.cap != null && (
            <View style={{ alignItems: 'flex-end' }}>
              <Num variant="default" color={tint}>{pct}%</Num>
              {status.tier >= 4 && (
                <Text style={[t.caption, { color: colors.coral, marginTop: 2 }]}>Over budget</Text>
              )}
              {status.tier === 3 && (
                <Text style={[t.caption, { color: colors.coral, marginTop: 2 }]}>Almost full</Text>
              )}
              {status.tier === 2 && (
                <Text style={[t.caption, { color: colors.amber, marginTop: 2 }]}>Slow down</Text>
              )}
            </View>
          )}
        </View>
        {status.cap != null && (
          <View style={{ marginTop: 12 }}>
            <BudgetProgressBar percentUsed={status.percentUsed} />
          </View>
        )}
      </Card>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center' },
});
