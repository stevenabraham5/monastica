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
import { DriftingCloud, DriftingBird, Starfield } from './SkyElements';

/*
  MountainScene — alpine landscape with:
  - Snow-capped peaks layered at different depths
  - Pine tree silhouettes in the foreground
  - Gentle cloud drift
  - Mood-responsive: sunny skies vs overcast/mist
*/

const SUNNY_MOODS = ['rested', 'focused', 'steady', 'energised'];
const RAINY_MOODS = ['scattered', 'drained', 'restless', 'flat'];

interface MountainSceneProps {
  actionCount: number;
  completedToday: number;
  fullScreen?: boolean;
  mood?: string | null;
}

function useTreeConfigs(count: number) {
  return useMemo(() => {
    const configs = [];
    for (let i = 0; i < count; i++) {
      const seed = Math.sin(i * 137.508) * 10000;
      const rand = seed - Math.floor(seed);
      configs.push({
        leftPct: 2 + (i / Math.max(count - 1, 1)) * 96,
        height: 18 + rand * 28,
        width: 8 + rand * 6,
        opacity: 0.45 + rand * 0.4,
      });
    }
    return configs;
  }, [count]);
}

function SwayingTree({ config, index }: {
  config: { leftPct: number; height: number; width: number; opacity: number };
  index: number;
}) {
  const sway = useSharedValue(0);

  useEffect(() => {
    sway.value = withDelay(
      (index * 200) % 2400,
      withRepeat(
        withSequence(
          withTiming(1, { duration: 2200 + (index % 3) * 400, easing: Easing.inOut(Easing.sin) }),
          withTiming(-1, { duration: 2200 + (index % 3) * 400, easing: Easing.inOut(Easing.sin) }),
        ),
        -1,
      ),
    );
  }, []);

  const style = useAnimatedStyle(() => ({
    transform: [{ rotate: `${sway.value * 1.5}deg` }],
  }));

  return (
    <Animated.View
      style={[
        styles.tree,
        {
          left: `${config.leftPct}%`,
          opacity: config.opacity,
        },
        style,
      ]}
    >
      {/* Trunk */}
      <View style={[styles.trunk, { height: config.height * 0.4 }]} />
      {/* Canopy — triangle layers */}
      <View style={[styles.canopy, {
        borderLeftWidth: config.width / 2,
        borderRightWidth: config.width / 2,
        borderBottomWidth: config.height * 0.5,
        bottom: config.height * 0.25,
      }]} />
      <View style={[styles.canopy, {
        borderLeftWidth: config.width * 0.4,
        borderRightWidth: config.width * 0.4,
        borderBottomWidth: config.height * 0.4,
        bottom: config.height * 0.45,
      }]} />
    </Animated.View>
  );
}

export function MountainScene({ actionCount, completedToday, fullScreen, mood }: MountainSceneProps) {
  const colors = useColors();
  const { leftPct, topPct, isNight } = useCelestialPosition();
  const isRainy = mood ? RAINY_MOODS.includes(mood) : false;
  const isSunny = !isRainy;

  const mountainBlue = '#4A6B7A';
  const snowWhite = '#E8ECF0';
  const pineGreen = '#2E5040';
  const treeCount = Math.max(14, actionCount + 8);
  const treeConfigs = useTreeConfigs(treeCount);

  const skyColor = isRainy
    ? '#788898' + '50'
    : isNight
      ? '#1A2840' + '55'
      : '#B8D4E8' + '40';

  return (
    <View style={[styles.container, fullScreen && styles.containerFull, { backgroundColor: isRainy ? '#606C78' + '18' : isNight ? '#0E1820' + '20' : '#C8DDE8' + '18' }]}>
      {/* Sky */}
      <View style={[styles.sky, { backgroundColor: skyColor }]} />

      {/* Sun / Moon — positioned by time of day */}
      {isSunny && !isNight && (
        <View style={[styles.celestialBody, { left: `${leftPct}%`, top: `${topPct}%` }]}>
          <View style={[styles.sunBody, { backgroundColor: '#F0C840', opacity: 0.70 }]} />
          <View style={[styles.sunGlow, { backgroundColor: '#F0C840', opacity: 0.25 }]} />
        </View>
      )}
      {isSunny && isNight && (
        <View style={[styles.celestialBody, { left: `${leftPct}%`, top: `${topPct}%` }]}>
          <View style={[styles.moonBody, { backgroundColor: '#E0E4E8', opacity: 0.85 }]} />
          <View style={[styles.moonGlow, { backgroundColor: '#C8D0D8', opacity: 0.20 }]} />
          <View style={[styles.moonCrater1, { backgroundColor: '#C8CCD0', opacity: 0.40 }]} />
          <View style={[styles.moonCrater2, { backgroundColor: '#C8CCD0', opacity: 0.30 }]} />
        </View>
      )}
      {isRainy && (
        <View style={styles.mistLayer}>
          <View style={[styles.mistBand, { backgroundColor: '#8898A4', opacity: 0.35, top: '15%' }]} />
          <View style={[styles.mistBand, { backgroundColor: '#8898A4', opacity: 0.25, top: '25%' }]} />
          <View style={[styles.mistBand, { backgroundColor: '#8898A4', opacity: 0.20, top: '40%' }]} />
        </View>
      )}

      {/* Stars — galaxy at night */}
      {isNight && <Starfield count={55} maxTopPct={55} />}

      {/* Clouds — drifting */}
      {isSunny && (
        <>
          <DriftingCloud
            startLeft={60} startTop={8} speed={24000} delay={0} driftX={40} driftY={5}
            puffs={[
              { width: 54, height: 20, opacity: 0.65 },
              { width: 36, height: 16, offsetX: 38, offsetY: -3, opacity: 0.55 },
            ]}
          />
          <DriftingCloud
            startLeft={30} startTop={18} speed={20000} delay={5000} driftX={45} driftY={4}
            puffs={[
              { width: 44, height: 18, opacity: 0.55 },
              { width: 30, height: 14, offsetX: 32, offsetY: -2, opacity: 0.45 },
            ]}
          />
        </>
      )}

      {/* Far mountain — largest, lightest */}
      <View style={[styles.mountainFar, { backgroundColor: mountainBlue + '30' }]} />
      <View style={[styles.mountainFarSnow, { backgroundColor: snowWhite, opacity: 0.50 }]} />

      {/* Mid mountain */}
      <View style={[styles.mountainMid, { backgroundColor: mountainBlue + '50' }]} />
      <View style={[styles.mountainMidSnow, { backgroundColor: snowWhite, opacity: 0.60 }]} />

      {/* Near mountain — darkest */}
      <View style={[styles.mountainNear, { backgroundColor: mountainBlue + '70' }]} />
      <View style={[styles.mountainNearSnow, { backgroundColor: snowWhite, opacity: 0.75 }]} />

      {/* Valley floor */}
      <View style={[styles.ground, { backgroundColor: pineGreen + (isRainy ? '35' : '25') }]} />

      {/* Cabin lights — warm dots in the valley at night */}
      {isNight && (
        <>
          <View style={[styles.cabinLight, { left: '22%', bottom: '24%' }]} />
          <View style={[styles.cabinGlow, { left: '21.2%', bottom: '23.3%' }]} />
          <View style={[styles.cabinLight, { left: '68%', bottom: '26%' }]} />
          <View style={[styles.cabinGlow, { left: '67.2%', bottom: '25.3%' }]} />
          <View style={[styles.cabinLight, { left: '45%', bottom: '22%' }]} />
          <View style={[styles.cabinGlow, { left: '44.2%', bottom: '21.3%' }]} />
        </>
      )}

      {/* Pine trees */}
      {treeConfigs.map((cfg, i) => (
        <SwayingTree key={i} config={cfg} index={i} />
      ))}

      {/* Eagle — soaring across sky */}
      <DriftingBird startLeft={55} startTop={12} speed={18000} delay={2000} driftX={70} driftY={10} color={mountainBlue} wingWidth={16} flapSpeed={1200} />
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
    height: '65%',
  },

  // Sun / Moon
  celestialBody: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: -18,
    marginTop: -18,
  },
  sunBody: {
    width: 36,
    height: 36,
    borderRadius: 18,
  },
  sunGlow: {
    position: 'absolute',
    width: 60,
    height: 60,
    borderRadius: 30,
  },
  moonBody: {
    width: 28,
    height: 28,
    borderRadius: 14,
  },
  moonGlow: {
    position: 'absolute',
    width: 46,
    height: 46,
    borderRadius: 23,
  },
  moonCrater1: {
    position: 'absolute',
    width: 5,
    height: 5,
    borderRadius: 2.5,
    top: 7,
    left: 8,
  },
  moonCrater2: {
    position: 'absolute',
    width: 3.5,
    height: 3.5,
    borderRadius: 1.75,
    top: 16,
    right: 8,
  },

  // Mist (rainy)
  mistLayer: {
    ...StyleSheet.absoluteFillObject,
  },
  mistBand: {
    position: 'absolute',
    left: 0,
    right: 0,
    height: '8%',
    borderRadius: 40,
  },

  // Clouds — now animated via DriftingCloud
  cloudPuff: {
    borderRadius: 20,
    position: 'absolute',
  },

  // Mountains — triangular shapes via border trick
  mountainFar: {
    position: 'absolute',
    bottom: '30%',
    left: '5%',
    width: '55%',
    height: '40%',
    borderTopLeftRadius: 8,
    borderTopRightRadius: 80,
  },
  mountainFarSnow: {
    position: 'absolute',
    bottom: '58%',
    left: '38%',
    width: '12%',
    height: '8%',
    borderTopLeftRadius: 4,
    borderTopRightRadius: 30,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 10,
  },
  mountainMid: {
    position: 'absolute',
    bottom: '26%',
    right: '0%',
    width: '50%',
    height: '38%',
    borderTopLeftRadius: 60,
    borderTopRightRadius: 12,
  },
  mountainMidSnow: {
    position: 'absolute',
    bottom: '52%',
    right: '12%',
    width: '10%',
    height: '7%',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 6,
    borderBottomLeftRadius: 8,
    borderBottomRightRadius: 16,
  },
  mountainNear: {
    position: 'absolute',
    bottom: '22%',
    left: '30%',
    width: '45%',
    height: '32%',
    borderTopLeftRadius: 50,
    borderTopRightRadius: 40,
  },
  mountainNearSnow: {
    position: 'absolute',
    bottom: '44%',
    left: '48%',
    width: '8%',
    height: '6%',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 16,
    borderBottomLeftRadius: 10,
    borderBottomRightRadius: 12,
  },

  // Ground
  ground: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: '28%',
  },

  // Pine trees
  tree: {
    position: 'absolute',
    bottom: 0,
    alignItems: 'center',
    transformOrigin: 'bottom',
  },
  trunk: {
    width: 2.5,
    backgroundColor: '#3E2E20',
    opacity: 0.6,
    borderRadius: 1,
  },
  canopy: {
    position: 'absolute',
    width: 0,
    height: 0,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    borderBottomColor: '#2E5040',
  },

  // Cabin lights at night
  cabinLight: {
    position: 'absolute',
    width: 4,
    height: 3,
    backgroundColor: '#F0D870',
    opacity: 0.85,
    borderRadius: 1,
  },
  cabinGlow: {
    position: 'absolute',
    width: 10,
    height: 8,
    backgroundColor: '#F0D870',
    opacity: 0.15,
    borderRadius: 5,
  },

});
