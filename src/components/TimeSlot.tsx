import React from 'react';
import { Pressable, Text, StyleSheet } from 'react-native';
import { colors, radii, borderWidths, animation } from '../constants/theme';

interface TimeSlotProps {
  time: string;
  selected: boolean;
  onPress: () => void;
  topLabel?: string;
}

export function TimeSlotButton({ time, selected, onPress, topLabel }: TimeSlotProps) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.slot,
        selected && styles.selected,
        pressed && styles.pressed,
      ]}
    >
      {topLabel && (
        <Text style={[styles.topLabel, selected && styles.selectedText]}>{topLabel}</Text>
      )}
      <Text style={[styles.time, selected && styles.selectedText, !topLabel && styles.timeBold]}>
        {time}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  slot: {
    paddingVertical: 14,
    paddingHorizontal: 8,
    borderRadius: radii.md,
    backgroundColor: colors.card,
    borderWidth: borderWidths.medium,
    borderColor: colors.border,
    alignItems: 'center',
    flexBasis: '31%',
    flexGrow: 1,
  },
  selected: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  pressed: {
    transform: [{ scale: animation.pressScale }],
  },
  topLabel: {
    fontSize: 12,
    color: colors.mutedForeground,
    marginBottom: 2,
  },
  time: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.foreground,
  },
  timeBold: {
    fontWeight: '600',
  },
  selectedText: {
    color: colors.primaryForeground,
  },
});
