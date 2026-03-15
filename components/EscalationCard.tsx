import React from 'react';
import { View, Pressable, StyleSheet } from 'react-native';
import { TempoText } from './TempoText';
import { EnterView } from './EnterView';
import { useColors } from '../constants/colors';
import { spacing } from '../constants/spacing';
import { usePersonaMode } from '../hooks/usePersonaMode';
import type { Escalation } from '../store/types';
import { ROLE_COLORS } from '../store/types';

interface Props {
  escalation: Escalation;
  onResolve: (action: 'attend' | 'agent' | 'decline' | 'clarify') => void;
}

export function EscalationCard({ escalation, onResolve }: Props) {
  const colors = useColors();
  const { canSendAgent } = usePersonaMode();
  const roleColor = escalation.roleClassification
    ? ROLE_COLORS[escalation.roleClassification]
    : 'transparent';

  return (
    <EnterView delay={80} distance={12}>
      <View
        style={[
          styles.card,
          {
            backgroundColor: colors.surface,
            borderLeftColor: colors.warning,
          },
        ]}
      >
        {/* Header */}
        <View style={styles.header}>
          <TempoText variant="subheading" style={styles.title}>
            {escalation.meetingTitle}
          </TempoText>
          {escalation.roleClassification && escalation.roleClassification !== 'unknown' && (
            <View style={[styles.roleBadge, { backgroundColor: roleColor }]}>
              <TempoText variant="data" color="#FFFFFF">
                {escalation.roleClassification}
              </TempoText>
            </View>
          )}
        </View>

        {/* Meta */}
        <TempoText variant="data" color={colors.ink3} style={styles.meta}>
          {escalation.organizer} {'\u00B7'} Sentinel confidence: {escalation.sentinelConfidence}%
          {escalation.sentinelConfidence < 60 ? ' \u2014 needs your call' : ''}
        </TempoText>

        <TempoText variant="caption" color={colors.ink2} style={styles.reason}>
          {escalation.reason.replace(/_/g, ' ')}
        </TempoText>

        {/* Suggested questions */}
        {escalation.suggestedQuestions && escalation.suggestedQuestions.length > 0 && (
          <View style={styles.questionSection}>
            <TempoText variant="data" color={colors.ink3} style={styles.questionLabel}>
              Questions Tempo will ask
            </TempoText>
            {escalation.suggestedQuestions.map((q) => (
              <TempoText key={q} variant="data" color={colors.ink2} style={styles.question}>
                {'\u2022'} {q}
              </TempoText>
            ))}
          </View>
        )}

        {/* 2x2 action grid */}
        <View style={styles.actionGrid}>
          <Pressable
            onPress={() => onResolve('attend')}
            style={[styles.actionButton, { backgroundColor: colors.accent }]}
            accessibilityRole="button"
            accessibilityLabel="Attend yourself"
          >
            <TempoText variant="caption" color="#FFFFFF">Attend</TempoText>
          </Pressable>
          {canSendAgent && (
            <Pressable
              onPress={() => onResolve('agent')}
              style={[styles.actionButton, { backgroundColor: colors.agent }]}
              accessibilityRole="button"
              accessibilityLabel="Send agent"
            >
              <TempoText variant="caption" color="#FFFFFF">Send agent</TempoText>
            </Pressable>
          )}
          <Pressable
            onPress={() => onResolve('clarify')}
            style={[styles.outlineButton, { borderColor: colors.agent }]}
            accessibilityRole="button"
            accessibilityLabel="Ask for info"
          >
            <TempoText variant="caption" color={colors.agent}>Ask for info</TempoText>
          </Pressable>
          <Pressable
            onPress={() => onResolve('decline')}
            style={[styles.outlineButton, { borderColor: colors.danger }]}
            accessibilityRole="button"
            accessibilityLabel="Decline"
          >
            <TempoText variant="caption" color={colors.danger}>Decline</TempoText>
          </Pressable>
        </View>
      </View>
    </EnterView>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 12,
    padding: spacing.base,
    borderLeftWidth: 2,
    marginBottom: spacing.md,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  title: {
    flex: 1,
  },
  roleBadge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: 8,
    marginLeft: spacing.sm,
  },
  meta: {
    marginTop: spacing.xs,
  },
  reason: {
    marginTop: spacing.sm,
  },
  questionSection: {
    marginTop: spacing.base,
  },
  questionLabel: {
    marginBottom: spacing.xs,
  },
  question: {
    marginBottom: 2,
    lineHeight: 18,
  },
  actionGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    marginTop: spacing.base,
  },
  actionButton: {
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
