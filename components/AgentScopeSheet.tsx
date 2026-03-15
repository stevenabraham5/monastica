import React, { useState } from 'react';
import { View, Pressable, TextInput, StyleSheet, ScrollView } from 'react-native';
import { TempoText } from './TempoText';
import { useColors } from '../constants/colors';
import { spacing } from '../constants/spacing';
import type { Escalation, AgentScopeCard } from '../store/types';

interface Props {
  escalation: Escalation;
  onConfirm: (scopeCard: AgentScopeCard) => void;
  onCancel: () => void;
}

export function AgentScopeSheet({ escalation, onConfirm, onCancel }: Props) {
  const colors = useColors();
  const [canAgree, setCanAgree] = useState<string[]>([
    'Agree to the proposed timeline',
    'Share status on current workstreams',
  ]);
  const [willNote, setWillNote] = useState<string[]>([
    'Note any new commitments discussed',
    'Record action items assigned',
  ]);
  const [offLimits, setOffLimits] = useState<string[]>([
    'Do not commit to additional resources',
    'Do not agree to scope changes',
  ]);

  const handleConfirm = () => {
    onConfirm({
      meetingTitle: escalation.meetingTitle,
      canAgreeToItems: canAgree,
      willNoteItems: willNote,
      offLimitsItems: offLimits,
      confirmedByUser: true,
    });
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.surface }]}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <TempoText variant="subheading" style={styles.heading}>
          Mission brief
        </TempoText>
        <TempoText variant="caption" color={colors.ink2} style={styles.subtitle}>
          {escalation.meetingTitle} {'\u00B7'} {escalation.organizer}
        </TempoText>

        {/* Can agree to */}
        <ScopeSection
          title="Can agree to"
          items={canAgree}
          onChange={setCanAgree}
          colors={colors}
          tintColor={colors.accent}
        />

        {/* Will note */}
        <ScopeSection
          title="Will note, not decide"
          items={willNote}
          onChange={setWillNote}
          colors={colors}
          tintColor={colors.agent}
        />

        {/* Off limits */}
        <ScopeSection
          title="Off limits"
          items={offLimits}
          onChange={setOffLimits}
          colors={colors}
          tintColor={colors.danger}
        />

        {/* Actions */}
        <View style={styles.actions}>
          <Pressable
            onPress={handleConfirm}
            style={[styles.confirmButton, { backgroundColor: colors.agent }]}
            accessibilityRole="button"
            accessibilityLabel="Send agent with this scope"
          >
            <TempoText variant="caption" color="#FFFFFF">
              Send agent with this scope
            </TempoText>
          </Pressable>
          <Pressable
            onPress={onCancel}
            style={styles.cancelButton}
            accessibilityRole="button"
            accessibilityLabel="Cancel"
          >
            <TempoText variant="caption" color={colors.ink3}>Cancel</TempoText>
          </Pressable>
        </View>
      </ScrollView>
    </View>
  );
}

function ScopeSection({
  title,
  items,
  onChange,
  colors,
  tintColor,
}: {
  title: string;
  items: string[];
  onChange: (items: string[]) => void;
  colors: ReturnType<typeof useColors>;
  tintColor: string;
}) {
  const updateItem = (index: number, text: string) => {
    const next = [...items];
    next[index] = text;
    onChange(next);
  };

  const removeItem = (index: number) => {
    onChange(items.filter((_, i) => i !== index));
  };

  const addItem = () => {
    onChange([...items, '']);
  };

  return (
    <View style={styles.section}>
      <View style={[styles.sectionDot, { backgroundColor: tintColor }]} />
      <TempoText variant="label" color={colors.ink3} style={styles.sectionTitle}>
        {title.toUpperCase()}
      </TempoText>
      {items.map((item, i) => (
        <View key={i} style={styles.itemRow}>
          <TextInput
            value={item}
            onChangeText={(text) => updateItem(i, text)}
            style={[styles.itemInput, { color: colors.ink, borderBottomColor: colors.border }]}
            placeholderTextColor={colors.ink3}
            placeholder="Add item..."
          />
          <Pressable onPress={() => removeItem(i)} accessibilityLabel="Remove item">
            <TempoText variant="data" color={colors.ink3}>{'\u00D7'}</TempoText>
          </Pressable>
        </View>
      ))}
      <Pressable onPress={addItem} style={styles.addButton} accessibilityLabel="Add item">
        <TempoText variant="data" color={tintColor}>+ Add</TempoText>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '80%',
  },
  content: {
    padding: spacing.xl,
    paddingBottom: spacing['3xl'],
  },
  heading: {
    marginBottom: spacing.xs,
  },
  subtitle: {
    marginBottom: spacing.xl,
  },
  section: {
    marginBottom: spacing.xl,
  },
  sectionDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginBottom: spacing.xs,
  },
  sectionTitle: {
    marginBottom: spacing.sm,
  },
  itemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  itemInput: {
    flex: 1,
    fontFamily: 'DMSans_300Light',
    fontSize: 13,
    borderBottomWidth: StyleSheet.hairlineWidth,
    paddingVertical: spacing.xs,
    marginRight: spacing.sm,
  },
  addButton: {
    paddingVertical: spacing.xs,
  },
  actions: {
    marginTop: spacing.xl,
    gap: spacing.md,
  },
  confirmButton: {
    paddingVertical: spacing.base,
    borderRadius: 16,
    alignItems: 'center',
  },
  cancelButton: {
    alignItems: 'center',
    paddingVertical: spacing.sm,
  },
});
