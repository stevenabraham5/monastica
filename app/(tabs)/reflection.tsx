import React, { useState } from 'react';
import { View, ScrollView, StyleSheet, Pressable } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { TempoText } from '../../components/TempoText';
import { TempoInput } from '../../components/TempoInput';
import { EnterView } from '../../components/EnterView';
import { useColors } from '../../constants/colors';
import { spacing } from '../../constants/spacing';
import { staggerDelays } from '../../constants/motion';
import { useLifeModel } from '../../store/lifeModel';

export default function ReflectionScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { reflections, addReflection } = useLifeModel();
  const [text, setText] = useState('');

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
    setText('');
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.ground }]}>
      <StatusBar style="dark" />
      <ScrollView
        contentContainerStyle={[
          styles.content,
          { paddingTop: insets.top + spacing['3xl'] },
        ]}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* Prompt — present tense, not retrospective */}
        <EnterView delay={staggerDelays[0]} style={styles.promptContainer}>
          <TempoText variant="display-lg" italic style={styles.prompt}>
            What just happened?
          </TempoText>
          <TempoText variant="caption" color={colors.ink3} style={styles.subPrompt}>
            Or what are you noticing right now.
          </TempoText>
        </EnterView>

        {/* Input */}
        <EnterView delay={staggerDelays[1]} style={styles.inputSection}>
          <TempoInput
            variant="body"
            placeholder="Say it plainly..."
            multiline
            numberOfLines={4}
            textAlignVertical="top"
            style={styles.textarea}
            value={text}
            onChangeText={setText}
            onSubmit={submitReflection}
          />
        </EnterView>

        {/* Past entries */}
        {reflections.length > 0 && (
          <EnterView delay={staggerDelays[2]} style={styles.pastSection}>
            <TempoText variant="label" color={colors.ink3} style={styles.pastLabel}>
              RECENT
            </TempoText>
            {reflections.map((entry, i) => (
              <View
                key={entry.id}
                style={[styles.entryCard, { borderBottomColor: colors.border }]}
              >
                <TempoText variant="label" color={colors.ink3}>
                  {entry.date}
                </TempoText>
                <TempoText
                  variant="caption"
                  color={colors.ink2}
                  numberOfLines={2}
                  style={styles.entryPreview}
                >
                  {entry.text}
                </TempoText>
              </View>
            ))}
          </EnterView>
        )}
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
  promptContainer: {
    alignItems: 'center',
    paddingHorizontal: spacing.base,
  },
  prompt: {
    textAlign: 'center',
    maxWidth: 320,
  },
  subPrompt: {
    marginTop: spacing.sm,
    textAlign: 'center',
  },
  inputSection: {
    marginTop: spacing['2xl'],
  },
  textarea: {
    minHeight: 100,
  },
  pastSection: {
    marginTop: spacing['2xl'],
  },
  pastLabel: {
    marginBottom: spacing.base,
  },
  entryCard: {
    paddingVertical: spacing.base,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  entryPreview: {
    marginTop: spacing.xs,
    maxWidth: 340,
  },
});
