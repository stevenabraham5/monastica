import React from 'react';
import { View, ScrollView, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { useRouter } from 'expo-router';
import { TempoText } from '../../components/TempoText';
import { TempoInput } from '../../components/TempoInput';
import { GoalCard } from '../../components/GoalCard';
import { AgentStrip } from '../../components/AgentStrip';
import { EnterView } from '../../components/EnterView';
import { useColors } from '../../constants/colors';
import { spacing } from '../../constants/spacing';
import { staggerDelays } from '../../constants/motion';
import { useLifeModel } from '../../store/lifeModel';
import { useAgentStore } from '../../store/agentStore';
import { useVoiceInput } from '../../hooks/useVoiceInput';

function formatDate(): string {
  const now = new Date();
  const day = now.toLocaleDateString('en-US', { weekday: 'long' });
  const month = now.toLocaleDateString('en-US', { month: 'long' });
  return `${day}, ${month}`;
}

export default function TodayScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { domains, intention, setIntention } = useLifeModel();
  const hoursReclaimed = useAgentStore((s) => s.stats.hoursReclaimed);

  const voice = useVoiceInput((text) => {
    setIntention((intention ? intention + ' ' : '') + text);
  });

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
        {/* Date header */}
        <EnterView delay={staggerDelays[0]}>
          <TempoText variant="body" color={colors.ink2}>
            {formatDate()}
          </TempoText>
        </EnterView>

        {/* Greeting / intention prompt */}
        <EnterView delay={staggerDelays[1]} style={styles.greeting}>
          <TempoText variant="display-lg" italic>
            What matters today?
          </TempoText>
        </EnterView>

        {/* Focus input */}
        <EnterView delay={staggerDelays[2]} style={styles.focusSection}>
          <TempoInput
            variant="display"
            placeholder="Your one intention for today..."
            multiline
            value={intention}
            onChangeText={setIntention}
            onSubmit={(text) => setIntention(text)}
            showVoice={voice.isAvailable}
            onVoicePress={voice.toggle}
            isListening={voice.isListening}
          />
        </EnterView>

        {/* Goal progress cards — horizontal scroll */}
        <EnterView delay={staggerDelays[3]} style={styles.goalsSection}>
          <TempoText variant="label" color={colors.ink3} style={styles.sectionLabel}>
            THIS WEEK
          </TempoText>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.goalsRow}
          >
            {domains.map((d) => (
              <GoalCard
                key={d.id}
                domain={d.name}
                goalStatement={d.goal}
                targetHours={d.targetHours}
                actualHours={d.actualHours}
              />
            ))}
          </ScrollView>
        </EnterView>
      </ScrollView>

      {/* Agent status strip */}
      <AgentStrip
        message={`Tempo protected ${hoursReclaimed}h today`}
        onPress={() => router.push('/(tabs)/agent')}
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
    paddingBottom: spacing['2xl'],
  },
  greeting: {
    marginTop: spacing['2xl'],
  },
  focusSection: {
    marginTop: spacing.xl,
  },
  goalsSection: {
    marginTop: spacing['3xl'],
  },
  sectionLabel: {
    marginBottom: spacing.md,
  },
  goalsRow: {
    gap: spacing.md,
  },
});
