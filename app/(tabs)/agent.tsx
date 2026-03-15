import React, { useState } from 'react';
import { View, ScrollView, StyleSheet, Pressable } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { TempoText } from '../../components/TempoText';
import { EnterView } from '../../components/EnterView';
import { useColors } from '../../constants/colors';
import { spacing } from '../../constants/spacing';
import { staggerDelays } from '../../constants/motion';
import { useAgentStore, AgentAction, personas, PersonaId } from '../../store/agentStore';

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
              • {b}
            </TempoText>
          ))}
        </View>
      </View>
    </EnterView>
  );
}

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

function ActivityItem({
  item,
}: {
  item: AgentAction;
}) {
  const colors = useColors();
  const [expanded, setExpanded] = useState(false);

  return (
    <Pressable
      onPress={() => setExpanded(!expanded)}
      style={[styles.activityItem, { borderBottomColor: colors.border }]}
      accessibilityRole="button"
      accessibilityLabel={`${item.action}: ${item.meeting}`}
    >
      <TempoText variant="label" color={colors.agent}>
        {item.action}
      </TempoText>
      <TempoText variant="caption" color={colors.ink} style={styles.meetingName}>
        {item.meeting}
      </TempoText>
      <TempoText variant="data" color={colors.ink3} style={styles.time}>
        {item.time}
      </TempoText>
      {expanded && (
        <View style={[styles.detailBlock, { backgroundColor: colors.surface }]}>
          <TempoText variant="data" color={colors.ink2} style={styles.detailText}>
            {item.detail}
          </TempoText>
        </View>
      )}
    </Pressable>
  );
}

export default function AgentScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { activeSince, stats: agentStats, escalations, activityFeed, resolveEscalation, persona, setPersona } = useAgentStore();

  const stats = [
    { value: `${agentStats.hoursReclaimed}h`, label: 'Reclaimed' },
    { value: String(agentStats.deflected), label: 'Deflected' },
    { value: String(agentStats.attended), label: 'Attended' },
  ];

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
          <TempoText variant="heading">Agent activity</TempoText>
          <TempoText variant="caption" color={colors.ink2} style={styles.subhead}>
            Acting on your behalf since {activeSince}
          </TempoText>
        </EnterView>

        {/* Persona selector */}
        <EnterView delay={staggerDelays[1]} style={styles.personaSection}>
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
          <PersonaDetail id={persona} />
        </EnterView>

        {/* Stats row */}
        <EnterView delay={staggerDelays[2]} style={styles.statsRow}>
          {stats.map((stat) => (
            <StatTile key={stat.label} value={stat.value} label={stat.label} />
          ))}
        </EnterView>

        {/* Escalations */}
        {escalations.length > 0 && (
          <EnterView delay={staggerDelays[3]} style={styles.escalationSection}>
            <TempoText variant="label" color={colors.ink3} style={styles.sectionLabel}>
              NEEDS YOUR DECISION
            </TempoText>
            {escalations.map((esc) => (
              <View
                key={esc.id}
                style={[
                  styles.escalationCard,
                  {
                    backgroundColor: colors.surface,
                    borderLeftColor: colors.warning,
                  },
                ]}
              >
                <TempoText variant="subheading">{esc.meeting}</TempoText>
                <TempoText variant="data" color={colors.ink3} style={styles.escTime}>
                  {esc.time}
                </TempoText>
                <TempoText variant="caption" color={colors.ink2} style={styles.escReason}>
                  {esc.reason}
                </TempoText>
                <View style={styles.escActions}>
                  <Pressable
                    onPress={() => resolveEscalation(esc.id, 'attend')}
                    style={[styles.escButton, { backgroundColor: colors.accent }]}
                    accessibilityLabel="Attend yourself"
                    accessibilityRole="button"
                  >
                    <TempoText variant="caption" color="#FFFFFF">
                      Attend yourself
                    </TempoText>
                  </Pressable>
                  <Pressable
                    onPress={() => resolveEscalation(esc.id, 'agent')}
                    style={[styles.escButton, { backgroundColor: colors.agent }]}
                    accessibilityLabel="Send agent"
                    accessibilityRole="button"
                  >
                    <TempoText variant="caption" color="#FFFFFF">
                      Send agent
                    </TempoText>
                  </Pressable>
                  <Pressable
                    onPress={() => resolveEscalation(esc.id, 'decline')}
                    style={[styles.escButtonOutline, { borderColor: colors.danger }]}
                    accessibilityLabel="Decline"
                    accessibilityRole="button"
                  >
                    <TempoText variant="caption" color={colors.danger}>
                      Decline
                    </TempoText>
                  </Pressable>
                </View>
              </View>
            ))}
          </EnterView>
        )}

        {/* Activity feed */}
        <EnterView delay={staggerDelays[4]} style={styles.feedSection}>
          <TempoText variant="label" color={colors.ink3} style={styles.sectionLabel}>
            RECENT ACTIVITY
          </TempoText>
          {activityFeed.map((item) => (
            <ActivityItem key={item.id} item={item} />
          ))}
        </EnterView>
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
  subhead: {
    marginTop: spacing.xs,
  },
  statsRow: {
    flexDirection: 'row',
    gap: spacing.md,
    marginTop: spacing.xl,
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
    borderLeftWidth: 2,
  },
  escTime: {
    marginTop: spacing.xs,
  },
  escReason: {
    marginTop: spacing.sm,
  },
  escActions: {
    flexDirection: 'row',
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
  activityItem: {
    paddingVertical: spacing.base,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  meetingName: {
    marginTop: spacing.xs,
  },
  time: {
    marginTop: spacing.xs,
  },
  detailBlock: {
    marginTop: spacing.sm,
    padding: spacing.md,
    borderRadius: 8,
  },
  detailText: {
    lineHeight: 20,
  },
  personaSection: {
    marginTop: spacing.xl,
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
});
