import React, { useState } from 'react';
import { View, StyleSheet, Pressable, Modal, TextInput } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { TempoText } from './TempoText';
import { useColors } from '../constants/colors';
import { spacing } from '../constants/spacing';
import { useDogfoodStore, FeedbackType } from '../store/dogfoodStore';

const FEEDBACK_TYPES: { key: FeedbackType; label: string }[] = [
  { key: 'suggestion', label: 'Feature idea' },
  { key: 'bug', label: 'Something broken' },
  { key: 'rating', label: 'Rate this screen' },
  { key: 'general', label: 'General thought' },
];

interface DogfoodOverlayProps {
  screenName: string;
}

export function DogfoodOverlay({ screenName }: DogfoodOverlayProps) {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { enabled, addFeedback, sendAll, entries } = useDogfoodStore();
  const [open, setOpen] = useState(false);
  const [type, setType] = useState<FeedbackType>('suggestion');
  const [text, setText] = useState('');
  const [rating, setRating] = useState(0);
  const [submitted, setSubmitted] = useState(false);

  if (!enabled) return null;

  const unsentCount = entries.filter((e) => !e.sent).length;

  const handleSubmit = () => {
    if (!text.trim() && type !== 'rating') return;
    addFeedback({
      type,
      screen: screenName,
      text: text.trim() || (type === 'rating' ? `Rated ${rating}/5` : ''),
      rating: type === 'rating' ? rating : undefined,
    });
    setSubmitted(true);
    setTimeout(() => {
      setOpen(false);
      setSubmitted(false);
      setText('');
      setRating(0);
    }, 800);
  };

  return (
    <>
      {/* Floating flag button */}
      <Pressable
        onPress={() => setOpen(true)}
        style={[
          styles.fab,
          {
            backgroundColor: colors.warning,
            bottom: insets.bottom + 64,
          },
        ]}
        accessibilityLabel="Send feedback"
        accessibilityRole="button"
      >
        <TempoText variant="caption" color="#FFFFFF" style={styles.fabText}>
          {unsentCount > 0 ? `${unsentCount}` : '\u2691'}
        </TempoText>
      </Pressable>

      {/* Feedback modal */}
      <Modal visible={open} transparent animationType="fade">
        <Pressable style={styles.backdrop} onPress={() => setOpen(false)}>
          <Pressable
            style={[styles.sheet, { backgroundColor: colors.ground }]}
            onPress={() => {}} // prevent backdrop close
          >
            {submitted ? (
              <View style={styles.successContainer}>
                <TempoText variant="heading" style={styles.centerText}>
                  Noted.
                </TempoText>
              </View>
            ) : (
              <>
                <TempoText variant="heading">Feedback</TempoText>
                <TempoText variant="caption" color={colors.ink3}>
                  You're looking at: {screenName}
                </TempoText>

                {/* Type selector */}
                <View style={styles.typeRow}>
                  {FEEDBACK_TYPES.map((ft) => (
                    <Pressable
                      key={ft.key}
                      onPress={() => setType(ft.key)}
                      style={[
                        styles.typeChip,
                        {
                          backgroundColor:
                            type === ft.key ? colors.accent : colors.surface,
                          borderColor:
                            type === ft.key ? colors.accent : colors.border,
                        },
                      ]}
                    >
                      <TempoText
                        variant="caption"
                        color={type === ft.key ? '#FFFFFF' : colors.ink2}
                      >
                        {ft.label}
                      </TempoText>
                    </Pressable>
                  ))}
                </View>

                {/* Rating row (only for rating type) */}
                {type === 'rating' && (
                  <View style={styles.ratingRow}>
                    {[1, 2, 3, 4, 5].map((n) => (
                      <Pressable
                        key={n}
                        onPress={() => setRating(n)}
                        style={[
                          styles.ratingDot,
                          {
                            backgroundColor:
                              n <= rating ? colors.accent : colors.border,
                          },
                        ]}
                      >
                        <TempoText
                          variant="caption"
                          color={n <= rating ? '#FFFFFF' : colors.ink3}
                        >
                          {n}
                        </TempoText>
                      </Pressable>
                    ))}
                  </View>
                )}

                {/* Text input */}
                <TextInput
                  style={[
                    styles.input,
                    {
                      color: colors.ink,
                      backgroundColor: colors.surface,
                      borderColor: colors.border,
                    },
                  ]}
                  placeholder={
                    type === 'suggestion'
                      ? 'What would make this better?'
                      : type === 'bug'
                        ? 'What went wrong?'
                        : type === 'rating'
                          ? 'Any details? (optional)'
                          : 'What are you thinking?'
                  }
                  placeholderTextColor={colors.ink3}
                  multiline
                  value={text}
                  onChangeText={setText}
                  textAlignVertical="top"
                />

                {/* Actions */}
                <View style={styles.actions}>
                  <Pressable
                    onPress={() => setOpen(false)}
                    style={[styles.actionButton, { borderColor: colors.border }]}
                  >
                    <TempoText variant="caption" color={colors.ink2}>
                      Cancel
                    </TempoText>
                  </Pressable>
                  <Pressable
                    onPress={handleSubmit}
                    style={[
                      styles.actionButton,
                      { backgroundColor: colors.accent, borderColor: colors.accent },
                    ]}
                  >
                    <TempoText variant="caption" color="#FFFFFF">
                      Submit
                    </TempoText>
                  </Pressable>
                </View>

                {/* Send all unsent */}
                {unsentCount > 0 && (
                  <Pressable onPress={sendAll} style={styles.sendAll}>
                    <TempoText variant="caption" color={colors.accent}>
                      Send all {unsentCount} unsent items via email
                    </TempoText>
                  </Pressable>
                )}
              </>
            )}
          </Pressable>
        </Pressable>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  fab: {
    position: 'absolute',
    right: 16,
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
  },
  fabText: {
    fontWeight: '700',
    fontSize: 16,
  },
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'flex-end',
  },
  sheet: {
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: spacing.xl,
    gap: spacing.base,
    maxHeight: '80%',
  },
  typeRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    marginTop: spacing.sm,
  },
  typeChip: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: 16,
    borderWidth: 1,
  },
  ratingRow: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  ratingDot: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  input: {
    minHeight: 80,
    borderRadius: 12,
    borderWidth: 1,
    padding: spacing.base,
    fontSize: 15,
    lineHeight: 22,
  },
  actions: {
    flexDirection: 'row',
    gap: spacing.sm,
    justifyContent: 'flex-end',
  },
  actionButton: {
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.md,
    borderRadius: 12,
    borderWidth: 1,
  },
  sendAll: {
    alignItems: 'center',
    paddingVertical: spacing.sm,
  },
  successContainer: {
    paddingVertical: spacing['2xl'],
    alignItems: 'center',
  },
  centerText: {
    textAlign: 'center',
  },
});
