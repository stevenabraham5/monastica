import React from 'react';
import { View, ScrollView, StyleSheet, Pressable, Alert } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { TempoText } from '../components/TempoText';
import { EnterView } from '../components/EnterView';
import { useColors } from '../constants/colors';
import { spacing } from '../constants/spacing';
import { useAgentStore, TIER_DESCRIPTIONS } from '../store/agentStore';
import type { DelegationTier } from '../store/types';

const TIERS: DelegationTier[] = [1, 2, 3, 4, 5];

export default function SettingsScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { delegationTier, setDelegationTier } = useAgentStore();

  const handleTierTap = (tier: DelegationTier) => {
    if (tier === delegationTier) return;

    const { label, description } = TIER_DESCRIPTIONS[tier];

    if (tier === 5) {
      Alert.alert(
        `Tier 5: ${label}`,
        'This is full autonomy. Tempo will act on standing policies without asking. You\u2019ll receive a weekly summary.',
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Enable full autonomy', onPress: () => setDelegationTier(tier) },
        ],
      );
    } else if (tier > delegationTier) {
      Alert.alert(
        `Move to Tier ${tier}: ${label}?`,
        description,
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Confirm', onPress: () => setDelegationTier(tier) },
        ],
      );
    } else {
      setDelegationTier(tier);
    }
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
        {/* Back */}
        <Pressable onPress={() => router.back()} accessibilityRole="button" accessibilityLabel="Back">
          <TempoText variant="caption" color={colors.accent}>
            {'\u2039'} Back
          </TempoText>
        </Pressable>

        <EnterView style={styles.header}>
          <TempoText variant="heading">Settings</TempoText>
        </EnterView>

        {/* Delegation tier */}
        <EnterView delay={60} style={styles.section}>
          <TempoText variant="label" color={colors.ink3} style={styles.sectionLabel}>
            HOW MUCH SHOULD TEMPO DO?
          </TempoText>

          {/* 5-step track */}
          <View style={styles.track}>
            {TIERS.map((tier, i) => {
              const active = tier <= delegationTier;
              const current = tier === delegationTier;
              const { label } = TIER_DESCRIPTIONS[tier];

              return (
                <React.Fragment key={tier}>
                  <Pressable
                    onPress={() => handleTierTap(tier)}
                    style={styles.tierStep}
                    accessibilityRole="button"
                    accessibilityLabel={`Tier ${tier}: ${label}${current ? ', current' : ''}`}
                    accessibilityState={{ selected: current }}
                  >
                    <View
                      style={[
                        styles.dot,
                        {
                          backgroundColor: current ? colors.accent : active ? colors.accent : colors.border,
                          borderColor: current ? colors.accent : 'transparent',
                          borderWidth: current ? 2 : 0,
                        },
                      ]}
                    />
                    <TempoText
                      variant="data"
                      color={current ? colors.accent : colors.ink3}
                      style={styles.tierLabel}
                    >
                      {tier}
                    </TempoText>
                    <TempoText
                      variant="data"
                      color={current ? colors.ink : colors.ink3}
                      style={styles.tierName}
                    >
                      {label}
                    </TempoText>
                  </Pressable>
                  {i < TIERS.length - 1 && (
                    <View
                      style={[
                        styles.trackLine,
                        { backgroundColor: active && tier < delegationTier ? colors.accent : colors.border },
                      ]}
                    />
                  )}
                </React.Fragment>
              );
            })}
          </View>

          {/* Current tier description */}
          <View style={[styles.tierDescription, { backgroundColor: colors.surface }]}>
            <TempoText variant="body" color={colors.ink2}>
              {TIER_DESCRIPTIONS[delegationTier].description}
            </TempoText>
          </View>
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
  header: {
    marginTop: spacing.xl,
  },
  section: {
    marginTop: spacing['2xl'],
  },
  sectionLabel: {
    marginBottom: spacing.xl,
  },
  track: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'center',
  },
  tierStep: {
    alignItems: 'center',
    width: 56,
  },
  dot: {
    width: 14,
    height: 14,
    borderRadius: 7,
  },
  trackLine: {
    height: 2,
    flex: 1,
    marginTop: 6,
  },
  tierLabel: {
    marginTop: spacing.xs,
  },
  tierName: {
    marginTop: 2,
    textAlign: 'center',
  },
  tierDescription: {
    marginTop: spacing.xl,
    borderRadius: 12,
    padding: spacing.base,
  },
});
