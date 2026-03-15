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

      {/* Distant hills */}
      <View style={[styles.distantHill1, { backgroundColor: fieldGreen + '0C' }]} />
      <View style={[styles.distantHill2, { backgroundColor: fieldGreen + '08' }]} />

      {/* Horizon line */}
      <View style={[styles.horizonLine, { backgroundColor: fieldGreen + '18' }]} />

      {/* ── Distance elements ── */}

      {/* Barn — simple geometric shapes */}
      <View style={styles.barnGroup}>
        {/* Barn body */}
        <View style={[styles.barnBody, { backgroundColor: barnColor, opacity: 0.15 }]} />
        {/* Barn roof — triangle approximated */}
        <View style={[styles.barnRoof, {
          borderBottomColor: barnColor,
          borderLeftColor: 'transparent',
          borderRightColor: 'transparent',
          opacity: 0.15,
        }]} />
        {/* Barn door */}
        <View style={[styles.barnDoor, { backgroundColor: fieldGreen + '10' }]} />
        {/* Silo next to barn */}
        <View style={[styles.silo, { backgroundColor: barnColor, opacity: 0.12 }]} />
        <View style={[styles.siloTop, { backgroundColor: barnColor, opacity: 0.12, borderRadius: 4 }]} />
      </View>

      {/* Fence posts — thin verticals along the horizon */}
      <View style={styles.fenceRow}>
        {Array.from({ length: 7 }).map((_, i) => (
          <View key={i} style={styles.fenceUnit}>
            <View style={[styles.fencePost, { backgroundColor: barnColor, opacity: 0.12 }]} />
            {i < 6 && (
              <>
                <View style={[styles.fenceRail, styles.fenceRailTop, { backgroundColor: barnColor, opacity: 0.08 }]} />
                <View style={[styles.fenceRail, styles.fenceRailBot, { backgroundColor: barnColor, opacity: 0.08 }]} />
              </>
            )}
          </View>
        ))}
      </View>

      {/* Ground */}
      <View style={[styles.ground, { backgroundColor: fieldGreen + '0C' }]} />

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

      {/* Status */}
      <View style={styles.statusRow}>
        {actionCount === 0 ? (
          <TempoText variant="caption" color={fieldGreen} style={styles.statusText}>
            All clear
          </TempoText>
        ) : (
          <TempoText variant="data" color={fieldGreen} style={styles.statusText}>
            {actionCount} waiting
          </TempoText>
        )}
        {completedToday > 0 && (
          <TempoText variant="caption" color={fieldGreen + '88'} style={styles.statusText}>
            {completedToday} done today
          </TempoText>
        )}
      </View>
    </View>
  );
}

const HORIZON = '48%';

const styles = StyleSheet.create({
  container: {
    height: 200,
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

  // Distant hills
  distantHill1: {
    position: 'absolute',
    top: '32%',
    left: '10%',
    width: '35%',
    height: '18%',
    borderTopLeftRadius: 60,
    borderTopRightRadius: 40,
  },
  distantHill2: {
    position: 'absolute',
    top: '36%',
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
    top: '28%',
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
    top: '42%',
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
    bottom: '52%',
    width: 2,
    borderRadius: 1,
    backgroundColor: '#4A8C5C',
    transformOrigin: 'bottom',
  },
  dotRow: {
    position: 'absolute',
    bottom: '52%',
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
  statusRow: {
    position: 'absolute',
    bottom: spacing.base,
    left: spacing.base,
    right: spacing.base,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  statusText: {
    fontSize: 12,
    letterSpacing: 0.5,
  },
});
