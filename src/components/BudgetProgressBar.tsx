import React from 'react';
import { View, StyleSheet } from 'react-native';
import { colors, budgetStateColor } from '../theme/colors';

interface Props {
  percentUsed: number; // 0..1+ (can exceed 1 to show overflow)
  height?: number;
}

export function BudgetProgressBar({ percentUsed, height = 6 }: Props) {
  const clamped = Math.min(1, Math.max(0, percentUsed));
  const overflow = Math.max(0, percentUsed - 1);
  const fillColor = budgetStateColor(percentUsed);

  return (
    <View style={[styles.track, { height, borderRadius: height / 2 }]}>
      <View
        style={{
          width: `${clamped * 100}%`,
          backgroundColor: fillColor,
          height,
          borderRadius: height / 2,
        }}
      />
      {overflow > 0 && (
        <View
          style={{
            position: 'absolute',
            right: 0,
            top: 0,
            bottom: 0,
            width: `${Math.min(20, overflow * 100)}%`,
            backgroundColor: colors.coral,
            borderTopRightRadius: height / 2,
            borderBottomRightRadius: height / 2,
            opacity: 0.9,
          }}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  track: { backgroundColor: colors.hair, overflow: 'hidden' },
});
