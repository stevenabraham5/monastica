import React, { useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { TempoText } from './TempoText';
import { useColors } from '../constants/colors';
import { spacing } from '../constants/spacing';

/*
  GrowRadar — radar / spider chart for the Grow tab.
  8 axes radiating from center, filled polygon showing levels.
  High contrast, clean labels.
*/

interface DomainBranch {
  name: string;
  level: number;
  tint: string;
}

interface GrowRadarProps {
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
  'Movement & Body': 'Move',
  'Nourishment': 'Nourish',
  'Creative Expression': 'Create',
  'Professional Work': 'Work',
  'Learning & Growth': 'Learn',
  'People I Love': 'People',
  'Professional Relationships': 'Prof',
};

export function GrowRadar({ score, branches }: GrowRadarProps) {
  const colors = useColors();
  const [size, setSize] = useState(0);
  const cx = size / 2;
  const cy = size / 2;
  const radius = (size / 2) - 48;
  const n = branches.length || 8;

  const getPoint = (idx: number, level: number) => {
    const angle = (Math.PI * 2 * idx) / n - Math.PI / 2;
    return {
      x: cx + Math.cos(angle) * radius * level,
      y: cy + Math.sin(angle) * radius * level,
    };
  };

  return (
    <View
      style={styles.container}
      onLayout={(e) => setSize(e.nativeEvent.layout.width)}
    >
      {size > 0 && (
        <>
          {/* Grid rings */}
          {[0.25, 0.5, 0.75, 1.0].map((ring) => (
            <View
              key={ring}
              style={[
                styles.ring,
                {
                  left: cx - radius * ring,
                  top: cy - radius * ring,
                  width: radius * ring * 2,
                  height: radius * ring * 2,
                  borderRadius: radius * ring,
                  borderColor: colors.border,
                },
              ]}
            />
          ))}

          {/* Axis lines + labels */}
          {branches.map((b, i) => {
            const pt = getPoint(i, 1.0);
            const labelPt = getPoint(i, 1.25);
            const symbol = DOMAIN_SYMBOLS[b.name] ?? '\u25CF';
            const short = SHORT_NAMES[b.name] ?? b.name;
            return (
              <View key={b.name}>
                {/* Axis line */}
                <View
                  style={[
                    styles.axisLine,
                    {
                      left: cx,
                      top: cy,
                      width: Math.sqrt((pt.x - cx) ** 2 + (pt.y - cy) ** 2),
                      transform: [
                        { rotate: `${Math.atan2(pt.y - cy, pt.x - cx) * 180 / Math.PI}deg` },
                      ],
                      transformOrigin: 'left center',
                      backgroundColor: colors.border,
                    },
                  ]}
                />
                {/* Level dot */}
                {(() => {
                  const dp = getPoint(i, b.level);
                  return (
                    <View
                      style={[
                        styles.levelDot,
                        {
                          left: dp.x - 5,
                          top: dp.y - 5,
                          backgroundColor: b.tint,
                        },
                      ]}
                    />
                  );
                })()}
                {/* Label */}
                <View
                  style={[
                    styles.labelWrap,
                    {
                      left: labelPt.x - 24,
                      top: labelPt.y - 10,
                    },
                  ]}
                >
                  <TempoText variant="body" style={{ fontSize: 16, color: b.tint }}>{symbol}</TempoText>
                  <TempoText variant="caption" color={colors.ink2} style={{ fontSize: 10, lineHeight: 12 }}>
                    {short}
                  </TempoText>
                </View>
              </View>
            );
          })}

          {/* Center score */}
          <View style={[styles.centerScore, { left: cx - 18, top: cy - 10 }]}>
            <TempoText variant="data" color={colors.ink3} style={{ fontSize: 14 }}>
              {score}%
            </TempoText>
          </View>
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    aspectRatio: 1,
    maxHeight: 300,
    position: 'relative',
  },
  ring: {
    position: 'absolute',
    borderWidth: 1,
    opacity: 0.25,
  },
  axisLine: {
    position: 'absolute',
    height: 1,
    opacity: 0.18,
  },
  levelDot: {
    position: 'absolute',
    width: 10,
    height: 10,
    borderRadius: 5,
    opacity: 0.75,
  },
  labelWrap: {
    position: 'absolute',
    width: 48,
    alignItems: 'center',
  },
  centerScore: {
    position: 'absolute',
    width: 36,
    alignItems: 'center',
  },
});
