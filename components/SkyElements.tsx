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

/*
  Shared animated elements for scenes — clouds and birds that
  drift effortlessly across the sky.
*/

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
