import React, { useEffect } from 'react';
import { ViewProps } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withDelay,
  withTiming,
} from 'react-native-reanimated';
import { duration, TEMPO_EASING, enterDistance } from '../constants/motion';
import { useReduceMotion } from '../hooks/useReduceMotion';

interface EnterViewProps extends ViewProps {
  delay?: number;
  distance?: number;
  children: React.ReactNode;
}

export function EnterView({
  delay = 0,
  distance = enterDistance,
  style,
  children,
  ...rest
}: EnterViewProps) {
  const reduceMotion = useReduceMotion();
  const opacity = useSharedValue(reduceMotion ? 1 : 0);
  const translateY = useSharedValue(reduceMotion ? 0 : distance);

  useEffect(() => {
    if (reduceMotion) {
      opacity.value = 1;
      translateY.value = 0;
      return;
    }

    const timingConfig = {
      duration: duration.elementEnter,
      easing: TEMPO_EASING,
    };

    opacity.value = withDelay(delay, withTiming(1, timingConfig));
    translateY.value = withDelay(delay, withTiming(0, timingConfig));
  }, [reduceMotion]);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ translateY: translateY.value }],
  }));

  return (
    <Animated.View style={[animatedStyle, style]} {...rest}>
      {children}
    </Animated.View>
  );
}
