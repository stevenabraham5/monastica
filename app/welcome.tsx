import React, { useState, useEffect } from 'react';
import {
  View,
  TextInput,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  Pressable,
} from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withDelay,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { TempoText } from '../components/TempoText';
import { useColors } from '../constants/colors';
import { spacing } from '../constants/spacing';
import { TEMPO_EASING } from '../constants/motion';
import { useAuthStore } from '../store/authStore';

export default function WelcomeScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const setUserName = useAuthStore((s) => s.setUserName);

  const [name, setName] = useState('');

  // Staggered fade-in
  const titleOpacity = useSharedValue(0);
  const inputOpacity = useSharedValue(0);

  useEffect(() => {
    titleOpacity.value = withTiming(1, { duration: 600, easing: TEMPO_EASING });
    inputOpacity.value = withDelay(
      300,
      withTiming(1, { duration: 600, easing: TEMPO_EASING }),
    );
  }, []);

  const titleStyle = useAnimatedStyle(() => ({ opacity: titleOpacity.value }));
  const inputStyle = useAnimatedStyle(() => ({ opacity: inputOpacity.value }));

  const handleContinue = () => {
    const trimmed = name.trim();
    if (!trimmed) return;
    setUserName(trimmed);
    router.replace('/(tabs)');
  };

  const canContinue = name.trim().length > 0;

  return (
    <KeyboardAvoidingView
      style={[styles.container, { backgroundColor: colors.ground, paddingTop: insets.top }]}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <View style={styles.content}>
        <Animated.View style={[styles.top, titleStyle]}>
          <TempoText variant="display-xl" style={styles.title}>
            Tempo
          </TempoText>
          <TempoText
            variant="heading"
            color={colors.ink2}
            style={styles.question}
          >
            What should I call you?
          </TempoText>
        </Animated.View>

        <Animated.View style={[styles.inputArea, inputStyle]}>
          <TextInput
            value={name}
            onChangeText={setName}
            onSubmitEditing={handleContinue}
            style={[
              styles.input,
              {
                color: colors.ink,
                borderBottomColor: canContinue ? colors.accent : colors.border,
              },
            ]}
            placeholderTextColor={colors.ink3}
            placeholder="Your first name"
            autoFocus
            autoCapitalize="words"
            autoCorrect={false}
            returnKeyType="done"
          />

          <Pressable
            onPress={handleContinue}
            disabled={!canContinue}
            style={[
              styles.continueButton,
              {
                backgroundColor: canContinue ? colors.accent : colors.border,
              },
            ]}
            accessibilityRole="button"
            accessibilityLabel="Continue"
          >
            <TempoText variant="body" color="#FFFFFF">
              Continue
            </TempoText>
          </Pressable>

          <TempoText variant="data" color={colors.ink3} style={styles.note}>
            No account needed. Your data stays on this device.
          </TempoText>
        </Animated.View>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: spacing.xl,
  },
  top: {
    alignItems: 'center',
    marginBottom: spacing['3xl'],
  },
  title: {
    textAlign: 'center',
  },
  question: {
    textAlign: 'center',
    marginTop: spacing.lg,
  },
  inputArea: {
    alignItems: 'center',
    gap: spacing.xl,
  },
  input: {
    fontFamily: 'DMSans_400Regular',
    fontSize: 20,
    textAlign: 'center',
    width: '100%',
    paddingVertical: spacing.base,
    borderBottomWidth: 2,
  },
  continueButton: {
    paddingHorizontal: spacing['2xl'],
    paddingVertical: spacing.base,
    borderRadius: 24,
  },
  note: {
    textAlign: 'center',
    marginTop: spacing.md,
    lineHeight: 16,
  },
});
