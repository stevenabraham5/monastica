import React, { useState, useCallback } from 'react';
import { View, ScrollView, StyleSheet, Pressable, ActivityIndicator } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { useRouter } from 'expo-router';
import { TempoText } from '../../components/TempoText';
import { ActField } from '../../components/ActField';
import { EnterView } from '../../components/EnterView';
import { useColors } from '../../constants/colors';
import { spacing } from '../../constants/spacing';
import { staggerDelays } from '../../constants/motion';
import { useAgentStore } from '../../store/agentStore';
import { useLifeModel } from '../../store/lifeModel';
import { CATEGORY_COLORS, CATEGORY_LABELS, ROLE_COLORS } from '../../store/types';
import type { BookingProposal, Escalation } from '../../store/types';

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
      style={[styles.card, { backgroundColor: colors.surface, borderLeftColor: item.tint }]}
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
        <View style={[styles.agentBubble, { backgroundColor: colors.ground }]}>
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
  const [agentResponses, setAgentResponses] = useState<Record<string, string>>({});

  const handleActionTap = useCallback((item: ActionItem) => {
    const resp = getAgentResponse(item.type);
    setAgentResponses((prev) => ({ ...prev, [item.id]: resp }));
  }, []);

  return (
    <View style={[styles.container, { backgroundColor: colors.actGround }]}>
      <StatusBar style="dark" />
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

        {/* Field hero */}
        <EnterView delay={staggerDelays[0]} style={{ marginTop: spacing.xl }}>
          <ActField actionCount={actions.length} completedToday={0} />
        </EnterView>

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
  card: {
    borderRadius: 8,
    padding: spacing.md,
    borderLeftWidth: 3,
  },
  cardContent: {
    flex: 1,
  },
  agentBubble: {
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.sm,
    borderRadius: 8,
    marginTop: spacing.xs,
  },
  emptyState: {
    marginTop: spacing['5xl'],
    alignItems: 'center',
  },
});
