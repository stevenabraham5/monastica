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
import { TempoText } from '../../components/TempoText';
import { useColors } from '../../constants/colors';
import { spacing } from '../../constants/spacing';
import { TEMPO_EASING, duration } from '../../constants/motion';
import { useLifeModel } from '../../store/lifeModel';
import { useAgentStore } from '../../store/agentStore';

type Act = 1 | 2 | 3;

const ACT1_QUESTIONS = [
  'What\u2019s one thing you want to be able to say you did this year \u2014 that you haven\u2019t started yet?',
  'Who in your life makes you better? Name two people.',
  'What does a good week feel like for you \u2014 in your own words?',
];

export default function OnboardingScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const addRelationship = useLifeModel((s) => s.addRelationship);
  const completeOnboarding = useAgentStore((s) => s.completeOnboarding);

  const [act, setAct] = useState<Act>(1);
  const [questionIndex, setQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<string[]>([]);
  const [currentAnswer, setCurrentAnswer] = useState('');

  // Fade animation
  const fade = useSharedValue(0);
  useEffect(() => {
    fade.value = 0;
    fade.value = withTiming(1, { duration: duration.elementEnter, easing: TEMPO_EASING });
  }, [act, questionIndex]);

  const fadeStyle = useAnimatedStyle(() => ({
    opacity: fade.value,
  }));

  // Act 1 — three questions one at a time
  const handleSubmitAnswer = () => {
    const text = currentAnswer.trim();
    if (!text) return;

    const nextAnswers = [...answers, text];
    setAnswers(nextAnswers);
    setCurrentAnswer('');

    if (questionIndex < ACT1_QUESTIONS.length - 1) {
      setQuestionIndex(questionIndex + 1);
    } else {
      setAct(2);
    }
  };

  // Act 2 — reflection, simple confirm
  const handleConfirmModel = () => {
    // Parse people from answer 2 (rough extraction)
    const peopleAnswer = answers[1] ?? '';
    const names = peopleAnswer
      .split(/,|and|\n/)
      .map((n) => n.trim())
      .filter(Boolean)
      .slice(0, 2);

    names.forEach((name, i) => {
      addRelationship({
        id: `onb-${i}`,
        name,
        role: 'important',
        targetFrequencyDays: 14,
        lastContactDate: null,
        relationshipTier: 'critical',
      });
    });

    setAct(3);
  };

  // Act 3 — handoff
  const handleComplete = () => {
    completeOnboarding();
    router.replace('/(tabs)');
  };

  return (
    <KeyboardAvoidingView
      style={[styles.container, { backgroundColor: colors.ground }]}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <View style={[styles.inner, { paddingTop: insets.top + spacing['3xl'] }]}>
        {/* Act 1 */}
        {act === 1 && (
          <Animated.View style={[styles.center, fadeStyle]}>
            <TempoText variant="display-lg" italic style={styles.question}>
              {ACT1_QUESTIONS[questionIndex]}
            </TempoText>
            <TextInput
              value={currentAnswer}
              onChangeText={setCurrentAnswer}
              onSubmitEditing={handleSubmitAnswer}
              style={[styles.input, { color: colors.ink }]}
              placeholderTextColor={colors.ink3}
              placeholder=""
              multiline
              autoFocus
              blurOnSubmit={false}
              returnKeyType="done"
            />
            <Pressable
              onPress={handleSubmitAnswer}
              style={[styles.nextButton, { opacity: currentAnswer.trim() ? 1 : 0.3 }]}
              accessibilityRole="button"
              accessibilityLabel="Continue"
              disabled={!currentAnswer.trim()}
            >
              <TempoText variant="caption" color={colors.accent}>
                Continue
              </TempoText>
            </Pressable>

            {/* Dots — no percentages, no "step 2 of 3" */}
            <View style={styles.dotsRow}>
              {ACT1_QUESTIONS.map((_, i) => (
                <View
                  key={i}
                  style={[
                    styles.dot,
                    {
                      backgroundColor: i <= questionIndex ? colors.accent : colors.border,
                    },
                  ]}
                />
              ))}
            </View>
          </Animated.View>
        )}

        {/* Act 2 — Reflection */}
        {act === 2 && (
          <Animated.View style={[styles.center, fadeStyle]}>
            <TempoText variant="display-lg" italic style={styles.question}>
              Here{'\u2019'}s what I heard. Tell me what feels right.
            </TempoText>

            {answers.map((a, i) => (
              <View key={i} style={[styles.reflectionCard, { backgroundColor: colors.surface }]}>
                <TempoText variant="data" color={colors.ink3} style={styles.reflectionLabel}>
                  {i === 0 ? 'AMBITION' : i === 1 ? 'PEOPLE' : 'GOOD WEEK'}
                </TempoText>
                <TempoText variant="body" color={colors.ink}>
                  {a}
                </TempoText>
              </View>
            ))}

            <Pressable
              onPress={handleConfirmModel}
              style={[styles.confirmButton, { backgroundColor: colors.accent }]}
              accessibilityRole="button"
              accessibilityLabel="This feels right"
            >
              <TempoText variant="caption" color="#FFFFFF">
                This feels right
              </TempoText>
            </Pressable>
          </Animated.View>
        )}

        {/* Act 3 — Handoff */}
        {act === 3 && (
          <Animated.View style={[styles.center, fadeStyle]}>
            <TempoText variant="display-lg" italic style={styles.question}>
              I{'\u2019'}ll start protecting your time now.{'\n'}
              You won{'\u2019'}t notice most of what I do {'\u2014'} that{'\u2019'}s the point.
            </TempoText>

            <View style={styles.agentIndicators}>
              <View style={[styles.agentDot, { backgroundColor: colors.agent }]}>
                <TempoText variant="data" color="#FFFFFF">S</TempoText>
              </View>
              <View style={[styles.agentDot, { backgroundColor: colors.accent }]}>
                <TempoText variant="data" color="#FFFFFF">C</TempoText>
              </View>
            </View>
            <TempoText variant="data" color={colors.ink3} style={styles.agentLabel}>
              Sentinel + Cultivator active
            </TempoText>

            <Pressable
              onPress={handleComplete}
              style={[styles.confirmButton, { backgroundColor: colors.accent, marginTop: spacing['2xl'] }]}
              accessibilityRole="button"
              accessibilityLabel="Begin"
            >
              <TempoText variant="caption" color="#FFFFFF">
                Begin
              </TempoText>
            </Pressable>
          </Animated.View>
        )}
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  inner: {
    flex: 1,
    paddingHorizontal: spacing.xl,
  },
  center: {
    flex: 1,
    justifyContent: 'center',
  },
  question: {
    textAlign: 'center',
    lineHeight: 32,
    marginBottom: spacing['2xl'],
  },
  input: {
    fontFamily: 'DMSans_300Light',
    fontSize: 15,
    textAlign: 'center',
    minHeight: 40,
    maxHeight: 120,
  },
  nextButton: {
    alignSelf: 'center',
    paddingVertical: spacing.md,
    marginTop: spacing.xl,
  },
  dotsRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: spacing.sm,
    position: 'absolute',
    bottom: 60,
    left: 0,
    right: 0,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  reflectionCard: {
    borderRadius: 12,
    padding: spacing.base,
    marginBottom: spacing.md,
  },
  reflectionLabel: {
    marginBottom: spacing.xs,
  },
  confirmButton: {
    alignSelf: 'center',
    paddingHorizontal: spacing['2xl'],
    paddingVertical: spacing.base,
    borderRadius: 24,
    marginTop: spacing.xl,
  },
  agentIndicators: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: spacing.md,
    marginTop: spacing.xl,
  },
  agentDot: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  agentLabel: {
    textAlign: 'center',
    marginTop: spacing.sm,
  },
});
