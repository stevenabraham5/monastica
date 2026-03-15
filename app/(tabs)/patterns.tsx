import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  Pressable,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { TempoText } from '../../components/TempoText';
import { TempoInput } from '../../components/TempoInput';
import { GrowSceneCarousel } from '../../components/GrowSceneCarousel';
import { EnterView } from '../../components/EnterView';
import { useColors } from '../../constants/colors';
import { spacing } from '../../constants/spacing';
import { staggerDelays } from '../../constants/motion';
import { useLifeModel } from '../../store/lifeModel';
import { useAgentStore } from '../../store/agentStore';
import { useAuthStore } from '../../store/authStore';
import { useCoachStore, type CoachMessage } from '../../store/coachStore';

// ────────────────────────────────────────────
// Pattern detection — looks across all signals
// ────────────────────────────────────────────

interface Pattern {
  id: string;
  type: 'energy' | 'balance' | 'relationship' | 'sentiment' | 'coach';
  title: string;
  insight: string;
  suggestion: string;
  tint: string;
  symbol: string;
}

function usePatterns(): Pattern[] {
  const { domains, checkins, reflections, relationships } = useLifeModel();
  const { sentinel, cultivator } = useAgentStore();
  const { messages } = useCoachStore();

  const patterns: Pattern[] = [];

  // 1. Overworking pattern — Professional Work above target
  const work = domains.find((d) => d.name === 'Professional Work');
  if (work && work.actualHours > work.targetHours) {
    patterns.push({
      id: 'p-overwork',
      type: 'balance',
      title: 'Work is expanding',
      insight: `${work.actualHours}h this week vs ${work.targetHours}h target. Work is taking space from other domains.`,
      suggestion: 'Look at which meetings Sentinel can decline to recover those hours.',
      tint: '#5A7D8F',
      symbol: '\u25A0',
    });
  }

  // 2. Neglected domain — any domain below 50% of target
  const neglected = domains.filter((d) => {
    const level = d.subjectiveLevel ?? (d.targetHours > 0 ? d.actualHours / d.targetHours : 0.5);
    return level < 0.5 && d.name !== 'Professional Work';
  });
  if (neglected.length > 0) {
    const names = neglected.map((d) => d.name).join(', ');
    patterns.push({
      id: 'p-neglect',
      type: 'balance',
      title: `${neglected.length === 1 ? neglected[0].name + ' needs' : 'Some domains need'} attention`,
      insight: `${names} ${neglected.length === 1 ? 'is' : 'are'} running low.`,
      suggestion: 'Ask Cultivator to book time for what matters.',
      tint: '#C49A6C',
      symbol: '\u25CB',
    });
  }

  // 3. Feeling trend — check if recent checkins lean negative
  const recentCheckins = checkins.slice(0, 5);
  const lowEnergy = ['drained', 'scattered', 'flat', 'restless'];
  const lowCount = recentCheckins.filter((c) => lowEnergy.includes(c.feeling)).length;
  if (recentCheckins.length >= 3 && lowCount >= 3) {
    patterns.push({
      id: 'p-sentiment',
      type: 'sentiment',
      title: 'Energy has been low',
      insight: `${lowCount} of your last ${recentCheckins.length} check-ins were low energy.`,
      suggestion: 'Consider protecting recovery time. What would help you recharge?',
      tint: '#C07878',
      symbol: '\u2661',
    });
  }

  // 4. Relationship gap — someone overdue for contact
  const overdue = relationships.filter((r) => {
    if (!r.lastContactDate) return false;
    const daysSince = (Date.now() - new Date(r.lastContactDate).getTime()) / 86400000;
    return daysSince > r.targetFrequencyDays * 1.2;
  });
  if (overdue.length > 0) {
    patterns.push({
      id: 'p-relationship',
      type: 'relationship',
      title: `Reach out to ${overdue[0].name}`,
      insight: `It's been a while since you connected with ${overdue[0].name} (${overdue[0].role}).`,
      suggestion: 'Even a short message counts. Cultivator can find a slot.',
      tint: '#7889A0',
      symbol: '\u2229',
    });
  }

  // 5. Sentinel is busy — lots of recent actions
  if (sentinel.recentActions.length >= 3) {
    const declined = sentinel.recentActions.filter((a) => a.actionType === 'declined').length;
    if (declined >= 2) {
      patterns.push({
        id: 'p-sentinel',
        type: 'energy',
        title: 'Sentinel is working hard',
        insight: `${declined} meetings declined recently. Your calendar is under pressure.`,
        suggestion: 'Review your standing policies — are they still right?',
        tint: '#5A7D8F',
        symbol: '\u25A0',
      });
    }
  }

  // 6. Coach theme — if coach has offered insights recently
  const coachMsgs = messages.filter((m) => m.role === 'coach' && m.id !== 'welcome');
  if (coachMsgs.length > 0) {
    const last = coachMsgs[coachMsgs.length - 1];
    patterns.push({
      id: 'p-coach',
      type: 'coach',
      title: 'From your last conversation',
      insight: last.text.length > 120 ? last.text.slice(0, 117) + '...' : last.text,
      suggestion: 'Continue the conversation below.',
      tint: '#2D5A3D',
      symbol: '\u2727',
    });
  }

  return patterns;
}

// ────────────────────────────────────────────
// Pattern Card
// ────────────────────────────────────────────

function PatternCard({ pattern }: { pattern: Pattern }) {
  const colors = useColors();
  return (
    <View style={[styles.patternCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
      <View style={styles.patternHeader}>
        <TempoText variant="heading" style={{ color: pattern.tint, fontSize: 20 }}>
          {pattern.symbol}
        </TempoText>
        <TempoText variant="body" style={styles.patternTitle}>{pattern.title}</TempoText>
      </View>
      <TempoText variant="body" color={colors.ink2} style={styles.patternInsight}>
        {pattern.insight}
      </TempoText>
      <View style={[styles.suggestionRow, { backgroundColor: colors.ground }]}>
        <TempoText variant="caption" color={colors.ink3}>
          {pattern.suggestion}
        </TempoText>
      </View>
    </View>
  );
}

// ────────────────────────────────────────────
// Coach message bubble (reused from old coach screen)
// ────────────────────────────────────────────

function MessageBubble({ msg }: { msg: CoachMessage }) {
  const colors = useColors();
  const isCoach = msg.role === 'coach';

  return (
    <View
      style={[
        styles.bubble,
        isCoach
          ? [styles.coachBubble, { backgroundColor: colors.surface, borderColor: colors.border }]
          : [styles.userBubble, { backgroundColor: colors.accent }],
      ]}
    >
      <TempoText
        variant="body"
        color={isCoach ? colors.ink : '#FFFFFF'}
        style={styles.bubbleText}
      >
        {msg.text}
      </TempoText>
    </View>
  );
}

// ────────────────────────────────────────────
// Main Screen
// ────────────────────────────────────────────

export default function PatternsScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const patterns = usePatterns();
  const { domains, reflections } = useLifeModel();
  const userName = useAuthStore((s) => s.userName);
  const [coachOpen, setCoachOpen] = useState(false);
  const [text, setText] = useState('');
  const scrollRef = useRef<ScrollView>(null);
  const { messages, isThinking, sendMessage, clearConversation } = useCoachStore();

  const handleSend = (content: string) => {
    if (!content.trim()) return;
    sendMessage(content);
    setText('');
  };

  useEffect(() => {
    if (coachOpen) {
      setTimeout(() => scrollRef.current?.scrollToEnd({ animated: true }), 100);
    }
  }, [messages.length, coachOpen]);

  return (
    <KeyboardAvoidingView
      style={[styles.container, { backgroundColor: colors.adaptGround }]}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={insets.bottom + 52}
    >
      <StatusBar style="dark" />

      <ScrollView
        ref={scrollRef}
        contentContainerStyle={[
          styles.content,
          { paddingTop: insets.top + spacing.xl },
        ]}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* Header */}
        <EnterView delay={staggerDelays[0]}>
          <TempoText variant="heading">{userName ? `${userName}'s` : ''} Grow</TempoText>
          <TempoText variant="caption" color={colors.ink3} style={{ marginTop: spacing.xs }}>
            Where you go to grow
          </TempoText>
        </EnterView>

        {/* Tree hero — branches are domains */}
        <EnterView delay={staggerDelays[0]} style={{ marginTop: spacing.xl }}>
          <GrowSceneCarousel
            score={Math.round(
              domains.reduce((sum, d) => {
                const level = d.subjectiveLevel ?? (d.targetHours > 0 ? Math.min(d.actualHours / d.targetHours, 1) : 0.5);
                return sum + level;
              }, 0) / Math.max(domains.length, 1) * 100
            )}
            branches={domains.map((d) => ({
              name: d.name,
              level: d.subjectiveLevel ?? (d.targetHours > 0 ? Math.min(d.actualHours / d.targetHours, 1) : 0.5),
              tint: ({
                'Sleep & Recovery': '#7B8FA1',
                'Movement & Body': '#6B9F78',
                'Nourishment': '#C49A6C',
                'Creative Expression': '#9B7EC8',
                'Professional Work': '#5A7D8F',
                'Learning & Growth': '#4A8C6F',
                'People I Love': '#C07878',
                'Professional Relationships': '#7889A0',
              } as Record<string, string>)[d.name] ?? '#888780',
            }))}
          />
        </EnterView>

        {/* Pattern cards */}
        {patterns.length > 0 ? (
          <View style={styles.patternList}>
            {patterns.map((p, i) => (
              <EnterView key={p.id} delay={staggerDelays[Math.min(i + 1, 4)]}>
                <PatternCard pattern={p} />
              </EnterView>
            ))}
          </View>
        ) : (
          <EnterView delay={staggerDelays[1]} style={styles.emptyState}>
            <TempoText variant="body" color={colors.ink3}>
              Not enough data yet. Check in, reflect, and let the agents work.
            </TempoText>
          </EnterView>
        )}

        {/* Recent reflections */}
        {reflections.length > 0 && (
          <EnterView delay={staggerDelays[2]} style={styles.reflectionSection}>
            <TempoText variant="label" color={colors.ink3} style={{ marginBottom: spacing.md }}>REFLECTIONS</TempoText>
            {reflections.slice(0, 5).map((entry) => (
              <View key={entry.id} style={[styles.reflectionEntry, { borderBottomColor: colors.border }]}>
                <TempoText variant="label" color={colors.ink3}>{entry.date}</TempoText>
                <TempoText variant="caption" color={colors.ink2} style={{ marginTop: spacing.xs }}>
                  {entry.text}
                </TempoText>
              </View>
            ))}
          </EnterView>
        )}

        {/* Coach conversation — collapsible */}
        <EnterView delay={staggerDelays[3]} style={styles.coachSection}>
          <Pressable
            onPress={() => setCoachOpen(!coachOpen)}
            style={[styles.coachHeader, { borderColor: colors.border }]}
            accessibilityRole="button"
          >
            <View>
              <TempoText variant="label" color={colors.accent}>COACH</TempoText>
              <TempoText variant="caption" color={colors.ink3}>
                Private. Encrypted. Yours.
              </TempoText>
            </View>
            <TempoText variant="body" color={colors.ink3}>
              {coachOpen ? '\u2303' : '\u2304'}
            </TempoText>
          </Pressable>

          {coachOpen && (
            <View style={styles.coachBody}>
              {/* Messages */}
              <View style={styles.messageList}>
                {messages.map((msg) => (
                  <MessageBubble key={msg.id} msg={msg} />
                ))}
                {isThinking && (
                  <View style={[styles.bubble, styles.coachBubble, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                    <TempoText variant="caption" color={colors.ink3}>...</TempoText>
                  </View>
                )}
              </View>

              {/* Input */}
              <View style={[styles.coachInput, { borderTopColor: colors.border }]}>
                <TempoInput
                  variant="body"
                  placeholder="Say something..."
                  value={text}
                  onChangeText={setText}
                  onSubmit={handleSend}
                  style={styles.input}
                />
              </View>

              {/* Clear */}
              <Pressable
                onPress={clearConversation}
                style={styles.clearRow}
                accessibilityLabel="Clear conversation"
                accessibilityRole="button"
              >
                <TempoText variant="caption" color={colors.ink3}>Clear conversation</TempoText>
              </Pressable>
            </View>
          )}
        </EnterView>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

// ────────────────────────────────────────────
// Styles
// ────────────────────────────────────────────

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    paddingHorizontal: spacing.xl,
    paddingBottom: spacing['3xl'],
  },
  patternList: {
    marginTop: spacing.xl,
    gap: spacing.md,
  },
  emptyState: {
    marginTop: spacing['3xl'],
    alignItems: 'center',
    paddingHorizontal: spacing.xl,
  },
  patternCard: {
    borderRadius: 12,
    padding: spacing.base,
    borderWidth: StyleSheet.hairlineWidth,
    gap: spacing.sm,
  },
  patternHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  patternTitle: {
    flex: 1,
  },
  patternInsight: {
    lineHeight: 22,
  },
  suggestionRow: {
    marginTop: spacing.xs,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: 8,
  },
  coachSection: {
    marginTop: spacing['2xl'],
  },
  reflectionSection: {
    marginTop: spacing['2xl'],
  },
  reflectionEntry: {
    paddingVertical: spacing.base,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  coachHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.base,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  coachBody: {
    marginTop: spacing.md,
  },
  messageList: {
    gap: spacing.md,
    marginBottom: spacing.md,
  },
  bubble: {
    maxWidth: '80%',
    paddingHorizontal: spacing.base,
    paddingVertical: spacing.md,
    borderRadius: 16,
  },
  coachBubble: {
    alignSelf: 'flex-start',
    borderWidth: StyleSheet.hairlineWidth,
    borderBottomLeftRadius: 4,
  },
  userBubble: {
    alignSelf: 'flex-end',
    borderBottomRightRadius: 4,
  },
  bubbleText: {
    lineHeight: 22,
  },
  coachInput: {
    paddingTop: spacing.md,
    borderTopWidth: StyleSheet.hairlineWidth,
  },
  input: {
    maxHeight: 100,
  },
  clearRow: {
    alignItems: 'center',
    paddingVertical: spacing.md,
  },
});
