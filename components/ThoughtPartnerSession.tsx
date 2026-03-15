import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  View,
  TextInput,
  Pressable,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  Alert,
  ScrollView,
} from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withSequence,
  withDelay,
  withTiming,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { TempoText } from './TempoText';
import { useColors } from '../constants/colors';
import { spacing } from '../constants/spacing';
import { TEMPO_EASING, duration } from '../constants/motion';

interface Props {
  triggerGoalId?: string;
  sessionType: 'goal_drift' | 'weekly_reflection' | 'open' | 'pre_event_prep';
  onComplete: (sessionSummary: string) => void;
  openingLine?: string;
}

// Thinking dots component
function ThinkingDots() {
  const colors = useColors();
  const dot1 = useSharedValue(0);
  const dot2 = useSharedValue(0);
  const dot3 = useSharedValue(0);

  useEffect(() => {
    dot1.value = withRepeat(
      withSequence(
        withTiming(1, { duration: 300 }),
        withTiming(0.3, { duration: 300 }),
      ),
      -1,
      true,
    );
    dot2.value = withDelay(
      200,
      withRepeat(
        withSequence(
          withTiming(1, { duration: 300 }),
          withTiming(0.3, { duration: 300 }),
        ),
        -1,
        true,
      ),
    );
    dot3.value = withDelay(
      400,
      withRepeat(
        withSequence(
          withTiming(1, { duration: 300 }),
          withTiming(0.3, { duration: 300 }),
        ),
        -1,
        true,
      ),
    );
  }, [dot1, dot2, dot3]);

  const s1 = useAnimatedStyle(() => ({ opacity: dot1.value }));
  const s2 = useAnimatedStyle(() => ({ opacity: dot2.value }));
  const s3 = useAnimatedStyle(() => ({ opacity: dot3.value }));

  return (
    <View style={styles.dotsRow}>
      <Animated.Text style={[styles.dot, { color: colors.ink2 }, s1]}>{'\u00B7'}</Animated.Text>
      <Animated.Text style={[styles.dot, { color: colors.ink2 }, s2]}>{'\u00B7'}</Animated.Text>
      <Animated.Text style={[styles.dot, { color: colors.ink2 }, s3]}>{'\u00B7'}</Animated.Text>
    </View>
  );
}

const DEFAULT_OPENINGS: Record<string, string> = {
  goal_drift: 'One of your goals has drifted. Let\u2019s think through why.',
  weekly_reflection: 'Let\u2019s look at this week together.',
  open: 'What\u2019s on your mind?',
  pre_event_prep: 'You have something important coming up. Let\u2019s prepare.',
};

interface Message {
  id: string;
  role: 'tempo' | 'user';
  text: string;
}

export function ThoughtPartnerSession({
  triggerGoalId,
  sessionType,
  onComplete,
  openingLine,
}: Props) {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [thinking, setThinking] = useState(false);
  const [sessionDone, setSessionDone] = useState(false);
  const scrollRef = useRef<ScrollView>(null);
  const lastReturnRef = useRef(false);

  // Opening line
  useEffect(() => {
    const opening = openingLine ?? DEFAULT_OPENINGS[sessionType] ?? DEFAULT_OPENINGS.open;
    setMessages([{ id: 'opening', role: 'tempo', text: opening }]);
  }, [sessionType, openingLine]);

  // Submit on double return
  const handleKeyPress = useCallback(
    (e: { nativeEvent: { key: string } }) => {
      if (e.nativeEvent.key === 'Enter') {
        if (lastReturnRef.current && input.trim()) {
          handleSubmit();
          lastReturnRef.current = false;
          return;
        }
        lastReturnRef.current = true;
      } else {
        lastReturnRef.current = false;
      }
    },
    [input],
  );

  const handleSubmit = () => {
    const text = input.trim();
    if (!text) return;

    const userMsg: Message = {
      id: `u-${Date.now()}`,
      role: 'user',
      text,
    };
    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setThinking(true);

    // Simulated Tempo response (would be LLM in production)
    setTimeout(() => {
      setThinking(false);
      const tempoMsg: Message = {
        id: `t-${Date.now()}`,
        role: 'tempo',
        text: 'Tell me more about that. What would change if you gave this the attention it\u2019s asking for?',
      };
      setMessages((prev) => [...prev, tempoMsg]);
    }, 1500);
  };

  const handleExit = () => {
    if (!sessionDone && messages.length > 2) {
      Alert.alert(
        'Are you sure?',
        'We\u2019re mid-thought.',
        [
          { text: 'Stay', style: 'cancel' },
          {
            text: 'Leave',
            onPress: () => onComplete(buildSummary()),
          },
        ],
      );
    } else {
      onComplete(buildSummary());
    }
  };

  const buildSummary = () => {
    return messages
      .filter((m) => m.role === 'user')
      .map((m) => m.text)
      .join(' | ');
  };

  return (
    <KeyboardAvoidingView
      style={[styles.container, { backgroundColor: colors.ground }]}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      {/* Header with exit */}
      <View style={[styles.header, { paddingTop: insets.top + spacing.md }]}>
        <Pressable onPress={handleExit} accessibilityRole="button" accessibilityLabel="Close session">
          <TempoText variant="caption" color={colors.ink3}>Close</TempoText>
        </Pressable>
      </View>

      {/* Messages */}
      <ScrollView
        ref={scrollRef}
        style={styles.messageArea}
        contentContainerStyle={styles.messageContent}
        showsVerticalScrollIndicator={false}
        onContentSizeChange={() => scrollRef.current?.scrollToEnd({ animated: true })}
      >
        {messages.map((msg) => (
          <View key={msg.id} style={msg.role === 'tempo' ? styles.tempoMessage : styles.userMessage}>
            <TempoText
              variant={msg.role === 'tempo' ? 'body' : 'body'}
              italic={msg.role === 'tempo'}
              color={msg.role === 'tempo' ? colors.ink : colors.ink}
              style={msg.role === 'tempo' ? styles.tempoText : styles.userText}
            >
              {msg.text}
            </TempoText>
          </View>
        ))}
        {thinking && <ThinkingDots />}
      </ScrollView>

      {/* Input */}
      <View style={[styles.inputArea, { paddingBottom: insets.bottom + spacing.md }]}>
        <TextInput
          value={input}
          onChangeText={setInput}
          onKeyPress={handleKeyPress}
          onSubmitEditing={handleSubmit}
          style={[styles.input, { color: colors.ink }]}
          placeholder="Double-return to send..."
          placeholderTextColor={colors.ink3}
          multiline
          blurOnSubmit={false}
        />
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingHorizontal: spacing.xl,
    paddingBottom: spacing.md,
    alignItems: 'flex-end',
  },
  messageArea: {
    flex: 1,
  },
  messageContent: {
    paddingHorizontal: spacing.xl,
    paddingBottom: spacing.xl,
  },
  tempoMessage: {
    marginBottom: spacing.xl,
    alignItems: 'center',
  },
  tempoText: {
    textAlign: 'center',
    lineHeight: 28,
    fontSize: 22,
  },
  userMessage: {
    marginBottom: spacing.xl,
  },
  userText: {
    lineHeight: 22,
  },
  inputArea: {
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.md,
  },
  input: {
    fontFamily: 'DMSans_300Light',
    fontSize: 15,
    minHeight: 40,
    maxHeight: 120,
  },
  dotsRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 4,
    paddingVertical: spacing.md,
  },
  dot: {
    fontFamily: 'DMSans_400Regular',
    fontSize: 24,
  },
});
