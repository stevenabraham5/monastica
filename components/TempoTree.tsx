import React, { useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withDelay,
} from 'react-native-reanimated';
import { TempoText } from './TempoText';
import { useColors } from '../constants/colors';
import { spacing } from '../constants/spacing';
import { TEMPO_EASING } from '../constants/motion';

/*
  TempoTree — a Live Oak line drawing with domain indicators.

  A large, spreading live oak rendered as stroked Views.
  Domain labels + symbols + level bars are positioned around the canopy
  like the reference illustration. The tree has:
  - Thick gnarled trunk splitting into major limbs
  - Broad canopy clusters (rounded bordered shapes)
  - Exposed root system spreading below the ground line
  - 8 domain indicators placed around the canopy
*/

interface DomainBranch {
  name: string;
  level: number; // 0..1
  tint: string;
}

interface TempoTreeProps {
  score: number;       // overall tempo 0..100
  branches: DomainBranch[];
}

// Domain symbols matching GoalCard
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

// Positioned around the canopy — percent-based from container edges
// Layout: 4 on left side of tree, 4 on right side
const DOMAIN_POSITIONS: Record<string, { top: string; left?: string; right?: string; align: 'left' | 'right' }> = {
  'Sleep & Recovery':           { top: '8%',  left: '2%',  align: 'left' },
  'Movement & Body':            { top: '24%', left: '0%',  align: 'left' },
  'Nourishment':                { top: '42%', left: '2%',  align: 'left' },
  'Creative Expression':        { top: '58%', left: '14%', align: 'left' },
  'Professional Work':          { top: '8%',  right: '2%', align: 'right' },
  'Learning & Growth':          { top: '24%', right: '0%', align: 'right' },
  'People I Love':              { top: '42%', right: '2%', align: 'right' },
  'Professional Relationships': { top: '58%', right: '8%', align: 'right' },
};

function DomainIndicator({ branch, index }: { branch: DomainBranch; index: number }) {
  const colors = useColors();
  const barProgress = useSharedValue(0);

  useEffect(() => {
    barProgress.value = withDelay(
      400 + index * 120,
      withTiming(branch.level, { duration: 900, easing: TEMPO_EASING }),
    );
  }, [branch.level]);

  const barStyle = useAnimatedStyle(() => ({
    height: 4 + barProgress.value * 28,
    opacity: 0.4 + barProgress.value * 0.6,
  }));

  const pos = DOMAIN_POSITIONS[branch.name];
  if (!pos) return null;
  const symbol = DOMAIN_SYMBOLS[branch.name] ?? '\u25CF';

  return (
    <View
      style={[
        styles.domainIndicator,
        {
          top: pos.top as any,
          ...(pos.left != null ? { left: pos.left as any } : {}),
          ...(pos.right != null ? { right: pos.right as any } : {}),
          alignItems: pos.align === 'right' ? 'flex-end' : 'flex-start',
        },
      ]}
    >
      {/* Symbol + bar side by side */}
      <View style={[styles.symbolBarRow, pos.align === 'right' && { flexDirection: 'row-reverse' }]}>
        <TempoText variant="body" style={{ fontSize: 18, color: branch.tint }}>
          {symbol}
        </TempoText>
        <View style={styles.barTrack}>
          <Animated.View style={[styles.barFill, { backgroundColor: branch.tint }, barStyle]} />
        </View>
      </View>
      {/* Label */}
      <TempoText variant="caption" color={branch.tint} style={styles.domainLabel} numberOfLines={2}>
        {branch.name}
      </TempoText>
    </View>
  );
}

export function TempoTree({ score, branches }: TempoTreeProps) {
  const colors = useColors();
  const trunkProgress = useSharedValue(0);
  const lineColor = colors.ink3;

  useEffect(() => {
    trunkProgress.value = withTiming(score / 100, { duration: 1200, easing: TEMPO_EASING });
  }, [score]);

  return (
    <View style={styles.container}>
      {/* ── Tree structure (line drawing) ── */}

      {/* Canopy — overlapping rounded shapes suggesting dense foliage */}
      <View style={[styles.canopyMain, { borderColor: lineColor }]} />
      <View style={[styles.canopyLeft, { borderColor: lineColor }]} />
      <View style={[styles.canopyRight, { borderColor: lineColor }]} />
      <View style={[styles.canopyTopLeft, { borderColor: lineColor }]} />
      <View style={[styles.canopyTopRight, { borderColor: lineColor }]} />
      <View style={[styles.canopyTop, { borderColor: lineColor }]} />
      {/* Extra canopy lobes for fullness */}
      <View style={[styles.canopyFarLeft, { borderColor: lineColor }]} />
      <View style={[styles.canopyFarRight, { borderColor: lineColor }]} />

      {/* Main trunk — thick vertical */}
      <View style={[styles.trunk, { backgroundColor: lineColor }]} />

      {/* Major limbs branching from trunk */}
      <View style={[styles.limbLeft1, { backgroundColor: lineColor }]} />
      <View style={[styles.limbLeft2, { backgroundColor: lineColor }]} />
      <View style={[styles.limbRight1, { backgroundColor: lineColor }]} />
      <View style={[styles.limbRight2, { backgroundColor: lineColor }]} />

      {/* Secondary branches */}
      <View style={[styles.branchLeft1, { backgroundColor: lineColor }]} />
      <View style={[styles.branchRight1, { backgroundColor: lineColor }]} />

      {/* Ground line */}
      <View style={[styles.ground, { backgroundColor: colors.border }]} />

      {/* Root system — spreading lines below ground */}
      <View style={[styles.rootLeft1, { backgroundColor: lineColor }]} />
      <View style={[styles.rootLeft2, { backgroundColor: lineColor }]} />
      <View style={[styles.rootLeft3, { backgroundColor: lineColor }]} />
      <View style={[styles.rootRight1, { backgroundColor: lineColor }]} />
      <View style={[styles.rootRight2, { backgroundColor: lineColor }]} />
      <View style={[styles.rootRight3, { backgroundColor: lineColor }]} />
      <View style={[styles.rootCenter, { backgroundColor: lineColor }]} />

      {/* ── Domain indicators overlaid on tree ── */}
      {branches.map((b, i) => (
        <DomainIndicator key={b.name} branch={b} index={i} />
      ))}

      {/* Score at bottom */}
      <View style={styles.scoreRow}>
        <TempoText variant="data" color={colors.ink3} style={styles.scoreText}>
          {score}%
        </TempoText>
      </View>
    </View>
  );
}

const TREE_CENTER_X = '50%';
const TREE_BOTTOM = '32%'; // ground line position from bottom

const styles = StyleSheet.create({
  container: {
    height: 380,
    position: 'relative',
    overflow: 'hidden',
  },

  // ── Canopy clusters — overlapping ovals ──
  canopyMain: {
    position: 'absolute',
    top: '12%',
    left: '22%',
    width: '56%',
    height: '35%',
    borderRadius: 80,
    borderWidth: 1.2,
  },
  canopyLeft: {
    position: 'absolute',
    top: '18%',
    left: '10%',
    width: '35%',
    height: '28%',
    borderRadius: 60,
    borderWidth: 1,
  },
  canopyRight: {
    position: 'absolute',
    top: '18%',
    right: '10%',
    width: '35%',
    height: '28%',
    borderRadius: 60,
    borderWidth: 1,
  },
  canopyTopLeft: {
    position: 'absolute',
    top: '8%',
    left: '20%',
    width: '28%',
    height: '22%',
    borderRadius: 50,
    borderWidth: 1,
  },
  canopyTopRight: {
    position: 'absolute',
    top: '8%',
    right: '20%',
    width: '28%',
    height: '22%',
    borderRadius: 50,
    borderWidth: 1,
  },
  canopyTop: {
    position: 'absolute',
    top: '4%',
    left: '30%',
    width: '40%',
    height: '18%',
    borderRadius: 50,
    borderWidth: 1,
  },
  canopyFarLeft: {
    position: 'absolute',
    top: '25%',
    left: '4%',
    width: '24%',
    height: '20%',
    borderRadius: 45,
    borderWidth: 1,
  },
  canopyFarRight: {
    position: 'absolute',
    top: '25%',
    right: '4%',
    width: '24%',
    height: '20%',
    borderRadius: 45,
    borderWidth: 1,
  },

  // ── Trunk ──
  trunk: {
    position: 'absolute',
    bottom: '28%',
    left: '49%',
    width: 3,
    height: '30%',
    borderRadius: 1.5,
  },

  // ── Major limbs ──
  limbLeft1: {
    position: 'absolute',
    bottom: '42%',
    left: '36%',
    width: 2,
    height: '18%',
    borderRadius: 1,
    transform: [{ rotate: '-40deg' }],
  },
  limbLeft2: {
    position: 'absolute',
    bottom: '36%',
    left: '30%',
    width: 1.5,
    height: '15%',
    borderRadius: 1,
    transform: [{ rotate: '-55deg' }],
  },
  limbRight1: {
    position: 'absolute',
    bottom: '42%',
    right: '36%',
    width: 2,
    height: '18%',
    borderRadius: 1,
    transform: [{ rotate: '40deg' }],
  },
  limbRight2: {
    position: 'absolute',
    bottom: '36%',
    right: '30%',
    width: 1.5,
    height: '15%',
    borderRadius: 1,
    transform: [{ rotate: '55deg' }],
  },

  // ── Secondary branches ──
  branchLeft1: {
    position: 'absolute',
    bottom: '48%',
    left: '25%',
    width: 1,
    height: '12%',
    borderRadius: 0.5,
    transform: [{ rotate: '-30deg' }],
  },
  branchRight1: {
    position: 'absolute',
    bottom: '48%',
    right: '25%',
    width: 1,
    height: '12%',
    borderRadius: 0.5,
    transform: [{ rotate: '30deg' }],
  },

  // ── Ground ──
  ground: {
    position: 'absolute',
    bottom: '28%',
    left: '8%',
    right: '8%',
    height: 1,
  },

  // ── Root system — splaying lines below ground ──
  rootLeft1: {
    position: 'absolute',
    bottom: '18%',
    left: '28%',
    width: 1.5,
    height: '14%',
    borderRadius: 1,
    transform: [{ rotate: '-30deg' }],
  },
  rootLeft2: {
    position: 'absolute',
    bottom: '16%',
    left: '22%',
    width: 1,
    height: '12%',
    borderRadius: 0.5,
    transform: [{ rotate: '-50deg' }],
  },
  rootLeft3: {
    position: 'absolute',
    bottom: '18%',
    left: '18%',
    width: 1,
    height: '10%',
    borderRadius: 0.5,
    transform: [{ rotate: '-65deg' }],
  },
  rootRight1: {
    position: 'absolute',
    bottom: '18%',
    right: '28%',
    width: 1.5,
    height: '14%',
    borderRadius: 1,
    transform: [{ rotate: '30deg' }],
  },
  rootRight2: {
    position: 'absolute',
    bottom: '16%',
    right: '22%',
    width: 1,
    height: '12%',
    borderRadius: 0.5,
    transform: [{ rotate: '50deg' }],
  },
  rootRight3: {
    position: 'absolute',
    bottom: '18%',
    right: '18%',
    width: 1,
    height: '10%',
    borderRadius: 0.5,
    transform: [{ rotate: '65deg' }],
  },
  rootCenter: {
    position: 'absolute',
    bottom: '16%',
    left: '49%',
    width: 1,
    height: '13%',
    borderRadius: 0.5,
  },

  // ── Domain indicators ──
  domainIndicator: {
    position: 'absolute',
    width: 80,
  },
  symbolBarRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 4,
  },
  barTrack: {
    width: 4,
    height: 32,
    justifyContent: 'flex-end',
  },
  barFill: {
    width: 4,
    borderRadius: 2,
  },
  domainLabel: {
    fontSize: 10,
    lineHeight: 13,
    marginTop: 2,
  },

  // ── Score ──
  scoreRow: {
    position: 'absolute',
    bottom: spacing.sm,
    left: 0,
    right: 0,
    alignItems: 'center',
  },
  scoreText: {
    fontSize: 13,
    letterSpacing: 1,
  },
});
