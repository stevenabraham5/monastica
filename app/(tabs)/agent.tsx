import React, { useState } from 'react';
import { View, ScrollView, StyleSheet, Pressable } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { useRouter } from 'expo-router';
import { TempoText } from '../../components/TempoText';
import { EnterView } from '../../components/EnterView';
import { useColors } from '../../constants/colors';
import { spacing } from '../../constants/spacing';
import { staggerDelays } from '../../constants/motion';
import { useAgentStore, personas } from '../../store/agentStore';
import type { PersonaId, Escalation, SentinelAction, BookingProposal } from '../../store/types';
import { CATEGORY_COLORS, CATEGORY_LABELS, ROLE_COLORS } from '../../store/types';

// ── Persona chips ──

function PersonaChip({
  id,
  active,
  onPress,
}: {
  id: PersonaId;
  active: boolean;
  onPress: () => void;
}) {
  const colors = useColors();
  const persona = personas[id];

  return (
    <Pressable
      onPress={onPress}
      style={[
        styles.personaChip,
        {
          backgroundColor: active ? colors.agent : colors.surface,
          borderColor: active ? colors.agent : colors.border,
        },
      ]}
      accessibilityRole="button"
      accessibilityLabel={`${persona.name}${active ? ', selected' : ''}`}
      accessibilityState={{ selected: active }}
    >
      <TempoText
        variant="caption"
        color={active ? '#FFFFFF' : colors.ink2}
      >
        {persona.name}
      </TempoText>
    </Pressable>
  );
}

function PersonaDetail({ id }: { id: PersonaId }) {
  const colors = useColors();
  const persona = personas[id];

  return (
    <EnterView distance={8}>
      <View style={[styles.personaDetail, { backgroundColor: colors.surface, borderColor: colors.border }]}>
        <TempoText variant="body" color={colors.ink2}>
          {persona.philosophy}
        </TempoText>
        <View style={styles.behaviorList}>
          {persona.behaviors.map((b) => (
            <TempoText key={b} variant="caption" color={colors.ink3}>
              {'\u2022'} {b}
            </TempoText>
          ))}
        </View>
      </View>
    </EnterView>
  );
}

// ── Stat tile ──

function StatTile({ value, label }: { value: string; label: string }) {
  const colors = useColors();
  return (
    <View
      style={[styles.statTile, { backgroundColor: colors.agentLight }]}
      accessibilityLabel={`${value} ${label}`}
    >
      <TempoText variant="heading" color={colors.agent} style={styles.statValue}>
        {value}
      </TempoText>
      <TempoText variant="caption" color={colors.ink2}>
        {label}
      </TempoText>
    </View>
  );
}

// ── Sentinel: recent action row ──

function ActionRow({ item }: { item: SentinelAction }) {
  const colors = useColors();
  const actionLabels: Record<string, string> = {
    declined: 'Declined',
    deflected_async: 'Async',
    agent_attended: 'Agent sent',
    interrogated: 'Clarified',
    accepted: 'Accepted',
  };

  return (
    <View style={[styles.actionRow, { borderBottomColor: colors.border }]}>
      <TempoText variant="label" color={colors.agent}>
        {actionLabels[item.actionType] ?? item.actionType}
      </TempoText>
      <TempoText variant="caption" color={colors.ink} style={styles.meetingName}>
        {item.meetingTitle}
      </TempoText>
      {item.minutesSaved != null && (
        <TempoText variant="data" color={colors.ink3} style={styles.time}>
          {item.minutesSaved}m saved
        </TempoText>
      )}
    </View>
  );
}

// ── Sentinel: escalation card ──

function EscalationRow({ esc, onResolve }: {
  esc: Escalation;
  onResolve: (id: string, decision: 'attend' | 'agent' | 'decline' | 'clarify') => void;
}) {
  const colors = useColors();
  const roleColor = esc.roleClassification ? ROLE_COLORS[esc.roleClassification] : colors.ink3;

  return (
    <View style={[styles.escalationCard, { backgroundColor: colors.surface, borderLeftColor: roleColor }]}>
      <View style={styles.escHeader}>
        <TempoText variant="subheading">{esc.meetingTitle}</TempoText>
        {esc.roleClassification && (
          <View style={[styles.roleBadge, { backgroundColor: roleColor }]}>
            <TempoText variant="data" color="#FFFFFF">
              {esc.roleClassification}
            </TempoText>
          </View>
        )}
      </View>
      <TempoText variant="data" color={colors.ink3} style={styles.escTime}>
        {esc.organizer} {'\u00B7'} {esc.sentinelConfidence}% confident
      </TempoText>
      <TempoText variant="caption" color={colors.ink2} style={styles.escReason}>
        {esc.reason.replace(/_/g, ' ')}
      </TempoText>
      {esc.suggestedQuestions && esc.suggestedQuestions.length > 0 && (
        <View style={styles.questionList}>
          {esc.suggestedQuestions.map((q) => (
            <TempoText key={q} variant="data" color={colors.ink2}>
              {'\u2022'} {q}
            </TempoText>
          ))}
        </View>
      )}
      <View style={styles.escActions}>
        <Pressable
          onPress={() => onResolve(esc.id, 'attend')}
          style={[styles.escButton, { backgroundColor: colors.accent }]}
          accessibilityLabel="Attend yourself"
          accessibilityRole="button"
        >
          <TempoText variant="caption" color="#FFFFFF">Attend</TempoText>
        </Pressable>
        <Pressable
          onPress={() => onResolve(esc.id, 'agent')}
          style={[styles.escButton, { backgroundColor: colors.agent }]}
          accessibilityLabel="Send agent"
          accessibilityRole="button"
        >
          <TempoText variant="caption" color="#FFFFFF">Send agent</TempoText>
        </Pressable>
        <Pressable
          onPress={() => onResolve(esc.id, 'clarify')}
          style={[styles.escButtonOutline, { borderColor: colors.agent }]}
          accessibilityLabel="Clarify"
          accessibilityRole="button"
        >
          <TempoText variant="caption" color={colors.agent}>Clarify</TempoText>
        </Pressable>
        <Pressable
          onPress={() => onResolve(esc.id, 'decline')}
          style={[styles.escButtonOutline, { borderColor: colors.danger }]}
          accessibilityLabel="Decline"
          accessibilityRole="button"
        >
          <TempoText variant="caption" color={colors.danger}>Decline</TempoText>
        </Pressable>
      </View>
    </View>
  );
}

// ── Cultivator: booking proposal card ──

function ProposalRow({ proposal, onAccept, onDefer, onDismiss }: {
  proposal: BookingProposal;
  onAccept: (id: string) => void;
  onDefer: (id: string) => void;
  onDismiss: (id: string) => void;
}) {
  const colors = useColors();
  const catColor = CATEGORY_COLORS[proposal.category] ?? colors.ink3;
  const catLabel = CATEGORY_LABELS[proposal.category] ?? proposal.category;

  return (
    <View style={[styles.proposalCard, { backgroundColor: colors.surface }]}>
      <View style={styles.proposalHeader}>
        <View style={[styles.categoryPill, { backgroundColor: catColor }]}>
          <TempoText variant="data" color="#FFFFFF">{catLabel}</TempoText>
        </View>
        <TempoText variant="data" color={colors.ink3}>
          {proposal.urgencyScore}
        </TempoText>
      </View>
      <TempoText variant="subheading" style={styles.proposalTitle}>
        {proposal.title}
      </TempoText>
      <TempoText variant="caption" color={colors.ink2} style={styles.proposalReason}>
        {proposal.reason}
      </TempoText>
      <View style={styles.proposalActions}>
        <Pressable
          onPress={() => onAccept(proposal.id)}
          style={[styles.escButton, { backgroundColor: colors.accent }]}
          accessibilityLabel="Book it"
          accessibilityRole="button"
        >
          <TempoText variant="caption" color="#FFFFFF">Book it</TempoText>
        </Pressable>
        <Pressable
          onPress={() => onDefer(proposal.id)}
          style={[styles.escButtonOutline, { borderColor: colors.ink3 }]}
          accessibilityLabel="Later"
          accessibilityRole="button"
        >
          <TempoText variant="caption" color={colors.ink3}>Later</TempoText>
        </Pressable>
        <Pressable
          onPress={() => onDismiss(proposal.id)}
          style={[styles.escButtonOutline, { borderColor: colors.danger }]}
          accessibilityLabel="Not now"
          accessibilityRole="button"
        >
          <TempoText variant="caption" color={colors.danger}>Not now</TempoText>
        </Pressable>
      </View>
    </View>
  );
}

// ── Main screen ──

type AgentTab = 'cultivator' | 'sentinel';

export default function AgentScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<AgentTab>('cultivator');
  const {
    persona,
    setPersona,
    sentinel,
    cultivator,
    resolveEscalation,
    acceptProposal,
    deferProposal,
    dismissProposal,
  } = useAgentStore();

  const pendingEscalations = sentinel.pendingEscalations.filter((e) => e.status === 'pending');
  const pendingProposals = cultivator.pendingProposals.filter((p) => p.status === 'pending');

  return (
    <View style={[styles.container, { backgroundColor: colors.ground }]}>
      <StatusBar style="light" />
      <ScrollView
        contentContainerStyle={[
          styles.content,
          { paddingTop: insets.top + spacing.xl },
        ]}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <EnterView delay={staggerDelays[0]}>
          <View style={styles.headerRow}>
            <TempoText variant="heading">Agent</TempoText>
            <Pressable
              onPress={() => router.push('/settings')}
              accessibilityRole="button"
              accessibilityLabel="Settings"
            >
              <TempoText variant="caption" color={colors.ink3}>Settings</TempoText>
            </Pressable>
          </View>
        </EnterView>

        {/* Tab switcher — Cultivator | Sentinel */}
        <View style={styles.tabRow}>
          <Pressable
            onPress={() => setActiveTab('cultivator')}
            style={[
              styles.tab,
              {
                borderBottomColor: activeTab === 'cultivator' ? colors.accent : 'transparent',
              },
            ]}
            accessibilityRole="tab"
            accessibilityState={{ selected: activeTab === 'cultivator' }}
          >
            <TempoText
              variant="label"
              color={activeTab === 'cultivator' ? colors.accent : colors.ink3}
            >
              Cultivator
            </TempoText>
            {pendingProposals.length > 0 && (
              <View style={[styles.badge, { backgroundColor: colors.accent }]}>
                <TempoText variant="data" color="#FFFFFF">{pendingProposals.length}</TempoText>
              </View>
            )}
          </Pressable>
          <Pressable
            onPress={() => setActiveTab('sentinel')}
            style={[
              styles.tab,
              {
                borderBottomColor: activeTab === 'sentinel' ? colors.agent : 'transparent',
              },
            ]}
            accessibilityRole="tab"
            accessibilityState={{ selected: activeTab === 'sentinel' }}
          >
            <TempoText
              variant="label"
              color={activeTab === 'sentinel' ? colors.agent : colors.ink3}
            >
              Sentinel
            </TempoText>
            {pendingEscalations.length > 0 && (
              <View style={[styles.badge, { backgroundColor: colors.warning }]}>
                <TempoText variant="data" color="#FFFFFF">{pendingEscalations.length}</TempoText>
              </View>
            )}
          </Pressable>
        </View>

        {/* ── CULTIVATOR TAB ── */}
        {activeTab === 'cultivator' && (
          <>
            <EnterView delay={staggerDelays[1]}>
              <TempoText variant="caption" color={colors.ink2}>
                Offense {'\u00B7'} {cultivator.bookedThisWeek.length} booked this week
              </TempoText>
            </EnterView>

            {/* Pending proposals */}
            {pendingProposals.length > 0 && (
              <EnterView delay={staggerDelays[2]} style={styles.proposalSection}>
                <TempoText variant="label" color={colors.ink3} style={styles.sectionLabel}>
                  PROPOSALS
                </TempoText>
                {pendingProposals.map((p) => (
                  <ProposalRow
                    key={p.id}
                    proposal={p}
                    onAccept={acceptProposal}
                    onDefer={deferProposal}
                    onDismiss={dismissProposal}
                  />
                ))}
              </EnterView>
            )}

            {pendingProposals.length === 0 && (
              <EnterView delay={staggerDelays[2]} style={styles.emptyState}>
                <TempoText variant="body" color={colors.ink3} italic>
                  Nothing to propose right now. Your week looks balanced.
                </TempoText>
              </EnterView>
            )}

            {/* Persona selector */}
            <EnterView delay={staggerDelays[3]} style={styles.personaSection}>
              <TempoText variant="label" color={colors.ink3} style={styles.sectionLabel}>
                AGENT MODE
              </TempoText>
              <View style={styles.personaRow}>
                {(['guardian', 'pragmatist', 'delegator'] as const).map((id) => (
                  <PersonaChip
                    key={id}
                    id={id}
                    active={persona === id}
                    onPress={() => setPersona(id)}
                  />
                ))}
              </View>
              {persona && <PersonaDetail id={persona} />}
            </EnterView>
          </>
        )}

        {/* ── SENTINEL TAB ── */}
        {activeTab === 'sentinel' && (
          <>
            <EnterView delay={staggerDelays[1]}>
              <TempoText variant="caption" color={colors.ink2}>
                Defense {'\u00B7'} intercepted {sentinel.interceptedThisWeek} this week
              </TempoText>
            </EnterView>

            {/* Stats row */}
            <EnterView delay={staggerDelays[2]} style={styles.statsRow}>
              <StatTile value={`${sentinel.hoursReclaimed}h`} label="Reclaimed" />
              <StatTile value={String(sentinel.declinedThisWeek)} label="Declined" />
              <StatTile value={String(sentinel.agentAttendedThisWeek)} label="Agent sent" />
            </EnterView>

            {/* Escalations */}
            {pendingEscalations.length > 0 && (
              <EnterView delay={staggerDelays[3]} style={styles.escalationSection}>
                <TempoText variant="label" color={colors.ink3} style={styles.sectionLabel}>
                  NEEDS YOUR DECISION
                </TempoText>
                {pendingEscalations.map((esc) => (
                  <EscalationRow key={esc.id} esc={esc} onResolve={resolveEscalation} />
                ))}
              </EnterView>
            )}

            {/* Recent sentinel actions */}
            {sentinel.recentActions.length > 0 && (
              <EnterView delay={staggerDelays[4]} style={styles.feedSection}>
                <TempoText variant="label" color={colors.ink3} style={styles.sectionLabel}>
                  RECENT ACTIONS
                </TempoText>
                {sentinel.recentActions.map((item) => (
                  <ActionRow key={item.id} item={item} />
                ))}
              </EnterView>
            )}
          </>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  content: {
    paddingHorizontal: spacing.xl,
    paddingBottom: spacing['3xl'],
  },
  tabRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginTop: spacing.xl,
    marginBottom: spacing.xl,
  },
  tab: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.base,
    borderBottomWidth: 2,
  },
  badge: {
    minWidth: 20,
    height: 20,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.xs,
  },
  emptyState: {
    marginTop: spacing['2xl'],
    alignItems: 'center',
    paddingVertical: spacing['2xl'],
  },
  statsRow: {
    flexDirection: 'row',
    gap: spacing.md,
    marginTop: spacing.base,
  },
  statTile: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: spacing.base,
    borderRadius: 12,
  },
  statValue: {
    marginBottom: spacing.xs,
  },
  escalationSection: {
    marginTop: spacing.xl,
  },
  sectionLabel: {
    marginBottom: spacing.md,
  },
  escalationCard: {
    borderRadius: 12,
    padding: spacing.base,
    borderLeftWidth: 3,
    marginBottom: spacing.md,
  },
  escHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  roleBadge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: 8,
  },
  escTime: {
    marginTop: spacing.xs,
  },
  escReason: {
    marginTop: spacing.sm,
  },
  questionList: {
    marginTop: spacing.sm,
    gap: spacing.xs,
  },
  escActions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    marginTop: spacing.base,
  },
  escButton: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: 16,
  },
  escButtonOutline: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: 16,
    borderWidth: 1,
  },
  feedSection: {
    marginTop: spacing.xl,
  },
  actionRow: {
    paddingVertical: spacing.base,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  meetingName: {
    marginTop: spacing.xs,
  },
  time: {
    marginTop: spacing.xs,
  },
  personaSection: {
    marginTop: spacing['2xl'],
  },
  personaRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  personaChip: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: 16,
    borderWidth: 1,
  },
  personaDetail: {
    borderRadius: 12,
    padding: spacing.base,
    borderWidth: StyleSheet.hairlineWidth,
  },
  behaviorList: {
    marginTop: spacing.sm,
    gap: spacing.xs,
  },
  proposalSection: {
    marginTop: spacing.base,
  },
  proposalCard: {
    borderRadius: 12,
    padding: spacing.base,
    marginBottom: spacing.md,
  },
  proposalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  categoryPill: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: 8,
  },
  proposalTitle: {
    marginTop: spacing.sm,
  },
  proposalReason: {
    marginTop: spacing.xs,
  },
  proposalActions: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginTop: spacing.base,
  },
});
