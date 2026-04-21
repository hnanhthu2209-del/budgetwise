import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { format } from 'date-fns';
import { ExpenseRow } from '../data/repositories/expenseRepo';
import { Num } from './primitives/Num';
import { colors } from '../theme/colors';
import { text as t } from '../theme/typography';
import { Currency, formatAmount } from '../domain/currency';

interface Props {
  expense: ExpenseRow;
  currency?: Currency;
  onLongPress?: () => void;
}

export function ExpenseListItem({ expense, currency = 'VND', onLongPress }: Props) {
  const date = format(new Date(expense.occurred_at), 'MMM d');
  return (
    <Pressable onLongPress={onLongPress}>
      <View style={styles.row}>
        <View style={{ flex: 1 }}>
          <Text style={[t.bodyMedium, { color: colors.ink }]}>
            {expense.note || expense.sub_type || 'Expense'}
          </Text>
          <Text style={[t.caption, { color: colors.ink3, marginTop: 2 }]}>
            {date}
            {expense.platform_tag ? ` · ${expense.platform_tag}` : ''}
            {expense.is_impulse ? ' · impulse' : ''}
          </Text>
        </View>
        <Num variant="default">{formatAmount(expense.amount, currency)}</Num>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.hair,
  },
});
