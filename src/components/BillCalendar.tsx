// Monthly calendar grid — explicit row-by-row rendering so ScrollView
// always gets an accurate content height (flexWrap breaks height measurement).

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import {
  startOfMonth, endOfMonth, eachDayOfInterval,
  format, getDay, isSameDay, differenceInCalendarDays,
} from 'date-fns';
import { BillRow } from '../data/repositories/billRepo';
import { colors } from '../theme/colors';
import { fontFamily, text as t } from '../theme/typography';

interface Props {
  month: Date;
  bills: BillRow[];
}

const DAYS = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];

export function BillCalendar({ month, bills }: Props) {
  const start = startOfMonth(month);
  const end = endOfMonth(month);
  const days = eachDayOfInterval({ start, end });
  const today = new Date();

  // Build flat array of 7-aligned cells (nulls = blank padding)
  const firstDow = getDay(start);
  const cells: (Date | null)[] = [
    ...Array(firstDow).fill(null),
    ...days,
  ];
  // Pad tail so length is a multiple of 7
  while (cells.length % 7 !== 0) cells.push(null);

  // Split into rows of 7
  const rows: (Date | null)[][] = [];
  for (let i = 0; i < cells.length; i += 7) {
    rows.push(cells.slice(i, i + 7));
  }

  const urgencyColor = (dueDate: Date): string => {
    const delta = differenceInCalendarDays(dueDate, today);
    if (delta < 3) return colors.coral;
    if (delta <= 7) return colors.amber;
    return colors.sage;
  };

  return (
    <View>
      {/* Weekday header */}
      <View style={styles.row}>
        {DAYS.map((d, i) => (
          <Text key={i} style={[t.eyebrow, styles.headerCell]}>{d}</Text>
        ))}
      </View>

      {/* Calendar rows */}
      {rows.map((row, ri) => (
        <View key={ri} style={styles.row}>
          {row.map((d, ci) => {
            if (!d) return <View key={ci} style={styles.cell} />;
            const dueHere = bills.filter(b => isSameDay(new Date(b.due_date), d));
            const isToday = isSameDay(d, today);
            return (
              <View key={ci} style={styles.cell}>
                <View style={[styles.day, isToday && styles.dayToday]}>
                  <Text style={[styles.dayText, isToday && { color: colors.paper }]}>
                    {format(d, 'd')}
                  </Text>
                </View>
                <View style={styles.dots}>
                  {dueHere.slice(0, 3).map((b, di) => (
                    <View
                      key={di}
                      style={[styles.dot, { backgroundColor: urgencyColor(new Date(b.due_date)) }]}
                    />
                  ))}
                </View>
              </View>
            );
          })}
        </View>
      ))}
    </View>
  );
}

const CELL_HEIGHT = 52;

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
  },
  headerCell: {
    flex: 1,
    textAlign: 'center',
    color: colors.ink3,
    paddingBottom: 6,
  },
  cell: {
    flex: 1,
    height: CELL_HEIGHT,
    alignItems: 'center',
    justifyContent: 'center',
  },
  day: {
    width: 30,
    height: 30,
    borderRadius: 15,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dayToday: { backgroundColor: colors.ink },
  dayText: { fontFamily: fontFamily.mono, fontSize: 13, color: colors.ink },
  dots: { flexDirection: 'row', gap: 3, marginTop: 2, height: 6 },
  dot: { width: 5, height: 5, borderRadius: 3 },
});
