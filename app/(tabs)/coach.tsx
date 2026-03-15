import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  Pressable,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { TempoText } from '../../components/TempoText';
import { TempoInput } from '../../components/TempoInput';
import { EnterView } from '../../components/EnterView';
import { useColors } from '../../constants/colors';
import { spacing } from '../../constants/spacing';
import { useCoachStore, CoachMessage } from '../../store/coachStore';

function MessageBubble({ msg }: { msg: CoachMessage }) {
  const colors = useColors();
  const isCoach = msg.role === 'coach';

  return (
    <View
      style={[
        styles.bubble,
        isCoach
          ? [styles.coachBubble, { backgroundColor: colors.surface, borderColor: colors.border }]
          : [styles.userBubble, { backgroundColor: colors.accent }],
      ]}
    >
      <TempoText
        variant="body"
        color={isCoach ? colors.ink : '#FFFFFF'}
        style={styles.bubbleText}
      >
        {msg.text}
      </TempoText>
    </View>
  );
}

export default function CoachScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const [text, setText] = useState('');
  const scrollRef = useRef<ScrollView>(null);
  const { messages, isThinking, sendMessage, clearConversation } = useCoachStore();

  const handleSend = (content: string) => {
    if (!content.trim()) return;
    sendMessage(content);
    setText('');
  };

  useEffect(() => {
    // Scroll to bottom when messages change
    setTimeout(() => scrollRef.current?.scrollToEnd({ animated: true }), 100);
  }, [messages.length]);

  return (
    <KeyboardAvoidingView
      style={[styles.container, { backgroundColor: colors.ground }]}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={insets.bottom + 52}
    >
      <StatusBar style="dark" />

      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top + spacing.md }]}>
        <View style={styles.headerLeft}>
          <TempoText variant="heading">Coach</TempoText>
          <TempoText variant="caption" color={colors.ink3}>
            Private. Encrypted. Yours.
          </TempoText>
        </View>
        <Pressable
          onPress={clearConversation}
          style={[styles.clearButton, { borderColor: colors.border }]}
          accessibilityLabel="Clear conversation"
          accessibilityRole="button"
        >
          <TempoText variant="caption" color={colors.ink3}>
            Clear
          </TempoText>
        </Pressable>
      </View>

      {/* Messages */}
      <ScrollView
        ref={scrollRef}
        style={styles.messageList}
        contentContainerStyle={styles.messageContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {messages.map((msg) => (
          <MessageBubble key={msg.id} msg={msg} />
        ))}
        {isThinking && (
          <View style={[styles.bubble, styles.coachBubble, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <TempoText variant="caption" color={colors.ink3}>
              ...
            </TempoText>
          </View>
        )}
      </ScrollView>

      {/* Input bar */}
      <View
        style={[
          styles.inputBar,
          {
            backgroundColor: colors.ground,
            borderTopColor: colors.border,
            paddingBottom: insets.bottom > 0 ? insets.bottom : spacing.md,
          },
        ]}
      >
        <TempoInput
          variant="body"
          placeholder="Say something..."
          value={text}
          onChangeText={setText}
          onSubmit={handleSend}
          style={styles.input}
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
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.xl,
    paddingBottom: spacing.md,
  },
  headerLeft: {
    gap: 2,
  },
  clearButton: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: 12,
    borderWidth: 1,
  },
  messageList: {
    flex: 1,
  },
  messageContent: {
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.md,
    paddingBottom: spacing.base,
    gap: spacing.md,
  },
  bubble: {
    maxWidth: '80%',
    paddingHorizontal: spacing.base,
    paddingVertical: spacing.md,
    borderRadius: 16,
  },
  coachBubble: {
    alignSelf: 'flex-start',
    borderWidth: StyleSheet.hairlineWidth,
    borderBottomLeftRadius: 4,
  },
  userBubble: {
    alignSelf: 'flex-end',
    borderBottomRightRadius: 4,
  },
  bubbleText: {
    lineHeight: 22,
  },
  inputBar: {
    paddingTop: spacing.md,
    paddingHorizontal: spacing.xl,
    borderTopWidth: StyleSheet.hairlineWidth,
  },
  input: {
    maxHeight: 100,
  },
});
