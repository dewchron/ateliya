import React, { useState, useRef, useEffect } from 'react';
import { View, Text, Pressable, StyleSheet, Animated, Image } from 'react-native';
import { useRouter } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { MobileContainer } from '../../src/components/MobileContainer';
import { useAuth } from '../../src/contexts/AuthContext';
import { useToast } from '../../src/contexts/ToastContext';
import { updateProfile } from '../../src/services/profile.service';
import { colors, spacing, radii, typography } from '../../src/constants/theme';

type Gender = 'male' | 'female';

export default function GenderScreen() {
  const router = useRouter();
  const { refreshProfile, gender } = useAuth();
  const { showToast } = useToast();
  const [selected, setSelected] = useState<Gender | null>(null);
  const [saving, setSaving] = useState(false);

  // If gender already set (came back for name), skip to details
  useEffect(() => {
    if (gender) {
      router.replace('/(onboarding)/details');
    }
  }, [gender]);

  // Entrance animations
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(24)).current;
  const fadeCards = useRef(new Animated.Value(0)).current;
  const slideCards = useRef(new Animated.Value(24)).current;
  const fadeCta = useRef(new Animated.Value(0)).current;
  const slideCta = useRef(new Animated.Value(24)).current;

  useEffect(() => {
    Animated.stagger(100, [
      Animated.parallel([
        Animated.timing(fadeAnim, { toValue: 1, duration: 400, useNativeDriver: true }),
        Animated.timing(slideAnim, { toValue: 0, duration: 400, useNativeDriver: true }),
      ]),
      Animated.parallel([
        Animated.timing(fadeCards, { toValue: 1, duration: 350, useNativeDriver: true }),
        Animated.timing(slideCards, { toValue: 0, duration: 350, useNativeDriver: true }),
      ]),
      Animated.parallel([
        Animated.timing(fadeCta, { toValue: 1, duration: 300, useNativeDriver: true }),
        Animated.timing(slideCta, { toValue: 0, duration: 300, useNativeDriver: true }),
      ]),
    ]).start();
  }, []);

  const handleContinue = async () => {
    if (!selected) return;
    setSaving(true);
    try {
      await updateProfile({ gender: selected });
      await refreshProfile();
      router.replace('/(onboarding)/details');
    } catch (err: any) {
      showToast(err.message || 'Something went wrong');
    } finally {
      setSaving(false);
    }
  };

  return (
    <MobileContainer>
      <View style={styles.container}>
        {/* Decorative shape */}
        <View style={styles.decorShape} />

        <View style={styles.body}>
          {/* Brand zone */}
          <Animated.View style={[styles.brandZone, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}>
            <Image
              source={require('../../Branding/Logo - Light BG.png')}
              style={styles.logo}
              resizeMode="contain"
            />
          </Animated.View>

          {/* Heading */}
          <Animated.View style={[styles.headingWrap, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}>
            <Text style={styles.heading}>
              Tell us about <Text style={styles.italic}>yourself</Text>
            </Text>
            <Text style={styles.subheading}>
              This helps us personalize your experience
            </Text>
          </Animated.View>

          {/* Gender cards */}
          <Animated.View style={[styles.cardRow, { opacity: fadeCards, transform: [{ translateY: slideCards }] }]}>
            <Pressable
              style={({ pressed }) => [
                styles.card,
                selected === 'female' && styles.cardSelected,
                pressed && styles.pressed,
              ]}
              onPress={() => setSelected('female')}
            >
              <View style={[styles.iconBadge, selected === 'female' && styles.iconBadgeSelected]}>
                <MaterialCommunityIcons name="face-woman-outline" size={30} color={selected === 'female' ? colors.foreground : colors.mutedForeground} />
              </View>
              <Text style={[styles.cardLabel, selected === 'female' && styles.cardLabelSelected]}>
                Women
              </Text>
            </Pressable>

            <Pressable
              style={({ pressed }) => [
                styles.card,
                selected === 'male' && styles.cardSelected,
                pressed && styles.pressed,
              ]}
              onPress={() => setSelected('male')}
            >
              <View style={[styles.iconBadge, selected === 'male' && styles.iconBadgeSelected]}>
                <MaterialCommunityIcons name="face-man-outline" size={30} color={selected === 'male' ? colors.foreground : colors.mutedForeground} />
              </View>
              <Text style={[styles.cardLabel, selected === 'male' && styles.cardLabelSelected]}>
                Men
              </Text>
            </Pressable>
          </Animated.View>

          {/* CTA */}
          <Animated.View style={{ opacity: fadeCta, transform: [{ translateY: slideCta }] }}>
            <Pressable
              style={({ pressed }) => [
                styles.pillBtn,
                (!selected || saving) && styles.pillBtnDisabled,
                pressed && selected && !saving && styles.pressed,
              ]}
              onPress={handleContinue}
              disabled={!selected || saving}
            >
              <Text style={[styles.pillBtnText, (!selected || saving) && styles.pillBtnTextDisabled]}>
                {saving ? 'Saving...' : 'Continue'}
              </Text>
            </Pressable>
          </Animated.View>
        </View>
      </View>
    </MobileContainer>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  decorShape: {
    position: 'absolute',
    top: 30,
    right: -20,
    width: 180,
    height: 160,
    borderRadius: 36,
    backgroundColor: colors.surfaceMuted,
    transform: [{ rotate: '-8deg' }],
    opacity: 0.45,
  },
  body: {
    flex: 1,
    paddingTop: 80,
    paddingHorizontal: spacing.xxl,
    gap: spacing.xl,
  },

  // Brand zone
  brandZone: {
    alignItems: 'center',
  },
  logo: {
    width: 160,
    height: 42,
  },

  // Heading
  headingWrap: {
    alignItems: 'center',
    marginTop: 60,
  },
  heading: {
    fontSize: 18,
    fontWeight: '300',
    color: colors.foreground,
    textAlign: 'center',
    lineHeight: 26,
  },
  italic: {
    fontStyle: 'italic',
  },
  subheading: {
    ...typography.bodySmall,
    color: colors.mutedForeground,
    textAlign: 'center',
    marginTop: spacing.sm,
  },

  // Cards
  cardRow: {
    flexDirection: 'row',
    gap: spacing.lg,
    marginTop: spacing.xxl,
  },
  card: {
    flex: 1,
    backgroundColor: colors.surfaceSubtle,
    borderWidth: 1.5,
    borderColor: colors.border,
    borderRadius: radii.xl,
    paddingVertical: spacing.xxl + 8,
    alignItems: 'center',
    gap: spacing.md,
  },
  cardSelected: {
    borderColor: colors.primary,
    backgroundColor: colors.selectedBg,
  },
  iconBadge: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.surfaceMuted,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconBadgeSelected: {
    backgroundColor: colors.primary,
  },
  cardLabel: {
    ...typography.h4,
    color: colors.foreground,
  },
  cardLabelSelected: {
    color: colors.foreground,
  },

  // CTA
  pillBtn: {
    backgroundColor: colors.primary,
    paddingVertical: 10,
    paddingHorizontal: 28,
    borderRadius: radii.full,
    alignItems: 'center',
    alignSelf: 'center',
    marginTop: spacing.sm,
  },
  pillBtnDisabled: {
    opacity: 0.45,
  },
  pillBtnText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '500',
  },
  pillBtnTextDisabled: {
    color: '#fff',
  },
  pressed: {
    opacity: 0.85,
    transform: [{ scale: 0.97 }],
  },
});
