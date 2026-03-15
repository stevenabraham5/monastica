import React from 'react';
import { View, Pressable, StyleSheet } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withDelay,
  withSequence,
  runOnJS,
} from 'react-native-reanimated';
import { TempoText } from './TempoText';
import { EnterView } from './EnterView';
import { useColors } from '../constants/colors';
import { spacing } from '../constants/spacing';
import { TEMPO_EASING } from '../constants/motion';
import type { BookingProposal } from '../store/types';
import { CATEGORY_COLORS, CATEGORY_LABELS } from '../store/types';

interface Props {
  proposal: BookingProposal;
  onAccept: () => void;
  onDefer: () => void;
  onDismiss: () => void;
}

function formatSlot(date: Date): string {
  return date.toLocaleDateString('en-US', { weekday: 'short' }) +
    ' ' +
    date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
}

export function BookingProposalCard({ proposal, onAccept, onDefer, onDismiss }: Props) {
  const colors = useColors();
  const catColor = CATEGORY_COLORS[proposal.category] ?? colors.ink3;
  const catLabel = CATEGORY_LABELS[proposal.category] ?? proposal.category;

  const scale = useSharedValue(1);
  const height = useSharedValue<number | null>(null);
  const opacity = useSharedValue(1);
  const accepted = useSharedValue(false);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    opacity: opacity.value,
  }));

  const handleAccept = () => {
    accepted.value = true;
    scale.value = withSequence(
      withTiming(0.97, { duration: 80, easing: TEMPO_EASING }),
      withTiming(1, { duration: 200, easing: TEMPO_EASING }),
    );
    opacity.value = withDelay(600, withTiming(0, { duration: 300, easing: TEMPO_EASING }));
    setTimeout(onAccept, 900);
  };

  return (
    <EnterView delay={80} distance={16}>
      <Animated.View
        style={[
          styles.card,
          { backgroundColor: colors.surface },
          animatedStyle,
        ]}
      >
        {/* Category pill */}
        <View style={styles.header}>
          <View style={[styles.categoryPill, { backgroundColor: catColor }]}>
            <TempoText variant="data" color="#FFFFFF">
              {catLabel.toUpperCase()}
            </TempoText>
          </View>
          <TempoText variant="data" color={colors.ink3}>
            {proposal.urgencyScore}
          </TempoText>
        </View>

        {/* Title */}
        <TempoText variant="subheading" style={styles.title}>
          {proposal.title}
        </TempoText>

        {/* Reason — the soul of the card */}
        <TempoText variant="body" italic color={colors.ink2} style={styles.reason}>
          {proposal.reason}
        </TempoText>

        {/* Meta chips */}
        <View style={styles.metaRow}>
          <View style={[styles.metaChip, { backgroundColor: colors.ground }]}>
            <TempoText variant="data" color={colors.ink3}>
              {formatSlot(proposal.proposedSlot)}
            </TempoText>
          </View>
          <View style={[styles.metaChip, { backgroundColor: colors.ground }]}>
            <TempoText variant="data" color={colors.ink3}>
              {proposal.durationMinutes}m
            </TempoText>
          </View>
          <View style={[styles.metaChip, { backgroundColor: colors.ground }]}>
            <TempoText variant="data" color={colors.ink3}>
              {proposal.energyType}
            </TempoText>
          </View>
        </View>

        {/* Actions */}
        <View style={styles.actions}>
          <Pressable
            onPress={handleAccept}
            style={[styles.primaryButton, { backgroundColor: colors.accent }]}
            accessibilityRole="button"
            accessibilityLabel="Book it"
          >
            <TempoText variant="caption" color="#FFFFFF">Book it</TempoText>
          </Pressable>
          <Pressable
            onPress={onDefer}
            style={[styles.outlineButton, { borderColor: colors.ink3 }]}
            accessibilityRole="button"
            accessibilityLabel="Different time"
          >
            <TempoText variant="caption" color={colors.ink3}>Different time</TempoText>
          </Pressable>
          <Pressable
            onPress={onDismiss}
            style={[styles.outlineButton, { borderColor: colors.danger }]}
            accessibilityRole="button"
            accessibilityLabel="Not yet"
          >
            <TempoText variant="caption" color={colors.danger}>Not yet</TempoText>
          </Pressable>
        </View>
      </Animated.View>
    </EnterView>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 12,
    padding: spacing.base,
    marginBottom: spacing.md,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  categoryPill: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: 8,
  },
  title: {
    marginTop: spacing.sm,
  },
  reason: {
    marginTop: spacing.xs,
    lineHeight: 20,
  },
  metaRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginTop: spacing.base,
  },
  metaChip: {
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: 8,
  },
  actions: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginTop: spacing.base,
  },
  primaryButton: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: 16,
  },
  outlineButton: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: 16,
    borderWidth: 1,
  },
});
