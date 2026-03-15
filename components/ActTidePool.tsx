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
import { useColors } from '../constants/colors';

/*
  ActTidePool — coastal shelf / tide pool scene for Act tab.
  Kelp strands sway like grass, rocky shelf as horizon,
  lighthouse + sea stack in background, fog rolling in.
  Palette: seafoam + slate.
*/

interface ActTidePoolProps {
  actionCount: number;
  completedToday: number;
}

function useKelpConfigs(count: number) {
  return useMemo(() => {
    const configs = [];
    for (let i = 0; i < count; i++) {
      const seed = Math.sin(i * 127.31) * 10000;
      const r = seed - Math.floor(seed);
      configs.push({
        leftPct: 3 + (i / Math.max(count - 1, 1)) * 92,
        height: 18 + r * 50,
        opacity: 0.40 + r * 0.40,
        swaySpeed: 2200 + (i % 4) * 500,
        swayAmount: 4 + r * 6,
        isAnemone: r > 0.7,
      });
    }
    return configs;
  }, [count]);
}

function KelpStrand({ config, index }: {
  config: ReturnType<typeof useKelpConfigs>[0];
  index: number;
}) {
  const sway = useSharedValue(0);

  useEffect(() => {
    sway.value = withDelay(
      (index * 180) % 2400,
      withRepeat(
        withSequence(
          withTiming(1, { duration: config.swaySpeed, easing: Easing.inOut(Easing.sin) }),
          withTiming(-1, { duration: config.swaySpeed, easing: Easing.inOut(Easing.sin) }),
        ),
        -1,
      ),
    );
  }, []);

  const style = useAnimatedStyle(() => ({
    transform: [{ rotate: `${sway.value * config.swayAmount}deg` }],
  }));

  const seafoam = config.isAnemone ? '#8B5E6B' : '#4A7B6B';

  return (
    <Animated.View
      style={[
        styles.kelp,
        {
          left: `${config.leftPct}%`,
          height: config.height,
          width: config.isAnemone ? 4 : 2.5,
          backgroundColor: seafoam,
          opacity: config.opacity,
          borderTopLeftRadius: config.isAnemone ? 3 : 1,
          borderTopRightRadius: config.isAnemone ? 3 : 1,
        },
        style,
      ]}
    >
      {config.isAnemone && (
        <>
          <View style={[styles.anemoneTop, { backgroundColor: '#9B6878' }]} />
          <View style={[styles.anemoneTop2, { backgroundColor: '#A87080' }]} />
        </>
      )}
    </Animated.View>
  );
}

export function ActTidePool({ actionCount, completedToday }: ActTidePoolProps) {
  const colors = useColors();
  const slate = '#5A6872';
  const seafoam = '#6A9E8E';
  const kelpCount = Math.max(actionCount + 10, 16);
  const kelpConfigs = useKelpConfigs(kelpCount);

  // Fog drift
  const fogDrift = useSharedValue(0);
  useEffect(() => {
    fogDrift.value = withRepeat(
      withSequence(
        withTiming(12, { duration: 6000, easing: Easing.inOut(Easing.sin) }),
        withTiming(-12, { duration: 6000, easing: Easing.inOut(Easing.sin) }),
      ),
      -1,
    );
  }, []);
  const fogStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: fogDrift.value }],
  }));

  return (
    <View style={[styles.container, { backgroundColor: slate + '0C' }]}>
      {/* Sky — misty */}
      <View style={[styles.sky, { backgroundColor: slate + '08' }]} />

      {/* Fog banks */}
      <Animated.View style={[styles.fog1, { backgroundColor: '#D0D8DC', opacity: 0.35 }, fogStyle]} />
      <Animated.View style={[styles.fog2, { backgroundColor: '#C8D0D4', opacity: 0.28 }, fogStyle]} />

      {/* Sea stack — distant pillar of rock */}
      <View style={[styles.seaStack, { backgroundColor: slate, opacity: 0.50 }]} />
      <View style={[styles.seaStackTop, { backgroundColor: slate, opacity: 0.45 }]} />

      {/* Lighthouse */}
      <View style={styles.lighthouse}>
        <View style={[styles.lighthouseBody, { backgroundColor: '#D8D0C8', opacity: 0.65 }]} />
        <View style={[styles.lighthouseStripe, { backgroundColor: '#8B4040', opacity: 0.55 }]} />
        <View style={[styles.lighthouseStripe2, { backgroundColor: '#8B4040', opacity: 0.55 }]} />
        <View style={[styles.lighthouseTop, { backgroundColor: slate, opacity: 0.60 }]} />
        <View style={[styles.lighthouseLight, { backgroundColor: '#E8D88C', opacity: 0.65 }]} />
      </View>

      {/* Rocky shelf — jagged horizon */}
      <View style={[styles.shelfBase, { backgroundColor: slate, opacity: 0.50 }]} />
      <View style={[styles.shelfJag1, { backgroundColor: slate, opacity: 0.45 }]} />
      <View style={[styles.shelfJag2, { backgroundColor: slate, opacity: 0.42 }]} />
      <View style={[styles.shelfJag3, { backgroundColor: slate, opacity: 0.48 }]} />

      {/* Tide pool water */}
      <View style={[styles.poolWater, { backgroundColor: seafoam + '20' }]} />

      {/* Pool surface lines */}
      <View style={[styles.poolLine, { top: '56%', left: '20%', width: '25%', backgroundColor: seafoam + '28' }]} />
      <View style={[styles.poolLine, { top: '66%', left: '45%', width: '30%', backgroundColor: seafoam + '22' }]} />
      <View style={[styles.poolLine, { top: '78%', left: '15%', width: '35%', backgroundColor: seafoam + '18' }]} />

      {/* Small rocks in pool */}
      <View style={[styles.poolRock, { left: '8%', top: '60%', width: 14, height: 8, backgroundColor: slate, opacity: 0.30 }]} />
      <View style={[styles.poolRock, { left: '70%', top: '55%', width: 18, height: 10, backgroundColor: slate, opacity: 0.25 }]} />
      <View style={[styles.poolRock, { right: '5%', top: '72%', width: 12, height: 7, backgroundColor: slate, opacity: 0.28 }]} />

      {/* Kelp + anemones */}
      {kelpConfigs.map((cfg, i) => (
        <KelpStrand key={i} config={cfg} index={i} />
      ))}

      {/* Starfish */}
      <View style={[styles.starfish, { backgroundColor: '#B87050', opacity: 0.55 }]} />

      {/* Action dots as bubbles */}
      {actionCount > 0 && (
        <View style={styles.bubbleRow}>
          {Array.from({ length: Math.min(actionCount, 10) }).map((_, i) => (
            <View key={i} style={[styles.bubble, { borderColor: seafoam }]} />
          ))}
        </View>
      )}
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
    height: '48%',
  },
  fog1: {
    position: 'absolute',
    top: '18%',
    left: -20,
    width: '70%',
    height: 16,
    borderRadius: 8,
  },
  fog2: {
    position: 'absolute',
    top: '28%',
    right: -10,
    width: '55%',
    height: 12,
    borderRadius: 6,
  },
  seaStack: {
    position: 'absolute',
    left: '60%',
    top: '18%',
    width: 12,
    height: 34,
    borderTopLeftRadius: 3,
    borderTopRightRadius: 2,
  },
  seaStackTop: {
    position: 'absolute',
    left: '59%',
    top: '14%',
    width: 16,
    height: 12,
    borderTopLeftRadius: 8,
    borderTopRightRadius: 6,
  },
  lighthouse: {
    position: 'absolute',
    right: '18%',
    top: '10%',
  },
  lighthouseBody: {
    width: 12,
    height: 48,
    borderTopLeftRadius: 2,
    borderTopRightRadius: 2,
  },
  lighthouseStripe: {
    position: 'absolute',
    top: 12,
    width: 12,
    height: 7,
  },
  lighthouseStripe2: {
    position: 'absolute',
    top: 28,
    width: 12,
    height: 7,
  },
  lighthouseTop: {
    position: 'absolute',
    top: -8,
    left: -2,
    width: 16,
    height: 10,
    borderTopLeftRadius: 4,
    borderTopRightRadius: 4,
  },
  lighthouseLight: {
    position: 'absolute',
    top: -14,
    left: 2,
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  shelfBase: {
    position: 'absolute',
    top: '46%',
    left: 0,
    right: 0,
    height: 6,
  },
  shelfJag1: {
    position: 'absolute',
    top: '42%',
    left: '5%',
    width: 22,
    height: 14,
    borderTopLeftRadius: 4,
    borderTopRightRadius: 8,
  },
  shelfJag2: {
    position: 'absolute',
    top: '40%',
    left: '40%',
    width: 16,
    height: 18,
    borderTopLeftRadius: 6,
    borderTopRightRadius: 3,
  },
  shelfJag3: {
    position: 'absolute',
    top: '43%',
    right: '10%',
    width: 20,
    height: 12,
    borderTopLeftRadius: 5,
    borderTopRightRadius: 7,
  },
  poolWater: {
    position: 'absolute',
    top: '48%',
    left: 0,
    right: 0,
    bottom: 0,
  },
  poolLine: {
    position: 'absolute',
    height: 1,
    borderRadius: 0.5,
  },
  poolRock: {
    position: 'absolute',
    borderRadius: 5,
  },
  kelp: {
    position: 'absolute',
    bottom: '52%',
    borderRadius: 1.5,
    transformOrigin: 'bottom',
  },
  anemoneTop: {
    position: 'absolute',
    top: -3,
    left: -2,
    width: 8,
    height: 5,
    borderTopLeftRadius: 4,
    borderTopRightRadius: 4,
    opacity: 0.5,
  },
  anemoneTop2: {
    position: 'absolute',
    top: -1,
    left: -1,
    width: 6,
    height: 3,
    borderTopLeftRadius: 3,
    borderTopRightRadius: 3,
    opacity: 0.4,
  },
  starfish: {
    position: 'absolute',
    bottom: '56%',
    left: '45%',
    width: 14,
    height: 14,
    borderRadius: 7,
  },
  bubbleRow: {
    position: 'absolute',
    bottom: '52%',
    left: 24,
    right: 24,
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 6,
    transform: [{ translateY: 14 }],
  },
  bubble: {
    width: 6,
    height: 6,
    borderRadius: 3,
    borderWidth: 1,
    opacity: 0.40,
  },
});
