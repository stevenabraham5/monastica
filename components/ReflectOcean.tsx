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
  ReflectOcean — water with a land mass, a bobbing ship,
  and Tempo domain icons floating on the surface.

  - Horizon divides sky (light) from water (tinted by feeling).
  - A rounded landmass sits right of center.
  - A small ship outline bobs on the water left of center.
  - Domain icons (emoji circles) drift gently on the water surface.
  - Check-in count shown in corner.
*/

interface ReflectOceanProps {
  checkinsToday: number;
  latestFeeling: string | null;
}

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

// Domain icons that float on the water
const FLOATING_ICONS = [
  { emoji: '\u{1F4A4}', x: '12%', delay: 0 },      // sleep
  { emoji: '\u{1F3C3}', x: '28%', delay: 400 },     // movement
  { emoji: '\u{1F957}', x: '42%', delay: 800 },     // nourishment
  { emoji: '\u{1F3A8}', x: '58%', delay: 200 },     // creative
  { emoji: '\u{1F4BB}', x: '72%', delay: 600 },     // work
  { emoji: '\u{1F4D6}', x: '85%', delay: 1000 },    // learning
  { emoji: '\u2764\uFE0F', x: '20%', delay: 300 },  // people
  { emoji: '\u{1F91D}', x: '68%', delay: 700 },     // professional rel
];

function FloatingIcon({ emoji, x, delay, waterColor }: {
  emoji: string; x: string; delay: number; waterColor: string;
}) {
  const y = useSharedValue(0);
  const drift = useSharedValue(0);

  useEffect(() => {
    y.value = withDelay(
      delay,
      withRepeat(
        withSequence(
          withTiming(-4, { duration: 2200, easing: Easing.inOut(Easing.sin) }),
          withTiming(4, { duration: 2200, easing: Easing.inOut(Easing.sin) }),
        ),
        -1,
      ),
    );
    drift.value = withDelay(
      delay + 200,
      withRepeat(
        withSequence(
          withTiming(3, { duration: 3000, easing: Easing.inOut(Easing.sin) }),
          withTiming(-3, { duration: 3000, easing: Easing.inOut(Easing.sin) }),
        ),
        -1,
      ),
    );
  }, []);

  const style = useAnimatedStyle(() => ({
    transform: [{ translateY: y.value }, { translateX: drift.value }],
  }));

  return (
    <Animated.View style={[styles.floatingIcon, { left: x as any }, style]}>
      <TempoText variant="caption" style={{ fontSize: 14 }}>{emoji}</TempoText>
    </Animated.View>
  );
}

function BobbingShip({ waterColor }: { waterColor: string }) {
  const colors = useColors();
  const bob = useSharedValue(0);
  const tilt = useSharedValue(0);

  useEffect(() => {
    bob.value = withRepeat(
      withSequence(
        withTiming(-5, { duration: 2000, easing: Easing.inOut(Easing.sin) }),
        withTiming(5, { duration: 2000, easing: Easing.inOut(Easing.sin) }),
      ),
      -1,
    );
    tilt.value = withRepeat(
      withSequence(
        withTiming(4, { duration: 2400, easing: Easing.inOut(Easing.sin) }),
        withTiming(-4, { duration: 2400, easing: Easing.inOut(Easing.sin) }),
      ),
      -1,
    );
  }, []);

  const shipStyle = useAnimatedStyle(() => ({
    transform: [
      { translateY: bob.value },
      { rotate: `${tilt.value}deg` },
    ],
  }));

  return (
    <Animated.View style={[styles.ship, shipStyle]}>
      {/* Hull — a simple curved line */}
      <View style={[styles.hull, { borderColor: colors.ink3 }]} />
      {/* Mast */}
      <View style={[styles.mast, { backgroundColor: colors.ink3 }]} />
      {/* Sail — a small triangle approximated with a rotated square */}
      <View style={[styles.sail, { borderColor: colors.ink3, borderRightColor: 'transparent' }]} />
    </Animated.View>
  );
}

export function ReflectOcean({ checkinsToday, latestFeeling }: ReflectOceanProps) {
  const colors = useColors();
  const waterColor = (latestFeeling && FEELING_TINTS[latestFeeling]) || '#7EB8D4';

  // Gentle wave motion for the water surface
  const waveX = useSharedValue(0);
  useEffect(() => {
    waveX.value = withRepeat(
      withSequence(
        withTiming(8, { duration: 3500, easing: Easing.inOut(Easing.sin) }),
        withTiming(-8, { duration: 3500, easing: Easing.inOut(Easing.sin) }),
      ),
      -1,
    );
  }, []);

  const horizonStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: waveX.value }],
  }));

  return (
    <View style={[styles.container, { backgroundColor: waterColor + '08' }]}>
      {/* Sky */}
      <View style={[styles.sky, { backgroundColor: waterColor + '06' }]} />

      {/* Horizon line */}
      <Animated.View style={[styles.horizon, { backgroundColor: waterColor + '35' }, horizonStyle]} />

      {/* Water surface */}
      <View style={[styles.water, { backgroundColor: waterColor + '18' }]} />

      {/* Wave lines — thin horizontal strokes suggesting movement */}
      <View style={[styles.waveLine, styles.wave1, { backgroundColor: waterColor + '20' }]} />
      <View style={[styles.waveLine, styles.wave2, { backgroundColor: waterColor + '15' }]} />
      <View style={[styles.waveLine, styles.wave3, { backgroundColor: waterColor + '12' }]} />

      {/* Land mass — rounded shape on the right, above the horizon */}
      <View style={[styles.landmass, { backgroundColor: colors.border }]}>
        <View style={[styles.landPeak, { backgroundColor: colors.border }]} />
      </View>

      {/* Ship — bobbing left of center */}
      <BobbingShip waterColor={waterColor} />

      {/* Floating domain icons on the water */}
      {FLOATING_ICONS.map((icon) => (
        <FloatingIcon
          key={icon.emoji}
          emoji={icon.emoji}
          x={icon.x}
          delay={icon.delay}
          waterColor={waterColor}
        />
      ))}

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
    height: 220,
    overflow: 'hidden',
    position: 'relative',
    borderRadius: 16,
  },
  sky: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: '40%',
  },
  horizon: {
    position: 'absolute',
    top: '40%',
    left: -20,
    right: -20,
    height: 1,
  },
  water: {
    position: 'absolute',
    top: '40%',
    left: 0,
    right: 0,
    bottom: 0,
  },
  waveLine: {
    position: 'absolute',
    left: '15%',
    height: 1,
    borderRadius: 0.5,
  },
  wave1: {
    top: '52%',
    width: '30%',
  },
  wave2: {
    top: '64%',
    left: '40%',
    width: '25%',
  },
  wave3: {
    top: '76%',
    left: '20%',
    width: '35%',
  },
  // Land mass — right side, rounded hill
  landmass: {
    position: 'absolute',
    right: '8%',
    top: '25%',
    width: 70,
    height: 35,
    borderTopLeftRadius: 35,
    borderTopRightRadius: 25,
    borderBottomLeftRadius: 4,
    borderBottomRightRadius: 4,
  },
  landPeak: {
    position: 'absolute',
    left: 15,
    top: -12,
    width: 30,
    height: 20,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 15,
  },
  // Ship
  ship: {
    position: 'absolute',
    left: '25%',
    top: '34%',
    alignItems: 'center',
    width: 28,
    height: 30,
  },
  hull: {
    position: 'absolute',
    bottom: 0,
    width: 24,
    height: 10,
    borderWidth: 1.5,
    borderTopWidth: 0,
    borderBottomLeftRadius: 8,
    borderBottomRightRadius: 8,
    backgroundColor: 'transparent',
  },
  mast: {
    position: 'absolute',
    bottom: 8,
    width: 1.5,
    height: 20,
    borderRadius: 0.75,
  },
  sail: {
    position: 'absolute',
    bottom: 14,
    left: 14,
    width: 0,
    height: 0,
    borderTopWidth: 0,
    borderBottomWidth: 12,
    borderLeftWidth: 0,
    borderRightWidth: 8,
    borderBottomColor: 'transparent',
    borderTopColor: 'transparent',
    borderLeftColor: 'transparent',
    backgroundColor: 'transparent',
  },
  // Floating icons
  floatingIcon: {
    position: 'absolute',
    top: '43%',
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
