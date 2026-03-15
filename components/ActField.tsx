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

export function ActField({ actionCount, completedToday }: ActFieldProps) {
  const colors = useColors();
  const fieldGreen = '#4A8C5C';
  const barnColor = colors.ink3;

  // More grass blades — at least 18 ambient + action blades
  const bladeCount = Math.max(actionCount + 12, 18);
  const bladeConfigs = useBladeConfigs(bladeCount);

  return (
    <View style={[styles.container, { backgroundColor: fieldGreen + '08' }]}>
      {/* Sky */}
      <View style={[styles.sky, { backgroundColor: fieldGreen + '04' }]} />

      {/* Clouds */}
      <View style={styles.cloud1}>
        <View style={[styles.cloudPuff, { width: 28, height: 12, backgroundColor: '#fff', opacity: 0.25 }]} />
        <View style={[styles.cloudPuff, { width: 18, height: 10, left: 20, top: -3, backgroundColor: '#fff', opacity: 0.20 }]} />
        <View style={[styles.cloudPuff, { width: 14, height: 8, left: -6, top: 1, backgroundColor: '#fff', opacity: 0.18 }]} />
      </View>
      <View style={styles.cloud2}>
        <View style={[styles.cloudPuff, { width: 22, height: 10, backgroundColor: '#fff', opacity: 0.22 }]} />
        <View style={[styles.cloudPuff, { width: 16, height: 8, left: 16, top: -2, backgroundColor: '#fff', opacity: 0.18 }]} />
      </View>
      <View style={styles.cloud3}>
        <View style={[styles.cloudPuff, { width: 18, height: 8, backgroundColor: '#fff', opacity: 0.18 }]} />
        <View style={[styles.cloudPuff, { width: 12, height: 7, left: 12, top: -1, backgroundColor: '#fff', opacity: 0.15 }]} />
      </View>

      {/* Distant hills */}
      <View style={[styles.distantHill1, { backgroundColor: fieldGreen + '18' }]} />
      <View style={[styles.distantHill2, { backgroundColor: fieldGreen + '12' }]} />

      {/* Horizon line */}
      <View style={[styles.horizonLine, { backgroundColor: fieldGreen + '30' }]} />

      {/* ── Distance elements ── */}

      {/* Barn — simple geometric shapes */}
      <View style={styles.barnGroup}>
        {/* Barn body */}
        <View style={[styles.barnBody, { backgroundColor: barnColor, opacity: 0.35 }]} />
        {/* Barn roof — triangle approximated */}
        <View style={[styles.barnRoof, {
          borderBottomColor: barnColor,
          borderLeftColor: 'transparent',
          borderRightColor: 'transparent',
          opacity: 0.35,
        }]} />
        {/* Barn door */}
        <View style={[styles.barnDoor, { backgroundColor: fieldGreen + '20' }]} />
        {/* Silo next to barn */}
        <View style={[styles.silo, { backgroundColor: barnColor, opacity: 0.30 }]} />
        <View style={[styles.siloTop, { backgroundColor: barnColor, opacity: 0.30, borderRadius: 4 }]} />
      </View>

      {/* Fence posts — thin verticals along the horizon */}
      <View style={styles.fenceRow}>
        {Array.from({ length: 7 }).map((_, i) => (
          <View key={i} style={styles.fenceUnit}>
            <View style={[styles.fencePost, { backgroundColor: barnColor, opacity: 0.30 }]} />
            {i < 6 && (
              <>
                <View style={[styles.fenceRail, styles.fenceRailTop, { backgroundColor: barnColor, opacity: 0.22 }]} />
                <View style={[styles.fenceRail, styles.fenceRailBot, { backgroundColor: barnColor, opacity: 0.22 }]} />
              </>
            )}
          </View>
        ))}
      </View>

      {/* Ground */}
      <View style={[styles.ground, { backgroundColor: fieldGreen + '10' }]} />

      {/* ── Small animals in foreground ── */}
      {/* Bird on fence */}
      <View style={styles.bird1}>
        <View style={[styles.birdBody, { backgroundColor: barnColor, opacity: 0.35 }]} />
        <View style={[styles.birdHead, { backgroundColor: barnColor, opacity: 0.35 }]} />
        <View style={[styles.birdBeak, { backgroundColor: '#C49A6C', opacity: 0.40 }]} />
      </View>
      {/* Rabbit in grass — right side */}
      <View style={styles.rabbit}>
        <View style={[styles.rabbitBody, { backgroundColor: barnColor, opacity: 0.28 }]} />
        <View style={[styles.rabbitHead, { backgroundColor: barnColor, opacity: 0.28 }]} />
        <View style={[styles.rabbitEar, styles.rabbitEarL, { backgroundColor: barnColor, opacity: 0.28 }]} />
        <View style={[styles.rabbitEar, styles.rabbitEarR, { backgroundColor: barnColor, opacity: 0.28 }]} />
      </View>
      {/* Second bird — flying in sky */}
      <View style={styles.bird2}>
        <View style={[styles.birdWingL, { backgroundColor: barnColor, opacity: 0.20 }]} />
        <View style={[styles.birdWingR, { backgroundColor: barnColor, opacity: 0.20 }]} />
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

const HORIZON = '58%';

const styles = StyleSheet.create({
  container: {
    height: 240,
    overflow: 'hidden',
    position: 'relative',
    borderRadius: 16,
  },
  sky: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: HORIZON,
  },

  // Clouds
  cloud1: {
    position: 'absolute',
    top: '12%',
    left: '15%',
    flexDirection: 'row',
  },
  cloud2: {
    position: 'absolute',
    top: '8%',
    right: '20%',
    flexDirection: 'row',
  },
  cloud3: {
    position: 'absolute',
    top: '22%',
    left: '55%',
    flexDirection: 'row',
  },
  cloudPuff: {
    borderRadius: 20,
    position: 'absolute',
  },

  // Distant hills
  distantHill1: {
    position: 'absolute',
    top: '42%',
    left: '10%',
    width: '35%',
    height: '18%',
    borderTopLeftRadius: 60,
    borderTopRightRadius: 40,
  },
  distantHill2: {
    position: 'absolute',
    top: '46%',
    right: '5%',
    width: '30%',
    height: '14%',
    borderTopLeftRadius: 40,
    borderTopRightRadius: 50,
  },

  horizonLine: {
    position: 'absolute',
    top: HORIZON,
    left: 0,
    right: 0,
    height: 1,
  },

  // Barn
  barnGroup: {
    position: 'absolute',
    top: '38%',
    right: '18%',
  },
  barnBody: {
    width: 22,
    height: 16,
    borderRadius: 1,
  },
  barnRoof: {
    position: 'absolute',
    top: -8,
    left: -3,
    width: 0,
    height: 0,
    borderLeftWidth: 14,
    borderRightWidth: 14,
    borderBottomWidth: 8,
  },
  barnDoor: {
    position: 'absolute',
    bottom: 0,
    left: 8,
    width: 6,
    height: 8,
    borderTopLeftRadius: 3,
    borderTopRightRadius: 3,
  },
  silo: {
    position: 'absolute',
    left: 24,
    bottom: 0,
    width: 8,
    height: 20,
    borderRadius: 1,
  },
  siloTop: {
    position: 'absolute',
    left: 23,
    top: -6,
    width: 10,
    height: 6,
  },

  // Fence
  fenceRow: {
    position: 'absolute',
    top: '52%',
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
    width: 1.5,
    height: 12,
    borderRadius: 0.5,
  },
  fenceRail: {
    position: 'absolute',
    left: 1.5,
    right: 0,
    height: 1,
  },
  fenceRailTop: {
    top: 2,
  },
  fenceRailBot: {
    top: 7,
  },

  ground: {
    position: 'absolute',
    top: HORIZON,
    left: 0,
    right: 0,
    bottom: 0,
  },
  blade: {
    position: 'absolute',
    bottom: '42%',
    width: 2,
    borderRadius: 1,
    backgroundColor: '#4A8C5C',
    transformOrigin: 'bottom',
  },
  dotRow: {
    position: 'absolute',
    bottom: '42%',
    left: spacing.xl,
    right: spacing.xl,
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 5,
    transform: [{ translateY: 12 }],
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
    top: '46%',
    left: '18%',
  },
  birdBody: {
    width: 8,
    height: 5,
    borderRadius: 3,
  },
  birdHead: {
    position: 'absolute',
    top: -3,
    right: -2,
    width: 5,
    height: 5,
    borderRadius: 2.5,
  },
  birdBeak: {
    position: 'absolute',
    top: -2,
    right: -5,
    width: 4,
    height: 2,
    borderRadius: 1,
  },

  // Rabbit
  rabbit: {
    position: 'absolute',
    bottom: '44%',
    right: '25%',
  },
  rabbitBody: {
    width: 10,
    height: 7,
    borderRadius: 4,
  },
  rabbitHead: {
    position: 'absolute',
    top: -2,
    right: -4,
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  rabbitEar: {
    position: 'absolute',
    width: 2,
    height: 6,
    borderRadius: 1,
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
    width: 8,
    height: 2,
    borderRadius: 1,
    transform: [{ rotate: '-25deg' }],
  },
  birdWingR: {
    width: 8,
    height: 2,
    borderRadius: 1,
    marginTop: -1,
    marginLeft: 2,
    transform: [{ rotate: '25deg' }],
  },
});
