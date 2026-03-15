import React, { useState } from 'react';
import { View, TextInput, StyleSheet } from 'react-native';
import { TempoText } from './TempoText';
import { useColors } from '../constants/colors';
import { spacing } from '../constants/spacing';

interface WeekData {
  hoursReclaimed: number;
  meetingsDeclined: number;
  meetingsDeflected: number;
  agentAttended: number;
  cultivatorBooked: number;
  patternObservation: string;
  calibrationQuestion: string;
}

interface Props {
  week: WeekData;
  onAnswerCalibration: (answer: string) => void;
}

export function WeeklySovereigntyReport({ week, onAnswerCalibration }: Props) {
  const colors = useColors();
  const [answer, setAnswer] = useState('');

  return (
    <View style={[styles.container, { backgroundColor: colors.surface }]}>
      <TempoText variant="label" color={colors.ink3} style={styles.label}>
        THIS WEEK
      </TempoText>

      {/* Stat tiles */}
      <View style={styles.statsRow}>
        <StatTile value={`${week.hoursReclaimed}h`} label="Reclaimed" colors={colors} />
        <StatTile value={String(week.meetingsDeclined + week.meetingsDeflected)} label="Deflected" colors={colors} />
        <StatTile value={String(week.cultivatorBooked)} label="Booked" colors={colors} />
      </View>

      {/* Pattern observation */}
      <TempoText variant="body" italic color={colors.ink2} style={styles.observation}>
        {week.patternObservation}
      </TempoText>

      {/* Calibration question */}
      <View style={styles.calibration}>
        <TempoText variant="body" color={colors.ink} style={styles.question}>
          {week.calibrationQuestion}
        </TempoText>
        <TextInput
          value={answer}
          onChangeText={setAnswer}
          onSubmitEditing={() => {
            if (answer.trim()) onAnswerCalibration(answer.trim());
          }}
          style={[styles.answerInput, { color: colors.ink, borderBottomColor: colors.border }]}
          placeholder="Your answer..."
          placeholderTextColor={colors.ink3}
          returnKeyType="done"
        />
      </View>
    </View>
  );
}

function StatTile({
  value,
  label,
  colors,
}: {
  value: string;
  label: string;
  colors: ReturnType<typeof useColors>;
}) {
  return (
    <View style={[styles.statTile, { backgroundColor: colors.ground }]}>
      <TempoText variant="heading" color={colors.agent}>
        {value}
      </TempoText>
      <TempoText variant="data" color={colors.ink3}>
        {label}
      </TempoText>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: 12,
    padding: spacing.base,
  },
  label: {
    marginBottom: spacing.base,
  },
  statsRow: {
    flexDirection: 'row',
    gap: spacing.md,
    marginBottom: spacing.xl,
  },
  statTile: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: spacing.base,
    borderRadius: 12,
  },
  observation: {
    lineHeight: 22,
    marginBottom: spacing.xl,
  },
  calibration: {
    marginTop: spacing.md,
  },
  question: {
    lineHeight: 22,
    marginBottom: spacing.md,
  },
  answerInput: {
    fontFamily: 'DMSans_300Light',
    fontSize: 14,
    borderBottomWidth: StyleSheet.hairlineWidth,
    paddingVertical: spacing.sm,
  },
});
