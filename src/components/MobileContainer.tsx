import React from 'react';
import { View, StyleSheet } from 'react-native';
import { colors, shadows, MAX_WIDTH } from '../constants/theme';

export function MobileContainer({ children }: { children: React.ReactNode }) {
  return (
    <View style={styles.outer}>
      <View style={styles.inner}>{children}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  outer: {
    flex: 1,
    backgroundColor: colors.background,
    alignItems: 'center',
  },
  inner: {
    flex: 1,
    width: '100%',
    maxWidth: MAX_WIDTH,
    backgroundColor: colors.background,
    ...shadows.container,
  },
});
