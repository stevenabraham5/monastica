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
  rested:    '#70C8F0',   // clear sky blue
  focused:   '#E0B040',   // warm amber
  steady:    '#60B0D8',   // soft blue
  energised: '#F0A020',   // bright orange-gold
  scattered: '#607888',   // dark steel
  drained:   '#908898',   // muted lavender-grey
  flat:      '#888090',   // flat grey-purple
  restless:  '#506878',   // stormy teal
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
  /** Cloud drift speed in ms — lower = faster */
  driftSpeed: number;
  /** Pulse speed in ms — lower = faster */
  pulseSpeed: number;
  /** Drift amplitude in px */
  driftAmount: number;
}> = {
  // CALM — soft blue, slow gentle drift, barely moving
  rested:    { type: 'calm',      skyColor: '#C8E8FF', cloudColor: '#E8F4FF', waterTint: '#80C8F0', driftSpeed: 7000, pulseSpeed: 4000, driftAmount: 8 },
  steady:    { type: 'calm',      skyColor: '#B8D8F0', cloudColor: '#D8ECFF', waterTint: '#70B8E0', driftSpeed: 8000, pulseSpeed: 4500, driftAmount: 6 },
  // BRIGHT — warm golden/orange, medium speed, radiant
  focused:   { type: 'bright',    skyColor: '#FFF0B0', cloudColor: '#FFF8D0', waterTint: '#E8C050', driftSpeed: 4500, pulseSpeed: 2200, driftAmount: 12 },
  energised: { type: 'bright',    skyColor: '#FFE080', cloudColor: '#FFEEAA', waterTint: '#F0B030', driftSpeed: 3000, pulseSpeed: 1500, driftAmount: 18 },
  // TURBULENT — dark grey/steel blue, fast erratic motion
  scattered: { type: 'turbulent', skyColor: '#6878888', cloudColor: '#586878', waterTint: '#405060', driftSpeed: 1800, pulseSpeed: 1200, driftAmount: 28 },
  restless:  { type: 'turbulent', skyColor: '#586070', cloudColor: '#4A5868', waterTint: '#384858', driftSpeed: 1400, pulseSpeed: 900, driftAmount: 35 },
  // MUTED — desaturated lavender/grey, very slow, nearly still
  drained:   { type: 'muted',     skyColor: '#C0B8C8', cloudColor: '#B0A8B8', waterTint: '#908890', driftSpeed: 12000, pulseSpeed: 6000, driftAmount: 4 },
  flat:      { type: 'muted',     skyColor: '#B8B0C0', cloudColor: '#A8A0B0', waterTint: '#888088', driftSpeed: 15000, pulseSpeed: 8000, driftAmount: 3 },
};

function FeelingAtmosphere({ feeling }: { feeling: string | null }) {
  const fadeIn = useSharedValue(0);
  const drift1 = useSharedValue(0);
  const drift2 = useSharedValue(0);
  const pulse = useSharedValue(0);

  useEffect(() => {
    if (!feeling) return;
    const atmo = FEELING_ATMOSPHERE[feeling] ?? FEELING_ATMOSPHERE.steady;
    const speed = atmo.driftSpeed;
    const amp = atmo.driftAmount;
    const pSpeed = atmo.pulseSpeed;

    // Fade in
    fadeIn.value = 0;
    fadeIn.value = withTiming(1, { duration: 800, easing: Easing.out(Easing.cubic) });

    // Drift — speed and amplitude vary dramatically per mood
    drift1.value = withRepeat(
      withSequence(
        withTiming(amp, { duration: speed, easing: Easing.inOut(Easing.sin) }),
        withTiming(-amp, { duration: speed, easing: Easing.inOut(Easing.sin) }),
      ),
      -1,
    );
    drift2.value = withRepeat(
      withSequence(
        withTiming(-amp * 0.7, { duration: speed * 0.8, easing: Easing.inOut(Easing.sin) }),
        withTiming(amp * 0.7, { duration: speed * 0.8, easing: Easing.inOut(Easing.sin) }),
      ),
      -1,
    );
    pulse.value = withRepeat(
      withSequence(
        withTiming(1, { duration: pSpeed, easing: Easing.inOut(Easing.sin) }),
        withTiming(0, { duration: pSpeed, easing: Easing.inOut(Easing.sin) }),
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
    opacity: interpolate(pulse.value, [0, 1], [0.20, 0.55]),
  }));

  const pulseGlowStyle = useAnimatedStyle(() => ({
    opacity: interpolate(pulse.value, [0, 1], [0.10, 0.35]),
    transform: [{ scale: interpolate(pulse.value, [0, 1], [0.9, 1.15]) }],
  }));

  if (!feeling) return null;

  const atmo = FEELING_ATMOSPHERE[feeling] ?? FEELING_ATMOSPHERE.steady;
  const cc = atmo.cloudColor;
  const sc = atmo.skyColor;
  const wt = atmo.waterTint;

  return (
    <Animated.View style={[StyleSheet.absoluteFill, containerStyle]} pointerEvents="none">

      {/* ═══════════ CALM — serene blue, soft light, gentle shimmer ═══════════ */}
      {atmo.type === 'calm' && (
        <>
          {/* Cool blue sky wash */}
          <View style={[atmosStyles.skyWash, { backgroundColor: sc, opacity: 0.50 }]} />
          {/* Soft blue water */}
          <View style={[atmosStyles.waterWash, { backgroundColor: wt, opacity: 0.35 }]} />
          {/* Gentle wispy clouds — few, high, light */}
          <Animated.View style={[atmosStyles.cloud, { top: '5%', left: '10%', width: 160, height: 32, backgroundColor: '#E0F0FF', opacity: 0.50, borderRadius: 16 }, cloud1Style]} />
          <Animated.View style={[atmosStyles.cloud, { top: '3%', right: '5%', width: 120, height: 26, backgroundColor: '#D8ECFF', opacity: 0.40, borderRadius: 13 }, cloud2Style]} />
          {/* Soft light — diffuse glow from above */}
          <Animated.View style={[atmosStyles.glow, { top: '-5%', left: '20%', width: 180, height: 120, backgroundColor: '#FFFFFF', borderRadius: 60 }, pulseGlowStyle]} />
          {/* Water shimmer — wide gentle glints that drift slowly */}
          <Animated.View style={[atmosStyles.waterGlow, { top: '48%', left: '10%', width: 160, height: 8, backgroundColor: '#FFFFFF', opacity: 0.25, borderRadius: 4 }, cloud1Style]} />
          <Animated.View style={[atmosStyles.waterGlow, { top: '56%', left: '40%', width: 120, height: 6, backgroundColor: '#FFFFFF', opacity: 0.20, borderRadius: 3 }, cloud2Style]} />
          <Animated.View style={[atmosStyles.waterGlow, { top: '64%', left: '5%', width: 140, height: 5, backgroundColor: '#FFFFFF', opacity: 0.18, borderRadius: 2.5 }, cloud3Style]} />
          <Animated.View style={[atmosStyles.waterGlow, { top: '72%', left: '50%', width: 90, height: 4, backgroundColor: '#FFFFFF', opacity: 0.15, borderRadius: 2 }, cloud1Style]} />
        </>
      )}

      {/* ═══════════ BRIGHT — warm golden, radiant sun, sparkling ═══════════ */}
      {atmo.type === 'bright' && (
        <>
          {/* Warm golden sky */}
          <View style={[atmosStyles.skyWash, { backgroundColor: sc, opacity: 0.60 }]} />
          {/* Amber-tinted water */}
          <View style={[atmosStyles.waterWash, { backgroundColor: wt, opacity: 0.40 }]} />
          {/* Bright warm clouds */}
          <Animated.View style={[atmosStyles.cloud, { top: '4%', left: '5%', width: 130, height: 42, backgroundColor: '#FFF0C0', opacity: 0.70, borderRadius: 21 }, cloud1Style]} />
          <Animated.View style={[atmosStyles.cloud, { top: '8%', right: '10%', width: 100, height: 34, backgroundColor: '#FFECB0', opacity: 0.55, borderRadius: 17 }, cloud2Style]} />
          {/* Massive pulsing sun */}
          <Animated.View style={[atmosStyles.glow, { top: '-15%', right: '-8%', width: 240, height: 240, backgroundColor: '#FFD020', borderRadius: 120 }, pulseGlowStyle]} />
          {/* Wide intense sun rays */}
          <Animated.View style={[atmosStyles.ray, { top: '-2%', right: '5%', width: 10, height: 180, backgroundColor: '#FFD840', transform: [{ rotate: '22deg' }] }, rayStyle]} />
          <Animated.View style={[atmosStyles.ray, { top: '-6%', right: '20%', width: 8, height: 160, backgroundColor: '#FFD840', transform: [{ rotate: '12deg' }] }, rayStyle]} />
          <Animated.View style={[atmosStyles.ray, { top: '0%', right: '-2%', width: 8, height: 140, backgroundColor: '#FFD840', transform: [{ rotate: '35deg' }] }, rayStyle]} />
          <Animated.View style={[atmosStyles.ray, { top: '-8%', right: '14%', width: 6, height: 170, backgroundColor: '#FFCC30', transform: [{ rotate: '5deg' }] }, rayStyle]} />
          {/* Sparkles scattered across the scene */}
          <Animated.View style={[atmosStyles.sparkle, { top: '12%', left: '15%', width: 8, height: 8, borderRadius: 4 }, rayStyle]} />
          <Animated.View style={[atmosStyles.sparkle, { top: '22%', right: '30%', width: 6, height: 6, borderRadius: 3 }, rayStyle]} />
          <Animated.View style={[atmosStyles.sparkle, { top: '32%', left: '55%', width: 7, height: 7, borderRadius: 3.5 }, rayStyle]} />
          <Animated.View style={[atmosStyles.sparkle, { top: '16%', left: '70%', width: 5, height: 5, borderRadius: 2.5 }, rayStyle]} />
          <Animated.View style={[atmosStyles.sparkle, { top: '40%', left: '25%', width: 6, height: 6, borderRadius: 3 }, rayStyle]} />
          {/* Golden water reflections */}
          <Animated.View style={[atmosStyles.waterGlow, { top: '50%', left: '20%', width: 120, height: 6, backgroundColor: '#FFE060', opacity: 0.30, borderRadius: 3 }, cloud1Style]} />
          <Animated.View style={[atmosStyles.waterGlow, { top: '58%', left: '45%', width: 80, height: 5, backgroundColor: '#FFD840', opacity: 0.25, borderRadius: 2.5 }, cloud2Style]} />
        </>
      )}

      {/* ═══════════ TURBULENT — dark steel, fast clouds, choppy water ═══════════ */}
      {atmo.type === 'turbulent' && (
        <>
          {/* Dark moody sky */}
          <View style={[atmosStyles.skyWash, { backgroundColor: sc, opacity: 0.65 }]} />
          {/* Dark churning water */}
          <View style={[atmosStyles.waterWash, { backgroundColor: wt, opacity: 0.50 }]} />
          {/* Heavy dark storm clouds — big, many, fast-moving */}
          <Animated.View style={[atmosStyles.cloud, { top: '0%', left: '-5%', width: 180, height: 56, backgroundColor: '#485060', opacity: 0.80, borderRadius: 28 }, cloud1Style]} />
          <Animated.View style={[atmosStyles.cloud, { top: '7%', right: '-3%', width: 160, height: 50, backgroundColor: '#404858', opacity: 0.75, borderRadius: 25 }, cloud2Style]} />
          <Animated.View style={[atmosStyles.cloud, { top: '14%', left: '20%', width: 140, height: 44, backgroundColor: '#384050', opacity: 0.65, borderRadius: 22 }, cloud3Style]} />
          <Animated.View style={[atmosStyles.cloud, { top: '3%', left: '50%', width: 120, height: 40, backgroundColor: '#3A4858', opacity: 0.60, borderRadius: 20 }, cloud1Style]} />
          <Animated.View style={[atmosStyles.cloud, { top: '20%', right: '15%', width: 100, height: 36, backgroundColor: '#445060', opacity: 0.55, borderRadius: 18 }, cloud2Style]} />
          {/* Choppy wave lines — many, thick, dark */}
          <View style={[atmosStyles.extraWave, { top: '44%', left: '0%', width: '60%', backgroundColor: '#384858', opacity: 0.45, height: 4 }]} />
          <View style={[atmosStyles.extraWave, { top: '49%', left: '30%', width: '65%', backgroundColor: '#405060', opacity: 0.40, height: 3.5 }]} />
          <View style={[atmosStyles.extraWave, { top: '54%', left: '5%', width: '55%', backgroundColor: '#384858', opacity: 0.35, height: 3 }]} />
          <View style={[atmosStyles.extraWave, { top: '59%', left: '35%', width: '50%', backgroundColor: '#405060', opacity: 0.30, height: 3 }]} />
          <View style={[atmosStyles.extraWave, { top: '64%', left: '10%', width: '60%', backgroundColor: '#384858', opacity: 0.28, height: 2.5 }]} />
          <View style={[atmosStyles.extraWave, { top: '69%', left: '25%', width: '55%', backgroundColor: '#405060', opacity: 0.25, height: 2 }]} />
          {/* Dark vignette from edges */}
          <View style={[atmosStyles.skyWash, { backgroundColor: '#202830', opacity: 0.20, height: '100%' }]} />
        </>
      )}

      {/* ═══════════ MUTED — desaturated lavender-grey, near-still, heavy fog ═══════════ */}
      {atmo.type === 'muted' && (
        <>
          {/* Flat grey-lavender sky */}
          <View style={[atmosStyles.skyWash, { backgroundColor: sc, opacity: 0.55 }]} />
          {/* Muted grey water */}
          <View style={[atmosStyles.waterWash, { backgroundColor: wt, opacity: 0.40 }]} />
          {/* Dense layered fog — barely moving, stacked across the whole scene */}
          <Animated.View style={[atmosStyles.cloud, { top: '8%', left: -40, width: '110%', height: 50, backgroundColor: '#B0A8B8', opacity: 0.55, borderRadius: 25 }, cloud1Style]} />
          <Animated.View style={[atmosStyles.cloud, { top: '18%', right: -30, width: '105%', height: 44, backgroundColor: '#A8A0B0', opacity: 0.50, borderRadius: 22 }, cloud2Style]} />
          <Animated.View style={[atmosStyles.cloud, { top: '28%', left: -20, width: '100%', height: 38, backgroundColor: '#B8B0C0', opacity: 0.45, borderRadius: 19 }, cloud3Style]} />
          <Animated.View style={[atmosStyles.cloud, { top: '38%', right: -10, width: '95%', height: 34, backgroundColor: '#A8A0B0', opacity: 0.40, borderRadius: 17 }, cloud1Style]} />
          <Animated.View style={[atmosStyles.cloud, { top: '48%', left: '0%', width: '90%', height: 30, backgroundColor: '#B0A8B8', opacity: 0.35, borderRadius: 15 }, cloud2Style]} />
          <Animated.View style={[atmosStyles.cloud, { top: '58%', right: '0%', width: '85%', height: 26, backgroundColor: '#A8A0B0', opacity: 0.30, borderRadius: 13 }, cloud3Style]} />
          {/* Overall desaturation overlay */}
          <View style={[atmosStyles.skyWash, { backgroundColor: '#9890A0', opacity: 0.20, height: '100%' }]} />
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
