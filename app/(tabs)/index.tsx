import React, { useState } from 'react';
import { View, ScrollView, StyleSheet, Pressable } from 'react-native';
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

const FEELING_PROMPTS: Record<string, { label: string; placeholder: string }> = {
  rested:    { label: 'ENERGY',     placeholder: 'What will you give this energy to?' },
  scattered: { label: 'FOCUS',      placeholder: 'What\u2019s the one thing that matters right now?' },
  focused:   { label: 'INTENTION',  placeholder: 'What are you turning toward?' },
  drained:   { label: 'NEED',       placeholder: 'What do you need right now?' },
  restless:  { label: 'PULL',       placeholder: 'What\u2019s pulling at you?' },
  steady:    { label: 'INTENTION',  placeholder: 'What are you turning toward?' },
  flat:      { label: 'SPARK',      placeholder: 'What would bring you back to life?' },
  energised: { label: 'DIRECTION',  placeholder: 'What will you channel this into?' },
};

const DEFAULT_PROMPT = { label: 'INTENTION', placeholder: 'What are you turning toward?' };

function getTimeContext(): string {
  const h = new Date().getHours();
  if (h < 6)  return 'Early hours';
  if (h < 12) return 'Morning';
  if (h < 17) return 'Afternoon';
  if (h < 21) return 'Evening';
  return 'Night';
}

// ── Compact proposal card ──

function ProposalCard({ proposal, onAccept, onDefer, onDismiss }: {
  proposal: BookingProposal;
  onAccept: (id: string) => void;
  onDefer: (id: string) => void;
  onDismiss: (id: string) => void;
}) {
  const colors = useColors();
  const catColor = CATEGORY_COLORS[proposal.category] ?? colors.ink3;
  const catLabel = CATEGORY_LABELS[proposal.category] ?? proposal.category;

  return (
    <View style={[styles.card, { backgroundColor: colors.surface }]}>
      <View style={styles.cardTop}>
        <View style={{ flex: 1 }}>
          <TempoText variant="body">{proposal.title}</TempoText>
          <TempoText variant="caption" color={colors.ink3} style={{ marginTop: 2 }}>
            {proposal.reason}
          </TempoText>
        </View>
        <View style={[styles.pill, { backgroundColor: catColor }]}>
          <TempoText variant="data" color="#FFFFFF">{catLabel}</TempoText>
        </View>
      </View>
      <View style={styles.cardActions}>
        <Pressable onPress={() => onAccept(proposal.id)} style={[styles.btnFill, { backgroundColor: colors.accent }]} accessibilityRole="button">
          <TempoText variant="caption" color="#FFFFFF">Book it</TempoText>
        </Pressable>
        <Pressable onPress={() => onDefer(proposal.id)} accessibilityRole="button">
          <TempoText variant="caption" color={colors.ink3}>Later</TempoText>
        </Pressable>
        <Pressable onPress={() => onDismiss(proposal.id)} accessibilityRole="button">
          <TempoText variant="caption" color={colors.danger}>Dismiss</TempoText>
        </Pressable>
      </View>
    </View>
  );
}

// ── Compact escalation card ──

function EscalationCard({ esc, onResolve }: {
  esc: Escalation;
  onResolve: (id: string, decision: 'attend' | 'agent' | 'decline' | 'clarify') => void;
}) {
  const colors = useColors();
  const roleColor = esc.roleClassification ? ROLE_COLORS[esc.roleClassification] : colors.ink3;

  return (
    <View style={[styles.card, { backgroundColor: colors.surface, borderLeftWidth: 3, borderLeftColor: roleColor }]}>
      <View style={styles.cardTop}>
        <View style={{ flex: 1 }}>
          <TempoText variant="body">{esc.meetingTitle}</TempoText>
          <TempoText variant="caption" color={colors.ink3} style={{ marginTop: 2 }}>
            {esc.organizer} {'\u00B7'} {esc.reason.replace(/_/g, ' ')}
          </TempoText>
        </View>
        <TempoText variant="data" color={colors.ink3}>{esc.sentinelConfidence}%</TempoText>
      </View>
      <View style={styles.cardActions}>
        <Pressable onPress={() => onResolve(esc.id, 'attend')} style={[styles.btnFill, { backgroundColor: colors.accent }]} accessibilityRole="button">
          <TempoText variant="caption" color="#FFFFFF">Attend</TempoText>
        </Pressable>
        <Pressable onPress={() => onResolve(esc.id, 'agent')} style={[styles.btnFill, { backgroundColor: colors.agent }]} accessibilityRole="button">
          <TempoText variant="caption" color="#FFFFFF">Send agent</TempoText>
        </Pressable>
        <Pressable onPress={() => onResolve(esc.id, 'clarify')} accessibilityRole="button">
          <TempoText variant="caption" color={colors.agent}>Ask why</TempoText>
        </Pressable>
        <Pressable onPress={() => onResolve(esc.id, 'decline')} accessibilityRole="button">
          <TempoText variant="caption" color={colors.danger}>Decline</TempoText>
        </Pressable>
      </View>
    </View>
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
    reflections, addReflection,
  } = useLifeModel();
  const {
    sentinel, cultivator,
    resolveEscalation, acceptProposal, deferProposal, dismissProposal,
  } = useAgentStore();

  const [selectedFeeling, setSelectedFeeling] = useState<string | null>(lastCheckin?.feeling ?? null);
  const [sheetDomain, setSheetDomain] = useState<Domain | null>(null);
  const [reflectionText, setReflectionText] = useState('');

  const handleFeeling = (f: string) => {
    setSelectedFeeling(f);
    addCheckin({ feeling: f, timestamp: Date.now() });
  };

  const submitReflection = (content: string) => {
    if (!content.trim()) return;
    const now = new Date();
    const hour = now.getHours();
    const period = hour < 12 ? 'morning' : hour < 17 ? 'afternoon' : 'evening';
    addReflection({
      id: `r-${Date.now()}`,
      date: `${now.toLocaleDateString('en-US', { weekday: 'short' })} ${period}`,
      text: content.trim(),
    });
    setReflectionText('');
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

  const pendingProposals = cultivator.pendingProposals.filter((p) => p.status === 'pending');
  const pendingEscalations = sentinel.pendingEscalations.filter((e) => e.status === 'pending');

  // Overall tempo score — average of all domain levels
  const tempoScore = Math.round(
    domains.reduce((sum, d) => {
      const level = d.subjectiveLevel ?? (d.targetHours > 0 ? Math.min(d.actualHours / d.targetHours, 1) : 0.5);
      return sum + level;
    }, 0) / Math.max(domains.length, 1) * 100
  );

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

        {/* Tempo index — overall score + domain vessels */}
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

        {/* Contextual prompt — only after feeling selected */}
        {selectedFeeling && (
          <EnterView delay={staggerDelays[2]} style={styles.section}>
            <TempoText variant="label" color={colors.ink3} style={styles.sectionLabel}>
              {FEELING_PROMPTS[selectedFeeling].label}
            </TempoText>
            <TempoInput
              variant="body"
              placeholder={FEELING_PROMPTS[selectedFeeling].placeholder}
              multiline
              value={intention}
              onChangeText={setIntention}
              onSubmit={(text) => setIntention(text)}
            />
          </EnterView>
        )}

        {/* Reflection — appears after feeling selected */}
        {selectedFeeling && (
          <EnterView delay={staggerDelays[3]} style={styles.section}>
            <TempoText variant="label" color={colors.ink3} style={styles.sectionLabel}>REFLECT</TempoText>
            <TempoInput
              variant="body"
              placeholder="What just happened? Say it plainly..."
              multiline
              numberOfLines={3}
              value={reflectionText}
              onChangeText={setReflectionText}
              onSubmit={submitReflection}
            />
            {reflections.length > 0 && (
              <View style={styles.recentReflections}>
                {reflections.slice(0, 3).map((entry) => (
                  <View key={entry.id} style={[styles.reflectionEntry, { borderBottomColor: colors.border }]}>
                    <TempoText variant="label" color={colors.ink3}>{entry.date}</TempoText>
                    <TempoText variant="caption" color={colors.ink2} numberOfLines={2} style={{ marginTop: spacing.xs }}>
                      {entry.text}
                    </TempoText>
                  </View>
                ))}
              </View>
            )}
          </EnterView>
        )}

        {/* Sentinel escalations — needs your decision */}
        {pendingEscalations.length > 0 && (
          <EnterView delay={staggerDelays[4]} style={styles.section}>
            <TempoText variant="label" color={colors.ink3} style={styles.sectionLabel}>
              NEEDS YOUR DECISION
            </TempoText>
            {pendingEscalations.map((esc) => (
              <EscalationCard key={esc.id} esc={esc} onResolve={resolveEscalation} />
            ))}
          </EnterView>
        )}

        {/* Cultivator proposals */}
        {pendingProposals.length > 0 && (
          <EnterView delay={staggerDelays[4]} style={styles.section}>
            <TempoText variant="label" color={colors.ink3} style={styles.sectionLabel}>
              TEMPO FOUND TIME
            </TempoText>
            {pendingProposals.map((p) => (
              <ProposalCard
                key={p.id}
                proposal={p}
                onAccept={acceptProposal}
                onDefer={deferProposal}
                onDismiss={dismissProposal}
              />
            ))}
          </EnterView>
        )}

        {/* Sentinel summary — if it's been active */}
        {sentinel.recentActions.length > 0 && (
          <EnterView delay={staggerDelays[4]} style={styles.section}>
            <TempoText variant="label" color={colors.ink3} style={styles.sectionLabel}>
              SENTINEL {'\u00B7'} {sentinel.hoursReclaimed}h reclaimed
            </TempoText>
            {sentinel.recentActions.slice(0, 3).map((item) => {
              const actionLabels: Record<string, string> = {
                declined: 'Declined', deflected_async: 'Async',
                agent_attended: 'Agent sent', interrogated: 'Clarified', accepted: 'Accepted',
              };
              return (
                <View key={item.id} style={[styles.sentinelRow, { borderBottomColor: colors.border }]}>
                  <TempoText variant="label" color={colors.agent}>
                    {actionLabels[item.actionType] ?? item.actionType}
                  </TempoText>
                  <TempoText variant="caption" color={colors.ink} style={{ marginTop: spacing.xs }}>
                    {item.meetingTitle}
                  </TempoText>
                  {item.minutesSaved != null && (
                    <TempoText variant="data" color={colors.ink3} style={{ marginTop: spacing.xs }}>
                      {item.minutesSaved}m saved
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
    marginBottom: spacing.md,
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
  recentReflections: {
    marginTop: spacing.base,
  },
  reflectionEntry: {
    paddingVertical: spacing.base,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  // Cards (shared between proposals + escalations)
  card: {
    borderRadius: 12,
    padding: spacing.base,
    marginBottom: spacing.sm,
  },
  cardTop: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.sm,
  },
  pill: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: 8,
  },
  cardActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.base,
    marginTop: spacing.md,
  },
  btnFill: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: 16,
  },
  // Sentinel summary
  sentinelRow: {
    paddingVertical: spacing.base,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
});
