import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors } from '../theme/colors';
import { fontFamily } from '../theme/typography';

// Urgency color per PRD §5.2.5: green > 7d, orange 3–7d, red < 3d
export function DueDateBadge({ daysUntil, label }: { daysUntil: number; label?: string }) {
  const color = daysUntil < 0
    ? colors.coral
    : daysUntil < 3
    ? colors.coral
    : daysUntil <= 7
    ? colors.amber
    : colors.sage;
  const soft = daysUntil < 0
    ? colors.coralSoft
    : daysUntil < 3
    ? colors.coralSoft
    : daysUntil <= 7
    ? colors.amberSoft
    : colors.sageSoft;
  const text = label ?? (daysUntil < 0 ? `${Math.abs(daysUntil)}d overdue` : daysUntil === 0 ? 'today' : `${daysUntil}d`);
  return (
    <View style={[styles.badge, { backgroundColor: soft }]}>
      <Text style={[styles.text, { color }]}>{text}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
    alignSelf: 'flex-start',
  },
  text: {
    fontFamily: fontFamily.monoMedium,
    fontSize: 11,
    letterSpacing: 0.3,
  },
});
