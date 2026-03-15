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
import { spacing } from '../constants/spacing';

/*
  ActField — a green field landscape with:
  - Distant barn and fence line on the horizon
  - Many swaying grass stalks in the foreground
  - Action dots at the base
  - Conveys: GO. DO. LIVE.
*/

interface ActFieldProps {
  actionCount: number;
  completedToday: number;
  fullScreen?: boolean;
}

// Pre-generate stable blade configs so they don't change on re-render
function useBladeConfigs(count: number) {
  return useMemo(() => {
    const configs = [];
    for (let i = 0; i < count; i++) {
      const seed = Math.sin(i * 137.508) * 10000;
      const rand = seed - Math.floor(seed);
      configs.push({
        leftPct: 3 + (i / Math.max(count - 1, 1)) * 94,
        height: 20 + rand * 45,
        opacity: 0.35 + rand * 0.55,
        swaySpeed: 1600 + (i % 5) * 400,
        swayAmount: 3 + rand * 5,
      });
    }
    return configs;
  }, [count]);
}

function GrassBlade({ config, index }: {
  config: { leftPct: number; height: number; opacity: number; swaySpeed: number; swayAmount: number };
  index: number;
}) {
  const sway = useSharedValue(0);

  useEffect(() => {
    sway.value = withDelay(
      (index * 150) % 2000,
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

  return (
    <Animated.View
      style={[
        styles.blade,
        {
          left: `${config.leftPct}%`,
          height: config.height,
          opacity: config.opacity,
        },
        style,
      ]}
    />
  );
}

export function ActField({ actionCount, completedToday, fullScreen }: ActFieldProps) {
  const colors = useColors();
  const fieldGreen = '#4A8C5C';
  const barnColor = colors.ink3;

  // More grass blades — at least 18 ambient + action blades
  const bladeCount = Math.max(actionCount + 12, 18);
  const bladeConfigs = useBladeConfigs(bladeCount);

  return (
    <View style={[styles.container, fullScreen && styles.containerFull, { backgroundColor: fieldGreen + '18' }]}>
      {/* Sky */}
      <View style={[styles.sky, { backgroundColor: '#D8F0E0' + '30' }]} />

      {/* Sun */}
      <View style={styles.sun}>
        <View style={[styles.sunBody, { backgroundColor: '#F0C840', opacity: 0.75 }]} />
        <View style={[styles.sunGlow, { backgroundColor: '#F0C840', opacity: 0.30 }]} />
      </View>

      {/* Clouds */}
      <View style={styles.cloud1}>
        <View style={[styles.cloudPuff, { width: 60, height: 24, backgroundColor: '#fff', opacity: 0.70 }]} />
        <View style={[styles.cloudPuff, { width: 40, height: 18, left: 42, top: -4, backgroundColor: '#fff', opacity: 0.60 }]} />
        <View style={[styles.cloudPuff, { width: 30, height: 16, left: -12, top: 2, backgroundColor: '#fff', opacity: 0.55 }]} />
      </View>
      <View style={styles.cloud2}>
        <View style={[styles.cloudPuff, { width: 50, height: 20, backgroundColor: '#fff', opacity: 0.65 }]} />
        <View style={[styles.cloudPuff, { width: 34, height: 16, left: 36, top: -3, backgroundColor: '#fff', opacity: 0.55 }]} />
      </View>
      <View style={styles.cloud3}>
        <View style={[styles.cloudPuff, { width: 44, height: 18, backgroundColor: '#fff', opacity: 0.60 }]} />
        <View style={[styles.cloudPuff, { width: 28, height: 14, left: 30, top: -2, backgroundColor: '#fff', opacity: 0.50 }]} />
      </View>

      {/* Distant hills */}
      <View style={[styles.distantHill1, { backgroundColor: fieldGreen + '50' }]} />
      <View style={[styles.distantHill2, { backgroundColor: fieldGreen + '40' }]} />

      {/* Horizon line */}
      <View style={[styles.horizonLine, { backgroundColor: fieldGreen + '70' }]} />

      {/* ── Distance elements ── */}

      {/* Barn — simple geometric shapes */}
      <View style={styles.barnGroup}>
        {/* Barn body */}
        <View style={[styles.barnBody, { backgroundColor: barnColor, opacity: 0.72 }]} />
        {/* Barn roof — triangle approximated */}
        <View style={[styles.barnRoof, {
          borderBottomColor: barnColor,
          borderLeftColor: 'transparent',
          borderRightColor: 'transparent',
          opacity: 0.72,
        }]} />
        {/* Barn door */}
        <View style={[styles.barnDoor, { backgroundColor: fieldGreen + '55' }]} />
        {/* Silo next to barn */}
        <View style={[styles.silo, { backgroundColor: barnColor, opacity: 0.65 }]} />
        <View style={[styles.siloTop, { backgroundColor: barnColor, opacity: 0.65, borderRadius: 4 }]} />
      </View>

      {/* Fence posts — thin verticals along the horizon */}
      <View style={styles.fenceRow}>
        {Array.from({ length: 7 }).map((_, i) => (
          <View key={i} style={styles.fenceUnit}>
            <View style={[styles.fencePost, { backgroundColor: barnColor, opacity: 0.65 }]} />
            {i < 6 && (
              <>
                <View style={[styles.fenceRail, styles.fenceRailTop, { backgroundColor: barnColor, opacity: 0.55 }]} />
                <View style={[styles.fenceRail, styles.fenceRailBot, { backgroundColor: barnColor, opacity: 0.55 }]} />
              </>
            )}
          </View>
        ))}
      </View>

      {/* Ground */}
      <View style={[styles.ground, { backgroundColor: fieldGreen + '30' }]} />

      {/* ── Small animals in foreground ── */}
      {/* Bird on fence */}
      <View style={styles.bird1}>
        <View style={[styles.birdBody, { backgroundColor: barnColor, opacity: 0.70 }]} />
        <View style={[styles.birdHead, { backgroundColor: barnColor, opacity: 0.70 }]} />
        <View style={[styles.birdBeak, { backgroundColor: '#D4A050', opacity: 0.75 }]} />
      </View>
      {/* Rabbit in grass — right side */}
      <View style={styles.rabbit}>
        <View style={[styles.rabbitBody, { backgroundColor: barnColor, opacity: 0.65 }]} />
        <View style={[styles.rabbitHead, { backgroundColor: barnColor, opacity: 0.65 }]} />
        <View style={[styles.rabbitEar, styles.rabbitEarL, { backgroundColor: barnColor, opacity: 0.65 }]} />
        <View style={[styles.rabbitEar, styles.rabbitEarR, { backgroundColor: barnColor, opacity: 0.65 }]} />
      </View>
      {/* Second bird — flying in sky */}
      <View style={styles.bird2}>
        <View style={[styles.birdWingL, { backgroundColor: barnColor, opacity: 0.60 }]} />
        <View style={[styles.birdWingR, { backgroundColor: barnColor, opacity: 0.60 }]} />
      </View>

      {/* Grass blades — many, swaying */}
      {bladeConfigs.map((cfg, i) => (
        <GrassBlade key={i} config={cfg} index={i} />
      ))}

      {/* Action dots */}
      {actionCount > 0 && (
        <View style={styles.dotRow}>
          {Array.from({ length: Math.min(actionCount, 10) }).map((_, i) => (
            <View key={i} style={[styles.actionDot, { backgroundColor: fieldGreen }]} />
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
  containerFull: {
    height: '100%',
    borderRadius: 0,
  },
  sky: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: '70%',
  },

  // Sun
  sun: {
    position: 'absolute',
    top: '6%',
    right: '12%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  sunBody: {
    width: 40,
    height: 40,
    borderRadius: 20,
  },
  sunGlow: {
    position: 'absolute',
    width: 68,
    height: 68,
    borderRadius: 34,
  },

  // Clouds
  cloud1: {
    position: 'absolute',
    top: '10%',
    left: '12%',
    flexDirection: 'row',
  },
  cloud2: {
    position: 'absolute',
    top: '6%',
    right: '30%',
    flexDirection: 'row',
  },
  cloud3: {
    position: 'absolute',
    top: '20%',
    left: '50%',
    flexDirection: 'row',
  },
  cloudPuff: {
    borderRadius: 20,
    position: 'absolute',
  },

  // Distant hills
  distantHill1: {
    position: 'absolute',
    bottom: '28%',
    left: '10%',
    width: '35%',
    height: '18%',
    borderTopLeftRadius: 60,
    borderTopRightRadius: 40,
  },
  distantHill2: {
    position: 'absolute',
    bottom: '24%',
    right: '5%',
    width: '30%',
    height: '14%',
    borderTopLeftRadius: 40,
    borderTopRightRadius: 50,
  },

  horizonLine: {
    position: 'absolute',
    bottom: '30%',
    left: 0,
    right: 0,
    height: 1,
  },

  // Barn
  barnGroup: {
    position: 'absolute',
    bottom: '30%',
    right: '18%',
  },
  barnBody: {
    width: 32,
    height: 22,
    borderRadius: 1,
  },
  barnRoof: {
    position: 'absolute',
    top: -12,
    left: -4,
    width: 0,
    height: 0,
    borderLeftWidth: 20,
    borderRightWidth: 20,
    borderBottomWidth: 12,
  },
  barnDoor: {
    position: 'absolute',
    bottom: 0,
    left: 11,
    width: 9,
    height: 12,
    borderTopLeftRadius: 4,
    borderTopRightRadius: 4,
  },
  silo: {
    position: 'absolute',
    left: 35,
    bottom: 0,
    width: 12,
    height: 28,
    borderRadius: 1,
  },
  siloTop: {
    position: 'absolute',
    left: 33,
    top: -8,
    width: 16,
    height: 8,
  },

  // Fence
  fenceRow: {
    position: 'absolute',
    bottom: '22%',
    left: '5%',
    right: '50%',
    flexDirection: 'row',
    alignItems: 'flex-end',
  },
  fenceUnit: {
    flex: 1,
    alignItems: 'flex-start',
    position: 'relative',
  },
  fencePost: {
    width: 2.5,
    height: 18,
    borderRadius: 1,
  },
  fenceRail: {
    position: 'absolute',
    left: 2.5,
    right: 0,
    height: 1.5,
  },
  fenceRailTop: {
    top: 3,
  },
  fenceRailBot: {
    top: 10,
  },

  ground: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: '30%',
  },
  blade: {
    position: 'absolute',
    bottom: 0,
    width: 3,
    borderRadius: 1,
    backgroundColor: '#4A8C5C',
    transformOrigin: 'bottom',
  },
  dotRow: {
    position: 'absolute',
    bottom: 4,
    left: spacing.xl,
    right: spacing.xl,
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 5,
  },
  actionDot: {
    width: 5,
    height: 5,
    borderRadius: 2.5,
    opacity: 0.5,
  },


  // ── Animals ──
  // Bird perched on fence
  bird1: {
    position: 'absolute',
    bottom: '28%',
    left: '18%',
  },
  birdBody: {
    width: 12,
    height: 8,
    borderRadius: 4,
  },
  birdHead: {
    position: 'absolute',
    top: -4,
    right: -3,
    width: 7,
    height: 7,
    borderRadius: 3.5,
  },
  birdBeak: {
    position: 'absolute',
    top: -3,
    right: -7,
    width: 6,
    height: 3,
    borderRadius: 1.5,
  },

  // Rabbit
  rabbit: {
    position: 'absolute',
    bottom: '4%',
    right: '25%',
  },
  rabbitBody: {
    width: 15,
    height: 10,
    borderRadius: 5,
  },
  rabbitHead: {
    position: 'absolute',
    top: -3,
    right: -5,
    width: 9,
    height: 9,
    borderRadius: 4.5,
  },
  rabbitEar: {
    position: 'absolute',
    width: 3,
    height: 9,
    borderRadius: 1.5,
  },
  rabbitEarL: {
    top: -7,
    right: -2,
    transform: [{ rotate: '-10deg' }],
  },
  rabbitEarR: {
    top: -7,
    right: -5,
    transform: [{ rotate: '10deg' }],
  },

  // Flying bird
  bird2: {
    position: 'absolute',
    top: '14%',
    right: '30%',
  },
  birdWingL: {
    width: 14,
    height: 3,
    borderRadius: 1.5,
    transform: [{ rotate: '-25deg' }],
  },
  birdWingR: {
    width: 14,
    height: 3,
    borderRadius: 1.5,
    marginTop: -1,
    marginLeft: 3,
    transform: [{ rotate: '25deg' }],
  },
});
