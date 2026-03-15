import React, { useState, useCallback } from 'react';
import { View, ScrollView, StyleSheet, NativeSyntheticEvent, NativeScrollEvent } from 'react-native';
import { ReflectOcean } from './ReflectOcean';
import { ReflectNightSky } from './ReflectNightSky';
import { ReflectHarbor } from './ReflectHarbor';
import { useColors } from '../constants/colors';

/*
  ReflectSceneCarousel — 3 swipeable scenes for Reflect tab hero.
  Ocean, Night Sky, Harbor — all use checkinsToday + latestFeeling.
*/

interface ReflectSceneCarouselProps {
  checkinsToday: number;
  latestFeeling: string | null;
}

const SCENES = ['ocean', 'nightsky', 'harbor'] as const;

export function ReflectSceneCarousel({ checkinsToday, latestFeeling }: ReflectSceneCarouselProps) {
  const colors = useColors();
  const [page, setPage] = useState(0);
  const [width, setWidth] = useState(0);

  const handleScroll = useCallback(
    (e: NativeSyntheticEvent<NativeScrollEvent>) => {
      if (width > 0) {
        const idx = Math.round(e.nativeEvent.contentOffset.x / width);
        setPage(idx);
      }
    },
    [width],
  );

  return (
    <View
      style={styles.wrapper}
      onLayout={(e) => setWidth(e.nativeEvent.layout.width)}
    >
      {width > 0 && (
        <ScrollView
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          onMomentumScrollEnd={handleScroll}
          decelerationRate="fast"
          style={styles.scroll}
        >
          <View style={{ width }}>
            <ReflectOcean checkinsToday={checkinsToday} latestFeeling={latestFeeling} />
          </View>
          <View style={{ width }}>
            <ReflectNightSky checkinsToday={checkinsToday} latestFeeling={latestFeeling} />
          </View>
          <View style={{ width }}>
            <ReflectHarbor checkinsToday={checkinsToday} latestFeeling={latestFeeling} />
          </View>
        </ScrollView>
      )}

      <View style={styles.dots}>
        {SCENES.map((_, i) => (
          <View
            key={i}
            style={[
              styles.dot,
              { backgroundColor: colors.ink3 },
              page === i ? styles.dotActive : styles.dotInactive,
            ]}
          />
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    overflow: 'hidden',
    borderRadius: 16,
  },
  scroll: {
    flexGrow: 0,
  },
  dots: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 8,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  dotActive: {
    opacity: 0.6,
  },
  dotInactive: {
    opacity: 0.15,
  },
});
