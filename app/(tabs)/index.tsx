import React, { useState, useCallback, useEffect } from 'react';
import { View, ScrollView, StyleSheet, Pressable, ActivityIndicator, Modal } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withSequence,
  withTiming,
  Easing,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { useRouter } from 'expo-router';
import { TempoText } from '../../components/TempoText';
import { TempoInput } from '../../components/TempoInput';
import { GoalCard } from '../../components/GoalCard';
import { DomainSheet } from '../../components/DomainSheet';
import { ReflectSceneCarousel } from '../../components/ReflectSceneCarousel';
import { EnterView } from '../../components/EnterView';
import { useColors } from '../../constants/colors';
import { spacing } from '../../constants/spacing';
import { staggerDelays } from '../../constants/motion';
import { useLifeModel } from '../../store/lifeModel';
import type { Domain } from '../../store/lifeModel';
import { useAgentStore } from '../../store/agentStore';
import { useAuthStore } from '../../store/authStore';
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

function getTimeContext(): { greeting: string; tip: string } {
  const h = new Date().getHours();
  if (h < 6)  return { greeting: 'Early hours', tip: 'Be gentle with yourself.' };
  if (h < 9)  return { greeting: 'Morning', tip: 'What matters most today?' };
  if (h < 12) return { greeting: 'Morning', tip: 'How\u2019s the energy?' };
  if (h < 15) return { greeting: 'Afternoon', tip: 'Good time for a check-in.' };
  if (h < 17) return { greeting: 'Afternoon', tip: 'How\u2019s the day landing?' };
  if (h < 21) return { greeting: 'Evening', tip: 'What will you carry forward?' };
  return { greeting: 'Night', tip: 'Let it settle.' };
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

// ── Check-in button — warm animated pill ──

function CheckInButton({ onPress, selectedFeeling }: { onPress: () => void; selectedFeeling: string | null }) {
  const colors = useColors();
  const breathe = useSharedValue(0);

  useEffect(() => {
    breathe.value = withRepeat(
      withSequence(
        withTiming(1, { duration: 2400, easing: Easing.inOut(Easing.sin) }),
        withTiming(0, { duration: 2400, easing: Easing.inOut(Easing.sin) }),
      ),
      -1,
    );
  }, []);

  const glowStyle = useAnimatedStyle(() => ({
    opacity: 0.25 + breathe.value * 0.2,
    transform: [{ scale: 1 + breathe.value * 0.08 }],
  }));

  const label = selectedFeeling
    ? `Feeling ${selectedFeeling}`
    : 'How are you right now?';

  return (
    <Pressable onPress={onPress} accessibilityRole="button" style={styles.checkinOuter}>
      <Animated.View style={[styles.checkinGlow, { backgroundColor: colors.accent }, glowStyle]} />
      <View style={[styles.checkinPill, { backgroundColor: colors.accent }]}>
        <TempoText variant="body" color="#FFFFFF" style={{ fontWeight: '600', letterSpacing: 0.3 }}>
          {label}
        </TempoText>
      </View>
    </Pressable>
  );
}

// ── Main screen ──

export default function NowScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const {
    domains, addCheckin, lastCheckin,
    adjustDomainLevel, addDomainEntry, domainEntries,
    reflections, addReflection, updateReflection, checkins,
  } = useLifeModel();
  const {
    sentinel, cultivator,
    resolveEscalation, acceptProposal, deferProposal, dismissProposal,
  } = useAgentStore();

  const [selectedFeeling, setSelectedFeeling] = useState<string | null>(lastCheckin?.feeling ?? null);
  const [sheetDomain, setSheetDomain] = useState<Domain | null>(null);
  const [reflectionText, setReflectionText] = useState('');
  const [feelingModalOpen, setFeelingModalOpen] = useState(false);
  const [modalStep, setModalStep] = useState<'feeling' | 'followup'>('feeling');

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

  // Overall tempo score
  const tempoScore = Math.round(
    domains.reduce((sum, d) => {
      const level = d.subjectiveLevel ?? (d.targetHours > 0 ? Math.min(d.actualHours / d.targetHours, 1) : 0.5);
      return sum + level;
    }, 0) / Math.max(domains.length, 1) * 100
  );

  // Most recent reflection with agent response
  const lastReflection = reflections.length > 0 ? reflections[0] : null;

  // Count today's check-ins
  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);
  const checkinsToday = checkins.filter((c) => c.timestamp >= todayStart.getTime()).length;

  const timeCtx = getTimeContext();
  const userName = useAuthStore((s) => s.userName);

  return (
    <View style={[styles.container, { backgroundColor: colors.reflectGround }]}>
      <StatusBar style="dark" />

      {/* Full-screen scene background */}
      <View style={StyleSheet.absoluteFill}>
        <ReflectSceneCarousel checkinsToday={checkinsToday} latestFeeling={selectedFeeling} fullScreen />
      </View>

      {/* Top content — greeting + check-in */}
      <View style={[styles.topContent, { paddingTop: insets.top + spacing.xl }]}>
        <EnterView delay={staggerDelays[0]}>
          <View style={styles.headerRow}>
            <TempoText variant="body" color={colors.ink2}>
              {timeCtx.greeting}{userName ? `, ${userName}` : ''}
            </TempoText>
            <Pressable
              onPress={() => router.push('/settings')}
              accessibilityRole="button"
              accessibilityLabel="Settings"
            >
              <TempoText variant="caption" color={colors.ink3}>Settings</TempoText>
            </Pressable>
          </View>
        </EnterView>

        <EnterView delay={staggerDelays[0]} style={{ marginTop: spacing.lg }}>
          <CheckInButton onPress={() => { setModalStep('feeling'); setFeelingModalOpen(true); }} selectedFeeling={selectedFeeling} />
        </EnterView>
      </View>

      {/* Bottom-justified domains section */}
      <View style={[styles.bottomSection, { paddingBottom: insets.bottom + 60 }]}>
        <View style={styles.tempoHeader}>
          <TempoText variant="label" color={colors.ink3}>TEMPO</TempoText>
          <TempoText variant="heading" color={colors.accent}>{tempoScore}%</TempoText>
        </View>
        {!domains.some((d) => d.subjectiveLevel != null) && (
          <TempoText variant="caption" color={colors.ink2} style={{ marginBottom: spacing.md, textAlign: 'center' }}>
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
      </View>

      {/* Feeling check-in modal — two-step: feeling then follow-up */}
      <Modal
        visible={feelingModalOpen}
        transparent
        animationType="fade"
        onRequestClose={() => setFeelingModalOpen(false)}
      >
        <Pressable
          style={styles.modalOverlay}
          onPress={() => setFeelingModalOpen(false)}
        >
          <Pressable style={[styles.modalContent, { backgroundColor: colors.ground }]}>
            {modalStep === 'feeling' ? (
              <>
                <TempoText variant="heading" style={{ fontSize: 28, marginBottom: spacing.xl }}>
                  How are you right now?
                </TempoText>
                <View style={styles.feelingsRow}>
                  {FEELINGS.map((f) => (
                    <Pressable
                      key={f}
                      onPress={() => {
                        handleFeeling(f);
                        setReflectionText('');
                        setModalStep('followup');
                      }}
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
                      <TempoText variant="body" color={selectedFeeling === f ? '#FFFFFF' : colors.ink}>
                        {f}
                      </TempoText>
                    </Pressable>
                  ))}
                </View>
              </>
            ) : (
              <>
                <TempoText variant="heading" style={{ fontSize: 24, marginBottom: spacing.md }}>
                  {FEELING_PROMPTS[selectedFeeling ?? 'steady']}
                </TempoText>
                <TempoInput
                  variant="body"
                  placeholder="Write something..."
                  multiline
                  numberOfLines={3}
                  value={reflectionText}
                  onChangeText={setReflectionText}
                  onSubmit={(text) => {
                    submitReflection(text);
                    setFeelingModalOpen(false);
                    setModalStep('feeling');
                  }}
                />
                <View style={styles.modalActions}>
                  <Pressable
                    onPress={() => {
                      setFeelingModalOpen(false);
                      setModalStep('feeling');
                    }}
                    accessibilityRole="button"
                    accessibilityLabel="Skip"
                  >
                    <TempoText variant="caption" color={colors.ink3}>Skip</TempoText>
                  </Pressable>
                  {reflectionText.trim().length > 0 && (
                    <Pressable
                      onPress={() => {
                        submitReflection(reflectionText);
                        setFeelingModalOpen(false);
                        setModalStep('feeling');
                      }}
                      style={[styles.modalSubmitButton, { backgroundColor: colors.accent }]}
                      accessibilityRole="button"
                      accessibilityLabel="Save"
                    >
                      <TempoText variant="body" color="#FFFFFF">Save</TempoText>
                    </Pressable>
                  )}
                </View>
              </>
            )}
          </Pressable>
        </Pressable>
      </Modal>

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
  topContent: {
    paddingHorizontal: spacing.xl,
  },
  bottomSection: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  sectionLabel: {
    marginBottom: spacing.sm,
  },
  feelingsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.md,
    marginTop: spacing.base,
  },
  feelingChip: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderRadius: 20,
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
  reflectButton: {
    paddingVertical: spacing.xl,
    paddingHorizontal: spacing.xl,
    borderRadius: 16,
    borderWidth: 1,
    alignItems: 'center',
  },
  checkinOuter: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkinGlow: {
    position: 'absolute',
    width: 240,
    height: 52,
    borderRadius: 26,
  },
  checkinPill: {
    paddingVertical: spacing.md,
    paddingHorizontal: spacing['2xl'],
    borderRadius: 24,
    alignItems: 'center',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.35)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.xl,
  },
  modalContent: {
    width: '100%',
    maxWidth: 400,
    borderRadius: 20,
    padding: spacing['2xl'],
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: spacing.xl,
  },
  modalSubmitButton: {
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.sm,
    borderRadius: 20,
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
