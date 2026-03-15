import React, { useState } from 'react';
import { TextInput, TextInputProps, StyleSheet } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
} from 'react-native-reanimated';
import { useColors } from '../constants/colors';
import { typeScale, fontFamilies } from '../constants/typography';
import { duration, TEMPO_EASING } from '../constants/motion';

const AnimatedTextInput = Animated.createAnimatedComponent(TextInput);

interface TempoInputProps extends Omit<TextInputProps, 'style'> {
  variant?: 'body' | 'display';
}

export function TempoInput({
  variant = 'body',
  placeholder,
  onChangeText,
  ...rest
}: TempoInputProps) {
  const colors = useColors();
  const borderColor = useSharedValue(0); // 0 = border, 1 = accent

  const scale = variant === 'display'
    ? {
        fontFamily: fontFamilies.displayItalic,
        fontSize: 20,
        lineHeight: 28,
      }
    : typeScale.body;

  const borderStyle = useAnimatedStyle(() => ({
    borderColor:
      borderColor.value === 0 ? colors.border : colors.accent,
  }));

  const handleFocus = () => {
    borderColor.value = withTiming(1, {
      duration: duration.focusBorder,
      easing: TEMPO_EASING,
    });
  };

  const handleBlur = () => {
    borderColor.value = withTiming(0, {
      duration: duration.focusBorder,
      easing: TEMPO_EASING,
    });
  };

  return (
    <AnimatedTextInput
      style={[
        styles.input,
        scale,
        { color: colors.ink, borderColor: colors.border },
        borderStyle,
      ]}
      placeholder={placeholder}
      placeholderTextColor={colors.ink3}
      onChangeText={onChangeText}
      onFocus={handleFocus}
      onBlur={handleBlur}
      accessibilityLabel={placeholder}
      {...rest}
    />
  );
}

const styles = StyleSheet.create({
  input: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 16,
    minHeight: 48,
  },
});
