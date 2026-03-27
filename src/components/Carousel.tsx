import React, { useRef, useState, useCallback, Children } from 'react';
import {
  ScrollView,
  View,
  Pressable,
  StyleSheet,
  Platform,
  NativeSyntheticEvent,
  NativeScrollEvent,
} from 'react-native';
import { colors, spacing } from '../constants/theme';

interface CarouselProps {
  children: React.ReactNode;
  containerPadding?: number;
}

export function Carousel({ children, containerPadding = 16 }: CarouselProps) {
  const items = Children.toArray(children).filter(Boolean);
  const [activeIndex, setActiveIndex] = useState(0);
  const scrollRef = useRef<ScrollView>(null);
  const [scrollWidth, setScrollWidth] = useState(0);

  const onScroll = useCallback(
    (e: NativeSyntheticEvent<NativeScrollEvent>) => {
      if (scrollWidth === 0) return;
      const x = e.nativeEvent.contentOffset.x;
      const index = Math.round(x / scrollWidth);
      setActiveIndex(Math.max(0, Math.min(index, items.length - 1)));
    },
    [scrollWidth, items.length]
  );

  const scrollTo = useCallback(
    (index: number) => {
      const clamped = Math.max(0, Math.min(index, items.length - 1));
      scrollRef.current?.scrollTo({ x: clamped * scrollWidth, animated: true });
      setActiveIndex(clamped);
    },
    [scrollWidth, items.length]
  );

  return (
    <View style={styles.wrapper}>
      {/* Invisible measuring view - always rendered to get width */}
      <View
        style={styles.measurer}
        onLayout={(e) => setScrollWidth(e.nativeEvent.layout.width)}
      />

      {scrollWidth > 0 && (
        <ScrollView
          ref={scrollRef}
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          onScroll={onScroll}
          scrollEventThrottle={16}
          decelerationRate="fast"
          style={Platform.select({
            web: {
              scrollSnapType: 'x mandatory',
              WebkitOverflowScrolling: 'touch',
            } as any,
            default: {},
          })}
        >
          {items.map((child, i) => (
            <View
              key={i}
              style={[
                { width: scrollWidth },
                Platform.select({
                  web: { scrollSnapAlign: 'start' } as any,
                  default: {},
                }),
              ]}
            >
              <View style={{ paddingHorizontal: containerPadding }}>{child}</View>
            </View>
          ))}
        </ScrollView>
      )}

      {items.length > 1 && (
        <View style={styles.dots}>
          {items.map((_, i) => (
            <Pressable key={i} onPress={() => scrollTo(i)}>
              <View
                style={[styles.dot, i === activeIndex && styles.dotActive]}
              />
            </Pressable>
          ))}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    position: 'relative',
  },
  measurer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 1,
    opacity: 0,
  },
  dots: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: spacing.lg,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.muted,
  },
  dotActive: {
    backgroundColor: colors.primary,
  },
});
