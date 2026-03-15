import React, { useState, useCallback } from 'react';
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
        {/* Check-in prompt */}
        <EnterView delay={staggerDelays[0]} style={styles.promptContainer}>
          <TempoText variant="display-lg" italic style={styles.prompt}>
            How did this week feel, honestly?
          </TempoText>
        </EnterView>

        {/* Response area */}
        <EnterView delay={staggerDelays[1]} style={styles.inputSection}>
          <TempoInput
            variant="body"
            placeholder="Take your time..."
            multiline
            numberOfLines={6}
            textAlignVertical="top"
            style={styles.textarea}
            value={text}
            onChangeText={setText}
            onSubmitEditing={() => {
              if (!text.trim()) return;
              const now = new Date();
              addReflection({
                id: `r-${Date.now()}`,
                date: now.toLocaleDateString('en-US', { month: 'long', day: 'numeric' }),
                text: text.trim(),
              });
              setText('');
            }}
          />
        </EnterView>

        {/* Past reflections */}
        <EnterView delay={staggerDelays[2]} style={styles.pastSection}>
          <TempoText variant="label" color={colors.ink3} style={styles.pastLabel}>
            PAST REFLECTIONS
          </TempoText>

          {reflections.map((entry, i) => (
            <EnterView
              key={entry.id}
              delay={staggerDelays[Math.min(i + 3, 4)]}
            >
              <Pressable
                style={[
                  styles.entryCard,
                  { borderBottomColor: colors.border },
                ]}
                accessibilityLabel={`Reflection from ${entry.date}: ${entry.text}`}
                accessibilityRole="button"
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
              </Pressable>
            </EnterView>
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
  promptContainer: {
    alignItems: 'center',
    paddingHorizontal: spacing.base,
  },
  prompt: {
    textAlign: 'center',
    maxWidth: 320,
  },
  inputSection: {
    marginTop: spacing['2xl'],
  },
  textarea: {
    minHeight: 120,
  },
  pastSection: {
    marginTop: spacing['3xl'],
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
