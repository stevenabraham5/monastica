import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  StyleSheet,
  Pressable,
  Modal,
  TextInput,
  FlatList,
  Keyboard,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { TempoText } from './TempoText';
import { useColors } from '../constants/colors';
import { spacing } from '../constants/spacing';
import { useIdeasStore, Idea } from '../store/ideasStore';

export function QuickCapture() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { ideas, add, remove } = useIdeasStore();
  const [open, setOpen] = useState(false);
  const [text, setText] = useState('');
  const inputRef = useRef<TextInput>(null);

  useEffect(() => {
    if (open) {
      setTimeout(() => inputRef.current?.focus(), 200);
    }
  }, [open]);

  const handleSubmit = () => {
    if (!text.trim()) return;
    add(text);
    setText('');
    // Keep open for rapid captures
  };

  const handleClose = () => {
    setOpen(false);
    setText('');
    Keyboard.dismiss();
  };

  const timeAgo = (ts: number) => {
    const mins = Math.floor((Date.now() - ts) / 60000);
    if (mins < 1) return 'just now';
    if (mins < 60) return `${mins}m ago`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs}h ago`;
    return `${Math.floor(hrs / 24)}d ago`;
  };

  return (
    <>
      {/* Floating capture button — always visible */}
      <Pressable
        onPress={() => setOpen(true)}
        style={[
          styles.fab,
          {
            backgroundColor: colors.ink,
            bottom: insets.bottom + 64,
          },
        ]}
        accessibilityLabel="Capture an idea"
        accessibilityRole="button"
      >
        <TempoText variant="caption" color={colors.ground} style={styles.fabIcon}>
          +
        </TempoText>
      </Pressable>

      {/* Capture sheet */}
      <Modal visible={open} transparent animationType="fade">
        <Pressable style={styles.backdrop} onPress={handleClose}>
          <Pressable
            style={[styles.sheet, { backgroundColor: colors.ground }]}
            onPress={() => {}}
          >
            {/* Input area */}
            <View style={styles.inputRow}>
              <TextInput
                ref={inputRef}
                style={[
                  styles.input,
                  {
                    color: colors.ink,
                    backgroundColor: colors.surface,
                    borderColor: colors.border,
                  },
                ]}
                placeholder="Stash an idea..."
                placeholderTextColor={colors.ink3}
                value={text}
                onChangeText={setText}
                onSubmitEditing={handleSubmit}
                returnKeyType="done"
                multiline
                blurOnSubmit
              />
              <Pressable
                onPress={handleSubmit}
                style={[
                  styles.captureButton,
                  {
                    backgroundColor: text.trim() ? colors.accent : colors.border,
                  },
                ]}
                accessibilityLabel="Save idea"
              >
                <TempoText
                  variant="caption"
                  color={text.trim() ? '#FFFFFF' : colors.ink3}
                  style={styles.captureIcon}
                >
                  {'\u2193'}
                </TempoText>
              </Pressable>
            </View>

            {/* Stashed ideas */}
            {ideas.length > 0 && (
              <View style={styles.listSection}>
                <TempoText variant="label" color={colors.ink3} style={styles.listLabel}>
                  STASHED ({ideas.length})
                </TempoText>
                <FlatList
                  data={ideas}
                  keyExtractor={(item) => item.id}
                  style={styles.list}
                  renderItem={({ item }) => (
                    <View
                      style={[
                        styles.ideaRow,
                        { borderBottomColor: colors.border },
                      ]}
                    >
                      <View style={styles.ideaContent}>
                        <TempoText variant="body" color={colors.ink}>
                          {item.text}
                        </TempoText>
                        <TempoText variant="data" color={colors.ink3}>
                          {timeAgo(item.timestamp)}
                        </TempoText>
                      </View>
                      <Pressable
                        onPress={() => remove(item.id)}
                        style={styles.deleteButton}
                        accessibilityLabel="Remove idea"
                      >
                        <TempoText variant="caption" color={colors.ink3}>
                          {'\u00D7'}
                        </TempoText>
                      </Pressable>
                    </View>
                  )}
                />
              </View>
            )}

            {/* Close */}
            <Pressable onPress={handleClose} style={styles.closeRow}>
              <TempoText variant="caption" color={colors.ink3}>
                Done
              </TempoText>
            </Pressable>
          </Pressable>
        </Pressable>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  fab: {
    position: 'absolute',
    left: 16,
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
  fabIcon: {
    fontSize: 20,
    fontWeight: '300',
    lineHeight: 22,
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
    maxHeight: '70%',
  },
  inputRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    alignItems: 'flex-end',
  },
  input: {
    flex: 1,
    minHeight: 44,
    maxHeight: 100,
    borderRadius: 12,
    borderWidth: 1,
    paddingHorizontal: spacing.base,
    paddingVertical: spacing.md,
    fontSize: 15,
    lineHeight: 22,
  },
  captureButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  captureIcon: {
    fontSize: 18,
    fontWeight: '600',
  },
  listSection: {
    marginTop: spacing.xl,
  },
  listLabel: {
    marginBottom: spacing.sm,
  },
  list: {
    maxHeight: 240,
  },
  ideaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.md,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  ideaContent: {
    flex: 1,
    gap: 2,
  },
  deleteButton: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  closeRow: {
    alignItems: 'center',
    paddingTop: spacing.base,
  },
});
