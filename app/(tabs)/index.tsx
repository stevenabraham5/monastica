import React, { useState } from 'react';
import { View, ScrollView, StyleSheet, Pressable } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { useRouter } from 'expo-router';
import { TempoText } from '../../components/TempoText';
import { TempoInput } from '../../components/TempoInput';
import { GoalCard } from '../../components/GoalCard';
import { EnterView } from '../../components/EnterView';
import { useColors } from '../../constants/colors';
import { spacing } from '../../constants/spacing';
import { staggerDelays } from '../../constants/motion';
import { useLifeModel } from '../../store/lifeModel';
import { useAgentStore } from '../../store/agentStore';
import { CATEGORY_LABELS } from '../../store/types';

// Quick feeling words — tap to log how you feel right now
const FEELINGS = ['rested', 'scattered', 'focused', 'drained', 'restless', 'steady', 'flat', 'energised'] as const;

function getTimeContext(): string {
  const h = new Date().getHours();
  if (h < 6)  return 'Early hours';
  if (h < 12) return 'Morning';
  if (h < 17) return 'Afternoon';
  if (h < 21) return 'Evening';
  return 'Night';
}

function CultivatorStrip() {
  const colors = useColors();
  const topProposal = useAgentStore(
    (s) => s.cultivator.pendingProposals.find((p) => p.status === 'pending') ?? null,
  );

  if (!topProposal) return null;

  const label = CATEGORY_LABELS[topProposal.category] ?? topProposal.category;

  return (
    <EnterView delay={staggerDelays[2]} style={styles.cultivatorStrip}>
      <Pressable
        style={[styles.stripButton, { backgroundColor: colors.accentLight }]}
        accessibilityRole="button"
        accessibilityLabel={`Tempo found time for ${label}`}
      >
        <TempoText variant="caption" color={colors.accent}>
          Tempo found time for {label.toLowerCase()}
        </TempoText>
        <TempoText variant="caption" color={colors.accent}>
          {"\u203A"}
        </TempoText>
      </Pressable>
    </EnterView>
  );
}

export default function TodayScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { domains, intention, setIntention, addCheckin, lastCheckin } = useLifeModel();
  const [selectedFeeling, setSelectedFeeling] = useState<string | null>(lastCheckin?.feeling ?? null);

  const handleFeeling = (f: string) => {
    setSelectedFeeling(f);
    addCheckin({ feeling: f, timestamp: Date.now() });
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.ground }]}>
      <StatusBar style="dark" />
      <ScrollView
        contentContainerStyle={[
          styles.content,
          { paddingTop: insets.top + spacing.xl },
        ]}
        showsVerticalScrollIndicator={false}
      >
        <EnterView delay={staggerDelays[0]}>
          <TempoText variant="body" color={colors.ink2}>
            {getTimeContext()}
          </TempoText>
        </EnterView>

        {/* Present-moment check-in */}
        <EnterView delay={staggerDelays[1]} style={styles.checkinSection}>
          <TempoText variant="display-lg" italic>
            How are you right now?
          </TempoText>
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
                <TempoText
                  variant="caption"
                  color={selectedFeeling === f ? '#FFFFFF' : colors.ink2}
                >
                  {f}
                </TempoText>
              </Pressable>
            ))}
          </View>
        </EnterView>

        {/* Intention — what are you turning toward */}
        <EnterView delay={staggerDelays[2]} style={styles.intentionSection}>
          <TempoText variant="label" color={colors.ink3} style={styles.sectionLabel}>
            INTENTION
          </TempoText>
          <TempoInput
            variant="body"
            placeholder="What are you turning toward?"
            multiline
            value={intention}
            onChangeText={setIntention}
            onSubmit={(text) => setIntention(text)}
          />
        </EnterView>

        {/* Cultivator strip */}
        <CultivatorStrip />

        {/* Tempo pulse — compact domain fill vessels */}
        <EnterView delay={staggerDelays[3]} style={styles.pulseSection}>
          <TempoText variant="label" color={colors.ink3} style={styles.sectionLabel}>
            TEMPO
          </TempoText>
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
                index={i}
              />
            ))}
          </ScrollView>
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
    paddingBottom: spacing['2xl'],
  },
  checkinSection: {
    marginTop: spacing['2xl'],
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
  intentionSection: {
    marginTop: spacing['2xl'],
  },
  sectionLabel: {
    marginBottom: spacing.md,
  },
  pulseSection: {
    marginTop: spacing['2xl'],
  },
  pulseRow: {
    gap: spacing.sm,
  },
  cultivatorStrip: {
    marginTop: spacing.xl,
  },
  stripButton: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.base,
    borderRadius: 12,
  },
});
