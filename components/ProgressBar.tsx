import React, { useEffect } from 'react';
import { View, StyleSheet, ViewProps } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
} from 'react-native-reanimated';
import { useColors } from '../constants/colors';
import { TEMPO_EASING, duration } from '../constants/motion';

interface ProgressBarProps extends ViewProps {
  progress: number; // 0–1
}

export function ProgressBar({ progress, style, ...rest }: ProgressBarProps) {
  const colors = useColors();
  const width = useSharedValue(0);

  useEffect(() => {
    width.value = withTiming(progress, {
      duration: duration.elementEnter,
      easing: TEMPO_EASING,
    });
  }, [progress]);

  const fillStyle = useAnimatedStyle(() => ({
    width: `${width.value * 100}%`,
  }));

  return (
    <View
      style={[styles.track, { backgroundColor: colors.border }, style]}
      accessibilityRole="progressbar"
      accessibilityValue={{ min: 0, max: 100, now: Math.round(progress * 100) }}
      {...rest}
    >
      <Animated.View
        style={[styles.fill, { backgroundColor: colors.accent }, fillStyle]}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  track: {
    height: 3,
    borderRadius: 1.5,
    overflow: 'hidden',
  },
  fill: {
    height: '100%',
    borderRadius: 1.5,
  },
});
