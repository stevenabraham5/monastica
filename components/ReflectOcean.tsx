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
  ReflectOcean — a calm blue surface with animated ripple rings.

  The number of visible ripples corresponds to today's check-in count (0-3).
  The overall tint shifts subtly based on the latest feeling.
  Three concentric ripple rings pulse outward from center — like dropping
  a thought into still water.
*/

interface ReflectOceanProps {
  checkinsToday: number;  // 0..3+
  latestFeeling: string | null;
}

// Feeling → water tint
const FEELING_TINTS: Record<string, string> = {
  rested:    '#7EB8D4',
  focused:   '#6EA8C8',
  steady:    '#7CAEC0',
  energised: '#5CA8D0',
  scattered: '#8BA4B0',
  drained:   '#94A0AA',
  flat:      '#9EAAB0',
  restless:  '#7898AA',
};

function Ripple({ delay, size, color }: { delay: number; size: number; color: string }) {
  const scale = useSharedValue(0.3);
  const opacity = useSharedValue(0.6);

  useEffect(() => {
    scale.value = withDelay(
      delay,
      withRepeat(
        withSequence(
          withTiming(1, { duration: 3000, easing: Easing.out(Easing.quad) }),
          withTiming(0.3, { duration: 0 }),
        ),
        -1,
      ),
    );
    opacity.value = withDelay(
      delay,
      withRepeat(
        withSequence(
          withTiming(0, { duration: 3000, easing: Easing.out(Easing.quad) }),
          withTiming(0.6, { duration: 0 }),
        ),
        -1,
      ),
    );
  }, []);

  const style = useAnimatedStyle(() => ({
    width: size,
    height: size,
    borderRadius: size / 2,
    borderWidth: 1.5,
    borderColor: color,
    opacity: opacity.value,
    transform: [{ scale: scale.value }],
    position: 'absolute' as const,
  }));

  return <Animated.View style={style} />;
}

export function ReflectOcean({ checkinsToday, latestFeeling }: ReflectOceanProps) {
  const colors = useColors();
  const waterColor = (latestFeeling && FEELING_TINTS[latestFeeling]) || '#7EB8D4';
  const rippleCount = Math.min(checkinsToday, 3);

  // Gentle horizon line sway
  const horizonX = useSharedValue(0);
  useEffect(() => {
    horizonX.value = withRepeat(
      withSequence(
        withTiming(6, { duration: 4000, easing: Easing.inOut(Easing.sin) }),
        withTiming(-6, { duration: 4000, easing: Easing.inOut(Easing.sin) }),
      ),
      -1,
    );
  }, []);

  const horizonStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: horizonX.value }],
  }));

  return (
    <View style={[styles.container, { backgroundColor: waterColor + '12' }]}>
      {/* Horizon */}
      <Animated.View style={[styles.horizon, { backgroundColor: waterColor + '30' }, horizonStyle]} />

      {/* Water surface gradient bands */}
      <View style={[styles.band, styles.bandTop, { backgroundColor: waterColor + '08' }]} />
      <View style={[styles.band, styles.bandMid, { backgroundColor: waterColor + '14' }]} />
      <View style={[styles.band, styles.bandBot, { backgroundColor: waterColor + '20' }]} />

      {/* Ripples — one per check-in today */}
      <View style={styles.rippleCenter}>
        {rippleCount >= 1 && <Ripple delay={0} size={80} color={waterColor} />}
        {rippleCount >= 2 && <Ripple delay={600} size={130} color={waterColor + 'AA'} />}
        {rippleCount >= 3 && <Ripple delay={1200} size={180} color={waterColor + '66'} />}
        {rippleCount === 0 && (
          <View style={[styles.stillDot, { backgroundColor: waterColor + '40' }]} />
        )}
      </View>

      {/* Check-in count */}
      <View style={styles.countRow}>
        <TempoText variant="data" color={waterColor} style={styles.countText}>
          {checkinsToday}/3
        </TempoText>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    height: 200,
    overflow: 'hidden',
    position: 'relative',
    borderRadius: 16,
  },
  horizon: {
    position: 'absolute',
    top: '35%',
    left: -20,
    right: -20,
    height: 1,
  },
  band: {
    position: 'absolute',
    left: 0,
    right: 0,
  },
  bandTop: {
    top: 0,
    height: '35%',
  },
  bandMid: {
    top: '35%',
    height: '30%',
  },
  bandBot: {
    top: '65%',
    bottom: 0,
    height: '35%',
  },
  rippleCenter: {
    position: 'absolute',
    top: '35%',
    left: '50%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  stillDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  countRow: {
    position: 'absolute',
    bottom: spacing.base,
    right: spacing.base,
  },
  countText: {
    fontSize: 12,
    letterSpacing: 1,
  },
});
