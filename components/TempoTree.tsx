import React, { useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withDelay,
  interpolate,
} from 'react-native-reanimated';
import { TempoText } from './TempoText';
import { useColors } from '../constants/colors';
import { spacing } from '../constants/spacing';
import { TEMPO_EASING } from '../constants/motion';

/*
  TempoTree — canonical Live Oak visualization.

  Grows from roots up: roots → trunk → 8 domain branches → canopy leaves.
  Each branch IS a domain. Its color = domain tint, its thickness + length
  reflect the domain's current level. Labels + symbols sit at branch tips.

  Animation sequence (staggered withDelay):
    0ms      — roots emerge
    400ms    — trunk grows upward
    800ms    — branches fan out (each domain)
    1200ms+  — canopy puffs appear at branch tips

  Built with React Native Views as strokes — no SVG dependency.
*/

interface DomainBranch {
  name: string;
  level: number; // 0..1
  tint: string;
}

interface TempoTreeProps {
  score: number;
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

// Each branch position — angle from vertical, how high it forks from trunk,
// and which side to place the label.
// 4 left branches, 4 right branches, spreading like a real live oak.
const BRANCH_LAYOUT = [
  // Left side — top to bottom
  { angle: -70, forkRatio: 0.90, side: 'left' as const, labelOffset: { x: -60, y: -18 } },
  { angle: -50, forkRatio: 0.75, side: 'left' as const, labelOffset: { x: -66, y: -12 } },
  { angle: -30, forkRatio: 0.55, side: 'left' as const, labelOffset: { x: -70, y: -8 } },
  { angle: -15, forkRatio: 0.38, side: 'left' as const, labelOffset: { x: -72, y: -4 } },
  // Right side — top to bottom
  { angle: 70,  forkRatio: 0.90, side: 'right' as const, labelOffset: { x: 14, y: -18 } },
  { angle: 50,  forkRatio: 0.75, side: 'right' as const, labelOffset: { x: 18, y: -12 } },
  { angle: 30,  forkRatio: 0.55, side: 'right' as const, labelOffset: { x: 20, y: -8 } },
  { angle: 15,  forkRatio: 0.38, side: 'right' as const, labelOffset: { x: 22, y: -4 } },
];

const TRUNK_HEIGHT = 130;
const GROUND_BOTTOM = 80; // px from container bottom

// ── Animated domain branch ──

function DomainBranchView({ branch, layout, index }: {
  branch: DomainBranch;
  layout: typeof BRANCH_LAYOUT[0];
  index: number;
}) {
  const colors = useColors();
  const grow = useSharedValue(0);
  const canopyGrow = useSharedValue(0);

  useEffect(() => {
    // Branch grows after trunk (800ms base + stagger)
    grow.value = withDelay(
      800 + index * 100,
      withTiming(1, { duration: 800, easing: TEMPO_EASING }),
    );
    // Canopy puff appears after branch
    canopyGrow.value = withDelay(
      1200 + index * 100,
      withTiming(1, { duration: 600, easing: TEMPO_EASING }),
    );
  }, []);

  // Branch line — length and thickness scale with domain level
  const branchStyle = useAnimatedStyle(() => {
    const progress = grow.value;
    const baseLength = 35 + branch.level * 55; // 35–90px
    const thickness = 1.5 + branch.level * 2.5; // 1.5–4px
    return {
      width: thickness * progress,
      height: baseLength * progress,
      backgroundColor: branch.tint,
      opacity: interpolate(progress, [0, 0.3, 1], [0, 0.5, 0.7 + branch.level * 0.3]),
      transform: [{ rotate: `${layout.angle}deg` }],
      borderRadius: thickness,
    };
  });

  // Sub-branch forking from main branch
  const subAngle = layout.angle + (layout.side === 'left' ? -25 : 25);
  const subBranchStyle = useAnimatedStyle(() => {
    const progress = grow.value;
    const len = 15 + branch.level * 25;
    return {
      width: 1 * progress,
      height: len * progress,
      backgroundColor: branch.tint,
      opacity: interpolate(progress, [0, 0.5, 1], [0, 0.2, 0.3 + branch.level * 0.3]),
      transform: [{ rotate: `${subAngle}deg` }],
      borderRadius: 1,
    };
  });

  // Canopy puff at branch tip
  const canopyStyle = useAnimatedStyle(() => {
    const p = canopyGrow.value;
    const size = (16 + branch.level * 22) * p;
    return {
      width: size,
      height: size * 0.75,
      borderRadius: size / 2,
      backgroundColor: branch.tint,
      opacity: interpolate(p, [0, 1], [0, 0.12 + branch.level * 0.12]),
    };
  });

  // Label + symbol fade in
  const labelStyle = useAnimatedStyle(() => ({
    opacity: interpolate(canopyGrow.value, [0, 0.5, 1], [0, 0, 1]),
  }));

  const symbol = DOMAIN_SYMBOLS[branch.name] ?? '\u25CF';
  const forkY = GROUND_BOTTOM + layout.forkRatio * TRUNK_HEIGHT;

  return (
    <View style={[styles.branchOrigin, { bottom: forkY }]}>
      {/* Main branch */}
      <Animated.View style={branchStyle} />

      {/* Sub-branch */}
      <Animated.View style={[styles.subBranch, subBranchStyle]} />

      {/* Canopy puff */}
      <Animated.View style={[styles.canopyPuff, canopyStyle]} />

      {/* Label */}
      <Animated.View style={[
        styles.labelContainer,
        {
          [layout.side === 'left' ? 'right' : 'left']: 0,
          transform: [
            { translateX: layout.labelOffset.x },
            { translateY: layout.labelOffset.y },
          ],
        },
        labelStyle,
      ]}>
        <View style={[styles.labelRow, layout.side === 'right' && { flexDirection: 'row' }]}>
          <TempoText variant="body" style={{ fontSize: 14, color: branch.tint }}>
            {symbol}
          </TempoText>
        </View>
        <TempoText
          variant="caption"
          color={branch.tint}
          style={[styles.branchLabel, { textAlign: layout.side }]}
          numberOfLines={2}
        >
          {branch.name}
        </TempoText>
      </Animated.View>
    </View>
  );
}

// ── Main tree ──

export function TempoTree({ score, branches }: TempoTreeProps) {
  const colors = useColors();
  const rootGrow = useSharedValue(0);
  const trunkGrow = useSharedValue(0);

  useEffect(() => {
    // Roots first
    rootGrow.value = withTiming(1, { duration: 600, easing: TEMPO_EASING });
    // Trunk after roots
    trunkGrow.value = withDelay(
      400,
      withTiming(1, { duration: 700, easing: TEMPO_EASING }),
    );
  }, []);

  // Trunk — grows upward from ground
  const trunkStyle = useAnimatedStyle(() => ({
    height: TRUNK_HEIGHT * trunkGrow.value,
    opacity: interpolate(trunkGrow.value, [0, 0.2, 1], [0, 0.6, 1]),
  }));

  // Roots grow outward
  const makeRootStyle = (angle: number, length: number, delay: number) => {
    const style = useAnimatedStyle(() => ({
      height: length * rootGrow.value,
      opacity: interpolate(rootGrow.value, [0, 0.3, 1], [0, 0.3, 0.5]),
      transform: [{ rotate: `${angle}deg` }],
    }));
    return style;
  };

  const rootStyles = [
    makeRootStyle(-25, 45, 0),
    makeRootStyle(-50, 35, 50),
    makeRootStyle(-70, 28, 100),
    makeRootStyle(25, 45, 0),
    makeRootStyle(50, 35, 50),
    makeRootStyle(70, 28, 100),
    makeRootStyle(-8, 38, 30),
    makeRootStyle(8, 32, 30),
  ];

  const barkColor = colors.ink3;

  return (
    <View style={styles.container}>
      {/* Ground line */}
      <View style={[styles.ground, { backgroundColor: colors.border, bottom: GROUND_BOTTOM }]} />

      {/* Root system — grows first */}
      <View style={[styles.rootOrigin, { bottom: GROUND_BOTTOM }]}>
        {rootStyles.map((rs, i) => (
          <Animated.View
            key={i}
            style={[{ position: 'absolute', width: 1.5, borderRadius: 1, backgroundColor: barkColor }, rs]}
          />
        ))}
      </View>

      {/* Trunk — grows upward after roots */}
      <Animated.View style={[styles.trunk, { backgroundColor: barkColor, bottom: GROUND_BOTTOM }, trunkStyle]} />

      {/* Trunk texture lines */}
      <Animated.View style={[styles.trunkTexture1, { backgroundColor: barkColor, bottom: GROUND_BOTTOM + 20 }, { opacity: trunkGrow }]} />
      <Animated.View style={[styles.trunkTexture2, { backgroundColor: barkColor, bottom: GROUND_BOTTOM + 50 }, { opacity: trunkGrow }]} />

      {/* Domain branches — each one IS a domain */}
      <View style={[styles.branchesContainer, { bottom: 0 }]}>
        {branches.map((b, i) => (
          <DomainBranchView
            key={b.name}
            branch={b}
            layout={BRANCH_LAYOUT[i % BRANCH_LAYOUT.length]}
            index={i}
          />
        ))}
      </View>

      {/* Score */}
      <View style={styles.scoreRow}>
        <TempoText variant="data" color={colors.ink3} style={styles.scoreText}>
          {score}%
        </TempoText>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    height: 400,
    position: 'relative',
    overflow: 'hidden',
  },

  // Ground
  ground: {
    position: 'absolute',
    left: '10%',
    right: '10%',
    height: 1,
  },

  // Roots
  rootOrigin: {
    position: 'absolute',
    left: '50%',
    alignItems: 'center',
  },

  // Trunk
  trunk: {
    position: 'absolute',
    left: '50%',
    marginLeft: -2,
    width: 4,
    borderRadius: 2,
  },
  trunkTexture1: {
    position: 'absolute',
    left: '50%',
    marginLeft: 3,
    width: 1,
    height: 15,
    borderRadius: 0.5,
    opacity: 0.2,
  },
  trunkTexture2: {
    position: 'absolute',
    left: '50%',
    marginLeft: -4,
    width: 1,
    height: 12,
    borderRadius: 0.5,
    opacity: 0.15,
  },

  // Branch container
  branchesContainer: {
    position: 'absolute',
    left: '50%',
    top: 0,
    width: 0,
    height: '100%',
  },

  branchOrigin: {
    position: 'absolute',
    alignItems: 'center',
  },

  subBranch: {
    position: 'absolute',
    top: '50%',
  },

  canopyPuff: {
    position: 'absolute',
    top: -12,
  },

  // Labels
  labelContainer: {
    position: 'absolute',
    top: -16,
    width: 70,
  },
  labelRow: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    gap: 3,
  },
  branchLabel: {
    fontSize: 9,
    lineHeight: 12,
    marginTop: 1,
  },

  // Score
  scoreRow: {
    position: 'absolute',
    bottom: spacing.xs,
    left: 0,
    right: 0,
    alignItems: 'center',
  },
  scoreText: {
    fontSize: 13,
    letterSpacing: 1,
  },
});
