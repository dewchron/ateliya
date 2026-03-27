import React from 'react';
import { Pressable, Text, StyleSheet, ViewStyle, TextStyle } from 'react-native';
import { colors, radii, borderWidths, animation } from '../constants/theme';

interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'outline';
  disabled?: boolean;
  style?: ViewStyle;
  textStyle?: TextStyle;
  fullWidth?: boolean;
}

export function Button({
  title,
  onPress,
  variant = 'primary',
  disabled,
  style,
  textStyle,
  fullWidth = false,
}: ButtonProps) {
  const variantStyles = {
    primary: { bg: colors.primary, text: colors.primaryForeground },
    secondary: { bg: colors.secondary, text: colors.secondaryForeground },
    outline: { bg: colors.card, text: colors.foreground },
  };
  const v = variantStyles[variant];

  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      style={({ pressed }) => [
        styles.btn,
        { backgroundColor: v.bg },
        variant === 'outline' && styles.outline,
        fullWidth && styles.fullWidth,
        disabled && styles.disabled,
        pressed && styles.pressed,
        style,
      ]}
    >
      <Text style={[styles.text, { color: v.text }, textStyle]}>{title}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  btn: {
    paddingVertical: 10,
    paddingHorizontal: 28,
    borderRadius: radii.full,
    alignItems: 'center',
    justifyContent: 'center',
  },
  fullWidth: {
    width: '100%',
  },
  outline: {
    borderWidth: borderWidths.medium,
    borderColor: colors.border,
  },
  text: {
    fontSize: 14,
    fontWeight: '500',
  },
  disabled: {
    opacity: 0.5,
  },
  pressed: {
    transform: [{ scale: animation.pressScale }],
  },
});
