import React from 'react';
import { View, ScrollView, Pressable, Text, StyleSheet, ViewStyle } from 'react-native';
import { useRouter } from 'expo-router';
import { ShoppingBag } from 'lucide-react-native';
import { colors, spacing, radii, shadows } from '../constants/theme';
import { ScreenHeader } from './ScreenHeader';
import { Button } from './Button';
import { useBooking } from '../contexts/BookingContext';

/* ── Tab-level page (Home, Services, Almira, Profile) ─── */

interface TabPageProps {
  children: React.ReactNode;
  /** Hide the logo header bar (e.g. Profile has its own header) */
  noHeader?: boolean;
  /** Extra padding override */
  contentStyle?: ViewStyle;
  /** Override container background */
  backgroundColor?: string;
  /** Disable scroll (for pages that manage their own scroll) */
  noScroll?: boolean;
}

export function TabPage({ children, noHeader, contentStyle, backgroundColor, noScroll }: TabPageProps) {
  const router = useRouter();
  const { state } = useBooking();
  const cartCount = state.selectedServices.length;

  return (
    <View style={[styles.container, backgroundColor ? { backgroundColor } : undefined]}>
      {noScroll ? (
        <View style={[styles.flexContent, contentStyle]}>
          {children}
        </View>
      ) : (
        <ScrollView
          style={styles.flex}
          contentContainerStyle={[styles.content, cartCount > 0 && styles.contentWithCart, contentStyle]}
          showsVerticalScrollIndicator={false}
        >
          {children}
        </ScrollView>
      )}
      {cartCount > 0 && (
        <Pressable
          style={styles.cartBar}
          onPress={() => router.push('/(tabs)/services' as any)}
        >
          <View style={styles.cartBarLeft}>
            <View style={styles.cartBadge}>
              <Text style={styles.cartBadgeText}>{cartCount}</Text>
            </View>
            <Text style={styles.cartBarLabel}>
              {cartCount === 1 ? '1 service selected' : `${cartCount} services selected`}
            </Text>
          </View>
          <Text style={styles.cartBarAction}>View Cart</Text>
        </Pressable>
      )}
    </View>
  );
}

/* ── Sub-page (services flow, profile sub-pages) ──────── */

interface SubPageProps {
  children: React.ReactNode;
  title: string;
  onBack: () => void;
  /** Bottom action button */
  actionLabel?: string;
  onAction?: () => void;
  actionDisabled?: boolean;
  /** Extra padding override */
  contentStyle?: ViewStyle;
}

export function SubPage({
  children,
  title,
  onBack,
  actionLabel,
  onAction,
  actionDisabled,
  contentStyle,
}: SubPageProps) {
  return (
    <View style={styles.container}>
      <ScreenHeader title={title} onBack={onBack} />
      <ScrollView
        style={styles.flex}
        contentContainerStyle={[styles.content, contentStyle]}
        showsVerticalScrollIndicator={false}
      >
        {children}
      </ScrollView>
      {actionLabel && onAction && (
        <View style={styles.bottomBar}>
          <Button
            title={actionLabel}
            onPress={onAction}
            disabled={actionDisabled}
          />
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  flex: {
    flex: 1,
  },
  flexContent: {
    flex: 1,
  },
  content: {
    padding: spacing.xl,
    paddingTop: spacing.lg,
  },
  contentWithCart: {
    paddingBottom: 72,
  },
  bottomBar: {
    padding: spacing.xl,
    alignItems: 'center',
  },
  cartBar: {
    position: 'absolute',
    bottom: spacing.md,
    left: spacing.md,
    right: spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.foreground,
    borderRadius: radii.lg,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    ...shadows.toast,
  },
  cartBarLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  cartBadge: {
    backgroundColor: colors.primary,
    width: 22,
    height: 22,
    borderRadius: 11,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cartBadgeText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#fff',
  },
  cartBarLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.background,
  },
  cartBarAction: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.primary,
  },
});
