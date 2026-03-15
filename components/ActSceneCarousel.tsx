import React, { useRef, useState, useCallback } from 'react';
import { View, ScrollView, StyleSheet, NativeSyntheticEvent, NativeScrollEvent } from 'react-native';
import { ActField } from './ActField';
import { ActTidePool } from './ActTidePool';
import { ActBirchForest } from './ActBirchForest';
import { useColors } from '../constants/colors';

/*
  ActSceneCarousel — swipeable wrapper around Act tab hero visuals.
  Same data drives multiple scene styles; user swipes horizontally.
*/

interface ActSceneCarouselProps {
  actionCount: number;
  completedToday: number;
  fullScreen?: boolean;
}

const SCENES = ['field', 'tidepool', 'birch'] as const;

export function ActSceneCarousel({ actionCount, completedToday, fullScreen }: ActSceneCarouselProps) {
  const colors = useColors();
  const [page, setPage] = useState(0);
  const [width, setWidth] = useState(0);
  const [height, setHeight] = useState(0);

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
      style={[styles.wrapper, fullScreen && styles.wrapperFull]}
      onLayout={(e) => {
        setWidth(e.nativeEvent.layout.width);
        setHeight(e.nativeEvent.layout.height);
      }}
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
          <View style={{ width, height: fullScreen ? height : undefined }}>
            <ActField actionCount={actionCount} completedToday={completedToday} fullScreen={fullScreen} />
          </View>
          <View style={{ width, height: fullScreen ? height : undefined }}>
            <ActTidePool actionCount={actionCount} completedToday={completedToday} fullScreen={fullScreen} />
          </View>
          <View style={{ width, height: fullScreen ? height : undefined }}>
            <ActBirchForest actionCount={actionCount} completedToday={completedToday} fullScreen={fullScreen} />
          </View>
        </ScrollView>
      )}

      {/* Page dots */}
      <View style={[styles.dots, fullScreen && styles.dotsAbsolute]}>
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
  wrapperFull: {
    flex: 1,
    borderRadius: 0,
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
  dotsAbsolute: {
    position: 'absolute',
    bottom: 12,
    left: 0,
    right: 0,
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
