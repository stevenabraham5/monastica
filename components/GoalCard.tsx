import React, { useEffect } from 'react';
import { View, StyleSheet, Pressable } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withDelay,
} from 'react-native-reanimated';
import { TempoText } from './TempoText';
import { useColors } from '../constants/colors';
import { spacing } from '../constants/spacing';
import { TEMPO_EASING } from '../constants/motion';

// Each domain gets a quiet symbol and a fill colour tint
const domainVisuals: Record<string, { symbol: string; tint: string }> = {
  'Sleep & Recovery':            { symbol: '\u263D', tint: '#7B8FA1' }, // ☽  slate blue
  'Movement & Body':             { symbol: '\u223F', tint: '#6B9F78' }, // ∿  green
  'Nourishment':                 { symbol: '\u25CB', tint: '#C49A6C' }, // ○  warm amber
  'Creative Expression':         { symbol: '\u2727', tint: '#9B7EC8' }, // ✧  violet
  'Professional Work':           { symbol: '\u25A0', tint: '#5A7D8F' }, // ■  teal grey
  'Learning & Growth':           { symbol: '\u2022', tint: '#4A8C6F' }, // •  forest
  'People I Love':               { symbol: '\u2661', tint: '#C07878' }, // ♡  dusty rose
  'Professional Relationships':  { symbol: '\u2229', tint: '#7889A0' }, // ∩  cool slate
};

interface GoalCardProps {
  domain: string;
  goalStatement: string;
  targetHours: number;
  actualHours: number;
  subjectiveLevel?: number | null;
  onPress?: () => void;
  index?: number;
}

export function GoalCard({
  domain,
  targetHours,
  actualHours,
  subjectiveLevel,
  onPress,
  index = 0,
}: GoalCardProps) {
  const colors = useColors();
  const progress = subjectiveLevel != null
    ? subjectiveLevel
    : targetHours > 0 ? Math.min(actualHours / targetHours, 1) : 0;
  const fillHeight = useSharedValue(0);
  const visual = domainVisuals[domain] ?? { symbol: '\u25CF', tint: colors.accent };

  useEffect(() => {
    fillHeight.value = withDelay(
      index * 100,
      withTiming(progress, { duration: 900, easing: TEMPO_EASING }),
    );
  }, [progress]);

  const fillStyle = useAnimatedStyle(() => ({
    height: `${fillHeight.value * 100}%`,
  }));

  const hasRating = subjectiveLevel != null;

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.card,
        { backgroundColor: 'rgba(255, 255, 255, 0.25)', borderColor: pressed ? visual.tint : 'rgba(255, 255, 255, 0.3)' },
        pressed && { opacity: 0.85 },
      ]}
      accessibilityLabel={`${domain}`}
      accessibilityRole="button"
      accessibilityHint="Tap to rate how this feels"
    >
      {/* Symbol */}
      <TempoText variant="heading" style={[styles.symbol, { color: visual.tint }]}>
        {visual.symbol}
      </TempoText>

      {/* Vessel — fills from bottom */}
      <View style={[styles.vessel, { backgroundColor: colors.border }]}>
        <Animated.View
          style={[
            styles.fill,
            { backgroundColor: visual.tint },
            fillStyle,
          ]}
        />
      </View>

      {/* Domain label */}
      <TempoText variant="caption" color={colors.ink2} style={styles.label} numberOfLines={2}>
        {domain}
      </TempoText>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    width: 68,
    alignItems: 'center',
    borderRadius: 10,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.xs,
    borderWidth: StyleSheet.hairlineWidth,
    gap: spacing.xs,
  },
  symbol: {
    fontSize: 18,
    textAlign: 'center',
    lineHeight: 22,
  },
  vessel: {
    width: 5,
    height: 36,
    borderRadius: 2.5,
    overflow: 'hidden',
    justifyContent: 'flex-end',
  },
  fill: {
    width: '100%',
    borderRadius: 3,
  },
  label: {
    textAlign: 'center',
    fontSize: 9,
    lineHeight: 11,
  },
});
