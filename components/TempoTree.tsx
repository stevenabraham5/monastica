import React, { useEffect, useState, useMemo } from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withDelay,
  interpolate,
  Extrapolation,
  SharedValue,
} from 'react-native-reanimated';
import { TempoText } from './TempoText';
import { useColors } from '../constants/colors';
import { spacing } from '../constants/spacing';
import { TEMPO_EASING } from '../constants/motion';

/*
  TempoTree — transit/subway-map style visualization.

  8 domain "routes" arranged as a transit map:
  - Left terminals: Sleep, Movement, Creative, Nourishment
  - Right terminals: Professional Work, Learning, People, Professional Rel
  - Central interchange spine at x=50% connecting transfer points
  - Creative & Nourishment lines cross each other
  - Thickness scales with domain level, colors by domain tint
*/

interface DomainBranch {
  name: string;
  level: number;
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

const CONTAINER_HEIGHT = 300;

// Route definitions: [x%, y%] waypoints.
// Creative & Nourishment swap y-positions mid-route, creating a crossing.
const ROUTE_DEFS = [
  { name: 'Sleep & Recovery',           points: [[5,12],[36,12],[50,24]],             labelEnd: 'start' as const },
  { name: 'Professional Work',          points: [[50,24],[64,12],[95,12]],            labelEnd: 'end' as const },
  { name: 'Movement & Body',            points: [[5,40],[28,40],[50,40]],             labelEnd: 'start' as const },
  { name: 'Learning & Growth',          points: [[50,40],[62,52],[95,52]],            labelEnd: 'end' as const },
  // Creative renders before Nourishment — Nourishment crosses over
  { name: 'Creative Expression',        points: [[5,58],[22,58],[36,74],[50,74]],     labelEnd: 'start' as const },
  { name: 'Nourishment',                points: [[5,74],[22,74],[36,58],[50,58]],      labelEnd: 'start' as const },
  { name: 'Professional Relationships', points: [[50,58],[64,58],[78,70],[95,70]],    labelEnd: 'end' as const },
  { name: 'People I Love',              points: [[50,74],[64,86],[80,86],[95,86]],     labelEnd: 'end' as const },
];

const INTERCHANGES: [number, number][] = [
  [50, 24],
  [50, 40],
  [50, 58],
  [50, 74],
];

// ── Segment line between two pixel-coordinate points ──

function SegmentLine({
  x1, y1, x2, y2,
  thickness, color,
  progress, segIndex, totalSegs,
}: {
  x1: number; y1: number; x2: number; y2: number;
  thickness: number; color: string;
  progress: SharedValue<number>;
  segIndex: number; totalSegs: number;
}) {
  const dx = x2 - x1;
  const dy = y2 - y1;
  const length = Math.sqrt(dx * dx + dy * dy);
  const angleDeg = Math.atan2(dx, dy) * (180 / Math.PI);

  const style = useAnimatedStyle(() => {
    const seg = interpolate(
      progress.value,
      [segIndex / totalSegs, (segIndex + 1) / totalSegs],
      [0, 1],
      Extrapolation.CLAMP,
    );
    return {
      position: 'absolute' as const,
      left: x1 - thickness / 2,
      top: y1,
      width: thickness,
      height: length * seg,
      backgroundColor: color,
      borderRadius: thickness / 2,
      transform: [{ rotate: `${angleDeg}deg` }],
      transformOrigin: 'top center',
      opacity: interpolate(seg, [0, 0.05, 1], [0, 0.7, 1]),
    };
  });

  return <Animated.View style={style} />;
}

// ── Station dot ──

function StationDot({
  x, y, color, isInterchange, progress,
}: {
  x: number; y: number; color: string;
  isInterchange: boolean;
  progress: SharedValue<number>;
}) {
  const size = isInterchange ? 14 : 10;
  const bw = isInterchange ? 3 : 2.5;

  const style = useAnimatedStyle(() => ({
    opacity: progress.value,
    transform: [{ scale: interpolate(progress.value, [0, 1], [0.4, 1]) }],
  }));

  return (
    <Animated.View
      style={[
        {
          position: 'absolute',
          left: x - size / 2,
          top: y - size / 2,
          width: size,
          height: size,
          borderRadius: size / 2,
          backgroundColor: '#FAFAF8',
          borderWidth: bw,
          borderColor: color,
          zIndex: 2,
        },
        style,
      ]}
    />
  );
}

// ── Label at terminus ──

function RouteLabel({
  x, y, name, symbol, color, side, progress, containerWidth,
}: {
  x: number; y: number;
  name: string; symbol: string; color: string;
  side: 'start' | 'end';
  progress: SharedValue<number>;
  containerWidth: number;
}) {
  const style = useAnimatedStyle(() => ({
    opacity: progress.value,
    transform: [{ translateY: interpolate(progress.value, [0, 1], [4, 0]) }],
  }));

  if (side === 'start') {
    return (
      <Animated.View
        style={[
          {
            position: 'absolute',
            left: Math.max(x - 6, 0),
            top: y - 22,
            width: 90,
            flexDirection: 'row',
            alignItems: 'center',
            gap: 3,
            zIndex: 3,
          },
          style,
        ]}
      >
        <TempoText variant="body" style={{ fontSize: 13, color }}>{symbol}</TempoText>
        <TempoText variant="caption" color={color} style={{ fontSize: 9, lineHeight: 12 }} numberOfLines={2}>
          {name}
        </TempoText>
      </Animated.View>
    );
  }

  return (
    <Animated.View
      style={[
        {
          position: 'absolute',
          right: Math.max(containerWidth - x - 6, 0),
          top: y - 22,
          width: 100,
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'flex-end',
          gap: 3,
          zIndex: 3,
        },
        style,
      ]}
    >
      <TempoText variant="caption" color={color} style={{ fontSize: 9, lineHeight: 12, textAlign: 'right' }} numberOfLines={2}>
        {name}
      </TempoText>
      <TempoText variant="body" style={{ fontSize: 13, color }}>{symbol}</TempoText>
    </Animated.View>
  );
}

// ── Single route: segments + dots + label ──

function SubwayRoute({
  route, branch, index, cw, ch,
}: {
  route: typeof ROUTE_DEFS[0];
  branch: DomainBranch | undefined;
  index: number;
  cw: number;
  ch: number;
}) {
  const lineAnim = useSharedValue(0);
  const dotAnim = useSharedValue(0);

  useEffect(() => {
    lineAnim.value = withDelay(
      100 + index * 120,
      withTiming(1, { duration: 900, easing: TEMPO_EASING }),
    );
    dotAnim.value = withDelay(
      500 + index * 120,
      withTiming(1, { duration: 400, easing: TEMPO_EASING }),
    );
  }, []);

  const level = branch?.level ?? 0.5;
  const tint = branch?.tint ?? '#888780';
  const thickness = 4 + level * 5;
  const symbol = DOMAIN_SYMBOLS[route.name] ?? '\u25CF';

  const pts = route.points.map(([xp, yp]) => [
    (cw * xp) / 100,
    (ch * yp) / 100,
  ]);

  const totalSegs = pts.length - 1;
  const labelIdx = route.labelEnd === 'start' ? 0 : pts.length - 1;
  const isInterchangeX = (xp: number) => Math.abs(xp - 50) < 1;

  return (
    <>
      {pts.slice(0, -1).map((pt, si) => (
        <SegmentLine
          key={`s${index}-${si}`}
          x1={pt[0]} y1={pt[1]}
          x2={pts[si + 1][0]} y2={pts[si + 1][1]}
          thickness={thickness}
          color={tint}
          progress={lineAnim}
          segIndex={si}
          totalSegs={totalSegs}
        />
      ))}

      {pts.map((pt, pi) => (
        <StationDot
          key={`d${index}-${pi}`}
          x={pt[0]} y={pt[1]}
          color={tint}
          isInterchange={isInterchangeX(route.points[pi][0])}
          progress={dotAnim}
        />
      ))}

      <RouteLabel
        x={pts[labelIdx][0]} y={pts[labelIdx][1]}
        name={route.name}
        symbol={symbol}
        color={tint}
        side={route.labelEnd}
        progress={dotAnim}
        containerWidth={cw}
      />
    </>
  );
}

// ── Main component ──

export function TempoTree({ score, branches }: TempoTreeProps) {
  const colors = useColors();
  const [cw, setCw] = useState(Dimensions.get('window').width - 48);
  const ch = CONTAINER_HEIGHT;

  const branchMap = useMemo(
    () => new Map(branches.map((b) => [b.name, b])),
    [branches],
  );

  const spineAnim = useSharedValue(0);
  useEffect(() => {
    spineAnim.value = withDelay(50, withTiming(1, { duration: 600, easing: TEMPO_EASING }));
  }, []);

  const spineStyle = useAnimatedStyle(() => {
    const topY = (ch * INTERCHANGES[0][1]) / 100;
    const botY = (ch * INTERCHANGES[INTERCHANGES.length - 1][1]) / 100;
    return {
      position: 'absolute' as const,
      left: (cw * 50) / 100 - 1,
      top: topY,
      width: 2,
      height: (botY - topY) * spineAnim.value,
      backgroundColor: colors.border,
      opacity: 0.35 * spineAnim.value,
      borderRadius: 1,
    };
  });

  return (
    <View
      style={styles.container}
      onLayout={(e) => setCw(e.nativeEvent.layout.width)}
    >
      {/* Interchange spine */}
      <Animated.View style={spineStyle} />

      {/* Routes */}
      {ROUTE_DEFS.map((route, i) => (
        <SubwayRoute
          key={route.name}
          route={route}
          branch={branchMap.get(route.name)}
          index={i}
          cw={cw}
          ch={ch}
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
