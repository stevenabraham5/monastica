import React, { useEffect } from 'react';
import { Pressable, StyleSheet } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withDelay,
  runOnJS,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { TempoText } from './TempoText';
import { useColors } from '../constants/colors';
import { spacing } from '../constants/spacing';
import { TEMPO_EASING } from '../constants/motion';

interface Props {
  meetingTitle: string;
  onDismiss: () => void;
  onTap?: () => void;
}

export function SentinelToast({ meetingTitle, onDismiss, onTap }: Props) {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const translateY = useSharedValue(-80);
  const opacity = useSharedValue(0);

  useEffect(() => {
    // Slide in
    translateY.value = withTiming(0, { duration: 280, easing: TEMPO_EASING });
    opacity.value = withTiming(1, { duration: 280, easing: TEMPO_EASING });

    // Auto-dismiss after 3s
    translateY.value = withDelay(
      3000,
      withTiming(-80, { duration: 280, easing: TEMPO_EASING }),
    );
    opacity.value = withDelay(
      3000,
      withTiming(0, { duration: 280, easing: TEMPO_EASING }),
    );

    const timer = setTimeout(onDismiss, 3300);
    return () => clearTimeout(timer);
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
    opacity: opacity.value,
  }));

  return (
    <Animated.View
      style={[
        styles.container,
        {
          top: insets.top + spacing.sm,
          backgroundColor: colors.surface,
          borderColor: colors.border,
        },
        animatedStyle,
      ]}
    >
      <Pressable onPress={onTap ?? onDismiss} style={styles.inner}>
        <TempoText variant="caption" color={colors.agent}>
          Sentinel declined: {meetingTitle}
        </TempoText>
      </Pressable>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    left: spacing.xl,
    right: spacing.xl,
    borderRadius: 12,
    borderWidth: StyleSheet.hairlineWidth,
    zIndex: 1000,
  },
  inner: {
    paddingHorizontal: spacing.base,
    paddingVertical: spacing.md,
  },
});
