import React, { useEffect, useState } from 'react';
import { View, StyleSheet } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withDelay,
  interpolate,
} from 'react-native-reanimated';
import { TempoText } from './TempoText';
import { useColors } from '../constants/colors';
import { spacing } from '../constants/spacing';
import { TEMPO_EASING } from '../constants/motion';

/*
  TempoTree — horizontal line chart.
  One row per domain: symbol + name on the left, colored bar growing
  left-to-right to represent the domain's level (0–100%).
  Clean, readable, high contrast.
*/

interface DomainBranch {
  name: string;
  level: number; // 0..1
  tint: string;
}

interface TempoTreeProps {
  score: number;
  branches: DomainBranch[];
}

const DOMAIN_SYMBOLS: Record<string, string> = {
  'Sleep & Recovery': '\u263D',
  'Movement & Body': '\u223F',
  'Nourishment': '\u25CB',
  'Creative Expression': '\u2727',
  'Professional Work': '\u25A0',
  'Learning & Growth': '\u2022',
  'People I Love': '\u2661',
  'Professional Relationships': '\u2229',
};

const SHORT_NAMES: Record<string, string> = {
  'Sleep & Recovery': 'Sleep',
  'Movement & Body': 'Movement',
  'Nourishment': 'Nourish',
  'Creative Expression': 'Creative',
  'Professional Work': 'Work',
  'Learning & Growth': 'Learning',
  'People I Love': 'People',
  'Professional Relationships': 'Prof Rel',
};

function DomainRow({ branch, index }: { branch: DomainBranch; index: number }) {
  const colors = useColors();
  const grow = useSharedValue(0);

  useEffect(() => {
    grow.value = withDelay(
      80 + index * 80,
      withTiming(1, { duration: 700, easing: TEMPO_EASING }),
    );
  }, []);

  const barStyle = useAnimatedStyle(() => ({
    width: `${branch.level * 100 * grow.value}%` as any,
    opacity: interpolate(grow.value, [0, 0.1, 1], [0, 0.5, 1]),
  }));

  const pctStyle = useAnimatedStyle(() => ({
    opacity: grow.value,
  }));

  const symbol = DOMAIN_SYMBOLS[branch.name] ?? '\u25CF';
  const shortName = SHORT_NAMES[branch.name] ?? branch.name;
  const pct = Math.round(branch.level * 100);

  return (
    <View style={styles.row}>
      {/* Label column */}
      <View style={styles.labelCol}>
        <TempoText variant="body" style={{ fontSize: 26, color: branch.tint, lineHeight: 30 }}>
          {symbol}
        </TempoText>
        <TempoText
          variant="body"
          color={colors.ink}
          style={styles.domainName}
          numberOfLines={1}
        >
          {shortName}
        </TempoText>
      </View>

      {/* Bar column */}
      <View style={styles.barCol}>
        <View style={[styles.barTrack, { backgroundColor: branch.tint + '15' }]}>
          <Animated.View
            style={[
              styles.barFill,
              { backgroundColor: branch.tint },
              barStyle,
            ]}
          />
        </View>
      </View>

      {/* Percentage */}
      <Animated.View style={[styles.pctCol, pctStyle]}>
        <TempoText variant="data" color={branch.tint} style={styles.pctText}>
          {pct}
        </TempoText>
      </Animated.View>
    </View>
  );
}

export function TempoTree({ score, branches }: TempoTreeProps) {
  const colors = useColors();

  return (
    <View style={styles.container}>
      {/* Score header */}
      <View style={styles.scoreHeader}>
        <TempoText variant="data" color={colors.ink3} style={styles.scoreText}>
          {score}% overall
        </TempoText>
      </View>

      {/* Domain rows */}
      {branches.map((b, i) => (
        <DomainRow key={b.name} branch={b} index={i} />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingVertical: spacing.md,
  },
  scoreHeader: {
    alignItems: 'flex-end',
    marginBottom: spacing.sm,
    paddingRight: spacing.xs,
  },
  scoreText: {
    fontSize: 15,
    letterSpacing: 1,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 42,
    marginBottom: 6,
  },
  labelCol: {
    width: 120,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  domainName: {
    fontSize: 14,
    lineHeight: 18,
    flex: 1,
  },
  barCol: {
    flex: 1,
    paddingRight: spacing.sm,
  },
  barTrack: {
    height: 12,
    borderRadius: 6,
    overflow: 'hidden',
  },
  barFill: {
    height: '100%',
    borderRadius: 6,
  },
  pctCol: {
    width: 36,
    alignItems: 'flex-end',
  },
  pctText: {
    fontSize: 15,
    letterSpacing: 0.5,
  },
});
