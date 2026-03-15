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

/*
  ReflectHarbor — calm harbor scene with dock, moored boats,
  and distant hills. Warm palette. Domain symbols as buoy markers.
*/

interface ReflectHarborProps {
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

const BUOY_ICONS = [
  { symbol: '\u263D', tint: '#7B8FA1', x: '12%', y: '50%', delay: 0 },
  { symbol: '\u223F', tint: '#6B9F78', x: '28%', y: '54%', delay: 300 },
  { symbol: '\u25CB', tint: '#C49A6C', x: '44%', y: '48%', delay: 600 },
  { symbol: '\u2727', tint: '#9B7EC8', x: '60%', y: '56%', delay: 150 },
  { symbol: '\u25A0', tint: '#5A7D8F', x: '72%', y: '50%', delay: 450 },
  { symbol: '\u2022', tint: '#4A8C6F', x: '85%', y: '54%', delay: 750 },
  { symbol: '\u2661', tint: '#C07878', x: '20%', y: '62%', delay: 200 },
  { symbol: '\u2229', tint: '#7889A0', x: '55%', y: '64%', delay: 500 },
];

function BuoyIcon({ symbol, tint, x, y, delay }: {
  symbol: string; tint: string; x: string; y: string; delay: number;
}) {
  const bob = useSharedValue(0);
  useEffect(() => {
    bob.value = withDelay(
      delay,
      withRepeat(
        withSequence(
          withTiming(-3, { duration: 1800, easing: Easing.inOut(Easing.sin) }),
          withTiming(3, { duration: 1800, easing: Easing.inOut(Easing.sin) }),
        ),
        -1,
      ),
    );
  }, []);
  const style = useAnimatedStyle(() => ({
    transform: [{ translateY: bob.value }],
  }));
  return (
    <Animated.View style={[{ position: 'absolute', left: x as any, top: y as any }, style]}>
      <TempoText variant="body" style={{ fontSize: 24, color: tint }}>{symbol}</TempoText>
    </Animated.View>
  );
}

export function ReflectHarbor({ checkinsToday, latestFeeling }: ReflectHarborProps) {
  const colors = useColors();
  const waterColor = (latestFeeling && FEELING_TINTS[latestFeeling]) || '#7EB8D4';

  return (
    <View style={[styles.container, { backgroundColor: waterColor + '0A' }]}>
      {/* Sky */}
      <View style={[styles.sky, { backgroundColor: waterColor + '08' }]} />

      {/* Distant hills */}
      <View style={[styles.hill1, { backgroundColor: colors.ink3, opacity: 0.22 }]} />
      <View style={[styles.hill2, { backgroundColor: colors.ink3, opacity: 0.18 }]} />

      {/* Water */}
      <View style={[styles.water, { backgroundColor: waterColor + '20' }]} />

      {/* Dock */}
      <View style={[styles.dockPlatform, { backgroundColor: '#8B7E70', opacity: 0.55 }]} />
      {[0, 1, 2, 3].map((i) => (
        <View
          key={i}
          style={[
            styles.dockPile,
            { left: 8 + i * 22, backgroundColor: '#6B6058', opacity: 0.50 },
          ]}
        />
      ))}

      {/* Moored boat */}
      <View style={styles.boat}>
        <View style={[styles.boatHull, { backgroundColor: colors.ink3, opacity: 0.50 }]} />
        <View style={[styles.boatMast, { backgroundColor: colors.ink3, opacity: 0.45 }]} />
        <View style={[styles.boatCabin, { backgroundColor: '#A0948A', opacity: 0.45 }]} />
      </View>

      {/* Second smaller boat */}
      <View style={styles.boat2}>
        <View style={[styles.boat2Hull, { backgroundColor: colors.ink3, opacity: 0.40 }]} />
        <View style={[styles.boat2Mast, { backgroundColor: colors.ink3, opacity: 0.35 }]} />
      </View>

      {/* Wave lines */}
      <View style={[styles.waveLine, { top: '55%', left: '25%', width: '30%', backgroundColor: waterColor + '30' }]} />
      <View style={[styles.waveLine, { top: '65%', left: '40%', width: '25%', backgroundColor: waterColor + '25' }]} />
      <View style={[styles.waveLine, { top: '75%', left: '15%', width: '35%', backgroundColor: waterColor + '20' }]} />

      {/* Buoy markers — domain symbols */}
      {BUOY_ICONS.map((icon) => (
        <BuoyIcon key={icon.symbol} {...icon} />
      ))}

      {/* Check-in count */}
      <View style={styles.countRow}>
        <TempoText variant="data" color={waterColor} style={{ fontSize: 13, letterSpacing: 1 }}>
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
    top: 0, left: 0, right: 0,
    height: '42%',
  },
  hill1: {
    position: 'absolute',
    top: '25%', left: '5%',
    width: '40%', height: '18%',
    borderTopLeftRadius: 50, borderTopRightRadius: 35,
  },
  hill2: {
    position: 'absolute',
    top: '30%', right: '8%',
    width: '35%', height: '14%',
    borderTopLeftRadius: 30, borderTopRightRadius: 45,
  },
  water: {
    position: 'absolute',
    top: '42%', left: 0, right: 0, bottom: 0,
  },
  dockPlatform: {
    position: 'absolute',
    left: 0, top: '44%',
    width: 100, height: 5,
    borderTopRightRadius: 2, borderBottomRightRadius: 2,
  },
  dockPile: {
    position: 'absolute',
    top: '44%',
    width: 3, height: 20,
    borderRadius: 1,
  },
  boat: {
    position: 'absolute',
    left: '25%', top: '38%',
  },
  boatHull: {
    width: 36, height: 10,
    borderRadius: 5,
    borderBottomLeftRadius: 12, borderBottomRightRadius: 12,
  },
  boatMast: {
    position: 'absolute',
    left: 16, top: -22,
    width: 2, height: 22,
    borderRadius: 1,
  },
  boatCabin: {
    position: 'absolute',
    left: 10, top: -8,
    width: 14, height: 8,
    borderTopLeftRadius: 3, borderTopRightRadius: 3,
  },
  boat2: {
    position: 'absolute',
    right: '15%', top: '42%',
  },
  boat2Hull: {
    width: 24, height: 7,
    borderRadius: 4,
    borderBottomLeftRadius: 8, borderBottomRightRadius: 8,
  },
  boat2Mast: {
    position: 'absolute',
    left: 10, top: -16,
    width: 1.5, height: 16,
    borderRadius: 0.75,
  },
  waveLine: {
    position: 'absolute',
    height: 1, borderRadius: 0.5,
  },
  countRow: {
    position: 'absolute',
    bottom: 12, right: 16,
  },
});
