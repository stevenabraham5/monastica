import React, { useMemo } from 'react';
import { View, StyleSheet } from 'react-native';
import { useColors } from '../constants/colors';

/*
  ActSkyline — alternate Act tab hero: a city skyline at dusk.
  Building heights and lit windows represent action items.
*/

interface ActSkylineProps {
  actionCount: number;
  completedToday: number;
}

function useBuildingConfigs(count: number) {
  return useMemo(() => {
    const configs = [];
    const total = Math.max(count + 6, 12);
    for (let i = 0; i < total; i++) {
      const seed = Math.sin(i * 97.31 + 7) * 10000;
      const rand = seed - Math.floor(seed);
      configs.push({
        leftPct: 2 + (i / Math.max(total - 1, 1)) * 96,
        widthPct: 4 + rand * 4,
        height: 25 + rand * 55 + (i < count ? 15 : 0),
        windowCount: 1 + Math.floor(rand * 3),
        opacity: 0.25 + rand * 0.35,
      });
    }
    return configs;
  }, [count]);
}

export function ActSkyline({ actionCount, completedToday }: ActSkylineProps) {
  const colors = useColors();
  const skyColor = '#3A4A5C';
  const buildingColor = colors.ink3;
  const buildings = useBuildingConfigs(actionCount);

  return (
    <View style={[styles.container, { backgroundColor: skyColor + '10' }]}>
      {/* Sky gradient layers */}
      <View style={[styles.skyTop, { backgroundColor: skyColor + '08' }]} />
      <View style={[styles.skyMid, { backgroundColor: skyColor + '05' }]} />

      {/* Moon */}
      <View style={styles.moon}>
        <View style={[styles.moonBody, { backgroundColor: '#C4B896', opacity: 0.30 }]} />
      </View>

      {/* Stars */}
      {[
        { top: '12%', left: '10%' },
        { top: '8%', left: '30%' },
        { top: '18%', right: '15%' },
        { top: '6%', right: '35%' },
        { top: '22%', left: '50%' },
        { top: '10%', right: '50%' },
      ].map((pos, i) => (
        <View key={i} style={[styles.star, pos as any, { backgroundColor: '#C4B896', opacity: 0.20 + (i % 3) * 0.08 }]} />
      ))}

      {/* Buildings */}
      {buildings.map((b, i) => (
        <View
          key={i}
          style={[
            styles.building,
            {
              left: `${b.leftPct}%`,
              width: `${b.widthPct}%`,
              height: b.height,
              backgroundColor: buildingColor,
              opacity: b.opacity,
            },
          ]}
        >
          {/* Windows */}
          {Array.from({ length: b.windowCount }).map((_, wi) => {
            const seed2 = Math.sin((i * 13 + wi * 7) * 41.3) * 10000;
            const r2 = seed2 - Math.floor(seed2);
            const lit = i < actionCount && r2 > 0.4;
            return (
              <View
                key={wi}
                style={[
                  styles.window,
                  {
                    top: 4 + wi * 14,
                    backgroundColor: lit ? '#E8D88C' : '#FAFAF8',
                    opacity: lit ? 0.55 : 0.12,
                  },
                ]}
              />
            );
          })}
        </View>
      ))}

      {/* Ground/street */}
      <View style={[styles.ground, { backgroundColor: skyColor + '15' }]} />

      {/* Action dots as streetlights */}
      {actionCount > 0 && (
        <View style={styles.dotRow}>
          {Array.from({ length: Math.min(actionCount, 10) }).map((_, i) => (
            <View key={i} style={[styles.streetlight, { backgroundColor: '#E8D88C' }]} />
          ))}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    height: 240,
    overflow: 'hidden',
    position: 'relative',
    borderRadius: 16,
  },
  skyTop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: '40%',
  },
  skyMid: {
    position: 'absolute',
    top: '40%',
    left: 0,
    right: 0,
    height: '20%',
  },
  moon: {
    position: 'absolute',
    top: '8%',
    right: '12%',
  },
  moonBody: {
    width: 18,
    height: 18,
    borderRadius: 9,
  },
  star: {
    position: 'absolute',
    width: 2,
    height: 2,
    borderRadius: 1,
  },
  building: {
    position: 'absolute',
    bottom: '22%',
    borderTopLeftRadius: 1,
    borderTopRightRadius: 1,
  },
  window: {
    position: 'absolute',
    left: '30%',
    width: 3,
    height: 4,
    borderRadius: 0.5,
  },
  ground: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: '22%',
  },
  dotRow: {
    position: 'absolute',
    bottom: '22%',
    left: 24,
    right: 24,
    flexDirection: 'row',
    justifyContent: 'space-evenly',
  },
  streetlight: {
    width: 3,
    height: 3,
    borderRadius: 1.5,
    opacity: 0.4,
  },
});
