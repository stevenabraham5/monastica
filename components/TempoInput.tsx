import React from 'react';
import { TextInput, TextInputProps, StyleSheet, View, Pressable } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
} from 'react-native-reanimated';
import { useColors } from '../constants/colors';
import { typeScale, fontFamilies } from '../constants/typography';
import { duration, TEMPO_EASING } from '../constants/motion';
import { spacing } from '../constants/spacing';
import { TempoText } from './TempoText';

const AnimatedTextInput = Animated.createAnimatedComponent(TextInput);

interface TempoInputProps extends Omit<TextInputProps, 'style'> {
  variant?: 'body' | 'display';
  onSubmit?: (text: string) => void;
  showVoice?: boolean;
  onVoicePress?: () => void;
  isListening?: boolean;
  style?: any;
}

export function TempoInput({
  variant = 'body',
  placeholder,
  onChangeText,
  onSubmit,
  showVoice,
  onVoicePress,
  isListening,
  style: externalStyle,
  value,
  ...rest
}: TempoInputProps) {
  const colors = useColors();
  const borderColor = useSharedValue(0);

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

  const handleSubmitEditing = () => {
    if (onSubmit && typeof value === 'string' && value.trim()) {
      onSubmit(value.trim());
    }
  };

  return (
    <View style={styles.wrapper}>
      <AnimatedTextInput
        style={[
          styles.input,
          scale,
          { color: colors.ink, borderColor: colors.border },
          borderStyle,
          (showVoice || onSubmit) && styles.inputWithActions,
          externalStyle,
        ]}
        placeholder={placeholder}
        placeholderTextColor={colors.ink3}
        onChangeText={onChangeText}
        onFocus={handleFocus}
        onBlur={handleBlur}
        onSubmitEditing={handleSubmitEditing}
        blurOnSubmit={!rest.multiline}
        value={value}
        accessibilityLabel={placeholder}
        {...rest}
      />
      {(showVoice || onSubmit) && (
        <View style={styles.actions}>
          {showVoice && (
            <Pressable
              onPress={onVoicePress}
              style={[
                styles.voiceButton,
                {
                  backgroundColor: isListening ? colors.accent : colors.surface,
                  borderColor: isListening ? colors.accent : colors.border,
                },
              ]}
              accessibilityLabel={isListening ? 'Stop listening' : 'Start voice input'}
              accessibilityRole="button"
            >
              <TempoText
                variant="caption"
                color={isListening ? '#FFFFFF' : colors.ink2}
              >
                {isListening ? '● Listening' : '🎤'}
              </TempoText>
            </Pressable>
          )}
          {onSubmit && typeof value === 'string' && value.trim().length > 0 && (
            <Pressable
              onPress={handleSubmitEditing}
              style={[styles.submitButton, { backgroundColor: colors.accent }]}
              accessibilityLabel="Submit"
              accessibilityRole="button"
            >
              <TempoText variant="caption" color="#FFFFFF">
                ↵
              </TempoText>
            </Pressable>
          )}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    position: 'relative',
  },
  input: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 16,
    minHeight: 48,
  },
  inputWithActions: {
    paddingRight: 80,
  },
  actions: {
    position: 'absolute',
    right: spacing.sm,
    bottom: spacing.sm,
    flexDirection: 'row',
    gap: spacing.sm,
    alignItems: 'center',
  },
  voiceButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  submitButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
