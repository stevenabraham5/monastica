import React, { useEffect } from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
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
  TempoTree — subway-map style visualization.

  All 8 domain "lines" originate from a single root at the bottom center
  and travel upward, curving outward like transit lines on a map.
  Each line is colored by its domain tint. Line thickness reflects
  the domain's current level. Labels + symbols sit at the terminus.

  Animation: lines grow upward from the root, staggered.
  The trunk is a shared segment at the bottom before lines diverge.
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

// Each line's path: starts at center bottom, shares a trunk segment,
// then curves to its final X position at the top.
// xEnd = final horizontal position as % of container width
// The vertical segment rises, then a diagonal/curved segment fans out.
const LINE_PATHS = [
  // Left lines (spread left from center)
  { xEnd: 8,  trunkSplit: 0.70, side: 'left' as const },   // Sleep — far left, high split
  { xEnd: 18, trunkSplit: 0.60, side: 'left' as const },   // Movement
  { xEnd: 28, trunkSplit: 0.45, side: 'left' as const },   // Nourishment
  { xEnd: 38, trunkSplit: 0.30, side: 'left' as const },   // Creative — near center
  // Right lines (spread right from center)
  { xEnd: 62, trunkSplit: 0.30, side: 'right' as const },  // Professional Work — near center
  { xEnd: 72, trunkSplit: 0.45, side: 'right' as const },  // Learning
  { xEnd: 82, trunkSplit: 0.60, side: 'right' as const },  // People I Love
  { xEnd: 92, trunkSplit: 0.70, side: 'right' as const },  // Professional Relationships — far right
];

const CONTAINER_HEIGHT = 420;
const ROOT_BOTTOM = 60;       // px from bottom for root dot
const TRUNK_TOP = 0.15;       // top of branches as ratio of height
const TRUNK_BOTTOM = 0.85;    // bottom of trunk as ratio of height

function SubwayLine({ branch, path, index }: {
  branch: DomainBranch;
  path: typeof LINE_PATHS[0];
  index: number;
}) {
  const colors = useColors();
  const grow = useSharedValue(0);
  const labelShow = useSharedValue(0);

  useEffect(() => {
    grow.value = withDelay(
      300 + index * 120,
      withTiming(1, { duration: 1000, easing: TEMPO_EASING }),
    );
    labelShow.value = withDelay(
      900 + index * 120,
      withTiming(1, { duration: 500, easing: TEMPO_EASING }),
    );
  }, []);

  const thickness = 2.5 + branch.level * 4; // 2.5–6.5px

  // Vertical segment — from split point upward in the shared trunk area
  const splitY = TRUNK_BOTTOM - path.trunkSplit * (TRUNK_BOTTOM - TRUNK_TOP);
  const vertSegmentTop = splitY;
  const vertSegmentHeight = TRUNK_BOTTOM - splitY;

  const vertStyle = useAnimatedStyle(() => {
    const progress = grow.value;
    return {
      position: 'absolute' as const,
      left: '50%',
      marginLeft: -thickness / 2,
      top: `${(vertSegmentTop + vertSegmentHeight * (1 - progress)) * 100}%` as any,
      height: `${vertSegmentHeight * progress * 100}%` as any,
      width: thickness,
      backgroundColor: branch.tint,
      opacity: interpolate(progress, [0, 0.2, 1], [0, 0.4, 0.7 + branch.level * 0.3]),
      borderRadius: thickness / 2,
    };
  });

  // Diagonal segment — from split point up to the terminus position
  // We approximate the curve with a rotated rectangle
  const centerX = 50; // percent
  const deltaX = path.xEnd - centerX; // how far left/right from center
  const diagonalTop = TRUNK_TOP;
  const diagonalBottom = splitY;
  const diagonalHeight = diagonalBottom - diagonalTop;

  // Calculate rotation angle for the diagonal
  // We need to go deltaX% horizontally over diagonalHeight% vertically
  const containerWidth = Dimensions.get('window').width - 32; // approximate padding
  const pixelDeltaX = (deltaX / 100) * containerWidth;
  const pixelDeltaY = diagonalHeight * CONTAINER_HEIGHT;
  const angleRad = Math.atan2(pixelDeltaX, pixelDeltaY);
  const angleDeg = (angleRad * 180) / Math.PI;
  const diagonalLength = Math.sqrt(pixelDeltaX * pixelDeltaX + pixelDeltaY * pixelDeltaY);

  const diagStyle = useAnimatedStyle(() => {
    const progress = grow.value;
    return {
      position: 'absolute' as const,
      left: '50%',
      marginLeft: -thickness / 2,
      top: `${splitY * 100}%` as any,
      height: diagonalLength * progress,
      width: thickness,
      backgroundColor: branch.tint,
      opacity: interpolate(progress, [0, 0.3, 1], [0, 0.3, 0.7 + branch.level * 0.3]),
      borderRadius: thickness / 2,
      transform: [
        { rotate: `${angleDeg}deg` },
      ],
      transformOrigin: 'bottom center',
    };
  });

  // Terminus dot
  const dotStyle = useAnimatedStyle(() => {
    const size = 8 + branch.level * 6;
    return {
      width: size,
      height: size,
      borderRadius: size / 2,
      borderWidth: 2,
      borderColor: branch.tint,
      backgroundColor: 'transparent',
      opacity: labelShow.value,
    };
  });

  // Label
  const labelStyle = useAnimatedStyle(() => ({
    opacity: labelShow.value,
  }));

  const symbol = DOMAIN_SYMBOLS[branch.name] ?? '\u25CF';
  const labelSide = path.side;

  return (
    <>
      {/* Shared trunk segment (colored) */}
      <Animated.View style={vertStyle} />

      {/* Diagonal spread segment */}
      <Animated.View style={diagStyle} />

      {/* Terminus — dot + label at top */}
      <Animated.View style={[
        styles.terminus,
        {
          left: `${path.xEnd}%`,
          top: `${TRUNK_TOP * 100 - 2}%`,
        },
      ]}>
        <Animated.View style={dotStyle} />
        <Animated.View style={[
          styles.terminusLabel,
          labelSide === 'left' ? { alignItems: 'flex-end', right: 18 } : { alignItems: 'flex-start', left: 18 },
          labelStyle,
        ]}>
          <TempoText variant="body" style={{ fontSize: 16, color: branch.tint }}>
            {symbol}
          </TempoText>
          <TempoText variant="caption" color={branch.tint} style={styles.lineName} numberOfLines={2}>
            {branch.name}
          </TempoText>
        </Animated.View>
      </Animated.View>
    </>
  );
}

export function TempoTree({ score, branches }: TempoTreeProps) {
  const colors = useColors();
  const trunkGrow = useSharedValue(0);
  const rootGrow = useSharedValue(0);

  useEffect(() => {
    rootGrow.value = withTiming(1, { duration: 400, easing: TEMPO_EASING });
    trunkGrow.value = withDelay(200, withTiming(1, { duration: 600, easing: TEMPO_EASING }));
  }, []);

  // Shared trunk — grows up from root
  const trunkStyle = useAnimatedStyle(() => ({
    height: `${(TRUNK_BOTTOM - 0.50) * 100 * trunkGrow.value}%` as any,
    opacity: interpolate(trunkGrow.value, [0, 0.3, 1], [0, 0.5, 0.8]),
  }));

  // Root dot
  const rootDotStyle = useAnimatedStyle(() => ({
    opacity: rootGrow.value,
    transform: [{ scale: rootGrow.value }],
  }));

  // Root lines
  const rootLineStyle = (angle: number, len: number) => useAnimatedStyle(() => ({
    height: len * rootGrow.value,
    opacity: interpolate(rootGrow.value, [0, 1], [0, 0.3]),
    transform: [{ rotate: `${angle}deg` }],
  }));

  const rootLines = [
    rootLineStyle(-35, 30), rootLineStyle(-55, 22), rootLineStyle(-15, 24),
    rootLineStyle(35, 30), rootLineStyle(55, 22), rootLineStyle(15, 24),
    rootLineStyle(-75, 18), rootLineStyle(75, 18),
  ];

  return (
    <View style={styles.container}>
      {/* Root system */}
      <View style={[styles.rootOrigin, { bottom: ROOT_BOTTOM - 10 }]}>
        {rootLines.map((rs, i) => (
          <Animated.View
            key={i}
            style={[{ position: 'absolute', width: 1.5, borderRadius: 1, backgroundColor: colors.ink3 }, rs]}
          />
        ))}
      </View>

      {/* Root dot */}
      <Animated.View style={[
        styles.rootDot,
        { backgroundColor: colors.ink3, bottom: ROOT_BOTTOM },
        rootDotStyle,
      ]} />

      {/* Shared trunk segment */}
      <Animated.View style={[
        styles.trunk,
        { backgroundColor: colors.ink3 },
        trunkStyle,
      ]} />

      {/* Domain lines */}
      {branches.map((b, i) => (
        <SubwayLine
          key={b.name}
          branch={b}
          path={LINE_PATHS[i % LINE_PATHS.length]}
          index={i}
        />
      ))}

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
    height: CONTAINER_HEIGHT,
    position: 'relative',
    overflow: 'hidden',
  },

  rootOrigin: {
    position: 'absolute',
    left: '50%',
    alignItems: 'center',
  },
  rootDot: {
    position: 'absolute',
    left: '50%',
    marginLeft: -5,
    width: 10,
    height: 10,
    borderRadius: 5,
  },

  trunk: {
    position: 'absolute',
    left: '50%',
    marginLeft: -2,
    bottom: ROOT_BOTTOM + 10,
    width: 4,
    borderRadius: 2,
  },

  terminus: {
    position: 'absolute',
    marginLeft: -7,
    marginTop: -7,
    alignItems: 'center',
    justifyContent: 'center',
    width: 14,
    height: 14,
  },
  terminusLabel: {
    position: 'absolute',
    top: -4,
    width: 75,
  },
  lineName: {
    fontSize: 10,
    lineHeight: 13,
    marginTop: 1,
  },

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
