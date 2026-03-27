import React from 'react';
import { Pressable, View, Text, StyleSheet } from 'react-native';
import { Check } from 'lucide-react-native';
import { colors, radii, spacing, borderWidths } from '../constants/theme';

interface CheckboxItemProps {
  label: string;
  selected: boolean;
  onToggle: () => void;
}

export function CheckboxItem({ label, selected, onToggle }: CheckboxItemProps) {
  return (
    <Pressable
      onPress={onToggle}
      style={[styles.item, selected && styles.selected]}
    >
      <View style={[styles.checkbox, selected && styles.checkboxSelected]}>
        {selected && <Check size={14} color={colors.primaryForeground} strokeWidth={3} />}
      </View>
      <Text style={styles.label}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingVertical: 14,
    paddingHorizontal: spacing.lg,
    backgroundColor: colors.card,
    borderRadius: radii.md,
    borderWidth: borderWidths.medium,
    borderColor: colors.border,
  },
  selected: {
    borderColor: colors.primary,
    backgroundColor: colors.selectedBg,
  },
  checkbox: {
    width: 22,
    height: 22,
    borderRadius: 6,
    borderWidth: borderWidths.medium,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxSelected: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  label: {
    fontSize: 15,
    fontWeight: '500',
    color: colors.foreground,
  },
});
