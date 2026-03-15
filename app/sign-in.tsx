import React from 'react';
import { View, StyleSheet, Pressable } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { TempoText } from '../components/TempoText';
import { useColors } from '../constants/colors';
import { spacing } from '../constants/spacing';
import { useAuthStore } from '../store/authStore';

export default function SignInScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { signInWithApple, signInWithGoogle, loading, error } = useAuthStore();

  return (
    <View
      style={[
        styles.container,
        { backgroundColor: colors.ground, paddingTop: insets.top },
      ]}
    >
      <View style={styles.top}>
        <TempoText variant="display-xl" style={styles.title}>
          Tempo
        </TempoText>
        <TempoText variant="body" color={colors.ink2} style={styles.subtitle}>
          Your rhythm. Your data.
        </TempoText>
      </View>

      <View style={styles.buttons}>
        {/* Apple Sign-In */}
        <Pressable
          onPress={signInWithApple}
          disabled={loading}
          style={[styles.authButton, { backgroundColor: colors.ink }]}
          accessibilityRole="button"
          accessibilityLabel="Continue with Apple"
        >
          <TempoText variant="body" color={colors.ground} style={styles.buttonText}>
            Continue with Apple
          </TempoText>
        </Pressable>

        {/* Google Sign-In */}
        <Pressable
          onPress={signInWithGoogle}
          disabled={loading}
          style={[
            styles.authButton,
            { backgroundColor: colors.surface, borderColor: colors.border, borderWidth: 1 },
          ]}
          accessibilityRole="button"
          accessibilityLabel="Continue with Google"
        >
          <TempoText variant="body" color={colors.ink} style={styles.buttonText}>
            Continue with Google
          </TempoText>
        </Pressable>

        {error && (
          <TempoText variant="caption" color={colors.danger} style={styles.error}>
            {error}
          </TempoText>
        )}

        <TempoText variant="data" color={colors.ink3} style={styles.privacy}>
          Your data is yours. Stored per-account. We never sell or share it.
        </TempoText>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'space-between',
    paddingHorizontal: spacing.xl,
    paddingBottom: spacing['3xl'],
  },
  top: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    textAlign: 'center',
  },
  subtitle: {
    textAlign: 'center',
    marginTop: spacing.md,
  },
  buttons: {
    gap: spacing.md,
  },
  authButton: {
    paddingVertical: spacing.base,
    borderRadius: 12,
    alignItems: 'center',
  },
  buttonText: {
    fontWeight: '500',
  },
  error: {
    textAlign: 'center',
  },
  privacy: {
    textAlign: 'center',
    marginTop: spacing.md,
    lineHeight: 16,
  },
});
