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
  TempoTree — a Live Oak line drawing.

  Live oaks have a distinctive silhouette: a thick, gnarled trunk that
  splits low into massive lateral limbs that spread wider than the tree
  is tall — some nearly touching the ground. The canopy is broad, dense,
  and rounded. Spanish moss hangs from branch tips.

  Rendered as a single-weight line drawing (stroke, no fill).
  Domain branches radiate from the main structure. Their length and
  opacity reflect domain health. The overall Tempo score determines
  trunk width and canopy spread.
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

// Live oak branches spread wide and low — angles are mostly horizontal
const BRANCH_CONFIG = [
  { angle: -80, yRatio: 0.85, side: 'left' as const },  // high left
  { angle: -55, yRatio: 0.65, side: 'left' as const },  // mid-left sweeping
  { angle: -30, yRatio: 0.45, side: 'left' as const },  // low left (nearly horizontal)
  { angle: -15, yRatio: 0.30, side: 'left' as const },  // very low sweep
  { angle: 80,  yRatio: 0.85, side: 'right' as const }, // high right
  { angle: 55,  yRatio: 0.65, side: 'right' as const }, // mid-right sweeping
  { angle: 30,  yRatio: 0.45, side: 'right' as const }, // low right
  { angle: 15,  yRatio: 0.30, side: 'right' as const }, // very low sweep
];

const TRUNK_HEIGHT = 100;
const CANOPY_WIDTH = 260;

function OakBranch({ branch, config, index }: {
  branch: DomainBranch;
  config: typeof BRANCH_CONFIG[0];
  index: number;
}) {
  const colors = useColors();
  const progress = useSharedValue(0);

  useEffect(() => {
    progress.value = withDelay(
      300 + index * 100,
      withTiming(branch.level, { duration: 1000, easing: TEMPO_EASING }),
    );
  }, [branch.level]);

  // Main limb — thick, drawn as a line
  const limbStyle = useAnimatedStyle(() => {
    const length = 30 + progress.value * 55;
    const thickness = 1.5 + progress.value * 1;
    return {
      width: thickness,
      height: length,
      backgroundColor: branch.tint,
      opacity: 0.35 + progress.value * 0.65,
      transform: [{ rotate: `${config.angle}deg` }],
      borderRadius: 1,
    };
  });

  // Canopy cluster at branch tip — small circles suggesting leaf mass
  const canopyStyle = useAnimatedStyle(() => {
    const size = 10 + progress.value * 20;
    return {
      width: size,
      height: size * 0.7,
      borderRadius: size / 2,
      borderWidth: 1,
      borderColor: branch.tint,
      opacity: 0.2 + progress.value * 0.5,
    };
  });

  // Sub-branch — a smaller fork off the main limb
  const subBranchStyle = useAnimatedStyle(() => {
    const length = 10 + progress.value * 20;
    const subAngle = config.angle + (config.side === 'left' ? -20 : 20);
    return {
      width: 1,
      height: length,
      backgroundColor: branch.tint,
      opacity: 0.2 + progress.value * 0.4,
      transform: [{ rotate: `${subAngle}deg` }],
      borderRadius: 0.5,
    };
  });

  // Moss — thin hanging lines from branch ends
  const mossStyle = useAnimatedStyle(() => ({
    width: 1,
    height: 8 + progress.value * 12,
    backgroundColor: colors.ink3,
    opacity: 0.1 + progress.value * 0.15,
  }));

  const yPos = config.yRatio * TRUNK_HEIGHT;

  return (
    <View style={[
      styles.branchAnchor,
      {
        bottom: yPos,
        [config.side === 'left' ? 'right' : 'left']: '50%',
      },
    ]}>
      <View style={styles.branchGroup}>
        <Animated.View style={limbStyle} />
        <Animated.View style={[styles.canopy, canopyStyle]} />
        <Animated.View style={[styles.subBranch, subBranchStyle]} />
        <Animated.View style={[styles.moss, mossStyle]} />
      </View>
    </View>
  );
}

export function TempoTree({ score, branches }: TempoTreeProps) {
  const colors = useColors();
  const trunkProgress = useSharedValue(0);

  useEffect(() => {
    trunkProgress.value = withTiming(score / 100, { duration: 1200, easing: TEMPO_EASING });
  }, [score]);

  // Trunk grows wider and taller with score
  const trunkStyle = useAnimatedStyle(() => {
    const height = 60 + trunkProgress.value * (TRUNK_HEIGHT - 60);
    const width = 3 + trunkProgress.value * 3;
    return { height, width, borderRadius: width / 2 };
  });

  // Root flare — live oaks have buttressed roots
  const rootLeftStyle = useAnimatedStyle(() => ({
    width: 1.5,
    height: 15 + trunkProgress.value * 10,
    opacity: 0.3 + trunkProgress.value * 0.4,
    transform: [{ rotate: '-35deg' }],
  }));

  const rootRightStyle = useAnimatedStyle(() => ({
    width: 1.5,
    height: 15 + trunkProgress.value * 10,
    opacity: 0.3 + trunkProgress.value * 0.4,
    transform: [{ rotate: '35deg' }],
  }));

  const rootCenterStyle = useAnimatedStyle(() => ({
    width: 1,
    height: 10 + trunkProgress.value * 8,
    opacity: 0.2 + trunkProgress.value * 0.3,
    transform: [{ rotate: '12deg' }],
  }));

  return (
    <View style={styles.container}>
      {/* Ground line */}
      <View style={[styles.ground, { backgroundColor: colors.border }]} />

      {/* Root flare */}
      <View style={styles.rootContainer}>
        <Animated.View style={[{ backgroundColor: colors.ink3, borderRadius: 1 }, rootLeftStyle]} />
        <Animated.View style={[{ backgroundColor: colors.ink3, borderRadius: 1 }, rootCenterStyle]} />
        <Animated.View style={[{ backgroundColor: colors.ink3, borderRadius: 1 }, rootRightStyle]} />
      </View>

      {/* Trunk — thick, slightly gnarled */}
      <View style={styles.trunkContainer}>
        <Animated.View style={[{ backgroundColor: colors.ink3 }, trunkStyle]} />

        {/* Branches — domain limbs */}
        {branches.map((b, i) => (
          <OakBranch
            key={b.name}
            branch={b}
            config={BRANCH_CONFIG[i % BRANCH_CONFIG.length]}
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
    height: 280,
    alignItems: 'center',
    justifyContent: 'flex-end',
    position: 'relative',
    overflow: 'hidden',
  },
  ground: {
    position: 'absolute',
    bottom: 40,
    left: '10%',
    right: '10%',
    height: 1,
  },
  rootContainer: {
    position: 'absolute',
    bottom: 28,
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
  },
  trunkContainer: {
    position: 'absolute',
    bottom: 40,
    alignItems: 'center',
    width: CANOPY_WIDTH,
  },
  branchAnchor: {
    position: 'absolute',
  },
  branchGroup: {
    alignItems: 'center',
  },
  canopy: {
    position: 'absolute',
    top: -8,
  },
  subBranch: {
    position: 'absolute',
    top: '40%',
  },
  moss: {
    position: 'absolute',
    bottom: -8,
  },
  scoreRow: {
    position: 'absolute',
    bottom: spacing.base,
    alignItems: 'center',
  },
  scoreText: {
    fontSize: 13,
    letterSpacing: 1,
  },
});
