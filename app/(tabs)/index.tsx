import React, { useState, useCallback } from 'react';
import { View, ScrollView, StyleSheet, Pressable, ActivityIndicator } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { useRouter } from 'expo-router';
import { TempoText } from '../../components/TempoText';
import { TempoInput } from '../../components/TempoInput';
import { GoalCard } from '../../components/GoalCard';
import { DomainSheet } from '../../components/DomainSheet';
import { EnterView } from '../../components/EnterView';
import { useColors } from '../../constants/colors';
import { spacing } from '../../constants/spacing';
import { staggerDelays } from '../../constants/motion';
import { useLifeModel } from '../../store/lifeModel';
import type { Domain } from '../../store/lifeModel';
import { useAgentStore } from '../../store/agentStore';
import { CATEGORY_COLORS, CATEGORY_LABELS, ROLE_COLORS } from '../../store/types';
import type { BookingProposal, Escalation } from '../../store/types';

// ── Feelings ──

const FEELINGS = ['rested', 'scattered', 'focused', 'drained', 'restless', 'steady', 'flat', 'energised'] as const;

const FEELING_PROMPTS: Record<string, string> = {
  rested:    'Feeling rested \u2014 what will you give this energy to?',
  scattered: 'Scattered \u2014 what\u2019s the one thing that matters right now?',
  focused:   'In focus \u2014 what are you turning toward?',
  drained:   'Feeling drained \u2014 what do you need right now?',
  restless:  'Restless \u2014 what\u2019s pulling at you?',
  steady:    'Steady \u2014 what are you turning toward?',
  flat:      'Feeling flat \u2014 what would bring you back to life?',
  energised: 'Energised \u2014 what will you channel this into?',
};

function getTimeContext(): string {
  const h = new Date().getHours();
  if (h < 6)  return 'Early hours';
  if (h < 12) return 'Morning';
  if (h < 17) return 'Afternoon';
  if (h < 21) return 'Evening';
  return 'Night';
}

// ── Agent-simulated responses ──
// In production these come from the LLM. For now, contextual placeholders.

const ESCALATION_RESPONSES: Record<string, string> = {
  protected_block_conflict: 'This conflicts with your deep-work block. I can ask Sarah for an async alternative or suggest a 15-min slot outside your protected time.',
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

const REFLECTION_RESPONSES = [
  'Noted. That pattern \u2014 reactive mornings bleeding into afternoon fog \u2014 has shown up 3 times this week. Want me to restructure your morning buffer?',
  'I see this connects to your craft goal being 60% behind. When you said something similar last Tuesday, you followed it with your best deep-work session. What changed?',
  'That\u2019s worth sitting with. Your energy data shows a dip after these kinds of interactions. Should I add a 15-min buffer after your next one?',
  'Interesting. This contradicts what you said yesterday about feeling on top of things. Not a problem \u2014 just worth noticing the gap.',
  'Logged. Your body domain is at 43% and this might be connected. When did you last move?',
];

// ── Tappable agent row ── single-line item that expands with agent response on tap

function AgentRow({ title, subtitle, tint, onTap, agentResponse }: {
  title: string;
  subtitle: string;
  tint: string;
  onTap: () => void;
  agentResponse: string | null;
}) {
  const colors = useColors();
  const [processing, setProcessing] = useState(false);
  const [response, setResponse] = useState<string | null>(agentResponse);

  const handlePress = useCallback(() => {
    if (response) return; // already responded
    setProcessing(true);
    onTap();
    // Simulate agent processing delay
    setTimeout(() => {
      setProcessing(false);
    }, 800);
  }, [response, onTap]);

  return (
    <Pressable
      onPress={handlePress}
      style={[styles.agentRow, { borderLeftColor: tint, backgroundColor: colors.surface }]}
      accessibilityRole="button"
    >
      <View style={styles.agentRowContent}>
        <TempoText variant="body" numberOfLines={1} style={{ flex: 1 }}>{title}</TempoText>
        <TempoText variant="caption" color={colors.ink3} numberOfLines={1}>{subtitle}</TempoText>
      </View>
      {processing && (
        <View style={styles.agentBubble}>
          <ActivityIndicator size="small" color={colors.agent} />
          <TempoText variant="caption" color={colors.agent} style={{ marginLeft: spacing.sm }}>
            Tempo is thinking...
          </TempoText>
        </View>
      )}
      {!processing && response && (
        <View style={[styles.agentBubble, { backgroundColor: colors.ground }]}>
          <TempoText variant="caption" color={colors.agent}>{response}</TempoText>
        </View>
      )}
    </Pressable>
  );
}

// ── Main screen ──

export default function NowScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const {
    domains, intention, setIntention, addCheckin, lastCheckin,
    adjustDomainLevel, addDomainEntry, domainEntries,
    reflections, addReflection, updateReflection,
  } = useLifeModel();
  const {
    sentinel, cultivator,
    resolveEscalation, acceptProposal, deferProposal, dismissProposal,
  } = useAgentStore();

  const [selectedFeeling, setSelectedFeeling] = useState<string | null>(lastCheckin?.feeling ?? null);
  const [sheetDomain, setSheetDomain] = useState<Domain | null>(null);
  const [reflectionText, setReflectionText] = useState('');
  // Track which items the agent has responded to
  const [agentResponses, setAgentResponses] = useState<Record<string, string>>({});

  const handleFeeling = (f: string) => {
    setSelectedFeeling(f);
    addCheckin({ feeling: f, timestamp: Date.now() });
  };

  const submitReflection = (content: string) => {
    if (!content.trim()) return;
    const now = new Date();
    const hour = now.getHours();
    const period = hour < 12 ? 'morning' : hour < 17 ? 'afternoon' : 'evening';
    const id = `r-${Date.now()}`;
    const agentResp = REFLECTION_RESPONSES[Math.floor(Math.random() * REFLECTION_RESPONSES.length)];
    addReflection({
      id,
      date: `${now.toLocaleDateString('en-US', { weekday: 'short' })} ${period}`,
      text: content.trim(),
      agentResponse: agentResp,
    });
    setReflectionText('');
    // Show agent response inline after a brief delay
    setTimeout(() => {
      updateReflection(id, { agentResponse: agentResp });
    }, 800);
  };

  const handleAddNote = (domainId: string, level: number, note: string) => {
    addDomainEntry({
      id: `de-${Date.now()}`,
      domainId,
      level,
      note,
      timestamp: Date.now(),
    });
  };

  const handleEscalationTap = (esc: Escalation) => {
    const resp = ESCALATION_RESPONSES[esc.reason] ?? 'Looking into this for you...';
    setAgentResponses((prev) => ({ ...prev, [esc.id]: resp }));
    // Auto-resolve with suggested action after agent responds
    setTimeout(() => {
      resolveEscalation(esc.id, esc.suggestedAction);
    }, 3000);
  };

  const handleProposalTap = (p: BookingProposal) => {
    const resp = PROPOSAL_RESPONSES[p.category] ?? 'I\u2019ll handle this for you.';
    setAgentResponses((prev) => ({ ...prev, [p.id]: resp }));
    // Auto-accept after agent responds
    setTimeout(() => {
      acceptProposal(p.id);
    }, 3000);
  };

  const pendingProposals = cultivator.pendingProposals.filter((p) => p.status === 'pending');
  const pendingEscalations = sentinel.pendingEscalations.filter((e) => e.status === 'pending');

  // Overall tempo score
  const tempoScore = Math.round(
    domains.reduce((sum, d) => {
      const level = d.subjectiveLevel ?? (d.targetHours > 0 ? Math.min(d.actualHours / d.targetHours, 1) : 0.5);
      return sum + level;
    }, 0) / Math.max(domains.length, 1) * 100
  );

  // Most recent reflection with agent response
  const lastReflection = reflections.length > 0 ? reflections[0] : null;

  return (
    <View style={[styles.container, { backgroundColor: colors.ground }]}>
      <StatusBar style="dark" />
      <ScrollView
        contentContainerStyle={[
          styles.content,
          { paddingTop: insets.top + spacing.xl },
        ]}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* Time of day */}
        <EnterView delay={staggerDelays[0]}>
          <View style={styles.headerRow}>
            <TempoText variant="body" color={colors.ink2}>{getTimeContext()}</TempoText>
            <Pressable
              onPress={() => router.push('/settings')}
              accessibilityRole="button"
              accessibilityLabel="Settings"
            >
              <TempoText variant="caption" color={colors.ink3}>Settings</TempoText>
            </Pressable>
          </View>
        </EnterView>

        {/* Tempo index */}
        <EnterView delay={staggerDelays[0]} style={styles.section}>
          <View style={styles.tempoHeader}>
            <TempoText variant="label" color={colors.ink3}>TEMPO</TempoText>
            <TempoText variant="heading" color={colors.accent}>{tempoScore}%</TempoText>
          </View>
          {!domains.some((d) => d.subjectiveLevel != null) && (
            <TempoText variant="caption" color={colors.ink2} style={{ marginBottom: spacing.md }}>
              Tap a domain to set how it feels right now.
            </TempoText>
          )}
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.pulseRow}
          >
            {domains.map((d, i) => (
              <GoalCard
                key={d.id}
                domain={d.name}
                goalStatement={d.goal}
                targetHours={d.targetHours}
                actualHours={d.actualHours}
                subjectiveLevel={d.subjectiveLevel}
                onPress={() => setSheetDomain(d)}
                index={i}
              />
            ))}
          </ScrollView>
        </EnterView>

        {/* Present-moment check-in */}
        <EnterView delay={staggerDelays[1]} style={styles.section}>
          <TempoText variant="display-lg" italic>How are you right now?</TempoText>
          <View style={styles.feelingsRow}>
            {FEELINGS.map((f) => (
              <Pressable
                key={f}
                onPress={() => handleFeeling(f)}
                style={[
                  styles.feelingChip,
                  {
                    backgroundColor: selectedFeeling === f ? colors.accent : colors.surface,
                    borderColor: selectedFeeling === f ? colors.accent : colors.border,
                  },
                ]}
                accessibilityRole="button"
                accessibilityState={{ selected: selectedFeeling === f }}
              >
                <TempoText variant="caption" color={selectedFeeling === f ? '#FFFFFF' : colors.ink2}>
                  {f}
                </TempoText>
              </Pressable>
            ))}
          </View>
        </EnterView>

        {/* Contextual prompt */}
        {selectedFeeling && (
          <EnterView delay={staggerDelays[2]} style={styles.section}>
            <TempoInput
              variant="body"
              placeholder={FEELING_PROMPTS[selectedFeeling]}
              multiline
              value={intention}
              onChangeText={setIntention}
              onSubmit={(text) => setIntention(text)}
            />
          </EnterView>
        )}

        {/* Reflection */}
        {selectedFeeling && (
          <EnterView delay={staggerDelays[3]} style={styles.section}>
            <TempoInput
              variant="body"
              placeholder="What just happened? Say it plainly..."
              multiline
              numberOfLines={2}
              value={reflectionText}
              onChangeText={setReflectionText}
              onSubmit={submitReflection}
            />
            {/* Agent response to most recent reflection */}
            {lastReflection?.agentResponse && (
              <View style={[styles.agentBubble, { backgroundColor: colors.surface, marginTop: spacing.md }]}>
                <TempoText variant="caption" color={colors.agent}>
                  {lastReflection.agentResponse}
                </TempoText>
              </View>
            )}
          </EnterView>
        )}

        {/* Sentinel escalations — compact tappable rows */}
        {pendingEscalations.length > 0 && (
          <EnterView delay={staggerDelays[4]} style={styles.section}>
            <TempoText variant="label" color={colors.ink3} style={styles.sectionLabel}>
              NEEDS YOUR DECISION
            </TempoText>
            {pendingEscalations.map((esc) => {
              const roleColor = esc.roleClassification ? ROLE_COLORS[esc.roleClassification] : colors.ink3;
              return (
                <AgentRow
                  key={esc.id}
                  title={esc.meetingTitle}
                  subtitle={`${esc.organizer} \u00B7 ${esc.sentinelConfidence}%`}
                  tint={roleColor}
                  onTap={() => handleEscalationTap(esc)}
                  agentResponse={agentResponses[esc.id] ?? null}
                />
              );
            })}
          </EnterView>
        )}

        {/* Cultivator proposals — compact tappable rows */}
        {pendingProposals.length > 0 && (
          <EnterView delay={staggerDelays[4]} style={styles.section}>
            <TempoText variant="label" color={colors.ink3} style={styles.sectionLabel}>
              TEMPO FOUND TIME
            </TempoText>
            {pendingProposals.map((p) => {
              const catColor = CATEGORY_COLORS[p.category] ?? colors.ink3;
              const catLabel = CATEGORY_LABELS[p.category] ?? p.category;
              return (
                <AgentRow
                  key={p.id}
                  title={p.title}
                  subtitle={catLabel}
                  tint={catColor}
                  onTap={() => handleProposalTap(p)}
                  agentResponse={agentResponses[p.id] ?? null}
                />
              );
            })}
          </EnterView>
        )}

        {/* Sentinel summary */}
        {sentinel.recentActions.length > 0 && (
          <EnterView delay={staggerDelays[4]} style={styles.section}>
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
                  {item.agentScopeCard && (
                    <TempoText variant="caption" color={colors.ink3} style={{ marginTop: spacing.xs }}>
                      Agent scope: {item.agentScopeCard.canAgreeToItems.join(', ')}
                    </TempoText>
                  )}
                </View>
              );
            })}
          </EnterView>
        )}
      </ScrollView>

      {/* Domain detail sheet */}
      <DomainSheet
        domain={sheetDomain}
        visible={sheetDomain !== null}
        onClose={() => setSheetDomain(null)}
        onAdjust={(id, level) => adjustDomainLevel(id, level)}
        onAddNote={handleAddNote}
        recentEntries={domainEntries}
      />
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
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  section: {
    marginTop: spacing['2xl'],
  },
  sectionLabel: {
    marginBottom: spacing.sm,
  },
  feelingsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    marginTop: spacing.base,
  },
  feelingChip: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: 16,
    borderWidth: 1,
  },
  tempoHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'baseline',
    marginBottom: spacing.md,
  },
  pulseRow: {
    gap: spacing.sm,
  },
  // Agent row — compact tappable item
  agentRow: {
    borderLeftWidth: 3,
    borderRadius: 8,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    marginBottom: spacing.xs,
  },
  agentRowContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  agentBubble: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.sm,
    borderRadius: 8,
    marginTop: spacing.xs,
  },
  // Sentinel summary — now single-line
  sentinelRow: {
    paddingVertical: spacing.sm,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  sentinelRowInner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
});
