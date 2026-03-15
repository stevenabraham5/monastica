import { useEffect } from 'react';
import {
  useSharedValue,
  useAnimatedStyle,
  withDelay,
  withTiming,
  SharedValue,
} from 'react-native-reanimated';
import { duration, TEMPO_EASING, enterDistance } from '../constants/motion';
import { useReduceMotion } from './useReduceMotion';

interface UseEnterAnimationOptions {
  delay?: number;
  distance?: number;
}

export function useEnterAnimation({
  delay = 0,
  distance = enterDistance,
}: UseEnterAnimationOptions = {}) {
  const reduceMotion = useReduceMotion();
  const opacity = useSharedValue(reduceMotion ? 1 : 0);
  const translateY = useSharedValue(reduceMotion ? 0 : distance);

  useEffect(() => {
    if (reduceMotion) {
      opacity.value = 1;
      translateY.value = 0;
      return;
    }

    const config = {
      duration: duration.elementEnter,
      easing: TEMPO_EASING,
    };

    opacity.value = withDelay(delay, withTiming(1, config));
    translateY.value = withDelay(delay, withTiming(0, config));
  }, [reduceMotion]);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ translateY: translateY.value }],
  }));

  return animatedStyle;
}
