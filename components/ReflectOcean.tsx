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
  interpolate,
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
  fullScreen?: boolean;
}

const FEELING_TINTS: Record<string, string> = {
  rested:    '#4DB8E8',
  focused:   '#3A9AD4',
  steady:    '#4CAED8',
  energised: '#2CB0E8',
  scattered: '#6B94B8',
  drained:   '#7890A0',
  flat:      '#8898A4',
  restless:  '#5888AA',
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
      <TempoText variant="body" style={{ fontSize: 32, color: tint }}>{symbol}</TempoText>
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

/*
  FeelingAtmosphere — animated visual response when a feeling is selected.
  Clouds, sun rays, fog, or ripples appear and fade in based on the feeling.
*/

const FEELING_ATMOSPHERE: Record<string, {
  type: 'calm' | 'bright' | 'turbulent' | 'muted';
  skyColor: string;
  cloudColor: string;
  waterTint: string;
}> = {
  rested:    { type: 'calm',      skyColor: '#D0EAF8', cloudColor: '#E8F4FF', waterTint: '#90D0F0' },
  steady:    { type: 'calm',      skyColor: '#C8E2F0', cloudColor: '#E0F0FF', waterTint: '#88C8E8' },
  focused:   { type: 'bright',    skyColor: '#F8ECC0', cloudColor: '#FFF8D0', waterTint: '#D0B860' },
  energised: { type: 'bright',    skyColor: '#F8E0A0', cloudColor: '#FFF0B0', waterTint: '#E0C040' },
  scattered: { type: 'turbulent', skyColor: '#A0AAB8', cloudColor: '#8898A8', waterTint: '#607888' },
  restless:  { type: 'turbulent', skyColor: '#909AA8', cloudColor: '#788898', waterTint: '#506878' },
  drained:   { type: 'muted',     skyColor: '#B8BCC4', cloudColor: '#A0A8B0', waterTint: '#889098' },
  flat:      { type: 'muted',     skyColor: '#B0B4BC', cloudColor: '#98A0A8', waterTint: '#808890' },
};

function FeelingAtmosphere({ feeling }: { feeling: string | null }) {
  const fadeIn = useSharedValue(0);
  const drift1 = useSharedValue(0);
  const drift2 = useSharedValue(0);
  const pulse = useSharedValue(0);

  useEffect(() => {
    if (!feeling) return;
    // Fade in on feeling change
    fadeIn.value = 0;
    fadeIn.value = withTiming(1, { duration: 800, easing: Easing.out(Easing.cubic) });

    // Cloud/element drift
    drift1.value = withRepeat(
      withSequence(
        withTiming(15, { duration: 4000, easing: Easing.inOut(Easing.sin) }),
        withTiming(-15, { duration: 4000, easing: Easing.inOut(Easing.sin) }),
      ),
      -1,
    );
    drift2.value = withRepeat(
      withSequence(
        withTiming(-10, { duration: 3200, easing: Easing.inOut(Easing.sin) }),
        withTiming(10, { duration: 3200, easing: Easing.inOut(Easing.sin) }),
      ),
      -1,
    );
    pulse.value = withRepeat(
      withSequence(
        withTiming(1, { duration: 2000, easing: Easing.inOut(Easing.sin) }),
        withTiming(0, { duration: 2000, easing: Easing.inOut(Easing.sin) }),
      ),
      -1,
    );
  }, [feeling]);

  const containerStyle = useAnimatedStyle(() => ({
    opacity: fadeIn.value,
  }));

  const cloud1Style = useAnimatedStyle(() => ({
    transform: [{ translateX: drift1.value }],
  }));

  const cloud2Style = useAnimatedStyle(() => ({
    transform: [{ translateX: drift2.value }],
  }));

  const cloud3Style = useAnimatedStyle(() => ({
    transform: [{ translateX: drift1.value * 0.6 }],
  }));

  const rayStyle = useAnimatedStyle(() => ({
    opacity: interpolate(pulse.value, [0, 1], [0.15, 0.40]),
  }));

  if (!feeling) return null;

  const atmo = FEELING_ATMOSPHERE[feeling] ?? FEELING_ATMOSPHERE.steady;
  const cc = atmo.cloudColor;
  const sc = atmo.skyColor;
  const wt = atmo.waterTint;

  return (
    <Animated.View style={[StyleSheet.absoluteFill, containerStyle]} pointerEvents="none">
      {/* Full-screen sky wash — dramatically tints the upper half */}
      <View style={[atmosStyles.skyWash, { backgroundColor: sc, opacity: 0.45 }]} />

      {/* Full-screen water tint — tints the lower half */}
      <View style={[atmosStyles.waterWash, { backgroundColor: wt, opacity: 0.30 }]} />

      {/* Large clouds — all types get big prominent clouds */}
      <Animated.View style={[atmosStyles.cloud, { top: '3%', left: '2%', width: 140, height: 48, backgroundColor: cc, opacity: 0.75, borderRadius: 24 }, cloud1Style]} />
      <Animated.View style={[atmosStyles.cloud, { top: '1%', right: '8%', width: 120, height: 40, backgroundColor: cc, opacity: 0.65, borderRadius: 20 }, cloud2Style]} />
      <Animated.View style={[atmosStyles.cloud, { top: '10%', left: '30%', width: 100, height: 36, backgroundColor: cc, opacity: 0.55, borderRadius: 18 }, cloud3Style]} />

      {/* Type-specific dramatic effects */}
      {atmo.type === 'bright' && (
        <>
          {/* Massive sun glow — pulsing golden orb */}
          <Animated.View style={[atmosStyles.glow, { top: '-12%', right: '-5%', width: 200, height: 200, backgroundColor: '#F0C840', borderRadius: 100 }, rayStyle]} />
          {/* Wide sun rays */}
          <Animated.View style={[atmosStyles.ray, { top: '0%', right: '5%', width: 8, height: 140, backgroundColor: '#F0D060', transform: [{ rotate: '25deg' }] }, rayStyle]} />
          <Animated.View style={[atmosStyles.ray, { top: '-4%', right: '18%', width: 6, height: 120, backgroundColor: '#F0D060', transform: [{ rotate: '15deg' }] }, rayStyle]} />
          <Animated.View style={[atmosStyles.ray, { top: '2%', right: '0%', width: 6, height: 100, backgroundColor: '#F0D060', transform: [{ rotate: '35deg' }] }, rayStyle]} />
          <Animated.View style={[atmosStyles.ray, { top: '-5%', right: '12%', width: 5, height: 130, backgroundColor: '#F0D060', transform: [{ rotate: '8deg' }] }, rayStyle]} />
          {/* Sparkles */}
          <Animated.View style={[atmosStyles.sparkle, { top: '15%', left: '20%' }, rayStyle]} />
          <Animated.View style={[atmosStyles.sparkle, { top: '25%', right: '25%' }, rayStyle]} />
          <Animated.View style={[atmosStyles.sparkle, { top: '35%', left: '60%' }, rayStyle]} />
          <Animated.View style={[atmosStyles.sparkle, { top: '18%', right: '40%' }, rayStyle]} />
        </>
      )}

      {atmo.type === 'muted' && (
        <>
          {/* Heavy fog banks — wide, layered, covering much of the scene */}
          <Animated.View style={[atmosStyles.cloud, { top: '15%', left: -30, width: '85%', height: 44, backgroundColor: cc, opacity: 0.70, borderRadius: 22 }, cloud1Style]} />
          <Animated.View style={[atmosStyles.cloud, { top: '25%', right: -20, width: '75%', height: 36, backgroundColor: cc, opacity: 0.60, borderRadius: 18 }, cloud2Style]} />
          <Animated.View style={[atmosStyles.cloud, { top: '35%', left: '5%', width: '65%', height: 30, backgroundColor: cc, opacity: 0.50, borderRadius: 15 }, cloud3Style]} />
          <Animated.View style={[atmosStyles.cloud, { top: '45%', right: '0%', width: '70%', height: 26, backgroundColor: cc, opacity: 0.40, borderRadius: 13 }, cloud1Style]} />
          {/* Muted overlay */}
          <View style={[atmosStyles.skyWash, { backgroundColor: '#9098A0', opacity: 0.15 }]} />
        </>
      )}

      {atmo.type === 'turbulent' && (
        <>
          {/* Dark storm clouds — big and moody */}
          <Animated.View style={[atmosStyles.cloud, { top: '5%', left: '0%', width: 130, height: 44, backgroundColor: '#606870', opacity: 0.70, borderRadius: 22 }, cloud2Style]} />
          <Animated.View style={[atmosStyles.cloud, { top: '12%', right: '3%', width: 110, height: 38, backgroundColor: '#586068', opacity: 0.65, borderRadius: 19 }, cloud1Style]} />
          <Animated.View style={[atmosStyles.cloud, { top: '0%', left: '25%', width: 90, height: 32, backgroundColor: '#505860', opacity: 0.55, borderRadius: 16 }, cloud3Style]} />
          {/* Choppy wave lines across water */}
          <View style={[atmosStyles.extraWave, { top: '46%', left: '0%', width: '55%', backgroundColor: '#506070', opacity: 0.35, height: 3 }]} />
          <View style={[atmosStyles.extraWave, { top: '52%', left: '25%', width: '60%', backgroundColor: '#506070', opacity: 0.30, height: 3 }]} />
          <View style={[atmosStyles.extraWave, { top: '58%', left: '8%', width: '50%', backgroundColor: '#506070', opacity: 0.25, height: 2.5 }]} />
          <View style={[atmosStyles.extraWave, { top: '64%', left: '35%', width: '45%', backgroundColor: '#506070', opacity: 0.22, height: 2 }]} />
        </>
      )}

      {atmo.type === 'calm' && (
        <>
          {/* Wide shimmer lines on the water — peaceful glints */}
          <Animated.View style={[atmosStyles.waterGlow, { top: '44%', left: '15%', width: 130, height: 10, backgroundColor: '#fff', opacity: 0.30, borderRadius: 5 }, cloud1Style]} />
          <Animated.View style={[atmosStyles.waterGlow, { top: '52%', left: '35%', width: 100, height: 8, backgroundColor: '#fff', opacity: 0.25, borderRadius: 4 }, cloud2Style]} />
          <Animated.View style={[atmosStyles.waterGlow, { top: '60%', left: '10%', width: 110, height: 7, backgroundColor: '#fff', opacity: 0.20, borderRadius: 3.5 }, cloud3Style]} />
          <Animated.View style={[atmosStyles.waterGlow, { top: '68%', left: '40%', width: 80, height: 6, backgroundColor: '#fff', opacity: 0.18, borderRadius: 3 }, cloud1Style]} />
        </>
      )}
    </Animated.View>
  );
}

const atmosStyles = StyleSheet.create({
  skyWash: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: '45%',
  },
  waterWash: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: '55%',
  },
  cloud: {
    position: 'absolute',
  },
  ray: {
    position: 'absolute',
    borderRadius: 3,
  },
  glow: {
    position: 'absolute',
  },
  sparkle: {
    position: 'absolute',
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#FFF8D0',
  },
  extraWave: {
    position: 'absolute',
    borderRadius: 1.5,
  },
  waterGlow: {
    position: 'absolute',
  },
});

export function ReflectOcean({ checkinsToday, latestFeeling, fullScreen }: ReflectOceanProps) {
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
    <View style={[styles.container, fullScreen && styles.containerFull, { backgroundColor: waterColor + '18' }]}>
      {/* Sky */}
      <View style={[styles.sky, { backgroundColor: waterColor + '12' }]} />

      {/* Horizon line */}
      <Animated.View style={[styles.horizon, { backgroundColor: waterColor + '55' }, horizonStyle]} />

      {/* Water surface */}
      <View style={[styles.water, { backgroundColor: waterColor + '30' }]} />

      {/* Wave lines — thin horizontal strokes suggesting movement */}
      <View style={[styles.waveLine, styles.wave1, { backgroundColor: waterColor + '40' }]} />
      <View style={[styles.waveLine, styles.wave2, { backgroundColor: waterColor + '35' }]} />
      <View style={[styles.waveLine, styles.wave3, { backgroundColor: waterColor + '30' }]} />
      <View style={[styles.waveLine, styles.wave4, { backgroundColor: waterColor + '28' }]} />

      {/* ── Landforms ── */}

      {/* Main island — right side, with cliff face */}
      <View style={[styles.landmass, { backgroundColor: '#5A7060', opacity: 0.65 }]}>
        <View style={[styles.landPeak, { backgroundColor: '#5A7060', opacity: 0.65 }]} />
      </View>
      {/* Cliff face on main island — steep left edge */}
      <View style={[styles.cliffFace, { backgroundColor: '#4A6050', opacity: 0.58 }]} />

      {/* Small island — far left, low */}
      <View style={[styles.islandSmallLeft, { backgroundColor: '#5A7060', opacity: 0.55 }]} />

      {/* Distant island — center-left, on horizon */}
      <View style={[styles.islandDistant, { backgroundColor: '#6A8070', opacity: 0.45 }]} />

      {/* Rocky outcrop — far right, partially off-screen */}
      <View style={[styles.rockRight, { backgroundColor: '#5A7060', opacity: 0.60 }]} />
      <View style={[styles.rockRightPeak, { backgroundColor: '#5A7060', opacity: 0.60 }]} />

      {/* Cliff promontory — left foreground */}
      <View style={[styles.cliffLeft, { backgroundColor: '#4A6050', opacity: 0.50 }]} />
      <View style={[styles.cliffLeftTop, { backgroundColor: '#4A6050', opacity: 0.50 }]} />

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

      {/* Feeling atmosphere — visual response to selected feeling */}
      <FeelingAtmosphere feeling={latestFeeling} />

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
  containerFull: {
    height: '100%',
    borderRadius: 0,
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
