import React from 'react';
import { View, Text, TextInput, StyleSheet } from 'react-native';
import { colors, spacing } from '../constants/theme';

interface SettingsFieldProps {
  label: string;
  placeholder: string;
  keyboard?: 'phone-pad' | 'numeric' | 'default';
  maxLength?: number;
  multiline?: boolean;
  last?: boolean;
  value?: string;
  onChangeText?: (text: string) => void;
}

export function SettingsField({
  label,
  placeholder,
  keyboard,
  maxLength,
  multiline,
  last,
  value,
  onChangeText,
}: SettingsFieldProps) {
  return (
    <View style={[styles.field, !last && styles.fieldBorder]}>
      <Text style={styles.fieldLabel}>{label}</Text>
      <TextInput
        style={[styles.fieldInput, multiline && styles.fieldMultiline]}
        placeholder={placeholder}
        placeholderTextColor={colors.mutedForeground}
        keyboardType={keyboard}
        maxLength={maxLength}
        multiline={multiline}
        textAlignVertical={multiline ? 'top' : 'center'}
        value={value}
        onChangeText={onChangeText}
      />
    </View>
  );
}

interface SettingsFieldRowProps {
  children: React.ReactNode;
  last?: boolean;
}

export function SettingsFieldRow({ children, last }: SettingsFieldRowProps) {
  return (
    <View style={[styles.fieldRowWrap, !last && styles.fieldBorder]}>
      <View style={styles.fieldRow}>{children}</View>
    </View>
  );
}

interface SettingsSmallFieldProps {
  label: string;
  placeholder: string;
  keyboard?: 'phone-pad' | 'numeric' | 'default';
  maxLength?: number;
  showDivider?: boolean;
  value?: string;
  onChangeText?: (text: string) => void;
}

export function SettingsSmallField({
  label,
  placeholder,
  keyboard,
  maxLength,
  showDivider,
  value,
  onChangeText,
}: SettingsSmallFieldProps) {
  return (
    <View style={[styles.smallField, showDivider && styles.smallFieldDivider]}>
      <Text style={styles.smallFieldLabel}>{label}</Text>
      <TextInput
        style={styles.smallFieldInput}
        placeholder={placeholder}
        placeholderTextColor={colors.mutedForeground}
        keyboardType={keyboard}
        maxLength={maxLength}
        value={value}
        onChangeText={onChangeText}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  field: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    minHeight: 44,
  },
  fieldBorder: {
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.dividerLight,
  },
  fieldLabel: {
    width: 80,
    fontSize: 13,
    color: colors.mutedForeground,
  },
  fieldInput: {
    flex: 1,
    fontSize: 14,
    color: colors.foreground,
    paddingVertical: 10,
    outlineStyle: 'none',
  } as any,
  fieldMultiline: {
    minHeight: 48,
    paddingTop: 10,
  },
  fieldRowWrap: {
    paddingHorizontal: spacing.lg,
    minHeight: 44,
  },
  fieldRow: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  smallField: {
    flex: 1,
    paddingVertical: 8,
  },
  smallFieldLabel: {
    fontSize: 11,
    color: colors.mutedForeground,
    marginBottom: 2,
  },
  smallFieldInput: {
    fontSize: 14,
    color: colors.foreground,
    paddingVertical: 2,
    outlineStyle: 'none',
  } as any,
  smallFieldDivider: {
    borderRightWidth: StyleSheet.hairlineWidth,
    borderRightColor: colors.dividerLight,
    paddingRight: spacing.md,
  },
});
