import React from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  Image,
  Pressable,
  Linking,
} from 'react-native';
import { useRouter } from 'expo-router';
import {
  Sparkles,
  Shirt,
  Scissors,
  RefreshCw,
  ShoppingBag,
  Lightbulb,
  Heart,
  Mail,
  MessageCircle,
  Youtube,
  Instagram,
  Linkedin,
} from 'lucide-react-native';
import { colors, spacing, radii, typography } from '../../src/constants/theme';

const DARK_SAGE = '#4d5e45';

export default function LandingScreen() {
  const router = useRouter();
  const go = () => router.push('/(auth)/phone');

  return (
    <ScrollView
      style={styles.scroll}
      contentContainerStyle={styles.scrollContent}
      showsVerticalScrollIndicator={false}
    >
      {/* ─── HERO ─── */}
      <View style={styles.hero}>
        <View style={styles.heroDecor} />

        <View style={styles.heroImageWrap}>
          <Image
            source={require('../../assets/images/Kiosk-Ateliya.jpg')}
            style={styles.heroImage}
            resizeMode="cover"
          />
        </View>

        <Text style={styles.brandName}>Ateliya</Text>

        <View style={styles.dividerDot}>
          <View style={styles.dividerLine} />
          <View style={styles.dot} />
          <View style={styles.dividerLine} />
        </View>

        <Text style={styles.label}>POLISHED STYLE WITHOUT THE HASSLE</Text>
        <Text style={styles.heroTitle}>
          Simplify the effort.{'\n'}Amplify the{' '}
          <Text style={styles.italic}>Style.</Text>
        </Text>
        <Text style={styles.heroDesc}>
          Expert alterations, curated style edits, and your entire wardrobe
          digitized — all from pop-up kiosks in your community.
        </Text>

        <Pressable
          style={({ pressed }) => [styles.pillBtn, pressed && styles.pressed]}
          onPress={go}
        >
          <Text style={styles.pillBtnText}>GET STARTED</Text>
        </Pressable>
      </View>

      {/* ─── Curved transition ─── */}
      <View style={styles.curveTransition} />

      {/* ─── SERVICES ─── */}
      <View style={styles.services}>
        <Text style={styles.label}>OUR SERVICES</Text>

        {/* Kiosk */}
        <View style={styles.serviceGroup}>
          <View style={styles.subHeaderRow}>
            <View style={styles.subHeaderLine} />
            <Text style={styles.subHeader}>Kiosk</Text>
            <View style={styles.subHeaderLine} />
          </View>
          <Text style={styles.subHeaderDesc}>
            Our physical layer — expert services at pop-up kiosks in your
            community.
          </Text>

          <View style={styles.cardGrid3}>
            {KIOSK_SERVICES.map((s) => (
              <View key={s.title} style={styles.serviceCard}>
                <View style={styles.cardIconBadge}>
                  <s.icon size={18} color={DARK_SAGE} />
                </View>
                <Text style={styles.cardTitle}>{s.title}</Text>
                <Text style={styles.cardDesc}>{s.desc}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Almira */}
        <View style={styles.serviceGroup}>
          <View style={styles.subHeaderRow}>
            <View style={styles.subHeaderLine} />
            <Text style={styles.subHeader}>Almira</Text>
            <View style={styles.subHeaderLine} />
          </View>
          <Text style={styles.subHeaderDesc}>
            Our digital layer — intelligence and inspiration for your wardrobe.
          </Text>

          <View style={styles.cardGrid2}>
            {ALMIRA_SERVICES.map((s) => (
              <View key={s.title} style={styles.serviceCard}>
                <View style={styles.cardIconWrap}>
                  <View style={styles.cardIconBadge}>
                    <s.icon size={18} color={DARK_SAGE} />
                  </View>
                  {s.badge ? (
                    <View style={styles.comingSoonBadge}>
                      <Text style={styles.comingSoonText} numberOfLines={1}>{s.badge}</Text>
                    </View>
                  ) : null}
                </View>
                <Text style={styles.cardTitle}>{s.title}</Text>
                <Text style={styles.cardDesc}>{s.desc}</Text>
              </View>
            ))}
          </View>
        </View>

        <Pressable
          style={({ pressed }) => [styles.pillBtn, pressed && styles.pressed]}
          onPress={go}
        >
          <Text style={styles.pillBtnText}>BOOK A SERVICE</Text>
        </Pressable>
      </View>

      {/* ─── OUR STORY ─── */}
      <View style={styles.story}>
        <Text style={styles.label}>OUR STORY</Text>
        <Text style={styles.sectionTitle}>
          Two Engineers,{'\n'}One <Text style={styles.italic}>Vision.</Text>
        </Text>

        <Text style={styles.storyText}>
          It started over coffee at a cafe in Hyderabad. Two engineers — both
          returning from over a decade in Silicon Valley — met through a mutual
          friend. One driven by strategy and product, the other by operations
          and market instincts.
        </Text>
        <Text style={styles.storyText}>
          They brainstormed across industries — food, healthcare, education —
          but kept coming back to their own everyday struggle: wardrobes full of
          clothes, yet nothing to wear. Not because of a lack of options, but
          because no one helps you after you buy.
        </Text>
        <Text style={styles.storyText}>
          That gap became Ateliya — a wardrobe infrastructure company built to
          help women get more from what they already own.
        </Text>

        {/* Quote callout */}
        <View style={styles.quoteBlock}>
          <View style={styles.quoteLine} />
          <View style={styles.quoteContent}>
            <Text style={styles.quoteText}>
              The future of fashion is not buying more.
            </Text>
            <Text style={styles.quoteText}>
              It's using what you own <Text style={styles.italic}>better.</Text>
            </Text>
          </View>
        </View>
      </View>

      {/* ─── TEAM ─── */}
      <View style={styles.team}>
        <View style={styles.teamCard}>
          <Text style={[styles.label, { color: colors.secondary }]}>
            THE TEAM
          </Text>
          <Text style={styles.teamHeading}>
            Meet the{'\n'}
            <Text style={[styles.italic, { color: '#fff' }]}>Founders.</Text>
          </Text>

          {/* Hima */}
          <View style={styles.founderEntry}>
            <View style={styles.founderIcon}>
              <Lightbulb size={18} color={DARK_SAGE} />
            </View>
            <Text style={styles.founderName}>Hima Erukulla</Text>
            <Text style={styles.founderRole}>Strategy & Product</Text>
            <Text style={styles.founderBio}>
              12+ years at Intel, MBA from UC Berkeley. Shapes the long-term
              vision and builds the systems that support it. Most inspired by
              where technology meets everyday life.
            </Text>
          </View>

          <View style={styles.founderDivider} />

          {/* Alekhya */}
          <View style={styles.founderEntry}>
            <View style={styles.founderIcon}>
              <Heart size={18} color={DARK_SAGE} />
            </View>
            <Text style={styles.founderName}>Alekhya Adamala</Text>
            <Text style={styles.founderRole}>Operations & Marketing</Text>
            <Text style={styles.founderBio}>
              12 years at Intel, Executive MBA from ISB. Designs smooth
              end-to-end experiences. Believes great brands are built behind the
              scenes — in logistics, quality, and consistency.
            </Text>
          </View>
        </View>

        {/* Decorative accents */}
        <View style={styles.teamAccentDot1} />
        <View style={styles.teamAccentDot2} />
      </View>

      {/* ─── CONTACT ─── */}
      <View style={styles.contact}>
        <Text style={styles.label}>CONTACT US</Text>
        <Text style={styles.sectionTitle}>
          We'd love to{'\n'}hear from{' '}
          <Text style={styles.italic}>you.</Text>
        </Text>

        <Pressable
          style={styles.contactRow}
          onPress={() => Linking.openURL('mailto:hello@ateliya.com')}
        >
          <View style={styles.contactIcon}>
            <Mail size={18} color={DARK_SAGE} />
          </View>
          <View>
            <Text style={styles.contactLabel}>Email</Text>
            <Text style={styles.contactValue}>hello@ateliya.com</Text>
          </View>
        </Pressable>

        <Pressable
          style={styles.contactRow}
          onPress={() => Linking.openURL('https://wa.me/919876543210')}
        >
          <View style={styles.contactIcon}>
            <MessageCircle size={18} color={DARK_SAGE} />
          </View>
          <View>
            <Text style={styles.contactLabel}>WhatsApp</Text>
            <Text style={styles.contactValue}>+91 98765 43210</Text>
          </View>
        </Pressable>
      </View>

      {/* ─── CTA ─── */}
      <View style={styles.cta}>
        <Text style={styles.ctaTitle}>
          Ready to use your{'\n'}wardrobe{' '}
          <Text style={styles.italic}>better?</Text>
        </Text>

        <Pressable
          style={({ pressed }) => [
            styles.pillBtn,
            { backgroundColor: '#fff' },
            pressed && styles.pressed,
          ]}
          onPress={go}
        >
          <Text style={[styles.pillBtnText, { color: DARK_SAGE }]}>
            GET STARTED
          </Text>
        </Pressable>

        <Text style={styles.signIn}>
          Already have an account?{' '}
          <Text style={styles.signInLink} onPress={go}>
            Sign In
          </Text>
        </Text>
      </View>

      {/* ─── FOOTER ─── */}
      <View style={styles.footer}>
        <Text style={styles.footerBrand}>Ateliya</Text>

        <View style={styles.socialRow}>
          {SOCIALS.map((s) => (
            <Pressable
              key={s.url}
              style={({ pressed }) => [
                styles.socialIcon,
                pressed && { opacity: 0.6 },
              ]}
              onPress={() => Linking.openURL(s.url)}
            >
              <s.icon size={20} color="rgba(255,255,255,0.7)" />
            </Pressable>
          ))}
        </View>

        <Text style={styles.footerCopy}>
          &copy; 2025 Ateliya by Arteshia. All rights reserved.
        </Text>
      </View>
    </ScrollView>
  );
}

/* ─── Data ─── */
const KIOSK_SERVICES = [
  {
    icon: Scissors,
    title: 'Alterations',
    desc: 'Precise fixes for better fit — hemlines, blouses, zippers & more.',
  },
  {
    icon: RefreshCw,
    title: 'Repurposing',
    desc: 'Transform existing pieces into updated silhouettes or new forms.',
  },
  {
    icon: ShoppingBag,
    title: 'Rental',
    desc: 'Curated, high-quality sarees for short-term use.',
  },
];

const ALMIRA_SERVICES = [
  {
    icon: Sparkles,
    title: 'Style Edits',
    desc: 'Curated monthly outfit ideas built around your real life.',
    badge: null,
  },
  {
    icon: Shirt,
    title: 'Digital Wardrobe',
    desc: 'Your closet organized, digitized, and personal.',
    badge: 'Coming Soon',
  },
];

const SOCIALS = [
  { icon: Youtube, url: 'https://youtube.com/@ateliya' },
  { icon: Instagram, url: 'https://instagram.com/ateliya.in' },
  { icon: Linkedin, url: 'https://linkedin.com/company/ateliya' },
  { icon: MessageCircle, url: 'https://wa.me/919876543210' },
];

/* ─── Styles ─── */
const styles = StyleSheet.create({
  scroll: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollContent: {
    paddingBottom: 0,
  },

  /* ── Shared ── */
  label: {
    fontSize: 11,
    fontWeight: '600',
    letterSpacing: 2.5,
    color: colors.primary,
    marginBottom: spacing.md,
  },
  italic: {
    fontStyle: 'italic',
  },
  pressed: {
    opacity: 0.85,
    transform: [{ scale: 0.97 }],
  },
  pillBtn: {
    backgroundColor: colors.primary,
    paddingVertical: 14,
    paddingHorizontal: 36,
    borderRadius: radii.full,
  },
  pillBtnText: {
    color: '#fff',
    fontSize: 13,
    fontWeight: '700',
    letterSpacing: 1.5,
  },
  outlineBtn: {
    paddingVertical: 12,
    paddingHorizontal: 28,
    borderRadius: radii.full,
    borderWidth: 1.5,
    borderColor: colors.foreground,
  },
  outlineBtnText: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 1.8,
    color: colors.foreground,
  },
  sectionTitle: {
    fontSize: 26,
    fontWeight: '700',
    color: colors.foreground,
    textAlign: 'center',
    lineHeight: 34,
    marginBottom: spacing.xxl + 4,
  },

  /* ── Hero ── */
  hero: {
    backgroundColor: colors.background,
    paddingTop: 56,
    paddingHorizontal: spacing.xxl,
    paddingBottom: 40,
    alignItems: 'center',
    overflow: 'hidden',
  },
  heroDecor: {
    position: 'absolute',
    top: 30,
    right: -30,
    width: 260,
    height: 240,
    borderRadius: 48,
    backgroundColor: colors.surfaceMuted,
    transform: [{ rotate: '-8deg' }],
  },
  heroImageWrap: {
    width: '100%',
    height: 200,
    borderRadius: radii.xxl,
    overflow: 'hidden',
    marginBottom: spacing.xxl,
  },
  heroImage: {
    width: '100%',
    height: '100%',
  },
  brandName: {
    fontSize: 32,
    fontWeight: '300',
    letterSpacing: 6,
    color: colors.foreground,
    marginBottom: spacing.sm,
  },
  dividerDot: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.xl,
    gap: spacing.sm,
  },
  dividerLine: {
    width: 40,
    height: 1,
    backgroundColor: colors.primary,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.primary,
  },
  heroTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: colors.foreground,
    textAlign: 'center',
    lineHeight: 38,
    marginBottom: spacing.md,
  },
  heroDesc: {
    ...typography.body,
    color: colors.mutedForeground,
    textAlign: 'center',
    lineHeight: 23,
    marginBottom: spacing.xxl,
    paddingHorizontal: spacing.sm,
  },

  /* ── Curve ── */
  curveTransition: {
    height: 40,
    backgroundColor: '#ffffff',
    borderTopLeftRadius: 40,
    borderTopRightRadius: 40,
    marginTop: -20,
  },

  /* ── Services ── */
  services: {
    backgroundColor: '#ffffff',
    paddingHorizontal: spacing.xxl,
    paddingTop: spacing.lg,
    paddingBottom: 40,
    alignItems: 'center',
  },
  serviceGroup: {
    width: '100%',
    marginBottom: spacing.xxl,
  },
  subHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.md,
    marginBottom: spacing.sm,
  },
  subHeaderLine: {
    width: 28,
    height: 1,
    backgroundColor: colors.accent,
  },
  subHeader: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.foreground,
    letterSpacing: 1,
  },
  subHeaderDesc: {
    ...typography.bodySmall,
    color: colors.mutedForeground,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: spacing.xl,
  },
  cardGrid3: {
    flexDirection: 'row',
    gap: spacing.sm,
    width: '100%',
  },
  cardGrid2: {
    flexDirection: 'row',
    gap: spacing.md,
    width: '100%',
  },
  serviceCard: {
    flex: 1,
    backgroundColor: colors.surfaceSubtle,
    borderRadius: radii.lg,
    padding: spacing.lg,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
  },
  cardIconWrap: {
    marginBottom: spacing.md,
    overflow: 'visible',
    zIndex: 1,
  },
  cardIconBadge: {
    width: 36,
    height: 36,
    borderRadius: radii.sm + 2,
    backgroundColor: colors.surfaceMuted,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.foreground,
    textAlign: 'center',
    marginBottom: spacing.xs,
  },
  cardDesc: {
    fontSize: 11,
    color: colors.mutedForeground,
    textAlign: 'center',
    lineHeight: 16,
  },
  comingSoonBadge: {
    position: 'absolute',
    top: -8,
    alignSelf: 'center',
    backgroundColor: colors.muted,
    paddingVertical: 3,
    paddingHorizontal: 7,
    borderRadius: radii.full,
  },
  comingSoonText: {
    fontSize: 8,
    fontWeight: '700',
    color: colors.mutedForeground,
    letterSpacing: 0.3,
  },

  /* ── Our Story ── */
  story: {
    backgroundColor: colors.background,
    paddingHorizontal: spacing.xxl,
    paddingTop: 40,
    paddingBottom: 40,
    alignItems: 'center',
  },
  storyText: {
    ...typography.body,
    color: colors.mutedForeground,
    textAlign: 'center',
    lineHeight: 23,
    marginBottom: spacing.lg,
    paddingHorizontal: spacing.xs,
  },
  quoteBlock: {
    flexDirection: 'row',
    marginTop: spacing.lg,
    paddingHorizontal: spacing.sm,
  },
  quoteLine: {
    width: 3,
    backgroundColor: colors.primary,
    borderRadius: 2,
    marginRight: spacing.lg,
  },
  quoteContent: {
    flex: 1,
  },
  quoteText: {
    fontSize: 17,
    fontWeight: '600',
    color: colors.foreground,
    lineHeight: 26,
  },

  /* ── Team ── */
  team: {
    backgroundColor: colors.background,
    paddingHorizontal: spacing.xxl,
    paddingTop: spacing.lg,
    paddingBottom: 40,
    alignItems: 'center',
  },
  teamCard: {
    backgroundColor: DARK_SAGE,
    borderRadius: 28,
    paddingTop: spacing.xxl + 4,
    paddingBottom: spacing.xxl,
    paddingHorizontal: spacing.xxl,
    width: '100%',
    alignItems: 'center',
  },
  teamHeading: {
    fontSize: 26,
    fontWeight: '700',
    color: '#ffffff',
    textAlign: 'center',
    lineHeight: 34,
    marginBottom: spacing.xxl,
  },
  founderEntry: {
    alignItems: 'center',
    width: '100%',
  },
  founderIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.surfaceMuted,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.md,
  },
  founderName: {
    fontSize: 17,
    fontWeight: '700',
    color: '#ffffff',
    marginBottom: spacing.xs,
  },
  founderRole: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.secondary,
    letterSpacing: 1,
    marginBottom: spacing.md,
  },
  founderBio: {
    ...typography.bodySmall,
    color: 'rgba(255,255,255,0.75)',
    textAlign: 'center',
    lineHeight: 21,
  },
  founderDivider: {
    width: 40,
    height: 1,
    backgroundColor: 'rgba(255,255,255,0.2)',
    marginVertical: spacing.xxl,
  },
  teamAccentDot1: {
    position: 'absolute',
    top: 28,
    left: 32,
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: colors.accent,
    opacity: 0.5,
  },
  teamAccentDot2: {
    position: 'absolute',
    top: 56,
    right: 40,
    width: 7,
    height: 7,
    borderRadius: 3.5,
    backgroundColor: colors.secondary,
    opacity: 0.4,
  },

  /* ── Contact ── */
  contact: {
    backgroundColor: '#ffffff',
    paddingHorizontal: spacing.xxl,
    paddingTop: 40,
    paddingBottom: 40,
    alignItems: 'center',
    borderTopLeftRadius: 40,
    borderTopRightRadius: 40,
  },
  contactRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surfaceSubtle,
    borderRadius: radii.lg,
    padding: spacing.lg,
    width: '100%',
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  contactIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.surfaceMuted,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.lg,
  },
  contactLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.mutedForeground,
    letterSpacing: 0.5,
    marginBottom: 2,
  },
  contactValue: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.foreground,
  },

  /* ── CTA ── */
  cta: {
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.xxl,
    paddingTop: 40,
    paddingBottom: 48,
    alignItems: 'center',
  },
  ctaTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#ffffff',
    textAlign: 'center',
    lineHeight: 33,
    marginBottom: spacing.xxl,
  },
  signIn: {
    ...typography.bodySmall,
    color: 'rgba(255,255,255,0.8)',
    marginTop: spacing.lg,
  },
  signInLink: {
    color: '#ffffff',
    fontWeight: '600',
    textDecorationLine: 'underline' as const,
  },

  /* ── Footer ── */
  footer: {
    backgroundColor: colors.foreground,
    paddingHorizontal: spacing.xxl,
    paddingTop: spacing.xxl + 4,
    paddingBottom: spacing.xxxl,
    alignItems: 'center',
  },
  footerBrand: {
    fontSize: 24,
    fontWeight: '300',
    letterSpacing: 4,
    color: '#ffffff',
    marginBottom: spacing.lg,
  },
  socialRow: {
    flexDirection: 'row',
    gap: spacing.xxl,
    marginBottom: spacing.xl,
  },
  socialIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  footerCopy: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.45)',
  },
});
