import React, { useEffect, useState } from 'react';
import { View, Text, Pressable, StyleSheet, ScrollView } from 'react-native';
import {
  User, Headphones, LogOut, Sparkles,
  MapPin, Ruler, ClipboardList, Bell, Gift, ChevronRight,
} from 'lucide-react-native';
import { useRouter } from 'expo-router';
import { colors, spacing, radii } from '../../../src/constants/theme';
import { TabPage } from '../../../src/components/PageLayout';
import { useAuth } from '../../../src/contexts/AuthContext';
import { getProfile } from '../../../src/services/profile.service';
import type { Profile } from '../../../src/types/database.types';

/* ── Quick-access boxes ───────────────────────────────────── */

const QUICK_ACCESS = [
  { icon: ClipboardList, label: 'My Orders', route: '/(tabs)/profile/order-history' },
  { icon: Ruler, label: 'Measurements', route: '/(tabs)/profile/measurements' },
  { icon: Headphones, label: 'Help Center', route: '/(tabs)/profile/help-center' },
];

/* ── List items ───────────────────────────────────────────── */

type ListItem = {
  icon: React.ComponentType<any>;
  label: string;
  route?: string;
  disabled?: boolean;
};

const LIST_ITEMS: ListItem[] = [
  { icon: User, label: 'Profile', route: '/(tabs)/profile/edit-profile' },
  { icon: MapPin, label: 'Address Book', route: '/(tabs)/profile/address-picker' },
  { icon: Sparkles, label: 'Style Preferences', disabled: true },
  { icon: Gift, label: 'Invite a Friend', disabled: true },
  { icon: Bell, label: 'Notifications' },
];

/* ── Components ─────────────────────────────────────────── */

function QuickBox({ icon: Icon, label, route }: typeof QUICK_ACCESS[0]) {
  const router = useRouter();
  return (
    <Pressable
      style={({ pressed }) => [s.quickBox, pressed && s.quickBoxPressed]}
      onPress={() => router.push(route as any)}
    >
      <Icon size={22} color={colors.foreground} strokeWidth={1.5} />
      <Text style={s.quickBoxLabel}>{label}</Text>
    </Pressable>
  );
}

function ListRow({ icon: Icon, label, route, disabled, isLast }: ListItem & { isLast: boolean }) {
  const router = useRouter();
  return (
    <Pressable
      onPress={route ? () => router.push(route as any) : undefined}
      disabled={disabled}
      style={({ pressed }) => [s.listRow, pressed && !disabled && s.listRowPressed]}
    >
      <Icon size={20} color={disabled ? colors.mutedForeground : colors.foreground} strokeWidth={1.5} />
      <Text style={[s.listLabel, disabled && s.listLabelDisabled]}>{label}</Text>
      {!disabled && <ChevronRight size={18} color={colors.mutedForeground} />}
      {!isLast && <View style={s.listDivider} />}
    </Pressable>
  );
}

/* ── Main Screen ────────────────────────────────────────── */

export default function ProfileScreen() {
  const { signOut, phoneNumber } = useAuth();
  const [profile, setProfile] = useState<Profile | null>(null);

  useEffect(() => {
    getProfile().then(setProfile).catch(() => {});
  }, []);

  const rawDigits = phoneNumber
    ? phoneNumber.replace(/^\+?91/, '')
    : '';
  const displayPhone = rawDigits
    ? `+91 ${rawDigits.slice(0, 5)} ${rawDigits.slice(5)}`
    : '+91';

  const displayName = profile?.full_name || 'Your Name';

  return (
    <TabPage noScroll>
      <ScrollView style={s.scrollWrap} showsVerticalScrollIndicator={false}>
        <View style={s.topSection}>
          {/* Header */}
          <View style={s.header}>
            <View>
              <Text style={s.name}>{displayName}</Text>
              <Text style={s.phone}>{displayPhone}</Text>
            </View>
          </View>

          {/* Quick-access boxes */}
          <View style={s.quickRow}>
            {QUICK_ACCESS.map((item) => (
              <QuickBox key={item.label} {...item} />
            ))}
          </View>
        </View>

        {/* Divider band */}
        <View style={s.sectionDivider} />

        {/* List items */}
        <View style={s.listSection}>
          {LIST_ITEMS.map((item, i) => (
            <ListRow key={item.label} {...item} isLast={i === LIST_ITEMS.length - 1} />
          ))}
        </View>
      </ScrollView>

      {/* Logout pinned to bottom */}
      <Pressable onPress={signOut} style={s.logoutBtn}>
        <LogOut size={16} color={colors.destructive} />
        <Text style={s.logoutText}>Log Out</Text>
      </Pressable>
    </TabPage>
  );
}

/* ── Styles ──────────────────────────────────────────────── */

const s = StyleSheet.create({
  scrollWrap: {
    flex: 1,
  },

  /* Top section (header + boxes) */
  topSection: {
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.xxxl,
    paddingBottom: spacing.xl,
  },
  header: {
    marginBottom: spacing.xxl,
  },
  name: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.foreground,
    letterSpacing: -0.3,
  },
  phone: {
    fontSize: 14,
    color: colors.mutedForeground,
    marginTop: 4,
  },

  /* Quick-access boxes */
  quickRow: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  quickBox: {
    flex: 1,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.border,
    borderRadius: radii.lg,
    paddingVertical: spacing.xxl,
    paddingHorizontal: spacing.md,
    gap: spacing.sm,
  },
  quickBoxPressed: {
    opacity: 0.6,
  },
  quickBoxLabel: {
    fontSize: 13,
    fontWeight: '500',
    color: colors.foreground,
    lineHeight: 18,
  },

  /* Section divider */
  sectionDivider: {
    height: 4,
    backgroundColor: colors.surfaceMuted,
  },

  /* List rows */
  listSection: {
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.sm,
  },
  listRow: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 56,
    gap: spacing.lg,
  },
  listRowPressed: {
    opacity: 0.6,
  },
  listLabel: {
    flex: 1,
    fontSize: 15,
    fontWeight: '400',
    color: colors.foreground,
  },
  listLabelDisabled: {
    color: colors.mutedForeground,
    opacity: 0.5,
  },
  listDivider: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: StyleSheet.hairlineWidth,
    backgroundColor: colors.dividerLight,
  },

  /* Logout */
  logoutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    paddingVertical: spacing.lg,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.dividerLight,
  },
  logoutText: {
    fontSize: 15,
    fontWeight: '400',
    color: colors.destructive,
  },
});
