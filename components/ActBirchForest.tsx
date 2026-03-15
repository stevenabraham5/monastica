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
  ActBirchForest — bare birch trunks in winter.
  Trunk heights serve as data columns. Snow ground, frozen lake,
  low cabin in background. Subtle drift, cool palette.
  Very still compared to the prairie.
*/

interface ActBirchForestProps {
  actionCount: number;
  completedToday: number;
  fullScreen?: boolean;
}

function useTrunkConfigs(count: number) {
  return useMemo(() => {
    const trunks = [];
    const total = Math.max(count + 8, 14);
    for (let i = 0; i < total; i++) {
      const seed = Math.sin(i * 83.71 + 5) * 10000;
      const r = seed - Math.floor(seed);
      trunks.push({
        leftPct: 3 + (i / Math.max(total - 1, 1)) * 93,
        height: 35 + r * 65 + (i < count ? 20 : 0),
        width: 3 + r * 3,
        opacity: 0.35 + r * 0.35,
        driftSpeed: 5000 + (i % 3) * 1500,
        driftAmount: 0.8 + r * 1.2,
        // Birch bark markings — dark horizontal dashes
        markCount: 2 + Math.floor(r * 4),
      });
    }
    return trunks;
  }, [count]);
}

function BirchTrunk({ config, index }: {
  config: ReturnType<typeof useTrunkConfigs>[0];
  index: number;
}) {
  const drift = useSharedValue(0);

  useEffect(() => {
    drift.value = withDelay(
      (index * 200) % 3000,
      withRepeat(
        withSequence(
          withTiming(1, { duration: config.driftSpeed, easing: Easing.inOut(Easing.sin) }),
          withTiming(-1, { duration: config.driftSpeed, easing: Easing.inOut(Easing.sin) }),
        ),
        -1,
      ),
    );
  }, []);

  const style = useAnimatedStyle(() => ({
    transform: [{ rotate: `${drift.value * config.driftAmount}deg` }],
  }));

  const bark = '#D8D0C4';
  const markColor = '#6B6560';

  return (
    <Animated.View
      style={[
        styles.trunk,
        {
          left: `${config.leftPct}%`,
          height: config.height,
          width: config.width,
          backgroundColor: bark,
          opacity: config.opacity,
        },
        style,
      ]}
    >
      {/* Bark markings — small dark horizontal dashes */}
      {Array.from({ length: config.markCount }).map((_, mi) => {
        const mSeed = Math.sin((index * 7 + mi * 13) * 29.7) * 10000;
        const mr = mSeed - Math.floor(mSeed);
        return (
          <View
            key={mi}
            style={{
              position: 'absolute',
              top: 8 + mi * (config.height / (config.markCount + 1)),
              left: 0,
              width: config.width * (0.5 + mr * 0.5),
              height: 1,
              backgroundColor: markColor,
              opacity: 0.35,
              borderRadius: 0.5,
            }}
          />
        );
      })}
    </Animated.View>
  );
}

export function ActBirchForest({ actionCount, completedToday, fullScreen }: ActBirchForestProps) {
  const colors = useColors();
  const snow = '#E8E4E0';
  const ice = '#C8D4DC';
  const wood = '#8B7E70';
  const trunkConfigs = useTrunkConfigs(Math.max(actionCount + 8, 14));

  return (
    <View style={[styles.container, fullScreen && styles.containerFull, { backgroundColor: snow + '18' }]}>
      {/* Sky — pale winter */}
      <View style={[styles.sky, { backgroundColor: ice + '12' }]} />

      {/* Sun — pale winter sun */}
      <View style={styles.sun}>
        <View style={[styles.sunBody, { backgroundColor: '#E8D08A', opacity: 0.40 }]} />
        <View style={[styles.sunGlow, { backgroundColor: '#E8D08A', opacity: 0.12 }]} />
      </View>

      {/* Clouds */}
      <View style={styles.cloud1}>
        <View style={[styles.cloudPuff, { width: 40, height: 16, backgroundColor: '#fff', opacity: 0.38 }]} />
        <View style={[styles.cloudPuff, { width: 26, height: 12, left: 28, top: -3, backgroundColor: '#fff', opacity: 0.30 }]} />
        <View style={[styles.cloudPuff, { width: 20, height: 10, left: -8, top: 2, backgroundColor: '#fff', opacity: 0.25 }]} />
      </View>
      <View style={styles.cloud2}>
        <View style={[styles.cloudPuff, { width: 34, height: 14, backgroundColor: '#fff', opacity: 0.35 }]} />
        <View style={[styles.cloudPuff, { width: 22, height: 10, left: 24, top: -2, backgroundColor: '#fff', opacity: 0.28 }]} />
      </View>

      {/* Distant treeline — very faint */}
      <View style={[styles.distantTrees, { backgroundColor: '#A0A8A4', opacity: 0.30 }]} />

      {/* Frozen lake */}
      <View style={[styles.lake, { backgroundColor: ice + '40' }]} />
      <View style={[styles.lakeShine, { backgroundColor: '#fff', opacity: 0.25 }]} />

      {/* Cabin */}
      <View style={styles.cabin}>
        <View style={[styles.cabinBody, { backgroundColor: wood, opacity: 0.55 }]} />
        <View style={[styles.cabinRoof, {
          borderBottomColor: wood,
          borderLeftColor: 'transparent',
          borderRightColor: 'transparent',
          opacity: 0.60,
        }]} />
        <View style={[styles.cabinDoor, { backgroundColor: '#5A504A', opacity: 0.50 }]} />
        <View style={[styles.cabinWindow, { backgroundColor: '#E8D88C', opacity: 0.55 }]} />
        {/* Chimney */}
        <View style={[styles.chimney, { backgroundColor: '#6B6058', opacity: 0.55 }]} />
        {/* Smoke wisps */}
        <View style={[styles.smoke1, { backgroundColor: '#B8B4B0', opacity: 0.30 }]} />
        <View style={[styles.smoke2, { backgroundColor: '#C0BCB8', opacity: 0.22 }]} />
      </View>

      {/* Snow ground */}
      <View style={[styles.snowGround, { backgroundColor: snow + '50' }]} />

      {/* Snow drifts */}
      <View style={[styles.drift1, { backgroundColor: '#fff', opacity: 0.35 }]} />
      <View style={[styles.drift2, { backgroundColor: '#fff', opacity: 0.28 }]} />

      {/* Birch trunks */}
      {trunkConfigs.map((cfg, i) => (
        <BirchTrunk key={i} config={cfg} index={i} />
      ))}

      {/* Sparse bare branches on a few trunks */}
      <View style={[styles.branch, { left: '15%', top: '18%', backgroundColor: '#C8C0B8', opacity: 0.25 }]} />
      <View style={[styles.branch, { left: '45%', top: '14%', backgroundColor: '#C8C0B8', opacity: 0.22, transform: [{ rotate: '30deg' }] }]} />
      <View style={[styles.branch, { left: '72%', top: '20%', backgroundColor: '#C8C0B8', opacity: 0.20, transform: [{ rotate: '-20deg' }] }]} />

      {/* Falling snowflakes — static dots */}
      {[
        { top: '8%',  left: '12%' },
        { top: '15%', left: '35%' },
        { top: '22%', right: '20%' },
        { top: '12%', right: '40%' },
        { top: '30%', left: '55%' },
        { top: '18%', left: '80%' },
        { top: '35%', left: '25%' },
        { top: '28%', right: '12%' },
      ].map((pos, i) => (
        <View
          key={i}
          style={[
            styles.snowflake,
            pos as any,
            { backgroundColor: '#fff', opacity: 0.30 + (i % 3) * 0.08 },
          ]}
        />
      ))}
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
    height: '50%',
  },
  // Sun
  sun: {
    position: 'absolute',
    top: '4%',
    right: '18%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  sunBody: {
    width: 26,
    height: 26,
    borderRadius: 13,
  },
  sunGlow: {
    position: 'absolute',
    width: 46,
    height: 46,
    borderRadius: 23,
  },
  // Clouds
  cloud1: {
    position: 'absolute',
    top: '8%',
    left: '10%',
    flexDirection: 'row',
  },
  cloud2: {
    position: 'absolute',
    top: '18%',
    left: '55%',
    flexDirection: 'row',
  },
  cloudPuff: {
    borderRadius: 20,
    position: 'absolute',
  },
  distantTrees: {
    position: 'absolute',
    top: '32%',
    left: '5%',
    right: '5%',
    height: 10,
    borderTopLeftRadius: 3,
    borderTopRightRadius: 3,
  },
  lake: {
    position: 'absolute',
    top: '38%',
    left: '15%',
    width: '45%',
    height: 14,
    borderRadius: 7,
  },
  lakeShine: {
    position: 'absolute',
    top: '39%',
    left: '22%',
    width: '18%',
    height: 3,
    borderRadius: 1.5,
  },
  cabin: {
    position: 'absolute',
    right: '15%',
    top: '28%',
  },
  cabinBody: {
    width: 34,
    height: 22,
    borderRadius: 1,
  },
  cabinRoof: {
    position: 'absolute',
    top: -13,
    left: -5,
    width: 0,
    height: 0,
    borderLeftWidth: 22,
    borderRightWidth: 22,
    borderBottomWidth: 13,
  },
  cabinDoor: {
    position: 'absolute',
    bottom: 0,
    left: 9,
    width: 6,
    height: 9,
    borderTopLeftRadius: 3,
    borderTopRightRadius: 3,
  },
  cabinWindow: {
    position: 'absolute',
    top: 4,
    left: 3,
    width: 4,
    height: 4,
    borderRadius: 1,
  },
  chimney: {
    position: 'absolute',
    top: -14,
    right: 4,
    width: 4,
    height: 8,
  },
  smoke1: {
    position: 'absolute',
    top: -20,
    right: 2,
    width: 8,
    height: 6,
    borderRadius: 4,
  },
  smoke2: {
    position: 'absolute',
    top: -26,
    right: 5,
    width: 6,
    height: 5,
    borderRadius: 3,
  },
  snowGround: {
    position: 'absolute',
    top: '50%',
    left: 0,
    right: 0,
    bottom: 0,
  },
  drift1: {
    position: 'absolute',
    top: '48%',
    left: '10%',
    width: '30%',
    height: 8,
    borderTopLeftRadius: 12,
    borderTopRightRadius: 8,
  },
  drift2: {
    position: 'absolute',
    top: '49%',
    right: '8%',
    width: '25%',
    height: 6,
    borderTopLeftRadius: 8,
    borderTopRightRadius: 10,
  },
  trunk: {
    position: 'absolute',
    bottom: '50%',
    borderTopLeftRadius: 2,
    borderTopRightRadius: 2,
    borderBottomLeftRadius: 1,
    borderBottomRightRadius: 1,
    transformOrigin: 'bottom',
  },
  branch: {
    position: 'absolute',
    width: 14,
    height: 1.5,
    borderRadius: 0.75,
    transform: [{ rotate: '-25deg' }],
  },
  snowflake: {
    position: 'absolute',
    width: 3,
    height: 3,
    borderRadius: 1.5,
  },
});
