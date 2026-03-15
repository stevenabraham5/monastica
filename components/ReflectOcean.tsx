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

// Domain symbols that float on the water — matching GoalCard symbols
// Spread across two rows at different depths for readability
const FLOATING_ICONS = [
  { symbol: '\u263D', tint: '#7B8FA1', x: '5%',  y: '48%', delay: 0 },      // ☽ sleep
  { symbol: '\u223F', tint: '#6B9F78', x: '20%', y: '52%', delay: 400 },    // ∿ movement
  { symbol: '\u25CB', tint: '#C49A6C', x: '35%', y: '46%', delay: 800 },    // ○ nourishment
  { symbol: '\u2727', tint: '#9B7EC8', x: '50%', y: '55%', delay: 200 },    // ✧ creative
  { symbol: '\u25A0', tint: '#5A7D8F', x: '65%', y: '48%', delay: 600 },    // ■ work
  { symbol: '\u2022', tint: '#4A8C6F', x: '78%', y: '54%', delay: 1000 },   // • learning
  { symbol: '\u2661', tint: '#C07878', x: '12%', y: '62%', delay: 300 },    // ♡ people
  { symbol: '\u2229', tint: '#7889A0', x: '55%', y: '65%', delay: 700 },    // ∩ professional
];

function FloatingIcon({ symbol, tint, x, yPos, delay }: {
  symbol: string; tint: string; x: string; yPos: string; delay: number;
}) {
  const bob = useSharedValue(0);
  const drift = useSharedValue(0);

  useEffect(() => {
    bob.value = withDelay(
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
    transform: [{ translateY: bob.value }, { translateX: drift.value }],
  }));

  return (
    <Animated.View style={[styles.floatingIcon, { left: x as any, top: yPos as any }, style]}>
      <TempoText variant="body" style={{ fontSize: 26, color: tint }}>{symbol}</TempoText>
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
      <View style={[styles.waveLine, styles.wave1, { backgroundColor: waterColor + '25' }]} />
      <View style={[styles.waveLine, styles.wave2, { backgroundColor: waterColor + '20' }]} />
      <View style={[styles.waveLine, styles.wave3, { backgroundColor: waterColor + '18' }]} />
      <View style={[styles.waveLine, styles.wave4, { backgroundColor: waterColor + '15' }]} />

      {/* ── Landforms ── */}

      {/* Main island — right side, with cliff face */}
      <View style={[styles.landmass, { backgroundColor: colors.ink3, opacity: 0.45 }]}>
        <View style={[styles.landPeak, { backgroundColor: colors.ink3, opacity: 0.45 }]} />
      </View>
      {/* Cliff face on main island — steep left edge */}
      <View style={[styles.cliffFace, { backgroundColor: colors.ink3, opacity: 0.38 }]} />

      {/* Small island — far left, low */}
      <View style={[styles.islandSmallLeft, { backgroundColor: colors.ink3, opacity: 0.35 }]} />

      {/* Distant island — center-left, on horizon */}
      <View style={[styles.islandDistant, { backgroundColor: colors.ink3, opacity: 0.25 }]} />

      {/* Rocky outcrop — far right, partially off-screen */}
      <View style={[styles.rockRight, { backgroundColor: colors.ink3, opacity: 0.42 }]} />
      <View style={[styles.rockRightPeak, { backgroundColor: colors.ink3, opacity: 0.42 }]} />

      {/* Cliff promontory — left foreground */}
      <View style={[styles.cliffLeft, { backgroundColor: colors.ink3, opacity: 0.30 }]} />
      <View style={[styles.cliffLeftTop, { backgroundColor: colors.ink3, opacity: 0.30 }]} />

      {/* Ship — bobbing left of center */}
      <BobbingShip waterColor={waterColor} />

      {/* Floating domain symbols on the water */}
      {FLOATING_ICONS.map((icon) => (
        <FloatingIcon
          key={icon.symbol}
          symbol={icon.symbol}
          tint={icon.tint}
          x={icon.x}
          yPos={icon.y}
          delay={icon.delay}
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
    height: 280,
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
  wave4: {
    top: '86%',
    left: '50%',
    width: '28%',
  },
  // Main island — right side, rounded hill with cliff
  landmass: {
    position: 'absolute',
    right: '8%',
    top: '22%',
    width: 75,
    height: 40,
    borderTopLeftRadius: 35,
    borderTopRightRadius: 25,
    borderBottomLeftRadius: 4,
    borderBottomRightRadius: 4,
  },
  landPeak: {
    position: 'absolute',
    left: 12,
    top: -14,
    width: 35,
    height: 22,
    borderTopLeftRadius: 22,
    borderTopRightRadius: 18,
  },
  // Cliff face — steep vertical on the left side of main island
  cliffFace: {
    position: 'absolute',
    right: '22%',
    top: '25%',
    width: 6,
    height: 36,
    borderTopLeftRadius: 2,
    borderBottomLeftRadius: 1,
  },
  // Small low island — far left
  islandSmallLeft: {
    position: 'absolute',
    left: '5%',
    top: '35%',
    width: 40,
    height: 14,
    borderTopLeftRadius: 14,
    borderTopRightRadius: 10,
    borderBottomLeftRadius: 2,
    borderBottomRightRadius: 2,
  },
  // Distant island on horizon — center-left
  islandDistant: {
    position: 'absolute',
    left: '32%',
    top: '36%',
    width: 28,
    height: 10,
    borderTopLeftRadius: 10,
    borderTopRightRadius: 8,
    borderBottomLeftRadius: 1,
    borderBottomRightRadius: 1,
  },
  // Rocky outcrop — far right, partially off-screen
  rockRight: {
    position: 'absolute',
    right: -8,
    top: '30%',
    width: 30,
    height: 30,
    borderTopLeftRadius: 6,
    borderTopRightRadius: 0,
    borderBottomLeftRadius: 2,
  },
  rockRightPeak: {
    position: 'absolute',
    right: 2,
    top: '22%',
    width: 16,
    height: 18,
    borderTopLeftRadius: 10,
    borderTopRightRadius: 4,
  },
  // Cliff promontory — left foreground
  cliffLeft: {
    position: 'absolute',
    left: -6,
    top: '55%',
    width: 24,
    height: 50,
    borderTopRightRadius: 8,
    borderBottomRightRadius: 4,
  },
  cliffLeftTop: {
    position: 'absolute',
    left: -6,
    top: '50%',
    width: 18,
    height: 14,
    borderTopRightRadius: 12,
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
