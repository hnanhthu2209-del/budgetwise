// Monthly calendar grid — row-by-row rendering so ScrollView gets accurate height.
// Fonts: Inter Medium for day headers, Nunito Bold for date numbers.

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import {
  startOfMonth, endOfMonth, eachDayOfInterval,
  format, getDay, isSameDay, differenceInCalendarDays,
} from 'date-fns';
import { BillRow } from '../data/repositories/billRepo';
import { colors } from '../theme/colors';
import { fontFamily } from '../theme/typography';

interface Props {
  month: Date;
  bills: BillRow[];
}

// 3-letter day names starting Monday (matches screenshot)
const DAYS = ['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN'];

export function BillCalendar({ month, bills }: Props) {
  const start = startOfMonth(month);
  const end   = endOfMonth(month);
  const days  = eachDayOfInterval({ start, end });
  const today = new Date();

  // getDay: 0=Sun … 6=Sat; shift to Mon-first (0=Mon … 6=Sun)
  const firstDow = (getDay(start) + 6) % 7;
  const cells: (Date | null)[] = [
    ...Array(firstDow).fill(null),
    ...days,
  ];
  while (cells.length % 7 !== 0) cells.push(null);

  const rows: (Date | null)[][] = [];
  for (let i = 0; i < cells.length; i += 7) rows.push(cells.slice(i, i + 7));

  const urgencyColor = (due: Date): string => {
    const delta = differenceInCalendarDays(due, today);
    if (delta < 3)  return colors.coral;
    if (delta <= 7) return colors.tangerine;
    return colors.mint;
  };

  return (
    <View>
      {/* Day-of-week headers */}
      <View style={styles.row}>
        {DAYS.map(d => (
          <Text key={d} style={styles.headerCell}>{d}</Text>
        ))}
      </View>

      {/* Date rows */}
      {rows.map((row, ri) => (
        <View key={ri} style={styles.row}>
          {row.map((d, ci) => {
            if (!d) return <View key={ci} style={styles.cell} />;

            const dueHere = bills.filter(b => isSameDay(new Date(b.due_date), d));
            const isToday = isSameDay(d, today);

            return (
              <View key={ci} style={styles.cell}>
                <View style={[styles.day, isToday && styles.dayToday]}>
                  <Text style={[styles.dayNum, isToday && styles.dayNumToday]}>
                    {format(d, 'd')}
                  </Text>
                </View>
                {/* Bill dots */}
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

const CELL_H = 52;

const styles = StyleSheet.create({
  row: { flexDirection: 'row' },

  headerCell: {
    flex: 1,
    textAlign: 'center',
    fontFamily: fontFamily.uiMedium,   // Inter 500 — matches screenshot
    fontSize: 10,
    letterSpacing: 0.8,
    textTransform: 'uppercase',
    color: colors.ink3,
    paddingBottom: 8,
  },

  cell: {
    flex: 1,
    height: CELL_H,
    alignItems: 'center',
    justifyContent: 'center',
  },

  day: {
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dayToday: {
    backgroundColor: colors.mint,      // mint circle for today
  },

  dayNum: {
    fontFamily: fontFamily.roundedBold, // Nunito 700 Bold — matches screenshot
    fontSize: 16,
    color: colors.ink,
    letterSpacing: -0.2,
  },
  dayNumToday: {
    color: '#fff',
  },

  dots: { flexDirection: 'row', gap: 3, marginTop: 2, height: 5 },
  dot:  { width: 5, height: 5, borderRadius: 3 },
});
