import React, { useState, useCallback, useRef, useEffect } from 'react';
import { View, StyleSheet, Pressable, KeyboardAvoidingView, Platform } from 'react-native';
import { BottomSheetScrollView, BottomSheetTextInput } from '@gorhom/bottom-sheet';
import { TempoText } from './TempoText';
import { EnterView } from './EnterView';
import { useColors } from '../constants/colors';
import { spacing } from '../constants/spacing';
import { fontFamilies } from '../constants/typography';

// Simulated Tempo responses for demo
const TEMPO_RESPONSES = [
  "That's interesting. Tell me more about what's driving that feeling.",
  "I hear you. It sounds like this matters deeply. Should we shape this into a goal?",
  "What would it look like if you gave this the time it deserves?",
  "Let's be honest — is this something you want, or something you feel you should want?",
];

interface Message {
  id: string;
  text: string;
  from: 'user' | 'tempo';
}

export function BrainstormContent() {
  const colors = useColors();
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const responseIndex = useRef(0);

  const sendMessage = useCallback(() => {
    const trimmed = inputText.trim();
    if (!trimmed || isTyping) return;

    const userMsg: Message = {
      id: `u-${Date.now()}`,
      text: trimmed,
      from: 'user',
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputText('');
    setIsTyping(true);

    // Simulate Tempo response with delay
    const responseText =
      TEMPO_RESPONSES[responseIndex.current % TEMPO_RESPONSES.length];
    responseIndex.current++;

    setTimeout(() => {
      const tempoMsg: Message = {
        id: `t-${Date.now()}`,
        text: responseText,
        from: 'tempo',
      };
      setMessages((prev) => [...prev, tempoMsg]);
      setIsTyping(false);
    }, 1200);
  }, [inputText, isTyping]);

  return (
    <View style={styles.container}>
      <BottomSheetScrollView
        contentContainerStyle={styles.messagesContainer}
        keyboardShouldPersistTaps="handled"
      >
        {messages.length === 0 && (
          <EnterView style={styles.emptyState}>
            <TempoText variant="caption" color={colors.ink3} style={styles.emptyText}>
              This is a space to think out loud. Tempo listens, then helps you shape what matters into goals.
            </TempoText>
          </EnterView>
        )}

        {messages.map((msg) => (
          <EnterView key={msg.id} distance={8}>
            <View
              style={[
                styles.messageBubble,
                msg.from === 'user'
                  ? { alignSelf: 'flex-end', backgroundColor: colors.accentLight }
                  : { alignSelf: 'flex-start' },
              ]}
            >
              <TempoText
                variant="body"
                color={msg.from === 'user' ? colors.ink : colors.ink2}
              >
                {msg.text}
              </TempoText>
            </View>
          </EnterView>
        ))}

        {isTyping && (
          <View style={styles.typingIndicator}>
            <TempoText variant="caption" color={colors.ink3}>
              Tempo is thinking...
            </TempoText>
          </View>
        )}
      </BottomSheetScrollView>

      {/* Input area */}
      <View style={[styles.inputRow, { borderTopColor: colors.border }]}>
        <BottomSheetTextInput
          style={[
            styles.input,
            {
              color: colors.ink,
              fontFamily: fontFamilies.displayItalic,
            },
          ]}
          placeholder="What's been on your mind lately?"
          placeholderTextColor={colors.ink3}
          value={inputText}
          onChangeText={setInputText}
          onSubmitEditing={sendMessage}
          returnKeyType="send"
          multiline={false}
          accessibilityLabel="Brainstorm input"
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  messagesContainer: {
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.base,
    paddingBottom: spacing.md,
    gap: spacing.md,
  },
  emptyState: {
    paddingVertical: spacing['3xl'],
    alignItems: 'center',
  },
  emptyText: {
    textAlign: 'center',
    maxWidth: 280,
  },
  messageBubble: {
    maxWidth: '80%',
    paddingHorizontal: spacing.base,
    paddingVertical: spacing.md,
    borderRadius: 16,
  },
  typingIndicator: {
    paddingVertical: spacing.sm,
  },
  inputRow: {
    borderTopWidth: StyleSheet.hairlineWidth,
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.md,
  },
  input: {
    fontSize: 20,
    lineHeight: 28,
    minHeight: 44,
  },
});
