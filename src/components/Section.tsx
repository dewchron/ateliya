import React, { useState } from 'react';
import { View, Text, Pressable, StyleSheet, Platform } from 'react-native';
import { ChevronDown } from 'lucide-react-native';
import { colors, spacing, radii, shadows } from '../constants/theme';

interface SectionProps {
  title: string;
  subtitle?: string;
  right?: React.ReactNode;
  defaultOpen?: boolean;
  children: React.ReactNode;
}

export function Section({ title, subtitle, right, defaultOpen = false, children }: SectionProps) {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <View style={styles.section}>
      <Pressable onPress={() => setOpen(!open)} style={styles.sectionHeader}>
        <View style={{ flex: 1 }}>
          <Text style={styles.sectionTitle}>{title}</Text>
          {subtitle && <Text style={styles.sectionSubtitle}>{subtitle}</Text>}
        </View>
        <View style={styles.sectionHeaderRight}>
          {right}
          <View style={[styles.chevron, open && styles.chevronOpen]}>
            <ChevronDown size={18} color={colors.mutedForeground} />
          </View>
        </View>
      </Pressable>
      {open && <View>{children}</View>}
    </View>
  );
}

const styles = StyleSheet.create({
  section: {
    marginBottom: spacing.xxl,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.md,
    gap: spacing.sm,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.foreground,
    letterSpacing: -0.2,
  },
  sectionSubtitle: {
    fontSize: 12,
    color: colors.mutedForeground,
    marginTop: 1,
  },
  sectionHeaderRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  chevron: {
    transform: [{ rotate: '0deg' }],
  },
  chevronOpen: {
    transform: [{ rotate: '180deg' }],
  },
});
