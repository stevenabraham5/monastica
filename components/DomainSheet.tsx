import React, { useState } from 'react';
import { View, StyleSheet, Pressable, Modal, ScrollView } from 'react-native';
import { TempoText } from './TempoText';
import { TempoInput } from './TempoInput';
import { useColors } from '../constants/colors';
import { spacing } from '../constants/spacing';
import type { Domain, DomainEntry } from '../store/lifeModel';

// Domain-specific check-in prompts
const DOMAIN_PROMPTS: Record<string, { question: string; lowLabel: string; highLabel: string }> = {
  'Sleep & Recovery':           { question: 'How rested do you feel?',                lowLabel: 'Depleted',   highLabel: 'Restored' },
  'Movement & Body':            { question: 'Have you moved your body today?',         lowLabel: 'Stiff',      highLabel: 'Alive' },
  'Nourishment':                { question: 'When did you last eat well?',             lowLabel: 'Hungry',     highLabel: 'Nourished' },
  'Creative Expression':        { question: 'Have you made anything recently?',        lowLabel: 'Dormant',    highLabel: 'Flowing' },
  'Professional Work':          { question: 'How\u2019s your focus been?',             lowLabel: 'Scattered',  highLabel: 'Deep' },
  'Learning & Growth':          { question: 'Learned something new recently?',         lowLabel: 'Stale',      highLabel: 'Growing' },
  'People I Love':              { question: 'Connected with someone you love today?',  lowLabel: 'Distant',    highLabel: 'Close' },
  'Professional Relationships': { question: 'Any meaningful work conversations?',      lowLabel: 'Isolated',   highLabel: 'Connected' },
};

const LEVEL_WORDS = ['empty', 'low', 'some', 'good', 'full'] as const;

const domainVisuals: Record<string, { symbol: string; tint: string }> = {
  'Sleep & Recovery':           { symbol: '\u263D', tint: '#7B8FA1' },
  'Movement & Body':            { symbol: '\u223F', tint: '#6B9F78' },
  'Nourishment':                { symbol: '\u25CB', tint: '#C49A6C' },
  'Creative Expression':        { symbol: '\u2727', tint: '#9B7EC8' },
  'Professional Work':          { symbol: '\u25A0', tint: '#5A7D8F' },
  'Learning & Growth':          { symbol: '\u2022', tint: '#4A8C6F' },
  'People I Love':              { symbol: '\u2661', tint: '#C07878' },
  'Professional Relationships': { symbol: '\u2229', tint: '#7889A0' },
};

interface DomainSheetProps {
  domain: Domain | null;
  visible: boolean;
  onClose: () => void;
  onAdjust: (id: string, level: number) => void;
  onAddNote: (domainId: string, level: number, note: string) => void;
  recentEntries: DomainEntry[];
}

export function DomainSheet({ domain, visible, onClose, onAdjust, onAddNote, recentEntries }: DomainSheetProps) {
  const colors = useColors();
  const [note, setNote] = useState('');

  if (!domain) return null;

  const prompt = DOMAIN_PROMPTS[domain.name] ?? { question: 'How does this feel?', lowLabel: 'Low', highLabel: 'Full' };
  const visual = domainVisuals[domain.name] ?? { symbol: '\u25CF', tint: colors.accent };
  const currentLevel = domain.subjectiveLevel ?? (domain.targetHours > 0 ? domain.actualHours / domain.targetHours : 0.5);

  const handleSaveNote = () => {
    if (!note.trim()) return;
    onAddNote(domain.id, currentLevel, note.trim());
    setNote('');
  };

  // Entries for this domain only
  const entries = recentEntries.filter((e) => e.domainId === domain.id).slice(0, 5);

  const formatTime = (ts: number) => {
    const d = new Date(ts);
    const now = new Date();
    const diffH = Math.floor((now.getTime() - d.getTime()) / 3600000);
    if (diffH < 1) return 'just now';
    if (diffH < 24) return `${diffH}h ago`;
    const diffD = Math.floor(diffH / 24);
    return `${diffD}d ago`;
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <Pressable style={styles.backdrop} onPress={onClose}>
        <Pressable style={[styles.sheet, { backgroundColor: colors.ground }]} onPress={() => {}}>
          {/* Handle */}
          <View style={[styles.handle, { backgroundColor: colors.border }]} />

          {/* Domain header */}
          <View style={styles.header}>
            <TempoText variant="heading" style={{ color: visual.tint, fontSize: 28 }}>
              {visual.symbol}
            </TempoText>
            <TempoText variant="heading">{domain.name}</TempoText>
            <TempoText variant="body" color={colors.ink2}>{domain.goal}</TempoText>
          </View>

          {/* Question */}
          <TempoText variant="subheading" italic style={styles.question}>
            {prompt.question}
          </TempoText>

          {/* Level selector — segmented bar */}
          <View style={styles.levelBar}>
            <View style={styles.barLabels}>
              <TempoText variant="caption" color={colors.ink3}>{prompt.lowLabel}</TempoText>
              <TempoText variant="caption" color={colors.ink3}>{prompt.highLabel}</TempoText>
            </View>
            <View style={styles.barTrack}>
              {LEVEL_WORDS.map((word, i) => {
                const value = i / (LEVEL_WORDS.length - 1);
                const isAtOrBelow = currentLevel >= value - 0.01;
                const isSelected = Math.abs(currentLevel - value) < 0.13;
                return (
                  <Pressable
                    key={word}
                    onPress={() => onAdjust(domain.id, value)}
                    accessibilityLabel={word}
                    accessibilityRole="button"
                    style={[
                      styles.barSegment,
                      {
                        backgroundColor: isAtOrBelow ? visual.tint : colors.border,
                        opacity: isAtOrBelow ? (0.4 + (i / (LEVEL_WORDS.length - 1)) * 0.6) : 0.3,
                      },
                      i === 0 && { borderTopLeftRadius: 6, borderBottomLeftRadius: 6 },
                      i === LEVEL_WORDS.length - 1 && { borderTopRightRadius: 6, borderBottomRightRadius: 6 },
                    ]}
                  >
                    {isSelected && (
                      <View style={[styles.barDot, { backgroundColor: '#FFFFFF' }]} />
                    )}
                  </Pressable>
                );
              })}
            </View>
            <View style={styles.barWordRow}>
              {LEVEL_WORDS.map((word) => (
                <TempoText key={word} variant="caption" color={colors.ink3} style={styles.barWord}>
                  {word}
                </TempoText>
              ))}
            </View>
          </View>

          {/* Recent activity summary */}
          <View style={[styles.recentSection, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <TempoText variant="label" color={colors.ink3}>THIS WEEK</TempoText>
            <View style={styles.statRow}>
              <View>
                <TempoText variant="data" color={visual.tint}>{domain.actualHours}h</TempoText>
                <TempoText variant="caption" color={colors.ink3}>actual</TempoText>
              </View>
              <View style={[styles.divider, { backgroundColor: colors.border }]} />
              <View>
                <TempoText variant="data" color={colors.ink2}>{domain.targetHours}h</TempoText>
                <TempoText variant="caption" color={colors.ink3}>target</TempoText>
              </View>
              <View style={[styles.divider, { backgroundColor: colors.border }]} />
              <View>
                <TempoText variant="data" color={colors.ink2}>{Math.round(currentLevel * 100)}%</TempoText>
                <TempoText variant="caption" color={colors.ink3}>feeling</TempoText>
              </View>
            </View>
          </View>

          {/* Note input */}
          <View style={styles.noteSection}>
            <TempoInput
              variant="body"
              placeholder="Add a note..."
              value={note}
              onChangeText={setNote}
              onSubmit={handleSaveNote}
              multiline
              numberOfLines={2}
              style={styles.noteInput}
            />
            {note.trim().length > 0 && (
              <Pressable
                onPress={handleSaveNote}
                style={[styles.saveButton, { backgroundColor: colors.accent }]}
                accessibilityRole="button"
                accessibilityLabel="Save note"
              >
                <TempoText variant="caption" color="#FFFFFF">Save</TempoText>
              </Pressable>
            )}
          </View>

          {/* Previous entries */}
          {entries.length > 0 && (
            <View style={styles.entriesSection}>
              <TempoText variant="label" color={colors.ink3}>RECENT NOTES</TempoText>
              {entries.map((entry) => (
                <View
                  key={entry.id}
                  style={[styles.entryRow, { borderBottomColor: colors.border }]}
                >
                  <View style={styles.entryHeader}>
                    <View style={styles.entryDots}>
                      {LEVEL_WORDS.map((_, i) => (
                        <View
                          key={i}
                          style={[
                            styles.miniDot,
                            {
                              backgroundColor: i / (LEVEL_WORDS.length - 1) <= entry.level
                                ? visual.tint
                                : colors.border,
                            },
                          ]}
                        />
                      ))}
                    </View>
                    <TempoText variant="caption" color={colors.ink3}>
                      {formatTime(entry.timestamp)}
                    </TempoText>
                  </View>
                  <TempoText variant="body" color={colors.ink2}>{entry.note}</TempoText>
                </View>
              ))}
            </View>
          )}

          {/* Close */}
          <Pressable
            onPress={onClose}
            style={[styles.closeButton, { backgroundColor: colors.surface, borderColor: colors.border }]}
            accessibilityRole="button"
          >
            <TempoText variant="body" color={colors.ink2}>Done</TempoText>
          </Pressable>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.3)',
    justifyContent: 'flex-end',
  },
  sheet: {
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingHorizontal: spacing.xl,
    paddingBottom: spacing['3xl'],
    paddingTop: spacing.base,
    maxHeight: '80%',
  },
  handle: {
    width: 36,
    height: 4,
    borderRadius: 2,
    alignSelf: 'center',
    marginBottom: spacing.xl,
  },
  header: {
    gap: spacing.xs,
    marginBottom: spacing.xl,
  },
  question: {
    marginBottom: spacing['2xl'],
  },
  levelBar: {
    marginBottom: spacing['2xl'],
  },
  barLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing.sm,
  },
  barTrack: {
    flexDirection: 'row',
    height: 36,
    gap: 3,
  },
  barSegment: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  barDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  barWordRow: {
    flexDirection: 'row',
    marginTop: spacing.xs,
  },
  barWord: {
    flex: 1,
    textAlign: 'center',
    fontSize: 9,
  },
  recentSection: {
    borderRadius: 12,
    padding: spacing.base,
    borderWidth: StyleSheet.hairlineWidth,
    marginBottom: spacing.xl,
    gap: spacing.md,
  },
  statRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
  },
  divider: {
    width: 1,
    height: 28,
  },
  closeButton: {
    alignItems: 'center',
    paddingVertical: spacing.base,
    borderRadius: 12,
    borderWidth: StyleSheet.hairlineWidth,
  },
  noteSection: {
    marginBottom: spacing.xl,
    gap: spacing.sm,
  },
  noteInput: {
    minHeight: 48,
  },
  saveButton: {
    alignSelf: 'flex-end',
    paddingHorizontal: spacing.base,
    paddingVertical: spacing.sm,
    borderRadius: 16,
  },
  entriesSection: {
    marginBottom: spacing.xl,
    gap: spacing.md,
  },
  entryRow: {
    paddingVertical: spacing.base,
    borderBottomWidth: StyleSheet.hairlineWidth,
    gap: spacing.xs,
  },
  entryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  entryDots: {
    flexDirection: 'row',
    gap: spacing.xs,
  },
  miniDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
});
