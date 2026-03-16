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

/*
  Shared animated elements for scenes — clouds, birds, and stars
  that drift effortlessly across the sky.
*/

// ── Starfield — galaxy of twinkling stars ──

interface StarfieldProps {
  /** Number of stars */
  count?: number;
  /** Max height % for star placement (keep above ground) */
  maxTopPct?: number;
}

function TwinklingStar({ leftPct, topPct, size, baseOpacity, speed, delay }: {
  leftPct: number; topPct: number; size: number; baseOpacity: number; speed: number; delay: number;
}) {
  const twinkle = useSharedValue(baseOpacity);

  useEffect(() => {
    twinkle.value = withDelay(delay,
      withRepeat(
        withSequence(
          withTiming(baseOpacity * 0.2, { duration: speed, easing: Easing.inOut(Easing.sin) }),
          withTiming(baseOpacity, { duration: speed, easing: Easing.inOut(Easing.sin) }),
        ),
        -1,
      ),
    );
  }, []);

  const style = useAnimatedStyle(() => ({
    opacity: twinkle.value,
  }));

  return (
    <Animated.View
      style={[
        starStyles.star,
        {
          left: `${leftPct}%`,
          top: `${topPct}%`,
          width: size,
          height: size,
          borderRadius: size / 2,
        },
        style,
      ]}
    />
  );
}

function useStarConfigs(count: number, maxTopPct: number) {
  return useMemo(() => {
    const configs = [];
    for (let i = 0; i < count; i++) {
      const seed = Math.sin(i * 137.508 + 42) * 10000;
      const rand = seed - Math.floor(seed);
      const seed2 = Math.sin(i * 97.3 + 17) * 10000;
      const rand2 = seed2 - Math.floor(seed2);
      configs.push({
        leftPct: 2 + rand * 96,
        topPct: 2 + rand2 * (maxTopPct - 4),
        size: rand > 0.85 ? 3 : rand > 0.5 ? 2 : 1.5,
        baseOpacity: 0.4 + rand * 0.55,
        speed: 1800 + rand2 * 3000,
        delay: (i * 200) % 4000,
      });
    }
    return configs;
  }, [count, maxTopPct]);
}

export function Starfield({ count = 45, maxTopPct = 65 }: StarfieldProps) {
  const stars = useStarConfigs(count, maxTopPct);

  return (
    <>
      {stars.map((s, i) => (
        <TwinklingStar key={i} {...s} />
      ))}
    </>
  );
}

const starStyles = StyleSheet.create({
  star: {
    position: 'absolute',
    backgroundColor: '#E8E0F0',
  },
});

// ── Drifting Cloud ──

interface DriftingCloudProps {
  /** Starting left % */
  startLeft: number;
  /** Starting top % */
  startTop: number;
  /** Horizontal drift range in px */
  driftX?: number;
  /** Vertical drift range in px */
  driftY?: number;
  /** Duration of one full drift cycle in ms */
  speed?: number;
  /** Stagger delay in ms */
  delay?: number;
  /** Puff configs: [{width, height, offsetX, offsetY, opacity}] */
  puffs: { width: number; height: number; offsetX?: number; offsetY?: number; opacity: number }[];
  /** Cloud color */
  color?: string;
}

export function DriftingCloud({
  startLeft, startTop, driftX = 40, driftY = 6,
  speed = 18000, delay = 0, puffs, color = '#fff',
}: DriftingCloudProps) {
  const dx = useSharedValue(0);
  const dy = useSharedValue(0);

  useEffect(() => {
    dx.value = withDelay(delay,
      withRepeat(
        withSequence(
          withTiming(1, { duration: speed, easing: Easing.inOut(Easing.sin) }),
          withTiming(-1, { duration: speed, easing: Easing.inOut(Easing.sin) }),
        ),
        -1,
      ),
    );
    dy.value = withDelay(delay + speed * 0.25,
      withRepeat(
        withSequence(
          withTiming(1, { duration: speed * 0.7, easing: Easing.inOut(Easing.sin) }),
          withTiming(-1, { duration: speed * 0.7, easing: Easing.inOut(Easing.sin) }),
        ),
        -1,
      ),
    );
  }, []);

  const animStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: dx.value * driftX },
      { translateY: dy.value * driftY },
    ],
  }));

  return (
    <Animated.View
      style={[
        cloudStyles.cloud,
        { left: `${startLeft}%`, top: `${startTop}%` },
        animStyle,
      ]}
    >
      {puffs.map((p, i) => (
        <View
          key={i}
          style={[
            cloudStyles.puff,
            {
              width: p.width,
              height: p.height,
              left: p.offsetX ?? 0,
              top: p.offsetY ?? 0,
              backgroundColor: color,
              opacity: p.opacity,
            },
          ]}
        />
      ))}
    </Animated.View>
  );
}

const cloudStyles = StyleSheet.create({
  cloud: {
    position: 'absolute',
    flexDirection: 'row',
  },
  puff: {
    position: 'absolute',
    borderRadius: 20,
  },
});


// ── Drifting Bird ──

interface DriftingBirdProps {
  /** Starting left % */
  startLeft: number;
  /** Starting top % */
  startTop: number;
  /** Horizontal drift range in px */
  driftX?: number;
  /** Vertical drift range in px */
  driftY?: number;
  /** One full drift cycle in ms */
  speed?: number;
  /** Stagger delay */
  delay?: number;
  /** Wing flap speed in ms */
  flapSpeed?: number;
  /** Wing color */
  color?: string;
  /** Wing span size */
  wingWidth?: number;
}

export function DriftingBird({
  startLeft, startTop, driftX = 60, driftY = 15,
  speed = 14000, delay = 0, flapSpeed = 800,
  color = '#6B6860', wingWidth = 14,
}: DriftingBirdProps) {
  const dx = useSharedValue(0);
  const dy = useSharedValue(0);
  const flap = useSharedValue(0);

  useEffect(() => {
    dx.value = withDelay(delay,
      withRepeat(
        withSequence(
          withTiming(1, { duration: speed, easing: Easing.inOut(Easing.sin) }),
          withTiming(-1, { duration: speed, easing: Easing.inOut(Easing.sin) }),
        ),
        -1,
      ),
    );
    dy.value = withDelay(delay + 2000,
      withRepeat(
        withSequence(
          withTiming(1, { duration: speed * 0.6, easing: Easing.inOut(Easing.sin) }),
          withTiming(-1, { duration: speed * 0.6, easing: Easing.inOut(Easing.sin) }),
        ),
        -1,
      ),
    );
    flap.value = withDelay(delay,
      withRepeat(
        withSequence(
          withTiming(1, { duration: flapSpeed, easing: Easing.inOut(Easing.sin) }),
          withTiming(-1, { duration: flapSpeed, easing: Easing.inOut(Easing.sin) }),
        ),
        -1,
      ),
    );
  }, []);

  const driftStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: dx.value * driftX },
      { translateY: dy.value * driftY },
    ],
  }));

  const wingLStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${-25 + flap.value * 15}deg` }],
  }));

  const wingRStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${25 - flap.value * 15}deg` }],
  }));

  return (
    <Animated.View
      style={[
        birdStyles.bird,
        { left: `${startLeft}%`, top: `${startTop}%` },
        driftStyle,
      ]}
    >
      <Animated.View style={[birdStyles.wing, { width: wingWidth, backgroundColor: color }, wingLStyle]} />
      <Animated.View style={[birdStyles.wing, { width: wingWidth, backgroundColor: color, marginTop: -1, marginLeft: 3 }, wingRStyle]} />
    </Animated.View>
  );
}

const birdStyles = StyleSheet.create({
  bird: {
    position: 'absolute',
  },
  wing: {
    height: 3,
    borderRadius: 1.5,
    opacity: 0.60,
  },
});
