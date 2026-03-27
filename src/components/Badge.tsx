import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors, radii, spacing } from '../constants/theme';

interface BadgeProps {
  text: string;
  variant?: 'default' | 'live';
}

export function Badge({ text, variant = 'default' }: BadgeProps) {
  return (
    <View style={[styles.badge, variant === 'live' && styles.live]}>
      <Text style={[styles.text, variant === 'live' && styles.liveText]}>{text}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.md,
    borderRadius: radii.xl,
    backgroundColor: colors.secondary,
  },
  live: {
    backgroundColor: colors.liveBg,
  },
  text: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.secondaryForeground,
  },
  liveText: {
    color: colors.liveText,
  },
});
