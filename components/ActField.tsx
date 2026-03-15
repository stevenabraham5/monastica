import React, { useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  withDelay,
  withSequence,
  Easing,
} from 'react-native-reanimated';
import { TempoText } from './TempoText';
import { useColors } from '../constants/colors';
import { spacing } from '../constants/spacing';

/*
  ActField — a green field with animated grass blades and action markers.

  Each pending action is a vertical blade that sways gently.
  When actions are cleared the field calms. Empty = open green horizon.
  Conveys: GO. DO. LIVE.
*/

interface ActFieldProps {
  actionCount: number;    // pending actions
  completedToday: number; // actions completed today
}

function GrassBlade({ index, total, color }: { index: number; total: number; color: string }) {
  const sway = useSharedValue(0);

  useEffect(() => {
    const offset = (index / Math.max(total, 1)) * 1000;
    sway.value = withDelay(
      offset,
      withRepeat(
        withSequence(
          withTiming(1, { duration: 1800 + index * 200, easing: Easing.inOut(Easing.sin) }),
          withTiming(-1, { duration: 1800 + index * 200, easing: Easing.inOut(Easing.sin) }),
        ),
        -1,
      ),
    );
  }, []);

  const style = useAnimatedStyle(() => ({
    transform: [{ rotate: `${sway.value * 4}deg` }],
  }));

  // Distribute blades across width
  const leftPct = 8 + (index / Math.max(total - 1, 1)) * 84;
  const height = 30 + Math.random() * 30;

  return (
    <Animated.View
      style={[
        styles.blade,
        {
          left: `${leftPct}%`,
          height,
          backgroundColor: color,
          opacity: 0.5 + Math.random() * 0.4,
        },
        style,
      ]}
    />
  );
}

export function ActField({ actionCount, completedToday }: ActFieldProps) {
  const colors = useColors();
  const fieldGreen = '#4A8C5C';
  const bladeCount = Math.max(actionCount, 3); // at least 3 ambient blades

  return (
    <View style={[styles.container, { backgroundColor: fieldGreen + '0A' }]}>
      {/* Sky gradient */}
      <View style={[styles.sky, { backgroundColor: fieldGreen + '06' }]} />

      {/* Horizon line */}
      <View style={[styles.horizonLine, { backgroundColor: fieldGreen + '20' }]} />

      {/* Ground */}
      <View style={[styles.ground, { backgroundColor: fieldGreen + '10' }]} />

      {/* Grass blades */}
      {Array.from({ length: bladeCount }).map((_, i) => (
        <GrassBlade key={i} index={i} total={bladeCount} color={fieldGreen} />
      ))}

      {/* Action dots — one per pending action, lined up at base */}
      {actionCount > 0 && (
        <View style={styles.dotRow}>
          {Array.from({ length: Math.min(actionCount, 8) }).map((_, i) => (
            <View key={i} style={[styles.actionDot, { backgroundColor: fieldGreen }]} />
          ))}
        </View>
      )}

      {/* Status */}
      <View style={styles.statusRow}>
        {actionCount === 0 ? (
          <TempoText variant="caption" color={fieldGreen} style={styles.statusText}>
            All clear
          </TempoText>
        ) : (
          <TempoText variant="data" color={fieldGreen} style={styles.statusText}>
            {actionCount} waiting
          </TempoText>
        )}
        {completedToday > 0 && (
          <TempoText variant="caption" color={fieldGreen + '88'} style={styles.statusText}>
            {completedToday} done today
          </TempoText>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    height: 160,
    overflow: 'hidden',
    position: 'relative',
    borderRadius: 16,
  },
  sky: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: '55%',
  },
  horizonLine: {
    position: 'absolute',
    top: '55%',
    left: 0,
    right: 0,
    height: 1,
  },
  ground: {
    position: 'absolute',
    top: '55%',
    left: 0,
    right: 0,
    bottom: 0,
  },
  blade: {
    position: 'absolute',
    bottom: '45%',
    width: 2,
    borderRadius: 1,
    transformOrigin: 'bottom',
  },
  dotRow: {
    position: 'absolute',
    bottom: '45%',
    left: spacing.xl,
    right: spacing.xl,
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 6,
    transform: [{ translateY: 10 }],
  },
  actionDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    opacity: 0.6,
  },
  statusRow: {
    position: 'absolute',
    bottom: spacing.base,
    left: spacing.base,
    right: spacing.base,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  statusText: {
    fontSize: 12,
    letterSpacing: 0.5,
  },
});
