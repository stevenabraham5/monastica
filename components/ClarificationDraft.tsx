import React, { useState } from 'react';
import { View, TextInput, Pressable, StyleSheet } from 'react-native';
import { TempoText } from './TempoText';
import { useColors } from '../constants/colors';
import { spacing } from '../constants/spacing';
import { SENTINEL_CLOSING } from '../constants/questionBank';

interface Props {
  questions: string[];
  recipientName: string;
  meetingTitle: string;
  onSend: (editedQuestions: string[]) => void;
  onDeclineInstead: () => void;
}

export function ClarificationDraft({
  questions,
  recipientName,
  meetingTitle,
  onSend,
  onDeclineInstead,
}: Props) {
  const colors = useColors();
  const [edited, setEdited] = useState<string[]>([...questions]);

  const updateQuestion = (index: number, text: string) => {
    const next = [...edited];
    next[index] = text;
    setEdited(next);
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.surface }]}>
      <TempoText variant="subheading" style={styles.heading}>
        Questions for {recipientName}
      </TempoText>
      <TempoText variant="data" color={colors.ink3} style={styles.subtitle}>
        Re: {meetingTitle}
      </TempoText>

      {edited.map((q, i) => (
        <View key={i} style={styles.questionBlock}>
          <TextInput
            value={q}
            onChangeText={(text) => updateQuestion(i, text)}
            style={[
              styles.questionInput,
              { color: colors.ink, borderColor: colors.border },
            ]}
            multiline
            placeholderTextColor={colors.ink3}
          />
          <TempoText variant="data" color={colors.ink3} style={styles.toneNote}>
            Warm {'\u00B7'} Non-confrontational
          </TempoText>
        </View>
      ))}

      {/* Closing line */}
      <TempoText variant="data" color={colors.ink3} italic style={styles.closing}>
        {SENTINEL_CLOSING}
      </TempoText>

      {/* Actions */}
      <View style={styles.actions}>
        <Pressable
          onPress={() => onSend(edited)}
          style={[styles.sendButton, { backgroundColor: colors.agent }]}
          accessibilityRole="button"
          accessibilityLabel={`Send questions to ${recipientName}`}
        >
          <TempoText variant="caption" color="#FFFFFF">
            Send to {recipientName}
          </TempoText>
        </Pressable>
        <Pressable
          onPress={onDeclineInstead}
          style={styles.declineButton}
          accessibilityRole="button"
          accessibilityLabel="Decline instead"
        >
          <TempoText variant="caption" color={colors.danger}>
            Decline instead
          </TempoText>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: 12,
    padding: spacing.base,
  },
  heading: {
    marginBottom: spacing.xs,
  },
  subtitle: {
    marginBottom: spacing.xl,
  },
  questionBlock: {
    marginBottom: spacing.base,
  },
  questionInput: {
    fontFamily: 'DMSans_300Light',
    fontSize: 15,
    borderWidth: StyleSheet.hairlineWidth,
    borderRadius: 8,
    padding: spacing.md,
    minHeight: 60,
    textAlignVertical: 'top',
  },
  toneNote: {
    marginTop: spacing.xs,
  },
  closing: {
    marginTop: spacing.md,
    marginBottom: spacing.xl,
  },
  actions: {
    gap: spacing.md,
  },
  sendButton: {
    paddingVertical: spacing.base,
    borderRadius: 16,
    alignItems: 'center',
  },
  declineButton: {
    alignItems: 'center',
    paddingVertical: spacing.sm,
  },
});
