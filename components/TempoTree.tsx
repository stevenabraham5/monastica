import React from 'react';
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
import { useEffect } from 'react';

/*
  TempoTree — a generative Joshua Tree visualization.

  The tree grows from a base trunk, with branches reaching outward.
  Each branch represents a life domain. Its length + opacity reflect
  how full that domain is. Boulders (rounded shapes) sit around the
  base — they represent the obstacles and constraints the tree is
  growing around and through.

  The overall Tempo score determines the trunk height and canopy density.
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

const BRANCH_ANGLES = [-65, -40, -20, 20, 40, 65, -50, 50]; // degrees from vertical
const TRUNK_BASE = 160;
const TRUNK_MIN = 60;

function AnimatedBranch({ branch, angle, index, score }: {
  branch: DomainBranch;
  angle: number;
  index: number;
  score: number;
}) {
  const progress = useSharedValue(0);

  useEffect(() => {
    progress.value = withDelay(
      200 + index * 80,
      withTiming(branch.level, { duration: 900, easing: TEMPO_EASING }),
    );
  }, [branch.level]);

  const branchStyle = useAnimatedStyle(() => {
    const length = 20 + progress.value * 50;
    const opacity = 0.3 + progress.value * 0.7;
    return {
      width: 2,
      height: length,
      opacity,
      backgroundColor: branch.tint,
      transform: [{ rotate: `${angle}deg` }],
    };
  });

  // Small canopy node at branch tip
  const nodeStyle = useAnimatedStyle(() => {
    const size = 6 + progress.value * 14;
    return {
      width: size,
      height: size,
      borderRadius: size / 2,
      backgroundColor: branch.tint,
      opacity: 0.25 + progress.value * 0.55,
    };
  });

  // Position branch along the trunk
  const trunkHeight = TRUNK_MIN + (score / 100) * (TRUNK_BASE - TRUNK_MIN);
  const verticalPos = 10 + (index % 4) * (trunkHeight * 0.2);
  const side = angle < 0 ? 'left' : 'right';

  return (
    <View style={[
      styles.branchAnchor,
      {
        bottom: verticalPos,
        [side === 'left' ? 'right' : 'left']: '50%',
      },
    ]}>
      <View style={styles.branchGroup}>
        <Animated.View style={branchStyle} />
        <Animated.View style={[styles.node, nodeStyle]} />
      </View>
    </View>
  );
}

export function TempoTree({ score, branches }: TempoTreeProps) {
  const colors = useColors();
  const trunkProgress = useSharedValue(0);

  useEffect(() => {
    trunkProgress.value = withTiming(score / 100, { duration: 1100, easing: TEMPO_EASING });
  }, [score]);

  const trunkStyle = useAnimatedStyle(() => {
    const height = TRUNK_MIN + trunkProgress.value * (TRUNK_BASE - TRUNK_MIN);
    return { height };
  });

  const trunkHeight = TRUNK_MIN + (score / 100) * (TRUNK_BASE - TRUNK_MIN);

  return (
    <View style={styles.container}>
      {/* Boulders — the constraints the tree grows around */}
      <View style={[styles.boulder, styles.boulderLeft, { backgroundColor: colors.border }]} />
      <View style={[styles.boulder, styles.boulderRight, { backgroundColor: colors.borderMid }]} />
      <View style={[styles.boulder, styles.boulderSmall, { backgroundColor: colors.border }]} />

      {/* Ground line */}
      <View style={[styles.ground, { backgroundColor: colors.border }]} />

      {/* Trunk */}
      <View style={styles.trunkContainer}>
        <Animated.View style={[styles.trunk, { backgroundColor: colors.ink3 }, trunkStyle]} />

        {/* Branches */}
        {branches.map((b, i) => (
          <AnimatedBranch
            key={b.name}
            branch={b}
            angle={BRANCH_ANGLES[i % BRANCH_ANGLES.length]}
            index={i}
            score={score}
          />
        ))}
      </View>

      {/* Score label at base */}
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
    height: 260,
    alignItems: 'center',
    justifyContent: 'flex-end',
    position: 'relative',
    overflow: 'hidden',
  },
  ground: {
    position: 'absolute',
    bottom: 40,
    left: 0,
    right: 0,
    height: 1,
  },
  trunkContainer: {
    position: 'absolute',
    bottom: 40,
    alignItems: 'center',
    width: 200,
  },
  trunk: {
    width: 3,
    borderRadius: 1.5,
  },
  branchAnchor: {
    position: 'absolute',
  },
  branchGroup: {
    alignItems: 'center',
  },
  node: {
    position: 'absolute',
    top: -4,
  },
  // Boulders
  boulder: {
    position: 'absolute',
    borderRadius: 999,
  },
  boulderLeft: {
    bottom: 28,
    left: '25%',
    width: 44,
    height: 28,
  },
  boulderRight: {
    bottom: 30,
    right: '22%',
    width: 32,
    height: 22,
  },
  boulderSmall: {
    bottom: 34,
    left: '42%',
    width: 18,
    height: 14,
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
