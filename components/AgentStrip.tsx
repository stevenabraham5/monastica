import React from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { TempoText } from './TempoText';
import { useColors } from '../constants/colors';
import { spacing } from '../constants/spacing';

interface AgentStripProps {
  message: string;
  onPress?: () => void;
}

export function AgentStrip({ message, onPress }: AgentStripProps) {
  const colors = useColors();

  return (
    <Pressable
      onPress={onPress}
      style={[styles.strip, { backgroundColor: colors.agentLight }]}
      accessibilityLabel={message}
      accessibilityRole="button"
    >
      <TempoText variant="caption" color={colors.agent} style={styles.text}>
        {message}
      </TempoText>
      <TempoText variant="caption" color={colors.agent}>
        →
      </TempoText>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  strip: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.base,
  },
  text: {
    flex: 1,
  },
});
