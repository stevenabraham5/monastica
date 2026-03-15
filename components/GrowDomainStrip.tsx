import React from 'react';
import { View, StyleSheet } from 'react-native';
import { TempoText } from './TempoText';
import { useColors } from '../constants/colors';
import { spacing } from '../constants/spacing';

/*
  GrowDomainStrip — compact domain card strip for Grow tab.
  Each domain shows as a small card: symbol, name, level bar.
  Arranged in a 2-column grid.
*/

interface DomainBranch {
  name: string;
  level: number;
  tint: string;
}

interface GrowDomainStripProps {
  score: number;
  branches: DomainBranch[];
}

const DOMAIN_SYMBOLS: Record<string, string> = {
  'Sleep & Recovery': '\u263D',
  'Movement & Body': '\u223F',
  'Nourishment': '\u25CB',
  'Creative Expression': '\u2727',
  'Professional Work': '\u25A0',
  'Learning & Growth': '\u2022',
  'People I Love': '\u2661',
  'Professional Relationships': '\u2229',
};

const SHORT_NAMES: Record<string, string> = {
  'Sleep & Recovery': 'Sleep',
  'Movement & Body': 'Movement',
  'Nourishment': 'Nourish',
  'Creative Expression': 'Creative',
  'Professional Work': 'Work',
  'Learning & Growth': 'Learning',
  'People I Love': 'People',
  'Professional Relationships': 'Prof Rel',
};

function DomainMiniCard({ branch }: { branch: DomainBranch }) {
  const colors = useColors();
  const symbol = DOMAIN_SYMBOLS[branch.name] ?? '\u25CF';
  const short = SHORT_NAMES[branch.name] ?? branch.name;
  const pct = Math.round(branch.level * 100);

  return (
    <View style={[styles.card, { backgroundColor: branch.tint + '0C', borderColor: branch.tint + '25' }]}>
      <View style={styles.cardTop}>
        <TempoText variant="body" style={{ fontSize: 20, color: branch.tint }}>
          {symbol}
        </TempoText>
        <TempoText variant="data" color={branch.tint} style={{ fontSize: 13 }}>
          {pct}%
        </TempoText>
      </View>
      <TempoText variant="caption" color={colors.ink2} style={{ fontSize: 11, marginTop: 2 }} numberOfLines={1}>
        {short}
      </TempoText>
      <View style={[styles.miniTrack, { backgroundColor: branch.tint + '18' }]}>
        <View style={[styles.miniFill, { width: `${pct}%`, backgroundColor: branch.tint }]} />
      </View>
    </View>
  );
}

export function GrowDomainStrip({ score, branches }: GrowDomainStripProps) {
  const colors = useColors();

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TempoText variant="data" color={colors.ink3} style={{ fontSize: 13, letterSpacing: 1 }}>
          {score}% overall
        </TempoText>
      </View>
      <View style={styles.grid}>
        {branches.map((b) => (
          <DomainMiniCard key={b.name} branch={b} />
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingVertical: spacing.sm,
  },
  header: {
    alignItems: 'flex-end',
    marginBottom: spacing.sm,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  card: {
    width: '47%',
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: 10,
    borderWidth: 1,
  },
  cardTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  miniTrack: {
    height: 4,
    borderRadius: 2,
    marginTop: 6,
    overflow: 'hidden',
  },
  miniFill: {
    height: '100%',
    borderRadius: 2,
  },
});
