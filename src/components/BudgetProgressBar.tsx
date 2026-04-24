import React from 'react';
import { View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { colors, budgetStateColor } from '../theme/colors';

interface Props {
  percentUsed: number;    // 0..1+ (can exceed 1 when over budget)
  height?: number;
  startColor?: string;    // optional gradient override
  endColor?: string;
}

export function BudgetProgressBar({ percentUsed, height = 6, startColor, endColor }: Props) {
  const clamped = Math.min(1, Math.max(0, percentUsed));
  const stateColor = budgetStateColor(percentUsed);

  // Determine gradient colours
  const gStart = startColor ?? stateColor;
  const gEnd   = endColor   ?? stateColor;

  return (
    <View style={{ height, borderRadius: height / 2, backgroundColor: colors.hair, overflow: 'hidden' }}>
      <View style={{ width: `${clamped * 100}%`, height, borderRadius: height / 2, overflow: 'hidden' }}>
        <LinearGradient
          colors={[gStart, gEnd]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={{ flex: 1 }}
        />
      </View>
    </View>
  );
}
