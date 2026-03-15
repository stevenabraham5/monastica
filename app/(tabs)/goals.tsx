import React, { useCallback, useRef, useState } from 'react';
import { View, ScrollView, StyleSheet, Pressable } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import GorhomBottomSheet from '@gorhom/bottom-sheet';
import { TempoText } from '../../components/TempoText';
import { ProgressBar } from '../../components/ProgressBar';
import { EnterView } from '../../components/EnterView';
import { BottomSheet } from '../../components/BottomSheet';
import { BrainstormContent } from '../../components/BrainstormSheet';
import { useColors } from '../../constants/colors';
import { spacing } from '../../constants/spacing';
import { staggerDelays } from '../../constants/motion';
import { useLifeModel, Domain } from '../../store/lifeModel';

function DomainCard({
  domain,
  index,
}: {
  domain: Domain;
  index: number;
}) {
  const colors = useColors();
  const [expanded, setExpanded] = useState(false);
  const progress =
    domain.targetHours > 0
      ? Math.min(domain.actualHours / domain.targetHours, 1)
      : 0;

  return (
    <EnterView delay={staggerDelays[Math.min(index, 4)]}>
      <Pressable
        onPress={() => setExpanded(!expanded)}
        style={[
          styles.domainCard,
          { backgroundColor: colors.surface, borderColor: colors.border },
        ]}
        accessibilityRole="button"
        accessibilityLabel={`${domain.name}: ${domain.goal}`}
      >
        <TempoText variant="display-lg" style={styles.domainName}>
          {domain.name}
        </TempoText>
        <TempoText
          variant="body"
          color={colors.ink2}
          numberOfLines={expanded ? undefined : 2}
          style={styles.goalStatement}
        >
          {domain.goal}
        </TempoText>

        <View style={styles.allocationRow}>
          <TempoText variant="data" color={colors.accent}>
            {domain.actualHours}h / {domain.targetHours}h per week
          </TempoText>
        </View>

        <ProgressBar progress={progress} style={styles.bar} />

        {/* Drift indicator */}
        {progress < 0.5 && domain.actualHours > 0 && (
          <View style={styles.driftRow}>
            <View style={styles.driftDot} />
            <TempoText variant="data" color={colors.accent}>
              Cultivator is hunting for time
            </TempoText>
          </View>
        )}
        {domain.actualHours === 0 && (
          <TempoText variant="data" color={colors.warning} style={styles.noProg}>
            No progress this week
          </TempoText>
        )}

        {expanded && (
          <View style={styles.subGoals}>
            <TempoText variant="label" color={colors.ink3} style={styles.subLabel}>
              SUB-GOALS
            </TempoText>
            {domain.subGoals.map((sub) => (
              <TempoText key={sub.id} variant="caption" color={colors.ink2}>
                · {sub.text}
              </TempoText>
            ))}
          </View>
        )}
      </Pressable>
    </EnterView>
  );
}

export default function GoalsScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const sheetRef = useRef<GorhomBottomSheet>(null);
  const domains = useLifeModel((s) => s.domains);

  const openBrainstorm = useCallback(() => {
    sheetRef.current?.snapToIndex(0);
  }, []);

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
        <EnterView>
          <TempoText variant="heading">Your life model</TempoText>
        </EnterView>

        <View style={styles.domainList}>
          {domains.map((domain, i) => (
            <DomainCard key={domain.id} domain={domain} index={i} />
          ))}
        </View>
      </ScrollView>

      {/* Talk to Tempo CTA */}
      <View style={[styles.fabContainer, { bottom: spacing.xl }]}>
        <Pressable
          onPress={openBrainstorm}
          style={[styles.fab, { backgroundColor: colors.accent }]}
          accessibilityLabel="Talk to Tempo"
          accessibilityRole="button"
        >
          <TempoText variant="body" color="#FFFFFF" style={styles.fabText}>
            Talk to Tempo
          </TempoText>
        </Pressable>
      </View>

      <BottomSheet ref={sheetRef}>
        <BrainstormContent />
      </BottomSheet>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    paddingHorizontal: spacing.xl,
    paddingBottom: spacing['7xl'],
  },
  domainList: {
    marginTop: spacing.xl,
    gap: spacing.base,
  },
  domainCard: {
    borderRadius: 12,
    padding: spacing.xl,
    borderWidth: StyleSheet.hairlineWidth,
  },
  domainName: {
    marginBottom: spacing.sm,
  },
  goalStatement: {
    maxWidth: 340,
  },
  allocationRow: {
    marginTop: spacing.md,
  },
  bar: {
    marginTop: spacing.sm,
  },
  driftRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    marginTop: spacing.sm,
  },
  driftDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#2D5A3D',
  },
  noProg: {
    marginTop: spacing.sm,
  },
  subGoals: {
    marginTop: spacing.base,
    gap: spacing.xs,
  },
  subLabel: {
    marginBottom: spacing.xs,
  },
  fabContainer: {
    position: 'absolute',
    right: spacing.xl,
  },
  fab: {
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.md,
    borderRadius: 24,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  fabText: {
    fontWeight: '500',
  },
});
