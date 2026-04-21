// Monthly calendar grid showing bill due dates, color-coded by urgency.
// Dots under day numbers indicate bills due that day.

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { startOfMonth, endOfMonth, eachDayOfInterval, format, getDay, isSameDay, differenceInCalendarDays } from 'date-fns';
import { BillRow } from '../data/repositories/billRepo';
import { colors } from '../theme/colors';
import { fontFamily, text as t } from '../theme/typography';

interface Props {
  month: Date;
  bills: BillRow[];
}

export function BillCalendar({ month, bills }: Props) {
  const start = startOfMonth(month);
  const end = endOfMonth(month);
  const days = eachDayOfInterval({ start, end });
  const today = new Date();

  // Pad leading blanks so the 1st lands on the correct weekday column (Sunday=0)
  const firstDow = getDay(start);
  const padded: (Date | null)[] = Array(firstDow).fill(null).concat(days);

  const urgencyColor = (dueDate: Date): string => {
    const delta = differenceInCalendarDays(dueDate, today);
    if (delta < 0) return colors.coral;
    if (delta < 3) return colors.coral;
    if (delta <= 7) return colors.amber;
    return colors.sage;
  };

  return (
    <View>
      <View style={styles.weekRow}>
        {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((d, i) => (
          <Text key={i} style={[t.eyebrow, { color: colors.ink3, flex: 1, textAlign: 'center' }]}>{d}</Text>
        ))}
      </View>
      <View style={styles.grid}>
        {padded.map((d, i) => {
          if (!d) return <View key={`b-${i}`} style={styles.cell} />;
          const dueHere = bills.filter(b => isSameDay(new Date(b.due_date), d));
          const isToday = isSameDay(d, today);
          return (
            <View key={d.toISOString()} style={styles.cell}>
              <View style={[styles.day, isToday && styles.dayToday]}>
                <Text style={[styles.dayText, isToday && { color: colors.paper }]}>
                  {format(d, 'd')}
                </Text>
              </View>
              <View style={{ flexDirection: 'row', gap: 3, marginTop: 2, minHeight: 6 }}>
                {dueHere.slice(0, 3).map(b => (
                  <View
                    key={b.id}
                    style={[styles.dot, { backgroundColor: urgencyColor(new Date(b.due_date)) }]}
                  />
                ))}
              </View>
            </View>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  weekRow: { flexDirection: 'row', marginBottom: 6 },
  grid: { flexDirection: 'row', flexWrap: 'wrap' },
  cell: { width: `${100 / 7}%`, alignItems: 'center', paddingVertical: 6 },
  day: {
    width: 30,
    height: 30,
    borderRadius: 15,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dayToday: { backgroundColor: colors.ink },
  dayText: { fontFamily: fontFamily.mono, fontSize: 13, color: colors.ink },
  dot: { width: 5, height: 5, borderRadius: 3 },
});
