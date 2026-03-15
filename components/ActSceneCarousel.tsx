import React, { useRef, useState, useCallback } from 'react';
import { View, ScrollView, StyleSheet, NativeSyntheticEvent, NativeScrollEvent } from 'react-native';
import { ActField } from './ActField';
import { ActSkyline } from './ActSkyline';
import { useColors } from '../constants/colors';

/*
  ActSceneCarousel — swipeable wrapper around Act tab hero visuals.
  Same data drives multiple scene styles; user swipes horizontally.
*/

interface ActSceneCarouselProps {
  actionCount: number;
  completedToday: number;
}

const SCENES = ['field', 'skyline'] as const;

export function ActSceneCarousel({ actionCount, completedToday }: ActSceneCarouselProps) {
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
            <ActField actionCount={actionCount} completedToday={completedToday} />
          </View>
          <View style={{ width }}>
            <ActSkyline actionCount={actionCount} completedToday={completedToday} />
          </View>
        </ScrollView>
      )}

      {/* Page dots */}
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
