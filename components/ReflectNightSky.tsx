import React, { useEffect, useMemo } from 'react';
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

/*
  ReflectNightSky — starry night sky for Reflect tab.
  Constellations formed by domain symbols, twinkling stars,
  crescent moon, faint horizon glow. Calm, introspective.
*/

interface ReflectNightSkyProps {
  checkinsToday: number;
  latestFeeling: string | null;
  fullScreen?: boolean;
}

const FEELING_GLOWS: Record<string, string> = {
  rested:    '#7EB8D4',
  focused:   '#6EA8C8',
  steady:    '#7CAEC0',
  energised: '#5CA8D0',
  scattered: '#8BA4B0',
  drained:   '#94A0AA',
  flat:      '#9EAAB0',
  restless:  '#7898AA',
};

const CONSTELLATION_ICONS = [
  { symbol: '\u263D', tint: '#7B8FA1', x: '8%',  y: '22%', delay: 0 },
  { symbol: '\u223F', tint: '#6B9F78', x: '22%', y: '38%', delay: 300 },
  { symbol: '\u25CB', tint: '#C49A6C', x: '38%', y: '18%', delay: 600 },
  { symbol: '\u2727', tint: '#9B7EC8', x: '52%', y: '42%', delay: 150 },
  { symbol: '\u25A0', tint: '#5A7D8F', x: '68%', y: '25%', delay: 450 },
  { symbol: '\u2022', tint: '#4A8C6F', x: '82%', y: '35%', delay: 750 },
  { symbol: '\u2661', tint: '#C07878', x: '15%', y: '55%', delay: 200 },
  { symbol: '\u2229', tint: '#7889A0', x: '72%', y: '52%', delay: 500 },
];

function TwinklingStar({ x, y, delay, size }: { x: string; y: string; delay: number; size: number }) {
  const twinkle = useSharedValue(0.3);
  useEffect(() => {
    twinkle.value = withDelay(
      delay,
      withRepeat(
        withSequence(
          withTiming(0.8, { duration: 1800, easing: Easing.inOut(Easing.sin) }),
          withTiming(0.2, { duration: 2200, easing: Easing.inOut(Easing.sin) }),
        ),
        -1,
      ),
    );
  }, []);
  const style = useAnimatedStyle(() => ({ opacity: twinkle.value }));
  return (
    <Animated.View style={[{ position: 'absolute', left: x as any, top: y as any, width: size, height: size, borderRadius: size / 2, backgroundColor: '#E8E4DC' }, style]} />
  );
}

function ConstellationIcon({ symbol, tint, x, y, delay }: {
  symbol: string; tint: string; x: string; y: string; delay: number;
}) {
  const pulse = useSharedValue(0.5);
  useEffect(() => {
    pulse.value = withDelay(
      delay,
      withRepeat(
        withSequence(
          withTiming(1, { duration: 2800, easing: Easing.inOut(Easing.sin) }),
          withTiming(0.5, { duration: 2800, easing: Easing.inOut(Easing.sin) }),
        ),
        -1,
      ),
    );
  }, []);
  const style = useAnimatedStyle(() => ({ opacity: pulse.value }));
  return (
    <Animated.View style={[{ position: 'absolute', left: x as any, top: y as any, zIndex: 2 }, style]}>
      <TempoText variant="body" style={{ fontSize: 24, color: tint }}>{symbol}</TempoText>
    </Animated.View>
  );
}

export function ReflectNightSky({ checkinsToday, latestFeeling, fullScreen }: ReflectNightSkyProps) {
  const colors = useColors();
  const glow = (latestFeeling && FEELING_GLOWS[latestFeeling]) || '#7EB8D4';

  return (
    <View style={[styles.container, fullScreen && styles.containerFull, { backgroundColor: '#1A2030' + '30' }]}>
      {/* Deep sky */}
      <View style={[styles.deepSky, { backgroundColor: '#1A2030' + '15' }]} />

      {/* Horizon glow */}
      <View style={[styles.horizonGlow, { backgroundColor: glow + '15' }]} />

      {/* Crescent moon */}
      <View style={styles.moon}>
        <View style={[styles.moonBody, { backgroundColor: '#E8E0D0', opacity: 0.60 }]} />
        <View style={[styles.moonShadow, { backgroundColor: '#1A2030' + '80' }]} />
      </View>

      {/* Stars — various sizes and twinkle rates */}
      {[
        { x: '5%', y: '8%', d: 0, s: 2 },
        { x: '15%', y: '12%', d: 200, s: 1.5 },
        { x: '30%', y: '5%', d: 500, s: 2.5 },
        { x: '45%', y: '10%', d: 100, s: 2 },
        { x: '60%', y: '6%', d: 400, s: 1.5 },
        { x: '75%', y: '15%', d: 700, s: 2 },
        { x: '88%', y: '8%', d: 300, s: 2.5 },
        { x: '92%', y: '20%', d: 600, s: 1.5 },
        { x: '25%', y: '28%', d: 800, s: 1.5 },
        { x: '48%', y: '30%', d: 350, s: 2 },
        { x: '78%', y: '45%', d: 550, s: 1.5 },
        { x: '10%', y: '42%', d: 250, s: 2 },
        { x: '58%', y: '15%', d: 650, s: 2 },
        { x: '35%', y: '48%', d: 150, s: 1.5 },
        { x: '90%', y: '38%', d: 450, s: 2 },
      ].map((s, i) => (
        <TwinklingStar key={i} x={s.x} y={s.y} delay={s.d} size={s.s} />
      ))}

      {/* Constellation links — faint lines between domain symbols */}
      <View style={[styles.constLine, { top: '28%', left: '12%', width: '16%', backgroundColor: '#E8E4DC', opacity: 0.08, transform: [{ rotate: '20deg' }] }]} />
      <View style={[styles.constLine, { top: '24%', left: '28%', width: '18%', backgroundColor: '#E8E4DC', opacity: 0.06, transform: [{ rotate: '-12deg' }] }]} />
      <View style={[styles.constLine, { top: '32%', left: '55%', width: '20%', backgroundColor: '#E8E4DC', opacity: 0.07, transform: [{ rotate: '8deg' }] }]} />

      {/* Domain symbols as constellations */}
      {CONSTELLATION_ICONS.map((icon) => (
        <ConstellationIcon
          key={icon.symbol}
          symbol={icon.symbol}
          tint={icon.tint}
          x={icon.x}
          y={icon.y}
          delay={icon.delay}
        />
      ))}

      {/* Distant mountains silhouette */}
      <View style={[styles.mountain1, { backgroundColor: '#2A3040', opacity: 0.50 }]} />
      <View style={[styles.mountain2, { backgroundColor: '#252D3C', opacity: 0.45 }]} />

      {/* Check-in count */}
      <View style={styles.countRow}>
        <TempoText variant="data" color={glow + 'AA'} style={styles.countText}>
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
  deepSky: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  horizonGlow: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: '30%',
  },
  moon: {
    position: 'absolute',
    top: '10%',
    right: '15%',
  },
  moonBody: {
    width: 28,
    height: 28,
    borderRadius: 14,
  },
  moonShadow: {
    position: 'absolute',
    top: -2,
    left: 8,
    width: 26,
    height: 26,
    borderRadius: 13,
  },
  constLine: {
    position: 'absolute',
    height: 1,
    borderRadius: 0.5,
  },
  mountain1: {
    position: 'absolute',
    bottom: 0,
    left: '5%',
    width: '40%',
    height: '18%',
    borderTopLeftRadius: 30,
    borderTopRightRadius: 20,
  },
  mountain2: {
    position: 'absolute',
    bottom: 0,
    right: '2%',
    width: '35%',
    height: '14%',
    borderTopLeftRadius: 25,
    borderTopRightRadius: 35,
  },
  countRow: {
    position: 'absolute',
    bottom: 8,
    right: 12,
  },
  countText: {
    fontSize: 11,
    letterSpacing: 0.5,
  },
});
