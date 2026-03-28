import React, { useState, useRef, useEffect } from 'react';
import { View, Text, TextInput, Pressable, StyleSheet, Animated, Image } from 'react-native';
import { useRouter } from 'expo-router';
import { ChevronLeft } from 'lucide-react-native';
import { MobileContainer } from '../../src/components/MobileContainer';
import { useAuth } from '../../src/contexts/AuthContext';
import { useToast } from '../../src/contexts/ToastContext';
import { colors, spacing, radii, typography, borderWidths } from '../../src/constants/theme';
import { getVisitorId } from '../../src/services/analytics.service';
import { captureLead, updateLeadStatus } from '../../src/services/leads.service';

export default function PhoneScreen() {
  const router = useRouter();
  const { sendOtp } = useAuth();
  const { showToast } = useToast();
  const [phone, setPhone] = useState('');
  const [focused, setFocused] = useState(false);
  const [sending, setSending] = useState(false);

  const isValid = phone.replace(/\D/g, '').length >= 10;

  // Staggered entrance animations
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(24)).current;
  const fadeInput = useRef(new Animated.Value(0)).current;
  const slideInput = useRef(new Animated.Value(24)).current;
  const fadeCta = useRef(new Animated.Value(0)).current;
  const slideCta = useRef(new Animated.Value(24)).current;

  useEffect(() => {
    const stagger = [
      Animated.parallel([
        Animated.timing(fadeAnim, { toValue: 1, duration: 400, useNativeDriver: true }),
        Animated.timing(slideAnim, { toValue: 0, duration: 400, useNativeDriver: true }),
      ]),
      Animated.parallel([
        Animated.timing(fadeInput, { toValue: 1, duration: 350, useNativeDriver: true }),
        Animated.timing(slideInput, { toValue: 0, duration: 350, useNativeDriver: true }),
      ]),
      Animated.parallel([
        Animated.timing(fadeCta, { toValue: 1, duration: 300, useNativeDriver: true }),
        Animated.timing(slideCta, { toValue: 0, duration: 300, useNativeDriver: true }),
      ]),
    ];
    Animated.stagger(100, stagger).start();
  }, []);

  const handleContinue = async () => {
    const cleanPhone = phone.replace(/\D/g, '');
    setSending(true);

    // Capture lead BEFORE sending OTP — phone is saved even if OTP fails
    let leadId: string | undefined;
    try {
      leadId = await captureLead(cleanPhone, getVisitorId());
    } catch {
      // Non-blocking — don't prevent OTP flow
    }

    try {
      await sendOtp(cleanPhone);
      if (leadId) updateLeadStatus(leadId, 'sent');
      router.push({ pathname: '/(auth)/otp', params: { phone: cleanPhone, leadId: leadId ?? '' } });
    } catch (err: any) {
      if (leadId) updateLeadStatus(leadId, 'failed', err.message);
      showToast(err.message || 'Failed to send OTP');
    } finally {
      setSending(false);
    }
  };

  return (
    <MobileContainer>
      <View style={styles.container}>
        {/* Back arrow */}
        <Pressable
          style={({ pressed }) => [styles.backBtn, pressed && { opacity: 0.6 }]}
          onPress={() => router.back()}
          hitSlop={8}
        >
          <ChevronLeft size={24} color={colors.foreground} />
        </Pressable>

        {/* Decorative shape */}
        <View style={styles.decorShape} />

        <View style={styles.body}>
          {/* Brand zone */}
          <Animated.View style={[styles.brandZone, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}>
            <Image
              source={require('../../assets/images/logo-light.png')}
              style={styles.logo}
              resizeMode="contain"
            />
          </Animated.View>

          {/* Heading */}
          <Animated.View style={[styles.headingWrap, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}>
            <Text style={styles.heading}>
              Unlock your{' '}
              <Text style={styles.italic}>closet!</Text>
            </Text>
          </Animated.View>

          {/* Phone input */}
          <Animated.View style={[styles.inputRow, { opacity: fadeInput, transform: [{ translateY: slideInput }] }]}>
            <TextInput
              style={[styles.phoneInput, focused && styles.inputFocused]}
              placeholder="Phone Number"
              placeholderTextColor={colors.mutedForeground}
              keyboardType="phone-pad"
              maxLength={12}
              value={phone}
              onChangeText={setPhone}
              onFocus={() => setFocused(true)}
              onBlur={() => setFocused(false)}
              autoFocus
              returnKeyType="done"
              onSubmitEditing={() => { if (isValid && !sending) handleContinue(); }}
            />
          </Animated.View>

          {/* CTA */}
          <Animated.View style={{ opacity: fadeCta, transform: [{ translateY: slideCta }], maxWidth: 280, alignSelf: 'center', width: '100%' }}>
            <Pressable
              style={({ pressed }) => [
                styles.pillBtn,
                (!isValid || sending) && styles.pillBtnDisabled,
                pressed && isValid && !sending && styles.pressed,
              ]}
              onPress={handleContinue}
              disabled={!isValid || sending}
            >
              <Text style={[styles.pillBtnText, (!isValid || sending) && styles.pillBtnTextDisabled]}>
                {sending ? 'Sending...' : 'Continue'}
              </Text>
            </Pressable>
          </Animated.View>

          {/* Spacer */}
          <View style={{ flex: 1 }} />

          {/* Legal footer */}
          <Animated.View style={[styles.legalWrap, { opacity: fadeCta }]}>
            <Text style={styles.legalText}>
              By continuing, you agree to{'\n'}our{' '}
              <Text style={styles.legalLink}>Terms</Text> &{' '}
              <Text style={styles.legalLink}>Privacy Policy</Text>
            </Text>
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
  backBtn: {
    position: 'absolute',
    top: 16,
    left: 20,
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 10,
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
    marginTop: 100,
    maxWidth: 280,
    alignSelf: 'center',
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

  // Input
  inputRow: {
    marginTop: spacing.sm,
    maxWidth: 280,
    width: '100%',
    alignSelf: 'center',
  },
  countryCode: {
    backgroundColor: colors.surfaceSubtle,
    borderWidth: borderWidths.thin,
    borderColor: colors.border,
    borderRadius: radii.lg,
    paddingHorizontal: spacing.lg,
    justifyContent: 'center',
    alignItems: 'center',
  },
  countryCodeText: {
    ...typography.body,
    fontWeight: '600',
    color: colors.foreground,
  },
  phoneInput: {
    flex: 1,
    backgroundColor: colors.searchSurface,
    borderRadius: radii.xl,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.lg,
    ...typography.body,
    color: colors.foreground,
    outlineStyle: 'none',
  } as any,
  inputFocused: {
    borderColor: colors.primary,
  },

  // CTA
  pillBtn: {
    backgroundColor: colors.primary,
    paddingVertical: 10,
    paddingHorizontal: 28,
    borderRadius: radii.full,
    alignItems: 'center',
    alignSelf: 'center',
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

  // Legal
  legalWrap: {
    alignItems: 'center',
    paddingBottom: spacing.xxxl,
  },
  legalText: {
    ...typography.caption,
    color: colors.mutedForeground,
    textAlign: 'center',
    lineHeight: 20,
  },
  legalLink: {
    color: colors.primary,
    fontWeight: '600',
  },
});
