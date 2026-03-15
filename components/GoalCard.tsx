import React from 'react';
import { View, StyleSheet, Pressable } from 'react-native';
import { TempoText } from './TempoText';
import { ProgressBar } from './ProgressBar';
import { useColors } from '../constants/colors';
import { spacing } from '../constants/spacing';

interface GoalCardProps {
  domain: string;
  goalStatement: string;
  targetHours: number;
  actualHours: number;
  onPress?: () => void;
}

export function GoalCard({
  domain,
  goalStatement,
  targetHours,
  actualHours,
  onPress,
}: GoalCardProps) {
  const colors = useColors();
  const progress = targetHours > 0 ? Math.min(actualHours / targetHours, 1) : 0;

  return (
    <Pressable
      onPress={onPress}
      style={[
        styles.card,
        { backgroundColor: colors.surface, borderColor: colors.border },
      ]}
      accessibilityLabel={`${domain}: ${goalStatement}, ${actualHours} of ${targetHours} hours`}
      accessibilityRole="button"
    >
      <TempoText variant="label" color={colors.ink3}>
        {domain}
      </TempoText>
      <TempoText
        variant="subheading"
        style={styles.goalText}
        numberOfLines={2}
      >
        {goalStatement}
      </TempoText>
      <ProgressBar progress={progress} style={styles.bar} />
      <TempoText variant="data" color={colors.accent}>
        {actualHours}h / {targetHours}h this week
      </TempoText>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    width: 160,
    borderRadius: 12,
    padding: spacing.base,
    borderWidth: StyleSheet.hairlineWidth,
    gap: spacing.sm,
  },
  goalText: {
    marginTop: spacing.xs,
  },
  bar: {
    marginVertical: spacing.xs,
  },
});
