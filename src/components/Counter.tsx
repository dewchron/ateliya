import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { colors, spacing, borderWidths } from '../constants/theme';

interface CounterProps {
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
}

export function Counter({ value, onChange, min = 1, max = 20 }: CounterProps) {
  return (
    <View style={styles.container}>
      <Pressable
        onPress={() => value > min && onChange(value - 1)}
        style={({ pressed }) => [styles.btn, pressed && styles.pressed]}
        hitSlop={12}
      >
        <Text style={styles.btnText}>{'\u2212'}</Text>
      </Pressable>
      <Text style={styles.value}>{value}</Text>
      <Pressable
        onPress={() => value < max && onChange(value + 1)}
        style={({ pressed }) => [styles.btn, pressed && styles.pressed]}
        hitSlop={12}
      >
        <Text style={styles.btnText}>+</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.lg,
  },
  btn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: borderWidths.medium,
    borderColor: colors.border,
    backgroundColor: colors.card,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pressed: {
    backgroundColor: colors.muted,
  },
  btnText: {
    fontSize: 18,
    color: colors.foreground,
  },
  value: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.foreground,
    minWidth: 28,
    textAlign: 'center',
  },
});
