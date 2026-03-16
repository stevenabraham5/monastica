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
import { useCelestialPosition } from '../hooks/useCelestialPosition';
import { DriftingCloud, DriftingBird } from './SkyElements';

/*
  CityScape — urban skyline with:
  - Layered building silhouettes
  - Lit windows that twinkle
  - Street-level details
  - Mood-responsive: warm sunset vs overcast/grey
*/

const SUNNY_MOODS = ['rested', 'focused', 'steady', 'energised'];
const RAINY_MOODS = ['scattered', 'drained', 'restless', 'flat'];

interface CityScapeProps {
  actionCount: number;
  completedToday: number;
  fullScreen?: boolean;
  mood?: string | null;
}

function useWindowConfigs(count: number) {
  return useMemo(() => {
    const configs = [];
    for (let i = 0; i < count; i++) {
      const seed = Math.sin(i * 137.508) * 10000;
      const rand = seed - Math.floor(seed);
      configs.push({
        leftPct: 4 + (i / Math.max(count - 1, 1)) * 92,
        bottomPct: 22 + rand * 38,
        lit: rand > 0.35,
        pulseSpeed: 3000 + (i % 4) * 800,
      });
    }
    return configs;
  }, [count]);
}

function TwinklingWindow({ config, index }: {
  config: { leftPct: number; bottomPct: number; lit: boolean; pulseSpeed: number };
  index: number;
}) {
  const pulse = useSharedValue(config.lit ? 1 : 0.15);

  useEffect(() => {
    if (!config.lit) return;
    pulse.value = withDelay(
      (index * 300) % 3000,
      withRepeat(
        withSequence(
          withTiming(0.4, { duration: config.pulseSpeed, easing: Easing.inOut(Easing.sin) }),
          withTiming(1, { duration: config.pulseSpeed, easing: Easing.inOut(Easing.sin) }),
        ),
        -1,
      ),
    );
  }, []);

  const style = useAnimatedStyle(() => ({
    opacity: pulse.value,
  }));

  return (
    <Animated.View
      style={[
        styles.window,
        {
          left: `${config.leftPct}%`,
          bottom: `${config.bottomPct}%`,
          backgroundColor: config.lit ? '#F0D870' : '#404850',
        },
        style,
      ]}
    />
  );
}

export function CityScape({ actionCount, completedToday, fullScreen, mood }: CityScapeProps) {
  const colors = useColors();
  const { leftPct, topPct, isNight } = useCelestialPosition();
  const isRainy = mood ? RAINY_MOODS.includes(mood) : false;
  const isSunny = !isRainy;

  const bldgColor = '#2A3440';
  const windowCount = Math.max(20, actionCount + 14);
  const windowConfigs = useWindowConfigs(windowCount);

  const skyColor = isRainy
    ? '#4A5460' + '50'
    : isNight
      ? '#101828' + '55'
      : '#E8A060' + '30';
  const skyGradient = isRainy
    ? '#606870' + '40'
    : isNight
      ? '#182030' + '40'
      : '#F0C878' + '25';

  return (
    <View style={[styles.container, fullScreen && styles.containerFull, { backgroundColor: isRainy ? '#383E48' + '18' : isNight ? '#080C14' + '20' : '#F0D0A0' + '18' }]}>
      {/* Sky — warm sunset, night, or overcast */}
      <View style={[styles.sky, { backgroundColor: skyColor }]} />
      <View style={[styles.skyLower, { backgroundColor: skyGradient }]} />

      {/* Sun / Moon — positioned by time of day */}
      {isSunny && !isNight && (
        <View style={[styles.celestialBody, { left: `${leftPct}%`, top: `${topPct}%` }]}>
          <View style={[styles.sunBody, { backgroundColor: '#F0A030', opacity: 0.65 }]} />
          <View style={[styles.sunGlow, { backgroundColor: '#F0A030', opacity: 0.20 }]} />
        </View>
      )}
      {isSunny && isNight && (
        <View style={[styles.celestialBody, { left: `${leftPct}%`, top: `${topPct}%` }]}>
          <View style={[styles.moonBody, { backgroundColor: '#E0E4E8', opacity: 0.85 }]} />
          <View style={[styles.moonGlow, { backgroundColor: '#C8D0D8', opacity: 0.25 }]} />
          <View style={[styles.moonCrater1, { backgroundColor: '#C8CCD0', opacity: 0.40 }]} />
          <View style={[styles.moonCrater2, { backgroundColor: '#C8CCD0', opacity: 0.30 }]} />
        </View>
      )}
      {isRainy && (
        <View style={styles.rainCloudGroup}>
          <View style={[styles.cloudPuff, { width: 70, height: 28, backgroundColor: '#4A5460', opacity: 0.80, borderRadius: 20 }]} />
          <View style={[styles.cloudPuff, { width: 50, height: 24, left: 48, top: -5, backgroundColor: '#404C58', opacity: 0.75, borderRadius: 20 }]} />
          <View style={[styles.cloudPuff, { width: 40, height: 22, left: -14, top: 3, backgroundColor: '#4A5460', opacity: 0.70, borderRadius: 20 }]} />
          {/* Rain */}
          <View style={[styles.rainStreak, { left: 10, top: 28 }]} />
          <View style={[styles.rainStreak, { left: 24, top: 32 }]} />
          <View style={[styles.rainStreak, { left: 40, top: 30 }]} />
          <View style={[styles.rainStreak, { left: 56, top: 34 }]} />
          <View style={[styles.rainStreak, { left: 70, top: 29 }]} />
        </View>
      )}

      {/* Clouds — drifting */}
      {isSunny && (
        <>
          <DriftingCloud
            startLeft={15} startTop={12} speed={24000} delay={0} driftX={50} driftY={5}
            color="#F0D0A0"
            puffs={[
              { width: 48, height: 18, opacity: 0.50 },
              { width: 32, height: 14, offsetX: 34, offsetY: -2, opacity: 0.40 },
            ]}
          />
          <DriftingCloud
            startLeft={60} startTop={6} speed={20000} delay={4000} driftX={35} driftY={4}
            color="#F0D0A0"
            puffs={[
              { width: 40, height: 16, opacity: 0.45 },
              { width: 28, height: 12, offsetX: 28, offsetY: -2, opacity: 0.35 },
            ]}
          />
        </>
      )}

      {/* Bird drifting over the city */}
      <DriftingBird startLeft={40} startTop={10} speed={15000} delay={3000} driftX={55} driftY={10} color={bldgColor} wingWidth={12} />

      {/* Far buildings — lighter, taller */}
      <View style={[styles.bldgFar1, { backgroundColor: bldgColor + '35' }]} />
      <View style={[styles.bldgFar2, { backgroundColor: bldgColor + '30' }]} />
      <View style={[styles.bldgFar3, { backgroundColor: bldgColor + '38' }]} />

      {/* Mid buildings */}
      <View style={[styles.bldgMid1, { backgroundColor: bldgColor + '55' }]} />
      <View style={[styles.bldgMid2, { backgroundColor: bldgColor + '50' }]} />
      <View style={[styles.bldgMid3, { backgroundColor: bldgColor + '58' }]} />
      <View style={[styles.bldgMid4, { backgroundColor: bldgColor + '48' }]} />

      {/* Near buildings — darkest */}
      <View style={[styles.bldgNear1, { backgroundColor: bldgColor + '75' }]} />
      <View style={[styles.bldgNear2, { backgroundColor: bldgColor + '80' }]} />
      <View style={[styles.bldgNear3, { backgroundColor: bldgColor + '70' }]} />

      {/* Twinkling windows */}
      {windowConfigs.map((cfg, i) => (
        <TwinklingWindow key={i} config={cfg} index={i} />
      ))}

      {/* Street level */}
      <View style={[styles.street, { backgroundColor: bldgColor + (isRainy ? '45' : '35') }]} />

      {/* Street lamp */}
      <View style={styles.lampPost}>
        <View style={[styles.lampPole, { backgroundColor: bldgColor, opacity: 0.60 }]} />
        <View style={[styles.lampHead, { backgroundColor: '#F0D870', opacity: isSunny ? 0.5 : 0.75 }]} />
        <View style={[styles.lampGlow, { backgroundColor: '#F0D870', opacity: isSunny ? 0.15 : 0.30 }]} />
      </View>

      {/* Second lamp */}
      <View style={styles.lampPost2}>
        <View style={[styles.lampPole, { backgroundColor: bldgColor, opacity: 0.55 }]} />
        <View style={[styles.lampHead, { backgroundColor: '#F0D870', opacity: isSunny ? 0.45 : 0.70 }]} />
        <View style={[styles.lampGlow, { backgroundColor: '#F0D870', opacity: isSunny ? 0.12 : 0.25 }]} />
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
    height: '50%',
  },
  skyLower: {
    position: 'absolute',
    top: '40%',
    left: 0,
    right: 0,
    height: '20%',
  },

  // Sun / Moon
  celestialBody: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: -22,
    marginTop: -22,
  },
  sunBody: {
    width: 44,
    height: 44,
    borderRadius: 22,
  },
  sunGlow: {
    position: 'absolute',
    width: 72,
    height: 72,
    borderRadius: 36,
  },
  moonBody: {
    width: 34,
    height: 34,
    borderRadius: 17,
  },
  moonGlow: {
    position: 'absolute',
    width: 56,
    height: 56,
    borderRadius: 28,
  },
  moonCrater1: {
    position: 'absolute',
    width: 6,
    height: 6,
    borderRadius: 3,
    top: 8,
    left: 10,
  },
  moonCrater2: {
    position: 'absolute',
    width: 4,
    height: 4,
    borderRadius: 2,
    top: 19,
    right: 10,
  },

  // Rain cloud
  rainCloudGroup: {
    position: 'absolute',
    top: '5%',
    right: '12%',
    flexDirection: 'row',
  },
  rainStreak: {
    position: 'absolute',
    width: 1.5,
    height: 10,
    backgroundColor: '#7088A0',
    opacity: 0.45,
    borderRadius: 1,
  },

  // Clouds — now animated via DriftingCloud, keep cloudPuff for rain
  cloudPuff: {
    borderRadius: 20,
    position: 'absolute',
  },

  // Far buildings
  bldgFar1: {
    position: 'absolute',
    bottom: '20%',
    left: '8%',
    width: '12%',
    height: '42%',
    borderTopLeftRadius: 2,
    borderTopRightRadius: 2,
  },
  bldgFar2: {
    position: 'absolute',
    bottom: '20%',
    left: '28%',
    width: '10%',
    height: '36%',
    borderTopLeftRadius: 2,
    borderTopRightRadius: 2,
  },
  bldgFar3: {
    position: 'absolute',
    bottom: '20%',
    right: '15%',
    width: '14%',
    height: '45%',
    borderTopLeftRadius: 2,
    borderTopRightRadius: 2,
  },

  // Mid buildings
  bldgMid1: {
    position: 'absolute',
    bottom: '18%',
    left: '2%',
    width: '16%',
    height: '32%',
    borderTopLeftRadius: 2,
    borderTopRightRadius: 2,
  },
  bldgMid2: {
    position: 'absolute',
    bottom: '18%',
    left: '20%',
    width: '14%',
    height: '28%',
    borderTopLeftRadius: 2,
    borderTopRightRadius: 2,
  },
  bldgMid3: {
    position: 'absolute',
    bottom: '18%',
    right: '5%',
    width: '18%',
    height: '35%',
    borderTopLeftRadius: 2,
    borderTopRightRadius: 2,
  },
  bldgMid4: {
    position: 'absolute',
    bottom: '18%',
    left: '42%',
    width: '12%',
    height: '30%',
    borderTopLeftRadius: 2,
    borderTopRightRadius: 2,
  },

  // Near buildings
  bldgNear1: {
    position: 'absolute',
    bottom: '14%',
    left: '0%',
    width: '22%',
    height: '24%',
    borderTopLeftRadius: 2,
    borderTopRightRadius: 2,
  },
  bldgNear2: {
    position: 'absolute',
    bottom: '14%',
    left: '35%',
    width: '20%',
    height: '22%',
    borderTopLeftRadius: 2,
    borderTopRightRadius: 2,
  },
  bldgNear3: {
    position: 'absolute',
    bottom: '14%',
    right: '0%',
    width: '24%',
    height: '26%',
    borderTopLeftRadius: 2,
    borderTopRightRadius: 2,
  },

  // Windows
  window: {
    position: 'absolute',
    width: 4,
    height: 5,
    borderRadius: 1,
  },

  // Street
  street: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: '16%',
  },

  // Street lamps
  lampPost: {
    position: 'absolute',
    bottom: '14%',
    left: '18%',
    alignItems: 'center',
  },
  lampPost2: {
    position: 'absolute',
    bottom: '14%',
    right: '22%',
    alignItems: 'center',
  },
  lampPole: {
    width: 2,
    height: 22,
    borderRadius: 1,
  },
  lampHead: {
    position: 'absolute',
    top: -4,
    width: 8,
    height: 6,
    borderRadius: 3,
  },
  lampGlow: {
    position: 'absolute',
    top: -8,
    width: 18,
    height: 14,
    borderRadius: 9,
  },
});
