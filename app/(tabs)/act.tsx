import React, { useState, useCallback } from 'react';
import { View, ScrollView, StyleSheet, Pressable, ActivityIndicator } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { useRouter } from 'expo-router';
import { TempoText } from '../../components/TempoText';
import { ActSceneCarousel } from '../../components/ActSceneCarousel';
import { EnterView } from '../../components/EnterView';
import { useColors } from '../../constants/colors';
import { spacing } from '../../constants/spacing';
import { staggerDelays } from '../../constants/motion';
import { useAgentStore } from '../../store/agentStore';
import { useLifeModel } from '../../store/lifeModel';
import { CATEGORY_COLORS, CATEGORY_LABELS, ROLE_COLORS } from '../../store/types';
import type { BookingProposal, Escalation } from '../../store/types';

// ── Agent-simulated responses ──

const ESCALATION_RESPONSES: Record<string, string> = {
  protected_block_conflict: 'This conflicts with your deep-work block. I can ask for an async alternative or suggest a 15-min slot outside your protected time.',
  first_time_organizer: 'First time this person has invited you. I\u2019ll ask for context before committing your time.',
  relationship_critical: 'This person is on your critical list. I\u2019d attend this one \u2014 the relationship value outweighs the time cost.',
  no_agenda: 'No agenda provided. I\u2019ll request one before you decide.',
  below_confidence_threshold: 'Low confidence on this one. Let me gather more context before recommending.',
  outside_policy: 'This falls outside your standing policies. Your call.',
  confidential_or_legal: 'Flagged as sensitive. You should handle this directly.',
};

const PROPOSAL_RESPONSES: Record<string, string> = {
  mind_thought_partner: 'I found a 45-min gap tomorrow during your peak energy window. Want me to block it?',
  body_maintenance: 'Your movement is lagging \u2014 I\u2019ve spotted a 30-min window after your 2pm. Should I book it?',
  serendipity: 'You haven\u2019t had unstructured time in 11 days. I can protect a 1-hour wander block Friday afternoon.',
  relationships_mentor: 'David hasn\u2019t heard from you in 34 days. I can draft a "quick call?" message and hold a slot Thursday.',
  body_appointment: 'I can schedule this and send you a reminder the day before.',
  mind_deep_work: 'I\u2019ll carve out a deep-work block during your peak hours.',
  relationships_maintenance: 'I\u2019ll find a low-energy slot for this catch-up.',
  professional_craft: 'I can block craft time during your best focus window.',
  self_knowledge: 'I\u2019ll protect some space for this.',
  life_logistics: 'I\u2019ll handle the scheduling and remind you.',
  recovery: 'Recovery time booked \u2014 I\u2019ll guard it.',
};

// ── Action item types ──

interface ActionItem {
  id: string;
  type: 'escalation' | 'proposal' | 'relationship' | 'domain';
  priority: number; // lower = more urgent
  title: string;
  subtitle: string;
  tint: string;
}

function useActions(): ActionItem[] {
  const { sentinel, cultivator } = useAgentStore();
  const { domains, relationships } = useLifeModel();
  const items: ActionItem[] = [];

  // Escalations — highest priority
  sentinel.pendingEscalations
    .filter((e) => e.status === 'pending')
    .forEach((esc) => {
      items.push({
        id: esc.id,
        type: 'escalation',
        priority: 0,
        title: esc.meetingTitle,
        subtitle: `${esc.organizer} \u00B7 ${esc.reason.replace(/_/g, ' ')}`,
        tint: ROLE_COLORS[esc.roleClassification ?? 'unknown'] || '#888780',
      });
    });

  // Proposals
  cultivator.pendingProposals
    .filter((p) => p.status === 'pending')
    .forEach((p) => {
      items.push({
        id: p.id,
        type: 'proposal',
        priority: 1,
        title: p.title,
        subtitle: p.reason,
        tint: CATEGORY_COLORS[p.category] ?? '#888780',
      });
    });

  // Overdue relationships
  relationships.forEach((r) => {
    if (!r.lastContactDate) return;
    const daysSince = (Date.now() - new Date(r.lastContactDate).getTime()) / 86400000;
    if (daysSince > r.targetFrequencyDays) {
      items.push({
        id: `rel-${r.id}`,
        type: 'relationship',
        priority: 2,
        title: `Reach out to ${r.name}`,
        subtitle: `${r.role} \u00B7 ${Math.floor(daysSince)}d since last contact`,
        tint: '#7889A0',
      });
    }
  });

  // Neglected domains
  domains.forEach((d) => {
    const level = d.subjectiveLevel ?? (d.targetHours > 0 ? d.actualHours / d.targetHours : 0.5);
    if (level < 0.4 && d.name !== 'Professional Work') {
      items.push({
        id: `dom-${d.id}`,
        type: 'domain',
        priority: 3,
        title: `${d.name} needs attention`,
        subtitle: `${Math.round(level * 100)}% \u2014 ${d.goal}`,
        tint: '#C49A6C',
      });
    }
  });

  return items.sort((a, b) => a.priority - b.priority);
}

// ── Agent responses by action type ──

const ACTION_RESPONSES: Record<string, string[]> = {
  escalation: [
    'I\u2019ll ask for an agenda and get back to you with a recommendation.',
    'This looks important. I\u2019m reviewing your calendar for the best slot.',
    'I\u2019ll handle the initial response and escalate only if needed.',
  ],
  proposal: [
    'Booking this into your next available window.',
    'Found the perfect slot. I\u2019ll block it and send you a reminder.',
    'Done. I\u2019ve protected this time for you.',
  ],
  relationship: [
    'I\u2019ll draft a short message for you to review. No pressure, just a nudge.',
    'Want me to suggest a time and draft a note? I know their schedule pattern.',
  ],
  domain: [
    'I\u2019m looking at your calendar for space to give this attention.',
    'This domain is falling behind. I\u2019ll propose a block this week.',
  ],
};

function getAgentResponse(type: string): string {
  const pool = ACTION_RESPONSES[type] ?? ['I\u2019ll take care of this.'];
  return pool[Math.floor(Math.random() * pool.length)];
}

// ── Action card — compact, tappable, agent-intermediated ──

function ActionCard({
  item, onTap, agentResponse,
}: {
  item: ActionItem;
  onTap: () => void;
  agentResponse: string | null;
}) {
  const colors = useColors();
  const [processing, setProcessing] = useState(false);

  const handlePress = useCallback(() => {
    if (agentResponse || processing) return;
    setProcessing(true);
    onTap();
    setTimeout(() => setProcessing(false), 800);
  }, [agentResponse, processing, onTap]);

  return (
    <Pressable
      onPress={handlePress}
      style={[styles.card, { borderLeftColor: item.tint }]}
      accessibilityRole="button"
    >
      <View style={styles.cardContent}>
        <TempoText variant="body" numberOfLines={1}>{item.title}</TempoText>
        <TempoText variant="caption" color={colors.ink3} numberOfLines={1}>{item.subtitle}</TempoText>
      </View>
      {!processing && !agentResponse && (
        <TempoText variant="caption" color={colors.ink3}>{'\u203A'}</TempoText>
      )}
      {processing && (
        <ActivityIndicator size="small" color={colors.agent} />
      )}
      {!processing && agentResponse && (
        <View style={styles.agentBubble}>
          <TempoText variant="caption" color={colors.agent}>{agentResponse}</TempoText>
        </View>
      )}
    </Pressable>
  );
}

// ── Main screen ──

export default function ActScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const actions = useActions();
  const { sentinel, cultivator, resolveEscalation, acceptProposal } = useAgentStore();
  const [agentResponses, setAgentResponses] = useState<Record<string, string>>({});

  const handleActionTap = useCallback((item: ActionItem) => {
    const resp = getAgentResponse(item.type);
    setAgentResponses((prev) => ({ ...prev, [item.id]: resp }));
  }, []);

  const handleEscalationTap = useCallback((esc: Escalation) => {
    const resp = ESCALATION_RESPONSES[esc.reason] ?? 'Looking into this for you...';
    setAgentResponses((prev) => ({ ...prev, [esc.id]: resp }));
    setTimeout(() => resolveEscalation(esc.id, esc.suggestedAction), 3000);
  }, [resolveEscalation]);

  const handleProposalTap = useCallback((p: BookingProposal) => {
    const resp = PROPOSAL_RESPONSES[p.category] ?? 'I\u2019ll handle this for you.';
    setAgentResponses((prev) => ({ ...prev, [p.id]: resp }));
    setTimeout(() => acceptProposal(p.id), 3000);
  }, [acceptProposal]);

  const pendingEscalations = sentinel.pendingEscalations.filter((e) => e.status === 'pending');
  const pendingProposals = cultivator.pendingProposals.filter((p) => p.status === 'pending');

  return (
    <View style={[styles.container, { backgroundColor: colors.actGround }]}>
      <StatusBar style="dark" />

      {/* Full-screen scene background */}
      <View style={StyleSheet.absoluteFill}>
        <ActSceneCarousel
          actionCount={actions.length + pendingEscalations.length + pendingProposals.length}
          completedToday={0}
          fullScreen
        />
      </View>

      <ScrollView
        contentContainerStyle={[
          styles.content,
          { paddingTop: insets.top + spacing.xl },
        ]}
        showsVerticalScrollIndicator={false}
      >
        <EnterView delay={staggerDelays[0]}>
          <TempoText variant="heading">Act</TempoText>
          <TempoText variant="caption" color={colors.ink3} style={{ marginTop: spacing.xs }}>
            {actions.length > 0
              ? `${actions.length} thing${actions.length === 1 ? '' : 's'} waiting for you`
              : 'Nothing waiting. You\u2019re clear.'}
          </TempoText>
        </EnterView>

        {/* Escalations — needs your decision */}
        {pendingEscalations.length > 0 && (
          <EnterView delay={staggerDelays[1]} style={styles.actSection}>
            <TempoText variant="label" color={colors.ink3} style={styles.sectionLabel}>
              NEEDS YOUR DECISION
            </TempoText>
            {pendingEscalations.map((esc) => {
              const roleColor = ROLE_COLORS[esc.roleClassification ?? 'unknown'] || '#888780';
              return (
                <ActionCard
                  key={esc.id}
                  item={{ id: esc.id, type: 'escalation', priority: 0, title: esc.meetingTitle, subtitle: `${esc.organizer} \u00B7 ${esc.sentinelConfidence}%`, tint: roleColor }}
                  onTap={() => handleEscalationTap(esc)}
                  agentResponse={agentResponses[esc.id] ?? null}
                />
              );
            })}
          </EnterView>
        )}

        {/* Proposals — Tempo found time */}
        {pendingProposals.length > 0 && (
          <EnterView delay={staggerDelays[2]} style={styles.actSection}>
            <TempoText variant="label" color={colors.ink3} style={styles.sectionLabel}>
              TEMPO FOUND TIME
            </TempoText>
            {pendingProposals.map((p) => {
              const catColor = CATEGORY_COLORS[p.category] ?? '#888780';
              const catLabel = CATEGORY_LABELS[p.category] ?? p.category;
              return (
                <ActionCard
                  key={p.id}
                  item={{ id: p.id, type: 'proposal', priority: 1, title: p.title, subtitle: catLabel, tint: catColor }}
                  onTap={() => handleProposalTap(p)}
                  agentResponse={agentResponses[p.id] ?? null}
                />
              );
            })}
          </EnterView>
        )}

        {/* Sentinel summary */}
        {sentinel.recentActions.length > 0 && (
          <EnterView delay={staggerDelays[3]} style={styles.actSection}>
            <TempoText variant="label" color={colors.ink3} style={styles.sectionLabel}>
              SENTINEL {'\u00B7'} {sentinel.hoursReclaimed}h reclaimed
            </TempoText>
            {sentinel.recentActions.slice(0, 3).map((item) => {
              const actionLabels: Record<string, string> = {
                declined: 'Declined', deflected_async: 'Sent async',
                agent_attended: 'Agent sent', interrogated: 'Clarified', accepted: 'Accepted',
              };
              return (
                <View key={item.id} style={[styles.sentinelRow, { borderBottomColor: colors.border }]}>
                  <View style={styles.sentinelRowInner}>
                    <TempoText variant="body" numberOfLines={1} style={{ flex: 1 }}>
                      {item.meetingTitle}
                    </TempoText>
                    <TempoText variant="caption" color={colors.agent}>
                      {actionLabels[item.actionType] ?? item.actionType}
                    </TempoText>
                    {item.minutesSaved != null && (
                      <TempoText variant="data" color={colors.ink3}>{item.minutesSaved}m</TempoText>
                    )}
                  </View>
                  {item.clarificationQuestions && item.clarificationQuestions.length > 0 && (
                    <View style={{ marginTop: spacing.xs }}>
                      {item.clarificationQuestions.map((q, qi) => (
                        <TempoText key={qi} variant="caption" color={colors.ink3}>
                          {'\u2192'} {q}
                        </TempoText>
                      ))}
                    </View>
                  )}
                </View>
              );
            })}
          </EnterView>
        )}

        {/* Prioritized actions */}

        {actions.length > 0 ? (
          <View style={styles.list}>
            {actions.map((item, i) => (
              <EnterView key={item.id} delay={staggerDelays[Math.min(i + 1, 4)]}>
                <ActionCard
                  item={item}
                  onTap={() => handleActionTap(item)}
                  agentResponse={agentResponses[item.id] ?? null}
                />
              </EnterView>
            ))}
          </View>
        ) : (
          <EnterView delay={staggerDelays[1]} style={styles.emptyState}>
            <TempoText variant="display-lg" italic color={colors.ink3}>
              {'\u2713'}
            </TempoText>
            <TempoText variant="body" color={colors.ink3} style={{ marginTop: spacing.md }}>
              All clear. Enjoy the space.
            </TempoText>
          </EnterView>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    paddingHorizontal: spacing.xl,
    paddingBottom: spacing['3xl'],
  },
  list: {
    marginTop: spacing.xl,
    gap: spacing.sm,
  },
  actSection: {
    marginTop: spacing['2xl'],
  },
  sectionLabel: {
    marginBottom: spacing.sm,
  },
  sentinelRow: {
    paddingVertical: spacing.sm,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  sentinelRowInner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  card: {
    borderRadius: 12,
    padding: spacing.md,
    borderLeftWidth: 3,
    backgroundColor: 'rgba(255, 255, 255, 0.25)',
  },
  cardContent: {
    flex: 1,
  },
  agentBubble: {
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.sm,
    borderRadius: 8,
    marginTop: spacing.xs,
    backgroundColor: 'rgba(255, 255, 255, 0.20)',
  },
  emptyState: {
    marginTop: spacing['5xl'],
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.20)',
    borderRadius: 16,
    padding: spacing.xl,
  },
});
