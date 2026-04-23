// Bills screen = calendar + list + add-bill sheet. Uses the scheduler to
// set up Tier 5 reminders (5d/2d/0d) at creation time.

import React, { useCallback, useState } from 'react';
import { View, Text, ScrollView, StyleSheet, Pressable, TextInput, Alert, Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useFocusEffect } from '@react-navigation/native';
import { format } from 'date-fns';
import { Display } from '../../components/primitives/Display';
import { Eyebrow } from '../../components/primitives/Eyebrow';
import { Num } from '../../components/primitives/Num';
import { Card } from '../../components/primitives/Card';
import { Button } from '../../components/primitives/Button';
import { CurrencyInput } from '../../components/CurrencyInput';
import { BillCalendar } from '../../components/BillCalendar';
import { DueDateBadge } from '../../components/DueDateBadge';
import { billRepo, BillRow } from '../../data/repositories/billRepo';
import { scheduleBillReminders } from '../../domain/notifications/scheduler';
import { useAuth } from '../../state/AuthContext';
import { useSettingsStore } from '../../state/SettingsStore';
import { formatAmount } from '../../domain/currency';
import { daysUntil } from '../../utils/date';
import { colors } from '../../theme/colors';
import { fontFamily, text as t } from '../../theme/typography';

export function BillsScreen() {
  const { user } = useAuth();
  const currency = useSettingsStore(s => s.currency);
  const [bills, setBills] = useState<BillRow[]>([]);
  const [adding, setAdding] = useState(false);
  const insets = useSafeAreaInsets();

  const reload = useCallback(async () => {
    const list = await billRepo.list(user?.id ?? null);
    setBills(list);
  }, [user]);

  useFocusEffect(useCallback(() => { reload(); }, [reload]));

  const upcoming = bills.filter(b => b.status !== 'paid');
  const paid = bills.filter(b => b.status === 'paid');

  return (
    <View style={styles.root}>
      <ScrollView
        contentInsetAdjustmentBehavior="automatic"
        contentContainerStyle={{ padding: 20, paddingTop: insets.top + 12, paddingBottom: insets.bottom + 80 }}
      >
        <Eyebrow>Bills & Payments</Eyebrow>
        <Display variant="screen" style={{ marginTop: 6 }}>
          {format(new Date(), 'MMMM')}
        </Display>

        <Card style={{ marginTop: 18 }}>
          <BillCalendar month={new Date()} bills={bills} />
        </Card>

        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 22 }}>
          <Eyebrow>Upcoming</Eyebrow>
          {!adding && (
            <Pressable onPress={() => setAdding(true)} hitSlop={10}>
              <Text style={[t.bodyMedium, { color: colors.sage }]}>+ Add bill</Text>
            </Pressable>
          )}
        </View>

        {adding && (
          <AddBillForm
            onSaved={async () => {
              setAdding(false);
              await reload();
            }}
            onCancel={() => setAdding(false)}
          />
        )}

        <View style={{ marginTop: 10 }}>
          {upcoming.length === 0 && !adding && (
            <Text style={[t.caption, { color: colors.ink3 }]}>No upcoming bills — you're clear.</Text>
          )}
          {upcoming.map(b => (
            <BillRowCard key={b.id} bill={b} currency={currency} onChange={reload} />
          ))}
        </View>

        {paid.length > 0 && (
          <View style={{ marginTop: 22 }}>
            <Eyebrow>Paid</Eyebrow>
            <View style={{ marginTop: 8, opacity: 0.6 }}>
              {paid.map(b => (
                <BillRowCard key={b.id} bill={b} currency={currency} onChange={reload} />
              ))}
            </View>
          </View>
        )}
      </ScrollView>
    </View>
  );
}

function BillRowCard({ bill, currency, onChange }: { bill: BillRow; currency: string; onChange: () => void }) {
  const d = daysUntil(new Date(bill.due_date));
  const nextStatus = bill.status === 'paid' ? 'unpaid' : 'paid';
  return (
    <Pressable
      onPress={() => {
        Alert.alert(
          bill.status === 'paid' ? 'Mark unpaid?' : 'Mark paid?',
          bill.label,
          [
            { text: 'Cancel', style: 'cancel' },
            { text: bill.status === 'paid' ? 'Mark unpaid' : 'Mark paid', onPress: async () => {
              await billRepo.setStatus(bill.id, nextStatus);
              onChange();
            } },
            bill.status !== 'paid' ? {
              text: 'Partial', onPress: async () => { await billRepo.setStatus(bill.id, 'partial'); onChange(); },
            } : null as any,
          ].filter(Boolean) as any,
        );
      }}
      onLongPress={() => {
        Alert.alert('Delete bill?', bill.label, [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Delete', style: 'destructive', onPress: async () => { await billRepo.remove(bill.id); onChange(); } },
        ]);
      }}
    >
      <View style={styles.billRow}>
        <View style={{ flex: 1 }}>
          <Text style={[t.bodyMedium, { color: colors.ink }]}>{bill.label}</Text>
          <Text style={[t.caption, { color: colors.ink3, marginTop: 2 }]}>
            {format(new Date(bill.due_date), 'MMM d')} · {bill.type}
            {bill.status === 'partial' ? ' · partial' : ''}
          </Text>
        </View>
        <View style={{ alignItems: 'flex-end', gap: 4 }}>
          <Num>{formatAmount(bill.amount, currency as any)}</Num>
          {bill.status !== 'paid' && <DueDateBadge daysUntil={d} />}
        </View>
      </View>
    </Pressable>
  );
}

function AddBillForm({ onSaved, onCancel }: { onSaved: () => void; onCancel: () => void }) {
  const { user } = useAuth();
  const [label, setLabel] = useState('');
  const [amount, setAmount] = useState<number | null>(null);

  // Default due date: 7 days from today
  const [dueDate, setDueDate] = useState<Date>(() => {
    const d = new Date();
    d.setDate(d.getDate() + 7);
    d.setHours(9, 0, 0, 0); // 9 AM notification
    return d;
  });
  const [showPicker, setShowPicker] = useState(false);

  const save = async () => {
    if (!label.trim() || !amount || amount <= 0) return;
    const type = label.trim().toLowerCase().split(' ')[0];
    const b = await billRepo.add({
      userId: user?.id ?? null,
      label: label.trim(),
      type,
      amount,
      dueDate,
    });
    // Schedule notifications: 5 days before, 2 days before, and ON the due date
    await scheduleBillReminders({ userId: user?.id ?? null, label: label.trim(), dueDate });
    onSaved(b);
  };

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  return (
    <Card style={{ marginTop: 10 }}>
      <Eyebrow>New bill</Eyebrow>

      <Text style={[t.caption, { color: colors.ink3, marginTop: 12 }]}>Bill name</Text>
      <TextInput
        placeholder="e.g. Electricity, Rent, Netflix"
        value={label}
        onChangeText={setLabel}
        placeholderTextColor={colors.ink3}
        style={[styles.input, { marginTop: 4 }]}
      />

      <Text style={[t.caption, { color: colors.ink3, marginTop: 12 }]}>Amount</Text>
      <View style={{ marginTop: 4 }}>
        <CurrencyInput value={amount} onChange={setAmount} />
      </View>

      {/* Due date — tap to open picker on Android; always visible on iOS */}
      <Text style={[t.caption, { color: colors.ink3, marginTop: 16 }]}>Due date</Text>

      {Platform.OS === 'android' && (
        <Pressable
          onPress={() => setShowPicker(true)}
          style={[styles.input, { marginTop: 4, justifyContent: 'center' }]}
        >
          <Text style={[t.bodyMedium, { color: colors.ink }]}>
            {format(dueDate, 'MMM d, yyyy')}
          </Text>
        </Pressable>
      )}

      {(Platform.OS === 'ios' || showPicker) && (
        <DateTimePicker
          value={dueDate}
          mode="date"
          display={Platform.OS === 'ios' ? 'inline' : 'default'}
          minimumDate={today}
          onChange={(_e, date) => {
            setShowPicker(false);
            if (date) {
              const d = new Date(date);
              d.setHours(9, 0, 0, 0);
              setDueDate(d);
            }
          }}
          style={{ marginTop: 4 }}
          themeVariant="light"
          accentColor={colors.sage}
        />
      )}

      <Text style={[t.caption, { color: colors.sage, marginTop: 6 }]}>
        You'll get reminders 5 days before, 2 days before, and on this day.
      </Text>

      <View style={{ flexDirection: 'row', gap: 10, marginTop: 16 }}>
        <Button label="Cancel" variant="ghost" onPress={onCancel} style={{ flex: 1 }} />
        <Button label="Add bill" onPress={save} disabled={!label.trim() || !amount} style={{ flex: 1 }} />
      </View>
    </Card>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.bg },
  billRow: {
    flexDirection: 'row', alignItems: 'center',
    paddingVertical: 14,
    borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: colors.hair,
  },
  input: {
    fontFamily: fontFamily.ui, fontSize: 16, color: colors.ink,
    backgroundColor: colors.bg, borderRadius: 10, borderWidth: 1, borderColor: colors.hair,
    paddingHorizontal: 12, paddingVertical: 12, marginTop: 8,
  },
});
