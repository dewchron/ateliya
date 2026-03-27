import React, { useState, useRef, useEffect, useCallback } from 'react';
import { View, Text, TextInput, Pressable, StyleSheet, Animated, Image } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { ChevronLeft } from 'lucide-react-native';
import { MobileContainer } from '../../src/components/MobileContainer';
import { useAuth } from '../../src/contexts/AuthContext';
import { useToast } from '../../src/contexts/ToastContext';
import { colors, spacing, radii, typography, borderWidths } from '../../src/constants/theme';
import { updateLeadStatus } from '../../src/services/leads.service';

const OTP_LENGTH = 6;
const RESEND_SECONDS = 30;

export default function OTPScreen() {
  const router = useRouter();
  const { phone, leadId } = useLocalSearchParams<{ phone: string; leadId?: string }>();
  const { verifyOtp, sendOtp } = useAuth();
  const { showToast } = useToast();

  const [otp, setOtp] = useState('');
  const [verifying, setVerifying] = useState(false);
  const [countdown, setCountdown] = useState(RESEND_SECONDS);
  const inputRef = useRef<TextInput>(null);

  const formattedPhone = phone
    ? `${phone.slice(0, 5)} ${phone.slice(5)}`
    : '';

  // Countdown timer
  useEffect(() => {
    if (countdown <= 0) return;
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [countdown]);

  // Staggered entrance animations
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(24)).current;
  const fadeBoxes = useRef(new Animated.Value(0)).current;
  const slideBoxes = useRef(new Animated.Value(24)).current;
  const fadeCta = useRef(new Animated.Value(0)).current;
  const slideCta = useRef(new Animated.Value(24)).current;

  // Per-box stagger animations (left-to-right)
  const boxScales = useRef(
    Array.from({ length: OTP_LENGTH }, () => new Animated.Value(1)),
  ).current;
  const boxFadeIns = useRef(
    Array.from({ length: OTP_LENGTH }, () => new Animated.Value(0)),
  ).current;

  useEffect(() => {
    // Main entrance
    const stagger = [
      Animated.parallel([
        Animated.timing(fadeAnim, { toValue: 1, duration: 400, useNativeDriver: true }),
        Animated.timing(slideAnim, { toValue: 0, duration: 400, useNativeDriver: true }),
      ]),
      Animated.parallel([
        Animated.timing(fadeBoxes, { toValue: 1, duration: 350, useNativeDriver: true }),
        Animated.timing(slideBoxes, { toValue: 0, duration: 350, useNativeDriver: true }),
      ]),
      Animated.parallel([
        Animated.timing(fadeCta, { toValue: 1, duration: 300, useNativeDriver: true }),
        Animated.timing(slideCta, { toValue: 0, duration: 300, useNativeDriver: true }),
      ]),
    ];
    Animated.stagger(100, stagger).start();

    // OTP boxes stagger left-to-right
    Animated.stagger(
      60,
      boxFadeIns.map((anim) =>
        Animated.timing(anim, { toValue: 1, duration: 200, useNativeDriver: true }),
      ),
    ).start();
  }, []);

  // Digit entry pulse animation
  const pulseBox = useCallback(
    (index: number) => {
      Animated.sequence([
        Animated.timing(boxScales[index], {
          toValue: 1.08,
          duration: 80,
          useNativeDriver: true,
        }),
        Animated.timing(boxScales[index], {
          toValue: 1,
          duration: 80,
          useNativeDriver: true,
        }),
      ]).start();
    },
    [boxScales],
  );

  const doVerify = async (token: string) => {
    if (verifying) return;
    setVerifying(true);
    try {
      await verifyOtp(phone || '', token);
      // Mark lead as verified — triggers DB auto-link
      if (leadId) updateLeadStatus(leadId, 'verified');
      // Session auto-triggers redirect via onAuthStateChange
    } catch (err: any) {
      showToast(err.message || 'Invalid OTP');
      setOtp('');
    } finally {
      setVerifying(false);
    }
  };

  const handleChange = (text: string) => {
    const digits = text.replace(/\D/g, '').slice(0, OTP_LENGTH);
    // Pulse the latest digit box
    if (digits.length > otp.length && digits.length <= OTP_LENGTH) {
      pulseBox(digits.length - 1);
    }
    setOtp(digits);

    // Auto-verify after 6th digit
    if (digits.length === OTP_LENGTH) {
      setTimeout(() => doVerify(digits), 300);
    }
  };

  const handleVerify = () => {
    doVerify(otp);
  };

  const handleResend = async () => {
    if (countdown > 0) return;
    try {
      await sendOtp(phone || '');
      showToast('Verification code resent');
      setCountdown(RESEND_SECONDS);
    } catch (err: any) {
      showToast(err.message || 'Failed to resend');
    }
  };

  const formatCountdown = (s: number) => {
    const min = Math.floor(s / 60);
    const sec = s % 60;
    return `${min}:${sec.toString().padStart(2, '0')}`;
  };

  const boxes = Array.from({ length: OTP_LENGTH }, (_, i) => otp[i] || '');

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
              source={require('../../Branding/Logo - Light BG.png')}
              style={styles.logo}
              resizeMode="contain"
            />
          </Animated.View>

          {/* Heading */}
          <Animated.View style={[styles.headingWrap, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}>
            <Text style={styles.subtitle}>
              We sent a code to{'\n'}
              <Text style={styles.phoneHighlight}>{formattedPhone}</Text>
            </Text>
          </Animated.View>

          {/* OTP boxes */}
          <Animated.View style={{ opacity: fadeBoxes, transform: [{ translateY: slideBoxes }] }}>
            <Pressable style={styles.boxRow} onPress={() => inputRef.current?.focus()}>
              {boxes.map((digit, i) => (
                <Animated.View
                  key={i}
                  style={[
                    styles.box,
                    i === otp.length && styles.boxActive,
                    digit !== '' && styles.boxFilled,
                    {
                      opacity: boxFadeIns[i],
                      transform: [{ scale: boxScales[i] }],
                    },
                  ]}
                >
                  <Text style={styles.boxText}>{digit}</Text>
                  {i === otp.length && <View style={styles.cursor} />}
                </Animated.View>
              ))}
            </Pressable>
          </Animated.View>

          <TextInput
            ref={inputRef}
            style={styles.hiddenInput}
            keyboardType="number-pad"
            maxLength={OTP_LENGTH}
            value={otp}
            onChangeText={handleChange}
            autoFocus
            returnKeyType="done"
            onSubmitEditing={() => { if (otp.length === OTP_LENGTH && !verifying) handleVerify(); }}
          />

          {/* CTA */}
          <Animated.View style={{ opacity: fadeCta, transform: [{ translateY: slideCta }] }}>
            <Pressable
              style={({ pressed }) => [
                styles.pillBtn,
                (otp.length < OTP_LENGTH || verifying) && styles.pillBtnDisabled,
                pressed && otp.length === OTP_LENGTH && !verifying && styles.pressed,
              ]}
              onPress={handleVerify}
              disabled={otp.length < OTP_LENGTH || verifying}
            >
              <Text style={[styles.pillBtnText, (otp.length < OTP_LENGTH || verifying) && styles.pillBtnTextDisabled]}>
                {verifying ? 'Verifying...' : 'Verify'}
              </Text>
            </Pressable>
          </Animated.View>

          {/* Resend */}
          <Animated.View style={[styles.resendWrap, { opacity: fadeCta }]}>
            <Text style={styles.resendLabel}>Didn't get the code?</Text>
            {countdown > 0 ? (
              <Text style={styles.resendCountdown}>
                Resend in {formatCountdown(countdown)}
              </Text>
            ) : (
              <Pressable onPress={handleResend}>
                <Text style={styles.resendActive}>Resend</Text>
              </Pressable>
            )}
          </Animated.View>

          {/* Spacer */}
          <View style={{ flex: 1 }} />

          {/* Wrong number footer */}
          <Animated.View style={[styles.footerWrap, { opacity: fadeCta }]}>
            <Text style={styles.footerText}>
              Wrong number?{' '}
              <Text style={styles.footerLink} onPress={() => router.back()}>
                Go back
              </Text>
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
    width: 140,
    height: 120,
    borderRadius: 28,
    backgroundColor: colors.surfaceMuted,
    transform: [{ rotate: '-8deg' }],
    opacity: 0.35,
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
  },
  heading: {
    fontSize: 22,
    fontWeight: '600',
    color: colors.foreground,
    textAlign: 'center',
    lineHeight: 30,
  },
  italic: {
    fontStyle: 'italic',
  },
  subtitle: {
    ...typography.body,
    color: colors.mutedForeground,
    textAlign: 'center',
    marginTop: spacing.md,
    lineHeight: 22,
  },
  phoneHighlight: {
    fontWeight: '700',
    color: colors.foreground,
  },

  // OTP boxes
  boxRow: {
    flexDirection: 'row',
    gap: spacing.md,
    justifyContent: 'center',
  },
  box: {
    width: 48,
    height: 56,
    borderWidth: borderWidths.thin,
    borderColor: colors.border,
    borderRadius: radii.lg,
    backgroundColor: colors.surfaceSubtle,
    alignItems: 'center',
    justifyContent: 'center',
  },
  boxActive: {
    borderColor: colors.primary,
    borderWidth: borderWidths.thick,
  },
  boxFilled: {
    borderColor: colors.primary,
    backgroundColor: colors.selectedBg,
  },
  boxText: {
    ...typography.h2,
    color: colors.foreground,
  },
  cursor: {
    position: 'absolute',
    bottom: 8,
    width: 16,
    height: 2,
    borderRadius: 1,
    backgroundColor: colors.primary,
  },
  hiddenInput: {
    position: 'absolute',
    opacity: 0,
    height: 0,
    width: 0,
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

  // Resend
  resendWrap: {
    alignItems: 'center',
    gap: spacing.xs,
  },
  resendLabel: {
    ...typography.bodySmall,
    color: colors.mutedForeground,
  },
  resendCountdown: {
    ...typography.bodySmall,
    color: colors.mutedForeground,
    fontWeight: '600',
  },
  resendActive: {
    ...typography.bodySmall,
    color: colors.primary,
    fontWeight: '700',
  },

  // Footer
  footerWrap: {
    alignItems: 'center',
    paddingBottom: spacing.xxxl,
  },
  footerText: {
    ...typography.bodySmall,
    color: colors.mutedForeground,
  },
  footerLink: {
    color: colors.primary,
    fontWeight: '600',
  },
});
